/**
 * Recrawl alert email — Reluctant Hero voice.
 *
 * Sender is the canonical maryan@unlocksaas.com (locked in
 * project_unlocksaas_email_identity.md). Subject leads with the founder's
 * own product name when we have it, otherwise their hostname. The body is
 * deliberately quiet — this lands in a paying subscriber's inbox and the
 * trust is already built.
 *
 * Voice rules (workbook 01 §6 + workbook 06 §2):
 *   - No exclamation marks. No "Hey there." No "Imagine if…"
 *   - Short sentences. Founder-to-founder, not marketer-to-prospect.
 *   - Lead with what dropped, then one specific reason from the engine,
 *     then a single CTA. Three paragraphs max.
 */

import { getResend, FROM_ADDRESS, REPLY_TO } from "@/lib/resend";
import type { DeepDiagnosticResult } from "@/lib/diagnostic";
import {
  type RecrawlDelta,
  AXIS_LABEL,
  formatAxisChange,
} from "@/lib/recrawl";

export interface RecrawlEmailArgs {
  to: string;
  /** First name if known, otherwise the email local-part. */
  greeting: string;
  /** Founder's product URL (used in subject + body context). */
  productUrl: string;
  /** Pretty product name from `curr.product_snapshot.name`. Falls back to hostname. */
  productName: string;
  delta: RecrawlDelta;
  prev: DeepDiagnosticResult;
  curr: DeepDiagnosticResult;
  /** Absolute URL the founder can click to open the trend view. */
  dashboardUrl: string;
  /** Absolute URL that toggles `profiles.recrawl_alerts_enabled` to false. */
  unsubscribeUrl: string;
}

export interface RenderedRecrawlEmail {
  subject: string;
  text: string;
  html: string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Pure email rendering. No side effects. Exported so tests can pin the
 * subject/body without standing up Resend.
 */
export function renderRecrawlEmail(args: RecrawlEmailArgs): RenderedRecrawlEmail {
  const { greeting, productName, delta, curr, dashboardUrl, unsubscribeUrl } =
    args;

  // ---------------- subject ----------------
  let subject: string;
  if (delta.label_changed) {
    subject = `${greeting} — your ${productName} diagnosis just shifted to ${labelToHuman(
      delta.label_changed.to
    )}`;
  } else if (delta.biggest_drop) {
    const drop = delta.biggest_drop;
    subject = `${greeting} — ${AXIS_LABEL[drop.axis]} on ${productName} dropped ${
      drop.prev_score
    } → ${drop.curr_score}`;
  } else {
    // shouldAlert returned true, but neither path is set. Defensive default.
    subject = `${greeting} — your weekly ${productName} re-score is in`;
  }

  // ---------------- body lines ----------------
  const lines: string[] = [`${greeting}.`, ``];

  if (delta.label_changed) {
    lines.push(
      `Your upstream problem on ${productName} just changed shape.`,
      ``,
      `Last week: ${labelToHuman(delta.label_changed.from)}.`,
      `This week: ${labelToHuman(delta.label_changed.to)}.`,
      ``,
      `The engine's read:`,
      `"${curr.explanation.trim()}"`,
      ``
    );
  } else if (delta.biggest_drop) {
    lines.push(
      `${productName} re-scored this week. ${formatAxisChange(
        delta.biggest_drop
      )}.`,
      ``,
      `Why:`,
      `"${delta.biggest_drop.curr_diagnosis.trim()}"`,
      ``
    );
    if (delta.biggest_drop.curr_evidence_quote) {
      lines.push(
        `From the page itself:`,
        `"${delta.biggest_drop.curr_evidence_quote.trim()}"`,
        ``
      );
    }
  }

  // Other regressions, if any
  const otherDrops = delta.score_changes.filter(
    (c) => c.change < 0 && c !== delta.biggest_drop
  );
  if (otherDrops.length > 0) {
    lines.push(`Also down this week:`);
    for (const d of otherDrops) {
      lines.push(`  - ${formatAxisChange(d)}`);
    }
    lines.push(``);
  }

  // Gains worth mentioning quietly
  if (delta.biggest_gain) {
    lines.push(
      `Up this week: ${formatAxisChange(delta.biggest_gain)}. Keep that.`,
      ``
    );
  }

  // Lost strengths are usually the most actionable signal — the page used to
  // do something well and no longer does.
  if (delta.lost_strengths.length > 0) {
    lines.push(`The engine no longer sees these strengths on the page:`);
    for (const s of delta.lost_strengths.slice(0, 3)) {
      lines.push(`  - ${s}`);
    }
    lines.push(``);
  }

  if (delta.new_competitors.length > 0) {
    lines.push(
      `New competitors the engine surfaced this week: ${delta.new_competitors
        .slice(0, 3)
        .join(", ")}.`,
      ``
    );
  }

  lines.push(
    `Open the full re-score in your dashboard:`,
    dashboardUrl,
    ``,
    `Reply if anything in this read lands wrong. I read every reply.`,
    ``,
    `— Maryan`,
    ``,
    `--`,
    `You're getting this because your weekly re-score crossed an alert`,
    `threshold. Mute future alerts: ${unsubscribeUrl}`
  );

  const text = lines.join("\n");

  // ---------------- html ----------------
  // Mirror the deliverable-email.ts visual language for inbox consistency:
  // system-font, modest type scale, neutral palette. Avoid screaming
  // accent colors — the message earns attention through specificity, not
  // chrome.
  const htmlBody = `
<div style="font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; font-size: 15px; line-height: 1.6; color: #111; max-width: 640px;">
  <p>${escapeHtml(greeting)}.</p>
  ${
    delta.label_changed
      ? `
        <p>Your upstream problem on <strong>${escapeHtml(
          productName
        )}</strong> just changed shape.</p>
        <p style="background: #fafafa; border: 1px solid #eee; padding: 12px 16px; border-radius: 6px; margin: 16px 0;">
          <span style="color: #666;">Last week:</span> ${escapeHtml(
            labelToHuman(delta.label_changed.from)
          )}<br>
          <span style="color: #666;">This week:</span> <strong>${escapeHtml(
            labelToHuman(delta.label_changed.to)
          )}</strong>
        </p>
        <p>The engine's read:</p>
        <blockquote style="margin: 0 0 16px; padding: 0 16px; border-left: 3px solid #ccc; color: #444;">${escapeHtml(
          curr.explanation.trim()
        )}</blockquote>
      `
      : delta.biggest_drop
        ? `
        <p><strong>${escapeHtml(
          productName
        )}</strong> re-scored this week. ${escapeHtml(
          formatAxisChange(delta.biggest_drop)
        )}.</p>
        <p>Why:</p>
        <blockquote style="margin: 0 0 16px; padding: 0 16px; border-left: 3px solid #ccc; color: #444;">${escapeHtml(
          delta.biggest_drop.curr_diagnosis.trim()
        )}</blockquote>
        ${
          delta.biggest_drop.curr_evidence_quote
            ? `
            <p>From the page itself:</p>
            <blockquote style="margin: 0 0 16px; padding: 0 16px; border-left: 3px solid #ccc; color: #444;">${escapeHtml(
              delta.biggest_drop.curr_evidence_quote.trim()
            )}</blockquote>`
            : ""
        }
      `
        : ""
  }
  ${
    otherDrops.length > 0
      ? `
        <p style="margin-bottom: 4px;">Also down this week:</p>
        <ul style="margin: 0 0 16px; padding-left: 20px;">
          ${otherDrops
            .map((d) => `<li>${escapeHtml(formatAxisChange(d))}</li>`)
            .join("")}
        </ul>`
      : ""
  }
  ${
    delta.biggest_gain
      ? `<p>Up this week: <strong>${escapeHtml(
          formatAxisChange(delta.biggest_gain)
        )}</strong>. Keep that.</p>`
      : ""
  }
  ${
    delta.lost_strengths.length > 0
      ? `
        <p style="margin-bottom: 4px;">The engine no longer sees these strengths on the page:</p>
        <ul style="margin: 0 0 16px; padding-left: 20px;">
          ${delta.lost_strengths
            .slice(0, 3)
            .map((s) => `<li>${escapeHtml(s)}</li>`)
            .join("")}
        </ul>`
      : ""
  }
  ${
    delta.new_competitors.length > 0
      ? `<p>New competitors the engine surfaced this week: <strong>${escapeHtml(
          delta.new_competitors.slice(0, 3).join(", ")
        )}</strong>.</p>`
      : ""
  }
  <p style="margin-top: 24px;">
    <a href="${escapeHtml(
      dashboardUrl
    )}" style="display: inline-block; padding: 10px 16px; background: #111; color: #fff; text-decoration: none; border-radius: 6px;">
      Open the full re-score
    </a>
  </p>
  <p style="color: #555;">Reply if anything in this read lands wrong. I read every reply.</p>
  <p>— Maryan</p>
  <hr style="border: 0; border-top: 1px solid #eee; margin: 24px 0;">
  <p style="font-size: 12px; color: #888;">
    You're getting this because your weekly re-score crossed an alert threshold.
    <a href="${escapeHtml(unsubscribeUrl)}" style="color: #888;">Mute future alerts</a>.
  </p>
</div>`.trim();

  return { subject, text, html: htmlBody };
}

function labelToHuman(label: DeepDiagnosticResult["label"]): string {
  switch (label) {
    case "wrong_person":
      return "Wrong Person";
    case "weak_offer":
      return "Weak Offer";
    case "weak_belief":
      return "Weak Belief";
  }
}

/**
 * Send the rendered email via Resend. Returns true on success, false on
 * failure (caller logs to recrawl_alerts).
 */
export async function sendRecrawlEmail(
  args: RecrawlEmailArgs
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!process.env.RESEND_API_KEY) {
    return { ok: false, reason: "RESEND_API_KEY not set" };
  }
  const rendered = renderRecrawlEmail(args);
  try {
    await getResend().emails.send({
      from: FROM_ADDRESS,
      to: args.to,
      replyTo: REPLY_TO,
      subject: rendered.subject,
      text: rendered.text,
      html: rendered.html,
      tags: [
        { name: "kind", value: "recrawl_alert" },
        {
          name: "trigger",
          value: args.delta.label_changed ? "label_change" : "score_drop",
        },
      ],
    });
    return { ok: true };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.error("[recrawl-email] send failed", { to: args.to, reason });
    return { ok: false, reason: reason.slice(0, 500) };
  }
}

/**
 * Optional Slack-webhook tee. Only fires when SLACK_WEBHOOK_URL is set.
 * Best-effort — failures do not poison the email-channel outcome.
 */
export async function sendSlackRecrawlAlert(args: {
  webhookUrl: string;
  delta: RecrawlDelta;
  productName: string;
  productUrl: string;
  dashboardUrl: string;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const { webhookUrl, delta, productName, productUrl, dashboardUrl } = args;

  const headline = delta.label_changed
    ? `Diagnosis flipped: ${labelToHuman(delta.label_changed.from)} → ${labelToHuman(
        delta.label_changed.to
      )}`
    : delta.biggest_drop
      ? `${AXIS_LABEL[delta.biggest_drop.axis]} dropped ${delta.biggest_drop.prev_score} → ${delta.biggest_drop.curr_score}`
      : "Weekly re-score in";

  const detail = delta.biggest_drop?.curr_diagnosis ?? "";

  const payload = {
    text: `*${productName}* — ${headline}`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*<${productUrl}|${productName}>* — ${headline}`,
        },
      },
      ...(detail
        ? [
            {
              type: "section",
              text: { type: "mrkdwn", text: `> ${detail}` },
            },
          ]
        : []),
      {
        type: "section",
        text: { type: "mrkdwn", text: `<${dashboardUrl}|Open in dashboard →>` },
      },
    ],
  };

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      return { ok: false, reason: `slack_${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    return { ok: false, reason: reason.slice(0, 500) };
  }
}
