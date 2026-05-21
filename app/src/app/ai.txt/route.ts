import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/seo/entity";

/**
 * /ai.txt -- Spawning AI training opt-out declaration.
 *
 * Specification: https://spawning.ai/ai-txt
 * Added: 2026-05-21 (purpose-based AI bot policy)
 *
 * Context
 * -------
 * UnlockSaaS is a pre-revenue SaaS where AI-search citation IS the
 * distribution channel. We therefore split AI bot policy into two tiers:
 *
 *   ALLOWED   -- search indexing, retrieval, answer-engine citation,
 *                summarization, and general inference uses.
 *   DISALLOWED -- use of this content as training data for ML model
 *                 weights, or storing content in datasets distributed
 *                 to third parties for that purpose.
 *
 * This file implements the Spawning spec for the training-opt-out layer.
 * The crawl-level enforcement for the same distinction lives in robots.ts
 * (search/answer bots are explicitly allowed; training-only bots are
 * blocked). Together the two files give AI pipeline operators a
 * belt-and-suspenders signal.
 *
 * Related policy surfaces
 * -----------------------
 *   robots.txt               -- crawl-level bot allow/block policy
 *   /.well-known/ai-policy.json -- JSON manifest (search + citation allowed)
 *   /llms.txt                -- LLM-readable site index
 *   /editorial-policy        -- corrections + editorial standards
 *
 * Cache: strategy-cadence changes only. Mirrors llms.txt discipline:
 * 1-day TTL + 7-day stale-while-revalidate.
 */

const CACHE_CONTROL =
  "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800";

const AI_TXT_BODY = `\
# ai.txt -- UnlockSaaS AI training opt-out
# Specification: https://spawning.ai/ai-txt
# Effective: 2026-05-21
#
# Summary
# -------
# UnlockSaaS (${BASE_URL}) consents to AI-powered search, retrieval,
# and answer-engine citation of this content.
# We do NOT consent to use of this content as training data for AI or
# machine-learning model weights, or storage in third-party datasets
# distributed for that purpose.
#
# Additional machine-readable policy:
#   ${BASE_URL}/.well-known/ai-policy.json
#   ${BASE_URL}/llms.txt
#   ${BASE_URL}/editorial-policy
#
# -- Default: block training/storing for all unrecognised crawlers.
User-Agent: *
Disallow: Training
Disallow: Storing

# -- OpenAI GPTBot (training crawler; ChatGPT-User + OAI-SearchBot are
#    the search/answer surfaces and are welcome via robots.txt).
User-Agent: GPTBot
Disallow: Training
Disallow: Storing

# -- Google-Extended (Google AI training; separate from Googlebot search).
User-Agent: Google-Extended
Disallow: Training
Disallow: Storing

# -- Common Crawl (open corpus used for training many open-weight models).
User-Agent: CCBot
Disallow: Training
Disallow: Storing

# -- ByteDance training crawler (Doubao / Coze AI stack).
User-Agent: Bytespider
Disallow: Training
Disallow: Storing

# -- Meta AI training crawlers.
User-Agent: Meta-ExternalAgent
Disallow: Training
Disallow: Storing

User-Agent: FacebookBot
Disallow: Training
Disallow: Storing

# -- Apple AI training (distinct from Applebot search/Spotlight crawler).
User-Agent: Applebot-Extended
Disallow: Training
Disallow: Storing

# -- Amazon Alexa AI training.
User-Agent: Amazonbot
Disallow: Training
Disallow: Storing

# -- Cohere training-specific crawler (cohere-ai inference is welcome).
User-Agent: cohere-training-data-crawler
Disallow: Training
Disallow: Storing

# -- Diffbot (knowledge-graph training; no citation surface for this site).
User-Agent: Diffbot
Disallow: Training
Disallow: Storing
`;

export function GET() {
  return new NextResponse(AI_TXT_BODY, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": CACHE_CONTROL,
    },
  });
}
