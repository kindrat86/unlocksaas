import assert from "node:assert/strict";
import test from "node:test";

import { localSubscriberId, subscriberUpsertId } from "./subscriber-link.ts";

test("engine rescue sentinel is not persisted as a local foreign key", () => {
  assert.equal(localSubscriberId("engine-fallback"), null);
});

test("real local subscriber id is preserved", () => {
  assert.equal(localSubscriberId("subscriber-123"), "subscriber-123");
});

test("missing subscriber id stays null", () => {
  assert.equal(localSubscriberId(undefined), null);
});

test("subscriber upsert preserves an existing id", () => {
  assert.equal(subscriberUpsertId("subscriber-123"), "subscriber-123");
});

test("subscriber upsert generates a UUID for a new row", () => {
  assert.match(
    subscriberUpsertId(null),
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
  );
});
