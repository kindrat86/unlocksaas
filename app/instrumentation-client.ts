/**
 * BotID client-side instrumentation (Next.js 15.3+ recommended path).
 *
 * This file runs before any page renders on the client. It tells the BotID
 * SDK which routes to attach challenge headers to. The server-side
 * checkBotId() in each protected route reads those headers to classify the
 * session.
 *
 * Routes listed here must match the routes that call checkBotId() on the
 * server. The client library intercepts fetch() calls to these paths and
 * injects the necessary BotID headers automatically -- no form changes needed.
 *
 * Fail-open design: if this script fails to load (ad-blocker, network error),
 * the server-side checkBotId() call will either receive no token (treated as
 * ambiguous, not "isBot") or throw -- and the try/catch in each route lets the
 * request through. Legitimate users are never blocked by a client-side outage.
 */
import { initBotId } from "botid/client/core";

initBotId({
  protect: [
    {
      // Stripe checkout session creation. Protected against card-testing bots
      // that would otherwise enumerate stolen card numbers at zero Stripe cost
      // until a session completes.
      path: "/api/checkout",
      method: "POST",
    },
    {
      // Free diagnostic endpoint. Protected against LLM-scraping bots that
      // submit bulk product URLs to extract Anthropic-powered analysis at
      // Maryan's API cost. Real founders always arrive via a browser session.
      path: "/api/diagnostic",
      method: "POST",
    },
  ],
});
