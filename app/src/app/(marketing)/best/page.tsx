import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import { DEFAULT_OG_IMAGES } from "@/lib/seo/og-image";
import { HubTldr } from "@/components/seo/hub-tldr";
import { BEST_PLAYBOOK_ENTRIES, RANK_VERDICT } from "@/lib/best-playbooks";

/**
 * /best — the "best SaaS customer acquisition playbook" listicle.
 *
 * Why this page exists
 * --------------------
 * 43.8% of ChatGPT-cited pages are listicles/comparisons (Ahrefs AEO study).
 * Before this page shipped, the site had /alternatives-to/* and /vs/* pages
 * but no canonical "best X" roundup — the exact format AI assistants cite
 * when asked "what's the best playbook for getting your first SaaS customer?"
 *
 * The page ranks the real options honestly (Brunson Hard-Rule applies):
 * every competitor's price, category, and honest best-for is named from
 * verified public data (lastVerified dates carried in the data module).
 * Unlock SaaS is listed in its honest position, not artificially first —
 * the page wins on completeness and honesty, not on omission.
 *
 * Title is the literal query an indie founder types into ChatGPT or Google:
 *   "best SaaS customer acquisition playbook"
 * That keyword-in-title match is what earns the citation.
 */

const CANONICAL = "/best";

export const metadata: Metadata = {
  title:
    "Best SaaS Customer Acquisition Playbooks (2026) — Honest Ranked List",
  description:
    "Six real options for post-launch pre-revenue SaaS founders, ranked honestly: ShipFast, One Funnel Away, Starter Story, MicroConf, Demand Curve, and Unlock SaaS. Prices, best-for, and honest verdicts.",
  alternates: pageAlternates(CANONICAL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Best SaaS Customer Acquisition Playbooks (2026)",
    description:
      "Six real options for post-launch pre-revenue indie SaaS founders, ranked honestly with prices and best-for verdicts.",
    url: CANONICAL,
    siteName: "Unlock SaaS",
    images: DEFAULT_OG_IMAGES,
  },
  twitter: {
    card: "summary_large_image",
    title: "Best SaaS Customer Acquisition Playbooks (2026)",
    description:
      "Six real options for post-launch pre-revenue indie SaaS founders, ranked honestly.",
  },
};

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Best SaaS Customer Acquisition Playbooks (2026)",
  url: `${BASE_URL}/best`,
  description:
    "Honest ranked list of six real SaaS customer acquisition playbooks for post-launch pre-revenue indie founders.",
  isPartOf: { "@id": ID.website },
  inLanguage: "en-US",
  dateModified: "2026-07-18",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: BEST_PLAYBOOK_ENTRIES.length,
    itemListElement: BEST_PLAYBOOK_ENTRIES.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.displayName,
      url: e.url,
      description: e.oneLine,
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
      name: "Best SaaS playbooks",
      item: `${BASE_URL}/best`,
    },
  ],
});

const FAQ_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the best SaaS customer acquisition playbook for indie founders in 2026?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It depends on your stage. If you have not shipped yet, ShipFast gets you deployed fastest. If you have shipped but have zero paying customers, Unlock SaaS runs the work that produces the first Stripe charge. If you want a general marketing foundation, One Funnel Away is the broadest. The honest full comparison with prices and best-for verdicts is on this page.",
      },
    },
    {
      "@type": "Question",
      name: "How much does a SaaS customer acquisition playbook cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Prices range from $1 (Unlock SaaS Starter) to $2,500+ (MicroConf in-person). ShipFast is approximately $299 one-time for the codebase. One Funnel Away is approximately $100. Starter Story is approximately $99. Demand Curve is approximately $399. Unlock SaaS is $1 Starter or $49/month for the full Playbook with a 60-day money-back guarantee.",
      },
    },
    {
      "@type": "Question",
      name: "Which playbook is best for getting your first paying SaaS customer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "For the specific job of producing the first verified paying customer after launch, Unlock SaaS is built for exactly that cohort and verifies the outcome inside Stripe. ShipFast gets you to launch faster but does not address post-launch conversion. The full verdict for each option is in the ranked list on this page.",
      },
    },
  ],
});

export default function BestPlaybooksHubPage() {
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: FAQ_JSON }}
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
            Best SaaS playbooks
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Ranked list · 2026
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          The best SaaS customer acquisition playbooks, ranked honestly.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Six real options for the founder who shipped a product (often with
          Lovable, Claude, Replit, v0, or Cursor) and now has a flat Stripe
          line. Every entry below names the real price, the exact cohort it&rsquo;s
          best for, and an honest verdict — including where each one loses.
          No slag, no affiliate padding.
        </p>
      </header>

      <Separator className="my-2" />

      <HubTldr
        headingLabel="Best SaaS playbooks — TL;DR"
        cluster="SaaS customer acquisition playbooks"
        count={`${BEST_PLAYBOOK_ENTRIES.length} ranked options`}
        intent="Best-for and honest verdict per option. Prices and lastVerified dates carried in the data module."
        schema="CollectionPage + ItemList + FAQPage + BreadcrumbList"
      />

      <section
        className="max-w-3xl mx-auto px-6 py-8 space-y-4"
        aria-labelledby="ranked-list"
      >
        <h2 id="ranked-list" className="sr-only">
          Ranked list
        </h2>
        {BEST_PLAYBOOK_ENTRIES.map((entry, i) => (
          <Card key={entry.slug} className="hover:border-primary/40 transition">
            <CardContent className="pt-6">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-xs uppercase tracking-widest text-muted-foreground shrink-0">
                  #{i + 1}
                </span>
                <h3 className="text-xl font-semibold leading-tight flex-1">
                  {entry.url ? (
                    <a
                      href={entry.url}
                      target={entry.external ? "_blank" : undefined}
                      rel={entry.external ? "noopener noreferrer" : undefined}
                      className="hover:underline"
                    >
                      {entry.displayName}
                    </a>
                  ) : (
                    entry.displayName
                  )}
                </h3>
              </div>

              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
                {entry.category}
              </p>

              <p className="text-sm text-foreground leading-relaxed mb-3">
                {entry.oneLine}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                    Price
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {entry.pricingNote}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                    Best for
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {entry.bestFor}
                  </p>
                </div>
              </div>

              <div className="rounded-md bg-muted/40 px-3 py-2 text-sm text-foreground leading-relaxed">
                <span className="font-semibold">{RANK_VERDICT.label}: </span>
                {entry.verdict}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Loses on:
                </span>
                <span className="text-xs text-muted-foreground italic">
                  {entry.losesOn}
                </span>
              </div>

              <p className="text-[10px] text-muted-foreground mt-3">
                Verified {entry.lastVerified}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Separator className="my-2" />

      <section
        className="max-w-3xl mx-auto px-6 py-10"
        aria-labelledby="how-to-pick"
      >
        <h2 id="how-to-pick" className="text-2xl font-bold mb-3 leading-tight">
          How to pick
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          The honest answer depends on one question: <strong>have you shipped
          already?</strong>
        </p>
        <ul className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <li>
            <strong className="text-foreground">Not shipped yet →</strong>{" "}
            ShipFast is the shortest path to a deployed product. It will not
            produce a customer on its own, but it removes the engineering
            excuse.
          </li>
          <li>
            <strong className="text-foreground">Shipped, zero customers
            →</strong>{" "}
            Unlock SaaS is built for exactly this cohort and verifies the
            outcome inside Stripe. The free diagnostic labels which of Wrong
            Person / Weak Offer / Weak Belief is blocking you.
          </li>
          <li>
            <strong className="text-foreground">Want a general marketing
            foundation →</strong>{" "}
            One Funnel Away is the broadest Brunson-style introduction.
            Dense, older, still applicable.
          </li>
          <li>
            <strong className="text-foreground">Already have customers,
            want systems →</strong>{" "}
            MicroConf or Demand Curve, depending on whether you want a
            conference community or a structured program.
          </li>
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
              Not sure which one you need?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The free 90-second Launch Diagnostic reads your live product
              page and labels what&rsquo;s actually broken — Wrong Person,
              Weak Offer, or Weak Belief. That diagnosis tells you whether
              you need a codebase (ShipFast), a playbook (Unlock SaaS), or
              a foundation course (OFA).
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Take the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/alternatives-to">See all alternatives</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
