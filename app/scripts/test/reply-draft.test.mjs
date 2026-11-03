/**
 * Reply-draft scaffold tests (pivot phase 3, run in prebuild).
 *
 * Guards the value-first rules from the approved pivot brief:
 *  - draft opens with an ANSWER, not a pitch
 *  - always discloses affiliation
 *  - NEVER contains a link (http/https) to the product — no link unless asked
 *  - quotes the thread's own words (mirrors the problem)
 *  - source guidance links the right self-promotion rules per platform
 *
 * Run via the same transpile-on-the-fly pattern as thread-finder.test.mjs.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const APP_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

const { createRequire } = await import("node:module");
const require = createRequire(import.meta.url);
const ts = require("typescript");

function loadLib(rel) {
  const src = readFileSync(resolve(APP_ROOT, rel), "utf8");
  const js = ts.transpileModule(src, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const url =
    "data:text/javascript;base64," + Buffer.from(js).toString("base64");
  return import(url);
}

const draft = await loadLib("src/lib/reply-draft.ts");
const { buildReplyDraft, sourceGuidance } = draft;

// A realistic FoundThread (shape matches src/lib/thread-finder.ts).
const thread = {
  source: "reddit",
  source_label: "r/SaaS",
  title: "How do you prove ROI to retainer clients?",
  url: "https://www.reddit.com/r/SaaS/comments/abc123/prove_roi/",
  created_at: "2026-10-28",
  age_days: 6,
  engagement: 24,
  engagement_label: "8 comments, 8 upvotes",
  score: 81,
  score_explanation: "keyword 4/5 (32/50) + recency 6d (30/30) + engagement 24 (19/20)",
  matched_quote:
    "Clients cancel after three months because we never show them the numbers.",
  matched_terms: ["clients", "retainer", "cancel", "roi"],
  body_excerpt: "We do the work but the client never sees the impact.",
};

const problem =
  "Small agency owners struggle to prove ROI on retainer work, so clients cancel after 3 months";

test("draft opens with an answer, not a pitch", () => {
  const d = buildReplyDraft(thread, problem, "RetainerProof");
  const firstLine = d.split("\n")[0].toLowerCase();
  assert.match(firstLine, /answer/);
  assert.doesNotMatch(firstLine, /retainerproof/);
});

test("draft quotes the thread's own words", () => {
  const d = buildReplyDraft(thread, problem, "RetainerProof");
  assert.match(d, /Clients cancel after three months/);
  // the mirror of the founder's problem description is in the draft
  assert.match(d, /prove roi on retainer work/);
});

test("draft ALWAYS discloses affiliation with the product", () => {
  for (const product of ["RetainerProof", "", undefined]) {
    const d = buildReplyDraft(thread, problem, product);
    assert.match(d, /Disclosure: I am building/);
  }
});

test("draft contains NO links (no link unless asked)", () => {
  const d = buildReplyDraft(thread, problem, "RetainerProof");
  assert.doesNotMatch(d, /https?:\/\//);
  assert.doesNotMatch(d, /www\./);
});

test("draft says the founder posts it, with placeholders to edit", () => {
  const d = buildReplyDraft(thread, problem, "RetainerProof");
  assert.match(d, /\[/);
  assert.match(d, /Not linking it here/);
});

test("reddit guidance links the subreddit rules", () => {
  const g = sourceGuidance(thread);
  assert.equal(g.rules_url, "https://www.reddit.com/r/SaaS/about/rules/");
  assert.ok(g.notes.length >= 2);
});

test("stackexchange guidance links the promotion policy", () => {
  const g = sourceGuidance({ ...thread, source: "stackexchange", source_label: "Stack Overflow" });
  assert.equal(g.rules_url, "https://stackoverflow.com/help/promotion");
});

test("HN guidance has no subreddit link but does have HN help", () => {
  const g = sourceGuidance({ ...thread, source: "hn", source_label: "Hacker News" });
  assert.equal(g.rules_url, "https://news.ycombinator.com/help");
});

test("long quotes are trimmed without breaking words", () => {
  const long = { ...thread, matched_quote: "x".repeat(400) + " wordend" };
  const d = buildReplyDraft(long, problem, "P");
  const line = d.split("\n").find((l) => l.startsWith("You wrote:"));
  const quoted = line.slice('You wrote: "'.length, line.indexOf('" —'));
  assert.ok(quoted.length <= 225, `quoted portion should be trimmed, got ${quoted.length}`);
  assert.match(quoted, /…$/);
});

// ---------------------------------------------------------------------------
// UI honesty guards: the /find page and results page must keep their promises
// ---------------------------------------------------------------------------

test("/find page states the tool never posts", () => {
  const page = readFileSync(resolve(APP_ROOT, "src/app/find/page.tsx"), "utf8");
  assert.match(page, /never\s+posts/i);
  assert.match(page, /post yourself|you post them/i);
});

test("/find page links each thread's self-promo rules", () => {
  const tool = readFileSync(
    resolve(APP_ROOT, "src/components/find/find-tool.tsx"),
    "utf8"
  );
  assert.match(tool, /about\/rules/);
  assert.match(tool, /stackoverflow\.com\/help\/promotion/);
});

test("/find/results page makes NO outcome claims we cannot source", () => {
  const page = readFileSync(
    resolve(APP_ROOT, "src/app/find/results/page.tsx"),
    "utf8"
  );
  // The honest-testing statement required by the brief.
  assert.match(page, /we are testing it on our own products, results here as they come/i);
  // No invented outcome phrasing.
  assert.doesNotMatch(page, /\d+ (customers|signups|sales)/i);
  assert.doesNotMatch(page, /case stud(y|ies) (from|of) (our )?customers/i);
});

test("homepage hero leads to /find", () => {
  const home = readFileSync(resolve(APP_ROOT, "src/app/page.tsx"), "utf8");
  assert.match(home, /href="\/find"/);
});
