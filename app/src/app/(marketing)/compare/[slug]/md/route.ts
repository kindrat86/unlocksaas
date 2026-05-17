import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/seo/entity";
import {
  COMPARISON_SLUGS,
  getComparisonBySlug,
} from "@/lib/comparisons";
import { renderComparisonMarkdown } from "@/lib/seo/markdown";

/**
 * /compare/<slug>/md — markdown mirror of each per-comparison pSEO page.
 * Mirrors funnel-teardown/[slug]/md and pricing-teardown/[slug]/md.
 * Drift-impossible by construction: body generated from the same Comparison
 * entry the HTML page renders.
 */

export function generateStaticParams() {
  return COMPARISON_SLUGS.map((slug) => ({ slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const c = getComparisonBySlug(slug);
  if (!c) {
    return new NextResponse("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const body = renderComparisonMarkdown(slug);
  if (!body) {
    return new NextResponse("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  return new NextResponse(body, {
    status: 200,
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      link: `<${BASE_URL}/compare/${c.slug}>; rel="canonical"`,
    },
  });
}

export const dynamicParams = false;
