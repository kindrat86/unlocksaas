"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics/client";
import { Event } from "@/lib/analytics/events";

/**
 * Fires Event.StoriesPageViewed once per mount on the /stories Reverse
 * Squeeze surface (DCS Secret 14, reverse variant).
 *
 * Needed so the opt-in conversion rate has a denominator. StoriesOptIn
 * already fires StoriesOptInSubmitted on form submit; without this pageview,
 * we see "N opted in" without knowing the surface population.
 */
export function StoriesPageViewedTracker() {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    track(Event.StoriesPageViewed);
  }, []);

  return null;
}
