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
 * Brunson pricing-lens — the same four levers the Playbook applies when
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

  {
    slug: "plausible",
    displayName: "Plausible Analytics",
    creator: "Uku Taht and Marko Saric",
    category: "Privacy analytics",
    oneLine:
      "Plausible's pricing scales by pageviews. The visible revenue page is itself a pricing argument: customers can see what they're paying into.",
    tldr:
      "Plausible prices on pageviews with a sliding scale, plus a self-hosted free option under their license. The public revenue dashboard turns the pricing model into proof — buyers see real customers paying real money before they decide. The lesson for indie founders: when transparency is the brand, the pricing page should let buyers see what they're buying into, not just what they're paying.",
    productSnapshot: {
      whatTheySell:
        "A privacy-focused, cookie-free web analytics SaaS positioned as the ethical alternative to Google Analytics.",
      whoFor:
        "Indie founders, small SaaS, and privacy-leaning teams who do not want cookie banners or GDPR overhead.",
    },
    pricingStructure: {
      model: "Volume-tiered subscription scaled by monthly pageviews; self-host free under AGPL",
      tiers: [
        {
          name: "Hosted (volume-tiered)",
          pricePoint:
            "starts at ~$9/mo for 10K pageviews/mo; scales linearly to enterprise volumes (verified 2026-05-17)",
          includes:
            "Cookieless analytics, custom events, multi-site, team features at higher volumes, all dashboards, public-share links.",
          audience: "Indie SaaS, small teams, privacy-leaning operators.",
        },
        {
          name: "Self-host",
          pricePoint: "$0 (AGPL license)",
          includes:
            "Full open-source code, run your own infrastructure, no Plausible fee. Maintenance is on you.",
          audience: "Developers and principled buyers who refuse hosted SaaS.",
        },
        {
          name: "Custom (enterprise volume)",
          pricePoint: "Custom contact for very high volumes",
          includes:
            "Negotiated rate, dedicated infrastructure, SLA conversations.",
          audience: "Larger operators above the published volume tiers.",
        },
      ],
      paymentFrequency: "Monthly or annual with annual discount; tier re-evaluated by actual monthly pageviews",
      freeTrialBehavior:
        "30-day free trial on hosted; self-host is free in perpetuity (no trial needed).",
    },
    anchorAnalysis: {
      pattern: "Transparency-as-anchor",
      analysis:
        "Plausible's anchor mechanic is unusual: the published revenue dashboard at plausible.io/revenue functions as a social-proof anchor. A buyer comparing privacy analytics tools sees Plausible's actual MRR and customer count, which converts the abstract question 'is this credible' into the concrete fact 'these many other people are paying this much'. The pricing page itself is straightforward volume-tiered; the anchor work happens on the revenue page.",
    },
    upgradeTrigger: {
      pattern: "Pageview-cap volume threshold",
      analysis:
        "The structural trigger is volume — buyers move up the tier ladder as their pageviews grow. There is no feature-gate trigger because all tiers include the full feature set. This aligns the bill with customer success (more pageviews = more value) and removes feature-comparison friction.",
    },
    whatsWorking: [
      "Public revenue dashboard turns pricing into proof — buyers can verify the model works at scale before committing.",
      "Volume tiering aligns the bill with customer success and platform cost simultaneously.",
      "Same feature set across all tiers removes feature-comparison friction.",
      "Self-host at $0 captures the principled buyer who would reject hosted SaaS.",
      "Open-source code makes the platform's privacy claims verifiable, not just stated.",
      "Annual discount is sized to materially shift commitment without forcing the choice on monthly buyers.",
    ],
    whatToAdapt: [
      "If transparency is your brand, make at least one operational fact public (revenue, MRR, signup count). Visible proof beats marketing copy.",
      "Volume-tiered pricing with the same feature set across tiers removes evaluation friction when the platform cost scales with usage.",
      "A self-host or escape-hatch option captures principled buyers without giving up hosted revenue.",
    ],
    whatToAvoid: [
      "Do not publish revenue if it is flat or declining; transparency works against you in that case.",
      "Do not tier on pageviews if your unit economics do not actually scale with pageviews.",
      "Do not offer self-host if you cannot sustain the open-source project long-term; stale repos hurt trust more than no repo.",
    ],
    brunsonLens: {
      stack: "Single-feature-set stack — every tier includes the same capabilities; the tier difference is volume.",
      valueLadder: "Two-rung Value Ladder (hosted plus self-host) with an off-ladder enterprise option for very large volumes.",
      decoyOrAnchor: "Transparency-as-anchor: the public revenue page does the social-proof work pricing-tier anchors usually do.",
      paymentMechanics: "Monthly or annual subscription scaled by pageview tier; perpetual free for self-host.",
    },
    faqs: [
      {
        q: "Why does Plausible publish their revenue?",
        a: "Because the revenue page IS the pricing argument. Buyers comparing privacy analytics platforms can verify that Plausible is a real, growing business with real paying customers — which converts the abstract 'is this credible' question into a concrete fact. Public revenue is unusual pricing-page strategy but works precisely because most competitors do not do it.",
      },
      {
        q: "Should every SaaS publish revenue?",
        a: "Only if revenue is growing AND if transparency aligns with your brand. Public revenue from a flat or declining business converts against you. Plausible's revenue page works because the trajectory matches the privacy-conscious indie-friendly brand the rest of the marketing makes.",
      },
      {
        q: "Why is the feature set the same across paid tiers?",
        a: "Because the platform cost scales with pageviews, not with features. Tiering on volume rather than features means buyers do not feel punished for needing scale, and the platform captures more revenue from the customers using more of the infrastructure.",
      },
      {
        q: "What is the Brunson lens on Plausible's pricing?",
        a: "Two-rung Value Ladder with transparency-as-anchor instead of psychological tier anchoring. The Brunson 'borrowed authority' move is executed through visible operational facts (revenue) rather than through customer logos. Unusual but effective when the brand earns the right to use it.",
      },
    ],
    tags: ["volume-tiered", "transparency", "open-source", "self-host"],
    homepageUrl: "https://plausible.io/",
    pricingPageUrl: "https://plausible.io/pricing",
    lastVerified: "2026-05-17",
  },

  {
    slug: "mintlify",
    displayName: "Mintlify",
    creator: "Han Wang and Hahnbee Lee",
    category: "Developer documentation",
    oneLine:
      "Mintlify prices on editor seats and reserves the most valuable feature (AI search) for higher tiers. The free-OSS tier feeds the customer-roster flywheel.",
    tldr:
      "Mintlify's pricing is per-editor with a free tier for open-source projects and graduated paid tiers for teams. The most valuable forward-looking feature (AI-powered search and Q&A) is reserved for higher tiers, creating an upgrade trigger as customer expectations evolve. The lesson for indie founders: gate the future-state feature, not the table-stakes one — buyers upgrade for capability they do not yet have, not for what they take for granted.",
    productSnapshot: {
      whatTheySell:
        "A documentation-as-code platform that turns Markdown plus components into a polished docs site with search, analytics, and AI-assisted answers.",
      whoFor:
        "Developer-tool SaaS, API companies, and platforms that want documentation that looks intentional rather than templated.",
    },
    pricingStructure: {
      model: "Per-editor seat tiered subscription with free OSS tier",
      tiers: [
        {
          name: "Free (OSS)",
          pricePoint: "$0 for open-source projects",
          includes:
            "Hosting, custom domain, OpenAPI imports, basic analytics, Mintlify branding.",
          audience: "Open-source projects building public docs.",
        },
        {
          name: "Pro",
          pricePoint: "approximately $150/mo (verified 2026-05-17)",
          includes:
            "Unlimited editor seats up to plan limit, AI chat, analytics, custom domain, no Mintlify branding.",
          audience: "Small dev-tool companies and SaaS docs teams.",
        },
        {
          name: "Growth",
          pricePoint: "approximately $550/mo (verified 2026-05-17)",
          includes:
            "Higher seat limits, advanced AI features, SSO, advanced analytics, priority support.",
          audience: "Growing dev-tool companies with multiple editors.",
        },
        {
          name: "Enterprise",
          pricePoint: "Custom (sales contact)",
          includes:
            "Custom seat counts, SAML, audit logs, dedicated success manager, custom contracts.",
          audience: "Larger organizations with procurement requirements.",
        },
      ],
      paymentFrequency: "Monthly or annual with annual discount",
      freeTrialBehavior:
        "Free OSS tier IS the trial for open-source projects. Paid tiers can be trialed via direct conversation; standard self-serve evaluation is mostly via the OSS tier or a sandbox.",
    },
    anchorAnalysis: {
      pattern: "Growth tier as anchor",
      analysis:
        "The Growth tier at approximately $550/mo anchors the page for serious dev-tool companies, making Pro at approximately $150/mo read as the reasonable starting tier. The free OSS tier is the entry; Enterprise sits ready for procurement. Anchoring is conventional; the unusual move is the AI-feature gating that makes upgrading a forward-looking decision rather than a feature-gap fix.",
    },
    upgradeTrigger: {
      pattern: "AI feature gating and brand removal",
      analysis:
        "Two upgrade triggers work together: brand removal (the OSS free tier carries Mintlify branding; Pro removes it) for buyers ready to publish to a marketing-grade audience, and AI feature gating (search, chat, advanced AI) for buyers whose users expect LLM-powered docs. The AI trigger is forward-looking — buyers upgrade for capability that becomes table-stakes over the next year, not for a feature they already need.",
    },
    whatsWorking: [
      "Free OSS tier seeds visible-customer presence across the dev-tool category — every Mintlify-built docs site advertises the platform.",
      "Brand removal as Pro trigger aligns with the moment a buyer is ready to publish without third-party branding.",
      "AI feature gating creates a forward-looking upgrade trigger — buyers upgrade for capability that becomes expected, not for missing basics.",
      "Per-editor pricing on Pro and Growth captures revenue from teams as they scale.",
      "Visible customer roster on the marketing surface (Anthropic, Cursor, Resend) borrows authority from category-recognizable companies.",
    ],
    whatToAdapt: [
      "Gate the forward-looking feature, not the table-stakes one. Buyers upgrade for what they do not yet have but will soon need.",
      "Use a free tier with branding to seed visible-customer presence; remove branding at the trigger where the buyer's willingness to pay structurally spikes.",
      "Per-editor pricing works when each editor produces value the team consumes; combine with visible customer roster for compounding authority.",
    ],
    whatToAvoid: [
      "Do not gate features your buyer already considers table-stakes; the gating reads as nickel-and-diming and lowers trust.",
      "Do not free OSS without the bandwidth to support OSS users; bad OSS support poisons the customer-roster flywheel.",
      "Do not adopt per-editor pricing if seats do not get clear individual value.",
    ],
    brunsonLens: {
      stack: "Tiered stack with progressive AI features per rung; Growth tier is the visual anchor.",
      valueLadder: "Four-rung ladder (Free OSS → Pro → Growth → Enterprise) with AI as forward-state continuity feature.",
      decoyOrAnchor: "Growth as anchor; Pro as the visible starting tier; Free OSS as visible-customer flywheel seed.",
      paymentMechanics: "Per-editor monthly or annual with annual discount; no usage metering on docs traffic.",
    },
    faqs: [
      {
        q: "Why does Mintlify gate AI features behind paid tiers?",
        a: "Because AI-powered docs is the future-state expectation that buyers are upgrading toward, not the past-state baseline. Gating the forward-looking feature creates an upgrade trigger that fires as customer expectations evolve, which is more durable than gating an existing feature that buyers already expect.",
      },
      {
        q: "Is the OSS free tier really free forever?",
        a: "Yes for genuinely open-source projects. The OSS tier is calibrated as both a community-building investment and a visible-customer acquisition channel. The economics work because every OSS Mintlify docs site is a free advertisement for the paid Pro tier.",
      },
      {
        q: "Should an indie SaaS gate AI features the same way?",
        a: "Only if AI is genuinely forward-looking for your audience. For some audiences AI is already baseline; for others it is still novel. Gate features your buyer is moving TOWARD, not features they already expect.",
      },
      {
        q: "What is the Brunson lens on Mintlify's pricing?",
        a: "Four-rung Value Ladder with two simultaneous upgrade triggers (brand removal and AI features) and a free OSS rung that seeds visible-customer presence. The forward-looking-feature gating is the unusual move — it converts the pricing page from a fix-what-is-missing decision to a buy-what-you-want-to-become decision.",
      },
    ],
    tags: ["per-editor", "forward-feature-gating", "free-oss", "borrowed-authority"],
    homepageUrl: "https://mintlify.com/",
    pricingPageUrl: "https://mintlify.com/pricing",
    lastVerified: "2026-05-17",
  },

  {
    slug: "senja",
    displayName: "Senja",
    creator: "Senja team",
    category: "Testimonial collection",
    oneLine:
      "Senja prices the structural moment willingness-to-pay spikes: when the founder is ready to put testimonials on the public marketing site without the third-party brand.",
    tldr:
      "Senja's pricing is structured around brand removal as the upgrade trigger. The free tier collects and displays testimonials with a Senja attribution; paid tiers remove the attribution and add video, customization, and team features. The lesson for indie founders: when the buyer's willingness to pay spikes at a specific behavioral moment (here: publishing to their own marketing surface), price the trigger.",
    productSnapshot: {
      whatTheySell:
        "A testimonial collection, video review, and social-proof display platform for SaaS, agencies, and creators.",
      whoFor:
        "Indie SaaS, agencies, and creators who need video and text testimonials displayed cleanly on their marketing site.",
    },
    pricingStructure: {
      model: "Freemium with brand-removal upgrade trigger",
      tiers: [
        {
          name: "Free (Starter)",
          pricePoint: "$0",
          includes:
            "Text and video testimonial collection, basic Wall of Love widget, Senja branding visible, limited integrations.",
          audience: "Indie founders collecting first testimonials before publishing.",
        },
        {
          name: "Starter (paid)",
          pricePoint: "approximately $19/mo (verified 2026-05-17)",
          includes:
            "Brand removal, custom forms, custom Wall of Love, video uploads, more integrations.",
          audience: "Indie SaaS ready to publish testimonials on the marketing site.",
        },
        {
          name: "Premium",
          pricePoint: "approximately $59/mo (verified 2026-05-17)",
          includes:
            "Team workspace, advanced customization, video editing, embed analytics, API access.",
          audience: "Agencies and SaaS with multiple team members managing testimonials.",
        },
        {
          name: "Enterprise",
          pricePoint: "Custom (sales contact)",
          includes:
            "Custom contracts, SSO, dedicated support, larger limits.",
          audience: "Larger organizations or agencies serving many clients.",
        },
      ],
      paymentFrequency: "Monthly or annual with annual discount",
      freeTrialBehavior:
        "Free tier IS the trial; paid features can be sampled via a brief trial on signup.",
    },
    anchorAnalysis: {
      pattern: "Brand-removal-trigger anchor",
      analysis:
        "Senja's pricing-page center of gravity is the brand-removal trigger between Free and Starter. The Premium tier at approximately $59/mo anchors above, making Starter at approximately $19/mo read as the natural choice for the indie buyer. The structural upgrade trigger (publishing to marketing site without Senja branding) does most of the work; the anchor mechanics support it but are not the primary driver.",
    },
    upgradeTrigger: {
      pattern: "Brand removal at marketing-surface publication",
      analysis:
        "The trigger fires when the founder decides to put testimonials on a public marketing surface (landing page, product page, sales page). At that moment, the Senja attribution becomes a visible cost (it appears on the founder's marketing site) and willingness to pay structurally spikes. The trigger is precisely calibrated to the behavioral moment of maximum buyer surplus.",
    },
    whatsWorking: [
      "Brand-removal trigger aligns the upgrade moment with structural willingness-to-pay spike.",
      "Free tier with branding feeds the visible-customer flywheel — every Senja widget on someone else's marketing site is an ad.",
      "Premium tier anchors the price ladder while Starter captures the indie-founder mainstream.",
      "Universal-pain category (testimonials) removes the awareness-stage funnel work; buyers arrive already qualified.",
      "Video-first positioning lands the high-conversion testimonial format as a differentiator on Starter and above.",
    ],
    whatToAdapt: [
      "Identify the specific behavioral moment where buyer willingness-to-pay spikes, and price the trigger.",
      "Free-with-branding works when the branding is on the customer's public marketing surface (not on internal-only screens) — the attribution becomes a visible cost the buyer eventually wants to remove.",
      "If you serve a universal-pain category, skip the awareness-stage marketing and lead with the offer.",
    ],
    whatToAvoid: [
      "Do not free-with-branding if your output is not public; if buyers do not see the attribution on their own marketing surface, the upgrade trigger never fires.",
      "Do not free-tier features your paid tier depends on. The paid trigger must be a real value gap, not an annoyance.",
      "Do not adopt universal-pain positioning if your buyer does not yet recognize the pain; you need story-led marketing to teach the pain first.",
    ],
    brunsonLens: {
      stack: "Modest stack — free tier is functional, paid tiers extend without dramatically restructuring value.",
      valueLadder: "Four-rung ladder (Free → Starter → Premium → Enterprise) with brand removal as the structural front-end trigger.",
      decoyOrAnchor: "Premium tier as anchor; Starter as the indie-friendly mainstream; Free as flywheel seed.",
      paymentMechanics: "Monthly or annual subscription; no usage metering or per-seat scaling below Premium tier.",
    },
    faqs: [
      {
        q: "Why does Senja's free tier require keeping the Senja brand?",
        a: "Because the visible attribution IS the marketing channel that funds the free tier. Every Senja widget on a customer's marketing site exposes the platform to that customer's audience. The trade-off is explicit: free becomes possible because branding compounds; remove branding becomes the upgrade trigger.",
      },
      {
        q: "Should an indie SaaS adopt brand-removal pricing?",
        a: "Only when your output is published on a customer's public marketing surface. Form tools, testimonial tools, video tools, link-in-bio tools all work. Internal SaaS, dashboards, admin tools do not — the attribution is invisible to anyone but the buyer.",
      },
      {
        q: "Why is the Premium tier so much more expensive than Starter?",
        a: "Premium serves a different buyer (agency or team) with team-collaboration features. Pricing it well above Starter is intentional anchoring — it makes Starter read as the indie choice and Premium as the professional choice. The price gap reinforces the segment difference.",
      },
      {
        q: "What is the Brunson lens on Senja's pricing?",
        a: "Brand-removal-trigger Value Ladder with visible-customer-flywheel free tier. The structural trigger does most of the conversion work, with conventional tier anchoring supporting. The Brunson 'price the willingness-to-pay spike, not the feature gap' move is executed cleanly here.",
      },
    ],
    tags: ["brand-removal-trigger", "visible-customer", "freemium", "social-proof"],
    homepageUrl: "https://senja.io/",
    pricingPageUrl: "https://senja.io/pricing",
    lastVerified: "2026-05-17",
  },

  {
    slug: "polar",
    displayName: "Polar",
    creator: "Birk Jernström and team",
    category: "Creator monetization and payments",
    oneLine:
      "Polar prices as percentage-of-revenue with no monthly base. The model aligns the platform's incentives with the creator's success.",
    tldr:
      "Polar prices as a single percentage of revenue with Merchant of Record included. There is no monthly subscription fee — Polar makes money when the creator makes money. The lesson for indie founders: when your customer's revenue is the primary value driver AND the platform cost scales with their success, revenue-share pricing removes commitment friction and aligns incentives.",
    productSnapshot: {
      whatTheySell:
        "A Merchant of Record platform with subscription, sponsorship, and licensing features designed for open-source maintainers and creators.",
      whoFor:
        "Open-source maintainers, creators, and indie developers who want monetization plus compliance without separately wiring Stripe and a tax platform.",
    },
    pricingStructure: {
      model: "Pure percentage-of-revenue with no monthly base; MoR bundled",
      tiers: [
        {
          name: "Standard",
          pricePoint:
            "approximately 4% + Stripe fees per transaction with MoR included (verified 2026-05-17)",
          includes:
            "Hosted checkout, subscriptions, sponsorships, licensing, customer portal, global tax compliance, GitHub integration.",
          audience: "Open-source maintainers, indie creators, solo developers monetizing globally.",
        },
        {
          name: "Custom (high volume)",
          pricePoint: "Negotiated rate at higher volumes",
          includes:
            "Same feature set with volume-discounted percentage; sales conversation.",
          audience: "Higher-volume creators or platforms.",
        },
      ],
      paymentFrequency: "Per-transaction; no monthly base fee",
      freeTrialBehavior:
        "No subscription to trial — pricing is purely transactional. Account is free to create; you pay only when you collect.",
    },
    anchorAnalysis: {
      pattern: "No-anchor minimalism",
      analysis:
        "Polar's pricing has no tier-anchor mechanics because there are no tiers in the traditional sense. The published rate is one line: approximately 4% + Stripe fees. The simplicity is the anchor — buyers comparing Polar to Stripe-plus-Paddle-Tax-plus-Lemon-Squeezy see one number and convert without further analysis. The absence of complexity IS the conversion driver.",
    },
    upgradeTrigger: {
      pattern: "No upgrade trigger by design",
      analysis:
        "Polar has no internal upgrade ladder. The structural trigger that drives buyers TO Polar is the first international sale that exposes them to VAT or sales-tax registration overhead. Polar's pricing is calibrated to be cheaper than the time-cost of handling compliance themselves. Once a creator is on Polar, there is no upgrade pressure — only volume-discount conversations at scale.",
    },
    whatsWorking: [
      "Pure percentage-of-revenue removes monthly commitment friction for early-stage creators.",
      "No-tier pricing makes the decision binary: use Polar or do not. No internal evaluation required.",
      "Revenue-share alignment makes Polar's incentives match the creator's: the platform only wins when the creator wins.",
      "MoR bundle hides the per-feature comparison against Stripe; buyers evaluate on outcome (compliance handled).",
      "GitHub-native integration removes setup friction every maintainer expects to deal with.",
      "Round-ish percentage (4%) is memorable and signals confidence.",
    ],
    whatToAdapt: [
      "If your customer's revenue is the primary value driver, revenue-share pricing aligns incentives and removes commitment friction.",
      "Single-line published pricing removes evaluation friction when your buyer is comparing complex tiered alternatives.",
      "Bundle compatible services at one rate to escape per-feature comparison shootouts.",
    ],
    whatToAvoid: [
      "Do not adopt revenue-share if your unit economics do not actually scale with customer revenue.",
      "Do not adopt MoR positioning without the legal and operational capacity. MoR is a regulatory commitment, not a marketing one.",
      "Do not skip a custom tier when you have enterprise customers; published pricing must end where negotiation begins.",
    ],
    brunsonLens: {
      stack: "No stack — single-line rate is the entire offer. Add-on features (sponsorships, licensing) are included at the same rate.",
      valueLadder: "Single transactional rung with custom enterprise option; no front-end free, no high-ticket back-end.",
      decoyOrAnchor: "No anchor — simplicity IS the anchor. The page deliberately avoids inviting comparison shopping.",
      paymentMechanics: "Pure percentage-of-revenue; no monthly base, no per-seat, perfectly aligned with customer success.",
    },
    faqs: [
      {
        q: "Why does Polar have no monthly fee?",
        a: "Because monthly fees create commitment friction for creators who do not yet know how much they will sell. Pure percentage-of-revenue means a creator can list a product, sell zero, and pay zero — which lowers the barrier to trying Polar. The platform monetizes when the creator monetizes.",
      },
      {
        q: "Should every payments SaaS use revenue-share pricing?",
        a: "Only if your platform cost scales with customer revenue (per-transaction infrastructure, tax compliance, customer service load). Pure infrastructure platforms (raw Stripe) work fine on flat percentages; bundled service platforms (MoR, full-stack creator monetization) work better on revenue share because the service load scales.",
      },
      {
        q: "Is Polar's rate higher than Stripe's?",
        a: "Marginally, in exchange for MoR service (tax compliance, legal seller of record). For creators selling internationally and dealing with VAT, the rate gap is usually cheaper than the time-cost of compliance. For domestic-only creators with simple tax situations, raw Stripe is cheaper.",
      },
      {
        q: "What is the Brunson lens on Polar's pricing?",
        a: "Single-rung transactional Value Ladder with revenue-share mechanics and no anchor work. The minimal-anchor approach is intentional — Polar's positioning is 'we make money when you make money,' which only works if the pricing itself feels frictionless. Adding tiers would contradict the positioning.",
      },
    ],
    tags: ["revenue-share", "transactional", "single-line", "mor", "creator-tools"],
    homepageUrl: "https://polar.sh/",
    pricingPageUrl: "https://polar.sh/pricing",
    lastVerified: "2026-05-17",
  },

  {
    slug: "screen-studio",
    displayName: "Screen Studio",
    creator: "Adam Pietrasiak",
    category: "Screen recording for marketing video",
    oneLine:
      "Screen Studio prices one-time at a premium. No subscription, no tiers, no upsells — the simplest possible offer.",
    tldr:
      "Screen Studio is sold as a one-time license at approximately $229 with optional yearly updates. There is no subscription, no tier ladder, no usage limit. The lesson for indie founders: when your product produces a discrete output and has no ongoing infrastructure cost, one-time pricing escapes subscription fatigue and converts buyers who would reject monthly recurring on principle.",
    productSnapshot: {
      whatTheySell:
        "A macOS screen recording app that auto-zooms, smooths cursor motion, and produces high-quality marketing videos from raw screen captures.",
      whoFor:
        "Indie SaaS founders, designers, and creators producing product demos and tutorial videos who do not want to learn video editing software.",
    },
    pricingStructure: {
      model: "Single one-time license with optional yearly update subscription",
      tiers: [
        {
          name: "License",
          pricePoint: "approximately $229 one-time (verified 2026-05-17)",
          includes:
            "Full Screen Studio app, one year of free updates, perpetual use of the version at purchase.",
          audience: "Indie operators, designers, marketers producing marketing video.",
        },
        {
          name: "Yearly updates renewal",
          pricePoint: "Optional, approximately $79/year for continued updates after the first year",
          includes:
            "Continued access to new features and major releases beyond the initial year.",
          audience: "Customers who want to keep current with new features after the first year.",
        },
      ],
      paymentFrequency: "One-time payment for license; optional yearly renewal for continued updates",
      freeTrialBehavior:
        "Free trial available before purchase; the output sample on the homepage IS the demo for most buyers.",
    },
    anchorAnalysis: {
      pattern: "Single-line premium anchor",
      analysis:
        "Screen Studio's pricing has no internal anchor mechanics — there are no tiers to anchor between. The premium one-time price (approximately $229) anchors against subscription competitors: a buyer comparing Screen Studio at $229 one-time against Loom or Tella at $10-20/month sees a 12-24 month payback. For professionals whose video output reflects on their brand, that math works. The single price line IS the entire pricing argument.",
    },
    upgradeTrigger: {
      pattern: "No upgrade trigger by design",
      analysis:
        "There is no internal upgrade ladder. The optional yearly update renewal is the only secondary purchase decision, and it fires after the first year as a continuity option for buyers who want new features. Most customers continue using the version they purchased without renewing. The absence of upgrade pressure is intentional — Screen Studio sells the artifact, not the relationship.",
    },
    whatsWorking: [
      "One-time pricing escapes subscription fatigue and converts buyers who reject monthly recurring on principle.",
      "Premium price screens out casual buyers but is trivial for any working professional.",
      "Single-line pricing removes evaluation friction entirely.",
      "Solo-founder identity (Adam Pietrasiak) signals 'buy from a person you can find,' which the indie buyer audience trusts.",
      "Output sample on the homepage IS the trial — autoplaying demo converts visitors who can see the output is what they need.",
      "Optional renewal model captures continuing revenue without forcing it.",
    ],
    whatToAdapt: [
      "Consider one-time pricing for tools that produce discrete outputs rather than ongoing utility. Subscription is not the only valid model.",
      "Premium one-time pricing converts the working-professional buyer who would resist subscription but accepts a clear capital expense.",
      "If you are a solo founder, lead with your face, name, and output. Indie buyers trust a person more than a faceless brand.",
    ],
    whatToAvoid: [
      "Do not use one-time pricing for tools that require ongoing infrastructure costs (servers, send volume, API calls). The economics fail.",
      "Do not adopt premium pricing if your buyer is a casual user. The screening effect works against you.",
      "Do not adopt solo-founder positioning if you are not solo; the trust signal is fake and customers eventually find out.",
    ],
    brunsonLens: {
      stack: "No stack — single price line, no upsells, no add-ons. The simplest possible Value Ladder.",
      valueLadder: "Single transactional rung with optional continuity (yearly updates).",
      decoyOrAnchor: "External anchor against subscription competitors; no internal anchor mechanics.",
      paymentMechanics: "One-time payment with optional yearly continuity; no recurring revenue model by default.",
    },
    faqs: [
      {
        q: "Why does Screen Studio not have a subscription?",
        a: "Because the product is a discrete output tool with no ongoing infrastructure cost. A subscription would feel extractive for a tool the customer uses occasionally to produce specific videos. One-time pricing matches the value shape: customer pays once for the artifact-producing capability they keep forever.",
      },
      {
        q: "Should every creator tool be priced one-time?",
        a: "Only when the tool has no ongoing infrastructure cost AND when the buyer uses it sporadically rather than continuously. Subscription is the right model for tools that run continuously on the buyer's behalf (analytics, monitoring, email sending). Match the pricing model to the value shape.",
      },
      {
        q: "Why is Screen Studio priced so high relative to subscription competitors?",
        a: "Because one-time premium pricing screens for the professional buyer whose output reflects on their brand. Casual buyers reject the price; professionals see a 12-24 month payback against subscription competitors and the premium signals quality. The price IS the qualification mechanism.",
      },
      {
        q: "What is the Brunson lens on Screen Studio's pricing?",
        a: "Single-rung transactional Value Ladder with external-anchor mechanics against subscription competitors. The unusual move is the deliberate absence of upsells — Screen Studio sells the artifact-producing capability and trusts the customer to come back for the next version when ready. Minimal Brunson stack; maximum trust.",
      },
    ],
    tags: ["one-time", "solo-founder", "premium", "no-subscription", "marketing-tools"],
    homepageUrl: "https://www.screen.studio/",
    pricingPageUrl: "https://www.screen.studio/pricing",
    lastVerified: "2026-05-17",
  },

  {
    slug: "fathom",
    displayName: "Fathom Analytics",
    creator: "Jack Ellis and Paul Jarvis",
    category: "Privacy analytics",
    oneLine:
      "Fathom prices on pageviews with a 30-day trial. No self-host option, no public revenue dashboard — the price page leans on founder-led trust instead of operational transparency.",
    tldr:
      "Fathom's pricing structure is volume-tiered subscription scaled by monthly pageviews, with a 30-day free trial and no self-host option. The structural pricing decisions diverge from Plausible's: no open-source escape valve and no public revenue page. The trust load shifts to founder visibility (Jack Ellis and Paul Jarvis) instead of operational transparency. The lesson for indie founders: when founder-led-as-trust is your model, you can skip the operational-transparency proof — but you must sustain founder visibility forever.",
    productSnapshot: {
      whatTheySell:
        "A privacy-focused, cookie-free web analytics SaaS positioned as the ethical alternative to Google Analytics.",
      whoFor:
        "Indie founders, small SaaS, and privacy-leaning teams who do not want cookie banners or GDPR overhead, and who prefer buying from identifiable indie operators.",
    },
    pricingStructure: {
      model: "Volume-tiered subscription scaled by monthly pageviews; hosted only",
      tiers: [
        {
          name: "Hosted (volume-tiered)",
          pricePoint:
            "starts ~$15/mo for 100K pageviews/mo; scales linearly to enterprise (verified 2026-05-17)",
          includes:
            "Cookieless analytics, custom events, multi-site (single account covers up to 50 sites at lower tiers, more at higher), Wayback Machine integration, EU isolation option.",
          audience: "Indie SaaS, small teams, privacy-leaning operators.",
        },
        {
          name: "Custom (enterprise volume)",
          pricePoint: "Custom contact for very high volumes",
          includes:
            "Negotiated rate, dedicated infrastructure, SLA conversations, advanced support.",
          audience: "Larger operators above the published volume tiers.",
        },
      ],
      paymentFrequency: "Monthly or annual with annual discount; tier re-evaluated by actual monthly pageviews",
      freeTrialBehavior:
        "30-day free trial with no credit card required; converts to paid or expires.",
    },
    anchorAnalysis: {
      pattern: "Founder-led-trust anchor",
      analysis:
        "Fathom's pricing page does not anchor through a public revenue dashboard (like Plausible) or through an explicit decoy tier. The anchor mechanic is implicit: Jack and Paul are visible enough across the marketing surface and broader content that buyers anchor on founder credibility rather than on price-comparison logic. The simplicity of the pricing matches the brand voice — founders who trust the operators do not require complex pricing arguments.",
    },
    upgradeTrigger: {
      pattern: "30-day trial expiration plus pageview growth",
      analysis:
        "Two triggers fire together: the 30-day trial creates a binary conversion moment (subscribe or stop using); pageview growth then drives tier upgrades within the paid customer base. The trial-expiration trigger is mechanical and the volume-tier upgrade is structural. Both align with how indie SaaS founders actually evaluate analytics tools.",
    },
    whatsWorking: [
      "Founder-led-trust replaces the operational-transparency proof Plausible uses — same trust outcome, different mechanism.",
      "30-day trial with no credit card removes friction at the highest-friction moment in the funnel.",
      "Volume tiering aligns the bill with customer success without exposing the buyer to per-event metering surprise.",
      "Same principle stack as Plausible (privacy, GDPR-by-construction, cookie-free) — both companies validate the category together.",
      "No self-host option simplifies the operations surface — every customer is on the same hosted infrastructure.",
      "EU isolation option for buyers with stricter data-residency needs adds a structural differentiator without complicating the main pricing page.",
    ],
    whatToAdapt: [
      "If founder-led-as-trust is your model, you can skip operational-transparency tools (public revenue, open-source) — but you must sustain founder visibility continuously.",
      "30-day trials with no credit card remove the canonical friction at signup; recover the conversion at trial-end with a clear payment prompt.",
      "Volume tiering aligns the bill with success when the underlying cost (your infrastructure) actually scales with the metric you tier on.",
    ],
    whatToAvoid: [
      "Do not adopt founder-led-trust as the only trust mechanism if the founders cannot sustain visibility. Without founders on the marketing surface, the model collapses.",
      "Do not skip self-host capability if your category buyers value it (open-source-aligned developers, privacy-extremists). The audience overlap with operational-transparency buyers matters.",
    ],
    brunsonLens: {
      stack: "Two-rung stack: hosted volume tiers plus enterprise custom. No add-on layer.",
      valueLadder: "Two-rung Value Ladder with trial-to-paid conversion as the front-end trigger.",
      decoyOrAnchor: "Founder-led-trust anchor — Jack and Paul replace explicit anchor-tier mechanics with brand credibility.",
      paymentMechanics: "Monthly or annual volume-tiered subscription; no usage metering surprise; no per-seat scaling.",
    },
    faqs: [
      {
        q: "How does Fathom's pricing differ from Plausible's?",
        a: "Same volume-tiered shape, similar price bands. The structural differences are operational: Fathom has no self-host option (Plausible does, via AGPL) and no public revenue dashboard (Plausible's is at plausible.io/revenue). Fathom anchors trust on founder visibility; Plausible anchors trust on operational transparency.",
      },
      {
        q: "Why does Fathom not offer self-host?",
        a: "Operationally simpler — every customer runs on the same hosted infrastructure, which keeps the team small and the support load predictable. The trade-off is losing the principled-buyer segment that requires self-host on principle. Plausible captures that segment; Fathom focuses on hosted-only buyers.",
      },
      {
        q: "Is the 30-day trial really no-credit-card?",
        a: "Yes, as of 2026-05-17. The friction removal at signup is meaningful for indie buyers evaluating multiple privacy-analytics options simultaneously. The trial-expiration prompt then asks for payment at the conversion-likely moment.",
      },
      {
        q: "What is the Brunson lens on Fathom's pricing?",
        a: "Two-rung Value Ladder with founder-led-trust as the anchor mechanic. The unusual move is the deliberate absence of operational-transparency tools (public revenue, open source) — Fathom bets that founder visibility is sufficient trust signal, which works because Jack and Paul sustain it continuously.",
      },
    ],
    tags: ["volume-tiered", "founder-led-trust", "trial-no-credit-card", "privacy-analytics"],
    homepageUrl: "https://usefathom.com/",
    pricingPageUrl: "https://usefathom.com/pricing",
    lastVerified: "2026-05-17",
  },

  {
    slug: "calendly",
    displayName: "Calendly",
    creator: "Tope Awotona",
    category: "Scheduling",
    oneLine:
      "Calendly prices on category-default mindshare. The free tier is the acquisition engine; per-user paid tiers scale into enterprise.",
    tldr:
      "Calendly's pricing structure is built around brand-default acquisition: free tier with the Calendly brand on every booking page seeds the visible-customer flywheel, and per-user paid tiers scale into enterprise with CRM integrations, advanced workflows, and SSO. The lesson for indie founders: free-tier acquisition compounds when the customer's output is publicly visible — but the moat depends on years of compounding to earn category-default status.",
    productSnapshot: {
      whatTheySell:
        "A scheduling platform for sales calls, demos, customer meetings, and recruiter coordination, with a Calendly-branded booking page recipients use.",
      whoFor:
        "Sales teams, recruiters, customer success managers, and any professional whose calendar coordination is high-volume.",
    },
    pricingStructure: {
      model: "Per-user tiered subscription with free-tier acquisition flywheel and enterprise upsell ladder",
      tiers: [
        {
          name: "Free",
          pricePoint: "$0",
          includes:
            "1 event type, basic scheduling, integrations with Google Calendar, Outlook, iCloud, Zoom, Meet, Calendly branding on booking page.",
          audience: "Individual users evaluating Calendly or scheduling at very low volume.",
        },
        {
          name: "Standard",
          pricePoint:
            "approximately $12/seat/mo billed annually (verified 2026-05-17)",
          includes:
            "Unlimited event types, group events, advanced customization, basic Salesforce + HubSpot integrations, removable branding option.",
          audience: "Individual professionals and small teams using scheduling daily.",
        },
        {
          name: "Teams",
          pricePoint:
            "approximately $20/seat/mo billed annually (verified 2026-05-17)",
          includes:
            "Round-robin, collective events, deeper CRM integrations, routing forms, advanced workflows, admin features.",
          audience: "Sales teams and small organizations with cross-member scheduling.",
        },
        {
          name: "Enterprise",
          pricePoint: "Custom (sales contact)",
          includes:
            "SSO, advanced security, audit logs, dedicated success manager, custom contracts, advanced governance.",
          audience: "Larger organizations with procurement requirements.",
        },
      ],
      paymentFrequency: "Monthly or annual with annual discount; per-user pricing",
      freeTrialBehavior:
        "Free tier IS the trial; paid features available on time-limited trial for evaluation.",
    },
    anchorAnalysis: {
      pattern: "Teams tier as anchor",
      analysis:
        "Teams at approximately $20/seat/mo anchors the page for the sales-team segment. Standard at approximately $12/seat/mo reads as the natural starting tier for individuals; Free is the entry. Enterprise sits ready for procurement-driven buyers. The anchor mechanic is conventional; the unusual structural element is the Calendly brand on free-tier booking pages, which doubles as the acquisition engine.",
    },
    upgradeTrigger: {
      pattern: "Event-type cap plus team-feature need",
      analysis:
        "Two triggers fire together: the 1 event type cap on Free forces individual users to upgrade to Standard when they need more than one booking type; the team-feature need (round-robin, collective events, deeper CRM integrations) drives Standard users to Teams. Both triggers map to natural usage growth, which is why Calendly's conversion rates compound over time as customers grow into deeper use.",
    },
    whatsWorking: [
      "Free tier with branding seeds visible-customer flywheel — every shared Calendly link reinforces the brand to a new recipient.",
      "1 event type cap on Free is a structural upgrade trigger that fires the moment a user needs a second booking type.",
      "Per-user pricing aligns revenue with team-scale growth without per-feature complexity.",
      "Enterprise tier captures the largest deals without exposing volume-discount pricing to seat-counting competitors.",
      "CRM integration depth (Salesforce, HubSpot, Marketo) at higher tiers locks in enterprise customers who built workflows around the platform.",
      "Cross-functional positioning (sales, recruiting, success, education) broadens the addressable market — only sustainable for the category default.",
    ],
    whatToAdapt: [
      "Free tier with branding is the most efficient acquisition channel when your customer's output is publicly visible (booking pages, form embeds, video links).",
      "Structural upgrade triggers (event-type caps, team-feature gates) compound conversion as usage grows naturally.",
      "Per-user pricing scales with customer success and avoids the per-feature comparison shopping that tiered-feature pricing creates.",
    ],
    whatToAvoid: [
      "Do not assume free-tier branding works if your output is not publicly visible. The flywheel requires customers to share the branded surface with their audience.",
      "Do not adopt category-default positioning before you have earned the recognition. New entrants need to lead with the structural differentiator, not the brand.",
    ],
    brunsonLens: {
      stack: "Four-tier stack with progressive feature additions; Teams tier is the visual anchor.",
      valueLadder: "Full four-rung Value Ladder (Free → Standard → Teams → Enterprise) with structural upgrade triggers at each rung.",
      decoyOrAnchor: "Teams tier as anchor; Standard as reasonable individual choice; Free as visible-customer flywheel seed; Enterprise as procurement door.",
      paymentMechanics: "Per-user monthly or annual with annual discount; no usage metering on bookings.",
    },
    faqs: [
      {
        q: "Why does Calendly cap Free at 1 event type?",
        a: "Because 1 event type is the structural upgrade trigger. The moment a user needs a second booking type (different durations, different scopes, different audiences), they must upgrade. The cap is calibrated to fire at the exact moment willingness-to-pay materializes.",
      },
      {
        q: "Can an indie SaaS use Calendly's free-tier-with-branding model?",
        a: "Only if the customer's output is publicly visible (booking pages, form embeds, video links shared externally). For internal SaaS or admin tools without public output, the flywheel does not compound and the free tier just bleeds money.",
      },
      {
        q: "Why is Calendly more expensive than Cal.com at the team tier?",
        a: "Brand premium plus mature integration ecosystem. Calendly's CRM integrations (Salesforce, HubSpot, Marketo) are deeper than Cal.com's, and the brand recognition with bookers reduces conversion friction for sales teams using scheduling for prospect calls. The price gap reflects what enterprise buyers pay for these structural advantages.",
      },
      {
        q: "What is the Brunson lens on Calendly's pricing?",
        a: "Four-rung Value Ladder with structural upgrade triggers at each rung, free-tier visible-customer flywheel as the front-end acquisition engine, and Teams tier as anchor mechanic. The unusual element is the depth of free-tier acquisition compounding — years of branded booking pages produced category-default brand recognition that no competitor can quickly dislodge.",
      },
    ],
    tags: ["per-user", "free-with-branding", "category-default", "enterprise-upsell"],
    homepageUrl: "https://calendly.com/",
    pricingPageUrl: "https://calendly.com/pricing",
    lastVerified: "2026-05-17",
  },

  {
    slug: "postmark",
    displayName: "Postmark",
    creator: "Wildbit team (acquired by ActiveCampaign in 2022)",
    category: "Email API",
    oneLine:
      "Postmark prices on send volume with a conservative free tier. The pricing matches the brand promise: deliverability-first, no surprises.",
    tldr:
      "Postmark's pricing structure is volume-tiered subscription scaled by emails sent per month. The free tier is conservative (100 emails/month) compared to Resend's 3K — the structural decision favors paid customers who care about deliverability enough to commit. The lesson for indie founders: when your brand promise is operational reliability, your pricing structure should attract committed buyers rather than maximize free signups.",
    productSnapshot: {
      whatTheySell:
        "A developer-friendly transactional email API with separate streams for transactional and broadcast sends, optimized for deliverability.",
      whoFor:
        "Developers and SaaS teams sending transactional email (password resets, receipts, notifications) who prioritize inbox placement above all else.",
    },
    pricingStructure: {
      model: "Volume-tiered subscription scaled by monthly email sends; conservative free tier",
      tiers: [
        {
          name: "Free",
          pricePoint: "$0",
          includes:
            "100 emails/month, separate transactional and broadcast streams, all core API features, Postmark branding in marketing email signatures.",
          audience: "Developers evaluating the platform or shipping very low-volume projects.",
        },
        {
          name: "Paid (volume-tiered)",
          pricePoint:
            "starts ~$15/mo for 10K emails/mo; scales linearly to ~$115/mo for 100K, higher tiers up to enterprise (verified 2026-05-17)",
          includes:
            "Volume-appropriate sends, full API, separate transactional and broadcast streams, dedicated IP option on higher tiers, advanced bounce handling, deliverability monitoring.",
          audience: "Production SaaS with real transactional or broadcast volume.",
        },
        {
          name: "Enterprise (volume + custom)",
          pricePoint: "Custom contact for very high volumes or specific requirements",
          includes:
            "Negotiated rate, dedicated infrastructure, SLAs, advanced security and compliance certifications, dedicated success manager.",
          audience: "Larger operators with deliverability-critical workflows or regulated industries.",
        },
      ],
      paymentFrequency: "Monthly subscription tied to volume tier; auto-upgrade as volume grows",
      freeTrialBehavior:
        "Free tier IS the trial; 100 emails/month is enough for development testing but not for production.",
    },
    anchorAnalysis: {
      pattern: "Brand-promise anchor",
      analysis:
        "Postmark's pricing page does not lead with an aggressive free tier or an obvious anchor tier. The implicit anchor is the brand promise itself: deliverability over a decade. Buyers who land on the pricing page have already been pre-sold on the promise via marketing; the pricing decision is the binary 'commit at this volume' decision. The simplicity matches the brand voice.",
    },
    upgradeTrigger: {
      pattern: "Volume threshold plus deliverability-critical use case",
      analysis:
        "Two triggers fire together: the 100/month free cap forces any production use to upgrade immediately; the deliverability-critical nature of transactional email (password resets, receipts) means buyers who reach this volume have already decided they need Postmark-grade reliability. The conservative free tier filters out experimenters and converts only buyers who commit to the brand promise.",
    },
    whatsWorking: [
      "Conservative free tier (100/month) filters for committed buyers and reduces free-tier infrastructure costs.",
      "Volume tiering aligns the bill with both customer value (send volume) and platform cost (infrastructure to deliver reliably).",
      "Separate transactional and broadcast streams as architectural pricing differentiator — same feature on all tiers, never removed for cost.",
      "Dedicated IP option on higher tiers gives marketing-email senders a meaningful deliverability lever as they scale.",
      "Brand-promise marketing pre-sells the pricing decision — buyers arrive at the pricing page already pre-decided on the value.",
      "ActiveCampaign acquisition (2022) keeps the platform operationally stable while preserving the deliverability-first brand.",
    ],
    whatToAdapt: [
      "Conservative free tiers filter for committed buyers — sometimes the right move is to attract fewer signups who convert at higher rates rather than more signups who burn infrastructure.",
      "Pricing structure should match brand voice: deliverability-first products price like infrastructure (volume-based, no surprises); aggressive growth products price like consumer SaaS (generous free tiers, viral mechanics).",
      "Architectural decisions (like separated streams) can be the structural pricing differentiator instead of feature-gating tiers.",
    ],
    whatToAvoid: [
      "Do not adopt conservative free tiers if your brand promise is growth or viral acquisition. The pricing model must match the brand promise.",
      "Do not skip dedicated IPs or advanced deliverability features at higher tiers if you serve marketing-email senders. The structural needs at high volume justify the price gap.",
    ],
    brunsonLens: {
      stack: "Three-rung stack: free, volume-tiered paid, enterprise custom. No add-on layer, no feature gates within tiers.",
      valueLadder: "Three-rung Value Ladder with conservative free filter at the front and custom enterprise back-end.",
      decoyOrAnchor: "Brand-promise anchor — the pricing decision is pre-sold by the deliverability marketing.",
      paymentMechanics: "Monthly volume-tiered subscription; no per-seat scaling; auto-upgrade as send volume grows.",
    },
    faqs: [
      {
        q: "Why is Postmark's free tier so conservative compared to Resend's?",
        a: "Because the conservative cap filters for committed buyers. Resend's 3K/mo free tier is calibrated for growth (more signups, more eventual paid conversion); Postmark's 100/mo is calibrated for filtering (fewer signups, higher commitment rate among those who arrive). Different pricing philosophies aligned with different growth strategies.",
      },
      {
        q: "Should an indie SaaS use Postmark for marketing email?",
        a: "Postmark supports marketing email through its broadcast streams, but the platform is primarily designed for transactional. For high-volume marketing email with sophisticated automation and segmentation, dedicated marketing-email platforms (Loops, Klaviyo, Customer.io) usually serve better. Postmark + a marketing platform is a common stack.",
      },
      {
        q: "Why are separate transactional and broadcast streams included on all tiers?",
        a: "Because the architectural decision is the brand promise. Removing the separation at lower tiers would contradict the deliverability-first positioning. Postmark prices the volume, not the architecture.",
      },
      {
        q: "What is the Brunson lens on Postmark's pricing?",
        a: "Three-rung Value Ladder with brand-promise anchor mechanics and a deliberately conservative free filter. The unusual element is the alignment between pricing strategy and brand voice — Postmark's single-message deliverability marketing flows directly into a pricing model that filters for committed buyers. Most SaaS treat pricing as separate from brand; Postmark treats them as one decision.",
      },
    ],
    tags: ["volume-tiered", "conservative-free", "brand-promise-anchor", "deliverability"],
    homepageUrl: "https://postmarkapp.com/",
    pricingPageUrl: "https://postmarkapp.com/pricing",
    lastVerified: "2026-05-17",
  },

  {
    slug: "testimonial-to",
    displayName: "Testimonial.to",
    creator: "Damon Chen",
    category: "Testimonial collection",
    oneLine:
      "Testimonial.to converged on the same pricing model as Senja: free-with-branding plus brand-removal upsell. The convergence proves the model is right for the category.",
    tldr:
      "Testimonial.to's pricing structure is functionally identical to Senja's: free tier with Testimonial.to branding on the Wall of Love widget, paid tiers remove branding and unlock advanced features. Both companies converged on this model because it works structurally for the category. The lesson for indie founders: when two competitors independently arrive at the same pricing model, the model is structurally correct for the category — copy the structure and compete on execution.",
    productSnapshot: {
      whatTheySell:
        "A testimonial collection and display platform for SaaS, agencies, and creators, with strong video testimonial features and AI-assisted editing.",
      whoFor:
        "Indie SaaS, agencies, and creators who need video and text testimonials displayed cleanly on their marketing sites.",
    },
    pricingStructure: {
      model: "Freemium with brand-removal upgrade trigger and AI-feature gating",
      tiers: [
        {
          name: "Free (Hobby)",
          pricePoint: "$0",
          includes:
            "Text and video testimonial collection, basic Wall of Love widget, Testimonial.to branding visible, limited responses per month, basic integrations.",
          audience: "Indie founders collecting first testimonials before serious publication.",
        },
        {
          name: "Starter (paid)",
          pricePoint: "approximately $20/mo (verified 2026-05-17)",
          includes:
            "Brand removal, custom Wall of Love, video uploads, more integrations, more monthly responses.",
          audience: "Indie SaaS ready to publish testimonials on the marketing site.",
        },
        {
          name: "Premium",
          pricePoint: "approximately $50/mo (verified 2026-05-17)",
          includes:
            "AI-assisted video editing and highlights, team workspace, advanced customization, embed analytics, API access.",
          audience: "Agencies, SaaS with multiple team members, creators using video at scale.",
        },
        {
          name: "Enterprise",
          pricePoint: "Custom (sales contact)",
          includes:
            "Custom contracts, SSO, dedicated support, larger limits, advanced security.",
          audience: "Larger organizations or agencies serving many clients.",
        },
      ],
      paymentFrequency: "Monthly or annual with annual discount",
      freeTrialBehavior:
        "Free tier IS the trial; paid features can be sampled briefly on signup.",
    },
    anchorAnalysis: {
      pattern: "Brand-removal-trigger anchor (same as Senja)",
      analysis:
        "Testimonial.to's center of gravity is the brand-removal trigger between Free and Starter, identical to Senja's pattern. Premium tier at approximately $50/mo anchors above; Starter at approximately $20/mo reads as the natural choice for the indie buyer. The convergence with Senja on this anchor mechanic is not coincidence — it is the structurally correct shape for testimonial SaaS where the customer's output (Wall of Love widget) is publicly visible.",
    },
    upgradeTrigger: {
      pattern: "Brand removal at marketing-surface publication, plus AI feature gating",
      analysis:
        "Two triggers fire: brand removal at publication (same as Senja) drives free-to-Starter conversion when the founder publishes testimonials on a public marketing page; AI feature gating (AI-assisted video editing, highlights) drives Starter-to-Premium conversion when video testimonials become a serious surface. The double trigger captures conversion at two distinct usage moments.",
    },
    whatsWorking: [
      "Brand-removal trigger aligns the upgrade moment with structural willingness-to-pay spike (same mechanic as Senja).",
      "Free tier with branding feeds the visible-customer flywheel — every Testimonial.to widget on a customer's marketing site is implicit advertising.",
      "AI-feature gating on Premium creates a second upgrade trigger that fires for video-heavy use cases.",
      "Premium tier price gap from Starter (approximately $50 vs $20) anchors the page and reinforces the indie-vs-agency tier split.",
      "Solo-founder operations match indie-buyer expectations — Damon Chen is the brand, the product, and the support.",
      "Convergence with Senja on pricing structure validates the category model — the structurally correct shape is replicated by both companies.",
    ],
    whatToAdapt: [
      "When two competitors converge on the same pricing model, the model is structurally correct for the category. Copy the structure and compete on execution rather than reinventing pricing.",
      "Brand-removal triggers compound visible-customer presence: free customers seed the flywheel; paid customers extract value at the moment willingness-to-pay spikes.",
      "Layer secondary triggers (AI-feature gating) on top of the primary trigger to capture additional upgrade conversion as usage matures.",
    ],
    whatToAvoid: [
      "Do not adopt free-with-branding if your product output is not publicly visible. The flywheel needs the branding to compound through customer marketing surfaces.",
      "Do not over-tier AI features if they become table-stakes faster than expected. AI-feature gating works when the features are forward-looking; it fails when they become expected baseline.",
    ],
    brunsonLens: {
      stack: "Four-rung stack with progressive feature additions; Premium tier anchors against Starter.",
      valueLadder: "Four-rung Value Ladder (Free → Starter → Premium → Enterprise) with brand removal as the structural front-end trigger and AI features as the secondary upgrade trigger.",
      decoyOrAnchor: "Premium tier as anchor; Starter as indie-friendly mainstream; Free as visible-customer flywheel seed.",
      paymentMechanics: "Monthly or annual subscription; no usage metering below the response-count caps on Free and Starter.",
    },
    faqs: [
      {
        q: "Why is Testimonial.to's pricing nearly identical to Senja's?",
        a: "Because both companies independently arrived at the structurally correct shape for testimonial SaaS: free-with-branding seeds the visible-customer flywheel, brand removal is the upgrade trigger at publication. When two competitors converge on a pricing model, the model is right; the convergence is signal, not coincidence.",
      },
      {
        q: "Should an indie SaaS in a different category copy this exact pricing model?",
        a: "Only if your output is publicly visible. The free-with-branding flywheel works for testimonial widgets, form embeds, scheduling pages, video links — anywhere the customer surface includes the platform's brand. For invisible-output products (internal tools, dashboards, admin panels), the model does not work and the free tier just bleeds money.",
      },
      {
        q: "Why does Testimonial.to gate AI features at Premium?",
        a: "Because AI features (video editing, highlights, summarization) are forward-looking for testimonial workflows in 2026. Gating them at Premium creates an upgrade trigger that fires as customer expectations evolve — Starter buyers upgrade to Premium when AI becomes the expected baseline. The gating is a future-state revenue lever.",
      },
      {
        q: "What is the Brunson lens on Testimonial.to's pricing?",
        a: "Four-rung Value Ladder with brand-removal-trigger acquisition flywheel plus AI-feature-gated secondary upgrade trigger. The unusual element is the explicit convergence with Senja on pricing structure — both companies validate the category model. Brunson lesson: when category convergence happens on pricing, copy the structure and compete on execution.",
      },
    ],
    tags: ["brand-removal-trigger", "visible-customer", "freemium", "ai-feature-gating"],
    homepageUrl: "https://testimonial.to/",
    pricingPageUrl: "https://testimonial.to/pricing",
    lastVerified: "2026-05-17",
  },

  {
    slug: "clickup",
    displayName: "ClickUp",
    creator: "Zeb Evans",
    category: "Project management for software teams",
    oneLine:
      "ClickUp's pricing matches the consolidation promise — generous free, predictable per-user upsells, AI as orthogonal add-on. Pay for the bundle, scale with the team.",
    tldr:
      "ClickUp's pricing structure leans into the all-in-one positioning: a genuinely generous free tier captures cross-functional teams, per-user paid tiers add automation, storage, and admin features, AI is an orthogonal add-on across all tiers. The lesson for indie founders: when your value proposition is consolidation, the pricing model needs to make adopting the bundle cheaper than maintaining the alternatives — generous free plus predictable per-user scaling delivers that math.",
    productSnapshot: {
      whatTheySell:
        "An all-in-one productivity platform combining tasks, docs, chat, whiteboards, forms, time tracking, goals in one configurable workspace.",
      whoFor:
        "Cross-functional teams that want to consolidate multiple SaaS tools under one bill, with deep configurability for their specific workflows.",
    },
    pricingStructure: {
      model: "Per-user tiered subscription with generous free + AI as add-on",
      tiers: [
        {
          name: "Free Forever",
          pricePoint: "$0",
          includes:
            "Unlimited users and tasks, most core features (kanban, sprints, docs, chat, whiteboards, time tracking), 100MB storage cap.",
          audience: "Indie teams, individuals, and small teams evaluating ClickUp at zero cost.",
        },
        {
          name: "Unlimited",
          pricePoint: "approximately $10/user/mo billed annually (verified 2026-05-17)",
          includes:
            "Unlimited storage, integrations, dashboards, custom fields, guests, native time tracking.",
          audience: "Growing teams hitting the storage cap or needing dashboards and integrations.",
        },
        {
          name: "Business",
          pricePoint: "approximately $19/user/mo billed annually (verified 2026-05-17)",
          includes:
            "Advanced automations, advanced dashboards, workload management, SSO, advanced permissions.",
          audience: "Established teams scaling collaboration and adopting governance features.",
        },
        {
          name: "Business Plus",
          pricePoint: "approximately $29/user/mo billed annually (verified 2026-05-17)",
          includes:
            "Team sharing, custom role creation, increased automations, priority support.",
          audience: "Larger teams with multi-department coordination.",
        },
        {
          name: "Enterprise",
          pricePoint: "Custom (sales contact)",
          includes:
            "Advanced security, dedicated success, white-label, custom SLAs.",
          audience: "Enterprise customers with procurement requirements.",
        },
        {
          name: "ClickUp AI add-on",
          pricePoint: "approximately $7/member/mo on top of any paid plan",
          includes:
            "AI-assisted writing, automation suggestions, task summaries, project insights.",
          audience: "Any paid-tier user wanting AI-augmented workflows.",
        },
      ],
      paymentFrequency: "Monthly or annual with annual discount",
      freeTrialBehavior:
        "Free Forever tier IS the trial; paid features available on 14-day trial for evaluation.",
    },
    anchorAnalysis: {
      pattern: "Business Plus tier as anchor",
      analysis:
        "Business Plus at approximately $29/user/mo anchors the page for serious cross-functional teams. Business at approximately $19 reads as the natural growth tier; Unlimited at approximately $10 reads as the affordable upgrade from Free. Enterprise sits ready for procurement. The unusual structural element is the genuinely generous Free tier (unlimited users) — most teams adopt deeply before any paywall hits, making upgrades structural rather than feature-gate-driven.",
    },
    upgradeTrigger: {
      pattern: "Storage cap plus team-scale features",
      analysis:
        "The Free tier's 100MB storage cap is the structural primary trigger — teams that adopt deeply hit it within weeks. Beyond that, Unlimited-to-Business is driven by advanced automations and admin features (dashboards, workload management). Business-to-Business Plus by team-sharing and custom roles. Each tier jump maps to a real organizational growth event.",
    },
    whatsWorking: [
      "Genuinely generous Free tier (unlimited users) lets teams adopt deeply before paywall, making upgrade decisions structural.",
      "Storage cap as primary upgrade trigger is mechanical and predictable — teams hit it through normal use.",
      "AI as add-on (not as tier) captures incremental revenue without disturbing the seat-ladder psychology.",
      "Per-user pricing aligns the bill with team-scale growth, not with feature consumption.",
      "Cross-functional positioning matches the cross-functional pricing structure — the same teams that need ClickUp's breadth pay for it predictably.",
      "Business Plus tier anchor mechanic makes Business tier read as the reasonable growth choice.",
    ],
    whatToAdapt: [
      "If your value proposition is consolidation, your free tier needs to be generous enough for real adoption — not just evaluation. Real adoption converts at structural caps, not at feature gates.",
      "Storage caps (or similar mechanical caps) are predictable upgrade triggers that teams understand intuitively. Feature-gate triggers create more buyer friction.",
      "Pricing AI features as orthogonal add-ons lets you capture AI revenue without restructuring the existing tier ladder.",
    ],
    whatToAvoid: [
      "Do not offer unlimited free users if you cannot serve them operationally. ClickUp can because their infrastructure and revenue model support it; smaller SaaS often cannot.",
      "Do not anchor with a tier that has no real Enterprise customers. The Business Plus tier works as anchor because real teams adopt it, not just to make Business look cheap.",
    ],
    brunsonLens: {
      stack: "Five-rung stack with progressive feature additions; Business Plus tier is the visual anchor and Enterprise sits behind a sales conversation.",
      valueLadder: "Full Value Ladder with Free as front-end (unlimited-user acquisition), per-user paid tiers as subscription core, Enterprise as high-ticket back-end, AI as continuity add-on.",
      decoyOrAnchor: "Business Plus tier as anchor; Business as reasonable growth tier; Unlimited as affordable upgrade; Free as visible-customer flywheel.",
      paymentMechanics: "Per-user monthly or annual with annual discount; AI add-on per-member orthogonal to tier; no usage metering on feature use.",
    },
    faqs: [
      {
        q: "Why is ClickUp's free tier so generous compared to competitors?",
        a: "Because the consolidation value proposition requires real adoption to demonstrate. Teams that only evaluate ClickUp briefly cannot feel the consolidation benefit; teams that adopt deeply on the free tier convert at structural scale moments (storage cap, team size, governance needs). Generous free pays back through deep adoption.",
      },
      {
        q: "Should an indie SaaS use unlimited-user free tiers?",
        a: "Only when your unit economics support it AND your value proposition genuinely requires deep adoption to demonstrate. Most SaaS fail at least one test — either the marginal cost of a free user is too high, or the value proposition can be evaluated without deep adoption. ClickUp's specific shape supports it; most do not.",
      },
      {
        q: "Why is AI priced as an add-on instead of a tier feature?",
        a: "Because AI cuts across the existing seat structure. Making it a tier would force users to choose between AI and other tier features (advanced automations, custom fields). As an orthogonal add-on, ClickUp captures AI revenue from any tier without restructuring the seat ladder.",
      },
      {
        q: "What is the Brunson lens on ClickUp's pricing?",
        a: "Full five-rung Value Ladder with structural-cap upgrade triggers (storage) plus continuity add-on (AI). The consolidation-promise marketing flows directly into a pricing model that rewards deep adoption with structural-cap-driven upgrades. Brunson lesson: when your value proposition is consolidation, your pricing must make adopting the bundle cheaper than maintaining the alternatives — generous free plus per-user scaling delivers that math.",
      },
    ],
    tags: ["per-user", "generous-free", "ai-as-add-on", "consolidation-pricing"],
    homepageUrl: "https://clickup.com/",
    pricingPageUrl: "https://clickup.com/pricing",
    lastVerified: "2026-05-17",
  },

  {
    slug: "render",
    displayName: "Render",
    creator: "Anurag Goel",
    category: "Frontend cloud and hosting",
    oneLine:
      "Render's pricing is per-service predictable — pay for the resources you provision, see the bill before it arrives. No bill-shock, no usage-metered surprise.",
    tldr:
      "Render's pricing structure matches the modern-PaaS positioning: each backend service (web service, Postgres, Redis, background worker, cron) has its own predictable monthly cost, total stacks transparently, no surprise overages from usage spikes. The lesson for indie founders: when your competitor (Vercel, Fly.io) prices on metered usage that creates bill-shock risk, predictable-bundle pricing is the structural alternative that converts buyers who want to budget reliably.",
    productSnapshot: {
      whatTheySell:
        "A managed Platform-as-a-Service for full-stack web apps with bundled Postgres, Redis, background workers, cron, and static-site hosting.",
      whoFor:
        "Full-stack indie founders, startups, and small teams who want bundled backend services with predictable per-service pricing.",
    },
    pricingStructure: {
      model: "Per-service predictable pricing with bundled backend tiers + flat team subscription",
      tiers: [
        {
          name: "Static sites",
          pricePoint: "$0 (free)",
          includes:
            "Static-site hosting with global CDN, free SSL, custom domains, unlimited bandwidth.",
          audience: "Pre-revenue indie founders, side projects, documentation sites.",
        },
        {
          name: "Individual",
          pricePoint: "approximately $7/mo workspace + per-service costs (verified 2026-05-17)",
          includes:
            "Single-user workspace, web services starting at low-single-digits/mo for hobby compute scaling into production tiers.",
          audience: "Solo indie founders shipping production apps with backend.",
        },
        {
          name: "Team",
          pricePoint: "approximately $19/user/mo workspace + per-service costs (verified 2026-05-17)",
          includes:
            "Multi-user workspace, shared infrastructure, role-based access, team-collaboration features on services.",
          audience: "Growing teams running production full-stack apps.",
        },
        {
          name: "Enterprise",
          pricePoint: "Custom (sales contact)",
          includes:
            "Dedicated infrastructure, SLAs, custom contracts, advanced security, dedicated support.",
          audience: "Larger companies with security or scale requirements.",
        },
        {
          name: "Per-service tiers",
          pricePoint:
            "Web services from ~$7/mo (hobby) up to enterprise tiers; Postgres from ~$7/mo (256MB) to multi-hundred-dollar enterprise; Redis from ~$10/mo to enterprise; workers + cron predictable monthly tiers (verified 2026-05-17)",
          includes:
            "Each service has its own predictable monthly tier; total bill = workspace + sum of provisioned services.",
          audience: "All paid customers — pricing transparency is the structural differentiator.",
        },
      ],
      paymentFrequency: "Monthly subscription on workspace + per-service tier; no metered usage on most services",
      freeTrialBehavior:
        "Free static-site tier IS the trial for the platform; paid services start small and scale predictably.",
    },
    anchorAnalysis: {
      pattern: "Predictability-as-anchor",
      analysis:
        "Render's pricing page does not lead with an aggressive anchor tier. The implicit anchor is the predictability itself — buyers comparing Render to usage-metered alternatives (Vercel, Fly.io) see one number per service and one total before they commit. Predictability is the entire pricing argument. The simplicity matches the modern-Heroku positioning: 'what Heroku used to give you, without the modern bill-shock from competitors.'",
    },
    upgradeTrigger: {
      pattern: "Resource-provisioning growth and workspace tier scaling",
      analysis:
        "Two trigger types fire: provisioning new services or upgrading existing service tiers (more CPU, more storage) drives total bill growth; team-size growth drives the workspace tier from Individual to Team. Both triggers map to natural application growth events and are predictable in advance, which prevents the surprise overage that usage-metered competitors create.",
    },
    whatsWorking: [
      "Per-service predictable pricing matches the modern-PaaS bundling positioning — pricing model and value proposition align.",
      "Free static-site hosting captures the indie-buyer entry point and converts to paid as backend needs emerge.",
      "No usage metering on most services prevents bill-shock — buyers can budget reliably without continuous monitoring.",
      "Each service tier maps to provisioned resources, not consumed resources — easier mental model than VM-cycles or function-invocations.",
      "Per-user workspace pricing scales with team-size growth predictably.",
      "Founder-led marketing from Anurag Goel and the Render team anchors the brand to identifiable operators.",
    ],
    whatToAdapt: [
      "If your competitors use usage-metered pricing that creates bill-shock, predictable per-resource pricing is the structural differentiator that converts buyers who want to budget reliably.",
      "Make the total cost calculable in advance from the published tiers. Buyers should be able to do the math without contacting sales.",
      "Free entry tier with one or two real value props (here: static hosting with CDN) converts free users to paid as their needs grow beyond the entry tier.",
    ],
    whatToAvoid: [
      "Do not adopt predictable per-service pricing if your platform cost actually scales with usage. The model only works when your infrastructure cost matches the predictable tier.",
      "Do not over-bundle services you cannot operate at predictable cost — the predictability claim collapses when surprise charges appear for adjacent capabilities.",
    ],
    brunsonLens: {
      stack: "Two-rung workspace stack (Individual, Team) plus per-service tier stack — total bill is sum of provisioned services.",
      valueLadder: "Four-rung Value Ladder (Free static → Individual → Team → Enterprise) with per-service tier customization.",
      decoyOrAnchor: "Predictability-as-anchor; no explicit decoy tier. The simplicity is the conversion mechanism.",
      paymentMechanics: "Workspace subscription + per-service predictable tiers; no metered overages on most services.",
    },
    faqs: [
      {
        q: "How does Render's predictable pricing differ from Vercel's metered?",
        a: "Vercel prices on metered usage (bandwidth, function invocations, build minutes) plus per-user subscription. Render prices on provisioned per-service tiers (web service tier, Postgres tier, Redis tier) plus workspace subscription. For predictable workloads, Render's model is easier to budget; for variable workloads with low baselines, Vercel's metered model can be cheaper.",
      },
      {
        q: "Why does Render bundle Postgres and Redis natively?",
        a: "Strategic decision to be the bundled-services PaaS. Competitors push these to marketplace partners (Vercel) or require manual setup (Fly.io). Render's bundling means one dashboard, one bill, one operational surface for the full stack.",
      },
      {
        q: "Should an indie SaaS use predictable per-resource pricing?",
        a: "Only if your infrastructure cost scales with provisioned resources rather than consumed usage. Hosting platforms, database services, monitoring tools fit this model. Per-API-call or per-event services do not — usage metering aligns with their cost shape.",
      },
      {
        q: "What is the Brunson lens on Render's pricing?",
        a: "Predictability-as-anchor with bundled-services Value Ladder. The pricing structure mirrors the modern-Heroku positioning exactly — bundling and predictability are both the marketing and the pricing model. Brunson lesson: when your value proposition is 'simpler than the modern alternatives,' your pricing must demonstrate that simplicity numerically.",
      },
    ],
    tags: ["per-service", "predictable", "bundled-paas", "no-metering"],
    homepageUrl: "https://render.com/",
    pricingPageUrl: "https://render.com/pricing",
    lastVerified: "2026-05-17",
  },

  {
    slug: "loom",
    displayName: "Loom",
    creator: "Joe Thomas, Shahed Khan, Vinay Hiremath (acquired by Atlassian in 2023)",
    category: "Screen recording for marketing video",
    oneLine:
      "Loom prices free-with-branding plus team-subscription upsell. The free tier is the marketing engine; team adoption is the monetization.",
    tldr:
      "Loom's pricing structure is built around the product-is-the-marketing flywheel: the free tier (with Loom branding on every video) seeds the visible-output flywheel, and team subscriptions monetize the workflow once a team adopts async video as standard practice. The lesson for indie founders: when your product creates publicly-shareable artifacts, free-with-branding can be the most efficient acquisition channel — but the upgrade trigger must align with team-scale adoption, not individual feature gates.",
    productSnapshot: {
      whatTheySell:
        "An async video communication platform — screen recording with webcam overlay, instant shareable links, viewer analytics, team workspaces.",
      whoFor:
        "Distributed teams, customer success operators, sales teams, engineering teams — anyone whose communication includes async video updates.",
    },
    pricingStructure: {
      model: "Freemium with team-scale upgrade trigger and Loom branding flywheel",
      tiers: [
        {
          name: "Starter (Free)",
          pricePoint: "$0",
          includes:
            "25 videos per person, 5-minute video limit, basic Loom-branded shareable links, viewer analytics.",
          audience: "Individuals trying Loom or using async video lightly.",
        },
        {
          name: "Business",
          pricePoint: "approximately $12.50/user/mo billed annually (verified 2026-05-17)",
          includes:
            "Unlimited videos, unlimited recording length, custom branding, viewer engagement insights, transcripts, password protection, advanced sharing controls.",
          audience: "Teams adopting async video as standard practice.",
        },
        {
          name: "Business + AI",
          pricePoint: "approximately $20/user/mo billed annually (verified 2026-05-17)",
          includes:
            "All Business features plus AI auto-titles, auto-summaries, auto-tasks, AI workflows.",
          audience: "Teams wanting AI-augmented async-video workflows.",
        },
        {
          name: "Enterprise",
          pricePoint: "Custom (sales contact)",
          includes:
            "SSO, SCIM, advanced security, custom retention, dedicated success, advanced governance.",
          audience: "Large organizations with procurement requirements.",
        },
      ],
      paymentFrequency: "Monthly or annual with annual discount; per-user pricing on paid tiers",
      freeTrialBehavior:
        "Starter free tier IS the trial; Business and Business + AI offer time-limited trials for team evaluation.",
    },
    anchorAnalysis: {
      pattern: "Business + AI tier as anchor",
      analysis:
        "Business + AI at approximately $20/user/mo anchors the page above Business at approximately $12.50. The price gap (60% premium) makes Business read as the affordable team tier; the AI version is the upgrade option for teams that specifically want AI features. Enterprise sits ready for procurement-driven buyers. The structural anchor is the Business tier itself — calibrated to be the obvious adoption choice for teams ready to commit.",
    },
    upgradeTrigger: {
      pattern: "Video-count cap plus team-adoption moment",
      analysis:
        "Two triggers fire: the 25-video cap on Starter forces individual heavy users to upgrade; the team-adoption moment (when a team decides async video is part of their workflow) drives broader Business-tier conversion. The video-count trigger is mechanical and individual; the team-adoption trigger is structural and organizational. Both contribute to Loom's conversion rate.",
    },
    whatsWorking: [
      "Free tier with Loom branding seeds the visible-output flywheel — every shared video is implicit marketing.",
      "Video-count cap (25 on Starter) is a predictable trigger for individual heavy users.",
      "Team-adoption moment is the structural trigger for broader Business tier conversion.",
      "AI as separate tier (not add-on) captures AI revenue from teams already willing to upgrade.",
      "Per-user pricing aligns the bill with team scale, which matches how async-video adoption spreads through organizations.",
      "Atlassian acquisition (2023) keeps the platform funded while preserving the indie-friendly brand on marketing surfaces.",
    ],
    whatToAdapt: [
      "If your product creates publicly-shareable artifacts, free-with-branding is the most efficient acquisition channel — but the artifacts must be high-value enough that recipients want to use the product themselves.",
      "Layer triggers: mechanical (count caps) for individual conversion, structural (team-adoption moments) for broader conversion. Both contribute to total conversion rate.",
      "When AI is the forward-state expectation, pricing it as a separate tier rather than add-on works if buyers self-segment cleanly — teams that want AI know they want it.",
    ],
    whatToAvoid: [
      "Do not adopt free-with-branding if your product output is internal-only. The flywheel needs publicly-visible artifacts to compound.",
      "Do not skip the team-adoption trigger by relying only on individual feature caps. Async-video adoption spreads through teams; individual triggers undermonetize the team conversion path.",
    ],
    brunsonLens: {
      stack: "Four-rung stack with predictable feature additions per tier; AI as separate tier rather than add-on.",
      valueLadder: "Full four-rung Value Ladder with Free as front-end (Loom-branded acquisition), per-user team tiers as subscription core, Enterprise as back-end.",
      decoyOrAnchor: "Business + AI tier as anchor; Business as reasonable team choice; Starter as visible-output flywheel.",
      paymentMechanics: "Per-user monthly or annual with annual discount; no usage metering on video count or send volume below tier caps.",
    },
    faqs: [
      {
        q: "Why does Loom keep branding on free-tier videos?",
        a: "Because the branding is the marketing channel. Every shared Loom video exposes a new recipient to the product; the cumulative network effect produces brand recognition that paid acquisition could not match efficiently. The branding is not 'a limitation we'll remove for $12.50' — it is the structural mechanism that makes the free tier economically viable.",
      },
      {
        q: "Should an indie SaaS price AI as a separate tier or as an add-on?",
        a: "Add-on (ClickUp model) when AI cuts across team-size and use-case segments — captures revenue from any tier without restructuring. Separate tier (Loom model) when buyers self-segment cleanly into AI-wanters and non-wanters. Both models work; the choice depends on how naturally your buyers split on AI adoption.",
      },
      {
        q: "Why is the Business tier price gap with Business + AI so large?",
        a: "Because the price gap is the anchor mechanic. Business + AI at approximately $20/user/mo makes Business at approximately $12.50 read as the affordable team option. Without the AI tier's premium, Business itself would feel expensive instead of reasonable.",
      },
      {
        q: "What is the Brunson lens on Loom's pricing?",
        a: "Four-rung Value Ladder with branded-flywheel acquisition (Brunson 'visible-customer' move) plus team-adoption trigger plus AI-tier upgrade. The unusual element is the depth of the free-tier flywheel — Loom's free tier IS the marketing budget, replacing what most companies spend on paid acquisition.",
      },
    ],
    tags: ["freemium-with-branding", "per-user", "team-trigger", "ai-as-tier"],
    homepageUrl: "https://www.loom.com/",
    pricingPageUrl: "https://www.loom.com/pricing",
    lastVerified: "2026-05-17",
  },

  {
    slug: "gitbook",
    displayName: "GitBook",
    creator: "Samy Pesse and Aaron O'Mullan",
    category: "Developer documentation",
    oneLine:
      "GitBook prices per-user with feature-tier upsells. The pricing matches the broader-knowledge-platform positioning — scale with team size, not with documentation scope.",
    tldr:
      "GitBook's pricing structure scales with team size through per-user tiers, with feature upgrades at each tier rather than usage limits. This matches the broader-knowledge-platform positioning — the value scales with how many people use the platform across docs, wikis, and knowledge bases, not with documentation volume. The lesson for indie founders: when your value scales with team adoption rather than with usage, per-user pricing aligns the bill with the actual value driver.",
    productSnapshot: {
      whatTheySell:
        "A knowledge platform for public documentation, internal wikis, and team knowledge bases with WYSIWYG editing and Git-sync option.",
      whoFor:
        "Teams that want one platform for public docs and internal knowledge, with a writer-friendly editor for non-developer contributors.",
    },
    pricingStructure: {
      model: "Per-user tiered subscription with feature-tier upsells",
      tiers: [
        {
          name: "Free",
          pricePoint: "$0",
          includes:
            "1 space, up to 5 users, basic editor, basic integrations, GitBook branding.",
          audience: "Individuals, small teams evaluating GitBook for personal or small-team knowledge.",
        },
        {
          name: "Plus",
          pricePoint: "approximately $8/user/mo billed annually (verified 2026-05-17)",
          includes:
            "Unlimited spaces, custom domain, brand removal, advanced editor features, more integrations, version history.",
          audience: "Small teams ready to publish branded docs and run shared workspaces.",
        },
        {
          name: "Pro",
          pricePoint: "approximately $15/user/mo billed annually (verified 2026-05-17)",
          includes:
            "Advanced analytics, advanced permissions, SSO, audit logs, premium support, advanced AI features.",
          audience: "Growing teams with collaboration depth and security needs.",
        },
        {
          name: "Enterprise",
          pricePoint: "Custom (sales contact)",
          includes:
            "Custom contracts, advanced security, SCIM, dedicated success, custom retention.",
          audience: "Larger organizations with procurement requirements.",
        },
      ],
      paymentFrequency: "Monthly or annual with annual discount",
      freeTrialBehavior:
        "Free tier IS the trial for small teams; paid tiers offer time-limited trials for evaluation.",
    },
    anchorAnalysis: {
      pattern: "Pro tier as anchor",
      analysis:
        "Pro at approximately $15/user/mo anchors the page for serious knowledge-platform buyers. Plus at approximately $8 reads as the natural starting tier for small teams; Free is the entry. Enterprise sits behind a sales conversation. The unusual structural element is that the entire tier ladder scales with team size rather than with knowledge volume — buyers do not pay more for writing more docs, only for adding more people.",
    },
    upgradeTrigger: {
      pattern: "User-count cap plus advanced-feature need",
      analysis:
        "Two triggers fire: the 5-user cap on Free forces teams to upgrade when they grow beyond initial adoption; the advanced-feature need (analytics, SSO, advanced permissions) drives Plus-to-Pro conversion. Both triggers map to natural team-growth events rather than usage-based limits, which matches how knowledge-platform adoption actually scales inside organizations.",
    },
    whatsWorking: [
      "Per-user pricing aligns the bill with team-adoption value rather than with documentation volume.",
      "5-user cap on Free is a predictable trigger that fires when a team genuinely adopts the platform.",
      "Plus tier brand-removal trigger captures the publication-moment willingness-to-pay spike.",
      "Pro tier advanced-feature gating captures the team-maturity upgrade as governance and analytics matter.",
      "Enterprise tier provides the procurement-driven upsell without exposing custom pricing publicly.",
      "WYSIWYG editor accessibility expands the contributor base beyond developers — pricing per-user captures the broader team value.",
    ],
    whatToAdapt: [
      "When your value scales with team adoption rather than with usage volume, per-user pricing aligns the bill with the actual value driver.",
      "Layer triggers: count caps (5 users on Free) for team-growth, feature gates (SSO, analytics) for team-maturity. Both contribute to total conversion rate.",
      "Brand removal as Plus-tier trigger captures the publication-moment willingness-to-pay without forcing all users to pay.",
    ],
    whatToAvoid: [
      "Do not adopt per-user pricing if individual users do not get clear individual value. For knowledge platforms most users get value as readers; per-user pricing on read-only access undervalues the platform.",
      "Do not gate advanced features at Pro if buyers expect them at Plus. The feature-tier expectations evolve over time — what was Pro-tier three years ago may be Plus-tier now.",
    ],
    brunsonLens: {
      stack: "Four-rung stack with progressive feature additions; Pro tier is the visual anchor.",
      valueLadder: "Full four-rung Value Ladder with Free as front-end, per-user paid tiers as subscription core, Enterprise as high-ticket back-end.",
      decoyOrAnchor: "Pro tier as anchor; Plus as reasonable starting tier; Free as evaluation entry.",
      paymentMechanics: "Per-user monthly or annual with annual discount; no usage metering on documentation volume.",
    },
    faqs: [
      {
        q: "Why does GitBook price per-user instead of per-document?",
        a: "Because the value of a knowledge platform scales with how many people use it, not with how much is written. Documentation volume is a poor proxy for value; team adoption is a strong one. Per-user pricing aligns the bill with the actual value driver.",
      },
      {
        q: "Should documentation platforms use per-user or per-document pricing?",
        a: "Per-user when the value scales with team adoption (most knowledge platforms). Per-document or per-page when the value scales with content publication volume (some publication platforms). The choice depends on which metric correlates more closely with your platform's actual cost and customer value.",
      },
      {
        q: "Why is the 5-user cap on Free so low compared to ClickUp's unlimited-user free?",
        a: "Different consolidation strategies. ClickUp's consolidation requires deep adoption to demonstrate value; GitBook's knowledge-platform value can be evaluated by small teams. The 5-user cap is calibrated to allow real evaluation without making free the production tier — which protects the upgrade conversion path.",
      },
      {
        q: "What is the Brunson lens on GitBook's pricing?",
        a: "Four-rung Value Ladder with per-user scaling matching the team-adoption value driver. The pricing structure mirrors the broader-knowledge-platform positioning — the value scales with team scope, not with documentation volume. Brunson lesson: when your value proposition is broader-than-competitors, your pricing should reward broader use rather than penalize it.",
      },
    ],
    tags: ["per-user", "team-scaling", "feature-tier-upsells", "knowledge-platform"],
    homepageUrl: "https://www.gitbook.com/",
    pricingPageUrl: "https://www.gitbook.com/pricing",
    lastVerified: "2026-05-17",
  },

  {
    slug: "asana",
    displayName: "Asana",
    creator: "Dustin Moskovitz and Justin Rosenstein",
    category: "Project management",
    oneLine:
      "Asana prices per-user with a structured tier ladder. The free 10-user cap is the mechanical upgrade trigger; Advanced tier captures the cross-functional buyer.",
    tldr:
      "Asana's pricing structure scales with team size through per-user tiers (Free → Starter → Advanced → Enterprise), with the free-tier 10-user cap as the mechanical upgrade trigger. Advanced tier captures the cross-functional buyer who needs Goals, Workload, and timeline depth. The lesson for indie founders: when your value scales with both team size AND coordination depth, per-user pricing with feature-tier upsells captures both axes simultaneously.",
    productSnapshot: {
      whatTheySell:
        "A cross-functional project management platform with tasks, projects, portfolios, goals, timelines, and workload coordination.",
      whoFor:
        "Growing cross-functional teams that coordinate work across multiple departments and need structured project tracking with goal hierarchies.",
    },
    pricingStructure: {
      model: "Per-user tiered subscription with structured upsell ladder",
      tiers: [
        {
          name: "Personal (Free)",
          pricePoint: "$0",
          includes:
            "Up to 10 users, unlimited tasks/projects, list/board/calendar views, basic search.",
          audience: "Early-stage teams of fewer than 10 people, individuals organizing personal work.",
        },
        {
          name: "Starter",
          pricePoint: "approximately $11/user/mo billed annually (verified 2026-05-18)",
          includes:
            "Unlimited users, Timeline view, dashboards, custom fields, integrations, basic automation.",
          audience: "Growing teams past the 10-user threshold needing real PM features.",
        },
        {
          name: "Advanced",
          pricePoint: "approximately $25/user/mo billed annually (verified 2026-05-18)",
          includes:
            "Goals, Workload, advanced automation, portfolios, advanced reporting, time tracking.",
          audience: "Cross-functional teams coordinating across departments with goal hierarchies.",
        },
        {
          name: "Enterprise",
          pricePoint: "Custom (sales contact)",
          includes:
            "Custom integrations, SAML, audit logs, advanced security, dedicated success, custom retention.",
          audience: "Larger organizations with procurement requirements.",
        },
      ],
      paymentFrequency: "Monthly or annual with annual discount",
      freeTrialBehavior:
        "Free Personal tier IS the trial for small teams; paid tiers offer time-limited trials for evaluation.",
    },
    anchorAnalysis: {
      pattern: "Advanced tier as anchor",
      analysis:
        "Advanced at approximately $25/user/mo anchors the page for serious cross-functional buyers. Starter at approximately $11 reads as the natural starting tier for growing teams; Personal Free is the entry; Enterprise sits behind a sales conversation. The unusual structural element is the Goals + Workload + Timeline bundle at Advanced — these features collectively represent what makes Asana 'real' for cross-functional teams, and the pricing reflects that bundled value.",
    },
    upgradeTrigger: {
      pattern: "10-user cap plus cross-functional feature need",
      analysis:
        "The 10-user cap on Personal Free is the structural primary trigger — teams that adopt Asana and grow past 10 users have proven team-scale need. The secondary trigger from Starter to Advanced is the cross-functional feature need (Goals, Workload, Timeline) that emerges when teams coordinate across departments. Both triggers map to mechanical team-growth and structural-complexity events.",
    },
    whatsWorking: [
      "10-user cap on Free is mechanical and predictable as teams grow past early-stage scale.",
      "Per-user pricing aligns the bill with team-scale growth, which matches how Asana usage actually scales.",
      "Goals + Workload + Timeline bundling at Advanced creates a clear value gap from Starter, justifying the 2.3x price jump.",
      "Enterprise tier provides procurement-driven upsell without exposing custom pricing publicly.",
      "Multi-function case studies (marketing, ops, engineering) reinforce the cross-functional positioning that justifies the per-user pricing model.",
      "Mature integration ecosystem (Slack, Google Workspace, Salesforce) locks in customers who built workflows around the platform.",
    ],
    whatToAdapt: [
      "When value scales with both team size AND coordination depth, per-user pricing with feature-tier upsells captures both axes simultaneously.",
      "Mechanical user-count caps (10 on Free) convert predictably as teams grow, beating feature-gate caps that create more buyer friction.",
      "Bundling structurally-related features at the anchor tier (Goals + Workload + Timeline at Advanced) creates a defensible price jump.",
    ],
    whatToAvoid: [
      "Do not adopt per-user pricing if individual users do not get clear individual value. Asana works because every cross-functional team member uses the platform; PM tools where one user per team coordinates fail per-user pricing.",
      "Do not gate cross-functional features (Goals, Timeline) at the cheapest paid tier. The Starter tier exists because not all paying teams need cross-functional depth; pricing the deep features into Starter dilutes the Advanced upgrade path.",
    ],
    brunsonLens: {
      stack: "Four-rung stack with progressive feature additions; Advanced tier is the visual anchor with structurally-related feature bundle.",
      valueLadder: "Full Value Ladder (Free → Starter → Advanced → Enterprise) with mechanical and structural upgrade triggers at each rung.",
      decoyOrAnchor: "Advanced tier as anchor; Starter as reasonable growth tier; Personal Free as visible adoption surface.",
      paymentMechanics: "Per-user monthly or annual with annual discount; no usage metering on task volume or storage.",
    },
    faqs: [
      {
        q: "Why is the Free tier capped at 10 users instead of being unlimited?",
        a: "Because 10 users is the structural team-formation threshold for cross-functional PM use cases. Teams that adopt Asana and grow past 10 users have proven they need real-team Asana use; the upgrade is mechanically predictable. A more generous free tier would dilute the conversion path and undermonetize the team-scale value.",
      },
      {
        q: "Why is Advanced 2.3x the price of Starter?",
        a: "Because Goals + Workload + Timeline + Portfolios is a structurally-related bundle that justifies the price jump. Buyers who need cross-functional depth (the Advanced audience) recognize the bundle as a different product category than basic PM. The 2.3x gap is calibrated to anchor the cross-functional buyer at Advanced while keeping Starter accessible for growing teams.",
      },
      {
        q: "Should an indie SaaS price per-user with feature tiers?",
        a: "Only when team adoption AND coordination depth both scale your value. Asana works because cross-functional teams generate both axes of value. For products where one axis dominates, single-axis pricing (per-user only or per-feature only) is usually cleaner.",
      },
      {
        q: "What is the Brunson lens on Asana's pricing?",
        a: "Four-rung Value Ladder with mechanical and structural upgrade triggers. The unusual element is the bundled-feature anchor at Advanced — Goals + Workload + Timeline collectively represent the cross-functional value proposition, and the pricing reflects the bundle rather than individual features. Brunson lesson: anchor tiers should bundle structurally-related features so the price jump represents a real product-category difference, not a feature checklist.",
      },
    ],
    tags: ["per-user", "user-cap-trigger", "bundled-anchor", "cross-functional-pm"],
    homepageUrl: "https://asana.com/",
    pricingPageUrl: "https://asana.com/pricing",
    lastVerified: "2026-05-18",
  },

  {
    slug: "airtable",
    displayName: "Airtable",
    creator: "Howie Liu, Andrew Ofstad, Emmett Nicholas",
    category: "Productivity and workspace",
    oneLine:
      "Airtable prices per-editor with the 5-editor free cap as the mechanical trigger. Automation runs and AI credits are secondary upgrade triggers.",
    tldr:
      "Airtable's pricing structure leans into the database-superpowers-for-non-developers positioning: 5 editors free, per-editor tiers add Interfaces, Automation runs, and AI credits. The lesson for indie founders: when your product has multiple value-capture moments (per-editor, per-automation, per-AI-call), layered triggers convert at different growth events. Single-axis pricing misses the secondary monetization paths.",
    productSnapshot: {
      whatTheySell:
        "A relational database platform for non-developers with Interfaces, Automations, and AI for building no-code internal tools.",
      whoFor:
        "Operations-heavy teams, marketers, ops leaders, and product managers who need structured data and internal tools without engineering.",
    },
    pricingStructure: {
      model: "Per-editor tiered subscription with Automation-runs and AI-credits secondary triggers",
      tiers: [
        {
          name: "Free",
          pricePoint: "$0",
          includes:
            "Up to 5 editors, unlimited bases, basic views, 100 automation runs/mo, limited AI credits, 1GB attachment storage.",
          audience: "Indie teams, ops leaders evaluating Airtable for internal-tool building.",
        },
        {
          name: "Team",
          pricePoint: "approximately $20/seat/mo billed annually (verified 2026-05-18)",
          includes:
            "25k records per base, 25k automation runs/mo, Interfaces, expanded AI credits, custom branding on forms.",
          audience: "Growing teams adopting Airtable for real ops workflows.",
        },
        {
          name: "Business",
          pricePoint: "approximately $45/seat/mo billed annually (verified 2026-05-18)",
          includes:
            "125k records per base, 100k automation runs/mo, advanced permissions, SAML, two-way sync with other apps.",
          audience: "Organizations scaling ops with multi-team coordination and governance needs.",
        },
        {
          name: "Enterprise Scale",
          pricePoint: "Custom (sales contact)",
          includes:
            "Custom records, unlimited automation runs, audit logs, advanced admin, dedicated success, custom retention.",
          audience: "Large organizations with procurement requirements and significant scale.",
        },
      ],
      paymentFrequency: "Monthly or annual with annual discount; per-editor pricing with automation runs metered separately at higher tiers",
      freeTrialBehavior:
        "Free tier IS the trial for small teams; paid tiers offer time-limited trials for full feature evaluation.",
    },
    anchorAnalysis: {
      pattern: "Business tier as anchor",
      analysis:
        "Business at approximately $45/seat/mo anchors the page for scaling ops teams. Team at approximately $20 reads as the natural starting tier for growing teams; Free is the entry. The unusual structural element is the multiple secondary triggers (record limits, automation runs, AI credits) — each scales independently of editor count, creating multiple paths to upgrade as ops workflows mature.",
    },
    upgradeTrigger: {
      pattern: "5-editor cap plus automation-runs cap plus record cap",
      analysis:
        "Three triggers fire together: 5-editor cap on Free is the primary structural trigger as ops teams grow; 100 automation runs/mo cap forces teams running workflows to upgrade quickly; 100k records per base on Team forces teams with significant data to upgrade to Business. The layered triggers mean Airtable monetizes at three different growth events rather than relying on a single conversion path.",
    },
    whatsWorking: [
      "5-editor free tier cap is mechanical and predictable as ops teams grow.",
      "Per-editor pricing aligns the bill with team adoption, which matches how Airtable usage scales.",
      "Automation runs as secondary trigger captures teams that automate workflows heavily.",
      "Record limits as tertiary trigger captures teams with significant data volume.",
      "AI credits as quaternary trigger captures teams adopting AI-augmented workflows.",
      "Interfaces feature at Team tier is the canonical differentiator that makes the Free-to-Team upgrade structurally compelling.",
    ],
    whatToAdapt: [
      "Layered upgrade triggers (multiple caps that scale independently) convert at different growth events and capture more revenue than single-axis pricing.",
      "Editor-count caps + automation-runs caps + record caps map to different team-maturity stages and trigger conversion at each stage.",
      "Anchor with a tier that has real customers (Business at $45/seat/mo for Airtable) not aspirational tiers.",
    ],
    whatToAvoid: [
      "Do not adopt multi-cap pricing without monitoring which cap actually drives conversion. Sometimes one cap dominates and the others are noise; pricing complexity without conversion data wastes optimization time.",
      "Do not adopt per-editor pricing if your value scales with viewers more than editors. Airtable's per-editor model works because editors are the value-creating role; if your viewers dominate the workflow, viewer-free + editor-paid (Figma model) is better.",
    ],
    brunsonLens: {
      stack: "Four-rung stack with multiple secondary triggers; Business tier is the visual anchor.",
      valueLadder: "Full Value Ladder with editor-count primary trigger and automation/records/AI secondary triggers.",
      decoyOrAnchor: "Business tier as anchor; Team as reasonable growth tier; Free as ops-team adoption surface.",
      paymentMechanics: "Per-editor monthly or annual with annual discount; automation runs and records metered at higher tiers.",
    },
    faqs: [
      {
        q: "Why does Airtable use multiple upgrade caps instead of just one?",
        a: "Because different ops workflows hit different caps first. Teams that build many automations hit the automation-runs cap before the editor cap; teams with large data hit the record cap first. Multiple caps mean Airtable monetizes at whichever growth event happens first for each customer.",
      },
      {
        q: "Should an indie SaaS use multi-cap pricing?",
        a: "Only when your value genuinely scales on multiple axes. Adding caps without underlying value-axis differentiation creates pricing complexity that converts buyers worse. Multi-cap pricing is right when buyers can recognize each cap as a real cost driver.",
      },
      {
        q: "Why is Interfaces gated at Team instead of Free?",
        a: "Because Interfaces is the structural differentiator that makes Airtable a no-code-app platform rather than just a database. Gating Interfaces at Team forces teams that want internal-tool building to upgrade, which is the core monetization path. Putting Interfaces on Free would undermonetize the canonical use case.",
      },
      {
        q: "What is the Brunson lens on Airtable's pricing?",
        a: "Four-rung Value Ladder with layered upgrade triggers (editor count, automation runs, records, AI credits). The unusual element is the depth of secondary-trigger pricing — most SaaS use one cap; Airtable uses four because the ops use cases create four real cost drivers. Brunson lesson: pricing complexity is justified when it matches real value-axis differentiation; otherwise it costs conversion.",
      },
    ],
    tags: ["per-editor", "layered-triggers", "automation-runs", "no-code-database"],
    homepageUrl: "https://www.airtable.com/",
    pricingPageUrl: "https://www.airtable.com/pricing",
    lastVerified: "2026-05-18",
  },

  {
    slug: "framer",
    displayName: "Framer",
    creator: "Koen Bok and Jorn van Dijk",
    category: "Design and prototyping",
    oneLine:
      "Framer bifurcates pricing: per-site for publishing, per-seat for design. The two pricing axes match the two value-capture moments.",
    tldr:
      "Framer's pricing structure separates the publishing value-capture moment (per-site) from the design-time value-capture moment (per-seat). The bifurcation matches the actual value moments: publishing is when the design becomes live; designing is the ongoing collaborative work. The lesson for indie founders: when your product has multiple distinct value-capture moments, bifurcated pricing axes capture each axis independently — single-axis pricing leaves money on the table at the secondary value moment.",
    productSnapshot: {
      whatTheySell:
        "A design-and-publish platform that lets designers ship live marketing sites and landing pages without engineering handoff.",
      whoFor:
        "Designers building marketing sites and landing pages who want to publish their design work directly without coding or engineering involvement.",
    },
    pricingStructure: {
      model: "Bifurcated pricing: per-site for publishing + per-seat for design tier",
      tiers: [
        {
          name: "Free",
          pricePoint: "$0",
          includes:
            "Unlimited free sites with framer.website subdomain, basic CMS, animations, components, 1 editor.",
          audience: "Designers evaluating Framer or shipping non-commercial side projects.",
        },
        {
          name: "Mini (per site)",
          pricePoint: "approximately $5/site/mo (verified 2026-05-18)",
          includes:
            "Custom domain, removes Framer branding, basic analytics, 1000 monthly visitors.",
          audience: "Indie founders launching small marketing sites with custom domains.",
        },
        {
          name: "Basic (per site)",
          pricePoint: "approximately $15/site/mo (verified 2026-05-18)",
          includes:
            "10k monthly visitors, advanced CMS, password protection, expanded asset storage.",
          audience: "Growing indie SaaS marketing sites and landing pages with real traffic.",
        },
        {
          name: "Pro (per site)",
          pricePoint: "approximately $30/site/mo (verified 2026-05-18)",
          includes:
            "200k monthly visitors, advanced CMS, SEO optimization, password protection, partial site editing for clients.",
          audience: "Established sites with significant traffic; agencies building client sites.",
        },
        {
          name: "Design tier (per seat)",
          pricePoint:
            "approximately $15/seat/mo Pro tier for advanced design capabilities (verified 2026-05-18)",
          includes:
            "Advanced design features, components, design system tools, team collaboration on design files.",
          audience: "Design teams collaborating on multiple projects simultaneously.",
        },
        {
          name: "Enterprise",
          pricePoint: "Custom (sales contact)",
          includes:
            "SLA, dedicated success, advanced security, custom contracts.",
          audience: "Larger companies with significant publishing or design scale.",
        },
      ],
      paymentFrequency: "Monthly or annual with annual discount; per-site tiers for publishing + per-seat tiers for design",
      freeTrialBehavior:
        "Free tier IS the trial; sites can publish on framer.website subdomain at no cost for evaluation.",
    },
    anchorAnalysis: {
      pattern: "Bifurcated pricing as anchor",
      analysis:
        "Framer's anchor mechanic is structural rather than tier-based. The two pricing axes (per-site for publishing, per-seat for design) anchor against the alternative (build the site in Webflow with per-site pricing only, or design in Figma and pay engineering to publish). Buyers comparing Framer recognize the bifurcation as honest — you pay for what you use on each axis. The complexity is justified by the two-distinct-value-moment structure.",
    },
    upgradeTrigger: {
      pattern: "Per-site visitor cap plus design-team-scale trigger",
      analysis:
        "Two trigger types fire: per-site upgrades fire when sites hit the visitor cap on lower tiers (Mini at 1k/mo, Basic at 10k/mo, Pro at 200k/mo); per-seat design tier upgrades fire when design teams add collaborators. The triggers operate on independent axes — site traffic growth and design team growth are uncorrelated, so each axis monetizes separately.",
    },
    whatsWorking: [
      "Bifurcated pricing axes match the two distinct value-capture moments (publishing vs designing).",
      "Per-site visitor caps as upgrade triggers map to mechanical growth events that buyers understand intuitively.",
      "Free tier with framer.website subdomain seeds visible-customer presence — designers see other Framer-built sites and recognize the aesthetic.",
      "Branded subdomain (framer.website) removal at the Mini tier captures the publishing-moment willingness-to-pay spike.",
      "Native CMS at higher tiers handles dynamic content needs without external CMS integration.",
      "Per-seat design tier captures collaborative-design value separately from publishing value.",
    ],
    whatToAdapt: [
      "When your product has multiple distinct value-capture moments, bifurcated pricing axes capture each axis independently.",
      "Per-site (or per-unit) pricing matches publishing-style value; per-seat matches collaboration-style value. Mixing them maps to multi-axis value structures.",
      "Visitor caps as per-site upgrade triggers match how sites actually grow — traffic is the value driver buyers recognize.",
    ],
    whatToAvoid: [
      "Do not bifurcate pricing if your value-capture moments are not actually distinct. The complexity costs conversion when buyers cannot map the axes to their own workflow.",
      "Do not gate the per-site publishing capability behind per-seat pricing. Framer works because designers can publish many sites without adding seats — bundling the axes would lose the indie-designer segment.",
    ],
    brunsonLens: {
      stack: "Bifurcated stack: per-site stack for publishing + per-seat stack for design.",
      valueLadder: "Multi-axis Value Ladder with publishing tiers and design tiers as parallel ladders.",
      decoyOrAnchor: "Bifurcation-as-anchor; the structural distinctness of axes anchors against single-axis competitors.",
      paymentMechanics: "Per-site monthly or annual for publishing + per-seat monthly or annual for design; visitor caps metered per site.",
    },
    faqs: [
      {
        q: "Why does Framer bifurcate pricing instead of using just per-seat?",
        a: "Because publishing and designing are distinct value-capture moments. Per-seat pricing alone undermonetizes the publishing value (designers who publish many sites for clients would pay too little); per-site pricing alone undermonetizes the design value (large design teams collaborating on one site would pay too little). Bifurcation captures both axes.",
      },
      {
        q: "Should other no-code-site builders adopt bifurcated pricing?",
        a: "Only if their value-capture moments are genuinely distinct. Webflow's pricing is bifurcated similarly (per-site for hosting, per-workspace for design). For pure design tools (Figma) or pure hosting tools (Vercel), single-axis pricing is cleaner. Bifurcation matches multi-axis value, not all products have it.",
      },
      {
        q: "Why is per-site pricing more aggressive at higher visitor caps?",
        a: "Because traffic growth is a strong proxy for site value to the customer. Sites with 200k monthly visitors typically drive significant revenue or audience value for their owner, justifying higher Framer fees. The pricing scales with the value Framer is helping the customer create.",
      },
      {
        q: "What is the Brunson lens on Framer's pricing?",
        a: "Multi-axis Value Ladder with bifurcated pricing matching distinct value-capture moments. The unusual element is the structural honesty of the bifurcation — single-axis competitors leave money on the table by ignoring one of the two value moments. Brunson lesson: pricing structure should match value structure; when your value has multiple axes, your pricing should too.",
      },
    ],
    tags: ["bifurcated-pricing", "per-site-plus-per-seat", "visitor-cap-trigger", "publish-and-design"],
    homepageUrl: "https://www.framer.com/",
    pricingPageUrl: "https://www.framer.com/pricing",
    lastVerified: "2026-05-18",
  },

  {
    slug: "substack",
    displayName: "Substack",
    creator: "Hamish McKenzie, Chris Best, Jairaj Sethi",
    category: "Newsletter platform",
    oneLine:
      "Substack charges no upfront fee — writers join free. The 10% revenue-share on paid subscriptions captures value only when writers succeed.",
    tldr:
      "Substack's pricing structure is the canonical revenue-share model: writers join the platform for free and Substack takes 10% of paid subscription revenue plus Stripe fees. The model removes adoption friction at the canonical decision point and aligns Substack's incentives with writer success. The lesson for indie founders: when your platform value scales with customer revenue, revenue-share pricing removes upfront friction AND ensures you only win when customers win.",
    productSnapshot: {
      whatTheySell:
        "A publication platform for writers with paid subscriptions, Notes (Twitter-style microblogging), Recommendations (cross-publication discovery), and the unified Substack app.",
      whoFor:
        "Writers, journalists, essayists building publications with paid subscriptions and audience growth through Substack's discovery network.",
    },
    pricingStructure: {
      model: "Free platform with revenue-share on paid subscriptions",
      tiers: [
        {
          name: "Free platform",
          pricePoint: "$0 to publish",
          includes:
            "Unlimited free posts, unlimited free subscribers, custom domain, Notes, Recommendations, Substack app surface, full publication tooling.",
          audience: "All writers — Substack has no paid platform tier.",
        },
        {
          name: "Revenue share on paid subscriptions",
          pricePoint:
            "10% of paid subscription revenue + Stripe fees (~2.9% + 30¢) per transaction (verified 2026-05-18)",
          includes:
            "All platform features included; Substack takes 10% only when writers monetize via paid subscriptions.",
          audience: "Writers who enable paid subscriptions and have paying subscribers.",
        },
        {
          name: "Custom (publishers and partnerships)",
          pricePoint: "Negotiated for large publishers or strategic partnerships",
          includes:
            "Custom terms for high-volume publishers or strategic partnerships.",
          audience: "Large publishers or strategic partners.",
        },
      ],
      paymentFrequency: "Revenue share deducted per transaction; writers receive net revenue via Stripe payouts",
      freeTrialBehavior:
        "Free platform IS the trial; writers can publish for years without paying anything if they do not enable paid subscriptions.",
    },
    anchorAnalysis: {
      pattern: "Free-platform anchor",
      analysis:
        "Substack's pricing has no anchor in the traditional sense — there are no tiers to anchor between. The single anchor is the free-to-publish promise itself. Writers comparing Substack to subscription platforms (Beehiiv, Kit) see one number ($0 upfront) and recognize the no-friction adoption value. The 10% revenue share is positioned as the success-fee, not as a tier — it only fires when writers succeed.",
    },
    upgradeTrigger: {
      pattern: "Paid subscription activation",
      analysis:
        "The only trigger is when writers enable paid subscriptions and gain paying subscribers. Substack receives revenue only at that moment. Writers who publish for years without monetizing cost Substack nothing; writers who monetize pay 10% proportionally. The trigger is binary (paid subscriptions enabled or not) and aligns with the success moment.",
    },
    whatsWorking: [
      "Free platform removes adoption friction at the canonical decision point.",
      "Revenue share aligns Substack's incentives with writer success — Substack only wins when writers win.",
      "10% take rate is positioned as the success fee, not as a platform fee — writers do not feel the cost until they have revenue to share.",
      "Single-line pricing eliminates evaluation complexity at the platform-comparison stage.",
      "Network effects (Recommendations, Notes, app) compound at no marginal cost to writers, making the platform feel more valuable over time.",
      "Custom partnerships for large publishers preserves negotiation flexibility without exposing custom rates publicly.",
    ],
    whatToAdapt: [
      "When your platform value scales with customer revenue, revenue-share pricing removes upfront friction AND ensures incentive alignment.",
      "Free-platform-plus-success-fee converts buyers who would reject subscription pricing on principle.",
      "Position the revenue share as a success fee, not as a platform fee — the framing matters for buyer perception.",
    ],
    whatToAvoid: [
      "Do not adopt revenue-share pricing if your platform cost does not scale with customer revenue. The model only works when the economics align — fixed-cost platforms with variable-revenue customers go broke on revenue share.",
      "Do not set the take rate too high if writer margins are thin. Substack's 10% works for paid newsletter subscriptions; for higher-margin businesses 30% (Apple) works, for lower-margin businesses 5% might be the ceiling.",
    ],
    brunsonLens: {
      stack: "Single-rung stack — free platform with success-fee monetization. No tier stack.",
      valueLadder: "Single transactional rung (free + revenue share) with custom partnerships as off-ladder option.",
      decoyOrAnchor: "Free-platform anchor; the absence of upfront pricing IS the anchor mechanism.",
      paymentMechanics: "Revenue share per paid subscription transaction; no monthly base, no per-subscriber metering for free subscribers.",
    },
    faqs: [
      {
        q: "Why does Substack take 10% instead of charging a subscription?",
        a: "Because revenue share removes upfront adoption friction. Writers join for free and only pay when they succeed; the model captures Substack's value at the success moment rather than at the friction-laden adoption moment. Subscription pricing would lose writers who cannot commit before they have revenue.",
      },
      {
        q: "Should an indie SaaS use revenue-share pricing?",
        a: "Only when your platform value scales with customer revenue AND your platform cost scales similarly. Software platforms that monetize through customer success (marketplaces, creator platforms, MoR providers) fit. Fixed-cost software platforms with variable-revenue customers do not — the unit economics fail at scale.",
      },
      {
        q: "Is 10% the right revenue-share rate for creator platforms?",
        a: "Substack's 10% is calibrated for paid-newsletter economics. Apple's App Store charges 30% (high-margin software); Gumroad charges 10% (similar creator economics); Polar charges ~4% (no network effects to fund). The right rate depends on platform-cost economics and the value-add the platform provides beyond infrastructure.",
      },
      {
        q: "What is the Brunson lens on Substack's pricing?",
        a: "Single-rung Value Ladder with revenue-share monetization aligned to writer success. The unusual element is the structural alignment — Substack's incentives ARE writer success, not just claim to be. Brunson lesson: when platform value depends on customer success, pricing should structure that dependency rather than divorce platform revenue from customer outcomes.",
      },
    ],
    tags: ["revenue-share", "free-platform", "incentive-alignment", "success-fee"],
    homepageUrl: "https://substack.com/",
    pricingPageUrl: "https://substack.com/going-paid",
    lastVerified: "2026-05-18",
  },

  {
    slug: "confluence",
    displayName: "Confluence",
    creator: "Atlassian",
    category: "Knowledge management and wiki",
    oneLine:
      "Confluence prices per user with bundle leverage. The pricing story is the suite, not the standalone page.",
    tldr:
      "Confluence runs Atlassian-style per-user tiered pricing with a generous-but-capped free tier and meaningful suite bundling. The free tier (up to 10 users) is a top-of-funnel catcher for the eventual Jira sale; paid tiers ascend through Standard, Premium, and Enterprise with feature gates calibrated for IT-led mid-market and enterprise procurement. The lesson for indie founders: per-user pricing only works when you have a buyer who already thinks in seats, and bundle leverage only works when you have a bundle.",
    productSnapshot: {
      whatTheySell:
        "A team wiki and documentation platform sold standalone and as part of the Atlassian suite.",
      whoFor:
        "Engineering organisations, IT-led mid-market and enterprise teams, and Atlassian-suite customers needing tightly-integrated documentation.",
    },
    pricingStructure: {
      model: "Per-user tiered subscription with suite-bundle discounts",
      tiers: [
        {
          name: "Free",
          pricePoint: "$0 (up to 10 users)",
          includes: "Core wiki and docs with basic permissions; capped at 10 users and limited apps.",
          audience: "Small teams evaluating, or small teams that may eventually upgrade to Jira too.",
        },
        {
          name: "Standard",
          pricePoint: "~$6/user/month (verified 2026-05-18)",
          includes: "Unlimited users, granular permissions, page versioning, more storage.",
          audience: "Growing teams past 10 users who need basic governance.",
        },
        {
          name: "Premium",
          pricePoint: "~$11/user/month (verified 2026-05-18)",
          includes: "Advanced analytics, sandbox, SLA, IP allowlisting, advanced auditing.",
          audience: "Mid-market teams with security and governance requirements.",
        },
        {
          name: "Enterprise",
          pricePoint: "Quote (typically minimum 800 users)",
          includes: "SSO/SAML, SCIM, data residency, dedicated support, compliance certifications.",
          audience: "Enterprises with IT-led procurement and compliance buyers.",
        },
      ],
      paymentFrequency: "Monthly or annual; annual discount applied at checkout. Suite-bundle discounts when bought with Jira and other Atlassian products.",
      freeTrialBehavior:
        "Standard, Premium, and Enterprise plans offer 7-to-14-day trials with full feature access; free tier persists indefinitely at the 10-user cap.",
    },
    anchorAnalysis: {
      pattern: "Premium-anchored ladder with enterprise tail",
      analysis:
        "Premium is the visual anchor on the pricing page — the most-feature-rich tier short of enterprise quote. The Premium tier signals 'serious teams pay roughly $11/user/month' which makes Standard read as the entry-level rather than the cheap option. Enterprise is the implicit ceiling that gives Premium social permission to feel reasonable.",
    },
    upgradeTrigger: {
      pattern: "Hard caps and governance gates",
      analysis:
        "Upgrade from Free is triggered hard at 11 users. Upgrade from Standard to Premium is triggered when governance, analytics, or compliance becomes a procurement requirement — typically IT-led. Upgrade from Premium to Enterprise is triggered by SSO, audit, and data residency requirements that mid-market teams cannot self-serve.",
    },
    whatsWorking: [
      "Per-user tiered pricing maps cleanly to how IT-led mid-market buyers think about software cost.",
      "Free tier at 10 users is generous enough to onboard small teams without being a long-term home.",
      "Suite-bundle leverage lets Confluence compete on price within the Atlassian ecosystem in ways standalone wikis cannot match.",
      "Enterprise tier sits behind a quote, preserving negotiation surface and signalling 'we serve real enterprises'.",
      "Premium-anchor positioning makes Standard feel like the entry rather than the cheap option.",
    ],
    whatToAdapt: [
      "If your buyer thinks in seats, per-user pricing is structurally easier to budget than per-anything-else.",
      "A hard user cap (not a feature cap) on the free tier is the cleanest upgrade trigger when seats are the value unit.",
      "Quote-pricing for enterprise is the right move when contracts need negotiation; transparent pricing is wrong for that buyer.",
    ],
    whatToAvoid: [
      "Do not copy per-user pricing if your buyer is a single founder — they are not budgeting in seats.",
      "Do not rely on bundle leverage you do not have; standalone products cannot mimic suite economics.",
      "Do not gate enterprise behind a quote unless you have actual enterprise infrastructure to deliver.",
    ],
    brunsonLens: {
      stack: "Standard-Premium-Enterprise ladder with feature stacking calibrated for IT-led procurement.",
      valueLadder: "Free wiki → Standard collaboration → Premium governance → Enterprise compliance.",
      decoyOrAnchor: "Premium is the anchor; Enterprise is the implicit ceiling that justifies it.",
      paymentMechanics: "Per-user monthly or annual; annual discount; bundle leverage within Atlassian suite.",
    },
    faqs: [
      {
        q: "Why does Confluence cap the free tier at 10 users?",
        a: "Because below 10 users, retention into the Atlassian funnel is more valuable than payment. Above 10 users, the team is large enough that paying for governance and unlimited seats becomes worth it, and the Atlassian-suite cross-sell motion starts.",
      },
      {
        q: "Is the suite bundle really cheaper?",
        a: "Often yes — Atlassian bundles Confluence with Jira and other products at meaningful discount versus standalone pricing. The bundle is the entire reason Confluence's per-user numbers can compete with cheaper standalone wikis.",
      },
      {
        q: "Why is Enterprise quote-pricing?",
        a: "Because enterprise procurement expects negotiation, custom terms, and contract minimums. Transparent enterprise pricing leaves money on the table and signals the wrong buyer profile to IT departments.",
      },
      {
        q: "Can an indie SaaS copy Confluence's pricing model?",
        a: "Only if the indie SaaS has a per-user buyer (teams, not individuals) and is willing to absorb the IT-led sales motion at the top. For a single-founder buyer, per-user pricing creates the wrong friction at the wrong stage.",
      },
      {
        q: "What is the Brunson lens on Confluence's pricing?",
        a: "Per-user ladder with a premium anchor, calibrated for IT-led procurement. Brunson lesson: pricing structure should match the buyer's mental model — per-user works when the buyer thinks in headcount, fails when the buyer thinks in 'one person trying to use the product'.",
      },
    ],
    tags: ["per-user", "suite-leverage", "enterprise", "knowledge-management"],
    homepageUrl: "https://www.atlassian.com/software/confluence",
    pricingPageUrl: "https://www.atlassian.com/software/confluence/pricing",
    lastVerified: "2026-05-18",
  },

  {
    slug: "savvycal",
    displayName: "SavvyCal",
    creator: "Derrick Reimer",
    category: "Scheduling and meeting booking",
    oneLine:
      "SavvyCal prices flat per user with no tier explosion. The pricing page reinforces the craft-tool positioning the product already established.",
    tldr:
      "SavvyCal's pricing is a deliberate two-tier ladder: Basic for solo users, Premium for power users, with team pricing as a third quiet tier. Prices are flat-monthly with annual discount, no per-meeting fees, no enterprise quote-wall. The lesson for indie founders: when your product positions as a craft tool, the pricing page should be restrained and predictable — pricing complexity contradicts a craft positioning even when each individual tier is justified.",
    productSnapshot: {
      whatTheySell:
        "A scheduling tool whose differentiator is overlaying the recipient's calendar on the booking page.",
      whoFor:
        "Founders, consultants, and senders who book peer-to-peer meetings and want a scheduling experience that signals respect.",
    },
    pricingStructure: {
      model: "Flat per-user tiered subscription",
      tiers: [
        {
          name: "Free",
          pricePoint: "$0",
          includes: "One scheduling link, core overlay UX, basic integrations.",
          audience: "Solo users sampling the overlay experience.",
        },
        {
          name: "Basic",
          pricePoint: "~$12/user/month (verified 2026-05-18)",
          includes: "Unlimited links, calendar overlay, payment integrations, branding controls.",
          audience: "Solo founders, consultants, and individual senders.",
        },
        {
          name: "Premium",
          pricePoint: "~$20/user/month (verified 2026-05-18)",
          includes: "Advanced routing, automations, additional calendar accounts, premium integrations.",
          audience: "Power users with complex scheduling workflows.",
        },
        {
          name: "Team / Workspace",
          pricePoint: "Per-user pricing with team discounts (verified 2026-05-18)",
          includes: "Shared team scheduling, collective availability, team-level branding.",
          audience: "Small teams running scheduling collaboratively.",
        },
      ],
      paymentFrequency: "Monthly or annual; annual discount roughly two months free.",
      freeTrialBehavior:
        "Free tier is a real free tier (one link forever) rather than a 14-day trial; paid tiers offer trial windows on signup.",
    },
    anchorAnalysis: {
      pattern: "Premium-as-anchor with restrained ladder",
      analysis:
        "Premium is the anchor that makes Basic feel like the obvious entry. The ladder is deliberately short — only three real paid tiers — which reinforces the 'craft tool, not enterprise sprawl' positioning the product is built on. There is no decoy tier and no quote-wall.",
    },
    upgradeTrigger: {
      pattern: "Workflow depth as upgrade driver",
      analysis:
        "Upgrade from Free to Basic is triggered by needing more than one scheduling link. Upgrade from Basic to Premium is triggered by routing complexity, multi-calendar accounts, or automation needs — typically the moment a solo user starts handling meaningfully more inbound bookings.",
    },
    whatsWorking: [
      "Flat per-user pricing avoids the per-meeting-fee trap and matches how solo founders budget software.",
      "Restrained 3-tier ladder reinforces craft-tool positioning consistent with the product's UX.",
      "Premium tier is the anchor that makes Basic feel reasonable rather than expensive.",
      "Real free tier (one link forever) lets the overlay UX be experienced before any purchase decision.",
      "No quote-wall keeps the pricing experience honest and matches the indie buyer's preferences.",
    ],
    whatToAdapt: [
      "If your product positions as a craft tool, keep the pricing page restrained — short ladder, no decoys, no quote-walls.",
      "A real free tier (limited but unlimited-in-time) lets the differentiator be experienced; trial windows do not give the same proof.",
      "Anchor with a Premium tier that justifies the entry-level price rather than discounting the entry-level toward the floor.",
    ],
    whatToAvoid: [
      "Do not add tiers just because competitors have them — extra tiers contradict craft-tool positioning.",
      "Do not gate the differentiating UX behind the paid tier — the free tier exists to demonstrate the wedge.",
      "Do not introduce per-meeting fees as the product scales — the absence of per-unit pricing is part of SavvyCal's wedge.",
    ],
    brunsonLens: {
      stack: "Free → Basic → Premium → Team; short, restrained, premium-anchored stack.",
      valueLadder: "Free overlay sample → Basic for solo founders → Premium for workflow depth → Team for small groups.",
      decoyOrAnchor: "Premium is the anchor that makes Basic feel like the right entry; no decoy.",
      paymentMechanics: "Flat per-user monthly or annual; annual discount; no per-meeting or per-booking fees.",
    },
    faqs: [
      {
        q: "Why does SavvyCal not have a per-meeting fee?",
        a: "Because per-meeting fees create the wrong sender behaviour — they signal that the platform extracts value per booking, which contradicts the recipient-respecting positioning. Flat per-user pricing aligns the economics with the brand.",
      },
      {
        q: "Is SavvyCal more or less expensive than Calendly?",
        a: "Roughly comparable at the indie tier; per-seat economics diverge at higher tiers because Calendly's enterprise team features scale aggressively. For one-to-five user teams, the pricing is similar enough that craft and UX preferences drive the decision.",
      },
      {
        q: "Why is the free tier limited to one link?",
        a: "Because one link is enough to experience the overlay UX with a real recipient — the entire wedge of the product. Limiting to one link forces the upgrade decision when the user has multiple use-cases, which is the natural Basic-tier trigger.",
      },
      {
        q: "Can an indie SaaS copy SavvyCal's pricing model?",
        a: "Yes, if the product genuinely supports flat-per-user economics. Flat pricing only works when marginal cost per user is low and the average customer's value is high enough to absorb it. Check the unit economics before copying the shape.",
      },
      {
        q: "What is the Brunson lens on SavvyCal's pricing?",
        a: "Restrained ladder with premium anchor and free-tier-as-experiential-proof. Brunson lesson: pricing page consistency with product positioning matters — a craft-tool product needs a craft-tool pricing page, not enterprise SaaS sprawl.",
      },
    ],
    tags: ["per-user", "flat-pricing", "craft-tool", "scheduling"],
    homepageUrl: "https://savvycal.com/",
    pricingPageUrl: "https://savvycal.com/pricing",
    lastVerified: "2026-05-18",
  },

  {
    slug: "ghost",
    displayName: "Ghost",
    creator: "John O'Nolan",
    category: "Newsletter and publishing platforms",
    oneLine:
      "Ghost's pricing is the principle — zero platform cut on subscription revenue, member-tier pricing on managed hosting. The pricing page is the proof.",
    tldr:
      "Ghost(Pro) prices by member count with a flat-per-tier subscription, charges zero percent on subscription revenue beyond Stripe fees, and ships self-hosting free under the open-source license. The pricing model is structural proof of the ownership positioning: at scale, Ghost is dramatically cheaper than managed creator networks. The lesson for indie founders: when your positioning depends on a principle, the pricing page should be the most concrete evidence of it.",
    productSnapshot: {
      whatTheySell:
        "An open-source publishing platform for newsletters, blogs, and membership publications.",
      whoFor:
        "Writers, publishers, and small media companies who want a fully owned site with no platform cut on subscription revenue.",
    },
    pricingStructure: {
      model: "Member-count tiered subscription (Ghost Pro) with free self-host alternative",
      tiers: [
        {
          name: "Self-host (open source)",
          pricePoint: "$0 (infrastructure cost only)",
          includes: "Full Ghost software; you provide hosting, updates, and ops; no platform cut.",
          audience: "Technical writers and publishers who want full ownership and can run a server.",
        },
        {
          name: "Ghost Pro Starter",
          pricePoint: "~$11/month (up to ~500 members; verified 2026-05-18)",
          includes: "Managed hosting, automatic backups, official theme support, no platform cut on subscription revenue.",
          audience: "New writers launching paid newsletters who want zero ops burden.",
        },
        {
          name: "Ghost Pro Creator",
          pricePoint: "~$31/month (up to ~1,000 members; verified 2026-05-18)",
          includes: "Custom theme support, more bandwidth, integrations, more newsletters.",
          audience: "Growing newsletter publications with active member growth.",
        },
        {
          name: "Ghost Pro Team",
          pricePoint: "~$63/month (up to ~10,000 members; verified 2026-05-18)",
          includes: "Multi-author publications, priority support, deeper member-management tools.",
          audience: "Multi-author publications and small media companies.",
        },
        {
          name: "Ghost Pro Business",
          pricePoint: "~$199/month (up to ~25,000 members; verified 2026-05-18) and above by quote",
          includes: "Advanced caching, deeper SLA, dedicated infrastructure for high-volume publications.",
          audience: "Established publications and growing media businesses.",
        },
      ],
      paymentFrequency: "Monthly or annual; annual discount; member-count-based tier triggers.",
      freeTrialBehavior:
        "Ghost Pro offers a 14-day free trial; self-host is permanently free open-source.",
    },
    anchorAnalysis: {
      pattern: "Self-host-as-floor, member-count-as-ladder",
      analysis:
        "The free self-host option anchors the entire pricing page as 'this is open source, you can run it yourself'. Ghost(Pro) then prices managed hosting on member-count tiers — a usage-aligned metric that scales with the publisher's success rather than with their team or seat count. The Business tier sits as the implicit enterprise ceiling.",
    },
    upgradeTrigger: {
      pattern: "Member-growth as upgrade driver",
      analysis:
        "Upgrade from Starter to Creator is triggered at ~500 paying members — typically when a newsletter has demonstrated real product-market fit. Subsequent tier upgrades follow member growth at fixed thresholds. The zero-revenue-cut economics mean the publisher captures the marginal revenue from growth, not the platform.",
    },
    whatsWorking: [
      "Zero platform cut on subscription revenue is structurally cheaper than Substack at scale, and the math is verifiable.",
      "Self-host option proves the open-source positioning is real, not marketing.",
      "Member-count tiers align platform cost with publisher growth rather than team size.",
      "Tier thresholds are publicly visible — no quote-wall, no negotiation surface needed.",
      "Annual discount aligns publisher cashflow with annual subscription revenue patterns.",
    ],
    whatToAdapt: [
      "If your positioning depends on a principle (ownership, transparency, no-lock-in), the pricing page is your most concrete evidence — make it match.",
      "Usage-aligned pricing (member count, customer count) feels fairer to growing customers than per-seat for the same revenue.",
      "Publishing tier thresholds publicly reinforces transparency positioning; quote-walls contradict it.",
    ],
    whatToAvoid: [
      "Do not copy zero-revenue-cut economics if your platform genuinely depends on percentage revenue — the math has to work.",
      "Do not assume open-source self-host will dominate revenue — Ghost(Pro) is the commercial engine.",
      "Do not price below cost for the principle alone — Ghost's economics work because the marginal cost per member is low.",
    ],
    brunsonLens: {
      stack: "Self-host → Starter → Creator → Team → Business; member-count-aligned stack.",
      valueLadder: "Free self-host → Starter for new publications → Creator for growing → Team for publications → Business for scale.",
      decoyOrAnchor: "Self-host anchors the entire ladder as principled; Business is the implicit ceiling.",
      paymentMechanics: "Member-count tiered monthly or annual; zero platform cut on subscription revenue beyond Stripe fees.",
    },
    faqs: [
      {
        q: "Why does Ghost charge zero percent on subscription revenue?",
        a: "Because the ownership positioning depends on it. A platform cut would contradict 'you own your audience and your economics'. The fixed-tier model captures revenue from hosting, not from publisher success.",
      },
      {
        q: "Is self-hosting actually free?",
        a: "The Ghost software is free under the open-source license. You pay only for the server you run it on (typically $5-20/month). Updates, backups, and ops are your responsibility — that is the trade-off versus Ghost Pro.",
      },
      {
        q: "When should I migrate from Ghost Pro to self-host?",
        a: "Almost never unless you have specific technical or compliance reasons. Ghost Pro is dramatically cheaper than the cost of an engineer's time to maintain self-hosting; the cost crossover happens at very large scale or when you already have ops infrastructure.",
      },
      {
        q: "Is Ghost Pro cheaper than Substack?",
        a: "At zero revenue, Substack is free vs Ghost Pro's $11/month base. At meaningful subscription revenue, Ghost Pro is dramatically cheaper because Substack takes 10% of subscriptions whereas Ghost takes nothing. Crossover happens around the first few hundred dollars of monthly subscription revenue.",
      },
      {
        q: "What is the Brunson lens on Ghost's pricing?",
        a: "Principle-aligned tiered pricing with usage-based thresholds. Brunson lesson: when your positioning is principled, the pricing page is your most-tested evidence — readers will compare your structure to your claims, and any mismatch destroys trust faster than the positioning earned it.",
      },
    ],
    tags: ["principle-led", "open-source", "member-tiered", "no-platform-cut"],
    homepageUrl: "https://ghost.org/",
    pricingPageUrl: "https://ghost.org/pricing/",
    lastVerified: "2026-05-18",
  },

  {
    slug: "monday",
    displayName: "Monday.com",
    creator: "Roy Mann and Eran Zinman",
    category: "Project management and work-OS platform",
    oneLine:
      "Monday prices per seat with minimum-seat thresholds and feature-gated tiers. The pricing page is built for trial-led conversion under paid-acquisition amplification.",
    tldr:
      "Monday's pricing runs per-seat through Basic, Standard, Pro, and Enterprise tiers with feature gates calibrated for non-technical team buyers. Minimum-seat thresholds on most tiers push toward team adoption rather than solo use. The free tier is capped at 2 users — explicitly a downgrade catcher, not a primary entry. The lesson for indie founders: when your acquisition is paid-trial-led, the pricing page job is to convert a trial-warm buyer to a team subscription, not to win a cold reader.",
    productSnapshot: {
      whatTheySell:
        "A visual work-OS platform with vertical products (Work Management, Dev, CRM, Service).",
      whoFor:
        "Non-technical team leads who want a visual project management surface their team will adopt.",
    },
    pricingStructure: {
      model: "Per-seat tiered subscription with minimum-seat thresholds",
      tiers: [
        {
          name: "Free",
          pricePoint: "$0 (up to 2 users)",
          includes: "Core boards, basic dashboards, very limited integrations and automations.",
          audience: "Solo evaluators and 2-person teams sampling the UX before paying.",
        },
        {
          name: "Basic",
          pricePoint: "~$9/seat/month with 3-seat minimum (verified 2026-05-18)",
          includes: "Unlimited free viewers, unlimited items, basic dashboards, 5GB storage.",
          audience: "Small teams who need core project management on a Monday-shaped surface.",
        },
        {
          name: "Standard",
          pricePoint: "~$12/seat/month with 3-seat minimum (verified 2026-05-18)",
          includes: "Timeline and Gantt views, calendar view, guest access, automations, integrations.",
          audience: "Growing teams who need timelines, automations, and external collaboration.",
        },
        {
          name: "Pro",
          pricePoint: "~$19/seat/month with 3-seat minimum (verified 2026-05-18)",
          includes: "Private boards, time tracking, formula columns, advanced automations, dependency tracking.",
          audience: "Teams running complex workflows with private boards and time tracking.",
        },
        {
          name: "Enterprise",
          pricePoint: "Quote (typically larger team minimums)",
          includes: "Enterprise SSO, advanced security, advanced reporting, dedicated CS, governance.",
          audience: "Mid-market and enterprise teams with security and governance requirements.",
        },
      ],
      paymentFrequency: "Monthly or annual; annual discount roughly 18 percent; seat minimums on paid tiers.",
      freeTrialBehavior:
        "All paid tiers offer 14-day free trials with no credit card; free tier is a permanent 2-user catcher.",
    },
    anchorAnalysis: {
      pattern: "Pro-as-anchor with enterprise ceiling",
      analysis:
        "Pro is the visual anchor and the tier most often recommended by Monday's onboarding flow. Pro makes Standard feel like the entry rather than the expensive option, and Basic feel like the bare-minimum tier that most real teams will outgrow. Enterprise is the implicit ceiling that gives Pro permission to feel reasonable.",
    },
    upgradeTrigger: {
      pattern: "Feature gates calibrated to team growth",
      analysis:
        "Upgrade from Basic to Standard is triggered when a team needs timelines, automations, or guest access — typically within the first month of real use. Upgrade from Standard to Pro is triggered by time tracking, dependencies, or private boards — typically when the team grows past 10 people. Upgrade to Enterprise is triggered by procurement requirements (SSO, security).",
    },
    whatsWorking: [
      "Per-seat pricing with 3-seat minimum pushes toward team adoption from the first paid moment.",
      "Pro-anchor positioning makes Standard feel like the obvious entry tier for most teams.",
      "Feature gates between tiers (timeline, automation, time tracking) map cleanly to team growth stages.",
      "Free tier capped at 2 users is honestly positioned as evaluation, not a long-term home.",
      "Trial-led conversion with no credit card matches the paid-acquisition funnel design.",
      "Enterprise quote-wall preserves negotiation surface and enterprise sales motion.",
    ],
    whatToAdapt: [
      "Trial-led conversion with no credit card is the right mechanic when your acquisition is paid-amplified.",
      "Feature gates calibrated to team growth stages create natural upgrade triggers without artificial caps.",
      "Anchor your pricing page on the tier you actually want most buyers to pick, not the cheapest one.",
    ],
    whatToAvoid: [
      "Do not copy minimum-seat thresholds if your buyer is solo — minimums kill solo conversion entirely.",
      "Do not gate enterprise behind a quote unless you have enterprise infrastructure to deliver against.",
      "Do not assume your free tier will convert without paid acquisition amplifying the awareness — Monday spends heavily on TV and podcasts that an indie SaaS cannot replicate.",
    ],
    brunsonLens: {
      stack: "Basic-Standard-Pro-Enterprise; feature-gated stack with pro as the anchor.",
      valueLadder: "Free (2 users evaluator) → Basic core → Standard collaboration → Pro complex workflows → Enterprise governance.",
      decoyOrAnchor: "Pro is the anchor; Basic reads as bare-minimum; Enterprise as implicit ceiling.",
      paymentMechanics: "Per-seat monthly or annual with seat minimums; trial-led conversion with no credit card.",
    },
    faqs: [
      {
        q: "Why does Monday require a 3-seat minimum on paid tiers?",
        a: "Because team adoption is more valuable than single-user adoption — Monday's ROI compounds with team size. The 3-seat minimum is also a deliberate filter against solo buyers who would be unprofitable on Monday's CAC.",
      },
      {
        q: "Why is the free tier capped at 2 users?",
        a: "Because 2 users is below the threshold where Monday's value compounds. The free tier is a downgrade catcher and evaluation surface, not a primary entry. Real adoption happens on the paid trial after paid-acquisition awareness.",
      },
      {
        q: "Is Monday's pricing competitive versus Asana, ClickUp, Linear?",
        a: "Comparable per-seat economics; Monday is typically more expensive than ClickUp at equivalent tiers and similar to Asana. The pricing differential is justified by Monday's heavier investment in visual UX and vertical templates, which non-technical buyers value.",
      },
      {
        q: "Can a 2-person indie team use Monday on the free tier?",
        a: "Technically yes; practically the free tier is too constrained for real production use. The integrations cap, automation cap, and dashboard limits hit quickly. A 2-person team in real use will upgrade to Basic within weeks.",
      },
      {
        q: "What is the Brunson lens on Monday's pricing?",
        a: "Per-seat tiered with feature gates and minimum-seat thresholds, calibrated for trial-led conversion under paid-acquisition amplification. Brunson lesson: pricing structure should match acquisition structure — if your awareness comes from TV ads, your pricing page job is to convert a trial-warm visitor, not to win a cold reader.",
      },
    ],
    tags: ["per-seat", "seat-minimum", "trial-led", "work-os"],
    homepageUrl: "https://monday.com/",
    pricingPageUrl: "https://monday.com/pricing",
    lastVerified: "2026-05-18",
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
