"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics/client";
import { Event } from "@/lib/analytics/events";
import type { DiagnosticResultProps } from "@/lib/analytics/events";

/**
 * Fires Event.DiagnosticResultViewed once per mount on the diagnostic result
 * (bridge) page. Pairs with the squeeze→form→result top-of-funnel arc so
 * brunson-funnel-metrics can compute (results viewed / forms submitted) as
 * the bridge-page conversion rate.
 *
 * Mounted inside the server-component BridgePage with the resolved label
 * passed in as a prop. Single-fire (useRef guard) so React 18 StrictMode in
 * dev does not double-count.
 */
export function DiagnosticResultViewedTracker(props: DiagnosticResultProps) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    track(Event.DiagnosticResultViewed, { ...props });
  }, [props]);

  return null;
}
