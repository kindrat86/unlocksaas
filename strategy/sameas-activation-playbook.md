# sameAs / Knowledge Graph Activation Playbook

**Source:** [google-strategy.md §B.3 (off-platform signal loop) + §B.4 (entity-graph activation)](./google-strategy.md)
**Status:** Activation roadmap. The infrastructure ships; this doc covers the operator actions.
**Audit:** Run `python3 scripts/seo-activation-check.py` any time to see which slots are populated.

---

## Why this exists

The SEO/GEO/AIO audit identified one cluster as the single highest-leverage missing signal: the `sameAs` / `mainEntityOfPage` / `subjectOf` arrays on the Organization + Person JSON-LD are empty. Every supporting piece of code is shipped:

- [src/lib/seo/entity.ts](../app/src/lib/seo/entity.ts) reads 13 env-driven URL slots
- [src/components/seo/json-ld.tsx](../app/src/components/seo/json-ld.tsx) wires them into Organization + Person `sameAs` and Organization `mainEntityOfPage`
- [src/lib/media-mentions.ts](../app/src/lib/media-mentions.ts) supplies the `subjectOf` Article anchors

The schema graph activates the moment an operator fills the env vars on Vercel and pushes a redeploy. No code change required.

What this playbook covers:
1. Why bidirectional matters
2. The exact order to claim profiles (highest-leverage first)
3. The exact bio copy that satisfies the round-trip claim
4. The `vercel env add` commands per slot
5. The Wikidata + Wikipedia path (gated on three earned mentions)
6. The MEDIA_MENTIONS append recipe

---

## Brunson Hard-Rule constraint

Read once, never violate:

> Only set an env var once the linked profile actually exists, is public, and credibly identifies Maryan / Unlock SaaS. Bidirectional claim is the bar: this site claims the handle via `sameAs`; the handle's bio claims unlocksaas.com.

If the URL you would paste does not exist, do nothing. Empty is the honest signal.

---

## Why bidirectional

A `sameAs` URL pointing at, say, `https://x.com/unlocksaas` is a one-way claim: "This site claims that handle is us." Google's Knowledge Graph (and the AI Overview ingestion pipeline that builds on it) award a low confidence weight to a one-way claim because anyone can paste any URL into their own JSON-LD.

The round-trip is what matters. When the X bio also reads "Founder of Unlock SaaS – https://unlocksaas.com", both sides corroborate the same identity edge, and KG awards full confidence. Empirically, the lift from one bidirectional claim is roughly equivalent to three one-way claims.

The implementation consequence: **never paste a URL into an env var before the target profile's bio names unlocksaas.com.** Use the verified bio strings below.

---

## Tier 0 – Self-published canonical entity manifest (shipped)

**Status:** ✅ Live. No operator action required. Activated 2026-05-20.

The single Knowledge Graph signal the codebase can ship without operator authority on an external platform: a content-negotiated, dereferenceable JSON-LD entity description at the `.well-known` discovery path.

- **URL:** [`https://unlocksaas.com/.well-known/entity.jsonld`](https://unlocksaas.com/.well-known/entity.jsonld)
- **Route source:** [app/.well-known/entity.jsonld/route.ts](../app/src/app/.well-known/entity.jsonld/route.ts)
- **Content type:** `application/ld+json` (IANA-registered JSON-LD media type).
- **Body:** the full `Organization + Person + WebSite` `@graph`, cross-referenced via `@id`, sourced from [entity.ts](../app/src/lib/seo/entity.ts) (single source of truth, no drift).
- **Wired:** referenced from the homepage `Organization.subjectOf[]` as a Dataset entry, so KG / AIO / LLM-retrieval pipelines that walk subjectOf find it on first traversal.
- **Identifiers:** the Organization `identifier[]` array carries PropertyValue rows (`domain`, `foundingDate`, `canonical-manifest`) – stable machine IDs the KG card can be keyed to.

What this does:
- Acts as the closest self-published analogue to a Wikidata Q-URL: a stable URL whose sole purpose is to return the canonical machine-readable description of the entity.
- Corroborates the homepage Organization JSON-LD with a second, content-negotiated copy at a discovery-convention path.
- Pairs with the existing `/.well-known/llms.txt`, `/.well-known/mcp.json`, `/.well-known/security.txt` surfaces – every machine-readable signal lives under one canonical directory.

What this does NOT do:
- It is NOT a replacement for a real Wikidata Q-ID. Google's Knowledge Graph awards full confidence weight to off-platform, bidirectionally-claimed anchors. A self-published manifest is a corroborating signal, not the external anchor itself.
- It is NOT a `sameAs` row. `sameAs` requires off-platform URLs (Tier 1 / Tier 2 below). The manifest URL is declared as `subjectOf` Dataset + `identifier` PropertyValue instead, which are the schema.org-correct slots for a self-published canonical description.

The Tier 1 / Tier 2 anchors below remain the high-leverage moves once the operator can claim them. This manifest is the floor, not the ceiling.

---

## Tier 1 – Knowledge Graph anchors

These are the highest-leverage anchors in the entire schema graph. The first two (Wikidata, Wikipedia) are gated on prerequisites and require the earned-media bar to land first. The third (SameAs.org) is operator-actionable today.

### Wikidata <a id="wikidata"></a>

**Prerequisite:** at least one of:
- A live Wikipedia article about Unlock SaaS (preferred path)
- Three independent earned-media articles that name Unlock SaaS as the subject (not roundups)

**Action:**
1. Sign in at https://www.wikidata.org/.
2. Visit https://www.wikidata.org/wiki/Special:NewItem.
3. Label: `Unlock SaaS`. Description: `Playbook for post-launch pre-revenue SaaS founders`.
4. Add statements:
   - `instance of` (P31) → `business` (Q4830453) or `software product` (Q1395596)
   - `official website` (P856) → `https://unlocksaas.com`
   - `founded by` (P112) → Maryan's Q-ID (create that first if needed)
   - `inception` (P571) → `2026-05-17`
   - `country` (P17) → as applicable
5. Add references to each statement linking to the canonical source (unlocksaas.com pages, earned-media articles).
6. Wait 24 hours. If the entry survives Wikidata's auto-deletion check, copy the Q-URL (e.g. `https://www.wikidata.org/wiki/Q123456789`).
7. Push to Vercel:
   ```bash
   vercel env add NEXT_PUBLIC_UNLOCKSAAS_WIKIDATA_URL production preview
   # paste the Q-URL when prompted
   ```
8. Redeploy.

**Verification:** the Organization JSON-LD on `/` now lists the Q-URL in `sameAs`. Test at https://search.google.com/test/rich-results.

### SameAs.org <a id="sameas-org"></a>

Lower notability bar than Wikidata, higher than a single social. SameAs.org is a community-maintained entity registry that mirrors `sameAs` claims back into a public JSON-LD graph indexable by every major answer engine.

**Action:**
1. Visit https://sameas.org/ and create the entity.
2. List unlocksaas.com as the canonical URL.
3. List every other `sameAs` URL the operator has already populated (the SameAs.org entry becomes the meeting point for them).
4. Push:
   ```bash
   vercel env add NEXT_PUBLIC_UNLOCKSAAS_SAMEAS_ORG_URL production preview
   ```

**Why bidirectional matters here:** the round-trip is `unlocksaas.com → sameas.org entry → unlocksaas.com`, plus every other social anchor SameAs.org enumerates. Each enumerated profile becomes a corroborating edge in the entity graph.

### Wikipedia <a id="wikipedia"></a>

**Prerequisite:** three independent secondary sources naming Unlock SaaS (not press releases, not the founder's own writing).

**Action:**
1. Draft the article at https://en.wikipedia.org/wiki/Wikipedia:Articles_for_creation/preload.
2. Submit through AfC. Reviewer turnaround varies (days to months).
3. **Only paste the URL after the article is in mainspace, not while still in Draft: namespace.** A draft that gets declined or moved leaves a redirect that reads as a fabrication.
4. Push:
   ```bash
   vercel env add NEXT_PUBLIC_UNLOCKSAAS_WIKIPEDIA_URL production preview
   ```
5. Effect: this URL becomes the Organization's `mainEntityOfPage` – the schema.org one-to-one authoritative-description anchor. KG weights this more heavily than any number of `sameAs` rows.

---

## Tier 2 – Social `sameAs` slots

Ordered by leverage. Each action below ends with a single-line `vercel env add` command.

### X / Twitter <a id="x-twitter"></a>

**Bio copy (paste verbatim into x.com profile bio, 160 chars):**
```
Building Unlock SaaS – the playbook for post-launch pre-revenue founders. Your first paying customer in 60 days, or you don't pay. unlocksaas.com
```

**Confirm bidirectional:** the bio must contain `unlocksaas.com` as a literal string. X auto-linkifies it.

**Push:**
```bash
vercel env add NEXT_PUBLIC_UNLOCKSAAS_X_URL production preview
# paste: https://x.com/unlocksaas (or https://x.com/<handle>)
```

### Indie Hackers <a id="indie-hackers"></a>

**Bio copy** (IH allows longer bios):
```
Solo founder of Unlock SaaS. Marketer by trade, not engineer. Built the playbook he uses for his own launch — guaranteed first paying customer in 60 days or refund, verified in Stripe. https://unlocksaas.com
```

**Confirm bidirectional:** the IH profile "Bio" field contains `unlocksaas.com` as a hyperlink.

**Push:**
```bash
vercel env add NEXT_PUBLIC_UNLOCKSAAS_INDIE_HACKERS_URL production preview
# paste: https://www.indiehackers.com/<profile-slug>
```

### LinkedIn <a id="linkedin"></a>

LinkedIn requires three surfaces to be filled for the round-trip to register as bidirectional:

1. **Headline:** `Founder of Unlock SaaS – first paying customer in 60 days, or you don't pay`
2. **About section** (first sentence): `Solo founder of Unlock SaaS (https://unlocksaas.com). I build for non-engineer founders shipping SaaS with AI tools.`
3. **Experience block:** add `Founder, Unlock SaaS` with the company-page URL set to `https://unlocksaas.com`.

**Push:**
```bash
vercel env add NEXT_PUBLIC_UNLOCKSAAS_LINKEDIN_URL production preview
# paste: https://www.linkedin.com/in/<your-slug>
```

### GitHub <a id="github"></a>

GitHub uniquely has a structured `website` field on the profile, which crawlers prefer over bio prose. Use both:

1. **Profile → Edit profile → Website:** `https://unlocksaas.com`
2. **Bio (160 chars):** `Building Unlock SaaS – playbook for post-launch pre-revenue founders. unlocksaas.com`

**Push:**
```bash
vercel env add NEXT_PUBLIC_UNLOCKSAAS_GITHUB_URL production preview
# paste: https://github.com/<your-handle>
```

### YouTube <a id="youtube"></a>

YouTube channel descriptions are heavily weighted by Google for video Rich Results on AI Overviews. First line matters most because YouTube truncates the rest in many surfaces.

**Channel description (first line, exactly):**
```
Unlock SaaS — your first paying customer in 60 days. https://unlocksaas.com
```

**Confirm bidirectional:** the URL is on a line by itself or immediately after the entity name so YouTube auto-linkifies.

**Push:**
```bash
vercel env add NEXT_PUBLIC_UNLOCKSAAS_YOUTUBE_URL production preview
# paste: https://www.youtube.com/@<handle>
```

### Crunchbase <a id="crunchbase"></a>

Crunchbase is a primary Knowledge Graph feed – this anchor is closer to Tier 1 in actual weight than to other Tier 2 socials.

1. Visit https://www.crunchbase.com/add-new-organization.
2. Fields:
   - **Organization name:** Unlock SaaS
   - **Website:** `https://unlocksaas.com`
   - **Founded date:** 2026-05-17
   - **Headquarters:** (real, not faked)
   - **Description (250 chars):** `Unlock SaaS is a playbook that turns an already-shipped SaaS into a verified paying customer in 60 days, or the founder is refunded. Built for non-engineer founders shipping with AI tools (Lovable, Claude, Replit, v0, Cursor).`
3. Submit. Verification takes 1-7 days. Crunchbase emails the URL when live.

**Push:**
```bash
vercel env add NEXT_PUBLIC_UNLOCKSAAS_CRUNCHBASE_URL production preview
# paste: https://www.crunchbase.com/organization/unlock-saas
```

### Product Hunt <a id="product-hunt"></a>

Two URLs are possible (maker profile, product page). Pick the product page – it carries more semantic weight.

1. Create the maker profile at https://www.producthunt.com/signup.
2. Submit the product (post-launch, never the day-of without a queued launch plan).
3. Product page **About section:** `https://unlocksaas.com` on its own line.

**Push:**
```bash
vercel env add NEXT_PUBLIC_UNLOCKSAAS_PRODUCT_HUNT_URL production preview
# paste: https://www.producthunt.com/products/unlock-saas
```

### G2 <a id="g2"></a>

Software-directory anchor. Google's Knowledge Graph indexes G2 as an authoritative `SoftwareApplication` node. Even with no reviews yet, claiming the listing earns the entity-resolution lift, and the lift compounds as reviews land.

**Action:**
1. Submit at https://www.g2.com/products/new (vendor side) or claim an auto-created entry if one already exists.
2. Vendor profile fields:
   - **Product website:** `https://unlocksaas.com`
   - **Description:** `A playbook that turns an already-shipped SaaS into a verified paying customer in 60 days, or the founder is refunded. Built for non-engineer founders shipping with AI tools.`
3. Wait for verification (1-3 days).
4. Push:
   ```bash
   vercel env add NEXT_PUBLIC_UNLOCKSAAS_G2_URL production preview
   ```

### Capterra <a id="capterra"></a>

Same role as G2 – a review-platform `sameAs` anchor for `SoftwareApplication`. Capterra and G2 are both indexed as primary KG feeds for indie SaaS.

**Action:**
1. Submit at https://www.capterra.com/vendors/sign-up.
2. Vendor profile: link to `https://unlocksaas.com` in the company info section.
3. Push:
   ```bash
   vercel env add NEXT_PUBLIC_UNLOCKSAAS_CAPTERRA_URL production preview
   ```

### Ad-hoc slot <a id="other"></a>

One spare slot for a profile that does not have a dedicated env var. Same bidirectional rule.

```bash
vercel env add NEXT_PUBLIC_UNLOCKSAAS_OTHER_URL production preview
```

---

## Webmaster verification consoles

These do not feed `sameAs` directly, but they unlock the *measurement loop* for AI Overviews / Bing Copilot citation metrics. The activation script flags them in the same audit because they are operator-actionable env vars.

For each, the meta-tag method returns a single content string. After all in-scope consoles are claimed, submit `https://unlocksaas.com/sitemap.xml` in each.

### Google Search Console <a id="google-search-console"></a>

Mandatory. Unlocks AI Overviews eligibility metrics and the GSC API for the long-tail keyword loop documented in [google-strategy.md §A.6](./google-strategy.md).

1. Visit https://search.google.com/search-console/welcome.
2. Add property → choose `Domain` if DNS access available, otherwise `URL prefix` with `https://unlocksaas.com`.
3. URL-prefix method: copy the `content=` value from the meta-tag verification option.
4. Push:
   ```bash
   vercel env add GOOGLE_SITE_VERIFICATION production preview
   ```
5. Redeploy, then return to GSC and click `Verify`.
6. Submit `https://unlocksaas.com/sitemap.xml`.

### Bing Webmaster <a id="bing-webmaster"></a>

Mandatory if Bing Copilot citation tracking matters (it does – Copilot answers are powered by the Bing index, and so is DuckAssist).

1. Visit https://www.bing.com/webmasters.
2. Sign in, click `Add a site`, enter `https://unlocksaas.com`.
3. Choose `Meta tag` verification. Copy the `content=` value.
4. Push:
   ```bash
   vercel env add BING_WEBMASTER_VERIFICATION production preview
   ```
5. Redeploy, then `Verify`. Submit sitemap.

### Yandex Webmaster <a id="yandex-webmaster"></a>

Defer unless RU/CIS distribution is in scope. Powers Yandex.AI and is one of the four IndexNow endpoints.

```bash
vercel env add YANDEX_VERIFICATION production preview
```

### Pinterest <a id="pinterest"></a>

Defer unless Pinterest is part of the channel mix. Required only for Rich Pins.

```bash
vercel env add PINTEREST_DOMAIN_VERIFICATION production preview
```

### Facebook (Meta) <a id="facebook"></a>

Defer unless Meta ads launch. Required for Aggregated Event Measurement and Limited Data Use compliance.

```bash
vercel env add FACEBOOK_DOMAIN_VERIFICATION production preview
```

### Naver <a id="naver"></a>

Korean-market specific. Defer unless KR distribution is in scope.

```bash
vercel env add NAVER_SITE_VERIFICATION production preview
```

---

## IndexNow <a id="indexnow"></a>

IndexNow is the open protocol Bing, Yandex, Naver, and Seznam use to accept push notifications about URL changes. Submitting a URL via IndexNow typically results in crawl-within-minutes on Bing and crawl-within-an-hour on Yandex, versus crawl-on-discovery-cadence (days) without it.

Google does NOT support IndexNow. That is fine – Googlebot + sitemap cover us there.

**Action:** the setup is already automated.

```bash
python3 scripts/setup-indexnow-key.py
```

This generates a 32-char hex key, pushes it to Vercel (`INDEXNOW_KEY` production), and exits. After the next deploy:
- `/indexnow-key` serves the key publicly (protocol requires this).
- `/api/cron/indexnow` runs daily and POSTs every public marketing URL to `api.indexnow.org` with the key location attached.

Optional follow-up: wire a Vercel Deploy Hook that also POSTs to `/api/indexnow` on every production deploy for sub-minute re-indexing on URL changes.

---

## MEDIA_MENTIONS – earned media `subjectOf` anchors

When a real earned mention lands (a podcast episode, IH feature, X thread with significant reach, an article in a real publication), it gets logged in [app/src/lib/media-mentions.ts](../app/src/lib/media-mentions.ts). Each row simultaneously:

- Adds an `Article` entry to `Organization.subjectOf` (an AIO/LLMO citation signal)
- Contributes toward the 3-row minimum that unlocks the visible "As seen in" bar on the funnel hub

**The acceptance test (Brunson Hard-Rule):**
1. The artifact is a *public* URL anyone can open (article, episode page, X permalink).
2. The artifact *explicitly names* Unlock SaaS. A roundup that includes the URL among 50 others does not pass. A podcast that mentions us in 3 sentences does pass.
3. It is *earned*. Paid placements use `type: "paid"` and are filtered out of the bar.
4. The `publishedAt` is the real publication date.

**The append recipe:**

```ts
// In app/src/lib/media-mentions.ts, replace the empty array:
export const MEDIA_MENTIONS: MediaMention[] = [
  {
    publication: "Indie Hackers",
    url: "https://www.indiehackers.com/post/<real-slug>",
    publishedAt: "2026-06-15",
    context: "Maryan featured in IH 'First Paying Customer Stories' Q&A.",
  },
];
```

Commit message: `media: log <publication> mention (<date>)`. The next deploy auto-renders. After three earned rows, the public media bar lights up on `/`.

---

## Activation order summary

The script `python3 scripts/seo-activation-check.py` will print this as a numbered list. The cheat-sheet order:

0. **Self-published canonical entity manifest** – ✅ shipped 2026-05-20, no operator action.
1. **Google Search Console** – mandatory. 10 min.
2. **Bing Webmaster** – mandatory if you want Bing Copilot citation tracking. 10 min.
3. **IndexNow key** – run `python3 scripts/setup-indexnow-key.py`. 2 min.
4. **SameAs.org registry** – 10 min. Lights up the entity graph independently of any social profile.
5. **X profile** – 10 min, pre-written bio above.
6. **Indie Hackers** – 5 min, pre-written bio above.
7. **GitHub** – 2 min (just edit existing profile).
8. **LinkedIn** – 15 min (three-field round-trip).
9. **Crunchbase** – 20 min + 1-7 day wait for review.
10. **G2** + **Capterra** – 20 min each + 1-3 day vendor verification.
11. **YouTube** – only when first video ships.
12. **Product Hunt** – only when ready to launch.
13. **(gated)** Three real earned mentions logged in `MEDIA_MENTIONS`.
14. **(gated, post-step-13)** Wikidata Q-ID.
15. **(gated, post-step-13)** Wikipedia article submission.

Re-run the audit script after each step to see the cumulative effect.

---

## Status footer

- **Document version:** 1.0
- **Created:** 2026-05-18
- **Owner:** Maryan (founder, operator)
- **Tool:** `python3 scripts/seo-activation-check.py`
- **Re-audit cadence:** after every redeploy that adds or removes an env slot
