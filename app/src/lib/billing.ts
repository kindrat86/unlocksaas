/**
 * Billing helpers for the Stripe webhook.
 *
 * Schema lives in supabase/migrations/20260517000000_billing.sql.
 *   - profiles(email UNIQUE, tier, stripe_*_id, *_at)
 *   - billing_events(stripe_event_id PK)  ← idempotency
 *   - billing_payments(stripe_charge_id UNIQUE, stripe_invoice_id+kind UNIQUE)
 *
 * Why these helpers exist separately:
 *   The webhook route shouldn't carry the SQL shape of three tables inline.
 *   Each handler in route.ts should read like one paragraph: "on event X,
 *   call helper Y." When the schema evolves (eg. annual Core plan), only this
 *   file changes.
 *
 * Idempotency contract:
 *   Every helper here is safe to call twice with the same Stripe object.
 *   Inserts use ON CONFLICT or UNIQUE-protected paths so retries from Stripe
 *   (which happen routinely) don't corrupt state.
 *
 * RLS:
 *   All writes go through createAdminClient() which uses the service role and
 *   bypasses RLS. The webhook has no auth context (no cookies — middleware
 *   excludes /api/webhooks/* from the matcher).
 *
 * Type note:
 *   database.types.ts hasn't been regenerated since the billing migration was
 *   applied, so `profiles`, `billing_events`, and `billing_payments` aren't in
 *   the generated Database type. We use a locally typed `BillingDb` client to
 *   keep call sites readable without `as any` sprinkled everywhere. Re-run
 *   `supabase gen types typescript` to fold these back into the generated file.
 */

import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/server";

export type Tier = "none" | "starter" | "core";
export type PaymentKind = "starter" | "core_initial" | "core_renewal" | "other";
export type PaymentStatus = "paid" | "failed" | "refunded" | "partial_refund";

const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000;

/**
 * Service-role client typed loosely so we can hit tables not yet in the
 * generated Database type (profiles, billing_*). All call sites in this
 * module use this client.
 */
type BillingDb = SupabaseClient;
function db(): BillingDb {
  return createAdminClient() as unknown as BillingDb;
}

// ── Idempotency ──────────────────────────────────────────────────────────────

/**
 * Record that we've seen this Stripe event. Returns true if this is the first
 * time we're processing it, false if it's a duplicate.
 *
 * Use this as a guard at the top of every event branch:
 *   if (!(await markEventProcessed(event))) return;
 *
 * Note: we record BEFORE handler logic runs. If the handler throws, Stripe
 * will retry but we'll skip it. That's the right tradeoff — a partially
 * processed event corrupting state is worse than a missed retry that we can
 * investigate from billing_events + Stripe dashboard.
 *
 * If you need at-least-once semantics for a specific handler, do its work
 * idempotently (every helper here is) and don't rely on this guard.
 */
export async function markEventProcessed(event: Stripe.Event): Promise<boolean> {
  const { error } = await db()
    .from("billing_events")
    .insert({
      stripe_event_id: event.id,
      event_type: event.type,
      payload: event.data?.object ?? null,
    });

  if (!error) return true;

  // 23505 = unique_violation → already processed
  if ((error as { code?: string }).code === "23505") return false;

  // Any other error: log and treat as "first time" so the handler still runs.
  // Better to risk a duplicate effect than to drop the event entirely.
  console.error(
    `[billing] markEventProcessed unexpected error for ${event.id}:`,
    error.message
  );
  return true;
}

// ── Profile upsert ───────────────────────────────────────────────────────────

interface UpsertProfileArgs {
  email: string;
  stripe_customer_id?: string | null;
  /** Set to bump tier. Webhook never DOWNGRADES via this helper — use the
   *  dedicated cancel/refund helpers below. */
  tier?: Tier;
  stripe_subscription_id?: string | null;
  subscription_status?: string | null;
  starter_purchased_at?: string | null;
  core_started_at?: string | null;
  guarantee_expires_at?: string | null;
  cancel_at_period_end?: boolean;
}

/**
 * Upsert a profile by email. Returns the row's id (uuid).
 *
 * Tier semantics:
 *   - Pass tier='core' to grant Core access.
 *   - Pass tier='starter' to grant Starter access only if the current tier
 *     is 'none' (never downgrade Core → Starter via this helper).
 *   - Omit tier to leave it untouched.
 *
 * Other fields are set if provided, left alone if omitted (Postgres COALESCE
 * via two-step: read then update).
 */
export async function upsertProfileByEmail(args: UpsertProfileArgs): Promise<{
  id: string;
  tier: Tier;
  email: string;
}> {
  const email = args.email.trim().toLowerCase();
  if (!email) throw new Error("upsertProfileByEmail: email required");

  // Read current state so we can preserve tier when caller passes 'starter'.
  const { data: existing } = await db()
    .from("profiles")
    .select("id,tier,email")
    .eq("email", email)
    .maybeSingle();

  // Compute the next tier without downgrading Core.
  let nextTier: Tier | undefined = args.tier;
  if (nextTier === "starter" && existing?.tier === "core") {
    nextTier = "core";
  }

  const patch: Record<string, unknown> = { email };
  if (args.stripe_customer_id !== undefined) patch.stripe_customer_id = args.stripe_customer_id;
  if (nextTier !== undefined) patch.tier = nextTier;
  if (args.stripe_subscription_id !== undefined) patch.stripe_subscription_id = args.stripe_subscription_id;
  if (args.subscription_status !== undefined) patch.subscription_status = args.subscription_status;
  if (args.starter_purchased_at !== undefined) patch.starter_purchased_at = args.starter_purchased_at;
  if (args.core_started_at !== undefined) patch.core_started_at = args.core_started_at;
  if (args.guarantee_expires_at !== undefined) patch.guarantee_expires_at = args.guarantee_expires_at;
  if (args.cancel_at_period_end !== undefined) patch.cancel_at_period_end = args.cancel_at_period_end;

  const { data: row, error } = await db()
    .from("profiles")
    .upsert(patch, { onConflict: "email" })
    .select("id,tier,email")
    .single();

  if (error || !row) {
    throw new Error(`upsertProfileByEmail: ${error?.message ?? "no row returned"}`);
  }

  return row as { id: string; tier: Tier; email: string };
}

/**
 * Find a profile by Stripe customer id. Used by handlers that get a customer
 * id but no email (eg. invoice.payment_failed, subscription.deleted).
 */
export async function getProfileByCustomerId(
  customerId: string
): Promise<{ id: string; email: string; tier: Tier; starter_purchased_at: string | null } | null> {
  const { data } = await db()
    .from("profiles")
    .select("id,email,tier,starter_purchased_at")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  return (data as { id: string; email: string; tier: Tier; starter_purchased_at: string | null } | null) ?? null;
}

// ── Magic-link invite ────────────────────────────────────────────────────────

/**
 * Send a magic-link to the just-paid email so the user can sign in to /playbook
 * without having to remember a password.
 *
 * Strategy:
 *   1. Try `auth.admin.inviteUserByEmail` first. This is the documented one-shot
 *      "create user + send invite email" call.
 *   2. If that errors with a duplicate/already-registered code, fall back to
 *      `auth.signInWithOtp` which sends a magic link to the existing user.
 *
 * Failures here are LOGGED, not thrown. Stripe must still get a 2xx — the
 * customer's money has been taken, the profile is upserted, and the user can
 * always go to /login manually and re-request the link.
 */
export async function inviteOrSignIn(args: {
  email: string;
  redirectTo: string;
}): Promise<void> {
  const admin = createAdminClient();
  const email = args.email.trim().toLowerCase();

  const { error: inviteErr } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: args.redirectTo,
  });

  if (!inviteErr) return;

  const msg = inviteErr.message.toLowerCase();
  const alreadyRegistered =
    msg.includes("already") ||
    msg.includes("registered") ||
    msg.includes("exists") ||
    (inviteErr as { code?: string }).code === "email_exists";

  if (!alreadyRegistered) {
    console.error(`[billing] inviteUserByEmail failed for ${email}:`, inviteErr.message);
    return;
  }

  // User exists: send a regular magic link instead.
  const { error: otpErr } = await admin.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: args.redirectTo, shouldCreateUser: false },
  });

  if (otpErr) {
    console.error(
      `[billing] signInWithOtp fallback failed for ${email}:`,
      otpErr.message
    );
  }
}

// ── Payment ledger ───────────────────────────────────────────────────────────

interface RecordPaymentArgs {
  profile_id: string | null;
  email: string;
  stripe_customer_id?: string | null;
  stripe_invoice_id?: string | null;
  stripe_charge_id?: string | null;
  stripe_payment_intent_id?: string | null;
  kind: PaymentKind;
  amount_cents: number;
  currency?: string;
  status: PaymentStatus;
  paid_at?: string | null;
  failed_at?: string | null;
  refunded_at?: string | null;
  refund_amount_cents?: number | null;
}

/**
 * Insert a billing_payments row. Idempotent via UNIQUE indexes on
 *   - stripe_charge_id        (per-charge)
 *   - (stripe_invoice_id, kind) (per-invoice fallback when charge id missing)
 *
 * Returns true if a new row was inserted, false if it was a duplicate (already
 * recorded). Errors other than uniqueness are logged + rethrown.
 */
export async function recordPayment(args: RecordPaymentArgs): Promise<boolean> {
  const { error } = await db().from("billing_payments").insert({
    profile_id: args.profile_id,
    email: args.email.trim().toLowerCase(),
    stripe_customer_id: args.stripe_customer_id ?? null,
    stripe_invoice_id: args.stripe_invoice_id ?? null,
    stripe_charge_id: args.stripe_charge_id ?? null,
    stripe_payment_intent_id: args.stripe_payment_intent_id ?? null,
    kind: args.kind,
    amount_cents: args.amount_cents,
    currency: args.currency ?? "usd",
    status: args.status,
    paid_at: args.paid_at ?? null,
    failed_at: args.failed_at ?? null,
    refunded_at: args.refunded_at ?? null,
    refund_amount_cents: args.refund_amount_cents ?? null,
  });

  if (!error) return true;
  if ((error as { code?: string }).code === "23505") return false; // duplicate
  throw new Error(`recordPayment: ${error.message}`);
}

// ── Lifecycle: subscription cancel + refund ──────────────────────────────────

/**
 * Apply a subscription cancellation to the profile.
 *
 * Tier semantics: drop to 'starter' if they ever bought the Starter, else 'none'.
 * Per workbook 02 value ladder, paying for the $1 Starter unlocks Steps 1+2
 * permanently — Core cancellation revokes only Steps 3-7.
 */
export async function applySubscriptionCanceled(customerId: string): Promise<void> {
  const profile = await getProfileByCustomerId(customerId);
  if (!profile) {
    console.warn(`[billing] subscription canceled for unknown customer ${customerId}`);
    return;
  }

  const nextTier: Tier = profile.starter_purchased_at ? "starter" : "none";

  const { error } = await db()
    .from("profiles")
    .update({
      tier: nextTier,
      subscription_status: "canceled",
      canceled_at: new Date().toISOString(),
      cancel_at_period_end: false,
    })
    .eq("id", profile.id);

  if (error) throw new Error(`applySubscriptionCanceled: ${error.message}`);
}

/**
 * Compute the 60-day clock from a Stripe period_start (the first invoice's
 * period_start when billing_reason='subscription_create').
 */
export function sixtyDayExpiry(fromUnix: number): string {
  return new Date(fromUnix * 1000 + SIXTY_DAYS_MS).toISOString();
}

/**
 * Apply a refund event to the profile. Marks refunded_at; the tier downgrade
 * decision (revoke Core or not) is left to applySubscriptionCanceled which
 * Stripe fires separately when the operator cancels the sub.
 */
export async function applyRefund(args: {
  customerId: string | null;
  refundedAtIso: string;
  fullRefund: boolean;
}): Promise<void> {
  if (!args.customerId) return;
  const profile = await getProfileByCustomerId(args.customerId);
  if (!profile) return;

  if (args.fullRefund) {
    const { error } = await db()
      .from("profiles")
      .update({ refunded_at: args.refundedAtIso })
      .eq("id", profile.id);
    if (error) throw new Error(`applyRefund: ${error.message}`);
  }
}
