import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  STACK_ENTRIES,
  STACK_CATEGORIES,
  STACK_CATEGORY_LABELS,
} from "@/lib/stacks-catalog";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";


const CANONICAL = "/stack";

export const metadata: Metadata = {
  title: "Indie SaaS Stack Recommendations | Unlock SaaS",
  description:
    "Specific stack recommendations for indie SaaS — solo-founder, AI-wrapper, agency, newsletter, no-code, marketplace, scheduling. Every tool cross-linked to a teardown.",
  alternates: pageAlternates(CANONICAL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Indie SaaS Stack Recommendations — Unlock SaaS",
    description:
      "Named-tool stack recommendations by use case. Every tool cross-linked to a real teardown.",
    url: CANONICAL,
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Indie SaaS Stack Recommendations",
    description: "Specific tools, specific reasons, cross-linked teardowns.",
  },
};

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Indie SaaS Stack Recommendations",
  url: `${BASE_URL}/stack`,
  description:
    "Named-tool stack recommendations for indie SaaS by use case, budget, and cohort. Every tool slot is anchored on a shipped teardown.",
  isPartOf: { "@id": ID.website },
  inLanguage: "en-US",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: STACK_ENTRIES.length,
    itemListElement: STACK_ENTRIES.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.displayName,
      url: `${BASE_URL}/stack/${e.slug}`,
      description: e.who,
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
      name: "Stacks",
      item: `${BASE_URL}/stack`,
    },
  ],
});

export default function StackHubPage() {
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
            Stacks
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Named tools, named reasons
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          Indie SaaS stack recommendations.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          One stack per use case. Each slot names exactly one tool, the role it
          fills, the one-line reason it was chosen, the honest cost band, and a
          link to the shipped teardown. No best-of-breed hand-waving.
        </p>
      </header>

      <Separator className="my-2" />

      {STACK_CATEGORIES.map((category) => {
        const items = STACK_ENTRIES.filter((e) => e.category === category);
        if (items.length === 0) return null;
        return (
          <section
            key={category}
            className="max-w-3xl mx-auto px-6 py-6"
            aria-labelledby={`cat-${category}`}
          >
            <h2
              id={`cat-${category}`}
              className="text-xl font-bold mb-3 leading-tight"
            >
              {STACK_CATEGORY_LABELS[category]}
            </h2>
            <ul className="space-y-3">
              {items.map((e) => (
                <li key={e.slug}>
                  <Link
                    href={`/stack/${e.slug}`}
                    className="block border border-border/40 rounded-lg p-4 hover:border-primary/40 transition-colors"
                  >
                    <p className="text-base font-semibold text-primary mb-1 leading-tight">
                      {e.displayName}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {e.who}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Cost ceiling: {e.monthlyCeilingLowScale}
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
              Audit your current stack against the diagnostic
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The free 90-second Launch Diagnostic looks at your live product
              page and labels the failure mode — Wrong Person, Weak Offer, or
              Weak Belief. The stack matters; the diagnosis tells you whether
              your problem is in the stack or in the funnel on top of it.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/pricing-teardown">See pricing teardowns</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
