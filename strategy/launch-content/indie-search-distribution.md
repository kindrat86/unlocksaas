# Indie-Search Companion-Essay Distribution Pack

**Project:** UnlockSaaS
**Artifact:** [`/four-indie-search-engines`](https://unlocksaas.com/four-indie-search-engines) (shipped 21-05-2026 as PR #67, merge commit `03217981`)
**Status:** READY TO POST. Three drafts, three channels, posting order matters.
**Sender identity:** `maryan@unlocksaas.com`, friendly From "Maryan from UnlockSaaS," signed "– Maryan"
**Companion docs:**
- [off-page-launch-pack.md](./off-page-launch-pack.md) – the precedent shape for one-shot announcements
- [../indie-search-submission-playbook.md](../indie-search-submission-playbook.md) – the operational landscape this essay frames

---

## Why this pack exists

The companion essay ships the technical artifact (robots.txt allow-list for Brave + Mojeek + Marginalia + Kagi). The artifact alone is dead content – Brunson Hard-Rule: a built funnel without traffic is a museum piece. This pack is the three-channel one-shot to send the essay to the demographic it was written for, in the 48-hour window where "I just shipped" is still credible.

Three channels, posting order matters:

| # | Channel | Why | When |
|---|---|---|---|
| 1 | X / Bluesky thread | Highest scroll-stop probability; founder-density on both | Post first, T+0 |
| 2 | Indie Hackers long-form | Story-first audience; anti-self-promo rules apply (offer in bio only) | T+18h (lets X thread bake) |
| 3 | Show HN | Hardest audience, harshest crowd, biggest payoff if it lands | T+42h (HN punishes same-day self-promo of own commits; let the merge breathe) |

Do not post all three same-day. HN especially can read it as commercial spamming if the X thread is fresh.

---

## §0 Hard rules

Carried over from `launch-kit.md`:

- **Story first. Offer at bottom.** Every post.
- **Reluctant Hero voice.** No guru energy. No swagger.
- **Single link per post.** Always to `/four-indie-search-engines` (the essay), not `/diagnostic`. The essay's own CTA carries the funnel.
- **No fake scarcity.** The only urgency is the freshness of the merge.
- **Anti-self-promo on Indie Hackers** per workbook 09 §1 – story-first, ZERO offer in the body, the diagnostic offer lives in your IH profile bio.
- **HN: title + URL only.** No comment from you in the same minute as the submission – wait an hour, then comment if asked.

---

## §1 X / Bluesky thread

Same copy for both. Bluesky has a 300-char limit per post; trim any tweet that runs long when porting.

### Tweet 1 (hook)
> Yesterday I shipped UnlockSaaS to four search engines with under 1% market share each.
>
> Brave. Mojeek. Marginalia. Kagi.
>
> By any sales-letter math, this was a waste of an afternoon.
>
> Here is why I did it anyway. 🧵

### Tweet 2 (the math you would do)
> Google sits north of 90% share. The four engines combined are maybe 3% on a generous day.
>
> Even if I ranked first on every one of them for every relevant query, the marginal traffic would not change my chart.
>
> If you ran the ROI sheet, the row reads: skip it.

### Tweet 3 (the pivot)
> But share is the wrong axis.
>
> Share measures what % of the general population uses an engine. The general population is not my market.
>
> The right axis is buyer density. Who deliberately uses an engine?

### Tweet 4 (the demographic argument)
> Who chooses Brave, Mojeek, Marginalia, or Kagi over Google?
>
> – self-hosters
> – people who pay for search (Kagi)
> – anti-tracking extension users
> – people who deploy on Hetzner before AWS
> – indie hackers and solo founders
>
> That is my buyer profile.

### Tweet 5 (the Brunson read)
> So this is a Dream 100 move pretending to be an SEO move.
>
> Not optimizing for ranking. Planting flags at the watering holes of a tight demographic.
>
> The technical move is the artifact. The actual play is positioning.

### Tweet 6 (the artifact, exactly)
> What I shipped:
>
> – robots.txt allow-list for Bravebot, MojeekBot, search.marginalia.nu, Kagibot
> – GitHub PR to add unlocksaas.com to Marginalia's sites.txt
> – verification script that audits all four monthly
>
> All in the public repo.

### Tweet 7 (the honest gaps)
> What I did NOT do:
>
> – Mojeek has no submission API. They auto-discover. Nothing to do.
> – Kagi Small Web requires a personal blog. UnlockSaaS is a commercial SaaS. I do not qualify. Not submitting.
> – Brave wants a CAPTCHA form. I will do that manually.

### Tweet 8 (the bigger arc)
> This is one episode in a longer arc.
>
> 5 weeks ago: shipped a Hugging Face dataset
> 3 weeks ago: activated entity.jsonld
> Last week: markdown twin for every page + ai-policy.json
> Today: indie engines
>
> Each piece compounds.

### Tweet 9 (the canonical URL + CTA)
> If you are a non-engineer founder shipping a SaaS and the chart is flat, the free Launch Diagnostic takes 90 seconds. No email required.
>
> Full essay with the merge SHA, the Marginalia PR, and the verification script:
>
> https://unlocksaas.com/four-indie-search-engines
>
> – Maryan

### Tweet variants (if the hook needs A/B testing)

**Variant B (specifics-first):**
> Four search engines. Combined market share: maybe 3%. Three hours of work to ship to all of them.
>
> I did it on purpose. Thread on why share is the wrong axis for indie SaaS distribution. 🧵

**Variant C (controversy-first):**
> The smartest distribution move I will make this quarter went to engines with under 1% market share each.
>
> If that sounds dumb, you are measuring the wrong axis. 🧵

---

## §2 Indie Hackers post

Post category: **Indie Hackers › Marketing**

Apply the anti-self-promo rule. No `/diagnostic` link in the body. The link is in your IH profile bio, and the canonical essay URL appears once at the end as the source. The CTA "Take the diagnostic" lives on the essay page itself.

### Title
> Why I shipped my SaaS to four search engines with under 1% market share each

### Body

> Yesterday I added four lines to a robots.txt file and opened a pull request on a GitHub repo most founders have never heard of. By any sales-letter math, the math was brutal: the four engines (Brave, Mojeek, Marginalia, Kagi) combined have maybe 3% market share on a generous day. Even if I ranked first on every one of them for every relevant query, the marginal traffic would not change my chart.
>
> If you ran a per-channel ROI sheet, the row would read: expected lift below half a percent. Strike it through. Go optimize Google.
>
> I am not running that sheet.
>
> **Share is the wrong axis for indie SaaS.**
>
> Share measures what percentage of the general population uses an engine. The general population is not my market. I sell tooling to post-launch pre-revenue founders – a tightly defined slice of operators most marketers cannot identify cleanly. The right axis is not share. It is buyer density.
>
> Who deliberately chooses Mojeek, Brave, Marginalia, or Kagi over Google?
>
> – People who self-host
> – People who pay ten dollars a month for ad-free search results
> – People who run anti-tracking browser extensions
> – People who deploy on Hetzner before they deploy on AWS
> – People who hand-roll their own tooling before they install someone else's SaaS
>
> Indie hackers. Founders. Solo operators. The exact audience reading this post.
>
> A page-1 result on Mojeek puts me in front of fewer people than Google, yes – but a meaningfully higher percentage of those fewer people are actually my buyer. That is the math that flips.
>
> **What I actually shipped:**
>
> – `robots.txt` allow-list for the four crawlers (`Bravebot`, `MojeekBot`, `search.marginalia.nu`, `Kagibot`). Each token traced to the engine's own crawler help page on the day of the commit.
> – A GitHub PR to add `unlocksaas.com` to Marginalia's `sites.txt` registry (single-line addition, on a deterministically-random middle line per their README's merge-conflict-avoidance guidance).
> – A Python verification script that regression-gates the four UA tokens in robots.txt and probes the public SERPs monthly.
>
> Total time: about three hours including the companion essay.
>
> **What I did NOT do, in the same spirit:**
>
> – Mojeek has no submission API. They auto-discover. Nothing else honest to do.
> – Kagi Small Web criteria require a personal single-author blog with an RSS feed. UnlockSaaS is a commercial SaaS. I do not qualify. Empty is the honest signal.
> – Brave Search uses a CAPTCHA-gated browser form. Sixty seconds of manual work next time I open Chrome.
> – None of the four participate in IndexNow as of today.
>
> The technical artifact is the proof. The actual play is positioning. I get to tell anyone who asks: I shipped to engines that respect privacy and the small web because that is the kind of SaaS I am building. The story is the conversion event. The submission is the proof.
>
> Full essay with the merge SHA, the Marginalia PR number, and the verification script source:
>
> https://unlocksaas.com/four-indie-search-engines
>
> – Maryan

### IH tags
`marketing`, `seo`, `founders`, `indie-hackers`

---

## §3 Show HN

**Wait T+42h after the X thread.** HN punishes self-promo of your own commits when it is the same hour as the merge.

### Title (HN format: short, factual, no marketing language)
> Show HN: I shipped to four search engines with under 1% market share each

### URL
> https://unlocksaas.com/four-indie-search-engines

### First comment (post yourself, ~30 minutes after the submission lands on /newest)

> Author here. The essay frames a distribution argument: share is the wrong axis for indie SaaS, buyer density beats share when the engine's audience is concentrated in your ICP. The technical artifact is a robots.txt allow-list for `Bravebot`, `MojeekBot`, `search.marginalia.nu`, `Kagibot` plus a GitHub PR to add my domain to Marginalia's `sites.txt`. Nothing fancy.
>
> The honest gaps are named verbatim in the essay – Mojeek has no submission API (passive only), Kagi Small Web is for personal blogs and I do not qualify, Brave uses a CAPTCHA-gated form. The intent of posting here is not "look how clever I am" – it is "let me make the buyer-density argument out loud, in front of an audience that is itself a proof point for the argument."
>
> Happy to take questions about the verification script, the JSON-LD wiring, or the deploy flow.

### HN-specific guidance

- **Do not vote your own submission up.** HN flags voting rings instantly.
- **Do not crosspost the same URL** to multiple HN threads. One submission, one comment, one answer per reply.
- **If it gets flagged** (Show HN sometimes gets flagged when the OG of the URL is a marketing page), email hn@ycombinator.com with a polite "I'm the author, the page is editorial / first-person / non-commercial framing, is there a fix I should make?" – no demands, no anger.
- **If it dies on /newest** (no upvotes in 30 minutes), it will not recover. Do not re-submit the same URL. Move on. Try a different angle in 60 days.

---

## §4 Posting cadence calendar

| T+ | Channel | Action | Owner | Time block |
|---|---|---|---|---|
| 0h | X | Post thread (9 tweets) | Maryan | 09:00 Athens |
| 0h+5m | Bluesky | Cross-post same thread | Maryan | 09:05 Athens |
| 0h+20m | X | Reply to your own first tweet pinning the canonical URL | Maryan | 09:20 Athens |
| +18h | Indie Hackers | Long-form post | Maryan | 03:00 Athens (= 8pm Eastern, peak IH traffic) |
| +42h | Show HN | Submission + first comment | Maryan | 03:00 Athens day +2 (= 8pm Eastern peak) |

Time-zone choice: Indie Hackers and HN are US-skewed; posting in US prime time (8pm Eastern = 03:00 Athens) puts the submission on the front-page hour at the right cadence. The X thread can go earlier because Twitter is more globally-distributed.

---

## §5 Did-it-land tracking

For each channel, T+24h after the post:

1. PostHog → Web Analytics → Sources → filter by `unlocksaas.com/four-indie-search-engines`: confirm the channel shows up.
2. Vercel → Logs → check no 500s on the essay URL during the post's traffic burst.
3. GSC → Performance → URL filter on the essay URL: confirm impressions start within 48h.
4. `python3 scripts/verify-indie-search-presence.py`: confirm robots.txt + UA tokens still present, no regression.

If any of the three posts hits >100 PostHog visitors in 24h without any traffic landing on `/diagnostic`, the essay's CTA is too soft – note in the launch journal and revisit the CTA placement in a follow-up commit.

## §6 Launch journal

Append a row to `strategy/state.json → off_page_launches[]` per post, same shape as the precedent pack:

```json
{
  "date_utc": "2026-MM-DDTHH:MMZ",
  "artifact": "/four-indie-search-engines",
  "channel": "x | bluesky | indie-hackers | show-hn",
  "url_posted": "https://...",
  "outcome": {
    "first_24h_visitors": 0,
    "diagnostic_starts": 0,
    "backlinks_observed": [],
    "notes": ""
  }
}
```

---

# Status

| Section | State |
|---|---|
| §0 hard rules | LOCKED (carried over from launch-kit.md) |
| §1 X / Bluesky thread | READY TO POST |
| §2 Indie Hackers post | READY TO POST |
| §3 Show HN | READY TO POST after T+42h |
| §4 posting cadence | READY |
| §5 tracking | READY – wire UTMs at post time if desired |

Signed: – Maryan, founder, Unlock SaaS.

Document published: 21-05-2026. Last reviewed: 21-05-2026.
