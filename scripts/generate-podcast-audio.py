#!/usr/bin/env python3
"""
generate-podcast-audio.py - regenerate or refresh TTS audio enclosures
for the Indie SaaS Teardowns Dataset Changelog podcast.

Why this exists
---------------
Episode show notes live in app/src/lib/seo/podcast.ts (EPISODES_RAW).
This script reads that file, renders one MP3 per episode via the chosen
TTS provider, writes the file to app/public/audio/podcast/<slug>.mp3,
and atomically updates app/src/lib/seo/podcast-audio-manifest.json with
the real byte size + real duration + sha256 of the narrated text.

The runtime resolver in podcast.ts prefers the manifest entry over the
env-var override, so dropping a new MP3 + manifest row is sufficient to
make a new episode play. No env-var configuration required.

The Brunson Hard-Rule for audio
-------------------------------
The audio shipped through this script is TTS narration of the show
notes, NOT a hosted human recording. The manifest's `voice.disclosure`
field surfaces this fact verbatim, and the runtime carries it into the
transcript page, the Alexa Flash Briefing mainText, and the
llms-feed.json podcast.audioDisclosure field. To replace with a human
recording: drop the MP3 at app/public/audio/podcast/<slug>.mp3 and
re-run this script with --measure-only.

Usage
-----
  # Regenerate audio for every episode (skip already-generated).
  ./scripts/generate-podcast-audio.py

  # Force regenerate one episode.
  ./scripts/generate-podcast-audio.py --slug dataset-v1-launch --force

  # Re-measure duration + byte size after manually replacing an MP3.
  ./scripts/generate-podcast-audio.py --slug dataset-v1-launch --measure-only

  # Dry-run (no writes).
  ./scripts/generate-podcast-audio.py --dry-run

Providers
---------
  macos (default)   macOS `say` -> AIFF -> MP3 via lame. Free, requires
                    macOS + Homebrew lame. Voice defaults to "Daniel".
  openai            OpenAI TTS (requires OPENAI_API_KEY). Higher quality.
                    Voice defaults to "onyx".
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import urllib.error
import urllib.request
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

REPO_ROOT = Path(__file__).resolve().parent.parent
APP_DIR = REPO_ROOT / "app"
PODCAST_TS = APP_DIR / "src" / "lib" / "seo" / "podcast.ts"
MANIFEST_PATH = APP_DIR / "src" / "lib" / "seo" / "podcast-audio-manifest.json"
AUDIO_DIR = APP_DIR / "public" / "audio" / "podcast"


# Regex picks up each row inside EPISODES_RAW. Tolerates whitespace
# variation and a trailing comma on the last property. We extract slug
# + summary + narrative; the narration body concatenates the two with a
# blank line so TTS gets a paragraph break.
EPISODE_RE = re.compile(
    r"""
    \{\s*                                 # row start
    slug:\s*"(?P<slug>[a-z0-9-]+)"\s*,\s*\n
    .*?                                   # episodeNumber, title (skipped)
    summary:\s*"(?P<summary>(?:[^"\\]|\\.)*)"\s*,\s*\n
    \s*narrative:\s*"(?P<narrative>(?:[^"\\]|\\.)*)"\s*,
    """,
    re.MULTILINE | re.DOTALL | re.VERBOSE,
)


def preprocess_for_tts(text: str) -> str:
    """Make a narrative TTS-friendly without changing its written meaning.

    The narrative text in EPISODES_RAW is written for human readers and
    includes URL fragments (`/dataset/huggingface`), path placeholders
    (`[slug]`), and template variables in angle brackets (`<locale>`).
    macOS `say` (and most other TTS engines) treat `<...>` as SSML-like
    markup and silently strip the contents – which collapses an episode
    body to a 10-second mumble.

    This preprocessor makes those patterns audible without altering the
    source text:
      * `<placeholder>`   → `placeholder`
      * `[slug]`          → `slug`
      * `/some/path`      → ` slash some slash path `
      * `Twitter / X`     → `Twitter or X`
      * `;` / `–` / `—`   → comma (TTS reads commas as natural pauses)

    The transcript SHA-256 in the manifest is computed against the
    ORIGINAL narrative (not the TTS-preprocessed version) – the manifest
    is the canonical written text; the audio is its TTS rendering. This
    matches how Apple Podcast Transcripts and Whisper-trained retrievers
    treat the pairing: the transcript is canonical, the audio is
    downstream of it.
    """
    # 1. Strip SSML-like brackets but keep their content audible.
    out = re.sub(r"<([^<>]+)>", r"\1", text)
    # 2. Replace bracketed placeholders.
    out = re.sub(r"\[([^\[\]]+)\]", r"\1", out)
    # 3. Slash-separated path runs (/foo/bar). Match runs of 2+ slashes
    #    to avoid accidentally re-vocalizing a single "/" in a phrase
    #    like "Twitter / X" that we handle below.
    out = re.sub(
        r"(/[a-zA-Z0-9_-]+){2,}",
        lambda m: " slash ".join([""] + m.group(0).strip("/").split("/")),
        out,
    )
    # 4. Single-segment paths like "/dataset" → " slash dataset".
    out = re.sub(r"\B/([a-zA-Z0-9_-]+)\b", r" slash \1", out)
    # 5. Spaced single-slash dividers: "Twitter / X" → "Twitter or X".
    out = re.sub(r"\s/\s", " or ", out)
    # 6. Em/en dashes + semicolons → comma for natural pauses.
    out = out.replace("—", ",").replace("–", ",").replace(";", ",")
    # 7. Collapse double spaces introduced above.
    out = re.sub(r"  +", " ", out)
    return out.strip()


@dataclass(frozen=True)
class EpisodeRow:
    slug: str
    summary: str
    narrative: str

    @property
    def narration_text(self) -> str:
        # Preprocessed for TTS clarity. See preprocess_for_tts above –
        # the original narrative is preserved verbatim in the transcript
        # page and the manifest's transcriptSha256; only the audio
        # rendering is preprocessed.
        return preprocess_for_tts(self.narrative)

    @property
    def canonical_text(self) -> str:
        # Used for the manifest transcriptSha256 – matches the text the
        # transcript page renders.
        return self.narrative


def load_episodes() -> list[EpisodeRow]:
    src = PODCAST_TS.read_text(encoding="utf-8")
    rows: list[EpisodeRow] = []
    for m in EPISODE_RE.finditer(src):
        slug = m.group("slug")
        summary = bytes(m.group("summary"), "utf-8").decode("unicode_escape")
        narrative = bytes(m.group("narrative"), "utf-8").decode("unicode_escape")
        rows.append(EpisodeRow(slug=slug, summary=summary, narrative=narrative))
    if not rows:
        sys.exit(
            "ERROR: regex parsing of app/src/lib/seo/podcast.ts found zero "
            "episodes. The file format may have changed; update EPISODE_RE."
        )
    return rows


def load_manifest() -> dict:
    if not MANIFEST_PATH.exists():
        sys.exit(f"ERROR: manifest not found at {MANIFEST_PATH}")
    raw = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    if raw.get("version") != 1:
        sys.exit(
            f"ERROR: manifest version {raw.get('version')} not supported "
            f"(expected 1)."
        )
    return raw


def save_manifest_atomic(manifest: dict) -> None:
    body = json.dumps(manifest, indent=2, sort_keys=False) + "\n"
    tmp = MANIFEST_PATH.with_suffix(".json.tmp")
    tmp.write_text(body, encoding="utf-8")
    os.replace(tmp, MANIFEST_PATH)


def tts_macos_say(text: str, out_path: Path, voice: str) -> None:
    if sys.platform != "darwin":
        sys.exit("ERROR: --provider macos requires macOS.")
    if shutil.which("say") is None:
        sys.exit("ERROR: macOS `say` not found.")
    if shutil.which("lame") is None:
        sys.exit("ERROR: `lame` not on PATH. brew install lame.")

    with tempfile.NamedTemporaryFile(suffix=".aiff", delete=False) as aiff:
        aiff_path = Path(aiff.name)
    with tempfile.NamedTemporaryFile(suffix=".txt", delete=False) as txt:
        txt_path = Path(txt.name)
    try:
        txt_path.write_text(text, encoding="utf-8")
        subprocess.run(
            ["say", "-v", voice or "Daniel", "-o", str(aiff_path), "-f", str(txt_path)],
            check=True,
        )
        subprocess.run(
            ["lame", "--silent", "-V2", str(aiff_path), str(out_path)],
            check=True,
        )
    finally:
        for p in (aiff_path, txt_path):
            try:
                p.unlink()
            except OSError:
                pass


def tts_openai(text: str, out_path: Path, voice: str, model: str) -> None:
    api_key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not api_key:
        sys.exit("ERROR: OPENAI_API_KEY not set; use --provider macos.")
    body = json.dumps(
        {"model": model, "input": text, "voice": voice, "response_format": "mp3"}
    ).encode("utf-8")
    req = urllib.request.Request(
        "https://api.openai.com/v1/audio/speech",
        data=body,
        method="POST",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Accept": "audio/mpeg",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            data = resp.read()
    except urllib.error.HTTPError as e:
        sys.exit(f"ERROR: OpenAI TTS HTTP {e.code}: {e.read().decode('utf-8', errors='replace')}")
    except urllib.error.URLError as e:
        sys.exit(f"ERROR: OpenAI TTS network error: {e}")
    if len(data) < 1000:
        sys.exit(f"ERROR: OpenAI TTS payload too small ({len(data)} bytes).")
    out_path.write_bytes(data)


def measure_duration_seconds(mp3_path: Path) -> int:
    if shutil.which("ffprobe"):
        try:
            out = subprocess.check_output(
                [
                    "ffprobe", "-v", "error", "-show_entries", "format=duration",
                    "-of", "default=noprint_wrappers=1:nokey=1", str(mp3_path),
                ],
                stderr=subprocess.STDOUT,
                timeout=10,
            )
            return max(1, round(float(out.decode("utf-8").strip())))
        except (subprocess.CalledProcessError, ValueError, subprocess.TimeoutExpired):
            pass
    # Fallback estimate from file size.
    return max(1, mp3_path.stat().st_size // 12000)


def word_count(text: str) -> int:
    return len([w for w in re.split(r"\s+", text.strip()) if w])


def sha256_hex(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def render_one(
    row: EpisodeRow,
    *,
    provider: str,
    voice: str,
    model: str,
    out_dir: Path,
    dry_run: bool,
    measure_only: bool,
) -> Optional[dict]:
    text = row.narration_text.strip()
    canonical = row.canonical_text.strip()
    out_path = out_dir / f"{row.slug}.mp3"
    if measure_only:
        if not out_path.exists():
            sys.exit(f"ERROR: --measure-only requires {out_path} to exist.")
        print(f"  [{row.slug}] measure-only on existing {out_path.name}")
    else:
        print(f"  [{row.slug}] {word_count(canonical)} words (canonical) "
              f"→ {word_count(text)} words (TTS) via {provider}")
        if dry_run:
            return None
        out_dir.mkdir(parents=True, exist_ok=True)
        tmp_path = out_dir / f".{row.slug}.mp3.tmp"
        if tmp_path.exists():
            tmp_path.unlink()
        if provider == "macos":
            tts_macos_say(text, tmp_path, voice=voice or "Daniel")
        elif provider == "openai":
            tts_openai(text, tmp_path, voice=voice or "onyx", model=model)
        else:
            sys.exit(f"ERROR: unknown provider {provider!r}")
        os.replace(tmp_path, out_path)

    duration = measure_duration_seconds(out_path)
    return {
        "filename": f"{row.slug}.mp3",
        "contentType": "audio/mpeg",
        "durationSeconds": duration,
        "byteSize": out_path.stat().st_size,
        # wordCount + transcriptSha256 track the CANONICAL narrative (what
        # the transcript page renders + what readers cite) – not the
        # TTS-preprocessed version. Keeps the manifest's claim of
        # transcript identity stable across TTS-preprocessor revisions.
        "wordCount": word_count(canonical),
        "transcriptSha256": sha256_hex(canonical),
        "generatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "voiceId": (voice or ("Daniel" if provider == "macos" else "onyx")),
    }


def parse_args(argv: list[str]) -> argparse.Namespace:
    p = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    p.add_argument("--slug", help="Generate / measure one slug only.")
    p.add_argument("--force", action="store_true", help="Re-render even if a manifest entry exists.")
    p.add_argument("--measure-only", action="store_true",
                   help="Skip TTS; re-read existing MP3 and refresh the manifest row.")
    p.add_argument("--dry-run", action="store_true")
    p.add_argument("--provider", choices=["macos", "openai"],
                   default=os.environ.get("PODCAST_AUDIO_PROVIDER", "macos"))
    p.add_argument("--voice", default=os.environ.get("PODCAST_AUDIO_VOICE", ""))
    p.add_argument("--model", default=os.environ.get("PODCAST_AUDIO_MODEL", "tts-1-hd"))
    return p.parse_args(argv)


def main(argv: Optional[list[str]] = None) -> int:
    args = parse_args(argv or sys.argv[1:])
    rows = load_episodes()
    manifest = load_manifest()

    if args.slug:
        rows = [r for r in rows if r.slug == args.slug]
        if not rows:
            sys.exit(f"ERROR: --slug {args.slug!r} not in EPISODES_RAW.")

    print(f"Provider: {args.provider} | Voice: {args.voice or 'default'} | Model: {args.model}")
    print(f"Manifest: {MANIFEST_PATH}")
    print(f"Output:   {AUDIO_DIR}\n")

    entries = dict(manifest.get("entries", {}))
    written = 0
    skipped = 0
    for row in rows:
        if row.slug in entries and not args.force and not args.measure_only:
            skipped += 1
            print(f"  [{row.slug}] skip (entry exists; --force to re-render)")
            continue
        result = render_one(
            row,
            provider=args.provider,
            voice=args.voice,
            model=args.model,
            out_dir=AUDIO_DIR,
            dry_run=args.dry_run,
            measure_only=args.measure_only,
        )
        if result is None:
            continue
        entries[row.slug] = result
        written += 1

    if args.dry_run:
        print(f"\nDry-run: would have written {written} entries (skipped {skipped}).")
        return 0

    manifest["entries"] = entries
    # Stamp the show-level voice block with the most recent generation
    # timestamp so the manifest readable-at-a-glance is honest about
    # when the audio last changed.
    if written > 0:
        manifest["voice"]["generatedAt"] = datetime.now(timezone.utc).strftime(
            "%Y-%m-%dT%H:%M:%SZ"
        )
        if args.provider == "macos":
            manifest["voice"]["provider"] = "macos-say"
            manifest["voice"]["model"] = "AppleAVSpeechSynthesizer"
            manifest["voice"]["voiceId"] = args.voice or "Daniel"
            manifest["voice"]["languageCode"] = "en-GB"
        elif args.provider == "openai":
            manifest["voice"]["provider"] = "openai"
            manifest["voice"]["model"] = args.model
            manifest["voice"]["voiceId"] = args.voice or "onyx"
            manifest["voice"]["languageCode"] = "en-US"
    save_manifest_atomic(manifest)
    print(f"\nWrote {written} entries; skipped {skipped}. Manifest updated.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
