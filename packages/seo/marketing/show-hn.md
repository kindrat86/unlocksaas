# Show HN draft

> Submit at: https://news.ycombinator.com/submit
>
> Optimal window: Tuesday or Wednesday, 08:00 to 10:00 PT (18:00 to 20:00 Athens).
>
> Do not post in two places at once. The HN moderators check.

---

## Title (80 char limit, HN strips marketing fluff)

```
Show HN: An SEO library that refuses to ship fabricated aggregateRating
```

Backup titles if the first feels too on-the-nose:

```
Show HN: validate-claims CLI – catches JSON-LD that lies about your site
```

```
Show HN: Honesty-first JSON-LD, llms.txt, and verification toolkit for AI search
```

---

## URL

```
https://github.com/kindrat86/unlocksaas-seo
```

(Or the monorepo path if the standalone mirror isn't up yet: `https://github.com/kindrat86/unlocksaas/tree/main/packages/seo`)

---

## Body (HN allows up to ~1500 chars in the "text" field for a Show HN, but pasting code blocks works only via URL or a top comment)

**Use the URL field only.** Don't paste the README. Add the body as a top comment immediately after submitting — that's the standard Show HN pattern.

### Top comment (post within 60 seconds of submission)

```
Hi HN, Maryan here.

I shipped a SaaS for non-engineer founders a few weeks ago and built every
schema.org / JSON-LD / llms.txt / verification block by hand because every
existing library was happy to emit fabricated aggregateRating, malformed
ISO dates, and sameAs entries pointing at "twitter.com/..." with no scheme.
All three of those are silent Google AI Overviews demotion triggers.

So I extracted my own primitives into @unlocksaas/seo.

The opinionated bit is a CLI: `validate-claims <url>`. It fetches a deployed
page, parses every JSON-LD block, and diffs the schema against the rendered
HTML. Examples of what it catches:

- aggregateRating with reviewCount: 0   (most common AI-Overview demotion)
- Article.headline that doesn't appear in the <title>
- Offer.price that doesn't appear in visible text
- FAQ questions present in schema but not on the page
- "twitter.com/handle" in sameAs (no https scheme = Knowledge Graph dedupes you)
- datePublished: "soon"                 (silently dropped by every validator)

Exit code is non-zero on any violation, so it goes straight into CI.

It also ships an /llms.txt + /llms-feed.json generator that reads a typed
SiteDescriptor so the markdown surface and the JSON sibling cannot drift
on freshness.

Next.js is an optional peer dep. The core is framework-free.

I built this because Brunson's "no fabricated claims" rule is the right
discipline for any site that wants to be cited by ChatGPT, Claude, or
Perplexity instead of just ranked by Google. The tools should enforce
the discipline, not let you bypass it.

Source: <repo URL>
Docs: <repo URL>#readme
Built for: https://unlocksaas.com

Happy to answer questions.
```

---

## Engagement plan after submission

1. **First hour**: refresh once every 10 minutes. If it gets 4 to 5 upvotes in the first 30 minutes, it's likely to hit `new` page longevity. If it gets zero, do not re-submit.
2. **Reply to every comment within 15 minutes** for the first 4 hours. HN ranks engagement.
3. **Do not vote-ring.** HN's algorithm penalizes any submission that gets a sudden burst of upvotes from new accounts. If a friend wants to upvote, they should log in from their normal account on their normal IP.
4. **Do not edit the title after submission.** HN treats this as gaming.
5. **If it hits front page**, follow-up posts that day on Twitter / Indie Hackers / Reddit are fine. If it doesn't, wait at least 24h.

---

## What NOT to claim

Per Brunson Hard-Rule, the post must not say:

- "Used by hundreds of indie SaaS founders"  (no verified users yet)
- "Better than [competitor]"                 (no objective benchmark)
- "Faster than X"                            (no benchmark; X is what?)
- Any star count, download count, or "we"    (one-person team, founder voice)

Honest framings that work:

- "Extracted from a single production codebase"
- "Catches what existing libraries silently emit"
- "Optional peer dependency on Next"
