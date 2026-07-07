import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { isLocale, localizedPath, type Locale } from "@/lib/i18n/locales";
import {
  getTranslationStatus,
  isApproved,
  localesWithApprovedContent,
  renderableLocalesForPathOrStub,
} from "@/lib/i18n/registry";
import { ALTERNATIVES } from "@/lib/alternatives";
import { BASE_URL } from "@/lib/seo/entity";
import {
  getPseoSharedChrome,
  getPseoClusterChrome,
} from "@/lib/i18n/translations";

/**
 * Locale-aware /alternatives-to hub – plumbing variant.
 *
 * Today: 404 unless TRANSLATIONS carries a row for (/alternatives-to, locale).
 * No such row exists at ship, so this route emits zero public URLs and is
 * absent from the sitemap and hreflang map. Brunson Hard-Rule honored.
 *
 * Future translation work:
 *   1. Author `alternatives.<locale>.ts` overlay file with translated
 *      oneLine + verdict fields per ALTERNATIVE_SLUGS.
 *   2. Add overlay getter to `@/lib/i18n/translations`.
 *   3. Swap the canonical ALTERNATIVES import below for the overlay getter.
 *   4. Author per-locale PAGE_CHROME_ALTERNATIVES record and swap inline
 *      English strings for chrome.* references.
 *   5. Add a TRANSLATIONS row (pending-review for preview → approved for
 *      indexable). Sitemap + hreflang + Content-Language pick it up
 *      automatically.
 *
 * JSON-LD: CollectionPage + BreadcrumbList, both with `inLanguage` keyed to
 * the locale tag and URLs prefixed under `/{locale}`. Schema graph remains
 * one entity (publisher/website @id resolve to the en-US canonical).
 */

const PATH = "/alternatives-to";


export function generateStaticParams() {
  return renderableLocalesForPathOrStub(PATH).map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale) || rawLocale === "en-US") return {};

  const locale = rawLocale as Exclude<Locale, "en-US">;
  const localised = localizedPath(PATH, locale);
  const approved = isApproved(PATH, locale);
  const cluster = getPseoClusterChrome("alternatives-to", locale);

  const title = cluster.seoTitle;
  const description = cluster.seoDescription;

  return {
    title,
    description,
    alternates: {
      canonical: localised,
      languages: {
        "en-US": PATH,
        "x-default": PATH,
        ...(approved
          ? Object.fromEntries(
              localesWithApprovedContent().map((loc) => [
                loc,
                localizedPath(PATH, loc),
              ]),
            )
          : {}),
      },
    },
    robots: approved
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      title,
      description,
      type: "website",
      url: localised,
      siteName: "Unlock SaaS",
      locale:
        ogLocaleFormat(locale),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function LocalizedAlternativesHub({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale) || rawLocale === "en-US") notFound();

  const locale = rawLocale as Exclude<Locale, "en-US">;
  const row = getTranslationStatus(PATH, locale);
  if (!row || row.status === "archived") notFound();

  const localised = localizedPath(PATH, locale);
  const absoluteUrl = `${BASE_URL}${localised}`;
  const inLanguage = locale === "pt-BR" ? "pt-BR" : "es";
  const shared = getPseoSharedChrome(locale);
  const cluster = getPseoClusterChrome("alternatives-to", locale);

  const breadcrumbJson = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${BASE_URL}${localizedPath("/", locale)}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Alternatives",
        item: absoluteUrl,
      },
    ],
  });

  const collectionJson = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Honest Alternatives to Unlock SaaS",
    url: absoluteUrl,
    inLanguage,
    description:
      "Honest side-by-side comparisons of Unlock SaaS against the tools the typical post-launch pre-revenue SaaS founder is already evaluating.",
    isPartOf: { "@type": "WebSite", name: "Unlock SaaS", url: BASE_URL },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: ALTERNATIVES.length,
      itemListElement: ALTERNATIVES.map((alt, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${alt.displayName} vs Unlock SaaS`,
        url: `${BASE_URL}${localizedPath(`/alternatives-to/${alt.slug}`, locale)}`,
      })),
    },
  });

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbJson }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: collectionJson }}
      />

      <div className="max-w-3xl mx-auto px-6 pt-10">
        {row.status === "pending-review" ? (
          <div
            role="note"
            className="mb-8 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          >
            <p className="font-semibold mb-1">{shared.pendingBannerTitle}</p>
            <p className="leading-relaxed">
              {row.reviewNote ?? shared.pendingBannerHubBody}
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
                {shared.breadcrumbHome}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-foreground">
              {cluster.breadcrumbHub}
            </li>
          </ol>
        </nav>
      </div>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          {cluster.hubEyebrow}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {cluster.hubHeadline}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {cluster.hubLede}
        </p>
      </header>

      <Separator className="my-2" />

      <section
        className="max-w-3xl mx-auto px-6 py-8 space-y-4"
        aria-labelledby="list"
      >
        <h2 id="list" className="sr-only">
          {cluster.hubListAriaLabel}
        </h2>
        {ALTERNATIVES.map((alt) => (
          <Card key={alt.slug} className="hover:border-primary/30 transition">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-lg font-semibold leading-tight">
                  {alt.displayName} vs Unlock SaaS
                </h3>
                <span className="text-xs uppercase tracking-widest text-muted-foreground shrink-0">
                  {alt.category}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {alt.oneLine}
              </p>
              <Link
                href={localizedPath(`/alternatives-to/${alt.slug}`, locale)}
                className="text-sm font-semibold text-primary hover:underline"
              >
                {cluster.hubReadMoreLabel}
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-12"
        aria-labelledby="cta"
      >
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              Not sure if Unlock SaaS is right for you?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The 90-second diagnostic answers that.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href={localizedPath("/diagnostic", locale)}>
                  Get the free diagnostic
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={localizedPath("/starter", locale)}>
                  Start with $1
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
