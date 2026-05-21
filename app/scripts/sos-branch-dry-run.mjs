#!/usr/bin/env node
// @ts-check

/**
 * SOS branch-selection dry-run.
 *
 * Exercises the pure decision logic from lib/soap-opera/dispatch.ts
 * (selectBranch) against a synthetic set of subscriber states so the
 * day-6 cron pass behavior is deterministic and human-verifiable.
 *
 * Run:
 *   node app/scripts/sos-branch-dry-run.mjs
 *
 * Exits 0 on all-pass, 1 if any case prints "FAIL".
 *
 * Why this file exists:
 *   The repo has no Jest / Vitest harness (verified 2026-05-21:
 *   app/package.json has no test runner; scripts/ is Python). This is
 *   the smallest unit that lets a future engineer reproduce the day-6
 *   branch decision without spinning up Supabase, Resend, or the cron.
 *   The actual selectBranch() implementation lives in
 *   app/src/lib/soap-opera/dispatch.ts. This script mirrors it
 *   verbatim so it can run as plain JS with zero compile step.
 */

/**
 * Mirrors selectBranch() in app/src/lib/soap-opera/dispatch.ts.
 * Keep these two functions in lock-step.
 *
 * @param {{
 *   e3_opened_at: string | null,
 *   e3_clicked_at: string | null,
 *   converted: boolean,
 * }} args
 * @returns {"branch_a" | "branch_b" | null}
 */
function selectBranch(args) {
  if (args.converted) return null;
  if (args.e3_clicked_at) return "branch_b";
  if (args.e3_opened_at) return "branch_a";
  return null;
}

const NOW = "2026-05-27T00:00:00Z";

const cases = [
  {
    name: "ghost: no open, no click, no conversion",
    input: { e3_opened_at: null, e3_clicked_at: null, converted: false },
    expected: null,
  },
  {
    name: "soft_sell: opened only",
    input: { e3_opened_at: NOW, e3_clicked_at: null, converted: false },
    expected: "branch_a",
  },
  {
    name: "objection_handler: clicked, no buy",
    input: { e3_opened_at: NOW, e3_clicked_at: NOW, converted: false },
    expected: "branch_b",
  },
  {
    name: "clicked without recorded open (click implies open)",
    input: { e3_opened_at: null, e3_clicked_at: NOW, converted: false },
    expected: "branch_b",
  },
  {
    name: "converted: opened only → no branch",
    input: { e3_opened_at: NOW, e3_clicked_at: null, converted: true },
    expected: null,
  },
  {
    name: "converted: clicked → no branch",
    input: { e3_opened_at: NOW, e3_clicked_at: NOW, converted: true },
    expected: null,
  },
];

let failed = 0;
for (const c of cases) {
  const actual = selectBranch(c.input);
  const pass = actual === c.expected;
  const tag = pass ? "PASS" : "FAIL";
  if (!pass) failed++;
  const exp = c.expected ?? "null";
  const act = actual ?? "null";
  console.log(`${tag}  ${c.name}  expected=${exp} actual=${act}`);
}

if (failed > 0) {
  console.error(`\n${failed} case(s) failed`);
  process.exit(1);
}
console.log(`\nAll ${cases.length} cases passed`);
