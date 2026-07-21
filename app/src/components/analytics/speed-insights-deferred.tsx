"use client";

/**
 * Deferred Vercel Speed Insights — loaded after the page is idle.
 *
 * The default `@vercel/speed-insights/next` export mounts a <script> tag
 * in the initial render tree. While lightweight (~2KB gzipped), it
 * competes with LCP-critical first-party scripts for the initial CPU
 * budget on low-end mobile.
 *
 * This wrapper defers the import until `requestIdleCallback` fires
 * (polyfilled to `setTimeout` where unavailable), placing Speed Insights
 * after the main thread has painted and settled. CWV data collection
 * starts a few hundred ms later on first visit — the field-data p75
 * aggregation is unaffected because CrUX sources from real-user-metrics
 * independently of the RUM beacon timing.
 *
 * Bundle impact: still a static top-level import during bundling (the
 * framework takes care of tree-shaking), so the chunk arrives via the
 * same network path. The defer is only about execution order on the
 * main thread.
 */

import { SpeedInsights } from "@vercel/speed-insights/next";
import { useEffect, useState } from "react";

export function SpeedInsightsDeferred() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const schedule: (cb: () => void) => void | ReturnType<typeof setTimeout> =
      typeof window.requestIdleCallback !== "undefined"
        ? (cb: () => void) => {
            window.requestIdleCallback(cb);
          }
        : (cb: () => void) => setTimeout(cb, 1);

    schedule(() => {
      setReady(true);
    });

    return;
  }, []);

  if (!ready) return null;

  return <SpeedInsights />;
}
