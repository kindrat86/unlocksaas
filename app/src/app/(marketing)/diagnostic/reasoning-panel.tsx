"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Visible-reasoning panel rendered while /api/diagnostic/stream is producing
 * the teardown. Reads NDJSON phase events and surfaces them as a checklist
 * plus a live "thinking" log of Claude's plain-text reasoning prefix.
 *
 * 2026-05-21 — replaces the 30-45 s spinner-with-rotating-fake-stage label.
 * Each phase boundary corresponds to a real server event; the thinking log
 * is the model's actual streamed text (PART 1 of the prompt). When the
 * server emits 'done', the parent navigates to the result page.
 */

type Phase =
  | { phase: "fetching"; hostname: string }
  | { phase: "parsed"; chars: number }
  | { phase: "analyzing" }
  | { phase: "thinking"; delta: string }
  | { phase: "compiling" }
  | { phase: "saving" }
  | { phase: "done"; id: string; redirectTo: string }
  | {
      phase: "already_used";
      id: string;
      previousUrl: string | null;
      redirectTo: string;
    }
  | { phase: "error"; message: string };

type StepKey =
  | "fetching"
  | "parsed"
  | "analyzing"
  | "compiling"
  | "saving"
  | "done";

const STEP_LABEL: Record<StepKey, string> = {
  fetching: "Fetch the page",
  parsed: "Read the copy",
  analyzing: "Score three failure modes",
  compiling: "Compile the teardown",
  saving: "Save the diagnosis",
  done: "Open your teardown",
};

const STEP_ORDER: StepKey[] = [
  "fetching",
  "parsed",
  "analyzing",
  "compiling",
  "saving",
  "done",
];

export function DiagnosticReasoningPanel({
  hostname,
  reasoning,
  reachedSteps,
  error,
}: {
  hostname: string | null;
  reasoning: string;
  reachedSteps: Set<StepKey>;
  error: string | null;
}) {
  const logRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll the reasoning log as new tokens arrive so the founder always
  // sees the latest line of Claude's thinking.
  useEffect(() => {
    const el = logRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [reasoning]);

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Engine running{hostname ? ` — ${hostname}` : ""}
        </p>
        <p className="text-sm text-foreground/80 leading-relaxed">
          Reading your page, scoring three failure modes, drafting rewrites.
          Live. No spinner. You watch it think.
        </p>
      </div>

      <ol className="space-y-1.5">
        {STEP_ORDER.map((key, idx) => {
          const done = reachedSteps.has(key);
          const active =
            !done &&
            idx === Array.from(reachedSteps).length &&
            !error;
          return (
            <li
              key={key}
              className="flex items-center gap-3 text-sm leading-snug"
              data-state={done ? "done" : active ? "active" : "pending"}
            >
              <StepGlyph done={done} active={active} />
              <span
                className={
                  done
                    ? "text-foreground"
                    : active
                      ? "text-foreground"
                      : "text-muted-foreground"
                }
              >
                {STEP_LABEL[key]}
              </span>
            </li>
          );
        })}
      </ol>

      {(reasoning.length > 0 || reachedSteps.has("analyzing")) && (
        <div className="rounded-lg border border-border bg-muted/30">
          <div className="px-3 py-2 border-b border-border">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              What the engine is seeing
            </p>
          </div>
          <div
            ref={logRef}
            className="px-3 py-2.5 max-h-44 overflow-y-auto font-mono text-xs leading-relaxed text-foreground/80 whitespace-pre-wrap"
          >
            {reasoning}
            {!error && !reachedSteps.has("compiling") && (
              <span
                className="inline-block w-1.5 h-3 align-middle ml-0.5 bg-foreground/70 animate-pulse"
                aria-hidden="true"
              />
            )}
          </div>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-md px-3 py-2"
        >
          {error}
        </p>
      )}
    </div>
  );
}

function StepGlyph({ done, active }: { done: boolean; active: boolean }) {
  if (done) {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        width="14"
        height="14"
        className="shrink-0 text-foreground"
      >
        <path
          d="M3 8.5l3 3 7-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (active) {
    return (
      <span
        aria-hidden="true"
        className="shrink-0 w-3 h-3 rounded-full bg-foreground/70 animate-pulse"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="shrink-0 w-3 h-3 rounded-full border border-muted-foreground/40"
    />
  );
}

/**
 * Reader/parser hook used by the form. Returns the running state so the form
 * can render the panel and react to terminal events ('done' / 'already_used'
 * / 'error'). Pass a body shape and url; the hook opens a single POST and
 * surfaces NDJSON events.
 */
export function useStreamingDiagnostic() {
  const [reasoning, setReasoning] = useState("");
  const [hostname, setHostname] = useState<string | null>(null);
  const [reachedSteps, setReachedSteps] = useState<Set<StepKey>>(
    () => new Set(),
  );
  const [terminal, setTerminal] = useState<
    | null
    | { kind: "done"; id: string; redirectTo: string }
    | {
        kind: "already_used";
        id: string;
        previousUrl: string | null;
        redirectTo: string;
      }
    | { kind: "error"; message: string }
  >(null);

  const run = useCallback(async (body: unknown) => {
    setReasoning("");
    setReachedSteps(new Set());
    setHostname(null);
    setTerminal(null);

    let res: Response;
    try {
      res = await fetch("/api/diagnostic/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch {
      setTerminal({
        kind: "error",
        message:
          "Could not reach the diagnostic engine. Try again in a minute, or email me at maryan@unlocksaas.com.",
      });
      return;
    }

    if (!res.body) {
      setTerminal({
        kind: "error",
        message:
          "The diagnostic engine returned nothing. Try again, or email me at maryan@unlocksaas.com.",
      });
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    function applyEvent(ev: Phase) {
      switch (ev.phase) {
        case "fetching":
          setHostname(ev.hostname);
          setReachedSteps((s) => addStep(s, "fetching"));
          break;
        case "parsed":
          setReachedSteps((s) => addStep(s, "parsed"));
          break;
        case "analyzing":
          setReachedSteps((s) => addStep(s, "analyzing"));
          break;
        case "thinking":
          setReasoning((prev) => prev + ev.delta);
          break;
        case "compiling":
          setReachedSteps((s) => addStep(s, "compiling"));
          break;
        case "saving":
          setReachedSteps((s) => addStep(s, "saving"));
          break;
        case "done":
          setReachedSteps((s) => addStep(s, "done"));
          setTerminal({
            kind: "done",
            id: ev.id,
            redirectTo: ev.redirectTo,
          });
          break;
        case "already_used":
          setTerminal({
            kind: "already_used",
            id: ev.id,
            previousUrl: ev.previousUrl,
            redirectTo: ev.redirectTo,
          });
          break;
        case "error":
          setTerminal({ kind: "error", message: ev.message });
          break;
      }
    }

    let streamDone = false;
    while (!streamDone) {
      const { value, done } = await reader.read();
      if (done) {
        streamDone = true;
        break;
      }
      buffer += decoder.decode(value, { stream: true });

      for (;;) {
        const nl = buffer.indexOf("\n");
        if (nl < 0) break;
        const line = buffer.slice(0, nl).trim();
        buffer = buffer.slice(nl + 1);
        if (!line) continue;
        try {
          const parsed = JSON.parse(line) as Phase;
          applyEvent(parsed);
        } catch {
          // Ignore malformed line; the stream is best-effort visible-reasoning.
        }
      }
    }

    // Tail: a partial line without a trailing newline.
    const tail = buffer.trim();
    if (tail) {
      try {
        applyEvent(JSON.parse(tail) as Phase);
      } catch {
        /* swallow */
      }
    }
  }, []);

  return { reasoning, hostname, reachedSteps, terminal, run };
}

function addStep(prev: Set<StepKey>, k: StepKey): Set<StepKey> {
  if (prev.has(k)) return prev;
  const next = new Set(prev);
  next.add(k);
  return next;
}
