"use client";

/**
 * Top-level PostHog bootstrap.
 *
 * Previously wrapped children in `<PostHogProvider>` from `posthog-js/react`
 * so descendant components could call `usePostHog()`. As of 2026-05-17 the
 * site no longer uses that React provider – `track()` / `identify()` /
 * `resetIdentity()` from `@/lib/analytics/client` are the only API surface
 * we expose, and they're explicitly designed to work without React context.
 *
 * Dropping the provider also drops `posthog-js/react` from the initial
 * bundle. Combined with the lazy `import("posthog-js")` inside
 * lib/analytics/client.ts, this moves ~70kb gzipped of analytics SDK out
 * of the first-paint chunk of every page that mounts root layout (i.e.
 * every page). Canonical Vercel "bundle-defer-third-party" pattern.
 *
 * What this component does now:
 *   - Runs `initPostHog()` in a useEffect on mount. That triggers the
 *     dynamic import of posthog-js AFTER first paint, warming the SDK
 *     before the user does anything trackable. If the SDK isn't loaded
 *     by the time a `track()` call fires, the call is queued and flushed
 *     once init resolves (see lib/analytics/client.ts) – no event loss.
 *   - Renders children unwrapped. There's no React context to wire.
 *
 * Why mount this at the root (still): the useEffect must run on every
 * route so the SDK gets warmed exactly once per browser session. Mounting
 * it under root layout is the smallest hit-once-per-session surface.
 */

import { useEffect } from "react";
import { initPostHog } from "@/lib/analytics/client";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initPostHog();
  }, []);

  return <>{children}</>;
}
