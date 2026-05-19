/**
 * /from-x-to-y/[slug] pSEO catalog — milestone-journey templates.
 *
 * Each entry covers ONE structural journey founders go through ($0 to
 * first paying customer, day-job to indie founder, freelancer to SaaS,
 * etc.) as a journey TEMPLATE — phases, what each phase looks like, what
 * to do at each phase, what to watch for. Not as a case study.
 *
 * The distinction matters under Brunson Hard-Rule:
 *   - Case study: "Here is what one specific named founder did."
 *     Requires real verified data; we do not have that yet.
 *   - Journey template: "Here is the structural pattern the journey
 *     typically follows, with phase-by-phase guidance." Pattern-based,
 *     drawn from observation, no fabricated specific outcomes.
 *
 * Schema: HowTo (phases as steps) + Article + FAQPage + BreadcrumbList.
 * HowTo is the right schema for ordered phases with phase-by-phase
 * guidance.
 *
 * Brunson Hard-Rule:
 *   - No invented specific founders. Every "what happens here" is a
 *     pattern, not an attributed event.
 *   - Time bands are bands, labeled as such.
 *   - "Common failure modes" reflect real observations in the diagnostic
 *     engine output and shipped teardowns.
 */

import { NICHE_SLUGS } from "./niches";

export interface JourneyPhase {
  title: string;
  timeBand: string;
  /** What this phase actually looks like, observably. */
  whatItLooksLike: string;
  /** What to do during this phase. */
  whatToDo: ReadonlyArray<string>;
  /** What to watch for (warning signs you are stalling). */
  watchFor: string;
}

export interface JourneyFaq {
  q: string;
  a: string;
}

export interface JourneyEntry {
  slug: string;
  /** Starting state. */
  from: string;
  /** Target state. */
  to: string;
  /** Full display name. */
  displayName: string;
  metaTitle: string;
  metaDescription: string;
  /** 2-3 sentence intro. */
  intro: string;
  /** Typical total time band for the full journey. */
  typicalTimeBand: string;
  /** Ordered phases. */
  phases: ReadonlyArray<JourneyPhase>;
  /** Common detours that extend the timeline. */
  commonDetours: ReadonlyArray<string>;
  /** What success looks like at journey end. */
  successDefinition: string;
  /** What "stuck" looks like and how to know. */
  stuckSignal: string;
  /** Related niche slugs (cohorts this journey resonates with). */
  relatedNiches: ReadonlyArray<string>;
  faqs: ReadonlyArray<JourneyFaq>;
  lastVerified: string;
}

export const JOURNEY_ENTRIES: ReadonlyArray<JourneyEntry> = [
  {
    slug: "from-zero-to-first-paying-customer",
    from: "$0 MRR, no customers, product shipped",
    to: "First paying customer (Stripe-verified)",
    displayName: "From $0 to first paying customer",
    metaTitle: "From $0 to First Paying Customer (SaaS Journey)",
    metaDescription:
      "The structural journey from $0 MRR to the first Stripe-verified paying customer. Phases, time bands, what to do at each phase, what to watch for.",
    intro:
      "The journey from $0 MRR to the first paying customer is the single most expensive psychological step in indie SaaS. The product is shipped, the page is up, the Stripe is connected — and the flat line continues. The template below names the four phases this journey usually has, with phase-by-phase guidance.",
    typicalTimeBand:
      "30-180 days from the moment the product is technically ready and the page is publishable. The variance is huge; the median for indie SaaS sits around 60-90 days.",
    phases: [
      {
        title: "Phase 1: The denial month",
        timeBand: "Days 0-30",
        whatItLooksLike:
          "The product is shipped. The page is up. You expect customers to arrive because the product is built. They do not. You attribute this to traffic and start small marketing experiments.",
        whatToDo: [
          "Resist the urge to 'add features'. Features will not produce the missing customer.",
          "Write down one specific named person you would be proud to sell to.",
          "Send the page URL to 10 people in your real target audience for feedback (not testimonials, feedback).",
        ],
        watchFor:
          "Spending more time on the product than on potential customers in this phase. The ratio should be inverted.",
      },
      {
        title: "Phase 2: The realization week",
        timeBand: "Days 30-60 (a specific week within)",
        whatItLooksLike:
          "Something specific happens — a feedback session, a Twitter reply, a diagnostic run — that names what is actually broken. The realization is usually about positioning or the named buyer, not about the product.",
        whatToDo: [
          "Take the realization seriously. The diagnostic-style label (Wrong Person, Weak Offer, Weak Belief) is the unlock.",
          "Rewrite the above-the-fold block to address the labeled problem.",
          "Stop running new traffic until the page is rewritten.",
        ],
        watchFor:
          "Half-rewriting. Most founders edit the headline and call it done. The full rewrite covers the H1, sub-hook, CTA, and trust block.",
      },
      {
        title: "Phase 3: The targeted reach-out",
        timeBand: "Days 60-90",
        whatItLooksLike:
          "Personal outreach to 30-100 named people in the rewritten target audience. Replies arrive. Demos happen. Some convert; most do not.",
        whatToDo: [
          "Send 5-10 personal messages per day, manually. Tools that send 50+ produce generic spam.",
          "Track each conversation. Each reply is a real customer-development data point.",
          "Convert reply-to-demo within 72 hours when replies land.",
        ],
        watchFor:
          "Defaulting to automation. The first paying customer comes from personal-grade outreach, not from drip sequences.",
      },
      {
        title: "Phase 4: The first transaction",
        timeBand: "Day 30-180 (the moment)",
        whatItLooksLike:
          "Someone runs the Stripe charge. The product delivers. The receipt arrives. The founder feels less validated than expected — the work continues, but a real signal lands.",
        whatToDo: [
          "Send a personal thank-you email within four hours.",
          "Verify access works. Watch the post-purchase webhook fire.",
          "Document this first customer's profile thoroughly. They are the first verified data point.",
        ],
        watchFor:
          "Stopping the outreach work after the first sale. Customer #1 to customer #10 is the same work as $0 to #1.",
      },
    ],
    commonDetours: [
      "Building 'just one more feature' before launching the new page. Adds 4-12 weeks to the timeline; rarely changes the outcome.",
      "Switching the product category after Phase 1 instead of fixing positioning. Sometimes correct; usually a cost-resetting decision masquerading as a pivot.",
      "Hiring a marketing consultant before the founder has tried personal outreach. Outsources the validation work that the founder needs to do.",
    ],
    successDefinition:
      "One Stripe-verified paying customer, not a friend, in the named target audience, with the product delivered and the customer using it post-purchase.",
    stuckSignal:
      "Past 120 days post-launch with zero paying customers AND fewer than 30 personal outreach conversations done. The first signal is customer count; the second is conversation count; conversation count is usually the constraint.",
    relatedNiches: [
      "indie-hackers",
      "saas-founders",
      "no-code-builders",
    ],
    faqs: [
      {
        q: "What if I cannot get to the first paying customer in 180 days?",
        a: "Three legitimate possibilities: positioning is wrong (most common), audience is wrong (second most common), or product genuinely does not solve a problem people pay for (least common). The personal-outreach work in Phase 3 surfaces which.",
      },
      {
        q: "Does the first customer have to be from a 'real' channel?",
        a: "Yes — friends and family do not count. Stripe-verified means real money from a real customer in the named target audience; charity from a friend does not produce useful signal.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "from-day-job-to-indie-founder",
    from: "Full-time employed, building SaaS on the side",
    to: "Indie founder, full-time on the SaaS, runway-covered",
    displayName: "From day job to indie founder",
    metaTitle: "From Day Job to Indie Founder (SaaS Journey)",
    metaDescription:
      "The structural journey from full-time employed to indie founder. Phases, time bands, financial milestones, and the exit-trigger to actually quit.",
    intro:
      "The journey from day-job-with-side-SaaS to full-time indie founder is the safest path most founders take, and the most psychologically loaded. The template below names the five phases with explicit financial milestones — the kind of decision framework that prevents both quitting too early and staying too long.",
    typicalTimeBand:
      "12-36 months from the first side-project line of code to quitting the day job. Faster paths exist but compress the financial milestones the framework recommends.",
    phases: [
      {
        title: "Phase 1: Side-project build",
        timeBand: "Months 0-6",
        whatItLooksLike:
          "5-15 hours per week on the SaaS alongside the day job. Most of it on the product. Some on the audience.",
        whatToDo: [
          "Validate IP rights with the day job's employment agreement.",
          "Allocate 1-2 hours per week to audience-building (Twitter, LinkedIn, newsletter). The audience builds while the product builds.",
          "Set a launch date inside the next 6 months. Move heaven and earth to hit it.",
        ],
        watchFor:
          "Spending all the side-project hours on the product. The audience-building work is what makes the eventual launch land.",
      },
      {
        title: "Phase 2: Launch and first customers",
        timeBand: "Months 6-12",
        whatItLooksLike:
          "Launch happens. Some customers arrive. MRR grows, slowly. Day job feels less interesting; the SaaS feels more interesting.",
        whatToDo: [
          "Track MRR explicitly. The number you can quit on is a specific MRR.",
          "Continue audience-building. Do not cut this when launch hits — the next launches need the audience too.",
          "Document customer feedback rigorously. The customer-development data shapes the next phase.",
        ],
        watchFor:
          "Quitting the day job at first paying customer. Premature. The math has to close before the quit, not after.",
      },
      {
        title: "Phase 3: The math closes",
        timeBand: "Months 12-24",
        whatItLooksLike:
          "MRR is at or approaching the day-job-equivalent. Runway is building. The founder is increasingly resentful of day-job time.",
        whatToDo: [
          "Calculate the quit-trigger: MRR equal to monthly expenses + 6-12 months of runway in savings. Not MRR equal to salary; MRR equal to expenses.",
          "Negotiate flexibility at the day job (part-time, sabbatical) if available — extends the runway without quitting.",
          "Set a quit date. Without a date, the math will keep moving.",
        ],
        watchFor:
          "Quitting on MRR alone with zero runway. Runway buys the 3-6 months it takes to land on a stable footing post-quit.",
      },
      {
        title: "Phase 4: The exit",
        timeBand: "Month 24+ (a specific week)",
        whatItLooksLike:
          "Notice given. Last day. First Monday as a full-time founder.",
        whatToDo: [
          "Give 4+ weeks notice. Leave on good terms; the network matters later.",
          "Set up the founder's operating cadence on day one. What time do you start, what time do you stop, what does a week look like.",
          "Tell the customer base. The 'I am full-time on this now' moment is a marketing event.",
        ],
        watchFor:
          "The 'I am free' first month spent celebrating instead of working. Real risk; the founder loses the operating habits the day job enforced.",
      },
      {
        title: "Phase 5: Sustaining indie",
        timeBand: "Month 24-36+",
        whatItLooksLike:
          "Full-time on the SaaS. Loneliness sometimes. MRR continues. Decision-making is now full-stack: product, marketing, support, finance, taxes.",
        whatToDo: [
          "Build a peer cohort. Indie SaaS founder communities (specific Discords, mastermind groups) replace the day-job's social layer.",
          "Track founder burnout signals. Indie founder year 1-2 is the highest-risk period for burnout.",
          "Re-evaluate the quit decision honestly at month 6 and 12. If the math is not working, get a contract role rather than a panic re-employment.",
        ],
        watchFor:
          "Treating quit as permanent. Some founders take a contract role and continue the SaaS part-time without shame — and grow it faster than the panicked-full-time alternative.",
      },
    ],
    commonDetours: [
      "Quitting at first paying customer, with no runway. Survivable but adds psychological stress that often kills the SaaS.",
      "Going from day job to consulting then to SaaS. Many indie founders find consulting funds the SaaS better than the day job did.",
      "Not negotiating with the day job for flexibility. Sabbaticals, part-time, and 4-day weeks exist; founders rarely ask.",
    ],
    successDefinition:
      "Indie founder, 12+ months post-quit, with MRR covering monthly expenses and runway intact. The founder still wants to be doing this.",
    stuckSignal:
      "Past month 24 of side-project work with MRR below 50% of monthly expenses AND no audience growth. The math is not closing on the current path; the next quarter should be a different approach (consulting, different niche, paid acquisition).",
    relatedNiches: [
      "indie-hackers",
      "saas-founders",
      "no-code-builders",
      "freelancers",
    ],
    faqs: [
      {
        q: "What if I genuinely cannot wait 12-24 months?",
        a: "Then you are not on the side-project path; you are on the consulting-to-SaaS path. Build the SaaS via paid services first, then transition. Same destination, different route.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "from-freelancer-to-saas-founder",
    from: "Freelancer or consultant, project revenue",
    to: "SaaS founder, recurring revenue",
    displayName: "From freelancer to SaaS founder",
    metaTitle: "From Freelancer to SaaS Founder (Journey)",
    metaDescription:
      "How freelancers and consultants transition into SaaS founders. The structural journey, phase by phase, with the productize-first framework.",
    intro:
      "The freelancer-to-SaaS journey is the safest path to SaaS for non-engineers — the freelance work funds the build, the existing clients become the first SaaS customers, and the workflow productization is the SaaS itself. The template names five phases with the productize-first framework woven through.",
    typicalTimeBand:
      "18-48 months from the decision to productize to a sustainable SaaS replacing freelance income. The variance is in how quickly the freelancer is willing to drop project work.",
    phases: [
      {
        title: "Phase 1: Workflow inventory",
        timeBand: "Months 0-3",
        whatItLooksLike:
          "Audit the recurring work patterns across freelance clients. Identify ONE workflow you have delivered 5+ times that customers would pay to have automated.",
        whatToDo: [
          "Make a list of every project type from the last 12 months. Tag each: 'unique', 'recurring', 'productized-ready'.",
          "Identify the workflow with the highest 'productized-ready' tag count AND the highest hourly rate.",
          "Talk to 5 existing clients about productizing this workflow. 'If this were a tool I sold for $X/month, would you switch?'",
        ],
        watchFor:
          "Picking the most interesting workflow instead of the most-delivered-and-most-paid one. SaaS economics favor scale, not novelty.",
      },
      {
        title: "Phase 2: Productized service",
        timeBand: "Months 3-9",
        whatItLooksLike:
          "Sell the workflow as a productized service — fixed scope, fixed price, repeatable delivery. The service is still manual, but the offer is repeatable.",
        whatToDo: [
          "Set a fixed price and fixed deliverable for the productized version.",
          "Deliver it 5-20 times manually. The manual delivery is the customer research.",
          "Document every step of the delivery. The documentation becomes the SaaS specification.",
        ],
        watchFor:
          "Skipping productization and going straight to SaaS. Pre-revenue SaaS without first running the productized service rarely produces a SaaS that fits real customer needs.",
      },
      {
        title: "Phase 3: Tool-supported delivery",
        timeBand: "Months 9-18",
        whatItLooksLike:
          "Build internal tooling that compresses the manual workflow. Each delivery takes less time. Margin per project improves. The internal tool starts to look like a SaaS.",
        whatToDo: [
          "Build the internal tool with the same stack you would build a SaaS with (Next.js, Stripe, Supabase). Reuse later.",
          "Track delivery time per project. Tool is working when each project takes 50% less time without quality loss.",
          "Start offering the tool to existing clients as a 'self-serve' option at a lower price.",
        ],
        watchFor:
          "Building tooling that only the founder can use. The handoff to self-serve customers is the SaaS test.",
      },
      {
        title: "Phase 4: Self-serve SaaS launch",
        timeBand: "Months 18-30",
        whatItLooksLike:
          "Tool is good enough that existing clients self-serve. Launch a public version. New customers acquire through the freelance network at first.",
        whatToDo: [
          "Set a transition target: 30-50% of revenue from SaaS subscriptions within 12 months of public launch.",
          "Continue some freelance work — it funds the SaaS marketing while subscriptions grow.",
          "Pricing: cheaper than the productized service, more expensive than the indie SaaS average. Existing-client trust pays for the premium.",
        ],
        watchFor:
          "Quitting freelance work too early. Freelance revenue funds the SaaS marketing budget; cutting it forces an external-capital decision earlier than necessary.",
      },
      {
        title: "Phase 5: SaaS-primary, freelance-secondary",
        timeBand: "Months 30-48+",
        whatItLooksLike:
          "SaaS is the larger revenue stream. Freelance is a small number of high-trust strategic clients. Cohort grows through SaaS-direct acquisition, not just the freelance network.",
        whatToDo: [
          "Wind down low-strategic freelance work. Keep the 2-3 clients where you have unique insight.",
          "Reinvest freelance margin into SaaS acquisition.",
          "Hire help (part-time first) for the parts of SaaS the founder is least good at.",
        ],
        watchFor:
          "Identity fatigue. Many founders who built SaaS via freelance miss the project work. Honor it; do not pretend the transition is purely additive.",
      },
    ],
    commonDetours: [
      "Trying to productize too many workflows at once. One workflow, productized properly, beats five half-productized.",
      "Letting freelance scope creep prevent SaaS build time. Hard boundaries on freelance hours per week are required after Phase 2.",
      "Selling the productized service AND the SaaS at the same price. Productized is high-touch, high-margin; SaaS is low-touch, lower-margin. Pricing differently is correct.",
    ],
    successDefinition:
      "SaaS revenue exceeds freelance revenue and is growing month-over-month. The freelance work is strategic (chosen), not necessary (forced).",
    stuckSignal:
      "Past month 30 of productized service work with SaaS still under 10% of revenue. Either the workflow does not productize well as software, or the transition has not been protected. Re-evaluate the productization scope.",
    relatedNiches: [
      "freelancers",
      "consultants",
      "agency-owners",
      "saas-founders",
    ],
    faqs: [
      {
        q: "Should I drop freelance work to focus on SaaS faster?",
        a: "Not until SaaS revenue is at 30-50% of total. Premature drop forces panicked marketing decisions that hurt the SaaS more than they help.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "from-launch-to-1k-mrr",
    from: "Launched, $0 MRR",
    to: "$1,000 MRR (sustainable runway-grade revenue)",
    displayName: "From launch to $1k MRR",
    metaTitle: "From Launch to $1k MRR (SaaS Journey)",
    metaDescription:
      "The structural journey from product launch to $1,000 monthly recurring revenue. Phases, customer-count milestones, and the most common stalls.",
    intro:
      "The $1k MRR threshold is the first revenue milestone that meaningfully changes founder psychology. The template names the four phases between launch and $1k MRR, with customer-count milestones at each phase and the specific stall patterns that delay the journey.",
    typicalTimeBand:
      "60-365 days from public launch to $1k MRR for most indie SaaS at $20-$100/month price points. Faster paths exist for premium pricing or strong audience pre-launch.",
    phases: [
      {
        title: "Phase 1: First 5 customers",
        timeBand: "Days 0-60",
        whatItLooksLike:
          "First customers arrive from the launch and from personal outreach. Each is a real-time event. MRR sits at $50-$500.",
        whatToDo: [
          "Personal email to every new customer. Every one. Not automation.",
          "Track customer profile, source channel, and what they said convinced them.",
          "Ship one product fix per week based on real customer feedback.",
        ],
        watchFor:
          "Spending the first 5 customers' worth of time on automation. Automation is for customer 50+, not customer 5.",
      },
      {
        title: "Phase 2: Customers 5-15",
        timeBand: "Days 60-120",
        whatItLooksLike:
          "First word-of-mouth referrals arrive. Some launch traction continues. MRR sits at $500-$1,000.",
        whatToDo: [
          "Identify the source channel that produced the first 5. Double down on that channel before adding new ones.",
          "Build the post-purchase email sequence (Soap Opera Sequence). Customers who get sequenced retain longer.",
          "Continue customer-development conversations. Each one shapes positioning and product.",
        ],
        watchFor:
          "Adding 3 new acquisition channels at once. Each channel needs sustained attention; spreading thin produces zero working channels.",
      },
      {
        title: "Phase 3: Crossing $1k MRR",
        timeBand: "Days 120-240",
        whatItLooksLike:
          "Customer 15-30 arrives. MRR crosses $1,000. Churn shows up for the first time — some early customers leave.",
        whatToDo: [
          "Track gross and net revenue churn explicitly. Both matter from this point on.",
          "Re-survey churned customers. Why they left is the single most valuable feedback you can collect.",
          "Start a referral or affiliate program. Word-of-mouth at this stage is the most cost-effective acquisition channel.",
        ],
        watchFor:
          "Treating first churn as a personal failure. Some churn is product-fit; some is offer-fit; some is timing. The signal is in the why.",
      },
      {
        title: "Phase 4: Past $1k, building the next milestone",
        timeBand: "Days 240+ ($1k MRR onward)",
        whatItLooksLike:
          "MRR is past $1k. The founder feels less pressure on each individual customer. The next milestone ($5k or $10k MRR) becomes the operating target.",
        whatToDo: [
          "Audit the customer cohort. Which subset has the highest retention, lowest support cost, highest expansion likelihood? Optimize for them.",
          "Add ONE new acquisition channel. Test for 90 days; double down or kill.",
          "Start documenting operational playbooks. The single-founder-improvising mode does not scale past $5k MRR.",
        ],
        watchFor:
          "Skipping documentation because 'it is just me'. Future-you will need it; new hires need it; investors / acquirers need it.",
      },
    ],
    commonDetours: [
      "Stalling at $300-$700 MRR for 6+ months. Almost always traceable to a positioning issue that needs explicit revisiting.",
      "Adding free tiers to grow signups, then watching MRR stagnate as paid conversion drops. Free tier is a Year-2 decision for most indie SaaS, not Year-1.",
      "Hiring before $1k MRR. The founder is the constraint at this stage; hiring shifts cost without shifting velocity.",
    ],
    successDefinition:
      "$1k MRR sustained for 3+ consecutive months with positive net new MRR each month. Churn is tracked, customers are named, and the founder knows the next bottleneck.",
    stuckSignal:
      "Past 120 days from launch with MRR below $300 AND fewer than 8 paying customers. Customer count is the leading indicator; revenue lags by 30-60 days. The first signal to investigate is which channel produced the customers that did arrive.",
    relatedNiches: [
      "indie-hackers",
      "saas-founders",
      "no-code-builders",
    ],
    faqs: [
      {
        q: "How long should I wait at sub-$500 MRR before pivoting?",
        a: "180 days of consistent effort with no movement. Less than 180 days is too short to read signal; more than 180 days without movement is the data telling you the current path does not work.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "from-1k-to-10k-mrr",
    from: "$1,000 MRR",
    to: "$10,000 MRR",
    displayName: "From $1k MRR to $10k MRR",
    metaTitle: "From $1k MRR to $10k MRR (SaaS Journey)",
    metaDescription:
      "The structural journey from $1k to $10k MRR. Phases, the 10x customer-count math, and the operational shifts required to scale.",
    intro:
      "The $1k to $10k MRR journey is the operationally hardest in indie SaaS. The 10x revenue requires roughly 10x customers (at constant ARPU) — and the founder cannot do everything 10x. The template names the four phases and the specific operational shifts the journey requires.",
    typicalTimeBand:
      "9-36 months from $1k MRR to $10k MRR. The variance is huge; the leading indicator is whether the founder accepts the operational shifts or fights them.",
    phases: [
      {
        title: "Phase 1: Channel concentration",
        timeBand: "$1k - $2.5k MRR",
        whatItLooksLike:
          "Customers continue arriving. The founder identifies ONE acquisition channel producing 70%+ of customers and doubles down.",
        whatToDo: [
          "Audit every acquisition channel. Calculate CAC per channel. Cut channels with above-average CAC or low volume.",
          "Reinvest cut-channel budget into the winning channel. Concentration produces compounding returns.",
          "Build the email sequence for the winning channel's customers. They have specific objections and questions.",
        ],
        watchFor:
          "Spreading across 5+ channels because 'one might break out'. Concentration almost always wins at this scale.",
      },
      {
        title: "Phase 2: First operational lift",
        timeBand: "$2.5k - $5k MRR",
        whatItLooksLike:
          "Founder time is the constraint. Support emails, customer onboarding, and product work all want the same hours. Something starts to slip.",
        whatToDo: [
          "Document customer support FAQs and build a self-serve help center. 30-50% of support volume becomes self-serve.",
          "Build the post-purchase onboarding sequence. Customers who self-serve onboarding retain better.",
          "Outsource ONE function — usually support or marketing operations — to a part-time contractor.",
        ],
        watchFor:
          "Hiring a full-time employee at $3k MRR. Premature; the cost structure does not support it.",
      },
      {
        title: "Phase 3: Pricing and expansion revenue",
        timeBand: "$5k - $7.5k MRR",
        whatItLooksLike:
          "ARPU becomes a lever. Adding a higher tier, raising prices for new customers, or shipping a premium add-on grows MRR faster than acquisition alone.",
        whatToDo: [
          "Introduce a higher-priced tier. Existing customers grandfather; new customers see the new pricing.",
          "Identify the 10-20% of customers who would pay more for premium support, faster onboarding, or advanced features.",
          "Build expansion-revenue paths (seat additions, usage-based, premium tiers).",
        ],
        watchFor:
          "Raising prices without grandfathering. Existing-customer goodwill is the highest-value asset at this stage.",
      },
      {
        title: "Phase 4: Crossing $10k MRR",
        timeBand: "$7.5k - $10k MRR",
        whatItLooksLike:
          "MRR continues. Churn becomes more visible — at this scale, even 5% monthly churn means losing $500 of MRR per month that must be replaced before growth.",
        whatToDo: [
          "Calculate net revenue retention (NRR). Above 100% means expansion offsets churn; below 100% means acquisition has to outrun churn.",
          "Hire the first full-time employee or full-time contractor if NRR is above 100% and runway supports it.",
          "Set the next milestone: $25k or $50k MRR. Without a target, growth plateaus.",
        ],
        watchFor:
          "Confusing $10k MRR with 'made it'. $10k MRR is sustainable indie territory but not yet a venture-grade business. Decide intentionally which path you are on.",
      },
    ],
    commonDetours: [
      "Hiring before unit economics close. Each hire that does not match unit-economics math compresses margin and forces more acquisition.",
      "Switching primary acquisition channels at $5k MRR. Disruptive at this scale; usually loses 60+ days of growth.",
      "Raising prices for existing customers. Possible to do honestly, but the risk of mass churn at this stage is real. Most indie SaaS grandfather instead.",
    ],
    successDefinition:
      "$10k MRR sustained for 3+ consecutive months, NRR above 90%, and an operational structure that does not depend on the founder doing everything.",
    stuckSignal:
      "Stuck at $3k-$5k MRR for 9+ months. Usually a channel-concentration problem; sometimes a product-fit ceiling. The diagnostic is the founder's calendar — if 80% of time is on product or support, the constraint is operational, not acquisition.",
    relatedNiches: ["saas-founders", "indie-hackers"],
    faqs: [
      {
        q: "When should I raise prices?",
        a: "When NRR is above 100% AND demand exceeds your ability to serve at current price. Raising prices without these conditions usually accelerates churn.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "from-solo-to-team",
    from: "Solo founder, no employees",
    to: "Founding team of 2-5 people",
    displayName: "From solo founder to founding team",
    metaTitle: "From Solo Founder to Founding Team (SaaS Journey)",
    metaDescription:
      "The structural journey from solo to small team. Phases, hiring triggers, the role-allocation framework, and the common mistakes.",
    intro:
      "The journey from solo to founding team is the hardest psychological transition in indie SaaS. The solo identity is part of the founder's brand; bringing on team members shifts that. The template names four phases with the specific hiring triggers and the role-allocation framework.",
    typicalTimeBand:
      "12-36 months from the decision to hire to a stable 3-5 person team. The variance is in whether the founder hires for fit or for skill alone.",
    phases: [
      {
        title: "Phase 1: First part-time contractor",
        timeBand: "$2k-$5k MRR",
        whatItLooksLike:
          "Founder identifies the ONE function that consumes the most non-strategic time (usually support, content, or operations) and hires a part-time contractor.",
        whatToDo: [
          "Pick the function based on what most reliably consumes 10+ hours per week.",
          "Hire on a 30-day trial. Pay properly; cheap-hire usually produces re-hiring within 90 days.",
          "Document the work before the hire starts. Verbal handoff fails at this stage.",
        ],
        watchFor:
          "Hiring a 'jack of all trades' to cover everything. Specialist part-time beats generalist part-time at this scale.",
      },
      {
        title: "Phase 2: First full-time hire",
        timeBand: "$10k-$25k MRR",
        whatItLooksLike:
          "Revenue supports a full-time salary. The founder hires for the function that, if owned by someone else, frees the founder to do the work only they can do.",
        whatToDo: [
          "Calculate the math: can the hire's fully-loaded cost (salary + tools + onboarding time) be paid from new MRR within 6 months?",
          "Hire for fit AND skill. At this scale, a wrong hire costs 6-12 months of momentum.",
          "Define the role specifically. 'Marketing person' is the failure mode; 'paid acquisition manager' is the success mode.",
        ],
        watchFor:
          "Hiring a co-founder-level person without co-founder-level equity. Either commit to true co-founder terms or hire at employee terms; in-between produces resentment.",
      },
      {
        title: "Phase 3: Team of 3",
        timeBand: "$25k-$50k MRR",
        whatItLooksLike:
          "Founder, full-time hire #1, and either a second full-time hire or a strong part-time contractor. The founder's role shifts from doing to coordinating.",
        whatToDo: [
          "Establish recurring sync meetings. The 3-person team can function with one weekly all-hands and bilateral check-ins.",
          "Document decisions and rationale. The team needs to know why, not just what.",
          "Continue customer development. Founders who delegate customer development lose touch with the product within months.",
        ],
        watchFor:
          "Stopping customer-development conversations. The founder remains the customer-development engine even with hires.",
      },
      {
        title: "Phase 4: Stable team of 3-5",
        timeBand: "$50k+ MRR",
        whatItLooksLike:
          "Founder + 2-4 team members. Roles are clear. The founder is the still-essential strategic driver but no longer does all the work.",
        whatToDo: [
          "Define each role's specific accountabilities. Ambiguity at this scale costs months.",
          "Build a hiring pipeline for future roles even if not hiring yet. Pipeline takes 6+ months to mature.",
          "Set quarterly company goals. The 'just do good work' mode does not coordinate a team.",
        ],
        watchFor:
          "Founder identity drift. Many founders feel less essential at this stage and either over-hire or under-hire as a result. Honest self-check on what the founder uniquely contributes.",
      },
    ],
    commonDetours: [
      "Hiring family or close friends in early phases. Mixes employment and personal relationships in ways that rarely survive the first conflict.",
      "Equity for early employees without vesting. A 4-year vest with 1-year cliff is standard; skipping it almost always produces founder regret.",
      "Hiring before product-market fit is confirmed. Hires need a product to sell; pre-PMF hires often pivot the company without intending to.",
    ],
    successDefinition:
      "Stable 3-5 person team operating without founder presence for routine work, with the founder focused on strategic-only decisions and customer development.",
    stuckSignal:
      "Founder still doing 60+ hours per week at $50k+ MRR with 2+ employees. Either the wrong work was delegated, the wrong hires were made, or the founder has not let go of operational ownership.",
    relatedNiches: ["saas-founders", "indie-hackers", "agency-owners"],
    faqs: [
      {
        q: "Should I bring on a co-founder later?",
        a: "Rarely worth it after launch. The 'co-founder' role at $25k+ MRR is almost always an employee role with co-founder equity, which produces equity overhang without the early-stage commitment co-founder equity is meant to compensate.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "from-builder-to-marketer",
    from: "Founder who only builds",
    to: "Founder who builds AND markets",
    displayName: "From builder to marketer-builder",
    metaTitle: "From Builder to Marketer-Builder (SaaS Journey)",
    metaDescription:
      "The structural journey for technical founders learning to market. Phases, the specific skill build, and the mental shift that has to happen.",
    intro:
      "The journey from 'I just build' to 'I build AND market' is the single most important transition for technical indie SaaS founders. Without it, the product is a tree falling in the woods. The template names the four phases with the specific skill builds and the mental shifts required at each phase.",
    typicalTimeBand:
      "12-24 months from the decision to learn marketing to functional-marketer-founder status. Faster for founders who hire marketing help; slower for those who build the skill solo.",
    phases: [
      {
        title: "Phase 1: Acceptance",
        timeBand: "Months 0-3",
        whatItLooksLike:
          "Founder accepts that 'better product' will not produce customers on its own. The marketing work is real work, not 'just hype'.",
        whatToDo: [
          "Allocate 5-10 hours per week to marketing-shaped work — writing, audience-building, customer development.",
          "Read one marketing book a quarter (Brunson, Cialdini, Dunford). The framework gives the work structure.",
          "Stop saying 'I'm bad at marketing' out loud. The identity is sticky.",
        ],
        watchFor:
          "Continuing to read marketing without applying. Knowledge without execution does not move customers.",
      },
      {
        title: "Phase 2: First public work",
        timeBand: "Months 3-9",
        whatItLooksLike:
          "Founder ships their first public marketing artifact — a Twitter thread, a launch post, a personal email campaign. The first feedback arrives.",
        whatToDo: [
          "Pick ONE channel to learn (Twitter, LinkedIn, newsletter, cold email). Multi-channel beginners almost always fail.",
          "Post or send something every week. Quality matters less than cadence in the first 3 months.",
          "Iterate based on response. Lack of engagement is data; analyze rather than internalize as failure.",
        ],
        watchFor:
          "Quitting after 4-6 weeks of no engagement. Most channels take 3-6 months of consistent output to start producing.",
      },
      {
        title: "Phase 3: Compound output",
        timeBand: "Months 9-18",
        whatItLooksLike:
          "Audience starts to compound. Posts get engagement. Marketing work feels less foreign. Some customers cite marketing content as their referrer.",
        whatToDo: [
          "Track which marketing artifacts produce customers, not just engagement. Attribution matters.",
          "Build a content cadence that includes one product-related post per week (without selling) and one promotional post per month.",
          "Start building the email list. Twitter / LinkedIn audiences are rented; email is owned.",
        ],
        watchFor:
          "Confusing engagement with conversion. A post with 1,000 likes that produces 0 customers is less valuable than a post with 50 likes that produces 5.",
      },
      {
        title: "Phase 4: Marketer-builder",
        timeBand: "Months 18+",
        whatItLooksLike:
          "Founder spends 30-50% of working time on marketing and feels comfortable doing it. Marketing decisions are made with the same rigor as product decisions.",
        whatToDo: [
          "Allocate marketing time as deliberately as product time. Both deserve calendar protection.",
          "Hire help for marketing operations (analytics, email setup, copy editing) before hiring for strategy.",
          "Continue learning. Marketing fundamentals do not change; tactics do.",
        ],
        watchFor:
          "Outsourcing marketing strategy too early. The founder is the brand voice at this scale; outsourcing strategy means outsourcing positioning.",
      },
    ],
    commonDetours: [
      "Hiring a 'marketing person' before the founder has done the work themselves. The founder cannot evaluate marketing hires they cannot do themselves.",
      "Trying to learn paid acquisition before organic. Paid amplifies; without organic understanding, paid burns money.",
      "Outsourcing content to agencies before the founder has voice. Agencies produce generic content; founder content compounds.",
    ],
    successDefinition:
      "Founder produces 1+ piece of marketing content per week consistently, the audience grows month-over-month, and a clear acquisition channel attributes 30%+ of new customers.",
    stuckSignal:
      "Past month 12 with no audience growth (followers, subscribers, or attribution) on the chosen channel. Almost always traceable to inconsistent cadence — not lack of talent.",
    relatedNiches: [
      "indie-hackers",
      "saas-founders",
      "no-code-builders",
      "ai-wrappers",
    ],
    faqs: [
      {
        q: "What if I genuinely hate marketing?",
        a: "Hire a marketing-first co-founder or pay for marketing services with equity-level commitment. The founder who skips both rarely builds a SaaS that grows past $1k MRR.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "from-launch-fail-to-relaunch",
    from: "Failed first launch (zero or near-zero traction)",
    to: "Successful relaunch with verified paying customers",
    displayName: "From failed launch to successful relaunch",
    metaTitle: "From Failed Launch to Successful Relaunch (SaaS)",
    metaDescription:
      "The structural journey from a flat-line launch to a working relaunch. Phases, the diagnosis-rebuild-relaunch loop, and the common detour traps.",
    intro:
      "Most indie SaaS launches do not produce significant traction. The relaunch journey is the most under-discussed and the most important — recovering from a flat-line launch produces founders who actually understand what works. The template names the five phases with the specific diagnosis work between launches.",
    typicalTimeBand:
      "60-180 days from realizing the first launch failed to the successful relaunch. Faster when the diagnosis is clear; slower when the founder cycles through cosmetic fixes first.",
    phases: [
      {
        title: "Phase 1: Honest diagnosis",
        timeBand: "Weeks 0-3 after the failed launch",
        whatItLooksLike:
          "Founder accepts that the launch failed. Numbers are documented honestly — visitors, signups, paying customers. The shock fades; the analysis starts.",
        whatToDo: [
          "Write a no-spin retrospective. What happened, what did not, what you learned.",
          "Run the launch URL through the Brunson diagnostic. Label the failure mode: Wrong Person, Weak Offer, or Weak Belief.",
          "Talk to the few people who DID sign up but did not convert. They are the most valuable feedback source you have.",
        ],
        watchFor:
          "Cosmetic-fix instinct. Redesigning the landing page or 'fixing the copy' without diagnosing rarely fixes the root issue.",
      },
      {
        title: "Phase 2: Root-cause rebuild",
        timeBand: "Weeks 3-8",
        whatItLooksLike:
          "Specific rebuild work tied to the diagnosis. If Wrong Person: re-pick the audience. If Weak Offer: rebuild the offer. If Weak Belief: rebuild the trust elements.",
        whatToDo: [
          "Pick ONE of the three failure modes to fix first. Trying to fix all three at once produces no clean signal.",
          "Test the fix with 5-10 real people in the target audience before relaunching. They tell you whether the fix lands.",
          "Document what changed. The relaunch retrospective will compare.",
        ],
        watchFor:
          "Rebuilding the product instead of the funnel. Product rebuilds delay relaunches by months and rarely change the outcome.",
      },
      {
        title: "Phase 3: Quiet relaunch",
        timeBand: "Weeks 8-12",
        whatItLooksLike:
          "Soft relaunch to 50-200 named people. Not a public launch — a targeted re-engagement of the audience built between launches.",
        whatToDo: [
          "Email the existing list with the rebuild rationale. Honesty about the failed first launch builds trust.",
          "Direct outreach to 30-50 named people in the new target audience.",
          "Track every conversion. Each is signal about whether the rebuild worked.",
        ],
        watchFor:
          "Public relaunch before the soft relaunch. Public relaunches fail twice as often as soft ones when the diagnosis is wrong.",
      },
      {
        title: "Phase 4: Public relaunch",
        timeBand: "Weeks 12-16",
        whatItLooksLike:
          "If the soft relaunch produced paying customers, public relaunch to the wider audience. If not, return to Phase 1 with the new data.",
        whatToDo: [
          "Treat the public relaunch like a first launch — pre-launch supporter list, launch-day cadence, post-launch follow-up.",
          "Write the public retrospective on the rebuild. The 'what we changed and why' post is its own marketing asset.",
          "Set the success metric: a specific customer count by a specific date.",
        ],
        watchFor:
          "Underselling the rebuild. Mentioning the failed first launch in the relaunch is honest and effective; hiding it loses the credibility win.",
      },
      {
        title: "Phase 5: Sustained operation post-relaunch",
        timeBand: "Weeks 16+",
        whatItLooksLike:
          "Relaunch produced traction. The founder operates on the new positioning. Customer count grows; the patterns from the rebuild hold.",
        whatToDo: [
          "Document what worked in the rebuild. The patterns become operating principles.",
          "Continue tracking the original failure mode for return signs.",
          "Build the next milestone target (first 10 customers, $1k MRR, etc.).",
        ],
        watchFor:
          "Forgetting what was learned. The rebuild lessons are the most valuable founder asset; losing them costs you the next pivot.",
      },
    ],
    commonDetours: [
      "Cycling through cosmetic fixes (logo, color, headline tweaks) for months. Cosmetic-only fixes rarely change outcomes.",
      "Pivoting the product instead of fixing the funnel. Pivoting too early means losing the customer-development data already collected.",
      "Walking away after the first failed launch. Most successful indie SaaS founders had multiple failed launches before the one that worked.",
    ],
    successDefinition:
      "Relaunch produces 5+ paying customers within 60 days, attribution data is clean, and the founder can articulate what was wrong about the first launch versus what is right now.",
    stuckSignal:
      "Past 90 days from failed launch with no relaunch shipped. Diagnosis paralysis is the most common stall; cosmetic-fix cycling is the second. Re-read the original retrospective and pick ONE thing to ship by month-end.",
    relatedNiches: ["indie-hackers", "saas-founders", "no-code-builders"],
    faqs: [
      {
        q: "Should I relaunch with the same name or rebrand?",
        a: "Same name unless the brand itself is the problem. Rebranding adds a confusion cost that relaunches rarely benefit from. Almost always, the brand is fine and the positioning is what changed.",
      },
    ],
    lastVerified: "2026-05-19",
  },
];

export const JOURNEY_SLUGS: ReadonlyArray<string> = JOURNEY_ENTRIES.map(
  (e) => e.slug,
);

export function getJourneyBySlug(slug: string): JourneyEntry | undefined {
  return JOURNEY_ENTRIES.find((e) => e.slug === slug);
}

// Build-time guard: every relatedNiches slug must resolve.
{
  const known = new Set<string>(NICHE_SLUGS);
  for (const entry of JOURNEY_ENTRIES) {
    for (const slug of entry.relatedNiches) {
      if (!known.has(slug)) {
        throw new Error(
          `journeys.ts: entry "${entry.slug}" references unknown niche slug "${slug}".`,
        );
      }
    }
  }
}
