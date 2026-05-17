import { ImageResponse } from "next/og";
import { COMPARISON_SLUGS, getComparisonBySlug } from "@/lib/comparisons";
import { OG_CONTENT_TYPE, OG_SIZE, buildOgCard } from "@/lib/seo/og-card";

/**
 * Per-slug Open Graph card for /compare/[slug].
 *
 * Closes the per-slug OG gap flagged in the 2026-05-17 SEO audit. Head-
 * to-head comparisons sit on the highest-intent SaaS-research query class
 * ("[A] vs [B]"); a named-pair preview is the difference between a 1%
 * CTR generic preview and a 4-6% CTR "I am literally researching this
 * exact pair" preview.
 *
 * Brunson Hard-Rule reconciliation: symmetric framing extends to the OG
 * card. The card names both products on the headline line and renders no
 * verdict — the honest take is the click-through payoff.
 *
 * All visual logic lives in src/lib/seo/og-card.tsx so the four pSEO OG
 * routes render as one visual fleet; this file stays a thin route handler.
 */

export const runtime = "nodejs";
export const dynamic = "force-static";
export const dynamicParams = false;
export const alt = "Unlock SaaS head-to-head comparison";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return COMPARISON_SLUGS.map((slug) => ({ slug }));
}

type Params = { slug: string };

export default function OgImage({ params }: { params: Params }) {
  const c = getComparisonBySlug(params.slug);

  return new ImageResponse(
    buildOgCard({
      eyebrow: "Head-to-head",
      headline: c ? `${c.a.name} vs ${c.b.name}` : "Head-to-head comparisons",
      subhead:
        c?.oneLine ??
        "Symmetric dimension-by-dimension breakdown for indie SaaS founders.",
      dateline: c ? `Last verified ${c.lastVerified}` : "unlocksaas.com",
    }),
    { ...OG_SIZE },
  );
}
