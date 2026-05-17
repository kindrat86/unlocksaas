import { NextRequest, NextResponse } from "next/server";
import {
  buildIndexNowUrlList,
  submitToIndexNow,
} from "@/lib/seo/indexnow";

/**
 * Weekly belt-and-suspenders IndexNow re-submit.
 *
 * The primary IndexNow trigger is /api/webhooks/vercel/deployment — it
 * fires on every successful production deploy and submits the full URL
 * list to Bing / Yandex / Naver / Seznam / Yep. This cron exists for the
 * residual cases that webhook can't catch:
 *   - A webhook delivery silently dropped (Vercel does retry, but a long
 *     outage on api.indexnow.org could exhaust the retry budget).
 *   - An engine evicted a URL between deploys (rare; happens when the
 *     engine's quality crawl returns thin-content false positives).
 *   - A manifest changed without a deploy. Impossible on this codebase
 *     today — every manifest lives in src/lib/*.ts and only changes
 *     through a commit — but cheap insurance against future drift.
 *
 * Schedule: every Sunday at 12:00 UTC (off-peak for our traffic; see
 * vercel.json). Vercel injects Authorization: Bearer <CRON_SECRET> on
 * every cron invocation; we verify before any outbound work.
 *
 * Idempotency: re-submitting the same URL list every week is safe by
 * IndexNow spec — engines return 200 ("accepted, no changes") for URLs
 * whose content hasn't changed and 202 ("accepted, changes detected")
 * otherwise. Either is success.
 */

export const runtime = "nodejs";
// IndexNow batches typically complete in <2s for our URL count, but cap
// at 60s to allow for engine slowness without surprising a cron operator.
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  const provided = req.headers.get("authorization");
  if (expected && provided !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  console.log("[cron-indexnow] weekly re-submit starting");
  const urls = await buildIndexNowUrlList();
  const result = await submitToIndexNow(urls);

  if (!result.ok) {
    console.error(
      `[cron-indexnow] re-submit failed (attempted=${result.attempted}, skipped=${result.skippedReason ?? "-"}). Batches:`,
      result.batches.map((b) => `${b.count}→${b.status}`).join(", ")
    );
  } else {
    console.log(
      `[cron-indexnow] re-submit OK (attempted=${result.attempted}, batches=${result.batches.length})`
    );
  }

  return NextResponse.json({ submitted: urls.length, result });
}
