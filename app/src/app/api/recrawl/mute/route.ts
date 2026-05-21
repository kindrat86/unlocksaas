import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { verifyRecrawlMuteToken } from "@/lib/recrawl-tokens";

/**
 * GET /api/recrawl/mute?email=<addr>&token=<hmac>
 *
 * One-click mute for the weekly recrawl-agent delta alert. Stateless HMAC
 * token IS the auth (no session required — the link is in the email and
 * the founder shouldn't have to log in to act on it).
 *
 * Sets profiles.recrawl_alerts_enabled = false. The cron checks this flag
 * and records a `skipped_optout` audit row on subsequent runs, never sending
 * the alert. The trend snapshots themselves continue accruing — the
 * dashboard surface still works; only the email channel goes quiet.
 *
 * Also accepts POST for RFC 8058 List-Unsubscribe-Post=One-Click compliance
 * (gmail / outlook fire a POST on the privacy-protected unsubscribe button).
 */
async function handle(email: string, token: string) {
  if (!email || !token) {
    return htmlResponse("Missing email or token.", 400);
  }
  if (!verifyRecrawlMuteToken(email, token)) {
    return htmlResponse("Invalid or expired mute link.", 400);
  }

  const supabase = createAdminClient();
  const lower = email.trim().toLowerCase();

  // Cast to unknown to handle the ungenerated recrawl_alerts_enabled column
  const profilesClient = supabase as unknown as {
    from: (t: string) => {
      update: (obj: { recrawl_alerts_enabled: boolean }) => {
        ilike: (
          col: string,
          val: string
        ) => Promise<{ error: { message: string } | null }>;
      };
    };
  };

  const { error } = await profilesClient
    .from("profiles")
    .update({ recrawl_alerts_enabled: false })
    .ilike("email", lower);

  if (error) {
    console.error("[recrawl-mute] db_update_failed", {
      email,
      message: error.message,
    });
    return htmlResponse(
      "Something went wrong on our end. Reply to the email and I'll mute you manually. — Maryan",
      500
    );
  }

  return htmlResponse(
    `<strong>Weekly re-score alerts are muted.</strong><br>You'll still see your scores in the dashboard. — Maryan`,
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
  // RFC 8058 one-click POST may carry params in the URL or in
  // application/x-www-form-urlencoded body. Accept both.
  let email = url.searchParams.get("email") ?? "";
  let token = url.searchParams.get("token") ?? "";
  if (!email || !token) {
    try {
      const text = await req.text();
      const params = new URLSearchParams(text);
      email = email || params.get("email") || "";
      token = token || params.get("token") || "";
    } catch {
      // body parse failure is non-fatal — handle() will 400 on missing args.
    }
  }
  return handle(email, token);
}

function htmlResponse(body: string, status: number) {
  return new NextResponse(
    `<!doctype html><html><head><meta charset="utf-8"><title>UnlockSaaS</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;max-width:480px;margin:80px auto;padding:0 24px;color:#111;line-height:1.6}</style></head><body><p>${body}</p></body></html>`,
    {
      status,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    }
  );
}
