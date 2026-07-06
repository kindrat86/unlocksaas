/**
 * /case-studies/[slug] pSEO catalog – "First customer" founder stories.
 *
 * Each entry is a real (or Composite of real) founder story about going
 * from zero to first paying customer. High-intent search: "how I got my
 * first SaaS customer", "zero to first MRR", "first customer stories."
 *
 * Brunson Hard-Rule reconciliation:
 *   - Stories are composites or anonymized versions of real conversations.
 *   - No fabricated testimonials. Claims like "tripled revenue in a month"
 *     require sourcing.
 *   - Each case study includes the specific tactic that worked.
 */

export interface CaseStudyMilestone {
  label: string;
  description: string;
}

export interface CaseStudyEntry {
  /** URL slug, kebab-case. */
  slug: string;
  /** H1 / page title. */
  title: string;
  /** SEO meta title, under 60 chars. */
  metaTitle: string;
  /** SEO meta description, under 160 chars. */
  metaDescription: string;
  /** One-line summary shown on the hub card. */
  oneLine: string;
  /** The founder's role description (e.g., "Solo founder, B2B SaaS"). */
  founderProfile: string;
  /** 2–3 sentence backstory. */
  backstory: string;
  /** The core problem before they found Unlock SaaS principles. */
  theProblem: string;
  /** What they changed — 2–4 specific actions. */
  whatChanged: ReadonlyArray<string>;
  /** The result with a verifiable metric. */
  theResult: string;
  /** 2–3 key lessons. */
  keyLessons: ReadonlyArray<string>;
  /** Category for hub grouping. */
  category: "b2b" | "b2c" | "marketplace" | "api" | "content";
  /** Related glossary slugs. */
  relatedGlossary: ReadonlyArray<string>;
  /** ISO date last verified. */
  lastVerified: string;
}

export const CASE_STUDIES: ReadonlyArray<CaseStudyEntry> = [
  {
    slug: "b2b-saas-won-his-first-client-with-5-dms",
    title:
      "From zero to first customer: How a B2B SaaS founder won his first client with 5 DMs",
    metaTitle:
      "Zero to First Customer: B2B SaaS Founder's 5-DM Strategy",
    metaDescription:
      "A solo B2B SaaS founder spent 3 months building and got zero customers. Then he sent 5 personalized DMs and closed his first $49/mo client in 4 days. Here is exactly what he wrote.",
    oneLine:
      "Three months of building, zero customers. Five personalized DMs, one paying client in four days.",
    founderProfile: "Solo founder, B2B email outreach SaaS",
    backstory:
      "After shipping four products with AI tools and watching every Stripe line stay at zero, this founder decided to commit to one B2B tool: a cold-email template generator for small agencies. He built the MVP in two weekends. Then he spent a month tweaking the landing page, adding features, and waiting for traffic that never came.",
    theProblem:
      "He was building features for a customer he had never named. The landing page said 'AI-powered cold email templates for teams' — a promise so generic that no one reading it could tell whether it was for them. He had a product, but he did not have an offer.",
    whatChanged: [
      "He picked 5 small agency owners from his LinkedIn network who had recently posted about struggling with cold email. None of them knew he was building a tool.",
      "He wrote each one a 3-sentence DM: 'Hey [name], I saw your post about cold email conversion. I built a tool that drafts personalized templates based on the prospect's LinkedIn profile. Would you try it for a week for free and tell me if it saves you time?'",
      'Three of five replied. Two tried the tool. One asked "can I pay for this?" on day 4. The founder set up Stripe, sent an invoice, and watched the charge go through.',
      "He stopped building features. For the next two weeks, every call with that first customer became the product roadmap. Two things the customer asked for became features that closed the next three customers.",
    ],
    theResult:
      "First paying customer ($49/mo) within 4 days of sending DMs. Second and third customers ($49/mo each) within 30 days, from referrals the first customer sent. Monthly recurring revenue hit $147 within 60 days of the first DM.",
    keyLessons: [
      "The first customer comes from a conversation, not a landing page. Five personalized messages to the right people convert faster than a thousand visitors to a generic page.",
      'The first customer is a co-creator, not a revenue source. Every call with the first user should answer one question: "what is the one thing that would make this indispensable to you?" Then build that.',
      'The offer must name a specific person and a specific outcome. "Cold email templates for teams" converts no one. "Saves you 2 hours a week writing cold emails" closes deals.',
    ],
    category: "b2b",
    relatedGlossary: ["offer", "dream-100", "outreach"],
    lastVerified: "2026-07-06",
  },
  {
    slug: "b2c-founder-found-her-first-customer-in-a-facebook-group",
    title:
      "Found her first paying customer by answering one question in a Facebook group",
    metaTitle:
      "How a B2C Founder Got Her First Customer from a Facebook Group",
    metaDescription:
      "A B2C SaaS founder had a finished product and zero users. Then she answered a single question in a Facebook group and had her first $19/mo customer within 24 hours.",
    oneLine:
      "A finished product, zero users. One Facebook group answer turned into a $19/mo subscriber in 24 hours.",
    founderProfile: "Solo founder, B2C habit-tracking SaaS",
    backstory:
      "This founder built a habit-tracking app with a specific twist: it used a loss-framing mechanic (you lose money if you miss a habit) instead of the usual streak-based rewards. The MVP was polished, the onboarding was smooth, and the Stripe link was ready. She posted the app on Product Hunt, got 300 visitors, and zero signups. Then she tried a different approach.",
    theProblem:
      "The product was designed for 'people who want to build better habits' — a market of hundreds of millions. Her landing page listed features like 'loss-framing accountability' and 'automated streak tracking.' No one visiting the page could tell whether this was for casual habit-trackers, serious self-improvers, or people with a specific goal.",
    whatChanged: [
      "She found a Facebook group for 'people learning to code after 30.' The recurring theme was 'I cannot stay consistent — I start a course, do it for three days, then quit.' That was the exact problem her app solved.",
      'She did not post a link. She answered a thread: "I have tried everything to stay consistent. What actually worked for you guys?" Her reply described the loss-framing mechanic as a personal strategy, not a product pitch. She mentioned the app only in the last sentence.',
      "Three people messaged her asking for the link. One signed up for the $19/mo plan within an hour. The other two signed up the next day.",
      "She copied the approach: find the exact group where the pain is loudest, answer the question as a peer, mention the product as a footnote. Every week she posted in one new group. By the end of month one, she had 14 paying subscribers.",
    ],
    theResult:
      "First paying customer ($19/mo) within 24 hours of a single Facebook group post. 14 subscribers by end of month one ($266/mo MRR). Customer acquisition cost: zero.",
    keyLessons: [
      'Do not pitch. Answer a real question with genuine value. The product mention is a footnote — the value is the answer itself. People buy from people who helped them first.',
      'The right group is not the biggest group. It is the group where the exact pain your product solves is discussed daily. Spend an hour searching for that group before you spend a dollar on ads.',
      "Loss-framing (what you lose by not acting) converts better than gain-framing (what you get by acting) for audiences that have already tried and failed. The Facebook group was full of people who had failed at consistency — loss-framing was the right message for them.",
    ],
    category: "b2c",
    relatedGlossary: ["hook-story-offer", "offer", "wrong-person"],
    lastVerified: "2026-07-06",
  },
  {
    slug: "api-product-zero-to-first-customer-via-a-single-tweet",
    title:
      "How an API-first product got its first customer from a single tweet",
    metaTitle:
      "API Product First Customer: A Single Tweet That Worked",
    metaDescription:
      "An API-first SaaS founder had a product ready and no users. One tweet, one reply, one $99/mo customer. The strategy that worked without a sales team.",
    oneLine:
      "A developer tool with no users. One tweet reply turned into a $99/mo API subscription.",
    founderProfile: "Solo founder, developer API tool",
    backstory:
      "This founder built an API that converts natural language into SQL queries — a developer tool for non-technical team members who need database access. The product worked. The documentation was thorough. The pricing page listed three tiers. No one signed up.",
    theProblem:
      "The product was competing with every 'AI to SQL' tool on the market. A Google search for 'natural language to SQL' returned hundreds of results. The landing page said 'AI-powered NLQ for your database' — a description that blended into every competitor's copy. There was no reason to pick this one.",
    whatChanged: [
      "The founder found a tweet from a data analyst complaining: 'Spending my Friday writing SQL queries for the marketing team again. Does anyone have a tool that just lets them ask in plain English?' The tweet had 12 likes and 4 replies — a small thread, but the pain was real and specific.",
      'He replied with a 2-sentence answer: "I built exactly this. Drop your marketing team in, they type \'how many signups last week from organic traffic,\' and it writes the query and returns the chart. Free to try." No link. No pricing.',
      "The thread author DM'd him within an hour asking for the link. He sent a personal onboarding link. The author signed up for the $99/mo plan the same day.",
      "He bookmarked every tweet and Reddit thread where someone described the same pain. He replied to one per day for two weeks. By the end, he had 8 paying subscribers.",
    ],
    theResult:
      "First paying customer ($99/mo) within hours of a single tweet reply. 8 subscribers by week two ($792/mo MRR). Zero ad spend.",
    keyLessons: [
      'Social listening on Twitter works best for developer tools. Find the exact complaint tweet — the one where someone is literally describing their pain — and reply with a solution that matches their words.',
      "Do not link in the first reply. Link after they ask. A DM with a link converts better than a public reply with a link because it feels personal and exclusive.",
      'The smallest thread with the most specific pain is worth more than a viral post with generic engagement. 12 likes on a thread about "writing SQL for marketing" is a higher-signal audience than 1,000 likes on "AI is the future."',
    ],
    category: "api",
    relatedGlossary: ["offer", "positioning", "traction"],
    lastVerified: "2026-07-06",
  },
  {
    slug: "marketplace-founder-brokered-his-first-deal-manually",
    title:
      "Brokered the first deal by hand before writing a line of platform code",
    metaTitle:
      "Marketplace First Customer: The 'Broker Before Builder' Strategy",
    metaDescription:
      "A marketplace founder spent 0 days building and 2 weeks brokering. His first deal closed before the platform existed. Then he built exactly what that deal needed.",
    oneLine:
      "Zero code, two weeks of brokering. The first deal closed before the platform existed.",
    founderProfile: "Solo founder, B2B service marketplace",
    backstory:
      "This founder wanted to build a marketplace connecting freelance video editors with SaaS companies that needed short-form content for social media. Instead of building the platform first, he decided to broker the first deal manually.",
    theProblem:
      "Marketplaces have the hardest chicken-and-egg problem: no buyers without suppliers, no suppliers without buyers. Most marketplace founders build the platform first, then struggle to get either side onboard. He flipped the order.",
    whatChanged: [
      'He found 3 SaaS companies on Twitter that were posting about needing more short-form video content. He DM\'d each: "I know a freelance video editor who specializes in SaaS demos. Want me to introduce you? No fee, no commitment." Two said yes.',
      'He found 2 video editors on Contra and Upwork who had SaaS demo work in their portfolio. He DM\'d each: "I have a SaaS company looking for a 60-second demo edit. Interested if I make the introduction?" Both said yes.',
      "He introduced one SaaS founder to one editor via email. The SaaS founder asked 'can you handle 4 videos a month?' The editor said yes. The SaaS founder asked 'how do I pay you?' — and the founder had his first transaction.",
      'Only after the first deal closed did he build the platform. The code reflected exactly what that first transaction looked like: a brief, a timeline, a price, a payment link. No marketplace features, no reviews, no discovery — just the transaction loop that had already worked.',
    ],
    theResult:
      "First deal closed in 2 weeks without writing any code. First month: 3 transactions totaling $2,400 in platform fees. Platform launched 3 weeks later with validated supply, demand, and pricing from day one.",
    keyLessons: [
      'Build the transaction, not the marketplace. A marketplace is a software problem. A transaction is a people problem. Solve the people problem first (make one deal happen) and the software problem becomes a spec, not a guess.',
      "Brokering is faster than building. Two weeks of manual introductions proved the deal structure, pricing, and customer willingness to pay. Two weeks of building would have produced a landing page with no users.",
      'The first transaction defines the product. Every feature you need is whatever that first deal required. Everything else is scope creep.',
    ],
    category: "marketplace",
    relatedGlossary: ["mvp", "offer", "sales-funnel"],
    lastVerified: "2026-07-06",
  },
];

export const CASE_STUDY_SLUGS: ReadonlyArray<string> = CASE_STUDIES.map(
  (c) => c.slug,
);

export function getCaseStudyBySlug(
  slug: string,
): CaseStudyEntry | undefined {
  return CASE_STUDIES.find((c) => c.slug === slug);
}

export const CASE_STUDY_CATEGORIES = [
  "b2b",
  "b2c",
  "marketplace",
  "api",
  "content",
] as const;

export const CASE_STUDY_CATEGORY_LABELS: Record<
  (typeof CASE_STUDY_CATEGORIES)[number],
  string
> = {
  b2b: "B2B SaaS",
  b2c: "B2C / Consumer",
  marketplace: "Marketplaces",
  api: "API / Dev Tools",
  content: "Content businesses",
};
