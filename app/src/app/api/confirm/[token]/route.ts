/**
 * GET /api/confirm/[token]?list=<funnel>
 *
 * The landing point for every double-opt-in confirmation link. Users click this
 * from a "confirm your subscription" email; on success we:
 *   1. Flip status pending_confirmation → active
 *   2. Null out confirmation_token (single-use)
 *   3. Trigger the real Day 0 marketing send (Soap Opera / Challenge / Founding).
 *      Seinfeld has no Day 0 – its cron picks the row up on the next Mon/Wed/Fri.
 *
 * Renders a minimal HTML success/error page directly. We don't bounce to a
 * Next.js page so this route stays self-contained and works even before the
 * confirm landing page is polished.
 *
 * The `list` query param picks the table to look in. Mismatched / missing list
 * → 400.
 */

import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import {
  FUNNEL_TABLES,
  type FunnelList,
} from "@/lib/double-opt-in";
import type { DiagnosticResult } from "@/lib/soap-opera/emails";


const VALID_LISTS = new Set<FunnelList>([
  "soap_opera",
  "seinfeld",
  "challenge",
  "founding",
]);

function htmlResponse(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function pageShell(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} – UnlockSaaS</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 520px; margin: 80px auto; padding: 0 24px; color: #111; line-height: 1.55; }
    h1 { font-size: 24px; margin: 0 0 12px; }
    p { margin: 12px 0; color: #333; }
    a { color: #0a58ca; }
    .ok { color: #0a7a2a; }
    .err { color: #8a1a1a; }
  </style>
</head>
<body>
  ${bodyHtml}
  <p style="margin-top: 32px; font-size: 14px; color: #666;">– Maryan · <a href="https://unlocksaas.com">unlocksaas.com</a></p>
</body>
</html>`;
}

interface RouteContext {
  params: Promise<{ token: string }>;
}

export async function GET(req: NextRequest, ctx: RouteContext) {
  const { token } = await ctx.params;
  const list = (req.nextUrl.searchParams.get("list") ?? "") as FunnelList;

  if (!token || !VALID_LISTS.has(list)) {
    return htmlResponse(
      pageShell(
        "Invalid link",
        `<h1>Invalid confirmation link</h1>
         <p class="err">This link is malformed. Make sure you copied the whole URL from the email.</p>`
      ),
      400
    );
  }

  const table = FUNNEL_TABLES[list];
  // Cast around generated database.types.ts: `table` is a runtime-chosen
  // string and `confirmation_token` is added by migration 20260518000020 which
  // the type generator hasn't picked up yet.
  const supabase = createAdminClient() as unknown as {
    from: (t: string) => {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          maybeSingle: () => Promise<{
            data: {
              id: string;
              email: string;
              status: string;
              confirmation_sent_at: string | null;
            } | null;
            error: { message: string } | null;
          }>;
        };
      };
      update: (vals: Record<string, unknown>) => {
        eq: (col: string, val: string) => Promise<{
          error: { message: string } | null;
        }>;
      };
    };
  };

  // Look up the subscriber by token (token is unique-per-table where not null).
  const { data: row, error: fetchErr } = await supabase
    .from(table)
    .select("id, email, status, confirmation_sent_at")
    .eq("confirmation_token", token)
    .maybeSingle();

  if (fetchErr) {
    console.error("[confirm] db_lookup_failed", {
      list,
      error: fetchErr.message,
    });
    return htmlResponse(
      pageShell(
        "Something went wrong",
        `<h1>Something went wrong</h1>
         <p class="err">Couldn't verify your confirmation right now. Please try again in a minute – or reply to the confirmation email and I'll fix it manually.</p>`
      ),
      500
    );
  }

  if (!row) {
    // Token doesn't match anything. Could be: already-confirmed (token nulled),
    // bogus link, or expired link. We can't distinguish without more state,
    // and a friendly "already confirmed?" hint covers both common cases.
    return htmlResponse(
      pageShell(
        "Already confirmed (or invalid)",
        `<h1>This link is no longer active</h1>
         <p>That confirmation link doesn't match anything in our system. Two likely reasons:</p>
         <ul>
           <li>You already clicked it – in which case you're confirmed, and Email 1 is already on its way.</li>
           <li>The link is incorrect – try copy/pasting the full URL from the email.</li>
         </ul>
         <p>If neither applies, just reply to the confirmation email and I'll sort it.</p>`
      ),
      404
    );
  }

  // If they're already active (very fast double-click), short-circuit success.
  if (row.status === "active") {
    return htmlResponse(
      pageShell(
        "You're confirmed",
        `<h1 class="ok">You're confirmed ✓</h1>
         <p>Check your inbox – Email 1 is on its way (usually within a minute).</p>`
      )
    );
  }

  if (row.status !== "pending_confirmation") {
    // unsubscribed / bounced / complained – refuse to reactivate.
    return htmlResponse(
      pageShell(
        "Can't confirm this address",
        `<h1>Can't confirm this address</h1>
         <p>This subscription is in state <code>${row.status}</code>. Reply to <a href="mailto:maryan@unlocksaas.com">maryan@unlocksaas.com</a> if you want to re-enable it.</p>`
      ),
      409
    );
  }

  // Activate: flip status, null the token so it can't be reused.
  const { error: updateErr } = await supabase
    .from(table)
    .update({
      status: "active",
      confirmation_token: null,
    })
    .eq("id", row.id);

  if (updateErr) {
    console.error("[confirm] activation_update_failed", {
      list,
      id: row.id,
      error: updateErr.message,
    });
    return htmlResponse(
      pageShell(
        "Something went wrong",
        `<h1>Something went wrong</h1>
         <p class="err">Couldn't activate your subscription. Try the link again in a minute.</p>`
      ),
      500
    );
  }

  // Trigger Day 0 for funnels that have one. We do this best-effort: if the
  // send fails, the subscription is still active and the cron-driven retry
  // path (where applicable) will pick it up on the next tick.
  await triggerDayZero(list, row.id);

  return htmlResponse(
    pageShell(
      "You're confirmed",
      `<h1 class="ok">You're confirmed ✓</h1>
       <p>Email 1 is on its way. Check your inbox in the next minute or two – if it doesn't show, look in Promotions / Spam and drag it to the main inbox.</p>`
    )
  );
}

/**
 * Dispatch the Day 0 email for the freshly-activated subscriber. Each funnel
 * uses a slightly different signature; this function is the single place we
 * adapt between them.
 *
 * Seinfeld has no Day 0 send – the cron handles all sends on Mon/Wed/Fri.
 */
async function triggerDayZero(list: FunnelList, id: string): Promise<void> {
  try {
    if (list === "soap_opera") {
      const { sendNextAndAdvance } = await import("@/lib/soap-opera/dispatch");
      const supabase = createAdminClient();
      const { data: r } = await supabase
        .from("soap_opera_subscribers")
        .select("id, email, diagnostic_result, emails_sent, source")
        .eq("id", id)
        .single();
      if (r) {
        await sendNextAndAdvance({
          id: r.id,
          email: r.email,
          diagnostic_result: r.diagnostic_result as DiagnosticResult | null,
          emails_sent: r.emails_sent,
          source: (r as { source?: string | null }).source ?? null,
        });
      }
      return;
    }
    if (list === "challenge") {
      const { sendNextAndAdvance } = await import("@/lib/challenge/dispatch");
      const supabase = createAdminClient();
      const { data: r } = await supabase
        .from("challenge_subscribers")
        .select("id, email, first_name, emails_sent")
        .eq("id", id)
        .single();
      if (r) {
        await sendNextAndAdvance({
          id: r.id,
          email: r.email,
          first_name: r.first_name,
          emails_sent: r.emails_sent,
        });
      }
      return;
    }
    if (list === "founding") {
      const { sendNextFoundingAndAdvance } = await import(
        "@/lib/founding/dispatch"
      );
      // founding_waitlist isn't in generated database.types.ts yet – cast.
      const supabase = createAdminClient() as unknown as {
        from: (t: string) => {
          select: (cols: string) => {
            eq: (col: string, val: string) => {
              single: () => Promise<{
                data: {
                  id: string;
                  email: string;
                  emails_sent: number;
                } | null;
              }>;
            };
          };
        };
      };
      const { data: r } = await supabase
        .from("founding_waitlist")
        .select("id, email, emails_sent")
        .eq("id", id)
        .single();
      if (r) {
        await sendNextFoundingAndAdvance({
          id: r.id,
          email: r.email,
          emails_sent: r.emails_sent,
        });
      }
      return;
    }
    // Seinfeld: nothing to send inline – cron handles it.
  } catch (err) {
    console.error("[confirm] day_zero_dispatch_failed", {
      list,
      id,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
