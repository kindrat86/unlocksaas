/**
 * A/B test plumbing for the locked-but-still-tunable identity label.
 *
 * Workbook 05 (Creating Your Movement) and Hard Rule #10 of the build prompt
 * mandate an A/B test on the collective identity name: "Verified Builders"
 * (current ship) vs. "Paid Builders" (the polar alternative). The winner is
 * whichever variant produces the higher starter_purchase + core_purchase rate
 * per exposure.
 *
 * Variant assignment is sticky per-browser:
 *   - usaas_ab_identity cookie holds the variant string ("verified_builder" |
 *     "paid_builder"), assigned 50/50 on the first request in the root
 *     middleware (src/middleware.ts).
 *   - usaas_ab_subject cookie holds a stable UUID per browser, used as the
 *     subject_id in public.ab_tests so we can count distinct visitors per
 *     variant.
 *
 * Server reads use readIdentityFromCookies() and readSubjectFromCookies().
 * Writes happen only in middleware (sticky cookies) and via /api/ab/event
 * (event log rows).
 */

import { cookies } from "next/headers";

export const IDENTITY_AB_KEY = "identity_label";
export const IDENTITY_COOKIE = "usaas_ab_identity";
export const SUBJECT_COOKIE = "usaas_ab_subject";
export const AB_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export type IdentityVariant = "verified_builder" | "paid_builder";

const VALID_VARIANTS: ReadonlySet<string> = new Set([
  "verified_builder",
  "paid_builder",
]);

/**
 * The actual copy. Two surfaces today:
 *   - plural: the collective identity on the homepage manifesto title and any
 *     "we are X" sentence ("Verified Builders" vs "Paid Builders").
 *   - singular: the individual badge name and any "you are an X" sentence
 *     ("Verified Builder" vs "Paid Builder").
 *
 * Both phrasings must read clean as either variant — copy was reviewed against
 * workbook 05 Section 7 (manifesto) and Section 8 (milestones).
 */
export const IDENTITY_LABELS: Record<
  IdentityVariant,
  {
    plural: string;
    singular: string;
    manifestoTitle: string;
  }
> = {
  verified_builder: {
    plural: "Verified Builders",
    singular: "Verified Builder",
    manifestoTitle: "We Are Verified Builders",
  },
  paid_builder: {
    plural: "Paid Builders",
    singular: "Paid Builder",
    manifestoTitle: "We Are Paid Builders",
  },
};

/**
 * Read the variant from cookies. Defaults to verified_builder when missing —
 * matches the originally shipped copy, so SSR before the middleware writes
 * the cookie looks identical to the verified variant rather than flashing.
 *
 * Server-only (uses next/headers cookies()).
 */
export function readIdentityFromCookies(): IdentityVariant {
  const raw = cookies().get(IDENTITY_COOKIE)?.value;
  return raw && VALID_VARIANTS.has(raw)
    ? (raw as IdentityVariant)
    : "verified_builder";
}

export function readSubjectFromCookies(): string | null {
  return cookies().get(SUBJECT_COOKIE)?.value ?? null;
}

/**
 * 50/50 split. Called from middleware on first request only.
 */
export function pickIdentityVariant(): IdentityVariant {
  return Math.random() < 0.5 ? "verified_builder" : "paid_builder";
}

export function pickSubjectId(): string {
  return crypto.randomUUID();
}

export function getIdentityLabels(variant: IdentityVariant) {
  return IDENTITY_LABELS[variant];
}

/**
 * Normalize a raw cookie value into a IdentityVariant or null. Used by code
 * paths (Stripe webhook) that read variant from arbitrary external input.
 */
export function parseIdentityVariant(
  raw: string | null | undefined
): IdentityVariant | null {
  if (raw && VALID_VARIANTS.has(raw)) return raw as IdentityVariant;
  return null;
}
