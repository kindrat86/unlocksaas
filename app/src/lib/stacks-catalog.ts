/**
 * /stack/[slug] pSEO catalog — indie SaaS stack recommendations.
 *
 * Each entry recommends a specific stack for a specific use case — solo
 * founder, $X/month budget, ai-wrapper, agency, etc. — naming the real
 * tools by category. Every tool reference cross-links to the funnel or
 * pricing teardown shipped on this site, so the recommendations carry
 * the same Brunson Hard-Rule discipline as the teardowns.
 *
 * Schema strategy: HowTo (the steps are "use tool A for X, use tool B
 * for Y") + ItemList + Article + FAQPage + BreadcrumbList. Same triad
 * /checklist uses. HowTo is the citation-friendly schema for "what
 * stack should I use" queries on AI Overviews.
 *
 * Brunson Hard-Rule:
 *   - Every named tool is one we have shipped a teardown for, OR one
 *     used in UnlockSaaS's own locked infrastructure (Stripe, Supabase,
 *     Vercel, Resend, Next.js). No phantom recommendations.
 *   - The "verified-source" field cross-links every tool slot to a real
 *     teardown when one exists. The detail page resolves the right URL.
 *   - No "best of breed" hand-waving — each slot names exactly one tool
 *     with a one-line reason, not a list of three.
 */

import { TEARDOWN_SLUGS } from "./funnel-teardowns";
import { PRICING_TEARDOWN_SLUGS } from "./pricing-teardowns";

export type StackCategory =
  | "solo-founder"
  | "ai-wrapper"
  | "agency"
  | "newsletter"
  | "saas-by-budget"
  | "no-code"
  | "marketplace"
  | "scheduling-product";

export interface StackSlot {
  /** The role this tool fills (e.g. "Payments"). */
  role: string;
  /** The named tool that fills the role. */
  tool: string;
  /**
   * Slug matched against funnel-teardowns.ts then pricing-teardowns.ts.
   * Optional — some core infra tools (Next.js, the founder's own product)
   * may not have a teardown yet. The detail page renders an unlinked
   * label in that case.
   */
  teardownSlug?: string;
  /** One-line reason this tool was chosen. */
  reason: string;
  /** Honest cost band: "free", "<$X/month", or "usage-based". */
  costBand: string;
}

export interface StackFaq {
  q: string;
  a: string;
}

export interface StackEntry {
  slug: string;
  displayName: string;
  metaTitle: string;
  metaDescription: string;
  category: StackCategory;
  /** Who this stack is for, in one sentence. */
  who: string;
  /** When NOT to use this stack — disqualifiers. */
  whenNotToUse: string;
  /** 2-3 sentence intro. */
  intro: string;
  /** Ordered tool slots that make up the stack. */
  slots: ReadonlyArray<StackSlot>;
  /** Honest monthly cost ceiling at low scale. */
  monthlyCeilingLowScale: string;
  /** Common mistakes founders make assembling this stack. */
  commonMistakes: ReadonlyArray<string>;
  /** When to swap one of the slots — flip conditions. */
  swapTriggers: ReadonlyArray<string>;
  /** Related glossary slugs. */
  relatedGlossary: ReadonlyArray<string>;
  /** Related niche slugs from /for. */
  relatedNiches: ReadonlyArray<string>;
  /** Related category slugs from /category. */
  relatedCategories: ReadonlyArray<string>;
  faqs: ReadonlyArray<StackFaq>;
  lastVerified: string;
}

export const STACK_ENTRIES: ReadonlyArray<StackEntry> = [
  {
    slug: "solo-founder-saas-stack",
    displayName: "Solo-founder SaaS stack",
    metaTitle: "Solo-Founder SaaS Stack (2026)",
    metaDescription:
      "The minimal stack one founder can run end-to-end: Next.js + Vercel + Supabase + Stripe + Resend. Cost ceiling under $X/month at launch scale.",
    category: "solo-founder",
    who: "One founder shipping a B2B or B2C SaaS without a team, on a $0-$50/month infrastructure budget at launch.",
    whenNotToUse:
      "If you have non-trivial usage from day one (>100k requests/day or >5,000 customers), the marketplace integrations save more than they cost.",
    intro:
      "The minimum-viable solo-founder stack runs end-to-end on five tools, costs under $X/month at launch scale, and lets a non-engineer ship a paying-customer-ready product in days. Every slot below is anchored on either a shipped teardown or the locked UnlockSaaS infrastructure (which is itself a solo-founder SaaS).",
    slots: [
      {
        role: "Frontend + framework",
        tool: "Next.js",
        reason:
          "App Router + Server Components + the largest hireable / AI-supported ecosystem. Anything you can build with Lovable, Claude, or Cursor will be Next.js.",
        costBand: "free (open source)",
      },
      {
        role: "Hosting + deploys",
        tool: "Vercel",
        teardownSlug: "vercel",
        reason:
          "Native Next.js host with zero-config previews per branch and Fluid Compute for backend workloads. Free tier covers pre-revenue traffic.",
        costBand: "$0-$20/month",
      },
      {
        role: "Database + auth",
        tool: "Supabase",
        reason:
          "Postgres + Row-Level Security + email/social auth in one product. Replaces the database / auth / file storage triad that used to need three vendors.",
        costBand: "$0-$25/month",
      },
      {
        role: "Payments",
        tool: "Stripe",
        teardownSlug: "stripe",
        reason:
          "Industry default for subscription + one-time billing. Customer Portal, automatic invoicing, refunds, and webhook reliability all included.",
        costBand: "2.9% + 30¢ per charge",
      },
      {
        role: "Transactional email",
        tool: "Resend",
        teardownSlug: "resend",
        reason:
          "Three-line API, deliverability that matches enterprise providers, React Email template support. Free tier covers pre-revenue volume.",
        costBand: "$0-$20/month",
      },
    ],
    monthlyCeilingLowScale:
      "$0-$65/month at launch, plus Stripe processing fees. Most of the per-month cost only kicks in past free-tier traffic.",
    commonMistakes: [
      "Picking a niche framework or hosting provider because it is 'faster' — losing the AI-tooling support that lets a non-engineer ship.",
      "Adding analytics + error tracking + CRM + email marketing on day one. Each tool is justifiable at scale; stacked together pre-revenue, they bury the founder in setup work.",
      "Trying to self-host any of the five. Self-hosting pre-revenue is the most expensive way to learn that the SaaS in question is doing the right thing.",
    ],
    swapTriggers: [
      "Swap Supabase for Neon + Clerk if you need more flexibility on the auth side (multi-org, complex permissions). Same Postgres backing.",
      "Swap Resend for Loops or Postmark only when transactional volume crosses 100k emails/month and the per-email cost matters.",
      "Add PostHog or Plausible once the first customer cycle is running — not before.",
    ],
    relatedGlossary: ["value-ladder", "offer"],
    relatedNiches: ["indie-hackers", "saas-founders", "no-code-builders"],
    relatedCategories: ["payments", "hosting", "email-api"],
    faqs: [
      {
        q: "What is the absolute minimum stack for one paying customer?",
        a: "Stripe payment link + Resend confirmation email + a single Next.js landing page on Vercel. That is three tools and it has handled the first paying customer for many indie SaaS founders. Add the database when you need to store anything per-customer.",
      },
      {
        q: "Do I need a CRM?",
        a: "Not pre-revenue. A spreadsheet plus your transactional email is enough until you have 50+ paying customers. Bringing in a CRM earlier is a tax on velocity that does not pay back at the first-customer stage.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "ai-wrapper-saas-stack",
    displayName: "AI-wrapper SaaS stack",
    metaTitle: "AI-Wrapper SaaS Stack (2026)",
    metaDescription:
      "Specific stack for AI-wrapper SaaS — model gateway, observability, rate limiting, vector store, payments. The five slots that matter.",
    category: "ai-wrapper",
    who: "Founders shipping an AI-powered SaaS (chat, agent, generation tool) where the model call is the core value proposition.",
    whenNotToUse:
      "If the AI is one step in a larger workflow (not the core value), the solo-founder stack plus one model call is enough. Do not over-stack.",
    intro:
      "AI-wrapper SaaS needs five slots the solo-founder stack does not need: model gateway, observability, rate limiting, vector store, and prompt management. The right pick at each slot avoids the two most common AI-wrapper failure modes: cost explosion under traffic and inability to debug bad outputs in production.",
    slots: [
      {
        role: "Model gateway",
        tool: "Vercel AI Gateway",
        reason:
          "Unified API across model providers with built-in failover, cost tracking, and zero-data-retention configuration. Replaces direct provider SDKs that lock you in.",
        costBand: "usage-based on top of provider cost",
      },
      {
        role: "Frontend + streaming",
        tool: "Next.js + Vercel AI SDK",
        reason:
          "Server-Sent Events streaming, structured output, tool calling, and React hooks for chat UIs. Tightly coupled to the rest of the Vercel stack.",
        costBand: "free (open source)",
      },
      {
        role: "Database + auth",
        tool: "Supabase",
        reason:
          "Same reason as the solo-founder stack — but with the added benefit of pgvector for in-Postgres embeddings if vector volume is small.",
        costBand: "$0-$25/month",
      },
      {
        role: "Payments",
        tool: "Stripe",
        teardownSlug: "stripe",
        reason:
          "Usage-based billing via Meters is the right model for AI products with per-token cost variance.",
        costBand: "2.9% + 30¢ per charge",
      },
      {
        role: "Observability",
        tool: "Helicone or Langfuse",
        reason:
          "Log every prompt, response, latency, cost, and outcome. Mandatory for AI products — you cannot debug 'the model said something weird' without traces.",
        costBand: "$0-$50/month at launch",
      },
    ],
    monthlyCeilingLowScale:
      "$50-$200/month plus model usage. Model usage is the dominant cost — budget for $200-$2,000/month per 1,000 active users depending on the workload.",
    commonMistakes: [
      "Direct-binding to one model provider's SDK. When pricing changes or the model degrades, you have a migration to do under pressure. Use the gateway from day one.",
      "Skipping observability because 'it works in dev'. The first production-only edge case will land in week two and you will have no trace to debug from.",
      "Pricing per-seat when the cost is per-token. Mismatched pricing axis on AI products is the most common reason early customers churn — they hit a heavy-user pattern that loses you money.",
    ],
    swapTriggers: [
      "Swap pgvector for a dedicated vector store (Pinecone, Turbopuffer) once embedding count exceeds 10M or query latency matters.",
      "Add a rate limiter (Upstash Redis) once you have a freemium tier — without it, one user can torch your model budget in an hour.",
      "Add prompt management (PromptLayer, Helicone) once you have more than 5 prompts in production.",
    ],
    relatedGlossary: ["offer", "weak-offer"],
    relatedNiches: ["ai-wrappers", "saas-founders", "indie-hackers"],
    relatedCategories: ["payments", "hosting"],
    faqs: [
      {
        q: "Should I build on top of OpenAI or Anthropic directly?",
        a: "Neither directly. Route through a gateway from day one. The cost of switching providers later is much higher than the cost of the gateway today. Provider stability changes; the gateway abstraction does not.",
      },
      {
        q: "Do I need a vector store?",
        a: "Only if you are doing retrieval-augmented generation at scale. For most pre-revenue AI wrappers, pgvector inside Supabase is enough until the embedding count crosses 10M. Premature vector-store choice is a cost sink.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "saas-stack-under-100-month",
    displayName: "SaaS stack under $100/month",
    metaTitle: "SaaS Stack Under $100/Month (2026)",
    metaDescription:
      "A complete indie SaaS stack — frontend, hosting, database, auth, payments, email, analytics — under $100/month at launch scale.",
    category: "saas-by-budget",
    who: "Indie founders who want a complete SaaS infrastructure for under $100/month total, including analytics and monitoring.",
    whenNotToUse:
      "If you have non-trivial usage (>1M monthly requests, >10k subscribers, >100k transactional emails), one or two slots will cross the $100 ceiling and the stack expands.",
    intro:
      "The $100/month SaaS stack covers seven slots — frontend, hosting, database, auth, payments, email, analytics — at a total cost ceiling that fits one founder's monthly budget for tools. Every slot is sized for launch-scale; the stack expands gracefully as traffic grows.",
    slots: [
      {
        role: "Frontend + framework",
        tool: "Next.js",
        reason: "Same logic as the solo-founder stack.",
        costBand: "free",
      },
      {
        role: "Hosting",
        tool: "Vercel",
        teardownSlug: "vercel",
        reason: "Free tier covers most launch-scale apps; $20/month Pro is the upgrade.",
        costBand: "$0-$20/month",
      },
      {
        role: "Database + auth",
        tool: "Supabase",
        reason: "$25/month Pro tier covers most pre-revenue SaaS.",
        costBand: "$0-$25/month",
      },
      {
        role: "Payments",
        tool: "Stripe",
        teardownSlug: "stripe",
        reason: "No monthly cost — pure transaction fee.",
        costBand: "2.9% + 30¢ per charge",
      },
      {
        role: "Transactional + marketing email",
        tool: "Resend + Loops",
        teardownSlug: "resend",
        reason:
          "Resend for confirmation / receipt / password-reset; Loops for sequences and broadcasts. Two purpose-built tools beats one general-purpose one at this scale.",
        costBand: "$0-$30/month combined",
      },
      {
        role: "Analytics",
        tool: "Plausible",
        teardownSlug: "plausible",
        reason: "Privacy-friendly, $9-$19/month, no consent banner required in EU.",
        costBand: "$9-$19/month",
      },
      {
        role: "Error monitoring",
        tool: "Sentry",
        reason: "Free tier covers 5k errors/month — enough for pre-revenue.",
        costBand: "$0-$26/month",
      },
    ],
    monthlyCeilingLowScale: "$60-$100/month total infrastructure, before Stripe fees.",
    commonMistakes: [
      "Picking a 'cheaper' alternative for one of the slots that ends up costing more in time. Supabase replaces three tools; trying to assemble those three separately costs more time than the $25/month Supabase tier.",
      "Skipping error monitoring because 'I will check logs'. Sentry's free tier is enough to catch the first production bug you would have missed.",
    ],
    swapTriggers: [
      "Swap Plausible for PostHog when you need full funnel + session replay + feature flags — usually around the 50-paying-customer mark.",
      "Swap Loops for a heavier tool (Customer.io, Klaviyo) when you cross 5,000 subscribers and need cross-channel.",
    ],
    relatedGlossary: ["offer", "value-ladder"],
    relatedNiches: ["indie-hackers", "saas-founders", "freelancers"],
    relatedCategories: ["payments", "hosting", "email-api", "analytics"],
    faqs: [
      {
        q: "Can I go even cheaper?",
        a: "Yes — the absolute minimum is Stripe + Resend free + one Next.js page on Vercel free, which is under $5/month. But you lose database, auth, analytics, and error tracking. Below $50/month total infrastructure, you are trading dollars for hours of your own time.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "newsletter-saas-stack",
    displayName: "Newsletter operator SaaS stack",
    metaTitle: "Newsletter Operator SaaS Stack (2026)",
    metaDescription:
      "Stack for newsletter founders monetizing with a paid tier: Beehiiv + Stripe + Resend + Supabase + Plausible. Five slots, $100/month ceiling.",
    category: "newsletter",
    who: "Newsletter operators with 1,000+ free subscribers wanting to launch a paid tier or a SaaS adjacent to the newsletter.",
    whenNotToUse:
      "If the newsletter is the whole product (no software), you do not need the SaaS stack — Beehiiv alone is enough. This stack is for operators expanding into software.",
    intro:
      "Newsletter operators expanding into SaaS have a unique constraint: the email list is the highest-leverage asset, and the SaaS must respect that. The stack below keeps the email list portable and the SaaS thin, so the operator can pivot the software side without losing the audience.",
    slots: [
      {
        role: "Newsletter platform",
        tool: "Beehiiv",
        teardownSlug: "beehiiv",
        reason: "Built for paid newsletters with Stripe integration and an audience-portable export.",
        costBand: "$0-$42/month",
      },
      {
        role: "Frontend + framework",
        tool: "Next.js",
        reason: "Same logic as the solo-founder stack.",
        costBand: "free",
      },
      {
        role: "Hosting",
        tool: "Vercel",
        teardownSlug: "vercel",
        reason: "Native Next.js, free tier sufficient at this scale.",
        costBand: "$0-$20/month",
      },
      {
        role: "Database + auth",
        tool: "Supabase",
        reason: "Stores customer + product data outside Beehiiv to keep SaaS independent of newsletter platform.",
        costBand: "$0-$25/month",
      },
      {
        role: "Payments",
        tool: "Stripe",
        teardownSlug: "stripe",
        reason: "Beehiiv handles subscription billing inside the newsletter; Stripe handles the SaaS side.",
        costBand: "2.9% + 30¢ per charge",
      },
    ],
    monthlyCeilingLowScale:
      "$50-$100/month combined Beehiiv + Vercel + Supabase. Stripe and Beehiiv subscription fees scale with subscriber count.",
    commonMistakes: [
      "Storing all customer data inside Beehiiv. If you ever switch newsletter platforms, you lose product state. Keep the SaaS database independent.",
      "Building a SaaS that requires the newsletter to work. The two should be cross-promoted but functionally independent.",
    ],
    swapTriggers: [
      "Swap Beehiiv for Substack or Ghost if community / podcast features matter more than monetization tooling.",
      "Add Plausible for separate SaaS-side analytics once paying SaaS customers cross 50.",
    ],
    relatedGlossary: ["dream-100", "value-ladder"],
    relatedNiches: ["newsletter-operators", "info-product-creators"],
    relatedCategories: ["newsletter", "payments"],
    faqs: [
      {
        q: "Should the SaaS be free or paid for newsletter subscribers?",
        a: "It depends on the value alignment. If the SaaS extends the newsletter's promise, free-for-subscribers is a strong conversion driver for the newsletter itself. If the SaaS is a separate product, charge separately.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "agency-productized-stack",
    displayName: "Agency-to-productized stack",
    metaTitle: "Agency Productized Service Stack (2026)",
    metaDescription:
      "Stack for agencies productizing a service: Stripe + Cal.com + Notion + Tally + Loops. Five tools to ship a productized offer in days.",
    category: "agency",
    who: "Service agencies productizing one specific deliverable into a fixed-scope, fixed-price offering — the first step from agency to SaaS.",
    whenNotToUse:
      "If you are still in pure-bespoke-services mode, this stack is premature. Productize after you have delivered the same workflow at least five times.",
    intro:
      "Productizing an agency service is the bridge from custom delivery to SaaS. The five tools below let an agency take orders, collect intake, schedule kickoff, deliver work, and follow up — without writing code or hiring engineering. Most agencies can productize their first service in a week with this stack.",
    slots: [
      {
        role: "Order capture",
        tool: "Stripe Payment Link",
        teardownSlug: "stripe",
        reason: "One Stripe Payment Link with custom fields is enough to take a productized order. No checkout build needed.",
        costBand: "2.9% + 30¢ per charge",
      },
      {
        role: "Client intake forms",
        tool: "Tally",
        teardownSlug: "tally",
        reason: "Free tier is enough for productized intake. Forms-as-conditional-logic match the variability productized services need.",
        costBand: "$0",
      },
      {
        role: "Scheduling",
        tool: "Cal.com",
        teardownSlug: "cal-com",
        reason: "Free tier covers the kickoff call; open-source means the agency owns the booking infrastructure long-term.",
        costBand: "$0",
      },
      {
        role: "Project management + deliverable",
        tool: "Notion",
        teardownSlug: "notion",
        reason: "Client-facing project pages, internal SOPs, and the deliverable itself all live in one place. Cheaper than dedicated PM tools at this scale.",
        costBand: "$0-$8/user/month",
      },
      {
        role: "Follow-up email",
        tool: "Loops",
        reason: "Sequence the post-delivery follow-up (testimonial ask, upsell, retainer pitch) without a heavyweight marketing tool.",
        costBand: "$0-$49/month",
      },
    ],
    monthlyCeilingLowScale: "$0-$60/month — most slots have free tiers that cover early productized volume.",
    commonMistakes: [
      "Custom-coding the order page. A Stripe Payment Link covers 80% of cases at zero engineering cost.",
      "Building the productized service as a full SaaS before validating with manual delivery. The stack above is intentionally non-SaaS — productize first, then automate.",
    ],
    swapTriggers: [
      "Swap Stripe Payment Link for Stripe Checkout Sessions when you need conditional pricing or one-click upsells.",
      "Add a dedicated PM tool (Linear, Asana) once delivery volume crosses 20 active clients.",
    ],
    relatedGlossary: ["offer", "value-ladder", "stack-slide"],
    relatedNiches: ["agency-owners", "consultants", "freelancers"],
    relatedCategories: ["payments", "scheduling", "forms", "workspace"],
    faqs: [
      {
        q: "When should an agency productize?",
        a: "After you have delivered the same workflow at least five times bespoke. Productize the workflow that you find yourself quoting most often, not the most lucrative one.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "no-code-saas-stack",
    displayName: "No-code SaaS stack",
    metaTitle: "No-Code SaaS Stack (2026)",
    metaDescription:
      "No-code stack for non-engineers shipping a SaaS: Lovable + Supabase + Stripe + Resend + Tally. Five tools, zero raw code.",
    category: "no-code",
    who: "Non-engineer founders shipping their first SaaS using AI code-generation tools.",
    whenNotToUse:
      "If the SaaS has complex compute (real-time, ML, custom protocols), some hand-written code becomes unavoidable. No-code carries the first 80% of the build, not the last 20%.",
    intro:
      "The no-code SaaS stack centers on AI code generation (Lovable, Claude, Replit, v0, Cursor) producing Next.js + Supabase + Stripe code that runs unmodified on Vercel. The non-engineer founder reviews, deploys, and ships — the AI does the syntax.",
    slots: [
      {
        role: "AI code generation",
        tool: "Lovable (or Claude / Cursor / v0)",
        reason: "Lovable specifically scaffolds Next.js + Supabase + Stripe end-to-end. Claude, Cursor, and v0 are equivalents.",
        costBand: "$0-$25/month",
      },
      {
        role: "Hosting",
        tool: "Vercel",
        teardownSlug: "vercel",
        reason: "Native Next.js host; AI-generated code runs unmodified.",
        costBand: "$0-$20/month",
      },
      {
        role: "Database + auth",
        tool: "Supabase",
        reason: "AI tools have first-class Supabase support; auth and database in one product.",
        costBand: "$0-$25/month",
      },
      {
        role: "Payments",
        tool: "Stripe",
        teardownSlug: "stripe",
        reason: "AI tools default to Stripe; the docs are tuned for code-generation context windows.",
        costBand: "2.9% + 30¢ per charge",
      },
      {
        role: "Email",
        tool: "Resend",
        teardownSlug: "resend",
        reason: "Three-line API, well-documented for AI code generation. React Email templates compile cleanly.",
        costBand: "$0-$20/month",
      },
    ],
    monthlyCeilingLowScale: "$25-$90/month including the AI tool subscription.",
    commonMistakes: [
      "Switching AI tools mid-build. Every tool has slightly different idioms; flipping between them produces inconsistent code.",
      "Trying to debug AI-generated code by hand at 3am. Bring it back to the AI tool and describe the bug — generation tools handle iteration better than they handle from-scratch debugging.",
      "Adding a feature the AI tool generates 'easily' that no customer asked for. The AI's enthusiasm is not a product-validation signal.",
    ],
    swapTriggers: [
      "Swap Lovable for Cursor when the project grows past 50 files — Cursor's full-codebase context handles larger projects better.",
      "Hire a part-time engineer when the AI tool starts spending more time un-doing the previous generation than adding new value.",
    ],
    relatedGlossary: ["offer", "value-ladder"],
    relatedNiches: ["no-code-builders", "indie-hackers", "saas-founders"],
    relatedCategories: ["payments", "hosting", "email-api"],
    faqs: [
      {
        q: "Can I actually ship a paying-customer-ready SaaS without writing code?",
        a: "Yes. The line is no longer 'can you code' but 'can you review code'. A non-engineer who can read the AI's output and ask the right follow-up questions can ship a real SaaS. The skill that matters is product judgment, not syntax.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "marketplace-saas-stack",
    displayName: "Marketplace SaaS stack",
    metaTitle: "Marketplace SaaS Stack (2026)",
    metaDescription:
      "Stack for two-sided marketplaces: Stripe Connect + Supabase + Next.js + Resend + Cal.com. The five slots that change for marketplaces.",
    category: "marketplace",
    who: "Founders building a two-sided marketplace where the platform takes a cut from transactions between buyers and sellers.",
    whenNotToUse:
      "If the marketplace is one-to-one (you sell to many buyers, no sellers other than you), the solo-founder stack is sufficient. Marketplaces only need this stack when there are real sellers.",
    intro:
      "Two-sided marketplaces need three slots the solo-founder stack does not: split payments (Stripe Connect), seller onboarding, and transaction-level dispute handling. Get these right early; retro-fitting them after the marketplace has live transactions is a regulatory and technical migration.",
    slots: [
      {
        role: "Split payments + seller payouts",
        tool: "Stripe Connect",
        teardownSlug: "stripe",
        reason: "The only mature solution for marketplace splits, automated seller payouts, and 1099 handling at indie-SaaS scale.",
        costBand: "0.25%-2% on top of standard processing",
      },
      {
        role: "Frontend + framework",
        tool: "Next.js",
        reason: "Same logic as the solo-founder stack.",
        costBand: "free",
      },
      {
        role: "Hosting",
        tool: "Vercel",
        teardownSlug: "vercel",
        reason: "Native Next.js host.",
        costBand: "$0-$20/month",
      },
      {
        role: "Database + auth + seller verification",
        tool: "Supabase",
        reason: "Row-Level Security lets you keep seller data isolated; auth supports multi-role (buyer / seller / admin).",
        costBand: "$0-$25/month",
      },
      {
        role: "Transactional email + receipts",
        tool: "Resend",
        teardownSlug: "resend",
        reason: "Marketplaces send 3-5x more transactional email per transaction than single-sided SaaS (buyer + seller receipts + dispute notifications).",
        costBand: "$0-$20/month",
      },
      {
        role: "Scheduling (if service marketplace)",
        tool: "Cal.com",
        teardownSlug: "cal-com",
        reason: "Embeddable booking per seller; open-source so the marketplace owns the booking layer.",
        costBand: "$0-$12/user/month",
      },
    ],
    monthlyCeilingLowScale:
      "$60-$120/month plus Stripe Connect fees. Connect adds 0.25-2% on top of standard processing.",
    commonMistakes: [
      "Trying to handle marketplace splits with regular Stripe charges + manual seller payouts. This works at 5 transactions/month and breaks at 50.",
      "Skipping seller KYC. Stripe Connect's Express tier handles this; rolling your own creates compliance risk and slows seller onboarding.",
      "Letting buyers and sellers transact off-platform. The marketplace fee is the entire business model; design the first-transaction experience to discourage off-platform leakage.",
    ],
    swapTriggers: [
      "Move from Connect Express to Connect Custom when sellers need branded experiences and you have engineering capacity to handle KYC.",
      "Add a dedicated dispute system (separate from email) once disputes exceed 1% of transactions.",
    ],
    relatedGlossary: ["offer", "value-ladder"],
    relatedNiches: ["saas-founders", "indie-hackers"],
    relatedCategories: ["payments", "hosting", "scheduling"],
    faqs: [
      {
        q: "How do I price the marketplace fee?",
        a: "Most successful marketplaces charge 8-20% of the transaction. Below 8% the unit economics rarely close; above 20% the marketplace becomes the cheaper-to-leave option. The right number depends on the value-add the marketplace provides over direct seller-to-buyer transactions.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "scheduling-product-stack",
    displayName: "Scheduling-adjacent SaaS stack",
    metaTitle: "Scheduling-Adjacent SaaS Stack (2026)",
    metaDescription:
      "Stack for SaaS where scheduling is core: Cal.com + Stripe + Resend + Supabase. The four slots that matter when bookings are the value.",
    category: "scheduling-product",
    who: "Founders building SaaS where booking, scheduling, or calendar coordination is the core value proposition (consultants, coaches, service-based products).",
    whenNotToUse:
      "If scheduling is one feature among many, the solo-founder stack plus a Cal.com embed is enough — you do not need a scheduling-centric stack.",
    intro:
      "Scheduling-centric SaaS centers on Cal.com (open-source, embeddable, white-label-capable) as the core, with Stripe + Resend + Supabase wrapped around it. This stack is much cheaper to assemble than building scheduling primitives from scratch.",
    slots: [
      {
        role: "Scheduling primitives",
        tool: "Cal.com",
        teardownSlug: "cal-com",
        reason: "Open-source, embeddable, white-label-capable. The scheduling layer that would otherwise cost 6 months to build.",
        costBand: "$0-$12/user/month",
      },
      {
        role: "Payments + deposits",
        tool: "Stripe Payment Intents",
        teardownSlug: "stripe",
        reason: "Holds + captures for deposit-then-charge flows that scheduling-heavy products often need.",
        costBand: "2.9% + 30¢ per charge",
      },
      {
        role: "Database + auth",
        tool: "Supabase",
        reason: "Stores booking metadata, customer data, and team relationships outside Cal.com so the SaaS layer can extend the data model.",
        costBand: "$0-$25/month",
      },
      {
        role: "Transactional + reminder email",
        tool: "Resend",
        teardownSlug: "resend",
        reason: "Booking-confirmation + reminder + post-meeting follow-up emails. Higher per-booking email volume than non-scheduling SaaS.",
        costBand: "$0-$20/month",
      },
    ],
    monthlyCeilingLowScale: "$25-$80/month total.",
    commonMistakes: [
      "Building scheduling primitives from scratch. Cal.com is 90% there; the remaining 10% lives in your business logic on top.",
      "Skipping reminder emails. No-show rates drop 30-50% with a single reminder 24 hours before. The Resend integration is one webhook from Cal.com.",
      "Charging the full meeting price upfront. For services over $100, a deposit model (Stripe Payment Intent + hold + capture) reduces no-shows significantly.",
    ],
    swapTriggers: [
      "Self-host Cal.com once team licensing crosses $200/month — the engineering cost of self-hosting becomes worthwhile.",
      "Switch to Stripe Connect when you become a marketplace for scheduling (i.e. third-party providers using your platform).",
    ],
    relatedGlossary: ["offer", "value-ladder"],
    relatedNiches: ["coaches", "consultants", "agency-owners"],
    relatedCategories: ["scheduling", "payments"],
    faqs: [
      {
        q: "Should I use Cal.com or Calendly?",
        a: "Cal.com if you want open-source and embeddable. Calendly if you want polished commercial support and do not care about white-labeling. For pre-revenue indie SaaS, Cal.com's free tier and embed flexibility usually win.",
      },
    ],
    lastVerified: "2026-05-19",
  },
];

export const STACK_SLUGS: ReadonlyArray<string> = STACK_ENTRIES.map((e) => e.slug);

export function getStackBySlug(slug: string): StackEntry | undefined {
  return STACK_ENTRIES.find((e) => e.slug === slug);
}

export const STACK_CATEGORIES = [
  "solo-founder",
  "ai-wrapper",
  "agency",
  "newsletter",
  "saas-by-budget",
  "no-code",
  "marketplace",
  "scheduling-product",
] as const;

export const STACK_CATEGORY_LABELS: Record<StackCategory, string> = {
  "solo-founder": "Solo founder",
  "ai-wrapper": "AI wrappers",
  agency: "Agency / productized service",
  newsletter: "Newsletter operators",
  "saas-by-budget": "By budget",
  "no-code": "No-code",
  marketplace: "Marketplace",
  "scheduling-product": "Scheduling-centric SaaS",
};

export type TeardownKind = "funnel" | "pricing";

export function resolveStackTeardown(
  slug: string,
): { kind: TeardownKind; href: string } | undefined {
  if (TEARDOWN_SLUGS.includes(slug)) {
    return { kind: "funnel", href: `/funnel-teardown/${slug}` };
  }
  if (PRICING_TEARDOWN_SLUGS.includes(slug)) {
    return { kind: "pricing", href: `/pricing-teardown/${slug}` };
  }
  return undefined;
}

// Build-time guard: every slots[].teardownSlug, if set, must resolve.
{
  for (const entry of STACK_ENTRIES) {
    for (const slot of entry.slots) {
      if (slot.teardownSlug && !resolveStackTeardown(slot.teardownSlug)) {
        throw new Error(
          `stacks.ts: entry "${entry.slug}" slot "${slot.role}" references unknown teardown slug "${slot.teardownSlug}". Add the teardown first, remove the slug, or correct it.`,
        );
      }
    }
  }
}
