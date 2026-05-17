import { markdownResponseForPath } from "@/lib/seo/md-route";

/**
 * /index.md — markdown mirror of the funnel-hub homepage `/` for AI crawlers.
 *
 * Convention note: the canonical homepage is `/`, but `/.md` is not a valid
 * URL. /index.md is the established alternative used by llmstxt.org-style
 * crawlers and matches the directory-index analogue most retrieval pipelines
 * already special-case.
 *
 * See src/lib/seo/markdown.ts for the content registry and rationale.
 */
export function GET() {
  return markdownResponseForPath("/");
}

export const dynamic = "force-static";
