/**
 * Shared subscribe-to-Soap-Opera helper.
 *
 * Used by:
 *   - POST /api/soap-opera/subscribe (the standalone subscribe endpoint)
 *   - POST /api/diagnostic (auto-subscribe after a Free Diagnostic submission)
 *
 * Responsibilities:
 *   1. Upsert into soap_opera_subscribers (idempotent on email).
 *   2. Send E1 (Day 0) via the dispatcher.
 *   3. Advance emails_sent → 1 and set next_send_at = now + 48h.
 *
 * Schema reference: supabase/migrations/20260516224206_0003_soap_opera_and_ab_tests.sql
 *   + 0007 (rename current_day → emails_sent)
 *   + 0020 (3-spine + 2-branch: e3_opened_at / e3_clicked_at /
 *           branch_fired / branch_fired_at).
 * Cadence ref: strategy/decisions/sos-3-spine-2-branch.md (day 0 / 2 / 4).
 *
 * Idempotency: repeat call with the same email resets the sequence to Day 0.
 * Intentional — most repeats are users re-taking the diagnostic with a new URL.
 */

import { createAdminClient } from "@/lib/supabase/server";
import { sendNextAndAdvance } from "./dispatch";
import type { DiagnosticResult } from "./emails";
import {
  verifyDeliverableEmail,
  isPreVerifiedSource,
} from "@/lib/email-verification";
import {
  newConfirmationToken,
  sendConfirmationEmail,
} from "@/lib/double-opt-in";

export const ALLOWED_DIAGNOSES: DiagnosticResult[] = [
  "wrong_person",
  "weak_offer",
  "weak_belief",
];

export const ALLOWED_IDENTITY_VARIANTS = [
  "verified_builder",
  "paid_builder",
] as const;
export type IdentityVariant = (typeof ALLOWED_IDENTITY_VARIANTS)[number];

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface SubscribeInput {
  email: string;
  source: string;
  diagnostic_result: DiagnosticResult | null;
  identity_variant: IdentityVariant | null;
}

export type SubscribeOutcome =
  | { ok: true; id: string; day_0_send: "ok" }
  // pending_confirmation: row inserted, confirmation email sent, awaiting click.
  // Day 0 fires only after the user clicks the confirm link.
  | {
      ok: true;
      id: string;
      day_0_send: "deferred_pending_confirmation";
    }
  | { ok: false; reason: "invalid_email" }
  | { ok: false; reason: "undeliverable_email"; detail?: string }
  | { ok: false; reason: "db_upsert_failed"; detail?: string }
  | { ok: false; id: string; reason: "day_0_send_failed"; detail?: string }
  | {
      ok: false;
      id: string;
      reason: "confirmation_send_failed";
      detail?: string;
    };

/**
 * Upsert the subscriber and dispatch Day 0. Returns a discriminated outcome
 * so callers can render the right HTTP status.
 */
export async function subscribeToSoapOpera(
  input: SubscribeInput
): Promise<SubscribeOutcome> {
  const preVerified = isPreVerifiedSource(input.source);

  // Syntax + MX (skipped for Google OAuth: address already verified by Google).
  let emailRaw: string;
  if (preVerified) {
    emailRaw = input.email.trim().toLowerCase();
    if (!emailRaw || !EMAIL_RE.test(emailRaw)) {
      return { ok: false, reason: "invalid_email" };
    }
  } else {
    const check = await verifyDeliverableEmail(input.email);
    if (!check.ok) {
      if (check.reason === "invalid_syntax") {
        return { ok: false, reason: "invalid_email" };
      }
      return {
        ok: false,
        reason: "undeliverable_email",
        detail: check.reason,
      };
    }
    emailRaw = check.normalized;
  }

  const supabase = createAdminClient();
  const nowIso = new Date().toISOString();

  // Branching: Google OAuth → active immediately; email path → pending_confirmation.
  const initialStatus = preVerified ? "active" : "pending_confirmation";
  const confirmationToken = preVerified ? null : newConfirmationToken();

  // `as never` cast: confirmation_token / confirmation_sent_at land via
  // migration 20260518000020 but the generated database.types.ts hasn't been
  // regenerated yet. Same pattern as challenge/subscribe.ts.
  const { data: rowTyped, error: upsertError } = await supabase
    .from("soap_opera_subscribers")
    .upsert(
      {
        email: emailRaw,
        source: input.source,
        diagnostic_result: input.diagnostic_result,
        identity_variant: input.identity_variant,
        status: initialStatus,
        emails_sent: 0,
        subscribed_at: nowIso,
        last_sent_at: null,
        next_send_at: null,
        unsubscribed_at: null,
        confirmation_token: confirmationToken,
        confirmation_sent_at: preVerified ? null : nowIso,
      } as never,
      { onConflict: "email" }
    )
    .select("id, email, diagnostic_result, emails_sent")
    .single();

  if (upsertError || !rowTyped) {
    console.error("[soap-opera-subscribe] upsert_failed", {
      email: emailRaw,
      source: input.source,
      error: upsertError?.message,
    });
    return {
      ok: false,
      reason: "db_upsert_failed",
      detail: upsertError?.message,
    };
  }

  const row = rowTyped as unknown as {
    id: string;
    email: string;
    diagnostic_result: string | null;
    emails_sent: number;
  };

  // Double opt-in branch: send confirmation email, do NOT send Day 0 yet.
  if (!preVerified && confirmationToken) {
    const sendResult = await sendConfirmationEmail({
      list: "soap_opera",
      email: row.email,
      token: confirmationToken,
    });
    if (!sendResult.ok) {
      return {
        ok: false,
        id: row.id,
        reason: "confirmation_send_failed",
        detail: sendResult.error,
      };
    }
    console.log("[soap-opera-subscribe] pending_confirmation", {
      email: emailRaw,
      source: input.source,
    });
    return {
      ok: true,
      id: row.id,
      day_0_send: "deferred_pending_confirmation",
    };
  }

  // Pre-verified (Google OAuth) branch: fire Day 0 immediately.
  const dispatch = await sendNextAndAdvance({
    id: row.id,
    email: row.email,
    diagnostic_result: row.diagnostic_result as DiagnosticResult | null,
    emails_sent: row.emails_sent,
    source: input.source,
  });

  if (!dispatch.ok) {
    return {
      ok: false,
      id: row.id,
      reason: "day_0_send_failed",
      detail: dispatch.error,
    };
  }

  console.log("[soap-opera-subscribe] ok", {
    email: emailRaw,
    source: input.source,
    diagnostic_result: input.diagnostic_result,
    identity_variant: input.identity_variant,
  });

  return { ok: true, id: row.id, day_0_send: "ok" };
}

/**
 * Narrowing helpers used by both the standalone route and the diagnostic
 * route to coerce client-supplied strings to known enum values.
 */
export function coerceDiagnosis(value: unknown): DiagnosticResult | null {
  if (typeof value !== "string") return null;
  return (ALLOWED_DIAGNOSES as string[]).includes(value)
    ? (value as DiagnosticResult)
    : null;
}

export function coerceIdentityVariant(value: unknown): IdentityVariant | null {
  if (typeof value !== "string") return null;
  return (ALLOWED_IDENTITY_VARIANTS as readonly string[]).includes(value)
    ? (value as IdentityVariant)
    : null;
}
