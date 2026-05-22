import { markdownResponseForPath } from "@/lib/seo/md-route";

/**
 * /press/listings.md — markdown mirror of /press/listings for AI crawlers
 * (Perplexity, ClaudeBot, OAI-SearchBot, Google AI Overviews) that prefer
 * playbook-readable plain text over JS-rendered HTML.
 *
 * Body lives in src/lib/seo/markdown.ts LISTINGS_BODY. The HTML page at
 * /press/listings advertises this mirror via markdownAlternate() in its
 * metadata; this route is the file the link points to.
 */
export function GET() {
  return markdownResponseForPath("/press/listings");
}
