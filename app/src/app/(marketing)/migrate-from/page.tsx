import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { MIGRATE_FROM_ENTRIES } from "@/lib/migrate-from";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";

export const dynamic = "force-static";

const CANONICAL = "/migrate-from";

export const metadata: Metadata = {
  title: "Migration Guides for Indie SaaS Founders | Unlock SaaS",
  description:
    "How to migrate off ClickFunnels, Kajabi, Gumroad, Substack, Typeform, Calendly, GA4, Notion-PM. Steps, time bands, cost deltas, pitfalls.",
  alternates: pageAlternates(CANONICAL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Indie SaaS Migration Guides — Unlock SaaS",
    description:
      "Step-by-step migration playbooks from common indie SaaS tools to their modern alternatives.",
    url: CANONICAL,
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Indie SaaS Migration Guides",
    description: "Step-by-step migrations: ClickFunnels, Kajabi, Gumroad, Substack, Typeform, Calendly, GA4, Notion-PM.",
  },
};

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Indie SaaS Migration Guides",
  url: `${BASE_URL}/migrate-from`,
  description:
    "Step-by-step migration playbooks for indie SaaS founders moving from one tool to another.",
  isPartOf: { "@id": ID.website },
  inLanguage: "en-US",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: MIGRATE_FROM_ENTRIES.length,
    itemListElement: MIGRATE_FROM_ENTRIES.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.displayName,
      url: `${BASE_URL}/migrate-from/${e.slug}`,
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
      name: "Migrate from",
      item: `${BASE_URL}/migrate-from`,
    },
  ],
});

export default function MigrateFromHubPage() {
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
            Migrate from
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          You decided. Now what?
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          Indie SaaS migration guides.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Different intent from &ldquo;X vs Y&rdquo; comparisons — these
          pages assume you already picked the destination. Each guide gives
          you the migration steps, the time band, the cost delta, the
          pitfalls, and when NOT to migrate.
        </p>
      </header>

      <Separator className="my-2" />

      <section className="max-w-3xl mx-auto px-6 py-6">
        <ul className="space-y-4">
          {MIGRATE_FROM_ENTRIES.map((e) => (
            <li key={e.slug}>
              <Link
                href={`/migrate-from/${e.slug}`}
                className="block border border-border/40 rounded-lg p-4 hover:border-primary/40 transition-colors"
              >
                <p className="text-base font-semibold text-primary mb-1 leading-tight">
                  {e.displayName}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                  {e.intro}
                </p>
                <p className="text-xs text-muted-foreground">
                  Time band: {e.timeToMigrateBand}
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
              Not sure if you should migrate?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The decision pages cover &ldquo;X or Y?&rdquo; intent —
              alternatives, head-to-heads, and the Brunson-Hard-Rule
              should-I-build verdicts. Visit those first.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/compare">Head-to-head comparisons</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/alternatives-to">Alternatives-to pages</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
