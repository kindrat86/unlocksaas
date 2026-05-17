/**
 * Starter completion deadline reminder.
 *
 * Brunson DotCom Secrets Secret #12, Beat 6: "The result is time-bound —
 * delivery is verifiable." A buyer who pays $1 and never finishes Steps 1+2
 * didn't receive the result-in-advance — they received an option on it.
 *
 * This module sends the single 24-hour-out reminder to a Starter buyer who
 * has not yet completed both Step 1 (Dream Customer) and Step 2 (Offer).
 *
 * Voice: Reluctant Hero (workbook 01 §6). One email, no nag sequence — per
 * Brunson rule "stop chasing the moment they buy or the moment they finish."
 * The reminder is also short-circuited inside the cron when the buyer
 * upgrades to Core ($49) — the Machine takes over from there.
 *
 * Subject line is deliberately quiet, not hyped. The deliverable is the
 * point; urgency is the engine's, not the email's.
 */
import { getResend, FROM_ADDRESS, REPLY_TO } from "@/lib/resend";

export interface StarterReminderEmailArgs {
  to: string;
  firstName?: string | null;
  /** Hours remaining until the 48h window closes (always positive integer 1-47). */
  hoursRemaining: number;
}

function defaultAppUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (explicit) return explicit;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

/**
 * Send the single Starter completion reminder.
 *
 * Returns true on success, false on failure. Failure is non-fatal — the
 * caller marks `starter_completion_reminder_sent_at` only on success so
 * a retry on next tick is possible.
 */
export async function sendStarterReminderEmail(
  args: StarterReminderEmailArgs
): Promise<boolean> {
  if (!args.to) return false;
  if (!process.env.RESEND_API_KEY) {
    console.warn("[ria-reminder] RESEND_API_KEY not set — skipping send", {
      to: args.to,
    });
    return false;
  }

  const greeting =
    (args.firstName?.split(/\s+/)[0] ?? args.to.split("@")[0] ?? "Builder").trim() ||
    "Builder";
  const continueUrl = `${defaultAppUrl()}/machine/step/1`;
  const hours = Math.max(1, Math.min(47, args.hoursRemaining));

  const subject = `${greeting} — about a day left to finish your $1 Starter.`;

  const text = [
    `${greeting}.`,
    ``,
    `Reminder, not a nag.`,
    ``,
    `You bought the $1 Starter about a day ago. The Machine's first two`,
    `steps — pin one real Dream Customer, write one real Offer — are`,
    `still waiting. The window I commit to is 48 hours from your purchase,`,
    `and you have about ${hours} hour${hours === 1 ? "" : "s"} of it left.`,
    ``,
    `If you finish inside the window, you walk out with a finished WHO and`,
    `a finished WHAT, in your inbox, yours to keep. If the window closes`,
    `and you haven't, the Starter doesn't disappear — your account stays`,
    `open and you can come back any time. But the 48-hour delivery promise`,
    `I make is exactly that: a promise about 48 hours.`,
    ``,
    `Pick it up here: ${continueUrl}`,
    ``,
    `Reply if anything is in your way. I read every reply myself.`,
    ``,
    `— Maryan`,
  ].join("\n");

  const html = `
<div style="font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; font-size: 15px; line-height: 1.6; color: #111; max-width: 640px;">
  <p>${escapeHtml(greeting)}.</p>
  <p><strong>Reminder, not a nag.</strong></p>
  <p>
    You bought the $1 Starter about a day ago. The Machine&rsquo;s first
    two steps &mdash; pin one real Dream Customer, write one real Offer
    &mdash; are still waiting. The window I commit to is <strong>48 hours
    from your purchase</strong>, and you have about <strong>${hours} hour${hours === 1 ? "" : "s"}</strong>
    of it left.
  </p>
  <p>
    If you finish inside the window, you walk out with a finished WHO
    and a finished WHAT, in your inbox, yours to keep. If the window
    closes and you haven&rsquo;t, the Starter doesn&rsquo;t disappear
    &mdash; your account stays open and you can come back any time. But
    the 48-hour delivery promise I make is exactly that: a promise about
    48 hours.
  </p>
  <p>
    <a href="${escapeHtml(continueUrl)}" style="display: inline-block; padding: 10px 16px; background: #111; color: #fff; text-decoration: none; border-radius: 6px;">
      Pick it up here
    </a>
  </p>
  <p style="color: #555;">Reply if anything is in your way. I read every reply myself.</p>
  <p>&mdash; Maryan</p>
</div>`.trim();

  try {
    await getResend().emails.send({
      from: FROM_ADDRESS,
      to: args.to,
      replyTo: REPLY_TO,
      subject,
      text,
      html,
      tags: [
        { name: "kind", value: "starter_completion_reminder" },
      ],
    });
    return true;
  } catch (err) {
    console.error("[ria-reminder] send failed", {
      to: args.to,
      message: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
