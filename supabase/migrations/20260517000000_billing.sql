-- Billing schema for UnlockSaaS Stripe webhook handler.
--
-- Three tables:
--   1. profiles            — 1:1 with auth.users (eventually). Tier + subscription state per email.
--   2. billing_events      — idempotency: stores processed Stripe event IDs so retries are safe.
--   3. billing_payments    — every Stripe payment (initial, renewal, starter) for guarantee window
--                            verification, refund tracking, and audit trail.
--
-- The webhook handler runs with the service-role key and bypasses RLS. RLS policies below
-- exist so that when the app reads from these tables on behalf of a signed-in user, the
-- user only sees their own rows.
--
-- Idempotency notes:
--   - billing_events.stripe_event_id is PK → second processing of same event is a no-op.
--   - billing_payments has a UNIQUE constraint on stripe_charge_id and (stripe_invoice_id, kind)
--     so duplicate inserts are caught.

-- ── extensions ────────────────────────────────────────────────────────────────
create extension if not exists pgcrypto;

-- ── profiles ──────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  email text unique not null,
  stripe_customer_id text unique,
  tier text not null default 'none' check (tier in ('none','starter','core')),
  subscription_status text,
  stripe_subscription_id text unique,
  starter_purchased_at timestamptz,
  core_started_at timestamptz,
  guarantee_expires_at timestamptz,
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,
  refunded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_email_idx on public.profiles (email);
create index if not exists profiles_stripe_customer_idx on public.profiles (stripe_customer_id);

-- ── billing_events (idempotency) ──────────────────────────────────────────────
create table if not exists public.billing_events (
  stripe_event_id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now(),
  payload jsonb
);

create index if not exists billing_events_type_idx on public.billing_events (event_type);

-- ── billing_payments ──────────────────────────────────────────────────────────
create table if not exists public.billing_payments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  email text not null,
  stripe_customer_id text,
  stripe_invoice_id text,
  stripe_charge_id text,
  stripe_payment_intent_id text,
  kind text not null check (kind in ('starter','core_initial','core_renewal','other')),
  amount_cents integer not null,
  currency text not null default 'usd',
  status text not null check (status in ('paid','failed','refunded','partial_refund')),
  paid_at timestamptz,
  failed_at timestamptz,
  refunded_at timestamptz,
  refund_amount_cents integer,
  created_at timestamptz not null default now()
);

-- One row per charge. Allows safe upsert on retry.
create unique index if not exists billing_payments_charge_idx
  on public.billing_payments (stripe_charge_id)
  where stripe_charge_id is not null;

-- One row per invoice+kind combo. Allows safe upsert when charge id is missing.
create unique index if not exists billing_payments_invoice_kind_idx
  on public.billing_payments (stripe_invoice_id, kind)
  where stripe_invoice_id is not null;

create index if not exists billing_payments_email_idx on public.billing_payments (email);
create index if not exists billing_payments_profile_idx on public.billing_payments (profile_id);

-- ── updated_at trigger ────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ── auto-link profile when user signs up ─────────────────────────────────────
-- When a Supabase auth user is created, attach an existing profile row by email
-- (created earlier during checkout webhook). If no profile exists, create one.
create or replace function public.link_profile_on_user_create()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
    set user_id = new.id
    where email = new.email
      and user_id is null;

  if not found then
    insert into public.profiles (user_id, email)
    values (new.id, new.email)
    on conflict (email) do update set user_id = excluded.user_id;
  end if;

  return new;
end;
$$;

drop trigger if exists link_profile_on_user_create_trigger on auth.users;
create trigger link_profile_on_user_create_trigger
  after insert on auth.users
  for each row execute function public.link_profile_on_user_create();

-- ── RLS ───────────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.billing_events enable row level security;
alter table public.billing_payments enable row level security;

-- Profiles: a signed-in user can see their own profile.
drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Payments: a signed-in user can see their own payment history.
drop policy if exists billing_payments_self_read on public.billing_payments;
create policy billing_payments_self_read on public.billing_payments
  for select to authenticated
  using (
    profile_id in (select id from public.profiles where user_id = auth.uid())
  );

-- billing_events has no policies; only the service role (which bypasses RLS) writes.

-- ── comments ──────────────────────────────────────────────────────────────────
comment on table public.profiles is 'Per-email billing + tier state. user_id is null until magic-link signup.';
comment on column public.profiles.tier is 'none | starter | core. Granted by webhook; never set by client.';
comment on column public.profiles.guarantee_expires_at is 'core_started_at + 60 days. Refund eligibility window.';
comment on table public.billing_events is 'Stripe event idempotency log. Service-role only.';
comment on table public.billing_payments is 'One row per Stripe charge/invoice. Powers guarantee verifier + audit.';
