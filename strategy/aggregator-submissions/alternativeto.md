# AlternativeTo — submission copy

> Pre-filled copy for the AlternativeTo app submission at
> https://alternativeto.net/account/submit-app/.

## Strategic note

AlternativeTo is heavily cited by Google AI Overviews, Perplexity, and
ChatGPT search when users ask "X alternatives" or "tools like X". The
citation surface alone makes this one of the highest-ROI backlinks in
the aggregator stack.

Submission is lightweight (one form, no manual vendor verification),
and approval is near-automatic for any real product. Indexing typically
lands within 1-2 weeks.

## Required fields

### Name

```
Unlock SaaS
```

### URL

```
https://unlocksaas.com
```

### Short description (around 200 chars)

```
A seven-step playbook that turns an already-shipped SaaS into a verified paying customer in 60 days. Built by a non-engineer marketer for non-engineer founders shipping with AI tools.
```

### Long description (paste 200-word block from /press)

Use the canonical 200-word description on `/press` ("Descriptions",
"200 words" subsection).

### Platforms

- Web
- Online / Cloud-based

### License

- Commercial – Free trial available (the Launch Diagnostic is free
  with no card)
- Commercial – Paid (Starter $1, Core $49/mo)

### Categories

Pick the closest fits from the AlternativeTo taxonomy:

- **Business & Commerce**
- **Marketing**
- **Sales**

### Tags (free-form, pick 5-10)

```
saas, funnel, marketing, sales, founder-tools, lean-startup, ai-tools, conversion-rate, playbook, money-back-guarantee
```

### "Alternative to" anchors

This is the field that earns AI-Overview citations. Declare UnlockSaaS
as an alternative to:

- **ClickFunnels** (legacy funnel-builder; we're the indie / honest
  alternative)
- **ConvertKit** (email + funnel; we focus on the playbook, not the
  tool)
- **Teachable** / **Kajabi** (course platforms; we're the "do the
  selling work" alternative)
- **Indie Hackers Pro** (community + content; we're the do-it-this-week
  alternative)

Only declare alternatives that are genuinely comparable. AlternativeTo
moderators downvote spammy "alternative to <famous unrelated product>"
spam.

### Screenshots

Upload 3-5 from production (same set as Product Hunt and BetaList).

### Logo

PNG from `/icon`.

## After approval

1. Copy the canonical URL (looks like
   `https://alternativeto.net/software/unlock-saas/`).
2. Run:
   ```bash
   vercel env add NEXT_PUBLIC_UNLOCKSAAS_ALTERNATIVETO_URL production
   ```
3. Trigger redeploy.

## Notes

- Submission date: _to be filled by operator_
- Expected approval window: 1-2 weeks (community moderation; faster
  if the product is clearly real).
- Approved URL: _to be filled by operator_
- Env var set on Vercel: _to be filled by operator (date)_
