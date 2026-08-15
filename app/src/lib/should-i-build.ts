/**
 * /should-i-build/[slug] pSEO catalog — honest pre-revenue decision pages.
 *
 * Pure pre-revenue intent: a founder typing "should I build a SaaS for X"
 * lands here and gets a yes / no / depends verdict with the Brunson Hard-
 * Rule reasons behind it. Several entries deliberately say "no" or
 * "probably not in 2026" — the trust moat is that we do not sell every
 * answer as a green-light.
 *
 * Schema strategy: QAPage (the question is structured) plus Article
 * (the body is longer than a single answer) plus FAQPage (block at the
 * bottom) plus BreadcrumbList. Same triad the /answers surface uses.
 */

export type Verdict = "yes" | "no" | "depends" | "not-in-2026";

export interface ShouldIBuildFaq {
  q: string;
  a: string;
}

export interface ShouldIBuildEntry {
  /** URL slug, kebab-case. */
  slug: string;
  /** The full decision-question, as it would be searched. */
  question: string;
  /** SEO meta title, under 60 chars. */
  metaTitle: string;
  /** SEO meta description, under 160 chars. */
  metaDescription: string;
  /** The verdict. Drives the colored banner on the page. */
  verdict: Verdict;
  /** 1-2 sentence headline verdict line ('the short answer is...'). */
  verdictLine: string;
  /**
   * The honest reasoning, in 3-5 paragraphs. Brunson Hard-Rule:
   * no fabricated markets, no invented numbers.
   */
  body: ReadonlyArray<string>;
  /** Conditions under which the verdict flips. */
  flipConditions: ReadonlyArray<string>;
  /** What to do instead, if the verdict is "no". */
  alternativePaths: ReadonlyArray<string>;
  /** Related niches / categories / Brunson terms. */
  relatedNiches: ReadonlyArray<string>;
  relatedGlossary: ReadonlyArray<string>;
  /** FAQ block. */
  faqs: ReadonlyArray<ShouldIBuildFaq>;
  /** ISO date last verified. */
  lastVerified: string;
}

export const SHOULD_I_BUILD_ENTRIES: ReadonlyArray<ShouldIBuildEntry> = [
  {
    slug: "should-i-build-a-saas-for-a-tiny-niche",
    question: "Should I build a SaaS for a tiny niche (under 1,000 people)?",
    metaTitle: "Should I Build SaaS for a Niche Under 1,000?",
    metaDescription:
      "Yes — if you can reach all 1,000 personally and the niche pays $50+/month. Below that, the math is brutal. Honest verdict + flip conditions.",
    verdict: "depends",
    verdictLine:
      "Depends. A SaaS for fewer than 1,000 people works only if (a) you can reach all of them personally and (b) the niche pays $50/month or more. Below either threshold, the math does not close.",
    body: [
      "The dream-100 math for a 1,000-person niche is simple: at $50/month, full penetration is $600,000 ARR. Cut for realistic penetration (5-15%) and the ceiling is $30,000 to $90,000 ARR. That is a working solo-founder business, not a venture-backable one.",
      "The constraint is reachability, not size. If you can name 100 of the 1,000 people by hand, the path is direct outreach plus referrals. If you cannot, you are in a small market that still requires paid acquisition — which usually does not pencil out under $50 ARPU.",
      "Niches that pay well per seat (specialized professional tools, compliance, vertical workflows) tolerate small TAMs. Niches with consumer-style price tolerance (creators, hobbyists) do not.",
      "Pre-revenue: pre-sell to 10 named people in the niche before writing any code. If 10 named people will not pay a $1 deposit, the niche is too small or too misread, and no amount of SaaS will fix that.",
    ],
    flipConditions: [
      "Flip to YES if you can name 100+ of the 1,000 and the average willingness-to-pay is $50/month+.",
      "Flip to NO if the niche pays consumer-style prices ($10/month or less) or you cannot reach the dream-100 without paid acquisition.",
    ],
    alternativePaths: [
      "Build the same workflow as a paid service or premium consulting offer first; convert it to SaaS once you have 5-10 paying clients.",
      "Move adjacent — find the 10,000-person niche where the same workflow problem exists with a wider audience.",
    ],
    relatedNiches: ["consultants", "agency-owners", "indie-hackers"],
    relatedGlossary: ["dream-100", "wrong-person", "value-ladder"],
    faqs: [
      {
        q: "What is the minimum viable niche size for indie SaaS?",
        a: "About 1,000 reachable people at $50+/month is the lower bound for a working solo-founder business. Below that, the math closes only with much higher prices ($200/month+) or much higher penetration (above 25%), both of which are rare without a strong personal network in the niche.",
      },
      {
        q: "Can I expand from a tiny niche to a bigger one later?",
        a: "Sometimes, but expansion is its own product launch — different audience, different messaging, different funnel. Plan as if you cannot expand, and treat any expansion as a bonus.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "should-i-build-an-ai-wrapper-around-chatgpt",
    question: "Should I build an AI wrapper around ChatGPT or Claude?",
    metaTitle: "Should I Build an AI Wrapper in 2026?",
    metaDescription:
      "Depends entirely on the wrapper. Pure prompt wrappers die fast; wrappers that own data, workflow, or distribution survive. The honest filter.",
    verdict: "depends",
    verdictLine:
      "Depends on what the wrapper actually owns. If the only thing you are adding is a prompt and a UI, no — the model provider will eat that. If you own the data, the workflow, or the distribution, yes.",
    body: [
      "Pure prompt wrappers — a textarea, a system prompt, a price tag — are pricing themselves against zero. The underlying provider can ship the same prompt as a native feature in a quarter, and customers churn the moment they realize the system prompt is the entire product.",
      "Defensible AI wrappers add at least one of: proprietary data the model does not have, a workflow the customer cannot assemble from raw chat, a distribution channel the model provider does not have, or a compliance / safety layer that is expensive to replicate.",
      "The 'thin wrapper, fat audience' bet — building a thin wrapper but capturing a specific audience with strong distribution — also works, but the moat is the audience, not the wrapper. Plan the audience-building work before the build.",
      "Pre-revenue check: write down the one-sentence answer to 'why would a customer pay you and not the model provider directly when the model provider ships this natively?' If the answer is 'because they will not figure out the prompt', you are building on sand.",
    ],
    flipConditions: [
      "Flip to YES if the wrapper owns proprietary data, a specific workflow, or a distribution channel.",
      "Flip to NO if the entire defensibility argument is 'better UX' or 'a better prompt'.",
    ],
    alternativePaths: [
      "Build a workflow tool that uses AI as one step, not the whole product. The non-AI plumbing is the moat.",
      "Build for a regulated or specialized vertical (legal, medical, finance) where the model provider will not ship native verticalization.",
    ],
    relatedNiches: ["ai-wrappers", "no-code-builders", "saas-founders"],
    relatedGlossary: ["offer", "weak-offer"],
    faqs: [
      {
        q: "Is it too late to build an AI wrapper in 2026?",
        a: "Too late for pure prompt wrappers, yes. Not too late for AI-augmented workflow tools, vertical AI products, or audience-first AI tools. The category is consolidating, not closing — the survivors are the ones with non-AI moats.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "should-i-build-a-clickfunnels-clone",
    question: "Should I build a cheap clone of ClickFunnels?",
    metaTitle: "Should I Build a ClickFunnels Clone in 2026?",
    metaDescription:
      "No. Cloning a tool with a 10-year head start, brand, and ecosystem against you with no specific edge does not pencil out. Honest verdict.",
    verdict: "no",
    verdictLine:
      "No. Cloning an entrenched tool with no specific edge — different audience, different price, different positioning — is the most-attempted and least-rewarded indie SaaS pattern. The right move is positioning, not pricing.",
    body: [
      "The 'I will build a cheaper ClickFunnels' bet has been attempted hundreds of times since 2018. The graveyard is large. The pattern fails because the moat in tools-of-this-shape is brand plus ecosystem plus founder content plus integrations — not features. Cloning the features clones the smallest part of the moat.",
      "When cheaper clones do work, they are not really cheaper clones. They are repositioned products with a different audience (indie founders vs course creators), a different surface (drag-and-drop vs templated), or a different price model (one-time vs subscription). The repositioning is the product.",
      "The honest indie-SaaS edge against an entrenched competitor is almost never price. It is audience focus, integration depth, or a feature subset done dramatically better for one specific job-to-be-done.",
      "Pre-revenue: write down the one sentence that completes 'Use us instead of ClickFunnels because ___'. If the sentence is 'we are cheaper', stop building. If the sentence names a specific job-to-be-done you do dramatically better, keep going.",
    ],
    flipConditions: [
      "Flip to YES if you have a specific audience the incumbent does not serve well and you are charging on a different axis (one-time, usage-based, freemium).",
      "Stay NO if the only differentiator is price.",
    ],
    alternativePaths: [
      "Build for a specific funnel archetype (tripwire-only, webinar-only) and own that one slice instead of the full surface.",
      "Build the missing integration the incumbent does not have, sold as a companion product.",
    ],
    relatedNiches: ["saas-founders", "indie-hackers", "no-code-builders"],
    relatedGlossary: ["offer", "weak-offer", "wrong-person"],
    faqs: [
      {
        q: "What about cloning a tool that is no longer actively maintained?",
        a: "Different question. Cloning a tool with users but no maintenance can work — you inherit demand without inheriting the brand fight. Validate that the users will switch to you specifically (not just complain about the original) before building.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "should-i-build-a-saas-for-friends-and-family",
    question: "Should I build a SaaS for friends and family?",
    metaTitle: "Should I Build SaaS for Friends and Family?",
    metaDescription:
      "Almost always no. Friends and family validate enthusiasm, not market demand, and asking them to pay produces friction that contaminates the data.",
    verdict: "no",
    verdictLine:
      "Almost always no. Friends and family are the wrong validation cohort — their feedback is shaped by social loyalty, not market demand. Build for strangers who match the named profile.",
    body: [
      "The 'friends will validate it' instinct fails on two axes: friends say yes when they mean polite, and friends pay when they mean charity. Neither signal reflects market behavior. The first paying stranger is worth ten paying friends as validation.",
      "Worse, friends-as-customers contaminate the support channel. You cannot tell them their account is locked for non-payment, you cannot run their experience through the same friction the next 100 customers will hit, and you cannot tell which features they use because they like the feature versus because they like you.",
      "The narrow exception is when your friend group is the actual named target audience — a SaaS for indie founders built by an indie founder whose friends are indie founders, where the social tie is incidental to the demand. Even then, charge them full price from day one and treat them as customers, not friends.",
      "Pre-revenue: pick a specific stranger you would be proud to sell to (one real person, named) and design every page for them. If your friend happens to fit that profile, fine. If they do not, their feedback is noise.",
    ],
    flipConditions: [
      "Flip to YES only if your friend group is literally the named target audience and you treat them as customers (full price, no special access, normal friction).",
    ],
    alternativePaths: [
      "Find the named target audience on the platforms they actually use (specific subreddits, communities, Discords, X niches) and pre-sell there.",
      "Use friends and family as the proofreading cohort for the landing page copy — not as paying customers.",
    ],
    relatedNiches: ["indie-hackers", "saas-founders", "freelancers"],
    relatedGlossary: ["wrong-person", "dream-100", "weak-offer"],
    faqs: [
      {
        q: "What if my friends ARE my target audience?",
        a: "Then treat them as customers, not friends, for the purposes of the funnel. Charge full price, run them through the same checkout, and use their feedback exactly as you would a stranger's. The social tie is incidental.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "should-i-launch-without-a-pricing-page",
    question: "Should I launch a SaaS without a pricing page?",
    metaTitle: "Should I Launch SaaS Without a Pricing Page?",
    metaDescription:
      "No. Hiding pricing on a pre-revenue indie SaaS site filters out the buyers you want and attracts the leads you do not. The honest verdict.",
    verdict: "no",
    verdictLine:
      "No. Hiding pricing on a pre-revenue indie SaaS site filters out the qualified self-serve buyers — who are exactly who you want — and attracts unqualified contact-us leads who are not.",
    body: [
      "The 'contact us for pricing' default carries a B2B-enterprise frame: long sales cycle, custom pricing, qualified-by-quota lead funnel. None of that is true for pre-revenue indie SaaS at $10-$500/month price points. Inheriting the frame inherits the cost.",
      "Self-serve qualified buyers — your highest-intent visitors — leave when they cannot find a price. They have learned that 'contact us' means 'expensive enough that we have to negotiate it', and they self-select out before talking to you. The lead form fills with under-fit shoppers instead.",
      "If you are genuinely unsure about pricing pre-launch, publish a directional range ('$49-$99/month, depending on usage') with a note that the final tier shape is in beta. Honest uncertainty beats opaque secrecy.",
      "Show prices. The pricing page does not have to be your best-performing page; it has to give qualified buyers enough information to self-qualify.",
    ],
    flipConditions: [
      "Flip to YES only if your average deal is over $1,000/month AND the buyer is procurement-driven (enterprise, regulated, contracted).",
    ],
    alternativePaths: [
      "Show prices but offer a 'Talk to us' option for enterprise — separate surface, separate copy. Two doors, not one.",
      "Publish a directional range during beta, then firm up to specific tiers when you have 20+ paying customers.",
    ],
    relatedNiches: ["saas-founders", "indie-hackers"],
    relatedGlossary: ["offer", "weak-belief"],
    faqs: [
      {
        q: "What if my pricing changes monthly during beta?",
        a: "Publish the current month's price with a 'pricing changes during beta — current customers are locked in' note. Transparency about the lock-in mechanism is more valuable than the appearance of stability.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "should-i-build-saas-as-a-second-job",
    question: "Should I build a SaaS while keeping my full-time job?",
    metaTitle: "Should I Build SaaS as a Side Project?",
    metaDescription:
      "Yes, with structure. Building a side SaaS is the safest path to leaving a job — but only if you treat it as a real product, not a hobby.",
    verdict: "yes",
    verdictLine:
      "Yes, with structure. Building a SaaS alongside a full-time job is the safest path to leaving the job — provided you treat it as a real product with a real customer, not a hobby with a Stripe account.",
    body: [
      "The 'quit and build full-time' path produces survivorship-bias storytelling. The honest path for most pre-revenue founders is: build alongside the day job, get to first paying customer, get to 10, get to one month of runway-equivalent revenue, then plan the exit. Each milestone resets the risk profile.",
      "The risk on the side-project path is not building speed — it is calendar discipline. A SaaS built in 5 hours a week ships features in 1/8 the time of a full-time SaaS, but the same 5 hours can produce a paying customer in 8 weeks if every hour is pointed at the funnel, not the codebase.",
      "Side-project SaaS that fails almost always fails the same way: too much time on the product, too little on the funnel. The cure is to fix a 'funnel hour' on the calendar every week — copy, audience, outreach — that is non-negotiable.",
      "Pre-revenue: define the milestone that triggers the exit before you start building. ($X MRR, N paying customers, M months of runway-equivalent revenue.) Without a pre-defined milestone, the side project stays a side project forever.",
    ],
    flipConditions: [
      "Stay YES unless the day job is hostile to side-project work (IP clauses, time-tracking constraints). Then validate IP rights first.",
    ],
    alternativePaths: [
      "If the day job has IP constraints, validate the SaaS via non-coding work first (paid waitlist, paid consulting) and start the build only after the IP question is cleared.",
    ],
    relatedNiches: ["freelancers", "indie-hackers", "consultants"],
    relatedGlossary: ["value-ladder", "offer"],
    faqs: [
      {
        q: "How many hours a week is enough?",
        a: "Five focused hours a week, aimed at the funnel (not the codebase), gets a pre-revenue indie SaaS to first paying customer in 8-16 weeks for most founders. Two hours a week is generally not enough to maintain momentum.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "should-i-build-a-faceless-saas",
    question: "Should I build a faceless SaaS with no public founder?",
    metaTitle: "Should I Build a Faceless SaaS in 2026?",
    metaDescription:
      "Probably not. Faceless brands are harder to launch pre-revenue in 2026 — distribution channels reward named founders. The honest filter.",
    verdict: "not-in-2026",
    verdictLine:
      "Probably not in 2026. Faceless SaaS brands are harder to launch pre-revenue today than they were five years ago — every cold-traffic channel that matters rewards a named founder.",
    body: [
      "The 'faceless SaaS' bet was easier in the era when Google organic + paid Facebook ads could carry a brand. In 2026, the dominant pre-revenue distribution channels are AI assistants (cite named experts), platform-native communities (reward named voices), and direct outreach (requires a real person to sign the email). Each channel discounts faceless brands.",
      "There are working faceless SaaS, but they share a profile: they were founded named, became faceless later as the team grew, and have brand momentum that carries them. Launching faceless from zero is starting two laps down.",
      "The 'I just do not want to be public' instinct is understandable but expensive. The honest middle path is named-but-private: a real name on the about page, a real founder photo, a contact email, but no social presence and no founder podcast. That carries 80% of the trust at 20% of the personal cost.",
      "Pre-revenue: do not optimize for the founder-anonymous version of yourself. Optimize for one trustable face on the about page, one named contact email, one verifiable real-person detail. Skip the rest.",
    ],
    flipConditions: [
      "Flip to YES if the SaaS is genuinely team-built from day one and has a named legal entity + founder team page with multiple people.",
    ],
    alternativePaths: [
      "Build named-but-private: real name + photo on About, no social presence, no podcast. Captures 80% of the trust at 20% of the personal cost.",
      "Use a pen name for content, but a legal name on the legal pages. Half-faceless brands exist and work.",
    ],
    relatedNiches: ["indie-hackers", "saas-founders"],
    relatedGlossary: ["story", "reluctant-hero", "weak-belief"],
    faqs: [
      {
        q: "Can I add the founder photo later?",
        a: "Yes, but the longer the brand exists faceless, the more brand momentum you have to overcome to re-introduce a named founder. Easier to start named and stay private than to start faceless and pivot.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "should-i-pre-sell-before-i-build",
    question: "Should I pre-sell a SaaS before building it?",
    metaTitle: "Should I Pre-Sell SaaS Before Building It?",
    metaDescription:
      "Yes, almost always. Pre-selling is the cheapest, highest-signal validation move for indie SaaS. The honest exceptions are narrow.",
    verdict: "yes",
    verdictLine:
      "Yes, almost always. Pre-selling — taking real money from real customers before the product exists — is the highest-signal validation move available, and the cheapest. The exceptions are narrow.",
    body: [
      "A 100-person waitlist tells you almost nothing. A 10-person pre-paid list tells you the offer is real. The cost difference between collecting emails and collecting Stripe charges is 10 minutes of setup; the signal difference is the entire business.",
      "Pre-selling at honest discount ('$X today, $Y at launch, locked in for life') gives the early buyers a reason to pay before they can use the product. Without a price lock-in, pre-selling reads as gimmick.",
      "Delivery date matters more than people think. If you cannot ship in 60-90 days of the pre-sale, the trust unravels — pre-buyers churn, refund, and tell people. Pre-sell with a date you can keep.",
      "Pre-revenue: aim for 10 pre-sold customers before writing the bulk of the product. If you cannot pre-sell 10 named people, the product hypothesis is wrong; another month of building will not fix it.",
    ],
    flipConditions: [
      "Stay YES unless the product is regulated (medical, financial) where pre-selling creates compliance risk. Then validate via paid pilots.",
    ],
    alternativePaths: [
      "Pre-sell consulting at the same price as the eventual SaaS subscription, deliver manually, then automate as you sell more.",
    ],
    relatedNiches: ["indie-hackers", "saas-founders", "no-code-builders"],
    relatedGlossary: ["offer", "weak-belief", "verified-builder"],
    faqs: [
      {
        q: "Is a paid waitlist the same as pre-selling?",
        a: "Close, but not quite. A paid waitlist takes a deposit; a pre-sale takes the full price. The signal is stronger from a full pre-sale. Deposits filter for curious leads; full pre-sales filter for buyers.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "should-i-build-a-saas-i-have-not-launched-yet",
    question: "Should I keep building a SaaS I have not launched yet?",
    metaTitle: "Should I Keep Building Pre-Launch SaaS?",
    metaDescription:
      "Depends on time-since-build-started, not features. Past 90 days pre-launch, every new feature subtracts more than it adds.",
    verdict: "depends",
    verdictLine:
      "Depends on calendar time, not feature count. Past 90 days pre-launch, every new feature you add is subtracting more than it is adding. Cut scope and ship.",
    body: [
      "The pre-launch trap: the product gets better technically every week, but the founder gets worse at launching it. Confidence on the build erodes as scope expands; confidence on the launch never gets to grow because launch keeps not happening.",
      "Past 90 days pre-launch, the predictive variable for shipping is not 'do I have feature X' — it is 'have I told 50 named people about it'. Founders past 90 days who keep building rarely ship; founders past 90 days who start telling people usually ship within four weeks.",
      "The right move past 90 days is: pick the smallest possible version that solves one named person's problem, ship it to that one person, charge them, then expand. Not the other way around.",
      "Pre-revenue: pick a launch date inside the next 30 days, work backwards, cut every feature that does not fit. The features cut today become the v2 roadmap that exists because v1 has paying customers funding it.",
    ],
    flipConditions: [
      "Flip to YES (keep building) only if you are inside the first 30 days and a specific named customer is waiting for a specific feature.",
      "Flip to NO (stop, ship now) if you are past 90 days and the build keeps expanding without external pull.",
    ],
    alternativePaths: [
      "Ship the smallest possible v0 (one feature, one page, one Stripe link) to one named customer this week. v1 is the version with paying customers.",
      "Pause development, run a one-week funnel-only sprint, get to first paying customer, then resume.",
    ],
    relatedNiches: ["indie-hackers", "saas-founders", "no-code-builders"],
    relatedGlossary: ["offer", "value-ladder", "wrong-person"],
    faqs: [
      {
        q: "What if my product genuinely is not ready?",
        a: "'Not ready' almost always means 'missing features the founder thinks are required'. Ship the version that solves one customer's problem at $X, and treat the rest as a paid roadmap. The customer's payment funds the readiness work.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "should-i-build-saas-vs-an-agency",
    question: "Should I build a SaaS or run an agency?",
    metaTitle: "Should I Build SaaS or Run an Agency?",
    metaDescription:
      "Run the agency first, build the SaaS second. The agency funds the SaaS, validates the offer, and gives you the dream-100 list. Honest path.",
    verdict: "depends",
    verdictLine:
      "Run the agency first, build the SaaS second. The agency funds the SaaS, surfaces the workflow worth automating, and gives you a dream-100 list of paying customers to sell the eventual SaaS to.",
    body: [
      "The 'I will skip the agency and go straight to SaaS' bet is faster on paper and slower in practice. Without the agency, you do not yet know which workflow is worth automating, which customer is worth selling to, or which price point clears the air.",
      "An agency run for 12-24 months produces three SaaS-grade assets: a list of named, paying clients who already trust you (the warmest dream-100 you will ever have); a documented workflow that has been delivered enough times to be productizable; and the cash to fund the SaaS build without VC or runway anxiety.",
      "Agency-to-SaaS founders ship faster, charge more confidently, and survive the first-12-months funding gap better than pure indie SaaS founders. The trade-off is that the agency is a real business with its own time demands.",
      "Pre-revenue: if you have no current revenue and no audience, start agency-shaped (paid service for one workflow), document everything, then productize. If you already have a strong audience, you can compress the agency phase to a paid-pilot cohort.",
    ],
    flipConditions: [
      "Flip to PURE SAAS if you already have a strong audience for the product and a clear workflow you have delivered before.",
      "Flip to PURE AGENCY if the workflow does not productize well (high judgment, low repeatability).",
    ],
    alternativePaths: [
      "Run a paid 4-week pilot cohort instead of a full agency — productized service, fixed scope, clear deliverable.",
      "Sell the agency workflow as a 'done-for-you' tier alongside the SaaS once it ships.",
    ],
    relatedNiches: ["agency-owners", "consultants", "freelancers", "saas-founders"],
    relatedGlossary: ["value-ladder", "dream-100", "offer"],
    faqs: [
      {
        q: "Can the agency and the SaaS be the same brand?",
        a: "Yes, and usually should be. The agency builds brand trust; the SaaS inherits it. Splitting brands forces you to build trust twice.",
      },
    ],
    lastVerified: "2026-05-19",
  },
];

export const SHOULD_I_BUILD_SLUGS: ReadonlyArray<string> =
  SHOULD_I_BUILD_ENTRIES.map((e) => e.slug);

export function getShouldIBuildBySlug(
  slug: string,
): ShouldIBuildEntry | undefined {
  return SHOULD_I_BUILD_ENTRIES.find((e) => e.slug === slug);
}

export const SHOULD_I_BUILD_VERDICT_LABELS: Record<Verdict, string> = {
  yes: "Yes",
  no: "No",
  depends: "Depends",
  "not-in-2026": "Probably not in 2026",
};
