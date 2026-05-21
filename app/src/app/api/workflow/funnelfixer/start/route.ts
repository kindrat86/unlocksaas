import { NextRequest, NextResponse } from "next/server";
import { start } from "@/lib/workflow-stub";
import { funnelfixerReengagementWorkflow } from "@/lib/workflows/funnelfixer-reengagement";

/**
 * POST /api/workflow/funnelfixer/start
 *
 * Start a FunnelFixer reengagement workflow for a single subscriber.
 * Internal use only – called from backfill endpoint or during subscriber activation.
 *
 * Request body:
 *   { subscriberId: string }
 *
 * Response:
 *   { ok: true, workflowRunId: string }
 *   { ok: false, error: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subscriberId } = body as { subscriberId?: string };

    if (!subscriberId || typeof subscriberId !== "string") {
      return NextResponse.json(
        { ok: false, error: "subscriberId is required" },
        { status: 400 }
      );
    }

    // Start the workflow. This returns a run ID that can be used to track
    // the workflow execution in the Workflow SDK observability dashboard.
    const run = await start(funnelfixerReengagementWorkflow, [subscriberId]);

    console.log("[workflow] funnelfixer-reengagement started", {
      subscriberId,
      runId: run.runId,
    });

    return NextResponse.json({
      ok: true,
      workflowRunId: run.runId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[workflow] funnelfixer start error:", { message });
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
