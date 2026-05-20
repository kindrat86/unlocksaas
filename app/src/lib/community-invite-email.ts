/**
 * Verified Builders community invite email.
 *
 * Sent from maryan@unlocksaas.com per project_unlocksaas_email_identity.md
 * (the Reluctant Hero AC – one human to one human, no role addresses).
 *
 * Voice: matches celebration-email.ts – workbook 01 §6 samples, no exclamation
 * marks, no em dashes (en dash or hyphen only), no superlatives. The room is
 * a calm invitation, not a launch announcement.
 *
 * Called from:
 *   - lib/community.ts grantCoreCommunityAccess() on Core checkout
 *   - lib/community.ts grantCoreCommunityAccess() on first invoice (safety net)
 *   - the onboarding "Resend invite" form action
 *
 * Returns true on send success, false on Resend failure (caller logs).
 */
import { getResend, FROM_ADDRESS, REPLY_TO } from "@/lib/resend";
import type { CommunityPlatform } from "@/lib/community";

export interface CommunityInviteEmailArgs {
  to: string;
  builderName?: string | null;
  inviteUrl: string;
  platform: CommunityPlatform;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function platformLine(platform: CommunityPlatform): string {
  if (platform === "discord") return "It is a Discord server. One link, one click.";
  if (platform === "skool") return "It is a Skool community. One link, one click.";
  return "One link, one click.";
}

export async function sendCommunityInviteEmail(
  args: CommunityInviteEmailArgs,
): Promise<boolean> {
  if (!args.to) return false;
  if (!args.inviteUrl) return false;

  const greeting =
    (args.builderName?.split(/\s+/)[0] ?? args.to.split("@")[0] ?? "Builder").trim() ||
    "Builder";
  const subject = `${greeting} – your seat in the Verified Builders room is open.`;

  const text = [
    `${greeting}.`,
    ``,
    `Your Core seat is live, which means the Verified Builders room is open to you.`,
    ``,
    platformLine(args.platform),
    ``,
    `Step in here:`,
    args.inviteUrl,
    ``,
    `What happens inside: founders working the same Playbook trade what is working`,
    `right now – the line that landed a first paying customer, the cold email that`,
    `got the demo, the price test that doubled the close rate. No spectators, no`,
    `gurus. Verified Builders only.`,
    ``,
    `Your first move: introduce yourself in the welcome channel. One line on the`,
    `product, one line on the stuck point. The room reads every intro.`,
    ``,
    `Reply to this email if the link does not work or you want me to walk in with you.`,
    ``,
    `– Maryan`,
  ].join("\n");

  const html = `
<div style="font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; font-size: 15px; line-height: 1.6; color: #111;">
  <p>${escapeHtml(greeting)}.</p>
  <p>Your Core seat is live, which means <strong>the Verified Builders room is open to you.</strong></p>
  <p>${escapeHtml(platformLine(args.platform))}</p>
  <p><a href="${escapeHtml(args.inviteUrl)}" style="display: inline-block; padding: 10px 16px; background: #111; color: #fff; text-decoration: none; border-radius: 6px;">Step into the room</a></p>
  <p style="color: #444;">What happens inside: founders working the same Playbook trade what is working right now – the line that landed a first paying customer, the cold email that got the demo, the price test that doubled the close rate. No spectators, no gurus. Verified Builders only.</p>
  <p style="color: #444;"><strong>Your first move:</strong> introduce yourself in the welcome channel. One line on the product, one line on the stuck point. The room reads every intro.</p>
  <p style="color: #555;">Reply to this email if the link does not work or you want me to walk in with you.</p>
  <p>– Maryan</p>
</div>`.trim();

  try {
    await getResend().emails.send({
      from: FROM_ADDRESS,
      to: args.to,
      replyTo: REPLY_TO,
      subject,
      text,
      html,
    });
    return true;
  } catch (err) {
    console.error("[community-invite-email] send failed:", err);
    return false;
  }
}
