/**
 * Glossary audio manifest reader and helpers.
 *
 * Why this module exists
 * ----------------------
 * Surface B (GEO/AEO/VEO) extension: a TTS-rendered audio version of every
 * /glossary/[slug] short definition, distributed as:
 *   1. inline `<audio>` element on the detail page (voice-first readers);
 *   2. schema.org `AudioObject` JSON-LD anchored to the page's Article @id
 *      (Google AI Overviews + Apple/Google/Spotify podcast ingestion);
 *   3. RSS 2.0 podcast feed with iTunes namespace at /glossary/podcast.xml
 *      (Apple Podcasts, Spotify, Pocket Casts, Google Podcasts).
 *
 * Voice assistants prefer audio-native sources, and AI retrieval systems
 * for multimodal models ingest podcast audio + transcripts as a single
 * citation unit. A glossary that also exists as audio compounds Surface B
 * coverage without changing the source-of-truth content.
 *
 * Single source of truth
 * ----------------------
 * `glossary-audio-manifest.json`. Populated exclusively by
 * `scripts/generate-glossary-audio.py`, which:
 *   - reads slug + term + short definition from `app/src/lib/glossary.ts`,
 *   - calls a TTS provider (OpenAI / Hugging Face / macOS `say`),
 *   - writes MP3 to `app/public/audio/glossary/[slug].mp3`,
 *   - atomically updates the manifest with byte size, duration, sha256.
 *
 * The script is the only writer. The runtime is read-only. An entry exists
 * in the manifest iff the audio file exists on disk – the script's atomic
 * write-both-or-neither contract is the integrity gate.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - Empty `entries` map = honest zero-state. Nothing emits.
 *   - A manifest entry that references a non-existent glossary slug throws
 *     at module load (the validate() IIFE below).
 *   - Manifest entries declare durationSeconds + byteSize + transcript hash
 *     so AudioObject claims are verifiable against the audio file the
 *     enclosure URL serves.
 *   - The script never appends a row it cannot prove the file for.
 *
 * Note on the JSON import
 * -----------------------
 * Next.js inlines JSON imports at build time, so the manifest is bundled
 * into the server build. Adding or removing entries requires a redeploy,
 * which is the right cadence – audio generation is a deliberate operator
 * action, not a per-request runtime concern.
 */

import { GLOSSARY_SLUGS } from "@/lib/glossary";
import manifestRaw from "./glossary-audio-manifest.json";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** One audio episode for a glossary slug. */
export interface GlossaryAudioEntry {
  readonly slug: string;
  /** Filename inside /public/audio/glossary/, e.g. "hook.mp3". */
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
  /** Voice identifier the TTS provider used, e.g. "onyx" (OpenAI). */
  readonly voiceId: string;
}

/** Podcast-channel configuration shared across every episode. */
export interface GlossaryAudioPodcastConfig {
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
}

interface RawManifest {
  readonly version: 1;
  readonly voice: {
    readonly provider: string;
    readonly model: string;
    readonly voiceId: string;
    readonly languageCode: string;
    readonly generatedAt: string;
  };
  readonly podcast: GlossaryAudioPodcastConfig;
  readonly entries: Readonly<Record<string, Omit<GlossaryAudioEntry, "slug">>>;
}

const MANIFEST = manifestRaw as unknown as RawManifest;

// ---------------------------------------------------------------------------
// Validation – runs once at module load
// ---------------------------------------------------------------------------

(function validate(): void {
  const slugSet = new Set<string>(GLOSSARY_SLUGS);
  for (const [slug, entry] of Object.entries(MANIFEST.entries)) {
    if (!slugSet.has(slug)) {
      throw new Error(
        `glossary-audio-manifest.json: entry "${slug}" is not a real ` +
          `glossary slug. Add the term to glossary.ts first, then ` +
          `re-run scripts/generate-glossary-audio.py.`,
      );
    }
    if (
      entry.contentType === "audio/mpeg" &&
      !entry.filename.endsWith(".mp3")
    ) {
      throw new Error(
        `glossary-audio-manifest.json: entry "${slug}" declares audio/mpeg ` +
          `but filename "${entry.filename}" does not end in .mp3.`,
      );
    }
    if (entry.durationSeconds <= 0 || entry.durationSeconds > 3600) {
      throw new Error(
        `glossary-audio-manifest.json: entry "${slug}" has implausible ` +
          `durationSeconds=${entry.durationSeconds}.`,
      );
    }
    if (entry.byteSize <= 0 || entry.byteSize > 50_000_000) {
      throw new Error(
        `glossary-audio-manifest.json: entry "${slug}" has implausible ` +
          `byteSize=${entry.byteSize}.`,
      );
    }
    if (!/^[a-f0-9]{64}$/.test(entry.transcriptSha256)) {
      throw new Error(
        `glossary-audio-manifest.json: entry "${slug}" has malformed ` +
          `transcriptSha256 (expected 64-char lowercase hex).`,
      );
    }
    const generated = new Date(entry.generatedAt);
    if (Number.isNaN(generated.getTime())) {
      throw new Error(
        `glossary-audio-manifest.json: entry "${slug}" has invalid ` +
          `generatedAt ISO timestamp.`,
      );
    }
  }
})();

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Frozen empty array – stable identity for honest zero-state callers. */
const EMPTY_AUDIO: readonly GlossaryAudioEntry[] = Object.freeze([]);

/** Frozen podcast channel config – never per-render allocated. */
export const GLOSSARY_AUDIO_PODCAST_CONFIG: GlossaryAudioPodcastConfig =
  Object.freeze({ ...MANIFEST.podcast });

/** True iff at least one episode has been generated and published. */
export function isGlossaryAudioActive(): boolean {
  return Object.keys(MANIFEST.entries).length > 0;
}

/** Returns the audio entry for `slug`, or null if none has been published. */
export function getGlossaryAudio(slug: string): GlossaryAudioEntry | null {
  const entry = MANIFEST.entries[slug];
  if (!entry) return null;
  return Object.freeze({ slug, ...entry });
}

/**
 * Returns every published audio entry, newest first (reverse-chronological
 * by `generatedAt`). Stable identity for the empty case so React reference
 * equality holds on re-renders.
 */
export function getAllGlossaryAudio(): readonly GlossaryAudioEntry[] {
  const slugs = Object.keys(MANIFEST.entries);
  if (slugs.length === 0) return EMPTY_AUDIO;
  const entries = slugs.map(
    (slug): GlossaryAudioEntry => ({ slug, ...MANIFEST.entries[slug] }),
  );
  entries.sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));
  return Object.freeze(entries);
}

/** Convention: per-slug audio is served from /audio/glossary/<slug>.mp3. */
export function glossaryAudioPath(slug: string): string {
  const entry = MANIFEST.entries[slug];
  // Fall back to the slug-based convention even when no entry exists, so
  // callers that build URLs unconditionally don't crash; emission guards
  // (isGlossaryAudioActive / getGlossaryAudio) still gate visible output.
  return `/audio/glossary/${entry?.filename ?? `${slug}.mp3`}`;
}

/** Absolute audio URL for use in enclosure tags + AudioObject contentUrl. */
export function glossaryAudioAbsoluteUrl(slug: string, base: string): string {
  return `${base}${glossaryAudioPath(slug)}`;
}

/** Total cumulative duration of all published episodes (seconds). */
export function totalGlossaryAudioSeconds(): number {
  let total = 0;
  for (const entry of Object.values(MANIFEST.entries)) {
    total += entry.durationSeconds;
  }
  return total;
}

/** Number of published episodes – cheap for podcast feed sanity checks. */
export function glossaryAudioEpisodeCount(): number {
  return Object.keys(MANIFEST.entries).length;
}
