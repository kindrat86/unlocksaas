import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const routeUrl = new URL(
  "../../src/app/api/webhooks/stripe/route.ts",
  import.meta.url,
);

const FOREIGN_PRODUCT_ID = "prod_UT0aPLSENVCw5o";
const FOREIGN_PRICE_ID = "price_1TU4ZuCwGoUDklRev3fh8xib";
const FOREIGN_PAYMENT_LINK_ID = "plink_1TU4ZvCwGoUDklReEjuprkH0";
const INCIDENT_SESSION_ID =
  "cs_live_b1YT1hupteOe5cvg90saJZYucg9Zu9v2MJsJ2RZArs4NTxnpp27pUle8GT";

function price(id = FOREIGN_PRICE_ID, product = FOREIGN_PRODUCT_ID) {
  return { id, product };
}

function foreignLine() {
  return { price: price() };
}

test("foreign GitDealFlow checkout completion is ignored before webhook side effects", async () => {
  const routeSource = await readFile(routeUrl, "utf8");
  const ownershipGate = routeSource.indexOf("isUnlockSaasStripeEventOwned(event");
  const firstSideEffect = routeSource.indexOf("markEventProcessed(event)");

  assert.notEqual(
    ownershipGate,
    -1,
    "the webhook must gate every subscribed platform event",
  );
  assert.ok(
    ownershipGate < firstSideEffect,
    "ownership must be checked before markEventProcessed or any downstream side effect",
  );

  const { isUnlockSaasCheckoutSession } = await import(
    "../../src/lib/stripe-checkout-ownership.ts"
  );
  const foreignGitDealFlowSession = {
    id: INCIDENT_SESSION_ID,
    object: "checkout.session",
    mode: "payment",
    payment_status: "paid",
    amount_total: 100,
    currency: "eur",
    payment_link: FOREIGN_PAYMENT_LINK_ID,
    metadata: {
      source: "landing-tripwire",
      tier: "teardown",
      product: FOREIGN_PRODUCT_ID,
      price_type: "starter",
    },
    line_items: { data: [foreignLine()] },
  };

  assert.equal(isUnlockSaasCheckoutSession(foreignGitDealFlowSession), false);
  assert.equal(
    isUnlockSaasCheckoutSession({
      ...foreignGitDealFlowSession,
      payment_link: null,
      metadata: { price_type: "starter" },
      line_items: {
        data: [
          {
            price: {
              id: "price_1TXpnmCwGoUDklRePhZmxviJ",
              product: "prod_UWtacLp86YrSuO",
            },
          },
        ],
      },
    }),
    true,
  );
});

test("foreign GitDealFlow invoice, subscription, and refund events fail closed", async () => {
  const ownership = await import("../../src/lib/stripe-checkout-ownership.ts");
  assert.equal(
    typeof ownership.isUnlockSaasStripeEventOwned,
    "function",
    "all subscribed event classes need an ownership classifier",
  );

  const foreignInvoice = {
    id: "in_foreign_gitdealflow",
    object: "invoice",
    customer: "cus_foreign_gitdealflow",
    lines: { data: [foreignLine()] },
  };
  const foreignSubscription = {
    id: "sub_foreign_gitdealflow",
    object: "subscription",
    customer: "cus_foreign_gitdealflow",
    items: { data: [foreignLine()] },
  };
  const foreignRefund = {
    id: "ch_foreign_gitdealflow_refund",
    object: "charge",
    customer: "cus_foreign_gitdealflow",
    amount: 100,
    amount_refunded: 100,
    currency: "eur",
    invoice: foreignInvoice,
  };

  for (const [type, object] of [
    ["invoice.payment_succeeded", foreignInvoice],
    ["invoice.payment_failed", foreignInvoice],
    ["customer.subscription.created", foreignSubscription],
    ["customer.subscription.updated", foreignSubscription],
    ["customer.subscription.deleted", foreignSubscription],
    ["charge.refunded", foreignRefund],
  ]) {
    assert.equal(
      await ownership.isUnlockSaasStripeEventOwned(
        { type, data: { object } },
        {},
      ),
      false,
      `${type} must reject GitDealFlow resources`,
    );
  }
});

test("checkout fails closed when any line item lacks ownership evidence", async () => {
  const { isUnlockSaasCheckoutSession } = await import(
    "../../src/lib/stripe-checkout-ownership.ts"
  );
  assert.equal(
    isUnlockSaasCheckoutSession({
      id: "cs_mixed_owned_and_unclassified",
      payment_link: null,
      line_items: {
        data: [
          {
            price: {
              id: "price_1TXpnoCwGoUDklReXiTaUUCi",
              product: "prod_UWtaOvavCvalmm",
            },
          },
          {},
        ],
      },
    }),
    false,
  );
});

test("owned checkout, invoice, subscription, and refund event shapes remain accepted", async () => {
  const { isUnlockSaasStripeEventOwned } = await import(
    "../../src/lib/stripe-checkout-ownership.ts"
  );
  const ownedLine = {
    price: price(
      "price_1TXpnoCwGoUDklReXiTaUUCi",
      "prod_UWtaOvavCvalmm",
    ),
  };
  const invoice = {
    id: "in_unlocksaas",
    object: "invoice",
    lines: { data: [ownedLine] },
  };
  const subscription = {
    id: "sub_unlocksaas",
    object: "subscription",
    items: { data: [ownedLine] },
  };

  assert.equal(
    await isUnlockSaasStripeEventOwned(
      {
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_unlocksaas",
            payment_link: null,
            line_items: { data: [ownedLine] },
          },
        },
      },
      {},
    ),
    true,
  );
  assert.equal(
    await isUnlockSaasStripeEventOwned(
      { type: "invoice.payment_succeeded", data: { object: invoice } },
      {},
    ),
    true,
  );
  assert.equal(
    await isUnlockSaasStripeEventOwned(
      { type: "customer.subscription.updated", data: { object: subscription } },
      {},
    ),
    true,
  );
  assert.equal(
    await isUnlockSaasStripeEventOwned(
      {
        type: "charge.refunded",
        data: { object: { id: "ch_unlocksaas", invoice } },
      },
      {},
    ),
    true,
  );
});
