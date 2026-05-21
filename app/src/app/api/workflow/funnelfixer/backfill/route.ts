import { NextRequest, NextResponse } from "next/server";
import { start } from "workflow/api";
import { createAdminClient } from "@/lib/supabase/server";
import { funnelfixerReengagementWorkflow } from "@/lib/workflows/funnelfixer-reengagement";

/**
 * POST /api/workflow/funnelfixer/backfill
 *
 * Backfill FunnelFixer subscribers by starting a reengagement workflow for each.
 * This is an operator-facing endpoint called once to migrate all 36 paused
 * FunnelFixer subscribers from the old cron-based system to Workflow DevKit.
 *
 * Only processes rows with:
 *   - source ILIKE 'funnelfixer_%'
 *   - status = 'paused'
 *
 * Idempotent: rows that already have emails_sent > 0 or status != 'paused' are skipped.
 *
 * Query params (optional):
 *   - dryRun=true: log what would be started without actually starting workflows
 *   - limit=<n>: start workflows for max <n> subscribers (default: no limit)
 *
 * Response:
 *   { ok: true, started: number, skipped: number, errors: [{ subscriberId, error }] }
 *   { ok: false, error: string }
 */
export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const dryRun = url.searchParams.get("dryRun") === "true";
    const limitStr = url.searchParams.get("limit");
    const limit = limitStr ? parseInt(limitStr, 10) : undefined;

    const supabase = createAdminClient();

    // Fetch all paused FunnelFixer subscribers (36 in total).
    const { data: rows, error: queryError } = await supabase
      .from("soap_opera_subscribers")
      .select("*")
      .ilike("source", "funnelfixer_%")
      .eq("status", "paused")
      .order("created_at", { ascending: true })
      .limit(limit ?? 1000);

    if (queryError) {
      return NextResponse.json(
        { ok: false, error: `Query failed: ${queryError.message}` },
        { status: 500 }
      );
    }

    if (!rows || rows.length === 0) {
      return NextResponse.json({
        ok: true,
        started: 0,
        skipped: 0,
        errors: [],
        message: "No paused FunnelFixer subscribers found",
      });
    }

    const started: string[] = [];
    const skipped: string[] = [];
    const errors: Array<{ subscriberId: string; error: string }> = [];

    for (const row of rows) {
      try {
        // Skip if already has sends (already activated in old system).
        if ((row.emails_sent ?? 0) > 0) {
          skipped.push(row.id);
          continue;
        }

        if (dryRun) {
          console.log("[backfill] would start workflow for", {
            subscriberId: row.id,
            email: row.email,
          });
          started.push(row.id);
        } else {
          // Start the workflow for this subscriber.
          const run = await start(funnelfixerReengagementWorkflow, [row.id]);
          started.push(row.id);
          console.log("[backfill] started workflow for subscriber", {
            subscriberId: row.id,
            email: row.email,
            runId: run.runId,
          });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        errors.push({
          subscriberId: row.id,
          error: message,
        });
        console.error("[backfill] workflow start failed for subscriber", {
          subscriberId: row.id,
          error: message,
        });
      }
    }

    const responseBody = {
      ok: true,
      dryRun,
      started: started.length,
      skipped: skipped.length,
      errors,
      startedIds: started,
      message: dryRun
        ? `Would start ${started.length} workflows (dry run)`
        : `Started ${started.length} workflows`,
    };

    return NextResponse.json(responseBody);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[backfill] error:", { message });
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
