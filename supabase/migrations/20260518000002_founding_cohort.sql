-- Founding-Cohort Product Launch Funnel
--
-- Revision 2026-05-17: workbook 03 Script 8 moved from skipped to a one-time
-- Founding-Cohort PLF. This migration adds two tables:
--
--   founding_waitlist — emails captured BEFORE cart-open. Receives PLE1-PLE5
--   sequence. Mutually informational with soap_opera_subscribers (a person can
--   be on both; the cron filters by sequence membership, not by exclusivity).
--
--   founding_cohort — the 50 actual seats. One row per Verified Builder who
--   claimed a founding spot via Stripe checkout DURING the cart-open window
--   and BEFORE the cap. Written by the Stripe webhook on subscription.created,
--   gated by cap check.
--
-- Cap enforcement: the founding_cohort table carries a partial UNIQUE index
-- ensuring seat_number is in [1, 50] and is unique. The Stripe webhook reads
-- count(*) before INSERT; the unique constraint is the fail-safe.

set local search_path = public, pg_catalog;

-- ---------------------------------------------------------------------------
-- founding_waitlist
-- ---------------------------------------------------------------------------
create table if not exists public.founding_waitlist (
  id              uuid primary key default gen_random_uuid(),
  email           text not null,
  source          text,                                 -- where the signup came from (e.g. 'plv1', 'homepage', 'twitter')
  identity_variant text check (identity_variant in ('verified_builder', 'paid_builder') or identity_variant is null),
  emails_sent     int  not null default 0 check (emails_sent between 0 and 6),
  last_sent_at    timestamptz,
  next_send_at    timestamptz,
  last_error      text,
  status          text not null default 'active' check (status in ('active', 'complete', 'unsubscribed', 'bounced')),
  converted_to_founding_at timestamptz,                 -- stamped by Stripe webhook when this waitlister claims a seat
  converted_session_id     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create unique index if not exists founding_waitlist_email_lower_idx
  on public.founding_waitlist (lower(email));

create index if not exists founding_waitlist_next_send_idx
  on public.founding_waitlist (next_send_at)
  where status = 'active' and emails_sent between 1 and 5;

create trigger founding_waitlist_set_updated_at
  before update on public.founding_waitlist
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- founding_cohort — the 50 seats
-- ---------------------------------------------------------------------------
create table if not exists public.founding_cohort (
  id                   uuid primary key default gen_random_uuid(),
  seat_number          int  not null check (seat_number between 1 and 50),
  email                text not null,
  user_id              uuid,                            -- backfilled when the user authenticates after checkout
  stripe_customer_id   text,
  stripe_subscription_id text,
  stripe_session_id    text not null,
  identity_variant     text check (identity_variant in ('verified_builder', 'paid_builder') or identity_variant is null),
  waitlist_id          uuid references public.founding_waitlist(id) on delete set null,
  price_lock_committed boolean not null default true,   -- the $49 lifetime price lock promise
  direct_line_expires_at timestamptz,                   -- 30 days after seat_claimed_at
  seat_claimed_at      timestamptz not null default now(),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- The unique index on seat_number is the structural enforcement of the 50-cap.
-- A second purchase attempting seat 51 will fail at the DB layer even if the
-- webhook check raced. The webhook is expected to compute the next seat number
-- atomically (select max(seat_number) + 1 inside a transaction) and deny
-- founding bonuses cleanly when count(*) >= 50.
create unique index if not exists founding_cohort_seat_number_uq
  on public.founding_cohort (seat_number);

create unique index if not exists founding_cohort_session_uq
  on public.founding_cohort (stripe_session_id);

create index if not exists founding_cohort_email_idx
  on public.founding_cohort (lower(email));

create trigger founding_cohort_set_updated_at
  before update on public.founding_cohort
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.founding_waitlist enable row level security;
alter table public.founding_cohort   enable row level security;

-- Anon can insert into the waitlist (the public landing page POSTs here).
-- The policy enforces minimum email shape + caps text fields + pins initial
-- state so a malicious caller cannot fake a pre-advanced row.
create policy "founding_waitlist_anon_insert" on public.founding_waitlist
  for insert
  to anon
  with check (
    char_length(email) between 4 and 255
    and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    and emails_sent = 0
    and status = 'active'
    and last_sent_at is null
    and next_send_at is null
    and converted_to_founding_at is null
    and converted_session_id is null
    and (source is null or char_length(source) <= 64)
  );

-- No SELECT/UPDATE/DELETE for anon or authenticated. Service-role only via
-- admin client (the cron, the webhook, the dispatcher).
revoke select, update, delete on public.founding_waitlist from anon, authenticated;
revoke select, update, delete on public.founding_cohort   from anon, authenticated;

-- Authenticated users can read THEIR OWN founding_cohort row, so the member
-- area can show "you are Founding Verified Builder seat #N of 50."
create policy "founding_cohort_select_own" on public.founding_cohort
  for select
  to authenticated
  using (user_id = (select auth.uid()));

comment on table public.founding_waitlist is
  'Pre-launch waitlist for the Founding-Cohort Product Launch Funnel. Workbook 03 Script 8 (revised 2026-05-17). PLE1-PLE5 sequence drips here.';
comment on table public.founding_cohort is
  'The 50 founding seats. Cap enforced by unique index on seat_number. Bonuses (lifetime $49 price lock, founding badge variant, 30-day direct line) granted only to rows in this table.';
