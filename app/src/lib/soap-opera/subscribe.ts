/**
 * Shared subscribe-to-Soap-Opera helper.
 *
 * Used by:
 *   - POST /api/soap-opera/subscribe (the standalone subscribe endpoint)
 *   - POST /api/diagnostic (auto-subscribe after a Free Diagnostic submission)
 *
 * Responsibilities:
 *   1. Upsert into soap_opera_subscribers (idempotent on email).
 *   2. Send Email 1 (Day 0) via the dispatcher.
 *   3. Advance emails_sent → 1 and set next_send_at = now + 24h.
 *
 * Schema reference: supabase/migrations/20260516224206_0003_soap_opera_and_ab_tests.sql
 * + 0007 (rename current_day → emails_sent).
 *
 * Idempotency: repeat call with the same email resets the sequence to Day 0.
 * Intentional — most repeats are users re-taking the diagnostic with a new URL.
 */

import { createAdminClient } from "@/lib/supabase/server";
import { sendNextAndAdvance } from "./dispatch";
import type { DiagnosticResult, OpenerBucket } from "./emails";

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

export const ALLOWED_BUCKETS: OpenerBucket[] = [
  "customer_avoider",
  "stuck_builder",
  "tactic_shopper",
  "premature",
  "traction_but_stuck",
  "ready_to_scale",
];

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface SubscribeInput {
  email: string;
  source: string;
  diagnostic_result: DiagnosticResult | null;
  identity_variant: IdentityVariant | null;
  /**
   * Brunson Survey Funnel bucket (DCS Secret 15). Optional — defaults to null
   * for non-diagnostic intakes (funnel_hub, parables, starter_purchase). When
   * present, drives the Day-0 opener selection in dispatch → emails so the
   * inbox label matches the Bridge Page label the subscriber just saw.
   */
  bucket?: OpenerBucket | null;
}

export type SubscribeOutcome =
  | { ok: true; id: string; day_0_send: "ok" }
  | { ok: false; reason: "invalid_email" }
  | { ok: false; reason: "db_upsert_failed"; detail?: string }
  | { ok: false; id: string; reason: "day_0_send_failed"; detail?: string };

/**
 * Upsert the subscriber and dispatch Day 0. Returns a discriminated outcome
 * so callers can render the right HTTP status.
 */
export async function subscribeToSoapOpera(
  input: SubscribeInput
): Promise<SubscribeOutcome> {
  const emailRaw = input.email.trim().toLowerCase();
  if (!emailRaw || !EMAIL_RE.test(emailRaw)) {
    return { ok: false, reason: "invalid_email" };
  }

  const supabase = createAdminClient();
  const nowIso = new Date().toISOString();

  const { data: rowTyped, error: upsertError } = await supabase
    .from("soap_opera_subscribers")
    .upsert(
      {
        email: emailRaw,
        source: input.source,
        diagnostic_result: input.diagnostic_result,
        identity_variant: input.identity_variant,
        bucket: input.bucket ?? null,
        status: "active",
        emails_sent: 0,
        subscribed_at: nowIso,
        last_sent_at: null,
        next_send_at: null,
        unsubscribed_at: null,
      },
      { onConflict: "email" }
    )
    .select("id, email, diagnostic_result, bucket, emails_sent")
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
    bucket: string | null;
    emails_sent: number;
  };

  // Send Email 1 (Day 0). The dispatcher advances emails_sent → 1 and sets
  // next_send_at = now + 24h on success. On failure, emails_sent stays at 0
  // and the cron WILL NOT retry (cron filters emails_sent >= 1). The caller
  // can re-invoke subscribeToSoapOpera() to retry.
  const dispatch = await sendNextAndAdvance({
    id: row.id,
    email: row.email,
    diagnostic_result: row.diagnostic_result as DiagnosticResult | null,
    bucket: coerceBucket(row.bucket),
    emails_sent: row.emails_sent,
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

/**
 * Narrow an arbitrary value to a Survey Funnel bucket. Used by:
 *  - subscribe.ts post-upsert read-back (DB value → typed)
 *  - /api/soap-opera/subscribe optional body field
 * Returns null for unknown / missing buckets (legacy rows + non-diagnostic).
 */
export function coerceBucket(value: unknown): OpenerBucket | null {
  if (typeof value !== "string") return null;
  return (ALLOWED_BUCKETS as readonly string[]).includes(value)
    ? (value as OpenerBucket)
    : null;
}

// ────────────────────────────────────────────────────────────────────────────
// Post-purchase enrollment + conversion short-circuit.
//
// These two helpers close the integrity gap on the "Soap Opera IS the
// lossless Return Path" claim in strategy/decisions/seven-phases-coverage.md
// (the formal "no downsell" rationale that resolves DotCom Secrets #18).
//
// The webbed claim only holds if every $1 Starter buyer — including the
// cold homepage-direct buyer who skipped /diagnostic — actually lands in
// soap_opera_subscribers. The Stripe webhook is the canonical signal source
// (client-side navigation after OTO decline is unreliable: tab closes, ad
// blockers, history flushes). And it must NOT reset the clock for buyers
// who entered via /diagnostic — they're already mid-cadence.
// ────────────────────────────────────────────────────────────────────────────

export type StarterEnrollOutcome =
  | { ok: true; action: "subscribed"; id: string }
  | { ok: true; action: "already_subscribed"; status: string }
  | { ok: false; reason: "invalid_email" }
  | { ok: false; reason: "lookup_failed"; detail?: string }
  | { ok: false; reason: "subscribe_failed"; detail?: string };

/**
 * Subscribe a $1 Starter buyer to the Soap Opera, but ONLY if they aren't
 * already on it. Used by the Stripe webhook on checkout.session.completed
 * (mode=payment) so the SOS becomes the lossless Return Path for every
 * Starter buyer, regardless of entry surface.
 *
 * Idempotency contract (different from subscribeToSoapOpera, which resets):
 *   - row exists with status ∈ {active, paused, complete, bounced}:
 *     return action='already_subscribed' — DO NOT reset the clock, DO NOT
 *     re-send Day 0. The diagnostic-entry path already advanced this row.
 *   - row exists with status='unsubscribed': respect their no — do not
 *     re-subscribe a buyer who opted out.
 *   - row does not exist: enroll via subscribeToSoapOpera() — they get
 *     Day 0 immediately (the non-diagnostic Reluctant Hero parable arc).
 *
 * No-op on retry. Stripe-webhook idempotency guard (markEventProcessed) +
 * this check together ensure replay safety.
 */
export async function subscribeStarterBuyerToSoapOpera(input: {
  email: string;
  identity_variant: IdentityVariant | null;
}): Promise<StarterEnrollOutcome> {
  const emailRaw = input.email.trim().toLowerCase();
  if (!emailRaw || !EMAIL_RE.test(emailRaw)) {
    return { ok: false, reason: "invalid_email" };
  }

  const supabase = createAdminClient();

  const { data: existing, error: lookupError } = await supabase
    .from("soap_opera_subscribers")
    .select("id, status")
    .eq("email", emailRaw)
    .maybeSingle();

  if (lookupError) {
    console.warn("[soap-opera] starter_enroll_lookup_failed", {
      email: emailRaw,
      error: lookupError.message,
    });
    return { ok: false, reason: "lookup_failed", detail: lookupError.message };
  }

  if (existing) {
    console.log("[soap-opera] starter_enroll_skipped_existing", {
      email: emailRaw,
      status: existing.status,
    });
    return { ok: true, action: "already_subscribed", status: existing.status };
  }

  // Brand-new buyer who skipped /diagnostic. Enroll with source so the
  // funnel-audibles dashboard can split direct-buyer-source SOS performance
  // from diagnostic-source SOS performance.
  const outcome = await subscribeToSoapOpera({
    email: emailRaw,
    source: "starter_purchase",
    diagnostic_result: null,
    identity_variant: input.identity_variant,
  });

  if (!outcome.ok) {
    console.warn("[soap-opera] starter_enroll_subscribe_failed", {
      email: emailRaw,
      reason: outcome.reason,
    });
    return {
      ok: false,
      reason: "subscribe_failed",
      detail: "detail" in outcome ? outcome.detail : outcome.reason,
    };
  }

  return { ok: true, action: "subscribed", id: outcome.id };
}

export interface SoapOperaPauseResult {
  /** True if at least one active row was flipped to paused. */
  paused: boolean;
  /** Number of rows updated. > 1 means duplicate enrolments (rare). */
  count: number;
  /** Set when Supabase returned an error. Caller logs but never throws. */
  error?: string;
}

/**
 * Stop the Soap Opera the moment a subscriber upgrades to Core.
 *
 * Mirror of maybeShortCircuitSeinfeld (lib/seinfeld/conversion.ts) applied to
 * the SOS table. Same paused-not-unsubscribed rationale: a purchase is not
 * a CAN-SPAM/RFC 8058 unsubscribe; paused leaves the row eligible for a
 * future Win-Back without re-asking permission.
 *
 * Called from the Stripe webhook on customer.subscription.created, alongside
 * maybeShortCircuitSeinfeld. The two together ensure no paying Core customer
 * receives drip nurture intended for cold/Starter leads.
 *
 * Idempotent. Guarded by `status='active'` so re-runs and the inevitable
 * Stripe retries are no-ops after the first flip.
 */
export async function maybeShortCircuitSoapOpera(
  email: string,
  reason: string,
): Promise<SoapOperaPauseResult> {
  const supabase = createAdminClient();
  const lower = email.trim().toLowerCase();

  const { data, error } = await supabase
    .from("soap_opera_subscribers")
    .update({ status: "paused" })
    .eq("status", "active")
    .ilike("email", lower)
    .select("id");

  if (error) {
    console.warn("[soap-opera] short_circuit_skipped", {
      email: lower,
      reason: error.message,
    });
    return { paused: false, count: 0, error: error.message };
  }

  const count = data?.length ?? 0;
  if (count > 0) {
    console.log("[soap-opera] paused_on_conversion", {
      email: lower,
      reason,
      count,
    });
  }
  return { paused: count > 0, count };
}
