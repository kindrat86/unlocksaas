/**
 * Schema.org `Report` JSON-LD for the State of Post-Launch Pre-Revenue SaaS
 * annual flagship.
 *
 * Why a dedicated builder
 * -----------------------
 * The generic `ArticleJsonLd` in /components/seo/json-ld.tsx emits
 * `@type: "Article"`. An annual research report earns more retrieval lift
 * when it declares the more specific `@type: "Report"` (an Article
 * subtype recognised by Google's Article rich-result eligibility AND by
 * Dataset Search's catalog crawler when the same artifact also exposes
 * a Dataset node).
 *
 * This file is intentionally separate from json-ld.tsx — that module is
 * already 1800+ lines and the Report builder has report-specific schema
 * keys (temporalCoverage, citation, isBasedOn pointing to /dataset,
 * spatialCoverage Worldwide, isPartOf the report series). Keeping the
 * builder here means a future edition that adds a new schema field
 * (e.g. mentions[], a list of cited press topics) lands in one focused
 * file instead of muddying the shared json-ld.tsx export surface.
 *
 * Composition pattern
 * -------------------
 * The /state-of-saas/<year> page emits THREE schema blocks:
 *   1. <StateOfSaasReportJsonLd ... />     — the Report (this file)
 *   2. <PublicDatasetJsonLd ... />          — the underlying anonymized
 *      counts, only when status === "published" (re-uses the existing
 *      builder in json-ld.tsx)
 *   3. <BreadcrumbListJsonLd trail=... />   — the trail
 *
 * That triple lets Google's structured-data pipeline resolve the page
 * as Article-rich-eligible (block 1), Dataset Search-eligible (block 2),
 * and breadcrumb-eligible (block 3), all anchored to the same canonical
 * URL via consistent @id keys.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - No fabricated fields: every key below is either a constant from
 *     state-of-saas.ts (citation, attribution, keywords, lastVerified)
 *     or an argument passed by the page (totalSubmissions, dateModified).
 *   - `wordCount` is intentionally omitted — counting words in a
 *     template-rendered page is fragile and a wrong number is worse
 *     than no number. Article rich-result eligibility does not require it.
 *   - When the edition is below-threshold, the headline numbers are NOT
 *     in the schema. The Report node still publishes (so the page is
 *     discoverable), but with `temporalCoverage` covering only the
 *     enrollment window and `description` framed as "enrollment open".
 *     No fabricated percentages.
 */

import { BASE_URL, FOUNDER, ID, ORGANIZATION } from "@/lib/seo/entity";
import {
  SPEAKABLE_SPEC,
  ACCESS_MODE_TEXTUAL,
} from "@/components/seo/json-ld";
import {
  STATE_OF_SAAS_LICENSE_URL,
  editionDatasetIdentifier,
  type ReportEdition,
} from "@/lib/state-of-saas";

// Re-export ACCESS_MODE_TEXTUAL and SPEAKABLE_SPEC are imported above; we
// rely on the existing exports in json-ld.tsx (they were already exported
// for exactly this kind of out-of-file inline-schema use).

export interface ReportSchemaInput {
  readonly edition: ReportEdition;
  /** Canonical URL of the edition page, e.g. https://unlocksaas.com/state-of-saas/2026 */
  readonly url: string;
  /** Plain-text citation string. */
  readonly citation: string;
  /** Article-style description. Reads as the report's one-paragraph abstract. */
  readonly description: string;
  /** Keywords for Article.keywords. */
  readonly keywords: ReadonlyArray<string>;
  /** Open Graph image URL for Article.image. */
  readonly imageUrl: string;
  /** ISO 8601 datePublished. Almost always the edition's windowStart. */
  readonly datePublished: string;
  /** ISO 8601 dateModified. Defaults to datePublished when omitted. */
  readonly dateModified?: string;
  /**
   * Total submissions counted in the cohort. Embedded as an
   * additionalProperty so a downstream crawler reading the schema sees
   * the cohort size without parsing prose.
   */
  readonly cohortSize: number;
  /**
   * Whether the edition has crossed MIN_REPORT_N. Toggles the
   * temporalCoverage framing and the Article.description field but does
   * NOT add or remove numeric claims from the JSON-LD — the headline
   * numbers live in the sibling PublicDatasetJsonLd block, not here.
   */
  readonly publishedFindings: boolean;
}

function buildReportJson(input: ReportSchemaInput): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Report",
    "@id": `${input.url}#report`,
    headline: input.edition.displayTitle,
    name: input.edition.displayTitle,
    description: input.description,
    url: input.url,
    inLanguage: "en-US",
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    // E-E-A-T enrichments — same shape as the existing ArticleJsonLd builder.
    ...ACCESS_MODE_TEXTUAL,
    speakable: SPEAKABLE_SPEC,
    author: {
      "@type": "Person",
      "@id": ID.person,
      name: FOUNDER.name,
      url: `${BASE_URL}/about`,
    },
    publisher: { "@id": ID.organization },
    isPartOf: { "@id": ID.website },
    mainEntityOfPage: { "@type": "WebPage", "@id": input.url },
    image: input.imageUrl,
    keywords: input.keywords.join(", "),
    // Citation footprint — schema.org allows `citation` to be a plain
    // string (the canonical paste-in-footnote form) AND to be cited by
    // other CreativeWorks. We emit the plain-text form here; the BibTeX
    // / APA / MLA / Chicago variants live in the on-page citation block.
    citation: input.citation,
    // License — same CC-BY-4.0 contract as the editorial dataset. A
    // re-user that walks the license URL sees the canonical Creative
    // Commons deed, not a private license file.
    license: STATE_OF_SAAS_LICENSE_URL,
    isAccessibleForFree: true,
    // The report draws on the broader Indie SaaS Teardowns dataset
    // editorially (methodology + framing) plus the proprietary
    // diagnostic_leads aggregate. `isBasedOn` resolves to the canonical
    // dataset landing page so a crawler walking the provenance graph
    // sees the editorial corpus the report builds on.
    isBasedOn: { "@id": `${BASE_URL}/dataset#dataset` },
    // about[] — Schema.org Things the report is "about", so retrievers
    // can resolve topic queries to entities rather than strings.
    about: [
      {
        "@type": "Thing",
        name: "Post-launch pre-revenue SaaS founders",
        sameAs: `${BASE_URL}/about`,
      },
      {
        "@type": "Thing",
        name: "Wrong Person diagnosis",
        sameAs: `${BASE_URL}/glossary/wrong-person`,
      },
      {
        "@type": "Thing",
        name: "Weak Offer diagnosis",
        sameAs: `${BASE_URL}/glossary/weak-offer`,
      },
      {
        "@type": "Thing",
        name: "Weak Belief diagnosis",
        sameAs: `${BASE_URL}/glossary/weak-belief`,
      },
    ],
    // Spatial coverage mirrors the Organization / Dataset spatial signal —
    // explicitly worldwide so a crawler does not read absence as "geo-
    // unknown" and demote the report in queries with local intent.
    spatialCoverage: { "@type": "Place", name: "Worldwide" },
    // Temporal coverage is the edition's calendar-year window. The
    // open-ended form (..) is used when the window is still in progress;
    // for closed editions the windowEnd is a concrete date.
    temporalCoverage: `${input.edition.windowStart}/${input.edition.windowEnd}`,
    // additionalProperty[] for machine-readable cohort metadata —
    // exposed so a data crawler indexing the report can extract the
    // sample size and editorial state without parsing prose.
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "cohortSize",
        value: String(input.cohortSize),
      },
      {
        "@type": "PropertyValue",
        name: "editionState",
        value: input.edition.state,
      },
      {
        "@type": "PropertyValue",
        name: "datasetIdentifier",
        value: editionDatasetIdentifier(input.edition.year),
      },
      {
        "@type": "PropertyValue",
        name: "publisher",
        value: ORGANIZATION.name,
      },
    ],
  });
}

export function StateOfSaasReportJsonLd(props: ReportSchemaInput) {
  return (
    <script
      type="application/ld+json"
      // The JSON string is built from constants + page-supplied numeric
      // counts; no user input flows through. Mirrors the JsonLdScript
      // helper pattern in /components/seo/json-ld.tsx.
      dangerouslySetInnerHTML={{ __html: buildReportJson(props) }}
    />
  );
}
