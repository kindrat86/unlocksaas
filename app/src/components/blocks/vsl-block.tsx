/**
 * Video Sales Letter block — Brunson Building Block #20 + Secret #20.
 *
 * Composition:
 *  1. Headline + sub-headline drawn from the cut metadata (per-surface
 *     copy — the bridge cold-ad subtitle is not the funnel-hub-hero subtitle).
 *  2. `VslPlayer` — the moving surface. Renders the cut's recorded video
 *     when the per-cut env var is set, kinetic-typography fallback otherwise.
 *  3. The textual transcript collapsed in a `<details>` below. Visitors who
 *     prefer reading get the cut's full transcript without watching, with
 *     a link to the full multi-cut transcript at `/vsl/transcript`.
 *
 * Per-cut env vars (set by operator after shoot day):
 *   NEXT_PUBLIC_VSL_<KEY>_URL           — recorded video URL (Mux / CF Stream / MP4)
 *   NEXT_PUBLIC_VSL_<KEY>_POSTER_URL    — player poster image
 *   NEXT_PUBLIC_VSL_<KEY>_THUMBNAIL_URL — JSON-LD thumbnailUrl (often same as poster)
 *
 * Where <KEY> ∈ { COLD_AD, IH_PROFILE, PODCAST_PITCH, HERO, EMAIL_1, KINETIC, MASTER }.
 *
 * Legacy: pre-cuts mounts that pushed `NEXT_PUBLIC_VSL_URL` (singular) still
 * activate the `funnel_hub_hero` and `kinetic_compact` cuts — see
 * `getCutVideoUrl` in lib/vsl/cuts.ts.
 */

import Link from "next/link";
import type { VslSurface } from "@/lib/analytics/events";
import { VslPlayer } from "@/components/vsl/vsl-player";
import { VideoJsonLd } from "@/components/seo/json-ld";
import {
  getCut,
  getCutPlainTranscript,
  getCutThumbnailUrl,
  getCutVideoUrl,
  isCutRecorded,
  type VslCutId,
} from "@/lib/vsl/cuts";

// Stable manual-bump date; see app/src/app/(marketing)/parables/page.tsx for
// the same rationale — avoid baking build timestamps into editorial claims.
const VSL_UPLOAD_DATE = "2026-05-17";

interface Props {
  /** Which page is mounting the block. Drives analytics surface attribution. */
  surface?: VslSurface;
  /**
   * Which cut to mount. Drives per-cut env-var lookup, JSON-LD metadata, and
   * the player headline/subtitle. Defaults to `kinetic_compact` so existing
   * mounts (which passed no prop) continue to render the 110s compact cut.
   *
   * Cut → surface mapping recommended by Brunson chapter #20:
   *   "bridge_cold_ad"        → /bridge
   *   "funnel_hub_hero"       → / (homepage)
   *   "email_1_what_why"      → linked from Soap Opera Email 1
   *   "full_long_form"        → /machine-sales, /starter, /founding
   *   "kinetic_compact"       → universal fallback
   */
  cut?: VslCutId;
  /** Autoplay the scripted fallback on mount. Default true. */
  autoplay?: boolean;
}

export function VslBlock({
  surface = "funnel_hub",
  cut = "kinetic_compact",
  autoplay = true,
}: Props) {
  const cutDef = getCut(cut);
  const contentUrl = getCutVideoUrl(cut);
  const thumbnailUrl = getCutThumbnailUrl(cut);
  const hasRecordedVsl = isCutRecorded(cut);

  return (
    <section
      className="py-16 px-6 max-w-3xl mx-auto"
      aria-label={`Founder VSL — ${cutDef.title}`}
    >
      {/* Surface B (AEO/GEO) — schema.org/VideoObject. Gated on env-driven
          content+thumbnail presence so we never claim a video that is not
          actually playable; matches the honest-empty-state discipline used
          by MediaBar and the Organization.logo omission. */}
      {hasRecordedVsl && contentUrl && thumbnailUrl ? (
        <VideoJsonLd
          name={cutDef.title}
          description={getCutPlainTranscript(cut)}
          uploadDate={VSL_UPLOAD_DATE}
          thumbnailUrl={thumbnailUrl}
          contentUrl={contentUrl}
          durationISO8601={cutDef.iso8601Duration}
          transcriptUrl={`https://unlocksaas.com/vsl/transcript#${cut}`}
        />
      ) : null}

      <div className="text-center mb-8">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Meet the founder
        </p>
        <h2 className="text-2xl font-bold leading-tight">{cutDef.title}</h2>
        {cutDef.subtitle ? (
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            {cutDef.subtitle}
          </p>
        ) : null}
      </div>

      {/* The moving surface — auto-swaps from scripted to recorded video
          the moment the cut's per-cut env var is configured. */}
      <VslPlayer
        surface={surface}
        cut={cut}
        showHeadline={false}
        showCta={false}
        autoplay={autoplay}
      />

      {/* Transcript block, collapsed by default. Visible to all visitors —
          accessibility + readers who skip video. Links out to the full
          multi-cut transcript for surface comparison. */}
      <details className="mt-8 group">
        <summary className="cursor-pointer text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
          Read it instead
        </summary>
        <div className="mt-4 space-y-3 pl-5 border-l-2 border-primary/40 text-muted-foreground leading-relaxed">
          {cutDef.segments.map((seg, i) => (
            <div key={i}>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/70 mb-1">
                {seg.label}
              </p>
              {seg.paragraphs.map((p, j) => (
                <p key={j} className="mb-2 last:mb-0">
                  {p}
                </p>
              ))}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-right mt-3 italic">
          — Maryan
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          <Link
            href="/vsl/transcript"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Read the full transcript across all seven cuts →
          </Link>
        </p>
      </details>
    </section>
  );
}
