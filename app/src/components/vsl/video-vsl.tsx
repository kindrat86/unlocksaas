"use client";

/**
 * Real-video VSL player — active when NEXT_PUBLIC_VSL_URL is configured.
 *
 * Supports any source the browser's native <video> tag accepts: direct MP4,
 * HLS via .m3u8 in Safari, signed Cloudflare Stream / Mux URLs, etc. We
 * deliberately do not pull in HLS.js — the funnel hub VSL is short enough
 * that a single MP4 host (Cloudflare Stream auto-publishes one) covers
 * every browser without a 30KB+ JS dependency on the critical path.
 *
 * Tracking parity with ScriptedVsl: same event names, mode: "video".
 *   - vsl_impression on mount
 *   - vsl_played on first play (autoplay or click)
 *   - vsl_scene_advanced fires at the four chapter boundaries derived from
 *     the scripted scenes' cumulative durations
 *   - vsl_completed on ended OR on unmount with watched_percent
 *   - vsl_skipped_to_offer on skip-button click
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics/client";
import { Event, type VslSurface } from "@/lib/analytics/events";
import { VSL_SCRIPT } from "@/lib/vsl/script";

interface Props {
  src: string;
  poster?: string;
  surface: VslSurface;
  onReachedOffer?: () => void;
}

export function VideoVsl({ src, poster, surface, onReachedOffer }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const impressionFiredRef = useRef(false);
  const playFiredRef = useRef(false);
  const completedFiredRef = useRef(false);
  const lastSceneIndexRef = useRef(-1);

  const [showSkip, setShowSkip] = useState(false);

  // Pre-compute scene boundaries in seconds from cumulative scene durations.
  // This lets us fire `vsl_scene_advanced` on a real video without manual
  // scene markers in the encoded file. Drift is fine — the analytics goal
  // is "did they make it past the Big Domino?", not millisecond precision.
  const sceneBoundariesSec = useRef<{ idx: number; sec: number; id: string; role: string }[]>(
    (() => {
      let acc = 0;
      return VSL_SCRIPT.scenes.map((s, idx) => {
        const sec = acc / 1000;
        acc += s.durationMs;
        return { idx, sec, id: s.id, role: s.role };
      });
    })(),
  );

  useEffect(() => {
    if (impressionFiredRef.current) return;
    impressionFiredRef.current = true;
    track(Event.VslImpression, { surface, mode: "video" });
  }, [surface]);

  const fireCompleted = useCallback(
    (reachedEnd: boolean) => {
      if (completedFiredRef.current) return;
      const video = videoRef.current;
      if (!video) return;
      const watchedPercent =
        video.duration > 0
          ? Math.min(100, Math.round((video.currentTime / video.duration) * 100))
          : 0;
      completedFiredRef.current = true;
      track(Event.VslCompleted, {
        surface,
        mode: "video",
        watched_percent: watchedPercent,
        reached_end: reachedEnd,
      });
    },
    [surface],
  );

  // Fire completion on unmount if visitor scrolled away mid-watch.
  useEffect(() => {
    return () => fireCompleted(false);
  }, [fireCompleted]);

  const handlePlay = useCallback(() => {
    if (playFiredRef.current) return;
    playFiredRef.current = true;
    track(Event.VslPlayed, { surface, mode: "video" });
  }, [surface]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    // Surface "skip to offer" after the first 25% of runtime.
    if (!showSkip && video.duration > 0 && video.currentTime / video.duration > 0.25) {
      setShowSkip(true);
    }
    // Scene-boundary tracking.
    const boundaries = sceneBoundariesSec.current;
    for (let i = boundaries.length - 1; i >= 0; i--) {
      const b = boundaries[i];
      if (video.currentTime >= b.sec && i > lastSceneIndexRef.current) {
        lastSceneIndexRef.current = i;
        track(Event.VslSceneAdvanced, {
          surface,
          mode: "video",
          scene_id: b.id,
          scene_index: b.idx,
          scene_role: b.role,
          advanced_by: "timer",
        });
        break;
      }
    }
  }, [showSkip, surface]);

  const handleEnded = useCallback(() => {
    fireCompleted(true);
    onReachedOffer?.();
  }, [fireCompleted, onReachedOffer]);

  const handleSkip = useCallback(() => {
    track(Event.VslSkippedToOffer, { surface, mode: "video" });
    fireCompleted(false);
    onReachedOffer?.();
  }, [surface, fireCompleted, onReachedOffer]);

  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-foreground shadow-lg">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full"
        src={src}
        poster={poster}
        controls
        preload="metadata"
        playsInline
        onPlay={handlePlay}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        aria-label="Founder VSL: The Machine in 110 seconds"
      />
      {showSkip ? (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={handleSkip}
          className="absolute bottom-4 right-4 text-xs"
        >
          Skip to the offer →
        </Button>
      ) : null}
    </div>
  );
}
