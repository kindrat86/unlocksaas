import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { OG_CONTENT_TYPE, OG_SIZE, buildOgCard } from "@/lib/seo/og-card";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import { GLOSSARY_SLUGS } from "@/lib/glossary";
import {
  getGlossaryChrome,
  getGlossaryEntries,
} from "@/lib/i18n/translations";
import {
  getTranslationStatus,
  renderableLocalesForPath,
} from "@/lib/i18n/registry";

/**
 * Per-locale per-slug Open Graph card for /{locale}/glossary/[slug].
 *
 * Why this card exists
 * --------------------
 * The 2026-05-20 SEO/GEO audit flagged that approved-locale glossary
 * detail pages (/es/glossary/<slug>, /pt-BR/glossary/<slug>) inherited
 * the root /opengraph-image fallback instead of a locale-aware per-term
 * card, while the canonical en-US /glossary/<slug> already ships its
 * own (see app/(marketing)/glossary/[slug]/opengraph-image.tsx). A
 * Spanish or Brazilian thread linking to an approved-locale page
 * therefore carried an English social preview – demoting CTR, image-
 * search distinctness, and locale-pair coherence.
 *
 * This route closes that gap: one ImageResponse per (locale, slug)
 * pair, captioned with the localized term + localized short definition
 * pulled from the same getGlossaryEntries(locale) overlay the rendered
 * HTML uses, so schema, body, and OG card never drift.
 *
 * Cross-product generateStaticParams: renderableLocalesForPath('/glossary')
 * × GLOSSARY_SLUGS. Pending-review locales pre-render too so the
 * founder can preview the card at the live URL before approval; the
 * page itself stays noindex/follow:false until the registry flips.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *  - Locale gate matches the page itself: only `renderable` locales
 *    pre-render. en-US 404s here (it has its own dedicated card under
 *    (marketing)/glossary/[slug]/opengraph-image.tsx). Unknown slugs
 *    404 as they do on the page.
 *  - All caption copy comes from getGlossaryEntries(locale) and
 *    getGlossaryChrome(locale) – the same sources the rendered page
 *    uses. No fabricated headline lives in this layer.
 *  - Dateline reads the registry's approvedAt timestamp so the image
 *    inherits the same freshness signal as the sitemap row carries.
 *
 * Wired into sitemap.ts hub→detail block as the `images[]` entry on
 * each (approved-locale × glossary-slug) sitemap row – see the
 * HUBS_WITH_PER_LOCALE_DETAIL_OG constant.
 */

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

type Params = { locale: string; slug: string };

export function generateStaticParams() {
  const params: Params[] = [];
  for (const locale of renderableLocalesForPath("/glossary")) {
    for (const slug of GLOSSARY_SLUGS) {
      params.push({ locale, slug });
    }
  }
  return params;
}

/**
 * Per-(locale, slug) og:image:alt. Image-SEO uplift: locale-correct alt
 * text instead of a generic English fallback gives the localized card a
 * distinct entry in image-search results AND a real accessibility
 * surface for screen-reader users who share or preview the card.
 * Mirrors the alt pattern in
 * app/(marketing)/glossary/[slug]/opengraph-image.tsx; locale phrasing
 * stays close to the canonical alt clause (same intent in target
 * language; no marketing puffery added in the OG layer).
 */
export async function generateImageMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale) || rawLocale === "en-US") return [];
  const locale = rawLocale as Locale;
  const entry = getGlossaryEntries(locale).find((e) => e.slug === slug);
  const chrome = getGlossaryChrome(locale);
  const name = entry?.term ?? chrome.hubBreadcrumbGlossary;
  const altByLocale: Record<string, string> = {
    es: `${name} – definición para founders indie de SaaS, del glosario Brunson de Unlock SaaS`,
    "pt": `${name} – definição para founders indie de SaaS, do glossário Brunson da Unlock SaaS`,
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

  const locale = rawLocale as Locale;
  const entry = getGlossaryEntries(locale).find((e) => e.slug === slug);
  if (!entry) notFound();

  const chrome = getGlossaryChrome(locale);
  const row = getTranslationStatus("/glossary", locale);
  // approvedAt is the founder-signed approval date from the registry;
  // pending-review rows don't carry one so we fall back to the brand
  // anchor. Same convention as the per-locale hub OG cards.
  const dateline = row?.approvedAt
    ? `${chrome.detailVerifiedLabel} ${row.approvedAt}`
    : "unlocksaas.com";

  return new ImageResponse(
    buildOgCard({
      eyebrow: chrome.detailBreadcrumbGlossary,
      headline: entry.term,
      subhead: entry.shortDefinition,
      dateline,
    }),
    { ...OG_SIZE },
  );
}
