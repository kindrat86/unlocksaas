import test from "node:test";
import assert from "node:assert/strict";
import { newDiagnosticLeadId } from "./persistence";

test("newDiagnosticLeadId returns unique UUIDs for SQLite-backed inserts", () => {
  const first = newDiagnosticLeadId();
  const second = newDiagnosticLeadId();

  assert.match(first, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  assert.match(second, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  assert.notEqual(first, second);
});
