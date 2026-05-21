/**
 * Shared "submit a Sprint application" helper. Called by POST /api/apply.
 *
 * Responsibilities:
 *   1. Normalize + validate the 6 form answers.
 *   2. Run qualify() to produce the outcome.
 *   3. Upsert into high_ticket_applications (idempotent on lower(email)).
 *   4. Fire two emails — operator alert + applicant auto-reply — via Resend.
 *   5. Return the outcome (the caller routes to /apply/qualified or /apply/not-yet).
 *
 * Schema: supabase/migrations/20260521040000_high_ticket_applications.sql
 */

import { createAdminClient } from "@/lib/supabase/server";
import {
  qualify,
  type ApplicationAnswers,
  type CalendarPreference,
  type MrrBand,
  type PreferredTier,
  type Qualification,
} from "./qualification";
import { sendApplicantReply, sendOperatorAlert } from "./emails";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const VALID_MRR: readonly MrrBand[] = [
  "pre_revenue",
  "under_1k",
  "1k_to_5k",
  "5k_to_20k",
  "over_20k",
];
const VALID_TIER: readonly PreferredTier[] = ["sprint_997", "sprint_1997"];
const VALID_CAL: readonly CalendarPreference[] = [
  "this_week",
  "next_week",
  "flexible",
];

export interface RawSubmission {
  email: unknown;
  first_name: unknown;
  product_url: unknown;
  mrr_band: unknown;
  biggest_blocker: unknown;
  why_now: unknown;
  has_budget: unknown;
  preferred_tier: unknown;
  calendar_preference: unknown;
  source: unknown;
  ref_code: string | null;
  identity_variant: "verified_builder" | "paid_builder" | null;
}

export type SubmitOutcome =
  | {
      ok: true;
      id: string;
      qualification: Qualification;
      reason: string;
    }
  | {
      ok: false;
      error:
        | "invalid_email"
        | "invalid_first_name"
        | "invalid_mrr_band"
        | "invalid_blocker"
        | "invalid_why_now"
        | "invalid_budget"
        | "invalid_tier"
        | "invalid_calendar"
        | "db_upsert_failed";
      detail?: string;
    };

export async function submitApplication(
  raw: RawSubmission
): Promise<SubmitOutcome> {
  // ── Validate ────────────────────────────────────────────────────────────
  const emailRaw =
    typeof raw.email === "string" ? raw.email.trim().toLowerCase() : "";
  if (!emailRaw || emailRaw.length > 320 || !EMAIL_RE.test(emailRaw)) {
    return { ok: false, error: "invalid_email" };
  }

  const firstName =
    typeof raw.first_name === "string" ? raw.first_name.trim() : "";
  if (!firstName || firstName.length > 60) {
    return { ok: false, error: "invalid_first_name" };
  }

  if (typeof raw.mrr_band !== "string" || !VALID_MRR.includes(raw.mrr_band as MrrBand)) {
    return { ok: false, error: "invalid_mrr_band" };
  }
  const mrrBand = raw.mrr_band as MrrBand;

  const blocker =
    typeof raw.biggest_blocker === "string"
      ? raw.biggest_blocker.trim().slice(0, 1000)
      : "";
  if (blocker.length < 10) {
    return { ok: false, error: "invalid_blocker" };
  }

  const whyNow =
    typeof raw.why_now === "string"
      ? raw.why_now.trim().slice(0, 1000)
      : "";
  if (whyNow.length < 10) {
    return { ok: false, error: "invalid_why_now" };
  }

  if (typeof raw.has_budget !== "boolean") {
    return { ok: false, error: "invalid_budget" };
  }
  const hasBudget = raw.has_budget;

  let preferredTier: PreferredTier | null = null;
  if (raw.preferred_tier != null && raw.preferred_tier !== "") {
    if (
      typeof raw.preferred_tier !== "string" ||
      !VALID_TIER.includes(raw.preferred_tier as PreferredTier)
    ) {
      return { ok: false, error: "invalid_tier" };
    }
    preferredTier = raw.preferred_tier as PreferredTier;
  }

  let calendarPreference: CalendarPreference | null = null;
  if (raw.calendar_preference != null && raw.calendar_preference !== "") {
    if (
      typeof raw.calendar_preference !== "string" ||
      !VALID_CAL.includes(raw.calendar_preference as CalendarPreference)
    ) {
      return { ok: false, error: "invalid_calendar" };
    }
    calendarPreference = raw.calendar_preference as CalendarPreference;
  }

  const productUrl =
    typeof raw.product_url === "string" && raw.product_url.trim().length > 0
      ? raw.product_url.trim().slice(0, 2048)
      : null;

  const source =
    typeof raw.source === "string" && raw.source.length > 0
      ? raw.source.slice(0, 64)
      : "apply_page";

  // ── Qualify ─────────────────────────────────────────────────────────────
  const answers: ApplicationAnswers = {
    email: emailRaw,
    first_name: firstName,
    product_url: productUrl,
    mrr_band: mrrBand,
    biggest_blocker: blocker,
    why_now: whyNow,
    has_budget: hasBudget,
    preferred_tier: preferredTier,
    calendar_preference: calendarPreference,
  };

  const outcome = qualify(answers);

  // ── Persist ─────────────────────────────────────────────────────────────
  const supabase = createAdminClient();
  const nowIso = new Date().toISOString();

  // Cast through `never` for the same reason as challenge_subscribers and
  // founding_waitlist: the migration has shipped, the generated database.types.ts
  // has not been regenerated yet. The shape is constrained by the migration's
  // CHECK clauses, not the TypeScript layer.
  const { data: rowTyped, error: upsertError } = await supabase
    .from("high_ticket_applications" as never)
    .upsert(
      {
        email: emailRaw,
        first_name: firstName,
        product_url: productUrl,
        mrr_band: mrrBand,
        biggest_blocker: blocker,
        why_now: whyNow,
        has_budget: hasBudget,
        preferred_tier: preferredTier,
        calendar_preference: calendarPreference,
        source,
        ref_code: raw.ref_code,
        identity_variant: raw.identity_variant,
        // Operator-mutated columns reset on every resubmit so the operator
        // sees a fresh row. Brunson rule: respect the second touch.
        qualification: "pending",
        qualification_reason: null,
        status: "new",
        scheduled_at: null,
        closed_at: null,
        notes: null,
        submitted_at: nowIso,
      } as never,
      { onConflict: "email" }
    )
    .select("id")
    .single();

  if (upsertError || !rowTyped) {
    console.error("[apply-submit] upsert_failed", {
      email: emailRaw,
      error: upsertError?.message,
    });
    return {
      ok: false,
      error: "db_upsert_failed",
      detail: upsertError?.message,
    };
  }

  const row = rowTyped as unknown as { id: string };

  // Best-effort: update the row with the qualification outcome. If this fails
  // the operator alert still includes the qualification (computed from the
  // submitted answers), so the lead is not lost.
  const { error: qualUpdateErr } = await supabase
    .from("high_ticket_applications" as never)
    .update({
      qualification: outcome.qualification,
      qualification_reason: outcome.reason,
    } as never)
    .eq("id", row.id);

  if (qualUpdateErr) {
    console.warn("[apply-submit] qualification_update_failed", {
      id: row.id,
      error: qualUpdateErr.message,
    });
  }

  // ── Notify (best-effort; non-fatal) ─────────────────────────────────────
  const calendlyUrl = process.env.CALENDLY_APPLY_URL ?? null;

  const operatorAlert = sendOperatorAlert({
    applicationId: row.id,
    answers,
    qualification: outcome.qualification,
    reason: outcome.reason,
    refCode: raw.ref_code,
  });
  const applicantReply = sendApplicantReply({
    email: emailRaw,
    firstName,
    qualification: outcome.qualification,
    calendlyUrl,
  });

  const [opResult, applicantResult] = await Promise.all([
    operatorAlert,
    applicantReply,
  ]);

  if (!opResult.ok) {
    console.error("[apply-submit] operator_alert_failed", {
      id: row.id,
      error: opResult.error,
    });
  }
  if (!applicantResult.ok) {
    console.error("[apply-submit] applicant_reply_failed", {
      id: row.id,
      error: applicantResult.error,
    });
  }

  console.log("[apply-submit] ok", {
    id: row.id,
    qualification: outcome.qualification,
    reason: outcome.reason,
    source,
  });

  return {
    ok: true,
    id: row.id,
    qualification: outcome.qualification,
    reason: outcome.reason,
  };
}
