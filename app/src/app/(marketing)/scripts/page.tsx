import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { SCRIPT_ENTRIES } from "@/lib/scripts";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import { HubTldr } from "@/components/seo/hub-tldr";


const CANONICAL = "/scripts";

export const metadata: Metadata = {
  title: "Funnel Scripts (VSL, Perfect Webinar, SOS, Tripwire)",
  description:
    "Ready-to-record funnel scripts: VSL, Perfect Webinar, Soap Opera Sequence, tripwire sales page, OTO, Seinfeld email, 5-day challenge, lead magnet opt-in.",
  alternates: pageAlternates(CANONICAL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Funnel Scripts",
    description:
      "Recordable funnel scripts with timing markers, founder notes, and the variables you swap in. Built on Brunson Hook / Story / Offer structure.",
    url: CANONICAL,
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Funnel Scripts",
    description:
      "Ready-to-record funnel scripts for indie SaaS founders.",
  },
};

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Funnel scripts",
  url: `${BASE_URL}/scripts`,
  description:
    "Ready-to-record funnel scripts for indie SaaS founders, structured on the Brunson Hook / Story / Offer pattern.",
  isPartOf: { "@id": ID.website },
  inLanguage: "en-US",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: SCRIPT_ENTRIES.length,
    itemListElement: SCRIPT_ENTRIES.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.displayName,
      url: `${BASE_URL}/scripts/${e.slug}`,
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
      name: "Scripts",
      item: `${BASE_URL}/scripts`,
    },
  ],
});

export default function ScriptsHubPage() {
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
            Scripts
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Funnel scripts
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          Recordable scripts for the Brunson funnel archetypes.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Each script is a block-by-block template for one funnel piece, with
          timing markers, founder notes, and the variables you swap in. Use
          them as recording outlines – the Hook / Story / Offer work then
          fills the structure with your voice.
        </p>
      </header>

      <Separator className="my-2" />

      <HubTldr
        headingLabel="Funnel scripts hub TL;DR"
        cluster="Funnel scripts"
        count={`${SCRIPT_ENTRIES.length} recordable script templates`}
        intent="Ready-to-record scripts for the Brunson funnel archetypes: VSL, Perfect Webinar, Soap Opera Sequence, tripwire sales page, OTO, Seinfeld email, 5-day challenge, lead magnet opt-in, webinar registration, abandoned cart."
        schema="CollectionPage + ItemList; per-detail Article + HowTo + FAQPage + BreadcrumbList"
      />

      <section
        className="max-w-3xl mx-auto px-6 py-8 space-y-4"
        aria-labelledby="scripts"
      >
        <h2 id="scripts" className="sr-only">
          All scripts
        </h2>
        {SCRIPT_ENTRIES.map((e) => (
          <Card key={e.slug} className="hover:border-primary/40 transition">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold leading-tight mb-2">
                <Link
                  href={`/scripts/${e.slug}`}
                  className="hover:underline"
                >
                  {e.displayName}
                </Link>
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                {e.tldr}
              </p>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                Target length
              </p>
              <p className="text-xs text-muted-foreground italic leading-relaxed">
                {e.targetLength}
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
              Don&rsquo;t know which script to record first?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The free 90-second Launch Diagnostic looks at your live page
              and recommends which script is the right next move based on
              what&rsquo;s breaking right now.
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
