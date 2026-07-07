/**
 * Lightweight in-memory rate limiter for serverless API routes.
 *
 * Design constraints (Vercel serverless):
 *   - Each container instance maintains its own window. This is NOT a
 *     globally-distributed limiter (would need Upstash/KV). It catches
 *     burst attacks and single-container scraping. Each Vercel function
 *     instance is a fresh map; on cold start the map is empty.
 *   - Low memory: entries are pruned every cleanup_interval_ms.
 *   - Sliding window approximation: fixed window per key.
 *
 * Usage:
 *   const { allowed, retryAfter } = rateLimit(request, {
 *     key: ip,         // identifier (IP, user ID, etc.)
 *     limit: 10,       // max requests
 *     windowMs: 60000, // per 60s window
 *   });
 *   if (!allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": String(retryAfter) } });
 */

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const STORE = new Map<string, RateLimitEntry>();
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 min
let lastCleanup = Date.now();

function cleanup(now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [k, v] of STORE) {
    if (v.resetAt < now) STORE.delete(k);
  }
}

export function getClientIp(request: Request): string {
  // Vercel sets these; x-forwarded-for is the client IP chain.
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfter: number; // seconds until window resets
};

export function rateLimit(
  key: string,
  options: { limit: number; windowMs: number }
): RateLimitResult {
  const now = Date.now();
  cleanup(now);

  const existing = STORE.get(key);

  if (!existing || existing.resetAt < now) {
    // Fresh window
    STORE.set(key, { count: 1, resetAt: now + options.windowMs });
    return {
      allowed: true,
      remaining: options.limit - 1,
      retryAfter: Math.ceil(options.windowMs / 1000),
    };
  }

  existing.count++;

  if (existing.count > options.limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  return {
    allowed: true,
    remaining: options.limit - existing.count,
    retryAfter: Math.ceil((existing.resetAt - now) / 1000),
  };
}

/**
 * Convenience wrapper: rate-limit by client IP.
 * Returns null if allowed, or a NextResponse-like status indicator.
 */
export function checkRateLimit(
  request: Request,
  options: { limit: number; windowMs: number; keyPrefix?: string }
): RateLimitResult {
  const ip = getClientIp(request);
  const key = `${options.keyPrefix || "rl"}:${ip}`;
  return rateLimit(key, options);
}
