import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { isLocale, localizedPath, type Locale } from "@/lib/i18n/locales";
import {
  getTranslationStatus,
  isApproved,
  localesWithApprovedContent,
  renderableLocalesForPathOrStub,
} from "@/lib/i18n/registry";
import {
  SHOULD_I_ENTRIES,
  SHOULD_I_CATEGORIES,
  SHOULD_I_CATEGORY_LABELS,
  SHOULD_I_VERDICT_LABELS,
  type ShouldIVerdict,
} from "@/lib/should-i";
import { BASE_URL, ID } from "@/lib/seo/entity";
import {
  getPseoSharedChrome,
  getPseoClusterChrome,
} from "@/lib/i18n/translations";

/**
 * Locale-aware /should-i hub – plumbing variant.
 *
 * See /[locale]/answers/page.tsx for the translation rollout workflow.
 * Status pending-review until founder verifies preview URLs and flips
 * the registry row to approved. While pending: robots noindex, sitemap
 * omits, no hreflang advertised; an amber banner discloses the
 * partial-localization state.
 */

const PATH = "/should-i";

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
  const cluster = getPseoClusterChrome("should-i", locale);

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

function VerdictBadge({ verdict }: { verdict: ShouldIVerdict }) {
  const variant: Record<ShouldIVerdict, "default" | "secondary" | "outline"> = {
    yes: "default",
    no: "outline",
    depends: "secondary",
    "not-yet": "secondary",
  };
  return (
    <Badge variant={variant[verdict]} className="text-xs uppercase tracking-wide">
      {SHOULD_I_VERDICT_LABELS[verdict]}
    </Badge>
  );
}

export default async function LocalizedShouldIHub({
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
  const cluster = getPseoClusterChrome("should-i", locale);

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
        name: cluster.breadcrumbHub,
        item: absoluteUrl,
      },
    ],
  });

  const collectionJson = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Indie SaaS Founder Decisions",
    url: absoluteUrl,
    inLanguage,
    description:
      "Direct yes / no / depends / not-yet verdicts on the decisions indie SaaS founders actually face.",
    isPartOf: { "@id": ID.website },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: SHOULD_I_ENTRIES.length,
      itemListElement: SHOULD_I_ENTRIES.map((e, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: e.question,
        url: `${BASE_URL}${localizedPath(`/should-i/${e.slug}`, locale)}`,
        description: e.directAnswer,
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

      {SHOULD_I_CATEGORIES.map((category) => {
        const items = SHOULD_I_ENTRIES.filter((e) => e.category === category);
        if (items.length === 0) return null;
        return (
          <section
            key={category}
            className="max-w-3xl mx-auto px-6 py-6"
            aria-labelledby={`cat-${category}`}
          >
            <h2
              id={`cat-${category}`}
              className="text-xl font-bold mb-3 leading-tight"
            >
              {SHOULD_I_CATEGORY_LABELS[category]}
            </h2>
            <ul
              className="space-y-2"
              aria-label={cluster.hubListAriaLabel}
            >
              {items.map((e) => (
                <li
                  key={e.slug}
                  className="flex items-start gap-3 leading-relaxed"
                >
                  <span className="mt-0.5 shrink-0">
                    <VerdictBadge verdict={e.verdict} />
                  </span>
                  <Link
                    href={localizedPath(`/should-i/${e.slug}`, locale)}
                    className="text-base text-primary hover:underline"
                  >
                    {e.question}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <Separator className="my-2" />

      <section
        className="max-w-3xl mx-auto px-6 py-12 border-t border-border/40"
        aria-labelledby="cta"
      >
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              Decision not in this list?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Reach the founder directly. Most decisions get a same-day reply.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href={localizedPath("/contact", locale)}>
                  Ask a question
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={localizedPath("/diagnostic", locale)}>
                  Get the free diagnostic
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
