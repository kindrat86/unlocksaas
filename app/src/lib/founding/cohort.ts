import {
  createAdminClient,
  hasSupabaseAdminConfig,
} from "@/lib/supabase/server";

/**
 * Founding-Cohort PLF — cap + window logic.
 *
 * The cap is 100 seats. The window
 * is FOUNDING_CART_OPEN_AT → FOUNDING_CART_CLOSE_AT. The cap is enforced by:
 *
 *   1. Stripe webhook: count() check before INSERT into founding_cohort.
 *   2. Storage: unique seat numbers ensure duplicate assignments fail
 *      cleanly even if the count check races.
 *   3. Frontend cohort meter: server-rendered count, 30s cache acceptable.
 *      The page may briefly show "99 of 100" while the 100th seat is being
 *      written. The webhook is the source of truth.
 *
 * No fake scarcity. The cap is structural. After cap or after window close,
 * the founding bonuses retire forever; the product continues evergreen at
 * the same $49/mo.
 */

export const FOUNDING_COHORT_CAP = 100;

/** Returns the current count, or null when durable storage is unavailable. */
export async function seatsClaimedOrNull(): Promise<number | null> {
  if (!hasSupabaseAdminConfig()) return null;

  const admin = createAdminClient();
  const { count, error } = await (admin as unknown as { from: (t: string) => any })
    .from("founding_cohort")
    .select("id", { count: "exact", head: true });
  if (error) {
    console.error("[founding-cohort] seatsClaimed_failed", error.message);
    return null;
  }
  return count ?? 0;
}

/** Numeric compatibility helper. Unavailable storage fails closed at the cap. */
export async function seatsClaimed(): Promise<number> {
  return (await seatsClaimedOrNull()) ?? FOUNDING_COHORT_CAP;
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

  if (!openAt || !closeAt) {
    return {
      openAt,
      closeAt,
      state: openAt ? "closed" : "pre_launch",
    };
  }
  if (
    Number.isNaN(openAt.getTime()) ||
    Number.isNaN(closeAt.getTime()) ||
    closeAt <= openAt
  ) {
    return { openAt, closeAt, state: "closed" };
  }
  if (now < openAt) return { openAt, closeAt, state: "pre_launch" };
  if (now >= closeAt) return { openAt, closeAt, state: "closed" };
  return { openAt, closeAt, state: "open" };
}

export interface FoundingCartStatus {
  window: CartWindow;
  claimed: number | null;
  open: boolean;
}

/** Shared server-side decision used by both the page and checkout route. */
export async function foundingCartStatus(
  now: Date = new Date(),
): Promise<FoundingCartStatus> {
  const window = cartWindow(now);
  const claimed = await seatsClaimedOrNull();
  return {
    window,
    claimed,
    open:
      window.state === "open" &&
      claimed !== null &&
      claimed < FOUNDING_COHORT_CAP,
  };
}

/**
 * The full open-or-closed decision: cart must be in the open window AND the
 * cap must not be reached. Used by the launch page CTA, the Stripe webhook
 * founding-bonus grant, and the API gate.
 */
export async function isCartOpen(now: Date = new Date()): Promise<boolean> {
  return (await foundingCartStatus(now)).open;
}

/**
 * Computes the next seat number to assign. Caller MUST hold the DB
 * transaction or rely on the unique index to fail the duplicate write.
 *
 * This is intentionally not race-safe on its own — it is the OPTIMISTIC
 * read used by the webhook to determine whether to grant founding bonuses
 * before the INSERT. The INSERT itself relies on the unique constraint to
 * fail the second of any two concurrent 100th claims.
 */
export async function nextSeatNumber(): Promise<number> {
  if (!hasSupabaseAdminConfig()) {
    throw new Error("founding_cohort_read_failed: durable storage unavailable");
  }

  const admin = createAdminClient();
  const { data, error } = await (admin as unknown as { from: (t: string) => any })
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
