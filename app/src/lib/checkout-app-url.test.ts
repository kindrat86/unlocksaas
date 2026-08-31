import assert from "node:assert/strict";
import { test } from "node:test";
import { checkoutAppUrl } from "./checkout-app-url";

test("checkoutAppUrl uses the canonical production origin when the env value is missing", () => {
  assert.equal(checkoutAppUrl(undefined), "https://unlocksaas.com");
  assert.equal(checkoutAppUrl("   "), "https://unlocksaas.com");
});

test("checkoutAppUrl normalizes an explicit origin without breaking local development", () => {
  assert.equal(checkoutAppUrl("https://preview.example.com/"), "https://preview.example.com");
  assert.equal(checkoutAppUrl("http://localhost:3000/"), "http://localhost:3000");
});
