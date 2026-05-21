# Operator Shoot-Day Checklist — VSL + 3 Founding PLVs

**Audience:** Maryan, on the day of the shoot.
**Total wall-clock:** ~3 hours (1h setup + 1.5h recording w/ buffer + 30m upload).
**Output:** Four MP4s uploaded to Mux + 4 env vars pushed to Vercel + one
production deploy that flips every video surface from placeholder to real
video.

This is the single page to read on shoot day. Scripts are not in here —
read them on paper or a second screen. The references are:

- VSL (3–5 min): `strategy/founder-vsl-script.md`
- PLV1 (5–7 min): `strategy/founding-plv-scripts.md` § PLV1
- PLV2 (8–10 min): `strategy/founding-plv-scripts.md` § PLV2
- PLV3 (10–12 min): `strategy/founding-plv-scripts.md` § PLV3

---

## 1. Pre-shoot (45 minutes, day-of or night-before)

### Mux account (one-time, 5 minutes)

1. Sign up at https://mux.com — free tier covers ~100 GB of delivery per
   month, which is roughly 25,000 PLV3 views or 100,000 short-VSL views.
   You will not hit the cap pre-revenue.
2. **Settings → Access Tokens → Generate new token.** Permissions: tick
   only `Mux Video → Write`. Name it "UnlockSaaS shoot upload."
3. Copy BOTH the Token ID and the Token Secret. Mux shows the Secret
   exactly once.
4. In the repo root:
   ```bash
   python3 scripts/setup-mux-credentials.py
   ```
   Paste each value when prompted. Both are hidden from terminal.

### Hardware (10 minutes)

| Item | Required? | Notes |
|---|---|---|
| Phone with 1080p video | Required | Any iPhone 12+ or modern Android is fine. Tripod or stable surface mandatory — handheld jitter eats trust. |
| Lavalier mic ($30 from Amazon) | Required | The laptop / phone mic is the single biggest deliverability killer. Wired mic > wireless for one-shot recording. |
| Window light | Strongly preferred | Face the window. Daytime. NO ceiling light shining down on you. NO ring light glare in glasses. |
| Plain wall behind you | Required | NOT a bookshelf, NOT a kitchen, NOT a poster. A wall. The Reluctant Hero voice does NOT pair with a backdrop. |
| Water nearby | Required | You're talking for 35–45 minutes total. Dry mouth audible at minute 12. |
| Printed scripts | Strongly preferred | Two pages per script, taped just below the camera lens. Reading from phone causes visible eye drift. |

### Voice (5 minutes)

Read the first paragraph of the VSL script aloud three times before
hitting record. NOT to memorize — to warm the cords. Brunson rule:
the first sentence of a VSL is the entire VSL. If the first sentence
sounds rehearsed, the visitor leaves.

### Wardrobe / look (5 minutes)

Per the prompt directive: **same shirt, same lighting, same camera angle
for ALL FOUR takes.** Continuity across the four cuts is what makes them
read as one piece, not four ad-hoc recordings. A plain dark shirt (no
logo, no horizontal stripes) is the safe call. The visitor remembers your
face; the shirt should be invisible.

### Environment (5 minutes)

- Phone on silent (NOT vibrate — vibrate clatters on a table).
- Mac notifications OFF (System Settings → Notifications → Do Not Disturb).
- Close doors. Pets out of the room. The honest deliverability bar is "no
  unexplained sounds in the take." A dog bark or a Slack ping kills it.

---

## 2. Shoot (60–90 minutes including resets)

**Order matters.** Shortest first, hardest last. The voice warms; you do not
want to record the 12-minute PLV3 cold.

| Order | Take | Length | Script reference |
|---|---|---|---|
| 1 | **VSL** | 3–5 min | `strategy/founder-vsl-script.md` |
| 2 | **PLV1 — "The Door That Opened"** | 5–7 min | `founding-plv-scripts.md` § PLV1 |
| 3 | **PLV2 — "How the Playbook Actually Works"** | 8–10 min | `founding-plv-scripts.md` § PLV2 |
| 4 | **PLV3 — "What It Looks Like on the Inside"** | 10–12 min | `founding-plv-scripts.md` § PLV3 |

### Rules per take

1. **One continuous take per video.** No cuts in-take. If you fluff a
   sentence past the first 30 seconds, stop, reset, start the take from
   the top. The voice has to be unbroken.
2. **First take of each video is the warm-up.** Plan to redo every video
   at least once. The second take is usually the keeper.
3. **Save the file with the env var name.** When you stop recording:
   - VSL → `vsl.mp4`
   - PLV1 → `plv1.mp4`
   - PLV2 → `plv2.mp4`
   - PLV3 → `plv3.mp4`
4. **Between takes:** drink water, walk 60 seconds, re-read the next
   script's opening paragraph aloud once. Do NOT scroll your phone. The
   pacing of takes is part of the recording quality — phone-brain shows up
   on camera as eye-vacancy in the next take.

### PLV2 screen-recording inserts

PLV2 calls for screen recordings of `/playbook/step/1` and `/playbook/step/2`.
Two options:

- **Option A — record them separately, splice later.** Open
  https://unlocksaas.com on your laptop. Use macOS Cmd-Shift-5 →
  "Record selected portion" → just the browser window. Save each as
  `plv2-insert-step1.mov` and `plv2-insert-step2.mov`. Splice in iMovie.
- **Option B — defer the inserts.** Record PLV2 narration over a black
  slate. Upload v1 with narration only. Re-record inserts and re-upload as
  v2 in week 2. The PLF launch reads narration-only as authentic on a
  first pass — Brunson's exact "show before polish" stance.

**Recommendation: Option B for shoot day.** Get all four narration takes
in one sitting. Polish PLV2 inserts later in the week if conversion data
warrants it. Don't let post-production block the shoot.

### When you've got all four

Move all four MP4s into one folder, e.g. `~/Desktop/shoot-2026-05-17/`.
You're done with the camera.

---

## 3. Upload (15–30 minutes, mostly waiting)

One command per file. Run from the repo root.

```bash
cd /Users/sipi/unlocksaas

python3 scripts/upload-shoot.py ~/Desktop/shoot-2026-05-17/vsl.mp4  NEXT_PUBLIC_VSL_URL
python3 scripts/upload-shoot.py ~/Desktop/shoot-2026-05-17/plv1.mp4 FOUNDING_PLV1_PLAYBACK
python3 scripts/upload-shoot.py ~/Desktop/shoot-2026-05-17/plv2.mp4 FOUNDING_PLV2_PLAYBACK
python3 scripts/upload-shoot.py ~/Desktop/shoot-2026-05-17/plv3.mp4 FOUNDING_PLV3_PLAYBACK
```

Each command:
1. Uploads the MP4 to Mux (2–5 min depending on file size + upload speed).
2. Polls Mux until the static MP4 rendition is ready (3–8 min).
3. Pushes the env var to Vercel for production, preview, AND development.

**Or batch in one call:**

```bash
python3 scripts/upload-shoot.py \
  ~/Desktop/shoot-2026-05-17/vsl.mp4=NEXT_PUBLIC_VSL_URL \
  ~/Desktop/shoot-2026-05-17/plv1.mp4=FOUNDING_PLV1_PLAYBACK \
  ~/Desktop/shoot-2026-05-17/plv2.mp4=FOUNDING_PLV2_PLAYBACK \
  ~/Desktop/shoot-2026-05-17/plv3.mp4=FOUNDING_PLV3_PLAYBACK
```

Batch is faster (one Python startup) but if any single video fails to
process, the rest still finish. Each upload is independent.

### What gets pushed to Vercel

| Variable | Style | Value the script writes |
|---|---|---|
| `NEXT_PUBLIC_VSL_URL` | Full URL | `https://stream.mux.com/<playback-id>/medium.mp4` |
| `FOUNDING_PLV1_PLAYBACK` | Raw playback ID | `<playback-id>` |
| `FOUNDING_PLV2_PLAYBACK` | Raw playback ID | `<playback-id>` |
| `FOUNDING_PLV3_PLAYBACK` | Raw playback ID | `<playback-id>` |

The VSL block accepts a URL because it was wired before Founding standardized
on playback IDs. The Founding `PlvBlock` reads the raw ID and composes
`https://stream.mux.com/<id>/medium.mp4` in the server component before
rendering. Same Mux MP4, just two different contracts.

### Re-deploy

Vercel does NOT automatically redeploy when env vars change. Trigger a
production deploy:

```bash
# Either: push any commit to main (preferred — keeps the audit trail in git)
git commit --allow-empty -m "Trigger redeploy after shoot upload"
git push origin main

# Or: use the Vercel CLI directly
vercel --prod
```

---

## 4. Verify (5 minutes)

Open these four URLs in an incognito window (incognito so you see the
A/B and cohort state exactly as a new visitor would):

| URL | What you expect to see |
|---|---|
| https://unlocksaas.com/ | The "Meet the founder" block now shows the real VSL (not the kinetic typography fallback). |
| https://unlocksaas.com/playbook-sales | Same VSL embedded above the Three Secrets block. |
| https://unlocksaas.com/founding | Three real video players (PLV1, PLV2, PLV3) replacing the "Video upload pending" placeholders. |
| https://unlocksaas.com/founding (mobile) | All four videos play with audio on a real phone. The lavalier mic test happens here, not on your laptop. |

If any video does NOT appear:
1. Check that the env var is set on production:
   ```bash
   vercel env ls production
   ```
2. Check that the value is the full URL (for `NEXT_PUBLIC_VSL_URL`) or
   the raw playback ID (for `FOUNDING_PLV*_PLAYBACK`). The upload script
   prints both at the end.
3. Confirm the redeploy actually fired (https://vercel.com/sales-3429s-projects/unlocksaas
   should show a deployment timestamped AFTER the last `vercel env add`).

---

## 5. Post-shoot (5 minutes)

1. Mark the founder open item #3 from `00-RESUME-HERE.md` as done.
2. Update `LAUNCH-READINESS.md` Tier 2 row 4 from `[ ]` to `[x]`.
3. Commit any leftover work plus a build-log entry:
   ```
   ## VSL + 3 PLVs Live on Production
   - Recorded same-shirt-same-light shoot per OPERATOR-SHOOT-DAY.md
   - Uploaded 4 MP4s to Mux via scripts/upload-shoot.py
   - NEXT_PUBLIC_VSL_URL + FOUNDING_PLV{1,2,3}_PLAYBACK pushed to all 3 Vercel envs
   - Verified live on /, /playbook-sales, /founding (desktop + mobile)
   - Brunson audit score lift: DCS Secret 20 (VSL) 40 → ~90, ES Secret 11
     (Perfect Webinar) 88 → ~92, DCS Secret 21 (PLF) 92 → ~96. Composite
     78 → forecast ~84.
   ```

---

## What this does NOT cover (and why)

- **The 45-second VSL cut for `/` and the 90-second cut for SOS Email 1.**
  These are derivative edits of the same VSL source. Defer the edits.
  The full VSL on `/` and `/playbook-sales` is the launch bar. The short
  cuts are post-launch optimizations that you can produce in iMovie in 15
  minutes once cold-traffic data shows where the long VSL is dropping
  off.
- **Re-recording with B-roll / graphics / a producer.** Reluctant Hero
  voice REJECTS production polish. The whole brand argument is that the
  founder talks to the camera, not at it. Phone + lavalier mic IS the
  spec. A polished edit would actively hurt cold-traffic conversion for
  Alex's avatar.
- **Captions.** Mux auto-generates captions from the audio after upload
  (Settings → Captions → Auto-generate). Enable it once after the first
  asset is processed; the captions apply to all future assets in the
  account. Half your audience watches with sound off — captions on launch
  day are a free conversion lift.
- **Recording sessions for the manifesto-only PLV3 cut.** PLV3 includes a
  manifesto reading. The script has you read it aloud. If you fluff the
  reading, restart from the manifesto's first line; the engine pushback
  demo and the refund button hover are in different beats and can be
  done with a quick edit-point if absolutely necessary. But the rule
  remains: one continuous take per video.

---

## Honest scope of this checklist

This page mechanizes everything around the shoot. It does NOT shoot the
video for you. The 3-hour budget assumes:

- 45 min pre-shoot (1× human effort, mostly stationary setup)
- 60–90 min shoot (1× human effort, on camera)
- 15–30 min upload (mostly Mux processing while you do something else)
- 5 min verify

If any step blocks, stop and read the corresponding section above before
continuing. The Brunson rule that governs this whole page: **founder face
on the funnel doubles cold conversion. Recorded badly is still 2x scripted
typography. Stop polishing.**

— Russell would tell you to press record.
