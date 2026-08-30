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
});
