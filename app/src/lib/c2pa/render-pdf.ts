/**
 * PDF renderer for the diagnostic artifact.
 *
 * Builds a clean, professional PDF from the diagnostic_leads row (and
 * optional v2 analysis_detail JSONB). Output is a Buffer of PDF bytes
 * ready to be signed with a C2PA manifest (see ./signer.ts).
 *
 * Why a separate server-side render — not just window.print()?
 *   Content Credentials (C2PA) require the signer to control the asset
 *   bytes end-to-end. A browser-printed PDF cannot be signed at source.
 *   The on-screen print path stays for founders who prefer it; this is
 *   the official, EU-AI-Act-disclosable artifact.
 *
 * Layout — single-column, ~80ch, Helvetica + Helvetica-Bold:
 *   Page 1: Cover + AI-disclosure banner + the diagnosis
 *   Page 2+: (if analysis_detail present) scorecard, rewrites, 30-day plan,
 *            competitors, strengths
 *   Footer on every page: source + page N of M
 */
import {
  PDFDocument,
  PDFFont,
  PDFPage,
  StandardFonts,
  rgb,
} from "pdf-lib";

import type { DiagnosticLabel, Bucket } from "@/lib/diagnostic";

// ---------------------------------------------------------------------------
// Shapes — mirror the row we read in the endpoint. Kept here so the renderer
// is fully self-contained and unit-testable without DB access.
// ---------------------------------------------------------------------------

export type AxisScore = {
  score: number;
  diagnosis: string;
  evidence: string[];
};

export type ProductSnapshot = {
  name: string;
  one_liner: string;
  audience_stated: string;
  pricing_visible: string | null;
};

export type RewriteBlock = {
  current: string;
  alternates: string[];
  why_better: string;
};

export type ValuePropRewrite = {
  current: string[];
  rewritten: string[];
  why_better: string;
};

export type WeekPlan = {
  theme: string;
  deliverables: string[];
};

export type CompetitorPull = {
  name: string;
  one_line: string;
  what_they_do_better: string[];
  what_you_do_better: string[];
};

export type DeepAnalysisDetail = {
  product_snapshot: ProductSnapshot;
  scores: {
    wrong_person: AxisScore;
    weak_offer: AxisScore;
    weak_belief: AxisScore;
  };
  rewrites: {
    hero_headline: RewriteBlock;
    primary_cta: RewriteBlock;
    value_props: ValuePropRewrite;
  };
  plan_30_day: {
    week1: WeekPlan;
    week2: WeekPlan;
    week3: WeekPlan;
    week4: WeekPlan;
  };
  competitors: CompetitorPull[];
  strengths: string[];
};

export type DiagnosticPdfInput = {
  id: string;
  product_url: string;
  label: DiagnosticLabel | "error";
  explanation: string | null;
  evidence: string | null;
  bucket: Bucket | null;
  created_at: string;
  analysis_detail: DeepAnalysisDetail | null;
  // Optional model attribution for the C2PA assertion. The renderer prints
  // it on the cover too so the artifact carries its provenance visibly.
  ai_model?: string;
};

// ---------------------------------------------------------------------------
// Geometry. US Letter, 0.75" margins, single column.
// ---------------------------------------------------------------------------

const PAGE_WIDTH = 612; // 8.5"
const PAGE_HEIGHT = 792; // 11"
const MARGIN_X = 54; // 0.75"
const MARGIN_Y_TOP = 60;
const MARGIN_Y_BOTTOM = 60;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;
const FOOTER_Y = 30;

const COLOR_TEXT = rgb(0.1, 0.1, 0.12);
const COLOR_MUTED = rgb(0.42, 0.42, 0.45);
const COLOR_RULE = rgb(0.82, 0.82, 0.85);
const COLOR_ACCENT = rgb(0.13, 0.39, 0.93); // shadcn-like primary blue
const COLOR_WARN = rgb(0.85, 0.45, 0.05);
const COLOR_DANGER = rgb(0.82, 0.18, 0.18);
const COLOR_GOOD = rgb(0.13, 0.6, 0.32);

const LABEL_HUMAN: Record<DiagnosticLabel | "error", string> = {
  wrong_person: "Wrong Person",
  weak_offer: "Weak Offer",
  weak_belief: "Weak Belief",
  error: "Engine Error",
};

// ---------------------------------------------------------------------------
// Layout cursor. PDF coordinates are bottom-left origin; we track y from the
// top and let `down()` consume vertical space.
// ---------------------------------------------------------------------------

class Cursor {
  y: number;
  constructor(public page: PDFPage) {
    this.y = PAGE_HEIGHT - MARGIN_Y_TOP;
  }
  down(n: number) {
    this.y -= n;
  }
  remaining(): number {
    return this.y - MARGIN_Y_BOTTOM;
  }
}

// ---------------------------------------------------------------------------
// Word-wrap that respects pdf-lib font metrics. Returns lines that fit the
// content width at the given font + size.
// ---------------------------------------------------------------------------

function wrap(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
): string[] {
  if (!text) return [];
  const out: string[] = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const words = rawLine.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      out.push("");
      continue;
    }
    let line = words[0];
    for (let i = 1; i < words.length; i++) {
      const trial = `${line} ${words[i]}`;
      if (font.widthOfTextAtSize(trial, size) <= maxWidth) {
        line = trial;
      } else {
        out.push(line);
        line = words[i];
      }
    }
    out.push(line);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Primitives.
// ---------------------------------------------------------------------------

function drawText(
  cur: Cursor,
  text: string,
  font: PDFFont,
  size: number,
  opts: {
    color?: ReturnType<typeof rgb>;
    leading?: number;
    indent?: number;
    maxWidth?: number;
  } = {},
) {
  const color = opts.color ?? COLOR_TEXT;
  const leading = opts.leading ?? size * 1.35;
  const indent = opts.indent ?? 0;
  const maxWidth = (opts.maxWidth ?? CONTENT_WIDTH) - indent;
  const lines = wrap(text, font, size, maxWidth);
  for (const line of lines) {
    cur.page.drawText(line, {
      x: MARGIN_X + indent,
      y: cur.y - size,
      size,
      font,
      color,
    });
    cur.down(leading);
  }
}

function drawRule(cur: Cursor, color = COLOR_RULE) {
  cur.page.drawLine({
    start: { x: MARGIN_X, y: cur.y },
    end: { x: MARGIN_X + CONTENT_WIDTH, y: cur.y },
    thickness: 0.5,
    color,
  });
  cur.down(8);
}

function drawBadge(
  cur: Cursor,
  text: string,
  font: PDFFont,
  color: ReturnType<typeof rgb>,
) {
  const size = 9;
  const padX = 6;
  const padY = 3;
  const tw = font.widthOfTextAtSize(text, size);
  const x = MARGIN_X;
  const y = cur.y - size - padY;
  cur.page.drawRectangle({
    x,
    y: y - padY,
    width: tw + padX * 2,
    height: size + padY * 2,
    color,
    opacity: 0.12,
    borderColor: color,
    borderWidth: 0.5,
    borderOpacity: 0.45,
  });
  cur.page.drawText(text, {
    x: x + padX,
    y,
    size,
    font,
    color,
  });
  cur.down(size + padY * 2 + 6);
}

// ---------------------------------------------------------------------------
// Page break helper. Allocates a new page when the cursor runs out.
// ---------------------------------------------------------------------------

function needs(
  cur: { current: Cursor },
  doc: PDFDocument,
  minSpace: number,
): Cursor {
  if (cur.current.remaining() < minSpace) {
    cur.current = new Cursor(doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]));
  }
  return cur.current;
}

// ---------------------------------------------------------------------------
// Footer — drawn last, once all content pages exist, so page-N-of-M is right.
// ---------------------------------------------------------------------------

function drawFooters(
  doc: PDFDocument,
  font: PDFFont,
  productHost: string,
  generatedAt: string,
) {
  const pages = doc.getPages();
  const total = pages.length;
  for (let i = 0; i < total; i++) {
    const page = pages[i];
    const size = 8;
    const left = `Diagnostic for ${productHost} — generated ${generatedAt}`;
    const right = `${i + 1} / ${total}`;
    page.drawText(left, {
      x: MARGIN_X,
      y: FOOTER_Y,
      size,
      font,
      color: COLOR_MUTED,
    });
    page.drawText(right, {
      x: MARGIN_X + CONTENT_WIDTH - font.widthOfTextAtSize(right, size),
      y: FOOTER_Y,
      size,
      font,
      color: COLOR_MUTED,
    });
    page.drawText("UnlockSaaS · unlocksaas.com/diagnostic", {
      x: MARGIN_X,
      y: FOOTER_Y - 12,
      size,
      font,
      color: COLOR_MUTED,
    });
    page.drawText("Content Credentials embedded · verify at contentcredentials.org", {
      x:
        MARGIN_X +
        CONTENT_WIDTH -
        font.widthOfTextAtSize(
          "Content Credentials embedded · verify at contentcredentials.org",
          size,
        ),
      y: FOOTER_Y - 12,
      size,
      font,
      color: COLOR_MUTED,
    });
  }
}

// ---------------------------------------------------------------------------
// Score colour mapping — mirrors the on-screen scorecard tone.
// ---------------------------------------------------------------------------

function scoreColor(score: number): ReturnType<typeof rgb> {
  if (score <= 3) return COLOR_DANGER;
  if (score <= 5) return COLOR_WARN;
  if (score <= 7) return rgb(0.7, 0.5, 0.05);
  return COLOR_GOOD;
}

function scoreLabel(score: number): string {
  if (score <= 3) return "Catastrophic";
  if (score <= 5) return "Weak";
  if (score <= 7) return "Workable";
  if (score <= 9) return "Strong";
  return "World-class";
}

// ---------------------------------------------------------------------------
// Main entry. Builds the entire PDF, returns the raw bytes.
// ---------------------------------------------------------------------------

export async function renderDiagnosticPdf(
  input: DiagnosticPdfInput,
): Promise<Buffer> {
  const doc = await PDFDocument.create();

  // Metadata — these become PDF XMP fields and are visible in any PDF
  // reader's "Properties" dialog. Belt-and-suspenders alongside the
  // C2PA manifest. Always include the AI-disclosure note.
  doc.setTitle(`UnlockSaaS Diagnostic — ${hostnameOf(input.product_url)}`);
  doc.setAuthor("UnlockSaaS (Maryan)");
  doc.setProducer("UnlockSaaS Diagnostic Engine");
  doc.setCreator("UnlockSaaS Diagnostic Engine");
  doc.setSubject(
    "Diagnostic report with AI-assisted analysis. See embedded C2PA manifest for provenance.",
  );
  doc.setKeywords([
    "AI-assisted",
    "Content Credentials",
    "C2PA",
    "EU AI Act Article 50",
    "diagnostic",
    "UnlockSaaS",
  ]);
  doc.setCreationDate(new Date(input.created_at));
  doc.setModificationDate(new Date());

  const helv = await doc.embedFont(StandardFonts.Helvetica);
  const helvBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const helvOblique = await doc.embedFont(StandardFonts.HelveticaOblique);

  const cur = { current: new Cursor(doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])) };
  const generatedAt = formatDateAthens(new Date(input.created_at));
  const productHost = hostnameOf(input.product_url);

  // -------------------------------------------------------------------------
  // Cover.
  // -------------------------------------------------------------------------

  drawText(cur.current, "YOUR DIAGNOSIS", helvBold, 10, {
    color: COLOR_MUTED,
    leading: 14,
  });
  drawText(
    cur.current,
    `Diagnosis for ${productHost}.`,
    helvBold,
    24,
    { leading: 30 },
  );
  cur.current.down(4);
  drawText(
    cur.current,
    "The engine reads your live page, scores the upstream failure modes, rewrites the copy that needs rewriting, and hands you a 30-day plan to fix it. This file is yours — share, archive, attach to investor decks.",
    helv,
    10,
    { color: COLOR_MUTED, leading: 14 },
  );
  cur.current.down(10);

  // EU AI Act Article 50 disclosure — visible, not just embedded. Required
  // for "machine-readable disclosure" of AI-generated/manipulated content
  // entering force August 2026.
  drawAiDisclosureBlock(cur.current, helv, helvBold, input.ai_model);
  cur.current.down(8);

  drawRule(cur.current);

  // -------------------------------------------------------------------------
  // Diagnosis section — always present (every row has label + explanation,
  // including error rows).
  // -------------------------------------------------------------------------

  const label = input.label;
  const labelText = LABEL_HUMAN[label];
  const labelColor = label === "error" ? COLOR_DANGER : COLOR_ACCENT;
  drawBadge(cur.current, labelText.toUpperCase(), helvBold, labelColor);

  if (input.bucket && label !== "error") {
    drawText(
      cur.current,
      `Bucket: ${input.bucket.replace(/_/g, " ")}`,
      helv,
      9,
      { color: COLOR_MUTED, leading: 12 },
    );
    cur.current.down(4);
  }

  if (input.explanation) {
    needs(cur, doc, 80);
    drawText(cur.current, input.explanation, helv, 11, { leading: 16 });
    cur.current.down(8);
  }

  if (input.evidence) {
    needs(cur, doc, 60);
    drawText(cur.current, "What I saw on the page", helvBold, 9, {
      color: COLOR_MUTED,
      leading: 12,
    });
    cur.current.down(2);
    drawText(cur.current, `"${input.evidence}"`, helvOblique, 10, {
      color: COLOR_TEXT,
      leading: 14,
      indent: 8,
    });
    cur.current.down(8);
  }

  // -------------------------------------------------------------------------
  // Deep report — only present on v2 rows.
  // -------------------------------------------------------------------------

  if (input.analysis_detail) {
    const detail = input.analysis_detail;

    // Product snapshot
    needs(cur, doc, 120);
    drawRule(cur.current);
    drawText(cur.current, "What I see on the page", helvBold, 14, {
      leading: 20,
    });
    cur.current.down(4);
    drawSnapshot(cur, doc, helv, helvBold, detail.product_snapshot);

    // Three-axis scorecard
    needs(cur, doc, 200);
    drawRule(cur.current);
    drawText(cur.current, "The three-axis scorecard", helvBold, 14, {
      leading: 20,
    });
    drawText(
      cur.current,
      "1 = catastrophic. 10 = world-class. Fix the lowest score first.",
      helv,
      9,
      { color: COLOR_MUTED, leading: 12 },
    );
    cur.current.down(6);
    drawAxis(cur, doc, helv, helvBold, helvOblique, "Wrong Person", detail.scores.wrong_person);
    drawAxis(cur, doc, helv, helvBold, helvOblique, "Weak Offer", detail.scores.weak_offer);
    drawAxis(cur, doc, helv, helvBold, helvOblique, "Weak Belief", detail.scores.weak_belief);

    // Strengths
    if (detail.strengths.length > 0) {
      needs(cur, doc, 80);
      drawRule(cur.current);
      drawText(cur.current, "What is working", helvBold, 14, { leading: 20 });
      cur.current.down(4);
      for (const s of detail.strengths) {
        needs(cur, doc, 30);
        drawText(cur.current, `+ ${s}`, helv, 10, {
          leading: 14,
          color: COLOR_GOOD,
        });
      }
      cur.current.down(4);
    }

    // Rewrites
    needs(cur, doc, 200);
    drawRule(cur.current);
    drawText(cur.current, "Copy you could ship today", helvBold, 14, {
      leading: 20,
    });
    cur.current.down(4);
    drawRewriteBlock(cur, doc, helv, helvBold, helvOblique, "Hero headline", detail.rewrites.hero_headline);
    drawRewriteBlock(cur, doc, helv, helvBold, helvOblique, "Primary CTA", detail.rewrites.primary_cta);
    drawValueProps(cur, doc, helv, helvBold, helvOblique, detail.rewrites.value_props);

    // 30-day plan
    needs(cur, doc, 200);
    drawRule(cur.current);
    drawText(cur.current, "Your 30-day plan", helvBold, 14, { leading: 20 });
    cur.current.down(4);
    drawWeek(cur, doc, helv, helvBold, 1, detail.plan_30_day.week1);
    drawWeek(cur, doc, helv, helvBold, 2, detail.plan_30_day.week2);
    drawWeek(cur, doc, helv, helvBold, 3, detail.plan_30_day.week3);
    drawWeek(cur, doc, helv, helvBold, 4, detail.plan_30_day.week4);

    // Competitors
    if (detail.competitors.length > 0) {
      needs(cur, doc, 120);
      drawRule(cur.current);
      drawText(cur.current, `How ${productHost} stacks up`, helvBold, 14, {
        leading: 20,
      });
      cur.current.down(4);
      for (const c of detail.competitors) {
        drawCompetitor(cur, doc, helv, helvBold, helvOblique, c);
      }
    }
  }

  // -------------------------------------------------------------------------
  // Footers (after all pages exist so N-of-M is correct).
  // -------------------------------------------------------------------------

  drawFooters(doc, helv, productHost, generatedAt);

  const bytes = await doc.save();
  return Buffer.from(bytes);
}

// ---------------------------------------------------------------------------
// Section renderers.
// ---------------------------------------------------------------------------

function drawAiDisclosureBlock(
  cur: Cursor,
  helv: PDFFont,
  helvBold: PDFFont,
  modelName?: string,
) {
  const title = "AI-ASSISTED CONTENT — DISCLOSURE";
  const model = modelName ?? "Claude (Anthropic)";
  const body =
    `Sections of this report were generated by ${model} reading your live ` +
    `page. The analysis is reviewed and published by Maryan at UnlockSaaS. ` +
    `This file carries an embedded C2PA Content Credential manifest declaring ` +
    `provenance, authorship, and AI involvement. Verify at contentcredentials.org. ` +
    `Disclosure aligns with EU AI Act Article 50 (in force August 2026).`;

  const boxX = MARGIN_X;
  const boxTop = cur.y;
  // Estimate box height (title line + wrapped body)
  const bodyLines = wrap(body, helv, 9, CONTENT_WIDTH - 16);
  const boxHeight = 14 + bodyLines.length * 12 + 14;
  cur.page.drawRectangle({
    x: boxX,
    y: boxTop - boxHeight,
    width: CONTENT_WIDTH,
    height: boxHeight,
    color: COLOR_ACCENT,
    opacity: 0.05,
    borderColor: COLOR_ACCENT,
    borderWidth: 0.6,
    borderOpacity: 0.4,
  });
  cur.page.drawText(title, {
    x: boxX + 8,
    y: boxTop - 14,
    size: 8,
    font: helvBold,
    color: COLOR_ACCENT,
  });
  let y = boxTop - 28;
  for (const line of bodyLines) {
    cur.page.drawText(line, {
      x: boxX + 8,
      y,
      size: 9,
      font: helv,
      color: COLOR_TEXT,
    });
    y -= 12;
  }
  cur.down(boxHeight + 6);
}

function drawSnapshot(
  cur: { current: Cursor },
  doc: PDFDocument,
  helv: PDFFont,
  helvBold: PDFFont,
  snap: ProductSnapshot,
) {
  const rows: Array<[string, string]> = [
    ["Product", snap.name || "—"],
    ["Pricing visible", snap.pricing_visible || "Not surfaced on this page"],
    ["One-liner as written", `"${snap.one_liner}"`],
    ["Who it says it's for", snap.audience_stated],
  ];
  for (const [k, v] of rows) {
    needs(cur, doc, 36);
    drawText(cur.current, k.toUpperCase(), helvBold, 8, {
      color: COLOR_MUTED,
      leading: 11,
    });
    drawText(cur.current, v, helv, 10, { leading: 14 });
    cur.current.down(4);
  }
}

function drawAxis(
  cur: { current: Cursor },
  doc: PDFDocument,
  helv: PDFFont,
  helvBold: PDFFont,
  helvOblique: PDFFont,
  title: string,
  axis: AxisScore,
) {
  needs(cur, doc, 80);
  const tone = scoreColor(axis.score);
  drawText(cur.current, title, helvBold, 12, { leading: 16 });
  drawText(
    cur.current,
    `${axis.score} / 10 — ${scoreLabel(axis.score)}`,
    helvBold,
    11,
    { color: tone, leading: 14 },
  );
  drawText(cur.current, axis.diagnosis, helv, 10, { leading: 14 });
  for (const e of axis.evidence) {
    needs(cur, doc, 18);
    drawText(cur.current, `"${e}"`, helvOblique, 9, {
      color: COLOR_MUTED,
      leading: 13,
      indent: 12,
    });
  }
  cur.current.down(6);
}

function drawRewriteBlock(
  cur: { current: Cursor },
  doc: PDFDocument,
  helv: PDFFont,
  helvBold: PDFFont,
  helvOblique: PDFFont,
  title: string,
  block: RewriteBlock,
) {
  needs(cur, doc, 100);
  drawText(cur.current, title, helvBold, 12, { leading: 16 });
  drawText(cur.current, "CURRENT", helvBold, 8, {
    color: COLOR_MUTED,
    leading: 11,
  });
  drawText(cur.current, block.current, helv, 10, {
    color: COLOR_MUTED,
    leading: 14,
  });
  cur.current.down(2);
  drawText(cur.current, "STRONGER ALTERNATES", helvBold, 8, {
    color: COLOR_MUTED,
    leading: 11,
  });
  for (const alt of block.alternates) {
    needs(cur, doc, 18);
    drawText(cur.current, `→ ${alt}`, helv, 10, { leading: 14, indent: 10 });
  }
  drawText(cur.current, block.why_better, helvOblique, 9, {
    color: COLOR_MUTED,
    leading: 13,
  });
  cur.current.down(6);
}

function drawValueProps(
  cur: { current: Cursor },
  doc: PDFDocument,
  helv: PDFFont,
  helvBold: PDFFont,
  helvOblique: PDFFont,
  vp: ValuePropRewrite,
) {
  needs(cur, doc, 120);
  drawText(cur.current, "Value props", helvBold, 12, { leading: 16 });
  drawText(cur.current, "CURRENT", helvBold, 8, {
    color: COLOR_MUTED,
    leading: 11,
  });
  for (const c of vp.current) {
    drawText(cur.current, `– ${c}`, helv, 10, {
      color: COLOR_MUTED,
      leading: 14,
      indent: 10,
    });
  }
  cur.current.down(2);
  drawText(cur.current, "REWRITTEN", helvBold, 8, {
    color: COLOR_MUTED,
    leading: 11,
  });
  for (const r of vp.rewritten) {
    drawText(cur.current, `→ ${r}`, helv, 10, { leading: 14, indent: 10 });
  }
  drawText(cur.current, vp.why_better, helvOblique, 9, {
    color: COLOR_MUTED,
    leading: 13,
  });
  cur.current.down(6);
}

function drawWeek(
  cur: { current: Cursor },
  doc: PDFDocument,
  helv: PDFFont,
  helvBold: PDFFont,
  idx: number,
  plan: WeekPlan,
) {
  needs(cur, doc, 80);
  drawText(cur.current, `Week ${idx} — ${plan.theme}`, helvBold, 11, {
    leading: 15,
  });
  for (const d of plan.deliverables) {
    needs(cur, doc, 18);
    drawText(cur.current, `□ ${d}`, helv, 10, { leading: 14, indent: 10 });
  }
  cur.current.down(4);
}

function drawCompetitor(
  cur: { current: Cursor },
  doc: PDFDocument,
  helv: PDFFont,
  helvBold: PDFFont,
  helvOblique: PDFFont,
  c: CompetitorPull,
) {
  needs(cur, doc, 100);
  drawText(cur.current, c.name, helvBold, 11, { leading: 15 });
  drawText(cur.current, c.one_line, helvOblique, 9, {
    color: COLOR_MUTED,
    leading: 13,
  });
  cur.current.down(2);
  drawText(cur.current, "WHAT THEY DO BETTER", helvBold, 8, {
    color: COLOR_MUTED,
    leading: 11,
  });
  for (const b of c.what_they_do_better) {
    drawText(cur.current, `– ${b}`, helv, 10, { leading: 14, indent: 10 });
  }
  if (c.what_you_do_better.length > 0) {
    drawText(cur.current, "WHAT YOU DO BETTER", helvBold, 8, {
      color: COLOR_MUTED,
      leading: 11,
    });
    for (const b of c.what_you_do_better) {
      drawText(cur.current, `+ ${b}`, helv, 10, {
        color: COLOR_GOOD,
        leading: 14,
        indent: 10,
      });
    }
  }
  cur.current.down(6);
}

// ---------------------------------------------------------------------------
// Utility.
// ---------------------------------------------------------------------------

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

/**
 * Locked operator display format (memory: feedback_display_timezone.md):
 *   Europe/Athens, DD-MM-YYYY HH:MM:SS, 24h.
 */
function formatDateAthens(d: Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Athens",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("day")}-${get("month")}-${get("year")} ${get("hour")}:${get("minute")}:${get("second")}`;
}
