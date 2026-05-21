# AI Crawler Policy: /ai.txt + Purpose-Based robots.txt

**Status:** Shipped (2026-05-21, PR #99 + PR #101)
**Sources:** nohacks.co AI User Agents Landscape 2026; Spawning ai.txt spec (https://spawning.ai/ai-txt)

---

## Decision

UnlockSaaS implements a two-layer, purpose-based AI crawler policy:

1. **`/robots.txt`** -- governs crawl access. Search/answer bots explicitly allowed; training-only bots blocked with `Disallow: /`.
2. **`/ai.txt`** (Spawning spec) -- belt-and-suspenders training opt-out. Declares `Disallow: Training` + `Disallow: Storing` for training-only bots and a `*` catch-all.

---

## Layer 1: robots.txt -- crawl access

### Bots allowed (search/answer/citation surface)

| User-Agent | Product | Purpose |
|-----------|---------|---------|
| OAI-SearchBot | ChatGPT Search | Retrieval indexing |
| ChatGPT-User | ChatGPT | User-triggered fetch |
| ClaudeBot | Claude | Web search + retrieval |
| Claude-SearchBot | Claude | Dedicated retrieval indexing |
| Claude-Web | Claude | Web browsing |
| Claude-User | Claude | User-triggered fetch |
| anthropic-ai | Anthropic | Inference-time fetch |
| GoogleOther | Google | AI Overviews / Gemini (not training) |
| PerplexityBot | Perplexity | Answer engine indexing |
| Perplexity-User | Perplexity | User-triggered fetch |
| Applebot | Apple | Spotlight / Siri search |
| DuckAssistBot | DuckDuckGo | AI Assist answers |
| MistralAI-User | Mistral | Le Chat user fetch |
| YouBot | You.com | Answer engine indexing |
| cohere-ai | Cohere | Inference (not training) |
| Bravebot | Brave Search | Search indexing |
| MojeekBot | Mojeek | Search indexing |
| search.marginalia.nu | Marginalia | Search indexing |
| Kagibot | Kagi | Search indexing |

### Bots blocked (training-only, no citation surface)

| User-Agent | Reason |
|-----------|--------|
| GPTBot | OpenAI training corpus; ChatGPT-User is the citation UA |
| Google-Extended | Google AI training; Googlebot search is unaffected |
| CCBot | Common Crawl training corpus for open-weight models |
| Bytespider | ByteDance training crawler |
| Meta-ExternalAgent | Meta AI training |
| FacebookBot | Meta social AI training |
| Applebot-Extended | Apple Intelligence training (Applebot search unaffected) |
| Amazonbot | Amazon Nova training |
| cohere-training-data-crawler | Cohere training (cohere-ai inference unaffected) |
| Diffbot | Knowledge-graph training corpus |

---

## Layer 2: ai.txt -- training data consent (Spawning spec)

File at `https://unlocksaas.com/ai.txt`. Format: `User-agent` blocks with `Disallow: Training` + `Disallow: Storing` directives.

Applies to: same training-only bot list above, plus `*` catch-all for any unrecognised dataset aggregators.

---

## Rationale

### Why block training-only bots in robots.txt?

These bots consume crawl budget without driving any retrieval traffic or AI-answer citations. For a pre-revenue SaaS where AI-search citation IS the distribution channel, allowing them produces no upside and wastes the crawl budget that answer-engine bots need.

### Why keep ClaudeBot (and not just Claude-SearchBot)?

Anthropic uses `ClaudeBot` for both claude.ai search and training. The citation surface (being recommended in Claude answers) outweighs the training cost at this stage. Revisit once LLM-citation share data is measurable via Otterly.ai or PostHog referrer tracking.

### Why ai.txt in addition to robots.txt blocks?

The Spawning spec is checked by dataset aggregators that may not respect robots.txt, or that process content they already have cached. It is a separate consent signal at the dataset-ingestion layer vs. the crawl layer. Belt-and-suspenders.

---

## User-Agent Source

nohacks.co "AI User Agents Landscape 2026" (fetched 2026-05-21). Key categories from that report:

- **Training crawlers:** GPTBot, ClaudeBot, CCBot, Amazonbot, Meta-ExternalAgent
- **Search/answer crawlers:** OAI-SearchBot, Claude-SearchBot, PerplexityBot, DuckAssistBot
- **User-triggered fetchers:** ChatGPT-User, Claude-User, Perplexity-User, MistralAI-User
- **Opt-out tokens (never appear in logs):** Google-Extended, Applebot-Extended

---

## Files

| File | PR | Change |
|------|----|--------|
| `app/src/app/ai.txt/route.ts` | #99 | NEW -- Spawning ai.txt consent declaration |
| `app/src/app/robots.ts` | #99 + #101 | Purpose-based split + Claude-SearchBot/Claude-User added |
| `app/src/app/sitemap.ts` | #101 | Added /ai.txt entry |
| `strategy/decisions/ai-crawler-policy.md` | #101 | This document |
| `build-log.md` | #101 | Build log entry |
