-- 0020_recrawl_agent
--
-- Weekly background re-crawl agent for active Core subscribers.
--
-- The product: convert the one-shot diagnostic into a recurring-MRR
-- justification. Each week the cron re-runs `deepAnalyzeUrl` against the
-- founder's product_url, persists the result as a snapshot, computes a
-- delta vs. the previous snapshot, and if the delta crosses a threshold
-- (any axis dropped by ≥ 2 or the primary label changed), fires an email
-- alert ("your hook score dropped from 7 to 5 because X") with an optional
-- Slack-webhook tee.
--
-- Why a snapshot table and not a re-write of diagnostic_leads.analysis_detail:
--   - We need the *trend* — the founder cares about the slope, not the
--     instantaneous value. Keeping every weekly score is the entire feature.
--   - diagnostic_leads is the squeeze-funnel entry record. Snapshots are a
--     billing-tier feature. Different lifecycle, different access pattern.
--   - We want to derive "first paying customer cycle improved 3 points" type
--     narratives later. Need the rows.
--
-- Discipline notes (Brunson hard-rule reconciliation):
--   - No fabricated re-crawls. If `deepAnalyzeUrl` fails (404, blocked,
--     empty page), we record the failure to recrawl_alerts and skip the
--     snapshot row. Score history stays honest.
--   - The alert email comes from maryan@unlocksaas.com (the locked sender
--     identity), not noreply@. The founder can reply and reach Maryan.
--   - week_of is a generated column locked to ISO Monday — re-running the
--     cron mid-week is idempotent per user.

-- ---------------------------------------------------------------------------
-- diagnostic_snapshots — one row per (user, week) carrying the weekly re-score
-- ---------------------------------------------------------------------------

create table public.diagnostic_snapshots (
  id uuid primary key default gen_random_uuid(),

  -- Owner. FK to profiles, not auth.users — profiles is the canonical
  -- subscriber surface and matches the cron's selection query.
  user_id uuid not null references public.profiles(user_id) on delete cascade,

  -- Denormalized for cron speed and audit. If the profile's email changes
  -- later, the historical record stays accurate.
  email text not null,

  -- The URL that was crawled. Sourced from the latest diagnostic_leads row
  -- for this email at the time of the snapshot. Denormalized in case the
  -- founder updates their product_url between weeks — we still want to know
  -- which URL produced this score.
  product_url text not null,

  -- Primary Brunson label. Mirrors diagnostic_leads.label values:
  -- wrong_person | weak_offer | weak_belief.
  label text not null,

  -- Three-axis scorecard. Each axis is 1-10 with diagnosis + evidence quotes.
  -- Shape mirrors DeepAnalysisExtras.scores in app/src/lib/diagnostic.ts.
  scores jsonb not null,

  -- Full DeepDiagnosticResult payload. Kept so we can derive narratives
  -- later (new competitors, lost strengths, rewrite drift) without re-running
  -- the LLM. JSONB cost is negligible at this scale.
  analysis_detail jsonb not null,

  -- ISO-week Monday for the snapshot. Generated, immutable. Lets us dedupe
  -- per (user, week) without timezone footguns. UTC is the source of truth
  -- — display surfaces translate to Europe/Athens (feedback_display_timezone).
  scored_at timestamptz not null default now(),
  week_of date not null generated always as ((scored_at at time zone 'UTC')::date - extract(isodow from (scored_at at time zone 'UTC'))::int + 1) stored,

  -- One snapshot per user per ISO week. Cron uses ON CONFLICT DO NOTHING.
  -- Re-running mid-week (operator backfill, retry after partial failure) is
  -- safe.
  unique (user_id, week_of)
);

-- Lookup pattern: "give me the last N snapshots for this user, newest first".
-- Powers both the cron's prev-vs-current delta and the dashboard sparkline.
create index diagnostic_snapshots_user_scored_at_idx
  on public.diagnostic_snapshots(user_id, scored_at desc);

comment on table public.diagnostic_snapshots is
  'Weekly re-crawl snapshots for active Core subscribers. One row per (user, ISO week). Source: /api/cron/recrawl. Powers the funnel-trend sparkline and the delta-alert email.';

-- ---------------------------------------------------------------------------
-- recrawl_alerts — audit log of every alert decision, sent or skipped
-- ---------------------------------------------------------------------------

create table public.recrawl_alerts (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references public.profiles(user_id) on delete cascade,
  email text not null,

  -- The two snapshots being compared. prev nullable for the first-ever
  -- snapshot (no comparison possible — we still record the row so the
  -- dashboard knows a re-crawl happened).
  prev_snapshot_id uuid references public.diagnostic_snapshots(id) on delete set null,
  curr_snapshot_id uuid references public.diagnostic_snapshots(id) on delete cascade,

  -- Computed delta payload. Shape locked to RecrawlDelta in app/src/lib/recrawl.ts.
  -- Includes label_changed, score_changes[], biggest_drop, new_competitors, etc.
  -- Null only when status='crawl_failed' (we never computed a delta).
  delta_summary jsonb,

  -- What we did with the alert.
  --   sent          - shouldAlert was true, send succeeded
  --   sent_partial  - email succeeded but Slack tee failed (or vice versa)
  --   skipped_noop  - shouldAlert was false (delta inside threshold)
  --   skipped_first - prev snapshot did not exist (first-ever crawl)
  --   skipped_optout- founder has recrawl_alerts_enabled=false
  --   failed_send   - shouldAlert was true, send failed (will not retry)
  --   crawl_failed  - deepAnalyzeUrl threw; no curr snapshot persisted
  status text not null check (status in (
    'sent', 'sent_partial', 'skipped_noop', 'skipped_first',
    'skipped_optout', 'failed_send', 'crawl_failed'
  )),

  -- "email" | "slack" | "email+slack" | "none". For audit, mirrors what was
  -- actually attempted.
  channel text not null default 'none',

  -- Populated when status indicates failure. Truncated to 500 chars by the
  -- cron to keep table footprint bounded.
  error_message text,

  sent_at timestamptz not null default now()
);

create index recrawl_alerts_user_sent_at_idx
  on public.recrawl_alerts(user_id, sent_at desc);

comment on table public.recrawl_alerts is
  'Per-week audit log of the recrawl-agent alert decision (sent/skipped/failed) for every active Core subscriber. Survives snapshot deletion so the audit chain is intact.';

-- ---------------------------------------------------------------------------
-- profiles.recrawl_alerts_enabled — per-user opt-out
-- ---------------------------------------------------------------------------
-- Default-on for the entire Core base. The cron checks this flag and writes
-- a `skipped_optout` audit row when false. Unsubscribe links in the alert
-- email flip this column to false via a signed HMAC token.

alter table public.profiles
  add column if not exists recrawl_alerts_enabled boolean not null default true;

comment on column public.profiles.recrawl_alerts_enabled is
  'Per-user opt-out for the weekly recrawl-agent delta alert. Defaults true for new Core subscribers; toggled false by the unsubscribe link in the alert email.';

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
-- Mirrors the soap_opera_subscribers / teardown_courtesy posture: service
-- role only. The dashboard surfaces use a service-role read fronted by a
-- server-component that already enforces the auth + tier gate at the layout
-- level. No anon access; no need for fine-grained policies until we ship a
-- self-serve "manage alerts" page.

alter table public.diagnostic_snapshots enable row level security;
alter table public.recrawl_alerts enable row level security;

-- Owner-scoped read for the dashboard sparkline. The /playbook layout
-- already enforces tier='core' and a valid auth session — these policies
-- just prevent a logged-in user from reading another user's history.
create policy "diagnostic_snapshots_owner_read"
  on public.diagnostic_snapshots
  for select
  using (
    user_id in (
      select p.user_id from public.profiles p
      where p.user_id = (select auth.uid())
    )
  );

create policy "recrawl_alerts_owner_read"
  on public.recrawl_alerts
  for select
  using (
    user_id in (
      select p.user_id from public.profiles p
      where p.user_id = (select auth.uid())
    )
  );

-- No insert/update/delete policies. Writes are service-role-only (cron +
-- unsubscribe-token handler).
