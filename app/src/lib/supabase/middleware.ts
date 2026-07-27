import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the auth session on every request.
 *
 * Previously this called Supabase's getUser() to refresh the JWT cookie. With
 * the self-hosted Mac mini auth, the session is a self-contained signed cookie
 * (verified server-side on demand by Auth.getUser()), so there is nothing to
 * network-refresh here. We pass the request through unchanged.
 *
 * Kept as an exported function because proxy.ts imports it.
 */
export async function updateSession(request: NextRequest) {
  return NextResponse.next({ request });
}
