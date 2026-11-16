/**
 * Buyer-facing copy for a failed POST /api/checkout.
 *
 * The route already returns a specific code when the founding cart gate
 * closes (409 founding_cart_closed) and a generic error for Stripe and
 * validation failures. This maps those responses to one short sentence.
 * It does not decide whether checkout is open.
 */
export const FOUNDING_COHORT_CLOSED_MESSAGE =
  "The founding cohort is full or closed.";

export const CHECKOUT_COULD_NOT_START_MESSAGE =
  "Checkout couldn't start. Try again or contact support.";

export function buyerCheckoutErrorMessage(input: {
  status?: number;
  error?: string | null;
}): string {
  if (input.status === 409 || input.error === "founding_cart_closed") {
    return FOUNDING_COHORT_CLOSED_MESSAGE;
  }
  return CHECKOUT_COULD_NOT_START_MESSAGE;
}
