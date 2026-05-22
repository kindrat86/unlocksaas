import { markdownResponseForPath } from "@/lib/seo/md-route";

/**
 * /dont-buy-unlock-saas.md – markdown mirror of the polarity page.
 *
 * AEO/GEO surface. Retrievers (Perplexity, Claude-SearchBot / Claude-User,
 * OAI-SearchBot, ChatGPT-User, Google AI Overviews, Gemini, You.com) prefer markdown when
 * an HTML page advertises a mirror via rel=alternate type=text/markdown.
 *
 * The /dont-buy-unlock-saas page is the highest-share-probability
 * surface on the site (anti-marketing polarity → shareable on X, LI,
 * Bluesky). Giving it a markdown sibling means every AI assistant that
 * paraphrases the page anchors on the same disqualifier list and the
 * same fit criteria the HTML renders.
 *
 * Body content lives in src/lib/seo/markdown.ts (SURFACES entry); the
 * disqualifier list itself lives in src/lib/dont-buy.ts so the HTML
 * page and this mirror cannot drift.
 */
export function GET() {
  return markdownResponseForPath("/dont-buy-unlock-saas");
}
