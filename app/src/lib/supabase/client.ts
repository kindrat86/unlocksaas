/**
 * Supabase client — now backed by the Mac mini SQLite shim.
 *
 * Exports the `supabase` singleton (browser) and a SYNCHRONOUS `createClient`
 * for client components that use it without await. Same API surface as @supabase/ssr.
 */
import { makeClientForBrowser, createBrowserClientSync } from "./shim";

export const supabase = makeClientForBrowser();
// Browser-side createClient — synchronous (no cookies to await in the browser).
export const createClient = createBrowserClientSync;
