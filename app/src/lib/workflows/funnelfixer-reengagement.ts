/**
 * FunnelFixer Reengagement Workflow
 *
 * Durable workflow for FunnelFixer carry-over subscriber re-engagement.
 * Replaces 3 crons (activate, tick, testimonial-farm-offer) with a single
 * long-lived workflow per subscriber.
 *
 * Flow:
 * 1. Activate: flip status to active, set next_send_at
 * 2. Send 5 emails, 24h apart
 * 3. Mark complete
 * 4. Grace period: sleep 7 days (allows Stripe webhook hook-resume for early exit)
 * 5. Send one-shot testimonial offer
 *
 * Early-exit hooks:
 * - funnelfixer-converted:{subscriberId}: Stripe webhook triggers when user purchases
 * - funnelfixer-unsubscribed:{subscriberId}: Unsubscribe endpoint triggers
 *
 * All steps keep DB columns in sync (status, emails_sent, last_sent_at, next_send_at)
 * for backward-compat with the monitoring dashboard at /api/monitoring/funnelfixer-status.
 */

import { sleep, createHook, FatalError } from "workflow";
import { createAdminClient } from "@/lib/supabase/server";
import { sendNextAndAdvance, type DueRow } from "@/lib/soap-opera/dispatch";
import { sendTestimonialFarmOffer } from "@/lib/testimonial-farm/dispatch";

// ── Step functions ─────────────────────────────────────────────────────────
// Each function has the "use step" directive and is called from the workflow.
// Steps are retryable and their state survives across deploys.

async function activateSubscriber(subscriberId: string) {
  "use step";

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("soap_opera_subscribers")
    .select("*")
    .eq("id", subscriberId)
    .single();

  if (error || !data) {
    throw new FatalError(`Subscriber not found: ${error?.message ?? "unknown"}`);
  }

  await supabase
    .from("soap_opera_subscribers")
    .update({
      status: "active",
      next_send_at: new Date().toISOString(),
    })
    .eq("id", subscriberId);

  return data;
}

async function sendEmailStep(subscriberId: string, emailIndex: number) {
  "use step";

  const supabase = createAdminClient();
  const { data: current, error } = await supabase
    .from("soap_opera_subscribers")
    .select("*")
    .eq("id", subscriberId)
    .single();

  if (error || !current) {
    throw new FatalError("Subscriber not found during email send");
  }

  // Dispatch the email. This updates the row: increments emails_sent,
  // sets last_sent_at, and (on final email) flips status to complete.
  const dueRow: DueRow = {
    id: current.id,
    email: current.email,
    diagnostic_result: (current.diagnostic_result as any) ?? null,
    emails_sent: current.emails_sent ?? 0,
    source: current.source ?? null,
  };

  const result = await sendNextAndAdvance(dueRow);
  if (!result.ok) {
    // Retry on next step fire (Workflow SDK handles retries).
    throw new Error(`Email send failed: ${result.error}`);
  }
}

async function ensureComplete(subscriberId: string) {
  "use step";

  const supabase = createAdminClient();
  await supabase
    .from("soap_opera_subscribers")
    .update({
      status: "complete",
      next_send_at: null,
    })
    .eq("id", subscriberId);
}

async function checkShouldSendOffer(subscriberId: string): Promise<boolean> {
  "use step";

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("soap_opera_subscribers")
    .select("status")
    .eq("id", subscriberId)
    .single();

  if (error || !data) {
    // Subscriber deleted or not found. Skip offer send.
    return false;
  }

  // Only send if still in complete status (not bounced, unsubscribed, etc.)
  return data.status === "complete";
}

async function sendTestimonialOfferStep(subscriberId: string) {
  "use step";

  const supabase = createAdminClient();
  const { data: subscriber, error } = await supabase
    .from("soap_opera_subscribers")
    .select("*")
    .eq("id", subscriberId)
    .single();

  if (error || !subscriber) {
    throw new FatalError("Subscriber not found during offer send");
  }

  const result = await sendTestimonialFarmOffer({
    id: subscriber.id,
    email: subscriber.email,
  });

  // Honesty gate: if env var not configured, skip without error.
  if (!result.ok && result.error === "payment_link_not_configured") {
    console.warn(
      "[funnelfixer-workflow] testimonial offer skipped: payment_link_not_configured",
      { id: subscriberId }
    );
    return;
  }

  // Other failures are retriable.
  if (!result.ok) {
    throw new Error(`Testimonial offer send failed: ${result.error}`);
  }
}

// ── Main workflow function ─────────────────────────────────────────────────

export async function funnelfixerReengagementWorkflow(subscriberId: string) {
  "use workflow";

  // ── Early-exit hooks ───────────────────────────────────────────────────────
  // These hooks allow external systems (Stripe webhook, unsubscribe endpoint)
  // to signal early completion. The workflow can optionally listen on these.
  // For now, we set them up but rely on DB status checks for simpler logic.
  createHook<{ converted_at: string }>({
    token: `funnelfixer-converted:${subscriberId}`,
  });
  createHook<{ unsubscribed_at: string }>({
    token: `funnelfixer-unsubscribed:${subscriberId}`,
  });

  // ── Activation ─────────────────────────────────────────────────────────────
  await activateSubscriber(subscriberId);

  // ── Email loop: send 5 emails ──────────────────────────────────────────────
  // Each email is sent 24h apart.
  for (let emailIndex = 0; emailIndex < 5; emailIndex++) {
    await sendEmailStep(subscriberId, emailIndex);

    // Wait 24h before next email (except after the final one).
    if (emailIndex < 4) {
      await sleep("24h");
    }
  }

  // ── Mark complete ──────────────────────────────────────────────────────────
  await ensureComplete(subscriberId);

  // ── Grace period: 7 days ───────────────────────────────────────────────────
  // During this time, a Stripe webhook may call resumeHook to signal early exit.
  // If no early exit, we proceed to send the testimonial offer.
  await sleep("7d");

  // ── Check status before sending offer ───────────────────────────────────────
  const shouldSendOffer = await checkShouldSendOffer(subscriberId);

  if (shouldSendOffer) {
    await sendTestimonialOfferStep(subscriberId);
  }

  // ── Workflow complete ──────────────────────────────────────────────────────
}
