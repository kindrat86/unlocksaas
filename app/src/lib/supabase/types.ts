/**
 * Local SupabaseClient type — replaces the removed @supabase/supabase-js type.
 *
 * The shim (./shim.ts) returns `any`-typed clients, and the app already casts
 * via `as unknown as SupabaseClient` in places. This module provides the type
 * name those imports expect, so `import type { SupabaseClient } from "@/lib/..."`
 * resolves without the @supabase/supabase-js package.
 *
 * It's a permissive structural type (the methods the app actually calls).
 */
export type SupabaseClient<T = any> = {
  from: (table: string) => any;
  auth: {
    getUser: () => Promise<{ data: { user: any }; error: any }>;
    signInWithOtp: (opts: any) => Promise<any>;
    verifyOtp: (opts: any) => Promise<any>;
    signOut: () => Promise<{ error: any }>;
    getSession: () => Promise<{ data: { session: any }; error: any }>;
    [k: string]: any;
  };
  functions: { invoke: (name: string, opts?: any) => Promise<any> };
  [k: string]: any;
};

// Re-export Database for any stragglers that imported it from the supabase pkg.
export type Database = Record<string, unknown>;
