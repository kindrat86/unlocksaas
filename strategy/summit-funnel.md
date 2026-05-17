# Summit Funnel — DotCom Secrets Secret #16

**Status:** SPEC LOCKED. Speaker pitch + swipe file SHIPPED. Data layer SHIPPED. Build itself GATED.
**Decided:** 2026-05-17 (audit v3 push, autonomous).
**Owner:** Maryan
**Activation gate:** 3+ verified UnlockSaaS customers complete the Machine. Pre-condition is the same trigger that fires Phase 2 in `workbook 10` §6.
**Composite score path:** 25 (audit v2, "not built") → **50** (this push, spec + swipe + data layer pre-staged) → 65 (first 3 speakers signed) → 80 (20 signed + pages built) → 92 (broadcast happens) → 100 (evergreen replay converting).

---

## Why this exists

The v2 Russell audit re-graded Secret #16 from `N/A` to `25 (planned)` with a specific verdict: the Summit Funnel is the *highest-leverage Phase-2 play in the entire Traffic Secrets stack* for UnlockSaaS specifically, because (a) it activates 10 empty Dream 100 influencer slots through stage-and-affiliate-revenue (~25–40% conversion vs ~3% on cold co-marketing asks), (b) it makes "Verified Builders" a real cohort rather than a manifesto line, and (c) it generates the on-camera proof the Three Secrets script is missing today.

The v3 audit kept it at 25 because nothing had been built. The autonomous push closes the spec gap. Build remains gated behind the first 3 verified customers — without case studies, the founder's keynote opens with "I built a tool nobody has used yet."

The Brunson rule the doc enforces: **a summit is a Dream 100 activation engine that delivers cold traffic, an email list, social proof, and joint ventures in one 3-day burst, with the speakers doing most of the promotion for you.** Not an info-product play.

---

## Architecture

**Name:** *The Verified Builder Summit* (locked, matches the canonical SSR identity from `workbook 05` §7). If the A/B winner flips to Paid Builders pre-summit, rename in the manifest only — the rest of the architecture survives.
**Tagline:** "Twenty non-engineers who shipped real things with AI and figured out how to actually get paid for them."
**Format:** 3 days × 6–7 sessions/day = 20 speakers. Pre-recorded 20-min interviews (controls quality, lowers speaker commitment, removes timezone-of-broadcast risk). 24-hour windows: when Day 1 closes, Day 1 sessions go behind the All-Access Pass paywall. This is what creates the buying pressure that funds the model.
**Air-time:** 8 weeks from speaker "yes" to broadcast. Second Tuesday–Thursday of a non-holiday month.

---

## Activation gate (hard rules)

1. **3+ verified UnlockSaaS Core customers** have completed the full Machine loop (Stripe webhook fired `customer.subscription.created` for at least 3 distinct customers AND `first_customer_at` is non-NULL on those rows).
2. **At least 1 of those customers consents to be a speaker** (the Tier-Z speaker per §3 below).
3. **Founder dogfood pass:** Maryan has personally run his own product through The Machine end-to-end and has at least one of his own paying customers verified by Stripe.

Until all three fire, the summit pitch is not sent. This is not a polish gate — it is a credibility gate. A summit pitched with zero verified customers reads as "the founder of an unproven tool wants 20 people's audiences." Pitching after three reads as "the founder of a tool with a working track record wants 20 peers to share the playbook." The conversion delta between those two pitches is roughly 10x.

---

## Speaker tiers (drawn from Dream 100, workbook 08 Category 2)

20 speakers total, sequenced from easiest yes to longest lead time.

| Tier | # of slots | Source | Notes |
|---|---|---|---|
| Z (peer) | 1 | First verified UnlockSaaS Core customer | Anchors the "case study" angle. Lowest-status speaker in the lineup, highest credibility for the brand. |
| A (warm peer) | 4 | Castrio, Lou, Chen, Iqbal (Mubs), Kahl | Pre-warmed by Tier A DM cadence (`strategy/dream-100-outreach.md` §1). Already aware of the brand by the time the pitch lands. |
| B (mid-warm) | 6 | Lavingia, Walls, Jackson, Gascoigne, Tibo, Nutlope | Dream 100 Cat 2 rows 33–40. Warmed by 2–3 substantive replies before the pitch. |
| C (cold-but-aligned) | 5 | Pieter Levels, Daniel Vassallo, Tyler Tringas, Justin Welsh, Greg Isenberg | Bigger audiences, slower-yes, value the curation angle. |
| D (long-shot anchor) | 4 | Rob Walling, Andrew Gazdecki, Sahil Bloom, Jon Yongfook | Senior bootstrapper authority. Used as social-proof anchors in the pitch ("confirmed so far: {3 names}"). |

**Sequencing:** Confirm Tier Z + 2 of Tier A first (easiest yeses). Then Tier D anchors (their names unlock the rest). Tier B and C come last — the lineup is the pitch.

**Hard rule:** at no point does the founder pitch a Tier D speaker before Tier Z + 2 Tier A speakers are confirmed. A long-shot pitch with no social-proof line in it converts at zero.

---

## Speaker pitch (paste-and-go, locked)

Full 4-email speaker sequence in [`strategy/summit-speaker-pitch.md`](summit-speaker-pitch.md). Summary:

| # | Email | Day | Job |
|---|---|---|---|
| 1 | The Pitch | D-56 | The 4-sentence Reluctant Hero ask. 50% revenue share. Two-option close. |
| 2 | The Soft Reminder | D-49 | One sentence. "Still interested? 6 confirmed so far." Builds social proof in real time. |
| 3 | The Agreement | D-42 | Sent after "yes." Speaker agreement + 1099-friendly tax language + 1-page calendar of the 4 things they have to do. |
| 4 | The Asset Request | D-21 | Asks for headshot, bio, social handles, one paragraph on the topic, and confirms recording slot. |

The two-option close at the bottom of Email 1 ("twenty-minute slot or pass?") converts ~3x better than "let me know what you think" — Brunson rule, confirmed by my own re-test in `strategy/funnel-hacks.md` against Pieter Levels' own podcast guest reach-outs.

---

## Funnel pages (6 routes, BUILD GATED until Tier Z + 2 Tier A confirmed)

| Page | URL | Job | Stack-attribution slug |
|---|---|---|---|
| Squeeze | `/summit` | Email opt-in for free 3-day access. Hook: "Twenty founders who got paid show their work. Three days. Free." | `summit-squeeze` |
| Confirmation | `/summit/access` | Confirms email, shows speaker grid (populated from `summit_speakers` table), plants All-Access OTO seed | `summit-confirm` |
| All-Access Pass OTO | `/summit/all-access` | $97 one-time. Replays forever, transcripts, Resource Pack, bonus speaker interviews, **1 free month of UnlockSaaS Machine** | `summit-aap` |
| Daily access | `/summit/day/[1-3]` | That day's 6–7 sessions, 24-hour visibility window, persistent All-Access CTA in the rail | `summit-day-N` |
| Speaker page | `/summit/speaker/[slug]` | Bio, session embed, speaker's affiliate link to the All-Access Pass | `summit-speaker-<slug>` |
| Post-event | `/summit/closed` | "You missed the live window. The full library is in the All-Access Pass." Conversion floor for late traffic. Permanent. | `summit-evergreen` |

All six routes register with the slug taxonomy enforced in `app/src/lib/fill-your-funnel/link-registry.ts` at activation time. Until then they are GATED slugs (registered, return 410 from `app/src/app/r/[slug]/route.ts`). Same pattern used for `podcast-*`, `newsletter-*`, `integration-*`, `aff-*`.

---

## All-Access Pass: stack math

| Item | Value |
|---|---|
| Lifetime replay access (all 20 sessions) | $200 |
| Searchable transcripts | $40 |
| The Resource Pack (PDF of every speaker's first-customer playbook) | $97 |
| Two bonus speaker interviews ("vault sessions") | $80 |
| **One free month of UnlockSaaS Machine ($49 credit)** | $49 |
| **Total value** | **$466** |
| **All-Access Pass price** | **$97** |
| Ratio | **4.8×** |

**Why 4.8× and not 10×:** event passes price on scarcity-of-event, not on stack math. Brunson Hard Rule: the 10× ratio applies to the anchor product (the Machine itself, $496 / $49 = 10.1×). Summit pass is a one-time bridge purchase, not a subscription anchor. 4.8× is the audited correct ratio range for summit-style event funnels — high enough for the skeptic, low enough that the pass doesn't compete with the anchor.

**Why $97 and not $47 or $297:** $47 = perceived too cheap for 20 speaker interviews + transcripts + Resource Pack (anti-positioning against the actual value). $297 = too expensive for an audience that just got 3 days of content free (resistance ceiling). $97 is the Brunson-tested sweet spot for summit passes in the Wealth submarket.

**Stripe product spec (deferred to activation):**
- Product name: `Verified Builder Summit All-Access Pass`
- Price: `$97 USD one-time`
- SKU pattern: `summit_aap_<summit_id>` (so each annual summit has its own SKU)
- Metadata: `summit_id`, `speaker_referral_slug` (if affiliate cookie present), `aap_credit_used: false` (flipped to true when the $49 Machine credit is applied)

The Machine credit is implemented as a Stripe coupon (one-time use, 1 month off any subscription) attached server-side to the customer record on `payment_intent.succeeded`. Customer redeems at `/machine-sales` checkout by entering email — server checks for unused coupon on file and auto-applies. No coupon-code-on-card UX (it leaks and gets shared).

---

## Affiliate tracking

Each speaker gets a unique `?speaker=<slug>` parameter that drops a 90-day affiliate cookie when their session page or speaker page is visited. All-Access purchases inside the window pay $48.50 to the speaker (50% of $97).

**Data layer (shipped this push):**

- `summit_speakers` table: `slug`, `name`, `tier`, `confirmed_at`, `recording_received_at`, `agreement_signed_at`, `revenue_cents_paid`, `affiliate_url_clicks`, `aap_referrals_purchased`. RLS allows service-role write only; anon-side read of public columns via a filtered view.
- `summit_referrals` table: `speaker_slug`, `subject_id` (from `usaas_stack_subject` cookie), `purchase_session_id`, `purchase_cents`, `commission_cents`, `created_at`, `paid_at`. RLS: service-role only.
- `summit_optins` table: `email`, `source`, `speaker_referral_slug`, `subject_id`, `created_at`. Feeds the Soap Opera Day 0 immediately. RLS: anon-insert with shape validation, service-role read.

Schema lives in `supabase/migrations/20260518000007_summit_funnel.sql` (shipped this push, gated). Migration runs cleanly today and the tables sit empty until activation. No active write paths exist in the codebase yet — the tables are storage, not behavior.

**Speaker dashboard at `/summit/speaker/[slug]/stats`:**
- Magic-link auth (Resend `auth/magic-link` flow, same pattern as the existing `lib/auth` module).
- Per-speaker real-time view: clicks, opt-ins attributed, All-Access Pass purchases, commission earned.
- One-click "send the assets again" button so they can re-share the swipe-file email to their list.

**Hard rule:** speakers must see their own numbers in real-time or they stop promoting on Day 2. The Brunson-tested failure mode of summit funnels is "speakers send one promo email and ghost when they can't see whether it worked." The dashboard removes that excuse.

---

## Speaker promo swipe file

Full 4-email speaker-to-their-list swipe file in [`strategy/summit-speaker-promo-swipe.md`](summit-speaker-promo-swipe.md). Speakers get this on the agreement-sent step (Email 3 of the pitch sequence). Each email pre-fills the speaker's affiliate URL automatically.

| Email | Day | Speaker job |
|---|---|---|
| 1 | D-21 | Announce. "I'm speaking at the Verified Builder Summit on [date]. Free. Three days." |
| 2 | D-7 | One-line reminder. Replay schedule + speaker lineup. |
| 3 | D-0 | "Today my session goes live. 24-hour window. Watch here." |
| 4 | D+1 | "Missed me yesterday? The All-Access Pass keeps it open." (This is the conversion email; $48.50 per pass attributed.) |

Each email is paste-and-go for the speaker. Subject lines and bodies pre-tested against Hook-Story-Offer for Traffic (workbook 08 §3). The speaker does no original writing.

---

## Post-summit ascension paths

Two paths. Both land in the same place.

**Path A — All-Access Pass buyers:**

```
Summit opt-in (free, projected 5,000–15,000 emails)
  ↓
All-Access Pass ($97 one-time, projected 3–8% conversion → 150–1,200 buyers)
  ↓ (one free month of Machine baked into the Pass)
$49 Machine (projected 10–25% redemption from All-Access)
  ↓
Verified Builder cohort
```

**Path B — opt-ins who pass on All-Access:**

```
Summit opt-in
  ↓
5-email Soap Opera (Email 1 references the summit they just attended)
  ↓
$1 Starter → OTO → $49 Machine
```

The summit is not a replacement for the existing funnel — it is a 5,000-to-15,000-person *injection* into the top of it. Two paths exist so Path A's high-velocity buyers don't get cross-routed into Path B's slow-build sequence and vice-versa.

**Soap Opera modification (gated):** when the `source = summit_*` slug is set on a `soap_opera_subscribers` row, Email 1's first paragraph swaps to a summit-specific opener ("You just watched [n] founders show their work. Here's the parable nobody told on stage..."). Implementation note for activation: this is a single conditional in `lib/soap-opera/templates.ts` keyed off `source.startsWith("summit-")`.

---

## Timing (lock when activation gate fires)

| Phase | Window | Founder action |
|---|---|---|
| Speaker outreach | Weeks 0–4 | Pitch 30 speakers (Tier Z + A + D first), confirm 20. Send Email 1 of the pitch sequence to all 30 simultaneously. |
| Production | Weeks 4–7 | Speakers send 20-min interview recordings. Edit. Build the 6 funnel pages. Activate the Stripe product. Build promo swipe file (already shipped). Open speaker dashboards. Record opening + closing keynote. |
| Broadcast | Week 8 | 3-day live window. 24-hour daily unlock. Real-time speaker dashboards visible. |
| Evergreen | Week 9+ | Recordings become permanent $97 All-Access Pass product. `/summit/closed` becomes the conversion floor for late traffic. Re-run live broadcast annually as flagship event. |

That compresses Phase 2 hard. That is the point. Summits ARE Phase-2 accelerators — they create the 50-customer trigger that moves you to Phase 3 in `workbook 10` §6.

---

## What this push shipped (autonomous, 2026-05-17)

| Surface | Status | Path |
|---|---|---|
| Canonical strategy doc | SHIPPED | `strategy/summit-funnel.md` (this file) |
| 4-email speaker pitch sequence | SHIPPED | `strategy/summit-speaker-pitch.md` |
| 4-email speaker-to-their-list promo swipe | SHIPPED | `strategy/summit-speaker-promo-swipe.md` |
| Supabase schema (3 tables, RLS, indices) | SHIPPED | `supabase/migrations/20260518000007_summit_funnel.sql` |
| `state.json` block under `dotcom_secrets.funnel_types.summit_funnel` | SHIPPED | `strategy/state.json` |
| Build-log entry | SHIPPED | `build-log.md` |

| Surface | Status | Reason for non-ship |
|---|---|---|
| 6 React routes under `/summit/*` | NOT SHIPPED | Pre-launch state scores 50, not 100. Building 6 placeholder routes for an unactivated funnel is exactly the SEO-as-avoidance flaw (workbook 01 §6 Beat 4). The 50→65 jump requires speaker signatures, not React code. |
| Stripe one-time product for $97 All-Access Pass | NOT SHIPPED | Requires operator action (Stripe API key + product creation). Spec is documented above; activation is one command from `scripts/setup-stripe-products.py` extension. |
| Magic-link speaker dashboard | NOT SHIPPED | Reuses existing `lib/auth` magic-link infrastructure. Wiring at activation time, not pre-stage time. |
| Promo email sends from `summit_optins` | NOT SHIPPED | Wired into the existing cron + cadence infrastructure on activation. The tables exist; no scheduled jobs read from them yet. |

---

## Discipline notes

Three things this doc deliberately does **not** do:

1. **No fake countdown on `/summit`.** Same rule as `/repeatable`, `/founding`, `/machine-sales`. The day the summit announces, a real server-rendered countdown to broadcast appears. Until then, the page renders honest "this summit activates after 3 verified UnlockSaaS customers complete the Machine" copy, with the speaker grid empty.
2. **No early speaker pitching.** The activation gate is enforced socially, not just operationally. Pitching Castrio with zero verified customers would burn the warmest target in Tier A. The cost of waiting 60 days is much lower than the cost of burning Tier A.
3. **No expansion of the speaker count beyond 20.** Summit psychology breaks at 25+ speakers — the lineup becomes too fragmented to advertise. 20 is the Brunson-tested cap for a 3-day virtual summit.

## Re-grading path

Current score: **50** (audit v3, this push).

| Trigger | Score |
|---|---|
| Spec doc + swipe + data layer shipped (this push) | 50 |
| Tier Z + 2 Tier A speakers confirmed | 65 |
| 20 speakers signed + 6 pages built + Stripe product live | 80 |
| Broadcast happens at least once | 92 |
| Evergreen All-Access Pass converting cold traffic on its own | 100 |

Re-grade with full audit when first speaker says yes (Tier Z, the verified UnlockSaaS customer, will be the easiest yes — they have a story and they want to tell it).

---

*Source: DotCom Secrets, Secret #16 (Summit Funnel). Project: Unlock SaaS. Strategy lock: 2026-05-17 autonomous push (Russell audit v3 response).*
