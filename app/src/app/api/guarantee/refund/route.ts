/**
 * POST /api/guarantee/refund
 *
 * Customer self-service refund endpoint for the 60-day guarantee.
 *
 * Flow:
 *   1. Verify Supabase session.
 *   2. Resolve the profile owned by this user.
 *   3. Re-evaluate the guarantee on the server (never trust client claims).
 *   4. If eligible, call lib/guarantee.issueRefund — which is itself
 *      idempotent (Stripe idempotency key + DB upserts).
 *   5. Return the verdict + any refunds created.
 *
 * Auth: requires a Supabase session. Returns 401/403/409 as appropriate.
 *
 * The Reluctant Hero voice for the messages stays in the UI layer; this
 * endpoint returns structured data.
 */
import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import {
  evaluateGuarantee,
  issueRefund,
  loadGuaranteeState,
} from "@/lib/guarantee";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const startedAt = Date.now();
  const supabase = createClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.warn("[guarantee.refund] unauthorized request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile) {
      console.warn("[guarantee.refund] no profile", { userId: user.id });
      return NextResponse.json({ error: "No profile" }, { status: 404 });
    }

    // Optional reason from the client. The customer is encouraged to provide
    // one — we store it on the Stripe refund metadata for the audit trail.
    let reason: string | undefined;
    try {
      const body = await req.json();
      if (body && typeof body.reason === "string") {
        reason = body.reason.slice(0, 500);
      }
    } catch {
      // No body is fine.
    }

    // Re-evaluate with the admin client so we read every row regardless of RLS.
    const admin = createAdminClient();
    const state = await loadGuaranteeState(admin, profile.id);
    if (!state) {
      console.error("[guarantee.refund] profile vanished mid-request", {
        profileId: profile.id,
      });
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const evaluation = evaluateGuarantee(state);

    console.log("[guarantee.refund] eligibility check", {
      profileId: profile.id,
      userId: user.id,
      phase: evaluation.phase,
      eligible: evaluation.refund.eligible,
      maxRefundCents: evaluation.refund.maxRefundCents,
      refundedAtCents: evaluation.refund.refundedAtCents,
      reason,
    });

    if (!evaluation.refund.eligible) {
      return NextResponse.json(
        {
          error: "Not eligible",
          evaluation,
        },
        { status: 409 }
      );
    }

    const result = await issueRefund({
      adminClient: admin,
      stripe: getStripe(),
      profileId: profile.id,
      reason,
    });

    // Audit log: a refund actually moved money. Log every result, ok or not.
    console.log("[guarantee.refund] issueRefund result", {
      profileId: profile.id,
      userId: user.id,
      ok: result.ok,
      refundedCents: result.refundedCents,
      refundCount: result.refunds.length,
      refundIds: result.refunds.map((r) => r.refundId),
      message: result.message,
      durationMs: Date.now() - startedAt,
    });

    // Re-evaluate so the client sees the post-refund verdict (phase: refunded).
    const stateAfter = await loadGuaranteeState(admin, profile.id);
    const evaluationAfter = stateAfter
      ? evaluateGuarantee(stateAfter)
      : evaluation;

    return NextResponse.json({
      result,
      evaluation: evaluationAfter,
    });
  } catch (err) {
    console.error("[guarantee.refund] handler error", {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      durationMs: Date.now() - startedAt,
    });
    return NextResponse.json(
      { error: "Refund handler failed; no money moved" },
      { status: 500 }
    );
  }
}
