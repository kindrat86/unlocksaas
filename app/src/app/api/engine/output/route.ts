/**
 * GET /api/engine/output?stepId=1
 *
 * Returns the saved deliverable for the signed-in user's project at the given
 * Playbook step. Used by the step page on mount so that a user who closes the
 * tab after completing Step 1 (Dream Customer) returns to a hydrated completion
 * view — not a blank "start over" screen.
 *
 * This is the Brunson Results-in-Advance guarantee, mechanically enforced:
 * a deliverable that disappears when the user closes a tab is not a deliverable.
 *
 * 401 — no signed-in user (the step page falls back to localStorage for
 *       anonymous flows; the response is structured so the client can detect
 *       this cleanly and not error-toast).
 * 400 — stepId missing or not one of "1".."5".
 * 200 — { stepId, output: { assembled_at, output_text } | null }.
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import {
  getProjectIdForUser,
  isEngineStepId,
  loadStepOutput,
} from "@/lib/step-outputs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const startedAt = Date.now();
  const stepId = req.nextUrl.searchParams.get("stepId");

  if (!stepId || !isEngineStepId(stepId)) {
    return NextResponse.json(
      { error: "stepId must be one of 1, 2, 3, 4, 5." },
      { status: 400 }
    );
  }

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // 200 with output: null so the client renders a clean "start" state
      // rather than an error toast. The actual signed-in-or-not check is
      // the step page's concern.
      return NextResponse.json({ stepId, output: null, anonymous: true });
    }

    const admin = createAdminClient();
    const projectId = await getProjectIdForUser(admin, user.id);
    if (!projectId) {
      return NextResponse.json({ stepId, output: null });
    }

    // Use the admin client for the read so unconfigured RLS on a fresh
    // project does not 500 the call. The endpoint already gates on
    // auth.getUser() above.
    const output = await loadStepOutput(admin, projectId, stepId);
    return NextResponse.json({ stepId, output });
  } catch (err) {
    console.error("[engine/output] handler error", {
      stepId,
      durationMs: Date.now() - startedAt,
      message: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Could not load saved deliverable. Try again." },
      { status: 500 }
    );
  }
}
