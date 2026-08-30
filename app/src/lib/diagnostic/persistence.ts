import { randomUUID } from "node:crypto";

/**
 * SQLite TEXT primary keys do not auto-generate UUIDs and may accept NULL.
 * Generate the diagnostic lead ID in the app before inserting the row.
 */
export function newDiagnosticLeadId(): string {
  return randomUUID();
}
