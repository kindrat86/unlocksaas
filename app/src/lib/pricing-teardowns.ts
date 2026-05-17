/**
 * Pricing teardowns catalog — third pSEO block after alternatives.ts and
 * funnel-teardowns.ts.
 *
 * Intent class targeted:
 *   "[product] pricing teardown" / "how does [product] price" /
 *   "[category] pricing strategy" / "why is [product] priced like that" /
 *   long-tail: "should I price per seat or per usage [category]"
 *
 * Why this surface earns its own pattern (instead of being a section
 * inside funnel-teardowns):
 *   Pricing-page intent is its own search behavior. Founders studying
 *   the funnel and founders studying the pricing model are doing
 *   different jobs at different moments. A dedicated surface ranks for
 *   the pricing-specific long-tail and cross-links to the funnel
 *   teardown when the same company appears on both.
 *
 * Brunson Hard-Rule reconciliation:
 *   - Pattern-level analysis only. No quoted competitor copy.
 *   - Approximate price points, not exact figures. The pricing pages
 *     change; lastVerified is when the structure was last confirmed.
 *   - No slag. Each teardown respects the pricing decision and pulls
 *     the strategic lesson the indie founder can use.
 *
 * Scaling path: append entries. generateStaticParams + sitemap.ts auto-
 * extend. At ~100 entries, split by category into separate modules.
 */

export interface PricingTier {
  /** Tier name as displayed on the public pricing page. */
  name: string;
  /** Approximate price point with units, e.g. "$0", "~$20/seat/mo", "2.9% + 30¢/transaction". */
  pricePoint: string;
  /** 1-to-2 sentence summary of what is included at this tier. */
  includes: string;
  /** Who the tier is for, in plain language. */
  audience: string;
}

export interface PricingFaq {
  q: string;
  a: string;
}

/**
 * Brunson pricing-lens — the same four levers the Machine applies when
 * critiquing the reader's own pricing page. Vocabulary stays consistent
 * across every teardown so the surface reads as one teaching system.
 */
export interface PricingBrunsonLens {
  /** How the tier structure stacks value (Brunson "Stack" slide). */
  stack: string;
  /** How the tiers ladder up the Value Ladder. */
  valueLadder: string;
  /** Pricing psychology: anchor tier, decoy tier, or symmetry. */
  decoyOrAnchor: string;
  /** Payment mechanics: subscription vs usage vs one-time, frequency. */
  paymentMechanics: string;
}

export interface PricingTeardown {
  /** URL slug. Kebab-case. */
  slug: string;
  /** Proper-noun display name. */
  displayName: string;
  /** Person or company that operates it, where known. */
  creator?: string;
  /** Category bucket. Drives hub grouping. */
  category: string;
  /** Single-line summary of the teardown's thesis. */
  oneLine: string;
  /**
   * 40-to-60 word TL;DR for AEO citation. Must stand alone, be
   * factually conservative, and end with a specific takeaway.
   */
  tldr: string;

  /** Product context. */
  productSnapshot: {
    whatTheySell: string;
    whoFor: string;
  };

  /** The actual pricing structure as publicly observable. */
  pricingStructure: {
    /** Plain-language pricing model name. */
    model: string;
    /** Tier list in publication order. */
    tiers: ReadonlyArray<PricingTier>;
    /** "Monthly", "Monthly + annual discount", "Usage-based monthly", etc. */
    paymentFrequency: string;
    /** What the free or trial behavior is, in plain language. */
    freeTrialBehavior: string;
  };

  /** Anchor analysis — which tier is the anchor, and why. */
  anchorAnalysis: {
    pattern: string;
    analysis: string;
  };

  /** Upgrade trigger — what specifically drives a free user to upgrade. */
  upgradeTrigger: {
    pattern: string;
    analysis: string;
  };

  /** 5-to-7 strategic pricing moves that read as deliberate. */
  whatsWorking: string[];

  /** 3-to-5 lessons a pre-revenue indie SaaS founder can adapt. */
  whatToAdapt: string[];

  /** 2-to-4 pricing decisions a pre-revenue founder should NOT copy. */
  whatToAvoid: string[];

  /** Brunson lens — required. */
  brunsonLens: PricingBrunsonLens;

  /** 4-to-6 FAQs targeted at queries a pricing-researcher actually types. */
  faqs: ReadonlyArray<PricingFaq>;

  /** Tags for hub grouping and related linking. */
  tags: ReadonlyArray<string>;

  /** Target's canonical homepage. */
  homepageUrl?: string;
  /** Target's pricing page URL, when known. */
  pricingPageUrl?: string;

  /** ISO date of last manual sanity check. */
  lastVerified: string;
}

// -- Catalog ------------------------------------------------------------------

const PRICING_TEARDOWNS_LIST: PricingTeardown[] = [
  {
    slug: "tally",
    displayName: "Tally",
    creator: "Marie Martens and Filip Minev",
    category: "Forms and surveys",
    oneLine:
      "Tally prices on a structural promise (free forever, unlimited) and lets the brand-removal pain handle the upgrade.",
    tldr:
      "Tally's pricing page is a single structural promise (free forever, unlimited forms, unlimited submissions) plus a paid tier that removes the Tally brand and unlocks logic. The free tier is not a trial; it IS the offer. The lesson for indie founders: when the incumbent monetizes per-submission, leading with unlimited becomes the entire pricing strategy.",
    productSnapshot: {
      whatTheySell:
        "A forms and surveys product that competes against Typeform on price model.",
      whoFor:
        "Creators, indie founders, small teams who refuse per-submission paywalls.",
    },
    pricingStructure: {
      model: "Freemium with structural anchor on free tier",
      tiers: [
        {
          name: "Free",
          pricePoint: "$0",
          includes:
            "Unlimited forms, unlimited submissions, all core form types, basic logic.",
          audience:
            "Indie creators and anyone who refuses to pay per response.",
        },
        {
          name: "Pro",
          pricePoint: "approximately $29/mo (verified 2026-05-17)",
          includes:
            "Brand removal, advanced logic, file uploads, custom domain, integrations.",
          audience:
            "Power users embedding forms on their marketing surface.",
        },
        {
          name: "Business",
          pricePoint: "approximately $89/mo (verified 2026-05-17)",
          includes:
            "Team workspace, multiple seats, more advanced features and integrations.",
          audience: "Small teams sharing form ownership.",
        },
      ],
      paymentFrequency: "Monthly subscription with annual discount available",
      freeTrialBehavior:
        "No trial because the free tier IS production-grade for most use cases.",
    },
    anchorAnalysis: {
      pattern: "Free as anchor",
      analysis:
        "The free tier is the page's center of gravity. Pro and Business exist for buyers who self-select into the upgrade. The anchor strategy is inverted from typical SaaS: instead of pricing the highest tier first to make the middle tier look reasonable, Tally prices the floor first and lets the paid tiers feel optional rather than necessary.",
    },
    upgradeTrigger: {
      pattern: "Brand removal at marketing-surface deployment",
      analysis:
        "The free tier includes a small Tally attribution. The upgrade trigger fires when the founder is ready to publish a form on their public marketing site without third-party branding. This is a behaviorally-aligned trigger: willingness-to-pay spikes precisely when the founder wants to look professional, not before.",
    },
    whatsWorking: [
      "Free-forever-unlimited compresses the entire pricing strategy into one promise readers retain after closing the tab.",
      "Brand removal as upgrade trigger aligns the charge to the moment the buyer's willingness-to-pay structurally rises.",
      "Tier names (Free, Pro, Business) are category-conventional, which removes friction in evaluation.",
      "Annual discount captures the small percentage of buyers ready to commit yearly without forcing the choice on monthly buyers.",
      "Pricing page lists what each tier includes positively, not what is missing — avoids the loss-aversion trap.",
    ],
    whatToAdapt: [
      "Pick one structural pricing promise the incumbent cannot match without breaking their model. Then lead with it.",
      "Place the upgrade trigger at the moment willingness-to-pay structurally spikes, not at an arbitrary feature count.",
      "Use category-conventional tier names. Cute names (Sapling, Sprout, Tree) add friction; Free, Pro, Business does not.",
    ],
    whatToAvoid: [
      "Do not lead with free-forever-unlimited if your marginal cost per user is meaningfully positive. The model only works when free users cost you near zero.",
      "Do not assume the brand-removal trigger works for non-public outputs. If your buyer does not publish your tool's output, the upgrade never fires.",
    ],
    brunsonLens: {
      stack: "Inverted stack — value is concentrated on the free tier, paid tiers are usage extensions.",
      valueLadder: "Two-rung ladder: free (lead) plus paid (subscription core). No high-ticket back-end.",
      decoyOrAnchor: "Free-as-anchor — the page's price gravity is the floor, not the ceiling.",
      paymentMechanics: "Monthly subscription with optional annual discount; no usage metering.",
    },
    faqs: [
      {
        q: "Why does Tally lead with free forever instead of a free trial?",
        a: "Because the marginal cost of a free user is near zero for a form product, and because the structural promise (unlimited) is the entire differentiator against Typeform. A trial would dilute the promise. The free tier itself is the marketing.",
      },
      {
        q: "Should an indie SaaS use free-forever pricing?",
        a: "Only if your unit economics support it AND your paid tier triggers a real willingness-to-pay spike. Most indie SaaS get the unit economics wrong (free users cost meaningful infrastructure or support time) or have a paid tier that nobody actually wants. Validate paid demand first, then consider freemium.",
      },
      {
        q: "What is the Brunson lens on Tally's pricing?",
        a: "Inverted Stack. The free tier is the anchor; paid tiers extend usage rather than unlock fundamentally different value. It is a two-rung Value Ladder with no high-ticket back-end, which is the safest indie-SaaS shape.",
      },
      {
        q: "Why does the upgrade trigger fire at brand removal?",
        a: "Because that is the moment the founder is putting the form on their own marketing surface, which structurally raises their willingness to pay for a clean, professional appearance. Pricing the upgrade at this exact moment captures the maximum buyer surplus with minimum friction.",
      },
      {
        q: "Does Unlock SaaS recommend Tally for an indie SaaS pricing model?",
        a: "Only for the specific category-shape Tally hit: zero-marginal-cost product, public-output usage, dominant per-unit-priced incumbent. Most indie SaaS do not match all three. Lemon Squeezy, Cal.com, and Senja are different shapes of the same idea.",
      },
    ],
    tags: ["freemium", "brand-removal-trigger", "two-rung-ladder", "category-anchor"],
    homepageUrl: "https://tally.so/",
    pricingPageUrl: "https://tally.so/pricing",
    lastVerified: "2026-05-17",
  },

  {
    slug: "lemonsqueezy",
    displayName: "Lemon Squeezy",
    creator: "JR Farr and team (acquired by Stripe in 2024)",
    category: "Payments and Merchant of Record",
    oneLine:
      "Lemon Squeezy collapses MoR plus checkout plus subscriptions into one percentage. The bundle hides the per-feature comparison.",
    tldr:
      "Lemon Squeezy prices as a single percentage-plus-fixed-fee per transaction with Merchant of Record service included. There is no per-feature pricing page to compare against Stripe. The lesson: when you bundle multiple SaaS categories at one price, the buyer evaluates on outcome (compliance handled) rather than parts.",
    productSnapshot: {
      whatTheySell:
        "Merchant of Record payments platform for digital products and SaaS.",
      whoFor:
        "Indie founders selling globally who do not want to register for VAT or sales tax in every jurisdiction.",
    },
    pricingStructure: {
      model: "Single transaction-based percentage plus fixed fee, MoR bundled",
      tiers: [
        {
          name: "Standard",
          pricePoint:
            "approximately 5% + 50¢ per successful transaction (verified 2026-05-17)",
          includes:
            "Hosted checkout, subscriptions, licensing, customer portal, global tax compliance, MoR service.",
          audience:
            "Indie founders, solo SaaS operators, digital product sellers globally.",
        },
      ],
      paymentFrequency: "Per-transaction; no monthly base fee",
      freeTrialBehavior:
        "No subscription to trial — pricing is purely transactional. Account is free to create; you pay when you collect.",
    },
    anchorAnalysis: {
      pattern: "Single-line anchor",
      analysis:
        "Pricing is one line. There is no anchor tier because there are no tiers. The page is structured so the reader cannot comparison-shop against Stripe's transaction fee in isolation — they must evaluate the bundled outcome (compliance + checkout + subscriptions) against the unbundled Stripe + Paddle Tax stack.",
    },
    upgradeTrigger: {
      pattern: "First international sale",
      analysis:
        "There is no upgrade trigger in the traditional sense. The structural upgrade trigger that drives a founder TO Lemon Squeezy is the first international sale that exposes them to VAT or sales-tax registration. Lemon Squeezy's pricing model is calibrated to be cheaper than the time-cost of handling that compliance themselves.",
    },
    whatsWorking: [
      "Single price line removes the per-feature comparison shootout against Stripe.",
      "Bundled MoR service captures buyers at the compliance pain spike, not at the payment-processor evaluation.",
      "No subscription base fee aligns the platform's revenue with the customer's revenue, which lowers commitment friction.",
      "Pricing page lists what is included extensively (15+ features at one price), inflating the perceived bundle value.",
      "No annual commitment requirement, no minimum volume, fits the indie buyer's distrust of long-term contracts.",
    ],
    whatToAdapt: [
      "If you sit in a category dominated by a price-leader incumbent, bundle compatible services at one price to escape the per-feature shootout.",
      "Align your pricing with the customer's revenue when possible. Per-transaction or per-result pricing has lower commitment friction than monthly subscription.",
      "List what is included extensively on the pricing page. A long bundle list inflates perceived value before the price is processed.",
    ],
    whatToAvoid: [
      "Do not bundle features you do not ship at production quality. The bundle promise is fragile until each part is verifiable.",
      "Do not use percentage-based pricing if your buyer's volume is unpredictable or low. The buyer's mental math fails and they overestimate their cost.",
      "Do not adopt MoR positioning without the legal and operational capacity to back it. MoR is a regulatory commitment, not a marketing one.",
    ],
    brunsonLens: {
      stack: "Bundle stack — one price, 15+ included items listed individually to inflate perceived value.",
      valueLadder: "Single transactional rung (no front-end free, no back-end high-ticket). Per-transaction recurring becomes the subscription dynamic.",
      decoyOrAnchor: "Single-line pricing eliminates anchor mechanics; the entire page is the anchor.",
      paymentMechanics: "Pure transactional. No monthly base, no annual commitment. Aligned to customer revenue.",
    },
    faqs: [
      {
        q: "Why does Lemon Squeezy not have pricing tiers?",
        a: "Because tiered pricing forces the buyer to evaluate which tier they belong in, which is friction. Single-line pricing makes the decision binary: use Lemon Squeezy or do not. For a MoR product where the value is the compliance bundle, single-line pricing is the right shape.",
      },
      {
        q: "Should an indie SaaS use percentage-based pricing?",
        a: "Only when your customer's revenue is the meaningful cost driver for your service, and only when your customer can predict their volume. Form tools, hosting, and email senders use volume-based pricing for this reason; productivity SaaS use seat-based because volume is irrelevant.",
      },
      {
        q: "What is the Brunson lens on Lemon Squeezy's pricing model?",
        a: "Bundle Stack at a single price line. The page reads as 'fifteen things included for one number' which is the textbook Brunson 'Stack' slide compressed onto a pricing page. Pricing mechanics align with customer revenue, which is the cleanest possible match.",
      },
      {
        q: "Why is the price higher than raw Stripe?",
        a: "Because the price includes MoR (legal seller of record status), which absorbs the tax compliance work. The price-vs-Stripe comparison is a category error — Lemon Squeezy and Stripe sell different things. That category-reframe is the entire pricing strategy.",
      },
    ],
    tags: ["bundle-pricing", "transactional", "single-line", "category-reframe"],
    homepageUrl: "https://www.lemonsqueezy.com/",
    pricingPageUrl: "https://www.lemonsqueezy.com/pricing",
    lastVerified: "2026-05-17",
  },

  {
    slug: "notion",
    displayName: "Notion",
    creator: "Ivan Zhao, Simon Last and team",
    category: "Productivity and workspace",
    oneLine:
      "Notion uses a generous personal-free tier as the viral acquisition channel, then ladders teams up through workspace and AI tiers.",
    tldr:
      "Notion's pricing structure is built around a personal-free tier that is good enough for indie use but creates friction at the team-collaboration boundary. The Team tier (~$10/seat/mo) is the trigger; Business and Enterprise climb from there. AI is priced as an add-on rather than a tier, which lets Notion add new revenue without disturbing the seat ladder. The lesson: personal-free can drive team-paid if the friction sits at the right boundary.",
    productSnapshot: {
      whatTheySell:
        "A workspace product combining notes, docs, wikis, databases, and project management in one canvas.",
      whoFor:
        "Individuals, small teams, and growing companies who want a flexible workspace instead of separate tools per use case.",
    },
    pricingStructure: {
      model: "Per-seat tiered subscription with personal-free entry and AI add-on",
      tiers: [
        {
          name: "Free",
          pricePoint: "$0",
          includes:
            "Unlimited blocks for individuals, limited file uploads, sharing with up to 10 guests.",
          audience: "Indie users and personal workspace builders.",
        },
        {
          name: "Plus",
          pricePoint: "approximately $10/seat/mo billed annually (verified 2026-05-17)",
          includes:
            "Unlimited file uploads, unlimited blocks for teams, 100-guest sharing, 30-day version history.",
          audience: "Small teams just starting to collaborate at scale.",
        },
        {
          name: "Business",
          pricePoint: "approximately $18/seat/mo billed annually (verified 2026-05-17)",
          includes:
            "SAML SSO, private team spaces, advanced page analytics, 90-day version history, bulk PDF export.",
          audience: "Growing companies with security or compliance needs.",
        },
        {
          name: "Enterprise",
          pricePoint: "Custom (sales contact)",
          includes:
            "Audit log, advanced security, SCIM, dedicated success manager, custom contracts.",
          audience: "Large organizations with procurement requirements.",
        },
        {
          name: "AI add-on",
          pricePoint: "approximately $8-10/seat/mo on top of any tier",
          includes:
            "Notion AI writing, summarization, Q&A across workspace, AI autofill in databases.",
          audience: "Anyone on any tier who wants AI features.",
        },
      ],
      paymentFrequency: "Monthly or annual, with annual discount",
      freeTrialBehavior:
        "No trial on paid tiers — the Free tier IS the trial. Users self-upgrade when collaboration friction emerges.",
    },
    anchorAnalysis: {
      pattern: "Business tier as anchor",
      analysis:
        "Business at approximately $18/seat/mo anchors the page. Plus at approximately $10/seat/mo reads as the reasonable team starting point by comparison. Enterprise is the conversation-starter for anyone who recoils at the published Business price. The anchor is doing two jobs: making Plus look affordable AND making Enterprise feel like a custom call.",
    },
    upgradeTrigger: {
      pattern: "Team-collaboration boundary",
      analysis:
        "Free tier supports individuals plus limited guest sharing. The trigger fires when the team grows past the guest limit or when a coworker needs full editing rights, not just view access. The trigger is structural to how teams form, not feature-based — which is why the conversion rate from personal-free to team-paid is the strongest part of Notion's funnel.",
    },
    whatsWorking: [
      "Personal-free tier is good enough for real individual use, which seeds viral adoption inside companies.",
      "Team-collaboration boundary as upgrade trigger captures conversion at the moment a personal tool becomes a team tool.",
      "AI priced as add-on rather than tier lets Notion add revenue without disturbing seat-ladder psychology.",
      "Business tier anchors page; Plus reads as reasonable by comparison; Enterprise sits ready for procurement.",
      "Annual discount captures price-sensitive small teams; monthly option captures hesitant teams.",
      "Custom Enterprise tier handles the largest deals without exposing the price to seat-counting competitors.",
    ],
    whatToAdapt: [
      "If you can place the upgrade trigger at a structural boundary (team formation, new use case, scale threshold), the trigger fires without you having to engineer it.",
      "Price new feature categories as add-ons rather than new tiers when they cut across your existing seat structure.",
      "Use a custom Enterprise tier to handle deals that would otherwise force you to publish a price you do not want competitors to see.",
    ],
    whatToAvoid: [
      "Do not launch a personal-free tier if your unit economics do not support it. Notion has venture funding and a long horizon.",
      "Do not adopt seat-based pricing if your product is used by individuals on a team where each seat does not get clear individual value.",
      "Do not bury the upgrade trigger in feature gates. Structural triggers (team formation) convert better than feature gates (limit hit).",
    ],
    brunsonLens: {
      stack: "Tiered stack with progressive feature additions per rung; Business tier is the visual anchor.",
      valueLadder: "Four-rung ladder (Free → Plus → Business → Enterprise) plus add-on (AI) — full Value Ladder shape.",
      decoyOrAnchor: "Business tier as anchor; Plus as the reasonable middle; Enterprise as the procurement door.",
      paymentMechanics: "Per-seat monthly or annual with annual discount; add-ons priced per-seat orthogonally to tier.",
    },
    faqs: [
      {
        q: "Why does Notion use a personal-free tier instead of a free trial?",
        a: "Because the personal use case is genuinely valuable for individuals, and indie users build templates and habits that they carry into their companies. The personal-free tier is a viral acquisition channel that a time-limited trial would kill.",
      },
      {
        q: "Should an indie SaaS use seat-based pricing like Notion?",
        a: "Only when each seat gets clear individual value. Notion seats each get their own workspace contributions. Analytics tools or admin panels where one seat per company is the natural unit fail the per-seat test and should price differently.",
      },
      {
        q: "Why is Notion AI an add-on rather than a tier?",
        a: "Because AI cuts across the existing seat structure. Adding it as a tier would force users to choose between AI and other tier features. Adding it as an add-on lets Notion capture AI revenue from every tier without restructuring the page.",
      },
      {
        q: "What is the Brunson lens on Notion's pricing?",
        a: "Four-rung Value Ladder (textbook Brunson shape) with anchor mechanics on the Business tier and a custom-quote Enterprise door. The AI add-on is a 'continuity program' bolted to every rung — the Brunson move for adding recurring revenue without disturbing the existing offer structure.",
      },
    ],
    tags: ["per-seat", "freemium", "team-trigger", "anchor-tier", "add-on-pricing"],
    homepageUrl: "https://www.notion.so/",
    pricingPageUrl: "https://www.notion.so/pricing",
    lastVerified: "2026-05-17",
  },

  {
    slug: "linear",
    displayName: "Linear",
    creator: "Karri Saarinen, Tuomas Artman, Jori Lallo",
    category: "Project management for software teams",
    oneLine:
      "Linear's pricing reads like a quiet refusal to compete on price. Two paid tiers, no enterprise theatrics, premium positioning baked into the simplicity.",
    tldr:
      "Linear's pricing is minimalist: Free, Basic, Business, plus a custom Enterprise. The page itself is shorter than most competitors' single-tier descriptions. The simplicity is a positioning move: Linear is for design-conscious teams that resent over-complicated tools, including over-complicated pricing pages. The lesson: pricing-page minimalism can BE the positioning.",
    productSnapshot: {
      whatTheySell:
        "Issue tracking and project management built for high-velocity software teams.",
      whoFor:
        "Software engineering teams from startups to scale-ups who reject Jira's complexity.",
    },
    pricingStructure: {
      model: "Per-seat tiered subscription with minimalist tier structure",
      tiers: [
        {
          name: "Free",
          pricePoint: "$0",
          includes:
            "Up to 250 issues, unlimited members, basic features, GitHub integration.",
          audience: "Solo developers and small open-source projects.",
        },
        {
          name: "Basic",
          pricePoint: "approximately $8-10/user/mo (verified 2026-05-17)",
          includes:
            "Unlimited issues, file uploads, integrations, custom workflows, priorities.",
          audience: "Small teams that have outgrown the 250-issue limit.",
        },
        {
          name: "Business",
          pricePoint: "approximately $14/user/mo (verified 2026-05-17)",
          includes:
            "Cycles, projects, roadmaps, advanced workflows, SSO, sub-teams, admin roles.",
          audience: "Growing teams that need cross-team planning.",
        },
        {
          name: "Enterprise",
          pricePoint: "Custom (sales contact)",
          includes:
            "Advanced SSO, audit logs, security and compliance reviews, dedicated support.",
          audience: "Larger organizations with procurement requirements.",
        },
      ],
      paymentFrequency: "Monthly or annual, with annual discount",
      freeTrialBehavior:
        "Free tier is the trial; paid tiers have no separate trial period required for evaluation.",
    },
    anchorAnalysis: {
      pattern: "Restraint as anchor",
      analysis:
        "There is no anchor tier in the traditional sense because there is no tier designed to look expensive. The Business tier at approximately $14/user/mo is the implicit center. The page's psychological anchor is its own brevity: the pricing decision feels low-stakes because the page itself feels low-stakes.",
    },
    upgradeTrigger: {
      pattern: "Issue-count cap plus team-feature need",
      analysis:
        "Free's 250-issue limit is the structural trigger. Beyond that, the upgrade from Basic to Business is driven by cross-team planning needs (cycles, roadmaps, sub-teams). The trigger is layered: first volume, then workflow complexity. Both triggers map to natural team growth, not arbitrary feature gates.",
    },
    whatsWorking: [
      "Page minimalism IS positioning. Linear's audience resents enterprise pricing-page theatrics, and the brevity speaks to that audience without copy.",
      "Issue-count cap on free tier creates a structural upgrade trigger that aligns with team growth.",
      "Business tier features (cycles, projects, roadmaps) are the specific things growing software teams actually adopt, so the upgrade trigger is feature-matched.",
      "Enterprise tier is a single sales-contact line, no theater, which matches the audience's preference for direct dealing.",
      "Annual discount captures price-sensitive teams without forcing the choice on the monthly buyer.",
    ],
    whatToAdapt: [
      "Pricing-page minimalism can BE the positioning when your audience resents tooling complexity. Brevity reads as confidence.",
      "Use a volume cap on free tier (not a feature gate) when your buyer's volume scales with team success.",
      "Layer upgrade triggers: volume first (mechanical), then workflow (intentional). Each tier should solve a different scaling problem.",
    ],
    whatToAvoid: [
      "Do not adopt minimalist pricing if your buyer needs the per-feature breakdown to justify procurement. Some audiences require the long page.",
      "Do not skip an Enterprise tier if your audience includes companies with mandatory procurement review. The Enterprise tier exists for the procurement department, not the user.",
    ],
    brunsonLens: {
      stack: "Restrained stack — minimal feature lists per tier, trusts the buyer to recognize what is included.",
      valueLadder: "Four-rung ladder (Free → Basic → Business → Enterprise) with intentional simplicity at each rung.",
      decoyOrAnchor: "No decoy. Business tier sits as the implicit center. Restraint substitutes for explicit anchor mechanics.",
      paymentMechanics: "Per-user monthly or annual with annual discount; no usage metering, no add-ons.",
    },
    faqs: [
      {
        q: "Why is Linear's pricing page so short?",
        a: "Because Linear's audience (software teams that left Jira) resents over-complicated tools, and the pricing page is the first product-shaped interaction with that audience. Brevity on the pricing page IS the positioning. A long page would contradict the product promise.",
      },
      {
        q: "Should every SaaS use minimalist pricing pages?",
        a: "No. Buyers in procurement-heavy categories (security, ERP, healthcare) need the long breakdown to justify the purchase internally. Buyers in design-conscious categories (creator tools, dev tools, modern productivity) respond to brevity. Match the page to the audience's purchasing context.",
      },
      {
        q: "What is the Brunson lens on Linear's pricing?",
        a: "Restrained Stack with a four-rung Value Ladder. The unusual move is the deliberate absence of decoy mechanics — Linear trusts the buyer to compare rationally rather than nudging with psychological tier design. This works because the audience values directness; it would fail in audiences expecting more aggressive positioning.",
      },
      {
        q: "Why does Linear use per-user pricing?",
        a: "Because each user gets clear individual value from issue tracking. Per-user pricing aligns the bill with the value delivered. Volume-based pricing (per-issue) would punish teams for working harder, which is the wrong incentive for a productivity tool.",
      },
    ],
    tags: ["per-seat", "minimalism", "premium-positioning", "developer-tools"],
    homepageUrl: "https://linear.app/",
    pricingPageUrl: "https://linear.app/pricing",
    lastVerified: "2026-05-17",
  },

  {
    slug: "figma",
    displayName: "Figma",
    creator: "Dylan Field and team (acquired by Adobe attempt blocked; remains independent)",
    category: "Design and prototyping",
    oneLine:
      "Figma's per-editor pricing converts viewers into a viral acquisition channel and editors into the paid revenue.",
    tldr:
      "Figma prices on a sharp split: viewers and commenters are free forever; editors pay per seat. This makes every design file shared with developers, PMs, and clients an acquisition asset, while keeping the revenue contained to actual designers. The lesson: when your product has high-multiplier viewers per editor, price the editor and free the viewer.",
    productSnapshot: {
      whatTheySell:
        "Collaborative design and prototyping in the browser, plus FigJam whiteboard and Slides.",
      whoFor:
        "Designers, product teams, agencies, and developers who collaborate on design.",
    },
    pricingStructure: {
      model: "Per-editor freemium with viewer-free model and tiered team plans",
      tiers: [
        {
          name: "Starter",
          pricePoint: "$0",
          includes:
            "Up to 3 Figma design files plus 3 FigJam files, unlimited viewers, unlimited personal files.",
          audience: "Individual designers exploring or building a small portfolio.",
        },
        {
          name: "Professional",
          pricePoint: "approximately $15/editor/mo annual (verified 2026-05-17)",
          includes:
            "Unlimited files, version history, team libraries, shareable team styles, advanced prototyping.",
          audience: "Independent designers and small design teams.",
        },
        {
          name: "Organization",
          pricePoint: "approximately $45/editor/mo annual (verified 2026-05-17)",
          includes:
            "Organization-wide design system, branching, design analytics, SSO, advanced libraries.",
          audience: "Growing companies with multiple design teams.",
        },
        {
          name: "Enterprise",
          pricePoint: "approximately $75/editor/mo annual (verified 2026-05-17)",
          includes:
            "Dedicated workspaces, guest access controls, advanced security, enterprise admin.",
          audience: "Large organizations with central design ops.",
        },
      ],
      paymentFrequency: "Monthly or annual, with substantial annual discount",
      freeTrialBehavior:
        "Free tier is the trial for individuals. Teams can start on the paid tier with limited free seats; full evaluation usually happens via the free tier.",
    },
    anchorAnalysis: {
      pattern: "Enterprise tier as anchor",
      analysis:
        "Enterprise at approximately $75/editor/mo anchors the page. Organization at approximately $45 reads as the reasonable mid-tier for growing companies. Professional at approximately $15 reads as cheap by comparison even though it is the most-purchased tier. Triple anchoring at the top is doing the heavy lifting throughout the page.",
    },
    upgradeTrigger: {
      pattern: "Viewer-to-editor role change",
      analysis:
        "The trigger fires when someone with view-only access (developer, PM, client) needs to make a real edit. Most teams pay because someone on the team transitioned from observer to editor, not because a free editor hit a limit. This is a behavioral trigger driven by org structure changes, not feature gates.",
    },
    whatsWorking: [
      "Viewer-free model makes every shared file a viral acquisition asset: developers, PMs, and clients all encounter Figma at zero cost.",
      "Per-editor pricing aligns revenue with the role that gets the most value (designers) and frees the role that drives the most discovery (viewers).",
      "Enterprise anchor at approximately $75/editor/mo makes the Professional tier feel small even at $15/seat/mo.",
      "FigJam priced separately within tiers allows expansion into a new use case (whiteboarding) without disturbing the core design pricing.",
      "Annual discount is large enough to materially shift the buyer toward annual commitment, lowering churn.",
    ],
    whatToAdapt: [
      "If your product has high viewer-to-editor multiplier, free the viewer and price the editor. The viewers become your acquisition channel.",
      "Use Enterprise tier pricing as the anchor even if few buyers reach that tier. Anchoring works on visible price, not on revenue mix.",
      "Sell adjacent use cases (FigJam, Slides) within existing tiers, not as separate products. Bundle expansion captures incremental revenue without churning existing accounts.",
    ],
    whatToAvoid: [
      "Do not free viewers if your viewer role is the actual buyer. Per-editor pricing fails when buyers are evaluators rather than producers.",
      "Do not price Enterprise at an anchor level if you have no real Enterprise customers. The page-credibility cost of an empty anchor is high.",
      "Do not assume per-editor pricing works for non-collaborative tools. The multiplier model requires shared output.",
    ],
    brunsonLens: {
      stack: "Tiered stack with progressive collaboration features; Enterprise tier is the visual anchor.",
      valueLadder: "Four-rung ladder with viewer-free entry rung that does not count toward seat revenue.",
      decoyOrAnchor: "Triple anchor: Enterprise at the top, Organization as the visible 'mid-market', Professional as the indie tier that looks cheap by comparison.",
      paymentMechanics: "Per-editor (not per-user) pricing decouples value-capture from acquisition volume.",
    },
    faqs: [
      {
        q: "Why does Figma free viewers but charge editors?",
        a: "Because the viewer role drives acquisition (developers, PMs, and clients all see designs) and the editor role drives value capture (designers produce the work). Pricing this way maximizes both metrics simultaneously: more free viewers means more paid editors over time.",
      },
      {
        q: "Should an indie SaaS use per-editor pricing?",
        a: "Only when there is a clear distinction between roles AND viewers are abundant relative to editors. Design tools, documentation, dashboards, and collaboration products usually fit. Single-user productivity tools do not.",
      },
      {
        q: "Why is the Enterprise tier so much more expensive?",
        a: "Because it both anchors the page (making lower tiers feel reasonable) and serves large procurement contexts where the price difference reflects real compliance, security, and support cost. The Enterprise tier does two jobs at once.",
      },
      {
        q: "What is the Brunson lens on Figma's pricing?",
        a: "Triple-anchor Value Ladder with viewer-free acquisition. The viewer rung is the front-end of the funnel even though it generates no revenue. The Professional and Organization tiers are the subscription core. Enterprise is the high-ticket back-end. Textbook Brunson Value Ladder applied to design SaaS.",
      },
    ],
    tags: ["per-editor", "viewer-free", "triple-anchor", "collaboration"],
    homepageUrl: "https://www.figma.com/",
    pricingPageUrl: "https://www.figma.com/pricing/",
    lastVerified: "2026-05-17",
  },

  {
    slug: "vercel",
    displayName: "Vercel",
    creator: "Guillermo Rauch and team",
    category: "Frontend cloud and hosting",
    oneLine:
      "Vercel runs a generous hobby-free tier as developer top-of-funnel and lets usage drive the upgrade to Pro and beyond.",
    tldr:
      "Vercel's pricing places Hobby as a fully-featured free tier for personal projects with strict commercial-use prohibition. Pro at approximately $20/user/mo unlocks commercial use and team features; Enterprise handles custom infrastructure. Usage overages are metered per resource, which makes the bill scale with success. The lesson: a free tier with crystal-clear commercial-use restriction converts solo developers into paid Pro accounts at exactly the moment the product earns revenue.",
    productSnapshot: {
      whatTheySell:
        "A frontend cloud platform that hosts Next.js, React, and other modern web apps with edge networking, serverless functions, and developer tooling.",
      whoFor:
        "Developers, startups, and enterprises building modern web applications, particularly those using Next.js.",
    },
    pricingStructure: {
      model: "Tiered subscription with per-user base plus metered usage overages",
      tiers: [
        {
          name: "Hobby",
          pricePoint: "$0",
          includes:
            "Personal projects only (no commercial use), generous compute and bandwidth allowances, all framework support, preview deployments.",
          audience: "Solo developers, students, side projects, learning.",
        },
        {
          name: "Pro",
          pricePoint:
            "approximately $20/user/mo plus metered usage overages (verified 2026-05-17)",
          includes:
            "Commercial use, team collaboration, password protection, larger allowances, analytics, log retention.",
          audience: "Startups, indie devs going commercial, small product teams.",
        },
        {
          name: "Enterprise",
          pricePoint: "Custom (sales contact)",
          includes:
            "Dedicated infrastructure, SLAs, custom compliance, advanced security, dedicated support, annual contracts.",
          audience: "Larger companies with security or scale requirements.",
        },
      ],
      paymentFrequency: "Monthly per-user base, metered usage billed monthly",
      freeTrialBehavior:
        "Hobby tier IS the trial. The commercial-use restriction is the structural trigger to Pro.",
    },
    anchorAnalysis: {
      pattern: "Use-case anchor, not price anchor",
      analysis:
        "The Pro tier's $20/user/mo is not designed to look reasonable next to a higher tier. The anchor is the commercial-use restriction on Hobby: any project that earns revenue must upgrade to Pro. This converts the anchor mechanic from a price-comparison nudge into a binary structural requirement, which is more reliable than psychological anchoring.",
    },
    upgradeTrigger: {
      pattern: "Commercial-use boundary",
      analysis:
        "The trigger fires the moment a project transitions from hobby to revenue. This is a structural trigger that fires exactly when willingness-to-pay materializes (the project is now generating money) and exactly when continued use on the free tier becomes a TOS violation. Two-sided alignment.",
    },
    whatsWorking: [
      "Commercial-use boundary as upgrade trigger converts free users at the exact moment they generate revenue.",
      "Per-user base plus metered usage scales pricing with customer success, which lowers commitment friction.",
      "Hobby tier is generous enough that developers ship real projects on it before committing, which builds product habit.",
      "Pro tier price is round and memorable ($20/user/mo) rather than a comparison-shoppable odd number.",
      "Custom Enterprise tier hides infrastructure pricing from competitors while serving the largest deals.",
      "Usage overages metered per resource (bandwidth, function invocations, builds) so the bill maps to specific product behavior the customer can optimize.",
    ],
    whatToAdapt: [
      "Use a structural upgrade trigger (commercial use, team formation, scale threshold) rather than a feature gate when possible. Structural triggers fire predictably at value moments.",
      "If your product has clear hobby vs commercial use cases, use the boundary as the free-to-paid trigger. The TOS line backs up the price line.",
      "Meter usage per specific resource so the customer can optimize their bill, not just absorb it.",
    ],
    whatToAvoid: [
      "Do not free commercial use if your competitive position depends on revenue from small commercial users. Hobby-tier free works because Vercel monetizes the moment revenue starts.",
      "Do not adopt per-user base plus usage pricing if your customer cannot predict their usage. Bill-shock is the biggest churn driver in usage-billed SaaS.",
      "Do not gate features behind tier upgrades if usage metering achieves the same revenue. Feature gates fight the buyer; usage metering aligns with them.",
    ],
    brunsonLens: {
      stack: "Tier-plus-meter stack: each tier is a base subscription plus usage overages, which is a hybrid stack pattern.",
      valueLadder: "Three-rung ladder with Hobby as front-end lead funnel, Pro as subscription core, Enterprise as high-ticket back-end.",
      decoyOrAnchor: "Structural anchor (commercial-use boundary), not price anchor. The TOS does the work psychology would otherwise do.",
      paymentMechanics: "Per-user base subscription plus per-resource metered usage. Revenue scales with customer success.",
    },
    faqs: [
      {
        q: "Why does Vercel restrict commercial use on the free tier?",
        a: "Because the commercial-use boundary is the upgrade trigger. Vercel's Hobby tier is generous because Pro conversion fires the moment a project earns revenue, which is the moment willingness-to-pay rises. Without the commercial-use restriction, the conversion rate would collapse.",
      },
      {
        q: "Should an indie SaaS use usage-based pricing?",
        a: "Only when the resource you meter maps cleanly to customer value AND the customer can predict or control their usage. Vercel's bandwidth and function invocations meet both tests. Pricing a CRM by API calls would fail both tests.",
      },
      {
        q: "Why is the Pro tier priced at a round $20/user/mo?",
        a: "Because round prices are memorable and signal confidence. $19 invites comparison-shopping psychology; $20 reads as a deliberate price. For a developer audience that resents micro-optimized pricing, the round number is its own positioning.",
      },
      {
        q: "What is the Brunson lens on Vercel's pricing?",
        a: "Three-rung Value Ladder with hybrid stack: subscription base plus metered overages. The structural upgrade trigger (commercial use) replaces psychological anchor mechanics with a TOS line. Cleaner alignment than most freemium SaaS achieve, because the trigger is binary and value-aligned.",
      },
    ],
    tags: ["usage-based", "commercial-use-trigger", "developer-tools", "metered"],
    homepageUrl: "https://vercel.com/",
    pricingPageUrl: "https://vercel.com/pricing",
    lastVerified: "2026-05-17",
  },

  {
    slug: "beehiiv",
    displayName: "Beehiiv",
    creator: "Tyler Denk",
    category: "Newsletter platform",
    oneLine:
      "Beehiiv prices on subscriber count and unlocks monetization features tier-by-tier. The ladder is the product.",
    tldr:
      "Beehiiv's pricing scales by subscriber count, with the higher tiers unlocking the ad network, paid subscriptions, referral mechanics, and the Boost monetization network. The ladder maps to creator maturity: as the newsletter grows, the operator climbs the tier ladder by need rather than by upsell pressure. The lesson: when your product can stack monetization features, the value ladder lives inside the product, not the page.",
    productSnapshot: {
      whatTheySell:
        "A newsletter platform with built-in monetization stack: ad network, paid subscriptions, referrals, Boost network.",
      whoFor:
        "Newsletter creators treating the newsletter as a business with multiple revenue streams.",
    },
    pricingStructure: {
      model: "Subscriber-count tiered with monetization features unlocking per tier",
      tiers: [
        {
          name: "Launch",
          pricePoint: "$0",
          includes:
            "Up to 2,500 subscribers, core newsletter publishing, basic analytics, ad network monetization unlocked at threshold.",
          audience: "New creators just starting a newsletter.",
        },
        {
          name: "Scale",
          pricePoint: "approximately $39-99/mo depending on subscriber count (verified 2026-05-17)",
          includes:
            "Custom domain, premium subscriptions, Boost network, no Beehiiv branding, advanced analytics.",
          audience: "Established creators monetizing a growing newsletter.",
        },
        {
          name: "Max",
          pricePoint: "approximately $99-499/mo depending on subscriber count (verified 2026-05-17)",
          includes:
            "Newsletter API access, multiple publications, white-glove support, advanced segmentation.",
          audience: "Professional operators and small media businesses.",
        },
        {
          name: "Enterprise",
          pricePoint: "Custom (sales contact)",
          includes:
            "Custom infrastructure, SSO, dedicated success, advanced security.",
          audience: "Large media operators or branded enterprise newsletters.",
        },
      ],
      paymentFrequency: "Monthly or annual, with annual discount; subscriber-count tiers re-evaluated as audience grows",
      freeTrialBehavior:
        "Free Launch tier is the structural trial. Some Scale features available on a time-limited trial during onboarding.",
    },
    anchorAnalysis: {
      pattern: "Max tier as anchor",
      analysis:
        "The Max tier at the upper end of approximately $99-499/mo anchors the page for serious operators. Scale at approximately $39-99/mo reads as the reasonable creator-business tier by comparison. Launch is the entry. The anchor is doing the work of making Scale feel like the natural creator-business choice rather than the splurge.",
    },
    upgradeTrigger: {
      pattern: "Subscriber-count cap plus monetization need",
      analysis:
        "Two structural triggers fire together: subscriber growth past the Launch cap forces a Scale upgrade; the need to monetize via paid subscriptions or Boost network forces the same upgrade independently. The double trigger means the conversion fires reliably as creators grow, regardless of which path they take.",
    },
    whatsWorking: [
      "Subscriber-count tiering aligns the bill with creator success, which lowers commitment friction for new creators.",
      "Monetization features unlocked per tier turn the pricing ladder into the product roadmap.",
      "Ad network monetization on free tier (above a threshold) gives Launch users a reason to stay AND a reason to upgrade once the cap hits.",
      "Boost network on Scale tier is a sideways acquisition channel — Scale subscribers acquire each other's audiences, paid by Beehiiv.",
      "Round-ish tier names (Launch, Scale, Max) communicate the operator's stage rather than feature breakdown.",
    ],
    whatToAdapt: [
      "If your product can stack monetization features for the buyer, ladder them by tier so the pricing page IS the product roadmap.",
      "Tier by a metric that scales with customer success (subscribers, revenue, transactions) when possible. Per-seat fails for creator products.",
      "Use tier names that communicate stage (Launch, Scale, Max) when buyers want to identify with where they ARE in their journey.",
    ],
    whatToAvoid: [
      "Do not tier monetization features if your product cannot credibly monetize for the buyer. Promising monetization you cannot deliver destroys trust.",
      "Do not use subscriber-count tiering for non-audience products. The model only works when subscriber count maps to value delivered.",
    ],
    brunsonLens: {
      stack: "Vertical stack — each tier adds monetization mechanisms the prior tier did not have.",
      valueLadder: "Four-rung Value Ladder with monetization stack baked into rung progression.",
      decoyOrAnchor: "Max tier as anchor; Scale as the visible creator-business choice; Launch as the entry.",
      paymentMechanics: "Per-subscriber-tier monthly or annual subscription; no per-seat, no usage metering.",
    },
    faqs: [
      {
        q: "Why does Beehiiv tier by subscribers instead of features?",
        a: "Because subscriber count is the metric that maps to creator value AND to platform cost (storage, send volume, support). Tiering on this metric aligns the bill with both customer value and platform unit economics.",
      },
      {
        q: "Should an indie SaaS use audience-size tiering?",
        a: "Only when your buyer's value scales with their audience AND your platform cost scales with the same metric. Newsletter platforms, podcast hosting, and analytics products fit. Project management tools or design tools do not.",
      },
      {
        q: "Why are monetization features locked per tier?",
        a: "Because the feature unlocks ARE the upgrade trigger. Locking premium subscriptions to the Scale tier means the trigger fires the moment a creator decides to monetize, not at an arbitrary subscriber threshold. The feature gate aligns with willingness-to-pay.",
      },
      {
        q: "What is the Brunson lens on Beehiiv's pricing?",
        a: "Four-rung Value Ladder with monetization stack as the rung-progression mechanism. This is unusual: most SaaS ladder by feature breadth; Beehiiv ladders by monetization capability, which is closer to a continuity program where each rung adds revenue mechanisms rather than usage allowances.",
      },
    ],
    tags: ["audience-tiering", "monetization-stack", "creator-tools", "anchor-tier"],
    homepageUrl: "https://www.beehiiv.com/",
    pricingPageUrl: "https://www.beehiiv.com/pricing",
    lastVerified: "2026-05-17",
  },

  {
    slug: "cal-com",
    displayName: "Cal.com",
    creator: "Peer Richelsen and Bailey Pumfleet",
    category: "Scheduling",
    oneLine:
      "Cal.com prices in three tracks: free hosted, paid teams, free self-host. The split serves three different buyer types from one page.",
    tldr:
      "Cal.com runs a tri-track pricing model: generous free hosted tier for individuals, per-seat paid tiers for teams, and a free self-host option under AGPL for principled buyers. Each track captures a different buyer type without forcing a choice at first contact. The lesson: when your buyer types diverge sharply, multi-track pricing serves more buyers than a single tier ladder.",
    productSnapshot: {
      whatTheySell:
        "Open-source scheduling platform with hosted SaaS, self-host option, and enterprise white-label.",
      whoFor:
        "Developers, agencies, teams who want Calendly's UX with extensibility, privacy, or principle.",
    },
    pricingStructure: {
      model: "Multi-track: hosted freemium + per-seat paid + free self-host",
      tiers: [
        {
          name: "Free hosted",
          pricePoint: "$0",
          includes:
            "Individual scheduling, unlimited events, integrations, Cal Video, basic embeds.",
          audience: "Individuals and small users on the hosted SaaS.",
        },
        {
          name: "Teams",
          pricePoint:
            "approximately $12-15/seat/mo billed annually (verified 2026-05-17)",
          includes:
            "Round robin, collective events, team availability, branded routing forms.",
          audience: "Sales teams, agencies, and small teams scheduling collaboratively.",
        },
        {
          name: "Organizations",
          pricePoint:
            "approximately $37-50/seat/mo billed annually (verified 2026-05-17)",
          includes:
            "SSO, advanced admin, white-label, organization-wide booking, advanced workflows.",
          audience: "Larger companies with central admin requirements.",
        },
        {
          name: "Enterprise",
          pricePoint: "Custom (sales contact)",
          includes:
            "Dedicated infrastructure, SLAs, custom contracts, white-glove support.",
          audience: "Large organizations.",
        },
        {
          name: "Self-host",
          pricePoint: "$0 (AGPL license)",
          includes:
            "All code, host your own infrastructure, no Cal.com fee. Maintenance is on you.",
          audience: "Developers and principled buyers who refuse hosted SaaS.",
        },
      ],
      paymentFrequency: "Monthly or annual per-seat for paid tiers; self-host is free in perpetuity",
      freeTrialBehavior:
        "Free hosted tier IS the trial for individuals. Teams can trial paid features through limited preview.",
    },
    anchorAnalysis: {
      pattern: "Organizations tier as anchor",
      analysis:
        "Organizations at approximately $37-50/seat/mo anchors the page for serious teams. Teams at approximately $12-15/seat/mo reads as the affordable team tier by comparison. The anchor is doing standard work, but the unusual move is the self-host escape valve at $0 alongside paid tiers — which is a counter-anchor for the buyer who would otherwise reject SaaS on principle.",
    },
    upgradeTrigger: {
      pattern: "Team collaboration plus advanced workflows",
      analysis:
        "The trigger from free hosted to Teams fires when a user needs round-robin or collective scheduling, which is a structural team need. The trigger from Teams to Organizations fires when central admin (SSO, white-label) becomes a requirement, which maps to company stage. Both triggers are workflow-aligned rather than feature-gated artificially.",
    },
    whatsWorking: [
      "Multi-track pricing serves three buyer types (individual hosted, paying teams, principled self-hosters) without forcing a choice.",
      "Self-host at $0 captures the buyer who would otherwise build it themselves, betting most will return to hosted later.",
      "Teams tier triggered by structural collaboration need (round-robin), not arbitrary feature gates.",
      "Organizations tier captures procurement-driven buyers who need SSO and admin without exposing pricing to competitors directly.",
      "Free hosted is generous enough that individual users default to it, seeding the visible-customer flywheel for paid team upgrades.",
    ],
    whatToAdapt: [
      "If your buyer types diverge sharply (individual vs team vs principled), multi-track pricing serves more buyers than a single ladder.",
      "Use a self-host or escape-hatch option to capture buyers who would otherwise build it themselves. The escape hatch is also a trust signal.",
      "Trigger team-tier upgrades on structural collaboration needs (round-robin, collective availability) rather than feature gates.",
    ],
    whatToAvoid: [
      "Do not offer self-host if you cannot maintain the open-source project long-term. Stale repos hurt trust more than no repo at all.",
      "Do not adopt multi-track pricing if your buyer types are not actually distinct. Most SaaS have one or two buyer types and multi-track adds confusion.",
    ],
    brunsonLens: {
      stack: "Multi-track stack: parallel hosted-paid ladder plus principled self-host track that does not slot into the ladder.",
      valueLadder: "Four-rung paid ladder (Free → Teams → Organizations → Enterprise) plus self-host as off-ladder option.",
      decoyOrAnchor: "Organizations tier as anchor; Teams as the visible team tier; Free hosted as entry; self-host as principled counter-anchor.",
      paymentMechanics: "Per-seat monthly or annual for paid tiers; perpetual free for hosted free and self-host.",
    },
    faqs: [
      {
        q: "Why does Cal.com offer self-host at $0 alongside paid tiers?",
        a: "Because self-host captures the principled buyer who would reject hosted SaaS on ideological grounds. Most self-hosters eventually return to the hosted tier when the maintenance cost exceeds the subscription cost. The dual-track captures both buyer types without forcing a choice at first contact.",
      },
      {
        q: "Should every SaaS offer multi-track pricing?",
        a: "No. Multi-track pricing only helps when your buyer types are genuinely distinct AND your business model supports each track without cannibalization. Single-track pricing is simpler and converts better when your buyer types overlap.",
      },
      {
        q: "What is the Brunson lens on Cal.com's pricing?",
        a: "Multi-rung Value Ladder with an off-ladder principled track. The self-host option is a Brunson-style 'continuity escape valve' that captures buyers who would reject the offer entirely. It is unusual in SaaS pricing but matches the open-source ideology Cal.com is selling.",
      },
      {
        q: "Why is the Teams tier triggered by round-robin rather than a feature count?",
        a: "Because round-robin scheduling is the specific functional difference between individual and team use. Triggering on the structural need ensures the upgrade fires at the moment willingness-to-pay rises (the team has formed and needs the feature), not at an arbitrary feature count.",
      },
    ],
    tags: ["multi-track", "open-source", "self-host", "per-seat"],
    homepageUrl: "https://cal.com/",
    pricingPageUrl: "https://cal.com/pricing",
    lastVerified: "2026-05-17",
  },

  {
    slug: "resend",
    displayName: "Resend",
    creator: "Zeno Rocha and team",
    category: "Email API",
    oneLine:
      "Resend prices on send volume with a generous free tier for indie devs. The model aligns with developer mental models.",
    tldr:
      "Resend's pricing scales by emails sent per month, with a generous free tier (3,000/mo) that covers most indie SaaS in production. Paid tiers scale linearly from there. Pricing is in round numbers (3K, 50K, 100K, etc.) that match how developers reason about send volume. The lesson: when your buyer is technical, price in their mental units, not yours.",
    productSnapshot: {
      whatTheySell:
        "A developer-first transactional email API with React Email integration.",
      whoFor:
        "Developers and indie SaaS founders sending transactional or marketing email.",
    },
    pricingStructure: {
      model: "Usage-based subscription priced per email-send volume",
      tiers: [
        {
          name: "Free",
          pricePoint: "$0",
          includes:
            "3,000 emails/month, 100 emails/day, one domain, full API access.",
          audience: "Indie devs shipping side projects and early-stage SaaS.",
        },
        {
          name: "Pro",
          pricePoint:
            "approximately $20/mo for 50,000 emails (verified 2026-05-17)",
          includes:
            "50K emails/month, unlimited domains, dedicated IP option, analytics, webhook support.",
          audience: "Production SaaS with moderate send volume.",
        },
        {
          name: "Scale",
          pricePoint:
            "approximately $90/mo for 100K emails plus volume tiers up to enterprise",
          includes:
            "100K+ emails/month, dedicated IPs, priority support, advanced deliverability features.",
          audience: "Larger SaaS and marketing-heavy operators.",
        },
        {
          name: "Enterprise",
          pricePoint: "Custom (sales contact)",
          includes:
            "Custom volumes, SLAs, dedicated infrastructure, dedicated success manager.",
          audience: "High-volume senders and regulated industries.",
        },
      ],
      paymentFrequency: "Monthly subscription tied to volume tier; auto-upgrade as volume grows",
      freeTrialBehavior:
        "Free tier IS the trial. 3K/month is enough for real production for most indie SaaS.",
    },
    anchorAnalysis: {
      pattern: "Round-number anchor",
      analysis:
        "Volume tiers are round numbers (3K, 50K, 100K) that match how developers think about send rates. The Pro tier at $20/mo for 50K is the page's center of gravity; Scale and Enterprise anchor above. The unusual move is that the free tier is generous enough to be the trial, which keeps the pricing-page evaluation focused on volume planning rather than feature comparison.",
    },
    upgradeTrigger: {
      pattern: "Volume cap and dedicated-IP need",
      analysis:
        "Two triggers fire together: the 3K/month free cap is the structural volume trigger; the need for a dedicated IP (deliverability concern for marketing email) drives the upgrade to Pro independently. The first trigger is mechanical; the second is intentional. Both map to genuine SaaS growth needs.",
    },
    whatsWorking: [
      "Volume tiered in round numbers (3K, 50K, 100K) matches developer mental model and removes evaluation friction.",
      "Free tier (3K/mo) is genuinely production-grade for indie SaaS, which builds habit before the upgrade trigger fires.",
      "Pro tier at round $20/mo is memorable and signals confidence rather than micro-optimized comparison-shopping.",
      "Dedicated IP available on Pro creates a behavioral upgrade trigger for marketers concerned with deliverability.",
      "Custom Enterprise tier captures the largest deals without exposing volume pricing to enterprise competitors.",
    ],
    whatToAdapt: [
      "Price in the units your technical buyer already uses to reason about cost (sends, requests, GB, queries). Translation friction kills evaluation.",
      "Use round numbers for tier thresholds. Memorable beats optimized.",
      "Layer triggers: mechanical (volume cap) and intentional (specific feature need) so the upgrade fires reliably across buyer types.",
    ],
    whatToAvoid: [
      "Do not use usage-based pricing if your buyer cannot predict their usage. Bill-shock is the biggest usage-pricing churn driver.",
      "Do not price volume tiers in awkward units (e.g. 1,234 emails). The cognitive cost of unusual units exceeds the optimization value.",
      "Do not make the free tier so generous that indie SaaS never upgrade. The free tier must have a structural ceiling that maps to growth.",
    ],
    brunsonLens: {
      stack: "Volume stack — each tier adds send capacity and minor feature unlocks. Pricing scales linearly with use.",
      valueLadder: "Four-rung ladder with free tier as front-end lead funnel and Enterprise as high-ticket back-end.",
      decoyOrAnchor: "Round-number anchor mechanics; Scale tier reads as expensive next to Pro at $20/mo.",
      paymentMechanics: "Monthly subscription scaled by volume tier; usage-based but tier-bundled to avoid bill-shock.",
    },
    faqs: [
      {
        q: "Why does Resend tier by send volume rather than by features?",
        a: "Because send volume is the primary cost driver for the platform AND the primary value metric for the buyer. Tiering on this metric aligns customer value, customer mental model, and platform unit economics simultaneously.",
      },
      {
        q: "Should an indie SaaS use usage-based pricing?",
        a: "Only when usage maps to genuine value AND the buyer can predict their usage. Resend's send-volume model meets both tests. Pricing a productivity SaaS by 'actions taken' would fail the predictability test.",
      },
      {
        q: "Why is the free tier so generous?",
        a: "Because the buyer (indie dev) needs to ship a working product on Resend before deciding to commit. A stingy free tier would lose evaluations to incumbents who give more headroom. Resend's free tier is calibrated to be enough for production but capped where real businesses outgrow it.",
      },
      {
        q: "What is the Brunson lens on Resend's pricing?",
        a: "Four-rung Value Ladder with volume-tiered subscription mechanics. The free tier functions as the front-end lead funnel, Pro and Scale as subscription core, Enterprise as high-ticket back-end. Round-number anchor mechanics throughout. Textbook indie-friendly Value Ladder.",
      },
    ],
    tags: ["usage-based", "volume-tiered", "developer-tools", "round-numbers"],
    homepageUrl: "https://resend.com/",
    pricingPageUrl: "https://resend.com/pricing",
    lastVerified: "2026-05-17",
  },

  {
    slug: "stripe",
    displayName: "Stripe",
    creator: "Patrick and John Collison",
    category: "Payments infrastructure",
    oneLine:
      "Stripe's pricing is a single round percentage with no negotiation, which is itself the positioning. The simplicity converts faster than any pitch.",
    tldr:
      "Stripe's headline pricing is 2.9% + 30¢ per successful charge, with no setup fees, monthly fees, or refunds-on-refunds. The published price is the price for almost every customer below enterprise scale. The lesson: when your buyer is comparing multiple complex pricing pages, the simplest legible price wins by default.",
    productSnapshot: {
      whatTheySell:
        "Payment processing infrastructure with subscriptions, billing, fraud prevention, payouts, and a deep API ecosystem.",
      whoFor:
        "Developers, indie SaaS, growing companies, and enterprises accepting payments online.",
    },
    pricingStructure: {
      model: "Flat per-transaction percentage plus fixed fee for standard product",
      tiers: [
        {
          name: "Pay-as-you-go",
          pricePoint:
            "2.9% + 30¢ per successful card charge (verified 2026-05-17, US pricing)",
          includes:
            "Core payments, subscriptions, basic fraud protection, dashboard, API access.",
          audience:
            "Almost every customer from indie SaaS to mid-market businesses.",
        },
        {
          name: "Custom",
          pricePoint: "Negotiated (high-volume sales contact)",
          includes:
            "Volume discounts, interchange-plus pricing, advanced fraud tools, dedicated infrastructure, account management.",
          audience: "Large merchants processing significant monthly volume.",
        },
        {
          name: "Add-on products",
          pricePoint:
            "Variable per product (Connect, Radar, Tax, Billing, etc.) priced independently",
          includes:
            "Each product (Stripe Connect for marketplaces, Stripe Tax for compliance, Radar for fraud) has its own published pricing layered on the base.",
          audience: "Customers needing specific Stripe capabilities beyond payments.",
        },
      ],
      paymentFrequency: "Per-transaction, no monthly base for standard product",
      freeTrialBehavior:
        "No trial. Account is free to create; you pay only when you process payments.",
    },
    anchorAnalysis: {
      pattern: "Absent anchor",
      analysis:
        "Stripe has no anchor mechanics on standard pricing because there are no tiers to anchor between. The single published percentage is the entire pricing decision for most buyers. Add-on products (Connect, Radar, Tax) are priced separately on their own pages, so they do not crowd the main pricing decision. The absence of anchor mechanics is itself the positioning.",
    },
    upgradeTrigger: {
      pattern: "Volume threshold for custom pricing",
      analysis:
        "The trigger fires when processing volume reaches the level where the published rate becomes meaningfully more expensive than interchange-plus could be. Most customers never hit this; Stripe captures the upgrade conversation at the scale where margin economics shift.",
    },
    whatsWorking: [
      "Single published rate is the simplest possible pricing decision, which converts faster than any tiered alternative.",
      "Round percentage (2.9%) is memorable and signals confidence — '2.87%' would invite comparison-shopping mental math.",
      "No monthly base fee removes commitment friction for indie buyers evaluating against PayPal or Square.",
      "Add-on products on their own pages prevent the main pricing from feeling cluttered, while still allowing Stripe to monetize the full product suite.",
      "Custom enterprise pricing is gatekept behind sales conversation, which captures large deals without exposing volume discounts to competitors.",
      "International pricing transparently published per country, building trust through specificity even when prices vary.",
    ],
    whatToAdapt: [
      "When your buyer is comparing multiple complex pricing pages, lead with the simplest legible price. Simplicity converts.",
      "Round, memorable headline percentages signal confidence; odd numbers invite comparison-shopping.",
      "Price add-on products on their own pages rather than as tiers on the main pricing surface. Pricing-page real estate is precious.",
    ],
    whatToAvoid: [
      "Do not adopt flat per-transaction pricing without understanding interchange costs. The math only works at certain volume bands.",
      "Do not omit a custom tier when your business has enterprise customers. Published pricing must end where negotiation begins, with a clear handoff.",
      "Do not assume single-line pricing works for every category. Some buyers expect tier structures and read flat pricing as lack of feature differentiation.",
    ],
    brunsonLens: {
      stack: "No stack — single rate is the entire offer. Bundling happens at the product-portfolio level (separate pricing pages for separate products).",
      valueLadder: "Single rung for standard pricing, custom rung for enterprise; add-on products form a parallel ladder of their own.",
      decoyOrAnchor: "Absent anchor — the simplicity IS the anchor. The page deliberately avoids inviting comparison shopping.",
      paymentMechanics: "Per-transaction percentage plus fixed fee; revenue scales perfectly with customer revenue.",
    },
    faqs: [
      {
        q: "Why does Stripe publish such a simple rate?",
        a: "Because most of Stripe's competitors (PayPal, Braintree, legacy processors) have complex pricing that requires evaluation. A single published rate is the fastest possible pricing decision, which converts faster than detailed feature comparison ever could.",
      },
      {
        q: "Should every SaaS use flat per-transaction pricing?",
        a: "Only if your unit economics support a flat percentage AND the per-transaction model maps to customer value. Stripe's flat rate works because interchange costs are predictable at volume; copying the model without that floor produces unit-economics failures.",
      },
      {
        q: "What is the Brunson lens on Stripe's pricing?",
        a: "Single-rung Value Ladder for standard pricing with a custom enterprise rung gated by sales conversation. The Brunson 'Stack' move is absent because the offer is intentionally minimal — Stripe is selling simplicity as the differentiator, and stacking would contradict the positioning.",
      },
      {
        q: "Why are Stripe's add-on products priced on their own pages?",
        a: "Because each product (Connect, Tax, Radar, Billing) is genuinely a separate product with its own buyer evaluation. Cluttering the main pricing page with every product would dilute the simplicity that converts the core payments buyer.",
      },
    ],
    tags: ["flat-rate", "transactional", "simplicity", "absent-anchor", "developer-tools"],
    homepageUrl: "https://stripe.com/",
    pricingPageUrl: "https://stripe.com/pricing",
    lastVerified: "2026-05-17",
  },
];

// Indexed lookup. Module-level Map for O(1) access.
const PRICING_TEARDOWNS_BY_SLUG: Map<string, PricingTeardown> = new Map(
  PRICING_TEARDOWNS_LIST.map((t) => [t.slug, t]),
);

/** Read-only catalog. Iteration order is canonical. */
export const PRICING_TEARDOWNS: ReadonlyArray<PricingTeardown> =
  PRICING_TEARDOWNS_LIST;

/** Slug list for generateStaticParams and sitemap.ts. */
export const PRICING_TEARDOWN_SLUGS: ReadonlyArray<string> =
  PRICING_TEARDOWNS_LIST.map((t) => t.slug);

export function getPricingTeardownBySlug(
  slug: string,
): PricingTeardown | undefined {
  return PRICING_TEARDOWNS_BY_SLUG.get(slug);
}

/**
 * Related pricing teardowns by tag overlap. Same shape as the
 * funnel-teardowns helper so the route templates can stay symmetric.
 */
export function getRelatedPricingTeardowns(
  slug: string,
  limit: number = 4,
): ReadonlyArray<PricingTeardown> {
  const seed = PRICING_TEARDOWNS_BY_SLUG.get(slug);
  if (!seed) return [];
  const seedTags = new Set(seed.tags);

  const scored = PRICING_TEARDOWNS_LIST.filter((t) => t.slug !== slug)
    .map((t) => {
      const overlap = t.tags.filter((tag) => seedTags.has(tag)).length;
      return { teardown: t, overlap };
    })
    .filter((x) => x.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap);

  return scored.slice(0, limit).map((x) => x.teardown);
}

/**
 * Group pricing teardowns by category for the hub. Maintains catalog
 * ordering within each category bucket.
 */
export function groupPricingTeardownsByCategory(): ReadonlyArray<{
  category: string;
  teardowns: ReadonlyArray<PricingTeardown>;
}> {
  const order: string[] = [];
  const buckets: Map<string, PricingTeardown[]> = new Map();
  for (const t of PRICING_TEARDOWNS_LIST) {
    if (!buckets.has(t.category)) {
      buckets.set(t.category, []);
      order.push(t.category);
    }
    buckets.get(t.category)!.push(t);
  }
  return order.map((category) => ({
    category,
    teardowns: buckets.get(category)!,
  }));
}

/**
 * Cross-pattern helper: does this slug also have a funnel teardown?
 * Used by the funnel-teardown detail page to render a "Also see pricing
 * teardown" link when both teardowns exist for the same company.
 */
export function hasPricingTeardown(slug: string): boolean {
  return PRICING_TEARDOWNS_BY_SLUG.has(slug);
}
