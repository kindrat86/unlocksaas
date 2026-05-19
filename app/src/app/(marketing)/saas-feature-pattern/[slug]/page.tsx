import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  SAAS_FEATURE_PATTERN_SLUGS,
  SAAS_FEATURE_PATTERN_ENTRIES,
  getSaasFeaturePatternBySlug,
  type SaasFeaturePatternEntry,
} from "@/lib/saas-feature-patterns";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import { formatVerifiedDate } from "@/lib/seo/dates";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return SAAS_FEATURE_PATTERN_SLUGS.map((slug) => ({ slug }));
}

type RouteParams = { slug: string };

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const e = getSaasFeaturePatternBySlug(params.slug);
  if (!e) return {};
  const canonical = `/saas-feature-pattern/${e.slug}`;
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

function buildJsonLd(
  e: SaasFeaturePatternEntry,
  canonicalUrl: string,
): string[] {
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: e.metaTitle,
    description: e.metaDescription,
    abstract: e.intro,
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
        name: "SaaS feature patterns",
        item: `${BASE_URL}/saas-feature-pattern`,
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

export default async function SaasFeaturePatternDetailPage(props: {
  params: Promise<RouteParams>;
}) {
  const params = await props.params;
  const e = getSaasFeaturePatternBySlug(params.slug);
  if (!e) notFound();

  const canonicalUrl = `${BASE_URL}/saas-feature-pattern/${e.slug}`;
  const [articleJson, faqJson, breadcrumbJson] = buildJsonLd(e, canonicalUrl);

  const related = SAAS_FEATURE_PATTERN_ENTRIES.filter(
    (other) => other.slug !== e.slug,
  ).slice(0, 4);

  return (
    <article className="min-h-screen">
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
            <Link href="/saas-feature-pattern" className="hover:underline">
              SaaS feature patterns
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            {e.patternName}
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Growth feature pattern
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {e.displayName}
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          {e.intro}
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

      <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="how">
        <h2 id="how" className="text-xl font-semibold mb-4 leading-tight">
          How the pattern works
        </h2>
        <p className="text-base leading-relaxed">{e.howItWorks}</p>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8 grid sm:grid-cols-2 gap-6"
        aria-labelledby="fit"
      >
        <Card className="border-green-300 bg-green-50 dark:bg-green-950 dark:border-green-800">
          <CardContent className="pt-6">
            <h2 id="fit" className="text-base font-semibold mb-3 leading-tight">
              Best for
            </h2>
            <p className="text-sm leading-relaxed">{e.bestFor}</p>
          </CardContent>
        </Card>
        <Card className="border-red-300 bg-red-50 dark:bg-red-950 dark:border-red-800">
          <CardContent className="pt-6">
            <h2 className="text-base font-semibold mb-3 leading-tight">
              Worst for
            </h2>
            <p className="text-sm leading-relaxed">{e.worstFor}</p>
          </CardContent>
        </Card>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="metric"
      >
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-6">
            <h2 id="metric" className="text-base font-semibold mb-3 leading-tight">
              Target growth metric
            </h2>
            <p className="text-sm leading-relaxed">{e.targetMetric}</p>
          </CardContent>
        </Card>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="implement"
      >
        <h2 id="implement" className="text-xl font-semibold mb-4 leading-tight">
          Implementation considerations
        </h2>
        <ol className="space-y-3 list-decimal list-inside">
          {e.implementationConsiderations.map((s) => (
            <li key={s} className="text-base leading-relaxed">
              {s}
            </li>
          ))}
        </ol>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="misuses"
      >
        <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
          <CardContent className="pt-6">
            <h2
              id="misuses"
              className="text-base font-semibold mb-3 leading-tight"
            >
              Common misuses
            </h2>
            <ul className="space-y-2 list-disc list-inside text-sm leading-relaxed">
              {e.commonMisuses.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="outcomes"
      >
        <h2 id="outcomes" className="text-xl font-semibold mb-4 leading-tight">
          Realistic outcomes
        </h2>
        <p className="text-base leading-relaxed">{e.realisticOutcomes}</p>
      </section>

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
            Other feature patterns
          </h2>
          <ul className="space-y-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/saas-feature-pattern/${r.slug}`}
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
              Test the pattern's lift on your product
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Growth feature patterns produce different lift on different
              products. The experiment recipes show you how to test the
              actual impact before committing to long-term implementation.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/experiment">Experiment recipes</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/saas-feature-pattern">All feature patterns</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </article>
  );
}
