import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/seo/entity";
import { STACK_SLUGS, getStackBySlug } from "@/lib/stacks";
import { renderStackMarkdown } from "@/lib/seo/markdown";

/**
 * /stack-for/<slug>/md – markdown mirror of each cohort-specific stack
 * recommendation. Mirrors the shape of /for/<slug>/md.
 *
 * Adding a new entry to src/lib/stacks.ts auto-extends this surface on
 * the next deploy. Brunson Hard-Rule reconciliation: markdown body is
 * generated from the same StackEntry the HTML page renders, so the
 * canonical paraphrase target retrievers cite stays byte-identical to
 * what a human reader sees.
 *
 * Static generation: generateStaticParams pre-renders every slug at
 * build time. No request-time inputs. Runs on the default Node.js
 * runtime (Fluid Compute) – no need for edge.
 */

export function generateStaticParams() {
  return STACK_SLUGS.map((slug) => ({ slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const s = getStackBySlug(slug);
  if (!s) {
    return new NextResponse("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const body = renderStackMarkdown(slug);
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
      link: `<${BASE_URL}/stack-for/${s.slug}>; rel="canonical"`,
    },
  });
}
