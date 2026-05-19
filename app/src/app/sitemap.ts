import type { MetadataRoute } from "next";
import { ALTERNATIVE_SLUGS } from "@/lib/alternatives";
import { TEARDOWN_SLUGS } from "@/lib/funnel-teardowns";
import { PRICING_TEARDOWN_SLUGS } from "@/lib/pricing-teardowns";
import { COMPARISON_SLUGS } from "@/lib/comparisons";
import { CATEGORY_SLUGS } from "@/lib/categories";
import { PRESS_TOPIC_SLUGS } from "@/lib/press-topics";
import { GLOSSARY_SLUGS } from "@/lib/glossary";
import { WHY_ISNT_MY_SLUGS } from "@/lib/why-isnt-my";
import { NICHE_SLUGS } from "@/lib/niches";
import { BENCHMARK_SLUGS } from "@/lib/benchmarks";
import { FUNNEL_PLAYBOOK_SLUGS } from "@/lib/funnel-playbooks";
import { ANSWER_SLUGS } from "@/lib/answers";
import { SWIPE_FILE_SLUGS } from "@/lib/swipe-files";
import { SHOULD_I_BUILD_SLUGS } from "@/lib/should-i-build";
import { CHECKLIST_SLUGS } from "@/lib/checklists";
import { STACK_SLUGS } from "@/lib/stacks";
import { MIGRATE_FROM_SLUGS } from "@/lib/migrate-from";
import { POSITIONING_SLUGS } from "@/lib/positioning";
import { TEMPLATE_SLUGS } from "@/lib/templates";
import { LAUNCH_SLUGS } from "@/lib/launches";
import { FOUNDER_MISTAKE_SLUGS } from "@/lib/founder-mistakes";
import { OBJECTION_SLUGS } from "@/lib/objections";
import { SAAS_METRIC_SLUGS } from "@/lib/saas-metrics";
import { JOURNEY_SLUGS } from "@/lib/journeys";
import { SKILL_SLUGS } from "@/lib/skills";
import { EXPERIMENT_SLUGS } from "@/lib/experiments";
import { PRICING_MODEL_SLUGS } from "@/lib/pricing-models";
import { BUSINESS_TERM_SLUGS } from "@/lib/business-terms";
import { ONBOARDING_PATTERN_SLUGS } from "@/lib/onboarding-patterns";
import { RETENTION_TACTIC_SLUGS } from "@/lib/retention-tactics";
import { INTEGRATION_SLUGS } from "@/lib/integrations";
import { AUDIENCE_SLUGS } from "@/lib/audiences";
import { SAAS_FEATURE_PATTERN_SLUGS } from "@/lib/saas-feature-patterns";
import {
  allApprovedTranslations,
  approvedLocalesForPath,
} from "@/lib/i18n/registry";
import { localizedPath } from "@/lib/i18n/locales";

/**
 * Sitemap for UnlockSaaS — Surface A of the Google strategy.
 *
 * Source: strategy/google-strategy.md §A.4. Lists only the public marketing
 * routes that should be indexable. Private surfaces (the member area, the
 * diagnostic result page that exposes per-user data, the per-builder OG
 * pages, the login flow, the entire API) are excluded by omission AND
 * confirmed non-indexable via per-page `robots: { index: false }` metadata.
 *
 * `lastModified` is set to the build time, which is fine for static
 * marketing pages — the actual content changes are infrequent and a
 * build is the right cadence for "this page was updated."
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
  const now = new Date();

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
  const hreflang = (absUrl: string) => {
    const path = absUrl.startsWith(base)
      ? absUrl.slice(base.length) || "/"
      : absUrl;
    const languages: Record<string, string> = {
      "en-US": absUrl,
      "x-default": absUrl,
    };
    for (const locale of approvedLocalesForPath(path)) {
      languages[locale] = `${base}${localizedPath(path, locale)}`;
    }
    return { languages };
  };

  return [
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
    // Programmatic SEO block #4 — head-to-head comparisons.
    // Data source: src/lib/comparisons.ts. Highest-intent SaaS-research
    // search class: "[A] vs [B]". Article + FAQPage + BreadcrumbList
    // JSON-LD per detail page. CollectionPage on the hub.
    // ---------------------------------------------------------------------
    {
      url: `${base}/compare`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/compare`),
    },
    ...COMPARISON_SLUGS.map((slug) => ({
      url: `${base}/compare/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/compare/${slug}`),
    })),
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
    ...FUNNEL_PLAYBOOK_SLUGS.map((slug) => ({
      url: `${base}/funnel-playbook/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/funnel-playbook/${slug}`),
    })),
    // ---------------------------------------------------------------------
    // Programmatic SEO block #11 — direct-answer AEO pages.
    // Data source: src/lib/answers.ts. Pure citation-bait: each page
    // is a single founder-question with a 2-4 sentence direct answer
    // plus supporting bullets. QAPage + Article + BreadcrumbList JSON-LD.
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
    // Programmatic SEO block #12 — pattern-level swipe files.
    // Data source: src/lib/swipe-files.ts. Structural patterns (no
    // quoted copy) pulled from already-shipped funnel and pricing
    // teardowns, with fill-in-the-blank templates and named sources.
    // Article + FAQPage + BreadcrumbList JSON-LD per detail page.
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
    // Programmatic SEO block #13 — pre-revenue decision pages.
    // Data source: src/lib/should-i-build.ts. Honest yes/no/depends
    // verdicts on "should I build a SaaS that does X" questions. Several
    // entries deliberately say no; the trust moat is that we do not
    // green-light every idea. QAPage + Article + FAQPage + Breadcrumb
    // JSON-LD per detail page.
    // ---------------------------------------------------------------------
    {
      url: `${base}/should-i-build`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.65,
      alternates: hreflang(`${base}/should-i-build`),
    },
    ...SHOULD_I_BUILD_SLUGS.map((slug) => ({
      url: `${base}/should-i-build/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.55,
      alternates: hreflang(`${base}/should-i-build/${slug}`),
    })),
    // ---------------------------------------------------------------------
    // Programmatic SEO block #14 — pre-launch / pre-charge checklists.
    // Data source: src/lib/checklists.ts. Finite, ordered checklists
    // with observable done-conditions. HowTo + ItemList + Article +
    // FAQPage + Breadcrumb JSON-LD per detail page — HowTo is the
    // citation-friendly schema for checklist queries on AI Overviews.
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
    // Programmatic SEO block #15 — indie SaaS stack recommendations.
    // Data source: src/lib/stacks.ts. Named-tool stack recommendations
    // by use case (solo-founder, AI-wrapper, agency, newsletter, no-code,
    // marketplace, scheduling-product) and by budget. Every tool slot
    // cross-links to a shipped teardown when one exists. HowTo +
    // ItemList + Article + FAQPage + Breadcrumb JSON-LD per detail.
    // ---------------------------------------------------------------------
    {
      url: `${base}/stack`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/stack`),
    },
    ...STACK_SLUGS.map((slug) => ({
      url: `${base}/stack/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/stack/${slug}`),
    })),
    // ---------------------------------------------------------------------
    // Programmatic SEO block #16 — migration playbooks.
    // Data source: src/lib/migrate-from.ts. Bottom-funnel migration
    // guides ("I already decided, now what?"). Each entry covers
    // ClickFunnels→Stripe stack, Kajabi→indie stack, Gumroad→Lemon
    // Squeezy, Substack→Beehiiv, Typeform→Tally, Calendly→Cal.com,
    // GA4→Plausible, Notion-PM→Linear. HowTo + Article + FAQPage +
    // Breadcrumb JSON-LD per detail page. Different intent class from
    // /alternatives-to (pre-decision) and /compare (head-to-head) —
    // pure post-decision execution intent.
    // ---------------------------------------------------------------------
    {
      url: `${base}/migrate-from`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.65,
      alternates: hreflang(`${base}/migrate-from`),
    },
    ...MIGRATE_FROM_SLUGS.map((slug) => ({
      url: `${base}/migrate-from/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.55,
      alternates: hreflang(`${base}/migrate-from/${slug}`),
    })),
    // ---------------------------------------------------------------------
    // Programmatic SEO block #17 — category-specific positioning.
    // Data source: src/lib/positioning.ts. April-Dunford-style
    // positioning frameworks for indie SaaS founders building in
    // crowded categories, anchored on the Brunson Hook overlay. Each
    // entry cross-links to the matching /category page so the framework
    // resolves to actual products. Article + FAQPage + Breadcrumb
    // JSON-LD per detail page.
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
    // Programmatic SEO block #18 — Brunson-method script templates.
    // Data source: src/lib/templates.ts. Fill-in placeholders for the
    // canonical Brunson scripts the Playbook teaches: Epiphany Bridge,
    // Dollar Objection, Perfect Webinar arc, Stack Slide, Seinfeld
    // email, Soap Opera Sequence, Hook-Story-Offer page, Reluctant
    // Hero positioning. Distinct from /swipe-file (patterns observed
    // in shipped teardowns) - these are canonical method scripts with
    // structural placeholders. HowTo + Article + FAQPage + Breadcrumb.
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
    // Programmatic SEO block #19 — launch playbooks by channel.
    // Data source: src/lib/launches.ts. Action-intent pages covering
    // channel x SaaS-type intersections: Product Hunt, Twitter/X,
    // Hacker News, Indie Hackers, Reddit, LinkedIn, cold outreach,
    // newsletter swaps. Each playbook carries pre-launch build-up,
    // launch-day cadence, post-launch follow-up, honest time bands,
    // success/failure profiles, and channel-specific mistakes.
    // HowTo + Article + FAQPage + Breadcrumb JSON-LD per detail.
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
    // Programmatic SEO block #20 — strategic founder mistakes.
    // Data source: src/lib/founder-mistakes.ts. Strategic-level
    // mistake-fix pages complementing /why-isnt-my (element-level
    // diagnostics). Each entry maps a mistake to one of the Brunson
    // diagnoses (Wrong Person / Weak Offer / Weak Belief), names how
    // it shows up, why it happens, the real cost, the specific fix,
    // false fixes to avoid, and the success signal. Article +
    // FAQPage + Breadcrumb JSON-LD per detail page.
    // ---------------------------------------------------------------------
    {
      url: `${base}/founder-mistake`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.65,
      alternates: hreflang(`${base}/founder-mistake`),
    },
    ...FOUNDER_MISTAKE_SLUGS.map((slug) => ({
      url: `${base}/founder-mistake/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.55,
      alternates: hreflang(`${base}/founder-mistake/${slug}`),
    })),
    // ---------------------------------------------------------------------
    // Programmatic SEO block #21 — buyer-objection handling.
    // Data source: src/lib/objections.ts. Distinct from /answers
    // (founder questions about funnels) — these are buyer objections
    // to the offer itself ("too expensive", "no time", "can DIY",
    // "wrong timing", missing feature, "more info", "tried before",
    // "need to think"). QAPage + Article + FAQPage + Breadcrumb
    // JSON-LD per detail page. Cross-links to /template for the
    // underlying Brunson script and to /glossary for term anchors.
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
    // Programmatic SEO block #22 — SaaS metric formulas.
    // Data source: src/lib/saas-metrics.ts. Distinct from /glossary
    // (Brunson terms) and /benchmarks (directional ranges). Each
    // entry is the canonical formula + worked example + what-it-tells-
    // you / what-it-does-not + common miscalculations for one core
    // SaaS metric (MRR, ARR, CAC, LTV, LTV:CAC, churn, ARPU, payback,
    // burn multiple, NRR). DefinedTerm + Article + FAQPage +
    // Breadcrumb JSON-LD per detail page. Hub carries a
    // DefinedTermSet so retrievers can self-discover all metrics.
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
    // Programmatic SEO block #23 — milestone journey templates.
    // Data source: src/lib/journeys.ts. Pattern-based journey
    // templates (NOT case studies) for the milestone transitions
    // indie SaaS founders make: $0-to-first-customer, $1k-to-$10k MRR,
    // day-job-to-indie, freelancer-to-SaaS, builder-to-marketer,
    // solo-to-team, failed-launch-to-relaunch. Each carries phases,
    // time bands, what-to-do per phase, common detours, success
    // definition, and stuck signal. HowTo + Article + FAQPage +
    // Breadcrumb JSON-LD per detail page.
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
    // Programmatic SEO block #24 — founder skills.
    // Data source: src/lib/skills.ts. Each entry covers one specific
    // founder skill (customer development, cold email, testimonial
    // asks, pricing conversations, writing in public, customer
    // support, running demos, content creation) with what good looks
    // like, a practice plan, failure modes, and time-to-functional
    // bands. HowTo + Article + FAQPage + Breadcrumb JSON-LD.
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
    // Programmatic SEO block #25 — A/B test / experiment recipes.
    // Data source: src/lib/experiments.ts. Honest experiment recipes
    // for indie SaaS (headline, pricing, CTA, trial length, onboarding
    // email, checkout friction, social proof placement, annual-vs-
    // monthly discount). Hypothesis structure, variant design, primary
    // and secondary metrics, honest sample-size bands, procedure, and
    // the self-deceptions most founders fall into. HowTo + Article +
    // FAQPage + Breadcrumb JSON-LD per detail page.
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
    // Programmatic SEO block #26 — pricing-model deep dives.
    // Data source: src/lib/pricing-models.ts. Distinct from /pricing-
    // teardown (specific products); these are structural analyses of
    // the eight indie SaaS pricing models (flat-rate, per-seat, usage-
    // based, freemium, tiered, hybrid, pay-what-you-want, lifetime
    // deal). Each entry covers how the model works, best/worst fit,
    // unit-economics implications, implementation mistakes, and the
    // positioning trap each model often hides. Article + FAQPage +
    // Breadcrumb JSON-LD per detail page.
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
    // Programmatic SEO block #27 — non-Brunson SaaS business terms.
    // Data source: src/lib/business-terms.ts. PMF, ICP, GTM, MoR, NPS,
    // TAM/SAM/SOM, ACV, MVP. Distinct from /glossary (Brunson method
    // terms) and /saas-metric (numerical metrics with formulas).
    // DefinedTerm + Article + FAQPage + Breadcrumb JSON-LD; hub
    // carries DefinedTermSet.
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
    // Programmatic SEO block #28 — onboarding flow patterns.
    // Data source: src/lib/onboarding-patterns.ts. Eight SaaS
    // onboarding design patterns (linear walkthrough, in-product
    // checklist, sample data, just-in-time, guided setup, concierge,
    // trial-to-paid, empty-state-as-onboarding). Article + FAQPage +
    // Breadcrumb JSON-LD per detail page.
    // ---------------------------------------------------------------------
    {
      url: `${base}/onboarding-pattern`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.55,
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
    // Programmatic SEO block #29 — lifecycle-stage retention tactics.
    // Data source: src/lib/retention-tactics.ts. Eight retention
    // tactics mapped to specific lifecycle stages (week-1, month-1,
    // quarter-1, year-1, ongoing). Each carries target metric,
    // specific actions, failure modes, and when to retire. Article +
    // FAQPage + Breadcrumb JSON-LD per detail page.
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
    // Programmatic SEO block #30 — tool-pair integration patterns.
    // Data source: src/lib/integrations.ts. Pattern-level integration
    // deep dives for common indie SaaS tool pairs (Stripe+Supabase,
    // Resend+Next.js, Cal.com+Stripe, Supabase+Vercel, Stripe+Beehiiv,
    // Stripe+Loops, Tally+Supabase). Each carries what each tool owns,
    // the integration shape, implementation steps with gotchas, and
    // when NOT to build. HowTo + Article + FAQPage + Breadcrumb
    // JSON-LD. Build-time guard enforces teardown-slug integrity.
    // ---------------------------------------------------------------------
    {
      url: `${base}/integration`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.55,
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
    // Programmatic SEO block #31 — platform-specific audience-building.
    // Data source: src/lib/audiences.ts. Sustained audience-building
    // playbooks by platform (Twitter/X, LinkedIn, newsletter, podcast,
    // YouTube, Reddit). Distinct from /launch (event-specific) and
    // /skill/writing-in-public (skill practice plan). Each entry
    // covers who it fits, cadence, monthly playbook from month 1 to
    // month 12+, milestone subscriber counts, stuck patterns, and
    // comparison to other platforms. HowTo + Article + FAQPage +
    // Breadcrumb JSON-LD. Build-time guard enforces niche-slug
    // integrity.
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
    // Programmatic SEO block #32 — SaaS growth feature patterns.
    // Data source: src/lib/saas-feature-patterns.ts. Structural design
    // patterns for the SaaS growth features indie founders most often
    // build — referral programs, freemium gates, paywalls, upgrade
    // prompts, in-app surveys, annual upgrade prompts, team invitation
    // flows. Article + FAQPage + Breadcrumb JSON-LD per detail page.
    // Distinct from /onboarding-pattern (onboarding-specific) and
    // /pricing-model (pricing-structure).
    // ---------------------------------------------------------------------
    {
      url: `${base}/saas-feature-pattern`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.55,
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
    // LLM-readable surfaces (Surface B – GEO/AEO).
    // Three routes are public, indexable bodies that AI retrievers
    // (Perplexity, ClaudeBot, GPTBot/OAI-SearchBot, Google AI Overviews,
    // Gemini, You.com) treat as the canonical paraphrase target for the
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
    // -------------------------------------------------------------------------
    ...allApprovedTranslations().map((row) => {
      const localised = `${base}${localizedPath(row.path, row.locale)}`;
      const canonical =
        row.path === "/" ? `${base}/` : `${base}${row.path}`;
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
      };
    }),
  ];
}
