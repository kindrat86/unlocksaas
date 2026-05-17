/**
 * Video Sales Letter block — Brunson Building Block #20.
 *
 * Composition:
 *  1. Headline + sub-headline (matches the existing page voice).
 *  2. `VslPlayer` — the actual moving surface. Renders the real video when
 *     `NEXT_PUBLIC_VSL_URL` is set, kinetic-typography fallback otherwise.
 *  3. The six-line founder intro (workbook 01 §6 Beat 2) collapsed in a
 *     <details> as the textual transcript below the player. Visitors who
 *     prefer reading get the identical content without watching.
 *
 * Why no `src` prop anymore: the player resolves its source from env, so
 * pages do not have to pass it. When the founder records and pushes the
 * URL to Vercel, every page that mounts this block flips to real video
 * with no code change.
 *
 * Visual treatment: ClickFunnels 1.0 light theme — purple gradient backdrop,
 * thick orange frame around the player ("the show is happening here"), bold
 * black headline with yellow highlight on the key phrase.
 */

import type { VslSurface } from "@/lib/analytics/events";
import { VslPlayer } from "@/components/vsl/vsl-player";
import { VideoJsonLd } from "@/components/seo/json-ld";

const SIX_LINE_INTRO = `I'm a marketer and an operator. I have never written a line of production code.
For most of my life that closed a door. Then in 2026, Lovable and Claude opened it
and I shipped real AI products in weeks. The shipping part felt like magic.
What came after did not. I would launch, open Stripe, and watch a line lie flat.
What finally broke me was sitting with more than ten other founders and hearing
my own story back. So I built the machine I wish someone had handed me.`;

// VideoObject schema description — same source-of-truth as the visible <details>
// transcript. AIO/GEO rule: JSON-LD claims must match the visible page content.
// Strip whitespace runs so the schema field reads as one paragraph.
const VSL_SCHEMA_DESCRIPTION = SIX_LINE_INTRO.replace(/\s+/g, " ").trim();

// VideoObject is rendered only when both URL and thumbnail env vars are set.
// Brunson Hard-Rule (honest claims): we do not declare a VideoObject for the
// kinetic-typography fallback, because a kinetic-text loop is not a "video" in
// the sense LLMs and Google's video crawler expect. Once the founder records
// and pushes NEXT_PUBLIC_VSL_URL + NEXT_PUBLIC_VSL_THUMBNAIL_URL, the schema
// auto-activates. Until then, no schema, no claim.
const VSL_CONTENT_URL = process.env.NEXT_PUBLIC_VSL_URL;
const VSL_THUMBNAIL_URL = process.env.NEXT_PUBLIC_VSL_THUMBNAIL_URL;
// Stable manual-bump date; see app/src/app/(marketing)/parables/page.tsx for
// the same rationale — avoid baking build timestamps into editorial claims.
const VSL_UPLOAD_DATE = "2026-05-17";

interface Props {
  /** Which page is mounting the block. Drives analytics surface attribution. */
  surface?: VslSurface;
  /** Autoplay the scripted fallback on mount. Default true. */
  autoplay?: boolean;
}

export function VslBlock({ surface = "funnel_hub", autoplay = true }: Props) {
  const hasRecordedVsl = Boolean(VSL_CONTENT_URL && VSL_THUMBNAIL_URL);

  return (
    <section className="bg-gradient-to-b from-purple-50 via-white to-white py-16 sm:py-20 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Surface B (AEO/GEO) — schema.org/VideoObject. Gated on env-driven
            content+thumbnail presence so we never claim a video that is not
            actually playable; matches the honest-empty-state discipline used
            by MediaBar and the Organization.logo omission. */}
        {hasRecordedVsl ? (
          <VideoJsonLd
            name="The story behind the Machine"
            description={VSL_SCHEMA_DESCRIPTION}
            uploadDate={VSL_UPLOAD_DATE}
            thumbnailUrl={VSL_THUMBNAIL_URL!}
            contentUrl={VSL_CONTENT_URL!}
          />
        ) : null}

        <div className="text-center mb-8 sm:mb-10">
          <p className="text-[11px] sm:text-xs uppercase tracking-[0.25em] font-bold text-purple-700 mb-3">
            Meet the founder
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight">
            The story behind the Machine, in{" "}
            <span className="bg-yellow-300 px-1.5 py-0.5 box-decoration-clone">
              the founder&apos;s voice.
            </span>
          </h2>
        </div>

        {/* Orange frame — CF visual cue: "this is where the show is happening". */}
        <div className="rounded-2xl bg-white p-2 shadow-2xl shadow-purple-900/20 border-4 border-orange-500">
          <div className="rounded-xl overflow-hidden bg-gray-900">
            <VslPlayer
              surface={surface}
              showHeadline={false}
              showCta={false}
              autoplay={autoplay}
            />
          </div>
        </div>

        {/* Transcript block, collapsed by default. Visible to all visitors —
            accessibility + readers who skip video. */}
        <details className="mt-8 group">
          <summary className="cursor-pointer text-xs uppercase tracking-widest font-bold text-purple-700 hover:text-purple-900 transition-colors">
            Read it instead →
          </summary>
          <blockquote className="mt-4 pl-5 border-l-4 border-orange-500 text-gray-700 leading-relaxed whitespace-pre-line bg-purple-50/40 py-3 pr-4 rounded-r">
            {SIX_LINE_INTRO}
          </blockquote>
          <p className="text-xs text-gray-600 text-right mt-3 italic">— Maryan</p>
        </details>
      </div>
    </section>
  );
}
