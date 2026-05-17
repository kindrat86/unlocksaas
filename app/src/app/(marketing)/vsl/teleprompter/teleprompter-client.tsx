"use client";

/**
 * Teleprompter client — shoot-day reading view.
 *
 * One cut at a time, large-readable typography, optional auto-scroll at
 * the cut's scripted reading pace. Speaker notes render alongside (or
 * above on narrow screens). Cut switcher in the header lets the operator
 * flip between the seven cuts without leaving the page.
 *
 * Pace math: each segment has a `lengthSec` and `paragraphs`. Auto-scroll
 * advances at lengthSec / paragraphCount per paragraph, with a smooth
 * scroll. The operator can pause / resume / restart with keyboard:
 *   space      — pause / resume
 *   r          — restart from top
 *   ↑ / ↓      — manual scroll (auto pauses)
 *   1–7        — jump to cut N (in CUT_DISPLAY_ORDER)
 *
 * The "Words per minute" display gives a sanity check (Brunson camera
 * voice is typically 130–160 wpm; the cuts target ~150 wpm). If the
 * operator's natural cadence is faster or slower, they can override the
 * pace multiplier and the auto-scroll adjusts.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  CUT_DISPLAY_ORDER,
  getCut,
  VSL_CUTS,
  type VslCutId,
} from "@/lib/vsl/cuts";

type ScrollState = "idle" | "playing" | "paused";

export function TeleprompterClient() {
  const [cutId, setCutId] = useState<VslCutId>("full_long_form");
  const [state, setState] = useState<ScrollState>("idle");
  const [paceMultiplier, setPaceMultiplier] = useState(1);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);

  const cut = getCut(cutId);

  /**
   * Pixels-per-millisecond required to scroll the whole content area in the
   * cut's scripted runtime. Computed when:
   *   - cut changes
   *   - layout changes (window resize → recompute)
   *   - pace multiplier changes
   *
   * We use scrollHeight - clientHeight as the total scroll distance so the
   * last segment lands fully on screen at runtime end. Resize-observer
   * recomputes on responsive layout changes (mobile portrait → landscape).
   */
  const pixelsPerMsRef = useRef(0);
  const recomputePace = useCallback(() => {
    const el = scrollAreaRef.current;
    if (!el) {
      pixelsPerMsRef.current = 0;
      return;
    }
    const distance = Math.max(0, el.scrollHeight - el.clientHeight);
    const runtimeMs = cut.lengthSec * 1000 * paceMultiplier;
    pixelsPerMsRef.current = runtimeMs > 0 ? distance / runtimeMs : 0;
  }, [cut.lengthSec, paceMultiplier]);

  // Recompute when cut or pace changes, plus on resize.
  useEffect(() => {
    recomputePace();
    const handleResize = () => recomputePace();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [recomputePace]);

  // RAF auto-scroll loop. Only runs when state === "playing".
  useEffect(() => {
    if (state !== "playing") {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTimestampRef.current = null;
      return;
    }

    const tick = (timestamp: number) => {
      const el = scrollAreaRef.current;
      if (!el) return;
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const dt = timestamp - lastTimestampRef.current;
      lastTimestampRef.current = timestamp;
      const pixels = pixelsPerMsRef.current * dt;
      el.scrollBy({ top: pixels, behavior: "auto" });

      // Stop at end.
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 1) {
        setState("idle");
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [state]);

  // Keyboard shortcuts.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;

      switch (e.key) {
        case " ":
        case "Spacebar":
          e.preventDefault();
          setState((s) => (s === "playing" ? "paused" : "playing"));
          break;
        case "r":
        case "R":
          e.preventDefault();
          scrollAreaRef.current?.scrollTo({ top: 0, behavior: "auto" });
          setState("playing");
          break;
        case "ArrowUp":
        case "ArrowDown":
          // Manual scroll → pause auto-scroll if running.
          if (state === "playing") setState("paused");
          break;
        default: {
          // 1–7 → jump to cut N.
          const num = Number(e.key);
          if (Number.isInteger(num) && num >= 1 && num <= 7) {
            e.preventDefault();
            const id = CUT_DISPLAY_ORDER[num - 1];
            if (id) {
              setCutId(id);
              setState("idle");
              if (scrollAreaRef.current) {
                scrollAreaRef.current.scrollTop = 0;
              }
            }
          }
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [state]);

  // Reset scroll when cut changes.
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = 0;
    }
    setState("idle");
  }, [cutId]);

  const wordCount = useMemo(
    () =>
      cut.segments
        .flatMap((s) => s.paragraphs)
        .reduce((acc, p) => acc + p.split(/\s+/).filter(Boolean).length, 0),
    [cut],
  );
  const wpm = useMemo(
    () => Math.round((wordCount / cut.lengthSec) * 60),
    [wordCount, cut.lengthSec],
  );

  return (
    <div className="min-h-screen bg-foreground text-background flex flex-col">
      {/* Header bar */}
      <header className="border-b border-background/10 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/vsl/transcript"
            className="text-xs uppercase tracking-widest text-background/60 hover:text-background"
          >
            ← Transcript
          </Link>
          <p className="text-xs uppercase tracking-widest text-background/40">
            Operator teleprompter
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-xs uppercase tracking-widest text-background/60">
            Cut:
            <select
              value={cutId}
              onChange={(e) => setCutId(e.target.value as VslCutId)}
              className="ml-2 bg-background/10 text-background border border-background/20 rounded px-2 py-1 text-xs"
            >
              {VSL_CUTS.map((c, i) => (
                <option
                  key={c.id}
                  value={c.id}
                  className="bg-foreground text-background"
                >
                  {i + 1}. {formatLength(c.lengthSec)} · {c.title}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs uppercase tracking-widest text-background/60">
            Pace:
            <select
              value={paceMultiplier}
              onChange={(e) => setPaceMultiplier(Number(e.target.value))}
              className="ml-2 bg-background/10 text-background border border-background/20 rounded px-2 py-1 text-xs"
            >
              <option value={0.8} className="bg-foreground text-background">
                Faster (0.8×)
              </option>
              <option value={1} className="bg-foreground text-background">
                Scripted (1.0×)
              </option>
              <option value={1.2} className="bg-foreground text-background">
                Slower (1.2×)
              </option>
              <option value={1.5} className="bg-foreground text-background">
                Way slower (1.5×)
              </option>
            </select>
          </label>
          <label className="text-xs uppercase tracking-widest text-background/60 flex items-center gap-1">
            <input
              type="checkbox"
              checked={showSpeakerNotes}
              onChange={(e) => setShowSpeakerNotes(e.target.checked)}
              className="accent-primary"
            />
            Notes
          </label>
        </div>
      </header>

      {/* Cut metadata strip */}
      <div className="px-4 sm:px-6 py-3 border-b border-background/10 text-xs text-background/60 flex justify-between flex-wrap gap-3">
        <span>
          {formatLength(cut.lengthSec)} · {wordCount} words · {wpm} wpm
          {wpm > 175 ? (
            <span className="ml-2 text-amber-300">⚠ fast — slow down</span>
          ) : wpm < 110 ? (
            <span className="ml-2 text-amber-300">⚠ slow — pick up pace</span>
          ) : null}
        </span>
        <span className="font-mono text-background/40">
          space=play/pause · r=restart · 1–7=cut · ↑↓=manual
        </span>
      </div>

      {/* Reading area — scrollable, large type. */}
      <div
        ref={scrollAreaRef}
        className="flex-1 overflow-y-auto px-6 sm:px-12 py-12 sm:py-20"
        style={{ scrollBehavior: state === "playing" ? "auto" : "smooth" }}
      >
        <div className="max-w-3xl mx-auto pb-[60vh]">
          {/* Cut title */}
          <p className="text-[10px] uppercase tracking-widest text-background/40 mb-2">
            {cut.id}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{cut.title}</h1>
          <p className="text-base text-background/60 mb-8">{cut.subtitle}</p>

          {/* Segments */}
          <div className="space-y-12">
            {cut.segments.map((seg, i) => (
              <div key={i}>
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="inline-block text-[10px] uppercase tracking-widest font-bold text-primary bg-primary/20 px-2 py-0.5 rounded">
                    {seg.chapter}
                  </span>
                  <p className="text-sm text-background/60">{seg.label}</p>
                  <p className="text-[10px] uppercase tracking-widest text-background/40 ml-auto font-mono">
                    {formatTimeRange(seg.startOffsetSec, seg.lengthSec)}
                  </p>
                </div>

                {/* Speaker note */}
                {showSpeakerNotes && seg.speakerNote ? (
                  <p className="text-sm italic text-amber-300/80 border-l-2 border-amber-300/40 pl-4 mb-6 leading-relaxed">
                    {seg.speakerNote}
                  </p>
                ) : null}

                {/* Body — large, readable, generous line height. */}
                <div className="space-y-6 text-2xl sm:text-3xl leading-snug font-medium">
                  {seg.paragraphs.map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}
                </div>
              </div>
            ))}

            {/* Production notes (master cut only) */}
            {cut.productionNotes ? (
              <div className="mt-16 pt-12 border-t border-background/10">
                <p className="text-xs uppercase tracking-widest text-background/40 mb-4">
                  Shoot-day production notes
                </p>
                <ul className="space-y-3 text-sm text-background/70 leading-relaxed">
                  {cut.productionNotes.map((note, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="text-background/40 font-mono">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Output framing */}
            {cut.outputFraming ? (
              <div className="mt-12 pt-8 border-t border-background/10">
                <p className="text-xs uppercase tracking-widest text-background/40 mb-3">
                  Output framing
                </p>
                <p className="text-sm text-background/70 leading-relaxed">
                  {cut.outputFraming}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Controls bar */}
      <footer className="border-t border-background/10 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-widest text-background/40">
          {state === "playing"
            ? "Auto-scrolling at scripted pace…"
            : state === "paused"
              ? "Paused"
              : "Ready"}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              scrollAreaRef.current?.scrollTo({ top: 0, behavior: "auto" });
              setState("playing");
            }}
            className="text-xs uppercase tracking-widest px-3 py-2 rounded border border-background/20 hover:bg-background/10"
          >
            ⏮ Restart
          </button>
          <button
            type="button"
            onClick={() =>
              setState((s) => (s === "playing" ? "paused" : "playing"))
            }
            className="text-xs uppercase tracking-widest px-3 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {state === "playing" ? "⏸ Pause" : "▶ Play"}
          </button>
        </div>
      </footer>
    </div>
  );
}

function formatLength(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (s === 0) return `${m}m`;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

function formatTimeRange(startSec: number, lengthSec: number): string {
  return `${formatTimestamp(startSec)}–${formatTimestamp(startSec + lengthSec)}`;
}

function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
