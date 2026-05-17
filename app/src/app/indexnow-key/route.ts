import { NextResponse } from "next/server";

/**
 * IndexNow key endpoint — public ownership-proof file.
 *
 * Served at `/indexnow-key` (intentionally NOT under `/api/`). The robots.txt
 * PRIVATE_DISALLOW list blocks `/api/*` for every crawler including
 * IndexNow-affiliated validators, and some IndexNow implementations
 * respect robots.txt before fetching the keyLocation. Hosting outside
 * `/api/` eliminates that protocol-level risk.
 *
 * Surface A.4 of strategy/google-strategy.md (added 2026-05-17): wires
 * UnlockSaaS into the IndexNow protocol so that the moment a new pSEO
 * slug ships, Bing, Yandex, Naver, Seznam, and every other IndexNow-
 * subscribing engine learns about it in seconds instead of waiting for
 * the next sitemap crawl.
 *
 * Protocol contract: any URL the operator declares as `keyLocation` in
 * the IndexNow POST body MUST return the literal key string and nothing
 * else, with content-type text/plain. This route is that URL. Tied to
 * the INDEXNOW_KEY env var so a key rotation is a vercel env update
 * with no code change.
 *
 * If the env var is unset (fresh checkout, key not yet generated), the
 * route returns 503 instead of empty 200. Empty-200 would silently
 * confirm the key location to IndexNow with no key, breaking every
 * subsequent ping silently. 503 fails loudly and visibly.
 *
 * Public by design: the key is meant to be readable by IndexNow
 * validators. It is not a secret in any meaningful sense – it is
 * a one-way proof that the owner of the domain set up the integration.
 * Loss of the key just forces a rotation; loss of value is zero.
 *
 * Cache: long-lived. The key rotates rarely (annual at most). Edge
 * cache is fine.
 */

export const runtime = "nodejs";
export const dynamic = "force-static";
export const revalidate = 86400; // 24h; key changes via env rotation only.

export function GET() {
  const key = process.env.INDEXNOW_KEY;
  if (!key || key.length < 8 || !/^[a-f0-9-]+$/i.test(key)) {
    // 503 not 404: the route exists, the integration is configured but
    // not yet activated. Operator action required (see setup script).
    // Logged so the gap is visible in Vercel logs the first time an
    // IndexNow validator hits the endpoint after deploy.
    console.warn(
      "[indexnow-key] INDEXNOW_KEY env var unset or malformed (expected 8+ hex chars); refusing to serve key file",
    );
    return new NextResponse("INDEXNOW_KEY not configured", {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  return new NextResponse(key, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control":
        "public, max-age=3600, s-maxage=86400, immutable",
    },
  });
}
