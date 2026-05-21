# UNLOCK THE SECRETS: Workbook

**Project:** Unlock SaaS *(working title)*
**Business model:** Micro-SaaS
**Step 9 of 10:** Fill Your Funnel
**Source:** Traffic Secrets, Section Two (channel playbooks, organic + paid)
**Status:** COMPLETE. Launch-minimum + post-launch playbook.

> "Pick your channels by where your dream customer already congregates. Pour everything into one or two until the funnel is full." (Russell Brunson)

This step is mostly POST-LAUNCH. Channel tactics depend on what the funnel teaches once it is live. Launch-minimum is identified explicitly.

---

## Section 1: Launch-Minimum (pre-Stripe-charge)

Before the first paying customer, run TWO channels and ignore all others. Master one channel before adding the next.

### Channel 1: Twitter / X (build-in-public)

**Why:** Alex lives here. Densest concentration of post-launch pre-revenue founders globally.

**Cadence:**
- 1 thread per week (Reluctant Hero parable from workbook 01 Section 6 Beat 3, expanded to thread form).
- 2 to 3 short posts per day (observations, build updates, parable fragments).
- DM 5 Dream 100 individuals per week (Category 2). One question per DM. No pitches.

**Format:**
- Lead with a parable opening line.
- End every thread with a SINGLE link to the Free Diagnostic.
- Never multi-link. Never bullet-point pitches. Story first, offer at bottom.

**Bio:** the one-line bio from workbook 01 Section 6 Beat 2. Plus a link to the Free Diagnostic.

### Channel 2: Indie Hackers + r/SaaS / r/microsaas

**Why:** Alex's two highest-density forums after X.

**Cadence:**
- 1 long-form post per week on Indie Hackers (parable expanded to 400 to 600 words).
- 1 long-form post every 2 weeks on r/SaaS or r/microsaas (rotating).
- Daily comments on others' posts. Value-first. Compliment + question + insight pattern.

**Format:**
- Indie Hackers and Reddit hate promotion. Story first, ZERO offer at the bottom of the post. Offer goes in profile bio + a single reply if someone asks "how do you do that."
- Soap Opera rule enforced harder here than on X.

### Other channels at launch: SKIP

| Channel | Why skipped |
|---|---|
| Instagram | Alex does not congregate here. |
| Facebook | OFF at launch — Alex's density per dollar is ~1/10 of X; $0 MRR caps the 10%-of-MRR ad budget at $0; `strategy/dollar-objections.md:100` cites Alex-verbatim "FB ads don't work" experience. Full four-phase evidence-gated channel spec at `strategy/facebook-channel.md` (Phase 1 trigger: 3 verified customer cycles; Phase 2: 50 paying customers; Phase 3: 100 + CAC/retention gates; Phase 4: 200 customers for Conversation Domination amplification). |
| TikTok | Possible Phase 2 if short-form video pulls Alex's audience; not at launch. |
| YouTube (host, founder-on-camera) | Phase 2 (UNCHANGED). Production cost too high pre-PMF. Full 4-condition activation rule at `strategy/decisions/youtube-channel-stance.md` (50+ customers + 3 evergreen tutorial topics + bandwidth + cohort/organic-pull). |
| YouTube (host, **faceless**) | **SUPERSEDED 2026-05-21**: shipped as channel #5 ADDITIVE to the launch-minimum-four. Faceless production (script + ElevenLabs VO + Veo 3 B-roll + Descript edit) restores the solo-founder constraint that originally gated the on-camera format. Series: Alex's Diary, 30-episode arc, $0 to first paying customer. Canonical doc: `strategy/youtube-faceless-channel.md`. Hub: `/youtube`. Source frame: Isenberg overlay (memory/project_unlocksaas_isenberg_playbook.md). |
| Google Ads | Phase 2. Cold-traffic conversion at $49 burns money pre-PMF. |
| LinkedIn | Possible Phase 2 if B2B Alex-equivalent exists. Skip at launch. |
| Podcasting (host) | Phase 2. Hard to produce, slow to compound. |
| Podcasting (guest) | Allowed at launch but reactive only (accept invites, do not pitch). Deployable pitch kit at `strategy/podcast-outreach.md` — gate: first verified-customer cycle. |
| YouTube (guest) | Allowed at launch (reactive accept any time; cold-outbound gated to first verified-customer). Deployable pitch kit at `strategy/youtube-outreach.md` — 7 channel dossiers (Riley Brown / Indy Dev Dan / Build Your SaaS / IH YouTube / Marc Lou contribution / Justin Welsh / Greg Isenberg). |

Launch focus: X + Indie Hackers + Reddit. Master those before expanding.

---

## Section 2: The JK5 Publishing Plan

Brunson teaches: every platform you publish on, you publish in 5 categories. Rotation gives the audience expectations and the algorithm clear signal.

### JK5 categories for Unlock SaaS

| Category | Topic | Voice anchor |
|---|---|---|
| 1. Personal | The build, behind the scenes, the founder running The Playbook on himself | Reluctant Hero confession |
| 2. Process | The 7-step Playbook, deconstructed one step at a time | Mechanical, no fluff |
| 3. Pattern | What the founder sees in the 10+ conversations and the cohort | Reporter / observer |
| 4. Polarity | AGAINST lines from workbook 01 Section 6 Beat 5 | Sharp, opinionated |
| 5. Proof | Real wins when they exist: first paying customers, Stripe screenshots | Honest, no fabrication |

Each post fits ONE category. Mix across the week.

---

## Section 3: Secret #8, Fill Your Funnel Framework

Pick a platform, pick a cadence, fill from cold to free email to $1 to $49.

### Flow for Unlock SaaS

```
Cold reader on X / IH / Reddit
   ↓ (sees parable post)
Profile bio / link
   ↓
Free Diagnostic squeeze
   ↓ (gives email)
5-email Soap Opera (workbook 04 Section 5)
   ↓
$1 Starter checkout
   ↓ (OTO)
$49 Playbook subscription
   ↓
First paying customer in 60 days (Stripe webhook)
```

Every channel feeds the top of this flow. Flow itself does not change channel to channel.

---

## Section 3.5: Owned-Traffic Policy (Secret #5 reference)

The full policy lives at [`strategy/owned-traffic.md`](../owned-traffic.md). This section is the workbook-side pointer so future audits and revisions know where the canonical doc lives without re-deriving the policy here.

**Why a dedicated policy file:** Brunson Secret #5 (Traffic You Own) demands three things — a written audit of every owned asset against the exportable/off-platform-reachable/replicable test, a portability proof you can run on demand, and at least one owned discovery channel beyond email. A scattered version of this lives across this workbook + workbook 10 + the marketing-ESP decision; [`strategy/owned-traffic.md`](../owned-traffic.md) consolidates it.

**What the policy locks:**

1. **7 owned assets at launch** — Soap Opera, Seinfeld, Founding waitlist, Challenge subscribers, Verified Builder directory, Member area, Stripe customer list. Each passes Brunson's three-test rule.
2. **8 capture surfaces** — every page that can opt-in to email or buy. No orphan surfaces.
3. **List-portability proof** — `scripts/export-subscribers.py` dumps all 4 subscriber tables to timestamped CSV. Service-role gated. Run monthly pre-PMF, on-demand for ESP migration or GDPR Article 20.
4. **Second owned-discovery surface** — `/builders` route. Public Verified Builder directory. The second-most-valuable owned asset after email.
5. **ESP migration plan** — Resend now, Kit at 100 subs. 8-step checklist + rollback condition. No re-permission email (sender identity preserved across vendor swap).
6. **Cross-channel re-engagement matrix** — every owned asset's "from → to" trigger documented (Soap Opera → buyer, Founding waitlist → buyer, member → Verified Builder, etc.).
7. **Honest value-per-asset math** — pre-launch all assets price at $0 (no subscribers yet). At first verified customer + 100 list members: ~$3,800/mo equivalent. At 50 customers: ~$19,400/mo + brand-equity directory value.

**The rule the policy enforces above all others:** an owned asset is only owned if you can export it tomorrow, reach it without paying a platform, and replicate it on a second provider. Anything failing any one of those three is rented. Re-grade quarterly.

---

## Section 3.6: Follow-Up Funnel Architecture (Secret #6 reference)

The full architecture lives at [`strategy/follow-up-funnels.md`](../follow-up-funnels.md). This section is the workbook-side pointer.

**Why a dedicated doc:** Brunson Secret #6 of Traffic Secrets is not "have several email lists." It is the **system** that decides who gets what when, with explicit rules for overlap, termination, and reversibility. A scattered version of this lived across `lib/soap-opera/`, `lib/seinfeld/`, `lib/founding/`, `lib/challenge/`, `/api/unsubscribe`, and the Stripe webhook. [`strategy/follow-up-funnels.md`](../follow-up-funnels.md) consolidates it.

**What the architecture locks:**

1. **5 live cadences** — Soap Opera (5-day), Seinfeld (ongoing weekly), Founding Pre-Launch (6-email PLF), Challenge (14-day), **Cart Abandonment Recovery (3-email)** [new this revision].
2. **2 deferred cadences with explicit gates** — Win-Back (on first cancellation), Reactivation (on 100+ unsubscribed rows).
3. **Trigger taxonomy** — each cadence has exactly ONE entry trigger; no silent cross-enrolment except via explicit Seinfeld opt-in CTA in final emails.
4. **Subscriber state machine** — `active` / `complete` / `recovered` (cart only) / `unsubscribed` / `bounced`; all transitions reversible.
5. **Overlap priority order** for same-day collisions: Founding > Cart Recovery > Soap Opera > Challenge > Seinfeld.
6. **Termination rules** — every cadence has a written end. No "ghost in the list."
7. **One-click unsubscribe** — single HMAC token clears every list in one click. RFC 8058 compliant.
8. **Staggered cron schedule** — 14:00 / 15:00 / 16:00 / 17:00 / 18:00 UTC, one per cadence. Reduces co-send risk to zero pre-launch.

**Cart Abandonment Recovery — the new fifth cadence:** trigger = Stripe `checkout.session.expired` on any priceType. 3 emails over 7 days (Day 0 inline, Day 2, Day 7). Resume link routes to `/starter` or `/playbook-sales` (NOT the expired Stripe session URL). Short-circuits to `status='recovered'` the moment a fresh `checkout.session.completed` fires for the same email — Brunson rule: stop chasing the second they buy.

**Audit close:** Traffic Secrets Secret #6 lifted from 88 → 100 by closing the two concrete gaps (no meta-architecture doc; no cart recovery cadence). Expert Secrets Secret #17 lifts in parallel to ~95, capped until first email lands in a real inbox.

---

## Section 4: Secret #9, Fill Your Funnel Organically

Full organic playbook in Section 1 above. Two additions:

### Hook rotation

Cycle the 12 hooks from workbook 01 Section 5. Track which earn the most engagement. Top three become hero-page headlines and ad creative for Phase 2 paid.

### Public proof loop

Every time the Playbook fires "First Paying Customer Verified" for any user (with permission), the founder posts a screenshot (anonymized as needed), with the parable of that founder's journey, with credit. Public proof compounds social capital.

---

## Section 5: Secret #10, Fill Your Funnel with Paid Ads (Phase 2)

DEFERRED. Activates when:
- Free Diagnostic converts 30%+ from organic.
- $1 Starter converts 5%+ from cold-warm.
- 3+ customers have completed a first-paying-customer cycle (success rate of the Playbook known).

**Cross-reference:** The full Google-specific paid-search playbook (campaign structure, RPL/max-CPC math, negative-keyword seed list, ad copy in Reluctant Hero voice, kill-switch protocol) lives in [strategy/google-strategy.md](../google-strategy.md) §C. The launch-day brand-defense $5/day exact-match campaign on `unlocksaas` is the **only** Google Ads spend permitted before the three gates above all fire — it is a Brunson-rule-clean arbitrage defense, not a growth bet.

When activated:

| Ad type | Platform priority | Offer |
|---|---|---|
| Prospecting (cold to warm) | X, Reddit, podcast/newsletter sponsorships | Free Diagnostic only |
| Retargeting (warm to buy) | Same platforms, retarget squeeze visitors | $1 Starter |
| Upsell (paid email) | Targeted email lists | $49 sales page |

### Budget logic

- Starting budget: 10% of monthly recurring revenue.
- Kill any ad that does not produce a Free Diagnostic email at CAC < $5 within 7 days.
- Scale any ad that does produce email at CAC < $5 until it does not.

---

## Section 6: Secrets #11 to #14, Platform-Specific Playbooks (Phase 2)

For Unlock SaaS, the four chapters reduce to:

| Platform | Phase 2 role | First test |
|---|---|---|
| Instagram | Likely never (Alex does not live here) | Skip indefinitely unless data proves otherwise |
| Facebook | Evidence-gated four-phase activation (Phase 1 pixel + Conversions API at 3 verified; Phase 2 retargeting + lookalike-from-buyers at 50 customers; Phase 3 cold prospecting at 100 + 4 CAC/retention gates; Phase 4 Conversation Domination amplification at 200) | Phase 1 first test = install Meta Pixel + Conversions API via Stripe webhook server-side, seed three custom audiences (warm / intent / buyer) from existing `diagnostic_leads` + `verified_conversions` rows, ZERO ads. Full spec at `strategy/facebook-channel.md` with ad creative families, kill criteria, and code pre-stage. |
| Google (search) | Phase 2 paid + organic + AEO/GEO | See [strategy/google-strategy.md](../google-strategy.md). Surface A (organic) + Surface B (AEO/GEO) ship at launch via `app/src/app/sitemap.ts`, `app/src/app/robots.ts`, and schema.org JSON-LD on `/`, `/diagnostic`, `/playbook-sales`. Surface C (paid) deferred per §5 gates. |
| YouTube | Phase 2 long-tail SEO (host) + active guesting at launch (kit at `strategy/youtube-outreach.md`) | Host: trigger conditions in `strategy/decisions/youtube-channel-stance.md` Part 1 (4 conditions, all required). Guest: Tier A pitches (Riley Brown + Indy Dev Dan) send Thu post-first-customer; Tier B-D follow per kit §A 4-week cadence. |

Each gets a deep dive in Brunson's full Traffic Secrets. For Unlock SaaS the launch focus does not include them — except Google's organic + AEO surfaces, which are zero-marginal-cost pre-staging and ship at launch per [strategy/google-strategy.md](../google-strategy.md).

---

## Section 7: Secret #15, Conversation Domination (MVP at launch + Phase 2/3 expansion)

**Status (revised 2026-05-17):** SUPERSEDED by [strategy/conversation-domination.md](../conversation-domination.md). The MVP version is a publishing discipline that ships at launch (Layers 0–5 in the canonical doc); the mature version is a Phase 2/3 expansion. Originally scored N/A by the Russell audit; re-graded to 95 pre-launch with the canonical doc + the `traffic_secrets.growth_hacking.conversation_domination` block in `state.json`. Re-grading pattern matches `funnel-stack.md`, `funnel-hackers-cookbook.md`, `seven-phases-coverage.md`.

### What ships at launch (MVP)

| Layer | Surface |
|---|---|
| 0 — Sound bites | Five rotating JK5-keyed phrases in copy on `/`, `/diagnostic`, `/playbook-sales`. Meta-canon: "We measure progress in Stripe charges, not in encouragement." |
| 1 — Weekly anchor | Indie Hackers long-form, parable-led, one per week (Week 1 = `strategy/content-queue-week-1.md`) |
| 2 — Atomic fragments | 7–12 derivatives per anchor (X thread + shorts + Reddit drop + comment templates + newsletter snippet) |
| 3 — Channel deployment | X + Indie Hackers + r/SaaS + r/microsaas + owned newsletter |
| 4 — Comment craft | 5 substantive value-first comments per day across the active channels |
| 5 — Frequency target | 7+ touches before `/diagnostic` opt-in, measured via PostHog `$first_touch` + `usaas_stack_subject` cookie |

**Channels deliberately skipped:** Instagram, Facebook primary, TikTok, LinkedIn-primary. Facebook has its own evidence-gated activation track per `strategy/facebook-channel.md` (Section 6 of this workbook). Re-evaluate the rest quarterly with data.

### Phase 2 / Phase 3 expansions

| Trigger | Adds |
|---|---|
| First verified customer | First podcast pitch sent (Tier 1 = Bootstrapped Founder per `strategy/podcast-outreach.md`) |
| 3+ verified customer cycles | Layer 1 anchor type expands to include podcast guest spots alongside IH long-forms |
| 50+ paying customers | Layer 1 expands to own podcast (founder-hosted weekly); paid retargeting tested |
| 100+ cold opt-ins / week | A/B test channel-specific hooks for the same parable |

Goal: Alex encounters the Reluctant Hero voice 7+ times across different surfaces, by accident, before he opts in. The MVP makes that measurable; the Phase 2 expansion makes it inevitable.

See [strategy/conversation-domination.md](../conversation-domination.md) for the full Brunson Hard-Rule reconciliation table, the frequency-distribution SQL, the atomic-content workflow rules, and the activation-gate enumeration.

---

## Section 8: State.json Inserts

Under `traffic_secrets.fill_funnel`:

- Launch channels (X, IH, Reddit) marked active.
- All other channels marked deferred with criteria for activation.
- JK5 publishing categories named.
- Paid-ad activation criteria specified.
- Phase 2 platform playbook noted, not built.

## Section 9: Activation Manifest (locked 2026-05-17)

The workbook above defines the WHAT (which channels, which voice, which cadence). The activation manifest at `strategy/fill-your-funnel-manifest.md` defines the HOW: per-channel deployable bridge asset, per-channel attribution slug, per-channel red-line, per-channel audible, per-channel activation gate.

The manifest closes Secret #8 to 100 by adding the operational layer the workbook did not own:

- **Slug taxonomy** — `<channel-token>-<sub-token>[-<variant>]` shape, enforced at module load by `app/src/lib/fill-your-funnel/link-registry.ts`.
- **Typed UTM builder** — `app/src/lib/utm.ts` prevents UTM typos that fragment Stripe attribution.
- **Short-link redirect** — `app/src/app/r/[slug]/route.ts` stamps UTMs, writes a click row, sets the stack subject cookie, 302-redirects. 404 for unknown slugs, 410 for gated channels.
- **Click event store** — `supabase/migrations/20260517050000_link_clicks.sql` — append-only, RLS anon-insert with shape-validated CHECK constraints, service-role reads only.
- **Per-channel ROI views** — `supabase/views/fill_your_funnel.sql` — three views (per-slug daily, per-channel daily, channel→diagnostic forward-compatible) for the weekly Channel-ROI read.

**Launch-active slugs (per manifest):** `x-bio`, `x-thread-<parable>` (5 parables), `x-reply-diagnostic`, `ih-bio`, `ih-longform-<parable>`, `reddit-bio`, `reddit-post-<parable>`, `dm-tier-a-{castrio,lou,chen,kahl,iqbal}`, `founding-waitlist`, `founding-plv-{1,2,3}`, `founding-cart-open`.

**Gated slugs (registered, will 410 until activation gate fires):** `podcast-*` (first verified customer), `newsletter-*` (3+ verified cycles), `integration-*` (3+ verified cycles), `ad-*` (Phase 2 stacked gates), plus dynamic `aff-*` (50+ customers) and `exit-*` (Phase 2 + 100 captured exits).

**Operator daily checklist** (per channel, per day, per cadence) lives in the manifest's "Daily checklist" and "Weekly checklist" rows for each channel.

**Read recipe** (weekly Channel-ROI):

```sql
select * from public.fill_your_funnel
where day > now() - interval '7 days'
order by clicks desc;
```

---

## Status

**Step 9 COMPLETE.** Launch-minimum is X + Indie Hackers + Reddit + Dream 100 DMs Tier A + Founding PLF. JK5 publishing categories defined. Paid ads deferred with explicit activation criteria. Platform-specific playbooks (Instagram / FB / Google / YouTube) noted as Phase 2. Conversation Domination reserved for Phase 2.

**Secret #8 Activation Manifest LOCKED 2026-05-17** (v2 — closes audit gap 78 → 100 under stage-appropriate scoring). Canonical doc: `strategy/fill-your-funnel-manifest.md`. Code companions: `app/src/lib/utm.ts`, `app/src/lib/fill-your-funnel/link-registry.ts`, `app/src/app/r/[slug]/route.ts`, `supabase/migrations/20260517050000_link_clicks.sql`, `supabase/views/fill_your_funnel.sql`.

**Next:** Step 10, Growth Hacking.

---

*Workbook: Unlock the Secrets. Project: Unlock SaaS. Generated with Brunson Architect.*
