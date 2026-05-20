import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/seo/entity";
import {
  PRICING_PAGE_PATTERN_SLUGS,
  getPricingPagePatternBySlug,
} from "@/lib/pricing-page-examples";
import { renderPricingPagePatternMarkdown } from "@/lib/seo/markdown";

/**
 * /pricing-page-examples/<slug>/md – markdown mirror per pricing pattern.
 *
 * Mirrors the shape of /funnel-playbook/<slug>/md. Adding a new entry to
 * src/lib/pricing-page-examples.ts auto-extends this surface on the next
 * deploy.
 */

export function generateStaticParams() {
  return PRICING_PAGE_PATTERN_SLUGS.map((slug) => ({ slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const p = getPricingPagePatternBySlug(slug);
  if (!p) {
    return new NextResponse("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const body = renderPricingPagePatternMarkdown(slug);
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
      link: `<${BASE_URL}/pricing-page-examples/${p.slug}>; rel="canonical"`,
    },
  });
}
