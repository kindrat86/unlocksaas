import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { dispatchNext } from "@/lib/teardown-courtesy/dispatch";

// Single Resend send per tick. Generous timeout in case Resend is slow.
export const maxDuration = 60;

/**
 * Weekday cron: GET /api/cron/teardown-courtesy
 *
 * Scheduled via app/vercel.json `crons` at `0 13 * * 1-5` (Mon-Fri 13:00
 * UTC = 9am ET / 2pm CET / 6:30pm IST — a reasonable hour across the
 * indie-SaaS founder timezone spread).
 *
 * Each tick sends EXACTLY ONE email to the oldest approved-and-not-yet-
 * sent row in teardown_courtesy_targets. Caps blast radius, protects the
 * sending domain reputation, keeps the cadence personal. At the catalog's
 * current size (33 funnel teardowns), the queue clears in ~7 weeks.
 *
 * Vercel injects an `Authorization: Bearer <CRON_SECRET>` header on every
 * cron-triggered request. We verify it before any DB or Resend touch.
 *
 * The response surface is JSON for monitoring / cron health checks. The
 * `outcome` field is the structured DispatchOutcome from
 * src/lib/teardown-courtesy/dispatch.ts.
 *
 * Pre-flight Brunson Hard-Rule check:
 *   - Cron does NOT auto-seed and does NOT auto-approve rows. Rows arrive
 *     in the queue via /api/teardown-courtesy/seed (operator-triggered)
 *     and only become eligible when the operator manually populates
 *     contact_email + sets status='approved' + sets approved_at. Without
 *     those three, the cron returns { kind: "no_eligible_row" } and the
 *     send domain stays silent.
 */
export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  const provided = req.headers.get("authorization");
  if (expected && provided !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const outcome = await dispatchNext(supabase);

  // Observability — match the soap-opera / seinfeld cron logging posture.
  // Vercel function logs are the operator's first stop when a tick looks
  // off. We log every outcome kind that isn't a clean send, including
  // skipped rows (operator forgot to fill a greeting) and Resend failures.
  if (outcome.kind === "send_failed") {
    console.error("[teardown-courtesy-cron] send_failed", {
      target_id: outcome.target_id,
      error: outcome.error,
    });
  } else if (outcome.kind === "skipped") {
    console.warn("[teardown-courtesy-cron] skipped", {
      target_id: outcome.target_id,
      reason: outcome.reason,
    });
  } else if (outcome.kind === "sent") {
    console.info("[teardown-courtesy-cron] sent", {
      target_id: outcome.target_id,
      resend_id: outcome.resend_id,
    });
  }

  // Always 200 for cron success-reporting; the failure cases are described
  // in the outcome body. A 500 here would trigger Vercel cron retry which
  // is the wrong behavior – a Resend send error should NOT auto-retry
  // until the operator investigates.
  return NextResponse.json({ ok: true, outcome });
}
