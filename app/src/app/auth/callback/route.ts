import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { captureServerAndFlush } from "@/lib/analytics/server";
import { Event } from "@/lib/analytics/events";

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
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("exchangeCodeForSession error:", error.message);
    return NextResponse.redirect(
      `${origin}/login?error=exchange_failed&next=${encodeURIComponent(next)}`
    );
  }

  // PostHog: user signed in via magic link. captureServerAndFlush (awaited)
  // because the function may freeze right after the redirect — fire-and-
  // forget is unsafe here. Distinct id = Supabase user id so all subsequent
  // playbook step events join cleanly with this one event. Wrapped so any
  // analytics outage cannot block the auth redirect.
  const userId = data.session?.user.id;
  if (userId) {
    try {
      await captureServerAndFlush(userId, Event.UserSignedIn, {
        next,
        provider: "magic_link",
      });
    } catch (e) {
      console.error("captureServerAndFlush UserSignedIn failed:", e);
    }
  }

  // Guard against open-redirects: only allow same-origin paths.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/playbook";
  return NextResponse.redirect(`${origin}${safeNext}`);
}
