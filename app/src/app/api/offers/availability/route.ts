import { NextResponse } from "next/server";
import { isOfferEnabled, type OfferId } from "@/lib/offers";

/**
 * Tiny GET endpoint the client-side /starter + /oto/* pages call on mount to
 * decide which CTAs to render. The booleans flip server-side when the operator
 * pastes a Stripe price id env var; until then the CTA stays hidden and the
 * page falls through to the next step.
 *
 * Caching: we let the Cache-Control header below drive Vercel's edge cache
 * (max-age=60, s-maxage=300, stale-while-revalidate=60). With Cache Components
 * enabled in next.config, legacy `dynamic = "force-static"` and `revalidate`
 * exports are forbidden – the cache header is the canonical hint.
 */

const ALL_OFFERS: readonly OfferId[] = [
  "starter_bump",
  "oto_vault",
  "oto_downsell",
  "oto_lifetime",
] as const;

export async function GET() {
  const availability: Record<OfferId, boolean> = {
    starter_bump: false,
    oto_vault: false,
    oto_downsell: false,
    oto_lifetime: false,
  };
  for (const id of ALL_OFFERS) {
    availability[id] = isOfferEnabled(id);
  }
  return NextResponse.json(availability, {
    headers: {
      // Cache at the edge for a tick; the client also caches in memory.
      "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=60",
    },
  });
}
