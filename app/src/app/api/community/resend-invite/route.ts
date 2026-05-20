/**
 * POST /api/community/resend-invite
 *
 * Used by the /onboarding "Re-send invite email" form when a Core member
 * misplaced their invite (filter, archive, wrong inbox). Server action would
 * have been more elegant, but route handlers compose more cleanly with the
 * existing onboarding page that already uses native form-post patterns
 * (see the Stripe-connect form in ConnectCard).
 *
 * Security: only authenticated profiles with tier=core can trigger a resend.
 * The invite URL itself comes from server-side env, never round-tripped via
 * the client – this endpoint just re-fires the same email the webhook would.
 */
import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { grantCoreCommunityAccess } from "@/lib/community";

export async function POST() {
  const supabase = await createClient();
  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr || !auth.user) {
    return NextResponse.redirect(
      new URL("/login?next=/onboarding", appBaseUrl()),
      303,
    );
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id,email,tier,builder_name,product_name")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (!profile || (profile as { tier?: string }).tier !== "core") {
    return NextResponse.redirect(
      new URL("/onboarding?community=resend_failed", appBaseUrl()),
      303,
    );
  }

  try {
    await grantCoreCommunityAccess({
      profile: {
        id: profile.id as string,
        email: profile.email as string,
        builder_name:
          (profile as { builder_name?: string | null }).builder_name ?? null,
        product_name:
          (profile as { product_name?: string | null }).product_name ?? null,
      },
      source: "onboarding_resend",
    });
    return NextResponse.redirect(
      new URL("/onboarding?community=resent", appBaseUrl()),
      303,
    );
  } catch (err) {
    console.error("[community/resend-invite] failed:", err);
    return NextResponse.redirect(
      new URL("/onboarding?community=resend_failed", appBaseUrl()),
      303,
    );
  }
}

function appBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (explicit) return explicit;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
