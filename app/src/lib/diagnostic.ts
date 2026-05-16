import { getAnthropic } from "@/lib/anthropic";

/**
 * Diagnostic engine for the Free Diagnostic Lead Funnel.
 *
 * Reads a founder's product/landing URL and labels it as one of three
 * Brunson-mapped failure modes:
 *
 *   - "wrong_person" (Vehicle Story problem) → copy speaks to a category, not a person
 *   - "weak_offer"   (External Belief problem) → features without a guaranteed result
 *   - "weak_belief"  (Internal Belief problem) → page assumes visitor already cares
 *
 * Source: strategy/workbooks/04-building-your-funnels.md §3 (Diagnostic Result),
 *         strategy/workbooks/06-creating-belief.md §2-§3 (Four Core Stories).
 *
 * Voice: Reluctant Hero (strategy/workbooks/01-sales-funnel-secrets.md §6).
 */

export type DiagnosticLabel = "wrong_person" | "weak_offer" | "weak_belief";

export type DiagnosticResult = {
  label: DiagnosticLabel;
  headline: string; // ~6-12 words, Reluctant Hero
  explanation: string; // ~100 words, Reluctant Hero
  evidence: string; // one sentence quoting / paraphrasing the page
  nextStep: string; // single-action CTA copy
};

export type DiagnosticError = {
  kind: "fetch_failed" | "blocked_host" | "invalid_url" | "empty_page" | "engine_failed";
  message: string;
};

const MAX_HTML_CHARS = 200_000;
const MAX_TEXT_CHARS = 8_000;
const FETCH_TIMEOUT_MS = 8_000;

/**
 * Reject obviously private / loopback hosts before we let `fetch` chase them.
 * Not a complete SSRF defense — Vercel functions don't sit on a private VPC by
 * default, so the blast radius is small — but it kills the easy mistakes.
 */
function isBlockedHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".local")) return true;
  if (h === "0.0.0.0" || h === "::1") return true;
  if (/^127\./.test(h)) return true;
  if (/^10\./.test(h)) return true;
  if (/^192\.168\./.test(h)) return true;
  if (/^169\.254\./.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true;
  return false;
}

/**
 * Validate + normalize the founder's URL. Accept bare domains too —
 * Marco will paste "myproduct.com" half the time.
 */
export function normalizeUrl(input: string): URL | null {
  if (!input) return null;
  let candidate = input.trim();
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }
  try {
    const u = new URL(candidate);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    if (!u.hostname || !u.hostname.includes(".")) return null;
    return u;
  } catch {
    return null;
  }
}

async function fetchPage(url: URL): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        // Identify ourselves so site owners can see who's hitting them, and
        // some Cloudflare WAFs will serve real HTML to a UA that names a bot
        // honestly instead of pretending to be Chrome.
        "User-Agent":
          "UnlockSaaS-Diagnostic/1.0 (+https://unlocksaas.com/diagnostic)",
        Accept: "text/html,application/xhtml+xml",
      },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const html = await res.text();
    return html.slice(0, MAX_HTML_CHARS);
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Strip HTML to plain text in a way that preserves the semantic signal
 * the classifier needs (headings, button copy, body text) without burning
 * tokens on nav garbage and inline SVGs.
 */
export function htmlToText(html: string): string {
  let s = html;
  s = s.replace(/<script[\s\S]*?<\/script>/gi, " ");
  s = s.replace(/<style[\s\S]*?<\/style>/gi, " ");
  s = s.replace(/<svg[\s\S]*?<\/svg>/gi, " ");
  s = s.replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");
  // Pull title + meta description forward so the classifier sees them.
  const titleMatch = s.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const descMatch = s.match(
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
  );
  const ogDescMatch = s.match(
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
  );
  const lead: string[] = [];
  if (titleMatch) lead.push(`TITLE: ${titleMatch[1].trim()}`);
  if (descMatch) lead.push(`META DESCRIPTION: ${descMatch[1].trim()}`);
  if (ogDescMatch) lead.push(`OG DESCRIPTION: ${ogDescMatch[1].trim()}`);
  // Now the body: strip tags, collapse whitespace.
  s = s.replace(/<[^>]+>/g, " ");
  s = s.replace(/&nbsp;/g, " ");
  s = s.replace(/&amp;/g, "&");
  s = s.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
  s = s.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  s = s.replace(/\s+/g, " ").trim();
  const body = s.slice(0, MAX_TEXT_CHARS - lead.join("\n").length - 16);
  return [...lead, "BODY:", body].join("\n");
}

const CLASSIFIER_SYSTEM = `You are the diagnostic engine inside Unlock SaaS, a tool for post-launch pre-revenue founders.

Your voice: Reluctant Hero. Honest, direct, no fluff, no guru energy, no exclamation marks. Short sentences. You sound like a founder who has been where they are, not a marketer pitching them. Never start with "Hey there" or any greeting.

You read a founder's product or landing page and return exactly ONE of three diagnoses. The three failure modes (anchored in Brunson's Four Core Stories, see strategy/workbooks/06):

1. "wrong_person" — VEHICLE / AVATAR problem.
   The copy speaks to a category ("founders", "teams", "businesses") instead of one specific person with a named situation. No quoted pain, no real name of who it is for, no congregation. Even if it lists features, the reader cannot tell if it is for them.

2. "weak_offer" — EXTERNAL BELIEF problem.
   The page describes features, capabilities, or tooling. It does NOT promise a specific measurable result by a specific time, with a remedy if the result does not arrive. Hedging language ("helps you", "supports your", "designed to") instead of a guarantee.

3. "weak_belief" — INTERNAL BELIEF problem.
   The page assumes the visitor already believes the problem matters and the solution is real. No epiphany bridge. No "why this and not the obvious alternative." No reframe of the false belief that keeps the visitor stuck. Reads like documentation, not persuasion.

DECISION RULE — pick the one that the founder must FIX FIRST. If two are present, pick the upstream one. Upstream order: wrong_person > weak_offer > weak_belief. Wrong person is upstream of weak offer (you cannot promise a result if you do not know who you are promising to). Weak offer is upstream of weak belief (you cannot make someone believe in a promise that is not there).

When in doubt, pick wrong_person — it is the most common failure mode for the founders this tool was built for.

OUTPUT — return JSON only, no prose around it:

{
  "label": "wrong_person" | "weak_offer" | "weak_belief",
  "headline": "<6-12 words, Reluctant Hero voice, names the failure mode>",
  "explanation": "<exactly 80-120 words, Reluctant Hero voice. Name the diagnosis. Then explain WHY this is the upstream problem. Use the user's own words from the page where you can. No platitudes. No marketing copy. Do not address them as 'you guys' or 'friend'. End with a one-line implication of what fixing it changes.>",
  "evidence": "<one sentence pointing to the specific signal on the page that drove the diagnosis. Quote a phrase if useful.>",
  "nextStep": "<single-action CTA copy, 4-10 words, e.g. 'Pin your dream customer for $1.'>"
}

Do not include markdown, do not include any text outside the JSON object.`;

export async function classifyPageText(
  url: string,
  pageText: string,
): Promise<DiagnosticResult> {
  const response = await getAnthropic().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 700,
    system: CLASSIFIER_SYSTEM,
    messages: [
      {
        role: "user",
        content: `URL submitted: ${url}

PAGE CONTENT (title, meta, body, truncated):
${pageText}

Diagnose this page now. Respond with ONLY the JSON object.`,
      },
    ],
  });

  const text =
    response.content[0]?.type === "text" ? response.content[0].text : "";

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Engine returned no JSON object");
  }

  const parsed = JSON.parse(jsonMatch[0]) as Partial<DiagnosticResult>;
  if (
    !parsed.label ||
    !["wrong_person", "weak_offer", "weak_belief"].includes(parsed.label) ||
    !parsed.headline ||
    !parsed.explanation ||
    !parsed.evidence ||
    !parsed.nextStep
  ) {
    throw new Error("Engine returned incomplete diagnosis");
  }

  return parsed as DiagnosticResult;
}

/**
 * End-to-end: validate URL, fetch, strip, classify.
 * Throws a `DiagnosticError`-shaped object on failure.
 */
export async function classifyUrl(
  rawUrl: string,
): Promise<DiagnosticResult> {
  const url = normalizeUrl(rawUrl);
  if (!url) {
    const err: DiagnosticError = {
      kind: "invalid_url",
      message: "That does not look like a URL I can read. Paste a full https:// link.",
    };
    throw err;
  }
  if (isBlockedHost(url.hostname)) {
    const err: DiagnosticError = {
      kind: "blocked_host",
      message: "I cannot read internal or local addresses. Use your public product URL.",
    };
    throw err;
  }

  let html: string;
  try {
    html = await fetchPage(url);
  } catch (e) {
    const reason = e instanceof Error ? e.message : "unknown";
    const err: DiagnosticError = {
      kind: "fetch_failed",
      message: `I could not load that page (${reason}). If it is behind login or Cloudflare's challenge, paste a public version.`,
    };
    throw err;
  }

  const text = htmlToText(html);
  if (text.replace(/^(TITLE|META DESCRIPTION|OG DESCRIPTION|BODY):/gm, "").trim().length < 200) {
    const err: DiagnosticError = {
      kind: "empty_page",
      message: "That page had almost no readable copy. The diagnostic needs real text to read.",
    };
    throw err;
  }

  try {
    return await classifyPageText(url.toString(), text);
  } catch (e) {
    const reason = e instanceof Error ? e.message : "unknown";
    const err: DiagnosticError = {
      kind: "engine_failed",
      message: `The engine choked on that page (${reason}). Try again, or paste a different URL.`,
    };
    throw err;
  }
}

export function isDiagnosticError(e: unknown): e is DiagnosticError {
  return (
    typeof e === "object" &&
    e !== null &&
    "kind" in e &&
    "message" in e &&
    typeof (e as DiagnosticError).kind === "string"
  );
}
