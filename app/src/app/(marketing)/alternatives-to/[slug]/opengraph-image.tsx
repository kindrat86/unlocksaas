import { ImageResponse } from "next/og";
import { ALTERNATIVE_SLUGS, getAlternativeBySlug } from "@/lib/alternatives";
import { OG_CONTENT_TYPE, OG_SIZE, buildOgCard } from "@/lib/seo/og-card";

/**
 * Per-slug Open Graph card for /alternatives-to/[slug].
 *
 * Closes the per-slug OG gap flagged in the 2026-05-17 SEO audit. Generic
 * fallback OG previews cap inbound share-CTR around 1%; named-target
 * preview cards run 3-6x higher on the surfaces where pSEO links spread
 * organically (Slack, X, LinkedIn, Discord founder communities).
 *
 * All visual logic lives in src/lib/seo/og-card.tsx so the four pSEO OG
 * routes render as one visual fleet. This file is a thin route handler:
 *   - reads the manifest entry for the slug,
 *   - hands `eyebrow`, `headline`, `subhead`, `dateline` to buildOgCard,
 *   - returns the ImageResponse.
 *
 * Static-generation contract:
 *   - `dynamic = "force-static"` + `dynamicParams = false` mirror page.tsx
 *     so every card is pre-rendered at build time and unknown slugs 404.
 *   - `generateStaticParams` is keyed to the same ALTERNATIVE_SLUGS list
 *     the page route uses; build emits one PNG per slug.
 *
 * Brunson Hard-Rule reconciliation: every field on the card is a string
 * from the same manifest the HTML page renders. Drift between page,
 * schema, markdown, and OG card is impossible by construction.
 */

export const runtime = "nodejs";
export const dynamic = "force-static";
export const dynamicParams = false;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return ALTERNATIVE_SLUGS.map((slug) => ({ slug }));
}

type Params = { slug: string };

/**
 * Per-slug og:image:alt. Named-competitor comparison cards carry the
 * highest social-share CTR on the property – the per-slug alt is what
 * makes Slack/Discord/X previews convert founders mid-evaluation, AND
 * what screen-reader users actually hear when the preview lands.
 */
export function generateImageMetadata({ params }: { params: Params }) {
  const a = getAlternativeBySlug(params.slug);
  const name = a?.displayName ?? "competitor";
  return [
    {
      id: "card",
      alt: `Unlock SaaS vs ${name} – honest comparison for indie SaaS founders`,
      size: OG_SIZE,
      contentType: OG_CONTENT_TYPE,
    },
  ];
}

export default async function OgImage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const a = getAlternativeBySlug(slug);

  // Defensive fallback: dynamicParams=false should make this unreachable,
  // but a stale slug list during a future refactor must still render a
  // sane card rather than crash the build.
  return new ImageResponse(
    buildOgCard({
      eyebrow: "Alternative to",
      headline: a
        ? `Unlock SaaS vs ${a.displayName}`
        : "Unlock SaaS alternatives",
      subhead:
        a?.oneLine ??
        "Named-competitor comparisons. No slagging, no fabricated prices.",
      dateline: a ? `Last verified ${a.lastVerified}` : "unlocksaas.com",
    }),
    { ...OG_SIZE },
  );
}
