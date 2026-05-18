import { ImageResponse } from "next/og";
import { TEARDOWN_SLUGS, getTeardownBySlug } from "@/lib/funnel-teardowns";
import { OG_CONTENT_TYPE, OG_SIZE, buildOgCard } from "@/lib/seo/og-card";

/**
 * Per-slug Open Graph card for /funnel-teardown/[slug].
 *
 * Closes the per-slug OG gap flagged in the 2026-05-17 SEO audit. Funnel
 * teardowns are the highest share-velocity pSEO surface on the property
 * (founders link them in Discord and Slack communities), so a named-target
 * card lifts inbound CTR materially over the generic fallback.
 *
 * All visual logic lives in src/lib/seo/og-card.tsx so the four pSEO OG
 * routes render as one visual fleet; this file stays a thin route handler.
 *
 * Brunson Hard-Rule reconciliation: pattern-level lessons only. The card
 * names the company and the Hook/Story/Offer lens; no quoted competitor
 * copy, no invented metrics.
 */

export const runtime = "nodejs";
export const dynamic = "force-static";
export const dynamicParams = false;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return TEARDOWN_SLUGS.map((slug) => ({ slug }));
}

type Params = { slug: string };

/**
 * Per-slug og:image:alt. Image-SEO uplift (2026-05-17) – without this, every
 * teardown card emits the same generic alt ("Unlock SaaS funnel teardown"),
 * which costs us image-search reach AND a real accessibility surface for
 * screen-reader users who share/preview the card. The file convention beats
 * generateMetadata.openGraph.images, so per-slug alts MUST be declared here.
 *
 * Single-item array (generateImageMetadata is documented as the multi-image
 * API, but a single-entry return is the supported way to get a per-slug alt
 * while keeping one image per route).
 */
export function generateImageMetadata({ params }: { params: Params }) {
  const t = getTeardownBySlug(params.slug);
  const name = t?.displayName ?? "Indie SaaS";
  return [
    {
      id: "card",
      alt: `${name} funnel teardown – Hook, Story, Offer pattern lessons for indie SaaS founders`,
      size: OG_SIZE,
      contentType: OG_CONTENT_TYPE,
    },
  ];
}

export default async function OgImage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const t = getTeardownBySlug(slug);

  return new ImageResponse(
    buildOgCard({
      eyebrow: "Funnel Teardown",
      headline: t ? `${t.displayName} Funnel Teardown` : "Funnel teardowns",
      subhead:
        t?.oneLine ??
        "Indie SaaS funnels through Hook, Story, Offer. Pattern-level lessons.",
      dateline: t ? `Last verified ${t.lastVerified}` : "unlocksaas.com",
    }),
    { ...OG_SIZE },
  );
}
