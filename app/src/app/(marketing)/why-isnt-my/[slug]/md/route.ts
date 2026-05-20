import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/seo/entity";
import {
  WHY_ISNT_MY_SLUGS,
  getWhyIsntMyBySlug,
} from "@/lib/why-isnt-my";
import { renderWhyIsntMyMarkdown } from "@/lib/seo/markdown";

/**
 * /why-isnt-my/<slug>/md — markdown mirror of each panic-mode diagnostic
 * pSEO page. Mirrors the shape of /glossary/<slug>/md.
 *
 * Adding a new entry to src/lib/why-isnt-my.ts auto-extends this surface
 * on the next deploy. Brunson Hard-Rule reconciliation: markdown body is
 * generated from the same WhyIsntMyEntry the HTML page renders.
 */

export function generateStaticParams() {
  return WHY_ISNT_MY_SLUGS.map((slug) => ({ slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const w = getWhyIsntMyBySlug(slug);
  if (!w) {
    return new NextResponse("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const body = renderWhyIsntMyMarkdown(slug);
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
      link: `<${BASE_URL}/why-isnt-my/${w.slug}>; rel="canonical"`,
    },
  });
}

// Pre-render every slug at build time. No request-time inputs.
