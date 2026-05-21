import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { SWIPE_FILE_ENTRIES } from "@/lib/swipe-files";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import { HubTldr } from "@/components/seo/hub-tldr";

/**
 * /swipe-file – pSEO hub for funnel-element copy/UI pattern libraries.
 *
 * Action-intent hub: post-launch founders searching for "saas hero
 * headline examples", "pricing table examples", "CTA button copy"
 * land here, scan the 20-element catalog, and click into a per-element
 * page that ships 10-15 named pattern formulas with examples.
 *
 * Brunson Hard-Rule reconciliation: each element is mapped to its
 * Hook / Story / Offer lens so founders know which job the element
 * does, not just what shape it takes.
 */

const CANONICAL = "/swipe-file";

export const metadata: Metadata = {
  title:
    "Swipe Files – 20 Indie SaaS Funnel Element Pattern Libraries | Unlock SaaS",
  description:
    "Twenty swipe files of named copy + UI patterns for every indie SaaS funnel element: hero headlines, CTAs, pricing tables, testimonials, OTOs, and more.",
  alternates: pageAlternates(CANONICAL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Swipe Files – Indie SaaS Funnel Element Patterns",
    description:
      "Twenty per-element swipe files (hero, CTA, pricing, OTO, testimonials) with named formulas and Brunson Hook / Story / Offer lensing.",
    url: CANONICAL,
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Swipe Files – Indie SaaS Funnel Element Patterns",
    description:
      "Twenty per-element swipe files with named formulas and Brunson lens mapping.",
  },
};

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Indie SaaS Swipe Files",
  url: `${BASE_URL}/swipe-file`,
  description:
    "Per-element pattern libraries for indie SaaS funnel elements, mapped to Russell Brunson's Hook / Story / Offer lens.",
  isPartOf: { "@id": ID.website },
  inLanguage: "en-US",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: SWIPE_FILE_ENTRIES.length,
    itemListElement: SWIPE_FILE_ENTRIES.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.displayName,
      url: `${BASE_URL}/swipe-file/${e.slug}`,
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
      name: "Swipe files",
      item: `${BASE_URL}/swipe-file`,
    },
  ],
});

export default function SwipeFileHubPage() {
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
            Swipe files
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Swipe files
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          Twenty swipe files for indie SaaS funnel elements.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          One swipe file per element. Each one ships 12 named patterns
          with their formulas, concrete examples, and the structural
          reason the pattern works – mapped to Russell Brunson&rsquo;s
          Hook / Story / Offer lens so you know which job the element is
          doing.
        </p>
      </header>

      <Separator className="my-2" />

      <HubTldr
        headingLabel="Swipe files hub TL;DR"
        cluster="Indie SaaS funnel element patterns"
        count={`${SWIPE_FILE_ENTRIES.length} swipe files, ${SWIPE_FILE_ENTRIES.reduce((n, e) => n + e.examples.length, 0)} named patterns total`}
        intent="Per-element pattern libraries with formulas, examples, common mistakes, and Brunson lens mapping. Built for post-launch indie SaaS founders rewriting their live pages."
        schema="CollectionPage + ItemList; per-detail Article + ItemList + FAQPage + BreadcrumbList"
      />

      <section
        className="max-w-3xl mx-auto px-6 py-8 space-y-4"
        aria-labelledby="swipe-files"
      >
        <h2 id="swipe-files" className="sr-only">
          All swipe files
        </h2>
        {SWIPE_FILE_ENTRIES.map((e) => (
          <Card key={e.slug} className="hover:border-primary/40 transition">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold leading-tight mb-2">
                <Link
                  href={`/swipe-file/${e.slug}`}
                  className="hover:underline"
                >
                  {e.displayName}
                </Link>
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                {e.tldr}
              </p>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                Brunson lens
              </p>
              <p className="text-xs text-muted-foreground italic leading-relaxed">
                {e.brunsonLens} – {e.examples.length} named patterns
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
              Don&rsquo;t know which element to fix first?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The free 90-second Launch Diagnostic looks at your live page
              and labels which element is the actual bottleneck – so you
              don&rsquo;t rewrite the headline when the offer is the
              problem.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/funnel-playbook">Funnel playbooks</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
