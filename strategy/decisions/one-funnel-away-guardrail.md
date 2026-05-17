# One Funnel Away Guardrail

**Brunson source:** DotCom Secrets Secret #26 (and the rule that gives Brunson's
flagship coaching program its name). "You are one funnel away from your dream
business" — meaning ONE working funnel, not zero, not many. Pick one. Ship it
end-to-end. Make it convert. Then earn the right to build the next.

**Audit lineage:** Russell audit v2 (2026-05-17 AM) scored DCS #26 at 80. Audit
v3 (2026-05-17 PM) re-scored to 92 after the autonomous push (Rung 2 spec'd but
build-gated, Summit deferred behind proof, host podcast deferred, paid ads
gated behind diagnostic-conversion evidence). The remaining 8 points are NOT
more building — they are the missing enforcement layer. This document is that
layer.

**Status:** LOCKED 2026-05-17.

---

## Section 1: The One Funnel, Named

**THE One Funnel for UnlockSaaS is the $1 Starter Unboxing chain that ascends
to the $49 Machine Presentation.**

The canonical surface chain, in user-traversal order:

| # | Surface | Role | Workbook reference |
|---|---|---|---|
| 1 | `/` (Funnel Hub) | Top-of-funnel magnet, all roads start here | Workbook 10 §1 |
| 2 | `/diagnostic` (Squeeze + Survey) | Cold → email + labelled diagnosis | Workbook 02 §2 + Workbook 04 §3 |
| 3 | `/diagnostic/result` (Bridge) | Per-label handoff to $1 | Workbook 04 §3 |
| 4 | `/starter` ($1 Sales) | Star/Story/Solution → $1 charge | Workbook 03 Script 3 + Workbook 04 §2 |
| 5 | `/oto` ($1 → $49) | One decision, two buttons | Workbook 03 Script 4 |
| 6 | `/welcome` (Return Path) | Profit Maximizer for both paths | Workbook 04 §2 + DCS Secret #9 Phase 6 |
| 7 | `/machine-sales` ($49 Long-Form) | Cold-warm direct entry + Rung 2 ascent | Workbook 03 Script 5 + Workbook 07 |
| 8 | `/onboarding` (Post-purchase) | Stripe Connect + carryover + clock start | Workbook 04 §4 |
| 9 | `/machine` + `/machine/step/[id]` (Product) | The Machine, Steps 1–7 | Workbook 01 §2 + Workbook 04 §2 + §6 |
| 10 | `/machine/verified` (Celebration) | First Paying Customer Verified | Workbook 04 §7 + Workbook 10 §5 |

These ten surfaces are the One Funnel. Everything else in the codebase is
either (a) an **alternate door** that feeds this chain, (b) a **supporting
asset** that builds trust around this chain, or (c) a **time-boxed event
wrapper** around the same $49 product. Nothing else exists. Nothing else
ships until this chain produces at least one Stripe-verified paying customer.

---

## Section 2: Route Classification — Every Existing Surface

The OFA test for any route: *Does this route point a visitor toward the $1
Starter / $49 Machine purchase, or does it pull attention away from that
purchase?* No route in the repo today fails this test. The classification
below is the locked baseline. Any future addition must fit one of these four
categories or it is an OFA violation.

### Category A: THE One Funnel

The ten surfaces in Section 1. Treat as load-bearing. Touching one of them
is a tweak, not a new funnel. Audibles allowed; structural replacement
requires Revision Mode + workbook update.

### Category B: Alternate Doors Into the One Funnel

Same destination. Different entry shape per traffic temperature.

| Route | Why it's not a competing funnel |
|---|---|
| `/parables` | Reverse Squeeze (DCS Secret #14 reverse variant). Mid- and end-content opt-ins POST to `/api/soap-opera/subscribe` — same Soap Opera, same Day 5 handoff to `/starter`. |
| `/start` | Canonical forward Lead Squeeze (DCS Secret #14 forward variant). One field, one CTA, into the same Soap Opera. For cold ad / bio / podcast traffic where friction must be zero. |
| `/bridge` | Cold-traffic bridge for solo ads + sponsored content. Pre-sell parable, then routes to `/diagnostic`. Identical to the canonical cold→diagnostic flow in Workbook 09 §1. |
| `/alternatives-to` + `[slug]` | pSEO surface (Google strategy Surface A). Solution-aware comparators that route to `/diagnostic` after honest framing. Each detail page exists only because the named competitor is a real product the canonical audience already searches for — never invented keyword bait. |

### Category C: Supporting Assets (Proof / Trust / Ladder Visibility)

Build confidence in the One Funnel. None of them transact.

| Route | Job | OFA test |
|---|---|---|
| `/builders` | Verified Builder directory (owned-discovery surface per Traffic Secret #5) | Social proof for the $49 ascent; routes outbound to `/machine-sales` |
| `/builder/[slug]` | Per-customer public badge (butterfly viral loop per Growth Hacking Secret #19) | Conversion event for an EXISTING customer; outbound traffic returns to `/diagnostic` via badge CTA |
| `/repeatable` | Rung 2 placeholder (Workbook 02 §5; spec at `strategy/decisions/rung-2-repeatable-revenue.md`) | NO purchase available; captures unprompted demand signal that fires Rung 2 activation gate; routes back to `/machine-sales` |
| `/challenge` | 14-Day First-Customer Sprint join (Workbook 01 §2 bonus 1) | Bonus delivery surface INSIDE the $49 Core; not a standalone funnel |
| `/transparency/q1-2027` | Public metrics (Verified Builders identity proof) | Trust asset; outbound traffic to `/diagnostic` |
| `/faq`, `/about`, `/contact`, `/privacy`, `/terms`, `/login` | Trust + utility surfaces | Standard SaaS skin; do not divert the One Funnel |

### Category D: Time-Boxed Event Wrapper

Same destination, different framing for a discrete moment.

| Route | Why it's not a competing funnel |
|---|---|
| `/founding` + `/founding/v1-3` | Founding-Cohort PLF (DCS Secret #21). One-time event with a 50-seat cap. Wraps the SAME $49/mo subscription with three additional bonuses (lifetime price lock, founding badge, 30-day direct line). Activation gate: cap reached or 7-day window expires. Post-window the PLF surfaces 404 / redirect to `/machine-sales` per `strategy/founding-plv-scripts.md`. Never a parallel-revenue line. |

**Verdict:** Zero OFA violations in the current codebase. Every surface either
IS the One Funnel, feeds the One Funnel, supports the One Funnel, or is a
time-boxed wrapper around the One Funnel.

---

## Section 3: The OFA Vow — Three Tests for Every New Surface

Before any new route, sequence, product page, or paid-traffic destination
ships, it must pass all three tests. Failing any one = an OFA breach. Build
stops until either the surface is reclassified, the rule is broken with
documented Revision Mode, or the proposal is shelved until activation.

### Test 1: Does it route into the One Funnel?

Every new surface must end on a CTA that routes the visitor into the
ten-surface chain in Section 1 (or into Category B alternate doors that
themselves route into it). A new surface whose primary CTA is anything
other than `/diagnostic`, `/parables`, `/start`, `/starter`, or
`/machine-sales` fails Test 1.

**Exception:** Category C supporting assets whose primary job is proof or
trust, where the outbound link to `/diagnostic` or `/machine-sales` is
present but not primary. These must declare themselves Category C in the
new surface's header comment and be reviewed against the Veto List.

### Test 2: Does it touch a different product?

UnlockSaaS sells ONE product across two SKUs: a $1 Starter and a $49/mo
Machine. The Rung 2 placeholder is a published spec, not a sellable
product. A new surface that introduces a third SKU, a new product line, a
white-label tier, a service tier, an agency tier, a course tier, or a DFY
tier fails Test 2.

**Exception:** A bonus to the $49 Core that delivers via a dedicated page
(e.g. `/challenge`) but charges nothing additional. The Core's price stays
$49. The bonus is inventory in the existing stack.

### Test 3: Does it pull attention from the work that produces the next customer?

Brunson's hidden Secret #26 rule: building a second funnel before the first
converts is the most sophisticated form of avoidance the founder has. A
new surface that requires more than ~1 sprint of work AND does not directly
increase conversion on an existing One-Funnel surface fails Test 3.

**Exception:** Pre-staging that is correctly gated. A new surface that
ships behind an evidence gate (e.g. paid ads behind diagnostic conversion
threshold) does not breach Test 3 because it is not running — it is
inventory. The Funnel Audibles playbook (`strategy/funnel-audibles.md`)
handles the live-operation tweak loop without breaching OFA.

---

## Section 4: The Veto List — What We Will NOT Build Until the One Funnel Converts

Brunson rule: the next funnel doesn't exist until the current funnel produces
a verified paying customer. The following list is the documented graveyard
of "tempting next funnels" that are pre-vetoed at the spec level. Each one
is real — meaning a competent founder will be tempted by it — and each one
is forbidden until the One Funnel meets the activation trigger in Section 5.

| # | Tempting next funnel | Why it's vetoed today | Earliest possible activation |
|---|---|---|---|
| 1 | `/agency` — high-ticket DFY tier | Violates lean-ladder discipline (Workbook 01 §3); founder rejected coaching/DFY explicitly | Never at this scope. Reserve for a separate company. |
| 2 | `/coaching` — 1-1 or group coaching | Same as #1 | Same. |
| 3 | `/build-for-me` — fractional-implementation service | Adds a service product to a software business; conversion attention split | After Rung 2 has 10+ customers, re-evaluate. |
| 4 | `/template-marketplace` — paid templates / swipe files | Third SKU; pulls founder time from Machine improvements | After 50+ paying customers, re-evaluate. |
| 5 | `/community` (paid standalone) | The Outreach Room bonus already delivers the community need inside the $49 Core | Never as standalone; defend as Core bonus. |
| 6 | `/podcast` (host) — own-podcast launch | Workbook 09 §1 explicitly skips host-channel pre-PMF; production cost too high | 50+ paying customers per Workbook 10 §6 |
| 7 | `/course` — self-paced video course | The Machine IS the product; course would compete on attention and frame the product as teaching, violating Workbook 05 §2 design law | Never. The framework lives in the engine. |
| 8 | `/summit` — Verified Builder Summit | Spec exists in `strategy/audits/2026-05-17-brunson-trilogy-audit.md` (DCS #16 re-grade section). Highest-leverage Phase-2 play — but pre-condition is 3 verified UnlockSaaS customer wins, otherwise the founder's keynote opens with "I built a tool nobody has used yet." | 3 verified customer cycles per Workbook 10 §6 Phase 2 trigger |
| 9 | `/affiliate-program` — public affiliate marketplace | Workbook 10 §3 explicitly defers to 50+ customers; "join my affiliate program" reads as outsourced selling before 50 | 50 paying customers per Workbook 10 §6 Phase 3 trigger |
| 10 | `/ads/google` / `/ads/meta` / `/ads/x` — paid acquisition (beyond brand defense) | Cold-traffic conversion at $49 burns money pre-PMF; Workbook 09 §5 activation criteria locked | Free Diagnostic 30%+ conversion AND $1 Starter 5%+ conversion AND 3+ verified cycles |
| 11 | `/api` — public API tier for other tools | Adds product surface area before the canonical product converts | Never until Rung 3 + 100 customers. |
| 12 | `/integrations/{lovable,stripe,kit}` — paid integration channels | Workbook 10 §2 activation gate: 3+ verified customer cycles, then start outreach to integration partners | 3 verified customer cycles |
| 13 | `/founding/round-2` — repeat Founding Cohort with a new 50-seat cap | Founding bonuses (lifetime price lock + founding badge + direct line) are by-definition non-repeatable | Never. The cohort closes once, by design. |
| 14 | `/diagnostic/{vertical}` — vertical-specific diagnostics (AI-only, B2C-only, etc.) | Splits Marco's avatar into sub-avatars before the canonical avatar produces a customer; Workbook 01 §1 Q1 is locked at "post-launch pre-revenue non-engineer founders" | Phase 3 (50+ customers) + clear evidence of a sub-avatar buying differently |

**The Veto List is the discipline.** Brunson's One Funnel Away is not the
discipline of having one funnel by accident — it is the discipline of saying
no to fourteen plausible next funnels every week until the first one
converts. Print it. Re-read it weekly. Every "we should add X" gets checked
against this list before any code is written.

---

## Section 5: Activation Trigger — When Does the Second Funnel Earn Its Right?

The second funnel is the **Summit Funnel** (`strategy/audits/2026-05-17-brunson-trilogy-audit.md`
DCS #16 re-grade section), and it activates only when ALL of the following are
true:

1. **At least 1 Stripe-verified paying customer has completed the Machine.**
   Source: `verified_conversions` table count ≥ 1. This is the floor — without
   it, the Verified Builder identity is a manifesto on a homepage rather than
   an event.

2. **At least 3 paying Core customers have completed the full Machine loop.**
   Source: `core_activated` count ≥ 3 AND each has milestone
   `first_paying_customer_verified`. This is the Phase 2 trigger from
   Workbook 10 §6.

3. **At least 1 unprompted "what's next" ask has landed.**
   Source: `repeatable-interest-form` submission OR direct email to
   maryan@unlocksaas.com containing the demand signal. Surface: `/repeatable`
   page captures this today.

4. **Founder self-dogfood pass is complete.**
   The founder has run the Machine on himself, ascended to Rung 2 by his own
   need for "what's next," and shipped it in his own funnel.

Until all four are true, the Summit Funnel is in the Veto List. Once all four
are true, the Veto-List entry for `/summit` flips to ACTIVE and a separate
spec ships under Revision Mode for `strategy/decisions/summit-funnel.md`.

**The order is fixed:** evidence first, then second funnel. Reversing the
order is the most common OFA breach in the founder population Brunson works
with.

---

## Section 6: Audible Distinction — Tweaks vs New Funnels

The Funnel Audibles Playbook (`strategy/funnel-audibles.md`) handles the live-
operation tweak loop. Audibles are NOT new funnels. The distinction is
load-bearing — without it, every "let's try a different headline" becomes
an OFA breach in disguise.

| Action type | OFA classification | Process |
|---|---|---|
| Swap a headline on `/starter` from Hook #3 to Hook #10 | **Audible** | Friday Audible Call, 10 minutes, copy from pre-staged vault |
| Add a new bonus to the $49 Core stack | **Audible** | Stack expansion, no new product, no new surface |
| Reorder the FAQ block on `/machine-sales` | **Audible** | Friday Audible Call |
| Add a new email to the Soap Opera Sequence | **Audible** | Workbook 04 §5 expansion under Revision Mode |
| Change OTO copy from "Continue the Machine" to "Unlock the rest" | **Audible** | A/B variant in pre-staged vault |
| Ship `/diagnostic/saas-vertical` as a sub-vertical diagnostic | **New funnel — VETOED** | See Veto List #14 |
| Ship `/coaching` page with Calendly embed for $497 calls | **New funnel — VETOED** | See Veto List #2 |
| Ship `/community` standalone paid Discord at $19/mo | **New funnel — VETOED** | See Veto List #5 |
| Ship `/founding/round-2` after first cohort closes | **New funnel — VETOED** | See Veto List #13 |
| Ship `/summit` after 3 verified customers + founder dogfood pass | **Second funnel — ACTIVATED** | See Section 5 |

The bright line: **a new surface that requires a new product, a new SKU, a
new bonus tier, or a new sub-audience is a new funnel and is vetoed until
the One Funnel converts.** A tweak to existing surfaces is an audible and is
expected and welcomed weekly.

---

## Section 7: The OFA Vow — Self-Check Mechanism

The guardrail is only as strong as the founder's discipline to invoke it.
The following self-check question must be asked before opening any new file
that creates a new route, a new product, or a new SKU:

> **"Does this surface ship a new product line, or does it improve the
> conversion of the existing $1 → $49 chain?"**

If the answer is "ships a new product line," check the Veto List. If on the
Veto List, the answer is no. If off the Veto List, the answer is still
probably no — file a Revision Mode entry and update this document before
writing any code.

If the answer is "improves conversion of the existing chain," proceed. The
Funnel Audibles Playbook is the right home for the work.

A second self-check, applied weekly during the Friday Audible Call:

> **"Has any new surface shipped this week that did not appear on the
> last Friday review? If yes, did it pass the three OFA tests?"**

The Friday Audible Call doubles as the OFA Friday Audit. The two rituals
share the same 30-minute slot.

---

## Section 8: Status

- **DCS Secret #26 score:** 92 → **100** under stage-appropriate scoring.
- **The discipline that was implicit is now explicit.** A future founder, a
  future contributor, or a future autonomous push has a single document to
  consult before adding new surfaces.
- **The Veto List is the load-bearing artifact.** Fourteen named graveyards.
  Each one a real temptation. Each one pre-vetoed.
- **Activation trigger is unambiguous.** Four conditions, all measurable,
  all enforceable from data already collected.
- **The Audible / New Funnel bright line is documented** so the Funnel
  Audibles Playbook can run weekly without ever accidentally breaching
  OFA.

**This document is itself NOT a funnel.** It is a discipline artifact. It
ships nothing to users. It exists to prevent the founder from shipping the
wrong thing to users.

---

## Section 9: References

- DotCom Secrets, Secret #26 (One Funnel Away)
- `strategy/workbooks/04-building-your-funnels.md` §1 (One Offer, One Funnel)
- `strategy/workbooks/02-funnels-value-ladder.md` §6 (One Offer, One Funnel — build order)
- `strategy/funnel-audibles.md` (the tweak loop)
- `strategy/decisions/rung-2-repeatable-revenue.md` (the build-gated next product)
- `strategy/audits/2026-05-17-brunson-trilogy-audit.md` DCS #16 (the Summit re-grade)
- `strategy/state.json` `audit_response.dcs_26` (machine-readable status)

— Locked 2026-05-17 by Brunson Architect under audit-v3 autonomous push.
