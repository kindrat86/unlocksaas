/**
 * Public dataset — Indie SaaS Teardowns.
 *
 * Surface C (linkable asset / off-page lift) landing 2026-05-18.
 *
 * Why this module exists
 * ----------------------
 * Five pSEO catalogs (funnel-teardowns, pricing-teardowns, comparisons,
 * alternatives, categories) already ship as HTML. Each entry carries a
 * dated `lastVerified` and a Brunson Hard-Rule editorial standard. That
 * editorial discipline is the moat — and the moat only earns off-page
 * citation when the data is also downloadable in a shape researchers,
 * indie founders, newsletter writers, and academics can re-use without
 * scraping HTML.
 *
 * This module is the single source of truth for the bundled public
 * dataset. The three downloadable endpoints (/dataset/...json,
 * .../indie-saas-teardowns.csv) and the HTML landing at /dataset all
 * read from `buildDatasetBundle()` and `buildDatasetCsv()` below, so
 * the JSON, the CSV, and the on-page table can never drift on facts
 * or row count.
 *
 * License
 * -------
 * CC-BY-4.0. Attribution is the entire point — every re-use of the
 * dataset must credit `Unlock SaaS` and link back to
 * https://unlocksaas.com/dataset. That is the off-page mechanism: the
 * license is the backlink contract.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - Every row is verifiable against the live HTML on the matching
 *     pSEO surface. The dataset is a re-projection of those surfaces,
 *     not a separate source of claims.
 *   - `lastVerified` ISO dates are carried through from the source
 *     catalogs unchanged. We do not bump them at dataset build time.
 *   - Approximate prices stay flagged "approximate" in the JSON.
 *     CSV column names mirror the JSON property names so the
 *     "approximate" framing is preserved.
 *   - No fabricated review counts, no inferred user counts, no traffic
 *     estimates. The dataset contains only what the editorial process
 *     verified.
 *
 * Versioning contract
 * -------------------
 * `DATASET_VERSION` is a SemVer string. Additive changes (new optional
 * columns, new catalog entries, new categories) do NOT bump the major
 * or minor — only `patch`. Renames, type changes, or row-shape changes
 * bump `minor` and publish a migration note. Removing a column or
 * record-type bumps `major`. Consumers should branch on the major.
 *
 * Discovery
 * ---------
 *   - Linked from /llms.txt under "## Public dataset".
 *   - Listed in /sitemap.xml at priority 0.4 (above llms.txt; the
 *     dataset is a real, linkable, citable asset).
 *   - JSON-LD `Dataset` schema rendered on /dataset/page.tsx so Google
 *     Dataset Search and academic crawlers can index it.
 *   - All three download URLs are reachable for every AI user-agent
 *     allow-listed in /robots.txt.
 *
 * Caching
 * -------
 * The dataset content changes when a pSEO catalog gains or loses an
 * entry — at most a couple of times per week, often less. Edge-cache
 * for a day with a one-week stale-while-revalidate so the cost of
 * serving a Hacker-News-front-page burst is near-zero.
 */

import { TEARDOWNS, type FunnelTeardown } from "@/lib/funnel-teardowns";
import {
  PRICING_TEARDOWNS,
  type PricingTeardown,
} from "@/lib/pricing-teardowns";
import { COMPARISONS, type Comparison } from "@/lib/comparisons";
import { ALTERNATIVES, type Alternative } from "@/lib/alternatives";
import { CATEGORIES, type CategoryDef } from "@/lib/categories";
import {
  BASE_URL,
  DATASET_DOI,
  DATASET_DOI_URL,
  FOUNDER,
  ORGANIZATION,
} from "@/lib/seo/entity";
import {
  LAST_VERIFIED_DATE,
  NEXT_REVIEW_DATE,
} from "@/lib/seo/freshness";

// ---------------------------------------------------------------------------
// Static metadata
// ---------------------------------------------------------------------------

/** Public stable slug for the dataset bundle. Used in download filenames. */
export const DATASET_SLUG = "indie-saas-teardowns" as const;

/** SemVer for the dataset. See "Versioning contract" in the file header. */
export const DATASET_VERSION = "1.0.0" as const;

/** Human-friendly name. Used in JSON-LD and on the landing page. */
export const DATASET_NAME = "Indie SaaS Teardowns Dataset" as const;

/**
 * SPDX identifier for the license. CC-BY-4.0 is the right pick for an
 * editorial corpus: re-use is unrestricted, attribution is required, no
 * share-alike obligation that would scare commercial use.
 */
export const DATASET_LICENSE_SPDX = "CC-BY-4.0" as const;
export const DATASET_LICENSE_URL =
  "https://creativecommons.org/licenses/by/4.0/" as const;

/**
 * Attribution string a re-user is required to display. Matches the
 * CC-BY-4.0 "appropriate credit" requirement. Includes the canonical
 * landing URL so the backlink is unambiguous.
 */
export const DATASET_ATTRIBUTION = `Source: ${ORGANIZATION.name} — Indie SaaS Teardowns Dataset (${BASE_URL}/dataset). Licensed under ${DATASET_LICENSE_SPDX}.` as const;

/**
 * Plain-text citation for academic / newsletter footnote use.
 *
 * DOI is appended only when DATASET_DOI is set – the Zenodo deposit
 * publishes a real DOI and the operator pastes it on Vercel. Until
 * then the citation resolves via the canonical landing URL (still
 * citable, but without the DOI's redirect-stability guarantee).
 *
 * Brunson Hard-Rule: the DOI substring never appears when the bare
 * DOI does not resolve. A consumer copying the citation always gets
 * exactly the identifiers the dataset publishes.
 */
export const DATASET_CITATION: string = (() => {
  const base = `${FOUNDER.name} (${LAST_VERIFIED_DATE}). ${DATASET_NAME}, v${DATASET_VERSION}. ${ORGANIZATION.name}. ${BASE_URL}/dataset. ${DATASET_LICENSE_SPDX}.`;
  return DATASET_DOI_URL ? `${base} DOI: ${DATASET_DOI_URL}.` : base;
})();

/**
 * BibTeX entry for academic re-use. When DATASET_DOI is set the entry
 * carries the canonical `doi = {...}` field – the single most-cited
 * BibTeX key in academic literature, and the field every reference
 * manager (Zotero, Mendeley, EndNote) prefers over `howpublished`.
 */
export const DATASET_BIBTEX: string = (() => {
  const versionSlug = DATASET_VERSION.replace(/\./g, "_");
  const lines: string[] = [
    `@misc{unlocksaas_indie_saas_teardowns_${versionSlug},`,
    `  author       = {${FOUNDER.name}},`,
    `  title        = {{${DATASET_NAME}}},`,
    `  howpublished = {\\url{${BASE_URL}/dataset}},`,
    `  year         = {${LAST_VERIFIED_DATE.slice(0, 4)}},`,
  ];
  if (DATASET_DOI) {
    lines.push(`  doi          = {${DATASET_DOI}},`);
  }
  lines.push(
    `  note         = {Version ${DATASET_VERSION}. Licensed under ${DATASET_LICENSE_SPDX}.}`,
    `}`,
  );
  return lines.join("\n");
})();

/**
 * Canonical URLs for the download surfaces and the landing page. The
 * `doi` slot resolves to `https://doi.org/<bare-doi>` when the Zenodo
 * deposit is live, otherwise it stays undefined. Consumers that render
 * the citation block branch on its presence.
 */
export const DATASET_URLS: Readonly<{
  landing: string;
  json: string;
  csv: string;
  markdown: string;
  doi: string | undefined;
}> = Object.freeze({
  landing: `${BASE_URL}/dataset`,
  json: `${BASE_URL}/dataset/${DATASET_SLUG}.json`,
  csv: `${BASE_URL}/dataset/${DATASET_SLUG}.csv`,
  markdown: `${BASE_URL}/dataset.md`,
  doi: DATASET_DOI_URL,
});

/**
 * Alternate dataset names – includes the slug, the slug as Hugging Face
 * would render it (`unlocksaas/indie-saas-teardowns`), and a short form.
 * Schema.org `Dataset.alternateName` is a recognised cross-catalog
 * resolution key – Dataset Search and HF both treat alternate names as
 * additional retrieval anchors.
 */
export const DATASET_ALTERNATE_NAMES: readonly string[] = Object.freeze([
  DATASET_SLUG,
  `unlocksaas/${DATASET_SLUG}`,
  "Indie SaaS Teardowns",
]);

/**
 * Measurement technique – Dataset Search's recommended methodology field.
 * Plain-English description of how the rows were produced. Mirrors the
 * "How this was built" section on the /dataset landing page and the
 * editorial-policy anchor so a crawler that walks the schema graph never
 * sees a methodology claim absent from the rendered HTML.
 *
 * Brunson Hard-Rule reconciliation: the editorial method is the moat. A
 * dataset with a documented, dated, corrections-tracked editorial method
 * is a fundamentally different artifact from a scrape – and stating that
 * method in machine-readable form is how Dataset Search disambiguates.
 */
export const DATASET_MEASUREMENT_TECHNIQUE =
  "Editorial corpus. Every row is a re-projection of a published page on unlocksaas.com. Each source page is authored by the founder, dated with an ISO lastVerified field, and reviewed against the public editorial policy at https://unlocksaas.com/editorial-policy before publication. No scraping, no inferred metrics, no fabricated review counts. Corrections are logged publicly in the editorial-policy corrections log." as const;

/**
 * Schema.org `Dataset.identifier` – stable, version-pinned identifier for
 * the bundle. Includes the canonical URL so a downstream crawler that
 * walks the identifier resolves to the landing page. Used in addition to
 * any external DOI / HF repo slug (added at runtime when the env vars are
 * set – see `DATASET_EXTERNAL_REGISTRATIONS`).
 */
export const DATASET_PRIMARY_IDENTIFIER = `${BASE_URL}/dataset#${DATASET_SLUG}-v${DATASET_VERSION}` as const;

/**
 * Top-level keywords for `Dataset.keywords` JSON-LD. Each is a real
 * search class addressed by at least one row in the bundle. No keyword
 * stuffing — every term below is also present in the body copy of one
 * of the five source catalogs.
 */
export const DATASET_KEYWORDS: readonly string[] = Object.freeze([
  "indie SaaS",
  "indie hackers",
  "SaaS funnel teardown",
  "SaaS pricing teardown",
  "SaaS comparison",
  "SaaS alternatives",
  "Russell Brunson Hook Story Offer",
  "Value Ladder",
  "founder marketing dataset",
  "open SaaS data",
]);

// ---------------------------------------------------------------------------
// Bundle assembly (JSON)
// ---------------------------------------------------------------------------

/**
 * Schema documentation embedded in the JSON bundle so a downloader who
 * pops the file open in `jq` immediately knows what each table contains
 * and how the columns map back to the source catalog. This is the
 * "self-describing dataset" pattern — every academic dataset that earns
 * citation does this.
 *
 * The descriptions are intentionally short. The full schema lives in
 * the TypeScript interfaces in the source catalogs. A consumer who
 * wants the strict types can read those; a consumer who just wants to
 * load the CSV into pandas only needs these.
 */
const TABLE_DESCRIPTIONS = Object.freeze({
  funnel_teardowns: {
    description:
      "Indie SaaS marketing funnels analyzed through Russell Brunson's Hook / Story / Offer framework. Each row is a single company with hook, story, offer pattern analysis, what's working, what to adapt, what to avoid, and FAQs.",
    canonicalUrlPattern: `${BASE_URL}/funnel-teardown/{slug}`,
    sourceCatalog: "src/lib/funnel-teardowns.ts",
  },
  pricing_teardowns: {
    description:
      "Indie SaaS pricing models broken down by tier structure, anchor mechanics, upgrade triggers, and payment mechanics. Approximate prices with dated lastVerified.",
    canonicalUrlPattern: `${BASE_URL}/pricing-teardown/{slug}`,
    sourceCatalog: "src/lib/pricing-teardowns.ts",
  },
  comparisons: {
    description:
      "Symmetric head-to-head 'A vs B' comparisons. Each row carries best-for fields, pick-A-if / pick-B-if lists, six to nine evaluated dimensions, an honest take, and a recommendation tailored for indie SaaS founders.",
    canonicalUrlPattern: `${BASE_URL}/vs/{slug}`,
    sourceCatalog: "src/lib/comparisons.ts",
  },
  alternatives: {
    description:
      "Honest named-competitor comparison pages. Each row respects the competitor's real value proposition and names the category difference, not a quality gap.",
    canonicalUrlPattern: `${BASE_URL}/alternatives-to/{slug}`,
    sourceCatalog: "src/lib/alternatives.ts",
  },
  categories: {
    description:
      "Canonical category buckets used to group funnel teardowns, pricing teardowns, and comparisons into category roundup pages.",
    canonicalUrlPattern: `${BASE_URL}/category/{slug}`,
    sourceCatalog: "src/lib/categories.ts",
  },
});

/**
 * Read-only types for the bundle. Mirroring the source catalog types
 * with `Readonly<...>` lets a downstream consumer that imports this
 * module's types know the bundle is immutable.
 *
 * The bundle uses the same shape as the source catalogs (no field
 * renaming) so an integrator who already knows the codebase can plug
 * the bundle into existing TS without an adapter.
 */
export interface DatasetBundle {
  $schema: string;
  name: typeof DATASET_NAME;
  slug: typeof DATASET_SLUG;
  version: typeof DATASET_VERSION;
  description: string;
  generatedAt: string;
  lastVerified: typeof LAST_VERIFIED_DATE;
  nextReview: typeof NEXT_REVIEW_DATE;
  /**
   * Bare DOI in `10.<registrant>/<suffix>` form when the Zenodo deposit
   * is live. Omitted when undefined so JSON.stringify drops it from the
   * downloaded bundle – a consumer that finds the field MUST be able
   * to resolve it via `https://doi.org/<doi>`.
   */
  doi?: string;
  /**
   * Resolvable DOI URL (`https://doi.org/<bare-doi>`) when DOI is set.
   * Omitted when undefined. Mirrors DATASET_URLS.doi for downstream
   * consumers that prefer URL fields over identifier fields.
   */
  doiUrl?: string;
  license: {
    spdx: typeof DATASET_LICENSE_SPDX;
    url: typeof DATASET_LICENSE_URL;
    attribution: typeof DATASET_ATTRIBUTION;
  };
  publisher: {
    name: string;
    url: string;
    email: string;
  };
  creator: {
    name: string;
    url: string;
    jobTitle: string;
  };
  citation: typeof DATASET_CITATION;
  bibtex: typeof DATASET_BIBTEX;
  urls: typeof DATASET_URLS;
  keywords: readonly string[];
  counts: Readonly<{
    funnel_teardowns: number;
    pricing_teardowns: number;
    comparisons: number;
    alternatives: number;
    categories: number;
    total_rows: number;
  }>;
  tables: Readonly<{
    funnel_teardowns: ReadonlyArray<FunnelTeardown>;
    pricing_teardowns: ReadonlyArray<PricingTeardown>;
    comparisons: ReadonlyArray<Comparison>;
    alternatives: ReadonlyArray<Alternative>;
    categories: ReadonlyArray<CategoryDef>;
  }>;
  schema: typeof TABLE_DESCRIPTIONS;
}

/**
 * Build the bundle at module load. The catalogs themselves are pure
 * data (no I/O), so this is build-time work — no per-request cost.
 *
 * `generatedAt` is the deployment time, which is honest for a static
 * bundle. The freshness signal that matters for re-use is
 * `lastVerified`, which carries through from the editorial review.
 */
function assembleDatasetBundle(): DatasetBundle {
  return {
    $schema: `${BASE_URL}/dataset/${DATASET_SLUG}.json#v${DATASET_VERSION.split(".")[0]}`,
    name: DATASET_NAME,
    slug: DATASET_SLUG,
    version: DATASET_VERSION,
    description:
      "An open editorial dataset of indie SaaS marketing analysis: funnel teardowns, pricing teardowns, head-to-head comparisons, named-competitor alternative pages, and canonical category buckets. Every row is independently verifiable against the matching page on unlocksaas.com and carries a dated lastVerified field.",
    generatedAt: new Date().toISOString(),
    lastVerified: LAST_VERIFIED_DATE,
    nextReview: NEXT_REVIEW_DATE,
    // DOI fields ship only when the Zenodo deposit is live. JSON.stringify
    // omits undefined keys from objects, so the downloaded bundle stays
    // honest – no `"doi": null` artifact, no fabricated identifier.
    ...(DATASET_DOI ? { doi: DATASET_DOI } : {}),
    ...(DATASET_DOI_URL ? { doiUrl: DATASET_DOI_URL } : {}),
    license: {
      spdx: DATASET_LICENSE_SPDX,
      url: DATASET_LICENSE_URL,
      attribution: DATASET_ATTRIBUTION,
    },
    publisher: {
      name: ORGANIZATION.name,
      url: ORGANIZATION.url,
      email: ORGANIZATION.email,
    },
    creator: {
      name: FOUNDER.name,
      url: `${BASE_URL}/about`,
      jobTitle: FOUNDER.jobTitle,
    },
    citation: DATASET_CITATION,
    bibtex: DATASET_BIBTEX,
    urls: DATASET_URLS,
    keywords: DATASET_KEYWORDS,
    counts: {
      funnel_teardowns: TEARDOWNS.length,
      pricing_teardowns: PRICING_TEARDOWNS.length,
      comparisons: COMPARISONS.length,
      alternatives: ALTERNATIVES.length,
      categories: CATEGORIES.length,
      total_rows:
        TEARDOWNS.length +
        PRICING_TEARDOWNS.length +
        COMPARISONS.length +
        ALTERNATIVES.length +
        CATEGORIES.length,
    },
    tables: {
      funnel_teardowns: TEARDOWNS,
      pricing_teardowns: PRICING_TEARDOWNS,
      comparisons: COMPARISONS,
      alternatives: ALTERNATIVES,
      categories: CATEGORIES,
    },
    schema: TABLE_DESCRIPTIONS,
  };
}

/**
 * Pre-built bundle. Hoisted to module scope per the
 * `server-hoist-static-io` pattern from the React Best Practices guide.
 * Importers receive a stable reference per server boot; per-render
 * allocation cost is zero.
 */
export const DATASET_BUNDLE: DatasetBundle = Object.freeze(
  assembleDatasetBundle(),
) as DatasetBundle;

/**
 * Pre-serialized JSON. `JSON.stringify` runs once at module load. The
 * route handler returns this string with the right headers — no
 * per-request serialization cost. The pretty-print keeps the download
 * human-readable when opened in a browser.
 */
export const DATASET_BUNDLE_JSON: string = JSON.stringify(
  DATASET_BUNDLE,
  null,
  2,
);

// ---------------------------------------------------------------------------
// CSV projection (flat denormalized row-per-entry)
// ---------------------------------------------------------------------------

/**
 * Stable CSV column order. Once published, this order MUST stay
 * append-only — re-users that load the CSV by column index break
 * silently otherwise.
 *
 * The shape is the universal "this row exists, here's the citable
 * summary" projection. Detailed nested fields (FAQs, dimensions, tier
 * lists) are JSON-only — flattening them into CSV produces a worse
 * file for both pandas users and spreadsheet users.
 */
export const DATASET_CSV_COLUMNS = Object.freeze([
  "record_type",
  "slug",
  "name_a",
  "name_b",
  "category",
  "one_line",
  "tldr",
  "creator",
  "homepage_url_a",
  "homepage_url_b",
  "tags",
  "last_verified",
  "canonical_url",
  "markdown_url",
] as const);

export type DatasetCsvColumn = (typeof DATASET_CSV_COLUMNS)[number];
export type DatasetCsvRow = Record<DatasetCsvColumn, string>;

/**
 * RFC 4180 CSV-field escaping. Wraps a field in quotes when it contains
 * a delimiter, quote, or newline; doubles internal quotes; converts
 * undefined to empty string.
 *
 * Hoisted regex per `js-hoist-regexp` from the React Best Practices
 * guide.
 */
const CSV_NEEDS_QUOTING = /[",\r\n]/;

function csvEscape(value: string | undefined): string {
  if (value === undefined || value === null) return "";
  const stringified = String(value);
  if (!CSV_NEEDS_QUOTING.test(stringified)) {
    return stringified;
  }
  return `"${stringified.replace(/"/g, '""')}"`;
}

/**
 * Per-record-type projectors. Each returns a complete CsvRow so the
 * downstream serializer iterates a single array, not five.
 *
 * The projection is intentionally lossy — only the citable summary
 * survives. The full structured fields are JSON-only.
 */
function projectFunnelTeardown(row: FunnelTeardown): DatasetCsvRow {
  return {
    record_type: "funnel_teardown",
    slug: row.slug,
    name_a: row.displayName,
    name_b: "",
    category: row.category,
    one_line: row.oneLine,
    tldr: row.tldr,
    creator: row.creator ?? "",
    homepage_url_a: row.homepageUrl ?? "",
    homepage_url_b: "",
    tags: row.tags.join("|"),
    last_verified: row.lastVerified,
    canonical_url: `${BASE_URL}/funnel-teardown/${row.slug}`,
    markdown_url: `${BASE_URL}/funnel-teardown/${row.slug}/md`,
  };
}

function projectPricingTeardown(row: PricingTeardown): DatasetCsvRow {
  return {
    record_type: "pricing_teardown",
    slug: row.slug,
    name_a: row.displayName,
    name_b: "",
    category: row.category,
    one_line: row.oneLine,
    tldr: row.tldr,
    creator: row.creator ?? "",
    homepage_url_a: row.homepageUrl ?? "",
    homepage_url_b: "",
    tags: row.tags.join("|"),
    last_verified: row.lastVerified,
    canonical_url: `${BASE_URL}/pricing-teardown/${row.slug}`,
    markdown_url: `${BASE_URL}/pricing-teardown/${row.slug}/md`,
  };
}

function projectComparison(row: Comparison): DatasetCsvRow {
  return {
    record_type: "comparison",
    slug: row.slug,
    name_a: row.a.name,
    name_b: row.b.name,
    category: row.category,
    one_line: row.oneLine,
    tldr: row.tldr,
    creator: "",
    homepage_url_a: row.a.url ?? "",
    homepage_url_b: row.b.url ?? "",
    tags: row.tags.join("|"),
    last_verified: row.lastVerified,
    canonical_url: `${BASE_URL}/vs/${row.slug}`,
    markdown_url: `${BASE_URL}/vs/${row.slug}/md`,
  };
}

function projectAlternative(row: Alternative): DatasetCsvRow {
  return {
    record_type: "alternative",
    slug: row.slug,
    name_a: row.displayName,
    name_b: "",
    category: row.category,
    one_line: row.oneLine,
    tldr: "",
    creator: row.creator ?? "",
    homepage_url_a: row.homepageUrl ?? "",
    homepage_url_b: "",
    tags: (row.tags ?? []).join("|"),
    last_verified: row.lastVerified,
    canonical_url: `${BASE_URL}/alternatives-to/${row.slug}`,
    markdown_url: `${BASE_URL}/alternatives-to/${row.slug}/md`,
  };
}

function projectCategory(row: CategoryDef): DatasetCsvRow {
  return {
    record_type: "category",
    slug: row.slug,
    name_a: row.displayName,
    name_b: "",
    category: row.displayName,
    one_line: row.oneLine,
    tldr: row.intent,
    creator: "",
    homepage_url_a: "",
    homepage_url_b: "",
    tags: row.tags.join("|"),
    last_verified: LAST_VERIFIED_DATE,
    canonical_url: `${BASE_URL}/category/${row.slug}`,
    markdown_url: `${BASE_URL}/category/${row.slug}/md`,
  };
}

/**
 * Build the flat CSV at module load. Order across record types is
 * stable: funnel_teardowns, pricing_teardowns, comparisons,
 * alternatives, categories. Within each block, the source-catalog
 * iteration order is preserved.
 */
function assembleDatasetCsv(): string {
  const rows: DatasetCsvRow[] = [
    ...TEARDOWNS.map(projectFunnelTeardown),
    ...PRICING_TEARDOWNS.map(projectPricingTeardown),
    ...COMPARISONS.map(projectComparison),
    ...ALTERNATIVES.map(projectAlternative),
    ...CATEGORIES.map(projectCategory),
  ];

  const header = DATASET_CSV_COLUMNS.join(",");
  const body = rows
    .map((r) =>
      DATASET_CSV_COLUMNS.map((col) => csvEscape(r[col])).join(","),
    )
    .join("\r\n");

  // RFC 4180: CRLF line terminator, trailing CRLF optional. We include
  // a trailing CRLF for byte-level reproducibility — easier for hash-
  // checked re-uses.
  return `${header}\r\n${body}\r\n`;
}

/**
 * Pre-built CSV. Same hoist pattern as DATASET_BUNDLE_JSON. The route
 * handler returns this string verbatim.
 */
export const DATASET_BUNDLE_CSV: string = assembleDatasetCsv();

// ---------------------------------------------------------------------------
// Per-table CSVs (richer, table-specific columns)
// ---------------------------------------------------------------------------

/**
 * The bundled CSV above is a UNIVERSAL projection — a thin slice of
 * every row across all five tables, flattened into one column shape so
 * a `record_type` discriminator can pick a row's type.
 *
 * The per-table CSVs below are the COMPLEMENT: one file per record
 * type, with columns specific to that table's structure. A consumer
 * who only wants funnel teardowns gets a 33-row file with 28 columns
 * tailored to funnel analysis, not a 153-row file with 14 universal
 * columns and 5 different shapes hiding behind `record_type`.
 *
 * Both are intentional. The bundle CSV is for indexers, leaderboard-
 * style aggregators, and one-line `pd.read_csv` workflows. The
 * per-table CSVs are for downstream analyses that respect each
 * record type's actual schema.
 *
 * Stable column-order contract applies to each table independently.
 * Append-only — once published, a column's index does not move.
 */

/** Pipe-separated join for list-typed cells. The pipe is escape-free
 *  in unquoted CSV and survives Excel paste without auto-conversion. */
const LIST_JOIN = "|";

function buildCsv<Col extends string>(
  columns: ReadonlyArray<Col>,
  rows: ReadonlyArray<Record<Col, string>>,
): string {
  const header = columns.join(",");
  const body = rows
    .map((row) => columns.map((c) => csvEscape(row[c])).join(","))
    .join("\r\n");
  return `${header}\r\n${body}\r\n`;
}

// ---- funnel_teardowns ------------------------------------------------------

export const FUNNEL_TEARDOWN_CSV_COLUMNS = Object.freeze([
  "slug",
  "display_name",
  "creator",
  "category",
  "one_line",
  "tldr",
  "what_they_sell",
  "who_for",
  "pricing_note",
  "hook_pattern",
  "hook_analysis",
  "story_pattern",
  "story_analysis",
  "offer_pattern",
  "offer_analysis",
  "whats_working",
  "what_to_adapt",
  "what_to_avoid",
  "brunson_hook",
  "brunson_story",
  "brunson_offer",
  "brunson_value_ladder_tier",
  "tags",
  "homepage_url",
  "last_verified",
  "canonical_url",
  "markdown_url",
] as const);
type FunnelTeardownCol = (typeof FUNNEL_TEARDOWN_CSV_COLUMNS)[number];

function projectFunnelTeardownRich(
  row: FunnelTeardown,
): Record<FunnelTeardownCol, string> {
  return {
    slug: row.slug,
    display_name: row.displayName,
    creator: row.creator ?? "",
    category: row.category,
    one_line: row.oneLine,
    tldr: row.tldr,
    what_they_sell: row.productSnapshot.whatTheySell,
    who_for: row.productSnapshot.whoFor,
    pricing_note: row.productSnapshot.pricingNote,
    hook_pattern: row.hook.pattern,
    hook_analysis: row.hook.analysis,
    story_pattern: row.story.pattern,
    story_analysis: row.story.analysis,
    offer_pattern: row.offer.pattern,
    offer_analysis: row.offer.analysis,
    whats_working: row.whatsWorking.join(LIST_JOIN),
    what_to_adapt: row.whatToAdapt.join(LIST_JOIN),
    what_to_avoid: row.whatToAvoid.join(LIST_JOIN),
    brunson_hook: row.brunsonLens.hook,
    brunson_story: row.brunsonLens.story,
    brunson_offer: row.brunsonLens.offer,
    brunson_value_ladder_tier: row.brunsonLens.valueLadderTier,
    tags: row.tags.join(LIST_JOIN),
    homepage_url: row.homepageUrl ?? "",
    last_verified: row.lastVerified,
    canonical_url: `${BASE_URL}/funnel-teardown/${row.slug}`,
    markdown_url: `${BASE_URL}/funnel-teardown/${row.slug}/md`,
  };
}

export const FUNNEL_TEARDOWN_CSV: string = buildCsv(
  FUNNEL_TEARDOWN_CSV_COLUMNS,
  TEARDOWNS.map(projectFunnelTeardownRich),
);

// ---- pricing_teardowns -----------------------------------------------------

export const PRICING_TEARDOWN_CSV_COLUMNS = Object.freeze([
  "slug",
  "display_name",
  "creator",
  "category",
  "one_line",
  "tldr",
  "what_they_sell",
  "who_for",
  "pricing_model",
  "payment_frequency",
  "free_trial_behavior",
  "tier_count",
  "anchor_pattern",
  "anchor_analysis",
  "upgrade_trigger_pattern",
  "upgrade_trigger_analysis",
  "whats_working",
  "what_to_adapt",
  "what_to_avoid",
  "brunson_stack",
  "brunson_value_ladder",
  "brunson_decoy_or_anchor",
  "brunson_payment_mechanics",
  "tags",
  "homepage_url",
  "pricing_page_url",
  "last_verified",
  "canonical_url",
  "markdown_url",
] as const);
type PricingTeardownCol = (typeof PRICING_TEARDOWN_CSV_COLUMNS)[number];

function projectPricingTeardownRich(
  row: PricingTeardown,
): Record<PricingTeardownCol, string> {
  return {
    slug: row.slug,
    display_name: row.displayName,
    creator: row.creator ?? "",
    category: row.category,
    one_line: row.oneLine,
    tldr: row.tldr,
    what_they_sell: row.productSnapshot.whatTheySell,
    who_for: row.productSnapshot.whoFor,
    pricing_model: row.pricingStructure.model,
    payment_frequency: row.pricingStructure.paymentFrequency,
    free_trial_behavior: row.pricingStructure.freeTrialBehavior,
    tier_count: String(row.pricingStructure.tiers.length),
    anchor_pattern: row.anchorAnalysis.pattern,
    anchor_analysis: row.anchorAnalysis.analysis,
    upgrade_trigger_pattern: row.upgradeTrigger.pattern,
    upgrade_trigger_analysis: row.upgradeTrigger.analysis,
    whats_working: row.whatsWorking.join(LIST_JOIN),
    what_to_adapt: row.whatToAdapt.join(LIST_JOIN),
    what_to_avoid: row.whatToAvoid.join(LIST_JOIN),
    brunson_stack: row.brunsonLens.stack,
    brunson_value_ladder: row.brunsonLens.valueLadder,
    brunson_decoy_or_anchor: row.brunsonLens.decoyOrAnchor,
    brunson_payment_mechanics: row.brunsonLens.paymentMechanics,
    tags: row.tags.join(LIST_JOIN),
    homepage_url: row.homepageUrl ?? "",
    pricing_page_url: row.pricingPageUrl ?? "",
    last_verified: row.lastVerified,
    canonical_url: `${BASE_URL}/pricing-teardown/${row.slug}`,
    markdown_url: `${BASE_URL}/pricing-teardown/${row.slug}/md`,
  };
}

export const PRICING_TEARDOWN_CSV: string = buildCsv(
  PRICING_TEARDOWN_CSV_COLUMNS,
  PRICING_TEARDOWNS.map(projectPricingTeardownRich),
);

// ---- comparisons -----------------------------------------------------------

export const COMPARISON_CSV_COLUMNS = Object.freeze([
  "slug",
  "name_a",
  "name_b",
  "teardown_slug_a",
  "teardown_slug_b",
  "url_a",
  "url_b",
  "category",
  "one_line",
  "tldr",
  "best_for_a",
  "best_for_b",
  "pick_a_if",
  "pick_b_if",
  "dimension_count",
  "honest_take",
  "for_indie_founders_pick",
  "for_indie_founders_reasoning",
  "tags",
  "last_verified",
  "canonical_url",
  "markdown_url",
] as const);
type ComparisonCol = (typeof COMPARISON_CSV_COLUMNS)[number];

function projectComparisonRich(row: Comparison): Record<ComparisonCol, string> {
  return {
    slug: row.slug,
    name_a: row.a.name,
    name_b: row.b.name,
    teardown_slug_a: row.a.teardownSlug ?? "",
    teardown_slug_b: row.b.teardownSlug ?? "",
    url_a: row.a.url ?? "",
    url_b: row.b.url ?? "",
    category: row.category,
    one_line: row.oneLine,
    tldr: row.tldr,
    best_for_a: row.bestFor.a,
    best_for_b: row.bestFor.b,
    pick_a_if: row.pickAIf.join(LIST_JOIN),
    pick_b_if: row.pickBIf.join(LIST_JOIN),
    dimension_count: String(row.dimensions.length),
    honest_take: row.honestTake,
    for_indie_founders_pick: row.forIndieFounders.pick,
    for_indie_founders_reasoning: row.forIndieFounders.reasoning,
    tags: row.tags.join(LIST_JOIN),
    last_verified: row.lastVerified,
    canonical_url: `${BASE_URL}/vs/${row.slug}`,
    markdown_url: `${BASE_URL}/vs/${row.slug}/md`,
  };
}

export const COMPARISON_CSV: string = buildCsv(
  COMPARISON_CSV_COLUMNS,
  COMPARISONS.map(projectComparisonRich),
);

// ---- alternatives ----------------------------------------------------------

export const ALTERNATIVE_CSV_COLUMNS = Object.freeze([
  "slug",
  "display_name",
  "creator",
  "category",
  "one_line",
  "what_it_is",
  "what_it_is_not",
  "who_for_it",
  "who_not_for_it",
  "honest_verdict",
  "pricing_note",
  "capability_count",
  "tags",
  "homepage_url",
  "last_verified",
  "canonical_url",
  "markdown_url",
] as const);
type AlternativeCol = (typeof ALTERNATIVE_CSV_COLUMNS)[number];

function projectAlternativeRich(
  row: Alternative,
): Record<AlternativeCol, string> {
  const capabilityCount = Object.values(row.capabilities).filter(
    (v) => v === true,
  ).length;
  return {
    slug: row.slug,
    display_name: row.displayName,
    creator: row.creator ?? "",
    category: row.category,
    one_line: row.oneLine,
    what_it_is: row.whatItIs.join(LIST_JOIN),
    what_it_is_not: row.whatItIsNot.join(LIST_JOIN),
    who_for_it: row.whoForIt,
    who_not_for_it: row.whoNotForIt,
    honest_verdict: row.honestVerdict,
    pricing_note: row.pricingNote,
    capability_count: String(capabilityCount),
    tags: (row.tags ?? []).join(LIST_JOIN),
    homepage_url: row.homepageUrl ?? "",
    last_verified: row.lastVerified,
    canonical_url: `${BASE_URL}/alternatives-to/${row.slug}`,
    markdown_url: `${BASE_URL}/alternatives-to/${row.slug}/md`,
  };
}

export const ALTERNATIVE_CSV: string = buildCsv(
  ALTERNATIVE_CSV_COLUMNS,
  ALTERNATIVES.map(projectAlternativeRich),
);

// ---- categories ------------------------------------------------------------

export const CATEGORY_CSV_COLUMNS = Object.freeze([
  "slug",
  "display_name",
  "one_line",
  "intent",
  "matchers",
  "tags",
  "canonical_url",
  "markdown_url",
] as const);
type CategoryCol = (typeof CATEGORY_CSV_COLUMNS)[number];

function projectCategoryRich(row: CategoryDef): Record<CategoryCol, string> {
  return {
    slug: row.slug,
    display_name: row.displayName,
    one_line: row.oneLine,
    intent: row.intent,
    matchers: row.matchers.join(LIST_JOIN),
    tags: row.tags.join(LIST_JOIN),
    canonical_url: `${BASE_URL}/category/${row.slug}`,
    markdown_url: `${BASE_URL}/category/${row.slug}/md`,
  };
}

export const CATEGORY_CSV: string = buildCsv(
  CATEGORY_CSV_COLUMNS,
  CATEGORIES.map(projectCategoryRich),
);

/**
 * Per-table CSV registry. Keys match the table names used in the JSON
 * bundle (`DATASET_BUNDLE.tables.<key>`) and the path segments of the
 * per-table download routes (`/dataset/tables/<key>.csv`). The route
 * handlers read this map; adding a new table is a single
 * Object.freeze() addition here plus a new route handler file.
 */
export const DATASET_PER_TABLE_CSV = Object.freeze({
  "funnel-teardowns": {
    body: FUNNEL_TEARDOWN_CSV,
    columns: FUNNEL_TEARDOWN_CSV_COLUMNS,
    rowCount: TEARDOWNS.length,
    displayName: "Funnel teardowns",
    sourceTable: "funnel_teardowns",
  },
  "pricing-teardowns": {
    body: PRICING_TEARDOWN_CSV,
    columns: PRICING_TEARDOWN_CSV_COLUMNS,
    rowCount: PRICING_TEARDOWNS.length,
    displayName: "Pricing teardowns",
    sourceTable: "pricing_teardowns",
  },
  comparisons: {
    body: COMPARISON_CSV,
    columns: COMPARISON_CSV_COLUMNS,
    rowCount: COMPARISONS.length,
    displayName: "Head-to-head comparisons",
    sourceTable: "comparisons",
  },
  alternatives: {
    body: ALTERNATIVE_CSV,
    columns: ALTERNATIVE_CSV_COLUMNS,
    rowCount: ALTERNATIVES.length,
    displayName: "Named-competitor alternatives",
    sourceTable: "alternatives",
  },
  categories: {
    body: CATEGORY_CSV,
    columns: CATEGORY_CSV_COLUMNS,
    rowCount: CATEGORIES.length,
    displayName: "Category buckets",
    sourceTable: "categories",
  },
});

export type DatasetPerTableSlug = keyof typeof DATASET_PER_TABLE_CSV;

export const DATASET_PER_TABLE_SLUGS: readonly DatasetPerTableSlug[] =
  Object.freeze([
    "funnel-teardowns",
    "pricing-teardowns",
    "comparisons",
    "alternatives",
    "categories",
  ] as const);

/** Per-table download URL helper. Mirrors DATASET_URLS for consistency. */
export function perTableCsvUrl(slug: DatasetPerTableSlug): string {
  return `${BASE_URL}/dataset/tables/${slug}.csv`;
}
