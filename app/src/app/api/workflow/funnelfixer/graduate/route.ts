import { NextRequest, NextResponse } from "next/server";
import { resumeHook } from "@/lib/workflow-stub";

/**
 * POST /api/workflow/funnelfixer/graduate
 *
 * Resume the funnelfixer-converted hook to signal workflow early exit.
 * Called from Stripe webhook when a FunnelFixer subscriber completes a checkout.
 *
 * This allows the reengagement workflow to exit early (skip the grace period +
 * testimonial offer) when the subscriber converts to a paying customer.
 *
 * Request body:
 *   { subscriberId: string, convertedAt?: string }
 *
 * Response:
 *   { ok: true }
 *   { ok: false, error: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subscriberId, convertedAt } = body as {
      subscriberId?: string;
      convertedAt?: string;
    };

    if (!subscriberId || typeof subscriberId !== "string") {
      return NextResponse.json(
        { ok: false, error: "subscriberId is required" },
        { status: 400 }
      );
    }

    // Resume the converted hook with the subscriber ID and timestamp.
    // The token format must match what the workflow creates:
    // `funnelfixer-converted:{subscriberId}`
    const token = `funnelfixer-converted:${subscriberId}`;
    const payload = {
      converted_at: convertedAt ?? new Date().toISOString(),
    };

    await resumeHook(token, payload);

    console.log("[workflow] funnelfixer-converted hook resumed", {
      subscriberId,
      token,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    // Resuming a hook that doesn't exist or has already been resumed is
    // not an error we should surface — it just means the workflow isn't
    // waiting on that hook. Log and return ok.
    const message = error instanceof Error ? error.message : "Unknown error";
    console.warn("[workflow] funnelfixer-graduate hook error:", { message });

    // Return success anyway — we don't want to fail the Stripe webhook
    // if the hook isn't active.
    return NextResponse.json({ ok: true });
  }
}
