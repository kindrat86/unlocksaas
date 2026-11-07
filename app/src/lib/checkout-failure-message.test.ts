/**
 * Buyer-facing checkout failure copy.
 * Run: node --experimental-strip-types --test src/lib/checkout-failure-message.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  CHECKOUT_COULD_NOT_START_MESSAGE,
  FOUNDING_COHORT_CLOSED_MESSAGE,
  buyerCheckoutErrorMessage,
} from "./checkout-failure-message.ts";

test("a closed founding cart tells the buyer the cohort is full or closed", () => {
  assert.equal(
    buyerCheckoutErrorMessage({ status: 409, error: "founding_cart_closed" }),
    FOUNDING_COHORT_CLOSED_MESSAGE,
  );
  assert.equal(
    buyerCheckoutErrorMessage({ status: 409 }),
    FOUNDING_COHORT_CLOSED_MESSAGE,
  );
  assert.equal(
    buyerCheckoutErrorMessage({ error: "founding_cart_closed" }),
    FOUNDING_COHORT_CLOSED_MESSAGE,
  );
  assert.match(FOUNDING_COHORT_CLOSED_MESSAGE, /founding cohort is full or closed/i);
});

test("every other checkout failure asks the buyer to retry or contact support", () => {
  for (const input of [
    {},
    { status: 400, error: "Invalid price type" },
    { status: 403, error: "bot_detected" },
    { status: 429, error: "rate_limited" },
    { status: 502, error: "Could not open checkout. Try again in a minute." },
    { status: 503, error: "offer_disabled" },
    { status: 500 },
  ]) {
    assert.equal(buyerCheckoutErrorMessage(input), CHECKOUT_COULD_NOT_START_MESSAGE);
  }
  assert.match(CHECKOUT_COULD_NOT_START_MESSAGE, /couldn't start/i);
  assert.match(CHECKOUT_COULD_NOT_START_MESSAGE, /try again or contact support/i);
});

test("the Core checkout button renders the failure instead of resetting silently", () => {
  const source = readFileSync(
    new URL("../components/checkout-button.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /buyerCheckoutErrorMessage/);
  assert.match(source, /role="alert"/);
  assert.match(source, /if \(res\.ok && data\.url\)/);
  assert.doesNotMatch(
    source,
    /const \{ url \} = await res\.json\(\);\s*if \(url\)/,
  );
});

test("the founding claim button uses the same buyer-facing failure copy", () => {
  const source = readFileSync(
    new URL("../app/(marketing)/founding/claim-button.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /buyerCheckoutErrorMessage\(\{ status: res\.status, error: data\.error \}\)/);
  assert.doesNotMatch(source, /data\.error \?\?/);
});
