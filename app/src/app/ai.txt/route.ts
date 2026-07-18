import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/seo/entity";

/**
 * /ai.txt -- Spawning AI usage declaration.
 *
 * Specification: https://spawning.ai/ai-txt
 * Added: 2026-05-21 · Updated 2026-07-18 (fully-open reversal)
 *
 * Context
 * -------
 * As of 2026-07-18 UnlockSaaS is fully open to AI usage on public content:
 *
 *   ALLOWED  -- search indexing, retrieval, answer-engine citation,
 *               summarization, general inference, AND model training /
 *               dataset storage. Attribution back to the canonical URL is
 *               requested for reuse (see /.well-known/ai-policy.json).
 *
 * This reverses the 2026-05-21 training opt-out. The crawl-level policy in
 * robots.ts now allows every AI crawler (citation + training) on public
 * surfaces; this file and /.well-known/ai-policy.json were updated in the
 * same change so every AI-consent signal agrees.
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
# ai.txt -- UnlockSaaS AI usage declaration
# Specification: https://spawning.ai/ai-txt
# Updated: 2026-07-18
#
# Summary
# -------
# UnlockSaaS (${BASE_URL}) consents to AI use of its public content:
# search, retrieval, answer-engine citation, summarization, inference,
# AND model training / dataset storage. Attribution back to the canonical
# URL is requested for reuse. The only non-open subtrees are the paid
# Playbook (/playbook/*) and auth/transactional surfaces.
#
# Additional machine-readable policy:
#   ${BASE_URL}/.well-known/ai-policy.json
#   ${BASE_URL}/llms.txt
#   ${BASE_URL}/editorial-policy
#
# -- Default: all AI uses allowed for every crawler on public content.
User-Agent: *
Allow: Training
Allow: Storing
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
