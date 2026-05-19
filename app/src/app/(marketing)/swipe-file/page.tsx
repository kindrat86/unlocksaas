import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  SWIPE_FILE_ENTRIES,
  SWIPE_FILE_CATEGORIES,
  SWIPE_FILE_CATEGORY_LABELS,
} from "@/lib/swipe-files";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";

export const dynamic = "force-static";

const CANONICAL = "/swipe-file";

export const metadata: Metadata = {
  title: "Indie SaaS Swipe Files — Headlines, CTAs, Stacks | Unlock SaaS",
  description:
    "Structural patterns drawn from real indie SaaS funnels — headlines, CTAs, guarantees, stack slides, pricing copy. Fill-in-the-blank templates, every source named.",
  alternates: pageAlternates(CANONICAL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Indie SaaS Swipe Files — Unlock SaaS",
    description:
      "Pattern-level swipe files for indie SaaS founders. No quoted copy — fill-in-the-blank templates sourced from named teardowns.",
    url: CANONICAL,
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Indie SaaS Swipe Files",
    description: "Pattern-level fill-in-the-blank templates from named indie SaaS funnels.",
  },
};

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Indie SaaS Swipe Files",
  url: `${BASE_URL}/swipe-file`,
  description:
    "Pattern-level swipe files for indie SaaS funnels — structural templates with named sources from the funnel- and pricing-teardown catalogs.",
  isPartOf: { "@id": ID.website },
  inLanguage: "en-US",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: SWIPE_FILE_ENTRIES.length,
    itemListElement: SWIPE_FILE_ENTRIES.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.title,
      url: `${BASE_URL}/swipe-file/${e.slug}`,
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
          Patterns, not slag
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          Indie SaaS swipe files.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Structural patterns drawn from real indie SaaS funnels — headlines,
          CTAs, guarantees, stack slides, pricing copy. Every example is a
          fill-in-the-blank template; every source is a teardown we have
          already shipped. No quoted copy, no fabricated examples.
        </p>
      </header>

      <Separator className="my-2" />

      {SWIPE_FILE_CATEGORIES.map((category) => {
        const items = SWIPE_FILE_ENTRIES.filter((e) => e.category === category);
        if (items.length === 0) return null;
        return (
          <section
            key={category}
            className="max-w-3xl mx-auto px-6 py-6"
            aria-labelledby={`cat-${category}`}
          >
            <h2
              id={`cat-${category}`}
              className="text-xl font-bold mb-3 leading-tight"
            >
              {SWIPE_FILE_CATEGORY_LABELS[category]}
            </h2>
            <ul className="space-y-2">
              {items.map((e) => (
                <li key={e.slug}>
                  <Link
                    href={`/swipe-file/${e.slug}`}
                    className="text-base text-primary hover:underline leading-relaxed"
                  >
                    {e.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <Separator className="my-2" />

      <section
        className="max-w-3xl mx-auto px-6 py-12 border-t border-border/40"
        aria-labelledby="cta"
      >
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              Apply a pattern to your own page
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The free 90-second Launch Diagnostic labels what is broken on
              your above-the-fold block — Wrong Person, Weak Offer, or Weak
              Belief — and tells you which swipe file fixes it.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/funnel-teardown">See the full teardowns</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
