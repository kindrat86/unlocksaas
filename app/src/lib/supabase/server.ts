/**
 * Supabase server client — now backed by the Mac mini SQLite shim.
 *
 * Exports the SAME surface the app calls from 95 files:
 *   createClient()      → cookie-backed client (Server Components, Route Handlers)
 *   createAdminClient() → service client (bypasses RLS — same impl now)
 *   hasSupabaseAdminConfig() → true when the Mac mini secret is set
 *
 * The previous @supabase/ssr implementation is replaced by the drop-in shim in
 * ./shim.ts. Call sites (.from().select().eq().single(), auth.getUser(), etc.)
 * work unchanged.
 */
export { createClient, createAdminClient, hasSupabaseAdminConfig } from "./shim";
