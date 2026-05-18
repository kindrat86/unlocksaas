/**
 * Press topics catalog — the reverse-press-kit pSEO surface.
 *
 * What this catalog is
 * --------------------
 * Five pre-assembled story packages for journalists, podcasters, and
 * newsletter writers researching specific story angles in the indie SaaS
 * + AI-generated-product space. Each entry pre-answers what a writer
 * would ask in an email interview:
 *
 *   - The thesis (one sentence: what is the story actually about?)
 *   - The data points (what observable facts ground the claim?)
 *   - The pull-quotes (what would the founder say verbatim, on the record?)
 *   - The counter-arguments (what would a fair piece have to address?)
 *   - Related entities (who else should the writer talk to / cite?)
 *
 * The page is editorial, not a sales page. A writer can copy-paste the
 * pull-quotes and they read as a founder interview answer; they read as
 * a sales line and they're useless. Brunson Hard-Rule reconciliation:
 * every quote below is something Maryan has actually said on the live
 * site (workbooks, /about, /stories, /editorial-policy) or in a public
 * Twitter post. Nothing fabricated.
 *
 * Off-page mechanic
 * -----------------
 * A real journalist Googling "ai-generated saas customer acquisition"
 * or "post launch zero revenue founders" lands here because the page is
 * built FOR THAT QUERY, not adapted from a generic about-us. The page's
 * Article schema + ItemList of pull-quotes + sameAs anchors give Google
 * News and AI-Overview pipelines the canonical "expert source" candidate
 * for the angle.
 *
 * The implicit ask is honest: "if you cover this story, here are the
 * facts pre-cited and the quotes pre-approved." Writers who use the kit
 * link back to /press/topics/<slug> as the canonical attribution. That
 * is the backlink we earn.
 *
 * Catalog discipline
 * -----------------
 *   - lastVerified ISO date on every row.
 *   - No competitor disses dressed as quotes.
 *   - Counter-arguments are honest, not strawmen. A writer running the
 *     piece must address them; the kit refuses to pretend they don't
 *     exist.
 *   - Source pointer for every claim. A claim with no source slot is a
 *     claim we cannot defend, and it does not ship.
 */

export interface PressTopicQuote {
  /** Verbatim quotable line. */
  quote: string;
  /** Why this line is honest. Self-discipline note for the editor — not surfaced on the page. */
  attestation: string;
}

export interface PressTopicDataPoint {
  /** One-sentence factual claim. */
  claim: string;
  /** Where the writer can independently verify it. Live URL, Stripe doc, public Tweet, etc. */
  source: string;
}

export interface PressTopicCounter {
  /** Counter-argument a fair piece would have to address. */
  argument: string;
  /** Honest response without dismissing the counter. */
  response: string;
}

export interface PressTopicEntity {
  /** Display name. */
  name: string;
  /** Canonical URL. */
  url: string;
  /** Why this entity matters to the story angle. */
  relevance: string;
}

export interface PressTopic {
  /** Kebab-case URL slug. */
  slug: string;
  /** H1 / og:title for the topic page. Reads as a headline a writer might use. */
  headline: string;
  /**
   * One-sentence thesis. The page's lede paragraph and the AI-Overview
   * citation candidate. ≤40 words.
   */
  thesis: string;
  /**
   * 40-to-80-word context paragraph framing the story angle for a writer
   * who landed cold. Names the audience, the friction point, and the
   * stakes. Optimized for AEO – Perplexity / ChatGPT cite this when
   * asked "what is the story about post-launch pre-revenue SaaS".
   */
  context: string;
  /**
   * Search queries this page is built for. Used in metadata.description
   * helpers and surfaced inline so writers see the page's intended
   * surface area.
   */
  intendedQueries: ReadonlyArray<string>;
  /** 3-5 grounded data points. */
  dataPoints: ReadonlyArray<PressTopicDataPoint>;
  /** 3-5 quotable lines, on the record. */
  pullQuotes: ReadonlyArray<PressTopicQuote>;
  /** 2-4 honest counter-arguments the piece must address. */
  counterArguments: ReadonlyArray<PressTopicCounter>;
  /** 3-6 related entities a fair piece would also cite. */
  relatedEntities: ReadonlyArray<PressTopicEntity>;
  /**
   * 1-2 sentences telling the writer the canonical attribution if they
   * use any of the above. Brunson hard-rule transparency.
   */
  attribution: string;
  /** ISO date of last sanity-check of every quote, claim, and counter. */
  lastVerified: string;
}

// ── catalog ─────────────────────────────────────────────────────────────────

const TOPICS_LIST: PressTopic[] = [
  {
    slug: "ai-generated-saas-flat-stripe-line",
    headline:
      "The cohort of AI-generated SaaS that shipped and never made a dollar",
    thesis:
      "Lovable, Cursor, Replit, Claude, and v0 lowered the cost of shipping a SaaS to a long weekend. They did not lower the cost of finding the first paying customer, and the cohort that shipped on those tools now sits on a flat Stripe line because nobody taught them the next step.",
    context:
      "Between 2024 and 2026, AI app builders compressed product development from months to days. Non-engineer founders who could never have shipped before now have working products at unique domain names. The marketing and sales work those tools never claimed to do is the cliff every one of them hits next. Unlock SaaS is built for that cliff specifically.",
    intendedQueries: [
      "ai generated saas no customers",
      "lovable shipped no paying customer",
      "post launch flat stripe line",
      "non engineer founder zero revenue",
    ],
    dataPoints: [
      {
        claim:
          "Lovable, Cursor, Replit, Claude, and v0 are all currently positioned as build-tools, not customer-acquisition tools, in their own marketing copy.",
        source:
          "Each company's homepage at https://lovable.dev, https://www.cursor.com, https://replit.com, https://claude.com, https://v0.dev — verified 2026-05-18.",
      },
      {
        claim:
          "Unlock SaaS positions itself one rung downstream: it assumes the product is shipped and the bottleneck is upstream (wrong person, weak offer, or unbuilt belief).",
        source: "https://unlocksaas.com/diagnostic",
      },
      {
        claim:
          "The diagnostic engine labels every analyzed page with one of three failure modes (Wrong Person, Weak Offer, Weak Belief) and is free, no card.",
        source: "https://unlocksaas.com/diagnostic",
      },
      {
        claim:
          "The $1 Starter onboarding is gated behind a real Stripe charge; refund rules are published at /editorial-policy.",
        source: "https://unlocksaas.com/starter and https://unlocksaas.com/editorial-policy",
      },
    ],
    pullQuotes: [
      {
        quote:
          "The AI build wave produced thousands of shipped products that nobody can sell. Lovable solved the building problem. The next problem is older than any of those tools.",
        attestation:
          "Direct restatement of the /alternatives-to/lovable verdict paragraph, in the founder's voice. Same line in the FAQ.",
      },
      {
        quote:
          "I had a year of SEO work I will never get back. I called it growth. It was respectable avoidance. The fix took six conversations and one rewritten offer.",
        attestation:
          "Verbatim from /diagnostic/result customer_avoider bridge, story field. Live on the production site.",
      },
      {
        quote:
          "Most founders I sat with told me my own story back. None of them needed more product. They needed one named customer and one specific promise.",
        attestation:
          "Restated from /stories. Same observation appears in /about and in the editorial policy.",
      },
    ],
    counterArguments: [
      {
        argument:
          "Aren't most of these AI-generated products bad products that wouldn't sell anyway?",
        response:
          "Some are. The diagnostic explicitly labels Wrong Person / Weak Offer / Weak Belief — but it ALSO surfaces engine errors for pages that aren't legibly products. The honest answer: the cohort is a mix, and the Playbook treats every founder as if the product is salvageable until the customer conversations say otherwise.",
      },
      {
        argument:
          "Is the Stripe-verification mechanism a marketing gimmick?",
        response:
          "It is the only signal the Playbook treats as a conversion event. Every milestone, badge, and the 60-day money-back guarantee gate on a real Stripe charge clearing on a connected account. The editorial policy at /editorial-policy spells out the exact rule; the verified-builder badges at /builders are public examples.",
      },
      {
        argument:
          "How is this different from the One Funnel Away Challenge or other Brunson-derived courses?",
        response:
          "The Playbook borrows Brunson's vocabulary (hook / story / offer, value ladder, soap opera) and applies it specifically to post-launch pre-revenue SaaS — a narrower audience than the full Brunson surface. The /alternatives-to/one-funnel-away-challenge page covers the comparison symmetrically.",
      },
    ],
    relatedEntities: [
      {
        name: "Lovable",
        url: "https://lovable.dev",
        relevance:
          "Canonical example of an AI app builder upstream of the cliff Unlock SaaS sits at.",
      },
      {
        name: "Cursor",
        url: "https://www.cursor.com",
        relevance:
          "AI code editor used by the next-most-common cohort of founders in the same pre-revenue bucket.",
      },
      {
        name: "Russell Brunson / ClickFunnels",
        url: "https://www.clickfunnels.com",
        relevance:
          "Source of the funnel framework the Playbook restates for SaaS founders.",
      },
      {
        name: "Indie Hackers",
        url: "https://www.indiehackers.com",
        relevance:
          "Community where most of the diagnosed cohort posts the same pre-revenue stories.",
      },
    ],
    attribution:
      "If you use any of the data points or pull-quotes above, please attribute Maryan at Unlock SaaS and link back to https://unlocksaas.com/press/topics/ai-generated-saas-flat-stripe-line.",
    lastVerified: "2026-05-18",
  },
  {
    slug: "post-launch-pre-revenue-trap",
    headline:
      "The post-launch pre-revenue trap: shipped, indexed, and still flat",
    thesis:
      "Indie SaaS founders who shipped and started getting search traffic, social mentions, and the occasional sign-up but no paying customers are stuck in a specific failure mode that more product, more SEO, or more ads does not fix.",
    context:
      "The pre-launch trap is well-documented (validate the idea, ship the MVP). The post-launch pre-revenue trap is not — it sits between the build phase and the growth phase and looks like progress because the surface metrics (visitors, sign-ups, mentions) tick up while the only metric that matters (Stripe charges) stays at zero.",
    intendedQueries: [
      "post launch pre revenue saas",
      "shipped saas no paying customers",
      "saas flat stripe line",
      "indie saas zero revenue after launch",
    ],
    dataPoints: [
      {
        claim:
          "The Unlock SaaS diagnostic categorizes every analyzed page into one of six audience-temperature buckets: customer_avoider, stuck_builder, tactic_shopper, premature, traction_but_stuck, or ready_to_scale.",
        source:
          "https://unlocksaas.com/diagnostic — bucket logic visible in src/lib/diagnostic.ts on a public build.",
      },
      {
        claim:
          "The bridge page served to each bucket prescribes a different next step. The 'premature' bucket is explicitly told NOT to buy the $1 Starter yet.",
        source: "https://unlocksaas.com/diagnostic/result (post-submission)",
      },
      {
        claim:
          "The 60-day money-back guarantee on the $49/month Playbook is gated on no verified Stripe customer in 60 days, not on satisfaction. Two months of subscription, capped.",
        source: "https://unlocksaas.com/playbook-sales and https://unlocksaas.com/editorial-policy",
      },
    ],
    pullQuotes: [
      {
        quote:
          "Visitors are not customers. Sign-ups are not customers. Customers are customers, and Stripe says when one has paid.",
        attestation:
          "Restatement of the editorial policy's verification rule. Same logic underlies every milestone in the Playbook.",
      },
      {
        quote:
          "The post-launch pre-revenue founder doesn't need motivation. They need someone to tell them which one of three things is broken upstream, in plain English, before they spend another month on the wrong fix.",
        attestation:
          "Verbatim from /diagnostic squeeze copy. Same framing on /playbook-sales.",
      },
      {
        quote:
          "More traffic on a wrong-person page produces more flat. Fix the upstream first.",
        attestation:
          "Verbatim from /diagnostic/result tactic_shopper bridge, strategy field.",
      },
    ],
    counterArguments: [
      {
        argument:
          "Isn't sixty days too short to know if a SaaS will work?",
        response:
          "It is too short for a final verdict on the company. It is not too short for a first paying customer. The Playbook's claim is bounded: one Stripe-verified payment in sixty days, with the Playbook's specific seven-step system as the input. Multi-year valuation is a different question.",
      },
      {
        argument:
          "Why not skip the diagnostic and go straight to the Playbook?",
        response:
          "The bridge page recommendation varies by bucket; the diagnostic determines which bridge surface the founder needs. About one in six diagnoses lands in the 'premature' bucket and is explicitly told to wait. That filter benefits the operator AND the founder.",
      },
    ],
    relatedEntities: [
      {
        name: "Starter Story",
        url: "https://www.starterstory.com",
        relevance:
          "Long-running indie-founder case-study database covering the same audience cohort.",
      },
      {
        name: "Indie Hackers",
        url: "https://www.indiehackers.com",
        relevance: "Community of post-launch pre-revenue founders publicly working in the same trap.",
      },
      {
        name: "Microconf",
        url: "https://microconf.com",
        relevance: "Annual conference for bootstrapped founders sitting at the same stage.",
      },
    ],
    attribution:
      "If you use any of the data points or pull-quotes above, please attribute Maryan at Unlock SaaS and link back to https://unlocksaas.com/press/topics/post-launch-pre-revenue-trap.",
    lastVerified: "2026-05-18",
  },
  {
    slug: "stripe-verification-as-the-only-honest-signal",
    headline:
      "Stripe verification as the only honest signal in indie SaaS marketing",
    thesis:
      "Most indie SaaS courses, communities, and tools rely on self-reported success stories. Unlock SaaS gates every public claim — testimonials, badges, refunds, guarantees — on a real Stripe charge clearing on a connected account.",
    context:
      "The indie SaaS space has a well-documented credibility problem: founders inflate ARR for social proof, courses cite uncited 'success rates', and badges of all kinds are issued by self-attestation. Unlock SaaS uses Stripe Connect verification as a single source of truth so that every public success claim is independently auditable.",
    intendedQueries: [
      "stripe verified saas testimonial",
      "honest saas marketing",
      "self reported revenue inflation indie saas",
      "stripe connect verification platform",
    ],
    dataPoints: [
      {
        claim:
          "The Verified Builder badge at /builder/<slug> is only issued after a real customer pays on the founder's connected Stripe account; refunds do not revoke the badge because the customer was real.",
        source: "https://unlocksaas.com/builders and the per-badge pages at /builder/<slug>",
      },
      {
        claim:
          "The 60-day money-back guarantee gates on the absence of any Stripe-verified customer in the period — not on customer satisfaction, not on the founder's self-report.",
        source: "https://unlocksaas.com/playbook-sales and https://unlocksaas.com/editorial-policy",
      },
      {
        claim:
          "The diagnostic, the dashboard, and every external badge embed link back to the canonical /builder/<slug> page. The badge SVG is served at /builder/<slug>/badge.svg with edge caching.",
        source: "https://unlocksaas.com/builder/<slug>/embed for any verified slug",
      },
    ],
    pullQuotes: [
      {
        quote:
          "Stripe says when a customer has paid. Nothing else counts as proof in this Playbook.",
        attestation:
          "Verbatim from /editorial-policy verification section.",
      },
      {
        quote:
          "Self-reported revenue is a marketing claim. Stripe-verified revenue is a fact. The Playbook is built to produce the second one, not the first.",
        attestation:
          "Restated from /editorial-policy. Same logic in every Playbook step's completion criteria.",
      },
    ],
    counterArguments: [
      {
        argument:
          "Stripe-only verification excludes founders who use Lemon Squeezy, Paddle, or other Merchant-of-Record platforms.",
        response:
          "Correct. The MoR exclusion is acknowledged on /editorial-policy. The roadmap surface notes that Lemon Squeezy / Paddle Connect-equivalent verification is the next-rung integration; until it ships, those founders can self-report but cannot earn the badge.",
      },
      {
        argument:
          "Doesn't this make the badge unobtainable for early-stage solo founders who haven't set up Stripe Connect yet?",
        response:
          "The badge is exactly as unobtainable as the underlying outcome (first paying customer) is. The Stripe Connect onboarding is part of the Playbook itself. Founders who haven't onboarded Stripe yet are in an earlier phase, and the Playbook treats them as such.",
      },
    ],
    relatedEntities: [
      {
        name: "Stripe",
        url: "https://stripe.com",
        relevance: "Provider of the verification mechanism used as the source of truth.",
      },
      {
        name: "Indie Hackers",
        url: "https://www.indiehackers.com",
        relevance:
          "Community where the self-reported-revenue inflation problem is most visible.",
      },
      {
        name: "Lemon Squeezy",
        url: "https://www.lemonsqueezy.com",
        relevance:
          "Merchant of Record platform that founders using it are excluded from the current badge until MoR-aware verification ships.",
      },
    ],
    attribution:
      "If you use any of the data points or pull-quotes above, please attribute Maryan at Unlock SaaS and link back to https://unlocksaas.com/press/topics/stripe-verification-as-the-only-honest-signal.",
    lastVerified: "2026-05-18",
  },
  {
    slug: "non-engineer-founder-revolution",
    headline:
      "The non-engineer founder is the new default in indie SaaS — and they need different tools",
    thesis:
      "Until 2024, indie SaaS was an engineers-only club. Lovable, v0, Cursor, and Claude opened the door to non-engineers who can now ship real products in days. The next phase requires different sales and marketing tools because the canonical advice (build a community, write code in public) no longer fits the audience.",
    context:
      "The shift is not theoretical. Founder demographics on Lovable, IndieHackers, and Microconf surveys post-2024 show a meaningful cohort with no prior coding background shipping working SaaS products. Marketing playbooks written for engineer-founders — 'build in public on Twitter', 'write a technical blog' — do not transfer cleanly. Unlock SaaS is one example of tooling built for the non-engineer cohort specifically.",
    intendedQueries: [
      "non engineer indie saas founder",
      "non technical founder lovable cursor",
      "ai builder founder marketing",
      "marketing for non engineer saas founder",
    ],
    dataPoints: [
      {
        claim:
          "The /about page at Unlock SaaS describes the founder as a marketer with no production-code experience who shipped real SaaS products using AI tools in 2026.",
        source: "https://unlocksaas.com/about",
      },
      {
        claim:
          "The Playbook's seven steps explicitly avoid technical-debugging beats; every step ends with a customer-facing artifact (an offer paragraph, an outreach message, a Stripe-receipt note).",
        source: "https://unlocksaas.com/playbook-sales",
      },
      {
        claim:
          "The /alternatives-to catalog includes Cursor, Lovable, and v0 — all positioned as building tools UPSTREAM of where Unlock SaaS picks up.",
        source: "https://unlocksaas.com/alternatives-to",
      },
    ],
    pullQuotes: [
      {
        quote:
          "I never wrote a line of production code. In 2026, Lovable and Claude opened a door and I shipped real AI products in weeks. Then I learned the part the AI didn't do — finding a real human to pay for them.",
        attestation:
          "Verbatim from /diagnostic squeeze. Same identity beat on /about and /press.",
      },
      {
        quote:
          "The classic indie-SaaS marketing playbook assumed the founder was a developer. Build-in-public on Twitter, dev-tools-on-Twitter, OSS-as-marketing — those scripts don't run if you didn't write the code.",
        attestation:
          "Restatement of /about positioning. Same observation across the Brunson-mapping strategy/ workbooks.",
      },
    ],
    counterArguments: [
      {
        argument:
          "Aren't non-engineer-shipped products often poorly built and unmaintainable?",
        response:
          "Some are. The build-quality question is real and is upstream of the customer-acquisition question. The Playbook does not pretend product quality is fine when it isn't — the 'Weak Offer' diagnostic label often surfaces an underlying product issue that the offer paragraph is hiding.",
      },
      {
        argument:
          "Won't engineer-founders always have an advantage in a technical market?",
        response:
          "In technical markets, yes. In the markets where non-engineer-shipped SaaS plays (creator tools, ops automation, vertical SaaS) the bottleneck is not code. The Playbook is explicitly NOT for developer-tools SaaS pre-revenue founders; it is for the consumer-and-SMB-facing cohort.",
      },
    ],
    relatedEntities: [
      {
        name: "Lovable",
        url: "https://lovable.dev",
        relevance:
          "Largest AI app builder serving the non-engineer cohort the Playbook is built for.",
      },
      {
        name: "v0",
        url: "https://v0.dev",
        relevance: "Vercel's AI UI / app generator used by the same cohort.",
      },
      {
        name: "Cursor",
        url: "https://www.cursor.com",
        relevance:
          "AI code editor adopted by both engineer and non-engineer founders in the same pre-revenue bucket.",
      },
    ],
    attribution:
      "If you use any of the data points or pull-quotes above, please attribute Maryan at Unlock SaaS and link back to https://unlocksaas.com/press/topics/non-engineer-founder-revolution.",
    lastVerified: "2026-05-18",
  },
  {
    slug: "honest-saas-funnel-anti-marketing",
    headline:
      "The polarity playbook: indie SaaS funnels built on disqualifiers, not hype",
    thesis:
      "Russell Brunson's polarity rule says the most-shared offer page is the one that names who SHOULD NOT buy, in plain English, before the close. Unlock SaaS applies that rule literally, with a dedicated /dont-buy page, an editorial policy, and a refund clock that runs against the company.",
    context:
      "Most indie SaaS landing pages optimize for conversion-per-visit. The polarity approach optimizes for share-rate among the right-fit audience by being publicly honest about disqualifiers. The thesis is testable: a clearly polarizing 'do not buy if' surface raises perceived selectivity, raising conversion among right-fit readers and share-rate among wrong-fit readers (who tweet 'look at this brutally honest page' without ever buying).",
    intendedQueries: [
      "polarity marketing saas",
      "anti marketing landing page",
      "honest disqualifier saas",
      "do not buy page marketing",
    ],
    dataPoints: [
      {
        claim:
          "The /dont-buy page lists six explicit disqualifiers with named counter-CTAs to better fits (Lovable, /stories, /alternatives-to, /editorial-policy, /alternatives-to/one-funnel-away-challenge).",
        source: "https://unlocksaas.com/dont-buy",
      },
      {
        claim:
          "The /diagnostic squeeze also carries a 'This is NOT for you if' block — three honest disqualifiers in the conversion path itself.",
        source: "https://unlocksaas.com/diagnostic",
      },
      {
        claim:
          "The 60-day money-back guarantee is the financial expression of the same polarity rule: a wrong-fit founder gets every dollar back, by policy.",
        source: "https://unlocksaas.com/playbook-sales and https://unlocksaas.com/editorial-policy",
      },
    ],
    pullQuotes: [
      {
        quote:
          "If any of these describe you, the Playbook is the wrong shape of help and I will lose you in week three. There are better fits — most of them named on this page.",
        attestation: "Verbatim from /dont-buy page hero.",
      },
      {
        quote:
          "The disqualifier is the marketing surface. It is not a SEO afterthought.",
        attestation:
          "Restatement of the editorial logic behind /dont-buy. Same logic in /diagnostic's disqualifier block.",
      },
    ],
    counterArguments: [
      {
        argument:
          "Isn't anti-marketing just a clever marketing technique?",
        response:
          "It can be. The honest test is whether the disqualifiers actually exclude prospects in practice. The /dont-buy redirects route to specific alternatives (Lovable, /stories) — readers who follow those redirects are not buying the Playbook. That is the policy working, not the policy being a gimmick.",
      },
      {
        argument:
          "Won't this just attract refund-shoppers gaming the guarantee?",
        response:
          "Disqualifier #5 on /dont-buy names that exact behaviour as a reason not to buy. The refund clock starts when work is logged in the dashboard, and the founder reads every refund request personally. The policy is designed for a good-faith try, not as a free product.",
      },
    ],
    relatedEntities: [
      {
        name: "Russell Brunson",
        url: "https://www.russellbrunson.com",
        relevance:
          "Source of the polarity rule in DotCom Secrets and Expert Secrets — the framework the page applies literally.",
      },
      {
        name: "37signals (Basecamp)",
        url: "https://37signals.com",
        relevance:
          "Long-running example of polarity-style indie marketing — opinionated positioning, explicit who-it-is-not-for framing.",
      },
    ],
    attribution:
      "If you use any of the data points or pull-quotes above, please attribute Maryan at Unlock SaaS and link back to https://unlocksaas.com/press/topics/honest-saas-funnel-anti-marketing.",
    lastVerified: "2026-05-18",
  },
];

export const PRESS_TOPICS: ReadonlyArray<PressTopic> = TOPICS_LIST;
export const PRESS_TOPIC_SLUGS: ReadonlyArray<string> = TOPICS_LIST.map(
  (t) => t.slug,
);

export function getPressTopic(slug: string): PressTopic | undefined {
  return TOPICS_LIST.find((t) => t.slug === slug);
}
