"use client";

/**
 * Client island for the streaming LLM gloss on /ask.
 *
 * Why this is a client component
 * ------------------------------
 * The /ask page server-renders the deterministic BM25 summary plus the
 * numbered citation cards (layer 1) — that layer is what AI crawlers,
 * JS-less browsers, and Lynx-style readers see. This island is layer
 * 2: a progressively-enhanced streaming answer that posts the
 * already-retrieved citations back to /api/ask/answer and streams the
 * grounded LLM gloss into the page.
 *
 * Why we re-POST the citations from the page
 * ------------------------------------------
 * /api/ask/answer never does retrieval itself. The page already ran
 * BM25 server-side; sending the same items back over the wire avoids
 * a second module-load on the API route and locks the LLM's "valid
 * citation marker" range to exactly the [1..N] the cards display. This
 * is the contract: the model is constrained to cite within the same
 * numbered set the human is looking at.
 *
 * Behavioural notes
 * -----------------
 *   - One auto-trigger on mount when `query` is non-empty. No
 *     "regenerate" button. The deterministic summary above is the
 *     stable answer; the streamed gloss is a one-shot enhancement.
 *   - 503 from /api/ask/answer is silent. The fallback IS the layer-1
 *     deterministic summary already on the page; we don't show an
 *     error banner that would degrade the page for the visitor.
 *   - The stream is read as plain text (`toTextStreamResponse`). The
 *     endpoint sends raw bytes; we decode incrementally and append
 *     to a React state string.
 *   - Abort on unmount via AbortController so a fast-navigating
 *     visitor never leaks an open fetch.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - This component never composes citation markers locally. It only
 *     renders what the model produced. The server prompt is what
 *     guarantees markers stay in [1..N].
 *   - No spinners with fake "thinking..." copy. The streamed text
 *     itself is the loading indicator. Honest UI = the visible bytes
 *     are the truth.
 */

import { useEffect, useRef, useState } from "react";

interface CitationPayload {
  "@type": string;
  "@id": string;
  name: string;
  description: string;
  url: string;
  surface: string;
}

interface AskAnswerStreamProps {
  query: string;
  citations: readonly CitationPayload[];
}

export function AskAnswerStream({ query, citations }: AskAnswerStreamProps) {
  const [text, setText] = useState("");
  const [state, setState] = useState<"idle" | "streaming" | "done" | "failed">(
    "idle",
  );
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Skip when there's nothing to ground on. The page should not have
    // mounted this island in that case, but defending against future
    // refactors where the parent's gating changes.
    if (!query.trim() || citations.length === 0) {
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setText("");
    setState("streaming");

    (async () => {
      try {
        const res = await fetch("/api/ask/answer", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ query, citations }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          // 503 = gateway unavailable. Silent fallback — the layer-1
          // deterministic summary stays on the page; no error UI.
          setState("failed");
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          setText(buffer);
        }
        // Flush any remaining bytes the stream-mode decoder held back.
        buffer += decoder.decode();
        setText(buffer);
        setState("done");
      } catch (err) {
        // AbortError on unmount is expected; swallow it.
        if ((err as { name?: string })?.name === "AbortError") return;
        // Network failure / parse error — degrade silently.
        setState("failed");
      }
    })();

    return () => {
      controller.abort();
      abortRef.current = null;
    };
    // We intentionally key the effect on the QUERY string only (plus
    // citation count as a sanity hash). The citation list is stable
    // for a given query render — re-running the effect on every
    // shallow array-identity change would re-fire the LLM on every
    // re-render. Citations are a derived snapshot of the server BM25
    // ranking; they don't shift after mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, citations.length]);

  // Layer-2 only renders when there's something to show. When the
  // stream fails or returns empty, the layer-1 deterministic summary
  // above is the complete answer.
  if (state === "failed" || (state === "idle" && !text)) {
    return null;
  }

  return (
    <div
      className="rounded-md border border-border bg-muted/30 p-4"
      aria-live="polite"
      // VEO selector reuse — voice assistants reading the page should
      // include the streamed gloss when present.
      data-speakable="ask-llm-gloss"
    >
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
        Conversational answer{state === "streaming" ? " (streaming)" : ""}
      </p>
      <p className="text-base text-foreground leading-relaxed whitespace-pre-wrap">
        {text}
      </p>
    </div>
  );
}
