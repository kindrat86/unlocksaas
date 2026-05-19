import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { CHECKLIST_ENTRIES } from "@/lib/checklists";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";

export const dynamic = "force-static";

const CANONICAL = "/checklist";

export const metadata: Metadata = {
  title: "Indie SaaS Pre-Launch Checklists | Unlock SaaS",
  description:
    "Finite, ordered checklists for pre-launch indie SaaS founders. Every step has an observable done-condition. No aspirational items.",
  alternates: pageAlternates(CANONICAL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Indie SaaS Checklists — Unlock SaaS",
    description:
      "Diagnostic-grade checklists for pre-revenue indie SaaS founders. Pre-launch, before-you-charge, first-customer, checkout, broadcast, outreach.",
    url: CANONICAL,
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Indie SaaS Checklists",
    description: "Finite, ordered, observable pre-launch checklists.",
  },
};

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Indie SaaS Pre-Launch Checklists",
  url: `${BASE_URL}/checklist`,
  description:
    "Finite, ordered checklists for pre-revenue indie SaaS founders. Each step has an observable done-condition.",
  isPartOf: { "@id": ID.website },
  inLanguage: "en-US",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: CHECKLIST_ENTRIES.length,
    itemListElement: CHECKLIST_ENTRIES.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.displayName,
      url: `${BASE_URL}/checklist/${e.slug}`,
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
      name: "Checklists",
      item: `${BASE_URL}/checklist`,
    },
  ],
});

export default function ChecklistHubPage() {
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
            Checklists
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Finite, observable, dated
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          Indie SaaS pre-launch checklists.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Diagnostic-grade checklists for pre-revenue indie SaaS founders. Each
          step has an observable done-condition. No aspirational items, no
          padding, no fabricated benchmarks — the same Brunson Hard-Rule
          discipline that powers the live diagnostic.
        </p>
      </header>

      <Separator className="my-2" />

      <section className="max-w-3xl mx-auto px-6 py-6">
        <ul className="space-y-4">
          {CHECKLIST_ENTRIES.map((e) => (
            <li key={e.slug}>
              <Link
                href={`/checklist/${e.slug}`}
                className="block border border-border/40 rounded-lg p-4 hover:border-primary/40 transition-colors"
              >
                <p className="text-base font-semibold text-primary mb-1 leading-tight">
                  {e.displayName}
                </p>
                <p className="text-xs text-muted-foreground mb-2">
                  Run before: {e.beforeEvent}
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
              Pair a checklist with the diagnostic
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Run the diagnostic on your live URL first — it labels which
              Brunson failure mode your page hits. Then run the matching
              checklist to close the failure. Diagnostic plus checklist
              beats either one alone.
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
