# /r/SaaS draft

> Submit at: https://www.reddit.com/r/SaaS/submit
>
> Subreddit rules: low tolerance for self-promo. Lead with the problem and the
> finding, not the link. The link goes in a comment.
>
> Optimal window: Wednesday or Thursday, 09:00 to 11:00 US Eastern (16:00 to 18:00 Athens).

---

## Title

```
I audited 12 indie SaaS landing pages for fake aggregateRating in JSON-LD. 9 had it.
```

(Pick this only if you have actually audited 12. Otherwise use the variant below.)

Variant – honest version that doesn't require pre-audit data:

```
The 3 JSON-LD mistakes that silently demote your SaaS from AI Overviews
```

---

## Body (the "honest" variant – use this if you have not audited 12 sites)

```markdown
Spent the weekend extracting the SEO library I built for my own SaaS into
a public package and writing a CLI that audits any deployed page. Here's
what I learned about what every "easy JSON-LD generator" lets you ship
that silently demotes you.

**1. aggregateRating with reviewCount: 0**

This is the most common one. The page has a "5 stars!" claim, the schema
emits `aggregateRating: { ratingValue: 5, reviewCount: 0 }`, and Google
quietly drops the entire structured-data block from AI Overviews
eligibility. Bing does the same. The honest move is to omit aggregateRating
until you have verified reviews. I have not shipped a customer cycle on
my own SaaS yet, so my Product schema does not publish aggregateRating
either – the library enforces this on its author.

**2. sameAs entries with no https:// scheme**

"twitter.com/yourhandle" looks fine in a JSON-LD generator. It is not fine
for Knowledge Graph. Google's deduplication heuristic drops the entire
sameAs array if any entry fails the absolute-URL check. The honest move
is to filter sameAs to https-only at build time. Mine does.

**3. Date stamps that are not ISO 8601**

`datePublished: "May 2026"`, `datePublished: "soon"`, `datePublished: ""` –
all silently dropped. Without datePublished, Article schema cannot earn
the freshness boost in AI Overviews. The honest move is to refuse to
build if the date is not ISO. Mine throws.

I also wrote a CLI that fetches a deployed page, parses every JSON-LD
block, and diffs schema claims against the rendered HTML. If your pricing
page says "$19/mo" but your Product schema emits `price: 29`, it tells you.

It's MIT, framework-free (Next.js is optional). Source link in comments
because subreddit rules.

What other JSON-LD landmines have you found in the wild?
```

---

## First-comment seed (post immediately, with the link)

```markdown
Source: <REPO URL>

It's @unlocksaas/seo on npm. The CLI is `validate-claims <url>`. Built
because I needed it for my own site (unlocksaas.com) and got tired of
existing libraries letting me bypass the discipline.

If anyone tries it on their own pricing page, I'd love to hear what it
catches. Especially curious about anyone shipping AI Overviews citations
already.
```

---

## Rules to follow

- **Do NOT** link the npm/GitHub URL in the post body. /r/SaaS auto-removes self-promo.
- **Do NOT** title with your product name.
- **DO** reply to every comment within 30 minutes for the first 4 hours.
- **DO NOT** ask for upvotes (banned across most subreddits).
- **DO** post the link as the first comment, not edited into the body.
- If a mod removes the post for self-promo, do not re-submit. Take the lesson.
