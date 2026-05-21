import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/seo/entity";
import {
  SWIPE_FILE_SLUGS,
  getSwipeFileBySlug,
} from "@/lib/swipe-files";
import { renderSwipeFileMarkdown } from "@/lib/seo/markdown";

/**
 * /swipe-file/<slug>/md – markdown mirror of each per-element swipe
 * file. Mirrors the shape of /funnel-playbook/<slug>/md.
 *
 * Adding a new entry to src/lib/swipe-files.ts auto-extends this
 * surface on the next deploy. Markdown body is built from the same
 * SwipeFileEntry the HTML page renders – drift between schema, HTML,
 * and markdown is impossible by construction.
 */

export function generateStaticParams() {
  return SWIPE_FILE_SLUGS.map((slug) => ({ slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const s = getSwipeFileBySlug(slug);
  if (!s) {
    return new NextResponse("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const body = renderSwipeFileMarkdown(slug);
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
      link: `<${BASE_URL}/swipe-file/${s.slug}>; rel="canonical"`,
    },
  });
}

// Pre-render every swipe-file slug at build time. No request-time inputs.
