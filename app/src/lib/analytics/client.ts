"use client";

/**
 * Browser-side PostHog access – lazy-loaded edition.
 *
 * Why this wrapper instead of importing posthog-js directly everywhere:
 *   - In dev with no key set, posthog-js throws on init – we silently no-op.
 *   - We want every callsite to type-check the event name against `Event`.
 *   - Identifying users happens in exactly one place (the provider).
 *
 * Use `track()` for events, `identify()` for the auth handoff, and
 * `resetIdentity()` on sign-out so a shared browser does not bleed user A's
 * events into user B.
 *
 * ---
 *
 * SXO uplift (2026-05-17): posthog-js is no longer pulled into the initial
 * chunk. It used to be a top-level `import posthog from "posthog-js"` here
 * AND a `import { PostHogProvider } from "posthog-js/react"` inside the
 * provider component – together about 70kb gzipped on the first paint of
 * every page that mounts the root layout (i.e. every page).
 *
 * The new pattern:
 *   - This module imports posthog-js LAZILY via `import("posthog-js")`
 *     inside `loadPostHog()`. The import resolves on the first call that
 *     actually needs the SDK (the bootstrap useEffect, or the first track
 *     call – whichever fires first).
 *   - Events fired before the SDK resolves are queued and flushed in order
 *     once it's ready. No event loss. `track()` callers stay synchronous –
 *     they don't need to await anything.
 *   - When PostHog isn't configured (no NEXT_PUBLIC_POSTHOG_KEY), every
 *     function is still a no-op and posthog-js never loads at all.
 *
 * The bundle saving compounds across every page that renders root layout.
 * The trade-off is a microtask delay between the first track() call and the
 * actual capture – invisible to users, irrelevant for funnel metrics.
 */

import type { PostHog } from "posthog-js";
import type { EventName } from "./events";
import { detectClientBot } from "./bot-detection";

// Public client-side project token (safe to ship in the bundle — same
// fallback pattern as the rest of the portfolio). Env vars still win when
// set; the fallback exists because the Vercel team policy marks new env
// vars "sensitive", which bakes empty strings into CI builds and silently
// disabled all tracking after the 2026-07-07 deploy.
const POSTHOG_KEY =
  process.env.NEXT_PUBLIC_POSTHOG_KEY ||
  "phc_lyZCgvTpicjLzAO3rY2GhxuX5WUc5jQjP8ZVwwJqauX";
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com";

// Lazy module reference. Resolves on first call to loadPostHog(); null
// before that, the actual PostHog instance after. Held in a Promise so
// concurrent calls during the load window all await the same instance and
// no race ever fires two posthog.init() calls.
let posthogPromise: Promise<PostHog | null> | null = null;

// Module-level alias for the resolved instance. Lets synchronous code paths
// (the hot path of `track`) skip the Promise machinery once the SDK has
// landed. `null` means "not yet resolved or not configured."
let posthogInstance: PostHog | null = null;

// Events fired before posthog-js finishes loading. Drained in arrival
// order inside loadPostHog() after init resolves. Holding events in a
// queue (rather than dropping them or making track() async) is the
// canonical pattern for SDKs that report from the browser – no event loss,
// no behavior change at the call site, single round-trip on bootstrap.
type QueuedCapture = {
  kind: "capture";
  event: string;
  properties?: Record<string, unknown>;
};
type QueuedIdentify = {
  kind: "identify";
  distinctId: string;
  properties?: Record<string, unknown>;
};
type QueuedReset = { kind: "reset" };
type QueuedRegister = {
  kind: "register";
  properties: Record<string, unknown>;
};
type Queued = QueuedCapture | QueuedIdentify | QueuedReset | QueuedRegister;

const queue: Queued[] = [];

export function isPostHogConfigured(): boolean {
  return Boolean(POSTHOG_KEY && POSTHOG_HOST);
}

/**
 * Lazy-loads posthog-js, initializes it, and drains any queued calls.
 *
 * Returns the singleton instance (or null if posthog isn't configured).
 * Safe to call repeatedly – the dynamic import is cached by the bundler
 * AND by our `posthogPromise` reference, so the network round-trip happens
 * at most once.
 *
 * Why this isn't done synchronously: a static `import posthog from
 * "posthog-js"` would bring the SDK back into the initial bundle, undoing
 * the entire SXO point of this module. The dynamic import is the win.
 */
function loadPostHog(): Promise<PostHog | null> {
  if (posthogPromise) return posthogPromise;
  if (typeof window === "undefined") return Promise.resolve(null);
  if (!isPostHogConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.info(
        "[posthog] Skipping init – NEXT_PUBLIC_POSTHOG_KEY/HOST not set.",
      );
    }
    // Cache the null so we don't retry on every track() call.
    posthogPromise = Promise.resolve(null);
    return posthogPromise;
  }

  // Dynamic import – this is what pulls posthog-js OUT of the initial
  // chunk into its own webpack chunk loaded on demand.
  posthogPromise = import("posthog-js").then(({ default: posthog }) => {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      // App Router fires pageviews manually from PostHogPageView – do not
      // double-fire.
      capture_pageview: false,
      // Capture pageleave is fine; useful for "time on page" computations
      // brunson-funnel-metrics may want.
      capture_pageleave: true,
      // We use Supabase Auth as the source of truth. Don't autogen anonymous
      // identifiers via cookies-only; the cookie-based distinct_id still works
      // for top-of-funnel.
      person_profiles: "identified_only",
      autocapture: false, // explicit events only; keeps the dashboard clean
      // Brunson hard rule #9: no fake urgency. By extension: no creepy
      // session-recording-by-default. Enable per-page if needed.
      disable_session_recording: true,
      loaded: (ph) => {
        if (process.env.NODE_ENV !== "production") {
          ph.debug(false);
        }
      },
    });

    posthogInstance = posthog;

    // Super property so traffic queries can filter `is_bot = false`.
    // Registered BEFORE the queue drains, so events fired during the lazy
    // SDK load carry the flag too — otherwise every pre-load event would
    // land unflagged and read as human.
    posthog.register({ is_bot: detectClientBot() });

    // Drain queued events in arrival order. Once this loop completes the
    // queue stays empty for the rest of the session.
    for (const item of queue) {
      switch (item.kind) {
        case "capture":
          posthog.capture(item.event, item.properties);
          break;
        case "identify":
          posthog.identify(item.distinctId, item.properties);
          break;
        case "reset":
          posthog.reset();
          break;
        case "register":
          posthog.register(item.properties);
          break;
      }
    }
    queue.length = 0;

    return posthog;
  });

  return posthogPromise;
}

/**
 * Eager bootstrap. Call this from a top-level useEffect to start the
 * dynamic import after first paint, so the SDK is warm by the time the
 * user does anything trackable. Safe to call multiple times.
 */
export function initPostHog(): void {
  void loadPostHog();
}

export function track<P extends Record<string, unknown>>(
  event: EventName,
  properties?: P,
): void {
  if (typeof window === "undefined") return;
  if (posthogInstance) {
    posthogInstance.capture(event, properties);
    return;
  }
  // Not yet loaded – queue, then kick off the load if it hasn't started.
  queue.push({ kind: "capture", event, properties });
  void loadPostHog();
}

export function identify(
  distinctId: string,
  properties?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;
  if (posthogInstance) {
    posthogInstance.identify(distinctId, properties);
    return;
  }
  queue.push({ kind: "identify", distinctId, properties });
  void loadPostHog();
}

export function resetIdentity(): void {
  if (typeof window === "undefined") return;
  if (posthogInstance) {
    posthogInstance.reset();
    return;
  }
  queue.push({ kind: "reset" });
  void loadPostHog();
}

/**
 * Capture a PostHog built-in event (`$pageview`, `$pageleave`, etc.).
 *
 * Separated from `track()` because EventName is intentionally narrow – it
 * lists only the project's own snake_case events so typos at call sites
 * fail at build time. PostHog's `$`-prefixed built-ins live outside that
 * type and need their own typed surface. Currently only `$pageview` is
 * fired explicitly (from PostHogPageView); `$pageleave` is configured in
 * loadPostHog() to fire automatically.
 */
type BuiltinEventName = "$pageview" | "$pageleave";

export function captureBuiltinEvent(
  event: BuiltinEventName,
  properties?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;
  if (posthogInstance) {
    posthogInstance.capture(event, properties);
    return;
  }
  queue.push({ kind: "capture", event, properties });
  void loadPostHog();
}

/**
 * Register PostHog super-properties.
 *
 * Super-properties are sent with every subsequent event from this
 * browser session. Used for first-touch attribution (ai_engine,
 * acquisition channel) so per-event handlers don't have to repeat
 * the property on every `track()` call.
 *
 * Queues if posthog-js hasn't resolved yet – same discipline as
 * `track()` / `identify()`. The drain loop in `loadPostHog()` handles
 * the queued register call once init completes (see the queue
 * `kind: "register"` branch below).
 */
export function registerSuperProperties(
  properties: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;
  if (posthogInstance) {
    posthogInstance.register(properties);
    return;
  }
  queue.push({ kind: "register", properties });
  void loadPostHog();
}
