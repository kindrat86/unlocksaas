import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/seo/entity";
import { SCRIPT_SLUGS, getScriptBySlug } from "@/lib/scripts";
import { renderScriptMarkdown } from "@/lib/seo/markdown";

/**
 * /scripts/<slug>/md – markdown mirror of each funnel-script template.
 *
 * Mirrors the shape of /funnel-playbook/<slug>/md. Adding a new entry to
 * src/lib/scripts.ts auto-extends this surface on the next deploy.
 * Brunson Hard-Rule reconciliation: markdown body is generated from the
 * same ScriptEntry the HTML page renders.
 */

export function generateStaticParams() {
  return SCRIPT_SLUGS.map((slug) => ({ slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const s = getScriptBySlug(slug);
  if (!s) {
    return new NextResponse("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const body = renderScriptMarkdown(slug);
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
      link: `<${BASE_URL}/scripts/${s.slug}>; rel="canonical"`,
    },
  });
}
