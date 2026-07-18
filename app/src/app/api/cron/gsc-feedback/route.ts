import { NextRequest, NextResponse } from "next/server";
import { requireCronSecret } from "@/lib/cron-auth";
import { captureServer } from "@/lib/analytics/server";
import {
  querySearchAnalytics,
  readGscConfig,
  yesterdayUtc,
  type SearchAnalyticsRow,
} from "@/lib/gsc/client";
import {
  Event,
  GSC_DISTINCT_ID,
  type GscFeedbackSyncedProps,
  type GscSearchQueryObservedProps,
} from "@/lib/analytics/events";
import { getActiveSerpVariantForGsc } from "@/lib/seo/serp-variants";
import { PostHog } from "posthog-node";

/**
 * Daily cron: GET /api/cron/gsc-feedback
 *
 * Surface 13 (CRO instrumentation feeding SEO) gap closure. Pulls
 * yesterday's Search Analytics rows from Google Search Console and
 * emits one PostHog event per row, plus one summary event per tick.
 *
 * Scheduled via app/vercel.json `crons` at 19:00 UTC – after the four
 * email crons (14/15/16/17) and the IndexNow ping (18). One pull per
 * day per the GSC freshness lag (typically 1–3 days), so re-running
 * before the next UTC day fires would re-pull the same window.
 *
 * Auth
 * ----
 * Two layers, both enforced before any outbound call:
 *   1. CRON_SECRET bearer header (Vercel injects on every cron-fired
 *      request). Mirrors the pattern used by every other cron in this
 *      project.
 *   2. GSC service-account credentials (GSC_SERVICE_ACCOUNT_EMAIL +
 *      GSC_SERVICE_ACCOUNT_PRIVATE_KEY) and GSC_SITE_URL. The route
 *      503s cleanly when any of the three is unset.
 *
 * Operator activation
 * -------------------
 *   1. Create a service account in the Google Cloud project that owns
 *      the Search Console property. Download the JSON key. Grab the
 *      `client_email` and `private_key` fields.
 *   2. In Search Console → Settings → Users and permissions, add the
 *      `client_email` as a Restricted user (Read access is enough).
 *   3. Push the three env vars to Vercel:
 *        vercel env add GSC_SERVICE_ACCOUNT_EMAIL production
 *        vercel env add GSC_SERVICE_ACCOUNT_PRIVATE_KEY production --sensitive
 *        vercel env add GSC_SITE_URL production
 *      (Repeat for `preview` if you want preview deploys to pull too.)
 *   4. Redeploy. The next 19:00 UTC tick fires automatically; or
 *      trigger manually:
 *        curl -H "Authorization: Bearer $CRON_SECRET" \
 *          https://unlocksaas.com/api/cron/gsc-feedback
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 * - Every row emitted is real GSC data. No fabricated queries, no
 *   synthetic positions. Empty windows return `{ ok: true, rows: 0 }`
 *   – honest empty.
 * - The summary event always includes `rows_returned` and
 *   `rows_emitted` so the operator can spot a silent failure (e.g.
 *   service-account permission revoked → 0 rows for a string of days).
 */

// The search-analytics call typically resolves in 2-5s; tolerate up to
// 60s for one bad day at Google's API. Well below the 300s platform cap.
export const maxDuration = 60;

/**
 * Hard ceiling on rows-per-tick. 500 is plenty for an indie SaaS
 * footprint and keeps the PostHog event quota predictable. When the
 * site grows past this, the summary event's `cap_hit: true` is the
 * signal to widen the limit or move to weekly digests.
 */
const MAX_ROWS_PER_TICK = 500;

/**
 * Minimum impressions for a row to count toward worst_ctr_query. Below
 * this the CTR is noise – one impression with zero clicks is 0% CTR
 * but not actionable.
 */
const MIN_IMPRESSIONS_FOR_CTR_SIGNAL = 10;

export async function GET(req: NextRequest) {
  const started = Date.now();

  // ── Auth: CRON_SECRET bearer ─────────────────────────────────────────
  // Fail closed: unset CRON_SECRET rejects exactly like a mismatch.
  const unauthorized = requireCronSecret(req);
  if (unauthorized) return unauthorized;

  // ── Config presence ──────────────────────────────────────────────────
  const config = readGscConfig();
  if (!config) {
    // 503 mirrors the IndexNow cron's pattern when its key is unset –
    // the cron dashboard surfaces it as the obvious "not yet wired"
    // state without spamming error reports.
    return NextResponse.json(
      {
        error: "gsc_not_configured",
        detail:
          "Set GSC_SITE_URL, GSC_SERVICE_ACCOUNT_EMAIL, and GSC_SERVICE_ACCOUNT_PRIVATE_KEY to activate. See app/.env.example for the operator runbook.",
      },
      { status: 503 },
    );
  }

  // ── Window: yesterday-UTC ────────────────────────────────────────────
  const { startDate, endDate } = yesterdayUtc();

  // ── Pull ─────────────────────────────────────────────────────────────
  let rows: SearchAnalyticsRow[];
  try {
    rows = await querySearchAnalytics({
      startDate,
      endDate,
      rowLimit: MAX_ROWS_PER_TICK + 1, // +1 so we can detect cap-hit
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("[gsc-feedback-cron] query_failed", detail);
    // 502 for upstream errors, 401 for auth – the JWT signer throws
    // a string containing `status=401` when the service-account perm
    // is missing, which is the highest-value diagnostic.
    const status = detail.includes("status=401") ? 401 : 502;
    return NextResponse.json(
      { error: "gsc_query_failed", detail, status },
      { status },
    );
  }

  const capHit = rows.length > MAX_ROWS_PER_TICK;
  const trimmed = capHit ? rows.slice(0, MAX_ROWS_PER_TICK) : rows;

  // ── Emit per-row events ─────────────────────────────────────────────
  //
  // We bypass the shared `captureServer()` helper for the per-row loop
  // because we want a single PostHog client with `flushAt: 100` so the
  // 500-row batch goes out as five HTTPS requests instead of 500.
  // `captureServer()` ships with `flushAt: 1` (correct default for the
  // webhook hot-path where every event matters individually) but it
  // would melt our quota and the API rate-limit here.
  const ph = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "", {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com",
    flushAt: 100,
    flushInterval: 0,
  });

  // If PostHog isn't configured, skip the per-row loop entirely – the
  // summary captureServer() call below will also no-op via the existing
  // guard. We still return the row count to the cron dashboard so the
  // operator can verify GSC auth works end-to-end before turning on
  // analytics.
  const phConfigured = Boolean(
    process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NEXT_PUBLIC_POSTHOG_HOST,
  );

  // Resolve SERP-variant attribution once per unique page in the row set.
  // The variant table is sparse (only opted-in pages appear), so most
  // rows return null. Caching by page string avoids re-parsing the URL
  // for every duplicate. The variant is resolved against the window's
  // END date so a row from a date the new variant was already live gets
  // attributed correctly even if the cron is back-filling.
  const windowEndAsDate = new Date(`${endDate}T23:59:59Z`);
  const variantCache = new Map<
    string,
    ReturnType<typeof getActiveSerpVariantForGsc>
  >();
  const resolveVariant = (pageUrl: string) => {
    const cached = variantCache.get(pageUrl);
    if (cached !== undefined) return cached;
    const v = getActiveSerpVariantForGsc(pageUrl, windowEndAsDate);
    variantCache.set(pageUrl, v);
    return v;
  };

  if (phConfigured) {
    for (const row of trimmed) {
      // country/device are optional in the typed surface – GSC may omit
      // either when the dimension has no value for the row (e.g. queries
      // with no geo signal). Pass through unmodified; PostHog drops
      // undefined properties.
      const variant = resolveVariant(row.page);
      const props: GscSearchQueryObservedProps = {
        query: row.query,
        page: row.page,
        country: row.country,
        device: row.device,
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position,
        window_start_date: startDate,
        window_end_date: endDate,
        // SERP-variant attribution. Absent when the page is not in the
        // variant registry (the default for most pSEO surfaces). When
        // present, the operator can group CTR by (page, variant_id) in
        // PostHog and read epoch-over-epoch lift directly.
        ...(variant
          ? {
              serp_variant_id: variant.id,
              serp_variant_live_from: variant.live_from,
              serp_variant_count: variant.variant_count,
            }
          : {}),
      };
      ph.capture({
        distinctId: GSC_DISTINCT_ID,
        event: Event.GscSearchQueryObserved,
        properties: props,
      });
    }
    await ph.flush();
  }

  // ── Summary event ───────────────────────────────────────────────────
  //
  // One per tick, regardless of row count. This is the row the operator
  // pins on a PostHog dashboard to monitor sync health: zero rows for
  // a streak of days = service account perm revoked or GSC site
  // ownership lapsed.
  const topQuery = pickTopBy(trimmed, (r) => r.clicks)?.query;
  const worstCtrQuery = pickWorstCtr(trimmed)?.query;

  const summary: GscFeedbackSyncedProps = {
    window_start_date: startDate,
    window_end_date: endDate,
    rows_returned: rows.length,
    rows_emitted: phConfigured ? trimmed.length : 0,
    cap_hit: capHit,
    elapsed_ms: Date.now() - started,
    top_query: topQuery,
    worst_ctr_query: worstCtrQuery,
  };

  // Spread through an inline literal so TS infers a widenable shape
  // (the typed `GscFeedbackSyncedProps` is structurally compatible but
  // a named interface does not auto-widen to Record<string, unknown>).
  captureServer(GSC_DISTINCT_ID, Event.GscFeedbackSynced, { ...summary });

  // Make sure the summary event flushes before the function freezes.
  // `captureServer` is fire-and-forget by design; for the cron we want
  // the guarantee, so we shut the local client down (it flushes any
  // queued summary too).
  if (phConfigured) {
    await ph.shutdown().catch(() => {
      // Shutdown failure is a metrics-loss concern, not a cron-failure
      // concern. We've already returned the data the dashboard needs.
    });
  }

  return NextResponse.json(
    { ok: true, ...summary, site_url: config.siteUrl },
    { status: 200 },
  );
}

/**
 * Tiny argmax. Linear scan, no sort. O(n) over the 500-row cap is
 * 500 comparisons – cheaper than Array.prototype.sort even on small N.
 */
function pickTopBy<T>(rows: readonly T[], score: (r: T) => number): T | undefined {
  let best: T | undefined;
  let bestScore = -Infinity;
  for (const row of rows) {
    const s = score(row);
    if (s > bestScore) {
      bestScore = s;
      best = row;
    }
  }
  return best;
}

/**
 * Lowest CTR with enough impressions to matter. The "worst CTR with no
 * impressions" row is a spam row – we filter it out via the impression
 * floor.
 */
function pickWorstCtr(rows: readonly SearchAnalyticsRow[]): SearchAnalyticsRow | undefined {
  let worst: SearchAnalyticsRow | undefined;
  let worstCtr = Infinity;
  for (const row of rows) {
    if (row.impressions < MIN_IMPRESSIONS_FOR_CTR_SIGNAL) continue;
    if (row.ctr < worstCtr) {
      worstCtr = row.ctr;
      worst = row;
    }
  }
  return worst;
}
