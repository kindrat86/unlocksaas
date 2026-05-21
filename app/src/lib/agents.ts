/**
 * Agentic execution layer for The Machine.
 *
 * Isenberg overlay (vertical agent on a boring pain): today The Machine is
 * framework delivery (Q&A → assembled deliverable). This module is the
 * "engine does the work the founder is avoiding" layer. Three agents in v1:
 *
 *   - offer_scorer     Score the Step 2 offer against Brunson rubric + rewrite
 *                      the weakest beat. Tier: $1 Starter (Step 2 is in scope).
 *   - outreach_drafter Given a logged target (channel + name + notes), draft
 *                      a Reluctant-Hero message *for that specific target*.
 *                      Tier: $49 Core (Step 6 is already gated).
 *   - page_rewriter    Given the founder's current landing-page text, rewrite
 *                      headlines + hero + OTO using the locked WHO/WHAT/VOICE.
 *                      Tier: $49 Core (Step 4 is already gated).
 *
 * Reuses the same AI Gateway model (anthropic/claude-sonnet-4.6) as the engine
 * Q&A route at /api/engine. Persists runs to public.agent_runs so the UI can
 * hydrate on return, and so the operator can later score Brunson
 * Results-in-Advance: did the founder USE the agent output, or just generate
 * it.
 *
 * Voice: Reluctant Hero. The agents do not write like a marketing tool; they
 * write like the founder's blunt friend who has already shipped.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { generateText } from "ai";
import { model, MODEL_ID } from "@/lib/anthropic";
import { loadStepOutputs, type EngineStepId } from "@/lib/step-outputs";

export const AGENT_KINDS = [
  "offer_scorer",
  "outreach_drafter",
  "page_rewriter",
] as const;
export type AgentKind = (typeof AGENT_KINDS)[number];

const MODEL = model;
const MAX_TOKENS = 1800;

const RELUCTANT_HERO_VOICE = `Your voice: Reluctant Hero (workbook 01 §6).
- Direct, honest, no fluff, no guru energy.
- Confess flaws. Name the lie before the cure.
- Stand FOR: one real person; the non-engineer who shipped anyway; honest math; first paying customer as the only proof.
- Stand AGAINST: SEO/AEO/GEO as a substitute for selling; tooling that quietly assumes you can code; "validate your idea" advice handed to founders who already shipped; praise treated as traction.
- Never use em dashes. Use en dashes (–) instead.`;

interface AgentLLMArgs {
  system: string;
  user: string;
  /** Loose hint to constrain output. We still parse defensively. */
  format?: "json" | "markdown";
}

/**
 * Call the LLM. Returns trimmed text. We let JSON parsing happen in the
 * per-agent handlers since each agent has its own schema and salvage logic
 * (mirrors the pattern in /api/engine/route.ts which double-parses + falls
 * back to a regex match before giving up).
 */
async function callLLM({ system, user }: AgentLLMArgs): Promise<string> {
  const { text } = await generateText({
    model: MODEL,
    maxOutputTokens: MAX_TOKENS,
    system,
    prompt: user,
  });
  return text;
}

function safeJsonParse<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]) as T;
    } catch {
      return null;
    }
  }
}

// ---------------------------------------------------------------------------
// Offer scorer
// ---------------------------------------------------------------------------

export interface OfferScorerInput {
  /** Required: the assembled Step 2 output (from project_state.offer.output_text). */
  offerOutput: string;
}

export interface OfferScorecard {
  specificity: number; // 0–25
  guarantee: number; // 0–25
  math: number; // 0–25
  irresistibility: number; // 0–25
  total: number; // 0–100
}

export interface OfferScorerOutput {
  scorecard: OfferScorecard;
  weakest_beat: string;
  weakness_note: string;
  rewrite: string;
}

export async function runOfferScorer(
  input: OfferScorerInput
): Promise<OfferScorerOutput> {
  const system = `You are the engine inside "The Machine," a Brunson Secrets Trilogy product for post-launch pre-revenue founders.
${RELUCTANT_HERO_VOICE}

You score the user's offer against a four-beat rubric and rewrite the weakest beat.

Rubric (each 0–25, total 0–100):
- specificity: Is this a single named result for a single named person, or is it a feature list / category?
- guarantee: Is there a concrete remedy with a real timeframe and a measurable trigger? Hedge words ("we try", "we aim") cap this at 10.
- math: Does the value justify the price with a defensible 10x ratio? Inflated counter-factuals ("a consultant would charge $50k") cap this at 12.
- irresistibility: Would a skeptical reader in the target audience pay? Bonus for stack clarity and real bonuses; penalty for filler.

Output strict JSON:
{
  "scorecard": { "specificity": 0-25, "guarantee": 0-25, "math": 0-25, "irresistibility": 0-25, "total": 0-100 },
  "weakest_beat": "specificity|guarantee|math|irresistibility",
  "weakness_note": "one paragraph naming the gap in Reluctant Hero voice, no more than 4 sentences",
  "rewrite": "a rewritten version of the offer that fixes the weakest beat. Markdown allowed for headline + bullets. Keep the user's voice; do not invent facts. If you must speculate, mark it [PLACEHOLDER]."
}

Respond with ONLY the JSON object. No prose before or after.`;

  const user = `OFFER:\n${input.offerOutput.trim()}\n\nScore it. Rewrite the weakest beat.`;

  const text = await callLLM({ system, user, format: "json" });
  const parsed = safeJsonParse<OfferScorerOutput>(text);
  if (!parsed || typeof parsed.scorecard?.total !== "number") {
    throw new Error(
      "offer_scorer returned malformed output — try again in a moment"
    );
  }
  // Clamp scores defensively so a hallucinated 47 cannot blow past 25.
  const clamp = (n: unknown): number => {
    const v = typeof n === "number" ? n : 0;
    return Math.max(0, Math.min(25, Math.round(v)));
  };
  const sc: OfferScorecard = {
    specificity: clamp(parsed.scorecard.specificity),
    guarantee: clamp(parsed.scorecard.guarantee),
    math: clamp(parsed.scorecard.math),
    irresistibility: clamp(parsed.scorecard.irresistibility),
    total: 0,
  };
  sc.total = sc.specificity + sc.guarantee + sc.math + sc.irresistibility;
  return { ...parsed, scorecard: sc };
}

// ---------------------------------------------------------------------------
// Outreach drafter
// ---------------------------------------------------------------------------

export interface OutreachDrafterInput {
  /** Channel where the message will land (e.g. "Indie Hackers", "r/SaaS", "X DM"). */
  targetChannel: string;
  /** Target name or handle (e.g. "Pieter Levels", "u/some_user"). */
  targetName: string;
  /** Optional founder notes about the target. */
  notes?: string;
}

export interface OutreachDrafterContext {
  dreamCustomer?: string;
  offer?: string;
  ac?: string;
  outreachAssets?: string;
}

export interface OutreachDrafterOutput {
  draft: string;
  channel: string;
  target: string;
  why_this_target: string;
}

export async function runOutreachDrafter(
  input: OutreachDrafterInput,
  ctx: OutreachDrafterContext
): Promise<OutreachDrafterOutput> {
  const system = `You are the engine inside "The Machine."
${RELUCTANT_HERO_VOICE}

You write ONE outreach message for ONE specific target on ONE specific channel.
This is the avoidance step. The founder will not send a bad message — but they will avoid sending any message until you make the bar so low that sending it is easier than avoiding it.

Rules:
- Story first. Offer last.
- Under 150 words for DM/comment channels. Under 200 words for cold email.
- No urgency tricks, no fake scarcity, no praise junkie openers ("love your work").
- Soft trial close: name the small win (the Starter), not the subscription.
- If the channel suggests a public reply (Reddit / forum / public X), open with a one-line empathy + a confession, then offer.
- If the channel is a 1:1 DM or cold email, be direct: name them, name the bridge, name the small win.

Output strict JSON:
{
  "draft": "the message body, ready to paste",
  "channel": "echo back the channel",
  "target": "echo back the target",
  "why_this_target": "one sentence on why this is a good target for this user, drawn from the user's context"
}

Respond with ONLY the JSON object.`;

  const ctxBlocks = [
    ctx.dreamCustomer ? `DREAM CUSTOMER:\n${ctx.dreamCustomer}` : null,
    ctx.offer ? `OFFER:\n${ctx.offer}` : null,
    ctx.ac ? `ATTRACTIVE CHARACTER:\n${ctx.ac}` : null,
    ctx.outreachAssets
      ? `OUTREACH ASSETS (style reference, not a copy-paste source):\n${ctx.outreachAssets}`
      : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  const user = `${ctxBlocks}\n\nTARGET: ${input.targetName}\nCHANNEL: ${input.targetChannel}\nNOTES: ${input.notes ?? "(none)"}\n\nDraft the message.`;

  const text = await callLLM({ system, user, format: "json" });
  const parsed = safeJsonParse<OutreachDrafterOutput>(text);
  if (!parsed || typeof parsed.draft !== "string" || !parsed.draft.trim()) {
    throw new Error("outreach_drafter returned no draft — try again");
  }
  return {
    draft: parsed.draft.trim(),
    channel: input.targetChannel,
    target: input.targetName,
    why_this_target: parsed.why_this_target ?? "",
  };
}

// ---------------------------------------------------------------------------
// Page rewriter
// ---------------------------------------------------------------------------

export interface PageRewriterInput {
  /** Pasted landing-page text (plain text or markdown). HTML is fine; we strip tags client-side first. */
  pageText: string;
}

export interface PageRewriterContext {
  dreamCustomer?: string;
  offer?: string;
  ac?: string;
  scripts?: string;
}

export interface PageRewriterOutput {
  headlines: string[]; // 5 curiosity-based variants
  hero_section: string; // 1 rewritten hero block (headline + sub + first paragraph)
  oto_block: string; // 1 OTO upsell block (two-button, one-decision)
  notes: string; // brief operator note on what changed and why
}

export async function runPageRewriter(
  input: PageRewriterInput,
  ctx: PageRewriterContext
): Promise<PageRewriterOutput> {
  const system = `You are the engine inside "The Machine."
${RELUCTANT_HERO_VOICE}

You rewrite a landing page using the user's locked WHO (dream customer), WHAT (offer), and VOICE (attractive character).

Rewrite rules:
- Keep the user's product facts. Do NOT invent prices, features, integrations, or testimonials.
- Use the AC voice from their Step 3 output. Do NOT impose generic SaaS marketing voice.
- Headlines must be curiosity-based + specific. No "Grow your business faster" energy.
- The hero section is one bold headline + one subhead + one 2–3 sentence opener.
- The OTO block is a two-button, one-decision affordance: continue with the full offer, or walk away with the small win.
- If a fact is missing from the user's context, write [PLACEHOLDER: what is missing] rather than guess.

Output strict JSON:
{
  "headlines": ["string", "string", "string", "string", "string"],
  "hero_section": "markdown",
  "oto_block": "markdown",
  "notes": "one paragraph operator note: what changed, what stayed, what you marked [PLACEHOLDER] and why"
}

Respond with ONLY the JSON object.`;

  const ctxBlocks = [
    ctx.dreamCustomer ? `DREAM CUSTOMER:\n${ctx.dreamCustomer}` : null,
    ctx.offer ? `OFFER:\n${ctx.offer}` : null,
    ctx.ac ? `ATTRACTIVE CHARACTER:\n${ctx.ac}` : null,
    ctx.scripts ? `SCRIPTS (style reference):\n${ctx.scripts}` : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  // Hard cap pasted page text so we don't blow the context window on a
  // pasted novel. 12k chars is enough for a hero + features + footer.
  const trimmed = input.pageText.slice(0, 12000);
  const user = `${ctxBlocks}\n\nCURRENT LANDING PAGE TEXT (pasted by the user):\n"""\n${trimmed}\n"""\n\nRewrite headline (5 variants), hero, OTO. Honor the user's voice.`;

  const text = await callLLM({ system, user, format: "json" });
  const parsed = safeJsonParse<PageRewriterOutput>(text);
  if (
    !parsed ||
    !Array.isArray(parsed.headlines) ||
    parsed.headlines.length === 0 ||
    typeof parsed.hero_section !== "string"
  ) {
    throw new Error("page_rewriter returned malformed output — try again");
  }
  return {
    headlines: parsed.headlines.slice(0, 5).map((h) => String(h).trim()),
    hero_section: String(parsed.hero_section).trim(),
    oto_block: String(parsed.oto_block ?? "").trim(),
    notes: String(parsed.notes ?? "").trim(),
  };
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

export interface PersistAgentRunArgs {
  adminClient: SupabaseClient;
  projectId: string;
  kind: AgentKind;
  input: unknown;
  output: unknown;
  durationMs: number;
}

export async function persistAgentRun(
  args: PersistAgentRunArgs
): Promise<boolean> {
  const { adminClient, projectId, kind, input, output, durationMs } = args;
  // database.types.ts has not been regenerated since this migration landed, so
  // the table isn't on the typed surface yet. Cast through `never` like
  // playbook/page.tsx does for profile_id on verified_conversions. TODO:
  // regenerate types after this ships.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (adminClient as any).from("agent_runs").insert({
    project_id: projectId,
    agent_kind: kind,
    input,
    output,
    duration_ms: durationMs,
    model: MODEL_ID,
  });
  if (error) {
    console.error("[agents] persistAgentRun failed", {
      projectId,
      kind,
      message: error.message,
    });
    return false;
  }
  return true;
}

/**
 * Load the most recent agent_runs for a project, keyed by kind. UI hydration
 * helper — returns one most-recent run per kind so the step pages can show
 * the previous result on revisit.
 */
export async function loadMostRecentAgentRuns(
  adminClient: SupabaseClient,
  projectId: string
): Promise<Partial<Record<AgentKind, { output: unknown; created_at: string }>>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (adminClient as any)
    .from("agent_runs")
    .select("agent_kind, output, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (!data || !Array.isArray(data)) return {};
  const result: Partial<
    Record<AgentKind, { output: unknown; created_at: string }>
  > = {};
  for (const row of data) {
    const kind = row.agent_kind as AgentKind;
    if (!result[kind]) {
      result[kind] = { output: row.output, created_at: row.created_at };
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Context loaders
// ---------------------------------------------------------------------------

/** Pull whichever prior-step outputs exist on this project, as plain strings. */
export async function loadProjectAgentContext(
  client: SupabaseClient,
  projectId: string
): Promise<Record<EngineStepId, string | undefined>> {
  const outputs = await loadStepOutputs(client, projectId);
  return {
    "1": outputs["1"]?.output_text,
    "2": outputs["2"]?.output_text,
    "3": outputs["3"]?.output_text,
    "4": outputs["4"]?.output_text,
    "5": outputs["5"]?.output_text,
  };
}
