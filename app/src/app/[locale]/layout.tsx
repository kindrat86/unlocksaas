import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import { localesWithRenderableContent } from "@/lib/i18n/registry";

/**
 * Layout for the `[locale]` segment.
 *
 * Wraps every translated route (`/es/*`, `/pt-BR/*`) with a locale-aware
 * shell. Next.js App Router renders the canonical `<html>` / `<body>`
 * exactly once at the root layout — this nested layout therefore wraps
 * children in `<div lang="{locale}">` and supplies per-locale Metadata
 * (Content-Language meta + og:locale).
 *
 * Locale validation is strict: `generateStaticParams` returns only
 * locales with at least one approved translation row. Unknown segments
 * 404 via `dynamicParams = false` declared below.
 *
 * Brunson Hard-Rule: a locale with zero approved translations does not
 * pre-render. Its routes simply do not exist publicly.
 */

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }> | { locale: string };
}

/**
 * Pre-render the locale shell for every locale with at least one
 * renderable row (approved OR pending-review). This is wider than
 * `localesWithApprovedContent()` on purpose: pending-review pages need
 * their parent shell to exist so the founder can preview at the live URL.
 *
 * Per-page generateStaticParams further narrows to which (path, locale)
 * pairs actually render — a locale shell without an approved page for a
 * given path 404s at the page layer, not the shell layer.
 */
export function generateStaticParams() {
  return localesWithRenderableContent().map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }> | { locale: string };
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    other: {
      "content-language": locale,
    },
    openGraph: {
      locale:
        locale === "pt-BR" ? "pt_BR" : locale === "es" ? "es_ES" : "en_US",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale) || rawLocale === "en-US") {
    notFound();
  }
  const locale = rawLocale as Exclude<Locale, "en-US">;
  return <div lang={locale}>{children}</div>;
}

export const dynamic = "force-static";
export const dynamicParams = false;
