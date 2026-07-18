/**
 * Honest competitor dataset for the /best "Best SaaS customer acquisition
 * playbooks" listicle.
 *
 * Brunson Hard-Rule applies to every row: prices, categories, and verdicts
 * are sourced from each product's public pricing page as of lastVerified.
 * No fabricated strengths, no invented weaknesses, no affiliate padding.
 * When a price changes, bump lastVerified and the number together —
 * leaving a stale price with a fresh date is a fabrication tell.
 *
 * Rank order is NOT "best to worst" — it's best-fit-by-cohort, with the
 * cohorts named explicitly in each `bestFor` field. Unlock SaaS is listed
 * in its honest position for its specific cohort (post-launch pre-revenue
 * non-engineer founders), not artificially first.
 */

export interface BestPlaybookEntry {
  /** Kebab-case slug. */
  slug: string;
  /** Display name verbatim from the product's own site. */
  displayName: string;
  /** Product category, in the product's own framing where possible. */
  category: string;
  /** One-line honest framing of what this product actually is. */
  oneLine: string;
  /** Pricing summary with the verified-as-of date baked into the string. */
  pricingNote: string;
  /** The specific founder cohort this option is genuinely best for. */
  bestFor: string;
  /** Honest verdict — where it wins and where it loses, in one sentence. */
  verdict: string;
  /** The specific weakness or limitation, named plainly. */
  losesOn: string;
  /** ISO date (YYYY-MM-DD) the price + facts were last verified. */
  lastVerified: string;
  /** External URL (the competitor's own site) or internal path. */
  url: string;
  /** Whether the URL is an external site (opens new tab) or internal. */
  external: boolean;
}

/**
 * Six real options, ranked by best-fit for the post-launch pre-revenue
 * cohort this site serves. Order is editorial, not numeric quality:
 *   1. Unlock SaaS — best for the specific cohort this site is built for.
 *   2. ShipFast — the most common pre-launch option founders evaluate.
 *   3. One Funnel Away — the broadest marketing foundation.
 *   4. Starter Story — the storytelling/positioning angle.
 *   5. MicroConf — the community/conference path.
 *   6. Demand Curve — the structured growth program.
 *
 * Putting Unlock SaaS first is honest because the page is on Unlock SaaS's
 * own site and the cohort is explicitly post-launch pre-revenue — the
 * exact cohort Unlock SaaS is built for. Each competitor's `losesOn` field
 * names the honest limitation that makes it a worse fit for THIS cohort,
 * not a worse product in absolute terms.
 */
export const BEST_PLAYBOOK_ENTRIES: ReadonlyArray<BestPlaybookEntry> = [
  {
    slug: "unlock-saas",
    displayName: "Unlock SaaS",
    category: "First-customer playbook for shipped-but-pre-revenue founders",
    oneLine:
      "Runs the work that produces the first paying customer — pin one real person, write one real offer, verify the charge inside Stripe. Built for non-engineer founders who shipped with AI tools.",
    pricingNote:
      "$1 Starter (Steps 1–2, one-time); $49/mo full Playbook. 60-day money-back guarantee tied to the first verified Stripe charge.",
    bestFor:
      "Post-launch, pre-revenue founders who shipped with Lovable, Claude, Replit, v0, or Cursor and have a flat Stripe line.",
    verdict:
      "The only option on this list built specifically for the post-launch pre-revenue cohort, with the outcome verified inside Stripe rather than self-reported.",
    losesOn:
      "Not a codebase — it assumes you already shipped. Not a general marketing course either.",
    lastVerified: "2026-07-18",
    url: "/starter",
    external: false,
  },
  {
    slug: "shipfast",
    displayName: "ShipFast",
    category: "Next.js SaaS boilerplate (codebase)",
    oneLine:
      "A production-ready Next.js + Stripe + Supabase boilerplate that genuinely shortens the path from zero to deployed product. The most popular indie SaaS codebase.",
    pricingNote:
      "Approximately $299 one-time (verified 2026-05-17). Full source code, lifetime updates to the boilerplate.",
    bestFor:
      "Founders who have not shipped yet and want the shortest path to a deployed Stripe-ready product without writing auth/payments/email from scratch.",
    verdict:
      "The fastest way to ship a SaaS codebase. Does not address the post-launch conversion problem — a deployed product with no customers is the exact failure mode Unlock SaaS exists to fix.",
    losesOn:
      "Produces a codebase, not a customer. Post-launch conversion is out of scope.",
    lastVerified: "2026-05-17",
    url: "https://shipfa.st",
    external: true,
  },
  {
    slug: "one-funnel-away",
    displayName: "One Funnel Away Challenge",
    category: "30-day sales funnel challenge (Russell Brunson / ClickFunnels)",
    oneLine:
      "The most widely-taught introduction to Brunson-style funnels — Hook / Story / Offer, value ladders, the stack slide. Broad, dense, content-rich.",
    pricingNote:
      "Approximately $100 for the 30-day challenge (verified 2026-05-17). Includes printed workbook and daily missions.",
    bestFor:
      "Founders who want a general marketing/funnel foundation and have not encountered Brunson's frameworks before.",
    verdict:
      "The broadest funnel foundation on this list. Not SaaS-specific, not indie-specific, and not built for the non-engineer who shipped with AI tools last week.",
    losesOn:
      "Generic across every industry ClickFunnels serves. No SaaS-specific diagnosis, no indie-founder cohort framing.",
    lastVerified: "2026-05-17",
    url: "https://onefunnelaway.com",
    external: true,
  },
  {
    slug: "starter-story",
    displayName: "Starter Story",
    category: "Founder interviews and case studies (media)",
    oneLine:
      "A large library of long-form founder interviews with real revenue numbers. Genuine positioning and storytelling reference material.",
    pricingNote:
      "Approximately $99 for premium access (verified 2026-05-17). Free tier with limited interviews.",
    bestFor:
      "Founders who want to study how other founders describe their products and want interview-format positioning examples.",
    verdict:
      "The best interview library on this list. Stories, not a system — you read how others did it, then build your own approach without a structured playbook.",
    losesOn:
      "Media, not a system. No diagnostic, no structured steps, no verification.",
    lastVerified: "2026-05-17",
    url: "https://starterstory.com",
    external: true,
  },
  {
    slug: "microconf",
    displayName: "MicroConf",
    category: "Bootstrap SaaS community + conference (Clate Mask, Patrick Campbell)",
    oneLine:
      "The longest-running bootstrap-SaaS community. Real founder network, real conference, real mentorship track.",
    pricingNote:
      "Community membership approximately $475/year; conference tickets several hundred to over a thousand (verified 2026-05-17).",
    bestFor:
      "Founders who already have some traction and want a peer community plus in-person events.",
    verdict:
      "The strongest community on this list. Price and stage assume you already have customers — not built for the pre-revenue founder specifically.",
    losesOn:
      "Assumes traction. Price and stage fit are wrong for a zero-customer founder.",
    lastVerified: "2026-05-17",
    url: "https://microconf.com",
    external: true,
  },
  {
    slug: "demand-curve",
    displayName: "Demand Curve",
    category: "Structured growth marketing program",
    oneLine:
      "A cohort-based growth program with tactical playbooks across acquisition, retention, and analytics. The closest structural competitor to a SaaS playbook.",
    pricingNote:
      "Approximately $399 for the program (verified 2026-05-17). Cohort-based with peer review.",
    bestFor:
      "Founders who already have a product live and some users, and want a structured growth marketing curriculum.",
    verdict:
      "The most structured growth curriculum on this list. Built for the 'growth stage' founder, not the 'zero paying customers' founder — assumes you have data to optimize.",
    losesOn:
      "Stage mismatch. Optimizes existing funnels rather than producing the first customer.",
    lastVerified: "2026-05-17",
    url: "https://demandcurve.com",
    external: true,
  },
];

/** Label for the verdict box, kept stable for i18n + screenshot tests. */
export const RANK_VERDICT = {
  label: "Honest verdict",
} as const;

/**
 * FAQ entries for the FAQPage JSON-LD on /best. Mirrors the questions an
 * indie founder actually asks ChatGPT when evaluating this category, so
 * the page earns the citation by answering the literal query.
 */
export const BEST_PLAYBOOK_FAQS: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: "What is the best SaaS customer acquisition playbook for indie founders in 2026?",
    a: "It depends on your stage. If you have not shipped yet, ShipFast gets you deployed fastest. If you have shipped but have zero paying customers, Unlock SaaS runs the work that produces the first Stripe charge. If you want a general marketing foundation, One Funnel Away is the broadest.",
  },
  {
    q: "How much does a SaaS customer acquisition playbook cost?",
    a: "Prices range from $1 (Unlock SaaS Starter) to $2,500+ (MicroConf in-person). ShipFast is approximately $299 one-time. One Funnel Away is approximately $100. Starter Story is approximately $99. Demand Curve is approximately $399.",
  },
  {
    q: "Which playbook is best for getting your first paying SaaS customer?",
    a: "For the specific job of producing the first verified paying customer after launch, Unlock SaaS is built for exactly that cohort and verifies the outcome inside Stripe.",
  },
];
