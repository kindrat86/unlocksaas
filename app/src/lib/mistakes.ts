/**
 * /mistakes/[slug] pSEO catalog – "Mistakes to avoid" cluster.
 *
 * Each entry is a single indie SaaS mistake that founders search for
 * ("why my SaaS has no customers", "SaaS pricing mistakes to avoid",
 * "biggest mistake when launching a SaaS").
 *
 * Intent class: founders who have shipped but stalled search for the
 * reason why. These pages answer the "what went wrong" question before
 * the reader is ready to buy a fix. They build belief that Unlock SaaS
 * understands the problem intimately.
 *
 * Brunson Hard-Rule reconciliation:
 *   - Every mistake must be real and verifiable from public threads.
 *   - No fabricated failure stories. Claims like "9 out of 10 founders
 *     make this mistake" must be sourced or removed.
 *   - The fix must name a specific action, not a generic platitude.
 */

export interface MistakeQa {
  q: string;
  a: string;
}

export interface MistakeEntry {
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
  /** 2–3 sentence lead paragraph. */
  lead: string;
  /** Why this mistake happens – 2–4 bullet points. */
  whyItHappens: ReadonlyArray<string>;
  /** The fix – 3–5 actionable steps. */
  theFix: ReadonlyArray<string>;
  /** Related glossary slugs to link. */
  relatedGlossary: ReadonlyArray<string>;
  /** 2–4 additional FAQs for FAQPage schema. */
  faqs: ReadonlyArray<MistakeQa>;
  /** Category for hub grouping. */
  category:
    | "pricing"
    | "offer"
    | "outreach"
    | "positioning"
    | "product"
    | "launch";
  /** ISO date last verified. */
  lastVerified: string;
}

export const MISTAKES: ReadonlyArray<MistakeEntry> = [
  // -------------------------------------------------------------------
  // Offer mistakes
  // -------------------------------------------------------------------
  {
    slug: "no-specific-offer",
    title: "Shipped a product without a specific offer",
    metaTitle:
      "Shipped Without a Specific Offer? (Mistake #1 for Indie SaaS)",
    metaDescription:
      "Building a great product without a specific offer is the single biggest reason pre-revenue founders stay at zero. The fix is a named promise to a named person.",
    oneLine:
      "You shipped. No one bought. The problem is not the code — it is the absence of a named promise to a named person.",
    lead: "You wrote the code. You launched on Product Hunt. You deployed the landing page. Then nothing happened. The instinct is to blame the product — add a feature, redesign the UI, try a different framework. But the loop you are stuck in has nothing to do with the code. You shipped a product without a specific offer. An offer is not 'SaaS for teams that need better X.' An offer is 'I will take founder Y from Z to W in 30 days, or I will refund your money.' If you cannot finish that sentence, the line in Stripe will stay flat regardless of how many features you ship.",
    whyItHappens: [
      "Most AI-assisted founders learn to build before they learn to sell. The tooling (Cursor, Lovable, Bolt.new) makes shipping cheap — so cheap that the offer-writing step feels like optional homework.",
      'Founders confuse a landing page with an offer. A landing page describes features. An offer names a specific transformation for a specific person. One converts; the other is a brochure.',
      'The fear of commitment — "what if I promise X and cannot deliver?" — keeps offers vague. Vague promises feel safe and convert no one.',
    ],
    theFix: [
      "Write exactly one sentence: 'I help [specific person] achieve [specific outcome] in [specific timeframe] or they get their money back.' If any bracket is empty, stop building and fill it.",
      "Find 5 people who match the 'specific person' description. Ask them one question: 'What is the one thing you have tried to solve for months?' If their answer matches your outcome, you have a real offer. If not, change the person or change the outcome.",
      'Remove every generic value prop from your homepage. Replace "AI-powered SaaS for teams" with the one sentence from step 1. Test it on 10 strangers. If they cannot repeat the offer back in their own words, rewrite it.',
    ],
    relatedGlossary: ["weak-offer", "offer", "hook-story-offer"],
    faqs: [
      {
        q: "Is a tagline the same as an offer?",
        a: "No. A tagline describes what the product does. An offer names a specific transformation for a specific person. 'Slack: Where work happens' is a tagline. 'I will set up your team's communication workflow in 2 weeks or you pay nothing' is an offer. The first is memorable; the second converts.",
      },
      {
        q: "What if my product serves multiple customer types?",
        a: "Pick one and write the offer for them first. A specific offer for one persona converts better than a vague offer for everyone. Once that channel works, you can expand. Most founders try to serve everyone at once and end up serving no one.",
      },
    ],
    category: "offer",
    lastVerified: "2026-07-06",
  },
  // -------------------------------------------------------------------
  // Outreach mistakes
  // -------------------------------------------------------------------
  {
    slug: "not-talking-to-customers",
    title: "Building in isolation without talking to anyone",
    metaTitle:
      "Building Without Talking to Customers? (Indie SaaS Mistake)",
    metaDescription:
      "The most common mistake pre-revenue founders make: treating customer conversations as optional. The fix is 5 conversations before you write another line of code.",
    oneLine:
      "You keep building and no one is buying because you never talked to the person who would pay. Customer conversations are not optional — they are the only thing that converts zero into one.",
    lead: "The hardest part of going from zero to one customer is not the code. It is the conversation you keep postponing. Every pre-revenue founder I have talked to (including myself, three products deep) has the same story: 'I knew I should talk to potential customers, but I kept finding reasons to build instead.' The reasons sound rational — 'I need a better demo,' 'Let me add one more feature,' 'I will finish the landing page first.' They are all avoidance. The product cannot sell itself until a single human being has heard the offer from your mouth and said yes. The alternative — shipping, then buying ads, then hiring a consultant — is expensive and it is the path every flat-line founder has already walked.",
    whyItHappens: [
      "Building is comfortable. You control the output, there is no rejection, and every commit feels like progress. Conversations are uncomfortable because the answer might be 'I would not pay for that.'",
      'Founders mistake market research (reading Reddit threads) for customer conversations. Reading is not talking. A thread upvote is not a credit card charge.',
      'The bootstrap instinct — "I should have something to show first" — delays the conversation until after the product is built, which is exactly when the feedback is most expensive to act on.',
    ],
    theFix: [
      "Stop building for 48 hours. Find 5 people who match your dream customer profile on LinkedIn, Indie Hackers, or Twitter. Send each a personal message: 'I am working on [X] and I think you might have the exact problem I am trying to solve. Could I ask you 3 questions? 10 minutes.'",
      "Do not pitch during these conversations. Ask: 'What have you tried to solve this? What almost worked? What made you stop?' Listen for the language they use — those exact words go into your offer.",
      "After 5 conversations, write down the one thing you heard from at least 3 of them. That is your starting point. If 0 of 5 described your problem, you are building for the wrong person.",
    ],
    relatedGlossary: ["wrong-person", "dream-100", "outreach"],
    faqs: [
      {
        q: "What if no one responds to my messages?",
        a: "You are targeting the wrong channel or asking the wrong question. Try a different platform (Indie Hackers instead of LinkedIn) or change the ask. 'I will pay you $20 for 10 minutes of your time' has an absurdly high response rate because it signals that you value their time.",
      },
      {
        q: "How many conversations do I need before I can build?",
        a: "Five. If three of five confirm the problem and express frustration that existing solutions do not solve it, you have enough conviction to write your offer. More conversations refine the offer; fewer than five and you are guessing.",
      },
    ],
    category: "outreach",
    lastVerified: "2026-07-06",
  },
  // -------------------------------------------------------------------
  // Pricing mistakes
  // -------------------------------------------------------------------
  {
    slug: "pricing-too-low",
    title: "Pricing your SaaS too low to escape zero",
    metaTitle:
      "Pricing Too Low? Why Indie SaaS Founders Leave Money on the Table",
    metaDescription:
      "Charging $9/mo because you lack confidence is the second-biggest reason pre-revenue founders stay stuck. The fix: triple your price and watch who objects.",
    oneLine:
      "You are charging $9/mo because you are scared, not because the market demands it. Low prices attract tire-kickers and signal low value.",
    lead: 'The most common pricing advice for first-time founders is a well-intentioned lie: "Start low, get traction, raise later." In practice, starting at $9/mo attracts the worst possible early customers — people who will churn at $10/mo, demand support for $9/mo, and leave a review that says "good for the price" (the kiss of death for a premium positioning). The real problem is that low pricing is a signal. When a prospect sees $9/mo, they assume the product delivers $9/mo worth of value. Tripling your price to $29/mo or $49/mo does not lose you real customers — it filters out the ones who were never going to pay enough to sustain your business.',
    whyItHappens: [
      'Imposter syndrome masquerading as "customer-friendly pricing." Founders charge less because they do not believe their product is worth more. The market reads that signal and agrees.',
      'The volume fallacy — "I only need 1,000 customers at $9/mo." Getting 1,000 customers is harder than getting 100 at $49/mo, and the support burden for 1,000 low-paying customers will burn you out before you reach profitability.',
      'Copying competitors without understanding their unit economics. A mature SaaS with $10M funding can afford a $9/mo tier as a loss leader. A pre-revenue founder cannot.',
    ],
    theFix: [
      "Pick a price that makes you uncomfortable to say out loud. If you are at $9/mo, try $29/mo or $49/mo. If you are at $49/mo, try $97/mo. The right price is the one that feels awkward — that is your impostor syndrome talking, not the market.",
      'Run the "objection test." Post your new price publicly (on your pricing page, in a tweet, in a forum). Count the objections. If people say "that is too expensive for what it does," you have an offer problem, not a price problem. If they say nothing, you may still be too low.',
      "Grandfather your existing users at the old price if you have any. New prospects never need to know the old price existed. The pricing page is a promise, not a negotiation.",
    ],
    relatedGlossary: ["pricing-page", "value-ladder", "anchor-price"],
    faqs: [
      {
        q: "Won't a higher price reduce my conversion rate?",
        a: "Yes — on tire-kickers. Real customers convert at similar or higher rates because the price signals serious value. A 10% conversion rate at $49/mo beats a 20% rate at $9/mo on revenue, and the support burden is dramatically lower.",
      },
      {
        q: "What if I have no customers yet — should I still charge more?",
        a: "Especially then. Your first customer at $49/mo validates the offer more than ten customers at $9/mo. One paying customer at a real price changes everything about how you approach the next ten.",
      },
    ],
    category: "pricing",
    lastVerified: "2026-07-06",
  },
  // -------------------------------------------------------------------
  // Positioning mistakes
  // -------------------------------------------------------------------
  {
    slug: "competing-on-features",
    title: "Competing on features instead of a specific outcome",
    metaTitle:
      "Competing on Features? Why Indie SaaS Products Stay Invisible",
    metaDescription:
      "When you compete on features, you lose to every established player. The fix: pick one specific outcome and own it so completely that feature comparisons become irrelevant.",
    oneLine:
      "Feature checklists do not win paying customers. A named outcome for a named audience does. Stop building features and start owning a result.",
    lead: "Every pre-revenue founder has done this: you look at the market leader, list their features, and build a version that does 80% of what they do for 20% of the price. Then you wonder why no one switches. The reason is that established products do not win on features either — they win on ecosystem, trust, and the fact that no one gets fired for buying Salesforce. As a pre-revenue founder, you cannot out-feature the incumbent. You cannot out-ecosystem them. You can, however, own an outcome they do not serve well. A founder who needs 'AI-powered CRM' will pick Salesforce. A founder who needs 'a weekly reminder system that takes 5 minutes to set up and guarantees I never lose a follow-up again' might pick your $19/mo tool — if that is the only thing you promise.",
    whyItHappens: [
      "Feature comparison is the easiest way to build a landing page. You scan competitors, check boxes, and the page writes itself. It also converts no one because the prospect's question is not 'does it have feature X' — it is 'will this solve my specific problem.'",
      "Founders mistake breadth for depth. Adding more features feels like progress but dilutes the core promise. A tool that does one thing perfectly is more searchable, more memorable, and easier to sell than a platform that does ten things adequately.",
      "The fear of losing a deal because of a missing feature keeps founders building breadth instead of depth. In practice, losing a deal because of a missing feature is fine — that prospect was evaluating on features and would have churned the moment a competitor added one more checkbox.",
    ],
    theFix: [
      'Identify the one outcome your product delivers that no other tool in your space explicitly promises. Write it as a complete sentence: "I help [person] achieve [outcome] in [timeframe]." Remove every feature from your landing page that does not serve that sentence.',
      "Replace your feature comparison table with a before/after transformation. Show what the customer's life looks like before your product and after. A single testimonial with a specific number beats a 10-row feature matrix.",
      'Audit your marketing copy. Every time you write "AI-powered," "enterprise-grade," or "best-in-class," replace it with a specific result. "AI-powered" becomes "writes your cold emails in 30 seconds." "Enterprise-grade" becomes "used by teams that send 10,000+ emails a month."',
    ],
    relatedGlossary: ["big-domino", "hook-story-offer", "positioning"],
    faqs: [
      {
        q: "What if a prospect asks for a feature I don't have?",
        a: "Honestly say 'we do not do that — and that is intentional. We focus on [your specific outcome]. If you need [missing feature], here is a tool that does it well.' You will lose some deals and earn more trust from the ones that stay.",
      },
      {
        q: "Can I add features later without losing focus?",
        a: "Yes, but only features that deepen your core outcome. If your promise is '30-second cold emails,' adding an A/B testing feature serves that promise. Adding a CRM integration dilutes it. Every feature must pass the test: does this make our specific outcome more achievable or not?",
      },
    ],
    category: "positioning",
    lastVerified: "2026-07-06",
  },
  // -------------------------------------------------------------------
  // Launch mistakes
  // -------------------------------------------------------------------
  {
    slug: "soft-launch-no-outreach",
    title: 'Soft-launching without a single outreach message',
    metaTitle:
      "Soft-Launching Without Outreach? How to Get Your First SaaS Customer",
    metaDescription:
      'Deploying to "see what happens" without sending a single DM or email is the fastest way to confirm a flat Stripe line. The fix: send 20 personalized messages before launch day.',
    oneLine:
      '"Launch and see what happens" is a plan that guarantees nothing happens. The fix is 20 personalized outreach messages before you hit deploy.',
    lead: 'I have done this four times. Each time, I convinced myself that building a better landing page, writing better SEO copy, or posting on Product Hunt would bring the first customer. Each time, the line stayed flat. The truth is ugly but simple: no one is waiting for your SaaS. The launch day traffic spike (if you get one) comes from people who will never pay. The first paying customer comes from a single human being who received a message from you, read it, and decided to trust you. That message has to exist before you deploy. Not after. The playbook is simple: identify 20 people who match your dream customer profile. Write each a personal message. Offer them something valuable for free in exchange for feedback. By the time you hit deploy, at least one of those 20 should be ready to buy.',
    whyItHappens: [
      'The "Field of Dreams" fallacy: "if you build it, they will come." Building is satisfying, visible, and safe. Sending outreach messages is exposed, uncomfortable, and easy to postpone. Every postponed message is a day the line stays flat.',
      'Founders overestimate the impact of launch-day distribution. Product Hunt, Hacker News, and Reddit can send thousands of visitors — most of whom will never pay. A single well-crafted DM to the right person converts at a higher rate than 10,000 random visitors.',
      "Building a waitlist feels like progress but is often avoidance in disguise. A waitlist email address costs nothing to give. A DM that says 'I built this for you, do you want to buy it?' costs real courage.",
    ],
    theFix: [
      "Seven days before your launch date, write a list of 20 people who match your dream customer. Use LinkedIn, Indie Hackers, Twitter, or industry directories. Do not pick friends or family — pick strangers who fit the profile.",
      'Write a 4-sentence template: (1) who you are, (2) what you built and why it relates to them, (3) one specific thing you want feedback on, (4) an offer to give them free access in exchange for 10 minutes. Personalize each message — mention something from their profile or recent post.',
      "Track every send and every reply. If fewer than 5 of 20 reply within 48 hours, your offer or your targeting is wrong. Fix both before you launch.",
    ],
    relatedGlossary: ["dream-100", "outreach", "cold-email"],
    faqs: [
      {
        q: "What if I have no list and no audience?",
        a: "You do not need one. Twenty personalized DMs to strangers who match your dream customer profile is worth more than a 10,000-person newsletter that never converted. The DM channel works because it is personal, direct, and impossible to ignore.",
      },
      {
        q: "Is Product Hunt worth doing before I have a customer?",
        a: "No. Product Hunt without a validated offer is expensive attention. The visitors who see your page will not convert because you have not proven the offer yet. Launch on Product Hunt after you have at least one paying customer and a testimonial that proves the promise.",
      },
    ],
    category: "launch",
    lastVerified: "2026-07-06",
  },
  // -------------------------------------------------------------------
  // Product mistakes
  // -------------------------------------------------------------------
  {
    slug: "building-too-much-before-launch",
    title: "Overbuilding before finding a single paying user",
    metaTitle:
      "Overbuilding Your SaaS? Why More Features Won't Get Your First Customer",
    metaDescription:
      "Building more features while the line stays flat is the most expensive form of avoidance. The fix: ship a minimal version to one person before you write another line of code.",
    oneLine:
      "Every feature you add while the Stripe line stays flat is a feature you built for a customer who does not exist yet. Ship to one person first.",
    lead: 'The loop is seductive: no customers → the product must not be good enough → add more features → still no customers → the product must need even more features. I spent six months in this loop across two products before I realized the features were never the problem. The problem was that I was building features for a customer I had not named. The first time I forced myself to ship a feature-complete product to a single user — one real person who had agreed to try it — everything changed. That user did not care about the features I thought mattered. They cared about the one thing the product saved them from doing manually. I would have never discovered that if I had kept building in isolation.',
    whyItHappens: [
      "Building is addictive. Each new feature gives a dopamine hit that customer conversations do not. The code compiles; the UI renders; Slack tells you the deploy succeeded. None of that correlates with a paying customer.",
      "Perfectionism disguised as quality. 'I will launch when the product is ready' is a moving target. 'Ready' means 'the first user can complete the core workflow without me holding their hand.' Anything beyond that is avoidance.",
      "Founders mistake feature requests from non-customers for product feedback. A random person on Twitter who says 'add API access' is not a paying user. Building their request is building for someone who will never buy.",
    ],
    theFix: [
      "Write down the absolute minimum workflow a single person needs to get value from your product. Ship only that. No settings page. No onboarding wizard. No team features. Just the core loop.",
      "Find one person who matches your dream customer profile and offer them the product for free in exchange for a weekly 15-minute call. Watch them use it. Do not ask what features they want — watch where they struggle.",
      "Add no new features until at least one paying customer has used the product for two weeks. Every feature request from that customer gets prioritized above everything else. Every feature request from someone who has not paid gets a 'noted' reply and a six-month lag.",
    ],
    relatedGlossary: ["mvp", "product-market-fit", "build-measure-learn"],
    faqs: [
      {
        q: "What if the first user finds bugs or missing pieces?",
        a: "Fix them immediately. That is the point. A single user's bugs are features you now know matter. A hundred potential users' feature requests are guesses. Fix the real problems first, then expand.",
      },
      {
        q: "How minimal is too minimal?",
        a: "If the user can achieve the outcome you promised with 2–3 steps, it is minimal enough. If they have to email you for help on every step, it is too minimal. The threshold: they can complete the workflow alone, even if the UI is ugly.",
      },
    ],
    category: "product",
    lastVerified: "2026-07-06",
  },
];

export const MISTAKE_SLUGS: ReadonlyArray<string> = MISTAKES.map(
  (m) => m.slug,
);

export function getMistakeBySlug(slug: string): MistakeEntry | undefined {
  return MISTAKES.find((m) => m.slug === slug);
}

export const MISTAKE_CATEGORIES = [
  "pricing",
  "offer",
  "outreach",
  "positioning",
  "product",
  "launch",
] as const;

export const MISTAKE_CATEGORY_LABELS: Record<
  (typeof MISTAKE_CATEGORIES)[number],
  string
> = {
  pricing: "Pricing mistakes",
  offer: "Offer mistakes",
  outreach: "Outreach mistakes",
  positioning: "Positioning mistakes",
  product: "Product mistakes",
  launch: "Launch mistakes",
};
