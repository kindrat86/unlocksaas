import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  BENCHMARK_SLUGS,
  getBenchmarkBySlug,
  type BenchmarkEntry,
} from "@/lib/benchmarks";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import { formatVerifiedDate } from "@/lib/seo/dates";


export function generateStaticParams() {
  return BENCHMARK_SLUGS.map((slug) => ({ slug }));
}

type RouteParams = { slug: string };

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const e = getBenchmarkBySlug(params.slug);
  if (!e) return {};

  const canonical = `/benchmarks/${e.slug}`;
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

function buildJsonLd(e: BenchmarkEntry, canonicalUrl: string): string[] {
  // QAPage on the benchmark detail page. The query intent these pages
  // target is "what's a good X" / "what's the average X" (per the
  // catalog header comment in lib/benchmarks.ts). The aeoAnswer field
  // is already the citation-ready 40-60 word direct answer, so it
  // doubles as the acceptedAnswer text. Google documents QAPage as
  // the right schema for a page whose primary purpose is one question
  // with one accepted answer; FAQPage stays in place for the
  // secondary founder questions further down the page.
  const primaryQuestion = `What's a good ${e.metric}?`;
  const qaPage = {
    "@context": "https://schema.org",
    "@type": "QAPage",
    inLanguage: "en-US",
    mainEntity: {
      "@type": "Question",
      name: primaryQuestion,
      text: primaryQuestion,
      answerCount: 1,
      acceptedAnswer: {
        "@type": "Answer",
        text: e.aeoAnswer,
        inLanguage: "en-US",
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
      `average ${e.metric}`,
      `good ${e.metric}`,
      "indie SaaS",
    ].join(", "),
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
        name: "Benchmarks",
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

export default async function BenchmarkDetailPage(props: {
  params: Promise<RouteParams>;
}) {
  const params = await props.params;
  const e = getBenchmarkBySlug(params.slug);
  if (!e) notFound();

  const canonicalUrl = `${BASE_URL}/benchmarks/${e.slug}`;
  const [qaJson, articleJson, faqJson, breadcrumbJson] = buildJsonLd(
    e,
    canonicalUrl,
  );

  return (
    <article className="min-h-screen">
      <JsonLdBlock json={qaJson} />
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
            <Link href="/benchmarks" className="hover:underline">
              Benchmarks
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground capitalize">
            {e.metric}
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Benchmark
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4 capitalize">
          {e.metric}
        </h1>
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

      <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="answer">
        <h2 id="answer" className="sr-only">
          Direct answer
        </h2>
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-widest text-primary mb-3">
              Direct answer
            </p>
            <p className="text-base leading-relaxed" data-speakable>
              {e.aeoAnswer}
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="bands">
        <h2 id="bands" className="text-2xl font-bold mb-4 leading-tight">
          Where you fall
        </h2>
        <div className="space-y-4">
          {e.bands.map((b) => (
            <Card key={b.label}>
              <CardContent className="pt-6">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  {b.label}
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
          What drives this metric (in order)
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
        <h2 id="misreadings" className="text-2xl font-bold mb-4 leading-tight">
          Common misreadings
        </h2>
        <ul className="space-y-2 list-disc list-inside">
          {e.misreadings.map((m) => (
            <li key={m} className="text-base leading-relaxed">
              {m}
            </li>
          ))}
        </ul>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="faq">
        <h2 id="faq" className="text-2xl font-bold mb-4 leading-tight">
          Questions founders ask
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
        <h2 id="source" className="text-base font-semibold mb-3 leading-tight">
          Source attribution
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
              See where your page falls on this metric
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The free 90-second Launch Diagnostic applies the same triage to
              your actual page and tells you which band you&rsquo;re in plus
              what to fix first.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/benchmarks">All benchmarks</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </article>
  );
}
