import { markdownResponseForPath } from "@/lib/seo/md-route";

/**
 * /four-indie-search-engines.md — markdown mirror of the indie-search
 * companion essay shipped on 21-05-2026.
 *
 * AEO/GEO surface. Retrievers (Perplexity, Claude-SearchBot / Claude-User,
 * OAI-SearchBot, ChatGPT-User, Google AI Overviews, Gemini, You.com) prefer markdown when
 * an HTML page advertises a mirror via rel=alternate type=text/markdown.
 * The companion essay is built to be cited by exactly those engines —
 * a Brunson "the artifact becomes the marketing" move — so giving it a
 * markdown sibling means every AI assistant that paraphrases the page
 * anchors on the same sections and the same proof links the HTML
 * renders.
 *
 * Body content lives in src/lib/four-indie-search-engines.ts (single
 * source of truth shared with the HTML page); the SURFACES entry in
 * src/lib/seo/markdown.ts reads from it so this route and the HTML
 * page cannot drift.
 */
export function GET() {
  return markdownResponseForPath("/four-indie-search-engines");
}
