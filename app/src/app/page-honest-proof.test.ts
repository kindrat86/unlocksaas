import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

// Truth guard for the homepage: UnlockSaaS is pre-first-customer, so the page
// must never present invented customer outcomes as proof. Scoped to page.tsx
// on purpose; the "71%/29%" pattern is banned outright on this surface even
// though a legitimate number could theoretically collide someday.
const pageSource = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");

const forbidden: Array<[RegExp, string]> = [
  [/Tomas R\.|Aisha M\.|Wesley K\./, "invented named customer testimonials"],
  [/71%|29%/, "invented cohort outcome statistics"],
  [/median finisher|Median day to first dollar/i, "invented median outcome claim"],
  [/Founders who broke through/, "testimonial-section framing"],
  [/Shipped SaaS, zero customers\. Then this\./, "testimonial-section headline"],
  [/drawn from real closes/, "unsupported 'real closes' proof claim"],
  [/Most founders who finish get their first customer/, "unsupported FAQ outcome claim"],
];

test("homepage carries no invented customer proof", () => {
  for (const [pattern, label] of forbidden) {
    assert.doesNotMatch(
      pageSource,
      pattern,
      `homepage must not contain ${label}`,
    );
  }
});

test("homepage states the honest founding-customer position", () => {
  assert.match(
    pageSource,
    /No customer stories yet/,
    "homepage must state plainly that no customer stories exist yet",
  );
  assert.match(
    pageSource,
    /first founding customers/i,
    "homepage must offer the honest founding-customer position",
  );
});
