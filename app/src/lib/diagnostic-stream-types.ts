/**
 * Streaming-diagnostic event protocol.
 *
 * The /api/diagnostic/stream endpoint emits NDJSON (one JSON object per line)
 * over a single POST connection. The client uses fetch().body.getReader() and
 * a newline-delimited parser to render visible reasoning steps as they land.
 *
 * Why NDJSON rather than SSE: NDJSON works cleanly over POST (SSE is a GET-only
 * mental model and the EventSource API is GET-only). We're sending a body up
 * (email + survey + URL) AND streaming events down, so a single POST that
 * streams its response body is the cleanest fit.
 *
 * Step ordering (see app/src/lib/diagnostic.ts → deepAnalyzeUrlStream):
 *   validate → verify_email → quota_check → fetch → parse →
 *   engine_start →
 *     score_wrong_person → score_weak_offer → score_weak_belief →
 *     rewrite_hero → rewrite_cta → rewrite_value_props →
 *     plan → competitors →
 *   save → subscribe →
 *   done
 *
 * The LLM-derived steps (score_*, rewrite_*, plan, competitors) are emitted as
 * the streamed JSON crosses each section boundary — real reasoning visibility,
 * not a faked timer.
 */

export type DiagnosticStepId =
  | "validate"
  | "verify_email"
  | "quota_check"
  | "fetch"
  | "parse"
  | "engine_start"
  | "score_wrong_person"
  | "score_weak_offer"
  | "score_weak_belief"
  | "rewrite_hero"
  | "rewrite_cta"
  | "rewrite_value_props"
  | "plan"
  | "competitors"
  | "save"
  | "subscribe";

export const DIAGNOSTIC_STEP_IDS: readonly DiagnosticStepId[] = [
  "validate",
  "verify_email",
  "quota_check",
  "fetch",
  "parse",
  "engine_start",
  "score_wrong_person",
  "score_weak_offer",
  "score_weak_belief",
  "rewrite_hero",
  "rewrite_cta",
  "rewrite_value_props",
  "plan",
  "competitors",
  "save",
  "subscribe",
] as const;

/** Human-readable labels for each step. Reluctant Hero voice — short, honest. */
export const DIAGNOSTIC_STEP_LABELS: Record<DiagnosticStepId, string> = {
  validate: "Validating your URL",
  verify_email: "Checking your email domain",
  quota_check: "Looking for prior diagnoses",
  fetch: "Fetching your page",
  parse: "Stripping nav, scripts, and SVGs",
  engine_start: "Booting the diagnostic engine",
  score_wrong_person: "Scoring vehicle / avatar",
  score_weak_offer: "Scoring offer + guarantee",
  score_weak_belief: "Scoring belief bridge",
  rewrite_hero: "Drafting hero headline rewrites",
  rewrite_cta: "Drafting CTA rewrites",
  rewrite_value_props: "Drafting value prop rewrites",
  plan: "Writing your 30-day plan",
  competitors: "Naming two competitors",
  save: "Saving your diagnosis",
  subscribe: "Queuing your first email",
};

/**
 * Step ordering used by the UI to render badges before any events arrive.
 * Skipped steps (e.g. verify_email is skipped for Google OAuth signups) are
 * still listed; the UI greys them out if no `start` event ever lands.
 */
export const DIAGNOSTIC_STEP_ORDER: readonly DiagnosticStepId[] = [
  "validate",
  "verify_email",
  "quota_check",
  "fetch",
  "parse",
  "engine_start",
  "score_wrong_person",
  "score_weak_offer",
  "score_weak_belief",
  "rewrite_hero",
  "rewrite_cta",
  "rewrite_value_props",
  "plan",
  "competitors",
  "save",
  "subscribe",
] as const;

export type DiagnosticStepEvent = {
  type: "step";
  id: DiagnosticStepId;
  label: string;
  status: "start" | "done";
  /** Optional one-line detail (e.g. "12,400 chars"). Renders below the label. */
  detail?: string;
  /** Optional 1-10 score (only on `score_*` done events). Renders as a badge. */
  score?: number;
};

export type DiagnosticDoneEvent = {
  type: "done";
  /** diagnostic_leads.id — the client navigates to /diagnostic/result?id=<this>. */
  id: string;
  /** True iff the email had a prior diagnosis (quota-gate hit, no new work done). */
  alreadyUsed?: boolean;
  /** Prior diagnosis's product_url when alreadyUsed is true. */
  previousUrl?: string | null;
  /** Diagnostic label, for analytics — undefined on already-used path. */
  label?: "wrong_person" | "weak_offer" | "weak_belief" | "error";
};

export type DiagnosticErrorEvent = {
  type: "error";
  message: string;
};

export type DiagnosticStreamEvent =
  | DiagnosticStepEvent
  | DiagnosticDoneEvent
  | DiagnosticErrorEvent;

/**
 * Stream content type. We use `application/x-ndjson` rather than
 * `text/event-stream` because we're streaming over POST and the SSE wire
 * format (`data: ...\n\n`) buys us nothing here.
 */
export const DIAGNOSTIC_STREAM_CONTENT_TYPE =
  "application/x-ndjson; charset=utf-8";

/**
 * Emit-callback shape used by the engine library to push events into the
 * stream's controller. Keeps the engine library agnostic of Response/Stream
 * machinery so it stays unit-testable.
 */
export type DiagnosticStreamEmit = (event: DiagnosticStreamEvent) => void;
