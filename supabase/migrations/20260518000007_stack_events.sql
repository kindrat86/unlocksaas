-- ============================================================================
-- Funnel Stack — cross-funnel attribution event store
-- ============================================================================
-- Source: DotCom Secrets Secret #27 (Funnel Stacking) / strategy/funnel-stack.md.
--
-- The eight-layer stack (ATTENTION → DIAGNOSIS → STARTER → CORE → LONG_FORM
-- → IN_PRODUCT → ASCENSION → AFFILIATE plus the lateral EXIT_INTENT layer)
-- is documented in strategy/funnel-stack.md. The `stack-attribution.ts` lib
-- writes sticky cookies in middleware and stamps Stripe session.metadata at
-- checkout. The webhook reads the metadata back and persists conversions
-- here so per-path conversion rates are computable from one table without a
-- PostHog round-trip.
--
-- The deferral condition documented in strategy/funnel-stack.md was "until
-- Layer 4 (long-form $49 sales page) ships." That landed in Sprint 3 at
-- /machine-sales (995 lines). The deferral is satisfied; this migration
-- ships the table.
--
-- Layer encoding (mirrors StackLayer enum in app/src/lib/stack-attribution.ts):
--   0 attention      cold traffic, top of stack
--   1 diagnosis      Free Diagnostic squeeze / Reverse Squeeze
--   2 starter        $1 Starter Unboxing — ANCHOR FUNNEL
--   3 core           OTO → $49 Machine subscription
--   4 long_form      $49 Machine sales page (cold-traffic direct ascension)
--   5 in_product     /machine member area
--   6 ascension      Verified Builder rerun / community (Phase 2)
--   7 affiliate      Affiliate Army (Phase 3)
--   8 exit_intent    Bail recovery lateral (Phase 2)
--
-- Event taxonomy: 'enter' | 'bridge_out' | 'bridge_in' | 'convert' | 'exit'.
-- One row per discrete event. `enter` is written by the client-side beacon
-- (/api/stack/event) on first view of a layer; `convert` is written by the
-- Stripe webhook on checkout.session.completed; `bridge_*` are written when
-- a known UTM/link/CTA crosses two layers explicitly; `exit` is reserved for
-- Layer 8 (Phase 2).
--
-- RLS posture:
--   - service_role: full read/write (webhook + cron)
--   - authenticated: SELECT on own subject rows only (a Verified Builder can
--     see their own attribution if we choose to surface it later; opt-in)
--   - anon: INSERT only, gated by /api/stack/event handler shape validation +
--     soft per-subject rate limit at the API layer (not at DB level — that
--     belongs in middleware)
-- ============================================================================

set local search_path = public, pg_catalog;

create table if not exists public.stack_events (
  id uuid primary key default gen_random_uuid(),
  subject_id text not null,
  layer integer not null check (layer between 0 and 8),
  event text not null
    check (event in ('enter', 'bridge_out', 'bridge_in', 'convert', 'exit')),
  source_layer integer check (source_layer between 0 and 8),
  destination_layer integer check (destination_layer between 0 and 8),
  conversion_event text
    check (
      conversion_event is null
      or conversion_event in (
        'starter_purchase',
        'core_purchase',
        'ascension_purchase',
        'community_purchase'
      )
    ),
  -- The full stack path at the time of this event, as a JSON-stringified
  -- array of layer integers. This is a denormalization on purpose: the path
  -- is needed for path-level conversion analysis without recomputing from
  -- the event log every query. Cap mirrors the cookie cap (32) — anything
  -- longer would imply a bot.
  path text,
  ab_variant text
    check (ab_variant is null or ab_variant in ('verified_builder', 'paid_builder')),
  affiliate_slug text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  -- Stripe session id when event = 'convert'. Lets us join back to charges
  -- without re-querying Stripe. NULL otherwise.
  stripe_session_id text,
  created_at timestamptz not null default now()
);

-- Lookup by subject for "show me this visitor's full path". Created_at second
-- so the ORDER BY in the read recipe is index-driven.
create index if not exists stack_events_subject_id_idx
  on public.stack_events (subject_id, created_at);

-- Lookup by (layer, event) for "how many converted at the CORE layer this week".
create index if not exists stack_events_layer_event_idx
  on public.stack_events (layer, event, created_at desc);

-- Affiliate payout queries: "all conversions attributable to slug X in window".
create index if not exists stack_events_affiliate_idx
  on public.stack_events (affiliate_slug, created_at desc)
  where affiliate_slug is not null;

-- Conversion sub-index for the read recipe (`event='convert'` is the hot path).
create index if not exists stack_events_conversions_idx
  on public.stack_events (conversion_event, created_at desc)
  where event = 'convert';

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.stack_events enable row level security;

-- service_role bypasses RLS by definition — no policy needed for the
-- webhook/cron writes. But anon callers (the /api/stack/event beacon) need
-- INSERT specifically.
drop policy if exists stack_events_anon_insert on public.stack_events;
create policy stack_events_anon_insert
  on public.stack_events
  for insert
  to anon
  with check (
    -- Shape constraints already enforced by CHECK constraints above. The RLS
    -- policy just permits the INSERT itself. Defense in depth: only allow
    -- events that look like browser-originated bridges, not server-side
    -- conversions. The webhook uses service_role for those.
    event in ('enter', 'bridge_out', 'bridge_in', 'exit')
    and length(subject_id) between 8 and 64
  );

-- Authenticated users can read their own rows only (if/when we surface the
-- visitor's own path in-app). Subject_id is derived from a different cookie
-- than auth, but for the rare case where a Verified Builder asks "what was
-- my path", an admin-tool query can join through profiles.stack_subject.
-- For now: deny by default; the operator queries via service_role in the
-- Supabase SQL editor.
drop policy if exists stack_events_authenticated_select on public.stack_events;
create policy stack_events_authenticated_select
  on public.stack_events
  for select
  to authenticated
  using (false);

-- ---------------------------------------------------------------------------
-- Comment for `\d` discoverability + future audits.
-- ---------------------------------------------------------------------------
comment on table public.stack_events is
  'Cross-funnel attribution event store. Source: DotCom Secrets Secret #27 / strategy/funnel-stack.md. One row per layer-level event (enter / bridge_out / bridge_in / convert / exit). Conversions are written by the Stripe webhook; bridge/enter/exit are written by the /api/stack/event beacon.';
