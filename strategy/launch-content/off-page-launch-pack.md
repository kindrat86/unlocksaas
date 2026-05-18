# Off-Page Launch Pack – Post the artifacts, claim the citations

**Project:** UnlockSaaS
**Status:** READY TO POST
**Sender identity:** `maryan@unlocksaas.com`, friendly From "Maryan from UnlockSaaS," signed "– Maryan"
**Companion docs:**
- [launch-kit.md](./launch-kit.md) – Week 1 content marketing (X threads, IH posts, DMs)
- [../dream-100-outreach.md](../dream-100-outreach.md) – Creator / influencer outreach
- [../dream-100-expansion.md](../dream-100-expansion.md), [../dream-100-influencers-fill.md](../dream-100-influencers-fill.md)

## Why this pack exists

The launch-kit covers ongoing content cadence. This pack covers the **one-shot announcements** for the three off-page artifacts shipped in PR #28 and the Dream 100 teardown-courtesy emails that need addresses confirmed in PR #26.

Three artifacts. Five channels. Posting order matters.

| # | Artifact | Primary post | Cross-posts |
|---|---|---|---|
| 1 | `/dataset` (CC-BY) | Show HN | X teaser, IH cross-post, LinkedIn long-form, dataset registry submissions |
| 2 | `/dont-buy-unlock-saas` (polarity) | X thread | IH long-form, LinkedIn post, Bluesky |
| 3 | `/press/topics/*` (reverse press kit) | Per-journalist outreach email | none (private channel) |
| 4 | Dream 100 teardown-courtesy queue | Operator address-confirmation pass | (PR #26 cron handles sends once approved) |

---

## §0 – Hard rules (carried over from launch-kit.md, enforced)

1. Story first, link at bottom. Every public post.
2. Reluctant Hero voice. Signed "– Maryan". No guru energy, no swagger.
3. No fake metrics, no fabricated reviews, no `aggregateRating`. The site does not lie; the launch copy does not lie either.
4. Single link per post. The link IS the pitch.
5. Anti-self-promo on IH and Reddit – story-first body, ZERO offer in body, offer lives in profile bio per workbook 09 §1.
6. Sender identity locked: `maryan@unlocksaas.com`. Never role addresses.
7. No em dashes in any copy. En dashes only. Hard rule per founder preference.
8. Athens time used for posting-window references; UTC carried for cron alignment.

---

## §1 – Posting order + cadence (10-day window)

| Day | Time (Athens) | Action | Channel |
|---|---|---|---|
| Day 1 (Tue or Wed, not Mon/Fri) | 15:00 | Show HN announcement live | news.ycombinator.com |
| Day 1 | 15:15 | X teaser thread, linking to HN | x.com/@maryan |
| Day 1 | 17:00 | IH cross-post (no HN reference) | indiehackers.com |
| Day 2 | 11:00 | LinkedIn long-form, dataset angle | linkedin.com |
| Day 2 | 14:00 | Submit to Kaggle | kaggle.com/datasets |
| Day 3 | 11:00 | Submit to data.world | data.world |
| Day 3 | 14:00 | Submit to Hugging Face Datasets | huggingface.co/datasets |
| Day 4 | 13:00 | Polarity X thread | x.com/@maryan |
| Day 5 | 11:00 | Polarity IH long-form | indiehackers.com |
| Day 5 | 18:00 | Polarity LinkedIn post | linkedin.com |
| Day 6 | 09:00 | Polarity Bluesky post | bsky.app |
| Day 8 | 09:30 | Press topic outreach email #1 (ai-generated-saas-flat-stripe-line) | journalist email |
| Day 9 | 09:30 | Press topic outreach email #2 (post-launch-pre-revenue) | journalist email |
| Day 10 | 09:30 | Press topic outreach email #3 (lovable-cursor-replit-founders) | journalist email |

Day 1 and Day 4 are the two "big launches"; everything else compounds them. Avoid Monday (low HN floor) and Friday (low engagement, weekend drift). Avoid the first week of December and last two weeks of August.

---

# Part A – `/dataset` launch

## A.1 – Show HN announcement (primary post)

**Title (under 80 chars, action verb first):**

> Show HN: 157-row open dataset of indie SaaS funnel and pricing teardowns

**URL field:** `https://unlocksaas.com/dataset`

**Text field (leave EMPTY).** Show HN convention is URL-only unless the post needs context. The /dataset page IS the context.

**First-comment reply (post 30 seconds after the submission goes live; sets the tone before strangers comment):**

```
Author here. Couple notes:

The dataset is 157 rows pulled from a tool I am building for post-launch
pre-revenue founders. Five tables:

- alternatives (25 honest competitor comparisons)
- funnel_teardowns (33 indie SaaS funnels analyzed Hook / Story / Offer)
- pricing_teardowns (31 indie SaaS pricing models, four levers)
- comparisons (55 head-to-head A vs B pages)
- categories (13 category roundups)

Every row has a lastVerified ISO date. CC-BY: attribution required.
No invented numbers, no scraped copy, no LLM paraphrases – each row is
sourced from a live read of the product's public page on the dated
lastVerified.

JSON + CSV at /dataset, per-table CSVs at /dataset/tables/. Markdown
mirror at /dataset.md for LLM retrievers.

Happy to fix any factual errors – reply here or email the address in
the editorial policy page on the site.

– Maryan
```

**Backup title variants (only if the first title hits zero votes after 2 hours):**
- "Show HN: Open dataset of 33 indie SaaS funnels analyzed Brunson-style"
- "Show HN: CC-BY dataset – 157 rows of indie SaaS funnel and pricing teardowns"

## A.2 – X teaser (post 15 min after HN goes live)

**Tweet 1 (hook):**

> I just open-sourced the dataset behind a tool I am building.
>
> 157 rows. Five tables. Every indie SaaS I have analyzed in the last six months.
>
> Pricing teardowns, funnel teardowns, honest A vs B comparisons, category roundups.

**Tweet 2 (the honest part):**

> Every row has a dated lastVerified. No scraped copy, no LLM paraphrases, no invented metrics.
>
> The discipline is the dataset. CC-BY: take it, cite it, build on it.

**Tweet 3 (story – why this exists):**

> I built this for myself first. I needed a way to study indie SaaS funnels without becoming the kind of founder who imagines a market by skimming Stripe screenshots on X.
>
> So I read the actual pages, dated the reads, and wrote it down.

**Tweet 4 (link – the only one in the thread):**

> JSON + CSV: https://unlocksaas.com/dataset
>
> Show HN: [paste the Hacker News submission URL]
>
> If a row is wrong, the editorial policy page tells you how it gets fixed.

## A.3 – Indie Hackers cross-post (Day 1 evening)

**Group:** Indie Hackers main feed (or "Marketing" group if you prefer narrower fit)

**Title:**

> I open-sourced the dataset behind the tool I am building (157 rows)

**Body:**

```
For six months I have been reading indie SaaS pages and writing them
down. Pricing teardowns, funnel teardowns, honest A vs B comparisons.
The discipline I locked from day one: every row has a dated
lastVerified, every claim comes from a live read of the public page,
no LLM paraphrases.

Today I published the dataset.

157 rows across five tables:

- 33 funnel teardowns (Hook / Story / Offer breakdowns)
- 31 pricing teardowns (tier structure, anchor mechanics, upgrade
  triggers, payment mechanics)
- 55 head-to-head comparisons (A vs B, dimension by dimension)
- 25 named-competitor alternatives (honest disqualifications, not
  slag posts)
- 13 category roundups

CC-BY licence. Take it, cite it, build on it.

JSON + CSV: https://unlocksaas.com/dataset

What I am asking for: if you spot a row that is factually wrong on
your product, reply or email the address on the editorial policy
page. The corrections log is public.

What I am NOT asking for: backlinks, traffic, upvotes, sponsorships.
The dataset is the artifact. Use it or don't.

– Maryan
```

Anti-self-promo rule: the body does not mention the product. The dataset link goes to /dataset which itself does not push any product. Maryan's IH profile bio carries the product link.

## A.4 – LinkedIn long-form (Day 2)

**Tone for LI:** longer, more business-y, slightly less casual than X. Same Brunson Reluctant Hero voice, but the audience is more "B2B operators" than "indie founder Twitter".

**Body:**

```
For six months I have been studying indie SaaS the boring way:

Open the live page. Read it. Write down what I saw, dated. Move on.

No scraping. No AI summaries. No quoted copy.

Today I open-sourced the dataset: 157 rows across five tables.

– 33 funnel teardowns analyzed through Russell Brunson's Hook / Story /
  Offer framework
– 31 pricing teardowns broken down by tier structure, anchor mechanics,
  upgrade triggers, and payment mechanics
– 55 head-to-head A vs B comparisons, dimension by dimension
– 25 honest alternative-to pages (this product is NOT a substitute for
  that product, here is why)
– 13 category roundups

Why I built it this way: most "SaaS research" you find online is a
scraped pricing table from 2022 and a paragraph that hallucinates the
rest. I needed reads I could trust. So I sat with the pages and wrote
honestly.

The licence is CC-BY. Take it, cite it, build on it.

The link is in the comments to keep this feed-friendly.

– Maryan
```

**First comment (where the link lives):**

```
Dataset: https://unlocksaas.com/dataset

The editorial policy on the site explains exactly how rows get sourced
and corrected. If you spot a row that's wrong on your product, the same
page tells you how to flag it.
```

## A.5 – Dataset registry submissions

Each one needs a single submission. None require an "ongoing relationship" or moderator approval beyond a one-line description and the CC-BY licence flag.

**Kaggle** (https://www.kaggle.com/datasets, "New Dataset"):
- Title: `Indie SaaS Funnel and Pricing Teardowns (157 rows, CC-BY)`
- Subtitle: `Five tables of dated, source-cited indie SaaS analysis. CC-BY.`
- Source URL: `https://unlocksaas.com/dataset`
- Files to upload: the per-table CSVs (alternatives, categories, comparisons, funnel-teardowns, pricing-teardowns) – grab them at `/dataset/tables/*.csv`.
- Tags: `saas, business, marketing, pricing, indie-saas, ccby, programmatic-seo`
- Licence: CC BY 4.0
- Description: paste the Show HN first-comment body (A.1) verbatim.

**data.world** (https://data.world/, "Add Data"):
- Same metadata as Kaggle.
- Link the JSON export at `/dataset/indie-saas-teardowns.json` directly; data.world ingests JSON natively.

**Hugging Face Datasets** (https://huggingface.co/new-dataset):
- Repo name: `unlocksaas/indie-saas-teardowns`
- Visibility: Public
- Licence: cc-by-4.0
- README content: paste the body of `/dataset.md` (so the HF readme mirrors the canonical markdown sibling).
- Upload the JSON + CSV files via the HF web UI or `huggingface-cli upload`.

**Google Dataset Search**: nothing to submit – it crawls `schema.org/Dataset` JSON-LD automatically. The /dataset page already emits the Dataset block, so this happens for free on the next crawl.

**Awesome Lists on GitHub**:
- Submit a PR to `sindresorhus/awesome` (under "Datasets") with one line:
  ```
  - [Indie SaaS Funnel and Pricing Teardowns](https://unlocksaas.com/dataset) - 157 dated rows of honest funnel, pricing, and comparison teardowns. CC-BY.
  ```
- Also: `awesome-public-datasets` (under "Business"), `awesome-saas` (community varies, look for active list).

---

# Part B – `/dont-buy-unlock-saas` launch

The polarity page is the highest-share-probability surface on the site. The launch posts use polarity as the hook, not the product.

## B.1 – X thread (Day 4)

**Tweet 1 (hook):**

> I shipped a "Don't Buy" page for my own SaaS today.
>
> Eight reasons not to give me money, signed by me, before checkout.

**Tweet 2 (story / why):**

> Most landing pages tell you who they are for. None tell you who they are NOT for.
>
> So you find out in week one, ask for a refund, and we both lose the time.
>
> I decided I would rather lose the sale than the time.

**Tweet 3 (specifics – pick 3 of the 8):**

> Three of the eight, paraphrased:
>
> – You have not shipped a product yet. Build first, then come back.
> – You hate writing. Step 3 is "write one sentence". Step 5 is "send one message". Both are writing.
> – You think Stripe verification is a gimmick. It is not; it is the literal refund mechanism.

**Tweet 4 (the move):**

> The page links to a competitor in disqualifier #1.
>
> If you have not shipped, the tool you need is Lovable / Replit / v0, not me. Saying so out loud costs me nothing and saves the wrong customer 90 days.

**Tweet 5 (close + link):**

> Whole page: https://unlocksaas.com/dont-buy-unlock-saas
>
> If any of the eight match, the page is also the cheapest 4-minute read in the indie SaaS internet today.
>
> – Maryan

## B.2 – Indie Hackers long-form (Day 5)

**Title:**

> Why I shipped a "Don't Buy" page for my own SaaS

**Body:**

```
Yesterday I added a page to the site that lists eight reasons NOT to
buy what I sell.

Each one is real. Each one is a constraint a wrong-fit buyer would hit
in the first week. The disqualifiers are signed by me, dated, and one of
them links to a competitor.

The premise: most landing pages tell you who they are for. The "who
they are not for" part is left unsaid because it might cost a sale.

But the wrong-fit sale doesn't pay; it refunds. And in between, both
of us spend three weeks discovering what the page should have said in
plain English on day one.

The page reads more like an editorial than a marketing surface. There
is no "but actually you SHOULD buy after all" twist at the bottom. The
canonical buyer profile is one short paragraph at the end; if you don't
fit it, the page closes with a link to the free diagnostic, which costs
nothing.

A few specifics from the eight:

1. You have not shipped a product yet. The Playbook starts on a live
   URL. The page links out to Lovable / Replit / v0 / Bolt – go ship,
   then come back.

2. You hate writing. Step 3 of the Playbook is "write one offer
   sentence". Step 5 is "send one outreach message". Both are writing.
   Software does not replace this.

3. You expect a one-click "generate me a customer" button. The
   Playbook is software, but it exists to push back. If you wanted a
   button, the product will feel obstructive on day two.

4. You think Stripe verification is a gimmick. The 60-day refund fires
   automatically when Stripe shows zero new paying customers and the
   in-product milestones were completed. It is the actual refund
   mechanism, not marketing copy.

The fifth through eighth disqualifiers are on the page; I'll leave
them there so the visit is worth your time.

The thing I learned writing it: every disqualifier is a thing I would
say out loud on a call. The page is just the call, written down, with
a permanent URL.

– Maryan

[Profile bio carries the product link per IH convention. Body has zero
self-promotion.]
```

## B.3 – LinkedIn post (Day 5 evening)

```
Shipped a page yesterday that lists eight reasons NOT to buy my
product.

Yes, that is the whole post.

The bet: a wrong-fit customer who refunds at day 60 costs both of us
3 months. A wrong-fit customer who reads the page and walks costs
nobody anything.

One of the eight disqualifiers links out to a competitor (if you
haven't shipped a product yet, you need Lovable / Replit, not me).
Saying so out loud cost me nothing and saved someone 90 days.

The page is in the first comment.

– Maryan
```

**First comment:**

```
Page: https://unlocksaas.com/dont-buy-unlock-saas
```

## B.4 – Bluesky post (Day 6)

Bluesky cadence is loose; this is one short post, no thread.

```
I shipped a "Don't Buy" page for my own SaaS today.

Eight reasons not to give me money, signed by me, before checkout. One
of them links to a competitor. None of them are marketing copy.

https://unlocksaas.com/dont-buy-unlock-saas
```

---

# Part C – Press topics outreach (private channel)

PR #28 shipped three pre-assembled press topic packages at `/press/topics/[slug]`. The Day 8-10 sequence puts one in front of one journalist per day.

## C.0 – Finding the right journalist

For each topic, target writers who covered the matching beat in the last 90 days:

**ai-generated-saas-flat-stripe-line**:
- Casey Newton (Platformer), Alex Heath (The Verge), Ben Tossell (newsletter)
- Beat: AI-generated products, Lovable / Cursor / v0 founders, post-launch reality

**post-launch-pre-revenue**:
- Sahil Bloom, Justin Welsh, Patrick McKenzie (kalzumeus.com)
- Beat: pre-PMF founder reality, anti-marketing positioning, "honest founder" archetype

**lovable-cursor-replit-founders**:
- The Pragmatic Engineer (Gergely Orosz), Latent Space podcast, AI Tinkerers writers
- Beat: AI dev tools, indie SaaS shipped with AI assistants

Use the existing dream-100 list (`strategy/dream-100.csv`) as the starting universe; expand to writer-specific beats from there.

## C.1 – Email template (one per topic, slot-fill before sending)

**From:** Maryan from UnlockSaaS <maryan@unlocksaas.com>
**Subject (variant A):** [TOPIC IN PLAIN ENGLISH] – pre-built source page in case useful
**Subject (variant B):** [Their recent piece title] – a source page I built for the next angle

**Body:**

```
[FIRST NAME],

I read your [DATE-WORD, e.g. "recent"] piece on [SPECIFIC PIECE OR
ANGLE]. The framing on [ONE-PHRASE SPECIFIC OBSERVATION FROM THE PIECE]
matched something I have been documenting from inside the indie SaaS
side of that same story.

I am a non-engineer founder who shipped a tool for post-launch
pre-revenue indie SaaS founders. As part of the launch I built a
journalist source page on exactly this angle:

[ONE OF:
 – https://unlocksaas.com/press/topics/ai-generated-saas-flat-stripe-line
 – https://unlocksaas.com/press/topics/post-launch-pre-revenue
 – https://unlocksaas.com/press/topics/lovable-cursor-replit-founders ]

The page carries three pre-approved founder quotes (verbatim re-use,
no permission needed), three data points each cited to a live URL on
my own site, three honest counter-points, a fact sheet, and a
byline-ready headshot pointer.

No ask. If the angle ever comes up and one of the quotes or data
points slots into a piece, the page is built for that.

If you want to talk to the person behind it, my calendar is on the
page. Or just reply.

– Maryan
https://unlocksaas.com
```

**What NOT to do:**
- Do not send the same email to multiple journalists in 24h (anti-spam).
- Do not pitch a story angle. You are giving a citation, not requesting one.
- Do not reference traffic numbers, social counts, or "going viral on HN" – Brunson Hard-Rule.
- Do not BCC.

**Follow-up rule:**
- One follow-up email, 7 days later, with subject line `Re: [original subject]`. Body: two lines, "checking in case this is useful, no reply needed".
- After two emails, drop. Do not chase. The page is permanent; the next story angle is the next opportunity.

---

# Part D – Dream 100 teardown-courtesy queue

PR #26 shipped the cron at `/api/cron/teardown-courtesy` that sends one founder-to-founder courtesy email per weekday at 13:00 UTC. The queue is gated by `contact_email IS NOT NULL` and `approved_at IS NOT NULL` per the Brunson Hard-Rule discipline.

## D.1 – Operator weekly approval pass

Once per week (Monday afternoon, Athens time), do this:

1. Open the queue table via Supabase studio or `psql`:
   ```sql
   SELECT slug, display_name, contact_email, approved_at
   FROM teardown_courtesy_queue
   WHERE approved_at IS NULL
   ORDER BY created_at;
   ```

2. For the top 5 unapproved entries: find the founder's contact email.
   - First: check their own website footer + /about + /contact pages.
   - Second: check their public X / LinkedIn bio for an email.
   - Third: search for "founder name + email" on the same domain.
   - If no public email after 90 seconds of looking: skip. Do NOT use email-finding services. The Brunson Hard-Rule is "real public-record contact only".

3. Set `contact_email` and `approved_at = now()`:
   ```sql
   UPDATE teardown_courtesy_queue
   SET contact_email = 'founder@theirdomain.com',
       approved_at = now()
   WHERE slug = 'their-slug';
   ```

4. The cron picks up the next approved row Monday 13:00 UTC, sends, logs to `teardown_courtesy_audit`.

## D.2 – Reply handling

When a founder replies (and 10-20% will):
- If they thank you: reply once, friendly, no offer, no link. Sign off.
- If they correct a factual error: thank them, fix the row in `src/lib/funnel-teardowns.ts`, ship the fix in a tiny PR, reply with the corrections-log URL.
- If they ask "what do you build?": reply with the six-line founder bio from workbook 01 §6 Beat 2 (carry over from dream-100-outreach.md §0 rule 4).
- If they ask a hostile question: answer honestly. If the teardown is fair, hostile replies are rare. If a hostile reply lands, that is signal worth listening to.

Never:
- Upsell in the reply.
- Add them to a marketing list.
- Forward replies to anyone.

---

# Part E – Tracking + attribution

## E.1 – Referrer tagging

All links posted from this pack should carry UTM tags so PostHog and the GSC feedback cron can attribute traffic correctly.

| Channel | UTM source | UTM medium | UTM campaign |
|---|---|---|---|
| HN | hn | referral | dataset-launch |
| X (artifact A) | x | social | dataset-launch |
| X (artifact B) | x | social | dont-buy |
| IH | indiehackers | referral | dataset-launch / dont-buy |
| LinkedIn | linkedin | social | dataset-launch / dont-buy |
| Bluesky | bluesky | social | dont-buy |
| Press topic emails | press | email | press-topic-`<slug>` |
| Dataset registries | kaggle / dataworld / huggingface | referral | dataset-registry |

Example: post the dataset on HN as `https://unlocksaas.com/dataset?utm_source=hn&utm_medium=referral&utm_campaign=dataset-launch`.

The site root canonical strips `utm_*` params so the trailing query does not pollute the index, but PostHog captures them on entry. (Verified: the existing PostHog provider already groups by UTM.)

## E.2 – "Did it land?" check (T+24h after each post)

For each post:

1. PostHog → Web Analytics → Sources → filter by today: confirm the channel shows up.
2. Vercel → Logs → check no 500s on the artifact URL during the post's traffic burst.
3. GSC → Performance → URL filter on the artifact URL: confirm impressions start within 48h (Google's pickup latency from a hot page).
4. IndexNow logs (`/api/cron/indexnow`): confirm the URL was pushed in the last 24h.

If a post hits >100 PostHog visitors in 24h without any traffic landing on /diagnostic, the artifact converted as content but failed to pull readers down the funnel. Note in the launch journal; revisit the CTA placement on the artifact page.

## E.3 – Launch journal

Append a row to `strategy/state.json → off_page_launches[]` per post:

```json
{
  "date_utc": "2026-MM-DDTHH:MMZ",
  "artifact": "/dataset",
  "channel": "hn",
  "url_posted": "https://news.ycombinator.com/item?id=...",
  "outcome": {
    "first_24h_visitors": 0,
    "diagnostic_starts": 0,
    "backlinks_observed": [],
    "notes": ""
  }
}
```

The shape above is for future analytics; capturing it manually for the first launch establishes the baseline. Day 30 review: compare the dollar-cost-per-backlink across the five channels and double down on the cheapest two.

---

# Status

| Section | State |
|---|---|
| §0 hard rules | LOCKED |
| §1 posting order | LOCKED, override day-of for HN floor |
| Part A (dataset) | READY TO POST |
| Part B (polarity) | READY TO POST |
| Part C (press topics) | READY TO POST after journalist shortlist |
| Part D (teardown-courtesy queue) | READY – needs operator approval pass |
| Part E (tracking) | READY – wire UTMs at post time |

Signed: – Maryan, founder, Unlock SaaS.

Document published: 2026-05-19. Last reviewed: 2026-05-19.
