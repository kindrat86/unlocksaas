"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics/client";
import { Event } from "@/lib/analytics/events";

/**
 * Single-fire mount beacon for the public diagnosis page.
 *
 *   - DiagnosticShareViewed on every page mount (the count we care about for
 *     butterfly-marketing reach).
 *   - DiagnosticShareReferralArrived only when ?utm_source=share is on the
 *     URL — that's the closed-loop click-through metric (someone shared,
 *     someone clicked, they landed back on the funnel).
 *
 * Ref-guard so React strict-mode double-mount doesn't double-fire.
 */
export function DiagnosisShareViewBeacon({
  leadId,
  label,
}: {
  leadId: string;
  label: "wrong_person" | "weak_offer" | "weak_belief";
}) {
  const firedRef = useRef(false);
  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    track(Event.DiagnosticShareViewed, { lead_id: leadId, label });
  }, [leadId, label]);
  return null;
}
