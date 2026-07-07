import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import {
  BreadcrumbListJsonLd,
  FaqPageJsonLd,
} from "@/components/seo/json-ld";
import { isLocale, localizedPath, ogLocaleFormat, type Locale } from "@/lib/i18n/locales";
import {
  getTranslationStatus,
  isApproved,
  renderableLocalesForPath,
} from "@/lib/i18n/registry";
import { localeAlternates } from "@/lib/seo/markdown-alternates";
import { getFaqChrome, getFaqEntries } from "@/lib/i18n/translations";

/**
 * Locale-aware FAQ surface — mirrors the canonical /faq (app/(marketing)/faq)
 * with locale-swapped data and chrome.
 *
 * Three-state contract:
 *   - approved → indexable, sitemap-listed, hreflang back-link present.
 *   - pending-review → renders for founder preview but noindex + omitted
 *     from sitemap + no hreflang advertised.
 *   - missing/archived → notFound() (404).
 *
 * Every gate above reads `src/lib/i18n/registry.ts`. The registry is the
 * single source of truth.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }> | { locale: string };
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale) || rawLocale === "en-US") return {};

  const locale = rawLocale as Exclude<Locale, "en-US">;
  const chrome = getFaqChrome(locale);
  const path = "/faq";
  const localised = localizedPath(path, locale);
  const approved = isApproved(path, locale);

  return {
    title: chrome.seoTitle,
    description: chrome.seoDescription,
    alternates: localeAlternates(path, locale),
    robots: approved
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      type: "article",
      title: chrome.seoTitle,
      description: chrome.seoDescription,
      url: localised,
      locale:
        ogLocaleFormat(locale),
    },
    twitter: {
      card: "summary_large_image",
      title: chrome.seoTitle,
      description: chrome.seoDescription,
    },
  };
}


export function generateStaticParams() {
  return renderableLocalesForPath("/faq").map((locale) => ({ locale }));
}

export default async function LocalizedFaqPage({
  params,
}: {
  params: Promise<{ locale: string }> | { locale: string };
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale) || rawLocale === "en-US") notFound();

  const locale = rawLocale as Exclude<Locale, "en-US">;
  const path = "/faq";

  const row = getTranslationStatus(path, locale);
  if (!row || row.status === "archived") {
    notFound();
  }

  const entries = getFaqEntries(locale);
  const chrome = getFaqChrome(locale);
  const localised = localizedPath(path, locale);
  const absoluteUrl = `https://unlocksaas.com${localised}`;

  const breadcrumbTrail = [
    {
      name: chrome.breadcrumbHome,
      url: `https://unlocksaas.com${localizedPath("/", locale)}`,
    },
    { name: chrome.breadcrumbFaq, url: absoluteUrl },
  ] as const;

  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <FaqPageJsonLd
        items={entries}
        speakableSelectors={[".aeo-q", ".aeo-a"]}
        language={locale}
      />
      <BreadcrumbListJsonLd trail={breadcrumbTrail} />

      {row.status === "pending-review" ? (
        <div
          role="note"
          className="max-w-2xl mx-auto mb-8 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          <p className="font-semibold mb-1">
            Pending review — not indexed yet
          </p>
          <p className="leading-relaxed">
            {row.reviewNote ??
              "Translation is in review. The page renders but is noindex; sitemap omits it; no hreflang alternate is advertised."}
          </p>
        </div>
      ) : null}

      <article className="max-w-2xl mx-auto">
        <header className="mb-12">
          <nav
            aria-label="Breadcrumb"
            className="text-xs uppercase tracking-widest text-muted-foreground mb-3"
          >
            <Link
              href={localizedPath("/", locale)}
              className="hover:text-foreground transition-colors"
            >
              {chrome.breadcrumbHome}
            </Link>
            <span aria-hidden="true" className="mx-2">
              ›
            </span>
            <span>{chrome.breadcrumbFaq}</span>
          </nav>
          <h1
            data-speakable="headline"
            className="text-3xl md:text-4xl font-bold leading-tight mb-4"
          >
            {chrome.headline}
          </h1>
          <p
            data-speakable="lede"
            className="text-base text-muted-foreground leading-relaxed mb-4"
          >
            {chrome.lede}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed italic">
            {chrome.ledeDisclosure}
          </p>
        </header>

        <Separator className="my-10" />

        <div className="space-y-12">
          {entries.map((entry) => (
            <section key={entry.q} aria-labelledby={slugify(entry.q)}>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                {entry.category}
              </p>
              <h2
                id={slugify(entry.q)}
                className="aeo-q text-xl md:text-2xl font-bold leading-snug mb-4"
              >
                {entry.q}
              </h2>
              <p className="aeo-a text-base text-muted-foreground leading-relaxed">
                {entry.a}
              </p>
            </section>
          ))}
        </div>

        <Separator className="my-12" />

        <section className="text-center">
          <h2 className="text-lg font-bold mb-3">{chrome.ctaTitle}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-md mx-auto">
            {chrome.ctaDescription}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/diagnostic"
              className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-6 py-3 text-base font-medium"
            >
              {chrome.ctaPrimary}
            </Link>
            <Link
              href="/starter"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors px-6 py-3 text-base font-medium"
            >
              {chrome.ctaSecondary}
            </Link>
          </div>
        </section>

        <footer className="mt-16 text-center">
          <p className="text-xs text-muted-foreground italic leading-relaxed">
            {chrome.footerAttribution}
          </p>
        </footer>
      </article>
    </div>
  );
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}
