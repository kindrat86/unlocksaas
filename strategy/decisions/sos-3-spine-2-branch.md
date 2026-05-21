# Decision: Soap Opera Sequence – 3-email spine + 2 behavioral branches

**Date:** 2026-05-21
**Owner:** Maryan
**Status:** Locked – shipped in PR for branch `feat/sos-3-spine-2-branch`.
**Supersedes:** the 5-email cadence introduced by
`supabase/migrations/20260516224206_0003_soap_opera_and_ab_tests.sql` and
`app/src/lib/soap-opera/emails.ts` (pre-2026-05-21).

---

## What changed

The Soap Opera Sequence used to be 5 emails on a 24-hour cadence:

| Old | Day | Role |
| --- | --- | --- |
| E1 | 0 | Diagnosis + Story 1 (Blank Offer Page) |
| E2 | 1 | Story 2 (Stripe Refresh) |
| E3 | 2 | Story 4 (Mirror in Ten Founders) |
| E4 | 3 | Story 5 (Door That Opened) + Polarity FOR |
| E5 | 4 | Hook #8 expanded + Guarantee + Stack |

It is now 3 spine emails on a 48-hour cadence plus up to one behavioral
branch on day 6:

| New | Day | Role | CTA |
| --- | --- | --- | --- |
| E1 (spine) | 0 | Star + Backstory + Open Loop. No hard CTA. End on cliffhanger. | PS → `/diagnostic` |
| E2 (spine) | 2 | The Wall – drama, conflict, the moment things almost failed. Open the loop wider. | PS → `/diagnostic` |
| E3 (spine) | 4 | Epiphany + offer. Hidden Benefit + Logical Justification. | PS → `/diagnostic` |
| Branch A (`soft_sell`) | 6 | Fires if E3 opened, not clicked. "Maybe you missed this." One soft CTA. | PS → `/diagnostic` |
| Branch B (`objection_handler`) | 6 | Fires if E3 clicked, no buy. Three dollar-objections answered in verbatim-quote-then-reframe format. Restated guarantee. | PS → `/starter` |

Exactly one branch fires per subscriber, ever. If E3 was neither opened
nor clicked, no branch fires (the "ghost" path is intentionally out of
scope – we can layer it later without re-architecting the table).

## Brunson narrative DNA preserved

The Reluctant Hero arc still has Star, Backstory, Wall, Epiphany, Hidden
Benefit, Logical Justification – all five Brunson narrative beats land,
just inside three emails instead of five. The two beats we used to spread
across E3 and E4 ("Mirror in Ten Founders" + "Door That Opened") collapse
into the second half of E2. The "Polarity FOR" beat from old E4 moves
into the disqualifier line buried in E3's stack copy.

The two branches don't introduce new narrative beats – they reuse the
existing voice and address a state the spine couldn't (engagement
without conversion).

## Why now

Empirical wedge:

- ~58% of cold replies to a multi-email cold sequence arrive on email 1
  (industry baseline for opt-in nurture sequences).
- ~80% arrive by email 3.
- The marginal value of email 4 and 5 in a Brunson SOS is dominated by
  unsubscribe risk on warm leads who already clicked through to a sales
  page and made a decision.

The spine pays its rent in 3 emails. The branches handle the long tail
behaviorally – we send to people who showed they're still warm, and we
stay quiet to people whose silence is meaningful.

Second motivation: the existing 5-email arc was sending the same E4 and
E5 to subscribers regardless of whether they'd already opened, clicked,
or bought from E3. That's the highest-friction segment to keep hitting
with new pressure, and the right move is to vary the message based on
what they did with the offer, not to keep hammering them on a cron.

## State machine (day 6, runs from `/api/cron/soap-opera`)

For every `soap_opera_subscribers` row where:

- `branch_fired = 'none'`
- `emails_sent >= 3` (the spine has been exhausted)
- `last_sent_at <= now() - 48h` (E3 has had two days to land)
- `source NOT LIKE 'funnelfixer_%'` (carry-over cohort uses the
  funnelfixer-tick throttle, no branches)

…evaluate `selectBranch()` (in `app/src/lib/soap-opera/dispatch.ts`):

```
if (converted_to_starter_at OR core_activated_at) → null (no branch)
else if (e3_clicked_at)                            → 'branch_b'
else if (e3_opened_at)                             → 'branch_a'
else                                               → null
```

Then send via `sendBranchAndMark()`, which fires the email AND flips
`branch_fired` + `branch_fired_at` in the same call. The branch_fired
flip is the idempotency guard – a subsequent cron tick re-evaluating
the same row finds `branch_fired != 'none'` and skips it.

## How E3 engagement is captured

Spine sends include three Resend tags:

```
sequence       = "soap_opera"
email_index    = "1" | "2" | "3" | "branch_a" | "branch_b"
subscriber_id  = uuid of the soap_opera_subscribers row
```

The Resend webhook (`/api/webhooks/resend`) reads these on inbound
`email.opened` and `email.clicked` events. When `email_index = "3"`, it
stamps `e3_opened_at` / `e3_clicked_at` on the matching row (idempotent
– only writes if the column is currently null; a click implies an open,
so a click sets both).

The webhook also continues to insert one row per event into
`funnel_email_events` (the existing per-message engagement log used by
the monitoring dashboard). The new SOS routing is additive.

## Sources

- Brunson, *DotCom Secrets* – Soap Opera Sequence canon.
- Internal: `strategy/workbooks/03-funnel-scripts.md`,
  `strategy/workbooks/04-building-your-funnels.md` §5,
  `strategy/workbooks/01-sales-funnel-secrets.md` §6 Beat 3.
- Internal: `strategy/dollar-objections.md` – verbatim quotes used in
  Branch B (Subscription Fatigue, Cash Constraint, Burned by Gurus).
- Open-rate distribution numbers (~58% on E1, ~80% by E3) are derived
  from cold-list nurture-sequence benchmarks across deliverability
  vendors. They are directional and intentionally not load-bearing on
  the architecture – the structural argument (don't keep pushing
  pressure to people who already decided) survives even if the exact
  percentages drift.

## Open questions

- Should Branch A's CTA point at `/starter` instead of `/diagnostic`?
  Decision: `/diagnostic` for now – the hypothesis is they opened but
  didn't click, which means the offer didn't break through. Sending
  them back to the free diagnostic gives a lower-friction next action.
  Revisit after first 100 subscribers complete the spine.
- "Ghost branch" for subscribers who neither open nor click E3.
  Decision: out of scope for this PR. Likely a re-engagement send at
  day 14 once we have enough volume to learn from open-rate baselines.
- Does Branch B's verbatim quoting need source attribution in-email?
  Decision: yes, in the email body itself. Quote attribution is part
  of the reframe (it shows the founder isn't alone in the objection).
  Already implemented in `branchObjectionHandler()` in
  `app/src/lib/soap-opera/emails.ts`.
