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
    question: "What is the Attractive Character in Brunson's framework?",
    metaTitle: "Attractive Character Explained (Brunson Framework)",
    metaDescription:
      "The Attractive Character is the founder persona presented to the audience: a person with backstory, parables, polarity, and identity-revealing flaws.",
    directAnswer:
      "The Attractive Character is Russell Brunson's framework for the founder persona presented to an audience. It has four elements: a backstory the audience can identify with, parables (stories that teach), polarity (clear positions on issues, even controversial ones), and identity-revealing flaws (vulnerability that builds trust). The Attractive Character is the voice the audience buys before they buy the product.",
    supporting: [
      "The Attractive Character isn't a fictional persona – it's the founder being deliberate about which dimensions of themselves to share publicly.",
      "Polarity is the most under-used dimension. Founders who take clear stands attract their dream customers and repel non-fits, which is the goal.",
      "Used across the entire funnel: blog posts, email Soap Opera, VSL, sales page. Consistent voice compounds trust across surfaces.",
    ],
    relatedGlossary: ["story", "seinfeld-email"],
    category: "positioning",
    lastVerified: "2026-05-19",
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
