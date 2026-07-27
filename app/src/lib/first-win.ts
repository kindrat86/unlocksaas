/**
 * First-Win agent — the AI onboarding flow that fires after $1 Starter checkout.
 *
 * Spec source: the 2026 onboarding research (see build-log) confirms time-to-
 * value under 5 minutes lifts free-to-paid conversion above 25%. The agent
 * collapses two "future-you-was-going-to-procrastinate" deliverables into a
 * live streaming experience the founder watches happen:
 *
 *   1. Attractive Character profile (Step 3 deliverable, workbook 01 §6)
 *   2. Soap Opera Email 1 (Step 4-adjacent, workbook 04 §5 + lib/soap-opera/emails.ts)
 *
 * Both are STARTER drafts. The Reluctant Hero voice forbids us from inventing
 * the founder's life – when we don't know a backstory beat, a polarity belief,
 * or a real story, we emit [PLACEHOLDER: ...] and instruct the founder to fill
 * it. That keeps the agent honest (no hallucinated bios) while still delivering
 * a usable starter the founder can edit in 5 minutes.
 *
 * The deliverables match the shape of the human-flow:
 *   - The AC draft matches engine route Step 3 assembly format (Identity Type,
 *     Three-line bio, One named story, Two character flaws, Polarity FOR/AGAINST,
 *     One disqualifying line).
 *   - The SOS Email 1 draft matches lib/soap-opera/emails.ts structure (opener
 *     tied to the founder's diagnosis or product, 4-6 body paragraphs, PS line
 *     pointing at the founder's OWN $1 offer, signed off in Reluctant Hero voice).
 *
 * Streaming protocol: server-sent events. The route handler at
 * /api/first-win/stream owns the wire format; this module yields typed events
 * that the route serializes. The UI shows visible reasoning steps as they
 * arrive, then token-streams the AC draft, then token-streams the SOS draft.
 * Total wall time target: <90s of streaming + immediately editable artifacts.
 *
 * Persistence: on success we insert a row into agent_runs with
 * agent_kind = 'first_win_starter'. The /first-win page rehydrates from that
 * row on revisit so the founder never re-runs the same generation on F5.
 */
import type { SupabaseClient } from "@/lib/supabase/types";
import { streamText } from "ai";
import { model, MODEL_ID } from "@/lib/anthropic";

export const FIRST_WIN_AGENT_KIND = "first_win_starter" as const;

const MAX_TOKENS_AC = 1800;
const MAX_TOKENS_SOS = 1600;

// Reluctant Hero voice – mirrors lib/agents.ts. Centralised here so future
// agent files can share without circular imports.
const RELUCTANT_HERO_VOICE = `Your voice: Reluctant Hero (workbook 01 §6).
- Direct, honest, no fluff, no guru energy.
- Confess flaws. Name the lie before the cure.
- Stand FOR: one real person; the non-engineer who shipped anyway; honest math; first paying customer as the only proof.
- Stand AGAINST: SEO/AEO/GEO as a substitute for selling; tooling that quietly assumes you can code; "validate your idea" advice handed to founders who already shipped; praise treated as traction.
- NEVER use em dashes (—). Always use en dashes (–) instead.
- When you do not know a fact about the founder (a backstory, a flaw, a polarity belief), emit [PLACEHOLDER: short description of what to fill] inline. Do NOT invent.`;

// ---------------------------------------------------------------------------
// Input + output types
// ---------------------------------------------------------------------------

export interface FirstWinInput {
  /** Founder's diagnostic_leads row id, if they came in through the squeeze. */
  diagnosticLeadId?: string | null;
  /** Founder's product URL (from diagnostic_leads.product_url). */
  productUrl?: string | null;
  /** Diagnostic label, if any. */
  diagnosis?:
    | "wrong_person"
    | "weak_offer"
    | "weak_belief"
    | "error"
    | null;
  /**
   * Stringified analysis_detail JSONB from the deep diagnostic. Optional but
   * strongly preferred – when present, the AC + SOS drafts are dramatically
   * better grounded in the founder's actual product copy.
   */
  diagnosticSummary?: string | null;
  /** If the founder already drafted Step 1 (Dream Customer), pass it through. */
  dreamCustomerText?: string | null;
  /** If the founder already drafted Step 2 (Offer), pass it through. */
  offerText?: string | null;
  /** Founder's email – used as a fallback addressee if no other identity exists. */
  founderEmail: string;
}

export interface FirstWinOutput {
  ac_profile_draft: string;
  sos_email_1_draft: string;
  reasoning_steps: string[];
  placeholders: string[];
}

// ---------------------------------------------------------------------------
// Streaming events – consumed by the SSE route handler
// ---------------------------------------------------------------------------

export type FirstWinEvent =
  /** A short visible-reasoning label the UI shows in the "what the agent is doing now" line. */
  | { type: "step"; label: string }
  /** Raw token from the model, scoped to which artifact it belongs to. */
  | { type: "token"; section: "ac" | "sos1"; text: string }
  /** A whole section is complete – UI can swap the streaming view for an editable view. */
  | { type: "section_complete"; section: "ac" | "sos1"; markdown: string }
  /** Run is done – emits the agent_runs.id so the UI can hydrate on F5. */
  | { type: "done"; runId: string | null; output: FirstWinOutput }
  /** Run failed – UI shows a retry affordance with the message. */
  | { type: "error"; message: string };

// ---------------------------------------------------------------------------
// Prompts
// ---------------------------------------------------------------------------

function acPrompt(input: FirstWinInput): { system: string; user: string } {
  const system = `You are the engine inside "The Playbook," a Brunson Secrets Trilogy product for post-launch pre-revenue founders.
${RELUCTANT_HERO_VOICE}

The founder just paid $1 for the Starter. They have not yet built their Attractive Character (Step 3). Your job: draft a STARTER version of their AC profile they can edit in 5 minutes.

The five Attractive Character beats are: Identity Type, Backstory, Stories, Character Flaws, Polarity.

You have limited information about the founder: their product URL, possibly a diagnostic teardown of their landing page, and maybe Steps 1 + 2 if they completed them. You do NOT know their personal history. When a beat needs a fact you do not have, write [PLACEHOLDER: short description] inline – do not invent.

Assemble the following sections as markdown with bold headers:

1. **Identity Type** – pick one of: Reluctant Hero / Leader / Adventurer / Reporter. Reluctant Hero is the default for post-launch pre-revenue founders. Justify in one sentence drawn from their product or diagnostic.
2. **Three-line bio** – one paragraph (3-4 sentences) the founder would use as a landing-page sub-headline and 30-second video opener. Use [PLACEHOLDER] for any personal detail you do not have.
3. **One named story** – a 4-6 sentence scene that hooks their audience. If you do not have a real scene, write a story-shaped template with [PLACEHOLDER: the moment you realised X] markers the founder can fill.
4. **Two owned character flaws** – first person, short paragraphs. Each flaw must be one the founder still fights. If you do not know the founder's flaws, write two flaws common to non-engineer founders who just shipped (e.g. "I refresh Stripe instead of sending the next message"; "I built features instead of writing the offer"). Mark them [PLACEHOLDER: confirm or replace with your real flaw].
5. **Polarity** – two short lists:
   - FOR: 3-5 statements about what you stand for (real customer over vanity metric, etc.). Use [PLACEHOLDER] if you cannot ground them in their product.
   - AGAINST: 3-5 statements about what you stand against. Same rule.
6. **One disqualifying line** – a "This is NOT for you if..." sentence for their sales page.

Do not include any preamble, do not greet the founder, do not narrate what you are about to do. Respond with ONLY the markdown sections above, in that order, separated by blank lines.`;

  const user = [
    `FOUNDER EMAIL: ${input.founderEmail}`,
    input.productUrl ? `PRODUCT URL: ${input.productUrl}` : null,
    input.diagnosis ? `DIAGNOSIS LABEL: ${input.diagnosis}` : null,
    input.diagnosticSummary
      ? `DIAGNOSTIC TEARDOWN (Brunson three-axis analysis of their landing page):\n${input.diagnosticSummary.slice(
          0,
          4000
        )}`
      : null,
    input.dreamCustomerText
      ? `STEP 1 (DREAM CUSTOMER, already drafted):\n${input.dreamCustomerText.slice(
          0,
          1500
        )}`
      : null,
    input.offerText
      ? `STEP 2 (OFFER, already drafted):\n${input.offerText.slice(0, 1500)}`
      : null,
    "Draft the Attractive Character starter. Use [PLACEHOLDER] wherever you do not know a personal fact.",
  ]
    .filter(Boolean)
    .join("\n\n");

  return { system, user };
}

function sosPrompt(input: FirstWinInput, acDraft: string): { system: string; user: string } {
  const system = `You are the engine inside "The Playbook."
${RELUCTANT_HERO_VOICE}

The founder just paid $1 for the Starter. Their Attractive Character starter draft has just been generated (above). Your job: draft a STARTER version of THEIR Soap Opera Email 1 – the first email they will send to their OWN email list.

This is NOT a UnlockSaaS email. This is the founder's own first email to the founder's own subscribers, in the Reluctant Hero shape from workbook 04 §5.

Structure (mirror lib/soap-opera/emails.ts):
- Subject line: one sentence, opens a loop, no clickbait, no all-caps.
- Opener (1 paragraph): name what the reader is currently doing or feeling. If you have a product url and diagnostic, anchor the opener to the founder's actual product space. Otherwise use a generic "you signed up and walked away" opener.
- Story body (4-6 paragraphs): a Reluctant Hero scene the founder lived through. If you do not have a real scene, write a story-shaped template with [PLACEHOLDER: the moment you realised your funnel was leaking, in your own words] markers.
- Lesson line (1 paragraph): the one thing this story is supposed to teach the reader.
- Bridge to the founder's own offer: one sentence pointing at the founder's $1 / low-tier offer, in the same voice. Use [PLACEHOLDER: link to your starter / low-ticket page] for the URL.
- PS line: drives the reader to the founder's offer page.
- Sign-off: "– [PLACEHOLDER: your first name]" (en dash, not em dash).

Rules:
- Story first. Offer last.
- No urgency tricks, no fake scarcity.
- Reluctant Hero voice throughout.
- The Attractive Character draft above is your voice reference – borrow polarity beats and flaws into the story body.
- Output as markdown. Lead with a "**Subject:**" line, then a blank line, then the email body.

Do not include any preamble. Respond with ONLY the email markdown.`;

  const user = [
    `FOUNDER EMAIL: ${input.founderEmail}`,
    input.productUrl ? `FOUNDER'S PRODUCT URL: ${input.productUrl}` : null,
    input.diagnosis ? `THEIR DIAGNOSIS LABEL: ${input.diagnosis}` : null,
    input.diagnosticSummary
      ? `DIAGNOSTIC TEARDOWN OF THEIR LANDING PAGE:\n${input.diagnosticSummary.slice(
          0,
          3000
        )}`
      : null,
    input.dreamCustomerText
      ? `THEIR DREAM CUSTOMER (Step 1):\n${input.dreamCustomerText.slice(
          0,
          1200
        )}`
      : null,
    input.offerText
      ? `THEIR OFFER (Step 2):\n${input.offerText.slice(0, 1200)}`
      : null,
    `ATTRACTIVE CHARACTER STARTER (you just generated this – borrow its polarity + flaws):\n${acDraft.slice(0, 3500)}`,
    "Draft SOS Email 1 in the founder's voice.",
  ]
    .filter(Boolean)
    .join("\n\n");

  return { system, user };
}

// ---------------------------------------------------------------------------
// Streaming orchestrator
// ---------------------------------------------------------------------------

/**
 * Stream the two drafts sequentially, yielding typed events as they arrive.
 *
 * The caller (the SSE route handler) consumes the async iterable and
 * serialises each event to the wire. We intentionally do NOT persist here –
 * the route handler does that once the run completes, so transient stream
 * errors do not leak half-runs into agent_runs.
 *
 * Reasoning-step labels follow Reluctant Hero discipline: name what the
 * agent is actually doing, no marketing fluff ("reading your diagnostic",
 * "drafting your Attractive Character"). These are the only words the
 * founder sees before any tokens land, so they have to feel like the
 * product is doing work, not waiting on a network.
 */
export async function* streamFirstWin(
  input: FirstWinInput
): AsyncGenerator<FirstWinEvent, void, unknown> {
  if (!process.env.VERCEL_OIDC_TOKEN && !process.env.AI_GATEWAY_API_KEY) {
    yield {
      type: "error",
      message:
        "The first-win engine is not yet keyed up. Email maryan@unlocksaas.com and I will turn it on.",
    };
    return;
  }

  const reasoningSteps: string[] = [];
  const pushStep = (label: string): FirstWinEvent => {
    reasoningSteps.push(label);
    return { type: "step", label };
  };

  // Step 1: orient the founder. The first signal must land fast (<500ms)
  // so the page doesn't feel like a spinner.
  yield pushStep(
    input.productUrl
      ? `Reading your product at ${truncateUrl(input.productUrl)}`
      : "Reading what you brought in from the Starter"
  );

  yield pushStep("Drafting your Attractive Character profile (Step 3 starter)");

  // ── AC draft ─────────────────────────────────────────────────────────────
  let acDraft = "";
  try {
    const { system, user } = acPrompt(input);
    const acStream = streamText({
      model,
      maxOutputTokens: MAX_TOKENS_AC,
      system,
      prompt: user,
    });

    for await (const textDelta of acStream.textStream) {
      acDraft += textDelta;
      yield { type: "token", section: "ac", text: textDelta };
    }
    acDraft = acDraft.trim();
    if (!acDraft) {
      yield {
        type: "error",
        message:
          "The engine returned an empty Attractive Character draft. Try again in a moment.",
      };
      return;
    }
    yield { type: "section_complete", section: "ac", markdown: acDraft };
  } catch (err) {
    yield {
      type: "error",
      message:
        err instanceof Error
          ? `Attractive Character draft failed: ${err.message}`
          : "Attractive Character draft failed",
    };
    return;
  }

  // ── SOS Email 1 draft ────────────────────────────────────────────────────
  yield pushStep("Drafting your Soap Opera Email 1 (your first email to your list)");

  let sosDraft = "";
  try {
    const { system, user } = sosPrompt(input, acDraft);
    const sosStream = streamText({
      model,
      maxOutputTokens: MAX_TOKENS_SOS,
      system,
      prompt: user,
    });

    for await (const textDelta of sosStream.textStream) {
      sosDraft += textDelta;
      yield { type: "token", section: "sos1", text: textDelta };
    }
    sosDraft = sosDraft.trim();
    if (!sosDraft) {
      yield {
        type: "error",
        message:
          "The engine returned an empty Soap Opera Email 1 draft. Try again in a moment.",
      };
      return;
    }
    yield { type: "section_complete", section: "sos1", markdown: sosDraft };
  } catch (err) {
    yield {
      type: "error",
      message:
        err instanceof Error
          ? `Soap Opera draft failed: ${err.message}`
          : "Soap Opera draft failed",
    };
    return;
  }

  // ── Done ─────────────────────────────────────────────────────────────────
  yield pushStep("Drafts ready. You can edit them now.");

  const placeholders = extractPlaceholders(acDraft, sosDraft);
  yield {
    type: "done",
    runId: null, // populated by route handler after persistAgentRun
    output: {
      ac_profile_draft: acDraft,
      sos_email_1_draft: sosDraft,
      reasoning_steps: reasoningSteps,
      placeholders,
    },
  };
}

// ---------------------------------------------------------------------------
// Persistence helpers
// ---------------------------------------------------------------------------

export interface PersistFirstWinArgs {
  adminClient: SupabaseClient;
  projectId: string;
  input: FirstWinInput;
  output: FirstWinOutput;
  durationMs: number;
}

/**
 * Insert the completed run into agent_runs. Returns the new row id or null
 * on failure (the UI already has the output, so persist failure is degraded
 * not broken).
 */
export async function persistFirstWinRun(
  args: PersistFirstWinArgs
): Promise<string | null> {
  const { adminClient, projectId, input, output, durationMs } = args;
  // database.types.ts has not been regenerated since agent_runs landed, so we
  // cast through the loose client – same pattern as lib/agents.ts.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (adminClient as any)
    .from("agent_runs")
    .insert({
      project_id: projectId,
      agent_kind: FIRST_WIN_AGENT_KIND,
      input: {
        diagnostic_lead_id: input.diagnosticLeadId ?? null,
        product_url: input.productUrl ?? null,
        diagnosis: input.diagnosis ?? null,
        has_dream_customer: Boolean(input.dreamCustomerText),
        has_offer: Boolean(input.offerText),
      },
      output,
      duration_ms: durationMs,
      model: MODEL_ID,
    })
    .select("id")
    .maybeSingle();
  if (error) {
    console.error("[first-win] persistFirstWinRun failed", {
      projectId,
      message: error.message,
    });
    return null;
  }
  return (data?.id as string | undefined) ?? null;
}

/**
 * Load the most recent first-win run for a project so /first-win can hydrate
 * on revisit instead of regenerating.
 */
export async function loadLatestFirstWinRun(
  adminClient: SupabaseClient,
  projectId: string
): Promise<{ id: string; output: FirstWinOutput; created_at: string } | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (adminClient as any)
    .from("agent_runs")
    .select("id, output, created_at")
    .eq("project_id", projectId)
    .eq("agent_kind", FIRST_WIN_AGENT_KIND)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id as string,
    output: data.output as FirstWinOutput,
    created_at: data.created_at as string,
  };
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function truncateUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.host + (parsed.pathname === "/" ? "" : parsed.pathname);
  } catch {
    return url.slice(0, 60);
  }
}

/**
 * Extract every [PLACEHOLDER: ...] marker so the UI can render a "fill these
 * in" checklist next to the editable drafts. Deduped and capped at 16 so a
 * pathological run cannot blow up the response.
 */
function extractPlaceholders(...texts: string[]): string[] {
  const re = /\[PLACEHOLDER:\s*([^\]]+)\]/g;
  const seen = new Set<string>();
  for (const text of texts) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const note = m[1].trim();
      if (note) seen.add(note);
      if (seen.size >= 16) break;
    }
    if (seen.size >= 16) break;
  }
  return Array.from(seen);
}
