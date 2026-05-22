import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/seo/entity";
import {
  MCP_TOOL_SLUGS,
  getMcpToolBySlug,
} from "@/lib/mcp-tools";
import { renderMcpToolMarkdown } from "@/lib/seo/markdown";

/**
 * /mcp-tools/<slug>/md – markdown mirror of each per-MCP-server pSEO page.
 *
 * Mirrors the shape of the prior cluster md routes (/vs/<slug>/md,
 * /funnel-teardown/<slug>/md). Adding a new server to src/lib/mcp-tools.ts
 * auto-extends this surface on the next deploy.
 *
 * Brunson Hard-Rule reconciliation: markdown body is generated from the
 * same McpTool entry the HTML page renders; drift is impossible by
 * construction.
 */

export function generateStaticParams() {
  return MCP_TOOL_SLUGS.map((slug) => ({ slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const t = getMcpToolBySlug(slug);
  if (!t) {
    return new NextResponse("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const body = renderMcpToolMarkdown(slug);
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
      link: `<${BASE_URL}/mcp-tools/${t.slug}>; rel="canonical"`,
    },
  });
}
