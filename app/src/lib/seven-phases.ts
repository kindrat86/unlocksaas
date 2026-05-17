/**
 * Seven Phases of a Funnel — canonical mapping module.
 *
 * Source: DotCom Secrets Secret #9. Companion to
 * strategy/decisions/seven-phases-coverage.md and
 * supabase/views/seven_phases.sql.
 *
 * The point of this file is to provide ONE source of truth that ties:
 *   - the Brunson phase taxonomy (1..7)
 *   - the live UnlockSaaS surface for each phase
 *   - the PostHog event name(s) that fire when a visitor crosses that phase
 *   - the Supabase view that aggregates the phase's witness data
 *
 * Without this module the mapping lives in three places (the doc, the SQL
 * file, the events.ts taxonomy) and they will drift. With this module a
 * future grep("seven_phases") returns one block of code that explains the
 * whole chapter.
 *
 * Importing this file at module load is intentional: it gives any future
 * Phase-coverage check (Friday Audible Call, audit script, dashboard component)
 * a typed, refactor-safe handle on the phase chain. Zero runtime cost — it is
 * pure data plus a few read helpers.
 */

import { Event, type EventName } from "@/lib/analytics/events";

// ─────────────────────────────────────────────────────────────────────────────
// Phase numbers — locked. Do not renumber. If Brunson revises the framework,
// add a Phase 8; do NOT shift the existing 1..7 because external artifacts
// (the SQL view, the coverage doc, the audit history) reference them.
// ─────────────────────────────────────────────────────────────────────────────

export type PhaseNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const PHASE_NUMBERS: readonly PhaseNumber[] = [1, 2, 3, 4, 5, 6, 7] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Per-phase canonical record.
// ─────────────────────────────────────────────────────────────────────────────

export interface PhaseRecord {
  /** Brunson phase number (1..7). */
  readonly num: PhaseNumber;
  /** Brunson phase name in DotCom Secrets terminology. */
  readonly brunsonName: string;
  /** Public route(s) that serve this phase on UnlockSaaS. */
  readonly surfaces: readonly string[];
  /**
   * PostHog events that signal a visitor crossed the phase boundary. Multiple
   * events per phase are OK — Phase 3 has both a result-page view and a Day 0
   * email send, for example. SQL aggregates one row per event, so naming
   * matters more than uniqueness.
   */
  readonly events: readonly EventName[];
  /**
   * Supabase view that aggregates the numeric witness for this phase. `null`
   * for phases that are pageview-only and read in PostHog (Phases 1 + 2).
   */
  readonly view: string | null;
  /**
   * Lean-stance category per seven-phases-coverage.md. Drives the `coverage`
   * column in seven_phases__weekly. "live" = surface + signal both flowing.
   * "live_lean" = surface exists, deliberately thin per workbook (e.g. no
   * downsell on Phase 5). "pre_staged" = surface live, build itself gated on
   * an evidence trigger (e.g. Phase 7 = Rung 2 = /repeatable).
   */
  readonly stance: "live" | "live_lean" | "pre_staged";
  /**
   * Human-readable description of what HAS to be true before this phase's
   * stance changes (e.g. when adding a downsell becomes correct, when Rung 2
   * starts shipping). Drawn verbatim from seven-phases-coverage.md to keep
   * the prose source single.
   */
  readonly stanceChangeTrigger: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// The seven phases.
// ─────────────────────────────────────────────────────────────────────────────

export const SEVEN_PHASES: readonly PhaseRecord[] = [
  {
    num: 1,
    brunsonName: "Pre-frame Bridge",
    surfaces: ["/"],
    events: [Event.FunnelHubViewed, Event.FunnelHubCtaClicked],
    view: null, // pageview-only; lives in PostHog
    stance: "live",
    stanceChangeTrigger: null,
  },
  {
    num: 2,
    brunsonName: "Squeeze (Subscribe)",
    surfaces: ["/diagnostic", "/parables"],
    events: [
      Event.DiagnosticPageViewed,
      Event.DiagnosticFormSubmitted,
      Event.ParablesPageViewed,
      Event.ParablesOptInSubmitted,
    ],
    view: null, // pageview-anchored; form submit is also captured by /api/diagnostic into diagnostic_leads
    stance: "live",
    stanceChangeTrigger: null,
  },
  {
    num: 3,
    brunsonName: "Activate",
    surfaces: ["/diagnostic/result", "soap_opera_email_1"],
    events: [Event.DiagnosticResultViewed],
    view: "seven_phases__activate",
    stance: "live",
    stanceChangeTrigger: null,
  },
  {
    num: 4,
    brunsonName: "Ascend (front-end paid)",
    surfaces: ["/starter"],
    events: [
      Event.StarterPageViewed,
      Event.StarterCheckoutClicked,
      Event.StarterPurchased,
    ],
    view: "seven_phases__ascend",
    stance: "live",
    stanceChangeTrigger: null,
  },
  {
    num: 5,
    brunsonName: "Profit Maximizer",
    surfaces: ["/oto", "/welcome"],
    events: [
      Event.OtoPageViewed,
      Event.OtoUpgradeClicked,
      Event.OtoDeclined,
      Event.MachineSubscribed,
    ],
    view: "seven_phases__profit_max",
    stance: "live_lean",
    stanceChangeTrigger:
      "Phase 2 growth trigger (3 verified customer cycles) + SOS Email 5 conversion-rate measurement + downsell candidate that clears Stripe per-charge fees + downsell that is useful pre-first-customer.",
  },
  {
    num: 6,
    brunsonName: "Return Path / Follow-up",
    surfaces: ["soap_opera_days_1_4", "seinfeld_ongoing"],
    events: [
      Event.CartRecoveryEnrolled,
      Event.CartRecoveryEmailSent,
      Event.CartRecoveryRecovered,
    ],
    view: "seven_phases__return_path",
    stance: "live",
    stanceChangeTrigger:
      "Operator action — push CRON_SECRET to Vercel envs (all 3) so the SOS daily drip + Seinfeld daily drip start firing. Until then sends_last_24h stays at 0.",
  },
  {
    num: 7,
    brunsonName: "Backend / Ascension",
    surfaces: ["/repeatable"],
    events: [Event.RepeatablePageViewed, Event.RepeatableInterestSubmitted],
    view: "seven_phases__backend",
    stance: "pre_staged",
    stanceChangeTrigger:
      "Workbook 10 Phase 3 trigger (50 paying customers) AND ≥1 verified Core customer has submitted an unprompted interest signal on /repeatable. Until then the build is correctly gated; the surface captures the demand signal.",
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Read helpers — typed handles for downstream code.
// ─────────────────────────────────────────────────────────────────────────────

/** Find the phase a given event belongs to, or null if untracked. */
export function phaseForEvent(event: EventName): PhaseRecord | null {
  for (const phase of SEVEN_PHASES) {
    if (phase.events.includes(event)) return phase;
  }
  return null;
}

/** Find the phase a given surface (route or system name) belongs to. */
export function phaseForSurface(surface: string): PhaseRecord | null {
  for (const phase of SEVEN_PHASES) {
    if (phase.surfaces.includes(surface)) return phase;
  }
  return null;
}

/** All phases that have a Supabase view (Phases 3..7). */
export function phasesWithView(): readonly PhaseRecord[] {
  return SEVEN_PHASES.filter((p): p is PhaseRecord & { view: string } =>
    p.view !== null,
  );
}

/** All phases whose stance is something other than "live" — i.e. needs context. */
export function phasesNeedingNarration(): readonly PhaseRecord[] {
  return SEVEN_PHASES.filter((p) => p.stance !== "live");
}
