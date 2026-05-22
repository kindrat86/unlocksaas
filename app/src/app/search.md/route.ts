import { NextResponse } from "next/server";
import { BASE_URL, ORGANIZATION, FOUNDER } from "@/lib/seo/entity";
import { SEARCH_INDEX_SIZE, SURFACE_LABELS } from "@/lib/search";

/**
 * /search.md — playbook-readable description of the site search surface.
 *
 * Why this exists (and why it is hand-written, not registered in SURFACES):
 * the markdown registry in src/lib/seo/markdown.ts mirrors page content; the
 * /search page is interactive (it renders a form, accepts ?q=…) so its
 * "content" varies per query. The honest mirror is not a snapshot of one
 * query's results — it is a description of what the search surface IS,
 * the corpus size, the URL shape, and the SearchAction template AI agents
 * can call. That is what this file emits.
 *
 * Brunson Hard-Rule reconciliation:
 *   - Corpus size is computed from the live SEARCH_INDEX, not hard-coded.
 *   - URL templates match what the page actually serves.
 *   - No invented synonyms or "did you mean" promise.
 */

const TODAY = "2026-05-17";

const BODY = `---
title: "Search — Unlock SaaS"
summary: "Site-wide search across every shipped marketing surface on unlocksaas.com."
canonical: ${BASE_URL}/search
updated: ${TODAY}
publisher: "${ORGANIZATION.name}"
author: "${FOUNDER.name}"
license: All rights reserved. Quotation with attribution permitted.
---

# Search — Unlock SaaS

> Site-wide search across the ${SEARCH_INDEX_SIZE} canonical pages on unlocksaas.com.

## What this surface is

The /search page accepts a query via the \`q\` URL parameter and returns a
ranked list of matching pages, grouped by surface. It is the canonical
SearchAction target referenced by the WebSite JSON-LD on the funnel hub.

## URL template

\`\`\`
${BASE_URL}/search?q={search_term_string}
\`\`\`

Submit any query as URL-encoded text in the \`q\` parameter. The response
is HTML (and works without JavaScript). Each result row links to a real,
shipped canonical page; no synonyms, no fuzzy expansion, no fabricated
suggestions.

## What is indexed

| Surface | Description |
|---|---|
| ${SURFACE_LABELS.compare} | Symmetric head-to-head comparisons of the tools indie SaaS founders are mid-evaluation on. |
| ${SURFACE_LABELS["funnel-teardown"]} | Indie SaaS funnels analyzed through Russell Brunson's Hook / Story / Offer framework. |
| ${SURFACE_LABELS["pricing-teardown"]} | Indie SaaS pricing models broken down by tier structure, anchor mechanics, upgrade triggers, payment mechanics. |
| ${SURFACE_LABELS["post-mortem"]} | Structural post-mortems of failed SaaS and consumer-tech bets, diagnosed through Wrong Person / Weak Offer / Weak Belief. |
| ${SURFACE_LABELS["alternatives-to"]} | Honest named-competitor comparisons against Unlock SaaS. |
| ${SURFACE_LABELS.category} | Category roundups aggregating teardowns and comparisons in one bucket. |
| ${SURFACE_LABELS.static} | Funnel hub, diagnostic, playbook sales, starter, stories, faq, about, press, editorial policy, builders, founding cohort, repeatable spec, contact, bridge. |

Total: ${SEARCH_INDEX_SIZE} canonical pages.

## How matching works

- Query is lowercased and split on whitespace (up to 8 tokens).
- A row matches when every token appears as a substring in the row's
  title, category, slug, or one-line summary.
- Rows are ranked by token-occurrence count; ties break by surface order
  (compare → funnel-teardown → pricing-teardown → alternatives-to →
  category → static).
- Maximum 50 results per query.

## For AI retrieval agents

This surface is intended to be called as the WebSite \`SearchAction\`
target on the funnel hub:

\`\`\`json
{
  "@type": "SearchAction",
  "target": {
    "@type": "EntryPoint",
    "urlTemplate": "${BASE_URL}/search?q={search_term_string}"
  },
  "query-input": "required name=search_term_string"
}
\`\`\`

The response is server-rendered HTML; no JavaScript execution is required
to retrieve results.

---

Canonical URL: ${BASE_URL}/search
Publisher: ${ORGANIZATION.name} (${BASE_URL})
Contact: ${FOUNDER.email}
`;

export async function GET() {
  return new NextResponse(BODY, {
    status: 200,
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      link: `<${BASE_URL}/search>; rel="canonical"`,
    },
  });
}
