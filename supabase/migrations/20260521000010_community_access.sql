-- Verified Builders community gate (Isenberg overlay: community is the new moat).
--
-- Background: Greg Isenberg's 2026 playbook frame – "If people come for the tool,
-- they leave for the price. If they come for the people, they stay for the vibe."
-- Layered on top of the locked Brunson value ladder (free diagnostic → $1 Starter
-- → $49/mo Core), this migration adds the columns and audit log needed to gate a
-- private Verified Builders community (Skool or Discord, set at runtime via the
-- COMMUNITY_INVITE_URL env var) to Core subscribers.
--
-- Two changes:
--   1. profiles gains four community_* columns so the webhook can stamp grant +
--      invite-sent timestamps idempotently, and the onboarding card can render
--      the right state per profile.
--   2. New table community_access_events – an append-only audit trail of every
--      grant / revoke / invite-resend event, so we can reconstruct who had
--      access when (Core tier is the source of truth; this table is the log).
--
-- The platform-specific bot/API automation (auto-add on grant, auto-remove on
-- revoke) is intentionally out of scope for this migration. Until the operator
-- picks Skool vs Discord and provides bot credentials, "revoke" is a logged
-- event the operator acts on manually. Cohort is < 50 members so this is fine.

set local search_path = public, pg_catalog;

-- ---------------------------------------------------------------------------
-- profiles: community access columns
-- ---------------------------------------------------------------------------
-- All four columns are NULLABLE and default-null. Pre-Core profiles and
-- Core profiles created before this migration ran are correctly modelled as
-- "never granted" (the webhook back-fills on the next subscription event).

alter table public.profiles
  add column if not exists community_access_granted_at  timestamptz,
  add column if not exists community_access_revoked_at  timestamptz,
  add column if not exists community_invite_sent_at     timestamptz,
  add column if not exists community_invite_sent_count  integer not null default 0;

-- Partial index for the operator dashboard query "who has live community access".
-- Granted AND not revoked since the most recent grant.
create index if not exists profiles_community_access_live_idx
  on public.profiles (community_access_granted_at desc)
  where community_access_granted_at is not null
    and (community_access_revoked_at is null
         or community_access_revoked_at < community_access_granted_at);

-- ---------------------------------------------------------------------------
-- community_access_events: append-only audit trail
-- ---------------------------------------------------------------------------
-- One row per state change. Multiple grants per profile are possible (cancel
-- then re-subscribe), so this is NOT keyed by profile_id – it's an event log.
--
-- event_type semantics:
--   granted          → Core checkout completed or first invoice cleared
--   revoked          → customer.subscription.deleted fired
--   invite_sent      → invite email left the queue
--   invite_failed    → invite email send threw (Resend down, bad address)
--   invite_resent    → operator or onboarding card triggered a manual resend
--
-- source values: stripe_webhook | onboarding_resend | operator_manual

create table if not exists public.community_access_events (
  id                 uuid primary key default gen_random_uuid(),
  profile_id         uuid references public.profiles(id) on delete set null,
  email              text not null,
  event_type         text not null check (event_type in (
                       'granted',
                       'revoked',
                       'invite_sent',
                       'invite_failed',
                       'invite_resent'
                     )),
  source             text,
  stripe_customer_id text,
  stripe_event_id    text,
  invite_url         text,
  platform           text,
  detail             jsonb,
  created_at         timestamptz not null default now()
);

create index if not exists community_access_events_profile_idx
  on public.community_access_events (profile_id, created_at desc);

create index if not exists community_access_events_email_idx
  on public.community_access_events (email, created_at desc);

create index if not exists community_access_events_type_idx
  on public.community_access_events (event_type, created_at desc);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
-- The webhook writes via the service-role client which bypasses RLS. The
-- app reads on behalf of signed-in users; profile rows are already locked
-- down by the existing profiles RLS (user_id = auth.uid()). community_access_events
-- is operator-only – no end-user surface reads it, so we lock all roles out
-- and rely on the service-role client for reads.

alter table public.community_access_events enable row level security;

drop policy if exists community_access_events_no_public_select
  on public.community_access_events;

create policy community_access_events_no_public_select
  on public.community_access_events
  for select
  using (false);

-- ---------------------------------------------------------------------------
-- Notes for the operator (Maryan)
-- ---------------------------------------------------------------------------
-- Apply via Supabase Dashboard → SQL Editor (or `supabase db push` once the
-- CLI is wired up). The webhook + community.ts helpers are DEFENSIVE: if this
-- migration has not run yet in a given environment, the helpers swallow the
-- "column does not exist" errors so billing keeps flowing. Once the migration
-- is live, the events backfill on the next Core subscription event per user.
