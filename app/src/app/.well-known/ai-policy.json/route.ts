/**
 * /.well-known/ai-policy.json – canonical AI usage policy manifest.
 *
 * Why this surface exists
 * -----------------------
 * The codebase already publishes scattered AI-consent signals – the
 * `training-data-attribution: allow` header on every llms.* route, the
 * 24-agent allow-list in /robots.txt, the citationGuidance block inside
 * /llms-feed.json, the CC-BY-4.0 dataset license inside the Dataset
 * JSON-LD on /dataset. What this file adds is a single canonical,
 * dereferenceable URL that answers the four questions a careful AI
 * ingestion pipeline asks before quoting or training:
 *
 *   1. Training/retrieval/summarization preferences? (allow + attribution)
 *   2. Compensation? (no – free with attribution)
 *   3. Paywall? (yes, /playbook/* only; everything else is open)
 *   4. Canonical attribution target? (https://unlocksaas.com)
 *
 * Two conventions converge on this URL:
 *   - RFC 8615 (.well-known/* discovery), the same convention this site
 *     already uses for security.txt, llms.txt, entity.jsonld, mcp.json.
 *   - The emerging IETF AI Preferences WG draft, plus the precedents at
 *     llmstxt.org, spawning.ai/ai-txt, and the W3C TDMRep ODRL pattern.
 *
 * Single source of truth lives in @/lib/seo/ai-policy; this route is the
 * thin serialization layer.
 *
 * Brunson Hard-Rule reconciliation: every claim in the body is also
 * present, verifiable, in another shipped surface – the response
 * headers on the llms.* routes, the /robots.txt allow-list, the Dataset
 * JSON-LD license, the /playbook/* disallow rule. No fabricated
 * permissions, no claim of compensation we are not enforcing.
 *
 * Caching: route handler is static (no request-time inputs); the policy
 * body changes about as often as the strategy documents – i.e. quarterly.
 * Aggressive edge cache, 7-day stale-while-revalidate, mirroring the
 * discipline on /.well-known/entity.jsonld and /.well-known/mcp.json.
 */

import { NextResponse } from "next/server";
import {
  AI_POLICY,
  AI_POLICY_CACHE_CONTROL,
  AI_POLICY_TRAINING_DATA_ATTRIBUTION,
} from "@/lib/seo/ai-policy";

export function GET() {
  return NextResponse.json(AI_POLICY, {
    status: 200,
    headers: {
      // Long edge cache: manifest only changes on deploy.
      "cache-control": AI_POLICY_CACHE_CONTROL,
      // Forward-looking opt-in signal. Same value the four llms.* routes
      // already return; repeated here so a crawler that only reads
      // headers sees consistent consent regardless of which discovery
      // surface it hit first.
      "training-data-attribution": AI_POLICY_TRAINING_DATA_ATTRIBUTION,
      // Cross-origin: any agent or registry can fetch this. The manifest
      // is intentionally public – it IS the canonical AI usage policy.
      "access-control-allow-origin": "*",
    },
  });
}

// Static – no per-request inputs, identical body on every call.
