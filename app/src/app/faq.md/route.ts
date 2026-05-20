import { markdownResponseForPath } from "@/lib/seo/md-route";

/**
 * /faq.md — markdown mirror of /faq for AI crawlers.
 * See src/lib/seo/markdown.ts for the content registry and rationale.
 */
export function GET() {
  return markdownResponseForPath("/faq");
}

