/**
 * Don't Buy Unlock SaaS If… — polarity-marketing disqualifier surface.
 *
 * Brunson positioning rule (DotCom Secrets Secret 5 + Expert Secrets §6
 * Polarity): the most-shared offer pages are the ones that surprise the
 * scroller. The standard play is "here's who this is for"; the polarity
 * play is "here's who this is NOT for, in plain English, before you waste
 * any money." Brunson's claim: an honest disqualifier raises perceived
 * selectivity, which raises conversion among the right-fit reader AND
 * raises share rate among the wrong-fit reader (who tweets "look at this
 * brutally honest page" without ever buying).
 *
 * Why a dedicated page (not just the inline block on /diagnostic)
 * --------------------------------------------------------------
 *   - The /diagnostic page's "This is NOT for you if" block is short by
 *     design — that page is a conversion squeeze, not an essay. The
 *     standalone page can go six disqualifiers deep, each with its own
 *     honest paragraph and a counter-CTA pointing at a better fit
 *     (free stories, build with Lovable first, look at competitors).
 *   - A standalone URL is shareable. The squeeze block is not.
 *   - Article JSON-LD on the standalone page declares editorial intent
 *     and feeds AI-Overview citation pipelines the canonical "who
 *     should NOT buy" answer.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - No fabricated competitor disses. Counter-CTAs that point to
 *     Lovable / Cursor / one-funnel-away-challenge are honest
 *     redirects, not "Lovable is bad" claims. The alternatives surface
 *     already analyses each one symmetrically.
 *   - Every disqualifier names a SPECIFIC behavior the prospect can
 *     self-check, not a vague vibe.
 *   - The final CTA at the bottom is the same Brunson "for the right
 *     fit, the door is here" – not a downsell, not a discount, not a
 *     pressure close.
 */

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArticleJsonLd,
  BreadcrumbListJsonLd,
} from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { pageAlternates } from "@/lib/seo/markdown-alternates";

const BASE = "https://unlocksaas.com";
const URL = `${BASE}/dont-buy`;
const PUBLISHED = "2026-05-18";

export const metadata: Metadata = {
  title: "Don't Buy Unlock SaaS If… — Honest Disqualifiers",
  description:
    "Six honest disqualifiers from the founder. If any of these describe you, do not buy Unlock SaaS. Lovable, Cursor, the One Funnel Away Challenge, and the free stories are better fits in specific cases.",
  alternates: pageAlternates("/dont-buy"),
  // Indexable. Brunson polarity rule: the disqualifier IS the marketing
  // surface, not a SEO afterthought. We want this to rank for "is unlock
  // saas a scam" and "unlock saas honest review" long-tail queries
  // because the page literally answers them.
  robots: { index: true, follow: true },
  openGraph: {
    type: "article",
    title: "Don't Buy Unlock SaaS If…",
    description:
      "Six honest disqualifiers from the founder, before you spend a dollar.",
    url: URL,
    siteName: "Unlock SaaS",
    publishedTime: PUBLISHED,
  },
  twitter: {
    card: "summary_large_image",
    title: "Don't Buy Unlock SaaS If…",
    description:
      "Six honest disqualifiers from the founder, before you spend a dollar.",
  },
};

// Pure editorial. No per-request data, no search params, no Supabase.
// Static at build time, edge-cached forever.
export const dynamic = "force-static";

interface Disqualifier {
  /** Headline that completes "Don't buy if…" */
  headline: string;
  /**
   * One-to-three sentence honest paragraph. Reluctant Hero voice — the
   * founder explaining, not selling against the buyer.
   */
  body: string;
  /** Where this prospect should go instead. */
  redirect: {
    label: string;
    href: string;
    /** External vs internal — drives target/rel attributes. */
    external?: boolean;
  };
}

const DISQUALIFIERS: ReadonlyArray<Disqualifier> = [
  {
    headline: "You have not shipped a live product yet.",
    body: "The Playbook assumes the product is live and the problem is upstream — wrong person, wrong promise, or unbuilt belief. If your idea is still a Notion doc, a Figma file, or a half-finished repo, paying $1 to be told to talk to customers is the wrong shape of help. Build the thing first. Then come back and the diagnostic is still free.",
    redirect: {
      label: "Use Lovable to ship the product first",
      href: "https://lovable.dev/",
      external: true,
    },
  },
  {
    headline: "You hate writing.",
    body: "Every Playbook step ends with you writing something a real person will read — an offer paragraph, one outreach message, one belief statement, one Stripe-receipt thank-you. There is no AI button that replaces that. If the idea of writing eight short paragraphs over sixty days makes you want to refund the dollar before you finish reading this sentence, this is not the product for you.",
    redirect: {
      label: "Read the five free stories and see if the voice is bearable",
      href: "/stories",
    },
  },
  {
    headline: "You want a magic AI button that finds customers.",
    body: "The Playbook uses AI inside the engine to push back when your answers are vague, to rewrite a hedged offer paragraph until it names a result, and to draft outreach messages you then edit. It does not auto-prospect. It does not send messages from your inbox. It does not generate customers while you sleep. The work that finds the first paying customer is work YOU do; the engine just refuses to let you skip it.",
    redirect: {
      label: "Compare honest alternatives if you want an automated tool",
      href: "/alternatives-to",
    },
  },
  {
    headline: "You think Stripe verification is a gimmick.",
    body: "Every milestone, badge, and guarantee in the Playbook ties back to one signal: a real customer paid you, and Stripe says so. If the idea of \"the product only counts you as successful when a Stripe charge clears\" reads as inconvenient to you, the Playbook will read as inconvenient too. That is the central mechanism, not a marketing flourish — it is why the refund clock is honest and why the Verified Builder badge has weight.",
    redirect: {
      label: "Read the editorial policy if you want to know exactly what we measure",
      href: "/editorial-policy",
    },
  },
  {
    headline: "You are shopping for a refund-arbitrage opportunity.",
    body: "Yes, the Playbook is refundable for sixty days if you do not get a verified paying customer. No, that is not a free product to be gamed. The refund clock starts when you do the work, the engine logs every step, and the founder reads every refund request personally. The refund is here so a founder who tried in good faith does not pay; it is not here so a founder who never opened the dashboard can extract forty-nine dollars in eight weeks.",
    redirect: {
      label: "Read the guarantee in detail before you buy",
      href: "/playbook-sales",
    },
  },
  {
    headline: "You want hockey-stick growth by next week.",
    body: "The Playbook is a sixty-day system aimed at one verified Stripe charge. Not ten thousand users. Not a Product Hunt #1. Not a viral tweet. One real human paying you for one real promise. If that outcome feels too small, the audience this is for is not yours — go run an ads playbook, raise a seed round, or build a content engine. Those produce different shapes of result on different timelines, all of which can be honest.",
    redirect: {
      label: "Look at the One Funnel Away Challenge if you want a 30-day campaign-style sprint",
      href: "/alternatives-to/one-funnel-away-challenge",
    },
  },
];

export default function DontBuyPage() {
  // Article schema with the disqualifier list as the article body. Search
  // engines and AI retrievers anchor on the headline + datePublished +
  // author + URL bundle; the `about` array pins the topical entities so
  // a "is unlock saas right for me" query resolves to this page.
  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <ArticleJsonLd
        headline="Don't Buy Unlock SaaS If…"
        description="Six honest disqualifiers from the founder, before you spend a dollar."
        url={URL}
        datePublished={PUBLISHED}
        articleSection="Editorial"
        keywords={[
          "unlock saas review",
          "honest disqualifiers",
          "who should not buy",
          "polarity marketing",
        ]}
        about={[
          {
            name: "Unlock SaaS",
            sameAs: `${BASE}/#organization`,
          },
        ]}
      />
      <BreadcrumbListJsonLd
        trail={[
          { name: "Home", url: `${BASE}/` },
          { name: "Don't Buy", url: URL },
        ]}
      />

      <article className="max-w-2xl mx-auto">
        {/* ── Header ──────────────────────────────────────────────────── */}
        <header className="mb-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            From the founder · {formatPublishedDate(PUBLISHED)}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            Don&rsquo;t buy Unlock SaaS if…
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Six honest disqualifiers, before you spend a dollar. If any of
            these describe you, the Playbook is the wrong shape of help and
            I will lose you in week three. There are better fits — most
            of them named on this page, with a link.
          </p>
        </header>

        {/* ── Disqualifier list ──────────────────────────────────────── */}
        <div className="space-y-8 mb-12">
          {DISQUALIFIERS.map((d, idx) => (
            <section
              key={d.headline}
              aria-labelledby={`disq-${idx}`}
              className="border-l-2 pl-5 py-1"
            >
              <h2
                id={`disq-${idx}`}
                className="text-xl font-bold leading-snug mb-3"
              >
                {idx + 1}. {d.headline}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                {d.body}
              </p>
              {d.redirect.external ? (
                <a
                  href={d.redirect.href}
                  target="_blank"
                  rel="noopener nofollow external"
                  className="text-sm underline underline-offset-4 hover:text-foreground"
                >
                  {d.redirect.label} →
                </a>
              ) : (
                <Link
                  href={d.redirect.href}
                  className="text-sm underline underline-offset-4 hover:text-foreground"
                >
                  {d.redirect.label} →
                </Link>
              )}
            </section>
          ))}
        </div>

        <Separator className="my-10" />

        {/* ── Survivors' door (Brunson "right-fit close") ─────────────── */}
        <Card className="border-primary/30">
          <CardContent className="pt-6 space-y-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Survived the list?
            </p>
            <h2 className="text-2xl font-bold leading-tight">
              Then the Playbook is probably for you.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You shipped, you can write a paragraph, you accept that
              Stripe is the only proof, and a single paying customer in
              sixty days feels like a real outcome. That is the canonical
              audience. Start with the free diagnostic — paste your live
              URL, get the upstream label, and decide from there. No card,
              no charge, no obligation.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button asChild size="lg" className="flex-1">
                <Link href="/diagnostic">Run the free diagnostic →</Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="flex-1">
                <Link href="/starter">Skip to the $1 Starter</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Honest signature line ──────────────────────────────────── */}
        <p className="text-xs text-muted-foreground text-center mt-12 leading-relaxed">
          Written by{" "}
          <Link
            href="/about"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Maryan
          </Link>
          . Reluctant Hero. Non-engineer founder. Built the playbook he
          wishes someone had handed him — and ships the disqualifier list
          so the wrong-fit buyer never gets in the door.
        </p>
      </article>
    </div>
  );
}

/** Human-readable publish date matching the rest of the editorial surface. */
function formatPublishedDate(iso: string): string {
  // Athens display per the operator preference (operator-facing surfaces
  // use DD-MM-YYYY HH:MM:SS Europe/Athens), but THIS surface is reader-
  // facing English. en-US, long month, year — same convention as
  // /editorial-policy and /press.
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
