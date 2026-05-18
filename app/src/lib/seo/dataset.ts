/**
 * Public dataset surface — license-anchored open data, backlink-by-design.
 *
 * Off-page strategy
 * -----------------
 * The pSEO catalogs (alternatives, funnel teardowns, pricing teardowns,
 * comparisons, categories) are the most distinctive analytical asset
 * UnlockSaaS ships. Publishing them as a *citable open dataset* is the
 * highest-leverage off-page move available without outbound outreach:
 *
 *   1. A "Show HN: 157-row dataset of indie SaaS funnel + pricing
 *      teardowns" post is a real shot at DR-92 cascade traffic.
 *   2. Every academic / analyst / blogger who cites the data must
 *      attribute under CC-BY-4.0, which is a mandatory backlink. The
 *      Brunson Hard-Rule respects this because the attribution is
 *      legally required by the license the founder chose, not a
 *      reciprocity gimmick.
 *   3. The dataset's lastVerified discipline (every row carries an ISO
 *      date) is itself a citation signal — researchers prefer dated
 *      data over undated.
 *
 * License choice
 * --------------
 * CC-BY-4.0 (Creative Commons Attribution 4.0 International). The choice
 * is deliberate against the alternatives:
 *
 *   - CC0 / Public Domain: dropping attribution forfeits the backlink.
 *     We are publishing primarily to gain the backlink graph; CC0 would
 *     defeat the purpose.
 *   - CC-BY-NC: prohibiting commercial use blocks the audience that
 *     would cite us most (industry analysts, paid SaaS newsletters).
 *     The dataset is small and the attribution clause already makes
 *     "rip and resell" obvious bad faith.
 *   - CC-BY-SA: ShareAlike forces downstream re-publishers into copyleft,
 *     which scares off corporate citers. Lower citation rate.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - No fabricated rows. The dataset is a 1:1 export of the source-of-
 *     truth catalogs that already power the live pSEO surfaces.
 *   - lastVerified preserved on every row. Stale rows stay stale; we
 *     do not bump the timestamp when we export.
 *   - Attribution notice in every payload AND every response header.
 *   - No tracking pixel, no telemetry, no auth gate. Plain GET, plain
 *     file. Edge-cacheable.
 */

import {
  ALTERNATIVES,
  type Alternative,
} from "@/lib/alternatives";
import {
  TEARDOWNS,
  type FunnelTeardown,
} from "@/lib/funnel-teardowns";
import {
  PRICING_TEARDOWNS,
  type PricingTeardown,
} from "@/lib/pricing-teardowns";
import {
  COMPARISONS,
  type Comparison,
} from "@/lib/comparisons";
import {
  CATEGORIES,
  type CategoryDef,
} from "@/lib/categories";

// ── license + attribution constants ─────────────────────────────────────────

/**
 * Canonical license identifier. Matches the SPDX identifier so dataset
 * indexers (Kaggle, Hugging Face, data.world) read it without manual
 * configuration. ALSO matches the JSON-LD `license` URL on the dataset
 * hub page so structured data and the response header agree.
 */
export const DATASET_LICENSE = {
  spdx: "CC-BY-4.0",
  name: "Creative Commons Attribution 4.0 International",
  url: "https://creativecommons.org/licenses/by/4.0/",
} as const;

/**
 * Attribution string downstream users must include. Same text in the
 * HTTP `X-License-Notice` header, in every JSON payload's metadata
 * envelope, and in the README at the top of the dataset hub page. The
 * canonical URL is the citation target — that is the backlink we earn.
 */
export const DATASET_ATTRIBUTION =
  "Source: Unlock SaaS Indie SaaS Teardowns Dataset, https://unlocksaas.com/dataset, Maryan, CC-BY-4.0.";

/**
 * Dataset version. Bump when a NEW catalog is added, a column is
 * renamed, or a row is removed. Adding rows or refreshing lastVerified
 * does NOT bump the major; it is a free-flowing data refresh.
 *
 * Semantic versioning per https://schema.org/version conventions:
 *   MAJOR.MINOR.PATCH
 *     MAJOR — breaking schema change (column rename, type change)
 *     MINOR — new catalog or new column
 *     PATCH — row additions, lastVerified refresh
 */
export const DATASET_VERSION = "1.0.0";

/**
 * ISO-8601 publish date of the current MAJOR version. Updates only on
 * MAJOR bumps (schema breaks). Used as `datePublished` on the Dataset
 * JSON-LD; per-row freshness is on each row's `lastVerified`.
 */
export const DATASET_PUBLISHED_AT = "2026-05-18";

// ── envelope ────────────────────────────────────────────────────────────────

/**
 * JSON envelope wrapping every dataset payload. Downstream citers can
 * cite this whole document and have everything they need to attribute
 * correctly: license, version, source URL, attribution text, the row
 * count, and the data array.
 */
export interface DatasetEnvelope<T> {
  $schema: "https://schema.org/Dataset";
  name: string;
  description: string;
  version: string;
  datePublished: string;
  license: typeof DATASET_LICENSE;
  attribution: string;
  source: string;
  count: number;
  rows: ReadonlyArray<T>;
}

export function buildEnvelope<T>(args: {
  name: string;
  description: string;
  rows: ReadonlyArray<T>;
}): DatasetEnvelope<T> {
  return {
    $schema: "https://schema.org/Dataset",
    name: args.name,
    description: args.description,
    version: DATASET_VERSION,
    datePublished: DATASET_PUBLISHED_AT,
    license: DATASET_LICENSE,
    attribution: DATASET_ATTRIBUTION,
    source: "https://unlocksaas.com/dataset",
    count: args.rows.length,
    rows: args.rows,
  };
}

// ── HTTP helpers ────────────────────────────────────────────────────────────

/**
 * Build a standard JSON dataset response. Edge-cacheable. The license
 * notice rides in BOTH the HTTP header (for tooling) and the JSON
 * payload envelope (for citation pipelines that strip headers). Belt
 * and suspenders.
 */
export function jsonResponse(args: {
  envelope: DatasetEnvelope<unknown>;
  filename: string;
}): Response {
  const body = JSON.stringify(args.envelope, null, 2);
  return new Response(body, {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      // `attachment` triggers a download when a browser hits the URL;
      // `inline` would let it render in the tab. Attachment wins because
      // the primary use case is "save and cite" not "read in browser".
      "content-disposition": `attachment; filename="${args.filename}"`,
      "x-license": DATASET_LICENSE.spdx,
      "x-license-notice": DATASET_ATTRIBUTION,
      // Long cache — these endpoints are static-generated at build time
      // and only change when we redeploy with new catalog rows. 1 day
      // edge cache, 1 week stale-while-revalidate.
      "cache-control":
        "public, max-age=300, s-maxage=86400, stale-while-revalidate=604800",
      "access-control-allow-origin": "*",
    },
  });
}

/**
 * Build a standard CSV dataset response. Same license header / cache
 * discipline as JSON; payload is RFC-4180 compliant (CRLF lines, double-
 * quote escaping). License header is the first comment line in the
 * payload too — Excel ignores leading `#` lines as comments only when
 * imported via Power Query; plain Excel CSV import shows them, which is
 * actually what we want (the citer sees the attribution before the data).
 */
export function csvResponse(args: {
  rows: ReadonlyArray<Record<string, unknown>>;
  columns: ReadonlyArray<string>;
  filename: string;
  datasetName: string;
  datasetDescription: string;
}): Response {
  const lines: string[] = [];
  // Attribution preamble. RFC-4180 doesn't formally define a comment
  // grammar, but `#`-prefixed leading lines are a de facto standard
  // across pandas, R `read_csv`, Postgres COPY, and DuckDB; they're
  // skipped or surfaced as documentation rows depending on the tool.
  lines.push(`# ${args.datasetName}`);
  lines.push(`# ${args.datasetDescription}`);
  lines.push(`# License: ${DATASET_LICENSE.spdx} (${DATASET_LICENSE.url})`);
  lines.push(`# Attribution: ${DATASET_ATTRIBUTION}`);
  lines.push(`# Version: ${DATASET_VERSION} | Published: ${DATASET_PUBLISHED_AT}`);
  lines.push(`# Rows: ${args.rows.length}`);
  // Empty line separates the preamble from the CSV body — some parsers
  // (notably DuckDB and pandas with skiprows= computed dynamically) lean
  // on the blank line as the boundary.
  lines.push("");
  // Header row.
  lines.push(args.columns.map(escapeCsv).join(","));
  // Data rows.
  for (const row of args.rows) {
    const cells = args.columns.map((col) => escapeCsv(stringify(row[col])));
    lines.push(cells.join(","));
  }
  const body = lines.join("\r\n");
  return new Response(body, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${args.filename}"`,
      "x-license": DATASET_LICENSE.spdx,
      "x-license-notice": DATASET_ATTRIBUTION,
      "cache-control":
        "public, max-age=300, s-maxage=86400, stale-while-revalidate=604800",
      "access-control-allow-origin": "*",
    },
  });
}

/** RFC-4180 CSV cell escape. Wraps in `"` and doubles internal quotes. */
function escapeCsv(value: string): string {
  // Always quote to defend against CRLF / commas / quotes in row data.
  // Marginal byte overhead is invisible at our row counts.
  const safe = value.replace(/"/g, '""');
  return `"${safe}"`;
}

/** Coerce any value into a string for CSV — never throws. */
function stringify(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return v.map(stringify).join("; ");
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

// ── flatteners (catalog rows → CSV-shaped scalars) ──────────────────────────
//
// CSV is a flat tabular format. The source catalogs nest deeply
// (productSnapshot, brunsonLens, dimensions[], faqs[], capabilities{}).
// The JSON export carries everything; the CSV export carries only the
// scalar columns a downstream analyst would actually pivot on. Anyone
// who needs the deep fields uses the JSON.

export const ALTERNATIVE_CSV_COLUMNS = [
  "slug",
  "display_name",
  "creator",
  "category",
  "tagline_one_line",
  "pricing_note",
  "who_for_it",
  "who_not_for_it",
  "honest_verdict",
  "homepage_url",
  "tags",
  "last_verified",
  "canonical_url",
] as const;

export function flattenAlternatives(): ReadonlyArray<Record<string, unknown>> {
  return ALTERNATIVES.map((a: Alternative) => ({
    slug: a.slug,
    display_name: a.displayName,
    creator: a.creator ?? "",
    category: a.category,
    tagline_one_line: a.oneLine,
    pricing_note: a.pricingNote,
    who_for_it: a.whoForIt,
    who_not_for_it: a.whoNotForIt,
    honest_verdict: a.honestVerdict,
    homepage_url: a.homepageUrl ?? "",
    tags: a.tags,
    last_verified: a.lastVerified,
    canonical_url: `https://unlocksaas.com/alternatives-to/${a.slug}`,
  }));
}

export const FUNNEL_TEARDOWN_CSV_COLUMNS = [
  "slug",
  "display_name",
  "creator",
  "category",
  "tagline_one_line",
  "tldr",
  "hook_pattern",
  "story_pattern",
  "offer_pattern",
  "value_ladder_tier",
  "homepage_url",
  "tags",
  "last_verified",
  "canonical_url",
] as const;

export function flattenFunnelTeardowns(): ReadonlyArray<
  Record<string, unknown>
> {
  return TEARDOWNS.map((t: FunnelTeardown) => ({
    slug: t.slug,
    display_name: t.displayName,
    creator: t.creator ?? "",
    category: t.category,
    tagline_one_line: t.oneLine,
    tldr: t.tldr,
    hook_pattern: t.hook.pattern,
    story_pattern: t.story.pattern,
    offer_pattern: t.offer.pattern,
    value_ladder_tier: t.brunsonLens.valueLadderTier,
    homepage_url: t.homepageUrl ?? "",
    tags: t.tags,
    last_verified: t.lastVerified,
    canonical_url: `https://unlocksaas.com/funnel-teardown/${t.slug}`,
  }));
}

export const PRICING_TEARDOWN_CSV_COLUMNS = [
  "slug",
  "display_name",
  "creator",
  "category",
  "tagline_one_line",
  "tldr",
  "pricing_model",
  "payment_frequency",
  "free_trial_behavior",
  "anchor_pattern",
  "upgrade_trigger_pattern",
  "tier_count",
  "tier_names",
  "stack",
  "value_ladder",
  "decoy_or_anchor",
  "payment_mechanics",
  "last_verified",
  "canonical_url",
] as const;

export function flattenPricingTeardowns(): ReadonlyArray<
  Record<string, unknown>
> {
  return PRICING_TEARDOWNS.map((p: PricingTeardown) => ({
    slug: p.slug,
    display_name: p.displayName,
    creator: p.creator ?? "",
    category: p.category,
    tagline_one_line: p.oneLine,
    tldr: p.tldr,
    pricing_model: p.pricingStructure.model,
    payment_frequency: p.pricingStructure.paymentFrequency,
    free_trial_behavior: p.pricingStructure.freeTrialBehavior,
    anchor_pattern: p.anchorAnalysis.pattern,
    upgrade_trigger_pattern: p.upgradeTrigger.pattern,
    tier_count: p.pricingStructure.tiers.length,
    tier_names: p.pricingStructure.tiers.map((t) => t.name),
    stack: p.brunsonLens.stack,
    value_ladder: p.brunsonLens.valueLadder,
    decoy_or_anchor: p.brunsonLens.decoyOrAnchor,
    payment_mechanics: p.brunsonLens.paymentMechanics,
    last_verified: p.lastVerified,
    canonical_url: `https://unlocksaas.com/pricing-teardown/${p.slug}`,
  }));
}

export const COMPARISON_CSV_COLUMNS = [
  "slug",
  "product_a",
  "product_a_url",
  "product_b",
  "product_b_url",
  "category",
  "tagline_one_line",
  "tldr",
  "best_for_a",
  "best_for_b",
  "indie_founder_pick",
  "indie_founder_reasoning",
  "dimension_count",
  "last_verified",
  "canonical_url",
] as const;

export function flattenComparisons(): ReadonlyArray<Record<string, unknown>> {
  return COMPARISONS.map((c: Comparison) => ({
    slug: c.slug,
    product_a: c.a.name,
    product_a_url: c.a.url ?? "",
    product_b: c.b.name,
    product_b_url: c.b.url ?? "",
    category: c.category,
    tagline_one_line: c.oneLine,
    tldr: c.tldr,
    best_for_a: c.bestFor.a,
    best_for_b: c.bestFor.b,
    indie_founder_pick: c.forIndieFounders.pick,
    indie_founder_reasoning: c.forIndieFounders.reasoning,
    dimension_count: c.dimensions.length,
    last_verified: c.lastVerified,
    canonical_url: `https://unlocksaas.com/compare/${c.slug}`,
  }));
}

export const CATEGORY_CSV_COLUMNS = [
  "slug",
  "display_name",
  "tagline_one_line",
  "intent",
  "matchers",
  "tags",
  "canonical_url",
] as const;

export function flattenCategories(): ReadonlyArray<Record<string, unknown>> {
  return CATEGORIES.map((c: CategoryDef) => ({
    slug: c.slug,
    display_name: c.displayName,
    tagline_one_line: c.oneLine,
    intent: c.intent,
    matchers: c.matchers,
    tags: c.tags,
    canonical_url: `https://unlocksaas.com/category/${c.slug}`,
  }));
}

// ── manifest ────────────────────────────────────────────────────────────────
//
// Single source of truth for the dataset hub page, the [file] route's
// generateStaticParams, the sitemap entries, and the llms.txt mention.
// Each entry pairs a downloadable filename with its display metadata so
// the hub page UI and the route handler never disagree.

export interface DatasetFileSpec {
  filename: string;
  /** Display title on the hub page. */
  title: string;
  /** Short description (~25 words). */
  description: string;
  /** "json" or "csv" — drives content-type and renderer pick. */
  format: "json" | "csv";
  /** Row count at build time. Stamped on the hub badge. */
  rows: number;
}

export const DATASET_FILES: ReadonlyArray<DatasetFileSpec> = [
  {
    filename: "indie-saas.json",
    title: "Indie SaaS Teardowns (full bundle)",
    description:
      "Every catalog in one document — alternatives, funnel teardowns, pricing teardowns, head-to-head comparisons, category roundups. Best for one-shot citation.",
    format: "json",
    rows:
      ALTERNATIVES.length +
      TEARDOWNS.length +
      PRICING_TEARDOWNS.length +
      COMPARISONS.length +
      CATEGORIES.length,
  },
  {
    filename: "alternatives.json",
    title: "Alternatives",
    description:
      "Honest competitor comparison rows. Each row names a real product and the category difference, not a quality gap.",
    format: "json",
    rows: ALTERNATIVES.length,
  },
  {
    filename: "alternatives.csv",
    title: "Alternatives (CSV)",
    description: "Same rows, flattened to scalar columns for spreadsheet analysis.",
    format: "csv",
    rows: ALTERNATIVES.length,
  },
  {
    filename: "funnel-teardowns.json",
    title: "Funnel Teardowns",
    description:
      "Hook / Story / Offer analysis of indie SaaS funnels, with what-to-adapt and what-to-avoid lists per company.",
    format: "json",
    rows: TEARDOWNS.length,
  },
  {
    filename: "funnel-teardowns.csv",
    title: "Funnel Teardowns (CSV)",
    description: "Top-level scalar columns for spreadsheet analysis.",
    format: "csv",
    rows: TEARDOWNS.length,
  },
  {
    filename: "pricing-teardowns.json",
    title: "Pricing Teardowns",
    description:
      "Tier structure, anchor mechanics, upgrade triggers, and payment-mechanics analysis of indie SaaS pricing pages.",
    format: "json",
    rows: PRICING_TEARDOWNS.length,
  },
  {
    filename: "pricing-teardowns.csv",
    title: "Pricing Teardowns (CSV)",
    description: "Flattened pricing fields for cross-product analysis.",
    format: "csv",
    rows: PRICING_TEARDOWNS.length,
  },
  {
    filename: "comparisons.json",
    title: "Head-to-Head Comparisons",
    description:
      "Symmetric comparisons of indie SaaS tools, with per-dimension verdicts and an indie-founder-specific pick.",
    format: "json",
    rows: COMPARISONS.length,
  },
  {
    filename: "comparisons.csv",
    title: "Head-to-Head Comparisons (CSV)",
    description: "Top-level comparison fields plus the indie-founder pick.",
    format: "csv",
    rows: COMPARISONS.length,
  },
  {
    filename: "categories.json",
    title: "Category Roundups",
    description:
      "Canonical SaaS category buckets and the matchers that map raw category strings into them.",
    format: "json",
    rows: CATEGORIES.length,
  },
  {
    filename: "categories.csv",
    title: "Category Roundups (CSV)",
    description: "Category metadata for spreadsheet joining.",
    format: "csv",
    rows: CATEGORIES.length,
  },
] as const;

/** Sum of every catalog's row count. Stamped on the hub page hero. */
export const DATASET_TOTAL_ROWS =
  ALTERNATIVES.length +
  TEARDOWNS.length +
  PRICING_TEARDOWNS.length +
  COMPARISONS.length +
  CATEGORIES.length;
