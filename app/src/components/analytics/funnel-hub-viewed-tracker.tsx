"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics/client";
import { Event } from "@/lib/analytics/events";

/**
 * Fires Event.FunnelHubViewed once per mount on the Funnel Hub homepage.
 *
 * Why this exists: `funnel_hub_viewed` is the entry event of the founder's Path in
 * PostHog (workbook 02 §1 + 04 §7). The constant was defined in events.ts but
 * never wired to a callsite, so the funnel was stuck at 0 entrants. This is
 * the missing fire.
 *
 * Pattern matches AbExposureBeacon: useRef guard so React 18 StrictMode
 * double-invoke of effects in development does not double-count. The
 * `track()` helper queues the call until posthog-js finishes its dynamic
 * import (see lib/analytics/client.ts), so it is safe to fire from the
 * first paint even before the SDK has hydrated.
 *
 * Rendered as a child inside the server-component `<FunnelHub>` page,
 * alongside `<AbExposureBeacon />`.
 */
export function FunnelHubViewedTracker() {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    track(Event.FunnelHubViewed);
  }, []);

  return null;
}
