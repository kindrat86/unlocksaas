-- Seinfeld Sequence subscribers for UnlockSaaS.
--
-- Spec: strategy/workbooks/08-your-dream-customer.md §6 "Follow-Up Funnels".
--
-- After the 5-email Soap Opera completes (status = 'complete' on
-- public.soap_opera_subscribers), the subscriber graduates here. The Seinfeld
-- Sequence is an indefinite Mon/Wed/Fri nurture mixing parables,
-- "behind the build" notes, and industry observations — designed to keep the
-- list warm and convert slow buyers over 3 to 6 months.
--
-- Enrollment paths:
--   1. Graduates from Soap Opera (auto-enrolled by the cron each tick).
--   2. Manual enrollment via /api/seinfeld/subscribe (admin / one-off).
--
-- Cadence: 3 sends per UTC week (Mon / Wed / Fri). Cron runs daily but only
-- dispatches on those weekdays. See app/src/lib/seinfeld/schedule.ts.
--
-- Rotation state:
--   - current_index increments on every successful send. Each weekday picks
--     from its own pool; pool item = pool[current_index % pool.length].
--   - sends_count tracks total sends ever for this subscriber. PS alternates
--     between /diagnostic and /starter based on parity.
--
-- Idempotency:
--   - email is UNIQUE. /api/seinfeld/subscribe upserts.
--   - Cron uses (last_sent_at IS NULL OR last_sent_at < now() - 22h) so a
--     same-UTC-day re-trigger cannot double-send.
--
-- Defence in depth: RLS enabled with no policies. anon + authenticated keys
-- see an empty table. Only the service role (cron, dispatch) touches this.

create table if not exists public.seinfeld_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  -- Where this subscriber came from. 'soap_opera_graduate' is the common path;
  -- 'manual' covers admin enrolls and direct opt-ins post-launch.
  source text not null default 'manual'
    check (source in ('soap_opera_graduate', 'manual')),
  -- Provenance pointer back to the Soap Opera row, when applicable. ON DELETE
  -- SET NULL because deleting a Soap Opera row should never cascade-purge an
  -- active Seinfeld subscriber.
  source_subscriber_id uuid references public.soap_opera_subscribers(id) on delete set null,
  status text not null default 'active'
    check (status in ('active', 'paused', 'unsubscribed', 'bounced', 'errored')),
  -- Rotation cursor into the content pools. Incremented on every successful
  -- send. 0 = the next send will pick item 0 from today's pool.
  current_index integer not null default 0 check (current_index >= 0),
  -- Total successful sends. Drives PS-line alternation between /diagnostic
  -- and /starter (even index → /diagnostic, odd → /starter).
  sends_count integer not null default 0 check (sends_count >= 0),
  last_sent_at timestamptz,
  last_error text,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Hot path for the cron's "who is due today?" query.
create index if not exists seinfeld_subscribers_due_idx
  on public.seinfeld_subscribers (status, last_sent_at);

-- Lookup index used by the graduate-enroll step (cron joins from
-- soap_opera_subscribers.email → seinfeld_subscribers.email).
create index if not exists seinfeld_subscribers_email_idx
  on public.seinfeld_subscribers (email);

drop trigger if exists seinfeld_subscribers_set_updated_at
  on public.seinfeld_subscribers;
create trigger seinfeld_subscribers_set_updated_at
  before update on public.seinfeld_subscribers
  for each row execute function public.set_updated_at();

alter table public.seinfeld_subscribers enable row level security;

comment on table public.seinfeld_subscribers is
  'Indefinite Mon/Wed/Fri Seinfeld nurture (workbook 08 §6). Service-role only.';
comment on column public.seinfeld_subscribers.current_index is
  'Rotation cursor into the per-weekday content pool. Increments on each successful send.';
comment on column public.seinfeld_subscribers.sends_count is
  'Total successful sends. Even/odd parity drives PS-link alternation (/diagnostic vs /starter).';
comment on column public.seinfeld_subscribers.source is
  'soap_opera_graduate (auto-enrolled when Soap Opera completes) or manual (admin enroll).';
