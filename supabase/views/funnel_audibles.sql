-- ============================================================================
-- Funnel Audibles SQL Views
-- ============================================================================
-- Source: DotCom Secrets Secret #28 (Funnel Audibles) operationalized for
-- UnlockSaaS. Companion to strategy/funnel-audibles.md.
--
-- These views back the Friday Audible Call dashboard. They cover the
-- mid-funnel and conversion-funnel (Supabase-resident truth). Top-of-funnel
-- pageviews and CTA clicks live in PostHog — see Part 6 of the playbook for
-- the PostHog Insights to build alongside these views.
--
-- ----------------------------------------------------------------------------
-- HOW TO APPLY
-- ----------------------------------------------------------------------------
-- These are read-only views. Apply ad-hoc via the Supabase SQL editor, or
-- promote to a numbered migration when stable:
--     supabase/migrations/YYYYMMDDhhmmss_funnel_audibles_views.sql
-- All views are owned by postgres and accessible to authenticated +
-- service_role (no anon access — every view aggregates revenue-sensitive
-- data).
--
-- ----------------------------------------------------------------------------
-- COLUMN-NAME ASSUMPTIONS (verify with `supabase db diff` before applying)
-- ----------------------------------------------------------------------------
-- diagnostic_leads(id, email, label, identity_variant, converted_to_starter_at,
--                  created_at)
-- profiles(id, email, tier, stripe_customer_id, starter_purchased_at,
--          core_started_at, guarantee_expires_at, subscription_status,
--          canceled_at, refunded_at)
-- billing_payments(id, profile_id, amount_cents, paid_at, invoice_number,
--                  stripe_charge_id) -- best-effort; verify column shape.
-- milestones(profile_id, key, achieved_at)
-- outreach_actions(project_id, sent_at, verified_live, verified_at, converted)
-- verified_conversions(project_id, detected_at, amount_cents)
-- soap_opera_subscribers(email, current_day, status, subscribed_at,
--                        last_sent_at, unsubscribed_at, diagnostic_result)
-- ab_tests(key, variant, subject_id, conversion_event, recorded_at)
-- projects(id, user_id, created_at)   -- maps user → project
--
-- If a column does not exist in your local schema, comment out the affected
-- view rather than ALTERing the schema to fit the view.
-- ============================================================================

set search_path = public;

-- ----------------------------------------------------------------------------
-- 1. Diagnostic conversion — per-day, per-label diagnoses and Starter buys.
-- ----------------------------------------------------------------------------
-- Trigger Matrix row 5: result → starter click. Window: 100 diagnoses.
-- Read: which label converts best? Where is the leak?
create or replace view public.funnel_audibles__diagnostic_conversion as
select
  date_trunc('day', created_at)::date as day,
  label,
  identity_variant,
  count(*)                                                  as diagnoses,
  count(*) filter (where converted_to_starter_at is not null) as starter_buys,
  round(
    100.0 * count(*) filter (where converted_to_starter_at is not null)
    / nullif(count(*), 0),
    1
  ) as starter_conv_pct
from public.diagnostic_leads
group by 1, 2, 3
order by 1 desc, 2, 3;

comment on view public.funnel_audibles__diagnostic_conversion is
  'Daily per-label diagnostic counts and conversion to $1 Starter. Trigger Matrix row 5.';


-- ----------------------------------------------------------------------------
-- 2. Starter → Core (OTO take-rate, lifetime cohort).
-- ----------------------------------------------------------------------------
-- Trigger Matrix row 8: OTO take-rate. Window: 30 OTOs.
-- Read: of everyone who bought Starter, what % upgraded to Core?
create or replace view public.funnel_audibles__starter_to_core as
select
  date_trunc('week', starter_purchased_at)::date as starter_cohort_week,
  count(*) filter (where starter_purchased_at is not null)        as starter_buyers,
  count(*) filter (where core_started_at is not null)             as core_subs,
  round(
    100.0 * count(*) filter (where core_started_at is not null)
    / nullif(count(*) filter (where starter_purchased_at is not null), 0),
    1
  ) as oto_take_rate_pct
from public.profiles
where starter_purchased_at is not null
group by 1
order by 1 desc;

comment on view public.funnel_audibles__starter_to_core is
  'Weekly cohort: Starter buyers and OTO upgrade rate to Core. Trigger Matrix row 8.';


-- ----------------------------------------------------------------------------
-- 3. Machine step completion (depth funnel).
-- ----------------------------------------------------------------------------
-- Trigger Matrix row 13: full Machine completion. Window: 10 Core-subs aged 30+.
-- Read: where in the 7-step Machine do paying users drop off?
-- The milestones table uses canonical keys per app/src/lib/guarantee.ts:
--   dream_customer_pinned, offer_locked, ac_defined, copy_generated,
--   outreach_assets_generated, outreach_twenty, first_customer_verified
create or replace view public.funnel_audibles__machine_progression as
with core_subs as (
  select id as profile_id, core_started_at
  from public.profiles
  where core_started_at is not null
),
keyed as (
  select
    cs.profile_id,
    m.key,
    m.achieved_at,
    cs.core_started_at
  from core_subs cs
  left join public.milestones m on m.profile_id = cs.profile_id
)
select
  key as milestone,
  count(distinct profile_id) filter (where achieved_at is not null) as achieved_count,
  (select count(*) from core_subs)                                  as total_core_subs,
  round(
    100.0 * count(distinct profile_id) filter (where achieved_at is not null)
    / nullif((select count(*) from core_subs), 0),
    1
  ) as pct_of_core
from keyed
where key is not null
group by 1
order by
  case key
    when 'dream_customer_pinned'      then 1
    when 'offer_locked'               then 2
    when 'ac_defined'                 then 3
    when 'copy_generated'             then 4
    when 'outreach_assets_generated'  then 5
    when 'outreach_twenty'            then 6
    when 'first_customer_verified'    then 7
    else 99
  end;

comment on view public.funnel_audibles__machine_progression is
  'Milestone-by-milestone completion among Core subs. The 7-step depth funnel. Trigger Matrix row 13.';


-- ----------------------------------------------------------------------------
-- 4. Outreach velocity — days from Core start to 20-action milestone.
-- ----------------------------------------------------------------------------
-- Trigger Matrix row 14: 20-outreach completion. THE existential row.
-- Red-line: < 40% of Core subs hit 20 actions by day 14.
create or replace view public.funnel_audibles__outreach_velocity as
with core_subs as (
  select
    pr.id          as project_id,
    p.id           as profile_id,
    p.email,
    p.core_started_at,
    p.guarantee_expires_at
  from public.profiles p
  join public.projects pr on pr.user_id = p.user_id
  where p.core_started_at is not null
),
outreach_counts as (
  select
    project_id,
    count(*)                                            as actions_total,
    count(*) filter (where verified_live)               as actions_verified,
    min(sent_at) filter (where verified_live)           as first_verified_at,
    -- 20th verified send timestamp (per Hard Rule #4 work-condition)
    (
      select max(sent_at) from (
        select sent_at
        from public.outreach_actions oa2
        where oa2.project_id = public.outreach_actions.project_id
          and oa2.verified_live
        order by sent_at asc
        limit 20
      ) t20
    )                                                   as twentieth_verified_at
  from public.outreach_actions
  group by project_id
)
select
  cs.email,
  cs.core_started_at,
  cs.guarantee_expires_at,
  coalesce(oc.actions_total, 0)              as actions_total,
  coalesce(oc.actions_verified, 0)           as actions_verified,
  oc.first_verified_at,
  oc.twentieth_verified_at,
  case
    when oc.twentieth_verified_at is not null
      then extract(day from oc.twentieth_verified_at - cs.core_started_at)::int
    else null
  end                                        as days_to_twenty,
  case
    when oc.twentieth_verified_at is not null then 'hit_20'
    when coalesce(oc.actions_verified, 0) >= 10 then 'on_track'
    when coalesce(oc.actions_verified, 0) >= 3  then 'lagging'
    else 'avoiding'
  end                                        as cohort_state
from core_subs cs
left join outreach_counts oc on oc.project_id = cs.project_id
order by cs.core_started_at desc;

comment on view public.funnel_audibles__outreach_velocity is
  'Per Core-sub: outreach action counts, days to 20 verified actions, cohort state. Trigger Matrix row 14 — existential.';


-- ----------------------------------------------------------------------------
-- 5. Guarantee pressure — Core subs approaching day-60 without verification.
-- ----------------------------------------------------------------------------
-- Trigger Matrix row 16: verified > refund ratio. The founding promise.
-- Red-line: refunds > verified.
create or replace view public.funnel_audibles__guarantee_pressure as
with core_subs as (
  select id, email, core_started_at, guarantee_expires_at, refunded_at
  from public.profiles
  where core_started_at is not null
),
verified_by_profile as (
  select pr.user_id, vc.detected_at
  from public.verified_conversions vc
  join public.projects pr on pr.id = vc.project_id
)
select
  cs.email,
  cs.core_started_at,
  cs.guarantee_expires_at,
  (select detected_at
    from verified_by_profile vbp
    join public.profiles p on p.user_id = vbp.user_id
    where p.id = cs.id
    order by detected_at asc
    limit 1)                              as first_verified_at,
  cs.refunded_at,
  case
    when cs.refunded_at is not null                            then 'refunded'
    when exists (
      select 1 from verified_by_profile vbp
      join public.profiles p on p.user_id = vbp.user_id
      where p.id = cs.id
    )                                                          then 'verified'
    when cs.guarantee_expires_at is not null
      and cs.guarantee_expires_at < now()                      then 'overdue_evaluate'
    when cs.guarantee_expires_at is not null
      and cs.guarantee_expires_at < now() + interval '14 days' then 'approaching_d60'
    else 'in_window'
  end                                     as state,
  case
    when cs.guarantee_expires_at is not null
      then extract(day from cs.guarantee_expires_at - now())::int
    else null
  end                                     as days_remaining
from core_subs cs
order by cs.guarantee_expires_at asc nulls last;

comment on view public.funnel_audibles__guarantee_pressure is
  'Core subs grouped by guarantee state. Refund queue + verified count. Trigger Matrix row 16.';


-- ----------------------------------------------------------------------------
-- 6. Verified Builders A/B identity results.
-- ----------------------------------------------------------------------------
-- Hard Rule #10: read at ~200 exposures per variant.
-- Canonical query referenced in state.json
-- (expert_secrets.movement.identity_label.infrastructure.read_query).
create or replace view public.funnel_audibles__ab_identity_results as
select
  variant,
  count(distinct subject_id) filter (where conversion_event is null)              as exposed_subjects,
  count(distinct subject_id) filter (where conversion_event = 'opt_in')           as opt_ins,
  count(distinct subject_id) filter (where conversion_event = 'starter_purchase') as starter_buyers,
  count(distinct subject_id) filter (where conversion_event = 'core_purchase')    as core_buyers,
  round(
    100.0 * count(distinct subject_id) filter (where conversion_event = 'starter_purchase')
    / nullif(count(distinct subject_id) filter (where conversion_event is null), 0),
    2
  ) as starter_conv_pct,
  round(
    100.0 * count(distinct subject_id) filter (where conversion_event = 'core_purchase')
    / nullif(count(distinct subject_id) filter (where conversion_event is null), 0),
    2
  ) as core_conv_pct
from public.ab_tests
where key = 'identity_label'
group by variant
order by variant;

comment on view public.funnel_audibles__ab_identity_results is
  'Verified vs Paid Builders A/B. Hard Rule #10 — read at 200 exposures per variant.';


-- ----------------------------------------------------------------------------
-- 7. Soap Opera per-email funnel.
-- ----------------------------------------------------------------------------
-- Trigger Matrix row 17: Day 0 → Day 5 completion. Window: 30 SOS starters.
create or replace view public.funnel_audibles__soap_opera_funnel as
select
  current_day,
  count(*)                                            as subs_at_this_day,
  count(*) filter (where status = 'active')           as active,
  count(*) filter (where status = 'completed')        as completed,
  count(*) filter (where status = 'unsubscribed')     as unsubscribed,
  count(*) filter (where status = 'bounced')          as bounced,
  round(
    100.0 * count(*) filter (where status = 'unsubscribed')
    / nullif(count(*), 0),
    1
  ) as unsubscribe_pct
from public.soap_opera_subscribers
group by 1
order by 1;

comment on view public.funnel_audibles__soap_opera_funnel is
  'SOS subscribers by current_day with status mix and unsubscribe rate. Trigger Matrix row 17.';


-- ----------------------------------------------------------------------------
-- 8. Weekly top-of-funnel summary — the Friday Audible Call screen.
-- ----------------------------------------------------------------------------
-- Single row per week. The 14 most consequential metrics. Read in 60 seconds.
create or replace view public.funnel_audibles__weekly_top_of_funnel as
with last_7 as (
  select now() - interval '7 days' as cutoff
),
diag as (
  select
    count(*)                                                                  as diagnoses_7d,
    count(*) filter (where converted_to_starter_at is not null)               as diag_to_starter_7d,
    round(
      100.0 * count(*) filter (where converted_to_starter_at is not null)
      / nullif(count(*), 0),
      1
    ) as diag_to_starter_pct_7d
  from public.diagnostic_leads, last_7
  where created_at >= last_7.cutoff
),
starter as (
  select
    count(*) filter (where starter_purchased_at >= last_7.cutoff) as starter_buys_7d,
    count(*) filter (where core_started_at      >= last_7.cutoff) as core_subs_7d,
    count(*) filter (where refunded_at          >= last_7.cutoff) as refunds_7d
  from public.profiles, last_7
),
verified as (
  select count(*) filter (where detected_at >= last_7.cutoff) as verified_charges_7d
  from public.verified_conversions, last_7
),
outreach as (
  select count(*) filter (where sent_at >= last_7.cutoff)                     as outreach_sent_7d,
         count(*) filter (where sent_at >= last_7.cutoff and verified_live)   as outreach_verified_7d
  from public.outreach_actions, last_7
),
sos as (
  select
    count(*) filter (where subscribed_at  >= last_7.cutoff)                   as sos_new_7d,
    count(*) filter (where unsubscribed_at >= last_7.cutoff)                  as sos_unsubs_7d
  from public.soap_opera_subscribers, last_7
),
ab as (
  select
    count(distinct subject_id) filter (where conversion_event is null)        as ab_exposures,
    count(distinct subject_id) filter (where conversion_event in ('starter_purchase','core_purchase')) as ab_conversions
  from public.ab_tests
  where key = 'identity_label'
)
select
  -- the trigger-matrix columns in order
  diag.diagnoses_7d,
  diag.diag_to_starter_7d,
  diag.diag_to_starter_pct_7d,
  starter.starter_buys_7d,
  starter.core_subs_7d,
  starter.refunds_7d,
  verified.verified_charges_7d,
  outreach.outreach_sent_7d,
  outreach.outreach_verified_7d,
  sos.sos_new_7d,
  sos.sos_unsubs_7d,
  ab.ab_exposures,
  ab.ab_conversions,
  -- derived "verified > refund" ratio — the existential row 16
  case
    when starter.refunds_7d = 0 and verified.verified_charges_7d > 0 then 'all_verified'
    when starter.refunds_7d = 0                                      then 'no_refunds_no_verified'
    when verified.verified_charges_7d::numeric / starter.refunds_7d::numeric >= 2 then 'healthy'
    when verified.verified_charges_7d > starter.refunds_7d           then 'marginal'
    else 'INVERTED_EXISTENTIAL'
  end as guarantee_health
from diag, starter, verified, outreach, sos, ab;

comment on view public.funnel_audibles__weekly_top_of_funnel is
  'Single-row weekly summary. The Friday Audible Call dashboard. Read top-to-bottom against Trigger Matrix.';


-- ----------------------------------------------------------------------------
-- 9. Refund eligible queue — Hard Rule #4 enforcement.
-- ----------------------------------------------------------------------------
-- A Core sub becomes refund-eligible when:
--   - guarantee_expires_at <= now()
--   - AND has the work-condition milestones logged
--   - AND has no verified_conversion within the 60-day window
--   - AND is not already refunded
create or replace view public.funnel_audibles__refund_eligible as
with core_subs as (
  select
    p.id              as profile_id,
    p.email,
    p.user_id,
    p.core_started_at,
    p.guarantee_expires_at,
    p.refunded_at,
    pr.id             as project_id
  from public.profiles p
  join public.projects pr on pr.user_id = p.user_id
  where p.core_started_at is not null
    and p.guarantee_expires_at is not null
    and p.refunded_at is null
),
ms as (
  select profile_id,
    bool_or(key = 'dream_customer_pinned')      as ms_dream_customer_pinned,
    bool_or(key = 'offer_locked')               as ms_offer_locked,
    bool_or(key = 'ac_defined')                 as ms_ac_defined,
    bool_or(key = 'copy_generated')             as ms_copy_generated,
    bool_or(key = 'outreach_assets_generated')  as ms_outreach_assets_generated,
    bool_or(key = 'outreach_twenty')            as ms_outreach_twenty
  from public.milestones
  group by profile_id
),
verified as (
  select
    cs.profile_id,
    exists (
      select 1 from public.verified_conversions vc
      where vc.project_id = cs.project_id
        and vc.detected_at <= cs.guarantee_expires_at
    ) as has_verified_in_window
  from core_subs cs
)
select
  cs.email,
  cs.core_started_at,
  cs.guarantee_expires_at,
  coalesce(ms.ms_dream_customer_pinned, false)     as ms_dream_customer_pinned,
  coalesce(ms.ms_offer_locked, false)              as ms_offer_locked,
  coalesce(ms.ms_ac_defined, false)                as ms_ac_defined,
  coalesce(ms.ms_copy_generated, false)            as ms_copy_generated,
  coalesce(ms.ms_outreach_assets_generated, false) as ms_outreach_assets_generated,
  coalesce(ms.ms_outreach_twenty, false)           as ms_outreach_twenty,
  verified.has_verified_in_window,
  case
    when verified.has_verified_in_window                                       then 'verified_no_refund'
    when cs.guarantee_expires_at > now()                                       then 'in_window'
    when not coalesce(ms.ms_outreach_twenty, false)                            then 'no_refund_work_not_done'
    when not (
      coalesce(ms.ms_dream_customer_pinned, false)
      and coalesce(ms.ms_offer_locked, false)
      and coalesce(ms.ms_ac_defined, false)
      and coalesce(ms.ms_copy_generated, false)
      and coalesce(ms.ms_outreach_assets_generated, false)
      and coalesce(ms.ms_outreach_twenty, false)
    )                                                                          then 'no_refund_milestones_incomplete'
    else 'REFUND_ELIGIBLE'
  end as refund_state
from core_subs cs
left join ms on ms.profile_id = cs.profile_id
left join verified on verified.profile_id = cs.profile_id
order by cs.guarantee_expires_at asc;

comment on view public.funnel_audibles__refund_eligible is
  'Refund queue per Hard Rule #4. REFUND_ELIGIBLE rows must be paid out within 5 business days.';


-- ----------------------------------------------------------------------------
-- Access grants
-- ----------------------------------------------------------------------------
-- Service-role has all by default. Authenticated needs explicit grant for
-- views the founder will read directly from the SQL editor.
grant select on
  public.funnel_audibles__diagnostic_conversion,
  public.funnel_audibles__starter_to_core,
  public.funnel_audibles__machine_progression,
  public.funnel_audibles__outreach_velocity,
  public.funnel_audibles__guarantee_pressure,
  public.funnel_audibles__ab_identity_results,
  public.funnel_audibles__soap_opera_funnel,
  public.funnel_audibles__weekly_top_of_funnel,
  public.funnel_audibles__refund_eligible
to authenticated;
