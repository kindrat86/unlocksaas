import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { OG_CONTENT_TYPE, OG_SIZE, buildOgCard } from "@/lib/seo/og-card";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import { getEditorialPolicyChrome } from "@/lib/i18n/translations";
import {
  getTranslationStatus,
  renderableLocalesForPath,
} from "@/lib/i18n/registry";

/**
 * Per-locale Open Graph card for /{locale}/editorial-policy.
 *
 * Why this card exists
 * --------------------
 * /editorial-policy is the E-E-A-T anchor Google Quality Rater
 * Guidelines §3.1 + §3.4 explicitly look for on sites that publish
 * opinions or comparisons. When the page is cited in a thread about
 * editorial transparency or "how should an indie SaaS handle
 * corrections," the locale-correct preview lifts share-CTR for
 * Spanish and Brazilian Portuguese audiences. The card mirrors the
 * visual contract of the other E-E-A-T trust columns.
 *
 * Brunson Hard-Rule reconciliation: copy strictly mirrors
 * getEditorialPolicyChrome(locale). The corrections-log empty-state
 * honesty stays where it is (on the page); the OG layer does not
 * claim a corrections track record that does not exist yet.
 */

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export const alt =
  "Unlock SaaS – Editorial Policy – sourcing, datelines, disclosures, corrections workflow";

export function generateStaticParams() {
  return renderableLocalesForPath("/editorial-policy").map((locale) => ({
    locale,
  }));
}

export default async function OgImage({
  params,
}: {
  params: Promise<{ locale: string }> | { locale: string };
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale) || rawLocale === "en-US") notFound();

  const locale = rawLocale as Exclude<Locale, "en-US">;
  const chrome = getEditorialPolicyChrome(locale);
  const row = getTranslationStatus("/editorial-policy", locale);
  const dateline = row?.approvedAt
    ? `Reviewed ${row.approvedAt} · unlocksaas.com`
    : "unlocksaas.com";

  return new ImageResponse(
    buildOgCard({
      eyebrow: chrome.pageLabel,
      headline: chrome.headline,
      subhead: chrome.seoDescription,
      dateline,
    }),
    { ...OG_SIZE },
  );
}
