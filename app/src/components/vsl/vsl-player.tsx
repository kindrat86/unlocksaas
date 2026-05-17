"use client";

/**
 * VslPlayer — the public surface used by pages.
 *
 * Resolves at render time which mode to show:
 *   - Real video, if NEXT_PUBLIC_VSL_URL is set (founder recorded it)
 *   - Scripted kinetic-typography fallback otherwise
 *
 * Wraps both in the same chrome: pre-headline, subtitle, post-VSL CTA block.
 * Pages get one component to drop in; the mode swap is invisible to them.
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
import { getVslPosterUrl, getVslVideoUrl, VSL_SCRIPT } from "@/lib/vsl/script";
import type { VslSurface } from "@/lib/analytics/events";

interface Props {
  surface: VslSurface;
  /** Render the pre-headline above the stage. Off on pages that already lead with a hero. */
  showHeadline?: boolean;
  /** Render the post-VSL CTA row. Off on pages where the VSL precedes their own CTA. */
  showCta?: boolean;
  /** Autoplay the scripted fallback on mount. Defaults true. */
  autoplay?: boolean;
}

export function VslPlayer({
  surface,
  showHeadline = true,
  showCta = true,
  autoplay = true,
}: Props) {
  const videoUrl = getVslVideoUrl();
  const posterUrl = getVslPosterUrl();
  const ctaRef = useRef<HTMLDivElement>(null);

  // When the VSL finishes (or visitor skips), scroll to the CTA block so
  // the offer is in view without making them hunt for the next click.
  const scrollToCta = useCallback(() => {
    if (!ctaRef.current) return;
    ctaRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <section className="w-full max-w-3xl mx-auto" aria-label="Founder VSL">
      {showHeadline ? (
        <header className="text-center mb-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            110 seconds, from the founder
          </p>
          <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-2">
            {VSL_SCRIPT.title}
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            {VSL_SCRIPT.subtitle}
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
        <ScriptedVsl
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
