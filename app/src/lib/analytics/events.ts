/**
 * Funnel event taxonomy for UnlockSaaS.
 *
 * Why this file: the brunson-funnel-metrics skill needs a stable, named set
 * of events that map to the value ladder. If we capture ad-hoc strings,
 * conversion reports get fragmented across "checkout-clicked",
 * "checkoutClick", "starter_cta", etc. One file. One contract.
 *
 * The events fall into three layers:
 *   1. Top-of-funnel (anonymous browser) — pageviews + CTA clicks.
 *   2. Mid-funnel (authenticated app) — Machine step progress + milestones.
 *   3. Conversion (server-side, Stripe webhook) — the ones that count.
 *
 * Reluctant Hero design rule: only Stripe events are "conversions". Anything
 * before payment is a signal, not a win. Workbook 04 §7 + Hard Rule #3.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Event names. Keep snake_case. Don't rename — historical reports break.
// ─────────────────────────────────────────────────────────────────────────────

export const Event = {
  // Top-of-funnel (client-side)
  FunnelHubViewed: "funnel_hub_viewed",
  FunnelHubCtaClicked: "funnel_hub_cta_clicked",
  // VSL — Who/What/Why/How player on funnel hub, $1 Starter, $49 sales.
  // Per DotCom Secrets Secret #20: VSL completion is the highest-correlation
  // pre-conversion signal on cold traffic. Track granularly.
  VslImpression: "vsl_impression",         // mounted in viewport
  VslPlayed: "vsl_played",                  // user pressed play (or autoplay started)
  VslSceneAdvanced: "vsl_scene_advanced",   // each scene boundary
  VslSkippedToOffer: "vsl_skipped_to_offer",
  VslReplayed: "vsl_replayed",
  VslCompleted: "vsl_completed",
  DiagnosticPageViewed: "diagnostic_page_viewed",
  DiagnosticFormSubmitted: "diagnostic_form_submitted",
  DiagnosticResultViewed: "diagnostic_result_viewed",
  // Reverse Squeeze (DotCom Secrets Secret 14, reverse variant) — value-first
  // public page, opt-in mid- and end-content. Placement is tracked as a
  // property so we can compare mid-content vs end-content conversion.
  ParablesPageViewed: "parables_page_viewed",
  ParablesOptInSubmitted: "parables_opt_in_submitted",
  // Canonical Lead Squeeze (DotCom Secrets Secret 14, forward variant) —
  // single-field email opt-in for cold ad / bio / podcast call-out
  // traffic. Source attribution = "fast_lane_squeeze" on
  // soap_opera_subscribers, measurable per-day in
  // supabase/views/squeeze_conversion.sql against /diagnostic and
  // /parables to compare per-source conversion.
  FastLaneSqueezeViewed: "fast_lane_squeeze_viewed",
  FastLaneSqueezeSubmitted: "fast_lane_squeeze_submitted",
  StarterPageViewed: "starter_page_viewed",
  StarterCheckoutClicked: "starter_checkout_clicked",
  MachineSalesPageViewed: "machine_sales_page_viewed",
  MachineSalesCheckoutClicked: "machine_sales_checkout_clicked",
  OtoPageViewed: "oto_page_viewed",
  OtoUpgradeClicked: "oto_upgrade_clicked",
  OtoDeclined: "oto_declined",
  // Rung 2 (Repeatable Revenue Layer) — the next-yes signal layer
  // (DCS Secret #2 / strategy/decisions/rung-2-repeatable-revenue.md).
  // NOT a waitlist — these events capture demand-signal volume that backs
  // the "no supply without demand signal" activation gate.
  RepeatablePageViewed: "repeatable_page_viewed",
  RepeatableInterestSubmitted: "repeatable_interest_submitted",
  ValueLadderRungClicked: "value_ladder_rung_clicked",

  // Mid-funnel (authenticated, client-side)
  MachineStepStarted: "machine_step_started",
  MachineStepAnswerSubmitted: "machine_step_answer_submitted",
  MachineEnginePushback: "machine_engine_pushback",
  MachineStepCompleted: "machine_step_completed",
  MilestoneEarned: "milestone_earned",

  // Conversion (server-side, Stripe webhook is source of truth)
  CheckoutSessionCreated: "checkout_session_created",
  CheckoutSessionExpired: "checkout_session_expired",
  StarterPurchased: "starter_purchased",
  MachineSubscribed: "machine_subscribed",
  InvoicePaymentSucceeded: "invoice_payment_succeeded",
  InvoicePaymentFailed: "invoice_payment_failed",
  SubscriptionCanceled: "subscription_canceled",
  ChargeRefunded: "charge_refunded",
  // The single event brunson-funnel-metrics cares about most:
  FirstCustomerVerified: "first_customer_verified",

  // Follow-Up Funnels — Cart Abandonment Recovery cadence
  // (Traffic Secrets Secret #6 / strategy/follow-up-funnels.md cadence #5).
  CartRecoveryEnrolled: "cart_recovery_enrolled",
  CartRecoveryEmailSent: "cart_recovery_email_sent",
  CartRecoveryRecovered: "cart_recovery_recovered",
  CartRecoveryCompleted: "cart_recovery_completed",

  // Auth / lifecycle
  MagicLinkRequested: "magic_link_requested",
  UserSignedIn: "user_signed_in",

  // Per-channel bio link surfaces (workbook 09 §1 — Traffic Secrets #15
  // funnel-hub-from-cold-channel attribution). Used by IgBioLinkTracker.
  IgBioLinkViewed: "ig_bio_link_viewed",
} as const;

export type EventName = (typeof Event)[keyof typeof Event];

// ─────────────────────────────────────────────────────────────────────────────
// Property shapes. Keep these narrow — broad `Record<string, unknown>` props
// invite typos. The PostHog dashboard's auto-discovered property list is only
// useful if we send the same names every time.
// ─────────────────────────────────────────────────────────────────────────────

export type CtaSurface = "diagnostic" | "starter" | "machine_sales";
export type PriceType = "starter" | "machine";

export interface MachineStepProps {
  step_id: string; // "1".."7"
  step_name: string; // "Pin Your Dream Customer"
}

export interface PushbackProps extends MachineStepProps {
  question_index: number;
}

export interface MilestoneProps {
  milestone_name: string; // e.g. "Dream Customer Pinned"
  step_id: string;
}

export interface CheckoutProps {
  price_type: PriceType;
  stripe_session_id?: string;
  amount_cents?: number;
}

export interface ConversionProps {
  price_type: PriceType;
  stripe_customer_id: string;
  stripe_session_id?: string;
  amount_cents: number;
  currency: string;
}

export interface DiagnosticResultProps {
  label: "wrong_person" | "weak_offer" | "weak_belief" | "indeterminate";
  product_url?: string;
}

export type VslSurface = "funnel_hub" | "starter" | "machine_sales";
export type VslMode = "video" | "scripted";

export interface VslEventProps {
  surface: VslSurface;
  mode: VslMode;
}

export interface VslSceneProps extends VslEventProps {
  scene_id: string;
  scene_index: number;
  scene_role: string;
}

export interface VslCompletionProps extends VslEventProps {
  /** Percentage of total runtime watched, 0-100. */
  watched_percent: number;
  /** Whether the visitor sat through to the end or skipped. */
  reached_end: boolean;
}
