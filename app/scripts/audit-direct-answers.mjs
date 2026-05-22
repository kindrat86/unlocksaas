#!/usr/bin/env node
/**
 * audit-direct-answers.mjs
 *
 * Walks every pSEO catalog and reports the word-count distribution of the
 * canonical "direct-answer" field used by each hub's <DirectAnswer> block.
 *
 * Target shape (per Google AI Overviews / Perplexity / ChatGPT browse
 * extraction guidance): 40–60 words.
 *
 * Behaviour:
 *   - Reports per-hub min / max / median / in-range / too-short / too-long.
 *   - Exits 0 by default (informational). Set AUDIT_DIRECT_ANSWERS_STRICT=1
 *     to exit non-zero when any field falls outside the 40–60 window.
 *
 * This script is intentionally implementation-light: it parses the canonical
 * TypeScript catalog modules as text with a regex tuned to their literal
 * shape (a `field: "..."` line, or a `field: \`...\`` template literal).
 * The pSEO catalogs are frozen module-level data, so the regex coverage is
 * deterministic. If a catalog migrates away from this shape, this script
 * will report `n=0` for that hub — a visible signal to update the regex.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const APP_ROOT = path.resolve(__dirname, "..");
const LIB = path.join(APP_ROOT, "src/lib");

const TARGETS = [
  { hub: "glossary",            file: "glossary.ts",            field: "shortDefinition" },
  { hub: "answers",             file: "answers.ts",             field: "directAnswer" },
  { hub: "benchmarks",          file: "benchmarks.ts",          field: "directAnswer" },
  { hub: "why-isnt-my",         file: "why-isnt-my.ts",         field: "tldr" },
  { hub: "funnel-teardown",     file: "funnel-teardowns.ts",    field: "tldr" },
  { hub: "pricing-teardown",    file: "pricing-teardowns.ts",   field: "tldr" },
  { hub: "alternatives-to",     file: "alternatives.ts",        field: "honestVerdict" },
  { hub: "vs",                  file: "comparisons.ts",         field: "tldr" },
  { hub: "scripts",             file: "scripts.ts",             field: "tldr" },
  { hub: "conversion-rate",     file: "conversion-rate.ts",     field: "tldr" },
  { hub: "pricing-page-examples", file: "pricing-page-examples.ts", field: "tldr" },
  { hub: "swipe-file",          file: "swipe-files.ts",         field: "tldr" },
  { hub: "stack-for",           file: "stacks.ts",              field: "tldr" },
  { hub: "funnel-playbook",     file: "funnel-playbooks.ts",    field: "tldr" },
  { hub: "category",            file: "categories.ts",          field: "oneLine" },
  { hub: "for",                 file: "niches.ts",              field: "heroSubhead" },
  { hub: "launch-checklist",    file: "launch-checklists.ts",   field: "heroSubhead" },
  { hub: "post-mortem",         file: "post-mortems.ts",        field: "tldr" },
  { hub: "press",               file: "press-topics.ts",        field: "thesis" },
];

const MIN_WORDS = 40;
const MAX_WORDS = 60;
const STRICT = process.env.AUDIT_DIRECT_ANSWERS_STRICT === "1";

/** Count whitespace-separated words. */
function wordCount(s) {
  return (s || "").trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Extract every literal string value bound to `<field>:` at the top level of
 * each entry object. Supports both double-quoted and backtick template-literal
 * forms (no interpolation). Skips backslash-escaped quotes.
 */
function extractFieldValues(src, field) {
  // Matches: <field>: "..."  OR  <field>: `...`
  // We treat each as one string and ignore template interpolations (they're
  // not used in catalog literals; the catalogs are static text).
  const re = new RegExp(
    `\\b${field}:\\s*("(?:[^"\\\\]|\\\\.)*"|\`(?:[^\`\\\\]|\\\\.)*\`)`,
    "g",
  );
  const out = [];
  let m;
  while ((m = re.exec(src)) !== null) {
    let lit = m[1];
    // Strip the leading/trailing quote.
    lit = lit.slice(1, -1);
    // Collapse escapes and whitespace.
    lit = lit
      .replace(/\\n/g, " ")
      .replace(/\\"/g, '"')
      .replace(/\\`/g, "`")
      .replace(/\s+/g, " ")
      .trim();
    out.push(lit);
  }
  return out;
}

function median(sorted) {
  if (sorted.length === 0) return 0;
  const m = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? Math.round((sorted[m - 1] + sorted[m]) / 2) : sorted[m];
}

let totalFields = 0;
let totalInRange = 0;
let totalTooShort = 0;
let totalTooLong = 0;
const tooLongOffenders = [];
const tooShortOffenders = [];

console.log("");
console.log("Direct-answer word-count audit (target: 40-60 words)");
console.log("=".repeat(80));
console.log(
  "hub".padEnd(24) +
    " field".padEnd(20) +
    "  n  min  max  med  in   <40  >60",
);
console.log("-".repeat(80));

for (const t of TARGETS) {
  const fp = path.join(LIB, t.file);
  if (!fs.existsSync(fp)) {
    console.log(`${t.hub.padEnd(24)} ${("[" + t.field + "]").padEnd(20)}  [MISSING FILE: ${t.file}]`);
    continue;
  }
  const src = fs.readFileSync(fp, "utf8");
  const values = extractFieldValues(src, t.field);
  const counts = values.map(wordCount).sort((a, b) => a - b);

  if (counts.length === 0) {
    console.log(`${t.hub.padEnd(24)} ${(" " + t.field).padEnd(20)}  [no matches — check regex/field name]`);
    continue;
  }

  const min = counts[0];
  const max = counts[counts.length - 1];
  const med = median(counts);
  const inRange = counts.filter((c) => c >= MIN_WORDS && c <= MAX_WORDS).length;
  const tooShort = counts.filter((c) => c < MIN_WORDS).length;
  const tooLong = counts.filter((c) => c > MAX_WORDS).length;

  totalFields += counts.length;
  totalInRange += inRange;
  totalTooShort += tooShort;
  totalTooLong += tooLong;

  // Track offenders for the per-entry detail below.
  values.forEach((v, i) => {
    const wc = wordCount(v);
    if (wc > MAX_WORDS) tooLongOffenders.push({ hub: t.hub, idx: i, wc, preview: v.slice(0, 80) + (v.length > 80 ? "..." : "") });
    if (wc < MIN_WORDS) tooShortOffenders.push({ hub: t.hub, idx: i, wc, preview: v.slice(0, 80) + (v.length > 80 ? "..." : "") });
  });

  console.log(
    `${t.hub.padEnd(24)} ${(" " + t.field).padEnd(20)}` +
      `${String(counts.length).padStart(3)} ` +
      `${String(min).padStart(4)} ` +
      `${String(max).padStart(4)} ` +
      `${String(med).padStart(4)} ` +
      `${String(inRange).padStart(4)} ` +
      `${String(tooShort).padStart(4)} ` +
      `${String(tooLong).padStart(4)}`,
  );
}

console.log("-".repeat(80));
console.log(
  "TOTAL".padEnd(45) +
    `  ${String(totalFields).padStart(3)}` +
    `                ${String(totalInRange).padStart(4)} ${String(totalTooShort).padStart(4)} ${String(totalTooLong).padStart(4)}`,
);
console.log("");

const pct = totalFields > 0 ? Math.round((totalInRange / totalFields) * 1000) / 10 : 0;
console.log(`In-range share: ${totalInRange}/${totalFields} (${pct}%)`);

if (tooLongOffenders.length > 0) {
  console.log("");
  console.log("Top too-long offenders (consider trimming):");
  tooLongOffenders
    .sort((a, b) => b.wc - a.wc)
    .slice(0, 8)
    .forEach((o) => console.log(`  ${o.hub}#${o.idx} (${o.wc}w): ${o.preview}`));
}

if (tooShortOffenders.length > 0) {
  console.log("");
  console.log("Top too-short offenders (consider expanding):");
  tooShortOffenders
    .sort((a, b) => a.wc - b.wc)
    .slice(0, 8)
    .forEach((o) => console.log(`  ${o.hub}#${o.idx} (${o.wc}w): ${o.preview}`));
}

console.log("");

if (STRICT && (totalTooShort > 0 || totalTooLong > 0)) {
  console.error(
    `FAIL: ${totalTooShort + totalTooLong} fields outside 40-60 word window (STRICT mode).`,
  );
  process.exit(1);
}
