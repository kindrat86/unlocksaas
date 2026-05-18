/**
 * GET /api/guarantee/status
 *
 * Returns the 60-day guarantee evaluation for the signed-in user.
 *
 * Response shape: { evaluation: GuaranteeEvaluation } | { error: string }
 *
 * Auth: requires a Supabase session. Returns 401 if no session, 404 if the
 * user has no profile row yet (will exist after their first checkout).
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { evaluateGuarantee, loadGuaranteeState } from "@/lib/guarantee";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const startedAt = Date.now();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the profile owned by this auth user.
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile) {
      return NextResponse.json(
        {
          error:
            "No profile yet. The profile is created automatically on first checkout.",
        },
        { status: 404 }
      );
    }

    const state = await loadGuaranteeState(supabase, profile.id);
    if (!state) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const evaluation = evaluateGuarantee(state);

    console.log("[guarantee.status]", {
      profileId: profile.id,
      phase: evaluation.phase,
      daysRemaining: evaluation.daysRemaining,
      workCompleteCount: evaluation.workCompleteCount,
      workTotalCount: evaluation.workTotalCount,
      eligible: evaluation.refund.eligible,
      durationMs: Date.now() - startedAt,
    });

    return NextResponse.json({ evaluation });
  } catch (err) {
    console.error("[guarantee.status] handler error", {
      message: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - startedAt,
    });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
