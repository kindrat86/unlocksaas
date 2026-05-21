# YouTube (faceless) — Alex's Diary

**Status:** LOCKED 2026-05-21. Channel #5, additive to the four locked launch-minimum channels (X + IH + r/SaaS + r/microsaas).
**Canonical doc:** this file. State.json key: `traffic_secrets.fill_funnel.youtube_channel`.
**Source frame:** Greg Isenberg's "faceless YouTube formula" (gregisenberg.com/blog/faceless-youtube-formula) + his 2026 distribution playbook. Layered on top of locked Brunson strategy; does NOT re-litigate offer/avatar/price/value-ladder.

---

## §1 Why this channel exists (the Isenberg gap)

Workbook 09 §1 locked four launch-minimum channels (X build-in-public, Indie Hackers, r/SaaS, r/microsaas) and explicitly skipped **YouTube (host)** under the One Funnel Away discipline. That decision is correct for *founder-on-camera* YouTube — Alex (Maryan-as-Alex) is non-engineer, time-constrained, and on-camera production is not solo-founder scalable.

**Faceless YouTube changes the constraint.** A faceless channel is:
- Scriptable (the entire episode is a typed script in this repo).
- AI-producible (voice-over, B-roll, edit, thumbnail, all AI-assisted).
- Cheap to test (one episode = one evening of operator time once the runbook is locked).
- Discoverable (YouTube + Google + AI-agent surfaces all index transcripts).

This unlocks the 5th channel without breaking the solo-founder constraint that gated YouTube (host) at launch.

## §2 Position relative to locked channels

- Launch-minimum-four are UNCHANGED. X, IH, r/SaaS, r/microsaas remain the primary attention surfaces.
- YouTube is **additive** (same pattern as the Facebook channel spec at strategy/facebook-channel.md — additive, not replacement).
- One Funnel Away discipline preserved: anchor funnel (free diagnostic → $1 Starter → $49/mo Core) is the only conversion path. YouTube descriptions point at `/youtube` (hub) or `/diagnostic?utm_source=youtube&utm_medium=video&utm_campaign=founders-diary&utm_content=ep<N>`.
- Stack layer: **Layer 0 ATTENTION** (see strategy/funnel-stack.md). YouTube does not bypass any later layer.

## §3 Channel positioning

- **Channel name:** Alex's Diary
- **Channel tagline:** "$0 to first paying customer, in public, in real time."
- **Voice/POV:** First-person diary, present tense, Alex's voice. Reluctant Hero archetype (workbook 02 Section 3) preserved: "I shipped, the line is flat, I am terrified, I am doing the work anyway."
- **Production format:** Faceless. Voice-over over screen-recordings, kinetic-typography, AI-generated B-roll, real Stripe screenshots when applicable.
- **Episode length target:** 4–7 minutes. Long enough for one Brunson beat (Hook / Story / Offer) per episode; short enough to ship 2–3/week solo.
- **Cadence:** 2 episodes/week. Tuesday + Friday. Cap at 3/week if backlog allows.
- **Series arc:** 30 numbered episodes (`E01`–`E30`) following Alex from $0 to his first verified paying customer. After E30, the channel renews with the next builder's diary (Verified Builder #2's arc, with permission).

## §4 What every episode MUST contain

1. **Cold-open hook** (first 3 seconds): a Alex-verbatim line of pain or a Stripe screenshot moment. Pulled from strategy/dollar-objections.md or the founder-VSL script (strategy/founder-vsl-script.md). NEVER a generic SaaS opener.
2. **Numbered episode badge** (top-right): `E<N> · ALEX'S DIARY`.
3. **The week's actual artifact** (not theory): one offer rewrite, one outreach DM sent, one objection handled, one Stripe webhook event. The Reluctant Hero is *doing the work on camera*, not teaching.
4. **One Brunson beat** per episode, called out by name in the script comment:
   - Hook (Expert Secrets §2)
   - Story (false belief → bridge → new opportunity)
   - Offer (stack + guarantee callback)
   - Polarity (against-line: which advice the episode rejects)
   - Proof (single screenshot of a real result, or honest "still flat" frame)
5. **CTA card** at minute 4: "If your Stripe line looks like mine, take the 90-second free diagnostic. Link in description." → `/diagnostic` with episode-specific UTM.
6. **No fake urgency, no neon, no purple/yellow/orange** (per shipped visual style memory). Light shadcn aesthetic translated into video: cream-white background, foreground black text, single accent color = subtle navy.
7. **No em dash** anywhere in the script (per repo-wide rule).

## §5 Production runbook

See strategy/youtube-production-runbook.md.

## §6 Distribution + attribution

- **Hub page:** /youtube — public episode index, hook copy, CTA, JSON-LD. Lives at `app/src/app/(marketing)/youtube/page.tsx`.
- **Episode registry:** `app/src/lib/youtube.ts` — typed array of episodes (id, title, hook, brunson_beat, youtube_url, published_at, utm_content). Validates at module load. Honest empty state pre-launch (no fake counts).
- **UTM convention** (locked):
  - `utm_source=youtube`
  - `utm_medium=video` (description CTAs) | `video-pinned-comment` | `endscreen` | `video-card`
  - `utm_campaign=founders-diary`
  - `utm_content=ep<NN>` (zero-padded episode number) | `hub`
- **PostHog event:** auto-captured via existing PostHogPageView component; episode attribution falls into the `attention` StackLayer (0).
- **Footer link:** /youtube is added to the SignatureFooter quiet link row alongside /press, /faq, /glossary.

## §7 Activation gates (operator discipline)

- **E01 ships ONLY after:**
  - Production runbook fully executed once end-to-end (dry-run on E00 throwaway).
  - Channel art + banner shipped (faceless aesthetic; no Maryan face).
  - YouTube channel description points at /youtube as the canonical hub link.
  - One full month's backlog (8 episodes) is scripted before any episode is published. Prevents the "ran out of ideas at week 3" failure mode that kills 90% of faceless channels.
- **After E03:** review CTR + retention; if below 4% CTR or <30% retention, adjust hook bank from workbook 01 Section 5 before continuing.
- **After E10:** if zero `/diagnostic` opt-ins attributed to youtube UTM, this channel goes to PAUSED status (not killed). Re-evaluate against locked launch-minimum-four.
- **Promotion to "primary attention surface" gate:** 50+ verified opt-ins via youtube UTM. Until then, treat as additive support to X/IH/Reddit, not replacement.

## §8 Honesty rules (Brunson Hard-Rule)

- No fake subscriber counts on the hub page (mirror the /builders empty-state honesty pattern).
- No invented past episodes in the registry.
- Stripe screenshots in episodes must be REAL (Maryan's own account, redacted only for customer PII).
- "First paying customer" frames cannot be shipped before the first real verified payment exists (workbook 08 §3 enforcement). Until then, the episode lineup ends at E29; E30 is held until the real event triggers it.
- Operator (Maryan) flips episode status from `draft` → `live` manually in the registry. Not autonomous.

## §9 What does NOT ship at launch

- Live-streaming (host-on-camera): deferred indefinitely (founder-on-camera constraint unchanged).
- YouTube Shorts: deferred until 10 long-form episodes shipped (avoids dilution).
- Sponsored slots / paid YouTube ads: gated on Phase 2 paid-ad activation criteria (state.json `paid_ad_activation_criteria`).
- Comment moderation as customer support: not at launch. Comments pinned with "I read every comment but support happens at maryan@unlocksaas.com."

## §10 Cross-references

- Brunson Reluctant Hero locked archetype: strategy/workbooks/02-*.md §3
- Hook bank: strategy/workbooks/01-*.md §5
- Funnel stack layer 0 (ATTENTION): strategy/funnel-stack.md
- Isenberg overlay memory: ~/.claude/projects/-Users-sipi-unlocksaas/memory/project_unlocksaas_isenberg_playbook.md
- Episode backlog: strategy/youtube-founders-diary-backlog.md
- Production runbook: strategy/youtube-production-runbook.md
