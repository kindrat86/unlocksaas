/**
 * Teardown-courtesy email template.
 *
 * Pure builder: takes a CourtesyTarget + a greeting (operator may have
 * overridden the parsed default) and returns { subject, text } ready for
 * Resend. No HTML — plain text reads as personal, lifts deliverability,
 * and matches Maryan's voice on the rest of the funnel.
 *
 * Brunson Hard-Rule reconciliation:
 *   - Subject is honest and matches the body. Not deceptive ("you won
 *     something!"), not curiosity-gapped ("the one thing about X...").
 *     The line says exactly what's inside.
 *   - The three praise lines come VERBATIM from the catalog's
 *     whatsWorking[] field. No paraphrase, no LLM rewrite. If the
 *     catalog claim is wrong, the email is wrong, and the recipient
 *     gets the correction loop link.
 *   - "No ask" is enforced by the template structure — there is no CTA,
 *     no signup link, no calendar booking, no "what do you think?".
 *   - Opt-out + reply-stop language for CAN-SPAM compliance even though
 *     this is one-off non-bulk outreach.
 *   - /editorial-policy link gives the recipient a self-serve correction
 *     channel; reply-to also lands in Maryan's real inbox.
 *
 * The body is built as a list of paragraphs joined by "\n\n". Plain text,
 * UTF-8, no markdown, no HTML — matches how a founder writes a one-off
 * email.
 */

import type { CourtesyTarget } from "./targets";

export interface CourtesyEmail {
  subject: string;
  text: string;
}

export interface BuildEmailInput {
  target: CourtesyTarget;
  /**
   * Operator-resolved greeting. If the targets row has an override, pass
   * that; otherwise pass target.greeting. The builder rejects null —
   * caller must resolve a non-null greeting before calling.
   */
  greeting: string;
}

const BASE = "https://unlocksaas.com";

/**
 * Build the courtesy email body. Pure, deterministic, no I/O.
 *
 * Caller must have already validated that:
 *   - target.praises.length >= 1 (catalog gave us at least one observation)
 *   - greeting is a non-empty string
 *
 * Returns plain text. The caller (dispatch.ts) passes this to Resend as
 * the `text` field; `html` is intentionally omitted so the recipient sees
 * the raw text and reads it as a personal email, not a marketing send.
 */
export function buildCourtesyEmail(input: BuildEmailInput): CourtesyEmail {
  const { target, greeting } = input;

  if (target.praises.length === 0) {
    throw new Error(
      `[teardown-courtesy] target ${target.catalog}/${target.slug} has zero praise lines; refusing to send a fabricated email`,
    );
  }
  if (!greeting.trim()) {
    throw new Error(
      `[teardown-courtesy] empty greeting for ${target.catalog}/${target.slug}; cron should have skipped this row`,
    );
  }

  const subject = `I wrote a teardown of ${target.displayName} today`;

  // Numbered list, plain text. Each praise is one bullet, lifted verbatim
  // from the catalog. Caller has already sliced to the first 3.
  const praiseBlock = target.praises
    .map((p, idx) => `${idx + 1}. ${p.text}`)
    .join("\n");

  const paragraphs = [
    `Hey ${greeting.trim()},`,

    `I publish honest funnel teardowns at ${BASE}/funnel-teardown. Today I wrote one of ${target.displayName}: ${target.teardownUrl}`,

    `Three things I admire about your funnel:`,

    praiseBlock,

    `No ask. If anything's factually wrong, reply and I'll fix it – corrections log lives at ${BASE}/editorial-policy.`,

    `– Maryan`,

    // CAN-SPAM-compliant footer. The reply-stop line is one of two
    // documented opt-out mechanisms (the other is the editorial-policy
    // page, which carries a contact path). Footer renders in muted prose
    // rather than legalese to fit the personal-email tone.
    `(One-off note from a real person. Reply STOP and I won't email you again.)`,
  ];

  return {
    subject,
    text: paragraphs.join("\n\n"),
  };
}
