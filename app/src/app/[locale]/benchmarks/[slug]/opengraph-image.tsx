import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { OG_CONTENT_TYPE, OG_SIZE, buildOgCard } from "@/lib/seo/og-card";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import { BENCHMARK_SLUGS } from "@/lib/benchmarks";
import {
  getBenchmarkEntries,
  getBenchmarksChrome,
} from "@/lib/i18n/translations";
import {
  getTranslationStatus,
  renderableLocalesForPath,
} from "@/lib/i18n/registry";

/**
 * Per-locale per-slug Open Graph card for /{locale}/benchmarks/[slug].
 *
 * Why this card exists
 * --------------------
 * The 2026-05-20 SEO/GEO audit flagged that approved-locale benchmark
 * detail pages (/es/benchmarks/<slug>, /pt-BR/benchmarks/<slug>)
 * inherited the root /opengraph-image fallback instead of a locale-
 * aware per-metric card. The benchmark surface is the highest-AEO-
 * intent block on the site (each page directly answers "what is a
 * good X" with a localized 40-60 word direct answer and a banded
 * range), so a locale thread sharing one of these URLs to a Spanish
 * or Brazilian audience was paying CTR for an English preview that
 * did not match the destination prose.
 *
 * This route closes that gap: one ImageResponse per (locale, slug)
 * pair, captioned with the localized metric name + localized meta
 * description (the SEO-formatted short blurb, capped well under the
 * subhead overflow threshold) pulled from the same
 * getBenchmarkEntries(locale) overlay the rendered HTML uses.
 *
 * Cross-product generateStaticParams: renderableLocalesForPath('/benchmarks')
 * × BENCHMARK_SLUGS. Pending-review locales pre-render too so the
 * founder can preview the card at the live URL before approval; the
 * page itself stays noindex/follow:false until the registry flips.
 *
 * Note on en-US asymmetry
 * -----------------------
 * The canonical (marketing)/benchmarks/[slug] route does NOT yet ship
 * its own dedicated OG card – it falls back to the root card via the
 * sitemap image post-pass. Adding one is a logically separate scope
 * (the canonical /benchmarks/<slug> SEO surface, not the i18n
 * approved-locale gap this PR closes) and is tracked as a follow-up.
 * The locale cards introduced here therefore intentionally do not
 * carry an en-US sibling at the same path; the [locale] gate above
 * 404s en-US to keep the routing contract clean.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *  - Locale gate matches the page itself: only `renderable` locales
 *    pre-render. en-US 404s here. Unknown slugs 404 as they do on
 *    the page.
 *  - All caption copy comes from getBenchmarkEntries(locale) and
 *    getBenchmarksChrome(locale) – the same sources the rendered
 *    page uses. No fabricated headline lives in this layer.
 *  - Dateline reads the registry's approvedAt timestamp so the image
 *    inherits the same freshness signal as the sitemap row carries.
 *
 * Wired into sitemap.ts hub→detail block as the `images[]` entry on
 * each (approved-locale × benchmark-slug) sitemap row – see the
 * HUBS_WITH_PER_LOCALE_DETAIL_OG constant.
 */

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

type Params = { locale: string; slug: string };

export function generateStaticParams() {
  const params: Params[] = [];
  for (const locale of renderableLocalesForPath("/benchmarks")) {
    for (const slug of BENCHMARK_SLUGS) {
      params.push({ locale, slug });
    }
  }
  return params;
}

/**
 * Per-(locale, slug) og:image:alt. Image-SEO uplift: locale-correct
 * alt text instead of a generic English fallback gives the localized
 * card a distinct entry in image-search results AND a real
 * accessibility surface for screen-reader users who share or preview
 * the card. Phrasing carries the localized metric name verbatim from
 * the benchmark translation overlay.
 */
export async function generateImageMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale) || rawLocale === "en-US") return [];
  const locale = rawLocale as Exclude<Locale, "en-US">;
  const entry = getBenchmarkEntries(locale).find((e) => e.slug === slug);
  const chrome = getBenchmarksChrome(locale);
  const name = entry?.metric ?? chrome.hubBreadcrumbBenchmarks;
  const altByLocale: Record<string, string> = {
    es: `${name} – rango direccional para founders indie de SaaS, del set de benchmarks de Unlock SaaS`,
    "pt": `${name} – faixa direcional para founders indie de SaaS, do conjunto de benchmarks da Unlock SaaS`,
  };
  return [
    {
      id: "card",
      alt: altByLocale[locale],
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
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale) || rawLocale === "en-US") notFound();

  const locale = rawLocale as Exclude<Locale, "en-US">;
  const entry = getBenchmarkEntries(locale).find((e) => e.slug === slug);
  if (!entry) notFound();

  const chrome = getBenchmarksChrome(locale);
  const row = getTranslationStatus("/benchmarks", locale);
  // approvedAt is the founder-signed approval date from the registry;
  // pending-review rows don't carry one so we fall back to the brand
  // anchor. Same convention as the per-locale hub OG cards.
  const dateline = row?.approvedAt
    ? `${chrome.detailVerifiedLabel} ${row.approvedAt}`
    : "unlocksaas.com";

  // Subhead uses metaDescription (SEO-formatted short blurb, ~155
  // chars by design) rather than aeoAnswer (40-60 word direct answer)
  // because the og-card layout caps the subhead at ~150 chars before
  // the second line clips on Twitter / X large-card scaling.
  return new ImageResponse(
    buildOgCard({
      eyebrow: chrome.detailLabel,
      headline: entry.metric,
      subhead: entry.metaDescription,
      dateline,
    }),
    { ...OG_SIZE },
  );
}
