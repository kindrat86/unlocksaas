import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getAllFunnelTargets } from "@/lib/teardown-courtesy/targets";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

/**
 * Operator-triggered seeder: POST /api/teardown-courtesy/seed
 *
 * Idempotently upserts one teardown_courtesy_targets row per funnel-
 * teardown catalog entry. Re-runnable safely – the unique (catalog, slug)
 * index plus an ON CONFLICT DO NOTHING posture means existing rows are
 * left alone (operator may have already populated contact_email).
 *
 * After seeding, the operator manually:
 *   1. Reviews the queue in Supabase Studio (table editor).
 *   2. For each row they want to send, finds the founder's email from
 *      their public site / Twitter DMs / AngelList / etc.
 *   3. Updates contact_email + reviews the parsed greeting (overrides
 *      via the `greeting` column if the parse looks off).
 *   4. Sets status = 'approved' and approved_at = now().
 *   5. The next weekday at 13:00 UTC, the cron picks up the oldest
 *      approved row and sends.
 *
 * Auth: this route requires the CRON_SECRET bearer token, same as the
 * cron itself. Operator runs it with:
 *   curl -X POST https://unlocksaas.com/api/teardown-courtesy/seed \
 *        -H "Authorization: Bearer $CRON_SECRET"
 *
 * Brunson Hard-Rule reconciliation:
 *   - Seeder NEVER populates contact_email. Every email address must be
 *     human-curated and human-verified before any send can happen.
 *   - Seeder NEVER sets status='approved' or approved_at. The operator
 *     is the sole approval gate.
 *   - On re-seed, existing rows are left untouched (their state machine
 *     state, their populated email, their notes – all preserved).
 */
export async function POST(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  const provided = req.headers.get("authorization");
  if (expected && provided !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const targets = getAllFunnelTargets();

  // Build the upsert payload. Status defaults to 'pending'. contact_email
  // and approved_at deliberately left null – operator owns those.
  const rows = targets.map((t) => ({
    catalog: t.catalog,
    slug: t.slug,
    display_name: t.displayName,
    homepage_url: t.homepageUrl ?? null,
    greeting: t.greeting, // parsed; operator can override later
    contact_email: null,
    status: "pending" as const,
    approved_at: null,
    sent_at: null,
    resend_id: null,
    notes: null,
  }));

  // upsert with onConflict=(catalog, slug) preserves existing rows. We
  // pass `ignoreDuplicates: true` so an existing row's columns are NOT
  // overwritten – the operator's hand-curated email + greeting overrides
  // survive a reseed.
  // `as never` mirrors the challenge_subscribers pattern: rows have a
  // catalog-correct typed shape, but the Supabase client is generic over
  // the (not-yet-regenerated) database.types Tables map and TypeScript
  // cannot prove the shape matches a `never`-typed table. Trusted insert.
  const { error: upsertError, count } = await supabase
    .from("teardown_courtesy_targets" as never)
    .upsert(rows as never, {
      onConflict: "catalog,slug",
      ignoreDuplicates: true,
      count: "exact",
    });

  if (upsertError) {
    console.error("[teardown-courtesy-seed] upsert_failed", upsertError);
    return NextResponse.json(
      { error: "upsert_failed", detail: upsertError.message },
      { status: 500 },
    );
  }

  // Summary: how many catalog entries are in the queue, how many lack a
  // parsed greeting (need operator attention), how many are still
  // pending vs approved.
  const { data: statusBreakdown } = await supabase
    .from("teardown_courtesy_targets" as never)
    .select("status, greeting, contact_email")
    .eq("catalog", "funnel-teardown");

  const breakdown = {
    total: statusBreakdown?.length ?? 0,
    missing_greeting:
      statusBreakdown?.filter(
        (r: { greeting: string | null }) => !r.greeting,
      ).length ?? 0,
    missing_email:
      statusBreakdown?.filter(
        (r: { contact_email: string | null }) => !r.contact_email,
      ).length ?? 0,
    by_status: (statusBreakdown ?? []).reduce(
      (acc: Record<string, number>, row: { status: string }) => {
        acc[row.status] = (acc[row.status] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
  };

  return NextResponse.json({
    ok: true,
    inserted_or_skipped: count ?? rows.length,
    catalog_size: targets.length,
    breakdown,
  });
}
