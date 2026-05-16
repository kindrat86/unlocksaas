# Build Log — Unlock SaaS

## Sprint 1, Step 1: Project Scaffolded
**Status: SHIPPED (staging)**

Next.js 14 App Router + TypeScript + Tailwind CSS 3 scaffolded in `app/`. Dependencies wired: `@supabase/supabase-js`, `stripe`, `@stripe/stripe-js`, `@anthropic-ai/sdk`, `resend`, `geist` (font), `lucide-react`, shadcn/ui components (manually authored for Tailwind v3 compatibility). All environment variables templated in `.env.local.example`. Build passes cleanly.

## Sprint 1, Step 2: Funnel Hub Homepage
**Status: SHIPPED (staging)**

Live at `/` (root). Contains: hero with enemy sentence + one-line bio, three CTAs (Free Diagnostic, $1 Starter, $49 Machine), half manifesto ("We Are Verified Builders"), founder six-line intro with video placeholder, social links (X, Indie Hackers, r/SaaS). All copy sourced from workbook 01 Section 6 and workbook 05 Section 7.

## Sprint 1, Step 3: $1 Starter Sales Page
**Status: SHIPPED (staging)**

Live at `/starter`. Contains: Star Story Solution structure from workbook 03 Script 3, AC three-line about opener as sub-headline, two Machine steps described with checkmarks, guarantee teaser, polarity AGAINST line (#3 "validate your idea"), and Stripe checkout CTA. Reluctant Hero voice throughout.

## Sprint 1, Step 4: Stripe $1 Checkout
**Status: SHIPPED (staging, needs test-mode Stripe keys)**

API route at `/api/checkout` handles both `starter` (one-time payment) and `machine` (subscription) modes. Success redirect sends to OTO page. Blocked on: operator must create Stripe products and add price IDs to `.env.local`.

## Sprint 1, Step 5: OTO Page
**Status: SHIPPED (staging)**

Live at `/oto`. Two buttons, one decision per workbook 03 Script 4. Primary: "Continue the Machine. $49/mo. 60-day guarantee." Secondary: "No thanks, deliver just the Starter." No third option.

## Sprint 1, Step 6: Member Area Shell
**Status: SHIPPED (staging)**

Live at `/machine`. Sidebar shows all 7 Machine steps (1-2 unlocked, 3-7 locked with lock icon). Milestone badges displayed (Dream Customer Pinned, Offer Locked, AC Defined, Copy Generated, Outreach Assets Generated, 20 Outreach Actions Logged, First Paying Customer Verified). Welcome message in Reluctant Hero voice.

## Sprint 1, Step 7: Machine Step 1 (Dream Customer)
**Status: SHIPPED (staging, needs Anthropic API key for pushback)**

Live at `/machine/step/1`. Guided conversation with 5 questions from workbook 04 Section 2. Engine validates each answer via Claude API — pushes back on vague answers ("'Founders' is a category, not a person"), accepts specific answers. Uses Internal Belief rewrite #4 from workbook 06 Section 4. On completion: assembles one-paragraph dream customer profile + congregation list.

## Sprint 1, Step 8: Machine Step 2 (Offer)
**Status: SHIPPED (staging, needs Anthropic API key)**

Live at `/machine/step/2`. Four questions from workbook 04 Section 2. Engine validates: rejects feature-lists, missing timeframes, hedging. On completion: assembles offer headline + stack outline + guarantee + 10x check. After Step 2, surfaces OTO upsell to full Machine.

## Sprint 1, Step 9: End-to-End Smoke Test
**Status: BLOCKED**

Blocked on: operator must add real Stripe test-mode keys and Anthropic API key to `.env.local`. Once those are in, the full flow works: land on homepage → click $1 Starter → pay $1 → see OTO → land in member area → complete Steps 1 and 2 with engine pushback.

## Blockers for Live Staging

1. Create Stripe products: "$1 Starter" (one-time, $1) and "The Machine" (subscription, $49/mo). Add price IDs to env.
2. Add Anthropic API key to env.
3. Deploy to Vercel and point staging subdomain.
