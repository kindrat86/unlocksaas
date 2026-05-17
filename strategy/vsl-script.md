# UnlockSaaS Video Sales Letter — Multi-Cut Architecture

**Source:** DotCom Secrets Chapter 20 (VSL Funnels) + Expert Secrets Chapter 9 (Epiphany Bridge Script).
**Status:** SEVEN-CUT ARCHITECTURE LOCKED 2026-05-17. Canonical TS registry at [`app/src/lib/vsl/cuts.ts`](../app/src/lib/vsl/cuts.ts). This document is the **operator-facing summary** — it explains which cut goes where and what each one targets. The actual cut copy, speaker notes, JSON-LD chapter offsets, and env-var keys live in the TS file as the single source of truth, so a copy change in the registry never drifts from the rendered surface.

---

## Why seven cuts, not one

Brunson Secret #20 is not "record one video and embed it everywhere." Every surface in the funnel gets the cut that fits it:

- A 22-second cold-traffic ad does not survive a 3:45 monologue.
- A 3:45 long-form sales page does not survive a 22-second teaser.
- An Indie Hackers profile autoplay needs a different opening line from a podcast cold-pitch email.

One VSL per surface, one recording session, seven exports.

---

## The seven cuts

| # | Cut id | Length | Surface | Brunson role |
|---|---|---|---|---|
| 1 | `bridge_cold_ad` | 22s | `/bridge`, X video posts | Cold-traffic pattern interrupt |
| 2 | `indie_hackers_profile` | 28s | Indie Hackers profile video | WHO + first WHAT |
| 3 | `podcast_pitch` | 30s | Embedded in 5 Tier-1 podcast pitch emails | WHO + mirror moment |
| 4 | `funnel_hub_hero` | 45s | `/` homepage above the fold | WHO + Big Domino |
| 5 | `email_1_what_why` | 90s | Linked from Soap Opera Email 1 | WHAT + first WHY |
| 6 | `kinetic_compact` | 110s | Universal kinetic-typography fallback | Full WWWH compressed |
| 7 | `full_long_form` | 3:45 | `/machine-sales`, `/starter`, `/founding` | Full 6-beat Reluctant Hero |

The full transcript of every cut lives at [`/vsl/transcript`](https://unlocksaas.com/vsl/transcript) for public reading + AEO/GEO discoverability. The operator-only teleprompter view lives at [`/vsl/teleprompter`](https://unlocksaas.com/vsl/teleprompter) (noindex via per-page metadata).

---

## Per-cut env vars

Each cut auto-activates the moment its env var is pushed to Vercel. No code change required — `<VslBlock cut="..." />` reads the right URL automatically. Pattern: `NEXT_PUBLIC_VSL_<KEY>_URL`, plus `_POSTER_URL` and `_THUMBNAIL_URL`.

| Cut | Env key (`<KEY>`) | Status |
|---|---|---|
| `bridge_cold_ad` | `COLD_AD` | Awaiting recording |
| `indie_hackers_profile` | `IH_PROFILE` | Awaiting recording |
| `podcast_pitch` | `PODCAST_PITCH` | Awaiting recording |
| `funnel_hub_hero` | `HERO` | Awaiting recording (legacy `NEXT_PUBLIC_VSL_URL` also resolves this cut) |
| `email_1_what_why` | `EMAIL_1` | Awaiting recording |
| `kinetic_compact` | `KINETIC` | Kinetic typography renders without env var; if env var is set, recorded 110s replaces it |
| `full_long_form` | `MASTER` | Awaiting recording |

Each cut's VideoObject JSON-LD activates simultaneously with its env-var URL. When set, the schema includes `hasPart` Clip entries per Brunson chapter (WHO / WHAT / WHY / HOW) so search engines can surface deep links ("watch the Big Domino").

---

## One shoot, seven exports

The seven cuts are designed to come from one recording session. The `full_long_form` (3:45) is the master; the six shorter cuts are surgical edits of the same takes.

**Cut sources (master → shorter cuts):**

- `bridge_cold_ad` (22s) = Beat 2 opening + Beat 3 mirror line.
- `indie_hackers_profile` (28s) = Beat 1 full + Beat 4 first sentence.
- `podcast_pitch` (30s) = Beat 1 opening line + Beat 3 in full.
- `funnel_hub_hero` (45s) = Beat 1 + Beat 2 (compressed) + Beat 4 Big Domino.
- `email_1_what_why` (90s) = Beat 4 Big Domino + first Why secret + CTA.
- `kinetic_compact` (110s) = compressed all six beats (kinetic-typography format only — does NOT come from the shoot; lives in `lib/vsl/script.ts` as 11 scenes).
- `full_long_form` (3:45) = all six beats, master cut.

**Shoot day reading order:** record Beat 1 → Beat 2 → Beat 3 → Beat 4 → Beat 5 → Beat 6, three to four takes per beat. The teleprompter at `/vsl/teleprompter` reads the master cut by default and the operator can flip to any other cut to verify the cut-specific edit boundaries before recording.

---

## Production rules (apply to every cut)

These are NON-NEGOTIABLE and apply to every recorded cut equally:

1. **Microphone:** lavalier (Rode Wireless Go II) at the sternum, under −12 dB peak. Built-in camera mic is a no — viewers register the cheapness in 4 seconds and bail.
2. **Lighting:** key light at 45° off-camera-left, soft. No on-camera ring light — the catch-light reads as "selling to me" and breaks the Reluctant Hero frame.
3. **Framing:** medium close-up. Founder eye line at the top third. Camera at eye level — never below ("lecturing") or above ("small").
4. **Background:** real, lived-in. NOT a creator-bokeh background. The Reluctant Hero records from a real room.
5. **Wardrobe:** what the founder actually wears on a Tuesday. Plain solid shirt, no logos.
6. **Multiple takes per beat:** 3–4 takes per beat. NEVER record top-to-bottom on take one. Beat 3 (the mirror) almost always needs take 4+ to feel real instead of rehearsed.
7. **No music bed.** Silence between beats. Music in a Reluctant Hero confession reads as guru-marketing.
8. **Color grade:** flat, slightly desaturated. NOT the warm-and-glossy creator look.

---

## Cut-by-cut B-roll discipline

The master (`full_long_form`) ships with a 7-shot B-roll plan:

| # | Shot | Anchored to beat | Why |
|---|---|---|---|
| 1 | Stripe dashboard flat line, blurred amounts, hold 3s | Beat 2 "I'd watch a line lie flat" | The viewer's own flat line flashes in their mind |
| 2 | Hands on keyboard, late-night typing | Beat 2 "I told myself the funnel was leaking" | Visualizes the avoidance loop |
| 3 | Lovable → Claude → vibe-coded product preview, 2s each smooth pan | Beat 1 "Lovable and Claude opened it" | Grounds the AI-builder identity |
| 4 | Notebook with offer scribbles, real handwriting | Beat 3 "found nothing on the page" | Shows the blank-offer-page parable visually |
| 5 | Wide shot of empty room, slow zoom on single chair | Beat 3 "walk around the room" | Visualizes self-recognition without staging it |
| 6 | The Machine Step 5 outreach screen with verified checkmark | Beat 4 "a tool that refuses to let you skip" | Concrete product proof |
| 7 | Stripe dashboard with one new charge appearing | Beat 5 "Stripe shows no new paying customer" | The promise made literal |

**B-roll rule:** never cut to B-roll on a confession beat. The confession needs the face. B-roll exists for the mechanical / product / proof beats.

The shorter cuts (`bridge_cold_ad`, `indie_hackers_profile`, `podcast_pitch`, `funnel_hub_hero`) deliberately skip B-roll — they need the founder's face the whole time. The `email_1_what_why` cut uses B-roll shot #6 only.

---

## Upload pipeline

Each cut uploads via `scripts/upload-shoot.py` (already shipped per [`strategy/OPERATOR-SHOOT-DAY.md`](OPERATOR-SHOOT-DAY.md)):

```bash
# Once, before shoot day
python3 scripts/setup-mux-credentials.py

# After the shoot, one command per cut (or batched)
python3 scripts/upload-shoot.py /path/to/master.mp4       NEXT_PUBLIC_VSL_MASTER_URL
python3 scripts/upload-shoot.py /path/to/hero.mp4         NEXT_PUBLIC_VSL_HERO_URL
python3 scripts/upload-shoot.py /path/to/email_1.mp4      NEXT_PUBLIC_VSL_EMAIL_1_URL
python3 scripts/upload-shoot.py /path/to/cold_ad.mp4      NEXT_PUBLIC_VSL_COLD_AD_URL
python3 scripts/upload-shoot.py /path/to/ih.mp4           NEXT_PUBLIC_VSL_IH_PROFILE_URL
python3 scripts/upload-shoot.py /path/to/podcast.mp4      NEXT_PUBLIC_VSL_PODCAST_PITCH_URL
python3 scripts/upload-shoot.py /path/to/kinetic_face.mp4 NEXT_PUBLIC_VSL_KINETIC_URL  # optional — replaces kinetic typography fallback
```

The transcript page (`/vsl/transcript`) auto-renders the "Recorded · auto-playing" badge on each cut the moment its env var is set. Operators can ship cuts incrementally — `bridge_cold_ad` first if cold ads start running before everything else is ready, `full_long_form` last when polish allows.

---

## Status

- **Architecture:** 7 cuts locked in `lib/vsl/cuts.ts` (canonical) + this doc (operator-facing).
- **Recording:** 0 / 7 cuts shot. Single shoot day produces all seven.
- **Mount points:**
  - `bridge_cold_ad` mounted on `/bridge`.
  - `funnel_hub_hero` mounted on `/` via existing `<VslBlock />` default routing through env-var fallback.
  - `full_long_form` mounted on `/machine-sales` (and `/founding`, `/starter` via VslPlayer cut prop).
  - `kinetic_compact` is the universal fallback — renders on any surface where the cut's env var is not yet set.
  - `email_1_what_why`, `indie_hackers_profile`, `podcast_pitch` are off-site cuts (delivered as Mux/MP4 URLs in emails, IH profile, podcast pitch attachments).
- **Discoverability:**
  - `/vsl/transcript` public, indexed, in sitemap.
  - `/vsl/teleprompter` operator-only, noindex via per-page metadata.
  - Per-cut VideoObject JSON-LD with `hasPart` Clip entries auto-activates per cut env var.

**Single founder action remaining to land all seven recorded cuts: one shoot, then seven `upload-shoot.py` commands.**

---

*Workbook: Unlock the Secrets. Project: Unlock SaaS. Generated with Brunson Architect.*
