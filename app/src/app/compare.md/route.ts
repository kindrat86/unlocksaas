import { markdownResponseForPath } from "@/lib/seo/md-route";

/**
 * /compare.md — markdown mirror of the /compare hub.
 * See src/lib/seo/markdown.ts for the content registry and rationale.
 */
export function GET() {
  return markdownResponseForPath("/compare");
}

