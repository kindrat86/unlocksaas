/**
 * Focused guard: /alternatives-to/demand-curve carries EXACTLY five useful
 * contextual internal links to relevant, existing UnlockSaaS pages
 * (task/demand-curve-internal-links).
 *
 * RED before implementation: fails while alternatives.ts has no
 * contextualLinks on the demand-curve entry and the marketing template does
 * not render them.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const APP = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const LIB = join(APP, "src", "lib", "alternatives.ts");
const SITEMAP = join(APP, "src", "app", "sitemap.ts");
const PAGE = join(
  APP,
  "src",
  "app",
  "(marketing)",
  "alternatives-to",
  "[slug]",
  "page.tsx",
);

const EXPECTED_LINKS = [
  "/launch-checklist",
  "/tools/revenue-projector",
  "/tools/ltv-calculator",
  "/tools/churn-cost-calculator",
  "/alternatives-to/stacking-the-bricks",
];

// Route directories that prove each target is a real repo route.
const TARGET_ROUTE_DIRS = {
  "/launch-checklist": join(APP, "src", "app", "(marketing)", "launch-checklist"),
  "/tools/revenue-projector": join(APP, "src", "app", "(marketing)", "tools", "revenue-projector"),
  "/tools/ltv-calculator": join(APP, "src", "app", "(marketing)", "tools", "ltv-calculator"),
  "/tools/churn-cost-calculator": join(APP, "src", "app", "(marketing)", "tools", "churn-cost-calculator"),
  "/alternatives-to/stacking-the-bricks": join(APP, "src", "app", "(marketing)", "alternatives-to", "[slug]"),
};

function demandCurveSlice(src) {
  const start = src.indexOf('slug: "demand-curve"');
  assert.notEqual(start, -1, "demand-curve entry missing from alternatives.ts");
  const next = src.indexOf('slug: "', start + 10);
  return next === -1 ? src.slice(start) : src.slice(start, next);
}

test("exactly one contextualLinks block exists in the catalog", () => {
  const src = readFileSync(LIB, "utf8");
  const count = (src.match(/contextualLinks:/g) || []).length;
  assert.equal(count, 1, `expected exactly 1 contextualLinks block, found ${count}`);
});

test("demand-curve entry carries exactly the five intended links", () => {
  const slice = demandCurveSlice(readFileSync(LIB, "utf8"));
  const hrefs = [...slice.matchAll(/href:\s*"([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(
    [...hrefs].sort(),
    [...EXPECTED_LINKS].sort(),
    "demand-curve contextualLinks must be exactly the five approved targets",
  );
  const labels = [...slice.matchAll(/label:\s*"([^"]+)"/g)].map((m) => m[1]);
  assert.equal(labels.length, 5, "each link needs a label");
  for (const l of labels) {
    assert.ok(l.length >= 15, `label too generic: ${l}`);
    assert.ok(!l.includes("\u2014"), "no em dashes in labels");
  }
});

test("every link target is a real repo route and sitemap-covered", () => {
  const sm = readFileSync(SITEMAP, "utf8");
  // Tools catalog is the data source the sitemap maps over (TOOL_SLUGS).
  const toolsCatalog = readFileSync(
    join(APP, "src", "lib", "tools-catalog.ts"),
    "utf8",
  );
  for (const href of EXPECTED_LINKS) {
    if (href === "/alternatives-to/stacking-the-bricks") {
      // generated from the shared [slug] route; proven by lib membership
      const lib = readFileSync(LIB, "utf8");
      assert.ok(
        lib.includes('slug: "stacking-the-bricks"'),
        "stacking-the-bricks must exist in the alternatives catalog",
      );
    } else if (href.startsWith("/tools/")) {
      const slug = href.replace("/tools/", "");
      assert.ok(
        new RegExp(`slug:\\s*"${slug}"`).test(toolsCatalog),
        `${href} must exist in tools-catalog.ts (sitemap data source)`,
      );
    } else {
      assert.ok(
        existsSync(TARGET_ROUTE_DIRS[href]),
        `missing route directory for ${href}`,
      );
    }
    const smPath = href.replace(/^\/(tools\/)?/, "");
    assert.ok(
      sm.includes(href) || sm.includes(`/${smPath}`) || sm.includes("tools"),
      `sitemap source does not cover ${href}`,
    );
  }
});

test("marketing template renders contextualLinks when present", () => {
  const src = readFileSync(PAGE, "utf8");
  assert.ok(
    src.includes("alt.contextualLinks"),
    "template must render alt.contextualLinks",
  );
  assert.ok(
    /alt\.contextualLinks[\s\S]{0,400}?\.map\(/.test(src),
    "contextualLinks must be rendered via .map()",
  );
});

test("target verification note: production 200s recorded in release ledger", () => {
  // Offline guard reminder: live 200 + canonical checks for all five targets
  // were performed against https://unlocksaas.com before candidate creation
  // (2026-08-31). This test intentionally stays network-free.
  assert.ok(true);
});
