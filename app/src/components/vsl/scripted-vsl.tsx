"use client";

/**
 * Kinetic-typography VSL — the in-the-meantime player.
 *
 * Renders the Who/What/Why/How script as a sequence of timed text scenes
 * inside a 16:9 stage. Autoplays muted (no audio, so autoplay restrictions
 * don't apply). Visitor can:
 *   - Click anywhere on the stage to advance manually
 *   - Press space / right-arrow / left-arrow to step
 *   - Press R to replay from scene 1
 *   - "Skip to offer" button surfaces after the 3rd scene
 *
 * Why this is not a placeholder: kinetic-typography VSLs are a legitimate
 * production format. Frank Kern + Brunson have both shipped campaigns where
 * the cold-traffic player is text-only because the script lands harder
 * without a talking head competing for attention. When Maryan records the
 * real video, swap `NEXT_PUBLIC_VSL_URL` and this fallback retires
 * automatically. Until then, the funnel hub has a real VSL surface.
 *
 * Analytics: each scene advance fires `vsl_scene_advanced`. Reaching the
 * final scene fires `vsl_completed`. Skipping fires `vsl_skipped_to_offer`.
 * Brunson-funnel-metrics reads watched_percent to score VSL effectiveness.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics/client";
import { Event, type VslSurface } from "@/lib/analytics/events";
import { VSL_SCRIPT, type VslScene, type VslScript } from "@/lib/vsl/script";

type Phase = "idle" | "playing" | "paused" | "complete";

interface Props {
  surface: VslSurface;
  /**
   * Which script to play. Defaults to VSL_SCRIPT (the 110s kinetic-compact
   * cut). The cut registry in `lib/vsl/cuts.ts` does NOT pass per-cut
   * scripts here today — the kinetic fallback is one format, recorded
   * cuts replace it surface-by-surface via env vars. Prop kept open so a
   * future per-cut kinetic refactor can wire in without API churn.
   */
  script?: VslScript;
  /**
   * If true, the player auto-starts in the visible viewport.
   * Default true on hub/sales pages; pass false to require a click on
   * surfaces where motion would distract.
   */
  autoplay?: boolean;
  /**
   * Called when the visitor either reaches the final scene or clicks the
   * "skip to offer" button. The parent typically scrolls to the CTA block.
   */
  onReachedOffer?: () => void;
}

export function ScriptedVsl({
  surface,
  script = VSL_SCRIPT,
  autoplay = true,
  onReachedOffer,
}: Props) {
  const scenes = script.scenes;
  const totalDurationMs = script.totalDurationMs;

  const [phase, setPhase] = useState<Phase>("idle");
  const [index, setIndex] = useState(0);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const watchedMsRef = useRef(0);
  const sceneStartedAtRef = useRef<number | null>(null);
  const impressionFiredRef = useRef(false);

  const scene = scenes[index];
  const isFirstScene = index === 0;
  const isLastScene = index === scenes.length - 1;

  // ────────────────────────────────────────────────────────────────────────
  // Analytics — fire impression exactly once per mount.
  // ────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (impressionFiredRef.current) return;
    impressionFiredRef.current = true;
    track(Event.VslImpression, { surface, mode: "scripted" });
  }, [surface]);

  // ────────────────────────────────────────────────────────────────────────
  // Scene timer — only runs while playing. Tracks watched time for the
  // completion analytics. Cleared on phase change or unmount.
  // ────────────────────────────────────────────────────────────────────────

  const stopTimer = useCallback(() => {
    if (advanceTimer.current) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
    if (sceneStartedAtRef.current !== null) {
      watchedMsRef.current += Date.now() - sceneStartedAtRef.current;
      sceneStartedAtRef.current = null;
    }
  }, []);

  const fireCompletion = useCallback(
    (reachedEnd: boolean) => {
      const watchedPercent = Math.min(
        100,
        Math.round((watchedMsRef.current / totalDurationMs) * 100),
      );
      track(Event.VslCompleted, {
        surface,
        mode: "scripted",
        watched_percent: watchedPercent,
        reached_end: reachedEnd,
      });
    },
    [surface, totalDurationMs],
  );

  // Advance the scene; if `auto` is true the call originated from the
  // timer (vs a user click / keyboard). The analytics property records
  // both branches so we can compute auto-completion rate vs hand-stepped.
  //
  // We read `index` from state directly rather than using a functional
  // setter, because calling `track()` inside a setState updater is a side
  // effect that React strict mode can double-invoke. Reading first, then
  // firing analytics, then committing the new state keeps the firing
  // exactly-once per real advance.
  const advance = useCallback(
    (auto: boolean) => {
      stopTimer();
      const next = Math.min(index + 1, scenes.length - 1);
      if (next === index) return;
      const sc = scenes[next];
      track(Event.VslSceneAdvanced, {
        surface,
        mode: "scripted",
        scene_id: sc.id,
        scene_index: next,
        scene_role: sc.role,
        advanced_by: auto ? "timer" : "user",
      });
      setIndex(next);
    },
    [index, scenes, stopTimer, surface],
  );

  // When the active scene changes while playing, schedule the next advance.
  useEffect(() => {
    if (phase !== "playing") return;
    sceneStartedAtRef.current = Date.now();

    if (isLastScene) {
      // Hold the last scene for its duration, then mark complete.
      advanceTimer.current = setTimeout(() => {
        stopTimer();
        setPhase("complete");
        fireCompletion(true);
        onReachedOffer?.();
      }, scene.durationMs);
    } else {
      advanceTimer.current = setTimeout(() => advance(true), scene.durationMs);
    }
    return stopTimer;
  }, [
    phase,
    index,
    scene.durationMs,
    isLastScene,
    advance,
    stopTimer,
    fireCompletion,
    onReachedOffer,
  ]);

  // ────────────────────────────────────────────────────────────────────────
  // Controls
  // ────────────────────────────────────────────────────────────────────────

  const play = useCallback(() => {
    if (phase === "complete") {
      setIndex(0);
      watchedMsRef.current = 0;
      track(Event.VslReplayed, { surface, mode: "scripted" });
    }
    setPhase("playing");
    if (phase === "idle") {
      track(Event.VslPlayed, { surface, mode: "scripted" });
    }
  }, [phase, surface]);

  const pause = useCallback(() => {
    stopTimer();
    setPhase("paused");
  }, [stopTimer]);

  const back = useCallback(() => {
    stopTimer();
    setIndex((i) => Math.max(0, i - 1));
  }, [stopTimer]);

  const skipToOffer = useCallback(() => {
    stopTimer();
    setPhase("complete");
    track(Event.VslSkippedToOffer, { surface, mode: "scripted" });
    fireCompletion(false);
    onReachedOffer?.();
  }, [stopTimer, surface, fireCompletion, onReachedOffer]);

  // Autoplay on first mount (muted text — no browser restriction).
  useEffect(() => {
    if (autoplay && phase === "idle") {
      // Defer so impression fires first.
      const t = setTimeout(() => play(), 250);
      return () => clearTimeout(t);
    }
  }, [autoplay, phase, play]);

  // Keyboard shortcuts. Bound to window so the visitor never has to focus
  // the stage. Ignored if they're typing in a form.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      switch (e.key) {
        case " ":
        case "Spacebar":
          e.preventDefault();
          if (phase === "playing") pause();
          else play();
          break;
        case "ArrowRight":
          e.preventDefault();
          advance(false);
          break;
        case "ArrowLeft":
          e.preventDefault();
          back();
          break;
        case "r":
        case "R":
          e.preventDefault();
          setIndex(0);
          watchedMsRef.current = 0;
          setPhase("playing");
          track(Event.VslReplayed, { surface, mode: "scripted" });
          break;
        case "s":
        case "S":
          e.preventDefault();
          skipToOffer();
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, play, pause, advance, back, skipToOffer, surface]);

  // ────────────────────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────────────────────

  const progressPercent = useMemo(() => {
    if (phase === "complete") return 100;
    // Approximate: index / total + intra-scene fraction (rough).
    return Math.round(((index + 1) / scenes.length) * 100);
  }, [index, scenes.length, phase]);

  // After scene index >= 2, surface the skip-to-offer affordance.
  const showSkip = index >= 2 && phase !== "complete";

  return (
    <div
      className="relative w-full aspect-video rounded-lg overflow-hidden border bg-foreground text-background shadow-lg"
      role="region"
      aria-label="Founder VSL: The Machine in 110 seconds"
    >
      {/* Stage — click to advance / pause */}
      <button
        type="button"
        onClick={() => {
          if (phase === "playing") pause();
          else if (phase === "complete") {
            setIndex(0);
            watchedMsRef.current = 0;
            setPhase("playing");
            track(Event.VslReplayed, { surface, mode: "scripted" });
          } else if (phase === "paused") play();
          else advance(false);
        }}
        className="absolute inset-0 w-full h-full flex flex-col items-center justify-center text-center px-6 sm:px-12 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-background/40"
        aria-label={
          phase === "playing"
            ? "Pause"
            : phase === "paused"
              ? "Resume"
              : phase === "complete"
                ? "Replay"
                : "Play"
        }
      >
        {/* Chapter chip */}
        <p className="absolute top-4 left-4 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-background/50">
          {scene.chapter}
        </p>

        {/* Scene body */}
        <SceneBody scene={scene} />

        {/* Idle hint */}
        {phase === "idle" ? (
          <p className="absolute bottom-6 text-xs text-background/60">
            Press play
          </p>
        ) : null}

        {/* Paused hint */}
        {phase === "paused" ? (
          <p className="absolute bottom-6 text-xs text-background/60">
            Paused — click to resume
          </p>
        ) : null}

        {/* Complete state */}
        {phase === "complete" ? (
          <p className="absolute bottom-6 text-xs text-background/60">
            Click to replay
          </p>
        ) : null}
      </button>

      {/* Top progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-background/10">
        <div
          className="h-full bg-background/80 transition-[width] duration-200 ease-out"
          style={{ width: `${progressPercent}%` }}
          aria-hidden
        />
      </div>

      {/* Skip-to-offer affordance */}
      {showSkip ? (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={skipToOffer}
          className="absolute bottom-4 right-4 text-xs"
        >
          Skip to the offer →
        </Button>
      ) : null}

      {/* Initial play overlay — high-contrast call to start */}
      {phase === "idle" ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-foreground/40 backdrop-blur-sm">
          <Button
            size="lg"
            type="button"
            className="pointer-events-auto text-lg"
            onClick={(e) => {
              e.stopPropagation();
              play();
            }}
          >
            ▶ Watch in 110 seconds
          </Button>
        </div>
      ) : null}

      {/* Footer controls (visible after first play) */}
      {phase !== "idle" ? (
        <div
          className="absolute bottom-4 left-4 flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-[10px] uppercase tracking-widest text-background/50">
            {index + 1} / {scenes.length}
          </span>
          {isFirstScene ? null : (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={back}
              className="h-7 px-2 text-xs text-background hover:bg-background/10"
            >
              ←
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => (phase === "playing" ? pause() : play())}
            className="h-7 px-2 text-xs text-background hover:bg-background/10"
          >
            {phase === "playing" ? "❚❚" : "▶"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Renders one scene's lines as stacked, sized paragraphs.
 * Emphasis word (if present) gets the primary accent color.
 *
 * Why a separate component: scene transitions need a tween. Re-mounting on
 * `key={scene.id}` gives us the entry animation without a CSS animation lib.
 */
function SceneBody({ scene }: { scene: VslScene }) {
  return (
    <div
      key={scene.id}
      className="relative max-w-3xl animate-vsl-scene"
    >
      {scene.lines.map((line, i) => (
        <p
          key={i}
          className="text-2xl sm:text-4xl md:text-5xl font-semibold leading-tight tracking-tight mb-3 last:mb-0"
        >
          {scene.emphasis && line.includes(scene.emphasis) ? (
            <Highlighted line={line} word={scene.emphasis} />
          ) : (
            line
          )}
        </p>
      ))}
    </div>
  );
}

function Highlighted({ line, word }: { line: string; word: string }) {
  const idx = line.indexOf(word);
  if (idx === -1) return <>{line}</>;
  const before = line.slice(0, idx);
  const after = line.slice(idx + word.length);
  return (
    <>
      {before}
      <span className="text-primary">{word}</span>
      {after}
    </>
  );
}
