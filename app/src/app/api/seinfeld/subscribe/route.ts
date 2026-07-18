import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { nextSendAt } from "@/lib/seinfeld/schedule";
import { verifyDeliverableEmail } from "@/lib/email-verification";
import {
  newConfirmationToken,
  sendConfirmationEmail,
} from "@/lib/double-opt-in";
import { guardPublicForm, honeypotTripped } from "@/lib/form-guard";


const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_SOURCES = ["soap_opera_graduate", "manual"] as const;
type Source = (typeof ALLOWED_SOURCES)[number];

interface SubscribeBody {
  email?: unknown;
  source?: unknown;
  /** Honeypot — humans leave it empty. See @/lib/form-guard. */
  _gotcha?: unknown;
}

/**
 * POST /api/seinfeld/subscribe
 *
 * Adds (or refreshes) a Seinfeld subscriber. Unlike /api/soap-opera/subscribe,
 * this endpoint does NOT send an email immediately — Seinfeld is a Mon/Wed/Fri
 * cadence with no "Day 0" semantics. The next cron tick on a send day picks
 * the subscriber up.
 *
 * Defaults source to 'manual'. The cron is the only thing that should ever
 * use 'soap_opera_graduate'.
 *
 * Idempotency: upserts on email. A repeat submit refreshes status to active
 * and clears last_error, but PRESERVES rotation state (current_index,
 * sends_count) so subscribers re-added after a bounce-recovery don't restart
 * the rotation.
 */
export async function POST(req: NextRequest) {
  // Rate limit + BotID, same stack as /api/checkout — accepted emails end
  // up in a Resend-dispatching rotation.
  const guarded = await guardPublicForm(req, "seinfeld-subscribe");
  if (guarded) return guarded;

  let body: SubscribeBody;
  try {
    body = (await req.json()) as SubscribeBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // Honeypot tripped: plausible fake success, no send, no DB write.
  if (honeypotTripped(body as Record<string, unknown>)) {
    return NextResponse.json({ ok: true, subscribed: true, created: true });
  }

  const emailRaw =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!emailRaw || !EMAIL_RE.test(emailRaw)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const sourceRaw = typeof body.source === "string" ? body.source : "manual";
  const source: Source = (ALLOWED_SOURCES as readonly string[]).includes(sourceRaw)
    ? (sourceRaw as Source)
    : "manual";

  // 'soap_opera_graduate' is cron-only: those subscribers already confirmed
  // via the Soap Opera double opt-in flow, so we skip re-verification.
  // 'manual' covers admin enrolls and direct opt-in forms – those need MX +
  // confirmation.
  const needsVerification = source === "manual";

  if (needsVerification) {
    const deliverability = await verifyDeliverableEmail(emailRaw);
    if (!deliverability.ok) {
      return NextResponse.json(
        { error: "undeliverable_email", detail: deliverability.reason },
        { status: 400 },
      );
    }
  }

  const supabase = createAdminClient();

  // Two-step so we can preserve rotation state on update. (PostgreSQL upsert
  // via .upsert({...}) would clobber current_index/sends_count to defaults.)
  const { data: existing } = await supabase
    .from("seinfeld_subscribers")
    .select("id")
    .eq("email", emailRaw)
    .maybeSingle();

  if (existing) {
    const { error: updateError } = await supabase
      .from("seinfeld_subscribers")
      .update({
        status: "active",
        last_error: null,
        unsubscribed_at: null,
        source,
      })
      .eq("id", existing.id);

    if (updateError) {
      console.error("[seinfeld-subscribe] db_update_failed", {
        email: emailRaw,
        error: updateError.message,
      });
      return NextResponse.json(
        { error: "db_update_failed", detail: updateError.message },
        { status: 500 },
      );
    }
    console.log("[seinfeld-subscribe] refreshed", { email: emailRaw, source });
    return NextResponse.json({
      ok: true,
      subscribed: true,
      created: false,
      next_send_at: nextSendAt().toISOString(),
    });
  }

  // Manual signups land as pending_confirmation; soap_opera_graduate signups
  // are already verified (the cron only enrolls subscribers who completed
  // the Soap Opera flow, where double opt-in already happened).
  const initialStatus = needsVerification ? "pending_confirmation" : "active";
  const confirmationToken = needsVerification ? newConfirmationToken() : null;
  const nowIso = new Date().toISOString();

  // `as never` cast: confirmation_token / confirmation_sent_at land via
  // migration 20260518000020; database.types.ts not regenerated yet.
  const { error: insertError } = await supabase
    .from("seinfeld_subscribers")
    .insert({
      email: emailRaw,
      source,
      status: initialStatus,
      confirmation_token: confirmationToken,
      confirmation_sent_at: needsVerification ? nowIso : null,
    } as never);

  if (insertError) {
    console.error("[seinfeld-subscribe] db_insert_failed", {
      email: emailRaw,
      error: insertError.message,
    });
    return NextResponse.json(
      { error: "db_insert_failed", detail: insertError.message },
      { status: 500 },
    );
  }

  if (needsVerification && confirmationToken) {
    const sendResult = await sendConfirmationEmail({
      list: "seinfeld",
      email: emailRaw,
      token: confirmationToken,
    });
    if (!sendResult.ok) {
      console.error("[seinfeld-subscribe] confirmation_send_failed", {
        email: emailRaw,
        error: sendResult.error,
      });
      return NextResponse.json(
        {
          ok: false,
          subscribed: true,
          confirmation_send: "failed",
          error: sendResult.error,
        },
        { status: 502 },
      );
    }
    console.log("[seinfeld-subscribe] pending_confirmation", {
      email: emailRaw,
      source,
    });
    return NextResponse.json({
      ok: true,
      subscribed: true,
      created: true,
      pending_confirmation: true,
    });
  }

  console.log("[seinfeld-subscribe] created", { email: emailRaw, source });
  return NextResponse.json({
    ok: true,
    subscribed: true,
    created: true,
    next_send_at: nextSendAt().toISOString(),
  });
}
