/**
 * /swipe-file/[element] pSEO catalog – copy and UI pattern libraries
 * for the twenty highest-search-intent funnel elements an indie SaaS
 * founder is actively trying to write or rebuild post-launch.
 *
 * Each entry is a single funnel element (hero headline, CTA button,
 * pricing table, etc.) with 10-15 named pattern examples. Patterns
 * are formula + concrete example + a short note on why the pattern
 * works, anchored in Russell Brunson's Hook / Story / Offer lens.
 *
 * Brunson Hard-Rule reconciliation:
 *   - No invented metrics on the examples. The "why it works" notes
 *     reference structural mechanics (specificity, contrast, time-
 *     to-value) rather than fabricated conversion rates.
 *   - Quoted-style examples are illustrative templates synthesized
 *     from the public patterns named in src/lib/funnel-teardowns.ts;
 *     they are NOT verbatim quotes from named competitor pages.
 *   - Each entry ends at /diagnostic so founders test the swipe
 *     against their actual page rather than copy-paste in the dark.
 */

export interface SwipeFileExample {
  /** Short pattern name (Title Case), e.g. "Specificity + Outcome". */
  pattern: string;
  /** The reusable formula template using <angle-bracket> placeholders. */
  formula: string;
  /** A concrete instantiation a founder could ship today. */
  example: string;
  /** One-line note on the structural mechanic that makes it work. */
  notes: string;
}

export interface SwipeFileEntry {
  /** URL slug, kebab-case. */
  slug: string;
  /** The funnel element name in lowercase, e.g. "hero headline". */
  element: string;
  /** Plural form for headings, e.g. "Hero headlines". */
  elementPlural: string;
  /** Display name (Title Case) used in the page H1 and OG card. */
  displayName: string;
  /** SEO meta title, under 60 chars. */
  metaTitle: string;
  /** SEO meta description, under 160 chars. */
  metaDescription: string;
  /** TL;DR: what this element is responsible for, ~40 words. */
  tldr: string;
  /** When the element is the bottleneck worth working on. */
  whenToUse: string;
  /** When the element is NOT the constraint and you should look elsewhere. */
  whenNotToUse: string;
  /** Named pattern examples – 10 to 15 per entry. */
  examples: ReadonlyArray<SwipeFileExample>;
  /** Common implementation mistakes founders make on this element. */
  commonMistakes: ReadonlyArray<string>;
  /** Three FAQs in AEO format. */
  faqs: ReadonlyArray<{ q: string; a: string }>;
  /** Related glossary slugs for the cross-link block. */
  relatedGlossary: ReadonlyArray<string>;
  /** Which Brunson lens this element belongs to (Hook / Story / Offer). */
  brunsonLens: "Hook" | "Story" | "Offer" | "Story + Offer" | "Hook + Offer";
  /** ISO date last verified. */
  lastVerified: string;
}

const LAST_VERIFIED = "2026-05-21";

export const SWIPE_FILE_ENTRIES: ReadonlyArray<SwipeFileEntry> = [
  // ---------------------------------------------------------------------
  // 1. Hero headline
  // ---------------------------------------------------------------------
  {
    slug: "hero-headline",
    element: "hero headline",
    elementPlural: "Hero headlines",
    displayName: "Hero Headline Swipe File",
    metaTitle: "Hero Headline Swipe File (12 SaaS Patterns + Formulas)",
    metaDescription:
      "Twelve hero headline patterns indie SaaS founders can swipe: specificity + outcome, contrarian, two-step, and more. Brunson Hook lens.",
    tldr:
      "The hero headline carries the entire Hook job: in one sentence it tells a specific cohort what specific outcome they get. Indie SaaS founders lose more conversions on this single line than on the rest of the page combined, because a vague hero forces the visitor to do the cohort-matching work.",
    whenToUse:
      "When time-on-page is under 15 seconds and bounce rate is over 75 percent. When the live headline could plausibly describe three different products. When founders read it out loud and can't finish the sentence 'this is for ___'.",
    whenNotToUse:
      "When the bottleneck is checkout (price shock, payment friction). When traffic is already converting but volume is too low – fix the channel first. When the founder is rewriting weekly without testing – the headline is fine, the operator is the problem.",
    examples: [
      {
        pattern: "Specificity + Outcome",
        formula: "<Specific cohort> get <specific outcome> in <specific time> without <objection>.",
        example:
          "Post-launch SaaS founders get their first 10 paying customers in 30 days without paid ads.",
        notes:
          "Names cohort, outcome, time, and the objection in one breath. The visitor self-qualifies on the cohort word.",
      },
      {
        pattern: "Contrarian",
        formula: "Stop <thing the audience is doing>. <Better thing> instead.",
        example: "Stop rewriting your landing page. Fix the 90-second diagnostic underneath it.",
        notes:
          "Pattern-interrupt: the audience expects validation, gets contradiction. Earns the next 6 seconds of attention.",
      },
      {
        pattern: "Two-Step (Pain + Promise)",
        formula: "<Pain statement>. <Specific promise that resolves it>.",
        example:
          "Your traffic isn't the problem. The diagnostic that tells you what is – in 90 seconds.",
        notes:
          "Names the pain in the language the audience uses for themselves, then offers the resolution.",
      },
      {
        pattern: "Outcome + Mechanism",
        formula: "<Outcome> using <named mechanism>.",
        example: "Find your funnel's broken step using Russell Brunson's Hook / Story / Offer.",
        notes:
          "Pairs the outcome with a credibility-borrowed mechanism, so the promise sounds like a method, not a wish.",
      },
      {
        pattern: "Question Headline",
        formula: "Why is <observed effect> happening?",
        example: "Why does your launch traffic spike and then go flat for 6 weeks?",
        notes:
          "Earns the click by naming the observed effect the founder is privately searching for an explanation to.",
      },
      {
        pattern: "Number + Cohort + Outcome",
        formula: "The <N>-step <category> for <cohort> who want <outcome>.",
        example: "The 4-step launch playbook for indie SaaS founders who want repeat revenue.",
        notes:
          "Numbers shrink perceived effort. Cohort word does the qualifying. Category word avoids 'magic'.",
      },
      {
        pattern: "Before / After",
        formula: "Go from <starting state> to <ending state> in <time>.",
        example: "Go from launch-day spike to compounding monthly revenue in 90 days.",
        notes:
          "Movement framing. Names the current state without insulting it, names the destination concretely.",
      },
      {
        pattern: "Job-To-Be-Done",
        formula: "<Tool / system> for <specific job> when you <constraint>.",
        example: "A 90-second launch diagnostic for founders who can't afford a 6-week brand sprint.",
        notes:
          "The job is the unit of search intent. Naming it back to the founder is the cheapest match.",
      },
      {
        pattern: "Negative Promise",
        formula: "Never <unwanted state> again.",
        example: "Never ship another launch you can't explain the post-launch flatline of.",
        notes:
          "Loss-aversion variant. Heavier than the positive version, but burns out fast – use sparingly.",
      },
      {
        pattern: "Stack Reveal",
        formula: "The <stack item 1>, <stack item 2>, and <stack item 3> that get you <outcome>.",
        example:
          "The diagnostic, the offer, and the email sequence that get post-launch founders their first 10 buyers.",
        notes:
          "Replaces a feature list with a curated stack. The reader infers completeness without reading further.",
      },
      {
        pattern: "Time-Boxed Mini-Outcome",
        formula: "In <short time> you'll <concrete one-step outcome>.",
        example: "In 90 seconds you'll know if your page has a Wrong Person, Weak Offer, or Weak Belief problem.",
        notes:
          "Promises a single deliverable in a single sitting. Lowers the activation friction visibly.",
      },
      {
        pattern: "Anti-Vague",
        formula: "Not <vague thing the category usually promises>. <Concrete unit of value>.",
        example: "Not another generic launch course. A 90-second diagnostic on the page you already shipped.",
        notes:
          "Frames against the category's default and substitutes a measurable unit. Reads as honest, which is rare in this category.",
      },
    ],
    commonMistakes: [
      "Writing the headline for the founder, not the visitor. The founder knows the cohort word; the visitor only knows their own job-to-be-done.",
      "Naming the product before naming the outcome. Visitors don't care what the thing is until they know what it does.",
      "Using three adjectives where one specific number would do. 'Faster, simpler, smarter' loses to '90 seconds'.",
      "Burying the cohort word in a sub-bullet. The cohort word belongs in the H1, not the H3.",
      "Testing headlines without keeping the rest of the hero fixed. A/B noise becomes signal only when the rest of the page is identical.",
    ],
    faqs: [
      {
        q: "How many words should a SaaS hero headline be?",
        a: "10 to 16 words is the workable range. Under 8 forces vagueness; over 18 stops scanning. The constraint is one breath, one cohort word, one outcome word.",
      },
      {
        q: "Should I A/B test hero headlines on low traffic?",
        a: "No. Under 1,000 weekly visits, you don't have enough resolution. Rewrite based on diagnostic feedback (which cohort word is the visitor actually searching) and re-publish – treat the live page as a single read each week.",
      },
      {
        q: "What's the difference between a hero headline and a hook?",
        a: "The headline is the visual unit. The hook is the conceptual job that headline + subhead + image together perform: stopping the qualified visitor's scroll long enough to start the story.",
      },
    ],
    relatedGlossary: ["hook"],
    brunsonLens: "Hook",
    lastVerified: LAST_VERIFIED,
  },

  // ---------------------------------------------------------------------
  // 2. Hero subhead
  // ---------------------------------------------------------------------
  {
    slug: "hero-subhead",
    element: "hero subhead",
    elementPlural: "Hero subheads",
    displayName: "Hero Subhead Swipe File",
    metaTitle: "Hero Subhead Swipe File (12 SaaS Patterns That Buy Attention)",
    metaDescription:
      "Twelve hero subhead patterns that buy the next 6 seconds of attention after the headline. Indie SaaS Hook-lens swipe file.",
    tldr:
      "The subhead's only job is to buy the next 6 seconds of attention by adding the specifics the headline implied. It elaborates on the cohort, the outcome, or the mechanism – never all three. Treating it as a second headline is the most common waste of the hero block.",
    whenToUse:
      "When the headline tested well but scroll depth still craters in the first 200px. When session recordings show visitors reading the headline, pausing, and bouncing without scrolling past the fold.",
    whenNotToUse:
      "When the subhead is doing the headline's job because the headline is broken. Fix the headline first; the subhead is a multiplier, not a replacement.",
    examples: [
      {
        pattern: "Cohort Elaboration",
        formula: "Specifically: <2-3 cohort qualifiers>. <2-3 cohorts who shouldn't read further>.",
        example:
          "Specifically: founders post-launch, pre-product-market-fit, with a Stripe account that's blinked once. Not for pre-launch dreamers or post-PMF operators.",
        notes:
          "Self-disqualification builds trust. Naming who shouldn't read makes the cohort word in the headline mean more.",
      },
      {
        pattern: "Mechanism Reveal",
        formula: "Using <named framework> to <specific job> in <specific time>.",
        example:
          "Using Russell Brunson's Hook / Story / Offer to label your live page's broken step in 90 seconds.",
        notes:
          "Names the method without explaining it. The visitor either recognizes the framework (credibility) or doesn't (curiosity).",
      },
      {
        pattern: "Constraint Statement",
        formula: "<Concrete constraint>. <Implied trade-off>.",
        example: "No ads, no agency, no rewriting the whole page. Just the one step that's actually broken.",
        notes:
          "Constraints earn belief because they're specific in a way puffery cannot be.",
      },
      {
        pattern: "Outcome Cascade",
        formula: "First <small outcome>, then <medium outcome>, then <big outcome>.",
        example:
          "First: a labeled diagnosis. Then: the rewrite that fixes it. Then: 10 paying customers in 30 days.",
        notes:
          "Resolves the 'too good to be true' problem by showing the sequence of wins instead of one fat promise.",
      },
      {
        pattern: "Proof Anchor",
        formula: "Based on <named proof>: <one-line proof description>.",
        example:
          "Based on Russell Brunson's Hook / Story / Offer framework, applied to 1,000+ indie SaaS landing pages.",
        notes:
          "Borrowed credibility from a named source. Avoids the 'trust us' problem.",
      },
      {
        pattern: "Time-Bounded Process",
        formula: "<Action verb> in <time>. <Action verb> in <time>. <Outcome>.",
        example:
          "Diagnose in 90 seconds. Rewrite in one sitting. Recover the first 10 paying customers in 30 days.",
        notes:
          "Verbs + times. Reads as a process, not a promise. Founders trust processes more than promises.",
      },
      {
        pattern: "Cost Reframe",
        formula: "For the price of <comparable expense>.",
        example:
          "For the price of one of your already-failed Facebook ad tests.",
        notes:
          "Anchors against a cost the audience has already paid without thinking. Pricing then feels small.",
      },
      {
        pattern: "Negative Promise",
        formula: "Without <unwanted thing the audience expects>.",
        example:
          "Without rewriting the whole page, without a 6-week brand sprint, without firing your designer.",
        notes:
          "Three negations together compress the objection list into one line. Use the audience's exact objection words.",
      },
      {
        pattern: "Quantified Outcome",
        formula: "<Number> <unit> in <time>, from <starting state>.",
        example: "10 paying customers in 30 days, from a flat post-launch Stripe line.",
        notes:
          "Numbers + units beat adjectives. Naming the starting state makes the destination credible.",
      },
      {
        pattern: "Single-Question Reframe",
        formula: "The one question: <specific question the headline implies>.",
        example: "The one question: which of your three real funnel steps is actually broken?",
        notes:
          "Compresses the page's value into a single question the visitor can't stop asking themselves.",
      },
      {
        pattern: "Outcome + Audience Filter",
        formula: "If you're <specific audience>, this is <outcome>. If you're not, here's where to go.",
        example:
          "If you're post-launch, pre-revenue, here's your 90-second diagnostic. If you're not, /alternatives-to walks you somewhere honest.",
        notes:
          "Self-disqualification + helpful redirect = trust signal. Most founders won't do it; you should.",
      },
      {
        pattern: "Negation Stack",
        formula: "Not <thing 1>. Not <thing 2>. Just <real thing>.",
        example: "Not a course. Not an agency. Just the 90-second diagnostic on the page you already shipped.",
        notes:
          "Negations land harder than affirmations because they cost the seller something.",
      },
    ],
    commonMistakes: [
      "Repeating the headline in different words. The subhead must add a new specific, not restate the existing one.",
      "Three adjectives stacked together. 'Simple, fast, effective' adds zero new information.",
      "Subhead longer than the headline. The subhead should be 1.2 to 1.5x the headline length, not 3x.",
      "Subhead written for the founder's mom. The cohort word in the headline disappears in the subhead, breaking the qualifier chain.",
    ],
    faqs: [
      {
        q: "Should the subhead be longer or shorter than the headline?",
        a: "Slightly longer. The headline is the visual unit (10-16 words); the subhead adds 1.2 to 1.5x that to land the specifics. Going 3x longer breaks the hero rhythm.",
      },
      {
        q: "Can I skip the subhead?",
        a: "Only if your headline is doing two jobs (cohort + outcome + time). Most aren't, so the subhead is doing the load-bearing work of qualifying the cohort or naming the mechanism.",
      },
      {
        q: "Should the subhead repeat the cohort word from the headline?",
        a: "Yes, at least once. The cohort word is the qualifier the visitor uses to self-select. Dropping it in the subhead breaks the qualification chain and forces the visitor to re-scan upward.",
      },
    ],
    relatedGlossary: ["hook"],
    brunsonLens: "Hook",
    lastVerified: LAST_VERIFIED,
  },

  // ---------------------------------------------------------------------
  // 3. CTA button copy
  // ---------------------------------------------------------------------
  {
    slug: "cta-button-copy",
    element: "CTA button",
    elementPlural: "CTA buttons",
    displayName: "CTA Button Copy Swipe File",
    metaTitle: "CTA Button Copy Swipe File (12 Tested Patterns)",
    metaDescription:
      "Twelve CTA button copy patterns indie SaaS founders can swipe. Outcome-first, friction-killers, and the rules for primary vs secondary buttons.",
    tldr:
      "A CTA button isn't a label, it's a one-word completion of the visitor's mental sentence. The button copy that wins names the next state the visitor enters when they click, not the action they perform on the page.",
    whenToUse:
      "When click-through on the primary CTA is under 5 percent on a hero block that's otherwise reading well. When 'Get Started' / 'Sign Up' / 'Learn More' is doing zero qualification work.",
    whenNotToUse:
      "When the issue is upstream: the headline didn't qualify, so no button copy can recover it. When the form below the button is the actual friction (length, fields requested).",
    examples: [
      {
        pattern: "Outcome-First",
        formula: "<Verb> <specific outcome>",
        example: "Get my diagnosis",
        notes:
          "Names the result, not the action. The visitor reads it as 'and then I have my diagnosis', which mentally moves them forward.",
      },
      {
        pattern: "First-Person Possessive",
        formula: "<Action> my <thing>",
        example: "Show me my broken step",
        notes:
          "'My' triggers ownership-bias. The visitor is no longer evaluating, they're claiming.",
      },
      {
        pattern: "Time-Bounded Promise",
        formula: "<Outcome> in <time>",
        example: "Diagnose in 90 seconds",
        notes:
          "The time-box reduces perceived friction. Pairs especially well with diagnostic and assessment CTAs.",
      },
      {
        pattern: "Price-as-Reassurance",
        formula: "<Action> for $<price>",
        example: "Unlock for $1",
        notes:
          "Pricing on the button removes the 'wait, is this free?' hesitation. Use for $1 tripwires and free assets.",
      },
      {
        pattern: "Negation Promise",
        formula: "<Outcome> without <objection>",
        example: "Diagnose without signing up",
        notes:
          "Defeats the most common objection inside the button copy itself. Buyers click harder when the friction is pre-named.",
      },
      {
        pattern: "Conversational Yes",
        formula: "Yes, <one-line claim of what they want>",
        example: "Yes, diagnose my live page",
        notes:
          "Borrowed from VSL sales pages. Frames the click as agreement with a self-evident desire.",
      },
      {
        pattern: "Mechanism Tease",
        formula: "<Action> using <named framework>",
        example: "Run the Hook / Story / Offer check",
        notes:
          "For audiences who already recognize the framework. Earns clicks through credibility, not curiosity.",
      },
      {
        pattern: "Action + Receipt",
        formula: "<Action> + send me <delivery format>",
        example: "Diagnose + email me the rewrite",
        notes:
          "Pre-commits the visitor to the next two steps. Higher activation rate downstream.",
      },
      {
        pattern: "Free Specific",
        formula: "Free <noun, not adjective>",
        example: "Free 90-second diagnostic",
        notes:
          "'Free' alone is suspect; 'free X' is concrete. The noun does the work, not the adjective.",
      },
      {
        pattern: "Self-Qualifying",
        formula: "I'm <cohort>, <action>",
        example: "I'm post-launch, diagnose me",
        notes:
          "Forces self-identification on the click. Audience that clicks is more qualified, which improves downstream metrics.",
      },
      {
        pattern: "Permission Frame",
        formula: "Show me <thing>",
        example: "Show me what's broken",
        notes:
          "Soft entry. Frames the click as a look, not a commit. Good for early-funnel CTAs.",
      },
      {
        pattern: "Pre-Result Claim",
        formula: "<Verb> my <claimed result>",
        example: "Claim my diagnosis",
        notes:
          "'Claim' is high-conviction. Pairs with limited-time or limited-spots framing without screaming it.",
      },
    ],
    commonMistakes: [
      "Using 'Submit' on a CTA. The visitor isn't submitting; they're starting a process. Name the process.",
      "Same copy on the primary and secondary CTA. The secondary should name the alternative path explicitly.",
      "Long button copy that wraps to two lines on mobile. 1-4 words on mobile, 5-6 words max on desktop.",
      "CTA copy that's a noun phrase instead of a verb phrase. 'Diagnostic' is a label; 'Get my diagnostic' is a verb.",
      "Treating the button as the headline. The button copy should complete the sentence the headline started, not restate the value proposition.",
    ],
    faqs: [
      {
        q: "Should CTA buttons say 'Get Started' or something specific?",
        a: "Something specific, always. 'Get Started' wins generic A/B benchmarks because the alternatives in those tests were also generic. Once you put a specific outcome verb on the button, the lift is structural.",
      },
      {
        q: "How long should CTA button copy be?",
        a: "1-4 words on mobile, 5-6 words on desktop. Anything longer wraps awkwardly and loses the unit-of-action feeling.",
      },
      {
        q: "Should the CTA repeat words from the headline?",
        a: "One key word, yes. The cohort word or the outcome word should appear in both, so the button reads as completing the headline's promise.",
      },
    ],
    relatedGlossary: ["hook", "tripwire"],
    brunsonLens: "Hook + Offer",
    lastVerified: LAST_VERIFIED,
  },

  // ---------------------------------------------------------------------
  // 4. Pricing table
  // ---------------------------------------------------------------------
  {
    slug: "pricing-table",
    element: "pricing table",
    elementPlural: "Pricing tables",
    displayName: "Pricing Table Swipe File",
    metaTitle: "Pricing Table Swipe File (12 SaaS Layouts That Convert)",
    metaDescription:
      "Twelve indie SaaS pricing table patterns: anchor-decoy, single-column, tiered-by-outcome, and the rules for which tier to pre-highlight.",
    tldr:
      "A pricing table sells the middle option by setting up the high and low options around it. The job isn't to list plans; it's to make one obvious choice obviously correct. Founders who treat it as a feature matrix lose buyers to analysis paralysis.",
    whenToUse:
      "When traffic reaches /pricing but conversion stalls. When founders have three tiers but the same plan converts at roughly the same rate as the cheapest one, indicating the table failed to anchor.",
    whenNotToUse:
      "When the offer isn't clear yet. A pricing table is downstream of a clear offer; rebuilding the table without fixing the offer is rearranging deck chairs.",
    examples: [
      {
        pattern: "Anchor-Decoy-Target",
        formula: "<Decoy: too cheap>, <Target: best value>, <Anchor: high>",
        example:
          "Starter $1 / Core $49 (highlighted) / Concierge $499. Core is highlighted; Concierge anchors the value.",
        notes:
          "The high anchor makes the middle feel reasonable. The low decoy frames the middle as 'real product'.",
      },
      {
        pattern: "Two-Column Outcome",
        formula: "<Solo plan> vs <Team plan>",
        example:
          "Founder plan ($49/mo) vs Small Team plan ($149/mo). Two columns, outcome-named, no feature matrix.",
        notes:
          "Two clear cohorts beat three muddled tiers. Naming the cohort on the column header does the qualifying.",
      },
      {
        pattern: "Single Column + Stack",
        formula: "<Plan> – everything included, full stack listed",
        example:
          "One plan, $49/month. Includes: diagnostic, playbook, weekly office hours. Total value: $497, paid as $49/month.",
        notes:
          "When the offer is good, simplicity beats choice. The stack does the value-justification.",
      },
      {
        pattern: "Tripwire + Core",
        formula: "<Tripwire: $1-$27> + <Core: $49+>",
        example:
          "Diagnostic $1 (one-time) + Playbook $49/month. Tripwire seeds the buyer relationship.",
        notes:
          "Splits the conversion: the visitor commits at $1, then upgrades. Avoids the binary signup-or-leave choice.",
      },
      {
        pattern: "Monthly / Annual Toggle",
        formula: "<Monthly> / <Annual at 17% discount>",
        example:
          "$49/month or $490/year (2 months free). Toggle defaults to annual.",
        notes:
          "The discount frames annual as the smart choice. Default to annual to bias toward higher LTV.",
      },
      {
        pattern: "Per-Seat with Floor",
        formula: "$<price> per seat, minimum <N> seats",
        example:
          "$15 per seat per month, minimum 3 seats. Bills $45 base.",
        notes:
          "Floor protects unit economics on small teams. Per-seat scales with the customer's win.",
      },
      {
        pattern: "Usage-Based with Free Tier",
        formula: "Free up to <threshold>, then $<price> per <unit>",
        example:
          "Free up to 100 diagnostics/month, then $0.10 per additional diagnostic.",
        notes:
          "Activation is free, monetization scales with usage. Threshold should be high enough for real validation.",
      },
      {
        pattern: "Outcome-Tier Naming",
        formula: "<Outcome 1 name> / <Outcome 2 name> / <Outcome 3 name>",
        example:
          "Validate / Launch / Scale. Each tier is named by the outcome it delivers, not by the user type.",
        notes:
          "Outcome-named tiers earn higher upgrade rates. Buyers move 'when I'm ready to launch', not 'when I'm a Pro user'.",
      },
      {
        pattern: "Highlight + Tag",
        formula: "<Middle tier> with 'Most popular' or 'Best value' tag",
        example:
          "Three tiers, middle one has 'Most popular' badge and a colored border.",
        notes:
          "Social-proof signal without proof. Use only if it's actually the most popular tier; lying here is a trust kill.",
      },
      {
        pattern: "Trial + Money-Back",
        formula: "<Plan price> with <14-day free trial OR 60-day money-back>",
        example:
          "$49/month with a 60-day money-back guarantee. No trial, just refund if you don't ship.",
        notes:
          "Money-back beats trials for SaaS where activation takes weeks. Avoids the trial-period-ending churn cliff.",
      },
      {
        pattern: "Capacity-Based",
        formula: "<Plan> – up to <N> <unit>",
        example:
          "Starter: up to 1,000 monthly diagnostics. Pro: up to 10,000. Scale: unlimited.",
        notes:
          "Clear delineation, no feature-checkmark matrix. Upgrade trigger is hitting the cap, which is observable.",
      },
      {
        pattern: "Founder-Discount Bridge",
        formula: "Public price <$> / Founder price <$> (early-stage discount)",
        example:
          "Public $99/month. Founders price: $49/month for life if you sign up before [date].",
        notes:
          "Cohort-specific pricing builds an identity tier. Works for the first 100-1000 buyers; retire the bridge after.",
      },
    ],
    commonMistakes: [
      "Five tiers when three would work. Each extra column drops conversion by adding decision load.",
      "Highlighting the most expensive tier as 'most popular' when it isn't. Trust kill if a buyer asks support.",
      "Feature checkmarks without grouping. Visitors need to scan checkmark patterns; group features into 3-5 outcome groups.",
      "Annual savings expressed in dollars rather than months free. '$98 off' lands softer than '2 months free'.",
      "Pricing only in dollars when 60 percent of buyers are international. Use a currency switcher or show local price via Geo-IP.",
    ],
    faqs: [
      {
        q: "Should I show pricing publicly or behind a 'contact us' button?",
        a: "Show it publicly for any plan under $1,000/month. Hidden pricing under that threshold signals 'too small for us' and costs more in lost trust than it gains in qualified leads.",
      },
      {
        q: "How many pricing tiers is too many?",
        a: "Three is the working maximum for self-serve SaaS. Four or more multiplies decision load without adding qualified buyers. If you need a fourth tier, it belongs in a separate 'Enterprise' surface.",
      },
      {
        q: "Should the annual discount default to 'on' in the toggle?",
        a: "Yes for SaaS aiming at higher LTV. The annual default frames it as the normal choice. Buyers who specifically want monthly will still find the toggle.",
      },
    ],
    relatedGlossary: ["value-ladder", "oto"],
    brunsonLens: "Offer",
    lastVerified: LAST_VERIFIED,
  },

  // ---------------------------------------------------------------------
  // 5. Testimonial block
  // ---------------------------------------------------------------------
  {
    slug: "testimonial-block",
    element: "testimonial block",
    elementPlural: "Testimonial blocks",
    displayName: "Testimonial Block Swipe File",
    metaTitle: "Testimonial Block Swipe File (12 Patterns That Earn Belief)",
    metaDescription:
      "Twelve testimonial block patterns indie SaaS founders can use to convert proof into belief. Before/after, specific-result, video-first, and more.",
    tldr:
      "A testimonial earns belief only when it carries specifics the visitor can't fake into their own situation. Generic 'great product!' quotes are visual noise. The patterns below force specificity – named outcome, named time, named cohort match.",
    whenToUse:
      "When visitors reach the testimonial block but don't scroll past it. When session recordings show 3-second pauses on the block followed by an exit. When trust is the bottleneck, not clarity.",
    whenNotToUse:
      "When the offer itself is unclear. Testimonials cannot rescue a confused offer; they can only amplify a clear one.",
    examples: [
      {
        pattern: "Before / After / Span",
        formula:
          "'Before <state>, I was <pain>. After <span>, <quantified result>.' – <Name, role>",
        example:
          "'Before the diagnostic, I was rewriting my hero weekly. After 30 days, I shipped one rewrite and got 8 paying customers.' – Jamie, founder of [SaaS]",
        notes:
          "Three time anchors (before, after, span) force a specific story. Generic quotes can't survive this shape.",
      },
      {
        pattern: "Specific Number, Specific Time",
        formula: "'<Number> in <time>, from <starting state>.' – <Name>",
        example:
          "'10 paying customers in 30 days, from a 6-week flat Stripe line.' – Maria, indie SaaS founder",
        notes:
          "Number + time + starting state. Hard to fabricate, easy to identify with.",
      },
      {
        pattern: "Named Objection Reversed",
        formula:
          "'I thought <objection>, but <what actually happened>.' – <Name>",
        example:
          "'I thought another framework would just add noise. Two weeks in, it was the only one that named what was actually broken.' – Sam, founder",
        notes:
          "Objection-reversal testimonials handle the doubt the visitor is bringing into the page.",
      },
      {
        pattern: "Video Thumbnail + Pull Quote",
        formula: "<Embedded 30-90s video> + <single-sentence pull quote>",
        example:
          "[60-second video] – 'It diagnosed in 90 seconds what I'd been guessing at for 4 months.'",
        notes:
          "Video earns more belief; the pull quote earns the click on the video. Both together compound.",
      },
      {
        pattern: "Cohort-Match Quote",
        formula: "'<Quote naming the visitor's exact cohort>' – <Name, matching cohort>",
        example:
          "'I'm a post-launch SaaS founder with 6 weeks of flat revenue. The diagnostic labeled my problem in 90 seconds.' – [Name], indie SaaS founder",
        notes:
          "When the testifier matches the visitor's cohort word, the quote becomes a mirror, not an ad.",
      },
      {
        pattern: "Result Card",
        formula:
          "Big number / metric, then one-line context, then attribution.",
        example:
          "10x reply rate on the cold email. Within 14 days of the rewrite. – Alex, indie SaaS founder",
        notes:
          "Treats the testimonial as a data point. Scannable, repeatable across multiple testimonials.",
      },
      {
        pattern: "Counter-Intuitive Result",
        formula:
          "'I expected <usual result>, but instead <surprising specific result>.' – <Name>",
        example:
          "'I expected better conversion. What I got was learning my whole cohort was wrong.' – Priya, founder",
        notes:
          "Counter-intuitive results signal real outcomes (because nobody fabricates a surprise).",
      },
      {
        pattern: "Stack Comparison",
        formula:
          "'Tried <thing 1>, <thing 2>, <thing 3>. <This> was the one that worked.' – <Name>",
        example:
          "'Tried a paid course, an agency consult, and three landing-page rewrites. The 90-second diagnostic was the only one that named the actual problem.' – Carlos, founder",
        notes:
          "Lists what the testifier tried first. Reads as an honest filter, not an endorsement.",
      },
      {
        pattern: "Quote + Avatar + LinkedIn Link",
        formula: "<Quote> + <photo> + <full name, role, verifiable link>",
        example:
          "'The diagnostic was the rewrite brief I didn't know I was missing.' – Real Name, Founder of [Real Company], [LinkedIn URL]",
        notes:
          "Verifiability is the single largest belief lift. Linked profiles raise the marginal belief on every testimonial on the page.",
      },
      {
        pattern: "Long-Form Case Study Hook",
        formula:
          "<Pull quote> + 'Read the full story →' link to a case study",
        example:
          "'From flat post-launch to $4k MRR in 90 days.' Read the full story →",
        notes:
          "Pull quote on the page; full case study lives at /stories/[slug]. Long-form proof for buyers who need it; respect for those who don't.",
      },
      {
        pattern: "Founder Endorsement",
        formula:
          "'<Quote>' – <Recognizable name>, <Recognizable company>",
        example:
          "'The cleanest take on Hook / Story / Offer for indie SaaS I've read.' – [Founder name], [Recognizable indie SaaS]",
        notes:
          "Borrowed credibility from one named founder beats five anonymous quotes.",
      },
      {
        pattern: "Public Thread Screenshot",
        formula: "<Screenshot of a real X / LinkedIn / Discord thread>",
        example:
          "Screenshot of a 30-day-later founder X post: 'Spent 30 days on the diagnostic. Best ROI of my launch.'",
        notes:
          "Screenshots are harder to fake than quotes, and link back to the source thread. Pair with a link to the live post.",
      },
    ],
    commonMistakes: [
      "Anonymous testimonials. 'J.S., founder' reads as fabricated. Use real names and roles or don't show the testimonial.",
      "Quotes that praise the founder, not the product. 'They're great to work with' tells the visitor nothing useful.",
      "Five testimonials all saying the same thing. Each testimonial should answer a different objection.",
      "Stock photo avatars. Visitors recognize stock photos and discount the entire block.",
      "Testimonials from a different cohort than the visitor. A B2B SaaS founder testimonial does not earn belief from a creator founder, and vice versa.",
    ],
    faqs: [
      {
        q: "How many testimonials should I show on a landing page?",
        a: "Three to five strong specific ones beat ten generic ones. Each should resolve a different objection (price, cohort fit, time-to-value, time commitment, trust in founder).",
      },
      {
        q: "Should I gate testimonials behind a 'Read more' click?",
        a: "Show the strongest two or three uncollapsed; gate the rest. Visitors who scroll past the top three are signaling deeper evaluation, so the extra clicks aren't a friction tax.",
      },
      {
        q: "Are video testimonials worth the production cost?",
        a: "One 60-90 second authentic video testimonial beats five polished written ones for SaaS over $49/month. Phone-recorded is fine; over-produced reads as a paid ad.",
      },
    ],
    relatedGlossary: ["story", "weak-belief"],
    brunsonLens: "Story",
    lastVerified: LAST_VERIFIED,
  },

  // ---------------------------------------------------------------------
  // 6. Exit-intent popup
  // ---------------------------------------------------------------------
  {
    slug: "exit-intent-popup",
    element: "exit-intent popup",
    elementPlural: "Exit-intent popups",
    displayName: "Exit-Intent Popup Swipe File",
    metaTitle: "Exit-Intent Popup Swipe File (12 Patterns That Don't Annoy)",
    metaDescription:
      "Twelve exit-intent popup patterns that recover leaving traffic without burning trust. Asset-trade, single-question diagnostic, and email-light flows.",
    tldr:
      "An exit-intent popup is a second chance, not a guilt trip. The patterns that recover the highest qualified email rate offer a real asset trade (something the visitor wanted but couldn't find) rather than a generic '10% off'.",
    whenToUse:
      "When session duration is over 60 seconds and exit rate is over 70 percent – meaning the visitor read but didn't act. When the asset you can offer (diagnostic, swipe file, checklist) matches the visitor's job-to-be-done.",
    whenNotToUse:
      "When session duration is under 30 seconds. Short-session bounces aren't recoverable through a popup; the problem is upstream. Also avoid on mobile; mobile exit-intent doesn't fire reliably.",
    examples: [
      {
        pattern: "Asset Trade",
        formula: "'<Specific asset, named>, free, email-only.' + <email field>",
        example: "'The 12-pattern hero headline swipe file. Free, no spam.' + email field",
        notes:
          "Trade the asset the visitor was looking for. Asset name does the qualifying – the wrong audience won't enter their email.",
      },
      {
        pattern: "Single-Question Diagnostic",
        formula: "'<One specific question that the page premise raises>' + <one-click answer buttons>",
        example:
          "'What's most broken on your launch page right now?' [Wrong Person / Weak Offer / Weak Belief / I'm not sure]",
        notes:
          "Zero email cost. The click itself segments the visitor and triggers a tailored follow-up offer.",
      },
      {
        pattern: "Founder Note",
        formula: "<Founder photo> + <2-line personal note> + <single CTA>",
        example:
          "'Hey, founder here. If you bounce, I'll never know what was missing. Tell me what you needed instead.' – Maryan + reply-to email field",
        notes:
          "Lower conversion but high-quality replies. Use when the founder personally reads every reply.",
      },
      {
        pattern: "Negative Confirmation",
        formula: "'<Reverse-psychology question>' + 'Yes / No' buttons",
        example:
          "'Leaving without diagnosing the page you just read about?' [Yes, I'll skip / No, let me diagnose]",
        notes:
          "Pattern-interrupt. Works because it names the contradiction the visitor is making in real time.",
      },
      {
        pattern: "Email + Bonus",
        formula: "'<Asset 1>, plus <bonus asset>' + <email>",
        example:
          "'Free 90-second diagnostic, plus the 30-day rewrite checklist.' + email field",
        notes:
          "Stack bonus framing increases perceived value. Each bonus must be specific (named) or it adds nothing.",
      },
      {
        pattern: "Discount Code Trade",
        formula: "'Save <discount> on <product>, email-only.' + <email>",
        example: "'Save $20 on the $49 playbook. Code emailed.' + email field",
        notes:
          "Lower-quality leads than asset trades, but works for high-intent visitors who price-anchored.",
      },
      {
        pattern: "Cohort Self-Select",
        formula: "'I'm a <cohort 1> / <cohort 2> / <cohort 3>' + cohort-specific follow-up",
        example: "'I'm a [post-launch SaaS founder / pre-launch / running an agency]' → cohort-tailored page",
        notes:
          "Re-routes the leaving visitor to a more specific landing page. Zero email cost, segment captured.",
      },
      {
        pattern: "Calendar Hold",
        formula: "'Book <duration> with the founder' + <calendar embed>",
        example: "'Book a 15-min office hours slot with Maryan.' + Cal.com embed",
        notes:
          "Highest-intent path. Use only when the founder has capacity and the slot lifetime value justifies the time.",
      },
      {
        pattern: "Newsletter Soft Trade",
        formula: "'Get the weekly <named newsletter>.' + <email>",
        example: "'Get the weekly Unlock SaaS dispatch – one diagnostic per week.' + email field",
        notes:
          "Lowest friction. Newsletter framing avoids the 'free thing' arms race and builds long-term audience.",
      },
      {
        pattern: "Scarcity-Adjacent",
        formula: "'<Spots remaining or batch language>' + <email or CTA>",
        example:
          "'12 founder discount slots left this month. Reserve yours.' + email field",
        notes:
          "Use ONLY if the scarcity is real and operator-managed. Fabricated scarcity is a trust kill.",
      },
      {
        pattern: "Two-Step Trade",
        formula:
          "Step 1: ask a single zero-cost question. Step 2: after answer, request email for tailored asset.",
        example:
          "[Q1: Wrong Person / Weak Offer / Weak Belief?] → [Q2: 'Send me the cohort-specific rewrite checklist.' + email]",
        notes:
          "Higher email capture rate because the visitor already paid the smaller commitment cost in step one.",
      },
      {
        pattern: "Honest Goodbye",
        formula: "'<Honest one-liner accepting they're leaving> + one link to a more relevant resource.'",
        example:
          "'If you're pre-launch, this isn't your page yet. Here's /alternatives-to instead.'",
        notes:
          "Zero capture. Earns trust. Brings back the visitor later via the cohort match, not via the popup.",
      },
    ],
    commonMistakes: [
      "Discount-code popups that fire after 5 seconds. Visitors haven't formed enough intent for the popup to feel earned.",
      "Asset names that don't match the page premise. 'Free guide' on a pricing page reads as desperation.",
      "Two-step popups that gate the actual asset behind a second email confirmation. One email per popup, ever.",
      "Mobile exit-intent that fires on scroll. Mobile has no reliable exit signal; either skip the popup or use a non-intrusive bottom banner.",
      "Popups without a clear close button. Buyers who can't close will hit back and never return.",
    ],
    faqs: [
      {
        q: "Do exit-intent popups still work in 2026?",
        a: "Yes, but only when they trade something the visitor actually wanted (a named asset, a tailored diagnosis), not a generic discount. The popup design hasn't changed; the asset bar has.",
      },
      {
        q: "Should I add an exit-intent popup if traffic is low?",
        a: "Below 1,000 weekly visits, the lift is in the noise. Spend the time on the hero block instead – the popup is a downstream amplifier.",
      },
      {
        q: "Will an exit-intent popup hurt my Google rankings?",
        a: "No, as long as it fires after meaningful engagement (over 15-30s session time) and is dismissible. Google penalizes intrusive interstitials that block content, not exit-intent overlays.",
      },
    ],
    relatedGlossary: ["hook", "soap-opera-sequence"],
    brunsonLens: "Hook + Offer",
    lastVerified: LAST_VERIFIED,
  },

  // ---------------------------------------------------------------------
  // 7. Post-purchase upsell (OTO)
  // ---------------------------------------------------------------------
  {
    slug: "post-purchase-upsell",
    element: "post-purchase upsell",
    elementPlural: "Post-purchase upsells",
    displayName: "Post-Purchase Upsell Swipe File",
    metaTitle: "Post-Purchase Upsell Swipe File (12 OTO Patterns)",
    metaDescription:
      "Twelve post-purchase upsell (OTO) patterns indie SaaS founders use to lift order value 20-50% without burning trust. Brunson value-ladder mapped.",
    tldr:
      "A post-purchase upsell (One Time Offer) is the highest-leverage revenue surface in the funnel: the buyer's wallet is out, the friction is at its lowest, and conviction is at its highest. The patterns below earn the upsell without breaking the 'one-time' promise.",
    whenToUse:
      "When you have a $1-$49 entry offer and an obvious next step the buyer probably wants. When average order value is at the entry price and you're leaving money on the table.",
    whenNotToUse:
      "When the buyer is post-trial and not post-purchase. Trial endings need a different mechanic (retention, not OTO). Also avoid when the upsell isn't related to the entry purchase – relevance is the entire game.",
    examples: [
      {
        pattern: "Done-For-You Upgrade",
        formula:
          "'You bought <DIY asset>. Want it done for you for <multiple>?'",
        example:
          "'You bought the $49 playbook. Want me to write your rewrite for you? Add-on: $499 one-time.'",
        notes:
          "DFY is the cleanest OTO. The buyer just self-identified as wanting the outcome; offering the shortcut is honest.",
      },
      {
        pattern: "Single-Click Bundle",
        formula:
          "'Add <related asset> for <small price>. One click.'",
        example:
          "'Add the 30-day email sequence template for $19. Click yes to add to your order.'",
        notes:
          "One-click frictionless add. Use Stripe's saved-payment-method for true one-click.",
      },
      {
        pattern: "Annual Upgrade",
        formula:
          "'Just bought monthly. Switch to annual now for <2 months free>.'",
        example:
          "'You just bought the $49/month playbook. Switch to annual right now for 2 months free ($490 → $390).'",
        notes:
          "Highest LTV move you can make at the exact moment buyer-intent is at its peak.",
      },
      {
        pattern: "Concierge Hour",
        formula:
          "'Add 60 minutes of <founder time> for <one-time fee>.'",
        example:
          "'Add 60 minutes of office hours with Maryan to walk through your diagnosis. Add-on: $199.'",
        notes:
          "High margin, low scale. Works when the founder personally delivers and the buyer is in a hot-to-act state.",
      },
      {
        pattern: "Bundle Discount",
        formula:
          "'Get <product 2> + <product 3> for <bundle price, framed as a saving>.'",
        example:
          "'Add the second and third playbooks together for $79, saving $19 vs buying separately.'",
        notes:
          "Bundle framing for buyers who'd buy the next two anyway. Discount language earns the click.",
      },
      {
        pattern: "Time-Limited OTO",
        formula:
          "'<Asset> for <discount> – available for the next <time> only.'",
        example:
          "'Add the deep-dive playbook for $99 (down from $149) – available for the next 10 minutes on this checkout flow only.'",
        notes:
          "Real scarcity only. If the buyer reloads and the offer is still there, the trust is gone.",
      },
      {
        pattern: "Community Add-On",
        formula:
          "'Add <community access> for <recurring or one-time price>.'",
        example:
          "'Add the founders' Discord for $19/month, cancel anytime.'",
        notes:
          "Recurring revenue from a one-time purchase. Community needs real density to earn the renewal.",
      },
      {
        pattern: "Cohort-Match Bonus",
        formula:
          "'Since you bought <X>, here's <Y, tailored to your cohort>.'",
        example:
          "'Since you bought the SaaS playbook, here's the SaaS-specific email sequence pack for $29.'",
        notes:
          "Personalization based on the buyer's first purchase. Higher conversion than generic OTOs.",
      },
      {
        pattern: "Done-With-You Tier",
        formula:
          "'Upgrade from <DIY> to <DWY> for <difference>.'",
        example:
          "'Upgrade from $49 self-serve to $299 done-with-you, including 4 weekly reviews. Pay $250 now.'",
        notes:
          "Middle tier between DIY and DFY. Captures buyers who want help but balk at full DFY.",
      },
      {
        pattern: "Risk-Reversal OTO",
        formula:
          "'Add <upgrade> with <stronger guarantee>.'",
        example:
          "'Add the deep-dive playbook for $99 with our 'ship-or-refund' guarantee – if you don't ship a rewrite in 30 days, full refund.'",
        notes:
          "Stronger guarantee on the upsell reverses risk. Pairs especially well with high-ticket OTOs.",
      },
      {
        pattern: "Pre-Refund OTO",
        formula:
          "'Within <refund window>, you can also add <X>.'",
        example:
          "'Within your 60-day refund window, you can also add the office hours pass at the buyer price ($149).'",
        notes:
          "Re-engages buyers in their refund window with a sweetener. Bumps activation more than revenue.",
      },
      {
        pattern: "Honest Pass",
        formula:
          "'No upsell here. <Buyer-facing reason>.'",
        example:
          "'No upsell on this page. The playbook works on its own. If you want office hours, you can add them anytime from your dashboard.'",
        notes:
          "Surprising honesty earns long-term LTV via trust. Use when the buyer base is small enough to value relationships over per-transaction revenue.",
      },
    ],
    commonMistakes: [
      "Upsell that contradicts the entry promise. If the entry said 'no upsells, ever', breaking that on the next page is a trust kill that compounds in refund rates.",
      "Hard-to-find decline button. The 'No thanks' link should be visible at the same hierarchy as the 'Add to order' button.",
      "Upsell unrelated to the entry purchase. Relevance is everything; an unrelated OTO converts at 1-2 percent and burns 30 percent of buyers.",
      "Upsell with a longer sales letter than the entry product. The post-purchase moment is short; respect it.",
      "Treating the OTO as the main revenue driver. The entry product needs to be valuable enough to stand alone; OTO is the cherry, not the cake.",
    ],
    faqs: [
      {
        q: "Should every SaaS have a post-purchase upsell?",
        a: "Only if you have a clear, relevant next product or upgrade. Forcing an OTO without a fit produces churn and refund spikes that outweigh the lift.",
      },
      {
        q: "What's a healthy take rate on a post-purchase upsell?",
        a: "15-30 percent for relevant single-click add-ons. Anything under 10 percent means the relevance is off. Anything over 50 percent means the entry price was probably too low.",
      },
      {
        q: "Can I show multiple post-purchase upsells in a row?",
        a: "Yes, up to two – but no more. The second OTO should be a downsell (cheaper alternative) of the first, not a third unrelated product. Three+ in a row reads as a stack-attack and burns trust.",
      },
    ],
    relatedGlossary: ["oto", "value-ladder", "tripwire"],
    brunsonLens: "Offer",
    lastVerified: LAST_VERIFIED,
  },

  // ---------------------------------------------------------------------
  // 8. Social proof bar
  // ---------------------------------------------------------------------
  {
    slug: "social-proof-bar",
    element: "social proof bar",
    elementPlural: "Social proof bars",
    displayName: "Social Proof Bar Swipe File",
    metaTitle: "Social Proof Bar Swipe File (12 Trust Strip Patterns)",
    metaDescription:
      "Twelve social proof bar patterns indie SaaS founders use under the hero. Logo strips, counter strips, founder strips – and the cohort-match rule.",
    tldr:
      "A social proof bar lives directly under the hero block and answers a single question: 'who else trusts this?' The visitor scans it in under 1.5 seconds. Patterns that earn belief in that window are concrete, cohort-matched, and visually quiet.",
    whenToUse:
      "When time-on-page is over 20 seconds but the visitor doesn't scroll to the offer block. When the headline qualifies but trust is the next bottleneck.",
    whenNotToUse:
      "When you don't actually have the proof. Faking a logo strip with companies you don't have a relationship with is a one-strike trust kill.",
    examples: [
      {
        pattern: "Real Logo Strip",
        formula: "'<Customer logo 1>  <logo 2>  <logo 3>  <logo 4>  <logo 5>'",
        example: "Stripe logo, Linear logo, Cal.com logo, Plausible logo, Notion logo, all monochrome",
        notes:
          "Monochrome strip. Real customers only. 5-7 logos at most; more becomes noise.",
      },
      {
        pattern: "Counter Strip",
        formula: "'<Number> <unit> across <category>'",
        example: "'1,000+ indie SaaS landing pages diagnosed'",
        notes:
          "One specific number, one specific category. Avoid 'thousands of customers' – be exact.",
      },
      {
        pattern: "Founder Strip",
        formula: "'Used by founders at <recognizable indie SaaS 1>, <2>, <3>.'",
        example: "'Used by founders at [recognizable indie SaaS names]'",
        notes:
          "Names beat logos when the audience knows the founder, not the company. Common with Twitter-native audiences.",
      },
      {
        pattern: "Rating Strip",
        formula: "'<Star rating> on <verifiable platform>, <N> reviews'",
        example: "'★ 4.9 on G2, 47 reviews'",
        notes:
          "Verifiable rating + verifiable platform. Generic '5-star reviews' without a platform is just text.",
      },
      {
        pattern: "Endorser Strip",
        formula: "'As recommended by <named person>, <role>'",
        example: "'As recommended by [Recognizable founder name], author of [book/newsletter]'",
        notes:
          "Single named endorser beats a wall of testimonials when the endorser matches the audience's reference set.",
      },
      {
        pattern: "Counter + Recency",
        formula: "'<Number> <unit> in the last <time period>'",
        example: "'47 diagnoses run in the last 7 days'",
        notes:
          "Recency makes the proof feel active, not historical. Refresh the number weekly or it becomes stale and loses trust.",
      },
      {
        pattern: "Press Mention Strip",
        formula: "'Featured in <publication 1>, <publication 2>, <publication 3>'",
        example: "'Featured in Indie Hackers, Starter Story, MicroConf'",
        notes:
          "Press names that the audience trusts. Generic 'as seen in' with no audience recognition is decorative noise.",
      },
      {
        pattern: "Used By Cohort",
        formula: "'Used by <cohort 1>, <cohort 2>, <cohort 3>'",
        example: "'Used by post-launch SaaS founders, agency owners, and indie hackers'",
        notes:
          "Cohort-named proof. The visitor self-identifies into the strip without needing to know the names.",
      },
      {
        pattern: "Live Activity Strip",
        formula: "'<N> founders ran the diagnostic in the last <time period>'",
        example: "'12 founders ran the diagnostic in the last hour'",
        notes:
          "Live counter (Geo-IP optional). Use only if it's actually true – fake live numbers are a trust kill within minutes.",
      },
      {
        pattern: "Capability Strip",
        formula: "'<Capability claim 1>  |  <capability claim 2>  |  <capability claim 3>'",
        example: "'90-second diagnosis  |  No-signup required  |  60-day money-back'",
        notes:
          "Not technically proof, but reads as proof when paired with the right visual hierarchy. Use as a fallback when other strips aren't available yet.",
      },
      {
        pattern: "Single Big Logo",
        formula: "'Trusted by <one big logo> + <small text>'",
        example: "'Trusted by [Big Recognizable Company] – read the case study →'",
        notes:
          "Single anchor logo beats five small logos when the anchor is recognizable enough.",
      },
      {
        pattern: "Honest Stage Strip",
        formula: "'<Number of buyers> in <time since launch>. <Honest disclaimer>.'",
        example: "'47 buyers in the first 90 days. Pre-revenue founders welcome.'",
        notes:
          "Honesty about early stage earns belief from other early-stage founders. Stop performing as bigger than you are.",
      },
    ],
    commonMistakes: [
      "Logo strips with companies you don't have a documented relationship with. Lawyer-bait and trust kill.",
      "Faded logos that look like decoration. The strip needs enough visual weight to be processed as proof, not pattern.",
      "More than 7 logos in a single strip. Visitors stop scanning after 5; the rest is noise.",
      "Mixing customer logos with partner logos and integration logos without labeling. Visitors can't tell what 'trusted by' means.",
      "A strip that's older than your latest product pivot. Update it whenever the cohort changes.",
    ],
    faqs: [
      {
        q: "Should the social proof bar be above or below the hero CTA?",
        a: "Below the CTA, in the band immediately under the hero block. Above the CTA pushes the action below the fold; below the CTA lets the visitor anchor the click in trust.",
      },
      {
        q: "What if I don't have customer logos yet?",
        a: "Use a counter strip ('47 founders diagnosed'), a press mention strip if you have any, or skip the social proof bar entirely. An empty strip is worse than no strip.",
      },
      {
        q: "Should I animate the social proof bar?",
        a: "No motion if possible. Marquee animations on the proof bar reduce belief by signaling 'effort to look impressive'. Static, monochrome, well-spaced wins.",
      },
    ],
    relatedGlossary: ["story", "weak-belief"],
    brunsonLens: "Story",
    lastVerified: LAST_VERIFIED,
  },

  // ---------------------------------------------------------------------
  // 9. Money-back guarantee
  // ---------------------------------------------------------------------
  {
    slug: "money-back-guarantee",
    element: "money-back guarantee",
    elementPlural: "Money-back guarantees",
    displayName: "Money-Back Guarantee Swipe File",
    metaTitle: "Money-Back Guarantee Swipe File (12 Patterns That Earn Trust)",
    metaDescription:
      "Twelve money-back guarantee patterns indie SaaS founders use to reverse risk: standard window, ship-or-refund, and double-the-money variants.",
    tldr:
      "A guarantee is risk-reversal language. Its job is to take the buyer's risk and put it on the seller, then say so out loud. The patterns below differ in how aggressive the reversal is – aggressive guarantees raise conversion and refund rate together.",
    whenToUse:
      "When pricing is over $19 and the buyer can't try before buying. When refund rates are under 5 percent (room to be bolder). When trust is the bottleneck, not clarity.",
    whenNotToUse:
      "When refund rates are already over 15 percent. A stronger guarantee at that point compounds the abuse cycle. Fix product fit first.",
    examples: [
      {
        pattern: "Standard 30-Day",
        formula: "'<Length> money-back guarantee. <Refund condition>.'",
        example:
          "'30-day money-back guarantee. Email and we'll refund, no questions asked.'",
        notes:
          "The baseline. Establishes risk-reversal without burning margin in refund abuse.",
      },
      {
        pattern: "60-Day Confident",
        formula: "'<60 days>. <Tied to a behavioral milestone>.'",
        example:
          "'60-day money-back guarantee. If you don't ship a rewrite in 60 days, full refund.'",
        notes:
          "Longer windows pair with behavioral milestones. The buyer self-qualifies on the milestone.",
      },
      {
        pattern: "Ship-Or-Refund",
        formula: "'If you don't <ship the outcome> in <time>, full refund.'",
        example:
          "'If you don't ship a landing page rewrite in 30 days, full refund.'",
        notes:
          "Outcome-tied. Earns highest belief because the seller is naming a specific failure trigger.",
      },
      {
        pattern: "Double-Your-Money",
        formula: "'<Length> double-your-money guarantee. <Condition>.'",
        example:
          "'30-day double-your-money guarantee: if you do the diagnostic + ship a rewrite and don't get one paying customer, we refund 2x.'",
        notes:
          "Aggressive. Use only when you've validated the outcome on 100+ buyers. Burns margin on edge cases but signals deep conviction.",
      },
      {
        pattern: "No-Questions-Asked",
        formula: "'<Length> refund window. No questions asked.'",
        example:
          "'60-day refund window. Reply to any email and we'll refund within 24 hours.'",
        notes:
          "Lowest friction guarantee. Refund rate goes up; buyer remorse goes down; net trust score climbs.",
      },
      {
        pattern: "Trial-Plus-Refund",
        formula: "'<Trial length> trial, then <refund window> after.'",
        example:
          "'14-day free trial. After the trial converts, you still have 30 days to refund.'",
        notes:
          "Stacked safety. Increases conversion at the trial-end cliff; some buyers will refund anyway, so model it.",
      },
      {
        pattern: "Pro-Rated Refund",
        formula: "'Pro-rated refund anytime. Cancel and get back unused months.'",
        example:
          "'Annual buyers can cancel and get a pro-rated refund of unused months at any time.'",
        notes:
          "Used for annual SaaS plans. Lower refund spikes because buyers don't feel locked in.",
      },
      {
        pattern: "Outcome-Tied Refund",
        formula:
          "'If <specific named outcome> doesn't happen in <time>, refund.'",
        example:
          "'If you don't get one paying customer in 90 days, full refund.'",
        notes:
          "Outcome-tied + bold time window. Highest-conviction guarantee shape. Track the metric live.",
      },
      {
        pattern: "Lifetime Guarantee",
        formula: "'Cancel anytime, refund the last month if unused.'",
        example:
          "'Cancel anytime. We'll refund the last billed month if you didn't use it.'",
        notes:
          "Less dramatic but always available. Earns long-term renewal trust on monthly SaaS plans.",
      },
      {
        pattern: "Founder-Signed Guarantee",
        formula: "'<Founder name> personally guarantees: <terms>.'",
        example:
          "'Maryan personally guarantees: 60-day refund, reply directly to him at any time.'",
        notes:
          "Personalizes the guarantee. Highest belief lift; only use if the founder can actually respond.",
      },
      {
        pattern: "Guarantee + Keep Asset",
        formula: "'Refund + keep <asset>'",
        example:
          "'60-day refund. Even if you refund, you keep the 90-second diagnostic results.'",
        notes:
          "Gift-on-refund framing. Increases conversion at the cost of margin on refunders; net win for relationship-based products.",
      },
      {
        pattern: "Pre-Refund Survey",
        formula:
          "Standard refund window + 'we'll ask one question on refund to improve the product.'",
        example:
          "'30-day refund. We'll ask one short question on refund – your answer shapes what we build next.'",
        notes:
          "Refund as data. Doesn't reduce refunds, but turns them into product input. Honest framing.",
      },
    ],
    commonMistakes: [
      "Guarantee buried in the FAQ. The guarantee belongs next to the price, not under the fold.",
      "Guarantee that requires customer to mail a physical certificate or jump through hoops. Refund friction reverses the trust signal.",
      "Guarantee language that contradicts the cancellation flow. If the page says 'cancel anytime' but the dashboard requires emailing support, that's a trust kill on the second visit.",
      "Guarantee with a time window shorter than the product's natural activation cycle. A 7-day guarantee on a tool that takes 14 days to set up is a trap.",
      "No guarantee at all on a $49+ purchase. The risk reversal is non-optional past about $19; without it, conversion takes a structural hit.",
    ],
    faqs: [
      {
        q: "Is a 30-day guarantee enough, or should I offer 60 days?",
        a: "30 days is the baseline. 60+ days raises conversion noticeably on $49+ products and barely changes refund rate, because most refunders refund in the first 7 days regardless of window length.",
      },
      {
        q: "Will offering a money-back guarantee increase refund abuse?",
        a: "Marginally. Refund abuse is real but small – typically 2-5 percent of buyers on a 60-day window. The conversion lift from offering the guarantee usually outweighs the refund cost 5-10x.",
      },
      {
        q: "Should the guarantee be on the pricing page or the hero?",
        a: "Both. A one-line version near the hero CTA (a trust signal at the moment of click) and the full terms on the pricing page (the buyer's verification checkpoint).",
      },
    ],
    relatedGlossary: ["weak-belief", "value-ladder"],
    brunsonLens: "Offer",
    lastVerified: LAST_VERIFIED,
  },

  // ---------------------------------------------------------------------
  // 10. Founder letter (about page)
  // ---------------------------------------------------------------------
  {
    slug: "founder-letter",
    element: "founder letter",
    elementPlural: "Founder letters",
    displayName: "Founder Letter Swipe File",
    metaTitle: "Founder Letter Swipe File (12 About-Page Patterns)",
    metaDescription:
      "Twelve founder letter / about page patterns that build trust without bragging. Origin story, public scar, why-now framing for indie SaaS.",
    tldr:
      "A founder letter (the about page or 'why I built this' block) is where buyers go to decide if they trust the operator behind the product. The patterns that earn trust are specific about scars, not specific about credentials. Resumes lose to scars.",
    whenToUse:
      "When buyers reach the offer but don't convert. When session recordings show /about getting more time than the homepage. When the product is good but the founder is invisible.",
    whenNotToUse:
      "When the founder genuinely shouldn't be the face (technical infrastructure products, B2B compliance tooling). In those cases, lean on the team page or the customer roster instead.",
    examples: [
      {
        pattern: "Origin Scar",
        formula:
          "'<Year>, I <specific failure event>. That's when I learned <one specific lesson>. This product is <how the lesson became code>.'",
        example:
          "'In 2024 I launched a SaaS that did $147 in 6 months. That's when I learned post-launch isn't a marketing problem – it's a diagnostic problem. Unlock SaaS is the diagnostic I wish I'd had.'",
        notes:
          "Origin + scar + lesson + product. Single tight loop. Earns more trust than a resume in 50 words.",
      },
      {
        pattern: "Public Body of Work",
        formula:
          "'I've shipped <product 1>, <product 2>, <product 3>. <Honest sentence on what failed and what worked>.'",
        example:
          "'I've shipped three SaaS products in 5 years. Two flatlined post-launch. The third is doing $4k MRR. This is the diagnostic that came out of those failures.'",
        notes:
          "Public body of work + honest sentence on outcomes. Use only if the work is publicly visible.",
      },
      {
        pattern: "Why-Now Framing",
        formula:
          "'The thing that changed is <named shift>. Pre-<shift>, founders did <X>. Post-<shift>, founders need <Y>. This product is <Y>.'",
        example:
          "'The thing that changed is post-launch silence. Pre-AI, founders shipped and got attention. Post-AI, they ship into a flooded feed and go silent. This product is the diagnostic that names what's broken in the silence.'",
        notes:
          "Names the macro shift the audience is feeling. Earns relevance, not just trust.",
      },
      {
        pattern: "Customer-First Bio",
        formula:
          "'Hi. I built this for <cohort> like <named real customer>. <One specific outcome they got>.'",
        example:
          "'Hi, Maryan here. I built this for indie SaaS founders like [named real customer], who went from a 6-week flat Stripe line to 8 paying buyers in 30 days.'",
        notes:
          "Customer-first framing. Founder bio comes after the customer outcome, not before.",
      },
      {
        pattern: "Public Numbers",
        formula:
          "'<Current revenue / users / public metric>. <One honest sentence about what's working and what isn't>.'",
        example:
          "'47 buyers, $2,300 MRR, 6 months in. Diagnostic conversion is healthy. The retention surface still needs work.'",
        notes:
          "Live numbers + named gaps. Counterintuitive trust lift. Most founders won't do it; you should.",
      },
      {
        pattern: "Three Times I Was Wrong",
        formula:
          "'Three things I used to believe and now don't: <belief 1, what changed>, <belief 2, what changed>, <belief 3, what changed>.'",
        example:
          "'I used to believe more traffic was the answer. It wasn't. I used to believe a redesign would fix it. It didn't. I used to believe email lists weren't worth the effort. They are.'",
        notes:
          "Updates-to-priors framing. Signals the founder learns from contact with reality.",
      },
      {
        pattern: "Public Letter",
        formula:
          "Direct address, second-person. 'Dear <cohort>, here's what I noticed about <pain>. Here's what I built. Here's what it's not.'",
        example:
          "'Dear post-launch founder, here's what I noticed about the 6 weeks after launch. Here's what I built. Here's what it isn't – it's not a course.'",
        notes:
          "Letter format. Higher dwell, higher conversion when the founder writes the prose personally.",
      },
      {
        pattern: "Identity Statement",
        formula:
          "'I'm not <thing the audience expects>. I'm <thing closer to them>. <Why that matters for the product>.'",
        example:
          "'I'm not a growth marketer. I'm a founder who launched into 6 weeks of silence. That's why the diagnostic is built around what a founder can self-run, not what a marketer would optimize.'",
        notes:
          "Identity disclosure that reframes the founder as peer, not vendor.",
      },
      {
        pattern: "Skin In Game",
        formula:
          "'I use this on my own products. <Specific outcome on the founder's own product>.'",
        example:
          "'I run the diagnostic on every product I ship. It caught a Wrong Person error on my last launch and saved me 6 weeks of misdirection.'",
        notes:
          "Eating your own dogfood, named specifically. The most cited proof of operator credibility.",
      },
      {
        pattern: "Public Promise",
        formula:
          "'<Specific public commitment>. <Verifiable accountability mechanism>.'",
        example:
          "'I publish monthly transparency reports at /press/transparency. If the metrics don't move, the reports will say so out loud.'",
        notes:
          "Public commitment + accountability mechanism. The commitment alone is cheap; the mechanism is the trust unlock.",
      },
      {
        pattern: "Founder Email",
        formula:
          "'Reply to <founder email> any time. <Sentence on what you reply to>.'",
        example:
          "'Reply to maryan@unlocksaas.com any time. I read everything within 24 hours and respond to most.'",
        notes:
          "Direct email + honest response time. Most founders hide. Showing up earns trust no logo strip can match.",
      },
      {
        pattern: "Two-Founder Voice",
        formula:
          "<Founder 1 photo + line> + <Founder 2 photo + line> + <joint sentence>",
        example:
          "Two founder photos side-by-side, each with one line on what they do, then 'Between us, 12 years of founder mistakes you don't have to repeat.'",
        notes:
          "Solo founders skip; two-founder teams should use the side-by-side. Triangulates trust between the two.",
      },
    ],
    commonMistakes: [
      "Founder letter that's actually a resume. 'I worked at X, then Y, then Z' tells the buyer nothing about whether the founder understands their pain.",
      "Photos with no faces (logos as avatars). Removes the trust unlock the page exists for.",
      "Founder letter buried at /about with no link from the homepage. The buyer can't find the trust page; it might as well not exist.",
      "Letter written in third person. 'Maryan is a founder who...' reads as bio copy, not as a letter. Use first person.",
      "Length over substance. A 200-word letter with one named scar beats a 1,000-word bio with five accomplishments.",
    ],
    faqs: [
      {
        q: "How long should a founder letter be?",
        a: "150 to 500 words is the working range. Below 100 reads as too thin to earn trust; above 700 loses the visitor's patience. Density of scars + lessons matters more than length.",
      },
      {
        q: "Should I include my photo on the founder letter?",
        a: "Yes, a real one. Not a logo, not an avatar. A face the visitor can search and verify on LinkedIn or X earns more trust than any sentence on the page.",
      },
      {
        q: "Does the founder letter need to be on /about or can it be on the homepage?",
        a: "Both, in different forms. A 3-line founder block on the homepage (face + one scar + one promise), and the full letter at /about for buyers who want to verify.",
      },
    ],
    relatedGlossary: ["story"],
    brunsonLens: "Story",
    lastVerified: LAST_VERIFIED,
  },

  // ---------------------------------------------------------------------
  // 11. FAQ section
  // ---------------------------------------------------------------------
  {
    slug: "faq-section",
    element: "FAQ section",
    elementPlural: "FAQ sections",
    displayName: "FAQ Section Swipe File",
    metaTitle: "FAQ Section Swipe File (12 Patterns That Beat Objections)",
    metaDescription:
      "Twelve FAQ section patterns indie SaaS founders use to convert hesitating buyers. Objection-mapped, ordered by descending intensity, AEO-ready.",
    tldr:
      "An FAQ section is an objection-handler in disguise. Every question on the list should match a real buyer hesitation. Questions that pretend to be educational (but are actually self-praise) burn trust; questions that name real objections earn the click on the CTA below them.",
    whenToUse:
      "When scroll depth reaches the offer block but the CTA doesn't fire. When customer support inbox has the same 3-5 pre-purchase questions weekly. When the buyer needs one more permission to act.",
    whenNotToUse:
      "When traffic doesn't reach the FAQ block. Move the questions higher (inline in the offer block) rather than relying on the visitor to scroll.",
    examples: [
      {
        pattern: "Price Objection",
        formula: "'Is <price> too much for <thing>?' + honest answer.",
        example:
          "'Is $49/month too much for a diagnostic tool? If you're pre-revenue, probably. The $1 Starter exists for that reason.'",
        notes:
          "Honest answer with a redirect to a cheaper tier earns more trust than defending the price.",
      },
      {
        pattern: "Cohort Match",
        formula: "'Is this for <cohort the visitor might not match>?' + qualifier.",
        example:
          "'Is this for pre-launch founders? No. The diagnostic needs a live page to read. Come back once you've shipped.'",
        notes:
          "Disqualifying the wrong cohort qualifies the right cohort. Counter-intuitive trust lift.",
      },
      {
        pattern: "Time-To-Value",
        formula: "'How long until <named outcome>?' + specific time range.",
        example:
          "'How long until I see my first paying customer? 30-90 days for diligent operators. 6 months for those who skip the rewrite step.'",
        notes:
          "Specific time range + named operator condition. Earns belief because it's testable.",
      },
      {
        pattern: "Comparable Product",
        formula:
          "'How is this different from <named competitor>?' + structural answer.",
        example:
          "'How is this different from a course? A course teaches the framework. This applies the framework to your live page.'",
        notes:
          "Names the comparison the buyer is privately running. Honest structural difference, not 'we're better'.",
      },
      {
        pattern: "Refund Mechanics",
        formula: "'What's the refund process?' + step-by-step answer.",
        example:
          "'Reply to any email or message support@unlocksaas.com within 60 days. Refund processed within 24 hours, no questions asked.'",
        notes:
          "Specific mechanics earn more belief than 'yes, we refund'. Names the channel and the SLA.",
      },
      {
        pattern: "Founder Question",
        formula: "'Who built this?' + 2-line founder + link to /about.",
        example:
          "'Who built this? Maryan, indie SaaS founder, 3 launches, 1 working. Full story at /about.'",
        notes:
          "Personalized FAQ entry. Earns belief by surfacing the founder where buyers are already evaluating trust.",
      },
      {
        pattern: "Privacy Question",
        formula: "'What do you do with my data?' + plain-English answer.",
        example:
          "'What do you do with the URL I submit? Run it through the diagnostic, then delete after 30 days. We don't sell or share inputs.'",
        notes:
          "Plain-English answer. Avoid legalese; buyers reading the FAQ are reading for honesty, not for terms.",
      },
      {
        pattern: "Integration Question",
        formula: "'Does it work with <named tool>?' + honest yes/no/partial.",
        example:
          "'Does it work with my Webflow site? Yes. Framer? Yes. Custom Next.js? Yes. Webflow CMS dynamic pages? Partial.'",
        notes:
          "Honest 'partial' answers earn more trust than blanket 'yes'. Buyers who get a 'partial' here often buy anyway.",
      },
      {
        pattern: "Cancel Question",
        formula: "'How do I cancel?' + plain-English steps.",
        example:
          "'How do I cancel? Go to /dashboard → billing → cancel subscription. One click. No phone call required.'",
        notes:
          "Surfacing the cancel mechanics openly is a trust signal. Hidden cancel flows are remembered worse than expensive products.",
      },
      {
        pattern: "Success Story Cross-Link",
        formula:
          "'Show me a real example.' + 'Yes, see /stories/<slug>.'",
        example:
          "'Show me a founder who actually got results. Yes, see /stories/[real-founder-slug].'",
        notes:
          "Drop-in cross-link. Visitor who clicks self-qualifies into a deeper trust path.",
      },
      {
        pattern: "Public Roadmap",
        formula: "'What's on the roadmap?' + link to /roadmap or /press.",
        example:
          "'What are you building next? See the public roadmap at /press/roadmap.'",
        notes:
          "Forward-looking trust. Pairs especially well with active, dated roadmap updates.",
      },
      {
        pattern: "Honest Limitation",
        formula: "'What doesn't this do?' + 2-3 honest gaps.",
        example:
          "'What doesn't this do? Not a copywriter. Not an ad strategist. Not a designer. It diagnoses the page and labels what's broken.'",
        notes:
          "Honest limitations earn the most trust of any FAQ pattern in this list. Most founders skip this entry. You shouldn't.",
      },
    ],
    commonMistakes: [
      "FAQs that are praise in question form. 'Why is your product so good?' is a bullshit detector for buyers.",
      "FAQs ordered by writer convenience instead of buyer-objection intensity. Lead with the price objection, end with the cohort filter.",
      "Three FAQs total. Most buyers have 5-9 real objections; 3 makes the page look thin.",
      "No FAQ at all on a SaaS pricing page. The objections happen whether you address them or not – you just don't get to set the framing.",
      "FAQ entries that are 200-word essays. Buyers scan FAQs; 2-3 sentence answers convert better than walls.",
    ],
    faqs: [
      {
        q: "How many FAQs should I have on a landing page?",
        a: "5-9 is the working range. Below 5 looks unprepared; above 12 reads as defensive. Order them by descending objection intensity (price, cohort fit, time-to-value, refund) rather than by topic.",
      },
      {
        q: "Should FAQs use schema markup?",
        a: "Yes, FAQPage JSON-LD on every FAQ block. It earns the AI-Overview citation surface and the People Also Ask serp module. Without it, your FAQs are just text.",
      },
      {
        q: "Should I show all FAQs expanded or collapsed by default?",
        a: "Top 2-3 expanded (the objections everyone has), the rest collapsed. Full-collapse hides too much; full-expand creates a wall and visitors don't scan it.",
      },
    ],
    relatedGlossary: ["weak-belief"],
    brunsonLens: "Story",
    lastVerified: LAST_VERIFIED,
  },

  // ---------------------------------------------------------------------
  // 12. Urgency / scarcity block
  // ---------------------------------------------------------------------
  {
    slug: "urgency-scarcity",
    element: "urgency or scarcity block",
    elementPlural: "Urgency and scarcity blocks",
    displayName: "Urgency and Scarcity Swipe File",
    metaTitle: "Urgency and Scarcity Swipe File (12 Honest Patterns)",
    metaDescription:
      "Twelve urgency and scarcity patterns that move buyers without fabricating pressure. Real deadlines, capped cohorts, transparent rationale.",
    tldr:
      "Urgency and scarcity work, but fabricated versions burn long-term trust faster than they convert short-term buyers. The patterns below are the honest variants – real deadlines, real caps, transparent rationale visible to the buyer.",
    whenToUse:
      "When the buyer has 80 percent of conviction but no reason to act today. When the underlying scarcity is real (founder bandwidth, batch capacity, time-limited cohort).",
    whenNotToUse:
      "When the scarcity isn't real. Countdown timers that reset, 'only 3 left' that never decrement – these get noticed within 48 hours and the trust kill is permanent.",
    examples: [
      {
        pattern: "Real Cohort Cap",
        formula: "'<N> spots in the <named cohort>. <Operator rationale>.'",
        example:
          "'12 spots in the May cohort. I personally review every diagnostic in cohort calls, so the cap is real.'",
        notes:
          "Operator-bandwidth scarcity is the most honest variant. Naming the rationale earns belief.",
      },
      {
        pattern: "Real Deadline",
        formula: "'<Specific date> deadline. <Reason it's that date>.'",
        example:
          "'May 31 deadline. After that, the May cohort closes and the June price goes up.'",
        notes:
          "Calendar-anchored deadline + reason. Avoid 'today only' rolling deadlines.",
      },
      {
        pattern: "Founder Discount Window",
        formula:
          "'<Founder price> for the first <N> buyers. After that, <public price>.'",
        example:
          "'$49/month for the first 1,000 buyers. After that, public price is $99/month. 247 spots taken.'",
        notes:
          "Counter + rationale. Update the counter daily or it loses credibility.",
      },
      {
        pattern: "Batch Open / Close",
        formula:
          "'Cart opens <date>, closes <date>. Next cohort: <date>.'",
        example:
          "'Cart opens May 1, closes May 14. Next cohort: July 1.'",
        notes:
          "Batched cart mechanic from cohort-based courses. Earns trust when the cycle is consistent.",
      },
      {
        pattern: "Capped Bonus",
        formula:
          "'<Bonus> for the first <N> buyers. <Bonus details>.'",
        example:
          "'Live cohort call with Maryan for the first 50 buyers of the month. 31 spots taken.'",
        notes:
          "Bonus scarcity. Doesn't change product price; only changes what comes with it.",
      },
      {
        pattern: "Live Inventory",
        formula:
          "'<N> seats / spots / units available right now.'",
        example:
          "'5 office hours slots available in the next 7 days.'",
        notes:
          "Real-time inventory. Update via Cal.com embed or live count, not a static string.",
      },
      {
        pattern: "Sunset Notice",
        formula:
          "'<Feature / tier> retires on <date>. <Reason>.'",
        example:
          "'The $1 Starter tier sunsets on June 30. After that, the entry tier becomes $9.'",
        notes:
          "Pre-announced sunset earns urgency without trickery. Buyers respect operators who flag changes in advance.",
      },
      {
        pattern: "Price Increase Notice",
        formula:
          "'Price increases <percentage / amount> on <date>. <Reason>.'",
        example:
          "'Price increases from $49 to $69 on July 1. Cost of bundling the new cohort-call surface.'",
        notes:
          "Honest price-raise framing. Buyers who lock in at the lower price feel like winners, not pressured.",
      },
      {
        pattern: "Founder Bandwidth",
        formula:
          "'<N> active customers ceiling. <Reason>.'",
        example:
          "'I cap active customers at 200 so I can personally read every diagnostic. 174 spots taken.'",
        notes:
          "Founder-driven scarcity. Tight cap forces self-selection; visitors who don't fit don't try.",
      },
      {
        pattern: "Honest 'No Scarcity'",
        formula:
          "'No urgency mechanic on this page. <Reason>.'",
        example:
          "'No countdown timer on this page. The diagnostic is available whenever you have a live page to test.'",
        notes:
          "Explicit no-scarcity is rare and earns trust. Use when buyers are scarcity-fatigued.",
      },
      {
        pattern: "Public Cohort Tracker",
        formula:
          "<Live counter showing N spots taken / M total + ledger>",
        example:
          "247 / 1000 founder spots taken at $49/month → live counter with names",
        notes:
          "Public tracker with names (with permission). Highest belief lift; production cost is real.",
      },
      {
        pattern: "Refund Window As Urgency",
        formula:
          "'<60-day refund window>. So there's no risk to acting today.'",
        example:
          "'60-day refund window. So if today's actually the wrong time, you have 60 days to find out and refund.'",
        notes:
          "Reframes refund window as a permission to act now. Lower friction than scarcity, similar conversion lift.",
      },
    ],
    commonMistakes: [
      "Countdown timer that resets on page reload. Buyers spot this within one session; trust is gone.",
      "'Only 3 left' that's been on the page for 6 months. The site loses credibility the moment one buyer notices.",
      "Urgency on a product without a real deadline. The deadline IS the urgency; fabricating one is fraud-flavored.",
      "Stacking three different urgency mechanics on the same page. One real one is more persuasive than three fake ones.",
      "Scarcity without rationale. 'Limited spots' answers nothing; 'I personally review each one, so the cap is 50/month' earns belief.",
    ],
    faqs: [
      {
        q: "Do urgency timers actually work?",
        a: "Real ones, yes. Fake ones work for the first 48 hours, then the trust kill compounds for years. If the deadline isn't real, don't display a timer.",
      },
      {
        q: "Should I show how many spots are left?",
        a: "Only if the count is real and updated dynamically. Static 'only N left' that doesn't decrement when buyers buy is the single most-recognized fake-scarcity pattern in indie SaaS.",
      },
      {
        q: "How tight should a cohort cap be?",
        a: "Tight enough that you actually hit the cap. A 1,000-spot 'cohort' that's at 23/1000 reads as a marketing prop, not a real cap. Better to cap at 50 and sell out than to cap at 1,000 and never close.",
      },
    ],
    relatedGlossary: ["weak-belief"],
    brunsonLens: "Offer",
    lastVerified: LAST_VERIFIED,
  },

  // ---------------------------------------------------------------------
  // 13. Checkout page
  // ---------------------------------------------------------------------
  {
    slug: "checkout-page",
    element: "checkout page",
    elementPlural: "Checkout pages",
    displayName: "Checkout Page Swipe File",
    metaTitle: "Checkout Page Swipe File (12 Patterns That Don't Bleed Buyers)",
    metaDescription:
      "Twelve checkout page patterns indie SaaS founders use to stop the last-step bleed. Order bumps, trust signals, single-field forms, mobile-native.",
    tldr:
      "A checkout page is the final friction surface in the funnel. Every visible field, every reassurance, every absence of one – it all compounds. The patterns below cut friction without removing trust signals, which is the trade-off most checkout redesigns get backwards.",
    whenToUse:
      "When add-to-cart rate is healthy but completion rate is under 60 percent. When mobile completion is meaningfully lower than desktop. When the checkout page is the last surface the visitor sees before they bounce.",
    whenNotToUse:
      "When the buyer doesn't reach the checkout at all. Earlier-funnel friction (price clarity, cohort fit) is the bigger fix.",
    examples: [
      {
        pattern: "Single-Field Email",
        formula: "<Email field> + <Stripe payment element>",
        example:
          "'Email' + Stripe Link element with saved card. Two fields total.",
        notes:
          "Fewest possible inputs. Email captures the buyer regardless of completion; Stripe Link autofills returning buyers.",
      },
      {
        pattern: "One-Page Checkout",
        formula:
          "Single scroll: <plan summary> + <email> + <payment> + <CTA>",
        example:
          "Summary at top ('You're buying: Playbook, $49/month, 60-day refund'), email, Stripe element, CTA. All on one scroll.",
        notes:
          "Multi-step checkouts have higher abandon rates than single-page for transactions under $500.",
      },
      {
        pattern: "Order Bump",
        formula:
          "Checkbox above payment: 'Add <bonus> for <small price>'",
        example:
          "'☐ Add the 30-day email sequence template for $19. (Recommended for SaaS launches.)'",
        notes:
          "Single checkbox order bump. Take rate of 20-40 percent on relevant bumps. Don't stack two bumps – one only.",
      },
      {
        pattern: "Stripe Link / Apple Pay First",
        formula:
          "<Stripe Link / Apple Pay button> above the manual card entry",
        example:
          "Apple Pay button at top, then 'Or enter card manually'. Stripe Link defaults if device-cookied.",
        notes:
          "Mobile completion jumps significantly. Saved-payment paths cut entry friction to ~3 taps.",
      },
      {
        pattern: "Inline Trust Strip",
        formula:
          "<3-line trust strip>: <guarantee> + <payment security> + <support>",
        example:
          "'60-day money-back  |  Stripe-secured, no card data stored  |  Email support@unlocksaas.com, reply within 24h'",
        notes:
          "Trust strip inline on the checkout page (not the homepage). Reduces the 'should I really put my card in?' hesitation.",
      },
      {
        pattern: "Plan Summary",
        formula:
          "Top of checkout: <plan name>, <price>, <billing cycle>, <refund window>",
        example:
          "Box at top: 'Playbook, $49/month, billed monthly, 60-day refund.'",
        notes:
          "Summary above the form. Buyers refuse to enter card details without seeing exactly what they're paying for.",
      },
      {
        pattern: "Founder Note",
        formula:
          "<2-line founder note + photo>, inline on checkout",
        example:
          "Founder photo + 'I read every refund request personally. Reply to maryan@unlocksaas.com any time. – Maryan'",
        notes:
          "Humanizes the checkout. Lower abandonment on first-time buyers; less effect on returning buyers.",
      },
      {
        pattern: "Mobile-First Layout",
        formula:
          "Stacked single-column, large tap targets, autofocus on email",
        example:
          "Mobile-optimized: 56px tap targets, email field autofocused, payment buttons spaced 16px apart minimum.",
        notes:
          "Mobile completion is the bottleneck on most indie SaaS. Design for it first; desktop scales gracefully.",
      },
      {
        pattern: "Local Currency",
        formula:
          "<Auto-detected currency from Geo-IP> + small disclaimer",
        example:
          "'€45 (charged in USD as $49) – your bank handles the conversion.'",
        notes:
          "Honest dual-display. Buyers from outside the US trust prices in their currency; the disclaimer respects the actual charge.",
      },
      {
        pattern: "Risk-Free Banner",
        formula:
          "<One-line banner above CTA>",
        example:
          "'You can cancel and get a full refund within 60 days. Click below to start.'",
        notes:
          "Risk-reversal banner right above the CTA. The last sentence before the click matters disproportionately.",
      },
      {
        pattern: "Exit-Save Bump",
        formula:
          "If buyer abandons mid-checkout: <inline message + small discount>",
        example:
          "If buyer abandons after entering email, show: 'Use code FOUNDER10 for 10% off this checkout'.",
        notes:
          "Save mechanism for buyers who price-anchored. Don't show the discount before; that trains the buyer to wait.",
      },
      {
        pattern: "Express Lane + Custom",
        formula:
          "<Express Stripe Link button> + 'Or enter your own card / billing details'",
        example:
          "Top: 'Buy now with Stripe Link (1 tap)' button. Below: 'Or enter manually' for buyers without Link.",
        notes:
          "Express lane for returning buyers, custom lane for first-timers. Both visible; no buyer hunting for the path.",
      },
    ],
    commonMistakes: [
      "Asking for a phone number on a $49 self-serve checkout. Every optional field cuts completion by a meaningful percentage.",
      "Hiding the total until the second step. Buyers refuse to enter card details without seeing the total above the form.",
      "Multi-step checkouts with progress bars under $200. Progress bars belong on enterprise demos, not on tripwires.",
      "Order bump pre-checked. Pre-checked checkboxes generate refund spikes and complaints. Always opt-in.",
      "Generic 'we don't store your card' text without the Stripe / Apple Pay icon. Trust icons earn the click; words alone don't.",
    ],
    faqs: [
      {
        q: "Should the checkout collect billing address?",
        a: "Only what's required for the payment method. Stripe-only US checkouts need just email + card. Adding address fields drops completion on mobile by a measurable amount.",
      },
      {
        q: "What's a healthy checkout completion rate for SaaS?",
        a: "70-85 percent on a clean single-page checkout for SaaS under $99. Under 60 percent suggests friction (too many fields, slow load, trust gap); over 85 percent suggests the checkout is doing its job.",
      },
      {
        q: "Should I show the discount code field on the checkout?",
        a: "Show it collapsed ('Have a code?') – buyers hunting a code who can't find a field will leave. But don't lead with it; the lead is the offer, not the discount.",
      },
    ],
    relatedGlossary: ["tripwire", "oto"],
    brunsonLens: "Offer",
    lastVerified: LAST_VERIFIED,
  },

  // ---------------------------------------------------------------------
  // 14. Thank-you / confirmation page
  // ---------------------------------------------------------------------
  {
    slug: "thank-you-page",
    element: "thank-you page",
    elementPlural: "Thank-you pages",
    displayName: "Thank-You Page Swipe File",
    metaTitle: "Thank-You Page Swipe File (12 Post-Purchase Patterns)",
    metaDescription:
      "Twelve thank-you page patterns that turn one-time buyers into repeat buyers. Next-step CTAs, share prompts, onboarding cards, and OTO bridges.",
    tldr:
      "The thank-you page is the single most under-built surface in indie SaaS. It catches buyers at peak conviction and most operators waste it on a 'thanks for buying!' headline. The patterns below extract one more action from the buyer's hot moment.",
    whenToUse:
      "Always. Every post-purchase flow has a thank-you page; the question is what's on it.",
    whenNotToUse:
      "Never skip; just adjust the ambition. New brands should use it for next-step onboarding. Established brands can stack referral and OTO mechanics.",
    examples: [
      {
        pattern: "Next-Step Single CTA",
        formula:
          "<Confirmation> + <single next-step button>",
        example:
          "'Order confirmed. Next: run your diagnostic →' (button to /diagnostic)",
        notes:
          "One next step, no choices. Buyers complete one CTA per page; multi-CTA thank-you pages dilute the next action.",
      },
      {
        pattern: "Onboarding Card",
        formula:
          "<Confirmation> + <3-step checklist of first actions>",
        example:
          "'Step 1: Confirm your email. Step 2: Run your first diagnostic. Step 3: Book onboarding call (optional).'",
        notes:
          "Onboarding checklist on the thank-you page improves activation rate. Steps 1-3 only; longer lists kill momentum.",
      },
      {
        pattern: "Share Prompt",
        formula:
          "'Tell someone who'd want this' + <pre-filled share text + share buttons>",
        example:
          "'Just bought the Playbook. Tell another founder who's post-launch.' [Tweet] [LinkedIn] [Copy link]",
        notes:
          "Pre-filled share copy + share buttons. Best moment to extract organic distribution is at peak conviction.",
      },
      {
        pattern: "Referral Bonus",
        formula:
          "'Refer a friend, get <reward>'",
        example:
          "'Refer another founder who buys, get $25 in account credit.'",
        notes:
          "Referral mechanic immediately after purchase. Trust is at peak; ask now, not in a follow-up email.",
      },
      {
        pattern: "Calendar Booking",
        formula:
          "'Book your <onboarding call / kickoff>'",
        example:
          "'Book your 15-min welcome call with Maryan' + Cal.com embed",
        notes:
          "Inline calendar embed. High-touch products convert better with a thank-you calendar embed than a separate email.",
      },
      {
        pattern: "OTO Bridge",
        formula:
          "<Confirmation> + <single relevant upsell>",
        example:
          "'Want me to write your rewrite for you? $499 done-for-you, this checkout only.'",
        notes:
          "Single OTO on the thank-you page. Take rate is lower than mid-checkout OTOs but higher than email OTOs.",
      },
      {
        pattern: "Community Invite",
        formula:
          "'Join the founders' <Discord / Slack / Circle>' + invite link",
        example:
          "'Join the Unlock SaaS founders' Discord – 200+ founders, 4 weekly office hours.'",
        notes:
          "Community invite. Activation correlates with community participation, so this is high-leverage.",
      },
      {
        pattern: "Product Hunt / Review Ask",
        formula:
          "'Help us out: review on <platform>'",
        example:
          "'If this helps you, review us on G2. We send the link the day you ship your first diagnostic – not now.'",
        notes:
          "Pre-announce the review ask but don't ask today. Buyers who just bought haven't earned the result yet.",
      },
      {
        pattern: "Founder Video",
        formula:
          "<30-90s founder video> + <transcript>",
        example:
          "Founder video: '60-second hello, what to expect this week, how to reach me.'",
        notes:
          "Personalizes the post-purchase moment. Higher activation rate on first-time buyers; less effect on repeat buyers.",
      },
      {
        pattern: "Expectation Setting",
        formula:
          "'<What happens next, dated>'",
        example:
          "'In your inbox right now: receipt. In 5 minutes: welcome email with first diagnostic link. Tomorrow: kickoff prompt. In 7 days: progress check.'",
        notes:
          "Dated expectation timeline. Reduces 'where's my email?' support tickets and increases activation.",
      },
      {
        pattern: "Tutorial Embed",
        formula:
          "<Embedded 2-min product walkthrough video>",
        example:
          "Embedded Loom: '2-minute walkthrough of the dashboard, run your first diagnostic.'",
        notes:
          "Inline tutorial on the thank-you page. Cuts first-week support tickets significantly.",
      },
      {
        pattern: "Order Receipt + Trust",
        formula:
          "<Receipt summary> + <trust signal> + <support contact>",
        example:
          "'Order #1234, $49 charged to Visa ending 5555, 60-day refund window. Reply to receipt email any time.'",
        notes:
          "Specific receipt + refund window + reply path. Reduces dispute rate and earns long-term trust.",
      },
    ],
    commonMistakes: [
      "Thank-you page that's literally just 'thanks for your order!'. Wastes the peak-conviction moment.",
      "Three CTAs of equal weight on the thank-you page. Buyers do one thing; don't dilute it.",
      "Review ask on the same day as purchase. The buyer hasn't shipped the outcome yet; the review will be 'too early to tell'.",
      "No expectation-setting on what happens next. Generates inbox emails to support that should have been answered on this page.",
      "Asking for a referral or share before the buyer has confirmed conviction (immediately post-checkout). Wait at least one activation event.",
    ],
    faqs: [
      {
        q: "Should I run an upsell on the thank-you page?",
        a: "Yes, exactly one, and only if it's directly related to the purchase. Two or more upsells on the same thank-you page push the buyer into 'aggressive seller' framing and erode trust.",
      },
      {
        q: "How long should a thank-you page be?",
        a: "Short – one viewport on desktop, one and a half scrolls on mobile. The buyer has bought; the page exists to set up the next action, not to re-sell.",
      },
      {
        q: "Should the thank-you page autoplay a video?",
        a: "Muted yes, with audio off, transcript visible. Forced-audio autoplay is the fastest known tab-close trigger.",
      },
    ],
    relatedGlossary: ["oto", "soap-opera-sequence"],
    brunsonLens: "Offer",
    lastVerified: LAST_VERIFIED,
  },

  // ---------------------------------------------------------------------
  // 15. Value stack
  // ---------------------------------------------------------------------
  {
    slug: "value-stack",
    element: "value stack",
    elementPlural: "Value stacks",
    displayName: "Value Stack Swipe File",
    metaTitle: "Value Stack Swipe File (12 Brunson-Style Patterns)",
    metaDescription:
      "Twelve value stack patterns that show why a $49 product is worth $497. Stripe-bookable list, named-and-priced bonuses, total-vs-asking math.",
    tldr:
      "A value stack is the offer's accounting: you list everything the buyer gets, name a credible per-item value, sum the total, then state the asking price as a fraction of that total. The patterns below differ in tone, item count, and how the math is anchored.",
    whenToUse:
      "When the buyer reaches the price and the price feels untethered (no reference for whether $49 is cheap or expensive). When the offer has multiple deliverables but they read as a feature list rather than a stack.",
    whenNotToUse:
      "When there's only one deliverable. A single-product offer doesn't stack; it just has a price. Forcing a stack on a one-item product reads as marketing theater.",
    examples: [
      {
        pattern: "Total Vs Asking",
        formula:
          "'Total value: $<sum>. Today: $<asking>.'",
        example:
          "'Total value: $497. Today: $49. (90% off until June 30.)'",
        notes:
          "The classic Brunson stack. Sum needs to be 5-10x the asking; the discount needs a real reason.",
      },
      {
        pattern: "Named + Priced List",
        formula:
          "'<Item 1, named> – $<value>. <Item 2> – $<value>. <Item 3> – $<value>.'",
        example:
          "'Diagnostic – $99. Playbook – $199. Weekly office hours – $199/month.'",
        notes:
          "Each item gets a named value the buyer can verify (or at least imagine the alternative price for).",
      },
      {
        pattern: "Outcome-Per-Line",
        formula:
          "<Stack item 1> → <Outcome 1>. <Stack item 2> → <Outcome 2>.",
        example:
          "'Diagnostic → labels what's broken. Playbook → tells you what to fix first. Office hours → walks you through it.'",
        notes:
          "Each line names an outcome, not a feature. Avoids the 'features list' trap.",
      },
      {
        pattern: "Time-Equivalent Stack",
        formula:
          "'<Item> – saves <time>. <Item 2> – saves <time>.'",
        example:
          "'Diagnostic – saves 4 weeks of guessing. Playbook – saves 6 weeks of trial-and-error. Office hours – saves 2 weeks of stuck.'",
        notes:
          "Time-equivalent values for founders who hate dollar-anchoring. 'Saves 12 weeks total' lands harder than '$497 value'.",
      },
      {
        pattern: "Bonus Stack",
        formula:
          "'<Core product> + <Bonus 1> + <Bonus 2> + <Bonus 3>'",
        example:
          "'Playbook ($49) + Diagnostic ($99 bonus) + 30-day email checklist ($49 bonus) + Founders Discord ($19/month bonus).'",
        notes:
          "Bonuses framed as additions. Each bonus needs a name and a value to count.",
      },
      {
        pattern: "Stack With Strikethrough",
        formula:
          "Stack items + visible strikethrough totals + final asking",
        example:
          "$497  $99  $19  $49 = ~~$664~~ → $49 today.",
        notes:
          "Visual stack with strikethrough. Buyers see the math without reading the bullets.",
      },
      {
        pattern: "Cohort-Tailored Stack",
        formula:
          "'For <cohort>, the stack includes: <cohort-specific bonuses>.'",
        example:
          "'For SaaS founders, the stack also includes the SaaS-specific email sequence pack ($49 value).'",
        notes:
          "Cohort-specific stack additions. Avoids one-size-fits-none stack lists.",
      },
      {
        pattern: "Lifetime Vs Recurring",
        formula:
          "'<Lifetime value> ÷ <Months> = $<per-month equivalent>.'",
        example:
          "'$2,940 lifetime value (5 years × $49/mo). Or $49/month, cancel anytime.'",
        notes:
          "Long-term math for subscription products. Pairs with the cancel-anytime guarantee.",
      },
      {
        pattern: "Comparison Anchor",
        formula:
          "'<Competitor / alternative> charges $<higher price>. We charge $<asking>.'",
        example:
          "'A growth marketer charges $4,000 for an audit. Unlock SaaS does the diagnostic for $49.'",
        notes:
          "External anchor instead of internal stack. Works when there's a recognizable comparable.",
      },
      {
        pattern: "Conditional Stack",
        formula:
          "'If you buy today, you also get <conditional bonus>.'",
        example:
          "'If you buy before May 31, you also get the live cohort call ($199 bonus).'",
        notes:
          "Conditional stack item. The condition must be real (e.g. cohort closes).",
      },
      {
        pattern: "Stack + Risk-Reversal",
        formula:
          "<Stack> + <Money-back terms>",
        example:
          "'$497 of value for $49. 60-day money-back guarantee.'",
        notes:
          "Stack paired with the guarantee. Both work harder together than separately.",
      },
      {
        pattern: "Founder Time Stack",
        formula:
          "'<Stack item> includes <founder time>'",
        example:
          "'Includes 1 hour of founder time per quarter ($497/hour). $1,988 of founder time per year, included.'",
        notes:
          "Founder time priced explicitly. Works when the founder is genuinely available; fails if they're not.",
      },
    ],
    commonMistakes: [
      "Value stack that adds up to less than 3x the asking price. Visitors expect at least a 5-10x stack-to-price ratio to feel like a deal.",
      "Inflating stack line values to absurd numbers ($10,000 worksheet). Buyers spot fake valuations and the stack loses all leverage.",
      "Stack items that aren't actually delivered. If the line is 'access to community ($297 value)' and there's no community, that's a one-strike trust kill.",
      "Listing the asking price between stack items instead of at the end. The math doesn't compound visually.",
      "Stack without a strikethrough or 'normally vs today' line. Without the contrast, the stack is just a feature list.",
    ],
    faqs: [
      {
        q: "How big should a value stack be relative to the asking price?",
        a: "5-10x. Below 5x, the deal doesn't feel like a deal; above 10x, the math starts looking fabricated. Sweet spot is roughly 7x for indie SaaS at the $49-$199 tier.",
      },
      {
        q: "How many items should a value stack have?",
        a: "3-6 items. Fewer than 3 doesn't read as a stack; more than 6 starts feeling like marketing theater. Each item needs a name and a credible value.",
      },
      {
        q: "Should the stack values be exact or rounded?",
        a: "Specific over round. $199 reads more credible than $200; $1,747 reads more credible than $1,800. Round numbers signal fabrication.",
      },
    ],
    relatedGlossary: ["value-ladder"],
    brunsonLens: "Offer",
    lastVerified: LAST_VERIFIED,
  },

  // ---------------------------------------------------------------------
  // 16. Order bump
  // ---------------------------------------------------------------------
  {
    slug: "order-bump",
    element: "order bump",
    elementPlural: "Order bumps",
    displayName: "Order Bump Swipe File",
    metaTitle: "Order Bump Swipe File (12 Checkbox-Style Patterns)",
    metaDescription:
      "Twelve order bump patterns indie SaaS founders use mid-checkout. Single-checkbox upsells, micro-priced, relevance-locked to the entry product.",
    tldr:
      "An order bump is a single-checkbox upsell that fires at the moment the buyer is reviewing the order summary. The patterns below are micro-priced relative to the entry product (10-40 percent of the entry price) and relevance-locked to what the buyer is already buying.",
    whenToUse:
      "When average order value is exactly the entry price (no upsell is firing). When you have a clearly related $9-$29 asset that complements the entry product. When checkout completion rate is healthy enough to support adding one input.",
    whenNotToUse:
      "When checkout completion rate is already fragile. Adding a bump to a leaky checkout makes the leak worse.",
    examples: [
      {
        pattern: "Related Asset Bump",
        formula:
          "'☐ Add <related asset> for $<small price>'",
        example:
          "'☐ Add the 30-day email sequence template for $19'",
        notes:
          "Single asset bump. Relevance to the entry product is the entire game.",
      },
      {
        pattern: "Recommended Bump",
        formula:
          "'☐ Recommended: add <asset> for $<price>'",
        example:
          "'☐ Recommended: add the rewrite checklist for $9. Used by 80% of buyers.'",
        notes:
          "Social-proof bump. Take rate cited only if real.",
      },
      {
        pattern: "Bonus Box Bump",
        formula:
          "'☐ Add the <named bonus box> for $<price>'",
        example:
          "'☐ Add the Founder's Bonus Pack for $29 – includes 3 swipe files + Discord access.'",
        notes:
          "Bundled bump. Higher take rate than single-asset bumps because the perceived value is stacked.",
      },
      {
        pattern: "Upgrade-To-Annual Bump",
        formula:
          "'☐ Upgrade to annual now, save <X months>'",
        example:
          "'☐ Switch to annual ($490/year), save 2 months.'",
        notes:
          "Annual-upgrade bump on a monthly purchase. Captures buyers at the moment they're already committing.",
      },
      {
        pattern: "Founder-Time Bump",
        formula:
          "'☐ Add 30 minutes with the founder for $<price>'",
        example:
          "'☐ Add a 30-min office hours call with Maryan for $99.'",
        notes:
          "Founder time bump. Works on $49+ entry products; doesn't work on $1 tripwires.",
      },
      {
        pattern: "Community Bump",
        formula:
          "'☐ Add <community access> for $<monthly price>'",
        example:
          "'☐ Add Founders Discord access for $19/month, cancel anytime.'",
        notes:
          "Recurring bump on a one-time entry. Builds monthly revenue from one-time buyers.",
      },
      {
        pattern: "Time-Saver Bump",
        formula:
          "'☐ Skip <part of the work> with <add-on> for $<price>'",
        example:
          "'☐ Skip the rewrite draft and let us do it for $99. Delivered in 7 days.'",
        notes:
          "Bump that explicitly trades money for time. Buyers reading the order summary are in a 'how do I move faster' state.",
      },
      {
        pattern: "Bundle-Discount Bump",
        formula:
          "'☐ Get all <N> products for $<bundled price>'",
        example:
          "'☐ Bundle the Playbook + Diagnostic + Email pack for $99 (saves $48).'",
        notes:
          "Bundle bump. Honest savings; the bundle price visibly reduces what the buyer would otherwise pay.",
      },
      {
        pattern: "Donate Bump",
        formula:
          "'☐ Add <cause> donation for $<small amount>'",
        example:
          "'☐ Round up to $50 and we'll donate $1 to [cause].'",
        notes:
          "Cause-based bump. Take rate is moderate; goodwill effect is real if the cause is real and named.",
      },
      {
        pattern: "Conditional Bump",
        formula:
          "'☐ Add <bonus> if you also commit to <action>'",
        example:
          "'☐ Add the rewrite review for $49, on the condition that you ship your rewrite within 30 days.'",
        notes:
          "Conditional bump. Filters for buyers who'll actually do the work. Lower take rate, higher activation.",
      },
      {
        pattern: "Founder-Signed Asset Bump",
        formula:
          "'☐ Add the <founder-signed asset> for $<price>'",
        example:
          "'☐ Add the founder's personal swipe-file Notion (with edit access) for $29.'",
        notes:
          "Asset with founder-tier signal. Higher perceived value on assets buyers can't easily find elsewhere.",
      },
      {
        pattern: "Already-Decided Bump",
        formula:
          "'☐ Yes, I want <bump>. (Most buyers add this.)'",
        example:
          "'☐ Yes, I want the rewrite checklist ($9). Most buyers add this.'",
        notes:
          "Affirmative framing ('Yes, I want...') outperforms neutral framing ('Add this for...'). Social-proof line only if true.",
      },
    ],
    commonMistakes: [
      "Pre-checked order bump. Generates refund spikes and Better Business Bureau complaints; never pre-check.",
      "Order bump that's unrelated to the entry product. Relevance is everything; an unrelated bump converts under 5 percent.",
      "Two order bumps on the same checkout. The second cuts the first's take rate roughly in half; stick to one.",
      "Bump priced higher than 40 percent of the entry product. Bumps work in the micro-decision zone, not the second-purchase zone.",
      "Bump copy that's a sales letter. The bump is a single sentence; longer copy belongs on the OTO page.",
    ],
    faqs: [
      {
        q: "What's a healthy take rate for an order bump?",
        a: "20-40 percent for a relevant, well-priced bump. Below 15 percent means relevance or price is off. Above 60 percent often means the entry price was too low and the bump should have been the entry product.",
      },
      {
        q: "Can I run an order bump and a post-purchase OTO together?",
        a: "Yes, and they earn different revenue. Bump captures buyers at peak commitment; OTO captures buyers post-conviction. The two are additive when designed as different products.",
      },
      {
        q: "What's the right price for an order bump relative to the entry product?",
        a: "10-40 percent of the entry product. A $49 entry product runs a $9-$19 bump. Bumps over 40 percent feel like a second decision, which is what the OTO surface is for.",
      },
    ],
    relatedGlossary: ["oto", "tripwire"],
    brunsonLens: "Offer",
    lastVerified: LAST_VERIFIED,
  },

  // ---------------------------------------------------------------------
  // 17. Welcome email
  // ---------------------------------------------------------------------
  {
    slug: "welcome-email",
    element: "welcome email",
    elementPlural: "Welcome emails",
    displayName: "Welcome Email Swipe File",
    metaTitle: "Welcome Email Swipe File (12 First-Email Patterns)",
    metaDescription:
      "Twelve welcome email patterns that hold attention past the first open. Founder voice, single CTA, expectation setting, no template-builder polish.",
    tldr:
      "A welcome email is the first piece of content the buyer reads outside of the website. The patterns below win because they sound like a person writing to a person; they fail when they look like a templated newsletter blast. Plain-text, one CTA, founder voice.",
    whenToUse:
      "After every email opt-in or purchase. The first email's open rate sets the tone for every email after it.",
    whenNotToUse:
      "Never skip the welcome email. If you don't have a real one, write a 4-sentence plain-text one this hour.",
    examples: [
      {
        pattern: "Plain-Text Founder Intro",
        formula:
          "Subject: '<First name>, welcome.' Body: 4-sentence founder note + single CTA.",
        example:
          "Subject: 'Maryan – welcome.' Body: 'Hey, Maryan here. You just opted in for the diagnostic. Here's the link. Reply if you have questions.'",
        notes:
          "Plain text, founder voice. Open rates higher than templated; reply rates much higher.",
      },
      {
        pattern: "Expectation Timeline",
        formula:
          "'Here's what happens this week. Tomorrow: <X>. In 3 days: <Y>. In 7 days: <Z>.'",
        example:
          "'Tomorrow: I'll send the rewrite checklist. In 3 days: I'll ask how your diagnostic went. In 7 days: I'll send the founders' office hours invite.'",
        notes:
          "Dated timeline. Reduces 'where's the next email?' churn and builds anticipation for the sequence.",
      },
      {
        pattern: "Single-CTA Welcome",
        formula:
          "<2-sentence framing> + <one clear button>",
        example:
          "'You're in. The first thing to do is run your diagnostic.' [Run Diagnostic →]",
        notes:
          "One CTA per email. Two or more CTAs cut the click on each by roughly half.",
      },
      {
        pattern: "Founder Photo + 'My Story'",
        formula:
          "<Founder photo> + <2-paragraph story> + <CTA>",
        example:
          "Maryan photo + 'I built this because my own SaaS flatlined for 6 weeks post-launch. Here's the diagnostic that came out of that.' + CTA",
        notes:
          "Personal welcome with a photo. Higher click-through; pairs well with the /about page founder letter.",
      },
      {
        pattern: "Reply Prompt",
        formula:
          "'Reply with <one specific question>. I read every one.'",
        example:
          "'Reply with the URL of your live page. I'll glance at it before I send tomorrow's email.'",
        notes:
          "Reply prompts boost engagement scoring with email providers. Use only if you actually read replies.",
      },
      {
        pattern: "First-Asset Delivery",
        formula:
          "<Subject>: '<Asset name> – inside.' Body: link + 1-line use instruction.",
        example:
          "Subject: 'Diagnostic checklist – inside.' Body: '[Link]. Best result: run it on a live page, not a mockup.'",
        notes:
          "Direct asset delivery. Highest click rate of any welcome pattern; lowest reply rate.",
      },
      {
        pattern: "Cohort-Match Welcome",
        formula:
          "<Subject>: 'A note for <cohort>.' Body: cohort-specific framing.",
        example:
          "Subject: 'A note for post-launch SaaS founders.' Body: cohort-tailored welcome with cohort-specific examples.",
        notes:
          "Welcome segmented by opt-in cohort. Higher relevance, higher next-email open rate.",
      },
      {
        pattern: "Setup-Walkthrough Welcome",
        formula:
          "<Embedded 60-90s Loom walkthrough> + <transcript>",
        example:
          "Loom: '60-second walkthrough of the dashboard.' + transcript below.",
        notes:
          "Walkthrough video. Cuts first-week support tickets; higher activation rate.",
      },
      {
        pattern: "Founder-Signed Welcome",
        formula:
          "<Personal note> ending with '– <Founder first name>'",
        example:
          "'Welcome. Reply any time. – Maryan'",
        notes:
          "Personal sign-off. Avoids the 'Sincerely, The Team' corporate voice. Trust lift is small but real.",
      },
      {
        pattern: "Honest Sequence Preview",
        formula:
          "'You'll get <N> emails over the next <time>. Reply STOP if it's not the right time.'",
        example:
          "'You'll get 5 emails over the next 7 days. Reply STOP if it's not the right time.'",
        notes:
          "Honest disclosure of the sequence. Reduces unsubscribes among engaged readers; increases unsubscribes among uninterested ones (which is fine).",
      },
      {
        pattern: "Welcome + Bonus",
        formula:
          "'Welcome. Bonus inside: <named asset>.'",
        example:
          "'Welcome. Bonus inside: the 30-day rewrite checklist.'",
        notes:
          "Welcome with an unexpected first bonus. Builds goodwill, increases next-email open.",
      },
      {
        pattern: "Survey Welcome",
        formula:
          "'Welcome. One question: <single survey question>.'",
        example:
          "'Welcome. One question: what's the single biggest thing breaking on your launch right now? Reply with one word: traffic, conversion, retention, other.'",
        notes:
          "Survey welcome. Reply data segments the list for future emails. Lower click rate than asset-delivery patterns, higher long-term value.",
      },
    ],
    commonMistakes: [
      "Welcome email designed to look like a marketing blast (template, header image, footer). Read as spam, opened less.",
      "Three CTAs in the welcome email. Cuts click on each; never use more than one CTA in the first email.",
      "Welcome email signed 'The Team' on a small SaaS. Buyers know there's no team; using 'the team' breaks trust.",
      "Welcome email scheduled for next day. The first 60 minutes after opt-in is the peak open window; send within that window.",
      "Welcome email that doesn't link to the actual asset the buyer opted in for. Lose half the buyer base in 24 hours.",
    ],
    faqs: [
      {
        q: "How long should a welcome email be?",
        a: "Under 200 words for plain-text founder voice. Longer than that and the open rate drops. The welcome email's job is to deliver the first asset and set up the sequence, not to re-sell the product.",
      },
      {
        q: "Should the welcome email come from the founder's name or the brand?",
        a: "Founder's first name + brand domain ('Maryan from Unlock SaaS'). Personal sender + branded domain earns higher opens than either alone.",
      },
      {
        q: "Should I include an unsubscribe link prominently in the welcome email?",
        a: "Yes, in the footer like every email. Prominently above the footer is unnecessary. The buyer opted in; respect that without pre-suggesting they leave.",
      },
    ],
    relatedGlossary: ["soap-opera-sequence", "seinfeld-email"],
    brunsonLens: "Story",
    lastVerified: LAST_VERIFIED,
  },

  // ---------------------------------------------------------------------
  // 18. Abandoned cart email
  // ---------------------------------------------------------------------
  {
    slug: "abandoned-cart-email",
    element: "abandoned cart email",
    elementPlural: "Abandoned cart emails",
    displayName: "Abandoned Cart Email Swipe File",
    metaTitle: "Abandoned Cart Email Swipe File (12 Recovery Patterns)",
    metaDescription:
      "Twelve abandoned cart email patterns that recover buyers without burning trust. Founder voice, single re-link, no discount-on-first-touch.",
    tldr:
      "An abandoned cart email is the inverse of the welcome email: written when the buyer is about to leave. The patterns below recover purchases by addressing the objection, not by discounting. Discount-on-first-touch trains the buyer to wait.",
    whenToUse:
      "When buyers reach the checkout and exit without purchasing. When you have email capture before the payment step. When the checkout-abandon rate is above industry-typical baseline.",
    whenNotToUse:
      "When you don't have email before payment. You can't email a buyer you don't have an address for; fix the checkout flow first.",
    examples: [
      {
        pattern: "Founder Note",
        formula:
          "<Subject>: 'Saw you started a checkout.' Body: 3-line founder note + re-link to checkout.",
        example:
          "Subject: 'Saw you started a checkout.' Body: 'Hey, just noticed you got to checkout but didn't complete. If something's blocking you, reply – I read every one. Otherwise: [link to resume checkout].'",
        notes:
          "Founder voice + reply prompt + re-link. No discount, no urgency. Trust-first recovery.",
      },
      {
        pattern: "Objection Address",
        formula:
          "<Subject>: 'Most buyers who abandon worry about <X>.' Body: address X + re-link.",
        example:
          "Subject: 'Most buyers who abandon worry about the 60-day refund.' Body: 'Just in case: here's exactly how the refund works. [Resume checkout].'",
        notes:
          "Names the most common objection up front. Higher recovery rate than generic 'come back' emails.",
      },
      {
        pattern: "Single-Reason Reframe",
        formula:
          "<Subject>: '<Reframe of the buyer's hesitation>'. Body: 2-sentence reframe + CTA.",
        example:
          "Subject: 'You're not buying a course.' Body: 'You're buying a 90-second diagnostic. Run it on the page you already shipped. [Resume].'",
        notes:
          "Reframe what the buyer is actually getting. Counters 'is this a course?' confusion.",
      },
      {
        pattern: "Testimonial Email",
        formula:
          "<Subject>: 'What other founders said after diagnosing.' Body: 2-3 short testimonials + CTA.",
        example:
          "Subject: 'What 3 other post-launch founders said.' Body: 3 testimonials in plain text + 'Diagnose yours: [link]'.",
        notes:
          "Trust-based recovery. Works on second-touch when the founder note didn't.",
      },
      {
        pattern: "Honest 'Why You Didn't Buy'",
        formula:
          "<Subject>: 'A guess at why you didn't buy.' Body: list 3 honest guesses + ask which one.",
        example:
          "Subject: 'My best guess at why you didn't buy.' Body: '(1) Too expensive. (2) Not sure it fits your cohort. (3) Something else. Reply with the number.'",
        notes:
          "Honest framing. Gets reply data even from buyers who don't complete.",
      },
      {
        pattern: "Specific Asset Tease",
        formula:
          "<Subject>: 'The asset you didn't see yet.' Body: name the asset + CTA.",
        example:
          "Subject: 'You didn't see the 30-day checklist yet.' Body: 'The checklist is included in the Playbook. [Resume checkout to unlock].'",
        notes:
          "Asset-tease recovery. Avoids discount route; uses curiosity instead.",
      },
      {
        pattern: "Time-Window Recovery",
        formula:
          "<Subject>: 'Your checkout expires in <time>.' Body: time + re-link.",
        example:
          "Subject: 'Your checkout expires in 24 hours.' Body: 'The link expires tomorrow. After that, you can start fresh, but the cohort price may change. [Resume].'",
        notes:
          "Use only if there's a real expiry. Fabricated expiries get discovered.",
      },
      {
        pattern: "Discount-At-Sequence-End",
        formula:
          "<Subject>: 'Final offer.' Body: 5-10% discount code + final CTA.",
        example:
          "Subject: 'Final note – $10 off if you're still on the fence.' Body: 'Code: FOUNDER10. Expires Friday.' (Sent on day 3+ of sequence.)",
        notes:
          "Discount only as the last email in the sequence, never in the first. Trains buyers to wait one email, not multiple.",
      },
      {
        pattern: "Refund-Reminder",
        formula:
          "<Subject>: 'In case the 60-day refund didn't register.' Body: refund details + CTA.",
        example:
          "Subject: 'In case the 60-day refund didn't register.' Body: 'You can buy, run the diagnostic, then refund inside 60 days if it doesn't fit. [Resume].'",
        notes:
          "Risk-reversal recovery. Works for buyers stalled on commitment.",
      },
      {
        pattern: "Founder-Time Bump",
        formula:
          "<Subject>: 'I'll personally walk you through it.' Body: founder time as a bonus + CTA.",
        example:
          "Subject: 'I'll personally walk you through your diagnostic.' Body: 'If you complete checkout this week, I'll add a 30-min call. [Resume].'",
        notes:
          "High-touch recovery. Use only when founder bandwidth is real.",
      },
      {
        pattern: "Single-Bullet Why-To-Buy",
        formula:
          "<Subject>: 'One reason to come back.' Body: single bullet + CTA.",
        example:
          "Subject: 'One reason to come back.' Body: 'Most founders rewrite their landing page 5 times before realizing the headline isn't the problem. This diagnostic skips the 5 rewrites.'",
        notes:
          "Single most-important reason, no fluff. Higher click rate than multi-reason emails.",
      },
      {
        pattern: "Graceful Sign-Off",
        formula:
          "<Subject>: 'Final email.' Body: 'I'll stop emailing about this' + CTA.",
        example:
          "Subject: 'Final email on this.' Body: 'I'll stop emailing about your unfinished checkout. Last chance: [Resume]. Or unsubscribe with one click.'",
        notes:
          "Graceful sequence end. Earns long-term trust even from buyers who don't complete.",
      },
    ],
    commonMistakes: [
      "Discount in the first abandoned-cart email. Trains buyers to abandon to get the code.",
      "Three-email sequence with no escalation. Each email should add something (objection address, testimonial, founder time).",
      "Sequence longer than 4 emails. Past email 4, the abandoned-cart sequence becomes spam.",
      "Sequence with no reply prompt. Reply data is the most valuable output of abandoned-cart sequences for product iteration.",
      "Abandoned-cart email written in 'transactional' template voice. Reads as automated; buyers know.",
    ],
    faqs: [
      {
        q: "When should the first abandoned cart email send?",
        a: "1-4 hours after abandon. Earlier feels stalker-y; later loses the warm conviction window. The 1-4 hour zone catches buyers who left for a meeting and didn't come back.",
      },
      {
        q: "How many emails should the abandoned-cart sequence have?",
        a: "2-4 emails total. Email 1: founder note + re-link. Email 2: objection address. Email 3: testimonial. Email 4 (optional): graceful sign-off with optional discount.",
      },
      {
        q: "Should abandoned-cart emails have a discount code?",
        a: "Only in email 3 or 4, never in email 1. First-touch discounts train buyers to abandon as a discovery mechanism. Reserve discounts for the sign-off email.",
      },
    ],
    relatedGlossary: ["soap-opera-sequence", "weak-belief"],
    brunsonLens: "Story",
    lastVerified: LAST_VERIFIED,
  },

  // ---------------------------------------------------------------------
  // 19. Waitlist signup
  // ---------------------------------------------------------------------
  {
    slug: "waitlist-signup",
    element: "waitlist signup",
    elementPlural: "Waitlist signups",
    displayName: "Waitlist Signup Swipe File",
    metaTitle: "Waitlist Signup Swipe File (12 Pre-Launch Patterns)",
    metaDescription:
      "Twelve waitlist signup patterns indie SaaS founders use pre-launch. Cohort scarcity, named drops, founder-curated lists, ZIP-code-style filters.",
    tldr:
      "A waitlist is a pre-revenue cohort builder. The patterns below differ in how aggressively they qualify the signup (low-friction email vs ZIP-code-style filters) and how aggressively they signal scarcity. The best ones earn a 30-60 percent open rate on launch.",
    whenToUse:
      "Pre-launch (no product live yet). Mid-launch (capped cohort capacity). Post-launch (re-engagement waitlist for sold-out batches).",
    whenNotToUse:
      "When the product is already live and self-serve. Forcing a waitlist on a launchable product wastes momentum.",
    examples: [
      {
        pattern: "Single Email Field",
        formula:
          "<H1: 'Coming soon'> + <2-line description> + <single email field + submit>",
        example:
          "'Coming soon: a 90-second diagnostic for indie SaaS post-launch. Get the launch email.' + email field",
        notes:
          "Lowest friction. Best for top-of-funnel awareness lists.",
      },
      {
        pattern: "Named-Cohort Waitlist",
        formula:
          "<H1: '<Named cohort> early access'> + email + cohort dropdown",
        example:
          "'Indie SaaS founder early access. We're letting in 500 founders this quarter.' + email + 'I'm a [post-launch / pre-launch / agency]' dropdown.",
        notes:
          "Cohort dropdown segments at signup. Higher launch-day open rate.",
      },
      {
        pattern: "Scarcity Counter",
        formula:
          "<H1: '<N> spots remaining'> + email + counter that decrements.",
        example:
          "'247 / 500 founder spots taken. Reserve yours.' + email field + live counter.",
        notes:
          "Real counter only. Fabricated 'spots remaining' gets noticed within 48 hours.",
      },
      {
        pattern: "Story Waitlist",
        formula:
          "<Founder story> + 'Want the launch email?' + email field",
        example:
          "Founder photo + 'I'm building this because my own launch flatlined for 6 weeks. Want to be on the launch email list?' + email.",
        notes:
          "Story-led waitlist. Higher launch-day conversion; harder to scale via paid ads.",
      },
      {
        pattern: "Free Asset Waitlist",
        formula:
          "<H1>: 'Get the <named asset> + the launch email'.",
        example:
          "'Get the 12-pattern hero headline swipe file + the launch email for the diagnostic tool.' + email.",
        notes:
          "Pairs the waitlist with a free asset. Higher signup rate; lower launch-day conversion (some signups just wanted the asset).",
      },
      {
        pattern: "Pre-Order Waitlist",
        formula:
          "<H1>: 'Pre-order at <discount price>'. + payment field.",
        example:
          "'Pre-order the playbook at $19 (launch price will be $49).' + Stripe checkout.",
        notes:
          "Pre-order with payment. Highest signal of intent; lowest signup volume.",
      },
      {
        pattern: "Referral Waitlist",
        formula:
          "<H1>: 'You're #<N> on the list. Move up by referring.'",
        example:
          "'You're #247 on the list. Refer 3 friends to move to the top.'",
        notes:
          "Referral mechanic borrowed from Robinhood / Superhuman. Build viral coefficient pre-launch.",
      },
      {
        pattern: "Drop Schedule Waitlist",
        formula:
          "<H1>: 'Next drop: <date>'. + email.",
        example:
          "'Next drop: June 1, 12pm ET. Get notified.' + email.",
        notes:
          "Drop-based waitlist (cohorts, batched). Earns urgency without fabricating scarcity.",
      },
      {
        pattern: "Application Waitlist",
        formula:
          "<H1>: 'Apply for early access'. + 3-question form.",
        example:
          "'Apply for early access. 3 questions, 60 seconds.' + form (email, URL of live page, current state).",
        notes:
          "Application instead of signup. Filters for high-intent. Lower signup volume; higher launch conversion.",
      },
      {
        pattern: "ZIP-Code-Style Filter",
        formula:
          "<H1> + email + 1-question filter ('Do you have <X>?').",
        example:
          "'For founders with a live page. Do you have a live page? [yes/no]' + email if yes.",
        notes:
          "Single-question filter pre-signup. Disqualifies the wrong cohort honestly.",
      },
      {
        pattern: "Founders-Only List",
        formula:
          "<H1>: 'Founders-only list (verified)'. + email + LinkedIn / domain check.",
        example:
          "'Founders-only list. Verified via your email domain or LinkedIn.' + email.",
        notes:
          "Identity-verified list. Smaller; higher per-signup engagement.",
      },
      {
        pattern: "Cohort-Sized Waitlist With Public Tracker",
        formula:
          "<H1>: 'Cohort <N> of 1000'. + public tracker page link.",
        example:
          "'Cohort: 247 / 1000 founders.' Link: 'See the public tracker / member list.'",
        notes:
          "Public-tracker waitlist with named members (with permission). Highest trust signal pre-launch.",
      },
    ],
    commonMistakes: [
      "Waitlist for a product that already exists and is live. Waste of momentum; just sell.",
      "Waitlist with no expectation of when the product ships. Buyers forget; launch-day opens are low.",
      "Counter that's static (always says '247 spots left'). Trust kill within days.",
      "Waitlist that requires more than 3 fields. Friction collapses signup rate without improving quality enough.",
      "Waitlist email sequence that's silent for 30+ days. Re-engagement at launch is much harder than expected.",
    ],
    faqs: [
      {
        q: "How long should a waitlist run before launch?",
        a: "30-90 days is the working range. Shorter than 30 doesn't accumulate enough volume; longer than 90 burns through the engagement window. Most successful indie launches hit 60-90 day waitlists.",
      },
      {
        q: "Should I send weekly updates to the waitlist?",
        a: "Yes. Silent waitlists open at 5-15 percent on launch day. Weekly updates with build-in-public progress keep open rates at 30-60 percent.",
      },
      {
        q: "Should the waitlist signup ask for more than email?",
        a: "Only one extra field, max. A cohort dropdown or a single qualifier question. More than that collapses signup rate without proportional quality lift.",
      },
    ],
    relatedGlossary: ["challenge"],
    brunsonLens: "Hook",
    lastVerified: LAST_VERIFIED,
  },

  // ---------------------------------------------------------------------
  // 20. Lead magnet opt-in
  // ---------------------------------------------------------------------
  {
    slug: "lead-magnet-optin",
    element: "lead magnet opt-in",
    elementPlural: "Lead magnet opt-ins",
    displayName: "Lead Magnet Opt-In Swipe File",
    metaTitle: "Lead Magnet Opt-In Swipe File (12 Asset Trade Patterns)",
    metaDescription:
      "Twelve lead magnet opt-in patterns indie SaaS founders use to trade an asset for an email. Named assets, instant delivery, no-spam framing.",
    tldr:
      "A lead magnet opt-in is a trade: visitor gives email, founder delivers a named asset. The patterns below win when the asset is specific enough that the visitor can imagine using it within 24 hours of receiving it. Generic 'ultimate guides' lose to specific checklists.",
    whenToUse:
      "When you have a real asset that matches the page's premise. When the audience reads the page but isn't ready to buy. When you want to seed an email list for a longer nurture cycle.",
    whenNotToUse:
      "When the asset is generic or rehashed. A weak asset earns a poisoned email; you'd rather have no email than a poisoned one.",
    examples: [
      {
        pattern: "Named Specific Asset",
        formula:
          "'<Specific named asset, including number>. Free.'",
        example:
          "'The 12-pattern hero headline swipe file. Free.'",
        notes:
          "Specific number, specific noun, free. Beats every 'ultimate guide to X' that's ever existed.",
      },
      {
        pattern: "Free + 24-Hour Use",
        formula:
          "<Asset> + 'use it in 24 hours' framing",
        example:
          "'The 30-day rewrite checklist. Use it tomorrow.'",
        notes:
          "Specific time-to-value framing. Buyers opt in faster when the asset is usable within their next work session.",
      },
      {
        pattern: "Asset + No-Spam Pledge",
        formula:
          "<Asset> + 'we won't spam you' specific pledge",
        example:
          "'The 12-pattern swipe file. One email per week, unsubscribe anytime.'",
        notes:
          "Specific frequency pledge. Beats vague 'no spam' promises which sound rehearsed.",
      },
      {
        pattern: "Asset + Cohort Filter",
        formula:
          "<Asset for specific cohort> + cohort question.",
        example:
          "'The SaaS landing page swipe file. Are you a [SaaS founder / agency / creator]?' + email after cohort selected.",
        notes:
          "Cohort filter at opt-in. Higher relevance of follow-up emails.",
      },
      {
        pattern: "Asset + Bonus",
        formula:
          "<Asset 1> + 'plus bonus: <asset 2>'.",
        example:
          "'The hero swipe file plus the 30-day email checklist.'",
        notes:
          "Stack at opt-in. Higher opt-in rate; risk of attracting freebie-seekers who'll never buy.",
      },
      {
        pattern: "Asset Inside The Page",
        formula:
          "Inline opt-in on the article page (not a modal): <embedded form> with <preview of asset>.",
        example:
          "Mid-article: 'The full swipe file (PDF + Notion template). Drop your email below to get the full version.'",
        notes:
          "Inline opt-in. Higher opt-in rate than sidebar / modal forms; pairs with content-heavy pages.",
      },
      {
        pattern: "Asset + Founder Note",
        formula:
          "<Founder photo> + 'I built this' note + asset offer.",
        example:
          "Maryan photo + 'I built this swipe file from 1,000+ SaaS landing pages. Drop your email to get it.' + email.",
        notes:
          "Personalizes the opt-in. Earns higher quality emails; lower volume.",
      },
      {
        pattern: "Two-Step Opt-In",
        formula:
          "Step 1: 'Want it?' (single-button click). Step 2: email field on next screen.",
        example:
          "'Yes, send me the swipe file →' (click) → 'Where should I send it?' (email field).",
        notes:
          "Two-step pattern. Higher opt-in conversion than single-form; classic LeadPages mechanic.",
      },
      {
        pattern: "Asset + Verifiable Specificity",
        formula:
          "<Asset> + <specific verifiable number>",
        example:
          "'The 12-pattern hero swipe file – built from teardowns of 1,000+ indie SaaS landing pages.'",
        notes:
          "Specific verifiable number. Builds credibility for the asset before the visitor opts in.",
      },
      {
        pattern: "Asset + Date Stamp",
        formula:
          "<Asset> + 'updated <month, year>'",
        example:
          "'The 12-pattern swipe file. Updated May 2026.'",
        notes:
          "Date stamp signals living maintenance. Beats undated 'guides' from 2019 that still circulate.",
      },
      {
        pattern: "Asset + Founder Use Case",
        formula:
          "<Asset> + 'I use this on <founder's own product>'.",
        example:
          "'The swipe file – I use this on the Unlock SaaS hero block. Here's the live version.'",
        notes:
          "Founder eats own dogfood. Strongest trust signal short of customer testimonials.",
      },
      {
        pattern: "Asset + Direct Delivery",
        formula:
          "<Asset> + 'delivered in 60 seconds, instantly.'",
        example:
          "'The swipe file – delivered in your inbox in under 60 seconds.'",
        notes:
          "Speed-of-delivery framing. Buyers expect instant; saying it explicitly removes the 'is this real?' doubt.",
      },
    ],
    commonMistakes: [
      "Lead magnet that's a 50-page generic PDF. Visitors download once and never open. Use a 1-2 page named asset instead.",
      "Opt-in that doesn't deliver the asset immediately. Buyers expect the asset in 60 seconds, not 'check your spam folder, sometimes it takes a day'.",
      "Lead magnet promised on the opt-in but not actually delivered. Single-strike trust kill; visitors tell their network.",
      "Lead magnet name that's vague ('Ultimate Guide to Landing Pages'). Specific name + number + cohort beats every superlative.",
      "Opt-in form with 4+ fields. Each extra field cuts opt-in rate by a meaningful percentage on top-of-funnel surfaces.",
    ],
    faqs: [
      {
        q: "What makes a good indie SaaS lead magnet?",
        a: "Specific, named, immediately usable. '12-pattern hero swipe file' beats 'guide to landing pages'. The asset should be small enough that the visitor uses it on the same day they download it.",
      },
      {
        q: "Should I gate every piece of content with a lead magnet?",
        a: "No. Gate the high-value differentiated assets (templates, checklists, frameworks). Leave the educational content (essays, teardowns) ungated. Mixed gating earns more long-term audience than full-gate or full-open.",
      },
      {
        q: "What's a healthy opt-in rate for a lead magnet?",
        a: "2-5 percent on top-of-funnel traffic, 5-15 percent on mid-funnel pages, 15-40 percent on inline mid-article opt-ins. Below 2 percent suggests the asset isn't specific enough; above 40 percent suggests freebie-seekers (which isn't always bad).",
      },
    ],
    relatedGlossary: ["soap-opera-sequence", "seinfeld-email"],
    brunsonLens: "Hook + Offer",
    lastVerified: LAST_VERIFIED,
  },
];

/**
 * Slug index for static-params generation. Frozen so callers can't mutate.
 */
export const SWIPE_FILE_SLUGS: readonly string[] = Object.freeze(
  SWIPE_FILE_ENTRIES.map((e) => e.slug),
);

/**
 * Lookup by slug. Returns undefined for unknown slugs so the route can
 * call notFound() directly.
 */
export function getSwipeFileBySlug(
  slug: string,
): SwipeFileEntry | undefined {
  return SWIPE_FILE_ENTRIES.find((e) => e.slug === slug);
}
