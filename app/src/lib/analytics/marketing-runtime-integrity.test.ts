import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const layoutSource = readFileSync(
  new URL("../../app/layout.tsx", import.meta.url),
  "utf8",
);
const nextConfigSource = readFileSync(
  new URL("../../../next.config.mjs", import.meta.url),
  "utf8",
);
const playbookSalesSource = readFileSync(
  new URL("../../app/(marketing)/playbook-sales/page.tsx", import.meta.url),
  "utf8",
);

test("root html tolerates the class mutation performed by next-themes", () => {
  assert.match(
    layoutSource,
    /<html[^>]*\bsuppressHydrationWarning\b[^>]*>/,
    "RootLayout must set suppressHydrationWarning on <html> when next-themes controls its class",
  );
});

test("CSP permits the PostHog SDK asset host used in production", () => {
  const host = "https://eu-assets.i.posthog.com";
  const scriptDirective = nextConfigSource.match(/`script-src[^`]+`/)?.[0] ?? "";
  const connectDirective = nextConfigSource.match(/"connect-src[^"]+"/)?.[0] ?? "";

  assert.ok(
    scriptDirective.includes(host),
    `script-src must permit ${host}`,
  );
  assert.ok(
    connectDirective.includes(host),
    `connect-src must permit ${host}`,
  );
});

test("root layout does not run DOM-mutating ux.js before React hydration", () => {
  assert.doesNotMatch(
    layoutSource,
    /<script\s+src="\/ux\.js"/,
    "ux.js mutates document.body at DOMContentLoaded and must not run ahead of React hydration",
  );
});

test("above-the-fold Core checkout keeps readable primary-button styling", () => {
  const match = playbookSalesSource.match(
    /<CheckoutButton[\s\S]*?>\s*Skip the story[^<]*<\/CheckoutButton>/,
  );
  assert.ok(match, "expected the above-the-fold Core checkout button");
  assert.doesNotMatch(
    match[0],
    /text-muted-foreground|px-0|py-0/,
    "the primary checkout button must not override its contrast or padding with link-like muted styles",
  );
  assert.match(
    match[0],
    /bg-\[#047857\][^\"]*text-white/,
    "the primary checkout button must use the measured AA-compliant foreground/background pair",
  );
});
