/**
 * /api/ask/answer — LLM-grounded answer stream for /ask.
 *
 * Companion endpoint to /api/nlweb/ask. While /api/nlweb/ask is the
 * NLWeb-spec retrieval surface (BM25 over the static corpus, returns
 * a schema.org ItemList JSON-LD with a deterministic summary), this
 * endpoint is the optional second layer: a streaming LLM gloss that
 * cites the already-retrieved items by numeric marker.
 *
 * Why the two layers are split
 * ----------------------------
 *   - Layer 1 (NLWeb /ask) MUST be deterministic, cheap, and fully
 *     crawlable. It is the protocol surface external agents call. No
 *     LLM dependency on the hot path.
 *   - Layer 2 (this endpoint) is the conversational gloss for the
 *     human visitor's browser. JS-only, post-hydration. If it fails
 *     (gateway timeout, no API key in preview, etc.) the page still
 *     reads correctly because layer 1 already rendered.
 *
 * The /ask page server-renders the BM25 results FIRST, then a client
 * island POSTs here with the SAME query + the SAME retrieved items
 * so the LLM is constrained to cite within the same numeric markers
 * the page already showed.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - The model is given the citations and instructed to cite by
 *     numeric marker only. Invented markers are explicitly forbidden
 *     in the system prompt (see lib/nlweb/answer-prompt.ts).
 *   - When the page rendered zero matches, the prompt switches to the
 *     "honest-refusal" template — no ungrounded answers from training
 *     data, even when the founder asked something the corpus does not
 *     cover. The right answer is "we do not cover this; here is the
 *     nearest hub" plus a rephrasing suggestion.
 *   - Model choice mirrors /api/chat: latest Sonnet via Vercel AI
 *     Gateway. Same OIDC-on-Vercel, vercel-dev-locally story.
 *
 * Runtime
 * -------
 * Node.js (Fluid Compute default). maxDuration 60 — same ceiling as
 * /api/chat. The BM25 step is done client-side via the prior /ask
 * server render; this endpoint never does retrieval, only generation.
 */

import { gateway, streamText } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { NlWebItem } from "@/lib/nlweb/corpus";
import {
  buildAnswerSystemPrompt,
  buildEmptyCorpusFallbackPrompt,
} from "@/lib/nlweb/answer-prompt";
import { checkRateLimit } from "@/lib/rate-limit";

// Vercel Fluid Compute: 60s ceiling matches the /api/chat sibling.
export const maxDuration = 60;

// Verified against https://ai-gateway.vercel.sh/v1/models on 2026-05-21,
// same constant as /api/chat. Kept duplicated rather than imported so
// each chat-style endpoint owns its model decision explicitly.
const MODEL = gateway("anthropic/claude-sonnet-4.6");

// Hard upper bound on the citation payload we accept. The /ask page
// never sends more than 10 (`DEFAULT_TOP_K` in /api/nlweb/ask), but we
// declare a generous ceiling here to leave room for forward-compat
// tweaks without redeploying both endpoints.
const MAX_CITATIONS = 20;

/**
 * Citation shape accepted from the page. Mirrors the subset of NlWebItem
 * the page actually renders in the cards above — full shape would be
 * needless bytes over the wire. The model only needs name + description
 * + url + surface to produce a grounded answer.
 */
const CitationInput = z.object({
  "@type": z.string(),
  "@id": z.string(),
  name: z.string(),
  description: z.string(),
  url: z.string().url(),
  surface: z.string(),
});

const AnswerInput = z.object({
  query: z.string().trim().min(1, "query is required").max(500),
  citations: z.array(CitationInput).max(MAX_CITATIONS),
});

/**
 * Convert the wire format back into the shape `buildAnswerSystemPrompt`
 * consumes. `dateModified`, `keywords`, and `text` are unused by the
 * prompt builder so we synthesise empty values rather than require the
 * client to ship them.
 */
function toNlWebItem(input: z.infer<typeof CitationInput>): NlWebItem {
  return {
    "@type": input["@type"],
    "@id": input["@id"],
    name: input.name,
    description: input.description,
    url: input.url,
    dateModified: "",
    keywords: [],
    surface: input.surface as NlWebItem["surface"],
    text: "",
  };
}

export async function POST(request: Request) {
  // Rate limit: 20 LLM-glossed answers per IP per 5 min. Prevents
  // automated cost abuse of the streaming endpoint.
  const rl = checkRateLimit(request, {
    limit: 20,
    windowMs: 300_000,
    keyPrefix: "ask",
  });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_request", message: "body must be valid JSON" },
      { status: 400 },
    );
  }

  const parsed = AnswerInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "invalid_request",
        message: parsed.error.issues.map((i) => i.message).join("; "),
      },
      { status: 400 },
    );
  }

  const { query, citations } = parsed.data;
  const items = citations.map(toNlWebItem);

  // Two prompt paths: grounded-citation path (>0 retrieved items) or
  // empty-corpus refusal path (=0 retrieved items). The /ask page only
  // mounts the client island when there ARE citations, but we accept
  // empty payloads here too in case a future caller (a bookmarklet, a
  // CLI client) wants to ask the endpoint directly.
  const system =
    items.length === 0
      ? buildEmptyCorpusFallbackPrompt(query)
      : buildAnswerSystemPrompt(query, items);

  try {
    const result = streamText({
      model: MODEL,
      system,
      // No `messages[]` — this is a one-shot grounded answer, not a
      // multi-turn chat. The system prompt carries query + citations
      // and instructs the model to compose only the answer paragraph.
      prompt: "Compose the grounded answer now.",
      // 240 tokens ≈ 180 words. The system prompt caps the visible
      // answer at 180 words; the token ceiling is a defensive backstop
      // in case the model gets chatty.
      maxOutputTokens: 280,
      // Low temperature: this is a grounded-retrieval surface, not a
      // creative writing tool. Determinism helps cache stability and
      // keeps the voice consistent with the deterministic summary
      // rendered above.
      temperature: 0.2,
    });

    // toTextStreamResponse() emits raw text bytes — what the /ask
    // client island reads via Response.body.getReader(). We do NOT use
    // toUIMessageStreamResponse() here because the page renders the
    // answer as plain prose, not as a chat-message list.
    return result.toTextStreamResponse({
      headers: {
        // CORS open so embeddable clients (NLWeb-aware agents calling
        // from a browser context) can hit this without proxy hops.
        "access-control-allow-origin": "*",
        // No edge cache — the model output varies per query and the
        // citation set is request-bound. Browser caching disabled too.
        "cache-control": "no-store",
      },
    });
  } catch (err) {
    // Defensive: if the gateway is unreachable (no API key in a fresh
    // preview branch, transient outage, model rotation) we return 503
    // so the client island can fall back to "answer unavailable" and
    // let the server-rendered deterministic summary carry the page.
    console.error("[ask/answer] streamText failed:", err);
    return NextResponse.json(
      { error: "gateway_unavailable", message: "answer stream unavailable" },
      { status: 503 },
    );
  }
}

/** OPTIONS handler for CORS preflight. Mirrors /api/nlweb/ask. */
export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type",
      "access-control-max-age": "86400",
    },
  });
}
