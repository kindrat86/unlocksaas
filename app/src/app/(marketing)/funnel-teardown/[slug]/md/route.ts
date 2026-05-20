import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/seo/entity";
import {
  TEARDOWN_SLUGS,
  getTeardownBySlug,
} from "@/lib/funnel-teardowns";
import { renderTeardownMarkdown } from "@/lib/seo/markdown";

/**
 * /funnel-teardown/<slug>/md — markdown mirror of each per-teardown pSEO page.
 *
 * Mirrors the shape of /alternatives-to/<slug>/md. Adding a new teardown to
 * src/lib/funnel-teardowns.ts auto-extends this surface on the next deploy.
 *
 * Brunson Hard-Rule reconciliation: markdown body is generated from the
 * same FunnelTeardown entry the HTML page renders; drift is impossible by
 * construction. See src/lib/seo/markdown.ts header.
 */

export function generateStaticParams() {
  return TEARDOWN_SLUGS.map((slug) => ({ slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const t = getTeardownBySlug(slug);
  if (!t) {
    return new NextResponse("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const body = renderTeardownMarkdown(slug);
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
      link: `<${BASE_URL}/funnel-teardown/${t.slug}>; rel="canonical"`,
    },
  });
}

// Pre-render every teardown at build time. No request-time inputs.
