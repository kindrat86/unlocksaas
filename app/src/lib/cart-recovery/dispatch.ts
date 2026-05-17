import { createAdminClient } from "@/lib/supabase/server";
import { getResend, FROM_ADDRESS, REPLY_TO } from "@/lib/resend";
import {
  renderCartRecoveryEmail,
  CART_RECOVERY_SEQUENCE_LENGTH,
  CART_RECOVERY_CADENCE_DAYS,
  type CartPriceType,
  type DiagnosticLabel,
} from "./emails";

/**
 * Cart Abandonment Recovery dispatcher.
 *
 * Mirrors lib/soap-opera/dispatch.ts. Sends the next email in the 3-email
 * recovery sequence (Day 0, Day 2, Day 7) and advances the counter. On
 * failure, emails_sent is NOT incremented so the next cron tick retries.
 *
 * Recovery short-circuit: before sending, the dispatcher re-reads the row's
 * `status` column. If it has flipped to `recovered` between cron tick and
 * this call (a fresh checkout.session.completed landed for this email), the
 * send is skipped and the row is left as `recovered`. This is the
 * "stop chasing after they buy" rule from strategy/follow-up-funnels.md
 * Part 6.
 */

export interface CartRecoveryDueRow {
  id: string;
  email: string;
  price_type: CartPriceType;
  diagnostic_label: DiagnosticLabel | null;
  emails_sent: number;
  created_at: string;
}

export interface CartRecoverySendResult {
  email: string;
  index: number;
  ok: boolean;
  skipped?: "recovered" | "unsubscribed";
  error?: string;
}

function baseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "https://unlocksaas.com";
}

/**
 * Send the next email in the recovery sequence for one subscriber and advance
 * their counter. Returns ok=true on success.
 */
export async function sendNextCartRecoveryAndAdvance(
  row: CartRecoveryDueRow,
): Promise<CartRecoverySendResult> {
  const index = row.emails_sent; // zero-based; if 0 we send Email 1.
  if (index >= CART_RECOVERY_SEQUENCE_LENGTH) {
    return {
      email: row.email,
      index,
      ok: false,
      error: "cart_recovery_sequence_exhausted",
    };
  }

  const supabase = createAdminClient();

  // Recovery short-circuit guard. Re-read status in case a checkout.session.
  // completed landed between cron select and this call.
  const { data: fresh, error: freshErr } = await (
    supabase as unknown as { from: (t: string) => any }
  )
    .from("cart_abandonment_subscribers")
    .select("status")
    .eq("id", row.id)
    .single();
  if (freshErr) {
    return {
      email: row.email,
      index,
      ok: false,
      error: `db_fresh_${freshErr.message}`,
    };
  }
  if (fresh?.status === "recovered") {
    return {
      email: row.email,
      index,
      ok: true,
      skipped: "recovered",
    };
  }
  if (fresh?.status === "unsubscribed") {
    return {
      email: row.email,
      index,
      ok: true,
      skipped: "unsubscribed",
    };
  }

  const rendered = renderCartRecoveryEmail(index, {
    email: row.email,
    priceType: row.price_type,
    diagnosticLabel: row.diagnostic_label,
    baseUrl: baseUrl(),
  });

  let sendError: string | undefined;
  try {
    const result = await getResend().emails.send({
      from: FROM_ADDRESS,
      to: row.email,
      replyTo: REPLY_TO,
      subject: rendered.subject,
      text: rendered.text,
      html: rendered.html,
      headers: {
        // Reuse the canonical HMAC unsubscribe URL via the rendered footer.
        // No need to set List-Unsubscribe header pair here separately —
        // setting them is a hygiene win at scale, so we mirror the soap-opera
        // pattern.
        "List-Unsubscribe": `<${baseUrl()}/api/unsubscribe?email=${encodeURIComponent(row.email)}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
      tags: [
        { name: "sequence", value: "cart_recovery" },
        { name: "email_index", value: String(index) },
        { name: "price_type", value: row.price_type },
        {
          name: "diagnostic_label",
          value: row.diagnostic_label ?? "none",
        },
      ],
    });
    if (result.error) {
      sendError = `${result.error.name}: ${result.error.message}`;
    }
  } catch (err) {
    sendError = err instanceof Error ? err.message : "unknown_send_error";
  }

  if (sendError) {
    console.error("[cart-recovery-dispatch] send_failed", {
      id: row.id,
      email: row.email,
      index,
      error: sendError,
    });
    await (supabase as unknown as { from: (t: string) => any })
      .from("cart_abandonment_subscribers")
      .update({ last_error: sendError })
      .eq("id", row.id);
    return { email: row.email, index, ok: false, error: sendError };
  }

  // Advance the counter. After Email 3 (index 2 → newCount 3), flip status.
  const nowMs = Date.now();
  const newCount = index + 1;
  const isFinal = newCount >= CART_RECOVERY_SEQUENCE_LENGTH;

  // CART_RECOVERY_CADENCE_DAYS[newCount] = days from enrolment to NEXT email.
  // After sending Email 1 (index 0, newCount 1), next email is Day 2 (entry [1]).
  // After sending Email 2 (index 1, newCount 2), next email is Day 7 (entry [2]).
  let nextSendAt: string | null = null;
  if (!isFinal) {
    const enrolledAtMs = new Date(row.created_at).getTime();
    const gapDays = CART_RECOVERY_CADENCE_DAYS[newCount] ?? 7;
    nextSendAt = new Date(
      enrolledAtMs + gapDays * 24 * 60 * 60 * 1000,
    ).toISOString();
  }

  const update: {
    emails_sent: number;
    last_sent_at: string;
    next_send_at: string | null;
    last_error: null;
    status?: "complete";
  } = {
    emails_sent: newCount,
    last_sent_at: new Date(nowMs).toISOString(),
    next_send_at: nextSendAt,
    last_error: null,
  };
  if (isFinal) update.status = "complete";

  const { error: dbError } = await (
    supabase as unknown as { from: (t: string) => any }
  )
    .from("cart_abandonment_subscribers")
    .update(update)
    .eq("id", row.id);

  if (dbError) {
    console.error("[cart-recovery-dispatch] db_update_failed", {
      id: row.id,
      email: row.email,
      index,
      error: dbError.message,
    });
    return {
      email: row.email,
      index,
      ok: false,
      error: `db_${dbError.message}`,
    };
  }

  return { email: row.email, index, ok: true };
}
