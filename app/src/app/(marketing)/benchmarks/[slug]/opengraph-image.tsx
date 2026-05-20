import { ImageResponse } from "next/og";
import {
  BENCHMARK_SLUGS,
  getBenchmarkBySlug,
} from "@/lib/benchmarks";
import { OG_CONTENT_TYPE, OG_SIZE, buildOgCard } from "@/lib/seo/og-card";

/**
 * Per-slug Open Graph card for /benchmarks/[slug] (canonical en-US).
 *
 * Why this card exists
 * --------------------
 * The 2026-05-21 SEO/GEO audit flagged that canonical benchmark detail
 * pages – the highest-AEO-intent surface on the site (each page directly
 * answers "what is a good X" with a 40-60 word direct answer and a banded
 * range) – inherited the root /opengraph-image fallback whenever someone
 * shared the URL on Twitter / X / LinkedIn. The locale variants under
 * /es/benchmarks/<slug> and /pt-BR/benchmarks/<slug> already shipped
 * dedicated cards (see [locale]/benchmarks/[slug]/opengraph-image.tsx);
 * this route closes the en-US asymmetry the locale-card comment
 * explicitly flagged as a follow-up.
 *
 * One ImageResponse per benchmark slug, captioned with the metric name
 * (the H1 of the rendered page) plus the SEO meta description (the same
 * short blurb the Twitter Card carries). Subhead intentionally uses
 * metaDescription rather than aeoAnswer because the og-card layout caps
 * the second-line subhead at ~150 chars before Twitter's large-card
 * scaling clips it; aeoAnswer averages 280-340 chars.
 *
 * Sitemap wiring: the canonical path `/benchmarks/[slug]` is added to
 * DEDICATED_OG_DETAIL_PATTERNS in sitemap.ts in the same commit so the
 * image-sitemap row points at the dedicated card URL instead of the
 * root fallback.
 *
 * Brunson Hard-Rule
 * -----------------
 *  - Caption strings come from BENCHMARK_ENTRIES – the same source the
 *    HTML page and the Twitter Card pull from. No fabricated headline
 *    lives in this layer.
 *  - Dateline reads lastVerified from the same entry. If the manifest
 *    drifts, the card drifts with it.
 *  - Unknown slugs fall through to a generic hub caption instead of
 *    rendering a phantom metric name. Same defensive shape as the
 *    glossary detail card.
 */

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

type Params = { slug: string };

export function generateStaticParams() {
  return BENCHMARK_SLUGS.map((slug) => ({ slug }));
}

/**
 * Per-slug og:image:alt. Locale-correct alt text gives the card a
 * distinct entry in image-search results AND a real accessibility
 * surface for screen-reader users who share or preview the card on
 * Twitter / X / LinkedIn.
 */
export function generateImageMetadata({ params }: { params: Params }) {
  const e = getBenchmarkBySlug(params.slug);
  const name = e?.metric ?? "indie SaaS benchmark";
  return [
    {
      id: "card",
      alt: `${name} – directional range for indie SaaS founders, from the Unlock SaaS benchmark set`,
      size: OG_SIZE,
      contentType: OG_CONTENT_TYPE,
    },
  ];
}

export default async function OgImage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const e = getBenchmarkBySlug(slug);

  return new ImageResponse(
    buildOgCard({
      eyebrow: "Benchmark",
      headline: e ? e.metric : "indie SaaS benchmark",
      subhead:
        e?.metaDescription ??
        "Directional ranges for the indie SaaS funnel metrics founders actually search for.",
      dateline: e ? `Last verified ${e.lastVerified}` : "unlocksaas.com",
    }),
    { ...OG_SIZE },
  );
}
