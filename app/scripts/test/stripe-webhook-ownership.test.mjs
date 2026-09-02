import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const routeUrl = new URL(
  "../../src/app/api/webhooks/stripe/route.ts",
  import.meta.url
);
const packageUrl = new URL("../../package.json", import.meta.url);

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
  const ownershipGate = routeSource.indexOf(
    "const guardedPlatformEvent = await withOwnedStripeEvent("
  );
  const sideEffectCallback = routeSource.indexOf(
    "async () => {",
    ownershipGate
  );
  const firstSideEffect = routeSource.indexOf("markEventProcessed(event)");

  assert.notEqual(
    ownershipGate,
    -1,
    "the webhook must gate every subscribed platform event"
  );
  assert.ok(
    ownershipGate >= 0 &&
      sideEffectCallback > ownershipGate &&
      sideEffectCallback < firstSideEffect,
    "every platform side effect must run inside the fail-closed ownership callback"
  );

  const { isUnlockSaasCheckoutSession, withOwnedStripeEvent } = await import(
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
  assert.equal(typeof withOwnedStripeEvent, "function");
  let sideEffectCalls = 0;
  const guarded = await withOwnedStripeEvent(
    {
      id: "evt_gitdealflow_cross_product_incident",
      type: "checkout.session.completed",
      data: { object: foreignGitDealFlowSession },
    },
    {},
    async () => {
      sideEffectCalls += 1;
      return "side_effects_ran";
    }
  );
  assert.deepEqual(guarded, { owned: false });
  assert.equal(sideEffectCalls, 0);
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
    true
  );
});

test("foreign GitDealFlow invoice, subscription, and refund events fail closed", async () => {
  const ownership = await import("../../src/lib/stripe-checkout-ownership.ts");
  assert.equal(
    typeof ownership.isUnlockSaasStripeEventOwned,
    "function",
    "all subscribed event classes need an ownership classifier"
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
        {}
      ),
      false,
      `${type} must reject GitDealFlow resources`
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
    false
  );
});

test("incomplete Stripe line-item collections fail closed", async () => {
  const { isUnlockSaasStripeEventOwned } = await import(
    "../../src/lib/stripe-checkout-ownership.ts"
  );
  const ownedLine = {
    price: price("price_1TXpnoCwGoUDklReXiTaUUCi", "prod_UWtaOvavCvalmm"),
  };

  for (const [type, object] of [
    [
      "checkout.session.completed",
      {
        id: "cs_paginated_unlocksaas",
        payment_link: null,
        line_items: { data: [ownedLine], has_more: true },
      },
    ],
    [
      "invoice.payment_succeeded",
      {
        id: "in_paginated_unlocksaas",
        lines: { data: [ownedLine], has_more: true },
      },
    ],
    [
      "customer.subscription.updated",
      {
        id: "sub_paginated_unlocksaas",
        items: { data: [ownedLine], has_more: true },
      },
    ],
  ]) {
    assert.equal(
      await isUnlockSaasStripeEventOwned({ type, data: { object } }, {}),
      false,
      `${type} must reject an incomplete line-item collection`
    );
  }
});

test("refund ownership resolves an invoice ID using Stripe v22 pricing fields", async () => {
  const { isUnlockSaasStripeEventOwned } = await import(
    "../../src/lib/stripe-checkout-ownership.ts"
  );
  const retrieveCalls = [];
  const stripe = {
    invoices: {
      async retrieve(...args) {
        retrieveCalls.push(args);
        return {
          id: "in_unlocksaas_refund",
          lines: {
            data: [
              {
                pricing: {
                  price_details: {
                    price: "price_1TXpnoCwGoUDklReXiTaUUCi",
                    product: "prod_UWtaOvavCvalmm",
                  },
                },
              },
            ],
            has_more: false,
          },
        };
      },
    },
  };

  assert.equal(
    await isUnlockSaasStripeEventOwned(
      {
        type: "charge.refunded",
        data: {
          object: {
            id: "ch_unlocksaas_refund",
            invoice: "in_unlocksaas_refund",
          },
        },
      },
      stripe
    ),
    true
  );
  assert.deepEqual(retrieveCalls, [["in_unlocksaas_refund"]]);
});

test("refund payment-intent lookup rejects an incomplete Checkout Session page", async () => {
  const { isUnlockSaasStripeEventOwned } = await import(
    "../../src/lib/stripe-checkout-ownership.ts"
  );
  const stripe = {
    checkout: {
      sessions: {
        async list() {
          return {
            data: [
              {
                id: "cs_unlocksaas_refund_page_one",
                payment_link: null,
                line_items: {
                  data: [
                    {
                      price: price(
                        "price_1TXpnoCwGoUDklReXiTaUUCi",
                        "prod_UWtaOvavCvalmm",
                      ),
                    },
                  ],
                },
              },
            ],
            has_more: true,
          };
        },
      },
    },
  };

  assert.equal(
    await isUnlockSaasStripeEventOwned(
      {
        type: "charge.refunded",
        data: {
          object: {
            id: "ch_unlocksaas_paginated_refund",
            payment_intent: "pi_unlocksaas_paginated_refund",
          },
        },
      },
      stripe,
    ),
    false,
  );
});

test("refund payment-intent lookup rejects mixed Checkout Session ownership", async () => {
  const { isUnlockSaasStripeEventOwned } = await import(
    "../../src/lib/stripe-checkout-ownership.ts"
  );
  const stripe = {
    checkout: {
      sessions: {
        async list() {
          return {
            data: [
              {
                id: "cs_unlocksaas_refund_owned",
                payment_link: null,
                line_items: {
                  data: [
                    {
                      price: price(
                        "price_1TXpnoCwGoUDklReXiTaUUCi",
                        "prod_UWtaOvavCvalmm",
                      ),
                    },
                  ],
                },
              },
              {
                id: INCIDENT_SESSION_ID,
                payment_link: FOREIGN_PAYMENT_LINK_ID,
                line_items: { data: [foreignLine()] },
              },
            ],
            has_more: false,
          };
        },
      },
    },
  };

  assert.equal(
    await isUnlockSaasStripeEventOwned(
      {
        type: "charge.refunded",
        data: {
          object: {
            id: "ch_mixed_checkout_sessions",
            payment_intent: "pi_mixed_checkout_sessions",
          },
        },
      },
      stripe,
    ),
    false,
  );
});

test("owned checkout, invoice, subscription, and refund event shapes remain accepted", async () => {
  const { isUnlockSaasStripeEventOwned } = await import(
    "../../src/lib/stripe-checkout-ownership.ts"
  );
  const ownedLine = {
    price: price("price_1TXpnoCwGoUDklReXiTaUUCi", "prod_UWtaOvavCvalmm"),
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
      {}
    ),
    true
  );
  assert.equal(
    await isUnlockSaasStripeEventOwned(
      { type: "invoice.payment_succeeded", data: { object: invoice } },
      {}
    ),
    true
  );
  assert.equal(
    await isUnlockSaasStripeEventOwned(
      { type: "customer.subscription.updated", data: { object: subscription } },
      {}
    ),
    true
  );
  assert.equal(
    await isUnlockSaasStripeEventOwned(
      {
        type: "charge.refunded",
        data: { object: { id: "ch_unlocksaas", invoice } },
      },
      {}
    ),
    true
  );
});

test("prebuild declares a Node runtime that supports native TypeScript stripping", async () => {
  const packageJson = JSON.parse(await readFile(packageUrl, "utf8"));

  assert.equal(packageJson.engines?.node, ">=22.6.0");
  assert.match(
    packageJson.scripts?.prebuild ?? "",
    /--disable-warning=MODULE_TYPELESS_PACKAGE_JSON --experimental-strip-types --test scripts\/test\/stripe-webhook-ownership\.test\.mjs/
  );
});
