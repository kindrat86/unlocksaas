import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";


/**
 * GET /api/monitoring/funnelfixer-status
 *
 * Public read-only endpoint that the operator dashboard at
 * file:///Users/sipi/unlocksaas/monitoring/dashboard.html polls every 30s
 * to render live state of the FunnelFixer carry-over rollout.
 *
 * Returns aggregate counts only (no PII beyond the email column, which is
 * the operator's own list). Not auth-gated because the dashboard runs
 * locally and there is no scraping risk worth defending against on these
 * counts. If that changes, gate behind CRON_SECRET or a separate dashboard
 * token.
 *
 * Shape:
 *   {
 *     ok: true,
 *     as_of: "2026-05-18T17:23:00.000Z",
 *     totals: {
 *       paused: <n>,        // queue waiting to be activated
 *       active: <n>,        // mid-sequence (Emails 1-5 in flight)
 *       complete: <n>,      // finished SOS, eligible for Seinfeld enrol
 *       bounced: <n>,
 *       complained: <n>,
 *       unsubscribed: <n>,
 *     },
 *     in_flight: [
 *       { email, emails_sent, next_send_at, source }  // up to 50 most recent
 *     ],
 *     recent_sends: [
 *       { email, emails_sent, last_sent_at, source }  // up to 20 most recent
 *     ],
 *     next_activation_at: "2026-05-19T06:00:00.000Z"
 *   }
 */
export async function GET() {
  const supabase = createAdminClient();

  // ── Status totals across the funnelfixer cohort ───────────────────────
  const { data: rows, error: rowsErr } = await supabase
    .from("soap_opera_subscribers")
    .select("status")
    .ilike("source", "funnelfixer_%");

  if (rowsErr) {
    return NextResponse.json(
      { ok: false, error: rowsErr.message },
      { status: 500 }
    );
  }

  const totals: Record<string, number> = {
    paused: 0,
    active: 0,
    complete: 0,
    bounced: 0,
    complained: 0,
    unsubscribed: 0,
  };
  for (const r of rows ?? []) {
    const s = (r as { status?: string }).status ?? "unknown";
    totals[s] = (totals[s] ?? 0) + 1;
  }

  // ── In-flight subscribers: status=active, sorted by next scheduled send ──
  const { data: inFlight } = await supabase
    .from("soap_opera_subscribers")
    .select("email, emails_sent, next_send_at, source")
    .eq("status", "active")
    .ilike("source", "funnelfixer_%")
    .order("next_send_at", { ascending: true })
    .limit(50);

  // ── Recent sends: any status, ordered by last_sent_at desc ──────────────
  const { data: recent } = await supabase
    .from("soap_opera_subscribers")
    .select("email, emails_sent, last_sent_at, status, source")
    .ilike("source", "funnelfixer_%")
    .not("last_sent_at", "is", null)
    .order("last_sent_at", { ascending: false })
    .limit(20);

  // Next 06:00 UTC = next activation cron tick.
  const now = new Date();
  const nextActivation = new Date(now);
  nextActivation.setUTCHours(6, 0, 0, 0);
  if (nextActivation.getTime() <= now.getTime()) {
    nextActivation.setUTCDate(nextActivation.getUTCDate() + 1);
  }

  return NextResponse.json(
    {
      ok: true,
      as_of: now.toISOString(),
      totals,
      in_flight: inFlight ?? [],
      recent_sends: recent ?? [],
      next_activation_at: nextActivation.toISOString(),
    },
    {
      headers: {
        // Short cache so a tight polling loop from the dashboard does not
        // hammer Supabase. Still way fresher than the hourly launchd refresh.
        "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30",
        // CORS open: the operator dashboard at file:///...dashboard.html
        // needs to fetch this in the browser. Response is aggregate counts
        // and the operator's own list, so no PII risk in opening it.
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
    }
  );
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Max-Age": "86400",
    },
  });
}
