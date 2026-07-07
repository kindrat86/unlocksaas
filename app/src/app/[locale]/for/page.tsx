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
import { NICHE_ENTRIES } from "@/lib/niches";
import { BASE_URL, ID } from "@/lib/seo/entity";
import {
  getPseoSharedChrome,
  getPseoClusterChrome,
} from "@/lib/i18n/translations";

/**
 * Locale-aware /for hub – plumbing variant.
 *
 * See /[locale]/alternatives-to/page.tsx for the translation rollout
 * workflow.
 */

const PATH = "/for";


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
  const cluster = getPseoClusterChrome("for", locale);

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

export default async function LocalizedForHub({
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
  const cluster = getPseoClusterChrome("for", locale);

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
        name: "For",
        item: absoluteUrl,
      },
    ],
  });

  const collectionJson = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Unlock SaaS niche-specific pages",
    url: absoluteUrl,
    inLanguage,
    description:
      "Niche-specific funnel diagnostic landing pages, tuned to each cohort's vocabulary and common mistakes.",
    isPartOf: { "@id": ID.website },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: NICHE_ENTRIES.length,
      itemListElement: NICHE_ENTRIES.map((e, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `Unlock SaaS for ${e.displayName}`,
        url: `${BASE_URL}${localizedPath(`/for/${e.slug}`, locale)}`,
        description: e.heroSubhead,
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
        className="max-w-3xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-4"
        aria-labelledby="niches"
      >
        <h2 id="niches" className="sr-only">
          {cluster.hubListAriaLabel}
        </h2>
        {NICHE_ENTRIES.map((e) => (
          <Card key={e.slug} className="hover:border-primary/40 transition">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold leading-tight mb-2">
                <Link
                  href={localizedPath(`/for/${e.slug}`, locale)}
                  className="hover:underline capitalize"
                >
                  For {e.displayName}
                </Link>
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                {e.cohortPain.slice(0, 220)}
                {e.cohortPain.length > 220 ? "..." : ""}
              </p>
              <Link
                href={localizedPath(`/for/${e.slug}`, locale)}
                className="text-sm font-semibold text-primary hover:underline"
              >
                {cluster.hubReadMoreLabel}
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>

      <Separator className="my-2" />

      <section
        className="max-w-3xl mx-auto px-6 py-12 border-t border-border/40"
        aria-labelledby="cta"
      >
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              Not in this list? The diagnostic works anyway.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The Hook / Story / Offer triage is cohort-agnostic.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href={localizedPath("/diagnostic", locale)}>
                  Get the free diagnostic
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={localizedPath("/glossary", locale)}>
                  Brunson glossary
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
