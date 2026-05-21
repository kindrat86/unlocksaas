import { NextResponse, type NextRequest } from "next/server";
import { createHmac, randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";

// Node runtime is required for `crypto` HMAC. (The Edge runtime exposes a
// subset of Web Crypto that needs different glue code — keep this on Node.)

/**
 * Kick off Stripe Connect OAuth (Standard accounts, read-only scope).
 *
 * Flow:
 *   1. Require an authenticated user.
 *   2. Mint a signed state token = base64( payload.sig ), where
 *        payload = { uid, exp }
 *        sig     = HMAC-SHA256(STRIPE_CONNECT_STATE_SECRET, payload)
 *      The callback verifies sig AND that the authenticated user's id
 *      matches uid. The exp window (10 min) limits replay.
 *   3. Redirect the browser to Stripe's authorize URL.
 *
 * Standard accounts (full Stripe accounts owned by the user) are the right
 * fit here: the founder already has a Stripe account selling his own product.
 * We don't need Express/Custom — we just want to listen to charges on his
 * existing account.
 *
 * Scope = read_only: we read charges + customers; we cannot write.
 */
export async function POST(req: NextRequest) {
  return handleStart(req);
}

// Allow GET as a convenience for opening the connect URL from a plain anchor
// during local debugging. Same behavior as POST.
export async function GET(req: NextRequest) {
  return handleStart(req);
}

async function handleStart(req: NextRequest) {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    const { origin } = new URL(req.url);
    return NextResponse.redirect(`${origin}/login?next=/onboarding`);
  }

  const clientId = process.env.STRIPE_CONNECT_CLIENT_ID;
  const stateSecret =
    process.env.STRIPE_CONNECT_STATE_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!clientId) {
    const { origin } = new URL(req.url);
    console.error("[stripe-connect/start] STRIPE_CONNECT_CLIENT_ID is not set");
    return NextResponse.redirect(
      `${origin}/onboarding?error=${encodeURIComponent("server_misconfigured")}`
    );
  }
  if (!stateSecret) {
    const { origin } = new URL(req.url);
    console.error("[stripe-connect/start] no state secret available");
    return NextResponse.redirect(
      `${origin}/onboarding?error=${encodeURIComponent("server_misconfigured")}`
    );
  }

  const state = signState(authData.user.id, stateSecret);

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    new URL(req.url).origin;

  const redirectUri = `${appUrl}/api/stripe-connect/callback`;

  const authorizeUrl = new URL("https://connect.stripe.com/oauth/authorize");
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("scope", "read_only");
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  // Pre-fill the connect form with the user's email when we know it. Stripe
  // ignores this if the email is already linked to an account in their
  // browser session — but it's a nice hint otherwise.
  if (authData.user.email) {
    authorizeUrl.searchParams.set(
      "stripe_user[email]",
      authData.user.email
    );
  }

  return NextResponse.redirect(authorizeUrl.toString(), { status: 303 });
}

/** Sign a state token: base64(payload).hex(hmac). */
function signState(userId: string, secret: string): string {
  const nonce = randomBytes(8).toString("hex");
  const payload = Buffer.from(
    JSON.stringify({
      uid: userId,
      exp: Date.now() + 10 * 60 * 1000, // 10-minute window
      nonce,
    })
  ).toString("base64url");
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${sig}`;
}
