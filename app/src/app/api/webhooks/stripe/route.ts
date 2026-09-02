import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
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
  type PaymentKind,
} from "@/lib/billing";
import {
  recordCartAbandonment,
  maybeShortCircuitRecovery,
} from "@/lib/cart-recovery/subscribe";
import {
  scheduleGrantForCheckout,
  scheduleLifetimeGrantForCheckout,
  scheduleRevokeForCustomer,
} from "@/lib/community";
import {
  OFFERS,
  getOfferDeliverableUrl,
  offerToBillingKind,
  type OfferId,
} from "@/lib/offers";
import { sendOfferDeliverableEmail } from "@/lib/offer-deliverable-email";
import { after } from "next/server";
import {
  attachReferralFromSession,
  findReferralByCustomerId,
  markReferralChurned,
  recordCommissionForInvoice,
  recordCommissionForStarter,
  voidCommissionsForCharge,
} from "@/lib/affiliate";
import { sendAffiliateCommissionEmail } from "@/lib/affiliate-email";
import { isUnlockSaasStripeEventOwned } from "@/lib/stripe-checkout-ownership";

// Node runtime is required: Stripe.webhooks.constructEvent uses Buffer + crypto.

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  const stripe = getStripe();
  try {
    event = stripe.webhooks.constructEvent(
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

  // This webhook is enabled account-wide on a Stripe account shared with other
  // products. Every subscribed platform event must prove UnlockSaaS ownership
  // before the idempotency write or any billing, email, analytics, or cache
  // side effect.
  if (!(await isUnlockSaasStripeEventOwned(event, stripe))) {
    return NextResponse.json({ received: true, ignored: "foreign_stripe_event" });
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
        // OTO chain branch ($97 Vault / $27 downsell / $297 lifetime). These
        // payments do NOT create or upgrade a profile – the user already
        // exists from the upstream Starter session. The OTO handler records
        // the billing_payments row, fires the deliverable email, and (for
        // lifetime) schedules the community grant.
        const otoOfferId = readOtoOfferIdFromSession(session);
        if (otoOfferId) {
          await handleOfferCheckoutCompleted(session, otoOfferId, event.id);
        } else {
          // BILLING: upsert profile, record Starter payment, send magic link.
          // Also schedules the Verified Builders community grant (Core only) via
          // after() so the 200 OK to Stripe is not held by Resend / Supabase
          // round-trips for the community email.
          await handleCheckoutSessionCompleted(session, event.id);
          // STARTER ORDER BUMP: when the $1 cart carried the +$27 Dream 100
          // bump line item, record the second billing_payments row and send
          // the deliverable email. Detection is via metadata.bump_included
          // stamped by the checkout API.
          await maybeHandleStarterBump(session);
        }
        // ATTRIBUTION + ANALYTICS side-channels (preserved unchanged).
        await recordIdentityAbConversion(session);
        await recordDiagnosticAttribution(session);
        await recordFoundingSeat(session);
        // AFFILIATE: attribute the visitor to a referrer (if metadata.ref_code
        // is present). For Starter (mode=payment) we also issue the one-shot
        // commission here, because no invoice will fire for the $1 OTO.
        await handleAffiliateAttribution(session);
        await capturePurchase(session);
        // FOLLOW-UP: short-circuit any active Cart Abandonment Recovery row
        // for this email so the cron stops chasing a paid customer.
        // strategy/follow-up-funnels.md Part 6 "recovery short-circuit."
        const completedEmail =
          session.customer_details?.email ?? session.customer_email ?? null;
        if (completedEmail) {
          await maybeShortCircuitRecovery(completedEmail, session.id);
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
        // Also schedules a safety-net community grant when this is the first
        // subscription invoice (catches checkout.session.completed drops).
        await handleInvoicePaymentSucceeded(invoice, event.id);
        // AFFILIATE: recurring rev-share. Resolves the referral by customer
        // id and writes a 50%-of-amount_paid commission row.
        await handleAffiliateCommissionForInvoice(invoice);
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
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpserted(sub);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        // BILLING: revoke Core tier per "drop to starter if owned, else none".
        // Also schedules the Verified Builders community revoke (records audit
        // row; manual operator removal from Discord/Skool is the v1 contract).
        await handleSubscriptionDeleted(sub, event.id);
        // AFFILIATE: stamp the referral as churned (kills the recurring rail).
        // Existing payable/paid commissions are NOT clawed back.
        const subCustomerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? null;
        if (subCustomerId) await markReferralChurned(subCustomerId);
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
        // AFFILIATE: void any pending/payable commissions tied to this charge.
        // Already-paid commissions are NOT clawed back automatically – Maryan
        // reconciles those manually via the dashboard if needed.
        if (charge.id) await voidCommissionsForCharge(charge.id);
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

  // Bust the cached /open transparency metrics so the next render reflects
  // this event. Two-arg form (Next 16): tag, then cacheLife profile. "max"
  // tells the cache layer this invalidation should outlive the default TTL.
  // Cheap: it just marks the tag stale; the next /open render rehydrates.
  // See app/src/lib/open-metrics.ts → cacheTag("open-metrics","billing-mutation").
  revalidateTag("billing-mutation", "max");

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
//      /playbook without ever choosing a password (Reluctant Hero: no friction).
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  eventId: string,
) {
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

  const profile = await upsertProfileByEmail({
    email,
    stripe_customer_id: stripeCustomerId,
    tier: isCore ? "core" : "starter",
    stripe_subscription_id: stripeSubscriptionId,
    subscription_status: isCore ? "active" : undefined,
    starter_purchased_at: isCore ? undefined : nowIso,
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

  // FUNNELFIXER WORKFLOW: Signal early exit for any FunnelFixer reengagement
  // workflow waiting on conversion. This is fire-and-forget; if the subscriber
  // is not in an active workflow, the resumeHook call is a no-op.
  await maybeSignalFunnelfixerConversion(email).catch((err) => {
    console.warn(
      `[stripe-webhook] funnelfixer conversion signal error for ${email}:`,
      err
    );
  });

  // Land the user where the Stripe success_url already pointed them:
  //   Starter (mode=payment)      → /oto → /playbook (auth-gated)
  //   Core    (mode=subscription) → /onboarding (auth-gated)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://unlocksaas.com";
  const next = isCore ? "/onboarding" : "/playbook";
  const redirectTo = `${appUrl}/auth/callback?next=${encodeURIComponent(next)}`;
  await inviteOrSignIn({ email, redirectTo });

  // VERIFIED BUILDERS ROOM: Core only. Scheduled via after() so the email +
  // audit writes don't hold the 200 OK to Stripe. Idempotent at the helper
  // level – safe if invoice.payment_succeeded later re-triggers the grant.
  if (isCore) {
    scheduleGrantForCheckout({
      profileId: profile.id,
      email: profile.email,
      stripeCustomerId,
      stripeEventId: eventId,
      source: "stripe_webhook",
    });
  }
}

// ── invoice.payment_succeeded ────────────────────────────────────────────────
//
// Fires once per successful subscription invoice. Two flavors:
//   - billing_reason='subscription_create' → first $49 charge → opens 60-day clock
//   - billing_reason='subscription_cycle'  → monthly renewal
//
// Per Hard Rule #4 of strategy/BUILD-PROMPT-CLAUDE-CODE.md: the guarantee is
// playbook-verifiable. profile.guarantee_expires_at is the single source of
// truth for refund eligibility windows (lib/guarantee.ts reads it).
async function handleInvoicePaymentSucceeded(
  invoice: Stripe.Invoice,
  eventId: string,
) {
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

  // VERIFIED BUILDERS ROOM: safety-net grant on first paid invoice. The grant
  // helper is idempotent, so if checkout.session.completed already fired the
  // grant this is a no-op. If the checkout event was dropped (Stripe retry
  // failure, network hiccup), this catches it.
  if (isFirstSubInvoice) {
    scheduleGrantForCheckout({
      profileId: ensuredProfile.id,
      email: ensuredProfile.email,
      stripeCustomerId: customerId,
      stripeEventId: eventId,
      source: "stripe_webhook",
    });
  }
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
async function handleSubscriptionDeleted(
  sub: Stripe.Subscription,
  eventId: string,
) {
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? null;
  if (!customerId) return;
  await applySubscriptionCanceled(customerId);

  // VERIFIED BUILDERS ROOM: schedule revoke (audit + profile stamp). Manual
  // platform removal from Discord/Skool is the operator's job per v1 contract.
  scheduleRevokeForCustomer({
    stripeCustomerId: customerId,
    stripeEventId: eventId,
    source: "stripe_webhook",
  });
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

// ── Post-Starter monetization stack (Brunson audit Action #4, 2026-05-21) ────
//
// Four extra offers wrap the existing $1 → $49 spine: a $27 order bump on the
// Starter cart, then a $97 → $27 → $297 OTO chain on the thank-you page.
// All four are env-gated via lib/offers.ts; absent env vars hide the offer.
//
// Webhook responsibilities for these payments:
//   - record a billing_payments row with kind=<offer id> (audit + AOV reports)
//   - dispatch the deliverable email (Notion/Drive link from env)
//   - for oto_lifetime: stamp profiles.community_lifetime_at + grant the room
//
// The OTO sessions DO NOT create or upgrade a profile – the user already
// exists from the upstream Starter session that triggered this OTO chain.

const OTO_OFFER_IDS = new Set<OfferId>([
  "oto_vault",
  "oto_downsell",
  "oto_lifetime",
]);

/**
 * Pull the OTO offer id off a Stripe session's metadata. Returns null when
 * the session is not an OTO purchase (Starter, Core, or external traffic).
 */
function readOtoOfferIdFromSession(
  session: Stripe.Checkout.Session,
): OfferId | null {
  const priceType = session.metadata?.price_type;
  if (typeof priceType !== "string") return null;
  if (OTO_OFFER_IDS.has(priceType as OfferId)) return priceType as OfferId;
  return null;
}

/**
 * Handle one of the three OTO checkout sessions. Idempotent at every step:
 *   - billing_payments has a UNIQUE on stripe_charge_id (replay-safe).
 *   - stampLifetimeOnProfile / grantCoreCommunityAccess are idempotent.
 *   - Deliverable email is fire-and-forget; double-sends are acceptable.
 */
async function handleOfferCheckoutCompleted(
  session: Stripe.Checkout.Session,
  offerId: OfferId,
  eventId: string,
) {
  const email =
    session.customer_details?.email ?? session.customer_email ?? null;
  if (!email) {
    console.warn(
      `[stripe-webhook] OTO session ${session.id} (${offerId}) has no email; skipping`,
    );
    return;
  }

  const stripeCustomerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id ?? null;
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  // Locate the existing profile. The upstream Starter session has already
  // upserted one. If for some reason we land here without a profile (cold
  // OTO traffic via a deep-link), we still record the payment under the
  // bare email so the audit trail is complete.
  const adminLoose = createAdminClient() as unknown as {
    from: (t: string) => {
      select: (cols: string) => {
        eq: (col: string, val: unknown) => {
          maybeSingle: () => Promise<{ data: { id?: string } | null }>;
        };
      };
    };
  };
  const { data: profileRow } = await adminLoose
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  const profileId = profileRow?.id ?? null;

  await recordPayment({
    profile_id: profileId,
    email,
    stripe_customer_id: stripeCustomerId,
    stripe_payment_intent_id: paymentIntentId,
    kind: offerToBillingKind(offerId) as PaymentKind,
    amount_cents: session.amount_total ?? OFFERS[offerId].priceCents,
    currency: session.currency ?? "usd",
    status: "paid",
    paid_at: new Date().toISOString(),
  }).catch((err) => {
    console.error(
      `[stripe-webhook] recordPayment failed for OTO ${offerId} (${session.id}):`,
      err instanceof Error ? err.message : err,
    );
  });

  // Lifetime OTO: grant the room.
  if (offerId === "oto_lifetime" && profileId) {
    scheduleLifetimeGrantForCheckout({
      profileId,
      email,
      stripeCustomerId,
      stripeEventId: eventId,
      source: "stripe_webhook",
    });
    // The community-invite email is sent by scheduleLifetimeGrantForCheckout
    // → grantCoreCommunityAccess. No separate deliverable email here.
    return;
  }

  // Vault + downsell: send the operator-pasted deliverable URL.
  if (offerId === "oto_vault" || offerId === "oto_downsell") {
    const url = getOfferDeliverableUrl(offerId);
    after(async () => {
      await sendOfferDeliverableEmail({
        to: email,
        offerId,
        deliverableUrl: url,
      });
    });
  }
}

/**
 * The Starter cart can carry a $27 order bump (Dream 100 + Cold Email
 * Library). It rides on the same Stripe session as the $1 Starter; we detect
 * it via metadata.bump_included stamped by the checkout API. On detection:
 *   - record a second billing_payments row with kind='starter_bump'
 *   - send the deliverable email with the Dream 100 URL
 */
async function maybeHandleStarterBump(session: Stripe.Checkout.Session) {
  if (session.mode !== "payment") return;
  if (session.metadata?.bump_included !== "true") return;
  const email =
    session.customer_details?.email ?? session.customer_email ?? null;
  if (!email) return;

  const offerId: OfferId = "starter_bump";
  const offer = OFFERS[offerId];
  const stripeCustomerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id ?? null;
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  // Look up the profile created by the parent Starter flow.
  const adminLoose = createAdminClient() as unknown as {
    from: (t: string) => {
      select: (cols: string) => {
        eq: (col: string, val: unknown) => {
          maybeSingle: () => Promise<{ data: { id?: string } | null }>;
        };
      };
    };
  };
  const { data: profileRow } = await adminLoose
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  const profileId = profileRow?.id ?? null;

  await recordPayment({
    profile_id: profileId,
    email,
    stripe_customer_id: stripeCustomerId,
    stripe_payment_intent_id: paymentIntentId,
    kind: offerToBillingKind(offerId) as PaymentKind,
    amount_cents: offer.priceCents,
    currency: session.currency ?? "usd",
    status: "paid",
    paid_at: new Date().toISOString(),
  }).catch((err) => {
    console.error(
      `[stripe-webhook] recordPayment failed for starter_bump (${session.id}):`,
      err instanceof Error ? err.message : err,
    );
  });

  const url = getOfferDeliverableUrl(offerId);
  after(async () => {
    await sendOfferDeliverableEmail({
      to: email,
      offerId,
      deliverableUrl: url,
    });
  });
}

// ── Conversion capture for PostHog (the events brunson-funnel-metrics needs) ──
//
// On checkout.session.completed we fire ONE of:
//   - StarterPurchased (mode === "payment")
//   - PlaybookSubscribed (mode === "subscription")
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

  const distinctId = stripeDistinctId(
    customerId,
    supabaseUserId,
    session.client_reference_id,
  );

  // OTO branch: pick the dedicated *Purchased event so funnel reports can
  // see the AOV stack without untangling starter_purchased from oto rows.
  const otoOfferId = readOtoOfferIdFromSession(session);
  const isSubscription = session.mode === "subscription";

  let eventName: typeof Event[keyof typeof Event];
  let priceTypeLabel: string;
  if (otoOfferId === "oto_vault") {
    eventName = Event.OtoVaultPurchased;
    priceTypeLabel = "oto_vault";
  } else if (otoOfferId === "oto_downsell") {
    eventName = Event.OtoDownsellPurchased;
    priceTypeLabel = "oto_downsell";
  } else if (otoOfferId === "oto_lifetime") {
    eventName = Event.OtoLifetimePurchased;
    priceTypeLabel = "oto_lifetime";
  } else if (isSubscription) {
    eventName = Event.PlaybookSubscribed;
    priceTypeLabel = "playbook";
  } else {
    eventName = Event.StarterPurchased;
    priceTypeLabel = "starter";
  }

  await captureServerAndFlush(distinctId, eventName, {
    price_type: priceTypeLabel,
    stripe_customer_id: customerId,
    stripe_session_id: session.id,
    amount_cents: session.amount_total ?? null,
    currency: session.currency ?? null,
    parent_session_id: session.metadata?.parent_session_id ?? null,
  });

  // Order bump add-on lights up alongside the Starter purchase. Two events
  // fire from the same session so the operator can group bump revenue
  // against the parent Starter cart trivially.
  if (
    !otoOfferId &&
    !isSubscription &&
    session.metadata?.bump_included === "true"
  ) {
    await captureServerAndFlush(distinctId, Event.StarterBumpPurchased, {
      price_type: "starter_bump",
      stripe_customer_id: customerId,
      stripe_session_id: session.id,
      currency: session.currency ?? null,
    });
  }
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
// via Playbook Step 7 onboarding (Sprint 3) — until that ships, this handler
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
  // OTO sessions ride the same A/B cookie but they're not the first-touch
  // conversion – they're downstream of an already-attributed Starter or
  // Core session. Skip them so variant conversion rates count the original
  // cart, not the OTO chain that follows.
  if (readOtoOfferIdFromSession(session)) return;

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
//   2. Current seat count must be < 100.
//   3. The DB unique index on founding_cohort.seat_number provides the final
//      race protection — the second of two concurrent 100th claims fails cleanly
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

// ── Affiliate program: attribution + commissions ─────────────────────────────
//
// When session.metadata.ref_code is present, attribute the referral and (for
// Starter checkouts only) issue the one-shot commission. Core checkouts get
// their commission rows on the recurring invoice.payment_succeeded event so
// month-over-month rev share works without any extra plumbing.
//
// All errors are logged + swallowed. An affiliate-tracking miss must never
// block the billing webhook from returning 200 to Stripe.
async function handleAffiliateAttribution(session: Stripe.Checkout.Session) {
  try {
    const result = await attachReferralFromSession(session);
    if (!result) return;

    // Starter (mode=payment) gets its commission here — there's no invoice
    // event for the $1 OTO. Core checkouts wait for invoice.payment_succeeded
    // (where billing_reason='subscription_create' fires the same flow as
    // monthly renewals).
    if (session.mode !== "payment") return;

    // Resolve the affiliate's snapshot percentage for this commission. We
    // re-read it here (vs. plumbing it through) so the snapshot reflects the
    // value at commission-issue time, not at referral-create time.
    const admin = createAdminClient();
    const looseAdmin = admin as unknown as { from: (t: string) => any };
    const { data: affRow } = await looseAdmin
      .from("affiliates")
      .select("rev_share_pct,rev_share_floor_pct")
      .eq("id", result.affiliateId)
      .maybeSingle();
    const pct = (affRow?.rev_share_pct as number | undefined) ?? 50;

    const inserted = await recordCommissionForStarter({
      session,
      referralId: result.referralId,
      affiliateId: result.affiliateId,
      revSharePctSnapshot: pct,
    });

    if (inserted) {
      await notifyAffiliateOfCommission(result.affiliateId, {
        kind: "starter",
        gross_amount_cents: session.amount_total ?? 0,
        commission_cents: Math.round(
          ((session.amount_total ?? 0) * pct) / 100,
        ),
      });
    }
  } catch (err) {
    console.error(
      `[affiliate] attribution failed for session ${session.id}:`,
      err instanceof Error ? err.message : err,
    );
  }
}

async function handleAffiliateCommissionForInvoice(invoice: Stripe.Invoice) {
  try {
    const customerId =
      typeof invoice.customer === "string"
        ? invoice.customer
        : invoice.customer?.id ?? null;
    if (!customerId) return;

    const referral = await findReferralByCustomerId(customerId);
    if (!referral) return;
    // 'churned' referrals shouldn't generate new commissions — they still
    // see historical earnings on the dashboard, but no new rows accrue.
    if (referral.status === "churned") return;

    const pct = referral.rev_share_pct;
    const inserted = await recordCommissionForInvoice({
      invoice,
      referralId: referral.id,
      affiliateId: referral.affiliate_id,
      revSharePctSnapshot: pct,
    });

    if (inserted && invoice.amount_paid && invoice.amount_paid > 0) {
      await notifyAffiliateOfCommission(referral.affiliate_id, {
        kind:
          invoice.billing_reason === "subscription_create"
            ? "core_initial"
            : "core_renewal",
        gross_amount_cents: invoice.amount_paid,
        commission_cents: Math.round((invoice.amount_paid * pct) / 100),
      });
    }
  } catch (err) {
    console.error(
      `[affiliate] commission failed for invoice ${invoice.id}:`,
      err instanceof Error ? err.message : err,
    );
  }
}

/**
 * Fire the "you just earned $X" email. Best-effort: a Resend failure is
 * logged but never bubbled up – the commission is already in the DB.
 *
 * Throttled to first commission of the day (cheap on-Resend; we deduplicate
 * via affiliate_clicks + commission count). For v1 we send every time
 * (Maryan can mute via Resend audience preferences). Tighten later if noisy.
 */
async function notifyAffiliateOfCommission(
  affiliateId: string,
  commission: {
    kind: "starter" | "core_initial" | "core_renewal" | "other";
    gross_amount_cents: number;
    commission_cents: number;
  },
) {
  try {
    const admin = createAdminClient();
    const looseAdmin = admin as unknown as { from: (t: string) => any };
    const { data: row } = await looseAdmin
      .from("affiliates")
      .select(
        `id,payout_email,
         profile:profiles!inner(email,builder_name)`,
      )
      .eq("id", affiliateId)
      .maybeSingle();

    if (!row) return;
    const profile = row.profile as { email?: string; builder_name?: string | null };
    const to =
      (row.payout_email as string | null) ??
      (profile?.email ?? null);
    if (!to) return;

    await sendAffiliateCommissionEmail({
      to,
      builderName: profile?.builder_name ?? null,
      kind: commission.kind,
      grossAmountCents: commission.gross_amount_cents,
      commissionCents: commission.commission_cents,
    });
  } catch (err) {
    console.error(
      `[affiliate] notify email failed for ${affiliateId}:`,
      err instanceof Error ? err.message : err,
    );
  }
}

// ── FunnelFixer reengagement workflow integration ────────────────────────────
//
// When a FunnelFixer subscriber completes a checkout (converts), signal the
// reengagement workflow to exit early. The workflow can skip the grace period
// and testimonial offer since the user is now a paying customer.
//
// This is a best-effort async operation; failures don't block the checkout
// completion. The function queries for a matching FunnelFixer subscriber by
// email and calls the /api/workflow/funnelfixer/graduate endpoint.
async function maybeSignalFunnelfixerConversion(email: string) {
  const supabase = createAdminClient();

  // Check if this email is in the FunnelFixer cohort (source ILIKE 'funnelfixer_%')
  // and has an active workflow (status = 'active' or 'paused').
  const { data: rows, error } = await supabase
    .from("soap_opera_subscribers")
    .select("id")
    .eq("email", email)
    .ilike("source", "funnelfixer_%")
    .in("status", ["paused", "active"])
    .limit(1);

  if (error) {
    console.warn("[stripe-webhook] funnelfixer lookup error:", error.message);
    return;
  }

  if (!rows || rows.length === 0) {
    // Not a FunnelFixer subscriber, or already completed/bounced.
    return;
  }

  const subscriberId = rows[0].id;

  // Call the graduate endpoint to resume the converted hook.
  // This is fire-and-forget; if the hook isn't active, it's a no-op.
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://unlocksaas.com";
    const response = await fetch(
      `${baseUrl}/api/workflow/funnelfixer/graduate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriberId,
          convertedAt: new Date().toISOString(),
        }),
      }
    );

    if (!response.ok) {
      console.warn(
        "[stripe-webhook] funnelfixer-graduate failed:",
        response.status,
        response.statusText
      );
      return;
    }

    console.log("[stripe-webhook] funnelfixer-converted hook resumed", {
      subscriberId,
      email,
    });
  } catch (err) {
    console.warn(
      "[stripe-webhook] funnelfixer-graduate fetch error:",
      err instanceof Error ? err.message : err
    );
  }
}
