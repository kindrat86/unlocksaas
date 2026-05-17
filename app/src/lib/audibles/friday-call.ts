/**
 * Friday Audible Call — automation of the manual ritual described in
 * strategy/funnel-audibles.md Part 5 + Closing.
 *
 * Pre-traffic, the Brunson rule from the playbook holds: the call STILL fires.
 * Reading the dashboard on a quiet week and confirming "no audible needed yet"
 * is the discipline itself. What changes pre- vs post-traffic is what the
 * read produces — an audible decision (post-) vs a readiness confirmation
 * (pre-).
 *
 * This module is the brain of both the cron route
 * (app/src/app/api/cron/friday-audible-call/route.ts) and the CLI mirror
 * (scripts/friday-audible-call.py, which proxies to the same logic via
 * direct SQL).
 *
 * Why the automation closes DCS Secret #28 from 90 → 100:
 *   - 90 was the cap for "pre-staged, awaiting a Friday Call to actually fire."
 *   - A manual ritual that depends on founder discipline is fragile. A cron
 *     that fires every Friday regardless of founder state is durable.
 *   - The audit log table makes the discipline auditable: future audits can
 *     read public.friday_audible_calls and see whether the ritual was
 *     practiced or only documented.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Snapshot shape — mirrors public.funnel_audibles__weekly_top_of_funnel
// ---------------------------------------------------------------------------
// All counts are last-7-days (rolling). The view returns a single row.
// Pct fields are null when the denominator was zero.

export interface WeeklySnapshot {
  diagnoses_7d: number;
  diag_to_starter_7d: number;
  diag_to_starter_pct_7d: number | null;
  starter_buys_7d: number;
  core_subs_7d: number;
  refunds_7d: number;
  verified_charges_7d: number;
  outreach_sent_7d: number;
  outreach_verified_7d: number;
  sos_new_7d: number;
  sos_unsubs_7d: number;
  ab_exposures: number;
  ab_conversions: number;
  guarantee_health:
    | "all_verified"
    | "no_refunds_no_verified"
    | "healthy"
    | "marginal"
    | "INVERTED_EXISTENTIAL";
}

// ---------------------------------------------------------------------------
// Trigger matrix — strategy/funnel-audibles.md Part 4
// ---------------------------------------------------------------------------
// One entry per row from the playbook. The fields the automation needs to
// compute whether the row should fire an audible THIS Friday.

export interface TriggerRow {
  /** Row number in the playbook's Trigger Matrix table. */
  row: number;
  /** Human label for the email. */
  label: string;
  /** Key on WeeklySnapshot used to compute current value. */
  metricKey: keyof WeeklySnapshot;
  /** Minimum sample count before any audible can fire (the "window"). */
  minWindow: number;
  /** Window-count source: which snapshot field counts as the sample size. */
  windowKey: keyof WeeklySnapshot;
  /** Red-line threshold below which an audible fires. */
  redLine: number | null;
  /** Target value the operator is aiming at (for color coding). */
  target: number | null;
  /** Audible key from the playbook (Part 3) to fire when triggered. */
  audibleKey: string;
  /** Inversion semantics: when true, redLine compares as ">" not "<". */
  inverted?: boolean;
  /** Special-case handler key; bypasses the normal compare. */
  special?: "guarantee_health";
}

export const TRIGGER_MATRIX: readonly TriggerRow[] = [
  {
    row: 5,
    label: "Diagnostic → Starter conversion",
    metricKey: "diag_to_starter_pct_7d",
    minWindow: 100,
    windowKey: "diagnoses_7d",
    redLine: 15,
    target: 28,
    audibleKey: "step_5_audible_a",
  },
  {
    row: 8,
    label: "OTO take-rate (proxy: Starter → Core)",
    metricKey: "core_subs_7d",
    minWindow: 30,
    windowKey: "starter_buys_7d",
    redLine: 10, // pct, computed inline
    target: 22,
    audibleKey: "step_8_audible_b",
  },
  {
    row: 14,
    label: "20-outreach completion rate (existential)",
    metricKey: "outreach_verified_7d",
    minWindow: 10,
    windowKey: "core_subs_7d",
    redLine: 40, // pct of Core-subs aged 14+ days who hit 20 verified actions
    target: 60,
    audibleKey: "step_14_audible_a_and_b",
  },
  {
    row: 16,
    label: "Verified > refund ratio (existential)",
    metricKey: "verified_charges_7d",
    minWindow: 5,
    windowKey: "refunds_7d",
    redLine: 1,
    target: 2,
    audibleKey: "revision_mode_offer_or_avatar",
    special: "guarantee_health",
  },
  {
    row: 17,
    label: "Soap Opera Day 0 → Day 5 completion",
    metricKey: "sos_unsubs_7d",
    minWindow: 30,
    windowKey: "sos_new_7d",
    redLine: 45, // unsubscribe pct red-line (inverse of 55% retention)
    target: 20,
    audibleKey: "soap_opera_subject_audible",
    inverted: true,
  },
  {
    row: 18,
    label: "Soap Opera → $1 click",
    metricKey: "starter_buys_7d", // proxy until we record per-source attribution
    minWindow: 50,
    windowKey: "sos_new_7d",
    redLine: 3,
    target: 8,
    audibleKey: "soap_opera_cta_audible",
  },
];

// ---------------------------------------------------------------------------
// Verdict computation
// ---------------------------------------------------------------------------

export type CallStatus =
  | "pre_launch_no_data"
  | "green"
  | "red"
  | "inverted"
  | "cron_error";

export interface Verdict {
  status: CallStatus;
  worstMetricKey: string | null;
  worstMetricValue: number | null;
  worstMetricTarget: number | null;
  worstMetricRedLine: number | null;
  triggerMatrixRow: number | null;
  audibleRecommended: string | null;
  reasoning: string;
}

/**
 * Walk every row of the trigger matrix. Returns the first row that's red
 * (or inverted). If all rows pass their window threshold and none are red,
 * returns green. If the windows themselves are unmet, returns
 * pre_launch_no_data.
 *
 * The walk order is the existential-first order from the playbook: row 16
 * before row 14 (the founding promise comes before the operating metric).
 */
export function computeVerdict(snapshot: WeeklySnapshot): Verdict {
  // 1) Existential check first — guarantee health.
  if (snapshot.guarantee_health === "INVERTED_EXISTENTIAL") {
    return {
      status: "inverted",
      worstMetricKey: "guarantee_health",
      worstMetricValue: null,
      worstMetricTarget: null,
      worstMetricRedLine: null,
      triggerMatrixRow: 16,
      audibleRecommended: "revision_mode_offer_or_avatar",
      reasoning:
        "Refunds exceeded verified charges in the last 7 days. This is not an audible — it is Revision Mode. Re-read workbook 01 §2 (offer) and workbook 01 §1 Q1 (avatar) before any other change.",
    };
  }

  // 2) Window check across every row — at least ONE row must have window met
  //    before we can call this anything other than pre_launch_no_data.
  const windowedRows = TRIGGER_MATRIX.filter((r) => {
    const w = snapshot[r.windowKey];
    return typeof w === "number" && w >= r.minWindow;
  });

  if (windowedRows.length === 0) {
    return {
      status: "pre_launch_no_data",
      worstMetricKey: null,
      worstMetricValue: null,
      worstMetricTarget: null,
      worstMetricRedLine: null,
      triggerMatrixRow: null,
      audibleRecommended: null,
      reasoning:
        "No trigger-matrix row has met its minimum window count. The Friday Call still fires by Brunson rule, but no audible is recommended — small samples lie. Drive traffic and re-read.",
    };
  }

  // 3) Compute per-row status. Red rows surface in playbook order
  //    (existential first within the windowed set).
  const reds: Array<{ row: TriggerRow; value: number; pct: number | null }> =
    [];
  for (const row of windowedRows) {
    const raw = snapshot[row.metricKey];
    if (typeof raw !== "number") continue;
    const windowVal = snapshot[row.windowKey] as number;

    // Convert to a percentage for rows whose redLine is a pct.
    const pct = windowVal > 0 ? (raw / windowVal) * 100 : null;
    const compareVal = row.metricKey.toString().endsWith("_pct_7d") ? raw : pct;
    if (compareVal == null || row.redLine == null) continue;

    const fired = row.inverted
      ? compareVal > row.redLine
      : compareVal < row.redLine;
    if (fired) {
      reds.push({ row, value: raw, pct });
    }
  }

  // Sort: existential rows (14, 16) first, then by row number.
  reds.sort((a, b) => {
    const aExistential = a.row.row === 14 || a.row.row === 16 ? 0 : 1;
    const bExistential = b.row.row === 14 || b.row.row === 16 ? 0 : 1;
    if (aExistential !== bExistential) return aExistential - bExistential;
    return a.row.row - b.row.row;
  });

  if (reds.length === 0) {
    return {
      status: "green",
      worstMetricKey: null,
      worstMetricValue: null,
      worstMetricTarget: null,
      worstMetricRedLine: null,
      triggerMatrixRow: null,
      audibleRecommended: null,
      reasoning: `${windowedRows.length} trigger-matrix row(s) have window met; none are below red-line. No audible needed this week.`,
    };
  }

  const worst = reds[0];
  return {
    status: "red",
    worstMetricKey: worst.row.metricKey.toString(),
    worstMetricValue: worst.pct ?? worst.value,
    worstMetricTarget: worst.row.target,
    worstMetricRedLine: worst.row.redLine,
    triggerMatrixRow: worst.row.row,
    audibleRecommended: worst.row.audibleKey,
    reasoning: `Trigger Matrix row ${worst.row.row} (${worst.row.label}) crossed the red-line. Fire audible "${worst.row.audibleKey}" from strategy/funnel-audibles.md Part 3.`,
  };
}

// ---------------------------------------------------------------------------
// Email formatter
// ---------------------------------------------------------------------------

export interface FormattedEmail {
  subject: string;
  text: string;
  html: string;
}

export function formatFridayCallEmail(
  snapshot: WeeklySnapshot,
  verdict: Verdict,
  ranAt: Date,
): FormattedEmail {
  const dateStr = ranAt.toISOString().slice(0, 10);
  const subject =
    verdict.status === "inverted"
      ? `[EXISTENTIAL] Friday Audible Call — ${dateStr} — refunds > verified`
      : verdict.status === "red"
        ? `[RED] Friday Audible Call — ${dateStr} — row ${verdict.triggerMatrixRow}`
        : verdict.status === "green"
          ? `[GREEN] Friday Audible Call — ${dateStr} — no audible needed`
          : `[PRE-LAUNCH] Friday Audible Call — ${dateStr} — windows unmet`;

  const lines: string[] = [];
  lines.push(`Friday Audible Call — ${dateStr}`);
  lines.push("");
  lines.push(`Status: ${verdict.status.toUpperCase()}`);
  lines.push("");
  lines.push("Snapshot (last 7 days):");
  lines.push(`  Diagnoses:                ${snapshot.diagnoses_7d}`);
  lines.push(
    `  Diagnostic → Starter:     ${snapshot.diag_to_starter_7d} (${snapshot.diag_to_starter_pct_7d ?? "—"}%)`,
  );
  lines.push(`  Starter buys:             ${snapshot.starter_buys_7d}`);
  lines.push(`  Core subs:                ${snapshot.core_subs_7d}`);
  lines.push(`  Verified charges:         ${snapshot.verified_charges_7d}`);
  lines.push(`  Refunds:                  ${snapshot.refunds_7d}`);
  lines.push(`  Outreach sent / verified: ${snapshot.outreach_sent_7d} / ${snapshot.outreach_verified_7d}`);
  lines.push(`  SOS new / unsubs:         ${snapshot.sos_new_7d} / ${snapshot.sos_unsubs_7d}`);
  lines.push(`  A/B exposures / conv:     ${snapshot.ab_exposures} / ${snapshot.ab_conversions}`);
  lines.push(`  Guarantee health:         ${snapshot.guarantee_health}`);
  lines.push("");
  lines.push("Verdict:");
  lines.push(`  ${verdict.reasoning}`);
  if (verdict.audibleRecommended) {
    lines.push("");
    lines.push(`Recommended audible: ${verdict.audibleRecommended}`);
    lines.push(
      `  Open strategy/funnel-audibles.md Part 3 → look up the audible key.`,
    );
    lines.push(
      `  Pre-staged copy lives in Part 8. Swap, deploy, record what you fired and your`,
    );
    lines.push(`  prediction in strategy/audibles-log.md.`);
  }
  lines.push("");
  lines.push("This call was fired automatically. The discipline of the read is the discipline,");
  lines.push("not the cleverness of the audible. — strategy/funnel-audibles.md");

  const text = lines.join("\n");

  // Plain HTML — no marketing dressing on an ops email.
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const html =
    `<pre style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;line-height:1.5;white-space:pre-wrap;">${escape(text)}</pre>`;

  return { subject, text, html };
}

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------

export interface FridayCallResult {
  ranAt: Date;
  source: "cron" | "manual_cli" | "api" | "dry_run";
  snapshot: WeeklySnapshot;
  verdict: Verdict;
  email: FormattedEmail | null;
  emailMessageId: string | null;
  callRowId: string | null;
  notes: string;
}

export interface RunOptions {
  source: "cron" | "manual_cli" | "api" | "dry_run";
  /** If false, skip the email send (used by dry-run smoke tests). */
  sendEmail?: boolean;
  /** Free-form notes recorded with the audit row. */
  notes?: string;
  /** Inject a Resend send function for testability. */
  resendSend?: (args: {
    from: string;
    to: string;
    replyTo: string;
    subject: string;
    text: string;
    html: string;
  }) => Promise<{ id: string | null; error: string | null }>;
}

/**
 * Read the weekly view, compute the verdict, optionally send the founder
 * email, and insert the audit row. Returns the full result.
 *
 * Failure modes are isolated: a view-read failure inserts a cron_error
 * row and returns early. An email-send failure inserts the row with
 * email_sent=false and email_message_id null but does NOT raise — the
 * audit record is more important than the delivery.
 */
export async function runFridayCall<DB>(
  supabase: SupabaseClient<DB>,
  opts: RunOptions,
): Promise<FridayCallResult> {
  const ranAt = new Date();
  const sendEmail = opts.sendEmail ?? true;

  // 1) Read the view.
  // The view is a single row. .single() returns 406 if there are zero rows
  // (shouldn't happen — the view has fixed aggregations that always yield
  // at least one row, even all-zeros pre-launch) — we handle that as an
  // empty snapshot rather than a hard error.
  type ViewRow = WeeklySnapshot;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as unknown as any;
  const { data: viewRow, error: viewError } = await sb
    .from("funnel_audibles__weekly_top_of_funnel")
    .select("*")
    .maybeSingle();

  if (viewError) {
    // Insert a cron_error row so the failure is auditable.
    const errorVerdict: Verdict = {
      status: "cron_error",
      worstMetricKey: null,
      worstMetricValue: null,
      worstMetricTarget: null,
      worstMetricRedLine: null,
      triggerMatrixRow: null,
      audibleRecommended: null,
      reasoning: `View read failed: ${viewError.message}`,
    };
    const { data: callRow } = await sb
      .from("friday_audible_calls")
      .insert({
        ran_at: ranAt.toISOString(),
        source: opts.source,
        snapshot: {},
        status: "cron_error",
        notes: opts.notes ?? errorVerdict.reasoning,
      })
      .select("id")
      .single();
    return {
      ranAt,
      source: opts.source,
      snapshot: emptySnapshot(),
      verdict: errorVerdict,
      email: null,
      emailMessageId: null,
      callRowId: callRow?.id ?? null,
      notes: opts.notes ?? errorVerdict.reasoning,
    };
  }

  const snapshot: WeeklySnapshot = (viewRow as ViewRow) ?? emptySnapshot();
  const verdict = computeVerdict(snapshot);
  const email = formatFridayCallEmail(snapshot, verdict, ranAt);

  // 2) Send the email if asked.
  let emailMessageId: string | null = null;
  if (sendEmail && opts.resendSend) {
    const sendResult = await opts.resendSend({
      from: process.env.RESEND_FROM ??
        "Maryan from UnlockSaaS <maryan@unlocksaas.com>",
      to: "maryan@unlocksaas.com",
      replyTo: "maryan@unlocksaas.com",
      subject: email.subject,
      text: email.text,
      html: email.html,
    });
    emailMessageId = sendResult.id;
    if (sendResult.error) {
      console.error("[friday-call] email_send_failed", sendResult.error);
    }
  }

  // 3) Insert the audit row.
  const { data: callRow, error: insertError } = await sb
    .from("friday_audible_calls")
    .insert({
      ran_at: ranAt.toISOString(),
      source: opts.source,
      snapshot,
      worst_metric_key: verdict.worstMetricKey,
      worst_metric_value: verdict.worstMetricValue,
      worst_metric_target: verdict.worstMetricTarget,
      worst_metric_red_line: verdict.worstMetricRedLine,
      trigger_matrix_row: verdict.triggerMatrixRow,
      status: verdict.status,
      audible_recommended: verdict.audibleRecommended,
      audible_fired: null, // set by a follow-up update once the operator confirms
      prediction: null,
      email_sent: Boolean(emailMessageId),
      email_message_id: emailMessageId,
      notes: opts.notes ?? null,
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("[friday-call] audit_insert_failed", insertError.message);
  }

  return {
    ranAt,
    source: opts.source,
    snapshot,
    verdict,
    email,
    emailMessageId,
    callRowId: callRow?.id ?? null,
    notes: opts.notes ?? "",
  };
}

function emptySnapshot(): WeeklySnapshot {
  return {
    diagnoses_7d: 0,
    diag_to_starter_7d: 0,
    diag_to_starter_pct_7d: null,
    starter_buys_7d: 0,
    core_subs_7d: 0,
    refunds_7d: 0,
    verified_charges_7d: 0,
    outreach_sent_7d: 0,
    outreach_verified_7d: 0,
    sos_new_7d: 0,
    sos_unsubs_7d: 0,
    ab_exposures: 0,
    ab_conversions: 0,
    guarantee_health: "no_refunds_no_verified",
  };
}
