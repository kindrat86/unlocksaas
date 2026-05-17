-- ============================================================================
-- Funnel Stack — read-only views (DotCom Secrets Secret #27)
-- ============================================================================
-- Source: strategy/funnel-stack.md "Reading stack ROI" + the Friday Audible
-- Call pattern from strategy/funnel-audibles.md.
--
-- One SQL surface that answers the four questions every Friday call needs:
--
--   1. Which paths convert at all (and at what rate)?
--   2. Which entry layer produces the most paying customers?
--   3. Which affiliate slug is producing converters this week?
--   4. Where in the path do most visitors drop?
--
-- Read-only views. Apply ad-hoc via the Supabase SQL editor, or promote to a
-- numbered migration when the shape is stable:
--   supabase/migrations/YYYYMMDDhhmmss_funnel_stack_views.sql
-- All views accessible to authenticated + service_role. anon is excluded —
-- the joins aggregate revenue-sensitive attribution.
--
-- Companion to:
--   - supabase/views/funnel_audibles.sql  (per-step micro-conversion views)
--   - supabase/views/seven_phases.sql     (per-phase aliveness probes)
-- This file is the macro view across the entire stack.
-- ============================================================================

set local search_path = public, pg_catalog;

-- ---------------------------------------------------------------------------
-- VIEW 1: funnel_stack__conversions_by_path
-- ---------------------------------------------------------------------------
-- One row per distinct path (the JSON-serialized array of layer integers).
-- Counts conversions, distinct subjects, and conversion-event-type breakdown.
--
-- Read recipe — what paid the most this week?
--   select * from funnel_stack__conversions_by_path
--   order by converters_30d desc limit 10;
-- ---------------------------------------------------------------------------
create or replace view public.funnel_stack__conversions_by_path as
with conversions as (
  select
    subject_id,
    path,
    conversion_event,
    created_at,
    ab_variant
  from public.stack_events
  where event = 'convert'
    and path is not null
)
select
  path,
  count(distinct subject_id) as converters_total,
  count(distinct subject_id) filter (
    where created_at > now() - interval '7 days'
  ) as converters_7d,
  count(distinct subject_id) filter (
    where created_at > now() - interval '30 days'
  ) as converters_30d,
  count(*) filter (where conversion_event = 'starter_purchase') as starter_conversions,
  count(*) filter (where conversion_event = 'core_purchase') as core_conversions,
  count(*) filter (where conversion_event = 'ascension_purchase') as ascension_conversions,
  count(*) filter (where conversion_event = 'community_purchase') as community_conversions,
  count(*) filter (where ab_variant = 'verified_builder') as verified_builder_count,
  count(*) filter (where ab_variant = 'paid_builder') as paid_builder_count
from conversions
group by path
order by converters_30d desc nulls last, converters_total desc;

comment on view public.funnel_stack__conversions_by_path is
  'One row per distinct stack path (JSON-stringified layer array) with conversion counts. Brunson Friday Call: which paths actually monetize?';

-- ---------------------------------------------------------------------------
-- VIEW 2: funnel_stack__entry_layer_performance
-- ---------------------------------------------------------------------------
-- Pulls the FIRST element of each conversion's path (the entry layer) and
-- aggregates converters and conversion mix by that integer.
--
-- Brunson "which top-of-funnel surface earns the most" — the entry layer is
-- the answer.
-- ---------------------------------------------------------------------------
create or replace view public.funnel_stack__entry_layer_performance as
with conversions as (
  select
    subject_id,
    -- Parse the path and grab the first layer. Defensive: null when the
    -- JSON is malformed or empty. Postgres json_array_element handles both.
    case
      when path is not null and json_typeof(path::json) = 'array' and json_array_length(path::json) > 0
      then (path::json->>0)::int
      else null
    end as entry_layer,
    conversion_event,
    created_at
  from public.stack_events
  where event = 'convert'
)
select
  entry_layer,
  count(distinct subject_id) as converters_total,
  count(distinct subject_id) filter (
    where created_at > now() - interval '7 days'
  ) as converters_7d,
  count(distinct subject_id) filter (
    where created_at > now() - interval '30 days'
  ) as converters_30d,
  count(*) filter (where conversion_event = 'starter_purchase') as starter_conversions,
  count(*) filter (where conversion_event = 'core_purchase') as core_conversions
from conversions
where entry_layer is not null
group by entry_layer
order by entry_layer;

comment on view public.funnel_stack__entry_layer_performance is
  'Per-entry-layer conversion counts. Which top-of-funnel surface (cold post / squeeze / long-form / etc.) earns the most paying customers?';

-- ---------------------------------------------------------------------------
-- VIEW 3: funnel_stack__affiliate_performance
-- ---------------------------------------------------------------------------
-- Per-affiliate-slug conversion counts. Activates when Layer 7 (Affiliate
-- Army) is live — Phase 3, 50+ paying customers. The view renders correctly
-- pre-activation; it just returns zero rows.
-- ---------------------------------------------------------------------------
create or replace view public.funnel_stack__affiliate_performance as
select
  affiliate_slug,
  count(distinct subject_id) as converters_total,
  count(distinct subject_id) filter (
    where created_at > now() - interval '7 days'
  ) as converters_7d,
  count(distinct subject_id) filter (
    where created_at > now() - interval '30 days'
  ) as converters_30d,
  count(*) filter (where conversion_event = 'starter_purchase') as starter_conversions,
  count(*) filter (where conversion_event = 'core_purchase') as core_conversions,
  min(created_at) as first_conversion_at,
  max(created_at) as last_conversion_at
from public.stack_events
where event = 'convert'
  and affiliate_slug is not null
group by affiliate_slug
order by converters_30d desc nulls last;

comment on view public.funnel_stack__affiliate_performance is
  'Per-affiliate-slug conversion counts. Renders correctly pre-Phase-3; zero rows until first affiliate-attributed sale.';

-- ---------------------------------------------------------------------------
-- VIEW 4: funnel_stack__path_lengths
-- ---------------------------------------------------------------------------
-- Histogram of how long a converting visitor's path is. A short path means
-- the funnel hub converted directly; a long path means the visitor bounced
-- across multiple surfaces before paying.
--
-- The Brunson hypothesis: longer paths convert worse, but the ones that DO
-- convert have higher LTV because they self-selected through more friction.
-- We can verify once data exists.
-- ---------------------------------------------------------------------------
create or replace view public.funnel_stack__path_lengths as
select
  case
    when path is null then 0
    when json_typeof(path::json) <> 'array' then 0
    else json_array_length(path::json)
  end as path_length,
  conversion_event,
  count(*) as conversions,
  count(distinct subject_id) as unique_converters,
  count(*) filter (where created_at > now() - interval '7 days') as conversions_7d
from public.stack_events
where event = 'convert'
group by path_length, conversion_event
order by path_length, conversion_event;

comment on view public.funnel_stack__path_lengths is
  'Histogram of converting-visitor path lengths. Hypothesis: longer paths convert worse but produce higher-LTV cohorts.';

-- ---------------------------------------------------------------------------
-- VIEW 5: funnel_stack__weekly_summary
-- ---------------------------------------------------------------------------
-- Single-row weekly summary for the Friday Audible Call. Pairs with
-- funnel_audibles__weekly_top_of_funnel: this one answers "did the cross-
-- funnel stack convert this week?"
-- ---------------------------------------------------------------------------
create or replace view public.funnel_stack__weekly_summary as
with recent as (
  select *
  from public.stack_events
  where created_at > now() - interval '7 days'
)
select
  -- Pre-conversion signals (volume of bridge crossings = funnel activity)
  count(*) filter (where event = 'enter') as enters_7d,
  count(*) filter (where event = 'bridge_out') as bridge_outs_7d,
  count(*) filter (where event = 'bridge_in') as bridge_ins_7d,
  count(*) filter (where event = 'exit') as exits_7d,
  -- Conversions
  count(distinct subject_id) filter (where event = 'convert') as converters_7d,
  count(*) filter (where event = 'convert' and conversion_event = 'starter_purchase') as starter_conversions_7d,
  count(*) filter (where event = 'convert' and conversion_event = 'core_purchase') as core_conversions_7d,
  -- A/B variant split among converters
  count(distinct subject_id) filter (
    where event = 'convert' and ab_variant = 'verified_builder'
  ) as verified_builder_converters_7d,
  count(distinct subject_id) filter (
    where event = 'convert' and ab_variant = 'paid_builder'
  ) as paid_builder_converters_7d,
  -- Affiliate signal
  count(*) filter (
    where event = 'convert' and affiliate_slug is not null
  ) as affiliate_conversions_7d
from recent;

comment on view public.funnel_stack__weekly_summary is
  'Single-row weekly summary for the Friday Audible Call stack panel. Pairs with funnel_audibles__weekly_top_of_funnel for the macro stack read.';
