-- Rung 2 (Repeatable Revenue Layer) — public interest-signal data layer.
--
-- Closes the audit gap on DCS Secret #2 (The Value Ladder) by giving the
-- "unprompted ask" activation gate a real data layer instead of an
-- inbox-counting eyeball read. The gate is documented in
-- strategy/decisions/rung-2-repeatable-revenue.md:
--
--     "At least 1 Core customer has explicitly asked, unprompted, for a
--      'next layer.' No supply without demand signal."
--
-- This table captures that signal. A visitor on /repeatable can click "tell
-- me when this opens" and we record the row. The activation gate fires when
-- the count of rows from verified Core customers reaches the threshold —
-- the operator reads `repeatable_interest_signal` view during the Friday
-- Audible Call (workbook 04 §8b).
--
-- IMPORTANT: this is NOT a waitlist with a follow-up sequence. It is a
-- demand signal. The visitor receives no scheduled emails from joining,
-- only the one-time confirmation the API route returns. Brunson rule held:
-- no fake door, no manufactured urgency, no countdown.
--
-- Schema mirrors diagnostic_leads / cart_abandonment_subscribers
-- conventions: gen_random_uuid id, lower(email) dedupe, updated_at trigger.

set local search_path = public, pg_catalog;

-- ---------------------------------------------------------------------------
-- repeatable_interest
-- ---------------------------------------------------------------------------
create table if not exists public.repeatable_interest (
  id           uuid primary key default gen_random_uuid(),
  email        text not null,
  -- Optional one-liner explaining why they want this layer. Operator reads
  -- these verbatim during the Friday Audible Call — the language goes into
  -- the workbook 02 Rung 2 build spec when activation fires.
  message      text,
  -- Free-form source token. Same convention as soap_opera_subscribers.source
  -- and parables opt-in placement tracking. Lets us tell apart who clicked
  -- from /repeatable directly vs from the in-product celebration card
  -- (/machine/verified) vs from the ladder diagram on /machine-sales.
  source       text not null default 'repeatable_page',
  -- A/B identity variant snapshot at submission time. Reads from the
  -- existing cookie (workbook 05 §7).
  identity_variant text check (identity_variant in ('verified_builder','paid_builder') or identity_variant is null),
  -- Is the submitter already a Core customer? Joined-at-insert from
  -- profiles.tier on the API side so we don't need a runtime join for the
  -- signal count. The activation gate cares about Core-customer demand,
  -- not cold-traffic demand.
  is_core_customer boolean not null default false,
  -- Inbound metadata (parity with diagnostic_leads).
  user_agent   text,
  ip           inet,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- One row per email. Re-submit updates message/source/identity_variant.
create unique index if not exists repeatable_interest_email_uq
  on public.repeatable_interest (lower(email));

create index if not exists repeatable_interest_created_idx
  on public.repeatable_interest (created_at desc);

-- Partial index for the activation-gate read: "how many verified Core
-- customers have asked for the next layer?"
create index if not exists repeatable_interest_core_idx
  on public.repeatable_interest (created_at desc)
  where is_core_customer = true;

-- Reuse the existing set_updated_at trigger function (defined in 0001).
create trigger repeatable_interest_set_updated_at
  before update on public.repeatable_interest
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- repeatable_interest_signal — the Friday Audible Call read.
-- ---------------------------------------------------------------------------
-- Single-row view answering: how close are we to the Rung 2 activation
-- gate? Spec gate is "at least 1 Core customer has explicitly asked,
-- unprompted." We report Core-asks separately from cold-asks so the
-- operator does not conflate cold curiosity with paying-customer demand.

create or replace view public.repeatable_interest_signal as
select
  count(*)                                                  as total_asks,
  count(*) filter (where is_core_customer)                  as core_asks,
  count(*) filter (where not is_core_customer)              as cold_asks,
  count(*) filter (where created_at >= now() - interval '7 days')  as asks_last_7d,
  count(*) filter (where created_at >= now() - interval '30 days') as asks_last_30d,
  max(created_at)                                           as most_recent_ask_at,
  -- The single-bit activation signal: per spec gate #2, only Core-customer
  -- asks count. The gate fires at >=1.
  (count(*) filter (where is_core_customer) >= 1)           as gate_2_fired
from public.repeatable_interest;

comment on view public.repeatable_interest_signal is
  'Rung 2 activation-gate read. Surfaces total / Core / cold ask counts and gate_2_fired flag for the Friday Audible Call. Spec: strategy/decisions/rung-2-repeatable-revenue.md, gate #2.';

-- ---------------------------------------------------------------------------
-- RLS — anon may INSERT (the form is public), nobody but service_role reads.
-- ---------------------------------------------------------------------------
-- Pattern mirrors diagnostic_leads: the /api/repeatable-interest route uses
-- the admin client for the insert (so it can join is_core_customer from
-- profiles), but we still enable RLS + an anon INSERT policy as defense in
-- depth — if the route is ever refactored to use the anon client, the
-- policy keeps the insert path working without re-opening the table.
alter table public.repeatable_interest enable row level security;

revoke select, update, delete on public.repeatable_interest from anon, authenticated;

-- Anon-insert policy with a shape-validating WITH CHECK. Drops obviously
-- malformed payloads at the DB boundary. Real validation still happens in
-- the API route.
drop policy if exists repeatable_interest_anon_insert on public.repeatable_interest;
create policy repeatable_interest_anon_insert
  on public.repeatable_interest
  for insert
  to anon, authenticated
  with check (
    email is not null
    and length(email) between 5 and 320
    and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    and (message is null or length(message) <= 2000)
    and source is not null
    and length(source) <= 64
    and (identity_variant is null or identity_variant in ('verified_builder','paid_builder'))
    -- Cold inserts must NEVER claim Core-customer status — the API route
    -- enriches this server-side from the profiles table. If the policy
    -- allowed an attacker to set is_core_customer=true via the anon client,
    -- they could ghost-fire the activation gate.
    and is_core_customer = false
  );

-- Service-role bypasses RLS by design (postgres role). The signal view is
-- service-role only because it aggregates revenue-adjacent demand data.
revoke select on public.repeatable_interest_signal from anon, authenticated;

comment on table public.repeatable_interest is
  'Rung 2 demand-signal capture (DCS Secret #2 / strategy/decisions/rung-2-repeatable-revenue.md). Visitors on /repeatable record interest; activation gate fires when a Core customer asks unprompted. NOT a waitlist — no follow-up sequence is triggered by joining.';
