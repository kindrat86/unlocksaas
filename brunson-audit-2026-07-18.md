# Brunson Secrets Trilogy — Full Audit Scorecard

**Site:** unlocksaas.com  
**Repo:** ~/unlocksaas/app (Next.js 16, Vercel team: sales-3429s-projects)  
**Audit date:** 2026-07-18  
**Auditor:** Russell Brunson (via Hermes Agent — SCORE ONLY)  
**Previous composite:** 68.2 → **Verified: 68/100**  

---

## Composite Score: 68 / 100

| Book | Weight | Score | Weighted |
|---|---|---|---|
| DotCom Secrets (The Funnels) | 40% | 77 | 30.8 |
| Expert Secrets (The Movement) | 30% | 79 | 23.7 |
| Traffic Secrets (The Traffic) | 30% | 46 | 13.8 |
| **TOTAL** | | | **68.3 ≈ 68** |

**Interpretation:** All three books implemented. Product + funnel + story working. Traffic infrastructure designed but not deployed (pre-launch). The funnel and story are strong; the traffic engine is the binding constraint. This is expected for a pre-launch product — Brunson's framework says Traffic Secrets thinking applies when you have no customers yet.

---

## DOTCOM SECRETS — 77/100 (40% weight)

### Ch 1: Value Ladder — 8/10

**Evidence:** Six-rung ladder prominently displayed on homepage under "DotCom Secrets Chapter 4 — The Value Ladder" header:
- **Free Diagnosis** ($0, "Know why the line is flat in 90 seconds")
- **14-Day Sprint** ($0, "Fourteen days, fourteen actions, one per day")
- **Starter** ($1, "Pin one real customer and write one real offer")
- **Core Playbook** ($49/mo, "The full seven-step engine. The guarantee.")
- **Lifetime Builders** ($297, "The whole stack, forever, one payment")
- **Done-With-You Sprint** ($997+, "Thirty days working the system with Maryan")

Each rung has price, transformation, and comparison value. Ladder requires scrolling — not instantly visible above fold. Clear ascension path with gates.

### Ch 2: The Secret Formula (Who/Where/Bait/Result) — 8/10

**Evidence:**
- **WHO:** "Davi" — dedicated `/who` page with background, current reality ("shipped with AI tools, flat Stripe line"), internal state ("quietly ashamed"), dream outcome ("one Stripe charge from a stranger"), 5 desires, 5 fears, awareness ladder. Extremely specific — not a segment.
- **WHERE:** Community Atlas (`/community-atlas`) — 18 communities across 7 platforms with entry strategies and difficulty tiers. Dream 100 (`/dream-100`) — 33 targets across 8 categories (Indie Hackers, No-Code/AI Builders, SaaS Founders, Marketing Educators, Communities, Podcasts, Newsletters, YouTube). Category breakdown chart. Honest engagement status: 0/33.
- **BAIT:** Free diagnostic (`/diagnostic`) — URL paste + email → labeled diagnosis (Wrong Person/Weak Offer/Weak Belief) + 5-day Soap Opera Sequence. 14-Day Sprint (`/challenge`) — free email capture. Newsletter signup at page bottom ("5 emails over 5 days").
- **RESULT:** "One verified Stripe charge in your dashboard from a real customer." Measurable, specific, transformation-oriented.

### Ch 3: Category Creation — 8/10

**Evidence:** "The world's first code-enforced 60-day first-customer guarantee." Category: software that refunds by Stripe webhook, not support ticket. The polarity move is explicit: "No course on this planet refunds you when their system fails to produce a customer. We do." One-sentence repeatable: "A playbook that refunds by code if you don't get a paying customer in 60 days."

### Ch 4-5: Funnel Types — 7/10

**Evidence:** Multiple funnel types in play:
- **Application Funnel:** Diagnostic (`/diagnostic`) — URL paste + email gate
- **Lead Squeeze:** Newsletter signup on homepage + ExitIntentPopup
- **Challenge Funnel:** 14-Day Sprint (`/challenge`) — 14 daily emails
- **Cart Funnel:** Pricing pages (`/starter`, `/playbook-sales`) with direct purchase
- **VSL elements:** Founder video (3:35) on homepage + playbook-sales

The primary path is clear (Homepage → Diagnostic → Soap Opera → Starter → Playbook), but multiple entry points could confuse a cold visitor. The homepage has 4+ CTAs ("Get free diagnosis," "14-Day Sprint," "Start for $1," "Start Playbook $49/mo").

### Ch 6: Email Capture — 7/10

**Evidence (codebase cross-checked):**
- `newsletter-signup.tsx` — Present on homepage at newsletter tail section. POST to `/api/soap-opera/subscribe`. Honey-pot spam protection. Attribution via `source` parameter.
- `exit-intent-popup.tsx` — Desktop (mouseleave) + mobile (scroll-up burst past 50%). Suppressed on /diagnostic and /auth. Once-per-session guard. Primary CTA to /diagnostic, secondary newsletter.
- `/challenge` page — Name + email + product URL capture.
- `/diagnostic` page — Email capture gated behind URL paste.
- **Gap:** Footer has "Explore Our Network" cross-portfolio bar with CTA but no inline email form. Most content pages (glossary, benchmarks, teardowns, tools) have NO email capture. The Footer — the ONE component on every page — has no opt-in. This is the coverage trap (Bug 10b from the audit playbook).

### Ch 7: Communication Funnel (Soap Opera + Seinfeld) — 8/10

**Evidence (codebase verified):**
- **Soap Opera Sequence** (`soap-opera/emails.ts`): 3 spine emails (Day 0, Day 2, Day 4) + 2 behavioral branches (Day 6: `branch_a` soft_sell for opened-not-clicked, `branch_b` objection_handler for clicked-no-buy). Full HTML email rendering with table-based templates, unsubscribe links, diagnosis-personalized E1 openers. FunnelFixer carry-over bridge for rebranded subscribers.
- **Seinfeld Emails:** Referenced in value stack ("weekly Tuesday Seinfeld emails. Already written."). Not observed as separate code module.
- **Dispatch:** `soap-opera/dispatch.ts` and `soap-opera/subscribe.ts` handle cron-based sending.
- **Score note:** The sequence architecture is best-in-class for pre-launch. The 3+2 branch model with diagnosis personalization is sophisticated.

### Ch 8: Two-Step Order — 7/10

**Evidence:** Primary flow is two-step: CTA → /diagnostic (free, low-friction) → Soap Opera emails → offer page. Several CTAs bypass this and go direct to Stripe checkout (/starter, /playbook-sales). The "pick a door" section at page bottom offers three direct paths. Not purely two-step everywhere, but the main funnel path respects the principle.

### Ch 12: Tripwire — 9/10

**Evidence:** The $1 Starter is a textbook Brunson tripwire:
- Ultra-low commitment ($1, one-time, not a subscription)
- Delivers real value (Steps 1-2 of the Playbook: dream customer + offer)
- Clear ascension path (upgrade door to $49/mo Playbook after completion)
- Honest FAQ: "Is the $1 a trial that auto-upgrades? No. The $1 is a one-time charge."
- Anchored against alternatives: "$1 vs. $497 course, $1 vs. $300/hr consultant"
- Tripwire connected to visible Value Ladder above it on the page

### Ch 16-17: Perfect Webinar / VSL Structure — 7/10

**Evidence:**
- Founder story video (3:35) on homepage and /playbook-sales with "Meet the founder" section
- VSL components in codebase: `vsl/vsl-player.tsx`, `vsl/video-vsl.tsx`, `lib/vsl/script.ts`
- Video transcript provided below video for accessibility
- Follows Agitate → Solution structure in the copy
- Not a full webinar funnel — no registration page, no replay sequence, no webinar-specific close

### Ch 18: The Stack — 8/10

**Evidence:** "Here's what's inside" section on homepage:
- 8 deliverables, each with individual price (e.g., "#1 The 7-step Playbook engine — $997 value")
- Strikethrough total: "If you bought these separately: $4,900+"
- Actual price: "$49/mo"
- Guarantee, bonuses, urgency all woven into the stack presentation
- Code-enforced guarantee is the primary differentiator: "Sold by no one else"

---

## EXPERT SECRETS — 79/100 (30% weight)

### Ch 1: Dream Customer — 9/10

**Evidence:** `/who` page — "Davi (our dream customer)":
- **Background:** "Spent years in a role that didn't let them build. Then AI tools opened the door."
- **Current Reality:** "They launched. They opened Stripe. They refreshed. The line stayed flat."
- **Internal State:** "Confused, then defensive, then quietly ashamed. They don't tell their partner how flat the line is."
- **Dream Outcome:** "One Stripe charge. One person who has no relationship to them."
- **Five Desires:** named, specific, emotionally grounded (not feature wishes)
- **Five Fears:** "The product is actually bad," "They're not a 'real' founder," "Selling feels slimy," "They'll waste months," "The shame of the flat line"
- **Awareness Ladder:** Unaware → Problem-Aware → Solution-Aware → Product-Aware → Most-Aware (5 stages with messaging strategy)
- **The Big Lie:** "'If you build something good, customers will come.'" — explicitly named and crushed

This is the single best Dream Customer avatar I've seen outside of Brunson's own materials. Sunday-night feeling captured.

### Ch 2: Attractive Character — 9/10

**Evidence:** Maryan — Reluctant Hero archetype:
- Real first name used throughout ("– Maryan" sign-off on every email and page)
- Origin story: "I'm a marketer and an operator. I have never written a line of production code."
- Vulnerability: "12 shipped products. Zero paid for any of them."
- Video presence (3:35 founder story)
- Polarity: "I am not a guru who succeeded first try. I am the founder who failed long enough to learn which order the work goes in."
- The Reluctant Hero framing is explicit: "I didn't want to build this. I built it because I had to."

### Ch 3: New Opportunity — 8/10

**Evidence:** Clear old-way vs new-way framing throughout:
- Old way: "Courses teach. Consultants understand. Tools assume you did the work already."
- New way: "The Playbook removes the avoidance option — outreach happens inside the software, not on your willpower."
- Category rejection: "This is not 'validate your idea' advice handed to a founder who has not shipped."
- The bottleneck thesis: "The bottleneck moved — it's no longer building, it's distribution."
- Opportunity Switch: From "build more features" to "name one person, make one promise, send one message."

### Ch 4: Epiphany Bridge (7-element rubric) — 8/10

**Evidence — scored against the full 7-element rubric:**

| Element | Score | Evidence |
|---|---|---|
| 1. The Dream/Desire | 9/10 | "What I wanted was not more users. It was one user who paid. Not validation. A Stripe charge." Specific felt need (proof, not praise). |
| 2. The Hook/Problem | 9/10 | "12 shipped products. Zero paid for any." Concrete numbers. "I would launch, open Stripe, and watch a line lie flat." |
| 3. The Low Point | 8/10 | "Halfway through call six I had to mute, get up, and walk around the room. A small cold voice said: that is you." Specific scene with action (mute, walk). Named false belief: "Technically I was working... That ritual was not work. It was a way to feel like I was not failing." Missing: car model, time of day, physical prop. |
| 4. Vision of Desired Future | 7/10 | "Picture sixty days from now. You open Stripe on a Tuesday morning... The line is not flat." Two timelines implied but not explicitly contrasted as Timeline A/B with the same temporal frame. Present on /playbook-sales and /starter. |
| 5. The Epiphany | 9/10 | "I sat with more than ten other founders... every one of them was me." Named insight: "I had been building beautiful things for no one in particular." Metaphor: "The mirror in ten founders." |
| 6. The Bridge | 8/10 | "I built a playbook that refuses to let me skip the work." Specific 48-hour+ actions: sat down to write offer, found nothing, built the engine. The "receipts" timeline (5 milestones from Summer 2025 to May 2026). |
| 7. The Elixir | 8/10 | "The Playbook" — named 7-step system. "I didn't want to build this. I built it because I had to" (reluctant hero). Framework deliverable: the diagnostic labels (Wrong Person/Weak Offer/Weak Belief). |

**Overall bridge score: 8/10** — 7/7 elements present, 4+ with emotional texture. Missing: the two-timeline contrast isn't named as Timeline A/B, and the low point could use more sensory detail.

### Ch 5: Stack Slide — 8/10

**Evidence:** Value stacking present on homepage and playbook-sales:
- Each deliverable has standalone price
- Strikethrough total: "$4,900+"
- Actual price revealed: "$49/mo"
- Guarantee banner below stack: "60-day guarantee · Stripe-verified · Cancel anytime"
- Eight items, each with description + individual value

### Ch 6: Future-Based Cause — 7/10

**Evidence:** "We Are Verified Builders" movement identity:
- Manifesto: "We stopped pretending the product was the problem."
- Identity: "We do not collect praise. We collect customers."
- "This is not a self-improvement group. This is a shipping movement."
- Slogan: "No encouragement count. No traction-porn. Only Stripe charges."
- Early-stage — community exists as identity, not yet as living group.

### Ch 7: Epiphany Bridge Script — 7/10

**Evidence:** The "Receipts" section on homepage structures the story as repeatable 5-phase timeline:
1. 2025, summer — First AI product, flat Stripe
2. 2025, autumn — Three more products, 2 paying users across all four
3. 2026, winter — Sat to write offer, found nothing
4. 2026, spring — Ten founder conversations, heard own story
5. 2026, May — Locked Brunson workbook chain, shipped funnel

Repeatable script structure. Could be more explicitly templated as "here's how to tell YOUR version."

### Ch 8: Hero's Two Journeys — 7/10

**Evidence:**
- **External journey:** 12 shipped products → deep SEO dive → 10 founder conversations → built Playbook → shipped this funnel. Clear event sequence.
- **Internal journey:** From "maybe the product is bad" → SEO avoidance → "I had been building beautiful things for no one" → "I built the playbook I wish someone had handed me." Present but less structured than external journey.

### Ch 10-11: Frameworks (Named + Teachable) — 9/10

**Evidence:** Two strong named frameworks:
1. **"The Playbook"** — 7-step engine: Pin Dream Customer → Build Offer → Attractive Character Voice → Hook + Page Copy → Outreach (in-tool) → Stripe Connect → Close Loop. Each step with engine pushback.
2. **"Wrong Person / Weak Offer / Weak Belief"** — The diagnostic's three failure modes. Named, teachable, repeated across every surface.
3. **"The Secret Formula"** — Five questions (Who/What/When/Where/Why) explicitly labeled as "DotCom Secrets Chapter 2" on homepage.

These frameworks are brand IP. Without them, this is a SaaS toolkit with features — with them, it's a movement.

### Ch 12: The Offer — 9/10

**Evidence:** Complete offer package on /playbook-sales:
- **Core product:** The Playbook — 7-step engine
- **Value stack:** 8 deliverables ($4,900+ total value → $49/mo)
- **Bonuses:** Dream 100 picker (pre-loaded), Soap Opera + Seinfeld sequences, Public builder profile page
- **Guarantee:** 60-day Stripe-verified, code-enforced — not a support ticket
- **Urgency:** Founding-rate lock (first 100 at $49, then $79), personal capacity ceiling, "every Tuesday you postpone costs you"
- **Scarcity:** Honest — no fake countdown, no "only 3 seats left"
- **Payment options:** $1 Starter → $49/mo Playbook → $297 Lifetime → $997+ DWY Sprint
- **Risk reversal:** $98 maximum out-of-pocket, refunded by webhook

### Ch 14-15: One-to-Many Selling / Closes — 7/10

**Evidence:**
- Diagnostic serves as the "webinar" equivalent — free, high-value, leads to offer
- Trial closes embedded in copy: "If the next paragraph reads like a transcript of your week, stay. If it doesn't, close the tab."
- Mini closes: "Read this before you click" section on /playbook-sales
- Missing: structured trial close sequence, explicit mini-close numbering

### Ch 16: Community / Archetype — 7/10

**Evidence:**
- "Verified Builders" identity — clear archetype (the builder who ships AND sells)
- Movement language: "We do not collect praise. We collect customers."
- "This is not a self-improvement group. This is a shipping movement."
- Pre-launch — community exists as identity, not yet populated

---

## TRAFFIC SECRETS — 46/100 (30% weight)

> **Context note:** Product is pre-launch. Traffic Secrets thinking applies when you have no customers yet. The infrastructure is designed and ready; execution hasn't started. This is the "Ferrari in the Garage" pattern: great content, zero distribution. Score reflects infrastructure readiness, penalized for zero execution.

### Ch 1-2: Dream Customer + Dream 100 — 8/10

**Evidence:**
- **Dream customer:** Davi — see Expert Secrets Ch 1. Extremely specific. 9/10 for definition.
- **Dream 100:** `/dream-100` — 33 targets across 8 categories. Each with: platform, follower count, difficulty rating (★), engagement status, "why this target" rationale. Schema: CollectionPage + ItemList JSON-LD. Honest status badge: "0/33." Category breakdown chart. 7/10 for execution readiness.
- **Community Atlas:** `/community-atlas` — 18 communities across 7 platforms. Each with: member count, promo policy, difficulty tier, "where they are" room names, entry strategy. Platform distribution chart. 8/10 for research depth.
- **Gap:** Dream 100 engagement = 0/33. All "not started." This is the honest transparency tradeoff — great for credibility, damning for the score.

### Ch 3-4: Work Your Way In / Buy Your Way In — 5/10

**Evidence:**
- **HSO Matrix** (`/hso`): 8 ready-to-deploy content units. Each unit has: hook, 5-point story arc, offer CTA, awareness stage (Unaware/Problem-Aware/Solution-Aware/Product-Aware), emotion trigger (shame/frustration/hope/curiosity), channel (X thread, Indie Hackers post, Reddit post, Email subject+preview). Emotion distribution chart. Deployment status: designed, not posted.
- **Ad Creative Library** (`/ad-library`): 10 concepts across 4 platforms (Meta, Reddit, LinkedIn, Google). Deploy sequence: 3 validation → 4 raiders → 3 scale. Each with hook, body copy, CTA, targeting parameters, persona. Honest: "Not running yet."

### Ch 5-6: Owned Traffic + Follow-Up Funnels — 6/10

**Evidence:**
- **Email capture:** Multiple capture surfaces (newsletter, exit-intent, challenge, diagnostic). Soap Opera Sequence (3+2) fully coded. Seinfeld referenced. Resend integration via dispatch module.
- **List size:** Unknown (pre-launch). Zero owned traffic today.
- **Follow-up:** Soap Opera with diagnosis personalization. Behavioral branching (opened-not-clicked vs clicked-no-buy). One-click unsubscribe.
- **Gap:** No retargeting pixels documented as live. No owned audience to retarget.

### Ch 7: Infiltrating the Dream 100 — 4/10

**Evidence:**
- `/dream-100` page is public with 33 targets + individual detail pages
- Each target has a "why this target" rationale and difficulty rating
- Community Atlas has entry strategies for each community
- Engagement tracker is honest: 0/33, "We've been building the funnel. Now we need to do the distribution work."
- Self-reinforcing design: the page being public invites the people on it
- **Gap:** Zero engagement. No "Think you belong?" CTA on the Dream 100 page.

### Ch 8-15: Platform Traffic — 4/10

**Evidence:**
- Content designed for: X/Twitter (2 threads, 3 email), Indie Hackers (2 posts), Reddit (1 post)
- Ad creative designed for: Meta (3 concepts), Reddit (3), LinkedIn (3), Google (1)
- Targeting parameters specified for each ad concept
- Campaign structure defined: Validation → Raiders → Scale
- **Gap:** Nothing live. Zero platform execution. "Not running yet."

### Ch 16-17: Affiliates / Viral Loops — 2/10

**Evidence:**
- No visible affiliate program
- No "Powered by" embeddable widget for viral distribution
- "Explore Our Network" footer bar is cross-portfolio promotion, not an affiliate system
- Referral program not mentioned

### Ch 18-20: Growth Hacking / Cold Traffic Bridges — 3/10

**Evidence:**
- Cold traffic bridge concepts exist in Ad Library: each ad points to /diagnostic as the bridge
- "Ads amplify distribution. They don't replace it." — honest framing
- No butterfly marketing mechanisms
- No viral loops or built-in sharing mechanics
- No funnel hub with live stats

---

## Top 5 Priority Actions (Highest ROI)

1. **Turn on the Dream 100 outreach.** The list is built. The entry strategies are written. The content (HSO Matrix) is ready. Pick the 5 easiest targets (Tier 2, ★★☆☆☆) and execute this week. Score impact: Traffic +15 points.

2. **Add email capture to the Footer.** The Footer is on every page. Add a one-field email input with "Get the 5-day arc" CTA. Currently the site's 200+ free resource pages have zero capture. This is the coverage trap fix. Score impact: DotCom Ch 6 +2 points.

3. **Launch the HSO content.** The 8 content units are ready. Post the 2 X threads and 1 Indie Hackers post this week. Track engagement. Score impact: Traffic +8 points.

4. **Add the "Think you belong?" CTA to /dream-100.** A single sentence + email link inviting Dream 100 members to reach out. This makes the self-reinforcing loop explicit. Score impact: Traffic Ch 7 +2 points.

5. **Ship the pricing page.** The /pricing-teardown page exists but is a content hub, not a pricing page. Create a standalone /pricing page with plan comparison and annual toggle. Score impact: DotCom Ch 4-5 +2 points.

---

## What's Working (Top Strengths)

- **The Offer:** One of the best SaaS offers I've scored. Code-enforced guarantee, value stack with individual pricing, honest scarcity, multiple payment paths. Expert Ch 12 is near-perfect.
- **The Dream Customer:** Davi on /who is the standard. Five desires, five fears, awareness ladder, internal state. This level of specificity is rare.
- **The Soap Opera Sequence:** 3 spine + 2 behavioral branches with diagnosis personalization. Architecture is sophisticated. Fully coded, just needs list to send to.
- **The Value Ladder:** Six clear rungs, each with price and transformation. The $1 Starter tripwire is textbook.
- **The Attractive Character:** Maryan as Reluctant Hero. Consistent voice across every page and email. Video presence. Vulnerability ("12 products, zero paid") builds trust.

---

## What's Missing (Binding Constraints)

- **Traffic execution:** Everything is designed, nothing is live. Dream 100 = 0/33 engaged. HSO = 0/8 posted. Ads = 0/10 running. This is the "Ferrari in the Garage" pattern.
- **Email capture coverage:** Footer has no opt-in. 200+ resource pages have no capture. Only homepage + landing pages capture.
- **Seinfeld emails:** Referenced but not observed in code. Soap Opera is 3+2; where's the weekly Tuesday Seinfeld?
- **No funnel metrics dashboard:** No public or internal dashboard showing funnel health (visitors → diagnostic starts → diagnostic completes → starter purchases → playbook subscribers → churn).
- **No social proof from paying customers:** Honest admission that testimonials are from public Indie Hackers quotes, not own customers — correct for pre-launch, but needs to be the first thing replaced post-launch.

---

## Methodology Notes

- Scored per the `full-brunson-audit.md` protocol in `brunson-architect/references/`
- Epiphany Bridge scored against the 7-element rubric (not gestalt)
- Codebase cross-checked for email capture, Soap Opera, VSL components, exit-intent
- HERMES_OPS.md loaded for portfolio context (site listed as "Non-developer founders (avatar 'Marco'), productized DotCom Secrets")
- Concurrent QA/Security audit acknowledged — this is SCORE ONLY, no code changes made
- Weighting: DotCom 40%, Expert 30%, Traffic 30%
- Composite: (77 × 0.40) + (79 × 0.30) + (46 × 0.30) = 68.3 → 68

---

## Evidence Index

| Evidence Type | Location |
|---|---|
| Homepage (full) | Live site + `/Users/sipi/.hermes/cache/web/unlocksaas.com-c140175c18.md` |
| /who (Dream Customer) | `https://unlocksaas.com/who` |
| /dream-100 (33 targets) | `https://unlocksaas.com/dream-100` |
| /community-atlas (18 communities) | `https://unlocksaas.com/community-atlas` |
| /hso (8 content units) | `https://unlocksaas.com/hso` |
| /ad-library (10 ad concepts) | `https://unlocksaas.com/ad-library` |
| /diagnostic (lead magnet) | `https://unlocksaas.com/diagnostic` |
| /challenge (14-day sprint) | `https://unlocksaas.com/challenge` |
| /starter ($1 tripwire) | `https://unlocksaas.com/starter` |
| /playbook-sales (core offer) | `https://unlocksaas.com/playbook-sales` |
| NewsletterSignup component | `src/components/newsletter-signup.tsx` |
| ExitIntentPopup component | `src/components/exit-intent-popup.tsx` |
| Soap Opera emails (3+2) | `src/lib/soap-opera/emails.ts` |
| Soap Opera dispatch | `src/lib/soap-opera/dispatch.ts` |
| VSL components | `src/components/vsl/vsl-player.tsx`, `video-vsl.tsx` |
| Guarantee tracker | `src/components/guarantee-tracker.tsx` |
| Founding cohort meter | `src/components/founding-cohort-meter.tsx` |
| OTO step (checkout) | `src/components/checkout/oto-step.tsx` |
| HERMES_OPS.md | `/Users/sipi/HERMES_OPS.md` |
| AGENTS.md | `/Users/sipi/unlocksaas/AGENTS.md` |

---

*"The business that can spend the most to acquire a customer wins. Right now you can't spend anything because you have no customers to fund the spend. That's not a fatal flaw — it's the starting line. The funnel and the story are built. The traffic engine is designed, not deployed. Ship the Dream 100 outreach this week. The score goes up 10 points the day the first target gets a DM."* — Russell Brunson
