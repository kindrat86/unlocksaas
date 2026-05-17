"use client";

/**
 * App Router pageview tracker.
 *
 * Next.js App Router does NOT fire native page-load events on client-side
 * navigation. PostHog's `capture_pageview: true` only catches the first
 * hard navigation. To get pageviews on every soft route change we listen to
 * `usePathname()` + `useSearchParams()` and capture `$pageview` ourselves.
 *
 * The component renders nothing and must live inside a Suspense boundary
 * because `useSearchParams()` opts the tree into client-side rendering.
 *
 * 2026-05-17 SXO refactor: no longer pulls the posthog-js/react React
 * provider into the initial bundle. The `usePostHog()` hook is gone; we
 * call our own analytics client's `track()` directly. If the underlying
 * SDK hasn't finished its dynamic import yet, the call is queued and
 * flushed once init resolves (see lib/analytics/client.ts).
 */

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { captureBuiltinEvent } from "@/lib/analytics/client";

export function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    let url = window.origin + pathname;
    const qs = searchParams?.toString();
    if (qs) url = `${url}?${qs}`;
    captureBuiltinEvent("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}
