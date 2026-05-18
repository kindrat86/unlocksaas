import { ImageResponse } from "next/og";
import {
  PRICING_TEARDOWN_SLUGS,
  getPricingTeardownBySlug,
} from "@/lib/pricing-teardowns";
import { OG_CONTENT_TYPE, OG_SIZE, buildOgCard } from "@/lib/seo/og-card";

/**
 * Per-slug Open Graph card for /pricing-teardown/[slug].
 *
 * Closes the per-slug OG gap flagged in the 2026-05-17 SEO audit. Pricing
 * teardowns sit on the highest-intent pricing-research query class
 * ("how does X price", "X pricing breakdown"); a named-target preview
 * lifts CTR on the inbound surfaces where these are shared (founder
 * communities, pricing-page audits).
 *
 * All visual logic lives in src/lib/seo/og-card.tsx so the four pSEO OG
 * routes render as one visual fleet; this file stays a thin route handler.
 *
 * Brunson Hard-Rule reconciliation: the card names the company and the
 * Stack/Anchor/Mechanics lens. No fabricated price points on the card.
 */

export const runtime = "nodejs";
export const dynamic = "force-static";
export const dynamicParams = false;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return PRICING_TEARDOWN_SLUGS.map((slug) => ({ slug }));
}

type Params = { slug: string };

/**
 * Per-slug og:image:alt. Pricing teardowns are shared in founder
 * communities mid-evaluation ("how is X actually priced") – the named-
 * target alt is what makes the preview earn the click instead of the
 * generic "indie SaaS pricing" alt that gets ignored.
 */
export function generateImageMetadata({ params }: { params: Params }) {
  const t = getPricingTeardownBySlug(params.slug);
  const name = t?.displayName ?? "Indie SaaS";
  return [
    {
      id: "card",
      alt: `${name} pricing teardown – tier structure, anchor mechanics, upgrade triggers`,
      size: OG_SIZE,
      contentType: OG_CONTENT_TYPE,
    },
  ];
}

export default async function OgImage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const t = getPricingTeardownBySlug(slug);

  return new ImageResponse(
    buildOgCard({
      eyebrow: "Pricing Teardown",
      headline: t ? `${t.displayName} Pricing Teardown` : "Pricing teardowns",
      subhead:
        t?.oneLine ??
        "Indie SaaS pricing through Stack, Value Ladder, Anchor, Mechanics.",
      dateline: t ? `Last verified ${t.lastVerified}` : "unlocksaas.com",
    }),
    { ...OG_SIZE },
  );
}
