"use client";

/**
 * VslPlayer — the public surface used by pages.
 *
 * Maryan rejected the kinetic-typography cycling fallback on 2026-05-17
 * ("THE BIG DOMINO" auto-advancing scenes with a 5/11 indicator and a
 * "Skip to the offer" overlay). The text-only variant renders the same
 * script as static prose: visitor reads at their own pace, no autoplay,
 * no scene timer, no keyboard handlers.
 *
 * The video branch is preserved. When NEXT_PUBLIC_VSL_URL is set, the
 * page renders the real recording and the text block retires automatically.
 *
 * Why this stays "use client": VideoVsl still depends on client-side
 * <video> events for analytics. Keeping the wrapper as a client component
 * avoids a redundant server/client boundary inside the page's JSX.
 */

import { forwardRef, useCallback, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { VideoVsl } from "./video-vsl";
import { getVslPosterUrl, getVslVideoUrl, VSL_SCRIPT } from "@/lib/vsl/script";
import type { VslSurface } from "@/lib/analytics/events";

interface Props {
  surface: VslSurface;
  /** Render the pre-headline above the body. Off on pages that already lead with a hero. */
  showHeadline?: boolean;
  /** Render the post-VSL CTA row. Off on pages where the VSL precedes their own CTA. */
  showCta?: boolean;
  /** Retained for call-site compatibility. Ignored by the text-only fallback. */
  autoplay?: boolean;
}

export function VslPlayer({
  surface,
  showHeadline = true,
  showCta = true,
}: Props) {
  const videoUrl = getVslVideoUrl();
  const posterUrl = getVslPosterUrl();
  const ctaRef = useRef<HTMLDivElement>(null);

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
        <ScriptedText />
      )}

      {showCta ? <VslPostCta ref={ctaRef} surface={surface} /> : null}
    </section>
  );
}

/**
 * Text-only rendering of the VSL script. One block per scene, no chapters,
 * no progress bar, no controls. Reads top-to-bottom like prose.
 */
function ScriptedText() {
  return (
    <article className="rounded-lg border bg-card text-card-foreground px-6 sm:px-10 py-8 sm:py-10 shadow-sm">
      <div className="space-y-5 leading-relaxed">
        {VSL_SCRIPT.scenes.map((scene) => (
          <p key={scene.id} className="text-base sm:text-lg text-foreground">
            {scene.lines.join(" ")}
          </p>
        ))}
      </div>
      <p className="text-xs text-muted-foreground italic text-right mt-6">
        — Maryan
      </p>
    </article>
  );
}

/**
 * Post-VSL CTA block — three doors, omitting whichever door is the
 * current page. We forward the ref so the parent can smooth-scroll here
 * when the video VSL ends.
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
            <Link href="/starter">Start the Playbook for $1</Link>
          </Button>
        )}
        {surface === "playbook_sales" ? null : (
          <Button asChild size="lg">
            <Link href="/playbook-sales">The Full Playbook — $49/mo</Link>
          </Button>
        )}
      </div>
    );
  },
);
