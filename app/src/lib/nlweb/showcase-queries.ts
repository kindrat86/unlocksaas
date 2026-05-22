/**
 * Curated showcase queries for /ask.
 *
 * Why this file exists
 * --------------------
 * The /ask page accepts any query string via `?q=`, but it also needs:
 *
 *   1. A landing-state experience (when no query is set) that shows
 *      visitors what kinds of questions the corpus actually answers
 *      well, instead of an intimidating blank box.
 *   2. A set of pre-rendered URLs the sitemap can advertise so crawlers
 *      have crawlable Q&A entry points. Pages with empty `?q=` rarely
 *      get indexed; pages with curated, real-traffic queries do.
 *   3. A way for the AI corpus to "index itself" — every showcase URL
 *      is a server-rendered Q&A page with QAPage JSON-LD that AI
 *      Overviews can cite directly.
 *
 * Each entry is a real founder-style question that the underlying
 * corpus (alternatives, teardowns, comparisons, glossary, FAQ, answers,
 * benchmarks, Playbook steps) can ground a grounded answer in.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - Every showcase query maps to corpus surfaces that genuinely
 *     contain matching content (verified manually against the catalog
 *     names below).
 *   - No invented metrics, no "how to 10x your MRR" growth-hack bait.
 *   - Voice matches the Reluctant Hero: direct, founder-to-founder,
 *     no marketing fluff.
 *
 * Sitemap exposure
 * ----------------
 * Every entry's `slug` is appended to /ask?q=<encoded> in the sitemap.
 * The `slug` field is also the user-facing breadcrumb segment in
 * the JSON-LD QAPage block, so it should be a kebab-cased rephrasing
 * of the query suitable for display.
 */

export interface ShowcaseQuery {
  /** Stable kebab-cased identifier; used as the sitemap URL fragment. */
  slug: string;
  /** The exact query string fed into the BM25 ranker. */
  query: string;
  /** One-line framing shown above the query on the landing card. */
  framing: string;
}

/**
 * Twelve curated queries spanning the major corpus surfaces. Order is
 * intentional — the first six are the highest-intent questions, the
 * second six are corpus-discovery questions.
 */
export const SHOWCASE_QUERIES: readonly ShowcaseQuery[] = [
  {
    slug: "why-is-my-stripe-line-flat",
    query: "why is my stripe line flat after launch",
    framing: "The flat Stripe line after launch",
  },
  {
    slug: "how-to-name-my-dream-customer",
    query: "how do I name one real dream customer",
    framing: "Pinning one real person",
  },
  {
    slug: "write-an-offer-page-from-scratch",
    query: "write an offer page from scratch for an indie SaaS",
    framing: "The Blank Offer Page",
  },
  {
    slug: "wrong-person-vs-weak-offer-vs-weak-belief",
    query: "wrong person vs weak offer vs weak belief diagnosis",
    framing: "Which of the three is broken",
  },
  {
    slug: "stripe-payment-link-vs-checkout",
    query: "stripe payment link vs checkout session for a $1 starter",
    framing: "Which Stripe surface for a Starter funnel",
  },
  {
    slug: "lovable-vs-cursor-vs-v0",
    query: "lovable vs cursor vs v0 for non-engineer founders",
    framing: "Which AI builder for a non-engineer founder",
  },
  {
    slug: "what-is-a-hook-story-offer",
    query: "what is hook story offer in Brunson",
    framing: "Hook, Story, Offer explained",
  },
  {
    slug: "what-is-attractive-character",
    query: "what is an attractive character",
    framing: "The Attractive Character",
  },
  {
    slug: "soap-opera-sequence-vs-seinfeld",
    query: "soap opera sequence vs seinfeld emails",
    framing: "Which email cadence for a post-launch list",
  },
  {
    slug: "what-counts-as-product-launched",
    query: "what counts as product launched for the diagnostic",
    framing: "When the diagnostic applies",
  },
  {
    slug: "first-paying-customer-checklist",
    query: "first paying customer checklist post launch",
    framing: "From shipped to first verified Stripe charge",
  },
  {
    slug: "indie-saas-pricing-anchors",
    query: "indie SaaS pricing anchors and decoy tiers",
    framing: "Pricing structure for post-launch SaaS",
  },
] as const;

/** Lookup by slug for the /ask page; returns undefined for unknown slugs. */
export function findShowcaseBySlug(slug: string): ShowcaseQuery | undefined {
  return SHOWCASE_QUERIES.find((q) => q.slug === slug);
}

/** Lookup by query for round-trip "is this a showcase URL?" rendering. */
export function findShowcaseByQuery(query: string): ShowcaseQuery | undefined {
  const normalised = query.trim().toLowerCase();
  return SHOWCASE_QUERIES.find((q) => q.query.toLowerCase() === normalised);
}
