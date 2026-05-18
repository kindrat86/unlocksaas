import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import {
  OrganizationJsonLd,
  BreadcrumbListJsonLd,
} from "@/components/seo/json-ld";
import { markdownAlternate } from "@/lib/seo/markdown-alternates";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { ALTERNATIVES } from "@/lib/alternatives";
import { TEARDOWNS } from "@/lib/funnel-teardowns";
import { PRICING_TEARDOWNS } from "@/lib/pricing-teardowns";
import { COMPARISONS } from "@/lib/comparisons";
import { CATEGORIES } from "@/lib/categories";

/**
 * /dataset — public dataset hub page.
 *
 * Why this surface exists
 * -----------------------
 * The on-page SEO build at unlocksaas.com is at agency-tier polish.
 * The bottleneck for the composite SEO score is off-page: zero earned
 * links because the domain is new. This page is the linkable artifact
 * play: publish a CC-BY 4.0 dataset of the entire ${157}-entry pSEO
 * catalog and the rest of the web has a license-mandated reason to
 * backlink. Same mechanism that put Wikipedia, OpenStreetMap, and
 * Stack Exchange data into a thousand academic papers, scaled to a
 * single-founder indie SaaS catalog.
 *
 * SEO posture
 * -----------
 * Indexable. Carries Organization + BreadcrumbList + schema.org/Dataset
 * JSON-LD. The Dataset block names every distribution format
 * (HTML / JSON / CSV / Markdown) so Google's Dataset Search ingests
 * the surface as a first-class dataset, eligible for the Dataset rich
 * result and surfaced in datasetsearch.research.google.com.
 *
 * The Dataset schema is the entire off-page mechanism in markup form:
 * the `license` field is CC-BY 4.0, which is what makes the rest of
 * the web link back when they cite individual rows.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - Counts are computed at render from the actual arrays. No
 *     hardcoded numbers that could drift.
 *   - Schema columns documented here match the columns the CSV
 *     route emits. Source of truth for schema lives in three places
 *     (this hub, the CSV route, the README) and a deploy regenerates
 *     all three from the same catalog modules. Drift surface = zero.
 *   - License is CC-BY 4.0, the same license Wikipedia content uses.
 *     A genuinely open license, not a marketing license.
 *   - No fabricated download counts, no fabricated citation counts.
 *     The page does not claim adoption it does not have yet.
 */

const CANONICAL_PATH = "/dataset";
const MD_PATH = "/dataset/README.md";

// Per-entry count for the Dataset JSON-LD `keywords` field and the
// rendered counts table. Computed at module scope (not in the
// component) because the catalogs are static — letting Next.js bake
// the result into the static prerender saves one evaluation per
// request.
const COUNTS = {
  alternatives: ALTERNATIVES.length,
  funnelTeardowns: TEARDOWNS.length,
  pricingTeardowns: PRICING_TEARDOWNS.length,
  comparisons: COMPARISONS.length,
  categories: CATEGORIES.length,
} as const;
const TOTAL =
  COUNTS.alternatives +
  COUNTS.funnelTeardowns +
  COUNTS.pricingTeardowns +
  COUNTS.comparisons +
  COUNTS.categories;

// Latest `lastVerified` across the catalog — used as the Dataset
// `dateModified`. If no entries carry a lastVerified, fall back to
// build time. Brunson Hard-Rule: dateModified must reflect a real
// catalog event, not an arbitrary stamp.
function latestLastVerified(): string {
  const dates: string[] = [];
  for (const a of ALTERNATIVES) if (a.lastVerified) dates.push(a.lastVerified);
  for (const t of TEARDOWNS) if (t.lastVerified) dates.push(t.lastVerified);
  for (const t of PRICING_TEARDOWNS)
    if (t.lastVerified) dates.push(t.lastVerified);
  for (const c of COMPARISONS) if (c.lastVerified) dates.push(c.lastVerified);
  if (dates.length === 0) return new Date().toISOString().slice(0, 10);
  return dates.sort().slice(-1)[0]!;
}
const DATE_MODIFIED = latestLastVerified();

export const metadata: Metadata = {
  title: "Public dataset: indie SaaS funnel + pricing teardowns",
  description: `A CC-BY 4.0 dataset of ${TOTAL} indie-SaaS analyses across funnels, pricing, comparisons, alternatives, and category roundups. Downloads in JSON, CSV, and Markdown. Brunson Hard-Rule discipline: no fabricated metrics, no slag, every entry dated.`,
  alternates: markdownAlternate(`${BASE_URL}${CANONICAL_PATH}`, MD_PATH),
  openGraph: {
    title: "UnlockSaaS public dataset: indie SaaS teardowns (CC-BY 4.0)",
    description: `${TOTAL} indie-SaaS analyses across funnels, pricing, comparisons, alternatives, and category roundups. Free download under CC-BY 4.0.`,
    url: CANONICAL_PATH,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UnlockSaaS public dataset",
    description: `${TOTAL}-row dataset of indie SaaS teardowns. CC-BY 4.0. JSON + CSV + Markdown.`,
  },
  robots: { index: true, follow: true },
};

const TRAIL = [
  { name: "Unlock SaaS", url: `${BASE_URL}/` },
  { name: "Dataset", url: `${BASE_URL}${CANONICAL_PATH}` },
] as const;

/**
 * Inline schema.org/Dataset JSON-LD. Built at module scope so the
 * stringified payload is pre-serialised once and inlined verbatim
 * into the prerender (the `server-hoist-static-io` pattern used
 * elsewhere in this codebase).
 *
 * The `license` field is the mechanism: a CC-BY URL tells every
 * Schema-aware consumer (Google Dataset Search, datasetsearch.google,
 * Kaggle's ingestion crawler, the OpenAIRE network, AcademicTorrents)
 * that reuse is permitted under attribution. A consumer reading this
 * JSON-LD knows they can cite without a permissions email.
 *
 * The `distribution` array names every format the dataset is
 * published in. Each entry uses `DataDownload` with the canonical
 * URL and the registered media type. This is what makes the dataset
 * eligible for Google's Dataset rich result.
 */
const DATASET_JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Dataset",
  "@id": `${BASE_URL}/dataset#dataset`,
  name: "UnlockSaaS Indie SaaS Teardowns Dataset",
  alternateName: "indie-saas-teardowns",
  description: `A public, attribution-licensed dataset of ${TOTAL} indie-SaaS analyses across funnels, pricing, head-to-head comparisons, named-competitor alternatives, and category roundups. Brunson Hook/Story/Offer and pricing-anchor lenses applied uniformly. No fabricated metrics, no quoted competitor copy, every entry carries a dated lastVerified.`,
  url: `${BASE_URL}${CANONICAL_PATH}`,
  identifier: `${BASE_URL}/dataset#dataset`,
  inLanguage: "en-US",
  isAccessibleForFree: true,
  // CC-BY 4.0 — license URL is the public, machine-readable license
  // recognised by Google Dataset Search, Kaggle, and the OpenAIRE
  // metadata ingestion pipelines.
  license: "https://creativecommons.org/licenses/by/4.0/",
  creator: { "@id": ID.person },
  publisher: { "@id": ID.organization },
  // Use the latest catalog `lastVerified` as the dataset's
  // dateModified. This is honest: it reflects the most recent
  // verification work on any underlying entry. Brunson Hard-Rule:
  // no arbitrary build-time stamp masquerading as a content date.
  dateModified: DATE_MODIFIED,
  version: "1.0.0",
  keywords: [
    "indie SaaS",
    "SaaS funnel teardown",
    "SaaS pricing teardown",
    "SaaS comparison",
    "Brunson framework",
    "hook story offer",
    "indie hackers data",
    "micro SaaS analysis",
  ].join(", "),
  variableMeasured: [
    {
      "@type": "PropertyValue",
      name: "entity_type",
      description:
        "One of alternative, funnel-teardown, pricing-teardown, comparison, or category.",
    },
    {
      "@type": "PropertyValue",
      name: "slug",
      description: "Kebab-case URL slug",
    },
    {
      "@type": "PropertyValue",
      name: "display_name",
      description: "Proper-noun display name",
    },
    {
      "@type": "PropertyValue",
      name: "category",
      description: "Catalog category bucket",
    },
    {
      "@type": "PropertyValue",
      name: "one_line",
      description: "Single-line thesis",
    },
    {
      "@type": "PropertyValue",
      name: "tldr",
      description: "40-to-60-word TL;DR (where the entity has one)",
    },
    {
      "@type": "PropertyValue",
      name: "url_canonical",
      description: "https URL of the UnlockSaaS analysis page",
    },
    {
      "@type": "PropertyValue",
      name: "last_verified",
      description: "ISO 8601 date of last manual sanity check",
    },
  ],
  // Three download formats. JSON and CSV are the primary consumer
  // formats; Markdown is the LLM-readable README sibling. All three
  // carry the same provenance + license terms.
  distribution: [
    {
      "@type": "DataDownload",
      name: "JSON (full typed shape)",
      encodingFormat: "application/json",
      contentUrl: `${BASE_URL}/dataset/indie-saas-teardowns.json`,
    },
    {
      "@type": "DataDownload",
      name: "CSV (flat long format)",
      encodingFormat: "text/csv",
      contentUrl: `${BASE_URL}/dataset/indie-saas-teardowns.csv`,
    },
    {
      "@type": "DataDownload",
      name: "README (provenance + schema + license)",
      encodingFormat: "text/markdown",
      contentUrl: `${BASE_URL}${MD_PATH}`,
    },
  ],
  // Maintainer + corrections workflow. Surface the editorial policy
  // anchor so a Schema-validating crawler sees the accountability
  // chain right where it expects to find it.
  maintainer: { "@id": ID.person },
  citation:
    "UnlockSaaS Indie SaaS Teardowns Dataset, https://unlocksaas.com/dataset, CC-BY 4.0.",
});

function Pre({ children }: { children: string }) {
  return (
    <pre className="bg-muted text-foreground rounded-md border p-4 text-sm overflow-x-auto">
      <code>{children}</code>
    </pre>
  );
}

export default function DatasetHubPage() {
  const year = new Date().getFullYear();
  return (
    <main className="px-6 py-12 md:py-16">
      <OrganizationJsonLd />
      <BreadcrumbListJsonLd trail={TRAIL} />
      {/* Inline Dataset JSON-LD. Server-rendered so Google's Dataset
          Search crawler sees it on first paint without executing JS. */}
      <Script
        id="dataset-jsonld"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: DATASET_JSON_LD }}
      />

      <article className="max-w-2xl mx-auto space-y-8">
        <nav
          aria-label="Breadcrumb"
          className="text-sm text-muted-foreground"
        >
          <Link href="/" className="hover:underline">
            Unlock SaaS
          </Link>{" "}
          <span aria-hidden>›</span> Dataset
        </nav>

        <header className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            UnlockSaaS Indie SaaS Teardowns Dataset
          </h1>
          <p className="text-lg text-muted-foreground">
            A public, attribution-licensed dataset of {TOTAL} indie-SaaS
            analyses across funnels, pricing, head-to-head comparisons,
            named-competitor alternatives, and category roundups. Brunson
            Hook / Story / Offer and pricing-anchor lenses applied uniformly.
            No fabricated metrics, no quoted competitor copy, every entry
            carries a dated lastVerified.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">What is in here</h2>
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="py-2 pr-4">Catalog</th>
                <th className="py-2 pr-4">Count</th>
                <th className="py-2">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="py-2 pr-4">Funnel teardowns</td>
                <td className="py-2 pr-4">{COUNTS.funnelTeardowns}</td>
                <td className="py-2">Hook / Story / Offer breakdowns</td>
              </tr>
              <tr className="border-t">
                <td className="py-2 pr-4">Pricing teardowns</td>
                <td className="py-2 pr-4">{COUNTS.pricingTeardowns}</td>
                <td className="py-2">
                  Tier structure, anchor mechanic, upgrade trigger
                </td>
              </tr>
              <tr className="border-t">
                <td className="py-2 pr-4">Comparisons</td>
                <td className="py-2 pr-4">{COUNTS.comparisons}</td>
                <td className="py-2">Symmetric A-vs-B with indie verdict</td>
              </tr>
              <tr className="border-t">
                <td className="py-2 pr-4">Alternatives</td>
                <td className="py-2 pr-4">{COUNTS.alternatives}</td>
                <td className="py-2">UnlockSaaS-vs-X positioning</td>
              </tr>
              <tr className="border-t">
                <td className="py-2 pr-4">Categories</td>
                <td className="py-2 pr-4">{COUNTS.categories}</td>
                <td className="py-2">Aggregated rosters with intent</td>
              </tr>
              <tr className="border-t font-semibold">
                <td className="py-2 pr-4">Total</td>
                <td className="py-2 pr-4">{TOTAL}</td>
                <td className="py-2"></td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Downloads</h2>
          <ul className="space-y-3">
            <li className="border-l-2 pl-4 border-muted">
              <Link
                href="/dataset/indie-saas-teardowns.json"
                className="font-mono text-sm underline underline-offset-4"
              >
                /dataset/indie-saas-teardowns.json
              </Link>
              <p className="text-sm text-muted-foreground mt-1">
                Full typed shape. Right for engineers re-implementing
                analyses or building tooling against the catalog.
              </p>
            </li>
            <li className="border-l-2 pl-4 border-muted">
              <Link
                href="/dataset/indie-saas-teardowns.csv"
                className="font-mono text-sm underline underline-offset-4"
              >
                /dataset/indie-saas-teardowns.csv
              </Link>
              <p className="text-sm text-muted-foreground mt-1">
                Long-format flat table, one row per catalog entry. Right
                for pandas / R / Excel / Datawrapper.
              </p>
            </li>
            <li className="border-l-2 pl-4 border-muted">
              <Link
                href="/dataset/README.md"
                className="font-mono text-sm underline underline-offset-4"
              >
                /dataset/README.md
              </Link>
              <p className="text-sm text-muted-foreground mt-1">
                Provenance, schema, license, citation snippets, sourcing
                methodology. The file you read first.
              </p>
            </li>
            <li className="border-l-2 pl-4 border-muted">
              <Link
                href="/api/mcp"
                className="font-mono text-sm underline underline-offset-4"
              >
                /api/mcp
              </Link>
              <p className="text-sm text-muted-foreground mt-1">
                Programmatic agent access via Model Context Protocol. See{" "}
                <Link href="/mcp" className="underline underline-offset-4">
                  /mcp
                </Link>{" "}
                for install instructions.
              </p>
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">License</h2>
          <p>
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              className="underline underline-offset-4"
              rel="noopener noreferrer"
            >
              Creative Commons Attribution 4.0 International (CC-BY 4.0)
            </a>
            . Same license as Wikipedia content, OpenStreetMap, and Stack
            Exchange Q&amp;A. Free to share, free to remix, free to use
            commercially. The single condition is attribution:
          </p>
          <Pre>{`UnlockSaaS Indie SaaS Teardowns Dataset, ${BASE_URL}/dataset, CC-BY 4.0.`}</Pre>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Academic citation</h2>
          <p>APA-7-style:</p>
          <Pre>{`UnlockSaaS. (${year}). UnlockSaaS Indie SaaS Teardowns Dataset (v1.0.0) [Data set]. ${BASE_URL}/dataset`}</Pre>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Sourcing methodology</h2>
          <p>
            Every catalog entry is built by manually loading the analysed
            product&apos;s public site, recording observable structure
            (positioning, headline pattern, pricing tiers, page flow), and
            applying the Brunson Hook / Story / Offer or pricing-anchor
            lens uniformly.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>No fabricated metrics. No invented conversion rates.</li>
            <li>No quoted copy. Observations describe patterns, not text.</li>
            <li>
              No slag. Every entry respects the analysed product&apos;s value
              proposition.
            </li>
            <li>
              Dated <code className="text-xs">last_verified</code> on every
              entry. Stale rows declare their staleness.
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Full editorial policy at{" "}
            <Link
              href="/editorial-policy"
              className="underline underline-offset-4"
            >
              /editorial-policy
            </Link>{" "}
            (including the corrections log).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Updates</h2>
          <p>
            The dataset is regenerated on every UnlockSaaS deploy. Adding
            a new entry to any of the five underlying TypeScript catalogs
            auto-extends this dataset on the next build.
          </p>
          <p className="text-sm text-muted-foreground">
            Last verified across all catalogs:{" "}
            <code className="text-xs">{DATE_MODIFIED}</code>.
          </p>
        </section>

        <footer className="pt-8 border-t text-sm text-muted-foreground">
          Maintained by Maryan ·{" "}
          <a
            href="mailto:maryan@unlocksaas.com"
            className="underline underline-offset-4"
          >
            maryan@unlocksaas.com
          </a>{" "}
          ·{" "}
          <Link
            href="/editorial-policy"
            className="underline underline-offset-4"
          >
            Editorial policy
          </Link>{" "}
          ·{" "}
          <Link href="/about" className="underline underline-offset-4">
            About
          </Link>
        </footer>
      </article>
    </main>
  );
}
