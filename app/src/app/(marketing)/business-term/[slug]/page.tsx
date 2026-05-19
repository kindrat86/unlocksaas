import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  BUSINESS_TERM_SLUGS,
  BUSINESS_TERM_ENTRIES,
  BUSINESS_TERM_CATEGORY_LABELS,
  getBusinessTermBySlug,
  type BusinessTermEntry,
} from "@/lib/business-terms";
import { getSaasMetricBySlug } from "@/lib/saas-metrics";
import { getGlossaryBySlug } from "@/lib/glossary";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import { formatVerifiedDate } from "@/lib/seo/dates";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return BUSINESS_TERM_SLUGS.map((slug) => ({ slug }));
}

type RouteParams = { slug: string };

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const e = getBusinessTermBySlug(params.slug);
  if (!e) return {};
  const canonical = `/business-term/${e.slug}`;
  return {
    title: e.metaTitle,
    description: e.metaDescription,
    alternates: pageAlternates(canonical),
    robots: { index: true, follow: true },
    openGraph: {
      type: "article",
      title: e.metaTitle,
      description: e.metaDescription,
      url: canonical,
      siteName: "Unlock SaaS",
    },
    twitter: {
      card: "summary_large_image",
      title: e.metaTitle,
      description: e.metaDescription,
    },
  };
}

function buildJsonLd(e: BusinessTermEntry, canonicalUrl: string): string[] {
  const definedTerm = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: e.termName,
    alternateName: e.abbreviation,
    description: e.shortDefinition,
    url: canonicalUrl,
    inDefinedTermSet: `${BASE_URL}/business-term`,
  };

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: e.metaTitle,
    description: e.metaDescription,
    abstract: e.longDefinition,
    author: { "@id": ID.person },
    publisher: { "@id": ID.organization },
    isPartOf: { "@id": ID.website },
    datePublished: e.lastVerified,
    dateModified: e.lastVerified,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    inLanguage: "en-US",
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: "en-US",
    mainEntity: e.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
        inLanguage: "en-US",
      },
    })),
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: "Business terms",
        item: `${BASE_URL}/business-term`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: e.displayName,
        item: canonicalUrl,
      },
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

export default async function BusinessTermDetailPage(props: {
  params: Promise<RouteParams>;
}) {
  const params = await props.params;
  const e = getBusinessTermBySlug(params.slug);
  if (!e) notFound();

  const canonicalUrl = `${BASE_URL}/business-term/${e.slug}`;
  const [termJson, articleJson, faqJson, breadcrumbJson] = buildJsonLd(
    e,
    canonicalUrl,
  );

  const metric = e.relatedMetricSlug
    ? getSaasMetricBySlug(e.relatedMetricSlug)
    : undefined;
  const glossary = e.relatedGlossarySlug
    ? getGlossaryBySlug(e.relatedGlossarySlug)
    : undefined;

  const related = BUSINESS_TERM_ENTRIES.filter(
    (other) => other.category === e.category && other.slug !== e.slug,
  ).slice(0, 4);

  return (
    <article className="min-h-screen">
      <JsonLdBlock json={termJson} />
      <JsonLdBlock json={articleJson} />
      <JsonLdBlock json={faqJson} />
      <JsonLdBlock json={breadcrumbJson} />

      <nav
        aria-label="Breadcrumb"
        className="max-w-3xl mx-auto px-6 pt-10 text-xs text-muted-foreground"
      >
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/business-term" className="hover:underline">
              Business terms
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            {e.abbreviation ?? e.termName}
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          {BUSINESS_TERM_CATEGORY_LABELS[e.category]} term
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {e.displayName}
        </h1>
        <p
          className="text-base text-muted-foreground leading-relaxed"
          data-speakable
        >
          {e.longDefinition}
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          Verified{" "}
          <time dateTime={e.lastVerified}>
            {formatVerifiedDate(e.lastVerified)}
          </time>
          {" · "}
          <Link
            href="/editorial-policy"
            className="underline hover:text-foreground"
          >
            editorial policy
          </Link>
        </p>
      </header>

      <Separator className="my-2" />

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="operationalize"
      >
        <h2
          id="operationalize"
          className="text-xl font-semibold mb-4 leading-tight"
        >
          How to operationalize this
        </h2>
        <p className="text-base leading-relaxed">{e.howToOperationalize}</p>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8 grid sm:grid-cols-2 gap-6"
        aria-labelledby="misuse"
      >
        <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
          <CardContent className="pt-6">
            <h2 id="misuse" className="text-base font-semibold mb-3 leading-tight">
              Common misuse
            </h2>
            <p className="text-sm leading-relaxed">{e.commonMisuse}</p>
          </CardContent>
        </Card>
        <Card className="border-green-300 bg-green-50 dark:bg-green-950 dark:border-green-800">
          <CardContent className="pt-6">
            <h2 className="text-base font-semibold mb-3 leading-tight">
              What &ldquo;good&rdquo; looks like for indie SaaS
            </h2>
            <p className="text-sm leading-relaxed">
              {e.whatGoodLooksLikeForIndieSaas}
            </p>
          </CardContent>
        </Card>
      </section>

      {(metric || glossary) && (
        <section className="max-w-3xl mx-auto px-6 py-6">
          <h2 className="text-base font-semibold mb-3 leading-tight">
            Related
          </h2>
          <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
            {metric ? (
              <li>
                <Link
                  href={`/saas-metric/${metric.slug}`}
                  className="text-primary hover:underline"
                >
                  {metric.displayName} (metric formula) →
                </Link>
              </li>
            ) : null}
            {glossary ? (
              <li>
                <Link
                  href={`/glossary/${glossary.slug}`}
                  className="text-primary hover:underline"
                >
                  {glossary.term} (Brunson term) →
                </Link>
              </li>
            ) : null}
          </ul>
        </section>
      )}

      {e.faqs.length > 0 ? (
        <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="faq">
          <h2 id="faq" className="text-xl font-semibold mb-4 leading-tight">
            Frequently asked
          </h2>
          <dl className="space-y-4">
            {e.faqs.map((f) => (
              <div key={f.q}>
                <dt className="font-semibold mb-1">{f.q}</dt>
                <dd className="text-sm text-muted-foreground leading-relaxed">
                  {f.a}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section
          className="max-w-3xl mx-auto px-6 py-8"
          aria-labelledby="related"
        >
          <h2
            id="related"
            className="text-base font-semibold mb-3 leading-tight"
          >
            More{" "}
            {BUSINESS_TERM_CATEGORY_LABELS[e.category].toLowerCase()} terms
          </h2>
          <ul className="space-y-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/business-term/${r.slug}`}
                  className="text-sm text-primary hover:underline"
                >
                  {r.displayName}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section
        className="max-w-3xl mx-auto px-6 py-12 border-t border-border/40"
        aria-labelledby="cta"
      >
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              Apply the term to a live page
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The free 90-second Launch Diagnostic labels which Brunson
              failure mode your page hits — many of these terms have
              direct connections to the diagnosis.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/business-term">All business terms</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </article>
  );
}
