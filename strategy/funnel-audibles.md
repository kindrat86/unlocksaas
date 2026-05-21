# Funnel Audibles Playbook — UnlockSaaS

**Source:** DotCom Secrets, Section 4, Secret #28 — Funnel Audibles.
**Status:** LOCKED. Pre-staged, pre-mapped, pre-instrumented.
**Companion files:**
- `supabase/views/funnel_audibles.sql` — SQL views that power the dashboards in Part 6.
- `strategy/workbooks/04-building-your-funnels.md` Section 8 — the original Funnel Audit Worksheet (this playbook supersedes it for live operation; the worksheet remains the pre-launch sanity check).
- `app/src/lib/analytics/events.ts` — canonical event taxonomy.

---

## Part 1: The Principle

> "An audible is not a redesign. It is a single targeted change made because the data told you exactly where the funnel is leaking." — Russell Brunson, DotCom Secrets

A funnel audible has four properties:

1. **It is reactive.** You do not audible from a hunch. You audible from a number that crossed a threshold.
2. **It is single-variable.** You change one thing at a time. Two changes at once = no learning.
3. **It is pre-staged.** The alternate version exists in the vault BEFORE the leak shows up. Calling an audible takes minutes; writing the audible from scratch takes a week, and a week of leaking is a refund.
4. **It is reversible.** Every audible is a swap. If the new version performs worse, you swap back inside 24 hours.

The reason Funnel Audibles is Secret #28, not Secret #1, is that you cannot call them until you have data. Pre-traffic, the work is preparation — **wiring the alarms, writing the alternates, and defining the triggers.** The score on this chapter pre-launch is determined entirely by how prepared you are for the moment data arrives.

This playbook is that preparation.

---

## Part 2: The Funnel Map

Every step of the UnlockSaaS funnel, with the canonical event from `events.ts`, the Brunson benchmark, the UnlockSaaS-specific target, and the red-line threshold below which an audible MUST be called.

| # | Step | Event | Benchmark | Target | Red-line |
|---|---|---|---|---|---|
| 1 | Cold visitor → Funnel Hub | `funnel_hub_viewed` | n/a (acquisition) | 100/wk @ launch | < 50/wk after 4 wks of publishing |
| 2 | Hub → Diagnostic squeeze | `diagnostic_page_viewed` | 30–50% of hub views | 40% | < 20% |
| 3 | Diagnostic squeeze → form submit | `diagnostic_form_submitted` | 25–40% warm / 10–20% cold | 30% blended | < 15% |
| 4 | Form submit → result viewed | `diagnostic_result_viewed` | > 90% (mechanical) | 95% | < 80% (=engine errors or routing bug) |
| 5 | Diagnostic result → $1 Starter click | `starter_checkout_clicked` | 20–35% | 28% | < 15% |
| 6 | Starter click → Stripe success | `starter_purchased` | 60–80% (Stripe friction) | 70% | < 50% (=payment UX broken) |
| 7 | Starter → OTO viewed | `oto_page_viewed` | 95%+ (auto-redirect) | 99% | < 90% (=success URL drift) |
| 8 | OTO viewed → upgrade clicked | `oto_upgrade_clicked` | 15–30% (Brunson canon) | 22% | < 10% |
| 9 | OTO upgrade → Playbook subscribed | `playbook_subscribed` | 80%+ | 85% | < 65% |
| 10 | Member area → Step 1 started | `playbook_step_started` (step_id=1) | 90%+ | 95% | < 75% |
| 11 | Step 1 → completed | `playbook_step_completed` (step_id=1) | 60–80% (form abandonment) | 75% | < 50% |
| 12 | Step 2 completed → OTO re-surfaced | `oto_page_viewed` (re-entry) | 50%+ | 60% | < 30% |
| 13 | Step 3 → Step 7 completion (full Playbook) | `playbook_step_completed` (step_id=7) | 30–50% | 40% | < 20% |
| 14 | Step 5 → 20 outreach actions logged | `milestone_earned` (outreach_twenty) | n/a (UnlockSaaS-specific) | 60% of Core subs | **< 40% = guarantee economy breaks** |
| 15 | 20 actions → First Customer Verified | `first_customer_verified` | n/a | 35% of those who hit 20 | < 15% |
| 16 | Day 60 → Verified OR Refund | `first_customer_verified` ∪ refund | n/a | Verified > refund 2:1 | Refund > verified |
| 17 | Soap Opera Day 0 → Day 5 completion | `email_sent` per day | 70%+ stay subscribed | 80% | < 55% |
| 18 | Soap Opera → $1 click | `starter_checkout_clicked` from email | 5–12% of subscribers | 8% | < 3% |
| 19 | Active sub → Month 2 invoice paid | `invoice_payment_succeeded` (2nd) | 80%+ (SaaS canon) | 85% | < 65% |
| 20 | Active sub → Month 3 invoice paid | `invoice_payment_succeeded` (3rd) | 70%+ | 75% | < 55% |

**The two red-lines that decide whether UnlockSaaS lives or dies:**
- **Row 14** (Step 5 outreach completion) — if Alexes do not press send 20 times, the guarantee mechanism fires refunds at scale and the business model collapses.
- **Row 16** (Verified > refund at day 60) — the founding promise. If this inverts, the offer is wrong, not the funnel.

Everything else is optimization. These two are existential.

---

## Part 3: The Audible Library

For each step, the top three leak hypotheses, the audible options ranked by leverage, and the decision rule for which to fire.

### Step 2 — Hub → Diagnostic squeeze (target 40%, red-line 20%)

**Leak hypotheses, in priority order:**
1. The hero hook is not a pain mirror — visitors don't feel "this is about me" in the first 3 seconds.
2. The three-CTA fork (Diagnostic / $1 / $49) creates choice paralysis on cold traffic. Cold should see one door.
3. The enemy sentence is too long; eye lands on the AC bio first.

**Audibles, ranked by leverage:**
- **A.** Swap H1 from enemy sentence to Hook #3 (pain mirror): *"Your product isn't broken. It was built for no one in particular."* (Pre-staged in Part 8.)
- **B.** Hide the $1 and $49 CTAs on cold traffic (referrer = X/IH/Reddit/Google); show only "Get Your Free Diagnosis." Keep all three on warm/direct traffic.
- **C.** Move enemy sentence below the AC bio; promote a tighter sub-hook to the H1 slot.

**Decision rule:**
- If hub → diagnostic conversion < 20% after 200 hub views, fire **A** first.
- If still < 25% after 200 more views, fire **B**.
- If still < 30% after 200 more views, fire **C**.
- One change at a time. Hold 200 views minimum before swapping.

### Step 3 — Diagnostic squeeze → form submit (target 30%, red-line 15%)

**Leak hypotheses:**
1. Friction: form asks for product URL + email when one is enough.
2. Promise: the page promises "diagnosis" but doesn't show the three-label preview, so visitors don't know what they're agreeing to.
3. Trust: no founder face on the squeeze; cold visitors don't know who they're handing email to.

**Audibles:**
- **A.** Drop product URL field; collect email only, ask URL after submit. Diagnosis quality drops 15%; opt-in rate rises 30%+ (Brunson canon).
- **B.** Add 3-line label preview above the form: *"You will get one of three diagnoses: Wrong Person, Weak Offer, Weak Belief. Then the door that fixes it."*
- **C.** Add founder photo + one-line bio above the form.

**Decision rule:**
- If form submit < 15% after 300 views, fire **B** first (cheapest, no friction reduction).
- If still < 20% after 300 more, fire **C**.
- Only fire **A** if both B and C land and conversion still < 25% — A trades diagnosis quality for raw volume, which is a Phase 2 tradeoff, not a launch tradeoff.

### Step 5 — Diagnostic result → $1 Starter click (target 28%, red-line 15%)

**Leak hypotheses:**
1. The per-label handoff banner is too soft; the CTA is the same regardless of label.
2. "$1" is being read as "trial" not "complete deliverable"; Alex fears auto-renewal.
3. The result page reads as the END of the funnel rather than the MIDDLE.

**Audibles:**
- **A.** Strengthen the per-label CTA from "Fix this for $1" to label-specific: Wrong Person → *"Pin your real customer for $1."* / Weak Offer → *"Write your real offer for $1."* / Weak Belief → *"Start where the problem actually is — $1."*
- **B.** Add a single-line clarifier under the CTA: *"$1. One-time. No subscription. No auto-upgrade."* (Already on /starter — promote to /diagnostic/result.)
- **C.** Re-frame the result-page sub-head from "Here is your diagnosis" to "Here is what's wrong. Here is the door."

**Decision rule:**
- If result → starter click < 15% after 100 diagnoses, fire **A**.
- If still < 20% after 100 more, fire **B**.
- Reserve **C** as a copy refresh once 300+ diagnoses have flowed.

### Step 8 — OTO viewed → upgrade clicked (target 22%, red-line 10%)

**Leak hypotheses:**
1. OTO page is too short for cold-warm graduates; Big Domino belief never lands.
2. The secondary CTA "No thanks, deliver just the Starter" is too prominent; Brunson rule = make the no-button smaller, the yes-button enormous.
3. No social proof on the OTO; one-decision page reads as high-pressure with no signal.

**Audibles:**
- **A.** Lengthen the OTO page with Big Domino slides 1–6 (from workbook 07 Section 1). Visitor crosses the belief bridge before the button. (Pre-staged in Part 8.)
- **B.** Shrink the "No thanks" button to a small grey link below the primary CTA. Primary becomes full-width, 24px text, contrast color.
- **C.** Once the first verified customer exists, add a single-line testimonial above the primary CTA. Until then, this audible is a counterfeit.

**Decision rule:**
- If OTO upgrade-click < 10% after 30 OTO views, fire **B** (smallest change, highest leverage).
- If still < 15% after 30 more, fire **A**.
- Hold **C** until row 16 (verified > refund) is met.

### Step 11 — Playbook Step 1 completion (target 75%, red-line 50%)

**Leak hypotheses:**
1. First question is too abstract; visitor stalls.
2. Engine pushback tone reads as combative, not coaching; visitor rage-quits.
3. No progress indicator; visitor doesn't know how many questions remain.

**Audibles:**
- **A.** Soften pushback prompt: change "That's a category, not a person" to "That sounds like a category. Pick one specific human and try again — I'll help."
- **B.** Add a "1 of 5" progress chip at the top of the step page.
- **C.** Add a "Skip for now, come back" escape hatch that saves draft state but blocks milestone fire until completion.

**Decision rule:**
- If Step 1 completion < 50% AND median engine pushbacks per user > 3, fire **A** first.
- If completion < 50% AND median pushbacks ≤ 2, the visitor is bouncing on layout — fire **B**.
- Reserve **C** for after 50 paying customers — too many escape hatches early kills the "doing environment" identity.

### Step 14 — 20 outreach actions logged (target 60% of Core subs, **red-line 40%**)

This is the existential row. Every audible here is high-leverage.

**Leak hypotheses (this is the avoidance disease the product is designed to cure):**
1. The 20-action threshold feels insurmountable; founder doesn't start.
2. The Dream 100 picker isn't suggesting the right targets; founder doesn't know who to message.
3. The "verify link is live" step is too technical; founder posts but doesn't log.

**Audibles:**
- **A.** Reframe the threshold as a daily cadence: "1 outreach today" not "20 outreach total." Counter shows day-1-of-20. Streak mechanic with the 14-Day First-Customer Sprint bonus.
- **B.** Auto-suggest the next 5 Dream 100 targets based on completed Steps 1 + 2 (the engine already has the avatar and the offer). Founder one-clicks to compose.
- **C.** Auto-poll the public_link every 6 hours after submission; mark verified_live without founder intervention. Found in the existing schema: `outreach_actions.verified_live`.

**Decision rule (fire aggressively — this row is the business model):**
- If, at day 14 post-Core, > 40% of subs have logged < 3 outreach actions, fire **A** and **B** TOGETHER. This is the only place in the playbook where two audibles fire at once, because the cost of waiting is refund liability.
- If still < 5 actions logged at day 28, fire **C**.
- If still < 10 actions logged at day 45, the product is broken at the level of the offer — escalate to **Revision Mode** in `brunson-architect`, not an audible.

### Step 19 — Month 2 invoice paid (target 85%, red-line 65%)

**Leak hypotheses:**
1. Founder finished the Playbook but didn't hit a verified customer; charges them month 2 anyway with no win to anchor the renewal.
2. The 60-day clock makes month 2 feel like "the dread month" — money out before guarantee evaluation.
3. Cancellation UX in Customer Portal is too easy; no save-flow.

**Audibles:**
- **A.** Day-30 progress email: shows milestones completed, names the gap, offers a 1:1 audit call (founder-time, not scalable but high-leverage during launch).
- **B.** Day-45 email: pre-frames the guarantee math. "You're paying $49 for month 2. If month 3 starts and you have not converted, both months come back. You are not at risk."
- **C.** Customer Portal cancel flow: surface a "pause for 30 days" option (currently disabled per "no leaky bucket"). Reconsider this rule once the data forces it.

**Decision rule:**
- If month 2 retention < 65% after 10+ Core subs aged 60+ days, fire **A** and **B**. These are content audibles, not structural — fire both.
- Hold **C** unless 3+ cancellations cite "wasn't ready" as reason — then revisit the no-leaky-bucket rule in Revision Mode.

---

## Part 4: The Trigger Matrix

The complete decision table. One number per row. Read top-down weekly.

| Row | Metric | Window | Red-line | Audible to fire first |
|---|---|---|---|---|
| 2 | Hub → Diagnostic | 200 hub views | < 20% | Step 2 / A |
| 3 | Squeeze opt-in | 300 squeeze views | < 15% | Step 3 / B |
| 5 | Result → Starter click | 100 diagnoses | < 15% | Step 5 / A |
| 6 | Starter checkout success | 20 attempts | < 50% | Investigate Stripe + payment UX (escalation, not audible) |
| 8 | OTO take-rate | 30 OTOs | < 10% | Step 8 / B |
| 11 | Step 1 completion | 20 Step-1-starters | < 50% | Step 11 / A or B by pushback count |
| 13 | Full Playbook completion | 10 Core-subs aged 30+ days | < 20% | Investigate step-specific dropoff before audible |
| **14** | **20-outreach-action rate** | **10 Core-subs aged 14+ days** | **< 40%** | **Step 14 / A+B (both)** |
| 16 | Verified > refund ratio | 5 Core-subs aged 60+ days | inverted | Revision Mode (offer/avatar/price) |
| 17 | Soap Opera Day 0 → 5 | 30 SOS starters | < 55% | Investigate per-day open rate; audible the lowest-open email subject |
| 18 | SOS → $1 click | 50 SOS subscribers | < 3% | Rewrite Email 5 CTA + PS lines |
| 19 | Month 2 retention | 10 Core-subs aged 60+ days | < 65% | Step 19 / A+B |
| 20 | Month 3 retention | 10 Core-subs aged 90+ days | < 55% | Revision Mode (delivery + onboarding) |
| A/B identity | Verified vs Paid Builders | 200 exposures per variant | 95% confidence per Hard Rule #10 | Retire losing variant; lock winner |

**Rule of thumb:** never audible on fewer than the window count. Small samples lie. Brunson's exception: row 14 fires earlier because the business model is non-recoverable below 40%.

---

## Part 5: The Audit Cadence

### Daily (first 100 site visitors per page)
- Funnel hub views
- Diagnostic submissions
- Stripe events (any)

**Why daily early:** the first 100 visitors teach you more than the next 1,000. You want to catch a broken thing inside 24 hours, not 7 days.

### Weekly (post-100 visitors)
- Every row in the Trigger Matrix
- Soap Opera per-email open/click/unsubscribe rate
- Verified Builders A/B exposure delta
- Top of funnel by source (X / IH / Reddit / direct)

**The Friday Audible Call:** 30 minutes, every Friday at the same time. Read the dashboard. Identify the worst-performing metric. Fire one audible. Document what you fired and the prediction. Re-read the same metric next Friday.

### Monthly (post-30-day Core-subs)
- Month-2 retention cohort
- Month-3 retention cohort
- Guarantee verification rate vs refund rate
- Step-completion funnel for Core subs

### Quarterly
- Full strategy re-read. Are the workbook decisions still defensible?
- Funnel hack 3 competitors (use `brunson-funnel-hacker` skill).
- Update Dream 100 ranking.

### Per-event (no schedule)
- Any refund triggered → log reason, look for pattern
- Any verified customer → public proof loop (workbook 10 §8 butterfly marketing)
- Any single-day traffic > 3× baseline → identify source, double down or document for replication

---

## Part 6: The Dashboards

### PostHog (top of funnel, client-side events)
Source: `app/src/lib/analytics/events.ts`. Build these as PostHog Insights:

1. **Acquisition funnel** — `funnel_hub_viewed` → `diagnostic_page_viewed` → `diagnostic_form_submitted` → `diagnostic_result_viewed`. Grouped by referrer host.
2. **Squeeze conversion** — single number: `diagnostic_form_submitted` / `diagnostic_page_viewed`. Trendline by week.
3. **Starter funnel** — `starter_page_viewed` → `starter_checkout_clicked` → `starter_purchased`. Grouped by `attribution_from` property.
4. **OTO funnel** — `oto_page_viewed` → `oto_upgrade_clicked` → `playbook_subscribed`. Single take-rate number.
5. **Playbook progression** — `playbook_step_completed` cohort by `step_id`. Read as a funnel: how many start Step 1 → how many finish Step 7.
6. **Engine pushback density** — `playbook_engine_pushback` count per user per step. If > 4, the question is poorly worded and an audible is the rewrite.
7. **VSL completion** — `vsl_played` → `vsl_completed` per surface. Activates once the founder video ships.
8. **Identity A/B** — `ab_tests` table; the `infrastructure.read_query` in `state.json` is the canonical query.

### Supabase SQL views (mid- and conversion-funnel, server-side truth)
Source: `supabase/views/funnel_audibles.sql`. These are the views that back the weekly audible call:

1. `funnel_audibles__diagnostic_conversion` — per-day diagnoses → starter purchases by label.
2. `funnel_audibles__starter_to_core` — per-cohort starter buyers → core subs.
3. `funnel_audibles__outreach_velocity` — days from Core start to 20-action milestone.
4. `funnel_audibles__guarantee_pressure` — active Core subs approaching day-60 without a verified charge.
5. `funnel_audibles__ab_identity_results` — Verified vs Paid Builders by conversion event.
6. `funnel_audibles__soap_opera_funnel` — per-day SOS cohort with active / unsubscribed / completed counts.
7. `funnel_audibles__refund_eligible` — Hard Rule #4 refund queue.
8. `funnel_audibles__weekly_top_of_funnel` — single-row weekly summary; the input to the Friday Audible Call.

### The One Number Per Step view
The Friday Audible Call reads exactly one screen: `select * from public.funnel_audibles__weekly_top_of_funnel;`. That row holds the 14 most consequential metrics in column order matching the Trigger Matrix. Anyone glancing at it in 60 seconds should be able to point at the column that's red.

---

## Part 7: The Anti-Audibles (Brunson's "don't touch")

The following look like audibles but aren't. Resist them.

1. **Rebrand on launch dip.** The first dip after launch is not a positioning problem; it's a traffic problem. Audible the channel mix, not the name.
2. **Lower the price.** Alex is a skeptic. Price reduction confirms his "this isn't real" suspicion. Lower price ≠ higher conversion in this avatar (`state.json` `values_caveat`).
3. **Add fake scarcity.** Workbook 07 explicitly REJECTED scarcity for this avatar. Reintroducing it is not an audible; it's a strategy violation.
4. **Add testimonials before you have customers.** A staged or borrowed testimonial breaks the Reluctant Hero identity and trips Alex's "another guru" filter.
5. **A/B test the avatar.** Alex is locked. Testing "Alex vs Bob the developer" is not an audible; it's reopening Q1 of the Secret Formula.
6. **A/B test the guarantee mechanic.** The 60-day-or-refund is the spine of the offer. Testing it is reopening the offer.
7. **Polish the engine pushback to be polite.** Alex's avoidance disease is treated by friction. Removing friction in the name of "user-friendliness" treats the symptom and worsens the disease.

When tempted by any of the above: re-read the workbook section that locked the decision before changing anything. If the change is real, it is a Revision, not an Audible. Document accordingly.

---

## Part 8: The Pre-Staged Copy Vault

These are the alternates that can be swapped in inside 10 minutes when the trigger fires.

### Headline alternates — Funnel Hub (`/`)

**Current (canonical):** *"The problem stuck founders have is not the product. It is that an entire industry profits from teaching them to keep building when the only thing left is to sell."*

**Alt A (pain mirror, Hook #3):** *"Your product isn't broken. It was built for no one in particular."*

**Alt B (guarantee-forward, Hook #8):** *"First paying customer in 60 days. Verified by your own Stripe. Or you don't pay."*

**Alt C (contrarian, Hook #10):** *"The work that gets you paid is the work nobody taught you. We built the playbook that runs it."*

### Sub-hook alternates — Funnel Hub
**Current:** *"Marketer, non-engineer, built a dozen AI products that nobody paid for. Then I figured out why."*

**Alt:** *"For non-engineers who already shipped — and are still waiting for the first charge."*

### Diagnostic squeeze headline (`/diagnostic`)

**Alt A:** *"Two questions. Sixty seconds. The honest read on why your launch went flat."*

**Alt B:** *"Wrong Person, Weak Offer, or Weak Belief. Pick one. I'll tell you which is yours."*

### Diagnostic result CTA — per label

| Label | Current CTA | Alt CTA |
|---|---|---|
| wrong_person | "Fix this for $1" | "Pin your real customer for $1." |
| weak_offer | "Fix this for $1" | "Write your real offer for $1." |
| weak_belief | "Fix this for $1" | "Start where the problem actually is — $1." |
| error | "Fix this for $1" | "Skip the diagnosis. Start the Playbook for $1." |

### $1 Starter headline (`/starter`)

**Current:** *"Finish your dream customer and your offer this week. For one dollar."*

**Alt A (specificity push):** *"By Friday, you will have one real customer named and one real offer written. For one dollar."*

**Alt B (skeptic-forward):** *"One dollar. One week. Two finished deliverables. No subscription. No upgrade trick."*

### OTO primary button (`/oto`)

**Current:** *"Continue the Playbook. $49/mo. 60-day guarantee."*

**Alt A:** *"Get my first paying customer in 60 days — $49/mo, or full refund."*

**Alt B:** *"Run the full Playbook — $49, guaranteed."*

### OTO Big Domino expansion block (pre-staged for Step 8 / audible A)
Drop this above the existing OTO buttons when OTO take-rate drops below 10%.

```
Before you decide, here is the one belief that changes everything:

Your first paying customer is reachable in 60 days through software,
not through more building and not through more traffic.

If you believe that, the $49 is obvious.
If you don't believe it, $1 was the right amount to spend today.

Here is why I believe it: I had the disease, I diagnosed it, I built
the cure, and the cure is mechanical. Steps 3-7 of the Playbook remove
the option to skip the work that gets you paid. The 60-day guarantee
is enforced in code, not in good faith. If the milestones complete and
Stripe shows no new charge, you get both months back.

That's the bet. Take it or leave it. There is no third option.
```

### Soap Opera subject line alternates

| Day | Current direction | Alt A | Alt B |
|---|---|---|---|
| 0 | per-label diagnosis recap | "I read your page. Here's what I saw." | "Wrong Person / Weak Offer / Weak Belief — which one is yours?" |
| 1 | the blank offer page parable | "The day I sat down to write my offer" | "I had nothing. Just a flat Stripe line." |
| 2 | Stripe refresh parable | "How many times have you refreshed Stripe today?" | "The most expensive way to avoid the work" |
| 3 | SEO escape hatch parable | "Why I went embarrassingly deep into SEO" | "The work I was avoiding had a name" |
| 4 | mirror in ten founders | "I heard my own story back, ten times" | "The conversation that broke me out" |
| 5 | Hook #8 + Stack offer | "60 days. First customer. Or full refund." | "Here is what $49 buys you" |

### Engine pushback alternates (Playbook Step 1)

**Current (combative):** *"That's a category, not a person."*

**Alt A (coaching):** *"That sounds like a category. Try a specific human and I'll help you sharpen them."*

**Alt B (Socratic):** *"What's the name of one person who fits that description? Just one."*

**Audible trigger:** if Step 1 rage-quit rate (started, < 30% completion within 24h) > 50%, swap from Current → Alt B.

### Refund email template (pre-staged for Hard Rule #4)
Maryan needs this written and ready before the first day-60 evaluation, not invented under pressure.

```
Subject: Your guarantee is real. Refund inbound.

Hi {first_name},

It's day 60. You completed the work-condition milestones inside the Playbook.
Stripe shows no new paying customer.

Per the guarantee: both months back. $98 has been refunded to the card on file —
you should see it inside 5-10 business days.

I want to know what happened. Not to argue. To learn. If you have 15 minutes
this week, I'll send you a Cal link and I'll buy the call back with whatever
I learn from it. Reply with "yes" if you're willing.

— Maryan
```

---

## Part 9: The Audible Veto List (workbook-locked, NOT audibleable)

Per `project_unlocksaas_strategy.md`, the following decisions are locked. Changing them is **Revision Mode**, not an audible. Revision Mode requires updating the relevant workbook file AND `state.json` AND documenting the rationale in `revision_history`.

| Locked decision | Source | What "audible" looks like that would actually be Revision |
|---|---|---|
| Avatar: Alex | workbook 01 Q1 | Targeting "developer founders" or "agency owners" |
| Price: $49/mo Core, $1 Starter | workbook 01 §2 + 03 | Lowering / raising / annualizing |
| Guarantee: 60 days, $98 cap, Stripe-verified | workbook 01 §2 | Extending duration; changing remedy; manual verification |
| Identity: Reluctant Hero | workbook 01 §6 | Switching to Leader or Adventurer voice |
| Identity label: A/B is Verified vs Paid Builders | workbook 05 §7 + Hard Rule #10 | Adding a third variant; ending A/B before 200 exposures per variant |
| Channels: X + IH + r/SaaS + r/microsaas at launch | workbook 09 | Adding Instagram/TikTok/LinkedIn pre-PMF |
| Scarcity: rejected | workbook 07 §3 | Adding any countdown / "X seats" / "limited" copy |
| Affiliate: deferred to 50 paying customers | workbook 10 | Launching affiliate pre-revenue |
| Design principle: framework into the engine | workbook 01 §6 dogfood note | Adding 14-field forms; "configure your AC" pages |

**Discipline test:** before firing any audible, check if the change touches a row above. If yes, stop. Open the workbook. Decide if you're entering Revision Mode with full documentation, or backing off. The "I'll just tweak it" path is how locked strategies erode in 30 days.

---

## Closing — the Friday Audible Call

The whole playbook compresses into one ritual.

Every Friday, 30 minutes:

1. Open `funnel_audibles__weekly_top_of_funnel`. Read the row.
2. Identify the worst metric vs Target (Part 2 column 4).
3. Cross-check it against the Trigger Matrix (Part 4). If it's below the red-line AND the window count is met, fire the **first** audible listed for that row.
4. Pull the alternate copy from Part 8. Swap. Deploy.
5. Write one line in `build-log.md` under "Audibles": date, metric, audible fired, prediction.
6. Re-read the same metric next Friday. Did it move? Document the result.

Audibles don't compound from cleverness. They compound from the **discipline of the Friday Call**. The playbook is the call's preparation. Run the call.

— locked 2026-05-17.
