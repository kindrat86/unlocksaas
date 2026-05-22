import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AbExposureBeacon } from "@/components/ab-exposure-beacon";
import {
  BreadcrumbJsonLd,
  VideoJsonLd,
} from "@/components/seo/json-ld";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import {
  episodeDiagnosticUrl,
  episodeNeighbors,
  episodePath,
  findEpisodeBySlug,
  FOUNDERS_DIARY_CHANNEL,
  FOUNDERS_DIARY_SLUGS,
  phaseLabel,
} from "@/lib/youtube";

/**
 * Programmatic SEO + AEO surface — per-episode landing page for The
 * Founder's Diary YouTube series.
 *
 * One URL per backlog entry (30 total at launch, grows as the series
 * extends). Each page renders one of two states off the episode's
 * `status` field:
 *
 *   - "draft" (default): honest scheduled-preview. Title + hook +
 *     Brunson beat + phase + diagnostic CTA. No fake aired-on dates,
 *     no synthetic transcripts, no "watched X times" — Brunson
 *     Hard-Rule from workbook 09. The URL is indexable ahead of
 *     publish so the SERP authority compounds; the page upgrades to
 *     the live state in place (same URL, no redirect) the moment
 *     the operator flips status + adds youtube_url + transcript.
 *
 *   - "live": full episode page. Watch CTA, key takeaways (if the
 *     operator hand-edited them), inline transcript (strongest signal
 *     for AEO citations — voice engines and AI Overviews paraphrase
 *     verbatim from on-page transcript text), diagnostic CTA, VideoObject
 *     JSON-LD with the YouTube URL.
 *
 * Static rendering: `generateStaticParams` enumerates the 30 backlog
 * slugs and `dynamicParams = false` blocks lazy generation of phantom
 * URLs. Every slug maps to a locked manifest entry in lib/youtube.ts.
 *
 * Internal copy hygiene: this page surfaces title, hook, Brunson beat,
 * and arc phase verbatim from the typed manifest. Production notes
 * (spine, b-roll) intentionally stay internal — they reference the
 * dream-customer first name and would violate
 * [[feedback_no_dream_customer_name_in_public_copy]] if exposed.
 */

const BASE = "https://unlocksaas.com";

/**
 * With Cache Components enabled (Next 16+), route segment config like
 * `dynamicParams = false` is incompatible. Unknown slugs are handled at
 * runtime by `findEpisodeBySlug` + `notFound()` below, which renders the
 * site-wide 404 instead of generating a phantom URL.
 */
export function generateStaticParams() {
  return FOUNDERS_DIARY_SLUGS.map((slug) => ({ slug }));
}

type RouteParams = { slug: string };

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const ep = findEpisodeBySlug(params.slug);
  if (!ep) return {};

  const canonical = episodePath(ep);
  const title = `${ep.id} · ${ep.title} – ${FOUNDERS_DIARY_CHANNEL.name}`;
  const description =
    ep.status === "live"
      ? `Episode ${ep.id} of ${FOUNDERS_DIARY_CHANNEL.name}: ${ep.title}. Watch the cut, read the transcript, take the 90-second diagnostic.`
      : `Episode ${ep.id} of ${FOUNDERS_DIARY_CHANNEL.name} (scheduled, not yet aired): ${ep.hook_3s}`;

  return {
    title,
    description,
    alternates: pageAlternates(canonical),
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      type: ep.status === "live" ? "video.episode" : "article",
      url: canonical,
      siteName: "Unlock SaaS",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/**
 * Best-effort YouTube embed URL from a watch URL. Handles the two
 * canonical YouTube URL shapes (`youtube.com/watch?v=ID` and
 * `youtu.be/ID`). Returns undefined for anything we don't recognise –
 * the VideoObject schema accepts a missing embedUrl, it just lowers
 * Rich-Result eligibility slightly. No fake embed URLs on unknown inputs.
 */
function deriveEmbedUrl(youtubeUrl: string): string | undefined {
  try {
    const u = new URL(youtubeUrl);
    if (u.hostname.endsWith("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname === "youtu.be") {
      const id = u.pathname.replace(/^\//, "");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
  } catch {
    /* malformed URL — return undefined */
  }
  return undefined;
}

/**
 * ISO-8601 duration string for a length-in-seconds (e.g. 360 → "PT6M").
 * VideoObject.duration uses this format.
 */
function isoDurationFromSeconds(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (seconds === 0) return `PT${minutes}M`;
  return `PT${minutes}M${seconds}S`;
}

export default async function EpisodePage(props: {
  params: Promise<RouteParams>;
}) {
  const params = await props.params;
  const ep = findEpisodeBySlug(params.slug);
  if (!ep) notFound();

  const canonical = `${BASE}${episodePath(ep)}`;
  const ctaUrl = episodeDiagnosticUrl(ep.utm_content);
  const isLive = ep.status === "live";
  const { prev, next } = episodeNeighbors(ep);

  // VideoObject schema for live episodes only. Honest by construction:
  // the schema only emits when the operator has flipped the entry to
  // "live" with a real youtube_url + publish_at. Pre-live entries emit
  // BreadcrumbList + the page-level OpenGraph article tags only.
  const videoSchema =
    isLive && ep.youtube_url && ep.publish_at ? (
      <VideoJsonLd
        name={ep.title}
        description={ep.hook_3s}
        uploadDate={ep.publish_at}
        thumbnailUrl={`${BASE}/opengraph-image`}
        durationISO8601={isoDurationFromSeconds(ep.length_target_seconds)}
        contentUrl={ep.youtube_url}
        {...(deriveEmbedUrl(ep.youtube_url)
          ? { embedUrl: deriveEmbedUrl(ep.youtube_url)! }
          : {})}
        {...(ep.transcript && ep.transcript.length > 0
          ? { transcriptText: ep.transcript }
          : {})}
      />
    ) : null;

  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      {/* Site-graph anchor: Home › The Founder's Diary › E07. Mirrors
          the visible nav and matches the depth pattern used by every
          other pSEO surface on the site. */}
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", url: `${BASE}/` },
          { name: FOUNDERS_DIARY_CHANNEL.name, url: `${BASE}/youtube` },
          { name: ep.id, url: canonical },
        ]}
      />
      {videoSchema}
      <AbExposureBeacon />

      <article className="max-w-2xl mx-auto">
        <header className="mb-8">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            {FOUNDERS_DIARY_CHANNEL.name} · Episode {ep.id} of{" "}
            {FOUNDERS_DIARY_CHANNEL.total_episodes_planned}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            {ep.title}
          </h1>
          <p
            className="text-lg text-muted-foreground leading-relaxed italic"
            data-speakable="hook"
          >
            &ldquo;{ep.hook_3s}&rdquo;
          </p>
        </header>

        {/* Context pills: phase, Brunson beat, lifecycle. Carries
            structural metadata for human readers and gives AI crawlers
            a stable, parseable summary band. */}
        <div className="mb-8 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-border bg-muted/30 px-3 py-1">
            {phaseLabel(ep.phase)}
          </span>
          <span className="rounded-full border border-border bg-muted/30 px-3 py-1 capitalize">
            Brunson beat: {ep.brunson_beat}
          </span>
          <span
            className={
              isLive
                ? "rounded-full border border-green-600/40 bg-green-50 px-3 py-1 text-green-900 dark:border-green-400/40 dark:bg-green-950 dark:text-green-100"
                : "rounded-full border border-amber-600/40 bg-amber-50 px-3 py-1 text-amber-900 dark:border-amber-400/40 dark:bg-amber-950 dark:text-amber-100"
            }
          >
            {isLive ? "Live on YouTube" : "Scheduled · not yet aired"}
          </span>
        </div>

        {isLive && ep.youtube_url ? (
          <section aria-labelledby="watch-heading" className="mb-10">
            <h2 id="watch-heading" className="sr-only">
              Watch on YouTube
            </h2>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <Button asChild>
                  <Link
                    href={ep.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Watch on YouTube →
                  </Link>
                </Button>
                {ep.publish_at && (
                  <p className="text-xs text-muted-foreground">
                    Aired{" "}
                    {new Date(ep.publish_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    .
                  </p>
                )}
              </CardContent>
            </Card>
          </section>
        ) : (
          /* Honest scheduled-preview. No fake air dates, no synthetic
             "watched X times". Just the four facts the operator has
             actually committed to: this episode is in the locked arc,
             it ships on the cadence, the URL upgrades in place, the
             diagnostic is the door regardless of episode state. */
          <section aria-labelledby="scheduled-heading" className="mb-10">
            <h2 id="scheduled-heading" className="sr-only">
              Scheduled, not yet aired
            </h2>
            <Card>
              <CardContent className="pt-6 space-y-3">
                <p className="text-sm font-semibold">
                  Scheduled. Not yet aired.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This episode is locked in the{" "}
                  {FOUNDERS_DIARY_CHANNEL.total_episodes_planned}-episode arc
                  and publishes on the channel&apos;s{" "}
                  {FOUNDERS_DIARY_CHANNEL.cadence} cadence. The page goes
                  live the moment the cut ships – same URL, no redirect.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  If you want the launch ping for this one, the 90-second
                  diagnostic below puts you on the list.
                </p>
              </CardContent>
            </Card>
          </section>
        )}

        {isLive &&
          ep.key_takeaways &&
          ep.key_takeaways.length > 0 && (
            <section
              aria-labelledby="takeaways-heading"
              className="mb-10"
            >
              <h2
                id="takeaways-heading"
                className="text-xl font-semibold mb-4"
              >
                Key takeaways
              </h2>
              <ul
                className="space-y-2 list-disc pl-5 text-sm text-muted-foreground leading-relaxed"
                data-speakable="takeaways"
              >
                {ep.key_takeaways.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </section>
          )}

        {isLive && ep.transcript && ep.transcript.length > 0 && (
          <section
            aria-labelledby="transcript-heading"
            className="mb-10"
          >
            <h2
              id="transcript-heading"
              className="text-xl font-semibold mb-4"
            >
              Transcript
            </h2>
            <div
              className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line"
              data-speakable="transcript"
            >
              {ep.transcript}
            </div>
          </section>
        )}

        <Separator className="mb-10" />

        {/* Diagnostic CTA — every episode page funnels to the same door,
            with utm_content stamped to the episode so attribution survives
            into the diagnostic results. */}
        <section aria-labelledby="cta-heading" className="mb-10">
          <h2 id="cta-heading" className="sr-only">
            Take the diagnostic
          </h2>
          <Card>
            <CardContent className="pt-6 space-y-3">
              <p className="text-sm font-semibold">
                If your Stripe line looks like the one in this episode,
                start where I started.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The 90-second free diagnostic reads your live product page
                and labels what is actually broken – Wrong Person, Weak
                Offer, or Weak Belief – and hands you the door that fixes
                it. No card. No bait-and-switch.
              </p>
              <Button asChild className="w-full mt-2">
                <Link href={ctaUrl}>Take the free diagnostic →</Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        {(prev || next) && (
          <nav
            aria-label="Episode navigation"
            className="mb-10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm"
          >
            {prev ? (
              <Link
                href={episodePath(prev)}
                className="rounded-lg border border-border p-4 hover:bg-muted/30 transition-colors"
              >
                <span className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  ← Previous · {prev.id}
                </span>
                <span className="block font-medium leading-snug">
                  {prev.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={episodePath(next)}
                className="rounded-lg border border-border p-4 hover:bg-muted/30 transition-colors sm:text-right"
              >
                <span className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  Next · {next.id} →
                </span>
                <span className="block font-medium leading-snug">
                  {next.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}

        <div className="text-center text-sm">
          <Link
            href="/youtube"
            className="text-muted-foreground hover:underline"
          >
            ← All episodes
          </Link>
        </div>
      </article>
    </div>
  );
}
