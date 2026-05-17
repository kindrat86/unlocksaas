/**
 * Alternatives catalog — Surface A pSEO programmatic comparison pages.
 *
 * See strategy/google-strategy.md §A.5 for the policy on programmatic SEO
 * (named-competitor comparison pages were gated; this is the first batch).
 *
 * Brunson Hard-Rule reconciliation (strategy/google-strategy.md §AC-flaw):
 *   - No slagging. Every competitor entry RESPECTS the competitor's real
 *     value prop and clarifies the category difference, not a quality gap.
 *   - No fabricated prices. Pricing is stated as "approximate" and dated.
 *     If a competitor changes their price, this file is wrong and the
 *     `lastVerified` ISO is the evidence of when we last checked.
 *   - No fabricated quotes or testimonials about competitors.
 *   - Honest verdict line on every entry. We name when Unlock SaaS is NOT
 *     the right choice.
 *
 * Why this surface exists:
 *   "shipfast alternative" / "lovable alternative" / "one funnel away
 *   alternative" are real searches by the canonical audience (post-launch
 *   pre-revenue non-engineer founders who shipped with AI tools). The
 *   honest answer is "different category, not alternative" — that answer
 *   only converts when the page exists to deliver it.
 *
 * To add a new alternative: add an entry to ALTERNATIVES, set lastVerified
 * to today's ISO, and ship. generateStaticParams in the route picks it up
 * at build time; sitemap.ts picks it up at the next deploy.
 */

/**
 * The seven capabilities from comparison-table.tsx, restated as a typed map.
 * Unlock SaaS has all seven true (definitional). Each alternative entry
 * declares which capabilities it has so the comparison table reads from
 * a single source of truth.
 */
export interface AlternativeCapabilities {
  tellsYouWhatToDo: boolean;
  pushesBackOnVagueAnswers: boolean;
  sendsOutreachInsideTool: boolean;
  verifiesPayingCustomerViaStripe: boolean;
  refundsInCode: boolean;
  stopsYouFromSkipping: boolean;
  costsLessThan98ToFindOut: boolean;
}

export interface AlternativeFaq {
  q: string;
  a: string;
}

export interface Alternative {
  /** URL slug. Kebab-case. */
  slug: string;
  /** Proper-noun display name. */
  displayName: string;
  /** Person or company that operates it, where known. */
  creator?: string;
  /** What category the competitor actually sits in. */
  category: string;
  /** Tight one-line clarifying the category difference. */
  oneLine: string;
  /** Approximate pricing, neutral framing. Date in lastVerified. */
  pricingNote: string;
  /** What the competitor genuinely delivers — respect the real value prop. */
  whatItIs: string[];
  /** What the competitor does NOT promise — factual omissions, not slag. */
  whatItIsNot: string[];
  /** Who the competitor IS for. */
  whoForIt: string;
  /** Who the competitor is NOT for (the canonical Unlock SaaS audience). */
  whoNotForIt: string;
  /** Honest 1-2 sentence verdict respecting the competitor's job. */
  honestVerdict: string;
  /** 3-5 FAQs targeted at the question a searcher actually types. */
  faqs: AlternativeFaq[];
  /** Capability map for the side-by-side table. */
  capabilities: AlternativeCapabilities;
  /** Competitor's canonical homepage. */
  homepageUrl?: string;
  /**
   * Descriptive tags (3-5) used by getRelatedAlternatives() to rank
   * neighbours via tag overlap. Tags are descriptive labels, not claims —
   * they group products that real founders mentally cluster together
   * (e.g. "ai-builder", "no-code", "for-pre-launch"). Same shape as
   * FunnelTeardown.tags so the related-ranking logic stays uniform across
   * the four pSEO surfaces.
   */
  tags?: readonly string[];
  /** ISO date of last manual sanity check of every claim in this entry. */
  lastVerified: string;
}

// Capability ordering — single source of truth for the comparison-table row order.
export const CAPABILITY_ROWS: ReadonlyArray<{
  key: keyof AlternativeCapabilities;
  label: string;
}> = [
  { key: "tellsYouWhatToDo", label: "Tells you what to do" },
  {
    key: "pushesBackOnVagueAnswers",
    label: "Pushes back when your answer is vague",
  },
  {
    key: "sendsOutreachInsideTool",
    label: "Sends the outreach for you (inside the tool)",
  },
  {
    key: "verifiesPayingCustomerViaStripe",
    label: "Verifies your first paying customer via Stripe webhook",
  },
  {
    key: "refundsInCode",
    label: "Refunds you in code if the result does not happen",
  },
  {
    key: "stopsYouFromSkipping",
    label: "Stops you from skipping the work that gets paid",
  },
  {
    key: "costsLessThan98ToFindOut",
    label: "Costs less than $98 to find out if it works",
  },
] as const;

/** Unlock SaaS's own capability row — true on every dimension by construction. */
export const UNLOCK_SAAS_CAPABILITIES: AlternativeCapabilities = {
  tellsYouWhatToDo: true,
  pushesBackOnVagueAnswers: true,
  sendsOutreachInsideTool: true,
  verifiesPayingCustomerViaStripe: true,
  refundsInCode: true,
  stopsYouFromSkipping: true,
  costsLessThan98ToFindOut: true,
};

// -- Catalog ------------------------------------------------------------------

const ALTERNATIVES_LIST: Alternative[] = [
  {
    slug: "shipfast",
    displayName: "ShipFast",
    creator: "Marc Lou",
    category: "Next.js SaaS boilerplate (codebase)",
    oneLine:
      "ShipFast gives you a codebase. Unlock SaaS gives you a customer. Different products, different rungs.",
    pricingNote:
      "ShipFast is approximately $299 one-time (verified 2026-05-17). Unlock SaaS is $1 for the Starter and $49/month for the Playbook.",
    whatItIs: [
      "A production-ready Next.js + Stripe + Supabase boilerplate",
      "Pre-wired auth, payments, and transactional email",
      "A genuinely short path from zero to deployed product",
    ],
    whatItIsNot: [
      "A named first customer",
      "A diagnosis of why your live page is converting at zero",
      "A mechanism that refunds you if you ship and nobody buys",
    ],
    whoForIt:
      "Non-engineer (or engineer) founders who have NOT shipped yet and need a codebase to deploy quickly.",
    whoNotForIt:
      "Founders who already shipped on ShipFast (or anything) and have a flat Stripe line.",
    honestVerdict:
      "ShipFast is excellent at its job. Its job is not to find your first paying customer — that was never the promise. Most Unlock SaaS members shipped on something like ShipFast, then hit the wall the codebase cannot fix: nobody knew the product existed, nobody wrote one real message to one real person, and the offer page was a feature list instead of a promise to a named human.",
    faqs: [
      {
        q: "Is Unlock SaaS a ShipFast alternative?",
        a: "Not in the usual sense. ShipFast sells you a codebase. Unlock SaaS sells you a playbook that gets you the first paying customer for whatever product you already shipped — often the product you shipped on ShipFast. They sit on different rungs of the same staircase.",
      },
      {
        q: "Should I buy ShipFast or Unlock SaaS first?",
        a: "ShipFast first if you have not shipped a product yet. Unlock SaaS after you have a live product page and the Stripe line is flat.",
      },
      {
        q: "Can I use Unlock SaaS with a product I built on ShipFast?",
        a: "Yes. That is the canonical case. You paste the URL of the product you shipped into the Unlock SaaS diagnostic and within ninety seconds it labels what is broken about the offer — not the code.",
      },
      {
        q: "Does Unlock SaaS give me a codebase like ShipFast does?",
        a: "No. Unlock SaaS is the marketing-and-sales playbook that wraps around your existing product. It does not generate application code.",
      },
      {
        q: "What does Unlock SaaS do that ShipFast does not?",
        a: "It refuses to let you skip the work that gets paid. It forces a named dream customer, a written one-line promise, and one real outreach message. Then it verifies the result in Stripe and refunds you in code if no customer arrives in 60 days.",
      },
    ],
    capabilities: {
      tellsYouWhatToDo: false,
      pushesBackOnVagueAnswers: false,
      sendsOutreachInsideTool: false,
      verifiesPayingCustomerViaStripe: false,
      refundsInCode: false,
      stopsYouFromSkipping: false,
      costsLessThan98ToFindOut: false,
    },
    homepageUrl: "https://shipfa.st/",
    tags: ["codebase", "saas-boilerplate", "for-pre-launch", "stripe-included"],
    lastVerified: "2026-05-17",
  },

  {
    slug: "lovable",
    displayName: "Lovable",
    creator: "lovable.dev",
    category: "AI app builder",
    oneLine:
      "Lovable builds the product. Unlock SaaS finds the customer for the product Lovable built. Sequential, not interchangeable.",
    pricingNote:
      "Lovable has a free tier and paid subscription tiers. Unlock SaaS is $1 Starter + $49/month Playbook.",
    whatItIs: [
      "An AI tool that generates a working web application from prompts",
      "A way for non-engineers to ship a real product in days",
      "The input most Unlock SaaS members already use to ship",
    ],
    whatItIsNot: [
      "A way to get someone to pay for what you generated",
      "A diagnostic for why your page is converting at zero",
      "A guarantee tied to your Stripe ledger",
    ],
    whoForIt:
      "Non-engineers who want to ship a real product fast without writing code.",
    whoNotForIt:
      "Founders who already shipped on Lovable and have not found a single paying customer.",
    honestVerdict:
      "Lovable solved the building problem. The customer problem is the next problem, and Lovable was never claiming to solve it. Unlock SaaS is built specifically for the Lovable-shaped founder: someone who shipped a real product with AI and is now staring at a flat Stripe line. The Playbook treats the customer-acquisition disease, not the building disease.",
    faqs: [
      {
        q: "Is Unlock SaaS a Lovable alternative?",
        a: "No. Lovable builds your product. Unlock SaaS finds the first paying customer for the product you already built. They are sequential.",
      },
      {
        q: "Can I use Unlock SaaS with a product I built on Lovable?",
        a: "Yes — this is the canonical audience. The diagnostic takes the URL of your shipped Lovable product and labels what is broken about the offer.",
      },
      {
        q: "Do I have to switch off Lovable to use Unlock SaaS?",
        a: "No. Keep Lovable for product changes. Unlock SaaS wraps around your live product and runs the marketing-and-sales playbook that Lovable does not.",
      },
      {
        q: "What if the diagnostic says my product itself is wrong-shaped, not my offer?",
        a: "Then the diagnostic says so, plainly. One of three labels — Wrong Person, Weak Offer, Weak Belief — names what is actually broken. The Playbook does not pretend the product is fine when it is not.",
      },
    ],
    capabilities: {
      tellsYouWhatToDo: false,
      pushesBackOnVagueAnswers: false,
      sendsOutreachInsideTool: false,
      verifiesPayingCustomerViaStripe: false,
      refundsInCode: false,
      stopsYouFromSkipping: false,
      costsLessThan98ToFindOut: true,
    },
    homepageUrl: "https://lovable.dev/",
    tags: ["ai-builder", "no-code", "for-pre-launch", "ai-tool"],
    lastVerified: "2026-05-17",
  },

  {
    slug: "one-funnel-away-challenge",
    displayName: "One Funnel Away Challenge",
    creator: "Russell Brunson",
    category: "30-day funnel-building information course",
    oneLine:
      "Same lineage, different products. OFA is a 30-day information course. Unlock SaaS is software that runs the same frameworks against your already-shipped SaaS, with a refund tied to your Stripe ledger.",
    pricingNote:
      "OFA is approximately $100 one-time (verified 2026-05-17). Unlock SaaS is $1 Starter + $49/month Playbook.",
    whatItIs: [
      "A 30-day Russell Brunson challenge with daily videos and assignments",
      "An ideological cousin: same Dream Customer, Hook-Story-Offer, Value Ladder backbone",
      "Generally applicable across info products, ecommerce, services, and SaaS",
    ],
    whatItIsNot: [
      "Software that pushes back when your answer is vague",
      "Specific to already-shipped SaaS built with AI tools",
      "A refund tied to your Stripe ledger as a guarantee",
    ],
    whoForIt:
      "Anyone newer to funnel-building who learns best by watching daily videos and turning in homework.",
    whoNotForIt:
      "Non-engineer SaaS founders who already shipped a product and need the framework applied to their specific stuck Stripe line, in code, with a refund-in-code if nothing changes.",
    honestVerdict:
      "Unlock SaaS is built on Brunson's frameworks. If you have the time to do OFA from scratch, you will learn things the Playbook encodes. Unlock SaaS exists for the founder who already shipped a SaaS, does not want to take a 30-day course on info-product funnels, and wants the framework executed against their specific product with a refund-in-code if it does not produce a customer.",
    faqs: [
      {
        q: "Is Unlock SaaS the same as the One Funnel Away Challenge?",
        a: "Same lineage, different products. OFA is a 30-day course. Unlock SaaS is software that runs Brunson's frameworks against your specific already-shipped SaaS, with a Stripe-verified refund.",
      },
      {
        q: "Do I need to know Russell Brunson's work to use Unlock SaaS?",
        a: "No. The Playbook encodes Dream Customer, Hook-Story-Offer, the Value Ladder, the 23 Building Blocks, and the Soap Opera and Seinfeld email sequences. You do not need to have read DotCom Secrets first.",
      },
      {
        q: "Why is Unlock SaaS a $49/month subscription while OFA is roughly $100 one-time?",
        a: "Different scope. OFA teaches; Unlock SaaS executes. The $49 includes the Playbook running daily against your specific product page, the diagnostic, the outreach loop, the email sequences, and the 60-day refund-or-do-not-pay guarantee.",
      },
      {
        q: "Does Unlock SaaS use ClickFunnels?",
        a: "No. Unlock SaaS is its own stack. You can keep using ClickFunnels for delivery if you want — the Playbook wraps around your existing product page, whatever it is.",
      },
    ],
    capabilities: {
      tellsYouWhatToDo: true,
      pushesBackOnVagueAnswers: false,
      sendsOutreachInsideTool: false,
      verifiesPayingCustomerViaStripe: false,
      refundsInCode: false,
      stopsYouFromSkipping: false,
      costsLessThan98ToFindOut: false,
    },
    homepageUrl: "https://onefunnelaway.com/",
    tags: ["funnel-course", "info-product", "marketing-education", "brunson"],
    lastVerified: "2026-05-17",
  },

  {
    slug: "starter-story",
    displayName: "Starter Story",
    creator: "Pat Walls",
    category: "Indie-founder case studies and community",
    oneLine:
      "Starter Story is a library of founder case studies you read. Unlock SaaS is a playbook you run against your own product. Different shapes.",
    pricingNote:
      "Starter Story has a paid subscription for premium content. Unlock SaaS is $1 Starter + $49/month Playbook.",
    whatItIs: [
      "Thousands of case studies of indie SaaS and ecommerce founders",
      "A community of indie founders sharing tactics and stories",
      "Ambient inspiration for what is possible at small scale",
    ],
    whatItIsNot: [
      "Software that runs a specific playbook against your specific product",
      "A diagnostic of your live page",
      "A refund tied to your Stripe ledger",
    ],
    whoForIt:
      "Founders who want to read case studies, see what is possible, and absorb tactics passively.",
    whoNotForIt:
      "Founders who have already shipped and need diagnosis-plus-doing for their specific flat Stripe line.",
    honestVerdict:
      "Starter Story is a good thing to read. It is not a thing that gets you a paying customer — that is not what reading is for. Unlock SaaS is the doing layer that sits underneath the reading.",
    faqs: [
      {
        q: "Is Unlock SaaS a Starter Story alternative?",
        a: "No. Starter Story is a content product. Unlock SaaS is a software product that runs against your specific live page and verifies the result in Stripe.",
      },
      {
        q: "Can I use both?",
        a: "Yes. Read Starter Story for ambient inspiration about what is possible. Run Unlock SaaS for the actual playbook that gets you the first customer.",
      },
      {
        q: "Does Unlock SaaS have case studies?",
        a: "Verified builders show on the /builders page only after the founder has a Stripe-confirmed paying customer. Nothing self-reported, ever. The library is small on purpose — the guarantee makes inventory growth honest.",
      },
    ],
    capabilities: {
      tellsYouWhatToDo: false,
      pushesBackOnVagueAnswers: false,
      sendsOutreachInsideTool: false,
      verifiesPayingCustomerViaStripe: false,
      refundsInCode: false,
      stopsYouFromSkipping: false,
      costsLessThan98ToFindOut: false,
    },
    homepageUrl: "https://www.starterstory.com/",
    tags: ["case-studies", "indie-founder-content", "marketing-education", "community"],
    lastVerified: "2026-05-17",
  },

  {
    slug: "cursor",
    displayName: "Cursor",
    creator: "Anysphere",
    category: "AI-native code editor",
    oneLine:
      "Cursor makes you a faster coder. Unlock SaaS makes you a paid coder. Different jobs.",
    pricingNote:
      "Cursor has a free tier and a Pro tier in the low-tens-of-dollars per month range (verified 2026-05-17). Unlock SaaS is $1 Starter + $49/month Machine.",
    whatItIs: [
      "An AI-native code editor that lets non-experts write production code with model assistance",
      "A faster path from idea to shipped product for indie founders building with AI",
      "The tool many Unlock SaaS members already use to ship the product the Machine wraps around",
    ],
    whatItIsNot: [
      "A diagnostic of why your shipped product is converting at zero",
      "A named first customer",
      "A guarantee tied to your Stripe ledger if no customer arrives",
    ],
    whoForIt:
      "Indie founders, non-experts, and engineers who want AI-assisted code authoring for shipping a product faster.",
    whoNotForIt:
      "Founders who already shipped a product (often with Cursor) and have a flat Stripe line — they need the marketing-and-sales machine that gets the first customer, not better code-authoring.",
    honestVerdict:
      "Cursor is excellent at what it does and most Unlock SaaS members use it. But the Machine sits one rung above on the staircase: after Cursor helped you ship, the question is who pays for what you shipped. Unlock SaaS is the machine that answers that question, with a refund in code if it does not.",
    faqs: [
      {
        q: "Is Unlock SaaS a Cursor alternative?",
        a: "No. Cursor is a code editor; Unlock SaaS is a marketing-and-sales machine for the product you build (often in Cursor). They sit on different rungs of the same staircase — you use both, sequentially.",
      },
      {
        q: "Can I use Unlock SaaS with a product I built in Cursor?",
        a: "Yes — this is the canonical case. The diagnostic takes the URL of your shipped product and labels what is broken about the offer, not the code Cursor helped you write.",
      },
      {
        q: "Should I buy Cursor or Unlock SaaS first?",
        a: "Cursor first if you have not shipped a product yet. Unlock SaaS after you have a live product page and the Stripe line is flat — the customer problem replaces the building problem once you ship.",
      },
      {
        q: "Does Unlock SaaS generate code?",
        a: "No. Unlock SaaS is the marketing-and-sales machine that wraps around your existing product. It does not write application code.",
      },
    ],
    capabilities: {
      tellsYouWhatToDo: false,
      pushesBackOnVagueAnswers: false,
      sendsOutreachInsideTool: false,
      verifiesPayingCustomerViaStripe: false,
      refundsInCode: false,
      stopsYouFromSkipping: false,
      costsLessThan98ToFindOut: true,
    },
    homepageUrl: "https://www.cursor.com/",
    tags: ["ai-builder", "developer-tool", "for-pre-launch", "ai-tool"],
    lastVerified: "2026-05-17",
  },

  {
    slug: "v0",
    displayName: "v0",
    creator: "Vercel",
    category: "AI UI and app generator",
    oneLine:
      "v0 generates React UIs from prompts. Unlock SaaS gets paying customers for the UI you generated.",
    pricingNote:
      "v0 has a free tier and paid tiers integrated with Vercel pricing (verified 2026-05-17). Unlock SaaS is $1 Starter + $49/month Machine.",
    whatItIs: [
      "An AI tool that generates production-quality React and Next.js UIs from natural language prompts",
      "A way for non-engineers and engineers alike to ship a polished app surface in days",
      "Tight integration with the Vercel hosting and deployment stack",
    ],
    whatItIsNot: [
      "Software that pushes back when your customer description is vague",
      "A diagnosis of why your live page is converting at zero",
      "A guarantee tied to your Stripe ledger as a refund-in-code if no customer arrives",
    ],
    whoForIt:
      "Founders building on the Vercel + React + Next.js stack who want AI-generated UI as a starting point.",
    whoNotForIt:
      "Founders who already shipped with v0 (or anything else) and have not produced a paying customer.",
    honestVerdict:
      "v0 is doing the building job well. The customer-acquisition job is the next problem, and v0 was never built to solve it. Unlock SaaS is the machine specifically for the founder who shipped a v0-generated app and is now staring at a flat Stripe line. The Machine treats the customer-acquisition disease, not the UI-building disease.",
    faqs: [
      {
        q: "Is Unlock SaaS a v0 alternative?",
        a: "No. v0 generates your UI; Unlock SaaS finds the first paying customer for the product you built with that UI. Sequential, not interchangeable.",
      },
      {
        q: "Can I use Unlock SaaS with a product I built on v0?",
        a: "Yes. Paste the URL of the v0-built product into the diagnostic and within ninety seconds it labels what is broken about the offer — Wrong Person, Weak Offer, or Weak Belief.",
      },
      {
        q: "Do I need to switch off v0 to use Unlock SaaS?",
        a: "No. Keep v0 for UI changes. Unlock SaaS wraps around your live product and runs the marketing-and-sales machine v0 does not.",
      },
      {
        q: "Will Unlock SaaS work for a Next.js app deployed on Vercel?",
        a: "Yes — that is the canonical stack for Unlock SaaS members. The Machine wraps around whatever you shipped, regardless of the builder you used.",
      },
    ],
    capabilities: {
      tellsYouWhatToDo: false,
      pushesBackOnVagueAnswers: false,
      sendsOutreachInsideTool: false,
      verifiesPayingCustomerViaStripe: false,
      refundsInCode: false,
      stopsYouFromSkipping: false,
      costsLessThan98ToFindOut: true,
    },
    homepageUrl: "https://v0.app/",
    tags: ["ai-builder", "ui-generator", "for-pre-launch", "ai-tool"],
    lastVerified: "2026-05-17",
  },

  {
    slug: "bolt-new",
    displayName: "Bolt.new",
    creator: "StackBlitz",
    category: "AI full-stack app builder",
    oneLine:
      "Bolt.new builds the full-stack app in your browser. Unlock SaaS gets the first customer for the app you built.",
    pricingNote:
      "Bolt.new has a free tier and paid Pro tiers (verified 2026-05-17). Unlock SaaS is $1 Starter + $49/month Machine.",
    whatItIs: [
      "A browser-based AI tool that generates full-stack web applications from prompts",
      "A direct competitor to Lovable in the AI-app-builder category",
      "A way for non-engineers to ship a real product in days without leaving the browser",
    ],
    whatItIsNot: [
      "A way to get someone to pay for what you generated",
      "A diagnostic for why your shipped page is converting at zero",
      "A guarantee tied to your Stripe ledger",
    ],
    whoForIt:
      "Non-engineers and engineers who want to ship a working full-stack app fast, in the browser, with AI assistance.",
    whoNotForIt:
      "Founders who already shipped on Bolt.new and have a flat Stripe line — they need the customer-acquisition machine, not better app generation.",
    honestVerdict:
      "Bolt.new is in the same category as Lovable and v0 — AI app builders that handle the ship-the-product half of the founder job. Unlock SaaS handles the other half: getting a verified paying customer for what you built, with a refund in code if no customer arrives in 60 days. Most Unlock SaaS members come from one of these AI builders; the question 'why is nobody buying' is what brings them.",
    faqs: [
      {
        q: "Is Unlock SaaS a Bolt.new alternative?",
        a: "No. Bolt.new builds your app; Unlock SaaS finds the first paying customer for the app you built. Different products, different rungs of the same staircase.",
      },
      {
        q: "Can I use Unlock SaaS with a product I built on Bolt.new?",
        a: "Yes — this is exactly the canonical case. Paste the URL into the diagnostic and it labels what is broken about your offer, not your code.",
      },
      {
        q: "How is Bolt.new different from Lovable or v0?",
        a: "All three sit in the AI app builder category with different tradeoffs (Lovable for indie-founder polish, v0 for React/Next.js specifically, Bolt.new for in-browser full-stack speed). Unlock SaaS works the same way regardless of which one you shipped on.",
      },
      {
        q: "What if my product itself is wrong-shaped, not my offer?",
        a: "The diagnostic names that explicitly. The three labels — Wrong Person, Weak Offer, Weak Belief — are honest about whether the fix is in the offer or in the product. The Machine does not pretend a wrong-shaped product is fine.",
      },
    ],
    capabilities: {
      tellsYouWhatToDo: false,
      pushesBackOnVagueAnswers: false,
      sendsOutreachInsideTool: false,
      verifiesPayingCustomerViaStripe: false,
      refundsInCode: false,
      stopsYouFromSkipping: false,
      costsLessThan98ToFindOut: true,
    },
    homepageUrl: "https://bolt.new/",
    tags: ["ai-builder", "no-code", "for-pre-launch", "ai-tool"],
    lastVerified: "2026-05-17",
  },

  {
    slug: "indie-hackers",
    displayName: "Indie Hackers",
    creator: "Courtland Allen (acquired by Stripe in 2017)",
    category: "Indie-founder community and content platform",
    oneLine:
      "Indie Hackers is where you read about other founders. Unlock SaaS is where you become one. Different shapes.",
    pricingNote:
      "Indie Hackers is free to read; community participation is free. Unlock SaaS is $1 Starter + $49/month Machine.",
    whatItIs: [
      "A community and content platform of indie founder interviews, podcasts, and forums",
      "A place where founders share progress, ask questions, and absorb tactics passively",
      "Owned by Stripe and integrated with the broader Stripe ecosystem",
    ],
    whatItIsNot: [
      "Software that runs a specific machine against your specific live product",
      "A diagnostic of your page that labels what is broken",
      "A refund tied to your Stripe ledger if you ship and nobody buys",
    ],
    whoForIt:
      "Founders who learn by reading interviews and community discussion, and who want ambient inspiration from peers shipping in public.",
    whoNotForIt:
      "Founders who have already shipped and need diagnosis-plus-doing for their specific flat Stripe line — reading more interviews will not produce the first customer.",
    honestVerdict:
      "Indie Hackers is a great place to read about people doing the thing. It is not the place that does the thing for you — and it was never built to be. Unlock SaaS is the doing layer: a specific machine that runs against your specific product, with a Stripe-verified outcome.",
    faqs: [
      {
        q: "Is Unlock SaaS an Indie Hackers alternative?",
        a: "No. Indie Hackers is a community and content product; Unlock SaaS is a software product that runs against your specific live page and verifies the result in Stripe.",
      },
      {
        q: "Can I use both?",
        a: "Yes. Read Indie Hackers for ambient inspiration about what is possible. Run Unlock SaaS for the actual machine that produces the first verified paying customer.",
      },
      {
        q: "Does Unlock SaaS have a community?",
        a: "Not at launch. The product is the Machine; the community comes later if it earns its place by accelerating real customer outcomes, not as decorative add-on.",
      },
      {
        q: "Is Indie Hackers still active in 2026?",
        a: "Yes — Indie Hackers remains a meaningful community surface under Stripe ownership. The volume of new interviews has slowed since the founding era, but the back catalog and forums still drive real founder learning.",
      },
    ],
    capabilities: {
      tellsYouWhatToDo: false,
      pushesBackOnVagueAnswers: false,
      sendsOutreachInsideTool: false,
      verifiesPayingCustomerViaStripe: false,
      refundsInCode: false,
      stopsYouFromSkipping: false,
      costsLessThan98ToFindOut: true,
    },
    homepageUrl: "https://www.indiehackers.com/",
    tags: ["community", "indie-founder-content", "marketing-education", "case-studies"],
    lastVerified: "2026-05-17",
  },

  {
    slug: "carrd",
    displayName: "Carrd",
    creator: "AJ",
    category: "Single-page website builder",
    oneLine:
      "Carrd is a beautiful single-page site builder. Unlock SaaS gets the first customer for whatever you built — Carrd or otherwise.",
    pricingNote:
      "Carrd has a free tier and a Pro tier at approximately $19/year (verified 2026-05-17). Unlock SaaS is $1 Starter + $49/month Machine.",
    whatItIs: [
      "A minimalist single-page website builder beloved by indie founders for fast landing pages",
      "A tool many founders use to ship their first product page before going deeper",
      "A long-standing solo-founder operation with a famously affordable Pro plan",
    ],
    whatItIsNot: [
      "Software that diagnoses what is broken about your offer on the Carrd page",
      "A way to get someone to pay for what you put on the Carrd page",
      "A refund tied to your Stripe ledger if no customer arrives",
    ],
    whoForIt:
      "Founders shipping a single-page landing or simple SaaS marketing surface who value Carrd's minimalist constraint and tiny price tag.",
    whoNotForIt:
      "Founders who already shipped a Carrd (or other) page and have a flat Stripe line — the next problem is what the page says, not which tool built it.",
    honestVerdict:
      "Carrd is excellent for what it does — one-page sites, fast, cheap, beautiful. It is not a marketing-and-sales machine and was never trying to be. Many Unlock SaaS members started on Carrd; the Machine is the next step, applied to whatever page they built.",
    faqs: [
      {
        q: "Is Unlock SaaS a Carrd alternative?",
        a: "No. Carrd is a website builder; Unlock SaaS is a marketing-and-sales machine that runs against your already-built page. Different products entirely.",
      },
      {
        q: "Can I use Unlock SaaS with a Carrd page?",
        a: "Yes. Paste the URL of your Carrd page into the diagnostic and it labels what is broken about the offer. The Machine works regardless of which builder produced the page.",
      },
      {
        q: "Should I move off Carrd if I subscribe to Unlock SaaS?",
        a: "No. Keep your Carrd page. Unlock SaaS does not replace the page; it runs the marketing-and-sales machine around whatever page you already have.",
      },
      {
        q: "Is Carrd still worth using in 2026?",
        a: "Yes, for the exact use case it serves: simple, cheap, fast single-page sites. The tool has stayed deliberately small and continues to ship updates. Most indie founders outgrow it eventually, but the on-ramp is excellent.",
      },
    ],
    capabilities: {
      tellsYouWhatToDo: false,
      pushesBackOnVagueAnswers: false,
      sendsOutreachInsideTool: false,
      verifiesPayingCustomerViaStripe: false,
      refundsInCode: false,
      stopsYouFromSkipping: false,
      costsLessThan98ToFindOut: true,
    },
    homepageUrl: "https://carrd.co/",
    tags: ["website-builder", "no-code", "for-pre-launch", "landing-page"],
    lastVerified: "2026-05-17",
  },

  {
    slug: "microconf",
    displayName: "MicroConf",
    creator: "Rob Walling",
    category: "Indie SaaS community and content hub",
    oneLine:
      "MicroConf is the canonical indie SaaS community. Unlock SaaS is a focused machine. Different shapes of the same job — community vs. specific software.",
    pricingNote:
      "MicroConf has a free YouTube channel and blog; MicroConf Connect membership is approximately $475/year; in-person conferences are several hundred to over a thousand per ticket (verified 2026-05-17). Unlock SaaS is $1 Starter + $49/month Playbook.",
    whatItIs: [
      "Rob Walling's decade-plus indie SaaS hub: conferences, podcast, YouTube, Connect community",
      "A peer-to-peer mastermind environment for indie SaaS founders at every stage",
      "Long-form content (Startups for the Rest of Us podcast, MicroConf On Air) that compounds into a deep prior",
    ],
    whatItIsNot: [
      "Software that runs a specific machine against your specific live product",
      "A diagnostic of your page that labels what is broken",
      "A refund tied to your Stripe ledger if you ship and nobody buys",
    ],
    whoForIt:
      "Indie SaaS founders who learn through peer conversations, podcasts, and conferences, and who value long-running community access over individual software outcomes.",
    whoNotForIt:
      "Founders who have already shipped and need diagnosis-plus-doing on their specific flat Stripe line — peer conversations help but they do not run the marketing-and-sales machine for you.",
    honestVerdict:
      "MicroConf is the gold-standard indie SaaS community and most Unlock SaaS members benefit from being adjacent to it. The two are complementary: MicroConf gives you the peer network and long-running content; Unlock SaaS runs the specific machine against your specific page. The mistake is treating either as a substitute for the other.",
    faqs: [
      {
        q: "Is Unlock SaaS a MicroConf alternative?",
        a: "No. MicroConf is a community and content hub; Unlock SaaS is a software product that runs against your specific live page and verifies the result in Stripe. They serve different needs and most serious indie SaaS founders use both.",
      },
      {
        q: "Should I join MicroConf Connect or buy Unlock SaaS?",
        a: "If your bottleneck is peer learning and long-running founder relationships, MicroConf Connect. If your bottleneck is the specific marketing-and-sales work against your shipped product, Unlock SaaS. Most members of one benefit from the other.",
      },
      {
        q: "Does Unlock SaaS have a community?",
        a: "Not at launch. The product is the machine; community comes later if it earns its place by accelerating real customer outcomes, not as decorative add-on. MicroConf is the community founders should join in the meantime.",
      },
      {
        q: "Is MicroConf still active in 2026?",
        a: "Yes — Rob Walling continues running the podcast, conferences, and MicroConf Connect community. The hub has grown into one of the longest-running indie SaaS institutions, with consistent year-over-year founder turnout.",
      },
    ],
    capabilities: {
      tellsYouWhatToDo: false,
      pushesBackOnVagueAnswers: false,
      sendsOutreachInsideTool: false,
      verifiesPayingCustomerViaStripe: false,
      refundsInCode: false,
      stopsYouFromSkipping: false,
      costsLessThan98ToFindOut: false,
    },
    homepageUrl: "https://microconf.com/",
    tags: ["community", "content-hub", "indie-saas-canon", "complementary"],
    lastVerified: "2026-05-17",
  },

  {
    slug: "stacking-the-bricks",
    displayName: "Stacking the Bricks (30x500)",
    creator: "Amy Hoy and Alex Hillman",
    category: "Indie SaaS curriculum and methodology",
    oneLine:
      "Stacking the Bricks teaches you to find your audience and validate before you build. Unlock SaaS runs the machine after you have already shipped. Same lineage, opposite ends of the timeline.",
    pricingNote:
      "Stacking the Bricks publishes free content; 30x500 (the flagship course) is approximately $1,995 (verified 2026-05-17). Unlock SaaS is $1 Starter + $49/month Playbook.",
    whatItIs: [
      "Amy Hoy and Alex Hillman's decade-long indie SaaS curriculum focused on audience and validation before product",
      "The 30x500 course: a structured methodology for finding pain, building Sales Safari, shipping safe-bet products",
      "Long-form essays, podcast appearances, and a contrarian voice in the indie SaaS canon",
    ],
    whatItIsNot: [
      "Software that runs against your already-shipped product",
      "A diagnostic of your live page",
      "A guarantee tied to your Stripe ledger",
    ],
    whoForIt:
      "Pre-product founders who have not yet shipped and want a rigorous methodology for finding audience and validating ideas before building.",
    whoNotForIt:
      "Founders who already shipped a product (with or without Stacking the Bricks methodology) and have a flat Stripe line — the next problem is the customer-acquisition machine, not more upstream methodology.",
    honestVerdict:
      "Stacking the Bricks is the most respected pre-product curriculum in the indie SaaS canon. If you have not shipped yet and have $2K to invest in a rigorous methodology, 30x500 is one of the strongest options. Unlock SaaS exists for the founder who already shipped and needs the machine that produces the first paying customer for what they built. Different rungs of the same staircase.",
    faqs: [
      {
        q: "Is Unlock SaaS a Stacking the Bricks alternative?",
        a: "No. Stacking the Bricks (30x500) teaches you to find audience and validate before you build; Unlock SaaS runs the marketing-and-sales machine for the product you already shipped. They are sequential, not interchangeable.",
      },
      {
        q: "Should I buy 30x500 first or Unlock SaaS first?",
        a: "30x500 if you have not shipped a product yet and want rigorous pre-product methodology. Unlock SaaS if you already shipped and the Stripe line is flat. Some founders use both at different stages.",
      },
      {
        q: "Do the methodologies conflict?",
        a: "No. Stacking the Bricks emphasizes Sales Safari (deep audience research before building) which complements the dream-customer naming in the Unlock SaaS machine. The methodologies are upstream-vs-downstream, not contradictory.",
      },
      {
        q: "Are Amy Hoy and Alex Hillman still active in 2026?",
        a: "Yes — both continue to publish essays, speak at conferences, and run cohorts of 30x500. The curriculum has refined over a decade-plus and the contrarian-but-rigorous voice still resonates with the indie SaaS audience.",
      },
    ],
    capabilities: {
      tellsYouWhatToDo: true,
      pushesBackOnVagueAnswers: false,
      sendsOutreachInsideTool: false,
      verifiesPayingCustomerViaStripe: false,
      refundsInCode: false,
      stopsYouFromSkipping: false,
      costsLessThan98ToFindOut: false,
    },
    homepageUrl: "https://stackingthebricks.com/",
    tags: ["curriculum", "pre-product", "methodology", "indie-saas-canon"],
    lastVerified: "2026-05-17",
  },

  {
    slug: "demand-curve",
    displayName: "Demand Curve",
    creator: "Julian Shapiro and team",
    category: "Modern marketing curriculum and growth agency",
    oneLine:
      "Demand Curve teaches startup marketing in long-form courses and ships growth-agency work. Unlock SaaS runs the focused machine for the indie SaaS first-customer problem.",
    pricingNote:
      "Demand Curve's Growth Programs are approximately $1,995-2,995 per cohort; agency services are project-based (verified 2026-05-17). Unlock SaaS is $1 Starter + $49/month Playbook.",
    whatItIs: [
      "Julian Shapiro's startup-marketing curriculum, originally the Growth Program",
      "Long-form essays and frameworks on positioning, ads, landing pages, and growth experiments",
      "An agency arm that runs growth campaigns for funded startups",
    ],
    whatItIsNot: [
      "Software calibrated for the pre-revenue indie SaaS founder specifically",
      "A diagnostic of your live page with a Stripe-verified guarantee",
      "A focused machine that refuses to let you skip the work that gets paid",
    ],
    whoForIt:
      "Founders and early growth hires at funded startups who want comprehensive marketing curriculum and frameworks across paid acquisition, positioning, and CRO.",
    whoNotForIt:
      "Pre-revenue indie SaaS founders specifically — Demand Curve is calibrated for startups with marketing budgets and team capacity, not for the solo founder with a flat Stripe line and no ad spend.",
    honestVerdict:
      "Demand Curve is excellent for what it is: comprehensive startup-marketing education for founders with budget and team. Unlock SaaS is narrower and indie-focused: one machine for the one job of getting the first paying customer when you shipped alone and have no marketing budget. Different audiences, different scopes, both legitimate.",
    faqs: [
      {
        q: "Is Unlock SaaS a Demand Curve alternative?",
        a: "Only loosely. Demand Curve is a comprehensive startup-marketing curriculum (and agency); Unlock SaaS is a focused machine for one job (the first paying customer for an indie SaaS). The audiences overlap on the edges but the scopes are quite different.",
      },
      {
        q: "Should I take the Demand Curve Growth Program or Unlock SaaS?",
        a: "Growth Program if you are at a funded startup with marketing budget and team capacity. Unlock SaaS if you are a solo indie founder with a shipped product, no budget, and a flat Stripe line. The decisions map to different stages and shapes.",
      },
      {
        q: "Does Demand Curve serve indie SaaS founders?",
        a: "Some indie founders take the curriculum, but the canonical buyer is the funded startup. The frameworks and ad-spend examples assume budget and team that indie founders typically do not have.",
      },
      {
        q: "Is Julian Shapiro still running Demand Curve in 2026?",
        a: "Julian remains associated but the team has grown beyond him. The Growth Program continues to ship cohorts and the agency arm continues to take clients. The brand is established and the long-form essays remain widely cited in startup-marketing circles.",
      },
    ],
    capabilities: {
      tellsYouWhatToDo: true,
      pushesBackOnVagueAnswers: false,
      sendsOutreachInsideTool: false,
      verifiesPayingCustomerViaStripe: false,
      refundsInCode: false,
      stopsYouFromSkipping: false,
      costsLessThan98ToFindOut: false,
    },
    homepageUrl: "https://www.demandcurve.com/",
    tags: ["curriculum", "marketing", "for-funded-startups", "agency"],
    lastVerified: "2026-05-17",
  },

  {
    slug: "replit",
    displayName: "Replit",
    creator: "Amjad Masad",
    category: "Browser IDE and AI agent platform",
    oneLine:
      "Replit builds and deploys the app in your browser, with an AI agent that can take multi-step actions. Unlock SaaS finds the first paying customer for whatever you built — Replit or otherwise.",
    pricingNote:
      "Replit has a free tier and paid plans (Replit Core, Replit Teams) with AI agent usage credits (verified 2026-05-17). Unlock SaaS is $1 Starter + $49/month Playbook.",
    whatItIs: [
      "A browser-based IDE that ships apps without leaving the browser",
      "Replit Agent: an AI agent that builds, deploys, and iterates on applications autonomously",
      "A long-running platform with one of the broadest indie + education + hobbyist user bases",
    ],
    whatItIsNot: [
      "A way to get someone to pay for what you generated",
      "A diagnostic for why your shipped page is converting at zero",
      "A guarantee tied to your Stripe ledger",
    ],
    whoForIt:
      "Indie founders, non-engineers, students, and hobbyists who want a browser-first build-and-deploy environment with strong AI agent assistance.",
    whoNotForIt:
      "Founders who already shipped on Replit (or anything else) and have a flat Stripe line. The next problem is the customer, not better building.",
    honestVerdict:
      "Replit is one of the strongest browser-first builders in the AI-app-builder category, with a long-running platform advantage and broad user base. Most Unlock SaaS members ship with Replit or one of its peers (Lovable, v0, Bolt.new, Cursor). The Playbook treats whatever you shipped as input and works on the customer-acquisition problem the builders do not solve.",
    faqs: [
      {
        q: "Is Unlock SaaS a Replit alternative?",
        a: "No. Replit builds and deploys your app; Unlock SaaS finds the first paying customer for the app you already built. Different categories, sequential use cases.",
      },
      {
        q: "Can I use Unlock SaaS with a product I built on Replit?",
        a: "Yes — this is exactly the canonical case. Paste the URL of your Replit-built and -deployed product into the diagnostic, and within ninety seconds it labels what is broken about the offer.",
      },
      {
        q: "How is Replit different from Lovable, v0, or Bolt.new?",
        a: "All four sit in the AI-app-builder category. Replit has the longest platform history and the broadest user base (including students and hobbyists); the others are more recently positioned around indie-founder polish. Unlock SaaS works the same way regardless of which one you shipped on.",
      },
      {
        q: "Does Replit Agent compete with Cursor or Windsurf?",
        a: "Adjacent but different — Replit Agent runs in the browser-IDE context and emphasizes deploy-as-part-of-the-loop; Cursor and Windsurf are desktop editors with more granular code control. The choice depends on whether browser-first or desktop-first matches your workflow.",
      },
    ],
    capabilities: {
      tellsYouWhatToDo: false,
      pushesBackOnVagueAnswers: false,
      sendsOutreachInsideTool: false,
      verifiesPayingCustomerViaStripe: false,
      refundsInCode: false,
      stopsYouFromSkipping: false,
      costsLessThan98ToFindOut: true,
    },
    homepageUrl: "https://replit.com/",
    tags: ["ai-app-builder", "browser-ide", "agent", "build-tool"],
    lastVerified: "2026-05-17",
  },
];

// Indexed lookup. Module-level Map for O(1) access — pattern from
// rules/js-index-maps.md in the Vercel React Best Practices guide.
const ALTERNATIVES_BY_SLUG: Map<string, Alternative> = new Map(
  ALTERNATIVES_LIST.map((a) => [a.slug, a]),
);

/** Read-only catalog. Iteration order is canonical (matches list order). */
export const ALTERNATIVES: ReadonlyArray<Alternative> = ALTERNATIVES_LIST;

/** Slug list for generateStaticParams and sitemap.ts. */
export const ALTERNATIVE_SLUGS: ReadonlyArray<string> = ALTERNATIVES_LIST.map(
  (a) => a.slug,
);

export function getAlternativeBySlug(slug: string): Alternative | undefined {
  return ALTERNATIVES_BY_SLUG.get(slug);
}

/**
 * Return up to `limit` alternatives most-related to the seed slug, ranked by
 * tag-overlap count (descending), excluding the seed itself.
 *
 * Mirrors getRelatedTeardowns() in src/lib/funnel-teardowns.ts so the four
 * pSEO surfaces ship one shared notion of "related." Internal-linking parity
 * closes the dead-end the 2026-05-17 SEO audit flagged on this surface:
 * every alternative page now exits into 3-4 sibling alternatives, lifting
 * crawl depth from 1 to 2+ for the same crawl budget.
 *
 * Returns an empty list when:
 *   - the seed slug is unknown,
 *   - the seed has no tags,
 *   - no other alternative shares any tags with the seed.
 *
 * Tag overlap (not category equality) is deliberate: an alternative's
 * `category` is a free-form prose label, tags are the curated cluster.
 */
export function getRelatedAlternatives(
  slug: string,
  limit: number = 4,
): ReadonlyArray<Alternative> {
  const seed = ALTERNATIVES_BY_SLUG.get(slug);
  if (!seed?.tags || seed.tags.length === 0) return [];
  const seedTags = new Set(seed.tags);

  const scored = ALTERNATIVES_LIST.filter((a) => a.slug !== slug)
    .map((a) => {
      const overlap = (a.tags ?? []).filter((tag) => seedTags.has(tag)).length;
      return { alt: a, overlap };
    })
    .filter((x) => x.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap);

  return scored.slice(0, limit).map((x) => x.alt);
}
