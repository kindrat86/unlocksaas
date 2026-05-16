"use client";

/**
 * Top-level PostHog provider.
 *
 * Wraps the app inside `<PostHogProvider>` from `posthog-js/react`. The
 * underlying client is initialized once via `initPostHog()` and shared via
 * React context, so deeper components can call `usePostHog()` if they need
 * the raw client (most don't — they use `track()` from lib/analytics/client).
 *
 * Why mount this at the root: PostHog must be available before the
 * `PostHogPageView` tracker fires the first pageview event.
 */

import { useEffect } from "react";
import { PostHogProvider as Provider } from "posthog-js/react";
import { initPostHog, posthog } from "@/lib/analytics/client";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initPostHog();
  }, []);

  return <Provider client={posthog}>{children}</Provider>;
}
