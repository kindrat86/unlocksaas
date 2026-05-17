import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbListJsonLd, VideoJsonLd } from "@/components/seo/json-ld";
import {
  CUT_DISPLAY_ORDER,
  getCut,
  getCutClipParts,
  getCutPlainTranscript,
  getCutThumbnailUrl,
  getCutVideoUrl,
  isCutRecorded,
  VSL_CUTS,
  type VslCut,
} from "@/lib/vsl/cuts";

/**
 * `/vsl/transcript` — the public, indexable transcript of every founder VSL cut.
 *
 * Brunson Secret #20 (VSL Funnels) + Traffic Secrets Secret #11 (Google /
 * AEO surfaces). A transcript page does three things at once:
 *
 *   1. **Accessibility.** Visitors who can't / won't watch can read.
 *   2. **AEO/GEO.** LLMs cite text, not video. The transcript is the canonical
 *      source for any "what does UnlockSaaS sell" answer. VideoObject JSON-LD
 *      with `transcript` pointing back at the same URL closes the loop —
 *      Google + answer engines see the text claim and the video claim
 *      together.
 *   3. **Surface comparison.** Operator can see all seven cuts side-by-side
 *      and verify the Big Domino lands in every one. Drift surface.
 *
 * Static content — no fetches, no force-dynamic. Indexable by Google.
 * Listed in `app/src/app/sitemap.ts` for crawl priority.
 */

export const metadata: Metadata = {
  title: "The full transcript of the founder VSL — every cut, every chapter",
  description:
    "Seven cuts of the UnlockSaaS founder VSL — from the 22-second cold-ad cut to the 3:45 master. Read the Big Domino, the disqualifier, the guarantee, in the founder's own words.",
  alternates: { canonical: "/vsl/transcript" },
  openGraph: {
    title: "The founder VSL transcript — UnlockSaaS",
    description:
      "Seven cuts, every chapter. The Big Domino, the disqualifier, the guarantee — in writing.",
    url: "/vsl/transcript",
    type: "article",
  },
};

const VSL_UPLOAD_DATE = "2026-05-17";

export default function VslTranscriptPage() {
  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <BreadcrumbListJsonLd
        trail={[
          { name: "Home", url: "https://unlocksaas.com/" },
          { name: "VSL Transcript", url: "https://unlocksaas.com/vsl/transcript" },
        ]}
      />

      {/* Per-cut VideoObject JSON-LD — gated on `isCutRecorded` so we never
          claim a video that is not actually playable. Today, every gate
          returns false; once env vars are pushed, schema auto-activates,
          one cut at a time. Brunson honest-claims rule. */}
      {VSL_CUTS.map((cut) =>
        isCutRecorded(cut.id) ? (
          <VideoJsonLd
            key={cut.id}
            name={cut.title}
            description={getCutPlainTranscript(cut.id)}
            uploadDate={VSL_UPLOAD_DATE}
            thumbnailUrl={getCutThumbnailUrl(cut.id)!}
            contentUrl={getCutVideoUrl(cut.id)!}
            durationISO8601={cut.iso8601Duration}
            transcriptUrl={`https://unlocksaas.com/vsl/transcript#${cut.id}`}
          />
        ) : null,
      )}

      <article className="max-w-3xl mx-auto">
        <header className="mb-12">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            The Reluctant Hero, in writing
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
            Seven cuts of the founder VSL. Every chapter, every Big Domino,
            every disqualifier.
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Brunson DotCom Secrets Secret #20 teaches that one VSL is never
            enough — every surface in the funnel gets the cut that fits it.
            What follows is every cut, in Brunson&apos;s WWWH order
            (Who / What / Why / How), in the founder&apos;s voice. Read the
            cut closest to the surface you arrived from.
          </p>
        </header>

        {/* Anchor index — readers can jump to any cut. */}
        <nav
          aria-label="Jump to a cut"
          className="mb-12 rounded-lg border border-border/60 bg-muted/30 px-4 py-4 sm:px-5"
        >
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Skip to a cut
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {CUT_DISPLAY_ORDER.map((id) => {
              const cut = getCut(id);
              return (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="hover:underline underline-offset-4"
                  >
                    {formatLength(cut.lengthSec)} — {cut.title}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* The cuts, in stable order. Each renders as its own <section>
            with id={cut.id} so deep-links from VideoObject.transcript +
            email body links land directly on the right cut. */}
        <div className="space-y-16">
          {CUT_DISPLAY_ORDER.map((id) => (
            <CutSection key={id} cut={getCut(id)} />
          ))}
        </div>

        {/* Footer — how to get back to the funnel. */}
        <footer className="mt-20 pt-12 border-t">
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            That&apos;s the whole transcript. Pick the next door.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/diagnostic"
              className="inline-flex items-center justify-center rounded-md border border-border px-5 py-3 text-sm font-medium hover:bg-muted transition-colors"
            >
              Free diagnostic →
            </Link>
            <Link
              href="/starter"
              className="inline-flex items-center justify-center rounded-md border border-border px-5 py-3 text-sm font-medium hover:bg-muted transition-colors"
            >
              $1 Starter →
            </Link>
            <Link
              href="/machine-sales"
              className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-5 py-3 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              The full Machine — $49/mo →
            </Link>
          </div>
        </footer>
      </article>
    </div>
  );
}

function CutSection({ cut }: { cut: VslCut }) {
  const recorded = isCutRecorded(cut.id);
  return (
    <section id={cut.id} className="scroll-mt-20">
      <header className="mb-6">
        <div className="flex items-baseline justify-between flex-wrap gap-3 mb-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {formatLength(cut.lengthSec)} — for{" "}
            {cut.surfaces.join(" / ").replace(/_/g, " ")}
          </p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60">
            {recorded ? "Recorded · auto-playing" : "Awaiting recording"}
          </p>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
          {cut.title}
        </h2>
        <p className="text-base text-muted-foreground mt-3 leading-relaxed">
          {cut.subtitle}
        </p>
      </header>

      <div className="space-y-8">
        {cut.segments.map((seg, i) => (
          <div key={i}>
            <div className="flex items-baseline gap-3 mb-3">
              <span className="inline-block text-[10px] uppercase tracking-widest font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                {seg.chapter}
              </span>
              <p className="text-sm font-semibold">{seg.label}</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 ml-auto">
                {formatTimeRange(seg.startOffsetSec, seg.lengthSec)}
              </p>
            </div>
            <div className="space-y-3 text-foreground leading-relaxed pl-5 border-l-2 border-primary/40">
              {seg.paragraphs.map((p, j) => (
                <p key={j}>{p}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {cut.outputFraming ? (
        <div className="mt-8 rounded-md bg-muted/40 px-4 py-3 text-xs text-muted-foreground leading-relaxed">
          <strong className="font-semibold text-foreground">
            Output framing:
          </strong>{" "}
          {cut.outputFraming}
        </div>
      ) : null}

      {/* hasPart Clip preview — same data as the JSON-LD (and visible).
          Lets the operator audit chapter boundaries pre-shoot. */}
      <details className="mt-6 group">
        <summary className="cursor-pointer text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
          Chapter clip map (for video deep-links + JSON-LD)
        </summary>
        <ol className="mt-3 space-y-1 text-xs text-muted-foreground pl-5">
          {getCutClipParts(cut.id).map((clip, i) => (
            <li key={i}>
              <span className="font-mono text-foreground">
                {formatTimeRange(clip.startOffset, clip.endOffset - clip.startOffset)}
              </span>{" "}
              · {clip.name}
            </li>
          ))}
        </ol>
      </details>
    </section>
  );
}

function formatLength(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (s === 0) return `${m}m`;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

function formatTimeRange(startSec: number, lengthSec: number): string {
  return `${formatTimestamp(startSec)}–${formatTimestamp(startSec + lengthSec)}`;
}

function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
