# AI Crawler Policy: /ai.txt + Purpose-Based robots.txt

**Status:** Shipped (2026-05-21, PR feat/ai-crawler-policy)
**Source:** briefing/ai-crawler-policy-2026-05-21

---

## Decision

UnlockSaaS implements a two-layer, purpose-based AI crawler policy:

1. **`/robots.txt`** -- governs crawl access (who may fetch which paths)
2. **`/ai.txt`** (Spawning spec) -- governs training data consent (whether content may be used in AI training corpora)

These two layers are distinct and non-contradictory.

---

## Rationale

### Layer 1: robots.txt -- crawl access

**Allow** crawling by all answer-engine and search bots. This is the existing policy, unchanged.

Rationale: UnlockSaaS is pre-revenue. Every AI-answer citation is free distribution. Citation = revenue signal. Blocking answer bots forfeits the channel.

Bots explicitly allowed (full list in `app/src/app/robots.ts`):
- **OpenAI search:** OAI-SearchBot, GPTBot, ChatGPT-User
- **Anthropic:** ClaudeBot, Claude-SearchBot, Claude-Web, Claude-User, anthropic-ai
- **Google:** Google-Extended, GoogleOther
- **Perplexity:** PerplexityBot, Perplexity-User
- **Microsoft/Bing:** Bingbot
- **Apple:** Applebot, Applebot-Extended
- **Meta:** Meta-ExternalAgent, FacebookBot
- **Common Crawl:** CCBot (also feeds RAG/retrieval pipelines)
- **Others:** DuckAssistBot, Amazonbot, MistralAI-User, YouBot, cohere-ai, Diffbot, Bytespider
- **Indie search:** Bravebot, MojeekBot, search.marginalia.nu, Kagibot

### Layer 2: ai.txt -- training data consent

**Disallow** training data harvesting across all bots (`Spawning: disallow`).

Rationale:
- Training data collection provides zero upside for a citation-driven SaaS
- There is no revenue model for bulk licensing our content to model trainers
- The Spawning spec gives dataset aggregators an explicit machine-readable signal before they ingest
- This signal operates at the dataset aggregation step, not the crawl step -- it does not contradict the robots.txt allow-list

**This is not a contradiction:** allowing crawling for citation ≠ consenting to training data use. A bot can crawl, surface an answer, and cite us (welcome) without ingesting us into an opaque training corpus (not consented).

---

## Source for User-Agent Strings

Primary source: nohacks.co AI User Agents Landscape 2026 (fetched 2026-05-21).

Key categories from that report:
- **Training crawlers:** GPTBot, ClaudeBot, CCBot, Amazonbot, Meta-ExternalAgent
- **Search/answer crawlers:** OAI-SearchBot, Claude-SearchBot, PerplexityBot, DuckAssistBot, Bingbot
- **User-triggered fetchers:** ChatGPT-User, Claude-User, Perplexity-User, MistralAI-User
- **Opt-out tokens (never appear in logs):** Google-Extended, Applebot-Extended

Note: robots.txt cannot address undeclared/masquerading bots (Bytespider/xAI Grok spoofing real UAs). The ai.txt `*` catch-all covers dataset aggregators that check before ingesting.

---

## New bot added: Claude-SearchBot

The nohacks.co 2026 report documents `Claude-SearchBot` as a distinct user-agent from `ClaudeBot`, independently controllable, specifically for Claude's retrieval indexing (analogous to OAI-SearchBot vs GPTBot). Added to `AI_USER_AGENTS` in `robots.ts` in this PR.

---

## Files changed

| File | Change |
|------|--------|
| `app/src/app/ai.txt/route.ts` | NEW -- Spawning ai.txt consent declaration |
| `app/src/app/robots.ts` | Updated header comment; added Claude-SearchBot + Claude-User to AI_USER_AGENTS |
| `app/src/app/sitemap.ts` | Added /ai.txt entry |
| `strategy/decisions/ai-crawler-policy.md` | This document |
| `build-log.md` | Appended build log entry |

---

## Open questions

None. The Spawning site was down for maintenance during implementation (2026-05-21). The format used (`User-agent: X / Spawning: disallow`) is the documented Spawning spec format confirmed from the existing codebase references in `/.well-known/ai-policy.json` and from public documentation. If the spec updates materially after the site comes back up, revisit the file format.
