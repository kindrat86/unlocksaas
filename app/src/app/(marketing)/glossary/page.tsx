import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DEFINED_TERMS, BASE_URL, ID } from "@/lib/seo/entity";
import { glossaryTermSlug } from "@/lib/glossary";
import { markdownAlternate } from "@/lib/seo/markdown-alternates";
import { HubQuestions } from "@/components/seo/hub-questions";
import { HubTldr } from "@/components/seo/hub-tldr";

/**
 * /glossary – the indexable surface for the Brunson glossary the site
 * teaches. Topical-reservoir uplift (2026-05-19).
 *
 * Why this page exists
 * --------------------
 * Until this page shipped, the 16 Brunson terms the site teaches lived
 * only as `DefinedTermSet` JSON-LD on the funnel hub. A retrieval pipeline
 * that wanted a citable URL for "what is the value ladder" had to cite
 * `/#brunson-glossary` – a hash anchor on the homepage. That is a weak
 * citation target: AI Overviews / Perplexity / Bing Copilot resolve hash
 * anchors as the parent page, not a distinct entity.
 *
 * `/glossary` is the canonical entity for the set. Each term gets a stable
 * in-page anchor (`/glossary#hook`, `/glossary#value-ladder`, …) so
 * citation surfaces resolve to one URL per term. The page itself targets
 * the long-tail "what is X" / "X meaning" / "X definition" queries that
 * pSEO catalogs (alternatives, funnel teardowns, pricing teardowns,
 * comparisons, categories) do not cover.
 *
 * SEO posture
 * -----------
 *   - Indexable, force-static.
 *   - WebPage + DefinedTermSet + BreadcrumbList JSON-LD, all serialized
 *     once at module load (rules/server-hoist-static-io.md).
 *   - Markdown mirror at /glossary.md for AI crawlers.
 *   - Listed in the sitemap, llms.txt, and the MCP server tools
 *     (`list_glossary_terms`, `get_glossary_term`).
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - Every definition is the verbatim text from DEFINED_TERMS in
 *     entity.ts. No paraphrasing on this surface – drift between the
 *     glossary HTML and the homepage JSON-LD set is exactly the kind
 *     of fabrication penalty Google's structured-data audit flags.
 *   - The page does not over-claim authority. The hero copy says
 *     "the founder's working definitions" – not "the definitive guide."
 *   - No upsell in the body. This is a reference page, not a funnel
 *     surface. The same polarity-discipline /editorial-policy and
 *     /mcp follow.
 */


const CANONICAL = "/glossary";
const MD_PATH = "/glossary.md";

export const metadata: Metadata = {
  title:
    "Glossary – Hook, Story, Offer, Value Ladder, and 13 Other Brunson Terms",
  description:
    "Working definitions of the 16 sales-funnel concepts Unlock SaaS teaches, in the founder's own words. Hook. Story. Offer. Big Domino. Value Ladder. Stack Slide. Perfect Webinar. Dream 100. Wrong Person, Weak Offer, Weak Belief.",
  alternates: markdownAlternate(CANONICAL, MD_PATH),
  robots: { index: true, follow: true },
  openGraph: {
    type: "article",
    title: "Glossary",
    description:
      "Working definitions of the 16 Brunson sales-funnel terms Unlock SaaS teaches and applies to indie SaaS pages.",
    url: CANONICAL,
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary",
    title: "Glossary",
    description:
      "Working definitions of the 16 Brunson terms Unlock SaaS teaches.",
  },
};

// ----- BreadcrumbList JSON-LD ------------------------------------------------
// Hoisted to module scope, pre-serialized. Pattern from
// rules/server-hoist-static-io.md in the Vercel React Best Practices guide.
const BREADCRUMB_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: `${BASE_URL}/`,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Glossary",
      item: `${BASE_URL}/glossary`,
    },
  ],
});

// ----- DefinedTermSet JSON-LD ------------------------------------------------
// This page is the canonical declaration of the set. The @id matches the
// one rendered on the funnel hub (`DefinedTermSetJsonLd` in json-ld.tsx)
// so crawlers resolve both declarations as the same entity. Per-term
// `@id` is `${BASE}/glossary#<slug>`, the same anchor the HTML <section>
// renders – citation surfaces follow the fragment to the in-page heading.
const DEFINED_TERM_SET_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "DefinedTermSet",
  "@id": `${BASE_URL}/glossary#defined-term-set`,
  name: "Unlock SaaS Brunson Glossary",
  description:
    "Working definitions of the Russell Brunson sales-funnel concepts Unlock SaaS teaches and applies to indie SaaS pages.",
  inLanguage: "en-US",
  url: `${BASE_URL}/glossary`,
  publisher: { "@id": ID.organization },
  hasDefinedTerm: DEFINED_TERMS.map((t) => ({
    "@type": "DefinedTerm",
    "@id": `${BASE_URL}/glossary#${glossaryTermSlug(t.term)}`,
    name: t.term,
    termCode: glossaryTermSlug(t.term),
    description: t.definition,
    inDefinedTermSet: `${BASE_URL}/glossary#defined-term-set`,
    url: `${BASE_URL}/glossary#${glossaryTermSlug(t.term)}`,
  })),
});

// ----- CollectionPage JSON-LD ------------------------------------------------
// Tells crawlers this is a curated list of typed entities, not a long-form
// article. mainEntity points back into the DefinedTermSet @id so the graph
// resolves as one connected node.
const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Unlock SaaS Glossary",
  description:
    "Working definitions of the 16 Brunson sales-funnel terms Unlock SaaS teaches.",
  url: `${BASE_URL}/glossary`,
  inLanguage: "en-US",
  isPartOf: { "@id": ID.website },
  mainEntity: { "@id": `${BASE_URL}/glossary#defined-term-set` },
});

export default function GlossaryPage() {
  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: BREADCRUMB_JSON }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: DEFINED_TERM_SET_JSON }}
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
            Glossary
          </li>
        </ol>
      </nav>

      {/* Hero */}
      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Working definitions
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          The {DEFINED_TERMS.length} Brunson terms Unlock SaaS teaches, in the
          founder&rsquo;s own words.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          These are the concepts the seven-step Playbook applies to a flat
          Stripe line. Every definition below is the working version actually
          used inside the diagnostic, the funnel teardowns, and the email
          sequences. Not the textbook version. Not paraphrased. The version
          a non-engineer founder can act on the same afternoon.
        </p>
      </header>

      <Separator className="my-2" />

      <HubTldr
        headingLabel="Brunson glossary hub TL;DR"
        cluster="Brunson glossary"
        count={`${DEFINED_TERMS.length} Brunson sales-funnel terms`}
        intent="Working definitions of the Russell Brunson sales-funnel concepts Unlock SaaS teaches. Each term has a stable @id anchor plus a long-form per-term page with action bullets, worked example, common confusions, related terms, and FAQ."
        schema="DefinedTermSet + per-term DefinedTerm + Article + FAQPage + BreadcrumbList"
      />

      {/* Table of contents – every term as a same-page link. Pure HTML
          anchor list so it works without JavaScript and gives crawlers a
          clean internal-link graph from the hero into each section. */}
      <section
        className="max-w-3xl mx-auto px-6 py-6"
        aria-labelledby="toc-heading"
      >
        <h2
          id="toc-heading"
          className="text-xs uppercase tracking-widest text-muted-foreground mb-3"
        >
          Jump to term
        </h2>
        <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
          {DEFINED_TERMS.map((t) => (
            <li key={t.term}>
              <Link
                href={`#${glossaryTermSlug(t.term)}`}
                className="text-primary hover:underline"
              >
                {t.term}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <Separator className="my-2" />

      {/* The terms. Each <article> carries the stable id the JSON-LD
          DefinedTerm @id points at. Semantic <dl> would be slightly more
          correct schema, but <article> + h2 gives every term its own
          accessible landmark and lets us style cards consistently. */}
      <section
        className="max-w-3xl mx-auto px-6 py-8 space-y-4"
        aria-labelledby="terms-heading"
      >
        <h2 id="terms-heading" className="sr-only">
          Term definitions
        </h2>
        {DEFINED_TERMS.map((t) => {
          const slug = glossaryTermSlug(t.term);
          return (
            <Card key={slug} id={slug} className="scroll-mt-20">
              <CardContent className="pt-6">
                <article aria-labelledby={`term-${slug}`}>
                  <h3
                    id={`term-${slug}`}
                    className="text-xl font-semibold leading-tight mb-2"
                  >
                    <Link
                      href={`#${slug}`}
                      className="hover:underline"
                      aria-label={`Anchor link to ${t.term}`}
                    >
                      {t.term}
                    </Link>
                  </h3>
                  <p className="text-base text-foreground/90 leading-relaxed">
                    {t.definition}
                  </p>
                  {/*
                    Detail-page link – PR #33 layered onto PR #32. The hub
                    above stays as the canonical citation surface (one stable
                    in-page anchor per term, DefinedTermSet @id resolves
                    here); the detail page at /glossary/<slug> carries the
                    long definition, why-it-matters paragraph, how-to-apply
                    bullets, a worked example, common confusions, related
                    terms, the appears-in cross-links, and a FAQ block, each
                    with its own DefinedTerm + Article + FAQPage +
                    BreadcrumbList JSON-LD. Readers and retrievers that want
                    the full elaboration follow the link; readers that just
                    want the working definition stay on this page.
                  */}
                  <p className="mt-3">
                    <Link
                      href={`/glossary/${slug}`}
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      Read the full definition →
                    </Link>
                  </p>
                </article>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Separator className="my-2" />

      <HubQuestions
        questions={[
          {
            q: "What does this glossary cover?",
            a: (
              <>
                {DEFINED_TERMS.length} Russell Brunson sales-funnel terms — the
                working vocabulary of DotCom Secrets and Expert Secrets —
                defined the way the Unlock SaaS playbook actually applies them.
                Every term links to a long-form page with action bullets, a
                worked example, common confusions, and related terms, plus a
                stable anchor for citation.
              </>
            ),
          },
          {
            q: "Are these the official Brunson definitions?",
            a: "No — they are working definitions: how Unlock SaaS applies each concept to a shipped SaaS product that has zero paying customers. Where our usage narrows the original framework, the per-term page says so under common confusions. For the canonical treatment, read DotCom Secrets and Expert Secrets directly.",
          },
        ]}
      />

      {/* Where these terms live in the rest of the site. Pure internal-link
          equity moves: keep the reader in the topical cluster without an
          upsell. The /faq and /stories crosslinks are the next honest
          destinations for a reader who lands on the glossary cold. */}
      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="where-heading"
      >
        <h2 id="where-heading" className="text-xl font-semibold mb-3">
          Where these terms live on the rest of the site
        </h2>
        <ul className="list-disc pl-5 space-y-2 text-base text-foreground/90 leading-relaxed">
          <li>
            <Link href="/faq" className="text-primary hover:underline">
              FAQ
            </Link>{" "}
            – objections answered using the same vocabulary.
          </li>
          <li>
            <Link href="/stories" className="text-primary hover:underline">
              Five Stories for the Flat Stripe Line
            </Link>{" "}
            – the same concepts in long-form essays, no email required.
          </li>
          <li>
            <Link
              href="/funnel-teardown"
              className="text-primary hover:underline"
            >
              Funnel teardowns
            </Link>{" "}
            – every teardown applies the Hook / Story / Offer lens.
          </li>
          <li>
            <Link
              href="/pricing-teardown"
              className="text-primary hover:underline"
            >
              Pricing teardowns
            </Link>{" "}
            – every pricing analysis uses the Stack and Value Ladder lenses.
          </li>
          <li>
            <Link href="/diagnostic" className="text-primary hover:underline">
              Free Launch Diagnostic
            </Link>{" "}
            – labels your page Wrong Person, Weak Offer, or Weak Belief.
          </li>
          <li>
            <Link
              href="/funnel-playbook"
              className="text-primary hover:underline"
            >
              Funnel playbooks
            </Link>{" "}
            – step-by-step build guides for the eight Brunson funnel archetypes
            (tripwire, VSL, challenge, Perfect Webinar, Soap Opera, OTO,
            Seinfeld Email, Value Ladder).
          </li>
          <li>
            <Link
              href="/why-isnt-my"
              className="text-primary hover:underline"
            >
              &ldquo;Why isn&rsquo;t my X converting&rdquo; diagnostics
            </Link>{" "}
            – per-element triage for landing page, checkout, upsell, opt-in,
            VSL, tripwire, webinar registration, and email open rate.
          </li>
          <li>
            <Link href="/benchmarks" className="text-primary hover:underline">
              Funnel benchmarks
            </Link>{" "}
            – directional ranges for 20 indie SaaS metrics with band-by-band
            diagnosis and source attribution.
          </li>
          <li>
            <Link href="/for" className="text-primary hover:underline">
              Niche pages
            </Link>{" "}
            – the same triage tuned to course creators, agency owners, SaaS
            founders, coaches, and 8 other cohorts.
          </li>
          <li>
            <Link href="/answers" className="text-primary hover:underline">
              Founder answers
            </Link>{" "}
            – 30 direct AEO-formatted answers to the most-asked indie SaaS
            funnel questions.
          </li>
          <li>
            <Link href="/best" className="text-primary hover:underline">
              Best SaaS playbooks (2026)
            </Link>{" "}
            – six honest-ranked options for getting your first paying
            customer. Prices, best-for verdicts, and named limitations.
          </li>
        </ul>
      </section>
    </main>
  );
}
