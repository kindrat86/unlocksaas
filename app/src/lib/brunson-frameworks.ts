/**
 * Brunson framework manifests — Dream 100, Value Ladder funnel types,
 * dollar-objection patterns. Static, public-traceable, no fabricated data.
 *
 * Why this module exists
 * ----------------------
 * The MCP server already exposes UnlockSaaS-specific surfaces (the canonical
 * offer, the seven Playbook steps, the FAQ answers). What an agent helping
 * a *different* indie founder cannot retrieve through those tools is the
 * structural Brunson canon underneath — the seven-category Dream 100
 * skeleton, the four Brunson funnel types and their Hook/Story/Offer shape,
 * and the eight dollar-objection patterns with their verbatim founder
 * source quotes and Brunson External Belief classifications.
 *
 * This module is the structural distillation of:
 *   - `strategy/workbooks/08-your-dream-customer.md` §2 — the seven Dream 100
 *     categories with target counts and intent. Maryan's specific Dream 100
 *     entries stay in `strategy/dream-100.csv` (private); the category
 *     skeleton itself is public Brunson canon (Traffic Secrets book).
 *   - `strategy/workbooks/02-funnels-value-ladder.md` §§1-5 — the four
 *     canonical funnel types (Lead, Unboxing, Presentation, Phone) and the
 *     UnlockSaaS-specific 4-rung application. UnlockSaaS's rungs are also
 *     visible on `/playbook-sales`, `/pricing-teardown`, `/faq`, and
 *     `/index.md` — every claim below traces to a public surface.
 *   - `strategy/dollar-objections.md` — eight objection categories with
 *     verbatim founder source quotes (public Indie Hackers + Hacker News
 *     threads, link-attributed in this file). The answer copy below is
 *     already shipped on `/faq` via `FAQ_ENTRIES` in `faq-data.ts`; this
 *     module adds the *structural pattern* (verbatim quote + Brunson
 *     External Belief classification + answer + disqualifier line) that
 *     the bare FAQ does not expose.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - No fabricated quotes. Every verbatim line is attributable to a
 *     public source URL captured in `strategy/dollar-objections.md`.
 *   - No fabricated framework. The seven Dream 100 categories and four
 *     funnel types are book-canon Brunson, not invented for UnlockSaaS.
 *   - No private data exposure. Maryan's specific Dream 100 names
 *     (40 of 100 locked in workbook 08 Category 2) are NOT here; only the
 *     category skeleton + 3-5 generic worked examples per category.
 *
 * Consumers
 * ---------
 *   - `src/app/api/[transport]/route.ts` — three new MCP tools:
 *     `get_dream_100_template`, `get_value_ladder_archetype`,
 *     `get_objection_pattern`. Each renders one entry from this module
 *     as agent-ingestible markdown.
 *   - Eventually: the public `/brunson-framework` reference page (not
 *     yet shipped). Until then this module is MCP-only.
 */

// ── Dream 100 — seven-category template ────────────────────────────────────
// Brunson's Dream 100 (Traffic Secrets §1): the canonical seven gates where
// the founder's dream customer already congregates. The avatar's specific 100
// entries live in the private dream-100.csv; this is the framework skeleton
// any indie founder can apply to their own niche.

export type Dream100Category = {
  /** 1-indexed category number, matches workbook 08 §2 ordering. */
  readonly number: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  /** Short category label. */
  readonly name: string;
  /** How many entries the category targets in a complete Dream 100. */
  readonly target: number;
  /** One-line intent: what the founder is buying / earning by being in this gate. */
  readonly intent: string;
  /** 3-5 worked example entries, generic enough to be useful to any niche. */
  readonly examples: readonly string[];
  /** How the founder actually shows up in this gate — Work-Your-Way-In tactic. */
  readonly workYourWayIn: string;
  /** Paid alternative when earned distribution is too slow — Buy-Your-Way-In tactic. */
  readonly buyYourWayIn: string;
};

export const DREAM_100_CATEGORIES: readonly Dream100Category[] = [
  {
    number: 1,
    name: "Communities and forums",
    target: 20,
    intent:
      "Native gathering places where the dream customer reads and posts. Earned distribution lives or dies here. The single highest-conversion category for indie SaaS because the audience self-selected into the topic.",
    examples: [
      "Indie Hackers (community + newsletter + podcast)",
      "r/SaaS, r/microsaas, r/SideProject, r/Entrepreneur",
      "Hacker News (Show HN especially)",
      "Niche Discord servers (Lovable, Cursor, Bubble, etc.)",
      "WIP.co, MicroConf community, niche Slack groups",
    ],
    workYourWayIn:
      "Post one substantive value-first thread per week with no link. Reply with first-principles answers, not pitches. Aim for top-comment status before any product mention.",
    buyYourWayIn:
      "Sponsored newsletter slot, paid AMA, official partnership with the platform. Most communities ban paid promotion; the gate is content-quality, not money.",
  },
  {
    number: 2,
    name: "Influencers and individuals",
    target: 20,
    intent:
      "Named people whose audience overlaps the dream customer 80%+. Their endorsement, retweet, or guest appearance compresses 6 months of cold outreach into one week.",
    examples: [
      "Pieter Levels, Arvid Kahl, Marc Lou (indie founder voices)",
      "Justin Welsh, Daniel Vassallo (solo entrepreneur)",
      "Greg Isenberg, Anthony Castrio (community-led growth)",
      "Pat Walls (Starter Story), Justin Jackson (Transistor)",
      "Niche-specific micro-influencers with 5k-50k engaged following",
    ],
    workYourWayIn:
      "Provide first. Three substantive timestamped comments on their last 5 posts before any DM. When the DM goes out, one question, no pitch.",
    buyYourWayIn:
      "Paid newsletter sponsorship if they have one, paid podcast ad-read, affiliate / revenue-share if the product warrants. Direct cash-for-tweet rarely converts indie audiences.",
  },
  {
    number: 3,
    name: "Podcasts",
    target: 15,
    intent:
      "Long-form audio is the fastest trust-builder in B2B. One 45-minute episode in the right show produces months of compounding inbound. Mid-sized shows (5k-50k downloads) convert better than top-of-list celebrity shows.",
    examples: [
      "Indie Hackers Podcast, The Bootstrapped Founder",
      "Lenny's Podcast, MicroConf On Air, Build Your SaaS",
      "My First Million, Startup Ideas with Greg Isenberg",
      "Latent Space, Practical AI (for AI-adjacent SaaS)",
      "Niche industry podcasts in the founder's ICP vertical",
    ],
    workYourWayIn:
      "Be a listener first. Cite specific episodes when pitching. Send a one-paragraph pitch with the unique angle, not a generic founder bio.",
    buyYourWayIn:
      "Host-read ad slot (typically $25-100 CPM on indie business shows). Cheaper than equivalent reach on X. Better fit for $49/mo+ products with a clear ROI story.",
  },
  {
    number: 4,
    name: "Newsletters",
    target: 15,
    intent:
      "Owned-list distribution by another operator. A 5,000-subscriber tight newsletter outperforms a 100,000-subscriber broad list because match rate is everything. Sponsorship economics work at $250-2000/issue for indie SaaS.",
    examples: [
      "Lenny's Newsletter, The Hustle, Indie Hackers weekly",
      "Bootstrapped Founder weekly, MicroConf newsletter",
      "Houck's Newsletter, Trends.vc, The Macro",
      "AI Tidbits, Ben's Bites, The Rundown (AI niche)",
      "Niche industry newsletters in the founder's vertical",
    ],
    workYourWayIn:
      "Get cited. Provide a research stat, original data, or a sharp essay the newsletter operator can quote. Earn the mention; do not buy it first.",
    buyYourWayIn:
      "Sponsored slot via Beehiiv ad network, Sparkloop recommendations, or direct outreach to the operator. Tight lists ($250-500/issue) often outperform big lists for indie SaaS.",
  },
  {
    number: 5,
    name: "Products and partner SaaS",
    target: 15,
    intent:
      "Adjacent tools the dream customer already pays for. Integration, co-marketing, listing in their marketplace, or being recommended by their support — all compress trust because the founder is endorsed by a tool they already chose.",
    examples: [
      "Lovable, Cursor, Replit, Bubble (no-code / AI-build)",
      "Stripe, ConvertKit, Beehiiv (essential indie infra)",
      "Webflow, Framer, Carrd (landing page)",
      "Notion, Linear, Slite (founder workflow)",
      "Niche category-leader SaaS in the founder's ICP",
    ],
    workYourWayIn:
      "Build the integration first. Ship a public template, an export adapter, or a 'works with X' page. Become the recommended companion before asking for partnership.",
    buyYourWayIn:
      "Paid marketplace listing, co-marketing budget, revenue-share affiliate program. Useful when the partner has a sales team you can ride on.",
  },
  {
    number: 6,
    name: "YouTube channels",
    target: 10,
    intent:
      "Video creators with subscriber bases that overlap the dream customer. A single product demo on the right channel can sustain inbound for 12+ months because YouTube is the closest thing to evergreen organic distribution left.",
    examples: [
      "Riley Brown (vibe-coding, AI-build)",
      "Indy Dev Dan (Claude Code workflows)",
      "Marc Lou's video tutorials, Greg Isenberg's channel",
      "Niche tutorial creators in the founder's tool ecosystem",
      "Industry-vertical YouTubers in the founder's ICP",
    ],
    workYourWayIn:
      "Three substantive timestamped comments on their last 5 videos before any DM. Subscribe, watch fully, cite specific moments when pitching.",
    buyYourWayIn:
      "Sponsorship integrated into a relevant video (60-second mid-roll, dedicated 5-min demo). Indie creators typically $500-5000/integration; converts well when topical fit is tight.",
  },
  {
    number: 7,
    name: "Blogs and content properties",
    target: 5,
    intent:
      "Owned media sites with SEO traffic on the founder's queries. Smaller than the previous six because the modern weight has shifted to community + creator distribution, but still worth 5 entries for the long-tail compounding.",
    examples: [
      "Industry-leading indie blogs (Indie Hackers Stories, Starter Story)",
      "Vertical category blogs in the founder's ICP",
      "Solo creator blogs with engaged comment sections",
      "Substack publications with cross-promotion culture",
      "Authoritative resource sites (Lenny's, Trends.vc archive)",
    ],
    workYourWayIn:
      "Guest essay with a specific data point or contrarian thesis the host site is missing. Bring the angle; do not ask them to define it.",
    buyYourWayIn:
      "Sponsored post (declining ROI vs newsletter / podcast), link insertion in evergreen archive posts. Verify nofollow policy before paying.",
  },
] as const;

export const DREAM_100_TARGET_TOTAL = DREAM_100_CATEGORIES.reduce(
  (sum, c) => sum + c.target,
  0,
);

// ── Value Ladder — four Brunson funnel types ───────────────────────────────
// Brunson's four canonical funnel types (DotCom Secrets §1 + Expert Secrets
// §3). Each price range maps to exactly one funnel type. UnlockSaaS's locked
// 4-rung application appears as the worked example.

export type FunnelArchetype = {
  /** Funnel type name. The slug an MCP caller passes in. */
  readonly slug: "lead" | "unboxing" | "presentation" | "phone";
  /** Display name. */
  readonly name: string;
  /** Brunson rung number this funnel type carries. */
  readonly rung: 0 | 1 | 2 | 3;
  /** Price range this funnel type is built for. */
  readonly priceRange: string;
  /** What this funnel converts: input audience → output buyer. */
  readonly purpose: string;
  /** Canonical pages in the funnel, in order. */
  readonly pages: readonly string[];
  /** The Brunson Hook / Story / Offer shape for this funnel type. */
  readonly hookStoryOffer: {
    readonly hookShape: string;
    readonly storyShape: string;
    readonly offerShape: string;
  };
  /** Build-order rule: when in the launch sequence this funnel ships. */
  readonly buildOrderRule: string;
  /** The UnlockSaaS-specific worked example so the agent sees real numbers. */
  readonly unlockSaasExample: string;
  /** Common failure mode for this funnel type at indie scale. */
  readonly commonFailure: string;
};

export const VALUE_LADDER_FUNNEL_TYPES: readonly FunnelArchetype[] = [
  {
    slug: "lead",
    name: "Lead Funnel",
    rung: 0,
    priceRange: "Free",
    purpose:
      "Anonymous traffic to known email. Doubles as the SEO / AEO bait when the lead-magnet output is a sharable artifact (a diagnosis, a teardown, a benchmark report).",
    pages: [
      "Squeeze page (single hook + 2-field form)",
      "Result / delivery page (the lead magnet itself)",
      "Nurture sequence (5-email Soap Opera over 5 days)",
    ],
    hookStoryOffer: {
      hookShape:
        "Pain-mirror or contrarian. The reader must feel seen in 3 seconds: 'You shipped, nothing converted, you don't know why.'",
      storyShape:
        "Three-line Attractive Character about: founder's identical-pain origin + the door that opened + the polarity. Voice is Reluctant Hero, not guru.",
      offerShape:
        "The artifact itself, framed as 'the same diagnosis we charge $X/mo to fix, for free.' Trade is email-for-artifact, never email-for-PDF-promise.",
    },
    buildOrderRule:
      "Ships SECOND in the launch sequence (after the Unboxing Funnel). Reuses ~70% of the Unboxing copy at shorter form; uniquely needs the lead-magnet engine itself.",
    unlockSaasExample:
      "Free Diagnostic: paste product URL + email → engine returns Brunson label (Wrong Person / Weak Offer / Weak Belief) + three-axis scorecard + 30-day plan. CTA to $1 Starter. Live at /diagnostic.",
    commonFailure:
      "Lead magnet that doesn't stand alone. If the squeeze visitor cannot get value from the artifact without buying, they back-button. Diagnostic, teardown, benchmark — yes. 'Free chapter,' 'free webinar,' 'free PDF' — no.",
  },
  {
    slug: "unboxing",
    name: "Unboxing Funnel",
    rung: 1,
    priceRange: "$1-$50 one-time",
    purpose:
      "Email to first-time buyer. The smallest possible credit-card check. A $1-$50 charge identifies real buyers, pre-qualifies ascent to the recurring offer, and converts intent into installed payment method.",
    pages: [
      "Sales page (Star Story Solution + low-ticket offer + risk-reversal)",
      "Order form (single-page Stripe checkout)",
      "One-Time Offer (OTO) — recurring upgrade with guarantee",
      "Confirmation + member area entry (immediate first win)",
    ],
    hookStoryOffer: {
      hookShape:
        "Concrete completion promise: 'Finish [specific deliverable] this week. For $X.' Specific noun, specific timeframe, specific micro-price.",
      storyShape:
        "Star Story Solution (workbook 03 Script 3): the founder is the Star, identical struggle is the Story, the engine is the Solution. AC voice carried from the squeeze.",
      offerShape:
        "$1-$50 one-time. A COMPLETE small win, not a fragment. Restraint discipline: deliver one fully-finished outcome, not a teaser of the recurring product.",
    },
    buildOrderRule:
      "Ships FIRST in the launch sequence. Cheapest end-to-end test of offer copy + checkout + OTO. Identifies real buyers before the recurring offer is exposed.",
    unlockSaasExample:
      "$1 Starter: Playbook Steps 1+2 (pin one real customer + write one real offer). Includes engine output for those two steps + Soap Opera onboarding sequence. Live at /starter.",
    commonFailure:
      "Fragment delivery. Founders deliver 30% of the recurring product at $1 to 'tease' the upsell. Skeptics read fragments as bait and back-button. Deliver one complete small outcome instead.",
  },
  {
    slug: "presentation",
    name: "Presentation Funnel",
    rung: 2,
    priceRange: "$49-$300/mo recurring",
    purpose:
      "Recurring revenue. The funnel that actually earns. Receives ascending low-ticket buyers AND cold-to-warm direct traffic. The Perfect Webinar (or its lite, page-form variant) carries this rung.",
    pages: [
      "Long-form sales page (Perfect Webinar Lite structure)",
      "Checkout (recurring Stripe subscription, guarantee restated above the button)",
      "Onboarding (connect integrations the guarantee verifies, start clock)",
      "The product itself (in-product steps / rooms / surfaces)",
      "Customer area (community bonus, sprint tracker, account)",
    ],
    hookStoryOffer: {
      hookShape:
        "Big Promise + Big Domino: 'First [specific result] in [specific window], even if [reader's worst objection].' Resolves the External and Internal Beliefs in one line.",
      storyShape:
        "Full 5-beat Epiphany Bridge above the fold or in a short founder video. The hero's two journeys (external achievement + internal transformation) both shown.",
      offerShape:
        "Stack of 5-8 components with defensible value math, recurring price, risk-reversal guarantee. Disqualifying copy ('this is not for you if...') beneath the offer.",
    },
    buildOrderRule:
      "Ships THIRD in the launch sequence. Reuses ~90% of the Unboxing copy at longer form. Cheapest to build last because the prior two funnels have already battle-tested the offer.",
    unlockSaasExample:
      "$49/mo Playbook (Core): Steps 3-7 of the engine + 60-day guarantee. Refund-eligible if user completes in-product milestones and Stripe shows no new paying customer at the 60-day mark. Live at /playbook-sales.",
    commonFailure:
      "Pricing the recurring tier before the lower tiers have proved the offer. Founders launch at $99/mo, get zero conversion, and assume the price is wrong. The price is rarely wrong; the offer copy is unproven because no Unboxing-Funnel data has been gathered yet.",
  },
  {
    slug: "phone",
    name: "Phone / High-Ticket Funnel",
    rung: 3,
    priceRange: "$2,000+ one-time or $500+/mo",
    purpose:
      "Self-serve high-ticket or DFY. A booking funnel that filters down to a sales call, or a self-serve unlimited-products tier. Deferred until lower rungs have stable customer volume.",
    pages: [
      "Application page (pre-qualifier survey)",
      "Booking page (calendar embed)",
      "Sales call (or self-serve checkout for unlimited-products)",
      "Onboarding handoff to fulfillment / unlimited-access provisioning",
    ],
    hookStoryOffer: {
      hookShape:
        "Outcome promise tied to a calendar slot: 'Book a call to see if [outcome] is realistic for your [niche].' Or unlimited-access framing: 'Unlimited X for [solo-founder reasonable monthly].'",
      storyShape:
        "Case study or transformation story from a specific previous customer with named outcome. Identity-level proof, not feature-level proof.",
      offerShape:
        "High-ticket one-time + done-with-you support, OR unlimited-everything subscription. Risk reversal is the sales conversation, not a refund clause.",
    },
    buildOrderRule:
      "Ships LAST (or not at all). Activation gate: lower rungs have 10+ verified paying customer cycles AND the founder has bandwidth for sales conversations or fulfillment.",
    unlockSaasExample:
      "Not built. UnlockSaaS Rung 3 (agency / unlimited-products) is reserved as a slot but deferred indefinitely. Rung 2b ($149/mo Repeatable Revenue Layer) spec is locked at /repeatable, build gated on 3 verified Core cycles.",
    commonFailure:
      "Building Rung 3 before Rungs 1-2 have proven demand. Founders skip to a 'mastermind' or 'agency' offer because the unit economics look better on paper, then burn 6 months on no-show sales calls because the brand hasn't earned the high-ticket request.",
  },
] as const;

export const VALUE_LADDER_FUNNEL_SLUGS = VALUE_LADDER_FUNNEL_TYPES.map(
  (f) => f.slug,
);

export function getFunnelArchetypeBySlug(
  slug: string,
): FunnelArchetype | undefined {
  return VALUE_LADDER_FUNNEL_TYPES.find((f) => f.slug === slug);
}

// ── Objection Patterns — eight dollar-objection categories ─────────────────
// Sourced verbatim from `strategy/dollar-objections.md`. Each entry pairs:
// (a) a public Indie Hackers / Hacker News quote (link-attributed), (b) the
// Brunson External Belief number it maps to, (c) the answer (already public
// on /faq via FAQ_ENTRIES), and (d) the disqualifier line for the sales page.
//
// The FAQ tool exposes (c) only. This tool exposes the full pattern (a)+(b)+
// (c)+(d) so an agent helping a different founder can recognize the pattern,
// match it to their own niche, and craft their own response.

export type ObjectionPattern = {
  /** Kebab-case slug. */
  readonly slug:
    | "subscription-fatigue"
    | "cash-constraint"
    | "burned-by-gurus"
    | "not-tools-job"
    | "build-it-myself"
    | "price-scales-badly"
    | "praise-without-payment"
    | "built-beside-not-inside";
  /** Short category name. */
  readonly name: string;
  /** The objection in founder language. */
  readonly objection: string;
  /** One verbatim quote from a public source with attribution. */
  readonly verbatimQuote: {
    readonly quote: string;
    readonly user: string;
    readonly sourceUrl: string;
    readonly sourceLabel: string;
  };
  /** Which Brunson External Belief this maps to. */
  readonly brunsonClassification: string;
  /** The answer — sourced from FAQ_ENTRIES where applicable. */
  readonly answer: string;
  /** The sales-page disqualifier line (≤25 words, workbook 07 §5 voice). */
  readonly disqualifier: string;
  /** Where in the funnel each part lives. */
  readonly funnelPlacement: string;
};

export const OBJECTION_PATTERNS: readonly ObjectionPattern[] = [
  {
    slug: "subscription-fatigue",
    name: "Subscription fatigue",
    objection:
      "Another monthly fee. I'm so over the subscription model. I want to pay once and use it at my own pace.",
    verbatimQuote: {
      quote: "I'm personally so over the subscription model.",
      user: "Bpve",
      sourceUrl:
        "https://www.indiehackers.com/post/subscriptions-vs-one-time-payments-a-developers-honest-take-f153e48960",
      sourceLabel: "IH: Subscriptions vs One-Time Payments",
    },
    brunsonClassification:
      "External Belief #4 (price) — but the deeper truth is the recurring part, not the price. A $1 one-time tripwire is the cleanest answer.",
    answer:
      "Because the guarantee needs a billing cycle to live on, and because the product isn't a manual you read once — it's a workspace where outreach gets sent and a Stripe webhook listens for your first customer. If you finish in 30 days, cancel in 30 days. You'll still own everything you built inside.",
    disqualifier:
      "This is not for you if you're already exhausted by subscriptions and want a one-time payment you can ignore for six months. The $1 Starter is one-time. Take that and walk away with a complete small win.",
    funnelPlacement:
      "FAQ + disqualifier on Presentation Funnel sales page. Pre-empted by the $1 Unboxing Funnel offer (one-time charge).",
  },
  {
    slug: "cash-constraint",
    name: "Cash constraint",
    objection:
      "I can't afford it. I'm pre-revenue. Every dollar counts.",
    verbatimQuote: {
      quote: "Every dollar counts when we're building and growing our businesses.",
      user: "Cleme",
      sourceUrl:
        "https://www.indiehackers.com/post/which-saas-do-you-pay-for-as-an-indie-hacker-131cca2b19",
      sourceLabel: "IH: Which SaaS do you pay for",
    },
    brunsonClassification: "External Belief #4 (price) — direct.",
    answer:
      "That's the exact reason the guarantee exists. The cap on your downside is two monthly payments — and if the product doesn't produce a verified Stripe charge in the window AND you completed the in-product milestones, you get the money back. The founders this is built for spend more than that on tools they don't open. This is the tool that has to pay for itself or refund itself.",
    disqualifier:
      "This is not for you if two monthly payments is genuinely the difference between rent and no-rent. The free Diagnostic stays free. Use that, then come back when the math works.",
    funnelPlacement:
      "FAQ + disqualifier on Presentation Funnel sales page. Risk-reversal restated above the checkout button.",
  },
  {
    slug: "burned-by-gurus",
    name: "Burned by gurus",
    objection:
      "I've already wasted money on courses, coaches, frameworks, and templates. How is this different?",
    verbatimQuote: {
      quote:
        "I blindly followed a lot of advice given out by 'gurus' online, but that was a costly mistake.",
      user: "(post author)",
      sourceUrl:
        "https://www.indiehackers.com/post/i-got-to-5-000-in-monthly-revenue-but-it-took-me-3-years-a-burnout-716475f6f8",
      sourceLabel: "IH: 3 years to $5k MRR + burnout",
    },
    brunsonClassification:
      "External Belief #1 (time / framework fatigue) + Internal Belief #3 (praise is not payment).",
    answer:
      "A course makes you smarter. A coach makes you accountable. Neither does the work. The product is a workspace — outreach gets sent inside it, Stripe pings it when your first customer pays. The thing it produces is a verified charge in your account, not a finished worksheet. If you finish the steps and no charge lands, the guarantee fires. No course offers that because no course can.",
    disqualifier:
      "This is not for you if you've been burned by frameworks-on-PDFs and you assume this is one more. The framework is INSIDE the engine. If that's still too close to 'another course,' keep your money.",
    funnelPlacement:
      "FAQ + disqualifier on Presentation Funnel sales page. Reluctant Hero voice on every page reinforces the anti-guru polarity.",
  },
  {
    slug: "not-tools-job",
    name: "Not the tool's job",
    objection:
      "I tried interviews / ads / cold email / Indie Hackers — nothing converted. What makes this different?",
    verbatimQuote: {
      quote:
        "Meanwhile: zero paying customers. Zero cold emails sent. Zero uncomfortable conversations.",
      user: "jackfranklyn",
      sourceUrl:
        "https://www.indiehackers.com/post/why-indie-founders-fail-the-uncomfortable-truths-beyond-build-in-public-b51fd6509b",
      sourceLabel: "IH: Why indie founders fail",
    },
    brunsonClassification:
      "External Belief #2 (tactics) + avoidance disease (workbook 06 §4). Most founders who say 'I tried' did 2 interviews and gave up.",
    answer:
      "Be honest about what 'tried' means. Most founders who say it did 2 interviews and concluded the market was wrong. The product forces 20 logged outreach actions before the guarantee can fire — that's the floor. If you complete 20 and no Stripe charge lands, the offer was wrong, and the refund tells you that for free. Most founders never get to 20.",
    disqualifier:
      "This is not for you if you've already concluded the market is wrong. The product assumes the order is wrong — wrong person, wrong promise, wrong outreach — and that you can fix it in the window. If you believe the market is dead, no tool helps.",
    funnelPlacement:
      "FAQ on Presentation Funnel sales page. Engine pushback in the Outreach step mirrors jackfranklyn's quote back to the user.",
  },
  {
    slug: "build-it-myself",
    name: "I could build it myself",
    objection:
      "Couldn't I just build this myself in a weekend?",
    verbatimQuote: {
      quote:
        "Yep. We've canceled some software we could build internally.",
      user: "_pdp_",
      sourceUrl: "https://news.ycombinator.com/item?id=47436526",
      sourceLabel: "HN: Cancelled subscriptions because AI replaced them",
    },
    brunsonClassification:
      "External Belief #6 — NEW, added 2026-05-17 from public mine. Not in original workbook 06 §4 five-belief set.",
    answer:
      "Yes. Probably in three weekends. While you're building, you're not running the funnel — which is the exact disease the product treats. The proof logic, the locked workbook integration, the engine pushback that mirrors your own avoidance, the refund mechanic — you'd ship those in a month. And during that month, zero outreach. You'd be a founder who chose to ship one more tool nobody pays for. That's not a tool decision. That's a story.",
    disqualifier:
      "This is not for you if what you actually want is permission to ship product #4. The product finishes the funnel under product #3.",
    funnelPlacement:
      "FAQ on Presentation Funnel sales page. Disqualifier in the 'this is not for you' block above the checkout.",
  },
  {
    slug: "price-scales-badly",
    name: "Price scales badly",
    objection:
      "Will the price go up later? Am I locked in at the current rate?",
    verbatimQuote: {
      quote:
        "[Cost] will go up to $150 p/m by the end of the year when we exit their startup discount program.",
      user: "timmetz",
      sourceUrl:
        "https://www.indiehackers.com/post/which-saas-do-you-pay-for-as-an-indie-hacker-131cca2b19",
      sourceLabel: "IH: Which SaaS do you pay for",
    },
    brunsonClassification:
      "External Belief #4 (price) with trust angle. Founders fear bait-and-switch pricing.",
    answer:
      "The advertised monthly is the only Core price. If a Pro tier or annual plan ships later, the existing monthly stays at the advertised rate until the user chooses to change it. No startup-discount expiration, no usage-based metering, no 'your team grew so now it's higher.' The price is the price.",
    disqualifier:
      "(No disqualifier — this is a trust-building FAQ, not a buyer-filter.)",
    funnelPlacement:
      "FAQ on Presentation Funnel sales page. Trust-building, not buyer-filtering.",
  },
  {
    slug: "praise-without-payment",
    name: "Praise without payment",
    objection:
      "I got tons of feedback but nobody actually paid. My market must be dead.",
    verbatimQuote: {
      quote: "I'm bad at selling. Nine years of proof.",
      user: "Daniil Khanin",
      sourceUrl:
        "https://www.indiehackers.com/post/10-947-signups-90-paid-6-356-nine-years-of-building-a-product-nobody-buys-b60e773954",
      sourceLabel: "IH: 9 years, 90 paid, €6,356",
    },
    brunsonClassification:
      "Internal Belief #3 — praise → false signal. Rewrite signal: 'praise is not payment, only Stripe is.'",
    answer:
      "A founder on Indie Hackers just posted 10,947 signups, 90 paid, nine years — and wrote 'I'm bad at selling. Nine years of proof.' That's not a dead market. That's a missing motion. The product assumes the people clapping on your launch post are not the people who pay — and forces you to go find the ones who do, with logged outreach the engine tracks. If 20 of the right conversations still produce no charge, the guarantee fires.",
    disqualifier:
      "This is not for you if you're certain the silence after launch is market rejection. The product assumes the silence is a distribution problem.",
    funnelPlacement:
      "FAQ on Presentation Funnel sales page. Engine pushback in the 'Pin one real customer' step references the nimesh/Daniil quotes directly.",
  },
  {
    slug: "built-beside-not-inside",
    name: "Built beside, not inside",
    objection:
      "Even if it works, it'll just be another tab open beside my real workflow.",
    verbatimQuote: {
      quote:
        "Most founders think they are building a product. In reality they are often building a second tool that sits beside the thing people already use.",
      user: "Astra Wysocka",
      sourceUrl:
        "https://www.indiehackers.com/post/most-saas-products-fail-for-the-same-boring-reason-8c3b1cd51b",
      sourceLabel: "IH: Most SaaS products fail for the same boring reason",
    },
    brunsonClassification:
      "External Belief #7 — NEW category, surfaced in round 2 of the 2026-05-17 mine. Direct workflow-replacement objection.",
    answer:
      "Fair. Most tools do. That's why outreach is sent from inside the product, not copy-pasted out to another tab — and why the Stripe webhook fires inside the product when your first customer pays. Those are the two events that matter on the post-launch stretch. If both live somewhere else, kill the tool. Both live here. The product is not a tab you open. It is the room you do the work in.",
    disqualifier:
      "This is not for you if you need another tab open beside your work. The product IS the work for the duration of the guarantee window, or it isn't bought.",
    funnelPlacement:
      "FAQ on Presentation Funnel sales page. Reinforced by the in-product UX itself — outreach send + Stripe webhook both fire inside the product surface.",
  },
] as const;

export const OBJECTION_SLUGS = OBJECTION_PATTERNS.map((o) => o.slug);

export function getObjectionPatternBySlug(
  slug: string,
): ObjectionPattern | undefined {
  return OBJECTION_PATTERNS.find((o) => o.slug === slug);
}
