import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { isValidLeadId } from "@/lib/diagnostic-share";

/**
 * Brunson DCS Chapter 11 (The Best Bait) — share endpoint.
 *
 *   POST /api/diagnostic/[id]/share
 *     body: { email, action: 'publish' | 'revoke' }
 *   200:   { id, share_visibility, share_url? }
 *   401:   email doesn't own the diagnosis (or row doesn't exist)
 *   404:   id not a UUID, or no such row
 *
 * Consent model: the diagnostic_leads row was created with the founder's
 * email. To flip share_visibility to 'public' we require the same email to
 * be passed back in the body. That's the consent gate — the email is the
 * proof of ownership of the diagnosis.
 *
 * NOT a strong auth boundary. Brunson rule: the diagnostic is free, the
 * stakes of the public artifact are low, and the cost of friction (full
 * Supabase magic-link auth before share) exceeds the cost of a leak. If
 * abuse appears we tighten to magic-link verification (the same handler
 * the OAuth flow already supports).
 *
 * Why not just a session cookie: the diagnostic flow doesn't authenticate
 * the visitor by design — it's a cold-traffic squeeze. The email entered
 * at the bottom of the form is the only handle we have, so we use it.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function siteOrigin(req: NextRequest): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (env) return env.replace(/\/+$/, "");
  const host = req.headers.get("host");
  if (host) {
    const proto =
      req.headers.get("x-forwarded-proto") ??
      (host.includes("localhost") ? "http" : "https");
    return `${proto}://${host}`;
  }
  return "https://unlocksaas.com";
}

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  if (!isValidLeadId(id)) {
    return NextResponse.json({ error: "Invalid diagnosis id." }, { status: 404 });
  }

  let body: { email?: unknown; action?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Enter the email you used when you ran the diagnosis." },
      { status: 400 },
    );
  }

  const rawAction = typeof body.action === "string" ? body.action.trim() : "";
  const action: "publish" | "revoke" =
    rawAction === "revoke" ? "revoke" : "publish";

  const supabase = createAdminClient();

  // Ownership check: the email on the row must match the email in the body
  // (case-insensitive). If the row doesn't exist OR the email doesn't match,
  // return 401 without leaking which one it is.
  const { data: existing, error: readErr } = await supabase
    .from("diagnostic_leads")
    .select("id, email, label, share_visibility, shared_at")
    .eq("id", id)
    .maybeSingle();

  if (readErr) {
    console.error("[diagnostic/share] read failed", readErr);
    return NextResponse.json(
      { error: "Could not verify the diagnosis. Try again in a minute." },
      { status: 500 },
    );
  }
  if (!existing) {
    return NextResponse.json(
      { error: "I do not have a record of that diagnosis." },
      { status: 401 },
    );
  }
  // `as unknown as` bridge until Supabase types regenerate with the new
  // share_visibility column (migration 20260518000007).
  const existingRow = existing as unknown as {
    id: string;
    email: string | null;
    label: string | null;
    share_visibility: "private" | "public" | "revoked" | null;
    shared_at: string | null;
  };
  const existingEmail =
    typeof existingRow.email === "string"
      ? existingRow.email.trim().toLowerCase()
      : "";
  if (existingEmail !== email.toLowerCase()) {
    return NextResponse.json(
      { error: "That email doesn't match the diagnosis." },
      { status: 401 },
    );
  }

  // 'error' rows never go public. The bait amplification is for the three
  // labeled outcomes only.
  const label = existingRow.label ?? "";
  if (label !== "wrong_person" && label !== "weak_offer" && label !== "weak_belief") {
    return NextResponse.json(
      { error: "Engine-error diagnoses can't be shared." },
      { status: 409 },
    );
  }

  const now = new Date().toISOString();

  const update: {
    share_visibility: "public" | "revoked";
    shared_at?: string;
    share_revoked_at?: string | null;
  } =
    action === "publish"
      ? {
          share_visibility: "public",
          // First-time publish stamps shared_at. Re-publish after revoke
          // keeps the original shared_at (don't overwrite first-public date).
          ...(existingRow.shared_at ? {} : { shared_at: now }),
          share_revoked_at: null,
        }
      : {
          share_visibility: "revoked",
          share_revoked_at: now,
        };

  const { error: updateErr } = await supabase
    .from("diagnostic_leads")
    .update(update)
    .eq("id", id);

  if (updateErr) {
    console.error("[diagnostic/share] update failed", updateErr);
    return NextResponse.json(
      { error: "Could not save the share state. Try again in a minute." },
      { status: 500 },
    );
  }

  const origin = siteOrigin(req);
  return NextResponse.json({
    id,
    share_visibility: update.share_visibility,
    share_url:
      update.share_visibility === "public"
        ? `${origin}/diagnosis/${id}`
        : null,
  });
}
