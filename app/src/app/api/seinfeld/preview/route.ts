/**
 * GET /api/seinfeld/preview
 *
 * Operator endpoint. Two query modes:
 *
 *   ?email=foo@bar.com&n=5     → next 5 sends for this subscriber (looks up
 *                                 row, reads sends_count, walks the picker
 *                                 forward).
 *   ?index=12&n=5              → next 5 items starting at rotation index 12
 *                                 (no subscriber lookup; useful for cold
 *                                 inspection of "what would send #12 be?").
 *
 * Auth: requires `Authorization: Bearer <CRON_SECRET>`. We reuse the cron
 * secret rather than introducing a second admin secret. The endpoint reads
 * subscriber data and content; both are operator-only by Brunson convention.
 *
 * Why this exists: the JK5 picker is deterministic, but inspecting it by
 * hand requires running the dev server, mocking a subscriber row, and
 * watching the output. This route makes "what does Maryan see next?" a
 * single curl call against production.
 *
 * Closes audit gap (DCS Secret #7 Seinfeld 80 → 100): operator visibility.
 * Friday Audible Call reads the SQL views in supabase/views/seinfeld_funnel.sql
 * for cohort metrics. This route reads the per-subscriber forward plan.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { pickForSend, uniqueRotationLength } from "@/lib/seinfeld/content";
import { pickPsTarget, type SubscriberTier } from "@/lib/seinfeld/emails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface PreviewItem {
  rotation_index: number;
  jk5: string;
  content_id: string;
  subject: string;
  ps_target: string;
}

function buildPreview(
  fromIndex: number,
  count: number,
  tier: SubscriberTier,
): PreviewItem[] {
  const items: PreviewItem[] = [];
  for (let i = 0; i < count; i++) {
    const idx = fromIndex + i;
    const picked = pickForSend(idx);
    items.push({
      rotation_index: idx,
      jk5: picked.jk5,
      content_id: picked.item.id,
      subject: picked.item.subject,
      ps_target: pickPsTarget(idx, tier),
    });
  }
  return items;
}

export async function GET(req: NextRequest) {
  const t0 = Date.now();
  // Auth — same Bearer pattern as the cron route. Log the auth attempt with
  // partial IP/UA fingerprint so a forensic trail exists for unauthorized
  // probes against a production endpoint that reveals subscriber state.
  const expected = process.env.CRON_SECRET;
  const provided = req.headers.get("authorization");
  if (expected && provided !== `Bearer ${expected}`) {
    console.warn("[seinfeld-preview] unauthorized", {
      ua: req.headers.get("user-agent")?.slice(0, 80) ?? null,
      // x-forwarded-for is set by Vercel; first hop is the client.
      ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    });
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const emailParam = url.searchParams.get("email");
  const indexParam = url.searchParams.get("index");
  const nRaw = Number.parseInt(url.searchParams.get("n") ?? "5", 10);
  const n = Number.isFinite(nRaw) ? Math.min(Math.max(1, nRaw), 20) : 5;

  // Mode A: subscriber lookup by email.
  if (emailParam) {
    const supabase = createAdminClient();
    const lower = emailParam.trim().toLowerCase();
    const { data: row, error } = await supabase
      .from("seinfeld_subscribers")
      .select("id, email, status, current_index, sends_count, last_sent_at, last_error")
      .ilike("email", lower)
      .maybeSingle();

    if (error) {
      console.error("[seinfeld-preview] lookup_failed", {
        email: lower,
        error: error.message,
        elapsed_ms: Date.now() - t0,
      });
      return NextResponse.json(
        { error: "lookup_failed", detail: error.message },
        { status: 500 },
      );
    }
    if (!row) {
      console.log("[seinfeld-preview] not_found", {
        email: lower,
        elapsed_ms: Date.now() - t0,
      });
      return NextResponse.json({ error: "not_found", email: lower }, { status: 404 });
    }

    // Resolve tier inline so the preview reflects what the dispatcher would
    // actually pick. Same fallback rule as lib/seinfeld/dispatch.ts.
    const { data: profile } = await supabase
      .from("profiles")
      .select("tier")
      .ilike("email", lower)
      .maybeSingle();
    const rawTier = (profile as { tier?: string } | null)?.tier;
    const tier: SubscriberTier =
      rawTier === "core" || rawTier === "starter" ? rawTier : "none";

    const subscriber = row as {
      id: string;
      email: string;
      status: string;
      current_index: number;
      sends_count: number;
      last_sent_at: string | null;
      last_error: string | null;
    };

    console.log("[seinfeld-preview] subscriber_ok", {
      email: lower,
      sends_count: subscriber.sends_count,
      tier,
      n,
      elapsed_ms: Date.now() - t0,
    });
    return NextResponse.json({
      ok: true,
      mode: "subscriber",
      subscriber: {
        id: subscriber.id,
        email: subscriber.email,
        status: subscriber.status,
        current_index: subscriber.current_index,
        sends_count: subscriber.sends_count,
        last_sent_at: subscriber.last_sent_at,
        last_error: subscriber.last_error,
        resolved_tier: tier,
      },
      next_sends: buildPreview(subscriber.sends_count, n, tier),
      rotation_total: uniqueRotationLength(),
    });
  }

  // Mode B: cold inspection by rotation index.
  const idxRaw = Number.parseInt(indexParam ?? "0", 10);
  const fromIndex = Number.isFinite(idxRaw) ? Math.max(0, idxRaw) : 0;
  const tierParam = url.searchParams.get("tier");
  const tier: SubscriberTier =
    tierParam === "core" || tierParam === "starter" ? tierParam : "none";

  console.log("[seinfeld-preview] cold_ok", {
    from_index: fromIndex,
    tier,
    n,
    elapsed_ms: Date.now() - t0,
  });
  return NextResponse.json({
    ok: true,
    mode: "cold",
    from_index: fromIndex,
    tier,
    next_sends: buildPreview(fromIndex, n, tier),
    rotation_total: uniqueRotationLength(),
  });
}
