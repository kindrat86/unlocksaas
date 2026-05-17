/**
 * Seinfeld stop-on-conversion.
 *
 * Brunson hard rule (workbook 08 §6, strategy/follow-up-funnels.md Part 6):
 * the moment a subscriber buys the $49 Machine, the nurture cadence stops.
 * Continuing to email a paying customer with "if you ever want to start the
 * Machine for $1, the door is here" is the cheapest way to look like the
 * funnel sees them as a lead, not a customer.
 *
 * Called from the Stripe webhook on `customer.subscription.created` — the
 * canonical "they just became a paying Core customer" signal. The companion
 * pattern is `maybeShortCircuitRecovery` in lib/cart-recovery/subscribe.ts.
 *
 * Idempotent. Multiple invocations only flip the row(s) once because the
 * UPDATE is guarded by `status='active'`.
 *
 * Why status='paused' and not 'unsubscribed':
 *   - Unsubscribe carries CAN-SPAM / GDPR / RFC 8058 user-intent semantics.
 *     A purchase is NOT an unsubscribe request — the user did not signal
 *     "stop emailing me," they signaled "I bought."
 *   - Paused-on-purchase leaves the door open for a future Win-Back move
 *     (workbook 09 §3.6 cadence #6, currently deferred). If the customer
 *     cancels their Core sub, the operator can re-activate this row by
 *     flipping status back to 'active' without re-asking permission.
 *   - The cron's WHERE clause already filters `status='active'`, so 'paused'
 *     rows are excluded from future ticks without any new code.
 */

import { createAdminClient } from "@/lib/supabase/server";

export interface PauseResult {
  /** True if at least one active row was flipped to paused. */
  paused: boolean;
  /** Number of rows updated. > 1 means duplicate enrolments (rare). */
  count: number;
  /** Set when Supabase returned an error. Caller logs but never throws. */
  error?: string;
}

/**
 * Flip every active Seinfeld row for this email to status='paused'.
 *
 * `reason` is recorded in the server log only — the schema does not carry a
 * pause_reason column today (and adding one would force a migration for no
 * runtime gain). The `updated_at` trigger on the table records WHEN; the log
 * line records WHY. If/when telemetry needs the reason on the row, a follow-
 * up migration can add `paused_reason text` without breaking this signature.
 */
export async function maybeShortCircuitSeinfeld(
  email: string,
  reason: string,
): Promise<PauseResult> {
  const supabase = createAdminClient();
  const lower = email.trim().toLowerCase();

  const { data, error } = await supabase
    .from("seinfeld_subscribers")
    .update({ status: "paused" })
    .eq("status", "active")
    .ilike("email", lower)
    .select("id");

  if (error) {
    console.warn("[seinfeld] short_circuit_skipped", {
      email: lower,
      reason: error.message,
    });
    return { paused: false, count: 0, error: error.message };
  }

  const count = data?.length ?? 0;
  if (count > 0) {
    console.log("[seinfeld] paused_on_conversion", {
      email: lower,
      reason,
      count,
    });
  }
  return { paused: count > 0, count };
}
