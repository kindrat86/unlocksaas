import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Magic-link landing route. Supabase emails a URL of the form
 *   /auth/callback?code=<pkce-code>&next=<destination>
 * We exchange the code for a session, then forward to `next` (default /playbook).
 *
 * If the exchange fails or there's no code, send the user to /login with an
 * error flag so the form can render a message.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/playbook";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("exchangeCodeForSession error:", error.message);
    return NextResponse.redirect(
      `${origin}/login?error=exchange_failed&next=${encodeURIComponent(next)}`
    );
  }

  // Guard against open-redirects: only allow same-origin paths.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/playbook";
  return NextResponse.redirect(`${origin}${safeNext}`);
}
