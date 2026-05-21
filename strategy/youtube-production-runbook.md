# Alex's Diary — Faceless Production Runbook

**Status:** LOCKED 2026-05-21.
**Companion to:** strategy/youtube-faceless-channel.md.
**Operator:** Maryan, ~2h per episode once runbook is internalised.

The goal of this runbook is to make every episode shippable from a single Markdown script in this repo, with zero on-camera shooting and zero context-switching cost.

---

## §1 Tooling stack (locked)

| Stage | Tool | Why this one |
|---|---|---|
| Script | Markdown in repo (`strategy/episodes/founders-diary/EXX-*.md`) | Source of truth; diffable; AI-rewritable |
| Voice-over | ElevenLabs (single locked voice, "Alex" preset) | Consistent voice across episodes; cheap |
| B-roll | Veo 3 (preferred) → Hailuo (fallback) | Per Isenberg 2026 picks; consistent quality |
| Screen recordings | macOS native screenshot/screencapture → ScreenStudio (zoom + cursor highlight) | Stripe dashboard + product walkthroughs |
| Thumbnail | Figma template (one file, layered, swap text per episode) | Consistent series branding |
| Edit | Descript (script-first, deletes audio gaps automatically) | Faceless workflow native |
| Captions | Descript auto + manual pass for Alex-verbatim emphasis | Captions are 60% of YouTube watch time |
| Upload | YouTube Studio (manual; never auto-upload pre-flight check) | Catches em-dash slips in titles/descriptions |

**Locked voice prompt for ElevenLabs:**
> Voice: warm, late-30s male, slight tiredness, no announcer energy, present-tense. Pace 165–175 wpm. Pause 0.6s after every paragraph break. Read all en dashes as a brief pause, never as the word "dash".

## §2 Episode file structure

Every episode is one Markdown file with this exact frontmatter:

```markdown
---
id: E07
title: "I sent 20 cold DMs and got 19 nos. Here is what the 20th said."
hook_3s: "Twenty messages. Nineteen ignored or no'd. I almost stopped at fifteen."
brunson_beat: story
length_target_seconds: 360
publish_at: 2026-06-10T14:00:00Z
status: draft
utm_content: ep07
b_roll:
  - stripe-zero-revenue-line
  - typing-in-tweetdeck
  - inbox-with-rejected-replies
cta:
  primary: /diagnostic?utm_source=youtube&utm_medium=video&utm_campaign=founders-diary&utm_content=ep07
  cta_line: "If your Stripe line looks like mine, take the 90-second diagnostic."
---

## Cold open (0:00–0:08)
[…voice-over script…]

## Beat 1: the setup (0:08–1:20)
[…]
```

Status enum: `draft` → `voiced` → `cut` → `scheduled` → `live`.

## §3 Per-episode operator checklist

Estimated time: 2h end-to-end once internalised. Initial 3 episodes: 5–6h each.

1. **Script** (~30 min) — write or edit the EXX file in `strategy/episodes/founders-diary/`. Confirm: numbered badge, cold-open hook, one Brunson beat, CTA card, no em dash, light-shadcn aesthetic call-outs for B-roll.
2. **Voice-over** (~15 min) — pipe script body into ElevenLabs locked voice. Save WAV as `EXX-vo.wav`. Status → `voiced`.
3. **B-roll generation** (~30 min, parallelisable) — for each `b_roll` tag in frontmatter, generate Veo 3 clip; fall back to Hailuo on failures. Save as `EXX-broll-NN.mp4`.
4. **Screen-recordings** (~15 min if needed) — capture real Stripe dashboard / product walkthroughs. Redact customer PII. Save as `EXX-screen-NN.mp4`.
5. **Edit in Descript** (~25 min) — drop VO, layer B-roll + screen-rec on the script's beats, cut audio gaps, add lower-thirds for the numbered episode badge. Status → `cut`.
6. **Thumbnail** (~5 min) — duplicate Figma template, swap the episode title + key visual.
7. **Pre-flight check** (~5 min) — title + description + tags + first-comment CTA all em-dash-free (use the repo-wide search), UTM string matches frontmatter, end-screen card points at /diagnostic.
8. **Schedule in YouTube Studio** (~5 min) — manual schedule per the frontmatter `publish_at`. Status → `scheduled`.
9. **On publish day** — operator flips status to `live` in the registry, opens the live URL in PostHog to confirm the youtube UTM hits the diagnostic.

## §4 Title + description templates

**Title format (locked):**

`E<NN> · <Hook line from script> — Alex's Diary`

Bad: `How I Got My First Customer With Cold DMs (You Won't Believe What Happened)`
Good: `E07 · I sent 20 cold DMs and got 19 nos. Here is what the 20th said. — Alex's Diary`

Polarity: episode titles must read like diary entries, not YouTube algorithm bait. The Brunson Reluctant Hero NEVER shouts.

**Description format (locked):**

```
{cold-open hook restated as 1 line}

In this episode of Alex's Diary I {action verb} {object}.

The 90-second free diagnostic that I keep mentioning:
{primary CTA URL with full UTM stamp}

Timestamps:
0:00 {beat 1 label}
1:20 {beat 2 label}
…

About this channel:
I am Maryan. I shipped products nobody paid for, and refused to look at the
flat Stripe line for almost a year. Alex's Diary is the public log of me
fixing it, $0 to first paying customer, in real time. New episode every
Tuesday and Friday.

Full series + transcripts: https://unlocksaas.com/youtube
Reply to anything at maryan@unlocksaas.com
```

## §5 Repurposing per episode (Isenberg-stacked)

Per Brunson "repurpose every long-form piece across 8 surfaces" (echoed in podcast-outreach.md §5) and Isenberg's "one piece of content = 12 distribution shots":

1. YouTube long-form (canonical)
2. YouTube Shorts cut (when long-form count >= 10 per §9 of the channel doc)
3. X thread (3–5 posts pulling out the Brunson beat + CTA)
4. IH post (the same beat, reframed as "log entry")
5. r/SaaS post (only if the beat answers a current top-thread question; otherwise skip — no spam)
6. Newsletter mention (next Soap Opera send: "I just put up E07, link below")
7. Transcript on /youtube/ep/<slug> (SEO + AI-agent indexing)
8. Pull-quote tweet (single sentence with the screenshot used in the episode)

## §6 The kill-switch

If any of these triggers, this channel goes to PAUSED in the registry and the operator stops producing:

- 10 episodes shipped, zero `/diagnostic` UTM opt-ins from youtube.
- Episode production time per ep stays above 4h after E05 (runbook isn't compressing → the channel is breaking the solo-founder constraint, which is the reason YouTube was originally skipped).
- Production tooling subscriptions exceed $80/mo total (ElevenLabs + Veo 3 + Descript + Figma). Beyond that we are funding a hobby, not a channel.
- Alex's Diary stops sounding like Alex. The voice drift test: would the founder-VSL script (strategy/founder-vsl-script.md) sit naturally next to the latest episode? If no, retune.
