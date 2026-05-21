import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import {
  sendNextAndAdvance,
  sendBranchAndMark,
  selectBranch,
  type DueRow,
  type BranchRow,
} from "@/lib/soap-opera/dispatch";
import type { DiagnosticResult } from "@/lib/soap-opera/emails";

// Soap Opera cron may need to fan out to many subscribers. Bump well past the
// default to be safe – most days this returns in seconds.
export const maxDuration = 300;
// Force dynamic so the cron always runs against live DB state instead of
// being statically rendered at build time.

/**
 * Daily cron: GET /api/cron/soap-opera
 *
 * Two passes per tick:
 *
 *   1. Spine pass: send the next pending E1/E2/E3 to every subscriber
 *      whose next_send_at is in the past and emails_sent < 3.
 *   2. Branch pass: for every subscriber whose spine is exhausted
 *      (emails_sent = 3) AND last_sent_at <= now - 48h AND branch_fired
 *      = 'none', evaluate selectBranch() and fire branch_a or branch_b
 *      if applicable. If neither E3 open nor click was recorded, no
 *      branch fires – the subscriber is left at branch_fired='none'
 *      for now (a future "ghost" branch is out of scope per the
 *      sos-3-spine-2-branch decision doc).
 *
 * Vercel injects an `Authorization: Bearer <CRON_SECRET>` header on
 * every cron-triggered request; we verify it before touching state.
 *
 * Idempotency:
 *   - Spine row whose Resend send fails: emails_sent unchanged, retried
 *     next tick.
 *   - Branch row whose Resend send fails: branch_fired stays 'none',
 *     retried next tick. The successful branch send flips branch_fired
 *     before returning so duplicates can't fire.
 *
 * FunnelFixer carry-over subscribers (source LIKE 'funnelfixer_%') are
 * dispatched by /api/cron/funnelfixer-tick at 30-minute throttle. They
 * are excluded from both passes here so the two crons cannot race.
 */
export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  const provided = req.headers.get("authorization");
  if (expected && provided !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();
  // The "E3 is at least 2 days behind us" cutoff for the day-6 branch
  // pass. E3 is sent on day 4 (last_sent_at), branches fire on day 6.
  const branchCutoffIso = new Date(
    nowMs - 2 * 24 * 60 * 60 * 1000
  ).toISOString();

  // ── PASS 1: spine (E1/E2/E3) ──────────────────────────────────────────────
  const { data: due, error: dueError } = await supabase
    .from("soap_opera_subscribers")
    .select("id, email, diagnostic_result, emails_sent, source")
    .eq("status", "active")
    // Subscribe owns Day 0; cron handles the rest. emails_sent < 3 keeps
    // this pass scoped to spine sends only.
    .gte("emails_sent", 1)
    .lt("emails_sent", 3)
    .not("next_send_at", "is", null)
    .lte("next_send_at", nowIso)
    .not("source", "ilike", "funnelfixer_%")
    .limit(500);

  if (dueError) {
    console.error("[soap-opera-cron] spine_select_failed", dueError);
    return NextResponse.json(
      { error: "spine_select_failed", detail: dueError.message },
      { status: 500 }
    );
  }

  let spineSent = 0;
  let spineFailed = 0;
  for (const raw of due ?? []) {
    const row: DueRow = {
      id: raw.id,
      email: raw.email,
      diagnostic_result: raw.diagnostic_result as DiagnosticResult | null,
      emails_sent: raw.emails_sent,
      source: (raw as { source?: string | null }).source ?? null,
    };
    const result = await sendNextAndAdvance(row);
    if (result.ok) {
      spineSent++;
    } else {
      spineFailed++;
      console.error("[soap-opera-cron] spine_row_failed", {
        email: row.email,
        index: result.index,
        error: result.error,
      });
    }
  }

  // ── PASS 2: branches (day 6, gated on E3 engagement) ──────────────────────
  // Selected columns include the new e3_opened_at / e3_clicked_at /
  // converted_to_starter_at / core_activated_at signals. We cast the
  // adminClient locally because the generated database.types.ts has not
  // been regenerated for the new columns yet.
  const branchClient = supabase as unknown as {
    from: (t: string) => {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          gte: (col: string, val: number) => {
            lte: (col: string, val: string) => {
              not: (col: string, op: string, val: string) => {
                limit: (n: number) => Promise<{
                  data: Array<{
                    id: string;
                    email: string;
                    diagnostic_result: string | null;
                    source: string | null;
                    e3_opened_at: string | null;
                    e3_clicked_at: string | null;
                    converted_to_starter_at: string | null;
                    core_activated_at: string | null;
                  }> | null;
                  error: { message: string } | null;
                }>;
              };
            };
          };
        };
      };
    };
  };
  const { data: branchCandidates, error: branchSelectError } =
    await branchClient
      .from("soap_opera_subscribers")
      .select(
        "id, email, diagnostic_result, source, e3_opened_at, e3_clicked_at, converted_to_starter_at, core_activated_at"
      )
      .eq("branch_fired", "none")
      .gte("emails_sent", 3)
      .lte("last_sent_at", branchCutoffIso)
      .not("source", "ilike", "funnelfixer_%")
      .limit(500);

  if (branchSelectError) {
    // Don't abort the whole cron – the spine pass already succeeded.
    console.error(
      "[soap-opera-cron] branch_select_failed",
      branchSelectError
    );
  }

  let branchAFired = 0;
  let branchBFired = 0;
  let branchSkipped = 0;
  let branchFailed = 0;
  for (const cand of branchCandidates ?? []) {
    const branch = selectBranch({
      e3_opened_at: cand.e3_opened_at,
      e3_clicked_at: cand.e3_clicked_at,
      converted: !!(cand.converted_to_starter_at || cand.core_activated_at),
    });
    if (!branch) {
      branchSkipped++;
      continue;
    }
    const row: BranchRow = {
      id: cand.id,
      email: cand.email,
      diagnostic_result: cand.diagnostic_result as DiagnosticResult | null,
      source: cand.source,
    };
    const result = await sendBranchAndMark(row, branch);
    if (result.ok) {
      if (branch === "branch_a") branchAFired++;
      else branchBFired++;
    } else {
      branchFailed++;
      console.error("[soap-opera-cron] branch_row_failed", {
        email: row.email,
        branch,
        error: result.error,
      });
    }
  }

  console.log("[soap-opera-cron] complete", {
    spine_processed: due?.length ?? 0,
    spine_sent: spineSent,
    spine_failed: spineFailed,
    branch_candidates: branchCandidates?.length ?? 0,
    branch_a_fired: branchAFired,
    branch_b_fired: branchBFired,
    branch_skipped: branchSkipped,
    branch_failed: branchFailed,
  });

  return NextResponse.json({
    ok: true,
    spine: {
      processed: due?.length ?? 0,
      sent: spineSent,
      failed: spineFailed,
    },
    branches: {
      candidates: branchCandidates?.length ?? 0,
      branch_a_fired: branchAFired,
      branch_b_fired: branchBFired,
      skipped: branchSkipped,
      failed: branchFailed,
    },
  });
}
