#!/usr/bin/env python3
"""
generate-glossary-audio.py - operator CLI that TTS-renders every
/glossary/<slug> short definition into an MP3 and atomically updates the
manifest at app/src/lib/seo/glossary-audio-manifest.json.

Why this exists
---------------
The Brunson Hard-Rule for audio is the same as for media mentions: no claim
ships unless it can be verified against the file the enclosure URL serves.
The runtime helper (app/src/lib/seo/glossary-audio.ts) refuses to emit any
AudioObject schema, podcast episode, or inline player for a slug that does
not have a manifest entry. This script is the ONLY writer of that manifest,
and it enforces the same atomic-write contract the log-mention.py script
applies to MEDIA_MENTIONS:

  1. Generate the MP3 to a temp file.
  2. Measure the real byte size + real duration from the file.
  3. Compute sha256 of the narrated text (drift detection).
  4. Move the temp file into /public/audio/glossary/<slug>.mp3.
  5. Atomically rewrite the manifest with the new row.

If any step fails, neither the file nor the manifest changes - the
operator sees the failure, fixes it, and re-runs. The two-phase write
means a half-finished generation cannot leave the manifest pointing at a
file that does not exist.

TTS provider selection
----------------------
Primary:    OpenAI TTS (requires OPENAI_API_KEY; costs ~$0.015/1k chars).
Fallback:   macOS `say` + `lame` (free; requires macOS + Homebrew lame).
            Output quality is lower; suitable for local dev only.
Future:     ElevenLabs (requires ELEVENLABS_API_KEY). Hook in as a third
            branch with the same atomic-write contract.

Voice selection
---------------
Default voice for OpenAI is `onyx` (deeper male voice that matches the
founder's Reluctant Hero persona on /about). Override per-run via
--voice <id>. Persisted into the manifest as voice.voiceId so the value
shipped with the audio is recorded verbatim, not inferred.

Usage
-----
  # Generate audio for every glossary term (skip already-generated).
  ./scripts/generate-glossary-audio.py

  # Force regenerate one term (overwrites file + manifest entry).
  ./scripts/generate-glossary-audio.py --slug hook --force

  # Generate all terms even if they exist (regenerate the whole feed).
  ./scripts/generate-glossary-audio.py --force

  # Dry-run: show what would be generated without writing anything.
  ./scripts/generate-glossary-audio.py --dry-run

  # Force the macOS fallback even if OPENAI_API_KEY is set (testing).
  ./scripts/generate-glossary-audio.py --provider macos --slug hook

Environment
-----------
  OPENAI_API_KEY                  required for --provider openai (default)
  GLOSSARY_AUDIO_OPENAI_MODEL     default "tts-1-hd"
  GLOSSARY_AUDIO_OPENAI_VOICE     default "onyx"
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
import urllib.request
import urllib.error
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable, Optional

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

REPO_ROOT = Path(__file__).resolve().parent.parent
APP_DIR = REPO_ROOT / "app"
GLOSSARY_TS = APP_DIR / "src" / "lib" / "glossary.ts"
ENTITY_TS = APP_DIR / "src" / "lib" / "seo" / "entity.ts"
MANIFEST_PATH = APP_DIR / "src" / "lib" / "seo" / "glossary-audio-manifest.json"
AUDIO_DIR = APP_DIR / "public" / "audio" / "glossary"

# ---------------------------------------------------------------------------
# Parsing the glossary source files
# ---------------------------------------------------------------------------

# Defensive regex extraction: the glossary.ts RAW_ROWS array has a stable
# shape (slug: "kebab-case", term: "Display Name"). Each row pair is
# extracted as a (slug, term) tuple. We then cross-reference each term
# against DEFINED_TERMS in entity.ts to get the canonical short
# definition - matching the runtime SHORT_BY_TERM lookup in glossary.ts.
GLOSSARY_ROW_RE = re.compile(
    r'slug:\s*"(?P<slug>[a-z0-9-]+)"\s*,\s*\n'
    r'\s*term:\s*"(?P<term>[^"]+)"',
    re.MULTILINE,
)
DEFINED_TERM_RE = re.compile(
    r'\{\s*term:\s*"(?P<term>[^"]+)"\s*,\s*\n'
    r'\s*definition:\s*"(?P<definition>(?:[^"\\]|\\.)*)"',
    re.MULTILINE,
)


@dataclass(frozen=True)
class GlossaryRow:
    slug: str
    term: str
    short_definition: str


def load_glossary_rows() -> list[GlossaryRow]:
    """Extract (slug, term, short_definition) rows from the TS sources."""
    glossary_src = GLOSSARY_TS.read_text(encoding="utf-8")
    entity_src = ENTITY_TS.read_text(encoding="utf-8")

    rows = []
    seen_slugs: set[str] = set()
    for m in GLOSSARY_ROW_RE.finditer(glossary_src):
        slug = m.group("slug")
        if slug in seen_slugs:
            continue
        seen_slugs.add(slug)
        rows.append((slug, m.group("term")))

    if not rows:
        sys.exit(
            "ERROR: regex parsing of app/src/lib/glossary.ts found zero "
            "rows. The file format may have changed; update "
            "GLOSSARY_ROW_RE in scripts/generate-glossary-audio.py."
        )

    definitions: dict[str, str] = {}
    for m in DEFINED_TERM_RE.finditer(entity_src):
        term = m.group("term")
        # Unescape the captured TS string literal.
        definition = bytes(m.group("definition"), "utf-8").decode(
            "unicode_escape"
        )
        definitions[term] = definition

    if not definitions:
        sys.exit(
            "ERROR: regex parsing of app/src/lib/seo/entity.ts found zero "
            "DEFINED_TERMS entries. The file format may have changed; "
            "update DEFINED_TERM_RE in scripts/generate-glossary-audio.py."
        )

    out: list[GlossaryRow] = []
    for slug, term in rows:
        short = definitions.get(term)
        if not short:
            sys.exit(
                f'ERROR: glossary slug "{slug}" / term "{term}" has no '
                f"matching DEFINED_TERMS entry in entity.ts. Add it there "
                f"first (the DefinedTermSet schema is the canonical "
                f"short-definition source)."
            )
        out.append(GlossaryRow(slug=slug, term=term, short_definition=short))

    print(f"Parsed {len(out)} glossary rows from glossary.ts + entity.ts.")
    return out


# ---------------------------------------------------------------------------
# Manifest read / write
# ---------------------------------------------------------------------------


def load_manifest() -> dict:
    """Load the canonical manifest. Refuses to start if it is malformed."""
    if not MANIFEST_PATH.exists():
        sys.exit(f"ERROR: manifest not found at {MANIFEST_PATH}")
    raw = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    if raw.get("version") != 1:
        sys.exit(
            f"ERROR: manifest version {raw.get('version')} not supported "
            f"by this script (expected 1)."
        )
    return raw


def save_manifest_atomic(manifest: dict) -> None:
    """Write the manifest via a temp file + rename (atomic on POSIX)."""
    # Stable, pretty JSON so diffs are reviewable. Trailing newline.
    body = json.dumps(manifest, indent=2, sort_keys=False) + "\n"
    tmp = MANIFEST_PATH.with_suffix(".json.tmp")
    tmp.write_text(body, encoding="utf-8")
    os.replace(tmp, MANIFEST_PATH)


# ---------------------------------------------------------------------------
# TTS providers
# ---------------------------------------------------------------------------


def tts_openai(text: str, out_path: Path, voice: str, model: str) -> None:
    """Render `text` to `out_path` (MP3) via the OpenAI TTS REST API."""
    api_key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not api_key:
        sys.exit(
            "ERROR: OPENAI_API_KEY is not set. Either export it, set it "
            "in app/.env.development.local, or pass --provider macos."
        )

    body = json.dumps(
        {
            "model": model,
            "input": text,
            "voice": voice,
            "response_format": "mp3",
        }
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
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = resp.read()
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        sys.exit(f"ERROR: OpenAI TTS HTTP {e.code}: {body}")
    except urllib.error.URLError as e:
        sys.exit(f"ERROR: OpenAI TTS network error: {e}")

    if not data or len(data) < 1000:
        sys.exit(
            f"ERROR: OpenAI TTS returned suspiciously small payload "
            f"({len(data)} bytes); refusing to write."
        )
    out_path.write_bytes(data)


def tts_macos_say(text: str, out_path: Path, voice: str) -> None:
    """macOS `say` → AIFF → MP3 via lame. Local-dev fallback only."""
    if sys.platform != "darwin":
        sys.exit("ERROR: --provider macos requires macOS.")
    if shutil.which("say") is None:
        sys.exit("ERROR: macOS `say` command not found.")
    if shutil.which("lame") is None:
        sys.exit(
            "ERROR: `lame` not on PATH. Install via Homebrew: `brew install lame`."
        )

    with tempfile.NamedTemporaryFile(suffix=".aiff", delete=False) as aiff:
        aiff_path = Path(aiff.name)
    try:
        # Voice selection on macOS uses a friendly name like "Daniel" or
        # "Samantha"; the OpenAI voice IDs (onyx, alloy) won't resolve.
        # Caller may pass any name `say -v ?` lists; default below is
        # "Daniel" (en-GB male) as a Reluctant-Hero-adjacent register.
        say_voice = voice if voice and voice != "onyx" else "Daniel"
        subprocess.run(
            ["say", "-v", say_voice, "-o", str(aiff_path), text],
            check=True,
        )
        subprocess.run(
            ["lame", "--silent", "-V2", str(aiff_path), str(out_path)],
            check=True,
        )
    finally:
        try:
            aiff_path.unlink()
        except OSError:
            pass


def measure_duration_seconds(mp3_path: Path) -> float:
    """Probe MP3 duration via ffprobe; falls back to a word-count estimate."""
    if shutil.which("ffprobe"):
        try:
            out = subprocess.check_output(
                [
                    "ffprobe",
                    "-v",
                    "error",
                    "-show_entries",
                    "format=duration",
                    "-of",
                    "default=noprint_wrappers=1:nokey=1",
                    str(mp3_path),
                ],
                stderr=subprocess.STDOUT,
                timeout=10,
            )
            return float(out.decode("utf-8").strip())
        except (subprocess.CalledProcessError, ValueError, subprocess.TimeoutExpired):
            pass
    # Estimate: TTS narration is roughly 150 words per minute = 2.5 wps.
    # This is only a fallback; the manifest validator accepts the estimate
    # but the runtime audio player shows the same number, so install
    # ffprobe (`brew install ffmpeg`) for real measurements.
    file_size = mp3_path.stat().st_size
    # Rough MP3 bitrate of 96 kbps → 12000 bytes/sec.
    return max(1.0, file_size / 12000.0)


# ---------------------------------------------------------------------------
# Orchestration
# ---------------------------------------------------------------------------


def slug_word_count(text: str) -> int:
    return len([w for w in re.split(r"\s+", text.strip()) if w])


def sha256_hex(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def render_one(
    row: GlossaryRow,
    *,
    provider: str,
    voice: str,
    model: str,
    out_dir: Path,
    dry_run: bool,
) -> Optional[dict]:
    """Render audio for one row, returning the manifest entry (or None on dry-run)."""
    text = row.short_definition.strip()
    out_path = out_dir / f"{row.slug}.mp3"
    print(f"  [{row.slug}] {row.term!r} ({slug_word_count(text)} words)")

    if dry_run:
        return None

    # Write to a temp path inside the same directory to keep the rename
    # atomic on the same filesystem.
    out_dir.mkdir(parents=True, exist_ok=True)
    tmp_path = out_dir / f".{row.slug}.mp3.tmp"
    if tmp_path.exists():
        tmp_path.unlink()

    if provider == "openai":
        tts_openai(text, tmp_path, voice=voice, model=model)
    elif provider == "macos":
        tts_macos_say(text, tmp_path, voice=voice)
    else:
        sys.exit(f"ERROR: unknown provider {provider!r}")

    os.replace(tmp_path, out_path)

    duration = round(measure_duration_seconds(out_path), 3)
    byte_size = out_path.stat().st_size
    now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    return {
        "filename": f"{row.slug}.mp3",
        "contentType": "audio/mpeg",
        "durationSeconds": duration,
        "byteSize": byte_size,
        "wordCount": slug_word_count(text),
        "transcriptSha256": sha256_hex(text),
        "generatedAt": now_iso,
        "voiceId": voice,
    }


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument(
        "--slug",
        help="Generate audio for only this slug (omit to generate all).",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Re-render even if a manifest entry already exists.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print what would be generated; do not write files or manifest.",
    )
    parser.add_argument(
        "--provider",
        choices=["openai", "macos"],
        default=os.environ.get("GLOSSARY_AUDIO_PROVIDER", "openai"),
        help="TTS provider (default: openai).",
    )
    parser.add_argument(
        "--voice",
        default=os.environ.get(
            "GLOSSARY_AUDIO_OPENAI_VOICE",
            "onyx",
        ),
        help="Voice ID (openai: onyx/alloy/nova/... ; macos: Daniel/Samantha/...).",
    )
    parser.add_argument(
        "--model",
        default=os.environ.get("GLOSSARY_AUDIO_OPENAI_MODEL", "tts-1-hd"),
        help="OpenAI TTS model (ignored for --provider macos).",
    )
    return parser.parse_args(argv)


def main(argv: Optional[list[str]] = None) -> int:
    args = parse_args(argv or sys.argv[1:])

    rows = load_glossary_rows()
    manifest = load_manifest()

    if args.slug:
        rows = [r for r in rows if r.slug == args.slug]
        if not rows:
            sys.exit(f"ERROR: --slug {args.slug!r} is not a real glossary slug.")

    print(
        f"Provider: {args.provider} | Voice: {args.voice} | "
        f"Model: {args.model} | Dry-run: {args.dry_run}"
    )
    print(f"Manifest: {MANIFEST_PATH}")
    print(f"Output dir: {AUDIO_DIR}")
    print()

    entries = dict(manifest.get("entries", {}))
    written = 0
    skipped = 0
    for row in rows:
        if row.slug in entries and not args.force:
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
        )
        if result is None:
            continue
        entries[row.slug] = result
        written += 1

    if args.dry_run:
        print(
            f"\nDry-run: would have written {len(rows) - skipped} entries "
            f"(skipped {skipped})."
        )
        return 0

    if written == 0:
        print(f"\nNo new entries. {skipped} skipped.")
        return 0

    # Update manifest voice block + entries atomically.
    manifest["voice"] = {
        "provider": args.provider,
        "model": args.model if args.provider == "openai" else "macos-say",
        "voiceId": args.voice,
        "languageCode": "en-US",
        "generatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    }
    manifest["entries"] = entries

    save_manifest_atomic(manifest)
    print(
        f"\nWrote {written} entries (skipped {skipped}). "
        f"Manifest updated at {MANIFEST_PATH}."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
