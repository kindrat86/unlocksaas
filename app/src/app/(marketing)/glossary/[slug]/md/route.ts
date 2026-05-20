import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/seo/entity";
import { GLOSSARY_SLUGS, getGlossaryBySlug } from "@/lib/glossary";
import { renderGlossaryMarkdown } from "@/lib/seo/markdown";

/**
 * /glossary/<slug>/md – markdown mirror of each per-term glossary page.
 *
 * Mirrors the shape of /funnel-teardown/<slug>/md. Adding a new entry to
 * src/lib/glossary.ts auto-extends this surface on the next deploy.
 *
 * Brunson Hard-Rule reconciliation: markdown body is generated from the
 * same GlossaryEntry the HTML page renders; drift is impossible by
 * construction (the short definition itself is read from the canonical
 * entity.DEFINED_TERMS array at module load).
 */

export function generateStaticParams() {
  return GLOSSARY_SLUGS.map((slug) => ({ slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const g = getGlossaryBySlug(slug);
  if (!g) {
    return new NextResponse("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const body = renderGlossaryMarkdown(slug);
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
      link: `<${BASE_URL}/glossary/${g.slug}>; rel="canonical"`,
    },
  });
}

// Pre-render every glossary slug at build time. No request-time inputs.
