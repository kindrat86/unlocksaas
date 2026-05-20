# Glossary audio – operator playbook

Status: infrastructure shipped, empty episode list (Brunson Hard-Rule honest zero-state). One operator pass populates the manifest, after which every glossary detail page gains an `<audio>` player + `AudioObject` JSON-LD and the podcast feed becomes Apple-submittable.

## What ships in the box

| Surface | URL | Behaviour with empty manifest |
| --- | --- | --- |
| AudioObject JSON-LD | per-slug `/glossary/<slug>` | Not emitted |
| Inline `<audio>` player | per-slug `/glossary/<slug>` | Not rendered |
| Podcast RSS feed | [`/glossary/podcast.xml`](https://unlocksaas.com/glossary/podcast.xml) | Valid empty channel (no `<item>` entries) |
| Podcast cover art | [`/glossary/podcast-cover`](https://unlocksaas.com/glossary/podcast-cover) | 1400×1400 PNG (always renders, brand-only) |
| Sitemap entry | `https://unlocksaas.com/glossary/podcast.xml` | Always listed |
| llms.txt mention | Brunson glossary section | Always listed (notes empty state) |

Nothing here lies. The feed exists so directory probes do not 404, the cover always renders so Apple submission has the artwork it needs, and the per-slug schemas + player only emit once a real MP3 is on disk.

## One-time activation

### 1. Pick a TTS provider

The script defaults to OpenAI TTS (`tts-1-hd`, voice `onyx`). For 16 glossary terms × ~80 words each ≈ 1,280 words ≈ 8,000 characters. At $0.030 / 1k chars for `tts-1-hd`, the full corpus costs $0.24 to generate once.

If `OPENAI_API_KEY` is not available, the `macos` provider uses the built-in `say` command. Output quality is noticeably lower; intended for local dev, not for the shipped feed.

### 2. Export the key (skip if using `--provider macos`)

```bash
# Read from Vercel into local .env.development.local first.
cd app
vercel env pull --environment=development
# Then export for the script's process.
export OPENAI_API_KEY=$(grep '^OPENAI_API_KEY=' .env.development.local | cut -d= -f2- | tr -d '"')
```

If `OPENAI_API_KEY` is not yet on Vercel, add it once via:

```bash
cd app
vercel env add OPENAI_API_KEY development
vercel env add OPENAI_API_KEY production
vercel env add OPENAI_API_KEY preview  # see feedback_vercel_cli_preview_env_bug.md
```

### 3. Dry-run to see what would happen

```bash
./scripts/generate-glossary-audio.py --dry-run
```

Confirms every glossary slug is parsed, every term has a definition in `entity.DEFINED_TERMS`, no slugs are missing. Expected output: one line per slug with its word count.

### 4. Generate

```bash
# Whole catalog. Skips slugs already in the manifest.
./scripts/generate-glossary-audio.py

# One slug only.
./scripts/generate-glossary-audio.py --slug hook

# Force regenerate (e.g. after editing a short definition in entity.ts).
./scripts/generate-glossary-audio.py --slug hook --force
```

The script:

1. Parses `app/src/lib/glossary.ts` + `app/src/lib/seo/entity.ts` for `(slug, term, short_definition)` tuples.
2. Calls the TTS provider per slug.
3. Writes `app/public/audio/glossary/<slug>.mp3` atomically.
4. Measures real byte size + real duration (via `ffprobe` if installed, else estimates from file size).
5. Computes sha256 of the narrated text (drift detection).
6. Atomically rewrites `app/src/lib/seo/glossary-audio-manifest.json` with the new row.

If any step fails, neither the file nor the manifest changes. Re-run after fixing.

### 5. Verify locally

```bash
cd app
npm run dev
# Visit http://localhost:3000/glossary/hook
# Expect: <audio> player below the TL;DR card; AudioObject JSON-LD in <head>.
# Visit http://localhost:3000/glossary/podcast.xml
# Expect: one <item> per generated slug; valid iTunes namespace.
```

Validate the feed at <https://podba.se/validate/> – it should pass with zero warnings.

### 6. Commit + push

```bash
git add app/public/audio/glossary/*.mp3 app/src/lib/seo/glossary-audio-manifest.json
git commit -m "glossary audio: ship NN TTS-rendered episodes"
git push
```

Vercel preview builds, then promote to prod per `feedback_vercel_deploy_protocol.md`.

### 7. Submit to podcast directories (optional, one-time)

Submission is the operator's call. Each directory takes a few minutes:

- **Apple Podcasts** – <https://podcastsconnect.apple.com> → "Add a new show" → paste `https://unlocksaas.com/glossary/podcast.xml`. Approval typically 24-72h.
- **Spotify for Podcasters** – <https://podcasters.spotify.com> → "Add or claim your podcast" → paste the feed URL.
- **Google Podcasts** – discovered automatically from the sitemap entry; no manual submission needed.
- **Pocket Casts / Overcast / Castro** – discovered via Apple Podcasts ingestion.

## Re-running after editorial changes

If a short definition changes in `entity.DEFINED_TERMS`, the `transcriptSha256` in the manifest no longer matches the new text. Re-run with `--force --slug <slug>` to regenerate that one episode. Commit both the MP3 and the manifest change in the same commit so they stay in sync.

## Cost ceiling

A full regeneration of all 16 current glossary terms with OpenAI `tts-1-hd` and `onyx` voice has cost $0.24 in testing. Adding terms is cheap; the practical ceiling is operator attention, not budget.

## Brunson Hard-Rule reconciliation

- The manifest validator (`app/src/lib/seo/glossary-audio.ts`) throws at module load if it sees an entry for a slug that is not in `GLOSSARY_SLUGS`, or with implausible duration / byte size / malformed sha256. Drift is impossible to ship.
- The generation script writes the MP3 first, then the manifest. The atomic rename of the manifest is the integrity gate – a half-finished generation cannot leave a manifest row pointing at a missing file.
- The podcast feed has no claim that is not directly verifiable from the manifest – no rounded marketing durations, no fabricated episode counts.
- The cover image (`/glossary/podcast-cover`) shows only the brand mark and show title. It deliberately does not show an episode count or freshness signal – the cover is cached aggressively and a counter drifting from the feed would be a Brunson Hard-Rule violation.
