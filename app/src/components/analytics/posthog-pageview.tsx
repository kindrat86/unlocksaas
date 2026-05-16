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
 */

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";

export function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  useEffect(() => {
    if (!pathname || !posthog) return;
    let url = window.origin + pathname;
    const qs = searchParams?.toString();
    if (qs) url = `${url}?${qs}`;
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams, posthog]);

  return null;
}
