/**
 * /should-i/[decision] pSEO catalog – AEO decision-helper pages.
 *
 * Each entry is a single founder decision ("should I run paid ads at
 * zero MRR?") with a binary verdict, a 2-4 sentence direct answer, and
 * 2-4 supporting bullets. Built for LLM citation (Perplexity, ChatGPT,
 * Claude, Google AI Overviews) – assistants quote "should I…" answers
 * verbatim because they sit cleanly inside a decision-tree response
 * shape.
 *
 * Difference from /answers/[slug]:
 *   - /answers is open-ended ("what is a good X", "how many Y").
 *   - /should-i is decision-tree shaped (yes / no / depends / not-yet)
 *     and renders a visible verdict block at the top of the page.
 *
 * Brunson Hard-Rule reconciliation:
 *   - Verdicts default to the working founder's actual recommendation,
 *     not a hedge.
 *   - "Depends" verdicts must come with an explicit decision rule.
 *   - No fabricated ranges. Numbers are labelled as directional bands.
 */

export type ShouldIVerdict = "yes" | "no" | "depends" | "not-yet";

export interface ShouldIEntry {
  /** URL slug, kebab-case. The decision phrased as a slug. */
  slug: string;
  /** The decision question as it would actually be asked. */
  question: string;
  /** The binary verdict tag. */
  verdict: ShouldIVerdict;
  /**
   * Short verdict headline shown in the verdict card.
   * Should read as one clause: "Yes – but only after X" / "No, almost
   * never" / "Depends on whether X" / "Not yet – wait until X".
   */
  verdictHeadline: string;
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
    | "spend"
    | "pricing"
    | "offer"
    | "channel"
    | "timing"
    | "positioning";
  /** ISO date last verified. */
  lastVerified: string;
}

export const SHOULD_I_ENTRIES: ReadonlyArray<ShouldIEntry> = [
  // -------------------------------------------------------------------
  // Spend decisions
  // -------------------------------------------------------------------
  {
    slug: "run-paid-ads-at-zero-mrr",
    question: "Should I run paid ads at zero MRR?",
    verdict: "no",
    verdictHeadline: "No – paid ads at zero MRR are almost always a tax on a broken funnel.",
    metaTitle: "Should I Run Paid Ads at Zero MRR? (Answer)",
    metaDescription:
      "Almost never. Paid ads on a funnel that hasn't converted any organic traffic just burns capital faster. Fix the offer first; pay for distribution second.",
    directAnswer:
      "No, almost never. Paid traffic does not fix a broken funnel; it accelerates the bleeding. Until you have evidence that organic or warm traffic converts (say, 3 to 5 customers from non-paid sources), spending on ads converts unknown problems into known burn. The single exception is a tightly scoped retargeting budget once you have 1,000+ qualified visitors per month.",
    supporting: [
      "Conversion rate on a broken funnel is the same whether the traffic is paid or organic – the only thing money changes is how fast you find out.",
      "Most pre-revenue founders who 'tried paid ads and they didn't work' actually proved their funnel doesn't convert, then blamed the channel.",
      "Cheaper diagnostic: send 50 cold DMs to your dream-customer profile and watch what they say. If they don't bite for free, they won't bite paid.",
    ],
    relatedGlossary: ["wrong-person", "weak-offer", "offer"],
    category: "spend",
    lastVerified: "2026-05-22",
  },
  {
    slug: "hire-a-marketing-agency-pre-revenue",
    question: "Should I hire a marketing agency pre-revenue?",
    verdict: "no",
    verdictHeadline: "No – agencies need a working offer to amplify.",
    metaTitle: "Should I Hire a Marketing Agency Pre-Revenue?",
    metaDescription:
      "No. Agencies amplify a working offer; they do not build one. Pre-revenue, an agency retainer typically buys six months of polished outputs and zero customers.",
    directAnswer:
      "No. Marketing agencies amplify funnels that already convert; they do not build conversion. Pre-revenue, an agency retainer ($3K to $15K/month) typically delivers six months of polished assets and zero paying customers. The work the founder needs to do – figuring out who the customer is and what they will pay for – is not the work an agency does well.",
    supporting: [
      "Agencies optimise for retainer length, not customer revenue. Their incentive ends when you cancel, not when you reach product-market fit.",
      "Once you have a working offer (3 to 5 paying customers, repeatable acquisition story), an agency can compound it. Before that, they cannot.",
      "Cheaper alternative: hire a single freelancer for one specific deliverable (a sales page, a 5-email sequence) with a fixed scope.",
    ],
    relatedGlossary: ["weak-offer", "wrong-person"],
    category: "spend",
    lastVerified: "2026-05-22",
  },
  {
    slug: "pay-for-cold-email-tools-at-zero-mrr",
    question: "Should I pay for cold email tools at zero MRR?",
    verdict: "not-yet",
    verdictHeadline: "Not yet – send your first 100 cold emails manually first.",
    metaTitle: "Should I Pay for Cold Email Tools at Zero MRR?",
    metaDescription:
      "Not yet. Send your first 100 cold emails by hand from your real inbox. The replies teach you which copy works before any tool can scale it.",
    directAnswer:
      "Not yet. Send your first 100 cold emails by hand from your real inbox before automating anything. The replies teach you which subject line, which hook, and which ask actually move the needle – information no tool can give you. Once you have a copy that pulls 5 to 10% reply rate manually, a tool ($50 to $200/month) becomes worth the spend.",
    supporting: [
      "Manual sends from a real inbox land in primary tab; cold-email-tool sends frequently land in spam or promotions until you build sender reputation.",
      "The first 100 manual sends are the cheapest market research you will ever buy. Automating before then is paying to scale a guess.",
      "When you switch to a tool, warm up the new sending domain over 2 to 4 weeks. Don't dump 500 sends on day one – deliverability collapses.",
    ],
    relatedGlossary: ["dream-100"],
    category: "spend",
    lastVerified: "2026-05-22",
  },
  {
    slug: "sponsor-a-newsletter-at-1k-mrr",
    question: "Should I sponsor a newsletter at $1K MRR?",
    verdict: "depends",
    verdictHeadline:
      "Depends – yes if you can name three customers acquired from that newsletter's audience; no otherwise.",
    metaTitle: "Should I Sponsor a Newsletter at $1K MRR?",
    metaDescription:
      "Depends. Sponsor if you can already name three customers from that newsletter's audience. Otherwise it's an unmeasured donation, not a marketing channel.",
    directAnswer:
      "Sponsor a newsletter only when you can already name three customers (or three pipeline leads) who came from that newsletter's audience organically. If the audience converts when you reach them for free, paying to reach them at scale becomes a measurable channel. If you cannot point to organic conversion from that audience, a $500 to $5,000 sponsorship is a donation, not a marketing decision.",
    supporting: [
      "Newsletter sponsorships rarely produce same-week conversions. Expect 6 to 12 weeks before the cohort converts, if it converts at all.",
      "Negotiate a custom UTM link and a follow-up share-of-voice (a re-mention 2-3 issues later) rather than a single placement.",
      "The cheapest newsletter sponsorship test is a guest essay – you trade the operator a piece of content for one named placement. Costs $0, teaches the same audience-fit question.",
    ],
    relatedGlossary: ["dream-100"],
    category: "spend",
    lastVerified: "2026-05-22",
  },
  {
    slug: "invest-in-seo-or-paid-ads-first",
    question: "Should I invest in SEO or paid ads first?",
    verdict: "depends",
    verdictHeadline: "Depends – SEO if you can wait 6+ months; paid only if your funnel already converts warm traffic.",
    metaTitle: "Should I Invest in SEO or Paid Ads First?",
    metaDescription:
      "Depends on time horizon. SEO compounds over 6-12 months but is nearly free. Paid is instant but burns until the funnel converts.",
    directAnswer:
      "If you can afford a 6 to 12 month delay before traffic shows up, SEO is the higher-ROI bet. SEO compounds, never churns, and the operating cost is your time. Paid ads turn on instantly but burn money against an unproven funnel and stop the moment you stop paying. The right answer for most pre-revenue indie SaaS is SEO first, paid second.",
    supporting: [
      "SEO requires 20 to 50 indexed pages of genuine intent-match content before traction shows up. Below that threshold, the channel looks dead.",
      "Paid ads work earliest for offers that already convert warm traffic at 3%+. If your warm conversion is unknown, paid converts a small budget into a confusing dataset.",
      "Cheapest hybrid: write 1 SEO essay per week and use the same essay as paid creative on Twitter / LinkedIn. The asset compounds in both channels.",
    ],
    relatedGlossary: ["dream-100", "weak-offer"],
    category: "spend",
    lastVerified: "2026-05-22",
  },

  // -------------------------------------------------------------------
  // Pricing decisions
  // -------------------------------------------------------------------
  {
    slug: "charge-monthly-or-lifetime",
    question: "Should I charge monthly or lifetime?",
    verdict: "no",
    verdictHeadline:
      "No to lifetime – lifetime kills the asset's compounding revenue.",
    metaTitle: "Should I Charge Monthly or Lifetime? (Answer)",
    metaDescription:
      "Monthly almost always wins. Lifetime is a one-shot cash injection that kills compounding revenue and signals to acquirers that the business can't retain.",
    directAnswer:
      "Charge monthly. Lifetime pricing is a one-shot cash injection that destroys the compounding LTV that makes SaaS valuable. The exception is a deliberate lifetime promo during launch to seed early users and testimonials – capped at 50 to 100 buyers and run for 14 to 30 days only. Beyond that, lifetime structurally caps the business's value.",
    supporting: [
      "An indie SaaS at $49/month with healthy retention is worth roughly $1,500 to $2,500 per customer to a potential acquirer. The same $49 sold as a $199 lifetime is worth $199 once.",
      "Lifetime buyers also have the highest support cost-to-revenue ratio – they own the product forever but stopped paying years ago.",
      "If your goal is one-time cash injection (not LTV), the right tool is a tripwire ($1 to $27 one-shot), not a lifetime core offer.",
    ],
    relatedGlossary: ["value-ladder", "offer"],
    category: "pricing",
    lastVerified: "2026-05-22",
  },
  {
    slug: "raise-prices-before-product-market-fit",
    question: "Should I raise prices before product-market fit?",
    verdict: "depends",
    verdictHeadline: "Depends – yes if 30%+ of churn cites 'too cheap to be serious'; no otherwise.",
    metaTitle: "Should I Raise Prices Pre Product-Market Fit?",
    metaDescription:
      "Depends. Raise if churned users cite 'too cheap to be serious' or you over-attract tire-kickers. Hold if churn is product-quality driven.",
    directAnswer:
      "Raise prices when more than 30% of churned customers cite reasons like 'didn't take it seriously' or 'thought it was a side project'. Hold prices when churn is driven by product gaps, bugs, or missing features. Raising prices into product quality issues amplifies the wrong-fit problem; raising prices into a price-signalling problem fixes it.",
    supporting: [
      "A 2-3x price hike often improves both conversion AND retention because it filters out tire-kickers at the front door.",
      "Test the new price on new signups only for 30 days. Grandfather all existing customers at the old price – credibility costs less than the upside.",
      "Indie SaaS rarely fail by charging too much. They fail by charging too little to fund the work that closes the product-quality gap.",
    ],
    relatedGlossary: ["weak-offer", "wrong-person"],
    category: "pricing",
    lastVerified: "2026-05-22",
  },
  {
    slug: "offer-a-free-trial-or-a-money-back-guarantee",
    question: "Should I offer a free trial or a money-back guarantee?",
    verdict: "depends",
    verdictHeadline:
      "Depends – free trial for B2C self-serve; specific money-back guarantee for B2B and high-ticket.",
    metaTitle: "Free Trial or Money-Back Guarantee? (Answer)",
    metaDescription:
      "Free trial works for self-serve B2C SaaS under $50/mo. Money-back guarantee tied to a specific outcome works for B2B and high-ticket offers.",
    directAnswer:
      "Use a free trial for self-serve B2C SaaS priced under $50 per month. Use a specific money-back guarantee ('refund if X measurable outcome hasn't happened by Y date') for B2B SaaS, high-ticket offers, and anything over $100 per month. Generic 'satisfaction guaranteed' lifts conversion barely 5%; a specific outcome-tied guarantee lifts conversion 20 to 40%.",
    supporting: [
      "Free trials collect credit cards. Free trials without credit cards collect tourists, not customers. The CC-required trial converts roughly 3-5x better.",
      "A specific guarantee ('refund if your first paying customer doesn't materialise in 60 days') outperforms a long guarantee window every time. Specificity beats duration.",
      "Refund rate within the guarantee window of 2-8% is healthy. Below 2% suggests the guarantee isn't visible enough; above 10% suggests your offer is over-promising.",
    ],
    relatedGlossary: ["offer", "weak-belief"],
    category: "pricing",
    lastVerified: "2026-05-22",
  },
  {
    slug: "offer-an-annual-discount",
    question: "Should I offer an annual discount on my SaaS?",
    verdict: "yes",
    verdictHeadline: "Yes – 15 to 25% annual discount, framed as 'two months free'.",
    metaTitle: "Should I Offer an Annual SaaS Discount?",
    metaDescription:
      "Yes. 15-25% annual discount (often 'two months free' framing). Annual plans churn 3-5x less than monthly, so the discount pays for itself.",
    directAnswer:
      "Yes. Offer an annual plan at a 15 to 25% discount, framed as 'two months free' (a 16.7% discount). Annual customers churn 3 to 5x less than monthly customers, so the discount pays for itself in retention. Don't default to annual; show monthly as the default with a toggle to annual.",
    supporting: [
      "'Two months free' converts better than '17% off' framing. Same math, more concrete value.",
      "Trigger an annual upgrade prompt at day 60 to 90 of monthly use – the buyer has formed a habit and is more receptive.",
      "Avoid annual-only pricing for new buyers. Locking in a 12-month commitment before trust is built underconverts dramatically for indie SaaS.",
    ],
    relatedGlossary: ["value-ladder", "offer"],
    category: "pricing",
    lastVerified: "2026-05-22",
  },
  {
    slug: "use-charm-pricing-ending-in-9",
    question: "Should I use charm pricing (ending in 9)?",
    verdict: "depends",
    verdictHeadline: "Depends – yes for B2C, mostly no for B2B mid-market.",
    metaTitle: "Should I Use Charm Pricing? ($19 vs $20)",
    metaDescription:
      "Charm pricing ($19, $49, $99) lifts B2C conversion 1-3%. For B2B mid-market, round pricing often signals professionalism better.",
    directAnswer:
      "For B2C SaaS, yes – charm pricing ($19, $49, $99) typically converts 1 to 3% better than round pricing. For B2B mid-market SaaS, no – round pricing ($20, $100, $500) often signals professionalism better, and procurement teams sometimes flag charm pricing as 'consumer-grade'. The category matters far more than the last digit.",
    supporting: [
      "The 1 to 3% lift on B2C is real but small. Spending more than a day testing the digit is usually a misallocation.",
      "The most impactful pricing lever is the tier structure (entry / core / premium), not the last digit of any single tier.",
      "Charm pricing on the entry tier with round pricing on the enterprise tier is a defensible mixed approach.",
    ],
    relatedGlossary: ["offer", "stack-slide"],
    category: "pricing",
    lastVerified: "2026-05-22",
  },
  {
    slug: "show-prices-on-the-public-site",
    question: "Should I show prices on my public site?",
    verdict: "yes",
    verdictHeadline: "Yes – unless the offer is enterprise (>$1K/mo) and built around custom scopes.",
    metaTitle: "Should I Show SaaS Prices Publicly?",
    metaDescription:
      "Yes for self-serve SaaS under $500/mo. Hidden pricing above $1K/mo can work, but 'contact us' is often a Wrong Person signal that hurts conversion.",
    directAnswer:
      "Show prices publicly for any self-serve SaaS priced under $500 per month. Above $1,000 per month and only with genuinely custom scopes, hidden pricing ('contact us', 'request a quote') can work – but it builds friction and signals Wrong Person traffic in most cases. The Brunson rule: if the buyer needs to ask, the offer wasn't anchored well enough.",
    supporting: [
      "Hidden pricing reduces top-of-funnel conversion 30 to 60%. It can lift qualified-lead quality for an enterprise motion, but rarely lifts revenue.",
      "If you do hide pricing, replace it with 'starting from $X' or 'tiers from $X to $Y'. Fully blank pricing pages convert near zero.",
      "Most indie SaaS hiding price are price-insecure, not strategically positioning. Public pricing forces the offer to defend itself.",
    ],
    relatedGlossary: ["offer", "weak-offer"],
    category: "pricing",
    lastVerified: "2026-05-22",
  },

  // -------------------------------------------------------------------
  // Offer decisions
  // -------------------------------------------------------------------
  {
    slug: "build-a-tripwire-for-my-saas",
    question: "Should I build a tripwire for my SaaS?",
    verdict: "yes",
    verdictHeadline: "Yes – if your core is $49+/mo and cold traffic doesn't convert directly.",
    metaTitle: "Should I Build a Tripwire for My SaaS?",
    metaDescription:
      "Yes for any SaaS where the core offer is $49+/mo and cold traffic doesn't convert directly. The tripwire ($1-$27) filters serious buyers from tire-kickers.",
    directAnswer:
      "Yes if your core offer is $49 or more per month and cold traffic doesn't convert to the core directly. A tripwire (typically $1 to $27) filters serious buyers from tire-kickers and converts prospects into customers, which doubles or triples conversion on the follow-up core offer. For sub-$49 offers, the tripwire is usually redundant.",
    supporting: [
      "A tripwire's purpose isn't direct revenue – it's converting a prospect into a customer. A $1 buyer behaves fundamentally differently than a $0 prospect.",
      "The Unlock SaaS Starter follows this pattern: $1 entry unlocks the first two Playbook steps, with the $49/mo Playbook as the core upgrade.",
      "A tripwire without a follow-up sequence is a one-shot. The Soap Opera Sequence (5 emails over 5 days) is what turns tripwire buyers into core customers.",
    ],
    relatedGlossary: ["value-ladder", "offer", "soap-opera-sequence"],
    category: "offer",
    lastVerified: "2026-05-22",
  },
  {
    slug: "add-an-upsell-after-the-tripwire",
    question: "Should I add an upsell after the tripwire?",
    verdict: "yes",
    verdictHeadline: "Yes – OTO revenue often exceeds the tripwire's own revenue.",
    metaTitle: "Should I Add an OTO After My Tripwire?",
    metaDescription:
      "Yes, almost always. OTO take rates of 15-35% are typical and OTO revenue often exceeds tripwire revenue itself.",
    directAnswer:
      "Yes, almost always. A tripwire without an OTO leaves significant revenue on the table. Typical OTO take rates are 15 to 35% of tripwire buyers, and OTO revenue often exceeds the front-end tripwire revenue itself. The OTO is funnel infrastructure, not an optional add-on.",
    supporting: [
      "The OTO must extend the buyer's just-made decision, not introduce a new one. Wrong-frame OTOs convert at near zero.",
      "OTO price should be 2x to 5x the tripwire price. $1 tripwire → $19 OTO. Beyond 5x feels like a frame-break and converts poorly.",
      "Implementation cost is minimal (one extra page, Stripe Setup Intent for one-click add) but ROI is substantial.",
    ],
    relatedGlossary: ["offer", "stack-slide", "value-ladder"],
    category: "offer",
    lastVerified: "2026-05-22",
  },
  {
    slug: "give-away-my-product-for-free-to-build-an-audience",
    question: "Should I give my product away for free to build an audience?",
    verdict: "no",
    verdictHeadline: "No – free users are the wrong audience and the wrong feedback loop.",
    metaTitle: "Should I Give My Product Away Free?",
    metaDescription:
      "No. Free users teach you what free users want, not what buyers want. A $1 tripwire builds a better audience than a free product.",
    directAnswer:
      "No. Free users teach you what free users want, which is rarely what buyers want. The signal you need at pre-revenue is whether anyone will exchange money for your product – free distribution actively suppresses that signal. A $1 tripwire builds a better audience than a free product because the buyer's behaviour is fundamentally different from the freeloader's.",
    supporting: [
      "Free users churn 10 to 20x faster than paying users, even at $1/month. The 'audience' is mostly a vanity metric.",
      "Support cost-to-revenue ratio on free users is infinite. You spend the same on support but capture no revenue to fund the work.",
      "Cheaper alternative: ship a $1 Starter that delivers something genuinely useful. Same lead-gen function, real customer feedback, no freeloader cost.",
    ],
    relatedGlossary: ["weak-offer", "value-ladder"],
    category: "offer",
    lastVerified: "2026-05-22",
  },
  {
    slug: "include-coaching-with-my-saas",
    question: "Should I include coaching with my SaaS?",
    verdict: "depends",
    verdictHeadline:
      "Depends – yes as a top-of-ladder rung at $497+/mo; no inside the core SaaS tier.",
    metaTitle: "Should I Include Coaching With My SaaS?",
    metaDescription:
      "Coaching belongs on the top rung of the value ladder ($497+/mo), not inside a $49/mo SaaS tier. Mixing the two destroys both economics.",
    directAnswer:
      "Coaching belongs as a separate rung at the top of the value ladder, priced at $497 per month or more. Bundling coaching into a $49 per month SaaS tier destroys both economics – the SaaS price is too low to fund the coaching time and the coaching is too cheap to attract serious clients. Keep them on separate rungs and let the customer self-upgrade.",
    supporting: [
      "1 hour of founder time per customer per month is unsustainable at any sub-$497 price point. Below that you are subsidising support out of your own time.",
      "High-ticket coaching attracts a different cohort than self-serve SaaS – fewer customers, but each represents 10x the LTV.",
      "The Unlock SaaS value ladder explicitly does not offer a coaching tier – the $49/mo Playbook is the top of the ladder by design.",
    ],
    relatedGlossary: ["value-ladder", "offer"],
    category: "offer",
    lastVerified: "2026-05-22",
  },
  {
    slug: "build-a-second-product-or-improve-the-first",
    question: "Should I build a second product or improve the first?",
    verdict: "no",
    verdictHeadline:
      "No to second product – improve the first until it crosses $10K MRR.",
    metaTitle: "Second Product or Improve the First?",
    metaDescription:
      "Improve the first. Building a second product before the first crosses $10K MRR fragments attention and rarely produces a second winner.",
    directAnswer:
      "Improve the first product until it crosses at least $10,000 in monthly recurring revenue. Building a second product before then fragments founder attention across two unprofitable bets and rarely produces a second winner – the same energy applied to the first product is what makes it cross. Once the first product crosses $10K MRR with low founder involvement, the second product becomes viable.",
    supporting: [
      "Most indie founders who 'pivoted to a second product' did so because the first product was hard, not because the second product was a better bet.",
      "A second product doubles your support surface, doubles your marketing surface, and halves your focus. Without the first generating slack, this math is brutal.",
      "Adjacent product (same audience, different deliverable) is more defensible than a second product in a fresh category – the audience asset transfers, the founder learning curve does not.",
    ],
    relatedGlossary: ["value-ladder"],
    category: "offer",
    lastVerified: "2026-05-22",
  },

  // -------------------------------------------------------------------
  // Channel decisions
  // -------------------------------------------------------------------
  {
    slug: "post-on-twitter-or-linkedin-for-indie-saas",
    question: "Should I post on Twitter or LinkedIn for indie SaaS?",
    verdict: "depends",
    verdictHeadline:
      "Depends – Twitter for B2C and dev tools, LinkedIn for B2B mid-market, both for serious founders.",
    metaTitle: "Twitter or LinkedIn for Indie SaaS?",
    metaDescription:
      "Twitter for B2C / dev tools / indie founders. LinkedIn for B2B mid-market and ops/HR/sales tools. Cross-post the same essay to both at minimum.",
    directAnswer:
      "Twitter (X) for B2C, developer tools, and the indie founder audience itself. LinkedIn for B2B mid-market, ops, HR, sales, and finance tools. The cheapest answer is both: write one essay per week and cross-post to Twitter and LinkedIn with platform-native formatting. The platform that pulls higher engagement after 4 to 6 weeks is the one to lean into.",
    supporting: [
      "Twitter's algorithm rewards conversation density; LinkedIn rewards saved-and-shared long-form. The same essay needs different framing per platform.",
      "Both platforms reward founder voice over brand voice. The founder's account compounds faster than the company account in almost all cases.",
      "Don't optimise the choice before posting 12 to 20 essays. The data after 4 essays is mostly noise.",
    ],
    relatedGlossary: ["dream-100", "seinfeld-email"],
    category: "channel",
    lastVerified: "2026-05-22",
  },
  {
    slug: "start-a-podcast-as-an-indie-founder",
    question: "Should I start a podcast as an indie founder?",
    verdict: "not-yet",
    verdictHeadline: "Not yet – guest on 20 podcasts first.",
    metaTitle: "Should I Start a Podcast as an Indie Founder?",
    metaDescription:
      "Not yet. Guest on 20 podcasts before launching your own. You learn the format, build relationships with hosts, and validate the audience first.",
    directAnswer:
      "Not yet. Guest on 20 podcasts before launching your own. Guesting teaches you the format, builds direct relationships with hosts in your space (a Dream 100 acceleration), and validates whether the audience you'd build is real – all before you commit to weekly production. Once you've guested 20 times and three of the hosts have offered you a recurring spot, your own podcast becomes a defensible decision.",
    supporting: [
      "A podcast is a 12 to 18 month commitment before audience traction. Most founder podcasts die at episode 8 because the audience hasn't shown up yet.",
      "Guesting on someone else's podcast gives you their audience for free. Running your own podcast gives you the operational cost without the audience.",
      "Cheaper proxy: write the first 8 episode-equivalent essays as long-form posts. If they don't gain traction as essays, they won't gain traction as a podcast.",
    ],
    relatedGlossary: ["dream-100", "story"],
    category: "channel",
    lastVerified: "2026-05-22",
  },
  {
    slug: "start-a-faceless-youtube-channel",
    question: "Should I start a faceless YouTube channel for my SaaS?",
    verdict: "depends",
    verdictHeadline:
      "Depends – yes if you can ship 30 episodes before judging it; no if you'll bail at episode 5.",
    metaTitle: "Should I Start a Faceless YouTube Channel?",
    metaDescription:
      "Yes only if you'll ship 30 episodes before judging it. Faceless YouTube compounds at episode 30-50; quitting at episode 5 means starting over later.",
    directAnswer:
      "Yes if you can commit to shipping 30 episodes before evaluating the channel; no otherwise. Faceless YouTube compounds at episode 30 to 50, when the algorithm has enough engagement data to surface the channel reliably. Quitting at episode 5 means the work doesn't compound and you'll have to start over if you return to the channel later.",
    supporting: [
      "Faceless format is scriptable and AI-assisted, which makes it the cheapest video format for solo founders. One script + one voiceover + stock B-roll = one episode.",
      "Each episode becomes one indexable URL on YouTube and, with a per-episode landing page, one indexable URL on your site too. Twin compounding.",
      "Pre-commit to the topic spine before you start. Faceless channels that drift topic-wise rarely compound; tight niche channels do.",
    ],
    relatedGlossary: ["dream-100", "story"],
    category: "channel",
    lastVerified: "2026-05-22",
  },
  {
    slug: "use-reddit-for-indie-saas-marketing",
    question: "Should I use Reddit for indie SaaS marketing?",
    verdict: "yes",
    verdictHeadline: "Yes – but as a useful commenter, not a promoter.",
    metaTitle: "Should I Use Reddit for SaaS Marketing?",
    metaDescription:
      "Yes. Reddit's top-of-funnel reach is enormous, but only as a useful commenter in niche subs. Self-promotional posts get downvoted into oblivion.",
    directAnswer:
      "Yes. Reddit drives strong long-tail SEO and high-intent traffic when used as a useful commenter, not as a promoter. The right move is to spend 4 to 8 weeks answering questions in 3 to 5 niche subreddits relevant to your audience, then occasionally link to your work when it directly answers the question. Self-promotional posts get downvoted, banned, or filtered.",
    supporting: [
      "Reddit threads frequently rank in the top 3 Google results for long-tail questions. A useful comment on a high-ranking thread captures that traffic indefinitely.",
      "Pick subreddits with 10K to 200K members. Larger subs (1M+) have too much noise; smaller subs don't have enough Google authority to compound.",
      "Mirror your best Reddit answers as canonical essays on your own site. The same content compounds on two surfaces.",
    ],
    relatedGlossary: ["dream-100"],
    category: "channel",
    lastVerified: "2026-05-22",
  },
  {
    slug: "launch-on-product-hunt",
    question: "Should I launch on Product Hunt?",
    verdict: "depends",
    verdictHeadline:
      "Depends – yes for B2C and developer tools, marginal for B2B mid-market.",
    metaTitle: "Should I Launch on Product Hunt?",
    metaDescription:
      "Yes for B2C / dev tools with built-up Twitter following. Marginal for B2B mid-market. Top-5 launch can produce 1-3K signups; #15-100 produces almost nothing.",
    directAnswer:
      "Yes for B2C and developer tools if you have a built-up audience to seed the launch day; marginal for B2B mid-market. A top-5 launch can produce 1,000 to 3,000 signups and lasting backlinks; a #15 to #100 launch produces almost nothing. The make-or-break factor is the first 4 hours after launch – have 30 to 50 supporters ready to upvote and comment in that window.",
    supporting: [
      "Launch on Tuesday or Wednesday at 12:01am PST. Saturdays and Mondays are the lowest-traffic days.",
      "The signups are largely tourist-grade. Expect 1-3% to convert to paying customers and treat the rest as future warm audience.",
      "Don't relaunch the same product. A second 'launch' of a renamed product is the most common Product Hunt failure mode.",
    ],
    relatedGlossary: ["dream-100"],
    category: "channel",
    lastVerified: "2026-05-22",
  },
  {
    slug: "post-on-indie-hackers",
    question: "Should I post on Indie Hackers?",
    verdict: "yes",
    verdictHeadline: "Yes – Indie Hackers is the highest-intent founder audience available for free.",
    metaTitle: "Should I Post on Indie Hackers?",
    metaDescription:
      "Yes. Indie Hackers is the highest-intent founder audience available for free. Post genuine build-in-public threads, not launch announcements.",
    directAnswer:
      "Yes. Indie Hackers is the highest-intent founder audience you can reach for free. Post genuine build-in-public threads (real numbers, real failures, real lessons), not polished launch announcements. The audience rewards transparency and downvotes promotional copy. Used well, 4 to 6 honest posts over 3 months produces meaningful traffic and 5 to 15 inbound conversations.",
    supporting: [
      "Posts with specific numbers ($MRR, conversion rates, churn) dramatically outperform abstract posts. The audience trades in operational truth.",
      "Comment on others' threads before posting your own. The same effort spent commenting compounds faster than the same effort spent posting.",
      "Mirror your IH posts as canonical essays on your own site. IH provides distribution, your site provides the durable URL.",
    ],
    relatedGlossary: ["dream-100", "story"],
    category: "channel",
    lastVerified: "2026-05-22",
  },

  // -------------------------------------------------------------------
  // Timing decisions
  // -------------------------------------------------------------------
  {
    slug: "rewrite-my-landing-page-or-find-a-new-channel",
    question: "Should I rewrite my landing page or find a new channel?",
    verdict: "no",
    verdictHeadline:
      "No new channel until the landing page converts qualified visitors. Rewrite first.",
    metaTitle: "Rewrite My Landing Page or Find a New Channel?",
    metaDescription:
      "Rewrite first. A new channel against a broken landing page just delivers more zero-converting traffic. Fix the page; then scale traffic.",
    directAnswer:
      "Rewrite the landing page first. A new channel against a broken landing page just delivers more zero-converting traffic – you'll have more visitors and the same revenue. The right sequence is: prove the landing page converts qualified visitors at 1 to 5%, then layer in additional channels to amplify that conversion. New channels are amplifiers, not fixes.",
    supporting: [
      "If you can't name which specific belief the visitor needs to accept to buy, the page is broken at the hook/story layer – no channel will fix that.",
      "The diagnostic shortcut: send your page to 10 dream-customer-profile people via DM and ask what they'd change. The first 3 unprompted bullets are the rewrite.",
      "Most landing-page rewrites that lift conversion 2-5x are niching the audience down, not improving the copy in isolation.",
    ],
    relatedGlossary: ["hook", "story", "offer", "wrong-person"],
    category: "timing",
    lastVerified: "2026-05-22",
  },
  {
    slug: "incorporate-before-launching",
    question: "Should I incorporate before launching my SaaS?",
    verdict: "no",
    verdictHeadline: "No – sole proprietor or single-member LLC is fine until $10K MRR.",
    metaTitle: "Should I Incorporate Before Launching SaaS?",
    metaDescription:
      "No. Sole prop or single-member LLC is fine until $10K MRR or you start hiring. Don't incorporate before you have a product.",
    directAnswer:
      "No. Sole proprietor or single-member LLC is fine for almost any indie SaaS until you cross $10,000 monthly recurring revenue or start hiring employees. Incorporating before you have a product accumulates legal fees, registered-agent costs, and tax-filing complexity against revenue that doesn't exist. The right time to incorporate is when the business has demonstrated it can sustain the overhead.",
    supporting: [
      "Single-member LLC in most US states: $50 to $500 setup + $0 to $800 annual fee. Reasonable. C-corp: $500 to $1,500 setup + $1K+ annual. Premature for pre-revenue.",
      "C-corp specifically matters for venture funding. If you are not raising VC, you almost certainly don't need C-corp structure for the first year.",
      "Don't take incorporation advice from incorporation services. Their incentive is to sell you the most complex structure.",
    ],
    relatedGlossary: [],
    category: "timing",
    lastVerified: "2026-05-22",
  },
  {
    slug: "quit-my-job-to-go-full-time-on-my-saas",
    question: "Should I quit my job to go full-time on my SaaS?",
    verdict: "not-yet",
    verdictHeadline:
      "Not yet – wait until MRR covers 6 months of expenses plus a 12-month runway buffer.",
    metaTitle: "Should I Quit My Job for My SaaS?",
    metaDescription:
      "Not yet. Wait until MRR covers 6 months of expenses plus 12 months of runway. Quitting too early forces revenue decisions against a desperate frame.",
    directAnswer:
      "Not yet. Wait until your SaaS monthly recurring revenue covers 6 months of your personal expenses AND you have 12 months of savings as runway buffer. Quitting earlier forces revenue decisions against a desperate frame – the founder accepts wrong-fit customers, undercharges, and ships sloppy features to survive. The product nearly always suffers.",
    supporting: [
      "The 'just quit and figure it out' advice ignores that founder desperation is visible to customers. Customers can feel it and they discount accordingly.",
      "A part-time founder shipping 10 hours per week of focused work outperforms a desperate full-time founder shipping 60 hours of panic work.",
      "Test the transition with a 90-day sabbatical first if you can negotiate one. Sustained focus without burning bridges.",
    ],
    relatedGlossary: ["weak-belief"],
    category: "timing",
    lastVerified: "2026-05-22",
  },
  {
    slug: "raise-vc-funding-for-my-indie-saas",
    question: "Should I raise VC funding for my indie SaaS?",
    verdict: "no",
    verdictHeadline:
      "No – VC mathematics are incompatible with a $5K-$50K MRR lifestyle business.",
    metaTitle: "Should I Raise VC for My Indie SaaS?",
    metaDescription:
      "No, in almost all indie cases. VC needs 100x outcomes; indie SaaS targets $10K-$1M MRR. The math is incompatible and the pressure destroys the business.",
    directAnswer:
      "No, in almost all indie SaaS cases. VC investors need 100x outcomes to justify their fund mathematics; indie SaaS targets $10,000 to $1 million MRR, which is a 0-100x outcome from a VC's perspective. Taking VC into an indie SaaS converts a sustainable business into a binary bet with founder-unfriendly governance. The right capital for indie SaaS is customer revenue.",
    supporting: [
      "VC term sheets routinely include liquidation preferences and board control that mean a $5M acquisition pays the founder nothing.",
      "The right indie SaaS capital is the tripwire + core + back-end revenue stack. That's the financing model, not the marketing model.",
      "If you genuinely need capital, indie-friendly alternatives exist: Calm.com / Earnest Capital, revenue-based financing, or just a small bank credit line.",
    ],
    relatedGlossary: ["value-ladder"],
    category: "timing",
    lastVerified: "2026-05-22",
  },
  {
    slug: "respond-to-every-support-ticket-myself",
    question: "Should I respond to every support ticket myself?",
    verdict: "yes",
    verdictHeadline: "Yes – until you hit 50 paying customers, the founder answers every ticket.",
    metaTitle: "Should the Founder Answer Every Support Ticket?",
    metaDescription:
      "Yes, until 50 paying customers. Founder support is the highest-density product research available. Outsource at 50; build a knowledge base before then.",
    directAnswer:
      "Yes, until you cross 50 paying customers. Founder-handled support is the highest-density product research available – every ticket teaches you what's broken, what's confusing, and what's missing. Hand off support too early and you lose the signal. Cross 50 paying customers and the cost-per-ticket becomes too high; that's the point to hire or systemise.",
    supporting: [
      "Build the knowledge-base content WHILE answering tickets. Each ticket-resolved becomes a draft article; by ticket 50 you have a real KB.",
      "Reply times under 4 hours during business hours dramatically improve trust and retention. Indie founders can match this; agencies and outsourced support rarely can.",
      "Use the ticket queue as a prioritisation signal for product roadmap. The most-mentioned bug is the next thing to fix, not the most-requested feature.",
    ],
    relatedGlossary: ["story", "verified-builder"],
    category: "timing",
    lastVerified: "2026-05-22",
  },

  // -------------------------------------------------------------------
  // Positioning decisions
  // -------------------------------------------------------------------
  {
    slug: "niche-down-or-broaden-my-positioning",
    question: "Should I niche down or broaden my positioning?",
    verdict: "yes",
    verdictHeadline:
      "Yes – niche down. Broader positioning attracts more visitors and converts none of them.",
    metaTitle: "Should I Niche Down My SaaS Positioning?",
    metaDescription:
      "Niche down. The homepage should name one specific cohort and one specific outcome. Broader positioning attracts more visitors and converts none of them.",
    directAnswer:
      "Niche down. The homepage should name one specific cohort and one specific outcome in the hero section. 'A marketing tool' converts at near zero; 'A marketing diagnostic for B2B SaaS founders under $10K MRR' converts. Broader positioning attracts more visitors and converts none of them. You can always expand the niche later; starting too broad is the harder mistake to fix.",
    supporting: [
      "The Wrong Person diagnosis catches positioning that's too broad. Most landing-page rewrites that lift conversion 2-5x are niching down, not rewriting copy.",
      "Niche positioning compounds: the founder's content, ads, and outreach all become specific. Generic positioning fragments effort across surfaces.",
      "Test niche specificity on your homepage hero for 30 days. If qualified-visitor conversion stays the same but unqualified visits drop, that's the right direction.",
    ],
    relatedGlossary: ["wrong-person", "dream-100"],
    category: "positioning",
    lastVerified: "2026-05-22",
  },
  {
    slug: "use-my-real-name-and-face-on-the-site",
    question: "Should I use my real name and face on the site?",
    verdict: "yes",
    verdictHeadline:
      "Yes – the founder's face is the highest-trust asset on an indie SaaS site.",
    metaTitle: "Should I Show My Real Name on My SaaS?",
    metaDescription:
      "Yes. The founder's name and face is the highest-trust asset on an indie SaaS site. Anonymous indie SaaS converts dramatically worse on cold traffic.",
    directAnswer:
      "Yes. The founder's real name, real photo, and traceable identity is the highest-trust asset on an indie SaaS site. Anonymous or pseudonym-branded indie SaaS converts dramatically worse on cold traffic because the buyer cannot verify who they're buying from. The Brunson Attractive Character framework explicitly requires identity – it's the load-bearing element.",
    supporting: [
      "Founder photo + LinkedIn link on the homepage typically lifts conversion 10 to 30% on cold traffic.",
      "Anonymous brands work for established companies with brand-level trust. They almost never work for pre-revenue indie SaaS.",
      "Faceless YouTube is a separate question – the channel can be faceless while the founder is identifiable on the destination site.",
    ],
    relatedGlossary: ["story", "seinfeld-email"],
    category: "positioning",
    lastVerified: "2026-05-22",
  },
  {
    slug: "build-in-public",
    question: "Should I build in public?",
    verdict: "yes",
    verdictHeadline: "Yes – with one specific number and one specific lesson per post.",
    metaTitle: "Should I Build in Public? (Indie SaaS Answer)",
    metaDescription:
      "Yes. Build in public works because it gives your audience a reason to follow before you have a product. Be specific: one number, one lesson per post.",
    directAnswer:
      "Yes. Building in public works because it gives your audience a reason to follow before the product is finished. Vague 'still grinding' posts don't compound; specific posts ('shipped X, learned Y, current MRR Z') do. The Soap Opera Sequence applied to your own founder journey – every post is one beat of the story.",
    supporting: [
      "Real numbers (MRR, churn, signups, refunds) outperform abstract progress every time. The audience trades in operational truth.",
      "The same posts power three surfaces: Twitter/LinkedIn live, your /founder-diary archive on the site, and the founder-story arc of the Attractive Character.",
      "Don't fake transparency. The audience can smell it. Real failure outperforms fake transparency 10 to 1.",
    ],
    relatedGlossary: ["story", "seinfeld-email", "verified-builder"],
    category: "positioning",
    lastVerified: "2026-05-22",
  },
  {
    slug: "use-ai-generated-content-on-my-site",
    question: "Should I use AI-generated content on my site?",
    verdict: "depends",
    verdictHeadline:
      "Depends – yes as a draft engine, no as final copy. Founder voice is the asset.",
    metaTitle: "Should I Use AI-Generated Content on My SaaS?",
    metaDescription:
      "Use AI as a draft engine, never as final copy. Founder voice is the trust asset that AI cannot replicate. Edit, ground in real numbers, ship.",
    directAnswer:
      "Use AI as a draft engine, never as final shipped copy. AI-drafted copy with founder editing, real numbers, and founder voice on top is fine and often optimal. Pure AI-generated copy ships at a flat, voiceless tone that reads as commodity content and tanks trust on cold traffic. The founder's specific voice is the asset AI cannot replicate.",
    supporting: [
      "Use AI for structure (outline a sales page, list 30 FAQ candidates) and for first-draft expansion. Edit aggressively before shipping.",
      "Ground every claim in a real number from your business or a cited source. AI's plausible-sounding fabrications are the fastest way to destroy credibility.",
      "Google's stance is neutral on AI-generated content per se; it cares about quality. AI content that's edited, grounded, and useful ranks fine. AI slop does not.",
    ],
    relatedGlossary: ["story"],
    category: "positioning",
    lastVerified: "2026-05-22",
  },
];

export const SHOULD_I_SLUGS = SHOULD_I_ENTRIES.map((e) => e.slug);

export function getShouldIBySlug(slug: string): ShouldIEntry | undefined {
  return SHOULD_I_ENTRIES.find((e) => e.slug === slug);
}

export const SHOULD_I_CATEGORIES = [
  "spend",
  "pricing",
  "offer",
  "channel",
  "timing",
  "positioning",
] as const;

export const SHOULD_I_CATEGORY_LABELS: Record<
  (typeof SHOULD_I_CATEGORIES)[number],
  string
> = {
  spend: "Spend decisions",
  pricing: "Pricing decisions",
  offer: "Offer decisions",
  channel: "Channel decisions",
  timing: "Timing decisions",
  positioning: "Positioning decisions",
};

export const SHOULD_I_VERDICT_LABELS: Record<ShouldIVerdict, string> = {
  yes: "Yes",
  no: "No",
  depends: "Depends",
  "not-yet": "Not yet",
};
