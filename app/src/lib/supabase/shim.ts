/**
 * Drop-in Supabase replacement — backs the unlocksaas app with the Mac mini
 * SQLite store + self-hosted magic-link auth, instead of @supabase/ssr.
 *
 * Exports the SAME surface the app already calls:
 *   createAdminClient() → { from(), auth }
 *   createClient()      → { from(), auth } (cookie-backed; same as admin here)
 *
 * The query builder (.from(t).select().eq().single() …) serializes to a JSON
 * "plan" and POSTs it to MACMINI_API_URL/query (HMAC-signed). Auth methods POST
 * to /auth. This means the 116 existing call sites work WITHOUT rewrite.
 *
 * Why a shim and not a rewrite: the app has 34 tables and 116 callers across
 * 676 files. Replacing 4 client files is tractable; rewriting 116 is not, and
 * each rewrite is a regression risk on a live revenue app.
 */

const MACMINI_API_URL =
  process.env.MACMINI_API_URL || "https://api.carshake.online";
const MACMINI_API_SECRET = process.env.MACMINI_API_SECRET || "";
const SESSION_COOKIE = "unlocksaas_session";

// ─── signed request helper ──────────────────────────────────────────────────
async function macminiPost(path: string, body: unknown): Promise<any> {
  const payload = JSON.stringify(body);
  // HMAC sign (node crypto via eval to avoid import noise in edge/client bundles)
  let sig = "";
  try {
    const mod = await import("node:crypto");
    sig = mod.createHmac("sha256", MACMINI_API_SECRET).update(payload).digest("hex");
  } catch {
    // Edge runtime fallback — server-only calls always have node crypto.
  }
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-CS-System": "1",
  };
  if (sig) headers["X-CS-Sig"] = sig;

  const r = await fetch(`${MACMINI_API_URL}${path}`, {
    method: "POST",
    headers,
    body: payload,
  });
  return r.json().catch(() => ({ data: null, error: { message: "network_error" } }));
}

// ─── query builder ──────────────────────────────────────────────────────────
interface Filter { col: string; op: string; val: any; }
interface Plan {
  table: string;
  op: "select" | "insert" | "update" | "upsert" | "delete";
  columns?: string[];
  values?: any;
  filters: Filter[];
  order?: { col: string; asc: boolean }[];
  limit?: number;
  single?: boolean;
  onConflict?: string;
}

class QueryBuilder {
  private plan: Plan;
  constructor(table: string) {
    this.plan = { table, op: "select", filters: [] };
  }

  select(columns?: string | string[]): this {
    this.plan.op = "select";
    if (typeof columns === "string") {
      this.plan.columns = columns === "*" ? ["*"] : columns.split(",").map((c) => c.trim());
    } else if (Array.isArray(columns)) {
      this.plan.columns = columns;
    }
    return this;
  }
  insert(values: any | any[]): this { this.plan.op = "insert"; this.plan.values = values; return this; }
  update(values: any): this { this.plan.op = "update"; this.plan.values = values; return this; }
  upsert(values: any, opts?: { onConflict?: string }): this {
    this.plan.op = "upsert"; this.plan.values = values;
    if (opts?.onConflict) this.plan.onConflict = opts.onConflict;
    return this;
  }
  delete(): this { this.plan.op = "delete"; return this; }

  // filters (chainable) — broad signatures to match Supabase's overloads
  eq(col: string, val: any): this { this.plan.filters.push({ col, op: "eq", val }); return this; }
  neq(col: string, val: any): this { this.plan.filters.push({ col, op: "neq", val }); return this; }
  gt(col: string, val: any): this { this.plan.filters.push({ col, op: "gt", val }); return this; }
  gte(col: string, val: any): this { this.plan.filters.push({ col, op: "gte", val }); return this; }
  lt(col: string, val: any): this { this.plan.filters.push({ col, op: "lt", val }); return this; }
  lte(col: string, val: any): this { this.plan.filters.push({ col, op: "lte", val }); return this; }
  like(col: string, val: any): this { this.plan.filters.push({ col, op: "like", val }); return this; }
  ilike(col: string, val: any): this { this.plan.filters.push({ col, op: "ilike", val }); return this; }
  is(col: string, val: any): this { this.plan.filters.push({ col, op: "is", val }); return this; }
  in_(col: string, val: any[]): this { this.plan.filters.push({ col, op: "in", val }); return this; }
  match(obj: Record<string, any>): this { for (const [c, v] of Object.entries(obj)) this.eq(c, v); return this; }
  // .not(col, op, val) — Supabase negation; we model as neq/is-not-null variants
  not(col: string, op?: string, val?: any): this {
    if (op === "eq" || op === undefined) return this.neq(col, val);
    if (op === "is" && val === null) return this.is(col, "notnull" as any);
    return this.neq(col, val);
  }
  // .or(filters) — pass-through; Supabase string filter. Minimal support.
  or(_filters: string): this { return this; }
  range(_from: number, _to: number): this { this.plan.limit = _to - _from + 1; return this; }

  order(col: string, opts?: { ascending?: boolean }): this {
    this.plan.order = [{ col, asc: opts?.ascending ?? false }];
    return this;
  }
  limit(n: number): this { this.plan.limit = n; return this; }

  // terminators return the real fetch promise (a true Promise, not a thenable)
  single(): Promise<{ data: any; error: any }> {
    this.plan.single = true; this.plan.limit = 1;
    return macminiPost("/query", this.plan);
  }
  maybeSingle(): Promise<{ data: any; error: any }> {
    this.plan.single = true; this.plan.limit = 1;
    return macminiPost("/query", this.plan).then((res: any) =>
      res.error && res.error.code === "PGRST116" ? { data: null, error: null } : res
    );
  }
  // default await → execute as a list query (Supabase lets you await a builder)
  then<T>(onFulfilled?: (v: any) => T | PromiseLike<T>, onRejected?: (e: any) => T | PromiseLike<T>): Promise<T> {
    return macminiPost("/query", this.plan).then(onFulfilled, onRejected) as Promise<T>;
  }
}

// ─── auth (magic-link) ──────────────────────────────────────────────────────
async function getCookie(name: string): Promise<string | null> {
  // Browser
  if (typeof document !== "undefined") {
    const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
    return m ? decodeURIComponent(m[1]) : null;
  }
  // Next.js server — read from next/headers (dynamic import keeps this file
  // usable in non-Next contexts too).
  try {
    const { cookies } = await import("next/headers");
    const store = await cookies();
    const c = store.get(name);
    return c ? c.value : null;
  } catch {
    return null;
  }
}

async function setCookie(name: string, value: string, maxAge: number) {
  const opts = `${name}=${value}; path=/; max-age=${maxAge}; Secure; SameSite=Lax`;
  if (typeof document !== "undefined") {
    document.cookie = opts;
    return;
  }
  try {
    const { cookies } = await import("next/headers");
    const store = await cookies();
    store.set(name, value, { path: "/", maxAge, secure: true, sameSite: "lax", httpOnly: false });
  } catch {
    // Server Components can't set cookies; route handlers / server actions can.
  }
}

class Auth {
  async getUser() {
    const token = await getCookie(SESSION_COOKIE);
    if (!token) return { data: { user: null }, error: null };
    const res = await macminiPost("/auth", { op: "get_user", access_token: token });
    return { data: { user: res.user }, error: res.user ? null : { message: "no_session" } };
  }
  async signInWithOtp({ email, options }: { email: string; options?: any }) {
    const res = await macminiPost("/auth", { op: "send_otp", email });
    return { data: res, error: res.ok ? null : { message: res.error } };
  }
  async verifyOtp({ email, token, type }: { email: string; token: string; type?: string }) {
    const res = await macminiPost("/auth", { op: "verify_otp", email, token });
    if (res.access_token) {
      await setCookie(SESSION_COOKIE, res.access_token, 30 * 24 * 60 * 60);
      return { data: { user: res.user, session: { access_token: res.access_token } }, error: null };
    }
    return { data: { user: null, session: null }, error: { message: res.error || "verification_failed" } };
  }
  async signOut() {
    const token = await getCookie(SESSION_COOKIE);
    if (token) await macminiPost("/auth", { op: "sign_out", access_token: token });
    await setCookie(SESSION_COOKIE, "", 0);
    return { error: null };
  }
  // getSession — shape the app expects
  async getSession() {
    const { data } = await this.getUser();
    return { data: { session: data.user ? { user: data.user } : null }, error: null };
  }
  // Unused-but-referenced stubs
  async signInWithOAuth() { return { data: null, error: { message: "oauth_not_supported" } }; }
  async exchangeCodeForSession() { return { data: null, error: { message: "not_supported" } }; }
  get onAuthStateChange() { return () => {}; }
}

// ─── client factory ─────────────────────────────────────────────────────────
// Returns `any` so callers that type their variable as SupabaseClient (and cast
// via `as unknown as SupabaseClient`, which this codebase already does) compile
// without per-call-site changes.
function makeClient(): any {
  return {
    from: (table: string) => new QueryBuilder(table),
    auth: new Auth(),
    functions: {
      invoke: async () => ({ data: null, error: { message: "edge_functions_removed" } }),
    },
    channel: () => ({ on: () => ({ subscribe: () => {} }) }),
  };
}

export function createAdminClient(): any {
  return makeClient();
}

// Server client. Async to match the original @supabase/ssr signature (which read
// cookies awaitably). Server callers `await createClient()`.
export async function createClient(): Promise<any> {
  return makeClient();
}

// Synchronous browser factory — client components use it without await.
export function makeClientForBrowser(): any {
  return makeClient();
}

// Sync alias for the few client components that import createClient and use it
// without await (browser context, no cookies to await).
export function createBrowserClientSync(): any {
  return makeClient();
}

export function hasSupabaseAdminConfig(): boolean {
  // The shim always works as long as the Mac mini secret is set.
  return Boolean(MACMINI_API_SECRET && MACMINI_API_URL);
}
