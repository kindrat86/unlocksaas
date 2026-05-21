/**
 * High-Ticket Sprint application — qualification logic.
 *
 * Pure function. Given the 6 application answers, returns one of:
 *   - { qualification: "qualified", reason: ... }   → /apply/qualified (Calendly)
 *   - { qualification: "not_yet",   reason: ... }   → /apply/not-yet  (downsell)
 *
 * Brunson rule: a high-ticket application funnel exists to disqualify, not to
 * sell. Qualified leads earn the 15-minute discovery slot. Everyone else
 * routes back to the $1 Starter or $49/mo Playbook with their dignity intact.
 *
 * Current rules (conservative – tighten after the first 20 applications):
 *   1. has_budget = false  → not_yet (cannot pay, no point on the call)
 *   2. biggest_blocker text length < 30 chars → not_yet (low-signal answer)
 *   3. why_now text length < 30 chars         → not_yet (low-signal answer)
 *   4. Everyone else                          → qualified
 *
 * MRR band is NOT a disqualifier on its own — pre-revenue founders with
 * budget + clear blocker + clear why-now are exactly the target avatar.
 */

export type MrrBand =
  | "pre_revenue"
  | "under_1k"
  | "1k_to_5k"
  | "5k_to_20k"
  | "over_20k";

export type PreferredTier = "sprint_997" | "sprint_1997";

export type CalendarPreference = "this_week" | "next_week" | "flexible";

export type Qualification = "qualified" | "not_yet";

export interface ApplicationAnswers {
  email: string;
  first_name: string;
  product_url: string | null;
  mrr_band: MrrBand;
  biggest_blocker: string;
  why_now: string;
  has_budget: boolean;
  preferred_tier: PreferredTier | null;
  calendar_preference: CalendarPreference | null;
}

export interface QualificationOutcome {
  qualification: Qualification;
  reason: string;
}

const LOW_SIGNAL_MIN = 30;

export function qualify(answers: ApplicationAnswers): QualificationOutcome {
  if (!answers.has_budget) {
    return {
      qualification: "not_yet",
      reason: "budget_unconfirmed",
    };
  }

  const blocker = answers.biggest_blocker.trim();
  if (blocker.length < LOW_SIGNAL_MIN) {
    return {
      qualification: "not_yet",
      reason: "blocker_too_short",
    };
  }

  const whyNow = answers.why_now.trim();
  if (whyNow.length < LOW_SIGNAL_MIN) {
    return {
      qualification: "not_yet",
      reason: "why_now_too_short",
    };
  }

  return {
    qualification: "qualified",
    reason: "passed_all_gates",
  };
}

export const MRR_BAND_LABELS: Record<MrrBand, string> = {
  pre_revenue: "Pre-revenue (no paying customers yet)",
  under_1k: "Under $1k MRR",
  "1k_to_5k": "$1k – $5k MRR",
  "5k_to_20k": "$5k – $20k MRR",
  over_20k: "$20k+ MRR",
};

export const CALENDAR_PREF_LABELS: Record<CalendarPreference, string> = {
  this_week: "This week",
  next_week: "Next week",
  flexible: "Flexible — any time in the next 14 days",
};

export const PREFERRED_TIER_LABELS: Record<PreferredTier, string> = {
  sprint_997: "$997 – Self-paced Sprint",
  sprint_1997: "$1,997 – Sprint + one 1-hour 1:1 with Maryan",
};
