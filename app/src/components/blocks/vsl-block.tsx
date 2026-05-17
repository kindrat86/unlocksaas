/**
 * Video Sales Letter block — Brunson Building Block #20.
 *
 * Composition:
 *  1. Headline + sub-headline (matches the existing page voice).
 *  2. `VslPlayer` — renders the real video when `NEXT_PUBLIC_VSL_URL` is
 *     set, a static placeholder otherwise (no slide fallback).
 *  3. The six-line founder intro (workbook 01 §6 Beat 2) collapsed in a
 *     <details> as the textual transcript below the player. Visitors who
 *     prefer reading get the identical content without watching.
 */

import type { VslSurface } from "@/lib/analytics/events";
import { VslPlayer } from "@/components/vsl/vsl-player";

const SIX_LINE_INTRO = `I'm a marketer and an operator. I have never written a line of production code.
For most of my life that closed a door. Then in 2026, Lovable and Claude opened it
and I shipped real AI products in weeks. The shipping part felt like magic.
What came after did not. I would launch, open Stripe, and watch a line lie flat.
What finally broke me was sitting with more than ten other founders and hearing
my own story back. So I built the machine I wish someone had handed me.`;

interface Props {
  /** Which page is mounting the block. Drives analytics surface attribution. */
  surface?: VslSurface;
}

export function VslBlock({ surface = "funnel_hub" }: Props) {
  return (
    <section className="py-16 px-6 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Meet the founder
        </p>
        <h2 className="text-2xl font-bold leading-tight">
          The story behind the Machine, in the founder&apos;s voice.
        </h2>
      </div>

      {/* Player surface — shows the real video when NEXT_PUBLIC_VSL_URL is
          configured, a static placeholder otherwise. */}
      <VslPlayer
        surface={surface}
        showHeadline={false}
        showCta={false}
      />

      {/* Transcript block, collapsed by default. Visible to all visitors —
          accessibility + readers who skip video. */}
      <details className="mt-8 group">
        <summary className="cursor-pointer text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
          Read it instead
        </summary>
        <blockquote className="mt-4 pl-5 border-l-2 border-primary/40 text-muted-foreground leading-relaxed whitespace-pre-line">
          {SIX_LINE_INTRO}
        </blockquote>
        <p className="text-xs text-muted-foreground text-right mt-3 italic">— Maryan</p>
      </details>
    </section>
  );
}
