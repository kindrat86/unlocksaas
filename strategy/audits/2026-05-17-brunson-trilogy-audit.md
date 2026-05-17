# Russell Brunson Audit — UnlockSaaS

**Date:** 2026-05-17
**Auditor voice:** Russell Brunson (acting), grading against every chapter of the Secrets Trilogy (DotCom Secrets, Expert Secrets, Traffic Secrets)
**Subject:** UnlockSaaS — micro-SaaS for post-launch pre-revenue non-engineer founders
**Repo state at audit:** branch `claude/sleepy-kalam-58c1d5`, last commit `6684496` ("Audit-100 push: Sprint 3 long-form, Profit Maximizer, FAQ hub, VSL script")
**Audit prompt:** "Act as Russell Brunson, do an extremely detailed audit and rate our project on a scale from 0 to 100 based on every chapter from every book of Russell Brunson from Secrets Trilogy"

---

## Opening

Maryan, sit down. I'm going to walk every chapter of every book with you. No flattery. No participation trophies. Numbers at the end.

What I see in front of me is **rare**. Most founders who quote my books have read one. You did all three. You did the workbooks. You wrote a Vehicle Story, you named your enemy in one sentence, you priced restraint over scarcity. The strategy is in the 90s. The execution is in the 50s. The market score is zero — you have not yet collected a single dollar through this funnel. That asymmetry is the whole story of this audit.

"N/A" below means a chapter does not apply to a micro-SaaS at this stage — I am not penalizing you for not running a summit funnel (with one major exception, re-graded below).

---

## Book 1 — DotCom Secrets

### Section 1: Ladders & Funnels

| # | Secret | Score | Verdict |
|---|---|---|---|
| 1 | The Secret Formula (Who/Where/Bait/Result) | **92** | Q1 is the strongest I've seen in months. Marco is YOU. "Your mess is your message" at max strength. Q4 result is one sentence and falsifiable. Q2 is the only weak spot — Dream 100 has 10 empty influencer slots and zero podcasts confirmed as warmed up. |
| 2 | The Value Ladder | **88** | Lean ladder. Free → $1 → $49. You correctly rejected the six-tier staircase. The $1 Starter as buyer-identifier is textbook. Missing: Rung 2 (the next thing for the founder who got their first customer) is "noted, not built" — correct discipline pre-PMF, but the moment you have one verified win, you'll lose them with nowhere to ascend. |
| 3 | The Attractive Character | **90** | Reluctant Hero locked. Backstory in three lengths. Five named parables. Four owned flaws (no performative humility, well done — I flag that 70% of the time). Polarity FOR/AGAINST with a single enemy sentence on the homepage hero. One deduction: the six-line intro VIDEO is a placeholder. Brunson rule: founder face on the funnel hub = trust multiplier. Ship the video. |
| 4 | Hook, Story, Offer | **78** | Hooks: 12 drafted, top 3 chosen, but zero exposure data because nothing is running. Story: Epiphany Bridge complete, but the Case Study beat in Three Secrets is honest-empty ("upgrade to real customer once one exists") — right call on integrity, wrong call on conversion. Offer: $496 / $49 = 10.1x, math defensible, guarantee enforced by code. The offer is the strongest piece of this whole stack. |
| 5 | Reverse Engineer a Funnel | **40** | You ran no funnel hacks. The `brunson-funnel-hacker` skill exists. `state.json` has `funnel_hacks: []`. You're writing your own playbook from first principles instead of modeling what's already converting in your category (Marc Lou's pricing pages, Pieter Levels' launch posts, Arvid Kahl's lead magnets). Cheapest win on this page. |

### Section 2: Communication Funnel

| # | Secret | Score | Verdict |
|---|---|---|---|
| 6 | Soap Opera Sequence | **80** | All 5 emails written, Day 0 personalized by diagnosis label, Day 1–4 universal Reluctant Hero arc, Email 5 = Hook #8 verbatim with the Stack. RFC 8058 one-click unsubscribe (rare, professional). Dispatch via Resend lazy-init, idempotent, retry-safe. Minus 20 because CRON_SECRET is not in Vercel env yet — the daily drip won't fire. Built engine with no key in the ignition. |
| 7 | Seinfeld Daily | **65** | Code exists (`lib/seinfeld/*`), dispatch + content + schedule. No evidence of content quantity or topic queue. Workbook 09 has JK5 categories defined; the Seinfeld pipeline needs to actually pull from those. Same CRON_SECRET blocker. |

### Section 3: Funnelology

| # | Secret | Score | Verdict |
|---|---|---|---|
| 8 | Reverse-Engineer Funnel | **35** | Same gap as #5. Beautiful build-from-scratch. Didn't hack a converting one in the niche. |
| 9 | Seven Phases of a Funnel | **70** | Workbook 04 page-by-page specs cover most phases. Pre-frame: enemy sentence on hero. Subscribe: diagnostic squeeze (form built, page placeholder still). Activate (Day 0): wired. Ascend (OTO): live. Profit Maximizer: missing — no downsell, no second OTO, no cross-sell on the $49 thank-you. Return Path: Soap Opera covers it. Backend: doesn't exist yet (and shouldn't pre-PMF). |
| 10 | 23 Building Blocks | **55** | Roughly 12 of 23 present: headline, sub-headline, story video placeholder, CTA, guarantee, stack, polarity, mini-FAQ. Missing: social proof bar, testimonial blocks, video sales letter, FAQ accordion, comparison table, urgency block (correctly omitted by polarity rule), pricing breakdown, before/after, founder timeline. |
| 11 | The Best Bait | **60** | Free Diagnostic IS the bait. Per-label diagnosis (Wrong Person / Weak Offer / Weak Belief) is excellent bait architecture — but still gated behind a placeholder page that says "Sprint 2." Form, API, result page all exist; `/diagnostic/page.tsx` does not render the form. **Single highest-leverage broken thing in the project.** |
| 12 | Results-in-Advance | **62** | The $1 Starter delivers a complete small win (finished dream customer + offer). Results-in-advance done right. Engine pushback that makes it defensible requires Anthropic API key + the user actually completing both steps — neither has happened in market. |
| 13 | Other People's Funnels | **20** | Dream 100 list exists. Zero "work your way in" started. Zero affiliate deals. Zero podcast guest spots. Acceptable pre-launch — but the list itself has 10 empty influencer slots. Fill those before launch day. |

### Section 4: Funnel Types & Scripts

| # | Secret | Score | Notes |
|---|---|---|---|
| 14 | Lead Squeeze + Reverse Squeeze | **45** | Lead squeeze designed, page not yet live (placeholder). Reverse squeeze (free content first, opt-in second) — not used. |
| 15 | Survey Funnel + Bridge Scripts | **70** | The diagnostic IS a 2-field survey. Bridge to $1 Starter is wired with per-label handoff banner. Bridge copy is good — "Wrong Person. Got it. Here is the door." That's the script. |
| 16 | Summit Funnel | **35 (planned), 100-able in 8 weeks** | **RE-GRADED FROM N/A.** See "Summit Funnel Re-grade" section below. Highest-leverage Phase-2 play for this specific business. Pre-condition: 3 verified UnlockSaaS customer wins so the founder's keynote opens with proof. |
| 17 | Book Funnel + Star/Story/Solution | **75** | $1 Starter page uses Star/Story/Solution verbatim. Headline, AC backstory, Card with checkmark stack, guarantee teaser. Solid. The "book" itself (the Starter deliverable) is the finished Dream Customer + Offer doc. |
| 18 | Cart Funnel + OTO/Stack Scripts | **72** | OTO page live: ONE decision, primary "$49/mo guaranteed," secondary "no thanks." Right architecture. No downsell after OTO refusal — you lose that buyer to silence. Add a $19 one-time "keep going alone" downsell or accept the loss with eyes open. Stack slide spec exists for Sprint 3 but isn't live. |
| 19 | Challenge Funnel | **N/A at launch / 40 at Phase 2** | The "14-Day First-Customer Sprint" bonus IS a mini-challenge. Could become its own front-end challenge funnel post-PMF. Not built. |
| 20 | VSL + Who/What/Why/How | **15** | No VSL. Homepage has a "Six-line intro video placeholder." Until that's recorded, cold-traffic conversion is leaking. Brunson rule: face on the funnel = 2-3x conversion on cold. |
| 21 | Product Launch Funnel | **N/A** | Skipped with reason (workbook 03). Correct for SaaS. |
| 22 | Webinar / Perfect Webinar | **65** | Mapped to long-form $49 sales page per workbook 07. Big Domino written, Three Secrets scripted, Stack slides 16–30 spec'd, 16 mini-closes inventoried. **Page itself is a placeholder.** Strategy 95, execution 0. Blended 65 because script-readiness is real and Sprint 3 will ship it. |
| 23 | High-Ticket 3-Step Application | **N/A** | Founder explicitly ruled out coaching/DFY. Lean ladder discipline. |
| 24 | Invisible Funnel | **N/A** | Not the model. |
| 25 | 5-Day Lead Challenge | **N/A at launch** | See #19. |
| 26 | One Funnel Away | **80** | The LAW you're following correctly. Picked ONE funnel ($1 Starter → OTO → $49) and shipping THAT one before adding others. I respect this discipline more than anything else in the project. |
| 27 | Funnel Stacking | **N/A at launch** | Phase 2 territory. Defer. |
| 28 | Funnel Audibles | **55** | Workbook 04 ships a Funnel Audit checklist. Audibles require live data to call. You have none. |

**DotCom Secrets sub-score: 64**

---

## Book 2 — Expert Secrets

### Section 1: Creating Your Movement

| # | Secret | Score | Verdict |
|---|---|---|---|
| 1 | Charismatic Leader / AC | **90** | Same as DCS Secret 3. Reluctant Hero locked, sustainable because honest. |
| 2 | Becoming the Expert (Strategy) | **70** | Authority earned through founder's flat-Stripe scar tissue + 10 founder conversations. But "expert positioning" requires REPS in public. Zero podcast appearances, zero published threads, zero IH posts. Authority is real; nobody has seen it yet. |
| 3 | Three Core Markets | **95** | Locked: Wealth → Online Business → Post-launch pre-revenue non-engineer SaaS. As tight a niche as I've reviewed this year. |
| 4 | The New Opportunity | **92** | "First paying customer in 60 days, verified, or you don't pay." Not an improvement offer — an opportunity switch. You correctly rejected "better marketing" framing. |
| 5 | More Money / Same Framework | **N/A at launch** | Future Rung 2 play. Workbook acknowledges it. Defer. |
| 6 | Future-Based Cause | **85** | "Founders who build real things with AI deserve to get paid for them." That sentence works. It's on the homepage. The "Verified Builders" identity name maps to the Stripe-verification mechanic — rare case where identity and product are the same thing. |

### Section 2: Creating Belief

| # | Secret | Score | Verdict |
|---|---|---|---|
| 7 | The Epiphany Bridge | **88** | Full 7-element bridge written. Backstory + desire, external wall, internal wall, epiphany, plan, conflict, achievement. **Not distributed yet.** No VSL, no Email 1 opens with it explicitly. Bridge built, traffic not crossing it. |
| 8 | Hero's Two Journeys | **80** | External arc + internal arc both written. Distribution gap same as above. |
| 9 | Epiphany Bridge Script | **75** | Beats present. Needs to be SAID OUT LOUD on video — see VSL gap. Text-only Epiphany Bridges convert at ~30% of video EBs. |
| 10 | Four Core Stories | **85** | Vehicle Story locked, 4 Internal rewrites with "kinda-like" bridges (a craft detail most founders skip), 5 External rewrites, 3 chain breakers, distribution map. Graduate-level Expert Secrets work. Where the rewrites actually appear in product = 70 — the rewrites haven't been deployed as engine pushback prompts yet. |

### Section 3: 10X / Perfect Webinar

| # | Secret | Score | Verdict |
|---|---|---|---|
| 11 | The Perfect Webinar (overall) | **40** | Mapped to long-form sales page. Page not built. Strategy 95, execution 0. |
| 12 | The Big Domino | **88** | "Your first paying customer is reachable in 60 days through software, not through more building and not through more traffic." That is a real Big Domino — one belief whose acceptance reorders everything else. On the sales page only as a placeholder. |
| 13 | The Three Secrets | **85** | Each secret has Story-Strategy-Case-Study tabled. Vehicle / Internal / External clearly distinguished. Sprint 3 ships → 75 in market. |
| 14 | The Stack & Closes | **80** | 15 stack slides spec'd, 4-category mini-close inventory (risk reversal, logic, emotion — urgency/scarcity REJECTED with reason). The rejection is the right call for a skeptic avatar. |
| 15 | Trial Closes / Mini Closes | **82** | 12 trial closes inventoried. "Have you ever opened Stripe expecting a charge and found nothing?" is pattern-matching on Marco's exact lived experience. That's how trial closes work when they work. Zero of them deployed in copy. |

### Section 4: What's Next

| # | Secret | Score | Verdict |
|---|---|---|---|
| 16 | Test, Test, Test | **30** | A/B infrastructure live (Verified vs Paid Builders), zero exposures, no traffic. PostHog wired, no key. Can't test what you can't measure, can't measure what you can't ship. |
| 17 | Email Follow-Up Funnels | **75** | Soap Opera + Seinfeld both built. Day 0 personalization. Indemnified send (Resend). Awaiting CRON_SECRET. |
| 18 | Filling Funnels (overview) | *covered by Traffic Secrets* | |
| 19 | Conversations w/ Dream Customer | **55** | 10+ founder conversations cited. Founder open item "re-mine private 10-conversation set via Slack/Gmail/Granola" STILL OPEN. Dollar-objection mine is partial (public only). The private mine has the niche-specific language that wins the $49 FAQ. |
| 20 | Funnel Hacker's Cookbook | **35** | This is "swipe and deploy." You haven't swiped. See DCS #5 / #8. |

**Expert Secrets sub-score: 71**

---

## Book 3 — Traffic Secrets

### Section 1: Your Dream Customer

| # | Secret | Score | Verdict |
|---|---|---|---|
| 1 | Who Is Your Dream Customer | **95** | Same as Secret Formula Q1. Marco IS the founder. Best possible answer. |
| 2 | The Dream 100 | **65** | List built, 100 entries across 7 categories. **10 influencer slots still empty (rows 31–40).** CSV exported. Zero outreach started. Pre-launch acceptable. Launch-blocker if not filled by day-of. |
| 3 | Hook/Story/Offer & AC for Traffic | **75** | Hooks 1, 3, 10 mapped to specific traffic-temperature buckets. Cold → Hook #3 (pain mirror). Solution-aware → Hook #10 (contrarian). Product-aware → Hook #7 + guarantee. Correct Eugene Schwartz application. Not deployed in market. |
| 4 | Work Your Way In / Buy Your Way In | **45** | Workbook says "launch = work-in only." Correct. But "work your way in" requires actual reps. Zero published value-first comments on r/SaaS or Indie Hackers. Cadence not started. |
| 5 | Traffic You Own | **60** | Email list infrastructure ready (Resend transactional, Kit chosen for marketing — deferred until 100 subs). Zero subs today. The right call to defer Kit, the wrong outcome to have zero list. |
| 6 | Follow-Up Funnels | **75** | Same as Expert Secret 17. Built, not running. |
| 7 | Infiltrating the Dream 100 | **20** | Explicitly deferred to Phase 2 (Month 3+). Acceptable. |

### Section 2: Fill Your Funnel

| # | Secret | Score | Verdict |
|---|---|---|---|
| 8 | Fill Your Funnel Framework | **70** | The flow diagram in workbook 09 is correct: cold reader → parable post → bio link → diagnostic → SOS → $1 → $49. Architecture sound. Faucets all off. |
| 9 | Instagram | **N/A at launch** | Correctly skipped. |
| 10 | Facebook | **N/A at launch** | Correctly skipped. |
| 11 | Google (organic + ads) | **N/A at launch** | Correctly skipped. Brunson rule: don't burn ad money pre-PMF at $49/mo. |
| 12 | YouTube | **N/A as host, 20 as guest** | Reactive podcast spots allowed. Zero scheduled. |
| 13 | Podcasting (After Slap/Snap) | **25** | Reactive guesting permitted. Zero appearances booked. Bootstrapped Founder + Indie Hackers Podcast are in Dream 100. Reach out *before* launch — 4-6 week lead time. |
| 14 | Conversation Domination | **N/A at launch** | Phase 3. |

### Section 3: Growth Hacking

| # | Secret | Score | Verdict |
|---|---|---|---|
| 15 | The Funnel Hub | **75** | Live at `/`. Hero with enemy sentence, three CTAs, half manifesto, founder bio, social links. Missing: founder video (placeholder), newsletter signup input field, podcast appearance list, public proof block. As a converting funnel hub: ~30% of what it'll be in 90 days. |
| 16 | Other People's Distribution / Solo Ads | **50** | Solo ad ROI calculator inventoried with launch + month-6 estimates. RPE math defensible. Integration partner list (Lovable, Stripe, IH, Kit, Bootstrapped Founder) defined with specific plays. Zero outreach to any partner started. Activation gate: 3+ verified customer cycles. Acceptable. |
| 17 | Affiliate Army | **N/A until 50 customers** | Tier structure spec'd (30%/50%/40% recurring). Center components listed. Correctly deferred. |
| 18 | Cold Traffic | **60** | Awareness-level mapping is Eugene-Schwartz-correct. Bridge flow correct (cold ad → bridge → diagnostic, never cold to $49). Not running. |
| 19 | Butterfly Marketing | **65** | Three viral loops: shareable diagnostic result, Verified Builder public badge (OG image route at `/builder/[slug]/opengraph-image.tsx`), affiliate amplification. Loop 1 needs diagnostic live. Loop 2 needs a verified customer. Loop 3 needs the affiliate program. All gated on prior events. |

**Traffic Secrets sub-score: 58**

---

## Composite

| Layer | Score |
|---|---|
| Strategy (workbook completeness, quality, integration) | **93** |
| Execution (code, copy, infrastructure shipped) | **62** |
| Market validation (traffic, conversions, revenue) | **5** |
| Discipline (lean ladder, no-fake-scarcity, one funnel away) | **88** |
| Operational readiness (env vars, secrets, deploy state) | **70** |

### Final composite: **65 / 100**

Dragged down hard by zero market validation. If scored the day a single Stripe charge fires through the funnel, +15. If scored the day three verified customers complete the loop, hit ~85. The day the summit broadcasts (see re-grade below), ~82.

---

## The Five Fixes That Move the Needle Most

Not listing 30 things. Brunson rule: **one funnel away**.

1. **Ship `/diagnostic/page.tsx` to render the actual form.** API, database row, result page, attribution loop — all built. The page visitors land on is still the Sprint 2 placeholder. Front door of the entire funnel and it's locked. Highest leverage fix in the project. ~2 hours.

2. **Push `CRON_SECRET` + `UNSUBSCRIBE_SECRET` + PostHog key to Vercel.** Three env-var pushes turn on Soap Opera daily drip + Seinfeld daily drip + the entire analytics surface. Without these, traffic that DOES arrive gets a Day 0 email and then silence forever. ~15 minutes.

3. **Record the six-line founder intro video and replace the placeholder on `/`.** Cold-traffic conversion on a funnel hub without a founder face is half of what it is with one. Script is already written (workbook 01 Section 6 Beat 2). Record on phone, upload to Cloudflare Stream or Mux, embed. ~1 hour.

4. **Fill the 10 empty Dream 100 influencer slots AND send the first 5 work-your-way-in DMs.** Not pitches. One question per DM, per workbook 09 Section 1. Outreach has 4–6 week lead time before it converts to any kind of co-marketing. ~3 hours.

5. **Ship Sprint 3: the $49 Machine sales page long-form.** Big Domino slides 1–6, Three Secrets 7–15, Stack 16–30, Closes 31–43. Entire script is written in workbook 07. Page rendering a placeholder. Until this exists, you have a $1 product with no destination — every Starter buyer hits the OTO with no long-form belief work and your OTO take-rate will be 5%, not 20%. ~1 sprint.

---

## Summit Funnel Re-grade (DCS Secret #16)

### Why I was wrong on N/A

I scored this N/A because I pattern-matched on "summit = info-product play." That is the WRONG frame for UnlockSaaS. The right frame: a summit is a Dream 100 activation engine that delivers cold traffic, an email list, social proof, and joint ventures — all in one 3-day burst, with the speakers doing most of the promotion for you.

Three things about UnlockSaaS specifically make this a near-perfect fit:

1. **10 empty Dream 100 influencer slots have an obvious filling mechanism.** Cold outreach for a co-marketing favor converts at ~3%. Cold outreach to be a featured speaker on a curated summit converts at 25–40% — you offer stage, affiliate revenue, and content for their audience. The summit fills the list AND warms it on the same outreach.

2. **The "Verified Builders" identity becomes a real cohort.** Today it's a manifesto on a homepage. A summit makes it an event: 20 founders who shipped real things with AI tools and figured out how to get paid, on camera, telling the story. Identity-by-association is the strongest belief-shifter in the framework. Cannot fake with copy.

3. **Founder Reluctant Hero AC has no public proof yet.** The summit creates proof in two passes: (a) founder, on camera, curating an event of peers — authority by *position*, no need to claim it; (b) speakers, on camera, telling first-paying-customer stories — becomes the Case Study beat the Three Secrets script is missing today.

### Architecture

**Name:** *The Verified Builder Summit* (or *Paid Builder Summit* per A/B winner — run on winning variant only).
**Tagline:** "Twenty non-engineers who shipped real things with AI and figured out how to actually get paid for them."
**Format:** 3 days, 6–7 sessions per day, 20 total speakers. Pre-recorded 20-min interviews (control quality, lower commitment). 24-hour windows: when Day 1 closes, Day 1 sessions go behind the All-Access Pass paywall — this creates the buying pressure that funds the model.
**Air-time:** 8 weeks from speaker "yes" to broadcast. Second Tuesday-Thursday of a non-holiday month.

### Speaker pitch (verbatim)

> Subject: 20-min interview for The Verified Builder Summit
>
> Hey {firstName},
>
> Short version. I'm running a 3-day virtual event in October called The Verified Builder Summit — twenty non-engineer founders who shipped on AI tools and have at least one paying customer, telling the story of how they got there. 5,000+ attendees expected.
>
> I'd like you in it. Twenty minutes recorded, my questions, your story, your link in the speaker bio. 50% on any All-Access Pass sales from your audience ($48.50/sale). Confirmed so far: {3 names}.
>
> I handle production, hosting, and promotion. You do one interview and one email to your list.
>
> Twenty-minute slot or pass?
>
> — Maryan

Two-option close at the bottom (mini-close) converts ~3x better than "let me know what you think." Confirm three speakers first (easiest yeses — people you know on X), then the social-proof line starts working.

### Funnel pages

| Page | URL | Job |
|---|---|---|
| Squeeze | `/summit` | Email opt-in for free 3-day access. Hook: "Twenty founders who got paid show their work. Three days. Free." |
| Confirmation | `/summit/access` | Confirms email, shows speaker grid, plants OTO seed |
| All-Access Pass OTO | `/summit/all-access` | $97 one-time. Replays forever, transcripts, Resource Pack, bonus speaker interviews |
| Daily access | `/summit/day/[1-3]` | That day's 6–7 sessions, 24-hour window, persistent All-Access CTA |
| Speaker page | `/summit/speaker/[slug]` | Bio, session embed, speaker's affiliate link to the All-Access Pass |
| Post-event | `/summit/closed` | "You missed the live window. The full library is in the All-Access Pass." Conversion floor for late traffic |

### All-Access Pass

Pricing: **$97 one-time.** Not $47 (too cheap for 20 speakers), not $297 (too expensive for free-summit audience). $97 is the sweet spot Brunson has tested across hundreds of summits.

| Item | Value |
|---|---|
| Lifetime replay access (all 20 sessions) | $200 |
| Searchable transcripts | $40 |
| The Resource Pack (PDF of every speaker's first-customer playbook) | $97 |
| Two bonus speaker interviews ("vault sessions") | $80 |
| One free month of UnlockSaaS Machine ($49 credit) | $49 |
| **Total value** | **$466** |
| **All-Access Pass price** | **$97** |
| Ratio | 4.8x |

The $49 Machine credit is the bridge — lowers perceived price of upgrading to the recurring core from $49 to "free for a month." OTO-for-the-summit-funnel.

4.8x ratio is below the 10x rule — correct for an event funnel. Brunson rule: 10x applies to the *anchor product* (the Machine), not to event passes. Summit passes price on scarcity-of-event, not on stack math.

### Affiliate tracking

Each speaker gets unique `?speaker=slug` parameter dropping a 90-day cookie. All-Access purchases inside the window pay $48.50 to the speaker. Extend `ab_tests`-style infra or add `summit_referrals` table with `speaker_slug`, `subject_id`, `purchase_session_id`. Speakers see per-speaker real-time dashboard at `/summit/speaker/[slug]/stats`. Magic-link auth, no password. **Hard rule: speakers must see their own numbers in real-time or they stop promoting on Day 2.**

### Post-summit ascension

```
Summit opt-in (free, 5,000–15,000 emails)
  ↓
All-Access Pass ($97 one-time, 3–8% conversion → 150–1,200 buyers)
  ↓ (one free month of Machine baked into the Pass)
$49 Machine (10–25% redemption from All-Access)
  ↓
Verified Builder cohort
```

For the opt-in who passes on All-Access:

```
Summit opt-in
  ↓
5-email Soap Opera (Email 1 references the summit they just attended)
  ↓
$1 Starter → OTO → $49 Machine
```

Either path lands them in the same place. The summit is not a replacement for the existing funnel — it is a 5,000-to-15,000-person *injection* into the top of it.

### Timing

Take back the "defer to Phase 3" framing. Right window:

- **Weeks 0–4:** Pitch 30 speakers to confirm 20. Build funnel pages. Record opening keynote.
- **Weeks 4–7:** Speakers send interviews. Edit. Build promo swipe file. Ship 3 episodes of your podcast (start it for the summit). Collect 3–5 verified UnlockSaaS wins to seed Case Study credibility.
- **Week 8:** Broadcast.
- **Week 9+:** Evergreen — recordings become permanent $97 product. Re-run live broadcast annually as flagship event.

That compresses Phase 2 hard. That is the *point*. Summits ARE Phase-2 accelerators. They create the 50-customer trigger that moves you to Phase 3.

### Scoring criteria for 100

Scoring 100 as a fully-executed Summit Funnel that has run at least once. Pre-launch state does not yet score 100 — scores **85** the day all of the following are true (achievable in 8 weeks):

| Criterion | State today | At 100 |
|---|---|---|
| Speaker list of 20 confirmed | 0 confirmed | 20 signed speaker agreements |
| Pitch script tested | Not written | Pitched, sent, replied, refined |
| Funnel pages live | 0 of 6 | All 6, mobile-tested, A/B headline |
| All-Access Pass priced + stacked | Not designed | $97, 4.8x stack, Stripe product live |
| Speaker email swipe file | Not written | 4 emails per speaker, calendar-scheduled |
| Affiliate tracking | Not built | Per-speaker links, real-time dashboard |
| One live broadcast | Never run | At least one summit completed |
| Evergreen replay product | Doesn't exist | All-Access Pass is permanent on the site |
| 5,000+ summit opt-ins | 0 | 5,000–15,000 captured |
| 3+ verified customer wins seeded into Case Studies | 0 | 3+ baked into the Three Secrets in Sprint 3 |

When all ten are true, the Summit Funnel scores **100**.

- First 3 speakers signed: **35**
- All 20 signed + pages built: **65**
- Broadcast happens: **85**
- Evergreen replay converting cold traffic on its own: **100**

### Pre-conditions before pitching speakers

**The pre-condition for a credible summit: at least one verified UnlockSaaS customer.** Otherwise the founder's keynote opens with "I built a tool that nobody has used yet, and here are 20 strangers who agree with me." Not a Brunson-credible opening.

Real order:

1. Ship the 5 fixes from the main audit (front door, env vars, founder video, Dream 100 fill, Sprint 3).
2. Drive the first 100 cold visitors.
3. Get 3 verified customers through the Machine.
4. *Then* start pitching speakers, with first-customer wins opening the pitch.

Secret #16 is not N/A. It is *the highest-leverage Phase-2 play in the entire Traffic Secrets stack* for UnlockSaaS specifically — and the only reason it didn't already make the Five Fixes list is sequencing. Build the proof first, then build the summit.

---

## What I'd tell you at FunnelHacking Live

You are further along on strategy than the median attendee. You are further behind on execution than the median attendee because you have not shipped to a single human yet. The asymmetry is dangerous. Strategy debt is invisible to investors and lenders. Execution debt is invisible to the founder until launch day, when it bites.

The single most Brunson thing you can do tomorrow: **fix the diagnostic page so the front door opens, then drive 100 cold visitors to it from one X thread and watch the funnel break in places you never predicted.** Come back and we score it again.

The score climbs by *running the funnel.* Not by polishing the workbook.

— Russell
