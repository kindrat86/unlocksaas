import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import {
  IDENTITY_AB_KEY,
  readIdentityFromCookies,
  readSubjectFromCookies,
} from "@/lib/ab";
import {
  StackLayer,
  readStackSubjectFromCookies,
  readStackEntryFromCookies,
  readStackCurrentFromCookies,
  readStackPathFromCookies,
  readAffiliateFromCookies,
  stackStripeStamp,
  pickStackSubjectId,
} from "@/lib/stack-attribution";
import { captureServer } from "@/lib/analytics/server";
import { Event } from "@/lib/analytics/events";
import {
  ORDER_FORM_BUMP,
  isKnownBumpId,
  outreachKitPriceId,
  type BumpId,
} from "@/lib/playbook";

type CheckoutBody = {
  priceType?: string;
  attribution?: {
    from?: string;
    label?: string;
    // Brunson Survey Funnel bucket (DCS Secret 15). See app/src/lib/diagnostic.ts.
    bucket?: string;
    lead?: string;
  } | null;
  /**
   * Order-form bumps the buyer ticked on /starter. Brunson DCS Secret #17 §3.
   * The server is authoritative: an unknown bump id is dropped silently; a
   * known bump with no STRIPE_*_PRICE_ID env var is dropped silently (with a
   * console.warn) so the primary $1 purchase still succeeds and never strands
   * a checked checkbox without delivery.
   */
  bumps?: string[];
};

// Stripe metadata only accepts string values up to 500 chars. Coerce + clamp.
function clampMeta(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const s = v.trim();
  if (!s) return undefined;
  return s.length > 500 ? s.slice(0, 500) : s;
}

export async function POST(req: NextRequest) {
  const { priceType, attribution, bumps } = (await req.json()) as CheckoutBody;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Resolve order-form bumps. Whitelisted server-side against KNOWN_BUMP_IDS,
  // then each surviving bump must also have a configured Stripe price id;
  // missing price ids are warned-and-dropped (the buyer still gets the $1
  // Playbook; the checked checkbox is honored on next visit when env lands).
  const requestedBumpIds: BumpId[] = Array.isArray(bumps)
    ? bumps.filter(isKnownBumpId)
    : [];
  const resolvedBumps: { id: BumpId; priceId: string }[] = [];
  for (const id of requestedBumpIds) {
    if (id === ORDER_FORM_BUMP.id) {
      const priceId = outreachKitPriceId();
      if (priceId) {
        resolvedBumps.push({ id, priceId });
      } else {
        // eslint-disable-next-line no-console
        console.warn(
          "[checkout] outreach_kit bump requested but STRIPE_OUTREACH_KIT_PRICE_ID is not set — dropping line item; primary $1 purchase will still proceed",
        );
      }
    }
  }
  const bumpIdsStamped = resolvedBumps.map((b) => b.id).join(",");

  // Stamp the A/B identity variant + subject onto the Stripe session so the
  // webhook can attribute the purchase back to the variant when it fires
  // checkout.session.completed. Cookies are sticky for a year via middleware.
  const abVariant = readIdentityFromCookies();
  const abSubject = readSubjectFromCookies() ?? "";
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
  // Price type stamped in Stripe metadata so the Cart Abandonment Recovery
  // cadence can branch its copy on `checkout.session.expired` events. See
  // app/src/lib/cart-recovery/subscribe.ts.
  if (priceType === "starter" || priceType === "machine") {
    abMetadata.price_type = priceType;
  }

  // Stamp the resolved bump ids onto Stripe session metadata so the webhook
  // can provision them on `checkout.session.completed` without re-deriving
  // from line items. Empty string = no bumps (still set the key so the
  // webhook's read is non-conditional).
  abMetadata.order_bumps = bumpIdsStamped;

  // ── Funnel Stack (DotCom Secrets Secret #27) ───────────────────────────
  //
  // Cross-funnel attribution: stamp the eight-layer stack path onto Stripe
  // session.metadata so the webhook can attribute the conversion to a full
  // visitor path (e.g. ATTENTION → DIAGNOSIS → STARTER → CORE) even when
  // cookies expired or the visitor cleared them.
  //
  // The stack stamp is joined with — not a replacement for — the existing
  // A/B + diagnostic stamps. Both are needed: A/B answers "which variant
  // won", stack answers "which path got them there".
  //
  // Cookies are written sticky in src/middleware.ts; this reads them.
  // Defensive fallback: if the subject cookie is missing (visitor blocked
  // cookies entirely), generate a one-shot subject so the row at least has
  // a primary key. Subsequent requests by the same blocked visitor will get
  // a different one — that's a known property of cookie-less attribution.
  const stackSubject = readStackSubjectFromCookies() ?? pickStackSubjectId();
  const stackEntry = readStackEntryFromCookies() ?? StackLayer.ATTENTION;
  const stackCurrent = readStackCurrentFromCookies() ?? stackEntry;
  const stackPath = readStackPathFromCookies();
  const affiliate = readAffiliateFromCookies();
  const layerPurchased =
    priceType === "starter" ? StackLayer.STARTER : StackLayer.CORE;
  const stackStamp = stackStripeStamp({
    subject: stackSubject,
    entry: stackEntry,
    current: stackCurrent,
    path: stackPath.length > 0 ? stackPath : [stackEntry],
    layerPurchased,
    affiliate,
  });
  Object.assign(abMetadata, stackStamp);

  // Distinct id for server-side analytics. At checkout-time we don't have a
  // Stripe customer id yet (Stripe assigns one at session completion), so we
  // fall back to the A/B subject cookie if present. This lets PostHog stitch
  // the pre-purchase click events with the post-purchase webhook events when
  // the cookie matches.
  const distinctId = abSubject || "anonymous";

  try {
    if (priceType === "starter") {
      // Build the line_items array: primary $1 Starter + resolved bumps.
      // Brunson DCS Secret #17 §3: the bump is a SEPARATE line item, not a
      // tier of the primary product. This way Stripe surfaces the bump as
      // its own row in the receipt — the buyer sees what they bought.
      // Type is inferred from the Stripe SDK call site; an explicit annotation
      // hits a namespace-export quirk in the bundled @types/stripe build.
      const lineItems = [
        {
          price: process.env.STRIPE_STARTER_PRICE_ID!,
          quantity: 1,
        },
        ...resolvedBumps.map((b) => ({ price: b.priceId, quantity: 1 })),
      ];

      const session = await getStripe().checkout.sessions.create({
        mode: "payment",
        line_items: lineItems,
        success_url: `${appUrl}/oto?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/starter`,
        metadata: abMetadata,
        payment_intent_data: { metadata: abMetadata },
      });

      // Server-side mirror of the click. Useful when the browser event was
      // blocked by a tracker-disabler — the funnel-metrics report still sees
      // the checkout intent.
      captureServer(distinctId, Event.CheckoutSessionCreated, {
        price_type: "starter",
        stripe_session_id: session.id,
        order_bumps: bumpIdsStamped,
        ...abMetadata,
      });

      return NextResponse.json({ url: session.url });
    }

    if (priceType === "machine") {
      const session = await getStripe().checkout.sessions.create({
        mode: "subscription",
        line_items: [
          {
            price: process.env.STRIPE_MACHINE_PRICE_ID!,
            quantity: 1,
          },
        ],
        // Core lands in /onboarding (clock, Starter carryover, Stripe Connect).
        // The user advances to /machine from there. session_id is preserved so
        // /onboarding can show a "processing" banner while the webhook catches up.
        success_url: `${appUrl}/onboarding?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/oto`,
        metadata: abMetadata,
        subscription_data: { metadata: abMetadata },
      });

      captureServer(distinctId, Event.CheckoutSessionCreated, {
        price_type: "machine",
        stripe_session_id: session.id,
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

