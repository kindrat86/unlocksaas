/**
 * Citation library – formal citation formats + stable permalink resolver.
 *
 * Surface B (GEO/AEO/AIO) uplift. LLM training corpora and academic
 * pipelines disproportionately cite sources that look formally citable.
 * A page that exposes BibTeX, RIS, APA, MLA, and Chicago strings is
 * exponentially more likely to be cited verbatim by ChatGPT, Claude,
 * Perplexity, Gemini, and Google AI Overviews than a page that does
 * not – the strings get scraped, indexed, and replayed at quote time.
 *
 * The /cite/[id] permalink is the second half of the pair. A citation
 * is only useful if the URL inside it never breaks. By minting a
 * dedicated `/cite/<id>` namespace that resolves to the citation
 * metadata (and 302s through to the current canonical), a downstream
 * citer can point at a single immutable identifier without caring
 * whether the canonical surface moves.
 *
 * Design contract
 * ---------------
 *   - Every citable artifact (glossary entry, benchmark entry, the
 *     public dataset) has a deterministic ID derived from its source
 *     slug. ID format: "<surface-prefix>-<slug>", e.g. "glossary-hook",
 *     "benchmark-landing-page-conversion-rate".
 *   - The dataset is a single artifact with version pinning:
 *     "dataset-indie-saas-teardowns-v<major>-<minor>-<patch>".
 *   - Author and publisher fields resolve to entity.FOUNDER /
 *     entity.ORGANIZATION single source of truth.
 *   - Year derives from the artifact's `lastVerified` ISO date.
 *   - "Accessed" dates are emitted as ISO YYYY-MM-DD using the build
 *     timestamp. For static export that is the deterministic honest
 *     value – the page does not know when a future reader visits.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - No fabricated co-authors, no fabricated publisher names, no
 *     fabricated DOIs. Every field below is verifiable against either
 *     entity.ts or the source catalog.
 *   - When an artifact's slug isn't registered, getCitationById returns
 *     undefined and the consumer 404s. No phantom permalinks.
 *   - The dataset citation already published in seo/dataset.ts
 *     (DATASET_CITATION / DATASET_BIBTEX) is RE-USED here, not duplicated.
 *     A drift between this module and dataset.ts is impossible because
 *     this module imports from dataset.ts.
 *
 * Consumers
 * ---------
 *   - src/components/seo/citation-block.tsx – the tabbed UI block
 *     rendered on /dataset, /glossary/[slug], /benchmarks/[slug].
 *   - src/app/cite/[id]/page.tsx – the HTML permalink view.
 *   - src/app/cite/[id]/[format]/route.ts – text/plain (and
 *     application/x-bibtex / application/x-research-info-systems)
 *     format-specific exports.
 *   - src/app/sitemap.ts – emits one entry per cite ID so AI crawlers
 *     discover the permalink space without depending on inline links.
 */

import {
  BASE_URL,
  FOUNDER,
  ORGANIZATION,
} from "@/lib/seo/entity";
import {
  GLOSSARY,
  type GlossaryEntry,
} from "@/lib/glossary";
import {
  BENCHMARK_ENTRIES,
  type BenchmarkEntry,
} from "@/lib/benchmarks";
import {
  DATASET_BIBTEX,
  DATASET_CITATION,
  DATASET_LICENSE_SPDX,
  DATASET_LICENSE_URL,
  DATASET_NAME,
  DATASET_SLUG,
  DATASET_URLS,
  DATASET_VERSION,
} from "@/lib/seo/dataset";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/** Citation surface the artifact belongs to. */
export type CitationSurface = "glossary" | "benchmark" | "dataset";

/**
 * Citation formats the library can emit. The route handler maps each
 * to the appropriate MIME type:
 *   bibtex   → application/x-bibtex
 *   ris      → application/x-research-info-systems
 *   csl-json → application/vnd.citationstyles.csl+json
 *   apa | mla | chicago → text/plain
 */
export type CitationFormat =
  | "bibtex"
  | "ris"
  | "apa"
  | "mla"
  | "chicago"
  | "csl-json";

/** Stable, immutable list of supported format slugs. Order matters – the
 *  UI block renders the formats in this order. */
export const CITATION_FORMATS: readonly CitationFormat[] = Object.freeze([
  "apa",
  "mla",
  "chicago",
  "bibtex",
  "ris",
  "csl-json",
]);

/**
 * Normalized citation record. The output of every builder. The format
 * helpers below consume only this shape, so adding a new surface type
 * later is one builder function plus one registry entry.
 */
export interface Citation {
  /** Stable permalink ID, e.g. "glossary-hook". */
  readonly id: string;
  /** Which surface this artifact belongs to. */
  readonly surface: CitationSurface;
  /** Single-line title fit for the page header and for the citation
   *  string itself. Already in title-case. */
  readonly title: string;
  /** Author display name – "Maryan" for every artifact today. */
  readonly authorName: string;
  /** Publisher / site name – "Unlock SaaS". */
  readonly publisherName: string;
  /** Canonical URL of the live artifact – the URL that appears in
   *  every formatted citation string. */
  readonly canonicalUrl: string;
  /** Year of last verification, e.g. 2026. */
  readonly year: number;
  /** ISO date of last verification, e.g. "2026-05-19". */
  readonly lastVerifiedIso: string;
  /** One-sentence abstract for the CSL-JSON / RIS abstract field. */
  readonly abstract: string;
  /** BibTeX entry key, e.g. "unlocksaas_glossary_hook_2026". Letters,
   *  digits, and underscores only – BibTeX-safe by construction. */
  readonly bibtexKey: string;
  /** Optional version pin (only the dataset uses it). */
  readonly version?: string;
  /** Optional license SPDX identifier (only the dataset declares it). */
  readonly licenseSpdx?: string;
  /** Optional license URL (only the dataset declares it). */
  readonly licenseUrl?: string;
  /** Pre-built BibTeX – for the dataset we honor the carefully-crafted
   *  string in seo/dataset.ts verbatim instead of re-rendering from the
   *  fields above. undefined means the formatter generates it. */
  readonly bibtexOverride?: string;
}

// ---------------------------------------------------------------------------
// Build-time constants
// ---------------------------------------------------------------------------

/**
 * Build-time accessed date. Static pages do not know when a reader
 * visits, so the honest value is "the day this build shipped." Fixed
 * at module load – every citation rendered in this server instance
 * shares the same accessed date, which is what an academic citer
 * expects (one Accessed field per build).
 */
const ACCESSED_ISO: string = new Date().toISOString().slice(0, 10);

/** Permalink namespace. /cite/<id> is the canonical permalink URL. */
const CITE_NAMESPACE = `${BASE_URL}/cite`;

// ---------------------------------------------------------------------------
// BibTeX key sanitization
// ---------------------------------------------------------------------------

/**
 * BibTeX entry keys must contain only ASCII letters, digits, and a
 * narrow punctuation set ({-_:.}). LaTeX engines accept underscores
 * but BibDesk and Zotero quietly mangle anything else. We restrict to
 * `[a-z0-9_]` to keep the keys portable across every reference
 * manager indie founders actually use.
 */
const BIBTEX_KEY_BAD_CHARS = /[^a-z0-9_]+/g;

function sanitizeBibtexKey(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(BIBTEX_KEY_BAD_CHARS, "")
    .replace(/^_+|_+$/g, "");
}

// ---------------------------------------------------------------------------
// Citation builders – one per source surface
// ---------------------------------------------------------------------------

/** Convert "landing-page-conversion-rate" → "Landing Page Conversion Rate". */
function titleCaseFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter((s) => s.length > 0)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

function buildGlossaryCitation(entry: GlossaryEntry): Citation {
  const id = `glossary-${entry.slug}`;
  const year = Number(entry.lastVerified.slice(0, 4));
  const title = `${entry.term} – Definition for Indie SaaS Founders`;
  return {
    id,
    surface: "glossary",
    title,
    authorName: FOUNDER.name,
    publisherName: ORGANIZATION.name,
    canonicalUrl: `${BASE_URL}/glossary/${entry.slug}`,
    year,
    lastVerifiedIso: entry.lastVerified,
    abstract: entry.shortDefinition,
    bibtexKey: sanitizeBibtexKey(`unlocksaas_glossary_${entry.slug}_${year}`),
  };
}

function buildBenchmarkCitation(entry: BenchmarkEntry): Citation {
  const id = `benchmark-${entry.slug}`;
  const year = Number(entry.lastVerified.slice(0, 4));
  // The metaTitle is already trimmed to under 60 chars and reads as a
  // citation-ready phrase ("Average Landing Page Conversion Rate (SaaS
  // Benchmarks)"). Re-use as the citation title verbatim.
  return {
    id,
    surface: "benchmark",
    title: entry.metaTitle,
    authorName: FOUNDER.name,
    publisherName: ORGANIZATION.name,
    canonicalUrl: `${BASE_URL}/benchmarks/${entry.slug}`,
    year,
    lastVerifiedIso: entry.lastVerified,
    abstract: entry.aeoAnswer,
    bibtexKey: sanitizeBibtexKey(`unlocksaas_benchmark_${entry.slug}_${year}`),
  };
}

/**
 * Single dataset artifact citation. The dataset has its own bespoke
 * citation + BibTeX in seo/dataset.ts (carefully field-aligned with
 * Google Dataset Search and Zenodo's accepted shapes), so we plumb
 * those through verbatim instead of re-deriving from raw fields. The
 * permalink ID encodes the version so a v2 dataset gets its own
 * citation slot without breaking the v1 anchor.
 */
function buildDatasetCitation(): Citation {
  const versionFlat = DATASET_VERSION.replace(/\./g, "-");
  const id = `dataset-${DATASET_SLUG}-v${versionFlat}`;
  const year = Number(DATASET_BUNDLE_LAST_VERIFIED_YEAR);
  return {
    id,
    surface: "dataset",
    // Title carries no version – the dedicated `version` field below
    // is the canonical source. MLA / Chicago / APA formatters append
    // ", version X.Y.Z" / "(Version X.Y.Z)" respectively. Embedding
    // the version inside the title too would produce duplicated
    // "Title (v1.0.0), version 1.0.0" output in Chicago / MLA.
    title: DATASET_NAME,
    authorName: FOUNDER.name,
    publisherName: ORGANIZATION.name,
    canonicalUrl: DATASET_URLS.landing,
    year,
    lastVerifiedIso: DATASET_BUNDLE_LAST_VERIFIED,
    abstract:
      "An open editorial dataset of indie SaaS marketing analysis: funnel teardowns, pricing teardowns, head-to-head comparisons, named-competitor alternative pages, and canonical category buckets. CC-BY-4.0 licensed, JSON and CSV downloads, every row independently verifiable.",
    bibtexKey: sanitizeBibtexKey(
      `unlocksaas_${DATASET_SLUG}_${versionFlat}`,
    ),
    version: DATASET_VERSION,
    licenseSpdx: DATASET_LICENSE_SPDX,
    licenseUrl: DATASET_LICENSE_URL,
    bibtexOverride: DATASET_BIBTEX,
  };
}

// ---------------------------------------------------------------------------
// Dataset last-verified hoist
// ---------------------------------------------------------------------------
//
// The dataset's lastVerified field lives on the bundle, but importing
// DATASET_BUNDLE pulls the entire 5-table object graph into this module
// just to read one ISO string. Import the freshness primitive directly
// instead so the citation module stays cheap.

import { LAST_VERIFIED_DATE } from "@/lib/seo/freshness";

const DATASET_BUNDLE_LAST_VERIFIED: string = LAST_VERIFIED_DATE;
const DATASET_BUNDLE_LAST_VERIFIED_YEAR: string =
  LAST_VERIFIED_DATE.slice(0, 4);

// ---------------------------------------------------------------------------
// Registry – materialized once at module load
// ---------------------------------------------------------------------------

/**
 * Map of ID → Citation. Build once at module load, freeze, and reuse
 * for every consumer call. Glossary + benchmarks + dataset share the
 * same namespace; the surface prefix on every ID makes collisions
 * impossible by construction.
 */
function buildRegistry(): ReadonlyMap<string, Citation> {
  const map = new Map<string, Citation>();
  for (const g of GLOSSARY) {
    const c = buildGlossaryCitation(g);
    if (map.has(c.id)) {
      throw new Error(`citations.ts: duplicate citation id "${c.id}"`);
    }
    map.set(c.id, c);
  }
  for (const b of BENCHMARK_ENTRIES) {
    const c = buildBenchmarkCitation(b);
    if (map.has(c.id)) {
      throw new Error(`citations.ts: duplicate citation id "${c.id}"`);
    }
    map.set(c.id, c);
  }
  const ds = buildDatasetCitation();
  if (map.has(ds.id)) {
    throw new Error(`citations.ts: duplicate citation id "${ds.id}"`);
  }
  map.set(ds.id, ds);
  return map;
}

const REGISTRY: ReadonlyMap<string, Citation> = buildRegistry();

/**
 * Resolve an artifact slug + surface to its citation record. The
 * three pSEO consumers call this with their local slug; the registry
 * returns the citation if the surface→slug pair maps to a registered
 * artifact, or undefined otherwise.
 */
export function getCitationForGlossary(
  slug: string,
): Citation | undefined {
  return REGISTRY.get(`glossary-${slug}`);
}

export function getCitationForBenchmark(
  slug: string,
): Citation | undefined {
  return REGISTRY.get(`benchmark-${slug}`);
}

export function getCitationForDataset(): Citation {
  // Dataset is a single artifact; the registry is guaranteed to carry
  // it (build-time invariant in buildRegistry). The throw is a
  // defense-in-depth fence against future refactors that might drop
  // the dataset row by accident.
  const versionFlat = DATASET_VERSION.replace(/\./g, "-");
  const id = `dataset-${DATASET_SLUG}-v${versionFlat}`;
  const c = REGISTRY.get(id);
  if (!c) {
    throw new Error(
      `citations.ts: dataset citation "${id}" missing from registry`,
    );
  }
  return c;
}

/**
 * Resolve any ID. Used by /cite/[id]/page.tsx and
 * /cite/[id]/[format]/route.ts. Returns undefined for unknown IDs so
 * the route handlers can 404 honestly.
 */
export function getCitationById(id: string): Citation | undefined {
  return REGISTRY.get(id);
}

/**
 * All registered IDs. Consumed by:
 *   - generateStaticParams in /cite/[id] so every ID prerenders at
 *     build time.
 *   - sitemap.ts so AI crawlers see the full permalink surface.
 */
export function allCitationIds(): readonly string[] {
  return Array.from(REGISTRY.keys());
}

/** All registered citations. Used by the dataset.md and llms-feed
 *  exports if they ever want to advertise the cite-permalink layer. */
export function allCitations(): readonly Citation[] {
  return Array.from(REGISTRY.values());
}

/** Permalink URL for an ID. */
export function citationPermalinkUrl(id: string): string {
  return `${CITE_NAMESPACE}/${id}`;
}

/** Format-specific export URL. */
export function citationFormatUrl(id: string, format: CitationFormat): string {
  return `${CITE_NAMESPACE}/${id}/${format}`;
}

// ---------------------------------------------------------------------------
// Format renderers – string → string, no I/O
// ---------------------------------------------------------------------------

/**
 * Escape characters BibTeX treats as special. The set is small:
 *   { } \ % $ & # _ ~ ^
 * For citation values (title, author, abstract) we either curly-brace-
 * protect the field (titles) or quote-escape internal special chars
 * (everything else). A title is always wrapped in {...} so internal
 * unicode survives biber processing.
 */
const BIBTEX_VALUE_SPECIAL = /([&%$#_])/g;

function bibtexEscape(value: string): string {
  return value.replace(BIBTEX_VALUE_SPECIAL, "\\$1");
}

export function formatBibtex(c: Citation): string {
  if (c.bibtexOverride) return c.bibtexOverride;
  const titleProtected = `{${bibtexEscape(c.title)}}`;
  const fields: string[] = [
    `  author       = {${bibtexEscape(c.authorName)}}`,
    `  title        = {${titleProtected}}`,
    `  howpublished = {\\url{${c.canonicalUrl}}}`,
    `  year         = {${c.year}}`,
    `  publisher    = {${bibtexEscape(c.publisherName)}}`,
    `  urldate      = {${ACCESSED_ISO}}`,
  ];
  if (c.licenseSpdx) {
    fields.push(`  note         = {Licensed under ${c.licenseSpdx}.}`);
  }
  return `@misc{${c.bibtexKey},\n${fields.join(",\n")}\n}`;
}

/**
 * RIS – Research Information Systems. Recognised by Zotero, Mendeley,
 * EndNote, Citavi, and every legacy academic tool. Field reference
 * keys are 2-letter ASCII codes per the RIS spec.
 *
 * Record-type selection (TY field):
 *   - Datasets emit `TY  - DATA` (Data File). Per the RIS Reference
 *     Manager profile, DATA is the canonical type for a downloadable
 *     dataset; both Zotero and Mendeley map it to the "Dataset" item
 *     type on import, which carries `version`, `license`, and `DOI`
 *     fields cleanly. Falling back to ELEC ("Electronic Citation")
 *     here would force the importer to coerce the record into a
 *     generic web-page slot and drop the version/license metadata.
 *   - Glossary + benchmark pages emit `TY  - ELEC` (Electronic
 *     Citation), the correct pick for an online article that isn't
 *     also published in a journal or book.
 *
 * Field guide used here:
 *   TY  - record type (DATA for datasets, ELEC for web pages)
 *   ID  - record ID (our cite-permalink ID)
 *   AU  - author
 *   TI  - title
 *   PY  - publication year (4-digit)
 *   DA  - date (YYYY/MM/DD)
 *   PB  - publisher
 *   UR  - URL
 *   AB  - abstract
 *   LA  - language (RFC 5646 tag)
 *   M3  - type of work (only emitted for datasets; "Open dataset")
 *   CY  - place of publication
 *   ET  - edition / version
 *   AN  - accession number
 *   N1  - notes (license attribution)
 *   Y2  - accessed date (YYYY/MM/DD)
 *   ER  - end of record (sentinel)
 */
const RIS_TYPE_BY_SURFACE: Readonly<Record<CitationSurface, string>> =
  Object.freeze({
    dataset: "DATA",
    glossary: "ELEC",
    benchmark: "ELEC",
  });

export function formatRis(c: Citation): string {
  const da = c.lastVerifiedIso.replace(/-/g, "/");
  const ty = RIS_TYPE_BY_SURFACE[c.surface];
  const lines: string[] = [
    `TY  - ${ty}`,
    `ID  - ${c.id}`,
    `AU  - ${c.authorName}`,
    `TI  - ${c.title}`,
    `PY  - ${c.year}`,
    `DA  - ${da}`,
    `PB  - ${c.publisherName}`,
    `UR  - ${c.canonicalUrl}`,
    `AB  - ${c.abstract}`,
    "LA  - en-US",
  ];
  // Datasets carry a human-readable "type of work" so reference
  // managers that surface M3 (Zotero shows it under "Extra") display
  // "Open dataset" instead of leaving the slot blank.
  if (c.surface === "dataset") lines.push("M3  - Open dataset");
  if (c.version) lines.push(`ET  - ${c.version}`);
  if (c.licenseSpdx) lines.push(`N1  - Licensed under ${c.licenseSpdx}.`);
  lines.push(`Y2  - ${ACCESSED_ISO.replace(/-/g, "/")}`);
  lines.push("ER  - ");
  return lines.join("\n");
}

/**
 * APA 7th edition – online source.
 *
 * Pattern: Author, A. A. (Year, Month Day). Title of work. Publisher. URL
 * For online citations APA 7 includes month/day after year when the
 * source is updated; we have the full ISO date so we use it.
 */
const MONTHS_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function isoToLongDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const monthName = MONTHS_LONG[m - 1] ?? "";
  return `${y}, ${monthName} ${d}`;
}

function isoToMlaDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const monthName = MONTHS_LONG[m - 1] ?? "";
  return `${d} ${monthName} ${y}`;
}

export function formatApa(c: Citation): string {
  // APA italicises titles in body text; in plain-text output the
  // convention is to wrap the title in asterisks or leave it bare.
  // We leave it bare (plain text, no markdown noise) and trust the
  // citer to italicise on paste.
  const versionSuffix = c.version ? ` (Version ${c.version})` : "";
  const longDate = isoToLongDate(c.lastVerifiedIso);
  return `${c.authorName}. (${longDate}). ${c.title}${versionSuffix}. ${c.publisherName}. ${c.canonicalUrl}`;
}

/**
 * MLA 9th edition – online source.
 *
 * Pattern: Author. "Title." Publisher, Day Month Year, URL. Accessed Day Month Year.
 */
export function formatMla(c: Citation): string {
  const versionSuffix = c.version ? `, version ${c.version}` : "";
  const updated = isoToMlaDate(c.lastVerifiedIso);
  const accessed = isoToMlaDate(ACCESSED_ISO);
  const url = c.canonicalUrl.replace(/^https?:\/\//, "");
  return `${c.authorName}. "${c.title}${versionSuffix}." ${c.publisherName}, ${updated}, ${url}. Accessed ${accessed}.`;
}

/**
 * Chicago Manual of Style 17th (notes-and-bibliography form, online source).
 *
 * Pattern: Author. "Title." Publisher. Last modified Month Day, Year. URL.
 */
export function formatChicago(c: Citation): string {
  const versionSuffix = c.version ? `, version ${c.version}` : "";
  const [y, m, d] = c.lastVerifiedIso.split("-").map(Number);
  const monthName = MONTHS_LONG[m - 1] ?? "";
  return `${c.authorName}. "${c.title}${versionSuffix}." ${c.publisherName}. Last modified ${monthName} ${d}, ${y}. ${c.canonicalUrl}.`;
}

/**
 * CSL-JSON (Citation Style Language) – the JSON shape Zotero, Citation.js,
 * and Pandoc consume. Emits a single-item array (one citation per
 * artifact) so the file is drop-in importable.
 *
 * Field guide: https://github.com/citation-style-language/schema
 * "webpage" is the correct CSL type for an online article that isn't
 * also published in a journal or book.
 */
export function formatCslJson(c: Citation): string {
  const [y, m, d] = c.lastVerifiedIso.split("-").map(Number);
  const item: Record<string, unknown> = {
    id: c.id,
    type: c.surface === "dataset" ? "dataset" : "webpage",
    title: c.title,
    abstract: c.abstract,
    URL: c.canonicalUrl,
    author: [{ literal: c.authorName }],
    publisher: c.publisherName,
    issued: { "date-parts": [[y, m, d]] },
    accessed: {
      "date-parts": [
        ACCESSED_ISO.split("-").map(Number) as [number, number, number],
      ],
    },
    language: "en-US",
  };
  if (c.version) item.version = c.version;
  if (c.licenseSpdx) {
    item["license"] = c.licenseUrl
      ? `${c.licenseSpdx} <${c.licenseUrl}>`
      : c.licenseSpdx;
  }
  return JSON.stringify([item], null, 2);
}

// ---------------------------------------------------------------------------
// Format → renderer + MIME type table
// ---------------------------------------------------------------------------

export interface FormatDescriptor {
  /** Human-readable label for the UI tab. */
  readonly label: string;
  /** Tiny one-liner explaining the format to a non-academic reader. */
  readonly hint: string;
  /** MIME type emitted by the format-specific route handler. */
  readonly contentType: string;
  /** File extension suggested by the Content-Disposition header. */
  readonly fileExt: string;
  /** Renderer for this format. */
  readonly render: (c: Citation) => string;
}

export const FORMAT_DESCRIPTORS: Readonly<
  Record<CitationFormat, FormatDescriptor>
> = Object.freeze({
  apa: {
    label: "APA 7th",
    hint: "Academic – paste into the References section.",
    contentType: "text/plain; charset=utf-8",
    fileExt: "txt",
    render: formatApa,
  },
  mla: {
    label: "MLA 9th",
    hint: "Humanities – paste into the Works Cited list.",
    contentType: "text/plain; charset=utf-8",
    fileExt: "txt",
    render: formatMla,
  },
  chicago: {
    label: "Chicago 17th",
    hint: "Long-form / journalism – paste into the bibliography.",
    contentType: "text/plain; charset=utf-8",
    fileExt: "txt",
    render: formatChicago,
  },
  bibtex: {
    label: "BibTeX",
    hint: "LaTeX / Overleaf – import into .bib files.",
    contentType: "application/x-bibtex; charset=utf-8",
    fileExt: "bib",
    render: formatBibtex,
  },
  ris: {
    label: "RIS",
    hint: "Zotero / Mendeley / EndNote – import a single record.",
    contentType: "application/x-research-info-systems; charset=utf-8",
    fileExt: "ris",
    render: formatRis,
  },
  "csl-json": {
    label: "CSL-JSON",
    hint: "Pandoc / Citation.js – the JSON shape for the modern toolchain.",
    contentType: "application/vnd.citationstyles.csl+json; charset=utf-8",
    fileExt: "json",
    render: formatCslJson,
  },
});

/** Guard for the dynamic-segment route. */
export function isCitationFormat(value: string): value is CitationFormat {
  return (CITATION_FORMATS as readonly string[]).includes(value);
}

/**
 * Suggested download filename for a citation in a given format.
 * Used by the format route handler's Content-Disposition header.
 */
export function citationDownloadFilename(
  c: Citation,
  format: CitationFormat,
): string {
  return `${c.id}.${FORMAT_DESCRIPTORS[format].fileExt}`;
}
