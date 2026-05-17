"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics/client";
import { Event } from "@/lib/analytics/events";
import type {
  DiagnosticHookVariant,
} from "@/lib/analytics/events";

/**
 * Fires DiagnosticPageViewed + DiagnosticHookVariantAssigned once on mount.
 * The squeeze server-renders the variant; this beacon attaches the variant
 * to PostHog so cohort splits work without a second round-trip.
 */
export function DiagnosticHookVariantBeacon({
  variant,
  source,
}: {
  variant: DiagnosticHookVariant;
  source: string;
}) {
  const firedRef = useRef(false);
  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    track(Event.DiagnosticPageViewed, { variant, source });
    track(Event.DiagnosticHookVariantAssigned, { variant, source });
  }, [variant, source]);
  return null;
}
