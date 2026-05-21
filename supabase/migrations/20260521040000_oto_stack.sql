-- Post-Starter monetization stack (Brunson audit Action #4, 2026-05-21).
--
-- Adds four new payment kinds to billing_payments + a lifetime community
-- access flag on profiles so the $1 SLO cart can carry an order bump and
-- the thank-you page can chain into a $97 OTO ▸ $27 downsell ▸ $297
-- lifetime sequence. See app/src/lib/offers.ts for the offer catalog.
--
-- Migration is additive and idempotent. Safe to re-apply.

set local search_path = public, pg_catalog;

-- ---------------------------------------------------------------------------
-- billing_payments.kind: extend check constraint
-- ---------------------------------------------------------------------------
-- Existing values: 'starter','core_initial','core_renewal','other'.
-- We add four discrete kinds matching the OfferId union in app/src/lib/offers.ts.
-- Keeping each kind explicit (vs. lumping under 'other') lets the operator
-- pivot AOV by offer in plain SQL: select kind, sum(amount_cents) from ...
--
-- The constraint name is the implicit one Postgres minted for the original
-- declaration (billing_payments_kind_check). We drop-and-recreate to expand it.

alter table public.billing_payments
  drop constraint if exists billing_payments_kind_check;

alter table public.billing_payments
  add constraint billing_payments_kind_check
  check (kind in (
    'starter',
    'core_initial',
    'core_renewal',
    'starter_bump',
    'oto_vault',
    'oto_downsell',
    'oto_lifetime',
    'other'
  ));

comment on constraint billing_payments_kind_check on public.billing_payments is
  'Discriminator for the value-ladder rung that produced this payment. Expanded 2026-05-21 to include the order-bump + 3 OTO kinds (offers.ts).';

-- ---------------------------------------------------------------------------
-- profiles: lifetime community access
-- ---------------------------------------------------------------------------
-- The $297 OTO #2 ("Lifetime Verified Builders") grants permanent room access
-- that does not depend on the Core subscription. We stamp the timestamp here
-- and let the existing community_access_granted_at signal stay subscription-
-- linked. lib/community.ts will treat (community_lifetime_at IS NOT NULL) as a
-- short-circuit that prevents revoke-on-cancel from kicking the user out.

alter table public.profiles
  add column if not exists community_lifetime_at timestamptz;

create index if not exists profiles_community_lifetime_idx
  on public.profiles (community_lifetime_at desc)
  where community_lifetime_at is not null;

comment on column public.profiles.community_lifetime_at is
  'Set when the user buys the $297 lifetime Verified Builders OTO. When non-null, subscription.deleted MUST NOT revoke community access (community.ts enforces).';

-- ---------------------------------------------------------------------------
-- Done. No data migration needed – existing rows continue to validate against
-- the new constraint because every prior kind value is still in the allowed
-- set. New OTO rows land cleanly from the webhook.
-- ---------------------------------------------------------------------------
