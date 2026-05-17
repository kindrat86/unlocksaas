import { markdownResponseForPath } from "@/lib/seo/md-route";

/**
 * /starter.md — markdown mirror of /starter for AI crawlers.
 * See src/lib/seo/markdown.ts for the content registry and rationale.
 */
export function GET() {
  return markdownResponseForPath("/starter");
}

export const dynamic = "force-static";
