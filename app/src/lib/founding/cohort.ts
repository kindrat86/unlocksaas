import {
  createAdminClient,
  hasSupabaseAdminConfig,
} from "@/lib/supabase/server";

/**
 * Founding-Cohort PLF — cap + window logic.
 *
 * Workbook 03 Script 8 (revised 2026-05-17). The cap is 50 seats. The window
 * is FOUNDING_CART_OPEN_AT → FOUNDING_CART_CLOSE_AT. The cap is enforced by:
 *
 *   1. Stripe webhook: count() check before INSERT into founding_cohort.
 *   2. Postgres: unique index on seat_number ensures the 51st insert fails
 *      cleanly even if the count check races.
 *   3. Frontend cohort meter: server-rendered count, 30s cache acceptable.
 *      The page may briefly show "49 of 50" while the 50th seat is being
 *      written. The webhook is the source of truth.
 *
 * No fake scarcity. The cap is structural. After cap or after window close,
 * the founding bonuses retire forever; the product continues evergreen at
 * the same $49/mo.
 */

export const FOUNDING_COHORT_CAP = 50;

/** Returns the current count of claimed seats. Service-role read. */
export async function seatsClaimed(): Promise<number> {
  if (!hasSupabaseAdminConfig()) return 0;

  const supabase = createAdminClient();
  // founding_cohort lives in migration 20260518000002 which is not yet
  // reflected in the generated database.types.ts. Cast to bypass strict
  // typing until the next `supabase gen types typescript` pass — same
  // pattern the webhook uses for billing_payments.
  const { count, error } = await (supabase as unknown as { from: (t: string) => any })
    .from("founding_cohort")
    .select("id", { count: "exact", head: true });
  if (error) {
    console.error("[founding-cohort] seatsClaimed_failed", error.message);
    // Fail closed: report a high count so the UI does not falsely advertise
    // seats. The Stripe webhook is still the authoritative cap.
    return FOUNDING_COHORT_CAP;
  }
  return count ?? 0;
}

export async function seatsRemaining(): Promise<number> {
  const claimed = await seatsClaimed();
  return Math.max(0, FOUNDING_COHORT_CAP - claimed);
}

export async function isCapReached(): Promise<boolean> {
  return (await seatsClaimed()) >= FOUNDING_COHORT_CAP;
}

/**
 * Reads the cart-open and cart-close timestamps from env. Both are ISO 8601
 * strings — set by the founder before launch. If either is missing, the cart
 * is considered closed (fail-safe pre-launch state).
 */
export interface CartWindow {
  openAt: Date | null;
  closeAt: Date | null;
  state: "pre_launch" | "open" | "closed";
}

export function cartWindow(now: Date = new Date()): CartWindow {
  const openRaw = process.env.FOUNDING_CART_OPEN_AT;
  const closeRaw = process.env.FOUNDING_CART_CLOSE_AT;
  const openAt = openRaw ? new Date(openRaw) : null;
  const closeAt = closeRaw ? new Date(closeRaw) : null;

  if (!openAt || Number.isNaN(openAt.getTime())) {
    return { openAt: null, closeAt: closeAt && !Number.isNaN(closeAt.getTime()) ? closeAt : null, state: "pre_launch" };
  }
  if (now < openAt) return { openAt, closeAt, state: "pre_launch" };
  if (closeAt && now >= closeAt) return { openAt, closeAt, state: "closed" };
  return { openAt, closeAt, state: "open" };
}

/**
 * The full open-or-closed decision: cart must be in the open window AND the
 * cap must not be reached. Used by the launch page CTA, the Stripe webhook
 * founding-bonus grant, and the API gate.
 */
export async function isCartOpen(now: Date = new Date()): Promise<boolean> {
  if (cartWindow(now).state !== "open") return false;
  return !(await isCapReached());
}

/**
 * Computes the next seat number to assign. Caller MUST hold the DB
 * transaction or rely on the unique index to fail the duplicate write.
 *
 * This is intentionally not race-safe on its own — it is the OPTIMISTIC
 * read used by the webhook to determine whether to grant founding bonuses
 * before the INSERT. The INSERT itself relies on the unique constraint to
 * fail the second of any two concurrent 50th claims.
 */
export async function nextSeatNumber(): Promise<number> {
  if (!hasSupabaseAdminConfig()) {
    throw new Error("founding_cohort_read_failed: missing Supabase admin env");
  }

  const supabase = createAdminClient();
  const { data, error } = await (supabase as unknown as { from: (t: string) => any })
    .from("founding_cohort")
    .select("seat_number")
    .order("seat_number", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error("[founding-cohort] nextSeatNumber_failed", error.message);
    throw new Error(`founding_cohort_read_failed: ${error.message}`);
  }
  const current = data?.seat_number ?? 0;
  return current + 1;
}
