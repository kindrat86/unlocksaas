import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { sendNextCartRecoveryAndAdvance } from "./dispatch";
import { parseIdentityVariant } from "@/lib/ab";
import type {
  CartPriceType,
  DiagnosticLabel,
} from "./emails";
import { CART_RECOVERY_CADENCE_DAYS } from "./emails";

/**
 * Cart Abandonment Recovery — enrolment handler.
 *
 * Called from the Stripe webhook on `checkout.session.expired` events. The
 * webhook fires ~24h after a checkout session is created without completion.
 * We:
 *   1. Resolve the email from the expired session.
 *   2. Read the metadata to recover priceType + diagnostic_label + identity.
 *   3. Idempotently insert a cart_abandonment_subscribers row (unique on
 *      stripe_session_id; second fire is a no-op).
 *   4. Send Email 1 inline (mirrors soap-opera/subscribe.ts pattern).
 *
 * Failures are logged but do not throw — Stripe will retry the webhook and
 * the next attempt will be a no-op on the unique-index conflict.
 */

export async function recordCartAbandonment(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const email =
    session.customer_details?.email ?? session.customer_email ?? null;
  if (!email) {
    console.warn(
      "[cart-recovery] checkout.session.expired without email; skipping",
      { session_id: session.id },
    );
    return;
  }

  // Resolve price type from Stripe metadata. `priceType` is the same key set
  // by app/src/app/api/checkout/route.ts. Fallback to 'starter' on missing
  // metadata — the cheaper door is the safer fallback (lower chase cost).
  const rawPriceType = session.metadata?.price_type ?? session.metadata?.priceType;
  let priceType: CartPriceType = "starter";
  if (rawPriceType === "machine") {
    priceType = "machine";
  } else if (rawPriceType === "starter") {
    priceType = "starter";
  } else {
    console.warn(
      "[cart-recovery] unknown price_type metadata; defaulting to starter",
      { session_id: session.id, raw: rawPriceType },
    );
  }

  // Diagnostic label is optional. If the user came through the diagnostic
  // funnel, this is set; otherwise null. Used by Email 2's story selector.
  const rawLabel = session.metadata?.diagnostic_label;
  let diagnosticLabel: DiagnosticLabel | null = null;
  if (
    rawLabel === "wrong_person" ||
    rawLabel === "weak_offer" ||
    rawLabel === "weak_belief"
  ) {
    diagnosticLabel = rawLabel;
  }

  // Identity variant. Carried through every checkout in ab_variant metadata
  // (per lib/ab.ts + lib/checkout-meta.ts). parseIdentityVariant is lenient.
  const identityVariant = parseIdentityVariant(
    session.metadata?.ab_variant ?? null,
  );

  const supabase = createAdminClient();
  const lower = email.trim().toLowerCase();
  const nowIso = new Date().toISOString();

  // Next-send-at for Email 2 (Day 2). We're about to send Email 1 inline so
  // emails_sent will be 1 after; CART_RECOVERY_CADENCE_DAYS[1] = 2 days.
  // Use the cadence array so changing the schedule never desyncs.
  const nextSendAtMs =
    Date.now() + (CART_RECOVERY_CADENCE_DAYS[1] ?? 2) * 24 * 60 * 60 * 1000;
  const nextSendAt = new Date(nextSendAtMs).toISOString();

  // Idempotent insert. The unique index on stripe_session_id makes a second
  // call a no-op.
  // Cast: cart_abandonment_subscribers not yet in generated database.types.ts.
  const { data, error } = await (
    supabase as unknown as { from: (t: string) => any }
  )
    .from("cart_abandonment_subscribers")
    .upsert(
      {
        email: lower,
        stripe_session_id: session.id,
        price_type: priceType,
        identity_variant: identityVariant,
        diagnostic_label: diagnosticLabel,
        emails_sent: 0,
        status: "active",
        next_send_at: nextSendAt,
        created_at: nowIso,
        updated_at: nowIso,
      },
      { onConflict: "stripe_session_id", ignoreDuplicates: true },
    )
    .select("id, email, price_type, diagnostic_label, emails_sent, created_at, status")
    .single();

  if (error || !data) {
    // The unique-index conflict path returns no row when ignoreDuplicates is
    // true. Treat that as a successful no-op (idempotency working).
    if (error?.code === "PGRST116" || error?.code === "23505") {
      console.log(
        "[cart-recovery] duplicate session.id; idempotent no-op",
        { session_id: session.id },
      );
      return;
    }
    console.error("[cart-recovery] enrolment_db_failed", {
      session_id: session.id,
      error: error?.message,
    });
    return;
  }

  // Send Email 1 inline. If it fails, the row is left at emails_sent=0 and
  // next_send_at is in the future, so the cron will retry Email 1 on Day 2.
  const result = await sendNextCartRecoveryAndAdvance({
    id: data.id,
    email: data.email,
    price_type: data.price_type,
    diagnostic_label: data.diagnostic_label,
    emails_sent: data.emails_sent,
    created_at: data.created_at,
  });

  if (!result.ok) {
    console.error("[cart-recovery] inline_email_1_send_failed", {
      session_id: session.id,
      email: lower,
      error: result.error,
    });
  }
}

/**
 * Recovery short-circuit. Called from the Stripe webhook on every
 * `checkout.session.completed` event. If this email has an active cart
 * recovery row, flip it to `recovered` so the cron stops sending.
 *
 * Returns true if a row was flipped (caller can log the recovery), false
 * otherwise.
 */
export async function maybeShortCircuitRecovery(
  email: string,
  completedSessionId: string,
): Promise<boolean> {
  const supabase = createAdminClient();
  const lower = email.trim().toLowerCase();
  const nowIso = new Date().toISOString();

  // Update any 'active' rows for this email. Multiple rows possible if the
  // user abandoned twice; flip all of them.
  // Cast: cart_abandonment_subscribers not yet in generated database.types.ts.
  const { data, error } = await (
    supabase as unknown as { from: (t: string) => any }
  )
    .from("cart_abandonment_subscribers")
    .update({
      status: "recovered",
      recovered_at: nowIso,
      recovered_session_id: completedSessionId,
      next_send_at: null,
    })
    .eq("status", "active")
    .ilike("email", lower)
    .select("id");

  if (error) {
    console.warn("[cart-recovery] short_circuit_skipped", {
      email: lower,
      reason: error.message,
    });
    return false;
  }
  return (data?.length ?? 0) > 0;
}
