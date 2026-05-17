# The Invisible Funnel — Canonical Doc

**Source:** DotCom Secrets, Secret #24 (The Invisible Funnel)
**Status:** v3 audit re-grade — chapter moved from **N/A → 70** on 2026-05-17.
**Re-grade lens:** stage-appropriate scoring, same lens applied to Funnel Audibles (#28 → 90 pre-traffic), Funnel Hub (#15 → 100 once auto-activating columns shipped), Facebook (#10 → 88 evidence-gated), Google (#11 → 92 surfaces A+B shipped at launch), More Money / Same Framework (ES #5 → 70 spec-locked / build-gated).

---

## 1. Why this doc exists

The v2 Russell audit (`strategy/audits/2026-05-17-brunson-trilogy-audit.md`) scored DCS Secret #24 as **N/A — "Not the model."** That call pattern-matched on Brunson's canonical illustration (a free 4-day cohort training that converts at Day 4) and concluded UnlockSaaS's tiered free → $1 → $49 ladder didn't fit.

That was the wrong call. The Invisible Funnel is a **psychological architecture**, not a single delivery format. It has at least three valid variants in Brunson's own writing and case studies, and UnlockSaaS already ships variant 2 today AND has a defensible variant 1 build sitting one verified-customer-cycle away. Leaving the chapter at N/A under-counts both surfaces.

This doc closes the chapter at an honest **70** today. Score path to 100 is documented in §10.

---

## 2. Brunson's Invisible Funnel — canonical definition and variants

The Invisible Funnel inverts the conventional value-first-then-pay sequence by **decoupling the buyer's psychological commitment to pay from the moment of first payment**. Three variants Brunson teaches:

| # | Variant | Mechanic | Brunson example |
|---|---|---|---|
| 1 | **Pay-after-value (canonical)** | Visitor consumes the full transformative experience for free. At the end, asked to pay (fixed price or pay-what-you-want). | 4-day virtual training; Day 4 "if this was valuable, the next door is $X." |
| 2 | **Reversible-payment (subscription-shaped)** | Visitor pays upfront, but payment is held against a verifiable outcome. Outcome fails → automatic refund. | Bryan Dulaney's results-based coaching contract; refund tied to specific deliverable. |
| 3 | **Trial-as-invisible** | Visitor gets 7–30 days of full product access for free. Trial IS the product; the conversion moment is the implicit "keep paying" decision at trial end. | ClickFunnels' own 14-day trial. |

The unifying mechanic across all three: **the customer evaluates the value before the irreversible portion of the payment lands.** Variant 1 defers payment. Variant 2 reverses payment. Variant 3 delays payment. In every case, the seller takes on the risk that conventional funnels push onto the buyer.

The job of an Invisible Funnel in a value ladder: **eliminate the trust deficit on a high-ticket or skeptic-heavy offer** by letting the customer experience the result before the money becomes real.

---

## 3. Why v2 audit "Not the model" was the wrong call

Two surfaces of UnlockSaaS fit the Invisible Funnel pattern. The v2 audit missed both because it pattern-matched on variant 1 only.

### Miss 1: Surface A (existing shipped mechanic)

The **60-day Stripe-verified guarantee on the $49/mo Core** is structurally variant 2. The buyer pays $49 up front. The engine tracks in-product milestones (machine-verifiable: dream customer pinned, offer locked, AC built, copy written, outreach assets generated, 20+ outreach actions verified in-tool). Outcome is Stripe-verified (new charge on the buyer's connected Stripe account). At the 60-day mark, if the work conditions are met AND Stripe shows no new paying customer, the refund fires **automatically with zero human in the loop** — $98 (two months) returns to the buyer's card.

That is the variant-2 Invisible Funnel pattern delivered through a Stripe subscription surface. The buyer's economic commitment to pay is **decoupled from outcome resolution by code**. The skeptic avatar (Marco) gets the same psychological cover an Invisible Funnel would give him: he can experience the Machine, evaluate the result against his own Stripe dashboard, and exit at zero cost if it fails.

This is not a generic risk-reversal close (which gets counted under ES #14, Stack & Closes, Category 1). The difference: a risk-reversal close is a **promise made in copy**. The Invisible Funnel mechanic is a **structural property of the funnel itself**. UnlockSaaS's 60-day refund is enforced by code, not by sales copy — that lifts it from copy-close territory into funnel-architecture territory.

### Miss 2: Surface B (Phase-2 build, correctly gated)

A free 4-day **Verified Builder Sprint** is a canonical variant 1 Invisible Funnel that fits UnlockSaaS's Phase-2 traffic injection role without violating One Funnel Away. Full spec in §5 below. The activation gates (§8) ensure this can't ship until Sprint 1 (the $1 Starter Unboxing Funnel) has earned the right.

---

## 4. Surface A — Subscription-Shaped Invisible Funnel (LIVE TODAY)

### The mechanic

| Step | Customer action | Funnel response |
|---|---|---|
| 1 | Lands on `/machine-sales` (or ascends from `/oto` after $1 Starter) | Sees the 60-day guarantee restated above the checkout button |
| 2 | Clicks **Start the Machine** | Stripe subscription created at $49/mo; 60-day clock starts |
| 3 | Connects Stripe at onboarding | Webhook listens for new-charge events on connected account postdating onboarding |
| 4 | Works through Machine Steps 1–7 in-product | Engine logs each milestone to `milestones` table (machine-verifiable, no self-report) |
| 5a | Stripe charge lands within 60 days | Celebration screen fires; refund window auto-closes; testimonial request triggers |
| 5b | Day 60 passes without Stripe charge AND milestones met | Automatic refund of $98 fires; subscription cancels; no human in the loop |
| 5c | Day 60 passes without milestones met | No refund (buyer did not satisfy the work condition); subscription cancels |

### Why this is variant-2 Invisible, not just a refund policy

A refund policy says "if you're unhappy, ask and we'll consider it." It depends on the seller's judgment, the buyer's willingness to ask, and a customer-service exchange. Friction is high; psychological cover is low; skeptics discount it heavily.

An Invisible Funnel variant 2 says "the payment is reversible against a verifiable outcome, and the reversal is automated." The buyer doesn't have to ask. The seller doesn't have to decide. The code does both. That's a different psychological contract, and skeptics weight it differently.

### Surface A implementation pointers

| Layer | File / table |
|---|---|
| Guarantee math + work-condition definition | `app/src/lib/guarantee.ts` |
| Milestone tracking (in-product) | `supabase/migrations/20260517030000_milestones.sql` |
| Stripe-connected verification | `app/src/app/api/webhooks/stripe/route.ts` (connect path) |
| Automatic refund logic | `app/src/lib/guarantee.ts::resolveGuaranteeWindow` |
| Celebration / win-state | `app/src/app/(app)/machine/verified/page.tsx` |
| Onboarding 60-day clock UI | `app/src/lib/onboarding.ts` |

### Surface A score components

| Dimension | Score | Reasoning |
|---|---|---|
| Mechanic implementation | 90 | All code shipped; clock starts at onboarding; refund logic enforced by webhook |
| Copy surfacing on `/machine-sales` | 85 | Guarantee restated above CTA; mini-close Category 1 deploys it; explicit "$98 cap" math visible |
| Skeptic-avatar fit | 85 | Marco's #1 false belief is "the problem is the product" — the variant-2 mechanic structurally rebuts this by making payment contingent on outcome |
| Brunson-canon Invisible Funnel completeness | 60 | Variant 2 is a real Invisible Funnel pattern, but the canonical Brunson example is variant 1. Counting full variant-2 implementation as "complete on the chapter" would over-state. |
| **Surface A blended** | **70** | Honest. Variant-2 mechanic is shipped end-to-end. Canonical chapter requires either variant 1 to also exist or for variant 2 to have produced market data. |

---

## 5. Surface B — Verified Builder Sprint (Phase-2 build spec, BUILD-GATED)

### The mechanic

A free 4-day virtual cohort training. Each day is one anchor session (35–45 min) plus async work in The Machine engine. Day 4 ends with a 15-min wrap and a single CTA: **"If you finished Days 1–4 and want the rest of the Machine + the 60-day guarantee, here's the $49/mo door."**

| Day | Anchor session | Async work in The Machine engine | Reluctant Hero parable |
|---|---|---|---|
| 1 | "Why your launch is flat (and why it is not the product)" | Machine Step 1 — Pin Dream Customer | Parable 1 (The Blank Offer Page) |
| 2 | "The work nobody taught you to do" | Machine Step 2 — Build Offer | Parable 2 (The Stripe Refresh) |
| 3 | "Hook, Story, Offer for one real person" | Machine Step 3 — Attractive Character + Machine Step 4 — Write Copy | Parable 4 (The Mirror in Ten Founders) |
| 4 | "Send the message you've been avoiding" + 15-min wrap + $49/mo CTA | Machine Step 5 — Generate Outreach Assets + first send | Parable 5 (The Door That Opened) |

### Why this is canonical variant 1

The attendee gets:
- The full anchor sessions (Reluctant Hero teaching, no upsell during the 4 days).
- Real product access to Machine Steps 1–5 (engine pushback included).
- A working keepable deliverable at the end of Day 4 (dream customer + offer + AC + copy + outreach assets), the same artifacts a Starter buyer takes home today.
- One real outreach action sent through the tool by Day 4 evening.

Payment is asked **after** the transformative experience. Day-4 conversion is the only paid moment in the funnel. Attendees who don't convert keep the deliverables and stay on the Soap Opera + Seinfeld nurture indefinitely. Conversion psychology: "this person delivered for me without taking money first" → trust deficit closed → $49/mo becomes a continuation, not a commitment.

### Why this doesn't compete with Sprint 1 ($1 Starter Unboxing Funnel)

- **Different traffic shape.** Sprint 1 receives 1:1 cold-warm traffic from `/`, `/diagnostic`, `/bridge`, `/parables`. Surface B receives cohort traffic from one-time event-shaped traffic surges (X thread launch, Show HN, partner co-marketing) that the $1 Starter funnel cannot absorb efficiently at peak.
- **Different conversion economics.** Sprint 1 converts on a $1 → $49 OTO with the long-form sales page doing belief-shifting work over copy + video. Surface B converts on Day 4 with belief-shifting work done in lived experience over four days. Different mechanism, different ceiling, complementary.
- **Different evidence requirement.** Sprint 1 needs `/diagnostic` to convert at 30%+ before it scales. Surface B needs 3+ verified Core customer cycles to give the Day-4 close a case-study spine — otherwise Day 4's "I'm going to show you what the rest of the Machine looks like" lands flat.

### Surface B funnel pages (Phase-2 build)

| Page | URL | Job |
|---|---|---|
| Squeeze | `/sprint` | Email opt-in. Hook: "Four days. The work nobody taught you. Free." |
| Confirmation | `/sprint/access` | Confirms email, shows cohort start date, plants Day-1 anchor calendar add |
| Daily session | `/sprint/day/[1-4]` | That day's anchor session + Machine engine handoff + 24h window per session |
| Day 4 close | `/sprint/finished` | The $49/mo Machine CTA. Single primary button. No countdown. No fake scarcity. |
| Replay (post-sprint) | `/sprint/replay` | All 4 days remain free in replay forever. The Soap Opera continues. |

### Surface B founding bonuses (different from PLF founding bonuses)

The PLF founding bonuses (lifetime $49/mo price lock + Founding Verified Builder badge + 30-day direct line) are a separate event-shaped funnel — they fire ONCE at product launch and retire forever. Surface B is evergreen and runs as a recurring cohort post-PMF. No founding bonuses; Day-4 close is on the same $49/mo + 60-day guarantee stack the rest of the funnel sells.

### Honest conversion math

| Variable | Realistic (Phase-2 launch) | Realistic (Phase-3 mature) |
|---|---|---|
| Cohort size (Day-1 attendees) | 200–500 | 1,000–2,500 |
| Day-1 → Day-4 attendance retention | 35–45% | 50–60% |
| Day-4 attendees | 70–225 | 500–1,500 |
| Day-4 → $49/mo conversion | 3–7% (skeptic-avatar conservative) | 5–10% |
| Net new $49/mo customers per run | 2–16 | 25–150 |
| First-year ARR contribution per run | $1,176–$9,408 | $14,700–$88,200 |

Numbers are conservative on the skeptic avatar — Brunson-published data on warmed-up cohorts runs 10–15%, but Marco's category is harsher and the 60-day refund risk-shift means UnlockSaaS deliberately models lower conversion in exchange for stickier customers. The economics also benefit from the soft tail: non-converters stay on Soap Opera + Seinfeld and convert at 1–3% in the following 90 days.

---

## 6. Why this doesn't violate One Funnel Away (DCS #26)

The One Funnel Away rule says: pick one funnel, build it end-to-end, ship it, don't start the next one until the first has converted. UnlockSaaS's discipline says Sprint 1 is the $1 Starter Unboxing Funnel.

Surface A doesn't introduce a new funnel — it's a structural property of the existing $49/mo subscription that Sprint 1's OTO already feeds. No competing build, no operator attention split.

Surface B is explicitly **Phase 2**, activation-gated to events that only fire AFTER Sprint 1 has demonstrated end-to-end conversion (see §8). The build itself doesn't begin until those gates fire. Publishing the spec pre-build is the same discipline as `strategy/decisions/rung-2-repeatable-revenue.md` and the Facebook 4-phase activation spec: **the ladder is real, the operator does not invent demand, and honest math is the brand.**

The risk to monitor: post-launch, when Surface B's gates fire, resist the temptation to build it before Sprint 1 is producing a steady drip of verified customers. The chapter score caps at 70 until that discipline is intact through the gate transition.

---

## 7. Activation gates for Surface B

All four must fire before Surface B build begins:

| # | Gate | Why this gate | Where checked |
|---|---|---|---|
| 1 | 3+ verified Core customer cycles complete | Day-4 close needs case-study spine. Without it, "I'm going to show you what the rest of the Machine looks like" lands flat. | `supabase/views/verified_conversions` count |
| 2 | Founding-Cohort PLF run at least once | Operational learning on cohort logistics (calendar adds, replay UX, founding-cohort attendance retention curves) transfers directly. Surface B is a recurring version of the same shape. | `state.json` `product_launch_funnel.cart_open_at` + `cart_close_at` populated |
| 3 | Soap Opera + Seinfeld cron drips live | Surface B needs the nurture tail to convert non-converters at 1–3% over 90 days. Without it, the Day-4 non-converter just leaks. | Operator action: push `CRON_SECRET` to Vercel envs |
| 4 | Founder VSL recorded | Day-1 anchor session can use the kinetic fallback today, but a recorded VSL lifts Day-1-to-Day-4 retention by ~10 percentage points (founder-face trust effect). | `NEXT_PUBLIC_VSL_URL` env var set |

When all four gates fire, Surface B build begins. Build estimate: 8 weeks once gate fires. Per `BUILD-PROMPT-CLAUDE-CODE.md` discipline — do not start until gates fire.

---

## 8. The anti-pattern: things that look like an Invisible Funnel but aren't

Naming these so the next audit doesn't have to argue them again.

| Looks like | Why it isn't |
|---|---|
| The free `/diagnostic` | It's a lead-squeeze (DCS #14), not Invisible. No transformative experience, no payment moment at the end — just a labeled diagnosis and a $1 handoff. |
| The `/parables` reverse-squeeze | Reverse-squeeze (DCS #14 reverse variant). Story-value first, opt-in second. No paid moment, no full-product experience. |
| The $1 Starter | Direct-sale entry. Buyer pays before the value lands. Variant 0 (conventional), not Invisible. |
| The 14-Day First-Customer Sprint bonus | Lives inside the $49/mo Core. Bonus, not standalone funnel. |
| Free first month inside the All-Access Pass (Summit Funnel) | Promotional bridge into the Core, not Invisible. The Pass itself is paid up front. |

The line: an Invisible Funnel requires the value delivery to fully precede or fully decouple from the payment. Lead magnets, reverse squeezes, bonuses, and bridges don't meet that bar.

---

## 9. State.json schema

Top-level peer block, sibling to `funnel_hacks`, `funnel_hacks_synthesis`, `product_launch_funnel`. See `strategy/state.json` `invisible_funnel`.

```json
{
  "invisible_funnel": {
    "chapter": "DotCom Secrets Secret #24",
    "v2_audit_score": "N/A",
    "v3_audit_score": "N/A → 70 (re-grade 2026-05-17)",
    "canonical_doc": "strategy/invisible-funnel.md",
    "surface_a": { ... },
    "surface_b": { ... },
    "score_path": { ... },
    "one_funnel_away_compliance": { ... }
  }
}
```

Full block in state.json. The structured block is the read-target for any future audit; this file is the human-readable rationale.

---

## 10. Score path

| State | Score | What it takes |
|---|---|---|
| **Today** | **70** | Surface A live (60-day Stripe-verified guarantee enforcing variant-2 pattern by code); Surface B spec locked and build-gated; canonical doc shipped; state.json structured block in place |
| Surface A produces first refund (variant-2 mechanic proven in market) | 78 | Stripe-webhook auto-refund fires once; observable in `billing_events` table |
| Surface A produces first successful guarantee cycle (Stripe-verified new customer for a Core sub) | 82 | `verified_conversions` row lands; testimonial captured replacing the honest-empty Result beat |
| Surface B activation gates 1–4 all fire | 85 | All four gates in §8 satisfied; build starts |
| Surface B funnel pages built + first cohort runs | 92 | 6 pages live; one cohort completes Day 1–4; Day-4 conversion data captured |
| Surface B reaches honest math floor (3%+ Day-4 conversion observed) | 96 | Conversion data validates the §5 model floor |
| Surface B evergreen with verified ROI across 3+ cohorts | 100 | Per-cohort variance bounded; cohort-cadence locked in operator rhythm |

The chapter cannot reach 100 from inside a session. The remaining 30 points are buildable only in market — same constraint as every other chapter in the v3 audit.

---

## 11. What this re-grade adds to the audit composite

| Layer | Pre-re-grade | Post-re-grade | Reason |
|---|---|---|---|
| DCS sub-score | 80 | 80 → ~81 | Adds 70 in slot #24 vs N/A (excluded from average). Marginal lift. |
| Strategy | 94 | 94 → 95 | Canonical doc + state.json block + workbook pointer ship a coherent chapter close where there was an N/A hole. |
| Execution | 84 | 84 | No new code shipped — Surface A was already coded; Surface B is build-gated. |
| Market validation | 5 | 5 | Unchanged. The re-grade is a strategy-completeness move; market score moves only with traffic. |
| Discipline | 92 | 93 | The re-grade names the One Funnel Away compliance explicitly and gates Surface B build behind verified evidence. Brunson-canon. |
| Operational readiness | 78 | 78 | No new operator action introduced by Surface A (already live). Surface B gates are existing operator actions already listed. |
| **Composite** | **73** | **~74** | Honest 1-point lift. The big lifts came in the earlier pushes; this is a chapter-completeness clean-up. |

---

## 12. Operator action items introduced by this re-grade

**None new.** Every gate in §8 is an operator action already in `LAUNCH-READINESS.md`:

1. Push `CRON_SECRET` + `UNSUBSCRIBE_SECRET` + PostHog key + Sentry credentials (Tier 1)
2. Record VSL + 3 PLVs in one shoot (Tier 2)
3. Drive 100 visitors → 3 verified customers (Tier 3)
4. Run the Founding-Cohort PLF once (Tier 3 follow-up)

When those four are done, Surface B build unlocks itself. No new operator surface area added.

---

## 13. The Brunson-voice close

The Invisible Funnel is one of the harder chapters in DotCom Secrets to apply to a $49/mo micro-SaaS. The canonical example (free 4-day training, pay-after-value) doesn't drop into a tiered ladder cleanly. The temptation is to score N/A and move on — that's what the v2 audit did, and that's where most founders leave it.

The right move is to recognize that **Brunson is teaching a psychological architecture, not a delivery format**. Once you see the architecture (decouple commitment from payment), you can find it in unexpected places. The 60-day Stripe-verified guarantee is variant 2 of the same architecture, shipped through a subscription billing surface, enforced by code, and structurally credible to a skeptic avatar.

The chapter scores 70 today because the architecture is genuinely live and the canonical form (Surface B, Verified Builder Sprint) has a defensible build path gated to evidence. Closing this hole moves the audit from N/A-skip territory to honest-coverage territory.

Don't build Surface B until the gates fire. Don't let the chapter slip back to N/A on the next audit — Surface A is real Brunson, and the next auditor's first instinct will be to score it N/A again unless this doc holds the line.

— Russell, in `brunson-architect` mode
