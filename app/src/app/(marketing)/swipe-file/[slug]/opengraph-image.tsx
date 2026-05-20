import { ImageResponse } from "next/og";
import { SWIPE_FILE_SLUGS, getSwipeFileBySlug } from "@/lib/swipe-files";
import { OG_CONTENT_TYPE, OG_SIZE, buildOgCard } from "@/lib/seo/og-card";

/**
 * Per-slug Open Graph card for /swipe-file/[slug].
 *
 * All visual logic lives in src/lib/seo/og-card.tsx so the per-slug OG
 * routes render as one visual fleet; this file stays a thin route
 * handler.
 *
 * Brunson Hard-Rule reconciliation: card names the element and the
 * pattern-count. No invented metrics, no quoted competitor copy.
 */

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return SWIPE_FILE_SLUGS.map((slug) => ({ slug }));
}

type Params = { slug: string };

export function generateImageMetadata({ params }: { params: Params }) {
  const s = getSwipeFileBySlug(params.slug);
  const name = s?.displayName ?? "Swipe file";
  const lens = s?.brunsonLens ?? "Hook / Story / Offer";
  return [
    {
      id: "card",
      alt: `${name} – named ${lens} patterns with formulas and examples for indie SaaS founders`,
      size: OG_SIZE,
      contentType: OG_CONTENT_TYPE,
    },
  ];
}

export default async function OgImage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const s = getSwipeFileBySlug(slug);

  return new ImageResponse(
    buildOgCard({
      eyebrow: "Swipe File",
      headline: s ? s.displayName : "Swipe files",
      subhead: s
        ? `${s.examples.length} named patterns – ${s.brunsonLens} lens.`
        : "Per-element pattern libraries for indie SaaS founders.",
      dateline: s ? `Last verified ${s.lastVerified}` : "unlocksaas.com",
    }),
    { ...OG_SIZE },
  );
}
