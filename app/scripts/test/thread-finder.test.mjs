/**
 * Thread finder unit tests (run in prebuild).
 *
 * HN + Stack Exchange fixtures are RECORDED live API responses
 * (scripts/test/fixtures/thread-finder/*.json, recorded 2026-11-03).
 * The Reddit fixture is a minimal shape sample (Reddit's public JSON is
 * 403-blocked from datacenter IPs, including the box that records
 * fixtures); it exists to test the parser, and every test that uses it
 * says so. No test asserts Reddit availability.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const APP_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const FIXTURES = resolve(APP_ROOT, "scripts/test/fixtures/thread-finder");

function fixture(name) {
  return JSON.parse(readFileSync(resolve(FIXTURES, name), "utf8"));
}

// The lib is plain TypeScript with no imports outside node builtins, so we
// transpile it on the fly (same approach as other offline tests here).
const { createRequire } = await import("node:module");
const require = createRequire(import.meta.url);
const ts = require("typescript");
const libSource = readFileSync(
  resolve(APP_ROOT, "src/lib/thread-finder.ts"),
  "utf8"
);
const js = ts.transpileModule(libSource, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const libUrl =
  "data:text/javascript;base64," + Buffer.from(js).toString("base64");
const lib = await import(libUrl);

const {
  extractKeywords,
  buildQueries,
  stripHtml,
  pickMatchedQuote,
  scoreThread,
  normalizeHnHits,
  normalizeRedditListing,
  normalizeSeItems,
  normalizeCandidates,
  findThreads,
  clearFinderCache,
} = lib;

// ---------------------------------------------------------------------------
// Query building
// ---------------------------------------------------------------------------

test("extractKeywords drops stopwords and keeps topical words", () => {
  const kw = extractKeywords(
    "Founders cannot find where their potential customers are talking about their problem online"
  );
  assert.ok(kw.includes("customers"));
  assert.ok(!kw.includes("the"), "stopwords removed");
  assert.ok(!kw.includes("their"));
  assert.ok(kw.length <= 8);
});

test("buildQueries returns 3-6 queries including the full problem", () => {
  const qs = buildQueries(
    "I cannot find inbound leads for my SaaS, CAC is too high"
  );
  assert.ok(qs.length >= 3 && qs.length <= 6, `got ${qs.length}`);
  assert.equal(qs[0], "I cannot find inbound leads for my SaaS, CAC is too high");
  const uniq = new Set(qs);
  assert.equal(uniq.size, qs.length, "no duplicate queries");
});

test("buildQueries on stopword-only input returns empty", () => {
  assert.deepEqual(buildQueries("the a of and to"), []);
});

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

test("scoreThread: fresh + matching + engaged thread outscores old quiet one", () => {
  const fresh = scoreThread(10, 40, ["churn", "saas", "retain"], [
    "churn",
    "saas",
    "retain",
  ]);
  const old = scoreThread(200, 0, ["churn"], ["churn", "saas", "retain"]);
  assert.ok(fresh.score > old.score);
  assert.ok(fresh.score <= 100);
  assert.match(fresh.explanation, /keyword 3\/3/);
  assert.match(old.explanation, /recency 200d \(0\/30\)/);
});

test("scoreThread: recency decays linearly between 30 and 90 days", () => {
  const d60 = scoreThread(60, 0, [], []).parts.recency;
  const d30 = scoreThread(30, 0, [], []).parts.recency;
  const d89 = scoreThread(89, 0, [], []).parts.recency;
  assert.equal(d30, 30);
  assert.equal(d60, 15, "60d should be exactly half");
  assert.ok(d89 < 5, "89d should be near 0");
});

// ---------------------------------------------------------------------------
// Quote picking
// ---------------------------------------------------------------------------

test("pickMatchedQuote picks the sentence with the problem words", () => {
  const text =
    "We launched three months ago. Our biggest problem is customer churn after the first invoice. The UI is fine.";
  const { quote, terms } = pickMatchedQuote(text, ["churn", "invoice"]);
  assert.match(quote, /customer churn after the first invoice/);
  assert.deepEqual([...terms].sort(), ["churn", "invoice"]);
});

test("stripHtml unescapes entities and drops tags", () => {
  const out = stripHtml("<p>churn &amp; retention &gt; everything</p>");
  assert.equal(out, "churn & retention > everything");
});

// ---------------------------------------------------------------------------
// Normalizers against RECORDED fixtures
// ---------------------------------------------------------------------------

test("normalizeHnHits parses the recorded Algolia fixture", () => {
  const fx = fixture("hn-churn.json");
  const out = normalizeHnHits(fx.hits);
  assert.ok(out.length > 0, "fixture should contain stories");
  for (const c of out) {
    assert.equal(c.source, "hn");
    assert.match(c.url, /^https:\/\/news\.ycombinator\.com\/item\?id=\d+$/);
    assert.ok(c.created_at_epoch > 0);
    assert.ok(typeof c.engagement === "number");
  }
});

test("normalizeSeItems parses the recorded Stack Exchange fixture", () => {
  const fx = fixture("se-churn.json");
  const out = normalizeSeItems(fx.items);
  assert.ok(out.length > 0, "fixture should contain questions");
  for (const c of out) {
    assert.equal(c.source, "stackexchange");
    assert.match(c.url, /^https:\/\/stackoverflow\.com\/questions\/\d+\//);
    assert.ok(!/<[a-z]+>/.test(c.title), "title must be plain text");
  }
});

test("normalizeRedditListing parses the shape fixture (parser test only)", () => {
  const fx = fixture("reddit-shape.json");
  const out = normalizeRedditListing(fx.data.children);
  assert.equal(out.length, 2);
  assert.equal(out[0].source, "reddit");
  assert.equal(out[0].source_label, "r/SaaS");
  assert.match(out[0].url, /^https:\/\/www\.reddit\.com\/r\/SaaS\/comments\//);
  assert.equal(out[1].source_label, "r/startups");
});

// ---------------------------------------------------------------------------
// End-to-end findThreads with an injected fetch (fixtures + honest failure)
// ---------------------------------------------------------------------------

/** Serve fixture files by URL substring; 403 for anything unmapped (like Reddit here). */
function fixtureFetch(map) {
  return async (input) => {
    const url = String(input);
    for (const [needle, file] of Object.entries(map)) {
      if (url.includes(needle)) {
        const body = readFileSync(resolve(FIXTURES, file), "utf8");
        return new Response(body, { status: 200 });
      }
    }
    return new Response("blocked", { status: 403 });
  };
}

test("findThreads: dedupes, scores, ranks, and reports a blocked source honestly", async () => {
  clearFinderCache();
  const now = Date.parse("2026-11-03T10:00:00Z");
  const result = await findThreads(
    {
      problem: "customer churn is killing my SaaS revenue, how do I retain users",
      product: "ChurnLens",
      limit: 10,
    },
    {
      fetchImpl: fixtureFetch({
        "hn.algolia.com": "hn-churn.json",
        "api.stackexchange.com": "se-churn.json",
        // reddit.com not mapped -> 403, exactly like real datacenter IPs
      }),
      now: () => now,
    }
  );
  assert.equal(result.cached, false);
  assert.ok(result.generated_queries.length >= 3);
  assert.ok(result.threads.length > 0, "should find threads from HN+SE fixtures");

  const reddit = result.sources.find((s) => s.source.startsWith("Reddit"));
  assert.ok(reddit, "reddit status present");
  assert.equal(reddit.ok, false, "reddit failure reported honestly");
  assert.match(reddit.detail ?? "", /403/);

  const hn = result.sources.find((s) => s.source.startsWith("Hacker News"));
  assert.equal(hn.ok, true);

  for (let i = 1; i < result.threads.length; i++) {
    assert.ok(
      result.threads[i - 1].score >= result.threads[i].score,
      "sorted by score"
    );
  }
  for (const t of result.threads) {
    assert.ok(t.score >= 0 && t.score <= 100);
    assert.ok(t.matched_quote.length > 0, "every thread has a quote");
    assert.match(t.score_explanation, /keyword \d+\/\d+/);
    assert.match(t.score_explanation, /recency \d+d/);
    assert.ok(t.url.startsWith("https://"), "real link");
  }
  const urls = new Set(result.threads.map((t) => t.url));
  assert.equal(urls.size, result.threads.length, "no duplicate URLs");
});

test("findThreads: serves the second identical call from the 1h cache", async () => {
  clearFinderCache();
  const now = Date.parse("2026-11-03T10:00:00Z");
  const opts = {
    fetchImpl: fixtureFetch({ "hn.algolia.com": "hn-churn.json" }),
    now: () => now,
  };
  const input = {
    problem: "customer churn is killing my SaaS revenue, how do I retain users",
  };
  const first = await findThreads(input, opts);
  assert.equal(first.cached, false);
  const second = await findThreads(input, opts);
  assert.equal(second.cached, true);
  assert.equal(second.threads.length, first.threads.length);
  assert.equal(second.cache_age_seconds ?? 0, 0);
  // after 61 minutes the cache is stale
  const later = await findThreads(input, {
    ...opts,
    now: () => now + 61 * 60_000,
  });
  assert.equal(later.cached, false);
});

test("findThreads: rejects too-short problems", async () => {
  await assert.rejects(
    findThreads(
      { problem: "churn" },
      { fetchImpl: fixtureFetch({}), now: () => Date.now() }
    ),
    /at least 10 characters/
  );
});

test("findThreads: hard-caps thread age at 365 days even if asked for more", async () => {
  clearFinderCache();
  const now = Date.parse("2026-11-03T10:00:00Z");
  const result = await findThreads(
    {
      problem: "customer churn is killing my SaaS revenue retention",
      maxAgeDays: 4000,
    },
    {
      fetchImpl: fixtureFetch({ "hn.algolia.com": "hn-churn.json" }),
      now: () => now,
    }
  );
  for (const t of result.threads) {
    assert.ok(t.age_days <= 365, `thread too old: ${t.age_days}d`);
  }
});

test("normalizeCandidates drops threads with zero keyword matches", () => {
  const cand = normalizeHnHits(fixture("hn-churn.json").hits);
  const terms = ["kubernetes", "kubectl"];
  const out = normalizeCandidates(cand, terms, Date.now(), 365);
  // fixture is about churn, not kubernetes: nothing should survive
  assert.equal(out.length, 0);
});
