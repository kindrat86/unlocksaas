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
