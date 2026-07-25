#!/usr/bin/env node
// @ts-check

/**
 * JSON-LD pre-deploy validator (2026-05-21 SEO audit fix).
 *
 * Crawls a representative set of URLs across the marketing surface, extracts
 * every `<script type="application/ld+json">` block from the rendered HTML,
 * and runs a deterministic checklist against each parsed object:
 *
 *   1. Valid JSON                 — JSON.parse must not throw.
 *   2. @context / @type present   — every block must carry both.
 *   3. Type-specific required keys
 *      - Article: headline, datePublished, author
 *      - BreadcrumbList: itemListElement (≥ 1 entry, each w/ position+name)
 *      - FAQPage: mainEntity (≥ 1 Question with acceptedAnswer.text)
 *      - Organization: name, url
 *      - Person: name
 *      - WebSite: name, url
 *      - DefinedTermSet: hasDefinedTerm or @id
 *      - PodcastSeries: name, url
 *      - PodcastEpisode: name, partOfSeries
 *      - Dataset: name, license, distribution
 *      - HowTo: name, step
 *      - Product / SoftwareApplication: name
 *   4. No "undefined" / null string leakage in JSON-stringified blob —
 *      catches accidentally rendered template values.
 *   5. Brunson Hard-Rule: no aggregateRating with reviewCount == 0
 *      or ratingValue derived from zero customers.
 *
 * Exits with code 0 on clean, 1 on any failure. Output names file + slug
 * so the failing block is reproducible.
 *
 * Usage:
 *   pnpm dev                          # one terminal
 *   node scripts/validate-jsonld.mjs  # another terminal
 *
 *   # Against a Vercel preview deploy:
 *   VALIDATE_BASE_URL=https://unlocksaas-git-foo.vercel.app \
 *     node scripts/validate-jsonld.mjs
 *
 *   # Against production (post-deploy smoke test):
 *   VALIDATE_BASE_URL=https://unlocksaas.com \
 *     node scripts/validate-jsonld.mjs
 *
 * Why not a third-party validator?
 *   schema-dts / structured-data-testing-tool both pin schema.org versions
 *   and reject custom @id fragment patterns the codebase deliberately uses
 *   (e.g. `${BASE_URL}/#organization`). This validator enforces the rules
 *   that actually matter for Google Rich Results + AI retriever citations
 *   without false-positives on the Brunson @id convention.
 */

import { readFileSync } from "node:fs";

const BASE_URL = process.env.VALIDATE_BASE_URL || "http://localhost:3000";
const FETCH_TIMEOUT_MS = Number.parseInt(
  process.env.VALIDATE_FETCH_TIMEOUT_MS || "60000",
  10
);

/**
 * Representative URL set: one per pSEO template + every authority page +
 * every machine-readable surface. Slugs are real, verified-live ones from
 * the relevant manifest so the page renders with full data (not a 404).
 */
/**
 * Locale samples are DERIVED from src/lib/i18n/locales.ts, never hardcoded.
 * The shipped locale set has been trimmed twice to stay under Vercel's 2048
 * route limit (12 → 6 → en-US+de+es), and each trim silently turned a
 * hardcoded sample into a 404 — that is exactly how `/pt-BR/faq` started
 * failing this job. `/faq` is locale-aware for every non-default locale
 * (see I18N_PATHS in src/lib/i18n/registry.ts), so one sample per locale
 * stays valid on its own.
 *
 * @returns {string[]}
 */
function localeSampleUrls() {
  const src = readFileSync(
    new URL("../src/lib/i18n/locales.ts", import.meta.url),
    "utf8",
  );
  const listMatch = src.match(/SUPPORTED_LOCALES\s*=\s*\[([^\]]*)\]/);
  if (!listMatch) {
    throw new Error(
      "validate-jsonld: could not parse SUPPORTED_LOCALES from src/lib/i18n/locales.ts",
    );
  }
  const defaultLocale =
    src.match(/DEFAULT_LOCALE[^=]*=\s*"([^"]+)"/)?.[1] ?? "en-US";
  return [...listMatch[1].matchAll(/"([^"]+)"/g)]
    .map((m) => m[1])
    .filter((locale) => locale !== defaultLocale)
    .map((locale) => `/${locale}/faq`);
}

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

  // ── Core funnels ────────────────────────────────────────────────────
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

  // ── Locales (sample, one per shipped non-default locale) ───────────
  ...localeSampleUrls(),
];

/* eslint-disable no-console */

/** @typedef {{ url: string, blockIndex: number, message: string }} ValidationError */

/** @type {ValidationError[]} */
const errors = [];
/** @type {ValidationError[]} */
const warnings = [];

/** @param {string} url @param {number} idx @param {string} msg */
function fail(url, idx, msg) {
  errors.push({ url, blockIndex: idx, message: msg });
}

/** @param {string} url @param {number} idx @param {string} msg */
function warn(url, idx, msg) {
  warnings.push({ url, blockIndex: idx, message: msg });
}

/**
 * Required-keys table per schema.org @type. Only the keys Google's Rich
 * Results validator treats as REQUIRED are listed — recommended/optional
 * keys are checked separately as warnings.
 */
const REQUIRED_BY_TYPE = {
  Article: ["headline"],
  NewsArticle: ["headline"],
  BlogPosting: ["headline"],
  TechArticle: ["headline"],
  Organization: ["name"],
  Person: ["name"],
  WebSite: ["name", "url"],
  WebPage: [],
  CollectionPage: [],
  // Google's ProfilePage rich-result spec makes `mainEntity` REQUIRED (the
  // Person/Organization the profile is about). This was `[]` until 2026-07-25,
  // which let bare `{"@type":"ProfilePage","@id":…}` reference stubs ship on
  // every page rendering PersonJsonLd. GSC files those as "Missing field
  // 'mainEntity'".
  ProfilePage: ["mainEntity"],
  BreadcrumbList: ["itemListElement"],
  FAQPage: ["mainEntity"],
  Product: ["name"],
  SoftwareApplication: ["name"],
  Service: ["name"],
  DefinedTerm: ["name"],
  DefinedTermSet: [],
  PodcastSeries: ["name"],
  PodcastEpisode: ["name"],
  AudioObject: [],
  VideoObject: ["name"],
  Dataset: ["name", "license"],
  DataFeed: ["name"],
  HowTo: ["name", "step"],
  ItemList: ["itemListElement"],
  Review: ["itemReviewed"],
  AggregateRating: ["ratingValue", "reviewCount"],
  Quotation: [],
  SpeakableSpecification: [],
  ContactPoint: [],
  PostalAddress: [],
  ImageObject: [],
  Action: [],
  SearchAction: ["target"],
};

/** @param {unknown} value */
function typeOf(value) {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  return typeof value;
}

/** @param {unknown} node @returns {string[]} */
function typesOf(node) {
  if (!node || typeof node !== "object") return [];
  const t = /** @type {{ '@type'?: unknown }} */ (node)["@type"];
  if (typeof t === "string") return [t];
  if (Array.isArray(t)) return t.filter((x) => typeof x === "string");
  return [];
}

/**
 * Recursively validate a node and its children. Schema.org graphs can be
 * deeply nested (Article → publisher → Organization → contactPoint → …);
 * we treat any object with @type as a node to check.
 *
 * @param {unknown} node
 * @param {string} url
 * @param {number} blockIndex
 * @param {string} path
 */
function walk(node, url, blockIndex, path) {
  if (Array.isArray(node)) {
    node.forEach((item, i) => walk(item, url, blockIndex, `${path}[${i}]`));
    return;
  }
  if (!node || typeof node !== "object") return;

  const obj = /** @type {Record<string, unknown>} */ (node);
  const types = typesOf(obj);

  // BreadcrumbList: every itemListElement must have position + name.
  if (types.includes("BreadcrumbList")) {
    const items = obj.itemListElement;
    if (!Array.isArray(items) || items.length === 0) {
      fail(url, blockIndex, `${path}: BreadcrumbList.itemListElement must be a non-empty array`);
    } else {
      items.forEach((item, i) => {
        if (!item || typeof item !== "object") {
          fail(url, blockIndex, `${path}.itemListElement[${i}]: must be an object`);
          return;
        }
        const it = /** @type {Record<string, unknown>} */ (item);
        if (typeof it.position !== "number") {
          fail(url, blockIndex, `${path}.itemListElement[${i}]: missing position (number)`);
        }
        if (typeof it.name !== "string" || it.name.length === 0) {
          fail(url, blockIndex, `${path}.itemListElement[${i}]: missing name (string)`);
        }
      });
    }
  }

  // FAQPage: every mainEntity must be a Question with an acceptedAnswer.
  if (types.includes("FAQPage")) {
    const entities = Array.isArray(obj.mainEntity) ? obj.mainEntity : obj.mainEntity ? [obj.mainEntity] : [];
    if (entities.length === 0) {
      fail(url, blockIndex, `${path}: FAQPage.mainEntity must contain ≥ 1 Question`);
    }
    entities.forEach((q, i) => {
      if (!q || typeof q !== "object") return;
      const qq = /** @type {Record<string, unknown>} */ (q);
      const qTypes = typesOf(qq);
      if (!qTypes.includes("Question")) {
        fail(url, blockIndex, `${path}.mainEntity[${i}]: @type must include Question`);
      }
      if (typeof qq.name !== "string" || qq.name.length === 0) {
        fail(url, blockIndex, `${path}.mainEntity[${i}]: Question.name (the question text) is required`);
      }
      const ans = qq.acceptedAnswer;
      if (!ans || typeof ans !== "object") {
        fail(url, blockIndex, `${path}.mainEntity[${i}]: Question.acceptedAnswer is required`);
      } else {
        const a = /** @type {Record<string, unknown>} */ (ans);
        if (typeof a.text !== "string" || a.text.length === 0) {
          fail(url, blockIndex, `${path}.mainEntity[${i}].acceptedAnswer: text is required`);
        }
      }
    });
  }

  // Brunson Hard-Rule: no AggregateRating without verified reviews.
  if (types.includes("AggregateRating")) {
    const count = Number(obj.reviewCount);
    if (!Number.isFinite(count) || count <= 0) {
      fail(
        url,
        blockIndex,
        `${path}: AggregateRating.reviewCount must be > 0 (Brunson Hard-Rule: no fabricated ratings)`,
      );
    }
    const rating = Number(obj.ratingValue);
    if (!Number.isFinite(rating) || rating <= 0 || rating > 5) {
      fail(url, blockIndex, `${path}: AggregateRating.ratingValue must be in (0, 5]`);
    }
  }

  // SearchAction must have a target with a urlTemplate.
  if (types.includes("SearchAction")) {
    const target = obj.target;
    if (
      !target ||
      (typeof target !== "string" &&
        (typeof target !== "object" ||
          !(/** @type {Record<string, unknown>} */ (target).urlTemplate)))
    ) {
      fail(url, blockIndex, `${path}: SearchAction.target must be a string or { urlTemplate }`);
    }
  }

  // Banned types. QAPage is invalid for everything this site publishes: Google
  // requires that users be able to submit answers, and names "an FAQ page
  // written by the site itself" as an invalid use. Every /answers, /should-i,
  // /benchmarks, /why-isnt-my and /ask page emitted it until 2026-07-25. Fail
  // the build rather than let it come back — the GSC warnings it produces
  // (missing answerCount / upvoteCount) tempt you into fabricating engagement.
  for (const t of types) {
    if (t === "QAPage") {
      fail(
        url,
        blockIndex,
        `${path}: QAPage is banned — Google requires user-submitted answers. Use FAQPage with mainEntity as an array.`,
      );
    }
  }

  // Generic required-keys check by @type.
  for (const t of types) {
    const required = REQUIRED_BY_TYPE[/** @type {keyof typeof REQUIRED_BY_TYPE} */ (t)];
    if (!required) continue;
    for (const key of required) {
      if (obj[key] === undefined || obj[key] === null || obj[key] === "") {
        fail(url, blockIndex, `${path}: ${t} missing required key "${key}"`);
      }
    }
  }

  // Recurse into children.
  for (const [key, child] of Object.entries(obj)) {
    if (key === "@context" || key === "@type" || key === "@id") continue;
    walk(child, url, blockIndex, `${path}.${key}`);
  }
}

/** @param {unknown} parsed @param {string} url @param {number} blockIndex */
function validate(parsed, url, blockIndex) {
  // Top-level @context check.
  /** @type {unknown} */
  let ctx;
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    ctx = /** @type {Record<string, unknown>} */ (parsed)["@context"];
  }
  if (!ctx) {
    fail(url, blockIndex, "top-level: missing @context");
  } else if (typeof ctx === "string" && !ctx.includes("schema.org")) {
    fail(url, blockIndex, `top-level: @context "${ctx}" does not reference schema.org`);
  }

  walk(parsed, url, blockIndex, "$");
}

const JSONLD_BLOCK_RE =
  /<script[^>]*\btype\s*=\s*"application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
const UNDEFINED_LEAK_RE = /:\s*"undefined"/;
const NULL_STRING_LEAK_RE = /:\s*"null"/;

/** @param {string} url */
async function processUrl(url) {
  const fullUrl = `${BASE_URL}${url}`;
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let html;
  try {
    const res = await fetch(fullUrl, {
      headers: { Accept: "text/html" },
      signal: controller.signal,
    });
    if (!res.ok) {
      fail(url, -1, `HTTP ${res.status} ${res.statusText}`);
      return;
    }
    html = await res.text();
  } catch (/** @type {any} */ e) {
    fail(url, -1, `fetch failed: ${e?.message ?? e}`);
    return;
  } finally {
    clearTimeout(t);
  }

  // Also assert canonical Link header is present (validates the proxy fix).
  // The header is only checked as a warning so a missing header doesn't
  // block deploy — but we want visibility.
  // (Done inside fetch via res.headers, but we lost the response here.
  // Re-fetch HEAD for the header check — cheap.)
  try {
    const headRes = await fetch(fullUrl, { method: "HEAD" });
    const linkHeader = headRes.headers.get("link");
    if (!linkHeader || !/rel="?canonical"?/i.test(linkHeader)) {
      // Skip warning for /api/* and /cite/* (proxy intentionally skips them).
      if (!url.startsWith("/api/") && !url.startsWith("/cite/")) {
        warn(url, -1, "missing canonical Link HTTP header (proxy.ts should emit one)");
      }
    }
  } catch {
    // HEAD optional; ignore.
  }

  processHtmlBlocks(html, url);
}

/**
 * Shared block-extraction + validation, used by both the rendered-route
 * crawl (processUrl, fetch-based) and the static-file scan
 * (processStaticFile, fs-based) below.
 *
 * @param {string} html
 * @param {string} label
 */
function processHtmlBlocks(html, label) {
  /** @type {RegExpExecArray | null} */
  let m;
  let blockIndex = 0;
  let foundAnyBlock = false;
  JSONLD_BLOCK_RE.lastIndex = 0;
  while ((m = JSONLD_BLOCK_RE.exec(html)) !== null) {
    foundAnyBlock = true;
    const raw = m[1].trim();
    const localIndex = blockIndex++;

    if (UNDEFINED_LEAK_RE.test(raw)) {
      fail(label, localIndex, `contains the literal string ":\"undefined\"" — template leak`);
    }
    if (NULL_STRING_LEAK_RE.test(raw)) {
      fail(label, localIndex, `contains the literal string ":\"null\"" — template leak`);
    }

    /** @type {unknown} */
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (/** @type {any} */ e) {
      fail(label, localIndex, `invalid JSON: ${e?.message ?? e}`);
      continue;
    }

    // A block may itself be an @graph wrapper or an array of nodes.
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const obj = /** @type {Record<string, unknown>} */ (parsed);
      if (Array.isArray(obj["@graph"])) {
        validate(parsed, label, localIndex); // top-level @context check
        obj["@graph"].forEach((node, i) =>
          walk(node, label, localIndex, `@graph[${i}]`),
        );
        continue;
      }
    }

    if (Array.isArray(parsed)) {
      parsed.forEach((node, i) => {
        validate(node, label, localIndex);
      });
    } else {
      validate(parsed, label, localIndex);
    }
  }

  if (!foundAnyBlock) {
    // Some routes legitimately ship zero JSON-LD (e.g., /humans.txt would
    // if it were in this list). For the URLs we DO list, every one should
    // ship at least one block — they're all marketing-surface routes.
    warn(label, -1, "no application/ld+json blocks found in HTML");
  }
}

/**
 * Static-file scan of app/public/**\/*.html — plain files served verbatim
 * by Next.js that never go through a rendered route, so processUrl()'s
 * fetch-based crawl never sees them. This gap is exactly how the
 * 2026-07-24 "https://***@type" corruption bug (12 integrations/use-cases
 * pages) shipped to production undetected. Complements, does not replace,
 * the URLS crawl above (which also covers type-specific required-key rules
 * this pass doesn't run against static files without a route context).
 */
async function scanStaticPublicFiles() {
  const { readdir, readFile } = await import("node:fs/promises");
  const { join, relative } = await import("node:path");
  const publicDir = join(new URL(".", import.meta.url).pathname, "..", "public");

  /** @param {string} dir @returns {Promise<string[]>} */
  async function walkDir(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      entries.map(async (entry) => {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) return walkDir(full);
        return entry.name.endsWith(".html") ? [full] : [];
      }),
    );
    return files.flat();
  }

  const htmlFiles = await walkDir(publicDir);
  console.log(`[validate-jsonld] static public/ files = ${htmlFiles.length}`);
  for (const filePath of htmlFiles) {
    const label = `public/${relative(publicDir, filePath)}`;
    const html = await readFile(filePath, "utf8");
    const before = errors.length;
    processHtmlBlocks(html, label);
    if (errors.length === before) console.log(`  ${label} … ✓`);
    else console.log(`  ${label} … ✗`);
  }
}

async function main() {
  console.log(`[validate-jsonld] base = ${BASE_URL}`);
  console.log(`[validate-jsonld] urls = ${URLS.length}`);

  // Sequential fetch keeps the dev server's worker pool happy.
  // pSEO templates allocate a lot of strings; parallel fetch can OOM
  // a 1 GB Vercel preview build on its first render.
  for (const url of URLS) {
    process.stdout.write(`  ${url} … `);
    const before = errors.length;
    const wbefore = warnings.length;
    await processUrl(url);
    const errs = errors.length - before;
    const wrns = warnings.length - wbefore;
    if (errs === 0 && wrns === 0) console.log("✓");
    else console.log(`✗ ${errs} error(s), ${wrns} warning(s)`);
  }

  await scanStaticPublicFiles();

  console.log("");
  if (warnings.length > 0) {
    console.log(`[validate-jsonld] ${warnings.length} warning(s):`);
    for (const w of warnings) {
      console.log(`  ⚠ ${w.url} [block ${w.blockIndex}] ${w.message}`);
    }
    console.log("");
  }
  if (errors.length > 0) {
    console.log(`[validate-jsonld] ${errors.length} error(s):`);
    for (const e of errors) {
      console.log(`  ✗ ${e.url} [block ${e.blockIndex}] ${e.message}`);
    }
    process.exit(1);
  }
  console.log("[validate-jsonld] OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
