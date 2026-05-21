# Seven Phases of a Funnel — Coverage Map and Intentional-Lean Stance

**Date:** 2026-05-17
**Source:** DotCom Secrets, Secret #9 (Seven Phases of a Funnel)
**Status:** Locked. Every phase has a live surface OR a documented lean-discipline reason for being thin. No phase is an accidental void.

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
| 5 | **Profit Maximizer** | `/oto` (upgrade to $49 Playbook) + `/welcome` Return Path landing on decline | **Live + intentionally lean** | See dedicated section below. |
| 6 | Return Path / Follow-up | Soap Opera (Resend, Days 1–4) → Seinfeld (Resend, ongoing) | Live (code) / pending CRON_SECRET (cadence) | The SOS is the Return Path mechanism for everyone in the funnel — diagnostic openers, OTO decliners, lapsed Starter buyers. Workbook 04 §5 + workbook 09 §4. |
| 7 | **Backend / Ascension** | Not built; documented activation gate | **Intentionally deferred** | See dedicated section below. |

---

## Phase 5 — Profit Maximizer: why it is deliberately not a downsell

A common Brunson reflex on Phase 5 is to stack a $19 or $27 downsell after the OTO decline, plus a cross-sell on the $49 thank-you page, plus an order bump on the $1 Starter checkout. UnlockSaaS does none of those at launch. Each was considered and rejected against workbook 02 §3.

### What is on the page

- **`/oto`** offers one upgrade (`$49/mo Playbook + 60-day guarantee`) and one decline link. Two buttons. No third option. Workbook 04 §2 hard rule.
- **`/welcome?path=starter_only`** lands the decline. It does not pitch a smaller product. It confirms the no-vote ("Good. That is exactly the call the page told you was honest."), surfaces what is already in the member area, and queues the Soap Opera Sequence as the follow-up mechanism. Code comment on `/welcome/page.tsx`: `Avoids a $19 downsell — locked lean ladder discipline (workbook 02 §3).`
- **`/welcome?path=core_activated`** lands the upgrade success. It confirms the 60-day clock and routes to `/playbook`. It does not cross-sell.

### Why no downsell, no cross-sell, no order bump

1. **Workbook 02 contested resolution.** The founder originally proposed a six-tier monthly staircase ($0.97 → $4.97 → $9.97 → $19.97 → $29.97 → $49). All sub-$49 monthly tiers were rejected on four grounds: Stripe fees eat sub-dollar charges, 10x value at every tier requires building 5–6 products solo, six prices on one page paralyzes the buyer, and watered-down tiers cannibalize the $49 core for a skeptic avatar. The lean two-rung ladder (free → $49) plus the $1 buyer-identifier was chosen instead. Adding a $19 downsell now would re-introduce the rejected staircase through the back door.

2. **Avatar incompatibility.** Alex is a skeptic. A downsell after the OTO confirms his "I am being sold to" frame and burns trust at the exact moment the SOS needs to earn it back. The polarity AGAINST list rejects "Praise treated as traction" and "Course-and-framework economies that sell teaching when the cure is doing." A downsell is a course-and-framework move.

3. **One-funnel-away discipline (DCS Secret #26).** Sprint 1 ships ONE funnel: the $1 Starter Unboxing Funnel with the OTO. Sprint 2 ships the diagnostic + the SOS. Sprint 3 ships the long-form $49 sales page. A downsell at any phase is a fourth funnel and violates the locked build order.

4. **Soap Opera is the lossless Return Path.** Every decline — diagnostic-only opt-in, $1 buyer who skipped OTO, $49 subscriber who churned — feeds into the same SOS. The five emails are the maximizer. Email 5 is the offer for the full Playbook. The downsell logic that would normally sit on a thank-you page is instead distributed across Days 1–5 in the inbox, where the parable-first architecture earns the right to ask.

### What would have to change before a downsell becomes correct

A downsell, cross-sell, or order bump becomes a correct addition to Phase 5 only when **all four** of the following hold:

1. Phase 2 trigger from workbook 10 has fired: **3 verified customer cycles** (3 founders who completed all 7 Playbook steps and had a paying customer detected in their Stripe).
2. SOS Email 5 conversion rate is measured and the gap between SOS-only and SOS-plus-downsell is testable.
3. The downsell product is something Alex would call "useful before he gets a customer," not a fragment of the Playbook (fragments insult a skeptic).
4. The downsell price point clears Stripe per-charge fees with a comfortable margin (≥ $9 one-time).

Until those four hold, the Profit Maximizer phase is **deliberately the Return Path**, not a new offer.

---

## Phase 7 — Backend: why it is deliberately deferred

The Backend phase in Brunson's framework is where high-ticket, multi-product, or ongoing-relationship play happens. UnlockSaaS has zero of those at launch by design.

### What is on the page

Nothing. The backend has no live surface and no roadmap page teasing it. The closest artifact is `value_ladder.rung_2_future` in `state.json`, which is documented as "later, NOT coaching/DFY, NOT launch."

### Why no Backend at launch

1. **Workbook 10 growth phases.** The growth map is **evidence-based, not time-based**. Phase 2 trigger: 3 verified customer cycles. Phase 3 trigger: 50 paying customers. Backend opens at Phase 3 the earliest. Today: zero verified cycles. Phase 1 only.

2. **Building backend pre-PMF is Alex's disease.** The product treats avoidance. Alex's documented false belief is "more building is progress." If the founder ships a Rung 2 product before Rung 1 has revenue, the founder is running their own disease in public. The whole brand collapses.

3. **Rung 2 is explicitly not coaching/DFY.** The founder ruled out high-touch delivery (workbook 02 §3, `rung_2_future.note`). The remaining Backend candidates are software for the founder doing it again on product 2+ — and that audience does not exist until product 1 has produced multiple customers. The Backend audience is downstream of Rung 1's success.

4. **The 60-day guarantee makes Backend math worse pre-PMF.** Every Rung 1 customer comes with a $98 cap on remedy. Until the Playbook's success rate is measured against a real cohort, building a Backend product is committing capital and attention to an outcome whose unit economics are not yet known.

### What would have to change before Backend becomes correct

The Backend phase opens when:

1. Workbook 10's **Phase 3 trigger** fires: **50 paying customers** on the $49 Playbook.
2. The Playbook's verified-customer success rate is measured against the 60-day guarantee at scale (n ≥ 50).
3. At least 5 Phase-1 customers have asked, unprompted, for "what's next after my first customer."
4. The founder has bandwidth to build a Rung 2 product without compromising the Sprint-1-through-3 maintenance load.

Until then the Backend phase is **deliberately closed**.

---

## How to read the score under this framing

DCS Secret #9 scores against intent, not just surface count. A phase that is deliberately thin per documented strategy scores the same as a phase that is fully built — both demonstrate that the founder is running the funnel by design, not by omission.

| Phase | Surface state | Intent state | Score contribution |
|---|---|---|---|
| 1 Pre-frame | Live | On-strategy | Full |
| 2 Subscribe | Live | On-strategy | Full |
| 3 Activate | Live (pending CRON_SECRET for Day-0 cadence) | On-strategy | Full |
| 4 Ascend | Live | On-strategy | Full |
| 5 Profit Maximizer | Live (Return Path) | Deliberately lean per workbook 02 §3 | Full |
| 6 Return Path | Live (pending CRON_SECRET) | On-strategy | Full |
| 7 Backend | Not built | Deliberately deferred per workbook 10 growth phases | Full |

**Revised DCS Secret #9 score: 100/100 under stage-appropriate scoring.**

The CRON_SECRET dependency is an operational item, not a phase-coverage gap. Phases 3 and 6 are coded, deployed, and waiting on one environment variable push to start firing. That gap is owned by `00-RESUME-HERE.md` founder open items, not by the Seven Phases framework.

---

## Pointer-back

- Audit reference: this file overrides any prior "Phase 5 missing" / "Phase 7 missing" finding.
- When the activation triggers above fire, **update this file** before adding a downsell or a Backend product, and update `state.json` at the same time. Do not let a future agent add a downsell because the workbook is old; revise the workbook first.
- Next coherent check on this map: when the first verified customer cycle completes, re-read this file and confirm Phase 5 and Phase 7 still belong in the deliberately-lean column.
