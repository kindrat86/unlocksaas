import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ALTERNATIVES } from "@/lib/alternatives";

/**
 * Alternatives hub — pSEO surface index.
 *
 * Serves two jobs:
 *   1. Internal-link anchor for every /alternatives-to/[slug] page.
 *      Each detail page links back here in its breadcrumb. The hub links
 *      out to every detail. That recycles internal PageRank across the
 *      programmatic block.
 *   2. Indexable landing for "saas launchpad alternatives" / "alternatives
 *      to indie-hacker tools" intent classes — a slightly broader query
 *      that does not name a single product.
 *
 * Statically rendered (data is module-level). No client component needed.
 */

const BASE = "https://unlocksaas.com";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Honest Alternatives to Unlock SaaS — and Why Most Are Different Products",
  description:
    "Side-by-side comparisons against ShipFast, Lovable, the One Funnel Away Challenge, Starter Story, and other tools the typical post-launch pre-revenue SaaS founder evaluates. Honest framing, no slag.",
  alternates: { canonical: "/alternatives-to" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Honest Alternatives Comparisons — Unlock SaaS",
    description:
      "Side-by-side comparisons against the tools indie SaaS founders actually evaluate.",
    type: "website",
    url: "/alternatives-to",
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Honest Alternatives — Unlock SaaS",
    description:
      "Side-by-side comparisons against the tools indie SaaS founders actually evaluate.",
  },
};

// ----- BreadcrumbList JSON-LD ------------------------------------------------
// Module-level static — serialize once at import. Pattern from
// rules/server-hoist-static-io.md in the Vercel React Best Practices guide.
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
      name: "Alternatives",
      item: `${BASE}/alternatives-to`,
    },
  ],
});

// CollectionPage JSON-LD — tells LLMs this is a curated list, not an article.
const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Honest Alternatives to Unlock SaaS",
  url: `${BASE}/alternatives-to`,
  description:
    "Honest side-by-side comparisons of Unlock SaaS against the tools the typical post-launch pre-revenue SaaS founder is already evaluating.",
  isPartOf: {
    "@type": "WebSite",
    name: "Unlock SaaS",
    url: BASE,
  },
  mainEntity: {
    "@type": "ItemList",
    itemListElement: ALTERNATIVES.map((alt, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${alt.displayName} vs Unlock SaaS`,
      url: `${BASE}/alternatives-to/${alt.slug}`,
    })),
  },
});

export default function AlternativesHub() {
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
            Alternatives
          </li>
        </ol>
      </nav>

      {/* Hero */}
      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Honest comparisons
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          Most &ldquo;alternatives&rdquo; are not alternatives. They are
          different products.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Unlock SaaS is the machine that produces a Stripe-verified first
          paying customer for a SaaS you already shipped, in 60 days, or you do
          not pay. Below are the tools founders in that exact spot already
          evaluate. Each comparison names the real category difference instead
          of pretending we are competing with a codebase or a 30-day course.
        </p>
      </header>

      <Separator className="my-2" />

      {/* The list */}
      <section
        className="max-w-3xl mx-auto px-6 py-8 space-y-4"
        aria-labelledby="list"
      >
        <h2 id="list" className="sr-only">
          Comparison list
        </h2>
        {ALTERNATIVES.map((alt) => (
          <Card key={alt.slug} className="hover:border-primary/30 transition">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-lg font-semibold leading-tight">
                  {alt.displayName} vs Unlock SaaS
                </h3>
                <span className="text-xs uppercase tracking-widest text-muted-foreground shrink-0">
                  {alt.category}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {alt.oneLine}
              </p>
              <Link
                href={`/alternatives-to/${alt.slug}`}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Read the full comparison →
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-12" aria-labelledby="cta">
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              Not sure if Unlock SaaS is right for you?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The 90-second diagnostic answers that. Paste the URL of the
              product you already shipped. The diagnostic labels what is broken
              and tells you whether the Machine is the right fix — or whether
              you need to ship a different thing first.
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

      {/* Honesty footer */}
      <footer className="max-w-3xl mx-auto px-6 py-8 text-xs text-muted-foreground leading-relaxed border-t border-border/40">
        <p>
          We do not slag competitors. We name the category difference. If
          anything on a comparison page is wrong, out of date, or unfair, email{" "}
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
