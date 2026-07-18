import type { MetadataRoute } from "next";
import { localesWithApprovedContent } from "@/lib/i18n/registry";

/**
 * robots.txt for UnlockSaaS — Surface A (crawl) + Surface B (AEO/GEO) policy.
 *
 * Source: strategy/google-strategy.md §A.4 (crawl) and §B.1 (AI-crawler policy).
 * Updated: 2026-05-21 -- purpose-based AI bot split (search/answer vs. training)
 *
 * Five rule groups:
 *   1. `*`               -- every crawler (Google, Bing, Yandex, etc.). Public
 *                          marketing surfaces allowed; private/auth/api blocked.
 *   2. AI search/answer  -- explicit Allow for crawlers that power citation
 *                          surfaces (ChatGPT, Claude search/user fetch, Perplexity, DuckAssist,
 *                          Mistral, You.com, Cohere inference, GoogleOther).
 *                          Distribution > scrape-protection for a pre-revenue
 *                          SaaS where AI-answer citation IS the channel.
 *   3. AI training       -- explicit Allow (public content) for model-training
 *                          crawlers (ClaudeBot, GPTBot, Google-Extended, CCBot,
 *                          Bytespider, Meta, Apple-Extended, Amazon,
 *                          Cohere-training, Diffbot). 2026-07-18: reversed from
 *                          a Disallow block to fully-open per owner decision;
 *                          /ai.txt and /.well-known/ai-policy.json updated to
 *                          match so no surface contradicts the other.
 *   4. Indie search      -- explicit Allow for Brave, Mojeek, Marginalia, Kagi.
 *                          Tiny share each, but the demographic they index
 *                          matches the UnlockSaaS buyer profile exactly.
 *   5. Bad-actor         -- reserved for scrapers with no retrieval surface;
 *                          none currently needed beyond group 3.
 *
 * Training policy history
 * -----------------------
 * 2026-05-21: blocked training-only crawlers to steer crawl budget toward
 *   citation bots (search/answer visibility was the only lever driving
 *   measurable traffic at the time).
 * 2026-07-18 (current): REVERSED to fully-open. Every AI crawler — citation
 *   AND training — is allowed on public content. Rationale: near-term citation
 *   visibility was never at risk (those bots were always allowed), and for a
 *   brand with little third-party footprint, letting our own pages into
 *   training corpora is a real long-game lever (unprompted brand recall in
 *   ChatGPT/Claude/Gemini). Crawl-budget cost is negligible at this size.
 *   /ai.txt + /.well-known/ai-policy.json were updated in the same change.
 *
 * Full machine-readable AI policy: /.well-known/ai-policy.json
 * Spawning opt-out declaration:    /ai.txt
 *
 * Brunson Hard-Rule reconciliation: no fabricated bot names, no aspirational
 * crawlers. Every entry is either a documented current user-agent or an
 * explicitly labelled legacy/undocumented fallback that is blocked.
 *
 * Disallow list for `*` blocks:
 *  - /api/*              -- server routes, never indexable
 *  - /auth/*             -- login / callback flow
 *  - /diagnostic/result  -- per-lead diagnosis (already index:false)
 *  - /login              -- auth surface
 *  - /oto, /welcome      -- post-purchase transitions; out-of-context
 *  - /onboarding         -- post-purchase intake; auth-gated downstream
 *
 * 2026-07-18: /playbook/ removed from disallow list — the /playbook page is a
 * public marketing landing page ("Your First Paying Customer in 60 Days"), not
 * an authenticated area. AI bots should be able to crawl it for AEO citations.
 *
 * Verified Builder strategy update (2026-05-18)
 * ---------------------------------------------
 * The canonical /builder/<slug> page is INDEXABLE -- the cross-domain
 * Review JSON-LD citation chain requires it. Only the per-builder tool
 * sub-routes (embed-code helper, SVG badge, review.json, oembed, OG
 * image, /snippets) are blocked to prevent duplicate-intent results.
 *
 * Sitemap reference: discovery anchor for every public surface.
 */
export default function robots(): MetadataRoute.Robots {
  const base = "https://unlocksaas.com";

  // Private surfaces (en-US canonical paths). Locale variants are
  // appended below for every locale with at least one approved
  // translation — defence-in-depth so private subtrees are blocked under
  // every advertised locale prefix.
  //
  // /builder/<slug> is INDEXABLE (see header comment, Verified Builder
  // strategy update). Only the per-builder tool / machine sub-routes are
  // blocked — those carry off-site consumption semantics, not editorial
  // ranking content. robots.txt wildcards (`*`) are honored by Googlebot,
  // Bingbot, Yandex, Applebot, and every AI crawler we allow-list below
  // per RFC 9309 §2.2.
  const PRIVATE_DISALLOW_CANONICAL = [
    "/api/",
    "/auth/",
    "/diagnostic/result",
    // Verified-Builder tool sub-routes — not the canonical /builder/<slug>.
    // /snippets replaces /embed (2026-05-21 cacheComponents re-enable: the
    // /embed/page.tsx and /embed.html/route.ts paths collided at static
    // export step — Next wrote /embed.html/index.html and the route handler
    // tried to write /embed.html as a file. Renaming the helper page
    // resolves the conflict; the iframe HTML at /embed.html stays).
    "/builder/*/snippets",
    "/builder/*/embed.html",
    "/builder/*/badge.svg",
    "/builder/*/review.json",
    "/builder/*/oembed.json",
    "/builder/*/opengraph-image",
    "/login",
    "/oto",
    // OTO chain children (Brunson audit Action #4 stack). Same "no context
    // outside the $1 purchase" rationale as /oto itself.
    "/oto/vault",
    "/oto/cold-emails",
    "/oto/lifetime",
    "/welcome",
    "/onboarding",
    // Affiliate-tracking redirects (2026-05-21 GSC audit fix).
    // /r/<code> 302-redirects to /diagnostic with attribution params.
    // Verified Builders share these on social + their own founder sites,
    // so Googlebot discovers them via backlinks even though we never link
    // to them from owned surfaces. Without this Disallow they appear as
    // "Page with redirect" in Search Console — every affiliate code Google
    // crawls is one indexing-budget waste, and the redirect chain ends at
    // /diagnostic anyway (which is the canonical landing surface and
    // already indexed). Blocking /r/* applies to EVERY crawler (web + AI)
    // because affiliate redirects carry no editorial content for any
    // retriever — they're a UTM-attribution mechanism, not a citable page.
    "/r/",
  ];

  // Web-search-only disallow (Googlebot, Bingbot, etc.) — kept SEPARATE
  // from PRIVATE_DISALLOW_CANONICAL because these paths are first-class
  // discovery surfaces for AI retrievers and must NOT be blocked under the
  // AI / indie-search user-agent rules below.
  //
  // /*.md (2026-05-21 GSC audit fix):
  //   Every pSEO HTML page advertises its markdown mirror via
  //     <link rel="alternate" type="text/markdown" href="/foo.md" />
  //   Googlebot follows alternate links during discovery and crawls /foo.md,
  //   which serves the SAME body content with a Link: rel="canonical"
  //   pointing back to /foo (the HTML page). Google then reports it as
  //   "Alternative page with proper canonical tag" — accurate but wasted
  //   crawl budget. The markdown mirror exists for AI retrievers
  //   (Perplexity, Claude-SearchBot / Claude-User, OAI-SearchBot,
  //   ChatGPT-User, GoogleOther) discovered via /llms.txt, not
  //   for the HTML web index. Web crawlers see /foo (HTML); AI crawlers
  //   see /foo.md (same content, machine-friendlier shape).
  //
  // robots.txt wildcard semantics per RFC 9309 §2.2.2: `/*.md` matches any
  // URL path containing `.md`. Trailing `$` anchors end-of-URL so we don't
  // accidentally block `/foo.md.html` (none exist, but defence-in-depth).
  const WEB_INDEX_ONLY_DISALLOW_CANONICAL = ["/*.md$"];

  // Locales with at least one approved translation get their private
  // subtree mirrored. Locales with zero approved content are NOT mentioned
  // at all — advertising an unbuilt subtree would invite crawlers into a
  // 404 graveyard.
  const ACTIVE_LOCALES = localesWithApprovedContent();
  const PRIVATE_DISALLOW = [
    ...PRIVATE_DISALLOW_CANONICAL,
    ...ACTIVE_LOCALES.flatMap((loc) =>
      PRIVATE_DISALLOW_CANONICAL.map((p) => `/${loc}${p}`),
    ),
  ];

  // Indie / non-Google search engines. Tiny share each, but the demographic
  // they index for — technically-literate solo founders, indie-hacker /
  // small-web sensibility, deliberate Google-alternative usage — is exactly
  // the UnlockSaaS buyer profile. Allow-listing them costs nothing on
  // crawl-budget terms (each crawls at very low frequency) and converts a
  // slice of traffic that Google's index will never surface for us.
  //
  // Verified bot tokens — each traced to the engine's own robots.txt /
  // crawler help page, 2026-05-21:
  //   - Bravebot              search.brave.com/help/brave-search-crawler
  //   - MojeekBot             www.mojeek.com/bot.html
  //   - search.marginalia.nu  about.marginalia-search.com/article/crawler/
  //   - Kagibot               kagi.com/bot (runs own crawler; falls back to
  //                           Googlebot directives if no Kagibot rule given)
  //
  // None of these four participate in IndexNow as of 2026-05-21. Discovery
  // is passive (sitemap-driven for Mojeek + Brave; manual PR for Marginalia
  // via MarginaliaSearch/submit-site-to-marginalia-search; manual form for
  // Brave at search.brave.com/submit-url). Kagi Small Web does NOT accept
  // commercial SaaS — UnlockSaaS is ineligible by their stated criteria and
  // we do not submit there. See strategy/indie-search-submission-playbook.md.
  const INDIE_SEARCH_USER_AGENTS = [
    "Bravebot",
    "MojeekBot",
    "search.marginalia.nu",
    "Kagibot",
  ];

  // AI crawlers that power search, retrieval, or answer-engine citation.
  // Each bot below links back to the source URL in its answers, driving
  // real referral traffic and brand recall. Allow on public marketing,
  // block on private/transactional surfaces.
  //
  const AI_SEARCH_ANSWER_USER_AGENTS = [
    // OpenAI -- ChatGPT browsing and search-surface crawlers.
    "OAI-SearchBot",
    "ChatGPT-User",
    // Anthropic -- search-result quality indexing and user-triggered fetches.
    // ClaudeBot is the model-training crawler and belongs in the block-list.
    "Claude-SearchBot",
    "Claude-User",
    // Google -- AI Overviews fetch and Gemini inference (not training).
    "GoogleOther",
    // Perplexity -- answer engine, cites sources with live URLs.
    "PerplexityBot",
    "Perplexity-User",
    // Apple Intelligence / Spotlight Web Index (search, not training).
    "Applebot",
    // DuckDuckGo AI Assist -- cites source URLs in answers.
    "DuckAssistBot",
    // Mistral inference.
    "MistralAI-User",
    // You.com answer engine.
    "YouBot",
    // Cohere inference (NOT the training-data crawler; see block-list).
    "cohere-ai",
  ];

  // AI model-training crawlers. As of 2026-07-18 these are FULLY ALLOWED on
  // public content (owner decision: reversed the 2026-05-21 training opt-out to
  // maximise long-term training-data presence — the compounding "unprompted
  // brand recall" lever). They still respect PRIVATE_DISALLOW, so auth /
  // transactional / API surfaces stay out of every corpus. The paired /ai.txt
  // and /.well-known/ai-policy.json were updated in the same change so no
  // surface emits a contradictory training-opt-out signal.
  const AI_TRAINING_USER_AGENTS = [
    // Anthropic ClaudeBot -- model-development crawl; Claude-SearchBot and
    // Claude-User remain allowed for citation/retrieval surfaces.
    "ClaudeBot",
    // Legacy/undocumented Anthropic tokens. Deny until Anthropic documents a
    // non-training citation role for them.
    "Claude-Web",
    "anthropic-ai",
    // OpenAI GPTBot -- training corpus only; ChatGPT-User is the citation UA.
    "GPTBot",
    // Google-Extended -- Google AI training; separate from Googlebot search.
    "Google-Extended",
    // Apple AI training (distinct from Applebot search/Spotlight).
    "Applebot-Extended",
    // Meta AI training crawlers.
    "Meta-ExternalAgent",
    "FacebookBot",
    // Common Crawl -- open corpus for training open-weight models.
    "CCBot",
    // ByteDance training crawler (Doubao / Coze AI stack).
    "Bytespider",
    // Amazon Alexa AI training.
    "Amazonbot",
    // Cohere training-specific crawler.
    "cohere-training-data-crawler",
    // Diffbot -- knowledge-graph training; no answer citation surface here.
    "Diffbot",
  ];

  return {
    rules: [
      // ── Default policy (Googlebot, Bingbot, every long-tail crawler) ─────
      // PRIVATE_DISALLOW + WEB_INDEX_ONLY: the web-index disallow is added
      // here only, NOT under the AI / indie blocks below, because /*.md is
      // the AI-retriever discovery surface for those user-agents. Googlebot
      // (the web crawler, distinct from Google-Extended which is in the
      // training block-list) follows <link rel="alternate" type="text/markdown">
      // during HTML crawl, lands on /foo.md, and reports it as "Alternative
      // page with proper canonical tag" in Search Console -- blocking here
      // breaks the discovery loop without affecting AEO citations.
      {
        userAgent: "*",
        allow: "/",
        disallow: [...PRIVATE_DISALLOW, ...WEB_INDEX_ONLY_DISALLOW_CANONICAL],
      },
      // ── AI search/answer explicit allow-list ─────────────────────────────
      // One rule entry per user-agent for an unambiguous Allow/Disallow pair.
      // Next.js serialises each into its own User-agent block. Disallow
      // mirrors PRIVATE_DISALLOW: public marketing yes; auth/transactional no.
      ...AI_SEARCH_ANSWER_USER_AGENTS.map((ua) => ({
        userAgent: ua,
        allow: "/",
        disallow: PRIVATE_DISALLOW,
      })),
      // ── AI training crawlers — explicit allow-list (2026-07-18) ───────────
      // Fully open on public content; same private/transactional disallow as
      // every other allowed bot. Reversed from the prior training block so
      // UnlockSaaS content can also seed model-training corpora (long-game
      // brand recall), not just live citation surfaces.
      ...AI_TRAINING_USER_AGENTS.map((ua) => ({
        userAgent: ua,
        allow: "/",
        disallow: PRIVATE_DISALLOW,
      })),
      // ── Indie-search explicit allow-list ─────────────────────────────────
      // Brave, Mojeek, Marginalia, Kagi. Public marketing allowed;
      // authenticated/transactional blocked.
      ...INDIE_SEARCH_USER_AGENTS.map((ua) => ({
        userAgent: ua,
        allow: "/",
        disallow: PRIVATE_DISALLOW,
      })),
    ],
    sitemap: [`${base}/sitemap.xml`],
    host: base,
  };
}
