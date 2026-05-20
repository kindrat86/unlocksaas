import { ImageResponse } from "next/og";
import { OG_CONTENT_TYPE, OG_SIZE, buildOgCard } from "@/lib/seo/og-card";
import { FOUR_INDIE_LAST_REVIEWED_AT } from "@/lib/four-indie-search-engines";

/**
 * Open Graph card for /four-indie-search-engines — the indie-search
 * companion essay.
 *
 * Why this card exists
 * --------------------
 * This page is built specifically for X / LinkedIn / Bluesky / Indie
 * Hackers / Show HN share. Without a per-route OG card, every share
 * falls back to the site-level card from app/src/app/opengraph-image.tsx,
 * which doesn't carry the counter-intuitive headline that earns the
 * scroll-stop. A dedicated card tied to the "four engines under 1
 * percent" claim is the lift the off-page launch plan depends on.
 *
 * Visual contract matches the fleet (alternatives, funnel-teardown,
 * pricing-teardown, compare, press/topics, dont-buy-unlock-saas) — all
 * use buildOgCard from src/lib/seo/og-card so any future visual change
 * lands in one file.
 *
 * Brunson Hard-Rule reconciliation:
 *   - Headline + subhead are static, founder-signed strings sourced
 *     from the same intent the HTML lede renders.
 *   - "four engines under 1 percent share each" is the load-bearing
 *     claim; it's hedged in the HTML lede ("rounding error", "maybe
 *     three percent on a generous day") so the card and the page tell
 *     the same conservative story.
 *   - dateline mirrors the page's "Last reviewed" so the social
 *     preview carries the same freshness signal as the page itself.
 */

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/**
 * generateImageMetadata over `export const alt`: per the audit comment
 * in /dont-buy-unlock-saas/opengraph-image.tsx, the
 * generateImageMetadata convention attaches reliably to the parent
 * route's metadata.openGraph.images while the static alt form has
 * historically failed silently. Mirror their shape.
 */
export function generateImageMetadata() {
  return [
    {
      id: "card",
      alt: "I shipped UnlockSaaS to four search engines under 1 percent market share each — Unlock SaaS",
      size: OG_SIZE,
      contentType: OG_CONTENT_TYPE,
    },
  ];
}

export default function OgImage() {
  return new ImageResponse(
    buildOgCard({
      eyebrow: "Distribution",
      headline: "Four engines, under 1% share each",
      subhead:
        "Why shipping UnlockSaaS to Brave + Mojeek + Marginalia + Kagi is the smartest distribution move of the quarter.",
      dateline: `Last reviewed ${FOUR_INDIE_LAST_REVIEWED_AT} · unlocksaas.com`,
    }),
    { ...OG_SIZE },
  );
}
