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
  renderableLocalesForPath,
} from "@/lib/i18n/registry";
import { localeAlternates } from "@/lib/seo/markdown-alternates";
import {
  getGlossaryChrome,
  getGlossaryEntries,
} from "@/lib/i18n/translations";
import {
  GLOSSARY_SLUGS,
  resolveRelated,
  type GlossaryEntry,
  type GlossaryAppearance,
} from "@/lib/glossary";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { formatVerifiedDate } from "@/lib/seo/dates";
import {
  buildSpeakable,
  ACCESS_MODE_TEXTUAL,
  buildQuotationNode,
} from "@/components/seo/json-ld";
import { PeopleAlsoAsk } from "@/components/seo/people-also-ask";
import {
  paaForGlossary,
  mergePaaIntoFaqs,
  paaHeadingForLocale,
} from "@/lib/seo/paa-questions";
import { TldrSummary } from "@/components/seo/tldr-summary";

/**
 * Locale-aware /glossary/[slug] detail – mirrors the canonical
 * (marketing)/glossary/[slug]/page.tsx with locale-swapped chrome and
 * overlay data via getGlossaryEntries(locale).
 *
 * Cross-product generateStaticParams: renderableLocalesForPath('/glossary')
 * × GLOSSARY_SLUGS.
 *
 * JSON-LD: DefinedTerm (with `inDefinedTermSet` pointing at en-US canonical
 * set so the schema graph is one entity across locales) + Article +
 * FAQPage + BreadcrumbList, all with inLanguage matching the locale.
 */


type RouteParams = { locale: string; slug: string };

export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of renderableLocalesForPath("/glossary")) {
    for (const slug of GLOSSARY_SLUGS) {
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
  const entries = getGlossaryEntries(locale);
  const g = entries.find((e) => e.slug === slug);
  if (!g) return {};

  const chrome = getGlossaryChrome(locale);
  const path = `/glossary/${slug}`;
  const localised = localizedPath(path, locale);
  const approved = isApproved("/glossary", locale);

  const title = `${g.term} ${chrome.detailSeoTitleSuffix}`;
  const description = g.shortDefinition;

  return {
    title,
    description,
    alternates: localeAlternates(path, locale),
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
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function appearanceHref(a: GlossaryAppearance, locale: Locale): string {
  switch (a.kind) {
    case "funnel-teardown":
      return localizedPath(`/funnel-teardown/${a.slug}`, locale);
    case "pricing-teardown":
      return localizedPath(`/pricing-teardown/${a.slug}`, locale);
    case "compare":
      return localizedPath(`/vs/${a.slug}`, locale);
    case "alternatives-to":
      return localizedPath(`/alternatives-to/${a.slug}`, locale);
    case "category":
      return localizedPath(`/category/${a.slug}`, locale);
    case "page":
      return localizedPath(a.href, locale);
  }
}

function buildJsonLd(
  g: GlossaryEntry,
  canonicalUrl: string,
  inLanguage: string,
  chrome: ReturnType<typeof getGlossaryChrome>,
  faqsForSchema: ReadonlyArray<{ q: string; a: string }>,
): string[] {
  const definedTerm = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "@id": `${canonicalUrl}#term`,
    name: g.term,
    description: g.shortDefinition,
    inDefinedTermSet: `${BASE_URL}/glossary#defined-term-set`,
    url: canonicalUrl,
    inLanguage,
  };

  // Article.citation: schema.org Quotation chain for verbatim external
  // sources. Bound to the parent Article (not as a detached @graph node)
  // so the citation graph stays connected to the article it supports.
  // Brunson Hard-Rule: empty when no verbatim quotes are curated; module
  // load already ran validateQuotations(). See @/lib/seo/quotation.
  const article: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${g.term} ${chrome.detailSeoTitleSuffix}`,
    description: g.shortDefinition,
    abstract: g.longDefinition,
    author: { "@id": ID.person },
    publisher: { "@id": ID.organization },
    isPartOf: { "@id": ID.website },
    datePublished: g.lastVerified,
    dateModified: g.lastVerified,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    about: { "@id": `${canonicalUrl}#term` },
    mentions: [{ "@id": `${canonicalUrl}#term` }],
    keywords: [g.term, g.category, "Brunson", "indie SaaS"].join(", "),
    inLanguage,
    speakable: buildSpeakable(
      '[data-speakable="definition"]',
      '[data-speakable="why-it-matters"]',
    ),
    ...ACCESS_MODE_TEXTUAL,
  };
  if (g.quotations && g.quotations.length > 0) {
    article.citation = g.quotations.map(buildQuotationNode);
  }

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage,
    speakable: buildSpeakable(
      '[data-speakable="definition"]',
      '[data-speakable="why-it-matters"]',
    ),
    ...ACCESS_MODE_TEXTUAL,
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
        name: chrome.hubBreadcrumbGlossary,
        item: `${BASE_URL}/glossary`,
      },
      { "@type": "ListItem", position: 3, name: g.term, item: canonicalUrl },
    ],
  };

  return [
    JSON.stringify(definedTerm),
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

export default async function LocalizedGlossaryDetail({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale) || rawLocale === "en-US") notFound();

  const locale = rawLocale as Exclude<Locale, "en-US">;
  const row = getTranslationStatus("/glossary", locale);
  if (!row || row.status === "archived") notFound();

  const entries = getGlossaryEntries(locale);
  const g = entries.find((e) => e.slug === slug);
  if (!g) notFound();

  const chrome = getGlossaryChrome(locale);
  const localised = localizedPath(`/glossary/${slug}`, locale);
  const canonicalUrl = `${BASE_URL}${localised}`;
  const inLanguage = locale === "pt-BR" ? "pt-BR" : "es";

  const paaPairs = paaForGlossary(g, locale);
  const mergedFaqs = mergePaaIntoFaqs(g.faqs, paaPairs);
  const [termJson, articleJson, faqJson, breadcrumbJson] = buildJsonLd(
    g,
    canonicalUrl,
    inLanguage,
    chrome,
    mergedFaqs,
  );

  const related = (g.relatedTerms ?? [])
    .map((slug) => resolveRelated(slug))
    .filter((r): r is NonNullable<ReturnType<typeof resolveRelated>> =>
      Boolean(r),
    );

  return (
    <article className="min-h-screen">
      <JsonLdBlock json={termJson} />
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
                href={localizedPath("/glossary", locale)}
                className="hover:underline"
              >
                {chrome.detailBreadcrumbGlossary}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-foreground">
              {g.term}
            </li>
          </ol>
        </nav>
      </div>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          {chrome.detailLabelPrefix} {chrome.hubCategoryLabel(g.category)}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {g.term}
        </h1>
        <p
          className="text-lg text-muted-foreground leading-relaxed"
          data-speakable="definition"
        >
          {g.shortDefinition}
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          {chrome.detailVerifiedLabel}{" "}
          <time dateTime={g.lastVerified}>
            {formatVerifiedDate(g.lastVerified)}
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

      {/* TL;DR – structured key/value summary for AI summarizers + voice engines.
          Schema.org key labels stay in English (property-name convention); the
          values come from the locale-aware glossary entries. */}
      <TldrSummary
        headingLabel={chrome.detailShortDefinitionLabel}
        eyebrow={chrome.detailShortDefinitionLabel}
        items={[
          { term: "Term", definition: g.term },
          { term: "Definition", definition: g.shortDefinition },
          { term: "Layer", definition: chrome.hubCategoryLabel(g.category) },
          {
            term: "Last verified",
            definition: formatVerifiedDate(g.lastVerified),
          },
        ]}
      />

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="long"
      >
        <h2 id="long" className="text-2xl font-bold mb-4 leading-tight">
          {chrome.detailLongDefinitionHeading}
        </h2>
        <p className="text-base leading-relaxed whitespace-pre-line">
          {g.longDefinition}
        </p>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="why"
      >
        <h2 id="why" className="text-2xl font-bold mb-4 leading-tight">
          {chrome.detailWhyItMattersHeading}
        </h2>
        <p
          className="text-base leading-relaxed whitespace-pre-line"
          data-speakable="why-it-matters"
        >
          {g.whyItMatters}
        </p>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="apply"
      >
        <h2 id="apply" className="text-2xl font-bold mb-4 leading-tight">
          {chrome.detailHowToApplyHeading}
        </h2>
        <ol className="space-y-3 list-decimal list-inside">
          {g.howToApply.map((b) => (
            <li key={b} className="text-base leading-relaxed">
              {b}
            </li>
          ))}
        </ol>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="example"
      >
        <h2 id="example" className="text-2xl font-bold mb-4 leading-tight">
          {chrome.detailExampleHeading}
        </h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-base leading-relaxed">{g.example}</p>
          </CardContent>
        </Card>
      </section>

      {g.commonConfusions && g.commonConfusions.length > 0 ? (
        <section
          className="max-w-3xl mx-auto px-6 py-8"
          aria-labelledby="confusions"
        >
          <h2
            id="confusions"
            className="text-2xl font-bold mb-4 leading-tight"
          >
            {chrome.detailCommonConfusionsHeading}
          </h2>
          <div className="space-y-3">
            {g.commonConfusions.map((c) => (
              <Card key={c.term}>
                <CardContent className="pt-6">
                  <p className="text-sm font-semibold mb-2">{c.term}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {c.difference}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {g.appearsIn && g.appearsIn.length > 0 ? (
        <section
          className="max-w-3xl mx-auto px-6 py-8"
          aria-labelledby="appears"
        >
          <h2
            id="appears"
            className="text-2xl font-bold mb-4 leading-tight"
          >
            {chrome.detailAppearsInHeading}
          </h2>
          <ul className="space-y-3">
            {g.appearsIn.map((a) => (
              <li
                key={appearanceHref(a, locale) + a.label}
                className="text-sm"
              >
                <Link
                  href={appearanceHref(a, locale)}
                  className="text-primary hover:underline font-semibold"
                >
                  {a.label} →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section
          className="max-w-3xl mx-auto px-6 py-8"
          aria-labelledby="related"
        >
          <h2 id="related" className="text-2xl font-bold mb-4 leading-tight">
            {chrome.detailRelatedTermsHeading}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {related.map((r) => (
              <Card
                key={r.slug}
                className="hover:border-primary/30 transition"
              >
                <CardContent className="pt-6">
                  <p className="text-sm font-semibold mb-2">
                    <Link
                      href={localizedPath(`/glossary/${r.slug}`, locale)}
                      className="hover:text-primary transition"
                    >
                      {r.term} →
                    </Link>
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {r.shortDefinition}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {/* People Also Ask – localized PAA H3s sourced from this
          locale's entry overlay; question stems are translated for
          the target locale. */}
      <PeopleAlsoAsk
        pairs={paaPairs}
        heading={paaHeadingForLocale(locale)}
      />

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="faq"
      >
        <h2 id="faq" className="text-2xl font-bold mb-4 leading-tight">
          {chrome.detailFaqHeading(g.term)}
        </h2>
        <div className="space-y-4">
          {g.faqs.map((f) => (
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
        className="max-w-3xl mx-auto px-6 py-12 border-t border-border/40"
        aria-labelledby="cta"
      >
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              {chrome.detailCtaHeading(g.term)}
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
                <Link href={localizedPath("/glossary", locale)}>
                  {chrome.detailCtaSecondary}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <footer className="max-w-3xl mx-auto px-6 py-8 text-xs text-muted-foreground leading-relaxed border-t border-border/40">
        <p>{chrome.detailHonestyFooter}</p>
      </footer>
    </article>
  );
}
