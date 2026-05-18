import { ImageResponse } from "next/og";
import { OG_CONTENT_TYPE, OG_SIZE, buildOgCard } from "@/lib/seo/og-card";
import { DISQUALIFIERS } from "@/lib/dont-buy";

/**
 * Open Graph card for /dont-buy-unlock-saas (Brunson polarity surface).
 *
 * Why this card exists
 * --------------------
 * The polarity page is the highest-share-probability surface on the
 * site – built specifically to be linked from X, LinkedIn, Bluesky,
 * and Indie Hackers in the off-page launch pack (see
 * strategy/launch-content/off-page-launch-pack.md Part B). Without a
 * per-route Open Graph card, every share falls back to the site-level
 * card from app/src/app/opengraph-image.tsx, which doesn't carry the
 * polarity signal. A scroll-stop preview tied to the "Don't Buy"
 * headline lifts share-CTR meaningfully on every channel the launch
 * pack targets.
 *
 * Visual contract matches the rest of the per-route OG fleet (the
 * five pSEO surfaces and the press-topics card). Shared visual logic
 * lives in src/lib/seo/og-card.tsx; this file is the thin per-route
 * wrapper that supplies copy.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *  - Eyebrow + headline + subhead are static, founder-signed strings
 *    sourced from the same intent the HTML page renders.
 *  - The disqualifier count in the subhead is read from DISQUALIFIERS,
 *    not hard-coded, so the card cannot lie about the count if the
 *    registry changes.
 *  - dateline mirrors the page's "Last reviewed" so the social preview
 *    carries the same freshness signal as the page itself.
 *  - No fabricated counts, no aspirational social-proof badges, no
 *    star ratings on a polarity page.
 *
 * Cache-correctness: force-static + no params means the card is
 * prerendered once per build, served from the edge with the rest of
 * the route group. Same shape as the press-topics card.
 */

export const runtime = "nodejs";
export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/**
 * og:image:alt for screen readers and Slack/Discord preview captions.
 * Per the OG-image discipline shared with the pSEO fleet, the alt names
 * the artifact AND the publisher so the preview is intelligible even
 * when the image fails to load.
 */
export const alt =
  "Don't buy Unlock SaaS – eight honest disqualifiers signed by the founder, before checkout";

export default function OgImage() {
  return new ImageResponse(
    buildOgCard({
      eyebrow: "Disqualifiers",
      headline: "Don't buy Unlock SaaS",
      subhead: `${DISQUALIFIERS.length} honest reasons to walk away, signed by the founder, before checkout.`,
      dateline: "Last reviewed 2026-05-19 · unlocksaas.com",
    }),
    { ...OG_SIZE },
  );
}
