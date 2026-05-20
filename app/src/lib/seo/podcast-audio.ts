/**
 * Podcast audio manifest reader and helpers.
 *
 * Why this module exists
 * ----------------------
 * VEO uplift landing 2026-05-21. The PodcastEpisode entries in
 * src/lib/seo/podcast.ts previously resolved audio enclosures only
 * through the env-gated NEXT_PUBLIC_PODCAST_EPISODE_<SLUG>_AUDIO_URL
 * pattern, which left the changelog feed as text-only by default.
 *
 * This module mirrors the glossary-audio contract (single source of
 * truth = a JSON manifest, populated only by an atomic-write script,
 * read-only at runtime). It lets a real audio file shipped in the
 * repo light up `<enclosure>` + AudioObject without per-episode env
 * configuration.
 *
 * Resolution order (consumed by podcast.ts)
 * -----------------------------------------
 *   1. Manifest entry (this module). Real file, real bytes, real
 *      duration, verifiable sha256 of the narrated transcript.
 *   2. Env var override. Operator can host a higher-quality recording
 *      at an external URL (Vercel Blob, S3, CDN) and override the
 *      bundled file by setting NEXT_PUBLIC_PODCAST_EPISODE_<SLUG>_AUDIO_URL.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - Empty `entries` map = honest zero-state. No enclosures emit.
 *   - Manifest entry for an unknown slug throws at module load
 *     (the validate() IIFE below).
 *   - Audio is disclosed as synthesized narration in the manifest's
 *     `voice.disclosure` field; the public surface inherits that
 *     disclosure verbatim, no marketing softening.
 *   - The generation script is the only writer. Drift between manifest
 *     row and on-disk file is impossible to ship because the script's
 *     atomic-rename contract writes the file first, then the manifest.
 *
 * Note on the JSON import
 * -----------------------
 * Next.js inlines JSON imports at build time, so the manifest is
 * bundled into the server build. Adding or removing entries requires a
 * redeploy, which is the correct cadence – audio generation is a
 * deliberate operator action, not a per-request runtime concern.
 */

import { PODCAST_EPISODE_SLUGS } from "@/lib/seo/podcast-slugs";
import manifestRaw from "./podcast-audio-manifest.json";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** One audio enclosure for a podcast episode slug. */
export interface PodcastAudioEntry {
  readonly slug: string;
  /** Filename inside /public/audio/podcast/, e.g. "dataset-v1-launch.mp3". */
  readonly filename: string;
  /** MIME type. Currently always "audio/mpeg" but the field is honest. */
  readonly contentType: string;
  /** Real duration in seconds, measured from the encoded file by the script. */
  readonly durationSeconds: number;
  /** Real byte size of the encoded file. */
  readonly byteSize: number;
  /** Word count of the narrated text. Used for sanity-check + AudioObject. */
  readonly wordCount: number;
  /** sha256 of the narrated text. Lets the script detect content drift. */
  readonly transcriptSha256: string;
  /** ISO 8601 timestamp of generation. */
  readonly generatedAt: string;
  /** Voice identifier the TTS provider used, e.g. "Daniel" (macOS say). */
  readonly voiceId: string;
}

/** Show-level disclosure carried into the public surface. */
export interface PodcastAudioVoice {
  readonly provider: string;
  readonly model: string;
  readonly voiceId: string;
  readonly languageCode: string;
  readonly generatedAt: string;
  readonly disclosure: string;
}

interface RawManifest {
  readonly version: 1;
  readonly voice: PodcastAudioVoice;
  readonly podcast: {
    readonly title: string;
    readonly description: string;
    readonly category: string;
    readonly subcategory: string;
    readonly explicit: boolean;
    readonly language: string;
    readonly type: "serial" | "episodic";
    readonly author: string;
    readonly ownerEmail: string;
    readonly copyright: string;
  };
  readonly entries: Readonly<Record<string, Omit<PodcastAudioEntry, "slug">>>;
}

const MANIFEST = manifestRaw as unknown as RawManifest;

// ---------------------------------------------------------------------------
// Validation – runs once at module load
// ---------------------------------------------------------------------------

(function validate(): void {
  const slugSet = new Set<string>(PODCAST_EPISODE_SLUGS);
  for (const [slug, entry] of Object.entries(MANIFEST.entries)) {
    if (!slugSet.has(slug)) {
      throw new Error(
        `podcast-audio-manifest.json: entry "${slug}" is not a real ` +
          `podcast episode slug. Add the episode to podcast.ts first, ` +
          `then re-run scripts/generate-podcast-audio.py.`,
      );
    }
    if (
      entry.contentType === "audio/mpeg" &&
      !entry.filename.endsWith(".mp3")
    ) {
      throw new Error(
        `podcast-audio-manifest.json: entry "${slug}" declares audio/mpeg ` +
          `but filename "${entry.filename}" does not end in .mp3.`,
      );
    }
    if (entry.durationSeconds <= 0 || entry.durationSeconds > 3600) {
      throw new Error(
        `podcast-audio-manifest.json: entry "${slug}" has implausible ` +
          `durationSeconds=${entry.durationSeconds}.`,
      );
    }
    if (entry.byteSize <= 0 || entry.byteSize > 200_000_000) {
      throw new Error(
        `podcast-audio-manifest.json: entry "${slug}" has implausible ` +
          `byteSize=${entry.byteSize}.`,
      );
    }
    if (!/^[a-f0-9]{64}$/.test(entry.transcriptSha256)) {
      throw new Error(
        `podcast-audio-manifest.json: entry "${slug}" has malformed ` +
          `transcriptSha256 (expected 64-char lowercase hex).`,
      );
    }
    const generated = new Date(entry.generatedAt);
    if (Number.isNaN(generated.getTime())) {
      throw new Error(
        `podcast-audio-manifest.json: entry "${slug}" has invalid ` +
          `generatedAt ISO timestamp.`,
      );
    }
  }
})();

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Show-level voice/disclosure block. Surface this verbatim on the show page. */
export const PODCAST_AUDIO_VOICE: PodcastAudioVoice = Object.freeze({
  ...MANIFEST.voice,
});

/** True iff at least one episode has audio shipped via the manifest. */
export function isPodcastAudioActive(): boolean {
  return Object.keys(MANIFEST.entries).length > 0;
}

/** Returns the audio entry for `slug`, or null if none has been generated. */
export function getPodcastAudio(slug: string): PodcastAudioEntry | null {
  const entry = MANIFEST.entries[slug];
  if (!entry) return null;
  return Object.freeze({ slug, ...entry });
}

/** Convention: per-slug audio is served from /audio/podcast/<slug>.mp3. */
export function podcastAudioPath(slug: string): string {
  const entry = MANIFEST.entries[slug];
  return `/audio/podcast/${entry?.filename ?? `${slug}.mp3`}`;
}

/** Absolute audio URL for use in enclosure tags + AudioObject contentUrl. */
export function podcastAudioAbsoluteUrl(slug: string, base: string): string {
  return `${base}${podcastAudioPath(slug)}`;
}

/** Number of episodes that have audio enclosures live. */
export function podcastAudioEpisodeCount(): number {
  return Object.keys(MANIFEST.entries).length;
}
