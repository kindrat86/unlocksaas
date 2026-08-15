import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { TEMPLATE_ENTRIES } from "@/lib/templates";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";


const CANONICAL = "/template";

export const metadata: Metadata = {
  title: "Brunson Script Templates for Indie SaaS | Unlock SaaS",
  description:
    "Fill-in templates for Brunson scripts — Epiphany Bridge, Dollar Objection, Perfect Webinar, Stack Slide, Seinfeld, Soap Opera Sequence, Hook-Story-Offer.",
  alternates: pageAlternates(CANONICAL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Brunson Script Templates — Unlock SaaS",
    description: "Fill-in placeholders for canonical Brunson scripts.",
    url: CANONICAL,
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brunson Script Templates",
    description: "Fill-in templates for the Brunson scripts the Playbook teaches.",
  },
};

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Brunson Script Templates",
  url: `${BASE_URL}/template`,
  description:
    "Fill-in placeholder templates for the canonical Brunson scripts: Epiphany Bridge, Dollar Objection, Perfect Webinar, Stack Slide, Seinfeld email, Soap Opera Sequence, Hook-Story-Offer, Reluctant Hero.",
  isPartOf: { "@id": ID.website },
  inLanguage: "en-US",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: TEMPLATE_ENTRIES.length,
    itemListElement: TEMPLATE_ENTRIES.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.displayName,
      url: `${BASE_URL}/template/${e.slug}`,
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
      name: "Templates",
      item: `${BASE_URL}/template`,
    },
  ],
});

export default function TemplateHubPage() {
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
            Templates
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Canonical Brunson scripts
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          Brunson script templates.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Fill-in placeholders for the canonical Brunson scripts the Playbook
          teaches — Epiphany Bridge, Dollar Objection, Perfect Webinar, Stack
          Slide, Seinfeld email, Soap Opera Sequence, Hook-Story-Offer page,
          Reluctant Hero positioning. Each template names every structural
          block, the slot guidance, and the common failure modes.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-4">
          Different from{" "}
          <Link href="/swipe-file" className="text-primary hover:underline">
            /swipe-file
          </Link>{" "}
          (patterns observed in real teardowns) — these are the Brunson
          method scripts with structural placeholders, not observed patterns.
        </p>
      </header>

      <Separator className="my-2" />

      <section className="max-w-3xl mx-auto px-6 py-6">
        <ul className="space-y-4">
          {TEMPLATE_ENTRIES.map((e) => (
            <li key={e.slug}>
              <Link
                href={`/template/${e.slug}`}
                className="block border border-border/40 rounded-lg p-4 hover:border-primary/40 transition-colors"
              >
                <p className="text-base font-semibold text-primary mb-1 leading-tight">
                  {e.displayName}
                </p>
                <p className="text-xs text-muted-foreground mb-2">
                  {e.brunsonLens.toUpperCase()} · {e.usedIn}
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
              The Playbook teaches all eight in practice
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Each template above is one of the canonical Brunson scripts the
              Playbook teaches the founder to fill in for their specific
              product. The diagnostic tells you which template you need first.
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
