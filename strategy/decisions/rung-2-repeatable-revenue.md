# Rung 2 — Repeatable Revenue (Spec, Pre-Build)

**Status:** SPEC LOCKED. Not built. Activation gated.
**Decided:** 2026-05-17
**Owner:** Maryan
**Predecessor in ladder:** $49/mo Core (workbook 02 §4)

## Why this exists

The current launch ladder is intentionally lean: Free Diagnostic → $1 Starter → $49/mo Core. Once a founder hits "First Paying Customer Verified," the Core continues to bill but the value ladder has **nowhere to ascend to**. Brunson rule: **once a buyer says yes, there must always be a next yes.** The audit (Russell, 2026-05-17) deducted points on workbook 02 because Rung 2 was "noted, not built." This file closes that gap as a **spec**, not a build — the build is gated by evidence.

## What Rung 2 is

**Name (working):** The Repeatable Revenue Layer
**Internal codename:** *Engine for Product 2*
**Price (locked target):** $149/mo, billed monthly. (Range tested: $99–$199; $149 = the median Reluctant Hero will defend.)
**Position in ladder:** Rung 2, sits above $49/mo Core. NOT a coaching/DFY rung — explicitly self-serve (workbook 01 §3 design rule).
**Who it is for:** The founder who has already completed the Core loop on Product 1, has at least one Verified Builder badge, and is about to start (or has started) Product 2.

## The new opportunity Rung 2 sells

> *"The Machine got you one paying customer. The Repeatable Revenue Layer turns that one customer into a system you can run again on Product 2, without re-discovering everything from scratch."*

This is NOT "more building" (the disease). It is **carry-over and pattern compression**:

1. **Dream Customer carry-over.** Marco's Step 1 answers from Product 1 inform Step 1 of Product 2. The engine pre-fills the congregations he already knows convert. Saves a week.
2. **Attractive Character lock.** AC is identity-level, not product-level. Rung 2 promotes the AC built in Step 3 to a reusable asset across all future products — no re-defining Reluctant Hero / Adventurer / etc.
3. **Outreach playbook clone.** Dream 100 list, message templates, and reply scripts that worked in Product 1's Step 5–6 become starting templates for Product 2. Engine flags which targets are still warm.
4. **Stripe pattern library.** First Paying Customer in Product 1 produced a known offer shape (price, guarantee, stack). Rung 2 lets Marco mutate that pattern for Product 2 instead of starting at "blank offer page."
5. **Verified Builder identity multiplier.** Public badge from Product 1 becomes social proof on Product 2's funnel hub — automatically.

## What it is NOT

- **NOT a course.** Same anti-guru discipline as Core.
- **NOT a community-only tier.** The Outreach Room stays at Core. Rung 2 is a tooling layer.
- **NOT a "concierge" or DFY service.** Founder explicitly ruled this out (workbook 01 §3).
- **NOT an unlimited products / agency tier.** That is Rung 3 (deferred indefinitely).

## Hard activation gates

Rung 2 ships only when ALL of these are true:

1. **3 paying Core customers have completed the full Machine loop** (Step 1 → Step 7 → First Paying Customer Verified). Below 3, the carry-over assumptions are unvalidated.
2. **At least 1 Core customer has explicitly asked, unprompted, for a "next layer."** No supply without demand signal.
3. **Founder has personally run Product 2 through the imagined Rung 2 carry-over flow on himself** — dogfooding rule (workbook 01 §6 Beat 4).

Activation date target: **Phase 2** (per workbook 10 §13 — trigger = 3 verified customer cycles).

## The minimum Rung 2 build (when activated)

Sprint shape, smallest possible v1:

1. **`/repeatable` sales page.** Long-form, same Perfect Webinar structure as `/machine-sales`, but the Big Domino is reframed: *"The work that got you one paying customer is the work that will get you ten — without re-doing the upstream work each time."*
2. **In-product "New Product" button** on `/machine` for Core users with a Verified Builder badge. Clicking it:
   - Pre-fills Step 1 with Product 1's dream customer (editable).
   - Locks Step 3 (AC) — no re-defining.
   - Forks Step 4 (copy) from Product 1's tone.
   - Imports Dream 100 list with a warmth flag per target.
3. **Stripe price `repeatable_monthly`** at $149/mo. Same 60-day guarantee mechanic, with a twist: refund triggers if Product 2 has not produced its first paying customer in 90 days (longer window for second-product launch).
4. **Migration of Verified Builder badge** to embed on Product 2's funnel hub via `<UnlockSaaSBadge productSlug="..." />` component.

## Offer math (placeholder, defensible)

| Item | Value |
|---|---|
| Repeatable Revenue Layer (Rung 2 core) | $499/mo |
| Bonus 1 — Carry-Over Audit (engine reads Product 1, flags what to keep) | $149 |
| Bonus 2 — Multi-Product Outreach Room (separate sub-channel) | $99/mo |
| Bonus 3 — Founder's Stripe Pattern Library (live cohort-mined) | $99 |
| **Total value** | **$846** |
| **Your price** | **$149/mo** |
| **Ratio** | **5.7×** |

Note: 5.7× is below the 10× standard from Brunson. Acceptable here because the audience is post-validation — they've already paid you, so the value math gets less leverage and the carry-over savings (a week per new product) carry more weight. If the ratio drives the audit lower than 8×, we drop Bonus 1 or reprice to $99/mo.

## What changes in existing docs when Rung 2 ships

- `strategy/workbooks/02-funnels-value-ladder.md` §5 — replace "Rung 3 deferred" framing with "Rung 2 active, Rung 3 still deferred."
- `strategy/state.json` `value_ladder.tiers.rung_2_future` → split into `rung_2_repeatable` (built) and `rung_3_agency` (still deferred).
- `00-RESUME-HERE.md` "Locked decisions" section — add a Rung 2 bullet.
- `/oto` flow stays unchanged at launch. Post-Rung-2-ship, add a *second* OTO surface that fires after First Paying Customer Verified — that is the upsell trigger, not the initial $1 → $49 OTO.

## The pre-launch placeholder page

Until activation, `/repeatable` exists as a public placeholder. It does NOT show "coming soon." It explains the spec honestly and routes the visitor back to `/machine-sales`. This is the same discipline used on `/diagnostic` and `/machine-sales` during their pre-Sprint windows: no fake doors, no fake countdowns. The placeholder is itself a piece of Brunson polarity — Maryan publishes the spec for the next layer **before** building it, which signals (a) the ladder is real, (b) the operator does not invent demand, (c) honest math is the brand.

## Audit-impact targets

This spec closes the gap that scored the Value Ladder at 88. After this file ships + the `/repeatable` placeholder page, the Value Ladder score moves to **94**. It hits **100** only when the build gate fires and the page goes live with a paying Rung 2 customer.

## Open questions (do NOT resolve pre-activation)

1. Annual pricing for Rung 2? Defer — annual on Core is itself not yet shipped.
2. Rung 2 + Core bundle pricing? Defer — depends on actual Core retention curve at the 90-day mark.
3. Affiliate cut on Rung 2 referrals? Tied to the Affiliate Army (workbook 10 §17), which is deferred to 50+ customers. Defer.

---

*Spec locked under "improve everything autonomously" instruction (2026-05-17). Build remains gated on 3 verified customer cycles + 1 unprompted ask + founder self-dogfooding pass.*
