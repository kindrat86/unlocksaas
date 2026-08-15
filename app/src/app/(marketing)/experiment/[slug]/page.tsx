import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  EXPERIMENT_SLUGS,
  EXPERIMENT_ENTRIES,
  EXPERIMENT_AREA_LABELS,
  getExperimentBySlug,
  type ExperimentEntry,
} from "@/lib/experiments";
import { getBenchmarkBySlug } from "@/lib/benchmarks";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import { formatVerifiedDate } from "@/lib/seo/dates";


export function generateStaticParams() {
  return EXPERIMENT_SLUGS.map((slug) => ({ slug }));
}

type RouteParams = { slug: string };

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const e = getExperimentBySlug(params.slug);
  if (!e) return {};
  const canonical = `/experiment/${e.slug}`;
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

function buildJsonLd(e: ExperimentEntry, canonicalUrl: string): string[] {
  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: e.displayName,
    description: e.intro,
    step: e.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.title,
      text: s.description,
    })),
    totalTime: e.durationBand,
    inLanguage: "en-US",
  };

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
        name: "Experiments",
        item: `${BASE_URL}/experiment`,
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
    JSON.stringify(howTo),
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

export default async function ExperimentDetailPage(props: {
  params: Promise<RouteParams>;
}) {
  const params = await props.params;
  const e = getExperimentBySlug(params.slug);
  if (!e) notFound();

  const canonicalUrl = `${BASE_URL}/experiment/${e.slug}`;
  const [articleJson, howToJson, faqJson, breadcrumbJson] = buildJsonLd(
    e,
    canonicalUrl,
  );

  const benchmark = e.relatedBenchmarkSlug
    ? getBenchmarkBySlug(e.relatedBenchmarkSlug)
    : undefined;

  const related = EXPERIMENT_ENTRIES.filter(
    (other) => other.slug !== e.slug,
  ).slice(0, 4);

  return (
    <article className="min-h-screen">
      <JsonLdBlock json={articleJson} />
      <JsonLdBlock json={howToJson} />
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
            <Link href="/experiment" className="hover:underline">
              Experiments
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            {e.experimentName}
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          {EXPERIMENT_AREA_LABELS[e.area]} experiment
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {e.displayName}
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          {e.intro}
        </p>
        <div className="grid sm:grid-cols-2 gap-3 text-xs mt-4">
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">
              Min sample size:
            </span>{" "}
            {e.minimumSampleSize}
          </p>
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">Duration:</span>{" "}
            {e.durationBand}
          </p>
        </div>
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
        aria-labelledby="hypothesis"
      >
        <h2
          id="hypothesis"
          className="text-xl font-semibold mb-4 leading-tight"
        >
          Hypothesis structure
        </h2>
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-sm font-mono leading-relaxed">
              {e.hypothesisTemplate}
            </p>
          </CardContent>
        </Card>
        <p className="text-sm text-muted-foreground leading-relaxed mt-3">
          If you cannot complete this template, you do not have an
          experiment — you have a guess.
        </p>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8 grid sm:grid-cols-2 gap-6"
        aria-labelledby="design"
      >
        <div>
          <h2
            id="design"
            className="text-base font-semibold mb-3 leading-tight"
          >
            Variant design
          </h2>
          <p className="text-sm leading-relaxed">{e.variantDesign}</p>
        </div>
        <div>
          <h2 className="text-base font-semibold mb-3 leading-tight">
            Primary metric
          </h2>
          <p className="text-sm leading-relaxed">{e.primaryMetric}</p>
        </div>
      </section>

      {e.secondaryMetrics.length > 0 ? (
        <section
          className="max-w-3xl mx-auto px-6 py-6"
          aria-labelledby="secondary"
        >
          <h2
            id="secondary"
            className="text-base font-semibold mb-3 leading-tight"
          >
            Secondary metrics (watch but do not decide on)
          </h2>
          <ul className="space-y-1 list-disc list-inside text-sm leading-relaxed text-muted-foreground">
            {e.secondaryMetrics.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="steps"
      >
        <h2 id="steps" className="text-xl font-semibold mb-4 leading-tight">
          Procedure
        </h2>
        <ol className="space-y-6">
          {e.steps.map((s, i) => (
            <li key={s.title} className="border-l-2 border-primary/30 pl-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                Step {i + 1}
              </p>
              <p className="text-base font-semibold mb-2 leading-tight">
                {s.title}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {s.description}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="self-deception"
      >
        <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
          <CardContent className="pt-6">
            <h2
              id="self-deception"
              className="text-base font-semibold mb-3 leading-tight"
            >
              Self-deceptions to avoid
            </h2>
            <ul className="space-y-2 list-disc list-inside text-sm leading-relaxed">
              {e.selfDeceptions.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="success"
      >
        <Card className="border-green-300 bg-green-50 dark:bg-green-950 dark:border-green-800">
          <CardContent className="pt-6">
            <h2
              id="success"
              className="text-base font-semibold mb-3 leading-tight"
            >
              What success looks like
            </h2>
            <p className="text-sm leading-relaxed">{e.successProfile}</p>
          </CardContent>
        </Card>
      </section>

      {benchmark ? (
        <section
          className="max-w-3xl mx-auto px-6 py-6"
          aria-labelledby="bench"
        >
          <h2 id="bench" className="text-base font-semibold mb-3 leading-tight">
            Related benchmark
          </h2>
          <p className="text-sm leading-relaxed">
            See the directional range for{" "}
            <Link
              href={`/benchmarks/${benchmark.slug}`}
              className="text-primary hover:underline"
            >
              {benchmark.metric}
            </Link>{" "}
            to calibrate the expected lift in your hypothesis.
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
            Other experiments
          </h2>
          <ul className="space-y-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/experiment/${r.slug}`}
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
              Test on a page that is already pointed in the right direction
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              A/B tests on a misaligned page produce two losing variants.
              The diagnostic labels the alignment problem first; the test
              optimizes within the right alignment.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/experiment">All experiments</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </article>
  );
}
