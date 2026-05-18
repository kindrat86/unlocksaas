"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics/client";
import { Event } from "@/lib/analytics/events";

const DIAGNOSIS_REF_RE = /^\/diagnosis\/([0-9a-f-]{36})\b/i;

// Same shape as refFromHostname() output: lowercase, alphanumeric +
// hyphens, capped at 32. Tolerant lower bound at 1 char. Anything that
// doesn't match silently no-ops the firing path so a malformed query
// string can't pollute the event stream.
const REF_SLUG_RE = /^[a-z0-9][a-z0-9-]{0,31}$/;

/**
 * Fires Event.DiagnosticShareReferralArrived when the visitor lands on
 * /diagnostic from a public diagnosis share – via either of two paths:
 *
 *   PATH A (same-origin): document.referrer matches /diagnosis/<uuid>.
 *     This is the "click the public page CTA" path. The referring
 *     lead_id rides on the event as `referrer_lead_id`.
 *
 *   PATH B (off-platform):  ?ref=<slug> is present in the current URL.
 *     This is the "click a tweet / LinkedIn unfurl / Slack share" path,
 *     where document.referrer is stripped to the social platform's
 *     origin (twitter.com, linkedin.com) or removed entirely by
 *     Referrer-Policy. The slug encodes the originating hostname (via
 *     refFromHostname in @/lib/diagnostic-share), so the receiving
 *     event carries `ref_slug` for cohort splits.
 *
 * Both paths target the same event name on purpose. The dashboard
 * question is "did the share loop send anyone back into the funnel?"
 * — the question is binary, not "from which platform?" The platform
 * distinction lives in the `source` property, which the funnel
 * dashboards can pivot on without splitting the event taxonomy.
 *
 * Brunson Hard-Rule reconciliation:
 *   - No fabricated attribution. PATH B fires only when ?ref= is
 *     present AND well-formed. A bare /diagnostic visit never tags
 *     itself as a share referral.
 *   - At most one fire per page mount. Both paths share the firedRef
 *     guard so a same-origin /diagnosis click that happens to ALSO
 *     carry ?ref= (e.g. operator-set internal link) emits only PATH A.
 *
 * Source: strategy/workbooks/10-growth-hacking.md §5 (Butterfly
 * Marketing Loop 1, final step) + DCS Chapter 11.
 */
export function DiagnosticShareReferralTracker() {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    if (typeof document === "undefined") return;

    // PATH A — same-origin diagnosis page referrer. Preferred when
    // available because it carries the originating lead_id, the
    // strongest cohort handle. Falsy referrer (cold direct visit,
    // referrer-policy strip) falls through to PATH B.
    const ref = document.referrer;
    if (ref) {
      let url: URL | null = null;
      try {
        url = new URL(ref);
      } catch {
        url = null;
      }
      if (url && url.origin === window.location.origin) {
        const match = url.pathname.match(DIAGNOSIS_REF_RE);
        if (match) {
          firedRef.current = true;
          track(Event.DiagnosticShareReferralArrived, {
            referrer_lead_id: match[1],
            source: "same_origin",
          });
          return;
        }
      }
    }

    // PATH B — off-platform share. Read ?ref=<slug> off the URL the
    // browser actually loaded. window.location.search is the right
    // source here (not Next's useSearchParams) because the tracker
    // mounts inside a Suspense boundary on /diagnostic and we want
    // the very first paint to fire if the slug is present – no
    // search-param subscription roundtrip needed.
    const params = new URLSearchParams(window.location.search);
    const rawSlug = params.get("ref");
    if (!rawSlug) return;
    const slug = rawSlug.trim().toLowerCase();
    if (!REF_SLUG_RE.test(slug)) return;

    firedRef.current = true;
    track(Event.DiagnosticShareReferralArrived, {
      ref_slug: slug,
      source: "off_platform",
    });
  }, []);

  return null;
}
