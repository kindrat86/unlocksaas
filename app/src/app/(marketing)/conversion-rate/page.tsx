import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { CONVERSION_RATE_ENTRIES } from "@/lib/conversion-rate";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import { HubTldr } from "@/components/seo/hub-tldr";


const CANONICAL = "/conversion-rate";

export const metadata: Metadata = {
  title:
    "Conversion Rate Benchmarks by Niche (SaaS, Course, Agency, etc.) – Unlock SaaS",
  description:
    "Directional conversion-rate ranges by founder cohort: SaaS, course creators, agencies, coaches, consultants, ecommerce, no-code, indie hackers, AI wrappers, info products, newsletters, freelancers.",
  alternates: pageAlternates(CANONICAL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Conversion Rate Benchmarks by Niche – Unlock SaaS",
    description:
      "Niche-specific conversion ranges across funnel stages for indie founder cohorts.",
    url: CANONICAL,
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Conversion Rate Benchmarks by Niche",
    description:
      "Niche-specific conversion ranges across funnel stages for indie founder cohorts.",
  },
};

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Conversion rate benchmarks by niche",
  url: `${BASE_URL}/conversion-rate`,
  description:
    "Directional conversion-rate ranges across funnel stages, segmented by indie founder cohort.",
  isPartOf: { "@id": ID.website },
  inLanguage: "en-US",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: CONVERSION_RATE_ENTRIES.length,
    itemListElement: CONVERSION_RATE_ENTRIES.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `Conversion rate for ${e.displayName}`,
      url: `${BASE_URL}/conversion-rate/${e.slug}`,
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
      name: "Conversion rate",
      item: `${BASE_URL}/conversion-rate`,
    },
  ],
});

export default function ConversionRateHubPage() {
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
            Conversion rate
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Conversion benchmarks by niche
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          What&rsquo;s a good conversion rate for your cohort?
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Directional conversion-rate ranges across funnel stages, segmented
          by founder cohort. All ranges depend on traffic source, price
          point, and audience warmth – use them to position your own numbers
          honestly, not as universal targets.
        </p>
      </header>

      <Separator className="my-2" />

      <HubTldr
        headingLabel="Conversion rate by niche hub TL;DR"
        cluster="Niche-specific conversion benchmarks"
        count={`${CONVERSION_RATE_ENTRIES.length} founder cohorts`}
        intent="Directional conversion-rate ranges across funnel stages segmented by founder cohort: SaaS, course creators, agencies, coaches, consultants, ecommerce, no-code builders, indie hackers, AI wrappers, info product creators, newsletter operators, freelancers."
        schema="CollectionPage + ItemList; per-detail Article + FAQPage + BreadcrumbList"
      />

      <section
        className="max-w-3xl mx-auto px-6 py-8 space-y-4"
        aria-labelledby="cohorts"
      >
        <h2 id="cohorts" className="sr-only">
          All cohorts
        </h2>
        {CONVERSION_RATE_ENTRIES.map((e) => (
          <Card key={e.slug} className="hover:border-primary/40 transition">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold leading-tight mb-2">
                <Link
                  href={`/conversion-rate/${e.slug}`}
                  className="hover:underline"
                >
                  Conversion rate for {e.displayName}
                </Link>
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                {e.tldr}
              </p>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                Most common diagnosis
              </p>
              <p className="text-xs text-muted-foreground italic leading-relaxed">
                {e.mostCommonDiagnosis}
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
              Don&rsquo;t see your cohort?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The free 90-second Launch Diagnostic doesn&rsquo;t need a
              pre-defined cohort – it reads your live page directly and
              labels what&rsquo;s breaking against the Brunson Hook /
              Story / Offer pattern.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/benchmarks">Other benchmarks</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
