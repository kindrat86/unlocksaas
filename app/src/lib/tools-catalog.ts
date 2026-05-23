/**
 * /tools – free SaaS calculator hub.
 *
 * Why this module exists
 * ----------------------
 * Editorial-backlink play layered on top of the locked Brunson +
 * Isenberg strategy. Static pSEO pages earn citations; free interactive
 * tools earn *editorial backlinks* (the cite-able kind: "use this LTV
 * calculator to see how churn destroys SaaS unit economics"). The five
 * calculators below were chosen to match the canonical UnlockSaaS
 * avatar's actual workbook moments – every formula here also appears
 * in the playbook the buyer is paying $49/mo to receive.
 *
 * Single source of truth
 * ----------------------
 * One entry per calculator. The hub page renders the catalogue as a
 * grid; each calculator page reads its own entry by slug for metadata,
 * breadcrumbs, OG card captions, JSON-LD, and the in-body "what this
 * calculator does" preamble. No drift possible between the hub card
 * and the destination page.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - Every formula here is verbatim canonical SaaS-finance math
 *     (David Skok, Bessemer, Tomasz Tunguz). No invented mechanics,
 *     no proprietary "secret formula".
 *   - The calculators are pure – no email gate, no signup wall, no
 *     "enter your email to see results". Editorial backlinks come
 *     from genuine utility, not from gating the answer.
 *   - Defaults are honest indie-SaaS ranges, sourced from the
 *     UnlockSaaS dataset (CC-BY-4.0 teardowns). No aspirational
 *     numbers that would mislead a pre-revenue founder running the
 *     calc for the first time.
 *
 * Performance
 * -----------
 * All five calculators are pure client-side computation – no API
 * calls, no remote fetches, no analytics on input (only on first
 * mount per session). Pages are static + a `'use client'` island
 * for the interactive widget. LCP is the prose; the calculator
 * hydrates after.
 */

import { BASE_URL } from "@/lib/seo/entity";

/** Canonical site-relative path of the tools hub. */
export const TOOLS_HUB_PATH = "/tools";

/** Absolute canonical URL of the tools hub. */
export const TOOLS_HUB_URL = `${BASE_URL}${TOOLS_HUB_PATH}`;

/** Hub editorial. */
export const TOOLS_HUB_EYEBROW = "Free tools";
export const TOOLS_HUB_TITLE =
  "Free SaaS calculators for post-launch pre-revenue founders";
export const TOOLS_HUB_SUBHEAD =
  "Five honest unit-economics calculators. No email gate. The same math the $49 Playbook walks you through, available to anyone who can type.";
export const TOOLS_HUB_DESCRIPTION =
  "Free SaaS calculators: LTV, churn cost, post-launch revenue projection, CAC payback, and pricing power. Pure browser math, no signup, no email gate. Built for indie SaaS founders running their first unit-economics check.";
export const TOOLS_HUB_PUBLISHED_AT = "2026-05-22";
export const TOOLS_HUB_LAST_REVIEWED_AT = "2026-05-22";

/**
 * Shape of one calculator manifest entry. Every field is consumed by
 * the hub page, the per-tool page.tsx, the per-tool opengraph-image,
 * and the sitemap registration block – so this typedef is the contract
 * between data and surface.
 */
export interface ToolEntry {
  /** Slug used in the URL: /tools/<slug>. Matches the directory name. */
  slug: string;
  /** Canonical site-relative path, e.g. "/tools/ltv-calculator". */
  path: string;
  /** Absolute canonical URL, e.g. "https://unlocksaas.com/tools/...". */
  url: string;
  /** Eyebrow chip ("LTV", "Churn", etc.) shown on hub card + OG card. */
  eyebrow: string;
  /** H1 / OG headline. Title-case, < 64 chars. */
  title: string;
  /**
   * Browser-tab title. Same shape as the rest of the marketing fleet:
   * the root layout title template wraps it as `<title> – Unlock SaaS`.
   */
  metaTitle: string;
  /**
   * SEO meta description. 140–160 chars. Direct-answer pattern: the
   * first sentence IS the answer. Featured-snippet eligible.
   */
  description: string;
  /** Hub-card lede. One-line problem framing, < 120 chars. */
  hubLede: string;
  /** OG card subhead. < 140 chars to render at 32px without clipping. */
  ogSubhead: string;
  /**
   * Canonical formula expressed in plain text. The page renders this
   * verbatim under a "Formula" subhead so the calculator is also a
   * teaching artifact, not just a black-box widget.
   */
  formula: string;
  /**
   * 80–120 word in-body explanation. Speakable. Voice engines (Alexa,
   * Siri, Google Assistant, AI Overviews TTS) lift this paragraph
   * verbatim, so it MUST be a self-contained answer to "what does this
   * calculator compute, and why does it matter".
   */
  lede: string;
  /**
   * Three FAQ pairs surfaced under FAQPage JSON-LD. Direct-answer
   * pattern; each `a` is featured-snippet eligible on its own.
   */
  faq: ReadonlyArray<{ q: string; a: string }>;
  /**
   * Schema.org keywords. Five to ten terms; AI retrievers cluster
   * articles by these. Distinct from page-meta keywords (which Google
   * has ignored since 2009).
   */
  keywords: ReadonlyArray<string>;
  /**
   * Related glossary slugs for the in-body "Related" rail. Each slug
   * MUST exist in src/lib/glossary.ts – the typecheck enforces this
   * via the glossary-link helper in the page render.
   */
  relatedGlossary: ReadonlyArray<string>;
}

/** The five calculator manifests. Ordered by hub-page render order. */
export const TOOLS: ReadonlyArray<ToolEntry> = [
  {
    slug: "ltv-calculator",
    path: "/tools/ltv-calculator",
    url: `${BASE_URL}/tools/ltv-calculator`,
    eyebrow: "LTV",
    title: "SaaS LTV Calculator",
    metaTitle: "SaaS LTV Calculator – free, no signup",
    description:
      "Compute customer lifetime value from ARPU, gross margin, and monthly churn. Pure browser math, no email gate. The canonical David Skok formula every SaaS investor uses.",
    hubLede:
      "How much gross profit does each customer produce before they churn? One formula. Three inputs.",
    ogSubhead:
      "ARPU times gross margin, divided by monthly churn. The honest unit-economics number every SaaS investor opens with.",
    formula: "LTV = (ARPU × Gross Margin %) / Monthly Churn %",
    lede:
      "Lifetime Value is the gross profit one customer generates between signup and churn. The canonical formula divides monthly ARPU by your monthly churn rate (to get the expected lifetime in months), then multiplies by gross margin (to strip out the cost of serving them). For an indie SaaS at $49 a month with 90 percent gross margin and 5 percent monthly churn, that lands at $882 of lifetime gross profit per customer. If that number is smaller than what you spend acquiring a customer, you do not have a business yet – you have a charity for paid ads.",
    faq: [
      {
        q: "What is a healthy LTV for an indie SaaS?",
        a: "There is no universal floor. The useful test is the LTV-to-CAC ratio: if LTV divided by customer acquisition cost is at least 3 to 1, the unit economics work. Below that, every paid customer drains the business.",
      },
      {
        q: "Should I use monthly or annual churn?",
        a: "Monthly churn for this formula. If you only know annual churn, divide it by 12 as a first-pass approximation. The result will be slightly conservative, which is the right direction for a pre-revenue projection.",
      },
      {
        q: "What gross margin should an indie SaaS use?",
        a: "Most pure-software indie SaaS land between 80 and 90 percent. If you resell infrastructure (hosting, AI inference, SMS) you may be lower. Use your actual cost of goods sold divided by revenue – not the industry average.",
      },
    ],
    keywords: [
      "SaaS LTV calculator",
      "customer lifetime value",
      "ARPU",
      "gross margin",
      "monthly churn",
      "LTV to CAC",
      "SaaS unit economics",
      "indie SaaS",
    ],
    relatedGlossary: [],
  },
  {
    slug: "churn-cost-calculator",
    path: "/tools/churn-cost-calculator",
    url: `${BASE_URL}/tools/churn-cost-calculator`,
    eyebrow: "Churn",
    title: "Monthly Churn Cost Calculator",
    metaTitle: "Monthly Churn Cost Calculator – free, no signup",
    description:
      "See how much revenue churn destroys every month at your current customer count and ARPU. Pure browser math. The number that makes founders fix their onboarding.",
    hubLede:
      "How much revenue evaporates every month while you focus on acquisition? The number that gets retention on the roadmap.",
    ogSubhead:
      "Customers times churn times ARPU. The leak rate every founder underestimates until they see the annual figure.",
    formula:
      "Monthly $ lost = Customers × Monthly Churn % × ARPU",
    lede:
      "Churn cost is the dollar value of the customers you lost this month. Multiply your current customer count by your monthly churn rate to get customers lost, then multiply by ARPU to get the dollar leak. A 100-customer SaaS at $49 a month with 5 percent monthly churn loses $245 every month – $2,940 a year – before adding a single new customer. That is the floor your acquisition has to clear just to stay flat. Founders who run this calc once usually start their next sprint on retention, not ads.",
    faq: [
      {
        q: "Why does monthly churn matter so much?",
        a: "Because it compounds. At 5 percent monthly churn, you lose roughly 46 percent of your customer base every year. The first cohort you acquire is more than half gone twelve months later.",
      },
      {
        q: "Is gross or net churn the right number to use here?",
        a: "Gross churn (customers who fully cancel) for this calculator. Net revenue churn adds back expansion revenue from upgrades, which masks the retention problem. If you want to see the leak, use the gross number.",
      },
      {
        q: "What counts as a low monthly churn rate for indie SaaS?",
        a: "Anything under 3 percent monthly is healthy for SMB-tier SaaS. 5 to 7 percent is normal for a young product. Above 10 percent is a leaking bucket – fix retention before scaling acquisition.",
      },
    ],
    keywords: [
      "SaaS churn calculator",
      "monthly churn cost",
      "revenue churn",
      "ARPU",
      "SaaS retention",
      "indie SaaS",
      "MRR churn",
    ],
    relatedGlossary: [],
  },
  {
    slug: "revenue-projector",
    path: "/tools/revenue-projector",
    url: `${BASE_URL}/tools/revenue-projector`,
    eyebrow: "Projection",
    title: "Post-Launch Revenue Projector",
    metaTitle: "Post-Launch SaaS Revenue Projector – free, no signup",
    description:
      "Project MRR over twelve months from your starting customers, new-customer add rate, monthly churn, and ARPU. The honest version of the spreadsheet investors ask for.",
    hubLede:
      "Where does your MRR actually land in twelve months given your real churn and acquisition rate? See the curve.",
    ogSubhead:
      "Twelve-month MRR curve from your real numbers. Compounding churn versus compounding acquisition.",
    formula:
      "Customers[n+1] = Customers[n] × (1 – Churn %) + New customers added/mo",
    lede:
      "A revenue projector applies your monthly churn and your monthly new-customer rate, one month at a time, to your starting customer base. The compounding is what makes the curve interesting. Linear acquisition (say, 10 new customers a month) plus exponential churn (5 percent of an ever-growing base) produces an asymptote – your MRR plateaus at the point where customers acquired equals customers lost. The math is unforgiving: at 5 percent churn, 10 customers a month, and $49 ARPU, you cap at 200 customers and $9,800 of MRR no matter how long you run. To break through, fix churn or grow acquisition.",
    faq: [
      {
        q: "Why does my projection plateau instead of growing forever?",
        a: "Because churn compounds. Every month you lose a percentage of your current base. As the base grows, the absolute number of customers lost grows too. At some point new acquisitions equal losses and you cap at the steady state of (new customers per month) divided by (churn rate).",
      },
      {
        q: "What is a realistic monthly new-customer rate for indie SaaS?",
        a: "Pre-revenue, anything is possible. Post-launch, most indie SaaS in the UnlockSaaS dataset are adding 3 to 30 customers a month for the first year. Above that you either have product-market fit or a paid-ads engine running.",
      },
      {
        q: "Should expansion revenue go into this projection?",
        a: "Not in this calculator. We hold ARPU constant to show the raw acquisition and retention math. Expansion is a real lever (price increases, plan upgrades, seat expansion) but it deserves its own model – it masks unit economics if blended in here.",
      },
    ],
    keywords: [
      "SaaS revenue projection",
      "MRR projection",
      "SaaS forecast",
      "post-launch SaaS",
      "indie SaaS",
      "monthly churn",
      "ARPU",
      "customer acquisition",
    ],
    relatedGlossary: [],
  },
  {
    slug: "cac-payback-calculator",
    path: "/tools/cac-payback-calculator",
    url: `${BASE_URL}/tools/cac-payback-calculator`,
    eyebrow: "CAC payback",
    title: "CAC Payback Period Calculator",
    metaTitle: "CAC Payback Period Calculator – free, no signup",
    description:
      "How many months until a paid customer recovers their acquisition cost? The number that decides whether your channel scales or bleeds.",
    hubLede:
      "How many months of gross profit does it take a paid customer to pay back their acquisition cost? Below twelve, you can scale.",
    ogSubhead:
      "Acquisition cost divided by monthly gross profit. The number that decides whether your channel scales or bleeds.",
    formula:
      "Payback (months) = CAC / (ARPU × Gross Margin %)",
    lede:
      "CAC payback period is the number of months a customer has to stick around to pay back what you spent acquiring them. The formula divides your customer acquisition cost by the monthly gross profit each customer produces. For an indie SaaS at $49 ARPU, 90 percent gross margin, and a $100 CAC, payback lands at 2.3 months – well inside the healthy zone. The standard rule of thumb is: under 12 months is healthy, 12 to 18 months is yellow, above 18 months is a channel that bleeds cash and cannot scale. If your payback is longer than your average customer lifetime, the channel is unprofitable at any volume.",
    faq: [
      {
        q: "What is a healthy CAC payback period for indie SaaS?",
        a: "Under 12 months is the standard threshold for sustainable growth. 12 to 18 is workable but constrains how fast you can scale paid channels. Above 18 months and the channel is likely unprofitable.",
      },
      {
        q: "Should I include sales-team salaries in CAC?",
        a: "Yes, for the honest version. CAC is the fully-loaded cost of acquiring one customer: ad spend, sales-rep compensation, marketing-team salaries, free-trial infrastructure, divided by customers acquired in the same window.",
      },
      {
        q: "How is CAC payback different from LTV-to-CAC?",
        a: "Payback measures time-to-recover; LTV-to-CAC measures total profit over lifetime. Payback tells you if a channel scales without running out of cash; LTV-to-CAC tells you if the channel is profitable at all. Healthy SaaS clear both bars.",
      },
    ],
    keywords: [
      "CAC payback period",
      "customer acquisition cost",
      "SaaS unit economics",
      "ARPU",
      "gross margin",
      "paid acquisition",
      "indie SaaS",
    ],
    relatedGlossary: [],
  },
  {
    slug: "pricing-power-calculator",
    path: "/tools/pricing-power-calculator",
    url: `${BASE_URL}/tools/pricing-power-calculator`,
    eyebrow: "Pricing",
    title: "Pricing Power Calculator",
    metaTitle: "SaaS Pricing Power Calculator – free, no signup",
    description:
      "Compare two prices side by side on LTV, LTV-to-CAC ratio, and CAC payback months. See what raising price actually does to your unit economics.",
    hubLede:
      "What happens to LTV, payback, and LTV-to-CAC if you raise your price 50 percent? Side-by-side answer.",
    ogSubhead:
      "Two prices, three unit-economics outputs, one side-by-side answer. The fastest argument for raising your price.",
    formula:
      "For each price: LTV = (Price × Margin) / Churn; Payback = CAC / (Price × Margin); LTV:CAC = LTV / CAC",
    lede:
      "Pricing power is the most underused lever in indie SaaS. Most founders price defensively (\"$19 a month feels safe\") and never re-run the math at $49 or $99. This calculator takes two prices and runs the same unit-economics formulas on each, side by side, so you can see what doubling your price actually does to LTV, to LTV-to-CAC ratio, and to payback period. Raising your price does not just multiply revenue – it shrinks your payback window, compounds your LTV, and widens the gap between what a customer is worth and what you spent acquiring them. The honest version of the spreadsheet you should run before your next launch.",
    faq: [
      {
        q: "Will raising my price hurt conversion?",
        a: "Probably less than you think. Most indie SaaS see conversion drop 10 to 20 percent on a 50 percent price increase, which still nets out to higher MRR and dramatically better unit economics. The calculator shows you the unit-economics side of that trade.",
      },
      {
        q: "Should the two prices have the same churn rate?",
        a: "Often yes, but not always. Higher-priced plans sometimes have lower churn (more committed buyers) or higher churn (more scrutinized spend). Run the calculator with both options to see which assumption matters more for your model.",
      },
      {
        q: "What is a healthy LTV-to-CAC ratio?",
        a: "3-to-1 is the canonical threshold. Above that, you have a business that scales profitably. Below that, every paid customer drains the business and you are subsidizing growth with capital.",
      },
    ],
    keywords: [
      "SaaS pricing calculator",
      "price comparison",
      "LTV to CAC",
      "CAC payback",
      "SaaS pricing strategy",
      "price increase",
      "indie SaaS",
    ],
    relatedGlossary: [],
  },
] as const;

/** Slug lookup table – O(1) page-level dispatch by slug. */
export const TOOL_BY_SLUG: ReadonlyMap<string, ToolEntry> = new Map(
  TOOLS.map((t) => [t.slug, t]),
);

/** All tool slugs – sitemap consumer. */
export const TOOL_SLUGS: ReadonlyArray<string> = TOOLS.map((t) => t.slug);
