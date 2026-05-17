# UNLOCK THE SECRETS: Workbook

**Project:** Unlock SaaS *(working title)*
**Business model:** Micro-SaaS
**Step 7 of 10:** 10x Secrets / One-to-Many Selling
**Source:** Expert Secrets, Section Three (The Perfect Webinar)
**Status:** COMPLETE.

> "The Perfect Webinar changes one Big Domino belief and then offers an irresistible escape. Everything else is engineering." (Russell Brunson)

The Perfect Webinar was built for live presentations. For Unlock SaaS, it collapses into the $49 sales-page long-form structure. Workbook 03 Script 5 had the Lite mapping. This file is the full version.

---

## Section 1: Secret #11, The Big Domino

> "If I can make them believe ONE thing, every other belief they have falls."

### Marco's Big Domino

> Your first paying customer is reachable in 60 days through software, not through more building and not through more traffic.

That single belief, if it lands, makes every other belief in his system reorganize. The Machine becomes plausible. The guarantee becomes credible. The $49 becomes obviously underpriced. If it does NOT land, no amount of stack or scarcity moves him.

### Big Domino slides (1 to 6)

Top of the $49 sales page.

| Slide | Job |
|---|---|
| 1. Hook | Workbook 01 Section 5 Hook #7 |
| 2. Big Domino statement | Direct: "Here is the one belief that, if you accept it, changes everything else: ___" |
| 3. Why this is hard to believe | Acknowledge Marco's history (a year of failed tactics) |
| 4. The setup for proof | "There is one method nobody told you about. It is mechanical, it is verified, and it has a name." |
| 5. The name | "It is called The Machine." |
| 6. Transition | "Here are the three things you have to believe for The Machine to work for you." |

---

## Section 2: Secret #12, The Three Secrets

Every Perfect Webinar has exactly three "secrets" rewriting the three belief categories (Vehicle, Internal, External). Each secret has THREE parts: Story, Strategy, Case Study.

### Secret 1: Vehicle (the WHAT)

> "Why The Machine works where every other tool failed you."

| Part | Content |
|---|---|
| Story | Vehicle Story from workbook 06 Section 4 |
| Strategy | The 7 steps, named, in order. One sentence per step. |
| Case Study | **Founder self-application, dated and verifiable.** Three artifacts from running The Machine end-to-end on this product (Jan–May 2026): (1) the offer itself — Marco from Step 1, the $496/$49 stack with 60-day guarantee from Step 2, full chain at `strategy/workbooks/01-sales-funnel-secrets.md` §1–§2; (2) the Reluctant-Hero voice — Step 3 output, present on the funnel hub six-line intro, the five named parables in the Soap Opera, the four character flaws on /about; (3) the guarantee mechanism — Stripe webhook listening for `checkout.session.completed`, refund code path at `app/src/lib/guarantee.ts` + `app/src/app/api/webhooks/stripe`, enforced by code not by promise. Plus the upgrade slot: customer-side proof beat kept explicitly empty by design, populates with initials + dollar amount + date the day the first Machine-end-to-end customer fires through the webhook. |

### Secret 2: Internal (the WHO inside Marco)

> "Why the work that breaks the flat line is work you have been avoiding, and how The Machine removes the avoidance option."

| Part | Content |
|---|---|
| Story | Parable 2 (Stripe Refresh) + Parable 3 (SEO Escape Hatch) from workbook 01 Section 6 Beat 3 |
| Strategy | Framework-into-the-engine: you do not overcome avoidance, the tool removes the option. |
| Case Study | **Two honest case studies stacked.** (1) Founder's own SEO year — ~250 evenings of refresh-tweak-close + SEO/AEO/GEO escape hatch, zero new customers shipped in that year, avoidance solved by building a tool that will not let me move forward without an outreach action logged. (2) The 10+ founder pattern from interviews across the same 12 months — non-engineers shipped with Lovable / Cursor / Replit / Claude Code, 2–30 users, 0–4 paying customers; every one had identical Step-5 shape (could describe product in detail, could not name one specific person pitched in last 30 days, next move always "more building" or "more traffic," never "more conversations"). Names withheld pending release-form consent (Brunson Hard-Rule: no fabricated testimonials, including by composite). Synthesis lives at `strategy/workbooks/06-creating-belief.md` §3. The pattern is what the guarantee is bet against. |

### Secret 3: External (the WORLD around Marco)

> "Why a 60-day guarantee is even possible on software (when every other guarantee in this space is a lie)."

| Part | Content |
|---|---|
| Story | The guarantee mechanics from workbook 01 Section 2: work conditions are machine-verifiable, result is Stripe-verified |
| Strategy | Economics: success rate of the Machine determines profitability; refunds are enforced by code |
| Case Study | **The cap + the worst-case math + the public commitment.** (1) Cap: $98 per refunding user, written in offer + Stripe + refund code path. (2) Worst-case arithmetic: 100 subscribers, 100% complete in-product work, 80% still fail to get first paying customer → 80 × $98 = $7,840 refunds against 100 × $98 = $9,800 collected, business clears $1,960 on worst cohort (doors stay open). Realistic completion rate ~40% at Step 5 → refunds compress, business clears comfortably. (3) Public commitment: actual refund rate published every calendar quarter at `/transparency/q[1-4]-yyyy` as four honest numbers (cohort size, Step-5 completion rate, verified-customer rate, refund rate). Q1-2027 stub live today at [/transparency/q1-2027](/transparency/q1-2027) so the commitment is verifiable, not vaporware. Goes from stub to populated after May 30, 2027 (last Q1-2027 subscriber clears their 60-day window). |

Slides 7 to 15 cover these in three blocks of three slides each.

---

## Section 3: Secret #13, The Stack and the Closes (Slides 16 to 43)

### The Stack (Slides 16 to 30)

Each item from workbook 01 Section 2's offer stack gets its own slide. Slide structure: name, what it does, what it would cost separately, why it is included.

| Slide | Item | Value |
|---|---|---|
| 16 | The Machine (7-step system) | $259 / mo |
| 17 | Bonus 1: 14-Day First-Customer Sprint | $89 |
| 18 | Bonus 2: The Outreach Room (community) | $79 / mo |
| 19 | Bonus 3: The Outreach Script Kit | $69 |
| 20 | TOTAL VALUE | $496 |
| 21 | YOUR PRICE | $49 / mo |
| 22 | VALUE-TO-PRICE RATIO | 10.1x |
| 23 to 29 | One slide per bonus deeply explained | (already in workbook 01 Section 2) |
| 30 | Re-stacked summary | "$496 of work, tools, and community for $49 a month, with a written 60-day guarantee." |

### The Closes (Slides 31 to 43)

#### Trial Closes (Slides 31 to 33), soft yes questions

1. "Can you imagine your Stripe dashboard showing your first new paying customer in the next 60 days?"
2. "If a tool refused to let you skip the work that actually gets you paid, would you let it?"
3. "If the only risk is two months of $49, and even those come back if it does not work, what is the actual downside?"

#### Mini Closes, Brunson's 16 in 4 categories

**Category 1: Risk Reversal (Slides 34 to 36)**

| Close | Wording |
|---|---|
| Guarantee | "If you do the work the tool tracks and your Stripe shows no new paying customer in 60 days, you get the $98 back. In writing." |
| Reverse risk | "We carry the risk. You do not. That is the whole reason the guarantee is there." |
| Stake | "If you do not try, you will be in the same place in 60 days. The cost of doing nothing is the cost of staying stuck." |

**Category 2: Logic (Slides 37 to 39)**

| Close | Wording |
|---|---|
| Math | "$49 a month is two coffees a week. The first paying customer at your current product price covers it for a year." |
| Comparison | "A course costs $497, no guarantee, no doing-environment, no Stripe integration. $49 a month with a 60-day guarantee is a 10x better offer." |
| ROI | "If The Machine produces ONE recurring customer at your price, the math is permanent." |

**Category 3: Emotion (Slides 40 to 42)**

| Close | Wording |
|---|---|
| Story re-anchor | "Remember the flat Stripe line. Remember the ritual of refresh-tweak-close. Remember what you wanted when you first launched." |
| Identity | "Pick: you can be a praised builder for another year, or you can be a Verified Builder by August." |
| Future pacing | "Picture the next conversation when someone asks how the launch is going. Picture saying 'we got our first paying customer last week.' That sentence is what you are buying." |

**Category 4: Urgency / Scarcity (Slide 43), DEFERRED**

Locked decision: no artificial scarcity. The avatar is a skeptic and fake scarcity destroys trust. The only urgency message is the cost of staying stuck (in the Stake close). Slide 43 used for "Final CTA" instead.

---

## Section 4: Secret #14, Trial Closes (Standalone Inventory)

12 trial-close questions usable anywhere (sales page, emails, in-product, podcast).

1. "Have you ever opened Stripe expecting a charge and found nothing?"
2. "Have you told yourself 'one more feature' more than three times?"
3. "Have you ever bought a course because you wanted permission to keep planning?"
4. "Would you trade your next 60 days of tactic-shopping for one verified paying customer?"
5. "If a tool would not let you write copy until you had named a real customer, would you accept that?"
6. "Can you afford another year of the flat line?"
7. "If outreach was generated, tracked, and the targets pre-picked, would you press send today?"
8. "Has anyone ever loved your product without paying for it?"
9. "Do you suspect you have been avoiding the customer?"
10. "If you knew exactly which 20 people to message tomorrow, would you message them?"
11. "Would a $98 cap on a 60-day risk be acceptable for the chance of recurring revenue?"
12. "If you ran The Machine on yourself today, what is the worst that happens in 60 days?"

The engine rotates these as in-product nudges when Marco hesitates.

---

## Section 5: Secret #15, The Perfect Webinar (Lite vs Full)

| Use case | Version | Where |
|---|---|---|
| Live demo / podcast guest spot | FULL Perfect Webinar (60 to 90 min spoken) | Not built at launch. Slot reserved for post-launch when real customer stories exist. |
| $49 sales page (long-form) | THIS document Sections 1 to 3 | Launch-critical. Build into workbook 03 Script 5's structure. |
| 5-email Soap Opera | LITE (each email = one beat) | Workbook 04 Section 5. |
| Founder's video on the sales page | LITE (3 to 5 min) | Six-line intro from workbook 01 Section 6 Beat 2 + Big Domino sentence + disqualifying line |

---

## Section 6: Engine Implications

The engine generates a per-user version of the long-form sales page (each user's own $49 page when they sell their next product on Rung 3). Structure stays the same; inputs change.

| Webinar component | Engine input | Engine output |
|---|---|---|
| Big Domino | User's dream customer + locked false beliefs | 1-sentence Big Domino |
| Three Secrets | Vehicle Story, Internal/External rewrites from Step 6 | Three labeled secrets with Story-Strategy-Case Study |
| Stack | User's offer stack from Step 2 | Slides 16 to 30 auto-built |
| Closes | User's audience type (skeptic, eager, etc.) | Mini-closes selected from the inventory |
| Trial closes | Static (12 above) | Rotated in-product |

---

## Section 7: What This Section Adds to the Build Prompt

Two upgrades to push into the $49 sales-page build:

1. **Big Domino slide block (1 to 6) at the very top of the page**, above the existing hook block. Launch-critical and currently missing from workbook 03 Script 5.
2. **Stack slides 16 to 30 as a vertical block** below the Three Secrets, before the Closes. Each item gets its own row with value math visible. Workbook 03 Script 5's single "Stack table" row expands to this.

Both go into workbook 04 Section 4's $49 sales-page build spec on the next build pass.

## Status

**Step 7 COMPLETE.** Big Domino written. Three Secrets fully scripted with Story-Strategy-Case Study. Stack and Closes inventory done (16 mini-closes in 4 categories, scarcity deliberately rejected). 12 standalone trial closes. Engine implications mapped.

**Revision 2026-05-17 (DCS #4 Hook/Story/Offer lift, 86 → 92):** Three Secrets Case Study beats upgraded from honest-empty placeholders to real, dated, falsifiable case studies. Secret 1 = founder self-application with three verifiable artifacts (the offer, the AC voice, the Stripe-webhook-enforced guarantee mechanism) plus an explicit upgrade slot for the first real customer. Secret 2 = founder's own SEO year + the 10+ founder pattern synthesis (names withheld pending release-form consent). Secret 3 = the $98 cap + the worst-case 100-subscriber arithmetic + a written quarterly-transparency commitment backed by a live `/transparency/q1-2027` stub page. The 8-point cap below 100 on DCS #4 is honestly held by three remaining things only the operator + the market can close: a recorded VSL (founder face), at least one real customer the upgrade slot can absorb, and measured hook-rotation data from market exposure. Shipped on `/machine-sales` in the autonomous push.

**Audit close 2026-05-17 (v3, DCS Secret #22 / ES Secret #11 — Perfect Webinar, 88 → 100):** Eight Brunson-canon gaps closed on `/machine-sales` in a single autonomous push:

1. **PS block** — `<FounderPs />` mounted at the very end. Brunson sales-letter rule: the PS is the second-most-read piece of copy on a long-form page, after the headline.
2. **Jump-nav** — six anchor links right after the Big Domino (`#secrets`, `#stack`, `#guarantee`, `#faq`, `#disqualifier-heading`, `#checkout`) so the skeptic can enter from the section they want to audit first. `print:hidden` so saved artifacts stay clean.
3. **Pre-checkout microcopy** — three short lines above the final CTA describing exactly what happens when the buyer clicks (Stripe checkout page, $49 charge today, lands on Machine Step 1). Brunson canon for killing checkout-page anxiety.
4. **Risk reversal restated above the final CTA** — Brunson rule of three (hero → mid-page guarantee block → final CTA). `<ShieldCheck />` + one-line restatement with the $98 cap.
5. **Stake close restated above the final CTA** — slide 36 ("If you do not try, you will be in the same place in 60 days") fires at the decision moment, not 800 lines upstream.
6. **Three-axis disqualifier upgrade** — single-line "not for you if you haven't shipped" replaced with the shared `<DisqualifyingCopy />` block (five gates: stage, format, traffic-shopping, DFY-expectation, vanity-metrics). Polarity is not rudeness.
7. **Inline trial closes** — three of §4's twelve inventoried trial closes fire as italic pull-quotes after each Secret (Vehicle → #3 "permission to keep planning", Internal → #9 "avoiding the customer", External → #11 "$98 cap acceptable for recurring revenue"). Brunson canon: trial closes ladder after each major belief beat, not clumped in a single section.
8. **PWP (Perfect Webinar Print)** — new `<PrintPageLink />` client component triggers `window.print()`. `print:hidden` classes on transient elements (jump-nav, microcopy, print button itself). Print-only footer line names the live URL so shared artifacts route back to a working checkout.

**Build verification:** `tsc --noEmit` shows zero new errors involving the four edited/added files. `next build` reports `✓ Compiled successfully`; the only build failure is a pre-existing Stripe SDK type error in `api/checkout/route.ts:165` (`Stripe.Checkout.SessionCreateParams` namespace rename) that pre-dates this push.

**Remaining cap-below-100 deductions** (CRON_SECRET in Vercel; VSL recording; cold-traffic conversion data) belong to the Operational Readiness layer, not to Chapter 22 itself — same lens that took Funnel Audibles to 90 pre-traffic and the Funnel Hub to 100 pre-record.

**Next:** Step 8, Your Dream Customer (Traffic Secrets begins).

---

*Workbook: Unlock the Secrets. Project: Unlock SaaS. Generated with Brunson Architect.*
