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

  {
    slug: "tally-vs-google-forms",
    a: { name: "Tally", teardownSlug: "tally", url: "https://tally.so/" },
    b: { name: "Google Forms", url: "https://forms.google.com/" },
    category: "Forms and surveys",
    oneLine:
      "Tally and Google Forms are both free, but free-as-in-Google-product-strategy is a different thing than free-as-in-business-model.",
    tldr:
      "Tally and Google Forms both offer free form-building, but they sit in different product worlds. Google Forms is a feature of Google Workspace, polished enough but anchored to Google's product priorities, not yours. Tally is a focused indie SaaS where forms ARE the product, and the polish, branding, and integrations reflect that. For most public-facing forms, Tally wins; for internal surveys inside a Google Workspace org, Google Forms is the obvious pick.",
    bestFor: {
      a: "Indie founders, creators, and public-facing teams who want polished forms on their own marketing site without per-submission caps or Google branding.",
      b: "Teams inside Google Workspace running internal surveys, signups, or simple data collection where the Forms-Sheets-Drive integration is the dominant factor.",
    },
    pickAIf: [
      "Your form lives on your public site and you want it to look intentional rather than utilitarian.",
      "You need conditional logic, multi-step flows, calculations, or polished branding.",
      "You value your form data flowing into a SaaS workspace, not a Google Sheet.",
    ],
    pickBIf: [
      "You are inside Google Workspace and your form data needs to land in Google Sheets, Drive, or Classroom anyway.",
      "You need the absolute simplest form for internal use and aesthetics do not matter.",
      "Zero-cost is non-negotiable and Google's brand on the form is acceptable.",
    ],
    dimensions: [
      {
        name: "Pricing model",
        a: "Free forever with unlimited submissions; paid tier (~$29/mo) for branding, logic, file uploads.",
        b: "Completely free for Google account holders; bundled in Google Workspace.",
        winner: "different",
        note: "Both genuinely free for the basic case; the trade is on what 'free' means strategically.",
      },
      {
        name: "Public-facing polish",
        a: "Designed for the marketing page; clean modern aesthetic, custom branding on paid tier.",
        b: "Utilitarian aesthetic; reads as 'this is a Google Form,' which is fine for some contexts and wrong for others.",
        winner: "A",
      },
      {
        name: "Conditional logic and multi-step flows",
        a: "Core feature; jump logic, conditional questions, calculations on paid tier.",
        b: "Section-based jump logic available; meaningfully less powerful than Tally or Typeform.",
        winner: "A",
      },
      {
        name: "Integration ecosystem",
        a: "Solid: Zapier, webhooks, Notion, Slack, Sheets, native integrations.",
        b: "Native Google ecosystem (Sheets, Drive, Classroom); broader via Apps Script and Zapier.",
        winner: "different",
        note: "Tally is broader across the SaaS ecosystem; Google Forms is deeper inside Google Workspace.",
      },
      {
        name: "Brand recognition with respondents",
        a: "Lower; many respondents will encounter Tally for the first time.",
        b: "Universal; everyone knows Google Forms.",
        winner: "B",
      },
      {
        name: "Free-tier production-grade",
        a: "Yes — most indie SaaS can ship forms in production on the free tier.",
        b: "Yes — Google Forms's free tier is the only tier and is production-grade for internal use.",
        winner: "tie",
      },
      {
        name: "Data privacy positioning",
        a: "Independent SaaS; data lives inside Tally and the integrations you wire.",
        b: "Inside the Google data ecosystem; some buyers actively prefer this, some actively reject it.",
        winner: "different",
      },
      {
        name: "Form-builder UX",
        a: "Notion-like editor; familiar to anyone who uses Notion.",
        b: "Section-based linear builder; familiar to anyone who has ever used Google Workspace.",
        winner: "tie",
      },
    ],
    honestTake:
      "Tally and Google Forms are both free but not interchangeable. Google Forms is Google's commodity feature in the form space — polished enough, anchored to Google's roadmap priorities, and effectively zero-cost for anyone with a Google account. Tally is a focused indie SaaS where forms are the product, which shows up in the public-facing polish, the logic depth, and the brand-removal upgrade path. For internal Google Workspace surveys, Google Forms wins by default and the comparison is not really competitive. For anything that lives on a public marketing surface, Tally's polish and conditional logic outweigh the brand recognition advantage of Google Forms.",
    forIndieFounders: {
      pick: "A",
      reasoning:
        "Tally for public-facing forms, every time. The aesthetic gap on the marketing site is too large to ignore, and the logic-and-branding upgrade path on Tally's paid tier matches how most indie SaaS scale. Use Google Forms only for genuine internal-only collection inside a Workspace org.",
    },
    faqs: [
      {
        q: "Is Tally really worth paying for when Google Forms is free?",
        a: "Yes, when the form is on your marketing site. The free tier of Tally itself is also free; the paid tier upgrade (brand removal, advanced logic) costs about $29/mo and pays for itself the moment a serious respondent decides whether to fill the form based on how the page reads.",
      },
      {
        q: "Will Google Forms hurt my brand on a public site?",
        a: "Sometimes. For some audiences (academic, internal corporate, simple surveys), the Google Forms brand is neutral or positive — it signals reliability. For founder-facing or creator-facing marketing surfaces, the Google Forms aesthetic reads as effort-light and can lower conversion.",
      },
      {
        q: "Does Google Forms have logic and calculations?",
        a: "Section-level jump logic is supported; meaningful calculations and conditional questions are not at parity with Tally or Typeform. If your form needs branching by answer or per-respondent dynamic pricing, Tally is the right tool.",
      },
      {
        q: "Can I migrate from Google Forms to Tally?",
        a: "Tally has Google Forms import. Existing Google Forms responses do not migrate; new submissions flow into Tally going forward. Most teams migrate by exporting the Sheet of past responses for archive and starting fresh in Tally.",
      },
      {
        q: "What is the Brunson lens on Tally vs Google Forms?",
        a: "Google Forms is a commodity feature inside Google Workspace; it is not a focused offer. Tally is a focused offer in the form category. The Brunson move 'a focused offer beats a commodity feature when the buyer cares about the category' applies cleanly: indie SaaS founders care about form polish, so Tally's focused offer wins.",
      },
    ],
    tags: ["forms", "freemium", "indie-friendly", "commodity-vs-focused"],
    lastVerified: "2026-05-17",
  },

  {
    slug: "notion-vs-obsidian",
    a: { name: "Notion", teardownSlug: "notion", url: "https://www.notion.so/" },
    b: { name: "Obsidian", url: "https://obsidian.md/" },
    category: "Notes and knowledge management",
    oneLine:
      "Notion is a cloud workspace built for teams. Obsidian is a local-first knowledge graph built for one brain.",
    tldr:
      "Notion and Obsidian look superficially similar but solve different problems. Notion is a cloud-first team workspace with databases, real-time collaboration, and SaaS pricing. Obsidian is a local-first knowledge graph built on plain markdown files, with a free single-user license and optional paid sync. For team knowledge, Notion. For a single brain building a long-term linked knowledge base, Obsidian. They rarely actually compete on the same job.",
    bestFor: {
      a: "Teams building shared docs, wikis, project plans, and lightly-structured workflows.",
      b: "Individual researchers, writers, and knowledge workers building a long-term personal knowledge graph from markdown files they own.",
    },
    pickAIf: [
      "You collaborate with a team and need real-time co-editing.",
      "You want databases, kanban views, and project management tools alongside docs.",
      "You value the polished UX and large template community more than data ownership.",
    ],
    pickBIf: [
      "You want your notes as plain markdown files on your own disk, forever.",
      "You build a personal knowledge graph (Zettelkasten, second brain) over years.",
      "You value powerful third-party plugins and local-first software philosophy.",
    ],
    dimensions: [
      {
        name: "Data ownership",
        a: "Cloud-hosted; your data lives in Notion's database.",
        b: "Local-first; your notes are plain markdown files on your disk, in folders you own.",
        winner: "B",
      },
      {
        name: "Collaboration",
        a: "Real-time multiplayer; team workspaces are the core use case.",
        b: "Single-user by design; team plugins and sync exist but are not first-class.",
        winner: "A",
      },
      {
        name: "Pricing",
        a: "Free personal tier; ~$10/seat/mo Plus, ~$18/seat/mo Business (verified 2026-05-17).",
        b: "Free for personal use; Obsidian Sync ~$10/mo if you want cross-device sync; Publish ~$10/mo for public publishing.",
        winner: "B",
        note: "Obsidian is free for the core use case; only optional services have a cost.",
      },
      {
        name: "Databases and structured data",
        a: "First-class; relational tables, views, filters, formulas.",
        b: "Limited; community plugins like Dataview provide query-like behavior but it is markdown-first.",
        winner: "A",
      },
      {
        name: "Knowledge graph and backlinks",
        a: "Mentions and backlinks exist but the link graph is not the primary mental model.",
        b: "First-class; the graph view and backlinks are central to how Obsidian is designed.",
        winner: "B",
      },
      {
        name: "Plugin ecosystem",
        a: "Notion API and integrations; less of a 'plugin' culture.",
        b: "Vast; thousands of community plugins for graph manipulation, themes, workflows.",
        winner: "B",
      },
      {
        name: "Mobile experience",
        a: "Polished mobile apps; full editing supported.",
        b: "Mobile apps available; some plugins are desktop-only.",
        winner: "A",
      },
      {
        name: "Team adoption ease",
        a: "Easy; everyone in the team logs in and shares pages.",
        b: "Hard; team workflows require sync setup and shared vaults, less battery-included.",
        winner: "A",
      },
    ],
    honestTake:
      "Notion and Obsidian compete in the same broad notes-and-knowledge category but rarely actually replace each other. Notion is the right pick when knowledge is shared across people in a team context. Obsidian is the right pick when knowledge is built by one person over years and the data ownership, local-first philosophy, and graph thinking matter. Many serious knowledge workers run both: Notion for team collaboration and shared wikis, Obsidian for personal research and writing. The choice is almost always about who is using it, not which is better.",
    forIndieFounders: {
      pick: "A",
      reasoning:
        "Notion for any indie SaaS that has more than one person or expects to. The team-collaboration shape is the immediate need. Add Obsidian later for personal long-term knowledge if that fits your workflow, but do not start with it as a team tool.",
    },
    faqs: [
      {
        q: "Can Obsidian replace Notion for a small team?",
        a: "With effort, yes — using a shared vault (via iCloud, Dropbox, or git), the Obsidian Sync paid service, or community plugins. The collaboration experience never feels as smooth as Notion's real-time multiplayer because Obsidian is not designed around it.",
      },
      {
        q: "Is Obsidian really free?",
        a: "For personal use, yes. Obsidian's commercial-use license requires payment for teams using it in their work, and Sync/Publish are paid add-ons. For an individual building a personal knowledge base, the core product is free in perpetuity.",
      },
      {
        q: "Why does data ownership matter?",
        a: "Because Notion can change pricing, shut down, or lose your data; Obsidian's markdown files exist on your disk regardless of Obsidian the company. For long-horizon knowledge work, the asymmetry favors local-first. For short-horizon team docs, it does not matter.",
      },
      {
        q: "Can I sync Obsidian notes to a team-collab tool later?",
        a: "Yes; markdown is the universal substrate. You can pipeline Obsidian notes into Notion, into a static site, into a wiki — the files are yours. The migration in the other direction (Notion to Obsidian) is harder because Notion's block model does not cleanly export to flat markdown.",
      },
      {
        q: "What is the Brunson lens on Notion vs Obsidian?",
        a: "Both companies use a clear Dream Customer positioning — Notion for teams, Obsidian for individuals building knowledge over time. They do not actually compete on the same buyer; they share keywords and category but serve different identities. The Brunson move 'name your Dream Customer precisely' is executed cleanly by both, in opposite directions.",
      },
    ],
    tags: ["notes", "knowledge-management", "local-first", "individual-vs-team"],
    lastVerified: "2026-05-17",
  },

  {
    slug: "linear-vs-asana",
    a: { name: "Linear", teardownSlug: "linear", url: "https://linear.app/" },
    b: { name: "Asana", url: "https://asana.com/" },
    category: "Project management",
    oneLine:
      "Linear is for engineering teams who hate Jira. Asana is for cross-functional teams who never wanted Jira in the first place.",
    tldr:
      "Linear and Asana solve different jobs that sometimes look the same. Linear is opinionated issue tracking for software teams; Asana is flexible task and project management for cross-functional teams (marketing, ops, design, sales). For an engineering-only team, Linear is the obvious pick. For teams where engineering, marketing, and ops collaborate on shared work, Asana is the right shape.",
    bestFor: {
      a: "Software engineering teams who want fast, opinionated issue tracking calibrated to dev workflows.",
      b: "Cross-functional teams (marketing, ops, design, engineering) collaborating on shared projects with diverse workflow needs.",
    },
    pickAIf: [
      "Your team is all engineers, or near it.",
      "You value speed, keyboard-first UX, and opinionated defaults over configurability.",
      "Your workflow maps cleanly to issues, cycles, and projects in a software sense.",
    ],
    pickBIf: [
      "Your team includes meaningful non-engineering members (marketing, design, ops, sales).",
      "You manage projects with varied workflows that do not all fit the issue-cycle-project model.",
      "You need timeline views, workload balancing, and goal-tracking features Linear does not focus on.",
    ],
    dimensions: [
      {
        name: "Target user",
        a: "Software engineering teams; engineers are the first-class user.",
        b: "Cross-functional teams; designed so non-engineers and engineers can both be first-class users.",
        winner: "different",
      },
      {
        name: "Speed and UX",
        a: "Among the fastest web apps in the category; keyboard-first.",
        b: "Polished but slower; UX designed for cross-functional accessibility rather than power-user speed.",
        winner: "A",
      },
      {
        name: "Workflow flexibility",
        a: "Intentionally constrained; one opinionated workflow.",
        b: "Highly flexible; supports many project structures and team workflows.",
        winner: "B",
      },
      {
        name: "Engineering workflow fit",
        a: "Native; cycles, projects, GitHub/Slack/Figma integrations all designed for dev work.",
        b: "Possible but generic; engineering teams often feel the workflow does not quite fit them.",
        winner: "A",
      },
      {
        name: "Non-engineering workflow fit",
        a: "Awkward for marketing campaigns, design reviews, sales pipelines.",
        b: "Native; templates and integrations exist for marketing, design, ops, sales workflows.",
        winner: "B",
      },
      {
        name: "Pricing",
        a: "Free tier (250 issues), ~$8-10/user/mo Basic, ~$14/user/mo Business (verified 2026-05-17).",
        b: "Free tier (up to 10 users), ~$11/user/mo Starter, ~$25/user/mo Advanced (verified 2026-05-17).",
        winner: "A",
        note: "Linear is meaningfully cheaper at the engineering-team tier; Asana costs more partly because its surface area is larger.",
      },
      {
        name: "Goal and OKR tracking",
        a: "Limited; Linear focuses on issues, cycles, and projects.",
        b: "Mature Goals product; OKRs and goal hierarchy are first-class.",
        winner: "B",
      },
      {
        name: "Timeline and Gantt views",
        a: "Project roadmaps available; less mature than Asana's timeline view.",
        b: "First-class Timeline / Gantt view; designed for project managers.",
        winner: "B",
      },
    ],
    honestTake:
      "Linear and Asana are not really competing for the same buyer. Linear's audience is software engineering teams who left Jira; Asana's audience is cross-functional teams that never adopted Jira because Jira does not fit their work. The mistake some teams make is picking one without naming who actually uses it. If your team is engineers, Linear wins decisively. If your team mixes engineering with marketing, ops, design, or sales, Asana's flexibility is the right call — even if engineers grumble about the speed. There is no good universal answer; the question is who is the dominant user.",
    forIndieFounders: {
      pick: "depends",
      reasoning:
        "If you are a solo founder or all-engineer team, Linear by default — speed and opinion match how you work. If you are running a small team across engineering plus marketing plus customer success, Asana is the more honest choice. Picking Linear because it is the cool default and then bolting on workarounds for non-engineering work is a common indie-team mistake.",
    },
    faqs: [
      {
        q: "Can Linear handle marketing or design work?",
        a: "Workably, but awkwardly. The issue model is engineering-shaped; treating a marketing campaign or design review as a Linear issue feels like forcing a square peg. Teams that try this usually end up duplicating context across Linear and a second tool.",
      },
      {
        q: "Can Asana handle engineering work?",
        a: "Yes, but engineers typically feel it lacks the speed and integration tightness of Linear or Jira. Engineering-led teams that want to use Asana for cross-functional planning often keep a dedicated issue tracker (Linear or GitHub Issues) for actual engineering work.",
      },
      {
        q: "What about a hybrid: Linear for engineering, Asana for everyone else?",
        a: "Common at slightly larger companies. The tradeoff is two subscriptions, two systems of record, and ambiguity about where cross-functional work lives. Workable but adds operational friction.",
      },
      {
        q: "Why is Asana more expensive?",
        a: "Larger product surface area (Goals, Timeline, Workload, Portfolios, Workflow Builder) and a buyer (PMs and ops leaders) who has bigger budgets than engineering tooling buyers. The pricing reflects what the buyer expects to pay.",
      },
      {
        q: "What is the Brunson lens on Linear vs Asana?",
        a: "Both companies execute the Brunson 'Dream Customer naming' move precisely, in opposite directions. Linear names the software engineer; Asana names the cross-functional knowledge worker. Each says 'this is for you' to a different person, and that clarity is why both are growing.",
      },
    ],
    tags: ["project-management", "team-tools", "engineering-vs-crossfunctional"],
    lastVerified: "2026-05-17",
  },

  {
    slug: "figma-vs-adobe-xd",
    a: { name: "Figma", teardownSlug: "figma", url: "https://www.figma.com/" },
    b: { name: "Adobe XD", url: "https://www.adobe.com/products/xd.html" },
    category: "Design and prototyping",
    oneLine:
      "Adobe XD effectively lost the design tool fight to Figma. The category has moved; XD is now legacy software with declining strategic priority.",
    tldr:
      "Adobe XD competed with Figma in the modern design tool category through the late 2010s and lost decisively. Adobe attempted to acquire Figma in 2022 (deal blocked by regulators in 2023), implicitly acknowledging the loss. XD remains supported but is no longer the strategic priority at Adobe. For new teams, Figma is the only reasonable pick. XD retains some users in Adobe-committed shops or on specific workflows but should not be considered a forward-looking option.",
    bestFor: {
      a: "Any new product design team in 2026. The default.",
      b: "Existing Adobe Creative Cloud-committed shops on XD-anchored workflows who have not yet migrated.",
    },
    pickAIf: [
      "You are a new team picking a design tool freely.",
      "You collaborate with developers, PMs, or clients in real time.",
      "You value the largest design-systems community and plugin ecosystem.",
    ],
    pickBIf: [
      "You are already committed to Adobe Creative Cloud and XD bundles in your subscription.",
      "Your workflow has historical XD assets that have not been migrated.",
      "You have a specific reason to prefer Adobe's ecosystem integration over the design tool itself.",
    ],
    dimensions: [
      {
        name: "Strategic momentum",
        a: "Winning the category; investment, hiring, feature velocity all strong.",
        b: "Declining priority at Adobe; the failed Figma acquisition signaled the loss.",
        winner: "A",
      },
      {
        name: "Real-time collaboration",
        a: "Native multiplayer; viewers, commenters, editors all in the same file.",
        b: "Coediting available but with friction; never reached Figma parity.",
        winner: "A",
      },
      {
        name: "Cross-platform support",
        a: "Browser-native; works on Mac, Windows, Linux, ChromeOS, iPad.",
        b: "Native desktop app on Mac and Windows; no Linux support.",
        winner: "A",
      },
      {
        name: "Pricing",
        a: "Free Starter; ~$15/editor/mo Professional; ~$45/editor/mo Organization (verified 2026-05-17). Viewers free.",
        b: "Bundled in Adobe Creative Cloud subscriptions; standalone XD plans largely discontinued.",
        winner: "A",
      },
      {
        name: "Plugin ecosystem",
        a: "Large and growing; Figma plugins are first-class.",
        b: "Smaller and shrinking; community development has migrated to Figma.",
        winner: "A",
      },
      {
        name: "Developer handoff",
        a: "Dev Mode is native; inspect, copy code, export assets without context-switching.",
        b: "Inspector available; less mature than Figma's Dev Mode.",
        winner: "A",
      },
      {
        name: "Adobe ecosystem integration",
        a: "Limited; Figma is independent of Adobe.",
        b: "Tight; integrates with Photoshop, Illustrator, and Creative Cloud assets.",
        winner: "B",
      },
      {
        name: "Long-term viability",
        a: "Strong; the category default with significant strategic investment.",
        b: "Uncertain; Adobe's strategic priority is unclear post-failed-acquisition.",
        winner: "A",
      },
    ],
    honestTake:
      "Adobe XD vs Figma is not really a competitive comparison in 2026. The category fight ended around 2020-2021, and Adobe's failed acquisition attempt in 2022-2023 publicly confirmed the loss. XD remains in Adobe's product portfolio and existing customers continue to use it, but it is no longer the strategic priority and feature velocity has slowed. For any new team picking a design tool, Figma is the strict upgrade. XD survives in Adobe-committed shops where Creative Cloud integration outweighs the design-tool gap, but this is an increasingly narrow use case.",
    forIndieFounders: {
      pick: "A",
      reasoning:
        "Figma for any indie founder. There is no strategic case for adopting Adobe XD as a new tool in 2026. The category has moved, and the ecosystem advantages (templates, plugins, designer mindshare, developer handoff) all sit with Figma.",
    },
    faqs: [
      {
        q: "Why did Adobe XD lose to Figma?",
        a: "Figma made the browser the design canvas and real-time collaboration native; XD remained a native desktop app with retrofitted collaboration. The structural difference compounded into network effects as designers, developers, and PMs all started living in Figma files together. XD never closed the gap.",
      },
      {
        q: "Is Adobe XD being discontinued?",
        a: "Not officially as of 2026, but standalone subscriptions have been largely withdrawn and active development has slowed. The product is in a maintenance posture rather than active competition. Long-term viability is uncertain.",
      },
      {
        q: "Should I migrate from XD to Figma?",
        a: "For most teams, yes. Migration tools and converters exist for the mechanical part; the harder part is the team habit shift. The longer a team waits, the more accumulated XD assets need conversion, so the cost of migration grows over time.",
      },
      {
        q: "What about Sketch instead?",
        a: "Sketch is in a similar 'lost the category' position but with a more defensible niche among Mac-only solo designers. For most teams, the same Figma recommendation applies.",
      },
      {
        q: "What is the Brunson lens on Figma vs Adobe XD?",
        a: "Figma is a canonical New Opportunity move (browser-native multiplayer) that escaped the existing category vehicle (native desktop app). Adobe XD was the category incumbent who could not pivot without abandoning its native-app DNA. The Brunson lesson: when a new vehicle is structurally better on a dimension the buyer cares about, the incumbent loses regardless of brand strength.",
      },
    ],
    tags: ["design", "category-winner", "legacy-software", "ecosystem"],
    lastVerified: "2026-05-17",
  },

  {
    slug: "vercel-vs-cloudflare-pages",
    a: { name: "Vercel", teardownSlug: "vercel", url: "https://vercel.com/" },
    b: { name: "Cloudflare Pages", url: "https://pages.cloudflare.com/" },
    category: "Frontend cloud and hosting",
    oneLine:
      "Vercel and Cloudflare Pages are both modern frontend hosts. Vercel owns the developer experience tier; Cloudflare owns the global edge.",
    tldr:
      "Vercel and Cloudflare Pages compete in modern frontend hosting from different angles. Vercel goes deep on developer experience, Next.js integration, and the platform-services stack (AI Gateway, Marketplace, Functions). Cloudflare Pages anchors to Cloudflare's global edge network and bundles its own services (Workers, R2, KV, D1). For Next.js teams and DX-first buyers, Vercel. For teams already inside Cloudflare's ecosystem or optimizing for cost at global scale, Cloudflare Pages.",
    bestFor: {
      a: "Next.js teams, DX-first SaaS, and teams that value the polished hosting-plus-platform-services bundle.",
      b: "Teams already using Cloudflare Workers, R2, KV, or D1; cost-sensitive teams at global scale; teams that prefer Cloudflare's edge-first architecture.",
    },
    pickAIf: [
      "You ship Next.js. Vercel's depth here remains unmatched.",
      "You want the latest React-ecosystem features supported on day one.",
      "You value the Vercel AI SDK, AI Gateway, and platform marketplace.",
    ],
    pickBIf: [
      "You are already using Cloudflare Workers, R2, KV, or D1 and want hosting in the same dashboard.",
      "You optimize for global edge performance and cost at scale.",
      "You prefer Cloudflare's pricing structure (no per-user fees, unlimited bandwidth on most plans).",
    ],
    dimensions: [
      {
        name: "Next.js support",
        a: "Canonical; Vercel maintains Next.js and ships new features there first.",
        b: "Strong support via the @cloudflare/next-on-pages adapter; some Next features lag.",
        winner: "A",
      },
      {
        name: "Free tier",
        a: "Hobby (commercial use forbidden); generous compute, bandwidth, build minutes.",
        b: "Generous free tier with commercial use permitted; 500 builds/month, unlimited bandwidth.",
        winner: "B",
      },
      {
        name: "Pricing at scale",
        a: "~$20/user/mo Pro plus metered usage overages.",
        b: "Free for most static use cases; Workers paid plans start at ~$5/mo with usage-based pricing.",
        winner: "B",
        note: "Cloudflare's pricing structure is meaningfully different — bandwidth-unlimited on most tiers, no per-user fees on Pages itself.",
      },
      {
        name: "Edge compute",
        a: "Vercel Functions (Fluid Compute and Edge); strong but slightly different model.",
        b: "Cloudflare Workers; the canonical edge compute platform with deeper history at scale.",
        winner: "B",
      },
      {
        name: "Bundled platform services",
        a: "Marketplace integrations for databases (Neon, Upstash), AI Gateway, Blob, Edge Config.",
        b: "Native R2 (object storage), KV (key-value), D1 (SQLite), Durable Objects, Queues — all under Cloudflare's pricing.",
        winner: "different",
        note: "Vercel partners; Cloudflare builds in-house. Both approaches work; the buyer's preference varies.",
      },
      {
        name: "Developer experience",
        a: "Polished, opinionated, fast. Strong Git integration, preview deploys.",
        b: "Improving rapidly; less polished than Vercel but the gap is shrinking.",
        winner: "A",
      },
      {
        name: "Global edge network",
        a: "Strong; runs on Vercel's edge plus partner infrastructure.",
        b: "Industry-leading; Cloudflare's edge network is one of the largest globally.",
        winner: "B",
      },
      {
        name: "AI tooling",
        a: "AI SDK, AI Gateway with provider failover, tight React integration.",
        b: "Cloudflare Workers AI; smaller but growing AI surface.",
        winner: "A",
      },
    ],
    honestTake:
      "Vercel and Cloudflare Pages are competitive on different axes. Vercel wins on developer experience, Next.js integration, and the polished platform-services experience. Cloudflare Pages wins on cost (especially at scale), global edge performance, and bundled in-house services. For most Next.js teams, the DX advantage of Vercel outweighs the cost advantage of Cloudflare Pages; for non-Next teams or cost-sensitive operators, the calculation flips. The two platforms have been converging in capability; the buyer choice is increasingly about which ecosystem you want to live inside.",
    forIndieFounders: {
      pick: "depends",
      reasoning:
        "If you ship Next.js and value DX, Vercel. If you are cost-sensitive (especially pre-revenue), already using Cloudflare for DNS or Workers, or building on non-React frameworks, Cloudflare Pages. The commercial-use-permitted free tier on Cloudflare is a real differentiator for indie founders.",
    },
    faqs: [
      {
        q: "Can I use Cloudflare Pages for a commercial Next.js app for free?",
        a: "Yes — Cloudflare Pages permits commercial use on the free tier. This is a meaningful advantage over Vercel's Hobby tier, which forbids commercial use.",
      },
      {
        q: "Will Next.js features lag on Cloudflare Pages?",
        a: "Sometimes. Cloudflare maintains the @cloudflare/next-on-pages adapter, but new Next.js features (Cache Components, partial prerendering, latest middleware patterns) ship to Vercel first and to Cloudflare Pages on a delay measured in weeks to months.",
      },
      {
        q: "What about Cloudflare Workers vs Vercel Functions?",
        a: "Workers is the older, more mature edge compute platform; it runs at the Cloudflare edge with V8 isolates. Vercel Functions uses a different runtime model (Fluid Compute) optimized for Next.js integration. Both work well; the choice depends on whether you value Workers' raw performance and breadth or Vercel's tighter framework integration.",
      },
      {
        q: "Is Vercel really worth the extra cost?",
        a: "For Next.js teams shipping a SaaS, usually yes — the DX advantage, AI tooling, and platform integration save engineering time worth more than the price gap. For solo founders pre-revenue, the Cloudflare Pages free-commercial tier is hard to beat.",
      },
      {
        q: "What is the Brunson lens on Vercel vs Cloudflare Pages?",
        a: "Vercel ran the Dream 100 move into the React/Next community and built DX-first hosting on top. Cloudflare ran a different Dream 100 move into the global infrastructure and Workers community and built hosting as one product in a broader edge platform. Both are winning their respective Dream 100; they overlap on hosting but the underlying strategies are different.",
      },
    ],
    tags: ["hosting", "developer-tools", "edge-compute", "nextjs"],
    lastVerified: "2026-05-17",
  },

  {
    slug: "beehiiv-vs-kit",
    a: { name: "Beehiiv", teardownSlug: "beehiiv", url: "https://www.beehiiv.com/" },
    b: { name: "Kit (formerly ConvertKit)", url: "https://kit.com/" },
    category: "Newsletter and creator email",
    oneLine:
      "Beehiiv is a publication-as-business platform. Kit is an email marketing platform for creators. Different shapes of the same business.",
    tldr:
      "Beehiiv and Kit (formerly ConvertKit) both serve creators monetizing an audience but with different product shapes. Beehiiv is a publication platform — write newsletters, monetize via ads, paid subscriptions, and the Boost network. Kit is an email marketing platform — write broadcasts and sequences, automate funnels, monetize via Kit Commerce or external products. For pure newsletter-as-business, Beehiiv. For broader creator email marketing with automations, Kit.",
    bestFor: {
      a: "Newsletter creators treating the publication as a business with ads, paid subs, referrals, and cross-promotion.",
      b: "Creators who run product launches, paid courses, or ecommerce alongside email, and need deep automation and sequence tooling.",
    },
    pickAIf: [
      "Your primary monetization is paid subscriptions, ads, or cross-promotion through the Boost network.",
      "You think of yourself as a publisher first and an automation operator second.",
      "You want a newsletter-first feature set rather than a generic email marketing tool.",
    ],
    pickBIf: [
      "You run product launches, sell digital products, or operate paid courses alongside email.",
      "You need sophisticated automation, segmentation, and visual sequence builders.",
      "You want broader integrations (Teachable, Gumroad, Stripe, payment gateways) baked in.",
    ],
    dimensions: [
      {
        name: "Product shape",
        a: "Newsletter publishing platform with monetization stack baked in.",
        b: "Email marketing platform with broader creator commerce features.",
        winner: "different",
      },
      {
        name: "Pricing",
        a: "Free tier up to 2,500 subscribers; Scale ~$39-99/mo, Max ~$99-499/mo (verified 2026-05-17).",
        b: "Free tier up to 10,000 subscribers (no automations); Creator ~$25/mo, Creator Pro ~$50/mo and up (verified 2026-05-17).",
        winner: "B",
        note: "Kit's free tier subscriber limit is higher; Beehiiv's free tier includes more publishing features.",
      },
      {
        name: "Ad network",
        a: "Built-in; Beehiiv ads network pays creators.",
        b: "No native ad network; creators sell sponsorships themselves.",
        winner: "A",
      },
      {
        name: "Paid subscriptions",
        a: "Built-in; Beehiiv handles paid subscription mechanics.",
        b: "Available via Kit Commerce; less mature than dedicated newsletter platforms.",
        winner: "A",
      },
      {
        name: "Automations and sequences",
        a: "Available but newsletter-flavored; less powerful than Kit.",
        b: "Sophisticated; visual automation builder, conditional sequences, tag-based segmentation.",
        winner: "B",
      },
      {
        name: "Commerce integrations",
        a: "Limited; primary monetization is ads and paid subs.",
        b: "Deep; Teachable, Gumroad, ConvertKit Commerce, Stripe, Shopify all integrated.",
        winner: "B",
      },
      {
        name: "Cross-promotion network",
        a: "Boost network; creators pay each other for referrals, Beehiiv brokers.",
        b: "Recommendations available; less mature than Beehiiv's Boost.",
        winner: "A",
      },
      {
        name: "Best for pure newsletter creators",
        a: "Yes — designed for this exact buyer.",
        b: "Workable but not the focus; some friction.",
        winner: "A",
      },
    ],
    honestTake:
      "Beehiiv and Kit serve overlapping creator audiences with different product centers. Beehiiv puts the newsletter at the center and bolts monetization stack around it. Kit puts email marketing at the center and treats newsletters as one use case among broadcasts, courses, and product launches. The right pick depends on what dominant business model you are building. Newsletter-first creators choose Beehiiv. Course creators, product sellers, and creators with a multi-channel business choose Kit. The mistake is picking based on familiarity (everyone has heard of ConvertKit/Kit) without checking which shape your business actually has.",
    forIndieFounders: {
      pick: "depends",
      reasoning:
        "If you are an indie SaaS founder using a newsletter as a top-of-funnel for a product, Kit is often the better tool because automation depth matters more than newsletter-monetization features. If you are an indie founder where the newsletter IS the product or a major revenue stream, Beehiiv. Match the tool to the dominant use case.",
    },
    faqs: [
      {
        q: "Why was ConvertKit renamed to Kit?",
        a: "The rebrand happened in 2024 to broaden the brand beyond newsletter writers toward all creators (courses, products, services). The underlying product is the same; the positioning is more inclusive of non-newsletter creators.",
      },
      {
        q: "Can I monetize a newsletter on Kit?",
        a: "Yes, via Kit Commerce (paid subscriptions, digital products) or by integrating Stripe directly. The monetization tooling is less newsletter-specific than Beehiiv's but works for serious creators.",
      },
      {
        q: "Does Beehiiv have automations?",
        a: "Yes, but they are newsletter-flavored — welcome sequences, subscriber re-engagement, basic conditional logic. For sophisticated funnel automation (course onboarding, abandoned cart recovery, multi-product cross-sells), Kit's automation depth is materially better.",
      },
      {
        q: "What about Substack instead?",
        a: "Substack is the network-first publication platform. Compared to both Beehiiv and Kit, Substack trades creator monetization control for cross-discovery network effects. The Substack vs Beehiiv comparison is the more direct head-to-head for pure newsletter creators.",
      },
      {
        q: "What is the Brunson lens on Beehiiv vs Kit?",
        a: "Both companies execute Dream Customer naming precisely — Beehiiv names the newsletter-as-business operator, Kit names the multi-channel creator. The Brunson move 'name your buyer specifically' is done cleanly by both, in different directions.",
      },
    ],
    tags: ["newsletter", "creator-tools", "email-marketing", "monetization"],
    lastVerified: "2026-05-17",
  },

  {
    slug: "resend-vs-postmark",
    a: { name: "Resend", teardownSlug: "resend", url: "https://resend.com/" },
    b: { name: "Postmark", url: "https://postmarkapp.com/" },
    category: "Email API",
    oneLine:
      "Resend and Postmark both prioritize transactional email and developer experience. Resend is the modern React-tilted upstart; Postmark is the established deliverability-first incumbent.",
    tldr:
      "Resend and Postmark both target developer-led email senders with a transactional-first product philosophy. Postmark has been the deliverability gold standard for over a decade with separate streams for transactional and broadcast. Resend is newer with a sharper modern aesthetic, React Email integration, and a more generous free tier. For React teams and DX-first buyers, Resend. For teams prioritizing maximum deliverability and a longer track record, Postmark.",
    bestFor: {
      a: "Modern SaaS teams shipping with React who value cutting-edge DX and React Email integration.",
      b: "Established teams prioritizing deliverability above all else, particularly for high-stakes transactional email.",
    },
    pickAIf: [
      "You build with React and want React Email as a first-class template authoring tool.",
      "You value modern documentation and SDK aesthetics.",
      "You want a generous free tier (3K/mo) that covers indie SaaS in production.",
    ],
    pickBIf: [
      "You prioritize deliverability maximally and want the platform with the strongest track record.",
      "You need separated transactional and broadcast streams (Postmark's structural decision).",
      "You value Postmark's mature support, documentation, and inbox-placement reputation.",
    ],
    dimensions: [
      {
        name: "Pricing",
        a: "Free tier (3K emails/mo); ~$20/mo for 50K (verified 2026-05-17); linear scaling.",
        b: "100 emails/month free; paid tiers start at $15/mo for 10K (verified 2026-05-17).",
        winner: "A",
        note: "Resend's free tier is more generous; Postmark's paid tier pricing is roughly comparable at indie scale.",
      },
      {
        name: "Deliverability",
        a: "Strong; meets indie SaaS volume well.",
        b: "Industry-leading; Postmark has built its reputation on inbox placement specifically.",
        winner: "B",
      },
      {
        name: "Transactional vs broadcast separation",
        a: "Single API for both; mixing is allowed.",
        b: "Separate streams enforced; transactional and broadcast use different servers and have different deliverability profiles.",
        winner: "B",
        note: "Postmark's separation is intentional — it protects transactional deliverability from broadcast incidents.",
      },
      {
        name: "React Email integration",
        a: "First-class; React Email is a Resend open-source project.",
        b: "Templates use Postmark's MJML-based system; no native React integration.",
        winner: "A",
      },
      {
        name: "Documentation",
        a: "Modern, polished, fast to scan.",
        b: "Mature, thorough, deeper coverage of deliverability and bounce handling.",
        winner: "tie",
        note: "Different documentation styles; both are well-regarded.",
      },
      {
        name: "Developer experience",
        a: "Sharp modern SDK; React Email is the differentiator.",
        b: "Solid mature SDK; less stylistically modern but functionally complete.",
        winner: "A",
      },
      {
        name: "Brand momentum",
        a: "Strong; growing fast in 2026.",
        b: "Stable; established but not growing as quickly.",
        winner: "A",
      },
      {
        name: "Support and reliability track record",
        a: "Good; shorter history makes long-term assessment harder.",
        b: "Excellent; 10+ year track record of reliable transactional email.",
        winner: "B",
      },
    ],
    honestTake:
      "Resend and Postmark are both strong picks at the developer-friendly end of the email API category. The decision is mostly about whether you value cutting-edge modern DX (Resend) or the strongest possible deliverability track record (Postmark). Resend has closed most of the deliverability gap that newer platforms typically have, but Postmark's 10+ year reputation gives it an edge for buyers where inbox placement is a stated priority. For most indie SaaS in 2026, the choice is roughly a coin flip; the marginal advantage of React Email integration usually tips Resend.",
    forIndieFounders: {
      pick: "A",
      reasoning:
        "Resend for indie SaaS in 2026. The free tier is more generous, React Email materially speeds template development, and brand momentum signals a platform that will keep improving. Postmark is excellent but the developer experience is calibrated for a slightly different buyer.",
    },
    faqs: [
      {
        q: "Is Postmark really better at deliverability than Resend?",
        a: "Marginally, in 2026. The gap has narrowed significantly as Resend has matured. For most indie SaaS at typical volumes, both deliver well. At very high volumes or in regulated industries where deliverability is the dominant criterion, Postmark's track record still earns it the edge.",
      },
      {
        q: "Why does Postmark separate transactional and broadcast streams?",
        a: "Because a broadcast incident (high complaint rate, spam trigger) can damage IP reputation. Separating streams means a broadcast issue does not affect your transactional emails (password resets, receipts) which are usually mission-critical. It is a deliberate architectural choice that prioritizes transactional reliability.",
      },
      {
        q: "Can I send marketing email on Resend?",
        a: "Resend supports broadcast and audience features but is primarily transactional. For dedicated marketing email at scale, Mailchimp, Klaviyo, Customer.io, Loops, or Kit may serve better. Resend works for indie-scale marketing where transactional and broadcast volume are roughly comparable.",
      },
      {
        q: "Can I migrate from Postmark to Resend?",
        a: "Yes; the migration is mechanical because both speak similar API shapes. Template re-creation is the main effort (Resend uses React Email; Postmark uses MJML). Webhooks and bounce handling need re-wiring; SPF/DKIM needs re-verification.",
      },
      {
        q: "What is the Brunson lens on Resend vs Postmark?",
        a: "Postmark ran the original 'separate transactional from broadcast' play and won the deliverability-first segment for a decade. Resend ran the New Opportunity move (modern DX plus React Email) and is winning the React-developer segment. Both are still strong because they target different Dream Customers; the surface overlap is real but each owns a defensible position.",
      },
    ],
    tags: ["email", "developer-tools", "deliverability", "transactional-email"],
    lastVerified: "2026-05-17",
  },

  {
    slug: "stripe-vs-square",
    a: { name: "Stripe", teardownSlug: "stripe", url: "https://stripe.com/" },
    b: { name: "Square", url: "https://squareup.com/" },
    category: "Payments processing",
    oneLine:
      "Stripe is for selling online. Square is for selling in person. The overlap is smaller than the brand familiarity suggests.",
    tldr:
      "Stripe and Square both process payments but specialize at opposite ends of the online-to-offline axis. Stripe is the canonical online payment infrastructure for SaaS, marketplaces, and ecommerce. Square is the canonical small-business POS for retail, restaurants, and service businesses with physical operations. Both have crossed into each other's territory (Square has online tooling, Stripe Terminal supports physical payments) but the centers of gravity are distinct.",
    bestFor: {
      a: "SaaS, online marketplaces, ecommerce, and any business where the checkout is integrated into a web or mobile product.",
      b: "Small retail businesses, restaurants, service providers, and any business taking physical-world payments.",
    },
    pickAIf: [
      "You sell online or your checkout is part of a software product.",
      "You need sophisticated subscription billing, marketplaces, or platform payments.",
      "Your buyer is technical or your team builds custom checkout flows.",
    ],
    pickBIf: [
      "You sell in person at a physical store, restaurant, market, or service location.",
      "You need integrated POS hardware (card readers, registers, kitchen displays).",
      "You want a turnkey small-business platform (invoicing, payroll, lending) bundled with payments.",
    ],
    dimensions: [
      {
        name: "Primary use case",
        a: "Online payments; SaaS, ecommerce, marketplaces.",
        b: "Physical-world payments; retail, restaurants, services.",
        winner: "different",
      },
      {
        name: "Developer experience",
        a: "Industry-leading; deep API, mature SDKs in every language.",
        b: "Functional but less developer-focused; APIs exist but the platform is built for small business operators.",
        winner: "A",
      },
      {
        name: "Subscription billing",
        a: "Stripe Billing is the canonical product with deep dunning, retention, tax automation.",
        b: "Square Subscriptions exists but is less feature-rich than Stripe Billing.",
        winner: "A",
      },
      {
        name: "Physical hardware",
        a: "Stripe Terminal supports physical card readers; less mature than Square.",
        b: "Native hardware ecosystem (Square Reader, Terminal, Stand, KDS); the canonical small-business POS.",
        winner: "B",
      },
      {
        name: "Pricing",
        a: "2.9% + 30¢ per online transaction (US standard, verified 2026-05-17).",
        b: "2.6% + 10¢ per in-person transaction; 2.9% + 30¢ for online (verified 2026-05-17).",
        winner: "tie",
        note: "Square's in-person rate is lower; online rates are roughly comparable.",
      },
      {
        name: "Small-business bundled services",
        a: "Limited; Stripe focuses on payments infrastructure.",
        b: "Mature; Square offers payroll, lending, marketing, invoicing, gift cards as integrated products.",
        winner: "B",
      },
      {
        name: "Marketplaces and platforms",
        a: "Stripe Connect is the canonical product for marketplaces.",
        b: "Possible but less developer-friendly; Square is not designed primarily for platform businesses.",
        winner: "A",
      },
      {
        name: "International availability",
        a: "Broad; available in most major countries.",
        b: "Narrower; primarily US, Canada, UK, Australia, Japan, Ireland, France, Spain.",
        winner: "A",
      },
    ],
    honestTake:
      "Stripe and Square are not really competitive in 2026 the way the brand-familiarity comparison suggests. Stripe owns online; Square owns small-business physical. Both have crossed into each other's territory — Square's online tooling has matured, Stripe Terminal supports physical card readers — but the structural strengths remain on their respective sides. The right pick is almost entirely determined by whether your business is primarily online or primarily physical. Mixed businesses sometimes use both (Stripe for online checkout, Square for in-person POS).",
    forIndieFounders: {
      pick: "A",
      reasoning:
        "For indie SaaS, Stripe by default — the entire business is online, so Square's strengths do not apply. The only exception is an indie founder running a hybrid business (e.g., a coffee shop or services business with an online component); even then, the SaaS side of the business should use Stripe.",
    },
    faqs: [
      {
        q: "Should a SaaS ever use Square instead of Stripe?",
        a: "Rarely. Stripe's subscription billing, marketplace tooling, and developer APIs are designed for software products; Square's are not. The only reason a SaaS might use Square is if the team already runs a physical business on Square and wants one vendor.",
      },
      {
        q: "Can a retail store use Stripe instead of Square?",
        a: "Possible via Stripe Terminal, but Square's POS ecosystem (hardware, software, payroll, invoicing) is more battery-included for small businesses. Most retail operators choose Square for the bundled experience even if Stripe's rates are slightly better.",
      },
      {
        q: "Why does Square offer payroll and lending?",
        a: "Because small businesses want a single platform for operations. Square's strategy is to be the small-business platform with payments as one product; Stripe's strategy is to be the payment infrastructure with everything else handled by partners or the customer.",
      },
      {
        q: "What about Toast or Lightspeed for restaurants?",
        a: "Toast and Lightspeed are restaurant-vertical-specific POS systems that compete with Square's restaurant offering. For pure restaurant operations, vertical specialists often beat horizontal platforms like Square. The Stripe-vs-Square decision rarely involves restaurants directly.",
      },
      {
        q: "What is the Brunson lens on Stripe vs Square?",
        a: "Both companies executed precise Dream Customer naming — Stripe named the developer; Square named the small-business operator. The Brunson move 'win one Dream Customer deeply before broadening' applies to both: each owns their segment cleanly, and the broadening moves into the other's territory have been measured rather than rushed.",
      },
    ],
    tags: ["payments", "online-vs-offline", "developer-tools", "small-business"],
    lastVerified: "2026-05-17",
  },

  {
    slug: "screen-studio-vs-loom",
    a: {
      name: "Screen Studio",
      teardownSlug: "screen-studio",
      url: "https://www.screen.studio/",
    },
    b: { name: "Loom", url: "https://www.loom.com/" },
    category: "Screen recording",
    oneLine:
      "Loom optimizes for fast async communication. Screen Studio optimizes for polished marketing video. They share the file type but solve different jobs.",
    tldr:
      "Loom and Screen Studio both record screens but for different jobs. Loom is built for fast async team communication — record, share a link, move on. Screen Studio is built for polished marketing videos — auto-zoom, smooth cursor, cinematic export. Loom wins for daily team async. Screen Studio wins for product demos, marketing pages, and any video where the output reflects on the brand.",
    bestFor: {
      a: "Indie founders, designers, and marketers producing product demos, tutorial videos, and marketing content.",
      b: "Teams using async screen recording for fast communication, code review, customer support, and internal updates.",
    },
    pickAIf: [
      "The video will appear on a marketing page, app store listing, or social media where polish matters.",
      "You want auto-zoom and smooth cursor animation without manual editing.",
      "You value one-time pricing over a subscription.",
    ],
    pickBIf: [
      "You record async videos multiple times per day for team or customer communication.",
      "You want instant share links, reactions, and viewer analytics.",
      "Speed matters more than cinematic polish for your typical use case.",
    ],
    dimensions: [
      {
        name: "Primary use case",
        a: "Polished marketing video; product demos, app store videos, tutorials.",
        b: "Fast async communication; team updates, customer support, code review.",
        winner: "different",
      },
      {
        name: "Output polish",
        a: "Distinctive aesthetic: auto-zoom, smooth cursor, configurable backgrounds.",
        b: "Utilitarian; fast and functional but not cinematic.",
        winner: "A",
      },
      {
        name: "Speed of recording-to-share",
        a: "Recording then editing then export; minutes per video.",
        b: "Record then auto-upload then share link; near-instant.",
        winner: "B",
      },
      {
        name: "Pricing",
        a: "One-time license, ~$229 (verified 2026-05-17), with optional yearly updates.",
        b: "Free tier (25 videos/person); Business ~$12.50/user/mo, Enterprise custom (verified 2026-05-17).",
        winner: "different",
        note: "Different models entirely; one-time vs subscription.",
      },
      {
        name: "Collaboration features",
        a: "Limited; built for the solo creator producing finished output.",
        b: "Rich; comments, reactions, view tracking, time-stamped replies.",
        winner: "B",
      },
      {
        name: "Editing capabilities",
        a: "Native non-linear editor with cuts, zoom, music, overlays.",
        b: "Basic editing; trim, drawing, captions; no cinematic effects.",
        winner: "A",
      },
      {
        name: "Mobile recording",
        a: "macOS desktop app only.",
        b: "Web, desktop, and mobile apps.",
        winner: "B",
      },
      {
        name: "Brand fit for indie founders",
        a: "Strong — designed for the indie operator producing polished marketing assets.",
        b: "Strong — designed for the async-communication team operator.",
        winner: "different",
      },
    ],
    honestTake:
      "Loom and Screen Studio do not really compete on the same job. Loom optimizes for the speed of going from 'I need to explain this' to 'here is a link'. Screen Studio optimizes for the polish of the final exported video. They share the format (screen recording) but the workflows and outputs diverge sharply. Most serious indie founders end up using both — Loom for daily async communication, Screen Studio for marketing-page videos and product demos that need to look intentional. Picking one to do both jobs always feels like a compromise.",
    forIndieFounders: {
      pick: "depends",
      reasoning:
        "Use both. Loom for daily async communication with team, customers, and contractors; Screen Studio for your marketing page video, product demos, and anything that will be seen by your public audience. The one-time Screen Studio license pays for itself on the first marketing video that would otherwise have needed a freelance editor.",
    },
    faqs: [
      {
        q: "Can Loom replace Screen Studio for marketing videos?",
        a: "Not really. Loom's output is intentionally utilitarian for async sharing; using it for a marketing video gives a recognizably 'Loom' aesthetic that reads as effort-light. For marketing pages, app store videos, and demos shared publicly, Screen Studio's polish is the structural difference.",
      },
      {
        q: "Can Screen Studio replace Loom for async team communication?",
        a: "Workably but not naturally. Screen Studio requires editing time before share; Loom is instant. For high-frequency async communication, the friction adds up. Use Loom for that workflow.",
      },
      {
        q: "Is the one-time Screen Studio license worth it?",
        a: "For most indie founders, yes. The break-even versus subscription competitors is fast (under a year), and the polish-to-effort ratio on marketing videos is the single biggest practical advantage. The license also includes ownership rather than dependence on a SaaS subscription.",
      },
      {
        q: "What about CleanShot X, Demoflow, or Tella for marketing video?",
        a: "All valid alternatives. CleanShot X is more screenshot-and-quick-capture focused; Demoflow and Tella are SaaS alternatives to Screen Studio with subscription pricing. The Screen Studio vs Loom comparison is the most common one because the brand familiarity is similar; the alternatives serve specific niches.",
      },
      {
        q: "What is the Brunson lens on Screen Studio vs Loom?",
        a: "Loom executed Dream Customer naming for the async-team-communication operator and won that segment decisively. Screen Studio executed precise Dream Customer naming for the indie operator producing polished marketing videos and won the parallel segment. Both are clear examples of 'win a Dream Customer deeply rather than trying to serve everyone.'",
      },
    ],
    tags: ["video", "screen-recording", "marketing-tools", "async-communication"],
    lastVerified: "2026-05-17",
  },

  {
    slug: "mintlify-vs-gitbook",
    a: { name: "Mintlify", teardownSlug: "mintlify", url: "https://mintlify.com/" },
    b: { name: "GitBook", url: "https://www.gitbook.com/" },
    category: "Developer documentation",
    oneLine:
      "Mintlify is a modern docs platform optimized for API and developer-tool companies. GitBook is a broader documentation and knowledge platform.",
    tldr:
      "Mintlify and GitBook both publish documentation but with different product philosophies. Mintlify is docs-as-code optimized for API companies and developer tools, with a polished aesthetic now common across modern dev-tool docs. GitBook is a broader knowledge platform supporting docs, internal wikis, and team knowledge bases with a richer editor and broader use cases. For developer-tool companies, Mintlify. For broader documentation and internal knowledge, GitBook.",
    bestFor: {
      a: "API companies, developer tools, and SDK publishers who want polished docs that match the modern dev-tool aesthetic.",
      b: "Teams publishing broader documentation, internal wikis, knowledge bases, and team-collaboration content.",
    },
    pickAIf: [
      "You publish API docs or developer-facing technical content.",
      "You value the modern docs aesthetic shared by Anthropic, Stripe, Resend, Cal.com.",
      "You want docs-as-code with Markdown/MDX and Git-based workflows.",
    ],
    pickBIf: [
      "You publish broader documentation including internal wikis and team knowledge.",
      "You value a richer WYSIWYG editor for non-technical contributors.",
      "Your audience is mixed (developers plus product, support, sales).",
    ],
    dimensions: [
      {
        name: "Target audience",
        a: "API companies and developer tools.",
        b: "Broader: documentation, wikis, knowledge bases.",
        winner: "different",
      },
      {
        name: "Authoring model",
        a: "Docs-as-code; MDX, Git-based workflow, deploys on push.",
        b: "Mostly WYSIWYG with Git-sync option; designed for mixed-skill contributors.",
        winner: "different",
      },
      {
        name: "Output aesthetic",
        a: "Distinctive modern docs aesthetic; recognizable from Anthropic, Cursor, Resend, others.",
        b: "Clean but more conventional documentation aesthetic.",
        winner: "A",
        note: "Mintlify's aesthetic is genre-defining for modern dev-tool docs; GitBook's is more neutral.",
      },
      {
        name: "Pricing",
        a: "Free for open-source projects; paid tiers per editor seat (verified 2026-05-17).",
        b: "Free tier; paid tiers per user with team and enterprise pricing (verified 2026-05-17).",
        winner: "tie",
      },
      {
        name: "API reference generation",
        a: "Strong; OpenAPI imports, generated API references, code samples.",
        b: "Supported but less specialized for API docs.",
        winner: "A",
      },
      {
        name: "AI search",
        a: "Built-in; LLM-powered docs search and assistant.",
        b: "Available; quality varies by tier.",
        winner: "tie",
      },
      {
        name: "Internal wiki use case",
        a: "Possible but not the focus; designed for public-facing docs.",
        b: "Mature; GitBook is a standard for internal wikis and team knowledge.",
        winner: "B",
      },
      {
        name: "Customer roster recognition",
        a: "Visible roster of high-profile dev-tool customers (Anthropic, Cursor, Resend, others) recognizable to the buyer.",
        b: "Mature customer base but less concentrated in the dev-tool category.",
        winner: "A",
      },
    ],
    honestTake:
      "Mintlify and GitBook serve overlapping documentation use cases but with different centers of gravity. Mintlify owns the modern dev-tool docs aesthetic — every visible Mintlify-built docs site reinforces the platform's positioning for the next API company evaluating tooling. GitBook serves a broader documentation universe with more flexibility around contributors and use cases. For pure API documentation, Mintlify's specialization is real and the customer roster reinforces it. For mixed documentation surfaces (public docs plus internal wikis plus knowledge bases), GitBook's breadth is the right fit.",
    forIndieFounders: {
      pick: "depends",
      reasoning:
        "If you are a dev-tool indie SaaS, Mintlify — the aesthetic match alone is worth the choice, and the visible-customer flywheel works in your favor. If you are publishing broader documentation or want a single platform for public docs and internal knowledge, GitBook. For non-developer-targeted SaaS, the choice matters less; either works.",
    },
    faqs: [
      {
        q: "Is the Mintlify aesthetic really a differentiator?",
        a: "Yes, for dev-tool companies. The aesthetic shared by Anthropic, Resend, Cursor, and others is now what 'modern API docs' look like, and matching that pattern signals category membership to evaluating developers. The aesthetic is the marketing as much as the product.",
      },
      {
        q: "Can GitBook do API docs?",
        a: "Yes, but with less specialization than Mintlify. GitBook supports API references and OpenAPI imports but the rendering and customization are less specialized for the API-docs use case.",
      },
      {
        q: "What about Docusaurus or Nextra instead?",
        a: "Docusaurus (Facebook open-source) and Nextra (Vercel ecosystem) are open-source alternatives that you host yourself. Both are powerful but require engineering effort to deploy and maintain. Mintlify and GitBook are managed SaaS that handle hosting; the choice between SaaS and self-hosted is the first decision.",
      },
      {
        q: "Should an indie founder use GitBook for internal docs?",
        a: "GitBook works well for internal wikis and team knowledge bases. Notion is the more common indie choice for that role; GitBook is the next step up if Notion starts feeling underweight or if you want a clear separation between team knowledge and external docs.",
      },
      {
        q: "What is the Brunson lens on Mintlify vs GitBook?",
        a: "Mintlify executed Dream Customer naming precisely (API companies) and bet on the visible-customer flywheel — every Mintlify docs site advertises the platform to the next buyer. GitBook executed broader positioning that captures more use cases but loses the aesthetic specificity that wins dev-tool buyers. Both work; they target different Dream Customers.",
      },
    ],
    tags: ["documentation", "developer-tools", "knowledge-base", "api-docs"],
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
