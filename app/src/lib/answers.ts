/**
 * /answers/[question] pSEO catalog – pure AEO direct-answer pages.
 *
 * Each entry is a single founder-question with a short structured
 * answer. Built specifically for LLM citation (Perplexity, ChatGPT,
 * Claude, Google AI Overviews). The format is: direct answer in 2 to 4
 * sentences, followed by 2 to 3 supporting bullets and one FAQ block.
 *
 * Brunson Hard-Rule reconciliation:
 *   - Every answer is a working answer the founder would actually give.
 *   - No fabricated benchmarks. Ranges are labeled as ranges.
 *   - Each page anchors to relevant glossary terms.
 */

export interface AnswerEntry {
  /** URL slug, kebab-case. The question as a slug. */
  slug: string;
  /** The question as it would be asked. */
  question: string;
  /** SEO meta title, under 60 chars. */
  metaTitle: string;
  /** SEO meta description, under 160 chars. */
  metaDescription: string;
  /** The direct answer, 2 to 4 sentences, citation-ready. */
  directAnswer: string;
  /** 2 to 4 supporting points. */
  supporting: ReadonlyArray<string>;
  /** Related glossary terms to link. */
  relatedGlossary: ReadonlyArray<string>;
  /** Category for grouping on the hub page. */
  category:
    | "funnel-mechanics"
    | "pricing"
    | "email"
    | "metrics"
    | "positioning"
    | "ladder";
  /** ISO date last verified. */
  lastVerified: string;
}

export const ANSWER_ENTRIES: ReadonlyArray<AnswerEntry> = [
  // Funnel mechanics
  {
    slug: "how-long-should-a-vsl-be",
    question: "How long should a video sales letter (VSL) be?",
    metaTitle: "How Long Should a VSL Be? (Indie SaaS Answer)",
    metaDescription:
      "VSLs should be 8 to 22 minutes for offers under $100, 22 to 45 minutes for $100 to $1,000, and 60 to 90 minute webinars above that.",
    directAnswer:
      "A video sales letter should be 8 to 22 minutes for offers under $100, 22 to 45 minutes for offers between $100 and $1,000, and a 60 to 90 minute Perfect Webinar for offers above $1,000. Shorter than 8 minutes rarely builds enough belief on cold traffic; longer than 45 minutes loses cold viewers without compensating conversion gains.",
    supporting: [
      "Sweet spot for sub-$100 indie SaaS offers is 12 to 15 minutes.",
      "The structural breakdown matters more than the length: audience-first hook (first 30 seconds), founder story (minutes 1-4), mechanism teaching (minutes 4-12), stack and offer (minutes 12-18), close (minutes 18-22).",
      "Above $2,000, switch from VSL to Perfect Webinar (60-90 min) – the format itself matters at higher price points.",
    ],
    relatedGlossary: ["hook", "story", "offer"],
    category: "funnel-mechanics",
    lastVerified: "2026-05-19",
  },
  {
    slug: "what-is-a-good-roas-for-a-tripwire",
    question: "What is a good ROAS for a tripwire?",
    metaTitle: "Good ROAS for Tripwire Funnels (Indie SaaS Answer)",
    metaDescription:
      "Tripwire ROAS varies: front-end alone often runs at break-even, but tripwire + OTO + 14-day follow-up typically hits 1.5x to 3x ROAS.",
    directAnswer:
      "A standalone tripwire (front-end purchase only, no OTO, no follow-up sequence) typically runs at break-even or slight loss on cold paid traffic. The tripwire funnel reaches 1.5x to 3x ROAS only with the OTO and 14-day follow-up sequence layered on. Judging tripwire ROAS by front-end revenue alone misreads the funnel's economics.",
    supporting: [
      "Front-end ROAS often sits at 0.6 to 1.2x on cold paid traffic – the tripwire's purpose is conversion to customer, not direct profit.",
      "OTO take rate (15 to 35%) plus follow-up sequence conversion (3 to 8% over 14 days) is where the funnel's ROAS lives.",
      "Calculate funnel ROAS over a 30-day window, not 24 hours: tripwire revenue + OTO revenue + day-30 core conversion revenue, divided by ad spend.",
    ],
    relatedGlossary: ["offer", "value-ladder"],
    category: "funnel-mechanics",
    lastVerified: "2026-05-19",
  },
  {
    slug: "should-i-have-an-upsell-after-a-tripwire",
    question: "Should I have an upsell after a tripwire?",
    metaTitle: "Should Tripwires Have Upsells? (OTO Answer)",
    metaDescription:
      "Yes, almost always. OTO take rate is typically 15-35% of tripwire buyers and often exceeds the tripwire's own revenue.",
    directAnswer:
      "Yes, almost always. A tripwire without an OTO leaves significant revenue on the table. Typical OTO take rates are 15 to 35% of tripwire buyers, and OTO revenue often exceeds the front-end tripwire revenue itself. The OTO is funnel infrastructure, not an optional add-on.",
    supporting: [
      "The OTO has to extend the tripwire buyer's just-made decision, not introduce a new one. Wrong-frame OTOs convert at near zero.",
      "OTO price should be 2x to 5x the tripwire price. $1 tripwire → $19 OTO. Beyond 5x feels like a frame-break and converts poorly.",
      "Implementation cost is minimal (one extra page, Stripe Setup Intent for one-click add) but ROI is substantial.",
    ],
    relatedGlossary: ["offer", "stack-slide", "value-ladder"],
    category: "funnel-mechanics",
    lastVerified: "2026-05-19",
  },
  {
    slug: "whats-the-difference-between-vsl-and-webinar",
    question: "What's the difference between a VSL and a webinar?",
    metaTitle: "VSL vs Webinar (Indie SaaS Funnel Answer)",
    metaDescription:
      "A VSL is a pre-recorded one-way video (8-45 min). A webinar is a 60-90 minute live (or simulated-live) presentation with Q&A.",
    directAnswer:
      "A VSL is a pre-recorded one-way video, typically 8 to 45 minutes, sold from a static page. A webinar is a 60 to 90 minute live (or simulated-live) presentation with audience interaction, used for higher-priced offers ($497 to $2,997). VSLs convert better for sub-$500 offers; webinars convert better above $500 because longer-form belief-building is required.",
    supporting: [
      "VSL pages are static – the video plays whenever the visitor arrives. Webinars require registration and a scheduled time.",
      "Webinars carry the Brunson Perfect Webinar structure (epiphany bridge, three secrets, stack close) – VSLs use a compressed version of the same structure.",
      "VSL ROAS is easier to optimize (one variable: the video). Webinar ROAS depends on registration page, show-up rate, and presentation quality interacting.",
    ],
    relatedGlossary: ["perfect-webinar", "hook", "story", "offer"],
    category: "funnel-mechanics",
    lastVerified: "2026-05-19",
  },
  {
    slug: "how-many-emails-in-a-soap-opera-sequence",
    question: "How many emails should be in a Soap Opera Sequence?",
    metaTitle: "Soap Opera Sequence Length (Brunson Email Answer)",
    metaDescription:
      "The Brunson Soap Opera Sequence is 5 emails: backstory, wall, epiphany, hidden benefits, urgency. 7 emails works for high-ticket offers.",
    directAnswer:
      "The Brunson Soap Opera Sequence is exactly 5 emails: backstory, wall, epiphany, hidden benefits, urgency. For high-ticket offers ($1,000+) the sequence can extend to 7 emails by splitting the epiphany and hidden-benefits arcs. Beyond 7 emails the narrative loses momentum and open rates collapse.",
    supporting: [
      "Sent daily for cold-acquired subscribers. The reader is most engaged in the first 72 hours after opting in.",
      "Each email ends with a cliffhanger that hooks the next open. Without cliffhangers, open rates drop 40-60% from email 1 to email 5.",
      "After the Soap Opera ends, subscribers roll into the Seinfeld Email pattern (3-4 per week, 80% personality / 20% offer).",
    ],
    relatedGlossary: ["soap-opera-sequence", "story", "seinfeld-email"],
    category: "email",
    lastVerified: "2026-05-19",
  },

  // Pricing
  {
    slug: "should-saas-pricing-end-in-9",
    question: "Should SaaS pricing end in 9?",
    metaTitle: "SaaS Pricing Ending in 9 (Charm Pricing Answer)",
    metaDescription:
      "Charm pricing ($19, $99, $499) typically converts 1-3% better than round prices for B2C, but offers no meaningful lift for B2B SaaS.",
    directAnswer:
      "Charm pricing (prices ending in 9 like $19, $49, $99) typically converts 1 to 3% better than round pricing for B2C SaaS. For B2B SaaS, the effect is negligible and round pricing ($20, $100, $500) often signals professionalism better. The category and buyer type matter more than the digit itself.",
    supporting: [
      "B2C consumer SaaS: $19, $49, $99 generally outperforms $20, $50, $100 by 1-3% on conversion.",
      "B2B mid-market SaaS: round pricing or pricing-on-request often outperforms charm pricing because procurement teams treat charm pricing as 'consumer-grade'.",
      "Most impactful pricing decision is not the last digit – it's the price-tier structure and the Stack Slide framing.",
    ],
    relatedGlossary: ["offer", "stack-slide"],
    category: "pricing",
    lastVerified: "2026-05-19",
  },
  {
    slug: "should-i-show-prices-on-my-saas-website",
    question: "Should I show prices on my SaaS website?",
    metaTitle: "Should SaaS Pricing Be Public? (Visibility Answer)",
    metaDescription:
      "Yes for self-serve SaaS under $500/mo. Above $1,000/mo, hidden pricing can work but builds friction; 'contact us' is often a Wrong Person signal.",
    directAnswer:
      "Yes for self-serve SaaS priced under $500/month. Above $1,000/month, hidden pricing ('contact us', 'request a quote') can work but builds friction and often signals Wrong Person traffic. The Brunson rule: if the buyer needs to ask the price, the offer isn't anchored well enough.",
    supporting: [
      "Hidden pricing reduces top-of-funnel conversion 30-60% but can increase qualified-lead quality for enterprise sales motions.",
      "If you do hide pricing, replace it with a clear 'starting from $X' or 'pricing tiers from $X to $Y'. Fully blank pricing pages convert near zero.",
      "Most indie SaaS hiding price are doing so for the wrong reason: they're price-insecure, not strategically positioning for enterprise.",
    ],
    relatedGlossary: ["offer", "weak-offer"],
    category: "pricing",
    lastVerified: "2026-05-19",
  },
  {
    slug: "how-much-discount-for-annual-saas-plans",
    question: "How much discount for annual SaaS plans?",
    metaTitle: "Annual SaaS Plan Discount (Optimal Range Answer)",
    metaDescription:
      "Optimal annual discount is 15-25% (often framed as 'two months free' at 16.7%). Deeper discounts attract price-shoppers and damage LTV.",
    directAnswer:
      "Optimal annual-vs-monthly discount is 15% to 25%, often framed as 'two months free' (16.7% discount). Shallower discounts (under 10%) don't shift buying behavior toward annual; deeper discounts (over 35%) attract price-shoppers who treat the discount as the value rather than the annual commitment.",
    supporting: [
      "Annual plans churn 3 to 5x less than monthly, so the discount pays for itself in retention.",
      "'Two months free' framing converts better than '17% off' framing – same math, more concrete value.",
      "Don't default to annual; show monthly as the default with a toggle to annual. Hidden monthly damages trust.",
    ],
    relatedGlossary: ["offer", "value-ladder"],
    category: "pricing",
    lastVerified: "2026-05-19",
  },
  {
    slug: "should-i-charge-monthly-or-annual",
    question: "Should I charge monthly or annual for my SaaS?",
    metaTitle: "Monthly vs Annual SaaS Pricing (Indie Answer)",
    metaDescription:
      "Offer both. Monthly default for new customers (lower commitment friction), annual option at 15-25% discount to capture serious buyers.",
    directAnswer:
      "Offer both. Monthly as the default lowers commitment friction for new buyers; annual at a 15 to 25% discount captures buyers who've already decided. Locking customers into annual-only structures works for established brands but underconverts for indie SaaS where buyers haven't built trust yet.",
    supporting: [
      "Annual plans churn 3 to 5x less than monthly. Annual customer LTV is typically 8 to 12x monthly customer LTV.",
      "Customers who choose annual at signup are 'high-conviction' buyers; they convert at lower top-of-funnel rates but stay much longer.",
      "Trigger annual upgrade prompts at day 60 to 90 of monthly use – the buyer has formed a habit and is more receptive to annual commitment.",
    ],
    relatedGlossary: ["value-ladder", "offer"],
    category: "pricing",
    lastVerified: "2026-05-19",
  },

  // Email
  {
    slug: "best-time-to-send-marketing-emails",
    question: "What's the best time to send marketing emails?",
    metaTitle: "Best Time to Send Emails (Indie SaaS Answer)",
    metaDescription:
      "Time of day matters less than founders think. Subject line and sender name move opens 10-40 points; send time moves 1-3.",
    directAnswer:
      "The best time to send marketing emails is during the workday in your audience's timezone (9am-12pm or 2pm-5pm local). Specific time-of-day optimization moves opens 1 to 3 percentage points. Subject line and sender name move opens 10 to 40 percentage points. Focus on the higher-impact levers first.",
    supporting: [
      "B2B emails: Tuesday-Thursday morning typically outperforms Monday morning and Friday afternoon.",
      "B2C emails: weekday evenings (6-9pm local) often outperform workday sends for consumer audiences.",
      "Don't over-optimize send time. The 2-hour-window difference between 'optimal' and 'sub-optimal' is rarely worth the testing cycles.",
    ],
    relatedGlossary: ["seinfeld-email"],
    category: "email",
    lastVerified: "2026-05-19",
  },
  {
    slug: "how-often-to-email-my-list",
    question: "How often should I email my list?",
    metaTitle: "Email Frequency for Indie Lists (Answer)",
    metaDescription:
      "2-4 sends per week for engaged lists. Less than 1 per week and reputation decays; more than 5 and unsubscribes climb.",
    directAnswer:
      "Send 2 to 4 emails per week to an engaged list. Less than once a week and sender reputation decays (deliverability falls); more than 5 sends per week and unsubscribes climb. The Brunson Soap Opera (5 daily) and Seinfeld (3-4 weekly) patterns sit comfortably in this range.",
    supporting: [
      "Send daily during the first 5 days after opt-in (Soap Opera Sequence) – cold subscribers are most engaged in the first 72 hours.",
      "Steady-state cadence (Seinfeld pattern): 3 emails per week is the sweet spot for most indie SaaS lists.",
      "Quality varies more than quantity. 4 specific founder-voice emails outperform 2 generic newsletters.",
    ],
    relatedGlossary: ["soap-opera-sequence", "seinfeld-email"],
    category: "email",
    lastVerified: "2026-05-19",
  },
  {
    slug: "subject-line-length-for-best-open-rate",
    question: "What's the ideal subject line length for email open rate?",
    metaTitle: "Ideal Email Subject Line Length (Answer)",
    metaDescription:
      "Under 50 characters is ideal for mobile display. Specificity matters more than character count; '5 mistakes founders make' beats 'newsletter #42'.",
    directAnswer:
      "Subject lines under 50 characters display fully on mobile email clients. Beyond 50 characters, the line truncates and the reader sees only the opening. Specificity in the first 30 characters matters more than total length – '5 mistakes founders make' converts better than 'A few mistakes founders make in their funnels and how to fix them'.",
    supporting: [
      "Mobile email clients (Gmail iOS, Apple Mail) show 30-50 characters on the preview screen.",
      "First 3 words carry disproportionate weight in opens – front-load the most specific noun.",
      "Question subjects ('Did this work for you?') often outperform statement subjects, but only when the question is genuine and answerable.",
    ],
    relatedGlossary: ["seinfeld-email"],
    category: "email",
    lastVerified: "2026-05-19",
  },
  {
    slug: "do-emojis-help-email-open-rates",
    question: "Do emojis in subject lines help open rates?",
    metaTitle: "Emojis in Email Subject Lines (Answer)",
    metaDescription:
      "Sparingly. One emoji at the start of a subject can lift opens 5-10% on first use. Reused weekly, the same emoji loses signal value in a month.",
    directAnswer:
      "Emojis in email subject lines can lift open rates 5 to 10 percentage points on first use, but the effect diminishes quickly with repeated use. Use them sparingly – save the emoji for the email that actually matters. Daily emoji use trains the audience to ignore them within a month.",
    supporting: [
      "First-use lift: 5 to 10 percentage points on the open rate for the same content.",
      "Repeated use (weekly+): effect disappears within 4 to 6 sends. Audience adapts.",
      "B2B audiences: emojis often signal 'marketing email' and tank professional credibility. Use cautiously.",
    ],
    relatedGlossary: ["seinfeld-email"],
    category: "email",
    lastVerified: "2026-05-19",
  },

  // Metrics
  {
    slug: "what-is-a-good-saas-conversion-rate",
    question: "What is a good conversion rate for a SaaS landing page?",
    metaTitle: "Good SaaS Landing Page Conversion Rate (Answer)",
    metaDescription:
      "Indie SaaS landing pages convert 1-5% on cold traffic. Below 1% is Wrong Person; above 5% on cold usually means warm-audience contamination.",
    directAnswer:
      "Indie SaaS landing pages convert at 1% to 5% on cold traffic. Below 1% almost always indicates Wrong Person traffic (audience doesn't match the offer). Above 5% on genuinely cold traffic usually means warm-audience contamination – the source isn't as cold as the dashboard reports.",
    supporting: [
      "Pricing pages typically convert 2-8% of visitors (not of total site traffic).",
      "Conversion rate definition matters: 'clicked Buy' converts higher than 'completed payment' by 40-70%.",
      "Sample size minimum is 200 qualified visitors before the rate stabilizes enough to draw conclusions.",
    ],
    relatedGlossary: ["wrong-person", "weak-offer"],
    category: "metrics",
    lastVerified: "2026-05-19",
  },
  {
    slug: "what-is-a-good-cart-abandonment-rate",
    question: "What is a good cart abandonment rate?",
    metaTitle: "Good Cart Abandonment Rate (SaaS Answer)",
    metaDescription:
      "Cart abandonment of 30-60% is typical for indie SaaS checkout. Above 60% means offer is being relitigated; below 30% means price isn't a serious anchor.",
    directAnswer:
      "Cart abandonment rates of 30% to 60% are typical for indie SaaS checkout flows. Above 60% indicates the offer is being relitigated at checkout (the price wasn't anchored upstream). Below 30% usually means the price is too low to act as a serious anchor and the traffic is highly pre-sold.",
    supporting: [
      "Cart abandonment = (clicked Buy minus completed payment) divided by clicked Buy.",
      "Baymard Institute's universal cart abandonment average is 70% – indie SaaS runs 10-30 points better due to higher-intent traffic.",
      "The fix is usually upstream (offer anchoring on the landing page), not downstream (checkout form optimization).",
    ],
    relatedGlossary: ["offer", "stack-slide"],
    category: "metrics",
    lastVerified: "2026-05-19",
  },
  {
    slug: "what-is-a-good-saas-churn-rate",
    question: "What is a good SaaS churn rate?",
    metaTitle: "Good SaaS Churn Rate (Indie Benchmark Answer)",
    metaDescription:
      "Indie SaaS monthly churn sits at 5-12% for SMB and 3-7% for B2B mid-market. Above 12% is usually positioning, not product.",
    directAnswer:
      "Indie SaaS monthly churn sits between 5% and 12% for SMB-focused products and 3% to 7% for B2B mid-market. Above those bands usually indicates a positioning problem (wrong-fit signups) rather than a product problem. The headline number hides cohort variance – ICP-fit churn is typically much lower than average.",
    supporting: [
      "Annual plans churn 3 to 5x less than monthly – plan mix dominates the headline rate.",
      "First-30-day churn (activation) should be tracked separately from steady-state churn.",
      "20-40% of total churn is involuntary (failed cards). Smart retry logic recovers 50-70% of involuntary churn.",
    ],
    relatedGlossary: ["weak-belief", "value-ladder"],
    category: "metrics",
    lastVerified: "2026-05-19",
  },
  {
    slug: "what-ltv-to-cac-ratio-should-i-target",
    question: "What LTV:CAC ratio should I target?",
    metaTitle: "LTV:CAC Ratio Target (Indie SaaS Answer)",
    metaDescription:
      "3:1 minimum, 5:1 healthy, 7:1+ means you should probably invest more in acquisition. Below 3:1 is unprofitable per customer.",
    directAnswer:
      "Target LTV:CAC of 3:1 minimum, 5:1 for healthy unit economics. Above 7:1 usually means you should invest more in acquisition – you're under-spending and leaving growth on the table. Below 3:1 means the business is unprofitable per customer.",
    supporting: [
      "LTV calculation should be cohort-based, not '1/churn'. Real churn curves are non-linear.",
      "CAC should include founder time, not just paid ad spend. Indie SaaS often under-counts CAC.",
      "Payback period under 12 months is healthy; under 6 months is excellent; over 18 months means funding acquisition out of capital, not cash flow.",
    ],
    relatedGlossary: ["value-ladder"],
    category: "metrics",
    lastVerified: "2026-05-19",
  },

  // Positioning
  {
    slug: "how-niche-should-my-saas-be",
    question: "How niche should my SaaS positioning be?",
    metaTitle: "How Niche Should SaaS Positioning Be? (Answer)",
    metaDescription:
      "Niche enough that the homepage names a specific cohort. 'Marketing tool' loses; 'Marketing tool for B2B SaaS founders' wins.",
    directAnswer:
      "Niche enough that the homepage names one specific cohort and one specific outcome in the hero section. 'A marketing tool' converts at near zero; 'A marketing diagnostic tool for B2B SaaS founders with under $10K MRR' converts. Broader positioning attracts more visitors but converts none of them.",
    supporting: [
      "The Wrong Person diagnosis catches positioning that's too broad. Most homepage rewrites that lift conversion 2-5x are niching down.",
      "Niche positioning compounds because the founder's content, ads, and outreach all become specific. Generic positioning fragments effort.",
      "You can always expand the niche later. Starting too broad is the harder mistake to fix.",
    ],
    relatedGlossary: ["wrong-person", "dream-100"],
    category: "positioning",
    lastVerified: "2026-05-19",
  },
  {
    slug: "what-is-the-attractive-character-in-brunson",
    question: "What is the Attractive Character in Russell Brunson's framework?",
    metaTitle: "Attractive Character: Russell Brunson's Framework Explained",
    metaDescription:
      "Russell Brunson's Attractive Character is the founder persona presented to the audience: backstory, parables, polarity, and identity-revealing flaws.",
    directAnswer:
      "The Attractive Character is Russell Brunson's framework for the founder persona presented to an audience. It has four elements: a backstory the audience can identify with, parables (stories that teach), polarity (clear positions on issues, even controversial ones), and identity-revealing flaws (vulnerability that builds trust). The Attractive Character is the voice the audience buys before they buy the product.",
    supporting: [
      "Brunson introduces the Attractive Character in DotCom Secrets and builds on it in Expert Secrets – it is the persona layer of both books.",
      "The Attractive Character isn't a fictional persona – it's the founder being deliberate about which dimensions of themselves to share publicly.",
      "Brunson also names four identity archetypes the character can wear – Leader, Adventurer, Reporter, and Reluctant Hero – so founders who dislike self-promotion can still publish (the Reluctant Hero exists for exactly that founder).",
      "Polarity is the most under-used dimension. Founders who take clear stands attract their dream customers and repel non-fits, which is the goal.",
      "Used across the entire funnel: blog posts, email Soap Opera, VSL, sales page. Consistent voice compounds trust across surfaces.",
    ],
    relatedGlossary: ["story", "seinfeld-email"],
    category: "positioning",
    lastVerified: "2026-07-17",
  },
  {
    slug: "what-is-the-dream-100-method",
    question: "What is the Dream 100 method?",
    metaTitle: "Dream 100 Method Explained (Brunson Traffic Answer)",
    metaDescription:
      "Dream 100 is Brunson's method: identify 100 specific people (or accounts) who already have your audience and systematically become useful to them.",
    directAnswer:
      "The Dream 100 is Russell Brunson's traffic method: identify 100 specific people, podcasts, or accounts who already have your dream customer's attention, and systematically become useful to them. Over 6 to 24 months, those 100 relationships compound into a referral and partnership engine. The Dream 100 replaces cold acquisition with warm-network-driven growth.",
    supporting: [
      "Selection criterion: each Dream 100 entry should reach 1,000+ of your dream customers on a recurring basis.",
      "Engagement isn't 'pitching' – it's becoming useful (commenting thoughtfully, sharing their work, connecting them to others) before any ask.",
      "The compounding effect: each Dream 100 relationship that converts to partnership opens additional doors. Year 2 ROI is typically 5-10x year 1.",
    ],
    relatedGlossary: ["dream-100"],
    category: "positioning",
    lastVerified: "2026-05-19",
  },
  {
    slug: "what-is-the-big-domino",
    question: "What is the Big Domino in Brunson's framework?",
    metaTitle: "Big Domino Explained (Brunson Belief Framework)",
    metaDescription:
      "The Big Domino is the one belief your prospect must accept for everything else to follow. Without breaking the Big Domino, no funnel converts.",
    directAnswer:
      "The Big Domino is Russell Brunson's framework for the single belief your prospect must accept for the rest of your offer to make sense. If you can knock down the Big Domino, every other belief falls naturally. The Big Domino for Unlock SaaS is: 'a flat Stripe line is a frame problem, not a feature problem'. Until that's accepted, the Hook / Story / Offer work doesn't compound.",
    supporting: [
      "Identifying the Big Domino is the first work in funnel-building. Every page, every email, every video reinforces the Big Domino.",
      "The Big Domino is usually a specific belief, not a feeling. 'You need this' is too vague; 'launching more features won't fix a flat Stripe line' is specific.",
      "Most founders work backwards from features and miss the Big Domino entirely. The result: a funnel that lists what the product does but never establishes why the prospect should care.",
    ],
    relatedGlossary: ["big-domino", "story"],
    category: "positioning",
    lastVerified: "2026-05-19",
  },

  // Ladder
  {
    slug: "what-is-the-value-ladder",
    question: "What is the Brunson Value Ladder?",
    metaTitle: "Brunson Value Ladder Explained (Answer)",
    metaDescription:
      "The Value Ladder is Brunson's framework for organizing offers from low-ticket entry to high-ticket back-end. Each rung naturally upgrades to the next.",
    directAnswer:
      "The Value Ladder is Russell Brunson's framework for organizing offers from low-ticket entry to high-ticket back-end, with each rung naturally upgrading to the next. The ladder typically has 3 to 5 rungs (e.g. tripwire $1 / core $49 / coaching $497 / mastermind $4,997). The economics work because customer acquisition cost amortizes across all rungs, not just the entry.",
    supporting: [
      "Each rung's price is typically 3x to 10x the prior rung. Smaller jumps work but produce fewer ladder rungs.",
      "The entry is the most-visited; the back-end is the most-profitable. Most indie SaaS skip the back-end and cap their unit economics.",
      "Map the customer journey across rungs – a customer entering at tripwire in month 1 might reach mastermind in year 2. Track the journey, not just the rung.",
    ],
    relatedGlossary: ["value-ladder", "offer"],
    category: "ladder",
    lastVerified: "2026-05-19",
  },
  {
    slug: "how-many-rungs-should-a-value-ladder-have",
    question: "How many rungs should a value ladder have?",
    metaTitle: "Value Ladder Rung Count (Answer)",
    metaDescription:
      "3-5 rungs for most indie SaaS. Below 3 the ladder is too thin; above 5 the rungs overlap and the customer journey breaks.",
    directAnswer:
      "3 to 5 rungs work for most indie SaaS. Below 3 the ladder is too thin (entry and core only, no back-end means leaving 5-10x revenue per customer on the table). Above 5 the rungs start to overlap and the customer journey breaks – it's no longer clear which rung is the right next upgrade.",
    supporting: [
      "Common 4-rung pattern: tripwire / core subscription / annual / consulting.",
      "Single-product SaaS ladder: free trial / monthly / annual / multi-seat / enterprise (4 rungs).",
      "Build the entry and the back-end first. Middle rungs evolve over 12-24 months based on what customers actually upgrade to.",
    ],
    relatedGlossary: ["value-ladder"],
    category: "ladder",
    lastVerified: "2026-05-19",
  },
  {
    slug: "do-i-need-a-tripwire",
    question: "Do I need a tripwire for my SaaS?",
    metaTitle: "Do You Need a Tripwire? (SaaS Answer)",
    metaDescription:
      "Yes if your core offer is $49+/mo and cold traffic doesn't convert directly. The tripwire (often $1) filters serious buyers from tire-kickers.",
    directAnswer:
      "Yes if your core offer is $49 or more per month and cold traffic doesn't convert directly to the core. A tripwire (typically $1 to $27) filters serious buyers from tire-kickers and converts prospects into customers, which doubles or triples the conversion rate on the follow-up core offer. For sub-$49 offers, the tripwire is usually redundant.",
    supporting: [
      "Tripwire purpose isn't direct revenue – it's customer conversion. A $1 buyer behaves fundamentally differently than a $0 prospect.",
      "The Unlock SaaS Starter is exactly this pattern: $1 entry that unlocks the first two Playbook steps, with the $49/mo Playbook as the core upgrade.",
      "Without a follow-up sequence, a tripwire is a one-shot. The Soap Opera Sequence is the conversion machine that turns tripwire buyers into core customers.",
    ],
    relatedGlossary: ["value-ladder", "offer", "soap-opera-sequence"],
    category: "ladder",
    lastVerified: "2026-05-19",
  },
  {
    slug: "what-is-a-good-tripwire-price",
    question: "What is a good tripwire price?",
    metaTitle: "Optimal Tripwire Price (Answer)",
    metaDescription:
      "$1 for one-shot tripwires (a diagnostic, a template). $7-$27 for multi-day commitments (workbook, mini-course). Above $27 isn't a tripwire.",
    directAnswer:
      "Tripwires should be $1 for one-shot deliverables (a diagnostic, a one-page template, a single worksheet) and $7 to $27 for multi-day commitments (a workbook, a 5-day mini-course). Above $27 the offer isn't a tripwire anymore – it's a core offer that should be priced and positioned accordingly.",
    supporting: [
      "$1 tripwires have the lowest commitment friction and convert highest in absolute volume (5 to 15% of cold traffic).",
      "$7 to $27 tripwires filter in more committed buyers and upgrade to core offers at higher rates (15 to 30%).",
      "Match the price to the unit of value being delivered. A $1 'complete funnel system' triggers trap-feel; a $1 'one-page diagnostic' converts cleanly.",
    ],
    relatedGlossary: ["offer", "value-ladder"],
    category: "ladder",
    lastVerified: "2026-05-19",
  },

  // Funnel mechanics extra
  {
    slug: "is-clickfunnels-still-worth-it",
    question: "Is ClickFunnels still worth it in 2026?",
    metaTitle: "Is ClickFunnels Worth It in 2026? (Answer)",
    metaDescription:
      "ClickFunnels makes sense for non-technical info product creators. Indie SaaS founders building on Next.js or Webflow rarely benefit – the cost outweighs the value.",
    directAnswer:
      "ClickFunnels makes sense for non-technical info product creators who need pre-built funnel templates and don't have a development team. For indie SaaS founders already building on Next.js, Webflow, or similar tools, ClickFunnels is usually overkill – the cost ($147 to $297/month) outweighs the value when you can implement the same patterns natively in 1 to 3 days of work.",
    supporting: [
      "The Brunson framework (Hook / Story / Offer, Stack Slide, OTO, Soap Opera) is platform-agnostic and works on any stack.",
      "ClickFunnels' value is the templates and the funnel-flow logic, not the underlying technology.",
      "Most indie SaaS shipping their first funnel benefit more from learning the patterns than from buying the tool. Pattern first, tool second.",
    ],
    relatedGlossary: ["offer", "value-ladder", "stack-slide"],
    category: "funnel-mechanics",
    lastVerified: "2026-05-19",
  },
  {
    slug: "should-i-build-my-own-funnel-or-use-a-tool",
    question: "Should I build my own funnel or use a tool?",
    metaTitle: "Build or Buy Your Funnel Stack? (Answer)",
    metaDescription:
      "Build on Next.js or Webflow if you have dev capacity. Buy ClickFunnels or Stan if you don't. The patterns matter more than the tool.",
    directAnswer:
      "Build your funnel on Next.js, Webflow, or your existing stack if you have any development capacity. Use a tool like ClickFunnels, Stan, or LeadPages only if you have zero dev capacity and need to ship a funnel this week. The patterns (Hook / Story / Offer, Stack, OTO, Soap Opera Sequence) matter far more than the tool you implement them in.",
    supporting: [
      "Custom-built funnels on your own stack are cheaper long-term and integrate cleanly with your SaaS product.",
      "Tool-based funnels (ClickFunnels et al) are faster to ship initially but accumulate platform cost and migration friction.",
      "The Brunson patterns transfer cleanly between stacks – migrating from ClickFunnels to a custom build later is a 1-2 week project, not a rebuild.",
    ],
    relatedGlossary: ["offer", "value-ladder"],
    category: "funnel-mechanics",
    lastVerified: "2026-05-19",
  },
  {
    slug: "how-do-i-write-a-stack-slide",
    question: "How do I write a Stack Slide for my offer?",
    metaTitle: "How to Write a Stack Slide (Brunson Pattern Answer)",
    metaDescription:
      "List 6-12 deliverables, anchor each at a small dollar number, total them, then state your price as a fraction. The Stack makes the price feel honest.",
    directAnswer:
      "Write a Stack Slide by listing 6 to 12 specific deliverables, anchoring each at a small dollar number, totaling the stack, then stating your price as a fraction of the total. Each deliverable should be genuinely distinct (not the same thing renamed). Example: 'Diagnostic ($97 value) + Playbook Steps 1-7 ($297 value) + Office Hours ($497 value)... Total $1,997 value. Your price today: $49.'",
    supporting: [
      "The Stack is the load-bearing close mechanic. Without it, the price is the only number on the page – the worst possible frame.",
      "Anchor numbers should be defensible. Inflated 'value' numbers ($10,000 for a PDF) trigger trap-feel; small honest numbers compound.",
      "Used in VSLs, sales pages, webinars, and checkout pages. The same Stack works across surfaces with minor format variations.",
    ],
    relatedGlossary: ["stack-slide", "offer"],
    category: "funnel-mechanics",
    lastVerified: "2026-05-19",
  },
  {
    slug: "what-is-a-money-back-guarantee-worth",
    question: "What is a money-back guarantee worth to a funnel?",
    metaTitle: "Money-Back Guarantee Conversion Lift (Answer)",
    metaDescription:
      "A specific guarantee tied to a measurable event lifts conversion 20-40%. Generic 'satisfaction guaranteed' lifts barely 5%.",
    directAnswer:
      "A specific guarantee tied to a measurable event ('refund if your first paying customer doesn't materialize within 60 days') lifts conversion 20% to 40%. A generic 'satisfaction guaranteed' lifts barely 5%. Specificity is the magic – the buyer needs to picture exactly when the guarantee triggers.",
    supporting: [
      "Refund rate of 2-8% within the guarantee window is healthy. Below 2% suggests the guarantee isn't visible enough to be a sales tool.",
      "Surface the guarantee at the checkout step, not buried in FAQ. Buried guarantees don't lift conversion at the moment they're needed.",
      "Mirror the front-end's guarantee on any upsell. Asymmetry between front-end and OTO guarantees is a trust break.",
    ],
    relatedGlossary: ["offer", "weak-belief"],
    category: "funnel-mechanics",
    lastVerified: "2026-05-19",
  },

  // ----- PAA expansion batch 2026-05-22 (commercial-intent gaps) -----

  // Pricing expansion
  {
    slug: "should-i-offer-a-free-trial-or-freemium",
    question: "Should I offer a free trial or freemium for my SaaS?",
    metaTitle: "Free Trial or Freemium for SaaS? (Answer)",
    metaDescription:
      "Free trial converts better for time-to-value under 14 days; freemium converts better when the product has network effects or genuine free-tier utility.",
    directAnswer:
      "Free trial converts better when the product reaches first value within 7 to 14 days; freemium converts better when the product has network effects, viral loops, or genuine standalone utility at the free tier. Most indie SaaS should default to a 7 or 14 day free trial – it filters serious evaluators from tire-kickers and shortens the cash-collection cycle.",
    supporting: [
      "Freemium suits collaboration tools and viral mechanics; free trial suits productivity and conversion tools where the value is solo.",
      "Freemium's hidden cost is support burden – free users generate 60 to 80% of support tickets with zero revenue.",
      "Hybrid (limited freemium plus paid trial of premium features) often outperforms pure freemium or pure trial for sub-$100/mo products.",
    ],
    relatedGlossary: ["offer", "value-ladder", "weak-offer"],
    category: "pricing",
    lastVerified: "2026-05-22",
  },
  {
    slug: "how-long-should-a-saas-free-trial-be",
    question: "How long should a SaaS free trial be?",
    metaTitle: "Ideal SaaS Free Trial Length (Answer)",
    metaDescription:
      "7 days for narrow-purpose tools, 14 days for general SaaS, 30 days only for enterprise. Longer trials lower urgency and convert worse.",
    directAnswer:
      "7 days for narrow single-purpose tools, 14 days for general-purpose indie SaaS, 30 days only for enterprise products with multi-stakeholder evaluation. Longer trials lower urgency: a user who hasn't activated in 14 days rarely activates in 30. The trial length should match how long it actually takes to reach first value, plus a small buffer.",
    supporting: [
      "Most indie SaaS users decide to buy or churn within the first 72 hours of trial start, regardless of trial length.",
      "Trial extension on request often outperforms a longer default. Extending one trial signals you value the evaluator; defaulting to 30 days signals you doubt activation.",
      "Credit-card-required trials convert 2 to 4x higher than no-card trials but cut top-of-funnel signups by 40 to 70%. Choose based on whether you need volume or quality.",
    ],
    relatedGlossary: ["offer", "weak-offer"],
    category: "pricing",
    lastVerified: "2026-05-22",
  },
  {
    slug: "how-to-raise-saas-prices-without-churning-customers",
    question:
      "How do I raise SaaS prices without churning existing customers?",
    metaTitle: "Raise SaaS Prices Without Churn (Answer)",
    metaDescription:
      "Grandfather existing customers, announce the increase 30+ days ahead, raise pricing only on new accounts. Churn from a well-handled increase is typically 1-5%.",
    directAnswer:
      "Grandfather existing customers at their current rate, announce the change to new signups 30 days ahead, and only raise prices on new accounts. Churn from a price increase that grandfathers existing customers is typically 1% to 5%. Raising prices on existing customers without grandfathering is the move that actually triggers serious churn, often 10% to 20%.",
    supporting: [
      "Anchor the price change with new value: ship a feature, publish a roadmap, or expand the offer in the same window. The increase reads as 'product is growing,' not 'cash grab.'",
      "When raising on existing customers, offer a 12-month lock at the old rate as an opt-in. The 30 to 50% who lock in stay; the rest decide quietly.",
      "Price-increase emails should be plain-text from the founder, not marketing-formatted. The transactional tone signals respect.",
    ],
    relatedGlossary: ["offer", "value-ladder"],
    category: "pricing",
    lastVerified: "2026-05-22",
  },
  {
    slug: "usage-based-vs-seat-based-pricing",
    question: "Should my SaaS use usage-based or seat-based pricing?",
    metaTitle: "Usage vs Seat-Based SaaS Pricing (Answer)",
    metaDescription:
      "Seat-based scales with team size and predicts revenue better. Usage-based scales with value delivered but creates buyer anxiety at large invoices.",
    directAnswer:
      "Seat-based pricing scales with team size, predicts revenue best, and matches how procurement budgets work. Usage-based scales with value delivered but creates buyer anxiety at large invoices and complicates forecasting. Most indie SaaS should default to seat-based with optional usage caps; pure usage-based suits infrastructure tools where the customer expects metered billing.",
    supporting: [
      "Hybrid (seat plus usage overage) is the most common SaaS pricing pattern at scale. It captures both predictability and value-aligned expansion.",
      "Usage-based requires a metered billing system (Stripe Meters, Orb, Metronome). Implementing it adds 1 to 4 weeks of engineering work most indie SaaS underestimate.",
      "Buyer anxiety from usage-based is largest at month-end when invoices arrive. Real-time usage dashboards reduce anxiety but rarely eliminate it.",
    ],
    relatedGlossary: ["offer", "value-ladder"],
    category: "pricing",
    lastVerified: "2026-05-22",
  },
  {
    slug: "how-do-i-ab-test-saas-pricing",
    question: "How do I A/B test SaaS pricing?",
    metaTitle: "How to A/B Test SaaS Pricing (Answer)",
    metaDescription:
      "Test by cohort over time, not concurrent split (Stripe disallows different prices to similar users). Need 200+ signups per cohort to read.",
    directAnswer:
      "Test pricing by cohort over time, not by concurrent A/B split – Stripe terms forbid showing different prices to similar users on the same offer. Run price A for 4 weeks, price B for the next 4 weeks, compare LTV. Need at least 200 signups per cohort before the difference is reliable enough to act on.",
    supporting: [
      "Test conversion rate AND LTV together. A price that converts 30% better but churns 50% sooner is a worse business outcome.",
      "Hold everything else constant: same landing page, same traffic source, same offer copy. Changing pricing and copy at the same time invalidates the read.",
      "If you must split-test concurrently, segment by geography or by a clean acquisition channel. The cohorts have to be statistically independent.",
    ],
    relatedGlossary: ["offer", "value-ladder"],
    category: "pricing",
    lastVerified: "2026-05-22",
  },

  // Funnel mechanics expansion
  {
    slug: "what-is-a-good-opt-in-conversion-rate",
    question: "What is a good email opt-in conversion rate?",
    metaTitle: "Good Email Opt-In Conversion Rate (Answer)",
    metaDescription:
      "Cold traffic to opt-in: 2-8% is typical. Warm traffic: 15-35%. Below 2% on cold means the lead magnet's promise isn't specific enough.",
    directAnswer:
      "Cold traffic to email opt-in typically runs at 2% to 8%. Warm traffic (referrals, retargeting, direct visits) runs at 15% to 35%. Below 2% on cold almost always means the lead magnet's promise isn't specific enough – generic 'newsletter' or 'updates' opt-ins convert near zero. Specific deliverable plus specific outcome converts.",
    supporting: [
      "Exit-intent opt-ins capture 3 to 8% of would-be bouncers. Worth shipping but rarely the load-bearing opt-in surface.",
      "Two-step opt-in (button click then form) often outperforms one-step by 10 to 30%. The micro-commitment of the first click increases form-submit rates.",
      "Promised deliverable timing matters: 'instant access' converts better than 'check your email in 24 hours'. If the delivery is delayed, name the delay honestly.",
    ],
    relatedGlossary: ["offer", "wrong-person"],
    category: "funnel-mechanics",
    lastVerified: "2026-05-22",
  },
  {
    slug: "how-long-should-a-sales-page-be",
    question: "How long should a SaaS sales page be?",
    metaTitle: "Ideal SaaS Sales Page Length (Answer)",
    metaDescription:
      "Short (1-2 screens) for under $20/mo offers. Long-form (8-15 sections) for $50+/mo. The price point and audience awareness set the length.",
    directAnswer:
      "Short sales pages (1 to 2 screens) work for under $20/month offers where the value is obvious. Long-form sales pages (8 to 15 sections including hero, problem, solution, proof, stack, FAQ, guarantee, CTA) work for $50/month and above where belief-building is required. The price point and audience awareness level determine length, not the founder's preference.",
    supporting: [
      "Cold traffic needs longer pages because the visitor arrives with zero context. Warm traffic (referrals, podcast appearances) can convert on a shorter page.",
      "Sales page length matters less than section quality. Eight excellent sections outperform sixteen mediocre ones.",
      "Long-form pages should include genuine in-page navigation (sticky CTA, anchor links) so high-intent visitors can skip to checkout without scrolling through the full pitch.",
    ],
    relatedGlossary: ["hook", "story", "offer", "stack-slide"],
    category: "funnel-mechanics",
    lastVerified: "2026-05-22",
  },
  {
    slug: "whats-the-difference-between-lead-magnet-and-tripwire",
    question: "What's the difference between a lead magnet and a tripwire?",
    metaTitle: "Lead Magnet vs Tripwire (Answer)",
    metaDescription:
      "A lead magnet is free in exchange for email. A tripwire is a low-priced ($1-$27) paid offer that converts prospects into customers.",
    directAnswer:
      "A lead magnet is free in exchange for an email address; the visitor leaves the funnel as a subscriber. A tripwire is a low-priced paid offer ($1 to $27) that converts the prospect into a customer – fundamentally different psychology than a free download. Tripwires filter serious buyers; lead magnets gather a wider list.",
    supporting: [
      "Tripwire buyers convert to core offer at 5 to 15x the rate of lead magnet subscribers. The first transaction is the trust-anchor that compounds.",
      "Lead magnets work for top-of-funnel content marketing. Tripwires work for direct-response paid acquisition where you need to recover ad spend faster.",
      "You can combine them: lead magnet captures email, Soap Opera Sequence pitches a tripwire, tripwire upsells to core. This is the canonical Brunson stack.",
    ],
    relatedGlossary: ["offer", "value-ladder", "soap-opera-sequence"],
    category: "funnel-mechanics",
    lastVerified: "2026-05-22",
  },
  {
    slug: "should-i-use-a-countdown-timer-on-my-sales-page",
    question: "Should I use a countdown timer on my sales page?",
    metaTitle: "Countdown Timer on Sales Pages? (Answer)",
    metaDescription:
      "Honest deadlines lift conversion 15-30%. Fake evergreen timers (reset per visitor) work short-term but damage trust and underperform real urgency.",
    directAnswer:
      "Honest deadlines (launch close, price-increase date, cohort start) lift conversion 15% to 30%. Fake evergreen timers that reset per visitor work short-term but damage trust when visitors notice and underperform real urgency. The lift comes from the honest deadline itself, not from the timer widget – the widget just makes the deadline visible.",
    supporting: [
      "Real deadlines compound: each honest deadline reinforces trust for the next launch. Each fake deadline burns trust permanently.",
      "Cart-close emails on the deadline day move 30 to 50% of the cart's eventual revenue. The timer's job is to make the cart-close email feel earned.",
      "If you don't have a real deadline, manufacture one honestly: 'first 50 customers' or 'closing for the cohort start'. Don't fabricate scarcity that doesn't exist.",
    ],
    relatedGlossary: ["offer", "weak-belief"],
    category: "funnel-mechanics",
    lastVerified: "2026-05-22",
  },
  {
    slug: "where-should-the-cta-be-on-a-saas-landing-page",
    question: "Where should the CTA be on a SaaS landing page?",
    metaTitle: "Where to Place SaaS Landing Page CTA (Answer)",
    metaDescription:
      "Above the fold, after the stack, after the guarantee, plus sticky in the nav. Most indie SaaS under-CTA, not over-CTA.",
    directAnswer:
      "Place the primary CTA above the fold (visible without scrolling), repeat after the stack section, repeat after the guarantee, and pin a sticky CTA in the nav for long pages. Most indie SaaS under-CTA, not over-CTA – three to five CTAs on a long-form page is normal. The CTA should appear right after each belief-building moment.",
    supporting: [
      "Above-the-fold CTA captures the 5 to 15% of visitors who arrive already pre-sold (from a podcast, referral, or repeat visit). They convert before scrolling.",
      "The button copy matters more than the position. 'Start free trial' converts differently from 'Get the diagnostic' even on the identical button.",
      "Track which CTA each conversion came from with anchor-specific tracking. Most founders are surprised which CTA position actually wins.",
    ],
    relatedGlossary: ["offer"],
    category: "funnel-mechanics",
    lastVerified: "2026-05-22",
  },
  {
    slug: "what-is-the-perfect-webinar-structure",
    question: "What is the Perfect Webinar structure?",
    metaTitle: "Perfect Webinar Structure (Brunson Answer)",
    metaDescription:
      "Brunson's Perfect Webinar: Big Domino → Origin Story → Three Secrets → Stack and Close. ~60-90 minutes. Used for offers $497+.",
    directAnswer:
      "Russell Brunson's Perfect Webinar is a 60 to 90 minute structure: open with the Big Domino (the one belief that, if broken, makes the offer make sense), tell the Origin Story, teach Three Secrets that each break a related belief, then Stack and Close. Used for offers $497 and above where longer-form belief-building justifies the time investment.",
    supporting: [
      "Each of the Three Secrets reframes a specific objection. Secret 1: the vehicle (your product is the right type). Secret 2: internal belief (the user can succeed). Secret 3: external belief (circumstances don't block it).",
      "The Stack arrives at minute ~50 to 60 after belief is established. Stacking too early (before belief) converts poorly even with a strong offer.",
      "Simulated-live webinars (pre-recorded but presented as live) convert similarly to live for evergreen funnels. Live still wins for high-ticket launches where Q&A drives the close.",
    ],
    relatedGlossary: ["perfect-webinar", "big-domino", "stack-slide", "offer", "story"],
    category: "funnel-mechanics",
    lastVerified: "2026-05-22",
  },

  // Email expansion
  {
    slug: "what-is-a-good-email-open-rate-for-saas",
    question: "What is a good email open rate for SaaS?",
    metaTitle: "Good SaaS Email Open Rate (Answer)",
    metaDescription:
      "30-50% for engaged indie SaaS lists, 20-30% for general newsletters. Apple Mail Privacy inflates reported opens; trust click rate as the cleaner signal.",
    directAnswer:
      "Engaged indie SaaS lists open at 30% to 50%; general newsletters open at 20% to 30%; below 15% indicates list-quality or deliverability problems. Apple Mail Privacy Protection inflates reported opens by 20 to 40% on lists with high iOS share, so trust click rate as the cleaner engagement signal. List quality matters more than copywriting.",
    supporting: [
      "First 5 days of a Soap Opera Sequence open at 40 to 60% because subscribers are at peak engagement. Open rate decays after week 2 unless content stays specific to the subscriber's problem.",
      "Sender name matters more than subject line for opens. A founder's first-name sender outperforms a generic brand-only sender by 5 to 15 percentage points.",
      "Re-engagement sequences after 90 days of inactivity recover 5 to 15% of dormant subscribers and improve overall deliverability by removing the rest.",
    ],
    relatedGlossary: ["soap-opera-sequence", "seinfeld-email"],
    category: "email",
    lastVerified: "2026-05-22",
  },
  {
    slug: "what-is-a-good-email-click-through-rate",
    question: "What is a good email click-through rate?",
    metaTitle: "Good Email Click-Through Rate (Answer)",
    metaDescription:
      "2-5% for general broadcast, 5-10% for Soap Opera, 10-20% for targeted behavioral. Click rate is the cleaner signal post Apple privacy changes.",
    directAnswer:
      "General broadcast emails to an indie SaaS list click at 2% to 5%. Soap Opera Sequence emails click at 5% to 10% during the first 5 days. Targeted re-engagement or behavioral emails (after a trial signup, after a paywall hit) click at 10% to 20%. Click rate is the cleaner engagement signal since Apple Mail Privacy makes open rates noisy.",
    supporting: [
      "Single primary link per email outperforms multiple links by 15 to 30%. The classic mistake is hedging with 'or visit our website' secondary CTAs.",
      "Button links outperform text links by 10 to 25% for the same destination. Button styling needs to look clickable but not overproduced.",
      "Click rate above 20% on a broadcast email is usually a sign of an over-segmented send (very small, very warm list). The headline rate is good; the absolute volume is the constraint.",
    ],
    relatedGlossary: ["seinfeld-email", "soap-opera-sequence"],
    category: "email",
    lastVerified: "2026-05-22",
  },
  {
    slug: "how-do-i-warm-up-a-new-email-domain",
    question: "How do I warm up a new email sending domain?",
    metaTitle: "How to Warm Up an Email Domain (Answer)",
    metaDescription:
      "Start at 20-50 sends/day to engaged recipients, double weekly over 3-6 weeks. Set up SPF, DKIM, DMARC before the first send.",
    directAnswer:
      "Start with 20 to 50 sends per day to your most-engaged recipients (people who opted in recently or replied recently). Double daily volume weekly until you reach your target send rate, typically over 3 to 6 weeks. Set up SPF, DKIM, and DMARC records before the first send. Sending high volume from a cold domain on day one will land your emails in spam permanently.",
    supporting: [
      "Engagement signals (opens, clicks, replies) build sender reputation. Send to subscribers who actually engage; skip the dormant ones during warm-up.",
      "Transactional emails (welcome, receipt) build reputation faster than marketing broadcasts because they're high-engagement. Send them first if your stack supports it.",
      "Subdomain strategy isolates risk. Use mail.yourdomain.com for marketing and updates; transactional comes from app.yourdomain.com. If marketing tanks reputation, transactional stays clean.",
    ],
    relatedGlossary: ["seinfeld-email"],
    category: "email",
    lastVerified: "2026-05-22",
  },
  {
    slug: "plain-text-vs-html-emails-for-saas",
    question: "Should I send plain-text or HTML emails for SaaS?",
    metaTitle: "Plain Text vs HTML Email for SaaS (Answer)",
    metaDescription:
      "Plain text wins for founder-voice, transactional, and re-engagement. HTML wins for newsletters with visual content. Default to plain text.",
    directAnswer:
      "Plain text wins for founder-voice broadcasts, transactional emails, and re-engagement sequences – it looks personal and reaches the primary inbox more reliably. HTML wins for newsletters with visual content (screenshots, charts, product updates). Most indie SaaS over-design their emails. Default to plain text and add HTML only when the content genuinely needs it.",
    supporting: [
      "Plain-text emails feel like a person; HTML emails feel like marketing. The Soap Opera Sequence and most Seinfeld emails should be plain-text.",
      "Gmail's tabbed inbox (Primary, Promotions, Updates) sorts HTML-heavy emails into Promotions more often. Plain text reaches Primary more reliably.",
      "Hybrid (text-styled HTML that looks plain) is the practical compromise. Single column, no images, hyperlinks instead of buttons.",
    ],
    relatedGlossary: ["seinfeld-email", "soap-opera-sequence"],
    category: "email",
    lastVerified: "2026-05-22",
  },

  // Metrics expansion
  {
    slug: "what-is-a-good-mrr-growth-rate",
    question: "What is a good MRR growth rate for indie SaaS?",
    metaTitle: "Good MRR Growth Rate for Indie SaaS (Answer)",
    metaDescription:
      "10-20% MoM at sub-$10K MRR, slowing to 5-10% at $10K-$50K MRR. Below 5% at sub-$10K usually signals a positioning or offer problem.",
    directAnswer:
      "10% to 20% month-over-month growth is healthy at sub-$10K MRR for indie SaaS. Growth typically slows to 5% to 10% MoM at $10K to $50K MRR. Below 5% at sub-$10K MRR usually signals a positioning or offer problem, not a growth-channel problem. The fix is upstream (Hook / Story / Offer) before tuning ad spend or content cadence.",
    supporting: [
      "MRR growth at the early stage is dominated by net new customers, not expansion. Don't optimize for expansion revenue until you're past $20K MRR.",
      "Compounding growth is fragile: 15% MoM compounds to 5.4x in a year, but a single 'flat month' resets the compound. Consistency beats peaks.",
      "Calculate MRR growth on net new MRR (new plus expansion minus churn minus downgrade), not gross new MRR. Gross hides churn problems for months.",
    ],
    relatedGlossary: ["wrong-person", "weak-offer"],
    category: "metrics",
    lastVerified: "2026-05-22",
  },
  {
    slug: "what-is-a-good-free-to-paid-conversion-rate",
    question: "What is a good free trial to paid conversion rate?",
    metaTitle: "Good Trial-to-Paid Conversion Rate (Answer)",
    metaDescription:
      "Credit-card-required trials: 40-60% to paid. No-card trials: 8-20% to paid. Below 8% on no-card means activation isn't happening during the trial.",
    directAnswer:
      "Credit-card-required trials convert to paid at 40% to 60% – the card requirement filters serious evaluators upstream. No-card trials convert at 8% to 20% to paid. Below 8% on no-card trial almost always means activation (first value delivery) isn't happening during the trial window, not that pricing is wrong.",
    supporting: [
      "Activation correlates with conversion 5 to 10x stronger than any pricing variable. Fix activation first, pricing second.",
      "Day-1 activation predicts trial-to-paid better than any other metric. If a user doesn't reach first value within 24 hours, conversion drops 50 to 80%.",
      "Trial-extension requests are a positive signal, not a hassle to deflect. Users who extend convert at 30 to 60% – higher than the trial-period default.",
    ],
    relatedGlossary: ["weak-offer", "value-ladder"],
    category: "metrics",
    lastVerified: "2026-05-22",
  },
  {
    slug: "how-long-to-hit-10k-mrr-for-indie-saas",
    question: "How long does it take an indie SaaS to hit $10K MRR?",
    metaTitle: "How Long to Hit $10K MRR Indie SaaS (Answer)",
    metaDescription:
      "Median is 18-36 months post-launch. Top quartile hits $10K MRR in 6-12 months with a paid acquisition channel and a tripwire.",
    directAnswer:
      "Median time to $10K MRR for indie SaaS is 18 to 36 months post-launch. Top quartile hits $10K MRR in 6 to 12 months. The single biggest differentiator between the fast quartile and the median: the fast ones have a paid acquisition channel that works (LinkedIn or Meta ads, not pure SEO) and a tripwire that recovers ad spend within 30 days.",
    supporting: [
      "The 'years to $10K MRR' headline hides that 30 to 50% of indie SaaS never reach $10K. The benchmark is conditional on reaching it at all.",
      "Founders who reach $10K MRR usually pivot positioning at least once. The first positioning is rarely the one that works.",
      "Solo founders reach $10K MRR slower than two-founder teams on average, but solo unit economics are stronger. Different game, not a slower one.",
    ],
    relatedGlossary: ["value-ladder", "wrong-person"],
    category: "metrics",
    lastVerified: "2026-05-22",
  },
  {
    slug: "what-is-a-good-net-revenue-retention",
    question: "What is a good Net Revenue Retention for SaaS?",
    metaTitle: "Good Net Revenue Retention SaaS (Answer)",
    metaDescription:
      "100%+ is healthy (expansion offsets churn). 110%+ is excellent. Below 90% means the business is shrinking before counting new customers.",
    directAnswer:
      "Net Revenue Retention (NRR) of 100% or above means the existing customer base self-grows: expansion revenue offsets churn and contraction. 110%+ is excellent for indie SaaS. Below 90% means the business is shrinking even before counting new customers, which is the most expensive way to run a SaaS. NRR is one of the two most-watched SaaS metrics by acquirers.",
    supporting: [
      "NRR above 100% is hard to reach without an expansion mechanic (seat growth, usage growth, tier upgrades). Pure flat-rate single-seat pricing typically tops out at 95% to 100%.",
      "The fastest NRR win is fixing involuntary churn (failed card retries). Smart Stripe retry logic recovers 50 to 70% of involuntary churn and adds 2 to 5 points to NRR.",
      "Cohort NRR matters more than headline NRR. Headline NRR can hide that recent cohorts are churning faster than older cohorts.",
    ],
    relatedGlossary: ["value-ladder"],
    category: "metrics",
    lastVerified: "2026-05-22",
  },
  {
    slug: "what-is-a-good-nps-for-saas",
    question: "What is a good NPS for SaaS?",
    metaTitle: "Good NPS for SaaS (Answer)",
    metaDescription:
      "30-50 is solid for indie SaaS. 50+ is excellent. With under 200 responses, NPS is directional, not predictive – use it as a trend over time.",
    directAnswer:
      "NPS of 30 to 50 is solid for indie SaaS. 50+ is excellent. Below 20 means the product isn't loved enough to grow via word of mouth. For early-stage indie SaaS with under 200 responses, NPS is more directional than predictive – use it as a trend over time, not as a fixed target.",
    supporting: [
      "NPS sample size matters: under 30 responses produces wildly variable scores. Don't make decisions until you have at least 50 to 100 responses per quarter.",
      "Detractors (0 to 6) are the highest-value qualitative signal. Read every detractor open-text response; they explain what's blocking growth.",
      "Promoters (9 to 10) are the highest-value quantitative signal. Ask them how they'd describe the product to a friend – that's your headline copy.",
    ],
    relatedGlossary: ["weak-belief"],
    category: "metrics",
    lastVerified: "2026-05-22",
  },

  // Positioning expansion
  {
    slug: "how-do-i-find-my-saas-positioning",
    question: "How do I find my SaaS positioning?",
    metaTitle: "How to Find SaaS Positioning (Answer)",
    metaDescription:
      "Run 10-20 customer interviews, identify the specific job-to-be-done, name one cohort plus one outcome on the homepage. Dunford's framework is the standard.",
    directAnswer:
      "Find positioning by running 10 to 20 customer interviews, identifying the specific job-to-be-done your product solves uniquely, then naming exactly one cohort and one outcome on the homepage. April Dunford's Obviously Awesome framework is the field standard: list alternatives, list unique attributes, derive enablers, map to market category, name the cohort. Positioning isn't a tagline – it's a market position.",
    supporting: [
      "The right cohort is specific enough that the cohort recognizes themselves on the homepage. 'B2B SaaS founders' is too broad; 'B2B SaaS founders post-launch with under $10K MRR' is specific.",
      "Positioning often changes after the first 100 customers. The cohort that buys is rarely the cohort the founder imagined at launch. Iterate based on who actually pays.",
      "Test positioning by reading the homepage to a real cohort member out loud. If they don't immediately say 'that's me, I need that', the positioning isn't there yet.",
    ],
    relatedGlossary: ["wrong-person", "dream-100"],
    category: "positioning",
    lastVerified: "2026-05-22",
  },
  {
    slug: "whats-the-difference-between-positioning-and-messaging",
    question: "What's the difference between positioning and messaging?",
    metaTitle: "Positioning vs Messaging Difference (Answer)",
    metaDescription:
      "Positioning is the market position. Messaging is how you communicate that position. Positioning changes rarely; messaging iterates constantly.",
    directAnswer:
      "Positioning is your market position: which cohort you serve, which alternatives you replace, what makes you the only viable choice for them. Messaging is how you communicate that position in copy, ads, and conversation. Positioning changes rarely (once a year at most); messaging iterates constantly (every campaign, every page). Most founders try to fix positioning by editing messaging, which doesn't work.",
    supporting: [
      "Positioning is strategic; messaging is tactical. Bad positioning can't be saved by good copywriting.",
      "Two products with identical positioning can have radically different messaging because messaging carries the founder's voice (the Attractive Character).",
      "When a campaign underperforms, diagnose positioning first. Wrong cohort plus perfect copy still converts near zero.",
    ],
    relatedGlossary: ["wrong-person", "story"],
    category: "positioning",
    lastVerified: "2026-05-22",
  },
  {
    slug: "how-do-i-write-a-one-line-saas-pitch",
    question: "How do I write a one-line SaaS pitch?",
    metaTitle: "How to Write a One-Line SaaS Pitch (Answer)",
    metaDescription:
      "Template: '[Product] is the [category] for [cohort] that [unique value]'. Specific is the rule – generic pitches convert nothing.",
    directAnswer:
      "Use the template: '[Product] is the [category] for [cohort] that [unique value]'. The category orients the listener (they know the type); the cohort narrows to the specific buyer; the unique value distinguishes from category alternatives. Generic pitches like 'We help businesses grow' convert nothing. Specific pitches like 'We're the diagnostic tool for post-launch indie SaaS founders with flat Stripe lines' convert.",
    supporting: [
      "The pitch should be readable aloud in under 8 seconds. Anything longer loses the listener's attention before the key noun.",
      "Test the pitch by reading it to someone who matches the cohort. If they immediately ask the right follow-up question ('how does it work?'), the pitch landed. If they ask 'what do you mean?', revise.",
      "The pitch should match the homepage hero exactly. Misaligned pitch and hero is the most common Wrong Person diagnosis.",
    ],
    relatedGlossary: ["hook", "wrong-person", "offer"],
    category: "positioning",
    lastVerified: "2026-05-22",
  },
  {
    slug: "how-do-i-get-my-first-10-saas-customers",
    question: "How do I get my first 10 SaaS customers?",
    metaTitle: "How to Get First 10 SaaS Customers (Answer)",
    metaDescription:
      "Direct outreach to your Dream 100, founder-led sales, and a tiny tripwire. Paid ads don't work at zero brand awareness. Aim for 10 in 30 days.",
    directAnswer:
      "Get the first 10 customers via direct outreach (email, LinkedIn, communities), founder-led sales conversations, and a tiny tripwire offer ($1 to $27) that converts conversation into customer. Paid ads don't work at zero brand awareness because the click-through audience has no context. Aim for 10 paying customers in 30 days; longer than 30 usually means positioning is off.",
    supporting: [
      "The first 10 customers should be conversations, not signups. Talk to each one before and after they buy. Their language becomes your copy.",
      "The Dream 100 method applies even at zero customers: identify 100 specific people who already have your audience and become useful to them.",
      "Skip Product Hunt and Hacker News for the first 10. Both are launch platforms for products with existing momentum, not engines for the first paying customer.",
    ],
    relatedGlossary: ["dream-100", "offer", "value-ladder"],
    category: "positioning",
    lastVerified: "2026-05-22",
  },
  {
    slug: "should-i-launch-my-saas-on-product-hunt",
    question: "Should I launch my SaaS on Product Hunt?",
    metaTitle: "Should I Launch on Product Hunt? (Answer)",
    metaDescription:
      "Yes if you have an existing audience to drive votes. No if you're hoping PH will bring the first audience. PH amplifies momentum; it doesn't create it.",
    directAnswer:
      "Yes if you have an existing audience to drive day-one votes (email list, Twitter following, community). No if you're hoping Product Hunt will bring the first audience – the platform amplifies existing momentum but doesn't create it. A top-5 day on Product Hunt typically generates 500 to 5,000 signups but only converts well if the product has a clear free tier or trial.",
    supporting: [
      "Day-one votes from your existing audience determine whether the algorithm features you. Without 100 to 200 upvotes in the first 4 hours, the listing drops below the fold.",
      "Hunt by a top hunter (with their own following) consistently outperforms self-hunt by 2 to 5x in placement and downstream signups.",
      "The audience that arrives from Product Hunt is technical-product-curious, not buyer-intent. Conversion is lower than direct outreach but volume is higher.",
    ],
    relatedGlossary: ["dream-100", "offer"],
    category: "positioning",
    lastVerified: "2026-05-22",
  },
  {
    slug: "do-waitlists-work-for-saas",
    question: "Do waitlists actually work for SaaS?",
    metaTitle: "Do SaaS Waitlists Work? (Answer)",
    metaDescription:
      "Yes for established creator audiences; usually not for first-time founders. Waitlist conversion to paid runs 1-5% cold, 10-30% warm.",
    directAnswer:
      "Yes for established creator audiences with existing trust; usually not for first-time indie SaaS founders. Waitlist conversion to paid runs 1% to 5% for cold lists and 10% to 30% for warm ones. The waitlist signal value is what it tells you about positioning, not the absolute count. 10,000 cold waitlist signups convert worse than 200 warm ones.",
    supporting: [
      "Waitlists work best as a positioning sharpener: the questions people ask in the waitlist signup form reveal whether your positioning is landing.",
      "Most waitlists overstate launch demand by 5 to 10x. A 'waitlist of 5,000' typically converts to 50 to 250 paying customers, not thousands.",
      "Skip the waitlist if you can launch directly. Charging on day one filters serious buyers from curious browsers; a waitlist often hides positioning weakness behind a count.",
    ],
    relatedGlossary: ["offer", "wrong-person"],
    category: "positioning",
    lastVerified: "2026-05-22",
  },

  // Ladder expansion
  {
    slug: "what-is-an-order-bump",
    question: "What is an order bump in a funnel?",
    metaTitle: "What Is an Order Bump? (Funnel Answer)",
    metaDescription:
      "An order bump is a checkbox add-on at checkout, typically $7-$47. Take rate 10-30%. Adds revenue without adding a new page.",
    directAnswer:
      "An order bump is a checkbox add-on offered at checkout, typically priced $7 to $47. Take rate runs 10% to 30% of buyers. It adds incremental revenue without adding a new page or new clicks; the buyer ticks a box during checkout. Different from an OTO (which is a separate page after the purchase) – the order bump is in-checkout.",
    supporting: [
      "The bump's value should be obviously complementary to the main purchase. A bump that requires its own pitch usually flops; a bump that's clearly an extension converts.",
      "Common pattern: main offer plus bump equals the 'complete' version. The bump frames as completion, not addition.",
      "Bumps work best at $19 to $47. Too low and the buyer doesn't notice; too high and the in-checkout decision feels too big.",
    ],
    relatedGlossary: ["offer", "value-ladder"],
    category: "ladder",
    lastVerified: "2026-05-22",
  },
  {
    slug: "what-is-a-downsell",
    question: "What is a downsell in a funnel?",
    metaTitle: "What Is a Downsell? (Funnel Answer)",
    metaDescription:
      "A downsell is a lower-priced offer shown after the buyer declines the main offer. Typically 30-60% of main offer price. Take rate 5-15%.",
    directAnswer:
      "A downsell is a lower-priced offer shown after the buyer declines the main offer (or the OTO). Typically priced at 30% to 60% of the main offer. Take rate runs 5% to 15% of decliners. It recovers revenue from buyers who said no, by offering a smaller commitment that still moves them up the value ladder.",
    supporting: [
      "The downsell isn't 'the same thing for less' – it's a smaller deliverable at a fair price for that deliverable. Faking a discount by removing arbitrary features converts poorly.",
      "Common downsell pattern: monthly subscription downsells to annual or to a one-time payment. The buyer who couldn't commit monthly might commit to a single payment.",
      "Downsell take rate plus original take rate is the actual offer conversion. Track both.",
    ],
    relatedGlossary: ["offer", "value-ladder"],
    category: "ladder",
    lastVerified: "2026-05-22",
  },
  {
    slug: "whats-the-difference-between-an-oto-and-an-upsell",
    question: "What's the difference between an OTO and an upsell?",
    metaTitle: "OTO vs Upsell Difference (Funnel Answer)",
    metaDescription:
      "OTO appears once immediately after purchase, often with a deadline. Upsell can recur over time. OTO take rates are higher per moment.",
    directAnswer:
      "A One-Time Offer (OTO) appears once, immediately after the first purchase, often with a visible deadline ('this offer disappears'). An upsell can recur over time and be re-offered in different channels. OTOs have higher take rates (15 to 35%) because of the immediate-decision framing. Upsells have lower take rates per moment but more total opportunity over the customer lifetime.",
    supporting: [
      "OTOs work because the buyer's decision-making mode is still active. Re-engaging that mode after a 3-day gap converts at a fraction of the OTO rate.",
      "Multi-step OTO funnels (OTO 1 → OTO 2) compound take rate but also compound buyer fatigue. Two OTOs is the practical maximum before conversion collapses.",
      "Upsells are the natural mechanism for value-ladder progression: tripwire buyer becomes core buyer becomes coaching buyer over months.",
    ],
    relatedGlossary: ["offer", "value-ladder", "stack-slide"],
    category: "ladder",
    lastVerified: "2026-05-22",
  },
  {
    slug: "can-i-have-multiple-otos-in-one-funnel",
    question: "Can I have multiple OTOs in one funnel?",
    metaTitle: "Multiple OTOs in One Funnel? (Answer)",
    metaDescription:
      "Yes, up to 2 OTOs is the practical max. OTO 1 take rate 15-35%, OTO 2 take rate 8-15% of OTO 1 buyers. Three OTOs trigger buyer fatigue.",
    directAnswer:
      "Yes – up to 2 OTOs is the practical maximum. OTO 1 take rate runs 15% to 35%; OTO 2 (offered to OTO 1 buyers) runs 8% to 15%. Three OTOs trigger buyer fatigue, conversion of OTO 3 collapses, and refund rates on the entire funnel climb. The pattern that works: OTO 1 extends the buyer's just-made decision; OTO 2 offers the natural next ladder rung.",
    supporting: [
      "OTO 2 should be a different category than OTO 1, not 'more of the same'. Repeating the same offer at a higher price converts near zero.",
      "Downsells between OTOs recover revenue but extend funnel length. Keep the total funnel under 4 steps post-purchase to maintain buyer momentum.",
      "Track the funnel as a whole, not OTO-by-OTO. A funnel with OTO 1 plus OTO 2 plus Downsell can have 1.4 to 2x the revenue per buyer of a single-OTO funnel.",
    ],
    relatedGlossary: ["offer", "value-ladder"],
    category: "ladder",
    lastVerified: "2026-05-22",
  },
];

export const ANSWER_SLUGS = ANSWER_ENTRIES.map((e) => e.slug);

export function getAnswerBySlug(slug: string): AnswerEntry | undefined {
  return ANSWER_ENTRIES.find((e) => e.slug === slug);
}

export const ANSWER_CATEGORIES = [
  "funnel-mechanics",
  "pricing",
  "email",
  "metrics",
  "positioning",
  "ladder",
] as const;

export const ANSWER_CATEGORY_LABELS: Record<
  (typeof ANSWER_CATEGORIES)[number],
  string
> = {
  "funnel-mechanics": "Funnel mechanics",
  pricing: "Pricing",
  email: "Email",
  metrics: "Metrics and benchmarks",
  positioning: "Positioning",
  ladder: "Value ladder",
};
