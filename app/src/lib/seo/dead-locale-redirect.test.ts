/**
 * Tests for deadLocaleRedirect — the GSC 404-wave remediation module.
 * Standalone: node:test + tsx (no vitest/jest dependency).
 * Run: npx tsx --test src/lib/seo/dead-locale-redirect.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { deadLocaleRedirect } from "./dead-locale-redirect";

describe("deadLocaleRedirect", () => {
  it("redirects retired locale codes to English canonicals", () => {
    const cases: Array<[string, string]> = [
      ["/de/faq", "/faq"],
      ["/fr/vs", "/vs"],
      ["/ja/glossary", "/glossary"],
      ["/it/faq", "/faq"],
      ["/nl/benchmarks", "/benchmarks"],
      ["/ko/faq", "/faq"],
      ["/ru/vs/tally-vs-typeform", "/vs/tally-vs-typeform"],
      ["/zh-CN/faq", "/faq"],
      ["/zh-cn/faq", "/faq"],
      ["/uk/faq", "/faq"],
      ["/de", "/"],
      ["/fr", "/"],
      ["/de/faq/", "/faq"],
    ];
    for (const [input, expected] of cases) {
      assert.equal(deadLocaleRedirect(input), expected, `input=${input}`);
    }
  });

  it("keeps live approved translations", () => {
    for (const p of ["/es/faq", "/pt-BR/faq", "/es/glossary", "/pt-BR/benchmarks", "/es/benchmarks", "/pt-br/faq"]) {
      assert.equal(deadLocaleRedirect(p), null, `should serve ${p}`);
    }
  });

  it("redirects live-locale paths that were never approved", () => {
    const cases: Array<[string, string]> = [
      ["/es/vs", "/vs"],
      ["/pt-BR/answers", "/answers"],
      ["/es/repeatable", "/repeatable"],
      ["/es/glossary/hook", "/glossary/hook"],
      ["/pt-br/vs", "/vs"],
    ];
    for (const [input, expected] of cases) {
      assert.equal(deadLocaleRedirect(input), expected, `input=${input}`);
    }
  });

  it("ignores plain English paths", () => {
    for (const p of ["/faq", "/vs/tally-vs-typeform", "/", "/diagnostic", "/vs", "/alternatives-to/lovable"]) {
      assert.equal(deadLocaleRedirect(p), null, `should not touch ${p}`);
    }
  });

  it("ignores assets and machine-readable paths", () => {
    for (const p of [
      "/es/faq.json", "/de/llms.txt", "/fr/feed.xml", "/api/es/faq",
      "/.well-known/mcp.json", "/feed/podcast.rss", "/vs/loom.png",
      "/ja/alternatives-to/lovable.md",
    ]) {
      assert.equal(deadLocaleRedirect(p), null, `should not touch ${p}`);
    }
  });
});
