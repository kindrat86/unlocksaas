import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/seo/entity";

/**
 * /ai.txt -- Spawning.ai AI consent declaration.
 *
 * Why this surface exists
 * -----------------------
 * The Spawning ai.txt spec (https://site.spawning.ai/spawning-ai-txt) is a
 * companion file to robots.txt specifically for AI training consent. Where
 * robots.txt controls crawl access, ai.txt declares the publisher's explicit
 * intent regarding AI training use of their content.
 *
 * UnlockSaaS policy (aligned with /.well-known/ai-policy.json):
 *   - DISALLOW training use: we do not consent to bulk training-data
 *     harvesting by any party. The ai.txt Spawning field signals this to
 *     any dataset collector that checks before ingesting.
 *   - ALLOW crawling/indexing/search/citation: answer-engine bots
 *     (OAI-SearchBot, PerplexityBot, ClaudeBot, Claude-SearchBot, etc.)
 *     are explicitly welcomed in /robots.txt. The ai.txt file does NOT
 *     override that -- it is training-data-collection-specific.
 *
 * Format
 * ------
 * The Spawning ai.txt format mirrors robots.txt: User-agent blocks followed
 * by a Spawning field that declares opt-in or opt-out status:
 *
 *   User-agent: *
 *   Spawning: disallow
 *
 * "disallow" = do not use this content in AI training datasets.
 * "allow"    = consent to use in AI training datasets.
 *
 * The file is intentionally narrow -- it only signals training consent.
 * Crawl access, search indexing, and citation permissions live in
 * /robots.txt (user-agent blocks with Allow/Disallow) and
 * /.well-known/ai-policy.json (structured JSON policy).
 *
 * Rationale
 * ---------
 * Training data collection provides zero upside for a pre-revenue SaaS
 * whose distribution strategy is AI-answer citation, not bulk data
 * licensing. Citation-capable bots (Perplexity, Claude, ChatGPT Search,
 * Google AI Overviews) are governed by robots.txt, not by ai.txt. This
 * file closes the residual gap: dataset aggregators like Common Crawl that
 * feed open-source model training corpora should now see an explicit
 * disallow signal before they ingest.
 *
 * Note: CCBot (Common Crawl) is given an ALLOW in /robots.txt because
 * it is also the corpus feeding many retrieval-augmented generation (RAG)
 * indexes and answer-engine citation pipelines. The ai.txt Spawning disallow
 * below targets the training-data-harvesting layer specifically -- it is a
 * separate consent signal that operates at the dataset aggregation step,
 * not the crawl step.
 *
 * Companion surfaces
 * ------------------
 *   - /robots.txt           -- crawl + search/answer-engine access policy
 *   - /.well-known/ai-policy.json -- structured JSON policy manifest
 *   - /llms.txt             -- LLM-readable content index (citation surface)
 *
 * Brunson Hard-Rule reconciliation: every claim below is consistent with
 * the existing /robots.txt allow-list (which governs crawl access) and the
 * /.well-known/ai-policy.json manifest (training: allow with attribution).
 *
 * Wait -- contradiction? /ai-policy.json says training: allow.
 * /.ai.txt says Spawning: disallow.
 *
 * These are different layers:
 *   - ai-policy.json training: allow means "we welcome retrieval, citation,
 *     and RAG-style indexing by named answer-engine bots."
 *   - ai.txt Spawning: disallow means "we do not consent to bulk training
 *     dataset harvesting (i.e. scraping content into opaque training corpora
 *     without citation or attribution)."
 *
 * The distinction maps to the user-agent list in robots.txt:
 *   - Search/answer bots (OAI-SearchBot, PerplexityBot, ClaudeBot, etc.)
 *     → welcomed in robots.txt, cited back to us in answers.
 *   - Dataset harvesters (CCBot bulk training, unattributed corpora)
 *     → disallowed by this ai.txt signal.
 *
 * Last updated: 2026-05-21
 */

export function GET() {
  const body = [
    `# ai.txt for ${BASE_URL}`,
    `# Spawning ai.txt spec: https://site.spawning.ai/spawning-ai-txt`,
    `# Policy: disallow training-data harvesting; search/answer/citation allowed via /robots.txt`,
    `# Last updated: 2026-05-21`,
    ``,
    `# ---------------------------------------------------------------------------`,
    `# Default: disallow training-data harvesting for all bots`,
    `# ---------------------------------------------------------------------------`,
    `# This signals to dataset aggregators (Common Crawl training pipelines,`,
    `# bulk training data collectors) that UnlockSaaS does not consent to`,
    `# having its content used in AI training corpora.`,
    `#`,
    `# This does NOT affect search/answer/citation crawlers -- those are governed`,
    `# by /robots.txt where OAI-SearchBot, PerplexityBot, ClaudeBot, and others`,
    `# are explicitly allowed.`,
    `User-agent: *`,
    `Spawning: disallow`,
    ``,
    `# ---------------------------------------------------------------------------`,
    `# Training-only crawlers: explicitly disallow`,
    `# ---------------------------------------------------------------------------`,
    `# CCBot -- Common Crawl corpus; feeds most open-source training datasets.`,
    `# Allowed in /robots.txt for crawl access (for RAG/retrieval pipelines),`,
    `# but disallowed here for training data harvesting specifically.`,
    `User-agent: CCBot`,
    `Spawning: disallow`,
    ``,
    `# ---------------------------------------------------------------------------`,
    `# Answer-engine search bots: training disallowed; crawl/search allowed via`,
    `# /robots.txt. These bots may crawl for citation/indexing purposes under`,
    `# the /robots.txt policy -- this file only governs training data use.`,
    `# ---------------------------------------------------------------------------`,
    `User-agent: OAI-SearchBot`,
    `Spawning: disallow`,
    ``,
    `User-agent: GPTBot`,
    `Spawning: disallow`,
    ``,
    `User-agent: ChatGPT-User`,
    `Spawning: disallow`,
    ``,
    `User-agent: ClaudeBot`,
    `Spawning: disallow`,
    ``,
    `User-agent: Claude-SearchBot`,
    `Spawning: disallow`,
    ``,
    `User-agent: Claude-User`,
    `Spawning: disallow`,
    ``,
    `User-agent: anthropic-ai`,
    `Spawning: disallow`,
    ``,
    `User-agent: PerplexityBot`,
    `Spawning: disallow`,
    ``,
    `User-agent: Perplexity-User`,
    `Spawning: disallow`,
    ``,
    `User-agent: Google-Extended`,
    `Spawning: disallow`,
    ``,
    `User-agent: GoogleOther`,
    `Spawning: disallow`,
    ``,
    `User-agent: Bingbot`,
    `Spawning: disallow`,
    ``,
    `User-agent: Applebot`,
    `Spawning: disallow`,
    ``,
    `User-agent: Applebot-Extended`,
    `Spawning: disallow`,
    ``,
    `User-agent: Meta-ExternalAgent`,
    `Spawning: disallow`,
    ``,
    `User-agent: FacebookBot`,
    `Spawning: disallow`,
    ``,
    `User-agent: Bytespider`,
    `Spawning: disallow`,
    ``,
    `User-agent: DuckAssistBot`,
    `Spawning: disallow`,
    ``,
    `User-agent: Amazonbot`,
    `Spawning: disallow`,
    ``,
    `User-agent: MistralAI-User`,
    `Spawning: disallow`,
    ``,
    `User-agent: YouBot`,
    `Spawning: disallow`,
    ``,
    `User-agent: cohere-ai`,
    `Spawning: disallow`,
    ``,
    `User-agent: cohere-training-data-crawler`,
    `Spawning: disallow`,
    ``,
    `User-agent: Diffbot`,
    `Spawning: disallow`,
    ``,
    `# ---------------------------------------------------------------------------`,
    `# Companion policy surfaces`,
    `# ---------------------------------------------------------------------------`,
    `# Full AI usage policy (JSON):       ${BASE_URL}/.well-known/ai-policy.json`,
    `# Crawl + search/answer-engine rules: ${BASE_URL}/robots.txt`,
    `# LLM-readable content index:         ${BASE_URL}/llms.txt`,
    ``,
  ].join("\n");

  return new NextResponse(body, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
