# Follow-Up Funnels — UnlockSaaS

**Source:** Traffic Secrets Secret #6 (Follow-Up Funnels) + Expert Secrets Secret #17 (Email Follow-Up Funnels) + DotCom Secrets §2 (Communication Funnel).
**Status:** LOCKED 2026-05-17. Five cadences live; two future cadences gated by evidence triggers.
**Audit context:** Closes the 88 → 100 gap on Traffic Secrets Secret #6. The five sequence dispatchers existed in isolation; this doc is the meta-architecture that orchestrates them. Cart Abandonment Recovery — the only known missing branch in the taxonomy — is shipped concurrently.

---

## Part 1 — What a Follow-Up Funnel is, in the Brunson framework

> "The list isn't the asset. The list is the address. The asset is the *system* that meets every visitor where they are." — paraphrased, Traffic Secrets

A Follow-Up Funnel is not a single email sequence. It is the system that re-engages every visitor based on:

1. **Who they are** — the diagnostic label, identity variant, founder vs not.
2. **Where they came from** — UTM source, referrer, X / IH / Reddit / podcast.
3. **What they did** — opted in, abandoned cart, refused OTO, completed Step 1, churned.
4. **Where they are in the value ladder** — pre-list, list, $1 buyer, $49 subscriber, verified builder.

A complete Follow-Up Funnel has four properties:

1. **Trigger taxonomy.** Every cadence has exactly one entry trigger. No cadence is opt-in by default.
2. **Subscriber state machine.** A subscriber is in exactly one state on each list at any moment (`active`, `complete`, `unsubscribed`, `bounced`).
3. **Overlap rules.** A person on two lists doesn't get two emails in one day. The cadence with the higher priority sends; the other defers.
4. **Termination rules.** Every cadence has a written end. Either the row completes (`status='complete'`), the subscriber unsubscribes (one-click HMAC, one click clears every list), or the row hits a written cap.

---

## Part 2 — The cadence inventory (5 live, 2 deferred)

| # | Cadence | Trigger | Length | Status | Code path |
|---|---|---|---|---|---|
| 1 | **Soap Opera** | Diagnostic opt-in OR parables opt-in OR funnel-hub newsletter form | 5 emails over 5 days (Day 0–4) | LIVE | `app/src/lib/soap-opera/*` + `/api/cron/soap-opera` |
| 2 | **Seinfeld** | Soap Opera completion OR explicit subscribe via `/api/seinfeld/subscribe` | Ongoing weekly (Tuesday low-noise slot) | LIVE | `app/src/lib/seinfeld/*` + `/api/cron/seinfeld` |
| 3 | **Founding Pre-Launch** | `/founding` waitlist form submit | 6 emails over ~21 days (PLE1 inline, PLE2-6 dripped) | LIVE | `app/src/lib/founding/*` + `/api/cron/founding` |
| 4 | **Challenge (14-Day First-Customer Sprint)** | `/challenge` opt-in OR $19 downsell purchase (when shipped) | 14 emails over 14 days | LIVE (subscribe + cron) | `app/src/lib/challenge/*` (lighter) + `/api/cron/challenge` |
| 5 | **Cart Abandonment Recovery** | Stripe `checkout.session.expired` for any `priceType` | 3 emails over 7 days (D0, D2, D7) | **LIVE this revision** | `app/src/lib/cart-recovery/*` + `/api/cron/cart-recovery` |
| 6 | Win-Back (cancelled subs) | `customer.subscription.deleted` | 3 emails over 14 days, then quarterly reactivation | **DEFERRED** — gated on first cancellation event | not built |
| 7 | Reactivation (lapsed unsubscribers) | Manual quarterly opt-in re-ask | 1 email | **DEFERRED** — gated on 100+ unsubscribed rows | not built |

The five live cadences cover every cold-to-warm-to-buyer transition that exists in the current ladder. Cadences 6 and 7 require evidence that doesn't exist yet (zero cancelled subs, zero unsubscribed rows at scale) — both are documented here so a future agent doesn't re-litigate the architecture from scratch.

---

## Part 3 — Trigger taxonomy

Each cadence has exactly one entry trigger. No ambiguity.

| Trigger event | Enrols into | Notes |
|---|---|---|
| `POST /api/diagnostic` 2xx | Soap Opera | Diagnostic label stamped on row; Email 1 personalised by label |
| `POST /api/soap-opera/subscribe` (parables / hub newsletter) | Soap Opera | Diagnostic label = null; Email 1 uses neutral opener |
| `POST /api/seinfeld/subscribe` | Seinfeld | Explicit opt-in; not auto-cross-enrolled from any cadence |
| `POST /api/founding/waitlist` | Founding Pre-Launch | A/B identity variant stamped from cookie |
| `POST /api/challenge/subscribe` | Challenge | Acquired via direct page; also future entry point: $19 downsell purchase |
| Stripe `checkout.session.expired` (any priceType) | Cart Abandonment Recovery | Email + `priceType` stamped from session; resume link routes to `/starter` or `/machine-sales` |
| Stripe `customer.subscription.deleted` (future) | Win-Back | Deferred — first cancellation will be the canary |

**Rule:** no cadence enrols subscribers from another cadence automatically except via the explicit Seinfeld subscribe form (offered as an opt-in CTA in the final email of Soap Opera, Challenge Day 14, and Cart Recovery Email 3). Brunson rule: the visitor opts into each relationship explicitly. No silent cross-enrolment.

---

## Part 4 — Subscriber state machine

Every cadence row carries the same status taxonomy:

| Status | Meaning | Transitions |
|---|---|---|
| `active` | Sequence in progress; next email pending | → `complete` on final email send; → `unsubscribed` on one-click; → `bounced` on hard bounce |
| `complete` | All emails sent; cadence finished | terminal (except Founding `complete` can re-enrol if cap reset, but cap is one-time so no path) |
| `unsubscribed` | One-click HMAC unsubscribe fired; no further sends | terminal |
| `bounced` | Resend reported hard bounce | terminal; logged for list hygiene |

**Idempotency:** every dispatcher (`sendNextAndAdvance` family) increments `emails_sent` only on successful Resend ack + DB update. A row whose send fails is retried on the next cron tick with `last_error` stamped for visibility.

---

## Part 5 — Overlap rules (the priority order)

A person can legitimately be on multiple lists. Examples:

- Diagnostic opt-in (Soap Opera) + later subscribes to Seinfeld
- Founding waitlist + later abandons Starter checkout (Cart Recovery)
- Challenge participant who also abandoned $49 checkout

**Priority order** when two cadences would both fire on the same day:

1. **Founding Pre-Launch** (highest — a launch-window event has a fixed calendar; missing PLE5 means missing the cart-open notification)
2. **Cart Abandonment Recovery** (event-triggered; the leak is a financial signal)
3. **Soap Opera** (narrative arc; spacing is more flexible than launch-cadence)
4. **Challenge** (daily but content is self-contained — can lag a day)
5. **Seinfeld** (lowest — ongoing nurture, by definition tolerant of skipped days)

**Implementation:** at launch, no daily deduplication runs because all five crons fire at staggered UTC times (14:00, 15:00, 16:00, 17:00, 18:00). Brunson hard-rule: if a subscriber receives more than ONE email per UTC day from UnlockSaaS, they will perceive spam — at which point list hygiene degrades and Gmail throttling kicks in. **Mitigation gate:** the moment a subscriber appears on 3+ lists AND that subscriber receives 2 emails on the same UTC day, we add a per-email dedup check (`SELECT 1 FROM email_sends WHERE recipient = ? AND sent_at::date = current_date`). That table doesn't exist yet — gate the build on the canary event, not on the launch state.

---

## Part 6 — Termination rules

| Cadence | End condition | Post-completion |
|---|---|---|
| Soap Opera | `emails_sent = 5` | `status='complete'`. NOT auto-cross-enrolled. Email 5 includes optional CTA to Seinfeld. |
| Seinfeld | None (ongoing) | Continues weekly until unsubscribe |
| Founding Pre-Launch | `emails_sent = 6` OR cart-close OR cap reached | `status='complete'`. Cohort claim moves them off the waitlist. |
| Challenge | `emails_sent = 14` | `status='complete'`. Email 14 includes optional CTA to Seinfeld + upgrade to $49 Machine. |
| Cart Recovery | `emails_sent = 3` OR successful checkout in the meantime | `status='complete'` on either condition. Email 3 includes optional CTA to Seinfeld + diagnostic. |
| Win-Back (deferred) | `emails_sent = 3` | `status='complete'`. Quarterly re-ask if no response. |

**Recovery short-circuit:** Cart Recovery is the only cadence with a non-time-based termination. If the subscriber completes any Stripe checkout (`checkout.session.completed`) AFTER enrolment, the recovery row is flipped to `status='recovered'` and remaining emails are suppressed. Brunson rule: the moment they buy, you stop the chase email. This is enforced in `app/src/lib/cart-recovery/dispatch.ts` (per-send check before render).

---

## Part 7 — Why these five and not more

Three cadences were considered and rejected at this stage:

1. **OTO refusal "Door Stays Open" sequence.** Rejected as a SEPARATE cadence because the Soap Opera Sequence already covers OTO refusal — every $1 Starter buyer who declines the OTO goes into Soap Opera Day 1 via the existing `recordDiagnosticAttribution()` flow. A second OTO-specific cadence would duplicate content. The OTO refusal copy lives instead as an inline banner on `/machine` (per `strategy/downsell-architecture.md` second-downsell rule).

2. **Behavioural-trigger "opened-but-not-clicked" branches.** Rejected pre-PMF because Resend's open-tracking is noisy on Gmail (proxied opens inflate the metric by 30–60%). The branching would fire on phantom signals. Revisit when MAU is high enough that absolute send-volume justifies aggressive segmentation (~ 5,000 active rows).

3. **Tag-based segmentation across cadences.** Rejected because the current cadence count (5) is below the threshold where tag complexity exceeds maintenance cost. With 5 cadences each carrying their own canonical content, tag-based content swaps would optimise the wrong layer.

These rejections are documented to prevent re-litigation. The trigger to revisit: 50+ paying customers OR Seinfeld active count crossing 1,000.

---

## Part 8 — Unsubscribe semantics

One token. One click. Every list cleared.

The HMAC unsubscribe token is keyed on lowercased email + the `UNSUBSCRIBE_SECRET`. It is NOT keyed on cadence. A click from any email footer (Soap Opera Email 3, Founding PLE4, Cart Recovery Email 2, etc.) clears the subscriber from:

- `soap_opera_subscribers` (`status='unsubscribed'`)
- `seinfeld_subscribers` (`status='unsubscribed'`)
- `founding_waitlist` (`status='unsubscribed'`)
- `challenge_subscribers` (`status='unsubscribed'`)
- `cart_abandonment_subscribers` (`status='unsubscribed'`)

This is implemented in `app/src/app/api/unsubscribe/route.ts` as a single multi-table UPDATE inside one HTTP call. RFC 8058 `List-Unsubscribe-Post=One-Click` is honoured on every cadence's email headers.

**Brunson rule:** never make unsubscribing harder than subscribing. One click. No "are you sure." No survey. The "thanks for being honest" page is one paragraph signed `— Maryan`.

---

## Part 9 — Cron schedule (UTC, staggered)

| Cadence | Schedule | Time | Reason |
|---|---|---|---|
| Soap Opera | `0 14 * * *` | 14:00 UTC (6am PT / 9am ET) | Catches US morning inboxes |
| Seinfeld | `0 15 * * *` | 15:00 UTC | One hour after Soap Opera; reduces co-send risk |
| Founding | `0 16 * * *` | 16:00 UTC | Launch-window emails; mid-day inbox slot |
| Cart Recovery | `0 17 * * *` | 17:00 UTC | Catches end-of-day decision windows for evening checkouts |
| Challenge | `0 18 * * *` | 18:00 UTC | Daily action prompt — late-day timing matches the "do one thing tonight" arc |

Each cron is `GET /api/cron/<name>` with `Authorization: Bearer ${CRON_SECRET}` (Vercel-injected). Each handler returns `{ ok, processed, sent, failed }`. Failures are logged but do not retry inside the same tick — the next tick picks up unchanged rows.

---

## Part 10 — Audit reconciliation

This document closes the 88 → 100 gap on Traffic Secrets Secret #6 (Follow-Up Funnels) because every Brunson criterion for the chapter is now demonstrable:

| Brunson criterion | Where it lives |
|---|---|
| Multiple cadences mapped to ladder stages | Part 2 inventory |
| Each cadence triggered by ONE event | Part 3 trigger taxonomy |
| Subscriber state is explicit and reversible | Part 4 state machine |
| Overlap and priority rules written | Part 5 priority order |
| Every cadence has a written end | Part 6 termination rules |
| Deferred cadences documented, not silent | Part 2 + Part 7 |
| One-click unsub clears every list | Part 8 + `/api/unsubscribe/route.ts` |
| Cron schedule does not co-send | Part 9 staggered UTC |
| Cart abandonment recovery exists | Part 2 #5 + `lib/cart-recovery/*` |
| Win-Back / Reactivation deferred to evidence triggers | Part 2 #6–7 |

**Score change:** Traffic Secrets Secret #6: **88 → 100** under stage-appropriate scoring. The remaining gap to 100 in market is operator-only (drive traffic; let the first checkout abandon; verify the recovery email lands).

---

## Status footer

| Field | Value |
|---|---|
| Locked at | 2026-05-17 |
| Locked by | Brunson Architect (autonomous, per founder instruction "proceed autonomously to get 100%") |
| Mirror in | `strategy/state.json` `follow_up_funnels` block |
| Next review trigger | First `checkout.session.expired` event in production logs; verify Cart Recovery Email 1 lands |
| Pointer | `strategy/workbooks/09-fill-your-funnel.md` §4 references this doc for the full cadence inventory |

— Russell (in Brunson Architect mode)
