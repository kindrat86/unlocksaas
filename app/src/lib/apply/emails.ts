/**
 * Resend templates for the high-ticket Sprint application funnel.
 *
 * Two sends per submission:
 *   1. Operator alert  – to maryan@unlocksaas.com with the full application.
 *   2. Applicant reply – auto-reply, branched by qualification outcome.
 *
 * Both messages are plain-text-feeling. No HTML cards, no logos. The
 * Reluctant Hero voice depends on the operator (Maryan) sounding like a
 * person, not a product.
 */

import { getResend, FROM_ADDRESS, REPLY_TO } from "@/lib/resend";
import {
  CALENDAR_PREF_LABELS,
  MRR_BAND_LABELS,
  PREFERRED_TIER_LABELS,
  type ApplicationAnswers,
  type Qualification,
} from "./qualification";

const OPERATOR_INBOX = "maryan@unlocksaas.com";

interface OperatorAlertInput {
  applicationId: string;
  answers: ApplicationAnswers;
  qualification: Qualification;
  reason: string;
  refCode: string | null;
}

export async function sendOperatorAlert(
  input: OperatorAlertInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  const a = input.answers;
  const lines: string[] = [];
  lines.push(`New Sprint application – ${input.qualification.toUpperCase()}`);
  lines.push("");
  lines.push(`Outcome: ${input.qualification}  (reason: ${input.reason})`);
  lines.push(`Application id: ${input.applicationId}`);
  if (input.refCode) {
    lines.push(`Affiliate ref: ${input.refCode}`);
  }
  lines.push("");
  lines.push("— Identity —");
  lines.push(`Name:    ${a.first_name}`);
  lines.push(`Email:   ${a.email}`);
  if (a.product_url) {
    lines.push(`Product: ${a.product_url}`);
  }
  lines.push("");
  lines.push("— Answers —");
  lines.push(`1. MRR band:          ${MRR_BAND_LABELS[a.mrr_band]}`);
  lines.push(`2. Biggest blocker:   ${a.biggest_blocker}`);
  lines.push(`3. Why now:           ${a.why_now}`);
  lines.push(`4. Has $997+ budget:  ${a.has_budget ? "YES" : "NO"}`);
  lines.push(
    `5. Preferred tier:    ${
      a.preferred_tier ? PREFERRED_TIER_LABELS[a.preferred_tier] : "(none)"
    }`
  );
  lines.push(
    `6. Calendar:          ${
      a.calendar_preference
        ? CALENDAR_PREF_LABELS[a.calendar_preference]
        : "(none)"
    }`
  );
  lines.push("");
  if (input.qualification === "qualified") {
    lines.push("Next: applicant landed on /apply/qualified with the Calendly");
    lines.push("embed. Watch the inbox for the booking confirmation.");
  } else {
    lines.push("Next: applicant landed on /apply/not-yet and was routed back");
    lines.push("to the $1 Starter or the $49/mo Playbook. No call to book.");
  }

  try {
    const result = await getResend().emails.send({
      from: FROM_ADDRESS,
      to: OPERATOR_INBOX,
      replyTo: a.email,
      subject: `Sprint application – ${a.first_name} – ${input.qualification.toUpperCase()}`,
      text: lines.join("\n"),
    });
    if (result.error) {
      return { ok: false, error: result.error.message };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}

interface ApplicantReplyInput {
  email: string;
  firstName: string;
  qualification: Qualification;
  calendlyUrl: string | null;
}

export async function sendApplicantReply(
  input: ApplicantReplyInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  const subject =
    input.qualification === "qualified"
      ? "Your Sprint application – next step"
      : "Your Sprint application – here is the honest path";

  const body =
    input.qualification === "qualified"
      ? qualifiedBody(input.firstName, input.calendlyUrl)
      : notYetBody(input.firstName);

  try {
    const result = await getResend().emails.send({
      from: FROM_ADDRESS,
      to: input.email,
      replyTo: REPLY_TO,
      subject,
      text: body,
    });
    if (result.error) {
      return { ok: false, error: result.error.message };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}

function qualifiedBody(firstName: string, calendlyUrl: string | null): string {
  const lines: string[] = [];
  lines.push(`${firstName},`);
  lines.push("");
  lines.push(
    "Thanks for applying for the Done-With-You Sprint. Your answers passed"
  );
  lines.push(
    "the gate — which means you are exactly the kind of founder this is for."
  );
  lines.push("");
  if (calendlyUrl) {
    lines.push(
      "Next step: pick a 15-minute slot on my calendar. No pitch, no slides."
    );
    lines.push("It is a real conversation about your numbers and your block.");
    lines.push("");
    lines.push(`Book here:  ${calendlyUrl}`);
  } else {
    lines.push("Next step: I will reply to this email within one business day");
    lines.push("with a calendar link. We will book a 15-minute discovery slot.");
  }
  lines.push("");
  lines.push("If you booked the call and your blocker changes between now and");
  lines.push("then — reply to this email. I read every message myself.");
  lines.push("");
  lines.push("— Maryan");
  return lines.join("\n");
}

function notYetBody(firstName: string): string {
  const lines: string[] = [];
  lines.push(`${firstName},`);
  lines.push("");
  lines.push(
    "Thanks for applying. I am going to be honest, which is the only way"
  );
  lines.push("this works: the Sprint is not the right starting point for you");
  lines.push("right now. Not because of who you are. Because of where you are.");
  lines.push("");
  lines.push("Two honest options that fit better:");
  lines.push("");
  lines.push("1) The $1 Starter — the first two steps of the Playbook plus");
  lines.push("   the dream-customer module. One dollar. No upsell trickery.");
  lines.push("   https://unlocksaas.com/starter");
  lines.push("");
  lines.push("2) The $49/mo Playbook — the full 7-step system, 60-day Stripe-");
  lines.push("   verified guarantee, two months back if your first paying");
  lines.push("   customer is not real by Day 60.");
  lines.push("   https://unlocksaas.com/playbook-sales");
  lines.push("");
  lines.push("When you have a first paying customer and want the Done-With-You");
  lines.push("Sprint to compress the second-to-tenth, apply again. I will be");
  lines.push("here.");
  lines.push("");
  lines.push("— Maryan");
  return lines.join("\n");
}
