/**
 * GET  /api/outreach        list the signed-in user's logged outreach actions
 * POST /api/outreach        log a new outreach action
 *
 * The 20-action threshold for Hard Rule #4 (playbook-verifiable 60-day
 * guarantee) is enforced here: when the user's logged count crosses 20, we
 * fire the TWENTY_OUTREACH_ACTIONS_LOGGED milestone on their profile via the
 * guarantee module.
 *
 * Schema: supabase/migrations/20260516224148_0002_dream_100_outreach_stripe_conversions.sql
 *   outreach_actions key: project_id (one project per user).
 *   milestones key:        profile_id (one profile per user, post-checkout).
 *
 * Channels (workbook 04 §6): email | indie_hackers | reddit | twitter_x |
 * lovable_discord | other.
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { MILESTONE_KEYS, markMilestone } from "@/lib/guarantee";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TWENTY = 20;
const ALLOWED_CHANNELS = [
  "email",
  "indie_hackers",
  "reddit",
  "twitter_x",
  "lovable_discord",
  "other",
] as const;
type Channel = (typeof ALLOWED_CHANNELS)[number];

export async function GET() {
  const supabase = await createClient();
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!project) {
      return NextResponse.json({ actions: [], count: 0, threshold: TWENTY });
    }

    const { data: actions, error } = await supabase
      .from("outreach_actions")
      .select(
        "id,channel,target_id,message_sent,public_link,verified_live,response_received,converted,sent_at,verified_at"
      )
      .eq("project_id", project.id)
      .order("sent_at", { ascending: false });

    if (error) {
      console.error("[outreach.GET] query failed", { message: error.message });
      return NextResponse.json({ error: "Query failed" }, { status: 500 });
    }

    return NextResponse.json({
      actions: actions ?? [],
      count: actions?.length ?? 0,
      threshold: TWENTY,
    });
  } catch (err) {
    console.error("[outreach.GET] handler error", {
      message: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const channel = body.channel as Channel | undefined;
    const messageSent = (body.message_sent ?? "").toString().trim();
    const publicLink = body.public_link
      ? String(body.public_link).trim()
      : null;
    const targetId = body.target_id ? String(body.target_id) : null;

    if (!channel || !ALLOWED_CHANNELS.includes(channel)) {
      return NextResponse.json(
        { error: `channel must be one of: ${ALLOWED_CHANNELS.join(", ")}` },
        { status: 400 }
      );
    }
    if (!messageSent) {
      return NextResponse.json(
        { error: "message_sent is required" },
        { status: 400 }
      );
    }
    // Non-email channels (Indie Hackers, Reddit, X, Lovable Discord, other)
    // require a public link per workbook 04 §6 "verify the link is live."
    if (channel !== "email" && !publicLink) {
      return NextResponse.json(
        {
          error:
            "public_link is required for non-email channels (workbook 04 §6).",
        },
        { status: 400 }
      );
    }

    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!project) {
      return NextResponse.json(
        {
          error:
            "No project yet. The project row is created on first checkout.",
        },
        { status: 404 }
      );
    }

    const { data: inserted, error: insertError } = await supabase
      .from("outreach_actions")
      .insert({
        project_id: project.id,
        channel,
        target_id: targetId,
        message_sent: messageSent,
        public_link: publicLink,
      })
      .select(
        "id,channel,target_id,message_sent,public_link,verified_live,response_received,converted,sent_at,verified_at"
      )
      .single();

    if (insertError || !inserted) {
      console.error("[outreach.POST] insert failed", {
        message: insertError?.message,
      });
      return NextResponse.json(
        { error: "Insert failed" },
        { status: 500 }
      );
    }

    // Count post-insert. If we just crossed the 20-action threshold, fire
    // the milestone on the user's profile. Idempotent (the unique index on
    // (profile_id, key) prevents duplicates).
    const { count } = await supabase
      .from("outreach_actions")
      .select("*", { count: "exact", head: true })
      .eq("project_id", project.id);

    let milestoneFired = false;
    if ((count ?? 0) >= TWENTY) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (profile) {
        try {
          const admin = createAdminClient();
          const result = await markMilestone(
            admin,
            profile.id,
            MILESTONE_KEYS.TWENTY_OUTREACH_ACTIONS_LOGGED,
            "engine",
            { action_count: count }
          );
          milestoneFired = result.inserted;
          if (result.inserted) {
            console.log("[outreach.POST] milestone fired", {
              profileId: profile.id,
              count,
            });
          }
        } catch (err) {
          // Non-fatal — the action was logged; the milestone can be repaired
          // by the operator if needed.
          console.warn("[outreach.POST] markMilestone failed", {
            message: err instanceof Error ? err.message : String(err),
          });
        }
      }
    }

    return NextResponse.json({
      action: inserted,
      count: count ?? 0,
      threshold: TWENTY,
      milestoneFired,
    });
  } catch (err) {
    console.error("[outreach.POST] handler error", {
      message: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
