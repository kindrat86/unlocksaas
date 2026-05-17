import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getResend, FROM_ADDRESS, REPLY_TO } from "@/lib/resend";
import { runFridayCall } from "@/lib/audibles/friday-call";
import { withCronRunHistory } from "@/lib/cron/run-history";

export const runtime = "nodejs";
// The Friday Call does one view read + at most one Resend send. Plenty of
// headroom on the 300s platform default; we keep it explicit to match the
// other cron routes' style.
export const maxDuration = 60;
export const dynamic = "force-dynamic";

/**
 * Weekly cron: GET /api/cron/friday-audible-call.
 *
 * Schedule: Fridays at 14:00 UTC (10:00 ET) — the canonical Friday-morning
 * founder slot named in strategy/funnel-audibles.md Closing.
 *
 * Closes DotCom Secrets Secret #28 (Funnel Audibles) from 90 → 100:
 *   - 90 was the cap for "playbook pre-staged, awaiting a Friday Call to
 *     actually fire."
 *   - The cron makes the call fire every Friday regardless of founder state.
 *   - public.friday_audible_calls records every read so the discipline is
 *     auditable, not just documented.
 *
 * Behaviour:
 *   1. CRON_SECRET auth + cron_run_history bookkeeping via withCronRunHistory.
 *   2. Read public.funnel_audibles__weekly_top_of_funnel (single row).
 *   3. Compute the verdict (pre_launch_no_data / green / red / inverted /
 *      cron_error) against the Trigger Matrix.
 *   4. Send a plain-text email to maryan@unlocksaas.com via Resend with the
 *      snapshot, the verdict, and (when applicable) the recommended audible.
 *   5. Insert an append-only row into public.friday_audible_calls.
 *
 * Pre-traffic ("pre_launch_no_data"), the call still fires and still emails.
 * That's the point — the ritual fires whether there's data to read or not.
 *
 * Spec: strategy/funnel-audibles.md Part 4 (Trigger Matrix) + Part 5 (Cadence)
 *       + Closing (the Call itself).
 */
export async function GET(req: NextRequest) {
  return withCronRunHistory(req, "/api/cron/friday-audible-call", async () => {
    console.info("[friday-call] tick_start", {
      path: "/api/cron/friday-audible-call",
      from_address: FROM_ADDRESS,
    });

    const supabase = createAdminClient();
    const resend = getResend();

    const result = await runFridayCall(supabase, {
      source: "cron",
      sendEmail: true,
      resendSend: async ({ from, to, replyTo, subject, text, html }) => {
        // Resend's TS client takes `replyTo` (camelCase) on send.
        const { data, error } = await resend.emails.send({
          from,
          to,
          replyTo,
          subject,
          text,
          html,
        });
        if (error) {
          console.error("[friday-call] resend_error", {
            to,
            error: error.message ?? "send_failed",
          });
          return { id: null, error: error.message ?? "send_failed" };
        }
        return { id: data?.id ?? null, error: null };
      },
    });

    // The cron observability shape needs processed/sent/failed. Map the
    // Friday Call verdict onto it: processed=1 (one read), sent=1 if the
    // email went out, failed=1 if status='cron_error'.
    const sent = result.emailMessageId ? 1 : 0;
    const failed = result.verdict.status === "cron_error" ? 1 : 0;

    console.info("[friday-call] tick_done", {
      status: result.verdict.status,
      trigger_matrix_row: result.verdict.triggerMatrixRow,
      audible_recommended: result.verdict.audibleRecommended,
      call_row_id: result.callRowId,
      email_sent: sent === 1,
      email_message_id: result.emailMessageId,
    });

    return {
      processed: 1,
      sent,
      failed,
      extra: {
        status: result.verdict.status,
        worst_metric_key: result.verdict.worstMetricKey,
        trigger_matrix_row: result.verdict.triggerMatrixRow,
        audible_recommended: result.verdict.audibleRecommended,
        call_row_id: result.callRowId,
        from_address: FROM_ADDRESS,
        reply_to: REPLY_TO,
      },
    };
  });
}
