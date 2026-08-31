/**
 * Server-side PostHog client for webhook + API route capture.
 *
 * Why a server client: the Stripe webhook is the only place we can capture
 * actual conversions. The browser client only sees clicks. brunson-funnel-metrics
 * needs the conversion events from this file to compute real conversion rates.
 *
 * Pattern notes:
 *   - PostHog Node SDK is fire-and-forget. We use `captureImmediate` for
 *     webhook events because the function may freeze before the background
 *     flush runs.
 *   - We export getter functions instead of singletons because Next.js routes
 *     are evaluated at build time too — initializing on import would crash
 *     `next build` when env vars are absent.
 *   - Pass the Supabase user id as `distinctId` when we know it; otherwise
 *     fall back to the Stripe customer id with a `stripe:` prefix.
 */

import { PostHog } from "posthog-node";
import type { EventName } from "./events";

let cached: PostHog | null = null;

/**
 * Resolve a usable project key, rejecting an unusable env value.
 *
 * Two ways this file has been able to die silently, both observed in this
 * portfolio:
 *   1. Empty string — the Vercel team policy marks new env vars "sensitive"
 *      and bakes empty strings into CI builds. That is what disabled tracking
 *      here after the 2026-07-07 deploy; client.ts grew its fallback for it,
 *      but this file never did, so server capture stayed dead.
 *   2. A display-masked key — sanctionsai.dev's POSTHOG_API_KEY was set to
 *      `phc_ly..` (13 chars, copied out of the dashboard UI). Every event it
 *      sent was discarded, and nothing could detect it: PostHog's capture
 *      endpoint answers 200 {"status":"Ok"} for an unknown key.
 *
 * So validate the key's SHAPE, not its truthiness — a masked value is truthy
 * and passes `Boolean(...)`, `||` and `??` alike. The fallback is the same
 * public, write-only token client.ts already ships in the browser bundle.
 */
const POSTHOG_FALLBACK_KEY = "phc_lyZCgvTpicjLzAO3rY2GhxuX5WUc5jQjP8ZVwwJqauX";

export function resolveKey(): string {
  const key = (process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "").trim();
  if (key.startsWith("phc_") && key.length >= 40 && !key.includes(".")) {
    return key;
  }
  if (key) {
    console.warn(
      `[posthog] NEXT_PUBLIC_POSTHOG_KEY looks masked or malformed ` +
        `(len=${key.length}); using the public project key instead.`,
    );
  }
  return POSTHOG_FALLBACK_KEY;
}

export function resolveHost(): string {
  return (
    (process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "").trim() ||
    "https://eu.i.posthog.com"
  );
}

function getClient(): PostHog | null {
  if (cached) return cached;

  cached = new PostHog(resolveKey(), {
    host: resolveHost(),
    // Serverless functions: flush every event right away. Don't batch — the
    // function will freeze before the batch goes out.
    flushAt: 1,
    flushInterval: 0,
  });
  return cached;
}

/**
 * Fire-and-forget capture for non-critical server events. Will be batched if
 * the function stays warm; lost if the function freezes immediately.
 */
const SERVER_EVENT_DEFAULTS = { $host: "unlocksaas.com", product: "unlocksaas" };

export function captureServer(
  distinctId: string,
  event: EventName,
  properties?: Record<string, unknown>,
): void {
  const client = getClient();
  if (!client) return;
  client.capture({
    distinctId,
    event,
    properties: { ...SERVER_EVENT_DEFAULTS, ...properties },
  });
}

/**
 * Critical capture for webhook events. Awaits the flush so the function
 * does not freeze before the event hits PostHog. Use this for Stripe
 * webhook conversions — they're the events brunson-funnel-metrics cares
 * about most.
 */
export async function captureServerAndFlush(
  distinctId: string,
  event: EventName,
  properties?: Record<string, unknown>,
): Promise<void> {
  const client = getClient();
  if (!client) return;
  await client.captureImmediate({
    distinctId,
    event,
    properties: { ...SERVER_EVENT_DEFAULTS, ...properties },
  });
}

/**
 * Identify a user (associate distinctId with persistent properties). Useful
 * inside auth callback to seed the user record before any client events
 * arrive.
 */
export async function identifyServer(
  distinctId: string,
  properties: Record<string, unknown>,
): Promise<void> {
  const client = getClient();
  if (!client) return;
  client.identify({
    distinctId,
    properties,
  });
  await client.flush();
}

/**
 * Distinct-id helper. Prefer Supabase user id (persists across sessions);
 * then the client_reference_id we stamped on the Checkout Session at
 * creation time (ties the purchase back to the exact browser distinct_id
 * that clicked through the funnel — this is what makes click→purchase
 * attribution possible instead of every revenue event landing under an
 * unattributed `stripe:cus_*` id with no prior funnel history); finally
 * fall back to the stripe: prefix so server events on anonymous purchases
 * still attach cleanly.
 */
export function stripeDistinctId(
  stripeCustomerId: string | null | undefined,
  supabaseUserId?: string | null,
  clientReferenceId?: string | null,
): string {
  if (supabaseUserId) return supabaseUserId;
  if (clientReferenceId && clientReferenceId !== "anonymous") return clientReferenceId;
  if (stripeCustomerId) return `stripe:${stripeCustomerId}`;
  return "anonymous";
}
