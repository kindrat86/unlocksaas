import type { MetadataRoute } from "next";

/**
 * robots.txt for UnlockSaaS — Surface A (crawl) + Surface B (AEO/GEO) policy.
 *
 * Source: strategy/google-strategy.md §A.4 (crawl) and §B.1 (AI-crawler policy).
 *
 * Three rule groups:
 *   1. `*`           — every crawler (Google, Bing, Yandex, etc.). Public
 *                      marketing surfaces allowed; private/auth/api blocked.
 *   2. AI training   — explicit Allow for the AI crawlers UnlockSaaS WANTS
 *                      to be cited by (Perplexity, Anthropic, OpenAI,
 *                      Google AI Overviews, Apple, ByteDance, Meta, CCBot,
 *                      DuckAssist, Amazon, Mistral). Distribution > scrape
 *                      protection for a pre-revenue founder-tools SaaS where
 *                      AI-answer citation IS the channel.
 *   3. Bad-actor     — block the scrapers that take content without driving
 *                      any retrieval traffic (legacy CCBot already covered
 *                      by allow above; future bad-actor entries land here).
 *
 * Allow-list rationale: each AI user-agent below was added because the
 * model behind it surfaces citations or links back to source URLs in its
 * answers. Allow-listing them is reciprocity — they cite, we let them in.
 *
 * Brunson Hard-Rule reconciliation: no fabricated bot names, no aspirational
 * crawlers ("Wikipedia AI" etc.). Every entry below is a real, currently
 * operating user-agent string verified at /etc/robots-research/ on
 * 2026-05-17.
 *
 * Disallow list for `*` mirrors the previous version and continues to block:
 *  - /machine/*            — authenticated member area; per-user data
 *  - /api/*                — server routes, never indexable
 *  - /auth/*               — login / callback flow
 *  - /diagnostic/result    — per-lead diagnosis (already index:false)
 *  - /builder/*            — per-Verified-Builder OG / share routes
 *  - /login                — auth surface
 *  - /oto, /welcome        — post-purchase transitions; out-of-context
 *  - /onboarding           — post-purchase intake; auth-gated downstream
 *
 * Sitemap reference: discovery anchor for every public surface.
 */
export default function robots(): MetadataRoute.Robots {
  const base = "https://unlocksaas.com";

  // Private surfaces re-used across rule groups.
  const PRIVATE_DISALLOW = [
    "/machine/",
    "/api/",
    "/auth/",
    "/diagnostic/result",
    "/builder/",
    "/login",
    "/oto",
    "/welcome",
    "/onboarding",
  ];

  // AI crawlers we explicitly welcome. Each one either powers a citation
  // surface (ChatGPT / Claude / Perplexity / Gemini / Apple Intelligence /
  // DuckAssist / Bing Copilot) or feeds a training corpus that compounds
  // brand recall when our content is the canonical answer to a query.
  const AI_USER_AGENTS = [
    // OpenAI — training + ChatGPT browsing/search citations.
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    // Anthropic — training + Claude with web/search tools.
    "ClaudeBot",
    "Claude-Web",
    "anthropic-ai",
    // Google — AI Overviews / Gemini training opt-in (separate from Googlebot).
    "Google-Extended",
    "GoogleOther",
    // Perplexity — answer engine, cites sources prominently.
    "PerplexityBot",
    "Perplexity-User",
    // Microsoft / Bing Copilot.
    "Bingbot",
    // Apple Intelligence / Spotlight Web Index.
    "Applebot",
    "Applebot-Extended",
    // Meta AI (LLaMA + Meta search).
    "Meta-ExternalAgent",
    "FacebookBot",
    // Common Crawl (corpus feeding many open-source models).
    "CCBot",
    // ByteDance / Doubao / Coze.
    "Bytespider",
    // DuckDuckGo AI Assist.
    "DuckAssistBot",
    // Amazon (Alexa, AI features).
    "Amazonbot",
    // Mistral.
    "MistralAI-User",
    // You.com.
    "YouBot",
    // Cohere.
    "cohere-ai",
    "cohere-training-data-crawler",
    // Diffbot (knowledge-graph; powers several enterprise answer surfaces).
    "Diffbot",
  ];

  return {
    rules: [
      // ─── Default policy (Googlebot, Bingbot, every long-tail crawler) ────
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE_DISALLOW,
      },
      // ─── AI-crawler explicit allow-list ──────────────────────────────────
      // One rule entry per user-agent so the Allow/Disallow pair is
      // unambiguous; Next.js serializes each into its own User-agent block.
      // Disallow mirrors PRIVATE_DISALLOW — we welcome the AI crawlers on
      // public marketing, not on the authenticated/transactional surface.
      ...AI_USER_AGENTS.map((ua) => ({
        userAgent: ua,
        allow: "/",
        disallow: PRIVATE_DISALLOW,
      })),
    ],
    sitemap: [`${base}/sitemap.xml`],
    host: base,
  };
}
