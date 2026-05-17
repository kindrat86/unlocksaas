-- supabase/views/results_in_advance.sql
--
-- Brunson DotCom Secrets Secret #12 (Results-in-Advance), Beat 7:
-- "The result is verifiably delivered."
--
-- Three read-only views supporting the chapter audit:
--
--   results_in_advance__starter_completion_funnel
--       Per-buyer completion timeline. One row per Starter purchase.
--       Columns: email, starter_purchased_at, deadline_at,
--                reminder_sent_at, completed_at, completed_in_window.
--
--   results_in_advance__starter_completion_ratio
--       Weekly aggregate. % of Starter buyers who completed Steps 1+2
--       within 48 hours. Red-line threshold: < 50% / 7d triggers audible.
--
--   results_in_advance__step_completion_depth
--       Step-by-step funnel. How many buyers persisted Step 1 only vs
--       Step 1+2 (the canonical "small win" pair).
--
-- These views read from public.profiles (the schema columns added by
-- 20260518000005_starter_completion_deadline.sql) and public.project_state
-- (the existing per-step jsonb persistence layer in
-- 20260516224126_0001_helper_fn_projects_and_state.sql).
--
-- Reader: service-role only. RLS does not apply to views, but we never
-- expose these to anon — they live behind the operator dashboard.

-- ── results_in_advance__starter_completion_funnel ────────────────────────────
create or replace view public.results_in_advance__starter_completion_funnel
as
select
  p.id as profile_id,
  p.email,
  p.starter_purchased_at,
  p.starter_completion_deadline_at as deadline_at,
  p.starter_completion_reminder_sent_at as reminder_sent_at,
  p.starter_completed_at as completed_at,
  -- Did completion land inside the 48-hour window?
  case
    when p.starter_completed_at is null then false
    when p.starter_completion_deadline_at is null then false
    when p.starter_completed_at <= p.starter_completion_deadline_at then true
    else false
  end as completed_in_window,
  -- Hours from purchase to completion (null if still pending).
  case
    when p.starter_completed_at is null then null
    else extract(epoch from p.starter_completed_at - p.starter_purchased_at) / 3600.0
  end as hours_to_completion,
  p.tier as current_tier
from public.profiles p
where p.starter_purchased_at is not null;

comment on view public.results_in_advance__starter_completion_funnel is
  'Per-buyer Starter completion timeline. Brunson RIA beat 7 audit handle.';

-- ── results_in_advance__starter_completion_ratio ─────────────────────────────
create or replace view public.results_in_advance__starter_completion_ratio
as
select
  date_trunc('week', p.starter_purchased_at) as week_starts_at,
  count(*) as starters_purchased,
  count(p.starter_completed_at) as starters_completed,
  count(*) filter (
    where p.starter_completed_at is not null
      and p.starter_completion_deadline_at is not null
      and p.starter_completed_at <= p.starter_completion_deadline_at
  ) as starters_completed_in_window,
  -- The Brunson chapter-truth metric: of Starter buyers, what % received
  -- the result-in-advance inside the 48-hour delivery window?
  case
    when count(*) = 0 then null
    else round(
      100.0 * count(*) filter (
        where p.starter_completed_at is not null
          and p.starter_completion_deadline_at is not null
          and p.starter_completed_at <= p.starter_completion_deadline_at
      )::numeric / count(*)::numeric,
      1
    )
  end as completion_in_window_pct,
  -- Of all Starter buyers, what % eventually completed (any time)?
  case
    when count(*) = 0 then null
    else round(
      100.0 * count(p.starter_completed_at)::numeric / count(*)::numeric,
      1
    )
  end as completion_any_time_pct,
  -- Of completed buyers, what % ascended to Core (tier='core')?
  case
    when count(p.starter_completed_at) = 0 then null
    else round(
      100.0 * count(*) filter (
        where p.starter_completed_at is not null and p.tier = 'core'
      )::numeric / count(p.starter_completed_at)::numeric,
      1
    )
  end as completed_to_core_ascension_pct
from public.profiles p
where p.starter_purchased_at is not null
group by date_trunc('week', p.starter_purchased_at)
order by week_starts_at desc;

comment on view public.results_in_advance__starter_completion_ratio is
  'Weekly Starter completion ratio. Red-line: < 50% / 7d triggers audible (funnel-audibles.md §3).';

-- ── results_in_advance__step_completion_depth ────────────────────────────────
create or replace view public.results_in_advance__step_completion_depth
as
select
  date_trunc('week', p.starter_purchased_at) as week_starts_at,
  count(*) as starters_purchased,
  count(*) filter (
    where ps.dream_customer is not null
  ) as step1_complete,
  count(*) filter (
    where ps.dream_customer is not null and ps.offer is not null
  ) as step1_and_2_complete,
  -- The leak signal Brunson chapter audits live on: buyers who got Step 1
  -- but not Step 2. If this number is high, the engine pushback on Step 2
  -- is choking them — investigate as a Funnel Audible.
  count(*) filter (
    where ps.dream_customer is not null and ps.offer is null
  ) as step1_only_stuck_at_step2
from public.profiles p
left join public.projects pr on pr.user_id = p.user_id
left join public.project_state ps on ps.project_id = pr.id
where p.starter_purchased_at is not null
group by date_trunc('week', p.starter_purchased_at)
order by week_starts_at desc;

comment on view public.results_in_advance__step_completion_depth is
  'Weekly Step 1 vs Step 1+2 depth. Step-1-only-stuck is the canonical Offer-pushback leak signal.';

-- ── Grants ───────────────────────────────────────────────────────────────────
-- Views inherit table RLS, but we explicitly revoke anon to prevent any
-- accidental exposure via the public REST endpoint. Service-role keeps
-- read access via the default grant.
revoke all on public.results_in_advance__starter_completion_funnel from anon;
revoke all on public.results_in_advance__starter_completion_ratio from anon;
revoke all on public.results_in_advance__step_completion_depth from anon;
