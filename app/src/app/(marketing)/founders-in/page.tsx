import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { CITY_ENTRIES } from "@/lib/founders-in";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import { HubTldr } from "@/components/seo/hub-tldr";

const CANONICAL = "/founders-in";

export const metadata: Metadata = {
  title: "Micro-SaaS Founders by City – 25 Local Scenes",
  description:
    "Geo landing pages for indie founders building micro-SaaS in 25 cities. Where the local scene meets, plus the free Hook / Story / Offer diagnostic.",
  alternates: pageAlternates(CANONICAL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Micro-SaaS Founders by City",
    description:
      "Geo landing pages for indie founders building micro-SaaS in 25 cities across the US, EU, and Asia-Pacific.",
    url: CANONICAL,
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Micro-SaaS founders by city",
    description: "25 city-tuned landing pages for indie SaaS founders.",
  },
};

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Unlock SaaS founders by city",
  url: `${BASE_URL}/founders-in`,
  description:
    "Geo landing pages for indie founders building micro-SaaS, organized by city.",
  isPartOf: { "@id": ID.website },
  inLanguage: "en-US",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: CITY_ENTRIES.length,
    itemListElement: CITY_ENTRIES.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `Founders in ${e.displayName}`,
      url: `${BASE_URL}/founders-in/${e.slug}`,
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
      name: "Founders in",
      item: `${BASE_URL}/founders-in`,
    },
  ],
});

// Group cities by region for a more useful index layout. Pure
// presentation – the SLUGS array remains the canonical sort order
// for sitemap and JSON-LD ItemList ordering.
function regionFor(slug: string): "Americas" | "Europe" | "Asia-Pacific" {
  const americas = new Set([
    "san-francisco",
    "new-york",
    "austin",
    "miami",
    "los-angeles",
    "seattle",
    "boston",
    "denver",
    "chicago",
    "portland",
    "toronto",
    "vancouver",
  ]);
  const europe = new Set([
    "london",
    "berlin",
    "paris",
    "amsterdam",
    "lisbon",
    "barcelona",
    "dublin",
    "athens",
    "copenhagen",
  ]);
  if (americas.has(slug)) return "Americas";
  if (europe.has(slug)) return "Europe";
  return "Asia-Pacific";
}

export default function FoundersInHubPage() {
  const grouped = {
    Americas: CITY_ENTRIES.filter((e) => regionFor(e.slug) === "Americas"),
    Europe: CITY_ENTRIES.filter((e) => regionFor(e.slug) === "Europe"),
    "Asia-Pacific": CITY_ENTRIES.filter(
      (e) => regionFor(e.slug) === "Asia-Pacific",
    ),
  } as const;

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
            Founders in
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Geo pages
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          Micro-SaaS founders, by city.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          The Hook / Story / Offer diagnostic is geography-agnostic. These
          city pages add the local scene context – where local indie
          founders gather, the pain angle that lands hardest in that
          market, and the cross-timezone collaboration window – on top
          of the same diagnostic.
        </p>
      </header>

      <Separator className="my-2" />

      <HubTldr
        headingLabel="Geo hub TL;DR"
        cluster="City-tuned founder pages"
        count={`${CITY_ENTRIES.length} cities across the Americas, Europe, and Asia-Pacific`}
        intent="Same Hook / Story / Offer diagnostic, framed for the local indie SaaS scene and cross-timezone collaboration context."
        schema="CollectionPage + ItemList; per-detail Article + Place + BreadcrumbList"
      />

      {(["Americas", "Europe", "Asia-Pacific"] as const).map((region) => (
        <section
          key={region}
          className="max-w-3xl mx-auto px-6 py-8"
          aria-labelledby={`region-${region.toLowerCase()}`}
        >
          <h2
            id={`region-${region.toLowerCase()}`}
            className="text-xl font-semibold mb-4 leading-tight"
          >
            {region}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {grouped[region].map((e) => (
              <Card key={e.slug} className="hover:border-primary/40 transition">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold leading-tight mb-2">
                    <Link
                      href={`/founders-in/${e.slug}`}
                      className="hover:underline"
                    >
                      Founders in {e.displayName}
                    </Link>
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {e.sceneIntro.slice(0, 220)}
                    {e.sceneIntro.length > 220 ? "..." : ""}
                  </p>
                  <Link
                    href={`/founders-in/${e.slug}`}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    Open this page →
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ))}

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
              The Hook / Story / Offer triage is geography-agnostic. The
              city pages above add local scene framing; the diagnosis
              itself works on any post-launch pre-revenue founder page,
              from anywhere.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/for">Niche pages</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
