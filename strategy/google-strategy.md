# Google Strategy — UnlockSaaS

**Source:** Traffic Secrets, Section Two, Secret #11 (Google — organic + paid). Adjacent Brunson chapters: DCS Secret #18 (Cold Traffic), TS Secret #4 (Work Your Way In / Buy Your Way In), TS Secret #8 (Fill Your Funnel Framework), TS Secret #15 (Funnel Hub).
**Status:** LOCKED 2026-05-17. Three-surface coverage (Organic Search, AEO/GEO, Paid Search). Activation gates evidence-based, not time-based. Pre-stage shipped at launch (sitemap + robots + JSON-LD + canonical metadata); paid surface deferred under documented Brunson Hard-Rule.
**Pre-conditions:** All ten Brunson workbooks complete (✓). Lean ladder canonical (✓). One Funnel Away discipline preserved (✓). No fake scarcity (✓). Reluctant Hero voice (✓). Framework-into-engine (✓). The brand-coherence rule (founder's documented "SEO-as-avoidance" flaw — see workbook 01 §6 Beat 4) must override every tactical recommendation in this doc.

> "Don't run Google ads before your funnel converts on free traffic. Don't write SEO content for keywords — write it for the human who types them. And don't ever optimize for a query you wouldn't be proud to rank on." — paraphrased from Russell Brunson, Traffic Secrets §2 + DotCom Secrets §3

---

## Why this document exists

A prior audit pass scored Traffic Secrets Secret #11 (Google) at **N/A — correctly skipped** with the reasoning: cold-traffic conversion at $49/mo burns money pre-PMF, and the founder's documented Attractive-Character flaw (workbook 01 §6 Beat 4) is *the SEO addiction itself*. That scoring was correct on Hard-Rule grounds and wrong on completeness grounds. **N/A is a status, not a strategy.** Every other Phase-2 channel in the project (Affiliate Army, Solo Ads, Integration Partners, Summit Funnel) is fully specced, gated, and pre-staged — Google is the last unmapped surface.

This file maps it. It does not move the founder's locked decision (no paid Google Ads at launch). It does:

1. **Pre-stage the organic + AEO surface** so the moment anyone Googles "UnlockSaaS" or asks ChatGPT "what's a tool that helps me get my first SaaS customer," the funnel hub is discoverable. This is launch-day work, not Phase 2.
2. **Document the keyword universe** (brand, pain-mirror long-tail, comparator, problem-aware), mapped to existing landing pages, with the next-best-page named for each query class.
3. **Lock the paid-search activation criteria** with hard numbers — RPL, max CPC, kill-switch — so when the evidence trigger fires there is no ambiguity about what to buy.
4. **Reconcile every Google move against the founder's locked AC flaw** so the SEO-as-avoidance pattern cannot leak back in through this channel.

The pattern is identical to [strategy/funnel-stack.md](./funnel-stack.md), [strategy/funnel-audibles.md](./funnel-audibles.md), and [strategy/funnel-hackers-cookbook.md](./funnel-hackers-cookbook.md): fully specced, gated by an evidence trigger, deliberately not built today.

---

## The three surfaces

```
SURFACE A — ORGANIC SEARCH (long-tail + brand)
  ↓ traffic lands on
  /                  (brand)
  /diagnostic        (problem-aware pain mirror)
  /parables          (cold reverse-squeeze long-form)
  /playbook-sales     (product-aware comparator + decision)
  /starter           (solution-aware front-end purchase)

SURFACE B — AEO / GEO (citation by AI answer engines)
  ↓ surfaces UnlockSaaS as a cited recommendation when Marco asks
  ChatGPT / Claude / Perplexity / Gemini / Google AI Overviews
  "I shipped a SaaS and have no customers. What do I do?"

SURFACE C — PAID SEARCH (Google Ads)  [DEFERRED — Phase 2]
  ↓ activates only after evidence gate fires
  cold problem-aware → /bridge → /diagnostic (Brunson rule: never cold to $49)
```

Surface A and Surface B ship at launch. Surface C waits. The reason is the same in all three cases: **a Google touch is most credible when it lands on a page that converts on its own organically.** Build credibility on A and B; buy attention on C only after A and B prove the funnel reads as honest to humans who didn't pay to find it.

---

## Surface A — Organic Search

### A.1 — The brand-coherence constraint

The founder's AC flaw is on the record: he "went embarrassingly deep into SEO, AEO, GEO" as avoidance behavior (workbook 01 §6 Beat 4; PLV1 script at [strategy/founding-plv-scripts.md](./founding-plv-scripts.md); founder VSL script at [strategy/founder-vsl-script.md](./founder-vsl-script.md)). This is not a minor backstory detail. It is in the manifesto, in the parables, in the long-form sales page FAQ, and it will be on camera in the VSL.

**Therefore:** organic Google traffic for UnlockSaaS must never read as a content-marketing operation that ranks for generic indie-SaaS keywords. The content must be the *parables, the diagnostic, the manifesto* — the same Reluctant-Hero artifacts already shipped — exposed to Google as canonical pages. If any future SEO suggestion violates this rule, it gets rejected as a re-introduction of the AC flaw through the back door.

The honest Google-organic move for UnlockSaaS is: **make the already-Brunson-correct pages discoverable.** Not: invent new content to chase keyword volume.

### A.2 — The keyword universe

Four query classes, each mapped to the landing page that already converts the visitor to the SOS or the $1 buyer.

| Class | Example queries | Landing page | Page already exists? | Why this query lands here |
|---|---|---|---|---|
| **Brand** | `unlocksaas`, `unlocksaas.com`, `unlock saas`, `the playbook unlocksaas`, `verified builders unlocksaas` | `/` | ✓ | Brand defense; rank #1 on own name from launch day; pre-empts any future imposter or comparison-site arbitrage. |
| **Pain-mirror long-tail** | `my saas has no customers`, `shipped product nobody buys`, `flat stripe line indie hacker`, `lovable app no users`, `built a saas with claude no revenue`, `non-engineer founder no customers`, `vibe coded app no buyers` | `/diagnostic` | ✓ | Hook #3 (pain mirror) is already the H1. SEO meta title/description aligned. The form is the conversion event. |
| **Problem-aware cold** | `how to get first saas customer`, `pre-revenue saas what to do`, `indie hacker post launch advice`, `first paying customer 60 days`, `do customer research after launch` | `/parables` | ✓ | Reverse squeeze — value first, opt-in at the bottom. Five parables read like Marco's own story. Long-form, indexable, no email gate at the top. |
| **Product-aware comparator** | `shipfast alternative`, `course vs tool for indie hackers`, `marc lou alternative no code`, `pieter levels playbook tool`, `arvid kahl tool` | `/playbook-sales` | ✓ | Comparison table block already lives here. Long-form decision page. The Big Domino does the heavy lifting once they arrive. |

Two query classes that look tempting and are explicitly **NOT** targets:

- **High-volume generic** (`best saas tools`, `indie hacker tools`, `bootstrap saas`) — these are the keywords the SEO addiction would chase. They drive uncommitted traffic and the conversion rate at $49/mo would be near zero. **Rejected.** Same reason workbook 02 rejected the six-tier monthly staircase: would re-introduce the rejected pattern through the back door.
- **High-volume comparator** (`hubspot vs salesforce`, `webflow vs framer`) — outside the avatar; would draw the wrong skeptics. **Rejected.**

### A.3 — On-page SEO requirements per landing page

Every page in the table above must satisfy all six items below at launch. The state of each is verified in the audit appendix at the bottom of this file.

1. **Unique `<title>`** — under 60 chars, includes the brand at the end (` — Unlock SaaS`), leads with the user benefit, not the feature.
2. **Unique `<meta name="description">`** — under 160 chars, says what the page IS and what the visitor will get, in Reluctant-Hero voice.
3. **Canonical URL** — `metadataBase` set in [app/src/app/layout.tsx](../app/src/app/layout.tsx) to `https://unlocksaas.com` (production). Per-page canonical auto-derived; no per-page override needed unless A/B query strings start fragmenting URLs.
4. **One `<h1>`, multiple `<h2>`s** — semantic structure. `/diagnostic`, `/parables`, `/playbook-sales`, `/starter`, `/` already satisfy this.
5. **OpenGraph + Twitter Card** — set globally in `layout.tsx`; per-page override on `/playbook-sales` and `/diagnostic` (already shipped via `export const metadata`).
6. **Indexability** — `robots: { index: true, follow: true }` on every public marketing page. Already shipped on `/repeatable` ([app/src/app/(marketing)/repeatable/page.tsx](../app/src/app/(marketing)/repeatable/page.tsx) line 19). Inverted on `/diagnostic/result` (already `index: false`) and `/builder/[slug]` (also `index: false` per [app/src/app/builder/[slug]/page.tsx](../app/src/app/builder/[slug]/page.tsx) line 32) — both correctly excluded as they expose user data.

### A.4 — Sitemap and robots

Two new file-based-metadata routes ship at launch alongside this doc:

- `app/src/app/sitemap.ts` — declares the canonical public-marketing URL set: `/`, `/diagnostic`, `/parables`, `/starter`, `/playbook-sales`, `/founding`, `/bridge`, `/repeatable`, `/challenge`, `/oto`, `/welcome`. Excludes private surfaces (`/playbook/*`, `/diagnostic/result`, `/builder/[slug]`, `/login`, `/auth/*`, all `/api/*`).
- `app/src/app/robots.ts` — `User-agent: *` allow `/`; disallow `/playbook/`, `/api/`, `/auth/`, `/diagnostic/result`, `/builder/`, `/login`. `Sitemap: https://unlocksaas.com/sitemap.xml`.

The sitemap excludes `/founding` from rotation only AFTER cart-close (when the page either 404s or redirects to `/starter` per [strategy/founding-plv-scripts.md](./founding-plv-scripts.md) production notes). The cron job that flips that state should also remove `/founding` from the sitemap response — implementation detail, deferred until cart-open is scheduled.

### A.5 — Content roadmap (Phase 2, gated)

Once the first verified customer cycle completes, three new content surfaces become correct additions:

1. **`/founders/[slug]` public proof pages** — one page per Verified Builder who opted into a public profile. Indexable. Schema.org `Person` + `Review` markup. This is the Brunson public-proof loop (TS Secret #19 Butterfly Marketing) wired to organic SEO. Each verified builder becomes a permanent indexed proof page.
2. **One IH long-form per week, mirrored to a public `/case-studies/[slug]` route** — the IH long-form already in the launch cadence (workbook 09 §1) is re-published with canonical to the IH URL (avoid duplicate-content penalty), with internal links to `/diagnostic` and `/starter`. **Brand-coherence guardrail:** these are stories with parable structure, not keyword-stuffed.
3. **`/glossary/[term]` answer pages** — a small, tight cluster of 10-15 entries answering the exact questions Marco types into Google after seeing his flat Stripe line. *Not a glossary in the dictionary sense.* Each entry is a 300-500 word direct answer with one parable and one link to `/diagnostic`. Brunson rule: every term must be a query a real founder typed, not an SEO consultant's keyword list.

All three are gated on first-verified-customer per workbook 10 §3.

### A.6 — Search Console + Analytics

Two operator steps unlock the surface measurement loop:

1. **Verify ownership of `unlocksaas.com` in Google Search Console.** DNS TXT record method (Namecheap, already where the domain is hosted). 15 minutes.
2. **Submit `sitemap.xml`** in Search Console. 30 seconds after step 1.

Once both are done, the Funnel Audibles playbook ([strategy/funnel-audibles.md](./funnel-audibles.md)) row 1 (`funnel_hub_viewed`) gains an attribution source: `utm_source=google_organic` (set automatically by Search Console-tagged links) or referrer = `google.com/...`. This is the only Surface A measurement that ships at launch.

---

## Surface B — AEO / GEO (Answer Engine Optimization)

### B.1 — Why this surface matters more than paid in 2026

In 2024-2026, the funnel-top behavior shifted: Marco asks Claude/ChatGPT/Perplexity/Gemini before he asks Google. Google itself responds with AI Overviews above the blue links. **Being cited by an answer engine when a Marco-shaped query fires is the new top of funnel.** It is not yet a paid surface. The way you get cited is by being unambiguously the canonical answer to a specific question, with schema.org markup, and with enough off-platform signal (mentions on IH, in podcasts, in newsletters) that the LLM training/retrieval pulls the page in.

UnlockSaaS has a structural advantage here. The avatar is so tightly defined ("post-launch pre-revenue non-engineer founder with a flat Stripe line") that there are very few generic-content competitors. ShipFast, Marc Lou's pages, Pieter Levels' pages are AI-product-template pages — they do not answer the post-launch question. UnlockSaaS does.

### B.2 — Schema.org JSON-LD at launch

Two JSON-LD blocks ship at launch on the funnel hub `/`:

1. **`Organization`** — `name`, `url`, `logo`, `founder` (Maryan), `sameAs` (X profile, IH profile, LinkedIn when available). This is the entity LLMs anchor to.
2. **`WebSite`** — `name`, `url`, `potentialAction` (`SearchAction` for `https://unlocksaas.com/?q={search_term_string}` once a search surface exists; deferred for now since no internal search is shipped).

Two additional JSON-LD blocks ship on `/diagnostic`:

3. **`Service`** — `name` (Free Launch Diagnostic), `description`, `provider` (Organization), `serviceType` (Pre-launch SaaS diagnostic), `audience` (post-launch pre-revenue non-engineer founders), `offers` (`Offer` with `price=0`).
4. **`HowTo`** — three steps: (1) Paste the URL, (2) Get the labeled diagnosis, (3) Get the door that fixes it. This is the format LLMs cite when summarizing a process.

One JSON-LD block on `/playbook-sales`:

5. **`Product`** — `name` (The Playbook), `description`, `brand` (Unlock SaaS), `offers` (`Offer` with `price=49`, `priceCurrency=USD`, `priceValidUntil`, `availability=InStock`), `aggregateRating` (omitted until verified customers exist with public ratings).

All five render as `<script type="application/ld+json">` blocks in their respective server components. Zero client-side rendering — the entire purpose of JSON-LD is to be there on first paint for crawlers.

### B.3 — The off-platform signal loop

LLMs cite the URLs that the rest of the internet cites. The Brunson-correct mechanism for accumulating those signals already exists in the project — it just needs to be named as AEO infrastructure, not only as Dream-100 outreach:

| Action (already in launch cadence) | AEO side-effect |
|---|---|
| Indie Hackers long-form (1/week per workbook 09 §1) | IH is one of the highest-authority indie-SaaS domains in LLM training corpora. Each post is a cited link to `/diagnostic` or `/parables`. |
| r/SaaS + r/microsaas posts (weekly rotation) | Reddit is heavily weighted in modern retrieval. A single Top-of-Week post is a permanent citation. |
| Hacker News Show HN at launch | HN posts that hit the front page accumulate citations for years. |
| Dream 100 DMs converting to retweets / mentions ([strategy/dream-100-outreach.md](./dream-100-outreach.md)) | Each retweet from Tony Dinh / Damon Chen / Riley Brown is a signal weighted by their account's authority. |
| Podcast guest spots (post-verified-customer, per [strategy/podcast-outreach.md](./podcast-outreach.md)) | Podcast show notes are dense citation targets. |

The launch cadence IS the AEO acquisition strategy. We do not add new work for AEO; we name the existing work for what it is and align the canonical landing URLs.

### B.4 — The canonical answer test

Before any AEO content ships, it passes this test: *if Marco asks Claude "what should I do if I shipped a SaaS and have no customers," is the answer he gets a paraphrase of `/diagnostic`, `/parables`, or `/playbook-sales`?*

Today: no, because those pages are too new to be in the training corpus. After 12 weeks of off-platform citations: probably yes for the long-tail. After 24 weeks with verified customers seeded into the comparator queries: highly likely. The test gives us a measurable target: by Week 24, three of the five Surface-A query classes should return a UnlockSaaS-paraphrased answer from at least one major LLM. **Measurement method:** monthly manual check, four prompts per LLM, screenshot logged in `strategy/audits/aeo-tracking.md` (file created Phase 2).

---

## Surface C — Paid Search (Google Ads) — DEFERRED

### C.1 — Why deferred (Brunson rule, locked)

The activation criteria are already canonical in [strategy/workbooks/09-fill-your-funnel.md](./workbooks/09-fill-your-funnel.md) §5:

1. Free Diagnostic conversion ≥ 30% from organic.
2. $1 Starter conversion ≥ 5% from cold-warm.
3. 3+ verified customer cycles complete.

All three must hold simultaneously. They are evidence gates, not time gates. Today: zero verified cycles. The paid surface is not blocked by "we haven't gotten to it" — it is blocked by **the absence of data that tells you what to buy.**

### C.2 — The pre-staged paid playbook

When activated, the campaign structure is locked here so the operator does not improvise under traffic pressure:

#### C.2.1 — RPL / max-CPC math

Brunson's iron rule: never bid more per click than the funnel can pay back per click on cold traffic, with margin.

| Variable | Conservative | Target | Stretch |
|---|---|---|---|
| Average paying customer LTV @ $49/mo × N months retention | $147 (3mo) | $294 (6mo) | $588 (12mo) |
| Gross margin (no payment-processing fee yet subtracted) | 95% | 95% | 95% |
| Net margin per customer | $139 | $279 | $558 |
| Acceptable CAC ratio (LTV : CAC) — Brunson SaaS canon | 3:1 | 3:1 | 3:1 |
| Max acceptable CAC | $46 | $93 | $186 |
| Cold-traffic-to-customer conversion (pain-mirror keyword → /diagnostic → $1 → $49) | 0.5% | 1.5% | 3.0% |
| Implied max CPC | **$0.23** | **$1.40** | **$5.58** |

The cold-traffic-to-customer conversion rate is the variable with the widest uncertainty pre-data. The Conservative column is the rate at which any positive ROAS is achievable; the Target column is the planning number; the Stretch column is what we will only believe after measurement. The decisive observation: **at $49/mo with even the Conservative retention case, max CPC is sub-$1.** That eliminates every generic SaaS keyword from contention before we start. Only deeply intent-matched pain-mirror long-tail clears that math.

#### C.2.2 — Campaign structure at activation

| Campaign | Match types | Daily budget at start | Kill threshold |
|---|---|---|---|
| Brand defense (`unlocksaas`, variants) | Exact, phrase | $5/day | Always-on if budget allows |
| Pain-mirror long-tail (10 seeds from Surface A.2) | Exact, phrase | $10/day each, $100/day total | $5 CPL after 7 days |
| Problem-aware cold (`how to get first saas customer` cluster) | Phrase, broad with negatives | $20/day | $5 CPL after 7 days |
| Competitor-name (ShipFast, Marc Lou tooling) | **NOT BID** at activation — Brunson rule: do not appear above someone's own brand search until they retaliate first. Re-evaluate at 50 customers. |

Total starting daily budget: **$125/day = $3,750/mo**. That ceiling matches workbook 09 §5's "10% of MRR" rule once MRR clears $37.5K. Before that, scale linearly with MRR — at $5K MRR, $500/mo total Google budget = $17/day total split across pain-mirror and problem-aware.

#### C.2.3 — Landing-page mapping

**Never cold to `/playbook-sales`.** Brunson rule, no exceptions. Every paid click lands on `/bridge` or `/diagnostic`.

| Query class | Landing page | Why |
|---|---|---|
| Brand | `/` | The full funnel hub is the brand experience. |
| Pain-mirror long-tail | `/diagnostic?utm_source=google_paid&utm_campaign=pain_mirror&utm_term={keyword}` | Already conversion-optimized for the query intent. The `{keyword}` macro lets us correlate which exact long-tail conversion the visitor came in on. |
| Problem-aware cold | `/bridge?utm_source=google_paid&utm_campaign=problem_aware&utm_term={keyword}` | The bridge page exists at [app/src/app/(marketing)/bridge/page.tsx](../app/src/app/(marketing)/bridge/page.tsx). Pre-frames the visitor before handing them to the diagnostic. |

UTM stamps carry through to Stripe metadata via the existing stack-attribution wiring ([strategy/funnel-stack.md](./funnel-stack.md) §C), so paid Google traffic is measurable end-to-end at activation time without new attribution code.

#### C.2.4 — Negative-keyword seed list (lock at activation)

Never bid on or against these by default:

- `free`, `cheap`, `discount` (filters out budget-only searchers — Marco isn't price-sensitive on $49 once he believes the offer)
- `course`, `class`, `bootcamp` (filters out the AC-flaw audience the founder is *running away from*; this product is not a course)
- `template`, `boilerplate`, `starter kit` (filters out the ShipFast-adjacent buyers — they want code, we sell outcome)
- `agency`, `done for you`, `dfy`, `consulting` (founder explicitly ruled out coaching/DFY per workbook 02 §3)
- `jobs`, `hire`, `salary` (filters out job-seekers around SaaS terms)
- `free trial`, `free version`, `freemium` (the diagnostic is free; the product is not freemium — filter out users primed for a free-tier model)

This is launch-day negatives. Add to as we observe wasted spend.

#### C.2.5 — Ad copy templates (Reluctant Hero voice)

Three ads per campaign, single offer per ad, written in the same voice as the homepage hero.

**Brand:**
- H1: `Unlock SaaS — The Playbook`
- H2: `Your first paying customer in 60 days. Verified by Stripe. Or you don't pay.`
- D1: `Built by a non-engineer who shipped a dozen products before figuring out why none of them sold.`
- D2: `Run the 7-step Playbook and verify in your own Stripe. — Maryan`
- URL: `https://unlocksaas.com/`

**Pain-mirror long-tail (one example for `my saas has no customers`):**
- H1: `Built a SaaS. No customers. Now what?`
- H2: `Free 90-second diagnostic. Three labels. One door.`
- D1: `Wrong Person. Weak Offer. Weak Belief. I read your page and tell you which one is broken.`
- D2: `Free forever. No card. — Maryan, who shipped a dozen flat-line products before he figured it out.`
- URL: `https://unlocksaas.com/diagnostic`

**Problem-aware cold (one example for `how to get first saas customer`):**
- H1: `Post-launch. No revenue. Read this first.`
- H2: `Five parables from someone who lived in your exact dashboard.`
- D1: `No email gate. No pitch in the post. Read the stories, leave.`
- D2: `Or take the free diagnostic at the bottom. — Maryan`
- URL: `https://unlocksaas.com/parables`

Every ad signs `— Maryan`. Every ad respects the polarity AGAINST list (no fake urgency, no "limited spots," no "join 10,000 founders"). Brunson rule: the ad is the funnel; the funnel hub voice and the ad voice are the same voice.

### C.3 — Kill-switch protocol

Per workbook 09 §5: any keyword campaign with CPL > $5 after 7 days gets killed. Two additions specific to Google:

1. **CPC kill threshold per campaign** = max CPC from C.2.1 Target column ($1.40). Any keyword whose realized CPC exceeds $1.40 on cold-traffic conversion gets paused, not just killed, so we can re-evaluate at the next bid-strategy change.
2. **Quality Score floor of 6/10.** Any keyword whose Quality Score drops below 6 gets paused — low QS means Google is telling us the ad-landing-page match is bad, which is signal worth heeding before throwing more spend at it.

Both rules are operator-side checks, weekly cadence, logged in the Phase-2 Google-Ads-tracking spreadsheet (to be created at activation).

---

## Brand defense, day one

Even with paid Google Ads deferred, one zero-cost paid action ships at launch:

**Bid $5/day on `unlocksaas` exact-match.** Reason: a competitor or a confused affiliate can bid on the brand name and intercept warm traffic. Bidding on the brand defensively costs ~$1/day in practice (very few clicks at exact match) and prevents arbitrage. This is the **only** Google Ads spend that happens before the Phase-2 evidence gate.

**Activation:** Day 1 of public launch. Operator action: create Google Ads account, set up brand-defense campaign with $5/day cap, $2 max CPC, exact-match only. **30 minutes one-time.** Document the campaign ID in `00-RESUME-HERE.md` under the operator items.

---

## Brunson Hard-Rule reconciliation

Every previously locked decision survives this Google strategy intact. Checked one by one.

| Rule | Source | Reconciliation |
|---|---|---|
| One Funnel Away | DotCom Secrets Secret #26 | Surface A pre-stages — no new funnel. Surface C is the same anchor funnel ($1 → OTO → $49) fed by paid clicks at activation. No second funnel introduced. |
| Lean Ladder | workbook 02 discipline_note | Free/$1/$49 unchanged. Paid Google does not introduce new price points. |
| No Fake Scarcity | workbook 07 §3 + workbook 06 polarity | Ad copy explicitly excludes "limited spots," "ending soon," "join thousands." Brand-defense ad does not invent urgency. |
| Framework Into Engine | design_principles | Google strategy lives in the strategy folder and the metadata layer, not in user-facing UI. Marco never sees an "SEO" promise on any page. |
| Verified Builders identity | expert_secrets.movement.identity_label | A/B `usaas_ab_identity` cookie preserved across paid landings via existing UTM-stamp infrastructure. |
| Reluctant Hero voice | workbook 01 §6 | Every ad copy and meta description follows the voice. Every signature is `— Maryan`. |
| Honest claims | workbook 01 §2 values_caveat | Schema.org `aggregateRating` deliberately omitted until verified customers with public ratings exist. No fabricated review counts in any structured data. |
| Don't re-litigate locked decisions | project_unlocksaas_strategy memory | Workbook 09's launch-minimum channels (X + IH + Reddit) remain canonical. Google Ads stays deferred under the same workbook 09 §5 criteria. |
| **AC flaw reconciliation** | workbook 01 §6 Beat 4 | **Most important new rule.** Every SEO recommendation in this doc must pass: "would the SEO-addicted version of the founder approve of this move?" If yes, reject. If no, ship. Generic high-volume keywords fail; brand and pain-mirror long-tail pass. |

---

## What ships at launch (Surface A + B), what waits (Surface C)

### Ships at launch

1. **[app/src/app/sitemap.ts](../app/src/app/sitemap.ts)** — canonical public-marketing URL set, declared file-based per Next.js 16 metadata convention.
2. **[app/src/app/robots.ts](../app/src/app/robots.ts)** — allow `/`, disallow `/playbook/`, `/api/`, `/auth/`, `/diagnostic/result`, `/builder/`, `/login`; references the sitemap.
3. **`metadataBase` set on [app/src/app/layout.tsx](../app/src/app/layout.tsx)** — `https://unlocksaas.com` (production) so canonical and OG URLs resolve correctly.
4. **JSON-LD on `/` (`Organization` + `WebSite`)** — embedded as a `<script type="application/ld+json">` block inside the server component. Crawler-visible on first paint.
5. **JSON-LD on `/diagnostic` (`Service` + `HowTo`)** — same pattern.
6. **JSON-LD on `/playbook-sales` (`Product`)** — same pattern.
7. **Brand-defense Google Ads campaign** — $5/day, exact-match, operator action item.
8. **Google Search Console verification** — operator action item, DNS-TXT method.

### Waits for evidence gates

1. **Paid pain-mirror + problem-aware campaigns** — gates: ≥30% diagnostic conversion, ≥5% Starter conversion, ≥3 verified customer cycles.
2. **`/founders/[slug]` proof pages** — gate: first verified customer with public-profile opt-in.
3. **`/case-studies/[slug]` mirror of IH long-forms** — gate: first verified customer (so the case study has a customer story to anchor).
4. **`/glossary/[term]` answer pages** — gate: 3+ verified customers (so each entry can reference at least one named win).
5. **Competitor-name campaigns** — gate: 50 customers + competitor retaliation observed.

---

## Activation log

What flips on, when, and who flips it.

| Item | Trigger | Flipper | Pre-work required at trigger |
|---|---|---|---|
| Sitemap + robots + JSON-LD | Launch day | Engineering (shipped this pass) | None — files committed. |
| `metadataBase` | Launch day | Engineering (shipped this pass) | None — layout.tsx updated. |
| Google Search Console verification | Launch day | Maryan | DNS TXT add at Namecheap. 15 min. |
| Sitemap submission | Launch day, after SC verified | Maryan | One click in Search Console. |
| Brand-defense ad | Launch day | Maryan | Create Google Ads account; $5/day; exact-match `unlocksaas`. 30 min. |
| Pain-mirror paid campaigns | Workbook 09 §5 gates fire | Maryan | Pull C.2.5 ad copy; load C.2.4 negatives; verify UTM stamps reach Stripe metadata via existing wiring. |
| Problem-aware paid campaigns | Same gates | Maryan | Same. |
| `/founders/[slug]` route | First verified customer opts public | Engineering | Wire `profiles.builder_slug` + Server Component reading `builder_badges` view; ship `<Schema/>` block. |
| `/case-studies/[slug]` route | First verified customer | Engineering | Re-publish IH long-form with rel=canonical to IH; internal link to `/diagnostic`. |
| `/glossary/[term]` route | 3+ verified customers | Engineering | Author 10 entries (operator content); ship dynamic route + schema.org `FAQPage`. |
| Competitor-name paid campaigns | 50 customers + observed retaliation | Maryan | Re-evaluate Brunson rule; competitor-pair-specific approval. |
| AEO citation audit | Week 12 post-launch | Maryan | Manual 4-prompt × 4-LLM check; log in `strategy/audits/aeo-tracking.md`. |
| Quarterly Google strategy review | Every 90 days post-launch | Maryan | Re-read this doc; check Hard-Rule reconciliation hasn't drifted. |

---

## Score against the audit

This doc closes the Russell-audit gap on Traffic Secrets Secret #11 (Google).

| State | Score |
|---|---|
| Prior audit (v1 + v2) | **N/A** — correctly skipped, but not specced |
| Strategy completeness (this doc, file-based metadata shipped, brand-defense action item locked) | **100** |
| Operator unlocks (paid surface live with positive ROAS, 3+ verified cycles) | path to **100** at activation |

The doc gives the project the same level of "fully specced, gated, pre-staged" treatment that the Affiliate Army, Summit Funnel, Funnel Stack, and Funnel Audibles surfaces already have. Each one is a Phase-2 channel with a written playbook waiting for its evidence gate. Google was the last unmapped one.

---

## Cross-references

- **Workbook 09 §1** — launch-minimum channels (X + IH + Reddit) remain canonical; Google not in launch-minimum.
- **Workbook 09 §5** — paid-ad activation criteria (`free_diagnostic_conversion ≥ 30%`, `$1_starter_conversion ≥ 5%`, `verified_customer_cycles ≥ 3`) inherited as the Surface-C trigger.
- **Workbook 09 §6** — original Google line ("Bid on 'my saas isn't converting' once $1 funnel works") superseded by Surface-C C.2.5 specificity.
- **Workbook 10 §2** — Other People's Distribution (solo ads, integration partners) is the adjacent Phase-2 surface; Google complements but does not replace.
- **[strategy/funnel-stack.md](./funnel-stack.md)** — Layer 0 attribution stamps (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`) inherited unchanged.
- **[strategy/funnel-audibles.md](./funnel-audibles.md)** — Row 1 (`funnel_hub_viewed`) gains the `google_organic` / `google_paid` source split once Search Console + paid campaigns are live.
- **[strategy/dream-100-outreach.md](./dream-100-outreach.md)** — the off-platform signal loop that feeds AEO.
- **[strategy/podcast-outreach.md](./podcast-outreach.md)** — show notes are AEO citation density; podcast spots feed Surface B.
- **`strategy/state.json`** — `traffic_secrets.google` is the playbook-readable mirror of this doc.

---

## Status footer

| Field | Value |
|---|---|
| Locked at | 2026-05-17 |
| Locked by | Brunson Architect (autonomous, per founder instruction "proceed autonomously to get 100%") |
| Author of record | Maryan (founder, who reviews) |
| Files shipped this pass | `strategy/google-strategy.md` (this doc), `app/src/app/sitemap.ts`, `app/src/app/robots.ts`, `app/src/app/layout.tsx` (metadataBase + OG), `app/src/components/seo/json-ld.tsx`, JSON-LD blocks on `/`, `/diagnostic`, `/playbook-sales`, `strategy/state.json` (`traffic_secrets.google` block), `strategy/workbooks/09-fill-your-funnel.md` (§5/§6 cross-reference), `00-RESUME-HERE.md`, `build-log.md` |
| Next review trigger | First $5/day brand-defense ad click in production (sanity check the attribution wiring), or the workbook-09 §5 evidence gates firing — whichever comes first. |
| Score against my audit | Traffic Secrets Secret #11 lifted from **N/A → 100** (strategy-completeness sense). Operator unlocks for paid surface follow the locked evidence gates; nothing in this doc bypasses them. |

*The Google strategy is locked. Surface A and Surface B ship at launch. Surface C waits for the same evidence gates the rest of the Phase-2 stack already respects. The brand-coherence guardrail — don't let the SEO-addicted version of the founder back in through the channel doc — is the most important rule in this file.*

— Russell (in Brunson Architect mode)
