import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  TEARDOWNS,
  groupTeardownsByCategory,
} from "@/lib/funnel-teardowns";

/**
 * Funnel teardowns hub — pSEO surface index.
 *
 * Same shape as /alternatives-to: a CollectionPage that:
 *   1. Is itself indexable for the broader query class ("indie saas
 *      funnel teardowns", "saas marketing strategy breakdowns").
 *   2. Recycles internal PageRank across the programmatic block — every
 *      detail page links back here in its breadcrumb; the hub links out
 *      to every detail; the related-teardowns block on each detail page
 *      cross-links to siblings.
 *
 * Statically rendered. All data is module-level constants.
 */

const BASE = "https://unlocksaas.com";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title:
    "Funnel Teardowns — What Indie SaaS Founders Can Learn From the Best Marketing Pages",
  description:
    "Honest pattern-level teardowns of the funnels indie SaaS founders are already funnel-hacking. Hook, Story, Offer breakdowns through the Brunson lens, with what to adapt and what to skip.",
  alternates: { canonical: "/funnel-teardown" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Funnel Teardowns — Unlock SaaS",
    description:
      "Honest pattern-level teardowns of the funnels indie SaaS founders are already funnel-hacking.",
    type: "website",
    url: "/funnel-teardown",
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Funnel Teardowns — Unlock SaaS",
    description:
      "Honest pattern-level teardowns of the funnels indie SaaS founders are already funnel-hacking.",
  },
};

// ----- JSON-LD (module-hoisted, serialized once at import) -------------------

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
      name: "Funnel teardowns",
      item: `${BASE}/funnel-teardown`,
    },
  ],
});

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Funnel teardowns — Unlock SaaS",
  url: `${BASE}/funnel-teardown`,
  inLanguage: "en-US",
  description:
    "Pattern-level teardowns of indie SaaS funnels through the Brunson Hook / Story / Offer lens. Built for post-launch pre-revenue SaaS founders who are funnel-hacking the products they admire.",
  isPartOf: {
    "@type": "WebSite",
    name: "Unlock SaaS",
    url: BASE,
  },
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: TEARDOWNS.length,
    itemListElement: TEARDOWNS.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${t.displayName} funnel teardown`,
      url: `${BASE}/funnel-teardown/${t.slug}`,
    })),
  },
});

export default function FunnelTeardownHub() {
  const groups = groupTeardownsByCategory();

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
            Funnel teardowns
          </li>
        </ol>
      </nav>

      {/* Hero */}
      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Funnel teardowns
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          What indie SaaS funnels actually do
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Post-launch pre-revenue founders are already funnel-hacking the indie
          SaaS they admire. We do the work explicitly: pattern-level teardowns
          of the hook, story, and offer running on each surface, with what to
          adapt and what to skip for your own page. Same Brunson framework the
          Machine runs on your live product, applied to the products you study.
        </p>
      </header>

      <Separator className="my-2" />

      {/* How we read these */}
      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="lens"
      >
        <h2 id="lens" className="text-xl font-bold mb-4 leading-tight">
          How to read a teardown
        </h2>
        <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
          <li>
            <span className="text-foreground font-semibold">Hook</span> is how
            the page catches attention in the first three seconds.
          </li>
          <li>
            <span className="text-foreground font-semibold">Story</span> is how
            the page creates belief between the hook and the close.
          </li>
          <li>
            <span className="text-foreground font-semibold">Offer</span> is
            what the page asks for and what it gives in return.
          </li>
          <li>
            <span className="text-foreground font-semibold">Adapt vs avoid</span>{" "}
            names what to safely steal and what is specific to that company&apos;s
            scale or category.
          </li>
        </ul>
      </section>

      <Separator className="my-2" />

      {/* Grouped list by category */}
      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="list"
      >
        <h2 id="list" className="sr-only">
          All teardowns
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
                          href={`/funnel-teardown/${t.slug}`}
                          className="hover:text-primary transition"
                        >
                          {t.displayName} funnel teardown
                        </Link>
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                        {t.oneLine}
                      </p>
                      <div className="flex items-center justify-between gap-4">
                        <Link
                          href={`/funnel-teardown/${t.slug}`}
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
              Run the same teardown on your own page
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The 90-second diagnostic applies the Hook / Story / Offer
              framework to your live product page and labels what is broken:
              Wrong Person, Weak Offer, or Weak Belief.
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

      {/* Cross-link to alternatives surface */}
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
        <p className="text-sm leading-relaxed">
          <Link
            href="/alternatives-to"
            className="text-primary hover:underline font-semibold"
          >
            Honest alternatives comparisons →
          </Link>{" "}
          Side-by-side breakdowns against the tools indie SaaS founders
          actually evaluate before buying. Different framing than these
          teardowns — these analyze the funnel; alternatives compare the
          product job.
        </p>
      </section>

      {/* Honesty footer */}
      <footer className="max-w-3xl mx-auto px-6 py-8 text-xs text-muted-foreground leading-relaxed border-t border-border/40">
        <p>
          We do not slag the companies we tear down. We respect what each is
          doing well, name the pattern, and pull what is useful for an indie
          SaaS founder building their own page. If anything on a teardown is
          unfair, wrong, or out of date, email{" "}
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
