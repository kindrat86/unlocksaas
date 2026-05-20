import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/seo/entity";
import { NICHE_SLUGS, getNicheBySlug } from "@/lib/niches";
import { renderNicheMarkdown } from "@/lib/seo/markdown";

/**
 * /for/<slug>/md — markdown mirror of each cohort-specific landing page.
 * Mirrors the shape of /glossary/<slug>/md.
 *
 * Adding a new entry to src/lib/niches.ts auto-extends this surface on
 * the next deploy. Brunson Hard-Rule reconciliation: markdown body is
 * generated from the same NicheEntry the HTML page renders.
 */

export function generateStaticParams() {
  return NICHE_SLUGS.map((slug) => ({ slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const n = getNicheBySlug(slug);
  if (!n) {
    return new NextResponse("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const body = renderNicheMarkdown(slug);
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
      link: `<${BASE_URL}/for/${n.slug}>; rel="canonical"`,
    },
  });
}

// Pre-render every niche slug at build time. No request-time inputs.
