import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { PRICING_MODEL_ENTRIES } from "@/lib/pricing-models";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";


const CANONICAL = "/pricing-model";

export const metadata: Metadata = {
  title: "SaaS Pricing Models Explained | Unlock SaaS",
  description:
    "Pricing-model deep dives for indie SaaS — flat-rate, per-seat, usage-based, freemium, tiered, hybrid, pay-what-you-want, lifetime deal. When each fits and when it does not.",
  alternates: pageAlternates(CANONICAL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "SaaS Pricing Models Explained — Unlock SaaS",
    description:
      "Eight pricing models with honest fit analysis, unit-economics implications, and common implementation mistakes.",
    url: CANONICAL,
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "SaaS Pricing Models Explained",
    description: "Flat-rate, per-seat, usage-based, freemium, tiered, hybrid, PWYW, LTD.",
  },
};

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "SaaS Pricing Models Explained",
  url: `${BASE_URL}/pricing-model`,
  description:
    "Pricing-model deep dives for indie SaaS, with honest fit analysis, unit-economics implications, and common implementation mistakes.",
  isPartOf: { "@id": ID.website },
  inLanguage: "en-US",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: PRICING_MODEL_ENTRIES.length,
    itemListElement: PRICING_MODEL_ENTRIES.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.displayName,
      url: `${BASE_URL}/pricing-model/${e.slug}`,
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
      name: "Pricing models",
      item: `${BASE_URL}/pricing-model`,
    },
  ],
});

export default function PricingModelHubPage() {
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
            Pricing models
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Pricing-model fit, not pricing-model marketing
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          SaaS pricing models explained.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          The eight indie SaaS pricing models — flat-rate, per-seat,
          usage-based, freemium, tiered, hybrid, pay-what-you-want, lifetime
          deal. Each page covers how the model works, who it best fits,
          who it does NOT fit, the unit-economics implications, the common
          implementation mistakes, and (when relevant) the positioning trap
          the model often hides.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-4">
          Distinct from{" "}
          <Link
            href="/pricing-teardown"
            className="text-primary hover:underline"
          >
            /pricing-teardown
          </Link>{" "}
          (specific products) — this is the structural &ldquo;what is
          model X and when does it work&rdquo; surface.
        </p>
      </header>

      <Separator className="my-2" />

      <section className="max-w-3xl mx-auto px-6 py-6">
        <ul className="space-y-4">
          {PRICING_MODEL_ENTRIES.map((e) => (
            <li key={e.slug}>
              <Link
                href={`/pricing-model/${e.slug}`}
                className="block border border-border/40 rounded-lg p-4 hover:border-primary/40 transition-colors"
              >
                <p className="text-base font-semibold text-primary mb-1 leading-tight">
                  {e.modelName}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {e.intro}
                </p>
              </Link>
            </li>
          ))}
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
              See pricing models applied to real products
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The pricing teardowns analyze how specific indie SaaS apply
              these models in practice — tier structure, anchor mechanics,
              upgrade triggers.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/pricing-teardown">Pricing teardowns</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/diagnostic">Free diagnostic</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
