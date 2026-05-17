/**
 * Affiliate program — gate + slug helpers
 *
 * Chapter: DCS Secret #13 (Other People's Funnels) + workbook 10 §3 (Affiliate Army)
 * Canonical doc: strategy/other-peoples-funnels.md §1 row 5, §6 Gate 3
 * Gate trigger:  50+ paying customers (verified_conversions count)
 *
 * Until the gate fires, the public /affiliates route renders a 410 ("program opens at
 * 50 customers — currently N/50"). The Stripe coupons for the program tiers are
 * pre-created by scripts/setup-affiliate-stripe-coupons.py and stored in env vars
 * (STRIPE_AFFILIATE_COUPON_CUSTOMER, _INFLUENCER, _COMMUNITY) so the program can
 * activate the moment the gate fires without further coupon setup.
 *
 * Cookie attribution pattern reuses traffic_secrets.growth_hacking.funnel_stack
 * Layer 7 spec (`usaas_affiliate` cookie, 90-day TTL). The cookie is set by
 * /r/[slug]/route.ts when the affiliate slug is registered in the link-registry
 * (slug prefix `aff-*`).
 */

import { createServerClient } from "@/lib/supabase";

/**
 * Number of verified paying customers required to open the affiliate program.
 * Workbook 10 §3 + dream-100-outreach.md §6 ("before 50 customers, 'join my
 * affiliate program' reads as 'the founder is trying to outsource the selling
 * because the funnel does not work yet'").
 */
export const AFFILIATE_GATE_THRESHOLD = 50 as const;

/**
 * Commission tiers per workbook 10 §3 + dream-100-outreach.md §6.
 * Stripe coupon codes are pre-created by scripts/setup-affiliate-stripe-coupons.py
 * and stored in env vars.
 */
export const AFFILIATE_TIERS = {
  customer: {
    label: "Customer affiliate",
    commissionPercent: 30,
    durationMonths: 6,
    description:
      "30% recurring for 6 months. For founders who completed The Machine and verified their first paying customer.",
    stripeCouponEnvVar: "STRIPE_AFFILIATE_COUPON_CUSTOMER",
  },
  influencer: {
    label: "Influencer / publisher",
    commissionPercent: 50,
    durationMonths: 6,
    description:
      "50% on first month + 30% recurring for 6 months. For Dream 100 Cat 2 individuals whose audience matches Marco.",
    stripeCouponEnvVar: "STRIPE_AFFILIATE_COUPON_INFLUENCER",
  },
  community: {
    label: "Coach / community partner",
    commissionPercent: 40,
    durationMonths: null, // lifetime
    description:
      "40% recurring for lifetime + monthly marketing co-investment. For founder communities (Indie Worldwide, ShipFast, MegaMaker, Microconf Connect).",
    stripeCouponEnvVar: "STRIPE_AFFILIATE_COUPON_COMMUNITY",
  },
} as const;

export type AffiliateTier = keyof typeof AFFILIATE_TIERS;

/**
 * Gate state — read by the /affiliates route and any downstream affiliate UI.
 * Counts the rows in verified_conversions (the existing table populated by the
 * Stripe webhook when First Paying Customer Verified fires per workbook 04 §7).
 *
 * Returns a structured result so the public page can render the "N/50" counter
 * honestly (no fake "almost there" copy).
 */
export interface AffiliateGateState {
  isOpen: boolean;
  verifiedCustomerCount: number;
  threshold: number;
  remaining: number;
}

export async function getAffiliateGateState(): Promise<AffiliateGateState> {
  try {
    const supabase = createServerClient();
    const { count, error } = await supabase
      .from("verified_conversions")
      .select("*", { count: "exact", head: true });

    if (error) {
      // Honest fallback: if the count fails, fail closed (gate stays shut).
      // Better to under-state progress than over-promise.
      return {
        isOpen: false,
        verifiedCustomerCount: 0,
        threshold: AFFILIATE_GATE_THRESHOLD,
        remaining: AFFILIATE_GATE_THRESHOLD,
      };
    }

    const verified = count ?? 0;
    return {
      isOpen: verified >= AFFILIATE_GATE_THRESHOLD,
      verifiedCustomerCount: verified,
      threshold: AFFILIATE_GATE_THRESHOLD,
      remaining: Math.max(0, AFFILIATE_GATE_THRESHOLD - verified),
    };
  } catch {
    return {
      isOpen: false,
      verifiedCustomerCount: 0,
      threshold: AFFILIATE_GATE_THRESHOLD,
      remaining: AFFILIATE_GATE_THRESHOLD,
    };
  }
}

/**
 * Convenience predicate — true when the gate is open.
 * Used by the /affiliates page to decide between 410-honest-empty and the live program.
 */
export async function isAffiliateGateOpen(): Promise<boolean> {
  const state = await getAffiliateGateState();
  return state.isOpen;
}

/**
 * Affiliate slug builder. Slugs follow the OPF activation manifest convention:
 *   aff-<source>-<handle>
 * e.g., aff-customer-marco-123, aff-influencer-castrio, aff-community-indie-worldwide
 *
 * Source-prefix is the tier; handle is the affiliate's chosen slug (lowercase,
 * hyphen-separated, alphanumeric).
 */
export function buildAffiliateSlug(
  tier: AffiliateTier,
  handle: string,
): string {
  const normalized = handle
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!normalized) {
    throw new Error("Affiliate slug handle cannot be empty after normalization");
  }

  return `aff-${tier}-${normalized}`;
}

/**
 * Parse an affiliate slug back into (tier, handle). Returns null if the slug
 * isn't a valid affiliate slug. Used by the /r/[slug] route to determine the
 * tier for cookie attribution.
 */
export function parseAffiliateSlug(
  slug: string,
): { tier: AffiliateTier; handle: string } | null {
  const match = slug.match(/^aff-(customer|influencer|community)-(.+)$/);
  if (!match) return null;
  return { tier: match[1] as AffiliateTier, handle: match[2] };
}
