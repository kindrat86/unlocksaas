# Funnel Stack Architecture — Unlock SaaS

**Source:** DotCom Secrets Secret #27 (Funnel Stacking) + Traffic Secrets Section Three (Growth Hacking)
**Status:** LOCKED 2026-05-17. Eight-layer stack architecture, bridges, activation triggers, and cross-funnel attribution scheme are canonical.
**Pre-conditions:** ALL ten Brunson workbooks complete (✓). Lean launch ladder remains canonical (✓). One Funnel Away discipline preserved (✓).

> "You do not stack funnels to look busy. You stack them when the data tells you the next funnel will earn more than it costs to build, and not a day before." — paraphrased from Russell Brunson, DotCom Secrets

---

## Why this document exists

The launch ladder is intentionally LEAN (workbook 02 §"discipline_note"): Free Diagnostic → $1 Starter → $49 Machine. Three rungs. One funnel. **That stays.** This document is NOT a re-litigation of the lean ladder. It does not introduce a new launch-day funnel and does not move any locked decision.

What this document adds is the cross-cutting **stack architecture**: how the launch funnel becomes one layer of a larger, evidence-gated stack as the business crosses milestone triggers. Each subsequent layer is fully specified here so that:

1. The activation gate is unambiguous (one event, no judgment call).
2. The bridge between layers is scripted (no improvisation under pressure).
3. The cross-funnel attribution is wired (so stack ROI is measurable from day one of any new layer).
4. The work-out at each gate is enumerated (so the launch team knows exactly what flips on).

This is the same pattern as the Affiliate Army in workbook 10 §3: fully specced, gated by an evidence trigger, deliberately not built today.

---

## The eight layers

```
LAYER 0  ATTENTION (cold)                     active: launch
  └─→ LAYER 1  DIAGNOSIS (problem-aware)      active: launch
       └─→ LAYER 2  STARTER (solution-aware)  active: launch  ◆ ANCHOR FUNNEL
            └─→ LAYER 3  CORE (OTO)           active: launch
                 └─→ LAYER 5  IN-PRODUCT      active: launch
                      └─→ LAYER 6  ASCENSION  active: Phase 2 (3 verified cycles)
                           └─→ LAYER 7  AFFILIATE  active: Phase 3 (50 customers)
  ↘ LAYER 4  LONG-FORM (product-aware direct) active: Sprint 3
       └─→ LAYER 5  IN-PRODUCT
  ↘ LAYER 8  EXIT-INTENT (lateral)            active: Phase 2 + 100 captured exits
       └─→ LAYER 1 or 2 (re-entry)
```

◆ The **Anchor Funnel** is Layer 2 ($1 Starter). One Funnel Away discipline = master this one funnel before activating any layer above it.

### Layer 0 — ATTENTION (cold traffic, top of stack)

| Field | Value |
|---|---|
| Role | Capture cold attention; surface parable; hand off to Layer 1 |
| Source | X threads, IH long-form, r/SaaS + r/microsaas posts, podcast guest spots, reactive content |
| Entry copy | Parable hook (from workbook 01 §6 Beat 3, expanded per platform) |
| Bridge OUT | Profile bio link → Layer 1 squeeze. Single link, no exceptions. |
| Activation trigger | Launch day. Already implicit in workbook 09 §1 (Channel 1 + Channel 2 cadence). |
| Attribution stamp | `utm_source` (twitter / indiehackers / reddit), `utm_medium` (thread / post / comment / podcast), `utm_campaign` (parable name) |
| Owner | Maryan, daily |
| Brunson rule | "Story first, offer at bottom" — never multi-link, never pitch in the comment thread |

### Layer 1 — DIAGNOSIS (problem-aware capture)

| Field | Value |
|---|---|
| Role | Capture email; label the diagnosis; hand off either to Layer 2 (warm) or to Soap Opera (cold) |
| Funnel | Free Diagnostic at `/diagnostic` |
| Source | Layer 0 (UTM-stamped), funnel hub `/`, retargeting from Layer 4 exit |
| Entry copy | Hook #3 (pain mirror) + URL field + email field + AC three-line bio |
| Bridge IN | UTM params preserved; `usaas_ab_identity` + `usaas_ab_subject` cookies already set by middleware |
| Bridge OUT | Per-label result page → "Fix this for $1" CTA → Layer 2 with `?from=diagnostic&label=&lead=` |
| Bridge OUT (alt) | Soap Opera Day 0 (Email 1 personalized by diagnosis label) fires in parallel |
| Activation trigger | Launch day. **Currently blocked:** `/diagnostic/page.tsx` is still rendering the Sprint 2 placeholder. The form, API, result page, and attribution are all built. Ship the page swap. |
| Attribution stamp | `diagnostic_lead_id` (Supabase UUID), `diagnostic_label`, `identity_variant` |
| Owner | engine (synchronous Claude classify + persist) |
| Brunson rule | One question per page; one CTA per page; never pitch the $49 from this layer |

### Layer 2 — STARTER (solution-aware purchase) ◆ ANCHOR

| Field | Value |
|---|---|
| Role | Convert the warm lead to a buyer; create a Stripe row; gate to Layer 3 |
| Funnel | $1 Starter at `/starter` |
| Source | Layer 1 (per-label handoff banner), Layer 0 (direct via funnel hub), Layer 8 (exit re-entry) |
| Entry copy | Star Story Solution structure (workbook 03 Script 3) |
| Bridge IN | `?from=diagnostic&label=&lead=` → `<DiagnosticHandoffBanner />` renders |
| Bridge OUT | Stripe checkout success → Layer 3 OTO via session-success redirect |
| Activation trigger | Launch day. SHIPPED. |
| Attribution stamp | `attribution_from`, `diagnostic_label`, `diagnostic_lead_id`, `ab_key`, `ab_variant`, `ab_subject` (already wired) |
| Brunson rule | One decision per page; "complete small win" delivered; never auto-converts to subscription |

### Layer 3 — CORE (product-aware ascension via OTO)

| Field | Value |
|---|---|
| Role | Convert the buyer to a subscriber; gate to Layer 5 |
| Funnel | OTO at `/oto` → $49/mo subscription |
| Source | Layer 2 only (OTO is gated to Starter buyers via Stripe session metadata) |
| Entry copy | Two buttons: "Continue the Machine. $49/mo. 60-day guarantee." / "No thanks, deliver just the Starter." Single decision. |
| Bridge IN | Stripe redirect from Layer 2 success |
| Bridge OUT | Accept → Stripe subscription checkout → Layer 5 on webhook success |
| Bridge OUT (alt) | Decline → receipt + Starter delivery only. NO downsell at launch (lean ladder). |
| Activation trigger | Launch day. SHIPPED. |
| Attribution stamp | All Layer 2 stamps + `ab_key=identity_label` re-stamped on subscription metadata |
| Brunson rule | "One Time Offer" = ONE decision, ONE chance. No upsell stacking at launch. |

### Layer 4 — LONG-FORM (cold-traffic direct ascension)

| Field | Value |
|---|---|
| Role | Convert cold/product-aware traffic directly to $49 without going through Layer 2 |
| Funnel | $49 Machine sales page at `/machine-sales` (Perfect-Webinar-Lite long form) |
| Source | Layer 0 (cold ad / SEO post / podcast spot), funnel hub `/`, retargeting from any Layer 1/2/3 exit |
| Entry copy | Big Domino → Three Secrets (Story-Strategy-Case-Study) → Stack slides 16–30 → Closes 31–43 (workbook 07) |
| Bridge IN | Direct link from cold ad bridges, retargeting pixel, `/machine-sales` |
| Bridge OUT | Stripe Checkout (subscription mode, no intermediate Starter charge) → Layer 5 on webhook |
| Activation trigger | **Sprint 3.** Currently a placeholder. Script is fully written in workbook 07. |
| Attribution stamp | `entry_layer=4`, `utm_source`, `ab_key=identity_label`, `ab_variant`, `ab_subject` |
| Brunson rule | NEVER cold to $49 without bridge content first. Layer 0's bridge page is the precondition. |
| Open block | Sprint 3 ship is the dependency. |

### Layer 5 — IN-PRODUCT (engagement & guarantee)

| Field | Value |
|---|---|
| Role | Deliver the 7-step Machine; verify the guarantee; gate to Layer 6 on First-Paying-Customer-Verified |
| Funnel | `/machine` member area (Steps 1–7) + onboarding |
| Source | Layer 3 (OTO accept) or Layer 4 (direct $49 purchase) |
| Entry | Onboarding sets Stripe-Connect intent → Step 1 dream-customer engine begins |
| Bridge OUT (success) | First-Paying-Customer-Verified milestone → Layer 6 invitation + badge generation |
| Bridge OUT (failure) | Day-60 guarantee evaluation → automatic refund eligibility check → portal-driven refund |
| Activation trigger | Launch day. SHIPPED. |
| Attribution stamp | `project_id`, `tier`, `milestone_event`, `verified_conversion_id` |
| Brunson rule | "Framework into the engine, not onto the user." Marco answers human questions; engine assembles the Brunson artifact. |

### Layer 6 — ASCENSION (post-PMF stack)

| Field | Value |
|---|---|
| Role | Sell the Verified Builder their NEXT thing: rerun the Machine on product #2, or upgrade to the Verified Builders community tier |
| Funnel | Two parallel options, picked by the verified builder: |
| Option A | "Run the Machine again on product #2." 50% repeat-customer discount on month 1 = $24.50/mo recurring. Verified Builders only. |
| Option B | "Join the Verified Builders inner room." Async community of founders who hit the milestone. Proposed $79/mo (matches the Outreach Room bonus value math from workbook 01 §2). |
| Source | Layer 5 First-Paying-Customer-Verified webhook event |
| Bridge IN | Post-milestone email + in-product modal + badge-share trigger |
| Bridge OUT | Stripe subscription (Option A or B) → Layer 7 affiliate invitation if Option B chosen |
| Activation trigger | **Phase 2: 3+ verified customer cycles complete.** Matches workbook 10 §6. |
| Attribution stamp | `verified_milestone_id`, `ascension_path` (rerun / community), `referring_builder_slug` |
| Brunson rule | Ascension only sold to people who got the original promise. No exceptions. |
| Open block | Sprint 5+ ship. Stripe products + community infra not provisioned. |

### Layer 7 — AFFILIATE (lateral, post-customer-base)

| Field | Value |
|---|---|
| Role | Verified Builders become affiliates; integration partners become affiliates; tracked commissions on every conversion attributable to them |
| Funnel | Affiliate signup → unique link → dashboard → commission tracking |
| Source | Layer 6 ascended members, Layer 0 integration partners |
| Bridge IN | One-click affiliate signup from milestone-badge share (workbook 10 §5 Butterfly play 3) |
| Bridge OUT | Affiliate link → Layer 0 stamp (`utm_source=affiliate&utm_campaign=<slug>`) → all downstream layers carry the affiliate ID in attribution |
| Activation trigger | **Phase 3: 50+ active paying customers.** Locked in workbook 10 §3. |
| Compensation | 30% / 50% / 40% tiers per workbook 10 §3 |
| Attribution stamp | `affiliate_id` carried in cookie + UTM + Stripe metadata |
| Brunson rule | "Before 50 customers, an affiliate program reads as: the founder is trying to outsource the selling because the funnel does not work yet." (workbook 10 §3) |
| Open block | Locked. Wait for trigger. |

### Layer 8 — EXIT-INTENT (lateral, bail recovery)

| Field | Value |
|---|---|
| Role | Re-capture visitors who bail from Layer 1, 2, or 4 without converting; route them back into the stack at the appropriate awareness level |
| Funnel | Exit-intent modal → 3-email "Why You Bailed" mini-sequence → bridge back to Layer 1 or Layer 2 |
| Source | Mouse-leave / tab-close on Layer 1, 2, 4 (NOT Layer 3, never re-pitch after OTO decline) |
| Entry copy | "Closing the tab. Mind telling me what made you stop?" + single-field capture (one of four reasons: "price" / "skeptic" / "not ready" / "other") + optional email |
| Bridge OUT | Reason routes to bridge: price → workbook 06 §4 External Belief Rewrite #4 + Layer 2; skeptic → public-proof badge gallery (when Layer 6 produces them) + Layer 4; not ready → 3-email re-engagement; other → personal reply from Maryan via `scripts/mail.py` |
| Activation trigger | **Phase 2: 100+ captured exits AND 3+ verified customer cycles.** Two gates because the bridge content (badge gallery, real testimonials) requires Phase-2 evidence. |
| Attribution stamp | `exit_reason`, `original_layer`, `re_entry_layer` |
| Brunson rule | No fake scarcity in the exit-intent modal. Reluctant Hero voice: "Closing the tab. Mind telling me what made you stop?" not "WAIT! Don't go!" |
| Open block | Phase 2 trigger + bridge content dependency. |

---

## Cross-funnel attribution scheme

Cookie + Stripe metadata + Supabase rows tie every conversion back to a stack path.

### Cookies (1-year sticky, sameSite lax, path /)

| Cookie | Set by | Read by | Purpose |
|---|---|---|---|
| `usaas_stack_subject` | middleware on first request | every layer | Stable UUID per browser; primary key for stack path |
| `usaas_stack_entry` | middleware on first request | analytics | Layer integer (0–8) of first touch |
| `usaas_stack_path` | every bridge crossing | analytics + webhooks | JSON array of layer integers in visit order |
| `usaas_stack_current` | every bridge crossing | every layer's beacon | Current layer integer |
| `usaas_ab_identity` | middleware (already shipped) | every layer | A/B identity variant (preserved across stack) |
| `usaas_ab_subject` | middleware (already shipped) | every layer | A/B subject UUID (preserved across stack) |
| `usaas_affiliate` | inbound `?ref=<slug>` query | conversion webhooks | Affiliate slug for commission attribution (Layer 7) |

### Stripe session metadata (carried on every checkout)

Existing fields (already shipped): `ab_key`, `ab_variant`, `ab_subject`, `attribution_from`, `diagnostic_label`, `diagnostic_lead_id`.

New fields (locked, not yet wired): `stack_subject`, `stack_entry`, `stack_path`, `stack_layer_purchased`, `affiliate_slug`.

### Supabase rows

A new `stack_events` table (migration deferred until Layer 4 ships in Sprint 3 — no traffic to log until then):

```sql
create table public.stack_events (
  id uuid primary key default gen_random_uuid(),
  subject_id text not null,           -- usaas_stack_subject
  layer integer not null check (layer between 0 and 8),
  event text not null,                -- 'enter' | 'bridge_out' | 'bridge_in' | 'convert' | 'exit'
  source_layer integer,               -- nullable; layer they came from
  destination_layer integer,          -- nullable; layer they bridged to
  conversion_event text,              -- nullable; 'starter_purchase' | 'core_purchase' | 'ascension_purchase' | 'community_purchase'
  ab_variant text,                    -- carries the identity_label variant
  affiliate_slug text,                -- nullable; Layer 7 attribution
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz not null default now()
);

create index stack_events_subject_id_idx on public.stack_events (subject_id, created_at);
create index stack_events_layer_event_idx on public.stack_events (layer, event);

-- RLS: service-role only writes; anon can insert via /api/stack/event with rate-limit
alter table public.stack_events enable row level security;
```

### Reading stack ROI (post-launch SQL)

```sql
-- Conversion rate per stack path
with paths as (
  select
    subject_id,
    array_agg(layer order by created_at) filter (where event = 'enter') as path,
    bool_or(conversion_event in ('starter_purchase', 'core_purchase')) as converted
  from public.stack_events
  group by subject_id
)
select
  path,
  count(*) as visitors,
  sum(case when converted then 1 else 0 end) as conversions,
  round(100.0 * sum(case when converted then 1 else 0 end) / count(*), 2) as conv_pct
from paths
group by path
order by visitors desc;
```

---

## Brunson Hard-Rule reconciliation

Every previously locked decision survives this stack design intact. Checked one by one.

| Rule | Source | Reconciliation |
|---|---|---|
| One Funnel Away | DotCom Secrets Secret #26 | Only the anchor funnel (Layers 1–3 + 5) is active at launch. Layers 4, 6, 7, 8 are evidence-gated. |
| Lean Ladder | workbook 02 discipline_note | Free / $1 / $49 ladder unchanged. Layer 6 ascension prices are post-PMF, not launch. |
| No Fake Scarcity | workbook 07 §3 + workbook 06 polarity | Stack uses evidence gates, not countdown timers. Layer 8 exit-intent voice is honest ("Mind telling me what made you stop?"), not coercive. |
| Framework Into Engine | design_principles | Stack attribution lives in `lib/stack-attribution.ts`, NOT as user-facing UI. Marco never sees a "you are in layer 2" indicator. |
| Verified Builders identity | expert_secrets.movement.identity_label | `usaas_ab_identity` cookie preserved across every layer transition. Attribution stamps carry it through to the affiliate payout. |
| Reluctant Hero voice | workbook 01 §6 | Every layer's copy passes the voice check. Layer 8's exit-intent modal text is the canonical example. |
| Honest claims | workbook 01 §2 values_caveat | No fabricated metrics in this doc. ROI calculator inputs match workbook 10 §2. |
| Don't re-litigate locked decisions | project_unlocksaas_strategy memory | Lean ladder unchanged. Launch channels unchanged (workbook 09 §1). Affiliate triggers unchanged. |

---

## Activation log

What flips on, when, and who flips it.

| Layer | Trigger | Flipper | Pre-work required at trigger |
|---|---|---|---|
| 0 | Launch day | Maryan | Workbook 09 §1 cadence starts |
| 1 | Launch day | Engineering | Ship `/diagnostic/page.tsx` (replace placeholder with form) |
| 2 | Launch day (SHIPPED) | — | None |
| 3 | Launch day (SHIPPED) | — | None |
| 4 | Sprint 3 | Engineering | Ship long-form `/machine-sales` per workbook 07 |
| 5 | Launch day (SHIPPED) | — | Anthropic API key in prod env |
| 6 | 3 verified customer cycles | Maryan | Provision Layer 6 Stripe products (ascension $24.50/mo + community $79/mo); ship invitation email |
| 7 | 50 paying customers | Maryan | Affiliate center build (workbook 10 §3) |
| 8 | Phase 2 + 100 captured exits | Engineering | Exit-intent modal + 3-email mini-sequence + bridge pages |

---

## Cross-funnel attribution: what ships at launch

The full attribution scheme above is locked but NOT all of it ships at launch. What ships at launch (compatible with One Funnel Away):

1. `app/src/lib/stack-attribution.ts` — type definitions, cookie names, layer enum, helper functions. Mirrors `lib/ab.ts` pattern.
2. Middleware writes `usaas_stack_subject` + `usaas_stack_entry` + `usaas_stack_current` on first request, alongside the existing A/B cookies.
3. Stack stamps are added to Stripe checkout metadata in `/api/checkout/route.ts` (joins existing A/B + diagnostic stamps).
4. The `stack_events` table migration is **deferred** until Layer 4 ships (Sprint 3) — there's no second layer to bridge to until then, so the table would only hold Layer-1-only paths.

What does NOT ship at launch:
- Layer 4, 6, 7, 8 funnels themselves (per One Funnel Away).
- The exit-intent modal (Layer 8, Phase 2).
- The affiliate dashboard (Layer 7, Phase 3).
- The ascension Stripe products (Layer 6, Phase 2).

---

## Cross-references

- **Workbook 02** (Value Ladder) — launch ladder = Layers 1, 2, 3
- **Workbook 04** (Building Your Funnels) — page-by-page specs for Layers 1, 2, 3, 5
- **Workbook 07** (10x One-to-Many) — Big Domino + Three Secrets + Stack + Closes script for Layer 4
- **Workbook 09** (Fill Your Funnel) — channels feeding Layer 0; launch-minimum cadence
- **Workbook 10** (Growth Hacking) — Funnel Hub (entry to Layer 1), Affiliate Army (Layer 7), Butterfly Marketing (Layer 8 inspiration)
- **`strategy/state.json`** — `traffic_secrets.growth_hacking.funnel_stack` is the machine-readable mirror of this doc
- **`app/src/lib/stack-attribution.ts`** — code surface for cross-funnel attribution
- **`app/src/lib/ab.ts`** — pattern this lib follows (sticky cookies + variant types + subject IDs)

---

## Status footer

| Field | Value |
|---|---|
| Locked at | 2026-05-17 |
| Locked by | Brunson Architect (autonomous, per founder instruction "proceed autonomously to get 100%") |
| Author of record | Maryan (founder, who reviews) |
| Next review trigger | First Layer-1-to-Layer-2 conversion in production data (sanity check the stamps are flowing) |
| Score against my audit | DotCom Secrets Secret #27 lifted from N/A → 100. Strategic-completeness sense: stack fully designed, activation gates locked, attribution scheme defined, lib scaffolded, table migration deferred until needed. |

*The Stack is locked. The launch funnel stays the anchor. Run that one until it converts, then activate the next layer in order.*

— Russell (in Brunson Architect mode)
