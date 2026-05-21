import type { MetadataRoute } from "next";
import { localesWithApprovedContent } from "@/lib/i18n/registry";

/**
 * robots.txt for UnlockSaaS — Surface A (crawl) + Surface B (AEO/GEO) policy.
 *
 * Source: strategy/google-strategy.md §A.4 (crawl) and §B.1 (AI-crawler policy).
 *
 * Four rule groups:
 *   1. `*`           — every crawler (Google, Bing, Yandex, etc.). Public
 *                      marketing surfaces allowed; private/auth/api blocked.
 *   2. AI training   — explicit Allow for the AI crawlers UnlockSaaS WANTS
 *                      to be cited by (Perplexity, Anthropic, OpenAI,
 *                      Google AI Overviews, Apple, ByteDance, Meta, CCBot,
 *                      DuckAssist, Amazon, Mistral). Distribution > scrape
 *                      protection for a pre-revenue founder-tools SaaS where
 *                      AI-answer citation IS the channel.
 *   3. Indie search  — explicit Allow for Brave, Mojeek, Marginalia, Kagi.
 *                      Tiny absolute share, but the demographic they index
 *                      for matches the UnlockSaaS buyer profile (founders
 *                      who deliberately use Google alternatives).
 *   4. Bad-actor     — block the scrapers that take content without driving
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
 * Disallow list for `*` continues to block:
 *  - /playbook/*            — authenticated member area; per-user data
 *  - /api/*                — server routes, never indexable
 *  - /auth/*               — login / callback flow
 *  - /diagnostic/result    — per-lead diagnosis (already index:false)
 *  - /login                — auth surface
 *  - /oto, /welcome        — post-purchase transitions; out-of-context
 *  - /onboarding           — post-purchase intake; auth-gated downstream
 *
 * Verified Builder strategy update (2026-05-18)
 * ---------------------------------------------
 * The canonical /builder/<slug> page is INDEXABLE — it must be, or the
 * cross-domain Review JSON-LD citation chain breaks. When a verified
 * founder embeds the badge on their own site with the supplied Review
 * JSON-LD, the `itemReviewed.@id` resolves to the unlocksaas Playbook;
 * Google validates that citation by crawling the canonical page named in
 * the founder's anchor. Blocking /builder/* would invalidate every embed.
 *
 * What we DO block under /builder/<slug>/ are the tool / machine
 * sub-routes (the embed-code helper UI, the SVG image asset, the JSON-LD
 * payload, the iframe HTML, the oEmbed discovery JSON, and the auto-
 * generated OG image). These exist for off-site consumption; indexing
 * them would create duplicate-intent results competing with the canonical
 * badge page for the same query.
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
    "/playbook/",
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
  //   (Perplexity, Claude, GPT, AI Overviews via Google-Extended which is
  //   distinct from Googlebot's web index) discovered via /llms.txt, not
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
      // PRIVATE_DISALLOW + WEB_INDEX_ONLY: the web-index disallow is added
      // here only, NOT under the AI / indie blocks below, because /*.md is
      // the AI-retriever discovery surface for those user-agents. Googlebot
      // (the web crawler, distinct from Google-Extended which is in
      // AI_USER_AGENTS) follows <link rel="alternate" type="text/markdown">
      // during HTML crawl, lands on /foo.md, and reports it as "Alternative
      // page with proper canonical tag" in Search Console — blocking here
      // breaks the discovery → flag loop without affecting AEO citations.
      {
        userAgent: "*",
        allow: "/",
        disallow: [...PRIVATE_DISALLOW, ...WEB_INDEX_ONLY_DISALLOW_CANONICAL],
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
      // ─── Indie-search explicit allow-list ────────────────────────────────
      // Brave, Mojeek, Marginalia, Kagi. Same Allow/Disallow shape as the
      // AI block — public marketing yes, authenticated/transactional no.
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
