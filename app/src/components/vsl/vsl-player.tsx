"use client";

/**
 * VslPlayer — the public surface used by pages.
 *
 * Resolves at render time which mode to show for a given cut:
 *   - Real video, if the cut's per-cut env var is set (founder recorded it)
 *   - Scripted kinetic-typography fallback otherwise
 *
 * Wraps both in the same chrome: pre-headline, subtitle, post-VSL CTA block.
 * Pages get one component to drop in; the mode swap is invisible to them.
 *
 * Cut prop drives:
 *   - Which env var URL is read (per-cut)
 *   - Which headline + subtitle render in the chrome
 *   - The CTA scroll target after the video finishes
 *
 * Note: the kinetic fallback still uses the legacy `VSL_SCRIPT` (110s
 * kinetic_compact). When the operator records the cut-specific version and
 * pushes its env var, the player flips to the recorded video for THAT
 * surface — even if other cuts remain on the kinetic fallback. This is the
 * Brunson chapter discipline: each surface lights up the moment its own
 * recording is ready.
 *
 * Why a client component: the children are client components (state, video
 * element, keyboard handlers). Wrapping at this layer avoids a redundant
 * server/client boundary inside the page's JSX.
 */

import { forwardRef, useCallback, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { VideoVsl } from "./video-vsl";
import { ScriptedVsl } from "./scripted-vsl";
import { VSL_SCRIPT } from "@/lib/vsl/script";
import {
  getCut,
  getCutPosterUrl,
  getCutVideoUrl,
  type VslCutId,
} from "@/lib/vsl/cuts";
import type { VslSurface } from "@/lib/analytics/events";

interface Props {
  surface: VslSurface;
  /**
   * Which cut to render. Drives env-var URL lookup and the chrome copy.
   * Defaults to `kinetic_compact` so existing mounts that pre-date the
   * cut prop continue to render the 110s compact cut.
   */
  cut?: VslCutId;
  /** Render the pre-headline above the stage. Off on pages that already lead with a hero. */
  showHeadline?: boolean;
  /** Render the post-VSL CTA row. Off on pages where the VSL precedes their own CTA. */
  showCta?: boolean;
  /** Autoplay the scripted fallback on mount. Defaults true. */
  autoplay?: boolean;
}

export function VslPlayer({
  surface,
  cut = "kinetic_compact",
  showHeadline = true,
  showCta = true,
  autoplay = true,
}: Props) {
  const cutDef = getCut(cut);
  const videoUrl = getCutVideoUrl(cut);
  const posterUrl = getCutPosterUrl(cut);
  const ctaRef = useRef<HTMLDivElement>(null);

  // When the VSL finishes (or visitor skips), scroll to the CTA block so
  // the offer is in view without making them hunt for the next click.
  const scrollToCta = useCallback(() => {
    if (!ctaRef.current) return;
    ctaRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <section
      className="w-full max-w-3xl mx-auto"
      aria-label={`Founder VSL — ${cutDef.title}`}
    >
      {showHeadline ? (
        <header className="text-center mb-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            {cutDef.lengthSec < 60
              ? `${cutDef.lengthSec} seconds, from the founder`
              : `${Math.round(cutDef.lengthSec / 60)} minutes, from the founder`}
          </p>
          <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-2">
            {cutDef.title}
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            {cutDef.subtitle}
          </p>
        </header>
      ) : null}

      {videoUrl ? (
        <VideoVsl
          src={videoUrl}
          poster={posterUrl}
          surface={surface}
          onReachedOffer={scrollToCta}
        />
      ) : (
        // Kinetic fallback always uses the 110s compact script — the
        // fallback is one format; per-cut variants ship via env-driven
        // recorded video. See lib/vsl/cuts.ts for the chapter discipline.
        <ScriptedVsl
          script={VSL_SCRIPT}
          surface={surface}
          autoplay={autoplay}
          onReachedOffer={scrollToCta}
        />
      )}

      {showCta ? <VslPostCta ref={ctaRef} surface={surface} /> : null}
    </section>
  );
}

/**
 * Post-VSL CTA block — three doors, omitting whichever door is the
 * current page. We forward the ref so the parent can smooth-scroll here
 * when the VSL ends.
 */
const VslPostCta = forwardRef<HTMLDivElement, { surface: VslSurface }>(
  function VslPostCta({ surface }, ref) {
    return (
      <div
        ref={ref}
        className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-stretch scroll-mt-16"
      >
        {surface === "funnel_hub" ? null : (
          <Button asChild size="lg" variant="outline">
            <Link href="/diagnostic">Get your free diagnosis</Link>
          </Button>
        )}
        {surface === "starter" ? null : (
          <Button asChild size="lg" variant="secondary">
            <Link href="/starter">Start the Machine for $1</Link>
          </Button>
        )}
        {surface === "machine_sales" ? null : (
          <Button asChild size="lg">
            <Link href="/machine-sales">The Full Machine — $49/mo</Link>
          </Button>
        )}
      </div>
    );
  },
);
