import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const checkoutRoute = readFileSync(
  new URL("../../app/api/checkout/route.ts", import.meta.url),
  "utf8",
);

function branchBetween(start: string, end: string): string {
  const startAt = checkoutRoute.indexOf(start);
  const endAt = checkoutRoute.indexOf(end, startAt + start.length);
  assert.notEqual(startAt, -1, `missing branch start: ${start}`);
  assert.notEqual(endAt, -1, `missing branch end: ${end}`);
  return checkoutRoute.slice(startAt, endAt);
}

test("Starter checkout waits for a flushed server-side intent capture", () => {
  const branch = branchBetween(
    'if (priceType === "starter")',
    'if (priceType === "playbook")',
  );
  assert.match(
    branch,
    /await captureServerAndFlush\(distinctId, Event\.CheckoutSessionCreated/,
  );
});

test("Core checkout waits for a flushed server-side intent capture", () => {
  const branch = branchBetween(
    'if (priceType === "playbook")',
    "// OTO chain",
  );
  assert.match(
    branch,
    /await captureServerAndFlush\(distinctId, Event\.CheckoutSessionCreated/,
  );
});
