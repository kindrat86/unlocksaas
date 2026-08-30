import { randomUUID } from "node:crypto";

/**
 * SQLite TEXT primary keys do not auto-generate UUIDs and may accept NULL.
 * Generate the diagnostic lead ID in the app before inserting the row.
 */
export function newDiagnosticLeadId(): string {
  return randomUUID();
}

/**
 * The Postgres client returns one object for `.single()`. The Mac mini shim
 * currently returns the inserted row array. Accept both while the app uses the
 * shim so a successful insert is not mistaken for a persistence failure.
 */
export function insertedDiagnosticLeadId(data: unknown): string | null {
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== "object") return null;
  const id = (row as { id?: unknown }).id;
  return typeof id === "string" && id.length > 0 ? id : null;
}
