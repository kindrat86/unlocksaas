/**
 * /dataset/README.md — provenance, license, schema, and citation
 * reference for the UnlockSaaS Indie SaaS Teardowns Dataset.
 *
 * Why a README route
 * ------------------
 * Every well-published public dataset ships a README that answers:
 * what is in here, where did it come from, how can I use it, what
 * are the constraints on attribution. The /dataset HTML hub has the
 * same content in a visual form; this route is the LLM-readable
 * mirror plus the canonical citation document.
 *
 * The README is the file an academic, journalist, or analyst will
 * open first. It is also the file that an LLM retrieval pipeline
 * will quote when asked "what is the UnlockSaaS dataset". Keeping
 * a single source of truth for the metadata, license, schema, and
 * citation snippet here (instead of duplicating across the JSON
 * metadata block + the CSV header + the hub page) means a single
 * edit propagates.
 *
 * Brunson Hard-Rule reconciliation: every fact stated here is also
 * verifiable from the live JSON/CSV/HTML surfaces. Counts are
 * recomputed at build time from the actual catalog arrays, not
 * hardcoded — so the README cannot drift away from the underlying
 * data.
 */

import { NextResponse } from "next/server";
import { ALTERNATIVES } from "@/lib/alternatives";
import { TEARDOWNS } from "@/lib/funnel-teardowns";
import { PRICING_TEARDOWNS } from "@/lib/pricing-teardowns";
import { COMPARISONS } from "@/lib/comparisons";
import { CATEGORIES } from "@/lib/categories";

export const dynamic = "force-static";
export const revalidate = 86400;

const BASE = "https://unlocksaas.com";

function buildBody(): string {
  // Counts read from the actual arrays. If the catalogs grow, the
  // numbers in this README grow with them at the next deploy.
  const counts = {
    alt: ALTERNATIVES.length,
    fun: TEARDOWNS.length,
    pri: PRICING_TEARDOWNS.length,
    cmp: COMPARISONS.length,
    cat: CATEGORIES.length,
  };
  const total = counts.alt + counts.fun + counts.pri + counts.cmp + counts.cat;
  const year = new Date().getFullYear();

  return `# UnlockSaaS Indie SaaS Teardowns Dataset

A public, attribution-licensed dataset of ${total} indie-SaaS analyses spanning funnels, pricing, head-to-head comparisons, named-competitor alternatives, and category roundups. Built by Maryan ([UnlockSaaS](${BASE})) for post-launch pre-revenue non-engineer SaaS founders, published as a public good for anyone studying indie SaaS positioning, pricing, or growth strategy.

## What is in here

| Catalog | Count | Description |
|---|---|---|
| Funnel teardowns | ${counts.fun} | Hook / Story / Offer breakdowns of indie SaaS marketing pages, Brunson lens applied uniformly |
| Pricing teardowns | ${counts.pri} | Tier-by-tier pricing structures, anchor mechanics, upgrade triggers, payment mechanics |
| Head-to-head comparisons | ${counts.cmp} | Symmetric "A vs B" analyses, dimension-by-dimension, with honest indie-founder verdicts |
| Named-competitor alternatives | ${counts.alt} | UnlockSaaS-vs-X positioning notes, capability matrices |
| Category roundups | ${counts.cat} | Aggregated rosters per canonical category, with intent paragraphs |
| **Total** | **${total}** | |

## Downloads

| Format | URL | Use case |
|---|---|---|
| JSON | [${BASE}/dataset/indie-saas-teardowns.json](${BASE}/dataset/indie-saas-teardowns.json) | Full typed shape with every catalog field, including Brunson-lens narrative fields. Right for engineers re-implementing analyses or building tooling against the catalog. |
| CSV | [${BASE}/dataset/indie-saas-teardowns.csv](${BASE}/dataset/indie-saas-teardowns.csv) | Long-format flat table with one row per catalog entry. Right for pandas / R / Excel / Datawrapper. |
| MCP | [${BASE}/api/mcp](${BASE}/api/mcp) | Programmatic agent access via Model Context Protocol; install via [${BASE}/mcp](${BASE}/mcp). |

## License

[Creative Commons Attribution 4.0 International (CC-BY 4.0)](https://creativecommons.org/licenses/by/4.0/).

Same license as Wikipedia content, OpenStreetMap, and Stack Exchange Q&A. You are free to:

- **Share** — copy and redistribute the material in any medium or format
- **Adapt** — remix, transform, and build upon the material for any purpose, even commercially

Under one condition:

- **Attribution** — you must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.

## Attribution snippet (copy-paste)

\`\`\`
UnlockSaaS Indie SaaS Teardowns Dataset, ${BASE}/dataset, CC-BY 4.0.
\`\`\`

## Academic citation (APA-7-style)

\`\`\`
UnlockSaaS. (${year}). UnlockSaaS Indie SaaS Teardowns Dataset (v1.0.0) [Data set]. ${BASE}/dataset
\`\`\`

## Schema (CSV columns)

| Column | Type | Description |
|---|---|---|
| \`entity_type\` | enum | One of: \`alternative\`, \`funnel-teardown\`, \`pricing-teardown\`, \`comparison\`, \`category\` |
| \`slug\` | string | Kebab-case URL slug (joins to JSON catalog) |
| \`display_name\` | string | Proper-noun display name. For comparisons: "A vs B". |
| \`category\` | string | Catalog category bucket |
| \`one_line\` | string | Single-line thesis |
| \`tldr\` | string | 40-to-60-word TL;DR (alternatives use honestVerdict; categories use intent) |
| \`creator\` | string \\| empty | Person or company that operates the analysed product (where known) |
| \`url_canonical\` | URL | https URL of the UnlockSaaS analysis page |
| \`url_target\` | URL \\| empty | Homepage of the analysed product (where the catalog carries it) |
| \`last_verified\` | ISO 8601 date \\| empty | Date of last manual sanity check against the live source |

The JSON sibling preserves the full nested shape (productSnapshot, BrunsonLens, tier arrays, capability matrices, FAQs). See the JSON file's \`metadata.relatedSurfaces\` block for cross-links.

## Sourcing methodology

Every catalog entry is built by manually loading the analysed product's public site, recording observable structure (positioning, headline pattern, pricing tiers, page flow), and applying the Brunson Hook / Story / Offer or pricing-anchor lens uniformly.

- **No fabricated metrics.** No invented conversion rates, traffic figures, or revenue claims.
- **No quoted copy.** Observations describe patterns ("leans on", "positions around"), not verbatim text.
- **No slag.** Every entry respects the analysed product's value proposition and pulls strategic lessons, not snark.
- **Dated \`lastVerified\`.** Every entry carries the ISO date of the last manual sanity check. Use it to decide whether a stale row is still useful for your analysis.

The full editorial policy lives at [${BASE}/editorial-policy](${BASE}/editorial-policy) — including the corrections log.

## Updates

The dataset is regenerated on every UnlockSaaS deploy. Adding a new entry to any of the five underlying TypeScript catalogs ([alternatives.ts](https://github.com/kindrat86/unlocksaas/blob/main/app/src/lib/alternatives.ts), [funnel-teardowns.ts](https://github.com/kindrat86/unlocksaas/blob/main/app/src/lib/funnel-teardowns.ts), [pricing-teardowns.ts](https://github.com/kindrat86/unlocksaas/blob/main/app/src/lib/pricing-teardowns.ts), [comparisons.ts](https://github.com/kindrat86/unlocksaas/blob/main/app/src/lib/comparisons.ts), [categories.ts](https://github.com/kindrat86/unlocksaas/blob/main/app/src/lib/categories.ts)) auto-extends this dataset on the next build.

## Contact

Maryan, founder of UnlockSaaS — maryan@unlocksaas.com

Corrections, omissions, or factual disputes: open an issue on the GitHub mirror or email directly. Every correction lands in the public corrections log at [${BASE}/editorial-policy](${BASE}/editorial-policy).
`;
}

export function GET() {
  return new NextResponse(buildBody(), {
    status: 200,
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      "access-control-allow-origin": "*",
      link: `<${BASE}/dataset>; rel="canonical"`,
    },
  });
}
