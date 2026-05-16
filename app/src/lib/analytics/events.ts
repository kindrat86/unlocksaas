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
  DiagnosticPageViewed: "diagnostic_page_viewed",
  DiagnosticFormSubmitted: "diagnostic_form_submitted",
  DiagnosticResultViewed: "diagnostic_result_viewed",
  StarterPageViewed: "starter_page_viewed",
  StarterCheckoutClicked: "starter_checkout_clicked",
  MachineSalesPageViewed: "machine_sales_page_viewed",
  MachineSalesCheckoutClicked: "machine_sales_checkout_clicked",
  OtoPageViewed: "oto_page_viewed",
  OtoUpgradeClicked: "oto_upgrade_clicked",
  OtoDeclined: "oto_declined",

  // Mid-funnel (authenticated, client-side)
  MachineStepStarted: "machine_step_started",
  MachineStepAnswerSubmitted: "machine_step_answer_submitted",
  MachineEnginePushback: "machine_engine_pushback",
  MachineStepCompleted: "machine_step_completed",
  MilestoneEarned: "milestone_earned",

  // Conversion (server-side, Stripe webhook is source of truth)
  CheckoutSessionCreated: "checkout_session_created",
  StarterPurchased: "starter_purchased",
  MachineSubscribed: "machine_subscribed",
  InvoicePaymentSucceeded: "invoice_payment_succeeded",
  InvoicePaymentFailed: "invoice_payment_failed",
  SubscriptionCanceled: "subscription_canceled",
  ChargeRefunded: "charge_refunded",
  // The single event brunson-funnel-metrics cares about most:
  FirstCustomerVerified: "first_customer_verified",

  // Auth / lifecycle
  MagicLinkRequested: "magic_link_requested",
  UserSignedIn: "user_signed_in",
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
