/**
 * Recrawl agent — pure delta logic.
 *
 * The weekly cron (/api/cron/recrawl) calls `deepAnalyzeUrl(profile.product_url)`,
 * persists the result as a diagnostic_snapshots row, then asks this module:
 *   - what changed since the last snapshot?
 *   - is the change material enough to bother the founder?
 *
 * Kept side-effect-free so the diffing logic is unit-testable and stable
 * across LLM-output drift. The route handler is the only place that touches
 * Supabase + Resend + Slack.
 *
 * Threshold philosophy (Brunson Reluctant Hero discipline):
 *   - LLM scores are non-deterministic. A drift of ±1 on any axis is noise.
 *   - A drop of ≥ 2 on any axis is a signal worth surfacing.
 *   - A primary-label flip (e.g. weak_offer → wrong_person) always alerts —
 *     the founder's biggest problem changed shape.
 *   - We never alert on improvements alone. The product's job is to flag
 *     regressions; founders notice their own wins without us in their inbox.
 */

import type { DeepDiagnosticResult, DiagnosticLabel } from "@/lib/diagnostic";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type ScoreAxis = "wrong_person" | "weak_offer" | "weak_belief";

export const SCORE_AXES: readonly ScoreAxis[] = [
  "wrong_person",
  "weak_offer",
  "weak_belief",
] as const;

/** Pretty names for use in email subject lines and dashboard copy. */
export const AXIS_LABEL: Record<ScoreAxis, string> = {
  wrong_person: "Wrong Person",
  weak_offer: "Weak Offer",
  weak_belief: "Weak Belief",
};

export interface AxisChange {
  axis: ScoreAxis;
  prev_score: number;
  curr_score: number;
  /** curr - prev. Positive = improved, negative = regressed. */
  change: number;
  /** The current diagnosis sentence from the new snapshot. */
  curr_diagnosis: string;
  /** First evidence quote from the new snapshot, if present. */
  curr_evidence_quote: string | null;
}

export interface LabelChange {
  from: DiagnosticLabel;
  to: DiagnosticLabel;
}

export interface RecrawlDelta {
  /** Non-null iff the primary upstream problem flipped. */
  label_changed: LabelChange | null;
  /** All three axes, sorted by change ascending (worst regression first). */
  score_changes: AxisChange[];
  /** The single most-regressed axis, if any axis went down at all. */
  biggest_drop: AxisChange | null;
  /** The single most-improved axis, if any axis went up at all. */
  biggest_gain: AxisChange | null;
  /** Sum of all per-axis changes. Negative = net regression. */
  overall_change: number;
  /** Competitor names that appear in curr but not prev. */
  new_competitors: string[];
  /** Strengths in curr that were not in prev (string-equality). */
  new_strengths: string[];
  /** Strengths in prev that no longer appear in curr. */
  lost_strengths: string[];
}

export interface ShouldAlertOptions {
  /**
   * Minimum absolute regression on any single axis required to fire an alert.
   * Default 2. The unit tests pin this; raise it if Resend gets spammy.
   */
  dropThreshold?: number;
}

// ---------------------------------------------------------------------------
// Delta computation
// ---------------------------------------------------------------------------

/**
 * Compute the per-axis + structural delta between two DeepDiagnosticResult
 * payloads. Pure function. Identical inputs always produce identical output.
 */
export function computeDelta(
  prev: DeepDiagnosticResult,
  curr: DeepDiagnosticResult
): RecrawlDelta {
  const score_changes: AxisChange[] = SCORE_AXES.map((axis) => {
    const prev_axis = prev.scores[axis];
    const curr_axis = curr.scores[axis];
    return {
      axis,
      prev_score: prev_axis.score,
      curr_score: curr_axis.score,
      change: curr_axis.score - prev_axis.score,
      curr_diagnosis: curr_axis.diagnosis,
      curr_evidence_quote: curr_axis.evidence?.[0] ?? null,
    };
  }).sort((a, b) => a.change - b.change);

  const worst = score_changes[0];
  const best = score_changes[score_changes.length - 1];

  const biggest_drop = worst && worst.change < 0 ? worst : null;
  const biggest_gain = best && best.change > 0 ? best : null;

  const overall_change = score_changes.reduce((sum, c) => sum + c.change, 0);

  const label_changed: LabelChange | null =
    prev.label !== curr.label ? { from: prev.label, to: curr.label } : null;

  const prev_competitor_names = new Set(
    prev.competitors.map((c) => normalizeName(c.name))
  );
  const new_competitors = curr.competitors
    .filter((c) => !prev_competitor_names.has(normalizeName(c.name)))
    .map((c) => c.name);

  const prev_strengths = new Set(prev.strengths.map(normalizeString));
  const curr_strengths = new Set(curr.strengths.map(normalizeString));

  const new_strengths = curr.strengths.filter(
    (s) => !prev_strengths.has(normalizeString(s))
  );
  const lost_strengths = prev.strengths.filter(
    (s) => !curr_strengths.has(normalizeString(s))
  );

  return {
    label_changed,
    score_changes,
    biggest_drop,
    biggest_gain,
    overall_change,
    new_competitors,
    new_strengths,
    lost_strengths,
  };
}

/**
 * Should we email the founder about this delta?
 *
 * Yes if EITHER:
 *   - any axis dropped by ≥ dropThreshold (default 2)
 *   - the primary label flipped
 *
 * Improvements alone never trigger an alert. We do not want to train the
 * founder to expect a celebratory email every time the LLM has a good day.
 */
export function shouldAlert(
  delta: RecrawlDelta,
  opts: ShouldAlertOptions = {}
): boolean {
  const threshold = opts.dropThreshold ?? 2;
  if (delta.label_changed) return true;
  if (delta.biggest_drop && Math.abs(delta.biggest_drop.change) >= threshold) {
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Helpers (exported for unit tests)
// ---------------------------------------------------------------------------

export function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

export function normalizeString(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * Pretty diff string used in the email subject line and in the inline
 * dashboard "what changed" caption.
 *
 *   "Wrong Person 7 → 4"   (regressed by 3)
 *   "Weak Offer 5 → 7"     (improved by 2)
 */
export function formatAxisChange(c: AxisChange): string {
  return `${AXIS_LABEL[c.axis]} ${c.prev_score} → ${c.curr_score}`;
}
