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
  product: `${BASE_URL}/#product-machine`,
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
 * strategy folder. These are NOT keyword stuffing — each one corresponds
 * to either a workbook section, a strategy document, or a shipped surface.
 *
 * Used by both Organization.knowsAbout and Person.knowsAbout. Google and
 * LLM retrieval pipelines use these as topical anchors for "which entity
 * is the authority on X" queries.
 *
 * Editorial rule: only add a topic if the founder could survive a
 * 10-minute interview on it without consulting notes. The list is short
 * on purpose — Schema.org doesn't reward breadth, it rewards specificity.
 */
export const KNOWS_ABOUT: readonly string[] = Object.freeze([
  "Russell Brunson sales funnel design",
  "Value ladder construction for SaaS products",
  "Soap Opera Sequence email marketing",
  "Seinfeld daily email marketing",
  "Reluctant Hero attractive character archetype",
  "Post-launch pre-revenue SaaS founder activation",
  "First paying customer acquisition for indie SaaS",
  "Stripe-verified founder validation",
  "Non-engineer founder workflows with AI tools",
  "Lovable, v0, Bolt and Claude Code product workflows",
  "Dream 100 outreach strategy",
  "Money-back guarantee mechanics for digital products",
]);

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
  // Logo asset shipped at app/icon.svg (file-based metadata, stable URL).
  // SVG is accepted by Google for Organization.logo since 2023 and by all
  // major AI Overview / Knowledge Graph pipelines. Apple home-screen 180×180
  // PNG is generated separately at app/apple-icon.tsx via next/og.
  logo: `${BASE_URL}/icon.svg`,
  email: "maryan@unlocksaas.com",
  slogan: "Your first paying customer in 60 days, or you do not pay.",
  foundingDate: "2026-05-17",
  description:
    "A machine that turns your already-shipped product into a verified paying customer. If it does not, you do not pay.",
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
    "Solo founder of Unlock SaaS. Marketer by trade, not engineer; builds the product with Claude Code. Built the machine he uses for his own launch.",
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
