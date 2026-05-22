import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  PRICING_TEARDOWNS,
  groupPricingTeardownsByCategory,
} from "@/lib/pricing-teardowns";
import { markdownAlternate } from "@/lib/seo/markdown-alternates";
import { DEFAULT_OG_IMAGES } from "@/lib/seo/og-image";
import { HubDatasetJsonLd } from "@/components/seo/json-ld";
import { HubTldr } from "@/components/seo/hub-tldr";

// Latest lastVerified across the manifest – feeds Dataset.dateModified.
const PRICING_LATEST_VERIFIED = PRICING_TEARDOWNS.reduce(
  (latest, t) => (t.lastVerified > latest ? t.lastVerified : latest),
  PRICING_TEARDOWNS[0]?.lastVerified ?? "2026-05-17",
);

/**
 * Pricing teardowns hub — third pSEO surface index.
 *
 * Same shape as /alternatives-to and /funnel-teardown:
 *   1. Indexable for the broader query class ("saas pricing teardowns",
 *      "indie saas pricing strategy breakdowns").
 *   2. Recycles internal PageRank across the programmatic block: detail
 *      pages link back; the hub links out; related-by-tag block on each
 *      detail page cross-links siblings.
 *
 * Statically rendered. All data module-level.
 */

const BASE = "https://unlocksaas.com";


export const metadata: Metadata = {
  title:
    "Pricing Teardowns — How Indie SaaS Actually Price Their Products",
  description:
    "Pattern-level teardowns of indie SaaS pricing models. Tier structure, anchor mechanics, upgrade triggers, and Brunson Stack lens. Built for post-launch pre-revenue founders building their own pricing page.",
  alternates: markdownAlternate("/pricing-teardown", "/pricing-teardown.md"),
  robots: { index: true, follow: true },
  openGraph: {
    title: "Pricing Teardowns",
    description:
      "Pattern-level teardowns of indie SaaS pricing models. Tier structure, anchor mechanics, upgrade triggers, and Brunson Stack lens.",
    type: "website",
    url: "/pricing-teardown",
    siteName: "Unlock SaaS",
    images: DEFAULT_OG_IMAGES,
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing Teardowns",
    description:
      "Pattern-level teardowns of indie SaaS pricing models.",
  },
};

// ----- JSON-LD (module-hoisted) ----------------------------------------------

const BREADCRUMB_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: `${BASE}/`,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Pricing teardowns",
      item: `${BASE}/pricing-teardown`,
    },
  ],
});

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Pricing teardowns — Unlock SaaS",
  url: `${BASE}/pricing-teardown`,
  inLanguage: "en-US",
  description:
    "Pattern-level teardowns of indie SaaS pricing models through the Brunson Stack and Value Ladder lens. Built for post-launch pre-revenue founders building their own pricing page.",
  isPartOf: {
    "@type": "WebSite",
    name: "Unlock SaaS",
    url: BASE,
  },
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: PRICING_TEARDOWNS.length,
    itemListElement: PRICING_TEARDOWNS.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${t.displayName} pricing teardown`,
      url: `${BASE}/pricing-teardown/${t.slug}`,
    })),
  },
});

export default function PricingTeardownHub() {
  const groups = groupPricingTeardownsByCategory();

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: BREADCRUMB_JSON }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: COLLECTION_JSON }}
      />
      {/* AIO uplift: Dataset schema. See funnel-teardown hub for rationale. */}
      <HubDatasetJsonLd
        name="Indie SaaS Pricing Teardowns"
        description="Pattern-level pricing-page teardowns of indie SaaS through the Brunson Stack lens: tier structure, anchor mechanics, upgrade triggers, payment mechanics. Approximate prices with dated lastVerified."
        hubPath="/pricing-teardown"
        mdPath="/pricing-teardown.md"
        lastVerified={PRICING_LATEST_VERIFIED}
        entries={PRICING_TEARDOWNS.map((t) => ({
          slug: t.slug,
          displayName: t.displayName,
        }))}
      />

      {/* Breadcrumb */}
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
            Pricing teardowns
          </li>
        </ol>
      </nav>

      {/* Hero */}
      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Pricing teardowns
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          How indie SaaS pricing actually works
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Tier structure, anchor mechanics, upgrade triggers, and payment
          model — read through the Brunson Stack and Value Ladder lens. The
          same four levers the Playbook applies when critiquing your own
          pricing page, applied to the indie SaaS pages founders are already
          studying.
        </p>
      </header>

      <Separator className="my-2" />

      <HubTldr
        headingLabel="Pricing teardown hub TL;DR"
        cluster="Pricing teardowns"
        count={`${PRICING_TEARDOWNS.length} indie SaaS pricing teardowns`}
        intent="Indie SaaS pricing models broken down by tier structure, anchor mechanics, upgrade triggers, and payment mechanics – the same four levers the Playbook applies to your own pricing page."
        schema="CollectionPage + ItemList; per-detail Article + FAQPage + BreadcrumbList"
      />

      {/* How to read */}
      <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="lens">
        <h2 id="lens" className="text-xl font-bold mb-4 leading-tight">
          How to read a pricing teardown
        </h2>
        <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
          <li>
            <span className="text-foreground font-semibold">Structure</span> is
            the tier ladder — what each rung includes and what it costs.
          </li>
          <li>
            <span className="text-foreground font-semibold">Anchor</span> is
            the tier doing psychological work — usually the highest tier
            making the middle tier look reasonable.
          </li>
          <li>
            <span className="text-foreground font-semibold">Upgrade trigger</span>{" "}
            is the specific behavior or scale event that converts a free or
            lower-tier user to the next rung.
          </li>
          <li>
            <span className="text-foreground font-semibold">Brunson lens</span>{" "}
            maps the page to Stack, Value Ladder, decoy or anchor psychology,
            and payment mechanics.
          </li>
        </ul>
      </section>

      <Separator className="my-2" />

      {/* Grouped list */}
      <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="list">
        <h2 id="list" className="sr-only">
          All pricing teardowns
        </h2>
        <div className="space-y-10">
          {groups.map((group) => (
            <div key={group.category}>
              <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-4 font-semibold">
                {group.category}
              </h3>
              <div className="space-y-3">
                {group.teardowns.map((t) => (
                  <Card
                    key={t.slug}
                    className="hover:border-primary/30 transition"
                  >
                    <CardContent className="pt-6">
                      <h4 className="text-lg font-semibold leading-tight mb-2">
                        <Link
                          href={`/pricing-teardown/${t.slug}`}
                          className="hover:text-primary transition"
                        >
                          {t.displayName} pricing teardown
                        </Link>
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                        {t.oneLine}
                      </p>
                      <div className="flex items-center justify-between gap-4">
                        <Link
                          href={`/pricing-teardown/${t.slug}`}
                          className="text-sm font-semibold text-primary hover:underline"
                        >
                          Read the teardown →
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          Verified {t.lastVerified}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-12" aria-labelledby="cta">
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              Run the same teardown on your own pricing page
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The diagnostic labels what is broken on your offer: Wrong
              Person, Weak Offer, or Weak Belief. Pricing-page dysfunction
              usually shows up as Weak Offer — and the Playbook names the
              specific fix.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/starter">Start with $1</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Cross-links to other pSEO surfaces */}
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
              href="/funnel-teardown"
              className="text-primary hover:underline font-semibold"
            >
              Funnel teardowns →
            </Link>{" "}
            Hook / Story / Offer breakdowns of indie SaaS marketing surfaces.
            Several companies have both a pricing and a funnel teardown.
          </p>
          <p>
            <Link
              href="/vs"
              className="text-primary hover:underline font-semibold"
            >
              Head-to-head comparisons →
            </Link>{" "}
            Symmetric dimension-by-dimension breakdowns of the tools you are
            mid-evaluation on.
          </p>
          <p>
            <Link
              href="/alternatives-to"
              className="text-primary hover:underline font-semibold"
            >
              Honest alternatives →
            </Link>{" "}
            Side-by-side comparisons against the tools indie SaaS founders
            actually evaluate before buying.
          </p>
        </div>
      </section>

      {/* Honesty footer */}
      <footer className="max-w-3xl mx-auto px-6 py-8 text-xs text-muted-foreground leading-relaxed border-t border-border/40">
        <p>
          Prices in these teardowns are approximate, with lastVerified ISO
          dates on each entry. Pricing pages shift; we re-verify periodically.
          If anything is wrong, unfair, or out of date, email{" "}
          <a
            href="mailto:maryan@unlocksaas.com"
            className="underline hover:text-foreground"
          >
            maryan@unlocksaas.com
          </a>{" "}
          and we will fix it.
        </p>
      </footer>
    </main>
  );
}
