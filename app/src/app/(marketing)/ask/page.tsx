/**
 * /ask — NLWeb-compliant conversational search over the Unlock SaaS corpus.
 *
 * Why this page exists
 * --------------------
 * Unlock SaaS already exposes /api/nlweb/ask: the Microsoft NLWeb
 * protocol endpoint that returns a schema.org ItemList for any natural-
 * language query, BM25-ranked over the static corpus (~700 items across
 * funnel teardowns, pricing teardowns, alternatives, comparisons,
 * glossary, FAQ, answers, benchmarks, Playbook steps).
 *
 * This page is the human-facing companion. Two roles:
 *
 *   1. Inside-the-product surface: a logged-out founder lands here and
 *      asks "wrong person vs weak offer", "how do I pin a dream
 *      customer", "what is hook story offer". The page returns a
 *      grounded answer with citations linking back to the canonical
 *      pSEO pages. Lower-friction entry than scrolling 15 hubs.
 *
 *   2. GEO/AEO surface: every showcase query is a crawlable Q&A page
 *      (sitemap-listed, QAPage JSON-LD, markdown-mirrored at /ask.md).
 *      The Unlock SaaS AI engine indexes its own corpus and renders
 *      pre-answered URLs that AI Overviews, Perplexity, Claude can
 *      cite directly. Same content franchise as the static pSEO hubs,
 *      different surface shape.
 *
 * Two-layer answer architecture
 * -----------------------------
 *   Layer 1 (server-rendered, always works, no JS):
 *     - BM25 retrieval against the static corpus.
 *     - Deterministic-template summary (lib/nlweb/summary.ts).
 *     - Numbered citation cards linking to the canonical surfaces.
 *     - QAPage + ItemList JSON-LD when a query is set.
 *
 *   Layer 2 (client island, progressive enhancement):
 *     - Streaming LLM gloss grounded in the layer-1 citations.
 *     - Renders inline citation markers [1], [2], ... mapping 1:1 to
 *       the cards above.
 *     - Falls back silently if the gateway is unreachable.
 *
 * The contract: a JavaScript-disabled visitor or AI crawler sees
 * layer 1 as a complete page. Layer 2 is optional polish for the
 * human visitor in a modern browser.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - Every citation card links to a real, shipped canonical URL.
 *     The corpus aggregator (lib/nlweb/corpus.ts) is built from the
 *     same .ts catalogs that render the public HTML, so the cards
 *     can never drift from the live pages.
 *   - The deterministic summary quotes citation descriptions verbatim
 *     – no invented synonyms, no "you might also like" fluff.
 *   - The streaming LLM layer is constrained by a system prompt
 *     (lib/nlweb/answer-prompt.ts) that forbids invented citations
 *     and forces honest-refusal when the corpus does not cover the
 *     query.
 *
 * Next 16 cache-components conformance
 * ------------------------------------
 * `searchParams` is a Promise per the App Router contract. The outer
 * default export is a synchronous Suspense wrapper; the original
 * async body reads `searchParams` inside the boundary. `connection()`
 * marks the boundary dynamic so the prerender shell can build while
 * the BM25 result column streams in. Same pattern /search uses.
 */

import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import {
  BreadcrumbListJsonLd,
  OrganizationJsonLd,
} from "@/components/seo/json-ld";
import { markdownAlternate } from "@/lib/seo/markdown-alternates";
import {
  NLWEB_CORPUS,
  NLWEB_CORPUS_SIZE,
  type NlWebItem,
} from "@/lib/nlweb/corpus";
import { buildIndex, rank } from "@/lib/nlweb/bm25";
import { summarise } from "@/lib/nlweb/summary";
import {
  SHOWCASE_QUERIES,
  findShowcaseByQuery,
} from "@/lib/nlweb/showcase-queries";
import { BASE_URL } from "@/lib/seo/entity";
import { AskAnswerStream } from "./AskAnswerStream";

export const metadata: Metadata = {
  title: "Ask Unlock SaaS",
  description: `Ask the Unlock SaaS corpus (${NLWEB_CORPUS_SIZE} indexed items across funnel teardowns, pricing teardowns, alternatives, glossary, FAQ, direct answers, benchmarks, and Playbook steps). Returns a grounded answer with citations linking to the canonical pages. NLWeb-compatible: AI agents can call /api/nlweb/ask directly.`,
  alternates: markdownAlternate("/ask", "/ask.md"),
  robots: { index: true, follow: true },
  openGraph: {
    title: "Ask Unlock SaaS",
    description: `Ask the Unlock SaaS corpus (${NLWEB_CORPUS_SIZE} indexed items). Grounded answer + citations.`,
    url: "/ask",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ask Unlock SaaS",
    description: `Ask the Unlock SaaS corpus (${NLWEB_CORPUS_SIZE} indexed items). Grounded answer + citations.`,
  },
};

// Module-scope BM25 index. Built once per function instance, reused
// across every request — same pattern as /api/nlweb/ask. The cost is
// paid on cold start; warm requests skip indexing entirely.
const INDEX = buildIndex(NLWEB_CORPUS);

const TOP_K = 6;

interface AskPageProps {
  searchParams?: Promise<{ q?: string | string[] }>;
}

function readQuery(sp: Awaited<AskPageProps["searchParams"]>): string {
  if (!sp) return "";
  const raw = sp.q;
  if (Array.isArray(raw)) return raw[0]?.trim() ?? "";
  return (raw ?? "").trim();
}

export default function AskPage(props: AskPageProps) {
  return (
    <Suspense fallback={null}>
      <AskPageBody searchParams={props.searchParams} />
    </Suspense>
  );
}

async function AskPageBody(props: AskPageProps) {
  await connection();
  const searchParams = await props.searchParams;
  const query = readQuery(searchParams);
  const showcase = query ? findShowcaseByQuery(query) : undefined;

  // Retrieve BM25 results when a query is set. Empty query renders the
  // landing state (showcase queries only — no retrieval).
  const ranked = query
    ? rank(INDEX, NLWEB_CORPUS, query, TOP_K).map((r) => r.item)
    : [];
  const summary = query ? summarise(query, ranked) : "";

  const breadcrumbTrail = query
    ? [
        { name: "Unlock SaaS", url: `${BASE_URL}/` },
        { name: "Ask", url: `${BASE_URL}/ask` },
        {
          name: showcase?.framing ?? query,
          url: `${BASE_URL}/ask?q=${encodeURIComponent(query)}`,
        },
      ]
    : [
        { name: "Unlock SaaS", url: `${BASE_URL}/` },
        { name: "Ask", url: `${BASE_URL}/ask` },
      ];

  return (
    <main
      className="min-h-screen max-w-3xl mx-auto px-4 sm:px-6 py-12"
      // VEO selector: the answer block is the prose voice assistants
      // should read aloud when this page is the target of an AskAction.
      data-speakable="ask-answer"
    >
      <OrganizationJsonLd />
      <BreadcrumbListJsonLd trail={breadcrumbTrail} />
      {query && ranked.length > 0 ? (
        <AskJsonLd query={query} summary={summary} items={ranked} />
      ) : null}

      <header className="mb-8">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Ask Unlock SaaS
        </p>
        <h1
          className="text-3xl sm:text-4xl font-bold leading-tight mb-3"
          id="tldr"
        >
          {query
            ? showcase?.framing
              ? `${showcase.framing}`
              : `Answer for: ${query}`
            : `Ask the Unlock SaaS corpus`}
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          {query
            ? `One short grounded answer plus the citations from the ${NLWEB_CORPUS_SIZE}-item corpus the answer is built from. NLWeb-compatible: AI agents can call /api/nlweb/ask to get the same items as JSON-LD.`
            : `A natural-language search over ${NLWEB_CORPUS_SIZE} pages of funnel teardowns, pricing teardowns, alternatives, glossary, FAQ entries, direct answers, benchmarks, and Playbook steps. Ask in plain English; the page returns the closest matching surfaces with a grounded summary.`}
        </p>
      </header>

      <form
        action="/ask"
        method="GET"
        role="search"
        aria-label="Ask Unlock SaaS"
        className="mb-10 flex flex-col sm:flex-row gap-3"
      >
        <label htmlFor="q" className="sr-only">
          Ask Unlock SaaS
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="e.g. why is my stripe line flat after launch"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          maxLength={500}
          className="flex-1 rounded-md border border-input bg-background px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          className="rounded-md bg-primary text-primary-foreground px-6 py-3 font-medium hover:opacity-90 transition"
        >
          Ask
        </button>
      </form>

      {query && ranked.length === 0 ? (
        <EmptyState query={query} />
      ) : query && ranked.length > 0 ? (
        <AnswerSection
          query={query}
          summary={summary}
          citations={ranked}
        />
      ) : (
        <Landing />
      )}

      <footer className="mt-16 pt-8 border-t border-border text-sm text-muted-foreground space-y-2">
        <p>
          The corpus covers {NLWEB_CORPUS_SIZE} canonical pages. Every
          citation links to the shipped page it summarises.
        </p>
        <p>
          NLWeb agents: call{" "}
          <Link
            href="/api/nlweb/ask"
            className="underline underline-offset-2 hover:text-foreground"
          >
            /api/nlweb/ask
          </Link>{" "}
          for the protocol-compliant JSON-LD response. Discovery manifest
          at{" "}
          <Link
            href="/.well-known/nlweb.json"
            className="underline underline-offset-2 hover:text-foreground"
          >
            /.well-known/nlweb.json
          </Link>
          . Markdown mirror at{" "}
          <Link
            href="/ask.md"
            className="underline underline-offset-2 hover:text-foreground"
          >
            /ask.md
          </Link>
          .
        </p>
      </footer>
    </main>
  );
}

/**
 * Landing state — no query yet. Renders the 12 showcase queries as
 * server-rendered links. Crawlable, sitemap-listed, and pre-cached.
 */
function Landing() {
  return (
    <section aria-labelledby="showcase-heading" className="space-y-6">
      <h2
        id="showcase-heading"
        className="text-sm font-semibold uppercase tracking-widest text-muted-foreground"
      >
        Twelve questions the corpus answers
      </h2>
      <ul className="grid sm:grid-cols-2 gap-3" role="list">
        {SHOWCASE_QUERIES.map((q) => (
          <li key={q.slug}>
            <Link
              href={`/ask?q=${encodeURIComponent(q.query)}`}
              className="block rounded-md border border-border bg-card p-4 hover:border-foreground transition"
            >
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                {q.framing}
              </p>
              <p className="text-sm text-foreground leading-snug">
                {q.query}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Or type your own question above. The corpus indexes 700 plus
        canonical pages spanning funnel teardowns, pricing teardowns,
        alternatives, comparisons, glossary, FAQ entries, direct answers,
        benchmarks, and the seven Playbook steps.
      </p>
    </section>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <section aria-live="polite" className="space-y-6">
      <p className="text-base text-foreground leading-relaxed">
        The Unlock SaaS corpus does not cover &ldquo;{query}&rdquo; directly.
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Try a different keyword, or browse the canonical entry points:
      </p>
      <ul className="grid sm:grid-cols-2 gap-3" role="list">
        {[
          { href: "/diagnostic", label: "Free Launch Diagnostic" },
          { href: "/playbook-sales", label: "The Playbook" },
          { href: "/glossary", label: "Glossary" },
          { href: "/faq", label: "FAQ" },
          { href: "/alternatives-to", label: "Alternatives to Unlock SaaS" },
          { href: "/answers", label: "Direct answers" },
        ].map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="block rounded-md border border-border bg-card p-4 hover:border-foreground transition"
            >
              <p className="text-sm text-foreground">{link.label}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Answer section — the two-layer answer rendering.
 *
 *   Layer 1: numbered citation cards + deterministic summary. Always
 *            rendered, no JS dependency.
 *   Layer 2: AskAnswerStream client island. Mounted only when there is
 *            at least one citation. Streams the LLM gloss from
 *            /api/ask/answer.
 */
function AnswerSection({
  query,
  summary,
  citations,
}: {
  query: string;
  summary: string;
  citations: readonly NlWebItem[];
}) {
  return (
    <div className="space-y-10">
      <section
        aria-labelledby="answer-heading"
        className="space-y-4"
        data-speakable="ask-answer"
      >
        <h2
          id="answer-heading"
          className="text-sm font-semibold uppercase tracking-widest text-muted-foreground"
        >
          Grounded answer
        </h2>

        {/* Layer 1 — deterministic summary. Always rendered. */}
        <p className="text-base text-foreground leading-relaxed">
          {summary}
        </p>

        {/* Layer 2 — client island. Streams LLM gloss with citation
            markers. Falls back silently if /api/ask/answer 503s. */}
        <AskAnswerStream
          query={query}
          citations={citations.map((c) => ({
            "@type": c["@type"],
            "@id": c["@id"],
            name: c.name,
            description: c.description,
            url: c.url,
            surface: c.surface,
          }))}
        />
      </section>

      <section aria-labelledby="citations-heading" className="space-y-4">
        <h2
          id="citations-heading"
          className="text-sm font-semibold uppercase tracking-widest text-muted-foreground"
        >
          Citations ({citations.length})
        </h2>
        <ol className="space-y-3 list-decimal list-inside marker:text-muted-foreground">
          {citations.map((item) => (
            <li
              key={item["@id"]}
              className="rounded-md border border-border bg-card p-4"
            >
              <Link
                href={item.url}
                className="block hover:opacity-90 transition"
              >
                <p className="text-sm font-semibold text-foreground mb-1">
                  {item.name}
                </p>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  {item.surface}
                </p>
                <p className="text-sm text-muted-foreground leading-snug">
                  {item.description}
                </p>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

/**
 * QAPage + ItemList JSON-LD for the answered state.
 *
 * Two schema blocks emitted:
 *
 *   1. QAPage — Google's canonical "this page answers a specific
 *      question" type. mainEntity is the Question with an AcceptedAnswer
 *      whose text is the deterministic summary (NOT the streamed LLM
 *      gloss, which varies per request and per model). The summary is
 *      stable and cacheable.
 *
 *   2. ItemList — mirrors the /api/nlweb/ask response shape. Lets AI
 *      agents that index the HTML page see the same ranked items they
 *      would get from the NLWeb endpoint.
 *
 * Both blocks include `mainEntityOfPage` pointing at the canonical
 * /ask?q= URL so a crawler that finds either block elsewhere can
 * resolve back to the surface.
 */
function AskJsonLd({
  query,
  summary,
  items,
}: {
  query: string;
  summary: string;
  items: readonly NlWebItem[];
}) {
  const canonicalUrl = `${BASE_URL}/ask?q=${encodeURIComponent(query)}`;

  // FAQPage, not QAPage: Google requires user-submitted answers for QAPage and
  // names publisher-written answer pages as an invalid use. mainEntity must be
  // an array. No answerCount — FAQPage does not use it and it was the field GSC
  // complained about. Do NOT switch this back to QAPage.
  const qaPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${canonicalUrl}#faq`,
    url: canonicalUrl,
    name: query,
    mainEntity: [
      {
        "@type": "Question",
        name: query,
        text: query,
        acceptedAnswer: {
          "@type": "Answer",
          text: summary,
          url: canonicalUrl,
        },
      },
    ],
    isPartOf: { "@id": `${BASE_URL}/#website` },
    inLanguage: "en-US",
  };

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${canonicalUrl}#citations`,
    name: `Citations for: ${query}`,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": item["@type"],
        "@id": item["@id"],
        name: item.name,
        description: item.description,
        url: item.url,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(qaPage) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />
    </>
  );
}
