# SEO / GEO / E-E-A-T Activation Checklist

**Source:** Lifts the codebase from "infrastructure shipped" to "signals live." Operationalizes [strategy/google-strategy.md](./google-strategy.md) §A.6 (Search Console) and §B (AEO/GEO Surface B) by enumerating every empty env slot the code already reads.
**Status:** Operator workbook. Each section is a 5-30 minute task. Total time end-to-end: ~3 hours, spread over a week. Audit lift: 89/100 → ~96/100.
**Pre-conditions:** Domain owned. Vercel project linked. Production deploy live at https://unlocksaas.com. Maryan can paste env vars into [the Vercel project settings](https://vercel.com/sales-sipiteno/unlocksaas/settings/environment-variables) (2 min per var).
**Brunson Hard-Rule:** Every env slot below corresponds to a real, currently-operating console or platform. Setting a slot to a fabricated value is rejected by the code (URL validators in [entity.ts](../app/src/lib/seo/entity.ts), token trimming in [verification.ts](../app/src/lib/seo/verification.ts), length check in [indexnow.ts](../app/src/lib/indexnow.ts)). Leave a slot empty rather than fake it.

> "Don't claim a profile until the bio claims you back. Don't claim a code until the console issued it. Don't claim a customer until Stripe verified the charge." – the founding editorial standard of UnlockSaaS, applied to its own Knowledge Graph.

---

## Why this document exists

The audit pass that scored UnlockSaaS at 89/100 on combined SEO/pSEO/GEO/AIO/AEO/E-E-A-T identified a single common pattern in every deduction: the code reads an env var, the code validates the env var, the code wires the env var into the rendered HTML or HTTP API – and the env var is unset. So the rendered HTML is honest (empty `sameAs`, no verification meta tag, IndexNow returns 503) but the signal surface the world sees is the activation level, not the code level.

This file turns "set the env vars" from a vague TODO into a concrete, leverage-ordered, time-estimated checklist. It is the path from gated E-E-A-T to active E-E-A-T without violating the Brunson Hard-Rule.

Three tiers, ordered by impact-per-minute:

1. **Tier 1 – Verification consoles** (45 min, +3 points). Unlocks Search Console and Bing Webmaster, which then unlock AI Overview eligibility metrics, Bing Copilot citation tracking, and IndexNow submission acknowledgement.
2. **Tier 2 – Bidirectional sameAs anchors** (60 min, +3 points). Each profile must already exist AND its bio must name unlocksaas.com. One-way claims do not earn Knowledge Graph weight.
3. **Tier 3 – IndexNow + Knowledge Graph entity anchors** (45 min, +2 points). Bing/Yandex/Naver push-indexing + the Wikidata Q-ID that compounds the entire Tier 2 surface.

---

## Tier 1 – Verification consoles (45 minutes, +3 points)

Each console below requires a one-line meta-tag verification. The code at [app/src/lib/seo/verification.ts](../app/src/lib/seo/verification.ts) reads the env var and emits the meta tag automatically on next deploy. No code change required.

### 1.1 Google Search Console (10 min)

**Why first:** the highest-leverage console for organic + AI Overview eligibility. Submitting `sitemap.xml` here gates Google's discovery of every pSEO slug; without verification Googlebot crawls but does not surface AI Overview citation metrics.

**Steps:**

1. Visit [search.google.com/search-console](https://search.google.com/search-console).
2. "Add property" → "URL prefix" → paste `https://unlocksaas.com`.
3. Pick "HTML tag" verification. Copy the `content="..."` value (just the token, not the surrounding meta tag).
4. In Vercel project settings, add to **Production + Preview**:
   - `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` = `<token>`
5. Trigger a deploy (or wait for the next push). When the new build is live, click "Verify" in Search Console.
6. Once verified, submit the sitemap: in Search Console left nav → "Sitemaps" → enter `sitemap.xml` → submit.

**Acceptance test:** `curl -s https://unlocksaas.com/ | grep google-site-verification` returns the meta tag.

### 1.2 Bing Webmaster Tools (10 min)

**Why second:** Bing AI Copilot citations are powered by the Bing index, and IndexNow submissions (Tier 3) acknowledge only against a verified domain.

**Steps:**

1. Visit [bing.com/webmasters](https://www.bing.com/webmasters/).
2. "Add a site" → `https://unlocksaas.com`. (Faster shortcut: "Import from Google Search Console" once Tier 1.1 is verified.)
3. Pick "HTML Meta Tag". Copy the `content="..."` value.
4. Add to Vercel **Production + Preview**:
   - `NEXT_PUBLIC_BING_SITE_VERIFICATION` = `<token>`
5. Deploy, then click "Verify".
6. Submit `https://unlocksaas.com/sitemap.xml`.

**Acceptance test:** `curl -s https://unlocksaas.com/ | grep msvalidate.01` returns the meta tag.

### 1.3 Yandex Webmaster (8 min)

**Why third:** Yandex.AI / Alice / GigaChat retrieval pipelines weigh Yandex-verified domains higher; the Russian-speaking indie SaaS audience is non-trivial.

**Steps:**

1. Visit [webmaster.yandex.com](https://webmaster.yandex.com/).
2. Add site → `https://unlocksaas.com` → choose "Meta tag" verification.
3. Copy the token.
4. Add to Vercel:
   - `NEXT_PUBLIC_YANDEX_VERIFICATION` = `<token>`
5. Deploy, then click "Check".

**Acceptance test:** `curl -s https://unlocksaas.com/ | grep yandex-verification` returns the meta tag.

### 1.4 Pinterest (5 min, optional)

**Skip if:** UnlockSaaS will not ship Pinterest content. Rich Pins for `/builders` testimonials are a Phase-2 surface gated on first verified builder anyway. Slot exists; come back when a relevant surface ships.

**Slot:** `NEXT_PUBLIC_PINTEREST_SITE_VERIFICATION`

### 1.5 Facebook / Meta Business (5 min, optional)

**Skip if:** No paid Meta ads in Phase 1 (Surface C deferred per [google-strategy.md](./google-strategy.md) §C). Re-evaluate when Phase 2 paid surface activates.

**Slot:** `NEXT_PUBLIC_FACEBOOK_DOMAIN_VERIFICATION`

### 1.6 Naver Webmaster (5 min, optional)

**Skip if:** No Korean-language audience. Naver's index powers Korean LLM retrieval (HyperCLOVA). Not a current target.

**Slot:** `NEXT_PUBLIC_NAVER_SITE_VERIFICATION`

---

## Tier 2 – Bidirectional sameAs anchors (60 minutes, +3 points)

Each profile below earns full Knowledge Graph weight ONLY when both legs of the round-trip are true:

- This site claims the handle via `sameAs` (set the env var below).
- The handle's bio names `unlocksaas.com` (or links to it).

One-legged claims earn the lower confidence weight. **Fill the bio first, set the env var second.** That way the moment Google's next refresh crawls the profile, both legs are simultaneously true.

The code at [app/src/lib/seo/entity.ts](../app/src/lib/seo/entity.ts) `buildSameAs()` validates each URL: must start with `https://`, must parse via the URL constructor, must be non-empty. Bad URLs are silently dropped.

### 2.1 X / Twitter (10 min) – highest-leverage social

**Why first in Tier 2:** the founder is already publishing here (workbook 09 §1 IH cadence + soap-opera cross-post). X profiles are the most-cited social anchor in indie SaaS Knowledge Graph pipelines.

**Steps:**

1. Edit the X profile bio: include the text "Founder of UnlockSaaS" and either `unlocksaas.com` as the link field OR a tagged mention `@unlocksaas` (if a brand account is created).
2. Confirm the profile URL: `https://x.com/<handle>` (NOT `twitter.com` – the canonical now is x.com).
3. Set in Vercel:
   - `NEXT_PUBLIC_UNLOCKSAAS_X_URL` = `https://x.com/<handle>`

### 2.2 Indie Hackers (10 min) – audience-native anchor

**Why second:** Marco-the-avatar lives on Indie Hackers (dream-customer location per workbook 08). IH is the highest-quality referral source the entity can claim.

**Steps:**

1. Edit IH profile: bio includes "Founder of UnlockSaaS" + link field set to `https://unlocksaas.com`.
2. Confirm the profile URL: `https://www.indiehackers.com/<handle>`.
3. Set in Vercel:
   - `NEXT_PUBLIC_UNLOCKSAAS_INDIE_HACKERS_URL` = `https://www.indiehackers.com/<handle>`

### 2.3 LinkedIn (10 min) – B2B credibility anchor

**Steps:**

1. Edit LinkedIn profile: Headline includes "Founder of UnlockSaaS"; Experience block has "UnlockSaaS · Founder · 2026–Present" with the website field set to `https://unlocksaas.com`.
2. Confirm the profile URL: `https://www.linkedin.com/in/<handle>`.
3. Set in Vercel:
   - `NEXT_PUBLIC_UNLOCKSAAS_LINKEDIN_URL` = `https://www.linkedin.com/in/<handle>`

### 2.4 GitHub (5 min) – developer-audience anchor

**Steps:**

1. Edit GitHub profile: bio names "UnlockSaaS"; "Website" field set to `https://unlocksaas.com`.
2. Confirm: `https://github.com/<handle>`.
3. Set in Vercel:
   - `NEXT_PUBLIC_UNLOCKSAAS_GITHUB_URL` = `https://github.com/<handle>`

### 2.5 YouTube (5 min) – owned-traffic anchor

**Skip if:** no YouTube channel yet. The slot is wired for the Phase-2 owned-traffic surface (see [strategy/youtube-outreach.md](./youtube-outreach.md)). Until a channel exists with at least the Founder VSL uploaded, leave empty.

**Slot:** `NEXT_PUBLIC_UNLOCKSAAS_YOUTUBE_URL`

### 2.6 Product Hunt (5 min) – launch-day anchor

**Skip if:** PH launch is post-first-verified-builder (gated). Set the env var on the day of the launch so the entity graph reflects the listing the moment it goes live.

**Slot:** `NEXT_PUBLIC_UNLOCKSAAS_PRODUCT_HUNT_URL`

### 2.7 Crunchbase (10 min, optional)

**Steps:**

1. Submit a free Crunchbase entry for "UnlockSaaS": [crunchbase.com/add-new](https://www.crunchbase.com/add-new).
2. Wait for moderation (24-72h).
3. Once live, set:
   - `NEXT_PUBLIC_UNLOCKSAAS_CRUNCHBASE_URL` = `https://www.crunchbase.com/organization/<slug>`

### 2.8 G2 / Capterra (skip until first verified builder)

**Why skip:** G2 and Capterra entries earn weight from review count. Submitting a profile with zero reviews creates a dead anchor that Knowledge Graph deweights. Wait until the Verified Builder count crosses 5, then submit with the verified-builder testimonials.

**Slots:** `NEXT_PUBLIC_UNLOCKSAAS_G2_URL`, `NEXT_PUBLIC_UNLOCKSAAS_CAPTERRA_URL`

---

## Tier 3 – Knowledge Graph entity anchors + crawl push (45 min, +2 points)

### 3.1 IndexNow key (10 min)

**Why:** Bing, Yandex, Naver, and Seznam.cz support IndexNow push-indexing. Submitting a URL via IndexNow typically results in crawl-within-minutes on Bing and crawl-within-an-hour on Yandex, versus crawl-on-discovery-cadence (days) without it. The code at [app/src/lib/indexnow.ts](../app/src/lib/indexnow.ts) is wired, [app/src/app/api/indexnow/route.ts](../app/src/app/api/indexnow/route.ts) handles submission, and [app/src/app/indexnow-key/route.ts](../app/src/app/indexnow-key/route.ts) serves the key file at `/<key>.txt`. All three are gated on `INDEXNOW_KEY` being set.

**Steps:**

1. Generate a 32-character hex key (any method):
   ```bash
   openssl rand -hex 16
   # or
   node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
   ```
2. Set in Vercel **Production + Preview**:
   - `INDEXNOW_KEY` = `<32-hex-string>`
3. Deploy.
4. Verify the key file is reachable:
   ```bash
   curl -s https://unlocksaas.com/<INDEXNOW_KEY>.txt
   # should return the key string and HTTP 200
   ```
5. Submit the homepage manually once to register with the API:
   ```bash
   curl -X POST "https://api.indexnow.org/IndexNow" \
     -H "Content-Type: application/json" \
     -d '{
       "host": "unlocksaas.com",
       "key": "<INDEXNOW_KEY>",
       "keyLocation": "https://unlocksaas.com/<INDEXNOW_KEY>.txt",
       "urlList": ["https://unlocksaas.com/"]
     }'
   ```
6. (Optional) Wire a Vercel Deploy Hook to `POST https://unlocksaas.com/api/indexnow` on every production deploy so every new pSEO slug lands on Bing/Yandex within minutes.

**Acceptance test:** the curl in step 4 returns the key plaintext.

### 3.2 Wikidata entry (20 min) – the single highest-leverage Knowledge Graph anchor

**Why:** A populated Wikidata Q-URL is worth more for AI Overviews than every other social profile combined. Wikidata is the canonical machine-readable entity ID Google's Knowledge Graph uses to disambiguate brands. LLM training corpora (Common Crawl, RedPajama, FineWeb) treat Wikidata as a primary citation source.

**Steps:**

1. Create a free Wikidata account at [wikidata.org](https://www.wikidata.org).
2. Click "Create a new item" in the left sidebar.
3. Label: `UnlockSaaS`. Description: `Sales-funnel playbook for post-launch pre-revenue SaaS founders` (under 250 chars). Aliases: `Unlock SaaS`, `unlocksaas.com`.
4. Add statements (use "+ add statement" for each):
   - **instance of** (P31) → `business` (Q4830453) OR `online service` (Q1668024)
   - **official website** (P856) → `https://unlocksaas.com`
   - **founded by** (P112) → create a sub-item for "Maryan" or skip if no Wikidata Person entry exists yet
   - **inception** (P571) → `2026-05-17`
   - **country** (P17) → leave unset (digital-only, worldwide)
   - **described at URL** (P973) → `https://unlocksaas.com/about` (qualifier: `language of work or name (P407) → English`)
5. Save. Note the Q-number (e.g. `Q123456789`).
6. Set in Vercel:
   - `NEXT_PUBLIC_UNLOCKSAAS_WIKIDATA_URL` = `https://www.wikidata.org/wiki/Q<number>`

**What this unlocks:**

- The `mainEntityOfPage` field in Organization JSON-LD lights up (currently undefined).
- The `sameAs` array gains the highest-weight entry it can hold.
- AI Overview / Perplexity / Gemini citation pipelines resolve "UnlockSaaS" to a stable Q-ID instead of a string-match.

### 3.3 Wikipedia article (deferred)

**Skip until:** at least three earned-media mentions exist (the notability bar). Premature Wikipedia entries get deleted via AfD ("Articles for Deletion"), which is worse than no entry. The slot stays empty until [app/src/lib/media-mentions.ts](../app/src/lib/media-mentions.ts) `MEDIA_MENTIONS` has at least three entries from independent publications.

**Slot:** `NEXT_PUBLIC_UNLOCKSAAS_WIKIPEDIA_URL`

### 3.4 SameAs.org (5 min)

**Why:** SameAs.org aggregates entity equivalences across the web. A single entry there strengthens every other `sameAs` row already declared.

**Skip if:** Tier 2 has fewer than 3 populated entries (SameAs.org rewards the round-trip).

**Slot:** `NEXT_PUBLIC_UNLOCKSAAS_SAMEAS_ORG_URL`

### 3.5 Other (1 ad-hoc slot)

**For:** the single unforeseen high-quality external profile (e.g. a Hacker News thread the founder authored that became a canonical reference for the topic, a specific Indie Hackers Forum tag).

**Slot:** `NEXT_PUBLIC_UNLOCKSAAS_OTHER_URL`

---

## Activation log

Update this section as each slot lands. The log becomes the audit trail for the next time the entity graph is reviewed.

| Date | Slot | Source | Notes |
|---|---|---|---|
| 2026-05-18 | _(awaiting first activation)_ | – | Checklist authored. |

---

## What this does NOT cover

The deductions below remain open after the checklist completes – they are gated on real-world events the operator cannot accelerate by pasting env vars:

1. **Verified Builder rows (`/builders` empty state).** Closes when the first Stripe-verified customer cycle completes. Schema infrastructure is now live ([app/src/components/seo/builders-collection.tsx](../app/src/components/seo/builders-collection.tsx) – the `CollectionPage` ships today, the `ItemList` lights up automatically the moment a row lands).
2. **Earned media mentions.** Closes when the first independent publication names UnlockSaaS. The `subjectOf` Article schema lights up automatically via [app/src/lib/media-mentions.ts](../app/src/lib/media-mentions.ts) `MEDIA_MENTIONS` array – append a row, redeploy, the entity graph thickens.
3. **`aggregateRating` on the Playbook Product.** Closes when public reviews exist. The Brunson Hard-Rule blocks invention; the schema field is correctly omitted today.
4. **`/founders/[slug]` proof pages (Phase 2 content roadmap, [google-strategy.md](./google-strategy.md) §A.5).** Gated on first verified customer cycle per [strategy/workbooks/10-launch.md](./workbooks/10-launch.md) §3.

The audit score line that closes each item:

| Deduction | Closes when | Lift |
|---|---|---|
| `sameAs` empty | Tier 2 entries ≥ 3 | +3 |
| No verification consoles | Tier 1.1-1.3 verified | +3 |
| IndexNow inactive | Tier 3.1 done | +2 |
| Wikidata Q-ID empty | Tier 3.2 done | +2 |
| `/builders` empty | First Stripe-verified cycle (gated, not operator-action) | +3 |
| No earned media | First independent publication mention (gated) | +2 |
| `aggregateRating` missing | First public review (gated) | +1 |

Tier 1 + Tier 2 + Tier 3 = up to +10 points by operator action alone (89 → ~96).

---

## Cross-references

- [strategy/google-strategy.md](./google-strategy.md) – the locked surface map (A organic, B AEO/GEO, C paid deferred).
- [strategy/owned-traffic.md](./owned-traffic.md) Part 7 – the `/builders` directory's role in the owned-traffic stack.
- [app/src/lib/seo/entity.ts](../app/src/lib/seo/entity.ts) – `buildSameAs()` and URL validators.
- [app/src/lib/seo/verification.ts](../app/src/lib/seo/verification.ts) – verification env reader.
- [app/src/lib/indexnow.ts](../app/src/lib/indexnow.ts) – IndexNow client + key validator.
- [app/src/components/seo/builders-collection.tsx](../app/src/components/seo/builders-collection.tsx) – Verified Builders CollectionPage schema (ships today, lights up on first row).

---

## Status footer

**Authored:** 2026-05-18.
**Owner:** Maryan.
**Cadence:** review when the activation log gains 3+ entries, OR when [strategy/google-strategy.md](./google-strategy.md) is amended, OR when the audit is re-run.
**Hard-Rule lock:** every slot above maps to a real, currently-operating console / platform. No fabricated codes, no aspirational profiles, no speculative entity anchors. The activation log is the audit trail.
