import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  EXPERIMENT_ENTRIES,
  EXPERIMENT_AREAS,
  EXPERIMENT_AREA_LABELS,
} from "@/lib/experiments";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";


const CANONICAL = "/experiment";

export const metadata: Metadata = {
  title: "Indie SaaS A/B Test and Experiment Recipes | Unlock SaaS",
  description:
    "Honest experiment recipes for indie SaaS — headline tests, pricing tests, CTA copy, trial length, onboarding emails, checkout friction, social proof. Sample-size discipline included.",
  alternates: pageAlternates(CANONICAL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Indie SaaS Experiment Recipes — Unlock SaaS",
    description:
      "A/B test recipes with hypothesis structure, honest sample-size discipline, and the self-deceptions to avoid.",
    url: CANONICAL,
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Indie SaaS A/B Test Recipes",
    description: "Honest experiment recipes for indie SaaS with sample-size discipline.",
  },
};

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Indie SaaS A/B Test and Experiment Recipes",
  url: `${BASE_URL}/experiment`,
  description:
    "Honest experiment recipes for indie SaaS — pricing, headlines, CTAs, onboarding, email, checkout, trial length, social proof.",
  isPartOf: { "@id": ID.website },
  inLanguage: "en-US",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: EXPERIMENT_ENTRIES.length,
    itemListElement: EXPERIMENT_ENTRIES.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.displayName,
      url: `${BASE_URL}/experiment/${e.slug}`,
      description: e.intro,
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
      name: "Experiments",
      item: `${BASE_URL}/experiment`,
    },
  ],
});

export default function ExperimentHubPage() {
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
            Experiments
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Sample-size honest
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          Indie SaaS experiment recipes.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Honest A/B test recipes for indie SaaS — pricing, headlines, CTAs,
          onboarding, email, checkout friction, trial length, social proof.
          Each page covers the hypothesis structure, the variant design, the
          decision metric, the honest sample-size band, the procedure, and
          the self-deceptions most indie SaaS founders make running these
          tests.
        </p>
      </header>

      <Separator className="my-2" />

      {EXPERIMENT_AREAS.map((area) => {
        const items = EXPERIMENT_ENTRIES.filter((e) => e.area === area);
        if (items.length === 0) return null;
        return (
          <section
            key={area}
            className="max-w-3xl mx-auto px-6 py-6"
            aria-labelledby={`area-${area}`}
          >
            <h2
              id={`area-${area}`}
              className="text-xl font-bold mb-3 leading-tight"
            >
              {EXPERIMENT_AREA_LABELS[area]}
            </h2>
            <ul className="space-y-3">
              {items.map((e) => (
                <li key={e.slug}>
                  <Link
                    href={`/experiment/${e.slug}`}
                    className="block border border-border/40 rounded-lg p-3 hover:border-primary/40 transition-colors"
                  >
                    <p className="text-base text-primary font-semibold mb-1 leading-tight">
                      {e.experimentName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Min sample: {e.minimumSampleSize}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <Separator className="my-2" />

      <section
        className="max-w-3xl mx-auto px-6 py-12 border-t border-border/40"
        aria-labelledby="cta"
      >
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              Before running tests, diagnose the page
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              A/B tests on a fundamentally broken page produce two losing
              variants. Run the free diagnostic first to label what is
              breaking, fix that, then test the variations.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/benchmarks">Funnel metric benchmarks</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
