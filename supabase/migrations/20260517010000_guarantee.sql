-- 60-day guarantee schema for UnlockSaaS.
--
-- Sits on top of 20260517000000_billing.sql (which created `profiles`,
-- `billing_events`, `billing_payments`). This migration adds the two pieces
-- the guarantee verifier needs that the billing tables can't express:
--
--   1. milestones           — work conditions tracked in-product. The guarantee
--                              promise (from strategy/state.json) requires the
--                              user to have completed specific Machine steps and
--                              logged 20 outreach actions before the 60-day
--                              mark to be refund-eligible.
--
--   2. verified_conversions — Stripe charges detected on the USER'S OWN
--                              connected Stripe account (not ours). The
--                              presence of even one charge here means the
--                              promise was kept — refund is no longer warranted.
--
-- Both tables key off profiles.id. The verifier (app/src/lib/guarantee.ts)
-- joins these with profiles + billing_payments to produce a single evaluation.
--
-- Idempotency: milestones is (profile_id, key) unique. verified_conversions
-- is unique on stripe_charge_id. Both tables are append-only from the webhook
-- and engine handlers' perspective; updates only happen for status fields.

-- ── milestones ────────────────────────────────────────────────────────────────
-- Append-only log of in-product milestone achievements. The presence of a row
-- with (profile_id, key) means that milestone was reached.
--
-- Canonical keys (matches strategy/state.json work_condition + workbook 05 §7):
--   dream_customer_pinned           Step 1 complete
--   offer_locked                    Step 2 complete
--   ac_defined                      Step 3 complete
--   copy_generated                  Step 4 complete
--   outreach_assets_generated       Step 5 complete
--   twenty_outreach_actions_logged  20 rows in outreach_actions
--
-- The set of "required for refund eligibility" keys is owned by
-- lib/guarantee.ts (REFUND_REQUIRED_MILESTONES), not the database, so the
-- promise can evolve without a migration.
create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  key text not null,
  achieved_at timestamptz not null default now(),
  source text not null default 'engine' check (source in ('engine','webhook','manual')),
  metadata jsonb
);

create unique index if not exists milestones_profile_key_idx
  on public.milestones (profile_id, key);

create index if not exists milestones_profile_idx
  on public.milestones (profile_id);

-- ── verified_conversions ──────────────────────────────────────────────────────
-- One row per detected paying customer ON THE USER'S OWN STRIPE ACCOUNT.
-- The webhook handler writes these when (eventually) we listen to Stripe
-- Connect events from the user's connected account. For v1 we also allow
-- source='manual' so the operator can record verified customers detected
-- out-of-band.
--
-- Existence of any row for a profile makes the guarantee promise KEPT —
-- the refund eligibility check returns false.
create table if not exists public.verified_conversions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  stripe_charge_id text,
  stripe_account_id text,  -- the user's connected account, NOT ours
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'usd',
  customer_email text,
  detected_at timestamptz not null default now(),
  source text not null default 'connect' check (source in ('connect','manual')),
  metadata jsonb
);

create unique index if not exists verified_conversions_charge_idx
  on public.verified_conversions (stripe_charge_id)
  where stripe_charge_id is not null;

create index if not exists verified_conversions_profile_idx
  on public.verified_conversions (profile_id);

-- ── RLS ───────────────────────────────────────────────────────────────────────
alter table public.milestones enable row level security;
alter table public.verified_conversions enable row level security;

-- Milestones: signed-in user reads their own.
drop policy if exists milestones_self_read on public.milestones;
create policy milestones_self_read on public.milestones
  for select to authenticated
  using (
    profile_id in (select id from public.profiles where user_id = auth.uid())
  );

-- Verified conversions: signed-in user reads their own.
drop policy if exists verified_conversions_self_read on public.verified_conversions;
create policy verified_conversions_self_read on public.verified_conversions
  for select to authenticated
  using (
    profile_id in (select id from public.profiles where user_id = auth.uid())
  );

-- Inserts/updates happen only via the service role (engine + webhook).

-- ── comments ──────────────────────────────────────────────────────────────────
comment on table public.milestones is
  'In-product work conditions for the 60-day guarantee. Append-only via service role.';
comment on column public.milestones.key is
  'Canonical key; see lib/guarantee.ts MILESTONE_KEYS for the authoritative list.';
comment on table public.verified_conversions is
  'Paying customers detected on the user''s OWN Stripe account. Presence = guarantee kept.';
