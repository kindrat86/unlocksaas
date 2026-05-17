/**
 * Canonical entity definition for UnlockSaaS.
 *
 * Single source of truth consumed by:
 *   - src/components/seo/json-ld.tsx  (Organization + Person + WebSite schemas)
 *   - src/app/llms.txt/route.ts       (AI-crawler entity anchor)
 *   - src/app/layout.tsx              (creator / publisher metadata)
 *
 * Why this file exists
 * --------------------
 * The first audit pass scored Entity / Topical Authority at 22/100 with the
 * deduction reasoning: "Organization.sameAs is empty; no off-platform
 * anchors." The fix is NOT to fabricate social handles — Brunson Hard-Rule
 * (honest claims) forbids it. The fix is to:
 *
 *   1. Honestly declare every entity signal we *can* verify without lying
 *      (founder, email, founding date, topical expertise, slogan, audience).
 *   2. Provide one operator-flippable env-driven slot per real social
 *      handle, so the day Maryan creates the account, the schema starts
 *      claiming it without a code edit + redeploy + audit cycle.
 *   3. Wire @id cross-references across Org/Person/WebSite/Product so
 *      Google's Knowledge Graph and AI-Overview pipelines can resolve the
 *      entity as a connected node, not five disconnected blocks.
 *
 * The `sameAs` array currently resolves to whatever env vars are set. In a
 * fresh checkout it is empty. That is honest and correct. The moment the
 * operator drops e.g. NEXT_PUBLIC_UNLOCKSAAS_X_URL into Vercel, the
 * Organization JSON-LD starts claiming it and the LLMO surface lights up.
 *
 * No fabricated handles. No placeholder URLs. No "if used" speculative
 * entries. If the env var isn't set, the entry isn't claimed.
 */

// ---------------------------------------------------------------------------
// Canonical URLs and @id anchors
// ---------------------------------------------------------------------------

/** Production origin. Mirrors src/app/layout.tsx metadataBase. */
export const BASE_URL = "https://unlocksaas.com";

/**
 * Fragment-style @id anchors. Schema.org's documented pattern for linking
 * entities inside a single document and across pages. Google's JSON-LD
 * structured-data tester resolves these as Knowledge Graph candidate keys.
 */
export const ID = {
  organization: `${BASE_URL}/#organization`,
  person: `${BASE_URL}/#founder`,
  website: `${BASE_URL}/#website`,
  product: `${BASE_URL}/#product-playbook`,
  diagnosticService: `${BASE_URL}/#service-diagnostic`,
  diagnosticHowTo: `${BASE_URL}/#howto-diagnostic`,
} as const;

// ---------------------------------------------------------------------------
// Off-platform anchors (env-driven, empty until operator activates)
// ---------------------------------------------------------------------------

/**
 * Reads a candidate social-anchor URL from env. Returns undefined if the
 * env var is unset, empty, or doesn't look like an absolute URL. Bad URLs
 * are silently dropped — we never want to ship a malformed sameAs entry
 * because it tanks Knowledge Graph eligibility for the whole block.
 *
 * URL validation is intentionally strict: must start with https:// and pass
 * URL constructor. http:// is rejected because every legitimate social
 * profile is on https, and a downgraded URL would look like a fabrication.
 */
function readSocialEnv(key: string): string | undefined {
  const raw = process.env[key];
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  if (!trimmed.startsWith("https://")) return undefined;
  try {
    // Throws on malformed URLs.
    new URL(trimmed);
    return trimmed;
  } catch {
    return undefined;
  }
}

/**
 * Build the sameAs array from env at module load. Each entry corresponds
 * to a single real, operator-controlled profile. Add a new social network
 * here only when (a) the operator has created the account, and (b) the
 * profile bio names UnlockSaaS — Knowledge Graph rewards bidirectional
 * claims (this site claims the handle; the handle claims this site).
 *
 * Env naming convention: NEXT_PUBLIC_* so the values are available to the
 * server-rendered Organization block without leaking secrets. None of
 * these URLs are sensitive.
 */
function buildSameAs(): readonly string[] {
  const candidates = [
    // Founder/owner profiles — primary entity anchors.
    readSocialEnv("NEXT_PUBLIC_UNLOCKSAAS_X_URL"),
    readSocialEnv("NEXT_PUBLIC_UNLOCKSAAS_LINKEDIN_URL"),
    readSocialEnv("NEXT_PUBLIC_UNLOCKSAAS_GITHUB_URL"),
    readSocialEnv("NEXT_PUBLIC_UNLOCKSAAS_INDIE_HACKERS_URL"),
    readSocialEnv("NEXT_PUBLIC_UNLOCKSAAS_PRODUCT_HUNT_URL"),
    readSocialEnv("NEXT_PUBLIC_UNLOCKSAAS_CRUNCHBASE_URL"),
    readSocialEnv("NEXT_PUBLIC_UNLOCKSAAS_YOUTUBE_URL"),
    // Generic "other" slot — for one ad-hoc profile (e.g. a Wikidata entry
    // post-listing) without a dedicated env var.
    readSocialEnv("NEXT_PUBLIC_UNLOCKSAAS_OTHER_URL"),
  ].filter((v): v is string => typeof v === "string");

  // De-dupe defensively in case the operator pastes the same URL twice.
  return Array.from(new Set(candidates));
}

/**
 * Frozen at module load. Importers see a stable array per server boot.
 * Vercel's per-request env mutation is not a concern here — these are
 * build-time configuration, not per-request data.
 */
export const ORGANIZATION_SAME_AS: readonly string[] = Object.freeze(
  buildSameAs(),
);

// ---------------------------------------------------------------------------
// Topical authority — knowsAbout
// ---------------------------------------------------------------------------

/**
 * Every entry is a real area of demonstrated expertise documented in the
 * strategy folder. These are NOT keyword stuffing – each one corresponds
 * to either a workbook section, a strategy document, or a shipped surface.
 *
 * Used by both Organization.knowsAbout and Person.knowsAbout. Google and
 * LLM retrieval pipelines use these as topical anchors for "which entity
 * is the authority on X" queries.
 *
 * Editorial rule: only add a topic if the founder could survive a
 * 10-minute interview on it without consulting notes. Each entry maps to
 * either a Brunson workbook section, a shipped pSEO surface (funnel
 * teardowns, pricing teardowns, compare, alternatives), or a strategy
 * document under strategy/. The list grew from 12 to 28 on 2026-05-17
 * to lift the AIO/LLMO entity-density score (training-corpus visibility
 * compounds with specificity of declared expertise).
 */
export const KNOWS_ABOUT: readonly string[] = Object.freeze([
  // Brunson framework (DotCom / Expert / Traffic Secrets) – verifiable
  // against the 10 locked workbooks in strategy/.
  "Russell Brunson sales funnel design",
  "Hook Story Offer framework",
  "Value ladder construction for SaaS products",
  "Big Domino positioning statement",
  "Perfect Webinar framework",
  "Stack slide and one-time offers",
  "Soap Opera Sequence email marketing",
  "Seinfeld daily email marketing",
  "Reluctant Hero attractive character archetype",
  "Dream 100 outreach strategy",
  // Indie SaaS go-to-market – matches /alternatives-to, /compare,
  // /funnel-teardown, /pricing-teardown pSEO surfaces.
  "Post-launch pre-revenue SaaS founder activation",
  "First paying customer acquisition for indie SaaS",
  "Indie SaaS pricing page design",
  "SaaS landing page conversion teardowns",
  "Head-to-head SaaS tool comparisons for indie founders",
  "Programmatic SEO for indie SaaS",
  // Mechanics specific to the Playbook product surface.
  "Stripe-verified founder validation",
  "Money-back guarantee mechanics for digital products",
  "Refund-by-code guarantee enforcement",
  // Non-engineer founder workflows – matches the dream-customer named
  // in workbook 08 and the AI-tools list reflected in MENTIONED_ENTITIES.
  "Non-engineer founder workflows with AI tools",
  "Lovable AI app builder workflows",
  "Claude Code product development for non-engineers",
  "v0 by Vercel UI generation for founders",
  "Bolt.new full-stack prototyping",
  "Cursor IDE workflows for non-engineers",
  "Replit AI agent workflows",
  // Trust columns / editorial.
  "Honest competitor comparison editorial standards",
  "Brunson Hard-Rule fabrication-free marketing claims",
]);

// ---------------------------------------------------------------------------
// Brand-name variants – alternateName for tokenizer breadth
// ---------------------------------------------------------------------------

/**
 * Every public spelling the brand is referred to as. LLM tokenizers
 * learn each variant as a distinct surface form; declaring them in
 * Organization.alternateName tells Google's Knowledge Graph (and any
 * retrieval pipeline that walks JSON-LD) that all four resolve to one
 * entity. Without this, "UnlockSaaS" queries and "Unlock SaaS" queries
 * can split into two weak entity clusters instead of compounding into
 * one strong one.
 *
 * Brunson Hard-Rule: every variant below is a real spelling used in
 * the codebase / strategy folder / marketing copy. No fabricated
 * alternate brands.
 */
export const ALTERNATE_NAMES: readonly string[] = Object.freeze([
  "UnlockSaaS",
  "Unlock-SaaS",
  "unlocksaas.com",
]);

// ---------------------------------------------------------------------------
// Off-entity mentions – schema.org `mentions` for entity-graph density
// ---------------------------------------------------------------------------

/**
 * Real third-party entities the public marketing surface names. Every
 * `name` and `url` below corresponds to an entity discussed in at least
 * one shipped page – the funnel teardowns, the pricing teardowns, the
 * comparisons, or the alternatives surface. Declaring them as
 * Organization.mentions[] is honest (we DO talk about these entities)
 * and lifts AIO/LLMO by anchoring UnlockSaaS in the entity neighbourhood
 * of well-known products and authors.
 *
 * Brunson Hard-Rule: each entry is verifiable inside the codebase. A
 * fresh search for the `name` will find at least one shipped surface
 * that names the entity. No name belongs here that the site does not
 * actually discuss in body copy.
 */
export const MENTIONED_ENTITIES: ReadonlyArray<{
  name: string;
  url: string;
  type: "Person" | "Organization" | "Book" | "SoftwareApplication";
}> = Object.freeze([
  // The single most-cited author across the strategy/ folder.
  {
    name: "Russell Brunson",
    url: "https://www.russellbrunson.com",
    type: "Person",
  },
  // Brunson trilogy – named verbatim in /about, /stories, /funnel-teardown.
  { name: "DotCom Secrets", url: "https://www.dotcomsecretsbook.com", type: "Book" },
  { name: "Expert Secrets", url: "https://www.expertsecretsbook.com", type: "Book" },
  { name: "Traffic Secrets", url: "https://www.trafficsecretsbook.com", type: "Book" },
  // ClickFunnels is the canonical reference funnel-builder we explicitly
  // contrast with – "no ClickFunnels 1.0 look" appears in feedback memory.
  {
    name: "ClickFunnels",
    url: "https://www.clickfunnels.com",
    type: "Organization",
  },
  // AI tools the dream customer ships with – named in /about, /faq,
  // /playbook-sales, llms.txt, and every pSEO body.
  { name: "Lovable", url: "https://lovable.dev", type: "SoftwareApplication" },
  { name: "Claude", url: "https://claude.ai", type: "SoftwareApplication" },
  { name: "Replit", url: "https://replit.com", type: "SoftwareApplication" },
  { name: "v0 by Vercel", url: "https://v0.app", type: "SoftwareApplication" },
  { name: "Cursor", url: "https://cursor.com", type: "SoftwareApplication" },
  { name: "Bolt.new", url: "https://bolt.new", type: "SoftwareApplication" },
  { name: "Bubble", url: "https://bubble.io", type: "SoftwareApplication" },
  // Infrastructure named in the guarantee mechanics + transactional surface.
  { name: "Stripe", url: "https://stripe.com", type: "Organization" },
]);

// ---------------------------------------------------------------------------
// Defined terms – the Brunson glossary the site teaches
// ---------------------------------------------------------------------------

/**
 * Terms the site teaches. Every entry corresponds to a section
 * heading or recurring concept across the public surface. Rendered
 * as schema.org `DefinedTermSet` from the funnel hub – it declares
 * UnlockSaaS as a topical authority on this specific glossary.
 *
 * LLM training corpora that ingest DefinedTermSet treat the publisher
 * as a primary citation source for the term. Pre-revenue, this is one
 * of the few entity-graph anchors a brand-new site CAN claim honestly:
 * "we teach this term, here is our definition, in our own words".
 *
 * Brunson Hard-Rule: every definition below is in the founder's own
 * words and appears in at least one shipped surface (the funnel
 * teardowns and /faq are the primary anchors).
 */
export const DEFINED_TERMS: ReadonlyArray<{
  term: string;
  definition: string;
}> = Object.freeze([
  {
    term: "Hook",
    definition:
      "The promise plus polarity move a page makes in the first three seconds, before the visitor decides whether to keep reading.",
  },
  {
    term: "Story",
    definition:
      "The belief stack between the hook and the close – the sequence of small recognitions that turns curiosity into trust.",
  },
  {
    term: "Offer",
    definition:
      "What the page asks for and what it gives in return, structured so the perceived value is unambiguously higher than the price.",
  },
  {
    term: "Big Domino",
    definition:
      "The single claim the page must prove – the one belief that, if accepted, makes every smaller objection irrelevant.",
  },
  {
    term: "Value Ladder",
    definition:
      "An ordered sequence of offers a customer can move through, each delivering more value than the last at a price proportional to the delivery.",
  },
  {
    term: "Stack Slide",
    definition:
      "The offer reveal pattern that itemizes the deliverables, anchors each to a standalone price, and then presents the total as a discount to that anchor.",
  },
  {
    term: "Perfect Webinar",
    definition:
      "Russell Brunson's framework for selling a high-ticket offer to a cold audience in a single one-to-many presentation, structured around the Big Domino plus three secrets.",
  },
  {
    term: "Soap Opera Sequence",
    definition:
      "The five-email indoctrination sequence a new subscriber gets across their first week, structured around a backstory cliffhanger that resolves into the offer.",
  },
  {
    term: "Seinfeld Email",
    definition:
      "Russell Brunson's daily email pattern – a slice-of-life story in the founder's voice that pivots into the offer in the last few lines.",
  },
  {
    term: "Reluctant Hero",
    definition:
      "An attractive-character archetype: the founder who solved their own problem first and is reluctantly publishing the playbook because the audience keeps asking for it.",
  },
  {
    term: "Dream 100",
    definition:
      "The named list of the hundred specific humans, publications, communities, or platforms where the dream customer already congregates – the entry point for every outbound channel.",
  },
  {
    term: "Wrong Person",
    definition:
      "One of three diagnostic labels: the offer on the page is fine but the page is aimed at no one in particular. The most common diagnosis on a post-launch flat Stripe line.",
  },
  {
    term: "Weak Offer",
    definition:
      "One of three diagnostic labels: the person on the page is fine but the page promises a feature list instead of a result.",
  },
  {
    term: "Weak Belief",
    definition:
      "One of three diagnostic labels: the person and the offer are fine but the page does not make the reader believe it will work for them.",
  },
  {
    term: "Verified Builder",
    definition:
      "A founder whose first paying customer was confirmed via the connected Stripe account – not self-reported. The Verified Builders directory grows only when Stripe confirms the cycle.",
  },
  {
    term: "Brunson Hard-Rule",
    definition:
      "Editorial standard adopted by Unlock SaaS: every public claim is independently verifiable, dated where it changes, and unfabricated. No aggregateRating, no testimonial counts, no sameAs entries until the underlying fact exists.",
  },
]);

// ---------------------------------------------------------------------------
// Publishing principles – E-E-A-T anchor
// ---------------------------------------------------------------------------

/**
 * URL of the page that documents the editorial standards UnlockSaaS
 * publishes by. Lives on /about under the "Editorial position" section.
 * Schema.org's `publishingPrinciples` field is one of the strongest
 * machine-readable E-E-A-T signals Google honours since 2023.
 */
export const PUBLISHING_PRINCIPLES_URL: string = `${BASE_URL}/about`;

// ---------------------------------------------------------------------------
// Organization entity
// ---------------------------------------------------------------------------

/**
 * Public-facing organization facts. Every field is independently verifiable
 * by a reader visiting the site, the Stripe checkout, the Resend-sent
 * email, or the public DNS record.
 *
 * `foundingDate` is the strategy-lock date documented in strategy/state.json
 * (2026-05-17). That is the operationally meaningful birth of the entity:
 * the day the 10 Brunson workbooks were locked and build started.
 */
export const ORGANIZATION = {
  name: "Unlock SaaS",
  legalName: "Unlock SaaS",
  url: BASE_URL,
  logo: `${BASE_URL}/icon`, // Next.js dynamic icon at app/icon.tsx serves PNG at /icon
  email: "maryan@unlocksaas.com",
  slogan: "Your first paying customer in 60 days, or you do not pay.",
  foundingDate: "2026-05-17",
  description:
    "A playbook that turns your already-shipped product into a verified paying customer. If it does not, you do not pay.",
  // Schema.org expects ISO 3166 region codes or named places. SaaS sold
  // worldwide; "Worldwide" is the accepted convention for digital-only.
  areaServed: "Worldwide",
} as const;

// ---------------------------------------------------------------------------
// Founder (Person) entity
// ---------------------------------------------------------------------------

/**
 * Founder-level Person schema. Linked back to ORGANIZATION via worksFor /
 * founder cross-reference (the @id pattern lives in the consumer in
 * json-ld.tsx — this module just carries the facts).
 *
 * `description` matches the on-page bio at /diagnostic so LLMs see the
 * same prose in structured data and in body copy. Repetition across
 * surfaces strengthens entity confidence in retrieval-augmented answers.
 */
export const FOUNDER = {
  name: "Maryan",
  givenName: "Maryan",
  jobTitle: "Founder",
  email: "maryan@unlocksaas.com",
  url: BASE_URL,
  description:
    "Solo founder of Unlock SaaS. Marketer by trade, not engineer; builds the product with Claude Code. Built the playbook he uses for his own launch.",
} as const;

// ---------------------------------------------------------------------------
// Audience entity (re-used in Service + Organization)
// ---------------------------------------------------------------------------

/**
 * The dream customer named in workbook 08 §3 (locked in
 * strategy/state.json). Used as the Audience target for the diagnostic
 * Service and as the audience signal on the Organization. Specificity
 * matters: "non-engineer founders using AI tools" is the exact phrase
 * LLMs need to match the entity to the query class.
 */
export const PRIMARY_AUDIENCE_TYPE =
  "Post-launch pre-revenue non-engineer founders using AI tools";
