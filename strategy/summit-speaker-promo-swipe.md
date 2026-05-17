# Speaker Promo Swipe File — paste-and-go for confirmed Summit speakers

**Status:** SHIPPED. Delivered to confirmed speakers on Email 3 of the pitch sequence.
**Locked:** 2026-05-17.
**Companion docs:** [`strategy/summit-funnel.md`](summit-funnel.md), [`strategy/summit-speaker-pitch.md`](summit-speaker-pitch.md).

---

## Why this exists

The single most-common Brunson summit failure mode is **speakers who confirm, deliver the recording, and then don't promote.** They get to Day 0 with no email written to their list, default to "I'll get to it later," and the live window closes with zero attributed clicks.

This swipe file removes the "I don't know what to write" friction. Each email is fully drafted. The speaker pastes, tweaks the first sentence to sound like them, and sends. Total speaker writing time across all 4 emails: ~5 minutes.

Each email has the speaker's affiliate URL pre-filled when delivered (server-rendered from `summit_speakers.slug` → `https://unlocksaas.com/summit?speaker={slug}`).

---

## Email 1 — The Announce (D-21)

**Subject options (pick one):**
- I'm on a panel I actually want to be on
- This is the rarest type of event I've said yes to
- Three days, twenty founders, no fluff

**Body:**

```
Hey,

Quick note. In three weeks I'm speaking at something I genuinely want to be
part of: The Verified Builder Summit.

Twenty founders. Three days. All non-engineers who shipped real things with
AI tools and figured out how to actually get paid for them. Recorded
interviews, 20 minutes each, no slide decks, no theory.

I'm in because the lineup is the kind of people I learn from, not pitch at.
{NAME 1}, {NAME 2}, {NAME 3} are also speaking.

It's free. Three-day live window. Replays only with the All-Access Pass.

If "shipped something, can't get paid" is anywhere near your story this
year, you should be there:

{AFFILIATE_URL}

— {SpeakerName}
```

**Customization rules for the speaker:**
- First sentence: rewrite to sound like you. The rest of the email already does.
- The 3 names: provided when this email goes out — pick the 3 closest to your audience.
- Sign-off: your usual sign-off.

**Why this works:**
- Lead is curiosity, not promotion. Speaker is in their own voice in the first sentence.
- The peer-recommendation frame ("the kind of people I learn from, not pitch at") is the Brunson Reluctant Hero filter — the speaker positions themselves as a curator, not a salesperson.
- The "shipped something, can't get paid" line mirrors Marco's exact lived experience and pre-qualifies the audience.
- One CTA. One URL. Brunson rule: never multi-link in a promotion email.

---

## Email 2 — The Reminder (D-7)

**Subject options:**
- One week until the Summit
- Lineup just locked
- The thing I told you about — one week out

**Body:**

```
Hey,

One week until the Verified Builder Summit. Quick reminder of what makes
it different from the usual "founder podcast" lineup:

- Twenty speakers. All shipped on AI tools. All have at least one paying
  customer.
- Three days, six-to-seven sessions per day, 20 minutes each.
- Live windows only — each day's sessions go behind the All-Access Pass at
  midnight UTC the next day.

My session is on Day {N}: "{SESSION_TITLE}".

Reserve a free seat:

{AFFILIATE_URL}

— {SpeakerName}
```

**Customization rules:**
- {SESSION_TITLE}: filled in by the speaker on the agreement step. Pre-loaded by the time this email is delivered.
- Day {N}: assigned by Maryan; pre-loaded.

**Why this works:**
- The "different from the usual" frame elevates the event without making any single competitor claim.
- The 24-hour-window line creates real scarcity. No countdown timer. No fake urgency.
- Speaker's own session is named — gives them ego skin-in-the-game to send the email.

---

## Email 3 — The Live (Day 0, speaker's session day)

**Subject options:**
- My session goes live today
- Today only: the 20-minute version
- Live in the next 24 hours

**Body:**

```
Hey,

My Verified Builder Summit session goes live today.

20 minutes. I cover {ONE-SENTENCE TOPIC SUMMARY}.

24-hour window before it goes behind the paywall:

{AFFILIATE_URL}

If you can't catch it live, the All-Access Pass keeps it open forever
(plus all 19 other sessions). Link on the summit page once you're in.

— {SpeakerName}
```

**Customization rules:**
- {ONE-SENTENCE TOPIC SUMMARY}: 12–18 words, the speaker's hook for the session. Filled by speaker on agreement.

**Why this works:**
- Day-0 urgency is real, not manufactured. The 24-hour window is a structural feature, not a copy trick.
- The All-Access Pass mention is one sentence at the bottom — speaker is not selling it, just informing.
- The "Link on the summit page once you're in" line removes a copy-paste step for the speaker (no need to write out the AAP-specific URL).

---

## Email 4 — The Conversion (D+1, after speaker's session expires)

**This is the email that makes the math work.** All-Access Pass purchases attributed to the speaker in the 7 days following this email are the bulk of their commission.

**Subject options:**
- Missed me yesterday?
- The replay is locked, but here's the door
- Yesterday's session, plus 19 others

**Body:**

```
Hey,

If you missed my Verified Builder Summit session yesterday, the 24-hour
window closed at midnight UTC.

You can still watch it — plus all 19 other sessions — with the All-Access
Pass. It includes:

- Lifetime replays of every session
- Searchable transcripts
- The Resource Pack (one PDF per speaker, what we'd each do to get a first
  paying customer)
- Two bonus "vault" sessions that weren't part of the live event
- One free month of UnlockSaaS Machine ($49 value)

It's $97 one-time, total value about $466.

Direct link:

{AFFILIATE_URL_AAP}

I get 50% of every Pass sold through this link, which is the deal Maryan
offered to make speaking worthwhile. I'd rather you know that up front
than not.

— {SpeakerName}
```

**Customization rules:**
- {AFFILIATE_URL_AAP}: separate from the general affiliate URL — this one routes directly to `/summit/all-access?speaker={slug}` so the AAP conversion is attributed even if the user already opted in earlier.
- "I get 50%..." disclosure: locked. Removing it violates the brand's polarity AGAINST line on dishonest summit funnels. Speakers who want to remove it lose access to the swipe file (and the affiliate program for next summit).

**Why this works:**
- The full stack is named in plain text. Same math as the canonical strategy doc — no inflation, no fantasy.
- The 50% disclosure is the Reluctant Hero move. Brunson Hard Rule: skeptic avatars convert better when you over-disclose than when you under-disclose. The disclosure shifts the email from "promotion" to "recommendation with skin in the game."
- The "deal Maryan offered" line credits the source. Reduces speaker hesitation about sending the conversion email.

---

## Send schedule (speaker delivers, system reminds)

Each speaker gets the swipe file at Email 3 of the pitch sequence (agreement-sent step). They are expected to:

1. **Schedule Email 1 for D-21.** Calendar-block it.
2. **Schedule Email 2 for D-7.** Calendar-block it.
3. **Send Email 3 manually on Day 0** (their session day).
4. **Send Email 4 manually on D+1**.

The system reminds: on D-22, D-8, Day-0 morning, and D+1 morning, the speaker dashboard at `/summit/speaker/{slug}/stats` shows a top-banner alert: "Promo Email N due in 24 hours — paste-and-go copy at [link to this swipe file]."

The dashboard does NOT auto-send. The speaker sends from their own ESP, with their own audience, in their own brand. Auto-sending speaker emails violates platform ToS (most ESPs forbid third-party-content batch sends without sender consent on each batch) and reads as inauthentic to the speaker's audience.

---

## What this swipe file deliberately does not include

1. **No "share on X" template.** Cross-channel content fatigue is real; one email is enough. Speakers who want to also tweet can do so on their own.
2. **No GIFs, no emoji-heavy copy, no clickbait.** Brunson Reluctant Hero discipline applies to speaker-to-list emails too — the brand's voice survives a speaker swap.
3. **No "limited spots" language for the free 3-day window.** Brunson rule: don't invent scarcity. The 3-day window is real (structural to the summit format). Add nothing.
4. **No "scroll down to claim" theater.** Single CTA, single URL, one decision.

---

## Performance benchmarks (for the post-summit audit)

Tracked per-speaker in `summit_referrals` + `summit_speakers`:

| Metric | Threshold for "promoted" | Threshold for "underperformed" |
|---|---|---|
| Email 1 sent | yes / no | n/a |
| Email 1 → click-through to speaker URL | ≥ 1% of speaker's list | < 0.3% |
| Email 4 sent | yes / no | n/a |
| Email 4 → AAP purchase | ≥ 0.5% of speaker's list | < 0.1% |
| AAP commission earned | ≥ $97 (1 sale per ~$200 of list rev) | $0 |

Speakers who underperform on Email 4 specifically (not Email 1 — Email 4 is the load-bearing one for the math) get a "promoted but did not convert" tag in the next-summit invite decision. Promotion fatigue is forgivable; not sending Email 4 is not.

---

*Source: DotCom Secrets, Secret #16 (Summit Funnel) + Hook-Story-Offer for Traffic (workbook 08 §3) + Reluctant Hero AC voice (workbook 01 §6 Beat 2). Companion to `strategy/summit-funnel.md` and `strategy/summit-speaker-pitch.md`.*
