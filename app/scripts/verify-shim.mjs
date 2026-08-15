#!/usr/bin/env node
/**
 * Blocking prebuild gate: the Stripe webhook (and ~116 other call sites) must
 * resolve their Supabase client through the Mac mini SQLite shim, NOT through
 * the old @supabase/ssr / @supabase/supabase-js clients.
 *
 * Why this exists: on 2026-08-12 a deploy from branch feat/add-hirenika-backlink
 * (created before the shim migration in 34784f1 on main) shipped the OLD
 * @supabase/ssr-based src/lib/supabase/server.ts. That client dialed a Supabase
 * project that no longer exists (the DB moved to the Mac mini SQLite store, see
 * src/lib/supabase/shim.ts), so createAdminClient() threw and the Stripe webhook
 * route 500'd for ~44h. Stripe retried, auto-flagged the endpoint, and only
 * emailed "webhook recovered" after commit ca6cbd3 re-ported the shim and a clean
 * redeploy landed.
 *
 * A fix is only "done" when a tree that lacks it CANNOT build. This gate runs in
 * `prebuild`, so any stale branch / checkout / worktree without the shim fails the
 * build on every deploy path (Vercel cloud build, local `vercel build`, git-push).
 *
 * Node (not Python) on purpose: every deploy path has node, not every one has
 * python3. Self-contained: no cross-repo imports, works in Vercel's shallow clone.
 *
 * Assertions are lineage-agnostic and assert the FIXED state, plus negated
 * predicates rejecting the exact old implementation:
 *   - shim.ts        exists and exports createAdminClient (the Mac mini shim)
 *   - server.ts      re-exports from ./shim and does NOT import @supabase/ssr
 *   - client.ts      imports from ./shim and does NOT import @supabase/ssr
 *   - middleware.ts  exists and does NOT import @supabase/ssr
 *   - supabase.ts    (if present) re-exports ./supabase/client, not @supabase/supabase-js
 *   - webhook route  imports createAdminClient from @/lib/supabase/server
 *
 * The negated regexes anchor to the IMPORT form (`from "@supabase/ssr"`) so the
 * explanatory comments in the fixed files (which mention the string "@supabase/ssr"
 * in prose) do not false-positive.
 *
 * Usage: node scripts/verify-shim.mjs      (exit 1 on any missing/regressed file)
 */
import { existsSync, readFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const APP_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const LIB = "src/lib/supabase";
const FILES = {
  shim: join(LIB, "shim.ts"),
  server: join(LIB, "server.ts"),
  client: join(LIB, "client.ts"),
  middleware: join(LIB, "middleware.ts"),
  supabaseTs: "src/lib/supabase.ts",
  webhook: "src/app/api/webhooks/stripe/route.ts",
};

const errors = [];

function read(rel) {
  const p = join(APP_ROOT, rel);
  if (!existsSync(p)) return null;
  return readFileSync(p, "utf8");
}

function check(rel, label, ok, hint) {
  if (!ok) errors.push(`${rel}: ${label}. Fix: ${hint}`);
}

// ── shim.ts: the Mac mini SQLite shim must exist and own the admin client ──
const shim = read(FILES.shim);
check(
  FILES.shim,
  "shim.ts is missing; the supabase lib is back to the dead @supabase/ssr path",
  shim !== null && /export function createAdminClient/.test(shim) && /macminiPost/.test(shim),
  "restore src/lib/supabase/shim.ts (the Mac mini SQLite shim from commit ca6cbd3)",
);

// ── server.ts: must re-export ./shim, must NOT import @supabase/ssr ──
const server = read(FILES.server);
check(
  FILES.server,
  "server.ts is missing or no longer re-exports ./shim",
  server !== null && /from\s+["']\.\/shim["']/.test(server),
  "re-export createClient/createAdminClient/hasSupabaseAdminConfig from ./shim",
);
check(
  FILES.server,
  "server.ts reintroduced the @supabase/ssr client (dials a dead Supabase project, webhook 500s)",
  server === null || !/\bfrom\s+["']@supabase\/ssr["']/.test(server),
  "replace @supabase/ssr with a re-export of ./shim",
);

// ── client.ts: must import ./shim, must NOT import @supabase/ssr ──
const client = read(FILES.client);
check(
  FILES.client,
  "client.ts is missing or no longer imports ./shim",
  client !== null && /from\s+["']\.\/shim["']/.test(client),
  "import makeClientForBrowser/createBrowserClientSync from ./shim",
);
check(
  FILES.client,
  "client.ts reintroduced the @supabase/ssr browser client",
  client === null || !/\bfrom\s+["']@supabase\/ssr["']/.test(client),
  "replace @supabase/ssr with the ./shim browser factory",
);

// ── middleware.ts: must exist and not dial @supabase/ssr ──
const middleware = read(FILES.middleware);
check(
  FILES.middleware,
  "middleware.ts is missing",
  middleware !== null,
  "restore src/lib/supabase/middleware.ts (pass-through updateSession for proxy.ts)",
);
check(
  FILES.middleware,
  "middleware.ts reintroduced the @supabase/ssr refresh (500s every auth-aware page)",
  middleware === null || !/\bfrom\s+["']@supabase\/ssr["']/.test(middleware),
  "replace @supabase/ssr with the pass-through updateSession",
);

// ── lib/supabase.ts (back-compat re-export): ABSENT is valid. main's 34784f1
//    migration removed this file and updated call sites to import
//    ./supabase/client directly, so we only assert when the file exists. ──
const supabaseTs = read(FILES.supabaseTs);
if (supabaseTs !== null) {
  check(
    FILES.supabaseTs,
    "supabase.ts exists but no longer re-exports ./supabase/client",
    /from\s+["']\.\/supabase\/client["']/.test(supabaseTs),
    "re-export { supabase, createClient } from ./supabase/client",
  );
}
check(
  FILES.supabaseTs,
  "supabase.ts reintroduced the @supabase/supabase-js client",
  supabaseTs === null || !/\bfrom\s+["']@supabase\/supabase-js["']/.test(supabaseTs),
  "replace the @supabase/supabase-js createClient with a re-export of ./supabase/client",
);

// ── webhook route: must import the admin client from the shim-backed server ──
const webhook = read(FILES.webhook);
check(
  FILES.webhook,
  "stripe webhook route is missing or no longer imports the shim-backed admin client",
  webhook !== null && /@\/lib\/supabase\/server/.test(webhook) && /createAdminClient/.test(webhook),
  "ensure src/app/api/webhooks/stripe/route.ts imports createAdminClient from @/lib/supabase/server",
);

if (errors.length) {
  console.error(
    `\n[verify-shim] ${errors.length} error(s): refusing to ship a shim-less tree (Stripe webhook would 500):`,
  );
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(
  "[verify-shim] OK: supabase lib is shim-backed; Stripe webhook resolves createAdminClient via the Mac mini shim",
);
