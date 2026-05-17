"use client";

/**
 * VslPlayer — the public surface used by pages.
 *
 * Renders the real video when NEXT_PUBLIC_VSL_URL is set; otherwise renders
 * a static placeholder in the same 16:9 stage. No animated/slide fallback —
 * the placeholder is intentionally still so visitors see "video coming"
 * rather than text-as-video.
 */

import { forwardRef, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { VideoVsl } from "./video-vsl";
import { getVslPosterUrl, getVslVideoUrl, VSL_SCRIPT } from "@/lib/vsl/script";
import type { VslSurface } from "@/lib/analytics/events";

interface Props {
  surface: VslSurface;
  /** Render the pre-headline above the stage. Off on pages that already lead with a hero. */
  showHeadline?: boolean;
  /** Render the post-VSL CTA row. Off on pages where the VSL precedes their own CTA. */
  showCta?: boolean;
}

export function VslPlayer({
  surface,
  showHeadline = true,
  showCta = true,
}: Props) {
  const videoUrl = getVslVideoUrl();
  const posterUrl = getVslPosterUrl();
  const ctaRef = useRef<HTMLDivElement>(null);

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
          onReachedOffer={() => {
            ctaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        />
      ) : (
        <VslPlaceholder />
      )}

      {showCta ? <VslPostCta ref={ctaRef} surface={surface} /> : null}
    </section>
  );
}

/**
 * Inert 16:9 surface shown until the real video URL is configured.
 * Deliberately static — no slides, no autoplay, no kinetic text.
 */
function VslPlaceholder() {
  return (
    <div
      className="relative w-full aspect-video rounded-lg overflow-hidden border bg-foreground text-background shadow-lg flex flex-col items-center justify-center text-center px-6"
      role="img"
      aria-label="Founder video — coming soon"
    >
      <div
        aria-hidden
        className="flex items-center justify-center w-16 h-16 rounded-full border border-background/30 text-background/70 text-2xl mb-4"
      >
        ▶
      </div>
      <p className="text-sm uppercase tracking-[0.2em] text-background/60 mb-2">
        Founder video
      </p>
      <p className="text-base text-background/80">Coming soon</p>
    </div>
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
