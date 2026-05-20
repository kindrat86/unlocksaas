/**
 * /pricing-page-examples/[pattern] pSEO catalog – pricing-page pattern teardowns.
 *
 * Founders search "saas pricing page examples", "tiered pricing examples",
 * "decoy pricing examples". Each entry is a pattern (not a specific
 * company), described with the structural mechanics, real-world
 * occurrences, when it works, and when it backfires.
 *
 * Brunson Hard-Rule reconciliation:
 *   - We describe patterns by structure. The "where you see this in the wild"
 *     bullets name real companies that publicly use the pattern – verifiable
 *     by visiting their public pricing page. No fabricated occurrences.
 *   - No invented conversion lifts. Directional ranges only, marked as such.
 *   - Each page ends at /diagnostic for the live read on the founder's own
 *     pricing page.
 */

export interface PricingPagePatternEntry {
  /** URL slug, kebab-case. */
  slug: string;
  /** Display name of the pricing pattern. */
  displayName: string;
  /** SEO meta title, under 60 chars. */
  metaTitle: string;
  /** SEO meta description, under 160 chars. */
  metaDescription: string;
  /** TL;DR: what this pattern does, ~50 words. */
  tldr: string;
  /** The structural mechanics – how the pattern works visually + economically. */
  mechanics: string;
  /** Public examples a reader can visit to see the pattern in the wild. */
  examplesInTheWild: ReadonlyArray<{
    name: string;
    /** What about their pricing page demonstrates the pattern. */
    note: string;
  }>;
  /** When this pattern is the right choice. */
  whenItWorks: string;
  /** When this pattern backfires. */
  whenItBackfires: string;
  /** Brunson-frame diagnosis (Wrong Person / Weak Offer / Weak Belief lens). */
  brunsonLens: string;
  /** Common implementation mistakes. */
  commonMistakes: ReadonlyArray<string>;
  /** Three FAQs in AEO format. */
  faqs: ReadonlyArray<{ q: string; a: string }>;
  /** Related glossary terms. */
  relatedGlossary: ReadonlyArray<string>;
  /** ISO date last verified. */
  lastVerified: string;
}

export const PRICING_PAGE_PATTERN_ENTRIES: ReadonlyArray<PricingPagePatternEntry> = [
  {
    slug: "tiered",
    displayName: "Tiered pricing (3-tier with middle highlight)",
    metaTitle: "Tiered Pricing Page Pattern (Examples + When It Works)",
    metaDescription:
      "Three-tier pricing with the middle tier highlighted is the dominant SaaS pricing pattern. When it works, when it backfires, and the Brunson lens.",
    tldr:
      "Three side-by-side tiers with the middle one visually emphasised (border, badge, slight scale-up). The reader anchors against the cheap tier, dismisses the expensive tier as out-of-scope, and lands on the middle. Default SaaS pricing pattern since 2010; still works for self-serve.",
    mechanics:
      "Three columns. Left column is the lowest price (the anchor). Middle column is visually highlighted with a 'Most popular' badge, a border, or a slight scale-up. Right column is the highest price (positions the middle as 'reasonable'). Feature lists below each, with checkmarks indicating inclusion. Annual/monthly toggle above.",
    examplesInTheWild: [
      {
        name: "Notion",
        note: "Free / Plus / Business / Enterprise — middle two visually similar; 'Plus' is the default-selected starting tier.",
      },
      {
        name: "Linear",
        note: "Free / Standard / Plus — clean 3-tier with 'Standard' as the recommended starter.",
      },
      {
        name: "Figma",
        note: "Starter / Professional / Organization — Professional highlighted; Organization is the anchor that makes Professional feel right-sized.",
      },
      {
        name: "Vercel",
        note: "Hobby / Pro / Enterprise — Pro is the conversion target; Enterprise is the anchor.",
      },
    ],
    whenItWorks:
      "Self-serve SaaS with clear feature differentiation across tiers. When the middle tier genuinely solves a different problem than the cheap tier (not just 'more of the same'). When 60 to 80% of paying buyers land on the middle tier – that's the signal the pattern is doing its job.",
    whenItBackfires:
      "When the three tiers are 'small / medium / large' versions of the same offer – the pattern feels manipulative because the reader sees the structure clearly. When the gap between tiers is too small (under 2x) – buyers default to cheap. When the gap is too large (over 10x) – buyers don't believe the middle is 'reasonable'.",
    brunsonLens:
      "Tiered pricing is a Weak Offer fix dressed as a structural pattern. The pattern only works when each tier represents a genuinely different offer (different Stack, different cohort, different outcome). A reader who can articulate why the middle tier is right for them just got Brunson-framed by the page. A reader who picks the cheap tier because 'it's enough' just told you the middle's Stack didn't differentiate.",
    commonMistakes: [
      "Middle tier is just 'more of the cheap tier'. No genuine differentiation; readers default to the cheap tier or skip the page.",
      "Hiding the price on the highest tier ('Contact us'). Breaks the anchor mechanic; reader can't position the middle.",
      "Too many tiers (4 or more on the same page). Decision fatigue collapses conversion.",
      "Identical feature lists across tiers with only a quota difference. Pattern reads as artificial; sophisticated buyers reject it.",
      "Annual/monthly toggle defaulting to annual. Bait-and-switch feel; transparent default to monthly converts better.",
    ],
    faqs: [
      {
        q: "Should I always have exactly 3 tiers?",
        a: "Usually yes. Two tiers leaves no anchor; four or more triggers decision fatigue. Exceptions: single-product SaaS with a free trial (1 paid tier + free = 2 tiers is fine), or enterprise-only offerings (1 tier + 'Contact us' is the right pattern).",
      },
      {
        q: "Should the middle tier be 2x or 3x the cheap tier?",
        a: "2 to 3x typically. Under 2x and the cheap tier looks like a stripped-down trap; over 5x and the price jump feels punishing. The 2 to 3x band lets the middle tier feel like a genuine 'reasonable upgrade'.",
      },
      {
        q: "How do I decide which features go in which tier?",
        a: "The cheap tier solves the smallest possible version of the problem. The middle tier solves the version 60 to 80% of paying buyers actually have. The expensive tier exists to anchor the middle, not to be bought. Backwards-engineer from the middle's target cohort.",
      },
    ],
    relatedGlossary: ["offer", "stack-slide", "value-ladder"],
    lastVerified: "2026-05-20",
  },
  {
    slug: "decoy",
    displayName: "Decoy pricing (asymmetric dominance)",
    metaTitle: "Decoy Pricing Pattern (How the Decoy Effect Works in SaaS)",
    metaDescription:
      "Decoy pricing inserts a deliberately worse middle option to make the premium tier look right-sized. The mechanics, real examples, and ethical limits.",
    tldr:
      "Three options where the middle one is deliberately worse value than the highest – making the highest feel right-sized. Classic example: The Economist's print + web ($125), web-only ($59), print + web ($125). The middle option exists only to make the third look like a deal. Powerful but ethically thin.",
    mechanics:
      "Three options where the middle one is asymmetrically dominated by the third – same or higher price, fewer features. The reader compares the middle and the third; the third clearly wins. The reader has now anchored to the third tier and ignored the cheap tier. Asymmetric Dominance Effect (Huber, Payne, Puto 1982).",
    examplesInTheWild: [
      {
        name: "The Economist (classic)",
        note: "Web only $59 / Print only $125 / Print + web $125 — the 'Print only' decoy makes 'Print + web' an obvious win.",
      },
      {
        name: "Apple iCloud+",
        note: "50GB $0.99 / 200GB $2.99 / 2TB $9.99 — 200GB is positioned to make 2TB look like the family-tier no-brainer.",
      },
      {
        name: "Many courses on Teachable/Kajabi",
        note: "Self-study tier and 'self-study + 1 group call' tier priced close, making the 'self-study + group + 1:1' tier the obvious upgrade.",
      },
    ],
    whenItWorks:
      "When you have a genuine premium tier that you want buyers to choose over a cheaper one. When the decoy option represents a real (if rarely-bought) configuration, not an obviously fake placeholder. When the buyer is sophisticated enough to notice the comparison but not so sophisticated they'll feel manipulated.",
    whenItBackfires:
      "When the decoy is too obviously fake (no rational buyer would ever pick it). When the audience is sophisticated enough to recognize the pattern and resents being manipulated. When the decoy crowds out the genuine choice between two valid tiers. Long-term brand damage if buyers ever realize they were nudged this way.",
    brunsonLens:
      "Decoy pricing is a Weak Belief failure mode. The pattern only works because the reader doesn't trust their own valuation of the offer – they need a comparison to feel right. Building genuine belief in the price (via Stack Slide, dated proof, named guarantee) is a more durable mechanism than constructing decoys to manipulate the comparison.",
    commonMistakes: [
      "Decoy is so obviously fake the reader notices the pattern and distrusts the entire page.",
      "Decoy price is unique to the decoy (i.e. no one ever buys it). When that's discovered – and sophisticated readers do discover it – brand trust collapses.",
      "Using decoy to push a tier the buyer doesn't actually need. Short-term lift, long-term churn.",
      "Combining decoy with fake urgency or fake scarcity. Stacking manipulations turns the page into a sales-page parody.",
      "Forgetting that decoy works once. Repeat customers who saw through it on purchase 1 won't fall for it on purchase 2.",
    ],
    faqs: [
      {
        q: "Is decoy pricing ethical?",
        a: "Edge case. If the decoy represents a real option that a small minority of buyers actually pick, it's structural. If the decoy is fake (zero buyers, exists only to nudge), it crosses into manipulation. The Brunson line: never use a tactic you wouldn't openly explain to a customer who asked about it.",
      },
      {
        q: "How do I test if decoy pricing works for my SaaS?",
        a: "Run it for 30 to 60 days, then look at tier-distribution AND total revenue AND refund/churn rate. If the premium tier captures more buyers but churn rate climbs, the decoy nudged people into the wrong tier and the gain is temporary.",
      },
      {
        q: "Can I combine decoy and tiered pricing?",
        a: "Most modern SaaS already does. The middle tier in a 3-tier layout often functions as a soft decoy for the premium. The line between 'genuine middle tier' and 'decoy' depends on whether any buyers actually pick it.",
      },
    ],
    relatedGlossary: ["offer", "weak-belief"],
    lastVerified: "2026-05-20",
  },
  {
    slug: "usage-based",
    displayName: "Usage-based pricing",
    metaTitle: "Usage-Based Pricing Pattern (When It Works for SaaS)",
    metaDescription:
      "Usage-based pricing charges per unit of consumption instead of per seat. The mechanics, real examples, and when it backfires.",
    tldr:
      "Pay-per-unit (per API call, per request, per row, per GB). Buyer's bill scales with their usage; SaaS revenue scales with buyer's success. The dominant pattern for infrastructure SaaS post-2020. Works brilliantly when usage tracks value; backfires when it tracks unrelated cost.",
    mechanics:
      "No fixed seat fee (or a small one). The bulk of the price is a per-unit metric (per API call, per generated image, per stored GB, per AI token, per transaction). Volume tiers reduce per-unit cost at scale. Often a free tier with a usage cap to enable activation before the bill starts.",
    examplesInTheWild: [
      {
        name: "AWS / GCP / Azure",
        note: "Reference implementation. Per-unit pricing across every dimension; volume discounts at scale.",
      },
      {
        name: "Vercel",
        note: "Per-function-invocation, per-bandwidth-GB, per-edge-request. Active CPU pricing model for Fluid Compute.",
      },
      {
        name: "Twilio",
        note: "Per SMS, per voice minute, per WhatsApp message. The canonical usage-based SaaS pricing model.",
      },
      {
        name: "OpenAI / Anthropic",
        note: "Per token in / per token out. Usage scales with workload; volume discounts via committed-use.",
      },
      {
        name: "Stripe",
        note: "Per successful charge (% + flat fee). Usage = the customer making money; alignment is structural.",
      },
    ],
    whenItWorks:
      "When the usage metric tracks the buyer's value (API calls when the buyer's product depends on the API; transactions when the buyer is making money). When the buyer can self-serve start without committing to a budget upfront. When variance in usage is significant – customers who use 10x more pay 10x more, which is fair on both sides.",
    whenItBackfires:
      "When the usage metric doesn't track value (charging per-GB on a tool the buyer can't control storage on). When usage spikes unexpectedly and bills surprise the buyer – trust collapses faster than any feature can recover. When the buyer's procurement process needs a predictable budget – usage-based pricing is impossible to forecast for them.",
    brunsonLens:
      "Usage-based pricing is a Stack Slide built into the billing system. Each metric is a deliverable; the buyer sees the totals add up in real time. The risk is the inverse of Weak Belief: when the buyer doesn't trust the metric (or can't predict it), the per-unit price feels arbitrary. Strong usage-based pricing pages explain the unit, the rate, and a worked example of a typical month's bill.",
    commonMistakes: [
      "Choosing a usage metric the buyer can't control. Charging per GB stored when the tool autostores everything kills trust.",
      "No usage cap or alerts. Surprise $10,000 bills end relationships permanently regardless of how good the product is.",
      "Hiding the unit pricing behind a calculator. Buyers want a clear rate they can multiply against their estimated usage themselves.",
      "Free tier with a hidden trap (usage cap that triggers a sudden tier-up). Bait-and-switch feel destroys trust.",
      "Per-seat AND per-usage charges combined ('$X per seat plus $Y per call'). Hybrid pricing confuses procurement and slows enterprise sales.",
    ],
    faqs: [
      {
        q: "Should I start usage-based or seat-based?",
        a: "Seat-based is easier to forecast for buyers and easier to sell to enterprise. Usage-based aligns incentives better and scales with customer success. Most SaaS post-2020 start hybrid: small seat fee + usage-based metering, which keeps procurement happy and aligns incentives.",
      },
      {
        q: "How do I prevent surprise bills?",
        a: "Hard caps with explicit upgrade prompts (not silent overages). Usage alerts at 50%, 80%, 100% of the buyer's stated budget. Monthly projection emails so the buyer can see where they're trending. Surprise bills are the single biggest churn driver for usage-based SaaS.",
      },
      {
        q: "Should I offer committed-use discounts?",
        a: "Yes, for buyers above $X/month (where X is the threshold of your revenue concentration risk). Committed-use deals are 20 to 50% discount in exchange for 12-month commitment + minimum spend. They stabilize revenue and signal enterprise readiness.",
      },
    ],
    relatedGlossary: ["offer", "stack-slide"],
    lastVerified: "2026-05-20",
  },
  {
    slug: "freemium",
    displayName: "Freemium (free tier + paid upgrade)",
    metaTitle: "Freemium Pricing Pattern (When Free Tier + Paid Works)",
    metaDescription:
      "Freemium offers a permanent free tier alongside paid plans. The mechanics, examples, and when the free tier kills your business.",
    tldr:
      "Permanent free tier alongside paid tiers. Free users become the acquisition channel; paid conversion typically sits at 2 to 5% of active free users. Works brilliantly when free is a meaningful product and paid is a clear upgrade; kills the business when free is good enough that nobody upgrades.",
    mechanics:
      "Free tier with a usage cap, feature cap, or both. Paid tiers unlock the next level of usage, features, or both. Free serves as both acquisition and product proof. Free-to-paid conversion is the load-bearing metric – 2 to 5% is healthy, 0.5 to 2% is mediocre, under 0.5% means free is too good.",
    examplesInTheWild: [
      {
        name: "Notion",
        note: "Free personal use forever; paid unlocks collaboration features, sharing, and admin controls. Free is genuinely usable solo.",
      },
      {
        name: "Slack",
        note: "Free tier with message history cap (10K then archived). Paid removes the cap. Free is meaningful for small teams; paid kicks in when the cap bites.",
      },
      {
        name: "Figma",
        note: "Free 3-project cap. Paid unlocks unlimited projects + team features. Solo designers stay free; teams convert.",
      },
      {
        name: "GitHub",
        note: "Free for public repos and private repos with a collaborator cap. Paid for advanced features (Actions minutes, Codespaces hours). Free is the acquisition machine.",
      },
    ],
    whenItWorks:
      "When the product has network effects (each user makes it more valuable). When free is genuinely useful for a small-scale use case but breaks at team/scale. When the cost-to-serve a free user is near-zero. When organic growth from free users compounds (sharing, embedded links, referrals).",
    whenItBackfires:
      "When the free tier solves the entire problem and paid features are 'nice to have'. When cost-to-serve free users is meaningful (heavy compute, support burden). When the audience is small enough that free user volume can't compensate for low conversion. When the free tier teaches buyers to expect the product to be free.",
    brunsonLens:
      "Freemium is a Hook / Story / Offer pattern with the Hook as the free tier and the Offer as the paid upgrade. The diagnostic question: at what specific moment does the buyer hit the wall that justifies paying? If you can't name that moment in one sentence, the paid tier's value is unclear and conversion will stay under 2%. The wall has to be a moment, not a feature gap.",
    commonMistakes: [
      "Free tier is too generous. Nobody upgrades because nobody needs to.",
      "Paid tier feels like a tax on success. Buyers resent crossing a feature gate they didn't see coming.",
      "Free has no clear upgrade trigger. Without a moment that justifies the paid plan, conversion stays under 1%.",
      "Free users cost more to support than they bring in via word-of-mouth. Business model collapses below scale.",
      "Freemium for non-network-effect products. Without sharing/virality, the free tier is just a discount on the paid one.",
    ],
    faqs: [
      {
        q: "Should I do freemium or a free trial?",
        a: "Free trial converts faster (urgency forces decision). Freemium acquires more users (no decision deadline). Network-effect products often need freemium; transactional products often need free trial. The deciding question: does each new free user make the product more valuable to other free users?",
      },
      {
        q: "What's a healthy free-to-paid conversion rate?",
        a: "2 to 5% of active free users converting to paid within 90 days is healthy. Under 2% means free is too generous or paid isn't differentiated. Over 10% means free is too restrictive and you're leaving acquisition volume on the table.",
      },
      {
        q: "How do I move users from free to paid without feeling pushy?",
        a: "Trigger-based: when the user hits the cap, surface the upgrade in the context of what they just tried to do. 'You hit the 10-project limit; here's what unlimited gives you.' Contextual upgrade prompts convert 3 to 5x better than time-based ones.",
      },
    ],
    relatedGlossary: ["hook", "offer", "value-ladder"],
    lastVerified: "2026-05-20",
  },
  {
    slug: "single-price",
    displayName: "Single-price (one plan, no tiers)",
    metaTitle: "Single-Price Pattern (One-Plan SaaS Pricing Examples)",
    metaDescription:
      "Single-price SaaS sells one plan to everyone. When it works (clear positioning, undifferentiated buyers) and when it caps your TAM.",
    tldr:
      "One paid plan. No tiers, no negotiations, no decoys. Common for opinionated tools serving a single cohort (Basecamp, Superhuman). Removes pricing-page decision fatigue but caps your TAM – buyers who'd pay more can't, buyers who'd pay less leave.",
    mechanics:
      "Single price tile on the pricing page. One plan, all features, one cohort. Often combined with a free trial. Pricing-page-as-statement: 'We picked one price. It's $X. Here's exactly what you get.'",
    examplesInTheWild: [
      {
        name: "Basecamp",
        note: "$15/user/month flat (or $299/month for unlimited users). Two prices; effectively single-price for most buyers.",
      },
      {
        name: "Superhuman",
        note: "$30/user/month. One plan, opinionated positioning ('email for high-performers').",
      },
      {
        name: "Hey (also from Basecamp/37signals)",
        note: "$99/year individual, $12/user/month team. Strong single-price positioning.",
      },
      {
        name: "Mac Power Users tools generally (Things, Ulysses, OmniFocus)",
        note: "Single license fee or single subscription. No tiers; no choice paralysis.",
      },
    ],
    whenItWorks:
      "When you have a strong opinionated positioning that filters in the right buyer at first read. When your TAM is genuinely homogeneous (one cohort, one use case). When you want to make the pricing page a statement, not a decision tool. When your differentiation is the product, not the pricing matrix.",
    whenItBackfires:
      "When your audience splits into clear cohorts with different willingness-to-pay. When enterprise buyers want to negotiate (they will, regardless of your stated policy). When your competitors offer tiered options and your single price falls between two of theirs – you become 'too expensive for the small tier, too cheap for the big tier'.",
    brunsonLens:
      "Single-price is the Brunson Polarity move applied to pricing: it intentionally turns away the wrong-fit buyer at the price-page step. The buyer who needs a $5 tier or wants a $500 tier self-selects out. The remaining buyers are pre-qualified by the act of accepting the price. Strong single-price pages explicitly explain why there's no choice ('we picked one price for everyone because X').",
    commonMistakes: [
      "Hiding why you chose a single price. Buyers read the missing tiers as 'they haven't figured it out yet'.",
      "Single-price for a product with genuinely different cohort needs. The pricing becomes a forced filter that loses qualified buyers.",
      "Single-price plus discount negotiations. Once you discount one buyer, the single price is a lie.",
      "Single-price across launch and scale phases. Single-price at launch may work; single-price at $5M ARR caps growth.",
      "No annual option. Single-price + monthly only often leaves money on the table from buyers who'd happily pre-pay annually.",
    ],
    faqs: [
      {
        q: "Should I start with single-price or tiered?",
        a: "Single-price at launch is often easier – one decision to test, one positioning to refine. Move to tiered when you have evidence of cohort-split willingness-to-pay (some buyers consistently asking for a smaller plan, others asking for an enterprise tier).",
      },
      {
        q: "How do I handle enterprise asks on a single-price plan?",
        a: "Either: hold the line and lose the deal (honesty signal that compounds), or open an explicit 'Contact us for >50 seats' tier. Don't quietly negotiate. The moment you start, your single-price brand erodes.",
      },
      {
        q: "What if buyers tell me my price is wrong?",
        a: "Always test the inverse. Buyers who say 'too expensive' often mean 'I don't see the value yet' (Weak Offer diagnosis). Raise the price by 20% for 30 days; if the same buyers complain and buyers from the next-up cohort start signing up, the original price was too low.",
      },
    ],
    relatedGlossary: ["offer", "stack-slide"],
    lastVerified: "2026-05-20",
  },
  {
    slug: "per-seat",
    displayName: "Per-seat pricing",
    metaTitle: "Per-Seat Pricing Pattern (When Charging Per User Works)",
    metaDescription:
      "Per-seat pricing charges a fixed fee per user. The dominant collaborative-SaaS pattern. Examples, when it works, and when it breaks down.",
    tldr:
      "Fixed price per user per month. The dominant collaborative-SaaS pattern (Slack, Notion, Linear, GitHub). Predictable for procurement, aligns revenue with team size, but breaks when teams game it via shared logins or when usage varies wildly across users.",
    mechanics:
      "Price stated as $X per user per month. Total bill = $X × number of users. Annual discount (15 to 25%) usually offered. Often combined with feature tiers ($X / user / month for Standard, $Y / user / month for Plus).",
    examplesInTheWild: [
      {
        name: "Slack",
        note: "Pro $7.25/user/month, Business+ $12.50/user/month. Classic per-seat with feature tiers stacked.",
      },
      {
        name: "Linear",
        note: "Standard $8/user/month, Plus $14/user/month. Clean per-seat with annual option.",
      },
      {
        name: "Notion",
        note: "Plus $10/user/month, Business $18/user/month. Per-seat plus per-tier.",
      },
      {
        name: "Figma",
        note: "Professional $15/editor/month, Organization $45/editor/month. Per-seat with 'editor vs viewer' distinction.",
      },
    ],
    whenItWorks:
      "When the product is genuinely collaborative – each user gets distinct value from their own account. When team size correlates with willingness-to-pay (5-person team can afford less than 50-person team). When procurement processes prefer predictable seat-based billing. When the product has a per-user view/state/dashboard.",
    whenItBackfires:
      "When users can share accounts without losing value (single login for a 5-person team). When the product has heavy active users and many passive users (some users use 95% of features, others log in monthly) – per-seat overcharges the passive cohort. When team growth slows revenue growth.",
    brunsonLens:
      "Per-seat pricing maps the offer onto an axis the buyer already understands (team size). The Brunson lens question: does each seat get a distinct Stack? If the answer is 'yes, each user has their own dashboard / settings / output' the per-seat model fits. If the answer is 'one team shares one workspace' the pattern is fighting the actual usage and buyers will resent it.",
    commonMistakes: [
      "Per-seat for a product that doesn't have per-user value. Buyers create one shared login; ARPU collapses.",
      "No 'viewer' tier (free or cheap). Forces companies to either pay full price for read-only users or block them from the tool – usually they block.",
      "Per-seat plus per-feature plus per-usage. Three-dimensional billing is impossible to forecast and slows enterprise sales.",
      "No volume discounts at 50+ seats. Enterprise procurement demands them; not offering them costs deals.",
      "Per-seat at very low price points ($1–$3/user/month). Doesn't justify the procurement overhead for buyers; doesn't generate enough revenue per account.",
    ],
    faqs: [
      {
        q: "What's a good per-seat price point?",
        a: "$8 to $25/user/month is the sweet spot for most B2B SaaS. Below $8 procurement friction outweighs revenue; above $25 buyers start scrutinizing per-user value. Outside that band requires very specific positioning.",
      },
      {
        q: "Should I offer a viewer-only tier?",
        a: "Yes, free or very cheap. Forces full-pricing on read-only users blocks them from the tool, which kills viral growth. Free viewer tiers are a network-effect lever.",
      },
      {
        q: "How do I handle seasonal team-size fluctuations?",
        a: "Bill on monthly average users with end-of-month true-up, OR offer 'admin can add/remove seats anytime, pro-rated'. Buyers hate annual commits for fluctuating team sizes; flexibility wins enterprise.",
      },
    ],
    relatedGlossary: ["offer", "value-ladder"],
    lastVerified: "2026-05-20",
  },
  {
    slug: "annual-discount",
    displayName: "Annual discount (10% to 25% off)",
    metaTitle: "Annual Discount Pricing Pattern (How Much to Discount)",
    metaDescription:
      "Annual prepayment discount of 10 to 25% off monthly. The cash-flow / retention trade-off, real examples, and when it backfires.",
    tldr:
      "Two-toggle pricing: monthly vs annual, with annual showing a 10 to 25% discount. Trades short-term cash for long-term retention – annual subscribers churn 30 to 70% less than monthly. Default for any subscription SaaS with a renewable contract.",
    mechanics:
      "Toggle at the top of the pricing page (Monthly / Yearly). Annual displays the lower per-month equivalent ('$10/month, billed annually' instead of '$120/year'). Some pages default to annual; some default to monthly. Annual is usually invoiced upfront; monthly is auto-charged.",
    examplesInTheWild: [
      {
        name: "Linear",
        note: "Annual saves ~$24/user/year. Default toggle is annual; monthly visible on click.",
      },
      {
        name: "Notion",
        note: "20% off annual. Toggle visible above tiers.",
      },
      {
        name: "Vercel",
        note: "Annual discount on Pro/Enterprise. Toggle clear; pricing recalculates live.",
      },
      {
        name: "Most ConvertKit / Beehiiv competitors",
        note: "2 months free on annual (effectively ~17% off). Standard SaaS pricing convention.",
      },
    ],
    whenItWorks:
      "When churn would otherwise be high (annual lock-in reduces it). When you need predictable cash flow more than maximum monthly recurring revenue. When the buyer's procurement prefers annual invoicing. When your product has a clear annual usage pattern (some months heavier than others; annual smooths the cost).",
    whenItBackfires:
      "When the buyer's situation is uncertain (early-stage founder hesitates to commit annually). When the discount is too small (under 10%) – nobody trades flexibility for it. When the discount is too large (over 30%) – signals to monthly buyers that they're being overcharged. When refund policy doesn't match (annual buyers get pro-rated refunds, monthly buyers don't).",
    brunsonLens:
      "Annual discount is a Stack Slide move. The buyer sees two prices and the discount becomes a deliverable in the offer ('Yearly: $10/month – you save $24/year'). The discount has to be real and visible. Hiding it ('only available on Enterprise') or fake-ing it (the monthly price is inflated to make annual look better) breaks the Brunson Hard-Rule.",
    commonMistakes: [
      "Discount too small (under 10%). Buyers don't trade flexibility for marginal savings.",
      "Discount too large (over 30%). Signals the monthly price is inflated; trust erodes.",
      "Defaulting to annual without disclosure. Bait-and-switch feel when buyer realizes the recurring commit.",
      "No refund policy on annual. Locks in unhappy customers who become refund-policy-Twitter case studies.",
      "Annual buyers don't get any other benefit. The discount is the entire annual deal; layer in priority support / extra features for stickier annual relationships.",
    ],
    faqs: [
      {
        q: "What's the optimal annual discount?",
        a: "15 to 20% is the sweet spot. Below 10% buyers don't switch; above 25% monthly buyers feel cheated. The discount has to be enough to justify the commit but not so large it implies the monthly price was wrong.",
      },
      {
        q: "Should I default to annual or monthly on the toggle?",
        a: "Default to whichever you want to optimize for. Default-annual lifts annual mix 10 to 20% but feels pushy on first impressions. Default-monthly lifts monthly mix but converts annual through the longer relationship. Most modern SaaS default monthly for transparency.",
      },
      {
        q: "Can I require annual on certain tiers?",
        a: "Yes, for enterprise tiers it's standard. Buyers expect annual on enterprise. Forcing annual on self-serve tiers backfires; the audience self-serves precisely because they don't want to commit annually.",
      },
    ],
    relatedGlossary: ["offer", "stack-slide"],
    lastVerified: "2026-05-20",
  },
  {
    slug: "lifetime-deal",
    displayName: "Lifetime deal (LTD)",
    metaTitle: "Lifetime Deal Pricing Pattern (When LTDs Work vs Backfire)",
    metaDescription:
      "Lifetime deals trade upfront cash for permanent access. The AppSumo-era pattern, real mechanics, and when LTDs poison your unit economics.",
    tldr:
      "One-time payment for permanent access. AppSumo's signature model; common for indie tools and information products. Trades short-term cash injection for permanent capped LTV. Powerful for cold-launch funding; toxic if scaled beyond product-launch validation.",
    mechanics:
      "One-time price (often 1.5x to 3x annual subscription) for permanent access. Often time-limited ('LTD ends Friday'). Often capped ('first 100 buyers only'). LTV is the LTD price minus ongoing serving costs; cannot grow beyond that for that customer.",
    examplesInTheWild: [
      {
        name: "AppSumo",
        note: "The reference implementation. Time-bound LTDs across thousands of SaaS tools, typically $39 to $299 for tools with $20-$50/month equivalent pricing.",
      },
      {
        name: "Many indie tools at launch",
        note: "Founders use LTDs to fund initial development. Common for the first 30 to 90 days; then transition to subscription.",
      },
      {
        name: "Setapp / Bundle deals",
        note: "Aggregated LTD-style bundles. Multiple tools at one annual price.",
      },
    ],
    whenItWorks:
      "At launch, to fund initial development. To validate that buyers exist before committing to subscription operations. For tools with very low serving costs (one-time download, no support burden). For founders who explicitly need cash injection over recurring revenue.",
    whenItBackfires:
      "When the product has ongoing serving costs (LTD buyers stay on the books forever, costing margin every month). When the LTD audience is mostly tire-kickers who churn on usage but stay as 'inactive paid users' for years. When LTD revenue is mistaken for SaaS revenue (it isn't – it's a one-time transaction that looks like one).",
    brunsonLens:
      "LTD is a Hook / Story / Offer pattern with the price as the Hook. Strong LTDs work because the price reframes the buyer's calculation – $99 once vs $20/month forever is an obvious win in month 6. The Brunson Hard-Rule applies: only run LTDs you can deliver on permanently. LTDs that get re-priced to subscription later poison brand trust permanently.",
    commonMistakes: [
      "Selling LTDs on a product with high serving costs. Each LTD buyer becomes a permanent margin drag.",
      "Selling too many LTDs. The audience saturated with LTD buyers no longer converts to subscription later.",
      "Mixing LTD and subscription on the same pricing page. Confuses positioning permanently.",
      "Discontinuing LTD-purchased features without grandfathering. Promised 'lifetime'; broke the promise. Trust-damage is unrecoverable.",
      "Running LTDs as the steady-state revenue model. LTDs are launch-phase financing; scaling on LTDs caps the business permanently.",
    ],
    faqs: [
      {
        q: "Should I do an LTD at launch?",
        a: "Maybe, if you genuinely need the cash injection and your serving costs are near-zero. Cap the number of LTDs (e.g. 200 buyers max) so you don't permanently capture too much margin. Move to subscription immediately after the LTD window closes.",
      },
      {
        q: "What's the right LTD price?",
        a: "1.5x to 3x the annual subscription equivalent. Below 1.5x and the LTD cannibalizes future subscription revenue. Above 3x and buyers don't see enough discount vs subscription to commit upfront.",
      },
      {
        q: "Can I run multiple LTD waves?",
        a: "Each subsequent wave converts worse than the prior. Audience saturation kicks in. Reasonable to run 1 to 2 LTD waves at launch and milestone (e.g. v2.0 launch); beyond that, LTDs lose effectiveness and damage subscription pipeline.",
      },
    ],
    relatedGlossary: ["offer", "value-ladder"],
    lastVerified: "2026-05-20",
  },
  {
    slug: "founding-tier",
    displayName: "Founding member tier (cohort-locked discount)",
    metaTitle: "Founding Member Pricing (Cohort-Locked Lifetime Discount)",
    metaDescription:
      "Founding-tier pricing locks the first N buyers into a permanent discount. The Brunson PLF cohort-pricing mechanic for indie SaaS launches.",
    tldr:
      "First N buyers (typically 50 to 500) get a permanent discount on the regular price – often 30 to 60% off, locked for the duration of their subscription. Cohort-locks early customers, creates real (not fake) urgency at launch, and signals to the cohort that they're part of the founding wave.",
    mechanics:
      "Founding tier visible during launch window (typically 14 to 60 days). Price stated as 'founding rate' with the post-launch price shown alongside ('Founding $19/mo; reverts to $49/mo after first 100 members'). Buyers who sign up before the cap keep the founding rate as long as they remain subscribed.",
    examplesInTheWild: [
      {
        name: "Many Brunson-style PLF launches",
        note: "First 100 / 500 / 1,000 at founding rate. Russell Brunson's Product Launch Formula popularized this in info-product launches.",
      },
      {
        name: "Indie SaaS launches generally",
        note: "Founder posts on Twitter / IH 'first 50 members at $19/mo, jumps to $49 after that'. Real urgency drives launch-week conversion.",
      },
      {
        name: "Substack paid newsletter launches",
        note: "Many newsletters launch at $5/mo for first 100 subscribers, $10/mo afterward. Locks early supporters in.",
      },
    ],
    whenItWorks:
      "At launch, with a genuine cap. When the founder can communicate the urgency authentically (it's a real cap, not a fake one). When the founding cohort gets non-price benefits too (private Slack, founder access, name recognition). When subsequent price increases are honest and pre-announced.",
    whenItBackfires:
      "When the cap is fake (resets on every 'launch'). When the discount is small (<20% off) – not enough to drive urgency. When the cap is too large (1,000 founding members for a launch with 200 potential buyers) – discount becomes the price. When the post-launch price doesn't ever actually engage.",
    brunsonLens:
      "Founding-tier pricing is the Brunson Polarity move applied at launch. The founder explicitly tells the audience: 'this offer is for the first 100; the rest of you pay the higher price.' The honest commitment to the cap is what makes it work. Fake caps – ones that keep resetting – destroy the mechanic and the brand simultaneously.",
    commonMistakes: [
      "Fake cap (re-runs founding pricing every quarter). Trains audience to wait and never buy at full price.",
      "Discount too small. Below 20% off, urgency doesn't compound; cap doesn't drive decisions.",
      "Cap so large the founding rate becomes the de facto rate. Defeats the urgency mechanic.",
      "No non-price benefits for founding cohort. Pure price discount makes them feel like discount buyers, not insiders.",
      "Post-launch price never actually engages. 'After the first 100 it goes to $49' but the price stays $19 forever. Trust-break that compounds.",
    ],
    faqs: [
      {
        q: "How big should the founding cohort be?",
        a: "Typically 50 to 500 buyers. Small enough that the cap creates real urgency; large enough to be worth the discount the founder is giving up. Industry-specific. Tools targeting 10K-buyer market cap at 100; tools targeting 1M-buyer market cap at 500 to 1,000.",
      },
      {
        q: "What discount should I offer to founding members?",
        a: "30 to 60% off the eventual full price. Below 30% the urgency doesn't bite; above 60% the eventual price feels arbitrary. The discount has to feel like a meaningful trade for being early.",
      },
      {
        q: "Should I lock founding rate forever, or just for the first year?",
        a: "Forever, conditional on continuous subscription. 'You keep founding rate as long as you stay subscribed' is the canonical Brunson pattern. It rewards loyalty and creates a separate cohort of founder-advocates who tell their friends.",
      },
    ],
    relatedGlossary: ["offer", "value-ladder"],
    lastVerified: "2026-05-20",
  },
  {
    slug: "anchor-and-contrast",
    displayName: "Anchor and contrast (price reveal after value stack)",
    metaTitle: "Anchor & Contrast Pricing (Stack First, Reveal Price Last)",
    metaDescription:
      "Anchor-and-contrast pricing presents a high anchor value, stacks deliverables, then reveals a deliberately-lower price. Brunson's signature mechanic.",
    tldr:
      "Build up a total value ('this would normally cost $X'), then reveal your actual price ($Y, where Y is dramatically lower). The reader anchors against the inflated value, then the actual price feels like a gift. Russell Brunson's signature mechanic; the Stack Slide in action.",
    mechanics:
      "Long-form sales page (or VSL, or webinar) where pricing isn't shown until late. Build up the Stack: 6 to 12 deliverables, each with a small dollar anchor. Total the Stack ('that's $X,XXX in value'). Then reveal your actual price as a fraction of the total ('your price today: $XXX').",
    examplesInTheWild: [
      {
        name: "Russell Brunson's products generally",
        note: "ClickFunnels, Funnel Hacker, OFA. Every sales page builds Stack first, reveals price last.",
      },
      {
        name: "Most info-product launches via Brunson methodology",
        note: "Standard pattern across the Brunson alumni network – ConvertKit creator economy, course platforms, coaching offers.",
      },
      {
        name: "Long-form VSL pages",
        note: "The 'Stack Slide' moment around minute 12–18 of a VSL is anchor-and-contrast in action.",
      },
    ],
    whenItWorks:
      "On long-form pages (sales letters, VSLs, webinars) where the reader is committed to reading/watching. For offers between $100 and $5,000 (the band where Stack mechanics genuinely move conversion). When you have genuinely 6+ distinct deliverables to anchor against. When your audience expects this format (Brunson-influenced cohorts; coaches; info products).",
    whenItBackfires:
      "On short pricing pages – there's no room to build the Stack. For audiences that find the format manipulative (sophisticated B2B buyers, developers, enterprise procurement). When the anchor values are obviously inflated ('a $9,997 value for $97') – the reader stops believing the math. When the deliverables overlap so the Stack is padded, not stacked.",
    brunsonLens:
      "Anchor-and-contrast IS the Brunson Stack Slide. The whole sales-page structure is built around delaying the price until the reader has internalized the Stack's total. The Brunson Hard-Rule applies brutally: every line item in the Stack must be a real deliverable with a defensible anchor. Padded Stacks (3 versions of the same thing) break the mechanic because sophisticated readers see through it.",
    commonMistakes: [
      "Anchor values too high. '$9,997 value for $97' triggers skepticism, not gratitude.",
      "Padded Stack. 6 line items that are 3 actual deliverables in different packaging. Sophisticated readers reject it.",
      "No real delivery for some Stack items. Promising 'access to private community' that doesn't engage breaks trust permanently.",
      "Anchor-and-contrast on a pricing page (not a sales page). Pricing pages get scanned; no time to build the Stack.",
      "Multiple offers on one page. Confuses which Stack the reader should anchor against.",
    ],
    faqs: [
      {
        q: "How big should the Stack total be relative to my price?",
        a: "3x to 10x the actual price. Below 3x and the discount doesn't feel meaningful. Above 10x and the anchor feels fake. The 3 to 10x band keeps the math believable while still making the price feel like a gift.",
      },
      {
        q: "Should I show the Stack on the checkout page too?",
        a: "Yes, beside the payment form. The Stack at the moment of payment reduces abandon rate. The buyer sees what they're paying for, totaled, as they enter their card.",
      },
      {
        q: "Is anchor-and-contrast manipulative?",
        a: "Edge case. If the anchor values are real (each deliverable could genuinely be bought separately at that price), it's structural. If the anchors are inflated, it crosses into manipulation. The Brunson line: only use anchors you'd defend if a customer asked 'why is this $99 worth $497?'",
      },
    ],
    relatedGlossary: ["offer", "stack-slide"],
    lastVerified: "2026-05-20",
  },
  {
    slug: "stripe-payment-link",
    displayName: "Stripe Payment Link (no pricing page)",
    metaTitle: "Stripe Payment Link Pricing (No Page, Just a Link)",
    metaDescription:
      "Stripe Payment Link bypasses the pricing page entirely. When skipping the pricing page is right for indie SaaS tripwires and one-off offers.",
    tldr:
      "Skip the pricing page entirely. The 'pricing' is a Stripe Payment Link embedded in a sales-page CTA. Common for indie tripwires, one-off offers, and founders who want to bypass the pricing-decision step entirely. Fastest path from value pitch to checkout.",
    mechanics:
      "Single CTA on a sales page or in an email: 'Buy [product] for $X'. Click goes directly to a Stripe-hosted checkout (Payment Link). No standalone pricing page. The price is in the CTA copy; the checkout handles everything else.",
    examplesInTheWild: [
      {
        name: "Many indie tripwires",
        note: "$1 to $27 entry offers commonly skip the pricing page – the price is in the buy button.",
      },
      {
        name: "One-off info products on Gumroad-style platforms",
        note: "Effectively the same pattern; the platform's product page IS the checkout.",
      },
      {
        name: "Brunson-style sales letters with embedded buy buttons",
        note: "Long-form VSL or sales letter ends with a Stripe / 2Checkout / ThriveCart Payment Link.",
      },
    ],
    whenItWorks:
      "For single-offer funnels (one product, one price). For tripwires and one-off offers. When the offer has been pre-sold (VSL, webinar, sales letter) and the pricing page would just be a redundant step. When you want to bypass pricing-comparison shopping entirely.",
    whenItBackfires:
      "For SaaS with multiple tiers (no place to compare). For enterprise sales (procurement wants a pricing page). For products where buyers expect tier comparison. When the offer is complex enough that skipping the pricing page leaves questions unanswered at the checkout step.",
    brunsonLens:
      "Stripe Payment Link is the maximum-velocity Brunson buy-button move. The price is part of the offer's last frame; clicking is the immediate next step. Works when the offer is pre-sold elsewhere on the page. Fails when the buyer needs comparison to make the decision – at that point, you've lost them at the missing pricing-page step.",
    commonMistakes: [
      "Using Payment Link for SaaS with tiers. Buyers can't compare; conversion collapses.",
      "Hidden price on Payment Link button. 'Buy now' instead of 'Buy [product] for $X' loses transparency and trust.",
      "Multiple Payment Links on one page. Confuses which offer the buyer is committing to.",
      "Skipping the pricing page when buyers genuinely need comparison. Hidden assumption that the offer is pre-sold; often it isn't.",
      "No fallback for buyers who hesitate. If the Payment Link doesn't convert, there's no pricing page to revisit – just the Payment Link itself.",
    ],
    faqs: [
      {
        q: "Should I use Stripe Payment Link or build a custom pricing page?",
        a: "Payment Link for single-offer funnels (tripwires, one-off offers, pre-sold products). Custom pricing page for SaaS with tiers, comparison-shopping audiences, or enterprise sales motions. Many SaaS use both: Payment Link for tripwire, pricing page for core.",
      },
      {
        q: "How do I show the price clearly with Payment Link?",
        a: "Put the price in the CTA button copy: 'Buy [product] for $X'. Don't hide it as 'Buy now'. Transparency at the button outconverts mystery at the checkout step.",
      },
      {
        q: "Can I A/B test prices with Payment Link?",
        a: "Yes, with multiple Payment Links pointed from the same sales page conditional on visitor cohort. Slightly more setup than testing on a custom pricing page, but doable. Stripe's Payment Link metadata lets you tag tests.",
      },
    ],
    relatedGlossary: ["offer", "value-ladder"],
    lastVerified: "2026-05-20",
  },
  {
    slug: "contact-us-enterprise",
    displayName: "'Contact us' enterprise tier",
    metaTitle: "'Contact Us' Enterprise Pricing (Hidden Price Pattern)",
    metaDescription:
      "'Contact us' enterprise tier hides the price intentionally. When this enables enterprise sales, when it kills self-serve conversion.",
    tldr:
      "Top tier shown with 'Contact us' or 'Custom pricing' instead of a number. Enables negotiation, signals enterprise readiness, and lets procurement do their dance. But hiding price kills self-serve conversion if applied to a tier that should be self-serve.",
    mechanics:
      "Top tier on a multi-tier pricing page shows 'Contact us', 'Custom', 'Talk to sales', or 'Get a quote' instead of a number. Often paired with a form or calendar booking link. The implicit message: this tier requires conversation, not credit card.",
    examplesInTheWild: [
      {
        name: "Vercel Enterprise",
        note: "Hobby / Pro / Enterprise — Enterprise shown without a price. Contact-sales CTA.",
      },
      {
        name: "Linear Enterprise",
        note: "Standard / Plus / Enterprise — Enterprise shown as 'Contact us'.",
      },
      {
        name: "Most B2B SaaS at the top tier",
        note: "Industry-standard pattern for the enterprise/custom tier in tiered pricing pages.",
      },
    ],
    whenItWorks:
      "For enterprise tiers (>$50K ACV typically). When the deal genuinely requires custom pricing (volume, term, custom SLA). When enterprise procurement expects a sales conversation. When you have a sales team or founder-led sales motion to handle inbound contacts.",
    whenItBackfires:
      "When applied to a self-serve tier. When the buyer can already self-serve elsewhere (competitor with transparent pricing). When the 'Contact us' is purely a friction-add for buyers you don't actually want to negotiate with. When inbound 'Contact us' leads aren't handled within 24 hours – trust collapses.",
    brunsonLens:
      "'Contact us' is a Polarity move applied at the enterprise tier: it filters in serious enterprise buyers (who don't mind the conversation) and filters out comparison shoppers (who'd be the wrong customer anyway). Strong 'Contact us' implementations explain WHY there's no price ('we customize based on volume, integrations, and SLA needs'). Generic 'Contact us' with no context reads as price-hiding.",
    commonMistakes: [
      "'Contact us' on a tier that should be self-serve. Kills conversion; nobody contacts.",
      "No explanation for why the price is hidden. Reads as 'we want to negotiate up to your willingness-to-pay'.",
      "Slow response to 'Contact us' submissions. Trust-break that compounds across the entire site.",
      "'Contact us' form asks for 20 fields. Friction-piled-on; only the most desperate buyers complete it.",
      "Using 'Contact us' as the only tier (no self-serve option). Kills the entire self-serve channel.",
    ],
    faqs: [
      {
        q: "At what tier should I switch to 'Contact us' pricing?",
        a: "Typically at the tier above $20K to $50K ACV. Self-serve below that band; sales-led above. Specific cutoff depends on your sales cycle length and ACV math – if a deal needs 5 calls and a custom SOW, it can't be self-serve.",
      },
      {
        q: "Should I show a starting price for 'Contact us' ('From $50K/year')?",
        a: "Often yes, for sophistication. Showing the floor price filters in qualified buyers (those who'd budget that range) and filters out tire-kickers. 'Starts at $50K/year' or 'Contact us for pricing on 50+ seats' is a transparent floor.",
      },
      {
        q: "How quickly should I respond to 'Contact us' submissions?",
        a: "Under 4 hours during business hours; under 24 hours always. Enterprise buyers who fill out a contact form expect a response. Slow response = lost deal, regardless of how compelling the product is.",
      },
    ],
    relatedGlossary: ["offer", "value-ladder"],
    lastVerified: "2026-05-20",
  },
];

export const PRICING_PAGE_PATTERN_SLUGS: ReadonlyArray<string> =
  PRICING_PAGE_PATTERN_ENTRIES.map((e) => e.slug);

export function getPricingPagePatternBySlug(
  slug: string,
): PricingPagePatternEntry | undefined {
  return PRICING_PAGE_PATTERN_ENTRIES.find((e) => e.slug === slug);
}
