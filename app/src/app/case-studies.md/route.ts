import { markdownResponseForPath } from "@/lib/seo/md-route";

/**
 * /case-studies.md – markdown mirror of the /case-studies hub.
 * See src/lib/seo/markdown.ts for the content registry and rationale.
 */
export function GET() {
  return markdownResponseForPath("/case-studies");
}
