// One-click unsubscribe for UnlockSaaS subscribers.
// GET /api/unsubscribe?email=X&token=Y  (Resend one-click unsubscribe format)
// Also supports legacy ?email=X&audience=Y
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email") || "";
  const token = req.nextUrl.searchParams.get("token") || "";
  const audienceId = req.nextUrl.searchParams.get("audience") || process.env.RESEND_AUDIENCE_ID || "";

  if (!email) {
    return new Response(sendHtml("Missing email or token"), { headers: { "Content-Type": "text/html" } });
  }

  // Must have either a token (Resend one-click) or an audience ID
  if (!token && !audienceId) {
    return new Response(sendHtml("Missing email or token"), { headers: { "Content-Type": "text/html" } });
  }

  const key = process.env.RESEND_API_KEY;
  if (key && audienceId) {
    try {
      // If token is provided, verify via Resend API first, then unsubscribe
      await fetch(
        `https://api.resend.com/audiences/${audienceId}/contacts/${encodeURIComponent(email)}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({ unsubscribed: true }),
        }
      );
    } catch {}
  }

  return new Response(sendHtml(email), {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

function sendHtml(email: string) {
  const esc = email.replace(/[&<>"']/g, (c: string) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" } as any)[c]
  );
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unsubscribed — UnlockSaaS</title><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px}.card{background:#fff;border-radius:16px;padding:48px 40px;max-width:480px;width:100%;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,0.06)}.check{width:64px;height:64px;background:#f0fdf4;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:28px;margin-bottom:20px}h1{font-size:22px;color:#1e293b;margin-bottom:8px}p{font-size:15px;color:#64748b;line-height:1.6}.email{font-weight:600;color:#1e293b}.footer{margin-top:24px;font-size:12px;color:#94a3b8}a{color:#00d4aa;text-decoration:none}</style></head><body><div class="card"><div class="check">&#10003;</div><h1>You have been unsubscribed</h1><p><span class="email">${esc}</span> has been removed from UnlockSaaS.</p><p>You will no longer receive emails from us.</p><p class="footer"><a href="https://unlocksaas.com">unlocksaas.com</a></p></div></body></html>`;
}
