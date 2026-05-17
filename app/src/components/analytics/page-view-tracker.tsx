"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics/client";
import type { EventName } from "@/lib/analytics/events";

interface PageViewTrackerProps {
  event: EventName;
  /**
   * Optional event properties. Must be plain primitives because PostHog
   * serializes the object; pass strings, numbers, booleans, or null.
   */
  properties?: Record<string, string | number | boolean | null | undefined>;
}

/**
 * Fires a single PostHog page-view event on mount. Returns null — this is a
 * zero-DOM client island whose entire purpose is to let the surrounding
 * page render as a Server Component.
 *
 * Before this existed, marketing pages with one tracked page-view had to be
 * "use client" wholesale, which pushed every block of long-form sales copy
 * into the client bundle and delayed LCP. Now the page is a server tree and
 * only the tracker hydrates.
 *
 * Why an empty dep array: a marketing route mounts once per entry; if the
 * user navigates away and back, the component remounts naturally and the
 * effect re-runs. Re-running on prop change would double-count.
 */
export function PageViewTracker({ event, properties }: PageViewTrackerProps) {
  useEffect(() => {
    track(event, properties);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
