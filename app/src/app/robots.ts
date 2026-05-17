import type { MetadataRoute } from "next";

/**
 * robots.txt for UnlockSaaS.
 *
 * Source: strategy/google-strategy.md §A.4 (classical organic) and §B
 * (AEO/GEO/AIO — AI crawler policy).
 *
 * Two-tier policy
 * ---------------
 * 1. Wildcard `*` rule covers Googlebot, Bingbot, DuckDuckBot, and the long
 *    tail of classical search crawlers. Public marketing surface is allowed;
 *    private surfaces are disallowed.
 * 2. Explicit allow rules for major AI crawlers. The wildcard rule already
 *    permits them implicitly, but several AI crawlers — GPTBot in particular,
 *    after a wave of large publishers blocked it in 2024 — check for a
 *    specific user-agent directive before crawling. Declaring an explicit
 *    `allow` is a positive signal of intent: "yes, this site wants to be
 *    cited by your model." Surface B of the strategy is built on this
 *    premise; an explicit allow makes the policy legible.
 *
 * AI crawlers covered (Q1 2026 list)
 * ----------------------------------
 *  - OpenAI:      GPTBot, ChatGPT-User, OAI-SearchBot
 *  - Anthropic:   ClaudeBot, Claude-Web, anthropic-ai
 *  - Perplexity:  PerplexityBot, Perplexity-User
 *  - Google AI:   Google-Extended (Bard / Gemini training opt-in signal)
 *  - Apple:       Applebot-Extended
 *  - Meta:        Meta-ExternalAgent, FacebookBot
 *  - ByteDance:   Bytespider
 *  - Mistral:     MistralAI-User
 *  - Cohere:      cohere-ai
 *  - DuckDuckGo:  DuckAssistBot
 *  - Diffbot:     Diffbot (web-scale knowledge graph)
 *  - Common Crawl: CCBot (training-data feeder for most open-source LLMs)
 *
 * Each AI crawler gets the same allow/disallow set as the wildcard rule —
 * the private surfaces are private for the same reason regardless of who
 * is crawling (per-user data, auth flows, post-purchase context).
 *
 * Private surface disallows
 * -------------------------
 *  - /machine/*           authenticated member area; per-user data
 *  - /api/*               server routes, never indexable
 *  - /auth/*              login / callback flow
 *  - /diagnostic/result   exposes a per-lead diagnosis (already index:false)
 *  - /builder/*           per-Verified-Builder OG / share routes (already index:false)
 *  - /login               auth surface
 *  - /oto, /welcome       post-purchase transitions; indexing them confuses the
 *                         cold-traffic narrative (the OTO has no context
 *                         outside the $1 purchase)
 *  - /onboarding          post-purchase intake; auth-gated downstream
 *
 * Sitemap reference points crawlers at sitemap.ts. llms.txt and llms-full.txt
 * are linked from the funnel hub `<head>` and discoverable via the
 * llmstxt.org convention; they sit on the same allowed root.
 */
export default function robots(): MetadataRoute.Robots {
  const base = "https://unlocksaas.com";

  const PRIVATE_PATHS = [
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

  // AI crawlers we explicitly want to cite us. See file header for the
  // taxonomy. The list is grouped by vendor for grep-ability.
  const AI_CRAWLER_USER_AGENTS = [
    // OpenAI
    "GPTBot",
    "ChatGPT-User",
    "OAI-SearchBot",
    // Anthropic
    "ClaudeBot",
    "Claude-Web",
    "anthropic-ai",
    // Perplexity
    "PerplexityBot",
    "Perplexity-User",
    // Google AI (separate from Googlebot — opt-in signal for Gemini training)
    "Google-Extended",
    // Apple Intelligence
    "Applebot-Extended",
    // Meta
    "Meta-ExternalAgent",
    "FacebookBot",
    // ByteDance (Doubao, TikTok in-app browse)
    "Bytespider",
    // Mistral
    "MistralAI-User",
    // Cohere
    "cohere-ai",
    // DuckDuckGo AI
    "DuckAssistBot",
    // Diffbot (knowledge graph)
    "Diffbot",
    // Common Crawl — feeds most open-source training datasets
    "CCBot",
  ];

  return {
    rules: [
      // Wildcard rule — covers classical search engines and any AI crawler
      // not in the explicit list below.
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      // Explicit AI-crawler rules — same allow/disallow set, but the named
      // user-agent declaration signals intent. AI crawlers that look up
      // their own user-agent string find an explicit policy rather than
      // falling back to the wildcard.
      ...AI_CRAWLER_USER_AGENTS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: PRIVATE_PATHS,
      })),
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
