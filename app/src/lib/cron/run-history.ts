import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * Cron observability wrapper — closes DCS Secret #6 (Soap Opera) audit gap
 * by writing every cron tick to public.cron_run_history.
 *
 * Migration: supabase/migrations/20260518000005_cron_run_history.sql
 *
 * Usage from a cron route handler:
 *
 *   export async function GET(req: NextRequest) {
 *     return withCronRunHistory(req, "/api/cron/soap-opera", async () => {
 *       const supabase = createAdminClient();
 *       // ...do the work...
 *       return { processed: due.length, sent, failed };
 *     });
 *   }
 *
 * The wrapper:
 *   1. Verifies the CRON_SECRET bearer token (centralizes the check that
 *      every cron handler used to repeat).
 *   2. Inserts a `status='running'` row BEFORE invoking the handler so a
 *      handler that times out / OOMs is visible as a stuck row instead of
 *      a silent miss.
 *   3. Updates the row to `status='ok'` (success) or `status='error'`
 *      (handler threw OR every send in the batch failed) on completion.
 *   4. Returns the canonical JSON response shape: { ok, processed, sent,
 *      failed, ...extra }.
 *
 * Failure semantics:
 *   - Handler throws            → status='error', error_detail set, 500 response.
 *   - All sends failed (sent=0) → status='error', 200 response (the handler
 *     itself succeeded; the data downstream just has a leak — surfaced for
 *     the Friday Audible Call to investigate).
 *   - Mixed sends               → status='ok' (Brunson rule: any forward
 *     motion counts; track the failed count for the audible).
 *
 * The function NEVER blocks the response on a history-table write failure
 * — observability must not become a foot-gun that breaks the cron itself.
 */

export interface CronResult {
  processed: number;
  sent?: number;
  failed?: number;
  /** Arbitrary extra fields merged into the JSON response (e.g. per-cadence stats). */
  extra?: Record<string, unknown>;
}

export type CronHandler = () => Promise<CronResult>;

export async function withCronRunHistory(
  req: NextRequest,
  cronPath: string,
  handler: CronHandler
): Promise<NextResponse> {
  // 1) Auth — same check every handler used to repeat inline.
  const expected = process.env.CRON_SECRET;
  const provided = req.headers.get("authorization");
  if (expected && provided !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const startedAtMs = Date.now();
  const startedAt = new Date(startedAtMs).toISOString();

  // 2) Insert a 'running' row up front. If this insert fails we still run
  // the handler — observability is best-effort, dispatch is canonical.
  let runId: string | null = null;
  const { data: insertRow, error: insertErr } = await supabase
    .from("cron_run_history" as never)
    .insert({
      cron_path: cronPath,
      started_at: startedAt,
      status: "running",
    } as never)
    .select("id")
    .single<{ id: string }>();

  if (insertErr) {
    console.error("[cron-history] insert_failed", {
      cron_path: cronPath,
      error: insertErr.message,
    });
  } else if (insertRow) {
    runId = insertRow.id;
  }

  // 3) Run the handler with try/catch — a thrown error must still close the row.
  let result: CronResult;
  try {
    result = await handler();
  } catch (err) {
    const durationMs = Date.now() - startedAtMs;
    const errorDetail = err instanceof Error ? err.message : "unknown_error";
    console.error("[cron-history] handler_threw", {
      cron_path: cronPath,
      error: errorDetail,
    });
    if (runId) {
      await supabase
        .from("cron_run_history" as never)
        .update({
          finished_at: new Date().toISOString(),
          status: "error",
          error_detail: errorDetail,
          duration_ms: durationMs,
        } as never)
        .eq("id", runId);
    }
    return NextResponse.json(
      { error: "handler_threw", detail: errorDetail },
      { status: 500 }
    );
  }

  // 4) Close out the row.
  const durationMs = Date.now() - startedAtMs;
  const processed = result.processed ?? 0;
  const sent = result.sent ?? 0;
  const failed = result.failed ?? 0;

  // "All sends failed but the handler returned normally" still flags as
  // an error for the Friday Audible Call. If the handler had nothing to
  // process (processed=0), that's not an error — it's a quiet day.
  const status: "ok" | "error" =
    processed > 0 && sent === 0 && failed > 0 ? "error" : "ok";

  if (runId) {
    const { error: updateErr } = await supabase
      .from("cron_run_history" as never)
      .update({
        finished_at: new Date().toISOString(),
        status,
        processed,
        sent,
        failed,
        duration_ms: durationMs,
      } as never)
      .eq("id", runId);
    if (updateErr) {
      console.error("[cron-history] update_failed", {
        cron_path: cronPath,
        run_id: runId,
        error: updateErr.message,
      });
    }
  }

  return NextResponse.json({
    ok: true,
    processed,
    sent,
    failed,
    ...(result.extra ?? {}),
  });
}
