/**
 * HMAC-signed tokens for the recrawl-alert mute link.
 *
 * Separate from the soap-opera unsubscribe token namespace by design — a
 * Core subscriber might want to keep the daily nurture sequence but mute
 * the weekly re-crawl pings (or vice versa). Two distinct tokens, two
 * distinct endpoints, no cross-contamination.
 *
 * Implementation mirrors lib/soap-opera/tokens.ts:
 *   - Stateless (no token table); HMAC derives from email + recrawl-namespaced
 *     plaintext + the same UNSUBSCRIBE_SECRET (or fallback).
 *   - Constant-time comparison on verify.
 *   - The token namespace string makes a soap-opera unsubscribe token
 *     unable to mute recrawl alerts and vice versa.
 */

import { createHmac, timingSafeEqual } from "crypto";

const TOKEN_NAMESPACE = "::recrawl_mute";

function getSecret(): string {
  const secret =
    process.env.UNSUBSCRIBE_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    throw new Error(
      "Set UNSUBSCRIBE_SECRET (preferred) or SUPABASE_SERVICE_ROLE_KEY before issuing recrawl-mute tokens."
    );
  }
  return secret;
}

export function signRecrawlMuteToken(email: string): string {
  return createHmac("sha256", getSecret())
    .update(email.trim().toLowerCase() + TOKEN_NAMESPACE)
    .digest("hex");
}

export function verifyRecrawlMuteToken(email: string, token: string): boolean {
  try {
    const expected = Buffer.from(signRecrawlMuteToken(email), "hex");
    const provided = Buffer.from(token, "hex");
    if (expected.length !== provided.length) return false;
    return timingSafeEqual(expected, provided);
  } catch {
    return false;
  }
}

/**
 * Build the one-click mute URL. Goes in the email footer.
 */
export function buildRecrawlMuteUrl(email: string, baseUrl: string): string {
  const token = signRecrawlMuteToken(email);
  const url = new URL("/api/recrawl/mute", baseUrl);
  url.searchParams.set("email", email);
  url.searchParams.set("token", token);
  return url.toString();
}
