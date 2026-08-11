/**
 * The one place `diagnostic_email_captured` is emitted.
 *
 * Why this exists as its own module rather than two inline `captureServer`
 * calls: email capture is this site's primary conversion metric (checkout is
 * a waitlist by design, so the address IS the conversion). It was previously
 * measured with `diagnostic_form_submitted`, which the squeeze fires eight
 * times per completed funnel — 17 recorded "captures" in the 2026-07-15 →
 * 2026-08-11 window decomposed to two people and at most two real addresses.
 * A metric that inflates ~8× cannot support a verdict at any sample size.
 *
 * The fix is to move the fire off the browser entirely and bind it to the
 * database write. There is exactly one moment an address we did not
 * previously hold enters the system: a successful INSERT into
 * `diagnostic_leads`. Both lead-creation paths call this helper immediately
 * after that INSERT and nowhere else, so:
 *
 *   - step advances, stream boundaries and re-renders cannot inflate it;
 *   - `already_used` (the one-report-per-email quota gate found a prior row)
 *     is not counted — we already had that address;
 *   - an abandoned or failed stream is not counted — no row, no capture;
 *   - the quota gate admits at most one row per address ever, so the event
 *     is deduped by person at the strongest level available: one lifetime
 *     capture per email, no session-window heuristics needed.
 *
 * Server-side capture also survives ad blockers and tab closes, which a
 * browser fire at the same moment would not.
 */

import { Event } from "./events";
import type { DiagnosticEmailCapturedProps } from "./events";
import { captureServerAndFlush } from "./server";

export interface DiagnosticEmailCaptureInput {
  /** `diagnostic_leads.id` returned by the INSERT. */
  leadId: string;
  /** Full address. Only its domain leaves this function. */
  email: string;
  productUrl: string;
  capture_surface: DiagnosticEmailCapturedProps["capture_surface"];
}

/**
 * Record one genuine email capture.
 *
 * Awaits the PostHog flush — serverless functions freeze as soon as the
 * response (or stream) completes, and a dropped conversion event is the
 * failure mode this whole change exists to eliminate. Never throws: a
 * telemetry outage must not turn a saved lead into a user-visible error.
 */
export async function captureDiagnosticEmail({
  leadId,
  email,
  productUrl,
  capture_surface,
}: DiagnosticEmailCaptureInput): Promise<void> {
  try {
    await captureServerAndFlush(`lead:${leadId}`, Event.DiagnosticEmailCaptured, {
      email_domain: email.trim().toLowerCase().split("@")[1] ?? "unknown",
      lead_id: leadId,
      product_url: productUrl,
      capture_surface,
    } satisfies DiagnosticEmailCapturedProps);
  } catch (err) {
    console.error("[diagnostic] email-capture event failed", err);
  }
}
