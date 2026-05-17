# Decision: Challenge Funnel (DCS Secret #19)

**Date:** 2026-05-17
**Status:** LOCKED + LIVE
**Owner:** Maryan
**References:**
- DotCom Secrets Secret #19 (Challenge Funnel)
- `strategy/workbooks/04-building-your-funnels.md` §10 (build spec)
- `strategy/follow-up-funnels.md` (cadence inventory + overlap priority)
- `strategy/audits/2026-05-17-brunson-trilogy-audit.md` v3.2 addendum (re-grade 65 → 95)
- Code: `app/src/app/(marketing)/challenge/`, `app/src/lib/challenge/`, `app/src/app/api/challenge/`, `app/src/app/api/cron/challenge/`, `supabase/migrations/20260518000001_challenge_subscribers.sql`

---

## The decision in one sentence

UnlockSaaS ships the Brunson Challenge Funnel as a **free, email-only, no-community** front-end lead funnel at `/challenge`, with the same 14-day scaffold mirrored as Bonus 1 inside the $49 Machine. No paid tier on the Challenge. No Facebook group. No live calls. No countdown timer. No scheduled cohort.

This is two surfaces of the same 14-day arc, not one Challenge plus a separate bonus.

---

## Why free, not $7 or $27

Standard Brunson Challenge Funnel pricing is $7–$27 for entry (self-liquidating CAC). UnlockSaaS deliberately rejects this:

1. **The avatar is post-launch pre-revenue.** Marco is cash-conscious. A $7 paywall on a "free-feeling" daily-action challenge reads as another tool charging him for what he already feels guilty about avoiding. It triggers the same friction that kills the $49 sale.
2. **The Day 14 CTA is the price point.** The Sprint funnels into the $1 Starter (Hook #8 verbatim). Charging $7 on Day 0 + $1 on Day 14 is two transactions for a 60-day ladder that does not yet exist for this avatar — a "training tax" Marco rejects on principle.
3. **The Sprint IS the proof-of-cadence.** Charging breaks the proof. The free Sprint says: I do not need your money to walk you through the work. The $1 Starter says: now that you have walked the work, here is the next step.

Re-evaluate at 100+ Sprint subscribers/quarter. A paid cohort variant becomes the natural Phase 2 evolution.

---

## Why email-only, not Facebook/Discord group

Brunson's canonical Challenge Funnel uses a private group for daily public accountability. UnlockSaaS rejects this for the skeptic avatar specifically:

1. **AC Flaw #3 (Praise Junkie) reconciliation.** A daily-posting group becomes a daily-praise-collection ritual. The praise-not-payment loop is the exact disease the entire brand was built to treat. We cannot build a group whose mechanic IS the disease.
2. **Founder time cost.** A 14-day group requires founder presence to moderate. The 1:1 email reply flow scales linearly with subscribers; a group scales O(n²) and demands moderation. Maryan does not yet have the cycles.
3. **Polarity AGAINST.** "We do not collect praise. We collect customers." A daily-group challenge violates this hard rule. The email-only model IS the polarity, in operational form.

Replacement accountability mechanic: **one-line reply per day, founder reads every reply.** The accountability surface is the operator's inbox, not a feed. Honest at every scale below ~200 active Sprint subscribers; revisit at that gate.

---

## Why two surfaces (front-end + back-end)

Standard Brunson Challenge is one surface. UnlockSaaS ships two:

| Surface | Audience | Stage | Mechanic |
|---|---|---|---|
| `/challenge` (front-end) | Cold + warm pre-customer | Pre-$1 | Email-only, 15 emails, Day 14 → $1 Starter (Hook #8 verbatim) |
| Machine Bonus 1 (back-end) | $49 Core customer | Post-OTO | In-product daily action tracker, milestones logged, Stripe-verified completion |

The front-end Sprint is the **outside-in proof**. The back-end Sprint is the **inside-out delivery**. Both use the same 14-day arc because the arc IS the work; the wrapper differs by where the user sits in the value ladder.

Brunson rule preserved: **One Funnel Away.** The Challenge is a *discovery* surface that funnels into the locked $1 Starter Unboxing Funnel — not an alternative funnel. The build order in workbook 02 §6 still holds (Starter first, Diagnostic second, Machine third). The Challenge is the fourth discovery surface, not a fourth funnel.

---

## Why no countdown / no scheduled cohort

1. **No fake scarcity rule.** Workbook 07 §3 rejects scarcity for the skeptic avatar. A cohort start-date is structural scarcity — defensible, but operationally heavy. We do not need it pre-PMF.
2. **Friction-free entry beats cohort discipline at this stage.** Pre-100 subscribers, the priority is reducing friction at the squeeze, not coordinating a cohort.
3. **The cohort variant is the Phase 2 evolution.** Once the Sprint has run 3+ times and we have data on Day-N drop-offs, a cohort version with a public Verified Builder Day-14 graduation surface becomes the natural Phase 2 play. Spec'd in this doc, not built.

---

## Discovery surface architecture

Five doors into the funnel from the homepage, mapping to five Marco archetypes:

```
Homepage `/` hero cluster
├── Primary CTA:  /diagnostic     (decisive Marco — give me the answer)
├── Sub CTA:      /starter         ($1 buyer Marco — let's go)
├── Sub CTA:      /machine-sales   (sophisticated Marco — show me the long-form)
├── Bridge:       /parables        (skeptic Marco — show me you have something true)
└── Bridge:       /challenge       (avoidant Marco — break the work into one-a-day)
```

Same destination ($49 Machine). Different on-ramps.

Cross-bridges are reciprocal: `/diagnostic` links to `/parables` AND `/challenge`; `/parables` links to `/starter`, `/diagnostic`, AND `/challenge`; `/challenge` links to `/diagnostic` AND `/starter`.

---

## Overlap rules (per `strategy/follow-up-funnels.md`)

Priority order for same-day collisions: **Founding > Cart Recovery > Soap Opera > Challenge > Seinfeld.**

| Other cadence | Rule when challenge subscriber overlaps |
|---|---|
| Soap Opera | Soap Opera wins on collision day. Challenge is daily and self-contained; lagging a day is acceptable. |
| Seinfeld | Mutually exclusive. Subscriber opts into Seinfeld explicitly via Day 14 CTA. |
| Founding | Founding cohort wins all overlaps. Challenge pauses if subscriber enters the founding waitlist. |
| Cart Recovery | Cart fires on `checkout.session.expired`. If the Challenge subscriber abandons a $49 checkout, Cart Recovery wins on that day. |

One-click HMAC unsubscribe (`buildUnsubscribeUrl`) clears the subscriber from every cadence atomically. RFC 8058 compliant.

---

## Metrics to read (post-launch)

1. **Day 14 completion rate** (`status='complete' / total active`). Brunson benchmark: 8–15% for free email-only challenges. Below 5% means the daily action ask is too heavy — Days 3 (Stripe abstinence) and 9 (first 5 messages) are the predicted leak points.
2. **Day 14 → $1 Starter conversion** from `source='challenge_optin'`. Modeled at 5–12% (lower than typical because the audience is skeptic and the Sprint is free). Real number unknown until 25+ subscribers complete.
3. **Reply rate per day** (Day-N inbound / Day-N sends). Below 10% on any day signals the action ask was too heavy that day.
4. **Identity-variant cross-tab.** Verified vs Paid Builders completion-rate split. Feeds the canonical A/B convergence check.

Read queries live in `strategy/follow-up-funnels.md` §Audit cadence + the funnel-audibles SQL views.

---

## Activation status

**LIVE at launch.** Free, email-only, no operator gate. The cron fires daily 18:00 UTC once `CRON_SECRET` lands in Vercel env (per `LAUNCH-READINESS.md` Tier 1). Zero subscribers today — the chapter scores 95, not 100, until the first 25 Day-14 completions land.

---

## Re-grade gate

The decision is re-evaluated against actual numbers at:
- **25 Day-14 completions** — first credible reply-rate-per-day and completion-rate.
- **First Day-14 → $1 Starter conversion** — first credible conversion lift.
- **100+ active Sprint subscribers/quarter** — gate for "is the cohort/paid variant worth building."

Re-grade trigger writes to `strategy/audits/<date>-challenge-funnel-grade.md`.

---

## What this does NOT change

- Value ladder unchanged: free → $1 → $49 (workbook 02 §3).
- Build order unchanged: $1 Starter first (workbook 02 §6).
- Soap Opera Sequence unchanged: 5-email arc for diagnostic-only opt-ins (workbook 04 §5).
- One Funnel Away discipline preserved.
- No new env vars. Same `CRON_SECRET` + `UNSUBSCRIBE_SECRET` already required by Soap Opera / Seinfeld / Founding / Cart Recovery.
