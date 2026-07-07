import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { OG_CONTENT_TYPE, OG_SIZE, buildOgCard } from "@/lib/seo/og-card";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import { getRepeatableChrome } from "@/lib/i18n/translations";
import {
  getTranslationStatus,
  renderableLocalesForPath,
} from "@/lib/i18n/registry";

/**
 * Per-locale Open Graph card for /{locale}/repeatable.
 *
 * Why this card exists
 * --------------------
 * /repeatable is the Rung 2 published-spec / public-commitment page.
 * Its visibility on social – particularly LATAM and Brazilian indie
 * founder communities – is the entire point of publishing a spec
 * before the build. A locale-correct share preview is the lever
 * that turns a thread mention into a click for a non-English
 * reader.
 *
 * Brunson Hard-Rule reconciliation: the subhead reads from
 * getRepeatableChrome(locale).seoDescription, which the page also
 * renders. No build-gate language is added in the OG layer; the
 * "spec published; build gated" framing stays exactly as it is on
 * the rendered page.
 */

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export const alt =
  "Unlock SaaS – Rung 2 – The Repeatable Revenue Layer (spec published, build gated)";

export function generateStaticParams() {
  return renderableLocalesForPath("/repeatable").map((locale) => ({ locale }));
}

export default async function OgImage({
  params,
}: {
  params: Promise<{ locale: string }> | { locale: string };
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale) || rawLocale === "en-US") notFound();

  const locale = rawLocale as Locale;
  const chrome = getRepeatableChrome(locale);
  const row = getTranslationStatus("/repeatable", locale);
  const dateline = row?.approvedAt
    ? `Reviewed ${row.approvedAt} · unlocksaas.com`
    : "unlocksaas.com";

  return new ImageResponse(
    buildOgCard({
      // topLabel is "Rung 2 – The Repeatable Revenue Layer" in en-US
      // and the equivalent localised phrase in es / pt-BR. It is the
      // canonical surface label the page itself uses, so the eyebrow
      // chip mirrors it (long but legible at 20px on a 1200x630).
      eyebrow: chrome.topLabel,
      headline: chrome.headline,
      subhead: chrome.seoDescription,
      dateline,
    }),
    { ...OG_SIZE },
  );
}
