import { markdownResponseForPath } from "@/lib/seo/md-route";

/**
 * /how-to.md – markdown mirror of the /how-to hub.
 * See src/lib/seo/markdown.ts for the content registry and rationale.
 */
export function GET() {
  return markdownResponseForPath("/how-to");
}
