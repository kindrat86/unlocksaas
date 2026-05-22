import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  COMPARE_ENTRIES,
  COMPARE_LATEST_VERIFIED,
  groupCompareByCategory,
} from "@/lib/compare-catalog";
import { markdownAlternate } from "@/lib/seo/markdown-alternates";
import { DEFAULT_OG_IMAGES } from "@/lib/seo/og-image";
import { HubDatasetJsonLd } from "@/components/seo/json-ld";
import { HubTldr } from "@/components/seo/hub-tldr";

/**
 * Compare hub – Switzerland-style shopping-comparator index.
 *
 * Sister to /vs (long-form dimensional editorial). This hub indexes the
 * lighter, quick-verdict comparator surface added by the /compare cluster.
 * Same CollectionPage + ItemList + BreadcrumbList JSON-LD shape as the
 * other pSEO hubs.
 */

const BASE = "https://unlocksaas.com";

export const metadata: Metadata = {
  title:
    "Compare – Head-to-Head Verdicts on the Tools Indie SaaS Founders Shop For",
  description:
    "Quick Switzerland-style verdicts on the tools indie SaaS founders are mid-comparing. Pick-A-if / pick-B-if, criterion-by-criterion, plus an honest 'when neither fits' callout.",
  alternates: markdownAlternate("/compare", "/compare.md"),
  robots: { index: true, follow: true },
  openGraph: {
    title: "Compare – Unlock SaaS",
    description:
      "Quick head-to-head verdicts on the tools indie SaaS founders are mid-comparing.",
    type: "website",
    url: "/compare",
    siteName: "Unlock SaaS",
    images: DEFAULT_OG_IMAGES,
  },
  twitter: {
    card: "summary_large_image",
    title: "Compare – Unlock SaaS",
    description:
      "Quick head-to-head verdicts on the tools indie SaaS founders are mid-comparing.",
  },
};

const BREADCRUMB_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
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
  name: "Compare – Unlock SaaS",
  url: `${BASE}/compare`,
  inLanguage: "en-US",
  description:
    "Quick Switzerland-style verdicts on the tools indie SaaS founders are mid-comparing. Pick-A-if / pick-B-if, criterion-by-criterion scoring, honest 'when neither fits' callout, indie-founder pick.",
  isPartOf: { "@type": "WebSite", name: "Unlock SaaS", url: BASE },
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: COMPARE_ENTRIES.length,
    itemListElement: COMPARE_ENTRIES.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${c.a.name} vs ${c.b.name}`,
      url: `${BASE}/compare/${c.slug}`,
    })),
  },
});

export default function CompareHub() {
  const groups = groupCompareByCategory();

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
      <HubDatasetJsonLd
        name="Indie SaaS Shopping Comparator Catalog"
        description="Quick Switzerland-style head-to-head verdicts on the tools indie SaaS founders are mid-comparing. Each entry ships a 5-7 criterion table, pick-A-if / pick-B-if bullets, an honest 'when neither fits' callout, and a founder recommendation."
        hubPath="/compare"
        mdPath="/compare.md"
        lastVerified={COMPARE_LATEST_VERIFIED}
        entries={COMPARE_ENTRIES.map((c) => ({
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
          Switzerland-style comparator
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          Honest head-to-head verdicts. Both sides cited fairly.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Quick comparator pages for the tools indie SaaS founders are mid-
          shopping. Five-to-seven criteria scored symmetrically, pick-A-if /
          pick-B-if bullets, and an honest &ldquo;when neither fits&rdquo;
          callout. Every page also names the right call specifically for a
          post-launch pre-revenue founder.
        </p>
      </header>

      <Separator className="my-2" />

      <HubTldr
        headingLabel="Compare hub TL;DR"
        cluster="Switzerland-style shopping comparator"
        count={`${COMPARE_ENTRIES.length} head-to-head verdicts`}
        intent="Quick-verdict comparator for the tools indie SaaS founders are mid-comparing. Symmetric criterion scoring, pick-A-if / pick-B-if, when-neither-fits, founder pick."
        schema="CollectionPage + ItemList; per-detail Article + FAQPage + BreadcrumbList"
      />

      {/* How to read */}
      <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="lens">
        <h2 id="lens" className="text-xl font-bold mb-4 leading-tight">
          How to read a comparison
        </h2>
        <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
          <li>
            <span className="text-foreground font-semibold">
              Pick A if / Pick B if
            </span>{" "}
            – three reasons to pick each side, side by side.
          </li>
          <li>
            <span className="text-foreground font-semibold">
              Criterion-by-criterion
            </span>{" "}
            – five to seven criteria scored symmetrically: A wins, B wins,
            tied, or different shapes.
          </li>
          <li>
            <span className="text-foreground font-semibold">
              When neither fits
            </span>{" "}
            – the Switzerland tell. Both products can be wrong; we name when.
          </li>
          <li>
            <span className="text-foreground font-semibold">Founder pick</span>{" "}
            – the right call specifically for a post-launch pre-revenue SaaS
            founder.
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
                {group.entries.map((c) => (
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
                          Read the verdict →
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
              The tool is rarely the lever
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Whichever side of these verdicts you land on, your offer page is
              usually where you lose the buyer. The 90-second diagnostic labels
              what is broken on yours.
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

      {/* Cross-links */}
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
              href="/vs"
              className="text-primary hover:underline font-semibold"
            >
              Long-form head-to-head editorial →
            </Link>{" "}
            Deeper dimensional analysis on a smaller set of matchups.
          </p>
          <p>
            <Link
              href="/alternatives-to"
              className="text-primary hover:underline font-semibold"
            >
              Alternatives to Unlock SaaS →
            </Link>{" "}
            Side-by-side framing of how Unlock SaaS compares to the tools
            founders evaluate alongside it.
          </p>
          <p>
            <Link
              href="/category"
              className="text-primary hover:underline font-semibold"
            >
              Category roundups →
            </Link>{" "}
            All the tools in a category bucket on one page.
          </p>
        </div>
      </section>

      {/* Honesty footer */}
      <footer className="max-w-3xl mx-auto px-6 py-8 text-xs text-muted-foreground leading-relaxed border-t border-border/40">
        <p>
          Switzerland-style means both products get fair treatment. Every page
          ships a &ldquo;when neither fits&rdquo; callout because both can be
          the wrong call for some readers, and pretending otherwise costs
          trust. If any verdict on this surface is unfair, wrong, or out of
          date, email{" "}
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
