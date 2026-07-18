import { NextResponse } from "next/server";
import { checkBotId } from "botid/server";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * Shared abuse gate for the public opt-in endpoints (soap-opera/seinfeld/
 * challenge subscribe + apply). Mirrors the /api/checkout protection stack:
 *
 *   1. Per-IP rate limit (default 5 req / 60s per endpoint prefix) — stops
 *      scripted list-bombing that would burn Resend quota and sender
 *      reputation from the verified domain.
 *   2. BotID verification, fail-open: a BotID outage must never block a
 *      legitimate subscriber, same trade-off as checkout.
 *
 * Returns the response to short-circuit with, or null when the request may
 * proceed.
 */
export async function guardPublicForm(
  req: Request,
  keyPrefix: string,
  options?: { limit?: number; windowMs?: number }
): Promise<NextResponse | null> {
  const rl = checkRateLimit(req, {
    limit: options?.limit ?? 5,
    windowMs: options?.windowMs ?? 60_000,
    keyPrefix,
  });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  try {
    const botCheck = await checkBotId();
    if (botCheck.isBot) {
      return NextResponse.json({ error: "bot_detected" }, { status: 403 });
    }
  } catch (err) {
    console.warn(
      `[botid] ${keyPrefix} verification failed, proceeding fail-open`,
      err
    );
  }

  return null;
}

/**
 * Honeypot check. The public forms render a visually-hidden `_gotcha` input
 * (never autofilled by browsers — Formspree convention) and forward its
 * value in the JSON body. Humans leave it empty; naive bots fill it.
 *
 * Callers should respond with a plausible fake success and do nothing, so
 * bots can't detect the trap.
 */
export function honeypotTripped(body: Record<string, unknown>): boolean {
  const v = body["_gotcha"];
  return typeof v === "string" && v.trim().length > 0;
}
