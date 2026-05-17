import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * Resend webhook handler — closes DCS Secret #6 (Soap Opera) audit gap by
 * capturing every delivery / bounce / complaint / open / click event into
 * public.email_events.
 *
 * Migration: supabase/migrations/20260518000006_email_events.sql
 * Setup script: scripts/setup-resend-webhook-secret.py
 *
 * Wire-up (operator action, one-time):
 *   1. Resend dashboard → Webhooks → Add endpoint:
 *        URL:    https://unlocksaas.com/api/webhooks/resend
 *        Events: email.sent, email.delivered, email.bounced,
 *                email.complained, email.opened, email.clicked
 *   2. Copy the signing secret (whsec_...).
 *   3. Run scripts/setup-resend-webhook-secret.py to write it to
 *      .env.development.local + push to all 3 Vercel environments.
 *
 * Until RESEND_WEBHOOK_SECRET is set, the handler accepts events without
 * signature verification BUT logs a loud warning. This mirrors the
 * existing CRON_SECRET pattern in /api/cron/* handlers (conditional
 * verification keeps dev unblocked, production enforces).
 *
 * Signature verification follows the Svix specification (Resend uses Svix
 * for webhook delivery). Headers:
 *   svix-id        — unique per delivery (used for dedupe in email_events)
 *   svix-timestamp — Unix seconds; the handler does NOT enforce a
 *                    timestamp window because Resend's retry policy can
 *                    redeliver events more than 5 minutes old
 *   svix-signature — space-separated list of "v1,<base64-sig>" entries.
 *                    The HMAC-SHA256 input is `${id}.${timestamp}.${body}`
 *                    using the base64-decoded secret bytes.
 *
 * Side effects beyond inserting the event row:
 *   - email.bounced     → status='bounced'      on every cadence subscriber row
 *   - email.complained  → status='unsubscribed' on every cadence subscriber row
 *
 * Brunson rule for follow-up (Soap Opera + Seinfeld + Founding + Cart
 * Recovery + Challenge): stop chasing the second they reject you.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ResendTag {
  name: string;
  value: string;
}

interface ResendWebhookEvent {
  type: string;
  created_at?: string;
  data: {
    email_id?: string;
    to?: string[] | string;
    tags?: ResendTag[];
    [k: string]: unknown;
  };
}

const ALLOWED_EVENT_TYPES = new Set([
  "email.sent",
  "email.delivered",
  "email.delivery_delayed",
  "email.bounced",
  "email.complained",
  "email.opened",
  "email.clicked",
  "email.failed",
]);

const ALLOWED_SEQUENCES = new Set([
  "soap_opera",
  "seinfeld",
  "founding",
  "cart_recovery",
  "challenge",
  "transactional",
]);

const ALLOWED_DIAGNOSES = new Set([
  "wrong_person",
  "weak_offer",
  "weak_belief",
  "none",
]);

function decodeWhsecSecret(secret: string): Buffer {
  // Svix secrets are stored as `whsec_<base64>`. Strip the prefix and
  // base64-decode to recover the raw HMAC key bytes. Fall back to treating
  // the whole string as UTF-8 if the prefix is absent (rotation grace).
  if (secret.startsWith("whsec_")) {
    return Buffer.from(secret.slice("whsec_".length), "base64");
  }
  return Buffer.from(secret, "utf8");
}

function verifySvixSignature(
  body: string,
  svixId: string,
  svixTimestamp: string,
  svixSignature: string,
  secret: string
): boolean {
  const keyBytes = decodeWhsecSecret(secret);
  const signedPayload = `${svixId}.${svixTimestamp}.${body}`;
  const expected = createHmac("sha256", keyBytes)
    .update(signedPayload)
    .digest();

  // svix-signature is a space-separated list: "v1,<sig1> v1,<sig2> ...".
  // Multiple entries support secret rotation — accept if any matches.
  const candidates = svixSignature.split(" ");
  for (const candidate of candidates) {
    const [version, sigB64] = candidate.split(",");
    if (version !== "v1" || !sigB64) continue;
    let candidateBuf: Buffer;
    try {
      candidateBuf = Buffer.from(sigB64, "base64");
    } catch {
      continue;
    }
    if (candidateBuf.length !== expected.length) continue;
    if (timingSafeEqual(candidateBuf, expected)) {
      return true;
    }
  }
  return false;
}

export async function POST(req: NextRequest) {
  // Body must be read as text once — re-reading the JSON would force a
  // canonical re-serialization that breaks signature verification.
  const body = await req.text();

  const secret = process.env.RESEND_WEBHOOK_SECRET;
  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (secret) {
    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json(
        { error: "missing_svix_headers" },
        { status: 400 }
      );
    }
    const valid = verifySvixSignature(
      body,
      svixId,
      svixTimestamp,
      svixSignature,
      secret
    );
    if (!valid) {
      return NextResponse.json(
        { error: "invalid_signature" },
        { status: 401 }
      );
    }
  } else {
    // Dev / pre-config posture. Loud and ugly on purpose — production
    // should never see this warning.
    console.warn(
      "[resend-webhook] RESEND_WEBHOOK_SECRET is unset — accepting unverified event. " +
        "Run scripts/setup-resend-webhook-secret.py to enable signature verification."
    );
  }

  let event: ResendWebhookEvent;
  try {
    event = JSON.parse(body) as ResendWebhookEvent;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (typeof event.type !== "string" || !ALLOWED_EVENT_TYPES.has(event.type)) {
    // Unknown event type — accept (200) so Resend doesn't retry, but log.
    console.warn("[resend-webhook] unknown_event_type", { type: event.type });
    return NextResponse.json({ ok: true, ignored: "unknown_event_type" });
  }

  const toRaw = Array.isArray(event.data?.to)
    ? event.data.to[0]
    : event.data?.to;
  if (typeof toRaw !== "string" || !toRaw) {
    return NextResponse.json({ ok: true, ignored: "no_recipient" });
  }
  const email = toRaw.toLowerCase();

  // Lift the dispatch-side tags into structured columns.
  const tags = Array.isArray(event.data.tags) ? event.data.tags : [];
  const tagMap = new Map(tags.map((t) => [t.name, t.value]));

  const sequenceRaw = tagMap.get("sequence");
  const sequence =
    sequenceRaw && ALLOWED_SEQUENCES.has(sequenceRaw) ? sequenceRaw : null;

  const emailIndexRaw = tagMap.get("email_index");
  let emailIndex: number | null = null;
  if (emailIndexRaw != null) {
    const parsed = Number(emailIndexRaw);
    if (Number.isInteger(parsed) && parsed >= 0) emailIndex = parsed;
  }

  const diagnosisRaw = tagMap.get("diagnosis");
  const diagnosis =
    diagnosisRaw && ALLOWED_DIAGNOSES.has(diagnosisRaw) ? diagnosisRaw : null;

  const supabase = createAdminClient();
  const { error: insertErr } = await supabase
    .from("email_events" as never)
    .insert({
      event_type: event.type,
      email,
      resend_email_id: event.data.email_id ?? null,
      sequence,
      email_index: emailIndex,
      diagnosis,
      occurred_at: event.created_at ?? new Date().toISOString(),
      payload: event,
      svix_id: svixId,
    } as never);

  if (insertErr) {
    // Postgres unique-violation on svix_id = idempotent webhook replay.
    // Resend's Svix layer retries failed deliveries with the same id; the
    // partial unique index catches this and returns 23505.
    if (insertErr.code === "23505") {
      return NextResponse.json({ ok: true, idempotent: true });
    }
    console.error("[resend-webhook] insert_failed", {
      type: event.type,
      email,
      error: insertErr.message,
    });
    return NextResponse.json(
      { error: "insert_failed", detail: insertErr.message },
      { status: 500 }
    );
  }

  // Brunson rule: stop chasing the second they reject you. Hard bounce
  // and spam complaint both flip every cadence's subscriber row for this
  // email so subsequent cron ticks skip them.
  if (event.type === "email.bounced" || event.type === "email.complained") {
    const newStatus =
      event.type === "email.bounced" ? "bounced" : "unsubscribed";

    // Best-effort: log but do not fail the webhook on any update error.
    // The event row in email_events is the source of truth for the
    // Friday Audible Call.
    const updates = await Promise.allSettled([
      supabase
        .from("soap_opera_subscribers")
        .update({ status: newStatus } as never)
        .eq("email", email),
      supabase
        .from("seinfeld_subscribers" as never)
        .update({ status: newStatus } as never)
        .eq("email", email),
      supabase
        .from("cart_abandonment_subscribers" as never)
        .update({ status: newStatus } as never)
        .eq("email", email),
      supabase
        .from("founding_waitlist" as never)
        .update({ status: newStatus } as never)
        .eq("email", email),
      supabase
        .from("challenge_subscribers" as never)
        .update({ status: newStatus } as never)
        .eq("email", email),
    ]);

    const rejections = updates.filter((r) => r.status === "rejected");
    if (rejections.length > 0) {
      console.warn("[resend-webhook] status_propagation_partial", {
        email,
        new_status: newStatus,
        rejection_count: rejections.length,
      });
    }
  }

  return NextResponse.json({ ok: true, type: event.type });
}
