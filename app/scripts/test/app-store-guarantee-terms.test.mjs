import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { APP_STORE_GUARANTEE_TERMS } from "../../src/lib/guarantee-proof.ts";

const APP_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const read = (relativePath) => readFileSync(resolve(APP_ROOT, relativePath), "utf8");

const APPROVED_TERMS =
  "First-customer results may be verified through connected Stripe. For App Store-distributed products, App Store Connect or RevenueCat sales evidence may be reviewed manually against an agreed starting baseline and 60-day measurement window. Customer personal data may be redacted. The existing completion requirements, refund amount, and 60-day deadline remain unchanged.";

test("App Store guarantee terms preserve the approved payload exactly", () => {
  assert.equal(APP_STORE_GUARANTEE_TERMS, APPROVED_TERMS);
});

test("approved App Store terms appear on every buyer-facing guarantee surface", () => {
  const requiredSurfaces = [
    "src/app/(marketing)/terms/page.tsx",
    "src/app/(marketing)/playbook-sales/page.tsx",
    "src/app/(app)/playbook/step/[id]/conversion-verifier.tsx",
    "src/app/(app)/onboarding/page.tsx",
    "src/app/llms-feed.json/route.ts",
    "src/lib/seo/markdown.ts",
  ];

  for (const surface of requiredSurfaces) {
    const source = read(surface);
    assert.match(
      source,
      /APP_STORE_GUARANTEE_TERMS/,
      `${surface} must use the canonical approved terms`,
    );
  }
});

test("soap-opera E3 describes the App Store proof path in the guarantee pitch", () => {
  const source = read("src/lib/soap-opera/emails.ts");
  assert.match(
    source,
    /operator-reviewed App Store Connect or RevenueCat evidence/,
    "E3 must disclose the App Store proof path alongside Stripe",
  );
});

test("strategy state records the same approved App Store proof contract", () => {
  const state = JSON.parse(read("../strategy/state.json"));
  assert.equal(
    state.dotcom_secrets.offer_stack.guarantee.app_store_proof_terms,
    APPROVED_TERMS,
  );
});
