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
import {
  ANSWER_SLUGS,
  getAnswerBySlug,
} from "@/lib/answers";
import { BASE_URL, ID } from "@/lib/seo/entity";
import {
  getPseoSharedChrome,
  getPseoClusterChrome,
} from "@/lib/i18n/translations";

/**
 * Locale-aware /answers/[slug] detail – plumbing variant.
 * See /[locale]/alternatives-to/[slug]/page.tsx for the rollout pattern.
 */

const PATH = "/answers";


type RouteParams = { locale: string; slug: string };

export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of renderableLocalesForPathOrStub(PATH)) {
    for (const slug of ANSWER_SLUGS) {
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
  const e = getAnswerBySlug(slug);
  if (!e) return {};

  const path = `${PATH}/${slug}`;
  const localised = localizedPath(path, locale);
  const approved = isApproved(PATH, locale);

  const title = e.question;
  const description = e.directAnswer;

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

export default async function LocalizedAnswerDetail({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale) || rawLocale === "en-US") notFound();

  const locale = rawLocale as Exclude<Locale, "en-US">;
  const row = getTranslationStatus(PATH, locale);
  if (!row || row.status === "archived") notFound();

  const e = getAnswerBySlug(slug);
  if (!e) notFound();

  const path = `${PATH}/${slug}`;
  const localised = localizedPath(path, locale);
  const canonicalUrl = `${BASE_URL}${localised}`;
  const inLanguage = locale === "pt-BR" ? "pt-BR" : "es";
  const enCanonicalUrl = `${BASE_URL}${path}`;
  const shared = getPseoSharedChrome(locale);
  const cluster = getPseoClusterChrome("answers", locale);

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
        name: "Answers",
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
        text: e.directAnswer,
        inLanguage,
        author: { "@id": ID.person },
        url: `${canonicalUrl}#answer`,
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
        <p className="text-lg text-muted-foreground leading-relaxed">
          {e.directAnswer}
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
              Your question not here?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Ask the founder directly.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href={localizedPath("/contact", locale)}>
                  Ask a question
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
