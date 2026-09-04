import type Stripe from "stripe";

export const UNLOCKSAAS_OWNED_PRODUCT_IDS = new Set([
  "prod_UWtaOvavCvalmm",
  "prod_UWtacLp86YrSuO",
]);

export const UNLOCKSAAS_OWNED_PRICE_IDS = new Set([
  "price_1TXpnoCwGoUDklReXiTaUUCi",
  "price_1TXpnmCwGoUDklRePhZmxviJ",
  // 2026-09-03 founding cart (recon unlocksaas-p0-recon-20260904.json):
  // EUR Core price on prod_UWtaOvavCvalmm via payment link
  // plink_1UBaMxCwGoUDklReKP5eVcWq. Without this, invoice/subscription events
  // for founding buyers classify as foreign and provisioning never runs.
  "price_1UBaL2CwGoUDklReihT2UVxY",
]);

export const UNLOCKSAAS_OWNED_PAYMENT_LINK_IDS = new Set([
  "plink_1TvFegCwGoUDklReGrnRlKVj",
  // 2026-09-03 founding cart payment link (adaptive EUR Core checkout whose
  // after_completion redirects to unlocksaas.com/onboarding).
  "plink_1UBaMxCwGoUDklReKP5eVcWq",
]);

// Payment Links can be rotated from the Stripe dashboard without a deploy
// (the 2026-09-03 cart swap proved this). Allowlist extension via env so an
// operator can bless a new link immediately instead of shipping a commit
// while a live cart is dropping events. Mirrors CHECKOUT_PRICE_ENV_VARS.
const CHECKOUT_PAYMENT_LINK_ENV_VARS = [
  "STRIPE_OWNED_PAYMENT_LINK_IDS",
] as const;

const CHECKOUT_PRICE_ENV_VARS = [
  "STRIPE_STARTER_PRICE_ID",
  "STRIPE_MACHINE_PRICE_ID",
  "STRIPE_BUMP_DREAM100_PRICE_ID",
  "STRIPE_OTO_VAULT_PRICE_ID",
  "STRIPE_OTO_DOWNSELL_PRICE_ID",
  "STRIPE_OTO_LIFETIME_PRICE_ID",
] as const;

type StripeResourceLine = {
  price?:
    | string
    | {
        id?: string | null;
        product?: string | { id?: string | null } | null;
      }
    | null;
  pricing?: {
    price_details?: {
      price?: string | null;
      product?: string | null;
    } | null;
  } | null;
};

type CheckoutSessionWithLineItems = Pick<
  Stripe.Checkout.Session,
  "metadata" | "payment_link"
> & {
  id?: string;
  line_items?: {
    data?: StripeResourceLine[] | null;
    has_more?: boolean;
  } | null;
};

type StripeOwnershipEvent = {
  type: string;
  data: { object: unknown };
};

type StripeOwnershipReader = {
  checkout?: {
    sessions?: Partial<
      Pick<Stripe["checkout"]["sessions"], "retrieve" | "list">
    >;
  };
  invoices?: Partial<Pick<Stripe["invoices"], "retrieve">>;
  subscriptions?: Partial<Pick<Stripe["subscriptions"], "retrieve">>;
};

function configuredPriceIds(): Set<string> {
  const ids = new Set(UNLOCKSAAS_OWNED_PRICE_IDS);
  for (const envVar of CHECKOUT_PRICE_ENV_VARS) {
    const value = process.env[envVar]?.trim();
    if (value?.startsWith("price_")) ids.add(value);
  }
  return ids;
}

function configuredPaymentLinkIds(): Set<string> {
  const ids = new Set(UNLOCKSAAS_OWNED_PAYMENT_LINK_IDS);
  for (const envVar of CHECKOUT_PAYMENT_LINK_ENV_VARS) {
    const raw = process.env[envVar]?.trim();
    if (!raw) continue;
    for (const value of raw.split(",")) {
      const id = value.trim();
      if (id.startsWith("plink_")) ids.add(id);
    }
  }
  return ids;
}

function resourceId(value: string | { id?: string | null } | null | undefined) {
  return typeof value === "string" ? value : value?.id ?? null;
}

function lineOwnership(
  line: StripeResourceLine,
  priceIds = configuredPriceIds()
): boolean | null {
  const price = line.price;
  const priceId =
    resourceId(price) ?? line.pricing?.price_details?.price ?? null;
  const productId =
    (typeof price === "object" && price !== null
      ? resourceId(price.product)
      : null) ??
    line.pricing?.price_details?.product ??
    null;
  if (!priceId && !productId) return null;
  return (
    (priceId !== null && priceIds.has(priceId)) ||
    (productId !== null && UNLOCKSAAS_OWNED_PRODUCT_IDS.has(productId))
  );
}

function allLinesAreOwned(
  lines: StripeResourceLine[] | null | undefined,
  hasMore = false
) {
  if (hasMore) return false;
  if (!lines?.length) return false;
  const decisions = lines.map((line) => lineOwnership(line));
  return decisions.every((decision) => decision === true);
}

/**
 * Payment Link identity is authoritative. Dynamic sessions have no Payment
 * Link and must carry at least one line item whose exact price or product is
 * owned by UnlockSaaS. Metadata and amount never establish ownership.
 */
export function isUnlockSaasCheckoutSession(
  session: CheckoutSessionWithLineItems
): boolean {
  const paymentLinkId = resourceId(session.payment_link);
  if (paymentLinkId) {
    return configuredPaymentLinkIds().has(paymentLinkId);
  }
  return allLinesAreOwned(
    session.line_items?.data,
    session.line_items?.has_more === true
  );
}

function objectId(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id;
    return typeof id === "string" ? id : null;
  }
  return null;
}

function linesFrom(object: unknown, key: "lines" | "items") {
  if (!object || typeof object !== "object") return undefined;
  const collection = (object as Record<string, unknown>)[key];
  if (!collection || typeof collection !== "object") return undefined;
  const data = (collection as { data?: unknown }).data;
  return Array.isArray(data) ? (data as StripeResourceLine[]) : undefined;
}

function collectionHasMore(object: unknown, key: "lines" | "items") {
  if (!object || typeof object !== "object") return false;
  const collection = (object as Record<string, unknown>)[key];
  if (!collection || typeof collection !== "object") return false;
  return (collection as { has_more?: unknown }).has_more === true;
}

async function checkoutIsOwned(
  object: unknown,
  stripe: StripeOwnershipReader
): Promise<boolean> {
  if (!object || typeof object !== "object") return false;
  let session = object as CheckoutSessionWithLineItems;
  const paymentLinkId = resourceId(session.payment_link);
  if (paymentLinkId)
    return configuredPaymentLinkIds().has(paymentLinkId);
  if (
    allLinesAreOwned(
      session.line_items?.data,
      session.line_items?.has_more === true
    )
  )
    return true;
  if (!session.id || !stripe.checkout?.sessions?.retrieve) return false;
  session = (await stripe.checkout.sessions.retrieve(session.id, {
    expand: ["line_items.data.price.product"],
  })) as CheckoutSessionWithLineItems;
  return isUnlockSaasCheckoutSession(session);
}

async function invoiceIsOwned(
  object: unknown,
  stripe: StripeOwnershipReader
): Promise<boolean> {
  const inlineLines = linesFrom(object, "lines");
  if (inlineLines?.length) {
    return allLinesAreOwned(inlineLines, collectionHasMore(object, "lines"));
  }
  const id = objectId(object);
  if (!id || !stripe.invoices?.retrieve) return false;
  const invoice = await stripe.invoices.retrieve(id);
  return allLinesAreOwned(
    linesFrom(invoice, "lines"),
    collectionHasMore(invoice, "lines")
  );
}

async function subscriptionIsOwned(
  object: unknown,
  stripe: StripeOwnershipReader
): Promise<boolean> {
  const inlineItems = linesFrom(object, "items");
  if (inlineItems?.length) {
    return allLinesAreOwned(inlineItems, collectionHasMore(object, "items"));
  }
  const id = objectId(object);
  if (!id || !stripe.subscriptions?.retrieve) return false;
  const subscription = await stripe.subscriptions.retrieve(id, {
    expand: ["items.data.price.product"],
  });
  return allLinesAreOwned(
    linesFrom(subscription, "items"),
    collectionHasMore(subscription, "items")
  );
}

async function refundIsOwned(
  object: unknown,
  stripe: StripeOwnershipReader
): Promise<boolean> {
  if (!object || typeof object !== "object") return false;
  const charge = object as { invoice?: unknown; payment_intent?: unknown };
  if (charge.invoice) return invoiceIsOwned(charge.invoice, stripe);

  const paymentIntentId = objectId(charge.payment_intent);
  if (!paymentIntentId || !stripe.checkout?.sessions?.list) return false;
  const sessions = await stripe.checkout.sessions.list({
    payment_intent: paymentIntentId,
    limit: 10,
  });
  if (sessions.has_more) return false;
  if (!sessions.data?.length) return false;
  for (const session of sessions.data) {
    if (!(await checkoutIsOwned(session, stripe))) return false;
  }
  return true;
}

/**
 * Classify every account-level event subscribed by the UnlockSaaS endpoint.
 * Reads from Stripe are permitted only to expand immutable ownership resources;
 * callers must invoke this before idempotency or product side effects.
 */
export async function isUnlockSaasStripeEventOwned(
  event: StripeOwnershipEvent,
  stripe: StripeOwnershipReader
): Promise<boolean> {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.expired":
      return checkoutIsOwned(event.data.object, stripe);
    case "invoice.payment_succeeded":
    case "invoice.payment_failed":
      return invoiceIsOwned(event.data.object, stripe);
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      return subscriptionIsOwned(event.data.object, stripe);
    case "charge.refunded":
      return refundIsOwned(event.data.object, stripe);
    default:
      return false;
  }
}

export async function withOwnedStripeEvent<T>(
  event: StripeOwnershipEvent,
  stripe: StripeOwnershipReader,
  runSideEffects: () => Promise<T>
): Promise<{ owned: false } | { owned: true; value: T }> {
  if (!(await isUnlockSaasStripeEventOwned(event, stripe))) {
    return { owned: false };
  }
  return { owned: true, value: await runSideEffects() };
}
