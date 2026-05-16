import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";

/**
 * Supabase client for browser/client components.
 *
 * Uses the anon key. Reads/writes session cookies via the browser, which the
 * middleware then refreshes on every server request.
 *
 * Use the legacy ANON JWT key (NEXT_PUBLIC_SUPABASE_ANON_KEY) — the new
 * sb_publishable_* keys do not yet work with @supabase/ssr's cookie flow as of
 * @supabase/ssr 0.7. Revisit when Supabase publishes ssr support for the new
 * key format.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
