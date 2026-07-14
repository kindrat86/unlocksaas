import {
  createAdminClient,
  hasSupabaseAdminConfig,
} from "@/lib/supabase/server";

/**
 * Canonical founding-cohort size. The founding rate is $49/mo locked for
 * life for the first 100 builders; after builder #100 the standard price
 * becomes $79/mo. This is the ONLY urgency mechanic on the site.
 *
 * NOTE: src/lib/founding/cohort.ts still exports FOUNDING_COHORT_CAP = 50
 * for the webhook-side enforcement. That module is owned by the funnel
 * plumbing and needs a matching bump to 100 — tracked separately. The
 * visitor-facing copy on this page follows the canonical story.
 */
export const FOUNDING_COHORT_SIZE = 100;

/**
 * Live seat count, or null when the count is unavailable.
 *
 * Unlike lib/founding/cohort.ts `seatsClaimed()` (which fails CLOSED and
 * returns the cap so the API never over-grants), this page-side read fails
 * to null: when Supabase is unconfigured or errors, the page shows
 * "Founding cohort: open" with no number. We never render a fabricated
 * count — honesty is the brand's core differentiator, and a made-up
 * "50 of 50 claimed" is exactly the kind of claim this site exists to
 * never make.
 */
export async function seatsClaimedOrNull(): Promise<number | null> {
  if (!hasSupabaseAdminConfig()) return null;

  const supabase = createAdminClient();
  // founding_cohort is not yet in the generated database.types.ts — same
  // cast-to-bypass pattern as lib/founding/cohort.ts.
  const { count, error } = await (
    supabase as unknown as { from: (t: string) => any }
  )
    .from("founding_cohort")
    .select("id", { count: "exact", head: true });
  if (error) {
    console.error("[founding-page] seat_count_unavailable", error.message);
    return null;
  }
  return count ?? 0;
}
