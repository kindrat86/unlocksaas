/**
 * Step-deliverable email.
 *
 * Brunson rule (DotCom Secrets, Secret #12 + Frank Kern's Results-in-Advance):
 * when a user finishes a Playbook step inside the $1 Starter, they MUST receive
 * the assembled deliverable in their inbox. The inbox copy is the part they
 * truly "keep" — the browser can crash, cookies can clear, the tab can close.
 * The email cannot.
 *
 * Voice: Reluctant Hero (workbook 01 §6). Signed "— Maryan" per the locked
 * sender-identity memory (project_unlocksaas_email_identity.md). Sent from
 * maryan@unlocksaas.com via Resend so DKIM aligns and reply-to lands back in
 * the same mailbox scripts/mail.py reads.
 *
 * Subject lines are deliberately quiet, not hyped. The deliverable speaks
 * for itself — adding "URGENT!!!" or "HOT!" breaks the Reluctant Hero bond.
 */
import { getResend, FROM_ADDRESS, REPLY_TO } from "@/lib/resend";
import { STEP_TITLE, type EngineStepId } from "@/lib/step-outputs";

export interface StepDeliverableEmailArgs {
  to: string;
  firstName?: string | null;
  stepId: EngineStepId;
  outputText: string;
}

const STEP_BLURB: Record<EngineStepId, string> = {
  "1": "Your Dream Customer is locked. One real person, named and specific. Use this in every line of copy you write from here on. If you cannot trace a sentence back to this person, cut the sentence.",
  "2": "Your Offer is locked. Read it back to a skeptic and watch their face. If they push on the math, you have your first piece of FAQ to write. If they don't, you are ready to take it live.",
  "3": "Your Attractive Character is locked. This is the voice you publish in from now on — every thread, every email, every post. Polish kills it; confession sells it.",
  "4": "Your Copy is locked. Five headlines, a Star-Story-Solution page draft, the OTO block, and a disqualifying line. Ship the page; edit on the live URL, not in a doc.",
  "5": "Your Outreach Assets are locked. Twenty targets, two message variants, three reply branches, one cold-email template. The job from here is reps. Step 6 logs every one of them.",
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function defaultAppUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (explicit) return explicit;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

/**
 * Send the user a copy of their assembled step deliverable.
 *
 * Returns true on success, false on failure. Failure is non-fatal — the user
 * still has the deliverable on the completion screen and (if signed in)
 * persisted to project_state. The email is the third copy, not the first.
 */
export async function sendStepDeliverableEmail(
  args: StepDeliverableEmailArgs
): Promise<boolean> {
  if (!args.to) return false;
  if (!process.env.RESEND_API_KEY) {
    console.warn("[deliverable-email] RESEND_API_KEY not set — skipping send", {
      stepId: args.stepId,
    });
    return false;
  }

  const greeting =
    (args.firstName?.split(/\s+/)[0] ?? args.to.split("@")[0] ?? "Builder").trim() ||
    "Builder";
  const title = STEP_TITLE[args.stepId];
  const blurb = STEP_BLURB[args.stepId];
  const continueUrl = `${defaultAppUrl()}/playbook/step/${args.stepId}`;
  const subject = `${greeting} — ${title} is locked.`;

  const text = [
    `${greeting}.`,
    ``,
    `${title} is locked. Here is your copy, in your inbox, where the tab cannot close on it.`,
    ``,
    blurb,
    ``,
    `--- ${title} ---`,
    ``,
    args.outputText.trim(),
    ``,
    `--- end ---`,
    ``,
    `Open this step again any time: ${continueUrl}`,
    ``,
    `Reply to this email if anything in your deliverable lands wrong. I read every reply myself.`,
    ``,
    `— Maryan`,
  ].join("\n");

  // Render the deliverable as a <pre> block so the formatting (headings,
  // bullets, line breaks) survives in inbox clients that strip markdown.
  const html = `
<div style="font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; font-size: 15px; line-height: 1.6; color: #111; max-width: 640px;">
  <p>${escapeHtml(greeting)}.</p>
  <p><strong>${escapeHtml(title)} is locked.</strong> Here is your copy, in your inbox, where the tab cannot close on it.</p>
  <p style="color: #444;">${escapeHtml(blurb)}</p>
  <hr style="border: 0; border-top: 1px solid #ddd; margin: 24px 0;">
  <pre style="white-space: pre-wrap; word-wrap: break-word; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; font-size: 14px; line-height: 1.6; color: #111; background: #fafafa; border: 1px solid #eee; padding: 16px; border-radius: 6px;">${escapeHtml(
    args.outputText.trim()
  )}</pre>
  <hr style="border: 0; border-top: 1px solid #ddd; margin: 24px 0;">
  <p>
    <a href="${escapeHtml(continueUrl)}" style="display: inline-block; padding: 10px 16px; background: #111; color: #fff; text-decoration: none; border-radius: 6px;">
      Open this step again
    </a>
  </p>
  <p style="color: #555;">Reply to this email if anything in your deliverable lands wrong. I read every reply myself.</p>
  <p>— Maryan</p>
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
        { name: "kind", value: "step_deliverable" },
        { name: "step_id", value: args.stepId },
      ],
    });
    return true;
  } catch (err) {
    console.error("[deliverable-email] send failed", {
      stepId: args.stepId,
      message: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}
