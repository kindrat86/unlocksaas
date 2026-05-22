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
  SHOULD_I_SLUGS,
  SHOULD_I_VERDICT_LABELS,
  getShouldIBySlug,
  type ShouldIEntry,
} from "@/lib/should-i";
import { BASE_URL, ID } from "@/lib/seo/entity";
import {
  getPseoSharedChrome,
  getPseoClusterChrome,
} from "@/lib/i18n/translations";

/**
 * Locale-aware /should-i/[decision] detail – plumbing variant.
 * See /[locale]/answers/[slug]/page.tsx for the rollout pattern.
 */

const PATH = "/should-i";

type RouteParams = { locale: string; decision: string };

export function generateStaticParams() {
  const params: { locale: string; decision: string }[] = [];
  for (const locale of renderableLocalesForPathOrStub(PATH)) {
    for (const decision of SHOULD_I_SLUGS) {
      params.push({ locale, decision });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { locale: rawLocale, decision } = await params;
  if (!isLocale(rawLocale) || rawLocale === "en-US") return {};

  const locale = rawLocale as Exclude<Locale, "en-US">;
  const e = getShouldIBySlug(decision);
  if (!e) return {};

  const path = `${PATH}/${decision}`;
  const localised = localizedPath(path, locale);
  const approved = isApproved(PATH, locale);

  const title = e.question;
  const description = `${SHOULD_I_VERDICT_LABELS[e.verdict]} – ${e.verdictHeadline}`;

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

function verdictStyle(verdict: ShouldIEntry["verdict"]): {
  badgeVariant: "default" | "secondary" | "outline";
  borderClass: string;
  bgClass: string;
} {
  switch (verdict) {
    case "yes":
      return {
        badgeVariant: "default",
        borderClass: "border-primary/40",
        bgClass: "bg-primary/5",
      };
    case "no":
      return {
        badgeVariant: "outline",
        borderClass: "border-destructive/40",
        bgClass: "bg-destructive/5",
      };
    case "depends":
    case "not-yet":
      return {
        badgeVariant: "secondary",
        borderClass: "border-muted-foreground/30",
        bgClass: "bg-muted/40",
      };
  }
}

export default async function LocalizedShouldIDetail({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { locale: rawLocale, decision } = await params;
  if (!isLocale(rawLocale) || rawLocale === "en-US") notFound();

  const locale = rawLocale as Exclude<Locale, "en-US">;
  const row = getTranslationStatus(PATH, locale);
  if (!row || row.status === "archived") notFound();

  const e = getShouldIBySlug(decision);
  if (!e) notFound();

  const path = `${PATH}/${decision}`;
  const localised = localizedPath(path, locale);
  const canonicalUrl = `${BASE_URL}${localised}`;
  const inLanguage = locale === "pt-BR" ? "pt-BR" : "es";
  const enCanonicalUrl = `${BASE_URL}${path}`;
  const shared = getPseoSharedChrome(locale);
  const cluster = getPseoClusterChrome("should-i", locale);

  const v = verdictStyle(e.verdict);
  const verdictLabel = SHOULD_I_VERDICT_LABELS[e.verdict];
  const acceptedAnswerText = `${verdictLabel} – ${e.verdictHeadline} ${e.directAnswer}`;

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
        item: `${BASE_URL}${localizedPath(PATH, locale)}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: e.question,
        item: canonicalUrl,
      },
    ],
  });

  const qaJson = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "QAPage",
    inLanguage,
    mainEntity: {
      "@type": "Question",
      name: e.question,
      text: e.question,
      answerCount: 1,
      acceptedAnswer: {
        "@type": "Answer",
        text: acceptedAnswerText,
        inLanguage,
        author: { "@id": ID.person },
        url: `${canonicalUrl}#verdict`,
      },
    },
  });

  return (
    <article className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbJson }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: qaJson }}
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
              {e.question}
            </li>
          </ol>
        </nav>
      </div>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {e.question}
        </h1>
      </header>

      <Separator className="my-2" />

      <section
        id="verdict"
        className="max-w-3xl mx-auto px-6 py-6"
        aria-labelledby="verdict-heading"
      >
        <h2 id="verdict-heading" className="sr-only">
          {verdictLabel}
        </h2>
        <Card className={`${v.borderClass} ${v.bgClass}`}>
          <CardContent className="pt-6 pb-5">
            <div className="flex items-center gap-3 mb-3">
              <Badge
                variant={v.badgeVariant}
                className="text-xs uppercase tracking-wide"
              >
                {verdictLabel}
              </Badge>
            </div>
            <p className="text-lg font-semibold leading-snug">
              {e.verdictHeadline}
            </p>
          </CardContent>
        </Card>
      </section>

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
              See this applied to your page
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Free 90-second Launch Diagnostic.
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
