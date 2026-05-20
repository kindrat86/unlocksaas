import { markdownResponseForPath } from "@/lib/seo/md-route";

/**
 * /diagnostic.md — markdown mirror of /diagnostic for AI crawlers.
 * See src/lib/seo/markdown.ts for the content registry and rationale.
 */
export function GET() {
  return markdownResponseForPath("/diagnostic");
}

