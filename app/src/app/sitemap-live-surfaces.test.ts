/**
 * Regression coverage for public, canonical pages that GSC has already shown
 * in Search Analytics. These must remain sitemap-listed.
 * Run: npx tsx --test src/app/sitemap-live-surfaces.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const sitemapSource = readFileSync(join(process.cwd(), "src/app/sitemap.ts"), "utf8");

describe("sitemap public live surfaces", () => {
  it("lists canonical GSC-discovered public pages", () => {
    for (const path of ["/ad-library", "/community-atlas", "/who"]) {
      assert.equal(
        sitemapSource.includes(`url: \`${"${base}"}${path}\``),
        true,
        `${path} must remain in the sitemap`,
      );
    }
  });

  // 2026-11-03 pivot phase 1 (honesty cleanup): the templated
  // /funnel-playbook, /vs and /why-isnt-my families stay publicly
  // accessible (200) but are noindexed and must never re-enter the
  // sitemap. Listing a noindex URL in the sitemap is contradictory and
  // GSC reports it as "Excluded by 'noindex' tag".
  it("does not list the noindexed templated families", () => {
    for (const path of ["/funnel-playbook", "/vs", "/why-isnt-my"]) {
      assert.equal(
        sitemapSource.includes(`url: \`${"${base}"}${path}\``),
        false,
        `${path} is noindexed and must not be sitemap-listed`,
      );
      assert.equal(
        sitemapSource.includes(`url: \`${"${base}"}${path}/`),
        false,
        `${path}/<slug> details are noindexed and must not be sitemap-listed`,
      );
    }
  });
});
