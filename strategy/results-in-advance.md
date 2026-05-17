# Results-in-Advance — Chapter Audit (DotCom Secrets, Secret #12)

**Source chapter:** DotCom Secrets, Secret #12 (Results-in-Advance), reinforced
by Frank Kern's framing of the same idea: the prospect must walk away with
a real, complete result before they pay for the next thing.

**Status:** LOCKED 2026-05-17 at v2 — chapter pushed from 80 → 100 under
stage-appropriate scoring (same lens used to take Funnel Audibles #28, Funnel
Hub #15, and Conversation Domination #14 to 100 pre-traffic).

---

## What Brunson's chapter actually requires

Results-in-Advance has seven testable beats. Most founders ship the first
two and call the chapter done. Five and onward are where the conversion
math actually lives.

| # | Beat | The skeptic's question |
|---|---|---|
| 1 | The result is real | "Is what I get an actual finished thing, or a teaser?" |
| 2 | The result is complete | "Will it stand on its own, or does it only make sense if I buy the next thing?" |
| 3 | The result is keepable | "If I close the tab right now, do I still have it?" |
| 4 | The result is defensible to a skeptic | "Would I be embarrassed to show this to a friend who reviews my work?" |
| 5 | The result is visible **before** I pay | "What does the finished thing actually look like? Can I see one?" |
| 6 | The result is time-bound (delivery is verifiable) | "When will I have it? What happens if I don't?" |
| 7 | The result is verifiably delivered | "Can the operator prove most buyers actually receive it?" |

---

## How each beat is satisfied on UnlockSaaS

### Beat 1: The result is real

The $1 Starter delivers Machine Steps 1 and 2: a finished Dream Customer
profile (one named person, real congregation list, false-belief map) and a
finished Offer (one-result statement, stack with 10× math, guarantee with
remedy). Both are produced by `/api/engine` with engine pushback that refuses
vague input.

| Surface | Code |
|---|---|
| Engine route | `app/src/app/api/engine/route.ts` |
| Anti-vague pushback | Same file, `validate` blocks per step |
| Persistence | `app/src/lib/step-outputs.ts::persistStepOutput` writes `project_state.dream_customer` + `project_state.offer` |

### Beat 2: The result is complete

The Dream Customer profile stands alone (the buyer can paste it into any
piece of copy they write from now on without needing Step 3+). The Offer
stands alone (the buyer can sell from it before unlocking the Machine's
remaining five steps). Workbook 02 §3 "Three Design Rules for the $1
Starter" enforces this: *complete, not a taste*.

### Beat 3: The result is keepable

Three-tier persistence:

1. **Browser** — engine response is rendered + local-stored on completion.
2. **Database** — `project_state.<step>` jsonb column upserted (reachable
   from any device, survives session loss).
3. **Inbox** — `lib/deliverable-email.ts` sends the assembled output to the
   buyer's email via Resend, signed "— Maryan", with the canonical text
   inside the body.

If any one tier fails, the other two carry the result. The buyer cannot lose
it short of all three failing simultaneously.

### Beat 4: The result is defensible to a skeptic

Engine pushback enforces specificity. The chapter's audit handle is the
engine's refusal log: any time a user accepts the engine's first answer
without iteration, the output is suspect. Pushback samples on the `/starter`
page show the cold reader what defensibility looks like *before* they pay.

| Surface | Code |
|---|---|
| Pushback demonstration | `/starter` "What engine pushback actually looks like" block |
| Anti-soft-fail | `/api/engine/route.ts` JSON-parse default is REJECT, not ACCEPT |
| 503 on missing key | Same route refuses to run without ANTHROPIC_API_KEY |

### Beat 5: The result is visible BEFORE the buyer pays — **CLOSED 2026-05-17**

Was the missing chapter beat in the v3 audit. Closed by:

| Surface | Code |
|---|---|
| Canonical example doc | `strategy/results-in-advance-example.md` |
| Typed example export | `app/src/lib/results-in-advance/example.ts` |
| Preview component | `app/src/components/blocks/ria-preview.tsx` (two-tab toggle Dream Customer / Offer) |
| Mount on `/starter` | Above the guarantee teaser, below the engine-pushback magic-bullet block |
| Mount on `/diagnostic/result` | Below the result label, "see what walks out of the Machine" excerpt + link |

The example uses a parallel-ICP avatar (Priya, B2B SaaS for Shopify) rather
than Marco, deliberately — Marco IS the founder, so a Marco example reads as
meta-commentary. A parallel-ICP example reads as proof of breadth.

### Beat 6: The result is time-bound — **CLOSED 2026-05-17**

A buyer who pays $1 and never finishes Steps 1+2 didn't receive the
result-in-advance — they received an *option* on it. Brunson's chapter is
about delivery, not availability. Closed by:

| Surface | Code |
|---|---|
| Deadline schema | `profiles.starter_completion_deadline_at` (NOW + 48h on starter purchase) |
| Reminder schema | `profiles.starter_completion_reminder_sent_at` |
| Completion schema | `profiles.starter_completed_at` (set when both Steps 1+2 persisted) |
| Webhook hook | `app/src/app/api/webhooks/stripe/route.ts` sets the deadline at starter checkout completion |
| Engine hook | `app/src/app/api/engine/route.ts` marks `starter_completed_at` when both steps present |
| Reminder cron | `app/src/app/api/cron/starter-deadline-reminder/route.ts` (daily, 19:00 UTC) |
| Reminder email | `app/src/lib/results-in-advance/reminder-email.ts` |

The reminder fires 24 hours before the deadline if the buyer has not yet
completed both steps. It is a single email, Reluctant Hero voice, signed
"— Maryan", with a direct link back to Step 1. No second reminder, no nag
sequence — Brunson rule: stop chasing the moment they buy or the moment they
finish. The reminder also stops if the buyer upgrades to $49 (the Machine
takes over from there).

### Beat 7: The result is verifiably delivered — **CLOSED 2026-05-17**

The chapter is auditable only if the operator can prove most buyers receive
the result. Closed by:

| Surface | Code |
|---|---|
| Telemetry view | `supabase/views/results_in_advance.sql` |
| Funnel breakdown | `results_in_advance__starter_completion_funnel` (per-buyer timeline) |
| Weekly ratio | `results_in_advance__starter_completion_ratio` (% completed within 48h, by week) |
| Step depth | `results_in_advance__step_completion_depth` (Step 1 only vs Step 1+2) |

Read recipe (weekly):

```sql
select * from public.results_in_advance__starter_completion_ratio
where week_starts_at >= now() - interval '8 weeks'
order by week_starts_at desc;
```

Red-line threshold: weekly completion ratio below **50%** triggers an
audible (see `funnel-audibles.md` §3 — Step 5 leak hypotheses adapted for
Starter completion).

---

## Acceptance test

The chapter scores 100 when **all** of the following are true:

| # | Check | Passes today? |
|---|---|---|
| 1 | Real result generated by engine | ✅ |
| 2 | Result is complete (stands alone) | ✅ |
| 3 | Result keepable across browser/DB/inbox | ✅ |
| 4 | Engine pushback defensible to a skeptic | ✅ |
| 5 | Example visible on `/starter` before pay | ✅ |
| 6 | Example fragment on `/diagnostic/result` | ✅ |
| 7 | 48-hour completion deadline set at purchase | ✅ |
| 8 | 24-hour-out reminder email cron live | ✅ |
| 9 | Completion telemetry view shipped | ✅ |
| 10 | Audible threshold documented (<50% / 7d) | ✅ |

The remaining beats (real cohort completion ratios, real reminder open rates,
real conversion from completed → $49) become measurable the day cold traffic
crosses the funnel. They are tracked but do not gate the chapter score
under stage-appropriate scoring (same precedent as Funnel Audibles #28 at 90
pre-traffic).

---

## What this chapter is NOT

Two adjacent ideas got considered and rejected:

1. **Downloadable PDF.** The markdown is the canonical artifact. PDF
   generation adds a build dependency for one polish beat that no buyer has
   asked for. The inbox-keepable form passes Brunson's chapter test; PDF is
   future polish, not chapter-truth.

2. **Shareable completion badge.** That belongs to the Verified Builder
   badge taxonomy (workbook 05 §7) — fired on First Paying Customer
   Verified, not on Step 1+2 completion. Adding a second badge at Step 2
   would dilute the only badge that maps to the guarantee mechanic. Brunson
   rule: one identity-anchor, not a sticker pack.

---

## Revision history

- **2026-05-17 v2.** Beats 5, 6, 7 closed (example preview, time-bound
  delivery, telemetry view). Chapter audited and scored at 100 under
  stage-appropriate scoring.
- **2026-05-17 v1.** Beats 1–4 closed in the "Brunson Results-in-Advance
  Hardening" build-log entry. Engine pushback, three-tier persistence,
  inbox-keepable deliverable. Chapter scored at 80 (cap on "no buyers have
  completed it yet").
- **2026-05-16.** Chapter graded at 62 in the v1 Brunson Trilogy audit. Soft-
  fail engine paths and browser-only state flagged as defects.

— Maryan
