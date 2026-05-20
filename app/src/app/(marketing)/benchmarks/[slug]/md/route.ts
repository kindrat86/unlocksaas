import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/seo/entity";
import { BENCHMARK_SLUGS, getBenchmarkBySlug } from "@/lib/benchmarks";
import { renderBenchmarkMarkdown } from "@/lib/seo/markdown";

/**
 * /benchmarks/<slug>/md — markdown mirror of each directional-benchmark
 * pSEO page. Mirrors the shape of /glossary/<slug>/md.
 *
 * Adding a new entry to src/lib/benchmarks.ts auto-extends this surface
 * on the next deploy. Brunson Hard-Rule reconciliation: markdown body is
 * generated from the same BenchmarkEntry the HTML page renders — drift
 * is impossible by construction.
 */

export function generateStaticParams() {
  return BENCHMARK_SLUGS.map((slug) => ({ slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const b = getBenchmarkBySlug(slug);
  if (!b) {
    return new NextResponse("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const body = renderBenchmarkMarkdown(slug);
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
      link: `<${BASE_URL}/benchmarks/${b.slug}>; rel="canonical"`,
    },
  });
}

// Pre-render every benchmark slug at build time. No request-time inputs.
