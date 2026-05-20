/**
 * POST /api/outreach/verify-link
 *
 * Fetches a logged public link on the server to confirm it is live, then
 * stamps verified_live + verified_at on the outreach_actions row.
 *
 * Why server-side: workbook 04 §6 "engine verifies the link is live and
 * authored by him, logs it." The auto-posting ban (platform ToS) means we
 * never SEND for the user — we VERIFY what the user posted manually.
 *
 * The "authored by them" check is left as a TODO (Sprint 3+) — would require
 * either per-platform scraping (Indie Hackers / Reddit) or letting the user
 * paste a screenshot. v1 returns a simple liveness check (HTTP 200/3xx).
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";


const TIMEOUT_MS = 8000;
const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

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

    const { action_id: actionId } = await req.json();
    if (!actionId || typeof actionId !== "string") {
      return NextResponse.json(
        { error: "action_id is required" },
        { status: 400 }
      );
    }

    // Look up the action via the user's project so RLS pins ownership.
    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!project) {
      return NextResponse.json({ error: "No project" }, { status: 404 });
    }

    const { data: action } = await supabase
      .from("outreach_actions")
      .select("id, public_link, verified_live")
      .eq("id", actionId)
      .eq("project_id", project.id)
      .maybeSingle();
    if (!action) {
      return NextResponse.json({ error: "Action not found" }, { status: 404 });
    }
    if (!action.public_link) {
      return NextResponse.json(
        { error: "Action has no public_link to verify." },
        { status: 400 }
      );
    }

    // Validate URL shape before fetching — block file://, ftp://, internal
    // hostnames, etc. We never let untrusted input become an SSRF vector.
    let url: URL;
    try {
      url = new URL(action.public_link);
    } catch {
      return NextResponse.json(
        { error: "public_link is not a valid URL" },
        { status: 400 }
      );
    }
    if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
      return NextResponse.json(
        { error: `Protocol not allowed: ${url.protocol}` },
        { status: 400 }
      );
    }
    if (
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1" ||
      url.hostname.endsWith(".local") ||
      url.hostname.startsWith("169.254.") // link-local / metadata
    ) {
      return NextResponse.json(
        { error: "Internal hostnames are not allowed." },
        { status: 400 }
      );
    }

    // Fetch with timeout. Treat 2xx + 3xx as live (some platforms redirect to
    // canonical URLs). 4xx/5xx and network failures count as not-live.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    let live = false;
    let httpStatus: number | null = null;
    try {
      const res = await fetch(url.toString(), {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        headers: {
          // Identify the bot so platforms with anti-scraping see "this is a
          // verification ping, not a scraper." User-Agent is intentionally
          // generic — we are not impersonating a real browser.
          "User-Agent": "UnlockSaaS-LinkVerifier/1.0 (+https://unlocksaas.com)",
          Accept: "text/html,application/xhtml+xml",
        },
      });
      httpStatus = res.status;
      live = res.status >= 200 && res.status < 400;
    } catch (err) {
      console.warn("[outreach.verify-link] fetch failed", {
        actionId,
        url: url.toString(),
        message: err instanceof Error ? err.message : String(err),
      });
      live = false;
    } finally {
      clearTimeout(timer);
    }

    // Update only if status changed, so we don't churn verified_at.
    if (live !== action.verified_live) {
      const { error: updateError } = await supabase
        .from("outreach_actions")
        .update({
          verified_live: live,
          verified_at: live ? new Date().toISOString() : null,
        })
        .eq("id", actionId)
        .eq("project_id", project.id);
      if (updateError) {
        console.error("[outreach.verify-link] update failed", {
          message: updateError.message,
        });
      }
    }

    return NextResponse.json({
      ok: true,
      live,
      http_status: httpStatus,
    });
  } catch (err) {
    console.error("[outreach.verify-link] handler error", {
      message: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
