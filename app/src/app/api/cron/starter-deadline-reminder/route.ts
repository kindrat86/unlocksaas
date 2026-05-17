import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendStarterReminderEmail } from "@/lib/results-in-advance/reminder-email";
import { withCronRunHistory } from "@/lib/cron/run-history";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

/**
 * Daily cron: GET /api/cron/starter-deadline-reminder (19:00 UTC).
 *
 * Brunson DotCom Secrets Secret #12, Beat 6 ("the result is time-bound").
 * Migration: supabase/migrations/20260518000005_starter_completion_deadline.sql
 * Spec: strategy/results-in-advance.md beat 6.
 *
 * Selection criteria — every Starter buyer where ALL of:
 *   - starter_completion_deadline_at IS NOT NULL  (deadline set at purchase)
 *   - starter_completed_at           IS NULL      (still pending)
 *   - starter_completion_reminder_sent_at IS NULL (not yet reminded)
 *   - tier != 'core'                              (didn't upgrade)
 *   - starter_completion_deadline_at > now()      (window not yet closed)
 *   - starter_completion_deadline_at <= now() + interval '24 hours'
 *     (inside the 24-hour-before-close band)
 *
 * Sends one Reluctant-Hero reminder email per qualifying row. Marks
 * starter_completion_reminder_sent_at = now() on success. Never sends a
 * second reminder — Brunson rule "stop chasing the moment they buy or the
 * moment they finish."
 *
 * Per the staggered cron schedule in app/vercel.json: 19:00 UTC slot, after
 * cart-recovery (17:00) and challenge (18:00). No collision with founding
 * pre-launch (16:00) which uses a separate `founding_waitlist` cohort.
 */
export async function GET(req: NextRequest) {
  return withCronRunHistory(
    req,
    "/api/cron/starter-deadline-reminder",
    async () => {
      const supabase = createAdminClient();
      const nowIso = new Date().toISOString();
      const cutoffIso = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      // Cast: new columns not yet in generated database.types.ts at the time
      // of this PR. Pattern matches cart-recovery cron + challenge cron.
      const { data: due, error } = await (
        supabase as unknown as { from: (t: string) => any }
      )
        .from("profiles")
        .select(
          "id, email, starter_completion_deadline_at, starter_purchased_at, tier",
        )
        .not("starter_completion_deadline_at", "is", null)
        .is("starter_completed_at", null)
        .is("starter_completion_reminder_sent_at", null)
        .neq("tier", "core")
        .gt("starter_completion_deadline_at", nowIso)
        .lte("starter_completion_deadline_at", cutoffIso)
        .limit(500);

      if (error) {
        console.error("[ria-reminder-cron] select_failed", error);
        throw new Error(`select_failed: ${error.message}`);
      }

      if (!due || due.length === 0) {
        return { processed: 0, sent: 0, failed: 0 };
      }

      let sent = 0;
      let failed = 0;

      for (const row of due as Array<{
        id: string;
        email: string;
        starter_completion_deadline_at: string;
        starter_purchased_at: string | null;
        tier: string;
      }>) {
        const deadlineMs = new Date(row.starter_completion_deadline_at).getTime();
        const nowMs = Date.now();
        const hoursRemaining = Math.max(
          1,
          Math.floor((deadlineMs - nowMs) / (60 * 60 * 1000)),
        );

        const ok = await sendStarterReminderEmail({
          to: row.email,
          firstName: null,
          hoursRemaining,
        });

        if (!ok) {
          failed++;
          console.error("[ria-reminder-cron] send_failed", {
            email: row.email,
            profileId: row.id,
          });
          continue;
        }

        const { error: stampErr } = await (
          supabase as unknown as { from: (t: string) => any }
        )
          .from("profiles")
          .update({ starter_completion_reminder_sent_at: nowIso })
          .eq("id", row.id);

        if (stampErr) {
          // Email sent but stamp failed — surface so the next tick retries
          // (Brunson rule: forward motion logged honestly, not papered over).
          console.error("[ria-reminder-cron] stamp_failed_after_send", {
            email: row.email,
            profileId: row.id,
            message: stampErr.message,
          });
          failed++;
          continue;
        }

        sent++;
      }

      console.log("[ria-reminder-cron] complete", {
        processed: due.length,
        sent,
        failed,
      });

      return {
        processed: due.length,
        sent,
        failed,
      };
    },
  );
}
