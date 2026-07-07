import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { isLocale, localizedPath, type Locale } from "@/lib/i18n/locales";
import {
  getTranslationStatus,
  isApproved,
  renderableLocalesForPath,
} from "@/lib/i18n/registry";
import { localeAlternates } from "@/lib/seo/markdown-alternates";
import {
  getGlossaryChrome,
  getGlossaryEntries,
} from "@/lib/i18n/translations";
import { BASE_URL, ID } from "@/lib/seo/entity";

/**
 * Locale-aware /glossary hub – mirrors the canonical
 * (marketing)/glossary/page.tsx with locale-swapped chrome and overlay
 * GLOSSARY data, while keeping the structural fields drift-free with
 * the en-US canonical.
 *
 * Three-state contract (identical to /faq, /editorial-policy, etc.):
 *   - approved → indexable + hreflang alternate + sitemap + no banner.
 *   - pending-review → renders + amber banner + noindex + sitemap-omitted.
 *   - missing/archived → notFound() (404).
 *
 * No 'use cache' directives — cacheComponents is currently OFF in
 * next.config.mjs (deferred per L9-40); reads sit safely outside that
 * constraint and render statically via force-static.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }> | { locale: string };
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale) || rawLocale === "en-US") return {};

  const locale = rawLocale as Exclude<Locale, "en-US">;
  const chrome = getGlossaryChrome(locale);
  const path = "/glossary";
  const localised = localizedPath(path, locale);
  const approved = isApproved(path, locale);

  return {
    title: chrome.hubSeoTitle,
    description: chrome.hubSeoDescription,
    alternates: localeAlternates(path, locale),
    robots: approved
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      type: "article",
      title: chrome.hubSeoTitle,
      description: chrome.hubSeoDescription,
      url: localised,
      siteName: "Unlock SaaS",
      locale:
        ogLocaleFormat(locale),
    },
    twitter: {
      card: "summary",
      title: chrome.hubSeoTitle,
      description: chrome.hubSeoDescription,
    },
  };
}


export function generateStaticParams() {
  return renderableLocalesForPath("/glossary").map((locale) => ({
    locale,
  }));
}

export default async function LocalizedGlossaryHub({
  params,
}: {
  params: Promise<{ locale: string }> | { locale: string };
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale) || rawLocale === "en-US") notFound();

  const locale = rawLocale as Exclude<Locale, "en-US">;
  const path = "/glossary";

  const row = getTranslationStatus(path, locale);
  if (!row || row.status === "archived") {
    notFound();
  }

  const chrome = getGlossaryChrome(locale);
  const entries = getGlossaryEntries(locale);
  const localised = localizedPath(path, locale);
  const absoluteUrl = `${BASE_URL}${localised}`;
  const inLanguageTag = locale === "pt-BR" ? "pt-BR" : "es";

  const CATEGORY_ORDER = [
    "Hook",
    "Story",
    "Offer",
    "Diagnostic",
    "Audience",
    "Editorial",
  ] as const;
  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    entries: entries.filter((e) => e.category === category),
  })).filter((g) => g.entries.length > 0);

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
        name: chrome.hubBreadcrumbGlossary,
        item: absoluteUrl,
      },
    ],
  });

  const collectionJson = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${absoluteUrl}#collection`,
    name: chrome.hubSeoTitle,
    description: chrome.hubSeoDescription,
    url: absoluteUrl,
    inLanguage: inLanguageTag,
    isPartOf: { "@id": ID.website },
    publisher: { "@id": ID.organization },
    author: { "@id": ID.person },
  });

  const definedTermSetJson = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "@id": `${BASE_URL}/glossary#defined-term-set`,
    name: "Brunson Glossary",
    inLanguage: inLanguageTag,
    hasDefinedTerm: entries.map((g) => ({
      "@type": "DefinedTerm",
      "@id": `${BASE_URL}/glossary/${g.slug}#term`,
      name: g.term,
      description: g.shortDefinition,
      inLanguage: inLanguageTag,
      url: `${BASE_URL}${localizedPath(`/glossary/${g.slug}`, locale)}`,
    })),
  });

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbJson }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: collectionJson }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: definedTermSetJson }}
      />

      <div className="max-w-4xl mx-auto px-6 py-12 sm:py-16">
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
          className="text-xs text-muted-foreground mb-6"
        >
          <Link
            href={localizedPath("/", locale)}
            className="underline underline-offset-4 hover:text-foreground"
          >
            {chrome.hubBreadcrumbHome}
          </Link>
          <span aria-hidden="true" className="mx-2">
            ›
          </span>
          <span>{chrome.hubBreadcrumbGlossary}</span>
        </nav>

        <header className="mb-12">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            {chrome.hubLabel}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            {chrome.hubHeadline}
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            {chrome.hubLede}
          </p>
        </header>

        <Separator className="my-8" />

        {grouped.map((group) => (
          <section key={group.category} className="mb-12">
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
              {chrome.hubCategoryLabel(group.category)}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {group.entries.map((g) => (
                <Card
                  key={g.slug}
                  id={g.slug}
                  className="hover:border-primary/30 transition"
                >
                  <CardContent className="pt-6">
                    <p className="text-sm font-semibold mb-2">
                      <Link
                        href={localizedPath(`/glossary/${g.slug}`, locale)}
                        className="hover:text-primary transition"
                      >
                        {g.term} →
                      </Link>
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {g.shortDefinition}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
