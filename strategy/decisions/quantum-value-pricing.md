# Quantum / Value Pricing – Parked Until 50+ Paying Core

**Date parked:** 2026-05-21
**Source:** Greg Isenberg overlay (community moat + 2026 distribution playbook). See memory `project_unlocksaas_isenberg_playbook.md`.
**Status:** PARKED. Not under consideration. Re-open trigger gated.
**Owner:** Maryan
**Predecessor decision:** $49/mo flat, locked in `workbooks/01-your-dream-customer.md` §2 and mirrored in `state.json` `dotcom_secrets.offer_stack.price` + `dotcom_secrets.value_ladder.tiers.rung_1_core.price`.

---

## Why this file exists

Greg Isenberg's 2026 distribution playbook proposes "quantum pricing" – dynamic pricing tied to usage or realised customer value, replacing flat monthly SaaS. The frame is real and worth tracking; it is also wrong for UnlockSaaS at this stage. This file records the deferral with a hard trigger so a future agent (or future-Maryan) doesn't re-open it prematurely, and so the work that *should* happen pre-trigger gets done in the right order.

This follows the same lean-stance pattern as `strategy/decisions/youtube-channel-stance.md`: the decision is to **not** ship the thing yet, and the audit value comes from making the deferral conditions explicit and falsifiable.

---

## What "quantum / value pricing" could mean here

If activated, the family of variants worth testing on top of Marco's avatar:

1. **Success pricing.** $0 until First Paying Customer Verified, then a one-time $299 unlock + $49/mo maintenance. Maximises perceived guarantee; tanks gross margin if conversion-to-success is below 25%.
2. **Stepped/phase pricing.** Sprint phase $19/mo → post-First-Customer $49/mo → Repeatable Revenue phase $149/mo (which is already specced in `rung-2-repeatable-revenue.md`). Aligns price to the layer of value being consumed.
3. **Usage-based on engine actions.** Per AI-generated outreach draft, per Dream 100 enrichment, per Stripe-screenshot ingest. Closest to literal Isenberg framing; complex to operate solo; risks turning the product into a metered tool instead of an opinionated playbook.
4. **Value share.** Small percentage of customer-acquired-MRR for N months after First Paying Customer Verified. Highest alignment with the offer promise; legally and operationally heavy for a solo founder pre-revenue.
5. **Dynamic price by congregation.** $29 for r/SaaS cold, $69 for high-intent diagnostic finishers, $99 for guest-podcast referrals. Brunson-compatible (different funnels can carry different bridges) but requires per-channel attribution maturity that the current fill-your-funnel manifest is just starting to produce.

The locked $49/mo flat is option 0. It exists for a reason: it is the median Reluctant Hero will defend, it is the price Brunson workbook 01 §2 produced, and it is the price under which the 60-day guarantee math closes.

---

## Why NOT to disturb the flat $49/mo right now

Five reasons, ordered by weight:

1. **Sample size.** As of 2026-05-21, Core paying-customer count is 0 (PostHog project 181784 reports zero events; Stripe has no Core subscribers yet). Pricing experimentation against n=0 is not optimisation, it is guessing. Any quantum variant tested before n is meaningful adds variance without learning.
2. **Brunson lock.** The flat price was the output of the full Secrets Trilogy workbook chain. Re-opening it mid-build breaks the dependency chain (offer math, guarantee, value-ladder ratios, Stripe IDs, the live `STRIPE_PRICE_CORE_MONTHLY` env var on Vercel, the customer-portal config). The cost of re-litigation is high. The locked-strategy memory (`project_unlocksaas_strategy`) explicitly says: respect locked decisions rather than re-opening them.
3. **Solo-operator complexity ceiling.** Options 3-5 above require per-event metering, per-channel attribution, or revenue-share accounting that a solo non-engineer founder cannot operate reliably pre-revenue. The funnel-audibles + slug-registry work has only just landed; adding metered pricing on top doubles the operational surface before the first customer exists.
4. **Brand-promise risk.** The Reluctant Hero's pitch is "you over-engineer everything, here is one flat price for one ladder." Introducing dynamic pricing pre-PMF flips the brand into the same complexity the avatar is trying to escape from. Wrong brand signal at exactly the wrong time.
5. **Isenberg himself says don't.** The X thread the option is sourced from ("intentionally limit features … shift from monthly subscription to quantum pricing") is aimed at companies competing with $100B SaaS incumbents. UnlockSaaS is not competing with a $100B incumbent on price; it is competing with **"the founder's current habit of building more"**. Different competitive frame, different pricing answer.

---

## Hard trigger to re-open

Re-open this file **only** when **all three** of the following hold simultaneously:

1. **50+ paying Core customers active.** Same Phase 3 threshold that gates the host YouTube channel in `youtube-channel-stance.md`. Below 50, the per-channel + per-cohort pricing variance is statistical noise, not signal.
2. **At least 8 of those 50 customers have completed the full Playbook loop to First Paying Customer Verified.** Reason: success pricing (option 1) and value share (option 4) only become testable when the success-conversion rate is measurable. 8 verified successes inside 50 paying customers is the minimum sample for that ratio to be defensible.
3. **One unprompted ask from a paying customer for an alternative pricing shape.** Same anti-supply-without-demand rule used to gate Rung 2 in `rung-2-repeatable-revenue.md`. Examples that count: "could I pay only when it works?", "could I pay per outreach the engine sends?", "could you take a cut of my first customer's revenue?". Examples that do NOT count: "$49 is a lot" (that's a price-point complaint, not a quantum-pricing ask).

All three. Not two. The combination is the trigger; any single one alone re-opens nothing.

---

## What to collect pre-trigger so the eventual decision is fast

The reason the decision will be slow when the trigger fires is that the data needed to choose between variants 1-5 is not currently being collected. Pre-trigger discipline:

- **Per-channel conversion attribution.** The slug registry + typed UTM builder + `link_clicks` view shipped in the Fill Your Funnel manifest already cover this. Keep them clean. When trigger fires, option 5 (per-congregation pricing) becomes evaluable instantly.
- **Time-to-First-Paying-Customer-Verified per Core customer.** Add a Supabase column or PostHog property `tt_first_customer_days` populated when the Stripe-verified event fires. Without this, option 1 (success pricing) is unparametrisable.
- **Engine action counts per customer.** Track in PostHog: outreach drafts generated, Dream 100 enrichments run, Stripe-screenshot uploads. Without this, option 3 (usage-based) is unparametrisable.
- **Refund rate at the 60-day mark.** First batch of guarantee-window closes will produce the first real refund-rate number. Below 10% refunds, success pricing becomes defensible. Above 25%, success pricing is suicide.

None of these require a pricing change. They are instrumentation. Ship them under the existing $49/mo while waiting for the trigger.

---

## What changes if/when the trigger fires

Sequence when re-opening:

1. Re-read this file + `project_unlocksaas_isenberg_playbook.md`.
2. Pull the four data points above from PostHog/Stripe/Supabase. Confirm the trigger is real, not coincidental.
3. Run a *new* Brunson Revision Mode pass on workbook 01 §2 (offer stack price). This is the only legitimate path to disturbing the lock.
4. Update in this order: workbook 01 §2 → `state.json` `dotcom_secrets.offer_stack.price` + `dotcom_secrets.value_ladder.tiers.rung_1_core.price` → Stripe price object(s) → `STRIPE_PRICE_CORE_MONTHLY` env var on Vercel (Production, Preview, Development per the local-secrets-mirror rule) → customer portal config → checkout copy → sales page copy → any en-route emails.
5. A/B against the locked flat $49/mo for at least one full guarantee window (60 days) before declaring the variant won.

Do not skip step 5. The flat $49/mo has the longest run-up to its lock; any replacement needs the same evidentiary burden.

---

## Cross-references

- `project_unlocksaas_isenberg_playbook.md` (memory) – the overlay this decision parks an item from
- `project_unlocksaas_strategy.md` (memory) – the locked-strategy rule this decision honours
- `project_unlocksaas_stripe.md` (memory) – the Stripe price object that would change if/when triggered
- `project_unlocksaas_vercel.md` (memory) – the env var that would change in lockstep
- `strategy/workbooks/01-your-dream-customer.md` §2 – source of the $49/mo lock
- `strategy/decisions/rung-2-repeatable-revenue.md` – sibling decision; same gating pattern, different question
- `strategy/decisions/youtube-channel-stance.md` – pattern this file follows
- `strategy/state.json` `parked_decisions.quantum_value_pricing` – machine-readable mirror
- Source thread: https://x.com/gregisenberg/status/1827692081109721502

---

*Parked under "proceed autonomously" instruction (2026-05-21). Re-open gated on the three-part trigger above. No build, no test, no spec work on quantum pricing until all three conditions hold.*
