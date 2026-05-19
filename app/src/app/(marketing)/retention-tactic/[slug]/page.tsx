import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  RETENTION_TACTIC_SLUGS,
  RETENTION_TACTIC_ENTRIES,
  LIFECYCLE_STAGE_LABELS,
  getRetentionTacticBySlug,
  type RetentionTacticEntry,
} from "@/lib/retention-tactics";
import { getSaasMetricBySlug } from "@/lib/saas-metrics";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import { formatVerifiedDate } from "@/lib/seo/dates";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return RETENTION_TACTIC_SLUGS.map((slug) => ({ slug }));
}

type RouteParams = { slug: string };

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const e = getRetentionTacticBySlug(params.slug);
  if (!e) return {};
  const canonical = `/retention-tactic/${e.slug}`;
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
  e: RetentionTacticEntry,
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
        name: "Retention tactics",
        item: `${BASE_URL}/retention-tactic`,
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

export default async function RetentionTacticDetailPage(props: {
  params: Promise<RouteParams>;
}) {
  const params = await props.params;
  const e = getRetentionTacticBySlug(params.slug);
  if (!e) notFound();

  const canonicalUrl = `${BASE_URL}/retention-tactic/${e.slug}`;
  const [articleJson, faqJson, breadcrumbJson] = buildJsonLd(e, canonicalUrl);

  const metric = e.relatedMetricSlug
    ? getSaasMetricBySlug(e.relatedMetricSlug)
    : undefined;

  const related = RETENTION_TACTIC_ENTRIES.filter(
    (other) =>
      other.lifecycleStage === e.lifecycleStage && other.slug !== e.slug,
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
            <Link href="/retention-tactic" className="hover:underline">
              Retention tactics
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            {e.tacticName}
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          {LIFECYCLE_STAGE_LABELS[e.lifecycleStage]} retention tactic
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

      <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="what">
        <h2 id="what" className="text-xl font-semibold mb-4 leading-tight">
          What it is
        </h2>
        <p className="text-base leading-relaxed">{e.whatItIs}</p>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="why-stage"
      >
        <h2
          id="why-stage"
          className="text-xl font-semibold mb-4 leading-tight"
        >
          Why this lifecycle stage
        </h2>
        <p className="text-base leading-relaxed">{e.whyThisStage}</p>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="metric"
      >
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-6">
            <h2 id="metric" className="text-base font-semibold mb-3 leading-tight">
              Target metric
            </h2>
            <p className="text-sm leading-relaxed">{e.targetMetric}</p>
          </CardContent>
        </Card>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="actions"
      >
        <h2 id="actions" className="text-xl font-semibold mb-4 leading-tight">
          Specific actions
        </h2>
        <ol className="space-y-3 list-decimal list-inside">
          {e.actions.map((a) => (
            <li key={a} className="text-base leading-relaxed">
              {a}
            </li>
          ))}
        </ol>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="retire"
      >
        <h2 id="retire" className="text-xl font-semibold mb-4 leading-tight">
          When to retire
        </h2>
        <p className="text-base leading-relaxed">{e.whenToRetire}</p>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="fails"
      >
        <h2 id="fails" className="text-xl font-semibold mb-4 leading-tight">
          Failure modes
        </h2>
        <ul className="space-y-3 list-disc list-inside">
          {e.failureModes.map((f) => (
            <li key={f} className="text-base leading-relaxed">
              {f}
            </li>
          ))}
        </ul>
      </section>

      {metric ? (
        <section className="max-w-3xl mx-auto px-6 py-6">
          <h2 className="text-base font-semibold mb-3 leading-tight">
            Related metric
          </h2>
          <p className="text-sm leading-relaxed">
            <Link
              href={`/saas-metric/${metric.slug}`}
              className="text-primary hover:underline"
            >
              {metric.displayName} →
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
            More {LIFECYCLE_STAGE_LABELS[e.lifecycleStage].toLowerCase()} tactics
          </h2>
          <ul className="space-y-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/retention-tactic/${r.slug}`}
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
              Retention work follows from offer-fit
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              No retention tactic recovers a fundamentally misaligned
              offer. The free diagnostic labels the upstream issue first.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/retention-tactic">All retention tactics</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </article>
  );
}
