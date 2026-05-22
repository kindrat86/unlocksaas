# Aggregator listings runbook

> Operator playbook for getting UnlockSaaS listed on the off-platform
> review aggregators, launch directories, and discovery surfaces that
> compound into AI-Overview citations and high-DA backlinks.

## Why this matters

Each approved aggregator listing is three signals at once:

1. **Inbound link from a 60+ DA domain** – measurable lift on topical
   authority inside 30 days of indexing.
2. **AI-Overview citation surface** – Perplexity, ClaudeBot, OAI-Search,
   and Google AI Overviews routinely cite G2, Capterra, Product Hunt,
   and AlternativeTo when answering "what is X?" or "X alternatives".
   Each live listing is a candidate citation that loops back to
   unlocksaas.com.
3. **Organization sameAs anchor** – every env var the operator activates
   lights up another row on Organization JSON-LD, increasing Knowledge
   Graph entity confidence.

The infrastructure ships pre-wired. The bottleneck is operator time on
submission forms + the patience to wait for approval. This document is
the order, the prerequisites, and the post-approval checklist.

## How the wiring works (so you trust it)

- Registry: `app/src/lib/seo/directory-listings.ts` declares the
  directories we target and the env var that holds each live URL.
- Schema slots: `app/src/lib/seo/entity.ts buildSameAs()` reads the
  same env vars and adds any non-empty https:// URL to the
  Organization.sameAs array on every page.
- Public hub: `/press/listings` (page) + `/press/listings.md` (markdown
  mirror) render the current state. Each row is "live" or "submission
  pending" based purely on whether the env var is set.
- Activation: paste the approved URL into the env var on Vercel,
  redeploy. Schema and the hub both update on the next build with no
  code change.

There is no manual schema edit step. There is no audit cycle. Get the
URL, paste it, redeploy.

## Submission order

Smaller priority number goes first. Priorities are spaced by 10 in
`directory-listings.ts` so future inserts don't renumber existing rows.

| # | Directory       | Category   | Env var                                       | Submission URL                                  |
|---|-----------------|------------|-----------------------------------------------|-------------------------------------------------|
| 1 | Product Hunt    | launch     | `NEXT_PUBLIC_UNLOCKSAAS_PRODUCT_HUNT_URL`     | https://www.producthunt.com/posts/new           |
| 2 | BetaList        | launch     | `NEXT_PUBLIC_UNLOCKSAAS_BETALIST_URL`         | https://betalist.com/submit                     |
| 3 | G2              | review     | `NEXT_PUBLIC_UNLOCKSAAS_G2_URL`               | https://sell.g2.com/get-listed                  |
| 4 | Capterra        | review     | `NEXT_PUBLIC_UNLOCKSAAS_CAPTERRA_URL`         | https://www.capterra.com/vendors/sign-up        |
| 5 | AlternativeTo   | discovery  | `NEXT_PUBLIC_UNLOCKSAAS_ALTERNATIVETO_URL`    | https://alternativeto.net/account/submit-app/   |
| 6 | SaaSHub         | discovery  | `NEXT_PUBLIC_UNLOCKSAAS_SAASHUB_URL`          | https://www.saashub.com/submit-software         |
| 7 | Indie Hackers   | community  | `NEXT_PUBLIC_UNLOCKSAAS_INDIE_HACKERS_URL`    | https://www.indiehackers.com/products/new       |

## Prerequisites (do these once)

Before starting any submission, have the following ready – every
directory asks for some subset, and pre-staging avoids context-switching
mid-form:

- **Tagline** – 60 characters. "Your first paying customer in 60 days,
  or you don't pay."
- **Short description** – 50 words. Use the canonical 50-word block on
  `/press` ("Descriptions").
- **Medium description** – 100 words. Use the 100-word block on `/press`.
- **Long description** – 200 words. Use the 200-word block on `/press`.
- **Founder bio** – the long form on `/about`, or the bio paragraph on
  `/press` for shorter slots.
- **Pricing** – $1 Starter, $49/mo Core. Free Launch Diagnostic.
  60-day money-back guarantee.
- **Category** – varies by directory; closest fits are "Marketing /
  Sales Funnels", "Founder Tools", "Conversion Optimisation".
- **Logo** – served from `/icon` and `/apple-icon`.
- **OG card** – `/opengraph-image` (1200×630 PNG).
- **Screenshots** – the homepage, the diagnostic input/result, the
  playbook overview. Most directories accept 1280×800. Capture from
  production at the canonical viewport, not local dev.
- **Founder email** – maryan@unlocksaas.com (Attractive Character
  identity; do not use signal@gitdealflow.com on customer-facing
  listings).
- **X / Twitter handle** – paste only if/once the account exists and
  links back to unlocksaas.com (bidirectional claim is required for
  Knowledge Graph credit).

The directory-specific copy lives in
`strategy/aggregator-submissions/<directory>.md`. Open the matching file
before opening the submission tab.

## Per-category cadence

### Launch (Product Hunt, BetaList)

One-shot events. Time the submission to a product moment so the launch
day itself is a conversion event. Coordinate the relaunch with the $1
Starter price drop – the Product Hunt gallery rewards a sub-$5 entry
tier and BetaList rewards waitlist-shaped exclusivity framing.

Treat these as the marquee submissions. Sustained AI-citation traffic
from the indexed product page continues for months after launch day.

### Review aggregators (G2, Capterra)

**Brunson Hard-Rule**: do NOT farm reviews on G2 or Capterra. Submit only
when there are 3+ genuine paying customers willing to leave honest
reviews. The directory teams and the AI Overview pipelines both
penalise incentivised review patterns; getting caught once is
catastrophic.

Capterra is Gartner-owned: a single Capterra approval syndicates to
GetApp and SoftwareAdvice automatically. One submission, three surfaces.

### Discovery (AlternativeTo, SaaSHub)

Lightweight. Approval is fast (days, not weeks). These are the
highest-velocity backlinks in the list and the surfaces AI Overviews
cite most often for "X alternatives" queries.

Submit when there is at least one near-competitor we want to be listed
as an alternative to. AlternativeTo specifically allows declaring
"Alternative to ClickFunnels", "Alternative to ConvertKit", etc., and
those alternative-to anchors are the citation hooks.

### Community (Indie Hackers)

The Indie Hackers product page is the backlink anchor; the sustained
posting (milestones, revenue updates, weekly check-ins) is the bigger
compound effect. Submit the product profile once, then commit to
posting.

## Per-submission checklist

For each directory:

1. Open `strategy/aggregator-submissions/<directory>.md` for the
   pre-filled copy.
2. Open the submission URL from the table above.
3. Paste the copy from the strategy doc into the form. Adjust only
   where the directory has unique fields (e.g. G2 asks for use-case
   tags, Capterra asks for feature checklist).
4. Use the press contact email `maryan@unlocksaas.com` for the
   submitter identity.
5. After submitting, note the submission date + expected approval
   window in the strategy doc.
6. When the directory approves the listing, **copy the canonical
   public URL of the live profile**.
7. Set the env var on Vercel for both Production and Preview:
   ```bash
   # For preview, use the REST API (CLI 54.2.0 has a known bug):
   # POST /v10/projects/{id}/env  body={target:["preview"], key, value}
   vercel env add NEXT_PUBLIC_UNLOCKSAAS_<DIRECTORY>_URL production
   ```
8. Trigger a redeploy. Both `/press/listings` and Organization.sameAs
   on every page pick up the new URL.
9. Verify on production: open `view-source:https://unlocksaas.com/`
   and grep for the new URL inside the Organization JSON-LD block.
10. Verify on `/press/listings`: row should flip from "Submission
    pending" to "View live listing".

## When NOT to submit

- The product genuinely does not fit the directory's category. Forcing
  a fit gets the listing rejected and burns the directory's review
  window.
- There are zero paying customers and the directory is reviews-gated
  (G2, Capterra). Wait. The cost of a "no reviews yet" page is worse
  than the cost of waiting.
- The launch event is more than 30 days away. Product Hunt and
  BetaList reward proximity-to-launch framing; submit close to the
  event, not in advance.

## See also

- `app/src/lib/seo/directory-listings.ts` – the canonical registry.
- `app/src/lib/seo/entity.ts` – `buildSameAs()` reads the same env vars.
- `/press/listings` – live operator-facing status board.
- `/press/listings.md` – markdown mirror for AI crawlers.
- `strategy/aggregator-submissions/` – per-directory pre-filled copy.
- `strategy/google-strategy.md` §B.3 – off-platform signal loop.
