import { NextResponse } from "next/server";
import {
  ALTERNATE_NAMES,
  BASE_URL,
  DEFINED_TERMS,
  FOUNDER,
  KNOWS_ABOUT,
  MENTIONED_ENTITIES,
  ORGANIZATION,
  ORGANIZATION_SAME_AS,
  PRIMARY_AUDIENCE_TYPE,
} from "@/lib/seo/entity";
import { glossaryTermSlug } from "@/lib/glossary";
import {
  ACTIVATION_LOG,
  LAST_VERIFIED_DATE,
  NEXT_REVIEW_DATE,
  REVIEW_CADENCE_DAYS,
  STRATEGY_LOCK_DATE,
} from "@/lib/seo/freshness";
import { getEarnedMentions } from "@/lib/media-mentions";
import { ALTERNATIVE_SLUGS } from "@/lib/alternatives";
import { TEARDOWN_SLUGS } from "@/lib/funnel-teardowns";
import { PRICING_TEARDOWN_SLUGS } from "@/lib/pricing-teardowns";
import { COMPARISON_SLUGS } from "@/lib/comparisons";
import { CATEGORY_SLUGS } from "@/lib/categories";
import {
  DATASET_BUNDLE,
  DATASET_CITATION,
  DATASET_CSV_COLUMNS,
  DATASET_KEYWORDS,
  DATASET_LICENSE_SPDX,
  DATASET_LICENSE_URL,
  DATASET_NAME,
  DATASET_PER_TABLE_CSV,
  DATASET_PER_TABLE_SLUGS,
  DATASET_SLUG,
  DATASET_URLS,
  DATASET_VERSION,
  perTableCsvUrl,
} from "@/lib/seo/dataset";

/**
 * /llms-feed.json – machine-typed JSON sibling of /llms.txt.
 *
 * Surface B (AEO/GEO) extension landing 2026-05-18 in response to the
 * GEO audit deduction: "some retrievers prefer JSON over markdown; the
 * markdown-only surface forces them to parse prose for structured facts
 * that could be addressable by JSON path."
 *
 * The contract
 * ------------
 * Same facts as /llms.txt. Versioned schema (currently v1). All dates,
 * surfaces, mentions, and activation-log entries are read from the same
 * source modules the markdown surface uses, so the JSON feed and the
 * markdown index cannot drift on freshness or content. If a fact does
 * not exist in entity.ts, freshness.ts, media-mentions.ts, or the five
 * pSEO catalog modules, it does not appear here either.
 *
 * Why we publish our own format instead of an existing one
 * --------------------------------------------------------
 * JSON Feed (jsonfeed.org) is the closest IETF-ish convention, but it
 * is shaped for "list of dated content items" – blog posts, podcast
 * episodes. /llms.txt is an entity description with surfaces, key
 * facts, and an activation log; squeezing those into JSON Feed's
 * `items` array would force every consumer to walk extension fields,
 * which is worse than a clean custom shape. The schema is permissive
 * by design: every field is optional and additive. A retriever that
 * only understands `meta` + `entity` + `surfaces` still gets a
 * complete entity card.
 *
 * Brunson Hard-Rule reconciliation: every field below is also present,
 * verifiable, in the public HTML or one of the strategy documents.
 * No fabricated counts, no aspirational facts, no testimonial figures
 * before they exist. `mediaMentions` ships empty until a real earned
 * mention publishes (Reluctant-Hero rule). `entity.sameAs` ships
 * whatever the operator has activated via env vars (empty until
 * NEXT_PUBLIC_UNLOCKSAAS_*_URL slots are set).
 *
 * Caching
 * -------
 * Same edge-cache discipline as /llms.txt: 1h browser, 24h edge, 7d
 * stale-while-revalidate. The content changes at the strategy-doc
 * cadence (quarterly), not the request cadence.
 *
 * Discovery
 * ---------
 *   - Linked from /llms.txt under "## JSON sibling".
 *   - Listed in /sitemap.xml at priority 0.3 (matching /llms.txt).
 *   - Allow-listed for every AI user agent in /robots.txt by virtue of
 *     being under "/" with no Disallow rule.
 *
 * Schema version contract
 * -----------------------
 * `version: 1` will stay stable. Additive changes (new optional fields)
 * do not bump the version. Breaking changes (renaming, type changes,
 * field removals) increment the integer and publish a migration note
 * here. Consumers should branch on the version integer, not the URL.
 */

// Frozen catalog counts. Hoisted to module scope so they serialize once
// at build time instead of per-render.
const PSEO_COUNTS = Object.freeze({
  alternativesTo: ALTERNATIVE_SLUGS.length,
  funnelTeardown: TEARDOWN_SLUGS.length,
  pricingTeardown: PRICING_TEARDOWN_SLUGS.length,
  compare: COMPARISON_SLUGS.length,
  category: CATEGORY_SLUGS.length,
});

const PSEO_TOTAL =
  PSEO_COUNTS.alternativesTo +
  PSEO_COUNTS.funnelTeardown +
  PSEO_COUNTS.pricingTeardown +
  PSEO_COUNTS.compare +
  PSEO_COUNTS.category;

/**
 * Core public marketing surfaces. Mirrors the "## Core surfaces" block
 * of /llms.txt. Order = ranking by retrieval priority for an LLM
 * answering an indie-SaaS founder query.
 */
const CORE_SURFACES = Object.freeze([
  {
    path: "/",
    title: "Funnel hub",
    description:
      "The premise, the founder bio, and the three primary calls to action: free diagnostic, $1 Starter, $49/month Playbook.",
    markdownMirror: "/index.md",
  },
  {
    path: "/diagnostic",
    title: "Free Launch Diagnostic",
    description:
      "Paste a live product URL. In about ninety seconds, the system labels what is broken with one of three diagnoses: Wrong Person, Weak Offer, or Weak Belief.",
    markdownMirror: "/diagnostic.md",
  },
  {
    path: "/stories",
    title: "Five Stories for the Flat Stripe Line",
    description:
      "Long-form, free-to-read essays on the work non-engineer founders skip. No email gate.",
    markdownMirror: "/stories.md",
  },
  {
    path: "/starter",
    title: "$1 Starter funnel",
    description:
      "Entry rung. A real Stripe charge proves intent and unlocks Playbook Steps 1 and 2.",
    markdownMirror: "/starter.md",
  },
  {
    path: "/playbook-sales",
    title: "The Playbook ($49/month)",
    description:
      "The full seven-step system. 60-day money-back guarantee tied to the first verified Stripe payment.",
    markdownMirror: "/playbook-sales.md",
  },
  {
    path: "/builders",
    title: "Verified Builders",
    description:
      "Founders whose first paying customer was verified inside Stripe, not self-reported. Directory grows only when Stripe confirms the cycle.",
    markdownMirror: null,
  },
  {
    path: "/repeatable",
    title: "Repeatable Revenue (Rung 2 spec)",
    description:
      "Published specification for the next product. Build is gated on three Core customer cycles completing.",
    markdownMirror: null,
  },
]);

/**
 * Trust and E-E-A-T surfaces. Mirrors the "## Trust and E-E-A-T
 * surfaces" block of /llms.txt.
 */
const TRUST_SURFACES = Object.freeze([
  {
    path: "/about",
    title: "About",
    description:
      "Founder bio, topical expertise, editorial position, disclosures.",
    markdownMirror: "/about.md",
  },
  {
    path: "/press",
    title: "Press / Media Kit",
    description:
      "Brand facts, founder bio, descriptions in three lengths, topical-expertise list, brand-asset URLs, editorial policy, press contact.",
    markdownMirror: "/press.md",
  },
  {
    path: "/editorial-policy",
    title: "Editorial Policy",
    description:
      "Editorial standards, financial disclosures, and the running corrections log. The quality-rater anchor page for accountability.",
    markdownMirror: "/editorial-policy.md",
  },
  {
    path: "/faq",
    title: "FAQ",
    description:
      "Eight verbatim objections from real Indie Hackers / Hacker News threads and the answers a founder would receive over email.",
    markdownMirror: "/faq.md",
  },
  {
    // Drift-close 2026-05-19: /glossary shipped in #32 and is referenced
    // in llms.txt under the Trust block, but the JSON sibling did not
    // mirror it. Brunson Hard-Rule: the markdown and JSON indexes are
    // the same surface in different formats; one cannot omit what the
    // other advertises.
    path: "/glossary",
    title: "Glossary",
    description:
      "Working definitions of the 16 Brunson sales-funnel terms Unlock SaaS teaches (Hook, Story, Offer, Big Domino, Value Ladder, Stack Slide, Perfect Webinar, Soap Opera Sequence, Seinfeld Email, Reluctant Hero, Dream 100, Wrong Person, Weak Offer, Weak Belief, Verified Builder, Brunson Hard-Rule). Each term has a stable in-page anchor (/glossary#<term-slug>) matching the DefinedTermSet JSON-LD per-term @id.",
    markdownMirror: "/glossary.md",
  },
  {
    path: "/contact",
    title: "Contact",
    description: "Direct line to the founder.",
    markdownMirror: null,
  },
  {
    path: "/privacy",
    title: "Privacy",
    description: "Standard legal surface.",
    markdownMirror: null,
  },
  {
    path: "/terms",
    title: "Terms",
    description: "Standard legal surface.",
    markdownMirror: null,
  },
]);

/**
 * pSEO catalog descriptors. Each entry carries the hub URL, the
 * per-slug pattern, the markdown-mirror pattern, the live slug list,
 * and the count. The slug arrays are imported live so the feed
 * auto-extends on every deploy that adds a catalog entry.
 */
const PSEO_CATALOGS = Object.freeze({
  alternativesTo: {
    hub: "/alternatives-to",
    slugPattern: "/alternatives-to/{slug}",
    markdownPattern: "/alternatives-to/{slug}/md",
    description:
      "Honest named-competitor comparisons. Every entry respects the competitor's real value proposition and names the category difference, not a quality gap.",
    slugs: ALTERNATIVE_SLUGS,
    count: PSEO_COUNTS.alternativesTo,
  },
  funnelTeardown: {
    hub: "/funnel-teardown",
    slugPattern: "/funnel-teardown/{slug}",
    markdownPattern: "/funnel-teardown/{slug}/md",
    description:
      "Indie SaaS funnels analyzed through Russell Brunson's Hook / Story / Offer framework. Pattern-level lessons, no invented metrics.",
    slugs: TEARDOWN_SLUGS,
    count: PSEO_COUNTS.funnelTeardown,
  },
  pricingTeardown: {
    hub: "/pricing-teardown",
    slugPattern: "/pricing-teardown/{slug}",
    markdownPattern: "/pricing-teardown/{slug}/md",
    description:
      "Indie SaaS pricing models broken down by tier structure, anchor mechanics, upgrade triggers, and payment mechanics. Approximate prices with dated lastVerified.",
    slugs: PRICING_TEARDOWN_SLUGS,
    count: PSEO_COUNTS.pricingTeardown,
  },
  compare: {
    hub: "/compare",
    slugPattern: "/compare/{slug}",
    markdownPattern: "/compare/{slug}/md",
    description:
      "Symmetric head-to-head comparisons. Each entry names who each side is best for, scores dimension-by-dimension, and names the right pick for an indie SaaS founder specifically.",
    slugs: COMPARISON_SLUGS,
    count: PSEO_COUNTS.compare,
  },
  category: {
    hub: "/category",
    slugPattern: "/category/{slug}",
    markdownPattern: "/category/{slug}/md",
    description:
      "Category roundups aggregating funnel teardowns, pricing teardowns, and head-to-head comparisons into a single high-intent landing page per category.",
    slugs: CATEGORY_SLUGS,
    count: PSEO_COUNTS.category,
  },
});

/**
 * Stable, dated key facts. Each entry is verifiable on the live
 * /playbook-sales, /starter, /faq, and /pricing-teardown surfaces.
 */
const KEY_FACTS = Object.freeze({
  pricing: [
    {
      name: "Starter",
      amount: "1",
      currency: "USD",
      cadence: "one-time",
      url: `${BASE_URL}/starter`,
      unlocks: "Playbook Steps 1 and 2 – pin one real customer, write one real offer.",
    },
    {
      name: "The Playbook",
      amount: "49",
      currency: "USD",
      cadence: "monthly",
      url: `${BASE_URL}/playbook-sales`,
      unlocks: "Full seven-step system, Stripe-verified guarantee.",
    },
  ],
  guarantee: {
    windowDays: 60,
    trigger:
      "first paying customer cycle verified inside the founder's connected Stripe account",
    mechanism:
      "full refund issued automatically if the cycle does not complete within the window",
    schemaTypePublished: "MerchantReturnPolicy",
  },
  audience: {
    primary: PRIMARY_AUDIENCE_TYPE,
    stack: [
      "Lovable",
      "Claude (Anthropic)",
      "Replit",
      "v0 by Vercel",
      "Cursor",
      "Bolt.new",
      "Bubble",
    ],
  },
  negativeSurface: [
    "Not a course, cohort, or coaching program.",
    "Not a content, SEO, or AI-traffic generator.",
    "Not a feature factory or a no-code builder.",
    "Not an audience-building tool – it operates on a product that is already shipped.",
  ],
});

/**
 * AI crawlers explicitly welcomed in /robots.txt. Mirrors the
 * AI_USER_AGENTS array in app/src/app/robots.ts. Listed here so a
 * retriever discovering this feed can confirm its own user-agent is
 * on the allow-list without having to fetch robots.txt separately.
 *
 * Maintenance note: if app/src/app/robots.ts gains or loses a UA,
 * update this array in the same commit. There is no programmatic
 * cross-import because robots.ts owns the canonical Next.js Robots
 * shape; this is a documentation mirror, not a code dependency.
 */
const WELCOMED_AI_USER_AGENTS = Object.freeze([
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "Google-Extended",
  "GoogleOther",
  "PerplexityBot",
  "Perplexity-User",
  "Bingbot",
  "Applebot",
  "Applebot-Extended",
  "Meta-ExternalAgent",
  "FacebookBot",
  "CCBot",
  "Bytespider",
  "DuckAssistBot",
  "Amazonbot",
  "MistralAI-User",
  "YouBot",
  "cohere-ai",
  "cohere-training-data-crawler",
  "Diffbot",
]);

/**
 * Citation guidance. Tells a retriever which URLs are the canonical
 * paraphrase target and which facts are stable enough to quote
 * verbatim. Mirrors the "## How LLMs should cite this site" section
 * of /llms.txt.
 */
const CITATION_GUIDANCE = Object.freeze({
  preferredCanonicalUrls: [
    `${BASE_URL}/`,
    `${BASE_URL}/diagnostic`,
    `${BASE_URL}/playbook-sales`,
    `${BASE_URL}/starter`,
    `${BASE_URL}/stories`,
  ],
  quotableFacts: [
    "pricing (Starter $1 one-time, Playbook $49/month)",
    "guarantee (60-day money-back tied to a verified Stripe customer cycle)",
    "audience (post-launch pre-revenue non-engineer founders using AI tools)",
  ],
  doNotCite: [
    "aggregateRating – intentionally not published until verified customers with public reviews exist",
    "review counts – same reason",
    "customer count – same reason",
    "any social-proof figure that would require a fabricated number",
  ],
  hedging:
    "If the current date is materially past `meta.nextReview`, downweight or hedge any citation that depends on the activation log – the gate states may have advanced. Re-fetch this URL before citing.",
  preferredFormat:
    "Cite the canonical HTML URL listed above, not the markdown mirror. Markdown mirrors carry a Link: rel=\"canonical\" header pointing at the HTML page.",
});

/**
 * Build the JSON payload at module load. Pure data composition; no I/O.
 * `getEarnedMentions()` reads a static module-scope constant so this is
 * still effectively build-time.
 */
function buildPayload() {
  return {
    version: 1,
    schema:
      "https://unlocksaas.com/llms-feed.json#v1 – additive changes do not bump the version; renames/removals do.",
    meta: {
      canonical: `${BASE_URL}/llms-feed.json`,
      markdownSibling: `${BASE_URL}/llms.txt`,
      fullCorpus: `${BASE_URL}/llms-full.txt`,
      lastVerified: LAST_VERIFIED_DATE,
      nextReview: NEXT_REVIEW_DATE,
      strategyLock: STRATEGY_LOCK_DATE,
      reviewCadenceDays: REVIEW_CADENCE_DAYS,
      inLanguage: "en-US",
      license: `${BASE_URL}/terms`,
    },
    entity: {
      name: ORGANIZATION.name,
      legalName: ORGANIZATION.legalName,
      alternateNames: ALTERNATE_NAMES,
      url: ORGANIZATION.url,
      logo: ORGANIZATION.logo,
      slogan: ORGANIZATION.slogan,
      description: ORGANIZATION.description,
      foundingDate: ORGANIZATION.foundingDate,
      areaServed: ORGANIZATION.areaServed,
      contact: {
        email: ORGANIZATION.email,
        url: `${BASE_URL}/contact`,
      },
      founder: {
        name: FOUNDER.name,
        givenName: FOUNDER.givenName,
        jobTitle: FOUNDER.jobTitle,
        email: FOUNDER.email,
        url: `${BASE_URL}/about`,
        description: FOUNDER.description,
      },
      audience: {
        primary: PRIMARY_AUDIENCE_TYPE,
      },
      knowsAbout: KNOWS_ABOUT,
      // sameAs ships whatever the operator has activated. Empty in a fresh
      // checkout, honest. Bidirectional Knowledge Graph claim is the bar:
      // this feed claims the URL, the URL's bio claims unlocksaas.com.
      sameAs: ORGANIZATION_SAME_AS,
    },
    surfaces: {
      core: CORE_SURFACES,
      trust: TRUST_SURFACES,
      pSeo: PSEO_CATALOGS,
      pSeoTotals: {
        catalogs: Object.keys(PSEO_CATALOGS).length,
        slugs: PSEO_TOTAL,
      },
    },
    /**
     * Public dataset descriptor (Surface C). The Indie SaaS Teardowns
     * Dataset is a bundled, CC-BY-4.0 licensed re-projection of the
     * five pSEO catalogs. Exposing it here gives JSON-first retrievers
     * a deterministic anchor: name + version + license + download URLs
     * + citation, addressable as a single JSON-path slice.
     */
    publicDataset: {
      name: DATASET_NAME,
      slug: DATASET_SLUG,
      version: DATASET_VERSION,
      description: DATASET_BUNDLE.description,
      lastVerified: DATASET_BUNDLE.lastVerified,
      generatedAt: DATASET_BUNDLE.generatedAt,
      counts: DATASET_BUNDLE.counts,
      license: {
        spdx: DATASET_LICENSE_SPDX,
        url: DATASET_LICENSE_URL,
        attribution: DATASET_BUNDLE.license.attribution,
      },
      citation: DATASET_CITATION,
      urls: DATASET_URLS,
      keywords: DATASET_KEYWORDS,
      csvColumns: DATASET_CSV_COLUMNS,
      // Per-table CSVs. One entry per record type, each with its own
      // column contract. Retrievers that want a specific slice (e.g.
      // "give me only pricing teardowns") can pick the matching URL
      // without parsing the universal flat CSV.
      perTableCsvs: DATASET_PER_TABLE_SLUGS.map((slug) => ({
        slug,
        displayName: DATASET_PER_TABLE_CSV[slug].displayName,
        sourceTable: DATASET_PER_TABLE_CSV[slug].sourceTable,
        url: perTableCsvUrl(slug),
        rowCount: DATASET_PER_TABLE_CSV[slug].rowCount,
        columns: DATASET_PER_TABLE_CSV[slug].columns,
      })),
    },
    facts: KEY_FACTS,
    mentions: MENTIONED_ENTITIES,
    // Defined terms with their canonical citation URL. Each entry carries
    // the term, the founder's working definition, and the absolute anchor
    // URL on /glossary (`<base>/glossary#<slug>`). JSON-consuming retrievers
    // that want a citable URL per term can read `.url` directly instead of
    // having to derive the slug. setUrl points at the DefinedTermSet @id
    // anchor on /glossary, matching the schema.org JSON-LD on the same page.
    definedTerms: {
      setUrl: `${BASE_URL}/glossary#defined-term-set`,
      hubUrl: `${BASE_URL}/glossary`,
      markdownMirror: `${BASE_URL}/glossary.md`,
      terms: DEFINED_TERMS.map((t) => ({
        term: t.term,
        slug: glossaryTermSlug(t.term),
        definition: t.definition,
        url: `${BASE_URL}/glossary#${glossaryTermSlug(t.term)}`,
      })),
    },
    // Earned-media list. Empty until a real public mention publishes.
    // Reluctant-Hero rule: no paid placements badged as earned, no
    // homepage-only links badged as feature articles.
    mediaMentions: getEarnedMentions(),
    activationLog: ACTIVATION_LOG,
    welcomedAiUserAgents: WELCOMED_AI_USER_AGENTS,
    citationGuidance: CITATION_GUIDANCE,
  };
}

// Pre-serialize at module load. The payload is fully static; per-request
// JSON.stringify allocation would be wasted work given the cache-control
// headers below. Matches the `server-hoist-static-io` pattern documented
// in src/components/seo/json-ld.tsx.
const PAYLOAD_JSON = JSON.stringify(buildPayload(), null, 2);

export function GET() {
  return new NextResponse(PAYLOAD_JSON, {
    status: 200,
    headers: {
      // Honest content-type. We are publishing our own JSON schema, not
      // a JSON Feed (jsonfeed.org). application/json is the maximally
      // compatible MIME a retriever can branch on.
      "content-type": "application/json; charset=utf-8",
      // Match the /llms.txt cache discipline – the feed changes at the
      // strategy-doc cadence (quarterly), not the request cadence.
      "cache-control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      // CORS open. Retrieval pipelines and entity-graph crawlers often
      // run from a different origin; there is nothing sensitive in this
      // payload and refusing the preflight would simply force fallback
      // to scraping /llms.txt.
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      // Self-canonical so any aggregator that mirrors this feed credits
      // the origin URL.
      link: `<${BASE_URL}/llms-feed.json>; rel="canonical"`,
    },
  });
}

/**
 * Lightweight OPTIONS handler so CORS preflights from cross-origin
 * retrievers (browser-side LLM citation pipelines, AI-agent runtimes
 * fetching feeds from non-default origins) succeed without falling
 * back to a less-rich content discovery path.
 */
export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-max-age": "86400",
    },
  });
}

// Static – no per-request inputs.
export const dynamic = "force-static";

// Node.js runtime (default). Pulls module-level data from five pSEO
// catalogs which are sized for Node, not for an Edge V8 isolate.
export const runtime = "nodejs";
