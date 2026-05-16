"use client";

/**
 * Browser-side PostHog access.
 *
 * Why this wrapper instead of importing posthog-js directly everywhere:
 *   - In dev with no key set, posthog-js throws on init — we silently no-op.
 *   - We want every callsite to type-check the event name against `Event`.
 *   - Identifying users happens in exactly one place (the provider).
 *
 * Use `track()` for events, `identify()` for the auth handoff, `reset()` on
 * sign-out so a shared browser does not bleed user A's events into user B.
 */

import posthog from "posthog-js";
import type { EventName } from "./events";

let initialized = false;

export function isPostHogConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_POSTHOG_KEY &&
      process.env.NEXT_PUBLIC_POSTHOG_HOST,
  );
}

export function initPostHog(): void {
  if (initialized) return;
  if (typeof window === "undefined") return;
  if (!isPostHogConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.info(
        "[posthog] Skipping init — NEXT_PUBLIC_POSTHOG_KEY/HOST not set.",
      );
    }
    return;
  }

  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
    // App Router fires pageviews manually from PostHogPageView — do not
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

  initialized = true;
}

export function track<P extends Record<string, unknown>>(
  event: EventName,
  properties?: P,
): void {
  if (typeof window === "undefined") return;
  if (!initialized) return;
  posthog.capture(event, properties);
}

export function identify(
  distinctId: string,
  properties?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;
  if (!initialized) return;
  posthog.identify(distinctId, properties);
}

export function resetIdentity(): void {
  if (typeof window === "undefined") return;
  if (!initialized) return;
  posthog.reset();
}

export { posthog };
