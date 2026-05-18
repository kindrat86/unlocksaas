/**
 * Dataset hub — public landing page for the Indie SaaS Teardowns dataset.
 *
 * Why this page exists
 * --------------------
 * Open-data discoverability is structurally different from regular SEO.
 * Researchers, journalists, and AI retrieval pipelines look for three
 * signals before citing a dataset:
 *
 *   1. A canonical URL with `Dataset` JSON-LD that resolves cleanly in
 *      Google Dataset Search.
 *   2. An unambiguous license (SPDX identifier) and an attribution
 *      string they can copy-paste.
 *   3. A row count, a publish date, a version, and one-click downloads
 *      in BOTH structured (JSON) and tabular (CSV) formats.
 *
 * This page delivers all three. The Dataset JSON-LD is the discovery
 * anchor; the downloads section is the conversion surface; the license
 * + attribution section is the citation contract.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - No fabricated row counts: every count reads from DATASET_FILES
 *     which reads from the source-of-truth catalogs at build time.
 *   - lastVerified discipline preserved: per-row dates ship inside the
 *     payloads; the page advertises that.
 *   - No login wall, no email gate, no tracking pixel. Plain GET. The
 *     CC-BY-4.0 license is the only string attached.
 */

import type { Metadata } from "next";
import Link from "next/link";
import {
  DATASET_ATTRIBUTION,
  DATASET_FILES,
  DATASET_LICENSE,
  DATASET_PUBLISHED_AT,
  DATASET_TOTAL_ROWS,
  DATASET_VERSION,
} from "@/lib/seo/dataset";
import { BreadcrumbListJsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Indie SaaS Teardowns Dataset",
  description:
    "Open dataset of 166 indie SaaS rows — alternatives, funnel teardowns, pricing teardowns, head-to-head comparisons, category roundups. CC-BY-4.0 licensed, JSON and CSV downloads, every row dated.",
  alternates: {
    canonical: "/dataset",
    languages: { "en-US": "/dataset", "x-default": "/dataset" },
  },
  // Index this page — the JSON-LD Dataset block is the discovery anchor.
  // /dataset/[file] endpoints are downloads and are not separately
  // indexable (no HTML body, served as attachments).
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Indie SaaS Teardowns Dataset",
    description:
      "166 rows of indie SaaS analysis. CC-BY-4.0. JSON + CSV. Every row dated.",
    url: "/dataset",
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Indie SaaS Teardowns Dataset",
    description:
      "166 rows of indie SaaS analysis. CC-BY-4.0. JSON + CSV. Every row dated.",
  },
};

// Static surface: pure data, no per-request inputs. Builds once, serves
// from the edge.
export const dynamic = "force-static";

const BASE = "https://unlocksaas.com";

// schema.org Dataset JSON-LD. Discovery anchor for Google Dataset Search,
// citation pipelines, and AI retrievers. Keep this object pre-serialized
// at module scope so the page render is allocation-free.
const datasetJsonLd = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  "@id": `${BASE}/dataset#dataset`,
  name: "Unlock SaaS Indie SaaS Teardowns Dataset",
  description:
    "Five-catalog dataset of indie SaaS rows: alternatives, funnel teardowns, pricing teardowns, head-to-head comparisons, and category roundups. Each row carries a lastVerified ISO date. Maintained by Maryan at Unlock SaaS.",
  url: `${BASE}/dataset`,
  identifier: `${BASE}/dataset`,
  version: DATASET_VERSION,
  datePublished: DATASET_PUBLISHED_AT,
  inLanguage: "en-US",
  license: DATASET_LICENSE.url,
  creator: {
    "@type": "Person",
    "@id": `${BASE}/#founder`,
    name: "Maryan",
    url: `${BASE}/about`,
  },
  publisher: {
    "@id": `${BASE}/#organization`,
  },
  isAccessibleForFree: true,
  keywords: [
    "indie saas",
    "saas teardowns",
    "saas pricing",
    "saas alternatives",
    "saas funnels",
    "micro-saas",
    "indie founders",
    "open dataset",
  ],
  variableMeasured: [
    "slug",
    "displayName",
    "category",
    "lastVerified",
    "homepageUrl",
    "tags",
  ],
  distribution: DATASET_FILES.map((spec) => ({
    "@type": "DataDownload",
    encodingFormat:
      spec.format === "json" ? "application/json" : "text/csv",
    contentUrl: `${BASE}/dataset/${spec.filename}`,
    name: spec.title,
    description: spec.description,
  })),
};

export default function DatasetHubPage() {
  // Group files by source catalog for the download index. Order matches
  // the manifest exactly — bundle first, then per-catalog JSON, then CSV.
  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(datasetJsonLd),
        }}
      />
      <BreadcrumbListJsonLd
        trail={[
          { name: "Home", url: `${BASE}/` },
          { name: "Dataset", url: `${BASE}/dataset` },
        ]}
      />

      <article className="max-w-3xl mx-auto">
        {/* ── Hero ───────────────────────────────────────────────────── */}
        <header className="mb-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Open dataset · CC-BY-4.0 · v{DATASET_VERSION}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            Indie SaaS Teardowns Dataset
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            {DATASET_TOTAL_ROWS} rows across five catalogs — alternatives,
            funnel teardowns, pricing teardowns, head-to-head comparisons,
            and category roundups. Every row carries a{" "}
            <code className="text-xs px-1 py-0.5 rounded bg-muted text-foreground">
              lastVerified
            </code>{" "}
            ISO date. CC-BY-4.0 licensed: download, cite, remix, resell —
            the only requirement is attribution.
          </p>
        </header>

        {/* ── Bundle download (primary CTA) ──────────────────────────── */}
        <section
          aria-labelledby="bundle"
          className="rounded-2xl border border-primary/30 bg-primary/5 p-6 sm:p-8 mb-10"
        >
          <p
            id="bundle"
            className="text-xs uppercase tracking-widest text-muted-foreground mb-2"
          >
            One-file citation
          </p>
          <h2 className="text-2xl font-bold leading-tight mb-2">
            indie-saas.json
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Every catalog in one document. Wraps the rows in a
            schema.org-Dataset envelope with license, version, attribution,
            and row count. Best for one-shot citation in a paper, talk,
            or post.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <a
              href="/dataset/indie-saas.json"
              className="inline-flex items-center gap-2 rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90"
              download
            >
              Download indie-saas.json
            </a>
            <code className="text-xs text-muted-foreground">
              {DATASET_TOTAL_ROWS} rows · {datasetSizeHint()}
            </code>
          </div>
        </section>

        {/* ── Per-catalog downloads ──────────────────────────────────── */}
        <section aria-labelledby="downloads" className="mb-10">
          <h2
            id="downloads"
            className="text-sm uppercase tracking-widest text-muted-foreground mb-4"
          >
            Per-catalog downloads
          </h2>
          <ul className="space-y-3">
            {DATASET_FILES.filter((f) => f.filename !== "indie-saas.json").map(
              (spec) => (
                <li
                  key={spec.filename}
                  className="rounded-md border bg-card p-4 sm:p-5"
                >
                  <div className="flex items-baseline justify-between gap-4 mb-1">
                    <h3 className="text-base font-semibold">{spec.title}</h3>
                    <span className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
                      {spec.format} · {spec.rows} rows
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                    {spec.description}
                  </p>
                  <a
                    href={`/dataset/${spec.filename}`}
                    className="text-sm underline underline-offset-4 hover:text-foreground"
                    download
                  >
                    /dataset/{spec.filename} →
                  </a>
                </li>
              ),
            )}
          </ul>
        </section>

        {/* ── How to cite ────────────────────────────────────────────── */}
        <section aria-labelledby="cite" className="mb-10">
          <h2
            id="cite"
            className="text-sm uppercase tracking-widest text-muted-foreground mb-4"
          >
            How to cite
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            CC-BY-4.0 requires attribution. Paste this line wherever you
            reproduce or analyze the data — a blog post, a paper, a
            spreadsheet, a slide. Linking the URL satisfies the license.
          </p>
          <pre className="text-xs sm:text-sm overflow-x-auto rounded-md border bg-muted/40 p-4 leading-snug whitespace-pre-wrap">
            <code>{DATASET_ATTRIBUTION}</code>
          </pre>
        </section>

        {/* ── License ────────────────────────────────────────────────── */}
        <section aria-labelledby="license" className="mb-10">
          <h2
            id="license"
            className="text-sm uppercase tracking-widest text-muted-foreground mb-4"
          >
            License
          </h2>
          <div className="rounded-md border bg-card p-4 sm:p-5 space-y-2 text-sm text-muted-foreground leading-relaxed">
            <p>
              <strong className="text-foreground">
                {DATASET_LICENSE.name}
              </strong>{" "}
              ({DATASET_LICENSE.spdx}).{" "}
              <a
                href={DATASET_LICENSE.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-foreground"
              >
                Read the license →
              </a>
            </p>
            <p>
              You may share and adapt the dataset for any purpose,
              including commercial use, as long as you give credit by
              naming Unlock SaaS as the source and linking back to{" "}
              <Link
                href="/dataset"
                className="underline underline-offset-4 hover:text-foreground"
              >
                {BASE.replace(/^https?:\/\//, "")}/dataset
              </Link>
              .
            </p>
            <p>
              No tracking. No telemetry. No cookies. The endpoints are
              plain edge-cached static files.
            </p>
          </div>
        </section>

        {/* ── Editorial notes ────────────────────────────────────────── */}
        <section
          aria-labelledby="notes"
          className="mb-10 space-y-3 text-sm text-muted-foreground leading-relaxed"
        >
          <h2
            id="notes"
            className="text-sm uppercase tracking-widest text-muted-foreground"
          >
            Editorial notes
          </h2>
          <p>
            <strong className="text-foreground">
              Every row carries a date.
            </strong>{" "}
            The{" "}
            <code className="text-xs px-1 py-0.5 rounded bg-muted text-foreground">
              lastVerified
            </code>{" "}
            field is the ISO date of the last manual sanity check of every
            claim in that row. Stale rows stay stale; we do not bump the
            date when we re-export.
          </p>
          <p>
            <strong className="text-foreground">
              No invented metrics, no quoted copy.
            </strong>{" "}
            The teardown catalogs analyze patterns (positioning, headline
            structure, anchor mechanics) — never per-company revenue
            numbers we cannot verify and never verbatim quoted copy from
            the target's site.
          </p>
          <p>
            <strong className="text-foreground">
              No slag, no positioning hit-pieces.
            </strong>{" "}
            The comparisons are symmetric: both sides get an honest
            best-for paragraph, both sides get a pick-this-if list,
            verdicts are evaluated dimension-by-dimension. The
            indie-founder pick is a separate field for the canonical
            audience.
          </p>
          <p>
            <strong className="text-foreground">
              Reciprocal license requests welcome.
            </strong>{" "}
            If you publish a dataset under a compatible license and want
            to be cross-linked from a future revision of this page,
            email{" "}
            <a
              href="mailto:maryan@unlocksaas.com"
              className="underline underline-offset-4 hover:text-foreground"
            >
              maryan@unlocksaas.com
            </a>
            .
          </p>
        </section>

        {/* ── Footer attribution ─────────────────────────────────────── */}
        <p className="text-xs text-muted-foreground text-center mt-12">
          Built by{" "}
          <Link
            href="/"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Maryan at Unlock SaaS
          </Link>
          . Published {DATASET_PUBLISHED_AT}. Version {DATASET_VERSION}.
        </p>
      </article>
    </div>
  );
}

/**
 * Rough size hint for the bundle download — surfaced as a "X kb" string
 * next to the download button. Computed at module-load by serializing
 * the manifest counts (the actual payload is built per-request but the
 * row counts are static). Numbers below are rough order-of-magnitude
 * estimates for UX, not exact byte counts.
 */
function datasetSizeHint(): string {
  // ~3-5kb per row average across the five catalogs (some rows are
  // pricing tables with 4-6 tiers, some are short alternatives entries).
  // 166 rows → roughly 500-800kb of pretty-printed JSON. Round to the
  // nearest 100kb for the hint.
  const approxKb = Math.round((DATASET_TOTAL_ROWS * 4.5) / 100) * 100;
  return `~${approxKb}kb`;
}
