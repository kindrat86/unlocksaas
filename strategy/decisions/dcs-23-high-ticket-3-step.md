# DCS Secret #23 — High-Ticket 3-Step Application: Variant Locked, Build-Gated

**Status:** SPEC LOCKED. Build remains gated on activation evidence.
**Decided:** 2026-05-17 (audit v3 row #23 re-grade, "Proceed autonomously").
**Owner:** Maryan
**Closes audit gap:** DCS Secret #23 (High-Ticket 3-Step Application Funnel) from `N/A — Lean-ladder discipline holds` → **40 (variant spec'd, build-gated)** under stage-appropriate scoring, with a 100-path defined.

---

## Why this was N/A — and why N/A was wrong

The v2 and v3 Russell audits both scored Brunson's High-Ticket 3-Step Application Funnel (DCS Chapter 23) as `N/A` with the rationale "founder explicitly ruled out coaching/DFY; lean-ladder discipline holds."

The pattern-match was: **high-ticket = coaching = locked out by workbook 01 §3.** That collapses two distinct chapter dimensions into one:

- **Price band** ($2K–$25K, canonical Brunson territory)
- **Structural shape** (Sales Letter / VSL → Application Form → 1:1 phone/Zoom close)

Workbook 02 §5b correctly rejects the **canonical price-band** variant — UnlockSaaS will not ship an agency / unlimited-products / Phone Funnel at $2K+. That rejection is locked.

What was missed: the **structural shape** has a lower-price-band variant that maps cleanly onto an already-locked design — the same Machine, billed annually, with an application gate and a 1:1 fit call. That variant does not violate workbook 01 §3 (still self-serve product, no coaching, no DFY, no cohort, no new framework). It occupies the structural slot of Chapter 23 at a reduced price band justified by SaaS-monthly anchoring vs. course-pricing convention.

Same lens that re-graded Summit Funnel (DCS #16) in v2 and Conversation Domination (Traffic Secrets #14) in v3: identify the UnlockSaaS-compatible variant, ship the spec, gate the build by evidence.

---

## The UnlockSaaS variant: The Annual Pre-Paid Machine

**Working name:** *The Annual Pre-Paid Machine*
**Internal codename:** *Verified Annual*
**Surface:** `/annual` (placeholder live; application form server-disabled until activation gate fires)
**Position in ladder:** Lateral upgrade of Rung 2 ($49/mo Core), NOT a new rung. Same Machine, same guarantee, different billing cadence + premium identity bonuses.

### What the offer is

| Element | Detail |
|---|---|
| Price | **$588 / year**, billed annually, paid upfront. |
| Math | $49 × 12 = $588. **No discount.** Annual prepay does NOT save money. It earns identity + access bonuses the monthly tier doesn't have. |
| Product | The same Machine. Same 7 steps. Same Stripe-verified guarantee. Same 60-day refund window. Different billing cadence + three Verified-Annual bonuses (see below). |
| Acquisition shape | 3-step application funnel (Brunson Chapter 23 structural shape): VSL/sales letter → Application Form → 15-min Zoom close with Maryan. NOT self-serve checkout. |
| Activation gate | 3 paying Core customers have completed the full Machine loop. Without 3 case studies the close call has no anchor and Maryan opens with "I've never seen this work." |
| Operator cap | 50 active Verified-Annual seats total. Hard cap on Maryan's 1:1 call bandwidth (each annual seat earns 4 calls/year + a 30-day direct line on renewal). Beyond 50, applications join a waitlist OR are routed to self-serve monthly. |

### What it is NOT

- **NOT a discount.** $588 = $49 × 12 exactly. The Reluctant Hero does not bait-and-switch with promo math.
- **NOT a discount disguised as a bonus.** The three bonuses below are operator-time + identity + grandfathering — they have honest cost-to-deliver math, not a pretend-price-cut.
- **NOT coaching.** The 15-min Zoom is a **fit-qualifying call**, not a strategy session. Maryan walks the candidate through their Stripe situation, qualifies fit/no-fit, processes the charge OR routes back to self-serve monthly. There is no homework, no follow-up call, no curriculum.
- **NOT DFY.** Maryan never runs The Machine on the customer's behalf. The customer runs The Machine. The annual prepay only changes the billing + the identity.
- **NOT a cohort.** No group calls. No shared Slack. The 1:1 call is one-on-one, end-of-story.
- **NOT a new product.** Same engine, same steps, same guarantee. The annual prepay is a billing decision, not a product decision.
- **NOT the Founding-Cohort PLF.** The PLF (workbook 03 Script 8) runs ONCE as a 50-seat cart event with $49/mo. The Annual Pre-Paid Machine is EVERGREEN, available indefinitely post-activation, gated by application not by cart-open countdown.

The line that stays bright: **framework into the engine, not onto the user** (workbook 01 §6 design law). The annual prepay does not put a framework on the customer. It puts a billing cadence on them.

---

## Why an application + a 1:1 close at this price band

Brunson's canonical 3-Step works at $2K+ because phone time costs more than the offer it qualifies for at lower prices. At $588/year UnlockSaaS the math is different. Maryan's time on a 15-min call ($60/hour fully-loaded) is recovered inside the first month of revenue per closed annual. Three reasons it still works:

1. **Refund-liability protection.** A monthly customer who churns at month 2 with a refund demand costs $98 (the standard guarantee remedy). An annual customer who churns at month 2 with a refund demand under the same 60-day rule still costs $98, but the unprotected-by-guarantee remainder ($490) sits in deferred-revenue purgatory and gets disputed at 90 days when the customer realizes they "didn't get a customer." The application + call **pre-qualifies fit** so the refund-rate stays at or below the monthly cohort's rate.
2. **Fit signal compresses CAC.** The application asks five Brunson-defensible questions (below). Bad-fit applicants self-disqualify by reading them and not submitting — recovering Maryan's time before the call.
3. **The Verified-Annual identity is earned, not bought.** A customer who's done an application + a 15-min Zoom is structurally different from one who clicked Stripe. The badge on `/builder/[slug]` shows it. Public-proof loop strengthens (Verified-Annual carries more weight than Verified).

What the application + call is NOT a workaround for: a weak self-serve funnel. The application gate fires ONLY for the annual variant. The $49/mo monthly path stays one-click via `/machine-sales` checkout — unchanged.

---

## The 3-step shape (Brunson Chapter 23, applied)

### Step 1: Sales document

The same `/machine-sales` long-form (workbook 07 Sections 1–3) serves as the Step-1 sales document. **No separate `/annual` long-form needed.** A small "Annual" CTA on `/machine-sales` (post-activation only) routes prospects to the application page at `/annual`.

Decision: do not duplicate copy. The annual prepay sells against the same Big Domino, the same Three Secrets, the same Stack. The only delta on `/annual` is the billing-cadence reframe + the application form + the three Verified-Annual bonuses.

### Step 2: Application form (`/annual`)

Five qualifying questions. All Brunson-defensible — every question maps to a real workbook-locked filter:

| # | Question | What it filters | Workbook anchor |
|---|---|---|---|
| 1 | Have you already shipped a product (live URL)? | Pre-launch founders are wrong avatar. | Workbook 01 §1 Q1 |
| 2 | Is your Stripe live and accepting payments? | Without Stripe the guarantee mechanic cannot verify a charge. | Workbook 01 §2 guarantee terms |
| 3 | Have you started or completed The Machine (free-tier or $49/mo)? | Cold inbound at $588/year converts at ~0% without an upstream rung touched. | Workbook 02 §1 (Build order) |
| 4 | In one sentence: who is your dream customer? | Marco-Meter filter. Vague answers = bad fit for 1:1 time. | Workbook 01 §1 Q1 |
| 5 | What outcome would $588 paid annually be worth to you, if the Machine produces your first paying customer? | Self-quantified outcome anchor. If the candidate can't quantify, the close call won't either. | Workbook 01 §2 honest-value rule |

**Decision rules** (applied server-side at the gate, NOT shown to applicant):

- Question 1 = "no" → auto-decline, route to `/diagnostic` (wrong avatar).
- Question 2 = "no" → auto-decline, route to `/diagnostic` with note "fix Stripe first."
- Question 3 = "haven't started" → auto-route to `/starter` ($1 Starter is the upstream rung).
- Questions 4 + 5 reviewed by Maryan personally before scheduling a call. Bad-fit answers get a polite decline + route to `/machine-sales` self-serve monthly.

### Step 3: 15-min Zoom close call

Maryan-only. Calendly link sent only to qualified applicants (post-review). Three questions, two buttons. No slide deck. No demo (the demo is already on `/machine-sales`). The call is fit-qualification + objection-handling + Stripe processing.

**Call script** (locked):

| # | Question | Job |
|---|---|---|
| 1 | "Walk me through your Stripe today. What's the line look like?" | Activates the pain mirror. The candidate hears themselves describe the flat line on a recorded call. |
| 2 | "What's the work you'd be doing inside the Machine that you've avoided so far?" | Pulls the avoidance disease into the open. If the candidate can't name a specific avoided action, they're not a 1:1 fit. |
| 3 | "If we processed $588 right now and I started the 60-day clock, what would change for you between today and 60 days from now?" | Future-pace + close trigger. If the candidate hedges, route back to monthly and end the call cleanly. |

**Two buttons** (in Maryan's hand, on the call):

- **YES:** Process $588 Stripe charge over the call. Apply Verified-Annual flag. Trigger 30-day direct-line clock. Schedule 60-day check-in.
- **NO (route back to monthly):** Send `/machine-sales` link in the chat. Wish them well. End at 12 minutes.

**No third button.** No "let me think about it" follow-up email. The application + call IS the close.

---

## The three Verified-Annual bonuses

Same shape as the Founding-Cohort PLF bonuses (workbook 03 Script 8): operator-time + identity + grandfathering. Honest math. No invented value.

| Bonus | What it is | Cost to deliver | Defensible value |
|---|---|---|---|
| **1. Lifetime $588/year price lock** | Maryan commits in writing: your $588/year never goes up for the life of your active annual subscription. | Zero out-of-pocket. Forfeit of future annual-price-increase revenue. Acceptable because annual WILL rise to $720+ by Phase 3 ($60/mo equivalent). | $132/year × 3-year retention horizon = **~$396** of locked-in value. Provable. |
| **2. Verified-Annual badge variant** | Distinct visual frame on the existing Verified Builder OG image taxonomy. Public on `/builder/[slug]`. Visible signal to peers that this founder committed annually. | Zero — extends the existing `builder_badges.variant` enum (already has `verified` and `founding_verified`; add `verified_annual`). | Identity-anchored social proof. ~$200 equivalent based on what a peer would pay for the same identity signal via a paid community badge. |
| **3. 30-day direct line on renewal anniversary** | Each renewal year, the first 30 days reopen Maryan's reply-within-1-business-day window at maryan@unlocksaas.com. Same shape as the Founding-Cohort 30-day direct line, on a recurring cadence. | Maryan's time, capped at 50 active Verified-Annual × 30 days/year = ~150 days of direct-line annually. Manageable for one founder if cap holds. | ~$200/year equivalent (founder-time at $60/hour × ~3.3 hours of asynchronous reply over 30 days). |

**Total Verified-Annual bonus math:** ~$396 price lock + ~$200 badge + ~$200 direct line = **~$796 of honest bonus value** on $588 annual. Plus the base $496 stack from workbook 01 §2.

**Total offer math:** $496 base + $796 Verified-Annual bonuses = **$1,292 / $588 = 2.2×.**

**2.2× is below Brunson's 10× rule.** This is INTENTIONAL and correct for an annual-prepay variant of an existing $49/mo product:

- The 10× rule applies to the **anchor product** (the Machine at $49/mo, where the ratio is 10.1×). Locked in workbook 01 §2.
- The annual prepay is a **billing-cadence + identity** decision, not a new offer. The stack math doesn't reset; it carries over. The bonuses are honest deltas, not invented value.
- A 10× ratio at $588 would require ~$5,880 of stack value, which would mean inflating the bonuses past defensibility. **Inflated math is the Reluctant Hero anti-pattern.** Marco rejects it on contact.

The honest play is to ride on **cash-flow + identity**, not stack math, at this rung. Brunson rule preserved at the anchor; sub-canonical at this layer with documented reason. Same discipline as Rung 2 (5.7× target, documented as below-10× and acceptable for post-validation buyers).

---

## The refund mechanic

Same 60-day Stripe-verified guarantee. Adapted to annual billing:

- **If the customer completes the tracked in-product milestones AND Stripe shows no new paying customer at the 60-day mark:** refund = $98 (two months equivalent, matching the monthly-tier remedy). The remaining $490 stays on the books, the customer keeps the rest of the annual access at $49/mo equivalent. This is **mathematically identical** to the monthly remedy — the customer's downside is capped at $98 regardless of billing cadence.
- **If the customer cancels mid-year for non-guarantee reasons** (e.g., "I changed my mind"): no refund on the remainder. Annual prepay is non-refundable post-60-day. This is stated on the application form, restated on the close call, and stated again in the post-charge confirmation email.
- **If the customer hits the 60-day mark with milestones incomplete:** no refund (work conditions not met). Same rule as monthly.

The refund logic for annual reuses the `verified_conversions` table + the existing 60-day cron. No new code path needed at refund-time; the only delta is the `billing_cadence='annual'` flag on the subscription row.

---

## Build minimum (when activation gate fires)

Sprint shape, smallest possible v1, in order:

1. **`/annual` page activates from placeholder → live.** Application form switches from server-disabled (returns 410) to server-enabled (POST `/api/annual-application` → row in `annual_applications` table → Maryan review queue).
2. **Stripe annual price object** `verified_annual_yearly` at $588/year on the existing Core subscription product. New price, same product. Reusable Stripe Customer.
3. **Application review queue.** `annual_applications` table (Supabase) + admin-only `/admin/annual` route showing pending applications with Maryan's decision buttons (Schedule Call / Decline-Soft / Decline-Hard / Auto-Route).
4. **Calendly integration.** Single 15-min call type at `/m/maryan` with the Brunson 3-question script in the call-prep email. Webhook to mark `annual_applications.call_scheduled_at`.
5. **Close-call charge flow.** Stripe Checkout link generated per applicant with `verified_annual_yearly` price + `verified_annual=true` metadata. Maryan sends it in Zoom chat during the call. Webhook fires Verified-Annual badge + 30-day direct line clock.
6. **`builder_badges.variant` extension.** Add `verified_annual` to the enum. New OG image template at `/builder/[slug]/opengraph-image.tsx` for variant=verified_annual.
7. **30-day direct line clock.** Renewal anniversary cron (`/api/cron/annual-renewals`) sends the "30-day direct line is reopening" email to all active Verified-Annual customers on day 0 of each renewal year. Same Resend + HMAC pattern as the existing `/api/unsubscribe` infrastructure.

Total estimated build time: ~6–10 hours of focused work. Dwarfed by the operator-time required for the gate (3 verified Core customers + Calendly setup + first 3 close calls). **The build is not the bottleneck. The evidence is.**

---

## Hard activation gates

The Annual Pre-Paid Machine ships only when ALL of these are true:

1. **3 paying Core customers have completed the full Machine loop** (Step 1 → Step 7 → First Paying Customer Verified). Without 3 case studies, Maryan opens the close call with "I've never seen this work" — Brunson-incredible.
2. **At least 1 of those 3 Core customers has either renewed past month 2 OR asked unprompted about an annual option.** Demand signal, same shape as Rung 2's activation gate. No supply without signal.
3. **Maryan has run a dry-run close call on himself** with a friend playing the candidate (Reluctant Hero dogfood rule — never sell a 1:1 motion you have not personally practiced).
4. **Calendly + Stripe annual price + admin review queue are operationally ready** (the operator path works end-to-end on a test charge).

If gate #1 holds at 3 verified Core customers but the others don't, the placeholder stays gated. No partial activations. Honesty discipline.

---

## Audit-impact targets

| Pass | Score | What got built |
|---|---|---|
| v3 (audit row #23) | N/A — Lean-ladder discipline holds | Pattern-match correctly identified canonical Phone Funnel as out of scope, but missed the lower-price-band variant. |
| v3.1 (this push, spec lock + placeholder) | **40** | Decision doc + workbook addendum + state.json block + `/annual` placeholder live + application form pre-rendered as text + audit re-grade addendum. Build itself remains gated. |
| **Path to 65** | Application form goes live (server-enabled), `/admin/annual` review queue built, Calendly integrated. Pre-condition: 3 verified Core customers. | |
| **Path to 85** | First 3 close calls completed (any outcome — close-or-route). Operator confirms the call script holds under live pressure. | |
| **Path to 100** | First 5 Verified-Annual customers acquired via the 3-step. Refund-rate at or below monthly cohort. Verified-Annual badge variant live on `/builder/[slug]`. | |

**Stage-appropriate scoring lens** (re-applied): same lens Russell signed off on for DCS #28 Funnel Audibles (90 pre-traffic), DCS #2 Value Ladder Rung 2 (100 once data layer + placeholder + ladder diagram shipped), and Traffic Secrets #15 Funnel Hub (100 once auto-activating trust columns shipped). The chapter scores by **readiness shipped + path-to-100 defined**, not by a first $588 customer. The remaining 60 points to 100 are market-validation, not chapter-readiness — they land on the composite market layer (still 5), not on this chapter's score.

---

## What this does NOT do

- **Does NOT change `/machine-sales`** — same long-form, same Big Domino, same Stack. The annual prepay rides on the same Step-1 sales document.
- **Does NOT change the $49/mo monthly path** — one-click Stripe checkout from `/machine-sales` is preserved unchanged. The application gate fires only for the annual variant.
- **Does NOT change the guarantee math** — $98 refund cap holds for monthly and annual identically. No new refund logic.
- **Does NOT compete with the Founding-Cohort PLF** — the PLF is a one-shot 50-seat cart event at $49/mo with founding bonuses. The Annual Pre-Paid Machine is evergreen at $588/year with Verified-Annual bonuses. Different funnels, different moments, both fit cleanly in workbook 03 + workbook 04.
- **Does NOT promise the customer a coaching call.** The 15-min Zoom is fit-qualification + close, not consulting. Stated explicitly on the application form, the close-call confirmation email, and the post-charge welcome.

---

## Connection to other locked decisions

| Anchor | Relationship |
|---|---|
| Workbook 01 §2 ($49/mo Core stack) | Annual prepay is a billing-cadence variant of the same product. Stack carries over unchanged. |
| Workbook 01 §3 (no coaching, no DFY) | The 15-min call is fit-qualification + close, NOT coaching. Re-stated in three surfaces. |
| Workbook 02 §5 (Rung 2 Repeatable Revenue) | Annual prepay is a LATERAL variant of the $49/mo monthly (same rung, different cadence). Rung 2 sits ABOVE both at $149/mo. |
| Workbook 02 §5b (Phone Funnel deferred) | Phone Funnel = canonical $2K+ Brunson Chapter 23 variant. STILL deferred. Annual Pre-Paid Machine occupies the structural slot at the lower price band. |
| Workbook 03 Script 8 (Founding-Cohort PLF) | PLF is the LAUNCH event ($49/mo with founding bonuses, 50-seat cap, 7-day cart window, one-shot). Annual Pre-Paid is EVERGREEN ($588/year with Verified-Annual bonuses, application-gated, indefinite). Distinct funnels. |
| Workbook 04 §6 (Outreach Engine, Step 5) | Annual prepay does NOT change Machine Step 5. Verified-Annual customers run the same outreach engine. |
| Workbook 09 §6 (Solo Ads / Integration Marketing) | Annual prepay is NOT cold-traffic targetable. Application gate filters cold inbound. Solo-ad/integration traffic still routes to `/machine-sales` → $49/mo. |
| Workbook 10 §6 (Three-Phase Growth Map) | Activation gate (3 verified Core customers) maps to the same Phase 2 trigger. Annual prepay is a Phase 2 surface. |
| `strategy/funnel-stack.md` | Updated to add the Annual Pre-Paid Machine lateral variant beside Rung 2 (Core monthly). |

---

## Open questions (do NOT resolve pre-activation)

1. **What if monthly Core customers want to convert mid-subscription?** Likely yes (proration via Stripe subscription update), but defer the decision until 3+ Core customers have asked. Honest answer for the first cohort: "If you renew month 2 without churning, I'll send you the annual upgrade link manually."
2. **What if a Verified-Annual customer churns at month 7?** Same as monthly Core mid-year churn — no proration, no refund post-60-day. Documented on application form.
3. **Affiliate cut on Annual referrals?** Tied to the Affiliate Army (workbook 10 §17), which is deferred to 50+ customers. Defer.
4. **Verified-Annual + Rung 2 (Repeatable Revenue) bundle?** Defer until both have customers — bundle math depends on retention curves that don't exist yet.
5. **Group close calls?** Explicitly rejected. The 1:1 shape is the whole point of the chapter. Group format = cohort = violates workbook 01 §3. Do not relitigate.
6. **Pre-activation waitlist?** Rejected. Same discipline as `/repeatable` — no fake waitlist. The placeholder explains the spec, routes to `/machine-sales`, and stays honest.

---

## What changes in existing docs when this ships

- `strategy/workbooks/02-funnels-value-ladder.md` §5c — replace "Variant Locked, Build-Gated" framing with "Variant Active, $X Verified-Annual customers."
- `strategy/state.json` `dotcom_secrets.high_ticket_3_step.status` → `active`.
- `00-RESUME-HERE.md` "Locked decisions" section — add a Verified-Annual bullet under "Offer."
- `/machine-sales` — add a small "Annual" CTA below the primary monthly CTA, post-activation only.
- `app/src/app/(marketing)/annual/page.tsx` — server-disabled application form switches to live form.

---

*Spec locked under "Proceed autonomously" instruction on audit v3 row #23. Build remains gated on 3 verified Core customer cycles + 1 unprompted-or-renewed signal + Maryan dry-run + operational readiness pass.*
