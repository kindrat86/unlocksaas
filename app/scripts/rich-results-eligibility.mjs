#!/usr/bin/env node
// @ts-check

/**
 * Google Rich Results eligibility sweep (2026-05-22 SEO audit).
 *
 * The sibling `validate-jsonld.mjs` enforces schema.org *required* keys plus
 * Brunson Hard-Rules. That bar is set deliberately low so the script can
 * gate deploys without false-positives.
 *
 * This script answers a different question: of the JSON-LD blocks that are
 * structurally valid, which ones are actually *eligible* for the rich
 * result Google would render? Eligibility ≠ validity. Eligibility requires
 * a specific subset of properties Google's renderer needs to draw the
 * carousel / panel / collapsing block on the SERP.
 *
 * For each canonical hub template we hit one representative URL on prod,
 * extract every <script type="application/ld+json"> block, and grade each
 * @type against Google's documented eligibility checklist (refs at the
 * bottom of this file).
 *
 * Output:
 *   - stdout: pass/fail summary per URL + aggregate eligibility scorecard
 *   - markdown: scripts/reports/rich-results-eligibility.md (committable)
 *
 * Exit codes:
 *   - 0 always (this is an advisory sweep; commit the report, fix as needed)
 *   - 1 if --strict and any URL produced an eligibility gap
 *
 * Usage:
 *   node scripts/rich-results-eligibility.mjs
 *   RICH_BASE_URL=https://unlocksaas.com node scripts/rich-results-eligibility.mjs
 *   node scripts/rich-results-eligibility.mjs --strict      # exit 1 on gaps
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPORT_PATH = join(__dirname, "reports", "rich-results-eligibility.md");

const BASE_URL = process.env.RICH_BASE_URL || "https://unlocksaas.com";
const STRICT = process.argv.includes("--strict");
const FETCH_TIMEOUT_MS = Number.parseInt(
  process.env.RICH_FETCH_TIMEOUT_MS || "60000",
  10,
);

/* eslint-disable no-console */

/**
 * One representative URL per canonical hub template (real, sitemap-verified
 * slug so the page renders with full data). Authority + GEO surfaces are
 * included because rich-result eligibility on those pages directly affects
 * SERP brand presence + AI-Overview citation rate.
 */
const URLS = [
  // ── Authority / brand SERP surfaces ──────────────────────────────────
  { url: "/", template: "home" },
  { url: "/about", template: "about" },
  { url: "/faq", template: "faq" },
  { url: "/press", template: "press" },
  { url: "/editorial-policy", template: "editorial-policy" },
  { url: "/founding", template: "founding" },
  { url: "/dont-buy-unlock-saas", template: "anti-page" },

  // ── Core funnels (commercial intent) ─────────────────────────────────
  { url: "/diagnostic", template: "diagnostic" },
  { url: "/playbook-sales", template: "playbook-sales" },
  { url: "/starter", template: "starter" },

  // ── pSEO hubs ────────────────────────────────────────────────────────
  { url: "/glossary", template: "glossary-hub" },
  { url: "/benchmarks", template: "benchmarks-hub" },
  { url: "/alternatives-to", template: "alternatives-to-hub" },
  { url: "/compare", template: "compare-hub" },
  { url: "/funnel-teardown", template: "funnel-teardown-hub" },
  { url: "/pricing-teardown", template: "pricing-teardown-hub" },
  { url: "/category", template: "category-hub" },
  { url: "/for", template: "for-hub" },
  { url: "/stack-for", template: "stack-for-hub" },
  { url: "/funnel-playbook", template: "funnel-playbook-hub" },
  { url: "/answers", template: "answers-hub" },
  { url: "/why-isnt-my", template: "why-isnt-my-hub" },
  { url: "/press/topics", template: "press-topics-hub" },

  // ── pSEO detail samples (one per hub) ────────────────────────────────
  { url: "/glossary/hook", template: "glossary-detail" },
  { url: "/benchmarks/landing-page-conversion-rate", template: "benchmarks-detail" },
  { url: "/alternatives-to/shipfast", template: "alternatives-to-detail" },
  { url: "/compare/convertkit-vs-beehiiv", template: "compare-detail" },
  { url: "/funnel-teardown/tally", template: "funnel-teardown-detail" },
  { url: "/pricing-teardown/tally", template: "pricing-teardown-detail" },
  { url: "/category/payments", template: "category-detail" },
  { url: "/for/course-creators", template: "for-detail" },
  { url: "/stack-for/course-creators", template: "stack-for-detail" },
  { url: "/funnel-playbook/tripwire", template: "funnel-playbook-detail" },
  { url: "/answers/how-long-should-a-vsl-be", template: "answers-detail" },
  { url: "/why-isnt-my/landing-page", template: "why-isnt-my-detail" },
  { url: "/scripts/vsl", template: "scripts-detail" },
  { url: "/pricing-page-examples/tiered", template: "pricing-page-examples-detail" },
  { url: "/conversion-rate/course-creators", template: "conversion-rate-detail" },
  { url: "/swipe-file/hero-headline", template: "swipe-file-detail" },
  { url: "/launch-checklist/course-creators", template: "launch-checklist-detail" },
  { url: "/press/topics/ai-generated-saas-flat-stripe-line", template: "press-topics-detail" },
  { url: "/podcast/per-locale-og-cards-glossary-benchmarks", template: "podcast-detail" },

  // ── GEO / AIO surfaces ───────────────────────────────────────────────
  { url: "/state-of-saas", template: "state-of-saas" },
  { url: "/four-indie-search-engines", template: "indie-search" },
  { url: "/dataset", template: "dataset" },
  { url: "/podcast", template: "podcast-hub" },

  // ── Locale samples ───────────────────────────────────────────────────
  { url: "/es/faq", template: "faq-es" },
  { url: "/pt-BR/faq", template: "faq-pt-br" },
];

/**
 * Google Rich Results eligibility rules per @type.
 *
 * Each entry declares:
 *   - `required`: properties Google requires to render the rich result
 *   - `recommended`: properties Google recommends for better display
 *   - `validate`: deeper, type-specific eligibility checks
 *
 * Sources (verify when Google updates docs):
 *   - https://developers.google.com/search/docs/appearance/structured-data/article
 *   - https://developers.google.com/search/docs/appearance/structured-data/faqpage
 *   - https://developers.google.com/search/docs/appearance/structured-data/qapage
 *   - https://developers.google.com/search/docs/appearance/structured-data/how-to
 *   - https://developers.google.com/search/docs/appearance/structured-data/product
 *   - https://developers.google.com/search/docs/appearance/structured-data/software-app
 *   - https://developers.google.com/search/docs/appearance/structured-data/video
 *   - https://developers.google.com/search/docs/appearance/structured-data/dataset
 *   - https://developers.google.com/search/docs/appearance/structured-data/podcast
 *   - https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
 *   - https://developers.google.com/search/docs/appearance/structured-data/course-info
 *   - https://developers.google.com/search/docs/appearance/structured-data/sitelinks-searchbox
 *   - https://developers.google.com/search/docs/appearance/structured-data/logo
 */

/** @typedef {{
 *   required: string[],
 *   recommended: string[],
 *   validate?: (node: Record<string, unknown>) => string[]
 * }} RichResultRule */

/** @type {Record<string, RichResultRule>} */
const RICH_RESULT_RULES = {
  // ── Article family (Article rich result) ─────────────────────────────
  Article: {
    required: ["headline", "image", "datePublished", "author"],
    recommended: ["dateModified", "publisher", "mainEntityOfPage"],
    validate: validateArticle,
  },
  NewsArticle: {
    required: ["headline", "image", "datePublished", "author"],
    recommended: ["dateModified", "publisher"],
    validate: validateArticle,
  },
  BlogPosting: {
    required: ["headline", "image", "datePublished", "author"],
    recommended: ["dateModified", "publisher"],
    validate: validateArticle,
  },
  TechArticle: {
    required: ["headline", "image", "datePublished", "author"],
    recommended: ["dateModified", "publisher"],
    validate: validateArticle,
  },

  // ── FAQ (FAQ rich result; ≥2 Questions, each with answer text) ───────
  FAQPage: {
    required: ["mainEntity"],
    recommended: [],
    validate: validateFAQPage,
  },

  // ── QA (Q&A rich result; single Question + acceptedAnswer) ───────────
  QAPage: {
    required: ["mainEntity"],
    recommended: [],
    validate: validateQAPage,
  },

  // ── HowTo (HowTo rich result; ≥2 steps with name/text) ───────────────
  HowTo: {
    required: ["name", "step"],
    recommended: ["totalTime", "supply", "tool", "estimatedCost"],
    validate: validateHowTo,
  },

  // ── Product (Product / Shopping rich results) ────────────────────────
  Product: {
    required: ["name", "image"],
    recommended: ["description", "brand", "sku", "offers", "aggregateRating", "review"],
    validate: validateProduct,
  },

  // ── SoftwareApplication (Software App rich result) ───────────────────
  // Google's eligibility requires (offers OR aggregateRating) + (operatingSystem OR applicationCategory)
  SoftwareApplication: {
    required: ["name"],
    recommended: ["offers", "aggregateRating", "operatingSystem", "applicationCategory", "description"],
    validate: validateSoftwareApplication,
  },

  // ── Video (Video rich result) ────────────────────────────────────────
  VideoObject: {
    required: ["name", "description", "thumbnailUrl", "uploadDate"],
    recommended: ["contentUrl", "embedUrl", "duration", "publication"],
    validate: validateVideoObject,
  },

  // ── Dataset (Google Dataset Search) ──────────────────────────────────
  Dataset: {
    required: ["name", "description", "license"],
    recommended: ["creator", "distribution", "temporalCoverage", "spatialCoverage", "keywords"],
    validate: validateDataset,
  },

  // ── Podcast ──────────────────────────────────────────────────────────
  PodcastSeries: {
    required: ["name", "url"],
    recommended: ["description", "webFeed", "author"],
  },
  PodcastEpisode: {
    required: ["name", "datePublished", "associatedMedia", "partOfSeries"],
    recommended: ["description", "duration"],
    validate: validatePodcastEpisode,
  },

  // ── Breadcrumb (Breadcrumb rich result) ──────────────────────────────
  BreadcrumbList: {
    required: ["itemListElement"],
    recommended: [],
    validate: validateBreadcrumb,
  },

  // ── Course (Course list rich result) ─────────────────────────────────
  Course: {
    required: ["name", "description", "provider"],
    recommended: ["hasCourseInstance", "offers"],
  },

  // ── Organization (logo, sitelinks, knowledge panel) ──────────────────
  Organization: {
    required: ["name", "url"],
    recommended: ["logo", "sameAs", "contactPoint"],
    validate: validateOrganization,
  },

  // ── WebSite (sitelinks search box) ───────────────────────────────────
  WebSite: {
    required: ["name", "url"],
    recommended: ["potentialAction"],
    validate: validateWebSite,
  },

  // ── DefinedTerm (helps AI Overviews surface definitions) ─────────────
  DefinedTerm: {
    required: ["name"],
    recommended: ["description", "inDefinedTermSet", "termCode"],
  },
  DefinedTermSet: {
    required: ["name"],
    recommended: ["hasDefinedTerm"],
  },

  // ── Person (founder credentials → Knowledge Panel) ───────────────────
  Person: {
    required: ["name"],
    recommended: ["sameAs", "image", "jobTitle", "worksFor"],
  },

  // ── Review / AggregateRating (Brunson Hard-Rule: only with real data) ─
  Review: {
    required: ["itemReviewed", "reviewRating", "author"],
    recommended: ["reviewBody", "datePublished"],
  },
  AggregateRating: {
    required: ["itemReviewed", "ratingValue", "reviewCount"],
    recommended: ["bestRating", "worstRating"],
  },
};

/* ── Type-specific eligibility validators ─────────────────────────────── */

/** @param {Record<string, unknown>} node */
function validateArticle(node) {
  /** @type {string[]} */
  const gaps = [];
  // Image: Google prefers ≥696px wide and ImageObject (URL acceptable but less rich).
  const image = node.image;
  if (Array.isArray(image)) {
    if (image.length === 0) gaps.push("Article: image[] is empty");
  } else if (typeof image === "object" && image !== null) {
    const img = /** @type {Record<string, unknown>} */ (image);
    if (!img.url && !img["@id"]) gaps.push("Article: image object missing url/@id");
  }
  // Author: Google requires Person or Organization with name (not bare string).
  // A pure `{@id: "..."}` reference is acceptable when the referenced entity is
  // declared elsewhere in the document — JSON-LD spec resolves cross-block.
  const author = node.author;
  const authors = Array.isArray(author) ? author : author ? [author] : [];
  for (const [i, a] of authors.entries()) {
    if (typeof a === "string") {
      gaps.push(`Article: author[${i}] is a bare string; Google wants Person/Organization with name`);
      continue;
    }
    if (typeof a === "object" && a !== null) {
      const ao = /** @type {Record<string, unknown>} */ (a);
      // Pure @id reference: resolver dereferences to canonical entity. Skip.
      if (isPureReference(ao)) continue;
      if (!ao.name) gaps.push(`Article: author[${i}].name missing`);
      if (!ao["@type"]) gaps.push(`Article: author[${i}].@type missing (Person or Organization)`);
    }
  }
  // datePublished must be ISO-8601 date or datetime.
  if (typeof node.datePublished === "string") {
    if (!/^\d{4}-\d{2}-\d{2}/.test(node.datePublished)) {
      gaps.push(`Article: datePublished "${node.datePublished}" not ISO-8601`);
    }
  }
  // Headline length ≤110 chars for display.
  if (typeof node.headline === "string" && node.headline.length > 110) {
    gaps.push(`Article: headline ${node.headline.length} chars > 110 (truncated in SERP)`);
  }
  return gaps;
}

/** @param {Record<string, unknown>} node */
function validateFAQPage(node) {
  /** @type {string[]} */
  const gaps = [];
  const entities = Array.isArray(node.mainEntity)
    ? node.mainEntity
    : node.mainEntity
      ? [node.mainEntity]
      : [];
  if (entities.length < 2) {
    gaps.push(`FAQPage: ${entities.length} Question(s); Google wants ≥2 for FAQ rich result`);
  }
  for (const [i, q] of entities.entries()) {
    if (!q || typeof q !== "object") continue;
    const qo = /** @type {Record<string, unknown>} */ (q);
    const ans = qo.acceptedAnswer;
    if (ans && typeof ans === "object") {
      const a = /** @type {Record<string, unknown>} */ (ans);
      if (typeof a.text === "string" && a.text.length < 10) {
        gaps.push(`FAQPage: mainEntity[${i}].acceptedAnswer.text is only ${a.text.length} chars`);
      }
    }
  }
  return gaps;
}

/** @param {Record<string, unknown>} node */
function validateQAPage(node) {
  /** @type {string[]} */
  const gaps = [];
  const me = node.mainEntity;
  // QAPage expects a single Question (not array), per Google.
  if (Array.isArray(me)) {
    gaps.push(`QAPage: mainEntity is array (${me.length}); Google expects a single Question`);
  } else if (me && typeof me === "object") {
    const q = /** @type {Record<string, unknown>} */ (me);
    if (!q.acceptedAnswer && !q.suggestedAnswer) {
      gaps.push("QAPage: Question missing acceptedAnswer AND suggestedAnswer");
    }
  }
  return gaps;
}

/** @param {Record<string, unknown>} node */
function validateHowTo(node) {
  /** @type {string[]} */
  const gaps = [];
  const steps = node.step;
  if (!Array.isArray(steps)) {
    gaps.push("HowTo: step must be an array");
    return gaps;
  }
  if (steps.length < 2) {
    gaps.push(`HowTo: ${steps.length} step(s); Google wants ≥2 for HowTo rich result`);
  }
  for (const [i, s] of steps.entries()) {
    if (!s || typeof s !== "object") continue;
    const so = /** @type {Record<string, unknown>} */ (s);
    if (!so.name && !so.text) {
      gaps.push(`HowTo: step[${i}] missing both name and text`);
    }
  }
  return gaps;
}

/** @param {Record<string, unknown>} node */
function validateProduct(node) {
  /** @type {string[]} */
  const gaps = [];
  // For full Product rich result, Google needs offers OR review/aggregateRating.
  const hasOffers = node.offers !== undefined;
  const hasReview = node.review !== undefined;
  const hasRating = node.aggregateRating !== undefined;
  if (!hasOffers && !hasReview && !hasRating) {
    gaps.push("Product: needs offers OR review OR aggregateRating for rich result eligibility");
  }
  if (hasOffers) {
    const offers = Array.isArray(node.offers) ? node.offers : [node.offers];
    for (const [i, o] of offers.entries()) {
      if (!o || typeof o !== "object") continue;
      const oo = /** @type {Record<string, unknown>} */ (o);
      if (oo.price === undefined && oo.lowPrice === undefined) {
        gaps.push(`Product: offers[${i}] missing price/lowPrice`);
      }
      if (!oo.priceCurrency) {
        gaps.push(`Product: offers[${i}] missing priceCurrency`);
      }
    }
  }
  return gaps;
}

/** @param {Record<string, unknown>} node */
function validateSoftwareApplication(node) {
  /** @type {string[]} */
  const gaps = [];
  const hasOffers = node.offers !== undefined;
  const hasRating = node.aggregateRating !== undefined;
  if (!hasOffers && !hasRating) {
    gaps.push("SoftwareApplication: needs offers OR aggregateRating for rich result eligibility");
  }
  if (!node.operatingSystem && !node.applicationCategory) {
    gaps.push("SoftwareApplication: needs operatingSystem OR applicationCategory");
  }
  if (hasOffers) {
    const offers = Array.isArray(node.offers) ? node.offers : [node.offers];
    for (const [i, o] of offers.entries()) {
      if (!o || typeof o !== "object") continue;
      const oo = /** @type {Record<string, unknown>} */ (o);
      if (oo.price === undefined && oo.priceCurrency === undefined) {
        gaps.push(`SoftwareApplication: offers[${i}] needs price + priceCurrency`);
      }
    }
  }
  return gaps;
}

/** @param {Record<string, unknown>} node */
function validateVideoObject(node) {
  /** @type {string[]} */
  const gaps = [];
  if (!node.contentUrl && !node.embedUrl) {
    gaps.push("VideoObject: needs contentUrl OR embedUrl");
  }
  if (typeof node.uploadDate === "string") {
    if (!/^\d{4}-\d{2}-\d{2}/.test(node.uploadDate)) {
      gaps.push(`VideoObject: uploadDate "${node.uploadDate}" not ISO-8601`);
    }
  }
  if (node.duration && typeof node.duration === "string") {
    if (!/^PT/.test(node.duration)) {
      gaps.push(`VideoObject: duration "${node.duration}" not ISO-8601 (expected PT#M#S)`);
    }
  }
  return gaps;
}

/** @param {Record<string, unknown>} node */
function validateDataset(node) {
  /** @type {string[]} */
  const gaps = [];
  if (typeof node.description === "string" && node.description.length < 50) {
    gaps.push(`Dataset: description is ${node.description.length} chars; Google wants ≥50`);
  }
  if (node.distribution) {
    const dists = Array.isArray(node.distribution) ? node.distribution : [node.distribution];
    for (const [i, d] of dists.entries()) {
      if (!d || typeof d !== "object") continue;
      const dd = /** @type {Record<string, unknown>} */ (d);
      if (!dd.contentUrl && !dd.url) {
        gaps.push(`Dataset: distribution[${i}] needs contentUrl or url`);
      }
      if (!dd.encodingFormat) {
        gaps.push(`Dataset: distribution[${i}] missing encodingFormat`);
      }
    }
  }
  return gaps;
}

/** @param {Record<string, unknown>} node */
function validatePodcastEpisode(node) {
  /** @type {string[]} */
  const gaps = [];
  const am = node.associatedMedia;
  if (am && typeof am === "object") {
    const amo = /** @type {Record<string, unknown>} */ (am);
    if (!amo.contentUrl) gaps.push("PodcastEpisode: associatedMedia.contentUrl required");
  }
  const series = node.partOfSeries;
  if (series && typeof series === "object") {
    const so = /** @type {Record<string, unknown>} */ (series);
    if (!so.name) gaps.push("PodcastEpisode: partOfSeries.name required");
  }
  return gaps;
}

/** @param {Record<string, unknown>} node */
function validateBreadcrumb(node) {
  /** @type {string[]} */
  const gaps = [];
  const items = node.itemListElement;
  if (!Array.isArray(items)) return gaps;
  for (const [i, it] of items.entries()) {
    if (!it || typeof it !== "object") continue;
    const io = /** @type {Record<string, unknown>} */ (it);
    // Google requires `item` (URL) for all but the last breadcrumb.
    if (i < items.length - 1 && !io.item) {
      gaps.push(`BreadcrumbList: itemListElement[${i}] missing item URL (required except last)`);
    }
  }
  return gaps;
}

/** @param {Record<string, unknown>} node */
function validateOrganization(node) {
  /** @type {string[]} */
  const gaps = [];
  if (!node.logo) {
    gaps.push("Organization: logo recommended for SERP brand panel + AI overview attribution");
  }
  // sameAs powers Knowledge Graph cross-references.
  if (!node.sameAs) {
    gaps.push("Organization: sameAs[] recommended (social/GitHub/Wikidata profiles)");
  }
  return gaps;
}

/** @param {Record<string, unknown>} node */
function validateWebSite(node) {
  /** @type {string[]} */
  const gaps = [];
  // potentialAction enables sitelinks search box.
  const pa = node.potentialAction;
  if (pa) {
    const actions = Array.isArray(pa) ? pa : [pa];
    const hasSearch = actions.some((a) => {
      if (!a || typeof a !== "object") return false;
      const ao = /** @type {Record<string, unknown>} */ (a);
      const t = ao["@type"];
      const types = Array.isArray(t) ? t : t ? [t] : [];
      return types.includes("SearchAction");
    });
    if (!hasSearch) {
      gaps.push("WebSite: potentialAction has no SearchAction (blocks sitelinks search box)");
    }
  }
  return gaps;
}

/* ── Block extraction + walking ───────────────────────────────────────── */

const JSONLD_BLOCK_RE =
  /<script[^>]*\btype\s*=\s*"application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;

/**
 * Path segments under which a nested @type node is a *relation reference*,
 * not a renderable rich result. Google grades the parent entity, not the
 * nested reference. We continue walking these for `typesSeen` coverage,
 * but skip eligibility scoring inside them to avoid false positives.
 *
 * Example: Person.workExample → Article — the nested Article is a relation,
 * not a page-eligible Article, so missing `image` is expected.
 */
const REFERENCE_PATH_SEGMENTS = new Set([
  // Authorship / publication relations
  "author", "publisher", "creator", "contributor", "editor", "producer",
  "translator", "illustrator", "narrator", "sponsor", "funder", "recipient",
  // Membership / org relations
  "member", "memberOf", "worksFor", "affiliation", "alumniOf",
  "subOrganization", "parentOrganization", "department",
  "founder", "founders", "employee", "employees", "ceo",
  // Citation / mention relations
  "subjectOf", "mentions", "about", "citation", "isBasedOn", "sameAs",
  // Work / part relations
  "workExample", "exampleOfWork", "hasPart", "isPartOf", "partOf",
  "partOfSeries", "partOfEpisode", "encodesCreativeWork",
  // Term-set relations
  "inDefinedTermSet",
  // Social / personal relations
  "knows", "knowsAbout", "knowsLanguage", "owns", "follows",
  "spouse", "parent", "children", "sibling", "relatedTo", "colleague",
  // Cast / credit relations
  "actor", "director", "musicBy", "performer", "character",
  // Rights / source relations
  "copyrightHolder", "sourceOrganization", "provider",
  // Brand / item-reviewed relations (the reviewed item is referenced, not declared here)
  "brand", "itemReviewed",
]);

/** @param {string} path */
function isUnderReferencePath(path) {
  // path looks like "block[0]" or "block[0].subjectOf[0]" or "block[0].mainEntity[2].acceptedAnswer"
  const segments = path
    .replace(/\[\d+\]/g, "")
    .split(".")
    .slice(1); // drop "block"
  return segments.some((s) => REFERENCE_PATH_SEGMENTS.has(s));
}

/** @param {unknown} node @returns {string[]} */
function typesOf(node) {
  if (!node || typeof node !== "object") return [];
  const t = /** @type {{ '@type'?: unknown }} */ (node)["@type"];
  if (typeof t === "string") return [t];
  if (Array.isArray(t)) return t.filter((x) => typeof x === "string");
  return [];
}

/**
 * A node is a "pure reference" if it carries only `@id` (plus optional `@type`)
 * with no real content properties. These can legitimately omit eligibility
 * fields because the resolver dereferences by @id.
 *
 * @param {Record<string, unknown>} node
 */
function isPureReference(node) {
  const contentKeys = Object.keys(node).filter(
    (k) => !k.startsWith("@") && node[k] !== undefined,
  );
  return Object.prototype.hasOwnProperty.call(node, "@id") && contentKeys.length === 0;
}

/**
 * @typedef {{
 *   type: string,
 *   path: string,
 *   missingRequired: string[],
 *   missingRecommended: string[],
 *   eligibilityGaps: string[]
 * }} TypeFinding
 */

/**
 * @param {unknown} node
 * @param {string} path
 * @param {TypeFinding[]} out
 */
function walk(node, path, out) {
  if (Array.isArray(node)) {
    node.forEach((item, i) => walk(item, `${path}[${i}]`, out));
    return;
  }
  if (!node || typeof node !== "object") return;
  const obj = /** @type {Record<string, unknown>} */ (node);
  const types = typesOf(obj);

  // Skip eligibility on (a) reference-path nodes (parent grades the relation)
  // and (b) pure @id references (resolver dereferences to canonical entity).
  // We still walk into children so `typesSeen` reflects full coverage.
  const skipEligibility = isUnderReferencePath(path) || isPureReference(obj);

  if (!skipEligibility) {
    for (const t of types) {
      const rule = RICH_RESULT_RULES[t];
      if (!rule) continue;

      const missingRequired = rule.required.filter((k) => {
        const v = obj[k];
        return v === undefined || v === null || v === "";
      });
      const missingRecommended = rule.recommended.filter((k) => {
        const v = obj[k];
        return v === undefined || v === null || v === "";
      });
      const eligibilityGaps = rule.validate ? rule.validate(obj) : [];

      if (
        missingRequired.length > 0 ||
        missingRecommended.length > 0 ||
        eligibilityGaps.length > 0
      ) {
        out.push({
          type: t,
          path,
          missingRequired,
          missingRecommended,
          eligibilityGaps,
        });
      }
    }
  }

  for (const [key, child] of Object.entries(obj)) {
    if (key === "@context" || key === "@type" || key === "@id") continue;
    walk(child, `${path}.${key}`, out);
  }
}

/**
 * @typedef {{
 *   url: string,
 *   template: string,
 *   status: number,
 *   blockCount: number,
 *   typeFindings: TypeFinding[],
 *   typesSeen: string[],
 *   error?: string
 * }} UrlReport
 */

/** @param {{ url: string, template: string }} entry @returns {Promise<UrlReport>} */
async function processUrl(entry) {
  const full = `${BASE_URL}${entry.url}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  /** @type {UrlReport} */
  const report = {
    url: entry.url,
    template: entry.template,
    status: 0,
    blockCount: 0,
    typeFindings: [],
    typesSeen: [],
  };
  let html;
  try {
    const res = await fetch(full, {
      headers: { Accept: "text/html", "User-Agent": "UnlockSaaS-RichResults-Audit/1.0" },
      signal: controller.signal,
    });
    report.status = res.status;
    if (!res.ok) {
      report.error = `HTTP ${res.status} ${res.statusText}`;
      return report;
    }
    html = await res.text();
  } catch (/** @type {any} */ e) {
    report.error = `fetch failed: ${e?.message ?? e}`;
    return report;
  } finally {
    clearTimeout(timer);
  }

  const typesSet = new Set();
  let m;
  let blockIndex = 0;
  JSONLD_BLOCK_RE.lastIndex = 0;
  while ((m = JSONLD_BLOCK_RE.exec(html)) !== null) {
    report.blockCount++;
    const raw = m[1].trim();
    /** @type {unknown} */
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      continue;
    }
    const blockIdx = blockIndex++;
    /** @type {unknown[]} */
    const roots = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === "object" && Array.isArray(/** @type {any} */ (parsed)["@graph"])
        ? /** @type {any} */ (parsed)["@graph"]
        : [parsed];
    for (const root of roots) {
      /** @type {TypeFinding[]} */
      const findings = [];
      walk(root, `block[${blockIdx}]`, findings);
      for (const f of findings) report.typeFindings.push(f);
      // collect every @type seen for coverage scorecard
      const collectTypes = (n) => {
        if (!n) return;
        if (Array.isArray(n)) {
          n.forEach(collectTypes);
          return;
        }
        if (typeof n !== "object") return;
        for (const t of typesOf(n)) typesSet.add(t);
        for (const [k, c] of Object.entries(n)) {
          if (k.startsWith("@")) continue;
          collectTypes(c);
        }
      };
      collectTypes(root);
    }
  }
  report.typesSeen = [...typesSet].sort();
  return report;
}

/* ── Report writer ────────────────────────────────────────────────────── */

/** @param {UrlReport[]} reports */
function renderMarkdown(reports) {
  const date = new Date().toISOString().slice(0, 10);
  const totalUrls = reports.length;
  const fetched = reports.filter((r) => !r.error).length;
  const withGaps = reports.filter((r) => r.typeFindings.length > 0).length;
  const cleanUrls = fetched - withGaps;

  // Aggregate by @type across all URLs.
  /** @type {Record<string, { seen: number, withGaps: number, gapSamples: Set<string> }>} */
  const byType = {};
  for (const r of reports) {
    for (const t of r.typesSeen) {
      if (!byType[t]) byType[t] = { seen: 0, withGaps: 0, gapSamples: new Set() };
      byType[t].seen++;
    }
    for (const f of r.typeFindings) {
      if (!byType[f.type]) byType[f.type] = { seen: 0, withGaps: 0, gapSamples: new Set() };
      byType[f.type].withGaps++;
      const lines = [
        ...f.missingRequired.map((k) => `missing required \`${k}\``),
        ...f.missingRecommended.map((k) => `missing recommended \`${k}\``),
        ...f.eligibilityGaps,
      ];
      for (const l of lines) byType[f.type].gapSamples.add(l);
    }
  }

  let md = "";
  md += `# Rich Results eligibility sweep — ${date}\n\n`;
  md += `> Auto-generated by \`scripts/rich-results-eligibility.mjs\`.\n`;
  md += `> Base: \`${BASE_URL}\`. URLs: ${totalUrls}. Fetched OK: ${fetched}. Clean: ${cleanUrls}. With gaps: ${withGaps}.\n\n`;
  md += `Eligibility ≠ validity. \`validate-jsonld.mjs\` enforces schema.org required\n`;
  md += `keys; this script grades each block against Google's *rich result eligibility*\n`;
  md += `requirements (the extra properties Google needs to actually render the\n`;
  md += `carousel / panel / collapsing block on the SERP).\n\n`;

  md += `## Aggregate scorecard by @type\n\n`;
  md += `| @type | URLs seen | URLs with gaps | Sample issue |\n`;
  md += `|---|---:|---:|---|\n`;
  for (const t of Object.keys(byType).sort()) {
    const r = byType[t];
    const sample = [...r.gapSamples][0] || "—";
    md += `| \`${t}\` | ${r.seen} | ${r.withGaps} | ${sample} |\n`;
  }
  md += `\n`;

  md += `## Per-URL findings\n\n`;
  for (const r of reports) {
    md += `### \`${r.url}\` _(template: ${r.template})_\n\n`;
    if (r.error) {
      md += `- ❌ ${r.error}\n\n`;
      continue;
    }
    md += `- Status: ${r.status}, JSON-LD blocks: ${r.blockCount}, @types: ${r.typesSeen.map((t) => `\`${t}\``).join(", ") || "—"}\n`;
    if (r.typeFindings.length === 0) {
      md += `- ✅ All @types pass Google Rich Results eligibility.\n\n`;
      continue;
    }
    md += `\n`;
    for (const f of r.typeFindings) {
      const headerBits = [];
      if (f.missingRequired.length > 0) headerBits.push(`${f.missingRequired.length} required`);
      if (f.missingRecommended.length > 0) headerBits.push(`${f.missingRecommended.length} recommended`);
      if (f.eligibilityGaps.length > 0) headerBits.push(`${f.eligibilityGaps.length} eligibility`);
      md += `  - **${f.type}** at \`${f.path}\` — ${headerBits.join(", ") || "no findings"}\n`;
      for (const k of f.missingRequired) md += `    - 🔴 missing required: \`${k}\`\n`;
      for (const k of f.missingRecommended) md += `    - 🟡 missing recommended: \`${k}\`\n`;
      for (const g of f.eligibilityGaps) md += `    - 🟠 ${g}\n`;
    }
    md += `\n`;
  }

  md += `## Method\n\n`;
  md += `- One representative URL per canonical hub template (real, sitemap-verified slug).\n`;
  md += `- For each URL: GET HTML, extract every \`<script type="application/ld+json">\`,\n`;
  md += `  recurse into \`@graph\` arrays, grade each node carrying a known \`@type\`.\n`;
  md += `- Rules sourced from Google's structured-data eligibility docs\n`;
  md += `  (linked at the top of the script).\n`;
  md += `- Severity:\n`;
  md += `  - 🔴 **required** — Google will not render the rich result without it.\n`;
  md += `  - 🟡 **recommended** — Google may render a degraded rich result; full eligibility wants it.\n`;
  md += `  - 🟠 **eligibility check** — type-specific deeper rule (e.g. FAQ ≥2 Q, Article author = Person not string).\n\n`;
  md += `Re-run: \`node scripts/rich-results-eligibility.mjs\` (or via \`npm run validate:richresults\`).\n`;
  return md;
}

/* ── Main ─────────────────────────────────────────────────────────────── */

async function main() {
  console.log(`[rich-results] base = ${BASE_URL}`);
  console.log(`[rich-results] urls = ${URLS.length}`);
  /** @type {UrlReport[]} */
  const reports = [];
  for (const entry of URLS) {
    process.stdout.write(`  ${entry.url} … `);
    const r = await processUrl(entry);
    reports.push(r);
    if (r.error) {
      console.log(`✗ ${r.error}`);
    } else if (r.typeFindings.length === 0) {
      console.log("✓");
    } else {
      const req = r.typeFindings.reduce((n, f) => n + f.missingRequired.length, 0);
      const rec = r.typeFindings.reduce((n, f) => n + f.missingRecommended.length, 0);
      const elg = r.typeFindings.reduce((n, f) => n + f.eligibilityGaps.length, 0);
      console.log(`△ ${req} req / ${rec} rec / ${elg} elg`);
    }
  }

  const md = renderMarkdown(reports);
  await mkdir(dirname(REPORT_PATH), { recursive: true });
  await writeFile(REPORT_PATH, md, "utf8");
  console.log(`\n[rich-results] report → ${REPORT_PATH}`);

  // Aggregate scorecard to stdout (handy without opening the report).
  const totalFindings = reports.reduce((n, r) => n + r.typeFindings.length, 0);
  const dirty = reports.filter((r) => r.typeFindings.length > 0).length;
  console.log(
    `[rich-results] urls with gaps: ${dirty}/${reports.length} — total @type findings: ${totalFindings}`,
  );

  if (STRICT && dirty > 0) {
    console.error(`[rich-results] --strict and ${dirty} URL(s) have eligibility gaps`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
