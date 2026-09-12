// Regression (2026-09-12): purchase session context must survive the anonymous
// post-checkout chain /onboarding?session_id=... -> login -> magic-link ->
// /auth/callback -> /onboarding. Root cause: the (app)/onboarding layout
// AuthGate redirected to a hardcoded "/login?next=/onboarding", stripping the
// Stripe session_id (and utm/ref/connect context) before the request-aware
// page ever saw it. Fix: layout is pure chrome; the page owns the auth
// redirect via buildOnboardingLoginUrl(searchParams).
//
// Auth + entitlement boundaries that must NOT regress:
//  - unauthenticated users are still redirected to login (now with context)
//  - tier none/null users WITHOUT a session_id are still sent to /oto
//
// Offline mocks only: the callback/login behaviors under test are mirrored
// here from src/app/auth/callback/route.ts and (marketing)/login/actions.ts
// (same-origin path guard + emailRedirectTo encoding). No network, no
// Supabase, no Stripe.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import {
  buildOnboardingDestination,
  buildOnboardingLoginUrl,
} from "../../src/lib/onboarding-return-path.ts";

// ── offline mocks of the real redirect handlers ─────────────────────────────

// Mirrors src/app/auth/callback/route.ts GET: same-origin path guard then
// verbatim forward of `next`.
function callbackForward(next) {
  return next.startsWith("/") && !next.startsWith("//") ? next : "/playbook";
}

// Mirrors (marketing)/login/actions.ts sendMagicLink: the magic link points
// back at /auth/callback with the login form's `next` encoded once.
function emailRedirectTo(origin, next) {
  return `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
}

// ── behavior: the anonymous success URL round-trip ──────────────────────────

test("anonymous Stripe success URL survives onboarding -> login -> callback -> onboarding", () => {
  const entry = {
    session_id: "cs_live_paid_123",
    utm_source: "nl",
    utm_campaign: "launch",
    ref: "abc",
  };
  // 1. Anonymous buyer hits /onboarding?session_id=... ; page auth gate
  //    redirects to login carrying the full destination.
  const loginUrl = buildOnboardingLoginUrl(entry);
  assert.equal(
    loginUrl,
    "/login?next=" +
      encodeURIComponent("/onboarding?session_id=cs_live_paid_123&utm_source=nl&utm_campaign=launch&ref=abc"),
    "login URL must encode the onboarding destination with session_id intact",
  );
  // 2. Login form forwards `next`; magic link lands on the callback.
  const next = decodeURIComponent(loginUrl.split("next=")[1]);
  const callbackUrl = emailRedirectTo("https://unlocksaas.com", next);
  assert.equal(
    callbackUrl,
    "https://unlocksaas.com/auth/callback?next=" +
      encodeURIComponent("/onboarding?session_id=cs_live_paid_123&utm_source=nl&utm_campaign=launch&ref=abc"),
  );
  // 3. Callback decodes and forwards the same-origin path verbatim.
  const forwarded = callbackForward(
    decodeURIComponent(callbackUrl.split("next=")[1]),
  );
  assert.equal(
    forwarded,
    buildOnboardingDestination(entry),
    "callback must land the buyer back on /onboarding with session_id preserved",
  );
  assert.match(forwarded, /[?&]session_id=cs_live_paid_123/);
});

test("context allowlist keeps attribution keys, drops junk/empties/dupes", () => {
  assert.equal(
    buildOnboardingDestination({
      session_id: "cs_test_1",
      utm_source: "nl",
      ref: "abc",
      evil: "<script>",
      error: "",
      stray: undefined,
    }),
    "/onboarding?session_id=cs_test_1&utm_source=nl&ref=abc",
    "unknown keys must be dropped, empty values must not be emitted",
  );
  assert.equal(
    buildOnboardingDestination({ session_id: ["a", "b"], utm_source: "  " }),
    "/onboarding?session_id=a",
    "array params use the first value; blank strings are dropped",
  );
  assert.equal(buildOnboardingDestination({}), "/onboarding");
});

// ── source: the fix shape and the boundaries it must preserve ───────────────

test("page owns request-aware auth redirect; layout has no duplicate auth gate", async () => {
  const page = await readFile(
    new URL("../../src/app/(app)/onboarding/page.tsx", import.meta.url),
    "utf8",
  );
  const layout = await readFile(
    new URL("../../src/app/(app)/onboarding/layout.tsx", import.meta.url),
    "utf8",
  );
  assert.match(
    page,
    /redirect\(buildOnboardingLoginUrl\(searchParams\)\)/,
    "page must forward checkout context to login",
  );
  assert.match(
    page,
    /supabase\.auth\.getUser\(\)/,
    "auth boundary must remain (page-level)",
  );
  assert.doesNotMatch(
    layout,
    /createClient|redirect\(/,
    "layout must not gate auth — a layout-level redirect cannot see searchParams and strips session_id",
  );
});

test("entitlement boundary preserved: tier none without session_id still goes to /oto", async () => {
  const page = await readFile(
    new URL("../../src/app/(app)/onboarding/page.tsx", import.meta.url),
    "utf8",
  );
  assert.match(
    page,
    /if \(!searchParams\.session_id\)\s*\{\s*redirect\("\/oto"\)/,
    "tier-none users without a live checkout session must still be redirected to /oto",
  );
});
