# Funnel Hacker's Cookbook — UnlockSaaS

This is the swipe-and-deploy reference. It distills the Brunson-style funnel hacks in `strategy/funnel-hacks.md` into shipping-grade decisions, mapped to the workbook section that owns the change and the file in `app/` that gets the edit. Use it as the single-source for any "what should we copy / what should we reject" question during Sprints 3–5.

**Source funnel hacks:** ShipFast (Marc Lou), Nomads.com (Pieter Levels), The Bootstrapped Founder (Arvid Kahl), WIP (Marc Köhlbrugge). See `strategy/funnel-hacks.md` for the full per-competitor write-ups.

**Identity guardrails that override every swipe:** Reluctant Hero voice (workbook 01 §6), Verified Builders identity (workbook 05 §7), framework-into-engine design law (workbook 04 §6), no fake scarcity (workbook 07 §3 Category 4).

---

## The Seven Swipes — Cookbook Format

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
- **File path:** `app/src/app/page.tsx` footer. Two lines, signed `— Maryan`. Replace the current `© 2026 Unlock SaaS. Built by a non-engineer who shipped anyway.` with a real signature paragraph.
- **Ship gate:** **Ship now.** Zero dependency. 15 minutes.
- **Acceptance test:** Reads like one human wrote it for one reader. No corporate "we" / "team." No emoji. Signature visible above the © line.
- **Identity guardrail:** This IS the Reluctant Hero moment in the footer — the place where the AC voice gets the last word. Don't out-source to a copywriter. Maryan writes it himself.
- **Suggested copy (drop-in):**
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

## What the Cookbook Tells the Workbooks to Change

| Workbook section | Add this | Source swipe |
|---|---|---|
| 01 §5 Hooks | Add Hook #13 from the avatar-wall pattern: "9 founders just like you ran the Machine. Here are their first customer screenshots." | Swipe 6 |
| 04 §2 Funnel Hub spec | Add "Live counter row" + "As seen in row" + "Founder signature footer" as three new blocks under existing components. Mark each with ship gate. | Swipes 1, 3, 4 |
| 04 §3 Front-End Lead Funnel | Add "Proof block" between hero and CTA — type = revenue screenshots once first customer verified. | Swipe 2 |
| 05 §7 Identity / Movement | Add "founding cohort" terminology as the optional Phase 2 retire-by-count mechanic. Note explicitly that it is NOT artificial scarcity. | Swipe 7 |
| 07 §3 Stack Slides | Add "Avatar wall" as Slide 14a between Three Secrets and Stack (proof bridge). | Swipe 6 |
| 09 §4 Soap Opera | Confirm the named day for weekly Seinfeld post-sequence: Tuesday (low-noise inbox day, founder-friendly). | Swipe 5 |
| 10 §1 Funnel Hub | Tighten the build at-launch list to include the four NOW items (Founder signature, free diagnostic gate, manifesto, three CTAs) and the three GATED items (live counter, media bar, avatar wall) with their ship triggers. | Swipes 1, 3, 6 |

---

## The Throughline

Every funnel above sells the tools. UnlockSaaS sells the outcome and backs it with a refund. **The 60-day Stripe-verified guarantee is our polarity move** — no competitor in this hack list offers it. It is the single highest-leverage source of differentiation we have, and it deserves the visual real estate that ShipFast gives to "spots left" and Nomads.com gives to its media bar.

Build the trust columns the competitors taught us how to build — counter, screenshots, media bar, signature, avatars — and put the guarantee on top of them, in writing, on every funnel page. The cookbook lets us be calmer than ShipFast and warmer than Nomads.com. That is the brand.

---

## Status

**Cookbook v1 complete (2026-05-17).** Consumed by `brunson-architect` to close audit gap on DotCom Secrets #5 ("Reverse Engineer a Funnel") and #8, and Expert Secrets #20 ("Funnel Hacker's Cookbook"). Next pass: re-mine 5 more competitors (Tally, Stan Store, Beehiiv, ConvertKit, Marc Lou's CodeFast course funnel) once Sprint 3 ships, to populate Phase 2 decisions.

**Cookbook v1.1 (2026-05-17, post-audit-v2.1):** Swipes 3 (media bar) and 6 (avatar wall) lifted from "ship-gate-deferred" to **pre-staged + evidence-gated**. Both components now ship at launch, render automatically when their evidence threshold is met (3 earned mentions / 9 public verified builders), and return null otherwise without breaking layout. This closes the Traffic Secrets Secret #15 (Funnel Hub) gap on autonomous-build leverage — the remaining lift is operator-bound (earn the mentions, land the customers).
