/**
 * /founder-mistake/[slug] pSEO catalog — strategic founder mistakes.
 *
 * Each entry covers one strategic-level mistake post-launch pre-revenue
 * founders make. Complement to /why-isnt-my (element-level diagnostics)
 * and /should-i-build (pre-build decisions). These are mid-build / post-
 * launch strategic mistakes — the kind that take months to surface.
 *
 * Schema: Article + FAQPage + BreadcrumbList. No HowTo because the
 * content is mistake-fix narrative, not a sequence.
 *
 * Brunson Hard-Rule:
 *   - Every mistake is one observed in the diagnostic engine output or
 *     in the published teardowns. No invented anti-patterns.
 *   - The "fix" section names specific concrete actions, not
 *     aspirational advice.
 *   - Cross-links to related surfaces resolve. Build-time guards at the
 *     bottom enforce niche and glossary slug integrity.
 */

import { NICHE_SLUGS } from "./niches";
import { GLOSSARY_SLUGS } from "./glossary";

export interface FounderMistakeFaq {
  q: string;
  a: string;
}

export interface FounderMistakeEntry {
  slug: string;
  /** The mistake as a short label. */
  mistakeName: string;
  /** Full display name. */
  displayName: string;
  metaTitle: string;
  metaDescription: string;
  /** Brunson lens — Hook (Wrong Person) / Story (Weak Belief) / Offer (Weak Offer). */
  brunsonLens: "hook" | "story" | "offer";
  /** Which diagnosis this mistake produces. */
  fixesDiagnosis: "wrong-person" | "weak-offer" | "weak-belief";
  /** 2-3 sentence intro. */
  intro: string;
  /** How the mistake usually shows up. */
  howItShowsUp: ReadonlyArray<string>;
  /** Why founders make this mistake. */
  whyItHappens: ReadonlyArray<string>;
  /** Why it is a real mistake (the actual cost). */
  realCost: string;
  /** The specific fix. */
  theFix: ReadonlyArray<string>;
  /** Common false fixes that do not actually work. */
  falseFixes: ReadonlyArray<string>;
  /** How to know the fix worked. */
  successSignal: string;
  /** Related glossary slugs. */
  relatedGlossary: ReadonlyArray<string>;
  /** Related niche slugs. */
  relatedNiches: ReadonlyArray<string>;
  faqs: ReadonlyArray<FounderMistakeFaq>;
  lastVerified: string;
}

export const FOUNDER_MISTAKE_ENTRIES: ReadonlyArray<FounderMistakeEntry> = [
  {
    slug: "built-before-sold",
    mistakeName: "Built before sold",
    displayName: "Mistake: I built before I sold",
    metaTitle: "I Built Before I Sold (Founder Mistake Fix)",
    metaDescription:
      "The most common indie SaaS mistake: build the product before validating one paid customer. The cost, the why, and the specific fix.",
    brunsonLens: "offer",
    fixesDiagnosis: "weak-offer",
    intro:
      "Building before selling is the most common — and most expensive — indie SaaS mistake. The founder spends 3-12 months on a product nobody has yet paid for, then discovers in launch month that the offer is wrong, the audience is wrong, or both. The fix is not 'build less' — it is 'sell first, build to the sale'.",
    howItShowsUp: [
      "You have a polished product with 0-2 paying customers and a flat Stripe line for 30+ days.",
      "Friends and family signed up but nobody in your actual target audience converted.",
      "You can describe the product in detail but cannot describe one specific customer.",
      "You are 'almost ready to launch' for the third month in a row.",
    ],
    whyItHappens: [
      "Building is the work the founder is comfortable with; selling is not. Comfort drives time allocation.",
      "Validation feels less real than building — there is no commit, no deploy, no green check.",
      "AI code-generation tools (Lovable, Claude, Cursor) make building feel low-cost, which makes the trade with validation look cheap. It is not — the trade is paid in months.",
    ],
    realCost:
      "3-12 months of opportunity cost. The same time spent selling-then-building produces customers; the time spent building-then-selling produces a product looking for a market. The Brunson Hard-Rule discipline calls this 'first paying customer is a positioning event, not a traffic event'.",
    theFix: [
      "Stop building. Open a Google Doc. Write the one-sentence offer for one specific named person you would be proud to sell to.",
      "Reach out to that person and 9 more like them. Ask: 'I am building X for people like you. Would you pre-pay $X for the version that exists in 30 days?'",
      "If 0 out of 10 pre-pay, the offer is wrong. Rewrite it. Try again with 10 more.",
      "If 2-5 out of 10 pre-pay, the offer is right. Build the smallest version that fulfills the pre-sale promise. Ship to those 2-5 customers in 30 days.",
      "Past 60 days post-launch with zero paying customers: this is the conversation to have with yourself, regardless of whether you think you have 'built before sold'.",
    ],
    falseFixes: [
      "Adding more features. Features do not fix a missing customer.",
      "Hiring a marketing person. The founder is the marketing person at this stage; outsourcing the validation work is outsourcing the survival work.",
      "Lowering the price. Price is rarely the problem; offer-fit is.",
      "Running more ads. Paid traffic to an unvalidated offer burns money faster.",
    ],
    successSignal:
      "Within 14 days of starting the fix: at least 2 pre-paid customers, by name, with a payment in Stripe — or a clearly written 'I was wrong about who this is for, here is the new direction' document.",
    relatedGlossary: ["offer", "weak-offer", "verified-builder"],
    relatedNiches: ["saas-founders", "indie-hackers", "no-code-builders"],
    faqs: [
      {
        q: "What if I already invested months building?",
        a: "The investment is sunk. The question is: do you spend the next month trying to sell what you have, or do you spend the next 6 months building something else? Most founders should pause building, attempt 10 pre-sales of what they built, then decide based on the result.",
      },
      {
        q: "What if I cannot get to 2 pre-sales out of 10?",
        a: "Either the offer is wrong (rewrite and try again) or the audience is wrong (different segment). Three failed cycles of 10 pre-sales each (30 named-person asks) is enough data to pivot the product, not just the marketing.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "priced-too-low",
    mistakeName: "Priced too low",
    displayName: "Mistake: I priced too low",
    metaTitle: "I Priced My SaaS Too Low (Founder Mistake Fix)",
    metaDescription:
      "Pricing below the buyer's expectation produces fewer customers, not more. Why founders do it, the real cost, and the fix.",
    brunsonLens: "offer",
    fixesDiagnosis: "weak-offer",
    intro:
      "Pricing too low is the second most common indie SaaS mistake. Counter-intuitively, lower price often produces fewer customers, not more — because below the buyer's expectation, the product reads as 'cheap' rather than 'fair'. The fix is to price at the level the offer's value math supports, not the level the founder feels comfortable charging.",
    howItShowsUp: [
      "Your conversion rate is below 1% on warm traffic that should convert at 3-8%.",
      "Customers churn within 60 days because they are not invested enough to do the work.",
      "Sales conversations end with 'this is interesting, let me think about it' rather than buy-or-decline.",
      "Your pricing page leads with 'only $X' or 'just $X' instead of stacking value.",
    ],
    whyItHappens: [
      "The founder is uncomfortable charging real money for software they built. Underconfidence on price is a founder-personal trait, not an offer-market trait.",
      "Comparison shopping against free tools makes the founder default to 'just above free'.",
      "Misunderstanding of the indie SaaS price-customer curve: at low prices, the customer pool is mostly bargain-shoppers and the unit economics are brutal.",
    ],
    realCost:
      "Two costs: smaller customer pool (the buyer cohort at $9/month is qualitatively different from $49/month) and lower customer commitment (cheap purchases churn faster). Pricing too low almost always produces less revenue, not more.",
    theFix: [
      "Read the Brunson stack-slide pattern: itemize the components, attach honest anchor prices, sum, then reveal your price. If the math feels uncomfortable, your offer is under-priced.",
      "Test the price up. Increase 30-50% for new signups; keep existing customers grandfathered. Watch the conversion rate for 30 days.",
      "If conversion rate drops less than 50%, you are net-positive on revenue at the higher price and you have a better customer cohort. Stay there.",
      "If conversion rate drops more than 50%, you have learned something about offer-fit, not pricing. Investigate the offer, not the price.",
    ],
    falseFixes: [
      "Adding more features to justify the current low price. Features rarely shift the price-acceptance curve.",
      "Discounting more aggressively. Frequent discounts train customers to wait for the next discount.",
      "Adding a free tier. Free tiers without a clear conversion path widen the pool of non-customers, not the pool of customers.",
    ],
    successSignal:
      "Within 60 days of the price increase: conversion rate stable or slightly lower; revenue per customer up; churn at 60 days lower than before.",
    relatedGlossary: ["offer", "stack-slide", "weak-offer"],
    relatedNiches: ["saas-founders", "indie-hackers", "info-product-creators"],
    faqs: [
      {
        q: "How much higher should I price?",
        a: "Start with 30-50% increase. If that does not break conversion, try another 30-50%. Most underpriced indie SaaS can absorb 2-3x current price without significant conversion drop.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "built-for-everyone",
    mistakeName: "Built for everyone",
    displayName: "Mistake: I built for everyone",
    metaTitle: "I Built My SaaS for Everyone (Founder Mistake Fix)",
    metaDescription:
      "Building for everyone produces a product nobody specifically loves. The cost, the why, and the niche-down fix.",
    brunsonLens: "hook",
    fixesDiagnosis: "wrong-person",
    intro:
      "Building for everyone is the marketer's instinct that produces the founder's worst funnel. A product positioned for 'small businesses' or 'creators' rarely converts as well as the same product positioned for one specific cohort. The fix is to pick one named cohort, position to them, and ignore everyone else.",
    howItShowsUp: [
      "Your landing page says 'for small businesses' or 'for creators' or some other category-shaped audience.",
      "You can list 8+ types of customer the product 'works for'.",
      "Your conversion rate on cold traffic is below 0.5%.",
      "Different customer segments are asking for features that contradict each other.",
    ],
    whyItHappens: [
      "Niching feels like it shrinks the market. Counter-intuitively, it grows the customer count by concentrating message-market fit.",
      "The founder does not yet have a customer profile that matches one specific cohort, so the messaging stays generic to avoid excluding anyone.",
      "Generic positioning hides the founder's discomfort with picking a specific buyer — picking feels like losing the others.",
    ],
    realCost:
      "Lower conversion rate, scattered roadmap, customer-support hell. A small cohort served exactly is more lucrative than a large category served vaguely. Brunson's Dream 100 framework exists exactly because of this trade.",
    theFix: [
      "Pick one specific named cohort. Not 'creators' — 'newsletter operators with 5,000-25,000 subscribers'. The specificity is what works.",
      "Rewrite the above-the-fold block for that cohort. The H1 should name them.",
      "Audit the existing customer list. The cohort you pick should be over-represented in your best-fit, longest-retained customers.",
      "Let customers from other cohorts find you, but do not market to them. Their support cost and churn risk are higher; serve them as side-customers, not the main cohort.",
    ],
    falseFixes: [
      "Adding 'or for [other cohort]' to the headline. Multi-audience headlines lose to single-audience headlines on cold traffic.",
      "Building cohort-specific landing pages but keeping the rest of the product generic. The hub URLs need cohort-specific messaging too.",
      "Trying to serve two cohorts equally. Pick one as primary; the other as side-traffic.",
    ],
    successSignal:
      "Within 30 days of niching: conversion rate up 1.5-3x on the new cohort's traffic; customer support volume per active customer down; the new cohort starts referring other named customers.",
    relatedGlossary: ["hook", "wrong-person", "dream-100"],
    relatedNiches: [
      "indie-hackers",
      "saas-founders",
      "newsletter-operators",
      "no-code-builders",
    ],
    faqs: [
      {
        q: "What if my product genuinely serves multiple cohorts well?",
        a: "Pick the one that converts best on cold traffic and lead with that. Other cohorts will still find you via word-of-mouth from the primary cohort. The marketing surface picks one; the product can serve many.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "feature-adder-not-customer-getter",
    mistakeName: "Feature-adder, not customer-getter",
    displayName: "Mistake: I add features instead of customers",
    metaTitle: "I Add Features Instead of Customers (Founder Mistake Fix)",
    metaDescription:
      "When acquisition stalls, founders default to building features instead of finding customers. Why, the cost, and the fix.",
    brunsonLens: "offer",
    fixesDiagnosis: "weak-offer",
    intro:
      "Building features when acquisition stalls is the founder's most psychologically satisfying mistake — it produces visible progress without requiring any of the uncomfortable customer-acquisition work. The fix is to make customer acquisition the only work that counts when the customer count is the constraint.",
    howItShowsUp: [
      "Your changelog has 30+ feature ships and your customer count has 0-2 changes in the same period.",
      "You spend 80%+ of your week on the product and under 20% on customer-acquisition work.",
      "Existing customers have asked for the features you are building; new prospects have not.",
      "You are 'almost ready to push on marketing' for the fourth month in a row.",
    ],
    whyItHappens: [
      "Features are tactile work the founder is good at. Customer acquisition is emotionally costly work most founders are not yet good at.",
      "The 'one more feature and then we ship' loop has a dopamine reward; cold outreach does not.",
      "AI code tools make features feel low-cost. They feel low-cost; they are not — the time has the same value either way.",
    ],
    realCost:
      "Months of opportunity cost where customer count flat-lines. Eventually the founder's runway forces a pivot — usually to a panicked, ineffective marketing push that does not work because the foundation was never built.",
    theFix: [
      "Set a customer-count goal and a cutoff date. Until the goal is hit, the only work that counts is work that produces customers.",
      "Allocate 4-7 hours per week to acquisition work — cold outreach, content writing, community participation, paid experiments. Treat it as non-negotiable calendar time.",
      "Stop shipping features that are not specifically requested by paying customers or named prospects. 'Nice to have' is the trap.",
      "Track customer-acquisition activity as a leading indicator. Conversations had, messages sent, demos done. These predict customer count 30-60 days out.",
    ],
    falseFixes: [
      "Hiring a marketing person while the founder still focuses on features. The founder is the marketer at this stage; delegating it is delegating the survival work.",
      "Running ads to drive traffic to an under-positioned page. The page is the problem, not the traffic.",
      "Adding the 'one more feature' that will supposedly fix conversion. Features rarely move conversion needles; positioning and offer do.",
    ],
    successSignal:
      "Within 45 days of switching focus: cold-outreach reply rate increasing, customer count moving, the founder's calendar reflects acquisition-first time allocation.",
    relatedGlossary: ["offer", "value-ladder"],
    relatedNiches: ["saas-founders", "indie-hackers", "no-code-builders"],
    faqs: [
      {
        q: "What if the product genuinely is not feature-complete?",
        a: "Pre-paying customers buy versions that are not feature-complete every day. 'Feature-complete' is rarely the constraint; founder belief in the offer is. Pre-sell with a 30-day delivery date and build to the sale, not the spec.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "skipped-the-audience-phase",
    mistakeName: "Skipped the audience phase",
    displayName: "Mistake: I skipped the audience-building phase",
    metaTitle: "I Skipped Audience-Building (Founder Mistake Fix)",
    metaDescription:
      "Building a SaaS without an audience first means launching to zero. The cost, the why, and the audience-rebuild path.",
    brunsonLens: "story",
    fixesDiagnosis: "weak-belief",
    intro:
      "Skipping the audience-building phase means launching to nobody. Many indie SaaS launches fail not because the product is bad, but because the launch lands on a list of zero. The fix is not 'build the audience after the launch' — it is 'build the audience in parallel with the build, starting today'.",
    howItShowsUp: [
      "You launched the product and nobody came. Day-1 traffic was under 50 visitors total.",
      "You have a Twitter account with under 200 followers and no other distribution channel.",
      "You do not have an email list of any size.",
      "Your launch plan is 'I will post on Twitter and hope it spreads'.",
    ],
    whyItHappens: [
      "Audience-building is a year-out investment that pays back in launches. Founders under time pressure skip it for the more immediate-feeling product work.",
      "The 'product first, audience second' instinct feels logical but reverses the order indie SaaS rewards.",
      "Audience-building requires consistent public output, which feels emotionally exposing to many founders.",
    ],
    realCost:
      "The first launch lands on zero. Even excellent products with no audience get under 500 visitors on day one, which produces under 5 paying customers — not enough to validate or fund the next iteration.",
    theFix: [
      "Pick one channel where your target audience already congregates (X, LinkedIn, a specific subreddit, a niche newsletter). Commit to consistent output there for at least 90 days.",
      "Build in public. Share your journey, your numbers, your mistakes. The journey is the audience-building asset, not the product itself.",
      "If you already launched, do not give up — start the audience-building work now in parallel with serving existing customers. Re-launches with audiences perform 5-20x better than first launches without.",
      "Build an email list from day one of audience work. Twitter / LinkedIn followers are rented; email subscribers are owned.",
    ],
    falseFixes: [
      "Buying followers or running giveaways for cheap follows. Both produce non-buyer audiences that hurt the launch.",
      "Running paid ads to drive launch-day traffic. Paid ads without organic audience produce expensive non-buyers.",
      "Trying to launch on Product Hunt or Hacker News without a pre-launch supporter list. The launch will under-perform regardless of product quality.",
    ],
    successSignal:
      "Within 90 days of starting audience work: 500-2,000 engaged followers on the chosen channel, 200-1,000 email subscribers, sustained 2-5% audience-engagement rate on posts.",
    relatedGlossary: ["story", "dream-100", "weak-belief"],
    relatedNiches: [
      "indie-hackers",
      "saas-founders",
      "newsletter-operators",
      "info-product-creators",
    ],
    faqs: [
      {
        q: "Can I run paid ads to skip the audience-building work?",
        a: "Briefly, but ad-driven launches without organic audience produce expensive customers who do not refer. Audience-building remains a non-skippable foundation for indie SaaS at the price points where ad ROAS struggles.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "treated-launch-as-finish-line",
    mistakeName: "Treated launch as finish line",
    displayName: "Mistake: I treated the launch as the finish line",
    metaTitle: "I Treated Launch as the Finish Line (Founder Mistake Fix)",
    metaDescription:
      "The launch is the start of the work, not the end. Why founders treat it as a finish line, the cost, and the post-launch re-engagement fix.",
    brunsonLens: "offer",
    fixesDiagnosis: "weak-offer",
    intro:
      "Treating the launch as a finish line is the mistake that turns successful launches into stalled products. The launch generates a list of warm leads; the work of converting those leads into paying customers happens in the 30-60 days AFTER. Most founders disengage exactly when the work begins.",
    howItShowsUp: [
      "Your launch produced 500+ email signups and you have 0-5 paying customers from them 60 days later.",
      "You posted the launch retrospective, then went back to building.",
      "You did not follow up personally with the launch-day signups.",
      "You assumed launch traffic would convert by itself.",
    ],
    whyItHappens: [
      "Launch days are emotionally peak; the day after is emotionally low. Founders take time off from the work right when momentum requires the opposite.",
      "The launch retrospective post creates a sense of completion that is not real.",
      "Follow-up with signups feels like 'salesy' work that many founders are uncomfortable with.",
    ],
    realCost:
      "60-80% of launch-day signups go cold within 14 days without follow-up. The single most-leveraged conversion work an indie SaaS founder does is the personal follow-up in the week after launch.",
    theFix: [
      "Block 3-5 hours per day for 14 days post-launch for personal follow-up. Not automation; founder-grade personal email.",
      "Email every signup within 24 hours. Real person, real signature, one question: 'What made you sign up?' The answers are the offer-feedback you need.",
      "Convert email replies to demo calls or trial activations within 72 hours of the reply landing.",
      "Treat the post-launch month as the launch's continuation, not a separate phase. The launch ends when your first 10 paying customers are in Stripe — not when the launch post is published.",
    ],
    falseFixes: [
      "Setting up an automated drip sequence and calling it follow-up. Drip sequences are the floor; personal email is the multiplier.",
      "Posting more on social media instead of converting existing signups. The active leads are more valuable than acquiring new ones at this stage.",
      "Running ads to launch-day URL after the launch ends. Re-targeting works when the original conversion machinery works; it does not fix a broken conversion.",
    ],
    successSignal:
      "Within 30 days of launch: 10-30% of email signups have had a personal exchange with the founder, 2-10% have converted to paying customers, and the founder has a documented list of objections and feedback to fold into the next iteration.",
    relatedGlossary: ["offer", "soap-opera-sequence", "verified-builder"],
    relatedNiches: ["saas-founders", "indie-hackers", "no-code-builders"],
    faqs: [
      {
        q: "Is it weird to personally email every signup?",
        a: "No — it is the highest-conversion move you have access to. Customers expect automation; getting a real human email instead is the kind of moment that converts on its own.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "built-for-myself",
    mistakeName: "Built for myself",
    displayName: "Mistake: I built it for myself",
    metaTitle: "I Built My SaaS for Myself (Founder Mistake Fix)",
    metaDescription:
      "Building for yourself produces a personal tool, not a SaaS. When the dogfood pattern works and when it traps. The fix.",
    brunsonLens: "hook",
    fixesDiagnosis: "wrong-person",
    intro:
      "Building for yourself is sometimes the right move — and sometimes the worst. When the founder IS the target customer of a large, paying cohort, dogfooding works. When the founder's needs are atypical, dogfooding produces a personal tool nobody else will pay for. The fix is to validate the cohort, not the personal use.",
    howItShowsUp: [
      "You can describe in detail how you use the product but cannot describe one specific customer's use case.",
      "Customers ask for features that surprise you because they use the product differently than you do.",
      "Your churn rate is high (10%+ monthly) because the product feels misaligned with new customer expectations.",
      "Your roadmap is driven by your own needs, not customer feedback.",
    ],
    whyItHappens: [
      "Dogfooding feels productive — you experience the product daily, fix what bothers you, ship what you want.",
      "The founder's needs are an easy customer-development substitute that does not require talking to strangers.",
      "Indie hacker culture celebrates 'build for yourself, others will follow' as the default mode.",
    ],
    realCost:
      "If the founder is genuinely in a large cohort, dogfooding works. If the founder is in a small or atypical cohort, the product is a personal tool worn as a SaaS. The cost is months of building features for a single user before realizing the user is the founder.",
    theFix: [
      "Audit the cohort: how big is the audience of people who use the product the way you do? If it is under 10,000 reachable people, the dogfood pattern is at risk.",
      "Talk to 10 paying customers about their actual use cases. If 8+ use the product the way you do, dogfooding is working. If 5- use it differently, your needs and theirs have diverged.",
      "Adjust the roadmap to weight customer-feedback features over founder-comfort features.",
      "If the cohort is small, decide deliberately: is this a $500-$2,000/month boutique SaaS for the small cohort, or does it pivot to a different audience? Both are valid, but the choice has to be conscious.",
    ],
    falseFixes: [
      "Continuing to ship features you want because 'the customers will catch up'. They will not. Customer expectations are now upstream of your own.",
      "Forcing customers to use the product your way. Documentation telling customers 'you are using it wrong' is the failure mode.",
      "Adding a 'beginner mode' on top of your power-user mode. Two modes is two products to maintain, and neither converts as well as one focused product.",
    ],
    successSignal:
      "Within 60 days of adjusting: customer feedback drives at least 60% of new feature work, churn rate drops, and the founder can describe 3+ different customer use cases distinct from their own.",
    relatedGlossary: ["hook", "wrong-person", "dream-100"],
    relatedNiches: ["indie-hackers", "saas-founders", "no-code-builders"],
    faqs: [
      {
        q: "Is dogfooding ever the right move?",
        a: "Yes — when the founder is in a large, identifiable cohort that pays for software (developers, content creators with established monetization, B2B operators in specific industries). The trap is dogfooding for an atypical-self.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "skipped-the-founder-story",
    mistakeName: "Skipped the founder story",
    displayName: "Mistake: I skipped the founder story",
    metaTitle: "I Skipped the Founder Story (Founder Mistake Fix)",
    metaDescription:
      "Hiding the founder behind a corporate brand on indie SaaS produces lower conversion than a faceless competitor. The fix.",
    brunsonLens: "story",
    fixesDiagnosis: "weak-belief",
    intro:
      "Many indie SaaS founders default to a corporate-brand front because it feels professional. For indie SaaS at $10-$500/month price points, this almost always produces lower conversion than a clearly-named founder. The fix is the Brunson Reluctant Hero positioning — name the founder, name the story, name the accountability.",
    howItShowsUp: [
      "Your About page is one paragraph about 'we believe' with no founder name.",
      "Your team page has no photos or names.",
      "Your customer support emails are signed by 'Team [BrandName]'.",
      "Cold visitors cannot tell whether you are a solo founder or a 50-person company.",
    ],
    whyItHappens: [
      "Founders feel they should 'appear bigger' to win enterprise-style trust.",
      "Personal exposure feels risky — what if the product fails publicly?",
      "Hiding the founder feels like a low-cost optimization. It is not; it costs conversion daily.",
    ],
    realCost:
      "Cold visitors at indie SaaS prices want to know who is behind the product. A named founder with a real story converts at 1.5-3x the rate of an anonymous brand at the same price point. The instinct to 'look bigger' produces the opposite outcome.",
    theFix: [
      "Add the founder's full name, photo, and one-paragraph story to the About page within 7 days.",
      "Sign every customer-facing email with the founder's name. Replace 'Team [Brand]' with first name + photo signature.",
      "Add a founder bio block above the fold on the highest-traffic page. 50-100 words is enough.",
      "Implement the Brunson Reluctant Hero positioning template (see /template/reluctant-hero-positioning-template).",
    ],
    falseFixes: [
      "Adding a generic 'founder photo' without the story. The photo alone does not unlock the trust.",
      "Hiring stock photos for the team page. Detectable; corrosive to trust.",
      "Making the about page longer without making it more personal.",
    ],
    successSignal:
      "Within 30 days of adding the founder presence: conversion rate up 20-50% on cold traffic, customer support emails open at 2x rates, founder receives more direct DMs / replies from customers and prospects.",
    relatedGlossary: ["story", "reluctant-hero", "weak-belief"],
    relatedNiches: ["indie-hackers", "saas-founders", "newsletter-operators"],
    faqs: [
      {
        q: "What if I do not want to be a public founder?",
        a: "Named-but-private is the middle path: real name + photo on About, no social presence, no podcast. Captures most of the trust lift without the personal exposure cost. See /should-i-build/should-i-build-a-faceless-saas for the full analysis.",
      },
    ],
    lastVerified: "2026-05-19",
  },
];

export const FOUNDER_MISTAKE_SLUGS: ReadonlyArray<string> =
  FOUNDER_MISTAKE_ENTRIES.map((e) => e.slug);

export function getFounderMistakeBySlug(
  slug: string,
): FounderMistakeEntry | undefined {
  return FOUNDER_MISTAKE_ENTRIES.find((e) => e.slug === slug);
}

// Build-time guards: every relatedGlossary + relatedNiches slug must resolve.
{
  const knownGlossary = new Set<string>(GLOSSARY_SLUGS);
  const knownNiches = new Set<string>(NICHE_SLUGS);
  for (const entry of FOUNDER_MISTAKE_ENTRIES) {
    for (const slug of entry.relatedGlossary) {
      if (!knownGlossary.has(slug)) {
        throw new Error(
          `founder-mistakes.ts: entry "${entry.slug}" references unknown glossary slug "${slug}".`,
        );
      }
    }
    for (const slug of entry.relatedNiches) {
      if (!knownNiches.has(slug)) {
        throw new Error(
          `founder-mistakes.ts: entry "${entry.slug}" references unknown niche slug "${slug}".`,
        );
      }
    }
  }
}
