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
  // Isenberg overlay: agentic execution inside The Machine. Fires when a
  // founder invokes one of the vertical agents (offer scorer, outreach
  // drafter, page rewriter) and again when the agent returns a result.
  // The "Invoked → Completed" funnel tells us which agents Marco actually
  // uses vs. clicks once and abandons.
  PlaybookAgentInvoked: "playbook_agent_invoked",
  PlaybookAgentCompleted: "playbook_agent_completed",

  // First-Win onboarding agent — fires after $1 Starter checkout. The
  // five-step funnel (page_viewed → stream_started → drafts_revealed →
  // draft_accepted | draft_regenerated | skipped) tells us whether the
  // 5-minute TTFV bet is paying out. `stream_failed` lets us spot model
  // outages without grepping logs.
  FirstWinPageViewed: "first_win_page_viewed",
  FirstWinStreamStarted: "first_win_stream_started",
  FirstWinDraftsRevealed: "first_win_drafts_revealed",
  FirstWinDraftAccepted: "first_win_draft_accepted",
  FirstWinDraftRegenerated: "first_win_draft_regenerated",
  FirstWinSkipped: "first_win_skipped",
  FirstWinStreamFailed: "first_win_stream_failed",

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

  // Google Search Console feedback loop (server-side, daily cron at 19:00
  // UTC – /api/cron/gsc-feedback). One `GscSearchQueryObserved` per row
  // returned by the Search Analytics API for the previous-day window
  // (query + page + country + device + clicks/impressions/ctr/position).
  // One `GscFeedbackSynced` summary per tick so the operator can pin a
  // sync-health dashboard. Closes the CRO instrumentation → SEO loop
  // called out as a gap in the Surface-13 audit row.
  GscSearchQueryObserved: "gsc_search_query_observed",
  GscFeedbackSynced: "gsc_feedback_synced",

  // LLM-citation tracker (server-side, weekly cron at 09:00 UTC Mon —
  // /api/cron/llmo-citations). One `LlmoCitationWon` per (query,
  // provider) pair where unlocksaas.com appeared as a citation, so a
  // PostHog dashboard can chart "Brunson framework software for indie
  // SaaS founders" citation share over time. One `LlmoCitationsSynced`
  // summary per tick (success/skip/error counts). Closes the GEO/AEO/
  // LLMO measurement loop called out in the 2026 trend research.
  LlmoCitationWon: "llmo_citation_won",
  LlmoCitationsSynced: "llmo_citations_synced",
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
  /**
   * Coarse route category resolved from `route` via lib/seo/lcp-targets.
   * Examples: "home", "conversion", "auth", "trust", "pseo-detail",
   * "pseo-hub", "content", "podcast", "dataset", "app", "other".
   * Lets dashboards group by category without re-parsing the pathname.
   * Sent on every web_vital_reported event (not just LCP).
   */
  route_category?: string;
  /**
   * Per-route LCP budget in milliseconds. Pulled from the route-category
   * table in lib/seo/lcp-targets. ONLY populated when `metric_name === "LCP"`
   * – the other CWV metrics have global targets and don't need the per-
   * route field. `null` on non-LCP rows.
   */
  lcp_target_ms?: number | null;
  /**
   * Classification of the LCP value against its per-route target:
   *   sample <= target_ms * 0.6  → "good"
   *   sample <= target_ms        → "needs-improvement"
   *   sample >  target_ms        → "poor"
   * Distinct from the upstream `rating` field, which uses Google's
   * blanket 2500/4000 thresholds. `null` on non-LCP rows.
   */
  lcp_target_status?: "good" | "needs-improvement" | "poor" | null;
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

// ─────────────────────────────────────────────────────────────────────────────
// Google Search Console feedback events.
//
// Emitted by the daily cron at /api/cron/gsc-feedback (19:00 UTC). The cron
// pulls yesterday's Search Analytics rows and emits one row event per
// result, plus one summary event per tick.
//
// `GSC_DISTINCT_ID` is the canonical distinct ID used for both events. GSC
// data is not user-attributed (queries are anonymised at source) so we
// emit under a stable synthetic ID with a `server:` namespace prefix that
// mirrors the convention from `lib/analytics/server.ts` (where Stripe-only
// rows fall back to `stripe:<customer_id>`). The synthetic distinct ID
// gives the operator a clean person row in PostHog to pin a dashboard
// against, and prevents GSC rows from polluting real user cohorts.
// ─────────────────────────────────────────────────────────────────────────────

/** Distinct ID for GSC-sourced server events. Single row in PostHog. */
export const GSC_DISTINCT_ID = "server:gsc";

export interface GscSearchQueryObservedProps {
  /** Search query string (top-1000 daily, capped upstream). */
  query: string;
  /** Landing page URL returned by GSC for the query. */
  page: string;
  /** ISO 3166-1 alpha-3 country code (e.g. "usa"). Optional – GSC omits the
   *  field when the row aggregates across geographies. Mirrors upstream
   *  `SearchAnalyticsRow.country?: string` in `lib/gsc/client.ts`. */
  country?: string;
  /** GSC device dimension. Optional – upstream shape from
   *  `SearchAnalyticsRow.device?: "DESKTOP" | "MOBILE" | "TABLET"`. */
  device?: "DESKTOP" | "MOBILE" | "TABLET";
  clicks: number;
  impressions: number;
  /** Click-through rate, 0–1. */
  ctr: number;
  /** Average ranking position for the query (lower is better). */
  position: number;
  /** ISO date (YYYY-MM-DD) marking the start of the GSC window. */
  window_start_date: string;
  /** ISO date (YYYY-MM-DD) marking the end of the GSC window. */
  window_end_date: string;
  /**
   * SERP-snippet variant active for this page on this date (resolved via
   * `getActiveSerpVariantForGsc` in lib/seo/serp-variants). Omitted when
   * the page is not opted into the SERP A/B framework. Lets the operator
   * group GSC rows by variant cohort and compare CTR across epochs.
   */
  serp_variant_id?: string;
  /**
   * ISO date (YYYY-MM-DD) when the active variant shipped. Lets PostHog
   * derive "days since variant ship" without an extra lookup. Absent for
   * always-live baseline variants.
   */
  serp_variant_live_from?: string;
  /**
   * Total variants registered for this path. `1` means no rotation in
   * play – useful for filtering "in-test" rows from "permanent" rows in
   * the dashboard.
   */
  serp_variant_count?: number;
}

export interface GscFeedbackSyncedProps {
  /** ISO date (YYYY-MM-DD) marking the start of the GSC window. */
  window_start_date: string;
  /** ISO date (YYYY-MM-DD) marking the end of the GSC window. */
  window_end_date: string;
  /** Total rows returned by GSC before the per-tick cap. */
  rows_returned: number;
  /** Rows actually emitted to PostHog (zero when PH not configured). */
  rows_emitted: number;
  /** True when the per-tick cap clipped the row set. */
  cap_hit: boolean;
  /** Wall-clock duration of the cron tick, milliseconds. */
  elapsed_ms: number;
  /** Highest-clicks query in the window (omitted when zero rows). */
  top_query?: string;
  /** Worst-CTR query in the window (omitted when zero rows). */
  worst_ctr_query?: string;
}

// ── LLM-citation tracker ──────────────────────────────────────────────
// Mirrors `llmo_citations` rows for the PostHog side of the dashboard.
// Fired by /api/cron/llmo-citations every Monday 09:00 UTC.

/** Server-side distinct id used by the LLMO cron (matches gsc pattern). */
export const LLMO_DISTINCT_ID = "server:llmo";

export interface LlmoCitationWonProps {
  /** Q01..Q20 — matches strategy/llmo/priority-queries.csv. */
  query_id: string;
  /** The exact prompt text sent to the provider. */
  query_text: string;
  /** openai | perplexity | anthropic | google. */
  provider: string;
  /** Provider-specific model identifier. */
  model: string;
  /** 1-based ordinal among cited sources, null if cited without rank. */
  rank_in_answer: number | null;
  /** True when the response body also mentions the brand verbatim. */
  brand_mentioned: boolean;
}

export interface LlmoCitationsSyncedProps {
  /** Total provider responses inserted into llmo_citations this tick. */
  inserted: number;
  /** Total provider calls that errored or returned an empty body. */
  failed: number;
  /** How many of the 20 queries ran. */
  queries: number;
  /** Comma-joined list of providers used (e.g. "openai,perplexity"). */
  providers_used: string;
  /** Comma-joined list of providers skipped (no API key configured). */
  providers_skipped: string;
  /** Count of rows where unlocksaas.com was cited this tick. */
  citations_won: number;
  /** Wall-clock duration of the cron tick, milliseconds. */
  elapsed_ms: number;
}
