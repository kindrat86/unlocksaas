/**
 * Shared FAQ data — single source of truth for what the user sees AND what
 * the FAQPage JSON-LD schema emits. AIO (AI Optimization) rule: structured
 * data MUST match the visible page content. Mismatches get the page demoted
 * in AI Overviews and flagged as spammy structured data in Search Console.
 *
 * Content sourced VERBATIM from the inline FAQ on app/src/app/page.tsx
 * (mined from strategy/dollar-objections.md, public Indie Hackers + Hacker
 * News threads). Brunson Hard-Rule (honest claims): no fabricated answers.
 *
 * This module is intentionally framework-free — it's plain data, importable
 * from server components, client components, and route handlers (llms.txt,
 * llms-full.txt).
 *
 * Pattern: server-hoist-static-io — data is module-scope, never re-allocated
 * per request. JSON-LD strings derived from this list are pre-serialized
 * at import time in components/seo/json-ld.tsx.
 */

export type HomepageFaq = {
  readonly q: string;
  readonly a: string;
};

/**
 * Verbatim copies of the six FAQs rendered in Block 7 of `/machine-sales`
 * (workbook 06 §4). Pulled out so FaqPageJsonLd can mirror them without
 * the answer text drifting between schema and visible HTML. Edit here and
 * in the page together.
 */
export const MACHINE_SALES_FAQS: readonly HomepageFaq[] = [
  {
    q: "I do not have time for another framework.",
    a: "The Machine is not a framework. It is a tool. The framework lives in the engine. You answer 3 to 5 questions per step. Time to first paying customer can be 60 days or less.",
  },
  {
    q: "I have tried customer interviews and they did not help.",
    a: "You tried interviews. The Machine forces conclusions FROM interviews. The bottleneck was not the asking, it was the synthesizing.",
  },
  {
    q: "Outreach is not my strength.",
    a: "It is not anyone's strength. That is why Step 5 generates the message, picks the target, and the tool tracks the send. Strength is irrelevant to a mechanical process.",
  },
  {
    q: "$49 a month is too much when I am not earning.",
    a: "$49 a month is two coffees a week to make the difference between $0 and $49+ recurring forever. If The Machine does not produce a paying customer, the $98 comes back.",
  },
  {
    q: "I cannot risk another product that does not work.",
    a: "The product already exists. You shipped it. The Machine is the work AROUND it, not another product to build.",
  },
  {
    q: "I could build this myself in a weekend.",
    a: "You could build the form. You can't build the Stripe-webhook proof, the Dream 100 picker fed from the locked workbook, the engine pushback, or the 60-day refund logic in a weekend. And while you are building the tool, you are not running the funnel — which is the exact disease the Machine treats.",
  },
] as const;

export const HOMEPAGE_FAQS: readonly HomepageFaq[] = [
  {
    q: "I already have too many subscriptions.",
    a: "Start at $1, not $49. The Starter finishes your dream customer and your offer in a week and is yours to keep regardless of whether you upgrade.",
  },
  {
    q: "$49/mo is too much pre-revenue.",
    a: "Two coffees a week, $98 capped exposure over 60 days, refunded automatically if the work was done and Stripe shows no customer. Pre-revenue is the exact case the guarantee was written for.",
  },
  {
    q: "I have been burned by gurus.",
    a: "Same. This is not a course. The deliverable is software you run yourself. The refund is enforced by code — not by a 'describe your experience' email I read at my leisure.",
  },
  {
    q: "Customers are MY problem, not the tool's job.",
    a: "Every other tool quietly agreed with you. The Machine does not. Outreach happens inside the tool, tracked. The job cannot be outsourced; it can be removed-from-your-willpower. That is the design.",
  },
  {
    q: "I could build this myself in a weekend.",
    a: "You could build the form. Not the Stripe-webhook proof, the Dream 100 picker fed from a locked workbook, the engine pushback, or the 60-day refund logic. And while you build the tool, you are not running the funnel — which is the exact disease the Machine treats.",
  },
  {
    q: "What if I do the work and still get no paying customer?",
    a: "Then the guarantee fires. The code reads your Stripe account at day 60. If you completed Steps 1–5 in-product and logged 20 outreach actions and the line is still flat, you get the two months ($98) back. In writing.",
  },
] as const;
