import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/database.types";

/**
 * Refreshes the Supabase auth session on every request and propagates the
 * updated cookies into both the request (so downstream RSC reads see them)
 * and the response (so the browser persists them).
 *
 * Call this from `middleware.ts` for every request that might be auth-aware.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // No (real) Supabase config → nothing to refresh. Without this guard a
  // missing env crashes createServerClient and 500s EVERY page the proxy
  // touches; the placeholder host would instead stall on a dead fetch.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey || /placeholder|your-project-ref/i.test(url)) {
    return response;
  }

  const supabase = createServerClient<Database>(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: do not run any code between createServerClient() and
  // supabase.auth.getUser(). It risks logging out users at random.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  await supabase.auth.getUser();

  return response;
}
