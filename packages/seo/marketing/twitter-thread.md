# Twitter / X thread draft

> Submit at: https://x.com/compose/post
>
> Optimal window: same day as Show HN, ~30 minutes BEFORE the HN submission.
> Twitter early-engagement compounds the HN front-page push and seeds the
> referral graph the Vercel preview-deployment / npmjs.com analytics will see.
>
> Hard rule: stay under 280 chars per tweet. Each tweet below is pre-counted.
> Sanity-check with https://twittercounter.com/character-counter if you edit.

---

## ⚡ PASTE-READY (paste tweet by tweet, hitting "Add" between each)

**Tweet 1/7 (the hook)**

```
For 3 weeks I've audited how indie SaaS sites get demoted from Google AI Overviews and Perplexity.

The #1 cause isn't bad content. It's JSON-LD that lies.

3 mistakes every "easy schema generator" lets you ship.

A thread, ending in a tool that catches them ↓
```

**Tweet 2/7 (the first mistake)**

```
1/ aggregateRating with reviewCount: 0

Your page says "5 stars!" but you have zero verified reviews.

Schema validators accept it. Google's ranking pipeline silently downgrades
your entire structured-data block.

Honest fix: omit aggregateRating until verified reviews exist.
```

**Tweet 3/7 (the second mistake)**

```
2/ sameAs entries without https://

You write `sameAs: ["twitter.com/yourhandle"]` because it looks fine.

Google's Knowledge Graph deduplication heuristic drops the entire
sameAs array if ANY entry fails the absolute-URL check.

Honest fix: filter to https-only at build time.
```

**Tweet 4/7 (the third mistake)**

```
3/ datePublished that isn't ISO 8601

"May 2026", "soon", or just "" — every major validator silently drops it.

Without datePublished, Article schema cannot earn the freshness boost
that AI Overviews uses for ranking.

Honest fix: refuse to build if the date isn't ISO.
```

**Tweet 5/7 (the tool)**

```
So I extracted my own primitives + a CLI that catches all three:

  npx @unlocksaas/seo validate-claims https://yoursite.com

Fetches the page, parses every JSON-LD block, diffs the schema against
visible HTML. Exits non-zero on violations. Wire it into CI.

MIT.
```

**Tweet 6/7 (the why)**

```
Why open-source?

unlocksaas.com is pre-revenue: new domain, no backlinks.

Standard SEO outreach is slow. Open-sourcing the library I built for my own site is faster — every npm install is a DR-100 backlink.

My product eats this dogfood in CI.
```

**Tweet 7/7 (the CTA, ends thread)**

```
The three failure modes my library refuses to ship:

✗ fabricated aggregateRating
✗ non-https sameAs
✗ malformed ISO dates

Repo + CLI demo:
https://github.com/kindrat86/unlocksaas/tree/main/packages/seo

npm:
https://www.npmjs.com/package/@unlocksaas/seo
```

---

## Engagement plan

1. **Pin tweet 1 to your profile** for 48h. Pinned-tweet impressions compound.
2. **Reply to every reply** within 15 minutes for the first 2 hours. Twitter's algorithm rewards thread-author engagement heavily.
3. **Quote-RT yourself with the HN link** once the HN post is up. "Just shipped this on Hacker News too: ..."
4. **Do NOT use 'we'** — you're a solo founder, the voice has to match `marketing/show-hn.md`.
5. **Do NOT add hashtags** in the main thread. They flag the algorithm as low-effort marketing. Hashtags are fine in replies if context demands.

---

## What NOT to claim (Brunson Hard-Rule for Twitter)

- No "1000+ developers are using this" — it just launched.
- No screenshots of a SERP showing "before/after" — that's fabricated until measured.
- No "Google said..." — Google didn't say. The behavior is documented in their structured-data guidelines.
- No threading in a customer testimonial — there isn't one yet.

Honest framings that work:

- "What I learned auditing my own site"
- "The validators accept what the ranker rejects"
- "Built because I needed it for unlocksaas.com"

---

## Character counts (audited 2026-05-18, programmatically verified)

| Tweet | Twitter chars | Limit | Margin |
|---|---|---|---|
| 1/7 (hook) | 260 | 280 | 20 |
| 2/7 (mistake 1) | 276 | 280 | 4 |
| 3/7 (mistake 2) | 277 | 280 | 3 |
| 4/7 (mistake 3) | 270 | 280 | 10 |
| 5/7 (tool) | 266 | 280 | 14 |
| 6/7 (why) | 245 | 280 | 35 |
| 7/7 (CTA) | 194 | 280 | 86 |

URLs count as 23 chars under Twitter's t.co wrapping. The script that
produced this table substitutes every URL with a 23-char placeholder
before measuring, so the counts reflect what Twitter will actually see,
not the markdown source length.

Tweets 2/7 and 3/7 have thin margins — if you edit them, recount before
posting. Run the verification script in `packages/seo/scripts/`
(not yet checked in; the inline Python in the launch-helper script works
the same way).
