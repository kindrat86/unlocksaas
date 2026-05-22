import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArticleJsonLd,
  BreadcrumbListJsonLd,
  VideoJsonLd,
} from "@/components/seo/json-ld";
import { BASE_URL, FOUNDER, ORGANIZATION } from "@/lib/seo/entity";
import {
  FOUNDERS_DIARY_CHANNEL,
  buildEpisodeStaticParams,
  episodeDiagnosticUrl,
  episodeSlug,
  extractYouTubeId,
  getLiveEpisodeBySlug,
  isoDuration,
  liveEpisodes,
  youtubeEmbedUrl,
  youtubeThumbnailUrl,
  type FoundersDiaryEpisode,
} from "@/lib/youtube";

/**
 * /youtube/[slug] — per-episode landing page for The Founder's Diary.
 *
 * This is the per-episode SEO surface for the faceless YouTube channel.
 * Goal:
 *   - One indexable URL per live episode.
 *   - VideoObject + Article JSON-LD wired together so Google video carousel
 *     and AI Overviews can both attach to the same entity.
 *   - Verbatim transcript rendered in the DOM (under <details> so the page
 *     stays light by default) — the highest-leverage SEO + AEO asset on the
 *     page because each ~5-minute episode contributes ~750 words of indexable
 *     prose that the YouTube embed alone does not.
 *   - One CTA, to /diagnostic, stamped with the episode-specific utm_content
 *     so attribution back to the episode is mechanical.
 *
 * Render contract
 * ---------------
 * generateStaticParams enumerates ONLY episodes that liveEpisodes() returns
 * — i.e. operator-confirmed live with a youtube_url. Unknown slugs 404 via
 * notFound(). The honest empty-state at /youtube already documents the
 * pre-launch posture (no episodes); this route just does not render anything
 * for them, and the sitemap reflects that.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - generateStaticParams returns [] when the registry has no live episodes,
 *     so no ghost slugs are exposed.
 *   - validateRegistry in @/lib/youtube already rejects status="live" without
 *     a youtube_url, so getLiveEpisodeBySlug never returns an episode whose
 *     embed url is missing.
 *   - The transcript section is omitted entirely when the operator did not
 *     paste one — no auto-generated transcript, no "[transcript pending]"
 *     placeholder.
 *   - The long_description fallback is hook_3s; we never invent body copy.
 */

interface PageParams {
  readonly slug: string;
}

const HUB_PATH = "/youtube";
const HUB_URL = `${BASE_URL}${HUB_PATH}`;

function episodePath(ep: Pick<FoundersDiaryEpisode, "id" | "title">): string {
  return `${HUB_PATH}/${episodeSlug(ep)}`;
}

function episodeUrl(ep: Pick<FoundersDiaryEpisode, "id" | "title">): string {
  return `${BASE_URL}${episodePath(ep)}`;
}

/**
 * Sibling navigation. Returns the previous and next episodes by episode
 * number, both restricted to the live set so a draft cannot leak into the
 * navigation. Wrap-around is intentional — at end-of-series the "next" link
 * points back to E01 so the page never has a dead end.
 */
function siblingEpisodes(current: FoundersDiaryEpisode): {
  readonly prev: FoundersDiaryEpisode | undefined;
  readonly next: FoundersDiaryEpisode | undefined;
} {
  const live = [...liveEpisodes()].sort((a, b) => a.number - b.number);
  if (live.length < 2) {
    return { prev: undefined, next: undefined };
  }
  const idx = live.findIndex((ep) => ep.id === current.id);
  if (idx === -1) {
    return { prev: undefined, next: undefined };
  }
  const prev = idx === 0 ? live[live.length - 1] : live[idx - 1];
  const next = idx === live.length - 1 ? live[0] : live[idx + 1];
  return { prev, next };
}

/**
 * Static slug enumeration. Pre-launch (zero live episodes) the helper
 * returns a single sentinel slug so the Cache Components empty-array guard
 * is satisfied; the page body calls notFound() for that sentinel so it
 * 404s at runtime. Once the operator promotes a real episode the sentinel
 * disappears and real slugs replace it on the next deploy.
 */
export function generateStaticParams(): Array<{ slug: string }> {
  return buildEpisodeStaticParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const ep = getLiveEpisodeBySlug(slug);
  if (!ep) {
    return { title: "Episode not found" };
  }
  const canonical = episodePath(ep);
  const description = ep.long_description?.split("\n\n")[0] ?? ep.hook_3s;
  const videoId = ep.youtube_url ? extractYouTubeId(ep.youtube_url) : null;
  const thumbnail = videoId ? youtubeThumbnailUrl(videoId) : undefined;
  return {
    title: `${ep.id} · ${ep.title} — ${FOUNDERS_DIARY_CHANNEL.name}`,
    description,
    alternates: { canonical },
    keywords: ep.keywords ? [...ep.keywords] : undefined,
    openGraph: {
      type: "article",
      title: `${ep.id} · ${ep.title}`,
      description,
      url: canonical,
      siteName: ORGANIZATION.name,
      publishedTime: ep.publish_at,
      authors: [FOUNDER.name],
      ...(thumbnail ? { images: [{ url: thumbnail }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${ep.id} · ${ep.title}`,
      description,
      ...(thumbnail ? { images: [thumbnail] } : {}),
    },
    robots: { index: true, follow: true },
  };
}

export default async function FoundersDiaryEpisodePage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;
  const ep = getLiveEpisodeBySlug(slug);
  if (!ep) {
    notFound();
  }

  // validateRegistry guarantees a youtube_url when status === "live", and
  // getLiveEpisodeBySlug only returns live entries, so youtube_url is
  // present here. The non-null assertion is the type-narrowing handshake
  // with the registry contract.
  const youtubeUrl = ep.youtube_url as string;
  const videoId = extractYouTubeId(youtubeUrl);
  const thumbnail = videoId ? youtubeThumbnailUrl(videoId) : undefined;
  const embedSrc = videoId ? youtubeEmbedUrl(videoId) : undefined;
  const duration = isoDuration(ep.length_target_seconds);

  const canonical = episodeUrl(ep);
  const cta = episodeDiagnosticUrl(ep.utm_content);
  const { prev, next } = siblingEpisodes(ep);

  const lede = ep.long_description?.split("\n\n") ?? [ep.hook_3s];
  const transcriptParagraphs = ep.transcript
    ?.split(/\n{2,}/g)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const articleKeywords = ep.keywords ?? [
    `${FOUNDERS_DIARY_CHANNEL.name} episode`,
    `indie SaaS founder ${new Date(ep.publish_at).getUTCFullYear()}`,
    "post-launch pre-revenue SaaS",
    "non-engineer founder",
    `Brunson ${ep.brunson_beat}`,
  ];

  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <BreadcrumbListJsonLd
        trail={[
          { name: ORGANIZATION.name, url: `${BASE_URL}/` },
          { name: FOUNDERS_DIARY_CHANNEL.name, url: HUB_URL },
          { name: `${ep.id} · ${ep.title}`, url: canonical },
        ]}
      />
      <ArticleJsonLd
        headline={`${ep.id} · ${ep.title}`}
        description={lede[0] ?? ep.hook_3s}
        url={canonical}
        datePublished={ep.publish_at}
        dateModified={ep.publish_at}
        {...(thumbnail ? { imageUrl: thumbnail } : {})}
        articleSection={FOUNDERS_DIARY_CHANNEL.name}
        keywords={articleKeywords}
        {...(transcriptParagraphs && transcriptParagraphs.length > 0
          ? { wordCount: transcriptParagraphs.join(" ").split(/\s+/).length }
          : {})}
      />
      {videoId && thumbnail ? (
        <VideoJsonLd
          name={`${ep.id} · ${ep.title}`}
          description={lede[0] ?? ep.hook_3s}
          uploadDate={ep.publish_at}
          thumbnailUrl={thumbnail}
          durationISO8601={duration}
          contentUrl={youtubeUrl}
          {...(embedSrc ? { embedUrl: embedSrc } : {})}
          {...(ep.transcript ? { transcriptText: ep.transcript } : {})}
        />
      ) : null}

      <article className="max-w-3xl mx-auto">
        <nav
          aria-label="Breadcrumb"
          className="text-xs text-muted-foreground mb-6"
        >
          <Link
            href="/"
            className="underline underline-offset-4 hover:text-foreground"
          >
            {ORGANIZATION.name}
          </Link>
          <span className="mx-2" aria-hidden>
            ›
          </span>
          <Link
            href={HUB_PATH}
            className="underline underline-offset-4 hover:text-foreground"
          >
            {FOUNDERS_DIARY_CHANNEL.name}
          </Link>
          <span className="mx-2" aria-hidden>
            ›
          </span>
          <span>{ep.id}</span>
        </nav>

        <header className="mb-8">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            {FOUNDERS_DIARY_CHANNEL.name} · Episode {ep.id} ·{" "}
            <time dateTime={ep.publish_at}>
              {new Date(ep.publish_at).toISOString().slice(0, 10)}
            </time>
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            {ep.title}
          </h1>
          <p
            className="text-base text-muted-foreground leading-relaxed"
            data-speakable
          >
            {ep.hook_3s}
          </p>
        </header>

        {embedSrc ? (
          <div className="mb-8 rounded-lg overflow-hidden border border-border bg-muted/30">
            <div className="relative w-full aspect-video">
              <iframe
                src={embedSrc}
                title={`${ep.id} · ${ep.title}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </div>
        ) : (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-3">
                Embed not available for this URL shape. Watch on YouTube:
              </p>
              <Button asChild variant="outline" size="sm">
                <Link
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open episode on YouTube
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {lede.length > 1 || ep.long_description ? (
          <section
            className="mb-10 space-y-4 leading-relaxed"
            aria-labelledby="episode-notes"
          >
            <h2 id="episode-notes" className="text-2xl font-bold">
              Episode notes
            </h2>
            {lede.map((paragraph, idx) => (
              <p key={`lede-${idx}`} data-speakable={idx === 0 ? "" : undefined}>
                {paragraph}
              </p>
            ))}
          </section>
        ) : null}

        <Card className="mb-10">
          <CardContent className="pt-6 space-y-3">
            <p className="text-sm font-semibold">
              The door at the end of every episode is the same.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The 90-second free diagnostic reads your live product page and
              labels what is actually broken – Wrong Person, Weak Offer, or
              Weak Belief – and hands you the door that fixes it. No card. No
              bait-and-switch.
            </p>
            <Button asChild className="w-full mt-2">
              <Link href={cta}>Take the free diagnostic →</Link>
            </Button>
          </CardContent>
        </Card>

        {transcriptParagraphs && transcriptParagraphs.length > 0 ? (
          <section className="mb-10" aria-labelledby="transcript">
            <h2 id="transcript" className="text-2xl font-bold mb-3">
              Transcript
            </h2>
            <details className="rounded-lg border border-border bg-muted/20 p-5">
              <summary className="cursor-pointer text-sm font-medium select-none">
                Read the full episode transcript (
                {transcriptParagraphs.join(" ").split(/\s+/).length} words)
              </summary>
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
                {transcriptParagraphs.map((paragraph, idx) => (
                  <p key={`transcript-${idx}`}>{paragraph}</p>
                ))}
              </div>
            </details>
            <p className="mt-3 text-xs text-muted-foreground">
              Transcript is the verbatim voice-over script. Lightly cleaned for
              line breaks; nothing rephrased. The same script is what generated
              the audio.
            </p>
          </section>
        ) : null}

        <Separator className="my-8" />

        <section className="mb-10" aria-labelledby="more-episodes">
          <h2 id="more-episodes" className="text-2xl font-bold mb-4">
            More from the series
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {prev ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                    ← Previous episode
                  </p>
                  <Link
                    href={episodePath(prev)}
                    className="text-sm font-semibold underline underline-offset-4"
                  >
                    {prev.id} · {prev.title}
                  </Link>
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                    {prev.hook_3s}
                  </p>
                </CardContent>
              </Card>
            ) : null}
            {next ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                    Next episode →
                  </p>
                  <Link
                    href={episodePath(next)}
                    className="text-sm font-semibold underline underline-offset-4"
                  >
                    {next.id} · {next.title}
                  </Link>
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                    {next.hook_3s}
                  </p>
                </CardContent>
              </Card>
            ) : null}
          </div>
          <p className="mt-4 text-sm">
            <Link href={HUB_PATH} className="underline underline-offset-4">
              All episodes of {FOUNDERS_DIARY_CHANNEL.name} →
            </Link>
          </p>
        </section>
      </article>
    </div>
  );
}
