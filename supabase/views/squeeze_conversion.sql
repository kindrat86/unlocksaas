-- ============================================================================
-- Squeeze Conversion SQL Views
-- ============================================================================
-- Source: DotCom Secrets Chapter 14 (Lead Squeeze) operationalised for
-- UnlockSaaS. Closes Brunson audit v3 DCS Chapter 14 from 90 to 100 by adding
-- per-source measurability across the three squeeze surfaces:
--
--   1. /diagnostic           Survey Funnel (DCS Secret 15) — 5-step
--                            micro-commitment. source values prefixed with
--                            'free_diagnostic'.
--
--   2. /parables             Reverse Squeeze (DCS Secret 14, reverse) —
--                            value-first long-form. source values
--                            'reverse_squeeze_parables_mid_content' and
--                            'reverse_squeeze_parables_end_content'.
--
--   3. /start                Canonical Lead Squeeze (DCS Secret 14,
--                            forward) — single-field, cold-traffic. source
--                            value 'fast_lane_squeeze'.
--
-- All three doors feed the same soap_opera_subscribers table, distinguished
-- by the free-form source column. These views give the Friday Audible Call
-- one place to read the answer to: "which door is converting per visitor?"
--
-- ----------------------------------------------------------------------------
-- HOW TO APPLY
-- ----------------------------------------------------------------------------
-- Apply ad-hoc via the Supabase SQL editor, or promote to a numbered
-- migration when stable:
--     supabase/migrations/YYYYMMDDhhmmss_squeeze_conversion_views.sql
-- All views are owned by postgres and accessible to authenticated +
-- service_role (no anon access — every view aggregates revenue-sensitive
-- attribution data).
--
-- ----------------------------------------------------------------------------
-- COLUMN-NAME ASSUMPTIONS (verify with `supabase db diff` before applying)
-- ----------------------------------------------------------------------------
-- soap_opera_subscribers(id, email, source, status, current_day,
--                        diagnostic_result, identity_variant,
--                        subscribed_at, unsubscribed_at)
-- diagnostic_leads(id, email, label, subscriber_id, converted_to_starter_at,
--                  created_at)
-- profiles(id, email, tier, starter_purchased_at, core_started_at)
-- ============================================================================


-- ----------------------------------------------------------------------------
-- View 1: squeeze_conversion__per_source_daily
-- ----------------------------------------------------------------------------
-- One row per (squeeze_family, squeeze_source, day) for the trailing 90 days.
-- The Friday Audible Call reads this view ordered by day desc to see week-
-- over-week movement per squeeze surface. The squeeze_family column collapses
-- the two parables placements into a single 'reverse_squeeze' family so the
-- per-surface view stays at the chapter level; per-placement detail comes
-- from squeeze_conversion__parables_placement_split below.
-- ----------------------------------------------------------------------------
create or replace view public.squeeze_conversion__per_source_daily as
with classified as (
  select
    s.id,
    s.email,
    s.source,
    s.status,
    s.current_day,
    s.subscribed_at,
    s.unsubscribed_at,
    case
      when s.source ilike 'free_diagnostic%'              then 'survey_funnel'
      when s.source ilike 'reverse_squeeze_parables%'     then 'reverse_squeeze'
      when s.source = 'fast_lane_squeeze'                 then 'fast_lane_squeeze'
      when s.source = 'funnel_hub'                        then 'funnel_hub'
      when s.source ilike 'founding%'                     then 'founding_waitlist'
      else                                                     'other_or_legacy'
    end as squeeze_family,
    coalesce(s.source, 'unattributed') as squeeze_source
  from public.soap_opera_subscribers s
  where s.subscribed_at >= now() - interval '90 days'
)
select
  date_trunc('day', subscribed_at)::date as day,
  squeeze_family,
  squeeze_source,
  count(*)                                                                 as opt_ins,
  count(*) filter (where status = 'active')                                as still_active,
  count(*) filter (where status = 'unsubscribed')                          as unsubscribed,
  count(*) filter (where status = 'completed')                             as completed_sos,
  count(*) filter (where status = 'bounced')                               as bounced,
  -- Day-0 retention proxy: how many were still active 24h after opt-in?
  -- A surface that bleeds in the first 24h is a wrong-fit-traffic signal,
  -- not a sequence problem.
  count(*) filter (
    where status not in ('unsubscribed', 'bounced')
       or coalesce(unsubscribed_at, subscribed_at) > subscribed_at + interval '24 hours'
  ) as retained_24h
from classified
group by 1, 2, 3
order by 1 desc, 2, 3;

comment on view public.squeeze_conversion__per_source_daily is
  'Per-source per-day opt-in counts across the three squeeze surfaces (DCS Chapter 14). Friday Audible Call dashboard.';


-- ----------------------------------------------------------------------------
-- View 2: squeeze_conversion__per_family_weekly
-- ----------------------------------------------------------------------------
-- Single-row-per-week, per-squeeze-family rollup. The Friday call screen.
-- One number per surface tells you whether to fire an audible on the
-- squeeze before changing anything downstream in the SOS or the offer.
-- ----------------------------------------------------------------------------
create or replace view public.squeeze_conversion__per_family_weekly as
select
  date_trunc('week', day)::date as week,
  squeeze_family,
  sum(opt_ins)         as opt_ins,
  sum(still_active)    as still_active,
  sum(unsubscribed)    as unsubscribed,
  sum(completed_sos)   as completed_sos,
  sum(bounced)         as bounced,
  sum(retained_24h)    as retained_24h,
  -- Honest first-pass retention rate. Cap at 0 in case of weird states.
  case
    when sum(opt_ins) = 0 then 0::numeric
    else round((sum(retained_24h)::numeric / sum(opt_ins)::numeric) * 100, 1)
  end as pct_retained_24h
from public.squeeze_conversion__per_source_daily
group by 1, 2
order by 1 desc, 2;

comment on view public.squeeze_conversion__per_family_weekly is
  'Weekly rollup per squeeze family (survey / reverse / fast-lane / hub / founding). Single-row-per-family Friday call screen.';


-- ----------------------------------------------------------------------------
-- View 3: squeeze_conversion__parables_placement_split
-- ----------------------------------------------------------------------------
-- Drill-down for the reverse-squeeze family only. Compares mid-content vs
-- end-content opt-in placements over the trailing 90 days. A mid-heavy
-- result tells us the reader bounces before parable 5 — re-order or shorten
-- the parables. An end-heavy result tells us the page works as written.
-- ----------------------------------------------------------------------------
create or replace view public.squeeze_conversion__parables_placement_split as
select
  date_trunc('week', subscribed_at)::date as week,
  case
    when source = 'reverse_squeeze_parables_mid_content' then 'mid_content'
    when source = 'reverse_squeeze_parables_end_content' then 'end_content'
    else 'unknown'
  end as placement,
  count(*) as opt_ins,
  count(*) filter (where status = 'active') as still_active,
  count(*) filter (where status = 'unsubscribed') as unsubscribed
from public.soap_opera_subscribers
where source ilike 'reverse_squeeze_parables%'
  and subscribed_at >= now() - interval '90 days'
group by 1, 2
order by 1 desc, 2;

comment on view public.squeeze_conversion__parables_placement_split is
  'Mid-content vs end-content opt-in placement comparison for /parables (DCS Secret 14 reverse variant). Tells you whether readers bounce mid-page or finish.';


-- ----------------------------------------------------------------------------
-- View 4: squeeze_conversion__per_source_to_starter
-- ----------------------------------------------------------------------------
-- The downstream-revenue read. For each squeeze source, how many opt-ins
-- ascended to a starter purchase? Joins soap_opera_subscribers to profiles
-- via email match. The match is approximate (email mutations across
-- providers happen) — for revenue-attribution truth go to the Stripe
-- metadata; this view is the leading indicator the Friday call reads to
-- decide which surface deserves more traffic next week.
-- ----------------------------------------------------------------------------
create or replace view public.squeeze_conversion__per_source_to_starter as
select
  case
    when s.source ilike 'free_diagnostic%'              then 'survey_funnel'
    when s.source ilike 'reverse_squeeze_parables%'     then 'reverse_squeeze'
    when s.source = 'fast_lane_squeeze'                 then 'fast_lane_squeeze'
    when s.source = 'funnel_hub'                        then 'funnel_hub'
    when s.source ilike 'founding%'                     then 'founding_waitlist'
    else                                                     'other_or_legacy'
  end as squeeze_family,
  count(s.id) as opt_ins,
  count(p.id) filter (where p.starter_purchased_at is not null) as starter_purchases,
  count(p.id) filter (where p.core_started_at is not null) as core_starts,
  case
    when count(s.id) = 0 then 0::numeric
    else round(
      (count(p.id) filter (where p.starter_purchased_at is not null))::numeric
      / count(s.id)::numeric * 100, 2)
  end as pct_to_starter,
  case
    when count(s.id) = 0 then 0::numeric
    else round(
      (count(p.id) filter (where p.core_started_at is not null))::numeric
      / count(s.id)::numeric * 100, 2)
  end as pct_to_core
from public.soap_opera_subscribers s
left join public.profiles p on p.email = s.email
where s.subscribed_at >= now() - interval '90 days'
group by 1
order by 1;

comment on view public.squeeze_conversion__per_source_to_starter is
  'Per-squeeze-family downstream conversion to starter and core (leading indicator; Stripe metadata is the revenue-truth source).';


-- ----------------------------------------------------------------------------
-- Friday Audible Call read recipe
-- ----------------------------------------------------------------------------
-- The 30-second Friday read:
--
--   select * from public.squeeze_conversion__per_family_weekly
--   where week >= date_trunc('week', now() - interval '4 weeks')
--   order by week desc, opt_ins desc;
--
-- The 5-second go/no-go:
--   - Any family with opt_ins=0 this week AND in market? Audible.
--   - pct_retained_24h < 50% on any family? Wrong-fit-traffic. Audible the
--     source channel, not the squeeze copy.
--   - Best-converting family among the three squeeze surfaces deserves
--     more cold traffic next week.
-- ----------------------------------------------------------------------------
