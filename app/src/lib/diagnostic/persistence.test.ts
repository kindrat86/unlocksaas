import test from "node:test";
import assert from "node:assert/strict";
import {
  insertedDiagnosticLeadId,
  newDiagnosticLeadId,
} from "./persistence";

test("newDiagnosticLeadId returns unique UUIDs for SQLite-backed inserts", () => {
  const first = newDiagnosticLeadId();
  const second = newDiagnosticLeadId();

  assert.match(first, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  assert.match(second, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  assert.notEqual(first, second);
});

test("insertedDiagnosticLeadId accepts Postgres object and SQLite array shapes", () => {
  const id = "2d76d22d-4271-4172-84db-0d1d7966b75e";

  assert.equal(insertedDiagnosticLeadId({ id }), id);
  assert.equal(insertedDiagnosticLeadId([{ id }]), id);
  assert.equal(insertedDiagnosticLeadId([]), null);
  assert.equal(insertedDiagnosticLeadId(null), null);
});
