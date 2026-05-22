import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArticleJsonLd,
  BreadcrumbJsonLd,
} from "@/components/seo/json-ld";
import { Separator } from "@/components/ui/separator";
import { BASE_URL, FOUNDER, ORGANIZATION } from "@/lib/seo/entity";
import {
  episodeDiagnosticUrl,
  episodePath,
  episodeTranscriptMdPath,
  episodeTranscriptMdUrl,
  episodeTranscriptPath,
  episodeTranscriptUrl,
  episodeUrl,
  findEpisodeBySlug,
  FOUNDERS_DIARY_CHANNEL,
  FOUNDERS_DIARY_SLUGS,
  phaseLabel,
} from "@/lib/youtube";

/**
 * /youtube/[slug]/transcript – per-episode human-readable transcript.
 *
 * Why this page exists
 * --------------------
 * Schema.org VideoObject accepts a `transcript` field – when populated with
 * a URL, AI summarisers (Apple, Google, ChatGPT browse, Claude browse,
 * Perplexity) follow it to pull verbatim text instead of attempting to
 * transcribe the video themselves. Surfacing the transcript at a stable
 * URL is the single highest-leverage AEO move once an episode publishes
 * (matches the VEO uplift we landed for /podcast/[slug]/transcript on
 * 2026-05-21).
 *
 * Brunson Hard-Rule discipline
 * ----------------------------
 * The route 404s unless the episode is status="live" AND has a hand-pasted
 * transcript field. Pre-launch every entry is status="draft" with no
 * transcript – so the URL doesn't exist until the operator flips the
 * entry. No synthetic transcripts, no scheduled-preview transcript pages.
 * The parent /youtube/[slug] page already serves the scheduled-preview
 * state at the episode URL; this sibling exists strictly to back the
 * VideoObject.transcript pointer.
 *
 * Sibling surfaces
 * ----------------
 *   - /youtube/[slug] – episode landing (VideoObject + breadcrumb)
 *   - /youtube/[slug]/transcript – this page (Article + breadcrumb)
 *   - /youtube/[slug]/transcript/md – Markdown twin for LLM ingestion
 *
 * The episode landing's VideoObject references this URL via the
 * `transcriptUrl` prop on VideoJsonLd – bidirectional graph linkage so
 * AI retrievers walking either entity reach the other.
 *
 * Static rendering pattern
 * ------------------------
 * generateStaticParams enumerates the full 30-slug backlog at build time
 * for consistency with the parent route. Drafts (and live entries with no
 * transcript yet) call notFound() in the body. Cache Components-compatible
 * – no dynamicParams or revalidate route-segment configs.
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

  // Honest gating: only emit metadata for transcript-eligible episodes.
  // Drafts (and live entries without a transcript) return an empty
  // metadata object so the route falls through to the not-found shell.
  if (
    ep.status !== "live" ||
    !ep.transcript ||
    ep.transcript.trim().length === 0
  ) {
    return {};
  }

  const canonical = episodeTranscriptPath(ep);
  const title = `Transcript · ${ep.id} – ${ep.title}`;
  const description = `Full transcript of episode ${ep.id} of ${FOUNDERS_DIARY_CHANNEL.name}: ${ep.title}.`;

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical,
      types: {
        "text/markdown": episodeTranscriptMdPath(ep),
      },
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonical,
      siteName: ORGANIZATION.name,
      ...(ep.publish_at
        ? { publishedTime: ep.publish_at, modifiedTime: ep.publish_at }
        : {}),
      authors: [FOUNDER.name],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function YouTubeTranscriptPage(props: {
  params: Promise<RouteParams>;
}) {
  const params = await props.params;
  const ep = findEpisodeBySlug(params.slug);
  if (!ep) notFound();

  // The transcript URL only exists once the cut is live AND the operator
  // has pasted the transcript body in the registry. Anything else is a
  // phantom URL – Brunson Hard-Rule from workbook 09. 404 cleanly.
  if (
    ep.status !== "live" ||
    !ep.transcript ||
    ep.transcript.trim().length === 0
  ) {
    notFound();
  }

  const canonicalUrl = episodeTranscriptUrl(ep);
  const episodeCanonical = episodeUrl(ep);
  const ctaUrl = episodeDiagnosticUrl(ep.utm_content);

  // Split the transcript on blank lines so each paragraph is its own <p>
  // with data-speakable. Voice readers, AI summarisers, and reader-mode
  // renderers all chunk on paragraph boundaries – explicit <p> tags beat
  // whitespace heuristics every time.
  const paragraphs = ep.transcript
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const trail = [
    { name: "Home", url: `${BASE_URL}/` },
    { name: FOUNDERS_DIARY_CHANNEL.name, url: `${BASE_URL}/youtube` },
    { name: ep.id, url: episodeCanonical },
    { name: "Transcript", url: canonicalUrl },
  ] as const;

  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <BreadcrumbJsonLd trail={trail} />
      <ArticleJsonLd
        headline={`Transcript – ${ep.title}`}
        description={`Full transcript of episode ${ep.id} of ${FOUNDERS_DIARY_CHANNEL.name}.`}
        url={canonicalUrl}
        datePublished={ep.publish_at ?? new Date().toISOString()}
        dateModified={ep.publish_at ?? new Date().toISOString()}
        articleSection="YouTube Transcript"
      />

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
            href="/youtube"
            className="underline underline-offset-4 hover:text-foreground"
          >
            {FOUNDERS_DIARY_CHANNEL.name}
          </Link>
          <span className="mx-2" aria-hidden>
            ›
          </span>
          <Link
            href={episodePath(ep)}
            className="underline underline-offset-4 hover:text-foreground"
          >
            {ep.id}
          </Link>
          <span className="mx-2" aria-hidden>
            ›
          </span>
          <span>Transcript</span>
        </nav>

        <header className="mb-8">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3 tabular-nums">
            Transcript · Episode {ep.id}
            {ep.publish_at ? (
              <>
                {" · "}
                <time dateTime={ep.publish_at}>
                  {new Date(ep.publish_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </>
            ) : null}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            {ep.title}
          </h1>
          <p
            className="text-base text-muted-foreground leading-relaxed italic"
            data-speakable="hook"
          >
            &ldquo;{ep.hook_3s}&rdquo;
          </p>
        </header>

        <div className="mb-8 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-border bg-muted/30 px-3 py-1">
            {phaseLabel(ep.phase)}
          </span>
          <span className="rounded-full border border-border bg-muted/30 px-3 py-1 capitalize">
            Brunson beat: {ep.brunson_beat}
          </span>
        </div>

        {ep.youtube_url ? (
          <section className="mb-8" aria-label="Watch the episode">
            <Link
              href={ep.youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:border-foreground/40 transition-colors"
            >
              Watch on YouTube →
            </Link>
          </section>
        ) : null}

        <Separator className="my-8" />

        <section
          className="mb-10 space-y-4 leading-relaxed prose prose-sm dark:prose-invert max-w-none"
          aria-label="Full transcript"
        >
          <h2 className="text-2xl font-bold not-prose">Full transcript</h2>
          {paragraphs.map((para, i) => (
            <p key={i} className="text-base leading-relaxed" data-speakable>
              {para}
            </p>
          ))}
        </section>

        {ep.key_takeaways && ep.key_takeaways.length > 0 ? (
          <>
            <Separator className="my-8" />
            <section
              aria-labelledby="takeaways-heading"
              className="mb-10"
            >
              <h2
                id="takeaways-heading"
                className="text-2xl font-bold mb-4"
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
          </>
        ) : null}

        <Separator className="my-8" />

        <section className="mb-10 space-y-3 leading-relaxed">
          <h2 className="text-2xl font-bold">Machine-readable mirror</h2>
          <p className="text-sm text-muted-foreground">
            Need the transcript as plain Markdown for an LLM pipeline or
            citation manager? The same body is available at the URL below
            with <code>Content-Type: text/markdown</code>.
          </p>
          <Link
            href={episodeTranscriptMdPath(ep)}
            className="block rounded-lg border border-border bg-card px-5 py-4 hover:border-foreground/40 transition-colors"
            rel="noopener"
          >
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
              Markdown mirror
            </div>
            <div className="text-sm font-medium break-all">
              {episodeTranscriptMdUrl(ep)}
            </div>
          </Link>
        </section>

        <Separator className="my-8" />

        <section aria-labelledby="cta-heading" className="mb-10">
          <h2 id="cta-heading" className="text-2xl font-bold mb-3">
            If your Stripe line looks like this episode&apos;s, start here.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            The 90-second free diagnostic reads your live product page and
            labels what is actually broken – Wrong Person, Weak Offer, or
            Weak Belief – and hands you the door that fixes it. No card. No
            bait-and-switch.
          </p>
          <Link
            href={ctaUrl}
            className="inline-flex items-center justify-center rounded-md bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90 transition-opacity"
          >
            Take the free diagnostic →
          </Link>
        </section>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm">
          <Link
            href={episodePath(ep)}
            className="text-muted-foreground hover:underline"
          >
            ← Back to {ep.id}
          </Link>
          <Link
            href="/youtube"
            className="text-muted-foreground hover:underline"
          >
            ← All episodes
          </Link>
        </div>

        <p className="mt-10 text-xs text-muted-foreground">
          Licensed CC-BY-4.0. Quote, embed, and remix with attribution to{" "}
          {ORGANIZATION.name}.
        </p>
      </article>
    </div>
  );
}
