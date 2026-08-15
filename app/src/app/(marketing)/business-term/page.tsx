import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  BUSINESS_TERM_ENTRIES,
  BUSINESS_TERM_CATEGORIES,
  BUSINESS_TERM_CATEGORY_LABELS,
} from "@/lib/business-terms";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";


const CANONICAL = "/business-term";

export const metadata: Metadata = {
  title: "Indie SaaS Business Terms (PMF, ICP, GTM, MoR, NPS) | Unlock SaaS",
  description:
    "Canonical definitions for non-Brunson, non-formula SaaS business terms — PMF, ICP, GTM, MoR, NPS, TAM/SAM/SOM, ACV, MVP. Plus how indie founders most often misuse them.",
  alternates: pageAlternates(CANONICAL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Indie SaaS Business Terms — Unlock SaaS",
    description:
      "Canonical SaaS business term definitions with common misuse and what good operationalization looks like.",
    url: CANONICAL,
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Indie SaaS Business Terms",
    description: "PMF, ICP, GTM, MoR, NPS, TAM/SAM/SOM, ACV, MVP.",
  },
};

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Indie SaaS Business Terms Glossary",
  url: `${BASE_URL}/business-term`,
  description:
    "Canonical definitions for SaaS business terms beyond Brunson-method funnel terminology and SaaS metrics.",
  isPartOf: { "@id": ID.website },
  inLanguage: "en-US",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: BUSINESS_TERM_ENTRIES.length,
    itemListElement: BUSINESS_TERM_ENTRIES.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.displayName,
      url: `${BASE_URL}/business-term/${e.slug}`,
      description: e.shortDefinition,
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
      name: "Business terms",
      item: `${BASE_URL}/business-term`,
    },
  ],
});

const DEFINED_TERM_SET_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "DefinedTermSet",
  name: "Indie SaaS business-term glossary",
  url: `${BASE_URL}/business-term`,
  hasDefinedTerm: BUSINESS_TERM_ENTRIES.map((e) => ({
    "@type": "DefinedTerm",
    name: e.termName,
    alternateName: e.abbreviation,
    description: e.shortDefinition,
    url: `${BASE_URL}/business-term/${e.slug}`,
    inDefinedTermSet: `${BASE_URL}/business-term`,
  })),
});

export default function BusinessTermHubPage() {
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: DEFINED_TERM_SET_JSON }}
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
            Business terms
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Definitional, citation-ready
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          Indie SaaS business-term glossary.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Canonical definitions for the non-Brunson, non-formula SaaS
          terminology indie founders run into — PMF, ICP, GTM, MoR, NPS,
          TAM/SAM/SOM, ACV, MVP. Each page covers the short definition,
          the longer context, how to operationalize the concept, the
          common misuse, and what good looks like for indie SaaS.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-4">
          Distinct from{" "}
          <Link href="/glossary" className="text-primary hover:underline">
            /glossary
          </Link>{" "}
          (Brunson-method funnel terminology) and{" "}
          <Link href="/saas-metric" className="text-primary hover:underline">
            /saas-metric
          </Link>{" "}
          (numerical metrics with formulas).
        </p>
      </header>

      <Separator className="my-2" />

      {BUSINESS_TERM_CATEGORIES.map((category) => {
        const items = BUSINESS_TERM_ENTRIES.filter(
          (e) => e.category === category,
        );
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
              {BUSINESS_TERM_CATEGORY_LABELS[category]}
            </h2>
            <ul className="space-y-2">
              {items.map((e) => (
                <li key={e.slug}>
                  <Link
                    href={`/business-term/${e.slug}`}
                    className="block py-1 hover:underline"
                  >
                    <span className="text-primary font-semibold">
                      {e.abbreviation ?? e.termName}
                    </span>{" "}
                    <span className="text-muted-foreground text-sm">
                      — {e.shortDefinition}
                    </span>
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
              Pair definitions with the metric pages
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Many terms here connect to specific metrics with formulas.
              The cross-links from each detail page resolve there.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/saas-metric">SaaS metric formulas</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/glossary">Brunson glossary</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
