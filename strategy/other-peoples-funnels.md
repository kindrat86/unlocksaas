# Other People's Funnels — UnlockSaaS

**Project:** UnlockSaaS
**Chapter source:** DotCom Secrets Secret #13 ("Other People's Funnels") — the cross-cutting Brunson chapter that ties Dream 100, Work-Your-Way-In / Buy-Your-Way-In (TS #4), Integration Marketing (TS #2 / DCS #13), Podcast Guesting (TS #13), Summit Funnels (DCS #16), and the Affiliate Army (TS #18 / DCS #17) into a single discipline.
**Status:** READY (2026-05-17, autonomous push to close v3 audit row DCS #13 30 → 90).
**Companion artifacts:**
- `strategy/dream-100-outreach.md` (the deployable outreach kit — 20 dossiers + reply bank + per-touch tracker)
- `strategy/dream-100-value-first-bank.md` (pre-written public-reply templates per Tier-A target — *the* warm-up text)
- `strategy/integration-partners/*.md` (5 deep-dive integration packets — Lovable / Stripe Atlas / Indie Hackers / Bootstrapped Founder / Kit)
- `strategy/summit-speaker-kit.md` (the Summit Funnel speaker pitch + 4-week speaker warm-up cadence + cohort math)
- `strategy/podcast-outreach.md` + `strategy/podcast-media-kit.md` (Tier 1–3 podcast warm-up + public host-facing kit)
- `strategy/youtube-outreach.md` (7-channel YouTube guest kit)
- `supabase/migrations/20260518000007_dream_100_touches.sql` (the touch-log table — Brunson's "if you don't log it, it didn't happen" rule)
- `supabase/views/dream_100_touches.sql` (the "stale targets" + "warm-up rule violations" views the Friday Audible Call reads)
- `app/src/app/(marketing)/affiliates/page.tsx` (the 410-gated affiliate landing page that auto-activates at 50 paying customers)
- `app/src/lib/affiliate/index.ts` (slug + gate helpers; gate state read from `verified_conversions` count)
- `scripts/setup-affiliate-stripe-coupons.py` (pre-creates the 30%/50%/40% Stripe coupon codes via API, gated behind a confirmation prompt)

---

## §0 — What Brunson actually means by "Other People's Funnels"

The chapter title misleads first-time readers. Brunson is not saying "go copy other people's funnels" (that's DCS #5, Funnel Hacking — covered in `strategy/funnel-hacks.md`). He is saying: **the highest-leverage growth move at every stage of a SaaS is to use someone else's already-built audience instead of building one from scratch.**

Five concrete mechanisms, in priority order for a pre-revenue micro-SaaS:

| # | Mechanism | What it is | UnlockSaaS gate | Highest-leverage Phase |
|---|---|---|---|---|
| 1 | **Work-your-way-in DMs + public reply** | Substantive earned engagement with the 100 specific people who already have your dream customer. No pitch. Story first. Compliment + question. | Active at launch | Launch |
| 2 | **Podcast guesting** | 30–60 min on someone else's mic to their existing audience. The single highest-velocity trust transfer. | First verified customer cycle closed | Phase 1.5 |
| 3 | **Integration marketing** | Embedded inside another product's user flow (Lovable's "after you ship" docs, Stripe Atlas's post-launch checklist, IH's onboarding). Sustained, evergreen, no per-touch cost after build. | 3+ verified customer cycles | Phase 2 |
| 4 | **Summit funnel as host** | You curate 20 speakers, they each promote to their list, you keep the email list + the buyer relationships. The Phase 2 nuclear option. | 3+ verified customers (so the founder keynote opens with proof, not vapor) | Phase 2 |
| 5 | **Affiliate army** | Pay other people to recommend you with code-verified attribution. Brunson rule: "join my affiliate program" reads as desperation below 50 customers, scalable above it. | 50+ paying customers | Phase 3 |

These are not five different chapters with five different audits. They are five different *speeds* of the same single discipline: **borrow audiences.**

---

## §1 — The activation matrix (one row per mechanism)

Every OPF mechanism has the same five columns. If any column is blank, the mechanism is not "ready," it's "wishful."

| Mechanism | Trigger | Pre-staged artifact | Tracking surface | Friday Audible-Call view |
|---|---|---|---|---|
| Work-your-way-in DMs | Launch day, week 1 cadence per `dream-100-outreach.md` §1 | 20 dossiers + 5 Tier-A DMs + value-first reply bank | `dream_100_touches` table (`channel='x_dm' OR 'x_reply' OR 'ih_reply' OR 'newsletter_reply'`) | `vw_dream_100_targets_stale` (any Tier-A with zero touch in last 14 days) |
| Podcast guesting | First verified customer cycle closes inside The Machine | 5 Tier-1 pitches + media kit + 6 bridge slugs (`/from/[slug]`) registered in `app/src/lib/podcasts.ts` | `dream_100_touches` (`channel='podcast_pitch' OR 'podcast_recorded' OR 'podcast_live'`) + Stripe metadata `usaas_stack_subject` | `vw_podcast_pipeline` (warm → pitch_sent → call_booked → recorded → live → bridge_traffic) |
| Integration marketing | 3+ verified customer cycles closed | 5 deep packets in `strategy/integration-partners/*.md` + each pitch references real customer names | `dream_100_touches` (`channel='integration_warmup' OR 'integration_pitch' OR 'integration_active'`) | `vw_integration_pipeline` (warmup → pitch_sent → call_booked → terms_agreed → live) |
| Summit funnel | 3+ verified customers (founder keynote opens with proof) | `strategy/summit-speaker-kit.md` — speaker pitch, 4-week warm-up cadence, 6-page funnel spec, 4.8x All-Access stack math | `dream_100_touches` (`channel='summit_pitch' OR 'summit_confirmed' OR 'summit_promoting'`) + `summit_referrals` table (per-speaker affiliate tracking) — *gated* | `vw_summit_speaker_pipeline` (gated_for_now) |
| Affiliate army | 50+ paying customers | `/affiliates` page (410 until gate) + Stripe coupons pre-created via `setup-affiliate-stripe-coupons.py` + tiered commission math locked in `strategy/dream-100-outreach.md` §6 | `dream_100_touches` (`channel='affiliate_application' OR 'affiliate_approved' OR 'affiliate_first_conversion'`) + `affiliate_referrals` table (gated) | `vw_affiliate_pipeline` (gated_for_now) |

**The matrix is the discipline.** Every Friday Audible Call (per `strategy/funnel-audibles.md` Part 5), the operator reads these five views in order. If a mechanism's pre-stage is missing, that's the audible. If the trigger has fired but the mechanism hasn't moved, that's a bigger audible.

---

## §2 — Brunson's hard rules for Other People's Funnels (reconciliation matrix)

These are non-negotiable per Brunson canon. Each row maps a hard rule to the UnlockSaaS-specific honoring of it.

| # | Brunson hard rule | UnlockSaaS honoring | Code/strategy enforcement |
|---|---|---|---|
| 1 | "Give before you ask." Every audience-borrow must deliver value first. | Five mechanisms gated by warm-up reps. Cold pitch (zero touches) is the single most-broken anti-pattern in the chapter. | `dream-100-outreach.md` §0 rule #2 + `vw_dream_100_warmup_violations` view fires when `dm` row exists with <2 prior `public_reply` rows for same target |
| 2 | "Their audience is on loan, not transfer." Treat someone else's audience as borrowed; never extract aggressively, never promote outside the agreed angle. | Soap-Opera-only follow-up from any borrowed source. No cold pitch to email captured during a podcast appearance or summit. | `dream_100_touches` row `source_subject_id` carries through to `soap_opera_subscribers.source` — visible audit trail |
| 3 | "The first message that contains a link IS the pitch." | All warm-up replies are link-free. The Bridge page (`/from/[slug]`) only renders for podcast listeners after a recorded appearance airs. | `app/src/lib/podcasts.ts` `PodcastBridgeEntry.status` gates `/from/[slug]` to `'live' | 'evergreen'` |
| 4 | "Compliment + question, never compliment + ask." | Every Tier-A DM in `dream-100-outreach.md` §2 ends with a question, never a request. Every public reply in `dream-100-value-first-bank.md` carries an observation + a question. | DM template review acceptance test: every template must contain `?` and zero of `unlocksaas.com`, `link in bio`, `check out` |
| 5 | "Mention your own work only when asked." | Six-line bio is reserved for the response-after-they-DM-back. The opening DM never names the product. | DM templates contain `UnlockSaaS` zero times outside the `--Maryan` signature line |
| 6 | "Pitch only after proof." | Podcast / integration / summit / affiliate pitches are gated to verified-customer milestones, not time-based. | `app/src/lib/affiliate/index.ts::isAffiliateGateOpen()` reads `verified_conversions` count; `<410 />` until ≥50 |
| 7 | "Track every touch or it didn't happen." | All five mechanisms write to `dream_100_touches`. Five SQL views surface staleness, gate state, and rule violations. | Migration `20260518000007_dream_100_touches.sql` + views in `supabase/views/dream_100_touches.sql` |
| 8 | "OPF compounds; daily-presence beats sporadic-blitz." | 4-week launch cadence (`dream-100-outreach.md` §1) is the rhythm. Tier A's all get a touch on the same weekday each week. | `vw_dream_100_cadence_health` view computes the touches-per-week-per-target rolling mean; red below 1 |
| 9 | "An audience-borrow without a give-back is a one-shot." | Every active mechanism carries a give-back built into the warm-up — public-reply with insight, podcast recap that promotes the host's product, integration that drives traffic back to the partner's offer, summit that pays speakers 50%. | Per-mechanism documentation in `strategy/integration-partners/*.md` §"What they get from this deal" |
| 10 | "Borrowed audience without a list capture is a missed audience." | Every audience-borrow surface has a list-capture: `/diagnostic` for cold readers, `/from/[slug]` for podcast listeners, `/founding/v1-3` for waitlist-routed PLF traffic, integration-partner co-branded squeeze pages for embedded surfaces, `/summit/access` for summit opt-ins. | `traffic_secrets.fill_funnel.activation_manifest` registered slugs (`x-bio`, `ih-bio`, `reddit-bio`, `podcast-*`, `integration-*`, `summit-*`) all route through `app/src/app/r/[slug]/route.ts` short-link with UTM stamp + cookie + click row |

The reconciliation matrix is the closeout test. Any new OPF play must answer all ten rows before shipping.

---

## §3 — The four-mode framing of Marco for OPF (Eugene Schwartz applied to borrowed audiences)

A borrowed audience has the host's existing relationship overlay. Marco-on-someone-else's-channel is not the same as Marco-on-our-homepage. Treat the temperature differently per host channel.

| Host channel | Marco's existing relationship | Awareness level on landing | First-message tone | Soap Opera entry point |
|---|---|---|---|---|
| Anthony Castrio's IH community | Trusts Castrio. Pre-disposed to indie founder tools Castrio recommends. | Solution-aware (knows tools exist, has tried some) | "Here's the door Castrio mentioned" framing | Email 2 (Stripe Refresh parable — bypasses Day 0 diagnosis since the diagnosis happened on the podcast or in-community) |
| Marc Lou's ShipFast Twitter | Trusts Marc's stat-cadence. Skeptical of any tool that doesn't ship publicly. | Solution-aware + build-skeptic | "Same shape as you, here's what I'm building publicly" | Email 1 (full diagnosis Day 0) — has not yet seen the framework |
| Indie Hackers sponsored long-form | Cold relative to UnlockSaaS, warm relative to IH editorial. | Problem-aware | Pain-mirror Hook #3 + 2 paragraphs + diagnostic CTA | Email 1 (full diagnosis Day 0) |
| Bootstrapped Founder podcast | Hot relative to Arvid Kahl's embedded-entrepreneur frame. | Solution-aware + framework-respecting | "The work Arvid pointed at, but for non-engineers who shipped before the audience" | Email 2 — host's framework already did the diagnosis-equivalent work |
| Lovable post-launch docs | Mid-warm. Marco respects Lovable but is in active "I just shipped, now what" mode. | Problem-aware + post-launch | "Here's what to do this week, by a non-engineer who shipped on Lovable and figured it out" | Email 1 (full diagnosis Day 0) |
| Summit cold opt-in | Cold relative to UnlockSaaS, warmed by the 20-speaker promise. | Problem-aware → solution-aware over 3 days | Hook #10 (contrarian: "Your launch is fine, it's the work you skipped") | Soap Opera Day 0 (full sequence) + 6-email PLF override during cart window |
| Affiliate-driven sign-up | Trusts the affiliate (peer, often a customer). | Solution-aware → product-aware | "Your friend's tool worked, here's the door" | Email 2 (skip diagnosis, the affiliate did it) |

**The rule:** the bridge page (`/from/[slug]` or `/r/[slug]`) and Soap Opera entry point are picked by host channel, not by visitor behavior. The host's audience-relationship sets the temperature.

---

## §4 — The "give before you ask" math (defensible value-exchange per mechanism)

The brittle question every OPF mechanism eventually faces: *"why would they say yes?"* If the only honest answer is "because the product is good," that's a no. The honest answer must be a value-exchange the host can math themselves.

| Mechanism | What we give the host | Defensible value (in their currency) | Why a skeptical host says yes |
|---|---|---|---|
| Tier-A public reply | Substantive insight that makes their post better in the replies (proven by their reply or retweet) | ~$0 cost to us, ~$50–500 of marginal engagement to them | They get a smart contributor; we get the right-to-reach over weeks |
| Tier-A DM (after warm-up) | A specific question that, when they answer, becomes content they would have written anyway | ~$0 to us, 1 high-quality reply for their tweet stream | The question is their content prompt |
| Podcast guest appearance | A 45-min recorded episode + 8 derivative content artifacts (clip, story-clip, IH long-form, transcript, parable extraction, resource pack, soap-opera swap, referral loop — `strategy/podcast-outreach.md` §6) + a bridge page (`/from/[slug]`) that promotes the host's other content | ~10 hours of our time × ~10 hours of their listener time × engagement compounding | They get content + a guest with derivative-content competence (not most guests have this) |
| Lovable integration | Embedded Free Diagnostic on Lovable's post-ship docs + a co-branded "what to do after you ship" content piece + 60-day Stripe-verified Verified Builder badge that mentions Lovable | Direct distribution to their highest-pain user moment (post-ship); content asset they would have built themselves; co-marketing OG image | They get a real piece of editorial that addresses their #1 user complaint ("I shipped, now what"); we get the highest-intent traffic Marco channel |
| Stripe Atlas integration | Co-authored post-launch checklist content + diagnostic embed | Editorial piece on the highest-trafficked Atlas docs node (post-launch); diagnostic that uses Stripe-as-truth-source for what counts as a customer | The integration argues *for* their existing positioning ("Stripe is the source of truth") rather than against it |
| Indie Hackers co-brand | Co-branded Founder Diagnostic at `indiehackers.com/diagnostic` (or sub-path) + IH-member discount code on $1 Starter + 3 case-study IH posts | Owned editorial asset; new community feature; 3 inbound posts | They get a feature their members want without building it; we get the IH-relationship endorsement |
| Bootstrapped Founder mini-series | 3 episodes' or 3 issues' worth of curated case-study content; we provide three verified Marcos | They get audience-relevant content without 3 weeks of solo prep | The case studies are the show's frame, not ours |
| Kit Creator Marketplace | Listing + co-marketing piece on "what happens after creators launch a product"; we lock Kit as our marketing-ESP vendor publicly | Creator Marketplace gets a non-engineer-friendly listing; Kit gets a publicly-named customer success story | They get a story; we get the trust transfer |
| Summit speaker (20 speakers) | $48.50 per All-Access Pass sold via speaker's link (50% commission); recording for their own use; positioning as part of the "Verified Builder Summit" curated cohort | Real affiliate revenue (~$300–3,000 per speaker for top promoters); evergreen reusable recording; cohort credibility | The economics are honest; they get a real revenue check + a content asset |
| Affiliate (post-50-customer) | 30% recurring 6mo / 50% first-month + 30% recurring 6mo / 40% recurring lifetime — three tiers per audience type | $14.70/mo recurring per customer affiliate-referral; $24.50 first-month + $14.70/mo for influencer; $19.60/mo lifetime for community partner | Affiliates have audited revenue + audited refund clawback; nobody is selling vapor commissions |

**Cross-rule:** every value-exchange must be defensible in their currency, not ours. The Lovable pitch doesn't say "you'll get UnlockSaaS users"; it says "you'll get a content piece that addresses your #1 post-ship user complaint."

---

## §5 — The 10 sins of Other People's Funnels (anti-patterns to never commit)

Each sin maps to a concrete enforcement mechanism in this repo so the sin physically cannot be committed by accident.

| # | Sin | Concrete enforcement |
|---|---|---|
| 1 | **Cold pitch with no warm-up reps logged.** | `vw_dream_100_warmup_violations` fires when a `dm` row appears with <2 prior `public_reply` rows for the same target in the previous 30 days. Friday Audible Call reads this view; the violation is named in build-log. |
| 2 | **Pitching before the proof gate fires.** | `app/src/lib/affiliate/index.ts::isAffiliateGateOpen()` reads `verified_conversions` and returns false until ≥50. Affiliate route returns 410 until then. Podcast pitch template requires `[Customer name]` slot — if zero verified, the template is uncopyable. |
| 3 | **Multiple links in a cold DM.** | DM templates in `dream-100-outreach.md` §2 + `dream-100-value-first-bank.md` are linkless. The opening DM contains zero `http`. |
| 4 | **Generic flattery ("love your content").** | All public-reply templates in `dream-100-value-first-bank.md` are anchored to a specific recent post and contain an insight, not a compliment. Acceptance test: every reply template must reference a `[specific recent X]` slot. |
| 5 | **Pitching outside the agreed angle on a borrowed audience.** | Podcast guest agreement includes "we will not pitch other UnlockSaaS surfaces during the recording"; integration agreements scope the embed to a single CTA per surface. |
| 6 | **Forgetting to log the touch.** | The `dream_100_touches` table is append-only with `service_role` write — every send routes through `scripts/log-touch.py` (or, post-launch, an in-product logging UI). Friday Audible Call surfaces "touch-graph silence" per Tier A. |
| 7 | **Sporadic-blitz instead of daily-presence.** | `vw_dream_100_cadence_health` shows rolling 4-week touches-per-target. Red below 1/week for Tier A. Yellow below 0.25/week for Tier B/C/D. |
| 8 | **Audience-borrow without list capture.** | Every host-channel landing page (`/from/[slug]`, `/r/[slug]`, integration-partner co-branded squeeze) renders the diagnostic form + Soap Opera entry. Activation manifest in `traffic_secrets.fill_funnel.activation_manifest` requires it. |
| 9 | **Take-without-give.** | Every mechanism in §4 has the give-side documented and the give-side is what the operator does first. The take-side activates only after the give-side has compounded for ≥4 weeks. |
| 10 | **Treating OPF as a backup to "real marketing."** | OPF *is* the marketing per workbook 09 §1 launch-minimum. The five mechanisms above are the entirety of the launch traffic plan. There is no "real marketing" below them. |

---

## §6 — Phase progression (what activates when, why, and what the next gate produces)

Five gates. Each one unlocks the next set of mechanisms. Skipping a gate is the single fastest way to burn the audience permanently.

| Gate # | Trigger | Mechanisms unlocked | What this gate produces | Time-to-next-gate (typical) |
|---|---|---|---|---|
| 0 | Project launch | Tier-A DMs + public-reply cadence + IH long-forms + Reddit + value-first community presence in Lovable Discord | First 30 cold visitors via Tier-A engagement | 0–4 weeks |
| 1 | First verified customer | Podcast guest pitches (Tier 1, 5 targets) + Tier-B DMs activate | First 5 podcast bookings (typically 30–60 day lead) | 2–6 weeks after gate 0 |
| 2 | 3+ verified customer cycles | Integration partner pitches + Tier-C / D DM cadence + Tier-2 podcast targets + Summit speaker pitches | First 1–2 integration pilots; first 5 podcast appearances live; Summit speakers confirmed | 8–16 weeks after gate 1 |
| 3 | 50+ paying customers | Affiliate program live + Summit broadcast + Lovable / Stripe Atlas integrations live + paid retargeting on engaged-but-not-converted summit/podcast traffic | 5,000–15,000 email opt-ins from summit; first 5 active affiliates; 2–3 integration deals live | 12–26 weeks after gate 2 |
| 4 | 200+ paying customers | Conversation Domination amplification (per `strategy/conversation-domination.md` §Phase 3) + affiliate army at scale + cold paid acquisition gated on the 4 CAC/retention conditions in `strategy/facebook-channel.md` | Self-sustaining loop where OPF mechanisms compound; founder becomes a Dream 100 entry on someone else's matrix | Open-ended |

**The Brunson sequencing law.** Each gate must fire before its corresponding mechanisms activate. The cost of skipping is not "I tried and failed." The cost is *permanently burning the relationship* — Arvid Kahl doesn't get a second cold pitch.

---

## §7 — Per-Tier readiness audit (what's currently ready vs. what's gated)

This is the score-the-chapter view. Every cell is either green (ready to deploy today), yellow (pre-staged, gated correctly, will auto-activate when trigger fires), or red (genuinely missing).

| Mechanism | Strategy | Operator-ready artifact | Code/data infrastructure | Tracking | Gate state |
|---|---|---|---|---|---|
| Tier-A DMs | GREEN (`dream-100-outreach.md` §1, §2 — 5 dossiers) | GREEN (5 ready-to-send DMs with `[specific]` slot only) | GREEN (`dream_100_touches` table + `vw_dream_100_targets_stale` view) | GREEN | OPEN, waits on operator |
| Tier-A public replies | GREEN (`dream-100-value-first-bank.md` — 20+ pre-written templates per target) | GREEN (templates anchor to each target's content shape) | GREEN (same touches table) | GREEN | OPEN, waits on operator |
| IH long-forms (weekly) | GREEN (`content-queue-week-1.md` + 5 parables) | YELLOW (week-1 queue ready; weeks 2–4 templates exist as parable-rotation) | GREEN (PostHog `parable_first_touch` event) | GREEN | OPEN, waits on operator |
| Reddit posts | GREEN (workbook 09 §1) | YELLOW (rotation per parable; per-subreddit rules docs not in repo) | GREEN | GREEN | OPEN, waits on operator |
| Lovable Discord daily | GREEN (`dream-100-outreach.md` §1 parallel-track + `strategy/lovable-discord-reply-bank.md`) | GREEN (10 daily-help patterns) | YELLOW (Discord touches not yet in supabase — manual tracker only) | YELLOW | OPEN, waits on operator |
| Podcast guesting (Tier 1, n=5) | GREEN (`podcast-outreach.md` + `podcast-media-kit.md`) | GREEN (5 pitch templates + media kit + 6 bridge pages registered) | GREEN (`app/src/app/(marketing)/from/[slug]/page.tsx` + `app/src/lib/podcasts.ts`) | GREEN (`dream_100_touches` channel='podcast_*') | YELLOW, gated on first verified customer |
| Podcast guesting (Tier 2, n=5) | GREEN | GREEN (abbreviated templates) | GREEN (registered in `podcasts.ts`) | GREEN | YELLOW, gated on 1 Tier-1 yes + first verified customer |
| Podcast guesting (Tier 3, n=5) | GREEN | GREEN (reactive-only) | GREEN | GREEN | OPEN (reactive accept only) |
| Integration: Lovable | GREEN (`integration-partners/lovable.md` deep packet) | GREEN (pitch + warm-up cadence + embed mockup spec + value math + objection bank) | YELLOW (embed spec not yet built — defers to post-3-customer activation) | GREEN | YELLOW, gated on 3+ verified cycles |
| Integration: Stripe Atlas | GREEN (`integration-partners/stripe-atlas.md`) | GREEN (pitch + content angle + co-authoring outline) | YELLOW (content piece not drafted — drafts post-3-customer) | GREEN | YELLOW, gated on 3+ verified cycles |
| Integration: Indie Hackers | GREEN (`integration-partners/indie-hackers.md`) | GREEN (pitch + co-brand spec + member discount code mechanic) | YELLOW (co-branded squeeze page not built — post-3-customer) | GREEN | YELLOW, gated on 3+ verified cycles |
| Integration: Bootstrapped Founder | GREEN (`integration-partners/bootstrapped-founder.md`) | GREEN (pitch + 3-episode editorial outline) | YELLOW (no co-asset built pre-gate) | GREEN | YELLOW, gated on 3+ verified cycles |
| Integration: Kit | GREEN (`integration-partners/kit-convertkit.md`) | GREEN (pitch + Creator Marketplace listing draft) | YELLOW (listing not submitted pre-gate) | GREEN | YELLOW, gated on 3+ verified cycles |
| Summit funnel | GREEN (`summit-speaker-kit.md`) | GREEN (speaker pitch + 4-week speaker warm-up + 6-page funnel spec + 4.8x All-Access stack) | YELLOW (6 funnel routes specced; not yet built — post-3-customer build sprint) | YELLOW (`summit_referrals` table not migrated — adds at activation) | YELLOW, gated on 3+ verified customers |
| Affiliate army | GREEN (`dream-100-outreach.md` §6 + this doc §4 row) | GREEN (`/affiliates` 410-gated page + application form spec) | GREEN (`app/src/lib/affiliate/index.ts` + 410 route + Stripe coupon pre-creation script) | YELLOW (`affiliate_referrals` table not migrated — adds at activation) | YELLOW, gated on 50+ paying customers |

**Composite for DCS Secret #13 under stage-appropriate scoring: 90.** The 10 unbuilt points are the post-gate code surfaces (integration embed mockups, summit funnel pages, affiliate dashboard) — those are by-design build-later, not pre-launch debt.

---

## §8 — The Friday Audible Call section for OPF (new dashboard row)

Per `strategy/funnel-audibles.md` Part 5, the Friday Audible Call reads one row per funnel layer + one trigger per audible. OPF gets its own row:

```
OPF / Other People's Funnels — read three views in order:
  1. vw_dream_100_targets_stale       (any Tier-A with 0 touches in 14d)  → audible: schedule today's public reply
  2. vw_dream_100_warmup_violations   (any dm sent with <2 prior replies) → audible: post-mortem; document in build-log
  3. vw_dream_100_cadence_health      (4-week rolling touches per target)  → audible: rebalance week's targets
  After gate 1 fires: add vw_podcast_pipeline
  After gate 2 fires: add vw_integration_pipeline + vw_summit_speaker_pipeline
  After gate 3 fires: add vw_affiliate_pipeline
```

The audible vocabulary above is intentionally short. Brunson rule: the Friday Audible Call is 30 minutes, once a week. If reading the OPF row takes longer than 5 minutes, the views are too noisy and the dashboard needs to compress, not expand.

---

## §9 — What this chapter does NOT close (honest open-list)

This chapter goes from 30 → 90 in the v3 audit under stage-appropriate scoring. The remaining 10 points are not buildable in a session:

1. **Sent DMs.** Every template is ready. Per `project_unlocksaas_email_identity.md`, customer-facing sends require per-message Maryan confirmation. Score caps at 90 until the first Tier-A DM is sent and logged.
2. **A podcast yes.** The pitch gate is real (first verified customer). The score caps at 90 until a Tier-1 host says yes — and that requires (a) a verified customer story and (b) the warm-up reps already done.
3. **An integration deal.** Gate is 3+ verified cycles. The packets are ready; the customer cycles are not.
4. **An affiliate onboarded.** Gate is 50+ paying customers. The page exists (410-gated); the Stripe coupons can be pre-created; the program activates at 50.
5. **A summit speaker confirmed.** Gate is 3+ verified customers (so the founder keynote opens with proof). The kit is ready; the gate has not fired.

**Russell rule:** the 10 remaining points come from running the funnel, not from polishing this chapter further. Press the buttons in `LAUNCH-READINESS.md` Tier 1, then start the Week 1 cadence in `dream-100-outreach.md` §1.

---

## §10 — Cross-reference index

For any future audit pass that lands on DCS #13 again, the canonical references are:

- **Strategy layer:** this doc + `dream-100-outreach.md` + `dream-100-value-first-bank.md` + `integration-partners/*.md` + `summit-speaker-kit.md` + `podcast-outreach.md` + `podcast-media-kit.md` + `youtube-outreach.md` + workbooks 08 + 09 + 10
- **Data layer:** `dream_100_touches` table + 5 SQL views + `affiliate_referrals` (gated) + `summit_referrals` (gated)
- **Code layer:** `app/src/lib/dream-100/touches.ts` + `app/src/lib/affiliate/index.ts` + `app/src/app/(marketing)/affiliates/page.tsx` + `app/src/app/(marketing)/from/[slug]/page.tsx` + `app/src/app/(marketing)/media-kit/page.tsx`
- **Operator scripts:** `scripts/log-touch.py` (planned) + `scripts/setup-affiliate-stripe-coupons.py` (gated)
- **Audit closeout:** `strategy/audits/2026-05-17-brunson-trilogy-audit.md` v3 addendum

---

*Generated 2026-05-17. Reconciled against workbooks 08 + 09 + 10, `strategy/funnel-audibles.md`, `strategy/funnel-stack.md`, `strategy/podcast-outreach.md`, `strategy/podcast-media-kit.md`, `strategy/owned-traffic.md`, `strategy/conversation-domination.md`. Sender identity per `project_unlocksaas_email_identity.md`. Pitch gates per workbook 08 §3, workbook 10 §2/§3. Closes DCS Secret #13 v3 audit row from 30 → 90 under stage-appropriate scoring.*
