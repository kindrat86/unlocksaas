import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { isLocale, localizedPath, ogLocaleFormat, type Locale } from "@/lib/i18n/locales";
import {
  getTranslationStatus,
  isApproved,
  localesWithApprovedContent,
  renderableLocalesForPathOrStub,
} from "@/lib/i18n/registry";
import {
  TEARDOWN_SLUGS,
  getTeardownBySlug,
} from "@/lib/funnel-teardowns";
import { BASE_URL, ID } from "@/lib/seo/entity";
import {
  getPseoSharedChrome,
  getPseoClusterChrome,
} from "@/lib/i18n/translations";

/**
 * Locale-aware /funnel-teardown/[slug] detail – plumbing variant.
 * See /[locale]/alternatives-to/[slug]/page.tsx for the rollout pattern.
 */

const PATH = "/funnel-teardown";


type RouteParams = { locale: string; slug: string };

export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of renderableLocalesForPathOrStub(PATH)) {
    for (const slug of TEARDOWN_SLUGS) {
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
  const t = getTeardownBySlug(slug);
  if (!t) return {};

  const path = `${PATH}/${slug}`;
  const localised = localizedPath(path, locale);
  const approved = isApproved(PATH, locale);

  const title = `${t.displayName} Funnel Teardown – Hook / Story / Offer`;
  const description = t.oneLine;

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
        ogLocaleFormat(locale),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function LocalizedFunnelTeardownDetail({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale) || rawLocale === "en-US") notFound();

  const locale = rawLocale as Exclude<Locale, "en-US">;
  const row = getTranslationStatus(PATH, locale);
  if (!row || row.status === "archived") notFound();

  const t = getTeardownBySlug(slug);
  if (!t) notFound();

  const path = `${PATH}/${slug}`;
  const localised = localizedPath(path, locale);
  const canonicalUrl = `${BASE_URL}${localised}`;
  const inLanguage = locale as string === "pt" ? "pt-BR" : "es";
  const enCanonicalUrl = `${BASE_URL}${path}`;
  const shared = getPseoSharedChrome(locale);
  const cluster = getPseoClusterChrome("funnel-teardown", locale);

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
        name: "Funnel teardowns",
        item: `${BASE_URL}${localizedPath(PATH, locale)}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${t.displayName} funnel teardown`,
        item: canonicalUrl,
      },
    ],
  });

  const articleJson = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${t.displayName} Funnel Teardown – Hook / Story / Offer`,
    description: t.oneLine,
    author: { "@id": ID.person },
    publisher: { "@id": ID.organization },
    isPartOf: { "@id": ID.website },
    datePublished: t.lastVerified,
    dateModified: t.lastVerified,
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
              {t.displayName}
            </li>
          </ol>
        </nav>
      </div>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {t.displayName} funnel teardown
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {t.oneLine}
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
              Run the same teardown on your own page
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The 90-second diagnostic applies Hook / Story / Offer to your
              live product page.
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
