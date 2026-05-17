import { NextResponse, type NextRequest } from "next/server";
import sitemap from "@/app/sitemap";
import {
  readIndexNowKey,
  submitToIndexNow,
  INDEXNOW_KEY_LOCATION,
} from "@/lib/indexnow";

/**
 * POST /api/indexnow
 *
 * On-demand IndexNow submission endpoint. Submits the canonical URL set to
 * all IndexNow endpoints (api.indexnow.org, Bing, Yandex) in parallel.
 *
 * Relationship to /api/cron/indexnow:
 *   - /api/cron/indexnow runs daily at 18:00 UTC (per vercel.json), CRON_SECRET-
 *     authed, hits api.indexnow.org only. That's the safety net.
 *   - This endpoint is the *deploy-time* trigger – designed to be wired into
 *     a Vercel Deploy Hook so every production deploy pings IndexNow within
 *     seconds of the new pages going live, instead of waiting up to 24h for
 *     the cron tick. Hits api.indexnow.org + Bing + Yandex in parallel so a
 *     single endpoint outage doesn't lose the push.
 *
 * Auth:
 *   The endpoint requires the same INDEXNOW_KEY value the search engines
 *   already trust, supplied via:
 *     - Header  Authorization: Bearer <INDEXNOW_KEY>
 *     - Query   ?secret=<INDEXNOW_KEY>
 *
 *   Using the IndexNow key itself as the auth token keeps the operator
 *   surface to one secret instead of two. The impact of a leak is the
 *   same: an attacker can submit our URLs on our behalf, which is the
 *   same impact as a leaked INDEXNOW_KEY (worst case = forced re-crawl
 *   of pages we already wanted re-crawled).
 *
 * Body (optional, JSON):
 *   { "urls": ["https://unlocksaas.com/...", ...] }
 *   If omitted, the endpoint submits every URL in the live sitemap.
 *
 * Response:
 *   { ok: boolean, submitted: number, successes: number, endpoints: [...] }
 *   Status 200 on any successful submission; 502 only if *every* endpoint
 *   failed.
 *
 * Operator usage:
 *   curl -X POST \
 *     -H "Authorization: Bearer $INDEXNOW_KEY" \
 *     https://unlocksaas.com/api/indexnow
 *
 *   # Or wire as a Vercel Deploy Hook with the secret in the URL:
 *   https://unlocksaas.com/api/indexnow?secret=...
 */

// Node.js runtime – the sitemap import pulls in module-level data from
// every pSEO manifest, which is fine on Node but bloats an Edge bundle.
export const runtime = "nodejs";

// Submission is a side-effecting outbound call; never cache.
export const dynamic = "force-dynamic";
export const revalidate = 0;

const HOST = "unlocksaas.com";

interface RequestBody {
  urls?: unknown;
}

export async function POST(req: NextRequest) {
  // ── 1. Verify the feature is configured ───────────────────────────────
  const key = readIndexNowKey();
  if (!key) {
    return NextResponse.json(
      {
        ok: false,
        error: "indexnow_not_configured",
        message:
          "INDEXNOW_KEY env var is not set. Generate a 32-char key, push to Vercel, and try again.",
      },
      { status: 503 },
    );
  }

  // ── 2. Check auth ─────────────────────────────────────────────────────
  const headerToken = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const queryToken = req.nextUrl.searchParams.get("secret");
  const supplied = headerToken || queryToken;
  if (supplied !== key) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  }

  // ── 3. Resolve the URL list ───────────────────────────────────────────
  let urls: string[] = [];

  // Body is optional. If present, must be a JSON object with `urls: string[]`.
  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    let body: RequestBody;
    try {
      body = (await req.json()) as RequestBody;
    } catch {
      return NextResponse.json(
        { ok: false, error: "invalid_json_body" },
        { status: 400 },
      );
    }
    if (Array.isArray(body.urls)) {
      urls = body.urls.filter((u): u is string => typeof u === "string");
    }
  }

  // Default: pull every URL out of the live sitemap so what we submit is
  // exactly what we tell the search engines is canonical.
  if (urls.length === 0) {
    const map = sitemap();
    urls = map.map((entry) => entry.url);
  }

  // ── 4. Submit ─────────────────────────────────────────────────────────
  const results = await submitToIndexNow({
    host: HOST,
    key,
    urls,
    keyLocation: `https://${HOST}${INDEXNOW_KEY_LOCATION}`,
  });

  const successes = results.filter((r) => r.ok).length;
  const ok = successes > 0;

  // Surface IndexNow failures in Vercel's runtime log so a fire-and-forget
  // Deploy Hook call (which never reads the response body) still leaves
  // an audit trail when every upstream rejects the submission. No PII or
  // secret values in the log line – only endpoint host + status.
  if (!ok) {
    console.warn("indexnow.submit failed across all endpoints", {
      submitted: urls.length,
      endpoints: results.map((r) => ({ endpoint: r.endpoint, status: r.status })),
    });
  }

  return NextResponse.json(
    {
      ok,
      submitted: urls.length,
      successes,
      endpoints: results,
    },
    { status: ok ? 200 : 502 },
  );
}

/**
 * GET — health-check + discovery surface. Reports whether the feature is
 * configured without revealing the key value. Intentionally returns the
 * same shape on both states so the operator can curl it during setup
 * without parsing a different schema each time.
 */
export function GET() {
  const configured = Boolean(readIndexNowKey());
  return NextResponse.json({
    ok: true,
    configured,
    keyLocation: `https://${HOST}${INDEXNOW_KEY_LOCATION}`,
    submitEndpoint: `https://${HOST}/api/indexnow`,
    note: configured
      ? "POST to this endpoint with the INDEXNOW_KEY in Authorization: Bearer or ?secret= to trigger a submission."
      : "Set INDEXNOW_KEY in Vercel env to activate.",
  });
}
