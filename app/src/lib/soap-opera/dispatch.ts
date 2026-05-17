import { createAdminClient } from "@/lib/supabase/server";
import { getResend, FROM_ADDRESS, REPLY_TO } from "@/lib/resend";
import {
  renderEmail,
  SEQUENCE_LENGTH,
  type DiagnosticResult,
  type OpenerBucket,
} from "./emails";
import { buildUnsubscribeUrl } from "./tokens";

/**
 * Row shape that the dispatcher needs. Mirrors a subset of
 * soap_opera_subscribers columns.
 *
 * emails_sent semantics (matches live schema after migration 0007):
 *   0 = no email sent yet (Day 0 / Email 1 still pending)
 *   1 = Email 1 has been sent; Email 2 is next
 *   ...
 *   5 = all 5 emails sent; sequence complete
 *
 * bucket: Brunson Survey Funnel segment from @/lib/diagnostic. Drives the
 * Day-0 opener (DCS Secret 15). Optional — pre-survey legacy rows and
 * non-diagnostic intakes (funnel_hub, parables) ship as null and fall through
 * to the diagnosis-label opener or the neutral opener.
 */
export interface DueRow {
  id: string;
  email: string;
  diagnostic_result: DiagnosticResult | null;
  bucket: OpenerBucket | null;
  emails_sent: number;
}

export interface SendResult {
  email: string;
  index: number;
  ok: boolean;
  error?: string;
}

/** 24-hour cadence between sends, locked from workbook 04 §5. */
const DAY_INTERVAL_MS = 24 * 60 * 60 * 1000;

function baseUrl(): string {
  // Prefer the canonical app URL (always set in production env). Fall back to
  // VERCEL_URL (set on every preview deploy) so previews send links that
  // resolve to the right host.
  const explicit = process.env.NEXT_PUBLIC_APP_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "https://unlocksaas.com";
}

/**
 * Send the next email in the sequence for one subscriber and advance their
 * counter. Returns ok=true on success, ok=false on either Resend failure or
 * DB write failure. On failure, emails_sent is NOT incremented so the next
 * cron tick retries the same email.
 */
export async function sendNextAndAdvance(row: DueRow): Promise<SendResult> {
  const index = row.emails_sent; // zero-based; if 0 we send Email 1.
  if (index >= SEQUENCE_LENGTH) {
    return { email: row.email, index, ok: false, error: "sequence_exhausted" };
  }

  const supabase = createAdminClient();
  const rendered = renderEmail(index, {
    email: row.email,
    diagnosis: row.diagnostic_result,
    bucket: row.bucket,
    baseUrl: baseUrl(),
  });
  const unsubscribeUrl = buildUnsubscribeUrl(row.email, baseUrl());

  let sendError: string | undefined;
  try {
    const result = await getResend().emails.send({
      from: FROM_ADDRESS,
      to: row.email,
      replyTo: REPLY_TO,
      subject: rendered.subject,
      text: rendered.text,
      html: rendered.html,
      // RFC 8058 one-click unsubscribe — keeps Gmail/Yahoo happy on bulk send.
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
      tags: [
        { name: "sequence", value: "soap_opera" },
        { name: "email_index", value: String(index) },
        {
          name: "diagnosis",
          value: row.diagnostic_result ?? "none",
        },
        // Resend tag for per-bucket open/click slicing in the dashboard. The
        // diagnostic Bridge Page label, in the operator's hands at send time.
        { name: "bucket", value: row.bucket ?? "none" },
      ],
    });
    if (result.error) {
      sendError = `${result.error.name}: ${result.error.message}`;
    }
  } catch (err) {
    sendError = err instanceof Error ? err.message : "unknown_send_error";
  }

  if (sendError) {
    // Logged at the cron call site too, but keep one here in case the
    // dispatcher is invoked from /subscribe.
    console.error("[soap-opera-dispatch] send_failed", {
      id: row.id,
      email: row.email,
      index,
      error: sendError,
    });
    return { email: row.email, index, ok: false, error: sendError };
  }

  // Advance the counter. If this was the final email, flip status to
  // 'complete' (matches the check constraint set in migration 0007) and
  // clear next_send_at. Otherwise schedule the next send 24h from now.
  const nowMs = Date.now();
  const newCount = index + 1;
  const isFinal = newCount >= SEQUENCE_LENGTH;

  const update: {
    emails_sent: number;
    last_sent_at: string;
    next_send_at: string | null;
    status?: "complete";
  } = {
    emails_sent: newCount,
    last_sent_at: new Date(nowMs).toISOString(),
    next_send_at: isFinal ? null : new Date(nowMs + DAY_INTERVAL_MS).toISOString(),
  };
  if (isFinal) update.status = "complete";

  const { error: dbError } = await supabase
    .from("soap_opera_subscribers")
    .update(update)
    .eq("id", row.id);

  if (dbError) {
    console.error("[soap-opera-dispatch] db_update_failed", {
      id: row.id,
      email: row.email,
      index,
      error: dbError.message,
    });
    return { email: row.email, index, ok: false, error: `db_${dbError.message}` };
  }

  return { email: row.email, index, ok: true };
}
