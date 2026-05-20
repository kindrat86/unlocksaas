import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { PRICING_PAGE_PATTERN_ENTRIES } from "@/lib/pricing-page-examples";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import { HubTldr } from "@/components/seo/hub-tldr";


const CANONICAL = "/pricing-page-examples";

export const metadata: Metadata = {
  title:
    "SaaS Pricing Page Examples (Tiered, Decoy, Usage-Based, Freemium) – Unlock SaaS",
  description:
    "Twelve SaaS pricing page patterns with real-world examples, mechanics, and the Brunson lens: tiered, decoy, usage-based, freemium, single-price, per-seat, LTD, annual, founding-tier, anchor-and-contrast.",
  alternates: pageAlternates(CANONICAL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "SaaS Pricing Page Examples – Unlock SaaS",
    description:
      "Pricing-page patterns with real-world examples and the Brunson lens. Tiered, decoy, usage-based, freemium, single-price, per-seat, and more.",
    url: CANONICAL,
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "SaaS Pricing Page Examples",
    description:
      "Pricing-page patterns with real-world examples and the Brunson lens.",
  },
};

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "SaaS pricing page patterns",
  url: `${BASE_URL}/pricing-page-examples`,
  description:
    "SaaS pricing-page patterns with real-world examples, mechanics, when each works and when each backfires.",
  isPartOf: { "@id": ID.website },
  inLanguage: "en-US",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: PRICING_PAGE_PATTERN_ENTRIES.length,
    itemListElement: PRICING_PAGE_PATTERN_ENTRIES.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.displayName,
      url: `${BASE_URL}/pricing-page-examples/${e.slug}`,
      description: e.tldr,
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
      name: "Pricing page examples",
      item: `${BASE_URL}/pricing-page-examples`,
    },
  ],
});

export default function PricingPageExamplesHubPage() {
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
            Pricing page examples
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Pricing patterns
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          SaaS pricing page patterns, with real-world examples.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Each pattern is described by structural mechanics, named real-world
          occurrences, and the Brunson lens that determines when it works and
          when it backfires. No fabricated case studies – every named example
          is verifiable by visiting that company&rsquo;s public pricing page.
        </p>
      </header>

      <Separator className="my-2" />

      <HubTldr
        headingLabel="Pricing page examples hub TL;DR"
        cluster="SaaS pricing page patterns"
        count={`${PRICING_PAGE_PATTERN_ENTRIES.length} pricing patterns`}
        intent="SaaS pricing page patterns with structural mechanics, real-world named examples, fit assessment, the Brunson lens, common mistakes, and AEO FAQs."
        schema="CollectionPage + ItemList; per-detail Article + FAQPage + BreadcrumbList"
      />

      <section
        className="max-w-3xl mx-auto px-6 py-8 space-y-4"
        aria-labelledby="patterns"
      >
        <h2 id="patterns" className="sr-only">
          All patterns
        </h2>
        {PRICING_PAGE_PATTERN_ENTRIES.map((e) => (
          <Card key={e.slug} className="hover:border-primary/40 transition">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold leading-tight mb-2">
                <Link
                  href={`/pricing-page-examples/${e.slug}`}
                  className="hover:underline"
                >
                  {e.displayName}
                </Link>
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                {e.tldr}
              </p>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                Named examples
              </p>
              <p className="text-xs text-muted-foreground italic leading-relaxed">
                {e.examplesInTheWild.map((ex) => ex.name).join(" · ")}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Separator className="my-2" />

      <section
        className="max-w-3xl mx-auto px-6 py-12 border-t border-border/40"
        aria-labelledby="cta"
      >
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              Don&rsquo;t know which pattern fits your offer?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The free 90-second Launch Diagnostic looks at your live
              pricing page and tells you which pattern is doing the right
              work and which is fighting your offer.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/pricing-teardown">Pricing teardowns</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
