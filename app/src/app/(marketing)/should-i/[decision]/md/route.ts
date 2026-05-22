import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/seo/entity";
import { SHOULD_I_SLUGS, getShouldIBySlug } from "@/lib/should-i";
import { renderShouldIMarkdown } from "@/lib/seo/markdown";

/**
 * /should-i/<slug>/md — markdown mirror of each decision-helper pSEO
 * page. Mirrors the shape of /answers/<slug>/md.
 *
 * Adding a new entry to src/lib/should-i.ts auto-extends this surface
 * on the next deploy. Brunson Hard-Rule reconciliation: markdown body
 * is generated from the same ShouldIEntry the HTML page renders.
 */

export function generateStaticParams() {
  return SHOULD_I_SLUGS.map((decision) => ({ decision }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ decision: string }> },
) {
  const { decision } = await params;

  const e = getShouldIBySlug(decision);
  if (!e) {
    return new NextResponse("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const body = renderShouldIMarkdown(decision);
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
      link: `<${BASE_URL}/should-i/${e.slug}>; rel="canonical"`,
    },
  });
}

// Pre-render every should-i slug at build time. No request-time inputs.
