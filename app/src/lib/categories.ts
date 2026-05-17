/**
 * Categories — fifth pSEO surface, fully derived from existing manifests.
 *
 * Each category is a canonical bucket that maps raw manifest category
 * strings (which are free-form across funnel-teardowns.ts, pricing-
 * teardowns.ts, comparisons.ts) into a single normalized slug. The
 * /category/[slug] route then aggregates every product, teardown, and
 * comparison in that bucket into a single high-intent landing page.
 *
 * Why this surface earns its own pattern:
 *   Buyers searching "best [X] for indie SaaS" want a curated comparison
 *   landing page, not 27 individual comparisons to choose between. The
 *   category page IS the answer to that query — it lists every product
 *   we've analyzed in the category and links into the deep content.
 *
 * Zero new analytical writing — this is a pure aggregation layer. New
 * teardowns or comparisons added to the underlying manifests appear on
 * the matching category page automatically on next build.
 *
 * Brunson Hard-Rule reconciliation: the category pages do not slag any
 * product; they list and link. Honesty inherits from the underlying
 * teardown and comparison pages.
 */

import {
  TEARDOWNS,
  type FunnelTeardown,
} from "@/lib/funnel-teardowns";
import {
  PRICING_TEARDOWNS,
  type PricingTeardown,
} from "@/lib/pricing-teardowns";
import {
  COMPARISONS,
  type Comparison,
} from "@/lib/comparisons";

export interface CategoryDef {
  /** URL slug. Kebab-case. */
  slug: string;
  /** Display name for hub listing and hero. */
  displayName: string;
  /** 1-line summary for hub listing. */
  oneLine: string;
  /**
   * 40-60 word intent paragraph for AEO citation block on the
   * category page. Must stand alone and end with a specific reader
   * takeaway.
   */
  intent: string;
  /**
   * Raw manifest category strings that map into this canonical bucket.
   * Categories drift over time (different writers, different framings);
   * the matcher list keeps the mapping explicit rather than fragile.
   */
  matchers: ReadonlyArray<string>;
  /** Tags for hub grouping (currently unused but matches schema convention). */
  tags: ReadonlyArray<string>;
}

// -- Canonical category catalog ----------------------------------------------

const CATEGORIES_LIST: CategoryDef[] = [
  {
    slug: "payments",
    displayName: "Payments and creator monetization",
    oneLine:
      "Payment processors, Merchant of Record platforms, and creator monetization tools — the infrastructure that decides whether your customer actually pays.",
    intent:
      "Payments tooling for indie SaaS spans three categories that share an outcome (collect money) but differ on legal shape: payment processors (Stripe, Square, PayPal), Merchant of Record platforms (Lemon Squeezy, Paddle, Polar), and creator monetization layers (Gumroad, Polar, Beehiiv). The right pick depends on whether you sell globally (MoR helps), whether you sell to consumers (PayPal helps), and whether your audience is technical (Stripe wins on DX).",
    matchers: [
      "Payments and Merchant of Record",
      "Payments processing",
      "Payments infrastructure",
      "Creator monetization",
      "Creator monetization and payments",
      "Creator monetization and Merchant of Record",
    ],
    tags: ["payments", "monetization", "infrastructure"],
  },
  {
    slug: "forms",
    displayName: "Forms and surveys",
    oneLine:
      "Form builders for SaaS marketing pages, signups, and customer feedback — Tally, Typeform, Google Forms, and the structural pricing fight between them.",
    intent:
      "Form tools for indie SaaS are a pricing-model fight as much as a feature fight. Typeform anchors the category at premium per-response pricing; Tally rebuilt the same UX with free-forever unlimited submissions; Google Forms is free for Google Workspace teams but utilitarian for public marketing surfaces. The right pick depends on whether your form lives on a public marketing page (Tally wins on aesthetic-plus-pricing) or inside a Google Workspace flow (Google Forms wins on integration).",
    matchers: ["Forms and surveys"],
    tags: ["forms", "lead-capture", "marketing"],
  },
  {
    slug: "analytics",
    displayName: "Privacy analytics",
    oneLine:
      "Web analytics without the cookie banner — Plausible, Fathom, Simple Analytics, and the values fight against Google Analytics.",
    intent:
      "Privacy analytics is a values-aligned category: cookie-free, GDPR-by-construction, customer-funded analytics that replaces Google Analytics for buyers who reject ad-tech-funded tracking. Plausible and Fathom are the canonical pair; Simple Analytics and Matomo are adjacent options. For most indie SaaS in 2026, the choice is which privacy alternative, not whether to leave Google Analytics — the values trade is what determines the switch.",
    matchers: ["Privacy analytics"],
    tags: ["analytics", "privacy", "values-aligned"],
  },
  {
    slug: "newsletter",
    displayName: "Newsletter and creator email",
    oneLine:
      "Newsletter platforms for creators and SaaS founders — Beehiiv, Substack, Kit (ConvertKit), and the publication-as-business decision.",
    intent:
      "Newsletter tools for indie SaaS split on philosophy: Substack is a publication network that takes a revenue share for cross-discovery; Beehiiv is a creator-business platform with ad network and Boost mechanics; Kit (formerly ConvertKit) is an email-marketing platform broader than newsletters. The right pick depends on whether the newsletter IS the business (Beehiiv), is one channel of a creator business (Kit), or rides a network (Substack).",
    matchers: [
      "Newsletter platform",
      "Newsletter and creator email",
      "SaaS email platform",
    ],
    tags: ["newsletter", "creator-tools", "monetization"],
  },
  {
    slug: "scheduling",
    displayName: "Scheduling",
    oneLine:
      "Calendar scheduling tools for sales calls, demos, and customer meetings — Cal.com, Calendly, and the open-source-vs-incumbent choice.",
    intent:
      "Scheduling tools for indie SaaS are functionally near-identical at the standard use case (round-robin, collective events, integrations). The choice is values-aligned: Cal.com is the open-source challenger with self-host option and generous free tier; Calendly is the closed-SaaS category default with mature integration ecosystem and brand recognition with bookers. For most indie founders, Cal.com is the better default; for enterprise-procured teams, Calendly retains the brand familiarity advantage.",
    matchers: ["Scheduling"],
    tags: ["scheduling", "sales-tools", "calendar"],
  },
  {
    slug: "email-api",
    displayName: "Email APIs and transactional email",
    oneLine:
      "Transactional email infrastructure for SaaS — Resend, Postmark, SendGrid, and the modern-vs-legacy developer-experience axis.",
    intent:
      "Email API tooling for indie SaaS splits on modernity. Resend is the modern challenger with React Email integration and clean DX; Postmark is the deliverability-first incumbent with longer track record; SendGrid is the legacy enterprise platform. For new indie SaaS in 2026, Resend's DX advantage usually wins; for organizations with deep SendGrid integration or specific compliance needs, the migration cost may not justify the switch.",
    matchers: ["Email API"],
    tags: ["email", "transactional", "developer-tools"],
  },
  {
    slug: "docs",
    displayName: "Developer documentation",
    oneLine:
      "Documentation platforms for API and developer-tool companies — Mintlify, GitBook, ReadMe, and the docs-as-marketing decision.",
    intent:
      "Documentation tools for dev-tool indie SaaS now compete on aesthetic as much as feature set. Mintlify is the modern challenger with the docs aesthetic that defines the category (Anthropic, Cursor, Resend); GitBook is the broader knowledge-platform option; ReadMe serves enterprise API platforms with metering and developer-hub features. For new API docs in 2026, Mintlify is the default; the alternatives serve specific niches.",
    matchers: ["Developer documentation"],
    tags: ["documentation", "developer-tools", "api-docs"],
  },
  {
    slug: "testimonials",
    displayName: "Testimonial collection",
    oneLine:
      "Tools for collecting and displaying social proof on SaaS marketing surfaces — Senja, Testimonial.to, and the brand-removal-trigger pricing model.",
    intent:
      "Testimonial tools for indie SaaS solve a universal pain (collecting and displaying video and text testimonials without a custom build) at the same approximate price band. Senja and Testimonial.to are functionally near-identical; the choice is workflow-shape and aesthetic preference. The structural decision matters more than the brand decision: stop building testimonial display yourself and use one of the dedicated tools.",
    matchers: ["Testimonial collection"],
    tags: ["social-proof", "testimonials", "marketing"],
  },
  {
    slug: "video",
    displayName: "Screen recording and marketing video",
    oneLine:
      "Tools for producing screen-recorded marketing videos and async sales pitches — Screen Studio, Tella, Loom, and the polish-vs-speed tradeoff.",
    intent:
      "Screen recording tools for indie SaaS split on polish-vs-speed. Loom optimizes for fast async team communication; Tella and Screen Studio optimize for polished marketing video. Screen Studio is the one-time-license desktop tool for solo operators; Tella is the team SaaS with subscription pricing and collaboration features. Most serious indie founders end up using both — Loom for async, one of the polished tools for marketing-page videos.",
    matchers: [
      "Video for SaaS sales",
      "Screen recording for marketing video",
      "Screen recording",
    ],
    tags: ["video", "marketing-tools", "async-communication"],
  },
  {
    slug: "workspace",
    displayName: "Productivity and notes",
    oneLine:
      "Workspace and knowledge tools for teams and individuals — Notion, Coda, Obsidian, and the team-versus-individual workflow split.",
    intent:
      "Workspace tools for indie SaaS split on team-versus-individual orientation. Notion is the cloud-first team workspace with databases and real-time collaboration; Coda is the database-first canvas with documents wrapped around it; Obsidian is the local-first knowledge graph for individuals building long-term notes. For team docs and wikis, Notion is the safer default; for ops-heavy teams, Coda earns its complexity; for personal knowledge work, Obsidian's local-first model wins.",
    matchers: [
      "Productivity and workspace",
      "Workspace and productivity",
      "Notes and knowledge management",
    ],
    tags: ["workspace", "productivity", "knowledge-management"],
  },
  {
    slug: "project-management",
    displayName: "Project management",
    oneLine:
      "Issue tracking and project planning for software teams — Linear, Jira, Asana, and the engineering-vs-cross-functional axis.",
    intent:
      "Project management tools for indie SaaS split on team composition. Linear is the speed-first opinionated issue tracker for engineering teams; Jira is the configurable enterprise default for orgs that inherited it; Asana is the cross-functional task manager for teams that mix engineering with marketing, design, and ops. For all-engineer teams, Linear is the obvious pick; for cross-functional teams, Asana matches the work shape; Jira is rarely the right new choice but often the inherited reality.",
    matchers: [
      "Project management for software teams",
      "Project management",
    ],
    tags: ["project-management", "developer-tools", "team-tools"],
  },
  {
    slug: "design",
    displayName: "Design and prototyping",
    oneLine:
      "Design tools for product teams and indie founders — Figma, Sketch, Adobe XD, and the browser-native category winner.",
    intent:
      "Design tools for indie SaaS effectively settled around 2020. Figma's browser-native multiplayer changed the category permanently; Sketch retains a Mac-only solo-designer niche; Adobe XD is no longer a strategic priority at Adobe. For any new design team in 2026, Figma is the default — viewer-free pricing, plugin ecosystem, dev handoff, and design-systems community all sit with Figma.",
    matchers: ["Design and prototyping"],
    tags: ["design", "collaboration", "browser-native"],
  },
  {
    slug: "hosting",
    displayName: "Frontend cloud and hosting",
    oneLine:
      "Modern frontend hosting for SaaS marketing sites and apps — Vercel, Netlify, Cloudflare Pages, and the Next.js-vs-framework-agnostic split.",
    intent:
      "Frontend hosting for indie SaaS splits on framework focus. Vercel goes deep on Next.js with the strongest DX, AI tooling, and platform services; Netlify stays framework-agnostic with mature breadth; Cloudflare Pages anchors to the global edge network with permissive commercial-use free tier. For Next.js teams, Vercel is the obvious pick; for framework-agnostic or cost-sensitive teams, Netlify or Cloudflare Pages are reasonable alternatives.",
    matchers: ["Frontend cloud and hosting"],
    tags: ["hosting", "developer-tools", "edge-compute"],
  },
];

// Indexed lookup.
const CATEGORIES_BY_SLUG: Map<string, CategoryDef> = new Map(
  CATEGORIES_LIST.map((c) => [c.slug, c]),
);

/** Read-only catalog. Iteration order is canonical. */
export const CATEGORIES: ReadonlyArray<CategoryDef> = CATEGORIES_LIST;

/** Slug list for generateStaticParams and sitemap.ts. */
export const CATEGORY_SLUGS: ReadonlyArray<string> = CATEGORIES_LIST.map(
  (c) => c.slug,
);

export function getCategoryBySlug(slug: string): CategoryDef | undefined {
  return CATEGORIES_BY_SLUG.get(slug);
}

/**
 * Reverse lookup: given a raw manifest `category` string (the free-form
 * field on FunnelTeardown / PricingTeardown / Comparison entries), find
 * the canonical CategoryDef whose matcher list contains that string.
 * Returns undefined when no category bucket matches — useful as a guard
 * for detail-page cross-links.
 */
export function getCategoryByRawString(
  rawCategory: string,
): CategoryDef | undefined {
  return CATEGORIES_LIST.find((cat) => cat.matchers.includes(rawCategory));
}

// -- Aggregator helpers ------------------------------------------------------

/**
 * Funnel teardowns whose raw category string maps into this canonical
 * category. Returned in catalog order.
 */
export function getFunnelTeardownsInCategory(
  slug: string,
): ReadonlyArray<FunnelTeardown> {
  const def = CATEGORIES_BY_SLUG.get(slug);
  if (!def) return [];
  const matchers = new Set(def.matchers);
  return TEARDOWNS.filter((t) => matchers.has(t.category));
}

/**
 * Pricing teardowns whose raw category string maps into this canonical
 * category. Returned in catalog order.
 */
export function getPricingTeardownsInCategory(
  slug: string,
): ReadonlyArray<PricingTeardown> {
  const def = CATEGORIES_BY_SLUG.get(slug);
  if (!def) return [];
  const matchers = new Set(def.matchers);
  return PRICING_TEARDOWNS.filter((t) => matchers.has(t.category));
}

/**
 * Comparisons whose raw category string maps into this canonical
 * category. Returned in catalog order.
 */
export function getComparisonsInCategory(
  slug: string,
): ReadonlyArray<Comparison> {
  const def = CATEGORIES_BY_SLUG.get(slug);
  if (!def) return [];
  const matchers = new Set(def.matchers);
  return COMPARISONS.filter((c) => matchers.has(c.category));
}

/**
 * Combined product roster for a category: deduplicates products that
 * appear in both funnel and pricing teardowns, then returns a list of
 * { name, funnelSlug?, pricingSlug? } entries for the category page.
 * Iteration order: funnel teardowns first (catalog order), then pricing-
 * only entries that don't have a funnel teardown.
 */
export interface CategoryProductRoster {
  name: string;
  funnelSlug?: string;
  pricingSlug?: string;
  oneLine: string;
}

export function getProductRosterForCategory(
  slug: string,
): ReadonlyArray<CategoryProductRoster> {
  const funnel = getFunnelTeardownsInCategory(slug);
  const pricing = getPricingTeardownsInCategory(slug);

  const bySlug = new Map<string, CategoryProductRoster>();

  // Seed with funnel teardowns (canonical first).
  for (const t of funnel) {
    bySlug.set(t.slug, {
      name: t.displayName,
      funnelSlug: t.slug,
      oneLine: t.oneLine,
    });
  }

  // Merge in pricing teardowns; if the slug is already present, attach
  // pricingSlug, otherwise add as pricing-only entry.
  for (const t of pricing) {
    const existing = bySlug.get(t.slug);
    if (existing) {
      bySlug.set(t.slug, { ...existing, pricingSlug: t.slug });
    } else {
      bySlug.set(t.slug, {
        name: t.displayName,
        pricingSlug: t.slug,
        oneLine: t.oneLine,
      });
    }
  }

  return Array.from(bySlug.values());
}

/**
 * Number of indexed content pages this category aggregates. Used by
 * the hub page to show the "depth" of each category at a glance.
 */
export function getContentDepthForCategory(slug: string): number {
  return (
    getFunnelTeardownsInCategory(slug).length +
    getPricingTeardownsInCategory(slug).length +
    getComparisonsInCategory(slug).length
  );
}
