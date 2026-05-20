import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { OG_CONTENT_TYPE, OG_SIZE, buildOgCard } from "@/lib/seo/og-card";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import { getContactChrome } from "@/lib/i18n/translations";
import {
  getTranslationStatus,
  renderableLocalesForPath,
} from "@/lib/i18n/registry";

/**
 * Per-locale Open Graph card for /{locale}/contact.
 *
 * Why this card exists
 * --------------------
 * /contact is the E-E-A-T trust column quality raters look at first
 * when assessing whether the publisher is a real, reachable human.
 * Sharing /es/contact or /pt-BR/contact – e.g., as proof of a
 * single-inbox support model in a thread about indie-SaaS support –
 * should preview in the reader's own language. The card mirrors the
 * en-US root fallback's visual contract; only the copy is localised.
 *
 * Brunson Hard-Rule reconciliation: the inbox claim ("one human,
 * real replies") is the same one rendered on the page itself,
 * sourced from getContactChrome(locale). The OG layer cannot say
 * something the page does not say.
 */

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export const alt =
  "Unlock SaaS – Contact – one inbox, one human, real replies";

export function generateStaticParams() {
  return renderableLocalesForPath("/contact").map((locale) => ({ locale }));
}

export default async function OgImage({
  params,
}: {
  params: Promise<{ locale: string }> | { locale: string };
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale) || rawLocale === "en-US") notFound();

  const locale = rawLocale as Exclude<Locale, "en-US">;
  const chrome = getContactChrome(locale);
  const row = getTranslationStatus("/contact", locale);
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
