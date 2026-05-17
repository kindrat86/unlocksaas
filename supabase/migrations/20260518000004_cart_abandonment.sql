-- Cart Abandonment Recovery cadence
--
-- Closes Traffic Secrets Secret #6 (Follow-Up Funnels) audit gap by adding the
-- fifth cadence in the follow-up taxonomy. Triggered by Stripe
-- `checkout.session.expired` on any priceType (starter or machine). Drips a
-- 3-email recovery arc (Day 0, Day 2, Day 7) and stops if the subscriber
-- completes a fresh checkout in the meantime.
--
-- Schema mirrors soap_opera_subscribers / founding_waitlist conventions:
--   - `emails_sent` counter advanced by dispatcher
--   - `status` state machine: active | complete | recovered | unsubscribed | bounced
--   - `next_send_at` is the cron's index
--   - HMAC unsubscribe keyed on email (shared with the other cadences)
--
-- Resume link does NOT use Stripe's expired session URL — those expire after
-- 24h and would break Email 2 (Day 2) and Email 3 (Day 7). Resume routes to
-- the surface page (/starter or /machine-sales) which renders a fresh
-- Checkout button on every visit.

set local search_path = public, pg_catalog;

-- ---------------------------------------------------------------------------
-- cart_abandonment_subscribers
-- ---------------------------------------------------------------------------
create table if not exists public.cart_abandonment_subscribers (
  id                  uuid primary key default gen_random_uuid(),
  email               text not null,
  stripe_session_id   text not null,                          -- the EXPIRED session that triggered enrolment
  price_type          text not null check (price_type in ('starter', 'machine')),
  identity_variant    text check (identity_variant in ('verified_builder', 'paid_builder') or identity_variant is null),
  diagnostic_label    text check (diagnostic_label in ('wrong_person', 'weak_offer', 'weak_belief') or diagnostic_label is null),
  emails_sent         int  not null default 0 check (emails_sent between 0 and 3),
  last_sent_at        timestamptz,
  next_send_at        timestamptz,
  last_error          text,
  status              text not null default 'active'
                      check (status in ('active', 'complete', 'recovered', 'unsubscribed', 'bounced')),
  recovered_at        timestamptz,                            -- stamped when a fresh checkout.session.completed lands for this email
  recovered_session_id text,
  unsubscribed_at     timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- One row per expired session. Re-firing the same expired event is a no-op.
create unique index if not exists cart_abandonment_session_uq
  on public.cart_abandonment_subscribers (stripe_session_id);

-- Lookup by email is needed for the recovery short-circuit AND for the
-- one-click unsubscribe. Case-insensitive to match the rest of the stack.
create index if not exists cart_abandonment_email_idx
  on public.cart_abandonment_subscribers (lower(email));

-- The cron picks the earliest row whose next_send_at <= now and status='active'.
create index if not exists cart_abandonment_next_send_idx
  on public.cart_abandonment_subscribers (next_send_at)
  where status = 'active' and emails_sent between 1 and 2;

create trigger cart_abandonment_set_updated_at
  before update on public.cart_abandonment_subscribers
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS — service-role only. No public POST endpoint exists (enrolment is
-- exclusively driven by the Stripe webhook running as admin client).
-- ---------------------------------------------------------------------------
alter table public.cart_abandonment_subscribers enable row level security;

revoke select, insert, update, delete on public.cart_abandonment_subscribers
  from anon, authenticated;

comment on table public.cart_abandonment_subscribers is
  'Cart Abandonment Recovery cadence (Traffic Secrets Secret #6 / Follow-Up Funnels). Enrolled by Stripe `checkout.session.expired`; 3-email arc (D0, D2, D7); short-circuits to `recovered` on any subsequent `checkout.session.completed` for the same email. Doc: strategy/follow-up-funnels.md.';
