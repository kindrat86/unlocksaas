import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/seo/entity";
import {
  ALTERNATIVE_SLUGS,
  getAlternativeBySlug,
} from "@/lib/alternatives";
import { renderAlternativeMarkdown } from "@/lib/seo/markdown";

/**
 * /alternatives-to/<slug>/md — markdown mirror of the per-alternative
 * comparison pSEO page.
 *
 * Why this URL shape instead of `/alternatives-to/<slug>.md`
 * ----------------------------------------------------------
 * The Next.js App Router parses bracketed segments (`[slug]`) only when the
 * entire folder name is a bracket pair — `[slug].md` is interpreted as a
 * literal folder name, not a dynamic segment with a `.md` suffix. The
 * cleanest dynamic-mirror URL the router actually supports is a child
 * route, `/alternatives-to/<slug>/md`. Documented in /llms.txt so agents
 * can discover the convention.
 *
 * Static generation: every entry in ALTERNATIVE_SLUGS gets a pre-rendered
 * mirror at build time. Adding a new comparison to src/lib/alternatives.ts
 * auto-extends this surface on the next deploy — same pattern as the
 * sitemap.
 *
 * Brunson Hard-Rule reconciliation: markdown body is generated from the
 * same Alternative entry that the HTML page renders; drift is impossible
 * by construction. See src/lib/seo/markdown.ts header.
 */

export function generateStaticParams() {
  return ALTERNATIVE_SLUGS.map((slug) => ({ slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const alt = getAlternativeBySlug(slug);
  if (!alt) {
    return new NextResponse("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const body = renderAlternativeMarkdown(slug);
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
      // Citation pipelines should land on the HTML comparison, not the
      // markdown mirror. Without this, an LLM may quote the mirror URL.
      link: `<${BASE_URL}/alternatives-to/${alt.slug}>; rel="canonical"`,
    },
  });
}

// Pre-render every alternative at build time. No request-time inputs.
export const dynamicParams = false;
