import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const APP_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const read = (relativePath) => readFileSync(resolve(APP_ROOT, relativePath), "utf8");

test("founding checkout keeps one canonical 100-seat cap", () => {
  const cohort = read("src/lib/founding/cohort.ts");
  const seats = read("src/app/(marketing)/founding/seats.ts");

  assert.match(cohort, /export const FOUNDING_COHORT_CAP = 100;/);
  assert.match(
    seats,
    /export \{ FOUNDING_COHORT_CAP as FOUNDING_COHORT_SIZE \} from "@\/lib\/founding\/cohort";/,
  );
});

test("founding CTA creates a recurring Playbook checkout", () => {
  const button = read("src/app/(marketing)/founding/claim-button.tsx");
  const checkout = read("src/app/api/checkout/route.ts");

  assert.match(button, /priceType: "playbook"/);
  assert.match(button, /\$49\/mo/);
  assert.match(checkout, /if \(priceType === "playbook"\)/);
  assert.match(checkout, /mode: "subscription"/);
  assert.match(checkout, /price: process\.env\.STRIPE_MACHINE_PRICE_ID!/);
});

test("founding window fails closed unless both timestamps are valid", () => {
  const cohort = read("src/lib/founding/cohort.ts");

  assert.match(cohort, /if \(!openAt \|\| !closeAt\)/);
  assert.match(cohort, /closeAt <= openAt/);
  assert.match(cohort, /seatsClaimedOrNull\(\): Promise<number \| null>/);
  assert.match(cohort, /if \(!hasSupabaseAdminConfig\(\)\) return null;/);
});

test("UI and checkout API use the same server-side founding gate", () => {
  const page = read("src/app/(marketing)/founding/page.tsx");
  const checkout = read("src/app/api/checkout/route.ts");

  assert.match(page, /foundingCartStatus\(\)/);
  assert.match(checkout, /if \(priceType === "playbook"\)/);
  assert.match(checkout, /await isCartOpen\(\)/);
  assert.match(checkout, /founding_cart_closed/);
  const playbookBranch = checkout.indexOf('if (priceType === "playbook") {');
  assert.ok(
    checkout.indexOf("await isCartOpen()", playbookBranch) <
      checkout.indexOf("checkout.sessions.create({", playbookBranch),
    "the server gate must run before the Playbook Stripe session is created",
  );
});
