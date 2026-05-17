# Summit Speaker Pitch — 4-Email Sequence

**Status:** SHIPPED. Paste-and-go from Maryan's inbox the day the activation gate fires.
**Locked:** 2026-05-17.
**Companion doc:** [`strategy/summit-funnel.md`](summit-funnel.md) for the full architecture.
**Send-from:** `maryan@unlocksaas.com` (per `project_unlocksaas_email_identity.md`).
**Activation gate:** see `summit-funnel.md` §"Activation gate" — 3 verified customers + Tier Z consents + founder dogfood.

---

## How to use this file

Each speaker (20 total per `summit-funnel.md` §"Speaker tiers") moves through these 4 emails. Send Email 1 to all 30 candidates simultaneously the moment the gate fires; the remaining 3 fire based on speaker state.

| Email | Trigger | Audience |
|---|---|---|
| 1. The Pitch | Activation gate + tier sequencing | 30 candidates (Tier Z + A + D first, then B + C in second wave) |
| 2. The Soft Reminder | 7 days after Email 1, if no reply | Same 30, minus already-confirmed |
| 3. The Agreement | Speaker replied "yes" | Confirmed speakers only |
| 4. The Asset Request | Speaker signed agreement | Signed speakers only |

**Send-cadence guardrail:** Email 1 to Tier Z + A + D goes first (Day 0). Tier B + C wait until at least one Tier D anchor is confirmed — their names unlock the social-proof line in the pitch. If no Tier D yes after Day 14, send Tier B + C pitches with the Tier A names in the social-proof line instead.

---

## Email 1 — The Pitch (D-56)

**Subject:** 20-min interview for The Verified Builder Summit

**Body:**

```
Hey {firstName},

Short version. I'm running a 3-day virtual event in {month} called The Verified
Builder Summit — twenty non-engineer founders who shipped on AI tools and have
at least one paying customer, telling the story of how they got there. 5,000+
attendees expected.

I'd like you in it. Twenty minutes recorded, my questions, your story, your
link in the speaker bio. 50% on any All-Access Pass sales from your audience
($48.50/sale). Confirmed so far: {3 names}.

I handle production, hosting, and promotion. You do one interview and one
email to your list.

Twenty-minute slot or pass?

— Maryan
```

**Why this works (per `funnel-hacks.md` analysis):**

- **Reluctant Hero voice in line 1.** "Short version" lowers the perceived cost of reading. No throat-clearing.
- **The event is named and dated.** Not "I'm thinking of doing a summit." A vague pitch reads as a fishing expedition.
- **The frame is "non-engineer founders with AI tools + at least one paying customer."** This is the speaker's own positioning. They recognize themselves in the description.
- **The attendee number (5,000+) is a stretch goal, not a fabrication.** Brunson rule: defensible numbers. Match this to actual list size + cross-promotion math the day you send.
- **50% revenue share on a $97 product = $48.50/sale.** Honest math. Not "$50 per sale" inflation.
- **Social proof line: "Confirmed so far: {3 names}".** Three confirmed yeses gate this entire sequence — never send Email 1 without them. The three names anchor the credibility of every pitch that follows.
- **The promise is bounded:** "twenty minutes recorded" + "one email to your list" = explicit total speaker time investment of ~90 minutes.
- **Two-option close:** "Twenty-minute slot or pass?" The Brunson audit data is that two-option closes convert ~3x better than open closes ("let me know what you think"). The skeptic is asked to do one thing: decide.

**Customization rules:**

- **{firstName}** is required. Generic "hey there" pitch converts at zero.
- **{month}** is a real month, not "later this year."
- **{3 names}** are real, signed-agreement speakers. Lying here destroys the brand.
- For Tier D speakers, the {3 names} should include at least one Tier D peer (so the pitch reads as "you'd be among peers" not "you'd be the only senior person").
- For Tier B/C speakers, the {3 names} should include at least one Tier A or D (so the pitch reads as "you'd be in good company").

**Hard rule:** never CC any other speaker on Email 1. The pitch must read as 1:1, not a mass send.

---

## Email 2 — The Soft Reminder (D-49)

Sent 7 days after Email 1 to candidates who have not replied.

**Subject:** Re: 20-min interview for The Verified Builder Summit

**Body:**

```
Hey {firstName},

Quick follow-up. Six confirmed so far ({3 names}), and the recording window
closes {date, ~6 weeks out}.

Same ask: twenty minutes recorded, 50% on All-Access Pass sales from your
audience.

Slot or pass?

— Maryan
```

**Why this works:**

- **"Quick follow-up" is the Reluctant Hero version of "bumping this."** No apology. No "did this get lost in your inbox" theater.
- **Updated social proof.** Email 1 said "3 confirmed." Email 2 says "6 confirmed." If the actual number is still 3, do not send Email 2 to anyone — the social proof is not building, the pitch is not landing, and the right move is to debug the pitch, not push harder.
- **The deadline is real and specific.** Not "soon." A date. Brunson rule: scarcity must be structural, never countdown-on-refresh.
- **Same two-option close.** Consistency of close from Email 1 → Email 2 trains the speaker's response shape.

**Send-rule:** if Email 1 has produced fewer than 5 confirmations by Day 7, do NOT send Email 2. Pause, debug Email 1, re-send a revised pitch as Email 1 v2 to the candidates who did not reply. The most common Email 1 failure mode is the {3 names} line being too junior — Tier D anchors have to come back to fix it.

---

## Email 3 — The Agreement (sent on "yes")

Sent within 24 hours of a speaker replying "yes" to Email 1 or 2.

**Subject:** Welcome to the Verified Builder Summit — here's what happens next

**Body:**

```
Hey {firstName},

Glad to have you. Here's everything in one place.

THE INTERVIEW
- Format: 20 minutes recorded over Zoom or Riverside.
- Questions: I'll send 6 question-stems by {date}; pick the 3 that resonate
  and we riff. Total prep: ~15 minutes.
- Recording window: {date range, 2 weeks}.
- Edit + deliver: I handle. You get a draft to approve.

YOUR ONE EMAIL TO YOUR LIST
- Sent on the day your session goes live ({day, Tier-dependent}).
- I provide the 4-email swipe file (announce → reminder → live → conversion).
  Each one is paste-and-go. Subject line + body + your affiliate link
  pre-populated.

REVENUE SHARE
- 50% of every All-Access Pass sale ($48.50/each) attributed to your
  affiliate link.
- 90-day cookie window from any click on your speaker page or session link.
- Real-time dashboard at /summit/speaker/{slug}/stats (magic link, no
  password). Live numbers from Day 1 onward.

WHAT I NEED FROM YOU BY {date, D-21}
- Headshot (anything, even a phone selfie works).
- One-paragraph bio.
- One paragraph on what you'll cover.
- Social handles (X, LinkedIn, your main publication).
- Confirmed Zoom/Riverside slot from the link below: {scheduling link}.

Reply with "in" if everything above works and I'll send the speaker
agreement PDF for signature.

— Maryan
```

**Why this works:**

- **One email, one place, everything they need.** The speaker doesn't have to ask "what about X." Reduces back-and-forth from ~6 emails to 2.
- **Time investment made fully transparent.** "Total prep: ~15 minutes." Speakers ghost when total time is ambiguous.
- **Affiliate mechanics named.** $48.50/sale, 90-day cookie, real-time dashboard. No fine print.
- **The asset list is bounded and dated.** D-21 deadline. No open-ended "send when you can."
- **Reply trigger is one word.** "Reply 'in' if everything works." Single decision, single action. Same two-option-close discipline as Email 1.

**Tax / agreement note:** the speaker agreement PDF lives at `strategy/summit-speaker-agreement-template.md` (to be drafted at activation; not in this push because it requires legal-review-equivalent decisions about W-9/1099 thresholds that depend on Maryan's accounting setup at the time). For pre-launch reference, the agreement should cover: revenue share terms, 90-day cookie attribution, recording usage rights (perpetual, for All-Access Pass + replays + marketing), opt-out clause (speaker can pull their session within 7 days of recording, no questions), and a 1099 trigger threshold of $600 USD/year (US standard).

---

## Email 4 — The Asset Request (D-21)

Sent 21 days before the speaker's session airs, to any signed speaker who has not delivered all required assets.

**Subject:** {firstName} — 3 weeks out, asset check

**Body:**

```
Hey {firstName},

Three weeks until your session airs. Here's the asset status:

✓ Headshot
✗ Bio (need)
✗ Session topic paragraph (need)
✓ Social handles
✗ Recording slot confirmed (need)

Sending today gets you on Day {N} in the {N-th} slot, which is the best
slot for {Tier-A/B/C/D-specific reason — e.g., "the peak-attendance morning
window" for Tier A; "the day-2 anchor slot opposite Pat Walls" for Tier D}.

Reply with anything that's outstanding and I'll lock it in.

— Maryan
```

**Why this works:**

- **The checklist is visible.** Speakers respond to "here's what's missing" much faster than "could you please send the things I asked for." Visual checklist = lower cognitive load.
- **Each missing asset has a stated consequence in slot terms.** Not "this is important" — "this gets you the peak-attendance morning window." The speaker's incentive (their audience reach) is named.
- **The reply trigger is single-action.** "Reply with anything outstanding." Speaker can paste a single sentence with all 3 missing items.

**Send-rule:** Email 4 fires automatically when D-21 hits AND the `summit_speakers` row has any required asset NULL. If all assets are in, skip Email 4 and send a 2-line acknowledgment instead ("All assets in. Your slot is locked. See you on {date}.").

---

## Pitch failure modes (operator playbook)

The Brunson speaker pitch fails in three recognizable ways. Each has a documented fix.

### Failure mode 1: <3 yeses from first 10 sends

**Symptom:** Email 1 sent to 10 Tier Z + A + D candidates. Fewer than 3 yeses after 7 days.

**Fix:** the {3 names} line is too junior, OR the event timing is too soon. Pause the sequence. Get one Tier D anchor confirmed via X DM or personal intro (not email pitch). Re-send Email 1 v2 with the Tier D name as the lead in {3 names}.

**Anti-pattern:** sending Email 2 to push harder. The pitch isn't pushing-able. The lineup is.

### Failure mode 2: speaker confirms, then ghosts before Email 3

**Symptom:** "Yes, sounds great!" reply. Then silence for 14+ days.

**Fix:** the "yes" was politeness, not commitment. The reply doesn't trigger Email 3 automatically — Email 3 is sent within 24 hours of the yes-reply, and if the speaker doesn't acknowledge Email 3 within 7 days, they are quietly removed from the lineup and the slot opens for the next Tier candidate.

**Anti-pattern:** chasing the ghost with "just checking in" emails. The Brunson rule is that one "yes, sounds great!" without follow-through is a soft no.

### Failure mode 3: speaker delivers recording, then doesn't promote

**Symptom:** Session airs. Speaker's promo email never goes out. Real-time dashboard shows zero clicks attributed.

**Fix:** the swipe file at `strategy/summit-speaker-promo-swipe.md` was supposed to remove the "I don't know what to write" friction. If the speaker still doesn't send, it's not friction — it's reluctance. The next-summit decision is to not invite this speaker back, AND to weight the post-summit case study toward speakers who did promote (so the public proof is filtered to engaged speakers, not silent ones).

**Anti-pattern:** publicly shaming the silent speaker. Bridges the brand wants to keep.

---

## Send-cadence summary

For each candidate:

```
Day 0  → Email 1 (Pitch)
Day 7  → Email 2 (Soft Reminder)   [skip if Tier-D-anchor gate not met]
Day X  → Email 3 (Agreement)        [trigger: speaker says "yes"]
D-21   → Email 4 (Asset Request)    [trigger: any required asset NULL]
```

All four emails are paste-and-go. None require the founder to write anything original. The pitch sequence is **engine-runnable** at activation — drop the candidate list into a queue, the cron handles sequencing, the dashboard tracks state. No founder-time consumed beyond the moment of saying yes/no on each "yes" reply.

---

*Source: DotCom Secrets, Secret #16 (Summit Funnel). Brunson speaker-pitch architecture distilled and customized for UnlockSaaS Reluctant Hero AC. Companion to `strategy/summit-funnel.md`.*
