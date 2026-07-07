import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getStripe } from "@/lib/stripe";
import { checkBotId } from "botid/server";
import {
  IDENTITY_AB_KEY,
  readIdentityFromCookies,
  readSubjectFromCookies,
} from "@/lib/ab";
import { REF_COOKIE } from "@/lib/affiliate";
import { captureServer } from "@/lib/analytics/server";
import { Event } from "@/lib/analytics/events";
import { getOfferPriceId, type OfferId } from "@/lib/offers";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * priceType values:
 *   starter            – $1 SLO (mode=payment); optional `bump` flag attaches
 *                        the $27 Dream 100 bump as a second line item.
 *   playbook           – $49/mo Core (mode=subscription).
 *   oto_vault          – $97 Founder's Diary Vault OTO (mode=payment).
 *   oto_downsell       – $27 Cold Email Library downsell (mode=payment).
 *   oto_lifetime       – $297 lifetime Verified Builders OTO (mode=payment).
 *
 * Each OTO price type is gated by an env var (see lib/offers.ts). When the env
 * var is unset we return 503 with a sane error code so the client can fall
 * through to the decline path. This keeps the four extra offers behind an
 * operator opt-in: ship the PR, paste the price ids later.
 */
type CheckoutPriceType =
  | "starter"
  | "playbook"
  | "oto_vault"
  | "oto_downsell"
  | "oto_lifetime";

type CheckoutBody = {
  priceType?: string;
  /** Order bump on /starter. Ignored for any other priceType. */
  bump?: boolean;
  /**
   * Forwarded onto the Stripe session metadata so the webhook can stitch a
   * post-Starter OTO purchase back to the original $1 session for the AOV
   * report. Set by /oto/vault, /oto/cold-emails, /oto/lifetime pages.
   */
  parentSessionId?: string;
  attribution?: {
    from?: string;
    label?: string;
    // Brunson Survey Funnel bucket (DCS Secret 15). See app/src/lib/diagnostic.ts.
    bucket?: string;
    lead?: string;
  } | null;
};

// Stripe metadata only accepts string values up to 500 chars. Coerce + clamp.
function clampMeta(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const s = v.trim();
  if (!s) return undefined;
  return s.length > 500 ? s.slice(0, 500) : s;
}

/**
 * Map an OTO priceType to the offer id used in lib/offers.ts. Centralised so
 * the webhook can use the same mapping when it stamps billing_payments.kind.
 */
const OTO_PRICE_TYPE_TO_OFFER: Record<string, OfferId> = {
  oto_vault: "oto_vault",
  oto_downsell: "oto_downsell",
  oto_lifetime: "oto_lifetime",
};

export async function POST(req: NextRequest) {
  // Rate limit: 10 checkout attempts per IP per 60s. Prevents card-testing
  // bursts even if BotID is bypassed or fail-opens.
  const rl = checkRateLimit(req, {
    limit: 10,
    windowMs: 60_000,
    keyPrefix: "checkout",
  });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  // BotID protection: blocks confirmed bot traffic (card-testing prevention).
  // Fail-open: any verification error lets the request through so a BotID
  // outage never blocks a legitimate checkout.
  try {
    const botCheck = await checkBotId();
    if (botCheck.isBot) {
      return NextResponse.json({ error: "bot_detected" }, { status: 403 });
    }
  } catch (err) {
    console.warn("[botid] checkout verification failed, proceeding fail-open", err);
  }

  const { priceType, attribution, bump, parentSessionId } =
    (await req.json()) as CheckoutBody;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Stamp the A/B identity variant + subject onto the Stripe session so the
  // webhook can attribute the purchase back to the variant when it fires
  // checkout.session.completed. Cookies are sticky for a year via middleware.
  const abVariant = await readIdentityFromCookies();
  const abSubject = await readSubjectFromCookies() ?? "";
  const abMetadata: Record<string, string> = {
    ab_key: IDENTITY_AB_KEY,
    ab_variant: abVariant,
    ab_subject: abSubject,
  };

  // Diagnostic → Starter attribution. The webhook reads `diagnostic_lead_id`
  // off checkout.session.completed and stamps converted_to_starter_at on the
  // matching diagnostic_leads row.
  const diagnosticFrom = clampMeta(attribution?.from);
  const diagnosticLabel = clampMeta(attribution?.label);
  const diagnosticBucket = clampMeta(attribution?.bucket);
  const diagnosticLeadId = clampMeta(attribution?.lead);
  if (diagnosticFrom) abMetadata.attribution_from = diagnosticFrom;
  if (diagnosticLabel) abMetadata.diagnostic_label = diagnosticLabel;
  if (diagnosticBucket) abMetadata.diagnostic_bucket = diagnosticBucket;
  if (diagnosticLeadId && /^[0-9a-f-]{36}$/i.test(diagnosticLeadId)) {
    abMetadata.diagnostic_lead_id = diagnosticLeadId;
  }

  // OTO chain: stitch each session back to the original $1 Starter session so
  // the operator can run "AOV per Starter cart" reports without a manual join.
  const parentSessionMeta = clampMeta(parentSessionId);
  if (parentSessionMeta && /^cs_[a-zA-Z0-9_]+$/.test(parentSessionMeta)) {
    abMetadata.parent_session_id = parentSessionMeta;
  }

  // Affiliate attribution: read the unlocksaas_ref cookie set by /r/<code> (or
  // the proxy's ?ref= capture). The webhook's checkout.session.completed
  // handler looks for metadata.ref_code, resolves the affiliate, and writes
  // the affiliate_referrals + affiliate_commissions rows. Validation is
  // permissive – the webhook is the source of truth and silently ignores
  // unknown codes.
  try {
    const cookieStore = await cookies();
    const refCookie = cookieStore.get(REF_COOKIE)?.value;
    if (refCookie && /^[a-z0-9]{6,16}$/i.test(refCookie)) {
      abMetadata.ref_code = refCookie.toLowerCase();
    }
  } catch (err) {
    // Cookie read failure is non-fatal – proceed with the checkout.
    console.warn(
      "[checkout] could not read ref cookie:",
      err instanceof Error ? err.message : err,
    );
  }
  // Price type stamped in Stripe metadata so the Cart Abandonment Recovery
  // cadence can branch its copy on `checkout.session.expired` events. See
  // app/src/lib/cart-recovery/subscribe.ts.
  if (
    priceType === "starter" ||
    priceType === "playbook" ||
    priceType === "oto_vault" ||
    priceType === "oto_downsell" ||
    priceType === "oto_lifetime"
  ) {
    abMetadata.price_type = priceType;
  }

  // Distinct id for server-side analytics. At checkout-time we don't have a
  // Stripe customer id yet (Stripe assigns one at session completion), so we
  // fall back to the A/B subject cookie if present. This lets PostHog stitch
  // the pre-purchase click events with the post-purchase webhook events when
  // the cookie matches.
  const distinctId = abSubject || "anonymous";

  try {
    if (priceType === "starter") {
      // Resolve the order bump price id if the bump checkbox was set AND the
      // env var is configured. Silent fallback to no-bump if the operator
      // hasn't pasted the price id yet – the checkbox on the page is gated by
      // the same env check via /api/offers/availability.
      const bumpPriceId = bump ? getOfferPriceId("starter_bump") : null;
      const lineItems: { price: string; quantity: number }[] = [
        { price: process.env.STRIPE_STARTER_PRICE_ID!, quantity: 1 },
      ];
      if (bumpPriceId) {
        lineItems.push({ price: bumpPriceId, quantity: 1 });
        abMetadata.bump_included = "true";
      }

      const session = await getStripe().checkout.sessions.create({
        mode: "payment",
        line_items: lineItems,
        // Brunson "always-keep-them-in-the-funnel" rule: every Stripe success
        // returns to the next OTO. /oto is the first OTO ($49 Playbook spine).
        success_url: `${appUrl}/oto?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/starter`,
        metadata: abMetadata,
        payment_intent_data: { metadata: abMetadata },
        allow_promotion_codes: false,
      });

      // Server-side mirror of the click. Useful when the browser event was
      // blocked by a tracker-disabler — the funnel-metrics report still sees
      // the checkout intent.
      captureServer(distinctId, Event.CheckoutSessionCreated, {
        price_type: "starter",
        stripe_session_id: session.id,
        bump_included: bumpPriceId ? "true" : "false",
        ...abMetadata,
      });

      return NextResponse.json({ url: session.url });
    }

    if (priceType === "playbook") {
      const session = await getStripe().checkout.sessions.create({
        mode: "subscription",
        line_items: [
          {
            price: process.env.STRIPE_MACHINE_PRICE_ID!,
            quantity: 1,
          },
        ],
        // Core lands in /onboarding (clock, Starter carryover, Stripe Connect).
        // The user advances to /playbook from there. session_id is preserved so
        // /onboarding can show a "processing" banner while the webhook catches up.
        success_url: `${appUrl}/onboarding?session_id={CHECKOUT_SESSION_ID}`,
        // Cancel on the upgrade page → return them to the next OTO in the
        // chain, not back to /oto. Brunson rule: once they decline the spine,
        // keep moving down the ladder, never spin them on the same page.
        cancel_url: `${appUrl}/oto/vault`,
        metadata: abMetadata,
        subscription_data: { metadata: abMetadata },
      });

      captureServer(distinctId, Event.CheckoutSessionCreated, {
        price_type: "playbook",
        stripe_session_id: session.id,
        ...abMetadata,
      });

      return NextResponse.json({ url: session.url });
    }

    // OTO chain (vault → downsell → lifetime). Each is a one-time PaymentIntent
    // session that returns to the *next* OTO on success, and to the next OTO
    // on cancel as well – the chain never branches back upstream.
    if (
      priceType === "oto_vault" ||
      priceType === "oto_downsell" ||
      priceType === "oto_lifetime"
    ) {
      const offerId = OTO_PRICE_TYPE_TO_OFFER[priceType];
      const priceId = getOfferPriceId(offerId);
      if (!priceId) {
        // Env var unset – the operator hasn't created the Stripe product yet.
        // Tell the client cleanly so the page can route them to the next step
        // without showing a Stripe error screen.
        return NextResponse.json(
          { error: "offer_disabled", offerId },
          { status: 503 },
        );
      }

      // Per-OTO routing. Success lands on the NEXT offer in the chain so the
      // visitor always sees one more screen before /welcome. Decline buttons
      // on each page also navigate forward to the same next-step URL.
      const nextStep: Record<typeof priceType, { success: string; cancel: string }> = {
        oto_vault: {
          success: `${appUrl}/oto/lifetime?session_id={CHECKOUT_SESSION_ID}&from=vault`,
          cancel: `${appUrl}/oto/cold-emails`,
        },
        oto_downsell: {
          success: `${appUrl}/oto/lifetime?session_id={CHECKOUT_SESSION_ID}&from=downsell`,
          cancel: `${appUrl}/oto/lifetime`,
        },
        oto_lifetime: {
          success: `${appUrl}/welcome?path=lifetime&session_id={CHECKOUT_SESSION_ID}`,
          cancel: `${appUrl}/welcome?path=starter_only`,
        },
      };

      abMetadata.offer_id = offerId;

      const session = await getStripe().checkout.sessions.create({
        mode: "payment",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: nextStep[priceType].success,
        cancel_url: nextStep[priceType].cancel,
        metadata: abMetadata,
        payment_intent_data: { metadata: abMetadata },
        // No promotion codes on the OTO chain – the price IS the offer.
        allow_promotion_codes: false,
      });

      captureServer(distinctId, Event.CheckoutSessionCreated, {
        price_type: priceType,
        stripe_session_id: session.id,
        offer_id: offerId,
        ...abMetadata,
      });

      return NextResponse.json({ url: session.url });
    }

    return NextResponse.json({ error: "Invalid price type" }, { status: 400 });
  } catch (err) {
    // Don't swallow — the browser shows a stuck spinner if we 200 with no url.
    // Log so the failure shows up in Vercel runtime logs alongside whatever
    // Stripe returned, and surface a generic 5xx to the client.
    const message = err instanceof Error ? err.message : "unknown_error";
    // eslint-disable-next-line no-console
    console.error("[checkout] Stripe session create failed:", message, {
      price_type: priceType,
      distinct_id: distinctId,
    });
    // Fire-and-forget — the route is about to return, but the next request to
    // this same function instance will flush the queue.
    captureServer(distinctId, Event.CheckoutSessionCreated, {
      price_type: priceType,
      error: message,
    });
    return NextResponse.json(
      { error: "Could not open checkout. Try again in a minute." },
      { status: 502 },
    );
  }
}
