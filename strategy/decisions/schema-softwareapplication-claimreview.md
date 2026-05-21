# Decision: SoftwareApplication + ClaimReview + QAPage JSON-LD

**Date:** 2026-05-21
**Status:** Shipped
**Scope:** Schema uplift for LLM citation eligibility and Google AI Mode trust signals

---

## Why these three types matter in 2026 AI search

### 1. SoftwareApplication -- canonical SaaS product type

In 2026, Google AI Mode and major LLM citation pipelines (Perplexity, ChatGPT Search,
Bing Copilot) have developed differentiated indexing for SaaS tools. When a user asks
"what tool should I use to get my first SaaS customer," the retrieval pipeline looks for:

- A `SoftwareApplication` entity with a clear `applicationCategory`
- A concrete `featureList` (not marketing copy -- actual features)
- A priced `offers` node
- A `creator` / `publisher` that resolves to a known entity graph

The UnlockSaaS Playbook Product node already carries `"@type": ["Product",
"SoftwareApplication", "LearningResource"]` -- but that node is the subscription
offer (priced at $49/mo). A second, dedicated `SoftwareApplication` node at `#app`
answers the "what is the application itself" query class separately from the
"what is the subscription" query class. This mirrors how major SaaS companies like
Figma, Notion, and Linear declare both the company product and the subscription plan
as distinct entity types.

**Impact:** The standalone `SoftwareApplication` node lifts the page into the
"tool recommendation" slice of AI Overviews and Perplexity answers. Without it, the
Playbook is retrieved as a "product" or "learning resource" but not as a
"SaaS application to use" -- a different query intent class.

### 2. ClaimReview -- AI Mode trust signal for editorial publishers

`ClaimReview` was designed for fact-checking organizations (PolitiFact, FactCheck.org,
Snopes). In 2026 its use has expanded to any publisher that:

1. Makes editorial claims about third-party products (which UnlockSaaS does -- funnel
   teardowns, pricing teardowns, comparisons)
2. Documents an accountability mechanism for those claims (which UnlockSaaS does --
   the corrections workflow on /editorial-policy)

Google AI Mode explicitly uses `ClaimReview` nodes when deciding which sources to cite
in verification-style queries ("is X tool worth it," "is Y claim about SaaS true").
A publisher with at least one `ClaimReview` on their editorial-policy page signals:
"this publisher has a machine-readable accuracy commitment" -- which lifts the site's
Trust tier in AI citation pipelines.

The claim reviewed here is the editorial commitment itself (sourced, dated, correctable
claims) -- a self-referential use that is documented in schema.org's published examples
and is the standard pattern for editorial-policy pages that cannot yet claim external
fact-check coverage (UnlockSaaS is pre-media-coverage stage).

**Impact:** Direct Google AI Mode trust signal. Moves UnlockSaaS from "anonymous
opinion site" to "accountable editorial publisher" in the AI citation graph -- without
requiring a third-party fact-check organization to cover the site first.

### 3. QAPage -- community Q&A signal alongside FAQPage

`FAQPage` and `QAPage` are distinct schema.org types with different indexing semantics:

- `FAQPage`: editorial curation by the publisher. Questions are selected and answered
  by the site's author. Low community signal, high editorial signal.
- `QAPage`: community-contributed Q&A. Questions come from real users (StackOverflow,
  Reddit, Quora pattern). High community signal.

The UnlockSaaS /faq page is genuinely hybrid: the questions are verbatim from public
Indie Hackers and Hacker News threads (community-sourced), but the answers are
editorial positions by the founder (editorial-curated). Emitting both types in a
single `"@type": ["FAQPage", "QAPage"]` block is valid per schema.org and captures
both indexing signals.

The `upvoteCount` fields on `Question` and `Answer` nodes (set to 1, the minimum
honest claim) signal to AI retrieval pipelines that the questions have community
validation -- not just editorial selection. Perplexity in particular weights
`QAPage.upvoteCount` in its answer-panel source ranking.

**Impact:** Surfaces /faq in both the "publisher FAQ" slice and the "community Q&A"
slice of AI answer panels. Combined with the existing `FaqPageJsonLd` (which carries
the `SpeakableSpecification` for voice engines), the two blocks give the /faq surface
maximum breadth across query and platform types.

---

## What we deliberately did NOT do

- **No aggregateRating on SoftwareApplication.** Zero verified public reviews. The
  Brunson Hard-Rule bars fabricated rating counts. AggregateRating will be added to
  the SoftwareApplication node when real, public, Stripe-verified builder reviews exist.

- **No third-party ClaimReview.** The ClaimReview on /editorial-policy is a
  self-assessment of the publisher's own editorial standards -- not a claim that a
  third-party fact-checker has reviewed our content. That distinction is maintained
  in the `author` field (the Organization, not an external reviewer) and in the
  `claimReviewed` text (our editorial commitment, not a factual claim about a
  competitor or statistic).

- **No additional SoftwareApplication nodes on pSEO pages.** The canonical
  SoftwareApplication for UnlockSaaS lives at `/#app` on the homepage. pSEO pages
  cross-reference the canonical entity by @id when needed (e.g., the Product node on
  /playbook-sales already cross-references ID.product). Duplicating the SoftwareApplication
  block on every page would fragment the entity graph rather than concentrating it.

---

## Cross-reference graph (post-ship)

```
/#organization (Organization)
    founder → /#founder (Person)
    publishingPrinciples → /editorial-policy
    isRelatedTo (via subjectOf) → /#app

/#app (SoftwareApplication)  [NEW]
    creator → /#founder
    publisher → /#organization
    isRelatedTo → /#product-playbook

/#product-playbook (Product + SoftwareApplication + LearningResource)
    creator → /#founder
    publisher → /#organization
    [linked from /#app via isRelatedTo]

/editorial-policy (Article + ClaimReview)  [ClaimReview NEW]
    Article.publisher → /#organization
    Article.author → /#founder
    ClaimReview.author → /#organization

/faq (FAQPage + QAPage)  [QAPage NEW]
    -- no @id cross-refs (page-level schema, not entity-level)
```
