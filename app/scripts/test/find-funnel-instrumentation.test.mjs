/**
 * /find funnel instrumentation contract (traffic-drop-fix 2026-11-05).
 *
 * The 2026-11-04 traffic audit found the pivot tool shipped with ZERO named
 * events — pageviews alone cannot distinguish a real tool run from a bounce,
 * so the pivot was unmeasurable. This test pins the contract so a refactor
 * cannot silently drop it again:
 *
 *  1. events.ts exports the five find_* names (snake_case, never renamed —
 *     historical reports break on rename).
 *  2. find-tool.tsx actually fires run_submitted / results_viewed /
 *     run_failed / draft_copied.
 *  3. find/page.tsx mounts a PageViewTracker with find_page_viewed.
 *  4. CopyButton invokes onCopied exactly on the success path (the event is
 *     a copy confirmation, not a click).
 *
 * Source-contract style (same as demand-curve-contextual-links.test.mjs):
 * greps the real source files; no DOM needed.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const APP_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

const read = (rel) => readFileSync(resolve(APP_ROOT, rel), "utf8");

test("events.ts exports the five find_* funnel event names", () => {
  const src = read("src/lib/analytics/events.ts");
  for (const name of [
    "find_page_viewed",
    "find_run_submitted",
    "find_results_viewed",
    "find_run_failed",
    "find_draft_copied",
  ]) {
    assert.ok(
      src.includes(`"${name}"`),
      `events.ts must define the event name "${name}"`
    );
  }
});

test("find-tool.tsx fires run_submitted, results_viewed and run_failed", () => {
  const src = read("src/components/find/find-tool.tsx");
  assert.ok(
    src.includes("Event.FindRunSubmitted"),
    "find-tool must track find_run_submitted when a run starts"
  );
  assert.ok(
    src.includes("Event.FindResultsViewed"),
    "find-tool must track find_results_viewed when results render"
  );
  assert.ok(
    src.includes("Event.FindRunFailed"),
    "find-tool must track find_run_failed on both failure paths (HTTP error + network error)"
  );
  const failedCalls = src.split("Event.FindRunFailed").length - 1;
  assert.equal(
    failedCalls,
    2,
    "both failure paths (non-OK response and thrown fetch) must fire find_run_failed"
  );
});

test("find-tool.tsx fires draft_copied with source context via CopyButton onCopied", () => {
  const src = read("src/components/find/find-tool.tsx");
  assert.ok(
    src.includes("Event.FindDraftCopied"),
    "copying a reply draft must fire find_draft_copied"
  );
  assert.ok(
    /onCopied=\{[^}]*FindDraftCopied[^}]*\}/s.test(src),
    "find_draft_copied must be wired through CopyButton's onCopied (success path only)"
  );
});

test("copy-button.tsx calls onCopied only after a successful clipboard write", () => {
  const src = read("src/components/copy-button.tsx");
  const okIdx = src.indexOf("onCopied?.();");
  const copiedIdx = src.indexOf('setState("copied");');
  const tryIdx = src.indexOf("try {");
  assert.ok(okIdx > -1, "copy-button must invoke onCopied?.()");
  assert.ok(
    tryIdx > -1 && copiedIdx > tryIdx && okIdx > copiedIdx,
    "onCopied must run inside the try block, after setState(\"copied\"), i.e. only on success"
  );
});

test("find/page.tsx mounts PageViewTracker with find_page_viewed", () => {
  const src = read("src/app/find/page.tsx");
  assert.ok(
    src.includes("PageViewTracker") && src.includes("Event.FindPageViewed"),
    "the /find page must fire find_page_viewed via the zero-DOM tracker island"
  );
});
