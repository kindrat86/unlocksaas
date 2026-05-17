import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/seo/entity";
import {
  PRICING_TEARDOWN_SLUGS,
  getPricingTeardownBySlug,
} from "@/lib/pricing-teardowns";
import { renderPricingTeardownMarkdown } from "@/lib/seo/markdown";

/**
 * /pricing-teardown/<slug>/md — markdown mirror of each per-pricing-teardown
 * pSEO page. Mirrors the shape of /funnel-teardown/<slug>/md and
 * /alternatives-to/<slug>/md. Adding a new teardown to
 * src/lib/pricing-teardowns.ts auto-extends this surface on the next deploy.
 *
 * Brunson Hard-Rule reconciliation: markdown body is generated from the
 * same PricingTeardown entry the HTML page renders; drift is impossible
 * by construction. See src/lib/seo/markdown.ts header.
 */

export function generateStaticParams() {
  return PRICING_TEARDOWN_SLUGS.map((slug) => ({ slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const t = getPricingTeardownBySlug(slug);
  if (!t) {
    return new NextResponse("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const body = renderPricingTeardownMarkdown(slug);
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
      link: `<${BASE_URL}/pricing-teardown/${t.slug}>; rel="canonical"`,
    },
  });
}

// Pre-render every teardown at build time. No request-time inputs.
export const dynamicParams = false;
