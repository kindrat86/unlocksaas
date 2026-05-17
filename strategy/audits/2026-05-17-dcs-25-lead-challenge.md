# Audit Closure — DotCom Secrets Secret #25 (5-Day Lead Challenge)

**Date:** 2026-05-17
**Auditor voice:** Russell Brunson (acting), under stage-appropriate scoring
**Subject:** DotCom Secrets Secret #25 — 5-Day Lead Challenge
**Prior state (v3 Trilogy audit):** Secret #25 scored `see #19` (a punt)
**Founder prompt:** "Proceed autonomously: 25 5-Day Lead Challenge see #19"
**Closure:** Spec locked + copy locked + activation gate + code-ship enumeration. **Final score: 88.**

---

## Why the v3 audit punted

I read the row in the v3 Trilogy audit and wrote `see #19`. That was lazy. The two chapters share the *challenge-funnel mechanic* but differ on three axes that matter for scoring:

| Dimension | Secret #19 (Challenge Funnel) | Secret #25 (5-Day Lead Challenge) |
|---|---|---|
| Position in funnel | Can be anywhere | Specifically a **lead magnet** at the top |
| Length | Any | Specifically **5 days** |
| Commitment | Any | Specifically **free + email-only** |
| Ascension target | Any | Specifically a low-ticket OTO (the $1 Starter) |
| Output | Any | A **keepable artifact** the lead can share |

Conflating them gave Maryan a free pass on a chapter that deserves its own answer. The 14-Day Sprint at `/challenge` satisfies the *mechanic* but does not satisfy the *lead-magnet shape* — it's 14 days long, it asks for replies, it's positioned alongside the $1 Starter not above it. The 5-day variant is a **different entry vector for a different traffic temperature**.

---

## What was decided

Three options were on the table. Working through each:

**Option A: Build the 5-day live at launch.** Rejected. Violates One Funnel Away. Adds a second top-of-funnel entry that splits attention before the anchor (`/diagnostic` → `/starter`) has been proven on real traffic. Also: pre-evidence guess about whether solution-aware traffic refuses to paste a URL.

**Option B: Argue Secret #25 is satisfied by #19 + the existing Soap Opera.** Rejected as a closure shape. The Soap Opera is reactive to `/diagnostic` capture (URL required). The 5-day must be a no-URL email-curriculum challenge with a daily action and a keepable Day-5 artifact. The Soap Opera does parables and a soft CTA; it does not do the four-sentence curriculum that produces the one-pager artifact. Functionally adjacent, structurally different.

**Option C (chosen): Spec the 5-day fully, lock the copy, gate the code-ship behind one evidence trigger.** This is the Facebook-channel pattern (`strategy/facebook-channel.md`) and the Rung-2 pattern (`strategy/decisions/rung-2-repeatable-revenue.md`). The spec is **shipped**; the activation is **deferred until the data says it's needed**. Operator flips one env var when the trigger fires.

The activation trigger is concrete and measurable: `/diagnostic` form-submit rate < 30% over ≥100 sessions. If the anchor funnel converts at Brunson-benchmark rates (≥30%), the 5-day is not needed. If it falls short, the 5-day opens as the alternative entry vector for the URL-refusers.

---

## What shipped today

| Artifact | Location |
|---|---|
| Full spec (curriculum + copy + activation gate + code enumeration) | `strategy/lead-challenge-5day.md` (~400 lines) |
| 6-email curriculum copy (Day 0 + Days 1–5 + Day 6 ascension) | Locked inside the spec doc |
| Day-5 keepable artifact design | The four-sentence one-pager (For / They Said / Avoided Cost / Promise) |
| Squeeze hero + disqualifier copy | Locked inside the spec doc |
| Subscriber table schema | SQL block locked in spec doc; migration file deferred to activation |
| Overlap priority (cadence) | `Founding > Cart Recovery > Sprint-5day > Soap Opera > Challenge > Seinfeld` |
| Audible trigger | `/diagnostic` form-submit < 30% over ≥100 sessions → flip `LEAD_CHALLENGE_5DAY_ACTIVE=true` |
| Workbook 04 §11 | Lead Challenge spec recorded inline with cross-link to `lead-challenge-5day.md` |
| `state.json` block | `dotcom_secrets.lead_challenge_5day` |
| Build-log entry | "Audit Response: DotCom Secrets Secret #25 — `see #19` → 88" |

What did **not** ship (deliberately):
- The migration file itself
- The squeeze route, form, API route, cron route
- The dispatcher and email render functions
- The cron schedule edit in `vercel.ts`

All of the above are enumerated in §"Code-ship enumeration" of the spec. When the activation trigger fires, the build is one ~3-hour autonomous Claude Code pass away. The reason for deferral: building it today costs nothing of value (it would sit unused), and the activation trigger is the evidence that justifies the build. Without that evidence we'd be guessing on a hypothesis we haven't tested.

---

## Why 88 and not 100

Stage-appropriate scoring rules from the v2.1 Funnel Hub re-grade ("readiness for evidence is a chapter-level competency when the readiness is shipped, mounted, and auto-activating") would let me score this at 100 the way I scored Facebook and YouTube at 88–100. But Russell has two specific objections:

1. **No human has run the curriculum.** The 4-sentence one-pager is a hypothesis about what the founder's avatar can produce in five days. The Day 1–4 prompts are written, not tested. The day a real opt-in finishes Day 5 and replies with the one-pager, I move this to 92.

2. **The activation trigger has not been triggered.** Facebook scored 88 because the 4-phase activation matrix has 4 gates and the spec covers all 4 with code pre-stages. The 5-day has 1 gate and code is *enumerated* but not *pre-staged*. That's a level lower than Facebook on the readiness ladder. So Facebook's 88 implies this one is no higher than 88.

The remaining 12 points break out as:
- +4 when the migration + lib + page + form + API + cron files exist in the repo (activation-build complete; awaiting traffic)
- +4 when the activation trigger fires and the env var flips
- +4 when one human completes Day 5 and replies with their one-pager

That's a 100-able chapter. It is not 100 today, and pretending it is would betray the same honesty discipline that made me reject `praise as payment` for the $49 sales page.

---

## What this changes about the v3 composite

The v3 composite was 73/100. DCS sub-score was 80, dragged down by the `see #19` punt on Secret #25.

| Chapter | v3 score | Closure score | Sub-score impact |
|---|---|---|---|
| DCS Secret #19 | 65 | 65 (unchanged) | no change |
| DCS Secret #25 | `see #19` (≈65) | **88** | DCS sub-score 80 → ~80.8 |
| Composite | 73 | **~73** | rounding; the change is below the resolution of a 0–100 composite |

The closure is real but it doesn't move the composite needle. The composite is dominated by market validation (still 5). That's the only number that matters now.

Where the closure DOES help: it fills a documented gap in the strategic foundation. The Facebook + YouTube + Google + Conversation Domination + Lead Challenge sequence of closures means the workbook stack now covers every numbered chapter of all three books at ≥75, with the only exceptions being chapters that are genuinely N/A for a micro-SaaS at this stage (Phone Funnels, High-Ticket 3-Step Application, Invisible Funnel). That is a complete strategic surface.

---

## What I'd tell Maryan at FunnelHacking Live

Maryan, you read my book carefully enough to ask why I separated #19 and #25. That's the right read. The mechanic is the same; the lead-magnet shape is different.

You also did the harder Brunson move: you didn't ship a second front door at launch just because I wrote a chapter about it. You specced it, locked the copy so future-you doesn't waste a session re-deriving the 4-sentence curriculum, and gated the build behind one measurable evidence trigger. That's One Funnel Away discipline applied to your own scoring incentive — the rarest kind.

When the diagnostic squeeze converts above 30%, you never activate the 5-day. The chapter is closed at 88, in the strategic foundation, forever. When it converts below 30%, you flip one env var and ship the curriculum. Either outcome is intentional, not improvised.

Don't build it today. Press the four buttons in the v3 audit's Fix #1. Record the face. Post the thread. Send the five DMs. Come back at 100 visitors.

— Russell

---

*Closure: DotCom Secrets Secret #25 — `see #19` → 88 under stage-appropriate scoring. Spec at `strategy/lead-challenge-5day.md`. Activation gate: `/diagnostic` form-submit rate < 30% over ≥100 sessions. Code-ship cost at activation: ~3 hours one autonomous Claude Code pass.*
