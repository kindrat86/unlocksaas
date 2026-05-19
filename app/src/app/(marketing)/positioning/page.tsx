import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { POSITIONING_ENTRIES } from "@/lib/positioning";
import { getCategoryBySlug } from "@/lib/categories";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";

export const dynamic = "force-static";

const CANONICAL = "/positioning";

export const metadata: Metadata = {
  title: "How to Position an Indie SaaS by Category | Unlock SaaS",
  description:
    "Positioning frameworks for indie SaaS by category — payments, forms, analytics, newsletter, scheduling, email-api, docs, testimonials. Brunson lens overlay.",
  alternates: pageAlternates(CANONICAL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Indie SaaS Positioning by Category — Unlock SaaS",
    description:
      "Honest positioning frameworks for indie SaaS in each crowded category.",
    url: CANONICAL,
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Indie SaaS Positioning by Category",
    description:
      "How to position a [category] SaaS — eight category-specific positioning guides with Brunson Hook overlay.",
  },
};

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Indie SaaS Positioning by Category",
  url: `${BASE_URL}/positioning`,
  description:
    "Category-specific positioning frameworks for indie SaaS founders. Brunson Hook overlay plus April-Dunford-style for-whom / not-for-whom analysis.",
  isPartOf: { "@id": ID.website },
  inLanguage: "en-US",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: POSITIONING_ENTRIES.length,
    itemListElement: POSITIONING_ENTRIES.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.displayName,
      url: `${BASE_URL}/positioning/${e.slug}`,
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
      name: "Positioning",
      item: `${BASE_URL}/positioning`,
    },
  ],
});

export default function PositioningHubPage() {
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
            Positioning
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          For-whom, not-for-whom, why-hard
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          How to position an indie SaaS by category.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          One positioning guide per crowded SaaS category. Each names the
          market context, the buyer you can win, the buyer to give up on, the
          single biggest positioning trap, and templated one-liner examples.
          Brunson Hook overlay; April-Dunford-style polarity.
        </p>
      </header>

      <Separator className="my-2" />

      <section className="max-w-3xl mx-auto px-6 py-6">
        <ul className="space-y-4">
          {POSITIONING_ENTRIES.map((e) => {
            const cat = getCategoryBySlug(e.categorySlug);
            return (
              <li key={e.slug}>
                <Link
                  href={`/positioning/${e.slug}`}
                  className="block border border-border/40 rounded-lg p-4 hover:border-primary/40 transition-colors"
                >
                  <p className="text-base font-semibold text-primary mb-1 leading-tight">
                    {e.displayName}
                  </p>
                  {cat ? (
                    <p className="text-xs text-muted-foreground mb-2">
                      Category: {cat.displayName}
                    </p>
                  ) : null}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {e.intro}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <Separator className="my-2" />

      <section
        className="max-w-3xl mx-auto px-6 py-12 border-t border-border/40"
        aria-labelledby="cta"
      >
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              Position is right, page is broken?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The free 90-second Launch Diagnostic takes your live page and
              tells you whether the positioning is making it to the visitor —
              Wrong Person, Weak Offer, or Weak Belief.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/category">Category roundups</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
