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
import {
  applyRefund,
  applySubscriptionCanceled,
  getProfileByCustomerId,
  inviteOrSignIn,
  markEventProcessed,
  recordPayment,
  sixtyDayExpiry,
  upsertProfileByEmail,
} from "@/lib/billing";
import {
  recordCartAbandonment,
  maybeShortCircuitRecovery,
} from "@/lib/cart-recovery/subscribe";
import { maybeShortCircuitSeinfeld } from "@/lib/seinfeld/conversion";
import {
  subscribeStarterBuyerToSoapOpera,
  maybeShortCircuitSoapOpera,
  coerceIdentityVariant,
} from "@/lib/soap-opera/subscribe";

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

  // Idempotency guard. Every platform event passes through billing_events
  // first; Stripe retries become no-ops. The Connect branch above doesn't
  // need this guard because it's append-only against verified_conversions
  // (unique-indexed on stripe_charge_id).
  if (!(await markEventProcessed(event))) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        // BILLING: upsert profile, record Starter payment, send magic link.
        await handleCheckoutSessionCompleted(session);
        // ATTRIBUTION + ANALYTICS side-channels (preserved unchanged).
        await recordIdentityAbConversion(session);
        await recordDiagnosticAttribution(session);
        await recordFoundingSeat(session);
        await capturePurchase(session);
        // FOLLOW-UP: short-circuit any active Cart Abandonment Recovery row
        // for this email so the cron stops chasing a paid customer.
        // strategy/follow-up-funnels.md Part 6 "recovery short-circuit."
        const completedEmail =
          session.customer_details?.email ?? session.customer_email ?? null;
        if (completedEmail) {
          await maybeShortCircuitRecovery(completedEmail, session.id);
          // FOLLOW-UP: enrol cold-direct $1 Starter buyers into the Soap
          // Opera so the SOS becomes the lossless Return Path for every
          // Starter buyer — not only those who entered via /diagnostic.
          // Closes the integrity gap on
          //   strategy/decisions/seven-phases-coverage.md §"Why no downsell"
          //   point #4 ("Soap Opera is the lossless Return Path"). The
          //   helper is idempotent on existing subscribers (diagnostic-
          //   entry buyers do not get re-enrolled or have their clock
          //   reset). Stripe webhook idempotency (markEventProcessed) +
          //   helper's own existence-check make retries no-ops.
          if (session.mode === "payment") {
            const variant = coerceIdentityVariant(
              session.metadata?.[IDENTITY_AB_KEY],
            );
            await subscribeStarterBuyerToSoapOpera({
              email: completedEmail,
              identity_variant: variant,
            });
          }
        }
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        // FOLLOW-UP: enrol into Cart Abandonment Recovery cadence (3-email
        // arc over 7 days). strategy/follow-up-funnels.md Part 2 cadence #5.
        await recordCartAbandonment(session);
        break;
      }
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        // BILLING: open 60-day clock on first sub invoice; record payment.
        await handleInvoicePaymentSucceeded(invoice);
        await captureInvoiceEvent(invoice, Event.InvoicePaymentSucceeded);
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        // BILLING: record failed payment row.
        await handleInvoicePaymentFailed(invoice);
        await captureInvoiceEvent(invoice, Event.InvoicePaymentFailed);
        break;
      }
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpserted(sub);
        // FOLLOW-UP: stop the Seinfeld nurture cadence the moment a subscriber
        // becomes a paying Core customer. Brunson hard rule (workbook 08 §6,
        // strategy/follow-up-funnels.md Part 6): never email a customer like
        // a lead. Companion to maybeShortCircuitRecovery on checkout.session.
        const subCustomerId =
          typeof sub.customer === "string"
            ? sub.customer
            : sub.customer?.id ?? null;
        if (subCustomerId) {
          const profile = await getProfileByCustomerId(subCustomerId);
          if (profile?.email) {
            await maybeShortCircuitSeinfeld(
              profile.email,
              `stripe_subscription_created:${sub.id}`,
            );
            // FOLLOW-UP: pause any active Soap Opera row for this email.
            // A Core customer who is still mid-SOS would receive Email 5
            // ("the offer for the full Machine") which they just bought.
            // Brunson hard rule: never email a customer like a lead.
            // Companion to maybeShortCircuitSeinfeld; both flip status to
            // 'paused' so a future Win-Back move can re-activate without
            // re-asking permission.
            await maybeShortCircuitSoapOpera(
              profile.email,
              `stripe_subscription_created:${sub.id}`,
            );
          }
        }
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpserted(sub);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        // BILLING: revoke Core tier per "drop to starter if owned, else none".
        await handleSubscriptionDeleted(sub);
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
        // BILLING: mark billing_payments refund + stamp profiles.refunded_at.
        await handleChargeRefunded(charge);
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
  } catch (err) {
    console.error(
      `[stripe-webhook] platform handler error for ${event.type} (${event.id}):`,
      err
    );
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Handler error" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}

// ════════════════════════════════════════════════════════════════════════════
// Billing handlers — wire Stripe events into profiles + billing_* tables.
// Schema in supabase/migrations/20260517000000_billing.sql. All ops idempotent.
// ════════════════════════════════════════════════════════════════════════════

// ── checkout.session.completed ───────────────────────────────────────────────
//
// Fires once per successful Checkout for both $1 Starter (mode=payment) and
// $49/mo Core (mode=subscription). We:
//   1. Upsert profiles row by email (tier=starter | core).
//   2. Record the Starter payment here — the $1 OTO is a PaymentIntent with
//      no invoice, so this is the only opportunity. For Core, the payment
//      lands in invoice.payment_succeeded (which is also when the 60-day
//      clock starts, because that's when money actually moves).
//   3. Send a magic link via inviteOrSignIn() so the user can sign into
//      /machine without ever choosing a password (Reluctant Hero: no friction).
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const email =
    session.customer_details?.email ??
    session.customer_email ??
    null;
  if (!email) {
    console.warn(
      `[stripe-webhook] checkout.session.completed ${session.id} has no email; skipping profile + invite`
    );
    return;
  }

  const stripeCustomerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id ?? null;

  const isCore = session.mode === "subscription";
  const stripeSubscriptionId = isCore
    ? typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id ?? null
    : null;

  const nowIso = new Date().toISOString();

  // Brunson DCS Secret #12 beat 6 (Results-in-Advance, time-bound delivery):
  // a Starter purchase sets a 48-hour completion deadline for Step 1 + Step 2.
  // /api/cron/starter-deadline-reminder fires once at deadline - 24h if the
  // buyer has not yet finished both. Spec: strategy/results-in-advance.md
  // beat 6. Migration: 20260518000005_starter_completion_deadline.sql.
  //
  // Core purchasers don't get a Starter deadline — the 60-day guarantee
  // clock takes over and the Machine carries them past Steps 1+2.
  const starterDeadlineAt = isCore
    ? null
    : new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

  const profile = await upsertProfileByEmail({
    email,
    stripe_customer_id: stripeCustomerId,
    tier: isCore ? "core" : "starter",
    stripe_subscription_id: stripeSubscriptionId,
    subscription_status: isCore ? "active" : undefined,
    starter_purchased_at: isCore ? undefined : nowIso,
    starter_completion_deadline_at: starterDeadlineAt,
    // core_started_at + guarantee_expires_at set on invoice.payment_succeeded
    // when billing_reason='subscription_create'.
  });

  // Starter ($1 OTO): no invoice event will fire, so record the payment here.
  if (!isCore && session.amount_total && session.amount_total > 0) {
    await recordPayment({
      profile_id: profile.id,
      email: profile.email,
      stripe_customer_id: stripeCustomerId,
      stripe_payment_intent_id:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null,
      kind: "starter",
      amount_cents: session.amount_total,
      currency: session.currency ?? "usd",
      status: "paid",
      paid_at: nowIso,
    });
  }

  // Land the user where the Stripe success_url already pointed them:
  //   Starter (mode=payment)      → /oto → /machine (auth-gated)
  //   Core    (mode=subscription) → /onboarding (auth-gated)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://unlocksaas.com";
  const next = isCore ? "/onboarding" : "/machine";
  const redirectTo = `${appUrl}/auth/callback?next=${encodeURIComponent(next)}`;
  await inviteOrSignIn({ email, redirectTo });
}

// ── invoice.payment_succeeded ────────────────────────────────────────────────
//
// Fires once per successful subscription invoice. Two flavors:
//   - billing_reason='subscription_create' → first $49 charge → opens 60-day clock
//   - billing_reason='subscription_cycle'  → monthly renewal
//
// Per Hard Rule #4 of strategy/BUILD-PROMPT-CLAUDE-CODE.md: the guarantee is
// machine-verifiable. profile.guarantee_expires_at is the single source of
// truth for refund eligibility windows (lib/guarantee.ts reads it).
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id ?? null;
  if (!customerId) return;

  const email = invoice.customer_email ?? null;
  const profile = await getProfileByCustomerId(customerId);
  if (!profile && !email) {
    console.warn(
      `[stripe-webhook] invoice.payment_succeeded ${invoice.id} has no profile and no email; skipping`
    );
    return;
  }

  const isFirstSubInvoice = invoice.billing_reason === "subscription_create";

  // Ensure profile exists. If checkout.session.completed got dropped, the
  // invoice still gives us enough to promote the user.
  const ensuredProfile =
    profile ??
    (await upsertProfileByEmail({
      email: email!,
      stripe_customer_id: customerId,
      tier: "core",
      subscription_status: "active",
    }));

  if (isFirstSubInvoice) {
    const periodStart =
      invoice.lines?.data?.[0]?.period?.start ??
      Math.floor(Date.now() / 1000);
    await upsertProfileByEmail({
      email: ensuredProfile.email,
      tier: "core",
      subscription_status: "active",
      core_started_at: new Date(periodStart * 1000).toISOString(),
      guarantee_expires_at: sixtyDayExpiry(periodStart),
    });
  }

  // Stripe-node v22 dropped `invoice.charge` and `invoice.payment_intent` from
  // the static types when targeting newer API versions, but the runtime payload
  // still includes them for older API versions and replayed events. Cast through
  // a permissive local type so we can read them defensively.
  const legacy = invoice as unknown as {
    charge?: string | { id?: string } | null;
    payment_intent?: string | { id?: string } | null;
    status_transitions?: { paid_at?: number | null } | null;
  };
  const chargeId =
    typeof legacy.charge === "string"
      ? legacy.charge
      : legacy.charge?.id ?? null;
  const paymentIntentId =
    typeof legacy.payment_intent === "string"
      ? legacy.payment_intent
      : legacy.payment_intent?.id ?? null;
  const paidAtUnix =
    legacy.status_transitions?.paid_at ?? Math.floor(Date.now() / 1000);

  await recordPayment({
    profile_id: ensuredProfile.id,
    email: ensuredProfile.email,
    stripe_customer_id: customerId,
    stripe_invoice_id: invoice.id,
    stripe_charge_id: chargeId,
    stripe_payment_intent_id: paymentIntentId,
    kind: isFirstSubInvoice ? "core_initial" : "core_renewal",
    amount_cents: invoice.amount_paid ?? invoice.total ?? 0,
    currency: invoice.currency ?? "usd",
    status: "paid",
    paid_at: new Date(paidAtUnix * 1000).toISOString(),
  });
}

// ── invoice.payment_failed ───────────────────────────────────────────────────
//
// Card declined or auth failed. Stripe automatically dunns per its Smart Retries
// schedule. We record the failed attempt and let subscription.updated flip
// subscription_status to past_due.
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id ?? null;
  if (!customerId) return;

  const profile = await getProfileByCustomerId(customerId);
  const email = invoice.customer_email ?? profile?.email ?? null;
  if (!email) {
    console.warn(
      `[stripe-webhook] invoice.payment_failed ${invoice.id} has no email; skipping`
    );
    return;
  }

  await recordPayment({
    profile_id: profile?.id ?? null,
    email,
    stripe_customer_id: customerId,
    stripe_invoice_id: invoice.id,
    kind:
      invoice.billing_reason === "subscription_create"
        ? "core_initial"
        : "core_renewal",
    amount_cents: invoice.amount_due ?? 0,
    currency: invoice.currency ?? "usd",
    status: "failed",
    failed_at: new Date().toISOString(),
  });
}

// ── customer.subscription.created / .updated ─────────────────────────────────
//
// Status transitions (active → past_due → unpaid), cancel_at_period_end toggles,
// plan swaps. We don't change tier here — that's owned by checkout (grant) and
// subscription.deleted (revoke). This handler keeps subscription_status +
// cancel_at_period_end in sync.
async function handleSubscriptionUpserted(sub: Stripe.Subscription) {
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? null;
  if (!customerId) return;

  const profile = await getProfileByCustomerId(customerId);
  if (!profile) {
    console.warn(
      `[stripe-webhook] subscription ${sub.id} for unknown customer ${customerId}; skipping`
    );
    return;
  }

  await upsertProfileByEmail({
    email: profile.email,
    stripe_subscription_id: sub.id,
    subscription_status: sub.status,
    cancel_at_period_end: sub.cancel_at_period_end ?? false,
  });
}

// ── customer.subscription.deleted ────────────────────────────────────────────
//
// Final cancellation. applySubscriptionCanceled() drops tier from 'core' to
// 'starter' if the user ever bought the Starter, else 'none' — per workbook 02
// value ladder where $1 Starter unlocks Steps 1+2 permanently.
async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? null;
  if (!customerId) return;
  await applySubscriptionCanceled(customerId);
}

// ── charge.refunded ──────────────────────────────────────────────────────────
//
// Fires when the operator (or the guarantee verifier) refunds a charge in
// Stripe. We update billing_payments status + stamp profiles.refunded_at on
// full refunds. Tier downgrade is left to subscription.deleted which the
// operator typically fires alongside.
async function handleChargeRefunded(charge: Stripe.Charge) {
  const customerId =
    typeof charge.customer === "string"
      ? charge.customer
      : charge.customer?.id ?? null;
  const refundedAt = new Date().toISOString();
  const fullRefund = (charge.amount_refunded ?? 0) >= (charge.amount ?? 0);

  if (charge.id) {
    const db = createAdminClient();
    const { error } = await db
      .from("billing_payments")
      // billing_payments is not yet in the generated Database type; loose cast
      // so the update typechecks. Re-running `supabase gen types typescript`
      // would let us drop this.
      .update({
        status: fullRefund ? "refunded" : "partial_refund",
        refunded_at: refundedAt,
        refund_amount_cents: charge.amount_refunded ?? 0,
      } as unknown as never)
      .eq("stripe_charge_id", charge.id);
    if (error) {
      console.error(
        `[stripe-webhook] charge.refunded update failed for ${charge.id}:`,
        error.message
      );
    }
  }

  await applyRefund({
    customerId,
    refundedAtIso: refundedAt,
    fullRefund,
  });
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
    // `profile.user_id` isn't on the existing select clause, but we already
    // resolved it as `project.user_id` above. Use that to keep the select
    // clause untouched and the type-check clean.
    await captureServerAndFlush(
      project.user_id as string,
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

// ── Founding-Cohort PLF: seat grant ──────────────────────────────────────────
//
// Workbook 03 Script 8 (revised 2026-05-17). When a Core subscription session
// completes with metadata.attribution_from === "founding", attempt to grant
// a founding seat. Three gates must pass:
//
//   1. Cart window must be OPEN (FOUNDING_CART_OPEN_AT <= now < FOUNDING_CART_CLOSE_AT).
//   2. Current seat count must be < 50.
//   3. The DB unique index on founding_cohort.seat_number provides the final
//      race protection — the second of two concurrent 50th claims fails cleanly
//      and the subscription is still honored at $49/mo evergreen (no bonuses).
//
// If any gate fails, the seat is NOT granted and the founding bonuses do not
// apply. The Core subscription itself still completes — Brunson rule: never
// punish the buyer for the seller's race condition.
//
// On success: insert founding_cohort row, stamp founding_waitlist.converted_to_founding_at
// (if the email is on the waitlist), and set direct_line_expires_at to 30 days out.
async function recordFoundingSeat(session: Stripe.Checkout.Session) {
  const metadata = session.metadata ?? {};
  if (metadata.attribution_from !== "founding") return;
  if (session.mode !== "subscription") return;

  // Lazy import to keep the webhook bootstrap path lean — these modules only
  // load when a founding session actually completes.
  const { cartWindow, FOUNDING_COHORT_CAP } = await import(
    "@/lib/founding/cohort"
  );

  const win = cartWindow();
  if (win.state !== "open") {
    console.warn(
      `[founding-cohort] session ${session.id} carries founding attribution but cart is ${win.state}; no seat granted`
    );
    return;
  }

  const email =
    session.customer_details?.email ??
    session.customer_email ??
    null;
  if (!email) return;

  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id ?? null;
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id ?? null;
  const identityVariant = parseIdentityVariant(metadata.ab_variant);

  const admin = createAdminClient();
  // Cast: founding_cohort + founding_waitlist live in migration 20260518000002
  // and are not yet in the generated database.types.ts. Same pattern this file
  // already uses for billing_payments (`as unknown as never` on the update).
  const adminLoose = admin as unknown as { from: (t: string) => any };

  // Optimistic seat-number assignment. The unique index will reject the
  // duplicate write if two concurrent webhooks race past the cap check.
  const { data: maxRow, error: maxErr } = await adminLoose
    .from("founding_cohort")
    .select("seat_number")
    .order("seat_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (maxErr) {
    console.error(
      `[founding-cohort] seat-count read failed for ${session.id}:`,
      maxErr.message
    );
    return;
  }

  const currentMax = maxRow?.seat_number ?? 0;
  if (currentMax >= FOUNDING_COHORT_CAP) {
    console.warn(
      `[founding-cohort] cap reached (${currentMax}/${FOUNDING_COHORT_CAP}); ${session.id} did not get a founding seat`
    );
    return;
  }

  const seatNumber = currentMax + 1;
  const directLineExpires = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  // Look up waitlist row by email so we can stamp converted_to_founding_at
  // and link the founding row back to the waitlist (for funnel analysis).
  const { data: waitlistRow } = await adminLoose
    .from("founding_waitlist")
    .select("id")
    .ilike("email", email)
    .maybeSingle();

  const { error: insertErr } = await adminLoose.from("founding_cohort").insert({
    seat_number: seatNumber,
    email: email.toLowerCase(),
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    stripe_session_id: session.id,
    identity_variant: identityVariant,
    waitlist_id: waitlistRow?.id ?? null,
    direct_line_expires_at: directLineExpires,
  });

  if (insertErr) {
    // Code 23505 = unique violation. Likely a race past the cap. Subscription
    // is already created; the user gets the product at $49 evergreen but no
    // founding bonuses. This is the documented fallback behaviour.
    if ((insertErr as { code?: string }).code === "23505") {
      console.warn(
        `[founding-cohort] unique violation on seat ${seatNumber} for ${session.id}; cap race lost`
      );
      return;
    }
    console.error(
      `[founding-cohort] seat insert failed for ${session.id}:`,
      insertErr.message
    );
    return;
  }

  if (waitlistRow?.id) {
    await adminLoose
      .from("founding_waitlist")
      .update({
        converted_to_founding_at: new Date().toISOString(),
        converted_session_id: session.id,
        status: "complete",
      })
      .eq("id", waitlistRow.id)
      .is("converted_to_founding_at", null);
  }

  console.log(
    `[founding-cohort] granted seat ${seatNumber} to ${email} (session ${session.id})`
  );
}
