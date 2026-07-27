/**
 * Step-output persistence + retrieval.
 *
 * Frank Kern's Results-in-Advance rule (DotCom Secrets Secret #12):
 * the prospect must walk away with a real, useful, complete result they can
 * KEEP after they pay. For the $1 Starter that means: when a user finishes
 * Playbook Step 1 (Dream Customer) and Step 2 (Offer), the assembled output
 * must survive session loss. It must be retrievable from any device. It must
 * land in their inbox. Otherwise it's "results-in-browser-until-cookies-clear"
 * — which is not results-in-advance, it's a teaser.
 *
 * This module is the persistence layer. The engine route at /api/engine writes
 * here on each completed step; the step page at /playbook/step/[id] reads here
 * on mount; the onboarding page at /onboarding reads here to surface the
 * Starter carry-over.
 *
 * Storage shape: project_state has one jsonb column per step (dream_customer,
 * offer, ac, scripts, outreach). We write `{ assembled_at, output_text, ...
 * any structured payload }` into that column. The text is the canonical
 * Brunson deliverable in the user's own voice; structured fields are added
 * later as the engine grows richer.
 */
import type { SupabaseClient } from "@/lib/supabase/types";

/** Step id → project_state column. Steps 6 (outreach log) and 7 (Stripe verifier) don't produce engine deliverables. */
export const STEP_TO_STATE_KEY = {
  "1": "dream_customer",
  "2": "offer",
  "3": "ac",
  "4": "scripts",
  "5": "outreach",
} as const;

export type EngineStepId = keyof typeof STEP_TO_STATE_KEY;

/** Display labels used in email subjects + download filenames. */
export const STEP_TITLE: Record<EngineStepId, string> = {
  "1": "Your Dream Customer",
  "2": "Your Offer",
  "3": "Your Attractive Character",
  "4": "Your Copy",
  "5": "Your Outreach Assets",
};

export interface StepOutputRecord {
  /** ISO-8601 timestamp of the assembly. */
  assembled_at: string;
  /** The assembled Brunson deliverable text. Markdown formatting preserved. */
  output_text: string;
}

export type StepOutputMap = Partial<Record<EngineStepId, StepOutputRecord>>;

export function isEngineStepId(value: string): value is EngineStepId {
  return value === "1" || value === "2" || value === "3" || value === "4" || value === "5";
}

/**
 * Look up the signed-in user's project id. Returns null if the user has no
 * project row yet — happens for fresh accounts before /onboarding has run.
 *
 * Uses the admin client because we want this to work even when the engine
 * route is called outside the RLS-respecting session (e.g. retry from a
 * background tab).
 */
export async function getProjectIdForUser(
  adminClient: SupabaseClient,
  userId: string
): Promise<string | null> {
  const { data } = await adminClient
    .from("projects")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  return (data?.id as string | undefined) ?? null;
}

/**
 * Persist the assembled output for a step into project_state.
 *
 * Idempotent: re-running with the same content updates the timestamp + text;
 * different content overwrites (later runs win — the user re-ran the step
 * because they wanted a new deliverable).
 *
 * Returns true on success, false on any failure. The caller treats failure
 * as non-fatal — the user already has the output in their browser; missing
 * persistence is a degraded state, not a broken one.
 */
export async function persistStepOutput(args: {
  adminClient: SupabaseClient;
  projectId: string;
  stepId: EngineStepId;
  outputText: string;
}): Promise<boolean> {
  const { adminClient, projectId, stepId, outputText } = args;
  const column = STEP_TO_STATE_KEY[stepId];

  const record: StepOutputRecord = {
    assembled_at: new Date().toISOString(),
    output_text: outputText,
  };

  // project_state.project_id is the PK so this is an upsert by design.
  const { error } = await adminClient
    .from("project_state")
    .upsert(
      { project_id: projectId, [column]: record, updated_at: new Date().toISOString() },
      { onConflict: "project_id" }
    );

  if (error) {
    console.error("[step-outputs] persistStepOutput failed", {
      projectId,
      stepId,
      column,
      message: error.message,
    });
    return false;
  }
  return true;
}

/**
 * Load all saved step outputs for a project. Used by the step page on mount
 * to hydrate the completion view when a user returns after closing the tab.
 */
export async function loadStepOutputs(
  client: SupabaseClient,
  projectId: string
): Promise<StepOutputMap> {
  const { data } = await client
    .from("project_state")
    .select("dream_customer, offer, ac, scripts, outreach")
    .eq("project_id", projectId)
    .maybeSingle();

  if (!data) return {};

  const result: StepOutputMap = {};
  for (const [stepId, column] of Object.entries(STEP_TO_STATE_KEY) as Array<
    [EngineStepId, (typeof STEP_TO_STATE_KEY)[EngineStepId]]
  >) {
    const value = (data as Record<string, unknown>)[column];
    if (isStepOutputRecord(value)) {
      result[stepId] = value;
    }
  }
  return result;
}

/**
 * Load a single step's output. Lighter than loadStepOutputs when the caller
 * only needs one column (e.g. the step page on /playbook/step/1).
 */
export async function loadStepOutput(
  client: SupabaseClient,
  projectId: string,
  stepId: EngineStepId
): Promise<StepOutputRecord | null> {
  const column = STEP_TO_STATE_KEY[stepId];
  const { data } = await client
    .from("project_state")
    .select(column)
    .eq("project_id", projectId)
    .maybeSingle();

  if (!data) return null;
  const value = (data as Record<string, unknown>)[column];
  return isStepOutputRecord(value) ? value : null;
}

function isStepOutputRecord(value: unknown): value is StepOutputRecord {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return typeof v.assembled_at === "string" && typeof v.output_text === "string";
}
