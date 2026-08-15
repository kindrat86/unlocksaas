import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { JOURNEY_ENTRIES } from "@/lib/journeys";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";


const CANONICAL = "/from-x-to-y";

export const metadata: Metadata = {
  title: "Indie SaaS Milestone Journey Templates | Unlock SaaS",
  description:
    "Phase-by-phase journey templates for the milestone transitions every indie SaaS founder makes. $0 to first customer, $1k to $10k MRR, builder to marketer, and more.",
  alternates: pageAlternates(CANONICAL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Indie SaaS Milestone Journey Templates — Unlock SaaS",
    description:
      "Structural journey templates for the milestone transitions indie SaaS founders go through. Phases, time bands, what to do, what to watch for.",
    url: CANONICAL,
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Indie SaaS Milestone Journey Templates",
    description: "Journey templates, not case studies. Phases, time bands, what to do, and the common detours.",
  },
};

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Indie SaaS Milestone Journey Templates",
  url: `${BASE_URL}/from-x-to-y`,
  description:
    "Phase-by-phase journey templates for the milestone transitions indie SaaS founders go through. Pattern-based, not case-study based.",
  isPartOf: { "@id": ID.website },
  inLanguage: "en-US",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: JOURNEY_ENTRIES.length,
    itemListElement: JOURNEY_ENTRIES.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.displayName,
      url: `${BASE_URL}/from-x-to-y/${e.slug}`,
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
      name: "Journey templates",
      item: `${BASE_URL}/from-x-to-y`,
    },
  ],
});

export default function FromXToYHubPage() {
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
            Journey templates
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Phase patterns, not case studies
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          Indie SaaS milestone journey templates.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          The structural journey for each major milestone indie SaaS
          founders pass through: $0 to first customer, $1k to $10k MRR,
          day job to indie founder, builder to marketer-builder, failed
          launch to relaunch. Each template names the phases, the typical
          time bands, what to do at each phase, what to watch for, and
          the common detours.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-4">
          These are templates, not case studies. The structural pattern
          comes from observation across many founders; specific
          attributions wait until the Verified Builders directory carries
          real customer journeys.
        </p>
      </header>

      <Separator className="my-2" />

      <section className="max-w-3xl mx-auto px-6 py-6">
        <ul className="space-y-4">
          {JOURNEY_ENTRIES.map((e) => (
            <li key={e.slug}>
              <Link
                href={`/from-x-to-y/${e.slug}`}
                className="block border border-border/40 rounded-lg p-4 hover:border-primary/40 transition-colors"
              >
                <p className="text-base font-semibold text-primary mb-1 leading-tight">
                  {e.displayName}
                </p>
                <p className="text-xs text-muted-foreground mb-2">
                  {e.from} → {e.to} · Typical: {e.typicalTimeBand}
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
        className="max-w-3xl mx-auto px-6 py-8 border-t border-border/40"
        aria-labelledby="cross"
      >
        <h2
          id="cross"
          className="text-sm uppercase tracking-widest text-muted-foreground mb-3 font-semibold"
        >
          Also see
        </h2>
        <div className="space-y-3 text-sm leading-relaxed">
          <p>
            <Link
              href="/skill"
              className="text-primary hover:underline font-semibold"
            >
              Founder skills to build →
            </Link>{" "}
            Each journey phase requires specific skills (customer
            development, cold email, pricing conversations). The skill
            pages name the practice plans.
          </p>
          <p>
            <Link
              href="/founder-mistake"
              className="text-primary hover:underline font-semibold"
            >
              Strategic founder mistakes →
            </Link>{" "}
            The mistakes most likely to extend each journey's timeline,
            mapped to the Brunson Hook / Story / Offer triage.
          </p>
        </div>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-12 border-t border-border/40"
        aria-labelledby="cta"
      >
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              Which phase are you in?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The free 90-second Launch Diagnostic labels which Brunson
              failure mode your page hits — and that maps cleanly to the
              phase of the journey you are stuck in.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/builders">Verified builders</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
