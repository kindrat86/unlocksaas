/**
 * /indexnow.txt — public IndexNow key file.
 *
 * The IndexNow protocol (https://www.indexnow.org) requires the publisher
 * to host a key file the engines can fetch to confirm ownership before
 * accepting URL submissions. We pick the canonical /indexnow.txt path
 * (rather than /<key>.txt) so:
 *   1. Rotating the key requires only an env-var update, never a route
 *      rename + redeploy.
 *   2. The key is discoverable at a stable, well-known path that matches
 *      the keyLocation we POST to api.indexnow.org from
 *      src/lib/seo/indexnow.ts.
 *
 * Returns 404 when INDEXNOW_KEY is unset — without a key the route would
 * leak an empty body that the engines treat as an invalid key file. They
 * blocklist domains that serve malformed key files. A clean 404 makes the
 * misconfiguration obvious to the operator and harmless to the engines.
 *
 * The token IS intended to be public — that's the protocol's whole design.
 * Do not flag this route in a secrets scan.
 */
import { NextResponse } from "next/server";
import { isValidIndexNowKey } from "@/lib/seo/indexnow";

// Read env at request time so an operator rotation takes effect on the next
// engine fetch without forcing a redeploy. The engines hit this route a few
// times an hour at most — the lost edge-cache is negligible.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET() {
  const key = process.env.INDEXNOW_KEY?.trim();
  if (!isValidIndexNowKey(key)) {
    return new NextResponse("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
  return new NextResponse(key, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      // Short edge-cache. Engines re-fetch on rotation; we don't want the
      // old key cached for an hour after a rotation push.
      "cache-control": "public, max-age=300, s-maxage=300",
    },
  });
}
