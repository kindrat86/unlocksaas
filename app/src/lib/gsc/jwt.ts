/**
 * Google service-account JWT signer (RS256) and OAuth2 token exchange.
 *
 * Why this exists – instead of `googleapis`
 * -----------------------------------------
 * The `googleapis` package is ~2 MB shipped and pulls in ~140 transitive
 * dependencies. The Search Console cron only needs:
 *   1. Sign a JWT with the service-account private key (RS256).
 *   2. Exchange it for a short-lived access token at
 *      https://oauth2.googleapis.com/token.
 *   3. POST a JSON body to the Search Analytics endpoint.
 *
 * Three things. Node's built-in `crypto.createSign("RSA-SHA256")` plus
 * `fetch` covers all of them with zero dependencies, no version drift,
 * and a 200-line surface area that the operator can audit without
 * reading a Google SDK changelog.
 *
 * Brunson Hard-Rule reconciliation: every claim in the JWT is verifiable
 * against the env-provided service-account credentials. No fabricated
 * audience, no scope creep beyond `webmasters.readonly`.
 *
 * Security
 * --------
 * - Private key never leaves the function. Read from env at call time,
 *   used to sign, discarded by GC.
 * - Access tokens are cached in module scope for their natural ~1-hour
 *   lifetime so we don't burn an OAuth2 round-trip on every API call.
 *   Cache expiry is set 60s before actual token expiry so we never
 *   submit a stale token.
 * - Refuses to operate when env is missing or malformed (returns null
 *   from `readServiceAccount()`); callers MUST handle the null and
 *   respond 503. No silent fallback to a default identity.
 */

import { createSign } from "node:crypto";

const OAUTH_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

/**
 * Single scope we ask for. `webmasters.readonly` is the minimum
 * permission the GSC Search Analytics query API requires. Anything
 * broader would violate the principle of least privilege.
 */
export const GSC_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";

/**
 * Service-account credential shape after env-time validation. Mirrors
 * the fields Google emits in the downloaded service-account JSON, but
 * we read them from two separate env vars rather than the full JSON
 * to keep the secret surface minimal (the private key is the only
 * sensitive piece; the email is public).
 */
export interface ServiceAccount {
  /** Service-account email, e.g. `gsc-cron@unlocksaas.iam.gserviceaccount.com`. */
  clientEmail: string;
  /**
   * PEM-encoded private key. Vercel env vars cannot contain raw
   * newlines, so operators paste the key with `\n` literals; we
   * normalise here.
   */
  privateKey: string;
}

/**
 * Read and validate the service-account credentials from env. Returns
 * null when missing or malformed – callers respond 503.
 *
 * The PEM normalisation step is critical: Vercel's env-var UI strips
 * literal newlines and replaces them with the escape sequence `\n`.
 * Without this `replace`, `createSign().sign(privateKey)` throws
 * "PEM_read_bio_PrivateKey failed" and the run silently fails.
 */
export function readServiceAccount(): ServiceAccount | null {
  const clientEmail = process.env.GSC_SERVICE_ACCOUNT_EMAIL?.trim();
  const rawPrivateKey = process.env.GSC_SERVICE_ACCOUNT_PRIVATE_KEY?.trim();
  if (!clientEmail || !rawPrivateKey) return null;
  // Reject obvious junk early. Real service-account emails are
  // `<name>@<project>.iam.gserviceaccount.com`.
  if (!clientEmail.endsWith(".iam.gserviceaccount.com")) return null;
  // Normalise escaped newlines, then sanity-check the PEM envelope.
  const privateKey = rawPrivateKey.replace(/\\n/g, "\n");
  if (!privateKey.includes("BEGIN PRIVATE KEY")) return null;
  return { clientEmail, privateKey };
}

/**
 * Base64url encoder. RFC 7515 §2 mandates URL-safe base64 with no
 * padding. Buffer.toString("base64url") covers this on Node 16+.
 */
function b64u(input: string | Buffer): string {
  const buf = typeof input === "string" ? Buffer.from(input) : input;
  return buf.toString("base64url");
}

/**
 * Sign a JWT for the OAuth2 token endpoint. Spec:
 *   https://developers.google.com/identity/protocols/oauth2/service-account#authorizingrequests
 *
 * The JWT claims are bounded: 1-hour expiry (Google's hard cap), single
 * scope, single audience. iat / exp use seconds since epoch.
 */
function signAssertion(account: ServiceAccount, scope: string): string {
  const now = Math.floor(Date.now() / 1000);
  const header = b64u(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64u(
    JSON.stringify({
      iss: account.clientEmail,
      scope,
      aud: OAUTH_TOKEN_ENDPOINT,
      iat: now,
      exp: now + 3600,
    }),
  );
  const signingInput = `${header}.${claims}`;
  const signer = createSign("RSA-SHA256");
  signer.update(signingInput);
  const signature = b64u(signer.sign(account.privateKey));
  return `${signingInput}.${signature}`;
}

/**
 * Cached access token. Single entry per process – the cron is the only
 * caller, and it runs once per day, but we still cache for the case
 * where the function instance is warm from a recent invocation (Fluid
 * Compute reuses instances across requests).
 */
interface CachedToken {
  token: string;
  expiresAt: number;
}
let cachedToken: CachedToken | null = null;

/**
 * Exchange the signed JWT for an access token. Returns a string the
 * caller passes as `Authorization: Bearer <token>`.
 *
 * Throws on any network or auth error so the cron route can return a
 * structured 502 / 401 to the Vercel cron dashboard – silent failure
 * is the worst outcome here because the operator would only notice
 * weeks later when no GSC rows show up in PostHog.
 */
export async function getAccessToken(account: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.expiresAt > now + 60) {
    return cachedToken.token;
  }
  const assertion = signAssertion(account, GSC_SCOPE);
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion,
  });
  const res = await fetch(OAUTH_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(
      `gsc_oauth_failed status=${res.status} body=${errBody.slice(0, 300)}`,
    );
  }
  const payload = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
  };
  if (!payload.access_token || !payload.expires_in) {
    throw new Error("gsc_oauth_malformed_response");
  }
  cachedToken = {
    token: payload.access_token,
    expiresAt: now + payload.expires_in,
  };
  return cachedToken.token;
}
