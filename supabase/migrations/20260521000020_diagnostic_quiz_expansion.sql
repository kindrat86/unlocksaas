-- Brunson Survey Funnel expansion — quiz funnel uplift (2026-05-21).
--
-- The Free Diagnostic shipped as a 3-question survey (time_since_launch,
-- recent_revenue, biggest_attempt) bookended by URL paste and email capture.
-- This migration adds three more orthogonal segmenting questions so the funnel
-- crosses the 2026 quiz-funnel sweet spot (5–8 questions) and gives the
-- variant resolver enough signal to branch the result page on three axes:
--
--   primary_goal     → headline variant on the result page
--   hours_per_week   → scorecard tone (urgent / patient / sober / compounding)
--   biggest_fear     → 30-day plan emphasis (audience / distribution / ship /
--                      organic / credibility / default)
--
-- All three fields are nullable so legacy rows and the old API shape continue
-- to work unchanged. The bridge / bucket logic in lib/diagnostic.ts is also
-- unchanged — these signals layer on top of the existing 7-bucket taxonomy
-- via lib/diagnostic-variants.ts, they do NOT redefine it.
--
-- Source:
--   - 2026-05-21 trend synthesis: quiz funnels avg 40.1% conversion vs 3–10%
--     for static lead magnets (Dashform 2026, Stormy AI Perspective playbook).
--   - Brunson DCS Secret 15 — Survey Funnel + Bridge Scripts.
--   - strategy/workbooks/04-building-your-funnels.md §3 (Diagnostic Result).

alter table public.diagnostic_leads
  add column if not exists primary_goal text,
  add column if not exists hours_per_week text,
  add column if not exists biggest_fear text;

-- Soft enum checks. Match the const arrays in app/src/lib/diagnostic.ts
-- (PRIMARY_GOAL_VALUES, HOURS_PER_WEEK_VALUES, BIGGEST_FEAR_VALUES). If you
-- add a new enum value in code, add it here too — Postgres refuses inserts
-- otherwise and the funnel breaks silently for that variant.
alter table public.diagnostic_leads
  add constraint diagnostic_leads_primary_goal_chk
    check (
      primary_goal is null
      or primary_goal in (
        'first_customer',
        'replace_income',
        'scale_revenue',
        'validate_pmf',
        'build_audience'
      )
    ),
  add constraint diagnostic_leads_hours_per_week_chk
    check (
      hours_per_week is null
      or hours_per_week in ('under_5', 'five_to_fifteen', 'fifteen_plus')
    ),
  add constraint diagnostic_leads_biggest_fear_chk
    check (
      biggest_fear is null
      or biggest_fear in (
        'wrong_audience',
        'no_distribution',
        'not_ready',
        'ad_waste',
        'not_expert',
        'none'
      )
    );

-- Indexes used by the variant-cohort analytics SQL (post-launch, once we
-- have ≥100 leads per arm). Partial indexes — only non-null rows — so they
-- stay tiny on the long tail of legacy rows that pre-date the expansion.
create index if not exists diagnostic_leads_primary_goal_idx
  on public.diagnostic_leads (primary_goal)
  where primary_goal is not null;

create index if not exists diagnostic_leads_hours_per_week_idx
  on public.diagnostic_leads (hours_per_week)
  where hours_per_week is not null;

create index if not exists diagnostic_leads_biggest_fear_idx
  on public.diagnostic_leads (biggest_fear)
  where biggest_fear is not null;
