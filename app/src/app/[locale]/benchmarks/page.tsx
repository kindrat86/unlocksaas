import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { isLocale, localizedPath, type Locale } from "@/lib/i18n/locales";
import {
  getTranslationStatus,
  isApproved,
  localesWithApprovedContent,
  renderableLocalesForPath,
} from "@/lib/i18n/registry";
import {
  getBenchmarkEntries,
  getBenchmarksChrome,
} from "@/lib/i18n/translations";
import { BASE_URL, ID } from "@/lib/seo/entity";

/**
 * Locale-aware /benchmarks hub – mirrors (marketing)/benchmarks/page.tsx
 * with locale-swapped chrome and overlay benchmark data.
 *
 * Three-state contract identical to other [locale] routes.
 *
 * JSON-LD: CollectionPage with ItemList of localized metrics. inLanguage
 * matches locale. isPartOf points at the en-US WebSite @id so the schema
 * graph stays one entity across locales.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }> | { locale: string };
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale) || rawLocale === "en-US") return {};

  const locale = rawLocale as Exclude<Locale, "en-US">;
  const chrome = getBenchmarksChrome(locale);
  const path = "/benchmarks";
  const localised = localizedPath(path, locale);
  const approved = isApproved(path, locale);

  return {
    title: chrome.hubSeoTitle,
    description: chrome.hubSeoDescription,
    alternates: {
      canonical: localised,
      languages: {
        "en-US": path,
        "x-default": path,
        ...(approved
          ? Object.fromEntries(
              localesWithApprovedContent().map((loc) => [
                loc,
                localizedPath(path, loc),
              ]),
            )
          : {}),
      },
    },
    robots: approved
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      type: "website",
      title: chrome.hubSeoTitle,
      description: chrome.hubSeoDescription,
      url: localised,
      siteName: "Unlock SaaS",
      locale:
        locale === "pt-BR" ? "pt_BR" : locale === "es" ? "es_ES" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: chrome.hubSeoTitle,
      description: chrome.hubSeoDescription,
    },
  };
}


export function generateStaticParams() {
  return renderableLocalesForPath("/benchmarks").map((locale) => ({
    locale,
  }));
}

export default async function LocalizedBenchmarksHub({
  params,
}: {
  params: Promise<{ locale: string }> | { locale: string };
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale) || rawLocale === "en-US") notFound();

  const locale = rawLocale as Exclude<Locale, "en-US">;
  const path = "/benchmarks";
  const row = getTranslationStatus(path, locale);
  if (!row || row.status === "archived") notFound();

  const chrome = getBenchmarksChrome(locale);
  const entries = getBenchmarkEntries(locale);
  const localised = localizedPath(path, locale);
  const absoluteUrl = `${BASE_URL}${localised}`;
  const inLanguage = locale === "pt-BR" ? "pt-BR" : "es";

  const collectionJson = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: chrome.hubSeoTitle,
    url: absoluteUrl,
    description: chrome.hubSeoDescription,
    isPartOf: { "@id": ID.website },
    inLanguage,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: entries.length,
      itemListElement: entries.map((e, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: e.metric,
        url: `${BASE_URL}${localizedPath(`/benchmarks/${e.slug}`, locale)}`,
        description: e.aeoAnswer,
      })),
    },
  });

  const breadcrumbJson = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: chrome.hubBreadcrumbHome,
        item: `${BASE_URL}${localizedPath("/", locale)}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: chrome.hubBreadcrumbBenchmarks,
        item: absoluteUrl,
      },
    ],
  });

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: collectionJson }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbJson }}
      />

      <div className="max-w-3xl mx-auto px-6 pt-10">
        {row.status === "pending-review" ? (
          <div
            role="note"
            className="mb-8 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          >
            <p className="font-semibold mb-1">
              {chrome.pendingReviewBannerTitle}
            </p>
            <p className="leading-relaxed">
              {row.reviewNote ?? chrome.pendingReviewBannerBody}
            </p>
          </div>
        ) : null}

        <nav
          aria-label="Breadcrumb"
          className="text-xs text-muted-foreground"
        >
          <ol className="flex items-center gap-2">
            <li>
              <Link
                href={localizedPath("/", locale)}
                className="hover:underline"
              >
                {chrome.hubBreadcrumbHome}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-foreground">
              {chrome.hubBreadcrumbBenchmarks}
            </li>
          </ol>
        </nav>
      </div>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          {chrome.hubLabel}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {chrome.hubHeadline}
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          {chrome.hubLede}
        </p>
      </header>

      <Separator className="my-2" />

      <section className="max-w-3xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {entries.map((e) => (
            <Card
              key={e.slug}
              className="hover:border-primary/30 transition"
            >
              <CardContent className="pt-6">
                <p className="text-sm font-semibold mb-2 capitalize">
                  <Link
                    href={localizedPath(`/benchmarks/${e.slug}`, locale)}
                    className="hover:text-primary transition"
                  >
                    {e.metric} →
                  </Link>
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {e.aeoAnswer.slice(0, 200)}
                  {e.aeoAnswer.length > 200 ? "…" : ""}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
