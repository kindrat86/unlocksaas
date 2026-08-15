/**
 * /skill/[slug] pSEO catalog — founder skills to build.
 *
 * Each entry covers ONE specific founder skill (customer development,
 * cold email writing, testimonial asks, pricing conversations, etc.)
 * with what the skill is, why it matters, how to build it, common
 * failure modes when self-teaching, and the practice cadence.
 *
 * Distinct from:
 *   - /from-x-to-y (multi-month journey patterns)
 *   - /founder-mistake (strategic-level mistake fixes)
 *   - /should-i-build (pre-revenue build decisions)
 *
 * Schema: HowTo (practice plan as steps) + Article + FAQPage +
 * BreadcrumbList. HowTo is right for skill-building plans.
 *
 * Brunson Hard-Rule:
 *   - No invented time-to-mastery claims. Bands are bands.
 *   - Practice plans reflect what we have actually seen work, not
 *     idealized syllabi.
 *   - Cross-links to /glossary, /template, and /objection resolve via
 *     build-time guards.
 */

import { GLOSSARY_SLUGS } from "./glossary";

export interface SkillPracticeStep {
  title: string;
  description: string;
  cadence: string;
}

export interface SkillFaq {
  q: string;
  a: string;
}

export interface SkillEntry {
  slug: string;
  /** Short skill label. */
  skillName: string;
  /** Full display name. */
  displayName: string;
  metaTitle: string;
  metaDescription: string;
  /** 2-3 sentence intro. */
  intro: string;
  /** Why this skill specifically matters for indie SaaS founders. */
  whyItMatters: string;
  /** What "good" looks like. */
  whatGoodLooksLike: string;
  /** Practice steps to build the skill. */
  practicePlan: ReadonlyArray<SkillPracticeStep>;
  /** Common failure modes when self-teaching this skill. */
  failureModes: ReadonlyArray<string>;
  /** Typical time-to-functional band. */
  timeToFunctionalBand: string;
  /** Related glossary slugs. */
  relatedGlossary: ReadonlyArray<string>;
  faqs: ReadonlyArray<SkillFaq>;
  lastVerified: string;
}

export const SKILL_ENTRIES: ReadonlyArray<SkillEntry> = [
  {
    slug: "customer-development",
    skillName: "Customer development",
    displayName: "Skill: customer development",
    metaTitle: "How to Build Customer Development Skill (SaaS)",
    metaDescription:
      "What customer development is for indie SaaS, why it matters, the 5-week practice plan, and the failure modes when founders self-teach it.",
    intro:
      "Customer development is the practice of having structured, regular conversations with real customers and prospects to learn what they actually need. It is the highest-leverage skill in pre-revenue indie SaaS and the one founders most often skip. The practice is simple in structure and hard in execution.",
    whyItMatters:
      "Almost every Brunson Wrong Person diagnosis traces back to insufficient customer development. The founder is guessing what the customer wants instead of asking. Five hours per week of structured customer conversations produces more product-direction signal than 50 hours of building.",
    whatGoodLooksLike:
      "Five customer-development conversations per week, each 20-30 minutes, with named real prospects or customers. The founder takes structured notes, identifies patterns across conversations, and adjusts positioning or product based on what is consistently heard. The founder can name the top 3 themes from the last 30 conversations.",
    practicePlan: [
      {
        title: "Build the conversation list",
        description:
          "List 30 named real people in your target audience — past customers, churned customers, signed-up-but-did-not-buy, dream-100 prospects. Tag each with status and last contact date.",
        cadence: "One-time setup; refresh monthly.",
      },
      {
        title: "Reach out for 30-minute conversations",
        description:
          "Personal email or DM offering 20-30 minutes. No agenda template; just 'I am building X, I would value your perspective on it'. Aim for 5 conversations per week.",
        cadence: "5 outreach asks per week, ongoing.",
      },
      {
        title: "Run the conversation with one structural rule",
        description:
          "Talk less than 30% of the time. The prospect talks 70%+. Open-ended questions, no pitch, no demo unless asked. The single rule that distinguishes customer development from sales calls.",
        cadence: "Per conversation.",
      },
      {
        title: "Document the conversation immediately",
        description:
          "Within 60 minutes after the call: write down 3 things the prospect said verbatim, 1 surprise, and what changed in your understanding. Store in a system you will re-read (Notion, Airtable, a doc).",
        cadence: "Per conversation, within 60 minutes.",
      },
      {
        title: "Weekly pattern review",
        description:
          "Re-read the last 5 conversations. Note recurring themes, contradictions, and surprises. Decide one thing to change (positioning, product, target) based on the pattern, not a single conversation.",
        cadence: "Weekly, 30-60 minutes.",
      },
    ],
    failureModes: [
      "Talking too much. The founder explains the product instead of letting the prospect describe their world.",
      "Treating conversations as demos in disguise. The prospect feels pitched and shuts down.",
      "Skipping documentation. Memory is unreliable; patterns require written record.",
      "Acting on single conversations. Customer development is pattern-based; one strong opinion is data, not direction.",
      "Stopping after the first 10 conversations because 'I have enough now'. Customer development is ongoing — the next 10 conversations have new patterns.",
    ],
    timeToFunctionalBand:
      "30-90 days from start of practice to functional skill. 'Functional' means: founder can run a conversation without falling into pitch mode, takes structured notes, and identifies patterns. Mastery is 12-24 months of sustained practice.",
    relatedGlossary: ["wrong-person", "hook", "dream-100"],
    faqs: [
      {
        q: "How many conversations are 'enough' to make a product decision?",
        a: "At least 10 conversations from the same target cohort showing the same pattern, ideally across a 2-3 week window. Single conversations are anecdotes; consistent patterns across cohorts are signal.",
      },
      {
        q: "Should I record customer-development calls?",
        a: "Ask permission; some do, some don't. Real-time notes are usually more valuable than recordings because they force you to identify what mattered. Recordings without re-listening are not useful.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "cold-email-writing",
    skillName: "Cold email writing",
    displayName: "Skill: cold email writing",
    metaTitle: "How to Build Cold Email Writing Skill (Indie SaaS)",
    metaDescription:
      "What good cold email looks like for indie SaaS, why most founders write it badly, the 4-week practice plan, and the common failure modes.",
    intro:
      "Cold email is the highest-ROI outbound channel pre-revenue indie SaaS founders have access to. Most founders write it badly because they default to marketing-speak or to apology-mode. The skill is short, specific, and personal — and it is teachable in 4-8 weeks of structured practice.",
    whyItMatters:
      "Founder time spent on cold email beats almost every paid acquisition channel pre-revenue. A 100-message manual outreach campaign produces 10-25 replies and 1-3 paying customers from a target audience. The same conversion rate from paid ads costs $5,000-$15,000.",
    whatGoodLooksLike:
      "Under 100 words. Specific personalization tied to something verifiable about the recipient. One clear ask the recipient can answer with one sentence. From a real human address with a real signature. Reply rate of 15-30% on a dream-100 list.",
    practicePlan: [
      {
        title: "Build the dream-100 list",
        description:
          "100 named people you would be proud to have as customers, with one specific verifiable detail about each. List quality is the single biggest factor in cold email success — bigger than the message itself.",
        cadence: "One-time build; expand by 20-50 quarterly.",
      },
      {
        title: "Draft one message template",
        description:
          "Under 100 words. Three slots: personalization (verifiable detail), why-now (reason this is relevant), specific ask (yes/no question or 15-min call). No marketing language.",
        cadence: "One-time draft; iterate based on response.",
      },
      {
        title: "Send 5-10 messages per day, manually personalized",
        description:
          "Tools that send 50+ are sending generic spam. Genuinely personal outreach has a ceiling of 5-15 messages per day. The personalization is the work that earns the reply.",
        cadence: "Daily, 30-60 minutes.",
      },
      {
        title: "Reply to every response within 5 minutes during work hours",
        description:
          "Cold email replies that arrive in the first 5 minutes are 5-10x more likely to convert. Inbox-monitoring during send windows is part of the practice.",
        cadence: "Continuous during send periods.",
      },
      {
        title: "Track reply rate per cohort",
        description:
          "Different cohorts of the dream-100 reply at different rates. Track which audience-axis (industry, seniority, recent action) correlates with higher reply. Refines the next 100.",
        cadence: "Weekly review.",
      },
    ],
    failureModes: [
      "Using a CRM-style mass-personalization tool. Detectable. Reply rate collapses.",
      "Long messages. Under 100 words is the discipline. 200-word cold emails get skipped before they are read.",
      "Vague asks. 'Let me know what you think' is the failure mode. Specific yes/no or specific calendar offers work.",
      "Marketing-speak. 'Synergies', 'leverage', 'solutions' kill the message instantly. Plain human language wins.",
      "No follow-up. One follow-up at the 4-7 day mark roughly doubles total reply rate. Skipping it leaves replies on the table.",
    ],
    timeToFunctionalBand:
      "4-12 weeks from start of practice to a stable 15-25% reply rate on a dream-100 list. Faster for founders who already write well; slower for those defaulting to corporate-speak.",
    relatedGlossary: ["dream-100", "story", "offer"],
    faqs: [
      {
        q: "How many follow-ups should I send?",
        a: "Exactly one, at the 4-7 day mark. Two-plus follow-ups produce minimal additional reply and damage sender reputation. The first follow-up roughly doubles the total reply rate; the second adds maybe 10%.",
      },
      {
        q: "Should I use AI to draft cold emails?",
        a: "Use it for the verbatim words you cannot yet write; do not use it for the entire message. Recipients detect generic-AI-tone within seconds. Use AI to compress your own ideas, not to generate them.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "asking-for-testimonials",
    skillName: "Asking for testimonials",
    displayName: "Skill: asking for testimonials honestly",
    metaTitle: "How to Ask for Testimonials Honestly (Indie SaaS)",
    metaDescription:
      "When to ask, what to ask for, the practice plan, and the failure modes most founders hit. The Brunson-Hard-Rule honest version.",
    intro:
      "Asking for testimonials looks easy and is not. The wrong timing produces hollow quotes; the wrong ask produces fake-sounding answers; the wrong framing produces customers who feel pressured. The honest version is specific, well-timed, and respects the customer's agency.",
    whyItMatters:
      "Testimonials with verifiable details are the highest-trust marketing asset indie SaaS can ship. Pre-cohort case studies; mid-build social proof; post-launch credibility. But every fabricated, padded, or vague testimonial corrodes trust faster than the good ones build it.",
    whatGoodLooksLike:
      "Ask at the right moment (first observable outcome, not first purchase). Ask for a specific verifiable detail (a metric, a screenshot, a named outcome). Offer to write a first draft for the customer to edit (not to fabricate). Publish only what is approved and accurate. Customer feels valued, not transactional.",
    practicePlan: [
      {
        title: "Track the 'first observable outcome' moment for each customer",
        description:
          "First time the customer hits a real milestone in your product (first booked meeting, first email sent, first paying-customer-of-theirs). This is the testimonial-ask window, not the post-purchase day.",
        cadence: "Per customer, tracked in your CRM or notes.",
      },
      {
        title: "Send a personal ask at the moment",
        description:
          "Real founder email. One question: 'Can you tell me what happened just now?' Open-ended; do NOT propose words yet. The customer's own first answer is the gold.",
        cadence: "Within 48 hours of the moment.",
      },
      {
        title: "Convert the answer to a testimonial offer",
        description:
          "Send back a draft: 'Here is one way to phrase that — would you be comfortable with this on our site, attributed to you with your role?' Edit until they are.",
        cadence: "Within 48 hours of receiving their answer.",
      },
      {
        title: "Always include a verifiable detail",
        description:
          "Real name, real role, real company URL or LinkedIn. If they are nervous about full attribution, offer first-name + role + industry as fallback. Anonymous testimonials read as fabricated.",
        cadence: "Every testimonial.",
      },
      {
        title: "Publish and notify",
        description:
          "When the testimonial goes live, let the customer know. Many will share it themselves, which is the highest-leverage organic amplification.",
        cadence: "Within 24 hours of publishing.",
      },
    ],
    failureModes: [
      "Asking too early. Pre-outcome testimonials are hollow.",
      "Proposing the words before hearing the customer's own. Words you put in their mouth feel transactional.",
      "Skipping verification. Anonymous quotes lose trust faster than zero quotes.",
      "Bulk-asking via Typeform. Mass requests produce mass non-responses; personal asks produce personal replies.",
      "Editing the testimonial after publication without re-approval. Trust violation.",
    ],
    timeToFunctionalBand:
      "30-60 days of sustained practice from the first ask to a reliable system that produces 1-3 testimonials per month. Faster for founders comfortable with direct asks; slower for those who default to apology-mode.",
    relatedGlossary: ["verified-builder", "story", "weak-belief"],
    faqs: [
      {
        q: "Should I incentivize testimonials with a discount?",
        a: "No. Incentivized testimonials read as paid endorsements and lose trust. The exception is when the incentive is clearly disclosed in the testimonial itself.",
      },
      {
        q: "What if no customer says yes?",
        a: "Then the underlying product or service is not producing testimonial-worthy outcomes yet. Fix the outcome first; testimonials follow.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "pricing-conversation",
    skillName: "Holding a pricing conversation",
    displayName: "Skill: holding a pricing conversation",
    metaTitle: "How to Hold a Pricing Conversation (SaaS Founder Skill)",
    metaDescription:
      "How to talk about price with prospects without defending or discounting. The practice plan, the discomfort to expect, and the common failure modes.",
    intro:
      "The pricing conversation is the moment most indie SaaS founders' nerves show through. The instinct is to apologize, to discount, or to over-explain — all of which lose. The skill is to state the price clearly, leave space, and respond to objections honestly.",
    whyItMatters:
      "Pricing conversations gone wrong produce two outcomes: customers who buy at a discount and then churn (because the unit economics do not work) and customers who do not buy because the founder's discomfort reads as 'this is not worth it'. Pricing conversations gone right produce customers who stick.",
    whatGoodLooksLike:
      "Founder states the price in 5-10 words without softening it ('It is $49 a month, billed monthly'). Pause. Let the prospect respond. Address what they actually say, not what you fear they will say. Walk away from prospects who want a discount the unit economics cannot support.",
    practicePlan: [
      {
        title: "Practice stating the price in 5-10 words",
        description:
          "Out loud, in front of a mirror or to a peer. No softening. No 'so, um, basically'. Just the price.",
        cadence: "Daily for 1-2 weeks, then in real conversations.",
      },
      {
        title: "Build the response set for the four common reactions",
        description:
          "Reactions: 'that's reasonable', 'can I get a discount', 'that's expensive', silence. Each has a specific response. Prepare and practice them.",
        cadence: "One-time prep; refine as you encounter new reactions.",
      },
      {
        title: "Stop apologizing for the price",
        description:
          "Apologetic framing ('it is only $49') invites the prospect to argue. Confident framing ('it is $49 a month') invites them to decide. The change is in tone, not words.",
        cadence: "Every conversation.",
      },
      {
        title: "Hold silence after stating the price",
        description:
          "5-10 seconds of silence after the price is the prospect's processing time. Filling that silence with explanation undoes the work the silence is doing.",
        cadence: "Every conversation.",
      },
      {
        title: "Track which reactions lead to closed deals",
        description:
          "After 10 pricing conversations, note which prospect-reactions produced paying customers. The pattern shapes which reactions to ignore (do not chase the discount-askers) and which to lean into.",
        cadence: "After every 10 conversations.",
      },
    ],
    failureModes: [
      "Lowering the price before the prospect even pushes back. The founder's own discomfort produces the discount.",
      "Over-explaining. After stating the price, more words usually reduce closure rate.",
      "Discounting on first request. Trains every future prospect to ask for the same discount.",
      "Avoiding the conversation entirely. Many founders never state the price out loud and lose deals via vague pricing emails.",
      "Treating every objection as the same. 'Too expensive' is rarely about price; it is about perceived value-fit.",
    ],
    timeToFunctionalBand:
      "20-50 pricing conversations from start to functional. The discomfort never fully goes away; the practice teaches you to operate inside the discomfort.",
    relatedGlossary: ["offer", "weak-offer", "stack-slide"],
    faqs: [
      {
        q: "Should I ever discount?",
        a: "Rarely, and for specific honest reasons (cohort-launch discount, multi-seat discount, founding-customer locked-in pricing). Never as a response to objection pressure — that produces low-retention customers.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "writing-in-public",
    skillName: "Writing in public",
    displayName: "Skill: writing in public",
    metaTitle: "How to Build Writing-In-Public Skill (Indie SaaS)",
    metaDescription:
      "How indie SaaS founders build the writing-in-public skill. The practice plan, what good looks like, the failure modes, and the time-to-functional band.",
    intro:
      "Writing in public is the highest-leverage non-technical skill an indie SaaS founder can build. The audience that compounds from public writing is the launch foundation, the customer-research panel, and the hiring pipeline. Most founders skip it because it feels exposing.",
    whyItMatters:
      "An indie SaaS launch lands on the audience the founder has built. No audience = no launch. Writing in public is how the audience builds; it is not optional for founders aiming for sustainable indie SaaS at $1k+ MRR.",
    whatGoodLooksLike:
      "One published artifact per week minimum (Twitter/X thread, LinkedIn post, newsletter issue, blog post). Specific over abstract. Personal over corporate. Honest about struggles, not just wins. Audience growing month-over-month, not day-over-day.",
    practicePlan: [
      {
        title: "Pick ONE channel and ONE format",
        description:
          "Twitter threads, LinkedIn posts, newsletter, blog — pick one. Multi-channel beginners almost always fail. The channel choice depends on where your target audience is.",
        cadence: "One-time decision; revisit only after 90 days.",
      },
      {
        title: "Publish one artifact per week for 12 weeks",
        description:
          "Cadence > quality for the first 12 weeks. Most founders quit at week 4 because nothing is happening. The compounding starts at week 8-12.",
        cadence: "Weekly, non-negotiable.",
      },
      {
        title: "Track the engagement, NOT the followers",
        description:
          "Reply rates, save rates, DM volume. Followers are vanity; replies are where the audience-building actually happens. Followers without engagement are noise.",
        cadence: "Weekly review.",
      },
      {
        title: "Repurpose the highest-engagement posts",
        description:
          "The top 10% of posts deserve to be re-shared, reformatted into a newsletter issue, and expanded into a longer piece. Compounding work, not new work.",
        cadence: "Monthly.",
      },
      {
        title: "Build an email list from week 1",
        description:
          "Twitter/LinkedIn followers are rented; email subscribers are owned. Every public post should have a soft path to the email list.",
        cadence: "Continuous, from week 1.",
      },
    ],
    failureModes: [
      "Quitting at week 4-6 because nothing is happening. The audience compounds at week 8-12; quitting early forfeits the compounding.",
      "Switching channels too soon. Each channel takes 3-6 months of consistent output to produce. Spreading thin produces nothing.",
      "Posting about everything. The audience that compounds is the audience around ONE specific topic.",
      "Treating engagement as a feeling, not data. Posts that feel good and produce nothing are less valuable than posts that feel exposing and produce engagement.",
      "Building no email list. Followers are rented; email is owned. Owning matters when platforms change algorithms.",
    ],
    timeToFunctionalBand:
      "3-9 months from start to functional. 'Functional' means: a base audience of 500-2,000 engaged followers, an email list of 200-1,000 subscribers, and the founder posts consistently without it feeling forced.",
    relatedGlossary: ["story", "dream-100", "reluctant-hero"],
    faqs: [
      {
        q: "What if I have nothing to say?",
        a: "You have something to say if you have something to build. Document the building: what you tried, what failed, what you learned, what you decided. Build-in-public content is the easiest entry point for founders without an existing voice.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "customer-support",
    skillName: "Indie SaaS customer support",
    displayName: "Skill: doing customer support well",
    metaTitle: "How Indie SaaS Founders Do Customer Support Well",
    metaDescription:
      "How to do indie SaaS customer support without burning out or losing customers. The practice plan, the rules to set, and the common failure modes.",
    intro:
      "Customer support at indie SaaS scale is the founder's responsibility for a long time. Done well, it produces the highest-trust customers in the cohort; done badly, it burns out the founder and burns trust with customers. The skill is to set rules, communicate them clearly, and execute consistently.",
    whyItMatters:
      "Founders who do support well in months 1-12 retain customers at 2-3x the rate of those who treat it as a chore. The support relationship is part of the product at indie scale; replacing it with automation too early is the most common premature-scale mistake.",
    whatGoodLooksLike:
      "Response within 24 hours during work days; clear off-hours expectations posted publicly; one escalation path for urgent issues; a public help center for self-serve; customer feels heard even when the answer is 'no'.",
    practicePlan: [
      {
        title: "Set explicit response-time expectations",
        description:
          "Post your support hours on the website. 'Mon-Fri response within 24 hours' is honest and reasonable. Setting unreachable expectations (instant) produces resentment when you cannot meet them.",
        cadence: "One-time setup; revisit when load changes.",
      },
      {
        title: "Build a self-serve help center",
        description:
          "Document the top 20 questions you get. Customers self-serve before they email you; founder time is preserved for the conversations that need it.",
        cadence: "Build initially in 1-2 weekends; expand monthly.",
      },
      {
        title: "Reply to every email yourself for the first 50 customers",
        description:
          "Even when it takes longer. The patterns you absorb in customer #1-50 support shape the product. Outsourcing too early skips the lesson.",
        cadence: "Daily, during support hours.",
      },
      {
        title: "Build templates for the recurring 5-10 questions",
        description:
          "Save and reuse responses to the questions you answer most. Template starting point + 30 seconds of personalization beats a fresh write every time.",
        cadence: "After every 10 support emails, evaluate which became repeats.",
      },
      {
        title: "Audit churned customers monthly",
        description:
          "Read the support history of every customer who churned. The pattern of unanswered or poorly-handled questions is the easiest churn-fix you have.",
        cadence: "Monthly.",
      },
    ],
    failureModes: [
      "Replying instantly to everything. Trains customers to expect 24/7 availability the founder cannot sustain.",
      "Defensive responses. Tone matters; even correct answers delivered defensively lose trust.",
      "Skipping the help center because 'I will just answer emails'. The help center is what makes the email volume sustainable.",
      "Outsourcing support before product-fit. Outsourced support cannot make the product decisions inbound questions reveal.",
      "Treating support as separate from product. Every support question is product feedback.",
    ],
    timeToFunctionalBand:
      "30-90 days from first paying customer to a sustainable support cadence. Faster for founders who set expectations up front; slower for founders trying to be 'always available'.",
    relatedGlossary: ["offer", "weak-belief"],
    faqs: [
      {
        q: "When should I hire support help?",
        a: "When you cross 200-500 active customers AND support is genuinely the bottleneck on founder time. Earlier hiring is premature; the founder still needs the pattern-recognition from support volume.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "running-a-demo",
    skillName: "Running a sales demo",
    displayName: "Skill: running a sales demo",
    metaTitle: "How to Run a Sales Demo as an Indie SaaS Founder",
    metaDescription:
      "How to run a sales demo well as a non-sales founder. The structure, the questions to ask first, what NOT to do, and the practice plan.",
    intro:
      "Sales demos at indie SaaS scale are usually 20-40 minute calls run by the founder. Most non-sales founders do them as 'walk through the product' tours, which under-converts. The good demo is question-first, product-second, and tied to a specific named outcome the prospect cares about.",
    whyItMatters:
      "At $50-$500/month pricing, demos are the highest-leverage conversion event. A founder who runs demos well closes 40-60% of demos to paying customers; a founder who runs them badly closes 5-15%. The difference is the skill.",
    whatGoodLooksLike:
      "First 10 minutes: discovery questions about the prospect's context. Next 15-20 minutes: focused product walk-through tied to what they said in discovery. Last 5-10 minutes: pricing, next steps, specific close. Total under 45 minutes; ideally under 30.",
    practicePlan: [
      {
        title: "Write 5-7 discovery questions",
        description:
          "Open-ended questions that surface the prospect's current state, what is broken, what they have tried, and what success would look like. Same questions every demo until you have a system.",
        cadence: "One-time drafting; refine after every 10 demos.",
      },
      {
        title: "Record your first 10 demos",
        description:
          "With permission. Watch them back. Where you talked too much, where you missed a question, where the prospect's energy shifted. Painful and effective.",
        cadence: "First 10 demos.",
      },
      {
        title: "Replace tour-mode with question-mode",
        description:
          "Default product tour: 'and here is feature X'. Question-mode: 'what is your current process for X?' Most founders skip 1-2 features the prospect would not have used anyway and gain time for what matters.",
        cadence: "Every demo from week 2.",
      },
      {
        title: "End every demo with a specific close",
        description:
          "'Based on what you said about X, this seems like a fit. Want to start a trial today, or what would be the right next step?' Specific beats vague every time.",
        cadence: "Every demo.",
      },
      {
        title: "Track close rate per discovery answer",
        description:
          "Specific prospect answers correlate with closes. The patterns shape who you take demos with in the first place.",
        cadence: "Monthly review.",
      },
    ],
    failureModes: [
      "Pure product tour. Demo becomes a feature monologue; prospect tunes out by minute 10.",
      "Demos with no discovery. Founder shows what they want to show, not what the prospect needs to see.",
      "Vague close. 'Let me know what you think' loses to 'want to start today, or what is the right next step?'",
      "60+ minute demos. Long demos rarely close better and exhaust both sides.",
      "Demos with everyone who asks. Qualification before the demo is part of the skill; demos with wrong-fit prospects waste time on both sides.",
    ],
    timeToFunctionalBand:
      "20-40 demos from start to functional. Functional means a stable 30-40% close rate from qualified prospects.",
    relatedGlossary: ["offer", "weak-belief", "story"],
    faqs: [
      {
        q: "Should I do demos at $49/month price points?",
        a: "Rarely. At indie SaaS sub-$100 price points, demos do not pay back the founder time. Self-serve with strong sales pages is usually the better model. Demos make sense at $200+/month or for genuinely complex products.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "founder-content-creation",
    skillName: "Founder content creation",
    displayName: "Skill: founder content creation",
    metaTitle: "How Indie Founders Build Content Creation Skill",
    metaDescription:
      "How to build content creation skill as a non-marketer founder. The 5-week practice plan, the format-fit decision, and the common failure modes.",
    intro:
      "Founder content creation is different from corporate content marketing. Voice over polish. Specific over abstract. Personal over corporate. The skill is to find the format you can sustain and the angle only you can write.",
    whyItMatters:
      "Founder-voice content compounds in a way agency content does not. AI assistants quote founder posts more often than corporate-marketing posts. Distribution channels reward named founders. The audience that compounds from founder content is the foundation of every successful indie SaaS.",
    whatGoodLooksLike:
      "Recognizable founder voice across all artifacts. One sustainable cadence (weekly, bi-weekly, daily — pick one and hold). One central topic that your audience comes for. Mix of teaching, sharing struggles, and small wins. Distribution-aware (formatted for the channel you publish on).",
    practicePlan: [
      {
        title: "Identify your topic-niche",
        description:
          "What ONE topic could you write 100 specific posts about? Not 'startups' — too broad. 'How non-engineers ship SaaS' is the level of specificity. The topic-niche is the discovery anchor.",
        cadence: "1-2 weeks of exploration; commit then.",
      },
      {
        title: "Pick the format you can sustain",
        description:
          "Twitter threads, LinkedIn posts, newsletter issues, blog posts, podcast episodes. Pick based on what you can produce weekly without burnout, not what 'should' work.",
        cadence: "One-time decision; revisit after 90 days.",
      },
      {
        title: "Publish 12 artifacts in the chosen format",
        description:
          "Cadence over quality for the first 12. Quality emerges from volume; volume does not emerge from waiting for quality.",
        cadence: "Weekly minimum.",
      },
      {
        title: "Read the analytics monthly",
        description:
          "Which posts produced replies, shares, signups, sales calls? Pattern-recognize. The next quarter writes more of what worked.",
        cadence: "Monthly review.",
      },
      {
        title: "Repurpose the top 10%",
        description:
          "The best 1-2 artifacts every month deserve a second life — reformatted for a different channel, expanded into a longer piece, or compiled into a newsletter issue.",
        cadence: "Monthly.",
      },
    ],
    failureModes: [
      "Trying to write like a marketing agency. Generic, polished, distant. Loses to the founder's actual voice every time.",
      "Quitting after 4-6 weeks. Audience compounding starts at week 8-12; quitting early forfeits the curve.",
      "Switching topic every quarter. Audience that compounds is around ONE topic.",
      "Writing without distribution awareness. A great Twitter thread copy-pasted to LinkedIn loses.",
      "Outsourcing too early. Outsourced content reads outsourced; the founder is the only one who can sustain the voice.",
    ],
    timeToFunctionalBand:
      "6-12 months of consistent output to compound a useful audience. Functional means 1,000-5,000 engaged followers on the chosen channel and the content production feels sustainable.",
    relatedGlossary: ["story", "dream-100", "reluctant-hero"],
    faqs: [
      {
        q: "What if my topic-niche has no audience?",
        a: "Then either the niche is too narrow or the audience is on a channel you have not tried. Most viable indie SaaS niches have an audience somewhere. Spend 4-6 weeks trying to find it before pivoting the topic.",
      },
    ],
    lastVerified: "2026-05-19",
  },
];

export const SKILL_SLUGS: ReadonlyArray<string> = SKILL_ENTRIES.map((e) => e.slug);

export function getSkillBySlug(slug: string): SkillEntry | undefined {
  return SKILL_ENTRIES.find((e) => e.slug === slug);
}

// Build-time guard: every relatedGlossary slug must resolve.
{
  const known = new Set<string>(GLOSSARY_SLUGS);
  for (const entry of SKILL_ENTRIES) {
    for (const slug of entry.relatedGlossary) {
      if (!known.has(slug)) {
        throw new Error(
          `skills.ts: entry "${entry.slug}" references unknown glossary slug "${slug}".`,
        );
      }
    }
  }
}
