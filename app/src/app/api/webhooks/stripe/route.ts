import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { sendFirstCustomerCelebrationEmail } from "@/lib/celebration-email";
import { absoluteBadgeUrl } from "@/lib/builder-badge";
import { IDENTITY_AB_KEY, parseIdentityVariant } from "@/lib/ab";
import {
  captureServerAndFlush,
  stripeDistinctId,
} from "@/lib/analytics/server";
import { Event } from "@/lib/analytics/events";

// Node runtime is required: Stripe.webhooks.constructEvent uses Buffer + crypto.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  // Stripe Connect events arrive with `event.account` populated with the
  // connected account id — these are proof-of-life from the USER'S Stripe
  // account, not our billing. The First Paying Customer Verified milestone
  // (workbook 04 §7) is detected from `charge.succeeded` on these accounts.
  // Branch early so the stub-form platform handlers below stay clean.
  if (event.account) {
    try {
      if (event.type === "charge.succeeded") {
        await handleConnectChargeSucceeded(
          event.data.object as Stripe.Charge,
          event.account
        );
      } else {
        console.log(
          `[stripe-webhook] ignoring connect event ${event.type} from ${event.account} (${event.id})`
        );
      }
    } catch (err) {
      console.error(
        `[stripe-webhook] connect handler error for ${event.type} (${event.id}):`,
        err
      );
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Connect handler error" },
        { status: 500 }
      );
    }
    return NextResponse.json({ received: true, connect: true });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      // TODO: Create user project in Supabase, link Stripe customer
      console.log("Checkout completed:", session.id, session.mode);
      await recordIdentityAbConversion(session);
      await recordDiagnosticAttribution(session);
      await capturePurchase(session);
      break;
    }
    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      // TODO: Track subscription payments for 60-day guarantee
      console.log("Payment succeeded:", invoice.id);
      await captureInvoiceEvent(invoice, Event.InvoicePaymentSucceeded);
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      await captureInvoiceEvent(invoice, Event.InvoicePaymentFailed);
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await captureServerAndFlush(
        stripeDistinctId(
          typeof sub.customer === "string" ? sub.customer : sub.customer?.id,
        ),
        Event.SubscriptionCanceled,
        {
          stripe_subscription_id: sub.id,
          canceled_at: sub.canceled_at,
          cancel_at_period_end: sub.cancel_at_period_end,
        },
      );
      break;
    }
    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      await captureServerAndFlush(
        stripeDistinctId(
          typeof charge.customer === "string"
            ? charge.customer
            : charge.customer?.id,
        ),
        Event.ChargeRefunded,
        {
          stripe_charge_id: charge.id,
          amount_refunded_cents: charge.amount_refunded,
          currency: charge.currency,
        },
      );
      break;
    }
  }

  return NextResponse.json({ received: true });
}

// ── Conversion capture for PostHog (the events brunson-funnel-metrics needs) ──
//
// On checkout.session.completed we fire ONE of:
//   - StarterPurchased (mode === "payment")
//   - MachineSubscribed (mode === "subscription")
// Plus the always-fires CheckoutCompleted analog is implicit in the named one.
// We use captureServerAndFlush because the function may freeze right after.
async function capturePurchase(session: Stripe.Checkout.Session) {
  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id;
  // Prefer the Supabase user id when we can resolve it. The Stripe webhook
  // runs without an auth cookie, so we look up profiles by stripe_customer_id.
  let supabaseUserId: string | null = null;
  if (customerId) {
    try {
      const db = createAdminClient();
      const { data } = await db
        .from("profiles")
        .select("user_id")
        .eq("stripe_customer_id", customerId)
        .maybeSingle();
      supabaseUserId = (data?.user_id as string | undefined) ?? null;
    } catch {
      // best-effort — still capture under the stripe: prefix
    }
  }

  const distinctId = stripeDistinctId(customerId, supabaseUserId);
  const isSubscription = session.mode === "subscription";
  const eventName = isSubscription
    ? Event.MachineSubscribed
    : Event.StarterPurchased;

  await captureServerAndFlush(distinctId, eventName, {
    price_type: isSubscription ? "machine" : "starter",
    stripe_customer_id: customerId,
    stripe_session_id: session.id,
    amount_cents: session.amount_total ?? null,
    currency: session.currency ?? null,
  });
}

async function captureInvoiceEvent(
  invoice: Stripe.Invoice,
  event: typeof Event.InvoicePaymentSucceeded | typeof Event.InvoicePaymentFailed,
) {
  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id;
  await captureServerAndFlush(
    stripeDistinctId(customerId),
    event,
    {
      stripe_invoice_id: invoice.id,
      stripe_customer_id: customerId,
      amount_paid_cents: invoice.amount_paid,
      amount_due_cents: invoice.amount_due,
      currency: invoice.currency,
      billing_reason: invoice.billing_reason,
    },
  );
}

// ── Stripe Connect: First Paying Customer Verified detection ─────────────────
//
// Fires when the USER's connected Stripe account records a charge. This is the
// only signal that counts for the 60-day guarantee promise (Hard Rule #3:
// Stripe is the only proof). The user must have connected their Stripe account
// via Machine Step 7 onboarding (Sprint 3) — until that ships, this handler
// is a no-op because no `stripe_connections` rows exist yet. The celebration
// page provides a manual fallback for the operator in non-prod environments.
async function handleConnectChargeSucceeded(
  charge: Stripe.Charge,
  connectedAccountId: string
) {
  if (!charge.amount || charge.amount <= 0) return; // skip $0 auth charges

  const db = createAdminClient();

  const { data: connection } = await db
    .from("stripe_connections")
    .select("project_id")
    .eq("stripe_account_id", connectedAccountId)
    .maybeSingle();

  if (!connection) {
    console.warn(
      `[stripe-webhook] charge.succeeded for ${connectedAccountId} but no stripe_connections row`
    );
    return;
  }

  const { data: project } = await db
    .from("projects")
    .select("user_id")
    .eq("id", connection.project_id as string)
    .maybeSingle();
  if (!project?.user_id) return;

  const { data: profile } = await db
    .from("profiles")
    .select("id,email,builder_name,builder_slug,product_name")
    .eq("user_id", project.user_id as string)
    .maybeSingle();
  if (!profile) return;

  // Idempotent insert. Unique index on stripe_charge_id catches retries.
  const { error: insertErr } = await db.from("verified_conversions").insert({
    profile_id: profile.id,
    stripe_charge_id: charge.id,
    stripe_account_id: connectedAccountId,
    amount_cents: charge.amount,
    currency: charge.currency ?? "usd",
    customer_email:
      charge.billing_details?.email ?? charge.receipt_email ?? null,
    source: "connect",
  });

  if (insertErr) {
    if ((insertErr as { code?: string }).code === "23505") return; // already recorded
    throw insertErr;
  }

  // First-customer detection. Race-safe because the insert above is
  // unique-indexed on stripe_charge_id.
  const { count } = await db
    .from("verified_conversions")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profile.id as string);

  if (count === 1) {
    // THE event brunson-funnel-metrics cares about most: the user's own Stripe
    // saw a real paying customer. This is the only "success" the workbooks
    // recognize. Captured before the celebration email so a Resend outage
    // doesn't lose the conversion metric.
    await captureServerAndFlush(
      profile.user_id as string,
      Event.FirstCustomerVerified,
      {
        stripe_charge_id: charge.id,
        connected_account_id: connectedAccountId,
        amount_cents: charge.amount,
        currency: charge.currency ?? "usd",
      },
    );

    try {
      await sendFirstCustomerCelebrationEmail({
        to: profile.email as string,
        builderName: (profile.builder_name as string | null) ?? null,
        productName: (profile.product_name as string | null) ?? null,
        amountCents: charge.amount,
        currency: charge.currency ?? "usd",
        ctaUrl: profile.builder_slug
          ? absoluteBadgeUrl(profile.builder_slug as string)
          : undefined,
      });
    } catch (err) {
      console.error("[stripe-webhook] celebration email failed:", err);
      // Non-fatal — the milestone is what matters; can be re-sent manually.
    }
  }
}

// ── A/B: identity_label conversion attribution ───────────────────────────────
//
// The checkout API (app/api/checkout/route.ts) stamps the visitor's variant +
// subject onto session.metadata. Here we read it back and write a conversion
// row to public.ab_tests so per-variant conversion rate is computable from
// `select variant, count(distinct subject_id) ... group by variant`.
//
//   session.mode === "payment"      → conversion_event = "starter_purchase"
//   session.mode === "subscription" → conversion_event = "core_purchase"
//
// Silently skips non-A/B sessions (legacy or external) so this never fails the
// webhook. Service role bypasses RLS — webhook routes are excluded from
// middleware via the matcher in src/middleware.ts so visitor cookies are not
// available here.
async function recordIdentityAbConversion(session: Stripe.Checkout.Session) {
  const metadata = session.metadata ?? {};
  if (metadata.ab_key !== IDENTITY_AB_KEY) return;

  const variant = parseIdentityVariant(metadata.ab_variant);
  if (!variant) return;

  const subjectId = metadata.ab_subject ? metadata.ab_subject : null;
  const conversionEvent =
    session.mode === "subscription" ? "core_purchase" : "starter_purchase";

  const admin = createAdminClient();
  const { error } = await admin.from("ab_tests").insert({
    key: IDENTITY_AB_KEY,
    variant,
    subject_id: subjectId,
    conversion_event: conversionEvent,
  });

  if (error) {
    console.error(
      `[ab_tests] ${conversionEvent} insert failed for session ${session.id}:`,
      error.message
    );
  }
}

// ── Diagnostic → Starter attribution ─────────────────────────────────────────
//
// The Starter page forwards `attribution: { from, label, lead }` to
// /api/checkout when the visitor arrives via `?from=diagnostic`. The checkout
// route stamps `diagnostic_lead_id` onto session.metadata. Here we close the
// loop: find the diagnostic_leads row and mark it converted.
//
// Idempotent on retry — we only update when converted_to_starter_at is null,
// so Stripe replay events don't overwrite the first-touch timestamp.
//
// Silently skips sessions that don't carry the metadata (organic /starter
// traffic or legacy flows).
async function recordDiagnosticAttribution(session: Stripe.Checkout.Session) {
  const metadata = session.metadata ?? {};
  const leadId = metadata.diagnostic_lead_id;
  if (!leadId || !/^[0-9a-f-]{36}$/i.test(leadId)) return;

  // Only attribute Starter conversions. Core checkouts originate downstream
  // of the diagnostic (OTO or direct $49 sales page); we'll add a separate
  // converted_to_core_at column if/when that flow needs first-touch attribution.
  if (session.mode !== "payment") return;

  const admin = createAdminClient();
  const { error } = await admin
    .from("diagnostic_leads")
    .update({
      converted_to_starter_at: new Date().toISOString(),
      converted_session_id: session.id,
    })
    .eq("id", leadId)
    .is("converted_to_starter_at", null);

  if (error) {
    console.error(
      `[diagnostic] attribution update failed for lead ${leadId} (session ${session.id}):`,
      error.message
    );
  }
}
