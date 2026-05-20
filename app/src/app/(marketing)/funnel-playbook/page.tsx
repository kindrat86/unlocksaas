import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { FUNNEL_PLAYBOOK_ENTRIES } from "@/lib/funnel-playbooks";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import { HubTldr } from "@/components/seo/hub-tldr";


const CANONICAL = "/funnel-playbook";

export const metadata: Metadata = {
  title:
    "Brunson Funnel Playbooks (Tripwire, VSL, Webinar, OTO, Ladder) – Unlock SaaS",
  description:
    "Step-by-step playbooks for the eight Brunson funnel archetypes: tripwire, VSL, challenge, Perfect Webinar, Soap Opera, OTO, Seinfeld Email, and Value Ladder.",
  alternates: pageAlternates(CANONICAL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Brunson Funnel Playbooks – Unlock SaaS",
    description:
      "Eight step-by-step funnel playbooks for indie SaaS founders, with common mistakes and ladder-position guidance.",
    url: CANONICAL,
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brunson Funnel Playbooks",
    description:
      "Step-by-step playbooks for the eight Brunson funnel archetypes.",
  },
};

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Brunson Funnel Playbooks",
  url: `${BASE_URL}/funnel-playbook`,
  description:
    "Step-by-step playbooks for the eight Brunson funnel archetypes used in indie SaaS.",
  isPartOf: { "@id": ID.website },
  inLanguage: "en-US",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: FUNNEL_PLAYBOOK_ENTRIES.length,
    itemListElement: FUNNEL_PLAYBOOK_ENTRIES.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.displayName,
      url: `${BASE_URL}/funnel-playbook/${e.slug}`,
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
      name: "Funnel playbook",
      item: `${BASE_URL}/funnel-playbook`,
    },
  ],
});

export default function FunnelPlaybookHubPage() {
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
            Funnel playbook
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Funnel playbooks
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          The eight Brunson funnel playbooks.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Each playbook is a step-by-step build guide for one Brunson funnel
          archetype, with the common mistakes named and the ladder position
          mapped. Use them as architecture blueprints – the Hook / Story /
          Offer work then fills the structure.
        </p>
      </header>

      <Separator className="my-2" />

      <HubTldr
        headingLabel="Funnel playbooks hub TL;DR"
        cluster="Brunson funnel playbooks"
        count={`${FUNNEL_PLAYBOOK_ENTRIES.length} Brunson funnel archetypes`}
        intent="Step-by-step playbooks for the Brunson funnel archetypes. Each carries when-to-use / when-not-to-use criteria, sequential build steps, common implementation mistakes, and ladder-position guidance."
        schema="CollectionPage + ItemList; per-detail Article + HowTo + FAQPage + BreadcrumbList"
      />

      <section
        className="max-w-3xl mx-auto px-6 py-8 space-y-4"
        aria-labelledby="playbooks"
      >
        <h2 id="playbooks" className="sr-only">
          All playbooks
        </h2>
        {FUNNEL_PLAYBOOK_ENTRIES.map((e) => (
          <Card key={e.slug} className="hover:border-primary/40 transition">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold leading-tight mb-2">
                <Link
                  href={`/funnel-playbook/${e.slug}`}
                  className="hover:underline"
                >
                  {e.displayName}
                </Link>
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                {e.tldr}
              </p>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                Ladder position
              </p>
              <p className="text-xs text-muted-foreground italic leading-relaxed">
                {e.ladderPosition}
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
              Don&rsquo;t know which playbook fits?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The free 90-second Launch Diagnostic looks at your live page
              and recommends which playbook is the right next step based on
              what&rsquo;s breaking right now.
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
