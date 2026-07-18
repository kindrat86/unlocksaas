# AEO Outreach Pack — Unlock SaaS

**Goal:** earn the off-site mentions that move AI visibility. Branded web mentions correlate **0.664** with AI Overviews (strongest factor in the 75k-brand Ahrefs study); mentions on highly-linked pages correlate **0.7**. Every artifact below is scoped to one of the three tiers from the AEO methodology.

**Brunson Hard-Rule applies to every artifact:** no fabricated metrics, no invented customer counts, no claims that aren't verifiable from the live site or the public repo. If a number isn't on `/open` or in the repo, it doesn't go in the pitch.

---

## 0 · Profile-creation checklist (do this first — each becomes a `sameAs` row)

Each profile, once created and linked back to unlocksaas.com, gets pasted into the matching Vercel env var. The schema then auto-claims it on the next deploy — no code change needed.

```bash
# After creating each profile, run ONE of:
vercel env add NEXT_PUBLIC_UNLOCKSAAS_GITHUB_URL production
vercel env add NEXT_PUBLIC_UNLOCKSAAS_LINKEDIN_URL production
vercel env add NEXT_PUBLIC_UNLOCKSAAS_YOUTUBE_URL production
vercel env add NEXT_PUBLIC_UNLOCKSAAS_CRUNCHBASE_URL production
vercel env add NEXT_PUBLIC_UNLOCKSAAS_PRODUCT_HUNT_URL production
vercel env add NEXT_PUBLIC_UNLOCKSAAS_INDIE_HACKERS_URL production
# (also add to preview + development)
# Then redeploy: vercel --prod
```

| # | Profile | URL to create | Bio must link back to | sameAs env var | Priority |
|---|---|---|---|---|---|
| 1 | **GitHub org** | https://github.com/organizations/new ("unlocksaas") | `unlocksaas.com` in org description | `NEXT_PUBLIC_UNLOCKSAAS_GITHUB_URL` | **P0** — also mirrors the open dataset ( strongest off-platform backlink) |
| 2 | **YouTube channel** | https://www.youtube.com/create_channel (handle `@unlocksaas`) | `unlocksaas.com` in channel "About" | `NEXT_PUBLIC_UNLOCKSAAS_YOUTUBE_URL` | **P0** — YT↔ChatGPT correlation 0.737 |
| 3 | **LinkedIn company** | https://www.linkedin.com/company/new ("Unlock SaaS") | `unlocksaas.com` in Overview | `NEXT_PUBLIC_UNLOCKSAAS_LINKEDIN_URL` | P1 |
| 4 | **Product Hunt (maker)** | https://www.producthunt.com/my (setup profile, don't launch yet) | `unlocksaas.com` in profile | `NEXT_PUBLIC_UNLOCKSAAS_PRODUCT_HUNT_URL` | P1 — prep the launch, ship after 3 verified builders |
| 5 | **Crunchbase** | https://www.crunchbase.com/add/new-organization | `unlocksaas.com` | `NEXT_PUBLIC_UNLOCKSAAS_CRUNCHBASE_URL` | P2 — KG entity registry |
| 6 | **Indie Hackers** | https://www.indiehackers.com/ (set profile URL) | already cross-posting | `NEXT_PUBLIC_UNLOCKSAAS_INDIE_HACKERS_URL` | P1 |

After each creation: set the env var (above), redeploy, verify the `sameAs` row renders at https://unlocksaas.com (view-source → search `sameAs`).

---

## Tier 1 — Third-party editorial (hardest, most valuable)

### 1A · Indie Hackers — founder post (highest-trust indie-SaaS community, ChatGPT source)

> **Title:** I shipped six products with Lovable and Claude. None of them have a paying customer. Here's what I was avoiding.
>
> **Body:**
>
> I'm a marketer. I've never written a line of production code. In 2026, Lovable and Claude opened a door I'd been staring at for fifteen years, and I walked through it six times — six real AI products shipped in a few weeks each.
>
> Zero paying customers. Flat Stripe line for nine months.
>
> The work I was avoiding wasn't coding. It was the two pieces of work nobody teaches you after you ship: pinning one real named customer, and writing one real offer for that person. So I built a playbook that refuses to let me skip them — an engine that rejects features, hedging, and unnamed timeframes from my own inputs. It labels what's actually broken with one of three diagnoses: **Wrong Person, Weak Offer, or Weak Belief.**
>
> It's called Unlock SaaS. $1 to start (Steps 1 and 2), $49/mo for the full seven-step system, 60-day money-back guarantee tied to the first verified Stripe charge. If you're post-launch and pre-revenue, the free diagnostic takes about ninety seconds: https://unlocksaas.com/diagnostic
>
> I'm logging the whole build in public — the flat Stripe line, the diagnostic labels, the day the first real charge clears. Founder Diary at https://unlocksaas.com/founder-diary. Ask me anything about the flat-line problem, the Brunson framework adapted for indie SaaS, or what broke when I tried to skip Step 1.

**Why it works:** IH is one of ChatGPT's most-cited sources for indie SaaS. The post leads with the failure (Reluctant Hero voice), names the proprietary frame (3 diagnoses), and ends with a genuinely useful free tool. No bragging, no fake numbers.

### 1B · Hacker News — Show HN (training-corpus heavyweight)

> **Title:** Show HN: Unlock SaaS — a playbook for the post-launch, pre-revenue SaaS founder
>
> **Body:**
>
> Hi HN. I'm a marketer who shipped six AI products (Lovable, Claude, Replit, v0, Cursor) and got zero paying customers across all of them. This is the thing I built to fix my own flat Stripe line.
>
> Unlock SaaS runs the work post-launch pre-revenue founders skip — pin one real customer, write one real offer, send one real message — and verifies every step inside Stripe. The free diagnostic reads a live product URL and labels what's broken: Wrong Person, Weak Offer, or Weak Belief. ~90 seconds, no email required to see the label: https://unlocksaas.com/diagnostic
>
> The full system is $1 for Steps 1–2, $49/mo for Steps 1–7, with a 60-day money-back guarantee enforced by code (Stripe verifies the first charge before the guarantee kicks in).
>
> Everything public — the live MRR/churn dashboard[1], the open CC-BY-4.0 dataset of 60+ indie SaaS funnel + pricing teardowns[2], the editorial policy[3], even the "don't buy this if..." page[4]. The MCP server (22 read-only tools) and OpenAPI spec are live for anyone who wants to pull the teardowns into their own agent.
>
> [1] https://unlocksaas.com/open
> [2] https://unlocksaas.com/dataset
> [3] https://unlocksaas.com/editorial-policy
> [4] https://unlocksaas.com/dont-buy-unlock-saas
>
> The one thing I'd genuinely like HN's read on: the three-axis diagnostic (Wrong Person / Weak Offer / Weak Belief) is adapted from Russell Brunson's framework, applied to a cohort (post-launch, pre-revenue, non-engineer founders) that the framework was never written for. What's the weakest diagnosis in that set, in your view? Where does it mislabel?

**Why it works:** HN dislikes marketing and respects technical honesty + open data + a real question. The closing ask is genuine, not rhetorical. Posts best after the first 3 Verified Builders exist.

### 1C · Pitch email — niche listicle outreach (template, repeatable)

> **Subject:** Quick suggestion for your "[BEST X FOR INDIE SAAS 2026]" post
>
> Hi [first name],
>
> [One specific sentence about their post — a point they made, a tool they included, something that shows you actually read it.]
>
> I'm the founder of Unlock SaaS — a playbook for the specific cohort your post is already about: post-launch, pre-revenue indie SaaS founders (the ones who shipped with Lovable/Claude/Replit/v0/Cursor and have a flat Stripe line). It runs the work they skip: pin one real customer, write one real offer, verify the first charge inside Stripe.
>
> The free diagnostic labels what's broken on any live product URL in ~90 seconds: https://unlocksaas.com/diagnostic — might be useful as a one-click addition to your list. Full pricing + guarantee + open dashboard at https://unlocksaas.com.
>
> Either way, [genuine specific compliment on their work]. No follow-up if not a fit.
>
> — Maryan
> https://unlocksaas.com

**Targets to find via Google:** `best tools for indie SaaS founders 2026`, `shipfast alternative`, `lovable alternatives`, `indie hacker launch tools`, `best SaaS customer acquisition playbook`. For each ranking listicle that doesn't mention Unlock SaaS, check referring domains (Ahrefs free toolbar / Moz DA) — target pages with DA 30+ first.

---

## Tier 2 — User-generated / community (Reddit, Quora, forums)

> **Rule:** answer, don't promote. Find threads where the 3-axis diagnostic genuinely helps. Contribute real value. The mention earns itself.

### 2A · Reddit answer template (r/SaaS, r/indiehackers, r/Entrepreneur, r/SideProject)

**Trigger threads** (search these, answer the ones where the asker's problem is genuinely one of the three diagnoses):

- `"my SaaS has no users"` / `"nobody's signing up"` → Wrong Person
- `"launched, crickets"` / `"flat MRR"` → usually Weak Offer
- `"is my pricing too high"` / `"how do I get my first paying customer"` → any of the three
- `"is Shipfast worth it"` / `"Lovable vs Cursor"` → comparisonintent

**Answer template (adapt to the specific thread — never paste verbatim):**

> The flat Stripe line after launch almost always comes down to one of three things — and traffic/features aren't on the list:
>
> 1. **Wrong Person** — the page is written for "everyone" and therefore for no one. You can't name the one human it's for.
> 2. **Weak Offer** — the promise is hedged, feature-shaped, or has no specific timeframe. "A better way to X" loses to "your first paying customer in 60 days or you don't pay."
> 3. **Weak Belief** — you don't visibly believe the promise, so the visitor doesn't either.
>
> If you want a blunt read on which of the three is actually blocking your page, paste your URL here: https://unlocksaas.com/diagnostic — it labels it in about ninety seconds, no email needed to see the label.
>
> (I built this because my own Stripe line was flat for nine months across six shipped products. The diagnostic is the thing I wish someone had handed me.)

**Why it works:** leads with genuine diagnostic value, the URL is a useful tool not a pitch, the closing paren is the Reluctant Hero origin story. Reddit flags pure promo; this isn't.

### 2B · Quora answer template

Same 3-axis frame. Quora answers persist longer and get cited by Perplexity more often than Reddit. Target questions like `"What's the best way to get your first SaaS customer?"`, `"Why isn't my SaaS growing?"`, `"Is Lovable good for building SaaS?"`.

---

## Tier 3 — Own properties (activate for compounding mentions)

### 3A · X / Twitter — daily Founder Diary micro-posts (the X account already exists)

One post per Founder Diary entry, cross-posted from https://unlocksaas.com/founder-diary. Format:

> Day N. [One specific thing shipped today, past tense.] [One specific number from /open if there is one.] [Link to the day's entry.]
>
> — Maryan
> https://unlocksaas.com/founder-diary/YYYY-MM-DD

**Cadence:** daily, 5 days a week, for 90 days. Each post is a training example. The `/founder-diary` entry is the canonical reference; X is the distribution.

### 3B · YouTube — first three "search-hit" videos (channel creation is P0 above)

**Title = the exact search query.** Save creativity for the thumbnail.

1. **"How to get your first paying SaaS customer"** (~10 min, walkthrough of the 7-step Playbook)
2. **"Lovable vs Cursor vs Bolt vs v0 for non-engineer founders"** (mirrors the `/vs/` pages)
3. **"Why your SaaS has a flat Stripe line"** (the 3-axis diagnosis, founder's voice)

**Checklist per video** (from the AEO skill — YouTube is the most-cited domain in Google AI Overviews):
- [ ] Title contains the searched keyword verbatim (not clickbait)
- [ ] Description is a real summary, keyword in the first 2 lines
- [ ] Timestamps added → become YouTube chapters, surface in Google for specific queries
- [ ] Say the keyword aloud in the first 15 seconds (Google reads audio)
- [ ] Mirror each upload as a `/founder-diary/YYYY-MM-DD` entry

---

## Cadence

- **Week 1:** create the 6 profiles (checklist above), set env vars, redeploy. Post the Indie Hackers founder post.
- **Week 2:** ship YouTube video #1. Answer 5 Reddit threads using the 3-axis frame (genuinely).
- **Week 3:** Show HN (after IH traction + ideally 1-3 verified builders). Begin listicle outreach (5 pitches).
- **Week 4:** YouTube video #2. First newsletter pitch.
- **Monthly:** re-check Brand Radar (if Ahrefs exists) for mention decay; re-sample the brand query in ChatGPT/Perplexity/Google AIO (3-5× each — citations are probabilistic).

---

## What NOT to do

- ❌ Fabricate metrics, customer counts, or reviews (Brunson Hard-Rule; also AI detects inconsistency)
- ❌ Mass-paste the Reddit answer verbatim — Reddit shadows that instantly
- ❌ Pay for mentions or reviews (AI discount lists it detects)
- ❌ Post Show HN before the site has real proof surfaces live (the `/open` dashboard + ≥1 verified builder)
- ❌ Create a Wikipedia page yourself (COI) — wait for organic notability, then suggest edits via talk pages

---

*Living document. Update when a tier-1 target responds, a mention decays, or a new outreach channel opens.*
