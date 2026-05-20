/**
 * POST /api/webhooks/resend
 *
 * Receives delivery-status events from Resend (Svix-signed). Two roles:
 *
 *   1. Suppression: `email.bounced` and `email.complained` flip the
 *      corresponding subscriber row across all 4 funnel tables to
 *      status='bounced' or 'complained'. Cron senders already filter
 *      status='active', so the flip is enough to stop the sequence.
 *
 *   2. Engagement: `email.opened`, `email.clicked`, `email.delivered` are
 *      written as one row each into `funnel_email_events`. The dashboard
 *      builder aggregates these into per-subscriber open and click rates,
 *      deduping multi-fires by resend_email_id.
 *
 * Idempotent for suppression: re-receiving a bounce is a no-op if the row is
 * already in the target status. Engagement events are append-only — opens
 * fire multiple times via pixel reloads, and the dashboard dedupes by
 * resend_email_id at query time rather than enforcing a unique constraint.
 *
 * Configuration (manual, one-time):
 *   1. Add env var RESEND_WEBHOOK_SECRET (starts with `whsec_…`) to Vercel
 *      preview + production environments.
 *   2. In the Resend dashboard, add an endpoint pointing to
 *      https://unlocksaas.com/api/webhooks/resend and subscribe it to
 *      `email.bounced`, `email.complained`, `email.opened`, `email.clicked`,
 *      `email.delivered` events.
 *
 * Svix signature scheme (verbatim from Resend/Svix docs):
 *   - Headers: svix-id, svix-timestamp, svix-signature
 *   - Signed payload: `${id}.${timestamp}.${body}`
 *   - HMAC-SHA256 with the base64-decoded secret (after stripping `whsec_`)
 *   - Compare against `v1,<base64>` entries in svix-signature
 */

import { NextRequest } from "next/server";
import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/server";
import { FUNNEL_TABLES } from "@/lib/double-opt-in";


/** Tolerate up to 5 minutes of clock skew between Resend and us. */
const MAX_TIMESTAMP_SKEW_S = 5 * 60;

interface ResendEvent {
  type: string;
  data?: {
    email_id?: string;
    to?: string | string[];
    from?: string;
    subject?: string;
    bounce?: { type?: string; subType?: string };
    /** Present on email.clicked events. */
    click?: { link?: string };
  };
}

function jsonResponse(
  body: Record<string, unknown>,
  status = 200
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Verifies the Svix signature. Returns true if any of the comma-separated
 * `v1,<sig>` entries matches our computed HMAC.
 */
function verifySvixSignature(
  rawBody: string,
  headers: { id: string; timestamp: string; signature: string },
  secret: string
): boolean {
  // Strip the whsec_ prefix and base64-decode to get the raw HMAC key.
  const cleanSecret = secret.startsWith("whsec_")
    ? secret.slice("whsec_".length)
    : secret;
  let key: Buffer;
  try {
    key = Buffer.from(cleanSecret, "base64");
  } catch {
    return false;
  }

  const ts = parseInt(headers.timestamp, 10);
  if (!Number.isFinite(ts)) return false;
  const nowS = Math.floor(Date.now() / 1000);
  if (Math.abs(nowS - ts) > MAX_TIMESTAMP_SKEW_S) return false;

  const signedPayload = `${headers.id}.${headers.timestamp}.${rawBody}`;
  const expected = crypto
    .createHmac("sha256", key)
    .update(signedPayload)
    .digest("base64");

  // svix-signature can carry multiple "v1,<sig>" entries separated by spaces.
  const candidates = headers.signature.split(" ");
  for (const c of candidates) {
    const [, sig] = c.split(",", 2);
    if (!sig) continue;
    if (sig.length !== expected.length) continue;
    if (
      crypto.timingSafeEqual(
        Buffer.from(sig, "utf8"),
        Buffer.from(expected, "utf8")
      )
    ) {
      return true;
    }
  }
  return false;
}

export async function POST(req: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[resend-webhook] missing RESEND_WEBHOOK_SECRET env var");
    return jsonResponse({ error: "not_configured" }, 503);
  }

  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) {
    return jsonResponse({ error: "missing_svix_headers" }, 400);
  }

  const rawBody = await req.text();
  const ok = verifySvixSignature(
    rawBody,
    {
      id: svixId,
      timestamp: svixTimestamp,
      signature: svixSignature,
    },
    secret
  );
  if (!ok) {
    console.warn("[resend-webhook] signature_mismatch");
    return jsonResponse({ error: "invalid_signature" }, 401);
  }

  let event: ResendEvent;
  try {
    event = JSON.parse(rawBody) as ResendEvent;
  } catch {
    return jsonResponse({ error: "invalid_json" }, 400);
  }

  const type = event?.type ?? "";

  // Engagement events: opened / clicked / delivered → append-only event log.
  // These don't mutate subscriber status; the dashboard aggregates from
  // funnel_email_events. Return early after logging.
  const engagementMap: Record<string, "opened" | "clicked" | "delivered"> = {
    "email.opened": "opened",
    "email.clicked": "clicked",
    "email.delivered": "delivered",
  };
  const engagementType = engagementMap[type];
  if (engagementType) {
    const toRawE = event?.data?.to;
    const toEmailE = Array.isArray(toRawE) ? toRawE[0] : toRawE;
    if (!toEmailE || typeof toEmailE !== "string") {
      return jsonResponse({ ok: true, skipped: "no_to_address", type });
    }
    const emailE = toEmailE.trim().toLowerCase();
    const supabaseE = createAdminClient() as unknown as {
      from: (t: string) => {
        insert: (vals: Record<string, unknown>) => Promise<{
          error: { message: string } | null;
        }>;
      };
    };
    const { error: insertError } = await supabaseE
      .from("funnel_email_events")
      .insert({
        email: emailE,
        resend_email_id: event?.data?.email_id ?? null,
        event_type: engagementType,
        raw: event as unknown as Record<string, unknown>,
      });
    if (insertError) {
      console.error("[resend-webhook] insert_failed", {
        type,
        email: emailE,
        error: insertError.message,
      });
      return jsonResponse({ error: "insert_failed" }, 500);
    }
    return jsonResponse({ ok: true, type, event_type: engagementType, email: emailE });
  }

  let targetStatus: "bounced" | "complained" | null = null;
  if (type === "email.bounced") targetStatus = "bounced";
  else if (type === "email.complained") targetStatus = "complained";

  if (!targetStatus) {
    // Other event types we don't currently handle – ignore.
    return jsonResponse({ ok: true, ignored: true, type });
  }

  // Resolve the affected address. `to` can be string or string[].
  const toRaw = event?.data?.to;
  const toEmail = Array.isArray(toRaw) ? toRaw[0] : toRaw;
  if (!toEmail || typeof toEmail !== "string") {
    return jsonResponse({ ok: true, skipped: "no_to_address" });
  }
  const email = toEmail.trim().toLowerCase();

  // Cast around generated database.types.ts: we iterate funnel-table names
  // at runtime, and founding_waitlist isn't in the generated type yet.
  const supabase = createAdminClient() as unknown as {
    from: (t: string) => {
      update: (vals: Record<string, unknown>) => {
        eq: (col: string, val: string) => {
          in: (col: string, vals: string[]) => {
            select: (cols: string) => Promise<{
              data: Array<{ id: string }> | null;
              error: { message: string } | null;
            }>;
          };
        };
      };
    };
  };
  const updates: Array<{ table: string; updated: number; error?: string }> = [];

  // Update across all 4 funnel tables. Each table uniquely keys email so
  // updates are scoped naturally.
  for (const table of Object.values(FUNNEL_TABLES)) {
    // We update only rows not already in a terminal stop state to keep the
    // event idempotent and avoid clobbering unsubscribes/completions.
    // Status-only update keeps the webhook portable across tables – only
    // some of them carry a `last_error` column.
    const { data, error } = await supabase
      .from(table)
      .update({ status: targetStatus })
      .eq("email", email)
      .in("status", ["active", "pending_confirmation", "paused"])
      .select("id");
    if (error) {
      updates.push({ table, updated: 0, error: error.message });
    } else {
      updates.push({ table, updated: data?.length ?? 0 });
    }
  }

  console.log("[resend-webhook] processed", {
    type,
    targetStatus,
    email,
    updates,
  });

  return jsonResponse({
    ok: true,
    type,
    targetStatus,
    email,
    updates,
  });
}
