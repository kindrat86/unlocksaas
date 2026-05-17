import type { Metadata } from "next";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { AbExposureBeacon } from "@/components/ab-exposure-beacon";
import {
  BreadcrumbListJsonLd,
  FaqPageJsonLd,
} from "@/components/seo/json-ld";
import { FAQ_ENTRIES } from "@/lib/faq-data";
import { pageAlternates } from "@/lib/seo/markdown-alternates";

/**
 * Standalone FAQ surface — Answer Engine Optimization (AEO) anchor page.
 *
 * Why this exists as a dedicated URL (and not just the homepage accordion):
 *   1. **Indexable canonical answer URL.** Google's FAQ Rich Result + LLM
 *      paraphrase pipelines both prefer a single high-density Q&A page over
 *      Q&A scattered across sales pages. The same Q&A also renders inside
 *      `<FaqAccordion />` on `/` and `/playbook-sales` — schema and visible
 *      text stay byte-identical because both sites import FAQ_ENTRIES from
 *      `src/lib/faq-data.ts`. Drift would break Rich Result eligibility.
 *
 *   2. **Always-visible answers.** The accordion form (hidden until clicked)
 *      is good for sales-page scannability but bad for crawlers and LLMs that
 *      do not execute JS. This page renders every answer in the initial HTML
 *      response — the same DOM a Perplexity / Claude / ChatGPT crawler sees
 *      is the same DOM a JS-disabled visitor sees.
 *
 *   3. **Question-as-heading shape.** Each `<h2>` is the literal user query.
 *      Featured-snippet capture rate climbs sharply when an H2 IS the query
 *      a searcher just typed. Sales-page accordions cannot do this — the
 *      headings there have to read as section labels, not standalone
 *      questions.
 *
 * Brunson Hard-Rule reconciliation: every answer is verbatim from
 * `strategy/dollar-objections.md`, which is itself sourced from real public
 * Indie Hackers / Hacker News threads. No fabricated objections, no
 * fabricated dollar amounts, no marketing-flavored rewrites. The Daniil
 * Khanin "9,047 signups, 90 paid, nine years" line in the Signal answer is
 * a public Indie Hackers post we mirror as-is.
 *
 * Source: strategy/google-strategy.md §B.2 (Surface B / AEO+GEO).
 */

const PAGE_URL = "https://unlocksaas.com/faq";

export const metadata: Metadata = {
  title: "FAQ — Every objection answered in the founder's exact words",
  description:
    "The eight objections post-launch pre-revenue founders actually raise about Unlock SaaS — price, time, identity, DIY, signal — answered in the same language they were asked in. Sourced from real Indie Hackers and Hacker News threads.",
  alternates: pageAlternates("/faq"),
  openGraph: {
    type: "article",
    title: "Unlock SaaS — FAQ",
    description:
      "Eight founder objections, eight honest answers. No marketing rewrites.",
    url: PAGE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Unlock SaaS — FAQ",
    description:
      "Eight founder objections, eight honest answers. No marketing rewrites.",
  },
};

// Static. The FAQ array is module-level and the page does no I/O — flag this
// to Next 14 so the route is built once and served from CDN. Matches the
// pattern on /stories, which is also reverse-squeeze static content.
export const dynamic = "force-static";

const BREADCRUMB_TRAIL = [
  { name: "Home", url: "https://unlocksaas.com/" },
  { name: "FAQ", url: PAGE_URL },
] as const;

export default function FaqPage() {
  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      {/* Surface B (AEO/GEO) — strategy/google-strategy.md §B.2.
          FaqPageJsonLd serializes from the same FAQ_ENTRIES array the page
          renders below, so schema and visible text never diverge.
          `speakableSelectors` is passed because every Q&A on this surface
          is always-visible (no accordion). The selectors point at the
          stable `.aeo-q` and `.aeo-a` classes added to each h2 and p
          below — voice assistants (Google Assistant, Siri retrieval) can
          read the canonical Q/A pair without speaking nav links or CTAs. */}
      <FaqPageJsonLd
        items={FAQ_ENTRIES}
        speakableSelectors={[".aeo-q", ".aeo-a"]}
      />
      <BreadcrumbListJsonLd trail={BREADCRUMB_TRAIL} />
      <AbExposureBeacon />

      <article className="max-w-2xl mx-auto">
        {/* PREFACE */}
        <header className="mb-12">
          <nav
            aria-label="Breadcrumb"
            className="text-xs uppercase tracking-widest text-muted-foreground mb-3"
          >
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span aria-hidden="true" className="mx-2">
              ›
            </span>
            <span>FAQ</span>
          </nav>
          <h1
            data-speakable="headline"
            className="text-3xl md:text-4xl font-bold leading-tight mb-4"
          >
            Every objection answered. Each one sourced from a real founder.
          </h1>
          <p
            data-speakable="lede"
            className="text-base text-muted-foreground leading-relaxed mb-4"
          >
            These are the eight questions post-launch pre-revenue founders
            actually raise — about price, time, identity, DIY temptation, and
            whether praise without payment means the market is dead. They are
            not the questions a marketer would write. They are the ones I
            have read, in those words, in public Indie Hackers and Hacker
            News threads.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed italic">
            Every answer is the same answer I would give in a DM. Nothing
            here is rewritten to sell harder.
          </p>
        </header>

        <Separator className="my-10" />

        {/* Q&A list — semantic structure for AEO.
            Each Q is an <h2> phrased as the literal user query, each A is a
            <p> rendered server-side. No JS required to see the answer. */}
        <div className="space-y-12">
          {FAQ_ENTRIES.map((entry) => (
            <section
              key={entry.q}
              // Slug not URL-stable enough to anchor against, but a per-section
              // wrapper makes it easy to add scroll-to anchors later if PAA
              // jump-links justify it.
              aria-labelledby={slugify(entry.q)}
            >
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                {entry.category}
              </p>
              <h2
                id={slugify(entry.q)}
                // `aeo-q` is the stable cssSelector hook for the FAQPage
                // Speakable spec rendered above. Keep this class on every
                // FAQ question heading — removing it breaks the schema↔DOM
                // contract and the page loses voice-answer eligibility.
                className="aeo-q text-xl md:text-2xl font-bold leading-snug mb-4"
              >
                {entry.q}
              </h2>
              <p className="aeo-a text-base text-muted-foreground leading-relaxed">
                {entry.a}
              </p>
            </section>
          ))}
        </div>

        <Separator className="my-12" />

        {/* Bridges — internal links the rest of the funnel relies on. Sales
            pages already link to /faq via the accordion; this is the reverse
            direction so a reader who landed here from Google goes to the
            next correct surface. */}
        <section className="text-center">
          <h2 className="text-lg font-bold mb-3">
            Still have a question that is not here?
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-md mx-auto">
            The fastest way to get a specific answer about your own page is
            to run the free 90-second diagnostic. If you would rather just
            see the product, the $1 Starter is the same destination — just
            compressed.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/diagnostic"
              className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-6 py-3 text-base font-medium"
            >
              Run the free diagnostic
            </Link>
            <Link
              href="/starter"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors px-6 py-3 text-base font-medium"
            >
              Start the Playbook for $1
            </Link>
          </div>
        </section>

        <footer className="mt-16 text-center">
          <p className="text-xs text-muted-foreground italic leading-relaxed">
            All quotes attributed to public Indie Hackers / Hacker News
            threads sourced in strategy/dollar-objections.md.
          </p>
        </footer>
      </article>
    </div>
  );
}

/**
 * Cheap stable slug for the per-question `id` attributes. Not used as the
 * page URL (the page is /faq, not /faq#question) so we accept ASCII-only
 * collapse — questions never collide on the eight-entry mine.
 */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}
