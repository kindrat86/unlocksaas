/**
 * Founder Memory – persistent context across diagnostic → dashboard → chat.
 *
 * Producer: /api/diagnostic (called after deepAnalyzeUrl resolves; see route).
 * Consumers:
 *   - /onboarding         "We remember:" banner + skip-intake hints
 *   - /playbook           "We remember:" banner above Step 1
 *   - /api/founder-memory/context   chat-ready system-prompt fragment
 *   - (future) chat sidebar – RAG via semanticRecall()
 *
 * Shape:
 *   - structured  JSONB  render-ready blob (offer, ICP, stage, scorecard)
 *   - summary     text   1-2 sentence canonical recap
 *   - embedding   vector pgvector cosine, computed from a canonical text
 *                        serialization of `structured`
 *
 * Writes go through the service-role client (lib/supabase/server.ts
 * createAdminClient()). The /api/diagnostic handler fires this in
 * fire-and-forget mode (after()) so the user-facing response is never
 * blocked on embedding latency.
 *
 * Embedding provider: OpenAI's text-embedding-3-small (1536 dims) via REST.
 * Configurable to point at the Vercel AI Gateway (OpenAI-compatible) when
 * AI_GATEWAY_API_KEY is set – the gateway gives us provider failover and
 * unified billing on Vercel without adding a new SDK dependency. If
 * neither key is set, embedding is silently skipped and the row is written
 * without it (semantic recall degrades, structured reads still work).
 *
 * Why no @ai-sdk dependency: this repo's only LLM provider so far is
 * @anthropic-ai/sdk (Claude), and Anthropic does not ship an embedding
 * API. Adding a full ai-sdk stack for one embeddings call is overkill;
 * a 30-line fetch wrapper keeps the dep graph clean.
 */

import { after } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/server";
import type {
  DeepDiagnosticResult,
  DiagnosticLabel,
  Bucket,
  TimeSinceLaunch,
  RecentRevenue,
  BiggestAttempt,
} from "@/lib/diagnostic";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * The render-ready blob shape persisted in founder_memory.structured.
 *
 * All fields nullable so partial rows (eg. a Step 1 save before any
 * diagnostic ran) stay valid. Consumers pattern-match defensively.
 */
export interface FounderMemoryStructured {
  /** Hostname / product name as it appears on the page or hostname. */
  product_name?: string | null;
  /** The submitted product URL (canonical https form). */
  product_url?: string | null;
  /** Their elevator pitch as written. ≤25 words. */
  one_liner?: string | null;
  /** Who the page says it is for. "founders" / "anyone" are weak signals. */
  audience_stated?: string | null;
  /** Any visible pricing on the page, or null. */
  pricing_visible?: string | null;

  /** Brunson Survey Funnel inputs (stage signals). */
  stage?: {
    time_since_launch?: TimeSinceLaunch | null;
    recent_revenue?: RecentRevenue | null;
    biggest_attempt?: BiggestAttempt | null;
  } | null;

  /** The bucket the founder fell into (Brunson Bridge Script segmentation). */
  bucket?: Bucket | null;

  /** Diagnostic engine output – the upstream failure mode. */
  diagnosis?: {
    label?: DiagnosticLabel | "error" | null;
    headline?: string | null;
    explanation?: string | null;
    evidence?: string | null;
    next_step?: string | null;
  } | null;

  /** Three-axis scorecard (1-10 per axis). */
  scorecard?: {
    wrong_person?: { score: number; diagnosis: string } | null;
    weak_offer?: { score: number; diagnosis: string } | null;
    weak_belief?: { score: number; diagnosis: string } | null;
  } | null;

  /** Top deliverables for the next 30 days, flattened to one list. */
  next_30_days?: string[] | null;

  /** Honest positives picked up by the engine. */
  strengths?: string[] | null;
}

export interface FounderMemoryRow {
  id: string;
  lead_id: string | null;
  email: string | null;
  user_id: string | null;
  structured: FounderMemoryStructured;
  summary: string | null;
  model: string | null;
  created_at: string;
  updated_at: string;
}

export interface WriteFounderMemoryArgs {
  leadId?: string | null;
  email?: string | null;
  userId?: string | null;
  /** The deep-analysis output from deepAnalyzeUrl. Source of structured + summary. */
  findings?: DeepDiagnosticResult | null;
  /** The canonical product URL (https). Required when `findings` is set – the
   *  deep-analysis output names the product but not its URL. */
  productUrl?: string | null;
  /** Optional override for the structured blob (used by non-diagnostic producers). */
  structured?: FounderMemoryStructured;
  /** Optional Brunson Survey Funnel inputs that the findings alone don't carry. */
  stage?: FounderMemoryStructured["stage"];
  bucket?: Bucket | null;
}

export interface ReadFounderMemoryArgs {
  leadId?: string | null;
  email?: string | null;
  userId?: string | null;
}

export interface SemanticRecallArgs extends ReadFounderMemoryArgs {
  query: string;
  k?: number;
}

// ---------------------------------------------------------------------------
// Embedding provider
// ---------------------------------------------------------------------------

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMS = 1536;

interface EmbeddingProviderConfig {
  endpoint: string;
  apiKey: string;
}

function resolveEmbeddingProvider(): EmbeddingProviderConfig | null {
  // Preferred: Vercel AI Gateway. The gateway accepts OpenAI-compatible
  // requests at /v1/embeddings, so the request body and response shape
  // are identical to OpenAI's REST API.
  const gatewayKey = process.env.AI_GATEWAY_API_KEY?.trim();
  if (gatewayKey) {
    const base =
      process.env.AI_GATEWAY_BASE_URL?.trim() ||
      "https://ai-gateway.vercel.sh/v1";
    return {
      endpoint: `${base.replace(/\/+$/, "")}/embeddings`,
      apiKey: gatewayKey,
    };
  }
  // Fallback: direct OpenAI key.
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  if (openaiKey) {
    return {
      endpoint: "https://api.openai.com/v1/embeddings",
      apiKey: openaiKey,
    };
  }
  return null;
}

/**
 * Compute a single 1536-dim embedding via the configured provider. Returns
 * null when no provider is configured or the call fails – callers MUST
 * treat the embedding as optional metadata.
 */
export async function embedText(text: string): Promise<number[] | null> {
  const provider = resolveEmbeddingProvider();
  if (!provider) {
    return null;
  }
  const trimmed = text.trim();
  if (!trimmed) return null;

  try {
    const res = await fetch(provider.endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: trimmed.slice(0, 8000),
      }),
      // The diagnostic handler is on a 90s budget; an embedding call should
      // take < 1s. Cap it tight so a flaky provider can't stall the after().
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.warn(
        `[founder-memory] embedding provider ${res.status}: ${body.slice(0, 200)}`,
      );
      return null;
    }
    const json = (await res.json()) as {
      data?: Array<{ embedding?: number[] }>;
    };
    const vec = json.data?.[0]?.embedding;
    if (!Array.isArray(vec) || vec.length !== EMBEDDING_DIMS) {
      console.warn(
        `[founder-memory] embedding returned bad shape (len=${vec?.length})`,
      );
      return null;
    }
    return vec;
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown";
    console.warn(`[founder-memory] embedding failed: ${reason}`);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Canonical text serialization – the input to the embedder, and the input
// to summary generation. Stable shape across writers so two memory rows
// written by different surfaces still embed comparably.
// ---------------------------------------------------------------------------

const STAGE_LABEL: Record<TimeSinceLaunch, string> = {
  under_30: "under 30 days post-launch",
  "30_to_90": "30 to 90 days post-launch",
  "90_plus": "over 90 days post-launch",
};

const REVENUE_LABEL: Record<RecentRevenue, string> = {
  zero: "no revenue yet",
  under_100: "under $100/mo",
  "100_to_1k": "$100-$1k/mo",
  over_1k: "over $1k/mo",
};

const ATTEMPT_LABEL: Record<BiggestAttempt, string> = {
  more_building: "building more features",
  seo_content: "SEO and content",
  paid_ads: "paid ads",
  customer_conversations: "customer conversations",
  nothing_yet: "no marketing attempt yet",
};

export function canonicalText(m: FounderMemoryStructured): string {
  const lines: string[] = [];
  if (m.product_name) lines.push(`Product: ${m.product_name}`);
  if (m.product_url) lines.push(`URL: ${m.product_url}`);
  if (m.one_liner) lines.push(`One-liner: ${m.one_liner}`);
  if (m.audience_stated) lines.push(`Stated audience: ${m.audience_stated}`);
  if (m.pricing_visible) lines.push(`Pricing visible: ${m.pricing_visible}`);

  if (m.stage) {
    const s = m.stage;
    const parts: string[] = [];
    if (s.time_since_launch) parts.push(STAGE_LABEL[s.time_since_launch]);
    if (s.recent_revenue) parts.push(REVENUE_LABEL[s.recent_revenue]);
    if (s.biggest_attempt)
      parts.push(`biggest attempt: ${ATTEMPT_LABEL[s.biggest_attempt]}`);
    if (parts.length) lines.push(`Stage: ${parts.join("; ")}`);
  }

  if (m.bucket) lines.push(`Bucket: ${m.bucket.replace(/_/g, " ")}`);

  if (m.diagnosis) {
    const d = m.diagnosis;
    if (d.label) lines.push(`Diagnosis label: ${d.label}`);
    if (d.headline) lines.push(`Diagnosis headline: ${d.headline}`);
    if (d.explanation) lines.push(`Diagnosis explanation: ${d.explanation}`);
    if (d.evidence) lines.push(`Diagnosis evidence: ${d.evidence}`);
    if (d.next_step) lines.push(`Next step: ${d.next_step}`);
  }

  if (m.scorecard) {
    const s = m.scorecard;
    if (s.wrong_person)
      lines.push(
        `Wrong-person axis: ${s.wrong_person.score}/10 – ${s.wrong_person.diagnosis}`,
      );
    if (s.weak_offer)
      lines.push(
        `Weak-offer axis: ${s.weak_offer.score}/10 – ${s.weak_offer.diagnosis}`,
      );
    if (s.weak_belief)
      lines.push(
        `Weak-belief axis: ${s.weak_belief.score}/10 – ${s.weak_belief.diagnosis}`,
      );
  }

  if (m.next_30_days?.length) {
    lines.push(`30-day plan:`);
    for (const item of m.next_30_days) lines.push(`  – ${item}`);
  }

  if (m.strengths?.length) {
    lines.push(`Strengths: ${m.strengths.join("; ")}`);
  }

  return lines.join("\n");
}

/**
 * Build a 1-2 sentence canonical recap from the structured blob. Used as
 * the chat system-prompt fragment and the dashboard "We remember:" banner.
 * Deterministic – no LLM call.
 */
export function buildSummary(m: FounderMemoryStructured): string {
  const parts: string[] = [];
  if (m.product_name && m.one_liner) {
    parts.push(`${m.product_name}: ${m.one_liner}`);
  } else if (m.product_name) {
    parts.push(m.product_name);
  } else if (m.one_liner) {
    parts.push(m.one_liner);
  }
  if (m.audience_stated) {
    parts.push(`Built for ${m.audience_stated}`);
  }
  const stageBits: string[] = [];
  if (m.stage?.time_since_launch)
    stageBits.push(STAGE_LABEL[m.stage.time_since_launch]);
  if (m.stage?.recent_revenue)
    stageBits.push(REVENUE_LABEL[m.stage.recent_revenue]);
  if (stageBits.length) parts.push(stageBits.join(", "));
  if (m.diagnosis?.label && m.diagnosis.label !== "error") {
    parts.push(`Diagnosis: ${m.diagnosis.label.replace(/_/g, " ")}`);
  }
  return parts.join(". ").slice(0, 600);
}

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

/**
 * Project a DeepDiagnosticResult + survey context into the structured blob.
 * Pure – no I/O. Easy to test.
 */
export function findingsToStructured(args: {
  findings: DeepDiagnosticResult;
  productUrl: string;
  stage?: FounderMemoryStructured["stage"];
  bucket?: Bucket | null;
}): FounderMemoryStructured {
  const { findings, productUrl, stage, bucket } = args;
  const top3Deliverables = (
    [
      ...findings.plan_30_day.week1.deliverables.slice(0, 2),
      ...findings.plan_30_day.week2.deliverables.slice(0, 1),
    ] as string[]
  ).filter(Boolean);

  return {
    product_name: findings.product_snapshot.name,
    product_url: productUrl,
    one_liner: findings.product_snapshot.one_liner,
    audience_stated: findings.product_snapshot.audience_stated,
    pricing_visible: findings.product_snapshot.pricing_visible,
    stage: stage ?? null,
    bucket: bucket ?? null,
    diagnosis: {
      label: findings.label,
      headline: findings.headline,
      explanation: findings.explanation,
      evidence: findings.evidence,
      next_step: findings.nextStep,
    },
    scorecard: {
      wrong_person: {
        score: findings.scores.wrong_person.score,
        diagnosis: findings.scores.wrong_person.diagnosis,
      },
      weak_offer: {
        score: findings.scores.weak_offer.score,
        diagnosis: findings.scores.weak_offer.diagnosis,
      },
      weak_belief: {
        score: findings.scores.weak_belief.score,
        diagnosis: findings.scores.weak_belief.diagnosis,
      },
    },
    next_30_days: top3Deliverables,
    strengths: findings.strengths ?? null,
  };
}

// ---------------------------------------------------------------------------
// Read / write helpers
// ---------------------------------------------------------------------------

/** Loose admin client – founder_memory isn't in the generated Database type yet. */
type MemDb = SupabaseClient;
function db(): MemDb {
  return createAdminClient() as unknown as MemDb;
}

const TABLE = "founder_memory";

function normEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  const t = email.trim().toLowerCase();
  return t.length ? t : null;
}

/**
 * Upsert a memory row keyed by lead_id (when present) or insert a new row.
 *
 * Returns the row that was written, or null on failure. NEVER throws –
 * the producer (/api/diagnostic) calls this from after() and we don't
 * want a swallowed-throw to crash the request lifecycle.
 */
export async function writeFounderMemory(
  args: WriteFounderMemoryArgs,
): Promise<FounderMemoryRow | null> {
  const {
    leadId,
    userId,
    findings,
    productUrl,
    structured: override,
    stage,
    bucket,
  } = args;
  const email = normEmail(args.email);

  if (!leadId && !email && !userId) {
    console.warn(
      "[founder-memory] writeFounderMemory called with no identity",
    );
    return null;
  }

  // Build the structured blob. Findings + survey-derived stage/bucket are
  // merged into the override (the override wins, so non-diagnostic
  // producers can patch specific fields).
  let structured: FounderMemoryStructured = {};
  if (findings) {
    structured = findingsToStructured({
      findings,
      productUrl: productUrl ?? override?.product_url ?? "",
      stage,
      bucket,
    });
  }
  if (override) {
    structured = { ...structured, ...override };
    if (stage) structured.stage = stage;
    if (bucket !== undefined) structured.bucket = bucket;
  }

  const summary = buildSummary(structured);
  const embeddingText = canonicalText(structured);
  const embedding = await embedText(embeddingText);

  const row: Record<string, unknown> = {
    lead_id: leadId ?? null,
    email,
    user_id: userId ?? null,
    structured,
    summary,
    model: embedding ? EMBEDDING_MODEL : null,
    embedding,
  };

  // Upsert by lead_id when present; otherwise insert. The unique partial
  // index on (lead_id WHERE lead_id IS NOT NULL) makes this a clean
  // on_conflict path.
  const client = db();
  try {
    if (leadId) {
      const { data, error } = await client
        .from(TABLE)
        .upsert(row, { onConflict: "lead_id" })
        .select("*")
        .single();
      if (error) {
        console.error("[founder-memory] upsert failed", error);
        return null;
      }
      return data as FounderMemoryRow;
    }
    const { data, error } = await client
      .from(TABLE)
      .insert(row)
      .select("*")
      .single();
    if (error) {
      console.error("[founder-memory] insert failed", error);
      return null;
    }
    return data as FounderMemoryRow;
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown";
    console.error(`[founder-memory] write threw: ${reason}`);
    return null;
  }
}

/**
 * Fire-and-forget variant. Wraps writeFounderMemory in next/server's
 * `after()` so the caller's response is never blocked. Logs but never
 * throws.
 */
export function writeFounderMemoryAfter(args: WriteFounderMemoryArgs): void {
  try {
    after(async () => {
      await writeFounderMemory(args);
    });
  } catch (err) {
    // after() can throw if called outside a request context (eg. during
    // build). Fall back to running it inline, fire-and-forget.
    const reason = err instanceof Error ? err.message : "unknown";
    console.warn(`[founder-memory] after() unavailable, running inline: ${reason}`);
    void writeFounderMemory(args).catch((e) => {
      console.error("[founder-memory] inline write failed", e);
    });
  }
}

/**
 * Read the most recent memory row for the founder. Identifier priority:
 * lead_id > user_id > email. Returns null if nothing matches.
 */
export async function readFounderMemory(
  args: ReadFounderMemoryArgs,
): Promise<FounderMemoryRow | null> {
  const { leadId, userId } = args;
  const email = normEmail(args.email);

  if (!leadId && !email && !userId) return null;

  const client = db();
  try {
    if (leadId) {
      const { data } = await client
        .from(TABLE)
        .select("*")
        .eq("lead_id", leadId)
        .maybeSingle();
      if (data) return data as FounderMemoryRow;
    }
    if (userId) {
      const { data } = await client
        .from(TABLE)
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) return data as FounderMemoryRow;
    }
    if (email) {
      const { data } = await client
        .from(TABLE)
        .select("*")
        .eq("email", email)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) return data as FounderMemoryRow;
    }
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown";
    console.warn(`[founder-memory] read failed: ${reason}`);
  }
  return null;
}

/**
 * Semantic recall – pgvector cosine search across the founder's memory.
 * Returns up to k rows ranked by similarity to the query. Falls back to
 * a chronological read when embedding is unavailable.
 *
 * Identifier-scoped: rows must match by user_id or email to surface, so
 * this never leaks one founder's memory into another's session.
 */
export async function semanticRecall(
  args: SemanticRecallArgs,
): Promise<FounderMemoryRow[]> {
  const { query, userId } = args;
  const email = normEmail(args.email);
  const k = Math.max(1, Math.min(args.k ?? 5, 25));

  if (!userId && !email) return [];

  const embedding = await embedText(query);
  if (!embedding) {
    // Degrade to chronological – still useful for the dashboard.
    const recent = await readFounderMemory({ userId, email });
    return recent ? [recent] : [];
  }

  const client = db();
  // pgvector RPC: requires a SQL function we have NOT shipped here to
  // keep the migration minimal. Approximate the search in TS – fetch
  // the founder's rows with embeddings, compute cosine, sort. Fine at
  // our scale (a founder has < 20 memory rows in any realistic horizon).
  try {
    let q = client
      .from(TABLE)
      .select("*")
      .not("embedding", "is", null)
      .order("created_at", { ascending: false })
      .limit(50);
    if (userId) q = q.eq("user_id", userId);
    else if (email) q = q.eq("email", email);

    const { data, error } = await q;
    if (error || !data) return [];
    const rows = data as Array<FounderMemoryRow & { embedding?: number[] }>;

    const ranked = rows
      .map((row) => ({
        row,
        score: cosineSim(embedding, row.embedding ?? []),
      }))
      .filter((r) => Number.isFinite(r.score))
      .sort((a, b) => b.score - a.score)
      .slice(0, k);

    // Strip the heavy embedding column off the returned rows.
    return ranked.map(({ row }) => {
      const { embedding: _e, ...rest } = row as FounderMemoryRow & {
        embedding?: number[];
      };
      return rest as FounderMemoryRow;
    });
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown";
    console.warn(`[founder-memory] semanticRecall failed: ${reason}`);
    return [];
  }
}

function cosineSim(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return -Infinity;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return -Infinity;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

// ---------------------------------------------------------------------------
// Chat-ready surface
// ---------------------------------------------------------------------------

/**
 * Build a chat system-prompt fragment from a memory row. Plug into any
 * future chat sidebar's system prompt verbatim. Empty string when the
 * row has no signal yet – callers should treat that as "no memory".
 */
export function toChatContext(memory: FounderMemoryRow | null): string {
  if (!memory) return "";
  const m = memory.structured ?? {};
  const lines: string[] = [];

  if (memory.summary) {
    lines.push(`The founder's business in one line: ${memory.summary}`);
  } else if (m.product_name || m.one_liner) {
    lines.push(buildSummary(m));
  }

  const facts: string[] = [];
  if (m.audience_stated) facts.push(`ICP: ${m.audience_stated}`);
  if (m.pricing_visible) facts.push(`Pricing: ${m.pricing_visible}`);

  if (m.stage) {
    const s = m.stage;
    const sf: string[] = [];
    if (s.time_since_launch) sf.push(STAGE_LABEL[s.time_since_launch]);
    if (s.recent_revenue) sf.push(REVENUE_LABEL[s.recent_revenue]);
    if (s.biggest_attempt)
      sf.push(`tried ${ATTEMPT_LABEL[s.biggest_attempt]}`);
    if (sf.length) facts.push(`Stage: ${sf.join(", ")}`);
  }

  if (m.bucket) facts.push(`Brunson bucket: ${m.bucket.replace(/_/g, " ")}`);

  if (m.diagnosis?.label && m.diagnosis.label !== "error") {
    facts.push(
      `Last diagnosis: ${m.diagnosis.label.replace(/_/g, " ")} – ${m.diagnosis.headline ?? ""}`,
    );
  }
  if (facts.length) lines.push(facts.join(". "));

  if (m.scorecard) {
    const sc: string[] = [];
    if (m.scorecard.wrong_person)
      sc.push(`Wrong-person: ${m.scorecard.wrong_person.score}/10`);
    if (m.scorecard.weak_offer)
      sc.push(`Weak-offer: ${m.scorecard.weak_offer.score}/10`);
    if (m.scorecard.weak_belief)
      sc.push(`Weak-belief: ${m.scorecard.weak_belief.score}/10`);
    if (sc.length) lines.push(`Scorecard: ${sc.join(", ")}`);
  }

  if (m.next_30_days?.length) {
    lines.push(
      `Open 30-day actions: ${m.next_30_days.slice(0, 3).join("; ")}`,
    );
  }

  if (lines.length === 0) return "";

  return [
    "Context from the founder's saved memory:",
    ...lines,
    "Pick up where their last diagnosis or playbook step left off. Do not re-ask the questions above.",
  ].join("\n");
}
