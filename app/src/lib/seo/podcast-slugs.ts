/**
 * Canonical podcast episode slug list.
 *
 * Extracted to its own module to break the circular dependency between
 * podcast.ts (which composes the audio overlay) and podcast-audio.ts
 * (whose validator checks that every manifest entry references a real
 * published episode).
 *
 * Append-only: never rename a published slug. The slug is part of the
 * stable GUID at `${BASE_URL}/podcast/<slug>#episode` and is also the
 * filename stem for the audio enclosure at /audio/podcast/<slug>.mp3.
 * Renaming a slug bumps the GUID and creates a phantom episode in every
 * subscriber's player.
 *
 * Editorial gate: every entry below must correspond to a verifiable
 * shipped event documented in ACTIVATION_LOG (src/lib/seo/freshness.ts)
 * or a strategy doc. The full episode record (title, summary, narrative,
 * publishedAt, artifactUrl) lives in EPISODES_RAW inside podcast.ts.
 */

export const PODCAST_EPISODE_SLUGS = [
  "per-locale-og-cards-glossary-benchmarks",
  "hugging-face-cross-listing-flow",
  "dataset-v1-launch",
] as const;

export type PodcastEpisodeSlug = (typeof PODCAST_EPISODE_SLUGS)[number];
