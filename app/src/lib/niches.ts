/**
 * /for/[niche] pSEO catalog – niche-specific landing pages.
 *
 * Founders search their own identity first: "marketing for course
 * creators", "funnel audit for SaaS founders", "for agency owners".
 * Each entry is the same Hook / Story / Offer frame, tuned to the
 * vocabulary, pain points, and money mechanics of one specific cohort.
 *
 * Brunson Hard-Rule reconciliation:
 *   - No invented testimonials per niche.
 *   - No claims like "trusted by 500+ course creators" unless verifiable.
 *   - Each niche page describes the same product, in the cohort's own
 *     vocabulary. Same Stack, same guarantee, same Playbook.
 */

export interface NicheEntry {
  /** URL slug, kebab-case. */
  slug: string;
  /** Display name of the cohort. */
  displayName: string;
  /** SEO meta title, under 60 chars. */
  metaTitle: string;
  /** SEO meta description, under 160 chars. */
  metaDescription: string;
  /** Hero subhead, ~30 words. The one-line frame for this cohort. */
  heroSubhead: string;
  /** Cohort-specific pain – what their flat Stripe line looks like. */
  cohortPain: string;
  /** Vocabulary they actually use (for content matching). */
  vocabulary: ReadonlyArray<string>;
  /** Common money mechanics for this cohort (subscription, one-time, etc.) */
  moneyMechanics: string;
  /** The Brunson move this cohort most often gets wrong. */
  commonMistake: string;
  /** The Brunson move that compounds for this cohort. */
  whatCompounds: string;
  /** Three FAQs tuned to this cohort. */
  faqs: ReadonlyArray<{ q: string; a: string }>;
  /** Related glossary terms most relevant to this cohort. */
  relatedGlossary: ReadonlyArray<string>;
  /** ISO date last verified. */
  lastVerified: string;
}

export const NICHE_ENTRIES: ReadonlyArray<NicheEntry> = [
  {
    slug: "course-creators",
    displayName: "course creators",
    metaTitle: "Funnel Diagnostic for Course Creators",
    metaDescription:
      "If your course landing page gets traffic but no enrollments, the Brunson Hook / Story / Offer triage finds what's broken in 90 seconds.",
    heroSubhead:
      "Built for course creators whose launch went quiet. The diagnostic labels what's broken on the sales page (Wrong Person, Weak Offer, or Weak Belief) and the Playbook walks you from that label to one paying enrollment.",
    cohortPain:
      "The course is built. The sales page is live. The launch email went to a few thousand subscribers. Open rates were fine. Sign-ups: under three. The flat Stripe line is the same shape regardless of whether the course is a $97 mini-course or a $1,997 cohort.",
    vocabulary: [
      "cohort",
      "evergreen",
      "open cart",
      "launch",
      "live cohort",
      "enrollment",
      "completion rate",
      "PLF",
    ],
    moneyMechanics:
      "One-time payments at launch ($97 to $1,997), payment plans common above $497, occasional monthly memberships. Refund windows usually 14 to 30 days. The economics live or die on launch conversion, not retention.",
    commonMistake:
      "Selling the curriculum instead of the transformation. The sales page lists modules ('Module 1: Foundations, Module 2: Strategy'), which describes what the course teaches but doesn't picture the outcome the student walks away with. A reader who can't picture the end state doesn't enroll.",
    whatCompounds:
      "Building the Perfect Webinar pattern (one-to-many sale) on top of the Soap Opera and Seinfeld email sequences. Once those three structures are in place, every new launch reuses the same machine. The course business that scales runs the same funnel four times a year, not four different funnels.",
    faqs: [
      {
        q: "Is the diagnostic relevant if my course is already shipped?",
        a: "Yes. Most course creators who hit the diagnostic are post-launch, pre-revenue: the course is built, the sales page is live, and the launch was flat. That is the exact ICP the diagnostic is calibrated for. The product being built is a prerequisite, not a disqualifier.",
      },
      {
        q: "Will the Playbook work for evergreen courses vs live cohorts?",
        a: "Yes for both. The Hook / Story / Offer frame is identical. The only difference is whether the OTO and follow-up sequences run on a calendar (live cohort) or on a delay (evergreen). Both flows are covered in the Playbook.",
      },
      {
        q: "I already have an email list. Do I still need the diagnostic?",
        a: "Especially if you have a list. A flat launch to a real list almost always points at a Weak Offer or Weak Belief diagnosis, because the Wrong Person filter is already passed. The diagnostic finds which one in 90 seconds.",
      },
    ],
    relatedGlossary: ["hook", "perfect-webinar", "value-ladder"],
    lastVerified: "2026-05-19",
  },
  {
    slug: "agency-owners",
    displayName: "agency owners",
    metaTitle: "Funnel Diagnostic for Agency Owners",
    metaDescription:
      "If your agency site gets traffic but no qualified leads, the Brunson Hook / Story / Offer triage finds what's broken before the discovery call.",
    heroSubhead:
      "Built for agency owners whose website attracts visitors who aren't a fit. The diagnostic labels what's broken on the lead-gen path and the Playbook walks you from that label to one qualified discovery call.",
    cohortPain:
      "The agency site is live. The case studies are up. The contact form gets filled in once or twice a week. Discovery calls happen. Almost nobody is a fit. The leads who are qualified ghost after the proposal. The bookings calendar is full of mismatch.",
    vocabulary: [
      "discovery call",
      "qualified lead",
      "retainer",
      "scope",
      "proposal",
      "case study",
      "RFP",
      "agency pricing",
    ],
    moneyMechanics:
      "Monthly retainers ($3K to $30K), project-based fees, occasional performance fees. The economics depend on closing 1 to 3 qualified leads per month, not on inbound volume. Wrong-fit leads are more expensive than no leads.",
    commonMistake:
      "Selling the service list ('we do SEO, content, paid social') instead of the cohort-specific outcome. The site reads like a menu, which attracts price-shopping comparison readers. The case studies prove past work but don't pre-qualify the next reader.",
    whatCompounds:
      "Niching the homepage. One specific cohort, one specific outcome, one specific case study. Agencies that pick one niche outperform full-service agencies on lead quality 3 to 5x. The Dream 100 list of target accounts becomes addressable instead of theoretical.",
    faqs: [
      {
        q: "Will the diagnostic work for agencies, not just SaaS?",
        a: "Yes. The Hook / Story / Offer frame is service-agnostic. The diagnostic looks for Wrong Person traffic, Weak Offer framing, or Weak Belief proof – all three apply to agency sites identically.",
      },
      {
        q: "I get inbound but the leads are wrong-fit. What does the diagnostic say?",
        a: "Wrong-fit inbound is almost always a Wrong Person diagnosis: the site is attracting traffic that fits the keywords but not the offer. The fix is niching the homepage's audience definition, not improving the proposal.",
      },
      {
        q: "Should agencies build a tripwire?",
        a: "Often yes, in the form of a paid audit ($500 to $2,500). It pre-qualifies leads (only serious buyers pay for an audit) and the audit itself becomes the discovery call. The Brunson value-ladder pattern works for service businesses with the same mechanics.",
      },
    ],
    relatedGlossary: ["dream-100", "value-ladder", "offer"],
    lastVerified: "2026-05-19",
  },
  {
    slug: "saas-founders",
    displayName: "SaaS founders",
    metaTitle: "Funnel Diagnostic for SaaS Founders",
    metaDescription:
      "If your SaaS is shipped but the dashboard is flat, the Brunson Hook / Story / Offer triage labels what's broken in 90 seconds.",
    heroSubhead:
      "Built for SaaS founders whose product launched but whose Stripe line is flat. The diagnostic labels what's broken (Wrong Person, Weak Offer, or Weak Belief) and the Playbook walks you from that label to one paying customer.",
    cohortPain:
      "The product works. The pricing page is live. The marketing site is live. Sign-ups trickle in. Conversion to paid sits under 1%. Trial users churn before the second login. The Stripe MRR line is flat or barely positive, regardless of feature shipping pace.",
    vocabulary: [
      "MRR",
      "ARR",
      "churn",
      "activation",
      "free trial",
      "freemium",
      "PMF",
      "ICP",
      "self-serve",
    ],
    moneyMechanics:
      "Monthly subscriptions ($9 to $499), annual discount tiers, occasional one-time onboarding fees. Economics depend on activation and second-month retention more than first-touch conversion. Wrong-fit signups are subsidized losses, not weak leads.",
    commonMistake:
      "Optimizing the wrong funnel step. Founders A/B test the pricing page when the diagnosis is upstream (Wrong Person traffic), or test the landing page when the diagnosis is downstream (Weak Belief at the activation step). The diagnostic surfaces which step the bottleneck lives at.",
    whatCompounds:
      "The Soap Opera Sequence for trial-to-paid conversion, the Seinfeld Email pattern for retention, and the Stack Slide for the pricing page. These three structures move the needle more than any feature shipped in the same quarter. They also compound: the same sequence runs against next month's trials with no extra work.",
    faqs: [
      {
        q: "I have product-market fit but won't scale. Is this for me?",
        a: "Probably yes, if 'won't scale' means flat MRR despite a working product. PMF is a prerequisite. The diagnostic looks at the marketing-and-sales layer that converts qualified traffic into paying customers – the layer most often underbuilt by technical founders.",
      },
      {
        q: "Does this work for B2B SaaS or only consumer SaaS?",
        a: "Both. The Hook / Story / Offer frame is buyer-agnostic. B2B SaaS often needs longer Stack Slides (more deliverables, harder anchors) and longer follow-up sequences (B2B buying cycles are 3 to 6 weeks vs 3 to 6 hours for consumer). The frame is identical.",
      },
      {
        q: "I have under 100 trial users per month. Is the sample too small?",
        a: "100 trials is enough to diagnose. Below 30 it's a Wrong Person traffic problem first, regardless of what the page says. Above 30, the diagnostic can surface whether the issue is the marketing site, the trial flow, or the activation moment.",
      },
    ],
    relatedGlossary: [
      "hook",
      "story",
      "offer",
      "soap-opera-sequence",
      "stack-slide",
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "coaches",
    displayName: "coaches",
    metaTitle: "Funnel Diagnostic for Coaches",
    metaDescription:
      "If your coaching practice is live but bookings are flat, the Brunson Hook / Story / Offer triage labels what's broken in 90 seconds.",
    heroSubhead:
      "Built for coaches whose practice is live but whose calendar is empty. The diagnostic labels what's broken on the sales page or discovery call and the Playbook walks you from that label to one paid client.",
    cohortPain:
      "The website is up. The bio is written. The booking link is in every signature. A few discovery calls happen each month. Almost none convert to paid clients. The ones who do pay leave after one session. The flat calendar repeats, regardless of how much LinkedIn content you post.",
    vocabulary: [
      "discovery call",
      "client intake",
      "container",
      "package",
      "1:1",
      "group program",
      "ICF",
      "transformation",
    ],
    moneyMechanics:
      "One-on-one packages ($500 to $25,000), group programs ($497 to $7,997), occasional monthly retainers. Economics depend on closing 1 to 3 high-ticket clients per month, not on lead volume. Wrong-fit clients are emotionally and financially expensive.",
    commonMistake:
      "Selling the credentialing instead of the transformation. The site lists certifications, years of experience, and methodology. The reader can't picture the specific change in their own life. Credentials prove competence but don't sell outcomes.",
    whatCompounds:
      "The Attractive Character framing on the bio page, the Hook / Story / Offer pattern on the sales page, and the Perfect Webinar for the group-program ladder rung. Coaches who build all three reuse the same content across years; coaches who rewrite their bio quarterly burn cycles without compounding.",
    faqs: [
      {
        q: "Will this work for life coaches, business coaches, or executive coaches?",
        a: "All three. The Brunson frame is outcome-agnostic. The diagnostic looks at whether your sales page names the specific transformation, anchors a Stack, and proves it with dated specific evidence. The category of coaching is irrelevant to the diagnosis.",
      },
      {
        q: "I do high-ticket only ($5K+). Is the $1 Starter even relevant?",
        a: "The $1 Starter is for diagnosing your sales page, not for replacing your high-ticket offer. It teaches Steps 1 and 2 of the Playbook on a real Stripe charge. Your $5K offer stays the top of the value ladder; the diagnostic and Starter pin the foundation under it.",
      },
      {
        q: "Should I have a group program AND 1:1 coaching?",
        a: "Yes, almost always. The Brunson value-ladder pattern has the group program ($497 to $7,997) sitting two rungs below the 1:1 ($5,000 to $25,000). Coaches who run only 1:1 cap their economics at calendar hours; the group program is the leverage rung.",
      },
    ],
    relatedGlossary: ["story", "perfect-webinar", "value-ladder"],
    lastVerified: "2026-05-19",
  },
  {
    slug: "consultants",
    displayName: "consultants",
    metaTitle: "Funnel Diagnostic for Consultants",
    metaDescription:
      "If your consulting practice attracts the wrong RFPs, the Brunson Hook / Story / Offer triage finds what's broken before the next discovery call.",
    heroSubhead:
      "Built for independent consultants whose practice attracts wrong-fit leads. The diagnostic labels what's broken in your positioning and the Playbook walks you from that label to one qualified engagement.",
    cohortPain:
      "The consulting site is live. Case studies are posted. RFPs and intro calls land in the inbox monthly. Almost none convert. The ones that do convert turn into scope wars. The pipeline looks full but the bank account doesn't reflect it.",
    vocabulary: [
      "RFP",
      "engagement",
      "scope of work",
      "deliverable",
      "fractional",
      "advisor",
      "billable rate",
      "case study",
    ],
    moneyMechanics:
      "Project-based fees ($10K to $250K), monthly advisory retainers ($3K to $30K), occasional equity for fractional roles. Economics depend on positioning premium (rate per hour or per deliverable), not on lead volume. Wrong-positioned consultants compete on hourly rate and lose.",
    commonMistake:
      "Selling expertise instead of a specific transformation. The site reads like a CV: 'helped 50+ companies, 15 years experience'. The reader can't picture the engagement's end state. Without a Stack Slide, the consultant competes on rate, which is the worst frame for high-ticket service work.",
    whatCompounds:
      "Niching the engagement type. One specific deliverable ('we increase your trial-to-paid conversion'), one specific cohort ('B2B SaaS post-Series A'), one specific case study ('we did this for Acme, here's the dated number'). The Dream 100 of target accounts becomes addressable. The Stack Slide writes itself.",
    faqs: [
      {
        q: "I'm a fractional CTO/CMO/CFO. Does this apply?",
        a: "Yes. Fractional roles are subject to the same Wrong Person / Weak Offer / Weak Belief diagnosis as project-based consulting. The diagnostic looks at whether your positioning attracts the cohort that pays fractional rates, anchored to a specific outcome they want.",
      },
      {
        q: "Should consultants have a tripwire?",
        a: "A paid audit or strategy session ($1,500 to $7,500) often works as a tripwire for consulting. It pre-qualifies serious buyers and converts to engagements at a high rate. The Brunson value-ladder structure maps onto consulting cleanly.",
      },
      {
        q: "Can I use this if I take on equity instead of cash?",
        a: "Yes. The diagnostic looks at the same positioning question regardless of payment mechanics. Equity-only consultants need stronger positioning, not weaker – the buyer has to believe in the consultant's track record enough to dilute their cap table.",
      },
    ],
    relatedGlossary: ["dream-100", "stack-slide", "offer"],
    lastVerified: "2026-05-19",
  },
  {
    slug: "ecommerce",
    displayName: "ecommerce founders",
    metaTitle: "Funnel Diagnostic for Ecommerce Founders",
    metaDescription:
      "If your store gets traffic but won't convert, the Brunson Hook / Story / Offer triage labels what's broken in 90 seconds.",
    heroSubhead:
      "Built for ecommerce founders whose store is live but whose conversion rate is stuck under 1%. The diagnostic labels what's broken (Wrong Person, Weak Offer, or Weak Belief) and the Playbook walks you from that label to one repeat customer.",
    cohortPain:
      "The store is launched. Products are listed with photography. Stripe and shipping are wired. Paid ads run. Conversion rate sits under 1%. Average order value is below break-even on ad spend. The Stripe line might be moving but cash flow is flat.",
    vocabulary: [
      "AOV",
      "CAC",
      "LTV",
      "cart abandonment",
      "repeat rate",
      "Shopify",
      "Klaviyo",
      "post-purchase",
      "subscription",
    ],
    moneyMechanics:
      "Product sales ($25 to $500), subscription boxes ($30 to $99/month), high-AOV bundles. Economics depend on AOV vs CAC, with LTV bridging the gap. First-purchase profitability is rare; second-purchase profitability is the actual business.",
    commonMistake:
      "Optimizing the product page when the diagnosis is at the offer-stack level. The product is fine; the offer around it (bundle, guarantee, post-purchase) is what's missing. A single product with no Stack reads like a transaction; the same product with a Stack reads like a value proposition.",
    whatCompounds:
      "The post-purchase upsell flow, the email Soap Opera for cart abandonment, and the Seinfeld pattern for repeat purchases. Ecommerce that scales builds the back-end of the funnel first (where the margin lives), not the top of the funnel (where the loss lives).",
    faqs: [
      {
        q: "Is this for digital products only or also for physical goods?",
        a: "Both. The Brunson frame works for physical, digital, and hybrid offers. Physical-product ecommerce adds shipping economics on top of the Hook / Story / Offer diagnosis, but the underlying positioning question is the same.",
      },
      {
        q: "Should I be running paid ads while my conversion rate is under 1%?",
        a: "Usually no. Below 1% conversion, paid ads burn cash. Fix the conversion-page diagnosis first, then scale paid traffic. The diagnostic surfaces whether the bottleneck is traffic quality (Wrong Person) or page frame (Weak Offer / Weak Belief).",
      },
      {
        q: "What's the right AOV for an ecommerce tripwire?",
        a: "Tripwire AOV between $7 and $47 works for most niches. Below $7 doesn't earn back ad cost; above $47 stops feeling like a tripwire and starts being treated as a core purchase. The next-step OTO sits at 2 to 4x the tripwire price for clean ladder mechanics.",
      },
    ],
    relatedGlossary: ["offer", "stack-slide", "value-ladder"],
    lastVerified: "2026-05-19",
  },
  {
    slug: "no-code-builders",
    displayName: "no-code builders",
    metaTitle: "Funnel Diagnostic for No-Code Builders",
    metaDescription:
      "Built it on Webflow, Bubble, or Softr. Got traffic but no customers. The Brunson Hook / Story / Offer triage tells you what's broken in 90 seconds.",
    heroSubhead:
      "Built for no-code founders whose Bubble or Webflow or Softr build is live but who can't get the flat Stripe line to move. Same diagnostic, same Playbook, same Hook / Story / Offer frame.",
    cohortPain:
      "The app works. The Stripe is wired. The marketing site looks clean. Traffic comes from Product Hunt or a tweet or the founder's network. Conversion to paid sits under 1%. The 'I built this in two weeks' celebration is followed by months of silence on the dashboard.",
    vocabulary: [
      "Bubble",
      "Webflow",
      "Softr",
      "Glide",
      "Adalo",
      "Stripe integration",
      "Memberstack",
      "Outseta",
      "no-code stack",
    ],
    moneyMechanics:
      "Monthly subscriptions ($9 to $99), one-time purchases for templates or finished apps, occasional white-label deals. Economics depend on conversion rate from organic traffic, since paid ads rarely earn back at the price points no-code apps typically command.",
    commonMistake:
      "Marketing the build instead of the outcome. The site says 'built on Bubble' or 'no-code SaaS for X'. Builders are proud of the construction method. Buyers don't care. They care about the specific transformation the app delivers and whether the price is fair.",
    whatCompounds:
      "Treating the no-code stack as the implementation detail it is. The Hook / Story / Offer work happens above the stack; the build is just the delivery mechanism. Founders who shift their marketing from 'how I built it' to 'what it does for you' compound faster than founders who keep evangelizing the tools.",
    faqs: [
      {
        q: "I built this in Lovable / Bolt / Cursor. Does that change anything?",
        a: "No. The diagnostic is build-stack agnostic. The Hook / Story / Offer diagnosis works identically whether the app was built in two days on Lovable or two years in Rails. The product being shipped is the only prerequisite.",
      },
      {
        q: "Should I be worried about competitors copying my no-code build?",
        a: "Almost never. The build is the easiest thing to copy. The Brunson moat is the funnel: the audience, the offer, the proof, the follow-up sequences. None of that copies from a screenshot. Focus the worry on funnel work, not on stack secrecy.",
      },
      {
        q: "Will the Playbook work if my app is free with a paid tier?",
        a: "Yes. Freemium is a Hook / Story / Offer pattern with a specific ladder structure: free tier as the Hook, paid tier as the Offer. The diagnostic looks at whether the free-to-paid transition is anchored to a specific moment of value, not at whether the free tier exists.",
      },
    ],
    relatedGlossary: ["hook", "offer", "value-ladder"],
    lastVerified: "2026-05-19",
  },
  {
    slug: "indie-hackers",
    displayName: "indie hackers",
    metaTitle: "Funnel Diagnostic for Indie Hackers",
    metaDescription:
      "Shipped the app, posted on Indie Hackers, got the cheers but not the customers. The Brunson triage finds what's broken in 90 seconds.",
    heroSubhead:
      "Built for indie hackers whose ship-post got cheers but whose Stripe line stayed flat. The diagnostic labels what's broken and the Playbook walks you from that label to one paying customer.",
    cohortPain:
      "The ship-post on Indie Hackers got upvotes. The Product Hunt launch got #2 of the day. The Twitter thread got 100 retweets. Stripe got two payments, both from people who'd later refund. The audience cheers the build and skips the buy.",
    vocabulary: [
      "ship-post",
      "MRR",
      "bootstrapped",
      "Product Hunt",
      "Indie Hackers",
      "side project",
      "ramen profitability",
      "ramen-profitable",
    ],
    moneyMechanics:
      "Monthly subscriptions ($5 to $99), occasional one-time purchases, rare lifetime deals. Economics depend on bootstrapped sustainability: $500 to $5,000 MRR within 6 to 12 months is the typical target. CAC has to be near-zero because there's no funding to subsidize it.",
    commonMistake:
      "Confusing community validation with market validation. Indie Hackers cheers the build because the community values shipping; that signal does not translate to willingness-to-pay. Founders read cheers as PMF and skip the funnel work. The flat Stripe line is the corrective.",
    whatCompounds:
      "Picking one cohort outside the IH community and selling to them. The IH community is full of builders, not buyers (with exceptions). The cohort that pays is usually three steps removed from the community that cheers. Niching the homepage outside IH is the leverage move.",
    faqs: [
      {
        q: "My Product Hunt launch did well. Why isn't it converting?",
        a: "Product Hunt traffic is curiosity traffic, not buying traffic. Conversion rates of 0.1 to 0.5% are normal for PH launches. The fix isn't a different launch platform – it's a Wrong Person diagnosis: PH attracts the wrong cohort relative to the offer.",
      },
      {
        q: "Is bootstrapping a disadvantage?",
        a: "No, but it forces discipline. Bootstrapped founders can't subsidize bad funnel work with paid acquisition. The Brunson frame fits bootstrapping perfectly: no audience-building required, no big spend on traffic, just the Hook / Story / Offer work done well enough that organic converts.",
      },
      {
        q: "Should I keep building features or fix the funnel first?",
        a: "Funnel first, almost always. Below $1K MRR, every feature ships into a void. Above $1K MRR, features start to compound. The flat Stripe line is the funnel telling you to stop building and start selling. The diagnostic surfaces what to fix.",
      },
    ],
    relatedGlossary: ["hook", "offer", "weak-belief"],
    lastVerified: "2026-05-19",
  },
  {
    slug: "ai-wrappers",
    displayName: "AI wrapper builders",
    metaTitle: "Funnel Diagnostic for AI Wrapper Founders",
    metaDescription:
      "If your GPT/Claude wrapper has traffic but won't convert, the Brunson Hook / Story / Offer triage labels what's broken in 90 seconds.",
    heroSubhead:
      "Built for AI wrapper founders whose product is live but whose Stripe line is flat. The diagnostic labels what's broken and the Playbook walks you from 'GPT wrapper' to 'paid SaaS'.",
    cohortPain:
      "The wrapper works. The system prompt is tight. The output is genuinely better than raw ChatGPT for the use case. Traffic comes from Twitter or organic search. Conversion to paid sits under 1%. Trial users churn after two prompts because they can replicate the output in their own GPT subscription.",
    vocabulary: [
      "GPT wrapper",
      "system prompt",
      "context window",
      "API cost",
      "fine-tuning",
      "agentic",
      "Claude wrapper",
      "AI workflow",
    ],
    moneyMechanics:
      "Monthly subscriptions ($5 to $97), credit-based pricing ($0.10 per generation), occasional one-time API key resales. Economics live or die on COGS: if API costs are 60%+ of revenue, the business doesn't compound. Cost-aware pricing matters more here than in any other SaaS niche.",
    commonMistake:
      "Selling the wrapper as a 'GPT-powered X'. The reader can already use GPT. The wrapper has to sell the specific workflow, the specific output format, or the specific cohort context – not the underlying model. 'GPT-powered marketing tool' converts at zero; 'a marketing brief generator for B2B SaaS founders' converts.",
    whatCompounds:
      "Building proof of output quality, not output volume. AI wrappers compound when one specific dated output is published as a case study, not when generation counts are tweeted. The Brunson Reluctant-Hero pattern (named user, specific use case, dated result) is the load-bearing proof structure.",
    faqs: [
      {
        q: "Why are my trial users churning so fast?",
        a: "Almost always a Weak Belief diagnosis. The user is testing whether your wrapper genuinely beats raw GPT for their specific use case. If it doesn't, they leave. If it does but the product doesn't surface that proof in the first session, they also leave. The activation moment matters more here than anywhere.",
      },
      {
        q: "Should I be worried about OpenAI shipping my feature?",
        a: "Maybe, but it's not the bottleneck. The bottleneck is converting current traffic. If OpenAI ships your feature in 6 months and you have $50K MRR by then, you have leverage. If you don't fix the funnel, the model-ships-it scenario doesn't matter because the business never compounded.",
      },
      {
        q: "Is the diagnostic relevant for Claude wrappers vs GPT wrappers?",
        a: "Identical. The diagnostic looks at the marketing layer, not the model layer. The Brunson frame doesn't care which API is on the back end. The Hook / Story / Offer work happens above the model abstraction.",
      },
    ],
    relatedGlossary: ["hook", "offer", "reluctant-hero"],
    lastVerified: "2026-05-19",
  },
  {
    slug: "info-product-creators",
    displayName: "info product creators",
    metaTitle: "Funnel Diagnostic for Info Product Creators",
    metaDescription:
      "If your eBook, template pack, or digital download won't convert, the Brunson Hook / Story / Offer triage labels what's broken in 90 seconds.",
    heroSubhead:
      "Built for info product creators (eBooks, templates, swipe files, packs) whose Gumroad or LemonSqueezy is live but flat. The diagnostic labels what's broken and the Playbook walks you from that label to one paying customer.",
    cohortPain:
      "The eBook is done. The Gumroad page is live. The promotional tweets went out. Sales came in for the first 72 hours then stopped. The launch traffic gave one bump; the steady state is a flat line. The product itself is fine; the marketing engine isn't compounding.",
    vocabulary: [
      "eBook",
      "template pack",
      "swipe file",
      "Gumroad",
      "LemonSqueezy",
      "Stan Store",
      "digital download",
      "info product",
    ],
    moneyMechanics:
      "One-time sales ($7 to $97 typical, $197+ rare). Economics live on volume, not margin per unit. The launch traffic earns back; the steady state is what compounds. Most info products fail at the steady state, not the launch.",
    commonMistake:
      "Treating the product as the funnel. The eBook IS the offer, not the marketing for the offer. Without a Stack Slide on the sales page, without a Soap Opera Sequence for the email list, without a tripwire-to-core ladder, info products live and die on the launch week.",
    whatCompounds:
      "Building the ladder above the info product. The $27 eBook becomes the tripwire. The $97 template pack becomes the core. The $497 course or community becomes the back-end. Info product creators who build the ladder compound; ones who keep launching $27 standalones plateau at $1K to $3K per launch.",
    faqs: [
      {
        q: "Is this for Gumroad and LemonSqueezy creators specifically?",
        a: "Platform-agnostic. The diagnostic looks at the marketing surface (sales page, email follow-up, ladder structure), not at the checkout tool. Gumroad, Stan, Podia, ConvertKit Commerce – the same Hook / Story / Offer frame applies.",
      },
      {
        q: "Should I keep launching one-off products?",
        a: "Each launch should compound the last. If launches are standalone (no shared email list, no shared ladder), you're running on a treadmill. The Brunson value-ladder pattern says: the next product is the back-end of the current one's audience. Without that, growth caps quickly.",
      },
      {
        q: "How big does my audience need to be?",
        a: "1,000 engaged subscribers is enough for $1K to $10K launches with the right offer-stack. 10,000 engaged subscribers is enough for $10K to $100K launches. Audience size matters less than the Hook / Story / Offer work on the sales page. Larger audiences just amplify whatever frame you have.",
      },
    ],
    relatedGlossary: ["value-ladder", "soap-opera-sequence", "offer"],
    lastVerified: "2026-05-19",
  },
  {
    slug: "newsletter-operators",
    displayName: "newsletter operators",
    metaTitle: "Funnel Diagnostic for Newsletter Operators",
    metaDescription:
      "If your newsletter has subscribers but no paid product attached, the Brunson Hook / Story / Offer triage finds your monetization path.",
    heroSubhead:
      "Built for newsletter operators with a real audience and no paid product. The diagnostic labels what's missing in your monetization layer and the Playbook walks you from list to ladder.",
    cohortPain:
      "The newsletter has 2,000 to 50,000 subscribers. Open rates are healthy. Sponsorship offers occasionally land. There's no paid product attached, or there is one and it's flat. The audience is there; the offer-stack isn't. Monetization is one sponsor away from disappearing.",
    vocabulary: [
      "Substack",
      "beehiiv",
      "Mailerlite",
      "ConvertKit",
      "sponsorship",
      "CPM",
      "paid newsletter",
      "premium tier",
    ],
    moneyMechanics:
      "Sponsorship ($300 to $10,000 per send), paid subscriptions ($5 to $25/month), occasional courses or info products attached. Economics flip when a paid product converts at 2 to 5% of the free list – that revenue compounds faster and isn't dependent on advertiser demand.",
    commonMistake:
      "Treating the newsletter as the product. The newsletter is the audience; the paid product is the product. Operators who never build the paid layer plateau at sponsor revenue, which is volatile. The Brunson value-ladder pattern says: the list is the top of the ladder, not the whole ladder.",
    whatCompounds:
      "Attaching one specific paid offer to the list, with the Hook / Story / Offer frame applied. A $27 tripwire converting 2% of a 5,000-subscriber list = $2,700 per launch. A $497 cohort converting 0.5% = $12,000 per launch. The newsletter feeds the funnel; the funnel feeds the bank account.",
    faqs: [
      {
        q: "Should I monetize through sponsorships or paid products?",
        a: "Both, but in the right order. Paid products compound; sponsorships rent the audience to advertisers. Build a paid product first (the diagnostic surfaces what kind), then layer sponsorships on top. Newsletters that lead with sponsorships rarely build durable paid products later.",
      },
      {
        q: "What's the right paid product for a newsletter list?",
        a: "Usually one of: a $27 to $97 info product the list has explicitly asked for (look at reply emails), a $497 to $1,997 course on the topic the newsletter covers, or a $9 to $25/month premium tier. The diagnostic helps surface which ladder rung is the right starting point.",
      },
      {
        q: "How big does my list need to be before monetizing?",
        a: "1,000 engaged subscribers is enough for a $1K to $3K launch. The bigger predictor is engagement (open rate above 35%, reply rate above 2%), not list size. A 1,000-person engaged list outperforms a 10,000-person disengaged list almost every time.",
      },
    ],
    relatedGlossary: [
      "soap-opera-sequence",
      "seinfeld-email",
      "value-ladder",
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "freelancers",
    displayName: "freelancers",
    metaTitle: "Funnel Diagnostic for Freelancers",
    metaDescription:
      "If you're freelancing on Upwork or LinkedIn and the leads keep low-balling you, the Brunson positioning triage finds what's broken.",
    heroSubhead:
      "Built for freelancers stuck competing on hourly rate. The diagnostic labels what's broken in your positioning and the Playbook walks you from gig-by-gig income to productized offer.",
    cohortPain:
      "The freelance income is real but unpredictable. Upwork and LinkedIn leads land monthly. Conversations drift toward 'what's your hourly rate?' Negotiations end at 30 to 50% below the asking number. The work that closes is scoped-down, time-compressed, and underpaid relative to expertise.",
    vocabulary: [
      "hourly rate",
      "scope",
      "Upwork",
      "LinkedIn",
      "freelance platform",
      "fixed-price",
      "retainer",
      "productized service",
    ],
    moneyMechanics:
      "Hourly billing ($50 to $300/hour), fixed-price projects ($2K to $50K), occasional retainers ($1K to $10K/month). Economics depend on positioning premium. Hourly billing caps income at calendar capacity; productized services scale beyond hours.",
    commonMistake:
      "Competing on rate instead of repositioning the offer. When a lead asks 'what's your hourly rate?', the freelancer has already lost the framing battle. The fix is upstream: the LinkedIn profile, the case studies, the homepage have to anchor the offer to a specific transformation, not a skill set.",
    whatCompounds:
      "Productizing one specific deliverable. 'I'll redesign your SaaS landing page for $4,997, two-week turnaround' beats 'I'm a designer, $150/hour'. The first prices on outcome; the second prices on time. Productized freelancers double or triple their effective hourly rate without working more hours.",
    faqs: [
      {
        q: "I'm full-time freelancing. Is this relevant?",
        a: "Especially relevant. Full-time freelancers hit the ceiling of calendar capacity quickly. The Brunson value-ladder pattern moves you from gig-by-gig income to productized offers to (eventually) info products or SaaS. The diagnostic surfaces what positioning move unlocks the next rung.",
      },
      {
        q: "Should I leave Upwork and Fiverr behind?",
        a: "Eventually yes, but not before having a direct-traffic substitute. Marketplace platforms are training wheels: they bring leads but cap rate and brand. Most freelancers leave platforms 12 to 24 months in. The diagnostic helps you see whether your own site is ready to replace platform traffic.",
      },
      {
        q: "Can I use this if I do a few different services?",
        a: "Yes, but the diagnostic will probably surface a niching diagnosis. Freelancers with three or more service categories on the homepage almost always have a Wrong Person diagnosis: the site reads like a generalist, which attracts low-ball leads. Picking one is the move; the Playbook walks you through which one.",
      },
    ],
    relatedGlossary: ["offer", "value-ladder", "stack-slide"],
    lastVerified: "2026-05-19",
  },
];

export const NICHE_SLUGS = NICHE_ENTRIES.map((e) => e.slug);

export function getNicheBySlug(slug: string): NicheEntry | undefined {
  return NICHE_ENTRIES.find((e) => e.slug === slug);
}
