# Voice Assistants – Surface playbook

Status as of 2026-05-21. This doc inventories every voice-assistant surface we actively ship to, the credible ones we deliberately do not ship to, and the operator steps to activate each one.

## TL;DR

| Surface | Status | Activation |
| --- | --- | --- |
| Apple Podcasts | Submittable | One-time RSS submission at podcastsconnect.apple.com |
| Spotify | Submittable | One-time RSS submission at podcasters.spotify.com |
| Pocket Casts / Overcast / Castro / AntennaPod | Auto-discovered | None – they ingest from Apple Podcasts directory |
| Alexa Flash Briefing | Live feed shipped | One-time skill creation in Alexa Developer Console |
| Google Assistant Conversational Actions | **Sunset 2023-06** | None – Google killed the product |
| Apple SiriKit content feeds | **No product** | N/A – SiriKit only opens to first-party apps with intents |
| Bing voice + Cortana | Indirect | Speakable schema (already shipped) |
| Google Assistant News (web speakable) | **Sunset 2023** | Speakable schema retained for retriever discovery |

The Brunson Hard-Rule: we ship to live products that accept third-party feeds, document why we do not ship to sunset/closed products, and refuse to fabricate "coming soon" placeholders.

## Surfaces we ship

### 1. Apple Podcasts (RSS submission)

- Feed: `https://unlocksaas.com/feed/podcast.rss`
- Cover art: `https://unlocksaas.com/opengraph-image` (root OG card, 1200×630 – Apple's minimum is 1400×1400; if Apple rejects, generate a square at `/glossary/podcast-cover`)
- Submit at https://podcastsconnect.apple.com → Add a new show → paste the feed URL.
- Approval: typically 24–72h.
- Downstream: Apple Podcasts ingestion populates Pocket Casts, Overcast, Castro, and most aggregators within a week.

### 2. Spotify (RSS submission)

- Same feed URL as Apple.
- Submit at https://podcasters.spotify.com → Add or claim your podcast.
- Approval: usually instant.
- Downstream: powers Spotify search + Discover Weekly + voice ("Hey Spotify, play Indie SaaS Teardowns").

### 3. Alexa Flash Briefing

- Feed: `https://unlocksaas.com/feed/alexa-flash-briefing.json`
- Spec: https://developer.amazon.com/en-US/docs/alexa/flashbriefing/flash-briefing-skill-api-feed-reference.html
- The feed projects the same episodes as the RSS feed into Alexa's required JSON shape: `uid`, `updateDate`, `titleText`, `mainText`, `streamUrl` (when audio enclosure present), `redirectionUrl` (pointing at the transcript page).

#### Skill creation (one-time, ~10 minutes)

1. Go to https://developer.amazon.com/alexa/console/ask and sign in with the operator's Amazon account.
2. Click "Create Skill".
3. Skill name: `Indie SaaS Teardowns Changelog`. Primary locale: `English (US)`.
4. Choose a model: **Flash Briefing**.
5. Choose a hosting solution: **Provision your own** (we host the feed; Alexa only fetches).
6. Click "Create skill".
7. Under "Custom Error Message" enter: `Couldn't reach the Indie SaaS Teardowns changelog right now. Try again later.`
8. Under "Add new feed", configure one feed:
   - Preamble: `In Indie SaaS Teardowns news,`
   - Name: `Indie SaaS Teardowns Changelog`
   - Default: yes
   - Feed: `https://unlocksaas.com/feed/alexa-flash-briefing.json`
   - Update Frequency: `Daily`
   - Content Type: `Text and Audio` (Alexa auto-selects per-item based on whether `streamUrl` is set)
   - Genre: `Technology`
   - Image: upload the 512×512 (small) and 1200×800 (large) icons (reuse `/glossary/podcast-cover` re-rendered at the required sizes)
9. Save.
10. Skill Preview tab → fill in: name, summary, description, example phrases (`Alexa, what's my flash briefing?`), category (`News`), keywords, privacy URL (`/editorial-policy`).
11. Submit for certification. Approval typically 1–3 business days.

## Surfaces we deliberately do not ship

### Google Assistant Conversational Actions

**Sunset 2023-06-13.** Google announced the deprecation 2022-06; the platform stopped accepting new skills 2023-01; existing skills stopped working 2023-06. There is no successor product accepting third-party content feeds.

Reference: https://developers.google.com/assistant/console/sunset-faq

What we ship instead:
- Schema.org `Speakable` selectors (in `app/src/components/seo/json-ld.tsx`) – the canonical signal Google's retrievers use for voice extraction on the surfaces that still exist (Google Search "read aloud").
- Markdown mirrors for every long-form page (`/llms.txt`, `/llms-full.txt`, `/*.md`) – Gemini-powered Google Search consumes these directly.

### Apple SiriKit content feeds

There is no Apple product equivalent to Alexa Flash Briefing. SiriKit is an intent framework for first-party iOS/macOS apps; it does not accept third-party RSS or JSON content feeds.

What we ship instead:
- Apple Podcasts ingestion (above).
- iTunes-namespace RSS feed (`/feed/podcast.rss`) – Apple Spotlight and Siri voice search ingest podcast metadata from this format directly.

### Microsoft Cortana

Cortana sunset 2024-08 (no consumer product; remains an enterprise feature inside Microsoft 365). No third-party content feed surface.

What we ship instead:
- Bingbot is on the AI-crawler allow-list (`app/src/app/robots.ts`); Bing voice search results consume the same HTML we serve to web search.

## Verifying the Alexa feed locally

```bash
# Run dev server
cd app && npm run dev

# Fetch the feed (should return a JSON array of items)
curl -sS http://localhost:3000/feed/alexa-flash-briefing.json | jq .

# Validate against the Amazon JSON schema
# (Amazon does not publish a canonical JSON Schema document; the cert
# process validates server-side. Local check: every item has uid,
# updateDate, titleText, mainText, redirectionUrl; titleText <= 120
# chars; mainText <= 4500 chars; streamUrl is https when present.)
curl -sS http://localhost:3000/feed/alexa-flash-briefing.json | jq -r '
  .[] |
  "uid_ok=\(.uid|type == \"string\")
title_len=\(.titleText|length)
main_len=\(.mainText|length)
stream_https=\(if .streamUrl then (.streamUrl | startswith(\"https://\")) else \"n/a\" end)
"
'
```

## Brunson Hard-Rule reconciliation

- Audio enclosures on the RSS feed are synthesized narration (macOS `say`, voice `Daniel`). The `podcast-audio-manifest.json` `voice.disclosure` field carries this fact verbatim; the transcript page surfaces it inline; the Alexa Flash Briefing `mainText` appends it as a parenthetical.
- We never claim a skill is "submitted" or "live" until the operator confirms in the relevant developer console.
- We do not ship empty/placeholder skill manifests for products that no longer accept third-party feeds (Google Assistant, Cortana, SiriKit).
- Every URL in this playbook is a real, currently-live URL as of 2026-05-21.
