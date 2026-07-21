/**
 * "Meet the founder" block — Brunson Building Block #20.
 *
 * Video variant since 2026-05-18. Maryan recorded the founder origin story as
 * a vertical 3:34 talking-head VSL; the asset is served from /public so the
 * block has zero external dependencies and works without an env var. The
 * earlier text-only fallback (six-line static intro) stays mounted underneath
 * the player as a caption so the page still tells the story when the video
 * is muted, fails to load, or is read by a non-visual agent.
 *
 * The 9:16 portrait is capped at a phone-sized container on desktop — Brunson
 * "video the size of a phone screen" preserves the recorded composition and
 * stops the talking head from dominating the funnel hub layout.
 *
 * VideoObject JSON-LD is emitted alongside the player because the asset URL
 * is now real and stable (Brunson Hard-Rule satisfied: no fabricated
 * contentUrl). transcriptUrl points at the funnel hub markdown mirror, which
 * is the spoken-content source of truth the same way the audio rendition
 * uses it.
 *
 * Props are kept as accept-and-ignore so the existing call sites
 * (`src/app/page.tsx`, `src/app/(marketing)/playbook-sales/page.tsx`) keep
 * compiling without an upstream change.
 */

import { VideoJsonLd } from "@/components/seo/json-ld";

const SIX_LINE_INTRO = `I'm a marketer and an operator. I have never written a line of production code.
For most of my life that closed a door. Then in 2026, Lovable and Claude opened it
and I shipped real AI products in weeks. The shipping part felt like magic.
What came after did not. I would launch, open Stripe, and watch a line lie flat.
What finally broke me was sitting with more than ten other founders and hearing
my own story back. So I built the playbook I wish someone had handed me.`;

const SEVEN_LINE_DESIRE = `What I wanted was not more users. It was one user who paid. Not validation. A Stripe charge. I wanted to know that what I built was worth something to at least one person who had no relationship with me — no obligation, no friendship discount, no "I will promote you" trade. Just a card entered for a product that solved a problem they actually had. That is what I wanted. I did not know how to name it at the time. I just knew the refresh was not working.`;

const VIDEO_SRC = "/founder-vsl.mp4";
const POSTER_SRC = "/founder-vsl-poster.jpg";

interface Props {
  /** Retained for call-site compatibility; ignored. */
  surface?: string;
  /** Retained for call-site compatibility; ignored. */
  autoplay?: boolean;
}

import { cacheLife } from "next/cache";

export async function VslBlock(_props: Props = {}) {
  "use cache";
  cacheLife("days");
  return (
    <section className="py-16 px-6 max-w-3xl mx-auto">
      <VideoJsonLd
        name="Meet the founder — the story behind UnlockSaaS"
        description="Maryan, an indie hacker who never wrote a line of production code, on shipping ten AI products, watching the Stripe line stay flat, sitting with other founders, and building the playbook he wished someone had handed him."
        uploadDate="2026-05-18"
        durationISO8601="PT3M35S"
        thumbnailUrl="https://unlocksaas.com/founder-vsl-poster.jpg"
        contentUrl="https://unlocksaas.com/founder-vsl.mp4"
        transcriptUrl="https://unlocksaas.com/index.md"
      />

      <div className="text-center mb-8">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Meet the founder
        </p>
        <h2 className="text-2xl font-bold leading-tight">
          The story behind the Playbook, in the founder&apos;s voice.
        </h2>
      </div>

      <div className="mx-auto mb-8 w-full max-w-xs">
        {/* aspect-[9/16] reserves the portrait box before the poster loads
            (CLS guard); preload="none" keeps the 14MB MP4 from streaming
            until the visitor actually presses play. */}
        <video
          className="block w-full aspect-[9/16] rounded-xl border border-border bg-muted shadow-sm"
          poster={POSTER_SRC}
          controls
          preload="none"
          playsInline
        >
          <source src={VIDEO_SRC} type="video/mp4" />
          <track
            kind="captions"
            src="/founder-vsl.vtt"
            srcLang="en"
            label="English captions"
          />
          Your browser does not support embedded video. The full story is in
          the caption below.
        </video>
        <p className="mt-2 text-center text-xs text-muted-foreground italic">
          3:35 · sound on
        </p>
      </div>

      <blockquote className="pl-5 border-l-2 border-primary/40 text-muted-foreground leading-relaxed whitespace-pre-line">
        {SIX_LINE_INTRO}
      </blockquote>
      <blockquote className="pl-5 border-l-2 border-primary/40 text-muted-foreground leading-relaxed whitespace-pre-line mt-6 italic">
        {SEVEN_LINE_DESIRE}
      </blockquote>
      <p className="text-xs text-muted-foreground text-right mt-3 italic">— Maryan</p>
    </section>
  );
}
