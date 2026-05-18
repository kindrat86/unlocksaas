import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

type OtpType = "magiclink" | "email" | "signup" | "recovery" | "invite" | "email_change";
const ALLOWED_TYPES: OtpType[] = [
  "magiclink",
  "email",
  "signup",
  "recovery",
  "invite",
  "email_change",
];

/**
 * Token-hash claim route for admin-generated Supabase Auth links.
 *
 * The standard /auth/callback handles PKCE codes minted by the client during
 * signInWithOtp. Admin generate_link (and any non-PKCE one-time-link flow)
 * uses an implicit flow that produces a `token_hash` instead. This route
 * exchanges that token_hash for a session via verifyOtp, sets the cookie
 * through @supabase/ssr, and forwards to `next`.
 *
 *   /auth/claim?token_hash=<hash>&type=magiclink&next=/playbook
 *
 * Security: the token_hash is a single-use Supabase secret that already
 * authorises a session by itself (the issuer of generate_link controls who
 * gets it). This route only translates the implicit flow into the cookie
 * flow our SSR app expects — it does not add a new trust boundary.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const typeRaw = searchParams.get("type") ?? "magiclink";
  const type = (ALLOWED_TYPES.includes(typeRaw as OtpType) ? typeRaw : "magiclink") as OtpType;
  const next = searchParams.get("next") || "/playbook";

  if (!tokenHash) {
    return NextResponse.redirect(`${origin}/login?error=missing_token`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

  if (error) {
    console.error("auth/claim verifyOtp error:", error.message);
    return NextResponse.redirect(
      `${origin}/login?error=claim_failed&next=${encodeURIComponent(next)}`
    );
  }

  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/playbook";
  return NextResponse.redirect(`${origin}${safeNext}`);
}
