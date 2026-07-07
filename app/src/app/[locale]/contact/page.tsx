import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { BreadcrumbListJsonLd } from "@/components/seo/json-ld";
import { isLocale, localizedPath, ogLocaleFormat, type Locale } from "@/lib/i18n/locales";
import {
  getTranslationStatus,
  isApproved,
  renderableLocalesForPath,
} from "@/lib/i18n/registry";
import { localeAlternates } from "@/lib/seo/markdown-alternates";
import { getContactChrome } from "@/lib/i18n/translations";

/**
 * Locale-aware Contact surface – mirrors the canonical /contact
 * (app/(marketing)/contact) with locale-swapped chrome.
 *
 * Three-state contract (identical to [locale]/faq/page.tsx):
 *   - approved → indexable, sitemap-listed, hreflang back-link present.
 *   - pending-review → renders for founder preview but noindex + omitted
 *     from sitemap + no hreflang advertised.
 *   - missing/archived → notFound() (404).
 *
 * Every gate above reads src/lib/i18n/registry.ts as the single source
 * of truth. Brunson Hard-Rule: never advertise alternates that aren't
 * approved; never render a translated page for a locale that doesn't
 * have a renderable row in the registry.
 *
 * Internal links: locale breadcrumb home routes to the locale shell
 * (localizedPath). CTAs to /diagnostic and /about stay canonical
 * (en-US) because those paths are not yet translated; localizedPath
 * would emit /es/diagnostic which 404s. The same discipline applies
 * to /privacy and /terms.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }> | { locale: string };
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale) || rawLocale === "en-US") return {};

  const locale = rawLocale as Locale;
  const chrome = getContactChrome(locale);
  const path = "/contact";
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
      type: "website",
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
  return renderableLocalesForPath("/contact").map((locale) => ({ locale }));
}

export default async function LocalizedContactPage({
  params,
}: {
  params: Promise<{ locale: string }> | { locale: string };
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale) || rawLocale === "en-US") notFound();

  const locale = rawLocale as Locale;
  const path = "/contact";

  const row = getTranslationStatus(path, locale);
  if (!row || row.status === "archived") {
    notFound();
  }

  const chrome = getContactChrome(locale);
  const localised = localizedPath(path, locale);
  const absoluteUrl = `https://unlocksaas.com${localised}`;

  const breadcrumbTrail = [
    {
      name: chrome.breadcrumbHome,
      url: `https://unlocksaas.com${localizedPath("/", locale)}`,
    },
    { name: chrome.breadcrumbContact, url: absoluteUrl },
  ] as const;

  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <BreadcrumbListJsonLd trail={breadcrumbTrail} />

      {row.status === "pending-review" ? (
        <div
          role="note"
          className="max-w-2xl mx-auto mb-8 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          <p className="font-semibold mb-1">
            Pending review – not indexed yet
          </p>
          <p className="leading-relaxed">
            {row.reviewNote ??
              "Translation is in review. The page renders but is noindex; sitemap omits it; no hreflang alternate is advertised."}
          </p>
        </div>
      ) : null}

      <article className="max-w-2xl mx-auto">
        <nav
          aria-label="Breadcrumb"
          className="text-xs text-muted-foreground mb-6"
        >
          <Link
            href={localizedPath("/", locale)}
            className="underline underline-offset-4 hover:text-foreground"
          >
            {chrome.breadcrumbHome}
          </Link>
          <span className="mx-2" aria-hidden>
            ›
          </span>
          <span>{chrome.breadcrumbContact}</span>
        </nav>

        <header className="mb-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            {chrome.pageLabel}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            {chrome.headline}
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            {chrome.lede}
          </p>
        </header>

        <Separator className="my-8" />

        <section className="mb-10 space-y-3 text-base leading-relaxed">
          <h2 className="text-2xl font-bold">{chrome.emailHeading}</h2>
          <p>
            <a
              href="mailto:maryan@unlocksaas.com"
              className="text-lg underline underline-offset-4 hover:text-foreground"
            >
              maryan@unlocksaas.com
            </a>
          </p>
          <p className="text-sm text-muted-foreground">{chrome.emailHelp}</p>
        </section>

        <section className="mb-10 space-y-3 text-base leading-relaxed">
          <h2 className="text-2xl font-bold">{chrome.stuckHeading}</h2>
          <p>{chrome.stuckP1}</p>
          <p>
            <Link
              href="/diagnostic"
              className="underline underline-offset-4 hover:text-foreground"
            >
              {chrome.stuckCta}
            </Link>
          </p>
        </section>

        <section className="mb-10 space-y-3 text-base leading-relaxed">
          <h2 className="text-2xl font-bold">{chrome.refundHeading}</h2>
          <p>{chrome.refundP}</p>
        </section>

        <section className="mb-10 space-y-3 text-base leading-relaxed">
          <h2 className="text-2xl font-bold">{chrome.pressHeading}</h2>
          <p>{chrome.pressP}</p>
        </section>

        <Separator className="my-8" />

        <div className="text-xs text-muted-foreground">
          <p>
            {chrome.relatedLabel}:{" "}
            <Link
              href="/about"
              className="underline underline-offset-4 hover:text-foreground"
            >
              {chrome.relatedAbout}
            </Link>{" "}
            ·{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-foreground"
            >
              {chrome.relatedPrivacy}
            </Link>{" "}
            ·{" "}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-foreground"
            >
              {chrome.relatedTerms}
            </Link>
          </p>
        </div>
      </article>
    </div>
  );
}
