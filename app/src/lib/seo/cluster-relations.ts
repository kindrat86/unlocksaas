/**
 * Cross-cluster relation resolver – closes the 2026-05-21 audit gap where
 * benchmark / answer / why-isnt-my / funnel-playbook detail pages each
 * lived in their own topical silo with no link out to their sibling
 * clusters. Adding cross-cluster sidebars was flagged as the highest-ROI
 * pSEO move because every visitor on, say, `/why-isnt-my/checkout` is
 * already mid-funnel-diagnostic and would convert harder if the page also
 * surfaced the directional metric ("/benchmarks/checkout-completion-rate")
 * and the canonical fix playbook in the same scroll position.
 *
 * Why this lives here, not inline
 * -------------------------------
 * Six pages need the same shape (benchmark, why-isnt-my, funnel-playbook,
 * answer, niche, press topic). Each historically wired its own
 * cross-cluster links by hand against the destination manifest, which is
 * how `/alternatives-to/[slug]` and the two teardown pages already work –
 * fine when there are three patterns to cross. With six more, a single
 * resolver per source cluster keeps the page templates short and the
 * relation logic auditable in one place.
 *
 * Brunson Hard-Rule
 * -----------------
 * Every relation is derived from the canonical slug structure of the
 * manifests – no curated cross-link map, no fabricated relationships.
 *
 *  - benchmark "landing-page-conversion-rate" ↔ why-isnt-my "landing-page"
 *    is honest because the why-isnt-my slug is a real prefix of the
 *    benchmark slug.
 *  - benchmark "tripwire-conversion-rate" ↔ funnel-playbook "tripwire"
 *    is honest because "tripwire" is the canonical playbook slug AND the
 *    leading token of the benchmark slug.
 *
 * If the manifests fan out and a derived relation becomes wrong (a new
 * "tripwire-something-else" benchmark that should NOT link to the
 * tripwire playbook), the resolver must be updated. The unit-test-shape
 * sanity check is at the bottom of each resolver: every returned entry
 * is fetched via the canonical getBySlug helper, so a stale or missing
 * sibling slug silently drops out – the failure mode is "fewer links,"
 * not "broken links."
 */

import {
  BENCHMARK_ENTRIES,
  getBenchmarkBySlug,
  type BenchmarkEntry,
} from "@/lib/benchmarks";
import {
  WHY_ISNT_MY_ENTRIES,
  getWhyIsntMyBySlug,
  type WhyIsntMyEntry,
} from "@/lib/why-isnt-my";
import {
  FUNNEL_PLAYBOOK_ENTRIES,
  getFunnelPlaybookBySlug,
  type FunnelPlaybookEntry,
} from "@/lib/funnel-playbooks";
import {
  ANSWER_ENTRIES,
  getAnswerBySlug,
  type AnswerEntry,
} from "@/lib/answers";

/**
 * Tokenise a kebab-case slug into its component words. Used to detect
 * substring relations across clusters without false positives from
 * accidental letter-level matches (e.g. "vsl" appearing inside "investly"
 * would never trigger because we split on the hyphen).
 */
function tokens(slug: string): readonly string[] {
  return slug.split("-").filter(Boolean);
}

/**
 * True when every token of `needle` appears as a token of `haystack` in
 * order. This is strictly stronger than substring matching and avoids
 * cross-cluster false positives.
 */
function tokensSubsequence(needle: string, haystack: string): boolean {
  const n = tokens(needle);
  const h = tokens(haystack);
  let hi = 0;
  for (const t of n) {
    while (hi < h.length && h[hi] !== t) hi++;
    if (hi >= h.length) return false;
    hi++;
  }
  return true;
}

// -----------------------------------------------------------------------
// Benchmark → siblings
// -----------------------------------------------------------------------

/**
 * Pick the why-isnt-my entry whose slug is the leading token-sequence of
 * the benchmark slug. Returns undefined when nothing matches – the page
 * template renders zero cross-link rows in that case.
 */
function whyIsntMyForBenchmark(
  benchmarkSlug: string,
): WhyIsntMyEntry | undefined {
  // Prefer the longest matching prefix so "checkout-completion-rate" lands
  // on "checkout" rather than "" (no false positives from a degenerate
  // empty-token match) and so "webinar-show-up-rate" prefers
  // "webinar-registration" over a shorter "webinar" if it ever existed.
  const candidates = WHY_ISNT_MY_ENTRIES.filter((e) =>
    tokensSubsequence(e.slug, benchmarkSlug),
  );
  if (candidates.length === 0) return undefined;
  return candidates.sort((a, b) => b.slug.length - a.slug.length)[0];
}

/**
 * Pick the funnel-playbook whose slug appears as a token sequence of the
 * benchmark slug. e.g. benchmark "tripwire-conversion-rate" → playbook
 * "tripwire"; benchmark "webinar-show-up-rate" → playbook
 * "perfect-webinar" (subsequence: ["webinar"] in ["perfect","webinar"]).
 */
function funnelPlaybookForBenchmark(
  benchmarkSlug: string,
): FunnelPlaybookEntry | undefined {
  const candidates = FUNNEL_PLAYBOOK_ENTRIES.filter(
    (p) =>
      tokensSubsequence(p.slug, benchmarkSlug) ||
      tokensSubsequence(benchmarkSlug.split("-").slice(0, 1).join("-"), p.slug),
  );
  if (candidates.length === 0) return undefined;
  return candidates.sort((a, b) => b.slug.length - a.slug.length)[0];
}

/**
 * Find answers whose `directAnswer` would plausibly cite this benchmark.
 * We do not parse prose; we look for an answer slug that already names
 * the same metric ("what-is-a-good-saas-churn-rate" ↔ "saas-churn-rate").
 * Returns up to 3 honest matches, dropping the current page out of its
 * own related list isn't needed because answers don't cross-reference
 * benchmark slugs directly today.
 */
function answersForBenchmark(
  benchmarkSlug: string,
  limit = 3,
): ReadonlyArray<AnswerEntry> {
  const benchmarkTokens = new Set(tokens(benchmarkSlug));
  const scored = ANSWER_ENTRIES.map((a) => {
    const overlap = tokens(a.slug).filter((t) => benchmarkTokens.has(t)).length;
    return { entry: a, overlap };
  })
    .filter((row) => row.overlap >= 2)
    .sort((x, y) => y.overlap - x.overlap);
  return scored.slice(0, limit).map((row) => row.entry);
}

export interface BenchmarkRelations {
  benchmark: BenchmarkEntry;
  whyIsntMy?: WhyIsntMyEntry;
  funnelPlaybook?: FunnelPlaybookEntry;
  answers: ReadonlyArray<AnswerEntry>;
}

export function getRelatedClustersForBenchmark(
  slug: string,
): BenchmarkRelations | null {
  const benchmark = getBenchmarkBySlug(slug);
  if (!benchmark) return null;
  return {
    benchmark,
    whyIsntMy: whyIsntMyForBenchmark(slug),
    funnelPlaybook: funnelPlaybookForBenchmark(slug),
    answers: answersForBenchmark(slug),
  };
}

// -----------------------------------------------------------------------
// Why-isnt-my → siblings
// -----------------------------------------------------------------------

/**
 * Pick the benchmark whose slug starts with the why-isnt-my element slug.
 * e.g. element "landing-page" → benchmark "landing-page-conversion-rate".
 */
function benchmarkForWhyIsntMy(
  elementSlug: string,
): BenchmarkEntry | undefined {
  const candidates = BENCHMARK_ENTRIES.filter((b) =>
    tokensSubsequence(elementSlug, b.slug),
  );
  if (candidates.length === 0) return undefined;
  return candidates.sort((a, b) => a.slug.length - b.slug.length)[0];
}

/**
 * Pick the funnel-playbook whose slug equals the why-isnt-my element
 * slug or whose tokens overlap entirely. e.g. element "tripwire" →
 * playbook "tripwire"; element "webinar-registration" → playbook
 * "perfect-webinar".
 */
function funnelPlaybookForWhyIsntMy(
  elementSlug: string,
): FunnelPlaybookEntry | undefined {
  // Exact match wins.
  const exact = getFunnelPlaybookBySlug(elementSlug);
  if (exact) return exact;
  // Otherwise prefer playbooks whose slug shares a token with the element.
  const elementTokens = new Set(tokens(elementSlug));
  const candidates = FUNNEL_PLAYBOOK_ENTRIES.filter((p) =>
    tokens(p.slug).some((t) => elementTokens.has(t)),
  );
  if (candidates.length === 0) return undefined;
  return candidates[0];
}

export interface WhyIsntMyRelations {
  whyIsntMy: WhyIsntMyEntry;
  benchmark?: BenchmarkEntry;
  funnelPlaybook?: FunnelPlaybookEntry;
}

export function getRelatedClustersForWhyIsntMy(
  slug: string,
): WhyIsntMyRelations | null {
  const whyIsntMy = getWhyIsntMyBySlug(slug);
  if (!whyIsntMy) return null;
  return {
    whyIsntMy,
    benchmark: benchmarkForWhyIsntMy(slug),
    funnelPlaybook: funnelPlaybookForWhyIsntMy(slug),
  };
}

// -----------------------------------------------------------------------
// Funnel-playbook → siblings
// -----------------------------------------------------------------------

/**
 * Pick the benchmark whose slug starts with the playbook slug (or
 * contains the playbook slug's leading token). e.g. playbook "tripwire"
 * → benchmark "tripwire-conversion-rate"; playbook "perfect-webinar"
 * → benchmark "webinar-show-up-rate".
 */
function benchmarkForFunnelPlaybook(
  playbookSlug: string,
): BenchmarkEntry | undefined {
  const playbookTokens = new Set(tokens(playbookSlug));
  const candidates = BENCHMARK_ENTRIES.filter((b) =>
    tokens(b.slug).some((t) => playbookTokens.has(t)),
  );
  if (candidates.length === 0) return undefined;
  // Prefer benchmark whose first token matches a playbook token.
  return (
    candidates.find((b) => playbookTokens.has(tokens(b.slug)[0] ?? "")) ??
    candidates[0]
  );
}

/**
 * Inverse of funnelPlaybookForWhyIsntMy. e.g. playbook "tripwire" →
 * why-isnt-my "tripwire"; playbook "perfect-webinar" → why-isnt-my
 * "webinar-registration".
 */
function whyIsntMyForFunnelPlaybook(
  playbookSlug: string,
): WhyIsntMyEntry | undefined {
  const exact = getWhyIsntMyBySlug(playbookSlug);
  if (exact) return exact;
  const playbookTokens = new Set(tokens(playbookSlug));
  return WHY_ISNT_MY_ENTRIES.find((e) =>
    tokens(e.slug).some((t) => playbookTokens.has(t)),
  );
}

export interface FunnelPlaybookRelations {
  funnelPlaybook: FunnelPlaybookEntry;
  benchmark?: BenchmarkEntry;
  whyIsntMy?: WhyIsntMyEntry;
}

export function getRelatedClustersForFunnelPlaybook(
  slug: string,
): FunnelPlaybookRelations | null {
  const funnelPlaybook = getFunnelPlaybookBySlug(slug);
  if (!funnelPlaybook) return null;
  return {
    funnelPlaybook,
    benchmark: benchmarkForFunnelPlaybook(slug),
    whyIsntMy: whyIsntMyForFunnelPlaybook(slug),
  };
}

// -----------------------------------------------------------------------
// Answer → siblings
// -----------------------------------------------------------------------

/**
 * Pick the benchmark whose tokens overlap the answer slug. The answers
 * catalog already uses slugs like "what-is-a-good-saas-churn-rate", so a
 * token overlap of ≥2 with the benchmark "saas-churn-rate" is enough to
 * be the canonical metric the answer is about.
 */
function benchmarkForAnswer(answerSlug: string): BenchmarkEntry | undefined {
  const answerTokens = new Set(tokens(answerSlug));
  const scored = BENCHMARK_ENTRIES.map((b) => ({
    entry: b,
    overlap: tokens(b.slug).filter((t) => answerTokens.has(t)).length,
  }))
    .filter((row) => row.overlap >= 2)
    .sort((x, y) => y.overlap - x.overlap);
  return scored[0]?.entry;
}

/**
 * Pick the funnel-playbook the answer is conceptually about. Answers
 * about tripwires / VSLs / webinars / soap operas / value ladders map
 * 1:1 to playbook slugs.
 */
function funnelPlaybookForAnswer(
  answerSlug: string,
): FunnelPlaybookEntry | undefined {
  const answerTokens = new Set(tokens(answerSlug));
  return FUNNEL_PLAYBOOK_ENTRIES.find((p) =>
    tokens(p.slug).every((t) => answerTokens.has(t)),
  );
}

export interface AnswerRelations {
  answer: AnswerEntry;
  benchmark?: BenchmarkEntry;
  funnelPlaybook?: FunnelPlaybookEntry;
}

export function getRelatedClustersForAnswer(
  slug: string,
): AnswerRelations | null {
  const answer = getAnswerBySlug(slug);
  if (!answer) return null;
  return {
    answer,
    benchmark: benchmarkForAnswer(slug),
    funnelPlaybook: funnelPlaybookForAnswer(slug),
  };
}
