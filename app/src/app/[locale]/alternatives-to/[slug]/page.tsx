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
  renderableLocalesForPath,
} from "@/lib/i18n/registry";
import {
  ALTERNATIVE_SLUGS,
  getAlternativeBySlug,
} from "@/lib/alternatives";
import { BASE_URL, ID } from "@/lib/seo/entity";
import {
  getPseoSharedChrome,
  getPseoClusterChrome,
} from "@/lib/i18n/translations";

/**
 * Locale-aware /alternatives-to/[slug] detail – plumbing variant.
 *
 * Minimal layout. The full canonical-equivalent layout (capability table,
 * FAQ, related, etc.) gets authored alongside the translation overlay; this
 * shell exists so the route pre-renders for any (slug, locale) once a
 * pending-review or approved row lands in TRANSLATIONS.
 *
 * Today, no row exists for (/alternatives-to, locale) → 404.
 */

const PATH = "/alternatives-to";

export const dynamic = "force-static";

type RouteParams = { locale: string; slug: string };

export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of renderableLocalesForPath(PATH)) {
    for (const slug of ALTERNATIVE_SLUGS) {
      params.push({ locale, slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale) || rawLocale === "en-US") return {};

  const locale = rawLocale as Exclude<Locale, "en-US">;
  const alt = getAlternativeBySlug(slug);
  if (!alt) return {};

  const path = `${PATH}/${slug}`;
  const localised = localizedPath(path, locale);
  const approved = isApproved(PATH, locale);

  const title = `${alt.displayName} vs Unlock SaaS – Honest Comparison`;
  const description = alt.oneLine;

  return {
    title,
    description,
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
      type: "article",
      title,
      description,
      url: localised,
      siteName: "Unlock SaaS",
      locale:
        locale === "pt-BR" ? "pt_BR" : locale === "es" ? "es_ES" : "en_US",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function LocalizedAlternativeDetail({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale) || rawLocale === "en-US") notFound();

  const locale = rawLocale as Exclude<Locale, "en-US">;
  const row = getTranslationStatus(PATH, locale);
  if (!row || row.status === "archived") notFound();

  const alt = getAlternativeBySlug(slug);
  if (!alt) notFound();

  const path = `${PATH}/${slug}`;
  const localised = localizedPath(path, locale);
  const canonicalUrl = `${BASE_URL}${localised}`;
  const inLanguage = locale === "pt-BR" ? "pt-BR" : "es";
  const enCanonicalUrl = `${BASE_URL}${path}`;
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
        item: `${BASE_URL}${localizedPath(PATH, locale)}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${alt.displayName} vs Unlock SaaS`,
        item: canonicalUrl,
      },
    ],
  });

  const articleJson = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${alt.displayName} vs Unlock SaaS – Honest Comparison`,
    description: alt.oneLine,
    author: { "@id": ID.person },
    publisher: { "@id": ID.organization },
    isPartOf: { "@id": ID.website },
    datePublished: alt.lastVerified,
    dateModified: alt.lastVerified,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    inLanguage,
  });

  return (
    <article className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbJson }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: articleJson }}
      />

      <div className="max-w-3xl mx-auto px-6 pt-10">
        {row.status === "pending-review" ? (
          <div
            role="note"
            className="mb-8 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          >
            <p className="font-semibold mb-1">{shared.pendingBannerTitle}</p>
            <p className="leading-relaxed">
              {row.reviewNote ?? shared.pendingBannerDetailBody}
            </p>
          </div>
        ) : null}

        <nav
          aria-label="Breadcrumb"
          className="text-xs text-muted-foreground"
        >
          <ol className="flex items-center gap-2 flex-wrap">
            <li>
              <Link
                href={localizedPath("/", locale)}
                className="hover:underline"
              >
                {shared.breadcrumbHome}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href={localizedPath(PATH, locale)}
                className="hover:underline"
              >
                {cluster.breadcrumbHub}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-foreground">
              {alt.displayName}
            </li>
          </ol>
        </nav>
      </div>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          {alt.category}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {alt.displayName} vs Unlock SaaS
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {alt.oneLine}
        </p>
      </header>

      <Separator className="my-2" />

      <section className="max-w-3xl mx-auto px-6 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-semibold leading-relaxed mb-2">
              {cluster.detailEnglishCalloutTitle}
            </p>
            <p className="text-sm leading-relaxed mb-4">
              {cluster.detailEnglishCalloutBody}
            </p>
            <p>
              <a
                href={enCanonicalUrl}
                className="text-sm font-semibold text-primary hover:underline break-all"
              >
                {enCanonicalUrl} →
              </a>
            </p>
            <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
              {shared.detailEnglishCalloutSuffix}
            </p>
          </CardContent>
        </Card>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-12 border-t border-border/40"
        aria-labelledby="cta"
      >
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              Run the diagnostic on your own page
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The 90-second diagnostic labels what is broken on your offer.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href={localizedPath("/diagnostic", locale)}>
                  Get the free diagnostic
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={localizedPath(PATH, locale)}>
                  {cluster.detailCtaSecondary}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </article>
  );
}
