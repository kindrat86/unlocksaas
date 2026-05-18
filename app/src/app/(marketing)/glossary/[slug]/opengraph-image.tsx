import { ImageResponse } from "next/og";
import { GLOSSARY_SLUGS, getGlossaryBySlug } from "@/lib/glossary";
import { OG_CONTENT_TYPE, OG_SIZE, buildOgCard } from "@/lib/seo/og-card";

/**
 * Per-slug Open Graph card for /glossary/[slug].
 *
 * Mirrors the shape of the four prior pSEO OG routes (alternatives,
 * funnel-teardown, pricing-teardown, compare). One card per term; visual
 * fleet stays consistent because every caller hands four caption strings
 * to buildOgCard().
 *
 * Brunson Hard-Rule: caption strings come from the manifest the HTML page
 * also renders – no fabricated copy lives in this route.
 */

export const runtime = "nodejs";
export const dynamic = "force-static";
export const dynamicParams = false;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return GLOSSARY_SLUGS.map((slug) => ({ slug }));
}

type Params = { slug: string };

/**
 * Per-slug og:image:alt. Image-SEO uplift – every glossary card emits a
 * named alt instead of the generic fallback, which costs image-search
 * reach AND a real accessibility surface for screen-reader users who
 * share/preview the card. The file convention beats
 * generateMetadata.openGraph.images, so per-slug alts MUST be declared
 * here.
 */
export function generateImageMetadata({ params }: { params: Params }) {
  const g = getGlossaryBySlug(params.slug);
  const name = g?.term ?? "Brunson concept";
  return [
    {
      id: "card",
      alt: `${name} – definition for indie SaaS founders, from the Unlock SaaS Brunson glossary`,
      size: OG_SIZE,
      contentType: OG_CONTENT_TYPE,
    },
  ];
}

export default async function OgImage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const g = getGlossaryBySlug(slug);

  return new ImageResponse(
    buildOgCard({
      eyebrow: "Glossary",
      headline: g ? g.term : "Brunson glossary",
      subhead:
        g?.shortDefinition ??
        "Working definitions of the Russell Brunson sales-funnel concepts Unlock SaaS teaches.",
      dateline: g ? `Last verified ${g.lastVerified}` : "unlocksaas.com",
    }),
    { ...OG_SIZE },
  );
}
