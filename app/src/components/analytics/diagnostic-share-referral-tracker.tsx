"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics/client";
import { Event } from "@/lib/analytics/events";

const DIAGNOSIS_REF_RE = /^\/diagnosis\/([0-9a-f-]{36})\b/i;

/**
 * Fires Event.DiagnosticShareReferralArrived when the visitor lands on
 * /diagnostic from a public diagnosis share page (/diagnosis/<uuid>).
 *
 * This is the final step of Butterfly Marketing Loop 1 (Traffic Secrets
 * Ch 19 / DCS Ch 11). The earlier four steps in the loop are already wired:
 *   1. DiagnosticShareCreated  (lead opts to make their result public)
 *   2. DiagnosticShareViewed   (referral clicks the public URL)
 *   3. DiagnosticShareClicked  (referral clicks a CTA on the public page)
 *   4. DiagnosticShareReferralArrived  ← THIS — referral lands on /diagnostic
 * Without step 4, end-to-end share-loop attribution is broken because the
 * "did the share send anyone back into the funnel?" question is unanswerable.
 *
 * Detection: document.referrer matches /diagnosis/<uuid>. Same-origin only;
 * we deliberately do not fire for off-site referrers. The referring lead_id
 * rides as a property so cohort splits by source-diagnosis are possible.
 *
 * Falsy referrer (cold direct visit, referrer-policy strip) → no fire.
 * That is correct: a direct visit is not a share referral.
 */
export function DiagnosticShareReferralTracker() {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    if (typeof document === "undefined") return;
    const ref = document.referrer;
    if (!ref) return;

    let url: URL;
    try {
      url = new URL(ref);
    } catch {
      return;
    }

    // Only fire for same-origin diagnosis-share referrers. Cross-origin
    // referrers are not part of the share loop.
    if (url.origin !== window.location.origin) return;

    const match = url.pathname.match(DIAGNOSIS_REF_RE);
    if (!match) return;

    firedRef.current = true;
    track(Event.DiagnosticShareReferralArrived, {
      referrer_lead_id: match[1],
    });
  }, []);

  return null;
}
