/**
 * /api/conversions
 *
 * GET  — list the signed-in user's verified_conversions (flips the guarantee
 *        verdict to `verdict_kept` once non-empty).
 * POST — record a verified conversion manually (v1 path). Sprint 3 wires
 *        Stripe Connect webhooks for auto-recording.
 *
 * Auth: both methods require a Supabase session.
 *
 * Source of truth: the verified_conversions table created in
 * supabase/migrations/20260517010000_guarantee.sql.
 */
import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { recordVerifiedConversion } from "@/lib/guarantee";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();

  try {
    const supabase = createClient();
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
      return NextResponse.json({ conversions: [] });
    }

    const { data, error } = await supabase
      .from("verified_conversions")
      .select(
        "id,stripe_charge_id,amount_cents,currency,customer_email,detected_at,source"
      )
      .eq("profile_id", profile.id)
      .order("detected_at", { ascending: false });

    if (error) {
      console.error("[conversions.list] db error", error);
      return NextResponse.json(
        { error: "Couldn't load conversions" },
        { status: 500 }
      );
    }

    console.log("[conversions.list]", {
      profileId: profile.id,
      count: data?.length ?? 0,
      durationMs: Date.now() - startedAt,
    });

    return NextResponse.json({ conversions: data ?? [] });
  } catch (err) {
    console.error("[conversions.list] handler error", {
      message: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - startedAt,
    });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

interface RecordBody {
  stripeChargeId?: string;
  customerEmail?: string;
  amountCents: number;
  currency?: string;
  source?: "manual" | "connect";
}

export async function POST(req: Request) {
  const startedAt = Date.now();

  try {
    const supabase = createClient();
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

    const body = (await req.json()) as Partial<RecordBody>;
    if (
      typeof body.amountCents !== "number" ||
      !Number.isFinite(body.amountCents) ||
      body.amountCents <= 0
    ) {
      return NextResponse.json(
        { error: "amountCents must be a positive number" },
        { status: 400 }
      );
    }

    // Sanity cap: $10,000 per recorded charge. The verifier doesn't care
    // about the absolute amount — presence alone flips the verdict — but
    // a typo with extra zeros shouldn't land in the database.
    if (body.amountCents > 1_000_000) {
      return NextResponse.json(
        { error: "amountCents exceeds sanity cap of $10,000" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const result = await recordVerifiedConversion(admin, {
      profileId: profile.id,
      stripeChargeId: body.stripeChargeId?.trim() || undefined,
      amountCents: Math.round(body.amountCents),
      currency: body.currency ?? "usd",
      customerEmail: body.customerEmail?.trim() || undefined,
      source: body.source === "connect" ? "connect" : "manual",
    });

    console.log("[conversions.record]", {
      profileId: profile.id,
      inserted: result.inserted,
      source: body.source ?? "manual",
      durationMs: Date.now() - startedAt,
    });

    return NextResponse.json({ ok: true, inserted: result.inserted });
  } catch (err) {
    console.error("[conversions.record] handler error", {
      message: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - startedAt,
    });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
