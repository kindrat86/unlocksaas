import { markdownResponseForPath } from "@/lib/seo/md-route";

/**
 * /editorial-policy.md — markdown mirror of /editorial-policy for AI
 * crawlers and quality-rater pipelines that want the editorial standards
 * in plain-text form. See src/lib/seo/markdown.ts for the content
 * registry and rationale.
 *
 * Surface B (AEO/GEO) extension. The HTML page advertises this mirror via
 * markdownAlternate() in its metadata, and the response sets a
 * Link: rel=canonical header pointing back at /editorial-policy so
 * retrievers cite the HTML in answers instead of the .md.
 */
export function GET() {
  return markdownResponseForPath("/editorial-policy");
}

export const dynamic = "force-static";
