"use client";

import * as React from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DIAGNOSTIC_STEP_LABELS,
  DIAGNOSTIC_STEP_ORDER,
  type DiagnosticStepId,
} from "@/lib/diagnostic-stream-types";

/**
 * Visible-reasoning panel for the streaming diagnostic.
 *
 * Renders the 16 steps of the diagnostic engine as a checklist. Each row
 * lights up as the server emits the matching `step` event. Score badges
 * appear inline once an axis is scored (1-10, color-coded by severity).
 *
 * This component is intentionally dumb — the parent owns the step state and
 * pushes it in. Keeps the streaming-fetch logic in the form where it lives
 * with the rest of the submission flow.
 */

export type ReasoningStepState = {
  id: DiagnosticStepId;
  status: "pending" | "running" | "done";
  detail?: string;
  score?: number;
};

export type ReasoningStreamProps = {
  /** Step state keyed by step id. Steps not present render as `pending`. */
  steps: Partial<Record<DiagnosticStepId, ReasoningStepState>>;
  /** Hide rows that never received a start event (e.g. verify_email on OAuth). */
  hidePending?: DiagnosticStepId[];
  /** Optional headline above the list. */
  title?: string;
  /** Optional subtitle paragraph above the list. */
  subtitle?: string;
};

export function ReasoningStream({
  steps,
  hidePending = [],
  title = "Reading your page",
  subtitle = "Visible reasoning — each step here is real work, not a timer.",
}: ReasoningStreamProps) {
  const visible = DIAGNOSTIC_STEP_ORDER.filter((id) => {
    if (!hidePending.includes(id)) return true;
    return Boolean(steps[id]);
  });

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
          {title}
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {subtitle}
        </p>
      </div>

      <ol
        className="space-y-1.5 font-mono text-xs"
        role="status"
        aria-live="polite"
        aria-label="Diagnostic reasoning steps"
      >
        {visible.map((id) => {
          const state = steps[id];
          return (
            <ReasoningRow
              key={id}
              id={id}
              status={state?.status ?? "pending"}
              detail={state?.detail}
              score={state?.score}
            />
          );
        })}
      </ol>
    </div>
  );
}

function ReasoningRow({
  id,
  status,
  detail,
  score,
}: {
  id: DiagnosticStepId;
  status: "pending" | "running" | "done";
  detail?: string;
  score?: number;
}) {
  const label = DIAGNOSTIC_STEP_LABELS[id];

  return (
    <li
      className={cn(
        "flex items-start gap-3 rounded-md px-2 py-1.5 transition-colors",
        status === "running" && "bg-primary/5",
        status === "done" && "opacity-80",
        status === "pending" && "opacity-40",
      )}
    >
      <span
        className="mt-0.5 flex h-4 w-4 flex-none items-center justify-center"
        aria-hidden="true"
      >
        {status === "done" ? (
          <Check className="h-3.5 w-3.5 text-primary" strokeWidth={3} />
        ) : status === "running" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
        ) : (
          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block leading-tight",
            status === "running" && "text-foreground font-medium",
            status === "done" && "text-foreground/80",
            status === "pending" && "text-muted-foreground",
          )}
        >
          {label}
        </span>
        {detail ? (
          <span className="mt-0.5 block text-[10px] tracking-wide text-muted-foreground">
            {detail}
          </span>
        ) : null}
      </span>

      {typeof score === "number" ? (
        <ScoreBadge score={score} />
      ) : null}

      <span className="sr-only">
        {status === "done"
          ? `Complete${typeof score === "number" ? ` — scored ${score} out of 10` : ""}`
          : status === "running"
            ? "In progress"
            : "Pending"}
      </span>
    </li>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const tone =
    score <= 4
      ? "border-destructive/40 bg-destructive/10 text-destructive"
      : score <= 6
        ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
        : "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  return (
    <span
      className={cn(
        "inline-flex flex-none items-center rounded border px-1.5 py-0 text-[10px] font-semibold tabular-nums",
        tone,
      )}
      aria-hidden="true"
    >
      {score}/10
    </span>
  );
}
