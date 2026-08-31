import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const serverSource = readFileSync(new URL("./server.ts", import.meta.url), "utf8");

function functionBody(start: string, end: string): string {
  const startAt = serverSource.indexOf(start);
  const endAt = serverSource.indexOf(end, startAt + start.length);
  assert.notEqual(startAt, -1, `missing function start: ${start}`);
  assert.notEqual(endAt, -1, `missing function end: ${end}`);
  return serverSource.slice(startAt, endAt);
}

test("critical server capture awaits the SDK immediate delivery boundary", () => {
  const body = functionBody(
    "export async function captureServerAndFlush(",
    "/**\n * Identify a user",
  );

  assert.match(body, /await client\.captureImmediate\(\{/);
  assert.doesNotMatch(body, /client\.capture\(\{/);
  assert.doesNotMatch(body, /await client\.flush\(\)/);
});
