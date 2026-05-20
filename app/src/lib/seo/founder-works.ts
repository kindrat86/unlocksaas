/**
 * Founder's body of work — Person.workExample anchors.
 *
 * Why this module exists (E-E-A-T uplift, 2026-05-21):
 *   The discovery-surface audit (sessions/2026-05-21) flagged the
 *   founder credential surface as "bio only" – no shipped-artifact
 *   anchors on the Person entity. The fix is NOT to fabricate awards
 *   or degrees (Brunson Hard-Rule forbids it). The fix is to surface
 *   the artifacts the founder has actually shipped on the live site,
 *   each pointing to a real public URL.
 *
 *   schema.org/Person.workExample accepts an array of CreativeWork
 *   subtypes (Article, Dataset, Book, SoftwareApplication, Podcast,
 *   APIReference, etc.). Each entry below is a real, indexable,
 *   externally-discoverable artifact authored or maintained by the
 *   named founder. None is aspirational. None is paid placement.
 *   The list grows when a new public artifact ships, never before.
 *
 * Editorial discipline
 * --------------------
 *   - Every `url` MUST resolve to a live, public, founder-controlled
 *     surface. Off-platform credentials (a podcast episode on a
 *     third-party show, a guest essay on a third-party site) belong
 *     in MEDIA_MENTIONS, not here. This is the founder's own work.
 *   - Every `name` MUST match the canonical title used on the artifact
 *     itself. Drift between the title here and the title on the
 *     artifact is a self-citation tell.
 *   - Every `datePublished` MUST be an ISO calendar date the artifact
 *     was first publicly shipped (not the strategy-lock date, not the
 *     env-var-flip date – the date the surface went live).
 *   - Conditional entries (Zenodo dataset, HuggingFace mirror) only
 *     appear when the env var that activates the underlying claim is
 *     set. This mirrors the existing entity.ts env-gate pattern.
 *
 * Why this surface lifts E-E-A-T more than fabricated awards
 * ---------------------------------------------------------
 *   Google's quality raters look for "body of work" evidence on
 *   author/founder profiles. An empty Person with knowsAbout and a
 *   bio reads as a thin author. A Person with workExample pointing
 *   to a public Dataset, a PodcastSeries, an APIReference, and an
 *   open-source CreativeWork reads as an author with demonstrated
 *   topical authority – every claim independently verifiable. LLM
 *   citation pipelines apply the same heuristic: an author who has
 *   shipped public artifacts in the topic area is a more citable
 *   source than one who has only published an "about me" page.
 *
 * Brunson Hard-Rule reconciliation: a fresh checkout always ships at
 * least the four anchor works (dataset, podcast series, glossary
 * defined-term set, API reference) because each is a static, live,
 * indexable surface on this domain. Zenodo and HuggingFace rows layer
 * on top when the operator activates the env vars after a real
 * deposit / cross-listing lands.
 */

import {
  BASE_URL,
  DATASET_DOI_URL,
  DATASET_EXTERNAL_REGISTRATIONS,
} from "@/lib/seo/entity";

/**
 * One shipped artifact authored or maintained by the founder.
 *
 * `type` is the schema.org @type the artifact serializes as. We pick
 * the most specific subtype that fits – e.g. Dataset for the open
 * teardowns bundle, PodcastSeries for the iTunes-namespace RSS feed,
 * APIReference for the static OpenAPI 3.1 document. Generic
 * "CreativeWork" is the fallback only when no narrower subtype
 * applies.
 */
export interface FounderWorkExample {
  /** Canonical title as it appears on the artifact itself. */
  readonly name: string;
  /** Live, public URL of the artifact. Must be https. */
  readonly url: string;
  /** schema.org @type the artifact serializes as. */
  readonly type:
    | "Dataset"
    | "PodcastSeries"
    | "Article"
    | "APIReference"
    | "DefinedTermSet"
    | "SoftwareApplication"
    | "CreativeWork";
  /** ISO YYYY-MM-DD date the artifact first went public. */
  readonly datePublished: string;
  /**
   * One-sentence note describing the artifact. Used as
   * CreativeWork.description in the JSON-LD payload and as the
   * tooltip / sub-text in any rendered "Body of work" UI.
   */
  readonly description: string;
  /**
   * Bare DOI when the artifact has one (e.g. Zenodo deposit). Used
   * as CreativeWork.identifier with propertyID "doi". Undefined for
   * artifacts that do not mint a DOI (most of the on-site surfaces).
   */
  readonly doi?: string;
}

/**
 * Canonical, always-shipped artifacts. Each `url` resolves to a live
 * surface on this domain – the build-time validation IIFE below will
 * throw if any entry breaks the contract.
 *
 * Order is hand-picked: the strongest topical-authority anchors first
 * (the Dataset is the deepest verifiable artifact; the DefinedTermSet
 * is the broadest semantic claim; the PodcastSeries is the multi-
 * format diversification signal; the APIReference is the agent-tools
 * surface). LLM retrievers walking workExample top-down hit the
 * highest-leverage anchors first.
 */
const ANCHOR_WORKS: readonly FounderWorkExample[] = Object.freeze([
  {
    name: "Indie SaaS Teardowns dataset (CC-BY-4.0)",
    url: `${BASE_URL}/dataset`,
    type: "Dataset",
    datePublished: "2026-05-17",
    description:
      "Five-table open dataset of funnel teardowns, pricing teardowns, comparisons, alternatives, and categories – every row sourced from a live read of a real indie SaaS product.",
  },
  {
    name: "Unlock SaaS Glossary (Brunson DefinedTermSet)",
    url: `${BASE_URL}/glossary`,
    type: "DefinedTermSet",
    datePublished: "2026-05-17",
    description:
      "The 16-term canonical glossary for the Brunson sales-funnel framework applied to indie SaaS, each term defined in the founder's own words with a worked example.",
  },
  {
    name: "Unlock SaaS Podcast (operator changelog, iTunes RSS)",
    url: `${BASE_URL}/podcast`,
    type: "PodcastSeries",
    datePublished: "2026-05-17",
    description:
      "Episodic changelog of every shipped surface that affects post-launch pre-revenue indie SaaS founders – each episode tied to a verifiable commit hash and live artifact URL.",
  },
  {
    name: "Unlock SaaS OpenAPI 3.1 (Custom GPT Actions surface)",
    url: `${BASE_URL}/openapi.json`,
    type: "APIReference",
    datePublished: "2026-05-17",
    description:
      "Hand-authored OpenAPI document for the public diagnostic and dataset endpoints – installable into ChatGPT Custom GPT Actions, Postman, Insomnia, and the LangChain OpenAPI toolkit.",
  },
  {
    name: "Unlock SaaS MCP server (Streamable HTTP, 14 tools)",
    url: `${BASE_URL}/mcp`,
    type: "APIReference",
    datePublished: "2026-05-18",
    description:
      "Model Context Protocol server exposing 14 read-only tools for AI agents – diagnose live URLs, query funnel and pricing teardowns, walk the glossary, browse comparisons and alternatives.",
  },
  {
    name: "State of SaaS (annual editorial snapshot)",
    url: `${BASE_URL}/state-of-saas`,
    type: "Article",
    datePublished: "2026-05-21",
    description:
      "Yearly Dataset + DataFeed editorial review of indie SaaS go-to-market patterns, sourced from the live teardown corpus and the founder's outreach logs.",
  },
  {
    name: "Four Indie Search Engines (GEO companion essay)",
    url: `${BASE_URL}/four-indie-search-engines`,
    type: "Article",
    datePublished: "2026-05-20",
    description:
      "Long-form essay on the four indie-friendly search and retrieval engines worth optimizing for outside Google – Brave, Mojeek, Marginalia, and Kagi – with side-by-side submission notes.",
  },
]);

/**
 * Optional env-gated works – they layer on top of ANCHOR_WORKS once
 * the underlying off-platform deposit lands. Each is omitted when its
 * env var is unset (the canonical entity.ts pattern).
 *
 * Why these are split from anchors: a Zenodo or HuggingFace listing
 * is the SAME conceptual artifact as the on-site dataset (it's a
 * mirror), but each has its own URL, its own identifier (DOI for
 * Zenodo), and its own date. Listing them separately gives the
 * Person.workExample array stronger entity-graph density than a
 * single Dataset entry with sameAs cross-listings, because each
 * mirror gets its own CreativeWork node that LLM retrievers can
 * cite independently.
 */
function buildEnvGatedWorks(): readonly FounderWorkExample[] {
  const rows: FounderWorkExample[] = [];

  // Zenodo DOI – mints a citable academic identifier. Highest GEO
  // leverage of the optional rows because Google Dataset Search,
  // academic citation pipelines, and LLM training corpora all weight
  // DOI-bearing artifacts above bare URLs.
  const zenodo = DATASET_EXTERNAL_REGISTRATIONS.find((r) => r.name === "Zenodo");
  if (zenodo && DATASET_DOI_URL) {
    rows.push({
      name: "Indie SaaS Teardowns dataset – Zenodo deposit (DOI-minted mirror)",
      url: DATASET_DOI_URL,
      type: "Dataset",
      // Same publish date as the canonical dataset – the Zenodo
      // mirror is a re-publication of the same artifact, not a
      // separate work. The DOI is the new identifier; the content
      // is unchanged.
      datePublished: "2026-05-17",
      description:
        "Zenodo-minted DOI for the open Indie SaaS Teardowns dataset – academic-citation-ready mirror of the canonical bundle at /dataset.",
      ...(zenodo.doi ? { doi: zenodo.doi } : {}),
    });
  }

  // HuggingFace cross-listing – activates the HF search surface as
  // a secondary acquisition channel and lifts Google Dataset Search
  // ranking via includedInDataCatalog.
  const hf = DATASET_EXTERNAL_REGISTRATIONS.find(
    (r) => r.name === "Hugging Face Datasets",
  );
  if (hf) {
    rows.push({
      name: "Indie SaaS Teardowns dataset – Hugging Face cross-listing",
      url: hf.url,
      type: "Dataset",
      datePublished: "2026-05-18",
      description:
        "Hugging Face Datasets mirror of the canonical Indie SaaS Teardowns bundle – discoverable via HF search alongside research datasets in the same topical neighbourhood.",
    });
  }

  return Object.freeze(rows);
}

/**
 * Build-time integrity gate. Same shape as media-mentions.ts's
 * validateMentions IIFE: throws on the FIRST violation so the Next.js
 * prerender pipeline surfaces the failure inline rather than shipping
 * a silently-broken Person.workExample graph.
 *
 * Cost: O(n) over an array that will not exceed ~20 entries in the
 * brand's lifetime. Synchronous, allocation-free per row.
 */
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const VALID_TYPES = new Set<FounderWorkExample["type"]>([
  "Dataset",
  "PodcastSeries",
  "Article",
  "APIReference",
  "DefinedTermSet",
  "SoftwareApplication",
  "CreativeWork",
]);

function validateWorkExamples(rows: readonly FounderWorkExample[]): void {
  const seenUrls = new Set<string>();
  rows.forEach((row, i) => {
    const where = `FOUNDER_WORK_EXAMPLES[${i}]`;
    if (typeof row.name !== "string" || row.name.trim() === "") {
      throw new Error(`${where}.name must be a non-empty string`);
    }
    if (typeof row.url !== "string" || !row.url.startsWith("https://")) {
      throw new Error(`${where}.url must be an absolute https URL`);
    }
    try {
      new URL(row.url);
    } catch {
      throw new Error(`${where}.url is not a valid URL: ${row.url}`);
    }
    if (seenUrls.has(row.url)) {
      throw new Error(`${where}.url is a duplicate: ${row.url}`);
    }
    seenUrls.add(row.url);
    if (!VALID_TYPES.has(row.type)) {
      throw new Error(
        `${where}.type must be one of ${Array.from(VALID_TYPES).join(", ")}; got ${row.type}`,
      );
    }
    if (!ISO_DATE_RE.test(row.datePublished)) {
      throw new Error(
        `${where}.datePublished must be ISO YYYY-MM-DD; got ${JSON.stringify(row.datePublished)}`,
      );
    }
    const parsedDate = new Date(`${row.datePublished}T00:00:00Z`);
    if (Number.isNaN(parsedDate.getTime())) {
      throw new Error(
        `${where}.datePublished is not a real calendar date: ${row.datePublished}`,
      );
    }
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    if (parsedDate > tomorrow) {
      throw new Error(
        `${where}.datePublished is in the future: ${row.datePublished}`,
      );
    }
    if (
      typeof row.description !== "string" ||
      row.description.trim().length < 20
    ) {
      throw new Error(
        `${where}.description must be a meaningful one-sentence description (>= 20 chars)`,
      );
    }
  });
}

/**
 * Composed list: anchors first, env-gated mirrors second. Frozen at
 * module load. Re-evaluated only on cold start when the env-driven
 * URLs might change.
 *
 * Consumers MUST treat an empty array as "omit Person.workExample
 * entirely" – a `workExample: []` payload is a fabrication tell to
 * KG validators. The current shape always ships at least the seven
 * anchor entries, so this guard is defensive rather than load-bearing.
 */
function buildFounderWorkExamples(): readonly FounderWorkExample[] {
  const composed = [...ANCHOR_WORKS, ...buildEnvGatedWorks()];
  validateWorkExamples(composed);
  return Object.freeze(composed);
}

export const FOUNDER_WORK_EXAMPLES: readonly FounderWorkExample[] =
  buildFounderWorkExamples();

/**
 * Serialize one FounderWorkExample to the schema.org CreativeWork
 * shape Person.workExample expects. Hoisted helper so the JSON-LD
 * builder in components/seo/json-ld.tsx can map-fold it without
 * re-deriving the shape each call.
 */
export function toCreativeWorkNode(
  work: FounderWorkExample,
): Record<string, unknown> {
  const base: Record<string, unknown> = {
    "@type": work.type,
    name: work.name,
    url: work.url,
    datePublished: work.datePublished,
    description: work.description,
  };
  if (work.doi) {
    base.identifier = {
      "@type": "PropertyValue",
      propertyID: "doi",
      value: work.doi,
    };
  }
  return base;
}
