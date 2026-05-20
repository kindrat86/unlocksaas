import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/seo/entity";
import {
  CATEGORY_SLUGS,
  getCategoryBySlug,
} from "@/lib/categories";
import { renderCategoryMarkdown } from "@/lib/seo/markdown";

/**
 * /category/<slug>/md — markdown mirror of each per-category roundup page.
 * Mirrors funnel-teardown/[slug]/md / pricing-teardown/[slug]/md / compare/[slug]/md.
 * Body generated from the same CategoryDef + manifest aggregators the HTML
 * page uses, so drift is impossible by construction.
 */

export function generateStaticParams() {
  return CATEGORY_SLUGS.map((slug) => ({ slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const cat = getCategoryBySlug(slug);
  if (!cat) {
    return new NextResponse("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const body = renderCategoryMarkdown(slug);
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
      link: `<${BASE_URL}/category/${cat.slug}>; rel="canonical"`,
    },
  });
}

