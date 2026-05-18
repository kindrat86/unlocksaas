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
 *   2. Mid-funnel (authenticated app) — Playbook step progress + milestones.
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
  // Bait Hook variant attribution (Eugene Schwartz awareness mapping —
  // strategy/workbooks/10-growth-hacking.md §4 + Brunson DCS Chapter 11).
  // Squeeze rotates Hook #3 (pain mirror) / #10 (contrarian) / #7 (guarantee)
  // by source. Tracked as a property on PageViewed so cohort splits work.
  DiagnosticHookVariantAssigned: "diagnostic_hook_variant_assigned",
  // Butterfly Marketing Loop 1 — Brunson Traffic Secrets Chapter 19.
  // Bait result share funnel: click → public page created → public page
  // viewed by a referral → referral arrives back on /diagnostic.
  DiagnosticShareClicked: "diagnostic_share_clicked",
  DiagnosticShareCreated: "diagnostic_share_created",
  DiagnosticShareRevoked: "diagnostic_share_revoked",
  DiagnosticShareViewed: "diagnostic_share_viewed",
  DiagnosticShareReferralArrived: "diagnostic_share_referral_arrived",
  // Reverse Squeeze (DotCom Secrets Secret 14, reverse variant) — value-first
  // public page, opt-in mid- and end-content. Placement is tracked as a
  // property so we can compare mid-content vs end-content conversion.
  StoriesPageViewed: "stories_page_viewed",
  StoriesOptInSubmitted: "stories_opt_in_submitted",
  StarterPageViewed: "starter_page_viewed",
  StarterCheckoutClicked: "starter_checkout_clicked",
  PlaybookSalesPageViewed: "playbook_sales_page_viewed",
  PlaybookSalesCheckoutClicked: "playbook_sales_checkout_clicked",
  OtoPageViewed: "oto_page_viewed",
  OtoUpgradeClicked: "oto_upgrade_clicked",
  OtoDeclined: "oto_declined",

  // Mid-funnel (authenticated, client-side)
  PlaybookStepStarted: "playbook_step_started",
  PlaybookStepAnswerSubmitted: "playbook_step_answer_submitted",
  PlaybookEnginePushback: "playbook_engine_pushback",
  PlaybookStepCompleted: "playbook_step_completed",
  MilestoneEarned: "milestone_earned",

  // Conversion (server-side, Stripe webhook is source of truth)
  CheckoutSessionCreated: "checkout_session_created",
  CheckoutSessionExpired: "checkout_session_expired",
  StarterPurchased: "starter_purchased",
  PlaybookSubscribed: "playbook_subscribed",
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

  // Core Web Vitals + Next.js custom metrics (LCP, INP, CLS, FCP, TTFB,
  // FID-deprecated, and Next-specific 'Next.js-hydration',
  // 'Next.js-route-change-to-render', 'Next.js-render'). Sent from a
  // root-mounted client beacon via `next/web-vitals`. One event per metric
  // per pageview – a single page typically emits 5-8. Property `metric_name`
  // discriminates. SXO uplift: lets the brunson-funnel-metrics skill see
  // INP/CLS by /alternatives-to vs /funnel-teardown etc. and catch the
  // first slug-page that drifts to "poor" before users feel it.
  WebVitalReported: "web_vital_reported",
} as const;

export type EventName = (typeof Event)[keyof typeof Event];

// ─────────────────────────────────────────────────────────────────────────────
// Property shapes. Keep these narrow — broad `Record<string, unknown>` props
// invite typos. The PostHog dashboard's auto-discovered property list is only
// useful if we send the same names every time.
// ─────────────────────────────────────────────────────────────────────────────

export type CtaSurface = "diagnostic" | "starter" | "playbook_sales";
export type PriceType = "starter" | "playbook";

export interface PlaybookStepProps {
  step_id: string; // "1".."7"
  step_name: string; // "Pin Your Dream Customer"
}

export interface PushbackProps extends PlaybookStepProps {
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

/**
 * Core Web Vitals + Next.js custom metrics property shape.
 *
 * Every field here is on the upstream `Metric` type from web-vitals v3 (the
 * library Next.js's `useReportWebVitals` re-exports). Sent verbatim per
 * metric event – PostHog auto-discovers each property and the dashboard
 * surfaces "INP by route", "CLS by deployment", etc. with no schema work.
 *
 * `rating` is only populated by the standard CWV metrics (LCP/INP/CLS/FCP/
 * TTFB). Next's custom timing metrics ('Next.js-hydration',
 * 'Next.js-route-change-to-render', 'Next.js-render') don't emit a rating –
 * we send `null` so the property is consistent across rows. `route` is the
 * client-side pathname at the moment the metric fired (captured from
 * `window.location.pathname`) so /alternatives-to/lovable rolls up
 * separately from /alternatives-to/shipfast.
 *
 * Property names are snake_case to match the existing PostHog convention
 * (Event names + every other Props shape in this file).
 */
export interface WebVitalReportedProps {
  /** "LCP" | "INP" | "CLS" | "FCP" | "TTFB" | "FID" | "Next.js-hydration" |
   *  "Next.js-route-change-to-render" | "Next.js-render" */
  metric_name: string;
  /** Per-metric unique id from web-vitals (route + timestamp shape). */
  metric_id: string;
  /** Metric value in its native unit (ms for timing, score for CLS). */
  value: number;
  /** Change since the last report for this metric on this page. */
  delta: number;
  /** "good" | "needs-improvement" | "poor" | null (null for Next custom). */
  rating: "good" | "needs-improvement" | "poor" | null;
  /** "navigate" | "reload" | "back-forward" | "back-forward-cache" |
   *  "prerender" | "restore" | null */
  navigation_type: string | null;
  /** Pathname when the metric fired – lets reports roll up by route. */
  route: string;
}

// Eugene Schwartz awareness mapping — Hook variant assigned by source.
// "default" = unknown / direct / cold (Hook #3 pain mirror).
// "contrarian" = solution-aware visitor from r/SaaS, r/microsaas, IH —
//                served Hook #10 ("Your product was built for no one in
//                particular. That is the whole problem.").
// "guarantee" = product-aware visitor from retargeting / PLF /
//               founding-waitlist — served Hook #7 ("first paying customer
//               in 60 days, even if your launch already flopped").
export type DiagnosticHookVariant = "default" | "contrarian" | "guarantee";

export interface DiagnosticHookVariantProps {
  variant: DiagnosticHookVariant;
  source: string; // "direct" | "x" | "reddit" | "ih" | "retarget" | "founding" | "<utm-source>"
}

export interface DiagnosticShareProps {
  lead_id: string;
  /** Diagnosis label of the share. Used for share-rate-by-label cohorts. */
  label: "wrong_person" | "weak_offer" | "weak_belief";
  /** Surface that initiated the share. */
  surface?: "result_page" | "email" | "deep_link";
}

export type VslSurface = "funnel_hub" | "starter" | "playbook_sales";
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
