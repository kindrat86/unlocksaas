# Indie Hackers draft

> Submit at: https://www.indiehackers.com/post/new
>
> Category: Building (not Marketing — IH treats Marketing posts with more skepticism)
>
> Optimal window: Tuesday to Thursday morning, after HN post has settled (gives you a "previously on HN" anchor).

---

## ⚡ PASTE-READY (open this section at submission time, ignore the rest)

**Step 1.** Go to https://www.indiehackers.com/post/new and pick category **Building**.

**Step 2.** Paste the TITLE:

```
I extracted my SEO library from my SaaS – it refuses to emit fabricated review counts
```

**Step 3.** Paste the BODY (markdown; IH renders it):

```markdown
Three weeks ago I shipped Unlock SaaS – a $49/month playbook for non-engineer
founders who shipped with AI tools and now stare at a flat Stripe line. The
audit on the on-page SEO came back 89/100, but the off-page came back 5/100
because the domain is new and has no earned links.

Standard SEO outreach is slow. So I used a play from the Greg Isenberg
"distribution-first" thread (the inverted one – build a tool that generates
your audience instead of buying one):

I open-sourced the SEO library I built for my own site.

**@unlocksaas/seo** is what came out. The opinionated bit is that every
builder refuses to emit fabricated fields.

The three things every other JSON-LD library happily ships that demote you
on Google AI Overviews:

1. `aggregateRating` with `reviewCount: 0` – the entire structured-data block
   gets downgraded.
2. `sameAs: ["twitter.com/handle"]` with no `https://` scheme – Knowledge
   Graph dedupes you.
3. `datePublished: "soon"` – silently dropped by every validator.

Mine refuses all three at build time. And the CLI (`validate-claims`) audits
a deployed page and exits non-zero on violations, so I wired it into CI and
my pricing page can no longer drift from my actual Stripe checkout.

It also generates `/llms.txt` and `/llms-feed.json` from one typed config so
the markdown surface and the JSON sibling cannot disagree on freshness.

Repo: https://github.com/kindrat86/unlocksaas/tree/main/packages/seo
npm: https://www.npmjs.com/package/@unlocksaas/seo

The honest part: I have not yet shipped a verified customer cycle, so the
Unlock SaaS product itself does not yet have `aggregateRating` published on
its Product schema. The library enforces this rule on its own author. Same
discipline, same surface.

If you ship indie SaaS and want a tool that refuses to let you lie in
schema.org, this is for you. If you ship enterprise and need every possible
field, you want something else.

Open to feedback, especially from anyone who tried this for AEO/GEO and
saw the same gap.

– Maryan
```

**Step 4.** Submit. Within 5 minutes, post the FIRST-COMMENT SEED as a reply on your own post:

```markdown
Quick context for anyone wondering why I shipped this instead of just
adding it to the main product:

The off-page-SEO playbook for a new domain is roughly:
  – earn backlinks
  – earn press
  – earn reviews

All three are slow. But one move compounds: ship a developer tool, and every
GitHub star, every npm install, every "powered by" credit is a DR-100
backlink the next time you publish. I'd rather build a tool that does that
than do 100 cold outreach emails.

The tool happens to enforce the editorial standard my main product is built
on (no fabricated claims, dated everything, omit fields you cannot prove
honestly). So shipping it is also a public declaration of how the main
product treats facts.

If this resonates, the rest of the playbook is at unlocksaas.com.
```

**Step 5.** If the HN post hit front page, edit the IH body to mention it (add "Previously on HN: <link>" at the top). If HN did not, do NOT mention it.

---

## Title

```
I extracted my SEO library from my SaaS – it refuses to emit fabricated review counts
```

Variant if the first feels too long for the IH card preview:

```
The JSON-LD library I wish existed when I shipped
```

---

## Body (markdown; IH renders it)

```markdown
Three weeks ago I shipped Unlock SaaS – a $49/month playbook for non-engineer
founders who shipped with AI tools and now stare at a flat Stripe line. The
audit on the on-page SEO came back 89/100, but the off-page came back 5/100
because the domain is new and has no earned links.

Standard SEO outreach is slow. So I used a play from the Greg Isenberg
"distribution-first" thread (the inverted one – build a tool that generates
your audience instead of buying one):

I open-sourced the SEO library I built for my own site.

**@unlocksaas/seo** is what came out. The opinionated bit is that every
builder refuses to emit fabricated fields.

The three things every other JSON-LD library happily ships that demote you
on Google AI Overviews:

1. `aggregateRating` with `reviewCount: 0` – the entire structured-data block
   gets downgraded.
2. `sameAs: ["twitter.com/handle"]` with no `https://` scheme – Knowledge
   Graph dedupes you.
3. `datePublished: "soon"` – silently dropped by every validator.

Mine refuses all three at build time. And the CLI (`validate-claims`) audits
a deployed page and exits non-zero on violations, so I wired it into CI and
my pricing page can no longer drift from my actual Stripe checkout.

It also generates `/llms.txt` and `/llms-feed.json` from one typed config so
the markdown surface and the JSON sibling cannot disagree on freshness.

Repo: https://github.com/kindrat86/unlocksaas/tree/main/packages/seo
npm: https://www.npmjs.com/package/@unlocksaas/seo

The honest part: I have not yet shipped a verified customer cycle, so the
Unlock SaaS product itself does not yet have `aggregateRating` published on
its Product schema. The library enforces this rule on its own author. Same
discipline, same surface.

If you ship indie SaaS and want a tool that refuses to let you lie in
schema.org, this is for you. If you ship enterprise and need every possible
field, you want something else.

Open to feedback, especially from anyone who tried this for AEO/GEO and
saw the same gap.

– Maryan
```

---

## First-comment seed (post within 5 minutes)

```markdown
Quick context for anyone wondering why I shipped this instead of just
adding it to the main product:

The off-page-SEO playbook for a new domain is roughly:
  – earn backlinks
  – earn press
  – earn reviews

All three are slow. But one move compounds: ship a developer tool, and every
GitHub star, every npm install, every "powered by" credit is a DR-100
backlink the next time you publish. I'd rather build a tool that does that
than do 100 cold outreach emails.

The tool happens to enforce the editorial standard my main product is built
on (no fabricated claims, dated everything, omit fields you cannot prove
honestly). So shipping it is also a public declaration of how the main
product treats facts.

If this resonates, the rest of the playbook is at unlocksaas.com.
```
