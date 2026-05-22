import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/seo/entity";
import { renderMcpToolsHubMarkdown } from "@/lib/seo/markdown";

/**
 * /mcp-tools.md – markdown mirror of the /mcp-tools hub.
 *
 * Body is generated from MCP_TOOLS in src/lib/mcp-tools.ts (single source
 * of truth). Same cache headers and Link: rel=canonical convention as the
 * other hub mirrors.
 */
export function GET() {
  return new NextResponse(renderMcpToolsHubMarkdown(), {
    status: 200,
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      link: `<${BASE_URL}/mcp-tools>; rel="canonical"`,
    },
  });
}
