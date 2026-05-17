import { NextRequest, NextResponse } from "next/server";
import { ALTERNATIVE_SLUGS } from "@/lib/alternatives";
import { TEARDOWN_SLUGS } from "@/lib/funnel-teardowns";
import { PRICING_TEARDOWN_SLUGS } from "@/lib/pricing-teardowns";
import { COMPARISON_SLUGS } from "@/lib/comparisons";
import { CATEGORY_SLUGS } from "@/lib/categories";

/**
 * IndexNow ping cron — Surface A.4 (crawlability) of strategy/google-strategy.md.
 *
 * GET /api/cron/indexnow
 *
 * Notifies Bing, Yandex, Naver, Seznam, and every other IndexNow-
 * subscribing engine of every public marketing URL in one batch. Where a
 * passive sitemap re-crawl can take Bing 1–3 days to pick up new pSEO
 * slugs, an IndexNow ping is reflected in the index in seconds-to-minutes.
 *
 * Bing-derived AI surfaces (Copilot, ChatGPT search via Bing, DuckAssist,
 * Yandex Neuro) all read the same index – so this cron is a direct AIO
 * accelerator for non-Google answer engines that lag Google's own
 * discovery. Google does not subscribe to IndexNow; the existing sitemap
 * remains the discovery path for Googlebot.
 *
 * Auth: Vercel injects `Authorization: Bearer <CRON_SECRET>` on every
 * cron-triggered request; we verify before doing outbound work. Mirrors
 * the pattern used by /api/cron/soap-opera, /api/cron/seinfeld, etc.
 *
 * Operator activation:
 *   1. Generate a key:        `openssl rand -hex 16` (or any 8–128 hex chars).
 *   2. Push to Vercel:        `vercel env add INDEXNOW_KEY` (all 3 envs).
 *   3. (Optional) Verify:     curl https://unlocksaas.com/indexnow-key
 *                              should return the literal key, content-type
 *                              text/plain.
 *   4. First ping at the next scheduled fire (or trigger manually with
 *      `curl -H "Authorization: Bearer $CRON_SECRET" https://unlocksaas.com/api/cron/indexnow`).
 *
 * Brunson Hard-Rule reconciliation: zero fabricated URLs in the urlList.
 * Every URL submitted is a real, indexable, force-static page generated
 * from the same five pSEO manifests the sitemap consumes. Adding a slug
 * to any manifest auto-extends the next IndexNow ping on the next cron
 * tick – same single-source-of-truth pattern as the sitemap.
 *
 * Cron schedule wired in vercel.json: daily at 18:00 UTC, after the four
 * email crons (14/15/16/17 UTC). One ping per day is well within IndexNow
 * rate limits (no documented hard cap; the spec recommends batching).
 */

export const runtime = "nodejs";
// IndexNow endpoint typically responds in well under a second. 60s is
// generous headroom in case of transient slowness; we never want the cron
// to block other deploys.
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const BASE = "https://unlocksaas.com";
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

/**
 * Static public marketing URLs. Mirrors the static block in app/sitemap.ts.
 * Kept inline (not imported from sitemap.ts) so this cron remains a
 * standalone module – sitemap.ts is a Next.js convention export and
 * importing from it across route boundaries is fragile across Next major
 * versions. The slug arrays below ARE imported from the manifests directly
 * so the dynamic block stays in lockstep with the sitemap without coupling
 * to the sitemap module.
 */
const STATIC_URLS: readonly string[] = [
  "/",
  "/diagnostic",
  "/stories",
  "/starter",
  "/playbook-sales",
  "/founding",
  "/bridge",
  "/challenge",
  "/repeatable",
  "/faq",
  "/alternatives-to",
  "/funnel-teardown",
  "/pricing-teardown",
  "/compare",
  "/category",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
];

/**
 * Build the full URL list. Pure – safe to call from anywhere. Order is
 * stable across runs so IndexNow's de-dupe is friendly to our cadence.
 */
function buildUrlList(): string[] {
  const dynamic: string[] = [
    ...ALTERNATIVE_SLUGS.map((s) => `/alternatives-to/${s}`),
    ...TEARDOWN_SLUGS.map((s) => `/funnel-teardown/${s}`),
    ...PRICING_TEARDOWN_SLUGS.map((s) => `/pricing-teardown/${s}`),
    ...COMPARISON_SLUGS.map((s) => `/compare/${s}`),
    ...CATEGORY_SLUGS.map((s) => `/category/${s}`),
  ];
  return [...STATIC_URLS, ...dynamic].map((p) => `${BASE}${p}`);
}

export async function GET(req: NextRequest) {
  // ─── Auth ────────────────────────────────────────────────────────────
  const expected = process.env.CRON_SECRET;
  const provided = req.headers.get("authorization");
  if (expected && provided !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // ─── Pre-flight ──────────────────────────────────────────────────────
  const key = process.env.INDEXNOW_KEY;
  if (!key || key.length < 8 || !/^[a-f0-9-]+$/i.test(key)) {
    // No-op cron: skip cleanly instead of erroring loudly. This lets the
    // cron be scheduled before the key is provisioned without filling
    // up the Vercel error dashboard.
    console.warn(
      "[indexnow-cron] INDEXNOW_KEY env var unset or malformed; skipping ping",
    );
    return NextResponse.json(
      { skipped: true, reason: "INDEXNOW_KEY_NOT_CONFIGURED" },
      { status: 200 },
    );
  }

  // ─── Build payload ───────────────────────────────────────────────────
  const urlList = buildUrlList();
  if (urlList.length === 0) {
    console.warn("[indexnow-cron] urlList empty; nothing to ping");
    return NextResponse.json({ skipped: true, reason: "EMPTY_URL_LIST" }, {
      status: 200,
    });
  }

  // IndexNow spec: keyLocation must serve the key as plain text at a URL
  // on the same host as the URLs being submitted. Our /indexnow-key route
  // handler is exactly that. (Deliberately not under /api/ — robots.txt
  // disallows /api/* for every crawler, and some IndexNow validators
  // honour robots.txt before fetching keyLocation.)
  const payload = {
    host: new URL(BASE).host,
    key,
    keyLocation: `${BASE}/indexnow-key`,
    urlList,
  };

  // ─── Submit ─────────────────────────────────────────────────────────
  const started = Date.now();
  let res: Response;
  try {
    res = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json; charset=utf-8",
        accept: "application/json",
      },
      body: JSON.stringify(payload),
      // Bound by maxDuration above; an explicit AbortSignal keeps the
      // fetch from outliving the function.
      signal: AbortSignal.timeout(30_000),
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("[indexnow-cron] fetch_failed", detail);
    return NextResponse.json(
      { error: "fetch_failed", detail },
      { status: 502 },
    );
  }

  const elapsedMs = Date.now() - started;

  // IndexNow returns 200/202 on success, 4xx on client error, 5xx on
  // server error. The body is small JSON – safe to read in full.
  const bodyText = await res.text().catch(() => "");

  if (res.status >= 200 && res.status < 300) {
    console.info(
      `[indexnow-cron] submitted ${urlList.length} urls in ${elapsedMs}ms (status=${res.status})`,
    );
    return NextResponse.json(
      {
        ok: true,
        submitted: urlList.length,
        status: res.status,
        elapsedMs,
      },
      { status: 200 },
    );
  }

  console.error(
    `[indexnow-cron] indexnow_error status=${res.status} body=${bodyText.slice(0, 500)}`,
  );
  return NextResponse.json(
    {
      error: "indexnow_error",
      status: res.status,
      body: bodyText.slice(0, 500),
    },
    // Pass through IndexNow's status when it's a client error so the
    // operator can diagnose key/payload issues directly from the cron
    // dashboard. Cap at 502 for 5xx to avoid double-bubbling upstream
    // outages as our own outage.
    { status: res.status >= 400 && res.status < 500 ? res.status : 502 },
  );
}
