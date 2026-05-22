import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  POST_MORTEMS,
  groupPostMortemsByDiagnosis,
} from "@/lib/post-mortems";
import { markdownAlternate } from "@/lib/seo/markdown-alternates";
import { HubDatasetJsonLd } from "@/components/seo/json-ld";
import { HubTldr } from "@/components/seo/hub-tldr";

/**
 * Post-mortems hub – pSEO surface index.
 *
 * Same shape as /funnel-teardown: a CollectionPage that:
 *   1. Is itself indexable for the broader query class ("indie saas
 *      post-mortems", "why startups fail").
 *   2. Recycles internal PageRank across the programmatic block – every
 *      detail page links back here in its breadcrumb; the hub links out
 *      to every detail; the related-post-mortems block on each detail
 *      page cross-links to siblings sharing a tag.
 *
 * Hub grouping is by Brunson diagnosis (Wrong Person / Weak Offer /
 * Weak Belief) – which differs from /funnel-teardown's category
 * grouping and lets the reader browse "all Weak Offer failures" as a
 * teaching unit. This is the surface's pedagogical signature.
 *
 * Statically rendered. All data is module-level constants.
 */

const BASE = "https://unlocksaas.com";

export const metadata: Metadata = {
  title:
    "Post-Mortems – Why SaaS and Consumer-Tech Companies Failed, Through the Brunson Lens",
  description:
    "Honest structural post-mortems of well-known failed SaaS and consumer-tech bets, diagnosed through the same Brunson Hook / Story / Offer framework Unlock SaaS runs against your live page.",
  alternates: markdownAlternate("/post-mortem", "/post-mortem.md"),
  robots: { index: true, follow: true },
  openGraph: {
    title: "Post-Mortems – Unlock SaaS",
    description:
      "Honest structural post-mortems of failed SaaS and consumer-tech bets, diagnosed through the Brunson Hook / Story / Offer framework.",
    type: "website",
    url: "/post-mortem",
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Post-Mortems – Unlock SaaS",
    description:
      "Honest structural post-mortems of failed SaaS and consumer-tech bets, diagnosed through the Brunson Hook / Story / Offer framework.",
  },
};

// ----- JSON-LD --------------------------------------------------------------

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
      name: "Post-mortems",
      item: `${BASE}/post-mortem`,
    },
  ],
});

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Post-mortems – Unlock SaaS",
  url: `${BASE}/post-mortem`,
  inLanguage: "en-US",
  description:
    "Structural post-mortems of well-known failed SaaS and consumer-tech bets, diagnosed through Russell Brunson's Hook / Story / Offer framework. Built for post-launch pre-revenue indie SaaS founders who are studying failure modes to avoid them.",
  isPartOf: {
    "@type": "WebSite",
    name: "Unlock SaaS",
    url: BASE,
  },
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: POST_MORTEMS.length,
    itemListElement: POST_MORTEMS.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${p.displayName} post-mortem`,
      url: `${BASE}/post-mortem/${p.slug}`,
    })),
  },
});

// Latest lastVerified across the catalog – feeds Dataset.dateModified.
const LATEST_VERIFIED = POST_MORTEMS.reduce(
  (latest, p) => (p.lastVerified > latest ? p.lastVerified : latest),
  POST_MORTEMS[0]?.lastVerified ?? "2026-05-22",
);

export default function PostMortemHub() {
  const groups = groupPostMortemsByDiagnosis();

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
      <HubDatasetJsonLd
        name="Indie-Era SaaS Post-Mortems"
        description="Structural post-mortems of well-known failed SaaS and consumer-tech bets. Each entry includes timeline, root causes, Brunson diagnosis, transferable lessons, FAQ, and public sources."
        hubPath="/post-mortem"
        mdPath="/post-mortem.md"
        lastVerified={LATEST_VERIFIED}
        entries={POST_MORTEMS.map((p) => ({
          slug: p.slug,
          displayName: p.displayName,
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
            Post-mortems
          </li>
        </ol>
      </nav>

      {/* Hero */}
      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Post-mortems
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          Why famous SaaS and consumer-tech bets failed
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Structural post-mortems of well-known failed companies, diagnosed
          through the same Brunson Hook / Story / Offer framework the
          Unlock SaaS Playbook runs against your own live page. Every
          failure is mapped to one of three diagnoses the V2 audit
          assigns: Wrong Person, Weak Offer, or Weak Belief. The lessons
          are framework-level so they transfer cleanly to a pre-revenue
          indie SaaS, not just to a venture-scale flameout.
        </p>
      </header>

      <Separator className="my-2" />

      <HubTldr
        headingLabel="Post-mortem hub TL;DR"
        cluster="Post-mortems"
        count={`${POST_MORTEMS.length} structural post-mortems`}
        intent="Failed SaaS and consumer-tech bets, diagnosed through Russell Brunson's Hook / Story / Offer framework. Each entry maps the failure to one of three diagnosis categories Unlock SaaS uses on live founder pages."
        schema="CollectionPage + ItemList; per-detail Article + FAQPage + BreadcrumbList"
      />

      {/* How to read these */}
      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="lens"
      >
        <h2 id="lens" className="text-xl font-bold mb-4 leading-tight">
          How to read a post-mortem
        </h2>
        <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
          <li>
            <span className="text-foreground font-semibold">Timeline</span>{" "}
            walks the public events from founding to shutdown – facts only,
            no commentary.
          </li>
          <li>
            <span className="text-foreground font-semibold">
              Structural root causes
            </span>{" "}
            name the framework-agnostic reasons the company failed.
          </li>
          <li>
            <span className="text-foreground font-semibold">
              What Unlock SaaS would have caught
            </span>{" "}
            maps those root causes to the Brunson diagnosis the V2 audit
            would have assigned: Wrong Person, Weak Offer, or Weak
            Belief.
          </li>
          <li>
            <span className="text-foreground font-semibold">
              Transferable lessons
            </span>{" "}
            scale the lesson down to indie-SaaS size. Every failure mode
            is fractal – the same shape kills a $1M startup and a $1B
            one.
          </li>
        </ul>
      </section>

      <Separator className="my-2" />

      {/* Grouped list by Brunson diagnosis */}
      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="list"
      >
        <h2 id="list" className="sr-only">
          All post-mortems
        </h2>
        <div className="space-y-10">
          {groups.map((group) => (
            <div key={group.diagnosis}>
              <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-4 font-semibold">
                Diagnosis: {group.diagnosis}
              </h3>
              <div className="space-y-3">
                {group.postMortems.map((p) => (
                  <Card
                    key={p.slug}
                    className="hover:border-primary/30 transition"
                  >
                    <CardContent className="pt-6">
                      <h4 className="text-lg font-semibold leading-tight mb-2">
                        <Link
                          href={`/post-mortem/${p.slug}`}
                          className="hover:text-primary transition"
                        >
                          {p.displayName} post-mortem
                        </Link>
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                        {p.oneLine}
                      </p>
                      <div className="flex items-center justify-between gap-4">
                        <Link
                          href={`/post-mortem/${p.slug}`}
                          className="text-sm font-semibold text-primary hover:underline"
                        >
                          Read the post-mortem →
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          {p.category} · shutdown {p.shutdownYear}
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
              Get the same audit before you become a post-mortem
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The 90-second diagnostic runs the same Hook / Story / Offer
              framework against your live product page and labels what is
              broken in the same three categories you see grouped on this
              hub: Wrong Person, Weak Offer, or Weak Belief.
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
            Pattern-level Hook / Story / Offer breakdowns of indie SaaS
            funnels that are working. The companion surface to this one –
            study what works alongside what failed.
          </p>
          <p>
            <Link
              href="/pricing-teardown"
              className="text-primary hover:underline font-semibold"
            >
              Pricing teardowns →
            </Link>{" "}
            Tier structure, anchor mechanics, and upgrade triggers through
            the Brunson Stack lens. Useful when the failure mode is
            offer-side.
          </p>
          <p>
            <Link
              href="/why-isnt-my"
              className="text-primary hover:underline font-semibold"
            >
              Why isn&apos;t my product converting →
            </Link>{" "}
            Pain-shaped diagnostic landings for the founder who already
            suspects which of the three categories they are in.
          </p>
        </div>
      </section>

      {/* Honesty footer */}
      <footer className="max-w-3xl mx-auto px-6 py-8 text-xs text-muted-foreground leading-relaxed border-t border-border/40">
        <p>
          Every post-mortem cites public sources – usually Wikipedia plus
          major outlet reporting. No fabricated metrics, no invented
          quotes, no slag for slag&apos;s sake. The companies described
          here employed thoughtful people who shipped real products; the
          failure modes are structural, not personal. If anything on a
          post-mortem is wrong, unfair, or out of date, email{" "}
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
