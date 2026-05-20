/**
 * /conversion-rate/[niche] pSEO catalog – niche-specific conversion benchmarks.
 *
 * Founders search "what is a good conversion rate for [my niche]". Each
 * entry maps one niche (from src/lib/niches.ts) to directional conversion
 * ranges across the funnel stages they actually care about: cold landing,
 * email opt-in, trial-to-paid, paid-to-retained.
 *
 * Brunson Hard-Rule reconciliation:
 *   - All ranges are directional. We never present a single number as
 *     universal truth.
 *   - We name what the range depends on (traffic source, price band,
 *     cohort) so the reader can position their own numbers honestly.
 *   - The diagnostic is the unlock: knowing the range doesn't fix the
 *     funnel; running the read does.
 */

export interface ConversionRateStage {
  /** Stage name in plain language ("Cold landing → opt-in"). */
  stage: string;
  /** Directional range (e.g. "1% to 5%"). */
  range: string;
  /** What the range depends on. */
  contextNote: string;
}

export interface ConversionRateEntry {
  /** URL slug – matches niche slug from niches.ts. */
  slug: string;
  /** Display name of the cohort. */
  displayName: string;
  /** SEO meta title, under 60 chars. */
  metaTitle: string;
  /** SEO meta description, under 160 chars. */
  metaDescription: string;
  /** TL;DR for the cohort's funnel economics, ~60 words. */
  tldr: string;
  /** Funnel stages and directional ranges. */
  stages: ReadonlyArray<ConversionRateStage>;
  /** What "good" looks like for this cohort in one sentence. */
  goodLooksLike: string;
  /** What "broken" looks like for this cohort in one sentence. */
  brokenLooksLike: string;
  /** The most-common Brunson diagnosis this cohort lands on. */
  mostCommonDiagnosis: "Wrong Person" | "Weak Offer" | "Weak Belief";
  /** Three FAQs in AEO format. */
  faqs: ReadonlyArray<{ q: string; a: string }>;
  /** Related glossary terms. */
  relatedGlossary: ReadonlyArray<string>;
  /** ISO date last verified. */
  lastVerified: string;
}

export const CONVERSION_RATE_ENTRIES: ReadonlyArray<ConversionRateEntry> = [
  {
    slug: "course-creators",
    displayName: "course creators",
    metaTitle: "Course Creator Conversion Rates (Directional Benchmarks)",
    metaDescription:
      "What's a good conversion rate for course creators? Directional ranges for landing, opt-in, sales page, and refund rate – plus the Brunson diagnosis.",
    tldr:
      "Course launches live and die on conversion at the sales page step. A typical course launch sees 30 to 50% open rate, 8 to 25% click rate to sales page, and 1 to 5% sales-page conversion. The 1 to 5% range varies wildly with price ($97 ~ 3 to 5%; $997 ~ 0.5 to 1.5%) and traffic source.",
    stages: [
      {
        stage: "Email open rate (launch)",
        range: "30% to 50%",
        contextNote:
          "Engaged warm list. Below 30% is a deliverability or sender-name issue. Above 50% usually means a small, tightly-engaged list.",
      },
      {
        stage: "Email click-through to sales page",
        range: "8% to 25%",
        contextNote:
          "Depends on subject + preview. Below 8% means subject is topic-shaped. Above 25% on a launch sequence usually means warm-warm audience.",
      },
      {
        stage: "Sales page → enrollment",
        range: "1% to 5%",
        contextNote:
          "Heavily price-dependent. $97 mini-course: 3 to 5%. $497 cohort: 1.5 to 3%. $997 to $1,997: 0.5 to 1.5%. Above $1,997 typically needs a webinar funnel.",
      },
      {
        stage: "Refund rate post-purchase",
        range: "2% to 8%",
        contextNote:
          "Healthy course refund rate. Below 2% usually means low-engagement buyers; above 8% means the sales page over-promised relative to the course's actual delivery.",
      },
    ],
    goodLooksLike:
      "Open 35%+, CTR 12%+, sales page conversion 2%+, refund rate under 5%. The path from list to revenue is structurally healthy.",
    brokenLooksLike:
      "Open under 25%, CTR under 5%, sales page conversion under 1%, refund rate over 10%. Either Wrong Person traffic or Weak Offer framing – the diagnostic identifies which.",
    mostCommonDiagnosis: "Weak Offer",
    faqs: [
      {
        q: "Why is my sales page converting under 1%?",
        a: "Almost always Weak Offer: the page sells the curriculum (modules, lessons) instead of the transformation (specific outcome by specific date). Course creators consistently underestimate how much the page underweights outcome vs. content.",
      },
      {
        q: "Should I run a webinar or a sales page for my course?",
        a: "Webinar above $497, sales page below. The math: webinar takes 60 to 90 minutes of attention, which justifies higher prices. Sales page captures scan-readers, which works for lower prices.",
      },
      {
        q: "What's a healthy launch revenue benchmark?",
        a: "$5K to $50K per launch is typical for course creators with 1K to 10K engaged subscribers, depending on price point. Above $50K usually means either a much larger audience or a much higher price point with proven conversion.",
      },
    ],
    relatedGlossary: ["hook", "offer", "perfect-webinar"],
    lastVerified: "2026-05-20",
  },
  {
    slug: "agency-owners",
    displayName: "agency owners",
    metaTitle: "Agency Conversion Rates (Lead-Gen Benchmarks)",
    metaDescription:
      "What's a good conversion rate for agencies? Inbound form fill, discovery-call show-up, proposal-to-close – plus the Brunson diagnosis.",
    tldr:
      "Agencies care less about volume and more about qualification. Healthy inbound contact-form rate is 0.5 to 2% of qualified site traffic. Discovery-call show-up sits at 60 to 85%. Proposal-to-close rate is 20 to 40% for warm referrals, 10 to 20% for cold inbound. The bottleneck is usually upstream – wrong-fit traffic.",
    stages: [
      {
        stage: "Site traffic → contact form fill",
        range: "0.5% to 2%",
        contextNote:
          "Total visitor-to-contact. Below 0.5% means positioning is too generic (Wrong Person); above 2% on cold traffic usually means form is too low-friction (under-qualifying).",
      },
      {
        stage: "Form fill → discovery call booked",
        range: "30% to 70%",
        contextNote:
          "Depends on the form's qualifier questions. Soft forms book 60 to 70%; qualified forms book 30 to 50% but produce 5 to 10x better calls.",
      },
      {
        stage: "Discovery call → proposal sent",
        range: "30% to 60%",
        contextNote:
          "Below 30% means discovery isn't surfacing fit; above 60% usually means the agency proposes for everyone (poor qualification mid-call).",
      },
      {
        stage: "Proposal → signed engagement",
        range: "20% to 40%",
        contextNote:
          "For warm referrals: 40 to 60%. For cold inbound: 10 to 25%. Below 10% means proposals don't address the right cohort.",
      },
    ],
    goodLooksLike:
      "1 to 3 qualified discovery calls per month, 30%+ proposal close rate, average engagement value $5K+ monthly retainer. Pipeline volume is small but high-quality.",
    brokenLooksLike:
      "5+ discovery calls per month with <10% close, leads asking for hourly rates, scope wars on every proposal. Wrong-fit traffic upstream is the diagnosis.",
    mostCommonDiagnosis: "Wrong Person",
    faqs: [
      {
        q: "Why are my discovery calls full of wrong-fit prospects?",
        a: "Almost always a Wrong Person diagnosis: the homepage doesn't specify which cohort the agency works with. Niching the homepage to one cohort (vertical or transformation) reduces volume but lifts call quality 3 to 5x.",
      },
      {
        q: "Should I publish my pricing on the agency site?",
        a: "Either floor-pricing ('engagements start at $X/month') or 'Contact us'. The floor filters tire-kickers; full pricing usually disqualifies negotiation room. Most successful agencies show floor pricing.",
      },
      {
        q: "What's a healthy MRR for a 5-person agency?",
        a: "$50K to $200K MRR for a 5-person agency depending on positioning. Below $50K MRR with 5 people means the team is over-staffed for the revenue; above $200K usually means strong positioning premium.",
      },
    ],
    relatedGlossary: ["dream-100", "wrong-person", "offer"],
    lastVerified: "2026-05-20",
  },
  {
    slug: "saas-founders",
    displayName: "SaaS founders",
    metaTitle: "SaaS Conversion Rates (Trial, Activation, Retention)",
    metaDescription:
      "What's a good conversion rate for SaaS? Trial-to-paid, activation, monthly active rate – plus the Brunson diagnosis.",
    tldr:
      "SaaS conversion economics live at the activation step, not the trial-to-paid step. Healthy trial-to-paid is 8 to 25%; healthy activation is 40 to 70%. Activation predicts trial-to-paid more reliably than any other metric. Cold-traffic visitor-to-trial-signup sits at 1 to 5%, depending on positioning and trust signals.",
    stages: [
      {
        stage: "Cold visitor → trial signup",
        range: "1% to 5%",
        contextNote:
          "Depends on positioning specificity and whether credit card required. CC-required: 0.5 to 2%. CC-not-required: 2 to 5%.",
      },
      {
        stage: "Trial signup → first-session activation",
        range: "40% to 70%",
        contextNote:
          "Activation = the user does ONE specific thing in their first session. Below 40% means onboarding branches too widely; above 70% usually means strong product onboarding.",
      },
      {
        stage: "Trial → paid conversion (30 days)",
        range: "8% to 25%",
        contextNote:
          "Self-serve SaaS. Below 8% means activation broken or wrong-fit cohort. Above 25% on cold traffic usually means very tight ICP filtering at signup.",
      },
      {
        stage: "Monthly active rate",
        range: "60% to 90%",
        contextNote:
          "Paid users who use the product in a given month. Below 60% predicts churn at renewal; above 90% predicts strong retention and word-of-mouth.",
      },
    ],
    goodLooksLike:
      "Trial-to-paid 15%+, activation 60%+, monthly active rate 80%+, MRR growth 8 to 15% month-over-month at sub-$100K MRR. Funnel is structurally compounding.",
    brokenLooksLike:
      "Trial-to-paid under 5%, activation under 30%, monthly active under 50%, churn over 10% monthly. Activation moment is broken; fix that before A/B testing the upgrade prompt.",
    mostCommonDiagnosis: "Weak Offer",
    faqs: [
      {
        q: "Why is my trial-to-paid conversion under 5%?",
        a: "Activation, not pricing. Trial-to-paid under 5% almost always means users didn't reach the value moment in their first session. Optimizing the upgrade prompt fixes nothing; fix activation first.",
      },
      {
        q: "Should I require credit card for free trial?",
        a: "Trade-off. CC-required reduces signups 30 to 60% but raises trial-to-paid 2 to 4x. CC-not-required builds bigger list at lower conversion. Most modern self-serve SaaS test both and find their economics.",
      },
      {
        q: "What's a healthy SaaS MRR growth rate?",
        a: "8 to 15% month-over-month at sub-$100K MRR is healthy. Above 15% is rare and usually means strong cohort + product fit. Below 8% means either acquisition is broken or churn is eating new revenue.",
      },
    ],
    relatedGlossary: ["offer", "hook", "weak-offer"],
    lastVerified: "2026-05-20",
  },
  {
    slug: "coaches",
    displayName: "coaches",
    metaTitle: "Coach Conversion Rates (Discovery Call → Paid Client)",
    metaDescription:
      "What's a good conversion rate for coaches? Discovery-call booking, call-to-client conversion – plus the Brunson diagnosis.",
    tldr:
      "Coaching economics are calendar-bound. Healthy: 1 to 3 paid clients per month from inbound, with 30 to 60% of discovery calls converting to paid clients. Volume is low; quality is everything. The bottleneck is usually positioning – clients arrive comparing rates instead of comparing transformations.",
    stages: [
      {
        stage: "Site traffic → discovery call booked",
        range: "0.5% to 2%",
        contextNote:
          "Cold traffic. Below 0.5% means positioning is generic; above 2% usually means warm traffic from referrals or content marketing.",
      },
      {
        stage: "Booking → call show-up",
        range: "60% to 90%",
        contextNote:
          "Coaches with paid 'discovery' (a $97 strategy call) see 90%+ show-up. Free discovery calls see 60 to 75% show-up; the friction at booking ironically reduces flake rate.",
      },
      {
        stage: "Call → signed coaching package",
        range: "30% to 60%",
        contextNote:
          "Warm referral calls close 50 to 70%; cold inbound calls close 20 to 40%. Below 20% means discovery is missing fit signals.",
      },
      {
        stage: "Single-session client → multi-session package",
        range: "40% to 70%",
        contextNote:
          "Coaches who upsell single sessions to packages within 60 days see 40 to 70% conversion. Below 40% means the single session didn't demonstrate enough value.",
      },
    ],
    goodLooksLike:
      "1 to 3 paid clients per month, 40%+ call close rate, average package value $2K to $25K, retention rate 80%+ across sessions. Calendar is full of paid clients, not free discovery.",
    brokenLooksLike:
      "10+ discovery calls per month with <10% close, leads asking for hourly rates, full sessions but flat revenue. Wrong-fit positioning attracting the wrong cohort.",
    mostCommonDiagnosis: "Weak Offer",
    faqs: [
      {
        q: "Why aren't my discovery calls converting to paid clients?",
        a: "Usually Weak Offer: the call sells credentials and methodology instead of a specific transformation. The client can't picture the end state. Reframe the offer around the specific outcome by the specific date.",
      },
      {
        q: "Should I do free or paid discovery calls?",
        a: "Paid for high-ticket coaching ($5K+ packages); free for lower-ticket. Paid discovery filters serious clients and reduces flake rate dramatically. Some coaches charge $97 to $497 for the discovery itself.",
      },
      {
        q: "Should I have group coaching alongside 1:1?",
        a: "Almost always. The Brunson value-ladder pattern: group program ($497 to $7,997) two rungs below 1:1 ($5K to $25K). Coaches who only do 1:1 cap revenue at calendar hours.",
      },
    ],
    relatedGlossary: ["story", "value-ladder", "offer"],
    lastVerified: "2026-05-20",
  },
  {
    slug: "consultants",
    displayName: "consultants",
    metaTitle: "Consultant Conversion Rates (Project & Engagement Benchmarks)",
    metaDescription:
      "What's a good conversion rate for consultants? Inbound, proposal-to-close, engagement-value – plus the Brunson diagnosis.",
    tldr:
      "Consultants live on positioning premium, not volume. Healthy: 1 to 2 signed engagements per month, average engagement $25K to $250K, proposal-to-close 30 to 50%. The biggest leverage is niching – generalist consultants compete on hourly rate; positioned consultants charge by outcome.",
    stages: [
      {
        stage: "Site traffic → RFP/inquiry",
        range: "0.3% to 1.5%",
        contextNote:
          "Cold traffic to consulting sites. Below 0.3% means positioning is too vague. Above 1.5% usually means strong inbound from content or referrals.",
      },
      {
        stage: "Inquiry → discovery call",
        range: "40% to 75%",
        contextNote:
          "Below 40% means inquiry-to-call friction is too high (slow response, too-formal scheduling). Above 75% means qualification is too loose.",
      },
      {
        stage: "Discovery call → proposal sent",
        range: "40% to 70%",
        contextNote:
          "Discovery should surface fit; proposals should follow only when fit is clear. Below 40% means discovery missed the fit signal.",
      },
      {
        stage: "Proposal → signed engagement",
        range: "30% to 50%",
        contextNote:
          "For warm referrals: 50 to 70%. For cold inbound: 20 to 35%. Below 20% means the proposal doesn't address the prospect's specific situation.",
      },
    ],
    goodLooksLike:
      "1 to 2 signed engagements per month at $25K+ average value, 40%+ proposal close rate. Pipeline is small but each engagement is fully scoped and properly priced.",
    brokenLooksLike:
      "Engagements priced hourly, scope wars on every project, leads ask 'what's your rate?' before discovery. Generalist positioning attracting price-shoppers.",
    mostCommonDiagnosis: "Weak Offer",
    faqs: [
      {
        q: "Why am I competing on hourly rate instead of project value?",
        a: "The site/positioning sells expertise instead of outcomes. Reframe around a specific transformation ('we increase your trial-to-paid 30%+ in 90 days') and price by outcome. Hourly rate is the worst frame for high-ticket service work.",
      },
      {
        q: "Should consultants offer a paid audit as a tripwire?",
        a: "Often yes. $1,500 to $7,500 paid audit pre-qualifies serious buyers and produces a deliverable that becomes the discovery call. Brunson value-ladder mapped onto consulting cleanly.",
      },
      {
        q: "What's a healthy utilization rate for independent consultants?",
        a: "60 to 80% of available hours billed. Above 80% means no time for sales/marketing; below 60% means underutilization. The 60 to 80% band leaves room for the work that lands the next engagement.",
      },
    ],
    relatedGlossary: ["dream-100", "stack-slide", "offer"],
    lastVerified: "2026-05-20",
  },
  {
    slug: "ecommerce",
    displayName: "ecommerce founders",
    metaTitle: "Ecommerce Conversion Rates (Visitor → Repeat Buyer)",
    metaDescription:
      "What's a good ecommerce conversion rate? Visitor-to-cart, cart-to-checkout, AOV, repeat purchase – plus the Brunson diagnosis.",
    tldr:
      "Ecommerce lives on AOV (average order value) and repeat rate, not first-purchase conversion. Healthy visitor-to-cart is 5 to 10%, cart-to-checkout 50 to 70%, AOV-to-CAC ratio 2:1 or better, and repeat purchase rate 20 to 40% within 90 days. Most ecommerce is profitable only after the second purchase.",
    stages: [
      {
        stage: "Visitor → add to cart",
        range: "5% to 10%",
        contextNote:
          "Healthy ecommerce add-to-cart rate. Below 5% means product page doesn't sell; above 10% usually means cart is being used as a wishlist (low cart-to-checkout follows).",
      },
      {
        stage: "Cart → checkout completed",
        range: "50% to 70%",
        contextNote:
          "Below 50% means cart friction (high shipping, surprise costs, account-required). Above 70% on cold traffic is rare and usually means very tight buyer-product fit.",
      },
      {
        stage: "First purchase → repeat within 90 days",
        range: "20% to 40%",
        contextNote:
          "Healthy repeat rate. Below 20% means post-purchase follow-up is missing. Above 40% usually means strong product + email sequence combination.",
      },
      {
        stage: "AOV to CAC ratio",
        range: "2:1 minimum, 4:1 healthy",
        contextNote:
          "Below 2:1 means ad spend isn't earning back on first purchase. Above 4:1 usually means strong organic or very-tight cohort.",
      },
    ],
    goodLooksLike:
      "AOV $50+, AOV-to-CAC 3:1+, repeat rate 30%+, cart abandonment under 50%. First purchase covers ad spend; second purchase is profit.",
    brokenLooksLike:
      "AOV under $30, AOV-to-CAC under 2:1, repeat rate under 10%, cart abandonment over 70%. First purchase loses money; no repeat to recover.",
    mostCommonDiagnosis: "Weak Offer",
    faqs: [
      {
        q: "Why is my AOV too low for paid ads to work?",
        a: "Almost always missing post-purchase upsell or bundle. The product page sells one item; ecommerce that scales sells bundles or has 30 to 50% take-rate on a one-click upsell at checkout success.",
      },
      {
        q: "Should I do free shipping or charge for it?",
        a: "Free shipping with a threshold ('free over $50') lifts AOV 20 to 40%. Always-free shipping underprices; always-charged kills cart conversion. Threshold-based is the sweet spot.",
      },
      {
        q: "How do I increase repeat purchase rate?",
        a: "Email post-purchase sequence with specific cross-sell. First-purchase customers are 5 to 10x more likely to buy than cold traffic; the post-purchase Soap Opera Sequence captures that without paid acquisition.",
      },
    ],
    relatedGlossary: ["offer", "stack-slide", "soap-opera-sequence"],
    lastVerified: "2026-05-20",
  },
  {
    slug: "no-code-builders",
    displayName: "no-code builders",
    metaTitle: "No-Code SaaS Conversion Rates (Bubble, Webflow Benchmarks)",
    metaDescription:
      "What's a good conversion rate for no-code SaaS? Visitor-to-trial, activation, paid conversion – plus the no-code-specific diagnosis.",
    tldr:
      "No-code SaaS economics mirror code-based SaaS economics, with one difference: positioning around the build method (Bubble, Webflow, Lovable) is a Wrong Person diagnosis. Buyers don't care how it was built. Healthy visitor-to-trial 1 to 4%, activation 40 to 65%, trial-to-paid 6 to 18%.",
    stages: [
      {
        stage: "Cold visitor → trial signup",
        range: "1% to 4%",
        contextNote:
          "Below 1% means positioning sells the stack ('built on Bubble') instead of the outcome. Above 4% usually means tight cohort filter.",
      },
      {
        stage: "Trial signup → activation",
        range: "40% to 65%",
        contextNote:
          "Identical to code-based SaaS. The activation moment matters more than the build method.",
      },
      {
        stage: "Trial → paid conversion",
        range: "6% to 18%",
        contextNote:
          "Slightly lower than code-based SaaS averages because no-code audiences are often more price-sensitive. Below 6% means activation broken.",
      },
      {
        stage: "Monthly retention",
        range: "85% to 95%",
        contextNote:
          "Healthy retention. Below 85% means activation didn't stick; above 95% usually means strong product-market fit at the cost of growth rate.",
      },
    ],
    goodLooksLike:
      "Trial-to-paid 12%+, monthly retention 90%+, MRR growth 10%+ month-over-month at sub-$10K MRR. The fact that it's no-code is invisible to buyers.",
    brokenLooksLike:
      "Trial-to-paid under 4%, retention under 80%, MRR flat for 90+ days. Positioning likely sells the build method instead of the outcome.",
    mostCommonDiagnosis: "Wrong Person",
    faqs: [
      {
        q: "Should I mention that my SaaS is built on Lovable / Bubble?",
        a: "Only on developer-audience surfaces (Twitter/X, Indie Hackers, Show HN). On the buyer-facing site, the build method is irrelevant – buyers care about outcomes, not stacks. Founder-pride about the stack often hurts conversion.",
      },
      {
        q: "Are no-code SaaS conversion rates fundamentally lower than code-based?",
        a: "Marginally, due to audience overlap with other builders rather than buyers. Once positioning targets buyers (not builders), conversion rates converge with code-based SaaS.",
      },
      {
        q: "How do I avoid being copied if my no-code build is visible?",
        a: "The build is the easiest part to copy; the marketing is the moat. Audience, offer, proof, follow-up sequences don't copy from a screenshot. Focus the moat-building work there, not on hiding the stack.",
      },
    ],
    relatedGlossary: ["hook", "wrong-person", "offer"],
    lastVerified: "2026-05-20",
  },
  {
    slug: "indie-hackers",
    displayName: "indie hackers",
    metaTitle: "Indie Hacker Conversion Rates (Ship-Post Benchmarks)",
    metaDescription:
      "What's a good conversion rate for indie hackers? Ship-post traffic, paid conversion, post-launch trajectory – plus the diagnosis.",
    tldr:
      "Indie launches generate ship-post traffic (Indie Hackers, Product Hunt, Twitter) that converts at near-zero (0.1 to 0.5%) because the audience is mostly other builders. The real economics happen 30 to 90 days post-launch when cohort-specific outreach reaches buyers. Most indies underestimate the gap between launch cheers and revenue.",
    stages: [
      {
        stage: "Ship-post traffic → trial signup",
        range: "0.1% to 0.5%",
        contextNote:
          "Curiosity traffic. Even successful Product Hunt launches convert at 0.3 to 0.5% to trial; conversion to paid is much lower.",
      },
      {
        stage: "Trial → paid (from launch traffic)",
        range: "3% to 8%",
        contextNote:
          "Lower than typical SaaS trial-to-paid because the cohort is wrong-fit. From cohort-specific traffic (not launch), this rises to 10 to 20%.",
      },
      {
        stage: "Post-launch 90-day MRR trajectory",
        range: "$0 to $3K MRR",
        contextNote:
          "Healthy: $500 to $3K MRR by day 90 with cohort-specific work. Below $500 means cohort outreach didn't engage. Above $3K is rare at this stage and usually means audience pre-existed.",
      },
      {
        stage: "First-month-to-second-month retention",
        range: "60% to 85%",
        contextNote:
          "Indie SaaS often loses 30 to 40% of first-month signups by month two. Below 60% retention means activation is broken; above 85% usually means strong cohort match.",
      },
    ],
    goodLooksLike:
      "$1K to $3K MRR by day 90, 80%+ month-2 retention, cohort-specific traffic outpacing launch traffic by month 3. The launch is a starter, not the engine.",
    brokenLooksLike:
      "Day-1 spike followed by flat line. Sub-$500 MRR at day 90. Audience full of other builders. Cohort outreach hasn't started or is hitting the wrong cohort.",
    mostCommonDiagnosis: "Wrong Person",
    faqs: [
      {
        q: "Why didn't my Product Hunt launch convert?",
        a: "PH traffic is curiosity traffic, not buying traffic. 0.1 to 0.5% conversion is normal. The launch is for inbound links, press, and email signups; not for finding product-market fit with paying customers.",
      },
      {
        q: "How long does it take to reach $1K MRR for indie SaaS?",
        a: "Typically 3 to 9 months post-launch with active cohort outreach. Founders who try to scale on launch traffic alone often plateau under $500 MRR for 12+ months.",
      },
      {
        q: "Should I focus on features or marketing post-launch?",
        a: "Marketing below $1K MRR. Every feature ships into a void at sub-$1K. Above $1K, features start to compound. The flat Stripe line is the corrective signal that says 'stop building, start selling'.",
      },
    ],
    relatedGlossary: ["hook", "wrong-person", "offer"],
    lastVerified: "2026-05-20",
  },
  {
    slug: "ai-wrappers",
    displayName: "AI wrapper builders",
    metaTitle: "AI Wrapper Conversion Rates (GPT/Claude SaaS Benchmarks)",
    metaDescription:
      "What's a good conversion rate for AI wrappers? Trial-to-paid, activation, churn – plus the AI-specific diagnosis.",
    tldr:
      "AI wrappers face the substitution problem: users can replicate output in raw ChatGPT/Claude. Healthy trial-to-paid is 5 to 15% (lower than generic SaaS). Activation matters more here than anywhere: if session-one doesn't demonstrate the gap vs raw GPT, users churn fast. COGS as percentage of revenue determines whether the business compounds.",
    stages: [
      {
        stage: "Cold visitor → trial signup",
        range: "1% to 4%",
        contextNote:
          "Lower than generic SaaS because AI wrapper audiences are sophisticated about LLM substitution. Below 1% means positioning doesn't differentiate from raw GPT.",
      },
      {
        stage: "Trial signup → first-session activation",
        range: "30% to 60%",
        contextNote:
          "Lower than generic SaaS because users compare to raw GPT immediately. Above 60% means strong session-one demonstration of the wrapper's value.",
      },
      {
        stage: "Trial → paid conversion",
        range: "5% to 15%",
        contextNote:
          "Below 5% means activation didn't demonstrate the gap. Above 15% means very tight value proposition – rare in AI wrapper category.",
      },
      {
        stage: "Monthly churn rate",
        range: "8% to 20%",
        contextNote:
          "Higher than generic SaaS. Below 8% is exceptional and usually means strong workflow integration. Above 20% means the substitution problem dominates.",
      },
    ],
    goodLooksLike:
      "Trial-to-paid 10%+, monthly churn under 10%, COGS under 40% of revenue. The wrapper has demonstrated workflow-level value, not just output-level.",
    brokenLooksLike:
      "Trial-to-paid under 4%, churn over 15%, COGS over 60% of revenue. Users see no gap vs raw GPT; product can't compound because margin is too thin.",
    mostCommonDiagnosis: "Weak Belief",
    faqs: [
      {
        q: "Why is my churn rate so high for an AI wrapper?",
        a: "Users tested whether the wrapper genuinely beats raw GPT for their specific use case. If session-one didn't demonstrate the gap, they leave. Fix activation to surface the wrapper-specific value moment.",
      },
      {
        q: "What's the right COGS for an AI wrapper business?",
        a: "Under 40% of revenue is healthy; under 25% is excellent. Above 60% the business doesn't compound. Optimization paths: caching, smaller models for non-critical steps, prompt engineering to reduce token count.",
      },
      {
        q: "Should I worry about OpenAI/Anthropic shipping my feature?",
        a: "Marginally. It's not the immediate bottleneck; current trial conversion is. If they ship your feature in 6 months and you have $50K MRR by then, you have leverage. If you don't fix the funnel, that scale never engages.",
      },
    ],
    relatedGlossary: ["offer", "weak-belief", "reluctant-hero"],
    lastVerified: "2026-05-20",
  },
  {
    slug: "info-product-creators",
    displayName: "info product creators",
    metaTitle: "Info Product Conversion Rates (eBook, Template Benchmarks)",
    metaDescription:
      "What's a good conversion rate for info products? Landing, launch traffic, refund – plus the Brunson diagnosis.",
    tldr:
      "Info products (eBooks, templates, swipe files) live on launch traffic and email economics. Healthy sales-page conversion 2 to 6% on launch week, dropping to 0.3 to 1.5% in steady state. Refund rate 3 to 8%. The launch is the peak; the email list is what compounds over months.",
    stages: [
      {
        stage: "Cold sales page → purchase (launch)",
        range: "2% to 6%",
        contextNote:
          "Launch traffic from your email list and engaged audience. Below 2% means hook or offer is broken. Above 6% means tight audience-product fit.",
      },
      {
        stage: "Cold sales page → purchase (steady state)",
        range: "0.3% to 1.5%",
        contextNote:
          "Post-launch organic traffic. Always lower than launch traffic. Below 0.3% means the page can't sell without warm context; above 1.5% means strong evergreen positioning.",
      },
      {
        stage: "Email open rate (launch)",
        range: "30% to 50%",
        contextNote:
          "Below 30% is a deliverability or sender-name issue. Above 50% usually means small, tightly-engaged list.",
      },
      {
        stage: "Refund rate",
        range: "3% to 8%",
        contextNote:
          "Healthy info product refund rate. Below 3% means barely-engaged buyers; above 8% means sales page over-promised relative to delivery.",
      },
    ],
    goodLooksLike:
      "$2K to $20K per launch with 1K to 10K engaged subscribers. Refund rate under 6%. Email list growing 5%+ month-over-month from organic.",
    brokenLooksLike:
      "Sub-$1K launches, refund rate over 10%, email list flat. Either Wrong Person traffic or the offer doesn't compound across launches.",
    mostCommonDiagnosis: "Weak Offer",
    faqs: [
      {
        q: "Why are my launches not getting bigger over time?",
        a: "Each launch should compound the previous one. If they're flat, the value ladder is broken: launches don't seed the next product's audience. Brunson Hard-Rule: every launch builds the next one's email list.",
      },
      {
        q: "Should I sell on Gumroad, Stan, or my own checkout?",
        a: "Platform-agnostic for the offer's mechanics. The choice depends on tax handling and audience expectation. Gumroad and Stan handle EU VAT/tax automatically; own-checkout requires more setup but is the long-term play.",
      },
      {
        q: "How big does my email list need to be to launch?",
        a: "1,000 engaged subscribers is enough for $1K to $5K launches. 10,000 engaged subscribers supports $10K to $100K launches. Engagement matters more than size – a 1,000-person engaged list outperforms a 10,000-person disengaged one.",
      },
    ],
    relatedGlossary: ["value-ladder", "soap-opera-sequence", "offer"],
    lastVerified: "2026-05-20",
  },
  {
    slug: "newsletter-operators",
    displayName: "newsletter operators",
    metaTitle: "Newsletter Conversion Rates (Free-to-Paid Benchmarks)",
    metaDescription:
      "What's a good conversion rate for newsletter operators? Subscribe, open, click, free-to-paid – plus the Brunson diagnosis.",
    tldr:
      "Newsletter economics live on open rate and free-to-paid upgrade. Healthy open rate 35 to 55%, click rate 2 to 8%, free-to-paid upgrade 1 to 5% over 12 months. The biggest leverage is what gets sold on the paid tier – pure content typically caps at 2%; community + content reaches 3 to 5%.",
    stages: [
      {
        stage: "Site traffic → subscribe",
        range: "3% to 10%",
        contextNote:
          "Strong inline subscribe forms convert 3 to 5%; exit-intent adds 1 to 2%; pop-overs add 2 to 4%. Total 3 to 10% combined.",
      },
      {
        stage: "Email open rate",
        range: "35% to 55%",
        contextNote:
          "Engaged newsletter list. Below 35% is a deliverability, cadence, or sender-name issue. Above 55% usually means very tight content-audience fit.",
      },
      {
        stage: "Email click rate",
        range: "2% to 8%",
        contextNote:
          "Below 2% means content is interesting but lacks specific calls-to-action; above 8% means tight call-to-action match to content.",
      },
      {
        stage: "Free-to-paid upgrade (12 months)",
        range: "1% to 5%",
        contextNote:
          "Pure-content paid tiers: 1 to 2%. Content + community: 2 to 4%. Content + community + monthly calls: 3 to 5%. Categorical differentiation lifts upgrade rate.",
      },
    ],
    goodLooksLike:
      "Open 40%+, CTR 5%+, free-to-paid upgrade 3%+, list growing 8 to 15% month-over-month organically. Engagement compounds across months.",
    brokenLooksLike:
      "Open under 25%, CTR under 1%, free-to-paid upgrade under 0.5%, list growth flat. Either deliverability issue or content doesn't compound to paid value.",
    mostCommonDiagnosis: "Weak Offer",
    faqs: [
      {
        q: "Should I move to Beehiiv from ConvertKit / Substack?",
        a: "Platform-agnostic for the metrics. The platform matters for sponsorship discovery (Beehiiv's network) and for built-in growth tools, but conversion economics depend on the content and offer, not the platform.",
      },
      {
        q: "What's a healthy paid tier price for a newsletter?",
        a: "$5 to $25/month. Below $5 the operator's economics don't compound; above $25 readers expect more than text. Higher-priced tiers usually need community + specific deliverables.",
      },
      {
        q: "Should I monetize through sponsorships or paid tiers?",
        a: "Both, with paid tiers first. Paid tier compounds; sponsorships rent the audience to advertisers. Build the paid tier first (the diagnostic surfaces what kind), then layer sponsorships on top.",
      },
    ],
    relatedGlossary: ["soap-opera-sequence", "seinfeld-email", "value-ladder"],
    lastVerified: "2026-05-20",
  },
  {
    slug: "freelancers",
    displayName: "freelancers",
    metaTitle: "Freelance Conversion Rates (Productized Service Benchmarks)",
    metaDescription:
      "What's a good conversion rate for freelancers? Inquiry, proposal-to-close, project value – plus the positioning diagnosis.",
    tldr:
      "Freelancers stuck on hourly rates have a positioning problem, not a sales problem. Healthy: 1 to 3 paid engagements per month at $2K to $25K per project, 30 to 50% proposal close rate. The productized-service shift lifts effective hourly rate 2 to 5x without working more hours.",
    stages: [
      {
        stage: "Site traffic → inquiry",
        range: "0.5% to 2%",
        contextNote:
          "Below 0.5% means positioning is too generic. Above 2% usually means warm referral traffic from past clients or content.",
      },
      {
        stage: "Inquiry → call booked",
        range: "40% to 70%",
        contextNote:
          "Below 40% means slow response or too-formal scheduling. Above 70% means qualification is too loose – every inquiry becomes a call.",
      },
      {
        stage: "Call → proposal",
        range: "40% to 60%",
        contextNote:
          "Below 40% means discovery isn't surfacing fit; above 60% usually means the freelancer proposes for everyone.",
      },
      {
        stage: "Proposal → signed engagement",
        range: "30% to 50%",
        contextNote:
          "For warm referrals: 50 to 70%. For cold inbound: 20 to 35%. Below 20% means proposals don't match prospect's specific situation.",
      },
    ],
    goodLooksLike:
      "1 to 3 productized engagements per month at $2K to $10K each, 40%+ proposal close rate, effective hourly rate $200+ (not actual hourly billing). Positioning around outcome, not skill.",
    brokenLooksLike:
      "10+ inquiries per month at hourly rates, 30 to 50% below-asking negotiations, calendar full but income flat. Wrong-fit traffic attracted by hourly-rate positioning.",
    mostCommonDiagnosis: "Weak Offer",
    faqs: [
      {
        q: "How do I productize my freelance service?",
        a: "Pick one specific deliverable. 'I'll redesign your SaaS landing page for $4,997, two-week turnaround' beats 'I'm a designer, $150/hour'. The first prices on outcome; the second on time.",
      },
      {
        q: "Should I leave Upwork and Fiverr?",
        a: "Eventually yes, but not before having a direct-traffic substitute. Marketplaces bring leads but cap rate and brand. Most freelancers leave platforms 12 to 24 months in once their own site generates qualified leads.",
      },
      {
        q: "What's a healthy effective hourly rate for a freelancer?",
        a: "$100 to $500 effective rate (revenue per actual working hour). Hourly billing caps you at the rate; productized offers let you earn more per hour by pricing on outcome.",
      },
    ],
    relatedGlossary: ["offer", "value-ladder", "stack-slide"],
    lastVerified: "2026-05-20",
  },
];

export const CONVERSION_RATE_SLUGS: ReadonlyArray<string> =
  CONVERSION_RATE_ENTRIES.map((e) => e.slug);

export function getConversionRateBySlug(
  slug: string,
): ConversionRateEntry | undefined {
  return CONVERSION_RATE_ENTRIES.find((e) => e.slug === slug);
}
