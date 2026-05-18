import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/**
 * Supabase client for Server Components, Route Handlers, and Server Actions.
 *
 * Reads the session from cookies. Setting cookies works inside Route Handlers
 * and Server Actions, but is a no-op (with a try/catch swallow) in Server
 * Components — there the proxy is responsible for refreshing.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Components cannot set cookies. Middleware refreshes the
            // session on every request, so this is fine.
          }
        },
      },
    }
  );
}

/**
 * Service-role Supabase client. Server-only. Bypasses RLS.
 *
 * Use exclusively from trusted server contexts (webhook handlers, admin
 * routes). NEVER expose this client to a browser bundle.
 */
export function createAdminClient() {
  return createServiceClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
