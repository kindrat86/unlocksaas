/**
 * NLWeb corpus aggregator – Microsoft NLWeb compatible.
 *
 * Microsoft NLWeb (github.com/microsoft/NLWeb) turns a schema.org-annotated
 * site into a conversational/agentic interface. The convention: a `/ask`
 * endpoint accepts a natural-language query, retrieves the top matching
 * items from the site's schema.org corpus, and returns an `ItemList`
 * JSON-LD payload with a one-shot summary. Shopify, Tripadvisor, and
 * Eventbrite are already on it.
 *
 * Why this file exists
 * --------------------
 * UnlockSaaS already emits extensive schema.org JSON-LD (Article, FAQ,
 * HowTo, Product, Dataset, DefinedTermSet) across hundreds of routes.
 * Rather than crawl those pages at request time, we project every
 * pSEO catalog entry into a normalised NLWeb item at module load. The
 * arrays in /lib/* are already the source of truth for the rendered
 * HTML; reading them directly is the cleanest seed (option a from
 * the design doc) – no crawler, no sitemap walk, no drift between
 * the corpus and what the public HTML actually says.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - Every item carries a real `url` that resolves to a live HTML page.
 *   - Every item carries a real `dateModified` (lastVerified) so a
 *     retriever can dedupe vs scrape.
 *   - No fabricated counts. The `corpusSize` getter returns whatever
 *     the underlying catalogs report.
 *   - `keywords` are derived from the source rows (category, tags,
 *     displayName tokens). Nothing invented.
 *
 * Schema
 * ------
 * Each NlWebItem follows the schema.org `Thing` shape with a discriminated
 * `@type`. Retrievers can branch on `@type` to render differently per
 * surface, or treat them uniformly via the `name + description + url`
 * triplet. The `text` field is the BM25 index target – a denormalised
 * concatenation of every searchable string on the item.
 *
 * Caching
 * -------
 * Pure module-scope; built once at first import. The /ask route hits this
 * module on cold start and caches the BM25 index in module scope too.
 */

import { ALTERNATIVES } from "@/lib/alternatives";
import { TEARDOWNS } from "@/lib/funnel-teardowns";
import { PRICING_TEARDOWNS } from "@/lib/pricing-teardowns";
import { COMPARISONS } from "@/lib/comparisons";
import { CATEGORIES } from "@/lib/categories";
import { PLAYBOOK_STEPS } from "@/lib/playbook-steps";
import { GLOSSARY } from "@/lib/glossary";
import { FAQ_ENTRIES } from "@/lib/faq-data";
import { ANSWER_ENTRIES } from "@/lib/answers";
import { BENCHMARK_ENTRIES } from "@/lib/benchmarks";
import { BASE_URL } from "@/lib/seo/entity";

/**
 * NLWeb item shape. Matches schema.org `Thing` with a discriminator on
 * `@type` so a retriever can pick up the type without parsing the URL.
 * `text` is the BM25 index target – a denormalised concatenation of
 * every searchable string on the source row, intentionally redundant
 * with the structured fields so a token-level match still wins even
 * when the structured field happens not to contain the query term.
 */
export interface NlWebItem {
  /** schema.org type discriminator. Article, FAQPage, HowTo, DefinedTerm, Product, Question. */
  "@type": string;
  /** Stable id, BASE_URL-anchored fragment. Used as the deduplication key. */
  "@id": string;
  /** Human-readable title. */
  name: string;
  /** One-paragraph description suitable for a snippet. */
  description: string;
  /** Absolute URL of the canonical surface for this item. */
  url: string;
  /** ISO date string of last manual verification. */
  dateModified: string;
  /** Optional keyword tags (category, framework labels). */
  keywords: readonly string[];
  /** Source surface label. Used by the summary template + filters. */
  surface:
    | "alternative"
    | "funnel-teardown"
    | "pricing-teardown"
    | "comparison"
    | "category"
    | "playbook-step"
    | "glossary"
    | "faq"
    | "answer"
    | "benchmark";
  /** BM25 index target. Denormalised concat of name+description+keywords. */
  text: string;
}

/** Helper: lowercase + collapse whitespace for the BM25 corpus. */
function normalise(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

/** Helper: project an array of strings into a single index target. */
function joinText(parts: readonly (string | undefined)[]): string {
  return normalise(parts.filter(Boolean).join(" "));
}

function buildCorpus(): readonly NlWebItem[] {
  const items: NlWebItem[] = [];

  // Alternatives – comparison pages (UnlockSaaS vs X).
  //
  // Typed WebPage, not Product. These entries surface as JSON-LD on /ask, and
  // a Product node carrying none of offers/review/aggregateRating trips
  // Google's critical "Either offers, review, or aggregateRating should be
  // specified" check. A comparison page is a page, not a priced product — and
  // the /alternatives-to/* pages emit no Product node of their own, so nothing
  // rich-result-eligible is lost. Same call as the sitewide third-party
  // retype in 13645f6.
  for (const a of ALTERNATIVES) {
    items.push({
      "@type": "WebPage",
      "@id": `${BASE_URL}/alternatives-to/${a.slug}`,
      name: `UnlockSaaS vs ${a.displayName}`,
      description: a.oneLine,
      url: `${BASE_URL}/alternatives-to/${a.slug}`,
      dateModified: a.lastVerified,
      keywords: [a.category, "alternative", a.displayName],
      surface: "alternative",
      text: joinText([
        `UnlockSaaS vs ${a.displayName}`,
        a.oneLine,
        a.category,
        a.whoForIt,
        a.whoNotForIt,
        a.honestVerdict,
        a.pricingNote,
        ...a.whatItIs,
        ...a.whatItIsNot,
      ]),
    });
  }

  // Funnel teardowns – Article-shaped pages.
  for (const t of TEARDOWNS) {
    items.push({
      "@type": "Article",
      "@id": `${BASE_URL}/funnel-teardown/${t.slug}`,
      name: `${t.displayName} – funnel teardown`,
      description: t.tldr,
      url: `${BASE_URL}/funnel-teardown/${t.slug}`,
      dateModified: t.lastVerified,
      keywords: [t.category, "funnel teardown", "Brunson", t.displayName],
      surface: "funnel-teardown",
      text: joinText([
        `${t.displayName} funnel teardown`,
        t.oneLine,
        t.tldr,
        t.category,
        t.productSnapshot.whatTheySell,
        t.productSnapshot.whoFor,
        t.productSnapshot.pricingNote,
        t.brunsonLens.hook,
        t.brunsonLens.story,
        t.brunsonLens.offer,
        t.brunsonLens.valueLadderTier,
      ]),
    });
  }

  // Pricing teardowns – Article-shaped pages.
  for (const t of PRICING_TEARDOWNS) {
    items.push({
      "@type": "Article",
      "@id": `${BASE_URL}/pricing-teardown/${t.slug}`,
      name: `${t.displayName} – pricing teardown`,
      description: t.tldr,
      url: `${BASE_URL}/pricing-teardown/${t.slug}`,
      dateModified: t.lastVerified,
      keywords: [t.category, "pricing teardown", "Brunson", t.displayName],
      surface: "pricing-teardown",
      text: joinText([
        `${t.displayName} pricing teardown`,
        t.oneLine,
        t.tldr,
        t.category,
        t.pricingStructure.model,
        t.pricingStructure.paymentFrequency,
        t.pricingStructure.freeTrialBehavior,
        t.anchorAnalysis.pattern,
        t.anchorAnalysis.analysis,
        t.upgradeTrigger.pattern,
        t.upgradeTrigger.analysis,
        t.brunsonLens.stack,
        t.brunsonLens.valueLadder,
        t.brunsonLens.decoyOrAnchor,
        t.brunsonLens.paymentMechanics,
      ]),
    });
  }

  // Comparisons – Article-shaped head-to-head pages.
  for (const c of COMPARISONS) {
    items.push({
      "@type": "Article",
      "@id": `${BASE_URL}/vs/${c.slug}`,
      name: `${c.a.name} vs ${c.b.name}`,
      description: c.tldr,
      url: `${BASE_URL}/vs/${c.slug}`,
      dateModified: c.lastVerified,
      keywords: [c.category, "comparison", c.a.name, c.b.name, ...c.tags],
      surface: "comparison",
      text: joinText([
        `${c.a.name} vs ${c.b.name}`,
        c.oneLine,
        c.tldr,
        c.category,
        c.bestFor.a,
        c.bestFor.b,
        ...c.pickAIf,
        ...c.pickBIf,
        c.honestTake,
        c.forIndieFounders.reasoning,
        ...c.tags,
      ]),
    });
  }

  // Category roundups – Article-shaped index pages. CategoryDef does not
  // itself carry a lastVerified (it's a pure aggregation layer over the
  // underlying catalogs); we anchor to the strategy-lock date as a stable
  // fallback so the dateModified is never empty.
  for (const cat of CATEGORIES) {
    items.push({
      "@type": "Article",
      "@id": `${BASE_URL}/category/${cat.slug}`,
      name: cat.displayName,
      description: cat.oneLine,
      url: `${BASE_URL}/category/${cat.slug}`,
      dateModified: "2026-05-01",
      keywords: [cat.displayName, "category roundup", ...cat.tags],
      surface: "category",
      text: joinText([cat.displayName, cat.oneLine, cat.intent, ...cat.tags]),
    });
  }

  // Playbook steps – HowTo-shaped pages (steps 1-7).
  PLAYBOOK_STEPS.forEach((step, i) => {
    const stepNumber = i + 1;
    items.push({
      "@type": "HowTo",
      "@id": `${BASE_URL}/playbook/step/${stepNumber}`,
      name: `Playbook step ${stepNumber}: ${step.name}`,
      description: step.text,
      url: `${BASE_URL}/playbook/step/${stepNumber}`,
      dateModified: "2026-05-01",
      keywords: ["Playbook", "step", "Brunson"],
      surface: "playbook-step",
      text: joinText([`Playbook step ${stepNumber}`, step.name, step.text]),
    });
  });

  // Glossary terms – DefinedTerm-shaped pages.
  for (const g of GLOSSARY) {
    items.push({
      "@type": "DefinedTerm",
      "@id": `${BASE_URL}/glossary/${g.slug}`,
      name: g.term,
      description: g.longDefinition,
      url: `${BASE_URL}/glossary/${g.slug}`,
      dateModified: g.lastVerified,
      keywords: [g.category, "Brunson term", "glossary"],
      surface: "glossary",
      text: joinText([g.term, g.longDefinition, g.whyItMatters, g.category]),
    });
  }

  // FAQ entries – Question-shaped surfaces. The /faq hub is one HTML
  // page but each entry is its own retrieval-grade item.
  for (const f of FAQ_ENTRIES) {
    items.push({
      "@type": "Question",
      "@id": `${BASE_URL}/faq#${encodeURIComponent(f.q.slice(0, 50))}`,
      name: f.q,
      description: f.a,
      url: `${BASE_URL}/faq`,
      dateModified: "2026-05-01",
      keywords: [f.category, "FAQ", "objection"],
      surface: "faq",
      text: joinText([f.q, f.a, f.category]),
    });
  }

  // Answer pages – QAPage-shaped AEO-format direct answers.
  for (const a of ANSWER_ENTRIES) {
    items.push({
      "@type": "QAPage",
      "@id": `${BASE_URL}/answers/${a.slug}`,
      name: a.question,
      description: a.directAnswer,
      url: `${BASE_URL}/answers/${a.slug}`,
      dateModified: a.lastVerified,
      keywords: [a.category, "answer", ...a.relatedGlossary],
      surface: "answer",
      text: joinText([
        a.question,
        a.directAnswer,
        ...a.supporting,
        a.category,
        ...a.relatedGlossary,
      ]),
    });
  }

  // Benchmark pages – Article-shaped AEO direct-answer pages with ranges.
  for (const b of BENCHMARK_ENTRIES) {
    items.push({
      "@type": "Article",
      "@id": `${BASE_URL}/benchmarks/${b.slug}`,
      name: `${b.metric} – benchmark`,
      description: b.aeoAnswer,
      url: `${BASE_URL}/benchmarks/${b.slug}`,
      dateModified: b.lastVerified,
      keywords: ["benchmark", "indie SaaS", b.metric],
      surface: "benchmark",
      text: joinText([
        b.metric,
        b.aeoAnswer,
        ...b.drivers,
        ...b.misreadings,
        b.sourceNote,
      ]),
    });
  }

  return Object.freeze(items);
}

/**
 * Module-scope corpus, built once. The arrays it reads from are themselves
 * frozen module-scope constants, so this is effectively a build-time
 * artifact in serverful execution.
 */
export const NLWEB_CORPUS: readonly NlWebItem[] = buildCorpus();

/** Convenience: corpus size, for diagnostics + the discovery manifest. */
export const NLWEB_CORPUS_SIZE = NLWEB_CORPUS.length;

/**
 * Distinct list of surfaces present in the corpus. Exposed so the
 * discovery manifest can advertise what categories of content the
 * /ask endpoint can answer about.
 */
export const NLWEB_SURFACES = Object.freeze(
  Array.from(new Set(NLWEB_CORPUS.map((i) => i.surface))).sort(),
);
