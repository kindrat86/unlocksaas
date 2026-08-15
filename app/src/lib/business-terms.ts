/**
 * /business-term/[slug] pSEO catalog — non-Brunson SaaS terminology.
 *
 * Each entry covers ONE SaaS business term (PMF, ICP, GTM, MoR, NPS,
 * TAM/SAM/SOM, etc.) with the canonical definition, the common
 * misuse, and what good operationalization looks like.
 *
 * Distinct from:
 *   - /glossary (Brunson method terms: Hook, Story, Offer, Big Domino)
 *   - /saas-metric (numerical metrics with formulas: MRR, CAC, LTV)
 *
 * /business-term is the "non-Brunson, non-formula SaaS vocabulary"
 * surface. Pure definitional intent, citation-ready for AI Overviews.
 *
 * Schema: DefinedTerm + Article + FAQPage + BreadcrumbList. Hub
 * carries DefinedTermSet for retriever self-discovery.
 *
 * Brunson Hard-Rule:
 *   - Canonical definitions, not clever reinterpretations.
 *   - "Common misuse" reflects real-world misuse, not strawmen.
 *   - Cross-links to /saas-metric and /glossary resolve at build time.
 */

import { SAAS_METRIC_SLUGS } from "./saas-metrics";
import { GLOSSARY_SLUGS } from "./glossary";

export type BusinessTermCategory =
  | "go-to-market"
  | "product"
  | "operations"
  | "market-sizing"
  | "customer-success"
  | "legal-financial";

export interface BusinessTermFaq {
  q: string;
  a: string;
}

export interface BusinessTermEntry {
  slug: string;
  /** Full term name. */
  termName: string;
  /** Common abbreviation. */
  abbreviation?: string;
  /** Full display name. */
  displayName: string;
  metaTitle: string;
  metaDescription: string;
  category: BusinessTermCategory;
  /** Short citation-ready definition (1-2 sentences). */
  shortDefinition: string;
  /** Longer definition with context (2-4 sentences). */
  longDefinition: string;
  /** What founders should DO with this concept. */
  howToOperationalize: string;
  /** Common misuse of the term. */
  commonMisuse: string;
  /** What good looks like for indie SaaS specifically. */
  whatGoodLooksLikeForIndieSaas: string;
  /** Related saas-metric slug if applicable. */
  relatedMetricSlug?: string;
  /** Related Brunson glossary slug if applicable. */
  relatedGlossarySlug?: string;
  faqs: ReadonlyArray<BusinessTermFaq>;
  lastVerified: string;
}

export const BUSINESS_TERM_ENTRIES: ReadonlyArray<BusinessTermEntry> = [
  {
    slug: "product-market-fit",
    termName: "Product-Market Fit",
    abbreviation: "PMF",
    displayName: "Product-Market Fit (PMF)",
    metaTitle: "Product-Market Fit (PMF) for Indie SaaS",
    metaDescription:
      "What product-market fit means, how to recognize it honestly, how indie SaaS founders most often misuse the term, and what good PMF looks like at sub-$10k MRR.",
    category: "go-to-market",
    shortDefinition:
      "Product-market fit is the state where a product satisfies a specific market well enough that demand exceeds the team's ability to deliver — measured by retention, organic growth, and customer behavior.",
    longDefinition:
      "Product-market fit (PMF) was coined by Marc Andreessen to describe the moment a product 'gets pulled' by its market — customers do not have to be sold; they sell themselves and pull peers in. PMF is not binary; products have degrees of fit. For indie SaaS, working PMF usually shows up as: organic referrals from customers, low churn (below 5% monthly), and a customer profile the founder can name with confidence.",
    howToOperationalize:
      "Track three signals over 90 days: (1) % of new customers from referral, (2) monthly churn rate, (3) the founder's ability to predict which prospects will convert. Above 30% referral, below 5% churn, and 60%+ predictive accuracy is the indie PMF zone. Below those, you do not have PMF yet — you have early traction.",
    commonMisuse:
      "Founders declare PMF after the first 5 paying customers. Five customers is enthusiasm, not fit. PMF requires sustained pattern across a real cohort and across a 60-90 day window. Premature PMF claims usually result in wrong direction on next-stage decisions (hiring, ad spend, expansion).",
    whatGoodLooksLikeForIndieSaas:
      "100+ paying customers; 30%+ from referrals; under 5% monthly churn; founder can name the ICP cleanly and predicts conversion outcomes 60%+ of the time. Below this, treat the business as pre-PMF and make decisions accordingly (smaller team, smaller marketing budget, more customer development).",
    relatedGlossarySlug: "value-ladder",
    faqs: [
      {
        q: "What is the difference between PMF and traction?",
        a: "Traction = customers buying. PMF = customers buying AND pulling other customers in via referrals AND staying. Traction without PMF is a treadmill; you can scale acquisition spend but cannot scale word-of-mouth.",
      },
      {
        q: "Can a small niche SaaS reach PMF?",
        a: "Yes. PMF is relative to the addressable market, not absolute. A $30k MRR niche SaaS with 95% retention and strong referrals has stronger PMF than a $300k MRR product losing 20% of customers annually.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "ideal-customer-profile",
    termName: "Ideal Customer Profile",
    abbreviation: "ICP",
    displayName: "Ideal Customer Profile (ICP)",
    metaTitle: "Ideal Customer Profile (ICP) for Indie SaaS",
    metaDescription:
      "What an ICP is, how indie SaaS founders should define theirs, the most common ICP mistakes, and what good ICP-fit looks like in practice.",
    category: "go-to-market",
    shortDefinition:
      "An Ideal Customer Profile (ICP) is a specific named description of the customer your product is best for — who they are, what they do, what they pay, and why they stay.",
    longDefinition:
      "The ICP is the 'one specific person' version of your target audience. For B2B it includes industry, company size, role, decision authority, and triggers; for B2C it includes demographics, behavior, and life situation. The ICP is the customer your product serves better than any competitor and the customer who pulls peers like them in via referral.",
    howToOperationalize:
      "Write the ICP down as one paragraph naming a real person you have actually served well. Include their role, their situation, their goals, their objections, and what they say after they buy. Update quarterly based on customer-development conversations.",
    commonMisuse:
      "Defining the ICP by demographics alone ('B2B SaaS founders'). The ICP must capture situation, trigger, and willingness-to-pay — not just job title. Demographic-only ICPs produce vague marketing that does not convert.",
    whatGoodLooksLikeForIndieSaas:
      "ICP written as a one-paragraph named-person description, kept current, used to filter every marketing and product decision. When the team disagrees, the ICP doc decides — 'is this for our ICP or someone else?'",
    relatedGlossarySlug: "wrong-person",
    faqs: [
      {
        q: "Should I have multiple ICPs?",
        a: "Pre-revenue, no. Single-ICP focus produces stronger positioning. Post-PMF, secondary ICPs sometimes emerge from organic adjacent demand; treat them as side-cohorts, not co-primary.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "go-to-market",
    termName: "Go-to-Market",
    abbreviation: "GTM",
    displayName: "Go-to-Market (GTM)",
    metaTitle: "Go-to-Market (GTM) Strategy for Indie SaaS",
    metaDescription:
      "What go-to-market means, the indie SaaS variant, the common GTM mistakes, and how to actually build a GTM motion at pre-revenue scale.",
    category: "go-to-market",
    shortDefinition:
      "Go-to-market (GTM) is the structured plan for how a product reaches its target customer — combining product, marketing, sales, and customer success into one coherent motion.",
    longDefinition:
      "GTM strategy answers: who do we sell to, how do they find us, what do they buy, at what price, through what channels, and how do we keep them? For enterprise SaaS, GTM is a multi-team operation. For indie SaaS, GTM is one person making the same set of decisions on a smaller scale — which makes the discipline more important, not less.",
    howToOperationalize:
      "Write a one-page GTM doc: ICP, primary acquisition channel, pricing model, offer, success metric. Revisit quarterly. The doc forces clarity that ad-hoc execution masks.",
    commonMisuse:
      "Treating GTM as a corporate buzzword that indie SaaS does not need. Indie SaaS that fails most often fails at GTM coherence — different channels, different pricing, different messaging not tied together. The founder who treats GTM as a discipline outperforms the founder who treats it as language.",
    whatGoodLooksLikeForIndieSaas:
      "One channel doing 70%+ of acquisition. One ICP. One pricing model. One success metric tracked weekly. Quarterly GTM review that adjusts based on data, not opinion.",
    faqs: [
      {
        q: "Does indie SaaS need a GTM strategy?",
        a: "Yes. The label is fancy; the underlying discipline (who, where, what, why) is necessary. Without it, indie SaaS founders default to scattered channel experiments and never compound any of them.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "merchant-of-record",
    termName: "Merchant of Record",
    abbreviation: "MoR",
    displayName: "Merchant of Record (MoR)",
    metaTitle: "Merchant of Record (MoR) Explained for SaaS",
    metaDescription:
      "What Merchant of Record means, when it makes sense for indie SaaS, the trade-offs versus direct Stripe, and the common misunderstandings.",
    category: "legal-financial",
    shortDefinition:
      "A Merchant of Record (MoR) is the legal entity that processes the customer's payment and is responsible for sales tax, VAT, refunds, and chargebacks on the merchant's behalf.",
    longDefinition:
      "When a Merchant of Record (Paddle, Lemon Squeezy, FastSpring) processes the sale, they become the legal seller. They handle global sales tax registration, VAT reporting, currency conversion, fraud, and refunds. The product founder receives a payout net of fees. The trade-off: the MoR takes a higher cut than Stripe direct (typically 5-7% vs Stripe's 2.9% + 30¢), but the founder offloads a meaningful operational burden.",
    howToOperationalize:
      "Decide MoR vs direct based on three questions: (1) Do you sell internationally with VAT obligations? (2) Do you want to be in the sales-tax compliance business? (3) Is your average transaction size large enough that the MoR fee delta hurts? MoR wins on (1) and (2); direct wins on (3) above ~$200/month average.",
    commonMisuse:
      "Founders treat 'MoR vs not' as a payment-processor decision. It is a legal-entity decision. Switching from Stripe direct to a MoR (or back) is a real operational migration, not a flag flip.",
    whatGoodLooksLikeForIndieSaas:
      "Sub-$200/month average revenue per customer + significant international traffic → MoR makes sense. Above $200/month with US-primary customers → Stripe direct usually wins on economics. Either choice is defensible; the wrong choice is making it casually.",
    faqs: [
      {
        q: "Can I switch from Stripe to a MoR later?",
        a: "Yes, but it requires migrating customers from your Stripe account to the MoR-managed Stripe relationship. Usually involves customer notification and re-authorization. Plan for 2-4 weeks of operational lift.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "net-promoter-score",
    termName: "Net Promoter Score",
    abbreviation: "NPS",
    displayName: "Net Promoter Score (NPS)",
    metaTitle: "Net Promoter Score (NPS) Explained for SaaS",
    metaDescription:
      "What NPS is, how to calculate it, why most indie SaaS NPS is misleading, and what good NPS looks like at small scale.",
    category: "customer-success",
    shortDefinition:
      "Net Promoter Score (NPS) is a customer-loyalty metric calculated as the percentage of promoters (scored 9-10) minus the percentage of detractors (scored 0-6) on a 0-10 'would you recommend' question.",
    longDefinition:
      "NPS asks customers one question: 'How likely are you to recommend [product] to a friend or colleague?' Customers scoring 9-10 are promoters; 7-8 are passives; 0-6 are detractors. The score is calculated as % promoters - % detractors, ranging from -100 to +100. Industry NPS averages vary by category; consumer software typically sees 30-50, enterprise SaaS 30-70.",
    howToOperationalize:
      "Send the NPS question at 30 days post-signup AND at any milestone moment (after the first 'aha'). Aggregate monthly. Track the trend, not the absolute number. Read every detractor comment within 48 hours of receiving it — the comments are more valuable than the score.",
    commonMisuse:
      "Reporting NPS on tiny samples. NPS calculated on 10 responses has a confidence interval of ±30; the score is noise. The minimum useful sample is around 50-100 responses; below that, qualitative comments are more reliable than the score.",
    whatGoodLooksLikeForIndieSaas:
      "Indie SaaS NPS at 40+ is healthy; 60+ is excellent. Detractor count more important than the score; even with high NPS, every detractor comment is a churn-risk signal.",
    relatedMetricSlug: "churn-rate",
    faqs: [
      {
        q: "Should indie SaaS run NPS?",
        a: "After 100+ paying customers, yes. Below that, qualitative customer-development conversations produce better signal than NPS. NPS is a measurement-at-scale tool; small-scale insights live elsewhere.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "tam-sam-som",
    termName: "TAM / SAM / SOM",
    abbreviation: "TAM/SAM/SOM",
    displayName: "TAM / SAM / SOM (market sizing)",
    metaTitle: "TAM, SAM, SOM Explained for Indie SaaS",
    metaDescription:
      "What total addressable market, serviceable addressable market, and serviceable obtainable market mean — and why indie SaaS founders usually skip them.",
    category: "market-sizing",
    shortDefinition:
      "TAM (Total Addressable Market) is the total revenue if every potential customer bought; SAM (Serviceable Addressable Market) is what you could realistically serve; SOM (Serviceable Obtainable Market) is what you could realistically win.",
    longDefinition:
      "The TAM/SAM/SOM hierarchy is the canonical market-sizing tool in startup fundraising. TAM is the size of the entire need; SAM is the segment you target; SOM is the slice you can credibly capture in your time horizon. The exercise produces a number range — useful for investors, less useful for indie SaaS operators.",
    howToOperationalize:
      "Compute SOM honestly: count namable potential customers in your ICP × average expected ARPU × realistic penetration rate (5-15% for new entrants in 3 years). The SOM number is the cap on your near-term ambition. TAM and SAM are abstractions; SOM is operational.",
    commonMisuse:
      "Inflating TAM to make the opportunity sound venture-grade. Indie SaaS does not need a $10B TAM; it needs a SOM of 1,000+ reachable customers paying $50/month. Inflated TAM numbers lose credibility instantly with anyone who has done the math themselves.",
    whatGoodLooksLikeForIndieSaas:
      "SOM of 1,000-10,000 namable potential customers in the ICP, with average ARPU of $50-$500/month and realistic 5-15% penetration in 3 years. This produces a $30k-$1M MRR ceiling — perfectly healthy indie scale.",
    faqs: [
      {
        q: "Do I need to do TAM/SAM/SOM analysis for indie SaaS?",
        a: "Not formally. The questions matter — how big is the addressable market, who is reachable, what penetration is realistic — but you do not need the slide. A one-paragraph back-of-envelope SOM is enough.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "annual-contract-value",
    termName: "Annual Contract Value",
    abbreviation: "ACV",
    displayName: "Annual Contract Value (ACV)",
    metaTitle: "Annual Contract Value (ACV) Explained for SaaS",
    metaDescription:
      "What ACV means, how it relates to ARR, why ACV matters more for B2B SaaS than B2C, and the common misuse.",
    category: "operations",
    shortDefinition:
      "Annual Contract Value (ACV) is the average annualized revenue per customer contract, normalized across all contract lengths.",
    longDefinition:
      "ACV is the per-customer slice of ARR. For a SaaS with $1M ARR and 100 customers, ACV is $10,000. For B2B SaaS with multi-year contracts, ACV is calculated by normalizing contract total value to a per-year figure. ACV is the unit-economics granularity ARR misses.",
    howToOperationalize:
      "Track ACV by cohort (acquisition month) and by ICP segment. Rising ACV over time means you're moving up-market or expanding within accounts; falling ACV means you're either discounting or attracting smaller customers.",
    commonMisuse:
      "Reporting ACV without specifying customer cohort. Aggregated ACV across all customers can mask important segment trends — large customers' ACV staying flat while small customers' ACV drops.",
    whatGoodLooksLikeForIndieSaas:
      "Indie SaaS at $50-$500/month ARPU produces $600-$6,000 ACV. ACV growth quarter-over-quarter (even modest 5-10%) is a strong unit-economics health signal.",
    relatedMetricSlug: "arpu",
    faqs: [
      {
        q: "What is the difference between ACV and ARR?",
        a: "ACV is per-customer; ARR is total. ARR = ACV × customer count, roughly. ACV tells you about individual customer value; ARR tells you about company scale.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "minimum-viable-product",
    termName: "Minimum Viable Product",
    abbreviation: "MVP",
    displayName: "Minimum Viable Product (MVP)",
    metaTitle: "Minimum Viable Product (MVP) Explained for SaaS",
    metaDescription:
      "What MVP actually means (versus what founders think it means), how to scope an MVP honestly, and the common indie SaaS misuses.",
    category: "product",
    shortDefinition:
      "A Minimum Viable Product (MVP) is the smallest product that delivers a complete user value loop — not a half-built product with missing features.",
    longDefinition:
      "Coined by Eric Ries, MVP is the smallest version of the product that lets a customer complete a meaningful job and produces validated learning about whether they would do it again. The 'viable' in MVP is doing work — the product must be viable, not just minimum. Many indie SaaS launches confuse minimum with broken; the discipline is to ship the smallest complete loop, not the largest incomplete one.",
    howToOperationalize:
      "Define the smallest user-job your product enables, end-to-end. Ship that. Add features only when the job-as-shipped reveals what is missing — not before. Pre-launch feature creep is the MVP's failure mode; shipping the half-complete version is the other failure mode.",
    commonMisuse:
      "Shipping a half-product with broken signup, missing payment, or one feature that does not work end-to-end. That is not an MVP; that is a beta. MVP requires a complete loop, even if narrow.",
    whatGoodLooksLikeForIndieSaas:
      "MVP that does ONE thing end-to-end, has working signup + payment + delivery + access, and lets a real customer complete the value loop without founder intervention. Anything less is pre-MVP and customer-development territory.",
    faqs: [
      {
        q: "Should the MVP have a free tier?",
        a: "Usually no. Free-tier complexity slows MVP shipping and produces non-customer feedback. Free-tier decisions are a Year-2 question, not an MVP question.",
      },
    ],
    lastVerified: "2026-05-19",
  },
];

export const BUSINESS_TERM_SLUGS: ReadonlyArray<string> =
  BUSINESS_TERM_ENTRIES.map((e) => e.slug);

export function getBusinessTermBySlug(
  slug: string,
): BusinessTermEntry | undefined {
  return BUSINESS_TERM_ENTRIES.find((e) => e.slug === slug);
}

export const BUSINESS_TERM_CATEGORIES = [
  "go-to-market",
  "product",
  "operations",
  "market-sizing",
  "customer-success",
  "legal-financial",
] as const;

export const BUSINESS_TERM_CATEGORY_LABELS: Record<
  BusinessTermCategory,
  string
> = {
  "go-to-market": "Go-to-market",
  product: "Product",
  operations: "Operations",
  "market-sizing": "Market sizing",
  "customer-success": "Customer success",
  "legal-financial": "Legal & financial",
};

// Build-time guard: every relatedMetricSlug and relatedGlossarySlug must resolve.
{
  const knownMetrics = new Set<string>(SAAS_METRIC_SLUGS);
  const knownGlossary = new Set<string>(GLOSSARY_SLUGS);
  for (const entry of BUSINESS_TERM_ENTRIES) {
    if (entry.relatedMetricSlug && !knownMetrics.has(entry.relatedMetricSlug)) {
      throw new Error(
        `business-terms.ts: entry "${entry.slug}" references unknown saas-metric slug "${entry.relatedMetricSlug}".`,
      );
    }
    if (
      entry.relatedGlossarySlug &&
      !knownGlossary.has(entry.relatedGlossarySlug)
    ) {
      throw new Error(
        `business-terms.ts: entry "${entry.slug}" references unknown glossary slug "${entry.relatedGlossarySlug}".`,
      );
    }
  }
}
