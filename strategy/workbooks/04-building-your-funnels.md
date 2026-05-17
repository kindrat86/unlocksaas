# UNLOCK THE SECRETS: Workbook

**Project:** Unlock SaaS *(working title)*
**Business model:** Micro-SaaS
**Step 4 of 4:** Building Your Funnels
**Status:** COMPLETE. This closes the Unlock the Secrets workbook.

> "Pick one funnel. Build it end to end. Ship it before you start the next one." (Russell Brunson, Secret #26)

This step is the build spec. Page by page, for each of the three launch funnels, plus the Soap Opera Sequence, the Funnel Audit Worksheet, and the Funnel Hack slot.

---

## Section 1: One Offer, One Funnel (Secret #26)

The first funnel to ship is the **$1 Starter Unboxing Funnel**. The other two wait.

The reasons are locked in workbook 02, Section 6. Repeated here so the build crew (you, your machine, or Claude Code) cannot miss them:

1. The $1 Starter is the cheapest, fastest test of the actual offer copy.
2. It identifies real buyers, the smallest possible Marco-Meter.
3. It pre-qualifies the $49 with paying customers, not signups.
4. The Free Diagnostic is downstream-cheap (build second).
5. The $49 Presentation funnel reuses 90% of the $1 funnel's copy at longer form (build last).

**Build order, locked:**

| Order | Funnel | Why this order |
|---|---|---|
| 1 | $1 Starter Unboxing Funnel | Test the offer cheaply, generate buyers |
| 2 | Free Diagnostic Lead Funnel | Feed emails into the $1 funnel |
| 3 | $49 Machine Presentation Funnel | Convert the $1 buyers and direct cold-warm traffic |

Do not parallelize.

---

## Section 2: $1 Starter Unboxing Funnel — Build Spec

### Page 1: Sales page

| Block | Content source |
|---|---|
| Hero hook | Workbook 03, Script 1 ("$1 Starter" row) |
| Sub-headline | Workbook 01, Section 6 three-line about opener |
| Star Story Solution body | Workbook 03, Script 3 |
| Offer stack table (Starter scope) | Locked: $1 buys Machine Steps 1+2 |
| Guarantee teaser | "Full Machine carries a 60-day guarantee. The Starter delivers a real finished WHO and WHAT, yours to keep, no recurring charge." |
| Polarity AGAINST line | Workbook 01, Section 6 Beat 5, AGAINST #3 ("Validate your idea advice") |
| CTA button | "Start the Machine for $1" |

### Page 2: Order form

Stripe one-time checkout. Email + payment only. No upsells on this page.

### Page 3: OTO (one-time offer)

| Block | Content source |
|---|---|
| Headline | "You are two of seven steps in. Want the rest plus the 60-day guarantee?" |
| Body | Workbook 03, Script 4 |
| Primary button | "Continue the Machine. $49/mo. 60-day guarantee." |
| Secondary link | "No thanks, deliver just the Starter." |

Rules: one decision. Two buttons. No third option.

### Page 4: Confirmation + member area entry

| Block | Content |
|---|---|
| Welcome | Three sentences in Reluctant Hero voice. AC Beat 1 of workbook 01, Section 6. |
| Immediate action | "Start Step 1: Pin your Dream Customer." Big button. |
| Sidebar | All 7 Machine steps visible. Steps 1+2 unlocked. Steps 3-7 locked unless OTO converted. |

### Engine logic for the in-product Machine (Steps 1 and 2 only on $1 tier)

**Step 1: Pin Dream Customer.**

The engine asks five questions, max. NOT a form, a guided conversation:

1. "Who specifically? Give me a real first name and one sentence of context."
2. "What is their biggest pain right now? Quote them if you can."
3. "What have they already tried that did not work?"
4. "What do they secretly want, the thing they will not say out loud?"
5. "Where do they hang out online?"

The engine validates each answer. Vague input gets pushed back ("'Founders' is a category, not a person. Try again with a name and a situation."). Specific input ascends.

**Output:** Marco's dream-customer one-paragraph profile, in his voice, plus a list of three to five congregations.

**Step 2: Build the Offer.**

Four questions, max:

1. "What is the ONE result you guarantee?"
2. "How fast can you deliver it?"
3. "What is your remedy if they do not get it?"
4. "Why is the package you offer 10x what you charge?"

The engine assembles: offer headline + stack outline + guarantee + 10x defensibility check.

**Output:** Marco's irresistible offer in one paragraph plus a stack table.

After Step 2 completes on the $1 tier, the engine surfaces: "You are done with the Starter. Your WHO and WHAT are finished. If you want the rest of the Machine, here is the $49 link."

---

## Section 3: Free Diagnostic Lead Funnel — Build Spec

Build second. Plugs into the top of the $1 funnel.

### Page 1: Squeeze

| Block | Content |
|---|---|
| Hook | Workbook 01, Section 5, Hook #3 |
| Two-field form | Email + product URL |
| AC short bio | Workbook 01, Section 6, the one-line bio |
| CTA | "See why your launch is flat" |
| Footer disclaimer | "We email the diagnosis. No spam. Reply STOP to unsubscribe." |

### Page 2: Diagnostic result

Live evaluator. Reads the submitted URL. Returns one of three labels:

1. **Wrong Person.** "Your copy speaks to a category, not a specific person." 100-word Reluctant Hero explanation. CTA: "Fix this for $1."
2. **Weak Offer.** "Your page describes features. It does not promise a result with a guarantee." Same structure.
3. **Weak Belief.** "Your page assumes the visitor already believes the problem matters. They do not." Same structure.

Each label has its own follow-up email sequence pointer.

### Page 3: 5-Email Soap Opera

See Section 5 below for full copy.

### Page 1b: Reverse Squeeze — `/parables` (DotCom Secrets Secret 14, reverse variant)

Shipped 2026-05-17 to close out DCS Chapter 14 (Lead Squeeze + Reverse Squeeze) at full coverage. Pairs with the standard squeeze at `/diagnostic`. Same Day 0 destination (the Soap Opera Sequence), inverted opt-in mechanic.

| Block | Content |
|---|---|
| Preface | Two short paragraphs framing the five parables and stating explicitly that no email is required to read them |
| Parable 1 | The Blank Offer Page (workbook 01 §6 Beat 3), expanded to ~120 words, pull-quote with the lesson |
| Parable 2 | The Stripe Refresh, same format |
| Parable 3 | The SEO Escape Hatch, same format |
| **Mid-content opt-in** | Card after Parable 3. Soft ask: "Want me to read your live page next? Send me the rest plus the diagnostic." POSTs to `/api/soap-opera/subscribe` with `source="reverse_squeeze_parables_mid_content"` |
| Parable 4 | The Mirror in Ten Founders, same format |
| Parable 5 | The Door That Opened, same format |
| **End-content opt-in** | Card after Parable 5. Stronger ask: "The next five days are by email." Same endpoint, `source="reverse_squeeze_parables_end_content"` |
| Bridge | For readers who skip both opt-ins: two buttons to `/starter` and `/diagnostic` |
| Footer | Signature: "— Maryan" + AC one-line bio (workbook 01 §6 Beat 2) |

**Brunson rules enforced:**
- Value delivered FIRST (no gate above the parables). The reader has already accepted that the Reluctant Hero has something true to say before the email ask appears.
- Two opt-in placements (`mid_content` + `end_content`) tracked separately. The split tells us whether readers bounce mid-page (mid wins) or read all the way through (end wins) — informs whether parable order or length needs to change.
- Same Day 0 destination as the standard squeeze. One Soap Opera Sequence, two doors in.
- Polarity AGAINST line NOT used on this page — the parables themselves are the polarity. Adding the disqualifier would over-egg the pudding.
- The page link is surfaced from `/` (under the hero CTAs) and from `/diagnostic` (under the trust-line). Cold traffic that lands on the standard squeeze but refuses to type an email gets a second door, not a dead end.

**Analytics:** `ParablesPageViewed` on mount + `ParablesOptInSubmitted` with `placement` property on submit (added to `app/src/lib/analytics/events.ts`). Compare opt-in rate by placement to learn where the value crests.

---

## Section 4: $49 Machine Presentation Funnel — Build Spec

Build third.

### Page 1: Sales page

Use the Perfect Webinar Lite structure (workbook 03, Script 5).

| Block | Content source |
|---|---|
| Hero hook | Workbook 03, Script 1 ("$49 Machine" row) |
| Founder video (optional) | Workbook 01, Section 6, the six-line intro spoken on camera, no production. Reluctant Hero voice beats polish. |
| Big Domino | Workbook 01, Section 6 Beat 5 enemy sentence |
| Three Secrets | Three short blocks per Script 5 mapping table |
| The Stack | Workbook 01, Section 2 stack table verbatim |
| Closes block | 3 trial closes + 4 mini closes, drawn from the Section 6 Beat 5 polarity FOR list (each FOR becomes a soft yes-question) |
| Disqualifying copy | "This is not for you if you have not shipped anything yet. Go ship first. Come back when your Stripe is flat." |
| FAQ | Five objections (open item: re-mine the 10+ founder conversations) |
| Two CTAs | "Start the Machine" (primary) + "Try the $1 Starter first" (secondary) |

### Page 2: Checkout

Stripe subscription. Guarantee block restated above the button.

### Page 3: Onboarding

| Step | Action |
|---|---|
| 1 | Connect Stripe (the guarantee verifier) |
| 2 | Import dream customer + offer from $1 Starter, or fresh start |
| 3 | Set 60-day clock (visible countdown in app header) |
| 4 | Land on Machine Step 3 (or Step 1 if fresh) |

### Pages 4 through 10: The Machine

One page per step. Same engine pattern as Steps 1 and 2: human questions in, engine-assembled framework out, never a form.

| Step | Already specced in |
|---|---|
| 1. Pin Dream Customer | Section 2 above |
| 2. Build Offer | Section 2 above |
| 3. Attractive Character | Workbook 01, Section 6 (engine extraction spec) |
| 4. Write Copy (hook + sales page) | Workbook 03, Engine Implications section |
| 5. Generate Outreach Assets + List | Section 6 below |
| 6. Do Outreach (tracked) | Section 6 below |
| 7. Convert + Verify (Stripe) | Section 7 below |

---

## Section 5: Soap Opera Sequence Master (5 Emails)

Used in the Free Diagnostic funnel and as a default nurture for any cold inbound that lands on the $1 Starter without converting.

### Email 1 (Day 0): Diagnosis + Parable

**Subject:** "Your diagnosis is below. Here is what nobody told you about it."
**Body:** Personalized diagnosis label. Then Parable #1 (Blank Offer Page) from workbook 01, Section 6 Beat 3.
**PS:** "If you want to finish your WHO and WHAT for $1, here is the door."

### Email 2 (Day 1): The Hidden Daily Ritual

**Subject:** "Day done. Dinner done. Laptop open. Refresh Stripe."
**Body:** Parable #2 (Stripe Refresh). Explain that the daily ritual of "working on it" is the most expensive form of avoidance.
**PS:** Same $1 link.

### Email 3 (Day 2): Why Peers See What You Cannot

**Subject:** "I had to mute the call and walk around the room."
**Body:** Parable #4 (Mirror in Ten Founders). Bridge to the Outreach Room bonus.
**PS:** Same $1 link.

### Email 4 (Day 3): The Door That Opened

**Subject:** "Why now is different (for non-engineers especially)."
**Body:** Parable #5 (Door That Opened). Polarity FOR #2 (non-engineer who shipped anyway).
**PS:** Same $1 link.

### Email 5 (Day 4): The Soft Close

**Subject:** "Your first paying customer, in writing, or you do not pay."
**Body:** Workbook 01, Section 5, Hook #8 expanded. State the 60-day guarantee plainly. Stack table.
**PS:** "Start at $1 here. Upgrade to the full Machine on the next page. The clock starts when you click."

**Brunson Soap Opera rule (do not violate):** story first, offer at the bottom. Never lead with the pitch.

---

## Section 6: Outreach Engine — Machine Steps 5 and 6 Build Spec

This is the load-bearing pair of in-product steps. Failure here = guarantee refunds. Built right, it is the new opportunity.

### Step 5: Generate Outreach Assets + Target List

Engine output, per Marco's dream customer:

| Asset | Engine produces |
|---|---|
| 20-person target list | Drawn from his named congregations + LinkedIn / X scrape |
| Message v1 | Drawn from his AC voice + AGAINST line + a soft trial close |
| Message v2 | Reframed for a different congregation type |
| Reply scripts | Three branches: interested, "tell me more," objection |
| Cold email template | Same content adapted for 1:1 inbox send |

### Step 6: Do Outreach (Tracked)

Two channels:

1. **Cold email.** Engine sends from Marco's connected inbox. Tracks opens, replies, conversions.
2. **Public platforms (Indie Hackers, r/SaaS, X, Lovable Discord, etc.).** Engine generates the post. Marco posts it from his own account. Marco pastes the public link back into the tool. Tool fetches the link, verifies it is live and authored by him, logs it.

Why the manual loop on public platforms: auto-posting violates platform ToS and gets accounts banned. The guarantee needs TRACK, not SEND. Generating + verifying-the-link clears the bar without the ban risk.

**Counter built into the dashboard:** "You have logged X / 20 outreach actions. Stripe shows Y new paying customers. The Machine fires the celebration when Y becomes 1."

---

## Section 7: Step 7 Build Spec — Convert and Verify

Stripe webhook listens for the first new charge on Marco's connected Stripe account that postdates his onboarding date.

When detected:

1. The Machine fires a celebration screen (Reluctant Hero voice: "There it is. The flat line just moved.").
2. State changes to "First paying customer verified."
3. The 60-day guarantee window auto-closes for refund purposes (he won, no remedy due).
4. Email triggers asking for a one-sentence testimonial. This testimonial replaces the honest Result beat in Section 4's Epiphany Bridge.

If 60 days pass without a Stripe-verified new customer AND the tracked outreach milestones were met, the refund triggers automatically. No human in the loop, no judgment call.

---

## Section 8: Funnel Audit Worksheet (Secret #28, pre-launch sanity)

Run this before flipping each funnel live.

| Check | $1 Starter | Free Diagnostic | $49 Machine |
|---|---|---|---|
| 1. Hook earns 3 seconds (tested on 5 cold readers) | [ ] | [ ] | [ ] |
| 2. AC voice present every page | [ ] | [ ] | [ ] |
| 3. Offer math is defensible to a skeptic | [ ] | n/a | [ ] |
| 4. Risk reversal visible above fold | [ ] | n/a | [ ] |
| 5. Polarity AGAINST line present | [ ] | [ ] | [ ] |
| 6. Each page sells the next, no dead ends | [ ] | [ ] | [ ] |
| 7. Stripe webhook test charge succeeds | [ ] | n/a | [ ] |
| 8. Engine pushback on vague input tested | [ ] | [ ] | [ ] |
| 9. Soap opera emails fire on schedule | n/a | [ ] | [ ] |
| 10. Disqualifying copy present | [ ] | [ ] | [ ] |

A funnel does not ship until every applicable box is checked.

### Section 8b: Funnel Audibles Playbook (Secret #28, live operation)

The audit worksheet above is a one-time pre-launch sanity check. The live, ongoing operation of Secret #28 lives in `strategy/funnel-audibles.md` — the Funnel Audibles Playbook. It covers:

- **The funnel map** (Part 2) — every step with Brunson benchmark, UnlockSaaS target, and the red-line threshold below which an audible MUST fire.
- **The audible library** (Part 3) — per-step leak hypotheses, ranked audible options, decision rules.
- **The trigger matrix** (Part 4) — single decision table: if metric X is below threshold Y after window Z, fire audible A.
- **The audit cadence** (Part 5) — daily / weekly / monthly / quarterly rhythm, anchored on the Friday Audible Call.
- **The dashboards** (Part 6) — PostHog Insights to build + Supabase SQL views (`supabase/views/funnel_audibles.sql`).
- **The anti-audibles** (Part 7) — what looks like an audible but is actually a strategy violation.
- **The pre-staged copy vault** (Part 8) — alternate headlines, CTAs, subject lines, button copy, and the OTO Big Domino expansion block, all written and ready to swap in inside 10 minutes when the trigger fires.
- **The audible veto list** (Part 9) — workbook-locked decisions (avatar, price, guarantee, identity, scarcity, channels) that are NOT audibleable; changing them is Revision Mode with full documentation.

**SQL views** (`supabase/views/funnel_audibles.sql`):
- `funnel_audibles__diagnostic_conversion` — per-day, per-label diagnoses → Starter conversion.
- `funnel_audibles__starter_to_core` — weekly cohort OTO take-rate.
- `funnel_audibles__machine_progression` — milestone-by-milestone depth funnel among Core subs.
- `funnel_audibles__outreach_velocity` — days to 20 verified actions per Core sub. **The existential view.**
- `funnel_audibles__guarantee_pressure` — Core subs approaching day-60 grouped by state.
- `funnel_audibles__ab_identity_results` — Verified vs Paid Builders A/B.
- `funnel_audibles__soap_opera_funnel` — SOS per-day status mix.
- `funnel_audibles__weekly_top_of_funnel` — single-row weekly summary. The Friday Audible Call screen.
- `funnel_audibles__refund_eligible` — Hard Rule #4 refund queue.

**The Friday Audible Call** is the operational ritual. 30 minutes, once a week. Read `funnel_audibles__weekly_top_of_funnel`. Identify the worst metric. Cross-check against the Trigger Matrix. Fire the first audible listed. Document in `build-log.md`. Re-read next Friday. The discipline of the call is what compounds, not the cleverness of any single audible.

---

## Section 9: Funnel Hacking Worksheet (Slot Reserved)

When you run the `brunson-funnel-hacker` skill on a competitor, drop results here.

| Competitor | Funnel type | Hook | Story | Offer | Price | Model | Reject |
|---|---|---|---|---|---|---|---|
| (Lovable onboarding) | | | | | | | |
| (ClickFunnels trial) | | | | | | | |
| (Micro-SaaS your audience pays for) | | | | | | | |

Suggested targets to hack post-launch: Lovable's own funnel (most directly modelable for Marco), ClickFunnels' free trial flow, one Indie Hackers darling charging $29 to $99 a month, one AI-native SaaS that converted from your circle.

---

## Section 10: Challenge Funnel — `/challenge` Build Spec (DCS Secret #19)

Added 2026-05-17 under the autonomous "push Secret #19 to 95" pass. Closes the gap where `app/src/lib/challenge/emails.ts` and `supabase/migrations/20260518000001_challenge_subscribers.sql` referenced "workbook 04 §10" but the section did not yet exist.

**Status:** SHIPPED + LIVE. Both the front-end Challenge surface (`/challenge`) AND the back-end Machine Step 6 accelerator (the same 14-day arc embedded inside the $49 Core as Bonus 1) are built. Canonical decision doc lives at [`strategy/decisions/challenge-funnel.md`](../decisions/challenge-funnel.md).

### Why two surfaces of the same 14-day arc

Standard Brunson Challenge Funnel teaches a single surface — a paid 5-day or 14-day commitment with a daily-action drip and an end-of-challenge upsell. UnlockSaaS deliberately ships TWO uses of the same scaffold:

1. **Front-end (`/challenge`)** — free, email-only, public squeeze. Cold-traffic-friendly. Day 14 ends with the $1 Starter CTA (Hook #8 verbatim). The Challenge IS the lead funnel for the avoidant Marco archetype.
2. **Back-end (Machine Bonus 1, inside $49 Core)** — engine-wired Sprint accelerator that piggybacks on Stripe-verified milestones inside the Machine.

The avatar (Marco, skeptic, post-launch pre-revenue) needs the cadence to PROVE itself before he pays $49. The free 14-day Sprint is the proof-of-cadence; the in-product Sprint is the proof-of-cadence-plus-machine.

### Brunson Hard-Rule reconciliation

| Brunson rule | How UnlockSaaS satisfies it |
|---|---|
| The challenge has ONE promise | "By Day 14 you will have done more selling than in the last six months — or proven to yourself that you will not." Specific, falsifiable; falsification is the point. |
| Daily action, low friction | One email/day. One action under 30 minutes. One-line reply expected. |
| End-of-challenge upsell | Day 14 only. Hook #8 verbatim → $1 Starter. No mid-Sprint pitches. No Day-7 OTO. |
| Community / accountability | DELIBERATELY EMAIL-ONLY. Polarity AGAINST Facebook-group mechanics — for the skeptic avatar, public-group accountability triggers AC Flaw #3 (praise junkie). Honest "I read every reply" replaces public commitment. Full reasoning in `strategy/decisions/challenge-funnel.md`. |
| Scarcity / countdown | DELIBERATELY ABSENT. No countdown timer. No "starts Monday." Anyone opts in any day; Day 1 lands tomorrow. Same polarity discipline as `/founding`. |

### Page structure (`/challenge`)

| Block | Content source |
|---|---|
| Hero hook | "14 days. 14 actions. One per day. By Day 14 you will have done more selling than in the last six months." |
| AC sub-headline | Workbook 01 §6 Beat 2 three-line about opener |
| Star / Story / Solution | Day-band Card with 6 rows mapping the 14-day arc |
| Honest contract | "What this is not" — no course, no community, no live calls, no homework grading |
| Polarity AGAINST | "This is not 'validate your idea' advice." |
| Opt-in form | Email + first name + product URL (optional). Same shape as Soap Opera form. |
| Bridge cluster | Footer links to `/diagnostic`, `/starter`, AND (added in this push) reciprocal links from `/`, `/diagnostic`, `/parables` back to `/challenge` |

### 15-email content (`app/src/lib/challenge/emails.ts`)

| Index | Day | Title | Parable / Brunson asset |
|---|---|---|---|
| 0 | Day 0 | Welcome + the rule | Honest disclaimer: 90% miss Day 4 |
| 1 | Day 1 | Name one real person | Parable 1 (Blank Offer Page) |
| 2 | Day 2 | Find one quote | Parable 4 (Mirror in Ten Founders) |
| 3 | Day 3 | Do NOT open Stripe | Parable 2 (Stripe Refresh) |
| 4 | Day 4 | Write one promise | Vehicle Story (workbook 06 §4) |
| 5 | Day 5 | The math of defence | Stack 10x defence (workbook 01 §2) |
| 6 | Day 6 | The remedy | Internal Belief Rewrite #1 |
| 7 | Day 7 | The first list (20 names) | Dream 100 mini |
| 8 | Day 8 | The first message | Parable 3 (SEO Escape Hatch) |
| 9 | Day 9 | Send the first five | The actual ask |
| 10 | Day 10 | Triage the replies | Internal Belief Rewrite #4 |
| 11 | Day 11 | Send the next ten | Different congregation |
| 12 | Day 12 | The hard five | The ones you've been avoiding |
| 13 | Day 13 | One real conversation | Parable 5 (Door That Opened) |
| 14 | Day 14 | Sprint complete + $1 Starter | Hook #8 verbatim — "Your first paying customer, guaranteed in writing, or you do not pay." |

Rules carried from §5 Soap Opera (do not violate): story first; action at the bottom; Reluctant Hero voice throughout; one reply asked per email; **only Day 14 carries the CTA**.

### Infrastructure

| Layer | Spec | Code |
|---|---|---|
| Subscribe | `POST /api/challenge/subscribe` via `subscribeToChallenge` helper. Idempotent on `lower(email)`. Repeat-submit resets to Day 0. | `app/src/lib/challenge/subscribe.ts` |
| Dispatch | `sendNextAndAdvance` — retry-safe; on Resend or DB failure, `emails_sent` is NOT incremented so cron retries. | `app/src/lib/challenge/dispatch.ts` |
| Cron | `GET /api/cron/challenge` at `0 18 * * *` UTC. Late-day timing — "do one thing tonight" arc. | `app/src/app/api/cron/challenge/route.ts` |
| Storage | `challenge_subscribers` table. RLS-hardened: anon-insert validated by CHECK, no SELECT policy, service-role reads only. | `supabase/migrations/20260518000001_challenge_subscribers.sql` |
| Unsubscribe | Shared HMAC token via `buildUnsubscribeUrl` — one-click clears all cadences. RFC 8058 compliant. | `app/src/lib/soap-opera/tokens.ts` |

### Position in the value ladder

```
Cold reader on X / IH / Reddit
   ↓ (parable post)
Funnel hub `/`
   ↓ (cookbook-style hero CTA cluster — 5 doors in)
/diagnostic  OR  /parables  OR  /challenge   (matches Marco's archetype on arrival)
   ↓               ↓               ↓
   Soap Opera      Soap Opera      14 daily emails
   ↓               ↓               ↓ (Day 14)
   ───────────── $1 Starter checkout ─────────────────
   ↓ (OTO)
   $49 Machine subscription
```

Three squeeze doors. Same destination. Different on-ramps for different Marco archetypes:
- **Decisive Marco** → `/diagnostic` (one-shot answer)
- **Skeptic Marco** → `/parables` (show me you have something true first)
- **Avoidant Marco** → `/challenge` (break the work into one-a-day so I cannot postpone all of it)

### Overlap rules

Per `strategy/follow-up-funnels.md` priority order: **Founding > Cart Recovery > Soap Opera > Challenge > Seinfeld.** Same-day collisions resolve top-down. Challenge is daily-but-self-contained — can lag a day without breaking the arc.

### Metrics to read

1. **Day 14 completion rate** (`status='complete' / total active`). Brunson benchmark 8–15%. Below 5% = action ask is too heavy.
2. **Day 14 → $1 Starter conversion** (from `source='challenge_optin'`). Modeled 5–12%. Real number unknown until 25+ completions land.
3. **Reply rate per day.** Below 10% on any day = the action ask was too heavy that day. Predicted leak points: Day 3 (Stripe abstinence) + Day 9 (first 5 messages).
4. **`identity_variant` cross-tab** — Verified vs Paid Builders, completion-rate split.

### Activation status

**LIVE at launch.** Free, email-only, no operator gate. Cron fires at 18:00 UTC once `CRON_SECRET` lands in Vercel env. Zero subscribers today.

### Re-grade gate

Re-evaluated against actual numbers at 25 Day-14 completions + first observed $1 Starter conversion + 100+ active Sprint subscribers/quarter. Re-grade trigger writes to `strategy/audits/<date>-challenge-funnel-grade.md`.

---

## Status

**Step 4 COMPLETE.**

- Build specs locked for all three core funnels.
- Soap Opera 5-email sequence drafted in full.
- Machine Step 5 + 6 (the outreach engine, the load-bearing piece) specced including the send-vs-track resolution.
- Step 7 Stripe verification logic specced.
- Funnel Audit checklist ready to run pre-launch.
- Funnel Hacking slot reserved with target list.
- **Section 10 added 2026-05-17:** Challenge Funnel (DCS Secret #19) build spec locked + canonical decision doc at `strategy/decisions/challenge-funnel.md`. Front-end (`/challenge`) + back-end (Machine Bonus 1) both shipped.

**The Unlock the Secrets workbook (Steps 1 through 4) is COMPLETE.**

**Next:** build. See `BUILD-PROMPT-CLAUDE-CODE.md` at the project root.

---

*Workbook: Unlock the Secrets. Project: Unlock SaaS. Generated with Brunson Architect.*
