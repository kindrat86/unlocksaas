import type { Metadata } from "next";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import {
  BreadcrumbListJsonLd,
  SpeakableJsonLd,
  SnapshotJsonLd,
} from "@/components/seo/json-ld";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import {
  BASE_URL,
  FOUNDER,
  ORGANIZATION,
} from "@/lib/seo/entity";
import {
  SNAPSHOT_BY_CATEGORY,
  SNAPSHOT_CATEGORIES_ORDERED,
  SNAPSHOT_CATEGORY_DESCRIPTIONS,
  SNAPSHOT_CATEGORY_LABELS,
  SNAPSHOT_CITATION,
  SNAPSHOT_HEADLINE_TOTAL,
  SNAPSHOT_KEYWORDS,
  SNAPSHOT_LAST_VERIFIED_DATE,
  SNAPSHOT_NAME,
  SNAPSHOT_NEXT_REVIEW_DATE,
  SNAPSHOT_PRIMARY_IDENTIFIER,
  SNAPSHOT_REVIEW_CADENCE_DAYS,
  SNAPSHOT_OBSERVATIONS,
  SNAPSHOT_URL,
  SNAPSHOT_VERSION,
  type SnapshotObservation,
} from "@/lib/state-of-saas-snapshot";
import {
  DATASET_LICENSE_SPDX,
  DATASET_LICENSE_URL,
} from "@/lib/seo/dataset";

/**
 * /state-of-saas – live editorial snapshot dashboard.
 *
 * Surface C (linkable asset / off-page lift) – 2026-05-21.
 *
 * Why this page exists
 * --------------------
 * Every editorial signal UnlockSaaS exposes – pSEO surface counts,
 * Brunson glossary depth, dataset row count, Knowledge-Graph anchor
 * count, locale coverage, earned-media count, activation-log state –
 * lives in twelve different module-level constants today. /state-of-saas
 * is the single dated machine- and human-readable snapshot that puts
 * all of them on one canonical citable URL.
 *
 * The headline number ({SNAPSHOT_HEADLINE_TOTAL}) is the single
 * stat a journalist or AI summariser leads a sentence with. The
 * category sections below add the structured breakdown an analyst or
 * researcher walks to find the specific row they want.
 *
 * Discovery surfaces
 * ------------------
 *   - /sitemap.xml (priority 0.55)
 *   - /llms.txt (linked under "## State of UnlockSaaS")
 *   - JSON-LD Dataset + DataFeed embedded in the page
 *   - BreadcrumbList JSON-LD (canonical two-deep nav)
 *   - SpeakableSpecification (voice engines may read the headline and
 *     each category description aloud safely – nav, footer, raw tables
 *     are intentionally excluded)
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - Every value derives from a real importable constant in this repo.
 *     The integrity gate in src/lib/state-of-saas.ts refuses to start
 *     the server on a malformed row. No fabricated metrics.
 *   - Honest zero-state visible by design: rows where the underlying
 *     fact is empty (earned-media mentions, off-platform sameAs
 *     anchors, external dataset catalog cross-listings before the
 *     operator activates them) ship as `0`. The reader can tell which
 *     signals are real and which are gated on activation.
 *   - `lastVerified` and `nextReview` are the human-attested freshness
 *     anchors – distinct from the per-deploy build stamp. The user-
 *     visible date is the editorial review date, not the deploy time.
 *
 * Render contract
 * ---------------
 * Pure server component. Every value is module-level constant data
 * resolved at module load (see lib/state-of-saas.ts which hoists every
 * count via `server-hoist-static-io`). No client interactivity – the
 * dashboard is read-only and citation-friendly.
 */

export const metadata: Metadata = {
  title: `${SNAPSHOT_NAME} (v${SNAPSHOT_VERSION})`,
  description: `A monthly dated snapshot of the UnlockSaaS editorial surface – ${SNAPSHOT_HEADLINE_TOTAL.toLocaleString("en-US")} published programmatic SEO pages and open-dataset rows, plus topical-authority, entity-graph, international, and activation-state signals. Open under CC-BY-4.0; cite freely.`,
  alternates: pageAlternates("/state-of-saas"),
  keywords: SNAPSHOT_KEYWORDS as readonly string[] as string[],
  openGraph: {
    type: "article",
    title: SNAPSHOT_NAME,
    description: `${SNAPSHOT_HEADLINE_TOTAL.toLocaleString("en-US")} editorially verified rows across the UnlockSaaS pSEO surface and open dataset. Updated every ${SNAPSHOT_REVIEW_CADENCE_DAYS} days. Last verified ${SNAPSHOT_LAST_VERIFIED_DATE}.`,
    url: "/state-of-saas",
    siteName: ORGANIZATION.name,
    publishedTime: SNAPSHOT_LAST_VERIFIED_DATE,
    modifiedTime: SNAPSHOT_LAST_VERIFIED_DATE,
    authors: [FOUNDER.name],
  },
  twitter: {
    card: "summary_large_image",
    title: SNAPSHOT_NAME,
    description: `${SNAPSHOT_HEADLINE_TOTAL.toLocaleString("en-US")} editorially verified rows. Updated monthly. CC-BY-4.0.`,
  },
  robots: { index: true, follow: true },
};

// --------------------------------------------------------------------------
// Hoisted helpers – per `js-hoist-regexp` + `server-hoist-static-io`
// --------------------------------------------------------------------------

const TRAIL = [
  { name: ORGANIZATION.name, url: `${BASE_URL}/` },
  { name: "State of UnlockSaaS", url: SNAPSHOT_URL },
] as const;

// Athens display format (per project memory: operator-facing surfaces
// show times in Europe/Athens 24h; this page is reader-facing but the
// hard rule we honour here is "never invent a date". The ISO values are
// rendered verbatim because they are calendar dates, not datetimes –
// no timezone conversion possible without inventing a time component.

const PSEO_DESCRIPTION = `${SNAPSHOT_NAME} is the monthly dated snapshot of every editorial signal UnlockSaaS exposes – programmatic SEO surface counts, Brunson glossary depth, dataset row counts, Knowledge-Graph anchors, locale coverage, earned-media count, and the shipped/operator/gated activation state of every surface. Open under ${DATASET_LICENSE_SPDX}; cite freely.`;

// Speakable selectors target the headline stat, the "as-of" date, and
// each category description block. Voice engines read these aloud
// without ingesting the dense observation tables (which a TTS pass
// would render as a confusing sequence of numbers and unit labels).
const SPEAKABLE_SELECTORS_PAGE: readonly string[] = Object.freeze([
  "[data-speakable]",
  '[aria-labelledby="dashboard-tldr"]',
]);

// --------------------------------------------------------------------------
// Section component – rendered once per category
// --------------------------------------------------------------------------

function ObservationTable({
  rows,
}: {
  rows: ReadonlyArray<SnapshotObservation>;
}) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/40">
          <tr>
            <th className="text-left px-4 py-2 font-medium">Signal</th>
            <th className="text-right px-4 py-2 font-medium tabular-nums">
              Value
            </th>
            <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-widest text-muted-foreground">
              Unit
            </th>
            <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-widest text-muted-foreground">
              As of
            </th>
            <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-widest text-muted-foreground">
              Source
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-t border-border align-top">
              <td className="px-4 py-3">
                <div className="font-medium">{row.label}</div>
                <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {row.description}
                </div>
              </td>
              <td className="px-4 py-3 text-right tabular-nums font-semibold">
                {row.value.toLocaleString("en-US")}
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">
                {row.unit}
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                <time dateTime={row.asOf}>{row.asOf}</time>
              </td>
              <td className="px-4 py-3 text-xs">
                {row.sourceUrl ? (
                  <a
                    href={row.sourceUrl}
                    className="underline underline-offset-4 hover:text-foreground"
                    rel="noopener"
                  >
                    Verify
                  </a>
                ) : (
                  <span className="text-muted-foreground/60">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --------------------------------------------------------------------------
// Page
// --------------------------------------------------------------------------

export default function SnapshotPage() {
  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <BreadcrumbListJsonLd trail={TRAIL} />
      <SnapshotJsonLd
        url={SNAPSHOT_URL}
        name={SNAPSHOT_NAME}
        description={PSEO_DESCRIPTION}
        version={SNAPSHOT_VERSION}
        lastVerified={SNAPSHOT_LAST_VERIFIED_DATE}
        nextReview={SNAPSHOT_NEXT_REVIEW_DATE}
        citation={SNAPSHOT_CITATION}
        keywords={SNAPSHOT_KEYWORDS}
        primaryIdentifier={SNAPSHOT_PRIMARY_IDENTIFIER}
        licenseUrl={DATASET_LICENSE_URL}
        markdownUrl={SNAPSHOT_URL}
        observations={SNAPSHOT_OBSERVATIONS}
      />
      <SpeakableJsonLd
        url={SNAPSHOT_URL}
        cssSelectors={SPEAKABLE_SELECTORS_PAGE}
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
          <span>State of UnlockSaaS</span>
        </nav>

        <header className="mb-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Live editorial snapshot · {DATASET_LICENSE_SPDX} · v
            {SNAPSHOT_VERSION}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            State of UnlockSaaS
          </h1>
          <p
            className="text-base text-muted-foreground leading-relaxed"
            id="dashboard-tldr"
            data-speakable
          >
            A monthly dated snapshot of every editorial signal UnlockSaaS
            exposes. {SNAPSHOT_HEADLINE_TOTAL.toLocaleString("en-US")}{" "}
            editorially verified rows across the programmatic SEO surface
            and the open dataset – plus topical-authority, entity-graph,
            international, and activation-state breakdowns. Every value
            below derives from a real importable constant in this repo;
            none of the numbers are estimated, inferred, or rounded.
          </p>
        </header>

        <section className="mb-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg border border-border bg-card px-5 py-4">
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
              Headline
            </div>
            <div className="text-2xl font-bold tabular-nums">
              {SNAPSHOT_HEADLINE_TOTAL.toLocaleString("en-US")}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              published rows
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card px-5 py-4">
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
              Observations
            </div>
            <div className="text-2xl font-bold tabular-nums">
              {SNAPSHOT_OBSERVATIONS.length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              dated signals
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card px-5 py-4">
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
              Last verified
            </div>
            <div className="text-lg font-semibold tabular-nums">
              <time dateTime={SNAPSHOT_LAST_VERIFIED_DATE}>
                {SNAPSHOT_LAST_VERIFIED_DATE}
              </time>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              human-attested
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card px-5 py-4">
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
              Next review
            </div>
            <div className="text-lg font-semibold tabular-nums">
              <time dateTime={SNAPSHOT_NEXT_REVIEW_DATE}>
                {SNAPSHOT_NEXT_REVIEW_DATE}
              </time>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              every {SNAPSHOT_REVIEW_CADENCE_DAYS} days
            </div>
          </div>
        </section>

        <Separator className="my-8" />

        {SNAPSHOT_CATEGORIES_ORDERED.map((category) => {
          const rows = SNAPSHOT_BY_CATEGORY[category];
          if (rows.length === 0) return null;
          const label = SNAPSHOT_CATEGORY_LABELS[category];
          const description =
            SNAPSHOT_CATEGORY_DESCRIPTIONS[category];
          return (
            <section
              key={category}
              className="mb-12"
              aria-labelledby={`category-${category}`}
            >
              <h2
                className="text-2xl font-bold mb-2"
                id={`category-${category}`}
              >
                {label}
              </h2>
              <p
                className="text-sm text-muted-foreground leading-relaxed mb-5"
                data-speakable
              >
                {description}
              </p>
              <ObservationTable rows={rows} />
            </section>
          );
        })}

        <Separator className="my-8" />

        <section className="mb-10 space-y-4 leading-relaxed">
          <h2 className="text-2xl font-bold">How to cite this dashboard</h2>
          <p className="text-sm text-muted-foreground">
            The snapshot is open under{" "}
            <a
              href={DATASET_LICENSE_URL}
              rel="license noopener noreferrer"
              target="_blank"
              className="underline underline-offset-4"
            >
              Creative Commons Attribution 4.0 International (
              {DATASET_LICENSE_SPDX})
            </a>
            . Re-use is unrestricted; the only obligation is attribution.
          </p>
          <p className="text-sm text-muted-foreground">Plain text:</p>
          <pre className="bg-muted/40 border border-border rounded-lg p-4 text-xs overflow-x-auto whitespace-pre-wrap">
            {SNAPSHOT_CITATION}
          </pre>
        </section>

        <Separator className="my-8" />

        <section className="mb-10 space-y-4 leading-relaxed">
          <h2 className="text-2xl font-bold">Methodology and freshness</h2>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside marker:text-muted-foreground/50">
            <li>
              Every observation value is computed from a module-level
              constant in this repository. No external API, no estimated
              ranges, no inferred user counts, no traffic numbers.
            </li>
            <li>
              The integrity gate in{" "}
              <code className="text-xs">src/lib/state-of-saas.ts</code>{" "}
              runs at module load and refuses to start the server if any
              row violates the contract (non-negative integer, valid ISO
              date, unique snake_case key, https sourceUrl when set).
            </li>
            <li>
              Each row carries its own{" "}
              <code className="text-xs">asOf</code> date – the freshness
              anchor of the underlying catalog row, not the deploy time.
              The dashboard never claims a freshness signal stronger
              than what the source row carries.
            </li>
            <li>
              Honest zero state: signals where the underlying fact is
              empty (earned-media mentions, off-platform sameAs anchors,
              external dataset catalog cross-listings before operator
              activation) ship as <code className="text-xs">0</code>. A
              reader can tell at a glance which signals are real and
              which are gated on activation or evidence.
            </li>
            <li>
              The next scheduled human-attested review is{" "}
              <time
                dateTime={SNAPSHOT_NEXT_REVIEW_DATE}
                className="text-foreground font-medium"
              >
                {SNAPSHOT_NEXT_REVIEW_DATE}
              </time>
              . The underlying counts auto-refresh on every Vercel deploy;
              the cadence above is the human-attested-correctness cycle.
            </li>
            <li>
              See the{" "}
              <Link
                href="/editorial-policy"
                className="underline underline-offset-4 text-foreground"
              >
                editorial policy
              </Link>{" "}
              for the corrections workflow and disclosure standards
              applied to every row.
            </li>
          </ul>
        </section>

        <Separator className="my-8" />

        <section className="mb-10 space-y-4 leading-relaxed">
          <h2 className="text-2xl font-bold">Related citable artifacts</h2>
          <ul className="text-sm space-y-2 list-disc list-inside marker:text-muted-foreground/50">
            <li>
              <Link
                href="/dataset"
                className="underline underline-offset-4 hover:text-foreground"
              >
                Indie SaaS Teardowns Dataset
              </Link>{" "}
              – the open CC-BY-4.0 dataset bundle underpinning the
              editorial-corpus row above.
            </li>
            <li>
              <Link
                href="/llms.txt"
                className="underline underline-offset-4 hover:text-foreground"
              >
                /llms.txt
              </Link>{" "}
              – AI-crawler index. Carries the activation log this
              dashboard's last category breaks down.
            </li>
            <li>
              <Link
                href="/press"
                className="underline underline-offset-4 hover:text-foreground"
              >
                Press / Media Kit
              </Link>{" "}
              – brand facts, founder bio, descriptions in three lengths,
              topical-expertise list, and embed-ready assets.
            </li>
            <li>
              <Link
                href="/editorial-policy"
                className="underline underline-offset-4 hover:text-foreground"
              >
                Editorial policy
              </Link>{" "}
              – sourcing, dating, signing, and corrections workflow for
              every claim on the site.
            </li>
          </ul>
        </section>
      </article>
    </div>
  );
}
