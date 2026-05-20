import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { verifyUnsubscribeToken } from "@/lib/soap-opera/tokens";


/**
 * GET /api/unsubscribe?email=<addr>&token=<hmac>
 *
 * Public, one-click, no auth — the HMAC token IS the auth. Honoured by both
 * the email footer link and the RFC 8058 List-Unsubscribe header.
 *
 * Returns a tiny HTML confirmation page (200 OK on success, 400 on bad token)
 * so mail-client preview panes and gmail's one-click POST both work.
 *
 * Also accepts POST for List-Unsubscribe-Post=One-Click compliance.
 */
async function handle(email: string, token: string) {
  if (!email || !token) {
    return htmlResponse("Missing email or token.", 400);
  }
  if (!verifyUnsubscribeToken(email, token)) {
    return htmlResponse("Invalid or expired unsubscribe link.", 400);
  }

  const supabase = createAdminClient();
  const lower = email.trim().toLowerCase();
  const nowIso = new Date().toISOString();

  // One token unsubscribes from ALL sequences (Soap Opera, Seinfeld, Founding
  // pre-launch, Cart Abandonment Recovery). The HMAC is keyed on email, not
  // on sequence, so re-issuing per-sequence tokens would just hide rows from
  // the wrong-named footer link. Best UX: one click clears everything.
  // strategy/follow-up-funnels.md Part 8 "unsubscribe semantics."
  const [soapResult, seinfeldResult, foundingResult, cartResult] = await Promise.all([
    supabase
      .from("soap_opera_subscribers")
      .update({ status: "unsubscribed", unsubscribed_at: nowIso })
      .eq("email", lower),
    supabase
      .from("seinfeld_subscribers")
      .update({ status: "unsubscribed", unsubscribed_at: nowIso })
      .eq("email", lower),
    // Cast: founding_waitlist not yet in generated database.types.ts.
    (supabase as unknown as { from: (t: string) => any })
      .from("founding_waitlist")
      .update({ status: "unsubscribed" })
      .ilike("email", lower),
    // Cast: cart_abandonment_subscribers not yet in generated database.types.ts.
    (supabase as unknown as { from: (t: string) => any })
      .from("cart_abandonment_subscribers")
      .update({ status: "unsubscribed", unsubscribed_at: nowIso })
      .ilike("email", lower),
  ]);

  // Founding waitlist + Cart Recovery failures are non-fatal — the tables
  // may not yet exist in environments where migrations 20260518000002 /
  // 20260518000004 haven't been applied. Log and continue. Soap Opera +
  // Seinfeld are the primary sequences; if either of those fails, treat as
  // a real error worth surfacing.
  if (foundingResult.error) {
    console.warn("[unsubscribe] founding_waitlist_update_skipped", {
      email,
      reason: foundingResult.error.message,
    });
  }
  if (cartResult.error) {
    console.warn("[unsubscribe] cart_abandonment_update_skipped", {
      email,
      reason: cartResult.error.message,
    });
  }
  if (soapResult.error || seinfeldResult.error) {
    console.error("[unsubscribe] db_update_failed", {
      email,
      soap_error: soapResult.error?.message,
      seinfeld_error: seinfeldResult.error?.message,
    });
    return htmlResponse("Something went wrong on our end. Please reply to this email and I'll remove you manually. — Maryan", 500);
  }

  return htmlResponse(
    "You're off the list. You will not hear from me again unless you subscribe again. No hard feelings. — Maryan",
    200
  );
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  return handle(
    url.searchParams.get("email") ?? "",
    url.searchParams.get("token") ?? ""
  );
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  // RFC 8058 sends params either in the query string or as form-encoded body.
  // Accept both.
  let email = url.searchParams.get("email") ?? "";
  let token = url.searchParams.get("token") ?? "";
  if (!email || !token) {
    try {
      const form = await req.formData();
      email = email || (form.get("email")?.toString() ?? "");
      token = token || (form.get("token")?.toString() ?? "");
    } catch {
      // body wasn't form-encoded; ignore
    }
  }
  return handle(email, token);
}

function htmlResponse(message: string, status: number) {
  const safe = message
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const body = `<!doctype html>
<html><head><meta charset="utf-8"><title>Unsubscribed</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;background:#f7f7f5;color:#111;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:24px;}main{max-width:480px;background:#fff;padding:32px;border-radius:8px;font-size:16px;line-height:1.6;}</style>
</head><body><main>${safe}</main></body></html>`;
  return new NextResponse(body, {
    status,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
