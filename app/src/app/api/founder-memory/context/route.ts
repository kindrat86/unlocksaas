import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  readFounderMemory,
  toChatContext,
} from "@/lib/founder-memory";

/**
 * GET /api/founder-memory/context
 *
 * Returns the chat-ready system-prompt fragment for the signed-in founder.
 * The integration point for a future chat sidebar – it just plugs the
 * returned `context` string into the chat system prompt verbatim.
 *
 *   200: { context: string, summary: string | null, has_memory: boolean }
 *   401: not signed in
 *
 * Auth: cookie-session via the SSR client. RLS on founder_memory permits
 * the signed-in user to read rows where user_id = auth.uid() OR email =
 * jwt.email; the helper does the lookup defensively (by user_id first,
 * then by email) so a Google-OAuth founder whose memory row was written
 * pre-signup still gets a hit.
 *
 * No caching. The memory blob is small (< 4kB on the wire) and the chat
 * sidebar needs the freshest copy.
 */

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData?.user) {
      return NextResponse.json(
        { error: "Sign in to read your founder memory." },
        { status: 401 },
      );
    }

    const memory = await readFounderMemory({
      userId: userData.user.id,
      email: userData.user.email ?? null,
    });

    const context = toChatContext(memory);

    return NextResponse.json(
      {
        has_memory: memory !== null,
        summary: memory?.summary ?? null,
        context,
      },
      {
        headers: {
          "cache-control": "private, no-store",
        },
      },
    );
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown";
    console.error("[founder-memory/context] unexpected error", reason, err);
    return NextResponse.json(
      { error: "Could not read founder memory." },
      { status: 500 },
    );
  }
}
