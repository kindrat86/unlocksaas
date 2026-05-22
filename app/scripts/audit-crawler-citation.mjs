#!/usr/bin/env node
// @ts-check

/**
 * Crawler citation audit (2026-05-22).
 *
 * Confirms that the marketing surface renders FULL content without JavaScript
 * for every AI-citation / AI-search / indie-search user-agent that we allow
 * in robots.ts. The goal is to catch React-hydration-dependent content that
 * is invisible to crawlers — a single empty `<div id="__next">` or a Suspense
 * boundary that resolves only on the client means zero citations from
 * Perplexity, ChatGPT, Claude, AI Overviews, etc.
 *
 * What is checked per (URL × user-agent) combination:
 *
 *   1. HTTP 200 (or 304 with valid cache).
 *   2. Content-Type is text/html with a declared charset.
 *   3. <title> tag is non-empty and not the default fallback.
 *   4. <meta name="description"> non-empty.
 *   5. At least one <h1> on the page.
 *   6. Body text length ≥ MIN_BODY_TEXT (substantive SSR content, not a shell).
 *   7. At least one <script type="application/ld+json"> block.
 *   8. <link rel="canonical"> present.
 *   9. At least one Open Graph image meta.
 *  10. At least one hreflang alternate (or self-reference) tag.
 *  11. No empty-shell signature: `<main>` element must contain text, NOT just
 *      an empty div or a single `<noscript>` "please enable JS" message.
 *  12. NO noscript-required content: if the only substantive text is INSIDE a
 *      <noscript> tag, the page fails (means JS-on users see nothing).
 *
 * The user-agent list mirrors AI_SEARCH_ANSWER_USER_AGENTS + a sample of
 * INDIE_SEARCH_USER_AGENTS from app/src/app/robots.ts. We do NOT test the
 * AI_TRAINING_BLOCK_USER_AGENTS because they are intentionally disallowed
 * and a 200 response from them would be the bug, not a fix.
 *
 * Exits with code 0 on clean, 1 on any failure. Output names the URL and
 * user-agent so the failing combo is reproducible:
 *
 *   curl -A 'PerplexityBot' https://unlocksaas.com/glossary/hook
 *
 * Usage:
 *   node scripts/audit-crawler-citation.mjs
 *   AUDIT_BASE_URL=https://unlocksaas.com node scripts/audit-crawler-citation.mjs
 *   AUDIT_REPORT_FILE=../strategy/audits/2026-05-22-crawler-citation.md \
 *     node scripts/audit-crawler-citation.mjs
 *
 * Env vars:
 *   AUDIT_BASE_URL              — default http://localhost:3000
 *   AUDIT_REPORT_FILE           — optional markdown output path
 *   AUDIT_FETCH_TIMEOUT_MS      — default 30000
 *   AUDIT_CONCURRENCY           — default 4 (parallel fetches)
 *   AUDIT_MIN_BODY_TEXT         — default 800 chars
 *   AUDIT_USER_AGENT_FILTER     — comma-separated subset to test
 *
 * Why this validator and not a hosted service?
 *   Google's Mobile-Friendly Test + Rich Results Test only emulate Googlebot
 *   and do not let us spoof PerplexityBot / ClaudeBot / OAI-SearchBot etc.
 *   We need to verify each citation bot independently because Next.js can
 *   serve different responses per UA (e.g. via middleware UA-sniffing), and
 *   because a hydration bug in a Server Component can silently render an
 *   empty shell to a SSR-only crawler while the browser fills it in.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const BASE_URL = (process.env.AUDIT_BASE_URL || "http://localhost:3000").replace(
  /\/+$/,
  ""
);
const REPORT_FILE = process.env.AUDIT_REPORT_FILE || "";
const FETCH_TIMEOUT_MS = Number.parseInt(
  process.env.AUDIT_FETCH_TIMEOUT_MS || "30000",
  10
);
const CONCURRENCY = Math.max(
  1,
  Number.parseInt(process.env.AUDIT_CONCURRENCY || "4", 10)
);
const MIN_BODY_TEXT = Math.max(
  100,
  Number.parseInt(process.env.AUDIT_MIN_BODY_TEXT || "800", 10)
);
const USER_AGENT_FILTER = (process.env.AUDIT_USER_AGENT_FILTER || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/* eslint-disable no-console */

/**
 * Representative URL set: one per pSEO template + every authority page +
 * every machine-readable surface. Slugs are real, verified-live ones from
 * the relevant manifest so the page renders with full data (not a 404).
 *
 * Kept in sync with the URL set in validate-jsonld.mjs; if you add a new
 * hub template, add a representative slug to BOTH files.
 */
const URLS = [
  // ── Authority surface ───────────────────────────────────────────────
  "/",
  "/about",
  "/faq",
  "/press",
  "/editorial-policy",
  "/founding",
  "/stories",
  "/dont-buy-unlock-saas",

  // ── Core funnels (only public ones; checkout/onboarding are blocked) ─
  "/diagnostic",
  "/playbook-sales",
  "/starter",

  // ── pSEO hubs ───────────────────────────────────────────────────────
  "/glossary",
  "/alternatives-to",
  "/compare",
  "/funnel-teardown",
  "/pricing-teardown",
  "/category",
  "/for",
  "/stack-for",
  "/benchmarks",
  "/funnel-playbook",
  "/answers",
  "/why-isnt-my",
  "/press/topics",

  // ── pSEO detail samples (one per cluster) ──────────────────────────
  "/glossary/hook",
  "/benchmarks/landing-page-conversion-rate",
  "/stack-for/saas-founders",

  // ── GEO / AIO surfaces ─────────────────────────────────────────────
  "/state-of-saas",
  "/four-indie-search-engines",
  "/dataset",
  "/podcast",

  // ── Locales (sample) ───────────────────────────────────────────────
  "/es/faq",
  "/pt-BR/faq",
];

/**
 * AI-search / answer-engine user-agents that we explicitly ALLOW in robots.ts.
 * Each one is required to receive substantive, non-JS-dependent HTML.
 * Source of truth: AI_SEARCH_ANSWER_USER_AGENTS in app/src/app/robots.ts.
 */
const AI_SEARCH_USER_AGENTS = [
  // OpenAI -- ChatGPT browsing + search-surface.
  { name: "OAI-SearchBot", ua: "Mozilla/5.0 (compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot)" },
  { name: "ChatGPT-User", ua: "Mozilla/5.0 (compatible; ChatGPT-User/1.0; +https://openai.com/bot)" },
  // Anthropic -- Claude retrieval + web search + real-time fetch.
  { name: "ClaudeBot", ua: "Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)" },
  { name: "Claude-SearchBot", ua: "Mozilla/5.0 (compatible; Claude-SearchBot/1.0; +claudebot@anthropic.com)" },
  { name: "Claude-Web", ua: "Mozilla/5.0 (compatible; Claude-Web/1.0; +claudebot@anthropic.com)" },
  { name: "Claude-User", ua: "Mozilla/5.0 (compatible; Claude-User/1.0; +claudebot@anthropic.com)" },
  { name: "anthropic-ai", ua: "anthropic-ai" },
  // Google -- AI Overviews fetch + Gemini inference.
  { name: "GoogleOther", ua: "Mozilla/5.0 (compatible; GoogleOther)" },
  // Perplexity -- answer engine with live citations.
  { name: "PerplexityBot", ua: "Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://www.perplexity.ai/perplexitybot)" },
  { name: "Perplexity-User", ua: "Mozilla/5.0 (compatible; Perplexity-User/1.0; +https://www.perplexity.ai/perplexity-user)" },
  // Apple Intelligence / Spotlight web index.
  { name: "Applebot", ua: "Mozilla/5.0 (compatible; Applebot/0.1; +http://www.apple.com/go/applebot)" },
  // DuckDuckGo AI Assist.
  { name: "DuckAssistBot", ua: "Mozilla/5.0 (compatible; DuckAssistBot/1.0; +https://duckduckgo.com/duckassistbot)" },
  // Mistral inference.
  { name: "MistralAI-User", ua: "MistralAI-User/1.0" },
  // You.com answer engine.
  { name: "YouBot", ua: "Mozilla/5.0 (compatible; YouBot; +http://www.you.com/youbot.html)" },
  // Cohere inference (not the training crawler).
  { name: "cohere-ai", ua: "cohere-ai" },
];

/**
 * Indie-search sample. We don't need every entry here -- just enough to
 * confirm the allow-list pipe works end-to-end for non-AI crawlers too.
 */
const INDIE_SEARCH_USER_AGENTS = [
  { name: "Bravebot", ua: "Mozilla/5.0 (compatible; Bravebot/1.0; +https://search.brave.com/help/brave-search-crawler)" },
  { name: "MojeekBot", ua: "Mozilla/5.0 (compatible; MojeekBot/0.11; +https://www.mojeek.com/bot.html)" },
  { name: "Kagibot", ua: "Mozilla/5.0 (compatible; Kagibot/1.0; +https://kagi.com/bot)" },
];

/**
 * Baseline modern-browser UA, included so we can compare "what real users
 * see" vs "what each bot sees". A divergence between the two on any check
 * is a citable bug.
 */
const BROWSER_BASELINE = {
  name: "Chrome/Browser-Baseline",
  ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
};

/** @type {{name: string, ua: string}[]} */
const ALL_AGENTS = [
  BROWSER_BASELINE,
  ...AI_SEARCH_USER_AGENTS,
  ...INDIE_SEARCH_USER_AGENTS,
];

const AGENTS =
  USER_AGENT_FILTER.length > 0
    ? ALL_AGENTS.filter((a) => USER_AGENT_FILTER.includes(a.name))
    : ALL_AGENTS;

/**
 * @typedef {Object} Check
 * @property {string} id
 * @property {boolean} pass
 * @property {string} [detail]
 */

/**
 * @typedef {Object} Result
 * @property {string} url
 * @property {string} agent
 * @property {number} status
 * @property {number} bytes
 * @property {number} elapsedMs
 * @property {Check[]} checks
 * @property {boolean} ok
 * @property {string} [error]
 */

/**
 * Extract the rendered text content of <main> if present, else <body>.
 * Strips <script>, <style>, <template>, <noscript>, and HTML tags.
 *
 * @param {string} html
 * @returns {{ main: string, noscript: string, body: string }}
 */
function extractText(html) {
  // Strip script/style/template blocks first.
  const stripped = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<template\b[^>]*>[\s\S]*?<\/template>/gi, " ");

  // Extract noscript content separately so we can detect noscript-only pages.
  const noscriptMatches = [...stripped.matchAll(/<noscript\b[^>]*>([\s\S]*?)<\/noscript>/gi)];
  const noscriptText = noscriptMatches
    .map((m) => m[1].replace(/<[^>]*>/g, " "))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  // Remove noscript blocks from the body extraction.
  const withoutNoscript = stripped.replace(
    /<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi,
    " "
  );

  // Prefer <main>; fall back to <body>.
  const mainMatch = withoutNoscript.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  const bodyMatch = withoutNoscript.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  const source = mainMatch ? mainMatch[1] : bodyMatch ? bodyMatch[1] : withoutNoscript;

  const text = source
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const bodyText = (bodyMatch ? bodyMatch[1] : withoutNoscript)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return { main: text, noscript: noscriptText, body: bodyText };
}

/**
 * @param {string} html
 * @param {string} re
 * @returns {string | null}
 */
function firstMatchGroup(html, re) {
  const m = html.match(new RegExp(re, "i"));
  return m ? m[1] : null;
}

/**
 * Build a check-list for a single (url, agent, html, status) tuple.
 *
 * @param {string} html
 * @param {number} status
 * @param {string | null} contentType
 * @returns {Check[]}
 */
function runChecks(html, status, contentType) {
  /** @type {Check[]} */
  const checks = [];

  // 1. HTTP 200
  checks.push({
    id: "http-200",
    pass: status === 200,
    detail: status === 200 ? undefined : `status=${status}`,
  });

  // 2. Content-Type: text/html with charset
  const ctOk = !!contentType && /text\/html/i.test(contentType);
  const charsetOk = !!contentType && /charset=/i.test(contentType);
  checks.push({
    id: "content-type-html",
    pass: ctOk,
    detail: ctOk ? undefined : `content-type=${contentType ?? "<missing>"}`,
  });
  checks.push({
    id: "content-type-charset",
    pass: charsetOk,
    detail: charsetOk ? undefined : `content-type=${contentType ?? "<missing>"}`,
  });

  // Only run the body-content checks if we got HTML at all.
  if (!ctOk || status !== 200) {
    return checks;
  }

  // 3. <title>
  const title = firstMatchGroup(html, "<title[^>]*>([^<]+)</title>");
  const titleOk = !!(title && title.trim().length > 0);
  checks.push({
    id: "title-nonempty",
    pass: titleOk,
    detail: titleOk ? `title="${title?.slice(0, 60)}"` : "no <title>",
  });

  // 4. <meta name="description">
  const metaDesc = firstMatchGroup(
    html,
    '<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']+)["\']'
  );
  const metaDescOk = !!(metaDesc && metaDesc.trim().length > 20);
  checks.push({
    id: "meta-description",
    pass: metaDescOk,
    detail: metaDescOk ? undefined : `description="${metaDesc?.slice(0, 80) ?? "<missing>"}"`,
  });

  // 5. <h1>
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  checks.push({
    id: "h1-present",
    pass: h1Count > 0,
    detail: `h1-count=${h1Count}`,
  });

  // 6. Body text length
  const { main, noscript, body } = extractText(html);
  const textLen = main.length;
  checks.push({
    id: "body-text-substantive",
    pass: textLen >= MIN_BODY_TEXT,
    detail: `main-text-chars=${textLen} (min=${MIN_BODY_TEXT})`,
  });

  // 7. JSON-LD
  const ldBlocks = (
    html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>/gi) || []
  ).length;
  checks.push({
    id: "json-ld-present",
    pass: ldBlocks > 0,
    detail: `ld-blocks=${ldBlocks}`,
  });

  // 8. Canonical
  const canonical = firstMatchGroup(
    html,
    '<link[^>]+rel=["\']canonical["\'][^>]+href=["\']([^"\']+)["\']'
  );
  checks.push({
    id: "canonical-present",
    pass: !!canonical,
    detail: canonical ? `canonical=${canonical}` : "no canonical link",
  });

  // 9. OG image
  const ogImage = firstMatchGroup(
    html,
    '<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']'
  );
  checks.push({
    id: "og-image-present",
    pass: !!ogImage,
    detail: ogImage ? `og:image=${ogImage}` : "no og:image",
  });

  // 10. hreflang (self-reference at minimum)
  const hreflangCount = (
    html.match(/<link[^>]+rel=["']alternate["'][^>]+hreflang=/gi) || []
  ).length;
  checks.push({
    id: "hreflang-present",
    pass: hreflangCount > 0,
    detail: `hreflang-count=${hreflangCount}`,
  });

  // 11. Empty-shell signature — <main> has substantive text, not just an
  // empty React mount point or skeleton placeholder.
  const shellSignature =
    /<main\b[^>]*>\s*(<div[^>]*>\s*<\/div>\s*)?\s*<\/main>/i.test(html) ||
    /<div\s+id=["']__next["']\s*>\s*<\/div>/i.test(html);
  checks.push({
    id: "no-empty-shell",
    pass: !shellSignature && main.length > 0,
    detail: shellSignature
      ? "empty <main> or <div id=__next> detected"
      : `main-text-chars=${main.length}`,
  });

  // 12. NOT noscript-required — substantive text must live OUTSIDE <noscript>.
  // A page is noscript-required if <noscript> text is the bulk of the page.
  const noscriptDominates =
    noscript.length > 200 && noscript.length > body.length * 0.5;
  checks.push({
    id: "not-noscript-required",
    pass: !noscriptDominates,
    detail: noscriptDominates
      ? `noscript-chars=${noscript.length} dominates body-chars=${body.length}`
      : `noscript-chars=${noscript.length}`,
  });

  return checks;
}

/**
 * @param {string} url
 * @param {{name: string, ua: string}} agent
 * @returns {Promise<Result>}
 */
async function audit(url, agent) {
  const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;
  const started = Date.now();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(fullUrl, {
      headers: {
        "User-Agent": agent.ua,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: controller.signal,
      redirect: "follow",
    });
    const html = await res.text();
    const elapsedMs = Date.now() - started;
    const contentType = res.headers.get("content-type");
    const checks = runChecks(html, res.status, contentType);
    const ok = checks.every((c) => c.pass);
    return {
      url,
      agent: agent.name,
      status: res.status,
      bytes: html.length,
      elapsedMs,
      checks,
      ok,
    };
  } catch (err) {
    const elapsedMs = Date.now() - started;
    return {
      url,
      agent: agent.name,
      status: 0,
      bytes: 0,
      elapsedMs,
      checks: [],
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Simple p-limit replacement (no extra deps).
 * @template T
 * @param {number} n
 * @param {Array<() => Promise<T>>} tasks
 * @returns {Promise<T[]>}
 */
async function runLimited(n, tasks) {
  /** @type {T[]} */
  const out = new Array(tasks.length);
  let i = 0;
  async function worker() {
    while (i < tasks.length) {
      const idx = i++;
      out[idx] = await tasks[idx]();
    }
  }
  await Promise.all(Array.from({ length: Math.min(n, tasks.length) }, worker));
  return out;
}

/**
 * @param {Result[]} results
 * @returns {string}
 */
function renderMarkdown(results) {
  const now = new Date().toISOString();
  const total = results.length;
  const passed = results.filter((r) => r.ok).length;
  const failed = total - passed;

  const byAgent = /** @type {Record<string, { pass: number, fail: number }>} */ ({});
  for (const r of results) {
    byAgent[r.agent] ??= { pass: 0, fail: 0 };
    if (r.ok) byAgent[r.agent].pass++;
    else byAgent[r.agent].fail++;
  }

  const byUrl = /** @type {Record<string, { pass: number, fail: number }>} */ ({});
  for (const r of results) {
    byUrl[r.url] ??= { pass: 0, fail: 0 };
    if (r.ok) byUrl[r.url].pass++;
    else byUrl[r.url].fail++;
  }

  const lines = [];
  lines.push(`# Crawler Citation Audit`);
  lines.push(``);
  lines.push(`**Generated:** ${now}`);
  lines.push(`**Base URL:** \`${BASE_URL}\``);
  lines.push(`**Total combinations:** ${total} (${URLS.length} URLs × ${AGENTS.length} user-agents)`);
  lines.push(`**Passed:** ${passed}`);
  lines.push(`**Failed:** ${failed}`);
  lines.push(``);

  lines.push(`## Summary by user-agent`);
  lines.push(``);
  lines.push(`| User-Agent | Pass | Fail |`);
  lines.push(`|---|---:|---:|`);
  for (const [agent, counts] of Object.entries(byAgent)) {
    const mark = counts.fail === 0 ? "✓" : "✗";
    lines.push(`| ${mark} \`${agent}\` | ${counts.pass} | ${counts.fail} |`);
  }
  lines.push(``);

  lines.push(`## Summary by URL`);
  lines.push(``);
  lines.push(`| URL | Pass | Fail |`);
  lines.push(`|---|---:|---:|`);
  for (const [url, counts] of Object.entries(byUrl)) {
    const mark = counts.fail === 0 ? "✓" : "✗";
    lines.push(`| ${mark} \`${url}\` | ${counts.pass} | ${counts.fail} |`);
  }
  lines.push(``);

  const failures = results.filter((r) => !r.ok);
  if (failures.length > 0) {
    // Group by URL first. If every UA fails identically for a URL, we collapse
    // them into one "all UAs" entry — the bug is on the page, not the UA gate.
    // If there's divergence across UAs for the same URL, we surface that
    // explicitly because UA-divergence is the highest-priority class of bug
    // (it means the page is gating content on user-agent, which is exactly
    // what this audit is designed to catch).

    /** @type {Map<string, Result[]>} */
    const byUrl = new Map();
    for (const r of failures) {
      const arr = byUrl.get(r.url) ?? [];
      arr.push(r);
      byUrl.set(r.url, arr);
    }

    // Divergence section first — these are CRITICAL bugs.
    const divergent = [];
    const uniform = [];
    for (const [url, rows] of byUrl) {
      const fingerprints = new Set(
        rows.map((r) =>
          r.checks
            .filter((c) => !c.pass)
            .map((c) => c.id)
            .sort()
            .join("|")
        )
      );
      if (fingerprints.size > 1) divergent.push({ url, rows });
      else uniform.push({ url, rows });
    }

    if (divergent.length > 0) {
      lines.push(`## ⚠️  UA-divergent failures (CRITICAL)`);
      lines.push(``);
      lines.push(
        `These URLs serve different content to different user-agents. ` +
          `That is the exact bug class this audit was built to catch: it ` +
          `means a crawler sees less than a browser does.`
      );
      lines.push(``);
      for (const { url, rows } of divergent) {
        lines.push(`### \`${url}\``);
        lines.push(``);
        lines.push(`| User-Agent | Failed checks |`);
        lines.push(`|---|---|`);
        for (const r of rows) {
          const ids = r.checks
            .filter((c) => !c.pass)
            .map((c) => c.id)
            .join(", ");
          lines.push(`| \`${r.agent}\` | ${ids || "(none — passed)"} |`);
        }
        // Include the always-passing UAs too for contrast.
        const passingUAs = results
          .filter((r) => r.url === url && r.ok)
          .map((r) => r.agent);
        if (passingUAs.length > 0) {
          lines.push(``);
          lines.push(
            `Passing UAs for this URL: ${passingUAs.map((a) => `\`${a}\``).join(", ")}`
          );
        }
        lines.push(``);
      }
    }

    lines.push(`## Per-URL failures (uniform across UAs)`);
    lines.push(``);
    lines.push(
      `For these URLs, every tested user-agent fails on the SAME set of ` +
        `checks. The fix lives in the page's metadata or render output, not ` +
        `in a UA gate.`
    );
    lines.push(``);
    for (const { url, rows } of uniform) {
      const sample = rows[0];
      const failedIds = sample.checks.filter((c) => !c.pass);
      lines.push(`### \`${url}\``);
      lines.push(``);
      lines.push(
        `- HTTP: ${sample.status} · bytes: ${sample.bytes} · ` +
          `affected user-agents: ${rows.length}/${AGENTS.length}`
      );
      if (sample.error) lines.push(`- **fetch error:** ${sample.error}`);
      for (const c of failedIds) {
        lines.push(`- ✗ **${c.id}** — ${c.detail ?? "(no detail)"}`);
      }
      lines.push(``);
      lines.push("Reproduce:");
      lines.push("```bash");
      lines.push(`curl -sI -A 'PerplexityBot' '${BASE_URL}${url}'`);
      lines.push("```");
      lines.push(``);
    }
  } else {
    lines.push(`## Failures`);
    lines.push(``);
    lines.push(`_None._ Every (URL × user-agent) combination renders substantive SSR content.`);
    lines.push(``);
  }

  lines.push(`## What was checked`);
  lines.push(``);
  lines.push(`Each (URL × user-agent) combination was tested against 12 checks:`);
  lines.push(``);
  lines.push(`1. \`http-200\` — server returned 200 OK`);
  lines.push(`2. \`content-type-html\` — Content-Type includes \`text/html\``);
  lines.push(`3. \`content-type-charset\` — Content-Type declares a charset`);
  lines.push(`4. \`title-nonempty\` — non-empty \`<title>\` element`);
  lines.push(`5. \`meta-description\` — non-empty \`<meta name="description">\``);
  lines.push(`6. \`h1-present\` — at least one \`<h1>\``);
  lines.push(`7. \`body-text-substantive\` — \`<main>\` text length ≥ ${MIN_BODY_TEXT} chars (catches empty shells)`);
  lines.push(`8. \`json-ld-present\` — at least one JSON-LD block`);
  lines.push(`9. \`canonical-present\` — \`<link rel="canonical">\` declared`);
  lines.push(`10. \`og-image-present\` — \`<meta property="og:image">\` declared`);
  lines.push(`11. \`hreflang-present\` — at least one hreflang alternate`);
  lines.push(`12. \`no-empty-shell\` — \`<main>\` is not just an empty mount point`);
  lines.push(`13. \`not-noscript-required\` — substantive content lives outside \`<noscript>\``);
  lines.push(``);
  lines.push(`User-agents tested (${AGENTS.length}):`);
  lines.push(``);
  for (const a of AGENTS) {
    lines.push(`- \`${a.name}\``);
  }
  lines.push(``);

  return lines.join("\n");
}

async function main() {
  console.log(`[crawler-audit] base=${BASE_URL} urls=${URLS.length} agents=${AGENTS.length} concurrency=${CONCURRENCY}`);

  /** @type {Array<() => Promise<Result>>} */
  const tasks = [];
  for (const url of URLS) {
    for (const agent of AGENTS) {
      tasks.push(() => audit(url, agent));
    }
  }

  const started = Date.now();
  const results = await runLimited(CONCURRENCY, tasks);
  const elapsed = Date.now() - started;

  const passed = results.filter((r) => r.ok).length;
  const failed = results.length - passed;

  console.log(`[crawler-audit] done in ${elapsed}ms — passed=${passed} failed=${failed}`);

  if (REPORT_FILE) {
    const out = resolve(process.cwd(), REPORT_FILE);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, renderMarkdown(results), "utf8");
    console.log(`[crawler-audit] wrote markdown report → ${out}`);
  }

  if (failed > 0) {
    console.log(`\n[crawler-audit] FAILURES:`);
    for (const r of results.filter((r) => !r.ok)) {
      const reasons = r.error
        ? `error=${r.error}`
        : r.checks
            .filter((c) => !c.pass)
            .map((c) => c.id)
            .join(",");
      console.log(`  ✗ ${r.agent} → ${r.url} (${reasons})`);
    }
    process.exit(1);
  } else {
    console.log(`[crawler-audit] ✓ all checks passed`);
    process.exit(0);
  }
}

main().catch((err) => {
  console.error(`[crawler-audit] fatal:`, err);
  process.exit(2);
});
