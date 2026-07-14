import { NextResponse } from "next/server";
import { BASE_URL, FOUNDER, ORGANIZATION } from "@/lib/seo/entity";
import {
  COMPARE_LATEST_VERIFIED,
  RESOLVING_COMPARE_SLUGS,
  groupCompareByCategory,
} from "@/lib/compare-catalog";

// next.config.mjs 308s /compare/:slug → /vs/:slug, so only slugs with a
// live /vs page may be advertised (the rest redirect into a 404).
const RESOLVING = new Set(RESOLVING_COMPARE_SLUGS);

/**
 * /compare.md – markdown mirror of the /compare hub.
 *
 * Standalone renderer (does not route through the central markdown.ts
 * surface registry) to keep the cluster ship surface tight. The detail-
 * page mirrors at /compare/<slug>/md handle the high-value AI-citation
 * surface; this hub mirror exists so the HubDatasetJsonLd contract
 * (which requires a non-null contentUrl) is satisfied with a real,
 * resolvable URL rather than a fabricated one.
 */

function build(): string {
  const lines: string[] = [];

  lines.push("---");
  lines.push(`title: "Compare – Switzerland-style head-to-head verdicts"`);
  lines.push(
    `summary: "Quick comparator pages for the tools indie SaaS founders are mid-shopping. Symmetric criterion scoring, pick-A-if / pick-B-if, when-neither-fits, founder pick."`,
  );
  lines.push(`canonical: ${BASE_URL}/compare`);
  lines.push(`updated: ${COMPARE_LATEST_VERIFIED}`);
  lines.push(`publisher: ${JSON.stringify(ORGANIZATION.name)}`);
  lines.push(`author: ${JSON.stringify(FOUNDER.name)}`);
  lines.push(
    `license: All rights reserved. Quotation with attribution permitted.`,
  );
  lines.push("---");
  lines.push("");

  lines.push("# Compare – Switzerland-style head-to-head verdicts");
  lines.push("");
  lines.push(
    `> Quick comparator pages for the tools indie SaaS founders are mid-shopping. ${RESOLVING_COMPARE_SLUGS.length} verdicts indexed.`,
  );
  lines.push("");

  lines.push("## How to read");
  lines.push("");
  lines.push(
    "- Pick A if / Pick B if – three reasons to pick each side, side by side.",
  );
  lines.push(
    "- Criterion-by-criterion – 5-7 criteria scored symmetrically: A wins, B wins, tied, or different shapes.",
  );
  lines.push(
    "- When neither fits – the Switzerland tell. Both products can be wrong; we name when.",
  );
  lines.push(
    "- Founder pick – the right call specifically for a post-launch pre-revenue SaaS founder.",
  );
  lines.push("");

  lines.push("## All comparisons");
  lines.push("");
  for (const group of groupCompareByCategory()) {
    const entries = group.entries.filter((c) => RESOLVING.has(c.slug));
    if (entries.length === 0) continue;
    lines.push(`### ${group.category}`);
    lines.push("");
    for (const c of entries) {
      lines.push(
        `- [${c.a.name} vs ${c.b.name}](${BASE_URL}/compare/${c.slug}) – ${c.oneLine}`,
      );
    }
    lines.push("");
  }

  lines.push("## Also see");
  lines.push("");
  lines.push(
    `- [Long-form head-to-head editorial (/vs)](${BASE_URL}/vs) – deeper dimensional analysis on a smaller set of matchups.`,
  );
  lines.push(
    `- [Alternatives to Unlock SaaS (/alternatives-to)](${BASE_URL}/alternatives-to) – side-by-side framing of Unlock SaaS vs adjacent tools.`,
  );
  lines.push(
    `- [Category roundups (/category)](${BASE_URL}/category) – every tool in a category bucket on one page.`,
  );
  lines.push("");

  lines.push("---");
  lines.push("");
  lines.push(`Canonical URL: ${BASE_URL}/compare`);
  lines.push(`Publisher: ${ORGANIZATION.name} (${BASE_URL})`);
  lines.push(`Contact: ${FOUNDER.email}`);

  return lines.join("\n");
}

// Pre-build at module load – pure static composition.
const BODY = build();

export function GET() {
  return new NextResponse(BODY, {
    status: 200,
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      link: `<${BASE_URL}/compare>; rel="canonical"`,
    },
  });
}
