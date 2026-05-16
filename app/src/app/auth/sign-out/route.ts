import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Sign out the current user and redirect to the homepage.
 * Exposed as POST to make this CSRF-resistant (forms submit POSTs).
 */
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("supabase.auth.signOut error:", error.message);
    // Fall through and redirect anyway — the user wants to be signed out.
  }

  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/`, { status: 303 });
}
