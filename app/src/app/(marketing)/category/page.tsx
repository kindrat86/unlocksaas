import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  CATEGORIES,
  getContentDepthForCategory,
} from "@/lib/categories";
import { markdownAlternate } from "@/lib/seo/markdown-alternates";
import { HubTldr } from "@/components/seo/hub-tldr";

/**
 * Category hub — fifth pSEO surface index.
 *
 * Lists every canonical category with the depth of content available in
 * each (combined teardowns + comparisons). The hub is the directory for
 * the entire pSEO surface area, organized by the SaaS category the
 * buyer searches in.
 */

const BASE = "https://unlocksaas.com";


export const metadata: Metadata = {
  title:
    "Categories — Best SaaS Tools by Category, Analyzed for Indie Founders",
  description:
    "Curated category roundups across every SaaS tool we have analyzed: payments, forms, analytics, newsletter, scheduling, email APIs, docs, testimonials, video, workspace, project management, design, hosting.",
  // Self-canonical + explicit hreflang (defends against root layout's
  // `languages: { "en-US": "/" }` inheriting onto every child page) +
  // markdown mirror at /category.md for AEO/GEO retrievers that prefer
  // markdown over HTML. See src/lib/seo/markdown-alternates.ts.
  alternates: markdownAlternate("/category", "/category.md"),
  robots: { index: true, follow: true },
  openGraph: {
    title: "Categories — Unlock SaaS",
    description:
      "Curated category roundups across every SaaS tool we have analyzed.",
    type: "website",
    url: "/category",
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Categories — Unlock SaaS",
    description:
      "Curated category roundups across every SaaS tool we have analyzed.",
  },
};

const BREADCRUMB_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: `${BASE}/`,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Categories",
      item: `${BASE}/category`,
    },
  ],
});

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Categories — Unlock SaaS",
  url: `${BASE}/category`,
  inLanguage: "en-US",
  description:
    "Curated category roundups across every SaaS tool analyzed on Unlock SaaS — funnel teardowns, pricing teardowns, and head-to-head comparisons organized by category.",
  isPartOf: {
    "@type": "WebSite",
    name: "Unlock SaaS",
    url: BASE,
  },
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: CATEGORIES.length,
    itemListElement: CATEGORIES.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.displayName,
      url: `${BASE}/category/${c.slug}`,
    })),
  },
});

export default function CategoryHub() {
  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: BREADCRUMB_JSON }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: COLLECTION_JSON }}
      />

      {/* Breadcrumb */}
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
            Categories
          </li>
        </ol>
      </nav>

      {/* Hero */}
      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Browse by category
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          Best SaaS tools by category, analyzed for indie founders
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Every product we have analyzed, organized by the SaaS category
          you are searching in. Each category page lists every funnel
          teardown, pricing teardown, and head-to-head comparison
          available in that category.
        </p>
      </header>

      <Separator className="my-2" />

      <HubTldr
        headingLabel="Category hub TL;DR"
        cluster="Category roundups"
        count={`${CATEGORIES.length} curated category roundups`}
        intent="Curated category roundups across every SaaS tool we have analyzed. Each page aggregates funnel teardowns, pricing teardowns, and head-to-head comparisons in that category into a single high-intent landing page."
        schema="CollectionPage + ItemList; per-detail Article + ItemList + BreadcrumbList"
      />

      {/* Category list */}
      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="list"
      >
        <h2 id="list" className="sr-only">
          All categories
        </h2>
        <div className="space-y-3">
          {CATEGORIES.map((c) => {
            const depth = getContentDepthForCategory(c.slug);
            return (
              <Card
                key={c.slug}
                className="hover:border-primary/30 transition"
              >
                <CardContent className="pt-6">
                  <div className="flex items-baseline justify-between gap-3 mb-2 flex-wrap">
                    <h3 className="text-lg font-semibold leading-tight">
                      <Link
                        href={`/category/${c.slug}`}
                        className="hover:text-primary transition"
                      >
                        {c.displayName}
                      </Link>
                    </h3>
                    <span className="text-xs uppercase tracking-widest text-muted-foreground shrink-0">
                      {depth} analyses
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {c.oneLine}
                  </p>
                  <Link
                    href={`/category/${c.slug}`}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    Browse the category →
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-12" aria-labelledby="cta">
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              Building an indie SaaS in any of these categories?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The 90-second diagnostic labels what is broken on your
              offer: Wrong Person, Weak Offer, or Weak Belief. The
              category does not matter; the offer does.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/starter">Start with $1</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Cross-links to other pSEO surfaces */}
      <section
        className="max-w-3xl mx-auto px-6 py-8 border-t border-border/40"
        aria-labelledby="cross"
      >
        <h2
          id="cross"
          className="text-sm uppercase tracking-widest text-muted-foreground mb-3 font-semibold"
        >
          Or browse by analysis type
        </h2>
        <div className="space-y-3 text-sm leading-relaxed">
          <p>
            <Link
              href="/funnel-teardown"
              className="text-primary hover:underline font-semibold"
            >
              Funnel teardowns →
            </Link>{" "}
            Hook / Story / Offer breakdowns of indie SaaS marketing surfaces.
          </p>
          <p>
            <Link
              href="/pricing-teardown"
              className="text-primary hover:underline font-semibold"
            >
              Pricing teardowns →
            </Link>{" "}
            Tier structure, anchor mechanics, and upgrade triggers through
            the Brunson Stack lens.
          </p>
          <p>
            <Link
              href="/compare"
              className="text-primary hover:underline font-semibold"
            >
              Head-to-head comparisons →
            </Link>{" "}
            Symmetric dimension-by-dimension breakdowns of the tools indie
            SaaS founders evaluate.
          </p>
          <p>
            <Link
              href="/alternatives-to"
              className="text-primary hover:underline font-semibold"
            >
              Alternatives to Unlock SaaS →
            </Link>{" "}
            Side-by-side comparisons of Unlock SaaS against tools founders
            evaluate alongside it.
          </p>
        </div>
      </section>

      {/* Honesty footer */}
      <footer className="max-w-3xl mx-auto px-6 py-8 text-xs text-muted-foreground leading-relaxed border-t border-border/40">
        <p>
          New analyses added to the manifests appear on the matching
          category page automatically. If a product belongs in a category
          we have not yet defined, email{" "}
          <a
            href="mailto:maryan@unlocksaas.com"
            className="underline hover:text-foreground"
          >
            maryan@unlocksaas.com
          </a>{" "}
          and we will add it.
        </p>
      </footer>
    </main>
  );
}
