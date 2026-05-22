import type { Metadata } from "next";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import {
  BreadcrumbListJsonLd,
  PublicDatasetJsonLd,
} from "@/components/seo/json-ld";
import { CitationBlock } from "@/components/seo/citation-block";
import { getCitationForDataset } from "@/lib/citations";
import { markdownAlternate } from "@/lib/seo/markdown-alternates";
import { DEFAULT_OG_IMAGES } from "@/lib/seo/og-image";
import {
  BASE_URL,
  DATASET_DOI,
  DATASET_DOI_URL,
  DATASET_EXTERNAL_REGISTRATIONS,
  FOUNDER,
  ORGANIZATION,
} from "@/lib/seo/entity";
import {
  DATASET_ALTERNATE_NAMES,
  DATASET_ATTRIBUTION,
  DATASET_BUNDLE,
  DATASET_CITATION,
  DATASET_CSV_COLUMNS,
  DATASET_KEYWORDS,
  DATASET_LICENSE_SPDX,
  DATASET_LICENSE_URL,
  DATASET_MEASUREMENT_TECHNIQUE,
  DATASET_NAME,
  DATASET_PER_TABLE_CSV,
  DATASET_PER_TABLE_SLUGS,
  DATASET_PRIMARY_IDENTIFIER,
  DATASET_SLUG,
  DATASET_URLS,
  DATASET_VERSION,
  perTableCsvUrl,
} from "@/lib/seo/dataset";

/**
 * /dataset — landing page for the Indie SaaS Teardowns public dataset.
 *
 * Surface C (linkable asset). The HTML page that markets the dataset to
 * researchers, indie founders, newsletter writers, and academics. The
 * actual data lives in `/dataset/indie-saas-teardowns.json` and `.csv`;
 * this page exists to make the downloads citable and trustworthy.
 *
 * Why this page exists
 * --------------------
 * A raw download URL is a hard sell. A page with:
 *   - a one-paragraph plain-English description
 *   - the row counts per table
 *   - the column contract
 *   - the license (CC-BY-4.0) stated unambiguously
 *   - the attribution clause spelled out verbatim
 *   - a plain-text citation + BibTeX
 *   - a "how this was built" link to the editorial policy
 *
 * ...is what gets bookmarked, linked from Hacker News and Indie Hackers,
 * cited in academic papers, and trusted by newsletter writers. The
 * download is the artifact; the landing is the proof.
 *
 * E-E-A-T discipline
 * ------------------
 *   - Author named (Maryan), editorial policy linked
 *   - lastVerified date prominent
 *   - License URL is canonical CC by 4.0, not a private license file
 *   - No claims about citation counts or external usage
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - Row counts are read live from the catalogs at build time. No
 *     fabricated "thousands of entries."
 *   - Citation block names only the founder; no fabricated co-authors.
 *   - No "as featured in" badges until earned mentions exist.
 *   - Bibtex year derives from lastVerified, not from a fabricated
 *     publication date.
 */

export const metadata: Metadata = {
  title: `${DATASET_NAME} (v${DATASET_VERSION}) — Open CC-BY-4.0 Download`,
  description: `An open editorial dataset of ${DATASET_BUNDLE.counts.total_rows} indie SaaS analyses: ${DATASET_BUNDLE.counts.funnel_teardowns} funnel teardowns, ${DATASET_BUNDLE.counts.pricing_teardowns} pricing teardowns, ${DATASET_BUNDLE.counts.comparisons} head-to-head comparisons, ${DATASET_BUNDLE.counts.alternatives} named-competitor pages, and ${DATASET_BUNDLE.counts.categories} category buckets. Free, CC-BY-4.0, JSON and CSV.`,
  alternates: markdownAlternate("/dataset", "/dataset.md"),
  keywords: DATASET_KEYWORDS as readonly string[] as string[],
  openGraph: {
    type: "article",
    title: `${DATASET_NAME} — Open CC-BY-4.0 Download`,
    description: `${DATASET_BUNDLE.counts.total_rows} indie SaaS analyses, free under CC-BY-4.0. JSON and CSV downloads.`,
    url: "/dataset",
    siteName: ORGANIZATION.name,
    publishedTime: DATASET_BUNDLE.lastVerified,
    modifiedTime: DATASET_BUNDLE.lastVerified,
    authors: [FOUNDER.name],
    images: DEFAULT_OG_IMAGES,
  },
  twitter: {
    card: "summary_large_image",
    title: `${DATASET_NAME} — Open CC-BY-4.0`,
    description: `${DATASET_BUNDLE.counts.total_rows} indie SaaS analyses. JSON + CSV. Free under CC-BY-4.0.`,
  },
  robots: { index: true, follow: true },
};

// Static — every value on the page derives from module-level constants.

const TRAIL = [
  { name: ORGANIZATION.name, url: `${BASE_URL}/` },
  { name: "Dataset", url: DATASET_URLS.landing },
] as const;

const TABLE_ROWS: ReadonlyArray<{
  key: keyof typeof DATASET_BUNDLE.schema;
  label: string;
  count: number;
}> = [
  {
    key: "funnel_teardowns",
    label: "Funnel teardowns",
    count: DATASET_BUNDLE.counts.funnel_teardowns,
  },
  {
    key: "pricing_teardowns",
    label: "Pricing teardowns",
    count: DATASET_BUNDLE.counts.pricing_teardowns,
  },
  {
    key: "comparisons",
    label: "Head-to-head comparisons",
    count: DATASET_BUNDLE.counts.comparisons,
  },
  {
    key: "alternatives",
    label: "Named-competitor alternatives",
    count: DATASET_BUNDLE.counts.alternatives,
  },
  {
    key: "categories",
    label: "Category buckets",
    count: DATASET_BUNDLE.counts.categories,
  },
];

export default function DatasetPage() {
  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <BreadcrumbListJsonLd trail={TRAIL} />
      <PublicDatasetJsonLd
        name={DATASET_NAME}
        slug={DATASET_SLUG}
        version={DATASET_VERSION}
        description={DATASET_BUNDLE.description}
        lastVerified={DATASET_BUNDLE.lastVerified}
        generatedAt={DATASET_BUNDLE.generatedAt}
        landingUrl={DATASET_URLS.landing}
        jsonUrl={DATASET_URLS.json}
        csvUrl={DATASET_URLS.csv}
        markdownUrl={DATASET_URLS.markdown}
        licenseUrl={DATASET_LICENSE_URL}
        citation={DATASET_CITATION}
        keywords={DATASET_KEYWORDS}
        variableMeasured={TABLE_ROWS.map((t) => t.label)}
        totalRows={DATASET_BUNDLE.counts.total_rows}
        primaryIdentifier={DATASET_PRIMARY_IDENTIFIER}
        alternateNames={DATASET_ALTERNATE_NAMES}
        measurementTechnique={DATASET_MEASUREMENT_TECHNIQUE}
        externalRegistrations={DATASET_EXTERNAL_REGISTRATIONS}
        doi={DATASET_DOI}
        perTableDistributions={DATASET_PER_TABLE_SLUGS.map((slug) => ({
          name: DATASET_PER_TABLE_CSV[slug].displayName,
          url: perTableCsvUrl(slug),
        }))}
      />

      <article className="max-w-3xl mx-auto">
        <nav
          aria-label="Breadcrumb"
          className="text-xs text-muted-foreground mb-6"
        >
          <Link
            href="/"
            className="underline underline-offset-4 hover:text-foreground"
          >
            {ORGANIZATION.name}
          </Link>
          <span className="mx-2" aria-hidden>
            ›
          </span>
          <span>Dataset</span>
        </nav>

        <header className="mb-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Open dataset · {DATASET_LICENSE_SPDX} · v{DATASET_VERSION}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            {DATASET_NAME}
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            {DATASET_BUNDLE.counts.total_rows} editorially verified rows
            of indie SaaS marketing analysis. Free to download, free to
            re-use, free to remix. The only obligation is attribution.
          </p>
        </header>

        <section className="mb-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href={DATASET_URLS.json}
            className="rounded-lg border border-border bg-card px-5 py-4 hover:border-foreground/40 transition-colors"
            data-speakable
          >
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
              Download
            </div>
            <div className="text-lg font-semibold">JSON bundle</div>
            <div className="text-sm text-muted-foreground mt-1">
              Full structured rows, schema descriptions, citation + license
              metadata. Roughly{" "}
              {DATASET_BUNDLE.counts.total_rows} entries across 5 tables.
            </div>
          </a>
          <a
            href={DATASET_URLS.csv}
            className="rounded-lg border border-border bg-card px-5 py-4 hover:border-foreground/40 transition-colors"
            data-speakable
          >
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
              Download
            </div>
            <div className="text-lg font-semibold">CSV (flat)</div>
            <div className="text-sm text-muted-foreground mt-1">
              One row per entry, denormalized. Drops into pandas, Excel,
              DuckDB without a parser. {DATASET_CSV_COLUMNS.length} columns.
            </div>
          </a>
        </section>

        <Separator className="my-8" />

        <section className="mb-10 space-y-4 leading-relaxed">
          <h2 className="text-2xl font-bold">What&rsquo;s in the bundle</h2>
          <p className="text-muted-foreground">
            Five tables, each a re-projection of a public surface on{" "}
            {ORGANIZATION.url}. Every row is independently verifiable by
            visiting the matching page and carries a dated{" "}
            <code className="text-sm">lastVerified</code> field.
          </p>

          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Table</th>
                  <th className="text-right px-4 py-2 font-medium">Rows</th>
                  <th className="text-left px-4 py-2 font-medium">
                    Canonical URL pattern
                  </th>
                </tr>
              </thead>
              <tbody>
                {TABLE_ROWS.map((row) => (
                  <tr key={row.key} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">{row.label}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {row.count}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      <code>
                        {DATASET_BUNDLE.schema[row.key].canonicalUrlPattern}
                      </code>
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-border bg-muted/20">
                  <td className="px-4 py-3 font-semibold">Total</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">
                    {DATASET_BUNDLE.counts.total_rows}
                  </td>
                  <td className="px-4 py-3" />
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <Separator className="my-8" />

        <section className="mb-10 space-y-4 leading-relaxed">
          <h2 className="text-2xl font-bold">Per-table CSV downloads</h2>
          <p className="text-muted-foreground">
            One file per table, with columns tailored to that record
            type&rsquo;s structure. Use these when you only need one slice
            and want richer columns than the universal flat CSV exposes.
            Same CC-BY-4.0 license; versioned filenames; stable
            append-only column contracts.
          </p>
          <ul className="space-y-2">
            {DATASET_PER_TABLE_SLUGS.map((slug) => {
              const entry = DATASET_PER_TABLE_CSV[slug];
              return (
                <li
                  key={slug}
                  className="flex items-center justify-between gap-3 border border-border rounded-lg px-4 py-3"
                >
                  <div className="min-w-0">
                    <a
                      href={perTableCsvUrl(slug)}
                      className="text-sm font-medium underline underline-offset-4"
                    >
                      {entry.displayName}
                    </a>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      <code>{slug}.csv</code> · {entry.columns.length}{" "}
                      columns · {entry.rowCount} rows
                    </div>
                  </div>
                  <a
                    href={perTableCsvUrl(slug)}
                    className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground shrink-0"
                  >
                    Download
                  </a>
                </li>
              );
            })}
          </ul>
        </section>

        <Separator className="my-8" />

        <section className="mb-10 space-y-4 leading-relaxed">
          <h2 className="text-2xl font-bold">CSV column contract</h2>
          <p className="text-muted-foreground">
            Stable, append-only order. Once published, a column may gain
            new optional values but its position never moves.
          </p>
          <ol className="list-decimal list-inside text-sm space-y-1 marker:text-muted-foreground">
            {DATASET_CSV_COLUMNS.map((col) => (
              <li key={col}>
                <code className="text-sm">{col}</code>
              </li>
            ))}
          </ol>
        </section>

        <Separator className="my-8" />

        <section className="mb-10 space-y-4 leading-relaxed">
          <h2 className="text-2xl font-bold">License and attribution</h2>
          <p>
            Released under the{" "}
            <a
              href={DATASET_LICENSE_URL}
              rel="license noopener noreferrer"
              target="_blank"
              className="underline underline-offset-4"
            >
              Creative Commons Attribution 4.0 International license (
              {DATASET_LICENSE_SPDX})
            </a>
            . You may copy, redistribute, remix, transform, and build upon
            the material for any purpose, including commercial — provided
            you give appropriate credit.
          </p>
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Required attribution.</strong>{" "}
            Paste this string in a footnote, methods note, or page footer:
          </p>
          <pre className="bg-muted/40 border border-border rounded-lg p-4 text-xs overflow-x-auto whitespace-pre-wrap">
            {DATASET_ATTRIBUTION}
          </pre>
        </section>

        {/*
          Citation – formal citation strings for academic / agent
          re-use. Replaces the previous hand-rolled plain-text +
          BibTeX duo with the shared CitationBlock (APA / MLA /
          Chicago / BibTeX / RIS / CSL-JSON) plus a link to the
          stable /cite/dataset-<slug>-v<version> permalink. The
          per-format download URLs (e.g. /cite/<id>/bibtex) are
          discoverable by reference managers without requiring the
          citer to copy text manually.
        */}
        <CitationBlock
          citation={getCitationForDataset()}
          headingLevel="h2"
        />
        <Separator className="my-8" />

        <Separator className="my-8" />

        <section className="mb-10 space-y-4 leading-relaxed">
          <h2 className="text-2xl font-bold">How this was built</h2>
          <p>
            Every row is a re-projection of a shipped page on{" "}
            {ORGANIZATION.url}. The editorial standard (sourcing, dating,
            corrections, no fabricated metrics) is documented at the{" "}
            <Link
              href="/editorial-policy"
              className="underline underline-offset-4"
            >
              editorial policy
            </Link>
            . If you spot a factual error, please open a correction request
            via{" "}
            <Link href="/contact" className="underline underline-offset-4">
              the contact page
            </Link>{" "}
            and it will be logged in the public corrections log.
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside marker:text-muted-foreground/50">
            <li>
              Author:{" "}
              <Link
                href="/about"
                className="text-foreground underline underline-offset-4"
              >
                {FOUNDER.name}
              </Link>
              , {FOUNDER.jobTitle}, {ORGANIZATION.name}
            </li>
            <li>Last verified: {DATASET_BUNDLE.lastVerified}</li>
            <li>Next editorial review: {DATASET_BUNDLE.nextReview}</li>
            <li>Version: v{DATASET_VERSION} (SemVer, additive-only)</li>
            <li>
              Markdown summary for AI agents:{" "}
              <Link
                href="/dataset.md"
                className="text-foreground underline underline-offset-4"
              >
                /dataset.md
              </Link>
            </li>
          </ul>
        </section>

        <Separator className="my-8" />

        <section className="mb-10 space-y-4 leading-relaxed">
          <h2 className="text-2xl font-bold">
            Catalog mirrors
          </h2>
          <p className="text-muted-foreground">
            The dataset is mirrored on recognised DataCatalogs so a
            researcher already searching one catalog finds the same
            corpus without leaving their tool. Each mirror is the same
            CC-BY-4.0 content under a parallel URL; the canonical
            citation always resolves back to{" "}
            <Link href="/dataset" className="underline underline-offset-4">
              {BASE_URL}/dataset
            </Link>
            .
          </p>
          <ul className="space-y-3">
            <li className="border border-border rounded-lg px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold">
                    GitHub (public mirror, weekly auto-PR)
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    A public mirror repository with a weekly auto-PR
                    refresh workflow. Every Monday at 06:00 UTC the
                    mirror's workflow pulls the canonical files from this
                    page and opens a pull request if anything changed.
                    Forks of the mirror create inbound links back to{" "}
                    {BASE_URL}/dataset.
                  </div>
                </div>
                {DATASET_EXTERNAL_REGISTRATIONS.some(
                  (r) => r.name === "GitHub",
                ) ? (
                  <a
                    href={
                      DATASET_EXTERNAL_REGISTRATIONS.find(
                        (r) => r.name === "GitHub",
                      )?.url
                    }
                    rel="noopener"
                    target="_blank"
                    className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground shrink-0"
                  >
                    View on GitHub →
                  </a>
                ) : null}
              </div>
              {DATASET_EXTERNAL_REGISTRATIONS.some(
                (r) => r.name === "GitHub",
              ) ? (
                <div className="mt-2 text-xs">
                  Live at{" "}
                  <a
                    href={
                      DATASET_EXTERNAL_REGISTRATIONS.find(
                        (r) => r.name === "GitHub",
                      )?.url
                    }
                    rel="noopener"
                    target="_blank"
                    className="underline underline-offset-4"
                  >
                    {
                      DATASET_EXTERNAL_REGISTRATIONS.find(
                        (r) => r.name === "GitHub",
                      )?.url
                    }
                  </a>
                </div>
              ) : (
                <div className="mt-2 text-xs text-muted-foreground">
                  Mirror repo provisioned; operator paste of
                  NEXT_PUBLIC_UNLOCKSAAS_GITHUB_DATASET_URL on Vercel
                  flips this row to live.
                </div>
              )}
            </li>
            <li className="border border-border rounded-lg px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold">
                    Hugging Face Datasets
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Pre-built dataset card + per-table CSV upload list.
                    Auto-converts to Parquet via HF Datasets Server.
                  </div>
                </div>
                <Link
                  href="/dataset/huggingface"
                  className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground shrink-0"
                >
                  Submission flow
                </Link>
              </div>
              {DATASET_EXTERNAL_REGISTRATIONS.some(
                (r) => r.name === "Hugging Face Datasets",
              ) ? (
                <div className="mt-2 text-xs">
                  Live at{" "}
                  <a
                    href={
                      DATASET_EXTERNAL_REGISTRATIONS.find(
                        (r) => r.name === "Hugging Face Datasets",
                      )?.url
                    }
                    rel="noopener noreferrer"
                    target="_blank"
                    className="underline underline-offset-4"
                  >
                    {
                      DATASET_EXTERNAL_REGISTRATIONS.find(
                        (r) => r.name === "Hugging Face Datasets",
                      )?.url
                    }
                  </a>
                </div>
              ) : (
                <div className="mt-2 text-xs text-muted-foreground">
                  Submission scheduled. Operator activation flow at{" "}
                  <Link
                    href="/dataset/huggingface"
                    className="underline underline-offset-4"
                  >
                    /dataset/huggingface
                  </Link>
                  .
                </div>
              )}
            </li>
            <li className="border border-border rounded-lg px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold">
                    Zenodo (CERN open-research repository)
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Mints a persistent DOI on deposit. DOIs are the
                    strongest dataset identifier class Google Dataset
                    Search recognises, and the canonical citation form
                    every academic reference manager pivots on.
                  </div>
                </div>
                <Link
                  href="/dataset/zenodo"
                  className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground shrink-0"
                >
                  Submission flow
                </Link>
              </div>
              {DATASET_DOI_URL ? (
                <div className="mt-2 text-xs">
                  DOI:{" "}
                  <a
                    href={DATASET_DOI_URL}
                    rel="noopener noreferrer"
                    target="_blank"
                    className="underline underline-offset-4 font-mono"
                  >
                    {DATASET_DOI}
                  </a>
                  {DATASET_EXTERNAL_REGISTRATIONS.some(
                    (r) => r.name === "Zenodo",
                  ) ? (
                    <>
                      {" "}· Live at{" "}
                      <a
                        href={
                          DATASET_EXTERNAL_REGISTRATIONS.find(
                            (r) => r.name === "Zenodo",
                          )?.url
                        }
                        rel="noopener noreferrer"
                        target="_blank"
                        className="underline underline-offset-4"
                      >
                        {
                          DATASET_EXTERNAL_REGISTRATIONS.find(
                            (r) => r.name === "Zenodo",
                          )?.url
                        }
                      </a>
                    </>
                  ) : null}
                </div>
              ) : (
                <div className="mt-2 text-xs text-muted-foreground">
                  Deposit scheduled. Operator activation flow at{" "}
                  <Link
                    href="/dataset/zenodo"
                    className="underline underline-offset-4"
                  >
                    /dataset/zenodo
                  </Link>
                  . On publication the DOI propagates into the canonical
                  Dataset JSON-LD, BibTeX, citation string, and HF
                  dataset card automatically.
                </div>
              )}
            </li>
          </ul>
        </section>

        <Separator className="my-8" />

        <section className="mb-10 space-y-3 leading-relaxed">
          <h2 className="text-2xl font-bold">Derived analyses</h2>
          <p className="text-sm leading-relaxed">
            Open research pieces built on top of this corpus. Each is
            independently citable with its own pinned version, rubric, and
            permalink so a future change to either the corpus or the analysis
            does not break a paper that quotes it.
          </p>
          <ul className="mt-2 space-y-2 text-sm">
            <li>
              <Link
                href="/research/funnel-hook-distribution"
                className="font-medium underline underline-offset-4"
              >
                Funnel Hook Distribution v1.0.0
              </Link>{" "}
              <span className="text-muted-foreground">
                – 5-axis structural rubric applied to every brunsonLens.hook
                pattern in the corpus. Methodology, per-pattern scores, and
                histogram open.
              </span>
            </li>
          </ul>
        </section>

        <Separator className="my-8" />

        <section className="mb-10 space-y-3 leading-relaxed">
          <h2 className="text-2xl font-bold">Want Parquet, Arrow, or Excel?</h2>
          <p className="text-sm text-muted-foreground">
            Convert the CSV with one line. We do not ship binary
            distributions because we cannot guarantee version-stable
            serialization for them without locking a runtime dependency
            we do not otherwise need.
          </p>
          <pre className="bg-muted/40 border border-border rounded-lg p-4 text-xs overflow-x-auto whitespace-pre-wrap">{`# Parquet (pandas + pyarrow)
import pandas as pd
df = pd.read_csv("${DATASET_URLS.csv}")
df.to_parquet("${DATASET_SLUG}-v${DATASET_VERSION}.parquet")

# DuckDB (zero-dep, in-memory)
duckdb> SELECT record_type, COUNT(*)
        FROM read_csv_auto('${DATASET_URLS.csv}')
        GROUP BY record_type;`}</pre>
        </section>
      </article>
    </div>
  );
}
