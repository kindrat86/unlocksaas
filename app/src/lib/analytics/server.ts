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

function isConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_POSTHOG_KEY &&
      process.env.NEXT_PUBLIC_POSTHOG_HOST,
  );
}

function getClient(): PostHog | null {
  if (cached) return cached;
  if (!isConfigured()) return null;

  cached = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
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
  client.capture({
    distinctId,
    event,
    properties: { ...SERVER_EVENT_DEFAULTS, ...properties },
  });
  // shutdownAsync() flushes the queue, but we don't want to kill the client
  // on every webhook — just flush.
  await client.flush();
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
