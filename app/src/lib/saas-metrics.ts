/**
 * /saas-metric/[slug] pSEO catalog — SaaS metric definitions + formulas.
 *
 * Each entry covers ONE SaaS metric (MRR, ARR, CAC, LTV, churn, etc.)
 * with the formula, how to calculate it, what it tells you, and common
 * miscalculations. Distinct from:
 *   - /glossary  (Brunson-method terms: Hook, Story, Offer, Big Domino)
 *   - /benchmarks (directional ranges per metric; "what is a good X")
 *
 * /saas-metric is the "what IS X" + "how do I calculate X" surface.
 * /benchmarks is the "what is a good X" surface. They cross-link: each
 * /saas-metric page links to the matching /benchmarks page when one
 * exists, and vice versa.
 *
 * Schema: DefinedTerm + Article + FAQPage + BreadcrumbList. DefinedTerm
 * is the citation-friendly schema for "what is X" queries on AI
 * Overviews and Perplexity.
 *
 * Brunson Hard-Rule:
 *   - Formula must be the canonical industry formula, not a clever
 *     reinterpretation.
 *   - "Common miscalculations" reflect real founder mistakes observed
 *     in the diagnostic engine output, not invented anti-patterns.
 *   - Build-time guard at the bottom enforces every related-benchmark
 *     slug resolves in benchmarks.ts.
 */

import { BENCHMARK_SLUGS } from "./benchmarks";

export type MetricCategory =
  | "revenue"
  | "growth"
  | "acquisition"
  | "retention"
  | "unit-economics"
  | "operational";

export interface MetricFormula {
  /** Plain-language formula. */
  expression: string;
  /** Each variable explained. */
  variables: ReadonlyArray<{ name: string; meaning: string }>;
}

export interface SaasMetricFaq {
  q: string;
  a: string;
}

export interface SaasMetricEntry {
  slug: string;
  /** Canonical metric name. */
  metricName: string;
  /** Common abbreviation. */
  abbreviation: string;
  /** Full display name. */
  displayName: string;
  metaTitle: string;
  metaDescription: string;
  /** 1-2 sentence definition (short, citation-ready). */
  shortDefinition: string;
  /** Longer 2-3 sentence definition with context. */
  longDefinition: string;
  category: MetricCategory;
  /** The canonical formula. */
  formula: MetricFormula;
  /** Worked example with specific numbers. */
  workedExample: string;
  /** What this metric tells you, in priority order. */
  whatItTellsYou: ReadonlyArray<string>;
  /** What this metric does NOT tell you. */
  whatItDoesntTellYou: ReadonlyArray<string>;
  /** Common miscalculations. */
  commonMiscalculations: ReadonlyArray<string>;
  /** Slug of the matching benchmark page (where "what is a good X" lives). */
  relatedBenchmarkSlug?: string;
  faqs: ReadonlyArray<SaasMetricFaq>;
  lastVerified: string;
}

export const SAAS_METRIC_ENTRIES: ReadonlyArray<SaasMetricEntry> = [
  {
    slug: "mrr",
    metricName: "Monthly Recurring Revenue",
    abbreviation: "MRR",
    displayName: "MRR (Monthly Recurring Revenue)",
    metaTitle: "MRR Formula and How to Calculate It (SaaS)",
    metaDescription:
      "MRR formula, worked example, what MRR tells you and what it does not, and the three common miscalculations indie SaaS founders make.",
    shortDefinition:
      "MRR is the predictable monthly revenue a SaaS earns from active recurring subscriptions, normalized to a monthly basis.",
    longDefinition:
      "Monthly Recurring Revenue (MRR) sums the monthly value of every active subscription, normalizing annual or quarterly subscriptions down to their monthly equivalent. It excludes one-time charges (setup fees, courses, single purchases) and represents the predictable revenue base the business can plan against.",
    category: "revenue",
    formula: {
      expression: "MRR = sum of (active subscription monthly value)",
      variables: [
        {
          name: "active subscription monthly value",
          meaning:
            "Monthly billing amount for monthly plans; annual billing amount divided by 12 for annual plans; quarterly divided by 3 for quarterly plans. Excludes one-time charges.",
        },
      ],
    },
    workedExample:
      "Suppose you have 100 customers: 80 on $29/month plans, 15 on $99/month plans, and 5 on $999/year plans. MRR = (80 × $29) + (15 × $99) + (5 × $999 / 12) = $2,320 + $1,485 + $416.25 = $4,221.25.",
    whatItTellsYou: [
      "The predictable revenue base for next month, assuming zero churn.",
      "The 'speed' of the business — MRR growth rate is the indie SaaS speedometer.",
      "Whether the recurring engine is real or whether revenue is one-time-heavy.",
    ],
    whatItDoesntTellYou: [
      "Profitability — MRR ignores cost of goods, support, and acquisition cost.",
      "Quality of revenue — $1,000 from 1 customer is more concentrated risk than $1,000 from 100.",
      "Future MRR — it is a snapshot, not a forecast. Churn risk is invisible in this number alone.",
    ],
    commonMiscalculations: [
      "Including one-time charges (course purchases, setup fees). These belong in total revenue, not MRR.",
      "Dividing annual plans by 12 when they have not been collected yet. Pre-paid annual revenue is real MRR; uncollected commitment is not.",
      "Counting churned subscriptions for the full month they churned in. Standard practice is to count them up to the churn date or for the full period billed, but not beyond.",
      "Mixing currencies without converting. Multi-currency MRR must be normalized to one reporting currency at a fixed monthly rate.",
    ],
    relatedBenchmarkSlug: "saas-mrr-growth-rate",
    faqs: [
      {
        q: "Should I report MRR or total revenue?",
        a: "Both, separately. MRR shows the recurring engine; total revenue shows the full business including one-time and project revenue. Investors and operators care about both, but for different decisions.",
      },
      {
        q: "How do I handle prorated upgrades or downgrades?",
        a: "Count the new monthly rate from the date of change. The prorated portion lives in the cash-basis revenue numbers, not in MRR. MRR is a normalized speedometer, not a cash-flow report.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "arr",
    metricName: "Annual Recurring Revenue",
    abbreviation: "ARR",
    displayName: "ARR (Annual Recurring Revenue)",
    metaTitle: "ARR Formula and How to Calculate It (SaaS)",
    metaDescription:
      "ARR formula, the relationship between ARR and MRR, when each is the right metric to report, and the common indie SaaS miscalculations.",
    shortDefinition:
      "ARR is the annualized value of recurring revenue, calculated as MRR × 12 or as the sum of annual subscription values.",
    longDefinition:
      "Annual Recurring Revenue (ARR) is the annualized projection of recurring subscription revenue. It is mathematically equivalent to MRR × 12 for businesses with monthly billing, but is typically the headline number for businesses with annual subscriptions or larger contract sizes.",
    category: "revenue",
    formula: {
      expression: "ARR = MRR × 12 (or sum of active annual subscription values)",
      variables: [
        {
          name: "MRR",
          meaning: "Monthly Recurring Revenue, calculated separately.",
        },
        {
          name: "annual subscription values",
          meaning: "Full annual contract values for customers on annual billing.",
        },
      ],
    },
    workedExample:
      "If MRR is $4,221.25, ARR is $4,221.25 × 12 = $50,655. For a business with mostly annual contracts, ARR is the natural reporting unit: 30 customers on $5,000/year contracts = $150,000 ARR.",
    whatItTellsYou: [
      "The annualized run-rate of the recurring engine.",
      "A clean conversation unit at scale — '$10M ARR' is more readable than '$833,333 MRR'.",
      "The annualized scale for fundraising or acquisition discussions.",
    ],
    whatItDoesntTellYou: [
      "Whether the underlying MRR is stable or growing. ARR can be flat or declining even when monthly numbers move.",
      "Cash-basis revenue. ARR is a projection; actual cash collected can be very different.",
      "Customer concentration risk. A $100k ARR business with 1 customer is fundamentally different from 100 customers.",
    ],
    commonMiscalculations: [
      "Reporting ARR for businesses that are primarily one-time or service revenue. ARR only applies to recurring contracts.",
      "Counting annual contracts that have not been signed or paid as ARR. Pipeline is not ARR.",
      "Including churned customers in ARR for the calendar year they churned. ARR is point-in-time.",
    ],
    relatedBenchmarkSlug: "saas-mrr-growth-rate",
    faqs: [
      {
        q: "Should indie SaaS use ARR or MRR as the primary metric?",
        a: "MRR until you cross $1M ARR — monthly cadence matches indie operator decision-making. Switch to ARR above $1M when monthly variance becomes less meaningful.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "cac",
    metricName: "Customer Acquisition Cost",
    abbreviation: "CAC",
    displayName: "CAC (Customer Acquisition Cost)",
    metaTitle: "CAC Formula and How to Calculate It (SaaS)",
    metaDescription:
      "CAC formula, blended vs paid-only CAC, what CAC tells you and what it does not, plus the common miscalculations indie SaaS founders make.",
    shortDefinition:
      "CAC is the total cost (marketing + sales + tooling) to acquire one new paying customer, calculated over a defined time window.",
    longDefinition:
      "Customer Acquisition Cost (CAC) divides total marketing and sales spend by the number of new paying customers acquired in the same window. Indie SaaS founders should track two versions: blended CAC (all marketing including organic) and paid-only CAC (only paid channels). They tell different stories.",
    category: "acquisition",
    formula: {
      expression:
        "CAC = (marketing spend + sales spend + tooling) / new paying customers acquired in same period",
      variables: [
        {
          name: "marketing spend",
          meaning:
            "Paid ads, content production cost, marketing-team comp, paid tools attributed to marketing.",
        },
        {
          name: "sales spend",
          meaning:
            "Sales-team comp, CRM cost, demo tools, sales-attributed time of the founder.",
        },
        {
          name: "tooling",
          meaning:
            "Analytics, email automation, scheduling tools tied to acquisition.",
        },
        {
          name: "new paying customers acquired in same period",
          meaning:
            "Customers who paid for the first time during the same window the spend was incurred.",
        },
      ],
    },
    workedExample:
      "In Q3, you spent $4,000 on ads, $0 on sales staff (you are solo), and $200 on analytics + email tools. You acquired 50 new paying customers. Blended CAC = ($4,000 + $0 + $200) / 50 = $84.",
    whatItTellsYou: [
      "The cost-side of unit economics. CAC paired with LTV is the fundamental health check.",
      "Whether paid acquisition is sustainable at current pricing.",
      "Where to allocate marketing budget — channels with lower CAC at acceptable scale.",
    ],
    whatItDoesntTellYou: [
      "Whether the customers acquired are good fit. Low CAC at acceptable quality is the goal; low CAC at terrible quality is the trap.",
      "Long-term acquisition trends. CAC fluctuates; a single quarter is a snapshot, not a trend.",
      "Whether the customers will retain. CAC is paid up front; LTV is realized over months. Both matter.",
    ],
    commonMiscalculations: [
      "Including only ad spend; excluding tooling and time costs. Founder time has a real cost.",
      "Calculating CAC for one channel only. Channel-specific CAC is useful for budget allocation; blended CAC is the unit-economics number.",
      "Counting trials or free-tier signups as 'new customers'. CAC denominator is paying customers, not signups.",
      "Allocating a quarter of marketing spend to one month of customers. Spend window and customer window must match.",
    ],
    relatedBenchmarkSlug: "customer-acquisition-cost",
    faqs: [
      {
        q: "Should I count my own time as a CAC cost?",
        a: "Yes, with a realistic hourly rate. Excluding founder time produces flattering numbers that hide the real economics. Even an estimate ($50-$200/hour depending on your alternative use) gives an honest baseline.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "ltv",
    metricName: "Lifetime Value",
    abbreviation: "LTV",
    displayName: "LTV (Customer Lifetime Value)",
    metaTitle: "LTV Formula and How to Calculate It (SaaS)",
    metaDescription:
      "LTV formula for SaaS, the simple version vs the gross-margin version, how to handle small samples, and the common miscalculations.",
    shortDefinition:
      "LTV is the total expected revenue (or gross profit) from a single customer over the lifetime of their subscription with you.",
    longDefinition:
      "Customer Lifetime Value (LTV) projects how much revenue or gross profit a customer will generate before they churn. The simplest formula is ARPU / churn rate; the more honest formula multiplies by gross margin to give a true profit-LTV. Both versions are useful; mixing them is the most common indie SaaS miscalculation.",
    category: "unit-economics",
    formula: {
      expression:
        "LTV (revenue) = ARPU / monthly churn rate. LTV (gross profit) = LTV (revenue) × gross margin %.",
      variables: [
        {
          name: "ARPU",
          meaning:
            "Average Revenue Per User per month. Total MRR divided by customer count.",
        },
        {
          name: "monthly churn rate",
          meaning:
            "Percentage of customers who cancel each month. 5% churn = 0.05.",
        },
        {
          name: "gross margin %",
          meaning:
            "(Revenue - cost of goods sold) / revenue. For pure-software SaaS, often 70-90%.",
        },
      ],
    },
    workedExample:
      "ARPU is $49/month. Monthly churn rate is 5% (0.05). Gross margin is 85%. LTV (revenue) = $49 / 0.05 = $980. LTV (gross profit) = $980 × 0.85 = $833.",
    whatItTellsYou: [
      "The revenue-side of unit economics. LTV paired with CAC is the fundamental health check.",
      "Whether the offer's price + retention combination is sustainable.",
      "The 'budget' you have for customer acquisition (LTV is the ceiling on healthy CAC).",
    ],
    whatItDoesntTellYou: [
      "When the revenue arrives. LTV is theoretical; the customer takes 1/churn months to realize it.",
      "Whether the churn rate is stable. Calculating LTV against a wildly fluctuating churn rate produces unstable LTV.",
      "Customer quality. LTV averages over the customer base; bad-fit customers drag down LTV from good-fit customers.",
    ],
    commonMiscalculations: [
      "Calculating LTV against monthly churn under 1%. For very low churn, the LTV formula produces inflated numbers that do not reflect reality. Use cohort-based LTV at low-churn scale.",
      "Mixing revenue-LTV and profit-LTV in the same comparison. Always specify which you mean.",
      "Calculating LTV before 6+ months of cohort data exists. Pre-revenue LTV is an estimate, not a measurement.",
      "Using churn rate from one month as if it were the long-run rate. Cohort churn shifts over time.",
    ],
    relatedBenchmarkSlug: "lifetime-value",
    faqs: [
      {
        q: "When should I use revenue-LTV vs gross-profit-LTV?",
        a: "Revenue-LTV for pricing decisions and customer-quality comparisons. Gross-profit-LTV for unit-economics health and fundraising conversations. Both are correct; the use case differs.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "ltv-to-cac",
    metricName: "LTV to CAC Ratio",
    abbreviation: "LTV:CAC",
    displayName: "LTV:CAC Ratio",
    metaTitle: "LTV:CAC Ratio Formula and Healthy Targets (SaaS)",
    metaDescription:
      "LTV:CAC ratio formula, what 1:1, 3:1, and 5:1 actually mean, and the common indie SaaS miscalculations that produce misleading ratios.",
    shortDefinition:
      "LTV:CAC ratio is the multiple of customer lifetime value over customer acquisition cost — the single highest-signal unit-economics metric.",
    longDefinition:
      "The LTV:CAC ratio compares how much a customer is worth (LTV) against what they cost to acquire (CAC). It is the single most-cited unit-economics metric in SaaS investing and operating. Indie SaaS targets are typically 3:1 (healthy) to 5:1 (excellent); below 1:1 is unsustainable.",
    category: "unit-economics",
    formula: {
      expression: "LTV:CAC = LTV / CAC, expressed as a ratio (e.g. 3:1)",
      variables: [
        {
          name: "LTV",
          meaning:
            "Lifetime value (gross-profit version is more meaningful for this ratio).",
        },
        {
          name: "CAC",
          meaning:
            "Customer acquisition cost over the same period (blended CAC for business-wide ratio).",
        },
      ],
    },
    workedExample:
      "LTV (gross profit) is $833. CAC is $84. LTV:CAC = $833 / $84 = 9.9:1. That is excellent — most healthy SaaS sits 3:1 to 5:1.",
    whatItTellsYou: [
      "The fundamental health of the acquisition engine. A 3:1+ ratio supports growth investment; below 1:1 is unsustainable.",
      "Whether to spend more on acquisition or fix retention first. Low LTV:CAC due to high CAC vs. low LTV requires different fixes.",
      "Investor-grade health signal. Pitch decks lead with LTV:CAC for a reason.",
    ],
    whatItDoesntTellYou: [
      "Payback period. A 5:1 LTV:CAC with a 36-month payback is harder to operate than 3:1 with a 6-month payback.",
      "Sample size. Calculated on 5 customers, the ratio is noise. Need 50+ customers and 6+ months of churn data.",
      "Mix shift. Different cohorts can have wildly different ratios; the blended number can mask important differences.",
    ],
    commonMiscalculations: [
      "Using revenue-LTV against ad-only CAC. Either both numbers are revenue-based or both are gross-profit-based; mixing inflates the ratio.",
      "Calculating against low-churn LTV. If churn is under 1%, LTV is unreliable, so the ratio is unreliable.",
      "Ignoring payback period. A 5:1 ratio over 36 months is not the same as 3:1 over 6 months.",
    ],
    relatedBenchmarkSlug: "lifetime-value",
    faqs: [
      {
        q: "What if my LTV:CAC is 10:1+?",
        a: "Either you are under-investing in growth and could spend more on acquisition, or your LTV is overstated (often due to low-sample churn calculation). Investigate before celebrating.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "churn-rate",
    metricName: "Churn Rate",
    abbreviation: "Churn",
    displayName: "Churn rate (customer + revenue churn)",
    metaTitle: "Churn Rate Formula and How to Calculate It (SaaS)",
    metaDescription:
      "Churn rate formula, customer churn vs revenue churn vs gross vs net, and the common indie SaaS miscalculations.",
    shortDefinition:
      "Churn rate is the percentage of customers or revenue that leaves the business in a given period, typically monthly.",
    longDefinition:
      "Churn rate measures how fast customers leave. There are four related metrics: gross customer churn (raw cancellation rate), net customer churn (cancellations minus reactivations), gross revenue churn (revenue lost from cancellations), and net revenue churn (revenue churn offset by expansions). Each tells a different story.",
    category: "retention",
    formula: {
      expression:
        "Gross customer churn = customers lost in period / customers at start of period. Net revenue churn = (gross churn revenue - expansion revenue) / starting MRR.",
      variables: [
        {
          name: "customers lost",
          meaning: "Customers whose subscription ended in the period.",
        },
        {
          name: "customers at start",
          meaning: "Active paying customers at the start of the period.",
        },
        {
          name: "expansion revenue",
          meaning:
            "Upgrades, additional seats, or plan changes that increased MRR from existing customers.",
        },
      ],
    },
    workedExample:
      "Start of month: 100 customers, $4,221 MRR. End of month: 95 customers (5 churned, 0 new), $4,400 MRR (5 customers upgraded from $29 to $99). Gross customer churn = 5 / 100 = 5%. Gross revenue churn = (5 × $29) / $4,221 = 3.4%. Net revenue churn = (3.4% revenue churn - $350 expansion) / $4,221 = negative, meaning the business grew despite churn.",
    whatItTellsYou: [
      "The retention engine's health. Low churn compounds revenue; high churn caps growth no matter how good acquisition is.",
      "Whether expansion is offsetting churn. Net revenue churn under zero means existing customers grow faster than they leave.",
      "Customer-fit signal. Sudden churn spikes often signal a wrong-cohort acquisition push or an offer-fit issue.",
    ],
    whatItDoesntTellYou: [
      "Why customers leave. Churn rate is a signal; exit surveys tell you the reason.",
      "Which cohorts are churning. Aggregate churn can mask wildly different cohort-level rates.",
      "When churn will stabilize. Early-stage SaaS often shows declining churn rate as the product matures.",
    ],
    commonMiscalculations: [
      "Using churn rate from one month as if it were stable. Single-month rates are noisy; use 3-6 month averages.",
      "Confusing gross and net churn. Net churn can be negative (a good thing) while gross churn is high.",
      "Counting downgrades as 'half a churn'. Downgrades belong in revenue churn, not customer churn.",
    ],
    relatedBenchmarkSlug: "saas-churn-rate",
    faqs: [
      {
        q: "What is a 'good' indie SaaS churn rate?",
        a: "See the matching benchmark page for directional ranges. Generally: under 5% monthly is healthy at $20-$50/mo price points; under 2% is healthy at $100+/mo; over 10% is a fit problem, not a tactics problem.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "arpu",
    metricName: "Average Revenue Per User",
    abbreviation: "ARPU",
    displayName: "ARPU (Average Revenue Per User)",
    metaTitle: "ARPU Formula and How to Calculate It (SaaS)",
    metaDescription:
      "ARPU formula, when to use ARPU vs ARPA vs median revenue, and the common indie SaaS miscalculations.",
    shortDefinition:
      "ARPU is the average monthly revenue from a single user, calculated as MRR divided by paying customer count.",
    longDefinition:
      "Average Revenue Per User (ARPU) measures the typical monthly revenue from each paying customer. For B2B SaaS with multi-seat accounts, ARPA (Average Revenue Per Account) is the more common variant. Both are sensitive to outliers — median revenue is often the more honest indicator at small scale.",
    category: "revenue",
    formula: {
      expression: "ARPU = MRR / paying customer count",
      variables: [
        {
          name: "MRR",
          meaning: "Monthly Recurring Revenue.",
        },
        {
          name: "paying customer count",
          meaning: "Number of unique paying customers at the time of measurement.",
        },
      ],
    },
    workedExample:
      "MRR is $4,221, customer count is 100. ARPU = $4,221 / 100 = $42.21. If one of those customers is a $999/month enterprise account, the median is closer to $30, so the average is inflated by the outlier.",
    whatItTellsYou: [
      "The typical economic value of one customer.",
      "Whether the customer mix is moving up-market or down-market over time.",
      "Together with churn, the basis for LTV.",
    ],
    whatItDoesntTellYou: [
      "Distribution of revenue. ARPU averages over outliers; one whale customer can inflate it.",
      "Quality of revenue. Two customers at $50 ARPU each have the same ARPU as one at $100 but very different concentration risk.",
      "Customer-acquisition-channel-mix effect on ARPU.",
    ],
    commonMiscalculations: [
      "Reporting ARPU on small samples (under 20 customers). Median is more honest at small scale.",
      "Mixing one-time customers with subscription customers. ARPU is a recurring metric.",
      "Reporting ARPU without distribution context (median, percentiles). Average alone hides the shape.",
    ],
    faqs: [
      {
        q: "Should I report ARPU or median revenue?",
        a: "Both. Average for external benchmarking; median for understanding the typical customer's economic value, especially when whales distort the mean.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "payback-period",
    metricName: "CAC Payback Period",
    abbreviation: "Payback",
    displayName: "CAC payback period",
    metaTitle: "CAC Payback Period Formula and Targets (SaaS)",
    metaDescription:
      "CAC payback period formula, why it matters separately from LTV:CAC, and how to interpret 6-month vs 18-month vs 36-month payback.",
    shortDefinition:
      "CAC payback period is the number of months it takes for a customer's gross profit to repay their acquisition cost.",
    longDefinition:
      "CAC Payback Period measures how long the business waits to recoup the cost of acquiring a customer. Even with healthy LTV:CAC, a long payback period is a working-capital constraint — the business is financing the gap. Indie SaaS targets typically 6-18 months; over 36 months requires patient capital.",
    category: "unit-economics",
    formula: {
      expression: "Payback (months) = CAC / (ARPU × gross margin %)",
      variables: [
        {
          name: "CAC",
          meaning: "Customer acquisition cost.",
        },
        {
          name: "ARPU",
          meaning: "Average monthly revenue per user.",
        },
        {
          name: "gross margin %",
          meaning: "(Revenue - cost of goods sold) / revenue.",
        },
      ],
    },
    workedExample:
      "CAC is $84. ARPU is $42.21. Gross margin is 85%. Payback = $84 / ($42.21 × 0.85) = $84 / $35.88 = 2.34 months. That is excellent for indie SaaS.",
    whatItTellsYou: [
      "How fast the acquisition engine self-funds. Short payback means you can reinvest acquisition spend quickly.",
      "The working-capital implication of growth. Long payback means growth requires patient cash.",
      "A complement to LTV:CAC — a 5:1 LTV:CAC with 36-month payback is harder to operate than 3:1 with 6-month payback.",
    ],
    whatItDoesntTellYou: [
      "Total customer value. Payback ends at break-even; LTV continues beyond.",
      "Quality of the post-payback customers.",
      "Whether the payback period is stable. Channel mix changes the rate.",
    ],
    commonMiscalculations: [
      "Using revenue instead of gross profit. Payback is paid back from profit, not revenue.",
      "Ignoring the time-value of money. For very long payback (over 24 months), discounting starts to matter.",
      "Reporting payback as a single number when channel mix varies. Per-channel payback is more useful for budget decisions.",
    ],
    faqs: [
      {
        q: "What is a 'good' CAC payback period for indie SaaS?",
        a: "Under 12 months is healthy; under 6 months is excellent. Over 24 months requires founder funding or external capital to sustain growth.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "burn-multiple",
    metricName: "Burn Multiple",
    abbreviation: "Burn Multiple",
    displayName: "Burn Multiple (capital efficiency)",
    metaTitle: "Burn Multiple Formula and Targets (SaaS)",
    metaDescription:
      "Burn multiple formula, why it matters more than burn rate alone, and what 1x, 2x, and 5x burn multiples actually mean for indie SaaS.",
    shortDefinition:
      "Burn multiple is the ratio of net cash burn to net new ARR — how much capital you spent to add one dollar of recurring revenue.",
    longDefinition:
      "Burn Multiple measures capital efficiency by dividing how much cash a business burned in a period by how much new ARR it produced. Coined by David Sacks (Craft Ventures), it has become the standard SaaS-investor capital-efficiency metric. Indie SaaS founders should know it; below 1x is exceptional, 1-2x is healthy, above 5x is concerning.",
    category: "operational",
    formula: {
      expression: "Burn Multiple = net cash burn in period / net new ARR in period",
      variables: [
        {
          name: "net cash burn",
          meaning:
            "Cash spent minus cash received in the period (negative = cash positive).",
        },
        {
          name: "net new ARR",
          meaning:
            "New ARR added in the period (new customers + expansion - churn).",
        },
      ],
    },
    workedExample:
      "In Q3, burned $30,000 cash and added $20,000 in net new ARR. Burn multiple = $30,000 / $20,000 = 1.5x. That is healthy for venture-backed; 'amazing' for indie SaaS would be under 1x (more ARR than burn).",
    whatItTellsYou: [
      "How much capital each dollar of ARR is costing.",
      "Whether the growth-rate is sustainable on current burn.",
      "An investor-grade comparison metric across SaaS.",
    ],
    whatItDoesntTellYou: [
      "Quality of the ARR added. Cheap-but-churny ARR has a misleading burn multiple.",
      "Whether the burn is investment (going up) or maintenance (staying flat).",
      "Profitability path. Burn multiple is a capital-efficiency metric, not a profitability one.",
    ],
    commonMiscalculations: [
      "Confusing burn multiple with burn rate. Burn rate is dollars per month; burn multiple is dollars-per-dollar-of-new-ARR.",
      "Using gross new ARR (new sales only) instead of net new ARR. Net is the right denominator.",
      "Calculating in a period with very low net new ARR. Burn multiple is unstable when ARR change is small or negative.",
    ],
    faqs: [
      {
        q: "Is burn multiple relevant for indie SaaS?",
        a: "Yes, especially as the business grows. Even self-funded indie SaaS has a 'burn' (founder time + tooling cost); thinking about that as a multiple of new ARR is a useful discipline.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "net-revenue-retention",
    metricName: "Net Revenue Retention",
    abbreviation: "NRR",
    displayName: "NRR (Net Revenue Retention)",
    metaTitle: "NRR Formula and How to Calculate It (SaaS)",
    metaDescription:
      "Net Revenue Retention formula, what 100%, 110%, and 130% NRR actually mean, and why NRR is often the most important SaaS metric.",
    shortDefinition:
      "Net Revenue Retention (NRR) measures how much revenue a cohort of customers generates over time, accounting for expansion, downgrades, and churn.",
    longDefinition:
      "NRR tracks one cohort's revenue change over a defined period (typically 12 months). NRR above 100% means existing customers grow revenue faster than they leave. World-class SaaS hits 130%+ NRR; healthy SaaS is 100%+; below 100% means the business is losing more from existing customers than it gains.",
    category: "retention",
    formula: {
      expression:
        "NRR = (starting MRR of cohort + expansion - downgrades - churn) / starting MRR of cohort",
      variables: [
        {
          name: "starting MRR of cohort",
          meaning: "Total MRR from a defined customer cohort at start of period.",
        },
        {
          name: "expansion",
          meaning: "MRR added from upgrades, seat additions, or plan moves within the cohort.",
        },
        {
          name: "downgrades",
          meaning: "MRR lost from plan downgrades within the cohort.",
        },
        {
          name: "churn",
          meaning: "MRR lost from cancellations within the cohort.",
        },
      ],
    },
    workedExample:
      "A cohort of 100 customers started Q1 at $4,221 MRR. By Q4 they have: $4,000 from remaining customers (5 churned, $221 lost) + $500 in expansion from upgrades. NRR = ($4,221 - $221 + $500) / $4,221 = $4,500 / $4,221 = 107%. That is healthy.",
    whatItTellsYou: [
      "Whether the customer base is growing or shrinking even without new acquisition.",
      "The single highest-signal SaaS investor metric. Many investors weight NRR above ARR growth.",
      "Quality of the customer relationship. High NRR means customers want more, not less.",
    ],
    whatItDoesntTellYou: [
      "New customer acquisition rate. NRR only measures the existing base.",
      "Why customers expanded or churned. Direction without reason limits the fix.",
      "Whether expansion is sustainable. Often expansion is a one-time event (seat addition); recurring expansion is rarer.",
    ],
    commonMiscalculations: [
      "Mixing new customer revenue into NRR. NRR is cohort-locked; only count revenue from customers who were in the cohort at the start.",
      "Calculating over too short a period. Quarterly NRR is noisy; 12-month NRR is the standard.",
      "Using net dollar retention (NDR) and NRR interchangeably. They are the same metric; consistency in naming matters when comparing across reports.",
    ],
    faqs: [
      {
        q: "What is 'world-class' NRR?",
        a: "130%+ is the world-class threshold cited in SaaS investing circles. For indie SaaS at $30-$100/month price points, 105-115% is realistic and healthy; 130%+ usually requires a multi-tier or usage-based pricing model.",
      },
    ],
    lastVerified: "2026-05-19",
  },
];

export const SAAS_METRIC_SLUGS: ReadonlyArray<string> = SAAS_METRIC_ENTRIES.map(
  (e) => e.slug,
);

export function getSaasMetricBySlug(
  slug: string,
): SaasMetricEntry | undefined {
  return SAAS_METRIC_ENTRIES.find((e) => e.slug === slug);
}

export const METRIC_CATEGORIES = [
  "revenue",
  "growth",
  "acquisition",
  "retention",
  "unit-economics",
  "operational",
] as const;

export const METRIC_CATEGORY_LABELS: Record<MetricCategory, string> = {
  revenue: "Revenue",
  growth: "Growth",
  acquisition: "Acquisition",
  retention: "Retention",
  "unit-economics": "Unit economics",
  operational: "Operational",
};

// Build-time guard: every relatedBenchmarkSlug must resolve.
{
  const known = new Set<string>(BENCHMARK_SLUGS);
  for (const entry of SAAS_METRIC_ENTRIES) {
    if (entry.relatedBenchmarkSlug && !known.has(entry.relatedBenchmarkSlug)) {
      throw new Error(
        `saas-metrics.ts: entry "${entry.slug}" references unknown benchmark slug "${entry.relatedBenchmarkSlug}".`,
      );
    }
  }
}
