import { markdownResponseForPath } from "@/lib/seo/md-route";

/**
 * /post-mortem.md — markdown mirror of the /post-mortem hub.
 * See src/lib/seo/markdown.ts for the content registry and rationale.
 */
export function GET() {
  return markdownResponseForPath("/post-mortem");
}
