# Integration Partners — UnlockSaaS

**Project:** UnlockSaaS
**Chapter source:** DCS Secret #13 (Other People's Funnels) + Traffic Secrets Secret #4 (Work Your Way In / Buy Your Way In) + workbook 10 §2 (Integration Marketing)
**Status:** 5 deep packets ready (2026-05-17). All gated on 3+ verified UnlockSaaS customer cycles.
**Parent doc:** `strategy/other-peoples-funnels.md`

---

## Purpose

The dream-100-outreach.md §4 templates were 1-paragraph teasers. These are full operator-ready packets: warm-up plan, value-exchange math, embed/asset spec, objection bank, call-walkthrough, success-metric agreement, exit clause. Each packet lives independently so the operator opens one file the day the gate fires for that partner.

## The 5 packets

| # | Partner | Why it's the highest-leverage of its category | File |
|---|---|---|---|
| 1 | **Lovable** | Single biggest niche overlap. Marco's #1 build tool. The integration argument writes itself ("post-ship is where Lovable users disappear; here is what to do that week"). | `lovable.md` |
| 2 | **Stripe Atlas** | Strongest authority anchor. Stripe IS the verification mechanism. The integration argument is structurally clean ("Stripe-as-truth-source for what counts as a customer"). | `stripe-atlas.md` |
| 3 | **Indie Hackers** | Largest concentrated Marco-adjacent audience. Editorial-product crossover is precedented. | `indie-hackers.md` |
| 4 | **Bootstrapped Founder** (Arvid Kahl) | Strongest editorial-narrative authority. Arvid's *Embedded Entrepreneur* frame is the exact philosophical anchor for the Machine. | `bootstrapped-founder.md` |
| 5 | **Kit (ConvertKit)** | Already our locked marketing-ESP vendor (per `project_unlocksaas_infra.md`). Co-marketing is one publicly-stated reciprocation away. | `kit-convertkit.md` |

## The gate

3+ verified UnlockSaaS customer cycles closed inside the Machine. Reason: integrations sit inside a partner's editorial/product surface for months; sending a pitch without verified-customer evidence reads as "I'm fishing for distribution because my own funnel isn't working." Brunson rule: pitch only after proof.

## What every packet contains (shape)

Every packet follows the same 9-section shape so the operator reads them in the same order each time:

1. **The partner, in one paragraph** — what they do, who their audience is, why our audience overlaps
2. **Why this partner specifically** — what makes this the right-time-right-place integration
3. **Warm-up cadence (pre-gate)** — what to do during the launch sprint so they recognize the name when the pitch arrives
4. **The pitch** — verbatim email/DM, all blanks documented
5. **The asset(s) we propose to co-build** — concrete spec, defensible value
6. **Value-exchange math** — what they get in their currency
7. **Objection bank** — the 5 objections the partner most likely has, with the response to each
8. **Success-metric agreement** — what "this worked" looks like for both sides, written before launch
9. **Exit clause** — how we end the integration cleanly if it doesn't perform

## The cross-cutting rules

These apply to every packet and override anything inside them.

1. **Three verified customers must exist** before any pitch fires.
2. **Six logged warm-up touches** per partner before the pitch (visible in `dream_100_touches` table, `channel='integration_warmup'`).
3. **The pitch ends with a two-option close**, never "let me know what you think."
4. **The pitch uses a real customer name**, with permission, in the `[Customer name]` slot. Generic "case studies attached" gets archived in 8 seconds.
5. **The integration must drive traffic back to the partner** as much as it captures traffic for us. Brunson rule #9 from `other-peoples-funnels.md` §5: "an audience-borrow without a give-back is a one-shot."
6. **Each integration gets a unique attribution slug** registered in `app/src/lib/fill-your-funnel/link-registry.ts` (`integration-lovable`, `integration-stripe-atlas`, etc.). All traffic from the integration is measured per-partner.
7. **Each integration has a 90-day evaluation cadence.** If success metrics aren't on track at day 90, fire the exit clause; don't extend out of partner-relationship politeness.

---

*Generated 2026-05-17 during DCS #13 autonomous push. Reconciled against workbook 10 §2 (integration marketing), `strategy/other-peoples-funnels.md`, `strategy/dream-100-outreach.md` §4 (where the 1-line teasers were).*
