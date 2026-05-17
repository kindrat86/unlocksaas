"use client";

/**
 * Results-in-Advance Preview block.
 *
 * Brunson DotCom Secrets Secret #12, Beat 5: "The result is visible BEFORE
 * the buyer pays." Two-tab toggle (Dream Customer / Offer) showing the
 * canonical anonymized example from strategy/results-in-advance-example.md.
 *
 * Voice: Reluctant Hero. Caption above the tabs admits the example is a
 * real anonymized run, not a marketing rewrite. The pushback notes at the
 * bottom prove the engine produced the output, not a copywriter.
 *
 * Mount points:
 *   - /starter (above the guarantee teaser)
 *   - /diagnostic/result (compact mode — Step 1 excerpt only)
 *
 * Client component because the tab toggle is interactive. Server-side
 * rendering would still produce both panels; client state hides the
 * inactive one. This keeps the page printable / SEO-readable while
 * giving the reader a single-pane reading experience.
 */

import { useState } from "react";
import { RIA_EXAMPLE } from "@/lib/results-in-advance/example";

type TabId = "step1" | "step2";

interface RiaPreviewProps {
  /**
   * "full" — both tabs, full body, pushback notes (mount on /starter).
   * "compact" — Step 1 only, body truncated, single CTA (mount on /diagnostic/result).
   */
  mode?: "full" | "compact";
  /** Optional href the compact-mode CTA points at. Defaults to /starter. */
  ctaHref?: string;
}

export function RiaPreview({
  mode = "full",
  ctaHref = "/starter",
}: RiaPreviewProps) {
  const [active, setActive] = useState<TabId>("step1");

  if (mode === "compact") {
    // Compact mode: Step 1 only, body trimmed to first ~80 words, link out.
    const truncated = trim(RIA_EXAMPLE.step1.body, 80);
    return (
      <div className="rounded-lg border border-border bg-muted/40 p-5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
          What walks out of the Machine
        </p>
        <p className="text-sm text-muted-foreground mb-3">
          A real anonymized run by {RIA_EXAMPLE.avatar_name} ({RIA_EXAMPLE.avatar_context}).
          The output below is what she kept in her inbox after run #1.
        </p>
        <div className="text-sm whitespace-pre-line text-foreground/90 border-l-2 border-primary/40 pl-4 mb-4">
          {truncated}
        </div>
        <a
          href={ctaHref}
          className="text-sm font-medium text-primary hover:underline"
        >
          See the full example and the Step 2 Offer →
        </a>
      </div>
    );
  }

  const step = active === "step1" ? RIA_EXAMPLE.step1 : RIA_EXAMPLE.step2;

  return (
    <section className="mb-10" aria-labelledby="ria-preview-heading">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
          What you walk away with — a real example
        </p>
        <h2 id="ria-preview-heading" className="text-xl font-bold mb-2">
          Here is what {RIA_EXAMPLE.avatar_name} kept after one $1 run.
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {RIA_EXAMPLE.avatar_context} Names and identifying details changed.
          The structure, the voice, and the 10× value math are the engine&apos;s
          actual output — no marketing rewrite. Switch tabs to read both
          deliverables.
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Results-in-advance example tabs"
        className="flex gap-2 mb-4 border-b border-border"
      >
        <button
          role="tab"
          type="button"
          aria-selected={active === "step1"}
          aria-controls="ria-tabpanel-step1"
          id="ria-tab-step1"
          onClick={() => setActive("step1")}
          className={tabClass(active === "step1")}
        >
          {RIA_EXAMPLE.step1.label}
        </button>
        <button
          role="tab"
          type="button"
          aria-selected={active === "step2"}
          aria-controls="ria-tabpanel-step2"
          id="ria-tab-step2"
          onClick={() => setActive("step2")}
          className={tabClass(active === "step2")}
        >
          {RIA_EXAMPLE.step2.label}
        </button>
      </div>

      <div
        role="tabpanel"
        id={`ria-tabpanel-${active}`}
        aria-labelledby={`ria-tab-${active}`}
        className="rounded-lg border border-border bg-card p-5"
      >
        <p className="text-sm text-muted-foreground italic mb-4">
          {step.subhead}
        </p>
        <div className="text-sm whitespace-pre-line text-foreground/90 leading-relaxed">
          {step.body}
        </div>
        <div className="mt-5 pt-4 border-t border-border/60">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
            How the engine produced this
          </p>
          <p className="text-xs text-muted-foreground italic leading-relaxed">
            {step.pushback_note}
          </p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground italic mt-3">
        Source:{" "}
        <code className="font-mono text-[11px]">
          strategy/results-in-advance-example.md
        </code>
        . Canonical anonymized run, 2026-05-12.
      </p>
    </section>
  );
}

function tabClass(activeTab: boolean) {
  const base =
    "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors";
  return activeTab
    ? `${base} border-primary text-foreground`
    : `${base} border-transparent text-muted-foreground hover:text-foreground`;
}

/** Take the first `words` words of `s`, append "…" if truncated. */
function trim(s: string, words: number): string {
  const parts = s.split(/\s+/);
  if (parts.length <= words) return s;
  return parts.slice(0, words).join(" ") + " …";
}
