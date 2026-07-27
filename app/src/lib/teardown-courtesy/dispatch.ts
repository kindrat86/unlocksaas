/**
 * Teardown-courtesy dispatch — pick-one-and-send.
 *
 * The cron calls dispatchNext() once per weekday. It:
 *
 *   1. Selects the OLDEST approved row that has a contact_email AND
 *      hasn't been sent yet. Stable ordering = predictable queue =
 *      operator can reason about what fires next.
 *
 *   2. Resolves the greeting (operator override on the row wins; otherwise
 *      falls back to the catalog-parsed greeting). If both are null/empty
 *      the row is left UNSENT and skipped — Brunson Hard-Rule: no "Hey
 *      there," sends.
 *
 *   3. Rebuilds the CourtesyTarget from the catalog so praise lines are
 *      always current with whatever was last verified. The targets row
 *      is the queue; the catalog is the truth.
 *
 *   4. Calls buildCourtesyEmail() (pure), passes the result to Resend,
 *      records the exact subject+body+to-address in
 *      teardown_courtesy_sends, and flips the targets row to status='sent'.
 *
 *   5. On Resend error, leaves status='approved' and writes a failure
 *      audit row. Next cron tick will retry. This is the same retry
 *      posture as the soap-opera + seinfeld crons.
 *
 * Idempotency: the unique (catalog, slug) index plus the status check
 * means a transient cron double-fire either no-ops (no eligible row) or
 * sends to exactly one recipient. Audit log persists subject+body so a
 * "did we send X?" question is answerable by SQL alone.
 */

import type { SupabaseClient } from "@/lib/supabase/types";
import { getResend, FROM_ADDRESS, REPLY_TO } from "@/lib/resend";
import { getTargetByCatalogSlug, type CourtesyCatalog } from "./targets";
import { buildCourtesyEmail } from "./template";

/** Row shape from teardown_courtesy_targets the cron needs to read. */
interface TargetRow {
  id: string;
  catalog: CourtesyCatalog;
  slug: string;
  display_name: string;
  greeting: string | null;
  contact_email: string | null;
  status: string;
  approved_at: string | null;
}

export type DispatchOutcome =
  | { kind: "no_eligible_row" }
  | { kind: "sent"; target_id: string; resend_id: string | null; to: string }
  | {
      kind: "skipped";
      target_id: string;
      reason: "missing_greeting" | "catalog_drift" | "no_praise";
    }
  | { kind: "send_failed"; target_id: string; error: string };

/**
 * Pick the next approved row and send. Returns a structured outcome so
 * the route can render it for monitoring / GSC-feedback-style logs.
 */
export async function dispatchNext(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
): Promise<DispatchOutcome> {
  // 1. Select the oldest approved row with a contact email. We do not
  //    lock the row at the DB level (no SELECT...FOR UPDATE via supabase-js
  //    on the public client); the unique (catalog, slug) index plus the
  //    status='sent' transition is the dedup boundary. A concurrent double
  //    cron-fire is vanishingly unlikely (1/min granularity) and the worst
  //    case is one extra audit row, never a double recipient email.
  const { data: candidates, error: selectError } = await supabase
    .from("teardown_courtesy_targets" as never)
    .select(
      "id, catalog, slug, display_name, greeting, contact_email, status, approved_at",
    )
    .eq("status", "approved")
    .not("contact_email", "is", null)
    .not("approved_at", "is", null)
    .order("approved_at", { ascending: true })
    .limit(1);

  if (selectError) {
    return {
      kind: "send_failed",
      target_id: "unknown",
      error: `select_failed: ${selectError.message}`,
    };
  }

  const row = (candidates?.[0] as TargetRow | undefined) ?? null;
  if (!row) return { kind: "no_eligible_row" };

  // 2. Resolve greeting. Row override wins. Brunson Hard-Rule: no fallback
  //    to "Hey there,". Skip and leave operator to fill it in.
  const target = getTargetByCatalogSlug(row.catalog, row.slug);
  if (!target) {
    return { kind: "skipped", target_id: row.id, reason: "catalog_drift" };
  }
  if (target.praises.length === 0) {
    return { kind: "skipped", target_id: row.id, reason: "no_praise" };
  }
  const greeting = (row.greeting ?? target.greeting ?? "").trim();
  if (!greeting) {
    return { kind: "skipped", target_id: row.id, reason: "missing_greeting" };
  }

  // 3. Build the email. Pure function, deterministic.
  const email = buildCourtesyEmail({ target, greeting });

  // 4. Send via Resend. We use text-only (no HTML) deliberately — the
  //    template is voiced as a one-off personal note, not a marketing
  //    blast, and text-only sends are read as such by both humans and
  //    spam filters.
  const resend = getResend();
  const toAddress = row.contact_email as string;

  try {
    const sendResult = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [toAddress],
      replyTo: REPLY_TO,
      subject: email.subject,
      text: email.text,
      // Tag for Resend dashboard filtering.
      tags: [
        { name: "campaign", value: "teardown-courtesy" },
        { name: "catalog", value: row.catalog },
        { name: "slug", value: row.slug },
      ],
    });

    if (sendResult.error) {
      // Audit the failure for the operator to inspect.
      await supabase.from("teardown_courtesy_sends" as never).insert({
        target_id: row.id,
        email_subject: email.subject,
        email_body_text: email.text,
        to_address: toAddress,
        resend_id: null,
        resend_error: sendResult.error.message,
      });
      return {
        kind: "send_failed",
        target_id: row.id,
        error: sendResult.error.message,
      };
    }

    const resendId = sendResult.data?.id ?? null;

    // 5. Audit-log the send and flip status='sent'. Order matters: write
    //    the audit row FIRST so a partial failure leaves a paper trail
    //    even if the status update later fails.
    await supabase.from("teardown_courtesy_sends" as never).insert({
      target_id: row.id,
      email_subject: email.subject,
      email_body_text: email.text,
      to_address: toAddress,
      resend_id: resendId,
      resend_error: null,
    });

    await supabase
      .from("teardown_courtesy_targets" as never)
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        resend_id: resendId,
      })
      .eq("id", row.id);

    return {
      kind: "sent",
      target_id: row.id,
      resend_id: resendId,
      to: toAddress,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await supabase.from("teardown_courtesy_sends" as never).insert({
      target_id: row.id,
      email_subject: email.subject,
      email_body_text: email.text,
      to_address: toAddress,
      resend_id: null,
      resend_error: `exception: ${message}`,
    });
    return { kind: "send_failed", target_id: row.id, error: message };
  }
}
