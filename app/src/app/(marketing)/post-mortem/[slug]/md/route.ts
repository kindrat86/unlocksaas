import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/seo/entity";
import {
  POST_MORTEM_SLUGS,
  getPostMortemBySlug,
} from "@/lib/post-mortems";
import { renderPostMortemMarkdown } from "@/lib/seo/markdown";

/**
 * /post-mortem/<slug>/md — markdown mirror of each per-post-mortem pSEO
 * page. Mirrors the shape of /funnel-teardown/<slug>/md. Adding a new
 * post-mortem to src/lib/post-mortems.ts auto-extends this surface on
 * the next deploy.
 *
 * Brunson Hard-Rule reconciliation: markdown body is generated from the
 * same PostMortem entry the HTML page renders; drift is impossible by
 * construction. See src/lib/seo/markdown.ts header.
 */

export function generateStaticParams() {
  return POST_MORTEM_SLUGS.map((slug) => ({ slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const p = getPostMortemBySlug(slug);
  if (!p) {
    return new NextResponse("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const body = renderPostMortemMarkdown(slug);
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
      link: `<${BASE_URL}/post-mortem/${p.slug}>; rel="canonical"`,
    },
  });
}

// Pre-render every post-mortem at build time. No request-time inputs.
