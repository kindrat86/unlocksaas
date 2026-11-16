/**
 * Thread finder: given a founder's description of their product and the
 * customer's problem (in their own words), find LIVE public threads
 * (30-90 days preferred, hard cap 365 days) where real people describe
 * that problem.
 *
 * Sources (free public APIs only):
 *   - HN Algolia (https://hn.algolia.com/api) - stories with text
 *   - Reddit public JSON (https://www.reddit.com/search.json) - frequently
 *     403 for datacenter IPs; failures are reported HONESTLY per source,
 *     never hidden, never faked.
 *   - Stack Exchange API (https://api.stackexchange.com) - Stack Overflow.
 *   - Indie Hackers has no free public search API (GraphQL API requires an
 *     account token), so it is intentionally not a source; the manifest
 *     says so.
 *
 * The tool NEVER posts anything anywhere. It returns threads plus a
 * structured reply-draft scaffold built from the thread's own words; the
 * founder posts replies themselves.
 */

export type ThreadSource = "hn" | "reddit" | "stackexchange";

export type SourceStatus = {
  source: string;
  ok: boolean;
  threads_fetched: number;
  detail: string;
};

export type FoundThread = {
  source: ThreadSource;
  source_label: string;
  title: string;
  url: string;
  created_at: string; // ISO date
  age_days: number;
  engagement: number;
  engagement_label: string;
  score: number; // 0-100 relevance
  score_explanation: string;
  matched_quote: string; // sentence from the thread containing problem words
  matched_terms: string[];
  body_excerpt: string; // short plain-text excerpt of the thread body
};

export type FinderResult = {
  problem: string;
  product: string;
  generated_queries: string[];
  threads: FoundThread[];
  total_fetched: number;
  sources: SourceStatus[];
  cached: boolean;
  cache_age_seconds?: number;
  generated_at: string;
};

// ---------------------------------------------------------------------------
// Query building
// ---------------------------------------------------------------------------

const STOPWORDS = new Set(
  ("a an and are as at be but by for from has have how i im ive it its of on " +
    "or our so that the their them they this to was we what when where which " +
    "who why will with you your youre do does did cant cannot dont isnt arent " +
    "me my mine us get got getting really very much many some any about into " +
    "out up down over then than there here also just like want wants need " +
    "needs trying try help please anyone someone everybody anyones thing " +
    "things stuff way ways lot lots make made making using use used " +
    "take takes taken taking week weeks day days month months year years " +
    "time times answer answers read reading see seeing seen look looking " +
    "know knowing knew tell telling told think thinking thought give giving " +
    "gone go going came come coming said say saying right actually even " +
    "still yet ever never always something nothing everything anything").split(" ")
);

const NON_WORD = /[^a-z0-9\s-]+/g;

export function extractKeywords(text: string, max = 8): string[] {
  const words = text
    .toLowerCase()
    .replace(NON_WORD, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));
  const firstSeen = new Map<string, number>();
  words.forEach((w, i) => {
    if (!firstSeen.has(w)) firstSeen.set(w, i);
  });
  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);
  const ranked = [...freq.keys()].sort((a, b) => {
    const diff = (freq.get(b) || 0) - (freq.get(a) || 0);
    if (diff !== 0) return diff;
    return (firstSeen.get(a) || 0) - (firstSeen.get(b) || 0);
  });
  return ranked.slice(0, max);
}

/**
 * Build 3-6 queries from a problem description:
 * the full statement, then adjacent keyword bigrams from the statement
 * ("cold email", "pitch deck" style phrases people actually use),
 * then single strongest keywords as recall fallbacks.
 */
export function buildQueries(problem: string): string[] {
  const keywords = extractKeywords(problem, 10);
  if (keywords.length === 0) return [];
  const queries: string[] = [problem.trim()];
  // Adjacent bigrams preserve the user's own word pairs, which match
  // better than frequency-sorted pairs ("seed take" style junk).
  const words = problem
    .toLowerCase()
    .replace(NON_WORD, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));
  const bigrams: string[] = [];
  for (let i = 0; i + 1 < words.length; i++) {
    const bg = `${words[i]} ${words[i + 1]}`;
    if (!bigrams.includes(bg)) bigrams.push(bg);
  }
  for (const bg of bigrams) {
    if (queries.length >= 4) break;
    queries.push(bg);
  }
  while (queries.length < 5 && keywords.length > 0) {
    const k = keywords.shift();
    if (k && !queries.includes(k)) queries.push(k);
  }
  queries.push(keywords[0] ?? queries[0]);
  // de-dup identical strings, cap at 6
  return [...new Set(queries)].slice(0, 6);
}

// ---------------------------------------------------------------------------
// Text utilities
// ---------------------------------------------------------------------------

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Pick the sentence with the densest concentration of problem keywords. */
export function pickMatchedQuote(
  text: string,
  terms: string[],
  maxLen = 320
): { quote: string; terms: string[] } {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim().length > 0);
  let best = { quote: "", terms: [] as string[], hits: 0, dens: -1 };
  for (const s of sentences) {
    const lower = s.toLowerCase();
    const hits = terms.filter((t) => lower.includes(t));
    if (hits.length === 0) continue;
    const dens = hits.length / Math.max(s.length, 1);
    if (hits.length > best.hits || (hits.length === best.hits && dens > best.dens)) {
      best = { quote: s.trim(), terms: hits, hits: hits.length, dens };
    }
  }
  if (best.quote.length > maxLen) {
    best.quote = best.quote.slice(0, maxLen - 1).replace(/\s\S*$/, "") + "…";
  }
  return { quote: best.quote, terms: best.terms };
}

// ---------------------------------------------------------------------------
// Scoring (explained, deterministic)
// ---------------------------------------------------------------------------

export type ScoreBreakdown = { keyword: number; recency: number; engagement: number };

export const HARD_MAX_AGE_DAYS = 365;

export function scoreThread(
  ageDays: number,
  engagement: number,
  termHits: string[],
  allTerms: string[]
): { score: number; parts: ScoreBreakdown; explanation: string } {
  // Keyword overlap (max 50): fraction of problem terms in title+body,
  // scaled 1.6x so matching 60%+ of terms tops out the component.
  const kw = allTerms.length === 0 ? 0 : termHits.length / allTerms.length;
  const keywordScore = Math.round(Math.min(1, kw * 1.6) * 50);
  // Recency (max 30): 30 days or fresher = full; linear decay to 0 at 90.
  let recencyScore = 0;
  if (ageDays <= 30) recencyScore = 30;
  else if (ageDays < 90)
    recencyScore = Math.round(30 * (1 - (ageDays - 30) / 60));
  // Engagement (max 20): log2 scale; 10 interactions ~= 17, 25+ tops out.
  const engagementScore = Math.round(
    Math.min(20, Math.log2(1 + engagement) * 5)
  );
  const score = Math.min(100, keywordScore + recencyScore + engagementScore);
  const explanation =
    `keyword ${termHits.length}/${allTerms.length} (${keywordScore}/50) + ` +
    `recency ${Math.round(ageDays)}d (${recencyScore}/30) + ` +
    `engagement ${engagement} (${engagementScore}/20)`;
  return {
    score,
    parts: { keyword: keywordScore, recency: recencyScore, engagement: engagementScore },
    explanation,
  };
}

// ---------------------------------------------------------------------------
// Normalizers (source JSON -> candidates)
// ---------------------------------------------------------------------------

export type RawCandidate = {
  source: ThreadSource;
  source_label: string;
  title: string;
  url: string;
  created_at_epoch: number; // seconds
  engagement: number;
  engagement_label: string;
  text: string; // title + body plain text
  body_text: string;
};

function daysBetween(nowMs: number, epochSeconds: number): number {
  return Math.max(0, Math.round((nowMs / 1000 - epochSeconds) / 86400));
}

export function normalizeHnHits(hits: unknown[]): RawCandidate[] {
  const out: RawCandidate[] = [];
  for (const h of hits) {
    const hit = h as Record<string, unknown>;
    const title = typeof hit.title === "string" ? hit.title : "";
    const storyText =
      typeof hit.story_text === "string" ? stripHtml(hit.story_text) : "";
    if (!title && !storyText) continue;
    const id = typeof hit.objectID === "string" ? hit.objectID : "";
    if (!id) continue;
    const comments =
      typeof hit.num_comments === "number" ? hit.num_comments : 0;
    const points = typeof hit.points === "number" ? hit.points : 0;
    out.push({
      source: "hn",
      source_label: "Hacker News",
      title,
      url: `https://news.ycombinator.com/item?id=${id}`,
      created_at_epoch:
        typeof hit.created_at_i === "number" ? hit.created_at_i : 0,
      engagement: comments * 2 + points,
      engagement_label: `${comments} comments, ${points} points`,
      text: `${title} ${storyText}`.trim(),
      body_text: storyText || title,
    });
  }
  return out;
}

export function normalizeRedditListing(children: unknown[]): RawCandidate[] {
  const out: RawCandidate[] = [];
  for (const c of children) {
    const data = ((c as Record<string, unknown>)?.data ??
      {}) as Record<string, unknown>;
    const title = typeof data.title === "string" ? data.title : "";
    const selftext =
      typeof data.selftext === "string" ? stripHtml(data.selftext) : "";
    const permalink = typeof data.permalink === "string" ? data.permalink : "";
    if (!title || !permalink) continue;
    const comments =
      typeof data.num_comments === "number" ? data.num_comments : 0;
    const score = typeof data.score === "number" ? data.score : 0;
    out.push({
      source: "reddit",
      source_label: `r/${typeof data.subreddit === "string" ? data.subreddit : "reddit"}`,
      title,
      url: `https://www.reddit.com${permalink}`,
      created_at_epoch:
        typeof data.created_utc === "number" ? data.created_utc : 0,
      engagement: comments * 2 + score,
      engagement_label: `${comments} comments, ${score} upvotes`,
      text: `${title} ${selftext}`.trim(),
      body_text: selftext || title,
    });
  }
  return out;
}

export function normalizeSeItems(items: unknown[]): RawCandidate[] {
  const out: RawCandidate[] = [];
  for (const it of items) {
    const item = it as Record<string, unknown>;
    const title = typeof item.title === "string" ? stripHtml(item.title) : "";
    const body = typeof item.body === "string" ? stripHtml(item.body) : "";
    const link = typeof item.link === "string" ? item.link : "";
    if (!title || !link) continue;
    const answers =
      typeof item.answer_count === "number" ? item.answer_count : 0;
    const score = typeof item.score === "number" ? item.score : 0;
    const views = typeof item.view_count === "number" ? item.view_count : 0;
    out.push({
      source: "stackexchange",
      source_label: "Stack Overflow",
      title,
      url: link,
      created_at_epoch:
        typeof item.creation_date === "number" ? item.creation_date : 0,
      engagement: answers * 3 + score + Math.min(10, Math.round(views / 500)),
      engagement_label: `${answers} answers, ${score} score, ${views} views`,
      text: `${title} ${body}`.trim(),
      body_text: body || title,
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Source fetchers (throw with an honest reason on failure)
// ---------------------------------------------------------------------------

const UA =
  "unlocksaas-thread-finder/1.0 (+https://unlocksaas.com; finds threads, never posts)";

async function fetchJson(url: string, fetchImpl: typeof fetch): Promise<unknown> {
  const res = await fetchImpl(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${new URL(url).host}`);
  return res.json();
}

const DAY = 86400;

export async function fetchHn(
  queries: string[],
  fetchImpl: typeof fetch,
  opts: { fromEpoch: number; hits: number }
): Promise<RawCandidate[]> {
  const all: RawCandidate[] = [];
  for (const q of queries.slice(0, 3)) {
    const url =
      `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(q)}` +
      `&tags=story&hitsPerPage=${opts.hits}` +
      `&numericFilters=created_at_i>${opts.fromEpoch}`;
    const json = (await fetchJson(url, fetchImpl)) as { hits?: unknown[] };
    all.push(...normalizeHnHits(json.hits ?? []));
  }
  return all;
}

export async function fetchReddit(
  queries: string[],
  fetchImpl: typeof fetch,
  opts: { limit: number }
): Promise<RawCandidate[]> {
  const all: RawCandidate[] = [];
  for (const q of queries.slice(0, 3)) {
    const url =
      `https://www.reddit.com/search.json?q=${encodeURIComponent(q)}` +
      `&limit=${opts.limit}&sort=new`;
    const json = (await fetchJson(url, fetchImpl)) as {
      data?: { children?: unknown[] };
    };
    all.push(...normalizeRedditListing(json.data?.children ?? []));
  }
  return all;
}

export async function fetchStackexchange(
  queries: string[],
  fetchImpl: typeof fetch,
  opts: { fromEpoch: number; pagesize: number }
): Promise<RawCandidate[]> {
  const all: RawCandidate[] = [];
  for (const q of queries.slice(0, 3)) {
    const url =
      `https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=creation` +
      `&site=stackoverflow&q=${encodeURIComponent(q)}` +
      `&pagesize=${opts.pagesize}&fromdate=${opts.fromEpoch}&filter=withbody`;
    const json = (await fetchJson(url, fetchImpl)) as { items?: unknown[] };
    all.push(...normalizeSeItems(json.items ?? []));
  }
  return all;
}

// ---------------------------------------------------------------------------
// Orchestration: fetch all sources, dedupe, score, rank, cache 1h
// ---------------------------------------------------------------------------

export type FinderInput = {
  problem: string;
  product?: string;
  maxAgeDays?: number; // default 90, hard cap 365
  limit?: number; // default 20
};

export type FindOptions = {
  fetchImpl?: typeof fetch;
  now?: () => number;
  /** skip reddit (e.g. known-blocked environment); still reported in manifest */
  disableReddit?: boolean;
};

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const cache = new Map<string, { at: number; result: FinderResult }>();

function cacheKey(input: FinderInput, maxAgeDays: number, limit: number): string {
  // problem is lowercased+normalized so trivial case changes hit cache
  const p = input.problem.trim().toLowerCase().replace(/\s+/g, " ");
  return `${p}|${maxAgeDays}|${limit}`;
}

export function clearFinderCache(): void {
  cache.clear();
}

export function normalizeCandidates(
  candidates: RawCandidate[],
  terms: string[],
  nowMs: number,
  maxAgeDays: number
): FoundThread[] {
  const seen = new Set<string>();
  const threads: FoundThread[] = [];
  for (const c of candidates) {
    if (seen.has(c.url)) continue;
    seen.add(c.url);
    const ageDays = daysBetween(nowMs, c.created_at_epoch);
    if (ageDays > maxAgeDays) continue;
    const lowerText = c.text.toLowerCase();
    const matched = terms.filter((t) => lowerText.includes(t));
    if (matched.length === 0) continue;
    const { score, explanation } = scoreThread(
      ageDays,
      c.engagement,
      matched,
      terms
    );
    const { quote, terms: quoteTerms } = pickMatchedQuote(c.text, terms);
    threads.push({
      source: c.source,
      source_label: c.source_label,
      title: c.title,
      url: c.url,
      created_at: new Date(c.created_at_epoch * 1000)
        .toISOString()
        .slice(0, 10),
      age_days: ageDays,
      engagement: c.engagement,
      engagement_label: c.engagement_label,
      score,
      score_explanation: explanation,
      matched_quote: quote || c.title,
      matched_terms: quoteTerms.length ? quoteTerms : matched,
      body_excerpt: c.body_text.slice(0, 280),
    });
  }
  threads.sort(
    (a, b) => b.score - a.score || a.age_days - b.age_days
  );
  return threads;
}

export async function findThreads(
  input: FinderInput,
  options: FindOptions = {}
): Promise<FinderResult> {
  const problem = input.problem.trim();
  if (problem.length < 10) {
    throw new Error("Describe the customer's problem in at least 10 characters.");
  }
  const maxAgeDays = Math.min(
    HARD_MAX_AGE_DAYS,
    Math.max(30, input.maxAgeDays ?? 90)
  );
  const limit = Math.max(1, Math.min(50, input.limit ?? 20));
  const key = cacheKey(input, maxAgeDays, limit);
  const cachedEntry = cache.get(key);
  const now = options.now ?? Date.now;
  if (cachedEntry && now() - cachedEntry.at < CACHE_TTL_MS) {
    return {
      ...cachedEntry.result,
      cached: true,
      cache_age_seconds: Math.round((now() - cachedEntry.at) / 1000),
    };
  }

  const queries = buildQueries(problem);
  if (queries.length === 0) {
    throw new Error("Could not extract any keywords from that description.");
  }
  const terms = [...new Set(extractKeywords(problem, 6))];
  const fetchImpl = options.fetchImpl ?? fetch;
  const fromEpoch = Math.floor(now() / 1000) - maxAgeDays * DAY;

  const sources: SourceStatus[] = [];
  const candidates: RawCandidate[] = [];

  // HN (queries 1-3)
  try {
    const hn = await fetchHn(queries, fetchImpl, { fromEpoch, hits: 30 });
    candidates.push(...hn);
    sources.push({
      source: "Hacker News (Algolia API)",
      ok: true,
      threads_fetched: hn.length,
      detail: `${Math.min(3, queries.length)} queries run.`,
    });
  } catch (e) {
    sources.push({
      source: "Hacker News (Algolia API)",
      ok: false,
      threads_fetched: 0,
      detail: `failed: ${e instanceof Error ? e.message : String(e)}`,
    });
  }

  // Reddit (often 403 from datacenter IPs)
  if (options.disableReddit !== true) {
    try {
      const rd = await fetchReddit(queries, fetchImpl, { limit: 25 });
      candidates.push(...rd);
      sources.push({
        source: "Reddit (public JSON)",
        ok: true,
        threads_fetched: rd.length,
        detail: `${Math.min(3, queries.length)} queries run.`,
      });
    } catch (e) {
      sources.push({
        source: "Reddit (public JSON)",
        ok: false,
        threads_fetched: 0,
        detail: `failed: ${e instanceof Error ? e.message : String(e)} (Reddit blocks many servers; noted honestly, not faked)`,
      });
    }
  } else {
    sources.push({
      source: "Reddit (public JSON)",
      ok: false,
      threads_fetched: 0,
      detail: "skipped by request.",
    });
  }

  // Stack Overflow
  try {
    const se = await fetchStackexchange(queries, fetchImpl, {
      fromEpoch,
      pagesize: 30,
    });
    candidates.push(...se);
    sources.push({
      source: "Stack Overflow (Stack Exchange API)",
      ok: true,
      threads_fetched: se.length,
      detail: `${Math.min(3, queries.length)} queries run.`,
    });
  } catch (e) {
    sources.push({
      source: "Stack Overflow (Stack Exchange API)",
      ok: false,
      threads_fetched: 0,
      detail: `failed: ${e instanceof Error ? e.message : String(e)}`,
    });
  }

  sources.push({
    source: "Indie Hackers",
    ok: false,
    threads_fetched: 0,
    detail: "not searched: no free public API (GraphQL requires an account token).",
  });

  const threads = normalizeCandidates(candidates, terms, now(), maxAgeDays).slice(
    0,
    limit
  );

  const result: FinderResult = {
    problem,
    product: (input.product ?? "").trim(),
    generated_queries: queries,
    threads,
    total_fetched: candidates.length,
    sources,
    cached: false,
    generated_at: new Date(now()).toISOString(),
  };
  cache.set(key, { at: now(), result });
  return result;
}
