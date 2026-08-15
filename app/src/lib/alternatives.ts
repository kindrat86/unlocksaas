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

  {
    slug: "asana",
    displayName: "Asana",
    creator: "Asana, Inc.",
    category: "Project management software",
    oneLine:
      "Asana organises your team's work. Unlock SaaS gets your product its first paying customer. Different jobs, different shelves.",
    pricingNote:
      "Asana has a free Personal tier and paid Starter, Advanced, and Enterprise plans billed per user per month (verified 2026-05-18). Unlock SaaS is $1 Starter + $49/month Playbook.",
    whatItIs: [
      "A project- and work-management platform that coordinates tasks, timelines, and dependencies across a team",
      "A workspace for shipping work in a structured way once you already know what to ship",
      "A horizontal tool used across product, marketing, ops, and engineering",
    ],
    whatItIsNot: [
      "A named first paying customer or an outreach mechanism",
      "A diagnostic of why your already-shipped product is converting at zero",
      "A refund tied to your Stripe ledger if no customer arrives",
    ],
    whoForIt:
      "Teams (and disciplined solo operators) who already have a clear backlog and need a shared place to coordinate the work.",
    whoNotForIt:
      "Solo non-engineer founders whose problem is not 'we are not coordinated' but 'we shipped a product and nobody is paying for it'.",
    honestVerdict:
      "Asana is excellent at coordinating work that has already been scoped. Unlock SaaS is the upstream step Asana presumes: deciding what work is worth coordinating in the first place — namely, the small set of moves that produces the first paying customer. Most Unlock SaaS members do not need a project manager; they need a verdict on whether their offer page is broken, and a script to send to one named human today.",
    faqs: [
      {
        q: "Is Unlock SaaS an Asana alternative?",
        a: "Not really. Asana is project management software for teams. Unlock SaaS is a single-founder customer-acquisition playbook with a Stripe-verified refund. If your problem is 'we are not organised', use Asana. If your problem is 'we are organised but the Stripe line is flat', use Unlock SaaS.",
      },
      {
        q: "Can I use both Asana and Unlock SaaS together?",
        a: "Yes. Unlock SaaS tells you the three moves to make this week; Asana is a perfectly fine place to track that you did them. The Playbook does not care which task tracker you use.",
      },
      {
        q: "Why is Unlock SaaS only $49/month while Asana costs more per seat at higher tiers?",
        a: "Different scope. Asana is a horizontal team platform priced per seat. Unlock SaaS is a vertical playbook for one founder solving one problem (first paying customer) with a refund-in-code if it does not work in 60 days.",
      },
      {
        q: "Does Unlock SaaS replace my project management tool?",
        a: "No. It does not try to. There is nothing in the Playbook that competes with Asana's timeline, portfolios, or workload views — and there is nothing in Asana that competes with the diagnostic, outreach loop, or Stripe-verified refund.",
      },
      {
        q: "I am a solo founder. Do I need Asana before Unlock SaaS?",
        a: "Almost never. Solo founders pre-first-customer rarely need a project manager — they need a verdict on what to do next. Unlock SaaS is that verdict. Add Asana later when you have a team and a backlog worth coordinating.",
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
    homepageUrl: "https://asana.com/",
    tags: ["project-management", "team-collaboration", "work-os", "for-teams"],
    lastVerified: "2026-05-18",
  },

  {
    slug: "airtable",
    displayName: "Airtable",
    creator: "Airtable, Inc.",
    category: "Spreadsheet-database hybrid / no-code data platform",
    oneLine:
      "Airtable structures the data behind your business. Unlock SaaS turns the product you already shipped into a paying customer. Different layers of the stack.",
    pricingNote:
      "Airtable has a free tier and paid Team, Business, and Enterprise plans billed per editor per month (verified 2026-05-18). Unlock SaaS is $1 Starter + $49/month Playbook.",
    whatItIs: [
      "A flexible relational base that mixes spreadsheet UX with database structure",
      "A no-code platform for building internal tools, CRMs, content calendars, and ops trackers",
      "A horizontal tool used across product, marketing, ops, and project management",
    ],
    whatItIsNot: [
      "A diagnostic of why your offer page is converting at zero",
      "A script for the next outreach message you should send to a named human today",
      "A Stripe-verified guarantee that a paying customer arrives in 60 days",
    ],
    whoForIt:
      "Founders and teams who need a flexible structured-data layer for their workflow and prefer a no-code surface over SQL.",
    whoNotForIt:
      "Solo non-engineer founders whose Stripe line is flat and who do not have a data-modelling problem — they have a customer-acquisition problem.",
    honestVerdict:
      "Airtable is a great place to store and shape your data. Storing your data better does not produce a paying customer. Unlock SaaS exists for the upstream problem: deciding which one human you should talk to this week, what to say, and whether the offer page is even survivable. Use Airtable to track the results of the Playbook if you want; the Playbook itself is the thing that produces the result.",
    faqs: [
      {
        q: "Is Unlock SaaS an Airtable alternative?",
        a: "No — different categories. Airtable is a structured-data platform. Unlock SaaS is a customer-acquisition playbook with a Stripe-verified refund. They do not overlap.",
      },
      {
        q: "Can I track Unlock SaaS playbook steps in Airtable?",
        a: "Absolutely. The Playbook is opinionated about what to do, not where to track it. Many Unlock SaaS members already live in Airtable for their CRM and ops, and the Playbook fits cleanly on top.",
      },
      {
        q: "Should I build my SaaS on Airtable?",
        a: "You can — many simple SaaS products use Airtable as the data layer behind a Softr or custom UI. But once you have shipped that product, Airtable cannot tell you why it is not selling. That is what Unlock SaaS is for.",
      },
      {
        q: "Does Unlock SaaS need a database setup like Airtable's?",
        a: "No. The Playbook runs against your live product URL and your Stripe account. There is no schema to design, no base to configure.",
      },
      {
        q: "I love Airtable's flexibility. Will Unlock SaaS feel rigid in comparison?",
        a: "Yes, intentionally. Airtable's value is that you can model anything. Unlock SaaS's value is the opposite: it refuses to let you reshape the playbook around your favourite reason to delay outreach.",
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
    homepageUrl: "https://www.airtable.com/",
    tags: ["no-code", "database", "spreadsheet", "work-os"],
    lastVerified: "2026-05-18",
  },

  {
    slug: "framer",
    displayName: "Framer",
    creator: "Framer B.V.",
    category: "Visual web-design and site builder",
    oneLine:
      "Framer builds the page. Unlock SaaS turns the page Framer built into a paying customer. Sequential, not interchangeable.",
    pricingNote:
      "Framer has a free tier and paid Mini, Basic, Pro plans billed per site, plus per-seat workspace pricing (verified 2026-05-18). Unlock SaaS is $1 Starter + $49/month Playbook.",
    whatItIs: [
      "A visual website builder with CMS, animations, and design-tool ergonomics",
      "A fast way for non-engineers to ship a polished marketing site",
      "The page surface many Unlock SaaS members already host their offer on",
    ],
    whatItIsNot: [
      "A diagnostic that labels whether the page you built actually converts",
      "An outreach mechanism that sends one real message to one real human",
      "A refund tied to your Stripe ledger if no customer arrives",
    ],
    whoForIt:
      "Non-engineers who want to ship a beautiful marketing site fast without writing HTML or CSS.",
    whoNotForIt:
      "Founders who already shipped on Framer and still have a flat Stripe line — pretty is not the problem.",
    honestVerdict:
      "Framer is great at building the page. The page is rarely the problem once it exists. Unlock SaaS is built for the next step Framer cannot help with: deciding whether the offer is even survivable, who specifically to send it to, and what to do when 30 days of polished landing pages have produced no Stripe charges. Keep Framer for delivery; let the Playbook decide what the page should be saying.",
    faqs: [
      {
        q: "Is Unlock SaaS a Framer alternative?",
        a: "No. Framer is a site builder. Unlock SaaS is a customer-acquisition playbook that wraps around the site you already built. Different jobs.",
      },
      {
        q: "Can I use Unlock SaaS with a site I built on Framer?",
        a: "Yes — that is the canonical case. Paste the URL of your Framer-hosted offer page into the diagnostic and within ninety seconds it labels what is broken about the offer (not the design).",
      },
      {
        q: "Should I rebuild my Framer site before running Unlock SaaS?",
        a: "Almost never. The Playbook does not care which tool the page is hosted on. It cares whether the page promises a specific result to a named human. If it does not, no site-builder upgrade will fix that.",
      },
      {
        q: "Does Unlock SaaS replace my Framer subscription?",
        a: "No. It does not try to. There is nothing in the Playbook that builds or hosts pages, and nothing in Framer that diagnoses offers or guarantees customers.",
      },
      {
        q: "My Framer site looks great. Why is nobody buying?",
        a: "That is exactly the question Unlock SaaS exists to answer. Almost always one of three labels — Wrong Person, Weak Offer, Weak Belief — applies, and design quality is not on the list.",
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
    homepageUrl: "https://www.framer.com/",
    tags: ["site-builder", "no-code", "design-tool", "landing-page"],
    lastVerified: "2026-05-18",
  },

  {
    slug: "substack",
    displayName: "Substack",
    creator: "Substack, Inc.",
    category: "Newsletter publishing and paid-subscription platform",
    oneLine:
      "Substack helps writers run paid newsletters. Unlock SaaS helps non-engineer founders get a SaaS its first paying customer. Different products, different customer.",
    pricingNote:
      "Substack is free to publish; the platform takes ~10% of paid-subscription revenue (verified 2026-05-18). Unlock SaaS is $1 Starter + $49/month Playbook.",
    whatItIs: [
      "A hosted newsletter platform with built-in subscriptions, payments, and discovery",
      "A revenue model for writers who want paid readers, not a content marketing tool",
      "A genuinely good path from 'I write' to 'people pay me to read what I write'",
    ],
    whatItIsNot: [
      "A diagnostic of why your shipped SaaS product is converting at zero",
      "A way to find and message the first specific human who would pay for your software",
      "A refund tied to your Stripe ledger if no SaaS customer arrives in 60 days",
    ],
    whoForIt:
      "Writers, journalists, and operators whose product IS a newsletter and whose revenue model IS paid subscriptions to that newsletter.",
    whoNotForIt:
      "Founders whose product is a SaaS and who are looking for SaaS customers, not newsletter subscribers.",
    honestVerdict:
      "Substack is the right answer if you are running a newsletter as the product. It is the wrong answer if you are running a SaaS and trying to grow it by 'starting a newsletter' as a distribution hack — most pre-revenue founders never reach the audience size where a Substack moves the SaaS needle. Unlock SaaS treats the direct problem instead: get the next single paying customer for the software, with the Playbook executing and the refund-in-code on the line.",
    faqs: [
      {
        q: "Is Unlock SaaS a Substack alternative?",
        a: "No. Substack is for writers running paid newsletters. Unlock SaaS is for non-engineer SaaS founders trying to get their first paying customer. Different categories entirely.",
      },
      {
        q: "Should I start a Substack to market my SaaS?",
        a: "Usually no, not before first revenue. The Brunson Soap-Opera and Seinfeld sequences inside the Playbook are aimed at the small list of warm humans who could actually buy your software now — not at building a content audience that pays months from now.",
      },
      {
        q: "Can I use Substack as my email tool alongside Unlock SaaS?",
        a: "Technically yes, but Substack is built for public paid newsletters, not for the targeted Soap-Opera onboarding sequences the Playbook expects. Tools like Resend or Loops fit the Playbook better; see /funnel-teardown/resend and /funnel-teardown/loops for that side of the stack.",
      },
      {
        q: "What if my SaaS audience IS newsletter writers?",
        a: "Then Substack is the dream-customer's home turf — go where they already live. The Playbook still applies: which specific writer, what specific promise, what specific first message. Substack does not answer those questions; Unlock SaaS does.",
      },
      {
        q: "I already have a Substack with subscribers. Can I use Unlock SaaS to monetise that audience differently?",
        a: "If your audience is a fit for your SaaS — yes. The Playbook treats your existing Substack list as a warm channel: same Hook-Story-Offer logic, same named-human discipline. The diagnostic does not care where the names came from.",
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
    homepageUrl: "https://substack.com/",
    tags: ["newsletter", "publishing", "creator-economy", "paid-subscription"],
    lastVerified: "2026-05-18",
  },

  {
    slug: "notion",
    displayName: "Notion",
    creator: "Notion Labs, Inc.",
    category: "All-in-one workspace (docs, wiki, database, project tracker)",
    oneLine:
      "Notion is where your work lives. Unlock SaaS decides which work actually produces a paying customer. Different jobs, different shelves.",
    pricingNote:
      "Notion has a free Personal tier and paid Plus, Business, and Enterprise plans billed per member per month (verified 2026-05-18). Unlock SaaS is $1 Starter + $49/month Playbook.",
    whatItIs: [
      "A flexible workspace mixing docs, databases, wikis, and lightweight project tracking",
      "A horizontal tool used across product, marketing, ops, knowledge management, and personal organisation",
      "A genuinely strong second-brain and team-knowledge surface",
    ],
    whatItIsNot: [
      "A diagnostic of why your shipped offer page is converting at zero",
      "An outreach mechanism that sends one specific message to one named human",
      "A Stripe-verified guarantee tied to your real customer ledger",
    ],
    whoForIt:
      "Solo operators and teams who want one flexible surface for notes, docs, wikis, and lightweight project tracking.",
    whoNotForIt:
      "Founders whose problem is not 'we are not organised' but 'we shipped a product and nobody is paying for it'.",
    honestVerdict:
      "Notion is a genuinely great workspace. Workspace quality does not produce paying customers. Unlock SaaS exists for the upstream decision Notion does not make: which one human you should talk to this week, what to say, and whether the offer page is even survivable. Keep Notion for notes; let the Playbook decide what the notes should be about.",
    faqs: [
      {
        q: "Is Unlock SaaS a Notion alternative?",
        a: "No. Notion is an all-in-one workspace. Unlock SaaS is a single-founder customer-acquisition playbook with a Stripe-verified refund. They sit on completely different shelves.",
      },
      {
        q: "Can I run the Unlock SaaS playbook inside Notion?",
        a: "You can track the Playbook's outputs in Notion if you want — the Playbook is opinionated about what to do, not where to track it. Many members already live in Notion for their second brain and the Playbook fits cleanly on top.",
      },
      {
        q: "Should I build my SaaS docs and help centre on Notion?",
        a: "Notion is a fine first-pass help centre — but a help centre never made a flat Stripe line less flat. If your problem is 'nobody is buying yet', better docs are downstream of the actual problem. Run the diagnostic first.",
      },
      {
        q: "Does Unlock SaaS replace Notion?",
        a: "No. It does not try to. There is nothing in the Playbook that competes with Notion's databases or page hierarchy, and nothing in Notion that diagnoses offers or guarantees customers.",
      },
      {
        q: "I love Notion's flexibility. Will Unlock SaaS feel rigid in comparison?",
        a: "Yes, intentionally. Notion's strength is that you can model anything. The Playbook's strength is the opposite: it refuses to let you reshape the work around your favourite reason to delay outreach.",
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
    homepageUrl: "https://www.notion.so/",
    tags: ["work-os", "knowledge-management", "docs", "no-code"],
    lastVerified: "2026-05-18",
  },

  {
    slug: "calendly",
    displayName: "Calendly",
    creator: "Calendly LLC",
    category: "Scheduling and meeting-booking software",
    oneLine:
      "Calendly books the meeting. Unlock SaaS decides whether the meeting should exist and what to do if no one books it. Different layers of the funnel.",
    pricingNote:
      "Calendly has a free tier and paid Standard, Teams, and Enterprise plans billed per seat per month (verified 2026-05-18). Unlock SaaS is $1 Starter + $49/month Playbook.",
    whatItIs: [
      "A scheduling tool that lets prospects book time on your calendar without back-and-forth",
      "A near-universal integration in B2B sales motions and customer success workflows",
      "A genuinely good answer to the 'when are you free' email thread",
    ],
    whatItIsNot: [
      "A reason anyone wants to book a meeting with you in the first place",
      "A diagnostic of why your offer page is converting at zero",
      "A Stripe-verified guarantee tied to your customer ledger",
    ],
    whoForIt:
      "Anyone whose existing audience already wants to talk to them and needs a frictionless way to book the call.",
    whoNotForIt:
      "Founders whose Calendly link is plumbed everywhere but nobody is booking — adding more Calendly is not the fix.",
    honestVerdict:
      "Calendly is the right answer once people want to talk to you. The upstream problem — getting one specific human to want a conversation about your specific product — is what Unlock SaaS exists for. The Playbook produces the named human and the message that earns the meeting; Calendly then takes the booking. Use both, in that order.",
    faqs: [
      {
        q: "Is Unlock SaaS a Calendly alternative?",
        a: "No. Calendly is scheduling software. Unlock SaaS is a customer-acquisition playbook. They sit on completely different rungs of the same funnel — one earns the meeting, the other books it.",
      },
      {
        q: "My Calendly link gets no bookings. What should I do?",
        a: "That is a demand problem, not a scheduling problem. The Playbook's diagnostic labels whether your offer is survivable in the first place, then the outreach loop generates the warm-enough humans who actually book the call.",
      },
      {
        q: "Does Unlock SaaS integrate with Calendly?",
        a: "Not directly — the Playbook does not write to your calendar. It does instruct you to put your Calendly link in the right place at the right moment in the Soap-Opera and Seinfeld sequences, where the meeting offer makes sense.",
      },
      {
        q: "Should I include a Calendly link on my offer page?",
        a: "Usually no, not pre-revenue. The diagnostic typically labels 'add a Calendly link' as a delay tactic — most pre-revenue offer pages need a buy button, not a meeting button. The Playbook will tell you when (and if) calendar links earn their place.",
      },
      {
        q: "If I have Calendly, do I still need Unlock SaaS?",
        a: "Calendly answers 'when'. Unlock SaaS answers 'why anyone should care, who specifically, and what message earns the meeting'. Different questions.",
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
    homepageUrl: "https://calendly.com/",
    tags: ["scheduling", "meetings", "sales-tool", "b2b"],
    lastVerified: "2026-05-18",
  },

  {
    slug: "clickup",
    displayName: "ClickUp",
    creator: "ClickUp, Inc.",
    category: "Project management and work-OS platform",
    oneLine:
      "ClickUp gives you a project-management surface that does almost everything. Unlock SaaS narrows the surface to one thing: get a paying customer.",
    pricingNote:
      "ClickUp has a free tier and paid Unlimited, Business, Business Plus, and Enterprise plans billed per user per month (verified 2026-05-18). Unlock SaaS is $1 Starter + $49/month Playbook.",
    whatItIs: [
      "A horizontally broad project-management platform with tasks, docs, goals, automations, dashboards, and time tracking",
      "A 'one app to replace them all' positioning aimed at teams consolidating tooling",
      "A genuinely capable backbone for shipping team work once the work is scoped",
    ],
    whatItIsNot: [
      "A way to decide which one piece of work this week actually produces revenue",
      "A diagnostic of why your already-shipped product is converting at zero",
      "A Stripe-verified guarantee that a paying customer arrives in 60 days",
    ],
    whoForIt:
      "Teams that want a deep, configurable, all-in-one project management tool and have the time to set it up.",
    whoNotForIt:
      "Solo non-engineer founders pre-first-customer whose problem is not 'we cannot track tasks' but 'we cannot turn our live product into revenue'.",
    honestVerdict:
      "ClickUp is excellent at being a configurable home for team work. Pre-revenue solo founders almost never have a team-coordination problem — they have a 'no one is paying yet' problem. Unlock SaaS treats that problem directly: one diagnostic, one playbook, one Stripe-verified refund. Use ClickUp later when you have a team and a backlog worth coordinating.",
    faqs: [
      {
        q: "Is Unlock SaaS a ClickUp alternative?",
        a: "No. ClickUp is project management software. Unlock SaaS is a customer-acquisition playbook with a Stripe-verified refund. Completely different categories.",
      },
      {
        q: "Can I track Unlock SaaS playbook steps inside ClickUp?",
        a: "Yes. The Playbook is opinionated about which moves to make, not about where to track them. Many members already live in ClickUp and the Playbook fits cleanly on top.",
      },
      {
        q: "Will Unlock SaaS replace my entire ClickUp setup?",
        a: "No. The Playbook is a vertical workflow for one founder solving one problem (first paying customer). It does not try to be a horizontal project management platform.",
      },
      {
        q: "I have not shipped a product yet. Should I set up ClickUp first?",
        a: "Almost never. Pre-shipping, a notebook and a calendar usually beat any project-management tool. Unlock SaaS only starts mattering AFTER you have a live product the diagnostic can score.",
      },
      {
        q: "How is Unlock SaaS different from ClickUp's templates for marketing or sales?",
        a: "Templates are containers; the Playbook is the actual work. ClickUp templates organise what you have already decided. The Playbook decides what you should be doing, then verifies the result in your Stripe account.",
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
    homepageUrl: "https://clickup.com/",
    tags: ["project-management", "work-os", "team-collaboration", "for-teams"],
    lastVerified: "2026-05-18",
  },

  {
    slug: "loom",
    displayName: "Loom",
    creator: "Loom (an Atlassian company)",
    category: "Async video messaging",
    oneLine:
      "Loom helps you record and send a video. Unlock SaaS helps you decide whether a video should exist and what the message inside it should be.",
    pricingNote:
      "Loom has a free tier and paid Business and Enterprise plans billed per creator per month (verified 2026-05-18). Unlock SaaS is $1 Starter + $49/month Playbook.",
    whatItIs: [
      "An async video tool that records screen, camera, and microphone with one click",
      "A genuinely fast way to replace meetings, demos, and long Slack threads with a watchable clip",
      "A common surface for product walkthroughs, customer onboarding, and sales follow-ups",
    ],
    whatItIsNot: [
      "A reason anyone wants to watch your video in the first place",
      "A diagnostic of why your offer page is converting at zero",
      "A Stripe-verified guarantee that a paying customer arrives in 60 days",
    ],
    whoForIt:
      "Solo operators and teams whose existing audience already wants to hear from them and prefers async video to meetings.",
    whoNotForIt:
      "Founders sending Loom walkthroughs into the void with no replies — adding more Looms is not the fix.",
    honestVerdict:
      "Loom is the right medium once someone wants to hear from you. The harder upstream problem — getting one specific human to want a personalised walkthrough of your specific product — is what Unlock SaaS exists for. The Playbook produces the named human and the reason the video is worth watching; Loom then records it. Use both, in that order.",
    faqs: [
      {
        q: "Is Unlock SaaS a Loom alternative?",
        a: "No. Loom is async video software. Unlock SaaS is a customer-acquisition playbook with a Stripe-verified refund. Different categories.",
      },
      {
        q: "Should I send Loom walkthroughs as my outreach?",
        a: "Sometimes — the Playbook will tell you when. Personalised Loom walkthroughs work well at the warm end of the funnel; cold-cold outreach almost never earns a Loom click. The diagnostic and the outreach loop decide which channel earns its place.",
      },
      {
        q: "Does Unlock SaaS integrate with Loom?",
        a: "Not directly. The Playbook will instruct you to include a personalised Loom in specific outreach steps when it makes sense; you record it in Loom and paste the link.",
      },
      {
        q: "My Looms get zero replies. What should I do?",
        a: "That is a message problem, not a video-tool problem. The Playbook rewrites the first 12 seconds and the named-human framing — almost always the issue is who you sent it to, not which tool you sent it with.",
      },
      {
        q: "If I have Loom, do I still need Unlock SaaS?",
        a: "Loom answers 'how'. Unlock SaaS answers 'why anyone should watch, who specifically, and what the video has to say to earn the meeting'. Different questions.",
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
    homepageUrl: "https://www.loom.com/",
    tags: ["async-video", "communication", "sales-tool", "remote-work"],
    lastVerified: "2026-05-18",
  },
  {
    slug: "webflow",
    displayName: "Webflow",
    creator: "Webflow, Inc.",
    category: "No-code website builder",
    oneLine: "Webflow builds the marketing site. Unlock SaaS finds the customers who visit it. Different tools, different jobs.",
    pricingNote: "Webflow has a free Starter tier and paid Site plans. Unlock SaaS is $1 Starter + $49/month Playbook.",
    whatItIs: [
      "A visual website builder that outputs clean HTML and CSS",
      "A design tool for marketing sites and landing pages without code",
      "A CMS for publishing content on a polished site",
    ],
    whatItIsNot: [
      "A way to get someone to pay for what the site sells",
      "A diagnosis of why a live product page converts at zero",
      "A sales-and-outreach playbook with a Stripe-verified refund",
    ],
    whoForIt: "Founders who need a polished marketing site or landing page and want to design it themselves without writing code.",
    whoNotForIt: "Founders whose site is already live but has a flat Stripe line and needs customers, not a prettier page.",
    honestVerdict: "Webflow is excellent at making a site look professional. The problem it does not touch is the one most post-launch founders actually have: the page exists, looks fine, and still nobody buys. Unlock SaaS treats that disease directly. Plenty of members run their landing page on Webflow and their customer-acquisition work in Unlock SaaS, which is exactly the intended division of labour.",
    faqs: [
      {
        q: "Is Unlock SaaS a Webflow alternative?",
        a: "No. Webflow builds and designs the website. Unlock SaaS finds the customers who visit it. They solve different problems and are commonly used together.",
      },
      {
        q: "Can I use Unlock SaaS with a site built on Webflow?",
        a: "Yes. The diagnostic takes the URL of your live Webflow site and labels what is broken about the offer, not the design. Keep Webflow for the site; use Unlock SaaS for the customer-acquisition playbook.",
      },
      {
        q: "Does Unlock SaaS help me design a better landing page?",
        a: "Not as a design tool. It helps with the offer and messaging on that page, which is usually why a well-designed page still converts at zero. The design was never the missing piece.",
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
    homepageUrl: "https://webflow.com/",
    tags: ["no-code", "website-builder", "for-pre-launch", "design"],
    lastVerified: "2026-08-13",
  },
  {
    slug: "bubble",
    displayName: "Bubble",
    creator: "Bubble Group, Inc.",
    category: "No-code web app builder",
    oneLine: "Bubble builds the product. Unlock SaaS finds the customer for the product Bubble built. Sequential, not interchangeable.",
    pricingNote: "Bubble has a free tier and paid subscription plans. Unlock SaaS is $1 Starter + $49/month Playbook.",
    whatItIs: [
      "A visual builder for full web applications without code",
      "A way for non-engineers to ship a real product with a database and logic",
      "A common way the Unlock SaaS audience shipped their first version",
    ],
    whatItIsNot: [
      "A way to get someone to pay for what you built",
      "A diagnostic of why your app is converting at zero",
      "A guarantee tied to your Stripe ledger",
    ],
    whoForIt: "Non-engineers who want to build a functional web app with data and workflows without writing code.",
    whoNotForIt: "Founders who already built their app on Bubble and still have no paying customers.",
    honestVerdict: "Bubble solved the build-the-app problem for non-engineers. The next problem, finding a customer, is a different problem, and Bubble never claimed to solve it. Unlock SaaS is built for the Bubble-shaped founder: shipped a real product, now staring at a flat Stripe line and needing the marketing-and-sales playbook that the builder does not provide.",
    faqs: [
      {
        q: "Is Unlock SaaS a Bubble alternative?",
        a: "No. Bubble builds your product. Unlock SaaS finds the first paying customer for the product you already built. They are sequential, not substitutes.",
      },
      {
        q: "Can I use Unlock SaaS with a product I built on Bubble?",
        a: "Yes, this is the canonical audience. Paste the URL of your shipped Bubble app into the diagnostic and it labels what is broken about the offer, not the code.",
      },
      {
        q: "Do I have to move off Bubble to use Unlock SaaS?",
        a: "No. Keep Bubble for product changes. Unlock SaaS wraps around your live product and runs the marketing-and-sales playbook that Bubble does not.",
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
    homepageUrl: "https://bubble.io/",
    tags: ["no-code", "app-builder", "for-pre-launch", "ai-tool"],
    lastVerified: "2026-08-13",
  },
  {
    slug: "zapier",
    displayName: "Zapier",
    creator: "Zapier, Inc.",
    category: "Automation and integrations platform",
    oneLine: "Zapier connects your tools. Unlock SaaS connects your product to a customer. Different kinds of plumbing.",
    pricingNote: "Zapier has a free tier and paid plans based on task volume. Unlock SaaS is $1 Starter + $49/month Playbook.",
    whatItIs: [
      "A no-code automation platform that moves data between apps",
      "A way to wire up the operational plumbing of a SaaS",
      "A time-saver for repetitive multi-tool workflows",
    ],
    whatItIsNot: [
      "A customer-acquisition playbook",
      "A diagnosis of why your offer is not selling",
      "A guarantee that shipping will produce a paying customer",
    ],
    whoForIt: "Founders who need to connect their stack, move data between tools, or automate repetitive operational steps.",
    whoNotForIt: "Founders whose stack is already connected but who still have no paying customers.",
    honestVerdict: "Zapier is genuinely useful for operating a business once you have one. It does not answer the question of why nobody is paying yet. The two tools rarely compete: you use Zapier to run the machinery and Unlock SaaS to fill the pipeline that feeds it.",
    faqs: [
      {
        q: "Is Unlock SaaS a Zapier alternative?",
        a: "No. Zapier automates work between your apps. Unlock SaaS automates the work of getting a customer. One is operational plumbing, the other is a go-to-market playbook.",
      },
      {
        q: "Can I use Zapier and Unlock SaaS together?",
        a: "Yes, and this is common. Zapier runs your internal workflows; Unlock SaaS runs the customer-acquisition motion that feeds the business those workflows support.",
      },
      {
        q: "Does Unlock SaaS require Zapier?",
        a: "No. Unlock SaaS verifies results through Stripe, not through automations you build in Zapier. The two are independent.",
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
    homepageUrl: "https://zapier.com/",
    tags: ["automation", "integrations", "for-post-launch", "operations"],
    lastVerified: "2026-08-13",
  },
  {
    slug: "skool",
    displayName: "Skool",
    creator: "Sam Ovens",
    category: "Community and course platform",
    oneLine: "Skool hosts a community. Unlock SaaS runs the playbook that gets you customers to put in one. Different layers.",
    pricingNote: "Skool is a flat-rate platform at approximately $99/month per group (verified 2026-08-13). Unlock SaaS is $1 Starter + $49/month Playbook.",
    whatItIs: [
      "A flat-fee platform for running a paid community and courses",
      "A place to host members, lessons, and discussion in one product",
      "A growing home for creator-led cohorts and masterminds",
    ],
    whatItIsNot: [
      "A SaaS launch curriculum",
      "A diagnostic of why your product page converts at zero",
      "A mechanism that verifies your Stripe revenue and refunds you if nothing sells",
    ],
    whoForIt: "Creators and educators who want a simple, all-in-one place to host a paid community or course.",
    whoNotForIt: "Non-engineer SaaS founders who already shipped a product and need customers for it, not a place to host a community.",
    honestVerdict: "Skool is excellent at its job: hosting a community. Its job is not to get you your first SaaS customer, which is why the two products sit on different layers. Many Unlock SaaS members run a Skool community later, once they have an audience; the Playbook is for the earlier step, when there is no audience yet.",
    faqs: [
      {
        q: "Is Unlock SaaS a Skool alternative?",
        a: "No. Skool hosts a community and courses. Unlock SaaS runs the go-to-market playbook that gets you the customers who would later join a community. Different layers of the same business.",
      },
      {
        q: "Can I use Skool and Unlock SaaS together?",
        a: "Yes. A common path is to use Unlock SaaS to get the first paying customers, then start a Skool community once you have an audience worth hosting.",
      },
      {
        q: "Does Unlock SaaS include a community?",
        a: "Unlock SaaS is a playbook and diagnostic, not a community platform. If you want a hosted community, Skool is a reasonable choice; it just will not find your first customer for you.",
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
    homepageUrl: "https://www.skool.com/",
    tags: ["community", "course-platform", "creator-economy", "for-post-launch"],
    lastVerified: "2026-08-13",
  },
  {
    slug: "gumroad",
    displayName: "Gumroad",
    creator: "Gumroad, Inc.",
    category: "Creator commerce and digital-product checkout",
    oneLine: "Gumroad sells digital products. Unlock SaaS gets you a SaaS customer. Different products, different checkout.",
    pricingNote: "Gumroad is free to use and charges a flat fee per sale (10% as of 2026-08-13). Unlock SaaS is $1 Starter + $49/month Playbook.",
    whatItIs: [
      "A fast checkout for digital products, courses, and memberships",
      "A low-friction way for creators to sell without building a store",
      "A platform optimized for one-off digital-product sales",
    ],
    whatItIsNot: [
      "A SaaS launch curriculum",
      "A diagnosis of why your subscription product is not selling",
      "A refund tied to your Stripe ledger as a performance guarantee",
    ],
    whoForIt: "Creators selling ebooks, courses, templates, or other digital products directly to an audience.",
    whoNotForIt: "Founders selling a recurring SaaS subscription who need their first paying customer and a repeatable acquisition playbook.",
    honestVerdict: "Gumroad is the right tool for selling a digital product to an audience that already exists. Unlock SaaS is for the earlier, harder problem: building the offer and the acquisition motion so a recurring SaaS product has its first customer. They are complementary: sell a template on Gumroad, sell the SaaS with the Playbook.",
    faqs: [
      {
        q: "Is Unlock SaaS a Gumroad alternative?",
        a: "No. Gumroad sells digital products to an existing audience. Unlock SaaS gets a recurring SaaS product its first paying customer. Different checkout, different job.",
      },
      {
        q: "Can I sell my SaaS on Gumroad instead of using Unlock SaaS?",
        a: "You can list a digital product on Gumroad, but a recurring SaaS subscription is not what Gumroad is built for, and it will not diagnose or fix why the offer is not selling. Unlock SaaS works with your existing Stripe account.",
      },
      {
        q: "Can I use Gumroad and Unlock SaaS together?",
        a: "Yes. Sell standalone templates or guides on Gumroad, and use Unlock SaaS to run the customer-acquisition playbook for your recurring SaaS product.",
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
    homepageUrl: "https://gumroad.com/",
    tags: ["creator-economy", "payments", "for-post-launch", "digital-products"],
    lastVerified: "2026-08-13",
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
 * O(1) existence check for cross-pattern callouts.
 *
 * Mirrors hasPricingTeardown() in src/lib/pricing-teardowns.ts so the
 * funnel-teardown and pricing-teardown routes can surface a "Compare to
 * Unlock SaaS" callout when an /alternatives-to/{slug} page exists for the
 * same product. Closes the same-company cluster: a reader on
 * /funnel-teardown/asana can jump to /alternatives-to/asana to read the
 * substitution-intent answer without re-searching.
 */
export function hasAlternative(slug: string): boolean {
  return ALTERNATIVES_BY_SLUG.has(slug);
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
