import { ImageResponse } from "next/og";
import { OG_CONTENT_TYPE, OG_SIZE, buildOgCard } from "@/lib/seo/og-card";
import { DEFINED_TERMS } from "@/lib/seo/entity";

/**
 * Open Graph card for /glossary.
 *
 * Why this card exists
 * --------------------
 * The glossary surface that shipped in PR #32 is one of the most
 * shareable artifacts on the site – every Brunson concept has a
 * citable URL anchor, which makes the page a natural drop-in for
 * X / LinkedIn / Bluesky threads about funnel theory, indie SaaS
 * positioning, or the Wrong Person / Weak Offer / Weak Belief lens.
 * Without a per-route OG card, every share falls back to the site-
 * level card from app/src/app/opengraph-image.tsx, which carries the
 * funnel-hub signal (\"your first paying customer in 60 days\"), not
 * the glossary signal. A scroll-stop preview tied to the term count
 * and the founder's framing lifts share-CTR on every channel the
 * launch pack already targets.
 *
 * Joins the per-route OG fleet alongside the five pSEO surfaces
 * (alternatives-to, funnel-teardown, pricing-teardown, compare,
 * press/topics) and the polarity surface (/dont-buy-unlock-saas).
 * Shared visual logic lives in src/lib/seo/og-card.tsx; this file
 * is the thin per-route wrapper that supplies copy.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *  - The term count in the subhead reads from DEFINED_TERMS.length,
 *    not a hard-coded \"16\". If the registry shrinks or grows, the
 *    card cannot lie about the count.
 *  - Headline is founder-voiced (\"working definitions\"), not a
 *    fabricated authority claim.
 *  - dateline mirrors the page's own freshness window, so the social
 *    preview carries the same recency signal as the page itself.
 *  - No fabricated star ratings, no aspirational social-proof badges.
 *
 * Cache-correctness: force-static + no params means the card is
 * prerendered once per build, served from the edge with the rest of
 * the route group. Matches the polarity-page and press-topics cards.
 *
 * Discovery: Next.js 16 file-based metadata convention auto-discovers
 * this file. The page's metadata.openGraph block does not need an
 * \`images\` entry – the framework wires it in.
 */

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/**
 * og:image:alt for screen readers and Slack/Discord preview captions.
 * Per the OG-image discipline shared with the pSEO fleet, the alt names
 * the artifact AND the publisher so the preview is intelligible even
 * when the image fails to load.
 */
export const alt = `Unlock SaaS glossary – working definitions of ${DEFINED_TERMS.length} Brunson sales-funnel terms`;

export default function OgImage() {
  return new ImageResponse(
    buildOgCard({
      eyebrow: "Glossary",
      headline: `${DEFINED_TERMS.length} Brunson terms, in the founder's own words`,
      subhead:
        "Hook, Story, Offer, Value Ladder, Stack Slide, Big Domino, Dream 100, Wrong Person, Weak Offer, Weak Belief – the working vocabulary the Playbook applies to a flat Stripe line.",
      dateline: "Last reviewed 2026-05-19 · unlocksaas.com",
    }),
    { ...OG_SIZE },
  );
}
