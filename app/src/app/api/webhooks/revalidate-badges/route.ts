import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * POST /api/webhooks/revalidate-badges
 *
 * Sub-second cache invalidation for Verified Builder count surfaces.
 *
 * Why this exists
 * ---------------
 * Three live surfaces read `loadPublicBadgeCount()` from the Supabase
 * `builder_badges` view and bake the result into ISR-cached HTML:
 *
 *   1. `/`               — SocialProofBar's "N Verified Builders" slot
 *   2. `/playbook-sales` — SocialProofBar + AggregateRating sub-graph on the
 *                          Playbook SoftwareApplication JSON-LD
 *   3. `/builders`       — Verified Builder directory
 *
 * Without this route, the count propagates only on the ISR heartbeat
 * (1 hour) — fine for sleepy weeks but slow when a verified cycle fires
 * during a high-attention window (post-launch, founder-share blast, press
 * mention). With this route, a Supabase Database Webhook on insert into
 * `verified_conversions` POSTs here within seconds of the cycle firing,
 * and the three pages flip to the new count on the next request.
 *
 * Brunson Hard-Rule reconciliation: the route only invalidates cache.
 * It cannot fabricate, increment, or otherwise influence the count. The
 * number a visitor sees still comes from the same `builder_badges` view
 * the schema reads from — this just bypasses the cache TTL.
 *
 * Configuration (one-time)
 * ------------------------
 *   1. `vercel env add REVALIDATE_BADGES_SECRET production` — paste a
 *      long random string (32+ bytes).
 *   2. Repeat for `preview` so staging deployments can be tested.
 *   3. In Supabase Studio → Database → Webhooks, add:
 *        Name: revalidate-badges
 *        Table: public.verified_conversions
 *        Events: INSERT
 *        Type: HTTP Request
 *        URL: https://unlocksaas.com/api/webhooks/revalidate-badges
 *        HTTP Headers: Authorization: Bearer <REVALIDATE_BADGES_SECRET>
 *        Body: JSON payload (Supabase default; the body is not parsed
 *              here — only the Authorization header is checked).
 *   4. (Optional) Add a second webhook on
 *        UPDATE OF share_visibility on public.profiles
 *      so flipping a badge from private→public propagates immediately
 *      too. (Going private→hidden also needs invalidation, by symmetry.)
 *
 * Until `REVALIDATE_BADGES_SECRET` is set the route returns 503. No
 * fabricated default secret, no "skip auth in dev" backdoor — same
 * Brunson discipline as `lib/indexnow.ts` (which 404s its key file until
 * the env var ships).
 *
 * Manual trigger
 * --------------
 * Operators can also POST manually after a known event:
 *
 *   curl -X POST https://unlocksaas.com/api/webhooks/revalidate-badges \
 *     -H "Authorization: Bearer $REVALIDATE_BADGES_SECRET"
 *
 * Idempotent — revalidating an already-fresh page is a no-op.
 */

// Node runtime: revalidatePath is supported on Fluid Compute under Node.
// Force-dynamic because the route's whole job is to escape cache.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Paths whose HTML embeds data sourced from the `builder_badges` view.
 * Both `loadPublicBadgeCount` (count head-query) and `loadVerifiedBuilders`
 * (per-row list) consumers belong here — any new public badge changes the
 * output of both queries, and every consumer needs the same push.
 *
 * Audit:
 *   - "/"               loadPublicBadgeCount (SocialProofBar slot)
 *                       + loadVerifiedBuilders (AvatarWall)
 *   - "/playbook-sales" loadPublicBadgeCount (SocialProofBar +
 *                       AggregateRating sub-graph on the Playbook
 *                       SoftwareApplication schema)
 *   - "/builders"       loadVerifiedBuilders (directory page)
 *
 * Adding a new consumer of either helper MUST be paired with adding the
 * canonical path to this list. The schema↔DOM contract on the new page
 * depends on its cache being invalidated alongside the existing three.
 */
const BADGE_DEPENDENT_PATHS = [
  "/",
  "/playbook-sales",
  "/builders",
] as const;

/**
 * Constant-time bearer-token comparison. `crypto.timingSafeEqual` requires
 * equal-length Buffers, so we normalise via SHA-256 digests of both
 * sides — that also lets the secret be any length without leaking it via
 * length-based timing.
 */
async function bearerMatches(
  presented: string,
  expected: string
): Promise<boolean> {
  if (!presented || !expected) return false;
  const enc = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(presented)),
    crypto.subtle.digest("SHA-256", enc.encode(expected)),
  ]);
  const av = new Uint8Array(a);
  const bv = new Uint8Array(b);
  if (av.byteLength !== bv.byteLength) return false;
  let diff = 0;
  for (let i = 0; i < av.byteLength; i++) diff |= av[i] ^ bv[i];
  return diff === 0;
}

/**
 * Structured log helper. The next.config.mjs `removeConsole` rule strips
 * `console.log/info/debug` in prod but PRESERVES `console.warn` and
 * `console.error` — so misconfiguration (missing secret) and security
 * signals (auth failures) survive into Vercel function logs, where
 * operators can grep `[revalidate-badges]` and reconstruct the timeline.
 *
 * The success path uses `console.log`, which is intentionally stripped
 * in prod: the response body already carries the audit fields
 * (`revalidated` + `at`), and the Vercel runtime captures the status
 * code anyway. Local-dev observability gets the verbose log; prod logs
 * stay free of per-revalidation noise.
 */
function logRevalidateBadgesEvent(
  level: "warn" | "info",
  event: string,
  fields: Record<string, unknown>
): void {
  const payload = JSON.stringify({
    src: "revalidate-badges",
    event,
    at: new Date().toISOString(),
    ...fields,
  });
  if (level === "warn") {
    console.warn(`[revalidate-badges] ${payload}`);
  } else {
    console.log(`[revalidate-badges] ${payload}`);
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_BADGES_SECRET;
  if (!secret) {
    // Honest 503: the route is wired but not configured. Same posture as
    // the IndexNow key file and the GSC verification meta slots.
    // Logged at warn-level so operators see the misconfiguration in
    // Vercel logs even after the prod `removeConsole` strip.
    logRevalidateBadgesEvent("warn", "missing_secret", {
      status: 503,
      // Do not log the requesting IP — proxy chain makes it unreliable
      // and we don't need it for this signal class.
    });
    return NextResponse.json(
      { error: "REVALIDATE_BADGES_SECRET not set" },
      { status: 503 }
    );
  }

  const header = req.headers.get("authorization") ?? "";
  const presented = header.startsWith("Bearer ")
    ? header.slice("Bearer ".length).trim()
    : "";

  if (!(await bearerMatches(presented, secret))) {
    // 401 with no body — do not leak whether the route exists, whether the
    // env var is set, or anything else useful to a probe.
    // Logged at warn-level for security observability: repeated 401s here
    // are the canonical signal of either a Supabase webhook misconfig
    // (wrong secret pasted into the webhook header) or a probe. The
    // `had_header` field distinguishes the two cheaply.
    logRevalidateBadgesEvent("warn", "auth_failed", {
      status: 401,
      had_header: header.length > 0,
      had_bearer_prefix: header.startsWith("Bearer "),
    });
    return new NextResponse(null, { status: 401 });
  }

  // Revalidate every path that embeds the badge count. `revalidatePath`
  // is idempotent and very cheap (Next marks the cache entry stale; the
  // rebuild happens on the next request). We DO NOT need to await
  // anything async per path.
  for (const path of BADGE_DEPENDENT_PATHS) {
    revalidatePath(path);
  }

  // Success log (dev-only after the removeConsole strip). The response
  // body below carries the same fields for prod-time audit via the
  // Vercel response-log capture.
  logRevalidateBadgesEvent("info", "revalidated", {
    paths: BADGE_DEPENDENT_PATHS,
  });

  return NextResponse.json({
    revalidated: BADGE_DEPENDENT_PATHS,
    at: new Date().toISOString(),
  });
}

/**
 * Convenience GET for liveness checks (e.g. monitoring). Returns 200 with
 * the configured-path list when the secret is set, 503 otherwise. Does
 * NOT trigger revalidation. Does NOT leak the secret.
 */
export async function GET() {
  const secret = process.env.REVALIDATE_BADGES_SECRET;
  if (!secret) {
    // Same observability discipline as POST: misconfiguration surfaces in
    // Vercel logs even when nobody is actively probing the endpoint.
    logRevalidateBadgesEvent("warn", "liveness_unconfigured", { status: 503 });
    return NextResponse.json(
      { configured: false, paths: BADGE_DEPENDENT_PATHS },
      { status: 503 }
    );
  }
  return NextResponse.json({
    configured: true,
    paths: BADGE_DEPENDENT_PATHS,
  });
}
