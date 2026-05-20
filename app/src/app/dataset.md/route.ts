import { NextResponse } from "next/server";
import {
  DATASET_ATTRIBUTION,
  DATASET_BIBTEX,
  DATASET_BUNDLE,
  DATASET_CITATION,
  DATASET_CSV_COLUMNS,
  DATASET_LICENSE_SPDX,
  DATASET_LICENSE_URL,
  DATASET_NAME,
  DATASET_PER_TABLE_CSV,
  DATASET_PER_TABLE_SLUGS,
  DATASET_SLUG,
  DATASET_URLS,
  DATASET_VERSION,
  perTableCsvUrl,
} from "@/lib/seo/dataset";
import {
  BASE_URL,
  DATASET_DOI,
  DATASET_DOI_URL,
  FOUNDER,
  ORGANIZATION,
} from "@/lib/seo/entity";

/**
 * /dataset.md — markdown mirror of /dataset for AI crawlers and agents.
 *
 * Same Brunson Hard-Rule discipline as the other .md mirrors: every fact
 * below is present, verifiable, on /dataset HTML. Nothing is exclusive
 * to this surface. The mirror exists because retrieval pipelines
 * (Perplexity, ClaudeBot, GPTBot/OAI-SearchBot, Google AI Overviews,
 * Gemini, You.com, Diffbot) prefer plain markdown over JS-rendered HTML
 * for entity bodies.
 *
 * Why this is hand-built, not registered with the SURFACES registry
 * -----------------------------------------------------------------
 * The shared `markdownResponseForPath` helper composes markdown from
 * the SURFACES registry in src/lib/seo/markdown.ts. The registry is
 * organized around the funnel surfaces (funnel hub, founding, faq,
 * playbook-sales, etc.) — adding a dataset descriptor there would
 * couple the dataset to that registry's update cadence, when in fact
 * the dataset has its own version + lastVerified contract.
 *
 * Keeping this route hand-built means: the markdown body is composed
 * from the same DATASET_* constants the HTML page and the JSON/CSV
 * routes read. Single source of truth, three surfaces.
 */

const TABLE_ROWS: ReadonlyArray<{
  label: string;
  count: number;
  url: string;
}> = [
  {
    label: "Funnel teardowns",
    count: DATASET_BUNDLE.counts.funnel_teardowns,
    url: `${BASE_URL}/funnel-teardown`,
  },
  {
    label: "Pricing teardowns",
    count: DATASET_BUNDLE.counts.pricing_teardowns,
    url: `${BASE_URL}/pricing-teardown`,
  },
  {
    label: "Head-to-head comparisons",
    count: DATASET_BUNDLE.counts.comparisons,
    url: `${BASE_URL}/vs`,
  },
  {
    label: "Named-competitor alternatives",
    count: DATASET_BUNDLE.counts.alternatives,
    url: `${BASE_URL}/alternatives-to`,
  },
  {
    label: "Category buckets",
    count: DATASET_BUNDLE.counts.categories,
    url: `${BASE_URL}/category`,
  },
];

/**
 * Pre-rendered markdown body. Hoisted to module scope per the
 * `server-hoist-static-io` pattern — built once at module load, the
 * route handler just writes the string with the right headers.
 */
const DOI_FRONTMATTER_LINES = DATASET_DOI_URL
  ? `doi: ${DATASET_DOI}\ndoiUrl: ${DATASET_DOI_URL}\n`
  : "";

const MARKDOWN_BODY = `---
title: ${DATASET_NAME}
canonical: ${DATASET_URLS.landing}
markdown: ${DATASET_URLS.markdown}
version: ${DATASET_VERSION}
license: ${DATASET_LICENSE_SPDX}
licenseUrl: ${DATASET_LICENSE_URL}
lastVerified: ${DATASET_BUNDLE.lastVerified}
nextReview: ${DATASET_BUNDLE.nextReview}
generatedAt: ${DATASET_BUNDLE.generatedAt}
publisher: ${ORGANIZATION.name}
publisherUrl: ${ORGANIZATION.url}
creator: ${FOUNDER.name}
creatorUrl: ${BASE_URL}/about
totalRows: ${DATASET_BUNDLE.counts.total_rows}
${DOI_FRONTMATTER_LINES}---

# ${DATASET_NAME}

> ${DATASET_BUNDLE.description}

**Downloads.** ${DATASET_BUNDLE.counts.total_rows} editorially verified rows of indie SaaS marketing analysis. Free, CC-BY-4.0, attribution required.

${DATASET_DOI_URL ? `**Persistent DOI.** [\`${DATASET_DOI}\`](${DATASET_DOI_URL}). Resolves via doi.org to the Zenodo deposit. Use this in academic citations and reference managers.\n` : ""}
- **JSON bundle (all tables):** [${DATASET_URLS.json}](${DATASET_URLS.json})
- **CSV (flat, all tables, 14 universal columns):** [${DATASET_URLS.csv}](${DATASET_URLS.csv})
- **HTML landing:** [${DATASET_URLS.landing}](${DATASET_URLS.landing})

### Per-table CSVs (richer, table-specific columns)

${DATASET_PER_TABLE_SLUGS.map((slug) => {
  const entry = DATASET_PER_TABLE_CSV[slug];
  return `- **${entry.displayName}** (${entry.rowCount} rows, ${entry.columns.length} columns): [${perTableCsvUrl(slug)}](${perTableCsvUrl(slug)})`;
}).join("\n")}

## What is in the bundle

Five tables, each a re-projection of a public surface on ${ORGANIZATION.url}. Every row is independently verifiable by visiting the matching page and carries a dated \`lastVerified\` field.

${TABLE_ROWS.map((r) => `- **${r.label}** (${r.count} rows): ${r.url}`).join("\n")}

**Total: ${DATASET_BUNDLE.counts.total_rows} rows.**

## CSV column contract

Stable, append-only order. Once published, a column may gain new optional values but its position never moves.

${DATASET_CSV_COLUMNS.map((c, i) => `${i + 1}. \`${c}\``).join("\n")}

The \`record_type\` column discriminates one of five values: \`funnel_teardown\`, \`pricing_teardown\`, \`comparison\`, \`alternative\`, \`category\`. The \`name_b\` and \`homepage_url_b\` columns are populated only for comparison rows.

## License

Released under [Creative Commons Attribution 4.0 International (${DATASET_LICENSE_SPDX})](${DATASET_LICENSE_URL}). You may copy, redistribute, remix, transform, and build upon the material for any purpose, including commercial, provided you give appropriate credit.

**Required attribution string** (paste in a footnote, methods note, or page footer):

> ${DATASET_ATTRIBUTION}

## Citation

Plain text:

> ${DATASET_CITATION}

BibTeX:

\`\`\`bibtex
${DATASET_BIBTEX}
\`\`\`

## How this was built

Every row is a re-projection of a shipped page on ${ORGANIZATION.url}. Editorial standards (sourcing, dating, corrections, no fabricated metrics) are documented at [${BASE_URL}/editorial-policy](${BASE_URL}/editorial-policy).

- **Author:** ${FOUNDER.name}, ${FOUNDER.jobTitle}, ${ORGANIZATION.name}
- **Last verified:** ${DATASET_BUNDLE.lastVerified}
- **Next editorial review:** ${DATASET_BUNDLE.nextReview}
- **Version:** v${DATASET_VERSION} (SemVer; additive-only minor and patch)
- **Corrections:** open a request via ${BASE_URL}/contact; logged publicly at ${BASE_URL}/editorial-policy

## Conversion recipes

Convert the CSV to other formats locally. We do not ship binary distributions because we cannot guarantee version-stable serialization without locking a runtime dependency we do not otherwise need.

\`\`\`python
# Parquet (pandas + pyarrow)
import pandas as pd
df = pd.read_csv("${DATASET_URLS.csv}")
df.to_parquet("${DATASET_SLUG}-v${DATASET_VERSION}.parquet")
\`\`\`

\`\`\`sql
-- DuckDB (zero-dep, in-memory)
SELECT record_type, COUNT(*)
FROM read_csv_auto('${DATASET_URLS.csv}')
GROUP BY record_type;
\`\`\`
`;

export function GET() {
  return new NextResponse(MARKDOWN_BODY, {
    status: 200,
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      // Same edge-cache discipline as the other .md mirrors.
      "cache-control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      link: [
        `<${DATASET_URLS.landing}>; rel="canonical"`,
        `<${DATASET_LICENSE_URL}>; rel="license"; title="${DATASET_LICENSE_SPDX}"`,
        `<${DATASET_URLS.json}>; rel="alternate"; type="application/json"`,
        `<${DATASET_URLS.csv}>; rel="alternate"; type="text/csv"`,
      ].join(", "),
    },
  });
}

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-max-age": "86400",
    },
  });
}

