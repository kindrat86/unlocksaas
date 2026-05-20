/**
 * Zenodo Deposition API metadata builder.
 *
 * Why this module exists
 * ----------------------
 * Zenodo is the CERN-hosted open-research repository that mints persistent
 * DOIs on deposit. DOIs are the strongest dataset identifier class
 * Google Dataset Search recognises and the canonical citation form every
 * academic reference manager (Zotero, Mendeley, EndNote, RefWorks) pivots
 * on. Zenodo is also one of the DataCatalogs Google Dataset Search ranks
 * favourably (alongside Hugging Face Datasets, Kaggle, figshare,
 * DataCite), so a confirmed Zenodo deposit unlocks both:
 *
 *   1. A persistent DOI that propagates into the canonical Dataset
 *      JSON-LD as a typed PropertyValue identifier, into BibTeX as a
 *      `doi = {...}` field, into the citation string, and into the
 *      Hugging Face dataset card YAML frontmatter as a `doi:` badge.
 *
 *   2. A second confirmed `includedInDataCatalog` row beyond Hugging
 *      Face – the second catalog cross-listing that compounds the
 *      ranking lift on the canonical /dataset landing.
 *
 * Zenodo's submission flow is API-driven: POST a JSON metadata payload
 * to https://zenodo.org/api/deposit/depositions, upload the dataset
 * files via PUT to the returned bucket URL, then POST the publish
 * action. This module is the single source of truth for the metadata
 * payload. The actual API calls live in scripts/mint-zenodo-deposit.py
 * (the operator CLI) – this module produces the JSON the CLI uploads.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - Every field below is sourced from the canonical dataset module
 *     (DATASET_NAME, DATASET_BUNDLE, DATASET_KEYWORDS, ...). No
 *     Zenodo-only claim that does not also live on /dataset.
 *   - The DOI itself is NOT minted in this module – Zenodo mints it on
 *     publish. The DOI is then pasted back into NEXT_PUBLIC_UNLOCKSAAS_ZENODO_DOI
 *     on Vercel and propagates through DATASET_DOI to every downstream
 *     consumer (Dataset JSON-LD, BibTeX, citation, HF card).
 *   - Creators are honestly typed: one creator (Maryan) with affiliation
 *     "Unlock SaaS". No fabricated co-authors.
 *   - License is `cc-by-4.0` (Zenodo's controlled vocab matches SPDX).
 *
 * The payload is served as JSON at /dataset/zenodo/raw with
 * Content-Disposition: attachment; filename="zenodo-deposition.json" so
 * the operator CLI curls it directly, posts to the Zenodo API, and
 * never has to construct the payload by hand.
 *
 * Sandbox vs production
 * ---------------------
 * Zenodo offers a sandbox environment at https://sandbox.zenodo.org/
 * with the same API shape. The metadata payload is identical for both;
 * the operator CLI accepts a `--sandbox` flag that toggles the base URL.
 * This module emits production-targeted descriptions, but the payload
 * itself works against either endpoint.
 */

import {
  DATASET_ATTRIBUTION,
  DATASET_BUNDLE,
  DATASET_CITATION,
  DATASET_KEYWORDS,
  DATASET_LICENSE_SPDX,
  DATASET_MEASUREMENT_TECHNIQUE,
  DATASET_NAME,
  DATASET_PER_TABLE_CSV,
  DATASET_PER_TABLE_SLUGS,
  DATASET_URLS,
  DATASET_VERSION,
  perTableCsvUrl,
} from "@/lib/seo/dataset";
import {
  BASE_URL,
  FOUNDER,
  ORGANIZATION,
  PUBLISHING_PRINCIPLES_URL,
} from "@/lib/seo/entity";

// ---------------------------------------------------------------------------
// Zenodo controlled-vocabulary values
// ---------------------------------------------------------------------------

/**
 * Zenodo `upload_type` controlled value. The full vocabulary is
 * documented at https://developers.zenodo.org/#representation. For an
 * editorial corpus of marketing-analysis rows, `dataset` is the right
 * choice – it lights up the Dataset Search ingestion path and matches
 * the Hugging Face cross-listing's classification.
 */
const ZENODO_UPLOAD_TYPE = "dataset" as const;

/**
 * Zenodo access right. `open` is the only honest value for a CC-BY-4.0
 * dataset – downloads are unrestricted, attribution is required, no
 * embargo. Matches the canonical license declaration on /dataset.
 */
const ZENODO_ACCESS_RIGHT = "open" as const;

/**
 * Zenodo license identifier. Zenodo's controlled vocabulary is rooted
 * in SPDX but uses lowercase. `cc-by-4.0` resolves to the same canonical
 * URL the dataset module already declares (creativecommons.org/licenses/by/4.0/).
 */
const ZENODO_LICENSE = DATASET_LICENSE_SPDX.toLowerCase();

/**
 * ISO 639-3 language tag for Zenodo's `language` field. The dataset is
 * en-US source content (the source pages on unlocksaas.com are
 * authored in English); ISO 639-3 collapses en-US and en-GB to `eng`.
 */
const ZENODO_LANGUAGE = "eng" as const;

/**
 * Optional Zenodo community identifiers. Communities are curated
 * collections; submitting a deposit to a community puts it in front of
 * researchers who follow that topic. Empty by default – communities
 * usually require curator approval, so the operator can apply post-hoc
 * once the deposit is live. The slot is reserved here so the payload
 * shape never changes when communities are added later.
 */
const ZENODO_COMMUNITIES: ReadonlyArray<string> = Object.freeze([]);

// ---------------------------------------------------------------------------
// Creator block
// ---------------------------------------------------------------------------

/**
 * Zenodo `creators[]` shape. Maps directly to the canonical FOUNDER
 * + ORGANIZATION pair: one creator (Maryan) with affiliation
 * "Unlock SaaS". ORCID slot is env-driven – stays undefined until the
 * operator registers an ORCID iD and pastes it on Vercel.
 *
 * Why a single creator. The dataset is a single-author editorial corpus
 * – Maryan authors every source page on unlocksaas.com. Padding the
 * creators array with collaborators would be a Brunson Hard-Rule
 * violation (no fabricated co-authors).
 *
 * Zenodo accepts `name` as either "Last, First" or a single token; for
 * a single-name founder identity we use just "Maryan" verbatim. The
 * `affiliation` field is mandatory for citation rendering on the
 * deposit landing page.
 */
function buildZenodoCreators(): ReadonlyArray<{
  readonly name: string;
  readonly affiliation: string;
  readonly orcid?: string;
}> {
  const orcid = process.env.NEXT_PUBLIC_UNLOCKSAAS_FOUNDER_ORCID?.trim();
  // ORCID format: `0000-0000-0000-0000` (16 digits in 4 groups). Strict
  // validation – malformed value drops silently rather than corrupting
  // the payload. Zenodo's parser rejects malformed ORCIDs with a 400.
  const orcidPattern = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/;
  const orcidClean =
    orcid && orcidPattern.test(orcid) ? orcid : undefined;
  return Object.freeze([
    Object.freeze({
      name: FOUNDER.name,
      affiliation: ORGANIZATION.name,
      ...(orcidClean ? { orcid: orcidClean } : {}),
    }),
  ]);
}

// ---------------------------------------------------------------------------
// Related identifiers
// ---------------------------------------------------------------------------

/**
 * Zenodo `related_identifiers[]` row. Each entry declares a relationship
 * between the deposited artifact and an external URL. Zenodo's
 * documented relations include `isAlternateIdentifier`,
 * `isDerivedFrom`, `isPartOf`, `isSupplementTo`, `isCompiledBy`,
 * `references`, and many more. We use the subset that matches the
 * dataset's actual provenance:
 *
 *   - `isAlternateIdentifier` for every canonical mirror: the landing
 *     URL, the JSON bundle, the universal CSV, the markdown summary,
 *     and the five per-table CSVs. These resolve to the SAME corpus –
 *     different distribution shapes.
 *
 *   - `isDerivedFrom` for the source surfaces on unlocksaas.com
 *     (funnel-teardown, pricing-teardown, compare, alternatives-to,
 *     category roundup) since each row is a re-projection of a
 *     published page on the canonical site.
 *
 *   - `isDocumentedBy` for the editorial-policy page that documents
 *     the dataset's methodology.
 *
 *   - `isSupplementTo` for the Hugging Face Datasets URL when it is
 *     live. The HF mirror is a supplement; the Zenodo deposit is the
 *     citation anchor.
 *
 * Brunson Hard-Rule: every URL below is a real, indexable surface on
 * the canonical site (or, in the HF case, a real catalog listing
 * gated by the env var). No fabricated relationships.
 */
interface ZenodoRelatedIdentifier {
  readonly relation: string;
  readonly identifier: string;
  readonly resource_type?: string;
}

function buildZenodoRelatedIdentifiers(): ReadonlyArray<ZenodoRelatedIdentifier> {
  const rows: ZenodoRelatedIdentifier[] = [];

  // Alternate identifiers – the canonical mirrors on unlocksaas.com.
  // Zenodo's identifier field accepts any URL or DOI; `resource_type`
  // narrows the schema.org expectation for Dataset Search ingestion.
  const ALTERNATE_MIRRORS: ReadonlyArray<{ url: string; type: string }> = [
    { url: DATASET_URLS.landing, type: "dataset" },
    { url: DATASET_URLS.json, type: "dataset" },
    { url: DATASET_URLS.csv, type: "dataset" },
    { url: DATASET_URLS.markdown, type: "publication-other" },
    ...DATASET_PER_TABLE_SLUGS.map((slug) => ({
      url: perTableCsvUrl(slug),
      type: "dataset",
    })),
  ];
  for (const mirror of ALTERNATE_MIRRORS) {
    rows.push({
      relation: "isAlternateIdentifier",
      identifier: mirror.url,
      resource_type: mirror.type,
    });
  }

  // Source surfaces – the pSEO catalog hubs each row was derived from.
  // Declaring isDerivedFrom against each hub URL gives a downstream
  // crawler the explicit provenance chain.
  const SOURCE_HUBS: ReadonlyArray<string> = [
    `${BASE_URL}/funnel-teardown`,
    `${BASE_URL}/pricing-teardown`,
    `${BASE_URL}/compare`,
    `${BASE_URL}/alternatives-to`,
    `${BASE_URL}/category`,
  ];
  for (const hub of SOURCE_HUBS) {
    rows.push({
      relation: "isDerivedFrom",
      identifier: hub,
      resource_type: "other",
    });
  }

  // Editorial methodology – the publishing-principles URL that
  // documents how the rows were produced.
  rows.push({
    relation: "isDocumentedBy",
    identifier: PUBLISHING_PRINCIPLES_URL,
    resource_type: "publication-other",
  });

  // Hugging Face cross-listing – appended only when the HF URL is set.
  // The relation is `isSupplementTo`: the HF mirror supplements the
  // Zenodo deposit (which is the citation anchor with the DOI), not
  // the other way around. Sourced directly from the env so we never
  // claim a HF listing that does not exist.
  const hfUrl = process.env.NEXT_PUBLIC_UNLOCKSAAS_HUGGINGFACE_DATASET_URL?.trim();
  if (hfUrl && hfUrl.startsWith("https://")) {
    rows.push({
      relation: "isSupplementTo",
      identifier: hfUrl,
      resource_type: "dataset",
    });
  }

  return Object.freeze(rows);
}

// ---------------------------------------------------------------------------
// HTML description block
// ---------------------------------------------------------------------------

/**
 * Zenodo's `description` field accepts HTML and renders it as the body
 * of the deposit landing page. We mirror the canonical /dataset prose
 * so the Zenodo page reads identically – every claim on the Zenodo
 * deposit is also present on the canonical site, and the editorial
 * method paragraph (DATASET_MEASUREMENT_TECHNIQUE) is the same string
 * the schema.org `Dataset.measurementTechnique` field carries.
 *
 * Why HTML not markdown. Zenodo accepts both, but HTML renders
 * predictably across the deposit landing page, the OAI-PMH feed, and
 * the citation export formats. Markdown is downgraded to plain text
 * in several of those surfaces.
 *
 * The HTML is intentionally minimal: paragraphs, a list, and one link
 * back to the canonical landing. No inline styles. Zenodo's renderer
 * strips most attributes anyway.
 */
function buildZenodoDescription(): string {
  const counts = DATASET_BUNDLE.counts;
  const perTableLines = DATASET_PER_TABLE_SLUGS.map((slug) => {
    const entry = DATASET_PER_TABLE_CSV[slug];
    return `<li><strong>${entry.displayName}</strong>: ${entry.rowCount} rows, ${entry.columns.length} columns. <a href="${perTableCsvUrl(slug)}">${slug}.csv</a></li>`;
  }).join("\n");

  return [
    `<p>An open editorial dataset of ${counts.total_rows} indie SaaS marketing analyses. Every row is a re-projection of a published page on <a href="${BASE_URL}">unlocksaas.com</a> and carries a dated <code>last_verified</code> field.</p>`,
    `<p>Five tables, each a structured re-projection of a public marketing-analysis surface on the canonical site:</p>`,
    `<ul>`,
    perTableLines,
    `</ul>`,
    `<p><strong>Methodology.</strong> ${DATASET_MEASUREMENT_TECHNIQUE}</p>`,
    `<p><strong>License.</strong> Released under the <a href="https://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International license (${DATASET_LICENSE_SPDX})</a>. Re-use is unrestricted; the only obligation is attribution back to <a href="${DATASET_URLS.landing}">${DATASET_URLS.landing}</a>.</p>`,
    `<p><strong>Required attribution.</strong> ${DATASET_ATTRIBUTION}</p>`,
    `<p><strong>Citation.</strong> ${DATASET_CITATION}</p>`,
    `<p>Canonical home: <a href="${DATASET_URLS.landing}">${DATASET_URLS.landing}</a>. Editorial policy and corrections log: <a href="${PUBLISHING_PRINCIPLES_URL}">${PUBLISHING_PRINCIPLES_URL}</a>.</p>`,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Notes block
// ---------------------------------------------------------------------------

/**
 * Zenodo `notes` field. Plain-text addendum that renders on the
 * deposit landing page below the description. We use it for the
 * operational metadata a researcher needs but that does not belong
 * in the main description: version cadence, freshness contract,
 * canonical-drift discipline, and the activation env-var trail.
 */
function buildZenodoNotes(): string {
  return [
    `Version cadence: SemVer. Additive changes (new optional columns, new catalog entries) bump patch; renames or type changes bump minor; removals bump major. Consumers should branch on the major.`,
    ``,
    `Freshness: lastVerified ${DATASET_BUNDLE.lastVerified}. Next editorial review ${DATASET_BUNDLE.nextReview}. Verified rows ship with their per-row lastVerified date unchanged from the source page.`,
    ``,
    `Canonical-drift discipline: this Zenodo deposit is a re-projection of the canonical dataset published at ${DATASET_URLS.landing}. Both surfaces are built from the same TypeScript module, so a row that ships here also ships on the canonical site at the same version. The DOI minted by Zenodo on publication is the persistent identifier; the canonical URL is the rolling-latest mirror.`,
    ``,
    `Provenance: every row links back to its source page via the canonical URL pattern declared in the JSON bundle's "schema" block. Editorial standards (sourcing, dating, corrections, no fabricated metrics) are documented at ${PUBLISHING_PRINCIPLES_URL}.`,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Top-level deposition metadata object
// ---------------------------------------------------------------------------

/**
 * The full Zenodo Deposition API metadata payload. Built once at module
 * load – every value derives from the canonical dataset constants, so
 * a re-deploy after a catalog change automatically re-renders the
 * payload with the new row counts and per-table list.
 *
 * The operator CLI fetches this object as JSON at /dataset/zenodo/raw,
 * wraps it in `{"metadata": <this>}`, and POSTs to
 * https://zenodo.org/api/deposit/depositions. The Zenodo API responds
 * with a deposition ID and a file-upload bucket URL; the CLI then
 * uploads the bundle JSON + universal CSV + five per-table CSVs to the
 * bucket and POSTs the publish action.
 *
 * Brunson Hard-Rule: omit-empty discipline. Optional fields with no
 * resolved value (empty communities list when the operator has not
 * applied yet, undefined ORCID when not registered) stay out of the
 * payload entirely. Zenodo's validator accepts shape-stable JSON;
 * fabricated empty arrays would still ship the deposit but would
 * advertise commitments we cannot honour.
 */
export interface ZenodoDepositionMetadata {
  readonly upload_type: typeof ZENODO_UPLOAD_TYPE;
  readonly publication_date: string;
  readonly title: typeof DATASET_NAME;
  readonly creators: ReadonlyArray<{
    readonly name: string;
    readonly affiliation: string;
    readonly orcid?: string;
  }>;
  readonly description: string;
  readonly access_right: typeof ZENODO_ACCESS_RIGHT;
  readonly license: string;
  readonly keywords: ReadonlyArray<string>;
  readonly notes: string;
  readonly related_identifiers: ReadonlyArray<ZenodoRelatedIdentifier>;
  readonly version: typeof DATASET_VERSION;
  readonly language: typeof ZENODO_LANGUAGE;
  readonly communities?: ReadonlyArray<{ readonly identifier: string }>;
}

function buildZenodoDepositionMetadata(): ZenodoDepositionMetadata {
  const base: ZenodoDepositionMetadata = {
    upload_type: ZENODO_UPLOAD_TYPE,
    publication_date: DATASET_BUNDLE.lastVerified,
    title: DATASET_NAME,
    creators: buildZenodoCreators(),
    description: buildZenodoDescription(),
    access_right: ZENODO_ACCESS_RIGHT,
    license: ZENODO_LICENSE,
    keywords: DATASET_KEYWORDS,
    notes: buildZenodoNotes(),
    related_identifiers: buildZenodoRelatedIdentifiers(),
    version: DATASET_VERSION,
    language: ZENODO_LANGUAGE,
  };
  // Communities are only attached when populated; an empty array would
  // ship but is noise for the Zenodo validator and the deposit UI.
  if (ZENODO_COMMUNITIES.length > 0) {
    return {
      ...base,
      communities: ZENODO_COMMUNITIES.map((id) =>
        Object.freeze({ identifier: id }),
      ),
    };
  }
  return base;
}

/**
 * Pre-built deposition metadata, frozen at module load. Hoisted to
 * module scope per the `server-hoist-static-io` pattern – the route
 * handler returns the pre-serialized JSON with the right headers and
 * no per-request allocation.
 */
export const ZENODO_DEPOSITION_METADATA: ZenodoDepositionMetadata =
  Object.freeze(buildZenodoDepositionMetadata());

/**
 * Pre-serialized JSON ready for the operator CLI to curl and POST to
 * the Zenodo API. The outer envelope matches the Zenodo API contract:
 * `{"metadata": <fields>}`.
 *
 * Pretty-printed at indent 2 so an operator inspecting the file in a
 * browser tab can read it without piping through `jq`. The serialized
 * size is small (~6KB) – pretty-printing adds negligible cost.
 */
export const ZENODO_DEPOSITION_METADATA_JSON: string = JSON.stringify(
  { metadata: ZENODO_DEPOSITION_METADATA },
  null,
  2,
);

/**
 * Ordered list of the files the operator CLI uploads to the Zenodo
 * bucket after creating the deposition. Mirrors the same per-table
 * file ordering used by the HF dataset card. The JSON bundle is
 * uploaded first so it lands at the top of the deposit's file list
 * and reads as the canonical artifact; the universal CSV second; the
 * five per-table CSVs in their stable catalog order; the markdown
 * mirror last as the human-readable summary.
 *
 * Each entry's `filename` is the name the file lands under on Zenodo.
 * The version suffix in the filename keeps the deposit unambiguous
 * across versions – Zenodo creates a new DOI for each new version.
 */
export interface ZenodoDepositionFile {
  /** Public absolute URL the CLI fetches the file from. */
  readonly sourceUrl: string;
  /** Filename the file lands under on the Zenodo deposit. */
  readonly filename: string;
  /** Human-readable description for the CLI log. */
  readonly description: string;
}

function buildZenodoDepositionFiles(): ReadonlyArray<ZenodoDepositionFile> {
  const versionTag = `v${DATASET_VERSION}`;
  const files: ZenodoDepositionFile[] = [
    {
      sourceUrl: DATASET_URLS.json,
      filename: `indie-saas-teardowns-${versionTag}.json`,
      description: "Full JSON bundle with schema descriptions and citation metadata",
    },
    {
      sourceUrl: DATASET_URLS.csv,
      filename: `indie-saas-teardowns-${versionTag}.csv`,
      description: "Universal CSV (flat, one row per record, 14 columns)",
    },
  ];
  for (const slug of DATASET_PER_TABLE_SLUGS) {
    const entry = DATASET_PER_TABLE_CSV[slug];
    files.push({
      sourceUrl: perTableCsvUrl(slug),
      filename: `${slug}-${versionTag}.csv`,
      description: `${entry.displayName} – ${entry.rowCount} rows, ${entry.columns.length} columns`,
    });
  }
  files.push({
    sourceUrl: DATASET_URLS.markdown,
    filename: `README-${versionTag}.md`,
    description: "Markdown summary mirror of the canonical landing page",
  });
  return Object.freeze(files);
}

export const ZENODO_DEPOSITION_FILES: ReadonlyArray<ZenodoDepositionFile> =
  buildZenodoDepositionFiles();
