import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { NICHE_ENTRIES } from "@/lib/niches";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import { DEFAULT_OG_IMAGES } from "@/lib/seo/og-image";
import { HubTldr } from "@/components/seo/hub-tldr";


const CANONICAL = "/for";

export const metadata: Metadata = {
  title: "Founder Funnel Diagnostics by Niche",
  description:
    "Twelve niche-specific landing pages. Same Hook / Story / Offer diagnostic, tuned to the vocabulary, money mechanics, and common mistakes of each cohort.",
  alternates: pageAlternates(CANONICAL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Unlock SaaS for Your Niche",
    description:
      "Niche-specific funnel diagnostics for course creators, agency owners, SaaS founders, coaches, consultants, and 7 other cohorts.",
    url: CANONICAL,
    siteName: "Unlock SaaS",
    images: DEFAULT_OG_IMAGES,
  },
  twitter: {
    card: "summary_large_image",
    title: "Unlock SaaS for your niche",
    description:
      "Twelve niche-specific funnel diagnostic landing pages.",
  },
};

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Unlock SaaS niche-specific pages",
  url: `${BASE_URL}/for`,
  description:
    "Niche-specific funnel diagnostic landing pages, tuned to each cohort's vocabulary and common mistakes.",
  isPartOf: { "@id": ID.website },
  inLanguage: "en-US",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: NICHE_ENTRIES.length,
    itemListElement: NICHE_ENTRIES.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `Unlock SaaS for ${e.displayName}`,
      url: `${BASE_URL}/for/${e.slug}`,
      description: e.heroSubhead,
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
      name: "For",
      item: `${BASE_URL}/for`,
    },
  ],
});

export default function ForHubPage() {
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
            For
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Niche pages
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          Unlock SaaS, tuned to your cohort.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          The same Hook / Story / Offer diagnostic, applied to the vocabulary,
          money mechanics, and common mistakes of one specific cohort. Pick
          the closest fit and you&rsquo;ll find your situation named and your
          fix mapped.
        </p>
      </header>

      <Separator className="my-2" />

      <HubTldr
        headingLabel="Niche hub TL;DR"
        cluster="Niche cohort pages"
        count={`${NICHE_ENTRIES.length} cohort-tuned landing pages`}
        intent="Same Hook / Story / Offer diagnostic, applied to the vocabulary, money mechanics, and common mistakes of one specific cohort."
        schema="CollectionPage + ItemList; per-detail Article + FAQPage + BreadcrumbList"
      />

      <section
        className="max-w-3xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-4"
        aria-labelledby="niches"
      >
        <h2 id="niches" className="sr-only">
          Niches
        </h2>
        {NICHE_ENTRIES.map((e) => (
          <Card key={e.slug} className="hover:border-primary/40 transition">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold leading-tight mb-2">
                <Link
                  href={`/for/${e.slug}`}
                  className="hover:underline capitalize"
                >
                  For {e.displayName}
                </Link>
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                {e.cohortPain.slice(0, 220)}
                {e.cohortPain.length > 220 ? "..." : ""}
              </p>
              <Link
                href={`/for/${e.slug}`}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Open this page →
              </Link>
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
              Not in this list? The diagnostic works anyway.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The Hook / Story / Offer triage is cohort-agnostic. The
              niche-specific pages above tune the vocabulary; the diagnosis
              itself works on any post-launch pre-revenue founder page.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
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
