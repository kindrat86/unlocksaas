/**
 * Comparisons catalog — fourth pSEO block after alternatives.ts,
 * funnel-teardowns.ts, and pricing-teardowns.ts.
 *
 * Intent class targeted:
 *   "[product A] vs [product B]" — direct head-to-head queries are the
 *   single highest-intent SaaS-research search class. Every comparison
 *   reader is mid-evaluation.
 *
 * Why this surface exists:
 *   The teardown patterns analyze a company in isolation. The comparison
 *   pattern serves the reader who has narrowed to two and is choosing
 *   between them. Same Brunson Hard-Rule discipline (no slag, no
 *   fabricated metrics, lastVerified ISO) but symmetric framing — both
 *   sides get honest analysis.
 *
 * Cross-links:
 *   If either product in a comparison has its own funnel-teardown or
 *   pricing-teardown entry, the comparison page links to them via the
 *   product slug field. Reciprocally, the teardown detail pages will
 *   list comparisons where that company appears.
 *
 * Scaling path:
 *   Append entries. At ~50 entries, split by category. With 26 unique
 *   companies in the existing manifests and ~3 plausible competitors
 *   each, the addressable comparison surface is roughly 78 pages from
 *   the existing data, and the broader category-pair space is in the
 *   thousands.
 */

/** A product side in a comparison. */
export interface ComparisonProduct {
  /** Proper-noun display name. */
  name: string;
  /**
   * Optional slug pointing to the matching funnel-teardown and/or
   * pricing-teardown entry. The comparison page renders deep links when
   * a slug is present.
   */
  teardownSlug?: string;
  /** Canonical homepage URL. */
  url?: string;
}

/** A dimension of comparison, evaluated symmetrically. */
export interface ComparisonDimension {
  /** Dimension name (e.g. "Pricing model", "Free tier"). */
  name: string;
  /** Observation about product A on this dimension. */
  a: string;
  /** Observation about product B on this dimension. */
  b: string;
  /**
   * Honest verdict per dimension:
   *  - "A": A is clearly better on this dimension for most buyers
   *  - "B": B is clearly better on this dimension for most buyers
   *  - "tie": genuinely comparable
   *  - "different": not directly comparable; different shape of value
   */
  winner: "A" | "B" | "tie" | "different";
  /** Optional 1-line note explaining the verdict. */
  note?: string;
}

export interface ComparisonFaq {
  q: string;
  a: string;
}

export interface Comparison {
  /** URL slug. Convention: "product-a-vs-product-b" (kebab-case). */
  slug: string;
  /** Product A side. */
  a: ComparisonProduct;
  /** Product B side. */
  b: ComparisonProduct;
  /** Category label. Used for hub grouping. */
  category: string;
  /** Single-line thesis of the comparison. */
  oneLine: string;
  /**
   * 40-to-60 word TL;DR optimized for AEO citation. Must name both
   * products, name the category difference, and end with the specific
   * decision rule a reader can apply.
   */
  tldr: string;

  /**
   * Who each side is best for, in plain language. Both must be filled
   * — the page is symmetric and honest, not a positioning hit-piece.
   */
  bestFor: {
    a: string;
    b: string;
  };

  /** 3-to-5 reasons to pick product A. */
  pickAIf: string[];

  /** 3-to-5 reasons to pick product B. */
  pickBIf: string[];

  /** 6-to-9 comparison dimensions, evaluated symmetrically. */
  dimensions: ReadonlyArray<ComparisonDimension>;

  /** 2-to-3 paragraph honest take wrapping the dimensions. */
  honestTake: string;

  /**
   * Recommendation specifically for the canonical Unlock SaaS audience
   * (post-launch pre-revenue non-engineer SaaS founders). Names the
   * winner for THAT audience, which may differ from the general case.
   */
  forIndieFounders: {
    /** "A", "B", or "depends". */
    pick: "A" | "B" | "depends";
    /** 2-to-3 sentence explanation of why for the indie founder. */
    reasoning: string;
  };

  /** 4-to-6 FAQs. */
  faqs: ReadonlyArray<ComparisonFaq>;

  /** Tags for hub grouping and related linking. */
  tags: ReadonlyArray<string>;

  /** ISO date of last manual sanity check. */
  lastVerified: string;
}

// -- Catalog -----------------------------------------------------------------

const COMPARISONS_LIST: Comparison[] = [
  {
    slug: "tally-vs-typeform",
    a: { name: "Tally", teardownSlug: "tally", url: "https://tally.so/" },
    b: { name: "Typeform", url: "https://www.typeform.com/" },
    category: "Forms and surveys",
    oneLine:
      "Tally vs Typeform is a structural pricing fight. Typeform built the category; Tally rebuilt it without the per-submission paywall.",
    tldr:
      "Typeform invented the conversational form category and prices on response volume. Tally rebuilt the same UX with free-forever unlimited responses and monetizes on white-label and advanced logic. For an indie founder who values one fewer per-unit-priced subscription, Tally is the easy pick; for an enterprise that needs Typeform's deep integration ecosystem, Typeform is.",
    bestFor: {
      a: "Indie founders, creators, and small teams who refuse per-submission paywalls and prefer a free-forever plan that is genuinely production-grade.",
      b: "Mid-market and enterprise teams that need Typeform's mature integration ecosystem, advanced logic, and brand recognition with respondents.",
    },
    pickAIf: [
      "You ship forms that may collect thousands of responses and per-submission pricing is a budget blocker.",
      "You want a clean modern UX without paying for the category-creator brand premium.",
      "You are an indie founder who values structural promises (free forever, unlimited) over feature theater.",
    ],
    pickBIf: [
      "Your stakeholders recognize Typeform as a default and you need to ship a form without justifying the tool choice.",
      "You need Typeform's deep ecosystem of integrations, Zapier and Hubspot bindings, and enterprise SSO.",
      "Brand polish and Typeform's specific conversational micro-interactions are central to the form experience your audience expects.",
    ],
    dimensions: [
      {
        name: "Pricing model",
        a: "Free forever with unlimited forms and submissions; paid tier (~$29/mo) removes branding and adds logic.",
        b: "Free tier capped at 10 responses/month; paid tiers scale by response volume from ~$25/mo upward.",
        winner: "A",
        note: "Tally's structural promise is the entire pricing story; Typeform's response cap is the canonical objection.",
      },
      {
        name: "Free tier production-grade",
        a: "Yes — most indie SaaS can ship forms in production on the free tier.",
        b: "No — 10 responses/month is a trial cap, not a production tier.",
        winner: "A",
      },
      {
        name: "Brand recognition with respondents",
        a: "Lower — Tally's brand is less recognized to non-technical respondents.",
        b: "Higher — Typeform is the category default for many audiences.",
        winner: "B",
      },
      {
        name: "Integration ecosystem",
        a: "Solid core (Zapier, webhooks, Notion, Slack, Sheets) but smaller than Typeform's.",
        b: "Mature ecosystem with deep Hubspot, Salesforce, Mailchimp, and enterprise bindings.",
        winner: "B",
      },
      {
        name: "Form-building UX",
        a: "Notion-like editor; familiar to anyone who uses Notion.",
        b: "Linear conversational builder; familiar to anyone who has used Typeform before.",
        winner: "tie",
        note: "Different mental models; both polished. UX preference is taste-driven.",
      },
      {
        name: "Advanced logic",
        a: "On the paid tier; jump logic, conditional questions, calculations.",
        b: "Across paid tiers; broader logic library and tighter calculations.",
        winner: "B",
      },
      {
        name: "White-label / brand removal",
        a: "Paid tier removes Tally branding; custom domains supported.",
        b: "Paid tiers remove Typeform branding; custom domains supported.",
        winner: "tie",
      },
      {
        name: "Indie-founder fit",
        a: "Built for the indie buyer; pricing, UX, and free tier all signal it.",
        b: "Built for the marketing department buyer; indie founders are not the focus.",
        winner: "A",
      },
    ],
    honestTake:
      "Tally and Typeform sit in the same category but at different points on the same trade-off curve. Typeform built the category, owns the brand recognition, and prices to match — which works for buyers who treat forms as a marketing surface and have a budget to justify. Tally rebuilt the same category without the per-submission paywall and won the indie founder who refuses to pay per response. The honest verdict for most reasonable buyers in 2026 is that Tally is the better default and Typeform is the right pick when the specific brand or integration depth matters more than the budget.",
    forIndieFounders: {
      pick: "A",
      reasoning:
        "Tally's free-forever unlimited model removes the single biggest pricing-page objection in the category for an indie founder. Typeform is excellent but priced for a buyer with a budget line for marketing tools — most pre-revenue indie SaaS do not have that line.",
    },
    faqs: [
      {
        q: "Is Tally really free forever?",
        a: "Yes — the free tier supports unlimited forms and unlimited submissions in perpetuity. The paid tier upgrades buyers who need brand removal, advanced logic, or file uploads. The model is stable because Tally's marginal cost per free user is near zero.",
      },
      {
        q: "Why does Typeform charge per response?",
        a: "Because response volume maps roughly to the customer's marketing value, and Typeform's audience is marketing teams that buy on outcome rather than per-unit cost. The model has held up commercially but creates the canonical objection that drives the search for alternatives.",
      },
      {
        q: "Are Tally forms as polished as Typeform's?",
        a: "Both are polished; the conversational micro-interactions Typeform pioneered are still tighter than Tally's, but Tally has closed most of the visible gap. For respondent experience on standard surveys and signups, the difference is minor in 2026.",
      },
      {
        q: "Will Typeform's integrations matter for an indie SaaS?",
        a: "Usually not at first. Most indie SaaS need Zapier, webhooks, Slack, and Sheets — all supported by both. Typeform's depth in Hubspot, Salesforce, and Mailchimp matters once a marketing team starts adopting the form data into a CRM workflow.",
      },
      {
        q: "What is the Brunson lens on Tally vs Typeform?",
        a: "Typeform anchors the category at a premium; Tally is the New Opportunity move (Brunson Expert Secrets) that escapes the per-response shootout by changing the pricing model entirely. The reader switching from Typeform to Tally is not buying a cheaper Typeform — they are stepping into a different category (unlimited free forms) where Typeform cannot follow without abandoning their revenue model.",
      },
    ],
    tags: ["forms", "category-anchor", "freemium", "indie-friendly"],
    lastVerified: "2026-05-17",
  },

  {
    slug: "lemonsqueezy-vs-paddle",
    a: { name: "Lemon Squeezy", teardownSlug: "lemonsqueezy", url: "https://www.lemonsqueezy.com/" },
    b: { name: "Paddle", url: "https://www.paddle.com/" },
    category: "Payments and Merchant of Record",
    oneLine:
      "Lemon Squeezy and Paddle both sell MoR. Lemon Squeezy is indie-shaped; Paddle is mid-market-shaped.",
    tldr:
      "Both Lemon Squeezy and Paddle act as Merchant of Record, absorbing global tax compliance for SaaS and digital products. Lemon Squeezy positions for indie founders with simple percentage pricing and self-serve onboarding; Paddle targets mid-market with more enterprise features, longer sales cycles, and volume-negotiated rates. Indie founders almost always pick Lemon Squeezy; SaaS doing $1M+ ARR often migrate to Paddle for the rate.",
    bestFor: {
      a: "Indie founders, solo SaaS operators, and small teams selling digital products globally who want self-serve onboarding.",
      b: "Mid-market SaaS doing $1M+ ARR who can negotiate rates and want enterprise features (recurring billing depth, retention tooling, sales-led contracts).",
    },
    pickAIf: [
      "You are pre-revenue or early-stage and need to ship payments without a sales call.",
      "You value branding personality and indie-friendly product design over enterprise gravitas.",
      "Your volume is low enough that the headline percentage rate is not material to your P&L.",
    ],
    pickBIf: [
      "You are doing $1M+ ARR and can negotiate Paddle's published rate down meaningfully.",
      "You need deeper subscription billing features (revenue retention, dunning, advanced tax automation).",
      "You sell to enterprise customers who need invoicing, POs, and longer contract cycles.",
    ],
    dimensions: [
      {
        name: "Onboarding",
        a: "Self-serve; create an account, integrate, sell. No sales call required.",
        b: "Self-serve available for some tiers; Paddle Billing Pro and Custom require sales-led onboarding.",
        winner: "A",
      },
      {
        name: "Published pricing",
        a: "~5% + 50¢ per transaction (verified 2026-05-17). Single line; no monthly base.",
        b: "~5% + 50¢ per transaction at the base tier (verified 2026-05-17). Volume tiers negotiate down.",
        winner: "tie",
        note: "Headline rates are nearly identical; Paddle's negotiation surface is the key difference at volume.",
      },
      {
        name: "MoR service depth",
        a: "Full MoR for digital products and SaaS; global tax compliance handled.",
        b: "Full MoR for SaaS, downloads, and digital products; long-standing MoR provider with deeper tax expertise at scale.",
        winner: "B",
        note: "Both deliver MoR; Paddle has more mature tooling for unusual jurisdictions.",
      },
      {
        name: "Subscription billing depth",
        a: "Core subscriptions, customer portal, basic dunning.",
        b: "Deep subscription billing: granular dunning, retention tooling, usage-based billing, sophisticated proration.",
        winner: "B",
      },
      {
        name: "Brand and positioning",
        a: "Playful, indie-friendly brand. Marketing speaks to founders.",
        b: "Enterprise gravitas; marketing speaks to SaaS leadership and finance teams.",
        winner: "different",
      },
      {
        name: "Stripe acquisition impact",
        a: "Acquired by Stripe in 2024. Long-term roadmap depends on Stripe's positioning.",
        b: "Independent. Strategic direction set by Paddle.",
        winner: "different",
        note: "Stripe ownership of Lemon Squeezy is either a feature (deep integration) or a risk (consolidation), depending on the buyer's view.",
      },
      {
        name: "Indie founder fit",
        a: "Designed for the indie buyer; self-serve, monthly-friendly, no minimum.",
        b: "Designed for the SaaS team buyer; can serve indie but the product surface is heavier.",
        winner: "A",
      },
    ],
    honestTake:
      "Lemon Squeezy and Paddle sell the same product category (Merchant of Record for digital products) at the same headline rate but to different buyer shapes. Lemon Squeezy won the indie founder mind-share by leading with playful design, self-serve onboarding, and no enterprise gating. Paddle held the mid-market by going deeper on subscription billing, dunning, and retention tooling — and by being willing to negotiate the rate down for volume. The right pick depends almost entirely on stage: pre-revenue and early-stage go Lemon Squeezy because the buying experience matches; $1M+ ARR often migrates to Paddle for the negotiated rate.",
    forIndieFounders: {
      pick: "A",
      reasoning:
        "Lemon Squeezy is built for the indie buyer. Self-serve onboarding, monthly-friendly billing, no minimum volume, no sales call. Paddle is excellent at what it does but the buying experience is calibrated for a different customer.",
    },
    faqs: [
      {
        q: "Are Lemon Squeezy and Paddle really priced the same?",
        a: "At the headline base rate, yes — both publish approximately 5% + 50¢ per transaction. Paddle is more willing to negotiate volume discounts at scale, which means the effective rate diverges meaningfully once a SaaS exceeds about $500K-$1M ARR.",
      },
      {
        q: "Does Stripe's ownership of Lemon Squeezy change anything?",
        a: "Operationally, not yet. Strategically, Lemon Squeezy is now Stripe's MoR offering, which means feature integration with Stripe deepens over time but also that the long-term roadmap is set by Stripe's positioning rather than Lemon Squeezy's independent vision. Some indie buyers view this as positive consolidation; others see strategic risk.",
      },
      {
        q: "When should I migrate from Lemon Squeezy to Paddle?",
        a: "When the negotiated rate difference exceeds the migration cost. For most SaaS, that crossover is somewhere between $500K and $2M ARR depending on transaction count and average order value. Below that, the operational cost of migration outweighs the rate savings.",
      },
      {
        q: "Is Paddle's enterprise gating a problem for indie founders?",
        a: "Yes. Indie founders who want to ship payments today without a sales call should choose Lemon Squeezy. Paddle's self-serve tier exists but the product is designed around the SaaS-with-finance-team buyer.",
      },
      {
        q: "What about Stripe directly instead of either MoR?",
        a: "Stripe is the right choice when you handle tax compliance yourself, which is reasonable for SaaS selling in a single jurisdiction or with the legal infrastructure to register globally. Most indie SaaS selling globally save more in compliance time than they spend on MoR fees.",
      },
    ],
    tags: ["payments", "mor", "indie-friendly", "subscription-billing"],
    lastVerified: "2026-05-17",
  },

  {
    slug: "notion-vs-coda",
    a: { name: "Notion", teardownSlug: "notion", url: "https://www.notion.so/" },
    b: { name: "Coda", url: "https://coda.io/" },
    category: "Workspace and productivity",
    oneLine:
      "Notion is a notes-first canvas with database superpowers; Coda is a database-first canvas with notes superpowers. The starting shape determines who wins for your team.",
    tldr:
      "Notion and Coda look superficially similar but inverted in starting shape: Notion is notes-first with databases bolted in; Coda is a powerful relational database with documents wrapped around it. Notion wins for teams whose primary need is shared docs and wikis. Coda wins for teams whose primary need is a no-code app with structured data and formulas. For most indie teams, Notion is the safer default; for ops-heavy teams, Coda earns its complexity.",
    bestFor: {
      a: "Teams whose primary workspace need is notes, docs, wikis, and lightly-structured project management.",
      b: "Ops-heavy teams that need a relational data layer, formulas, automations, and document-shaped no-code apps.",
    },
    pickAIf: [
      "Your team's daily use is reading and writing documents, not querying or transforming data.",
      "You value the largest community, template library, and integration ecosystem in the category.",
      "You want a tool everyone on the team can learn in under an hour.",
    ],
    pickBIf: [
      "You need a database with proper formulas, cross-table references, and a calculation layer Notion does not provide.",
      "You want to build internal no-code apps inside your documents rather than buying a separate tool.",
      "Your team includes someone willing to invest in the steeper Coda learning curve to unlock the power.",
    ],
    dimensions: [
      {
        name: "Starting shape",
        a: "Notes and docs first; databases are blocks you embed inside docs.",
        b: "Databases first; documents are pages that wrap structured data and formulas.",
        winner: "different",
      },
      {
        name: "Learning curve",
        a: "Gentle — most teams are productive in an afternoon.",
        b: "Steep — power comes from formulas and packs that take days to internalize.",
        winner: "A",
      },
      {
        name: "Formula and calculation depth",
        a: "Limited; databases support basic formulas but not cross-table joins.",
        b: "Deep; spreadsheet-grade formulas, cross-table references, and Coda Packs extend further.",
        winner: "B",
      },
      {
        name: "Template and community ecosystem",
        a: "Largest in the category; thousands of public templates, vibrant community, third-party services.",
        b: "Growing but smaller; templates and packs exist but the network is narrower.",
        winner: "A",
      },
      {
        name: "Pricing",
        a: "Free personal tier; ~$10/seat/mo Plus, ~$18/seat/mo Business (verified 2026-05-17).",
        b: "Free tier with limits on document size; ~$10/Doc Maker/mo Pro, ~$30/Doc Maker/mo Team (verified 2026-05-17). Pricing is per-Doc-Maker not per-viewer.",
        winner: "different",
        note: "Coda's per-Doc-Maker pricing favors teams with few editors and many viewers; Notion's per-seat favors teams where everyone edits.",
      },
      {
        name: "AI integration",
        a: "Notion AI as add-on (~$8-10/seat/mo on top of any tier).",
        b: "Coda AI built into paid tiers; deeper integration with data layer.",
        winner: "B",
      },
      {
        name: "Mobile experience",
        a: "Polished mobile apps; full editing supported.",
        b: "Mobile available but better-suited to reading than to power-user editing.",
        winner: "A",
      },
      {
        name: "Use case fit: knowledge base",
        a: "Excellent — Notion is the category default for company wikis.",
        b: "Good but heavier than needed for a pure wiki.",
        winner: "A",
      },
      {
        name: "Use case fit: internal no-code app",
        a: "Possible but limited by formula depth.",
        b: "Excellent — Coda was designed for this and stays ahead.",
        winner: "B",
      },
    ],
    honestTake:
      "The Notion vs Coda decision is mostly a question of what your team does most. If your team writes docs and wants databases as a side capability, Notion wins on ecosystem, learning curve, and category-default familiarity. If your team builds internal tools and wants documents as a wrapper around real data and formulas, Coda earns its complexity. The mistake most teams make is picking based on power demos: Coda's formulas look impressive, but if no one on the team will write them, the power is theoretical and Notion's simpler shape converts to more actual value. Match the tool to the dominant use case, not to the most exciting demo.",
    forIndieFounders: {
      pick: "A",
      reasoning:
        "Notion is the safer default for indie founders. The team starts smaller, the use cases lean toward docs and wikis, and the community-driven template economy means you can find a starting point for almost any setup. Coda is better when ops complexity is the dominant pain, which usually shows up later in the company life cycle.",
    },
    faqs: [
      {
        q: "Can Notion replace a spreadsheet?",
        a: "For light tabular data, yes. For real spreadsheet work with cross-sheet formulas, complex calculations, or anything that would benefit from Excel-grade functions, no — Notion's database is intentionally simpler. Coda or a real spreadsheet is the right tool there.",
      },
      {
        q: "Can Coda replace Notion for company docs?",
        a: "Yes, but the team will feel the heaviness. Coda's document shape works for docs; the learning curve and the formula-first mental model add friction that pure-docs teams will resent.",
      },
      {
        q: "What about a hybrid: Notion for docs, Coda for ops?",
        a: "Common pattern at slightly larger companies. The tradeoff is two subscriptions, two skill sets, and two places to look for the right piece of information. For most indie teams the duplication is not worth it; pick one and stretch it.",
      },
      {
        q: "Is the per-Doc-Maker vs per-seat pricing meaningful?",
        a: "Yes. Coda's per-Doc-Maker model favors teams where a few people build and many people consume; Notion's per-seat model favors teams where everyone is an editor. For a 10-person team where 3 build and 7 consume, Coda is cheaper; for a 10-person team where all 10 edit, Notion is cheaper.",
      },
      {
        q: "What is the Brunson lens on this comparison?",
        a: "Both companies use category-anchor positioning — Notion anchors on the workspace category, Coda on the no-code-document category. Coda is the New Opportunity move (different starting shape) but loses the category fight against Notion's network effects. The right indie-founder pick is almost always the network-effect winner unless the specific power use case justifies the trade.",
      },
    ],
    tags: ["productivity", "workspace", "no-code", "team-tools"],
    lastVerified: "2026-05-17",
  },

  {
    slug: "linear-vs-jira",
    a: { name: "Linear", teardownSlug: "linear", url: "https://linear.app/" },
    b: { name: "Jira", url: "https://www.atlassian.com/software/jira" },
    category: "Project management for software teams",
    oneLine:
      "Linear is what you pick because you want to ship. Jira is what you inherit because the company already runs on it.",
    tldr:
      "Linear and Jira occupy the same category (issue tracking for software teams) at opposite ends of the speed-versus-configurability axis. Linear is opinionated, fast, and designed for high-velocity product teams; Jira is configurable, deeply integrated with the Atlassian suite, and the default at most enterprises. For new teams choosing freely, Linear wins. For teams inside an Atlassian-committed org, Jira is the inherited reality.",
    bestFor: {
      a: "Modern software teams from startup to scale-up who choose tooling freely and prioritize velocity.",
      b: "Enterprises already running on Atlassian (Confluence, Bitbucket, Trello) where Jira integration is the dominant factor.",
    },
    pickAIf: [
      "You are a new team picking your stack from scratch and value speed over configurability.",
      "Your team has rejected Jira before and wants a tool that does not require a Jira admin to maintain.",
      "You ship at high velocity and need the issue tracker to be invisible most of the time.",
    ],
    pickBIf: [
      "Your org is Atlassian-committed and Jira's integration with Confluence, Bitbucket, or the Jira marketplace is structural.",
      "You need granular workflow customization, approval gates, or regulatory features Jira's depth provides.",
      "Your team includes non-engineering stakeholders (PMs, finance, ops) who have learned Jira and would resist a switch.",
    ],
    dimensions: [
      {
        name: "Speed and responsiveness",
        a: "Among the fastest web apps in the category; keyboard-first UX.",
        b: "Slower; UI improvements over the past few years but still noticeably heavier.",
        winner: "A",
      },
      {
        name: "Configurability",
        a: "Intentionally limited; opinionated defaults are the product.",
        b: "Deep configurability; custom workflows, fields, screens, schemes, permissions.",
        winner: "B",
        note: "Linear's constraint is its differentiation; Jira's depth is its differentiation. Different priorities.",
      },
      {
        name: "Default workflow fit",
        a: "Designed for software teams; defaults map to how modern dev teams already work.",
        b: "Configurable to any workflow; defaults require setup before they fit any specific team.",
        winner: "A",
        note: "Out-of-the-box, Linear converts to value faster.",
      },
      {
        name: "Ecosystem and integrations",
        a: "Growing; core integrations with GitHub, Slack, Figma, Notion.",
        b: "Vast; Atlassian Marketplace has thousands of apps, plus Confluence and Bitbucket native bindings.",
        winner: "B",
      },
      {
        name: "Pricing",
        a: "Free tier (250 issues), ~$8-10/user/mo Basic, ~$14/user/mo Business (verified 2026-05-17).",
        b: "Free tier for up to 10 users, ~$8-10/user/mo Standard, ~$15-20/user/mo Premium (verified 2026-05-17).",
        winner: "tie",
      },
      {
        name: "Learning curve",
        a: "Minutes to productive; opinionated defaults remove decision overhead.",
        b: "Hours to days to productive; configurability creates initial decision overhead.",
        winner: "A",
      },
      {
        name: "Admin overhead",
        a: "Minimal; few configurations to manage.",
        b: "Real; most non-trivial Jira instances need a part-time or full-time admin.",
        winner: "A",
      },
      {
        name: "Best for non-engineering stakeholders",
        a: "Designed for engineers; PMs and ops users can adapt but the UX prioritizes engineer needs.",
        b: "Designed for cross-functional use; PMs, ops, and finance are first-class users.",
        winner: "B",
      },
    ],
    honestTake:
      "Linear and Jira are not really competing in the same fight. Linear competes for the team that gets to choose; Jira occupies the enterprise that inherited it. When the choice is genuinely open, Linear wins on speed, defaults, and admin cost — the differentiation is real and the team feels it daily. When the choice is constrained by an Atlassian-committed org, Jira's deep configurability and integration ecosystem are the right pick because fighting the constraint costs more than the speed-and-defaults win is worth. The honest verdict is that most modern software teams should pick Linear if they can and Jira if they cannot.",
    forIndieFounders: {
      pick: "A",
      reasoning:
        "Linear is built for the indie or startup engineering team. No admin overhead, free tier covers early-stage scope, and the opinionated defaults map to how indie teams already work. Jira's depth is wasted at indie scale and the admin cost is a real productivity tax.",
    },
    faqs: [
      {
        q: "Is Linear really faster than Jira?",
        a: "Yes, materially. The difference is measurable in keystrokes and milliseconds per common action (creating issue, navigating, updating). For a team that interacts with the issue tracker dozens of times per day, the cumulative speed difference is meaningful.",
      },
      {
        q: "Can Linear handle enterprise-scale workflows?",
        a: "It can handle large teams and complex projects but not arbitrary enterprise customization. Linear deliberately constrains workflow complexity. If you need approval gates, regulatory audit fields, or unusual workflow states, Jira is the right tool.",
      },
      {
        q: "Is Jira still worth learning for an indie founder?",
        a: "Only if you expect to work at companies running Jira. As a tool for your own team, Linear is the strict upgrade. Familiarity with Jira is a career skill, not a startup advantage.",
      },
      {
        q: "What about Asana or ClickUp instead?",
        a: "Asana and ClickUp are valid alternatives, particularly for non-engineering or cross-functional teams. Linear and Jira are the canonical pair for engineering-first issue tracking; Asana and ClickUp serve broader workflow management with less engineering-specific tooling.",
      },
      {
        q: "What is the Brunson lens on Linear vs Jira?",
        a: "Linear is a clean Vehicle Change move (Brunson Expert Secrets) — same outcome (issue tracking) via a fundamentally different vehicle (opinionated defaults, speed-first UX). Jira is the category incumbent that cannot replicate Linear's positioning without abandoning its enterprise configurability story.",
      },
    ],
    tags: ["project-management", "developer-tools", "speed", "enterprise-vs-startup"],
    lastVerified: "2026-05-17",
  },

  {
    slug: "figma-vs-sketch",
    a: { name: "Figma", teardownSlug: "figma", url: "https://www.figma.com/" },
    b: { name: "Sketch", url: "https://www.sketch.com/" },
    category: "Design and prototyping",
    oneLine:
      "Figma won the design tool fight by making collaboration native and the browser the canvas. Sketch is the polished native-Mac legacy that has not been able to catch up.",
    tldr:
      "Figma and Sketch were once the two main contenders for product design tooling. Figma's browser-native collaboration changed the category permanently; Sketch's Mac-only legacy and weaker collaboration model lost the network battle. For new teams, Figma is the default. Sketch retains value for solo designers and Mac-committed studios that prefer native-app polish, but the category has effectively moved.",
    bestFor: {
      a: "Modern product design teams that collaborate across designers, developers, PMs, and clients in real time.",
      b: "Solo designers and Mac-committed studios that prefer native-app polish and do not need real-time collaboration.",
    },
    pickAIf: [
      "You collaborate with developers, PMs, or clients who need to view or comment on designs.",
      "Your team includes anyone on Windows or Linux.",
      "You want the largest design-systems community, plugin ecosystem, and FigJam whiteboarding integration.",
    ],
    pickBIf: [
      "You are a solo designer or small Mac-only studio that values native-app responsiveness over browser collaboration.",
      "Your workflow depends on specific Sketch plugins that have no Figma equivalent.",
      "You strongly prefer file-based workflows over real-time multiplayer.",
    ],
    dimensions: [
      {
        name: "Real-time collaboration",
        a: "Native multiplayer; viewers, commenters, and editors all coexist in the same file in real time.",
        b: "File-based; collaboration via shared workspace and Sketch Cloud but not real-time multiplayer at parity.",
        winner: "A",
      },
      {
        name: "Cross-platform support",
        a: "Browser-native; works on Mac, Windows, Linux, ChromeOS, iPad.",
        b: "Mac-only desktop app; viewer access on web.",
        winner: "A",
      },
      {
        name: "Pricing model",
        a: "Free Starter, ~$15/editor/mo Professional, ~$45/editor/mo Organization, ~$75/editor/mo Enterprise (verified 2026-05-17). Viewers are free.",
        b: "~$10/editor/mo billed annually (Standard), ~$20/editor/mo (Business). Viewers included on Sketch Cloud.",
        winner: "B",
        note: "Sketch is cheaper per editor; Figma's viewer-free model often makes total cost lower at team scale.",
      },
      {
        name: "Plugin ecosystem",
        a: "Large and growing; Figma plugins are first-class with deep API access.",
        b: "Mature plugin ecosystem; many original Sketch plugins predate Figma's.",
        winner: "tie",
        note: "Both ecosystems are deep; specific plugin availability varies.",
      },
      {
        name: "Developer handoff",
        a: "Dev Mode is native; inspect, copy code, export assets without context-switching.",
        b: "Inspector available; tighter integration with Zeplin and similar third-party handoff tools.",
        winner: "A",
      },
      {
        name: "Whiteboarding and ideation",
        a: "FigJam is a first-class adjacent product included in some tiers.",
        b: "No native whiteboarding; relies on third-party tools (Miro, Whimsical).",
        winner: "A",
      },
      {
        name: "Native-app responsiveness",
        a: "Browser-based; very fast for what it is but constrained by the browser layer.",
        b: "Native macOS app; tighter integration with macOS conventions and slightly faster local-only operations.",
        winner: "B",
      },
      {
        name: "Design system tooling",
        a: "Excellent; team libraries, variables, shared styles, branching on Organization tier.",
        b: "Solid; Sketch Libraries, shared symbols, but smaller community of mature open systems.",
        winner: "A",
      },
    ],
    honestTake:
      "Figma and Sketch is a category fight that effectively ended around 2020 but the loser still has loyal users. Figma's browser-native collaboration changed the unit economics of design — designers, developers, PMs, and clients could all sit in the same file without anyone leaving their platform — and the network effects compounded. Sketch responded with Sketch Cloud and collaboration improvements but never caught up. The honest verdict for new teams in 2026 is Figma by default. Sketch retains value for solo Mac-only designers and Mac-committed studios that prefer native-app polish, but the broader category has moved.",
    forIndieFounders: {
      pick: "A",
      reasoning:
        "Figma is the right call for any indie founder who collaborates with developers or contractors. The viewer-free model means everyone can see the design at no cost, the browser canvas works on every platform, and the design-systems community produces templates that compress your design work meaningfully.",
    },
    faqs: [
      {
        q: "Is Sketch dying?",
        a: "Not dying, but no longer growing. Sketch still has a stable user base of Mac-committed designers and studios who actively prefer native-app polish. The category gravity has moved to Figma; Sketch's role is now the specialist alternative rather than the default.",
      },
      {
        q: "What about Adobe XD?",
        a: "Adobe XD effectively lost the category to Figma and Adobe acknowledged this by attempting to acquire Figma in 2022 (deal blocked by regulators in 2023). XD development continues but the strategic priority for Adobe has shifted.",
      },
      {
        q: "Can a Sketch shop migrate to Figma?",
        a: "Yes; Figma has Sketch file import. The migration is meaningful work for teams with deep symbol libraries but mechanically possible. The harder migration is the team habit shift away from native-app workflows.",
      },
      {
        q: "Is Figma's pricing really better than Sketch's?",
        a: "Per editor, Sketch is slightly cheaper. Total cost is usually lower on Figma because viewers, commenters, and developer handoff users are free. For a team where designers are the minority of file-touchers, Figma's economics dominate.",
      },
      {
        q: "What is the Brunson lens on Figma vs Sketch?",
        a: "Figma is the canonical New Opportunity move (Brunson Expert Secrets) — same outcome (product design) via a different vehicle (browser-native multiplayer). Sketch is the prior category leader that could not pivot without abandoning its native-app identity. The Brunson 'new vehicle' move beats the prior vehicle when the new vehicle is strictly better on a structural dimension; Figma's was.",
      },
    ],
    tags: ["design", "collaboration", "browser-native", "category-winner"],
    lastVerified: "2026-05-17",
  },

  {
    slug: "vercel-vs-netlify",
    a: { name: "Vercel", teardownSlug: "vercel", url: "https://vercel.com/" },
    b: { name: "Netlify", url: "https://www.netlify.com/" },
    category: "Frontend cloud and hosting",
    oneLine:
      "Vercel and Netlify pioneered the JAMstack hosting category together. Vercel pulled ahead by going deep on Next.js; Netlify retained breadth across frameworks.",
    tldr:
      "Vercel and Netlify built the modern frontend hosting category in parallel. Vercel went vertically deep on Next.js, becoming the canonical platform for that framework; Netlify stayed horizontally broad, supporting Hugo, Eleventy, Gatsby, Astro, Next.js, and others at parity. For Next.js teams, Vercel is the obvious pick. For framework-agnostic teams or those on other static generators, Netlify is a reasonable alternative; for everyone else, Vercel's polish and ecosystem have pulled the category center toward them.",
    bestFor: {
      a: "Next.js teams, React-heavy SaaS, and teams that value depth-first ecosystem integration.",
      b: "Framework-agnostic teams, JAMstack workflows on Hugo or Astro, and teams that prefer Netlify's identity (forms, auth, functions) bundling.",
    },
    pickAIf: [
      "You ship Next.js. Vercel's depth here is real and the integration tightness compounds.",
      "You want the latest React-ecosystem features (Server Components, Cache Components, partial prerendering) supported on day one.",
      "You value the AI SDK, AI Gateway, and Vercel's broader AI tooling integration.",
    ],
    pickBIf: [
      "You ship Hugo, Eleventy, Astro, Gatsby, or a non-Next React app and want first-class support without Next-tilted defaults.",
      "You use Netlify Identity, Netlify Forms, or Netlify Functions and value that integrated bundle.",
      "You want a hosting provider that is not Vercel for portfolio-diversification reasons.",
    ],
    dimensions: [
      {
        name: "Next.js support",
        a: "Canonical; Vercel maintains Next.js and ships new features there first.",
        b: "Good; Netlify supports Next.js with adapters but new features lag.",
        winner: "A",
      },
      {
        name: "Framework breadth",
        a: "Strong across frameworks but Next-tilted in defaults and documentation.",
        b: "Wider native breadth; treats every supported framework as a first-class citizen.",
        winner: "B",
      },
      {
        name: "Free tier",
        a: "Hobby tier is generous (compute, bandwidth, build minutes); commercial use forbidden — that boundary IS the upgrade trigger.",
        b: "Starter tier is generous (bandwidth, build minutes); commercial use permitted.",
        winner: "B",
        note: "Netlify allows commercial use on the free tier; Vercel does not. For pre-revenue indie SaaS, Netlify's permissive free tier is a real differentiator.",
      },
      {
        name: "Pricing at scale",
        a: "~$20/user/mo Pro plus metered usage overages (bandwidth, function invocations, builds).",
        b: "~$19/user/mo Pro plus metered usage overages. Pricing structure broadly comparable.",
        winner: "tie",
      },
      {
        name: "Developer experience",
        a: "Polished, opinionated, fast CLI. Strong Git integration with preview deploys per PR.",
        b: "Polished, slightly less opinionated. Strong Git integration with preview deploys per PR.",
        winner: "tie",
      },
      {
        name: "Edge compute / serverless functions",
        a: "Vercel Functions (formerly Edge + Serverless); Fluid Compute for shared regions.",
        b: "Netlify Functions and Edge Functions; comparable region support.",
        winner: "tie",
      },
      {
        name: "Integrated services",
        a: "Vercel Marketplace for databases (Neon, Upstash), AI Gateway, Blob storage, Edge Config.",
        b: "Netlify Identity (auth), Forms, Functions; integrated identity is the canonical Netlify-only feature.",
        winner: "different",
      },
      {
        name: "AI ecosystem",
        a: "Vercel AI SDK, AI Gateway with provider failover, AI integration tight with React and Next.",
        b: "Less AI-specific tooling; relies on external providers.",
        winner: "A",
      },
      {
        name: "Brand momentum",
        a: "Stronger in 2026 — winning founder mindshare and the React/Next category.",
        b: "Stable but no longer growing as fast in pure mindshare among new teams.",
        winner: "A",
      },
    ],
    honestTake:
      "Vercel and Netlify started as parallel pioneers of the JAMstack hosting category and were nearly interchangeable until around 2021. The divergence came when Vercel pulled developer mindshare by going vertically deep on Next.js — acquiring the framework, shipping features on day one, and bundling adjacent products (AI SDK, AI Gateway, databases via Marketplace) around the Next-and-React stack. Netlify retained horizontal breadth and continues to serve framework-agnostic teams well, particularly those on Hugo, Astro, or Eleventy. For most new teams in 2026 building React-centric SaaS, Vercel is the default. Netlify is the right pick when the team has explicit reasons to prefer it (framework agnosticism, integrated identity, free-tier commercial use).",
    forIndieFounders: {
      pick: "depends",
      reasoning:
        "If you ship Next.js, Vercel. If you ship a non-React framework or you need free-tier commercial use because you are pre-revenue and intend to monetize, Netlify is meaningfully better on the commercial-use question. The choice maps cleanly to your framework and stage rather than to general preference.",
    },
    faqs: [
      {
        q: "Is Vercel actually better than Netlify for Next.js?",
        a: "Yes, materially. Vercel maintains Next.js and ships features there first. New Next features (Cache Components, partial prerendering, the latest middleware patterns) work on Vercel on release day; Netlify catches up over weeks to months via adapter updates.",
      },
      {
        q: "Can I use Netlify's free tier for commercial projects?",
        a: "Yes. Netlify's Starter tier permits commercial use. Vercel's Hobby tier does not — commercial projects must upgrade to Pro. For pre-revenue indie SaaS evaluating both, this is one of the most meaningful structural differences.",
      },
      {
        q: "What about Cloudflare Pages or Render instead?",
        a: "Cloudflare Pages and Render are valid alternatives, particularly for teams that want different bundled features (Cloudflare's edge network and workers, Render's full-stack hosting). Vercel and Netlify remain the canonical pair for frontend-focused JAMstack hosting.",
      },
      {
        q: "Will Vercel's Next.js dominance lock me in?",
        a: "Somewhat. Next.js apps can deploy to other hosts via adapters but lose feature parity. If portability is critical, choose a framework with a more portable runtime (Astro, Hugo) or accept that the framework-host coupling is part of the bet.",
      },
      {
        q: "What is the Brunson lens on Vercel vs Netlify?",
        a: "Vercel ran the canonical Brunson 'Dream 100' move into the React/Next.js community and converted that mindshare into product depth. Netlify ran a more horizontal positioning that worked early but is structurally harder to defend at scale. The lesson for an indie SaaS: pick a Dream 100 community, go deep, and win that category before broadening.",
      },
    ],
    tags: ["hosting", "developer-tools", "nextjs", "jamstack"],
    lastVerified: "2026-05-17",
  },

  {
    slug: "beehiiv-vs-substack",
    a: { name: "Beehiiv", teardownSlug: "beehiiv", url: "https://www.beehiiv.com/" },
    b: { name: "Substack", url: "https://substack.com/" },
    category: "Newsletter platform",
    oneLine:
      "Beehiiv treats your newsletter as a business; Substack treats your newsletter as a publication. The right pick depends on which one is true for you.",
    tldr:
      "Beehiiv and Substack both publish newsletters but with inverted philosophies. Substack is a content-first, network-effect publication platform that owns the discovery layer (the Substack network). Beehiiv is a creator-business-first platform that gives the creator the monetization stack (ads, paid subs, referrals, Boost) without taking discovery rents. Pick Substack to ride the network; pick Beehiiv to own the business.",
    bestFor: {
      a: "Creators treating the newsletter as a business with multiple revenue streams, who want ad network access, referral mechanics, and a Boost cross-promotion network.",
      b: "Writers prioritizing publication and discovery via the Substack network, who value the readership graph effects over owning the monetization stack.",
    },
    pickAIf: [
      "You want to monetize via ads, paid subscriptions, and cross-promotion without giving up discovery rents.",
      "You treat the newsletter as a startup, not as a writing practice.",
      "You want subscriber-tiered pricing that scales with your audience rather than a percentage rake.",
    ],
    pickBIf: [
      "You value the Substack network and the cross-discovery from other Substack publications.",
      "You are a writer-first creator who treats the platform as a publication tool, not a business stack.",
      "You want the simplest possible operation: write, publish, take a single percentage rake on paid subs.",
    ],
    dimensions: [
      {
        name: "Monetization model",
        a: "Subscriber-tiered subscription. You pay Beehiiv; you keep all paid-subscription revenue.",
        b: "Free to use; Substack takes 10% of paid-subscription revenue plus Stripe fees.",
        winner: "different",
        note: "Substack is free upfront but takes a percentage rake; Beehiiv is paid upfront with no rake. Crossover depends on paid-sub revenue.",
      },
      {
        name: "Ad network",
        a: "Built-in ad network; creators earn ad revenue alongside subscription revenue.",
        b: "No native ad network; creators must sell sponsorships themselves.",
        winner: "A",
      },
      {
        name: "Referral mechanics",
        a: "Native subscriber referral system with built-in rewards.",
        b: "Native referral mechanics added but less mature than Beehiiv's.",
        winner: "A",
      },
      {
        name: "Cross-promotion network",
        a: "Boost network: creators promote each other's newsletters; Beehiiv pays for the cross-promotion.",
        b: "Substack Recommendations: creators recommend each other organically inside the Substack app.",
        winner: "different",
        note: "Substack's recommendation network is organic and free; Beehiiv's Boost is paid but more controllable.",
      },
      {
        name: "Network discovery",
        a: "Limited; Beehiiv does not provide a native readership graph.",
        b: "Strong; the Substack app and Notes network surface new publications to existing Substack readers.",
        winner: "B",
      },
      {
        name: "Pricing for the creator",
        a: "Free tier up to 2,500 subscribers; Scale ~$39-99/mo, Max ~$99-499/mo depending on subscribers (verified 2026-05-17).",
        b: "Free; Substack takes 10% of paid-subscription revenue.",
        winner: "different",
        note: "Below ~10K paid subs at $5/mo, Substack is cheaper. Above that, Beehiiv's flat tier becomes more economical.",
      },
      {
        name: "Customization and branding",
        a: "Custom domain, custom branding, full publication site control.",
        b: "Custom domain on paid tier; deeper Substack branding integration on the public side.",
        winner: "A",
      },
      {
        name: "Best for writer-first creators",
        a: "Possible but the platform leans toward business operators.",
        b: "Designed for the writer-first creator.",
        winner: "B",
      },
    ],
    honestTake:
      "Beehiiv and Substack are the same product category at opposite philosophical poles. Substack is a content network: you publish, the network helps you grow, and Substack takes a percentage rake on paid subscriptions. Beehiiv is a creator-business platform: you pay a subscription, you own the business stack (ads, paid subs, referrals, Boost), and there is no rake. The right pick depends on whether you value the network or the ownership. For writers building a publication, Substack's network is genuine leverage. For operators building a media business, Beehiiv's no-rake model and monetization stack compound into more long-term value.",
    forIndieFounders: {
      pick: "A",
      reasoning:
        "Indie founders building a newsletter as a business should pick Beehiiv. The no-rake monetization model, the ad network, and the Boost network all favor the operator who is treating the newsletter as a startup. Substack's discovery advantage is real for writers, but for an indie SaaS founder using the newsletter as a top-of-funnel for the SaaS product, owning the monetization stack matters more than borrowing the Substack network.",
    },
    faqs: [
      {
        q: "When does Beehiiv become cheaper than Substack?",
        a: "Roughly when annual paid-subscription revenue exceeds about $5K-10K. Below that, Substack's 10% rake is cheaper than Beehiiv's flat subscription. Above that, Beehiiv's flat fee dominates. The exact crossover depends on your subscriber count and average paid-sub price.",
      },
      {
        q: "Can I migrate from Substack to Beehiiv?",
        a: "Yes; Beehiiv supports Substack import. The migration is mechanical for the subscriber list and posts; the social-graph migration (Substack Recommendations, Notes audience) does not transfer.",
      },
      {
        q: "Does the Substack network really drive growth?",
        a: "Yes for some publications; less so for others. The Substack Recommendations network and Notes app drive meaningful growth for publications that already have momentum within Substack's reader graph. For cold-start newsletters, the network effect is real but not magical.",
      },
      {
        q: "Should I use ConvertKit, Kit, or another platform instead?",
        a: "ConvertKit (now Kit) is the canonical alternative for creators who want a deeper email-marketing tool than either Substack or Beehiiv. Kit is stronger on email-marketing features (automations, segmentation, deliverability); Beehiiv is stronger on the publication-as-business model. Pick by primary use case.",
      },
      {
        q: "What is the Brunson lens on Beehiiv vs Substack?",
        a: "Substack is a Borrowed-Authority Dream 100 play executed at platform scale — every publication on Substack borrows from the network's authority and the network grows because publications come. Beehiiv is a no-rake Value Ladder play that captures the creator-business segment by giving them more of the monetization stack. Different Brunson moves, different audiences.",
      },
    ],
    tags: ["newsletter", "creator-tools", "monetization", "network-effects"],
    lastVerified: "2026-05-17",
  },

  {
    slug: "cal-com-vs-calendly",
    a: { name: "Cal.com", teardownSlug: "cal-com", url: "https://cal.com/" },
    b: { name: "Calendly", url: "https://calendly.com/" },
    category: "Scheduling",
    oneLine:
      "Calendly built the scheduling category as a closed SaaS. Cal.com is the open-source rebuild positioned on principle and extensibility.",
    tldr:
      "Calendly and Cal.com offer near-identical scheduling functionality. Calendly is the closed-SaaS category default with the largest brand and integration ecosystem; Cal.com is the open-source alternative with self-host option, extensibility, and identical UX. For most users the functional choice is a coin flip; the meaningful choice is whether you value Calendly's polish and ecosystem or Cal.com's openness and principled positioning.",
    bestFor: {
      a: "Developers, agencies, and principled buyers who value open source, self-hosting, or extensibility beyond Calendly's integration ecosystem.",
      b: "Buyers prioritizing brand recognition, mature integration ecosystem, and the largest community of users familiar with the product.",
    },
    pickAIf: [
      "You value open-source software for principle or extensibility reasons.",
      "You want the option to self-host for privacy, control, or cost reasons.",
      "You need to embed scheduling deeply into your own product and benefit from open access to the source.",
    ],
    pickBIf: [
      "Your scheduling needs are standard and you value Calendly's brand recognition with your booking recipients.",
      "You need Calendly's specific deep integrations (Salesforce, Hubspot, Marketo) that Cal.com has not yet matched.",
      "You prefer the polish and stability of a mature closed-SaaS product over an open-source project's faster but more variable release cadence.",
    ],
    dimensions: [
      {
        name: "Core scheduling functionality",
        a: "Full parity with Calendly: round-robin, collective events, integrations, time-zone handling, embeds.",
        b: "Full feature set as the category creator; everything works as expected.",
        winner: "tie",
      },
      {
        name: "Open source",
        a: "AGPL-licensed; full source available; self-host supported.",
        b: "Closed source; hosted SaaS only.",
        winner: "A",
      },
      {
        name: "Self-host option",
        a: "Yes; free under AGPL.",
        b: "No.",
        winner: "A",
      },
      {
        name: "Pricing",
        a: "Free hosted tier; ~$12-15/seat/mo Teams; ~$37-50/seat/mo Organizations (verified 2026-05-17).",
        b: "Free tier (1 event type, limited features); ~$10-12/seat/mo Standard; ~$15-20/seat/mo Teams (verified 2026-05-17).",
        winner: "tie",
        note: "Pricing structures are broadly comparable; Cal.com's free hosted is more generous than Calendly's free tier.",
      },
      {
        name: "Free tier generosity",
        a: "Generous; full feature surface on free hosted.",
        b: "Constrained; one event type, limited features.",
        winner: "A",
      },
      {
        name: "Brand recognition with bookers",
        a: "Lower; many bookers will encounter Cal.com for the first time.",
        b: "Higher; Calendly is the category default and most bookers have used it.",
        winner: "B",
      },
      {
        name: "Integration ecosystem",
        a: "Strong core integrations; smaller marketplace than Calendly.",
        b: "Mature ecosystem with deep Salesforce, Hubspot, and Marketo bindings.",
        winner: "B",
      },
      {
        name: "Customization and extensibility",
        a: "Full source access; custom integrations possible at any depth.",
        b: "Customization within Calendly's integration framework.",
        winner: "A",
      },
    ],
    honestTake:
      "Cal.com and Calendly are functionally equivalent for the standard scheduling use case — round-robin, collective events, integrations with Google Calendar, Zoom, and the rest. The choice is mostly about values rather than features. Calendly wins on brand recognition and the maturity of its enterprise integration ecosystem. Cal.com wins on open-source principle, self-host availability, and a more generous free tier. For a buyer who does not care about either side of that split, the functional choice is a coin flip and Calendly's brand familiarity often wins by default. For a buyer who values openness or self-host, Cal.com is the clear pick.",
    forIndieFounders: {
      pick: "A",
      reasoning:
        "Cal.com's free hosted tier is more generous than Calendly's, the self-host option is a useful escape hatch if subscription costs become a concern, and the open-source positioning aligns with the indie founder community. For most indie founders, Cal.com is the better default; Calendly's brand and integration advantages mostly serve enterprise buyers.",
    },
    faqs: [
      {
        q: "Is Cal.com really functionally equivalent to Calendly?",
        a: "For the standard scheduling use cases, yes. Both handle round-robin, collective events, recurring events, integrations with major calendars, video links, payment collection, and team availability. Specific edge cases (unusual integrations, very large enterprise workflows) may favor Calendly.",
      },
      {
        q: "Should I self-host Cal.com?",
        a: "Usually no, at least at first. Hosting and maintaining the open-source version costs real engineering time. Most users self-host only when subscription cost meaningfully exceeds maintenance cost, which is typically at significant scale or for specific privacy reasons.",
      },
      {
        q: "Will my booking recipients be confused by Cal.com?",
        a: "Occasionally, yes. Most bookers have used Calendly and may not recognize Cal.com on first encounter. The functional experience is identical; the brand familiarity is the only difference and matters mostly for high-stakes external bookings.",
      },
      {
        q: "Can I migrate from Calendly to Cal.com?",
        a: "Yes; Cal.com supports import and the migration is mostly mechanical. Event types, available times, and integrations need to be re-set up but the model is the same.",
      },
      {
        q: "What is the Brunson lens on Cal.com vs Calendly?",
        a: "Cal.com is the canonical open-source New Opportunity move (Brunson Expert Secrets) — same outcome (scheduling) via a different vehicle (open source plus self-host option). Calendly is the category incumbent that cannot replicate open-source without abandoning its closed-SaaS revenue model. The Brunson move works when the new vehicle is genuinely better on a structural dimension that matters to a meaningful audience; for the developer and principled-buyer segment, openness is that dimension.",
      },
    ],
    tags: ["scheduling", "open-source", "alternative-to", "developer-tools"],
    lastVerified: "2026-05-17",
  },

  {
    slug: "resend-vs-sendgrid",
    a: { name: "Resend", teardownSlug: "resend", url: "https://resend.com/" },
    b: { name: "SendGrid", url: "https://sendgrid.com/" },
    category: "Email API",
    oneLine:
      "Resend is what developers pick when they choose freely. SendGrid is what companies inherit and quietly resent.",
    tldr:
      "Resend and SendGrid both ship transactional email but with inverted product philosophies. Resend is a modern developer-first API with clean docs, React Email integration, and a generous free tier. SendGrid is the legacy enterprise platform with deeper deliverability infrastructure, more compliance features, and a clunkier UX. For new projects, Resend is the obvious pick. For organizations with deep SendGrid integration or compliance needs that justify it, SendGrid remains the inherited reality.",
    bestFor: {
      a: "Indie founders, startups, and developer-led teams shipping new projects or actively replacing legacy email infrastructure.",
      b: "Enterprises with deep existing SendGrid integration, very high-volume senders, or specific compliance and deliverability needs.",
    },
    pickAIf: [
      "You are starting a new project and want the cleanest possible API and developer experience.",
      "You use React and want first-class React Email integration for building email templates.",
      "You want a generous free tier (3K/mo) that covers most indie SaaS in production.",
    ],
    pickBIf: [
      "You already run on SendGrid and the migration cost exceeds the developer-experience benefit.",
      "You send at very high volume and need SendGrid's mature scale infrastructure and dedicated IP pool.",
      "You have specific compliance requirements (HIPAA, FedRAMP, certain ISO certifications) that Resend has not yet certified.",
    ],
    dimensions: [
      {
        name: "Developer experience",
        a: "Modern; clean SDK, sharp docs, React Email integration, fast onboarding.",
        b: "Legacy; SDK works but feels dated, docs are dense, onboarding has friction.",
        winner: "A",
      },
      {
        name: "Pricing",
        a: "Free tier (3K emails/mo); ~$20/mo for 50K (verified 2026-05-17); scales linearly.",
        b: "Free tier (100 emails/day); pricing scales by volume with marketing plans separated from API plans.",
        winner: "A",
      },
      {
        name: "Free tier generosity",
        a: "3K/mo is production-grade for most indie SaaS.",
        b: "100/day is a trial cap; not production for most.",
        winner: "A",
      },
      {
        name: "Deliverability infrastructure",
        a: "Strong; managed IP pools and dedicated IP option on Pro.",
        b: "Mature; longer history of deliverability tuning at very high volume.",
        winner: "B",
        note: "Both deliver well; SendGrid's deliverability advantage is most relevant at multi-million-email-per-month scale.",
      },
      {
        name: "React Email integration",
        a: "First-class; React Email is a Resend open-source project.",
        b: "No native React integration; relies on external template tooling.",
        winner: "A",
      },
      {
        name: "Marketing email capabilities",
        a: "Built but not the primary focus; broadcast and audience features available.",
        b: "Mature marketing email product (SendGrid Marketing Campaigns); deeper segmentation and broadcast tooling.",
        winner: "B",
      },
      {
        name: "Compliance certifications",
        a: "SOC 2 Type II; HIPAA available; broad certification surface in progress.",
        b: "Broad enterprise certification surface (HIPAA, FedRAMP, SOC 2, ISO).",
        winner: "B",
      },
      {
        name: "Brand momentum",
        a: "Strong; winning developer mindshare in 2026.",
        b: "Established but no longer growing in pure mindshare among new teams.",
        winner: "A",
      },
    ],
    honestTake:
      "Resend and SendGrid are the same product category at opposite ends of the modern-vs-legacy axis. Resend wins on developer experience by a wide margin — the API is cleaner, the docs are tighter, React Email integration is first-class, and the free tier is generous enough to ship production indie SaaS on. SendGrid wins on enterprise compliance and very high-volume infrastructure that few indie SaaS will ever need. For new projects in 2026, Resend is the strict upgrade. For organizations on SendGrid, the migration is mechanical but the inertia is real and the right call depends on how much the developer-experience friction is costing.",
    forIndieFounders: {
      pick: "A",
      reasoning:
        "Resend is the right choice for indie SaaS founders. The free tier is production-grade, the API is clean enough to integrate in an afternoon, React Email lets you build templates in components rather than HTML strings, and the brand momentum signals that the platform will keep improving. SendGrid is excellent at enterprise scale but the developer experience is calibrated for a different buyer.",
    },
    faqs: [
      {
        q: "Will Resend actually deliver my emails?",
        a: "Yes; deliverability at indie-SaaS volume (under millions per month) is comparable to SendGrid. The deliverability advantage SendGrid has at multi-million-email scale does not meaningfully affect smaller senders.",
      },
      {
        q: "Should I use Resend for marketing email?",
        a: "Resend supports broadcast and audience features but is primarily a transactional email API. For sophisticated marketing campaigns (deep segmentation, complex automation, broadcast email at scale), Loops, Klaviyo, or Customer.io are usually a better fit.",
      },
      {
        q: "Can I migrate from SendGrid to Resend?",
        a: "Yes; the migration is mechanical because both speak roughly the same API shape. Templates need re-creation (React Email format if you adopt it; HTML if not), webhooks need re-wiring, and SPF/DKIM needs re-verification with the new sender.",
      },
      {
        q: "What about Postmark or AWS SES?",
        a: "Postmark is excellent for transactional email with similar developer-friendly positioning; SES is the cheapest option per email but requires significant integration work and lacks the polish of either Resend or Postmark. The right alternative depends on whether you optimize for developer experience (Postmark or Resend), price (SES), or features.",
      },
      {
        q: "What is the Brunson lens on Resend vs SendGrid?",
        a: "Resend is the New Opportunity move (Brunson Expert Secrets) — same outcome (transactional email) via a different vehicle (modern developer experience, React Email, generous free tier). SendGrid is the category incumbent unable to match the new vehicle without abandoning its legacy enterprise positioning. For developer-targeted SaaS, the New Opportunity move usually wins when the structural difference is real, and Resend's developer-experience gap is real.",
      },
    ],
    tags: ["email", "developer-tools", "transactional-email", "developer-experience"],
    lastVerified: "2026-05-17",
  },

  {
    slug: "stripe-vs-paypal",
    a: { name: "Stripe", teardownSlug: "stripe", url: "https://stripe.com/" },
    b: { name: "PayPal", url: "https://www.paypal.com/" },
    category: "Payments processing",
    oneLine:
      "Stripe is what you integrate. PayPal is what you accept because some customers demand it.",
    tldr:
      "Stripe and PayPal serve overlapping but different jobs. Stripe is a developer-first payment infrastructure that integrates into your product as the primary checkout. PayPal is a consumer-facing brand that some buyers actively prefer and others actively require. For most modern SaaS, the right answer is Stripe as primary plus PayPal as a secondary option, not Stripe versus PayPal as either-or.",
    bestFor: {
      a: "Modern SaaS, developer-built products, and any business where checkout is integrated into the product surface.",
      b: "Businesses serving customers who prefer or require PayPal as a payment method (international consumers, certain demographics, certain countries).",
    },
    pickAIf: [
      "You are building or integrating a custom checkout into your product.",
      "Your buyer evaluates payment processors on developer experience and API quality.",
      "You want a single platform that handles cards, wallets, subscriptions, marketplaces, and global payments.",
    ],
    pickBIf: [
      "Your customers actively demand PayPal as a payment method (common in some demographics and regions).",
      "You sell to international consumers who trust PayPal's buyer protection more than direct card payment.",
      "Your business model fits PayPal's specific tooling (PayPal Working Capital, certain niche features).",
    ],
    dimensions: [
      {
        name: "Developer experience",
        a: "Industry-leading; clean API, deep documentation, mature SDKs in every major language.",
        b: "Functional but dated; multiple overlapping API generations, less polished SDK experience.",
        winner: "A",
      },
      {
        name: "Pricing",
        a: "2.9% + 30¢ per charge (US standard, verified 2026-05-17). Custom pricing at scale.",
        b: "2.9% + fixed fee per transaction (US standard); higher percentages for some international and microtransaction tiers.",
        winner: "tie",
        note: "Headline rates broadly comparable; structure differs at edges.",
      },
      {
        name: "Subscription billing",
        a: "Mature; Stripe Billing is the canonical subscription product with deep dunning, retention, and tax tools.",
        b: "PayPal subscriptions exist but are less feature-rich than Stripe Billing.",
        winner: "A",
      },
      {
        name: "Consumer brand recognition",
        a: "Limited; consumers see Stripe on backend but rarely as a brand.",
        b: "Very high; PayPal is a household name globally.",
        winner: "B",
      },
      {
        name: "Consumer trust as standalone payment",
        a: "Lower; consumers paying with a card via Stripe trust the merchant, not Stripe specifically.",
        b: "Higher; some consumers will only buy when PayPal is offered because of PayPal's buyer protection.",
        winner: "B",
      },
      {
        name: "Marketplaces and Connect",
        a: "Stripe Connect is the canonical platform for marketplaces and platform businesses.",
        b: "PayPal supports marketplaces but with less developer-friendly tooling.",
        winner: "A",
      },
      {
        name: "International coverage",
        a: "Broad and growing; available in most major countries; new countries added regularly.",
        b: "Broader historical coverage; available in countries where Stripe is not yet live.",
        winner: "B",
        note: "PayPal's country footprint is wider, particularly in some emerging markets.",
      },
      {
        name: "Payout flexibility",
        a: "Configurable schedule; supports many bank rails globally.",
        b: "Flexible payout but routing through the PayPal balance creates an extra step for some businesses.",
        winner: "A",
      },
    ],
    honestTake:
      "Stripe and PayPal is rarely an either-or question for modern SaaS. The right architecture for most businesses is Stripe as the primary checkout (developer experience, subscription billing, marketplace tooling, global infrastructure) plus PayPal as a secondary payment method for customers who actively prefer or require it. PayPal-only businesses still exist but are increasingly rare for new SaaS; Stripe-only is fine until a customer cohort starts asking for PayPal. The Brunson framing: Stripe is the modern vehicle for payments; PayPal is the entrenched alternative payment method that some buyer segments require.",
    forIndieFounders: {
      pick: "A",
      reasoning:
        "Start with Stripe. Add PayPal later only if customer demand justifies the additional integration. Most indie SaaS never need PayPal; the integration cost and operational overhead only earn back when a specific buyer segment requires it.",
    },
    faqs: [
      {
        q: "Do I need to offer PayPal at all?",
        a: "Depends on your audience. SaaS targeting developer or B2B audiences usually do not need PayPal; consumer-facing products selling globally, particularly to demographics that prefer PayPal's buyer protection, often see conversion lift from adding it. Test with your specific audience before committing.",
      },
      {
        q: "Can I add PayPal alongside Stripe?",
        a: "Yes; Stripe Checkout supports adding PayPal as an additional payment method, and standalone PayPal buttons can sit alongside a Stripe-powered checkout. The integration cost is modest if you use Stripe's bundled PayPal option.",
      },
      {
        q: "Is Stripe really better than PayPal for SaaS?",
        a: "For developer experience, subscription billing, and platform tooling, yes — by a wide margin. For consumer trust and brand recognition in specific demographics, PayPal is sometimes the better single choice. The right answer for most modern SaaS is to use both.",
      },
      {
        q: "What about Square, Braintree, or Adyen?",
        a: "Square is strong for physical-world payments and small business POS. Braintree (owned by PayPal) is a developer-friendlier PayPal alternative for integrated checkout. Adyen is a strong enterprise option with similar developer experience to Stripe. For most modern SaaS, Stripe is the default; the alternatives serve specific niches.",
      },
      {
        q: "What is the Brunson lens on Stripe vs PayPal?",
        a: "Stripe ran the canonical Brunson 'Dream 100' move into the developer community and built infrastructure that converted developer mindshare into integration depth. PayPal owns the consumer brand and the entrenched buyer-trust position. Different audiences, different mechanisms, both still strong. The lesson: do not assume the better product wins; the product positioned to the right Dream 100 wins.",
      },
    ],
    tags: ["payments", "consumer-brand", "developer-tools", "complementary"],
    lastVerified: "2026-05-17",
  },
];

// Indexed lookup.
const COMPARISONS_BY_SLUG: Map<string, Comparison> = new Map(
  COMPARISONS_LIST.map((c) => [c.slug, c]),
);

/** Read-only catalog. Iteration order is canonical. */
export const COMPARISONS: ReadonlyArray<Comparison> = COMPARISONS_LIST;

/** Slug list for generateStaticParams and sitemap.ts. */
export const COMPARISON_SLUGS: ReadonlyArray<string> = COMPARISONS_LIST.map(
  (c) => c.slug,
);

export function getComparisonBySlug(slug: string): Comparison | undefined {
  return COMPARISONS_BY_SLUG.get(slug);
}

/**
 * Comparisons that include a given product (by either A or B side, matched
 * on the optional teardownSlug). Used by funnel-teardown and pricing-teardown
 * detail pages to render "Compared with" cross-link blocks when applicable.
 */
export function getComparisonsForProductSlug(
  productSlug: string,
): ReadonlyArray<Comparison> {
  return COMPARISONS_LIST.filter(
    (c) => c.a.teardownSlug === productSlug || c.b.teardownSlug === productSlug,
  );
}

/** Group comparisons by category for the hub page. */
export function groupComparisonsByCategory(): ReadonlyArray<{
  category: string;
  comparisons: ReadonlyArray<Comparison>;
}> {
  const order: string[] = [];
  const buckets: Map<string, Comparison[]> = new Map();
  for (const c of COMPARISONS_LIST) {
    if (!buckets.has(c.category)) {
      buckets.set(c.category, []);
      order.push(c.category);
    }
    buckets.get(c.category)!.push(c);
  }
  return order.map((category) => ({
    category,
    comparisons: buckets.get(category)!,
  }));
}
