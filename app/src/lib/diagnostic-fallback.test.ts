/**
 * Tests for diagnostic-fallback: the deterministic, evidence-based diagnosis
 * used when the AI engine is unavailable (gateway 403, provider down, timeout,
 * parse failure). The free diagnostic must never dead-end and never return
 * label "error" for engine-side failures.
 *
 * Standalone: node:test + type stripping (no vitest/jest dependency, no
 * runtime imports in the module under test).
 * Run: node --test src/lib/diagnostic-fallback.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildFallbackDiagnosis } from "./diagnostic-fallback.ts";

// Fixture 1: generic-audience page. Audience words only ("teams", "businesses"),
// no named person. Expected label: wrong_person.
const GENERIC_AUDIENCE_PAGE = `TITLE: TaskFlow - Productivity for teams
META DESCRIPTION: TaskFlow helps teams manage projects and stay organized.
BODY: TaskFlow is a project management tool for teams and businesses. It has powerful analytics, dashboards, and integrations. Get started today. Our platform supports your workflow with flexible boards and smart automation. Thousands of users trust TaskFlow. Sign up for a free trial and see why teams love it. Pricing is available on our pricing page. Every feature is designed to save time.`;

// Fixture 2: named niche audience ("freelance designers") but feature-list hero,
// no outcome with timeframe. Expected label: weak_offer.
const FEATURE_LIST_PAGE = `TITLE: Pipely - Invoicing for freelance designers
META DESCRIPTION: Invoicing built for freelance designers who bill clients directly.
BODY: Pipely is invoicing for freelance designers. Create invoices in seconds. Track payments automatically. Send reminders without chasing clients. Connect your bank. Brand every invoice with your logo. Start free. No setup required.`;

const VERB_LED = /^(Write|Call|Ship|Send|Cut|Rewrite)\b/;

function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

function sentenceCount(s: string): number {
  return s.split(/(?<=[.!?])\s+/).filter((x) => x.trim().length > 0).length;
}

function checkShape(
  result: ReturnType<typeof buildFallbackDiagnosis>,
  page: string,
  expectedLabel: string,
) {
  // Label contract
  assert.equal(result.label, expectedLabel);
  assert.notEqual(result.label, "error");

  // Copy length contracts
  const hw = wordCount(result.headline);
  assert.ok(hw >= 6 && hw <= 12, `headline words ${hw}: "${result.headline}"`);
  const ew = wordCount(result.explanation);
  assert.ok(ew >= 80 && ew <= 120, `explanation words ${ew}`);
  const nw = wordCount(result.nextStep);
  assert.ok(nw >= 4 && nw <= 10, `nextStep words ${nw}: "${result.nextStep}"`);

  // Evidence honesty: top-level evidence must be an exact page substring.
  assert.ok(
    page.includes(result.evidence),
    `top-level evidence not a substring: "${result.evidence}"`,
  );

  // Scores: three axes, integers 1-10, 2-3 sentence diagnosis, substring evidence.
  for (const axis of ["wrong_person", "weak_offer", "weak_belief"] as const) {
    const a = result.scores[axis];
    assert.ok(Number.isInteger(a.score), `${axis} score integer`);
    assert.ok(a.score >= 1 && a.score <= 10, `${axis} score range`);
    const sc = sentenceCount(a.diagnosis);
    assert.ok(sc >= 2 && sc <= 3, `${axis} diagnosis sentences ${sc}`);
    assert.ok(Array.isArray(a.evidence), `${axis} evidence array`);
    for (const q of a.evidence) {
      assert.ok(
        page.includes(q),
        `${axis} evidence not a substring: "${q}"`,
      );
    }
  }

  // Rewrites: current must be extracted from the page; 3 alternates each.
  for (const block of [result.rewrites.hero_headline, result.rewrites.primary_cta]) {
    assert.ok(typeof block.current === "string" && block.current.length > 0);
    assert.ok(
      page.includes(block.current),
      `rewrite current not extracted from page: "${block.current}"`,
    );
    assert.equal(block.alternates.length, 3);
    for (const alt of block.alternates) assert.ok(typeof alt === "string" && alt.length > 0);
    assert.ok(typeof block.why_better === "string" && block.why_better.length > 0);
  }
  assert.ok(Array.isArray(result.rewrites.value_props.current));
  for (const c of result.rewrites.value_props.current) {
    assert.ok(page.includes(c), `value prop current not a substring: "${c}"`);
  }
  assert.ok(
    result.rewrites.value_props.rewritten.length ===
      result.rewrites.value_props.current.length,
  );

  // 30-day plan: four verb-led weeks, no filler verbs.
  const weeks = [
    result.plan_30_day.week1,
    result.plan_30_day.week2,
    result.plan_30_day.week3,
    result.plan_30_day.week4,
  ] as const;
  for (const [i, w] of weeks.entries()) {
    assert.ok(typeof w.theme === "string" && w.theme.length > 0, `week${i + 1} theme`);
    assert.ok(w.deliverables.length >= 3 && w.deliverables.length <= 5, `week${i + 1} count`);
    for (const d of w.deliverables) {
      assert.ok(VERB_LED.test(d), `week${i + 1} deliverable not verb-led: "${d}"`);
    }
  }

  // Competitors: array (empty is honest for the fallback).
  assert.ok(Array.isArray(result.competitors));

  // Strengths: 1-3 honest strings.
  assert.ok(
    result.strengths.length >= 1 && result.strengths.length <= 3,
    "strengths count",
  );
  for (const s of result.strengths) assert.ok(typeof s === "string" && s.length > 0);

  // Product snapshot fields.
  const ps = result.product_snapshot;
  assert.ok(typeof ps.name === "string" && ps.name.length > 0);
  assert.ok(typeof ps.one_liner === "string" && ps.one_liner.length > 0);
  assert.ok(typeof ps.audience_stated === "string");
  assert.ok(ps.pricing_visible === null || typeof ps.pricing_visible === "string");
}

describe("buildFallbackDiagnosis", () => {
  it("labels a generic-audience page wrong_person with honest evidence", () => {
    const result = buildFallbackDiagnosis(
      "https://taskflow.example.com",
      GENERIC_AUDIENCE_PAGE,
      "test: gateway 403",
    );
    checkShape(result, GENERIC_AUDIENCE_PAGE, "wrong_person");
  });

  it("labels a named-niche feature-list page weak_offer with honest evidence", () => {
    const result = buildFallbackDiagnosis(
      "https://pipely.example.com",
      FEATURE_LIST_PAGE,
      "test: provider unavailable",
    );
    checkShape(result, FEATURE_LIST_PAGE, "weak_offer");
  });

  it("never returns the error label for engine-side failure reasons", () => {
    for (const reason of [
      "403 no access to model",
      "provider unavailable",
      "timeout after 30000ms",
      "JSON parse failed",
    ]) {
      const r = buildFallbackDiagnosis(
        "https://taskflow.example.com",
        GENERIC_AUDIENCE_PAGE,
        reason,
      );
      assert.ok(r.label === "wrong_person" || r.label === "weak_offer" || r.label === "weak_belief");
    }
  });

  it("is deterministic for identical input", () => {
    const a = buildFallbackDiagnosis("https://taskflow.example.com", GENERIC_AUDIENCE_PAGE, "r1");
    const b = buildFallbackDiagnosis("https://taskflow.example.com", GENERIC_AUDIENCE_PAGE, "r2");
    assert.equal(JSON.stringify(a), JSON.stringify(b));
  });
});
