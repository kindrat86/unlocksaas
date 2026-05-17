-- Cron Run History — observability layer for the 5 follow-up cadences
--
-- Closes DCS Secret #6 (Soap Opera Sequence) audit gap by making cron
-- liveness + per-run outcome a queryable fact instead of a Vercel-logs
-- archaeology project.
--
-- One row per cron tick across all 5 cadences (soap-opera, seinfeld,
-- founding, cart-recovery, challenge). The Friday Audible Call SQL views
-- in `supabase/views/funnel_audibles.sql` join against this table to
-- answer "did Soap Opera fire yesterday and process N rows?" in one query.
--
-- A row is inserted with status='running' before the handler executes.
-- The wrapper at `app/src/lib/cron/run-history.ts` updates it to
-- 'ok' or 'error' on completion. If the handler crashes hard (timeout,
-- OOM), the row stays as 'running' and surfaces as a stuck cron.
--
-- Schema design rules followed:
--   - service-role-only writes (no anon insert path; only the wrapper
--     running as admin client populates the table)
--   - case-insensitive cron_path NOT applied — these are exact Vercel
--     route paths and must match byte-for-byte
--   - indexed by (cron_path, started_at desc) for the standard "what
--     happened last on cadence X?" query

set local search_path = public, pg_catalog;

create table if not exists public.cron_run_history (
  id              uuid primary key default gen_random_uuid(),
  cron_path       text not null,
  started_at      timestamptz not null default now(),
  finished_at     timestamptz,
  status          text not null default 'running'
                  check (status in ('running', 'ok', 'error')),
  processed       int not null default 0 check (processed >= 0),
  sent            int not null default 0 check (sent >= 0),
  failed          int not null default 0 check (failed >= 0),
  duration_ms     int check (duration_ms is null or duration_ms >= 0),
  error_detail    text,
  created_at      timestamptz not null default now()
);

-- The canonical "show me the last 7 days of soap-opera cron runs" query.
create index if not exists cron_run_history_path_started_idx
  on public.cron_run_history (cron_path, started_at desc);

-- Stuck-cron query: status='running' AND started_at < now() - interval '15 minutes'.
create index if not exists cron_run_history_stuck_idx
  on public.cron_run_history (status, started_at)
  where status = 'running';

-- ---------------------------------------------------------------------------
-- RLS — service-role only. The wrapper at lib/cron/run-history.ts writes
-- with the admin client; nothing else needs access. Funnel Audibles SQL
-- views read this table via service role (defined as security definer
-- functions in supabase/views/funnel_audibles.sql when added).
-- ---------------------------------------------------------------------------
alter table public.cron_run_history enable row level security;

revoke select, insert, update, delete on public.cron_run_history
  from anon, authenticated;

comment on table public.cron_run_history is
  'Cron observability layer (DCS Secret #6 / Soap Opera Sequence). One row per cron tick across soap-opera, seinfeld, founding, cart-recovery, challenge cadences. Populated by the withCronRunHistory wrapper at app/src/lib/cron/run-history.ts. Queried by the Funnel Audibles Friday Audible Call.';
