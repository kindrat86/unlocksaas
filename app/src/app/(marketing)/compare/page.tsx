import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  COMPARISONS,
  groupComparisonsByCategory,
} from "@/lib/comparisons";
import { markdownAlternate } from "@/lib/seo/markdown-alternates";
import { HubDatasetJsonLd } from "@/components/seo/json-ld";

// Latest lastVerified across the manifest – feeds Dataset.dateModified.
const COMPARE_LATEST_VERIFIED = COMPARISONS.reduce(
  (latest, c) => (c.lastVerified > latest ? c.lastVerified : latest),
  COMPARISONS[0]?.lastVerified ?? "2026-05-17",
);

/**
 * Compare hub — fourth pSEO surface index.
 *
 * Same shape as the prior hubs: CollectionPage + BreadcrumbList JSON-LD,
 * category grouping, cross-links to teardown surfaces.
 */

const BASE = "https://unlocksaas.com";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title:
    "Compare — Honest Head-to-Head Comparisons of the Tools Indie SaaS Founders Evaluate",
  description:
    "Symmetric head-to-head comparisons. Dimension-by-dimension verdicts, honest take, and the right pick for indie SaaS founders specifically.",
  alternates: markdownAlternate("/compare", "/compare.md"),
  robots: { index: true, follow: true },
  openGraph: {
    title: "Compare — Unlock SaaS",
    description:
      "Honest head-to-head comparisons of the tools indie SaaS founders evaluate.",
    type: "website",
    url: "/compare",
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Compare — Unlock SaaS",
    description:
      "Honest head-to-head comparisons of the tools indie SaaS founders evaluate.",
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
      name: "Compare",
      item: `${BASE}/compare`,
    },
  ],
});

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Compare — Unlock SaaS",
  url: `${BASE}/compare`,
  inLanguage: "en-US",
  description:
    "Symmetric head-to-head comparisons of the tools indie SaaS founders evaluate. Dimension-by-dimension verdicts, honest take, indie-founder recommendation.",
  isPartOf: {
    "@type": "WebSite",
    name: "Unlock SaaS",
    url: BASE,
  },
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: COMPARISONS.length,
    itemListElement: COMPARISONS.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${c.a.name} vs ${c.b.name}`,
      url: `${BASE}/compare/${c.slug}`,
    })),
  },
});

export default function CompareHub() {
  const groups = groupComparisonsByCategory();

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
      {/* AIO uplift: Dataset schema. Comparisons treated as a dated catalog
          of head-to-head SaaS evaluations. */}
      <HubDatasetJsonLd
        name="Indie SaaS Head-to-Head Comparisons Catalog"
        description="Symmetric dimension-by-dimension comparisons of indie SaaS tools. Each entry names who each side is best for, scores six to nine dimensions, gives an honest take, and names the indie-founder pick."
        hubPath="/compare"
        mdPath="/compare.md"
        lastVerified={COMPARE_LATEST_VERIFIED}
        entries={COMPARISONS.map((c) => ({
          slug: c.slug,
          displayName: `${c.a.name} vs ${c.b.name}`,
        }))}
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
            Compare
          </li>
        </ol>
      </nav>

      {/* Hero */}
      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Head-to-head comparisons
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          Honest comparisons. Both sides get a fair read.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Symmetric dimension-by-dimension breakdowns of the tools indie SaaS
          founders are mid-evaluation on. Each page names who each side is for,
          why you would pick either, and what the right call is specifically for
          a post-launch pre-revenue founder.
        </p>
      </header>

      <Separator className="my-2" />

      {/* How to read */}
      <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="lens">
        <h2 id="lens" className="text-xl font-bold mb-4 leading-tight">
          How to read a comparison
        </h2>
        <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
          <li>
            <span className="text-foreground font-semibold">Best for</span>{" "}
            names the canonical buyer for each side.
          </li>
          <li>
            <span className="text-foreground font-semibold">Pick X if</span>{" "}
            lists 3-5 reasons to pick each side, side-by-side.
          </li>
          <li>
            <span className="text-foreground font-semibold">
              Dimension-by-dimension
            </span>{" "}
            scores each comparison axis: A wins, B wins, tied, or different
            shapes.
          </li>
          <li>
            <span className="text-foreground font-semibold">
              Indie founder pick
            </span>{" "}
            names the right call specifically for a post-launch pre-revenue
            SaaS founder.
          </li>
        </ul>
      </section>

      <Separator className="my-2" />

      {/* Grouped list */}
      <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="list">
        <h2 id="list" className="sr-only">
          All comparisons
        </h2>
        <div className="space-y-10">
          {groups.map((group) => (
            <div key={group.category}>
              <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-4 font-semibold">
                {group.category}
              </h3>
              <div className="space-y-3">
                {group.comparisons.map((c) => (
                  <Card
                    key={c.slug}
                    className="hover:border-primary/30 transition"
                  >
                    <CardContent className="pt-6">
                      <h4 className="text-lg font-semibold leading-tight mb-2">
                        <Link
                          href={`/compare/${c.slug}`}
                          className="hover:text-primary transition"
                        >
                          {c.a.name} vs {c.b.name}
                        </Link>
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                        {c.oneLine}
                      </p>
                      <div className="flex items-center justify-between gap-4">
                        <Link
                          href={`/compare/${c.slug}`}
                          className="text-sm font-semibold text-primary hover:underline"
                        >
                          Read the comparison →
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          Verified {c.lastVerified}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-12" aria-labelledby="cta">
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              Building a SaaS that wins this kind of comparison?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The 90-second diagnostic labels what is broken on your offer:
              Wrong Person, Weak Offer, or Weak Belief.
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
          Also see
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
            Tier structure, anchor mechanics, and upgrade triggers through the
            Brunson Stack lens.
          </p>
          <p>
            <Link
              href="/alternatives-to"
              className="text-primary hover:underline font-semibold"
            >
              Honest alternatives →
            </Link>{" "}
            Side-by-side comparisons of Unlock SaaS against the tools founders
            evaluate alongside it.
          </p>
        </div>
      </section>

      {/* Honesty footer */}
      <footer className="max-w-3xl mx-auto px-6 py-8 text-xs text-muted-foreground leading-relaxed border-t border-border/40">
        <p>
          We do not slag either side of these comparisons. Both products get
          honest credit for what they do well, and the verdict per dimension is
          named explicitly. If any comparison is unfair, wrong, or out of date,
          email{" "}
          <a
            href="mailto:maryan@unlocksaas.com"
            className="underline hover:text-foreground"
          >
            maryan@unlocksaas.com
          </a>{" "}
          and we will fix it.
        </p>
      </footer>
    </main>
  );
}
