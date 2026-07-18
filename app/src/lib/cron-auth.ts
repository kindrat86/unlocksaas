import { NextResponse } from "next/server";

/**
 * Shared fail-closed CRON_SECRET gate for /api/cron/* routes.
 *
 * Vercel injects `Authorization: Bearer <CRON_SECRET>` on every
 * cron-triggered request. Historically most cron routes used the fail-open
 * form `if (expected && provided !== ...)`, which made every route
 * world-triggerable whenever the env var was missing — several of them
 * dispatch real email batches. This helper fails closed instead: an unset
 * secret rejects exactly like a mismatched one.
 *
 * Usage (route handler):
 *   const unauthorized = requireCronSecret(req);
 *   if (unauthorized) return unauthorized;
 *
 * Returns the 401 response to short-circuit with, or null when the request
 * is authorized.
 */
export function requireCronSecret(req: Request): NextResponse | null {
  const expected = process.env.CRON_SECRET;
  const provided = req.headers.get("authorization");
  if (!expected || provided !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}
