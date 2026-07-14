/**
 * Offer catalog – post-Starter monetization stack.
 *
 * Brunson alignment (DotCom Secrets Secret 10 + Secret 14 / Expert Secrets §3
 * Stack-and-Closes / the audit recommendation in chat 2026-05-21):
 *
 *   $1 Starter cart   ─►  order bump  $27  (Dream 100 + Cold Email Library)
 *                          │
 *                          ▼
 *   thank-you page    ─►  OTO #1     $97  (Founder's Diary Vault)
 *                          │              decline ─►  downsell $27  (Cold Email Library only)
 *                          │
 *                          ▼
 *   second OTO        ─►  OTO #2    $297  (Lifetime Verified Builders access)
 *                          │
 *                          ▼
 *                       /welcome
 *
 * The four extra offers are env-gated by Stripe price ID. If the env var is
 * unset (operator hasn't created the Stripe product yet) the offer is
 * silently hidden – the visitor never sees a broken checkbox or a CTA that
 * 500s. This lets the PR land before the operator finishes creating the
 * Stripe products + uploading the deliverable assets.
 *
 * Voice rule: every copy block in this file uses the Reluctant Hero voice
 * locked in workbook 01 §6 + project_unlocksaas_email_identity. No hype,
 * no fake urgency, no exclamation marks. The offers carry their own weight
 * or they don't carry.
 */

export type OfferId =
  | "starter_bump"
  | "oto_vault"
  | "oto_downsell"
  | "oto_lifetime";

export type OfferKind = "bump" | "oto" | "downsell";

export interface OfferDefinition {
  /** Stable id used in metadata + analytics + db kind column. */
  id: OfferId;
  /** Human label used in copy + Stripe line-item description fallback. */
  title: string;
  /** Brunson-style sub-headline. One line. */
  subtitle: string;
  /** Short benefit bullets (each <= ~110 chars). 3-5 items. */
  bullets: readonly string[];
  /** Anchor price in cents – used for display copy and the math line. */
  priceCents: number;
  /** Optional anchor / strikethrough price (cents) shown in copy. */
  anchorPriceCents?: number;
  /** Kind for downstream routing. */
  kind: OfferKind;
  /** Stripe price-id env var name. Resolution happens server-side only. */
  priceIdEnvVar: string;
  /** Operator-pasted deliverable URL env var (Notion, Drive, etc.). */
  deliverableUrlEnvVar?: string;
  /**
   * For the lifetime community OTO. When true, the webhook stamps
   * profiles.community_lifetime_at and the access never expires even if the
   * Core sub later cancels.
   */
  grantsLifetimeCommunity?: boolean;
}

/**
 * The catalog. Every field that varies between offers lives in one place so
 * a copy tweak is a one-line change, not a hunt across four files.
 */
export const OFFERS: Record<OfferId, OfferDefinition> = {
  starter_bump: {
    id: "starter_bump",
    title: "Add: Dream 100 Spreadsheet + Cold Email Library",
    subtitle:
      "The 45 communities and influencers your dream customer already follows, plus the eight cold-email templates that have replied for me.",
    bullets: [
      "45 Dream 100 targets (communities + influencers) with reachability notes.",
      "Eight cold-email templates with the three reply branches I actually use.",
      "Copy-paste Notion doc, no setup, yours forever.",
    ],
    priceCents: 2700,
    anchorPriceCents: 9700,
    kind: "bump",
    priceIdEnvVar: "STRIPE_BUMP_DREAM100_PRICE_ID",
    deliverableUrlEnvVar: "OTO_DREAM100_DELIVERABLE_URL",
  },
  oto_vault: {
    id: "oto_vault",
    title: "The Founder's Diary Vault",
    subtitle:
      "Every script, every B-roll prompt, every voice take from the Founder's Diary backlog. Built in public, downloadable in private.",
    bullets: [
      "30-episode script archive – the same Reluctant Hero voice that wrote the page you just bought from.",
      "Veo 3 B-roll prompt library + ElevenLabs voice settings I locked in for the channel.",
      "Descript project files for the first ten episodes, so you can fork the format.",
      "The production runbook itself – the part most YouTube courses charge $497 for.",
    ],
    priceCents: 9700,
    anchorPriceCents: 49700,
    kind: "oto",
    priceIdEnvVar: "STRIPE_OTO_VAULT_PRICE_ID",
    deliverableUrlEnvVar: "OTO_VAULT_DELIVERABLE_URL",
  },
  oto_downsell: {
    id: "oto_downsell",
    title: "Just the Cold Email Library",
    subtitle:
      "Skip the Vault. Take the eight cold-email templates and the three reply branches. The same templates the bump above includes, on their own.",
    bullets: [
      "Eight cold-email templates, ready to send tonight.",
      "Three reply branches for the answers you'll actually get.",
      "Same Reluctant Hero voice. No hype, no fake personalization.",
    ],
    priceCents: 2700,
    kind: "downsell",
    priceIdEnvVar: "STRIPE_OTO_DOWNSELL_PRICE_ID",
    deliverableUrlEnvVar: "OTO_COLD_EMAILS_DELIVERABLE_URL",
  },
  oto_lifetime: {
    id: "oto_lifetime",
    title: "Lifetime Verified Builders Access",
    subtitle:
      "The room the $49/mo seat unlocks – yours for life. One payment. No subscription. Doors stay open even if the Playbook isn't a fit.",
    bullets: [
      "Lifetime seat in the Verified Builders room (Skool or Discord, your call).",
      "Every cohort call recording, past and future, in the room library.",
      "Direct DM access to me for the first thirty days – same line founding seats get.",
      "If you ever buy the Playbook later, this $297 credits against your first month.",
    ],
    priceCents: 29700,
    anchorPriceCents: 58800,
    kind: "oto",
    priceIdEnvVar: "STRIPE_OTO_LIFETIME_PRICE_ID",
    grantsLifetimeCommunity: true,
  },
} as const;

/**
 * Core funnel price ids – the $1 Starter and the $49/mo Playbook – follow
 * the same operator opt-in pattern as the OTO stack: until the operator
 * pastes the Stripe price id into the env, every buy CTA must degrade to
 * an honest founding-waitlist email capture. Never a dead button, never a
 * fake "sold out". Server-only; reads process.env.
 */
const CORE_PRICE_ENV_VARS = {
  starter: "STRIPE_STARTER_PRICE_ID",
  playbook: "STRIPE_MACHINE_PRICE_ID",
} as const;

export type CorePriceType = keyof typeof CORE_PRICE_ENV_VARS;

export function isCorePriceConfigured(priceType: CorePriceType): boolean {
  const raw = process.env[CORE_PRICE_ENV_VARS[priceType]]?.trim();
  if (!raw) return false;
  if (!raw.startsWith("price_")) {
    console.warn(
      `[offers] ${CORE_PRICE_ENV_VARS[priceType]} does not look like a Stripe price id; treating checkout as closed`,
    );
    return false;
  }
  return true;
}

/**
 * Resolve the Stripe price id for an offer. Server-only; reads process.env.
 * Returns null when the env var is unset – callers MUST treat null as
 * "offer disabled" and never show the CTA.
 */
export function getOfferPriceId(offerId: OfferId): string | null {
  const offer = OFFERS[offerId];
  const raw = process.env[offer.priceIdEnvVar]?.trim();
  if (!raw) return null;
  // Stripe price ids are `price_...`. Accept anything non-empty so test fixtures
  // (`price_test_*`) work, but reject obviously wrong values.
  if (!raw.startsWith("price_")) {
    console.warn(
      `[offers] ${offer.priceIdEnvVar} does not look like a Stripe price id; ignoring`,
    );
    return null;
  }
  return raw;
}

/**
 * Convenience: is the offer reachable from a CTA right now?
 * Used by both the server (to gate the checkout call) and the page renderer
 * (to gate the CTA itself).
 */
export function isOfferEnabled(offerId: OfferId): boolean {
  return getOfferPriceId(offerId) !== null;
}

/**
 * Resolve the deliverable URL for an offer. Returns null when:
 *   - the offer has no deliverable URL slot (e.g. lifetime community)
 *   - the env var is unset (operator hasn't pasted the link yet)
 *
 * The webhook handler treats null as "send the customer a note that
 * delivery is hand-rolled" rather than failing the purchase.
 */
export function getOfferDeliverableUrl(offerId: OfferId): string | null {
  const offer = OFFERS[offerId];
  if (!offer.deliverableUrlEnvVar) return null;
  const raw = process.env[offer.deliverableUrlEnvVar]?.trim();
  if (!raw) return null;
  try {
    new URL(raw);
    return raw;
  } catch {
    console.warn(
      `[offers] ${offer.deliverableUrlEnvVar} is not a valid URL; ignoring`,
    );
    return null;
  }
}

/**
 * Format cents as a clean dollar string. $27, $97, $297. No trailing .00.
 */
export function formatDollars(cents: number): string {
  const dollars = cents / 100;
  if (Number.isInteger(dollars)) return `$${dollars}`;
  return `$${dollars.toFixed(2)}`;
}

/**
 * Map an offer id to a billing_payments.kind value.
 *
 * The check constraint in supabase/migrations/20260521000001_oto_stack.sql
 * expands the allowed values to include these four. Until that migration
 * applies, recordPayment will fail – guard with the migration check.
 */
export function offerToBillingKind(offerId: OfferId): string {
  return offerId; // 1:1 mapping; the enum values match the offer ids
}
