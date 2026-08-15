#!/usr/bin/env node
/**
 * Production dependency audit gate (replaces a bare `npm audit --omit=dev`).
 *
 * Why this exists: `npm audit` reports a whole *cascade* — one advisory on a
 * leaf package re-lists every ancestor as "depends on vulnerable versions of
 * X". On 2026-07-25 that turned two root advisories into 18 findings and a red
 * CI. Worse, some of those roots have no fix that is reachable from here: they
 * sit under third-party packages that declare build/CLI tooling as runtime
 * `dependencies`, and the only patched release is a semver-major with an
 * incompatible module shape. A gate that can never go green stops being read,
 * and then a real advisory lands unnoticed.
 *
 * So this script gates on ROOT advisories only (the `via` entries that are
 * advisory objects, not cascade strings) and fails on anything that is not
 * explicitly accepted below. Accepting is deliberately uncomfortable:
 *
 *   - each entry needs a written reason, not just an ID
 *   - each entry has an `expires` date; past it, CI fails again on purpose, so
 *     accepted risk is re-argued rather than inherited
 *   - an entry that no longer matches anything fails too, so the list cannot
 *     silently rot into a blanket mute
 *
 * Anything not listed here — any new advisory, any severity — fails the build.
 *
 * Usage: node scripts/audit-prod.mjs
 */
import { spawnSync } from 'node:child_process';

/**
 * Root advisories we knowingly ship with. Keyed by GHSA ID.
 *
 * Before adding one, exhaust the real fixes first: upgrade the direct
 * dependency, add an `overrides` pin in package.json, or move a build-only
 * package out of `dependencies` (that last one is why `shadcn` — a codegen CLI
 * that no runtime code imports — is a devDependency).
 */
const ACCEPTED = [];

const today = new Date().toISOString().slice(0, 10);

const res = spawnSync(
  'npm',
  ['audit', '--omit=dev', '--audit-level=low', '--json'],
  { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }
);

if (!res.stdout) {
  console.error('❌ audit-prod: npm audit produced no output');
  if (res.stderr) console.error(res.stderr);
  process.exit(1);
}

let report;
try {
  report = JSON.parse(res.stdout);
} catch (err) {
  console.error(`❌ audit-prod: could not parse npm audit output — ${err.message}`);
  process.exit(1);
}

if (report.error) {
  console.error(`❌ audit-prod: npm audit failed — ${report.error.summary ?? 'unknown error'}`);
  process.exit(1);
}

// A `via` entry that is an object is an advisory against this package itself.
// A `via` entry that is a string is just the cascade ("depends on vulnerable
// versions of ..."), which would multiply one problem into a dozen findings.
const roots = new Map();
for (const [name, vuln] of Object.entries(report.vulnerabilities ?? {})) {
  for (const via of vuln.via) {
    if (typeof via === 'string') continue;
    const id = via.url?.split('/').pop() ?? `npm-${via.source}`;
    if (!roots.has(id)) {
      roots.set(id, { id, package: name, title: via.title, severity: via.severity, range: via.range });
    }
  }
}

const accepted = new Map(ACCEPTED.map((a) => [a.id, a]));
const unexpected = [];
const muted = [];
const expired = [];

for (const root of roots.values()) {
  const entry = accepted.get(root.id);
  if (!entry) {
    unexpected.push(root);
  } else if (entry.expires < today) {
    expired.push({ ...root, expires: entry.expires });
  } else {
    muted.push({ ...root, expires: entry.expires });
  }
}

const stale = ACCEPTED.filter((a) => !roots.has(a.id));

const counts = report.metadata?.vulnerabilities ?? {};
console.log(
  `[audit-prod] ${roots.size} root advisor${roots.size === 1 ? 'y' : 'ies'} ` +
    `across ${Object.keys(report.vulnerabilities ?? {}).length} reported package(s) ` +
    `(${counts.critical ?? 0} critical, ${counts.high ?? 0} high, ` +
    `${counts.moderate ?? 0} moderate, ${counts.low ?? 0} low)`
);

for (const m of muted) {
  console.log(`  · accepted until ${m.expires}: ${m.id} ${m.package} (${m.severity}) — ${m.title}`);
}

let failed = false;

if (unexpected.length) {
  failed = true;
  console.error(`\n❌ audit-prod: ${unexpected.length} unaccepted advisor(y/ies):`);
  for (const u of unexpected) {
    console.error(`  - ${u.id} ${u.package} ${u.range} (${u.severity})`);
    console.error(`      ${u.title}`);
    console.error(`      https://github.com/advisories/${u.id}`);
  }
  console.error(
    '\nFix it (upgrade, or pin via "overrides" in package.json, or move a build-only\n' +
      'package to devDependencies). Only if there is genuinely no reachable fix, add it\n' +
      'to ACCEPTED in scripts/audit-prod.mjs with a reason and an expiry.'
  );
}

if (expired.length) {
  failed = true;
  console.error(`\n❌ audit-prod: ${expired.length} accepted advisor(y/ies) past their expiry:`);
  for (const e of expired) {
    console.error(`  - ${e.id} ${e.package} — accepted until ${e.expires}, still present`);
  }
  console.error('\nRe-check whether a fix has shipped. If not, extend the expiry deliberately.');
}

if (stale.length) {
  failed = true;
  console.error(`\n❌ audit-prod: ${stale.length} ACCEPTED entr(y/ies) no longer match anything:`);
  for (const s of stale) console.error(`  - ${s.id} ${s.package}`);
  console.error('\nThe advisory is resolved — delete the entry so the list stays honest.');
}

if (failed) process.exit(1);

console.log('[audit-prod] OK — no unaccepted advisories in production dependencies');
