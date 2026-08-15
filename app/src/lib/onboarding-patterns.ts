/**
 * /onboarding-pattern/[slug] pSEO catalog — onboarding flow design patterns.
 *
 * Each entry covers ONE design pattern for SaaS onboarding (linear
 * walkthrough, in-product checklist, just-in-time, sample data, etc.)
 * with how the pattern works, when it fits, the implementation steps,
 * and the activation metric to track.
 *
 * Distinct from:
 *   - /experiment (testing onboarding sequences)
 *   - /checklist (pre-launch verification)
 *   - /skill (founder skills)
 *
 * /onboarding-pattern is the "what onboarding shape should my product
 * have" surface.
 *
 * Schema: Article + FAQPage + BreadcrumbList. No HowTo because the
 * content is design-pattern analysis, not a step sequence per se.
 */

export interface OnboardingPatternFaq {
  q: string;
  a: string;
}

export interface OnboardingPatternEntry {
  slug: string;
  patternName: string;
  displayName: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  howItWorks: string;
  /** When this pattern fits. */
  bestFor: string;
  /** When this pattern fails. */
  worstFor: string;
  /** Activation metric this pattern targets. */
  activationMetric: string;
  /** Implementation considerations in order. */
  implementationSteps: ReadonlyArray<string>;
  /** Common implementation mistakes. */
  commonMistakes: ReadonlyArray<string>;
  /** Variations of the pattern. */
  variations: ReadonlyArray<string>;
  faqs: ReadonlyArray<OnboardingPatternFaq>;
  lastVerified: string;
}

export const ONBOARDING_PATTERN_ENTRIES: ReadonlyArray<OnboardingPatternEntry> =
  [
    {
      slug: "linear-walkthrough-onboarding",
      patternName: "Linear walkthrough",
      displayName: "Linear walkthrough onboarding pattern",
      metaTitle: "Linear Walkthrough Onboarding Pattern (SaaS)",
      metaDescription:
        "How the linear walkthrough onboarding pattern works, when it fits, when it fails, and what the activation metric should be.",
      intro:
        "The linear walkthrough is the most-used and most-misused onboarding pattern. New users are guided step-by-step through the product on first login. Done well, it produces activation; done badly, it produces ignored tooltips and frustrated users.",
      howItWorks:
        "On first login, the user sees a guided sequence of steps — tooltips, modal overlays, or a wizard — that walks them through the core flow. Each step blocks until the user takes the prompted action. Once the sequence completes, the user is dropped into the regular product UI.",
      bestFor:
        "Products with a single 'happy path' that every user must learn. Products where the first interaction is structurally non-obvious (multi-step setup, integration connection, data import). Lower-complexity products where one walkthrough covers most users' needs.",
      worstFor:
        "Multi-persona products where different users need different first paths. Products experienced users return to (the walkthrough becomes friction on re-onboarding). Products where the value is exploratory.",
      activationMetric:
        "Walkthrough completion rate at first session × first-week retention. Walkthrough completion without first-week retention means the walkthrough is too aggressive; first-week retention without walkthrough completion means the walkthrough is irrelevant.",
      implementationSteps: [
        "Define the 5-7 actions a user must take to reach 'activated' state. Any more is too long; any less is too thin.",
        "Sequence the actions in dependency order. Action 1 must precede action 2 logically, not just sequentially.",
        "Add a 'skip' or 'continue later' option at every step. Forcing the walkthrough drives churn in users who already know what they want.",
        "Track step-by-step drop-off. The step with the highest drop is the redesign target.",
        "Re-show key steps if the user does not return to the action within 7 days.",
      ],
      commonMistakes: [
        "Walking the user through 15+ steps. After 7 steps, completion rate collapses; the rest of the tour is theater.",
        "Forcing the walkthrough with no skip option. Power users leave; new users feel trapped.",
        "Tooltips that explain features instead of guiding actions. The walkthrough is for the user TO DO something, not to read about it.",
        "Not measuring walkthrough completion. Without the metric, you cannot tell whether the walkthrough is the right pattern at all.",
      ],
      variations: [
        "Hotspot walkthrough — pulses on the next-action button instead of modal overlays.",
        "Sample data walkthrough — pre-populates the product with sample data so users see the value before taking action.",
        "Per-persona walkthroughs — different first paths for different user types, surfaced via a 'what brings you here?' question.",
      ],
      faqs: [
        {
          q: "Should the walkthrough block product use until completed?",
          a: "Rarely. Soft walkthroughs (always-skippable) almost always outperform forced ones because power users self-select out and new users do not feel trapped.",
        },
      ],
      lastVerified: "2026-05-19",
    },
    {
      slug: "in-product-checklist-onboarding",
      patternName: "In-product checklist",
      displayName: "In-product checklist onboarding pattern",
      metaTitle: "In-Product Checklist Onboarding Pattern (SaaS)",
      metaDescription:
        "How the in-product checklist pattern works, when it fits, the activation metric, and how to design checklist items that actually move retention.",
      intro:
        "The in-product checklist is a persistent UI element listing the steps to full activation. Users complete steps at their own pace; the checklist visibly progresses. It is one of the highest-leverage onboarding patterns for SaaS with multi-step value loops.",
      howItWorks:
        "A persistent checklist UI (sidebar, banner, or dashboard widget) lists 5-7 onboarding actions. Each item is clickable and links to the relevant feature. Items check off as users complete them. The checklist hides when complete or becomes minimizable.",
      bestFor:
        "Products with multi-step setup. Products where users return repeatedly before fully activating. SaaS where activation correlates strongly with retention (most B2B SaaS).",
      worstFor:
        "Single-action products (calendar bookers, simple forms). Products with very high single-session activation. Products where the checklist becomes a permanent UI element after most users complete it.",
      activationMetric:
        "Percentage of users completing 80%+ of checklist items within 7 days. Pair with day-7 retention — checklist completers should retain at 2-3x the rate of non-completers.",
      implementationSteps: [
        "Pick 5-7 actions that correlate with activated, retained users. Use cohort data, not opinion, to choose.",
        "Order from easiest to highest-value. Quick wins create momentum; the highest-value action goes at the end where motivation is highest.",
        "Make items immediately actionable — each item links to the exact place in the product where it can be completed.",
        "Persist progress across sessions. Users come back over days; the checklist must remember.",
        "Reward completion (badge, message, unlock) — small recognition that the work was noticed.",
      ],
      commonMistakes: [
        "Checklist items that are too vague ('Set up your team'). Specificity wins ('Invite 2 teammates by email').",
        "Items that take more than 5 minutes each. Long-step items get skipped.",
        "Permanent checklist UI after completion. Users feel nagged.",
        "Items that do not correlate with retention. If completing the checklist does not predict retention, the items are wrong.",
      ],
      variations: [
        "Gamified checklist with points/badges for completion (works for consumer SaaS, less for B2B).",
        "Tiered checklist with 'must do' / 'should do' / 'nice to do' sections.",
        "Role-based checklist where different teammates see different items.",
      ],
      faqs: [
        {
          q: "What is the best place to show the checklist?",
          a: "Sidebar or top-of-dashboard for B2B SaaS; persistent banner for consumer SaaS. Modal overlays drive completion in the first session but lose users on session 2+.",
        },
      ],
      lastVerified: "2026-05-19",
    },
    {
      slug: "sample-data-onboarding",
      patternName: "Sample data pre-population",
      displayName: "Sample-data onboarding pattern",
      metaTitle: "Sample Data Onboarding Pattern (SaaS)",
      metaDescription:
        "How sample-data pre-population works as an onboarding pattern, when it fits, and the implementation considerations.",
      intro:
        "Sample-data onboarding pre-populates the user's account with example data so they can see the product's value before taking any setup action. Reduces time-to-aha; works exceptionally well for analytics, dashboards, and any product where empty-state is unhelpful.",
      howItWorks:
        "On first login, the user's workspace is seeded with sample data (sample customers, sample reports, sample documents). The user explores the populated product, sees what it can do, and then either clears the sample data or migrates it into real data.",
      bestFor:
        "Analytics dashboards (empty dashboards are useless). Workflow tools where the value is visible only with data in the system. Products where users want to evaluate before committing to setup.",
      worstFor:
        "Products that depend on user-specific configuration (CRMs, project management tools where the data IS the configuration). Products where sample data confuses ownership (users delete sample data thinking it's real).",
      activationMetric:
        "Time-to-first-meaningful-interaction. Users with sample data should hit a meaningful interaction (filter, drill-down, configuration tweak) within 60 seconds of first login.",
      implementationSteps: [
        "Create realistic sample data that reflects what real customers see. Generic 'Lorem Ipsum'-style data fails to show the product's value.",
        "Mark sample data clearly — visual indicator (color, badge, watermark) so users do not mistake it for real.",
        "Make 'clear sample data' a one-click action accessible from the dashboard.",
        "Provide a 'replace with your real data' path that is at least as obvious as the 'keep sample' path.",
      ],
      commonMistakes: [
        "Sample data that looks too perfect ('every metric is in the green'). Users intuit fakery and discount the product.",
        "No clear way to clear sample data. Users get stuck with mixed real + sample data.",
        "Sample data that does not reflect the user's likely use case. A B2B CRM seeded with retail-store customers loses credibility.",
      ],
      variations: [
        "Persona-based sample data — different sample sets for different user types, selected via initial questionnaire.",
        "Time-bombed sample data — automatically clears after 14 days if user has not imported real data.",
      ],
      faqs: [
        {
          q: "Does sample-data onboarding hurt retention?",
          a: "Only if the transition to real data is poor. Done well, sample data accelerates time-to-aha and improves activation; done badly, users explore the sample, never set up real data, and churn.",
        },
      ],
      lastVerified: "2026-05-19",
    },
    {
      slug: "just-in-time-onboarding",
      patternName: "Just-in-time onboarding",
      displayName: "Just-in-time onboarding pattern",
      metaTitle: "Just-In-Time Onboarding Pattern (SaaS)",
      metaDescription:
        "How just-in-time onboarding works, when it fits, the implementation considerations, and the activation metric.",
      intro:
        "Just-in-time onboarding shows help, tooltips, or guidance only when the user reaches the relevant feature for the first time. There is no upfront walkthrough — instruction happens at the moment of use. Often the most user-respectful onboarding pattern.",
      howItWorks:
        "The user is dropped into the product on first login with no walkthrough. As they explore and reach new features, contextual tooltips appear explaining the feature. After first use, the tooltips do not show again.",
      bestFor:
        "Products experienced users return to (CRMs, project management, design tools). Products with many features but most users only use a subset. Multi-persona products where the upfront walkthrough cannot cover all paths.",
      worstFor:
        "Products with non-obvious core flow. Products where the first 60 seconds determine activation. Products where the user has no context for what they should do first.",
      activationMetric:
        "Feature-first-use rate. Track which features users discover via just-in-time prompts vs which they never find. Hidden features are the redesign target.",
      implementationSteps: [
        "Map the features in the product. For each, decide whether the first-use experience needs explanation or can be self-evident.",
        "Write contextual tooltips for the features that need them. Keep each tooltip to 1-2 sentences.",
        "Track first-use events. Features users never reach without a tooltip are candidates for promotion into a more proactive onboarding pattern.",
        "Make tooltips dismissable and never auto-repeat. The user controls the pace.",
      ],
      commonMistakes: [
        "Tooltips that auto-repeat after dismissal. Users feel patronized.",
        "Just-in-time onboarding for products where the first-action is non-obvious. The user freezes in front of the empty state.",
        "Skipping any onboarding entirely and calling it just-in-time. Just-in-time still requires designed tooltips at first-use moments.",
      ],
      variations: [
        "Spotlight just-in-time — single-element highlight pulse when user reaches a relevant area.",
        "Inline just-in-time — explanations baked into the feature's UI itself, fading over multiple uses.",
        "Conditional just-in-time — tooltips appear only when the user appears stuck (e.g. hovering without clicking).",
      ],
      faqs: [
        {
          q: "Should just-in-time onboarding have any upfront component?",
          a: "Usually a minimal welcome screen explaining the product's core value, then drop into product. Some products do well with literally zero upfront onboarding; depends on whether the first action is self-evident.",
        },
      ],
      lastVerified: "2026-05-19",
    },
    {
      slug: "guided-setup-onboarding",
      patternName: "Guided setup wizard",
      displayName: "Guided setup wizard onboarding pattern",
      metaTitle: "Guided Setup Wizard Onboarding Pattern (SaaS)",
      metaDescription:
        "How the guided setup wizard pattern works, when it fits, the implementation considerations, and what the wizard should and should not include.",
      intro:
        "The guided setup wizard takes users through a focused setup before they can use the product. Used for products where initial configuration is non-optional — integrations, data import, multi-step billing setup. High investment from the user; high completion produces high activation.",
      howItWorks:
        "On first login, the user is presented with a multi-step setup wizard. Each step collects required information (connect integration, choose plan, set workspace name). The wizard blocks product use until complete; on completion the user lands on a fully-configured product.",
      bestFor:
        "Products requiring real configuration to function (integration-heavy SaaS, multi-account platforms). Products where users abandon if setup is asynchronous. B2B SaaS where the setup-time investment correlates with retention.",
      worstFor:
        "Products with optional setup. Products where users explore before deciding to commit. Consumer SaaS where the bar for first interaction is low.",
      activationMetric:
        "Wizard completion rate at first session. Anything below 60% completion suggests the wizard is too long or asks for the wrong things.",
      implementationSteps: [
        "Identify the absolute minimum information the product needs to function. Cut everything else from the wizard.",
        "Order steps from least friction to most. Easy wins build commitment; the highest-friction step goes after the user has invested.",
        "Provide progress indication — '2 of 5 steps' is essential at this length.",
        "Allow back-stepping. Forcing forward-only progress causes drop-off on the third step.",
        "Provide a 'save and come back later' option for non-critical fields.",
      ],
      commonMistakes: [
        "Including optional fields in a required-step wizard. The user resents being slowed down for non-essential information.",
        "Wizards longer than 7 steps. Drop-off after step 7 is severe.",
        "No back-stepping. Forcing the user forward without let them correct losses 20-40% per step.",
        "Wizards that surprise the user with cost or commitment late. Users feel trapped and abandon.",
      ],
      variations: [
        "Wizard with smart defaults — pre-fills as much as possible, requires user confirmation only.",
        "Conditional wizard — different steps based on initial answers, reducing total time for most users.",
      ],
      faqs: [
        {
          q: "Can the wizard ask for payment?",
          a: "Yes, but place payment at the end of the wizard after the user has invested in setup. Front-loading payment loses most users; back-loading payment loses fewer but creates 'completed setup, did not pay' churn.",
        },
      ],
      lastVerified: "2026-05-19",
    },
    {
      slug: "concierge-onboarding",
      patternName: "Concierge (founder-led) onboarding",
      displayName: "Concierge onboarding pattern",
      metaTitle: "Concierge Onboarding Pattern for Indie SaaS",
      metaDescription:
        "How concierge onboarding works for indie SaaS — the founder personally onboards every customer. When it fits, when to retire it, and the activation lift.",
      intro:
        "Concierge onboarding means the founder personally onboards every customer — usually via a 30-minute call. It does not scale, but for indie SaaS at 0-50 customers it produces the highest activation, the strongest customer relationships, and the most product insight per session.",
      howItWorks:
        "On signup, the user is offered (or required) to book a 30-minute call with the founder. The call walks them through setup, configuration, and the first meaningful action. The founder learns the customer's context in real time and adjusts the product roadmap based on the patterns.",
      bestFor:
        "Indie SaaS at 0-100 customers. Products at $50+/month price points where the founder time is justifiable. Founders who want to do customer development as part of onboarding (most should).",
      worstFor:
        "Scale-stage SaaS (100+ customers/month). Lower-priced products where the math does not work. Founders genuinely time-constrained on calls.",
      activationMetric:
        "Activation rate among concierge-onboarded users vs self-serve users. Almost always 2-3x higher for concierge. The decision to scale away from concierge is about cost, not activation.",
      implementationSteps: [
        "Add a calendar link on the post-signup page. Cal.com or similar.",
        "Make the call optional but visibly offered. Forcing the call drives some users away who would have self-served fine.",
        "Develop a call agenda: 5 min context, 15 min setup, 10 min Q&A. Keep it tight.",
        "Take notes during every call. The patterns across calls shape the product more than any other data source.",
        "Retire concierge gradually as you cross 50-100 customers. Move to async support + recorded onboarding videos.",
      ],
      commonMistakes: [
        "Treating concierge calls as sales calls. The user has already paid; the call is for setup and learning.",
        "Skipping notes. The patterns the founder absorbs over 50 concierge calls are the most valuable founder asset; without notes, the patterns leak.",
        "Continuing concierge past 100 customers without a transition plan. The founder burns out.",
      ],
      variations: [
        "Async concierge — Loom video walkthrough personalized to the customer's signup answers.",
        "Hybrid concierge — call optional but available; recorded onboarding video as the default.",
      ],
      faqs: [
        {
          q: "Should I require the concierge call?",
          a: "Make it strongly offered, not required. Required-call models filter out qualified users who would have self-served. Strongly-offered models let the users who want the help opt in.",
        },
      ],
      lastVerified: "2026-05-19",
    },
    {
      slug: "trial-to-paid-onboarding",
      patternName: "Trial-to-paid onboarding",
      displayName: "Trial-to-paid onboarding pattern",
      metaTitle: "Trial-to-Paid Onboarding Pattern (SaaS)",
      metaDescription:
        "How trial-to-paid onboarding works, when it fits, the activation milestones, and the in-trial communications that drive conversion.",
      intro:
        "Trial-to-paid onboarding is the structured 7-30 day path that takes a free-trial user to paying customer. Combines product onboarding with conversion-driving touches (email, in-product, demo). The trial period IS the onboarding period; the conversion at trial-end is the metric.",
      howItWorks:
        "User starts trial. Day-0 welcome email + in-product setup. Days 1-3 activation push (in-product checklist, contextual tooltips). Days 4-10 value demonstration (use-case-specific emails, feature highlights). Days 10-14 conversion push (price reminder, social proof, founder check-in). Trial ends with auto-conversion or expiry.",
      bestFor:
        "SaaS with clear time-to-value within 7-14 days. Products where trial users can self-serve to activation. B2B SaaS at $50-$500/month where trial-to-paid is the dominant acquisition path.",
      worstFor:
        "Products that require complex setup over 30+ days. Products where the value is realized in month 2-3 (longer than a typical trial). Solo-user products where the trial does not produce the necessary 'aha' fast enough.",
      activationMetric:
        "Trial-to-paid conversion rate at 60 days. Use 60 days because some conversions happen post-trial-expiry. Pair with activation rate at day 3 — early activation predicts trial-to-paid 2-3x more reliably than late.",
      implementationSteps: [
        "Define 'activated trial user' specifically. Often 3+ feature uses or one meaningful workflow completion in week 1.",
        "Build the email sequence: day 0 welcome, day 1 first-action, day 3 use-case highlight, day 7 mid-trial check-in, day 12 price/conversion, day 14 last-chance.",
        "Layer in-product nudges. Show conversion-relevant messaging when the user is engaged, not just when they're inactive.",
        "Track activation by day. Users who do not activate by day 3 rarely convert; intervene with founder outreach or product help.",
        "Auto-convert at trial end with clear notification — surprises produce refunds.",
      ],
      commonMistakes: [
        "Generic trial-end reminder emails. Personalized emails based on what the user actually did in trial convert 2-3x better.",
        "No price visibility during trial. Users hit the conversion point with no expectation set; the surprise drives abandonment.",
        "Treating trial users like paying customers operationally. Trials have higher support cost per dollar of eventual revenue; design accordingly.",
      ],
      variations: [
        "Reverse-trial — start paid, downgrade to free tier at trial end if user has not committed.",
        "Self-extending trial — extends if user hits specific activation milestones, indicating they will likely convert.",
      ],
      faqs: [
        {
          q: "Should I require credit card for the trial?",
          a: "Depends on price point. At $50+/month, credit-card-required trials produce qualified prospects with higher conversion. At sub-$50/month, no-card trials produce larger volume; conversion rate per visitor is similar.",
        },
      ],
      lastVerified: "2026-05-19",
    },
    {
      slug: "empty-state-onboarding",
      patternName: "Empty-state-as-onboarding",
      displayName: "Empty-state-as-onboarding pattern",
      metaTitle: "Empty-State Onboarding Pattern (SaaS)",
      metaDescription:
        "How empty-state-as-onboarding works, why it is the most-overlooked onboarding pattern, and what good empty-state design looks like.",
      intro:
        "Empty-state-as-onboarding is the under-rated pattern of making each empty state in the product its own onboarding moment. Instead of one big walkthrough, every empty list, empty dashboard, empty feature shows a contextual prompt explaining what would go there and how to get started.",
      howItWorks:
        "Every empty state in the product is designed as a mini-onboarding. Empty customer list shows 'add your first customer' + 'import from CSV' + 'connect Stripe to auto-pull'. Empty dashboard shows 'connect your first data source' + sample preview. The user is always one step away from a useful action.",
      bestFor:
        "Products with multiple distinct features that users explore at their own pace. Products with strong just-in-time onboarding. Replaces the linear walkthrough for products where users have multiple legitimate first-paths.",
      worstFor:
        "Products with one single 'happy path' that every user must take. Products where the empty states are too numerous to design carefully (each one needs care).",
      activationMetric:
        "Empty-state interaction rate. Track which empty states drive first-actions and which are dead-ends. Dead-end empty states are the redesign target.",
      implementationSteps: [
        "Audit every empty state in the product. List them.",
        "For each, decide: what action would the user want to take here? What is the obstacle?",
        "Add a CTA-shaped empty state with the relevant action, plus a 1-2 sentence explanation.",
        "Where possible, offer multiple paths to populate the empty state (manual, import, auto-detect).",
        "Track interaction with each empty state. The metric tells you which empty states are doing onboarding work and which are silent.",
      ],
      commonMistakes: [
        "Empty states with no action. 'No customers yet' — true but useless. Always provide a next step.",
        "Generic empty-state illustrations without context. The empty state is real-estate for onboarding; do not waste it.",
        "Forgetting that empty states are also re-onboarding for returning users. After a quiet period, the empty state should remind, not just inform.",
      ],
      variations: [
        "Sample-data empty state — the empty state pre-populates with sample data on demand.",
        "Tutorial empty state — empty state is a small tutorial that ends with the user's first real action.",
      ],
      faqs: [
        {
          q: "How is empty-state-as-onboarding different from just-in-time?",
          a: "Empty-state is location-specific (this empty space); just-in-time is feature-specific (when user reaches feature X). They are complementary patterns and often combined.",
        },
      ],
      lastVerified: "2026-05-19",
    },
  ];

export const ONBOARDING_PATTERN_SLUGS: ReadonlyArray<string> =
  ONBOARDING_PATTERN_ENTRIES.map((e) => e.slug);

export function getOnboardingPatternBySlug(
  slug: string,
): OnboardingPatternEntry | undefined {
  return ONBOARDING_PATTERN_ENTRIES.find((e) => e.slug === slug);
}
