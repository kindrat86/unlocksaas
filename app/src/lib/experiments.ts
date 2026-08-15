/**
 * /experiment/[slug] pSEO catalog — SaaS experiment recipes.
 *
 * Each entry covers ONE specific experiment indie SaaS founders run
 * (pricing test, headline test, CTA copy test, onboarding email test,
 * trial-length test, etc.) with the hypothesis structure, the variant
 * design, the success metric, the sample-size honesty, and the analysis.
 *
 * Distinct from:
 *   - /benchmarks (directional ranges)
 *   - /why-isnt-my (diagnostics)
 *   - /checklist (verification, not experiments)
 *
 * /experiment is the "I want to test X — how do I do it without
 * fooling myself" surface.
 *
 * Schema: HowTo (the experiment steps) + Article + FAQPage +
 * BreadcrumbList.
 *
 * Brunson Hard-Rule:
 *   - Honest sample-size discipline. Indie SaaS rarely has the volume
 *     for "real" A/B tests; the experiments named here acknowledge
 *     that and adjust accordingly.
 *   - Hypothesis structure named explicitly. Tests without a
 *     hypothesis are confirmation bias in numbered form.
 *   - Build-time guard enforces /benchmarks slug cross-references.
 */

import { BENCHMARK_SLUGS } from "./benchmarks";

export type ExperimentArea =
  | "pricing"
  | "headline"
  | "cta"
  | "onboarding"
  | "email"
  | "checkout"
  | "trial"
  | "social-proof";

export interface ExperimentStep {
  title: string;
  description: string;
}

export interface ExperimentFaq {
  q: string;
  a: string;
}

export interface ExperimentEntry {
  slug: string;
  /** Short experiment label. */
  experimentName: string;
  /** Full display name. */
  displayName: string;
  metaTitle: string;
  metaDescription: string;
  /** Area of the funnel the experiment touches. */
  area: ExperimentArea;
  /** 2-3 sentence intro. */
  intro: string;
  /** The structural hypothesis template. */
  hypothesisTemplate: string;
  /** Honest description of what to vary between control and variant. */
  variantDesign: string;
  /** The single metric the experiment is decided on. */
  primaryMetric: string;
  /** Secondary metrics worth watching but not for the decision. */
  secondaryMetrics: ReadonlyArray<string>;
  /** Minimum sample size band (visitors / signups / customers). */
  minimumSampleSize: string;
  /** Typical duration band. */
  durationBand: string;
  /** Step-by-step procedure. */
  steps: ReadonlyArray<ExperimentStep>;
  /** Common ways indie SaaS founders fool themselves with this experiment. */
  selfDeceptions: ReadonlyArray<string>;
  /** What success looks like, specifically. */
  successProfile: string;
  /** Benchmark slug for the relevant metric range, if applicable. */
  relatedBenchmarkSlug?: string;
  faqs: ReadonlyArray<ExperimentFaq>;
  lastVerified: string;
}

export const EXPERIMENT_ENTRIES: ReadonlyArray<ExperimentEntry> = [
  {
    slug: "saas-headline-test",
    experimentName: "Above-the-fold headline test",
    displayName: "Experiment: above-the-fold headline test",
    metaTitle: "How to A/B Test SaaS Headlines (Indie SaaS Experiment)",
    metaDescription:
      "How indie SaaS founders honestly test landing-page headlines without fooling themselves on small samples. Hypothesis, sample size, primary metric.",
    area: "headline",
    intro:
      "The headline test is the most over-run and least-honestly-analyzed indie SaaS experiment. Founders test headlines on 200 visitors and call it a result; the math says they need 2,000+ per variant for statistical reliability. The experiment below names what to test, when the test is honest, and the sample-size discipline most founders skip.",
    hypothesisTemplate:
      "Changing the headline from [CURRENT] to [VARIANT] will increase [PRIMARY METRIC] by at least [EXPECTED LIFT] because [SPECIFIC REASON tied to Wrong Person / Weak Offer / Weak Belief diagnosis].",
    variantDesign:
      "Single change: only the H1 sentence. Keep sub-hook, CTA, trust block, and all other page elements identical. Two-variable changes muddle attribution.",
    primaryMetric:
      "Click-through to checkout or signup. Click-rate is more sample-efficient than conversion-to-paid; conversion-to-paid requires 5-10x the sample size.",
    secondaryMetrics: [
      "Scroll-depth past the fold (does the new headline keep readers reading?).",
      "Bounce rate (does the new headline drive visitors away faster?).",
      "Time-on-page (proxy for engagement at the top).",
    ],
    minimumSampleSize:
      "1,000 visitors per variant for a 50%+ relative lift detection. 2,000+ for 25% lift. 5,000+ for 10% lift. Most indie SaaS sites cannot run honest headline tests below 1,000 visits per variant.",
    durationBand:
      "7-21 days minimum, even at adequate traffic. Day-of-week effects matter; 7 days is the floor.",
    steps: [
      {
        title: "Write the hypothesis explicitly",
        description:
          "Using the template above. If you cannot complete it, you do not have an experiment — you have a guess.",
      },
      {
        title: "Set traffic split with an honest tool",
        description:
          "PostHog, GrowthBook, or a server-side split. Cookie-only client-side splits leak across sessions and produce noisy data.",
      },
      {
        title: "Run for full week-cycles",
        description:
          "Day-of-week effects are real. End the test at the same day-of-week boundary you started — never mid-week.",
      },
      {
        title: "Refuse to peek at results before the duration ends",
        description:
          "Peeking shifts your mental model and biases the analysis. Pre-commit to the duration; check at the end.",
      },
      {
        title: "Run a chi-square or two-proportion test",
        description:
          "Eyeballing 'this looks better' is confirmation bias in numbered form. Use a real statistical test or a calculator (evanmiller.org/ab-testing/sample-size.html).",
      },
      {
        title: "Decide and ship",
        description:
          "If the variant wins reliably, ship the variant and start the next experiment. If the variant loses, keep the control. If the result is inconclusive (within noise), the experiment was insufficient — usually small sample size.",
      },
    ],
    selfDeceptions: [
      "Calling a 200-visitor test 'a result'. At that volume, the noise dominates the signal.",
      "Testing two changes at once (headline + sub-hook). Muddles attribution; cannot tell which moved the metric.",
      "Stopping the test early because the variant 'looks better'. Early stopping inflates winner detection by 30-50%.",
      "Treating peak-traffic days as representative. Weekday-weekend mix matters.",
      "Confirming a hypothesis-shaped expectation. The honest test is whether the variant DOES better, not whether it COULD be argued to.",
    ],
    successProfile:
      "A variant that wins by 25%+ on click-through with 1,000+ visitors per side, statistically significant at p<0.05. Replicable on a fresh cohort if you re-run.",
    relatedBenchmarkSlug: "landing-page-conversion-rate",
    faqs: [
      {
        q: "What if I don't have 1,000 visitors per variant?",
        a: "Then you cannot run an honest A/B test on headlines. The right move at lower volume is qualitative testing: show both headlines to 10-20 people in your target audience, ask which they would click and why. Qualitative beats noisy quantitative at small scale.",
      },
      {
        q: "Can I test headlines on different traffic sources separately?",
        a: "Yes, and you should be aware sources behave differently. Twitter traffic, Google organic, and direct-link traffic respond differently to the same headline. Pool only if the sources behave similarly historically.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "pricing-test",
    experimentName: "Pricing test",
    displayName: "Experiment: pricing test",
    metaTitle: "How to A/B Test SaaS Pricing (Indie Experiment)",
    metaDescription:
      "How indie SaaS founders honestly test pricing without burning trust. The grandfathering rule, sample size, and how to read the result.",
    area: "pricing",
    intro:
      "Pricing tests are the highest-stakes indie SaaS experiment. The variants are public and visible; the test changes real customer relationships. The framework below names the only honest way to test pricing on indie SaaS scale: grandfathered for existing customers, fresh prospects on the variant, and an exit criterion most founders skip.",
    hypothesisTemplate:
      "Changing the price from $[CURRENT] to $[VARIANT] will [INCREASE / DECREASE / MAINTAIN] revenue per visitor by at least [EXPECTED LIFT] because [SPECIFIC REASON].",
    variantDesign:
      "Existing customers grandfathered at current price (always). New visitors split into control ($CURRENT) and variant ($VARIANT). No mid-test pricing changes. No discounting either side to 'help' the variant.",
    primaryMetric:
      "Revenue per visitor, not conversion rate. A lower conversion rate at a higher price can still produce more revenue per visitor; the only honest metric is dollars per visitor.",
    secondaryMetrics: [
      "Conversion-to-paid rate (for diagnostic, not decision).",
      "Average order value (especially if testing tiered pricing).",
      "Refund rate per cohort (price-sensitive cohorts churn faster).",
    ],
    minimumSampleSize:
      "200+ paying customers per variant for a 25%+ revenue-per-visitor lift detection. Below this, the math is too noisy. Indie SaaS below 500 customers should rarely run pricing tests; qualitative + price-anchor research is more honest.",
    durationBand:
      "30-90 days minimum. Shorter tests miss the price-anchor settling effect; longer tests start to confound with cohort drift.",
    steps: [
      {
        title: "Lock in the grandfathering rule",
        description:
          "Existing customers stay at current price forever (or for X months — be specific). Document this publicly so the test does not feel like a bait-and-switch.",
      },
      {
        title: "Set up the split at the checkout step, not the marketing page",
        description:
          "Marketing-page tests measure conversion through several steps; checkout-step tests isolate the price effect. Use a server-side split keyed to a stable user identifier.",
      },
      {
        title: "Track revenue per visitor, by variant",
        description:
          "Sum total revenue from variant cohort over the test window, divided by visitor count to that variant. This is the only decision metric.",
      },
      {
        title: "Run for full week-cycles, 30+ days minimum",
        description:
          "Pricing tests have longer settling times than headline tests. Day-of-week effects matter; first-week novelty matters; second-week settling matters.",
      },
      {
        title: "Decide at 30 days; recheck at 60 and 90",
        description:
          "Price-sensitive cohorts can churn in months 2-3. The 30-day decision is provisional; the 90-day decision is final.",
      },
      {
        title: "Roll out or roll back",
        description:
          "Winning variant becomes the new price for new customers. Existing customers stay grandfathered indefinitely or until the next pricing event. Losing variant is rolled back; document the learning.",
      },
    ],
    selfDeceptions: [
      "Testing pricing without grandfathering. Burns trust with existing customers; even if the test 'wins', the brand cost outweighs the revenue.",
      "Reading 14-day pricing results as final. Pricing tests need 30+ days; pricing churn shows up in months 2-3.",
      "Confusing conversion rate with revenue. A pricing test that produces 50% the conversion at 3x the price wins on revenue per visitor.",
      "Testing pricing on warm-traffic referrals. Existing customer referrals have anchoring effects; test on cold traffic only.",
    ],
    successProfile:
      "Variant produces 20%+ higher revenue per visitor over 30+ days, sustained at 60 and 90 days, with refund rate within 1pp of the control.",
    relatedBenchmarkSlug: "annual-vs-monthly-discount",
    faqs: [
      {
        q: "Should I tell prospects the test is happening?",
        a: "No, but document the pricing-change policy publicly so any prospect who reads it knows the rule. 'Existing customers grandfathered when prices change' is the policy that legitimizes testing.",
      },
      {
        q: "What if my pricing test reveals existing customers are underpaying?",
        a: "Keep them grandfathered. The lifetime-value of grandfathered customers usually exceeds the short-term revenue from a price-bump churn cycle.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "cta-copy-test",
    experimentName: "CTA copy test",
    displayName: "Experiment: CTA copy test",
    metaTitle: "How to A/B Test SaaS CTA Copy (Indie Experiment)",
    metaDescription:
      "How indie SaaS founders test CTA button copy honestly. The hypothesis structure, the four variant patterns to try, and the sample-size discipline.",
    area: "cta",
    intro:
      "CTA copy tests are the lowest-stakes, highest-signal-per-effort indie SaaS experiment. Small change, isolated effect, and the result usually transfers across pages. The framework below names what to test, what NOT to test in the same experiment, and the patterns most likely to produce lift.",
    hypothesisTemplate:
      "Changing the CTA button copy from [CURRENT] to [VARIANT] will increase click-through-to-next-step by at least [EXPECTED LIFT] because [SPECIFIC REASON].",
    variantDesign:
      "Only the button copy changes. Same button position, same color, same surrounding context. Test ONE phrasing change per experiment.",
    primaryMetric:
      "Click-through rate (clicks / visitors who saw the button).",
    secondaryMetrics: [
      "Conversion-to-next-step (did the click eventually convert?).",
      "Time-to-click (proxy for buyer hesitation).",
    ],
    minimumSampleSize:
      "500-1,000 visitors per variant for a 25%+ lift detection on click-rate.",
    durationBand: "7-14 days minimum at adequate traffic.",
    steps: [
      {
        title: "List the candidate variants",
        description:
          "Four to test against control: (1) outcome verb (Send your first email), (2) free path (Try a free 50-form), (3) outcome + time (Get bookings in 5 min), (4) value (See the 60-day refund). Pick one to test first.",
      },
      {
        title: "Test ONE variant at a time",
        description:
          "Multivariate CTA tests at indie SaaS scale produce noise. Sequential single-variant tests produce signal.",
      },
      {
        title: "Run for a full week-cycle",
        description:
          "Same day-of-week boundary at start and end. 7 days is the floor; 14 days is better for the lower-volume sites.",
      },
      {
        title: "Decide and roll the winner across the site",
        description:
          "CTA-copy winners usually generalize. Apply the winning pattern to other CTAs on the site before running the next experiment.",
      },
    ],
    selfDeceptions: [
      "Testing 4 variants at once. Even at 1,000 visitors per variant, that is 4,000 total; you do not have it.",
      "Calling a 15% lift 'a result' on 200 visitors. The noise floor is higher than the lift.",
      "Confusing 'looks better' with 'tested better'. A/B testing exists exactly because intuition fails on CTAs.",
    ],
    successProfile:
      "Variant wins by 20%+ on click-rate over 500+ visitors per side, statistically significant.",
    relatedBenchmarkSlug: "landing-page-conversion-rate",
    faqs: [
      {
        q: "Do CTA-copy wins transfer across pages?",
        a: "Usually yes, especially the outcome-verb pattern. Pattern wins more often than specific phrasings; once the pattern proves itself, apply it across the site.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "trial-length-test",
    experimentName: "Trial-length test",
    displayName: "Experiment: trial-length test",
    metaTitle: "How to Test SaaS Trial Length (Indie Experiment)",
    metaDescription:
      "How indie SaaS founders test 7-day vs 14-day vs 30-day trial length without fooling themselves. The metric to measure, the sample size, and the failure modes.",
    area: "trial",
    intro:
      "Trial-length tests are operationally complex but high-signal. The 7-day vs 14-day vs 30-day decision changes activation timing, support load, and conversion math. The framework below isolates the variable and names the only honest metric: trial-to-paid conversion at 60 days, not 14.",
    hypothesisTemplate:
      "Changing trial length from [CURRENT] days to [VARIANT] days will [INCREASE / MAINTAIN / DECREASE] trial-to-paid conversion by at least [EXPECTED LIFT] because [SPECIFIC REASON].",
    variantDesign:
      "Only the trial length changes. Same onboarding emails, same in-product nudges (adjusted to fit the new timeline). New signups split between control and variant.",
    primaryMetric:
      "Trial-to-paid conversion rate measured at 60 days post-signup. Not at trial end; at 60 days. Some conversions happen post-trial-expiry.",
    secondaryMetrics: [
      "Time-to-activation (does longer trial delay or accelerate activation?).",
      "Support-ticket volume per trial user (longer trials = higher support).",
      "Cancel rate within the trial (early signal of fit).",
    ],
    minimumSampleSize:
      "300+ trial signups per variant for a 25%+ conversion-rate lift detection. Below 300, qualitative beats quantitative.",
    durationBand:
      "60+ days from test start, since the primary metric is 60-day conversion. Cannot be rushed.",
    steps: [
      {
        title: "Decide on the variant lengths",
        description:
          "Most useful comparisons: 7-day vs 14-day, 14-day vs 30-day. Skipping intermediate steps (7 vs 30) produces wide effects that are hard to attribute.",
      },
      {
        title: "Adjust onboarding emails to fit the variant timeline",
        description:
          "A 7-day onboarding sequence does not work for a 30-day trial; the cadence must change. Document the adjustments so you can replicate.",
      },
      {
        title: "Track each cohort through 60 days",
        description:
          "Conversion at trial-end is the half-story. The full story includes conversions in the 2-4 weeks after trial expiry.",
      },
      {
        title: "Compare 60-day conversion rates",
        description:
          "If variant produces higher 60-day conversion, ship it. If lower, keep control. If within noise, the test was inconclusive.",
      },
      {
        title: "Watch support-load economics",
        description:
          "Longer trials = more support per trial user. A 14-day trial that converts at 12% with low support might beat a 30-day at 14% with double support load.",
      },
    ],
    selfDeceptions: [
      "Reading trial-end conversion as final. Some users convert after expiry; only 60-day numbers capture the full effect.",
      "Ignoring support cost. A higher-converting variant that doubles support load may have worse unit economics.",
      "Running on too small a sample. Trial-length tests require real cohort sizes; sub-100 per variant is noise.",
    ],
    successProfile:
      "Variant produces 20%+ higher 60-day conversion AND comparable support load. Or maintains conversion while reducing support load.",
    relatedBenchmarkSlug: "trial-to-paid-conversion",
    faqs: [
      {
        q: "Should I default to 7-day, 14-day, or 30-day trials?",
        a: "Depends on time-to-value. Products where users hit the 'aha' moment in under 60 minutes do well on 7-day trials. Products requiring data setup, integrations, or workflow change benefit from 14-30 days.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "onboarding-email-test",
    experimentName: "Onboarding email sequence test",
    displayName: "Experiment: onboarding email sequence test",
    metaTitle: "How to Test SaaS Onboarding Email Sequences",
    metaDescription:
      "How indie SaaS founders test onboarding email sequences without fooling themselves. The variant design, the activation metric, and the failure modes.",
    area: "email",
    intro:
      "Onboarding email tests are high-leverage because activation is the leading indicator of retention. The framework below isolates the email sequence as the variable, names activation as the primary metric, and provides the sample-size honesty most founders skip.",
    hypothesisTemplate:
      "Changing the onboarding email sequence from [CURRENT] to [VARIANT] will increase activation rate at day 7 by at least [EXPECTED LIFT] because [SPECIFIC REASON].",
    variantDesign:
      "Only the email sequence changes. Number of emails, timing, content, or all three — but document exactly what changes. Same in-product UI, same nudges, same dashboard.",
    primaryMetric:
      "Activation rate at day 7 (or whatever day matches your product's natural activation point). Activation = the specific action that correlates with paid conversion.",
    secondaryMetrics: [
      "Email open rate (proxy for engagement).",
      "Trial-to-paid conversion (downstream effect).",
      "Time-to-first-value (does the new sequence accelerate?).",
    ],
    minimumSampleSize:
      "300+ trial signups per variant for a 25%+ lift detection on activation.",
    durationBand:
      "30-60 days from test start. Activation rates at day 7 require waiting 7 days per cohort plus measurement window.",
    steps: [
      {
        title: "Define activation specifically",
        description:
          "What specific in-product action correlates with paid conversion? '3+ feature uses in week 1', 'first integration connected', 'first invitation sent'. This is the leading indicator.",
      },
      {
        title: "Draft the variant sequence with a specific hypothesis",
        description:
          "What is different in the variant — fewer emails, more emails, different content, different timing? Document the hypothesis behind each change.",
      },
      {
        title: "Split new signups at the queue level",
        description:
          "Server-side split keyed to user ID. Email-service-side splits (Mailchimp, Customer.io) work too if they reliably persist the assignment.",
      },
      {
        title: "Measure activation at day 7",
        description:
          "Cohort by signup date, not by experiment date. Day-7 activation for the variant cohort.",
      },
      {
        title: "Watch downstream conversion at day 60",
        description:
          "Activation that does not produce paid conversion is misleading. Check that the variant's activation lift actually flows through.",
      },
    ],
    selfDeceptions: [
      "Using open rates as the success metric. Opens are vanity; activation is the leading indicator.",
      "Stopping at day 7 conversion. Day-60 paid conversion is the real downstream test.",
      "Testing multiple email changes at once. Hard to attribute later.",
    ],
    successProfile:
      "Variant produces 25%+ higher activation at day 7 AND maintains or improves day-60 paid conversion.",
    relatedBenchmarkSlug: "email-open-rate",
    faqs: [
      {
        q: "Should I test number-of-emails or content-of-emails first?",
        a: "Content first. Most under-converting sequences have content problems, not volume problems. Test volume after content is right.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "checkout-friction-test",
    experimentName: "Checkout friction test",
    displayName: "Experiment: checkout friction test",
    metaTitle: "How to Test SaaS Checkout Friction (Indie Experiment)",
    metaDescription:
      "How indie SaaS founders test checkout-page friction (field count, payment options) honestly. The variant design and the metric to measure.",
    area: "checkout",
    intro:
      "Checkout friction tests usually win in the friction-removal direction — removing optional fields, adding one-tap payment methods, simplifying the form. The framework below names the specific changes worth testing and the sample-size discipline.",
    hypothesisTemplate:
      "Removing/adding [SPECIFIC FRICTION ELEMENT] from the checkout will increase checkout-completion rate by at least [EXPECTED LIFT] because [SPECIFIC REASON].",
    variantDesign:
      "ONE change per test: remove a field, add a one-tap pay option, change a button label. Multi-variable changes muddle attribution.",
    primaryMetric:
      "Checkout completion rate (paid orders / checkout starts).",
    secondaryMetrics: [
      "Time-to-completion (faster = less friction).",
      "Field-level abandonment (which step drives the loss?).",
    ],
    minimumSampleSize:
      "300+ checkout starts per variant for a 20%+ lift detection.",
    durationBand: "14-30 days minimum at adequate traffic.",
    steps: [
      {
        title: "Audit the current checkout for friction candidates",
        description:
          "Optional fields, mandatory fields with low downstream value (phone number?), missing one-tap pay options. Make the list before testing.",
      },
      {
        title: "Pick the highest-suspected-friction element",
        description:
          "Test the one most likely to move the needle first. Phone number removal often produces lift; payment method addition often produces lift.",
      },
      {
        title: "Split new checkout sessions, not pageviews",
        description:
          "Session-level splits ensure each visitor sees one variant consistently across the flow.",
      },
      {
        title: "Track abandonment by step",
        description:
          "Which step lost the visitor? The variant should reduce abandonment at the specific step you changed.",
      },
      {
        title: "Decide based on completion rate",
        description:
          "Higher completion = ship. Equal = keep simpler variant. Lower = unexpected; investigate before reverting.",
      },
    ],
    selfDeceptions: [
      "Removing a field that produced useful downstream data without measuring the downstream loss.",
      "Testing 3 changes at once. Indie SaaS volume rarely supports multi-variant attribution.",
      "Treating cart-recovery email lift as part of the checkout test result. Cart recovery is a separate funnel step.",
    ],
    successProfile:
      "Variant lifts checkout completion 15%+ AND does not measurably hurt any downstream metric (support load, refund rate, average order value).",
    relatedBenchmarkSlug: "checkout-completion-rate",
    faqs: [
      {
        q: "Should I remove the email field?",
        a: "No. Email is the channel that produces post-purchase value (receipt, support, follow-up). Removing it costs more than it saves.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "social-proof-test",
    experimentName: "Social proof placement test",
    displayName: "Experiment: social proof placement test",
    metaTitle: "How to Test Social Proof Placement on SaaS Pages",
    metaDescription:
      "How indie SaaS founders test where testimonials and trust badges should sit. The placements worth testing and the sample-size discipline.",
    area: "social-proof",
    intro:
      "Social proof tests usually compare placement, not content. Where the testimonial sits, what shape the trust block takes, whether the customer logos appear above or below the offer — these change conversion at the margin. The framework below names the placements worth testing.",
    hypothesisTemplate:
      "Moving the [SOCIAL PROOF ELEMENT] from [CURRENT POSITION] to [VARIANT POSITION] will increase conversion-to-next-step by at least [EXPECTED LIFT] because [SPECIFIC REASON].",
    variantDesign:
      "Same content (same testimonials, same logos, same numbers). Only the placement or visual treatment changes.",
    primaryMetric:
      "Conversion to next step (signup, checkout, demo booking).",
    secondaryMetrics: [
      "Scroll depth (does the new placement keep readers scrolling?).",
      "Time-on-page.",
    ],
    minimumSampleSize:
      "1,000+ visitors per variant for 25% lift detection.",
    durationBand: "14-21 days minimum.",
    steps: [
      {
        title: "Audit current social proof placements",
        description:
          "Above-the-fold (high prominence, low context), mid-page (context built first), pre-CTA (closer to decision), post-CTA (reinforcement). Decide what moves where.",
      },
      {
        title: "Document the change and the rationale",
        description:
          "Hypothesis-driven: why would moving this proof element here lift conversion? The reason shapes the next test.",
      },
      {
        title: "Run for a full week-cycle minimum",
        description:
          "Day-of-week effects matter; weekend traffic responds to social proof differently than weekday.",
      },
      {
        title: "Decide based on next-step conversion",
        description:
          "Scroll depth and time-on-page are secondary; conversion is the decision metric.",
      },
    ],
    selfDeceptions: [
      "Testing testimonial content along with placement. Two changes; cannot attribute.",
      "Calling a 2-week test 'a result' on 200 visitors per variant. Noise.",
      "Treating one testimonial's effect as the whole social-proof block's effect.",
    ],
    successProfile:
      "Variant lifts conversion 20%+ on 1,000+ visitors per side, statistically significant.",
    relatedBenchmarkSlug: "landing-page-conversion-rate",
    faqs: [
      {
        q: "Should I A/B test individual testimonials?",
        a: "Rarely. Indie SaaS volume rarely supports per-testimonial significance. Test placement first; content second only at high traffic.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "annual-vs-monthly-discount-test",
    experimentName: "Annual-vs-monthly discount test",
    displayName: "Experiment: annual-vs-monthly discount test",
    metaTitle: "How to Test Annual SaaS Discount Levels (Indie)",
    metaDescription:
      "How indie SaaS founders test the discount level for annual plans honestly. The 10% vs 17% vs 20% question, the metric to measure.",
    area: "pricing",
    intro:
      "The annual-discount test is the most common indie SaaS pricing experiment after price-point itself. The right discount is product-specific; the wrong one either trains customers to wait or fails to lift LTV. The framework below names what to measure and how to read the noise.",
    hypothesisTemplate:
      "Changing the annual discount from [CURRENT %] to [VARIANT %] will [INCREASE / MAINTAIN] revenue per visitor by at least [EXPECTED LIFT] because [SPECIFIC REASON].",
    variantDesign:
      "Only the annual-tier discount changes. Same monthly price; same product; same pricing-page layout.",
    primaryMetric:
      "Revenue per visitor over 90 days. Annual plans pay-upfront, which inflates the short-term metric; the 90-day window normalizes.",
    secondaryMetrics: [
      "Annual vs monthly mix (how does the discount shift the cohort split?).",
      "Refund rate (higher discounts often correlate with higher refund risk).",
      "Year-2 renewal rate (the real LTV question).",
    ],
    minimumSampleSize:
      "200+ paying customers per variant. Annual decisions are higher-stakes; sample sizes need to be larger than monthly tests.",
    durationBand:
      "60-90 days minimum. Annual-to-renewal effects are 12 months out; the in-test window is the initial-conversion measurement.",
    steps: [
      {
        title: "Document the current annual discount and rationale",
        description:
          "Most indie SaaS default to 16-17% (two months free). What is the current rationale? Is it a real measured choice or a copy of the SaaS-norm?",
      },
      {
        title: "Pick the variant",
        description:
          "Common tests: 10% (more lift on monthly value, lower friction) vs 20% (stronger annual draw, real cash impact). 25%+ tends to train customers to wait for the annual.",
      },
      {
        title: "Split at the pricing-page level",
        description:
          "Server-side split keyed to a stable identifier. Different visitors see different annual prices.",
      },
      {
        title: "Measure mix shift AND revenue per visitor",
        description:
          "A higher discount usually shifts mix toward annual without lifting per-visitor revenue. Mix without revenue is not a win.",
      },
      {
        title: "Check refund rate per cohort",
        description:
          "Discount-attracted annual customers can refund earlier. Refund rate at 30, 60, 90 days for each cohort.",
      },
    ],
    selfDeceptions: [
      "Reading short-term cash-spike from annual conversions as a 'win'. Pay-upfront inflates short-term revenue; the real test is per-visitor revenue normalized.",
      "Ignoring refund-rate differences. Discount-attracted cohorts often refund more.",
      "Skipping the renewal-rate check. The whole point of annual is the locked-in year; if renewal drops, the discount cost was not worth it.",
    ],
    successProfile:
      "Variant produces 15%+ higher revenue per visitor over 90 days, refund rate within 1pp of control, and (12 months later) renewal rate within 5pp.",
    relatedBenchmarkSlug: "annual-vs-monthly-discount",
    faqs: [
      {
        q: "Is 'no annual plan' a valid choice?",
        a: "Yes. Many indie SaaS at sub-$100/month price points do better without annual. The annual-vs-monthly decision is product-specific; default to no-annual until you have data that says otherwise.",
      },
    ],
    lastVerified: "2026-05-19",
  },
];

export const EXPERIMENT_SLUGS: ReadonlyArray<string> = EXPERIMENT_ENTRIES.map(
  (e) => e.slug,
);

export function getExperimentBySlug(
  slug: string,
): ExperimentEntry | undefined {
  return EXPERIMENT_ENTRIES.find((e) => e.slug === slug);
}

export const EXPERIMENT_AREAS = [
  "pricing",
  "headline",
  "cta",
  "onboarding",
  "email",
  "checkout",
  "trial",
  "social-proof",
] as const;

export const EXPERIMENT_AREA_LABELS: Record<ExperimentArea, string> = {
  pricing: "Pricing",
  headline: "Headlines",
  cta: "CTAs",
  onboarding: "Onboarding",
  email: "Email",
  checkout: "Checkout",
  trial: "Trial mechanics",
  "social-proof": "Social proof",
};

// Build-time guard: every relatedBenchmarkSlug must resolve.
{
  const known = new Set<string>(BENCHMARK_SLUGS);
  for (const entry of EXPERIMENT_ENTRIES) {
    if (entry.relatedBenchmarkSlug && !known.has(entry.relatedBenchmarkSlug)) {
      throw new Error(
        `experiments.ts: entry "${entry.slug}" references unknown benchmark slug "${entry.relatedBenchmarkSlug}".`,
      );
    }
  }
}
