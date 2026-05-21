-- 20260521000000_llmo_citations
--
-- LLM-citation tracking — surfaces whether unlocksaas.com is recommended /
-- linked when ChatGPT, Perplexity, Claude, and Google AI Mode answer the
-- 20 priority queries in strategy/llmo/priority-queries.csv.
--
-- One row per (query, provider, run_at) tick. The weekly cron at
-- /api/cron/llmo-citations runs every Monday 09:00 UTC, calls every
-- provider whose API key is configured, and inserts the raw response +
-- parsed detection flags.
--
-- Read pattern: scripts/build-dashboard.py and the operator-facing view
-- v_llmo_citation_share read with the service-role client, server-side
-- only. No anon / authenticated read policy is granted — RLS locks the
-- table down to service-role.
--
-- Cost containment: ~20 queries × up to 4 providers × 1 run/week = ~80
-- rows/week. At a 12-week retention horizon that is ~1000 rows — well
-- inside Supabase free-tier quotas.

create table public.llmo_citations (
  id              uuid primary key default gen_random_uuid(),

  -- Which of the 20 priority queries was sent. Matches the `id` column
  -- in strategy/llmo/priority-queries.csv (e.g. "Q01").
  query_id        text not null,

  -- The exact prompt text we sent. Stored for reproducibility — if we
  -- ever rephrase a query the historical row still shows what was asked.
  query_text      text not null,

  -- Which LLM provider answered.
  provider        text not null check (provider in ('openai', 'perplexity', 'anthropic', 'google')),

  -- Provider-specific model identifier (e.g. "gpt-4o", "sonar-pro",
  -- "claude-sonnet-4-5", "gemini-2.5-pro"). Stored to detect drift when
  -- we change defaults.
  model           text not null,

  -- When the API call resolved (server-side wall clock).
  run_at          timestamptz not null default now(),

  -- Detection flags computed by lib/llmo/citation-tracker.ts. Stored
  -- denormalised so the dashboard view does not have to re-parse the
  -- raw response on every read.
  url_cited       boolean not null default false,  -- unlocksaas.com appears as a citation/source
  brand_mentioned boolean not null default false,  -- "UnlockSaaS" or "unlocksaas" appears in answer text
  rank_in_answer  smallint,                        -- 1-based ordinal among cited sources, null if not cited

  -- All hyperlinked sources the model cited, in order. Lets us see who
  -- *is* getting cited when we are not. JSONB array of strings.
  cited_urls      jsonb not null default '[]'::jsonb,

  -- Full answer text. Kept for manual review and for later
  -- post-processing (e.g. sentiment, competitor-mention extraction).
  response_text   text not null default '',

  -- Any provider-specific metadata the client wants to keep around
  -- (usage tokens, finish reason, error envelopes). Free-form jsonb.
  raw             jsonb,

  -- Wall-clock duration of the provider call in ms. Surfaces slow
  -- providers + helps cap the cron's total runtime budget.
  latency_ms      integer
);

-- Lookups by query for "show me how Q01 trended this quarter".
create index llmo_citations_query_id_run_at_idx
  on public.llmo_citations (query_id, run_at desc);

-- Lookups by provider for "did OpenAI ever cite us in May?".
create index llmo_citations_provider_run_at_idx
  on public.llmo_citations (provider, run_at desc);

-- Fast-path "show me only the wins" filter.
create index llmo_citations_url_cited_idx
  on public.llmo_citations (url_cited)
  where url_cited = true;

-- RLS: lock the table down. Only service-role (which bypasses RLS) can
-- read or write. No anon / authenticated policy is granted.
alter table public.llmo_citations enable row level security;

-- Operator-facing view: most recent run per (query, provider), plus a
-- rolling week-over-week share. Read with the service-role client from
-- scripts/build-dashboard.py or any admin route.
--
-- Columns:
--   query_id        — Q01..Q20
--   provider        — openai | perplexity | anthropic | google
--   last_run_at     — most recent tick
--   currently_cited — were we cited on the last tick
--   weeks_cited_12  — count of distinct ISO-weeks in the last 12 we got cited
--   citation_share  — weeks_cited_12 / total_weeks_with_data (0.0..1.0)
create or replace view public.v_llmo_citation_share as
with latest as (
  select
    query_id,
    provider,
    max(run_at) as last_run_at
  from public.llmo_citations
  group by query_id, provider
),
latest_row as (
  select
    c.query_id,
    c.provider,
    c.run_at as last_run_at,
    c.url_cited as currently_cited,
    c.brand_mentioned as currently_mentioned,
    c.rank_in_answer as last_rank
  from public.llmo_citations c
  join latest l
    on c.query_id = l.query_id
   and c.provider = l.provider
   and c.run_at  = l.last_run_at
),
last_12w as (
  select
    query_id,
    provider,
    count(distinct date_trunc('week', run_at)) filter (where url_cited)        as weeks_cited_12,
    count(distinct date_trunc('week', run_at))                                  as weeks_with_data_12
  from public.llmo_citations
  where run_at >= (now() - interval '12 weeks')
  group by query_id, provider
)
select
  lr.query_id,
  lr.provider,
  lr.last_run_at,
  lr.currently_cited,
  lr.currently_mentioned,
  lr.last_rank,
  coalesce(w.weeks_cited_12, 0)     as weeks_cited_12,
  coalesce(w.weeks_with_data_12, 0) as weeks_with_data_12,
  case
    when coalesce(w.weeks_with_data_12, 0) = 0 then 0.0
    else round(w.weeks_cited_12::numeric / w.weeks_with_data_12::numeric, 3)
  end as citation_share
from latest_row lr
left join last_12w w
  on w.query_id = lr.query_id
 and w.provider = lr.provider;

comment on table public.llmo_citations is
  'LLM citation tracking — one row per (query, provider, run_at). Populated by /api/cron/llmo-citations.';
comment on view public.v_llmo_citation_share is
  'Operator dashboard: last-tick + 12-week rolling citation share per (query, provider).';
