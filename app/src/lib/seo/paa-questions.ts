/**
 * People Also Ask (PAA) question generator for pSEO surfaces.
 *
 * Why this surface exists
 * -----------------------
 * Google's "People Also Ask" boxes and the LLM citation engines
 * (ChatGPT, Claude, Perplexity, Google AI Overviews) cluster around a
 * small canonical set of question phrasings: "What is X?", "How does X
 * work?", "Why does X matter?", "When should I use X?", "What's the
 * difference between X and Y?". Surfacing these as explicit H3 questions
 * with curated answers wins on two axes at once: the Featured Snippet
 * shape AND the FAQPage rich-result eligibility.
 *
 * The /why-isnt-my pSEO surface already ships this shape one
 * question at a time ("Why isn't my landing page converting?"). This
 * module extends the pattern to every other pSEO surface by templating
 * the canonical PAA Q-phrasings from each entry's curated fields.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - Every answer is pulled VERBATIM from the entry's existing curated
 *     fields (shortDefinition, longDefinition, whyItMatters, tldr,
 *     etc.). No new content is generated; no fabricated phrasing is
 *     introduced. The PAA section is a re-presentation layer, not a
 *     content-authoring layer.
 *   - When a source field is multi-paragraph, only the first paragraph
 *     is used. AEO answers above ~80 words underperform Featured
 *     Snippet placement.
 *   - The same Q/A pairs are merged into FAQPage JSON-LD via
 *     `mergePaaIntoFaqs` so the rich-result eligibility tracks the
 *     visible H3 questions exactly. Drift between schema and DOM is
 *     impossible by construction.
 *
 * Activation log: 2026-05-20 — question-form H2/H3 mining across all
 * pSEO surfaces, expanding the /why-isnt-my pattern.
 */

import type { GlossaryEntry } from "@/lib/glossary";
import type { BenchmarkEntry } from "@/lib/benchmarks";
import type { Alternative } from "@/lib/alternatives";
import type { Comparison } from "@/lib/comparisons";
import type { AnswerEntry } from "@/lib/answers";
import type { CategoryDef } from "@/lib/categories";
import type { FunnelTeardown } from "@/lib/funnel-teardowns";
import type { PricingTeardown } from "@/lib/pricing-teardowns";
import type { FunnelPlaybookEntry } from "@/lib/funnel-playbooks";
import type { NicheEntry } from "@/lib/niches";
import type { WhyIsntMyEntry } from "@/lib/why-isnt-my";
import type { Locale } from "@/lib/i18n/locales";

/** A canonical PAA question/answer pair. Identical shape to existing FAQ entries. */
export interface PaaPair {
  q: string;
  a: string;
}

/**
 * Return the first paragraph of a multi-line field. Splits on blank
 * lines first, then on single newlines as a fallback. Used to keep PAA
 * answers in the 40-80 word AEO sweet spot.
 */
function firstParagraph(s: string): string {
  const trimmed = s.trim();
  const blankSplit = trimmed.split(/\n\s*\n/);
  const firstBlock = blankSplit[0] ?? trimmed;
  const lineSplit = firstBlock.split(/\n/);
  return (lineSplit[0] ?? firstBlock).trim();
}

// ----------------------------------------------------------------------------
// Localized PAA question stems
// ----------------------------------------------------------------------------
//
// The /glossary/[slug] and /benchmarks/[slug] surfaces ship locale variants
// under /[locale]/... for es and pt-BR (see src/lib/i18n/locales.ts). Each
// locale needs the question stems in the visitor's language; the answers
// themselves come from the localized entry overlay (getGlossaryEntries(locale)
// / getBenchmarkEntries(locale)).

/** Stems shared by every PAA generator that has a locale route. */
interface PaaStems {
  whatIs: (x: string) => string;
  howDoesItWork: (x: string) => string;
  whyDoesItMatter: (x: string) => string;
  howDoIApply: (x: string) => string;
  exampleOf: (x: string) => string;
  // benchmarks
  whatIsGood: (x: string) => string;
  averageFor: (x: string) => string;
  whyIsLow: (x: string) => string;
  howToImprove: (x: string) => string;
  // section heading
  heading: string;
}

const STEMS: Record<Locale, PaaStems> = {
  "en-US": {
    whatIs: (x) => `What is ${x}?`,
    howDoesItWork: (x) => `How does ${x} work?`,
    whyDoesItMatter: (x) =>
      `Why does ${x} matter for indie SaaS founders?`,
    howDoIApply: (x) => `How do I apply ${x} on my page?`,
    exampleOf: (x) => `What is an example of ${x}?`,
    whatIsGood: (x) => `What is a good ${x}?`,
    averageFor: (x) => `What is the average ${x} for indie SaaS?`,
    whyIsLow: (x) => `Why is my ${x} so low?`,
    howToImprove: (x) => `How do I improve my ${x}?`,
    heading: "People also ask",
  },
  es: {
    whatIs: (x) => `¿Qué es ${x}?`,
    howDoesItWork: (x) => `¿Cómo funciona ${x}?`,
    whyDoesItMatter: (x) =>
      `¿Por qué importa ${x} para los fundadores indie SaaS?`,
    howDoIApply: (x) => `¿Cómo aplico ${x} en mi página?`,
    exampleOf: (x) => `¿Cuál es un ejemplo de ${x}?`,
    whatIsGood: (x) => `¿Cuál es una buena ${x}?`,
    averageFor: (x) => `¿Cuál es el promedio de ${x} para indie SaaS?`,
    whyIsLow: (x) => `¿Por qué mi ${x} es tan bajo?`,
    howToImprove: (x) => `¿Cómo mejoro mi ${x}?`,
    heading: "La gente también pregunta",
  },
  "pt-BR": {
    whatIs: (x) => `O que é ${x}?`,
    howDoesItWork: (x) => `Como funciona ${x}?`,
    whyDoesItMatter: (x) =>
      `Por que ${x} importa para fundadores indie SaaS?`,
    howDoIApply: (x) => `Como aplico ${x} na minha página?`,
    exampleOf: (x) => `Qual é um exemplo de ${x}?`,
    whatIsGood: (x) => `O que é uma boa ${x}?`,
    averageFor: (x) => `Qual é a média de ${x} para indie SaaS?`,
    whyIsLow: (x) => `Por que minha ${x} está tão baixa?`,
    howToImprove: (x) => `Como melhoro minha ${x}?`,
    heading: "As pessoas também perguntam",
  },
};

/** Resolve the PAA "People also ask" section heading for a given locale. */
export function paaHeadingForLocale(locale: Locale): string {
  return STEMS[locale].heading;
}

// ----------------------------------------------------------------------------
// Per-surface generators
// ----------------------------------------------------------------------------

export function paaForGlossary(
  g: GlossaryEntry,
  locale: Locale = "en-US",
): PaaPair[] {
  const s = STEMS[locale];
  const out: PaaPair[] = [
    { q: s.whatIs(g.term), a: g.shortDefinition },
    { q: s.howDoesItWork(g.term), a: firstParagraph(g.longDefinition) },
    { q: s.whyDoesItMatter(g.term), a: firstParagraph(g.whyItMatters) },
  ];
  if (g.howToApply.length > 0) {
    out.push({ q: s.howDoIApply(g.term), a: g.howToApply[0] });
  }
  if (g.example) {
    out.push({ q: s.exampleOf(g.term), a: firstParagraph(g.example) });
  }
  return out;
}

export function paaForBenchmark(
  e: BenchmarkEntry,
  locale: Locale = "en-US",
): PaaPair[] {
  const s = STEMS[locale];
  const typicalBand = e.bands.find((b) => b.label === "Typical range");
  const lowBand = e.bands.find((b) => b.label === "Underperforming");
  const out: PaaPair[] = [{ q: s.whatIsGood(e.metric), a: e.aeoAnswer }];
  if (typicalBand) {
    out.push({
      q: s.averageFor(e.metric),
      a: `${typicalBand.range}. ${typicalBand.diagnosis}`,
    });
  }
  if (lowBand) {
    out.push({ q: s.whyIsLow(e.metric), a: lowBand.diagnosis });
  }
  if (e.drivers.length > 0) {
    out.push({
      q: s.howToImprove(e.metric),
      a: `The biggest driver, in order of magnitude, is: ${e.drivers[0]}. Fix that before tuning anything else on this metric.`,
    });
  }
  return out;
}

export function paaForAlternative(a: Alternative): PaaPair[] {
  const out: PaaPair[] = [];
  if (a.whatItIs.length > 0) {
    out.push({ q: `What is ${a.displayName}?`, a: a.whatItIs[0] });
  } else {
    out.push({ q: `What is ${a.displayName}?`, a: a.oneLine });
  }
  out.push({
    q: `Is ${a.displayName} an alternative to Unlock SaaS?`,
    a: a.honestVerdict,
  });
  out.push({ q: `Who is ${a.displayName} for?`, a: a.whoForIt });
  out.push({ q: `Who is ${a.displayName} not for?`, a: a.whoNotForIt });
  out.push({
    q: `How much does ${a.displayName} cost?`,
    a: a.pricingNote,
  });
  return out;
}

export function paaForComparison(c: Comparison): PaaPair[] {
  return [
    {
      q: `What's the difference between ${c.a.name} and ${c.b.name}?`,
      a: c.tldr,
    },
    { q: `Who should pick ${c.a.name}?`, a: c.bestFor.a },
    { q: `Who should pick ${c.b.name}?`, a: c.bestFor.b },
  ];
}

export function paaForAnswer(e: AnswerEntry): PaaPair[] {
  // The /answers surface IS already PAA-shaped — the entry's `question`
  // is the canonical H1 and `directAnswer` is the AEO citation block.
  // We surface the supporting points as nuance H3s (phrased as
  // follow-ups a curious reader would ask next).
  const out: PaaPair[] = [{ q: e.question, a: e.directAnswer }];
  e.supporting.slice(0, 3).forEach((point, idx) => {
    const followUps = [
      "What's the nuance?",
      "What else should I know?",
      "What's the common mistake here?",
    ];
    out.push({ q: followUps[idx] ?? "What else?", a: point });
  });
  return out;
}

export function paaForCategory(c: CategoryDef): PaaPair[] {
  return [
    {
      q: `What is ${c.displayName.toLowerCase()}?`,
      a: c.oneLine,
    },
    {
      q: `Why does ${c.displayName.toLowerCase()} matter for indie SaaS founders?`,
      a: firstParagraph(c.intent),
    },
  ];
}

export function paaForFunnelTeardown(t: FunnelTeardown): PaaPair[] {
  return [
    {
      q: `What is ${t.displayName}'s marketing strategy?`,
      a: t.tldr,
    },
    {
      q: `How does ${t.displayName} sell its product?`,
      a: `Hook pattern: ${t.hook.pattern}. Story pattern: ${t.story.pattern}. Offer pattern: ${t.offer.pattern}.`,
    },
    {
      q: `What does ${t.displayName} sell?`,
      a: t.productSnapshot.whatTheySell,
    },
    {
      q: `Who is ${t.displayName} for?`,
      a: t.productSnapshot.whoFor,
    },
  ];
}

export function paaForPricingTeardown(t: PricingTeardown): PaaPair[] {
  const tiersSummary = t.pricingStructure.tiers
    .map((tier) => `${tier.name}: ${tier.pricePoint}`)
    .join("; ");
  return [
    {
      q: `How does ${t.displayName} price its product?`,
      a: t.tldr,
    },
    {
      q: `What pricing model does ${t.displayName} use?`,
      a: t.pricingStructure.model,
    },
    {
      q: `How much does ${t.displayName} cost?`,
      a: tiersSummary,
    },
    {
      q: `Does ${t.displayName} have a free trial?`,
      a: t.pricingStructure.freeTrialBehavior,
    },
  ];
}

export function paaForFunnelPlaybook(p: FunnelPlaybookEntry): PaaPair[] {
  const lower = p.displayName.toLowerCase();
  return [
    { q: `What is a ${lower}?`, a: p.tldr },
    { q: `When should I use a ${lower}?`, a: p.whenToUse },
    { q: `When should I not use a ${lower}?`, a: p.whenNotToUse },
    {
      q: `Where does a ${lower} sit on the value ladder?`,
      a: p.ladderPosition,
    },
  ];
}

export function paaForNiche(n: NicheEntry): PaaPair[] {
  return [
    {
      q: `Does Unlock SaaS work for ${n.displayName}?`,
      a: n.heroSubhead,
    },
    {
      q: `What do ${n.displayName} typically get wrong on their funnel?`,
      a: n.commonMistake,
    },
    {
      q: `What works for ${n.displayName} long term?`,
      a: n.whatCompounds,
    },
  ];
}

export function paaForWhyIsntMy(e: WhyIsntMyEntry): PaaPair[] {
  const out: PaaPair[] = [
    {
      q: `Why isn't my ${e.element} converting?`,
      a: e.tldr,
    },
    {
      q: `What's a good ${e.element} conversion rate?`,
      a: `${e.directionalRange.range}. ${e.directionalRange.note}`,
    },
  ];
  if (e.checklist.length > 0) {
    out.push({
      q: `How do I fix my ${e.element} this week?`,
      a: e.checklist[0],
    });
  }
  return out;
}

// ----------------------------------------------------------------------------
// FAQ merging — feed PAA into FAQPage JSON-LD without duplicating curated
// founder-voice FAQs.
// ----------------------------------------------------------------------------

/**
 * Merge PAA pairs with existing curated FAQs for FAQPage JSON-LD.
 * Deduplicates by case-insensitive question text; existing curated FAQs
 * win (they're founder-voice and editorially polished). PAA pairs that
 * happen to ask the same question are dropped from the merge.
 *
 * Returns plain {q,a} shapes so the caller can pipe directly into
 * `mainEntity` of an FAQPage JSON-LD payload.
 */
export function mergePaaIntoFaqs<T extends { q: string; a: string }>(
  faqs: ReadonlyArray<T>,
  paa: ReadonlyArray<PaaPair>,
): Array<{ q: string; a: string }> {
  const normalize = (s: string) => s.toLowerCase().trim().replace(/\s+/g, " ");
  const seen = new Set(faqs.map((f) => normalize(f.q)));
  const out: Array<{ q: string; a: string }> = faqs.map((f) => ({
    q: f.q,
    a: f.a,
  }));
  for (const p of paa) {
    const key = normalize(p.q);
    if (!seen.has(key)) {
      seen.add(key);
      out.push({ q: p.q, a: p.a });
    }
  }
  return out;
}

// ----------------------------------------------------------------------------
// Slug helper for in-page anchor ids on each PAA H3.
// ----------------------------------------------------------------------------

/**
 * Deterministic question → anchor-id slug. Matches Google's "People
 * Also Ask" in-page anchor pattern so each H3 is a sharable deep link.
 */
export function paaAnchorId(q: string): string {
  return (
    "paa-" +
    q
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60)
  );
}
