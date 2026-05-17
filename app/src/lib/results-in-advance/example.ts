/**
 * Canonical anonymized example of one complete Results-in-Advance run.
 *
 * Mirrors strategy/results-in-advance-example.md verbatim — that file is the
 * canonical source; this is the typed export for server-side rendering on
 * /starter and /diagnostic/result.
 *
 * Brunson DotCom Secrets Secret #12, Beat 5: "The result is visible BEFORE
 * the buyer pays." Showing what the finished thing actually looks like
 * passes the skeptic's "would I be embarrassed to show this to a friend
 * who reviews my work" gate. Describing it does not.
 *
 * The avatar is deliberately Priya (parallel ICP), not Marco (the founder).
 * Per strategy/results-in-advance.md beat 5: a Marco example reads as the
 * founder talking to himself; a parallel-ICP example reads as proof of
 * breadth.
 *
 * Voice: Reluctant Hero (workbook 01 §6). Signed in the email by Maryan
 * (see app/src/lib/deliverable-email.ts). The example here is the engine's
 * assembled output, NOT a marketing rewrite.
 */

export const RIA_EXAMPLE_SOURCE_PATH =
  "strategy/results-in-advance-example.md" as const;

export interface RiaExampleStep {
  /** Display label in the UI tab. */
  label: string;
  /** Subhead under the tab, one sentence Reluctant Hero voice. */
  subhead: string;
  /** The engine's assembled deliverable text, markdown-shaped plaintext. */
  body: string;
  /** One-line note showing what engine pushback produced this output. */
  pushback_note: string;
}

export interface RiaExample {
  /** Avatar name used in the example (NOT the founder; parallel ICP). */
  avatar_name: string;
  /** One-line context for the example. */
  avatar_context: string;
  /** Step 1 — Dream Customer. */
  step1: RiaExampleStep;
  /** Step 2 — Offer. */
  step2: RiaExampleStep;
}

export const RIA_EXAMPLE: RiaExample = {
  avatar_name: "Priya",
  avatar_context:
    "B2B SaaS indie hacker shipping analytics for Shopify stores. Built with Lovable. Post-launch, flat revenue line.",
  step1: {
    label: "Step 1 — Dream Customer",
    subhead: "One real person, named and specific. The output Priya kept after run #1.",
    body: `**Name:** Elena Ramos.
**Where:** Buenos Aires.
**What she runs:** A Shopify store called *Casa Lunar*, selling handmade ceramics to North America. Two years live, ~$11k/mo revenue, one employee (her sister, part-time).

**The flat line:** She's been doing $11k/mo for nine months. She tried two things that didn't move it: a "summer sale" promo that pulled revenue forward instead of growing it, and a Klaviyo flow she copied from a Reddit thread that doubled her unsubscribe rate.

**What she actually says when I ask:** "I don't know if it's the ads, the emails, the price, or the audience. Every consultant tells me a different bottleneck. I've stopped trying anything because I can't afford to be wrong twice in a row."

**What she secretly wants:** To stop second-guessing every dollar. One dashboard that shows her, in one sentence, which lever to pull next.

**What she's already tried:** Triple Whale (too expensive, churned), Lifetimely (good but lives inside Shopify analytics, which she's already lost trust in), a free Klaviyo audit (the consultant disappeared after the discovery call).

**What she will NEVER pay for:** "another tool with a dashboard." She's burned on dashboards. She wants conclusions, not data.

**Where she congregates:** r/ShopifyEntrepreneurs, the Shopify Mastermind Telegram group (~400 members), the @repeatcustomer newsletter, and two in-person meetups in BA for Latin-American ecommerce founders.`,
    pushback_note:
      "Priya's first answer was \"my customer is a Shopify store owner.\" The engine refused twice before this output. \"Shopify store owner\" is a category, not a person.",
  },
  step2: {
    label: "Step 2 — Offer",
    subhead: "One result, one timeframe, one remedy. The skeptic-defensible offer that walks out at $1.",
    body: `**The ONE result, guaranteed.**

Elena learns, in 14 days, exactly which one of her four levers (ads, emails, price, audience) is responsible for her flat $11k line — and gets a Friday-call answer she can act on Monday. If she doesn't have a single-lever answer she's confident enough to act on by day 14, she doesn't pay.

**The stack:**

| Item | Value |
|---|---|
| Core: The Lever Diagnostic (14-day, one operator-led answer) | $890 |
| Bonus 1: 30-min recorded Friday call walking through the answer in plain language | $190 |
| Bonus 2: A two-page "what to do Monday" playbook tailored to the lever | $140 |
| Bonus 3: One follow-up Loom video 30 days later, checking the bet | $90 |
| **Total value** | **$1,310** |
| **Your price** | **$129 one-time** |

**Value-to-price:** 10.2×.

**Guarantee:** 14 days. Work condition: Elena ships her Shopify revenue history, her Klaviyo flow, her Facebook ads dashboard, and one 45-minute call. If she does the work and Priya cannot hand her one lever answer she is confident enough to test, she gets the $129 back.

**Why this is 10x:** A Shopify consultant charging by the hour would bill 8–12 hours for the same diagnostic, at $90–$150/hr, which is $720–$1,800. A SaaS tool that "shows you everything" is what Elena has rejected. The offer's value is the *one-sentence answer*, not the hours spent producing it.`,
    pushback_note:
      "Priya's first offer was \"I'll help Elena grow her store.\" The engine refused once. \"Help her grow\" is a feeling, not a result.",
  },
};
