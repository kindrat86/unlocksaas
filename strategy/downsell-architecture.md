# OTO Downsell Architecture — UnlockSaaS

This document closes the audit gap on **DotCom Secrets Secret #18 (Cart Funnel + OTO/Stack Scripts)**. The current OTO at `/oto` correctly enforces ONE decision (per workbook 03 Script 4), but the "No thanks" path leaks every buyer to silence. This spec adds a single recoverable downsell without violating the Reluctant Hero + Verified Builders identity or breaking the one-decision-per-page rule.

**Source workbooks:** 02 (Value Ladder), 03 Script 4 (OTO), 04 §2 (Starter funnel spec), 06 §4 (Internal Belief rewrites — for the downsell copy).

---

## The Problem We're Solving

Today's `/oto` page (live):
- Primary CTA: "Continue the Playbook. $49/mo. 60-day guarantee."
- Secondary link: "No thanks, deliver just the Starter."

The secondary path drops the buyer onto the Starter member area with Steps 1–2 unlocked and Steps 3–7 locked behind the $49 paywall. Brunson's rule: **the moment a buyer says no, the next offer should be already-loaded.** Right now there is no next offer. We collect the $1, we lose the upsell, we never re-ask.

Expected lift from a well-built downsell: **2-5% incremental conversion on OTO-refusers**. At 100 $1 buyers/mo and a 15% OTO take-rate, recovering 3% of the 85 refusers = ~2.5 additional $49/mo customers per month, compounding.

---

## The Downsell — One New Page, Two Buttons

**Trigger:** OTO refusal (user clicks "No thanks, deliver just the Starter").

**Route:** `/oto/downsell` (new page; one decision per page rule preserved).

### Page structure

| Block | Content |
|---|---|
| Hero | "Got it. Before you go." — small, calm, NOT salesy. |
| Sub-headline | "Most founders who skip the full Playbook come back inside 30 days because Steps 1 and 2 are not the bottleneck — Step 5 is." (Internal Belief rewrite #3 from workbook 06 §4: "for an avoidant builder, more building is sophisticated procrastination.") |
| The downsell | A **single, lower-friction** unlock: the **14-Day First-Customer Sprint bonus alone** (the $89-valued bonus from workbook 01 §2) — one-time payment, no subscription, no auto-upgrade. **Price: $19 one-time.** |
| What $19 unlocks | The 14-day daily check-in sequence (one small tracked action per day for 14 days), delivered by email + accessible at `/sprint`. Does NOT unlock Playbook Steps 3–7. Does NOT carry the 60-day guarantee. |
| Why $19 | 10x value math: $89 stated, $19 charged = 4.7x ratio. Acceptable for a tripwire bonus (the 10x discipline lives on the core stack; the bonus is permitted to be 3–5x). |
| Primary button | "Add the 14-Day Sprint — $19" |
| Secondary link | "No thanks, take me to my Starter dashboard." |

Rules: one decision. Two buttons. No third option. (Same rule as the upstream OTO.)

### Page structure — second downsell (only after first refusal)

**Trigger:** Downsell refusal (user clicks "No thanks" on `/oto/downsell`).

**Route:** `/oto/downsell-2` — OR `/playbook` (Starter dashboard) with a one-time inline banner. Choose ONE of those two; do not double-pop modals.

**Recommendation:** inline banner on `/playbook`, not a third page. Three sequential pages of "are you sure" reads as desperate. The banner shows once per session, then never again.

| Block | Content |
|---|---|
| Banner copy | "When you finish Steps 1 and 2, the door to the full Playbook stays open here. The 60-day guarantee clock starts the day you upgrade, not today." |
| Single CTA | "See the upgrade door" → links to `/playbook-sales` (the long-form $49 page). |
| Dismiss | × — dismisses for the session, cookies the dismissal for 30 days. |

---

## What the Downsell Must NOT Be

The Brunson rule is "one offer per page" — the downsell respects that, but skeptic-Alex's filter is sharper than the rule. Specifically:

1. **NO fake urgency on the downsell.** "This offer disappears in 10 minutes" is exactly the energy our polarity-AGAINST list calls out. Workbook 07 §3 Category 4 stays REJECTED on the downsell too.
2. **NO progress bars that say "you're 90% there!"** Alex knows the math. Lying about it shreds the brand.
3. **NO subscription cross-sell on the $19 path.** $19 is one-time. If a $19 buyer wants the $49/mo later, they click the upgrade door in the Starter dashboard. The $19 purchase does not get auto-converted, does not get a free-trial-with-card-on-file, does not get any other dark pattern.
4. **NO third decision on the downsell page.** Two buttons. The moment we add a "Maybe later" toggle, we're admitting we don't trust the offer.

---

## Implementation Spec (for the build crew)

### Stripe

Create a new Price under the existing Starter product (or a new Sprint product if we want clean accounting):
- **Name:** `UnlockSaaS Sprint — 14-Day First-Customer Sprint (downsell only)`
- **Price:** $19 USD, one-time (`unit_amount: 1900`)
- **Stripe Price ID env var:** `STRIPE_SPRINT_PRICE_ID`
- **Statement descriptor:** `UNLOCKSAAS SPRINT`
- **Created where:** Stripe Dashboard (Stripe MCP doesn't expose downsell-only products as a primitive — create manually).

### Routes

- `app/src/app/(marketing)/oto/downsell/page.tsx` — the downsell page (new).
- `app/src/lib/stripe.ts` — add `priceType: "sprint"` → `STRIPE_SPRINT_PRICE_ID` mapping.
- `app/src/app/api/checkout/route.ts` — accept `priceType: "sprint"`, route through one-time checkout (same code path as `starter`).
- `app/src/app/api/webhooks/stripe/route.ts` — on `checkout.session.completed` with mode=`payment` and Stripe Price ID = sprint, write a `sprint_purchase` row + enqueue the 14-day email cadence in `seinfeld_subscribers` or a new `sprint_subscribers` table.

### Email cadence (the 14-day sprint deliverable)

Reuses the existing dispatch infrastructure (`app/src/lib/soap-opera/dispatch.ts` pattern):
- 14 emails over 14 days, one per day.
- Subject pattern: `Day N of 14 — [single specific action]`.
- Each email body: 80–150 words. ONE action. ONE proof-of-completion request (reply with the link / screenshot / Stripe row).
- Day 14 email: "You finished. Here is the door to the full Playbook if you want it." — links to `/playbook-sales`.

### Analytics events (add to `app/src/lib/analytics/events.ts`)

- `Event.OtoDownsellPageViewed`
- `Event.OtoDownsellCheckoutClicked`
- `Event.OtoDownsellRefused`
- `Event.SprintEmailSent`
- `Event.SprintEmailReplied`
- `Event.SprintToPlaybookUpgrade`

### Funnel attribution

The downsell session inherits `attribution_from`, `diagnostic_label`, `diagnostic_lead_id` from the OTO refusal handoff (set via querystring or session storage). The webhook handler writes those into `verified_conversions` so the funnel-metrics dashboard can compute `diagnostic → starter → downsell → playbook` conversion separately from the direct `diagnostic → starter → playbook` path.

---

## Ship Gate

**Sprint 3.5** — after the long-form $49 sales page ships, before the first paid traffic activates. Sequence:

1. Sprint 3: ship `/playbook-sales` (in-flight).
2. Sprint 3.5: ship `/oto/downsell` per this spec.
3. Sprint 4: ship the 14-day Sprint email cadence + `/sprint` dashboard.
4. Sprint 5: instrument the upgrade-from-Sprint conversion path.

Reason for sequencing: the downsell must point at a real upgrade door. The upgrade door is the $49 page. The $49 page is Sprint 3. Until Sprint 3 ships, the downsell sends the buyer to a placeholder, which kills the play.

---

## Acceptance Tests

1. A $1 buyer who clicks OTO "No thanks" lands on `/oto/downsell` with the right per-label diagnostic handoff (if they came from the diagnostic).
2. A $19 downsell buyer is **not** charged $49 anywhere unless they explicitly subscribe via `/playbook-sales` later.
3. A $19 downsell buyer who upgrades to $49 within 60 days gets the $19 credited to their first $49 invoice (manual via Stripe Dashboard or coupon — defer the code automation to Sprint 6).
4. The downsell refuser sees the `/playbook` dashboard inline banner exactly once per session, dismissable, cookied for 30 days.
5. No part of the downsell or sprint emails uses the words "limited time," "ending soon," "spots left," or any synonym. Workbook 07 §3 Category 4 enforcement is non-negotiable.

---

## Status

**Spec v1 complete (2026-05-17).** Consumed by `brunson-architect` to close audit gap on DotCom Secrets #18 (Cart Funnel OTO/Downsell). Implementation deferred to Sprint 3.5. The downsell is the cheapest ~$1000/mo MRR available to UnlockSaaS once the Starter funnel has any volume; it should not slip past Sprint 4.
