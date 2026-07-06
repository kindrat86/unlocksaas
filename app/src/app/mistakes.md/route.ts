import { markdownResponseForPath } from "@/lib/seo/md-route";

/**
 * /mistakes.md – markdown mirror of the /mistakes hub.
 * See src/lib/seo/markdown.ts for the content registry and rationale.
 */
export function GET() {
  return markdownResponseForPath("/mistakes");
}
