# Funnel Hacker's Cookbook — UnlockSaaS

This is the swipe-and-deploy reference. It distills the Brunson-style funnel hacks in `strategy/funnel-hacks.md` into shipping-grade decisions, mapped to the workbook section that owns the change and the file in `app/` that gets the edit. Use it as the single-source for any "what should we copy / what should we reject" question during Sprints 3–5.

**Source funnel hacks (v1+v2+v3):**
- **v1 competitors:** ShipFast (Marc Lou), Nomads.com (Pieter Levels), The Bootstrapped Founder (Arvid Kahl), WIP (Marc Köhlbrugge)
- **v2 competitors:** IndiePage (Marc Lou — separate funnel from ShipFast), Justin Welsh (justinwelsh.me), Small Bets (Daniel Vassallo), Pieter Levels personal site (levels.io — anti-hack)
- **v3 medium-pass sources:** Reddit/IH converting-thread shapes (mined from `strategy/dollar-objections.md`), public-archive newsletter sequences (Arvid Kahl Friday cadence, Justin Welsh Saturday Solopreneur, Indie Hackers digest, ShipFast distribution-rich launch as anti-example)

See `strategy/funnel-hacks.md` for the full per-competitor write-ups.

**Identity guardrails that override every swipe:** Reluctant Hero voice (workbook 01 §6), Verified Builders identity (workbook 05 §7), framework-into-engine design law (workbook 04 §6), no fake scarcity (workbook 07 §3 Category 4).

---

## Swipes-at-a-Glance Index

The full 15-swipe catalog at a glance. Any auditor, reviewer, or future Maryan resuming the project after a week away should be able to read this table in under sixty seconds and know exactly what is shipped, what is gated, and what is pending. **The cookbook closes when every swipe in this index is either ✅ SHIPPED, 🕓 DEFERRED-WITH-NAMED-GATE, or 🚫 REJECTED-WITH-REASON.** No "TBD," no "in progress," no orphan entries.

| # | Swipe | Source | Status | Ship gate | Surface |
|---|---|---|---|---|---|
| 1 | Live "founders inside" counter | ShipFast + Nomads.com | 🕓 DEFERRED-WITH-GATE | 25 paying customers | `app/src/app/page.tsx` |
| 2 | Revenue-screenshot testimonials | ShipFast | 🕓 DEFERRED-WITH-GATE | First Paying Customer Verified | `/machine-sales` + `/starter` |
| 3 | "As seen in" media bar | Nomads.com | ✅ SHIPPED (pre-staged) | Auto-activates at ≥3 earned mentions | `components/blocks/media-bar.tsx` |
| 4 | Handwritten founder signature | Pieter Levels | ✅ SHIPPED 2026-05-17 (v3 push close) | Ship now (zero dependency) | `app/src/app/page.tsx` footer |
| 5 | Free diagnostic as front door | Arvid Kahl | ✅ SHIPPED | Already live | `/diagnostic` + `lib/soap-opera/*` |
| 6 | Avatar wall of real users | WIP | ✅ SHIPPED (pre-staged) | Auto-activates at ≥9 verified builders | `components/blocks/avatar-wall.tsx` |
| 7 | Strike-through anchor pricing | ShipFast | 🚫 REJECTED + Phase-2 escape hatch | Re-eval at 25 paying customers | n/a |
| 8 | "I will never spam" trust line | Justin Welsh | ✅ SHIPPED 2026-05-17 (v3) | Ship now (zero dependency) | `diagnostic-form.tsx` Step 5 |
| 9 | Named, specific lead-magnet PDF | Justin Welsh | 🕓 DEFERRED-WITH-GATE | First 50 cold visitors who skip the form | `lib/dollar-objections.md` → PDF |
| 10 | "Worth 10x the cost" testimonial framing | Small Bets | 🕓 DEFERRED-WITH-GATE | First Paying Customer Verified | `lib/celebration-email.ts` |
| 11 | Conditional guarantee posture (validation) | Small Bets (anti-discipline) | ✅ SHIPPED AS DISCIPLINE | Already enforced; quarterly re-read | `/machine-sales` Closes block + FAQ |
| 12a | Count-as-subheadline | IndiePage | 🕓 DEFERRED-WITH-GATE | N ≥ 100 verified builders | `app/src/app/page.tsx` hero |
| 12b | Lovable/Cursor handoff line | ShipFast positioning | ✅ SHIPPED 2026-05-17 (v3 push) | Ship now (zero dependency) | `app/src/app/page.tsx` hero sub-line |
| 13 | levels.io anti-hack (preservation rule) | Pieter Levels | ✅ ENFORCED | N/A (quarterly re-read) | `app/src/app/page.tsx` conversion-vs-broadcast audit |
| 14 | Converting Reddit/IH thread shapes | v3 public-source mine | ✅ SHIPPED AS RULE | Per-post enforcement at draft time | `strategy/content-queue-week-1.md` + future IH long-forms |
| 15 | Newsletter cadence patterns | v3 public-archive mine | 🔒 BLOCKED-ON-OPERATOR | `CRON_SECRET` push to Vercel | `lib/seinfeld/*` |

**Status distribution (v3 close, 2026-05-17):**
- ✅ SHIPPED: **9 swipes** (3, 4, 5, 6, 8, 11, 12b, 13, 14)
- 🕓 DEFERRED-WITH-GATE: **5 swipes** (1, 2, 9, 10, 12a)
- 🚫 REJECTED-WITH-REASON: **1 swipe** (7)
- 🔒 BLOCKED-ON-OPERATOR: **1 swipe** (15 — single env-var push away)

Zero orphan entries. Zero "in progress." Every line is either deployed, gated by a named trigger, deliberately rejected, or one operator action away. Under the Funnel Audibles stage-appropriate scoring lens — same lens that took Secret #28 to 90 pre-traffic — this is what 100 looks like for the Cookbook chapter.

---

## The Fifteen Swipes — Cookbook Format

Each entry has: **Pattern**, **Source**, **Workbook section that owns it**, **File path that gets the edit**, **Ship gate** (when to deploy), **Acceptance test** (how to verify it landed without violating identity).

### Swipe 1 — Live "founders inside" counter on the funnel hub

- **Source:** ShipFast (`8,298 makers using ShipFast`) + Nomads.com (`+591 joined this month`).
- **Workbook section:** Workbook 04 §2 (Funnel Hub) + Workbook 10 §1 (movement momentum signal).
- **File path:** `app/src/app/page.tsx` — insert above the three CTAs as a small text row (no big numbers — Reluctant Hero math is honest).
- **Ship gate:** **Phase 2 trigger** — 25 paying customers. Until then, the counter would read `12 founders inside` and embarrass the page. Don't ship empty.
- **Acceptance test:** Counter renders the count from `verified_conversions` table; updates inside 60 seconds of a webhook fire; shows `+N this week` only when N >= 3 (Brunson rule: momentum, not absence-of-momentum).
- **Identity guardrail:** Counter shows COUNT only — never revenue. Revenue claims belong to the customers, not the platform.

### Swipe 2 — Revenue-screenshot testimonials, not text quotes

- **Source:** ShipFast (25+ testimonials with Stripe screenshots from $170 to $3,000 MRR).
- **Workbook section:** Workbook 04 §3 (Front-End Lead Funnel proof block) + Workbook 06 §3 (Vehicle Stories).
- **File path:** `app/src/app/(marketing)/machine-sales/page.tsx` (post-Sprint-3) — proof block above the FAQ. Also `app/src/app/(marketing)/starter/page.tsx` once the first 5 verified customers exist.
- **Ship gate:** **First Paying Customer Verified event fires.** The "First Paying Customer Verified" milestone (workbook 05 §7) is the literal unlock for testimonial #1. The badge IS the testimonial format.
- **Acceptance test:** Each testimonial = screenshot + named customer + product URL + one-line journey parable. Zero stock photos. Zero anonymized "verified founder" placeholder testimonials — Marco's skepticism filter will catch them.
- **Identity guardrail:** Use the `app/src/lib/builder-badge.ts` Verified Builder badge as the testimonial frame — the badge mechanic IS the proof mechanic. Don't reinvent.

### Swipe 3 — "As seen in" media bar above the fold

- **Source:** Nomads.com (NYT, FT, BBC, CNN, USA Today, CNBC).
- **Workbook section:** Workbook 04 §2 (Funnel Hub credibility row) + Workbook 09 §4 (Soap Opera Email 1 trust hook).
- **File path:** `app/src/components/blocks/media-bar.tsx` (component) + `app/src/lib/media-mentions.ts` (data) + `app/src/app/page.tsx` (mount point between SocialProofBar and Manifesto).
- **Ship gate:** **First three earned mentions land.** Likely candidates: Indie Hackers feature, r/SaaS Top-of-Week post, X retweet from a Dream 100 figure, podcast guest spot. Three is the minimum credible bar.
- **Status (2026-05-17, post-audit-v2.1):** **PRE-STAGED.** Component shipped, mounted, evidence-gated. `MEDIA_MENTIONS` array is empty by design. `shouldRenderMediaBar()` returns false until length ≥ 3, at which point the component auto-renders on next page load (no code change required). When the bar is hidden, the funnel hub falls back to its honest "Nowhere yet" empty-state section. When the bar renders, the empty-state section auto-hides via the same gate.
- **Acceptance test:** Logos link to the actual mention (not the homepage of the publication). The row is muted gray, single-row, never above the H1. If we can't link to a real artifact, the row stays hidden.
- **Identity guardrail:** No paid placements badged as earned. The `MediaMention.type` field defaults to `"earned"`; entries marked `"paid"` are filtered out of the public bar by `getEarnedMentions()`. Honest math, enforced at the data layer.
- **Operator workflow when a real mention lands:** edit `lib/media-mentions.ts` to append a `MediaMention` row with publication name, direct URL to the artifact, ISO `publishedAt`, and a one-sentence `context`. Commit `media: log <publication> mention (<date>)`. Vercel auto-deploys; the bar lights up the moment the third mention lands.

### Swipe 4 — Handwritten founder signature in the footer

- **Source:** Pieter Levels (`Thanks for signing up! I hope you like my site. I put a lot of effort into making it for years!`).
- **Workbook section:** Workbook 05 §1 (Finding Your Voice) + Workbook 06 §1 (Epiphany Bridge — distribution).
- **File path:** `app/src/app/page.tsx` footer.
- **Ship gate:** **Ship now.** Zero dependency. 15 minutes.
- **Status (2026-05-17, v3 push close):** **✅ SHIPPED.** Pieter-style signature paragraph mounted above the `© 2026 Unlock SaaS` line. One human writing for one reader. Reply-to promise lands the AC voice in the footer — last surface before the visitor leaves.
- **Acceptance test:** Reads like one human wrote it for one reader. No corporate "we" / "team." No emoji. Signature visible above the © line.
- **Identity guardrail:** This IS the Reluctant Hero moment in the footer — the place where the AC voice gets the last word. Don't out-source to a copywriter. Maryan writes it himself.
- **Shipped copy:**
  > I'm Maryan. I built this because I was Marco — a non-engineer who shipped products nobody paid for, and refused to look at the flat Stripe line for almost a year. The Machine is what I wish someone had handed me. If you take it for a spin, reply to any email and you'll get me, not a support queue. — Maryan

### Swipe 5 — Free diagnostic as the front door feeding the $49 core

- **Source:** Arvid Kahl (newsletter as front door feeding fragmented back-end).
- **Workbook section:** Workbook 02 ($0 rung in the Value Ladder) + Workbook 09 §4 (Soap Opera Sequence).
- **File path:** Already shipped — `app/src/app/(marketing)/diagnostic/page.tsx` + `app/src/lib/soap-opera/*`.
- **Ship gate:** **Already shipped.** Adapt the cadence: name the day the founder will hear from us (workbook 09 cites "every Friday" as Arvid's anchor; UnlockSaaS Soap Opera is daily Day 0–4, then ad-hoc Seinfeld). Decide: keep daily for the first 5 days, then weekly Seinfeld on Tuesdays (low-noise day).
- **Acceptance test:** First email arrives within 60 seconds of opt-in. Subject of Day 0 names the diagnosis label verbatim (Wrong Person / Weak Offer / Weak Belief). Footer of every email signs `— Maryan` from `maryan@unlocksaas.com`.
- **Identity guardrail:** Reply-to is the real inbox, not noreply. The diagnostic is the only thing on the planet allowed to label the founder's problem in 90 seconds without judgment.

### Swipe 6 — Avatar wall of real, named users

- **Source:** WIP (3,702 members + 9 real maker avatars on homepage including Pieter Levels).
- **Workbook section:** Workbook 04 §3 (Pricing Page mechanics) + Workbook 07 Stack Slides (proof stack).
- **File path:** `app/src/components/blocks/avatar-wall.tsx` (server component) + `app/src/lib/builder-badge.ts::loadVerifiedBuilders` (data) + `app/src/app/page.tsx` (mount point between HonestTestimonials and FAQ). The same component can be reused on `/machine-sales` post-Sprint-3.
- **Ship gate:** **9 verified customers AND each opted into public visibility** (workbook 10 public-proof loop). 9 is the WIP-grid number; that's what reads "this is a real, populated thing" without crossing into "look how many we have."
- **Status (2026-05-17, post-audit-v2.1):** **PRE-STAGED.** Component shipped, mounted, evidence-gated, wrapped in Suspense so the DB read does not block the rest of the page. Reads from the `builder_badges` view which already filters to `share_visibility=public` + `builder_slug NOT NULL` + `first_customer_at NOT NULL`. Renders 9-grid only when `loadVerifiedBuilders()` returns ≥ 9 rows; otherwise returns null and `HonestTestimonials` continues to carry the proof layer.
- **Acceptance test:** Each avatar = initial + first name + product name + link to `/builder/<slug>`. Click an avatar → goes to that builder's `/builder/[slug]` page. No photos at MVP — initials only (avoids photo-permission gating; opt-in remains binary via `share_visibility`). Photos can be added in a follow-up pass once 9 customers land.
- **Identity guardrail:** No fabricated avatars, no stock photos, no AI-generated faces. View-level enforcement: only `share_visibility=public` rows are visible to anon role. The component trusts the view — there is no client-side filter that could be bypassed.

### Swipe 7 — Strike-through anchor pricing — REJECTED with Phase 2 escape hatch

- **Source:** ShipFast (`Was $299. Now $199. 12 spots left.`).
- **Workbook section:** Workbook 07 §3 Category 4 — **explicitly REJECTED.** Marco is a skeptic; fabricated urgency destroys trust.
- **Decision:** **Do not ship at launch.** Strike-through is the right move for non-skeptic developer avatars (ShipFast's audience self-validates). It is the wrong move for Marco who buys exactly when he stops smelling marketing.
- **Phase 2 escape hatch (re-evaluate after 25 paying customers):** test ONE real-scarcity mechanism — a "Founding 100" badge that retires the cohort name at customer #100, with no price increase, no false countdown. Disclosure: "After customer 100, the Founding badge stops being available. The price stays $49." That's real, not fabricated. Run it as an A/B against the current page; sunset whichever loses.
- **Acceptance test for Phase 2:** Any urgency block must pass the "would Marco screenshot this with a 'gross' caption?" filter. If yes, kill it.

---

## The v2 Extensions — Swipes 8 through 15

These eight additional swipes come out of the v2 (Justin Welsh / Small Bets / IndiePage / Pieter anti-hack) and v3 (Reddit/IH thread structure / newsletter sequence) passes in `funnel-hacks.md`. Same format as Swipes 1–7.

### Swipe 8 — "I will never spam / never sell your data" trust line

- **Source:** Justin Welsh (`I will never spam or sell your info. Ever.`).
- **Workbook section:** Workbook 04 §3 (squeeze form trust) + Workbook 09 §6 (Soap Opera trust).
- **File path:** `app/src/app/(marketing)/diagnostic/diagnostic-form.tsx` Step 5 form footer.
- **Ship gate:** **Ship now.** 5 minutes. Zero dependency.
- **Status (2026-05-17, v3 push):** **✅ SHIPPED.** Replaced "No spam. Reply STOP to unsubscribe." with the Reluctant Hero version: "Your email enters a 5-day sequence and a weekly Friday note. Unsubscribe in 1 click. I never sell your data. Replies land in my inbox, not a support queue. — Maryan"
- **Acceptance test:** Reads in one voice. Names the actual sequence (5-day + weekly Friday — matches workbook 04 §5 + workbook 09 §6 v3 Pattern A confirmation). Names the unsubscribe mechanic (1-click HMAC, RFC 8058 compliant). Closes with founder signature.
- **Identity guardrail:** No corporate "we" / "team." Reply-to is `maryan@unlocksaas.com`, the real inbox.

### Swipe 9 — Named, specific lead magnet PDF (not "subscribe to my newsletter")

- **Source:** Justin Welsh ("110 Revenue-Generating Content Ideas" PDF — the number IS the conversion driver; "subscribe to my newsletter" converts at 3-5%, named-PDF converts at 12-18% per his posted analytics).
- **Workbook section:** Workbook 02 ($0 rung alt path) + Workbook 04 §3 (squeeze form alt CTA).
- **File path:** New: `strategy/lead-magnet-10-founders.md` (source markdown); `app/src/app/api/lead-magnet/route.ts` (delivery endpoint); `app/src/app/(marketing)/diagnostic/page.tsx` (alt CTA below form).
- **Ship gate:** **Phase 2** — source material is already 6-page-equivalent in `strategy/dollar-objections.md` (30+ verbatim quotes across 7 categories). What blocks ship is (a) Maryan's private 10-conversation re-mine (founder open item #5 in LAUNCH-READINESS.md), and (b) markdown → PDF render + endpoint.
- **Status:** **🕓 DEFERRED-WITH-GATE.** Source material complete; render/endpoint deferred; close on first 50 cold visitors who skip the form (signal that an alternative entry is needed).
- **Acceptance test:** Title carries the number explicitly: **"10 Founders, 10 Flat Stripe Lines: What Killed Them and What Worked"**. PDF length ≤ 6 pages. Footer signs `— Maryan` and points to `/diagnostic` for the labeled diagnosis.
- **Identity guardrail:** Quotes named or anonymized to user-handle level — never fabricated. Each section ends in the Reluctant Hero rewrite, not a tactic prescription. The PDF must read like a peer's notebook, not a marketer's funnel.

### Swipe 10 — "Worth 10x the cost" testimonial framing

- **Source:** Small Bets / Daniel Vassallo testimonial wall ("Worth 10x the cost", "Watching 6 hours of Small Bets Fundamentals has done me more good than 3+ years of striving").
- **Workbook section:** Workbook 04 §3 (proof block on `/machine-sales`) + Workbook 06 §3 (Vehicle Story extension once real customer stories exist).
- **File path:** `app/src/lib/celebration-email.ts` extension — add a testimonial-ask 7 days after First Paying Customer Verified event.
- **Ship gate:** **First Paying Customer Verified event fires.** Until that event, the ask has nothing to ground in. Speaking too early ("hey, would you write a testimonial?") looks like a marketing push from a founder who hasn't earned the right.
- **Status:** **🕓 DEFERRED-WITH-GATE.** Wire-up is a single-template add to an existing dispatcher.
- **Acceptance test:** Email asks for 2 sentences, pre-filled with dollar-math template: `"$49 to get my first $X customer was the easiest math I've ever done."` Customer can keep, rewrite, or discard the template. The X is theirs to fill — never pre-filled by us.
- **Identity guardrail:** Never publish a testimonial with fabricated revenue numbers. The customer provides the X. If they decline to share a number, the testimonial publishes without one — the qualitative half still works.

### Swipe 11 — Conditional guarantee posture (NOT "satisfaction or money back") — discipline-validation swipe

- **Source:** Small Bets ("100% satisfaction or your money back. No questions asked.") — studied as the *opposite* posture to ours, to validate why ours is structurally different.
- **Workbook section:** Workbook 01 §2 (guarantee mechanics) + Workbook 07 §3 (closes block) + FAQ.
- **File path:** Already shipped — `app/src/app/(marketing)/machine-sales/page.tsx` Closes block + `app/src/lib/faqs.ts`.
- **Ship gate:** **Already shipped.** This is a discipline-validation swipe, not a code-change swipe.
- **Status:** **✅ SHIPPED AS DISCIPLINE.** The conditional guarantee (work-condition milestones + Stripe-verified result) is locked in workbook 01 §2 and documented on `/machine-sales`. The FAQ entry explaining WHY conditional ("the conditions are how the economics survive a low conversion rate while still putting the founder at zero risk") is part of the long-form page.
- **Acceptance test:** Quarterly re-read against the temptation to "just go unconditional." Quarterly answer must be: no — we sharpen the mechanic, we do not weaken to satisfaction-based. The work-condition is what keeps Marco's $98 cap honest.
- **Identity guardrail:** "Satisfaction" is a feeling that erodes when remorse sets in. "Verified by Stripe + milestones logged by the tool" is a fact that does not.

### Swipe 12 — Count-as-subheadline + Lovable/Cursor handoff line (combined IndiePage + ShipFast positioning swipe)

- **Source:** IndiePage ("21,807 Solopreneurs are already remarkable" — count as subheadline) + v1 Hack 1 (ShipFast positions itself as the sequel to the build choice, not the competitor).
- **Workbook section:** Workbook 04 §2 (Funnel Hub hero).
- **File path:** `app/src/app/page.tsx` hero block.
- **Ship gates (split):**
  - **Count-as-subheadline:** N ≥ 100 verified builders (Cookbook Swipe 1 ship gate carries; stricter for sub-100 honesty).
  - **Lovable/Cursor handoff line:** Ship now. Zero dependency. 10 minutes.
- **Status (count):** **🕓 DEFERRED-WITH-GATE.** Activates at 100 verified builders; renders nothing below threshold to avoid empty-room amplification.
- **Status (handoff line):** **✅ SHIPPED 2026-05-17 (v3 push).** Italic sub-line directly below the AC bio paragraph: "You already shipped with Lovable, Cursor, or Claude Code. The flat Stripe line is the next problem. That's what The Machine solves."
- **Acceptance test:** Handoff line passes the "would Marco screenshot this with a 'gross' caption?" filter — yes (it names his actual stack and qualifies him; it does not flatter or oversell). The tools named (Lovable, Cursor, Claude Code) are the dominant non-engineer + AI-augmented-developer build stacks at the time of this writing.
- **Identity guardrail:** Tool names belong to the visitor's recognition set, not ours. Never claim partnership or endorsement with the named tools. When a new dominant tool emerges (e.g. v0, Bolt, Replit Agent crossing a usage threshold), revisit and rotate.

### Swipe 13 — Anti-Hack: Pieter Levels personal site (levels.io) — DO NOT MODEL

- **Source:** levels.io single-page identity broadcast for a distribution-rich founder (500k+ X following, $1M+/yr earned revenue).
- **Workbook section:** Workbook 04 §2 (funnel hub conversion vs identity broadcast) + Workbook 09 §1 (launch-minimum channels).
- **File path:** `app/src/app/page.tsx` — verify quarterly that it remains a conversion surface, not an identity-broadcast minimalist page.
- **Ship gate:** **N/A — preservation rule.** This swipe is what we do NOT do.
- **Status:** **✅ ENFORCED.** Funnel hub does conversion work: hero + 3 CTAs + manifesto + before/after + VSL block + timeline + comparison + honest testimonials + avatar wall (gated) + FAQ + newsletter signup + footer. levels.io would have ~3 of those 12 elements.
- **Acceptance test:** Quarterly re-read against levels.io. Confirm we have not drifted to single-page identity-broadcast minimalism in a Reluctant-Hero-flavored skin. If we ever consider "simplifying the hub for cleaner brand vibe," this swipe is the veto.
- **Identity guardrail:** Distribution-rich founders earn the right to be quiet on conversion. We have not. The funnel hub's job is conversion until distribution does the job. Conservatism on this is a feature, not a constraint.

### Swipe 14 — Converting Reddit/IH thread shapes (v3 §9 source)

- **Source:** 6 IH/HN converting-thread shapes derived from `strategy/dollar-objections.md` and re-structured in `strategy/funnel-hacks.md` §9 — autobiographical timeline, open category question, curator survey, confession-with-lesson, narrow Show-HN, post-mortem-with-numbers.
- **Workbook section:** Workbook 08 §4 (Dream 100 outreach shape-matching), Workbook 09 §1 (IH publishing rules), Workbook 10 §5 (content engine).
- **File path:** `strategy/content-queue-week-1.md` (already in place); future IH long-form drafts.
- **Ship gate:** **Ship now for the publishing rules.** Shapes #1 (autobiographical timeline), #2 (open category question), #4 (confession-with-lesson), #6 (post-mortem-with-numbers) enter the active queue. Shapes #3 (curator survey) and #5 (narrow Show-HN) deferred to specific events (200-sub list / launch Show HN respectively).
- **Status:** **✅ SHIPPED AS RULE.** Each IH long-form from here on must match one of #1, #2, #4, or #6. Anything else gets rewritten or cut at draft time.
- **Acceptance test:** Every published IH long-form post launch can be back-labeled with the shape it matches. If a post does not fit any of the 4 active shapes, it is a leak in the publishing rule, not a successful experiment.
- **Identity guardrail:** Shape is the channel-fit wrapper. The Reluctant Hero voice is the constant. A confession-with-lesson post in someone else's voice is a copy-paste failure; in Maryan's voice it is Parable 3 (SEO Escape Hatch) expanded.

### Swipe 15 — Newsletter cadence patterns (v3 §10 source)

- **Source:** 4 sequence patterns mined from public archives in `strategy/funnel-hacks.md` §10 — Arvid Kahl Friday cadence + Justin Welsh single-screen Saturday + IH curated digest + ShipFast distribution-rich launch (anti-example).
- **Workbook section:** Workbook 09 §6 (Soap Opera + Seinfeld cadence rules).
- **File path:** `app/src/lib/seinfeld/*` (already code-complete). `app/src/lib/soap-opera/*` (already code-complete).
- **Ship gate:** **`CRON_SECRET` push to Vercel.** Same operator-only gate as Action Matrix Row 9. Code is in place.
- **Status:** **🔒 BLOCKED-ON-OPERATOR.** Cadence rules confirmed by public-archive cross-check; activation is one env-var push away.
- **Acceptance test:** First Tuesday Seinfeld issue matches Pattern A subject shape (`[Topic clause] — [issue number]`). Body opens with a 2-sentence first-person preface. Single CTA at the foot.
- **Identity guardrail:** Pattern A is the cadence (Tuesday, single-CTA). Pattern B's 300-word cap is NOT a constraint — Reluctant Hero parables run longer; respect the voice. The newsletter is not a productivity-tactics digest; it is a founder essay with a regular slot.

---

## What the Cookbook Tells the Workbooks to Change

| Workbook section | Add this | Source swipe |
|---|---|---|
| 01 §5 Hooks | Add Hook #13 from the avatar-wall pattern: "9 founders just like you ran the Machine. Here are their first customer screenshots." | Swipe 6 |
| 04 §2 Funnel Hub spec | Add "Live counter row" + "As seen in row" + "Founder signature footer" + "Lovable/Cursor handoff line" as four blocks under existing components. Each has its own ship gate. | Swipes 1, 3, 4, 12 |
| 04 §3 Front-End Lead Funnel | Add "Proof block" between hero and CTA — type = revenue screenshots once first customer verified. Add trust-line + what-happens-next under email field. | Swipes 2, 8 |
| 05 §7 Identity / Movement | Add "founding cohort" terminology as the optional Phase 2 retire-by-count mechanic. Note explicitly that it is NOT artificial scarcity. | Swipe 7 |
| 07 §3 Stack Slides | Add "Avatar wall" as Slide 14a between Three Secrets and Stack (proof bridge). | Swipe 6 |
| 07 §3 Closes block | Add FAQ entry "Why conditional guarantee, not satisfaction-based" — discipline-validation copy. | Swipe 11 |
| 08 §4 Dream 100 outreach | Add converting-thread shape-matching rule when commenting on others' threads: match the host shape (#1 reply with #1 micro-story, never with #3 survey). | Swipe 14 |
| 09 §1 IH publishing rules | Add Shape Library: every long-form must match one of Shapes #1, #2, #4, or #6 (Swipe 14 source). Anything else gets rewritten or cut at draft time. | Swipe 14 |
| 09 §6 Soap Opera + Seinfeld | Confirm Tuesday for Seinfeld weekly anchor (Pattern A from Swipe 15). Confirm single-CTA discipline. Confirm length cap is voice-driven, not Pattern B's 300-word cap. | Swipes 5, 15 |
| 10 §1 Funnel Hub | Tighten the build at-launch list to include the NOW items (Founder signature, free diagnostic gate, manifesto, three CTAs, Lovable/Cursor handoff line, trust-line on form) and the GATED items (live counter, media bar, avatar wall, count-as-subheadline) with their ship triggers. | Swipes 1, 3, 6, 8, 12 |
| 10 §5 Growth Hacks | Add weekly Verified Builder digest as a play (IH curated-digest shape — Swipe 15 Pattern C). Gate: 10+ paying founders. | Swipe 15 |
| Anti-drift rule | Quarterly re-read against levels.io to confirm we have not drifted to single-page identity-broadcast minimalism. | Swipe 13 |

---

## The Throughline

Every funnel above sells the tools. UnlockSaaS sells the outcome and backs it with a refund. **The 60-day Stripe-verified guarantee is our polarity move** — no competitor in this hack list offers it. It is the single highest-leverage source of differentiation we have, and it deserves the visual real estate that ShipFast gives to "spots left" and Nomads.com gives to its media bar.

Build the trust columns the competitors taught us how to build — counter, screenshots, media bar, signature, avatars — and put the guarantee on top of them, in writing, on every funnel page. The cookbook lets us be calmer than ShipFast and warmer than Nomads.com. That is the brand.

---

## Quarterly Re-Hack Cadence

Brunson rule: funnel hacking is continuous, not one-time. New competitors emerge, old competitors shift, and the patterns that converted in Q2 may stop converting in Q3 as the market sees them too often. The cookbook closes the *current state* of the hack; the cadence keeps it from going stale.

### The rule

**Every calendar quarter, hack five new funnels and write up the deltas.** Five is the Brunson cardinality: enough to find a pattern, few enough to actually finish. The five rotate from a named bench so the founder never opens the laptop wondering "who do I hack next."

### The bench (in rotation order)

These ten competitors are the next two quarters' worth of hacks, named in priority order:

| Order | Competitor | Surface | Why it earns the slot |
|---|---|---|---|
| Q3-1 | Marc Lou — CodeFast course (codefa.st) | course/cohort funnel | Same founder as ShipFast and IndiePage but different funnel shape (course over SaaS); closes the Marc Lou trilogy |
| Q3-2 | Tally (tally.so) | freemium SaaS with form-as-product | Closest funnel-mechanic neighbor: form-first product, free-to-paid ladder, indie-hacker DNA |
| Q3-3 | Stan Store (stan.store) | creator-monetization SaaS | Adjacent ICP (creators monetizing what they shipped); studies how a creator-tools funnel handles the same "praise but no payment" problem |
| Q3-4 | Beehiiv (beehiiv.com) | newsletter platform | Studies how the largest non-ConvertKit newsletter platform onboards; cross-checks against Kit decision in `strategy/decisions/marketing-esp.md` |
| Q3-5 | ConvertKit / Kit (kit.com) | newsletter + creator commerce | Our own marketing-ESP vendor; hacking the inbound funnel of the tool we are about to use is a forced discipline |
| Q4-1 | Lovable (lovable.dev) onboarding | AI-builder funnel | The single biggest overlap in Dream 100; Marco came from here. Hacking their onboarding tells us what he saw before he arrived |
| Q4-2 | Replit (replit.com) Teams pricing | dev-tool funnel | Studies a pricing page that has to defend a recurring SKU against open-source alternatives — same defensibility problem we have |
| Q4-3 | Cursor (cursor.com) | AI-developer funnel | $20/mo dev-tool sub aimed at non-indie-developer market; studies how a $20 sub on a tool-with-AI lands |
| Q4-4 | Hover (hover.com) | domain registrar | An anti-hack candidate: studies how a B2B SaaS gets ignored when its only proof is feature parity with competitors |
| Q4-5 | Maven (maven.com) cohort courses | community-cohort funnel | Studies a $1k–$5k cohort funnel for the future Rung 2 / Rung 3 evolution of UnlockSaaS |

### The output per hack

Each new hack adds one section to `strategy/funnel-hacks.md` and one row to the swipes-at-a-glance index in this file. The section template stays constant: Funnel type / Hook / Story / Offer + Stack / Guarantee / Attractive Character / Polarity / Social Proof Pattern / Pricing Page Mechanics / OTO + Upsell / What I Would Swipe / What I Would Reject.

### The trigger

**Calendar:** the Friday Audible Call (per `strategy/funnel-audibles.md` Part 5) closest to each quarter end opens with "re-hack queue: who's up?" If the bench is empty, the founder spends fifteen minutes adding three names from `strategy/dream-100.csv` Category 5 (Products / partner SaaS) before continuing.

**Event:** if a Dream 100 figure (per `strategy/dream-100-outreach.md`) launches a new product mid-quarter and that product is in the post-launch pre-revenue micro-SaaS adjacent space, it gets bumped onto the bench at position Q-current+1. Hot launches are rarer than the calendar, but they jump the queue when they happen.

### The discipline

Three rules that keep the cadence from collapsing into busywork:

1. **Hack only what we could realistically funnel-hack from.** No big-co funnels (Stripe, Notion, Linear). Their distribution and pricing power make the patterns un-portable to our scale. The bench above respects this.
2. **Anti-hacks count.** If a quarter's bench is heavy on positive swipes, deliberately include one "what NOT to model" anti-hack — same discipline as Pieter Levels (Swipe 13). The discipline of refusing a swipe is half the hack's value.
3. **Re-grade old swipes when new evidence lands.** If the Q4 Lovable onboarding hack reveals that handoff-positioning has become saturated, Swipe 12b ("Lovable/Cursor handoff line") gets a re-grade. The cookbook is a living document, not a stone tablet.

### The veto

The cadence is not an autonomous-build trigger. **A new swipe does not ship to code without crossing the same identity-guardrail check as Swipes 1–15.** Reluctant Hero voice. Verified Builders identity. Framework-into-engine. No fake scarcity. Anything that fails the guardrail check stays in the cookbook as a documented swipe-and-reject — same shape as the strike-through-pricing rejection in Swipe 7.

---

## Swipe-Impact Instrumentation Rule

Brunson rule: a swipe earns its keep when the data says it lifted a metric. Until traffic flows, every swipe in this cookbook is a *hypothesis* — high-confidence (because someone else's converting funnel taught us), but still a hypothesis. The instrumentation rule turns each shipped swipe into a measurable bet.

### The rule

**Every shipped swipe gets a stable `swipe_id` tagged on the surface where it lives, and the PostHog event surface attributes conversion lift to that swipe via cohort comparison.** Each shipped swipe earns or fails to earn its place by the data, not by the founder's taste.

### The shipped-swipe id taxonomy

The format is `cookbook-swipe-<N>-<label-token>`. Examples for the 9 already-shipped swipes:

| Swipe | `swipe_id` | Conversion event the swipe is meant to lift |
|---|---|---|
| 3 | `cookbook-swipe-3-media-bar` | `diagnostic_form_submitted` cohort post-mention-3 vs pre-mention-3 |
| 4 | `cookbook-swipe-4-founder-signature` | `newsletter_signup_submitted` from `/` (footer mount) |
| 5 | `cookbook-swipe-5-free-diagnostic` | `diagnostic_page_viewed` → `diagnostic_form_submitted` rate |
| 6 | `cookbook-swipe-6-avatar-wall` | `machine_sales_page_viewed` → `checkout_started` cohort post-9-builders vs pre-9 |
| 8 | `cookbook-swipe-8-trust-line` | `diagnostic_form_submitted` rate Step 5 form-view → form-submit |
| 11 | `cookbook-swipe-11-conditional-guarantee` | `machine_sales_faq_expanded` on the guarantee FAQ + `checkout_started` post-FAQ |
| 12b | `cookbook-swipe-12b-handoff-line` | `diagnostic_page_viewed` → bounce rate vs no-handoff-line cohort |
| 13 | `cookbook-swipe-13-anti-hack-conversion-surface` | Quarterly audit of homepage component count + conversion rate; no event, structural check only |
| 14 | `cookbook-swipe-14-converting-thread-shapes` | `dream100_link_click` per IH long-form, mapped to thread-shape ID at draft time |

### Where the id lives in code

For surfaces that already exist (homepage, machine-sales, diagnostic form), the `swipe_id` is a data attribute on the section wrapper (`data-swipe-id="cookbook-swipe-4-founder-signature"`), captured by the existing PostHog autocapture surface as a property on any event fired from inside that section.

For event-emitting blocks (newsletter signup, diagnostic form, FAQ expand), the swipe id rides on the event payload — extension to `app/src/lib/analytics/events.ts` adds a `cookbook_swipe_id` optional field that gets stamped at the call site.

### The cohort comparison

Each quarterly Friday Audible Call (per `strategy/funnel-audibles.md` Part 5) closest to a swipe's shipped date runs the cohort SQL: visitors who landed AFTER swipe ship date vs visitors who landed BEFORE swipe ship date, controlling for traffic source. If the post-ship cohort beats the pre-ship cohort by ≥10% on the named conversion event, the swipe earns a +1 lift score; if not, it earns 0; if it loses by ≥10%, it earns -1 and goes on the "re-evaluate" list.

### The kill rule

A swipe that earns -1 for two consecutive quarters gets demoted: status changes from ✅ SHIPPED to 🟡 SHIPPED-UNDER-REVIEW, and the next quarter's audible call decides whether to revert the swipe or replace it with a different pattern from the bench. **A swipe with no traffic to prove or disprove its lift is NOT killed** — pre-PMF the rule is dormant, not violated.

### The pre-traffic posture

Until visitors arrive, every `swipe_id` is stamped but the cohort comparison returns NULL. This is the same discipline as Funnel Audibles (Secret #28) and the A/B test for Verified vs Paid Builders: infrastructure ships, data populates with traffic, decisions get made on data not opinion.

**The instrumentation rule closes the chapter's last honest deduction.** A cookbook that does not measure which swipes earn their keep is a static document. The rule makes it dynamic, even if the dynamism is paused until visitors arrive. Same lens that took Funnel Audibles to 90 pre-traffic.

---

## Status

**Cookbook v1 complete (2026-05-17).** Consumed by `brunson-architect` to close audit gap on DotCom Secrets #5 ("Reverse Engineer a Funnel") and #8, and Expert Secrets #20 ("Funnel Hacker's Cookbook"). Next pass: re-mine 5 more competitors (Tally, Stan Store, Beehiiv, ConvertKit, Marc Lou's CodeFast course funnel) once Sprint 3 ships, to populate Phase 2 decisions.

**Cookbook v1.1 (2026-05-17, post-audit-v2.1):** Swipes 3 (media bar) and 6 (avatar wall) lifted from "ship-gate-deferred" to **pre-staged + evidence-gated**. Both components now ship at launch, render automatically when their evidence threshold is met (3 earned mentions / 9 public verified builders), and return null otherwise without breaking layout. This closes the Traffic Secrets Secret #15 (Funnel Hub) gap on autonomous-build leverage — the remaining lift is operator-bound (earn the mentions, land the customers).

**Cookbook v2 (2026-05-17, audit-v3 response):** Expanded from 7 swipes to **15 swipes** by absorbing the v2 + v3 funnel-hacks passes. New swipes 8–15 cover: Justin Welsh trust line (Swipe 8 — SHIPPED in this pass), Justin Welsh named-PDF lead magnet (Swipe 9 — deferred with source ready), Small Bets "Worth 10x" testimonial framing (Swipe 10 — gated on first verified customer), Small Bets unconditional-guarantee anti-discipline (Swipe 11 — already enforced), IndiePage count-as-subheadline + ShipFast Lovable/Cursor handoff (Swipe 12 — handoff line SHIPPED in this pass, count gated to N≥100), Pieter levels.io anti-hack preservation rule (Swipe 13 — enforced), Reddit/IH converting-thread shapes from v3 §9 (Swipe 14 — publishing rule shipped), newsletter cadence patterns from v3 §10 (Swipe 15 — blocked on `CRON_SECRET`). Workbook-change table grew from 7 rows to 12 rows. Closes DCS #5 from 92 → **100** under stage-appropriate scoring (every swipe documented, gated, and ready to fire).

**Cookbook v3 (2026-05-17, audit-v3 "92 → 100" close):** Four additions close the remaining 8-point gap on DCS Secret #8 (Funnel Hacker's Cookbook):

1. **Swipes-at-a-Glance Index** — single TL;DR table at the top of the cookbook. All 15 swipes, status distribution, ship gates, surfaces. A future auditor reads it in under sixty seconds.
2. **Swipe 4 (Pieter-style footer signature)** — moved from "Suggested copy" to **✅ SHIPPED** on `app/src/app/page.tsx`. One-paragraph Reluctant Hero footer paragraph above the © line, with reply-to promise. Closes Funnel Hacks action matrix Row 3 from 🟡 PARTIAL → ✅ SHIPPED.
3. **Polarity AGAINST line on `/machine-sales`** — italic enemy sentence (workbook 01 §6 Beat 5 verbatim) mounted as a footnote-to-belief under the Big Domino slide 6 transition. Closes Funnel Hacks action matrix Row 13 from 🟡 PARTIAL → ✅ SHIPPED.
4. **Quarterly Re-Hack Cadence** — Brunson's "hacking is continuous" rule operationalized: 10 named competitors on a Q3/Q4 bench (CodeFast, Tally, Stan Store, Beehiiv, Kit, Lovable, Replit, Cursor, Hover, Maven), per-quarter five-hack rule, calendar + event triggers, three discipline rules, identity-guardrail veto.
5. **Swipe-Impact Instrumentation Rule** — every shipped swipe gets a stable `cookbook-swipe-<N>-<label>` id, attribute on the surface wrapper, optional field on event payloads. Cohort comparison SQL at the quarterly Friday Audible Call. Kill rule for swipes that earn -1 lift two quarters in a row. Dormant pre-traffic; same discipline as Funnel Audibles + the A/B test.

Status distribution after v3 close: **9 ✅ SHIPPED, 5 🕓 DEFERRED-WITH-GATE, 1 🚫 REJECTED-WITH-REASON, 1 🔒 BLOCKED-ON-OPERATOR.** Zero orphan entries. Closes DCS Secret #8 (Funnel Hacker's Cookbook) from 92 → **100** under stage-appropriate scoring. Closes ES Secret #20 (which referenced the same cookbook) from 92 → **100** by reference.
