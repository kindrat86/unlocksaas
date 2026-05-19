/**
 * /pricing-model/[slug] pSEO catalog — pricing-model deep dives.
 *
 * Each entry covers ONE pricing model (flat-rate, per-seat, usage-based,
 * freemium, tiered, hybrid, pay-what-you-want, lifetime deal) with the
 * structural analysis: how the model works, when it fits indie SaaS, the
 * unit-economics implications, common implementation mistakes, and
 * cross-links to teardowns of products using it.
 *
 * Distinct from:
 *   - /pricing-teardown (specific products; "how does Stripe price?")
 *   - /positioning (category-specific positioning, not pricing model)
 *   - /saas-metric (formulas, not pricing models)
 *
 * /pricing-model is the "what is X pricing and when does it work" surface.
 *
 * Schema: Article + FAQPage + BreadcrumbList. No HowTo because the
 * content is structural analysis, not a step sequence.
 *
 * Brunson Hard-Rule:
 *   - No invented "best for SaaS X" claims. Patterns are general; the
 *     fit-decision is product-specific.
 *   - Cross-links to pricing teardowns are slug-verified at build time.
 */

import { PRICING_TEARDOWN_SLUGS } from "./pricing-teardowns";

export interface PricingModelFaq {
  q: string;
  a: string;
}

export interface PricingModelEntry {
  slug: string;
  /** Short model name. */
  modelName: string;
  /** Full display name. */
  displayName: string;
  metaTitle: string;
  metaDescription: string;
  /** 2-3 sentence intro. */
  intro: string;
  /** How the model works, structurally. */
  howItWorks: string;
  /** Honest "best for" — products / buyers / stages. */
  bestFor: string;
  /** Honest "worst for". */
  worstFor: string;
  /** Unit economics implications. */
  unitEconomicsImplications: ReadonlyArray<string>;
  /** Common implementation mistakes. */
  commonImplementationMistakes: ReadonlyArray<string>;
  /** Pricing-teardown slugs of real products using this model on this site. */
  exampleTeardownSlugs: ReadonlyArray<string>;
  /** When this model often hides a positioning problem. */
  positioningTrapWarning: string;
  faqs: ReadonlyArray<PricingModelFaq>;
  lastVerified: string;
}

export const PRICING_MODEL_ENTRIES: ReadonlyArray<PricingModelEntry> = [
  {
    slug: "flat-rate-pricing",
    modelName: "Flat-rate pricing",
    displayName: "Flat-rate pricing model",
    metaTitle: "Flat-Rate Pricing for Indie SaaS (Pros, Cons, When It Fits)",
    metaDescription:
      "How flat-rate pricing works, when it fits indie SaaS, the unit-economics implications, and the common implementation mistakes.",
    intro:
      "Flat-rate pricing charges every customer the same amount regardless of usage, seats, or feature consumption. It is the simplest pricing model and the most over-applied — many SaaS products that 'should' have tiered or usage-based pricing default to flat rate because it is easy to communicate.",
    howItWorks:
      "One price for everyone. $X/month, full product access. No tiers, no usage caps, no per-seat metering. Customers pay the same whether they use the product daily or weekly. Revenue scales linearly with customer count.",
    bestFor:
      "Products with consistent value per customer (a focused tool used by individuals). Indie SaaS at the experimentation stage (one price is operationally simpler than 3-5 tiers). Products with low usage variance — where customer A and customer B use the product similarly.",
    worstFor:
      "Products with high usage variance (some customers cost 100x more to serve). Products where teams want to share access (per-seat is the model). Products where heavy users would happily pay more for more capacity (you are leaving money on the table).",
    unitEconomicsImplications: [
      "Customer-cost variance is invisible to the price. Heavy users subsidize light users; both probably pay 'wrong' price.",
      "ARPU equals price — clean math, easy to project.",
      "LTV calculation is simple: price / churn. The cost-side is where flat-rate hides problems.",
      "Expansion revenue is structurally zero. No way for happy customers to spend more without buying multiple accounts.",
    ],
    commonImplementationMistakes: [
      "Pricing too low on flat-rate. The instinct is 'one accessible price'; in reality, flat-rate often leaves money on the table at the high end.",
      "Not offering an annual variant. Most flat-rate SaaS should still offer monthly + annual; the annual is the high-LTV signal.",
      "Sticking with flat-rate past product-market fit. Many SaaS that started flat-rate should add tiers once usage variance becomes visible.",
      "Charging flat-rate for teams. Almost always wrong — teams expect per-seat or per-workspace pricing.",
    ],
    exampleTeardownSlugs: ["plausible"],
    positioningTrapWarning:
      "Flat-rate often hides a 'we do not know who our customer is' problem. When you do not know which customer cohorts use the product differently, flat-rate is the safe-feeling default. Once cohort-specific behavior becomes visible, flat-rate starts under-monetizing the heavy users and over-charging the light ones.",
    faqs: [
      {
        q: "Should an indie SaaS start with flat-rate?",
        a: "Often yes for the first 3-12 months. Simpler to communicate, simpler to operate, fewer pricing-experiment variables to manage. Migrate to tiered or usage-based once you have data on actual customer behavior variance.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "per-seat-pricing",
    modelName: "Per-seat pricing",
    displayName: "Per-seat pricing model",
    metaTitle: "Per-Seat Pricing for SaaS (Pros, Cons, When It Fits)",
    metaDescription:
      "How per-seat pricing works, when it fits indie SaaS, the unit-economics implications, and the common implementation mistakes.",
    intro:
      "Per-seat pricing charges per active user inside a customer's account. It is the dominant B2B SaaS model and the most-attempted indie SaaS pricing model — but works only for products where multi-user collaboration is core to the value.",
    howItWorks:
      "Customer pays $X per seat per month. Adding teammates increases the customer's bill. Removing teammates reduces it. Pricing scales with team size; revenue scales with both customer count AND average customer team size.",
    bestFor:
      "Collaborative products where multiple team members get value (project management, design tools, internal-tooling platforms). Products where each user generates measurable individual value. Mature SaaS where customer companies have stable team structures.",
    worstFor:
      "Solo-user products (forms, calendars, individual analytics). Products where 'one person can do the work but others want to look'. Products with high seat-creep churn (teams adding then removing seats monthly).",
    unitEconomicsImplications: [
      "ARPU varies wildly by customer team size. A 5-seat customer and a 50-seat customer have 10x different revenue but similar support cost.",
      "Expansion revenue is built in — customers grow seats organically as their team grows.",
      "Churn risk is per-seat, not per-customer. Customers can downgrade by removing seats without canceling.",
      "Sales cycle lengthens at higher seat counts — 50-seat deals require procurement review at the customer.",
    ],
    commonImplementationMistakes: [
      "Per-seat pricing on solo-user products. If one person can do the work and others just want visibility, per-seat creates resentment and incentivizes shared logins.",
      "Identical per-seat price regardless of role. Read-only seats often deserve lower pricing than active-user seats.",
      "No minimum seat count. Customers buy 1 seat to test, then never expand. A 3-seat minimum forces the collaboration value.",
      "Counting inactive users as billed seats without warning. Triggers churn the moment the customer notices.",
    ],
    exampleTeardownSlugs: ["linear", "figma", "notion"],
    positioningTrapWarning:
      "Per-seat pricing on a product where multi-user value is weak creates resentment and reduces total revenue. Customers find ways around it (shared logins) and the per-seat math breaks. If your product can be used productively by one person, per-seat is almost always the wrong model.",
    faqs: [
      {
        q: "Should the first seat be free?",
        a: "Sometimes yes, as a freemium hook for the team. Free first seat + paid second seat onwards forces the team-conversion conversation. Works for products where individual use is partial-value and team use is full-value.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "usage-based-pricing",
    modelName: "Usage-based pricing",
    displayName: "Usage-based pricing model",
    metaTitle: "Usage-Based Pricing for SaaS (Pros, Cons, When It Fits)",
    metaDescription:
      "How usage-based pricing works, when it fits indie SaaS, the unit-economics implications, and the common implementation mistakes.",
    intro:
      "Usage-based pricing charges by what the customer consumes — API calls, GB of data, emails sent, messages processed. It is the dominant developer-tools pricing model and increasingly common in AI products. Done well, it aligns customer cost with customer value.",
    howItWorks:
      "Customer pays per unit of consumption. Pricing can be pure usage ($X per 1,000 API calls) or hybrid (a base subscription plus usage above a threshold). Heavy users pay more; light users pay less.",
    bestFor:
      "Developer infrastructure (email APIs, payment processing, AI inference). Products where heavy customers genuinely cost more to serve. Products where value scales with usage (more emails sent = more business value to customer).",
    worstFor:
      "Products where usage is hard to predict for the customer. Products where customers want predictable budgets. Products with low cost-per-customer that don't justify the operational complexity of metering.",
    unitEconomicsImplications: [
      "Unit economics align: customer cost scales with customer value AND infrastructure cost.",
      "Revenue concentration risk — a few whale customers can produce most revenue.",
      "Customer-cost predictability is bad. Many enterprises require predictable billing; usage-based without a cap is a non-starter.",
      "Churn-by-decrease is invisible — customers can reduce usage without canceling, which feels like churn from a revenue perspective.",
    ],
    commonImplementationMistakes: [
      "No usage caps or alerts. Customers wake up to a $10,000 bill from a runaway script and refund-rage.",
      "Pure usage with no subscription base. Eliminates revenue predictability; investors and operators alike struggle to forecast.",
      "Per-unit prices that are too cheap to matter. Customers stop optimizing usage and your margins compress.",
      "Complicated metering customers cannot understand. If the customer cannot explain the bill, the relationship erodes.",
    ],
    exampleTeardownSlugs: ["resend", "vercel"],
    positioningTrapWarning:
      "Usage-based pricing on non-developer products often fails because the customer cannot predict their usage in advance. Marketing-team buyers want fixed costs; engineering buyers tolerate variable costs. Pricing model has to match buyer-team's budgeting style.",
    faqs: [
      {
        q: "Should I offer a usage cap so customers can predict bills?",
        a: "Yes. Either soft caps (alerts at thresholds) or hard caps (service stops above limit). Most enterprise buyers require it. Indie buyers appreciate it. Pure no-cap usage-based works for hobbyist developer tools and almost nowhere else.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "freemium-pricing",
    modelName: "Freemium pricing",
    displayName: "Freemium pricing model",
    metaTitle: "Freemium Pricing for Indie SaaS (When It Works, When It Fails)",
    metaDescription:
      "How freemium works for indie SaaS, when it fits, the unit-economics math, and why most indie freemium attempts fail.",
    intro:
      "Freemium offers a free tier alongside paid tiers. The free tier acquires users at zero acquisition cost; some convert to paid. Done well it produces a wide top-of-funnel; done badly it produces a population of non-customers who consume support and infrastructure without paying.",
    howItWorks:
      "Free tier with limited usage, features, or capacity. Paid tier(s) with full access. Conversion from free to paid happens when free-tier limits become binding for the customer. Revenue depends on the paid-tier price AND the free-to-paid conversion rate.",
    bestFor:
      "Network-effect products where free users add value to paid users (collaboration tools, marketplaces). Products with low marginal cost per free user. Categories with strong viral mechanics that free users amplify.",
    worstFor:
      "Indie SaaS at the experimentation stage (the free tier consumes support time without funding). Products with high per-user infrastructure cost. Categories where the free alternative is good enough that conversion is structurally low (project management, note-taking).",
    unitEconomicsImplications: [
      "Free-to-paid conversion is typically 1-5% for indie SaaS, 2-5% for venture-funded SaaS with strong distribution.",
      "Free-tier infrastructure cost is real. Some indie SaaS lose money on free tier alone before any paid revenue.",
      "Support cost per free user is often higher than per paid user (free users have more questions per use).",
      "CAC for paid customers is technically zero through free-tier conversion, but the implicit cost is the free-tier overhead.",
    ],
    commonImplementationMistakes: [
      "Generous free tier that satisfies most use cases. Customers never hit the upgrade trigger.",
      "Free tier without a clear conversion path. Users do not know what they would get if they upgraded.",
      "No support boundary between free and paid. Free users consume the same support time as paid customers.",
      "Launching freemium too early. Pre-product-market-fit, freemium populates the user base with non-customers and confuses signal.",
    ],
    exampleTeardownSlugs: ["beehiiv", "tally", "cal-com"],
    positioningTrapWarning:
      "Freemium often hides a Weak Offer problem. If the conversion rate from free to paid is below 1% sustainably, the paid offer does not feel like worth-the-money to most free users. Adding more free-tier limitations rarely fixes this; rebuilding the paid offer's value is the real fix.",
    faqs: [
      {
        q: "Should an early-stage indie SaaS offer freemium?",
        a: "Usually no, for the first 6-12 months. Free-trial (time-limited) is operationally simpler and produces stronger signal. Migrate to freemium only after you have data on which free users would actually convert and why.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "tiered-pricing",
    modelName: "Tiered pricing",
    displayName: "Tiered pricing model",
    metaTitle: "Tiered Pricing for SaaS (Good / Better / Best Pattern)",
    metaDescription:
      "How tiered pricing works for indie SaaS, when it fits, the three-tier pattern, and the common implementation mistakes.",
    intro:
      "Tiered pricing offers 2-4 paid plans at increasing price points, with each tier including more features, more usage, or both. It is the most common B2B SaaS pricing model and works well at scale — but requires real understanding of customer cohorts to design well.",
    howItWorks:
      "Multiple tiers at different price points. Customer self-selects based on need or constraint. Tier differentiation is some mix of features, usage limits, support level, and access to advanced functionality. Upgrades happen as customers grow.",
    bestFor:
      "Products with clear customer cohorts that have measurably different needs. Products at $50+/month where pricing flexibility matters. Mature SaaS with data on which features drive upgrades.",
    worstFor:
      "Pre-product-market-fit SaaS without clear cohort data. Indie SaaS at the experimentation stage (designing tiers without data is guesswork). Products where the difference between tiers is artificial (gating features that should be in every tier).",
    unitEconomicsImplications: [
      "ARPU rises as customers upgrade through tiers — natural expansion revenue.",
      "The middle tier usually carries the most customers (decoy effect; people anchor on the cheap and the expensive, then choose the middle).",
      "The cheapest tier exists partly to make the middle tier feel reasonable.",
      "The premium tier exists partly to anchor and partly to capture high-value customers willing to pay for full access.",
    ],
    commonImplementationMistakes: [
      "Too many tiers (5+). Customers cannot decide. Three is the sweet spot.",
      "Gating obvious features behind upgrade. 'You have to pay $50/mo for export to CSV' triggers refund-rage.",
      "Tier differentiation by feature when the customer cares about usage. Usage limits are more honest than feature gating.",
      "Cheapest tier too expensive for the smallest cohort. The bottom tier should let the smallest paying customer in.",
    ],
    exampleTeardownSlugs: ["linear", "figma", "notion", "stripe"],
    positioningTrapWarning:
      "Tiered pricing without cohort data hides a 'we are guessing' problem. The right tier structure emerges from data on actual customer needs; designing it pre-data produces tiers that feel arbitrary and convert poorly.",
    faqs: [
      {
        q: "How many tiers should an indie SaaS have?",
        a: "Three tiers for most products. Two if you are early-stage and the difference between tiers is small. Four-plus rarely converts better than three; complexity is the cost.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "hybrid-pricing",
    modelName: "Hybrid (subscription + usage) pricing",
    displayName: "Hybrid (subscription + usage) pricing model",
    metaTitle: "Hybrid Pricing for SaaS: Subscription Plus Usage",
    metaDescription:
      "How hybrid pricing works (subscription base plus usage-based upside), when it fits indie SaaS, and the common implementation mistakes.",
    intro:
      "Hybrid pricing combines a fixed subscription base with a usage-based component on top. The subscription covers operational predictability; the usage component captures upside from heavy users. It is the dominant model for modern infrastructure SaaS.",
    howItWorks:
      "Customer pays $X/month as a subscription floor (includes some bundled usage). Above the bundled threshold, pay $Y per unit. Revenue scales with both customer count AND customer usage. Predictable enough for budgeting; flexible enough for upside.",
    bestFor:
      "Infrastructure SaaS where customers have both predictable baseline and unpredictable spikes (databases, email APIs, AI inference). Products with high usage variance where pure flat-rate under-monetizes heavy users.",
    worstFor:
      "Pure productivity SaaS where usage is roughly constant per customer. Indie SaaS at the experimentation stage (hybrid pricing complexity is hard to operate).",
    unitEconomicsImplications: [
      "Subscription floor provides revenue predictability — the part the business can forecast.",
      "Usage upside captures whale customers without alienating light users.",
      "More complex billing operationally — requires metering, alerting, and customer-facing usage dashboards.",
      "Customer-acquisition message is more complex (two price components to explain).",
    ],
    commonImplementationMistakes: [
      "Setting the bundled usage too low. Customers feel they're paying twice (subscription + usage) for normal use.",
      "Setting the per-unit price too high above the bundle. Whale customers refuse to grow because cost-per-extra-unit feels punitive.",
      "No alerts at usage thresholds. Customers get surprised by bills, refund, churn.",
      "Hiding the per-unit price on the pricing page. Customers cannot self-calculate their expected cost.",
    ],
    exampleTeardownSlugs: ["vercel", "resend"],
    positioningTrapWarning:
      "Hybrid pricing on a product where usage is invisible to the customer creates anxiety. Customers cannot tell what they are buying. If your usage metric is internal-to-you and the customer cannot self-meter it, hybrid pricing erodes trust.",
    faqs: [
      {
        q: "Should the bundled usage cover most customers?",
        a: "Yes. The bundle should cover the median customer comfortably. Heavy users are the upside; light users should feel they are getting the bundle's value. If the bundle is too small for the median, customers feel nickel-and-dimed.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "pay-what-you-want-pricing",
    modelName: "Pay-what-you-want pricing",
    displayName: "Pay-what-you-want pricing model",
    metaTitle: "Pay-What-You-Want Pricing for Indie SaaS (When It Works)",
    metaDescription:
      "How pay-what-you-want pricing works, when it fits indie SaaS, the unit-economics math, and the failure modes.",
    intro:
      "Pay-what-you-want pricing lets the customer choose any price above a minimum (or zero). It is an unusual model with narrow fit — works for indie creators with strong audience, fails for most commercial SaaS. Honest analysis below.",
    howItWorks:
      "Customer chooses what to pay. Minimum is usually zero or $1. Some implementations suggest an average or default value. Revenue depends entirely on customer goodwill and the perceived value-to-cost ratio.",
    bestFor:
      "Indie creators with audiences who already feel a relationship (e.g., creator products to a newsletter list). One-time digital downloads where marginal cost is zero. Goodwill-driven sales with no expansion-revenue path.",
    worstFor:
      "Commercial SaaS with infrastructure cost. B2B sales where the customer is a buyer, not an audience-member. Products requiring sustained service or support.",
    unitEconomicsImplications: [
      "Mean payment is usually 30-60% of the suggested price.",
      "Distribution is bimodal — many at the minimum, a few at large amounts. The few cover the many.",
      "Conversion rate is often higher than at fixed price (lower friction); revenue per visitor is usually lower.",
      "Support cost per dollar of revenue is very high (free-tier dynamics apply).",
    ],
    commonImplementationMistakes: [
      "Using PWYW without an audience relationship. The whole model depends on a sense of goodwill; cold traffic produces near-zero average payment.",
      "Not suggesting an average or default. Customers do not know what is reasonable; defaults to very low.",
      "PWYW on a recurring product. Recurring PWYW erodes trust as customers wonder what the 'right' amount is each month.",
      "Skipping the goodwill-build before launch. Many PWYW launches fail because there was no relationship to draw on.",
    ],
    exampleTeardownSlugs: [],
    positioningTrapWarning:
      "PWYW often hides 'I do not know what this is worth and I am hoping customers will tell me'. That is a positioning problem, not a pricing problem. Decide what the offer is worth before letting customers tell you.",
    faqs: [
      {
        q: "Is PWYW worth trying for indie SaaS?",
        a: "Almost never as a long-term model. Sometimes valuable as a launch experiment to test demand at scale before locking in a price. Not a sustainable revenue model for commercial SaaS.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "lifetime-deal-pricing",
    modelName: "Lifetime deal pricing",
    displayName: "Lifetime deal (LTD) pricing model",
    metaTitle: "Lifetime Deal (LTD) Pricing for SaaS (Pros and Cons)",
    metaDescription:
      "How lifetime deals work, when they fit indie SaaS, why most SaaS founders regret LTDs, and the unit-economics math.",
    intro:
      "Lifetime deals charge a one-time payment in exchange for permanent access. They produce a cash spike that can fund initial development — and a customer cohort that costs money forever after. Most indie SaaS founders regret LTDs within 18 months. The framework below names when LTDs work and when they do not.",
    howItWorks:
      "Customer pays once (typically $49-$499) for permanent access to the product. No recurring revenue from that customer. Revenue is concentrated in the launch window; support cost continues indefinitely.",
    bestFor:
      "Pre-launch validation (capture intent and cash, refund if you cannot deliver). Distribution-channel partnerships (AppSumo, StackSocial) that drive volume. Products with very low marginal serving cost where the LTD cohort is small relative to the eventual paying base.",
    worstFor:
      "Established SaaS with healthy MRR. SaaS with non-trivial infrastructure cost per customer. Products where the LTD cohort would be more than 5-10% of the customer base — the recurring revenue lost is structurally permanent.",
    unitEconomicsImplications: [
      "Cash-positive in the launch window, cash-negative for the LTD cohort's lifetime thereafter.",
      "LTD customers consume support indefinitely without further revenue.",
      "MRR-based valuation is hurt by LTDs — the cohort never produces recurring revenue.",
      "LTD cohort often produces low-quality referrals (other deal-hunters), not target-customer referrals.",
    ],
    commonImplementationMistakes: [
      "LTD at a price below 12-24 months of equivalent subscription value. Math does not work; the LTD cohort becomes a permanent cost.",
      "Unlimited LTDs without a cap. The cohort grows beyond the company's ability to serve it sustainably.",
      "LTD without a clear migration path. When you eventually move off LTD, existing LTDs feel betrayed.",
      "LTD with no usage caps. Heavy LTD users consume disproportionate infrastructure.",
    ],
    exampleTeardownSlugs: [],
    positioningTrapWarning:
      "LTD often hides 'I need cash now and I am willing to pay for it forever'. The honest version: take a bridge loan against future MRR instead. Or run a presale (refundable if you do not deliver) at a normal price. LTD is rarely the best solution to the cash-now problem.",
    faqs: [
      {
        q: "Should I run an LTD on AppSumo to validate my product?",
        a: "Validate with pre-orders refundable if you do not deliver. Same cash, different mechanics, no permanent-cost cohort. If you do choose AppSumo, cap the deal aggressively and price the LTD at 24+ months of equivalent subscription value.",
      },
    ],
    lastVerified: "2026-05-19",
  },
];

export const PRICING_MODEL_SLUGS: ReadonlyArray<string> =
  PRICING_MODEL_ENTRIES.map((e) => e.slug);

export function getPricingModelBySlug(
  slug: string,
): PricingModelEntry | undefined {
  return PRICING_MODEL_ENTRIES.find((e) => e.slug === slug);
}

// Build-time guard: every exampleTeardownSlug must resolve in pricing-teardowns.ts.
{
  const known = new Set<string>(PRICING_TEARDOWN_SLUGS);
  for (const entry of PRICING_MODEL_ENTRIES) {
    for (const slug of entry.exampleTeardownSlugs) {
      if (!known.has(slug)) {
        throw new Error(
          `pricing-models.ts: entry "${entry.slug}" references unknown pricing-teardown slug "${slug}".`,
        );
      }
    }
  }
}
