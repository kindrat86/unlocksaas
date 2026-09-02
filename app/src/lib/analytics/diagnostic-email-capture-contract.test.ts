import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const helperSource = readFileSync(
  new URL("./email-capture.ts", import.meta.url),
  "utf8",
);
const syncRouteSource = readFileSync(
  new URL("../../app/api/diagnostic/route.ts", import.meta.url),
  "utf8",
);
const streamRouteSource = readFileSync(
  new URL("../../app/api/diagnostic/stream/route.ts", import.meta.url),
  "utf8",
);

function between(source: string, start: string, end: string): string {
  const startAt = source.indexOf(start);
  const endAt = source.indexOf(end, startAt + start.length);
  assert.notEqual(startAt, -1, `missing start marker: ${start}`);
  assert.notEqual(endAt, -1, `missing end marker: ${end}`);
  return source.slice(startAt, endAt);
}

test("email capture awaits immediate PostHog delivery without sending the address", () => {
  const captureCall = between(
    helperSource,
    "await captureServerAndFlush(",
    "} satisfies DiagnosticEmailCapturedProps",
  );

  assert.match(
    captureCall,
    /`lead:\$\{leadId\}`, Event\.DiagnosticEmailCaptured/,
  );
  assert.match(captureCall, /email_domain:/);
  assert.match(captureCall, /lead_id: leadId/);
  assert.match(captureCall, /capture_surface/);
  assert.doesNotMatch(captureCall, /\n\s+email:/);
});

test("synchronous diagnostic captures only after this request inserts a lead", () => {
  const insertedBranch = between(
    syncRouteSource,
    "if (data?.id) {",
    'if ((error as { code?: string } | null)?.code === "23505")',
  );
  const raceBranch = between(
    syncRouteSource,
    'if ((error as { code?: string } | null)?.code === "23505")',
    'console.error("[diagnostic] db insert failed"',
  );

  assert.match(insertedBranch, /await captureDiagnosticEmail\(\{/);
  assert.match(insertedBranch, /leadId: data\.id as string/);
  assert.match(insertedBranch, /capture_surface: "sync"/);
  assert.doesNotMatch(raceBranch, /captureDiagnosticEmail/);
});

test("streaming diagnostic gates capture on the inserted row, not race recovery", () => {
  const postInsertBranch = between(
    streamRouteSource,
    "const insertedRowId = insertedDiagnosticLeadId(data);",
    "// Persistent founder memory",
  );

  assert.match(
    postInsertBranch,
    /if \(insertedRowId\) \{\s+await captureDiagnosticEmail\(\{/,
  );
  assert.match(postInsertBranch, /leadId: insertedRowId/);
  assert.match(postInsertBranch, /capture_surface: "stream"/);
});
