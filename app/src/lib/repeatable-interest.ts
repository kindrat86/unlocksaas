/**
 * Rung 2 (Repeatable Revenue Layer) — interest-signal data layer helpers.
 *
 * Spec: strategy/decisions/rung-2-repeatable-revenue.md.
 * Migration: supabase/migrations/20260518000005_repeatable_interest.sql.
 *
 * The activation-gate read pulls from `public.repeatable_interest_signal`,
 * which is service-role only. The signal IS the demand layer that the
 * Brunson rule "no supply without demand signal" requires — the founder
 * does not invent demand by pre-building, but also does not invent supply
 * by waitlist-marketing. The placeholder page captures intent honestly and
 * the operator reads it during the Friday Audible Call.
 */
import { createAdminClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type IdentityVariant = "verified_builder" | "paid_builder";

export interface RepeatableInterestInsert {
  email: string;
  message: string | null;
  source: string;
  identity_variant: IdentityVariant | null;
  user_agent: string | null;
  ip: string | null;
}

export type CaptureOutcome =
  | { ok: true; id: string; is_core_customer: boolean }
  | { ok: false; reason: "invalid_email" }
  | { ok: false; reason: "message_too_long" }
  | { ok: false; reason: "db_insert_failed"; detail: string };

export interface InterestSignal {
  total_asks: number;
  core_asks: number;
  cold_asks: number;
  asks_last_7d: number;
  asks_last_30d: number;
  most_recent_ask_at: string | null;
  gate_2_fired: boolean;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_SOURCE_LENGTH = 64;

function normalizeEmail(raw: string): string | null {
  const trimmed = raw.trim().toLowerCase();
  if (trimmed.length < 5 || trimmed.length > 320) return null;
  if (!EMAIL_RE.test(trimmed)) return null;
  return trimmed;
}

function coerceIdentityVariant(raw: unknown): IdentityVariant | null {
  if (raw === "verified_builder" || raw === "paid_builder") return raw;
  return null;
}

// ---------------------------------------------------------------------------
// Capture (insert/upsert)
// ---------------------------------------------------------------------------

/**
 * Capture a single Rung-2 interest row.
 *
 * Server-side enrichment: looks up profiles.tier by email to set
 * is_core_customer. The /api/repeatable-interest route is the only caller
 * — it owns rate limiting + payload validation; this helper owns
 * normalization + the privileged insert.
 *
 * Behaviour:
 *   - upsert on lower(email): same email re-submitting updates message/
 *     source/identity_variant. We deliberately do NOT extend the activation
 *     gate's count via repeat submissions; the unique index prevents that.
 *   - is_core_customer is re-evaluated on every submission (a Starter
 *     buyer who later upgrades to Core gets re-classified next time they
 *     touch the form).
 */
export async function captureInterest(
  input: RepeatableInterestInsert
): Promise<CaptureOutcome> {
  const email = normalizeEmail(input.email);
  if (!email) return { ok: false, reason: "invalid_email" };

  const message =
    typeof input.message === "string" && input.message.trim().length > 0
      ? input.message.trim().slice(0, MAX_MESSAGE_LENGTH + 1)
      : null;

  if (message && message.length > MAX_MESSAGE_LENGTH) {
    return { ok: false, reason: "message_too_long" };
  }

  const source = (input.source ?? "repeatable_page").slice(0, MAX_SOURCE_LENGTH);
  const identity_variant = coerceIdentityVariant(input.identity_variant);

  const admin = createAdminClient();

  // Resolve Core-customer status from profiles by email. We accept tier in
  // {'core','core_active','machine'} as any historical naming the schema
  // might still carry; the `core` prefix match is conservative.
  let isCoreCustomer = false;
  const { data: profileLookup } = await admin
    .from("profiles")
    .select("id,tier")
    .eq("email", email)
    .maybeSingle();

  if (profileLookup && typeof profileLookup === "object") {
    const tier =
      (profileLookup as { tier?: string | null }).tier?.toLowerCase() ?? "";
    if (tier.startsWith("core") || tier === "machine") {
      isCoreCustomer = true;
    }
  }

  const insertPayload = {
    email,
    message,
    source,
    identity_variant,
    is_core_customer: isCoreCustomer,
    user_agent: input.user_agent,
    ip: input.ip,
  };

  // Upsert on the unique index lower(email).
  const { data, error } = await admin
    .from("repeatable_interest")
    .upsert(insertPayload, { onConflict: "email" })
    .select("id")
    .single();

  if (error || !data) {
    return {
      ok: false,
      reason: "db_insert_failed",
      detail: error?.message ?? "unknown insert failure",
    };
  }

  return {
    ok: true,
    id: (data as { id: string }).id,
    is_core_customer: isCoreCustomer,
  };
}

// ---------------------------------------------------------------------------
// Signal read (Friday Audible Call)
// ---------------------------------------------------------------------------

/**
 * Read the activation-gate signal. Returns null when the view cannot be
 * read (network / schema issue) so callers can render the page without
 * blocking — the placeholder page is honest about "no signal yet" anyway.
 */
export async function readInterestSignal(): Promise<InterestSignal | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("repeatable_interest_signal")
    .select("*")
    .maybeSingle();

  if (error || !data) return null;

  const row = data as Record<string, unknown>;
  return {
    total_asks: Number(row.total_asks ?? 0),
    core_asks: Number(row.core_asks ?? 0),
    cold_asks: Number(row.cold_asks ?? 0),
    asks_last_7d: Number(row.asks_last_7d ?? 0),
    asks_last_30d: Number(row.asks_last_30d ?? 0),
    most_recent_ask_at:
      typeof row.most_recent_ask_at === "string" ? row.most_recent_ask_at : null,
    gate_2_fired: row.gate_2_fired === true,
  };
}
