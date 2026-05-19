import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { WHY_ISNT_MY_ENTRIES } from "@/lib/why-isnt-my";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";

/**
 * /why-isnt-my hub – panic-mode diagnostic intent.
 *
 * This page is the entry into the eight per-element diagnostic pages.
 * Built specifically for the founder who Googles "why isn't my X
 * converting" – the highest commercial intent search the ICP makes.
 *
 * The hub itself ranks for the bare "why isn't my SaaS converting"
 * pattern and routes to the specific element diagnosis. Detail pages
 * carry the cohort-specific Wrong Person / Weak Offer / Weak Belief
 * triage and CTA into /diagnostic.
 */

export const dynamic = "force-static";

const CANONICAL = "/why-isnt-my";

export const metadata: Metadata = {
  title:
    "Why Isn't My Funnel Converting? Eight Founder Diagnostics – Unlock SaaS",
  description:
    "Panic-mode diagnostic guides for indie SaaS founders. Eight specific funnel-element pages, each labeling the issue Wrong Person, Weak Offer, or Weak Belief, with the fix to ship this week.",
  alternates: pageAlternates(CANONICAL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Why Isn't My Funnel Converting? – Unlock SaaS",
    description:
      "Eight per-element diagnostic pages: landing page, checkout, upsell, opt-in, VSL, tripwire, webinar registration, and email open rate.",
    url: CANONICAL,
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Why Isn't My Funnel Converting?",
    description:
      "Eight founder diagnostics for the moment your dashboard is flat.",
  },
};

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Why Isn't My Funnel Converting? – Unlock SaaS",
  url: `${BASE_URL}/why-isnt-my`,
  description:
    "Eight per-element diagnostic pages for indie SaaS founders, each labeling the issue Wrong Person, Weak Offer, or Weak Belief.",
  isPartOf: { "@id": ID.website },
  inLanguage: "en-US",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: WHY_ISNT_MY_ENTRIES.length,
    itemListElement: WHY_ISNT_MY_ENTRIES.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `Why isn't my ${e.element} converting`,
      url: `${BASE_URL}/why-isnt-my/${e.slug}`,
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
      name: "Why isn't my",
      item: `${BASE_URL}/why-isnt-my`,
    },
  ],
});

export default function WhyIsntMyHubPage() {
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
            Why isn&rsquo;t my
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Panic-mode diagnostics
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          Why isn&rsquo;t my funnel converting?
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Eight per-element diagnostics for the moment your dashboard is flat.
          Each page labels the issue as Wrong Person, Weak Offer, or Weak
          Belief, names the most common cause, and gives you the one fix to
          ship this week. The same triage powers the free 90-second
          diagnostic.
        </p>
      </header>

      <Separator className="my-2" />

      <section
        className="max-w-3xl mx-auto px-6 py-8 space-y-4"
        aria-labelledby="elements-heading"
      >
        <h2 id="elements-heading" className="sr-only">
          Per-element diagnostics
        </h2>
        {WHY_ISNT_MY_ENTRIES.map((e) => (
          <Card key={e.slug} className="hover:border-primary/40 transition">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold leading-tight mb-2">
                <Link
                  href={`/why-isnt-my/${e.slug}`}
                  className="hover:underline"
                >
                  Why isn&rsquo;t my {e.element} converting?
                </Link>
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                {e.tldr}
              </p>
              <p>
                <Link
                  href={`/why-isnt-my/${e.slug}`}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  Diagnose this element →
                </Link>
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
              Or just diagnose the whole page in 90 seconds
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Paste your live product URL into the free Launch Diagnostic.
              The system applies the same Wrong Person / Weak Offer / Weak
              Belief triage across the whole page and tells you which one
              is breaking before you ship the fix.
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
