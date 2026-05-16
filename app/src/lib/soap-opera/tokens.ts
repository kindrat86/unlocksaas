import { createHmac, timingSafeEqual } from "crypto";

/**
 * HMAC-signed unsubscribe tokens for one-click unsubscribe URLs.
 *
 * The token is derived from the subscriber email + a server-side secret. It is
 * stateless (no token table), unguessable without the secret, and verifiable
 * in constant time.
 *
 * Secret resolution order:
 *   1. UNSUBSCRIBE_SECRET (explicit, preferred — set in Vercel env)
 *   2. SUPABASE_SERVICE_ROLE_KEY (fallback — already present in every env, but
 *      changing it would invalidate every outstanding unsubscribe link)
 *
 * We never throw on missing secret at module load. Route handlers that use
 * these helpers will throw clearly on first use if no secret is configured.
 */
function getSecret(): string {
  const secret =
    process.env.UNSUBSCRIBE_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    throw new Error(
      "Set UNSUBSCRIBE_SECRET (preferred) or SUPABASE_SERVICE_ROLE_KEY before issuing unsubscribe tokens."
    );
  }
  return secret;
}

export function signUnsubscribeToken(email: string): string {
  return createHmac("sha256", getSecret())
    .update(email.trim().toLowerCase())
    .digest("hex");
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  try {
    const expected = Buffer.from(signUnsubscribeToken(email), "hex");
    const provided = Buffer.from(token, "hex");
    if (expected.length !== provided.length) return false;
    return timingSafeEqual(expected, provided);
  } catch {
    return false;
  }
}

/**
 * Builds the full one-click unsubscribe URL with email + token query params.
 * Used in every email footer + the List-Unsubscribe header.
 */
export function buildUnsubscribeUrl(email: string, baseUrl: string): string {
  const token = signUnsubscribeToken(email);
  const url = new URL("/api/unsubscribe", baseUrl);
  url.searchParams.set("email", email);
  url.searchParams.set("token", token);
  return url.toString();
}
