import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { OG_CONTENT_TYPE, OG_SIZE, buildOgCard } from "@/lib/seo/og-card";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import { getFaqChrome } from "@/lib/i18n/translations";
import {
  getTranslationStatus,
  renderableLocalesForPath,
} from "@/lib/i18n/registry";

/**
 * Per-locale Open Graph card for /{locale}/faq.
 *
 * Why this card exists
 * --------------------
 * /faq is one of the two highest-share-probability surfaces on the
 * site (the other is /dont-buy-unlock-saas). Founders quote FAQ
 * answers in their own posts because the entries are sourced
 * verbatim from real Indie Hackers and Hacker News objections. The
 * en-US card already ships from app/src/app/(marketing)/faq/-… ;
 * this file extends the same visual contract to the two approved
 * locales (es, pt-BR) so a Spanish or Brazilian thread linking to
 * /es/faq or /pt-BR/faq carries a locale-correct social preview
 * instead of the English fallback.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *  - Locale gate matches the page itself: only `renderable`
 *    locales pre-render. Unapproved / archived rows 404 here as
 *    they do on the page.
 *  - All copy is read from getFaqChrome(locale), which is the
 *    same source the rendered page uses. No fabricated headline,
 *    no marketing puffery added in the OG layer.
 *  - dateline reads the registry's approvedAt timestamp so the
 *    image inherits the same freshness signal as the sitemap row.
 *
 * Wired into sitemap.ts as the `images[]` entry on the matching
 * approved translation row.
 */

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export const alt =
  "Unlock SaaS – FAQ – every objection sourced from a real founder thread";

export function generateStaticParams() {
  return renderableLocalesForPath("/faq").map((locale) => ({ locale }));
}

export default async function OgImage({
  params,
}: {
  params: Promise<{ locale: string }> | { locale: string };
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale) || rawLocale === "en-US") notFound();

  const locale = rawLocale as Locale;
  const chrome = getFaqChrome(locale);
  const row = getTranslationStatus("/faq", locale);
  const dateline = row?.approvedAt
    ? `Reviewed ${row.approvedAt} · unlocksaas.com`
    : "unlocksaas.com";

  return new ImageResponse(
    buildOgCard({
      eyebrow: chrome.breadcrumbFaq,
      headline: chrome.headline,
      subhead: chrome.seoDescription,
      dateline,
    }),
    { ...OG_SIZE },
  );
}
