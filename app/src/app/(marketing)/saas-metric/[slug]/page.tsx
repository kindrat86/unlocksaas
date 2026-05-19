import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  SAAS_METRIC_SLUGS,
  SAAS_METRIC_ENTRIES,
  METRIC_CATEGORY_LABELS,
  getSaasMetricBySlug,
  type SaasMetricEntry,
} from "@/lib/saas-metrics";
import { getBenchmarkBySlug } from "@/lib/benchmarks";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import { formatVerifiedDate } from "@/lib/seo/dates";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return SAAS_METRIC_SLUGS.map((slug) => ({ slug }));
}

type RouteParams = { slug: string };

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const e = getSaasMetricBySlug(params.slug);
  if (!e) return {};
  const canonical = `/saas-metric/${e.slug}`;
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

function buildJsonLd(e: SaasMetricEntry, canonicalUrl: string): string[] {
  const definedTerm = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: e.metricName,
    alternateName: e.abbreviation,
    description: e.shortDefinition,
    url: canonicalUrl,
    inDefinedTermSet: `${BASE_URL}/saas-metric`,
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
        name: "SaaS metrics",
        item: `${BASE_URL}/saas-metric`,
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

export default async function SaasMetricDetailPage(props: {
  params: Promise<RouteParams>;
}) {
  const params = await props.params;
  const e = getSaasMetricBySlug(params.slug);
  if (!e) notFound();

  const canonicalUrl = `${BASE_URL}/saas-metric/${e.slug}`;
  const [termJson, articleJson, faqJson, breadcrumbJson] = buildJsonLd(
    e,
    canonicalUrl,
  );

  const benchmark = e.relatedBenchmarkSlug
    ? getBenchmarkBySlug(e.relatedBenchmarkSlug)
    : undefined;

  const related = SAAS_METRIC_ENTRIES.filter(
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
            <Link href="/saas-metric" className="hover:underline">
              SaaS metrics
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            {e.abbreviation}
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          {METRIC_CATEGORY_LABELS[e.category]} metric
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
        aria-labelledby="formula"
      >
        <h2 id="formula" className="text-xl font-semibold mb-4 leading-tight">
          Formula
        </h2>
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-base font-mono mb-4 leading-relaxed">
              {e.formula.expression}
            </p>
            <p className="text-sm font-semibold mb-2">Where:</p>
            <ul className="space-y-2 text-sm">
              {e.formula.variables.map((v) => (
                <li key={v.name}>
                  <span className="font-mono font-semibold">{v.name}</span> ={" "}
                  <span className="text-muted-foreground">{v.meaning}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="example"
      >
        <h2 id="example" className="text-xl font-semibold mb-4 leading-tight">
          Worked example
        </h2>
        <p className="text-base leading-relaxed whitespace-pre-line">
          {e.workedExample}
        </p>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8 grid sm:grid-cols-2 gap-6"
        aria-labelledby="tells-you"
      >
        <div>
          <h2
            id="tells-you"
            className="text-base font-semibold mb-3 leading-tight"
          >
            What it tells you
          </h2>
          <ul className="space-y-2 list-disc list-inside text-sm leading-relaxed">
            {e.whatItTellsYou.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-base font-semibold mb-3 leading-tight">
            What it does NOT tell you
          </h2>
          <ul className="space-y-2 list-disc list-inside text-sm leading-relaxed text-muted-foreground">
            {e.whatItDoesntTellYou.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="miscalc"
      >
        <h2 id="miscalc" className="text-xl font-semibold mb-4 leading-tight">
          Common miscalculations
        </h2>
        <ul className="space-y-3 list-disc list-inside">
          {e.commonMiscalculations.map((m) => (
            <li key={m} className="text-base leading-relaxed">
              {m}
            </li>
          ))}
        </ul>
      </section>

      {benchmark ? (
        <section
          className="max-w-3xl mx-auto px-6 py-6"
          aria-labelledby="benchmark-link"
        >
          <h2
            id="benchmark-link"
            className="text-base font-semibold mb-3 leading-tight"
          >
            What is a good {e.abbreviation}?
          </h2>
          <p className="text-sm leading-relaxed">
            See the directional range on{" "}
            <Link
              href={`/benchmarks/${benchmark.slug}`}
              className="text-primary hover:underline"
            >
              the {benchmark.metric} benchmark page →
            </Link>
          </p>
        </section>
      ) : null}

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
            More {METRIC_CATEGORY_LABELS[e.category].toLowerCase()} metrics
          </h2>
          <ul className="space-y-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/saas-metric/${r.slug}`}
                  className="text-sm text-primary hover:underline"
                >
                  {r.abbreviation} — {r.metricName}
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
              Diagnose your funnel, not your spreadsheet
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Metrics tell you what is happening. The free 90-second Launch
              Diagnostic tells you WHY — labels Wrong Person, Weak Offer, or
              Weak Belief, with the specific fix.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/saas-metric">All SaaS metrics</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </article>
  );
}
