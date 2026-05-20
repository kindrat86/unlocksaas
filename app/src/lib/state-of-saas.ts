/**
 * State of Post-Launch Pre-Revenue SaaS — annual flagship report registry.
 *
 * Surface C (linkable asset / off-page lift) and Surface B (AEO/GEO citation
 * anchor) of strategy/google-strategy.md. Annual editions live at
 * `/state-of-saas/<year>` with an index at `/state-of-saas`. The thesis:
 * one citable report per year, framed around the niche UnlockSaaS owns
 * (post-launch pre-revenue, non-engineer founders, AI-tool stack). The
 * report becomes the canonical "Maryan's report says..." asset that
 * earned-media writers and AI overviews cite when they need a number on
 * the topic.
 *
 * Why this module exists
 * ----------------------
 * The dataset at /dataset is editorial corpus (teardowns, comparisons,
 * alternatives) — it ships the WHAT. The annual report is the analysis
 * layer on top — it ships the SO WHAT. Specifically, the only proprietary
 * dataset UnlockSaaS owns that no other indie SaaS publisher does is the
 * diagnostic_leads corpus (Wrong Person / Weak Offer / Weak Belief label
 * distribution on real founder URLs). That distribution is the headline
 * finding of every edition: "Of the N post-launch pre-revenue founders
 * who pasted their URL into the free diagnostic during YEAR, X% were
 * diagnosed as Wrong Person, Y% as Weak Offer, Z% as Weak Belief."
 *
 * Anonymization contract
 * ----------------------
 * The aggregator in state-of-saas-data.ts NEVER reads email, IP,
 * user_agent, product_url, headline, explanation, or evidence. It reads
 * `label`, `bucket`, `created_at` and aggregates to counts. The numbers
 * that publish are de-identified by construction — no row-level data
 * ever leaves the function. Opt-in / opt-out is not a separate column
 * because the aggregation is over counts, not over identifiable rows;
 * the per-row share_visibility gate that protects /diagnosis/<id> pages
 * is orthogonal to the cohort-count gate this surface uses.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - MIN_REPORT_N enforces a sample-size floor below which the
 *     percentages would be statistically meaningless. Below threshold,
 *     the edition page renders an honest "enrollment open" zero-state
 *     with the current sample count visible — never fabricated numbers
 *     and never a hidden "shipped report" with bad math.
 *   - Every claim in the published report is a re-projection of a count
 *     the aggregator can re-derive from Supabase at any moment. No
 *     editorialized findings invented after the fact.
 *   - The citation block names only the founder (Maryan) and the canonical
 *     URL. No fabricated co-authors, no academic-affiliation theater.
 *   - The temporal coverage is the calendar year the edition covers.
 *     Below-threshold editions still ship — they document the cohort
 *     stage and the eventual publication trigger, but no numbers.
 */

import { BASE_URL, FOUNDER, ORGANIZATION } from "@/lib/seo/entity";
import { LAST_VERIFIED_DATE } from "@/lib/seo/freshness";

// ---------------------------------------------------------------------------
// Editions registry
// ---------------------------------------------------------------------------

/**
 * Editions are calendar-year scoped. The 2026 edition is the launch edition;
 * future years are added as additional entries here when the calendar
 * rolls over and the new cohort accumulates. The temporalCoverage on the
 * Dataset/Report JSON-LD reads from this entry directly so a downstream
 * crawler walking the schema graph sees the same window the body copy
 * describes.
 *
 * Editorial rule for adding a new edition:
 *   1. Roll over on January 1 of the new year (e.g. add 2027 on 2027-01-01).
 *   2. The previous edition stays at its temporalCoverage window forever —
 *      we do not retro-edit a published edition's numbers when new rows
 *      accumulate in the underlying year. New rows for an already-closed
 *      year flow into a "Revised" addendum only.
 *   3. Bump CURRENT_EDITION_YEAR to the new year.
 */
export interface ReportEdition {
  /** Calendar year the edition covers. Becomes the URL slug. */
  readonly year: number;
  /** ISO 8601 start of the edition's data window. */
  readonly windowStart: string;
  /** ISO 8601 end of the edition's data window. Open-ended (..) for
   *  the current edition; concrete date for closed editions. */
  readonly windowEnd: string;
  /** Display title without the brand prefix. */
  readonly displayTitle: string;
  /** One-sentence framing of the edition. Used as Article.description
   *  and as the OG card subtitle. */
  readonly tagline: string;
  /** Editorial state. `enrollment_open` = below sample-size floor,
   *  page renders honest zero-state. `published` = at-or-above floor,
   *  page renders headline numbers. `closed` = window has passed and
   *  the published numbers are frozen. */
  readonly state: "enrollment_open" | "published" | "closed";
  /** ISO date the edition was last reviewed end-to-end against the
   *  underlying Supabase counts. Drives Article.dateModified. */
  readonly lastVerified: string;
}

/**
 * Minimum cohort sample size before the edition's percentage findings
 * publish. Set at 30 because below that, a 95% confidence interval on
 * the label distribution is wider than any single label's expected
 * share — the numbers would obscure more than they reveal.
 *
 * This is the headline editorial gate. Below threshold, the edition page
 * renders an honest "Cohort needs N more submissions" line; above
 * threshold, the percentages publish. The gate is enforced in the
 * aggregator (state-of-saas-data.ts) AND mirrored in the page template
 * so the integrity logic is auditable from one location.
 */
export const MIN_REPORT_N = 30 as const;

/**
 * Year of the in-progress edition. Pages for years > this and < the
 * earliest edition 404. Pages for known years render either the
 * published or the enrollment-open shell depending on the edition state.
 *
 * Note: this constant is the single source of truth for "what year is
 * the current report". The CMS-like rollover discipline lives in
 * EDITIONS below; this just resolves "current" for the index page and
 * the canonical /state-of-saas redirect target.
 */
export const CURRENT_EDITION_YEAR = 2026 as const;

/**
 * Full editions table. Append-only — historical editions never leave
 * this array, so /state-of-saas/2027 still resolves in 2030 with its
 * 2027-window numbers intact.
 */
export const EDITIONS: ReadonlyArray<ReportEdition> = Object.freeze([
  {
    year: 2026,
    windowStart: "2026-01-01",
    windowEnd: "2026-12-31",
    displayTitle: "State of Post-Launch Pre-Revenue SaaS 2026",
    tagline:
      "What founders who already shipped (but have not yet earned their first paying customer) are actually getting wrong, drawn from real diagnostic submissions during 2026.",
    state: "enrollment_open",
    lastVerified: LAST_VERIFIED_DATE,
  },
]);

/**
 * Look up an edition by its year. Returns undefined when the year is
 * not in the registry; the route handler uses that to 404.
 */
const EDITIONS_BY_YEAR = new Map<number, ReportEdition>(
  EDITIONS.map((e) => [e.year, e]),
);

export function getEdition(year: number): ReportEdition | undefined {
  return EDITIONS_BY_YEAR.get(year);
}

/** Edition years sorted descending. Used by the index page so the
 *  newest edition appears first. */
export const EDITION_YEARS_DESC: readonly number[] = Object.freeze(
  EDITIONS.map((e) => e.year).sort((a, b) => b - a),
);

/**
 * generateStaticParams helper. Returns a fresh mutable array per call so
 * Next.js's typechecker accepts it without a spread on the caller side
 * (the App Router's AppPageConfig requires the return type to be
 * `any[] | Promise<any[]>`, not `readonly any[]`). Internally still
 * iterates the frozen EDITIONS array, so the source of truth remains
 * append-only.
 */
export function editionStaticParams(): Array<{ year: string }> {
  return EDITIONS.map((e) => ({ year: String(e.year) }));
}

// ---------------------------------------------------------------------------
// Canonical URLs and identifiers
// ---------------------------------------------------------------------------

/** Index page for all editions. */
export const STATE_OF_SAAS_INDEX_URL = `${BASE_URL}/state-of-saas` as const;

/** Per-edition canonical URL. */
export function editionUrl(year: number): string {
  return `${BASE_URL}/state-of-saas/${year}`;
}

/**
 * Stable identifier for the edition's underlying Dataset node. Schema.org
 * `Dataset.identifier` uses the fragment-style anchor pattern so a
 * crawler walking the identifier resolves back to the edition page.
 * Mirrors DATASET_PRIMARY_IDENTIFIER in /lib/seo/dataset.ts.
 */
export function editionDatasetIdentifier(year: number): string {
  return `${editionUrl(year)}#state-of-saas-${year}`;
}

// ---------------------------------------------------------------------------
// Citation strings (per edition)
// ---------------------------------------------------------------------------

/**
 * Plain-text citation a re-user can paste into a footnote, methods note,
 * or newsletter blockquote. Mirrors DATASET_CITATION's shape so /dataset
 * and /state-of-saas/<year> read as one editorial product. The year in
 * the citation is the EDITION year, not the build year — a re-user
 * citing the 2026 edition from 2028 still gets "(2026)" because that
 * is the temporal scope of the analysis.
 */
export function editionCitation(edition: ReportEdition): string {
  return `${FOUNDER.name} (${edition.year}). ${edition.displayTitle}. ${ORGANIZATION.name}. ${editionUrl(edition.year)}.`;
}

/**
 * BibTeX entry for academic re-use. Mirrors DATASET_BIBTEX. The cite
 * key is stable across re-builds (year-anchored, not date-anchored)
 * so a bibliography that pinned the previous build's key still
 * resolves after the next build.
 */
export function editionBibtex(edition: ReportEdition): string {
  return `@techreport{unlocksaas_state_of_saas_${edition.year},
  author       = {${FOUNDER.name}},
  title        = {{${edition.displayTitle}}},
  institution  = {${ORGANIZATION.name}},
  year         = {${edition.year}},
  type         = {Annual report},
  url          = {${editionUrl(edition.year)}},
  urldate      = {${edition.lastVerified}}
}`;
}

/**
 * APA 7 citation. Honest "n.d." not used — every edition has a year by
 * construction.
 */
export function editionApa(edition: ReportEdition): string {
  return `${FOUNDER.name} (${edition.year}). ${edition.displayTitle} [Annual report]. ${ORGANIZATION.name}. ${editionUrl(edition.year)}`;
}

/**
 * MLA 9 citation. Annual report falls under MLA's "Report" template.
 * Publisher comes before the year in this style.
 */
export function editionMla(edition: ReportEdition): string {
  return `${FOUNDER.name}. "${edition.displayTitle}." ${ORGANIZATION.name}, ${edition.year}, ${editionUrl(edition.year)}.`;
}

/**
 * Chicago author-date. Same data, different ordering convention.
 */
export function editionChicago(edition: ReportEdition): string {
  return `${FOUNDER.name}. ${edition.year}. "${edition.displayTitle}." ${ORGANIZATION.name}. ${editionUrl(edition.year)}.`;
}

// ---------------------------------------------------------------------------
// License (mirrors the dataset)
// ---------------------------------------------------------------------------

/** Same CC-BY-4.0 contract as the canonical dataset — re-use is
 *  unrestricted, attribution is required. Single SPDX identifier so a
 *  validator that walks both surfaces sees a consistent license claim. */
export const STATE_OF_SAAS_LICENSE_SPDX = "CC-BY-4.0" as const;
export const STATE_OF_SAAS_LICENSE_URL =
  "https://creativecommons.org/licenses/by/4.0/" as const;

/** Required attribution string. Mirrors DATASET_ATTRIBUTION. */
export function editionAttribution(edition: ReportEdition): string {
  return `Source: ${ORGANIZATION.name} – ${edition.displayTitle} (${editionUrl(edition.year)}). Licensed under ${STATE_OF_SAAS_LICENSE_SPDX}.`;
}

// ---------------------------------------------------------------------------
// Keywords (per edition – year-scoped)
// ---------------------------------------------------------------------------

/**
 * Keywords for Dataset.keywords / Article.keywords. Each is a real search
 * class the edition's findings address. The year is included so the
 * edition shows up for both year-anchored queries ("state of saas 2026")
 * and evergreen-class queries ("indie saas funnel diagnosis dataset").
 *
 * Brunson Hard-Rule: every term below is a real phrase founders search
 * for or that journalists / AI overviews use as a topical anchor. No
 * keyword stuffing.
 */
export function editionKeywords(edition: ReportEdition): readonly string[] {
  return Object.freeze([
    `state of post-launch pre-revenue SaaS ${edition.year}`,
    `indie SaaS founder funnel diagnosis ${edition.year}`,
    "Wrong Person Weak Offer Weak Belief diagnosis distribution",
    "post-launch pre-revenue SaaS dataset",
    "non-engineer founder marketing report",
    "AI-tool stack indie SaaS report",
    "indie SaaS first paying customer failure modes",
    "Russell Brunson Hook Story Offer diagnosis cohort",
  ]);
}
