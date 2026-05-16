"use client";

import { useEffect, useRef } from "react";

/**
 * Logs one exposure row to public.ab_tests for the identity_label test on
 * mount. Render once per page where a variant copy block is visible.
 *
 * Uses sendBeacon when available so the request survives navigation; falls
 * back to fetch with keepalive. Fire-and-forget — no UI side effects.
 *
 * Deduped per-render via a ref guard. Subject-level dedup (one exposure per
 * visit-day) lives in SQL: count(distinct subject_id) for the denominator.
 */
export function AbExposureBeacon() {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    const url = "/api/ab/event";
    const payload = JSON.stringify({});
    const blob = new Blob([payload], { type: "application/json" });

    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon(url, blob);
    } else {
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {
        // analytics write; never surface to user
      });
    }
  }, []);

  return null;
}
