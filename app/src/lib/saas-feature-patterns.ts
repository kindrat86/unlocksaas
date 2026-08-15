/**
 * /saas-feature-pattern/[slug] pSEO catalog — SaaS growth feature patterns.
 *
 * Each entry covers ONE common SaaS growth feature pattern (referral
 * program, freemium gate, paywall, upgrade modal, etc.) with the
 * pattern structure, when it fits, when it fails, and implementation
 * considerations.
 *
 * Distinct from:
 *   - /onboarding-pattern (onboarding-specific patterns)
 *   - /pricing-model (pricing-structure patterns)
 *   - /experiment (testing patterns)
 *
 * /saas-feature-pattern is the "what shape should my growth feature
 * have" surface.
 *
 * Schema: Article + FAQPage + BreadcrumbList.
 */

export interface SaasFeaturePatternFaq {
  q: string;
  a: string;
}

export interface SaasFeaturePatternEntry {
  slug: string;
  patternName: string;
  displayName: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  /** How the pattern works structurally. */
  howItWorks: string;
  /** When this pattern is the right call. */
  bestFor: string;
  /** When this pattern is the wrong call. */
  worstFor: string;
  /** The growth metric the pattern targets. */
  targetMetric: string;
  /** Implementation considerations in order. */
  implementationConsiderations: ReadonlyArray<string>;
  /** Common ways indie SaaS founders misuse this pattern. */
  commonMisuses: ReadonlyArray<string>;
  /** Realistic outcome bands when done well. */
  realisticOutcomes: string;
  faqs: ReadonlyArray<SaasFeaturePatternFaq>;
  lastVerified: string;
}

export const SAAS_FEATURE_PATTERN_ENTRIES: ReadonlyArray<SaasFeaturePatternEntry> =
  [
    {
      slug: "referral-program-pattern",
      patternName: "Referral program",
      displayName: "Referral program feature pattern",
      metaTitle: "Referral Program Feature Pattern for Indie SaaS",
      metaDescription:
        "How the SaaS referral program pattern works, when it fits indie SaaS, realistic outcome bands, and the implementation considerations most founders miss.",
      intro:
        "Referral programs are the most-attempted and least-honestly-evaluated growth pattern in indie SaaS. The structural design (referrer reward, referee benefit, attribution mechanic) determines whether the program produces real growth or just rewards existing happy customers for what they were going to do anyway.",
      howItWorks:
        "Each customer gets a unique referral link or code. When a new customer signs up using that link, the referrer earns a reward (account credit, commission, free month, physical gift), and the referee often gets a benefit too (discount, extended trial, bonus credits).",
      bestFor:
        "Indie SaaS at $50/month+ price points with engaged customer bases. Products where the customer's friends and colleagues genuinely face the same problem. SaaS with high LTV — referral economics work when the customer's lifetime revenue exceeds the referral reward 3-5x over.",
      worstFor:
        "Pre-product-market-fit SaaS. Products with high free-tier and low conversion (referrers send sign-ups but few convert to paid). Products where the buyer is not who would refer (B2B SaaS with end-users referring people who do not buy).",
      targetMetric:
        "Referral conversion rate (paid signups from referral / referrer clicks). 1-5% is realistic for indie SaaS; below 1% suggests the referral mechanic does not work or the audience does not refer.",
      implementationConsiderations: [
        "Decide the reward shape: account credit (zero marginal cost, only good for existing customers), commission (scalable but needs payout infrastructure), free month (works but caps reward potential).",
        "Single-sided vs two-sided rewards. Two-sided (both referrer + referee benefit) converts at 20-50% higher rates but doubles the cost per referral.",
        "Build attribution before launching. The referral link must persist through signup, account creation, and first payment — three steps where attribution typically breaks.",
        "Surface the program where customers naturally see it: in-app dashboard, post-purchase confirmation, monthly emails. Hiding it under settings produces near-zero engagement.",
        "Track quality of referrals, not just quantity. A referral that produces a high-LTV customer is worth 5x a referral that produces a low-LTV customer.",
      ],
      commonMisuses: [
        "Launching referral before product-market fit. Without happy customers, there is no referral fuel; the program just looks broken.",
        "Reward too small to motivate (5% off). The reward has to be worth the referrer's social capital expenditure.",
        "Reward too large for the math to work. 30%+ commission on indie SaaS pricing usually inverts unit economics.",
        "No mechanism to track which referrals convert vs which churn fast. Cheap-referral cohorts churn higher; the program needs the data to optimize.",
        "Promoting the referral program as a primary acquisition channel. For most indie SaaS, referrals are 5-15% of new customer acquisition — meaningful but not primary.",
      ],
      realisticOutcomes:
        "Done well: 5-15% of new customers from referrals. The cohort tends to retain better than cold-channel customers (referred-by-friend conversion produces higher trust). Done badly: under 1% of new customers, program looks like noise, founder loses confidence and disables.",
      faqs: [
        {
          q: "Should I offer cash commission or account credit for referrals?",
          a: "Account credit for indie SaaS — zero marginal cost, keeps the cohort engaged. Cash commission only at scale (above $1M ARR) where the operational lift is justified by volume.",
        },
        {
          q: "Two-sided rewards or single-sided?",
          a: "Two-sided for consumer SaaS where the referee will judge the referrer (a discount sweetens the ask). Single-sided fine for B2B SaaS where the referee is a professional buyer making a business case independently.",
        },
      ],
      lastVerified: "2026-05-19",
    },
    {
      slug: "freemium-gate-pattern",
      patternName: "Freemium gate",
      displayName: "Freemium gate feature pattern",
      metaTitle: "Freemium Gate Feature Pattern for Indie SaaS",
      metaDescription:
        "How the freemium gate pattern works, when it converts free users to paid, and the common indie SaaS misuses.",
      intro:
        "The freemium gate is the structural mechanism that converts free-tier users to paid customers — usage caps, feature limits, time limits, or a combination. Designed well, the gate is invisible until it produces upgrade intent. Designed badly, the gate produces churn before conversion.",
      howItWorks:
        "Free tier offers genuine value but has a structural limit — usage cap (10 emails/month), feature gate (no exports without paid), team gate (1 seat only), or time gate (14 days then conversion). The gate becomes binding for users who actually use the product, triggering upgrade.",
      bestFor:
        "Products with strong network effects or virality (free users add value). Products where usage scales clearly per customer (more emails sent, more bookings made). Products at scale where the freemium volume produces non-trivial customer acquisition.",
      worstFor:
        "Pre-PMF indie SaaS (freemium loads the user base with non-customers). Products with high marginal cost per free user. Products where the free tier accidentally satisfies most use cases (no upgrade trigger fires).",
      targetMetric:
        "Free-to-paid conversion rate over 90 days. 2-5% is healthy for indie SaaS freemium; below 1% sustained means the gate is wrong (or the paid offer is weak).",
      implementationConsiderations: [
        "Pick ONE primary gate mechanism. Usage cap, feature gate, or team gate — not all three. Multi-gate freemium is hard for users to understand and rarely converts better.",
        "Set the gate threshold where 60-70% of engaged users hit it within 30 days. Lower thresholds (90%+ users) trigger upgrade too aggressively; higher (40%-) miss the conversion moment.",
        "Surface upgrade prompts AT the gate, not before. A user actively hitting a limit converts at 5-10x the rate of a user being warned 'you are approaching your limit'.",
        "Make the upgrade path one-click from the gate. Friction kills conversion at the exact moment intent is highest.",
        "Track gate-hit-to-upgrade rate per gate type. Different gates have different conversion mechanics; the data tells you which gate the product actually needs.",
      ],
      commonMisuses: [
        "Generous free tier that satisfies most users' real use cases. Conversion stays sub-1%; free becomes the product.",
        "Punitive free tier that frustrates within first session. Users churn before they understand the product's value.",
        "Multiple simultaneous gates (usage AND features AND team). Confusion overwhelms; users do not upgrade because they cannot tell what they would unlock.",
        "Gate moment that hides the upgrade path. The user hits the limit and the system says 'you have reached your limit' without a clear next step.",
      ],
      realisticOutcomes:
        "Done well: 3-8% free-to-paid over 90 days, paid customer count grows 30-50% faster than no-freemium baseline (more top-of-funnel). Done badly: under 1%, support cost per free user exceeds revenue per paid user, eventually freemium gets retired.",
      faqs: [
        {
          q: "Should free tier require a credit card?",
          a: "Almost never for freemium. Credit-card-required freemium is essentially trial; it filters volume in exchange for slightly higher conversion. Use trial for the filtered approach, freemium for the volume approach.",
        },
      ],
      lastVerified: "2026-05-19",
    },
    {
      slug: "paywall-pattern",
      patternName: "Paywall (content / feature gating)",
      displayName: "Paywall feature pattern",
      metaTitle: "Paywall Pattern for SaaS and Content Products",
      metaDescription:
        "How the paywall pattern works, the soft-vs-hard paywall trade-off, when each fits, and the common implementation mistakes.",
      intro:
        "Paywalls gate specific content or features behind paid subscription. The structural choice is soft (preview shown, then paywall) vs hard (no preview, full gate). Soft paywalls convert higher per visitor; hard paywalls produce higher trust per subscriber.",
      howItWorks:
        "A specific surface (article, feature, dashboard view) requires paid status to access. Soft paywall: shows partial content + paywall prompt. Hard paywall: full block with paid-only message. Subscriber state checked on every render.",
      bestFor:
        "Content products (newsletters, courses, research reports). SaaS with high-value premium features that justify a tier upgrade. Products where the gated content is the differentiator, not the platform.",
      worstFor:
        "Products where the value is utility-based and not gated by 'content' (productivity tools, integration platforms). Products where the paywall blocks the discoverability path (gating signup, gating onboarding).",
      targetMetric:
        "Paywall conversion rate (paid signups / paywall hits). 1-4% is realistic for soft paywalls; 0.5-2% for hard paywalls. Higher numbers suggest pricing power or strong content fit.",
      implementationConsiderations: [
        "Soft vs hard paywall: soft (preview + paywall) converts higher per visit; hard produces less leak but loses casual readers. Most indie content products start soft, tighten to hard at scale.",
        "Paywall placement matters: mid-article paywall (after 200 words) converts higher than top-of-article or end-of-article.",
        "Show the gated value, not just the price. 'Read the full analysis with our 2026 data set' beats 'Subscribe to read more'.",
        "Allow occasional free deep-link reads (1 per week or month). Gives prospects evidence of quality.",
        "Track paywall-hit funnel: hit, click upgrade CTA, view pricing, complete purchase. Most paywalls leak at the pricing-view step.",
      ],
      commonMisuses: [
        "Paywall too aggressive (first paragraph). Reads as predatory; user bounces before forming an opinion.",
        "Paywall on signup/onboarding rather than content. Users cannot evaluate; conversion stalls.",
        "Bypassable paywall (browser console can read the gated content). Engineering oversight; defeats the model.",
        "Identical paywall on every page. Some surfaces should be open (about, contact, free articles) to build credibility.",
      ],
      realisticOutcomes:
        "Done well: 2-4% of paywall hits convert to paid. The cohort retains 70%+ at 90 days. Done badly: under 1% conversion, high bounce rate at paywall, reputation as 'paywalled site' on social media.",
      faqs: [
        {
          q: "How many free articles before the paywall?",
          a: "For pure content products, 5-10 free articles per visitor before paywall triggers. For SaaS-content hybrid, 2-3 free content surfaces alongside free product use.",
        },
      ],
      lastVerified: "2026-05-19",
    },
    {
      slug: "upgrade-prompt-pattern",
      patternName: "In-product upgrade prompt",
      displayName: "In-product upgrade prompt feature pattern",
      metaTitle: "In-Product Upgrade Prompt Pattern (SaaS)",
      metaDescription:
        "How in-product upgrade prompts work, when they convert, when they annoy, and the implementation considerations.",
      intro:
        "In-product upgrade prompts are the contextual nudges that appear inside the product when a user could benefit from upgrading. Done well they convert at high rates because intent is implicit; done badly they read as constant nagging and damage retention.",
      howItWorks:
        "Triggered when a user hits a paid-tier capability or a usage signal that correlates with upgrade benefit. Surface as inline banner, modal, tooltip, or feature spotlight. Always include a clear upgrade CTA and a dismiss option.",
      bestFor:
        "SaaS with clear free-to-paid feature differentiation. Products where users naturally hit upgrade-trigger moments during normal use. Mature products with established usage patterns.",
      worstFor:
        "Products without clear upgrade triggers (every feature available on free). Products where the prompts would fire constantly (every page). Pre-PMF products where users have not yet learned the core value.",
      targetMetric:
        "Prompt-to-upgrade rate per trigger type. 0.5-3% is realistic; higher (5%+) suggests strong feature-fit; lower (<0.5%) suggests the trigger is firing in the wrong moments.",
      implementationConsiderations: [
        "Fire on real intent signals, not random page views. 'User tried to use feature X' beats 'user has been logged in 7 days'.",
        "One prompt per session at most. Multiple prompts in the same session train users to dismiss without reading.",
        "Dismiss should be permanent (or 30-day cooldown) per prompt type. Re-firing dismissed prompts on next session is the most-hated upgrade UX.",
        "Surface the specific feature the user wanted, not generic 'upgrade now'. 'Unlock CSV export' beats 'Upgrade to Pro'.",
        "Track prompt-shown-but-not-clicked rate. If prompts are shown 100x but clicked 0-1x, the prompt content or timing is wrong.",
      ],
      commonMisuses: [
        "Prompts on every page. The constant-nag pattern damages retention more than it improves conversion.",
        "Generic 'Upgrade to Pro' CTAs without naming the specific value. Lower conversion than feature-specific CTAs.",
        "Modal prompts that block product use. The forced-modal pattern frustrates users mid-task.",
        "Prompts that bypass user preference. If the user dismissed a prompt 3 times, stop showing it.",
      ],
      realisticOutcomes:
        "Done well: contributes 20-40% of upgrades for products with paid-feature mix. Done badly: contributes <5% of upgrades and increases churn 10-20% via accumulated friction.",
      faqs: [
        {
          q: "Should free-tier users see ANY upgrade prompts?",
          a: "Yes, but timed to feature-attempt moments, not session-time. Free users hitting a Pro feature should see a clear unlock prompt; free users browsing the dashboard should not see generic upgrade ads.",
        },
      ],
      lastVerified: "2026-05-19",
    },
    {
      slug: "in-app-survey-pattern",
      patternName: "In-app survey",
      displayName: "In-app survey feature pattern",
      metaTitle: "In-App Survey Feature Pattern (SaaS)",
      metaDescription:
        "How in-app surveys produce signal for indie SaaS, the question types that work, and the survey-fatigue pattern to avoid.",
      intro:
        "In-app surveys collect specific customer signal at the moment it matters (post-onboarding, post-feature-use, pre-churn). Done well they produce signal qualitative interviews cannot scale to; done badly they produce survey fatigue that damages NPS and engagement metrics.",
      howItWorks:
        "Trigger a short survey (1-3 questions) at a specific user moment. Inline, banner, or modal placement. Collect response, dismiss UI, store in customer record for segmentation and follow-up.",
      bestFor:
        "Mature SaaS with established usage patterns. Products with clear customer-segments needing different feature focus. Products where qualitative-at-scale signal is the constraint.",
      worstFor:
        "Pre-PMF SaaS (you need conversations, not surveys). Solo founders without bandwidth to read every response. Products with low active-customer count (under 100) where qualitative interviews scale just fine.",
      targetMetric:
        "Survey response rate. 10-30% is healthy for in-app surveys; higher suggests the surveys are too frequent or the audience is too small.",
      implementationConsiderations: [
        "Maximum 3 questions per survey. Beyond 3, drop-off is severe.",
        "First question should be quantitative (1-10 score, multi-choice). Open-ended first questions stop engagement instantly.",
        "Trigger on specific moments: post-onboarding completion, post-key-feature-use, day-30 retention check, day-7 trial check.",
        "Surface follow-up: every survey response should include a 'thank you' message and an indication of what happens next.",
        "Aggregate analysis monthly. Single-response insights are anecdotes; patterns across responses are data.",
      ],
      commonMisuses: [
        "Surveying constantly. Survey fatigue produces lower response rates AND lower NPS scores over time.",
        "Asking open-ended questions only. Most users skip them; quantitative-first design produces higher response rates.",
        "Surveying users who have not used the feature. The 'do you like our new feature?' survey to users who never opened it produces noise.",
        "Not following up on responses. Users who reply expect acknowledgement; silence trains them not to respond next time.",
      ],
      realisticOutcomes:
        "Done well: 20-30% response rate sustained, qualitative insights that inform product roadmap, customer-feedback loop that compounds. Done badly: response rate drops to 5%, NPS scores drop 5-10 points, customers cite 'too many surveys' in churn exit feedback.",
      faqs: [
        {
          q: "Should in-app surveys be anonymous or attributed?",
          a: "Attributed by default for indie SaaS. The ability to follow up with respondents is half the value. Allow anonymous as an option for sensitive feedback (churn surveys, salary surveys).",
        },
      ],
      lastVerified: "2026-05-19",
    },
    {
      slug: "annual-upgrade-prompt-pattern",
      patternName: "Annual upgrade prompt (monthly → annual)",
      displayName: "Annual upgrade prompt feature pattern",
      metaTitle: "Monthly-to-Annual Upgrade Prompt Pattern (SaaS)",
      metaDescription:
        "How indie SaaS prompts monthly subscribers to switch to annual. The trigger logic, the discount that converts, and the common mistakes.",
      intro:
        "The monthly-to-annual upgrade prompt is the cleanest cash-flow lever indie SaaS has. Converting one monthly customer to annual produces 12 months of upfront cash, lower churn risk, and a stronger LTV calculation. The trigger logic and discount level determine conversion.",
      howItWorks:
        "After a monthly customer has been on the product for 30-90 days, surface a contextual prompt offering annual billing at a discount (typically 15-25%). Prompt appears in-app, via email, or both. Customer can self-serve the switch.",
      bestFor:
        "SaaS at $30/month+ where annual cash matters. Customers who have shown retention signal (30+ day usage). Products where annual lock-in does not feel coercive.",
      worstFor:
        "New customers (under 30 days). High-churn cohorts (annual lock-in produces refund-rage). Products at <$20/month where annual cash impact is too small to justify the offer's complexity.",
      targetMetric:
        "Monthly-to-annual conversion rate within 90 days of prompt exposure. 5-15% is realistic; higher (20%+) suggests the discount is too generous; lower (<3%) suggests the prompt is missing the right moment.",
      implementationConsiderations: [
        "Trigger after 30-90 days of monthly use. Earlier prompts hit customers before retention signal; later prompts miss the high-intent window.",
        "Annual discount: 15-25% is the conversion sweet spot. 10% does not move enough; 30%+ trains customers to wait for the prompt.",
        "Surface the cash savings, not just the percentage. '$120/year vs $144/year, save $24' is more concrete than '17% off annual'.",
        "Make the switch one-click. Multi-step annual upgrades lose 60-80% of intent.",
        "Always grandfather monthly customers — never auto-convert them to annual without explicit consent.",
      ],
      commonMisuses: [
        "Prompt fires for every customer regardless of usage. Customers who are about to churn get a 'commit to a year' prompt and refund-rage.",
        "Annual discount too generous (40%+). Trains every monthly customer to wait; damages monthly-pricing perception.",
        "No way to switch back to monthly. Some customers prefer monthly billing; offering escape hatches reduces refund risk.",
        "Surprise auto-conversion. Some legacy SaaS converts monthly to annual silently; produces refund-rage and brand damage.",
      ],
      realisticOutcomes:
        "Done well: 10-15% of monthly customers convert to annual within 90 days of prompt. Annual cohort retains 90%+ over the year; cash flow improves measurably. Done badly: under 3% conversion AND complaints about pressure tactics — both fixable by adjusting trigger logic and discount.",
      faqs: [
        {
          q: "Should the prompt offer a cash discount or extra months?",
          a: "Both work; cash discount communicates more clearly to most buyers. 'Get 14 months for the price of 12' converts comparably to '17% off annual' but is harder to communicate. For most indie SaaS, simple % discount wins on clarity.",
        },
      ],
      lastVerified: "2026-05-19",
    },
    {
      slug: "team-invitation-pattern",
      patternName: "Team invitation flow",
      displayName: "Team invitation feature pattern",
      metaTitle: "Team Invitation Feature Pattern for B2B SaaS",
      metaDescription:
        "How B2B SaaS team invitation flows work, the seat-pricing implications, and the common conversion mistakes.",
      intro:
        "Team invitation flows convert single-user customers into multi-seat customers — the biggest expansion-revenue lever for B2B SaaS. Designed well, invitations produce 30-60% of seat growth; designed badly, they sit unused and the customer stays solo.",
      howItWorks:
        "After a user signs up, an in-product CTA encourages them to invite teammates. Invitations can be email-based (send link), bulk (paste emails), or organic (share a workspace URL). Invited users join the same paid workspace, often at the same seat price.",
      bestFor:
        "Per-seat B2B SaaS. Products where collaboration is core value. Products at $20+/seat/month where additional seats produce meaningful revenue.",
      worstFor:
        "Solo-user products (forms, calendars, individual analytics). Flat-rate-pricing products where adding seats does not lift revenue. Products where the buyer is the only user (early-stage CRMs, accounting tools).",
      targetMetric:
        "Seats-per-account growth over 90 days. Healthy indie B2B sees 1.5-2.5 seats per account at the 90-day mark; below 1.5 suggests the invitation flow is weak or the product does not need collaboration.",
      implementationConsiderations: [
        "Surface invitation prompt during onboarding (after first key value moment, not before). Users who have not yet seen the value will not invite teammates.",
        "Pre-fill invitation emails. 'Invite Sarah, John, and Mike' beats blank-state 'enter teammate email'.",
        "Auto-detect potential teammates from email domain. If user @acme.com invites @acme.com, the conversion is highest.",
        "Make invitation rewards mutual: invitee gets seamless join, inviter gets reduced friction. Two-sided benefit lifts invitation rate.",
        "Allow workspace-link invitations. Some teams prefer copy-paste-share over per-person email.",
      ],
      commonMisuses: [
        "Invitation prompts before user understands product value. Conversion plummets.",
        "Charging seat fees for invited users who never log in. Customer churn spikes when invoiced for non-active seats.",
        "Inviting via gated form that requires admin approval. Adds friction; many invites die in approval queue.",
        "Not surfacing invitation outside onboarding. Users hit invitation moments later in product life; the flow has to be discoverable.",
      ],
      realisticOutcomes:
        "Done well: 40-60% of accounts have 2+ seats by day 90; expansion revenue is meaningful. Done badly: 80%+ of accounts stay at 1 seat; per-seat pricing fails to compound.",
      faqs: [
        {
          q: "Should invited seats be free for the first 30 days?",
          a: "Generally no for B2B SaaS — paid-from-day-one creates real commitment. The exception is products where the invited user contributes value to the inviter (collaborative tools); a brief free trial for invitees works there.",
        },
      ],
      lastVerified: "2026-05-19",
    },
  ];

export const SAAS_FEATURE_PATTERN_SLUGS: ReadonlyArray<string> =
  SAAS_FEATURE_PATTERN_ENTRIES.map((e) => e.slug);

export function getSaasFeaturePatternBySlug(
  slug: string,
): SaasFeaturePatternEntry | undefined {
  return SAAS_FEATURE_PATTERN_ENTRIES.find((e) => e.slug === slug);
}
