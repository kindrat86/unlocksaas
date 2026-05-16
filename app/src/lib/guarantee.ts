/**
 * 60-day guarantee verifier.
 *
 * The promise (locked in strategy/state.json → dotcom_secrets.offer_stack.guarantee):
 *
 *   "Marco's first paying customer within 60 days. Judged AT the 60-day mark.
 *    Refund triggers only if (a) the tracked in-product milestones were
 *    completed AND (b) Stripe shows no new paying customer."
 *
 *   Remedy: full refund of the 2 monthly payments ($49 × 2 = $98) made in
 *   the 60-day window.
 *
 * This module owns:
 *
 *   - The list of milestones that count as "the work" (REFUND_REQUIRED_MILESTONES)
 *   - The window length (GUARANTEE_WINDOW_DAYS)
 *   - The refund cap (REFUND_CAP_MONTHS × monthly price)
 *   - The pure evaluator that turns DB rows into a verdict
 *   - Helpers for marking milestones, recording conversions, and issuing refunds
 *
 * Hard Rule #4 from BUILD-PROMPT-CLAUDE-CODE.md:
 *   "The 60-day guarantee is machine-verifiable. Refund logic is automated."
 *
 * Pure functions take a `now` argument so tests can pin the clock.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

// ── constants ─────────────────────────────────────────────────────────────────

export const GUARANTEE_WINDOW_DAYS = 60;
export const REFUND_CAP_MONTHS = 2;
export const CORE_MONTHLY_PRICE_CENTS = 4900;
export const REFUND_CAP_CENTS = REFUND_CAP_MONTHS * CORE_MONTHLY_PRICE_CENTS; // $98

/** Canonical milestone keys. Mirror these in `supabase/migrations/...guarantee.sql`. */
export const MILESTONE_KEYS = {
  DREAM_CUSTOMER_PINNED: "dream_customer_pinned",
  OFFER_LOCKED: "offer_locked",
  AC_DEFINED: "ac_defined",
  COPY_GENERATED: "copy_generated",
  OUTREACH_ASSETS_GENERATED: "outreach_assets_generated",
  TWENTY_OUTREACH_ACTIONS_LOGGED: "twenty_outreach_actions_logged",
} as const;

export type MilestoneKey = (typeof MILESTONE_KEYS)[keyof typeof MILESTONE_KEYS];

/** The set of milestones the user MUST complete to be refund-eligible. */
export const REFUND_REQUIRED_MILESTONES: readonly MilestoneKey[] = [
  MILESTONE_KEYS.DREAM_CUSTOMER_PINNED,
  MILESTONE_KEYS.OFFER_LOCKED,
  MILESTONE_KEYS.AC_DEFINED,
  MILESTONE_KEYS.COPY_GENERATED,
  MILESTONE_KEYS.OUTREACH_ASSETS_GENERATED,
  MILESTONE_KEYS.TWENTY_OUTREACH_ACTIONS_LOGGED,
] as const;

/** Map each milestone key to the Machine step that produces it (for UI). */
export const MILESTONE_STEP_INDEX: Record<MilestoneKey, number> = {
  [MILESTONE_KEYS.DREAM_CUSTOMER_PINNED]: 1,
  [MILESTONE_KEYS.OFFER_LOCKED]: 2,
  [MILESTONE_KEYS.AC_DEFINED]: 3,
  [MILESTONE_KEYS.COPY_GENERATED]: 4,
  [MILESTONE_KEYS.OUTREACH_ASSETS_GENERATED]: 5,
  [MILESTONE_KEYS.TWENTY_OUTREACH_ACTIONS_LOGGED]: 6,
};

export const MILESTONE_DISPLAY: Record<MilestoneKey, string> = {
  [MILESTONE_KEYS.DREAM_CUSTOMER_PINNED]: "Dream Customer Pinned",
  [MILESTONE_KEYS.OFFER_LOCKED]: "Offer Locked",
  [MILESTONE_KEYS.AC_DEFINED]: "AC Defined",
  [MILESTONE_KEYS.COPY_GENERATED]: "Copy Generated",
  [MILESTONE_KEYS.OUTREACH_ASSETS_GENERATED]: "Outreach Assets Generated",
  [MILESTONE_KEYS.TWENTY_OUTREACH_ACTIONS_LOGGED]: "20 Outreach Actions Logged",
};

// ── types ─────────────────────────────────────────────────────────────────────

export type GuaranteePhase =
  | "no_subscription" // user never bought core
  | "active" // inside window, no verdict yet
  | "verdict_kept" // any verified conversion exists → promise kept
  | "verdict_refund_eligible" // window closed, work done, no conversion
  | "verdict_work_incomplete" // window closed but work was not done
  | "refunded" // refund already issued
  | "canceled_pre_window" // canceled before window closed without refund
  | "expired"; // window closed > 30d ago; no action taken

export interface ProfileRow {
  id: string;
  email: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  tier: "none" | "starter" | "core";
  subscription_status: string | null;
  core_started_at: string | null;
  guarantee_expires_at: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  refunded_at: string | null;
}

export interface MilestoneRow {
  key: string;
  achieved_at: string;
}

export interface PaymentRow {
  stripe_charge_id: string | null;
  stripe_payment_intent_id: string | null;
  kind: "starter" | "core_initial" | "core_renewal" | "other";
  amount_cents: number;
  status: "paid" | "failed" | "refunded" | "partial_refund";
  paid_at: string | null;
  refunded_at: string | null;
  refund_amount_cents: number | null;
}

export interface VerifiedConversionRow {
  stripe_charge_id: string | null;
  amount_cents: number;
  detected_at: string;
}

export interface GuaranteeState {
  profile: ProfileRow;
  milestones: MilestoneRow[];
  payments: PaymentRow[];
  conversions: VerifiedConversionRow[];
}

export interface GuaranteeEvaluation {
  phase: GuaranteePhase;
  daysRemaining: number; // negative once window has closed
  windowClosed: boolean;
  startedAt: Date | null;
  expiresAt: Date | null;
  milestones: Array<{
    key: MilestoneKey;
    display: string;
    stepIndex: number;
    achieved: boolean;
    achievedAt: Date | null;
  }>;
  workCompleteCount: number;
  workTotalCount: number;
  firstCustomerVerified: boolean;
  refund: {
    eligible: boolean;
    reasons: string[]; // one human-readable line per blocking condition
    maxRefundCents: number;
    refundedAtCents: number; // already refunded
  };
}

// ── pure evaluator ────────────────────────────────────────────────────────────

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Pure function. Given the DB state and a `now`, return the full verdict.
 *
 * Decision tree:
 *   1. No core subscription → no_subscription.
 *   2. Already refunded → refunded.
 *   3. Any verified conversion exists → verdict_kept.
 *   4. Inside window:
 *        - active (countdown displayed; refund not yet offered).
 *   5. Window closed:
 *        - all required milestones done + no conversion → verdict_refund_eligible.
 *        - any milestone missing → verdict_work_incomplete (no refund owed).
 *   6. Window closed > 30 days ago without action → expired (the right move
 *      is to leave the subscription alone; the user already missed the window).
 */
export function evaluateGuarantee(
  state: GuaranteeState,
  now: Date = new Date()
): GuaranteeEvaluation {
  const { profile, milestones, payments, conversions } = state;

  const milestonesByKey = new Map(milestones.map((m) => [m.key, m]));
  const milestonesList = REFUND_REQUIRED_MILESTONES.map((key) => {
    const row = milestonesByKey.get(key);
    return {
      key,
      display: MILESTONE_DISPLAY[key],
      stepIndex: MILESTONE_STEP_INDEX[key],
      achieved: Boolean(row),
      achievedAt: row ? new Date(row.achieved_at) : null,
    };
  });

  const workCompleteCount = milestonesList.filter((m) => m.achieved).length;
  const workTotalCount = milestonesList.length;
  const firstCustomerVerified = conversions.length > 0;

  const startedAt = profile.core_started_at
    ? new Date(profile.core_started_at)
    : null;
  const expiresAt = profile.guarantee_expires_at
    ? new Date(profile.guarantee_expires_at)
    : startedAt
      ? new Date(startedAt.getTime() + GUARANTEE_WINDOW_DAYS * DAY_MS)
      : null;

  const daysRemaining = expiresAt
    ? Math.ceil((expiresAt.getTime() - now.getTime()) / DAY_MS)
    : 0;
  const windowClosed = expiresAt ? now >= expiresAt : false;

  // Compute max refund (cap at 2 × monthly price).
  const eligibleWindowPayments = payments.filter(
    (p) =>
      (p.kind === "core_initial" || p.kind === "core_renewal") &&
      p.status !== "failed" &&
      p.paid_at !== null &&
      startedAt !== null &&
      expiresAt !== null &&
      new Date(p.paid_at) >= startedAt &&
      new Date(p.paid_at) <= expiresAt
  );
  const totalPaidInWindowCents = eligibleWindowPayments.reduce(
    (sum, p) => sum + p.amount_cents,
    0
  );
  const maxRefundCents = Math.min(totalPaidInWindowCents, REFUND_CAP_CENTS);
  const refundedAtCents = eligibleWindowPayments.reduce(
    (sum, p) => sum + (p.refund_amount_cents ?? 0),
    0
  );

  // Build the verdict.
  if (profile.tier !== "core" && !startedAt) {
    return makeEval({
      phase: "no_subscription",
      daysRemaining: 0,
      windowClosed: false,
      startedAt,
      expiresAt,
      milestonesList,
      workCompleteCount,
      workTotalCount,
      firstCustomerVerified,
      refund: {
        eligible: false,
        reasons: ["No active Machine subscription."],
        maxRefundCents: 0,
        refundedAtCents,
      },
    });
  }

  if (profile.refunded_at) {
    return makeEval({
      phase: "refunded",
      daysRemaining,
      windowClosed,
      startedAt,
      expiresAt,
      milestonesList,
      workCompleteCount,
      workTotalCount,
      firstCustomerVerified,
      refund: {
        eligible: false,
        reasons: [
          `Refund already issued on ${profile.refunded_at.slice(0, 10)}.`,
        ],
        maxRefundCents,
        refundedAtCents,
      },
    });
  }

  if (firstCustomerVerified) {
    return makeEval({
      phase: "verdict_kept",
      daysRemaining,
      windowClosed,
      startedAt,
      expiresAt,
      milestonesList,
      workCompleteCount,
      workTotalCount,
      firstCustomerVerified,
      refund: {
        eligible: false,
        reasons: ["Promise kept — paying customer detected."],
        maxRefundCents,
        refundedAtCents,
      },
    });
  }

  if (!windowClosed) {
    return makeEval({
      phase: "active",
      daysRemaining,
      windowClosed,
      startedAt,
      expiresAt,
      milestonesList,
      workCompleteCount,
      workTotalCount,
      firstCustomerVerified,
      refund: {
        eligible: false,
        reasons: [
          `Window still open — ${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining. Judgement at the 60-day mark.`,
        ],
        maxRefundCents,
        refundedAtCents,
      },
    });
  }

  // Window has closed.
  const missing = milestonesList.filter((m) => !m.achieved);
  if (missing.length > 0) {
    return makeEval({
      phase: "verdict_work_incomplete",
      daysRemaining,
      windowClosed,
      startedAt,
      expiresAt,
      milestonesList,
      workCompleteCount,
      workTotalCount,
      firstCustomerVerified,
      refund: {
        eligible: false,
        reasons: [
          `Work conditions not met (${workCompleteCount}/${workTotalCount}). Missing: ${missing.map((m) => m.display).join(", ")}.`,
        ],
        maxRefundCents,
        refundedAtCents,
      },
    });
  }

  // Window closed, all work done, no verified customer → refund-eligible.
  // Allow the eligibility window to stay open for 30 days after the cutoff so
  // the user has time to claim. After that, expired.
  const daysSinceExpiry = Math.floor(
    (now.getTime() - (expiresAt as Date).getTime()) / DAY_MS
  );
  if (daysSinceExpiry > 30) {
    return makeEval({
      phase: "expired",
      daysRemaining,
      windowClosed,
      startedAt,
      expiresAt,
      milestonesList,
      workCompleteCount,
      workTotalCount,
      firstCustomerVerified,
      refund: {
        eligible: false,
        reasons: ["Refund claim window expired (30 days after guarantee end)."],
        maxRefundCents,
        refundedAtCents,
      },
    });
  }

  return makeEval({
    phase: "verdict_refund_eligible",
    daysRemaining,
    windowClosed,
    startedAt,
    expiresAt,
    milestonesList,
    workCompleteCount,
    workTotalCount,
    firstCustomerVerified,
    refund: {
      eligible: maxRefundCents - refundedAtCents > 0,
      reasons:
        maxRefundCents - refundedAtCents > 0
          ? ["Window closed; work conditions met; no paying customer detected."]
          : ["Refund already fully issued for the window."],
      maxRefundCents,
      refundedAtCents,
    },
  });
}

type EvalInput = Omit<GuaranteeEvaluation, "milestones"> & {
  milestonesList: GuaranteeEvaluation["milestones"];
};

function makeEval(input: EvalInput): GuaranteeEvaluation {
  const { milestonesList, ...rest } = input;
  return { ...rest, milestones: milestonesList };
}

// ── DB helpers ────────────────────────────────────────────────────────────────

/**
 * Load everything the evaluator needs in one pass. Caller decides which client
 * to use: server (RLS-respecting; signed-in user) or admin (service role).
 */
export async function loadGuaranteeState(
  client: SupabaseClient,
  profileId: string
): Promise<GuaranteeState | null> {
  const [profileRes, milestonesRes, paymentsRes, conversionsRes] =
    await Promise.all([
      client
        .from("profiles")
        .select(
          "id,email,stripe_customer_id,stripe_subscription_id,tier,subscription_status,core_started_at,guarantee_expires_at,cancel_at_period_end,canceled_at,refunded_at"
        )
        .eq("id", profileId)
        .maybeSingle(),
      client
        .from("milestones")
        .select("key,achieved_at")
        .eq("profile_id", profileId),
      client
        .from("billing_payments")
        .select(
          "stripe_charge_id,stripe_payment_intent_id,kind,amount_cents,status,paid_at,refunded_at,refund_amount_cents"
        )
        .eq("profile_id", profileId),
      client
        .from("verified_conversions")
        .select("stripe_charge_id,amount_cents,detected_at")
        .eq("profile_id", profileId),
    ]);

  if (profileRes.error || !profileRes.data) return null;

  return {
    profile: profileRes.data as ProfileRow,
    milestones: (milestonesRes.data ?? []) as MilestoneRow[],
    payments: (paymentsRes.data ?? []) as PaymentRow[],
    conversions: (conversionsRes.data ?? []) as VerifiedConversionRow[],
  };
}

/**
 * Idempotent. The unique index (profile_id, key) prevents duplicates.
 * Returns true if a new row was inserted, false if it already existed.
 *
 * Called from:
 *   - the engine route when a Machine step completes
 *   - the webhook when outreach_actions row count crosses 20
 *   - operator manually via admin tool
 */
export async function markMilestone(
  adminClient: SupabaseClient,
  profileId: string,
  key: MilestoneKey,
  source: "engine" | "webhook" | "manual" = "engine",
  metadata?: Record<string, unknown>
): Promise<{ inserted: boolean }> {
  const { error } = await adminClient.from("milestones").insert({
    profile_id: profileId,
    key,
    source,
    metadata: metadata ?? null,
  });

  if (!error) return { inserted: true };

  // 23505 = unique_violation. Treat as success (idempotent).
  if ((error as { code?: string }).code === "23505") {
    return { inserted: false };
  }

  throw new Error(`markMilestone(${key}): ${error.message}`);
}

/**
 * Idempotent. Records a paying customer detected on the user's connected
 * Stripe account (or recorded manually by the operator).
 */
export async function recordVerifiedConversion(
  adminClient: SupabaseClient,
  args: {
    profileId: string;
    stripeChargeId?: string;
    stripeAccountId?: string;
    amountCents: number;
    currency?: string;
    customerEmail?: string;
    source?: "connect" | "manual";
    metadata?: Record<string, unknown>;
  }
): Promise<{ inserted: boolean }> {
  const { error } = await adminClient.from("verified_conversions").insert({
    profile_id: args.profileId,
    stripe_charge_id: args.stripeChargeId ?? null,
    stripe_account_id: args.stripeAccountId ?? null,
    amount_cents: args.amountCents,
    currency: args.currency ?? "usd",
    customer_email: args.customerEmail ?? null,
    source: args.source ?? "connect",
    metadata: args.metadata ?? null,
  });

  if (!error) return { inserted: true };
  if ((error as { code?: string }).code === "23505") {
    return { inserted: false };
  }
  throw new Error(`recordVerifiedConversion: ${error.message}`);
}

// ── refund issuance ───────────────────────────────────────────────────────────

export interface RefundResult {
  ok: boolean;
  refundedCents: number;
  refunds: Array<{
    chargeId: string;
    refundId: string;
    amountCents: number;
  }>;
  message: string;
}

/**
 * Issue the refund the guarantee promises.
 *
 * Walks the eligible payments inside the window (oldest first), creates a
 * Stripe refund for each up to REFUND_CAP_CENTS, cancels the subscription,
 * and stamps profile.refunded_at + each billing_payments.refunded_at.
 *
 * Safe to call twice — re-evaluates first, no-ops if already refunded or
 * not eligible. The Stripe refund API itself is idempotent via metadata.
 */
export async function issueRefund(args: {
  adminClient: SupabaseClient;
  stripe: Stripe;
  profileId: string;
  reason?: string;
  now?: Date;
}): Promise<RefundResult> {
  const { adminClient, stripe, profileId, reason, now = new Date() } = args;

  const state = await loadGuaranteeState(adminClient, profileId);
  if (!state) {
    return {
      ok: false,
      refundedCents: 0,
      refunds: [],
      message: "Profile not found.",
    };
  }

  const evaluation = evaluateGuarantee(state, now);
  if (!evaluation.refund.eligible) {
    return {
      ok: false,
      refundedCents: 0,
      refunds: [],
      message: `Not eligible: ${evaluation.refund.reasons.join(" ")}`,
    };
  }

  let remainingCents =
    evaluation.refund.maxRefundCents - evaluation.refund.refundedAtCents;
  if (remainingCents <= 0) {
    return {
      ok: false,
      refundedCents: 0,
      refunds: [],
      message: "Nothing left to refund.",
    };
  }

  const startedAtMs = evaluation.startedAt?.getTime() ?? 0;
  const expiresAtMs = evaluation.expiresAt?.getTime() ?? Infinity;

  const eligiblePayments = state.payments
    .filter(
      (p) =>
        (p.kind === "core_initial" || p.kind === "core_renewal") &&
        p.status !== "failed" &&
        p.paid_at !== null &&
        new Date(p.paid_at).getTime() >= startedAtMs &&
        new Date(p.paid_at).getTime() <= expiresAtMs &&
        p.stripe_charge_id !== null
    )
    .sort(
      (a, b) =>
        new Date(a.paid_at as string).getTime() -
        new Date(b.paid_at as string).getTime()
    );

  const refunds: RefundResult["refunds"] = [];

  for (const payment of eligiblePayments) {
    if (remainingCents <= 0) break;
    const alreadyRefunded = payment.refund_amount_cents ?? 0;
    const refundableOnThisCharge = payment.amount_cents - alreadyRefunded;
    if (refundableOnThisCharge <= 0) continue;

    const amountCents = Math.min(refundableOnThisCharge, remainingCents);

    const refund = await stripe.refunds.create(
      {
        charge: payment.stripe_charge_id as string,
        amount: amountCents,
        reason: "requested_by_customer",
        metadata: {
          unlocksaas_profile_id: profileId,
          unlocksaas_reason: reason ?? "60-day guarantee",
        },
      },
      {
        // Idempotency: same charge + same logical refund key.
        idempotencyKey: `guarantee-refund:${payment.stripe_charge_id}:${amountCents}`,
      }
    );

    refunds.push({
      chargeId: payment.stripe_charge_id as string,
      refundId: refund.id,
      amountCents,
    });

    // Update the local payment row optimistically. The charge.refunded webhook
    // will also fire and confirm via its own write — both writers converge on
    // the same refunded_at + refund_amount_cents values.
    await adminClient
      .from("billing_payments")
      .update({
        status: amountCents === payment.amount_cents ? "refunded" : "partial_refund",
        refunded_at: new Date().toISOString(),
        refund_amount_cents: alreadyRefunded + amountCents,
      })
      .eq("stripe_charge_id", payment.stripe_charge_id);

    remainingCents -= amountCents;
  }

  const totalRefunded = refunds.reduce((s, r) => s + r.amountCents, 0);

  if (totalRefunded === 0) {
    return {
      ok: false,
      refundedCents: 0,
      refunds: [],
      message: "No refundable charges found inside the window.",
    };
  }

  // Cancel the subscription at period end (the customer keeps access through
  // what they've paid for; we just stop the next charge).
  if (state.profile.stripe_subscription_id) {
    try {
      await stripe.subscriptions.update(state.profile.stripe_subscription_id, {
        cancel_at_period_end: true,
        metadata: { unlocksaas_refunded: "true" },
      });
    } catch (err) {
      // Non-fatal — the operator can cancel manually if needed.
      console.error("subscription cancel after refund failed:", err);
    }
  }

  await adminClient
    .from("profiles")
    .update({
      refunded_at: new Date().toISOString(),
      cancel_at_period_end: true,
    })
    .eq("id", profileId);

  return {
    ok: true,
    refundedCents: totalRefunded,
    refunds,
    message: `Refunded ${(totalRefunded / 100).toFixed(2)} ${state.profile.stripe_customer_id ? "" : ""}USD across ${refunds.length} charge${refunds.length === 1 ? "" : "s"}.`.trim(),
  };
}

// ── re-exports for UI components ──────────────────────────────────────────────

export function formatRefundAmount(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
