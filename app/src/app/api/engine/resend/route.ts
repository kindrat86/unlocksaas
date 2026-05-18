/**
 * POST /api/engine/resend
 * Body: { stepId: "1".."5" }
 *
 * Re-sends the assembled step deliverable to the signed-in user's email.
 * Reads from project_state (the canonical source), not from the client's
 * cached output, so the email always reflects what the user actually
 * locked in. If no deliverable is saved for this step, returns 404.
 *
 * The Brunson Results-in-Advance rule: the user should be able to claim
 * their inbox copy of "Your Dream Customer" or "Your Offer" at any time
 * from any device. The original send happens automatically on assembly;
 * this route exists for the founder who deleted the email by accident or
 * is opening the Playbook on a new laptop.
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import {
  getProjectIdForUser,
  isEngineStepId,
  loadStepOutput,
} from "@/lib/step-outputs";
import { sendStepDeliverableEmail } from "@/lib/deliverable-email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const startedAt = Date.now();
  let stepId: string | undefined;

  try {
    const body = (await req.json().catch(() => ({}))) as { stepId?: string };
    stepId = body.stepId;

    if (!stepId || !isEngineStepId(stepId)) {
      return NextResponse.json(
        { error: "stepId must be one of 1, 2, 3, 4, 5." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Sign in to email yourself a copy." },
        { status: 401 }
      );
    }

    const admin = createAdminClient();
    const projectId = await getProjectIdForUser(admin, user.id);
    if (!projectId) {
      return NextResponse.json(
        { error: "No project found — complete the step first." },
        { status: 404 }
      );
    }

    const record = await loadStepOutput(admin, projectId, stepId);
    if (!record?.output_text) {
      return NextResponse.json(
        {
          error:
            "No saved deliverable for this step yet. Finish the step questions and the engine will assemble + email it.",
        },
        { status: 404 }
      );
    }

    const { data: profile } = await admin
      .from("profiles")
      .select("email,builder_name")
      .eq("user_id", user.id)
      .maybeSingle();

    const recipientEmail = profile?.email ?? user.email ?? null;
    if (!recipientEmail) {
      return NextResponse.json(
        { error: "No email on file to send to." },
        { status: 400 }
      );
    }

    const sent = await sendStepDeliverableEmail({
      to: recipientEmail,
      firstName: profile?.builder_name ?? null,
      stepId,
      outputText: record.output_text,
    });

    if (!sent) {
      return NextResponse.json(
        { error: "Email send failed. Try again in a moment." },
        { status: 502 }
      );
    }

    console.log("[engine/resend] sent", {
      stepId,
      to: recipientEmail,
      durationMs: Date.now() - startedAt,
    });

    return NextResponse.json({ ok: true, to: recipientEmail });
  } catch (err) {
    console.error("[engine/resend] handler error", {
      stepId,
      durationMs: Date.now() - startedAt,
      message: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Could not resend. Try again." },
      { status: 500 }
    );
  }
}
