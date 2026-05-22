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
import { initPostHog, registerSuperProperties } from "@/lib/analytics/client";
import {
  AI_ENGINE_COOKIE,
  isAiEngine,
  resolveEngineFromUtmSource,
  AI_ENGINE_COOKIE_MAX_AGE,
} from "@/lib/seo/ai-attribution";

/**
 * Read a cookie value by name from `document.cookie`.
 *
 * Server-rendered for the SSR pass returns null (no document); the
 * effect runs on the client where document is defined.
 */
function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const pairs = document.cookie ? document.cookie.split(";") : [];
  for (const raw of pairs) {
    const eq = raw.indexOf("=");
    if (eq < 0) continue;
    const key = raw.slice(0, eq).trim();
    if (key === name) return decodeURIComponent(raw.slice(eq + 1).trim());
  }
  return null;
}

/**
 * Resolve and persist the first-touch AI engine, then register it
 * as a PostHog super-property.
 *
 * Order of precedence:
 *   1. Existing `usaas_ai_engine` cookie – first-touch wins, sticky
 *      for 90 days. Sourced from the server (proxy.ts) on the very
 *      first request OR from a prior client-side write.
 *   2. `utm_source` on the current URL – if the proxy did not set
 *      the cookie (e.g. the very first hit and the proxy matcher
 *      excluded the path), the client still captures the engine and
 *      writes the cookie so subsequent navigations preserve the tag.
 *
 * If neither yields a recognised engine, no super-property is set
 * and PostHog's regular UTM autocapture remains the only signal.
 */
function resolveAndRegisterAiEngine(): void {
  const cookieValue = readCookie(AI_ENGINE_COOKIE);
  if (cookieValue && isAiEngine(cookieValue)) {
    registerSuperProperties({ ai_engine: cookieValue });
    return;
  }
  const utmSource = new URLSearchParams(window.location.search).get(
    "utm_source",
  );
  const engine = resolveEngineFromUtmSource(utmSource);
  if (!engine) return;
  registerSuperProperties({ ai_engine: engine });
  // Persist client-side so a later navigation that loses the query
  // string still carries attribution. SameSite=Lax matches the proxy.
  document.cookie = `${AI_ENGINE_COOKIE}=${engine}; Max-Age=${AI_ENGINE_COOKIE_MAX_AGE}; Path=/; SameSite=Lax`;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initPostHog();
    // Resolve attribution AFTER initPostHog so the register call
    // queues correctly if posthog-js hasn't finished its dynamic
    // import (resolveSuperProperties uses the same queue discipline
    // as track()/identify()).
    resolveAndRegisterAiEngine();
  }, []);

  return <>{children}</>;
}
