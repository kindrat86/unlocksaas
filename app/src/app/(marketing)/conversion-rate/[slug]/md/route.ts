import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/seo/entity";
import {
  CONVERSION_RATE_SLUGS,
  getConversionRateBySlug,
} from "@/lib/conversion-rate";
import { renderConversionRateMarkdown } from "@/lib/seo/markdown";

/**
 * /conversion-rate/<slug>/md – markdown mirror per niche conversion benchmark.
 *
 * Mirrors the shape of /funnel-playbook/<slug>/md. Adding a new entry to
 * src/lib/conversion-rate.ts auto-extends this surface on the next deploy.
 */

export function generateStaticParams() {
  return CONVERSION_RATE_SLUGS.map((slug) => ({ slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const c = getConversionRateBySlug(slug);
  if (!c) {
    return new NextResponse("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const body = renderConversionRateMarkdown(slug);
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
      link: `<${BASE_URL}/conversion-rate/${c.slug}>; rel="canonical"`,
    },
  });
}
