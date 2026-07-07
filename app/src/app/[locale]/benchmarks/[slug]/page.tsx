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
  renderableLocalesForPath,
} from "@/lib/i18n/registry";
import { localeAlternates } from "@/lib/seo/markdown-alternates";
import {
  getBenchmarkEntries,
  getBenchmarksChrome,
} from "@/lib/i18n/translations";
import {
  BENCHMARK_SLUGS,
  type BenchmarkEntry,
} from "@/lib/benchmarks";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { formatVerifiedDate } from "@/lib/seo/dates";
import { PeopleAlsoAsk } from "@/components/seo/people-also-ask";
import {
  paaForBenchmark,
  mergePaaIntoFaqs,
  paaHeadingForLocale,
} from "@/lib/seo/paa-questions";
import { TldrSummary } from "@/components/seo/tldr-summary";

/**
 * Locale-aware /benchmarks/[slug] detail – mirrors the canonical
 * (marketing)/benchmarks/[slug]/page.tsx with locale-swapped chrome and
 * overlay data via getBenchmarkEntries(locale).
 *
 * Cross-product generateStaticParams: renderableLocalesForPath('/benchmarks')
 * × BENCHMARK_SLUGS.
 *
 * JSON-LD: QAPage + Article + FAQPage + BreadcrumbList. The QAPage primary
 * question is localized ("¿Cuál es una buena {metric}?" / "Qual é uma boa
 * {metric}?") matching the LLM citation intent in the target language.
 */


type RouteParams = { locale: string; slug: string };

export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of renderableLocalesForPath("/benchmarks")) {
    for (const slug of BENCHMARK_SLUGS) {
      params.push({ locale, slug });
    }
  }
  return params;
}

function primaryQuestion(metric: string, locale: Locale): string {
  return `What's a good ${metric}?`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale) || rawLocale === "en-US") return {};

  const locale = rawLocale as Locale;
  const entries = getBenchmarkEntries(locale);
  const e = entries.find((x) => x.slug === slug);
  if (!e) return {};

  const path = `/benchmarks/${slug}`;
  const localised = localizedPath(path, locale);
  const approved = isApproved("/benchmarks", locale);

  return {
    title: e.metaTitle,
    description: e.metaDescription,
    alternates: localeAlternates(path, locale),
    robots: approved
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      type: "article",
      title: e.metaTitle,
      description: e.metaDescription,
      url: localised,
      siteName: "Unlock SaaS",
      locale:
        ogLocaleFormat(locale),
    },
    twitter: {
      card: "summary_large_image",
      title: e.metaTitle,
      description: e.metaDescription,
    },
  };
}

function buildJsonLd(
  e: BenchmarkEntry,
  canonicalUrl: string,
  inLanguage: string,
  locale: Locale,
  chrome: ReturnType<typeof getBenchmarksChrome>,
  faqsForSchema: ReadonlyArray<{ q: string; a: string }>,
): string[] {
  const q = primaryQuestion(e.metric, locale);
  const qaPage = {
    "@context": "https://schema.org",
    "@type": "QAPage",
    inLanguage,
    mainEntity: {
      "@type": "Question",
      name: q,
      text: q,
      answerCount: 1,
      acceptedAnswer: {
        "@type": "Answer",
        text: e.aeoAnswer,
        inLanguage,
        upvoteCount: 0,
        author: { "@id": ID.person },
        url: `${canonicalUrl}#answer`,
      },
    },
  };

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: e.metaTitle,
    description: e.metaDescription,
    abstract: e.aeoAnswer,
    author: { "@id": ID.person },
    publisher: { "@id": ID.organization },
    isPartOf: { "@id": ID.website },
    datePublished: e.lastVerified,
    dateModified: e.lastVerified,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    keywords: [
      `${e.metric} benchmark`,
      `${chrome.detailLabel} ${e.metric}`,
      "indie SaaS",
    ].join(", "),
    inLanguage,
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage,
    mainEntity: faqsForSchema.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
        inLanguage,
      },
    })),
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: chrome.hubBreadcrumbHome,
        item: `${BASE_URL}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: chrome.hubBreadcrumbBenchmarks,
        item: `${BASE_URL}/benchmarks`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: e.metric,
        item: canonicalUrl,
      },
    ],
  };

  return [
    JSON.stringify(qaPage),
    JSON.stringify(article),
    JSON.stringify(faqPage),
    JSON.stringify(breadcrumbs),
  ];
}

function JsonLdBlock({ json }: { json: string }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

function localizedBandLabel(
  label: BenchmarkEntry["bands"][number]["label"],
  chrome: ReturnType<typeof getBenchmarksChrome>,
): string {
  switch (label) {
    case "Underperforming":
      return chrome.bandUnderperforming;
    case "Typical range":
      return chrome.bandTypicalRange;
    case "Outperforming":
      return chrome.bandOutperforming;
  }
}

export default async function LocalizedBenchmarkDetail({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale) || rawLocale === "en-US") notFound();

  const locale = rawLocale as Locale;
  const row = getTranslationStatus("/benchmarks", locale);
  if (!row || row.status === "archived") notFound();

  const entries = getBenchmarkEntries(locale);
  const e = entries.find((x) => x.slug === slug);
  if (!e) notFound();

  const chrome = getBenchmarksChrome(locale);
  const localised = localizedPath(`/benchmarks/${slug}`, locale);
  const canonicalUrl = `${BASE_URL}${localised}`;
  const inLanguage = locale as string === "pt" ? "pt-BR" : "es";

  const paaPairs = paaForBenchmark(e, locale);
  const mergedFaqs = mergePaaIntoFaqs(e.faqs, paaPairs);
  const [qaJson, articleJson, faqJson, breadcrumbJson] = buildJsonLd(
    e,
    canonicalUrl,
    inLanguage,
    locale,
    chrome,
    mergedFaqs,
  );

  return (
    <article className="min-h-screen">
      <JsonLdBlock json={qaJson} />
      <JsonLdBlock json={articleJson} />
      <JsonLdBlock json={faqJson} />
      <JsonLdBlock json={breadcrumbJson} />

      <div className="max-w-3xl mx-auto px-6 pt-10">
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
          className="text-xs text-muted-foreground"
        >
          <ol className="flex items-center gap-2">
            <li>
              <Link
                href={localizedPath("/", locale)}
                className="hover:underline"
              >
                {chrome.hubBreadcrumbHome}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href={localizedPath("/benchmarks", locale)}
                className="hover:underline"
              >
                {chrome.detailBreadcrumbBenchmarks}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-foreground capitalize">
              {e.metric}
            </li>
          </ol>
        </nav>
      </div>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          {chrome.detailLabel}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4 capitalize">
          {e.metric}
        </h1>
        <p className="mt-4 text-xs text-muted-foreground">
          {chrome.detailVerifiedLabel}{" "}
          <time dateTime={e.lastVerified}>
            {formatVerifiedDate(e.lastVerified)}
          </time>
          {" · "}
          <Link
            href={localizedPath("/editorial-policy", locale)}
            className="underline hover:text-foreground"
          >
            {chrome.detailEditorialPolicyLabel}
          </Link>
        </p>
      </header>

      <Separator className="my-2" />

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="answer"
      >
        <h2 id="answer" className="sr-only">
          {chrome.detailDirectAnswerLabel}
        </h2>
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-widest text-primary mb-3">
              {chrome.detailDirectAnswerLabel}
            </p>
            <p className="text-base leading-relaxed" data-speakable>
              {e.aeoAnswer}
            </p>
          </CardContent>
        </Card>
      </section>

      {/* TL;DR – structured key/value summary for AI summarizers + voice engines.
          Key labels in English (schema-style); values stay in the page locale. */}
      <TldrSummary
        headingLabel={`${e.metric} key facts`}
        items={[
          { term: "Metric", definition: e.metric },
          {
            term: "Typical range",
            definition:
              e.bands.find((b) => b.label === "Typical range")?.range ?? "",
          },
          {
            term: "Underperforming",
            definition:
              e.bands.find((b) => b.label === "Underperforming")?.range ?? "",
          },
          {
            term: "Outperforming",
            definition:
              e.bands.find((b) => b.label === "Outperforming")?.range ?? "",
          },
          { term: "Top driver", definition: e.drivers[0] ?? "" },
          {
            term: "Last verified",
            definition: formatVerifiedDate(e.lastVerified),
          },
        ]}
      />

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="bands"
      >
        <h2 id="bands" className="text-2xl font-bold mb-4 leading-tight">
          {chrome.detailBandsHeading}
        </h2>
        <div className="space-y-4">
          {e.bands.map((b) => (
            <Card key={b.label}>
              <CardContent className="pt-6">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  {localizedBandLabel(b.label, chrome)}
                </p>
                <p className="text-2xl font-bold mb-3">{b.range}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {b.diagnosis}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="drivers"
      >
        <h2 id="drivers" className="text-2xl font-bold mb-4 leading-tight">
          {chrome.detailDriversHeading}
        </h2>
        <ol className="space-y-2 list-decimal list-inside">
          {e.drivers.map((d) => (
            <li key={d} className="text-base leading-relaxed">
              {d}
            </li>
          ))}
        </ol>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="misreadings"
      >
        <h2
          id="misreadings"
          className="text-2xl font-bold mb-4 leading-tight"
        >
          {chrome.detailMisreadingsHeading}
        </h2>
        <ul className="space-y-2 list-disc list-inside">
          {e.misreadings.map((m) => (
            <li key={m} className="text-base leading-relaxed">
              {m}
            </li>
          ))}
        </ul>
      </section>

      {/* People Also Ask – localized PAA H3s for the benchmark
          intent class ("¿Cuál es una buena ...?" / "Qual é uma boa
          ...?"). Sourced from this locale's entry overlay. */}
      <PeopleAlsoAsk
        pairs={paaPairs}
        heading={paaHeadingForLocale(locale)}
      />

      <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="faq">
        <h2 id="faq" className="text-2xl font-bold mb-4 leading-tight">
          {chrome.detailFaqHeading}
        </h2>
        <div className="space-y-4">
          {e.faqs.map((f) => (
            <div key={f.q}>
              <p className="text-base font-semibold mb-2 aeo-q">{f.q}</p>
              <p className="text-sm text-muted-foreground leading-relaxed aeo-a">
                {f.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="source"
      >
        <h2
          id="source"
          className="text-base font-semibold mb-3 leading-tight"
        >
          {chrome.detailSourceHeading}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {e.sourceNote}
        </p>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-12 border-t border-border/40"
        aria-labelledby="cta"
      >
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              {chrome.detailCtaHeading}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              {chrome.detailCtaBody}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href={localizedPath("/diagnostic", locale)}>
                  {chrome.detailCtaPrimary}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={localizedPath("/benchmarks", locale)}>
                  {chrome.detailCtaSecondary}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </article>
  );
}
