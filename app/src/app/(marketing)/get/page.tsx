import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { OUTCOME_ENTRIES } from "@/lib/outcomes";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";

/**
 * /get – hub page for the outcome-promise pSEO cluster.
 *
 * Every entry in src/lib/outcomes.ts gets a /get-<slug> detail page.
 * The hub here lists them all so internal-link discovery is one click
 * from any other page on the site, and so AI-agent retrievers walking
 * the canonical URL graph see the cluster as a coherent unit, not as
 * 14 disconnected leaf pages.
 *
 * Brunson Hard-Rule reconciliation: the hub describes the same product
 * the detail pages describe. The Hook on each card is the result-shaped
 * sentence the reader is searching for; the Offer that lands is always
 * the same canonical Launch Diagnostic.
 */

const CANONICAL = "/get";

export const metadata: Metadata = {
  title: `Outcome-Promise Pages: Get to ${OUTCOME_ENTRIES.length} Specific Results`,
  description:
    "One indexable page per result a post-launch pre-revenue founder is searching for: first paying customer, $1k MRR, 30 warm leads from cold outreach, and more.",
  alternates: pageAlternates(CANONICAL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Outcome-Promise Pages – Unlock SaaS",
    description: `${OUTCOME_ENTRIES.length} Brunson-shaped outcome pages for post-launch pre-revenue founders.`,
    url: CANONICAL,
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Outcome-Promise Pages – Unlock SaaS",
    description: `${OUTCOME_ENTRIES.length} outcome-promise landing pages for indie SaaS founders.`,
  },
};

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Unlock SaaS outcome-promise pages",
  url: `${BASE_URL}/get`,
  description:
    "Outcome-promise landing pages for post-launch pre-revenue founders. One page per specific result the founder is searching for.",
  isPartOf: { "@id": ID.website },
  inLanguage: "en-US",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: OUTCOME_ENTRIES.length,
    itemListElement: OUTCOME_ENTRIES.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `Get ${e.displayName}`,
      url: `${BASE_URL}/get-${e.slug}`,
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
      name: "Outcomes",
      item: `${BASE_URL}/get`,
    },
  ],
});

export default function GetOutcomesHubPage() {
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
            Outcomes
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Outcome pages
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          Get the specific result you came here looking for.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          One indexable page per result a post-launch pre-revenue founder is
          searching for. Each page is the same Hook / Story / Offer
          diagnostic, framed around the specific outcome you are chasing
          right now. Pick the closest fit and the page names what is
          actually between you and it.
        </p>
      </header>

      <Separator className="my-2" />

      {/* Retrieval metadata for this hub (cluster: outcome-promise landing
          pages; schema: CollectionPage + ItemList) lives in the JSON-LD
          blocks above. The old visible <HubTldr> block leaked that internal
          scaffolding into the visitor UI — removed 2026-07-14. */}

      <section
        className="max-w-3xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-4"
        aria-labelledby="outcomes"
      >
        <h2 id="outcomes" className="sr-only">
          Outcomes
        </h2>
        {OUTCOME_ENTRIES.map((e) => (
          <Card key={e.slug} className="hover:border-primary/40 transition">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold leading-tight mb-2">
                <Link
                  href={`/get-${e.slug}`}
                  className="hover:underline"
                >
                  {e.hookHeadline}
                </Link>
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                {e.painSnapshot.slice(0, 220)}
                {e.painSnapshot.length > 220 ? "..." : ""}
              </p>
              <Link
                href={`/get-${e.slug}`}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Open this outcome →
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
              Not sure which outcome is yours? The diagnostic decides.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The 90-second Launch Diagnostic looks at your actual page and
              labels which of three blocks is the current bottleneck. The
              outcome you should chase next is downstream of which block
              the diagnosis names.
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
