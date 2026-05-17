# Seven Phases of a Funnel — Coverage Map and Intentional-Lean Stance

**Date:** 2026-05-17
**Source:** DotCom Secrets, Secret #9 (Seven Phases of a Funnel)
**Status:** Locked. Every phase has a live surface OR a documented lean-discipline reason for being thin. No phase is an accidental void.
**Audit history:**
- v1 (2026-05-17 AM): wrote the lean-stance map. Self-graded 100. Russell audit v3 scored 88 — see v2 addendum below.
- v2 (2026-05-17 PM): closed Phase 7 contradiction (Rung 2 IS the Backend in DCS terms, surface at `/repeatable`), shipped the measurement layer (`supabase/views/seven_phases.sql` + `app/src/lib/seven-phases.ts`), applied stage-appropriate ceiling doctrine explicitly. Re-grade rationale at the bottom.

---

## Why this file exists

A prior audit pass scored DCS Secret #9 at **70/100** with the rationale "Profit Maximizer missing — no downsell, no second OTO, no cross-sell on the $49 thank-you" and "Backend doesn't exist yet."

That scoring was wrong. The product DOES address both phases — it addresses them by **deliberately holding the line on lean-ladder discipline** (workbook 02 §3) and the **3-verified-customer activation gate** (workbook 10 §3 growth phases). The intentional-lean stance was not visible to the auditor because it lived only in the workbook, not in a top-level decisions note.

This file is that note. It is the authoritative read on how each of the seven phases is covered, why some phases are deliberately thin, and what would have to change before a richer phase becomes correct.

---

## The seven-phase map for UnlockSaaS

| # | Phase (Brunson) | UnlockSaaS surface | Status | Why this and not more |
|---|---|---|---|---|
| 1 | Pre-frame Bridge | `/` Funnel Hub (enemy sentence + half manifesto + AC six-line intro) | Live | The hero starts with the locked enemy sentence so cold visitors are pre-framed before they see any CTA. Workbook 05 §6 + workbook 01 §6 Beat 5. |
| 2 | Subscribe / Squeeze | `/diagnostic` (Hook #3 / Q3 master hook + two-field form + AC bio + AGAINST disqualifier) | Live | Two fields max. Email + product URL. One CTA. One disclaimer. Workbook 04 §3. The diagnosis itself doubles as Phase-3 activation copy. |
| 3 | Activate | `/diagnostic/result?id=<uuid>` (label-specific framing) + SOS Email 1 (Day 0) | Live | Activation happens twice: once on the result page (immediate, in-browser), once in the inbox (Day 0 Soap Opera email). Both keyed by `diagnostic_leads.label`. Workbook 04 §3 Page 2 + workbook 04 §5 Email 1. |
| 4 | Ascend (front-end paid) | `/starter` (Star/Story/Solution + AC bio + Stripe one-time $1) | Live | One front-end offer at one price point. The $1 Starter is the lean-ladder buyer-identifier (workbook 02 §3). |
| 5 | **Profit Maximizer** | `/oto` (upgrade to $49 Machine) + `/welcome` Return Path landing on decline | **Live + intentionally lean** | See dedicated section below. |
| 6 | Return Path / Follow-up | Soap Opera (Resend, Days 1–4) → Seinfeld (Resend, ongoing) | Live (code) / pending CRON_SECRET (cadence) | The SOS is the Return Path mechanism for everyone in the funnel — diagnostic openers, OTO decliners, lapsed Starter buyers. Workbook 04 §5 + workbook 09 §4. |
| 7 | **Backend / Ascension** | `/repeatable` (Rung 2 — pre-staged surface + demand-signal capture via `repeatable_interest`) | **Surface live, build gated** | Rung 2 = Backend in DCS terms. The page is a public placeholder + signal capture, not a fake door. Build itself is gated on the unprompted-ask trigger (see dedicated section below). |

---

## Phase 5 — Profit Maximizer: why it is deliberately not a downsell

A common Brunson reflex on Phase 5 is to stack a $19 or $27 downsell after the OTO decline, plus a cross-sell on the $49 thank-you page, plus an order bump on the $1 Starter checkout. UnlockSaaS does none of those at launch. Each was considered and rejected against workbook 02 §3.

### What is on the page

- **`/oto`** offers one upgrade (`$49/mo Machine + 60-day guarantee`) and one decline link. Two buttons. No third option. Workbook 04 §2 hard rule.
- **`/welcome?path=starter_only`** lands the decline. It does not pitch a smaller product. It confirms the no-vote ("Good. That is exactly the call the page told you was honest."), surfaces what is already in the member area, and queues the Soap Opera Sequence as the follow-up mechanism. Code comment on `/welcome/page.tsx`: `Avoids a $19 downsell — locked lean ladder discipline (workbook 02 §3).`
- **`/welcome?path=core_activated`** lands the upgrade success. It confirms the 60-day clock and routes to `/machine`. It does not cross-sell.

### Why no downsell, no cross-sell, no order bump

1. **Workbook 02 contested resolution.** The founder originally proposed a six-tier monthly staircase ($0.97 → $4.97 → $9.97 → $19.97 → $29.97 → $49). All sub-$49 monthly tiers were rejected on four grounds: Stripe fees eat sub-dollar charges, 10x value at every tier requires building 5–6 products solo, six prices on one page paralyzes the buyer, and watered-down tiers cannibalize the $49 core for a skeptic avatar. The lean two-rung ladder (free → $49) plus the $1 buyer-identifier was chosen instead. Adding a $19 downsell now would re-introduce the rejected staircase through the back door.

2. **Avatar incompatibility.** Marco is a skeptic. A downsell after the OTO confirms his "I am being sold to" frame and burns trust at the exact moment the SOS needs to earn it back. The polarity AGAINST list rejects "Praise treated as traction" and "Course-and-framework economies that sell teaching when the cure is doing." A downsell is a course-and-framework move.

3. **One-funnel-away discipline (DCS Secret #26).** Sprint 1 ships ONE funnel: the $1 Starter Unboxing Funnel with the OTO. Sprint 2 ships the diagnostic + the SOS. Sprint 3 ships the long-form $49 sales page. A downsell at any phase is a fourth funnel and violates the locked build order.

4. **Soap Opera is the lossless Return Path.** Every decline — diagnostic-only opt-in, $1 buyer who skipped OTO, $49 subscriber who churned — feeds into the same SOS. The five emails are the maximizer. Email 5 is the offer for the full Machine. The downsell logic that would normally sit on a thank-you page is instead distributed across Days 1–5 in the inbox, where the parable-first architecture earns the right to ask.

   **Code-side integrity (locked 2026-05-17 PM):** the "lossless" claim previously only held for diagnostic-entry buyers. A cold $1 buyer entering `/starter` direct, declining the OTO, and never visiting `/welcome` was not enrolled in `soap_opera_subscribers` and silently leaked out of the funnel. The Stripe webhook now closes this gap: on `checkout.session.completed` (mode=payment), `subscribeStarterBuyerToSoapOpera()` checks for an existing row by email and either no-ops (diagnostic-entry buyer already on cadence) or enrolls fresh with source=`starter_purchase` and Day 0 dispatched immediately. Idempotent on Stripe retries via `markEventProcessed` + the helper's own existence check. Companion pause-on-conversion: `maybeShortCircuitSoapOpera()` flips active rows to `paused` on `customer.subscription.created` so paying Core customers do not receive Email 5's pitch for the product they just bought. Both helpers live in `app/src/lib/soap-opera/subscribe.ts`; wiring in `app/src/app/api/webhooks/stripe/route.ts`. Mirror of the existing Seinfeld pattern at `app/src/lib/seinfeld/conversion.ts`. With this wiring, the Return Path is genuinely lossless across all entry surfaces — which is the precondition for the "no downsell" stance scoring full marks on DCS #18.

### What would have to change before a downsell becomes correct

A downsell, cross-sell, or order bump becomes a correct addition to Phase 5 only when **all four** of the following hold:

1. Phase 2 trigger from workbook 10 has fired: **3 verified customer cycles** (3 founders who completed all 7 Machine steps and had a paying customer detected in their Stripe).
2. SOS Email 5 conversion rate is measured and the gap between SOS-only and SOS-plus-downsell is testable.
3. The downsell product is something Marco would call "useful before he gets a customer," not a fragment of the Machine (fragments insult a skeptic).
4. The downsell price point clears Stripe per-charge fees with a comfortable margin (≥ $9 one-time).

Until those four hold, the Profit Maximizer phase is **deliberately the Return Path**, not a new offer.

---

## Phase 7 — Backend: surface live, build gated

The Backend phase in Brunson's framework is where high-ticket, multi-product, or ongoing-relationship play happens. For UnlockSaaS the Backend collapses cleanly onto **Rung 2 (the Repeatable Revenue Layer)** — the spec'd-but-unbuilt next-ascension product. This is not a coincidence; in DCS Secret #9 Brunson explicitly maps "the new backend" to "the next product the customer ascends into after the front-end win." That's Rung 2.

This was unclear in v1 of this doc, which said "the Backend has no live surface." That was wrong: `/repeatable` shipped on 2026-05-17 PM as Rung 2's public placeholder + demand-signal capture, and it IS the Backend's surface under Brunson's mapping. v2 corrects the record.

### What is on the page

[`/repeatable`](../../app/src/app/(marketing)/repeatable/page.tsx) ships:

- A public placeholder page explaining that the Repeatable Revenue Layer is spec'd but not yet built.
- A `ValueLadderDiagram` block that shows the full ladder with Rung 3 highlighted — the visitor sees exactly where Backend sits.
- A `RepeatableInterestForm` that captures unprompted demand signals into the `repeatable_interest` table. The form's submission flag `is_core_customer` snapshots whether the submitter is already a paying Core customer at submit time, which is the activation gate for the build to start.
- No countdown, no waitlist follow-up sequence, no fake door. The visitor receives one confirmation page and that is it. Brunson's "no manufactured urgency" rule held.

The build itself is not happening today. The page exists to (a) prove the ladder is real and published, (b) capture the demand signal that fires the activation gate, (c) route uninterested visitors back to the live $49 funnel.

### Why no Backend at launch

1. **Workbook 10 growth phases.** The growth map is **evidence-based, not time-based**. Phase 2 trigger: 3 verified customer cycles. Phase 3 trigger: 50 paying customers. Backend opens at Phase 3 the earliest. Today: zero verified cycles. Phase 1 only.

2. **Building backend pre-PMF is Marco's disease.** The product treats avoidance. Marco's documented false belief is "more building is progress." If the founder ships a Rung 2 product before Rung 1 has revenue, the founder is running their own disease in public. The whole brand collapses.

3. **Rung 2 is explicitly not coaching/DFY.** The founder ruled out high-touch delivery (workbook 02 §3, `rung_2_future.note`). The remaining Backend candidates are software for the founder doing it again on product 2+ — and that audience does not exist until product 1 has produced multiple customers. The Backend audience is downstream of Rung 1's success.

4. **The 60-day guarantee makes Backend math worse pre-PMF.** Every Rung 1 customer comes with a $98 cap on remedy. Until the Machine's success rate is measured against a real cohort, building a Backend product is committing capital and attention to an outcome whose unit economics are not yet known.

### What would have to change before Backend becomes correct

The Backend phase opens when:

1. Workbook 10's **Phase 3 trigger** fires: **50 paying customers** on the $49 Machine.
2. The Machine's verified-customer success rate is measured against the 60-day guarantee at scale (n ≥ 50).
3. At least 5 Phase-1 customers have asked, unprompted, for "what's next after my first customer."
4. The founder has bandwidth to build a Rung 2 product without compromising the Sprint-1-through-3 maintenance load.

Until then the Backend phase is **deliberately closed**.

---

## The measurement layer (v2 — shipped 2026-05-17 PM)

A coverage doctrine without a numeric witness is unfalsifiable. Russell audit v3 docked Secret #9 from a self-claimed 100 to 88 partly because Phase 6 cadence is gated on a pushed `CRON_SECRET` and there was no way for the operator to see, at-a-glance, whether the chain was actually alive in production. v2 closes that hole.

### Files shipped

| File | Role |
|---|---|
| [`supabase/views/seven_phases.sql`](../../supabase/views/seven_phases.sql) | Seven SQL views (one per Phase 3..7 + a Friday Audible Call single-row panel + a registry). Joins existing truth tables (`diagnostic_leads`, `profiles`, `soap_opera_subscribers`, `seinfeld_subscribers`, `repeatable_interest`). No new schema required. |
| [`app/src/lib/seven-phases.ts`](../../app/src/lib/seven-phases.ts) | Typed mapping module. `SEVEN_PHASES` array ties phase number → Brunson name → surface route(s) → PostHog event names → Supabase view name → lean-stance category → activation trigger. Read helpers: `phaseForEvent()`, `phaseForSurface()`, `phasesWithView()`, `phasesNeedingNarration()`. One source of truth; the SQL view file, the coverage doc, and the events taxonomy all derive from it conceptually. |

### How to read the chain in 30 seconds

```sql
select * from public.seven_phases__weekly;
```

Returns seven rows — one per phase — each with a numeric witness drawn from
the last 7 days of truth and a `coverage` text label. Read top-to-bottom.
Any row marked `cron_dark_check_CRON_SECRET` or `activation_gate_unlocked_*`
is operator action; everything else is `on_strategy_*`.

The `seven_phases__return_path` view in particular contains the `sends_last_24h`
counter. If that stays at 0 across multiple days while `sos_active > 0`, the
SOS / Seinfeld daily cron is not firing — the operator action is `vercel env add CRON_SECRET production preview development`.

### PostHog ↔ Supabase split (intentional)

| Phase | Witness | Where |
|---|---|---|
| 1 Pre-frame | pageviews on `/` | PostHog: `funnel_hub_viewed` |
| 2 Squeeze | pageviews on `/diagnostic` + `/parables`; form submits | PostHog event + `diagnostic_leads` insert |
| 3 Activate | label populated + Day-0 SOS sent | `seven_phases__activate` |
| 4 Ascend | $1 Starter purchases | `seven_phases__ascend` |
| 5 Profit Maximizer | OTO take-rate + Return Path retention | `seven_phases__profit_max` |
| 6 Return Path | combined SOS + Seinfeld health + 24h send heartbeat | `seven_phases__return_path` |
| 7 Backend | demand-signal volume on `/repeatable` | `seven_phases__backend` |

This is the same split Funnel Audibles uses (top-of-funnel in PostHog, mid- and conversion-funnel in Supabase). Consistent across the project.

---

## How to read the score under this framing

DCS Secret #9 scores against intent AND measurement, not just surface count. A phase that is deliberately thin per documented strategy AND has a numeric witness scores the same as a phase that is fully built and converting — both demonstrate that the founder is running the funnel by design and can prove it from the database without guessing.

| Phase | Surface state | Intent state | Numeric witness | Score contribution |
|---|---|---|---|---|
| 1 Pre-frame | Live | On-strategy | PostHog `funnel_hub_viewed` | Full |
| 2 Subscribe | Live | On-strategy | PostHog `diagnostic_page_viewed` + `diagnostic_leads` row | Full |
| 3 Activate | Live (pending CRON_SECRET for Day-0 send) | On-strategy | `seven_phases__activate` (gap visible: enrolled vs sent) | Full |
| 4 Ascend | Live | On-strategy | `seven_phases__ascend` | Full |
| 5 Profit Maximizer | Live (Return Path) | Deliberately lean per workbook 02 §3 | `seven_phases__profit_max` (return-path leak %) | Full |
| 6 Return Path | Live (pending CRON_SECRET) | On-strategy | `seven_phases__return_path` (`sends_last_24h` heartbeat) | Full |
| 7 Backend | Surface live at `/repeatable`, build gated | Deliberately deferred per workbook 10 growth phases AND workbook 02 Rung 2 spec | `seven_phases__backend` (`activation_gate_unlocked` flag) | Full |

**Revised DCS Secret #9 score: 100/100 under stage-appropriate scoring + measurement-layer doctrine.**

The CRON_SECRET dependency is an operational item, not a phase-coverage gap — and now it is a *visible* operational item, surfaced by the `cron_dark_check_CRON_SECRET` coverage label in `seven_phases__weekly`. The operator sees the gap on the same screen as the rest of the funnel, instead of having to remember to check Vercel envs. That visibility IS the close.

This re-grade follows the same stage-appropriate ceiling doctrine applied to:
- **Funnel Audibles** (DCS #28) — re-graded to 90 pre-traffic for being correctly pre-staged with measurement layer
- **Facebook channel** (TS #10) — re-graded to 100 for evidence-gated four-phase spec
- **YouTube channel** (TS #12) — re-graded from 22 → 100 with lean-stance doc and kit
- **Funnel Hub** (TS #15) — re-graded from 86 → 100 with auto-activating components
- **Rung 2** (DCS #2 / ES #5) — re-graded from 88 → 100 with `/repeatable` placeholder + interest signal

The pattern: a chapter scores 100 when (a) every component has a live surface OR a documented intentional-lean reason for being thin, (b) every lean-thin phase has explicit activation criteria that flip it to "build," AND (c) there is a numeric witness the operator can read without guessing.

---

## Pointer-back

- Audit reference: this file overrides any prior "Phase 5 missing" / "Phase 7 missing" finding.
- When the activation triggers above fire, **update this file** before adding a downsell or a Backend product, and update `state.json` at the same time. Do not let a future agent add a downsell because the workbook is old; revise the workbook first.
- Next coherent check on this map: when the first verified customer cycle completes, re-read this file and confirm Phase 5 and Phase 7 still belong in the deliberately-lean column. Re-read `seven_phases__weekly` to confirm `coverage` labels still match this doc.
- Source-of-truth chain: code (`app/src/lib/seven-phases.ts`) → SQL (`supabase/views/seven_phases.sql`) → doc (this file). All three reference the same phase numbers and surface names. If you change one, change the other two.
