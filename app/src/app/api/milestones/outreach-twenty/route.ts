/**
 * POST /api/milestones/outreach-twenty
 *
 * Idempotently fires the `twenty_outreach_actions_logged` milestone for the
 * signed-in user. Called by the OutreachLog client component when its local
 * counter reaches 20.
 *
 * Auth: requires Supabase session.
 *
 * Trust model: v1 stores outreach actions in localStorage, so the server
 * can't verify the 20 count itself. The client says "I hit 20" and we
 * record the milestone. Sprint 3 moves the action log to Supabase and
 * the server verifies count from outreach_actions table directly.
 */
import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { MILESTONE_KEYS, markMilestone } from "@/lib/guarantee";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const startedAt = Date.now();

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile) {
      return NextResponse.json({ error: "No profile" }, { status: 404 });
    }

    const admin = createAdminClient();
    const result = await markMilestone(
      admin,
      profile.id,
      MILESTONE_KEYS.TWENTY_OUTREACH_ACTIONS_LOGGED,
      "engine",
      { triggeredBy: "client.outreach-log.localStorage" }
    );

    console.log("[milestones.outreach-twenty]", {
      profileId: profile.id,
      inserted: result.inserted,
      durationMs: Date.now() - startedAt,
    });

    return NextResponse.json({ ok: true, inserted: result.inserted });
  } catch (err) {
    console.error("[milestones.outreach-twenty] handler error", {
      message: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - startedAt,
    });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
