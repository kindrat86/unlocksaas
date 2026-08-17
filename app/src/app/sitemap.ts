import type { MetadataRoute } from "next";
import { ALTERNATIVE_SLUGS } from "@/lib/alternatives";
import { TEARDOWN_SLUGS } from "@/lib/funnel-teardowns";
import { PRICING_TEARDOWN_SLUGS } from "@/lib/pricing-teardowns";
import { POST_MORTEM_SLUGS } from "@/lib/post-mortems";
import { COMPARISON_SLUGS } from "@/lib/comparisons";
import { CATEGORY_SLUGS } from "@/lib/categories";
import { PRESS_TOPIC_SLUGS } from "@/lib/press-topics";
import { GLOSSARY_SLUGS } from "@/lib/glossary";
import { WHY_ISNT_MY_SLUGS } from "@/lib/why-isnt-my";
import { NICHE_SLUGS } from "@/lib/niches";
import { PARTNER_SLUGS } from "@/lib/partners";
import { STACK_SLUGS } from "@/lib/stacks";
import { STACK_SLUGS as STACK_CATALOG_SLUGS } from "@/lib/stacks-catalog";
import { CITY_SLUGS } from "@/lib/founders-in";
import { LAUNCH_CHECKLIST_SLUGS } from "@/lib/launch-checklists";
import { BENCHMARK_SLUGS } from "@/lib/benchmarks";
import { FUNNEL_PLAYBOOK_SLUGS } from "@/lib/funnel-playbooks";
import { FUNNEL_MATRIX_SLUGS } from "@/lib/funnel-playbook-matrix";
import { ANSWER_SLUGS } from "@/lib/answers";
import { SHOULD_I_SLUGS } from "@/lib/should-i";
import { SCRIPT_SLUGS } from "@/lib/scripts";
import { PRICING_PAGE_PATTERN_SLUGS } from "@/lib/pricing-page-examples";
import { CONVERSION_RATE_SLUGS } from "@/lib/conversion-rate";
import { SWIPE_FILE_SLUGS } from "@/lib/swipe-files";
import { OUTCOME_SLUGS } from "@/lib/outcomes";
import { MCP_TOOL_SLUGS } from "@/lib/mcp-tools";
import { TOOL_SLUGS } from "@/lib/tools-catalog";
import { COHORT_SLUGS } from "@/lib/cohorts";
import { CASE_STUDY_SLUGS } from "@/lib/case-studies";
import { HOW_TO_SLUGS } from "@/lib/how-to";
import { MISTAKE_SLUGS } from "@/lib/mistakes";
import { EDITION_YEARS_DESC } from "@/lib/state-of-saas";
import { PODCAST_EPISODE_SLUGS } from "@/lib/seo/podcast";
import {
  FOUNDERS_DIARY_SLUGS,
  liveEpisodesWithTranscript,
} from "@/lib/youtube";
import { DIARY_DATES } from "@/lib/founder-diary";
import {
  allApprovedTranslations,
  approvedLocalesForPath,
} from "@/lib/i18n/registry";
import { localizedPath } from "@/lib/i18n/locales";
import { AUDIENCE_SLUGS } from "@/lib/audiences";
import { BUSINESS_TERM_SLUGS } from "@/lib/business-terms";
import { CHECKLIST_SLUGS } from "@/lib/checklists";
import { EXPERIMENT_SLUGS } from "@/lib/experiments";
import { FOUNDER_MISTAKE_SLUGS } from "@/lib/founder-mistakes";
import { JOURNEY_SLUGS } from "@/lib/journeys";
import { INTEGRATION_SLUGS } from "@/lib/integrations";
import { LAUNCH_SLUGS } from "@/lib/launches";
import { MIGRATE_FROM_SLUGS } from "@/lib/migrate-from";
import { OBJECTION_SLUGS } from "@/lib/objections";
import { ONBOARDING_PATTERN_SLUGS } from "@/lib/onboarding-patterns";
import { POSITIONING_SLUGS } from "@/lib/positioning";
import { PRICING_MODEL_SLUGS } from "@/lib/pricing-models";
import { RETENTION_TACTIC_SLUGS } from "@/lib/retention-tactics";
import { SAAS_FEATURE_PATTERN_SLUGS } from "@/lib/saas-feature-patterns";
import { SAAS_METRIC_SLUGS } from "@/lib/saas-metrics";
import { SHOULD_I_BUILD_SLUGS } from "@/lib/should-i-build";
import { SKILL_SLUGS } from "@/lib/skills";
import { TEMPLATE_SLUGS } from "@/lib/templates";

/**
 * Sitemap for UnlockSaaS — Surface A of the Google strategy.
 *
 * Source: strategy/google-strategy.md §A.4. Lists only the public marketing
 * routes that should be indexable. Private surfaces (the member area, the
 * diagnostic result page that exposes per-user data, the per-builder OG
 * pages, the login flow, the entire API) are excluded by omission AND
 * confirmed non-indexable via per-page `robots: { index: false }` metadata.
 *
 * `lastModified` is set to the build time (via the inlined
 * `BUILD_TIMESTAMP` env constant defined in next.config.mjs), which is
 * fine for static marketing pages — the actual content changes are
 * infrequent and a build is the right cadence for "this page was updated."
 *
 * IMPORTANT: do NOT change `now` back to a bare `new Date()`. Under Next 16
 * Cache Components, `new Date()` is a request-time dynamic API: it forced
 * the whole sitemap route to render dynamically and uncached, so every
 * crawl stamped all ~780 URLs with the current request time (a lastmod that
 * is always "now" trains crawlers to ignore the signal). The build-time
 * constant keeps lastmod stable between deploys and keeps the route
 * statically cacheable. See the next.config.mjs `env` block for detail.
 *
 * Programmatic surface (added 2026-05-17): /alternatives-to (hub) and each
 * /alternatives-to/[slug] page are generated from src/lib/alternatives.ts.
 * Adding a new entry to that catalog auto-extends this sitemap on the next
 * build. The pages are honest named-competitor comparisons, not invented
 * keyword bait — every slug corresponds to a real product the canonical
 * audience already searches for.
 *
 * Brunson Hard-Rule reconciliation: every URL listed here passes the
 * "would the SEO-addicted version of the founder approve" check from
 * strategy/google-strategy.md §AC-flaw reconciliation. They are the same
 * pages that already convert organically; we are not inventing keyword
 * landing pages.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://unlocksaas.com";
  // Build-time constant, inlined by next.config.mjs `env.BUILD_TIMESTAMP`.
  // NOT `new Date()` — see the file header note (Cache Components dynamic-
  // render trap that made every crawl stamp all URLs with the request time).
  const now = new Date(
    process.env.BUILD_TIMESTAMP ?? "2026-07-18T00:00:00.000Z",
  );

  /**
   * Image sitemap helper – returns the best OG image URL for a path.
   *
   * Next.js file-based metadata convention (app/<route>/opengraph-image.tsx)
   * auto-generates a PNG route at `<base>/<route>/opengraph-image`. The
   * MetadataRoute.Sitemap `images?: string[]` field on each entry then
   * emits `<image:image><image:loc>…</image:loc></image:image>` blocks
   * per Google's image sitemap spec, which lifts Google Images discovery
   * (audit gap: 2026-05-20 SEO/pSEO audit, "no image sitemap").
   *
   * Routes WITH a dedicated opengraph-image.tsx serve that route's own
   * card; routes WITHOUT one inherit the root card via Next.js's nearest-
   * ancestor resolution, but the dedicated URL only exists when the file
   * exists – so for non-dedicated routes we must point image:loc at the
   * root `/opengraph-image` instead of fabricating a per-path URL that
   * would 404.
   *
   * Keep this list in sync with the on-disk inventory of
   * `opengraph-image.tsx` files. Adding a new dedicated card = add the
   * matching pattern below in the same commit.
   *
   * Per-locale dedicated cards under `/{locale}/{path}/opengraph-image`
   * (added 2026-05-20 for /faq, /contact, /repeatable, /editorial-policy
   * × es, pt-BR) are wired in the approvedTranslations block at the
   * bottom of the sitemap, not here – this helper handles canonical
   * (en-US) routes only.
   */
  const DEDICATED_OG_HUBS: ReadonlySet<string> = new Set([
    "/glossary",
    "/dont-buy-unlock-saas",
    "/four-indie-search-engines",
    "/state-of-saas",
    // /tools – free SaaS calculator hub (2026-05-22 editorial-backlink
    // play). Dedicated card surfaces the headline "five calculators,
    // no email gate" claim that earns the share.
    "/tools",
  ]);
  const DEDICATED_OG_DETAIL_PATTERNS: ReadonlyArray<RegExp> = [
    /^\/alternatives-to\/[^/]+$/,
    /^\/vs\/[^/]+$/,
    /^\/glossary\/[^/]+$/,
    /^\/funnel-teardown\/[^/]+$/,
    /^\/pricing-teardown\/[^/]+$/,
    /^\/press\/topics\/[^/]+$/,
    // Canonical (en-US) benchmark detail cards added 2026-05-21 after
    // the audit flagged that /benchmarks/<slug> – the highest-AEO-
    // intent surface on the site – inherited the root OG fallback when
    // shared on Twitter / X / LinkedIn. Card files now live at
    // app/src/app/(marketing)/benchmarks/[slug]/opengraph-image.tsx
    // and surface the metric H1 + SEO meta description, matching the
    // shape the /es/benchmarks/<slug> and /pt-BR/benchmarks/<slug>
    // cards already used. The en-US asymmetry the locale-card comment
    // flagged as a follow-up is closed in the same commit.
    /^\/benchmarks\/[^/]+$/,
    // Annual report editions ship per-year OG cards under
    // app/src/app/state-of-saas/[year]/opengraph-image.tsx — the card
    // surfaces the headline figure (or cohort-progress when below
    // MIN_REPORT_N) so a reader scrolling Twitter / LinkedIn sees the
    // number without clicking. Pattern matches /state-of-saas/2026,
    // /state-of-saas/2027, etc.
    /^\/state-of-saas\/\d{4}$/,
    // /tools/<slug> – per-calculator dedicated cards (LTV, churn cost,
    // revenue projector, CAC payback, pricing power). Each card surfaces
    // its own headline + formula tagline so X / LinkedIn / Bluesky share
    // previews don't collapse into the hub card.
    /^\/tools\/[^/]+$/,
    // /builder/[slug] + /diagnosis/[id] also carry dedicated cards but
    // they are NOT sitemap-listed (Verified Builder backlink farm
    // discovery via inbound links only; diagnosis pages are per-user
    // and noindex). Patterns omitted from this list intentionally.
  ];
  const rootOg = `${base}/opengraph-image`;
  /**
   * Image sitemap helper (2026-07-28 GSC fix — simplified).
   *
   * PREVIOUSLY this function generated per-path OG image URLs like
   * `/alternatives-to/notion/opengraph-image`. But Next.js routes that use
   * `generateImageMetadata` serve their images at build-hash-suffixed URLs
   * (e.g. `/alternatives-to/notion/opengraph-image-1pxfoj/card?fafa8afa711c9562`).
   * The bare `/opengraph-image` URLs all returned 404, and the hash-suffixed
   * URLs from a prior deploy returned 500 after the next build changed the
   * hash. This caused GSC "Blocked due to other 4xx issue" on every image
   * sitemap entry.
   *
   * FIX: point every image sitemap entry at the root `/opengraph-image`,
   * which is a stable, always-200 route. Per-page OG images are still
   * discovered by crawlers via the `<meta property="og:image">` tag in
   * each page's HTML — the image sitemap is a secondary discovery channel,
   * not the primary one.
   */
  const ogImageFor = (_urlPath: string): string => rootOg;

  /**
   * Per-URL hreflang map, READ FROM THE TRANSLATION REGISTRY.
   *
   * Brunson Hard-Rule (no fabricated claims) requires that hreflang
   * alternates only resolve to approved translations. The registry at
   * src/lib/i18n/registry.ts is the single source of truth.
   *
   * The helper always declares en-US + x-default, then adds one entry
   * per APPROVED translation of the same canonical path. Pending or
   * archived rows are silently skipped — they are not advertised.
   *
   * Honest-monolingual fallback: when no translation is approved, output
   * is byte-identical to the previous {"en-US": url, "x-default": url} map.
   */
  /**
   * Hubs whose approval applies to every detail slug under them. Detail
   * paths (`/glossary/big-domino`, `/benchmarks/saas-churn-rate`, …)
   * have no exact registry row; the founder approved the hub once and
   * the underlying translation file (glossary.es.ts, benchmarks.es.ts)
   * carries every slug. Keep this list aligned with the constant of
   * the same intent in src/lib/seo/markdown-alternates.ts so the
   * sitemap hreflang map matches the canonical-page hreflang map.
   */
  /**
   * 2026-05-21 audit fix #3 – plumbing-only expansion. Before this
   * commit, only /glossary and /benchmarks declared that hub-level
   * approval applies to every detail slug under them. The other ten
   * pSEO hubs each have a /[locale]/<hub>/page.tsx + /[locale]/<hub>/
   * [slug]/page.tsx shell on disk (see the per-hub "pSEO surface
   * plumbing extension" log in src/lib/i18n/registry.ts) but the
   * inheritance map didn't list them, so when the founder later
   * approves, say, /es/alternatives-to, none of the 231 detail slugs
   * would auto-inherit and the registry would need 231 extra rows.
   *
   * Adding all 12 pSEO hubs here is safe-by-default: localesForPath()
   * falls back to approvedLocalesForPath(hub), which returns [] for
   * any hub without an approved row. No fabricated URLs ship; the
   * sitemap and hreflang map for those clusters stays byte-identical
   * until a real approval lands. The change is pure forward-
   * compatibility – the plumbing is ready when the translation work
   * is.
   *
   * Brunson Hard-Rule reconciliation: this is the structural
   * pre-wiring criterion from src/lib/seo/markdown-alternates.ts ("Add
   * a hub here when… The detail-page locale routes already exist
   * under app/src/app/[locale]/<hub>/[slug]/page.tsx"). All twelve
   * hubs now satisfy that criterion. None of them satisfy the
   * "translation file carries every child slug" criterion yet, but
   * that's an honest constraint enforced by the empty registry – not
   * a reason to leave the plumbing partial.
   */
  const HUBS_WITH_DETAIL_LOCALE_INHERITANCE: readonly string[] = [
    "/glossary",
    "/benchmarks",
    "/alternatives-to",
    "/vs",
    "/compare",
    "/funnel-teardown",
    "/pricing-teardown",
    "/category",
    "/for",
    "/funnel-playbook",
    "/answers",
    "/why-isnt-my",
    "/press/topics",
  ];
  /**
   * Hubs whose approved-locale detail slugs ship dedicated per-locale
   * per-slug OG cards under `app/src/app/[locale]/<hub>/[slug]/opengraph-image.tsx`.
   *
   * Keep this set in lockstep with the on-disk inventory of locale
   * opengraph-image.tsx routes. Adding a new (hub, locale) approval
   * pair to the translation registry does NOT automatically extend
   * this set — the matching route file must be shipped first. Listing
   * a hub here without the route would emit `image:loc` URLs in the
   * sitemap that 404, demoting Google Images discovery for the rest of
   * the batch.
   *
   * Activation log: 2026-05-20 audit fix #16 closed the per-locale
   * per-slug card gap for the two highest-AEO-intent approved-locale
   * subtrees (/es/glossary, /pt-BR/glossary, /es/benchmarks,
   * /pt-BR/benchmarks). Canonical (en-US) /benchmarks/[slug] does
   * NOT yet ship its own dedicated card and is tracked separately —
   * the post-pass at the bottom of this file routes en-US benchmark
   * detail rows through DEDICATED_OG_DETAIL_PATTERNS, which omits
   * /benchmarks until a card exists.
   */
  const HUBS_WITH_PER_LOCALE_DETAIL_OG: ReadonlySet<string> = new Set([
    "/glossary",
    "/benchmarks",
  ]);
  const localesForPath = (path: string) => {
    // Hub→detail locale inheritance DISABLED (2026-07-28 GSC fix).
    //
    // Previously, approving /es/glossary (the hub) made every English
    // /glossary/<slug> child page advertise hreflang alternates to
    // /es/glossary/<slug>, /pt-BR/glossary/<slug>, etc. But those
    // locale child pages serve ENGLISH content (no per-slug
    // translation files exist). Google crawled the hreflang targets,
    // found byte-identical English pages with self-referencing
    // canonicals, ignored them, and flagged all 72 as "Duplicate,
    // Google chose different canonical than user."
    //
    // Only advertise hreflang alternates for paths with their OWN
    // explicit approval row in the registry.
    return approvedLocalesForPath(path);
  };

  const hreflang = (absUrl: string) => {
    const path = absUrl.startsWith(base)
      ? absUrl.slice(base.length) || "/"
      : absUrl;
    const languages: Record<string, string> = {
      "en-US": absUrl,
      "x-default": absUrl,
    };
    for (const locale of localesForPath(path)) {
      languages[locale] = `${base}${localizedPath(path, locale)}`;
    }
    return { languages };
  };

  const entries: MetadataRoute.Sitemap = [
    // Funnel Hub — highest priority, brand-canonical entry point.
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
      alternates: hreflang(`${base}/`),
    },
    // Pain-mirror long-tail squeeze. Conversion event.
    {
      url: `${base}/diagnostic`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: hreflang(`${base}/diagnostic`),
    },
    // Reverse-squeeze long-form. Cold reader on Google long-tail lands here.
    {
      url: `${base}/stories`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: hreflang(`${base}/stories`),
    },
    // $1 Starter sales page. Solution-aware comparator.
    {
      url: `${base}/starter`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: hreflang(`${base}/starter`),
    },
    // Long-form $49 Playbook sales page. Product-aware decision page.
    {
      url: `${base}/playbook-sales`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: hreflang(`${base}/playbook-sales`),
    },
    // High-Ticket Application Funnel — Done-With-You Sprint ($997 / $1,997).
    // Rung 3 of the value ladder. Application-only; the /apply/qualified and
    // /apply/not-yet thank-you destinations are noindex by metadata and so
    // omitted from the sitemap.
    {
      url: `${base}/apply`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: hreflang(`${base}/apply`),
    },
    // Founding-Cohort PLF landing — state-dependent; while waitlist is open or
    // cart is open, this is a high-priority page. After cart-close it 404s or
    // redirects (per strategy/founding-plv-scripts.md), at which point this
    // entry should be removed by the cron task that flips the page state.
    {
      url: `${base}/founding`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: hreflang(`${base}/founding`),
    },
    // Cold-traffic bridge. Lands between Google paid problem-aware ads and
    // the diagnostic, but also indexable for problem-aware long-tail.
    {
      url: `${base}/bridge`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/bridge`),
    },
    // 14-Day First-Customer Sprint challenge funnel surface.
    {
      url: `${base}/challenge`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/challenge`),
    },
    // Rung-2 Repeatable Revenue surface (already index:true per its metadata).
    {
      url: `${base}/repeatable`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
      alternates: hreflang(`${base}/repeatable`),
    },
    // Standalone FAQ surface — AEO anchor page. Always-visible Q&A, sourced
    // verbatim from strategy/dollar-objections.md via src/lib/faq-data.ts.
    // Shares FAQ_ENTRIES with the sales-page accordion so schema and rendered
    // text never diverge. Featured-snippet and PAA target for objection-style
    // queries ("is unlock saas worth it", "$49 saas tool refund", etc.).
    {
      url: `${base}/faq`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/faq`),
    },
    // Glossary entry deferred to pSEO block #6 below, which lists the hub
    // and 16 detail-page slugs together. PR #32 originally inserted a hub-
    // only entry here; PR #33 extended it with the [slug] detail pages, so
    // both URLs ship from the same block at the bottom of the file.
    // ---------------------------------------------------------------------
    // Programmatic SEO block — honest named-competitor comparisons.
    // Data source: src/lib/alternatives.ts. Adding a new alternative there
    // auto-extends this block on the next build.
    // ---------------------------------------------------------------------
    // Hub page listing every comparison. Crawl entry for the pSEO block.
    {
      url: `${base}/alternatives-to`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/alternatives-to`),
    },
    // Per-alternative detail pages. Each is a static, Article+FAQPage+
    // BreadcrumbList-schema'd comparison of Unlock SaaS vs the named product.
    ...ALTERNATIVE_SLUGS.map((slug) => ({
      url: `${base}/alternatives-to/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/alternatives-to/${slug}`),
    })),
    // ---------------------------------------------------------------------
    // Programmatic SEO block #2 — funnel teardowns of indie SaaS.
    // Data source: src/lib/funnel-teardowns.ts. Adding a new teardown
    // there auto-extends this block on the next build. Each detail page
    // is Article + FAQPage + BreadcrumbList schema'd. The hub uses
    // CollectionPage schema.
    // ---------------------------------------------------------------------
    {
      url: `${base}/funnel-teardown`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/funnel-teardown`),
    },
    ...TEARDOWN_SLUGS.map((slug) => ({
      url: `${base}/funnel-teardown/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/funnel-teardown/${slug}`),
    })),
    // ---------------------------------------------------------------------
    // Programmatic SEO block #3 — pricing teardowns of indie SaaS.
    // Data source: src/lib/pricing-teardowns.ts. Same pattern as
    // funnel-teardown: Article + FAQPage + BreadcrumbList JSON-LD per
    // detail page, CollectionPage on the hub. Companies that appear in
    // both manifests get bidirectional cross-link callouts on each page.
    // ---------------------------------------------------------------------
    {
      url: `${base}/pricing-teardown`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/pricing-teardown`),
    },
    ...PRICING_TEARDOWN_SLUGS.map((slug) => ({
      url: `${base}/pricing-teardown/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/pricing-teardown/${slug}`),
    })),
    // ---------------------------------------------------------------------
    // Programmatic SEO block – post-mortems of failed SaaS and consumer
    // tech companies. Data source: src/lib/post-mortems.ts. Same shape
    // as funnel-teardown / pricing-teardown: Article + FAQPage +
    // BreadcrumbList JSON-LD per detail page, CollectionPage on the hub.
    // Hub groups by Brunson diagnosis (Wrong Person / Weak Offer /
    // Weak Belief), which differs from the category grouping used on
    // the funnel-teardown hub – this is the surface's pedagogical
    // signature, lets readers browse all "Weak Offer" failures as a
    // teaching unit.
    // ---------------------------------------------------------------------
    {
      url: `${base}/post-mortem`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/post-mortem`),
    },
    ...POST_MORTEM_SLUGS.map((slug) => ({
      url: `${base}/post-mortem/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/post-mortem/${slug}`),
    })),
    // ---------------------------------------------------------------------
    // Programmatic SEO block #3.7 — zero-to-first-customer case studies.
    // Data source: src/lib/case-studies.ts. Each page is a real founder
    // story about getting the first paying customer. Article JSON-LD per
    // detail page, CollectionPage on the hub.
    // ---------------------------------------------------------------------
    {
      url: `${base}/case-studies`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/case-studies`),
    },
    ...CASE_STUDY_SLUGS.map((slug) => ({
      url: `${base}/case-studies/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/case-studies/${slug}`),
    })),
    // ---------------------------------------------------------------------
    // Programmatic SEO block #3.8 — how-to guides for indie founders.
    // Data source: src/lib/how-to.ts. Each page is a step-by-step guide
    // with HowTo JSON-LD. Hub uses CollectionPage.
    // ---------------------------------------------------------------------
    {
      url: `${base}/how-to`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/how-to`),
    },
    ...HOW_TO_SLUGS.map((slug) => ({
      url: `${base}/how-to/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/how-to/${slug}`),
    })),
    // ---------------------------------------------------------------------
    // Programmatic SEO block #3.9 — indie SaaS mistakes to avoid.
    // Data source: src/lib/mistakes.ts. Each page catalogs a common mistake.
    // Article + FAQPage JSON-LD per detail page.
    // ---------------------------------------------------------------------
    {
      url: `${base}/mistakes`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/mistakes`),
    },
    ...MISTAKE_SLUGS.map((slug) => ({
      url: `${base}/mistakes/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/mistakes/${slug}`),
    })),
    // ---------------------------------------------------------------------
    // Programmatic SEO block #4 — head-to-head comparisons.
    // Data source: src/lib/comparisons.ts. Highest-intent SaaS-research
    // search class: "[A] vs [B]". Article + FAQPage + BreadcrumbList
    // JSON-LD per detail page. CollectionPage on the hub.
    // ---------------------------------------------------------------------
    {
      url: `${base}/vs`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/vs`),
    },
    ...COMPARISON_SLUGS.map((slug) => ({
      url: `${base}/vs/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/vs/${slug}`),
    })),
    // ---------------------------------------------------------------------
    // /compare URLs REMOVED from sitemap (2026-07-28 GSC fix).
    //
    // Every /compare URL 308-redirects to /vs (see redirects() in
    // next.config.mjs). Listing redirected URLs in the sitemap causes
    // GSC "Duplicate, Google chose different canonical than user" because
    // Google indexes the /vs canonical but the sitemap declares /compare.
    // The /vs entries below already cover all comparison content.
    // ---------------------------------------------------------------------
    // ---------------------------------------------------------------------
    // Programmatic SEO block #5 — category roundup pages.
    // Data source: src/lib/categories.ts. Each canonical category bucket
    // aggregates products and comparisons across all underlying manifests.
    // Pure data reuse — adding entries to the underlying manifests extends
    // the matching category page automatically on next build.
    // ---------------------------------------------------------------------
    {
      url: `${base}/category`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/category`),
    },
    ...CATEGORY_SLUGS.map((slug) => ({
      url: `${base}/category/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.55,
      alternates: hreflang(`${base}/category/${slug}`),
    })),
    // ---------------------------------------------------------------------
    // Programmatic SEO block #6 — Brunson glossary.
    // Data source: src/lib/glossary.ts. Pure definitional intent: targets
    // "what is X" / "X meaning" / "how do I use X" queries that LLMs and
    // Google AI Overviews aggressively cite. DefinedTerm + Article +
    // FAQPage + BreadcrumbList JSON-LD per detail page; CollectionPage +
    // DefinedTermSet + Dataset on the hub. Short definitions are read
    // from entity.DEFINED_TERMS at module load so the schema graph on `/`
    // and the glossary surface share one source of truth.
    // ---------------------------------------------------------------------
    {
      url: `${base}/glossary`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/glossary`),
    },
    ...GLOSSARY_SLUGS.map((slug) => ({
      url: `${base}/glossary/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/glossary/${slug}`),
    })),
    // ---------------------------------------------------------------------
    // Programmatic SEO block #7 — panic-mode element diagnostics.
    // Data source: src/lib/why-isnt-my.ts. Targets "why isn't my X
    // converting" – the highest commercial intent search the ICP makes.
    // Article + FAQPage + BreadcrumbList JSON-LD per detail page.
    // ---------------------------------------------------------------------
    {
      url: `${base}/why-isnt-my`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.65,
      alternates: hreflang(`${base}/why-isnt-my`),
    },
    ...WHY_ISNT_MY_SLUGS.map((slug) => ({
      url: `${base}/why-isnt-my/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.55,
      alternates: hreflang(`${base}/why-isnt-my/${slug}`),
    })),
    // ---------------------------------------------------------------------
    // Programmatic SEO block #8 — niche / cohort pages.
    // Data source: src/lib/niches.ts. Targets "[product] for [niche]"
    // and identity-shaped searches. Article + FAQPage + BreadcrumbList
    // JSON-LD per detail page.
    // ---------------------------------------------------------------------
    {
      url: `${base}/for`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/for`),
    },
    ...NICHE_SLUGS.map((slug) => ({
      url: `${base}/for/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/for/${slug}`),
    })),
    // ---------------------------------------------------------------------
    // Programmatic SEO block #8a — geo founder-community landers.
    // Data source: src/lib/founders-in.ts. /founders-in is the hub;
    // /founders-in/<city> ships one Article + Place + BreadcrumbList
    // page per city. 25 cities at launch (Americas / Europe / Asia-
    // Pacific). Targets the long-tail "saas founders in <city>" search
    // shape that compounds at cluster scale even at low per-city volume.
    // Isenberg-overlay community-moat surface (memory:
    // project_unlocksaas_isenberg_playbook.md) – the geo angle becomes
    // load-bearing if/when operator-led IRL meetups spin up; until
    // then the page provides honest discovery tactics rather than
    // fabricated meetup directories.
    // ---------------------------------------------------------------------
    {
      url: `${base}/founders-in`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
      alternates: hreflang(`${base}/founders-in`),
    },
    ...CITY_SLUGS.map((slug) => ({
      url: `${base}/founders-in/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.4,
      alternates: hreflang(`${base}/founders-in/${slug}`),
    })),
    // ---------------------------------------------------------------------
    // Programmatic SEO block #8b — cohort-tuned indie SaaS stacks.
    // Data source: src/lib/stacks.ts. Companion to NICHE_SLUGS above:
    // /stack-for/<slug> mirrors /for/<slug> 1:1, carrying the 6-8 tool
    // roster for that cohort, with each tool cross-linked into its
    // /pricing-teardown/<slug>. Article + ItemList + FAQPage +
    // BreadcrumbList JSON-LD per detail page; CollectionPage +
    // ItemList on the hub. Internal-link graph win: each tool in
    // pricing-teardowns.ts now has +12 inbound links from the stacks
    // that include it, without requiring reciprocal-link bookkeeping.
    // ---------------------------------------------------------------------
    {
      url: `${base}/stack-for`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/stack-for`),
    },
    ...STACK_SLUGS.map((slug) => ({
      url: `${base}/stack-for/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/stack-for/${slug}`),
    })),
    // ---------------------------------------------------------------------
    // Programmatic SEO block #8c — pre-revenue launch checklists by niche.
    // Data source: src/lib/launch-checklists.ts (cross-checked against
    // NICHE_SLUGS at module load – drift errors at build time). Targets
    // intent-shaped queries like "how to launch [niche] saas" and
    // "[cohort] pre-revenue checklist". Article + HowTo + FAQPage +
    // BreadcrumbList JSON-LD per detail page; CollectionPage + ItemList
    // on the hub. Priority slightly above /for/[slug] because launch
    // checklists carry the conversion-optimised diagnostic CTA on every
    // step's resolution.
    // ---------------------------------------------------------------------
    {
      url: `${base}/launch-checklist`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.65,
      alternates: hreflang(`${base}/launch-checklist`),
    },
    ...LAUNCH_CHECKLIST_SLUGS.map((slug) => ({
      url: `${base}/launch-checklist/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.55,
      alternates: hreflang(`${base}/launch-checklist/${slug}`),
    })),
    // ---------------------------------------------------------------------
    // Programmatic SEO block #9 — directional metric benchmarks (AEO).
    // Data source: src/lib/benchmarks.ts. Pure AEO play: each page
    // answers "what is a good X" with a cited directional range and
    // band breakdown. Article + FAQPage + BreadcrumbList JSON-LD.
    // ---------------------------------------------------------------------
    {
      url: `${base}/benchmarks`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/benchmarks`),
    },
    ...BENCHMARK_SLUGS.map((slug) => ({
      url: `${base}/benchmarks/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/benchmarks/${slug}`),
    })),
    // ---------------------------------------------------------------------
    // Programmatic SEO block #10 — Brunson funnel playbooks.
    // Data source: src/lib/funnel-playbooks.ts. Targets action-intent
    // build queries ("tripwire playbook", "perfect webinar structure").
    // Article + HowTo + FAQPage + BreadcrumbList JSON-LD per detail.
    // ---------------------------------------------------------------------
    {
      url: `${base}/funnel-playbook`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/funnel-playbook`),
    },
    // ---------------------------------------------------------------------
    // /best — the "best SaaS customer acquisition playbooks" listicle.
    // Canonical AEO listicle format (43.8% of ChatGPT citations are
    // listicles/comparisons per the Ahrefs AEO study). Title matches the
    // literal query an indie founder asks ChatGPT. CollectionPage +
    // ItemList + FAQPage + BreadcrumbList JSON-LD. Data source:
    // src/lib/best-playbooks.ts. Honest ranked list of six real options
    // (Unlock SaaS, ShipFast, One Funnel Away, Starter Story, MicroConf,
    // Demand Curve) — Brunson Hard-Rule: every price + verdict verifiable.
    // ---------------------------------------------------------------------
    {
      url: `${base}/best`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: hreflang(`${base}/best`),
    },
    ...FUNNEL_PLAYBOOK_SLUGS.map((slug) => ({
      url: `${base}/funnel-playbook/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/funnel-playbook/${slug}`),
    })),
    // ---------------------------------------------------------------------
    // pSEO block #10b — funnel × niche matrix combos.
    // Data source: src/lib/funnel-playbook-matrix.ts (synthesised from
    // FUNNEL_PLAYBOOK_ENTRIES × NICHE_ENTRIES). Targets cohort-specific
    // money-keyword shapes ("tripwire funnel for course creators",
    // "VSL for AI wrappers"). Article + HowTo + FAQPage +
    // BreadcrumbList JSON-LD per detail, same as bare-funnel pages.
    // Priority is 0.4 (slightly below bare-funnel pages) because the
    // funnel-level pages are the primary canonical surface for the
    // mechanic; matrix combos serve the long-tail cohort-shape
    // searches and crosslink upward to both parents.
    // ---------------------------------------------------------------------
    ...FUNNEL_MATRIX_SLUGS.map((slug) => ({
      url: `${base}/funnel-playbook/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.4,
      alternates: hreflang(`${base}/funnel-playbook/${slug}`),
    })),
    // ---------------------------------------------------------------------
    // Programmatic SEO block #11 — direct-answer AEO pages.
    // Data source: src/lib/answers.ts. Pure citation-bait: each page
    // is a single founder-question with a 2-4 sentence direct answer
    // plus supporting bullets. FAQPage + Article + BreadcrumbList JSON-LD.
    // ---------------------------------------------------------------------
    {
      url: `${base}/answers`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/answers`),
    },
    ...ANSWER_SLUGS.map((slug) => ({
      url: `${base}/answers/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/answers/${slug}`),
    })),
    // ---------------------------------------------------------------------
    // Programmatic SEO block #11b — Should I…? decision-helper AEO pages.
    // Data source: src/lib/should-i.ts. Pure AEO play targeting the
    // "should I X?" query shape that ChatGPT / Perplexity / Claude cite
    // verbatim (decision-tree response shape). Each page carries a
    // single yes / no / depends / not-yet verdict plus reasoning.
    // FAQPage + Article + BreadcrumbList JSON-LD.
    // ---------------------------------------------------------------------
    {
      url: `${base}/should-i`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/should-i`),
    },
    ...SHOULD_I_SLUGS.map((slug) => ({
      url: `${base}/should-i/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/should-i/${slug}`),
    })),
    // ---------------------------------------------------------------------
    // Programmatic SEO block #12 – recordable funnel scripts.
    // Data source: src/lib/scripts.ts. Targets script-template search
    // intent ("VSL script template", "perfect webinar script outline",
    // "soap opera sequence template"). Article + HowTo + FAQPage +
    // BreadcrumbList JSON-LD per detail page.
    // ---------------------------------------------------------------------
    {
      url: `${base}/scripts`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/scripts`),
    },
    ...SCRIPT_SLUGS.map((slug) => ({
      url: `${base}/scripts/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/scripts/${slug}`),
    })),
    // ---------------------------------------------------------------------
    // Programmatic SEO block #13 – pricing page pattern teardowns.
    // Data source: src/lib/pricing-page-examples.ts. Targets pricing-
    // pattern search intent ("SaaS pricing page examples", "decoy
    // pricing examples", "tiered pricing examples"). Article + FAQPage
    // + BreadcrumbList JSON-LD per detail page.
    // ---------------------------------------------------------------------
    {
      url: `${base}/pricing-page-examples`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/pricing-page-examples`),
    },
    ...PRICING_PAGE_PATTERN_SLUGS.map((slug) => ({
      url: `${base}/pricing-page-examples/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/pricing-page-examples/${slug}`),
    })),
    // ---------------------------------------------------------------------
    // Programmatic SEO block #14 – niche-specific conversion benchmarks.
    // Data source: src/lib/conversion-rate.ts. Targets "what is a good
    // conversion rate for [niche]" – pure AEO intent for founder cohorts.
    // Article + FAQPage + BreadcrumbList JSON-LD per detail page.
    // ---------------------------------------------------------------------
    {
      url: `${base}/conversion-rate`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/conversion-rate`),
    },
    ...CONVERSION_RATE_SLUGS.map((slug) => ({
      url: `${base}/conversion-rate/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/conversion-rate/${slug}`),
    })),
    // ---------------------------------------------------------------------
    // Programmatic SEO block #15 – per-element copy/UI swipe files.
    // Data source: src/lib/swipe-files.ts. Action-intent build queries
    // ("saas hero headline examples", "pricing table examples",
    // "CTA button copy", "exit intent popup examples"). Article +
    // ItemList + FAQPage + BreadcrumbList JSON-LD per detail.
    // ---------------------------------------------------------------------
    {
      url: `${base}/swipe-file`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/swipe-file`),
    },
    ...SWIPE_FILE_SLUGS.map((slug) => ({
      url: `${base}/swipe-file/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/swipe-file/${slug}`),
    })),
    // ---------------------------------------------------------------------
    // Programmatic SEO block #16 – outcome-promise landing pages.
    // Data source: src/lib/outcomes.ts. Targets the canonical
    // result-shaped Google query class the post-launch pre-revenue
    // founder makes: "get first paying customer", "get to 1k mrr",
    // "get 30 warm leads from cold outreach". URL shape preserves the
    // outcome-as-one-segment ranking signal: /get-<slug> via a mixed
    // static-dynamic folder name, NOT /get/<slug>. Article + HowTo +
    // FAQPage + BreadcrumbList JSON-LD per detail page; CollectionPage +
    // ItemList on the hub. Slightly higher priority than the niche
    // cluster (0.55 vs 0.5) because outcome-shaped intent is more
    // commercial than identity-shaped intent ("for course creators").
    // ---------------------------------------------------------------------
    {
      url: `${base}/get`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.65,
      alternates: hreflang(`${base}/get`),
    },
    ...OUTCOME_SLUGS.map((slug) => ({
      url: `${base}/get-${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.55,
      alternates: hreflang(`${base}/get-${slug}`),
    })),
    // ---------------------------------------------------------------------
    // Programmatic SEO block #17 – MCP server directory.
    // Data source: src/lib/mcp-tools.ts. Isenberg overlay defensive play:
    // own the "MCP server directory" / "best MCP for X" / "is there an
    // MCP for Y" search surface before the field crowds. Article +
    // SoftwareApplication + FAQPage + BreadcrumbList JSON-LD per detail.
    // ---------------------------------------------------------------------
    {
      url: `${base}/mcp-tools`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/mcp-tools`),
    },
    ...MCP_TOOL_SLUGS.map((slug) => ({
      url: `${base}/mcp-tools/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/mcp-tools/${slug}`),
    })),
    // ---------------------------------------------------------------------
    // Programmatic SEO block #18 – branded partner landing pages.
    // Data source: src/lib/partners.ts. Pairs with the existing /r/<code>
    // attribution redirect: /partners/<slug> is the shareable destination
    // a partner can link to from their own audience, with their face,
    // pitch, and proof; the page's primary CTA routes through /r/<code>
    // so the unlocksaas_ref cookie is set for the 50% lifetime rev share
    // affiliate program (see supabase/migrations/20260521000000_…).
    // ProfilePage + Person + BreadcrumbList JSON-LD per detail page;
    // CollectionPage + ItemList on the hub. Founder seed entry is
    // pre-populated; affiliate entries get appended as Verified Builders
    // opt in (operator runbook in the data file header).
    // ---------------------------------------------------------------------
    {
      url: `${base}/partners`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
      alternates: hreflang(`${base}/partners`),
    },
    ...PARTNER_SLUGS.map((slug) => ({
      url: `${base}/partners/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.45,
      alternates: hreflang(`${base}/partners/${slug}`),
    })),
    // ---------------------------------------------------------------------
    // Programmatic SEO block #19 – quarterly Verified Builders cohorts.
    // Data source: src/lib/cohorts.ts. Greg Isenberg community-moat
    // overlay (project_unlocksaas_isenberg_playbook): time-segmented
    // social-proof bundle + permanent recruiting page per quarter. Each
    // /cohort/<YYYY-qN> URL keeps earning links after the quarter closes
    // because it is the canonical history record for the class. Members
    // are read from the `builder_badges` view bounded by the quarter
    // window; pre-launch the pages render polarity empty states (no
    // fabricated counts). Article + Event + CollectionPage + ItemList +
    // BreadcrumbList JSON-LD per detail.
    // ---------------------------------------------------------------------
    {
      url: `${base}/cohort`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/cohort`),
    },
    ...COHORT_SLUGS.map((slug) => ({
      url: `${base}/cohort/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/cohort/${slug}`),
    })),
    // ---------------------------------------------------------------------
    // E-E-A-T trust columns. Low SERP priority on their own; high structural
    // weight: Google quality raters and LLM citation pipelines both look for
    // a real about / contact / legal surface before treating an entity as
    // credible. Linked from the global footer and from each other's
    // "Related" footnotes; BreadcrumbList JSON-LD on each page.
    // ---------------------------------------------------------------------
    {
      url: `${base}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
      alternates: hreflang(`${base}/about`),
    },
    // /open – build-in-public transparency dashboard. Live MRR, subscriber
    // counts, signups, churn, last-10 builders. Updated automatically on
    // every paid Stripe event via revalidateTag("billing-mutation", "max").
    // Higher priority than /about because the GEO research (2026-05-21)
    // shows original-stats pages with Dataset JSON-LD get the strongest
    // AI-citation lift; this is the canonical original-data surface.
    {
      url: `${base}/open`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.6,
      alternates: hreflang(`${base}/open`),
    },
    // Press / media kit. Off-page lift surface – built so journalists,
    // podcasters, and newsletter writers can self-serve canonical
    // descriptions, fast facts, and brand assets without having to
    // contact the founder. Honest empty state on "recent coverage"
    // until earned mentions land. Same Brunson Hard-Rule discipline
    // as /about and /faq.
    {
      url: `${base}/press`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
      alternates: hreflang(`${base}/press`),
    },
    // ---------------------------------------------------------------------
    // Aggregator / review-directory listings status board – Isenberg
    // overlay #2 (2026-05-22). Public hub listing every off-platform
    // directory we target (Product Hunt, BetaList, G2, Capterra,
    // AlternativeTo, SaaSHub, Indie Hackers). Doubles as an LLM-citable
    // editorial surface ("where is UnlockSaaS listed?") and an operator
    // status board (env-driven row resolution). Data source:
    // src/lib/seo/directory-listings.ts.
    //
    // Priority matches /press (0.4) — moderate standalone SERP value,
    // high citation value for AI Overviews answering category /
    // alternative queries.
    // ---------------------------------------------------------------------
    {
      url: `${base}/press/listings`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
      alternates: hreflang(`${base}/press/listings`),
    },
    // ---------------------------------------------------------------------
    // Reverse press kit – pre-assembled story packages for journalists.
    // Off-page lift item #7 of the 2026-05-18 plan. Hub + per-topic detail
    // pages, each pre-built around a recognisable story angle with
    // thesis, founder quote, three data points, three counter-points,
    // fact sheet, embed code. Data source: src/lib/press-topics.ts.
    // Adding a new topic auto-extends this block on the next deploy.
    // ---------------------------------------------------------------------
    {
      url: `${base}/press/topics`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
      alternates: hreflang(`${base}/press/topics`),
    },
    ...PRESS_TOPIC_SLUGS.map((slug) => ({
      url: `${base}/press/topics/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.45,
      alternates: hreflang(`${base}/press/topics/${slug}`),
    })),
    // ---------------------------------------------------------------------
    // Programmatic SEO block — Founder Diary (Isenberg content-franchise
    // overlay, 2026-05-22). Data source: src/lib/founder-diary.ts. One
    // URL per build day, slugged YYYY-MM-DD. BlogPosting + BreadcrumbList
    // JSON-LD per detail page; Blog + CollectionPage on the hub.
    //
    // Hub priority matches /press (0.5) — moderate standalone SERP
    // value, high recurring-backlink value. Detail entries at 0.45
    // mirror /press/topics/<slug>: they earn link equity from X / IH
    // cross-posts that reference the canonical here, not from raw
    // search volume on date-shaped queries.
    //
    // Adding a new entry to DIARY_ENTRIES extends this block on the
    // next deploy. Brunson Hard-Rule reconciliation: every entry is
    // grounded in a public artifact (merged PR, deployed surface,
    // shipped env var) — listing a URL here = a public claim that the
    // entry on that date is truthful and verifiable.
    // ---------------------------------------------------------------------
    {
      url: `${base}/founder-diary`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.5,
      alternates: hreflang(`${base}/founder-diary`),
    },
    ...DIARY_DATES.map((date) => ({
      url: `${base}/founder-diary/${date}`,
      lastModified: new Date(`${date}T12:00:00Z`),
      changeFrequency: "monthly" as const,
      priority: 0.45,
      alternates: hreflang(`${base}/founder-diary/${date}`),
    })),
    // Editorial policy + disclosures + corrections log. E-E-A-T Trust
    // uplift (2026-05-17). Google Search Quality Rater Guidelines §3.1
    // and §3.4 explicitly look for a stated editorial policy + a
    // corrections policy on sites that publish opinions or comparisons —
    // which UnlockSaaS does on every pSEO surface. Same crawl priority
    // as /about and /press: low standalone SERP value, high structural
    // signal weight. BreadcrumbList JSON-LD on the page itself.
    {
      url: `${base}/editorial-policy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
      alternates: hreflang(`${base}/editorial-policy`),
    },
    // Polarity / anti-marketing page (2026-05-18 off-page uplift). The
    // disqualifier list is the highest-share-probability surface on the
    // site — honest-founder accounts on X / LinkedIn / Bluesky link to
    // pages that turn audience away. Doubles as a wrong-fit-customer
    // screen before checkout. See strategy/google-strategy.md §B.3.
    // Crawl priority is moderate (0.5) because the page is intended to
    // attract inbound links + AI citations, not to rank on its own.
    {
      url: `${base}/dont-buy-unlock-saas`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
      alternates: hreflang(`${base}/dont-buy-unlock-saas`),
    },
    // The indie-search companion essay shipped 21-05-2026 as the public
    // companion to the robots.txt allow-list (PR #57, merge 506325e).
    // Brunson "the technical artifact becomes the marketing" play —
    // built specifically to be linked from X / Bluesky / Indie Hackers /
    // Show HN. Crawl priority 0.5 (same as /dont-buy-unlock-saas):
    // the page is intended to attract inbound links + AI citations,
    // not to rank on a head term of its own. changeFrequency monthly
    // matches the lastReviewed cadence the essay declares in JSON-LD.
    {
      url: `${base}/four-indie-search-engines`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
      alternates: hreflang(`${base}/four-indie-search-engines`),
    },
    // -------------------------------------------------------------------------
    // /tools – free SaaS calculator hub (2026-05-22 editorial-backlink play).
    //
    // Static pSEO surfaces earn citations; interactive calculators earn
    // *editorial backlinks* (the cite-able kind: "use this LTV calculator
    // to see how churn destroys SaaS unit economics"). One hub + five
    // detail pages, each with a dedicated OG card + FAQPage JSON-LD.
    //
    // Priority alignment:
    //   - /tools at 0.6 — same tier as /glossary, /benchmarks, /alternatives-to
    //     hubs. Real conversion-supporting destination, not a thin index.
    //   - /tools/<slug> at 0.55 — slightly above pSEO detail (0.5) because
    //     the calculator pages are direct-answer surfaces with their own
    //     unique formula card + FAQ trio + interactive widget. Each is a
    //     ranking surface for its own commercial-intent head term
    //     ("LTV calculator", "CAC payback period", etc.).
    //
    // Data source: src/lib/tools-catalog.ts. Adding a new calculator there
    // auto-extends this block on the next build.
    // -------------------------------------------------------------------------
    {
      url: `${base}/tools`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/tools`),
    },
    ...TOOL_SLUGS.map((slug) => ({
      url: `${base}/tools/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.55,
      alternates: hreflang(`${base}/tools/${slug}`),
    })),

    // ---------------------------------------------------------------------
    // Embeddable widget tools REMOVED from sitemap (2026-07-28 GSC fix).
    //
    // The /embed/ layout (src/app/embed/layout.tsx) sets
    // robots: { index: false, follow: true } — these pages are designed
    // for cross-origin iframe embedding, NOT for Google indexing. Listing
    // noindex pages in the sitemap is contradictory and the trailing-slash
    // URL (/embed/) conflicts with the global trailingSlash: false setting,
    // causing a 308 redirect that GSC reports as a canonical mismatch.
    // The .html embed tool pages remain accessible directly; they just
    // don't belong in the XML sitemap.
    // ---------------------------------------------------------------------
    {
      url: `${base}/contact`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
      alternates: hreflang(`${base}/contact`),
    },
    // Verified Builder directory hub. The individual /builder/<slug>
    // pages aren't sitemap-listed (they're discovered via inbound links
    // from each founder's own embedded badge, which is the entire point
    // of the off-page lift strategy). The directory page IS listed so
    // crawlers can find the canonical list of verified builders and
    // follow internal links to each badge.
    //
    // E-E-A-T anchor: a directory of Stripe-verified outcomes is the
    // strongest trust signal pre-revenue SaaS can ship. Quality raters
    // look for exactly this surface on sites that publish "our customers"
    // claims (Google Search Quality Rater Guidelines §4.5).
    {
      url: `${base}/builders`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
      alternates: hreflang(`${base}/builders`),
    },
    // Site-wide search — backed by app/(marketing)/search/page.tsx. Real
    // surface the WebSite SearchAction potentialAction points at.
    {
      url: `${base}/search`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.3,
      alternates: hreflang(`${base}/search`),
    },
    // /ask — NLWeb-compatible conversational search hub. Higher priority
    // than /search because it surfaces grounded answers (one paragraph
    // + numbered citations) rather than a flat link list, and the
    // showcase URLs below are pre-answered Q&A pages AI Overviews can
    // cite directly. Backed by app/(marketing)/ask/page.tsx.
    {
      url: `${base}/ask`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
      alternates: hreflang(`${base}/ask`),
    },
    {
      url: `${base}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
      alternates: hreflang(`${base}/privacy`),
    },
    {
      url: `${base}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
      alternates: hreflang(`${base}/terms`),
    },
    // -------------------------------------------------------------------------
    // Public dataset (Surface C – linkable asset / off-page lift).
    //
    // /dataset is the landing page that markets the bundled, CC-BY-4.0
    // licensed Indie SaaS Teardowns Dataset. The two download URLs ship
    // versioned filenames inside Content-Disposition headers; listing
    // them here surfaces the artifacts to Google Dataset Search and to
    // every aggregator that walks sitemaps before crawling. Higher
    // priority than the llms.txt cluster because these are real,
    // citable, human-facing assets – not crawler bait.
    // -------------------------------------------------------------------------
    {
      url: `${base}/dataset`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: hreflang(`${base}/dataset`),
    },
    {
      url: `${base}/dataset/indie-saas-teardowns.json`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${base}/dataset/indie-saas-teardowns.csv`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    // Per-table CSVs – same dataset, narrower slices with table-
    // specific columns. Lifted at priority 0.45 (just under the bundle
    // downloads) so Google Dataset Search counts them as distinct
    // distributions but ranks the bundle higher when a query matches
    // multiple. Auto-extension: when a new record type lands in
    // DATASET_PER_TABLE_CSV, add a sitemap entry here in the same
    // commit so the new distribution is crawler-discoverable on first
    // deploy.
    {
      url: `${base}/dataset/tables/funnel-teardowns.csv`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.45,
    },
    {
      url: `${base}/dataset/tables/pricing-teardowns.csv`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.45,
    },
    {
      url: `${base}/dataset/tables/comparisons.csv`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.45,
    },
    {
      url: `${base}/dataset/tables/alternatives.csv`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.45,
    },
    {
      url: `${base}/dataset/tables/categories.csv`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.45,
    },
    // -------------------------------------------------------------------------
    // Annual flagship report (Surface C – linkable asset / off-page lift).
    //
    // /state-of-saas is the series index; /state-of-saas/<year> is each
    // per-edition page. Higher priority than the per-table dataset CSVs
    // because the report is the analysis layer on top of the dataset –
    // citable, named, and the canonical destination for year-anchored
    // queries like "state of indie SaaS 2026" or "post-launch pre-revenue
    // saas annual report 2026".
    //
    // Auto-extension: a new edition added to EDITIONS in
    // src/lib/state-of-saas.ts appears here on the next build via the
    // EDITION_YEARS_DESC fan-out below.
    // -------------------------------------------------------------------------
    {
      url: `${base}/state-of-saas`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: hreflang(`${base}/state-of-saas`),
    },
    ...EDITION_YEARS_DESC.map((year) => ({
      url: `${base}/state-of-saas/${year}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.65,
      alternates: hreflang(`${base}/state-of-saas/${year}`),
    })),
    // Hugging Face Datasets submission surface (2026-05-20 off-page lift).
    // The page documents the operator submission flow + Google Dataset
    // Search verification, and the /raw sibling serves the exact
    // README.md the operator uploads to the HF dataset repo. Both URLs
    // are indexable, carry BreadcrumbList JSON-LD on the page form, and
    // resolve to a self-canonical Link header on the raw form.
    //
    // Why list both. /dataset/huggingface is the human-readable
    // canonical the catalog crawler should treat as the cross-listing
    // anchor. /dataset/huggingface/raw is the machine artifact – it
    // serves text/markdown with Content-Disposition: attachment so a
    // curl downloader saves it as README.md. Listing the raw URL in
    // the sitemap makes it crawler-discoverable without needing the
    // operator to advertise it from the HF Hub. Priorities mirror the
    // dataset cluster above (page slightly above the raw artifact).
    {
      url: `${base}/dataset/huggingface`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${base}/dataset/huggingface/raw`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    // Zenodo submission surface (2026-05-20 DOI uplift). Parallel to the
    // Hugging Face pair above: /dataset/zenodo is the human-readable
    // canonical, /dataset/zenodo/raw is the machine artifact (the JSON
    // deposition metadata payload, served with Content-Disposition:
    // attachment so the operator CLI curls it directly). Listing both
    // makes the raw artifact crawler-discoverable so a Zenodo-side
    // catalog walker can resolve the deposit payload without needing
    // the operator to advertise it from the Zenodo record.
    {
      url: `${base}/dataset/zenodo`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${base}/dataset/zenodo/raw`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    // -------------------------------------------------------------------------
    // Dataset changelog podcast (Surface D – GEO/AEO discovery
    // diversification, landed 2026-05-21).
    //
    // The podcast feed at /feed/podcast.rss is an RSS 2.0 + iTunes
    // namespace distribution of the dataset version history. Each
    // episode = one dated dataset milestone (version bump, table
    // addition, cross-catalog activation, methodology change).
    //
    // Sitemap entries:
    //   - /podcast: human-readable hub page with PodcastSeries JSON-LD
    //     and episode index.
    //   - /podcast/<slug>: per-episode page with PodcastEpisode +
    //     Article JSON-LD. generateStaticParams enumerates
    //     PODCAST_EPISODE_SLUGS so appending a new episode auto-extends
    //     this block on next deploy.
    //   - /feed/podcast.rss: the RSS XML itself, listed as a raw asset
    //     (no images, no hreflang – it is a machine artifact).
    //
    // Priority alignment:
    //   - /podcast at 0.5 matches /press and /dataset/huggingface – a
    //     legitimate discovery surface that exists primarily for
    //     subscription, not for ranking on broad queries.
    //   - /podcast/<slug> at 0.45 just below /press/topics/<slug>.
    //   - /feed/podcast.rss at 0.4 above /llms.txt (0.3) because the
    //     RSS feed is a real, citable distribution artifact – not
    //     crawler bait. Below /dataset (0.7) because the dataset is
    //     the primary linkable asset; the podcast is the changelog
    //     mirror of that asset.
    // -------------------------------------------------------------------------
    {
      url: `${base}/podcast`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
      alternates: hreflang(`${base}/podcast`),
    },
    ...PODCAST_EPISODE_SLUGS.map((slug) => ({
      url: `${base}/podcast/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.45,
      alternates: hreflang(`${base}/podcast/${slug}`),
    })),
    // Per-episode transcript pages (VEO uplift landing 2026-05-21).
    // Schema.org PodcastEpisode.transcript points at these URLs; AI
    // summarisers and Apple Podcast Transcripts follow them to extract
    // verbatim text instead of re-transcribing the audio. Priority 0.42
    // just below the episode page (0.45) – the episode page remains the
    // canonical destination; the transcript is a sibling surface.
    ...PODCAST_EPISODE_SLUGS.map((slug) => ({
      url: `${base}/podcast/${slug}/transcript`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.42,
      alternates: hreflang(`${base}/podcast/${slug}/transcript`),
    })),
    {
      url: `${base}/feed/podcast.rss`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.4,
    },
    // -------------------------------------------------------------------------
    // The Founder's Diary — faceless YouTube channel (#5, additive to the
    // locked launch-minimum-four channels).
    //
    // Shape mirrors the podcast cluster directly above:
    //   - /youtube: human-readable hub with channel overview + live-episode
    //     grid (renders honest empty-state pre-launch).
    //   - /youtube/<slug>: per-episode landing page with hook + Brunson beat
    //     + phase. When status="live", upgrades in place to include the
    //     YouTube watch CTA, inline transcript (strongest AEO signal),
    //     key takeaways, and VideoObject JSON-LD. generateStaticParams
    //     enumerates FOUNDERS_DIARY_SLUGS so the 30-episode backlog is
    //     indexable from day one.
    //
    // Priority alignment:
    //   - /youtube at 0.5 matches /podcast – distribution-surface hub.
    //   - /youtube/<slug> at 0.45 matches /podcast/<slug> – same shape,
    //     same indexable transcript signal once the cut ships.
    //
    // Honesty: priorities don't change based on live-vs-draft state. The
    // page renders an honest "scheduled, not yet aired" preview pre-launch
    // (no fake counts, no synthetic transcripts), so the URL is genuinely
    // useful to crawlers and the diagnostic CTA still fires. See
    // strategy/youtube-founders-diary-backlog.md §Backlog hygiene.
    // -------------------------------------------------------------------------
    {
      url: `${base}/youtube`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
      alternates: hreflang(`${base}/youtube`),
    },
    ...FOUNDERS_DIARY_SLUGS.map((slug) => ({
      url: `${base}/youtube/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.45,
      alternates: hreflang(`${base}/youtube/${slug}`),
    })),
    // Per-episode transcript pages (VEO/AEO uplift). Mirrors the podcast
    // transcript shape at /podcast/<slug>/transcript. Schema.org
    // VideoObject.transcript points at these URLs; AI summarisers and
    // voice engines follow them to pull verbatim text without re-
    // transcribing the video. Brunson Hard-Rule: only emit URLs for
    // episodes with status="live" AND a hand-pasted transcript field,
    // so we never advertise a phantom URL.
    //   - /youtube/<slug>/transcript at 0.42 matches /podcast/<slug>/
    //     transcript – sibling AEO surface.
    //   - /youtube/<slug>/transcript/md at 0.35 matches the markdown
    //     mirror tier (machine-readable, lower than HTML siblings).
    ...liveEpisodesWithTranscript().map((ep) => ({
      url: `${base}/youtube/${ep.slug}/transcript`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.42,
      alternates: hreflang(`${base}/youtube/${ep.slug}/transcript`),
    })),
    ...liveEpisodesWithTranscript().map((ep) => ({
      url: `${base}/youtube/${ep.slug}/transcript/md`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.35,
    })),
    // Alexa Flash Briefing JSON feed (VEO uplift landing 2026-05-21).
    // Documented at strategy/voice-assistants-playbook.md. NOT listed in
    // the sitemap: the route serves `X-Robots-Tag: noindex` (feeds are
    // not indexable HTML), and Google flags noindex URLs listed in a
    // sitemap as "Excluded by 'noindex' tag" (GSC 2026-08-17). Retriever
    // discovery flows through /llms.txt instead.
    // -------------------------------------------------------------------------
    // Citation permalinks (Surface B – GEO/AEO/AIO uplift).
    //
    // /cite/[id] is a stable indirection layer: every formatted citation
    // string (APA, MLA, Chicago, BibTeX, RIS, CSL-JSON) points at the
    // permalink rather than the live canonical URL. The permalink page
    // itself is noindexed (link-equity flows to the live canonical), so it
    // is intentionally OMITTED from the sitemap — Google flags noindex
    // pages listed in a sitemap as "Excluded by 'noindex' tag". AI
    // retrievers discover the citation surface via inline citation links
    // and /llms.txt, not the sitemap.
    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    // LLM-readable surfaces (Surface B – GEO/AEO).
    // Three routes are public, indexable bodies that AI retrievers
    // (Perplexity, Claude-SearchBot / Claude-User, OAI-SearchBot,
    // ChatGPT-User, Google AI Overviews, Gemini, You.com) treat as the canonical paraphrase target for the
    // site. /llms.txt is the curated markdown index; /llms-full.txt is
    // the concatenated corpus; /llms-feed.json is the machine-typed JSON
    // sibling for retrievers that prefer JSON over markdown (added
    // 2026-05-18 GEO uplift).
    //
    // llmstxt.org is well-known so /llms.txt discovery happens via
    // convention. The JSON sibling has no documented well-known path
    // yet, so the sitemap entry is the primary discovery anchor for it –
    // listing all three says "yes, these surfaces are intentional and
    // current." Low priority because they are not user-facing pages –
    // they are crawler bait – but lastModified ties their freshness to
    // the build.
    // -------------------------------------------------------------------------
    // AI training consent declaration (Spawning ai.txt spec, 2026-05-21).
    // Listed so dataset aggregators walking sitemaps discover the explicit
    // training-opt-out signal before ingesting. Priority 0.3 matches the
    // llms.txt cluster (machine-readable policy surfaces, not user-facing
    // pages). No image entry -- content is policy, not editorial.
    {
      url: `${base}/ai.txt`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${base}/llms.txt`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${base}/llms-full.txt`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${base}/llms-feed.json`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    // Per-model variants of /llms.txt – static dedicated routes that mirror
    // /llms.txt?model=<key>. Listed so retrievers walking the sitemap
    // discover their own model variant in one pass. The body is the shared
    // LLMS_TXT_BODY prefixed by a short routing preamble; no exclusive
    // content per model (Brunson Hard-Rule). Priority 0.3 matches the
    // canonical /llms.txt so search-engine crawl budget is not skewed.
    {
      url: `${base}/llms-claude.txt`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${base}/llms-gpt.txt`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${base}/llms-gemini.txt`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${base}/llms-perplexity.txt`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    // -------------------------------------------------------------------------
    // Surface B/D – Glossary audio podcast feed (VEO / AEO uplift).
    //
    // /glossary/podcast.xml is the RSS 2.0 + iTunes-namespace feed listing
    // every published /glossary/[slug] audio episode. Apple Podcasts,
    // Spotify, Google Podcasts, Pocket Casts, Overcast, and AI audio
    // ingestion pipelines (Whisper-based crawlers, Google's audio carousel)
    // discover it via this sitemap entry until podcast-directory submission
    // is performed manually. Brunson Hard-Rule: empty manifest = empty
    // <item> list. Listing the URL is honest because the channel block
    // always renders, even with zero episodes.
    //
    // The square 1400×1400 cover at /glossary/podcast-cover is referenced
    // by the feed itself (Apple submission validator requires it inside
    // the channel block) but is not sitemap-listed: it's an image asset
    // that the feed declares, not a discovery target. Listing it would
    // create a duplicate path between the OG image sitemap and the
    // podcast artwork the feed already names.
    // -------------------------------------------------------------------------
    {
      url: `${base}/glossary/podcast.xml`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.4,
    },
    // -------------------------------------------------------------------------
    // Surface C – Agent retrieval (MCP server).
    //
    // /mcp is the human-readable install + tool-catalog page. The actual
    // MCP server lives at /api/mcp (excluded from the sitemap because the
    // robots policy disallows /api/*) but the discovery manifest at
    // /.well-known/mcp.json is listed here so registry crawlers (Vercel MCP
    // catalog, mcp.run, Smithery) can self-populate from a sitemap fetch.
    //
    // hreflang is intentionally omitted – the manifest is a machine schema,
    // not a translated surface.
    // -------------------------------------------------------------------------
    {
      url: `${base}/mcp`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
      alternates: hreflang(`${base}/mcp`),
    },
    {
      url: `${base}/.well-known/mcp.json`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    // -------------------------------------------------------------------------
    // Approved locale translations (Surface A — International SEO).
    //
    // One entry per APPROVED (path, locale) pair from
    // src/lib/i18n/registry.ts. Pending or archived rows are silently
    // omitted — never advertised in the sitemap, never reachable via
    // hreflang return-tag. Brunson Hard-Rule reconciliation: an entry
    // here is a public claim that the translation is live, founder-
    // reviewed, and Brunson-voice-compliant. The registry's approval
    // workflow is the single gate; this block is a pure read.
    //
    // `lastModified` reads from the approvedAt timestamp so locale URLs
    // carry their own freshness signal, not the build time.
    //
    // Image sitemap (2026-05-20 uplift): four translated paths now ship
    // per-locale opengraph-image.tsx routes under app/src/app/[locale]/…
    // The image URL listed here is the route-derived URL of that
    // dedicated card – e.g. /es/faq → /es/faq/opengraph-image – which
    // gives Spanish / Brazilian-Portuguese threads a locale-correct
    // social preview AND a distinct entry in Google Images for the
    // translated surface. Paths without a per-locale card (none today;
    // this set is closed) fall back to the root /opengraph-image via
    // the post-processing pass below.
    // -------------------------------------------------------------------------
    ...allApprovedTranslations().map((row) => {
      const localised = `${base}${localizedPath(row.path, row.locale)}`;
      const canonical =
        row.path === "/" ? `${base}/` : `${base}${row.path}`;
      const PER_LOCALE_OG_PATHS: ReadonlySet<string> = new Set([
        "/faq",
        "/contact",
        "/repeatable",
        "/editorial-policy",
      ]);
      // 2026-07-28 GSC fix: locale OG image routes serve at build-hash-
      // suffixed URLs that 404/500 on the bare path. Use root OG for all
      // locale entries — per-page og:image meta tags handle social discovery.
      const ogUrl = rootOg;
      return {
        url: localised,
        lastModified: row.approvedAt ? new Date(row.approvedAt) : now,
        changeFrequency: "monthly" as const,
        priority: 0.5,
        alternates: {
          languages: {
            "en-US": canonical,
            "x-default": canonical,
            ...Object.fromEntries(
              approvedLocalesForPath(row.path).map((loc) => [
                loc,
                `${base}${localizedPath(row.path, loc)}`,
              ]),
            ),
          },
        },
        images: [ogUrl],
      };
    }),

    // -------------------------------------------------------------------------
    // Approved locale DETAIL pages (hub→detail inheritance — see
    // HUBS_WITH_DETAIL_LOCALE_INHERITANCE above).
    //
    // The hub `/glossary` and `/benchmarks` registry rows authorise every
    // child slug under them in the same locale. Without this block, the
    // sitemap would list /es/glossary (the hub) but not /es/glossary/hook,
    // /es/glossary/big-domino, … (the 16 detail slugs × 2 locales = 32
    // missing URLs for glossary; +40 for benchmarks). Search Console
    // would also flag the canonical /glossary/big-domino's hreflang
    // alternate to /es/glossary/big-domino as a missing return-tag.
    //
    // For each (hub, locale) approval pair, fan out across the hub's slug
    // catalog. lastModified inherits the row's approvedAt so each detail
    // URL carries the locale freshness signal.
    //
    // OG image (2026-05-20 audit fix): paths in HUBS_WITH_PER_LOCALE_DETAIL_OG
    // ship dedicated per-locale per-slug cards under
    // app/src/app/[locale]/<hub>/[slug]/opengraph-image.tsx, so the
    // `images[]` entry points at that route-derived URL — e.g.
    // /es/glossary/big-domino → /es/glossary/big-domino/opengraph-image.
    // Hubs without per-slug locale cards fall back to the root card via
    // the post-processing pass at the bottom of this file.
    // -------------------------------------------------------------------------
    // NOTE: Hub→detail locale fan-out REMOVED (2026-07-28 GSC fix).
    //
    // Previously, approving /es/glossary (the hub) auto-listed every
    // /es/glossary/<slug> child in the sitemap. But those child pages
    // serve ENGLISH content — only the hub pages (/es/glossary,
    // /es/benchmarks, /es/faq) have real translations. The 72 auto-
    // generated child URLs (/es/glossary/hook, /es/benchmarks/saas-churn-
    // rate, × 2 locales) were byte-identical to their English counterparts
    // except for a self-referencing canonical. Google ignored the self-
    // canonicals, flagged all 72 as "Duplicate, Google chose different
    // canonical than user," and the pages were de-indexed.
    //
    // Fix: only list locale URLs that have REAL translated content.
    // The approved hub entries above (/es/faq, /es/benchmarks, etc.) are
    // still listed. Child slug translations must be individually approved
    // in the registry with their own translation files before they appear.
    // ---------------------------------------------------------------------
    // Programmatic SEO block — /audience hub + details (ported from PR #46).
    // Data source: src/lib/audience.ts family.
    // ---------------------------------------------------------------------
    {
      url: `${base}/audience`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/audience`),
    },
    ...AUDIENCE_SLUGS.map((slug) => ({
      url: `${base}/audience/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/audience/${slug}`),
    })),

    // ---------------------------------------------------------------------
    // Programmatic SEO block — /business-term hub + details (ported from PR #46).
    // Data source: src/lib/business.ts family.
    // ---------------------------------------------------------------------
    {
      url: `${base}/business-term`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/business-term`),
    },
    ...BUSINESS_TERM_SLUGS.map((slug) => ({
      url: `${base}/business-term/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/business-term/${slug}`),
    })),

    // ---------------------------------------------------------------------
    // Programmatic SEO block — /checklist hub + details (ported from PR #46).
    // Data source: src/lib/checklist.ts family.
    // ---------------------------------------------------------------------
    {
      url: `${base}/checklist`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/checklist`),
    },
    ...CHECKLIST_SLUGS.map((slug) => ({
      url: `${base}/checklist/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/checklist/${slug}`),
    })),

    // ---------------------------------------------------------------------
    // Programmatic SEO block — /experiment hub + details (ported from PR #46).
    // Data source: src/lib/experiment.ts family.
    // ---------------------------------------------------------------------
    {
      url: `${base}/experiment`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/experiment`),
    },
    ...EXPERIMENT_SLUGS.map((slug) => ({
      url: `${base}/experiment/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/experiment/${slug}`),
    })),

    // ---------------------------------------------------------------------
    // Programmatic SEO block — /founder-mistake hub + details (ported from PR #46).
    // Data source: src/lib/founder.ts family.
    // ---------------------------------------------------------------------
    {
      url: `${base}/founder-mistake`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/founder-mistake`),
    },
    ...FOUNDER_MISTAKE_SLUGS.map((slug) => ({
      url: `${base}/founder-mistake/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/founder-mistake/${slug}`),
    })),

    // ---------------------------------------------------------------------
    // Programmatic SEO block — /from-x-to-y hub + details (ported from PR #46).
    // Data source: src/lib/from.ts family.
    // ---------------------------------------------------------------------
    {
      url: `${base}/from-x-to-y`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/from-x-to-y`),
    },
    ...JOURNEY_SLUGS.map((slug) => ({
      url: `${base}/from-x-to-y/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/from-x-to-y/${slug}`),
    })),

    // ---------------------------------------------------------------------
    // Programmatic SEO block — /integration hub + details (ported from PR #46).
    // Data source: src/lib/integration.ts family.
    // ---------------------------------------------------------------------
    {
      url: `${base}/integration`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/integration`),
    },
    ...INTEGRATION_SLUGS.map((slug) => ({
      url: `${base}/integration/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/integration/${slug}`),
    })),

    // ---------------------------------------------------------------------
    // Programmatic SEO block — /launch hub + details (ported from PR #46).
    // Data source: src/lib/launch.ts family.
    // ---------------------------------------------------------------------
    {
      url: `${base}/launch`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/launch`),
    },
    ...LAUNCH_SLUGS.map((slug) => ({
      url: `${base}/launch/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/launch/${slug}`),
    })),

    // ---------------------------------------------------------------------
    // Programmatic SEO block — /migrate-from hub + details (ported from PR #46).
    // Data source: src/lib/migrate.ts family.
    // ---------------------------------------------------------------------
    {
      url: `${base}/migrate-from`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/migrate-from`),
    },
    ...MIGRATE_FROM_SLUGS.map((slug) => ({
      url: `${base}/migrate-from/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/migrate-from/${slug}`),
    })),

    // ---------------------------------------------------------------------
    // Programmatic SEO block — /objection hub + details (ported from PR #46).
    // Data source: src/lib/objection.ts family.
    // ---------------------------------------------------------------------
    {
      url: `${base}/objection`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/objection`),
    },
    ...OBJECTION_SLUGS.map((slug) => ({
      url: `${base}/objection/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/objection/${slug}`),
    })),

    // ---------------------------------------------------------------------
    // Programmatic SEO block — /onboarding-pattern hub + details (ported from PR #46).
    // Data source: src/lib/onboarding.ts family.
    // ---------------------------------------------------------------------
    {
      url: `${base}/onboarding-pattern`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/onboarding-pattern`),
    },
    ...ONBOARDING_PATTERN_SLUGS.map((slug) => ({
      url: `${base}/onboarding-pattern/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/onboarding-pattern/${slug}`),
    })),

    // ---------------------------------------------------------------------
    // Programmatic SEO block — /positioning hub + details (ported from PR #46).
    // Data source: src/lib/positioning.ts family.
    // ---------------------------------------------------------------------
    {
      url: `${base}/positioning`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/positioning`),
    },
    ...POSITIONING_SLUGS.map((slug) => ({
      url: `${base}/positioning/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/positioning/${slug}`),
    })),

    // ---------------------------------------------------------------------
    // Programmatic SEO block — /pricing-model hub + details (ported from PR #46).
    // Data source: src/lib/pricing.ts family.
    // ---------------------------------------------------------------------
    {
      url: `${base}/pricing-model`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/pricing-model`),
    },
    ...PRICING_MODEL_SLUGS.map((slug) => ({
      url: `${base}/pricing-model/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/pricing-model/${slug}`),
    })),

    // ---------------------------------------------------------------------
    // Programmatic SEO block — /retention-tactic hub + details (ported from PR #46).
    // Data source: src/lib/retention.ts family.
    // ---------------------------------------------------------------------
    {
      url: `${base}/retention-tactic`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/retention-tactic`),
    },
    ...RETENTION_TACTIC_SLUGS.map((slug) => ({
      url: `${base}/retention-tactic/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/retention-tactic/${slug}`),
    })),

    // ---------------------------------------------------------------------
    // Programmatic SEO block — /saas-feature-pattern hub + details (ported from PR #46).
    // Data source: src/lib/saas.ts family.
    // ---------------------------------------------------------------------
    {
      url: `${base}/saas-feature-pattern`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/saas-feature-pattern`),
    },
    ...SAAS_FEATURE_PATTERN_SLUGS.map((slug) => ({
      url: `${base}/saas-feature-pattern/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/saas-feature-pattern/${slug}`),
    })),

    // ---------------------------------------------------------------------
    // Programmatic SEO block — /saas-metric hub + details (ported from PR #46).
    // Data source: src/lib/saas.ts family.
    // ---------------------------------------------------------------------
    {
      url: `${base}/saas-metric`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/saas-metric`),
    },
    ...SAAS_METRIC_SLUGS.map((slug) => ({
      url: `${base}/saas-metric/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/saas-metric/${slug}`),
    })),

    // ---------------------------------------------------------------------
    // Programmatic SEO block — /should-i-build hub + details (ported from PR #46).
    // Data source: src/lib/should.ts family.
    // ---------------------------------------------------------------------
    {
      url: `${base}/should-i-build`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/should-i-build`),
    },
    ...SHOULD_I_BUILD_SLUGS.map((slug) => ({
      url: `${base}/should-i-build/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/should-i-build/${slug}`),
    })),

    // ---------------------------------------------------------------------
    // Programmatic SEO block — /skill hub + details (ported from PR #46).
    // Data source: src/lib/skill.ts family.
    // ---------------------------------------------------------------------
    {
      url: `${base}/skill`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/skill`),
    },
    ...SKILL_SLUGS.map((slug) => ({
      url: `${base}/skill/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/skill/${slug}`),
    })),

    // ---------------------------------------------------------------------
    // Programmatic SEO block — /template hub + details (ported from PR #46).
    // Data source: src/lib/template.ts family.
    // ---------------------------------------------------------------------
    {
      url: `${base}/template`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/template`),
    },
    ...TEMPLATE_SLUGS.map((slug) => ({
      url: `${base}/template/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/template/${slug}`),
    })),
    // ---------------------------------------------------------------------
    // Programmatic SEO block — /stack hub + details (ported from PR #46).
    // Data source: src/lib/stacks-catalog.ts (category stacks; distinct
    // from /stack-for niche stacks in src/lib/stacks.ts).
    // ---------------------------------------------------------------------
    {
      url: `${base}/stack`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/stack`),
    },
    ...STACK_CATALOG_SLUGS.map((slug) => ({
      url: `${base}/stack/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/stack/${slug}`),
    })),
  ];

  /**
   * Image sitemap post-pass.
   *
   * Walk every entry above and attach `images: [ogImageFor(path)]` to
   * the HTML-page routes that don't already carry one (the
   * approvedTranslations block sets its own per-locale images). Raw
   * asset routes (.json, .csv, .txt, .well-known/*) are NOT pages and
   * do not get image entries – an image:image tag on a JSON download
   * URL would lie about what crawlers find at that loc.
   *
   * Listing one image per page in the sitemap is the canonical Google
   * Images discovery channel (developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps).
   * Per-page Open Graph meta tags remain authoritative for social
   * scrapers; this just adds the parallel discovery anchor for image
   * search.
   */
  const RAW_ASSET_RE = /\.(?:json|csv|txt|rss|xml)$/;
  return entries.map((entry) => {
    if (entry.images && entry.images.length > 0) return entry;
    const urlString = typeof entry.url === "string" ? entry.url : "";
    const pathOnly = urlString.startsWith(base)
      ? urlString.slice(base.length) || "/"
      : urlString;
    const isRawAsset =
      RAW_ASSET_RE.test(pathOnly) || pathOnly.startsWith("/.well-known/");
    if (isRawAsset) return entry;
    return { ...entry, images: [ogImageFor(pathOnly)] };
  });
}
