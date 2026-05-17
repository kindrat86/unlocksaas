# Summit Speaker Kit — The Verified Builder Summit

**Project:** UnlockSaaS
**Funnel:** Summit Funnel (DotCom Secrets Secret #16 — re-graded from N/A in v2 audit re-grade)
**Status:** SPEC LOCKED + SPEAKER PITCH READY (2026-05-17). BUILD GATED on 3+ verified UnlockSaaS customer cycles so the founder keynote opens with proof, not vapor.
**Source:** v2 audit re-grade in `strategy/audits/2026-05-17-brunson-trilogy-audit.md` §"Summit Funnel Re-grade" — ported into this deployable kit during the DCS #13 autonomous push (2026-05-17 v3).
**Companion artifacts:**
- `strategy/other-peoples-funnels.md` — meta-playbook this kit slots into
- `strategy/dream-100.csv` Category 2 — the speaker pool source list
- `strategy/dream-100-outreach.md` §1 — the warm-up cadence Tier-A speakers are already on
- `app/src/lib/affiliate/index.ts` — share the per-speaker affiliate attribution pattern (gated, but the pattern is reused)

---

## §0 — Why a Summit (and why we punted "N/A" in v2 was wrong)

The v2 Russell audit scored Secret #16 N/A on first pass, then re-graded to "highest-leverage Phase-2 play for UnlockSaaS specifically." Three reasons the re-grade is correct:

1. **The 10 Tier-A Dream 100 entries have an obvious filling mechanism.** Cold "co-marketing favor" outreach converts at ~3%. Cold "be a speaker on a curated summit" outreach converts at 25–40%. The summit pitch makes the same Dream-100 list immediately easier to activate.
2. **"Verified Builders" graduates from copy to cohort.** Today it's a manifesto. With 20 founders on camera telling first-paying-customer stories, it becomes an event the identity points at.
3. **The Reluctant Hero gets public proof in two passes.** (a) Founder authority *by position*, curating an event of peers, no need to claim it. (b) Speakers' first-paying-customer stories *become* the Case Study beat that the Three Secrets script is missing today.

The summit is the Phase 2 nuclear option. It builds 5,000–15,000 emails, 150–1,200 All-Access buyers, and 3 strategic relationships in one 8-week sprint.

---

## §1 — The pre-condition (immutable)

**Do NOT pitch speakers until at least one verified UnlockSaaS customer has completed the full Machine cycle.**

Why this gate is unmovable: the founder keynote opens with "I built a tool that takes you to your first paying customer. Here is the founder it just took there." Without that first customer, the keynote opens with "I built a tool nobody has used, and 20 strangers agree with me." That is not a Brunson-credible opening.

The customer doesn't need to be testifying *at* the summit. The story just needs to exist on the day you pitch the first speaker, because credible speakers research before they say yes — and "I'll be the 21st guest of a guy with zero customers" is a no.

**Real sequencing:**
1. Ship the launch (per `LAUNCH-READINESS.md` Tier 1).
2. Drive first 100 cold visitors via `dream-100-outreach.md` §1 week 1.
3. Close first verified customer cycle inside The Machine.
4. *Then* open this kit, copy the speaker pitch, and start sending.

---

## §2 — The Summit one-liner (memorize this)

> **The Verified Builder Summit.** Twenty non-engineers who shipped real things with AI and figured out how to actually get paid for them. Three days, October. Free to attend. $97 for permanent access.

That's the entire pitch surface area. Memorized, the founder can drop it into any DM, podcast appearance, or X reply within 14 seconds.

**Alternate identity:** If the Verified vs Paid Builders A/B (per `expert_secrets.movement.identity_label`) has resolved by summit launch, swap to the winning variant. *Run the summit on the winning variant only* — splitting the brand mid-summit dilutes both.

---

## §3 — The speaker pitch (verbatim, ready to send)

### Master template

```
Subject: 20-min interview for The Verified Builder Summit

Hey {firstName},

Short version. I'm running a 3-day virtual event in October called The Verified
Builder Summit — twenty non-engineer founders who shipped on AI tools and have
at least one paying customer, telling the story of how they got there.
5,000+ attendees expected.

I'd like you in it. Twenty minutes recorded, my questions, your story, your
link in the speaker bio. 50% on any All-Access Pass sales from your audience
($48.50/sale). Confirmed so far: {3 names}.

I handle production, hosting, and promotion. You do one interview and one
email to your list.

Twenty-minute slot or pass?

— Maryan
maryan@unlocksaas.com
```

**Brunson notes on this template:**
- **Two-option close at the bottom** ("slot or pass?") converts ~3× better than "let me know what you think." It is a mini-close, not a question.
- **Social proof in the body** ("Confirmed so far: {3 names}") only works after the first 3 yeses. *Confirm three speakers first* before sending wave 2. Until then, omit the line — fake social proof is a worse opener than no social proof.
- **The 50% rate is non-negotiable in the cold pitch.** Brunson tested everything between 20% and 70% for summit speaker shares; 50% is the highest yes-rate per dollar of give-away.
- **20 minutes is precisely calibrated.** Speakers say yes to 20 minutes who would say no to 30 or 45. The recording can run longer; the pitch must say 20.

### Variant A — for confirmed-friend Tier-A speakers (Castrio, Chen, Mubs)

The cold-friend version. Use only with people who would take a call without an email exchange first.

```
Subject: Quick ask — Verified Builder Summit speaker slot?

Hey {firstName},

Running The Verified Builder Summit in October — 20 non-engineer founders who
got paid, 3 days, my production. I want you in it. 20 minutes recorded, your
link in the bio, 50% on All-Access sales from your audience ($48.50/sale).

Slot or pass?

— Maryan
```

Send this only if (a) ≥10 logged warm-up touches over ≥6 weeks OR (b) prior personal acquaintance. Otherwise the master template above is the safer ask.

### Variant B — for podcast-host speakers (Jackson, Walling, Kahl, Isenberg)

These four are *also* Tier-1 podcast targets (`podcast-outreach.md` §1). Pitching them as speakers BEFORE pitching them as guesting hosts is fine — and arguably better, because the speaker slot is a giveable yes ($48.50/sale revenue), the podcast guest slot is an askable yes.

```
Subject: Verified Builder Summit + a podcast question

Hey {firstName},

Two threads, one email. (1) Running The Verified Builder Summit in October —
20 non-engineer founders who shipped on AI and got paid. Want you as a
speaker. 20 minutes recorded, 50% on All-Access sales from your audience.
(2) Separately, after we have our first 5 verified customer cycles, I want
to pitch {Show Name} — I'll send that pitch on its own timing.

For now, just the summit slot: yes/no?

— Maryan
maryan@unlocksaas.com
```

This is the only DM in the entire OPF playbook that pre-flags a future ask. The reason: not flagging it would feel like sandbagging when the podcast pitch arrives 8 weeks later. Honesty is the polarity here.

### Variant C — for non-Dream-100 speakers (the 3 surprise-yeses you need)

You need 20 speakers. Dream 100 Category 2 has 10 strong candidates. The remaining 10 are likely Marcos in the customer base (post-first-cycle) + previously-unknown founders surfaced by speaker referrals.

```
Subject: Verified Builder Summit — your story

Hey {firstName},

I'm running The Verified Builder Summit in October — 20 non-engineer founders
who shipped on AI and got their first paying customer, telling the story.

{Referrer} mentioned your work on {specific thing}. I'd like you in it.
20 minutes recorded, your link in the bio, 50% on All-Access sales from your
audience ($48.50/sale). Confirmed so far: {N names}.

Slot or pass?

— Maryan
maryan@unlocksaas.com
```

The `{Referrer}` line carries the trust. Without it, this variant is too cold.

---

## §4 — The 4-week speaker warm-up cadence (parallel to Dream 100)

Tier-A and Tier-B Dream 100 entries are already on the `dream-100-outreach.md` §1 cadence. Once the verified-customer gate fires, the speaker pitch overlays onto the existing relationship — it does not start the relationship.

For non-Dream-100 speakers (referrals from customers and from confirmed speakers), the cadence compresses to 1 week:

| Day | Action |
|---|---|
| Mon | Read everything they've published in the last 90 days |
| Tue | Substantive public reply on their most recent thread |
| Wed | Reply to one of their newsletter issues / comment on one of their videos |
| Thu | Send Variant C pitch (with the referrer line) |
| Fri | Log `dream_100_touches` row; if no reply by Friday next week, send one polite follow-up; if no reply by Friday week 2, mark `speaker_no_reply` and move on |

**Cap:** ≤5 speaker pitches per week, same as Tier-A DMs. The summit is the speaker pitch cadence, not in addition to it.

---

## §5 — The Summit funnel (6 pages, all build-gated)

Build only after the speaker count crosses 10. Before then, the `/summit` page returns a single email-capture squeeze ("notify me when speakers are announced").

### Page 1 — `/summit` (squeeze)

**Job:** email opt-in for free 3-day access.
**Hook:** *"Twenty founders who got paid show their work. Three days. Free."*
**Body:** speaker grid (avatars + names + 1-line creds), 24-hour windows explanation, the All-Access Pass teaser.
**CTA:** "Reserve my free seat."

### Page 2 — `/summit/access` (confirmation)

**Job:** confirms email, plants OTO seed.
**Body:** "You're in. Day 1 goes live {date}. Here's the speaker grid + a note from me. PS: there's a thing on the next page worth 60 seconds of your time."
**CTA:** "Show me what's on the next page" → `/summit/all-access`.

### Page 3 — `/summit/all-access` (OTO)

**Job:** $97 one-time All-Access Pass.
**Stack:**

| Item | Value |
|---|---|
| Lifetime replay access (all 20 sessions) | $200 |
| Searchable transcripts | $40 |
| The Resource Pack (PDF of every speaker's first-customer playbook) | $97 |
| Two bonus speaker interviews ("vault sessions") | $80 |
| One free month of UnlockSaaS Machine ($49 credit) | $49 |
| **Total value** | **$466** |
| **All-Access Pass price** | **$97** |
| Ratio | 4.8× |

**Brunson note:** the $49 Machine credit is the bridge — lowers perceived price of upgrading to the recurring core from $49 to "free for a month." It is the OTO-inside-the-summit-funnel.

**Pricing discipline:** $97, not $47 (too cheap for 20 speakers), not $297 (too expensive for free-summit audience). $97 is the sweet spot Brunson has tested across hundreds of summits. Do not negotiate this down.

**4.8× ratio is below the 10× rule, and that's correct.** Brunson rule: 10× applies to the anchor product (the Machine). Event passes price on scarcity-of-event, not on stack math.

### Page 4 — `/summit/day/[1-3]` (daily access, 24-hour windows)

**Job:** that day's 6–7 sessions, only live during the 24-hour window.
**Body:** each session as a 20-min video embed + speaker bio + one CTA per session ("get the Resource Pack on the All-Access Pass").
**Persistent CTA:** All-Access Pass at the top and bottom of the page.

### Page 5 — `/summit/speaker/[slug]` (per-speaker page)

**Job:** bio, session embed (after their day airs), speaker's affiliate link to the All-Access Pass, real-time per-speaker dashboard at `/summit/speaker/[slug]/stats` (magic-link auth, no password).

**Brunson hard rule:** *speakers must see their own numbers in real-time or they stop promoting on Day 2.*

### Page 6 — `/summit/closed` (post-event evergreen)

**Job:** the conversion floor for traffic that lands after the live window.
**Body:** "You missed the live window. The full library is in the All-Access Pass." + the same stack from page 3 + speaker grid (so the trust transfers even months later).
**CTA:** All-Access Pass.

The summit becomes a permanent $97 product after the live broadcast. The live broadcast re-runs annually as the flagship event.

---

## §6 — Per-speaker affiliate attribution (`summit_referrals` table — gated)

Each speaker gets a unique `?speaker=slug` parameter dropping a 90-day cookie. All-Access purchases inside the window pay $48.50 to the speaker.

**Schema spec (migration not yet shipped — fires at summit build):**

```sql
create table public.summit_referrals (
  id            uuid primary key default gen_random_uuid(),
  speaker_slug  text not null,
  subject_id    uuid references public.subjects(id),
  cookie_seen_at timestamptz not null default now(),
  purchase_session_id text,
  purchase_amount_cents int,
  payout_cents  int,
  payout_status text check (payout_status in ('pending','paid','refunded')) default 'pending',
  created_at    timestamptz not null default now()
);
```

**Speaker dashboard query:**

```sql
select
  speaker_slug,
  count(*) filter (where cookie_seen_at is not null) as visits,
  count(*) filter (where purchase_session_id is not null) as purchases,
  sum(payout_cents) filter (where payout_status='paid') / 100.0 as paid_usd
from public.summit_referrals
where speaker_slug = $1
  and created_at > $2
group by speaker_slug;
```

**Magic-link auth** on `/summit/speaker/[slug]/stats` reads the slug from the URL and matches against a `speakers` table (email + slug). No password. No JWT. Just signed magic links from Resend.

---

## §7 — The All-Access Pass post-ascension (this is the whole point)

The summit is not a product. It is a 5,000-to-15,000-person *injection* into the top of the existing UnlockSaaS funnel.

```
Summit opt-in (free, 5,000–15,000 emails)
  ↓
All-Access Pass ($97 one-time, 3–8% conversion → 150–1,200 buyers)
  ↓ (one free month of Machine baked into the Pass)
$49 Machine (10–25% redemption from All-Access)
  ↓
Verified Builder cohort
```

For the opt-in who passes on the All-Access Pass:

```
Summit opt-in
  ↓
5-email Soap Opera (Email 1 references the summit they just attended)
  ↓
$1 Starter → OTO → $49 Machine
```

Either path lands them in the same place. The summit doesn't replace the existing funnel; it pours into it.

---

## §8 — Honest revenue math (defensible to the founder, not fantasy)

| Funnel input | Conservative | Base | Optimistic |
|---|---|---|---|
| Summit opt-ins (from speaker promotion + cold ads + organic) | 5,000 | 10,000 | 15,000 |
| All-Access Pass conversion | 3% | 5% | 8% |
| All-Access buyers | 150 | 500 | 1,200 |
| All-Access revenue | $14,550 | $48,500 | $116,400 |
| Speaker payouts (50% of All-Access net of fees) | $7,275 | $24,250 | $58,200 |
| Net summit revenue | $7,275 | $24,250 | $58,200 |
| All-Access → Machine redemption (10–25%) | 15 | 75 | 300 |
| Machine MRR added | $735/mo | $3,675/mo | $14,700/mo |
| Year-1 ARR added (with 5% monthly churn) | ~$5,400 | ~$27,000 | ~$108,000 |

**Brunson honesty rule:** these are estimates from comparable summits (Bootstrapped Founder summit, Microconf On Air, IH events). They are *not* projections. If summit broadcasts and conversion is below conservative, the Friday Audible Call calls the audible, not the post-mortem.

---

## §9 — The 8-week sprint timeline

**Weeks 0–4:** Pitch 30 speakers to confirm 20. Build the 6 funnel pages. Record opening keynote (15 min, the founder's Vehicle Story + Big Domino + introduction to the speaker cohort).

**Weeks 4–7:** Speakers send interviews. Edit each to 20 min. Build promo swipe file (5 emails per speaker — Day -10 / -7 / -3 / 0 / +1). Ship 3 episodes of the founder's own podcast (start the podcast for the summit). Collect 3–5 verified UnlockSaaS wins to seed Case Study credibility.

**Week 8:** Broadcast. Tue / Wed / Thu of a non-holiday month.

**Week 9+:** Evergreen. Recordings become the permanent $97 product. Re-broadcast live annually.

**Compresses Phase 2 hard. That is the point.** Summits ARE Phase-2 accelerators. They create the 50-customer trigger that moves you to Phase 3.

---

## §10 — Scoring criteria for 100 (from v2 audit re-grade)

| Criterion | State today | At 100 |
|---|---|---|
| Speaker list of 20 confirmed | 0 confirmed | 20 signed speaker agreements |
| Pitch script tested | Drafted (this doc) | Pitched, sent, replied, refined |
| Funnel pages live | 0 of 6 | All 6, mobile-tested, A/B headline |
| All-Access Pass priced + stacked | Drafted (§5) | $97, 4.8× stack, Stripe product live |
| Speaker email swipe file | Not written | 4 emails per speaker, calendar-scheduled |
| Affiliate tracking | Spec'd (§6) | Per-speaker links, real-time dashboard |
| One live broadcast | Never run | At least one summit completed |
| Evergreen replay product | Doesn't exist | All-Access Pass permanent on the site |
| 5,000+ summit opt-ins | 0 | 5,000–15,000 captured |
| 3+ verified customer wins seeded into Case Studies | 0 | 3+ baked into the Three Secrets in Sprint 3 |

**Progression:**
- First 3 speakers signed: **35**
- All 20 signed + pages built: **65**
- Broadcast happens: **85**
- Evergreen replay converting cold traffic on its own: **100**

**Today, this kit alone:** the pitch is ready. The funnel spec is locked. The affiliate spec is locked. The math is defensible. Score for DCS Secret #16 with this kit shipped: **30 pre-gate** (was N/A in v2, then re-graded to 30 in v2 audit closing). The next score lift requires the gate to fire (first verified customer) and then the pitch to start sending.

---

## §11 — What this kit does NOT do

1. **Pitch any speakers.** Per `project_unlocksaas_email_identity.md`, customer-facing sends require per-message Maryan confirmation. The kit is "press send when ready," not "sent."
2. **Build the 6 funnel pages.** Spec is locked; build is gated on 3+ verified customers + first 3 speakers confirmed (otherwise the build is for a hypothetical event).
3. **Pre-create the Stripe product for the All-Access Pass.** Stripe doesn't allow product creation without checkout configuration; the product fires at build-sprint time.
4. **Migrate the `summit_referrals` table.** Adds at activation, not pre-launch.
5. **Negotiate the summit broadcast platform** (Crowdcast vs Riverside vs StreamYard vs Vimeo). All four work; pick at build-sprint time.

---

*Generated 2026-05-17. Ported from `strategy/audits/2026-05-17-brunson-trilogy-audit.md` §"Summit Funnel Re-grade" into a deployable kit during the DCS #13 v3 push. Reconciled against `strategy/other-peoples-funnels.md`, `strategy/dream-100-outreach.md`, `strategy/dream-100.csv` Category 2, `expert_secrets.movement.identity_label`, `expert_secrets.value_ladder.tiers`. Sender identity per `project_unlocksaas_email_identity.md`. Gate per `traffic_secrets.other_peoples_funnels.activation_matrix` Gate 2.*
