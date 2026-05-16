import { NextResponse, type NextRequest } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { getStripe } from "@/lib/stripe";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { getOrCreateProject } from "@/lib/onboarding";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe Connect OAuth return handler.
 *
 * Stripe redirects the user back here with either:
 *   ?code=ac_xxx&state=xxx&scope=read_only      (success)
 *   ?error=access_denied&error_description=...  (user canceled)
 *
 * We verify the state token, exchange the code for the connected
 * account id, and write to public.stripe_connections.
 *
 * Idempotency: stripe_connections.project_id is the PK. A re-run of the OAuth
 * flow simply updates the existing row (most often the same account, so the
 * stripe_account_id index UNIQUE catches reconnects of the same account).
 */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorCode = searchParams.get("error");

  if (errorCode) {
    return NextResponse.redirect(`${origin}/onboarding?connect=denied`);
  }
  if (!code || !state) {
    return NextResponse.redirect(
      `${origin}/onboarding?error=${encodeURIComponent("missing_code_or_state")}`
    );
  }

  // 1. Verify the signed user is authenticated AND matches state.
  const supabase = createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return NextResponse.redirect(
      `${origin}/login?next=${encodeURIComponent("/onboarding")}`
    );
  }

  const stateSecret =
    process.env.STRIPE_CONNECT_STATE_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!stateSecret) {
    return NextResponse.redirect(
      `${origin}/onboarding?error=${encodeURIComponent("server_misconfigured")}`
    );
  }

  const verified = verifyState(state, stateSecret);
  if (!verified.ok) {
    return NextResponse.redirect(
      `${origin}/onboarding?error=${encodeURIComponent(verified.reason)}`
    );
  }
  if (verified.userId !== authData.user.id) {
    return NextResponse.redirect(
      `${origin}/onboarding?error=${encodeURIComponent("state_user_mismatch")}`
    );
  }

  // 2. Exchange the code for the connected account id.
  let stripeUserId: string;
  try {
    const tokenResp = await getStripe().oauth.token({
      grant_type: "authorization_code",
      code,
    });
    if (!tokenResp.stripe_user_id) {
      throw new Error("token response missing stripe_user_id");
    }
    stripeUserId = tokenResp.stripe_user_id;
  } catch (err) {
    console.error("[stripe-connect/callback] oauth.token failed:", err);
    return NextResponse.redirect(
      `${origin}/onboarding?error=${encodeURIComponent("token_exchange_failed")}`
    );
  }

  // 3. Resolve the user's project (creates it if needed).
  const project = await getOrCreateProject(
    authData.user.id,
    authData.user.email ?? null
  );

  // 4. Upsert the connection.
  const admin = createAdminClient();
  const { error: upsertError } = await admin
    .from("stripe_connections")
    .upsert(
      {
        project_id: project.id,
        stripe_account_id: stripeUserId,
        connected_at: new Date().toISOString(),
        disconnected_at: null,
      },
      { onConflict: "project_id" }
    );

  if (upsertError) {
    console.error(
      "[stripe-connect/callback] upsert stripe_connections failed:",
      upsertError
    );
    return NextResponse.redirect(
      `${origin}/onboarding?error=${encodeURIComponent("db_write_failed")}`
    );
  }

  return NextResponse.redirect(`${origin}/onboarding?connect=ok`, {
    status: 303,
  });
}

/**
 * Verify a state token minted by /api/stripe-connect/start.
 * Returns { ok: true, userId } on success, or { ok: false, reason } on
 * any signature/expiry failure.
 */
function verifyState(
  token: string,
  secret: string
):
  | { ok: true; userId: string }
  | { ok: false; reason: "state_malformed" | "state_signature_invalid" | "state_expired" } {
  const parts = token.split(".");
  if (parts.length !== 2) return { ok: false, reason: "state_malformed" };
  const [payloadB64, sigHex] = parts;

  let expectedSigHex: string;
  try {
    expectedSigHex = createHmac("sha256", secret).update(payloadB64).digest("hex");
  } catch {
    return { ok: false, reason: "state_signature_invalid" };
  }

  if (expectedSigHex.length !== sigHex.length) {
    return { ok: false, reason: "state_signature_invalid" };
  }

  const a = Buffer.from(expectedSigHex, "hex");
  const b = Buffer.from(sigHex, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, reason: "state_signature_invalid" };
  }

  let payload: { uid?: string; exp?: number };
  try {
    payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
  } catch {
    return { ok: false, reason: "state_malformed" };
  }

  if (!payload.uid || typeof payload.exp !== "number") {
    return { ok: false, reason: "state_malformed" };
  }
  if (Date.now() > payload.exp) {
    return { ok: false, reason: "state_expired" };
  }

  return { ok: true, userId: payload.uid };
}
