import { NextResponse } from "next/server";
import { BASE_URL, FOUNDER, ORGANIZATION } from "@/lib/seo/entity";
import {
  COMPARE_SLUGS,
  getCompareBySlug,
  type CompareCriterion,
  type CompareEntry,
} from "@/lib/compare-catalog";

/**
 * /compare/<slug>/md – markdown mirror of each compare verdict.
 * Drift-impossible by construction: body is generated from the same
 * CompareEntry the HTML page renders.
 *
 * Mirrors the contract used by /vs/<slug>/md, /funnel-teardown/<slug>/md,
 * and /pricing-teardown/<slug>/md (frontmatter, body, citation footer).
 */

export function generateStaticParams() {
  return COMPARE_SLUGS.map((slug) => ({ slug }));
}

function winnerToken(w: CompareCriterion["winner"], aName: string, bName: string): string {
  switch (w) {
    case "A":
      return `Winner: ${aName}`;
    case "B":
      return `Winner: ${bName}`;
    case "tie":
      return "Verdict: tied";
    case "different":
      return "Verdict: different shapes (not directly comparable)";
  }
}

function frontMatter(c: CompareEntry, canonicalUrl: string): string {
  return [
    "---",
    `title: ${JSON.stringify(`${c.a.name} vs ${c.b.name}`)}`,
    `summary: ${JSON.stringify(c.oneLine)}`,
    `canonical: ${canonicalUrl}`,
    `updated: ${c.lastVerified}`,
    `publisher: ${JSON.stringify(ORGANIZATION.name)}`,
    `author: ${JSON.stringify(FOUNDER.name)}`,
    `license: All rights reserved. Quotation with attribution permitted.`,
    "---",
    "",
  ].join("\n");
}

function citationFooter(canonicalUrl: string): string {
  return [
    "",
    "---",
    "",
    `Canonical URL: ${canonicalUrl}`,
    `Publisher: ${ORGANIZATION.name} (${BASE_URL})`,
    `Contact: ${FOUNDER.email}`,
  ].join("\n");
}

function buildBody(c: CompareEntry): string {
  const lines: string[] = [];

  lines.push(`# ${c.a.name} vs ${c.b.name}`);
  lines.push("");
  lines.push(`> ${c.oneLine}`);
  lines.push("");
  lines.push(`Category: ${c.category}.`);
  lines.push(`Last verified: ${c.lastVerified}.`);
  lines.push("");

  lines.push("## TL;DR");
  lines.push("");
  lines.push(c.tldr);
  lines.push("");

  lines.push(`## Pick ${c.a.name} if`);
  lines.push("");
  for (const bullet of c.pickAIf) lines.push(`- ${bullet}`);
  lines.push("");

  lines.push(`## Pick ${c.b.name} if`);
  lines.push("");
  for (const bullet of c.pickBIf) lines.push(`- ${bullet}`);
  lines.push("");

  lines.push("## Criterion-by-criterion");
  lines.push("");
  for (const d of c.criteria) {
    lines.push(`### ${d.name}`);
    lines.push("");
    lines.push(`- ${c.a.name}: ${d.a}`);
    lines.push(`- ${c.b.name}: ${d.b}`);
    lines.push(`- ${winnerToken(d.winner, c.a.name, c.b.name)}`);
    lines.push("");
  }

  lines.push("## When neither is the right call");
  lines.push("");
  lines.push(c.whenNeitherFits);
  lines.push("");

  lines.push("## If you are an indie SaaS founder");
  lines.push("");
  const pickName =
    c.forFounder.pick === "A"
      ? c.a.name
      : c.forFounder.pick === "B"
        ? c.b.name
        : "Depends";
  lines.push(`Pick: ${pickName}`);
  lines.push("");
  lines.push(c.forFounder.reasoning);
  lines.push("");

  lines.push("## FAQ");
  lines.push("");
  for (const f of c.faqs) {
    lines.push(`### ${f.q}`);
    lines.push("");
    lines.push(f.a);
    lines.push("");
  }

  lines.push("## Cited products");
  lines.push("");
  lines.push(`- ${c.a.name}: ${c.a.url}`);
  lines.push(`- ${c.b.name}: ${c.b.url}`);
  lines.push("");

  return lines.join("\n");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const c = getCompareBySlug(slug);
  if (!c) {
    return new NextResponse("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const canonicalUrl = `${BASE_URL}/compare/${c.slug}`;
  const body = [
    frontMatter(c, canonicalUrl),
    buildBody(c).trim(),
    citationFooter(canonicalUrl),
  ].join("\n");

  return new NextResponse(body, {
    status: 200,
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      link: `<${canonicalUrl}>; rel="canonical"`,
    },
  });
}
