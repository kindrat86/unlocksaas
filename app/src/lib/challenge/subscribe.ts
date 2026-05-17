/**
 * Shared subscribe-to-Challenge helper.
 *
 * Used by:
 *   - POST /api/challenge/subscribe (the /challenge opt-in form)
 *   - any future surface that wants to drop a user into the 14-Day Sprint
 *     (e.g. a referral flow, an in-product upsell-down ramp)
 *
 * Responsibilities:
 *   1. Upsert into challenge_subscribers (idempotent on lower(email)).
 *      Repeat-submit resets the sequence to Day 0 — intentional, matches the
 *      Soap Opera convention. Most repeats are users coming back to restart
 *      after missing a Day.
 *   2. Send Day 0 (welcome + rule) via the dispatcher.
 *   3. Advance emails_sent → 1 and set next_send_at = now + 24h on success.
 *
 * Schema reference: supabase/migrations/20260518000001_challenge_subscribers.sql
 */

import { createAdminClient } from "@/lib/supabase/server";
import { sendNextAndAdvance } from "./dispatch";
import {
  ALLOWED_IDENTITY_VARIANTS,
  type IdentityVariant,
} from "../soap-opera/subscribe";

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface SubscribeInput {
  email: string;
  first_name: string;
  product_url: string | null;
  source: string;
  identity_variant: IdentityVariant | null;
}

export type SubscribeOutcome =
  | { ok: true; id: string; day_0_send: "ok" }
  | { ok: false; reason: "invalid_email" }
  | { ok: false; reason: "invalid_first_name" }
  | { ok: false; reason: "db_upsert_failed"; detail?: string }
  | { ok: false; id: string; reason: "day_0_send_failed"; detail?: string };

export async function subscribeToChallenge(
  input: SubscribeInput
): Promise<SubscribeOutcome> {
  const emailRaw = input.email.trim().toLowerCase();
  if (!emailRaw || !EMAIL_RE.test(emailRaw)) {
    return { ok: false, reason: "invalid_email" };
  }

  const firstName = input.first_name.trim();
  if (!firstName || firstName.length > 60) {
    return { ok: false, reason: "invalid_first_name" };
  }

  const productUrl =
    input.product_url && input.product_url.trim().length > 0
      ? input.product_url.trim().slice(0, 2048)
      : null;

  const supabase = createAdminClient();
  const nowIso = new Date().toISOString();

  // `as never` casts match the dual-schema reconciliation pattern used in
  // machine/page.tsx — the migration shipped (20260518000001) but the
  // generated database.types.ts has not been regenerated yet. Row type
  // narrowing happens explicitly below via the rowTyped → row cast.
  const { data: rowTyped, error: upsertError } = await supabase
    .from("challenge_subscribers" as never)
    .upsert(
      {
        email: emailRaw,
        first_name: firstName,
        product_url: productUrl,
        identity_variant: input.identity_variant,
        source: input.source,
        status: "active",
        emails_sent: 0,
        subscribed_at: nowIso,
        completed_at: null,
        last_sent_at: null,
        next_send_at: null,
        last_error: null,
        unsubscribed_at: null,
      } as never,
      { onConflict: "email" }
    )
    .select("id, email, first_name, emails_sent")
    .single();

  if (upsertError || !rowTyped) {
    console.error("[challenge-subscribe] upsert_failed", {
      email: emailRaw,
      source: input.source,
      error: upsertError?.message,
    });
    return {
      ok: false,
      reason: "db_upsert_failed",
      detail: upsertError?.message,
    };
  }

  const row = rowTyped as unknown as {
    id: string;
    email: string;
    first_name: string;
    emails_sent: number;
  };

  // Send Day 0 inline. The dispatcher advances emails_sent → 1 and sets
  // next_send_at = now + 24h on success. On failure, emails_sent stays at 0
  // and the cron WILL NOT retry (cron filters emails_sent >= 1). The caller
  // can re-invoke subscribeToChallenge() to retry the welcome.
  const dispatch = await sendNextAndAdvance({
    id: row.id,
    email: row.email,
    first_name: row.first_name,
    emails_sent: row.emails_sent,
  });

  if (!dispatch.ok) {
    return {
      ok: false,
      id: row.id,
      reason: "day_0_send_failed",
      detail: dispatch.error,
    };
  }

  console.log("[challenge-subscribe] ok", {
    email: emailRaw,
    source: input.source,
    identity_variant: input.identity_variant,
  });

  return { ok: true, id: row.id, day_0_send: "ok" };
}

export function coerceIdentityVariant(value: unknown): IdentityVariant | null {
  if (typeof value !== "string") return null;
  return (ALLOWED_IDENTITY_VARIANTS as readonly string[]).includes(value)
    ? (value as IdentityVariant)
    : null;
}
