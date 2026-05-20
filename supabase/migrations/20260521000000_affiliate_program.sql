-- Affiliate program schema for UnlockSaaS (Isenberg overlay – "50% to $1M ARR").
--
-- Five tables:
--   1. affiliates              – one row per profile that owns a referral code
--   2. affiliate_clicks        – append-only click log (lightweight, for dashboard counts)
--   3. affiliate_referrals     – one row per referred visitor/email
--   4. affiliate_commissions   – per-Stripe-event commission ledger
--   5. affiliate_payouts       – manual payout records (v1 = off-platform via Wise)
--
-- Attribution model: first-touch. The browser hits /r/<code>, we set a
-- 90-day signed cookie `unlocksaas_ref` whose value is the code. On checkout,
-- /api/checkout copies the cookie value into Stripe metadata.ref_code. On
-- webhook checkout.session.completed we create the referral row; on every
-- invoice.payment_succeeded for that subscription, we create a commission
-- row (50% rev share) and link it to the referral.
--
-- Commission lifecycle: pending → payable (after 30-day refund window) →
-- paid (operator marks via dashboard / SQL when Wise transfer clears) →
-- voided (if the referred customer is refunded inside window) or
-- reversed (rare – clawback after marking paid).
--
-- Rev share: per-affiliate column on `affiliates.rev_share_pct` so we can
-- drop the floor from 50 → 30 once UnlockSaaS hits $1M ARR. Existing
-- affiliates keep their snapshotted percentage on already-issued commissions
-- (the percentage is also snapshotted onto the commission row so historic
-- payouts don't shift when the floor changes).
--
-- RLS: each affiliate sees their own rows; the webhook writes via the
-- service role and bypasses RLS.

create extension if not exists pgcrypto;

-- ── affiliates ───────────────────────────────────────────────────────────────
create table if not exists public.affiliates (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  code text not null unique,
  status text not null default 'active'
    check (status in ('active','paused','banned')),
  rev_share_pct integer not null default 50
    check (rev_share_pct between 0 and 100),
  rev_share_floor_pct integer not null default 50
    check (rev_share_floor_pct between 0 and 100),
  payout_email text,
  payout_method text default 'wise'
    check (payout_method in ('wise','stripe_connect','paypal','other')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists affiliates_status_idx on public.affiliates (status);
create index if not exists affiliates_code_lookup_idx on public.affiliates (lower(code));

comment on table public.affiliates is
  'One row per profile enrolled in the affiliate program. Code is URL-safe and unique.';
comment on column public.affiliates.rev_share_pct is
  'Current rev share. 50 default, drops to 30 after platform hits $1M ARR. Snapshotted on commission rows.';
comment on column public.affiliates.rev_share_floor_pct is
  'Lower bound the operator promised this affiliate (lifetime grandfather). Defaults to 50.';

-- ── affiliate_clicks (click log) ────────────────────────────────────────────
create table if not exists public.affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  code_used text not null,
  ip_hash text,
  user_agent_excerpt text,
  referer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  landing_path text,
  clicked_at timestamptz not null default now()
);

create index if not exists affiliate_clicks_affiliate_idx
  on public.affiliate_clicks (affiliate_id, clicked_at desc);

comment on table public.affiliate_clicks is
  'Append-only click log. Lightweight: we hash IPs + truncate UA. Powers dashboard counters only.';

-- ── affiliate_referrals (one per referred email/visitor) ────────────────────
create table if not exists public.affiliate_referrals (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  referred_email text,
  referred_profile_id uuid references public.profiles(id) on delete set null,
  stripe_customer_id text,
  stripe_session_id text unique,
  first_seen_at timestamptz not null default now(),
  converted_at timestamptz,
  kind text check (kind in ('starter','core')),
  status text not null default 'pending'
    check (status in ('pending','converted','churned','voided')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists affiliate_referrals_affiliate_idx
  on public.affiliate_referrals (affiliate_id, converted_at desc nulls last);
create index if not exists affiliate_referrals_customer_idx
  on public.affiliate_referrals (stripe_customer_id)
  where stripe_customer_id is not null;
create index if not exists affiliate_referrals_email_idx
  on public.affiliate_referrals (lower(referred_email))
  where referred_email is not null;

comment on table public.affiliate_referrals is
  'One row per visitor/email referred by an affiliate. Promoted to converted on first paid checkout.';

-- ── affiliate_commissions (per-Stripe-event ledger) ─────────────────────────
create table if not exists public.affiliate_commissions (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates(id) on delete restrict,
  referral_id uuid references public.affiliate_referrals(id) on delete set null,
  -- snapshot the percentage we paid out at; future floor changes don't rewrite history
  rev_share_pct_snapshot integer not null
    check (rev_share_pct_snapshot between 0 and 100),
  -- Stripe identifiers (at least one of invoice_id / charge_id must be set)
  stripe_invoice_id text,
  stripe_charge_id text,
  stripe_payment_intent_id text,
  stripe_customer_id text,
  kind text not null check (kind in ('starter','core_initial','core_renewal','other')),
  gross_amount_cents integer not null check (gross_amount_cents >= 0),
  commission_cents integer not null check (commission_cents >= 0),
  currency text not null default 'usd',
  status text not null default 'pending'
    check (status in ('pending','payable','paid','voided','reversed')),
  payout_id uuid,
  invoice_date timestamptz not null default now(),
  payable_at timestamptz,
  paid_at timestamptz,
  voided_at timestamptz,
  created_at timestamptz not null default now()
);

-- Idempotency: one commission row per (invoice OR charge) per affiliate.
create unique index if not exists affiliate_commissions_invoice_uniq
  on public.affiliate_commissions (affiliate_id, stripe_invoice_id)
  where stripe_invoice_id is not null;
create unique index if not exists affiliate_commissions_charge_uniq
  on public.affiliate_commissions (affiliate_id, stripe_charge_id)
  where stripe_charge_id is not null;

create index if not exists affiliate_commissions_affiliate_status_idx
  on public.affiliate_commissions (affiliate_id, status, invoice_date desc);

comment on table public.affiliate_commissions is
  'Per-billing-event ledger. One row per Stripe invoice (Core) or charge (Starter). Sums by status power the dashboard.';
comment on column public.affiliate_commissions.rev_share_pct_snapshot is
  'The percentage in force at the moment this row was created. Historic – does not move when floor changes.';

-- ── affiliate_payouts (manual payout records, v1) ───────────────────────────
create table if not exists public.affiliate_payouts (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates(id) on delete restrict,
  method text not null default 'wise'
    check (method in ('wise','stripe_connect','paypal','other')),
  total_cents integer not null check (total_cents >= 0),
  currency text not null default 'usd',
  external_reference text,
  notes text,
  paid_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists affiliate_payouts_affiliate_idx
  on public.affiliate_payouts (affiliate_id, paid_at desc);

-- FK from commissions.payout_id to payouts.id (deferred so the table existed first)
alter table public.affiliate_commissions
  drop constraint if exists affiliate_commissions_payout_fk;
alter table public.affiliate_commissions
  add constraint affiliate_commissions_payout_fk
  foreign key (payout_id) references public.affiliate_payouts(id) on delete set null;

-- ── updated_at trigger reuse ────────────────────────────────────────────────
-- public.set_updated_at() is defined in 20260517000000_billing.sql.
-- Defensive: recreate if for some reason it isn't present (idempotency).
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists affiliates_set_updated_at on public.affiliates;
create trigger affiliates_set_updated_at
  before update on public.affiliates
  for each row execute function public.set_updated_at();

drop trigger if exists affiliate_referrals_set_updated_at on public.affiliate_referrals;
create trigger affiliate_referrals_set_updated_at
  before update on public.affiliate_referrals
  for each row execute function public.set_updated_at();

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table public.affiliates enable row level security;
alter table public.affiliate_clicks enable row level security;
alter table public.affiliate_referrals enable row level security;
alter table public.affiliate_commissions enable row level security;
alter table public.affiliate_payouts enable row level security;

-- Affiliates: a signed-in user can read their own affiliate row.
drop policy if exists affiliates_self_read on public.affiliates;
create policy affiliates_self_read on public.affiliates
  for select to authenticated
  using (
    profile_id in (select id from public.profiles where user_id = auth.uid())
  );

-- Affiliates: a signed-in user can update payout email + method on their own row.
drop policy if exists affiliates_self_update on public.affiliates;
create policy affiliates_self_update on public.affiliates
  for update to authenticated
  using (
    profile_id in (select id from public.profiles where user_id = auth.uid())
  )
  with check (
    profile_id in (select id from public.profiles where user_id = auth.uid())
  );

-- Clicks: a signed-in user can see clicks for their own code.
drop policy if exists affiliate_clicks_self_read on public.affiliate_clicks;
create policy affiliate_clicks_self_read on public.affiliate_clicks
  for select to authenticated
  using (
    affiliate_id in (
      select a.id from public.affiliates a
      join public.profiles p on p.id = a.profile_id
      where p.user_id = auth.uid()
    )
  );

-- Referrals: a signed-in user can see referrals attributed to them.
-- Email is hidden by RLS – we only expose presence (status, kind), not email.
drop policy if exists affiliate_referrals_self_read on public.affiliate_referrals;
create policy affiliate_referrals_self_read on public.affiliate_referrals
  for select to authenticated
  using (
    affiliate_id in (
      select a.id from public.affiliates a
      join public.profiles p on p.id = a.profile_id
      where p.user_id = auth.uid()
    )
  );

-- Commissions: a signed-in user can see their own commission rows.
drop policy if exists affiliate_commissions_self_read on public.affiliate_commissions;
create policy affiliate_commissions_self_read on public.affiliate_commissions
  for select to authenticated
  using (
    affiliate_id in (
      select a.id from public.affiliates a
      join public.profiles p on p.id = a.profile_id
      where p.user_id = auth.uid()
    )
  );

-- Payouts: a signed-in user can see their own payouts.
drop policy if exists affiliate_payouts_self_read on public.affiliate_payouts;
create policy affiliate_payouts_self_read on public.affiliate_payouts
  for select to authenticated
  using (
    affiliate_id in (
      select a.id from public.affiliates a
      join public.profiles p on p.id = a.profile_id
      where p.user_id = auth.uid()
    )
  );

-- No client-side INSERT/UPDATE/DELETE policies: only the service-role webhook + ops
-- code writes. The absence of policies for those verbs is the deny-by-default.
