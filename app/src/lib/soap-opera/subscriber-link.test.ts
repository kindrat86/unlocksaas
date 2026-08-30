import assert from "node:assert/strict";
import test from "node:test";

import { localSubscriberId } from "./subscriber-link.ts";

test("engine rescue sentinel is not persisted as a local foreign key", () => {
  assert.equal(localSubscriberId("engine-fallback"), null);
});

test("real local subscriber id is preserved", () => {
  assert.equal(localSubscriberId("subscriber-123"), "subscriber-123");
});

test("missing subscriber id stays null", () => {
  assert.equal(localSubscriberId(undefined), null);
});
