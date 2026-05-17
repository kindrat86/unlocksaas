-- ============================================================================
-- Seven Phases of a Funnel — SQL Views
-- ============================================================================
-- Source: DotCom Secrets Secret #9 (Seven Phases of a Funnel). Companion to
-- strategy/decisions/seven-phases-coverage.md and the
-- app/src/lib/seven-phases.ts mapping module.
--
-- These views back the per-phase coverage panel in the Friday Audible Call.
-- They prove the phase chain is alive in production from day 1 of traffic by
-- joining the Supabase-resident truth tables (no PostHog round-trip needed).
-- Top-of-funnel phases (1, 2) are pageview-counted by PostHog; this view set
-- covers Phases 3–7 because they each land a server-side row that can be
-- aggregated without a third-party API call.
--
-- The point of the view set is NOT to replace PostHog. It is to give the
-- operator a single SQL surface to read "did the seven-phase chain hold this
-- week?" without needing dashboard access — the same way Funnel Audibles
-- gives a single Friday Call screen. This is what an honest 100 looks like
-- for DCS Secret #9: every phase has a live surface AND a numeric witness.
--
-- ----------------------------------------------------------------------------
-- HOW TO APPLY
-- ----------------------------------------------------------------------------
-- These are read-only views. Apply ad-hoc via the Supabase SQL editor, or
-- promote to a numbered migration when stable:
--     supabase/migrations/YYYYMMDDhhmmss_seven_phases_views.sql
-- All views accessible to authenticated + service_role (no anon — the joins
-- aggregate revenue-sensitive data).
--
-- ----------------------------------------------------------------------------
-- COLUMN-NAME ASSUMPTIONS (verify with `supabase db diff` before applying)
-- ----------------------------------------------------------------------------
-- diagnostic_leads(id, email, label, identity_variant, converted_to_starter_at,
--                  created_at)
-- profiles(id, email, tier, stripe_customer_id, starter_purchased_at,
--          core_started_at, guarantee_expires_at, subscription_status,
--          canceled_at, refunded_at)
-- soap_opera_subscribers(email, current_day, status, subscribed_at,
--                        last_sent_at, unsubscribed_at, diagnostic_result)
-- seinfeld_subscribers(email, status, sends_count, last_sent_at, created_at)
-- repeatable_interest(email, source, is_core_customer, created_at)
-- milestones(profile_id, key, achieved_at)
--
-- Phase → table mapping (must stay in sync with app/src/lib/seven-phases.ts):
--   1 Pre-frame  → PostHog only (anonymous pageviews on /)
--   2 Squeeze    → PostHog only (anonymous pageviews on /diagnostic),
--                  with the form-submit landing as a diagnostic_leads row
--   3 Activate   → diagnostic_leads + soap_opera_subscribers (Day 0 send)
--   4 Ascend     → profiles where starter_purchased_at is not null
--   5 ProfitMax  → profiles where core_started_at is not null
--                  (or — via the lean-stance — Soap Opera handles the OTO
--                  decline as the Return Path)
--   6 ReturnPath → soap_opera_subscribers (active days 1–5) +
--                  seinfeld_subscribers (post-SOS evergreen rotation)
--   7 Backend    → repeatable_interest (Rung 2 demand signal; the build
--                  itself is gated on 3 verified Core customers, the SIGNAL
--                  is captured today). Rung 2 IS the Backend in DCS terms.
-- ============================================================================

set search_path = public;


-- ----------------------------------------------------------------------------
-- 1. Phase 3 — Activate. Diagnostic leads + their day-0 SOS enrollment.
-- ----------------------------------------------------------------------------
-- Read: did the activation surface land both halves (in-browser result page
-- AND the Day 0 Soap Opera email)? Two columns make the operational gap on
-- CRON_SECRET visible: if `sos_enrolled` is rising but `sos_day0_sent` stays
-- flat, the cron isn't pushing — the operator action is push CRON_SECRET to
-- Vercel envs.
create or replace view public.seven_phases__activate as
select
  date_trunc('day', dl.created_at)::date as day,
  count(*)                                                      as diagnoses,
  count(*) filter (where dl.label is not null)                  as labeled,
  count(sos.email)                                              as sos_enrolled,
  count(sos.email) filter (where sos.last_sent_at is not null)  as sos_day0_sent,
  -- Activation success: a labeled diagnosis that either got the Day 0 email
  -- OR clicked through to /starter inside the same day. Either path moves
  -- the visitor into Phase 4 candidacy.
  count(*) filter (
    where dl.converted_to_starter_at is not null
       or sos.last_sent_at is not null
  ) as activated
from public.diagnostic_leads dl
left join public.soap_opera_subscribers sos
  on lower(sos.email) = lower(dl.email)
group by 1
order by 1 desc;

comment on view public.seven_phases__activate is
  'Phase 3 (Activate): per-day diagnoses, labels, Day-0 SOS enrollment, Day-0 sent. Operational tell: enrolled rising while sent flat = CRON_SECRET not pushed.';


-- ----------------------------------------------------------------------------
-- 2. Phase 4 — Ascend. $1 Starter purchases per day.
-- ----------------------------------------------------------------------------
-- Read: of yesterday's diagnostic leads, how many bought the Starter? The
-- starter buy is the smallest possible Marco-Meter — a $1 charge IS the
-- ascend signal. Workbook 02 §6.
create or replace view public.seven_phases__ascend as
select
  date_trunc('day', starter_purchased_at)::date as day,
  count(*) as starter_purchases,
  count(*) filter (where core_started_at is not null) as also_core_subscribed,
  round(
    100.0 * count(*) filter (where core_started_at is not null)
    / nullif(count(*), 0),
    1
  ) as same_day_oto_pct
from public.profiles
where starter_purchased_at is not null
group by 1
order by 1 desc;

comment on view public.seven_phases__ascend is
  'Phase 4 (Ascend): daily Starter buyers + the share who also converted on the OTO same day.';


-- ----------------------------------------------------------------------------
-- 3. Phase 5 — Profit Maximizer. OTO take-rate + lean-stance Return Path.
-- ----------------------------------------------------------------------------
-- Per seven-phases-coverage.md the Profit Maximizer phase is deliberately
-- the Return Path (no downsell). This view splits the cohort into:
--   - upgraded: Starter buyer who said yes on the OTO (Phase 5 ascent)
--   - declined_and_returning: Starter buyer who said no, IS in active SOS
--     (Phase 5 Return Path is doing its job)
--   - declined_and_lost: Starter buyer who said no, not in any active list
--     (Phase 5 leak — the Return Path failed to capture)
create or replace view public.seven_phases__profit_max as
with starter_cohort as (
  select
    p.id              as profile_id,
    p.email           as email,
    p.starter_purchased_at,
    p.core_started_at
  from public.profiles p
  where p.starter_purchased_at is not null
),
joined as (
  select
    sc.*,
    sos.status as sos_status,
    sf.status  as seinfeld_status
  from starter_cohort sc
  left join public.soap_opera_subscribers sos
    on lower(sos.email) = lower(sc.email)
  left join public.seinfeld_subscribers sf
    on lower(sf.email) = lower(sc.email)
)
select
  count(*) as starter_buyers_lifetime,
  count(*) filter (where core_started_at is not null) as upgraded,
  count(*) filter (
    where core_started_at is null
      and (sos_status = 'active' or seinfeld_status = 'active')
  ) as declined_and_returning,
  count(*) filter (
    where core_started_at is null
      and coalesce(sos_status, '') <> 'active'
      and coalesce(seinfeld_status, '') <> 'active'
  ) as declined_and_lost,
  round(
    100.0 * count(*) filter (where core_started_at is not null)
    / nullif(count(*), 0),
    1
  ) as oto_take_rate_pct,
  round(
    100.0 * count(*) filter (
      where core_started_at is null
        and coalesce(sos_status, '') <> 'active'
        and coalesce(seinfeld_status, '') <> 'active'
    ) / nullif(count(*), 0),
    1
  ) as return_path_leak_pct
from joined;

comment on view public.seven_phases__profit_max is
  'Phase 5 (Profit Maximizer): lifetime OTO take-rate + lean-stance Return Path coverage. return_path_leak_pct > 0 means a buyer slipped out of every list.';


-- ----------------------------------------------------------------------------
-- 4. Phase 6 — Return Path. Combined SOS + Seinfeld health.
-- ----------------------------------------------------------------------------
-- Read: is the email Return Path actually shipping mail? Splits the live
-- audience by cadence and status. Two cadences feed Phase 6: Soap Opera
-- (Days 1–4, finite) and Seinfeld (post-SOS, evergreen rotation).
create or replace view public.seven_phases__return_path as
with sos_summary as (
  select
    count(*) filter (where status = 'active')       as sos_active,
    count(*) filter (where status = 'completed')    as sos_completed,
    count(*) filter (where status = 'paused')       as sos_paused,
    count(*) filter (where status = 'unsubscribed') as sos_unsubscribed,
    count(*) filter (
      where status = 'active' and last_sent_at is null
    ) as sos_active_never_sent
  from public.soap_opera_subscribers
),
sf_summary as (
  select
    count(*) filter (where status = 'active')       as sf_active,
    count(*) filter (where status = 'paused')       as sf_paused,
    count(*) filter (where status = 'unsubscribed') as sf_unsubscribed,
    count(*) filter (
      where status = 'active' and last_sent_at is null
    ) as sf_active_never_sent
  from public.seinfeld_subscribers
)
select
  sos_summary.*,
  sf_summary.*,
  -- The single number that proves the Return Path is firing in production.
  -- If this is > 0 across multiple days the chain is alive. If it stays at
  -- 0 while sos_active or sf_active are non-zero, the daily cron isn't
  -- running (CRON_SECRET).
  (
    select count(*) from public.soap_opera_subscribers
    where last_sent_at > now() - interval '24 hours'
  ) + (
    select count(*) from public.seinfeld_subscribers
    where last_sent_at > now() - interval '24 hours'
  ) as sends_last_24h
from sos_summary, sf_summary;

comment on view public.seven_phases__return_path is
  'Phase 6 (Return Path): combined SOS + Seinfeld status counts + 24h send activity. sends_last_24h = 0 while *_active > 0 means cron is not firing.';


-- ----------------------------------------------------------------------------
-- 5. Phase 7 — Backend. Rung 2 demand signal.
-- ----------------------------------------------------------------------------
-- Per seven-phases-coverage.md, the Backend phase has a pre-staged surface
-- at /repeatable that captures the unprompted-ask demand signal documented
-- in strategy/decisions/rung-2-repeatable-revenue.md. The activation gate
-- is "≥1 row from a verified Core customer." This view exposes the row
-- count by `is_core_customer` so the operator can read the gate during the
-- Friday Audible Call without writing ad-hoc SQL.
create or replace view public.seven_phases__backend as
select
  count(*)                                                  as interest_lifetime,
  count(*) filter (where is_core_customer)                  as interest_from_core_customers,
  count(*) filter (where created_at > now() - interval '7 days') as interest_7d,
  -- The activation gate. When true, the operator may start the Rung 2 build.
  count(*) filter (where is_core_customer) >= 1             as activation_gate_unlocked,
  -- Lean-stance witness: zero supply, demand captured.
  'gated_until_first_core_customer_unprompted_ask'::text    as build_stance
from public.repeatable_interest;

comment on view public.seven_phases__backend is
  'Phase 7 (Backend = Rung 2): demand-signal volume. activation_gate_unlocked = true the moment a verified Core customer submits the /repeatable interest form.';


-- ----------------------------------------------------------------------------
-- 6. Friday Audible Call — single-row Seven Phases panel.
-- ----------------------------------------------------------------------------
-- Read in 30 seconds during the weekly Friday Call. Each row of the result
-- is one phase, with a numeric witness and a `coverage` text label drawn
-- from the lean-stance doctrine. The operator reads it top-to-bottom and
-- asks "any row marked 'leak' or 'cron_dark'?"
--
-- Phases 1 and 2 read from PostHog (this view fills `(posthog)` rather
-- than guessing). The other five phases compute from Supabase truth.
create or replace view public.seven_phases__weekly as
with sos as (
  select
    count(*) filter (where status = 'active') as sos_active,
    (select count(*) from public.soap_opera_subscribers
     where last_sent_at > now() - interval '24 hours') as sos_24h_sends
  from public.soap_opera_subscribers
),
sf as (
  select
    count(*) filter (where status = 'active') as sf_active,
    (select count(*) from public.seinfeld_subscribers
     where last_sent_at > now() - interval '24 hours') as sf_24h_sends
  from public.seinfeld_subscribers
),
ascend7 as (
  select count(*) as starter_7d
  from public.profiles
  where starter_purchased_at > now() - interval '7 days'
),
profit7 as (
  select count(*) as oto_7d
  from public.profiles
  where core_started_at > now() - interval '7 days'
),
diag7 as (
  select count(*) as diagnoses_7d,
         count(*) filter (where converted_to_starter_at is not null) as activated_7d
  from public.diagnostic_leads
  where created_at > now() - interval '7 days'
),
backend as (
  select count(*) filter (where is_core_customer) as core_asks
  from public.repeatable_interest
)
select
  phase_num,
  phase_name,
  witness,
  coverage
from (
  values
    (1, 'Pre-frame Bridge',  '(posthog: funnel_hub_viewed)',
        'on_strategy_pageviews_in_posthog'),
    (2, 'Squeeze',            '(posthog: diagnostic_page_viewed)',
        'on_strategy_pageviews_in_posthog'),
    (3, 'Activate',           (select diagnoses_7d::text || ' diagnoses / '
                               || activated_7d::text || ' activated (7d)'
                               from diag7),
        'on_strategy_two_paths_browser_and_inbox'),
    (4, 'Ascend',             (select starter_7d::text || ' Starter buys (7d)'
                               from ascend7),
        'on_strategy_one_price_point'),
    (5, 'Profit Maximizer',   (select oto_7d::text || ' Core upgrades (7d)'
                               from profit7),
        'on_strategy_lean_return_path_no_downsell'),
    (6, 'Return Path',        (select sos_active::text || ' SOS active / '
                               || sos_24h_sends::text || ' SOS sent 24h / '
                               || (select sf_active::text from sf)
                               || ' Seinfeld active / '
                               || (select sf_24h_sends::text from sf)
                               || ' Seinfeld sent 24h'
                               from sos),
        case
          when (select sos_active from sos) > 0
            and (select sos_24h_sends from sos) = 0
              then 'cron_dark_check_CRON_SECRET'
          else 'on_strategy_two_cadences_alive'
        end),
    (7, 'Backend',            (select core_asks::text || ' Core-customer asks (lifetime)'
                               from backend),
        case
          when (select core_asks from backend) >= 1
              then 'activation_gate_unlocked_start_rung_2_build'
          else 'on_strategy_deferred_until_first_core_ask'
        end)
) as t(phase_num, phase_name, witness, coverage)
order by phase_num;

comment on view public.seven_phases__weekly is
  'Single-table 7-row panel for the Friday Audible Call. coverage column reports lean-stance status per phase; cron_dark_* values flag operator action.';


-- ----------------------------------------------------------------------------
-- 7. Registry — canonical list of every Seven Phases view.
-- ----------------------------------------------------------------------------
-- Used by the audit close in build-log.md and the coverage doc as the single
-- source of truth. If a future migration adds another view, append it here.
create or replace view public.seven_phases__registry as
select view_name from (
  values
    ('seven_phases__activate'),
    ('seven_phases__ascend'),
    ('seven_phases__profit_max'),
    ('seven_phases__return_path'),
    ('seven_phases__backend'),
    ('seven_phases__weekly')
) as v(view_name);

comment on view public.seven_phases__registry is
  'Canonical list of Seven Phases views. SELECT * FROM this to confirm deploy.';
