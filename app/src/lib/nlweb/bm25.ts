/**
 * BM25 ranker for the NLWeb corpus.
 *
 * Why BM25 instead of embeddings
 * ------------------------------
 * NLWeb's reference implementation ships with a vector-store retriever
 * by default, but the spec only requires that /ask returns the top-k
 * items grounded in the site's schema.org corpus. The actual retrieval
 * mechanism is up to the publisher. For a ~700-item static corpus the
 * indie-SaaS founder vocabulary is well-covered by token-level matching
 * (most queries are 2-6 tokens of category + product name). A pure
 * BM25 ranker gets us:
 *
 *   - Zero external dependencies (no embedding API, no vector DB).
 *   - Deterministic, debuggable scoring (same query in -> same items out).
 *   - Sub-millisecond per-query latency on a 700-item corpus.
 *   - No cold-start, no cache invalidation, no API key rotation.
 *
 * An embedding-augmented variant can layer in later behind an env flag
 * without changing the route contract (the /ask endpoint already
 * returns the items + a summary; the retriever is internal).
 *
 * Algorithm
 * ---------
 * Standard BM25:
 *
 *   score(D, Q) = Σ idf(qᵢ) · ( f(qᵢ, D) · (k1+1) ) / ( f(qᵢ, D) + k1·(1-b+b·|D|/avgdl) )
 *
 * With k1=1.5 and b=0.75 (Lucene defaults). idf is the BM25 +0.5 smoothed
 * variant. Tokenisation: lowercase, split on non-alphanumeric, strip
 * 1-character tokens, no stop-word removal (every short token like "vs"
 * or "for" can be load-bearing in this corpus).
 *
 * Brunson Hard-Rule reconciliation: deterministic ranker means an agent
 * citing a /ask result can reproduce it by the same query – no hidden
 * randomness, no model drift, no fabricated ranking.
 */

import type { NlWebItem } from "@/lib/nlweb/corpus";

const K1 = 1.5;
const B = 0.75;

/**
 * Token normaliser. Lowercase, split on non-alphanumeric. Single-letter
 * tokens are dropped because they generate noise (lone "a", "i") that
 * matches everything. Stop-words are kept – in this corpus "vs", "for",
 * "to", "in" all carry signal ("tally vs typeform", "stack for course
 * creators", "alternatives to shipfast").
 */
export function tokenise(s: string): string[] {
  return s
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter((t) => t.length > 1);
}

/** Internal: count tokens in a string returning a Map for O(1) lookups. */
function countTokens(text: string): Map<string, number> {
  const counts = new Map<string, number>();
  for (const t of tokenise(text)) {
    counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return counts;
}

/**
 * Pre-built BM25 index over an NlWeb corpus. Built once at module load
 * so per-request scoring is O(|query| · |corpus|) integer math, no
 * tokenisation, no allocation hotspots.
 */
export interface Bm25Index {
  /** Tokenised + counted documents in the same order as the source corpus. */
  readonly docs: ReadonlyArray<{
    readonly counts: ReadonlyMap<string, number>;
    readonly length: number;
  }>;
  /** Average document length, used in the length-normalisation term. */
  readonly avgdl: number;
  /** Smoothed BM25 IDF per token. */
  readonly idf: ReadonlyMap<string, number>;
}

/**
 * Build the BM25 index over the supplied items. Pure function; the
 * caller can memoise the result at module scope.
 */
export function buildIndex(items: readonly NlWebItem[]): Bm25Index {
  const docs: { counts: Map<string, number>; length: number }[] = [];
  let totalLength = 0;
  // Document frequency per token, for IDF computation.
  const df = new Map<string, number>();

  for (const item of items) {
    const counts = countTokens(item.text);
    const length = Array.from(counts.values()).reduce((a, b) => a + b, 0);
    totalLength += length;
    docs.push({ counts, length });
    for (const token of counts.keys()) {
      df.set(token, (df.get(token) ?? 0) + 1);
    }
  }

  const N = docs.length;
  const avgdl = N > 0 ? totalLength / N : 0;

  // BM25 +0.5 smoothed IDF. Always non-negative thanks to the +0.5/+0.5
  // smoothing, which avoids the pathological negative-idf case when a
  // token appears in > 50% of documents (common with short corpora).
  const idf = new Map<string, number>();
  for (const [token, freq] of df.entries()) {
    idf.set(token, Math.log(1 + (N - freq + 0.5) / (freq + 0.5)));
  }

  return { docs, avgdl, idf };
}

/**
 * Score every document against the query. Returns the items sorted
 * descending by score; ties broken by insertion order (corpus order).
 *
 * `topK` is an optional cap; passing it is purely a performance hint
 * for very large corpora (we still walk the full corpus to score).
 */
export function rank(
  index: Bm25Index,
  items: readonly NlWebItem[],
  query: string,
  topK?: number,
): { item: NlWebItem; score: number }[] {
  const qTokens = tokenise(query);
  if (qTokens.length === 0) return [];

  const results: { item: NlWebItem; score: number }[] = [];

  for (let i = 0; i < items.length; i++) {
    const doc = index.docs[i];
    if (!doc) continue;
    let score = 0;
    for (const qt of qTokens) {
      const idf = index.idf.get(qt);
      if (!idf) continue; // Token not in corpus -> contributes 0.
      const tf = doc.counts.get(qt) ?? 0;
      if (tf === 0) continue;
      const numerator = tf * (K1 + 1);
      const denominator =
        tf + K1 * (1 - B + (B * doc.length) / Math.max(1, index.avgdl));
      score += idf * (numerator / denominator);
    }
    if (score > 0) {
      results.push({ item: items[i]!, score });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return topK !== undefined ? results.slice(0, topK) : results;
}
