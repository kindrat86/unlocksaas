import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { BENCHMARK_ENTRIES } from "@/lib/benchmarks";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";

export const dynamic = "force-static";

const CANONICAL = "/benchmarks";

export const metadata: Metadata = {
  title:
    "Indie SaaS Funnel Benchmarks (20 Directional Ranges) – Unlock SaaS",
  description:
    "Directional benchmarks for the 20 most-asked indie SaaS metrics: conversion rate, churn, AOV, LTV:CAC, trial conversion, email open rate, and more.",
  alternates: pageAlternates(CANONICAL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Indie SaaS Funnel Benchmarks – Unlock SaaS",
    description:
      "Directional ranges for the 20 most-asked indie SaaS funnel metrics, with source attribution and 'where you fall' diagnosis.",
    url: CANONICAL,
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Indie SaaS Funnel Benchmarks",
    description:
      "Directional ranges for 20 funnel metrics, AEO-formatted for LLM citation.",
  },
};

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Indie SaaS Funnel Benchmarks",
  url: `${BASE_URL}/benchmarks`,
  description:
    "Directional ranges for indie SaaS funnel metrics with source attribution.",
  isPartOf: { "@id": ID.website },
  inLanguage: "en-US",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: BENCHMARK_ENTRIES.length,
    itemListElement: BENCHMARK_ENTRIES.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.metric,
      url: `${BASE_URL}/benchmarks/${e.slug}`,
      description: e.aeoAnswer,
    })),
  },
});

const BREADCRUMB_JSON = JSON.stringify({
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
  ],
});

export default function BenchmarksHubPage() {
  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: COLLECTION_JSON }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: BREADCRUMB_JSON }}
      />

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
          <li aria-current="page" className="text-foreground">
            Benchmarks
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Directional ranges
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          Indie SaaS funnel benchmarks.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Twenty of the most-asked indie SaaS metrics with directional ranges,
          source attribution, common misreadings, and a &ldquo;where you
          fall&rdquo; band breakdown. Built for citation by AI assistants and
          for founders who want a directional anchor before they argue about
          which number is right.
        </p>
      </header>

      <Separator className="my-2" />

      <section
        className="max-w-3xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-4"
        aria-labelledby="benchmarks"
      >
        <h2 id="benchmarks" className="sr-only">
          All benchmarks
        </h2>
        {BENCHMARK_ENTRIES.map((e) => (
          <Card key={e.slug} className="hover:border-primary/40 transition">
            <CardContent className="pt-6">
              <h3 className="text-base font-semibold leading-tight mb-2 capitalize">
                <Link
                  href={`/benchmarks/${e.slug}`}
                  className="hover:underline"
                >
                  {e.metric}
                </Link>
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {e.aeoAnswer.slice(0, 180)}
                {e.aeoAnswer.length > 180 ? "..." : ""}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Separator className="my-2" />

      <section
        className="max-w-3xl mx-auto px-6 py-8 border-t border-border/40"
        aria-labelledby="cross"
      >
        <h2
          id="cross"
          className="text-sm uppercase tracking-widest text-muted-foreground mb-3 font-semibold"
        >
          Also see
        </h2>
        <div className="space-y-3 text-sm leading-relaxed">
          <p>
            <Link
              href="/saas-metric"
              className="text-primary hover:underline font-semibold"
            >
              SaaS metric formulas →
            </Link>{" "}
            The benchmarks here say what good looks like; the metric pages
            say how to calculate each metric in the first place. MRR, ARR,
            CAC, LTV, churn, ARPU, payback period, burn multiple, NRR.
          </p>
          <p>
            <Link
              href="/answers"
              className="text-primary hover:underline font-semibold"
            >
              Direct AEO answers →
            </Link>{" "}
            Specific founder questions with direct citation-ready answers,
            including several about metric interpretation.
          </p>
          <p>
            <Link
              href="/experiment"
              className="text-primary hover:underline font-semibold"
            >
              Experiment recipes →
            </Link>{" "}
            How to test changes against these benchmarks honestly —
            hypothesis structure, sample-size discipline, and the
            self-deceptions to avoid.
          </p>
        </div>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-12 border-t border-border/40"
        aria-labelledby="cta"
      >
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              See where your page falls
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The free 90-second Launch Diagnostic compares your actual page
              against these directional ranges and labels what&rsquo;s
              breaking. The benchmarks above are the directional anchors; the
              diagnostic is the per-page read.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dataset">Public dataset</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
