import { markdownResponseForPath } from "@/lib/seo/md-route";

/**
 * /machine-sales.md — markdown mirror of /machine-sales for AI crawlers.
 * See src/lib/seo/markdown.ts for the content registry and rationale.
 */
export function GET() {
  return markdownResponseForPath("/machine-sales");
}

export const dynamic = "force-static";
