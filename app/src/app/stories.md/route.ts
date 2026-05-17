import { markdownResponseForPath } from "@/lib/seo/md-route";

/**
 * /stories.md — markdown mirror of /stories for AI crawlers.
 * See src/lib/seo/markdown.ts for the content registry and rationale.
 */
export function GET() {
  return markdownResponseForPath("/stories");
}

export const dynamic = "force-static";
