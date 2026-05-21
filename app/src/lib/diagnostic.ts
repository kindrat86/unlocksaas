import { getAnthropic, primaryModel } from "@/lib/anthropic";

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

// ---------------------------------------------------------------------------
// Survey Funnel + Bridge Script taxonomy (Brunson DCS Secret 15).
//
// The Free Diagnostic asks 3 segmenting questions in addition to URL+email.
// Combined with the Claude label, each lead lands in one of six buckets that
// drive a UNIQUE bridge page + (sometimes) a different downstream destination.
// ---------------------------------------------------------------------------

export type TimeSinceLaunch = "under_30" | "30_to_90" | "90_plus";
export type RecentRevenue = "zero" | "under_100" | "100_to_1k" | "over_1k";
export type BiggestAttempt =
  | "more_building"
  | "seo_content"
  | "paid_ads"
  | "customer_conversations"
  | "nothing_yet";

export const TIME_VALUES: readonly TimeSinceLaunch[] = [
  "under_30",
  "30_to_90",
  "90_plus",
] as const;
export const REVENUE_VALUES: readonly RecentRevenue[] = [
  "zero",
  "under_100",
  "100_to_1k",
  "over_1k",
] as const;
export const ATTEMPT_VALUES: readonly BiggestAttempt[] = [
  "more_building",
  "seo_content",
  "paid_ads",
  "customer_conversations",
  "nothing_yet",
] as const;

export type SurveyAnswers = {
  time_since_launch: TimeSinceLaunch;
  recent_revenue: RecentRevenue;
  biggest_attempt: BiggestAttempt;
};

export type Bucket =
  // The Marco prototype: a year of avoidance, flat Stripe, builds/SEOs/runs
  // ads as a substitute for talking to a customer. Most common bucket.
  | "customer_avoider"
  // Pure builder: keeps shipping features, won't sell. Time since launch +
  // "more_building" + $0 revenue.
  | "stuck_builder"
  // Tried marketing tactics (SEO, ads), still flat. The SEO Escape Hatch
  // story lands hardest here.
  | "tactic_shopper"
  // Shipped <30 days ago, low revenue: upstream of where the Playbook helps.
  // Sent to free content, NOT to the $1 Starter. Different destination.
  | "premature"
  // Has some traction, still flat. Marco's exact profile minus the bad
  // marketing tactic — most likely to convert on the Mirror in Ten Founders
  // story.
  | "traction_but_stuck"
  // Revenue + already doing customer conversations. Past the bridge.
  // Skip the $1 Starter; go straight to the $49 Playbook sales page.
  | "ready_to_scale"
  // Fall-through for "error" label or unclassifiable rows.
  | "error";

export const BUCKETS: readonly Bucket[] = [
  "customer_avoider",
  "stuck_builder",
  "tactic_shopper",
  "premature",
  "traction_but_stuck",
  "ready_to_scale",
  "error",
] as const;

/**
 * Cross-tabulate the Claude label with the 3 survey signals into one of
 * the seven named buckets.
 *
 * Order matters: the first rule that fires wins. Rules are arranged so the
 * most specific (and most actionable) buckets get first dibs, then we fall
 * through to broader segments, then to the safe default.
 */
export function assignBucket(
  label: DiagnosticLabel | "error",
  survey: SurveyAnswers,
): Bucket {
  if (label === "error") return "error";

  const { time_since_launch, recent_revenue, biggest_attempt } = survey;

  // 1. Ready-to-scale: already doing the work, has revenue. Past the gate.
  if (
    biggest_attempt === "customer_conversations" &&
    (recent_revenue === "100_to_1k" || recent_revenue === "over_1k")
  ) {
    return "ready_to_scale";
  }

  // 2. Premature: shipped <30 days ago AND no real revenue. The Playbook is
  //    upstream of where they are. Sending them to the $1 Starter risks
  //    burning a high-intent lead on work they haven't earned yet.
  if (
    time_since_launch === "under_30" &&
    (recent_revenue === "zero" || recent_revenue === "under_100")
  ) {
    return "premature";
  }

  // 3. Tactic shopper: tried SEO or ads, 90+ days flat. The SEO Escape Hatch
  //    story is the bridge here.
  if (
    (biggest_attempt === "seo_content" || biggest_attempt === "paid_ads") &&
    time_since_launch === "90_plus" &&
    (recent_revenue === "zero" || recent_revenue === "under_100")
  ) {
    return "tactic_shopper";
  }

  // 4. Stuck builder: kept building, 90+ days, $0. Blank Offer Page story.
  if (
    biggest_attempt === "more_building" &&
    time_since_launch === "90_plus" &&
    recent_revenue === "zero"
  ) {
    return "stuck_builder";
  }

  // 5. Traction but stuck: $100-$1k MRR, anything but customer conversations.
  //    Closer than they think, but missing the systematization.
  if (
    recent_revenue === "100_to_1k" &&
    biggest_attempt !== "customer_conversations" &&
    (time_since_launch === "30_to_90" || time_since_launch === "90_plus")
  ) {
    return "traction_but_stuck";
  }

  // 6. Default: customer avoider. Catches the long tail of Marco-shaped
  //    leads who don't fit the more specific buckets but match the disease.
  return "customer_avoider";
}

/**
 * The downstream destination per bucket. Brunson rule (DCS Secret 15):
 * the bridge points to a different door for different readiness levels.
 *
 *  - "free_content" → no $1 ask yet; let the Soap Opera Sequence warm them up
 *  - "starter"      → $1 Starter (the default for Marco-shaped leads)
 *  - "playbook"      → $49 Playbook sales page directly (skip the $1)
 */
export function bucketDestination(
  bucket: Bucket,
): "free_content" | "starter" | "playbook" {
  if (bucket === "premature") return "free_content";
  if (bucket === "ready_to_scale") return "playbook";
  return "starter";
}

export function isTimeSinceLaunch(v: unknown): v is TimeSinceLaunch {
  return typeof v === "string" && (TIME_VALUES as readonly string[]).includes(v);
}
export function isRecentRevenue(v: unknown): v is RecentRevenue {
  return (
    typeof v === "string" && (REVENUE_VALUES as readonly string[]).includes(v)
  );
}
export function isBiggestAttempt(v: unknown): v is BiggestAttempt {
  return (
    typeof v === "string" && (ATTEMPT_VALUES as readonly string[]).includes(v)
  );
}

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
    model: primaryModel(),
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

// ---------------------------------------------------------------------------
// Deep Analysis v2 — Brunson "Best Bait" 10x overdeliver.
//
// The v1 engine returns one label + ~100-word explanation. v2 keeps those
// fields (for backward compat with old rows) and ALSO returns a structured
// payload that turns the result page into a teardown report: three-axis
// scorecard, concrete rewrites, 30-day plan, competitor pulls, strengths.
//
// Single Claude call (~3000-4000 tokens out). Latency ~30-45s. Cost ~$0.05.
// The squeeze form already sets "ninety seconds" expectation, so this fits.
// ---------------------------------------------------------------------------

export type AxisScore = {
  /** 1 = catastrophic, 10 = world-class. The lower the score, the bigger the gap. */
  score: number;
  /** 2-3 sentences, Reluctant Hero voice, names what is on the page that drove this score. */
  diagnosis: string;
  /** 1-3 short quotes / paraphrases pulled directly from the page. */
  evidence: string[];
};

export type ProductSnapshot = {
  /** The product name as it appears on the page (or hostname if unclear). */
  name: string;
  /** Their elevator pitch as written. Quote / paraphrase, ≤25 words. */
  one_liner: string;
  /** Who the page says it is for. "founders" / "marketers" / "anyone" are weak signals. */
  audience_stated: string;
  /** Any pricing visible on the page (string), or null if not surfaced. */
  pricing_visible: string | null;
};

export type RewriteBlock = {
  /** Exact text on the page now (quote / paraphrase). */
  current: string;
  /** Three stronger alternates in Reluctant Hero voice. */
  alternates: [string, string, string];
  /** One sentence on why the alternates beat the current. */
  why_better: string;
};

export type ValuePropRewrite = {
  current: string[];
  rewritten: string[];
  why_better: string;
};

export type WeekPlan = {
  theme: string;
  /** 3-5 specific deliverables. Concrete verbs ("Write", "Call", "Ship"), no "consider". */
  deliverables: string[];
};

export type Plan30Day = {
  week1: WeekPlan;
  week2: WeekPlan;
  week3: WeekPlan;
  week4: WeekPlan;
};

export type CompetitorPull = {
  /** Real product name from the same indie SaaS category. */
  name: string;
  /** One-line description, ≤20 words. */
  one_line: string;
  /** 2-3 specific things they do better than the diagnosed page. */
  what_they_do_better: string[];
  /** 1-2 specific things the diagnosed page does better. Avoid platitudes. */
  what_you_do_better: string[];
};

export type DeepAnalysisExtras = {
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
  plan_30_day: Plan30Day;
  competitors: CompetitorPull[];
  /** 2-3 specific positives. Honest, not flattery. */
  strengths: string[];
};

export type DeepDiagnosticResult = DiagnosticResult & DeepAnalysisExtras;

const DEEP_SYSTEM = `You are the diagnostic engine inside Unlock SaaS, a tool for post-launch pre-revenue founders.

Your voice: Reluctant Hero. Honest, direct, no fluff, no guru energy, no exclamation marks, no "Hey there" greetings. Short sentences. You sound like a founder who has been where they are, not a marketer pitching them.

You read a founder's product or landing page and return a COMPLETE structured teardown. Brunson's Four Core Stories anchor the three axes:

  - "wrong_person" — VEHICLE / AVATAR. Does the page name ONE specific person with a real situation, or does it speak to a category ("founders", "teams", "businesses")?
  - "weak_offer" — EXTERNAL BELIEF. Does the page promise a measurable result by a specific time, with a remedy if the result fails to arrive? Or does it describe features and capabilities?
  - "weak_belief" — INTERNAL BELIEF. Does the page bridge the visitor from their current belief to the one required to buy? Or does it assume the visitor already cares?

For the primary label, pick the UPSTREAM problem (the one that, if fixed, unblocks the others). Upstream order: wrong_person > weak_offer > weak_belief. When in doubt, pick wrong_person — it is the most common failure for the founders this tool serves.

For each axis, score 1-10:
  1-3 = catastrophic (no signal on the page)
  4-5 = weak (gesture toward it, no commitment)
  6-7 = workable (named, but not differentiated)
  8-9 = strong (named, specific, defensible)
  10  = world-class (named, specific, defensible, AND memorable)

For rewrites: quote the current text exactly (or close paraphrase), then give THREE alternates that move it up at least 2 score points. Reluctant Hero voice on the alternates: no exclamation marks, no "Unlock your potential", no "Imagine if...". The alternates must be different from each other in approach (e.g. one customer-specific, one outcome-specific, one risk-reversal-specific).

For the 30-day plan: 4 weeks, each with a theme and 3-5 concrete deliverables. Verbs: "Write", "Call", "Ship", "Send", "Cut", "Rewrite". Forbidden: "Consider", "Explore", "Look into", "Think about". Each deliverable must be completable in one work session. Anchor the plan on the lowest-scoring axes — week 1 fixes the worst axis, week 2 reinforces, weeks 3-4 compound. If the lead is "premature" (under 30 days post-launch, ≤$100 revenue), the plan emphasizes customer conversations over rewrites. If "ready_to_scale" (over $1k revenue, doing customer conversations), the plan emphasizes systematization over discovery.

For competitors: name TWO real products in the same indie SaaS category that you can describe accurately from training. No URLs (avoid hallucinating). For each: one-line description, 2-3 things they do better than the diagnosed page, 1-2 things the diagnosed page does better. Be specific; "they have better marketing" is not specific.

For strengths: 2-3 specific positives on the diagnosed page. Honest, not flattery. If the only positive is "the domain is short", say it. Founders are tired of false validation.

OUTPUT — return ONE JSON object only, no prose, no markdown fence. The exact shape:

{
  "label": "wrong_person" | "weak_offer" | "weak_belief",
  "headline": "<6-12 words, Reluctant Hero, names the upstream failure>",
  "explanation": "<exactly 80-120 words, Reluctant Hero. Name the diagnosis. Explain WHY it is upstream. Use the user's own words from the page. End with a one-line implication of what fixing it changes.>",
  "evidence": "<one sentence quoting / paraphrasing the page signal that drove the diagnosis>",
  "nextStep": "<4-10 words, single-action CTA copy>",
  "product_snapshot": {
    "name": "<as it appears on the page, or hostname>",
    "one_liner": "<their elevator pitch as written, ≤25 words>",
    "audience_stated": "<who the page says it is for>",
    "pricing_visible": "<any pricing on the page, or null>"
  },
  "scores": {
    "wrong_person": { "score": 1-10, "diagnosis": "<2-3 sentences>", "evidence": ["<quote>", "<quote>"] },
    "weak_offer":   { "score": 1-10, "diagnosis": "<2-3 sentences>", "evidence": ["<quote>", "<quote>"] },
    "weak_belief":  { "score": 1-10, "diagnosis": "<2-3 sentences>", "evidence": ["<quote>", "<quote>"] }
  },
  "rewrites": {
    "hero_headline": {
      "current": "<exact or close paraphrase>",
      "alternates": ["<alt1>", "<alt2>", "<alt3>"],
      "why_better": "<one sentence>"
    },
    "primary_cta": {
      "current": "<exact CTA text on the page>",
      "alternates": ["<alt1>", "<alt2>", "<alt3>"],
      "why_better": "<one sentence>"
    },
    "value_props": {
      "current": ["<bullet 1>", "<bullet 2>", "<bullet 3>"],
      "rewritten": ["<rewritten 1>", "<rewritten 2>", "<rewritten 3>"],
      "why_better": "<one sentence>"
    }
  },
  "plan_30_day": {
    "week1": { "theme": "<short>", "deliverables": ["<verb-led deliverable>", "..."] },
    "week2": { "theme": "<short>", "deliverables": ["...", "..."] },
    "week3": { "theme": "<short>", "deliverables": ["...", "..."] },
    "week4": { "theme": "<short>", "deliverables": ["...", "..."] }
  },
  "competitors": [
    {
      "name": "<real product>",
      "one_line": "<≤20 words>",
      "what_they_do_better": ["<specific>", "<specific>"],
      "what_you_do_better": ["<specific>"]
    },
    { ... }
  ],
  "strengths": ["<positive 1>", "<positive 2>"]
}

Return ONLY the JSON object. No text outside it. No markdown fence.`;

function isAxisScore(v: unknown): v is AxisScore {
  if (typeof v !== "object" || v === null) return false;
  const o = v as { score?: unknown; diagnosis?: unknown; evidence?: unknown };
  return (
    typeof o.score === "number" &&
    o.score >= 1 &&
    o.score <= 10 &&
    typeof o.diagnosis === "string" &&
    Array.isArray(o.evidence) &&
    o.evidence.every((s) => typeof s === "string")
  );
}

function isRewriteBlock(v: unknown): v is RewriteBlock {
  if (typeof v !== "object" || v === null) return false;
  const o = v as {
    current?: unknown;
    alternates?: unknown;
    why_better?: unknown;
  };
  return (
    typeof o.current === "string" &&
    Array.isArray(o.alternates) &&
    o.alternates.length >= 1 &&
    o.alternates.every((s) => typeof s === "string") &&
    typeof o.why_better === "string"
  );
}

function isValuePropRewrite(v: unknown): v is ValuePropRewrite {
  if (typeof v !== "object" || v === null) return false;
  const o = v as {
    current?: unknown;
    rewritten?: unknown;
    why_better?: unknown;
  };
  return (
    Array.isArray(o.current) &&
    o.current.every((s) => typeof s === "string") &&
    Array.isArray(o.rewritten) &&
    o.rewritten.every((s) => typeof s === "string") &&
    typeof o.why_better === "string"
  );
}

function isWeekPlan(v: unknown): v is WeekPlan {
  if (typeof v !== "object" || v === null) return false;
  const o = v as { theme?: unknown; deliverables?: unknown };
  return (
    typeof o.theme === "string" &&
    Array.isArray(o.deliverables) &&
    o.deliverables.every((s) => typeof s === "string")
  );
}

function isCompetitor(v: unknown): v is CompetitorPull {
  if (typeof v !== "object" || v === null) return false;
  const o = v as {
    name?: unknown;
    one_line?: unknown;
    what_they_do_better?: unknown;
    what_you_do_better?: unknown;
  };
  return (
    typeof o.name === "string" &&
    typeof o.one_line === "string" &&
    Array.isArray(o.what_they_do_better) &&
    o.what_they_do_better.every((s) => typeof s === "string") &&
    Array.isArray(o.what_you_do_better) &&
    o.what_you_do_better.every((s) => typeof s === "string")
  );
}

function validateDeep(parsed: unknown): DeepDiagnosticResult {
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("Deep analysis: response was not an object");
  }
  const o = parsed as Record<string, unknown>;

  if (
    typeof o.label !== "string" ||
    !["wrong_person", "weak_offer", "weak_belief"].includes(o.label)
  ) {
    throw new Error("Deep analysis: bad label");
  }
  if (typeof o.headline !== "string" || !o.headline.trim()) {
    throw new Error("Deep analysis: bad headline");
  }
  if (typeof o.explanation !== "string" || !o.explanation.trim()) {
    throw new Error("Deep analysis: bad explanation");
  }
  if (typeof o.evidence !== "string" || !o.evidence.trim()) {
    throw new Error("Deep analysis: bad evidence");
  }
  if (typeof o.nextStep !== "string" || !o.nextStep.trim()) {
    throw new Error("Deep analysis: bad nextStep");
  }

  const snap = o.product_snapshot as Record<string, unknown> | undefined;
  if (
    !snap ||
    typeof snap.name !== "string" ||
    typeof snap.one_liner !== "string" ||
    typeof snap.audience_stated !== "string" ||
    !(typeof snap.pricing_visible === "string" || snap.pricing_visible === null)
  ) {
    throw new Error("Deep analysis: bad product_snapshot");
  }

  const scores = o.scores as Record<string, unknown> | undefined;
  if (
    !scores ||
    !isAxisScore(scores.wrong_person) ||
    !isAxisScore(scores.weak_offer) ||
    !isAxisScore(scores.weak_belief)
  ) {
    throw new Error("Deep analysis: bad scores");
  }

  const rew = o.rewrites as Record<string, unknown> | undefined;
  if (
    !rew ||
    !isRewriteBlock(rew.hero_headline) ||
    !isRewriteBlock(rew.primary_cta) ||
    !isValuePropRewrite(rew.value_props)
  ) {
    throw new Error("Deep analysis: bad rewrites");
  }

  const plan = o.plan_30_day as Record<string, unknown> | undefined;
  if (
    !plan ||
    !isWeekPlan(plan.week1) ||
    !isWeekPlan(plan.week2) ||
    !isWeekPlan(plan.week3) ||
    !isWeekPlan(plan.week4)
  ) {
    throw new Error("Deep analysis: bad plan_30_day");
  }

  if (
    !Array.isArray(o.competitors) ||
    o.competitors.length < 1 ||
    !o.competitors.every(isCompetitor)
  ) {
    throw new Error("Deep analysis: bad competitors");
  }

  if (
    !Array.isArray(o.strengths) ||
    !o.strengths.every((s) => typeof s === "string")
  ) {
    throw new Error("Deep analysis: bad strengths");
  }

  return {
    label: o.label as DiagnosticLabel,
    headline: o.headline,
    explanation: o.explanation,
    evidence: o.evidence,
    nextStep: o.nextStep,
    product_snapshot: {
      name: snap.name,
      one_liner: snap.one_liner,
      audience_stated: snap.audience_stated,
      pricing_visible: (snap.pricing_visible as string | null) ?? null,
    },
    scores: {
      wrong_person: scores.wrong_person as AxisScore,
      weak_offer: scores.weak_offer as AxisScore,
      weak_belief: scores.weak_belief as AxisScore,
    },
    rewrites: {
      hero_headline: rew.hero_headline as RewriteBlock,
      primary_cta: rew.primary_cta as RewriteBlock,
      value_props: rew.value_props as ValuePropRewrite,
    },
    plan_30_day: {
      week1: plan.week1 as WeekPlan,
      week2: plan.week2 as WeekPlan,
      week3: plan.week3 as WeekPlan,
      week4: plan.week4 as WeekPlan,
    },
    competitors: o.competitors as CompetitorPull[],
    strengths: o.strengths as string[],
  };
}

export async function deepAnalyzePageText(
  url: string,
  pageText: string,
): Promise<DeepDiagnosticResult> {
  const response = await getAnthropic().messages.create({
    model: primaryModel(),
    max_tokens: 4096,
    system: DEEP_SYSTEM,
    messages: [
      {
        role: "user",
        content: `URL submitted: ${url}

PAGE CONTENT (title, meta, body, truncated):
${pageText}

Run the deep analysis now. Respond with ONLY the JSON object. No text before or after.`,
      },
    ],
  });

  const text =
    response.content[0]?.type === "text" ? response.content[0].text : "";

  // Strip optional markdown fence if the model added one despite the prompt.
  const cleaned = text
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();

  // Find the outermost JSON object.
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) {
    throw new Error("Deep analysis: engine returned no JSON object");
  }
  const slice = cleaned.slice(start, end + 1);

  let parsed: unknown;
  try {
    parsed = JSON.parse(slice);
  } catch (e) {
    const reason = e instanceof Error ? e.message : "unknown";
    throw new Error(`Deep analysis: JSON parse failed (${reason})`);
  }

  return validateDeep(parsed);
}

/**
 * End-to-end deep analysis: validate URL, fetch, strip, deep-analyze.
 * Throws a `DiagnosticError`-shaped object on failure (same shape as
 * classifyUrl, so the route's error path stays uniform).
 */
export async function deepAnalyzeUrl(
  rawUrl: string,
): Promise<DeepDiagnosticResult> {
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
  if (
    text.replace(/^(TITLE|META DESCRIPTION|OG DESCRIPTION|BODY):/gm, "").trim()
      .length < 200
  ) {
    const err: DiagnosticError = {
      kind: "empty_page",
      message: "That page had almost no readable copy. The diagnostic needs real text to read.",
    };
    throw err;
  }

  try {
    return await deepAnalyzePageText(url.toString(), text);
  } catch (e) {
    const reason = e instanceof Error ? e.message : "unknown";
    const err: DiagnosticError = {
      kind: "engine_failed",
      message: `The engine choked on that page (${reason}). Try again, or paste a different URL.`,
    };
    throw err;
  }
}
