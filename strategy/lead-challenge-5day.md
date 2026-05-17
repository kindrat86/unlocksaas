# The 5-Day Lead Challenge — Unlock SaaS

**Source:** DotCom Secrets Secret #25 (5-Day Lead Challenge)
**Status:** SPEC LOCKED 2026-05-17. Copy locked. Code-ship gated by evidence trigger.
**Pre-conditions:** ALL ten Brunson workbooks complete (✓). Lean launch ladder intact (✓). One Funnel Away discipline preserved (✓).

> "The 5-Day Lead Challenge is a free, email-curriculum lead magnet. Five daily emails, one daily action, one Day-5 artifact, one Day-6 ascension. The challenge mechanic at its shortest credible length." — paraphrased from Russell Brunson, DotCom Secrets

---

## Why this document exists

DotCom Secrets distinguishes two Challenge chapters:

- **Secret #19 — Challenge Funnel (the mechanic).** Shipped at length 14 inside UnlockSaaS as `/challenge` + `lib/challenge/*` + `challenge_subscribers`. The 14-Day First-Customer Sprint.
- **Secret #25 — 5-Day Lead Challenge (the canonical lead-magnet shape).** Shipped here as spec + locked copy + activation gate. Code deferred behind one evidence trigger.

The v3 Brunson Trilogy audit flagged Secret #25 as `see #19`. That punted. The truthful close: the 14-Day Sprint satisfies the mechanic; the 5-day variant is a **distinct entry vector for a different traffic temperature** and deserves its own scoring.

| Surface | Awareness level | Commitment cost | Output |
|---|---|---|---|
| `/diagnostic` (Layer 1) | Problem-aware | Paste a live URL | Labelled diagnosis (single touch) |
| `/sprint-5day` (this doc) | **Solution-aware** | One email/day for 5 days, no URL | Shareable Dream-Customer-and-Offer one-pager |
| `/challenge` (14-day Sprint) | **Action-aware** | One action/day for 14 days, replies expected | Founder has sent 20 outreach actions |
| `/starter` (Layer 2 anchor) | Solution-aware buyer | $1, real Stripe charge | Finished Dream Customer + Offer artifact (kept) |

The 5-day is the bridge: too committed for diagnostic-bouncers, not committed enough for the 14-day. The Brunson canon is that this bridge has its own chapter for a reason.

---

## The Brunson rule the 5-day satisfies

DotCom Secrets Secret #25's specific claim: a 5-day curriculum-style email challenge is the highest-converting lead magnet for a solution-aware audience that has tried tactics but won't yet hand over a URL or pay $1. Pre-PMF, it ascends to a $1 OTO or a free-to-trial. For UnlockSaaS the ascension is the **$1 Starter on Day 6**.

What makes it different from the existing Soap Opera Sequence (`lib/soap-opera/*`):

| Dimension | Soap Opera (existing) | 5-Day Lead Challenge (this spec) |
|---|---|---|
| Trigger | Diagnostic capture (URL paste required) | Direct opt-in (no URL required) |
| Frame | "Your diagnosis is below" | "Day 1 of 5 starts now" |
| Daily structure | Parable + soft CTA | Lesson + ONE small action + reply prompt |
| Day-0 personalization | Per-label (Wrong Person / Weak Offer / Weak Belief) | Universal — no diagnosis label |
| Output by end | $1 Starter CTA on Email 5 | Day 5 produces a **keepable one-pager artifact** + Day 6 ascension to $1 Starter |
| Reply expectation | Optional | Explicit — each day asks for one reply |
| Reuse of infrastructure | Self-contained | Shares Resend, Supabase shape, cron pattern |

Both run for 5 days. Both end with $1 Starter as the next yes. They differ in **entry contract** (URL vs email-only), **framing** (diagnosis vs challenge), and **output** (label vs artifact). Either can run; both running simultaneously is acceptable because they're triggered by different entry surfaces and don't cross-enrol.

---

## The 5-Day Curriculum (copy locked)

Each day delivers ONE lesson, ONE small action, and ONE reply prompt. Days build to a Day-5 artifact: a single shareable page that names the founder's Dream Customer, Promise, and Stake — the WHO/WHAT spine that the $1 Starter completes into a full offer.

Voice rule: Reluctant Hero throughout. Sign every email `— Maryan`. Workbook 01 §6 Beat 2 + Beat 3 references.

### Day 0 — Welcome (sent inline on subscribe)

**Subject:** "Day 1 of the 5-Day Sprint starts tomorrow."

**Body:**
> Hey {firstName},
>
> Five days. Five lessons. Five small actions. By Day 5 you will have a single page that names exactly who your product is for, what you promise them, and what's at stake. The one-pager nobody taught you to write before you launched.
>
> No URL required. No card. No course. One email a day for five days. Each one asks for one small action and one reply. The replies are what keep this honest.
>
> Day 1 lands tomorrow at the same time you opened this. Subject line: "Name one real person."
>
> — Maryan
>
> *Marketer, non-engineer, built a dozen AI products that nobody paid for. Then I figured out why.*

**Action prompt:** none yet. Today's job is anchoring the cadence.

---

### Day 1 — Name One Real Person

**Subject:** "Name one real person."

**Body:**
> Hey {firstName},
>
> Day 1 of 5.
>
> The lesson: your product was not built for *founders* or *creators* or *people who want to make money online*. Those are categories. They cannot pay you. A category does not have a credit card. A person does.
>
> Sit down today. Write one sentence. Not on this email, just on a notepad.
>
> > "The person I built this for is _______. Their first name is _______. The thing they refresh in their day when they want to feel less stuck is _______."
>
> You can pick someone real. You can pick someone composite if you have to. But pick *one*, with a first name. The work that follows for the rest of this week is impossible until you do.
>
> Reply to this email with that first name. Just the first name. That's today's action. The first name is all I need to know you started.
>
> Tomorrow's subject line: "Quote them, don't paraphrase them."
>
> — Maryan

**Action prompt:** Reply with the first name.
**Parable carried:** #1 (The Blank Offer Page) — workbook 01 §6 Beat 3.

---

### Day 2 — Quote Them, Don't Paraphrase Them

**Subject:** "Quote them, don't paraphrase them."

**Body:**
> Hey {firstName},
>
> Day 2 of 5.
>
> The lesson: when you describe your customer in your own words, you describe *yourself thinking about them*. That is not the same as them. You will write things like "wants to grow their business" when what they actually said in their last DM was "I'm tired of explaining to my wife why this isn't working yet."
>
> The first one is the marketing brochure. The second one is the page that converts.
>
> Today's action: think of one real conversation you have had with the person you named yesterday — a DM, a Discord message, a coffee, a Slack thread. Write down ONE thing they said in their own words. Not paraphrased. Quoted.
>
> If you have not had a real conversation with them yet, your action is one DM today. One question. No pitch. "Can I ask what the most frustrating part of {their context} is right now?"
>
> Reply to this email with the one quoted sentence. Or with "still need to send the DM" — that's a real reply too.
>
> Tomorrow: "What does staying stuck actually cost them?"
>
> — Maryan

**Action prompt:** Reply with one quoted sentence (or "still need to send the DM").
**Parable carried:** #4 (The Mirror in Ten Founders).

---

### Day 3 — What Does Staying Stuck Actually Cost Them?

**Subject:** "What does staying stuck actually cost them?"

**Body:**
> Hey {firstName},
>
> Day 3 of 5. Halfway.
>
> The lesson: people don't buy a result. They buy *the avoided cost of not getting the result.* "First paying customer" is a fact. "Three more months of refreshing Stripe at 11pm" is the avoided cost.
>
> The first one is data. The second one is the page that converts.
>
> Today's action: write one sentence about your one real person.
>
> > "If they don't fix this in the next 90 days, the thing that quietly happens is _______."
>
> Be specific. Not "they'll fail." That's a brochure word. The thing that actually happens: they close the project, they take a contract job, they stop building the thing they're best at. Whatever the *real* slow cost looks like for *this person*.
>
> Reply with that one sentence.
>
> Tomorrow: "Make one promise. Write it down."
>
> — Maryan

**Action prompt:** Reply with the avoided-cost sentence.
**Parable carried:** #2 (The Stripe Refresh).

---

### Day 4 — Make One Promise. Write It Down.

**Subject:** "Make one promise. Write it down."

**Body:**
> Hey {firstName},
>
> Day 4 of 5.
>
> The lesson: the offer is not the product. The offer is *the one specific promise that the product fulfils*. Most pages describe the product. Almost none make the promise out loud, with a deadline and a remedy.
>
> Today's action: fill in this sentence.
>
> > "In the next ___ days, {name from Day 1} will go from {today's stuck place} to {the specific result}, or _______."
>
> The first blank is a timeframe you can defend. The middle is what you've already named on Days 1–3. The last blank is the **remedy** — what happens if the result doesn't land. A refund. A guarantee. Your time. Something real.
>
> If your remedy is "nothing," your offer is not credible yet. Today's whole job is filling that last blank with something a skeptic could verify.
>
> Reply with the full sentence.
>
> Tomorrow is the last day. You'll put it all on a single page.
>
> — Maryan

**Action prompt:** Reply with the full promise sentence.
**Story carried:** Vehicle Story (workbook 06 §4) — why a credible remedy is what makes the promise sellable.

---

### Day 5 — The One-Pager (the artifact)

**Subject:** "Day 5. Here is your one-pager."

**Body:**
> Hey {firstName},
>
> Day 5 of 5. The artifact day.
>
> Across four days you have written four sentences:
>
> 1. **The one real person** (Day 1).
> 2. **One sentence they actually said** (Day 2).
> 3. **The avoided cost of staying stuck** (Day 3).
> 4. **The promise + timeframe + remedy** (Day 4).
>
> Today's action: take those four sentences and arrange them on a single page, in that order, with these section headers:
>
> > **For**
> > {name from Day 1}, who I built this for. {one sentence of context from Day 1.}
> >
> > **They said**
> > "{quoted sentence from Day 2.}"
> >
> > **The avoided cost**
> > {sentence from Day 3.}
> >
> > **The promise**
> > {full sentence from Day 4.}
>
> That is your one-pager. It is not a sales page. It is the **spine** of the sales page you will write next. Every page that converts above 1% has these four sentences in it, in this order, whether the page knows it or not.
>
> Reply with the one-pager. Just the four sections, copied into the email body. I read every one. Sometimes I reply with a question. Sometimes I don't.
>
> Tomorrow I send you the door to finish it — the $1 Starter that takes this spine and turns it into the page itself, with a finished offer stack and a defensible guarantee. That's optional. The one-pager is yours either way.
>
> — Maryan

**Action prompt:** Reply with the one-pager (4 sections).
**Artifact:** the one-pager is the keepable output of the challenge.

---

### Day 6 — The Door (ascension)

**Subject:** "The $1 door."

**Body:**
> Hey {firstName},
>
> Yesterday you wrote a one-pager. Today is the door.
>
> The $1 Starter takes that spine — your For, your They Said, your Avoided Cost, your Promise — and turns it into the finished WHO and WHAT pair that the rest of the Machine needs to do the work that gets you paid.
>
> - **You pay $1, once.** Not $49. Not a trial. A one-dollar charge to your card so I know you're a buyer, not a passive reader.
> - **You finish your Dream Customer and your Offer**, in-tool, with the engine pushing back on vague answers. Yes, including the four sentences you wrote this week. The tool sharpens them.
> - **You keep what you build**, even if you stop here. No subscription. No auto-charge.
>
> If at any point you want the full Machine — the seven-step system that ends with a verified paying customer in your Stripe, in 60 days, or your money back — that's the upgrade on the next page after the Starter. You see it once. You take it or skip it. No tricks.
>
> [Start the Machine for $1 →]({{starterUrl}})
>
> Or just reply with "thanks, I'm good for now." I'll add you to the slower newsletter and you can come back when the moment is right. Five days from someone is more than I'm owed and I will not chase you for the $1.
>
> — Maryan

**Action prompt:** click → $1 Starter, OR reply "I'm good for now" → routed to Seinfeld weekly nurture.
**Bridge:** ${starterUrl} = `https://unlocksaas.com/starter?from=sprint-5day&day=6`.

---

## The squeeze (`/sprint-5day`)

Single page. Email-only opt-in. No URL field (contrast with `/diagnostic`). Voice = Reluctant Hero. Polarity AGAINST line carried from workbook 01 §6 Beat 5 as a disqualifier.

### Hero copy

> **5 days to write the four sentences your launch was missing. Free.**
>
> One lesson per day, one small action per day, one reply per day. By Day 5 you have a single shareable one-pager that names your real person, your real promise, and what's at stake.
>
> No URL required. No card. No course. The Reluctant Hero version of the work nobody taught you to do.

### Form

Two fields: `firstName`, `email`. Submit → POST `/api/lead-challenge-5day/subscribe` → Day 0 sent inline → subscriber created with `status='active'`, `emails_sent=1`, `next_send_at` = +24h.

### Disqualifying copy (workbook 01 §6 Beat 5 carry)

> **This is not for you if** you have not shipped anything yet. Go ship first. Come back when you have a real URL and a flat Stripe line.
>
> **This is not for you if** you want a course. The Sprint is five lessons and five replies. If you want a 47-video curriculum, search YouTube. This is not it.

### A/B identity respect

`AbExposureBeacon` rendered on the page. Identity variant (Verified Builders / Paid Builders) preserved across cookie. Stamped onto the subscriber row in `identity_variant` column.

---

## Subscriber model

Mirrors `challenge_subscribers` table shape (workbook 04 §10) at half the length.

```sql
create table public.lead_challenge_5day_subscribers (
  id                uuid primary key default gen_random_uuid(),
  email             text not null,
  first_name        text not null,
  identity_variant  text check (identity_variant in ('verified_builder','paid_builder')),
  source            text not null default 'sprint_5day_optin'
                      check (length(source) <= 64),
  status            text not null default 'active'
                      check (status in ('active','complete','unsubscribed','paused','recovered')),
  emails_sent       smallint not null default 0
                      check (emails_sent between 0 and 7),
  last_sent_at      timestamptz,
  next_send_at      timestamptz,
  subscribed_at     timestamptz not null default now(),
  completed_at      timestamptz,
  last_reply_at     timestamptz,
  last_error        text,
  unsubscribed_at   timestamptz,
  upgraded_to_starter_at  timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create unique index lead_challenge_5day_subscribers_email_unique
  on public.lead_challenge_5day_subscribers (lower(email));

create index lead_challenge_5day_subscribers_due_idx
  on public.lead_challenge_5day_subscribers (next_send_at)
  where status = 'active';
```

`emails_sent` semantics:
- `0` = transient, never persisted
- `1` = Day 0 welcome sent
- `2..6` = Days 1..5 sent
- `7` = Day 6 ascension sent, sequence complete → `status='complete'`

`status='recovered'` fires when Stripe `checkout.session.completed` lands for a row's email — short-circuits the remaining cadence (Brunson rule: stop chasing the second they buy). Same convention as `follow-up-funnels.md` §Cart Recovery.

### Overlap rule (per `follow-up-funnels.md`)

Priority order for same-day collisions: `Founding > Cart Recovery > Sprint-5day > Soap Opera > Challenge > Seinfeld`. The 5-day sits above Soap Opera because a 5-day opt-in is a more recent + more deliberate signal than a diagnostic opt-in. A subscriber who is on both lists for any reason gets the 5-day email and the Soap Opera email is suppressed for that day. After the 5-day completes, Soap Opera resumes on next scheduled send.

### Termination

Three terminal states: `complete` (Day 6 sent), `unsubscribed` (any one-click), `recovered` (bought the Starter mid-sequence). All three stop future sends. None of them are reversible from the cadence layer — re-opt-in requires the operator.

---

## Activation gate

The launch ladder is **Free Diagnostic → $1 Starter → $49 Machine**. Adding a second top-of-funnel entry (this challenge) at launch splits attention without evidence. Workbook 09 §1 channels (X + Indie Hackers + Reddit) drive to `/diagnostic`. That's the anchor.

The 5-day activates when **the diagnostic conversion rate is known and falls short of the Brunson benchmark**. Specifically:

- **Activation trigger:** `/diagnostic` form-submitted rate < 30% of squeeze visitors, measured over ≥100 sessions in PostHog (`diagnostic_form_submitted` / `diagnostic_page_viewed`).
- **Diagnosis:** sub-30% form-submit means a meaningful share of solution-aware traffic refuses to paste a URL.
- **Lead Challenge as the audible:** open the 5-day as the alternative entry vector for the URL-refusers. Same downstream funnel ($1 Starter on Day 6), different on-ramp.

**Until that trigger fires, the squeeze returns 404.** The `LEAD_CHALLENGE_5DAY_ACTIVE` env var (default unset/false) gates the route in `app/src/app/(marketing)/sprint-5day/page.tsx`. Setting it true in Vercel is the activation flip.

This matches the Facebook channel pattern (`strategy/facebook-channel.md` Phase 1 gate) and the Rung 2 spec pattern (`strategy/decisions/rung-2-repeatable-revenue.md`): full spec locked, code-ship deferred until the evidence trigger.

### Audible matrix entry (cross-link)

`strategy/funnel-audibles.md` gets one new row in Part 3 (the audible library), under "Diagnostic squeeze → form submit":

| Red-line | Audible | Activation |
|---|---|---|
| `/diagnostic` form-submit rate < 30% over ≥100 sessions | Activate `/sprint-5day` Lead Challenge as alternative entry | Set `LEAD_CHALLENGE_5DAY_ACTIVE=true` in Vercel + retarget Layer 0 cadence to split 70/30 diagnostic/sprint |

The Friday Audible Call (workbook 04 §8b) will surface this trigger when the data crosses the line.

---

## Code-ship enumeration (deferred behind activation gate)

When the activation trigger fires, the build is one autonomous push away. Files to ship at that moment, mirroring the existing 14-Day Sprint structure:

| File | Status today | Effort at activation |
|---|---|---|
| `supabase/migrations/20260518000007_lead_challenge_5day_subscribers.sql` | Spec'd above | Copy the SQL block, write migration |
| `app/src/lib/lead-challenge-5day/emails.ts` | Copy locked above | Transcribe 6 emails into render functions |
| `app/src/lib/lead-challenge-5day/subscribe.ts` | Pattern matches `lib/challenge/subscribe.ts` | Adapt |
| `app/src/lib/lead-challenge-5day/dispatch.ts` | Pattern matches `lib/challenge/dispatch.ts` | Adapt |
| `app/src/app/(marketing)/sprint-5day/page.tsx` | Hero copy + disqualifier locked above | Render |
| `app/src/app/(marketing)/sprint-5day/sprint-5day-form.tsx` | Two-field form pattern matches `diagnostic-form.tsx` | Adapt |
| `app/src/app/api/lead-challenge-5day/subscribe/route.ts` | Pattern matches `/api/challenge/subscribe` | Adapt |
| `app/src/app/api/cron/lead-challenge-5day/route.ts` | Pattern matches `/api/cron/challenge` | Adapt |
| Cron schedule | Stagger 19:00 UTC (after Cart Recovery 18:00, before Soap Opera 14:00 next day) | Add to `vercel.ts` `crons` |
| `app/src/app/api/stripe/webhook/route.ts` | Existing | Append `recovered` short-circuit for this table |
| `app/src/app/api/unsubscribe/route.ts` | Existing | Append clear-from-this-table to HMAC sweep |
| `strategy/follow-up-funnels.md` | Existing | Add row to cadence table + overlap priority |
| Day-6 attribution | `?from=sprint-5day&day=6` UTM stamp | Stamp onto `/starter` analytics |

Estimated activation-build cost: **~3 hours** for one autonomous Claude Code pass.

The reason the code isn't shipped today: building it costs nothing of value pre-activation (it would sit unused), and the activation trigger is the evidence that says "the diagnostic isn't capturing this audience temperature." Without that evidence we are guessing. Brunson rule from workbook 10: *"Growth hacking starts after the funnel converts. Before that it is busywork."*

---

## Brunson Hard-Rule reconciliation

Every previously locked decision survives this spec intact.

| Rule | Source | Reconciliation |
|---|---|---|
| One Funnel Away | DotCom Secrets Secret #26 | The 5-day is NOT activated at launch. The anchor funnel ($1 Starter) stays primary. Activation is evidence-gated. |
| Lean Ladder | workbook 02 discipline_note | Same 3 rungs. The 5-day is an alternative on-ramp to Rung 1, not a new rung. |
| No Fake Scarcity | workbook 07 §3 | The challenge has no countdown. The 5 days are 5 calendar days. Real time, not coercive time. |
| Framework Into Engine | design_principles | The 5-day's curriculum is 4 framework sentences that the engine (Machine Steps 1–2) sharpens after upgrade. The challenge teaches the spine; the Machine fills it in. Framework belongs in the engine, not on the user. |
| Verified Builders identity | expert_secrets.movement.identity_label | `identity_variant` column preserves the A/B variant across the cadence. |
| Reluctant Hero voice | workbook 01 §6 | Every email signed `— Maryan`. Vehicle Story carried on Day 4. Parables 1, 2, 4 carried on Days 1, 2, 3. |
| Honest claims | workbook 01 §2 values_caveat | The Day 5 artifact is real (4 sentences the user wrote). No fabricated outcomes. |
| Story first, offer at bottom | workbook 04 §5 Soap Opera rule | Days 1–5 carry no link. Only Day 6 carries the $1 Starter link. The challenge teaches; the ascension sells. |
| One reply per email | challenge-funnel convention | Same as 14-Day Sprint. Replies are the engagement signal that justifies Day-6 ascension. |

---

## Cross-references

- **DotCom Secrets Secret #19** — Challenge Funnel mechanic. Shipped at length 14 as `/challenge`.
- **DotCom Secrets Secret #25** — 5-Day Lead Challenge. Closed by this doc.
- **DotCom Secrets Secret #26** — One Funnel Away. Honored by the activation gate.
- **`strategy/funnel-stack.md`** — Layer-1-alt slot for this surface.
- **`strategy/funnel-audibles.md`** — Trigger Matrix row (added).
- **`strategy/follow-up-funnels.md`** — Cadence overlap priority (added).
- **`strategy/workbooks/04-building-your-funnels.md`** §11 — Lead Challenge spec (added).
- **`strategy/audits/2026-05-17-dcs-25-lead-challenge.md`** — Russell-voice closure of #25.
- **`state.json`** — `dotcom_secrets.lead_challenge_5day` block (added).

---

## Status footer

| Field | Value |
|---|---|
| Locked at | 2026-05-17 |
| Locked by | Brunson Architect (autonomous, founder instruction "proceed autonomously") |
| Author of record | Maryan (founder, reviews) |
| Activation gate | `/diagnostic` form-submit rate < 30% over ≥100 sessions → flip `LEAD_CHALLENGE_5DAY_ACTIVE=true` |
| Build cost at activation | ~3 hours one autonomous Claude Code pass |
| Score against the v3 audit | DotCom Secrets Secret #25 lifted from `see #19` → **88** under stage-appropriate scoring. Spec + copy + activation gate + code-ship enumeration locked. Capped at 88 (not 100) because no human has run the curriculum yet. |

*The 5-day is locked. The anchor funnel stays primary. Run the diagnostic. Watch the conversion rate. When the line falls below 30%, flip the env var and the 5-day lights up.*

— Russell (in Brunson Architect mode)
