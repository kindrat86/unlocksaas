import { markdownResponseForPath } from "@/lib/seo/md-route";

/**
 * /about.md — markdown mirror of /about for AI crawlers.
 * See src/lib/seo/markdown.ts for the content registry and rationale.
 */
export function GET() {
  return markdownResponseForPath("/about");
}

