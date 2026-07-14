/**
 * Compare catalog – lightweight Switzerland-style head-to-head shopping
 * comparator. Sister surface to /vs/[slug] but with a distinct angle and
 * a non-overlapping slug set:
 *
 *   /vs/[slug]        – long-form dimensional editorial (6-9 dimensions,
 *                       per-side Review JSON-LD, deep FAQs). Companies
 *                       that already have /funnel-teardown or
 *                       /pricing-teardown coverage.
 *   /compare/[slug]   – quick-verdict comparator with a 5-criterion
 *                       scoring table, "pick A if / pick B if" bullets,
 *                       a "when neither fits" note (the Switzerland tell
 *                       that earns trust), and a tighter FAQ. Targets
 *                       category pairs the deep /vs surface does not
 *                       yet cover, expanding the head-to-head search
 *                       surface without duplicating the editorial work.
 *
 * Greg Isenberg / 2026 distribution rationale: G2 owns the "[A] vs [B]"
 * SERP because nobody else builds these at scale. Every page funnels to
 * the Diagnostic CTA – the reader's offer is the real lever regardless of
 * which tool they pick. Symmetric framing means both vendors get fair
 * treatment, both sides feel cited, and the page earns reciprocal links
 * over time.
 *
 * Brunson Hard-Rule reconciliation: no slag, no fabricated metrics, no
 * invented testimonials. Every entry carries a dated `lastVerified` and
 * an explicit `whenNeitherFits` to keep the Switzerland framing honest.
 *
 * Scaling path: append entries. Sitemap, llms-feed, and the hub auto-
 * extend on next build. Aim is 50+ entries covering the categories
 * indie founders search most: email, newsletter, landing page, no-code
 * site, community, creator commerce, no-code DB, CRM, product
 * analytics, SEO, AI writing.
 */

import { COMPARISON_SLUGS } from "@/lib/comparisons";

export type CompareCriterionWinner = "A" | "B" | "tie" | "different";

export interface CompareCriterion {
  /** Criterion name (e.g. "Free tier", "Pricing model", "Onboarding"). */
  name: string;
  /** One-line observation about product A on this criterion. */
  a: string;
  /** One-line observation about product B on this criterion. */
  b: string;
  /**
   * Honest verdict per criterion, same vocabulary as /vs:
   *  - "A": A is clearly better for most buyers
   *  - "B": B is clearly better for most buyers
   *  - "tie": genuinely comparable
   *  - "different": not directly comparable; different shape of value
   */
  winner: CompareCriterionWinner;
}

export interface CompareSide {
  /** Proper-noun display name. */
  name: string;
  /** Canonical homepage URL. */
  url: string;
}

export interface CompareFaq {
  q: string;
  a: string;
}

export interface CompareEntry {
  /** URL slug, convention: "product-a-vs-product-b". */
  slug: string;
  /** Side A. */
  a: CompareSide;
  /** Side B. */
  b: CompareSide;
  /** Short category label for hub grouping. */
  category: string;
  /** Single-line thesis (becomes the SEO description). */
  oneLine: string;
  /**
   * 40-60 word TL;DR shaped for AEO citation. Must name both products,
   * name the structural difference, and end with the decision rule a
   * reader can apply.
   */
  tldr: string;
  /** 3 reasons to pick A. */
  pickAIf: ReadonlyArray<string>;
  /** 3 reasons to pick B. */
  pickBIf: ReadonlyArray<string>;
  /** 5-7 criteria scored symmetrically. */
  criteria: ReadonlyArray<CompareCriterion>;
  /**
   * The Switzerland tell – when neither product is actually right. Earns
   * trust by admitting both can be wrong for some readers. Names the
   * third option category (not a specific tool) so we never look like
   * we are steering to a sponsor.
   */
  whenNeitherFits: string;
  /**
   * Indie founder recommendation. May be A, B, or "depends". Honest call
   * for a post-launch pre-revenue SaaS founder specifically.
   */
  forFounder: {
    pick: "A" | "B" | "depends";
    /** 1-2 sentence reasoning. */
    reasoning: string;
  };
  /** 3-4 FAQs targeting PAA phrasings for "[A] vs [B]" queries. */
  faqs: ReadonlyArray<CompareFaq>;
  /** Tags for hub grouping and related linking. */
  tags: ReadonlyArray<string>;
  /** ISO date of last manual sanity check. */
  lastVerified: string;
}

// -- Catalog -----------------------------------------------------------------

const COMPARE_LIST: CompareEntry[] = [
  // 1. Newsletter platforms ---------------------------------------------------
  {
    slug: "convertkit-vs-beehiiv",
    a: { name: "ConvertKit", url: "https://convertkit.com/" },
    b: { name: "beehiiv", url: "https://www.beehiiv.com/" },
    category: "Newsletter platforms",
    oneLine:
      "ConvertKit is creator-tooling that happens to send newsletters. beehiiv is newsletter-tooling that happens to monetise.",
    tldr:
      "ConvertKit (now Kit) optimises for selling digital products to a list: tags, sequences, commerce, courses. beehiiv optimises for growing and monetising a newsletter as a media business: ad network, referral program, recommendations. Pick ConvertKit if the list is a means to sell. Pick beehiiv if the newsletter is the product.",
    pickAIf: [
      "Your goal is selling courses, ebooks, memberships, or coaching to a list.",
      "You need deep tagging, segmentation, and automation around buyer behaviour.",
      "You want a Stripe-connected creator commerce layer next to email.",
    ],
    pickBIf: [
      "The newsletter itself is the product or the top-of-funnel media asset.",
      "You want a built-in ad network and referral / recommendation engine.",
      "You want a clean web archive with native paid-subscriber support.",
    ],
    criteria: [
      {
        name: "Primary use case",
        a: "Sell digital products to an owned list.",
        b: "Grow and monetise a newsletter as a media business.",
        winner: "different",
      },
      {
        name: "Free tier",
        a: "Up to 10,000 subscribers on the free Newsletter plan, with restrictions on automation.",
        b: "Up to 2,500 subscribers free with the full publishing toolset.",
        winner: "A",
      },
      {
        name: "Monetisation built-in",
        a: "Commerce (digital products, tip jars, paid recommendations) sits inside the platform.",
        b: "Built-in Boosts ad network, Premium subscriptions, referral programme, and Apollo ad system.",
        winner: "B",
      },
      {
        name: "Automation depth",
        a: "Visual automation builder with conditional logic, deep tagging, and event-based triggers.",
        b: "Automations exist but are leaner; focus is publishing not lifecycle.",
        winner: "A",
      },
      {
        name: "Web presence",
        a: "Landing pages and forms; web archive is functional, not the centre of gravity.",
        b: "Hosted publication site with SEO, custom domain, and reader UX as the centre of gravity.",
        winner: "B",
      },
      {
        name: "Founder fit",
        a: "Indie founders selling Lifetime Access, course bundles, templates, OTOs.",
        b: "Operators running a newsletter-first media business or community.",
        winner: "different",
      },
    ],
    whenNeitherFits:
      "Pick neither if your real bottleneck is acquisition, not tooling. A 200-person list on Mailchimp converts the same as a 200-person list on either of these. The platform stops mattering until you can repeatedly fill it.",
    forFounder: {
      pick: "depends",
      reasoning:
        "If you are post-launch pre-revenue on a SaaS, ConvertKit fits the lifecycle work (onboarding sequences, retention, win-backs). If your wedge is a free newsletter that earns trust then sells the SaaS, beehiiv carries that motion natively.",
    },
    faqs: [
      {
        q: "Is beehiiv cheaper than ConvertKit?",
        a: "At small list sizes (under ~1,000 subscribers) both have generous free tiers. As you scale, beehiiv's paid plans tend to be cheaper per subscriber, but ConvertKit bundles commerce features beehiiv charges separately for.",
      },
      {
        q: "Can I run a paid newsletter on ConvertKit?",
        a: "Yes via the Paid Newsletter feature, but the metaphors and UI are built around creator commerce, not subscription media. beehiiv's Premium Subscriptions feel more native.",
      },
      {
        q: "Can I migrate from one to the other?",
        a: "Both support CSV import / export of subscribers. Tagging, segments, and automation logic do not transfer cleanly – budget time to rebuild that layer.",
      },
    ],
    tags: ["newsletter", "email", "creator-economy"],
    lastVerified: "2026-05-22",
  },

  // 2. SMB email marketing ----------------------------------------------------
  {
    slug: "mailchimp-vs-mailerlite",
    a: { name: "Mailchimp", url: "https://mailchimp.com/" },
    b: { name: "MailerLite", url: "https://www.mailerlite.com/" },
    category: "SMB email marketing",
    oneLine:
      "Mailchimp is the category-defining all-in-one with the legacy UI tax. MailerLite is the cleaner, cheaper alternative built for indies and small teams.",
    tldr:
      "Mailchimp owns brand recognition and the deepest integration ecosystem, but pricing climbs sharply and the UI carries legacy weight. MailerLite ships a faster editor, a more honest pricing curve, and enough automation depth for most indie SaaS founders. Pick Mailchimp for marketplace integrations; pick MailerLite for cost-per-subscriber and editor speed.",
    pickAIf: [
      "Your stack relies on specific Mailchimp integrations or marketplace apps.",
      "You need a one-vendor surface for email, ads, landing pages, and CRM.",
      "Your team already knows Mailchimp and switching cost outweighs savings.",
    ],
    pickBIf: [
      "You want a cleaner editor and faster onboarding.",
      "Cost per subscriber matters and Mailchimp's pricing curve hurts at your size.",
      "You want a generous free tier without the legacy UI tax.",
    ],
    criteria: [
      {
        name: "Free tier",
        a: "Up to 500 contacts and 1,000 monthly sends on the free plan.",
        b: "Up to 1,000 subscribers and 12,000 monthly emails on the free plan.",
        winner: "B",
      },
      {
        name: "Pricing curve",
        a: "Climbs aggressively past 2,000 contacts; multiple feature gates per tier.",
        b: "Linear, transparent per-subscriber pricing with most features on every tier.",
        winner: "B",
      },
      {
        name: "Editor and UX",
        a: "Powerful but heavy; menus and naming reflect a long product history.",
        b: "Modern drag-and-drop editor that loads fast and gets out of the way.",
        winner: "B",
      },
      {
        name: "Integrations and ecosystem",
        a: "Hundreds of native integrations; many SaaS apps ship Mailchimp connectors first.",
        b: "Solid integration list and Zapier coverage, but fewer first-party connectors.",
        winner: "A",
      },
      {
        name: "Automation depth",
        a: "Customer Journey builder is mature; behaviour-based triggers across many sources.",
        b: "Workflow automation is capable for most use cases but shallower at the edges.",
        winner: "A",
      },
      {
        name: "Deliverability and reputation",
        a: "Industry-leading sender reputation and infrastructure.",
        b: "Strong deliverability; smaller sender reputation surface area.",
        winner: "tie",
      },
    ],
    whenNeitherFits:
      "If transactional email is the actual job, neither is the right tool. Use a transactional-first provider (Resend, Postmark, SES) and reserve marketing email for the platform you actually open weekly.",
    forFounder: {
      pick: "B",
      reasoning:
        "For a post-launch pre-revenue founder, MailerLite gives more headroom on the free tier, a cleaner editor, and a pricing curve that does not punish growth. Switch to Mailchimp later only if a specific integration forces it.",
    },
    faqs: [
      {
        q: "Is MailerLite as deliverable as Mailchimp?",
        a: "For typical indie founder volumes both deliver well. Mailchimp's sender reputation is larger, but MailerLite invests heavily in deliverability infrastructure and is at parity for most senders.",
      },
      {
        q: "Can I migrate from Mailchimp to MailerLite?",
        a: "Yes – MailerLite provides direct CSV / API import and ships a migration tool. Automations and templates need to be rebuilt; subscribers, tags, and groups transfer cleanly.",
      },
      {
        q: "Which one is better for ecommerce email?",
        a: "Both integrate with Shopify and WooCommerce. Mailchimp's ecommerce flows are more mature; MailerLite covers the basics and is closing the gap.",
      },
    ],
    tags: ["email", "marketing-automation", "smb"],
    lastVerified: "2026-05-22",
  },

  // 3. Paid newsletter publishing --------------------------------------------
  {
    slug: "substack-vs-ghost",
    a: { name: "Substack", url: "https://substack.com/" },
    b: { name: "Ghost", url: "https://ghost.org/" },
    category: "Paid newsletter publishing",
    oneLine:
      "Substack is a marketplace you publish into. Ghost is software you run yourself (or via managed hosting).",
    tldr:
      "Substack gives instant distribution through its recommendation network and discovery surfaces, in exchange for a 10% revenue cut and platform-owned audience relationships. Ghost ships open-source publishing software with no revenue share and full data ownership, but you bring your own audience. Pick Substack to leverage network distribution; pick Ghost to own the asset.",
    pickAIf: [
      "You want instant discovery through Substack's recommendation graph.",
      "You do not want to touch DNS, themes, or hosting.",
      "Network effects from being listed inside Substack's app matter to you.",
    ],
    pickBIf: [
      "You want to own your audience, data, and brand without a platform cut.",
      "Custom design, custom domain, and full SEO control matter.",
      "You plan to add membership, courses, or non-newsletter products later.",
    ],
    criteria: [
      {
        name: "Revenue share",
        a: "10% of paid subscription revenue, plus Stripe fees.",
        b: "0% revenue share; you pay only platform / hosting cost plus Stripe fees.",
        winner: "B",
      },
      {
        name: "Built-in distribution",
        a: "Recommendations, Notes, app discovery, and the Substack network drive meaningful new subscribers.",
        b: "Zero built-in network; growth is entirely on you (SEO, social, referrals).",
        winner: "A",
      },
      {
        name: "Audience ownership",
        a: "Subscribers are yours, but the relationship is mediated by Substack's product.",
        b: "Full ownership including data export, hosting choice, and custom domain.",
        winner: "B",
      },
      {
        name: "Customisation",
        a: "Limited theme controls; consistent look across all Substack publications.",
        b: "Full theme customisation; Handlebars templates; integration with any frontend.",
        winner: "B",
      },
      {
        name: "Time-to-first-post",
        a: "Minutes – sign up, write, publish.",
        b: "Hours on Ghost(Pro), days self-hosted; theme, domain, and member configuration up front.",
        winner: "A",
      },
      {
        name: "Beyond newsletters",
        a: "Newsletter-first; podcasts and threads supported, but bound to Substack's metaphors.",
        b: "Memberships, tiered access, custom integrations, full API – a CMS that happens to send email.",
        winner: "B",
      },
    ],
    whenNeitherFits:
      "If you publish under five posts a year, neither tool earns its keep. A static site plus an email service (Buttondown, Resend Broadcast) costs less, owns the data, and removes the publishing-platform cognitive load.",
    forFounder: {
      pick: "B",
      reasoning:
        "Indie SaaS founders should own the audience asset. Ghost gives you a real CMS with no revenue share, custom domain from day one, and a path to membership-gated content later when the product matures.",
    },
    faqs: [
      {
        q: "Can I migrate from Substack to Ghost?",
        a: "Yes – Ghost ships a Substack importer that handles posts, subscribers, and paid-member metadata. The DNS and Stripe reconnection are the manual steps.",
      },
      {
        q: "Does Ghost have built-in growth like Substack does?",
        a: "No. Ghost has no recommendation network. You bring growth via SEO, social, partnerships, and referrals. That is the trade-off for keeping 100% of revenue.",
      },
      {
        q: "Is Substack actually free?",
        a: "Free for free newsletters. Paid subscriptions cost 10% to Substack plus standard Stripe processing fees.",
      },
    ],
    tags: ["newsletter", "publishing", "membership"],
    lastVerified: "2026-05-22",
  },

  // 4. Single-page sites ------------------------------------------------------
  {
    slug: "carrd-vs-tilda",
    a: { name: "Carrd", url: "https://carrd.co/" },
    b: { name: "Tilda", url: "https://tilda.cc/" },
    category: "Single-page site builders",
    oneLine:
      "Carrd is the indie single-page builder priced to be forgettable. Tilda is the design-led block builder with deeper layout control.",
    tldr:
      "Carrd ships one-page sites in minutes for under twenty dollars a year; the constraint is the surface area. Tilda offers a richer block library, multi-page sites, and finer layout control at meaningfully higher cost. Pick Carrd for a single landing page that needs to exist by Friday. Pick Tilda when design polish or multiple pages drive the decision.",
    pickAIf: [
      "You need one landing page live this week for under thirty dollars.",
      "Your scope is a launch page, a link-in-bio, or a coming-soon teaser.",
      "Editing speed matters more than design ambition.",
    ],
    pickBIf: [
      "You want design polish and a deep block library out of the box.",
      "You need multiple pages with shared navigation and a real CMS.",
      "Custom typography and pixel-level layout control are non-negotiable.",
    ],
    criteria: [
      {
        name: "Pricing",
        a: "$19/year Pro plan covers most indie needs; free tier exists.",
        b: "$15/month Personal, $25/month Business; no genuinely free tier for production.",
        winner: "A",
      },
      {
        name: "Page model",
        a: "Single-page sites by design; multi-page via Pro Plus tier.",
        b: "Multi-page sites with shared navigation native from the basic plan.",
        winner: "B",
      },
      {
        name: "Block library",
        a: "Functional set of headers, sections, lists, forms.",
        b: "Hundreds of pre-designed blocks across categories.",
        winner: "B",
      },
      {
        name: "Editing speed",
        a: "Minimal UI; landing page live in under thirty minutes.",
        b: "Richer editor with a steeper learning curve.",
        winner: "A",
      },
      {
        name: "Custom code",
        a: "Embed widget on Pro; analytics scripts and custom HTML supported.",
        b: "Full HTML / CSS / JS injection per block.",
        winner: "B",
      },
      {
        name: "Indie fit",
        a: "Default tool for indies launching a single page.",
        b: "Better for designers and operators with a multi-page brand site.",
        winner: "different",
      },
    ],
    whenNeitherFits:
      "If the site is supposed to convert paid traffic, neither builder is the bottleneck – the offer is. A converting page on Carrd outperforms a beautiful page on Tilda when the offer is right. Fix the offer first.",
    forFounder: {
      pick: "A",
      reasoning:
        "For a post-launch pre-revenue founder, Carrd's $19/year tier is the right default. Ship the landing page in an afternoon. Reinvest the saved time and money into the offer and the diagnostic loop, not the layout system.",
    },
    faqs: [
      {
        q: "Can Carrd run a real SaaS marketing site?",
        a: "Yes for a single high-converting landing page. For docs, blog, pricing page, and multiple campaigns, you outgrow Carrd quickly and Tilda or a real CMS fits better.",
      },
      {
        q: "Is Tilda overkill for an indie founder?",
        a: "If the brief is a launch page, yes. If the brief is a brand site with sections, content, and ongoing copy work, Tilda earns the price.",
      },
      {
        q: "Which has better SEO?",
        a: "Tilda gives more head, body, and structured-data control. Carrd handles the basics well but is built around a single page.",
      },
    ],
    tags: ["landing-page", "no-code", "site-builder"],
    lastVerified: "2026-05-22",
  },

  // 5. Design-led website builders -------------------------------------------
  {
    slug: "webflow-vs-framer",
    a: { name: "Webflow", url: "https://webflow.com/" },
    b: { name: "Framer", url: "https://www.framer.com/" },
    category: "Design-led website builders",
    oneLine:
      "Webflow is a visual front-end framework for designers who think in CSS. Framer is a design tool that publishes – fast, opinionated, animation-first.",
    tldr:
      "Webflow exposes the CSS box model and gives you a CMS that scales to real content sites. Framer hides CSS behind a tighter design tool, ships fast, and feels right when motion and polish matter more than CMS depth. Pick Webflow for a content site with structured data. Pick Framer for a polished marketing site you can ship in days.",
    pickAIf: [
      "You need a real CMS, structured collections, and editorial workflows.",
      "You think in CSS classes and want full layout control.",
      "Your site has 50+ pages or grows with content.",
    ],
    pickBIf: [
      "You want a polished marketing site shipped in a few days.",
      "Animation, transitions, and motion are central to the brand.",
      "Your team works in design tools, not stylesheets.",
    ],
    criteria: [
      {
        name: "Learning curve",
        a: "Steep – you are learning CSS visually whether you realise it or not.",
        b: "Gentle for anyone who has used Figma; design metaphors throughout.",
        winner: "B",
      },
      {
        name: "CMS depth",
        a: "Mature CMS Collections, references, multi-reference, rich text, dynamic lists.",
        b: "CMS exists and is growing but is shallower than Webflow's.",
        winner: "A",
      },
      {
        name: "Animation and motion",
        a: "Interactions and animations panel; capable but not the centre of gravity.",
        b: "Motion and transitions are first-class; effects panel is a core surface.",
        winner: "B",
      },
      {
        name: "Pricing",
        a: "Site plans start ~$14/mo with workspace fees on top.",
        b: "Site plans start ~$10/mo with simpler workspace pricing.",
        winner: "B",
      },
      {
        name: "Code export",
        a: "HTML/CSS/JS export available on higher plans.",
        b: "No code export; hosted-only.",
        winner: "A",
      },
      {
        name: "Best for",
        a: "Content-heavy marketing sites, agencies, design-led companies with editorial needs.",
        b: "Indie SaaS landing pages, fast-shipping startups, motion-driven brands.",
        winner: "different",
      },
    ],
    whenNeitherFits:
      "If the site is a single marketing page wrapped around a SaaS app, both are overkill. Use the framework you build the product in (Next.js, SvelteKit, Astro) and skip the second hosting bill.",
    forFounder: {
      pick: "B",
      reasoning:
        "Framer fits the indie founder lane: ship a polished page this week, iterate fast, do not get blocked on CSS Grid. Move to Webflow only when content scale or editorial workflows force it.",
    },
    faqs: [
      {
        q: "Can Framer replace a CMS like Webflow?",
        a: "For up to a few dozen pages of structured content, yes. For 500-item collections, multi-reference relationships, or complex editorial workflows, Webflow's CMS is still ahead.",
      },
      {
        q: "Which is better for SEO?",
        a: "Both render server-side HTML with full metadata control. SEO outcomes depend on content and structure, not the builder.",
      },
      {
        q: "Can I move from one to the other?",
        a: "Practically, no. Both lock you into their visual builder. Plan to rebuild the site if you switch.",
      },
    ],
    tags: ["website-builder", "no-code", "design"],
    lastVerified: "2026-05-22",
  },

  // 6. Paid community platforms ----------------------------------------------
  {
    slug: "circle-vs-skool",
    a: { name: "Circle", url: "https://circle.so/" },
    b: { name: "Skool", url: "https://www.skool.com/" },
    category: "Paid community platforms",
    oneLine:
      "Circle is the customisable community OS for brands. Skool is the opinionated, gamified community + course product built around discoverability.",
    tldr:
      "Circle gives you spaces, members, events, and courses in a fully branded environment with deep customisation and integrations. Skool ships a single opinionated layout with a points / leaderboard system and a discovery layer that surfaces communities by activity. Pick Circle for branded depth. Pick Skool for built-in growth mechanics.",
    pickAIf: [
      "Your brand has a strong identity and the community must reflect it.",
      "You need granular spaces, paywalls, events, and embeddable widgets.",
      "Deep integrations (Zapier, API, SSO, custom domains) matter.",
    ],
    pickBIf: [
      "You want a single opinionated layout you do not need to design.",
      "Gamification (points, leaderboard, levels) drives engagement in your niche.",
      "Discovery through the Skool platform is part of your acquisition plan.",
    ],
    criteria: [
      {
        name: "Customisation",
        a: "Heavy – custom domains, custom CSS on higher tiers, branded spaces.",
        b: "Minimal – every Skool community looks structurally identical by design.",
        winner: "A",
      },
      {
        name: "Pricing model",
        a: "Tiered by features, members, and admins; mid-three-digit monthly at scale.",
        b: "Flat $99/month per community plus 2.9% payment fee on paid groups.",
        winner: "B",
      },
      {
        name: "Built-in growth",
        a: "None – you bring traffic to your community.",
        b: "Discovery feed surfaces active paid communities to logged-in users.",
        winner: "B",
      },
      {
        name: "Courses",
        a: "Courses are a first-class feature with lessons, quizzes, drips.",
        b: "Classroom feature exists; less granular than Circle's courses.",
        winner: "A",
      },
      {
        name: "Mobile experience",
        a: "Branded mobile app available on higher tiers.",
        b: "Single Skool mobile app hosts all communities; consistent UX.",
        winner: "tie",
      },
      {
        name: "Engagement mechanics",
        a: "Threads, events, live streams; no built-in gamification.",
        b: "Points, levels, leaderboards baked into every community.",
        winner: "B",
      },
    ],
    whenNeitherFits:
      "If your community is twelve people and a Discord, stay on Discord. Both Circle and Skool earn their cost only once you have a paid, retention-driven group above ~50 active members.",
    forFounder: {
      pick: "depends",
      reasoning:
        "Indie SaaS founders running a Verified Builders style community lean Circle for brand control. Indie operators running a high-engagement coaching or info-product community lean Skool for built-in mechanics and discovery.",
    },
    faqs: [
      {
        q: "Can I run a free community on Skool?",
        a: "Yes, but the free tier limits a lot of paid features. Most operators run paid groups from day one to access the full toolset and revenue mechanics.",
      },
      {
        q: "Is Skool cheaper than Circle?",
        a: "For most operators, yes. Skool's flat $99/month sits below Circle's mid-tier plans, though the gap closes as members and feature needs grow.",
      },
      {
        q: "Can I migrate members between them?",
        a: "Members must re-sign-up on the new platform; both export member lists, but posts, threads, and engagement history do not transfer.",
      },
    ],
    tags: ["community", "membership", "coaching"],
    lastVerified: "2026-05-22",
  },

  // 7. Creator commerce -------------------------------------------------------
  {
    slug: "gumroad-vs-podia",
    a: { name: "Gumroad", url: "https://gumroad.com/" },
    b: { name: "Podia", url: "https://www.podia.com/" },
    category: "Creator commerce",
    oneLine:
      "Gumroad is the fastest path to a paid digital download. Podia is a fuller creator OS for products, courses, and membership.",
    tldr:
      "Gumroad takes a per-sale fee and a tiny setup cost in exchange for shipping a paid product in under an hour. Podia charges a monthly subscription and gives you courses, membership, email, and a hosted site under one roof. Pick Gumroad for the one-off digital product. Pick Podia for an ongoing creator business with courses and membership.",
    pickAIf: [
      "You want to ship one paid digital product this afternoon.",
      "You hate monthly subscriptions and prefer fees-per-sale.",
      "You need a built-in discovery surface for casual buyers.",
    ],
    pickBIf: [
      "You sell courses, memberships, and digital products under one brand.",
      "You want zero per-transaction platform fees on the higher tiers.",
      "You need a hosted website plus email built into the same surface.",
    ],
    criteria: [
      {
        name: "Pricing model",
        a: "Per-sale fees (10% flat); zero monthly cost.",
        b: "Monthly subscription with no platform fees on higher tiers.",
        winner: "different",
      },
      {
        name: "Time-to-first-sale",
        a: "Minutes – upload a file, set a price, share a link.",
        b: "An hour or two to wire up store, email, and branding.",
        winner: "A",
      },
      {
        name: "Course platform",
        a: "Functional but minimal; not the primary use case.",
        b: "Real course builder with lessons, sections, drips, completion tracking.",
        winner: "B",
      },
      {
        name: "Membership",
        a: "Basic membership product type; light on community features.",
        b: "Memberships with tiered access, community, and posts.",
        winner: "B",
      },
      {
        name: "Discovery",
        a: "Gumroad Discover surfaces top-selling products to buyers on the platform.",
        b: "No built-in discovery; you bring all traffic.",
        winner: "A",
      },
      {
        name: "Email marketing",
        a: "Basic post-purchase emails and lightweight broadcasts.",
        b: "Built-in email tool with broadcasts, segments, and automations.",
        winner: "B",
      },
    ],
    whenNeitherFits:
      "If you already pay for Stripe + a site + an email tool, a custom checkout page on your own domain often beats both. Gumroad and Podia are time-savers, not strategy.",
    forFounder: {
      pick: "depends",
      reasoning:
        "If the goal is a $9 swipe file or template pack today, Gumroad is right. If the goal is a $199 course plus monthly membership plus email under one roof for the next two years, Podia is right.",
    },
    faqs: [
      {
        q: "Is Gumroad too expensive at scale?",
        a: "The 10% per-sale fee compounds. Past roughly $50k/year in sales, a fixed-cost platform like Podia or a custom Stripe Checkout becomes cheaper.",
      },
      {
        q: "Can I run a course on Gumroad?",
        a: "Technically yes, but the course UX is thin compared to Podia. Most founders graduate off Gumroad for serious course products.",
      },
      {
        q: "Does Podia have a free plan?",
        a: "Podia ships a free plan with limited features; serious operators run on a paid tier from the start.",
      },
    ],
    tags: ["creator-commerce", "courses", "membership"],
    lastVerified: "2026-05-22",
  },

  // 8. No-code database -------------------------------------------------------
  {
    slug: "airtable-vs-baserow",
    a: { name: "Airtable", url: "https://www.airtable.com/" },
    b: { name: "Baserow", url: "https://baserow.io/" },
    category: "No-code databases",
    oneLine:
      "Airtable is the proprietary category leader with the deepest ecosystem. Baserow is the open-source alternative you can self-host and own end-to-end.",
    tldr:
      "Airtable ships a polished UI, mature automations, and an enormous integration ecosystem at proprietary-SaaS prices. Baserow ships an open-source spreadsheet-database under MIT-style licensing that you can host yourself or use via Baserow Cloud. Pick Airtable for ecosystem depth. Pick Baserow for ownership, lower cost, or data sovereignty.",
    pickAIf: [
      "You need mature integrations, scripting, and a deep marketplace.",
      "Polished UX and a long-standing ecosystem matter more than ownership.",
      "Your team already lives in Airtable and switching is expensive.",
    ],
    pickBIf: [
      "You want open-source software you can self-host on your own infrastructure.",
      "Data sovereignty, on-prem deployment, or strict compliance shapes the choice.",
      "You want a lower per-seat cost than Airtable's paid tiers.",
    ],
    criteria: [
      {
        name: "Licensing",
        a: "Proprietary SaaS; data lives on Airtable's infrastructure.",
        b: "Open-source (MIT) plus a paid Enterprise edition; self-host or use Baserow Cloud.",
        winner: "different",
      },
      {
        name: "Pricing",
        a: "Free tier exists; serious use jumps to $20-45/seat/month.",
        b: "Free Community Edition; cloud paid plans start ~$5/user/month.",
        winner: "B",
      },
      {
        name: "Integration ecosystem",
        a: "Hundreds of native integrations, scripting blocks, app marketplace.",
        b: "Strong webhook and Zapier coverage; smaller native ecosystem.",
        winner: "A",
      },
      {
        name: "Automation depth",
        a: "Mature automation builder with conditional logic and external triggers.",
        b: "Automations functional and improving; less depth than Airtable today.",
        winner: "A",
      },
      {
        name: "Data ownership",
        a: "Your data on Airtable's servers; export available.",
        b: "Self-hosted Baserow keeps every byte on your own infrastructure.",
        winner: "B",
      },
      {
        name: "Indie fit",
        a: "Default tool when polish and ecosystem matter.",
        b: "Default tool when ownership, cost, or compliance matters.",
        winner: "different",
      },
    ],
    whenNeitherFits:
      "If the workload is read-heavy and structured, neither beats Postgres with a thin admin UI. No-code databases are workflow tools, not application databases – they break in non-obvious ways past a few million rows.",
    forFounder: {
      pick: "A",
      reasoning:
        "For a pre-revenue indie founder, Airtable's free tier covers most internal workflows and the ecosystem is the moat. Self-host Baserow later only if a real ownership or compliance reason forces the move.",
    },
    faqs: [
      {
        q: "Is Baserow really a 1:1 Airtable replacement?",
        a: "Functionally close for most no-code use cases. Where Airtable still wins: scripting block, integration depth, and template ecosystem. Where Baserow wins: cost, ownership, and the open-source bus factor.",
      },
      {
        q: "Can I migrate from Airtable to Baserow?",
        a: "Yes via CSV / XLSX export and import; field types map cleanly for most cases. Automations and integrations need to be rebuilt.",
      },
      {
        q: "Is self-hosting Baserow practical for a solo founder?",
        a: "Docker / Docker Compose deployment is well-documented and runs on a $20/month VPS. Maintenance overhead is real – budget a few hours a month.",
      },
    ],
    tags: ["no-code-db", "internal-tools", "open-source"],
    lastVerified: "2026-05-22",
  },

  // 9. Modern vs classic CRM --------------------------------------------------
  {
    slug: "attio-vs-pipedrive",
    a: { name: "Attio", url: "https://attio.com/" },
    b: { name: "Pipedrive", url: "https://www.pipedrive.com/" },
    category: "Sales CRM",
    oneLine:
      "Attio is the modern, customisable, data-model-first CRM. Pipedrive is the established pipeline-first CRM built around sales-rep workflow.",
    tldr:
      "Attio ships a flexible relational data model with notes, objects, lists, and built-in enrichment – the CRM Notion would build. Pipedrive ships the classic deal pipeline with stages, activities, and quotas built for sales teams. Pick Attio for a founder-led, relationship-driven motion. Pick Pipedrive for a structured sales team with quotas and pipeline review.",
    pickAIf: [
      "You run founder-led sales and need a flexible relationship graph.",
      "You want native enrichment, web research, and modern UI.",
      "Your team customises the data model heavily.",
    ],
    pickBIf: [
      "You manage a sales team with quotas, stages, and forecasting.",
      "You need mature pipeline reporting and activity tracking out of the box.",
      "You prefer a CRM your reps already know.",
    ],
    criteria: [
      {
        name: "Data model",
        a: "Flexible relational objects; create custom entities easily.",
        b: "Fixed deal-stage model; customisable fields but not the schema.",
        winner: "A",
      },
      {
        name: "Pricing",
        a: "Free for limited use; paid plans ~$29-69/seat/month.",
        b: "Paid plans start ~$14-99/seat/month; no genuinely free tier.",
        winner: "tie",
      },
      {
        name: "Enrichment",
        a: "Built-in enrichment on contacts and companies (web data, social).",
        b: "Add-on enrichment via Smart Contact Data and integrations.",
        winner: "A",
      },
      {
        name: "Pipeline mechanics",
        a: "Lists and views; pipelines exist but are not the centre of gravity.",
        b: "Pipelines, stages, and deal velocity are the entire product.",
        winner: "B",
      },
      {
        name: "Reporting",
        a: "Lightweight reports; growing analytics features.",
        b: "Mature insights, forecasts, goal tracking; designed for sales managers.",
        winner: "B",
      },
      {
        name: "Founder fit",
        a: "Modern founders running relationship and account-driven sales.",
        b: "Operators with a structured sales team and a deal-stage process.",
        winner: "different",
      },
    ],
    whenNeitherFits:
      "If your pipeline is under twenty live deals, neither CRM earns its monthly fee. A shared spreadsheet plus a calendar plus disciplined follow-ups beats a half-used CRM every time.",
    forFounder: {
      pick: "A",
      reasoning:
        "For a post-launch pre-revenue indie founder, Attio's data-model flexibility and free tier let you treat the CRM as a working relationship graph, not a quota system. Move to Pipedrive only when you hire your first sales rep.",
    },
    faqs: [
      {
        q: "Is Attio a real Pipedrive replacement?",
        a: "For founder-led sales, yes. For a five-rep team with quotas and forecasting rituals, Pipedrive's pipeline mechanics are still ahead.",
      },
      {
        q: "Can I migrate from Pipedrive to Attio?",
        a: "Yes via CSV import; both ship reasonable importers. Custom workflows and automations need to be rebuilt.",
      },
      {
        q: "Which has better integrations?",
        a: "Pipedrive's marketplace is larger by sheer age. Attio's API and Zapier coverage are sufficient for most modern stacks.",
      },
    ],
    tags: ["crm", "sales", "founder-tools"],
    lastVerified: "2026-05-22",
  },

  // 10. Product analytics -----------------------------------------------------
  {
    slug: "posthog-vs-mixpanel",
    a: { name: "PostHog", url: "https://posthog.com/" },
    b: { name: "Mixpanel", url: "https://mixpanel.com/" },
    category: "Product analytics",
    oneLine:
      "PostHog is the all-in-one open-source product OS. Mixpanel is the focused product-analytics specialist.",
    tldr:
      "PostHog bundles analytics, feature flags, session replay, A/B testing, and surveys into one platform with an open-source core. Mixpanel does product analytics deeper than anyone but stays focused on that one job. Pick PostHog to consolidate the product-observability stack. Pick Mixpanel for deep analytics with best-in-class query UX.",
    pickAIf: [
      "You want analytics, flags, replay, and experiments under one vendor.",
      "Self-hosting or open-source ownership matters.",
      "Generous free tier and low pricing curve matter for an early-stage product.",
    ],
    pickBIf: [
      "Product analytics depth (cohorts, funnels, retention) is the only job.",
      "Your team already knows Mixpanel and has dashboards and queries built.",
      "You want a focused tool rather than a Swiss-Army product OS.",
    ],
    criteria: [
      {
        name: "Scope",
        a: "Analytics, session replay, feature flags, A/B tests, surveys, CDP.",
        b: "Product analytics focused; deep on funnels, cohorts, retention.",
        winner: "different",
      },
      {
        name: "Free tier",
        a: "1M events/month free, plus generous limits on replays, flags, surveys.",
        b: "20M events/month free on the Starter tier; reasonable for most early products.",
        winner: "tie",
      },
      {
        name: "Open source",
        a: "Core is open-source; self-host or use PostHog Cloud.",
        b: "Proprietary SaaS.",
        winner: "A",
      },
      {
        name: "Pricing curve",
        a: "Usage-based per product (events, recordings, flags); transparent.",
        b: "Usage-based per event with feature gates by tier.",
        winner: "A",
      },
      {
        name: "Query depth",
        a: "SQL-backed insights; powerful but learning curve.",
        b: "Mature visual query builder; long-standing depth on funnels and cohorts.",
        winner: "B",
      },
      {
        name: "Indie fit",
        a: "Default product OS for indie SaaS founders – one bill, many tools.",
        b: "Best fit when you already have analytics culture and want depth, not breadth.",
        winner: "different",
      },
    ],
    whenNeitherFits:
      "If you have under a hundred weekly active users, neither tool helps – the data is too thin to find signal. Plain Stripe, plain server logs, and direct user calls outperform any analytics dashboard at that scale.",
    forFounder: {
      pick: "A",
      reasoning:
        "Indie SaaS founders almost always pick PostHog. One platform replaces analytics + flags + replay + experiments + surveys, with an open-source core, generous free tier, and a transparent pricing curve. Mixpanel makes sense when you have a real analytics team.",
    },
    faqs: [
      {
        q: "Is PostHog really an all-in-one Mixpanel replacement?",
        a: "Yes for the analytics job, plus four jobs Mixpanel does not do. Mixpanel's visual query UX is still ahead on the deepest product-analytics workflows.",
      },
      {
        q: "Can I self-host PostHog?",
        a: "Yes via PostHog's open-source distribution. Most indie founders use PostHog Cloud because operational overhead is real.",
      },
      {
        q: "Which is cheaper at scale?",
        a: "PostHog tends to be cheaper because the bundled features replace separate flag, replay, and survey bills. Pure analytics-only volume can favour Mixpanel depending on usage shape.",
      },
    ],
    tags: ["product-analytics", "feature-flags", "open-source"],
    lastVerified: "2026-05-22",
  },

  // 11. SEO tooling -----------------------------------------------------------
  {
    slug: "ahrefs-vs-semrush",
    a: { name: "Ahrefs", url: "https://ahrefs.com/" },
    b: { name: "Semrush", url: "https://www.semrush.com/" },
    category: "SEO tooling",
    oneLine:
      "Ahrefs is the backlink-data heavyweight loved by content strategists. Semrush is the broader marketing intelligence platform that bundles SEO, PPC, social, and content.",
    tldr:
      "Ahrefs leads on backlink crawl depth, keyword data quality, and a focused SEO toolset. Semrush is wider – paid-search competitive intel, social, content marketing, and SEO under one roof. Pick Ahrefs for technical SEO and backlink work. Pick Semrush when paid + content + SEO sit on the same team.",
    pickAIf: [
      "Backlink data quality and crawl depth matter most to your motion.",
      "Your team focuses on SEO and content – not paid or social.",
      "You prefer a focused, opinionated toolset over breadth.",
    ],
    pickBIf: [
      "You run paid search, social, and content from the same team.",
      "You want a single dashboard across SEO, PPC, and content marketing.",
      "Competitive intelligence across channels drives the workflow.",
    ],
    criteria: [
      {
        name: "Backlink data",
        a: "Industry-leading crawl size and freshness; favoured for link research.",
        b: "Strong backlink data; historically a step behind Ahrefs on freshness.",
        winner: "A",
      },
      {
        name: "Keyword data",
        a: "High-quality clickstream-backed keyword data with intent scoring.",
        b: "Massive keyword database, slightly broader but noisier.",
        winner: "tie",
      },
      {
        name: "Paid search intel",
        a: "Limited; not the centre of gravity.",
        b: "Mature PPC competitive research, ad copy library, position tracking.",
        winner: "B",
      },
      {
        name: "Content workflows",
        a: "Content Explorer is focused on discovery.",
        b: "Content Marketing toolkit includes brief generation, topical maps, optimisation.",
        winner: "B",
      },
      {
        name: "Pricing",
        a: "$129-1499/month tiered by usage credits and projects.",
        b: "$140-500/month plus add-ons for some features.",
        winner: "tie",
      },
      {
        name: "Indie fit",
        a: "Default tool for SEO-focused operators and content teams.",
        b: "Better fit when SEO is one of several channels and budget allows the breadth.",
        winner: "different",
      },
    ],
    whenNeitherFits:
      "If you are pre-product-market-fit, neither tool earns its monthly cost. Free tools (Google Search Console, Keyword Planner, Ubersuggest, basic SERP scraping) cover the work until SEO becomes a real channel.",
    forFounder: {
      pick: "depends",
      reasoning:
        "Indie founders mostly do not need either yet. If SEO is genuinely a top-three channel and you can absorb the monthly bill, Ahrefs gives more signal per dollar for technical SEO and backlink work. Switch to Semrush only when paid and social land on the same calendar.",
    },
    faqs: [
      {
        q: "Is Ahrefs or Semrush better for a small SEO budget?",
        a: "Both have entry tiers around $130-140/month. Ahrefs Lite gives more usable depth at that price for SEO-only work; Semrush Pro gives breadth across channels.",
      },
      {
        q: "Do I need either tool at zero revenue?",
        a: "Almost never. Google Search Console plus a free keyword tool covers what you need. SEO tools earn their cost once you have content velocity and link-building budget.",
      },
      {
        q: "Which has better SERP tracking?",
        a: "Both track positions well; Semrush's Position Tracking has a slight edge on flexibility, Ahrefs's Rank Tracker on data quality.",
      },
    ],
    tags: ["seo", "marketing-tools", "competitive-intel"],
    lastVerified: "2026-05-22",
  },

  // 12. AI copywriting --------------------------------------------------------
  {
    slug: "copy-ai-vs-jasper",
    a: { name: "Copy.ai", url: "https://www.copy.ai/" },
    b: { name: "Jasper", url: "https://www.jasper.ai/" },
    category: "AI copywriting",
    oneLine:
      "Copy.ai pivoted from short-form copy to a GTM AI workflow platform. Jasper stayed focused on brand-trained marketing content at scale.",
    tldr:
      "Copy.ai is now a workflow platform – prompts, agents, and outbound sequences for go-to-market teams. Jasper stayed in the marketing-content lane with brand voice training, style guides, and team workflows. Pick Copy.ai for outbound and GTM workflow automation. Pick Jasper for on-brand long-form marketing content at scale.",
    pickAIf: [
      "You need GTM workflows, sequences, and agents – not just one-off copy.",
      "Your motion is outbound, prospect research, and lifecycle email.",
      "A generous free tier and workflow-builder UX matter.",
    ],
    pickBIf: [
      "You produce branded long-form marketing content at scale.",
      "Brand voice training, style guides, and team-of-writers workflow are central.",
      "Your buyers are marketing teams not founders.",
    ],
    criteria: [
      {
        name: "Primary use case",
        a: "GTM workflows, outbound, prospect research, lifecycle email.",
        b: "Branded long-form marketing content, blog posts, campaign assets.",
        winner: "different",
      },
      {
        name: "Free tier",
        a: "Free Starter plan with usable monthly credits.",
        b: "No free tier; paid plans start at $39/month after a short trial.",
        winner: "A",
      },
      {
        name: "Brand voice",
        a: "Brand voice exists but is a secondary feature.",
        b: "Brand Voice and Style Guide are central; train Jasper on your existing copy.",
        winner: "B",
      },
      {
        name: "Workflow / automation",
        a: "Workflow builder is the centre of gravity; chain prompts into multi-step agents.",
        b: "Workflows exist; less depth than Copy.ai's GTM motion.",
        winner: "A",
      },
      {
        name: "Pricing",
        a: "$49-249/month tiered by seats and workflow credits.",
        b: "$39-69/seat/month with Business pricing on top.",
        winner: "tie",
      },
      {
        name: "Better answered by raw LLM",
        a: "Some Copy.ai workflows are thin wrappers around chat – a Claude or ChatGPT subscription may match.",
        b: "Brand-voice training and team workflows are harder to replicate with raw chat.",
        winner: "different",
      },
    ],
    whenNeitherFits:
      "If your bottleneck is finding what to write – not writing it – neither tool helps. Spend the money on Claude or ChatGPT Pro plus an editor, and reinvest the saved subscription into a real strategist for the message itself.",
    forFounder: {
      pick: "depends",
      reasoning:
        "Indie SaaS founders rarely need either dedicated AI copy tool. A Claude or ChatGPT subscription, a clear voice document, and disciplined editing usually beats both. Pick Jasper only when you have a real content team; pick Copy.ai only when you are running outbound at scale.",
    },
    faqs: [
      {
        q: "Is Copy.ai still a copywriting tool?",
        a: "Less than it was. The product pivoted toward GTM AI workflows; the short-form copy templates still exist but the roadmap energy is elsewhere.",
      },
      {
        q: "Is Jasper worth it over raw ChatGPT or Claude?",
        a: "For solo founders, usually no. For marketing teams that need shared brand voice, style enforcement, and multi-user workflows, the wrapper earns its cost.",
      },
      {
        q: "Which has better integrations?",
        a: "Copy.ai integrates deeply with CRMs and outbound tooling (Salesforce, HubSpot, Outreach). Jasper integrates with content-marketing stacks (Surfer, Webflow, WordPress).",
      },
    ],
    tags: ["ai", "copywriting", "gtm-tools"],
    lastVerified: "2026-05-22",
  },
] as const;

/** Frozen catalog – mutate only by editing this file and shipping a commit. */
export const COMPARE_ENTRIES: ReadonlyArray<CompareEntry> =
  Object.freeze(COMPARE_LIST);

/** Slug list, exported for sitemap, llms-feed, and generateStaticParams. */
export const COMPARE_SLUGS: ReadonlyArray<string> = Object.freeze(
  COMPARE_ENTRIES.map((e) => e.slug),
);

/**
 * Slugs safe to advertise publicly. next.config.mjs 308s every
 * /compare/:slug to /vs/:slug, so a compare slug without a matching
 * comparisons.ts entry redirects into a 404 (10 such slugs were live in
 * the 2026-07-14 crawl). Self-maintaining: porting an entry into
 * comparisons.ts re-adds its URL on the next build. If the blanket
 * redirect is ever removed to resurrect this surface, delete this filter.
 */
export const RESOLVING_COMPARE_SLUGS: ReadonlyArray<string> = Object.freeze(
  COMPARE_SLUGS.filter((slug) =>
    (COMPARISON_SLUGS as readonly string[]).includes(slug),
  ),
);

/** O(1) lookup. */
const COMPARE_BY_SLUG: ReadonlyMap<string, CompareEntry> = new Map(
  COMPARE_ENTRIES.map((e) => [e.slug, e] as const),
);

export function getCompareBySlug(slug: string): CompareEntry | undefined {
  return COMPARE_BY_SLUG.get(slug);
}

/** Group by category for the hub. Stable order = catalog declaration order. */
export interface CompareGroup {
  category: string;
  entries: ReadonlyArray<CompareEntry>;
}

export function groupCompareByCategory(): ReadonlyArray<CompareGroup> {
  const groups = new Map<string, CompareEntry[]>();
  for (const entry of COMPARE_ENTRIES) {
    const bucket = groups.get(entry.category);
    if (bucket) bucket.push(entry);
    else groups.set(entry.category, [entry]);
  }
  return Array.from(groups.entries()).map(([category, entries]) => ({
    category,
    entries: Object.freeze(entries),
  }));
}

/** Latest lastVerified across the catalog – feeds Dataset.dateModified on hub. */
export const COMPARE_LATEST_VERIFIED: string = COMPARE_ENTRIES.reduce(
  (latest, e) => (e.lastVerified > latest ? e.lastVerified : latest),
  COMPARE_ENTRIES[0]?.lastVerified ?? "2026-05-22",
);
