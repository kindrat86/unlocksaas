/**
 * /positioning/[slug] pSEO catalog — "how to position a [category] SaaS".
 *
 * Each entry applies the Brunson Hook overlay plus April-Dunford-style
 * positioning analysis to one indie SaaS category. Different intent from
 * /for (cohort vocabulary tuning) and /should-i-build (decision pages).
 * Positioning is about how to tell THE buyer THE story so they self-
 * select, in one specific category context.
 *
 * Schema: Article + FAQPage + BreadcrumbList. No HowTo because the
 * content is a framework application, not a sequence of steps.
 *
 * Brunson Hard-Rule:
 *   - No fabricated buyer profiles. Each entry names a real "best for"
 *     and a real "wrong fit" — the polarity surface is the trust moat.
 *   - Cross-links to the matching /category page so the positioning
 *     work resolves to the actual products in that category.
 *   - "Honest one-liner" examples are templated — no fabricated taglines
 *     attributed to real companies.
 */

import { CATEGORY_SLUGS } from "./categories";

export interface PositioningFaq {
  q: string;
  a: string;
}

export interface PositioningExample {
  /** Pattern title. */
  title: string;
  /** Templated example (use [BRACKETS] for slots). */
  template: string;
  /** What slot positions to fill. */
  slots: string;
}

export interface PositioningEntry {
  slug: string;
  /**
   * Slug of the category this positioning maps to (from
   * src/lib/categories.ts). Cross-links the /category/[slug] page.
   */
  categorySlug: string;
  /** Display name e.g. "How to position a payments SaaS". */
  displayName: string;
  metaTitle: string;
  metaDescription: string;
  /** Intro paragraph: 2-3 sentences. */
  intro: string;
  /** The buyer this category's products typically over-serve or under-serve. */
  marketContext: string;
  /** Sharpest "for whom" framing for this category. */
  forWhom: string;
  /** Sharpest "not for whom" framing. */
  notForWhom: string;
  /** The single biggest positioning trap in this category. */
  positioningTrap: string;
  /** The Brunson lens (Hook / Story / Offer) the positioning lives in. */
  brunsonLens: "hook" | "story" | "offer";
  /** Templated one-liner positioning examples. */
  oneLinerExamples: ReadonlyArray<PositioningExample>;
  /** The three axes to position on, in priority order. */
  positioningAxes: ReadonlyArray<{ axis: string; explanation: string }>;
  /** Why this is hard in this category specifically. */
  whyHard: ReadonlyArray<string>;
  /** Related glossary slugs. */
  relatedGlossary: ReadonlyArray<string>;
  /** Related niche slugs (cohort vocabulary). */
  relatedNiches: ReadonlyArray<string>;
  faqs: ReadonlyArray<PositioningFaq>;
  lastVerified: string;
}

export const POSITIONING_ENTRIES: ReadonlyArray<PositioningEntry> = [
  {
    slug: "how-to-position-a-payments-saas",
    categorySlug: "payments",
    displayName: "How to position a payments SaaS",
    metaTitle: "How to Position a Payments SaaS (Indie)",
    metaDescription:
      "Positioning frameworks for indie payments SaaS. The buyer types you can win, the trap of competing with Stripe head-on, and the honest one-liner templates.",
    intro:
      "Payments is the most over-positioned indie SaaS category because Stripe dominates the default. The trap is competing head-on; the win is naming a specific buyer Stripe under-serves and a specific job-to-be-done where the buyer pays for category-specific behavior, not for raw payment plumbing.",
    marketContext:
      "Stripe is the assumed default for 80%+ of indie SaaS buyers. Lemon Squeezy, Paddle, and Polar carve out merchant-of-record positioning. Everyone else needs a category-or-cohort wedge that Stripe will not optimize for.",
    forWhom:
      "Buyers who need behavior Stripe will not natively ship — global tax/VAT handling for non-US sellers, marketplace splits with KYC, niche payment methods, or built-in subscription billing semantics specific to one industry.",
    notForWhom:
      "Buyers with standard subscription SaaS payment needs. Trying to win the 'I just need to charge cards' segment from Stripe is a losing position.",
    positioningTrap:
      "Positioning as 'Stripe but easier' or 'Stripe but cheaper'. Stripe's developer experience is the moat; cheaper price does not flip that. The trap is fighting on the same axis Stripe wins on.",
    brunsonLens: "offer",
    oneLinerExamples: [
      {
        title: "Merchant-of-Record positioning",
        template: "[Product] is the [SPECIFIC SELLER TYPE]'s payment infrastructure — Merchant of Record handles [SPECIFIC PAIN] so you do not.",
        slots:
          "[SPECIFIC SELLER TYPE] = the buyer narrow enough to exclude Stripe's mainstream segment. [SPECIFIC PAIN] = the regulatory / tax / fraud burden the MoR model removes.",
      },
      {
        title: "Vertical-payments positioning",
        template: "[Product] is the payment layer for [VERTICAL] — [SPECIFIC BEHAVIOR] the [VERTICAL]'s workflow actually needs.",
        slots:
          "[VERTICAL] = the specific industry. [SPECIFIC BEHAVIOR] = the verticalized payment semantics (split deposits, milestone billing, etc.).",
      },
    ],
    positioningAxes: [
      {
        axis: "Seller profile",
        explanation:
          "The most defensible payments positioning starts with a specific seller type. Cross-border sellers, marketplace operators, creators, agencies — each has different payment-layer needs Stripe under-serves.",
      },
      {
        axis: "Regulatory / tax burden",
        explanation:
          "MoR positioning, sales tax compliance, VAT, 1099 handling — anywhere the seller is willing to pay 1-3% more to get the regulatory layer out of their head.",
      },
      {
        axis: "Industry-specific billing semantics",
        explanation:
          "Subscription with overage, usage-based metering, retainer + per-project, multi-currency at one anchor. Stripe supports these as primitives; verticalized payments tools package them.",
      },
    ],
    whyHard: [
      "Stripe ships new features at developer-platform velocity; any feature-based positioning gets eaten in 2-4 quarters.",
      "Buyers default to Stripe by reflex — the positioning has to overcome a known-default bias, not just be 'good'.",
      "Cost positioning is a death spiral. Payments tools that lead with 'cheaper than Stripe' have terrible margins and rarely survive Year Two.",
    ],
    relatedGlossary: ["offer", "weak-offer", "wrong-person"],
    relatedNiches: ["saas-founders", "indie-hackers", "ecommerce", "info-product-creators"],
    faqs: [
      {
        q: "Can I position around 'Stripe alternative'?",
        a: "Only with a specific qualifier — 'Stripe alternative for X seller type' or 'Stripe alternative without Y burden'. Generic 'Stripe alternative' is the trap. The qualifier carries the positioning.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "how-to-position-a-forms-saas",
    categorySlug: "forms",
    displayName: "How to position a forms SaaS",
    metaTitle: "How to Position a Forms SaaS (Indie)",
    metaDescription:
      "Positioning frameworks for indie forms SaaS. Why competing with Typeform on UX is a losing game, and the buyer profiles that actually convert.",
    intro:
      "Forms is a category where Typeform set the design ceiling and Tally undercut on price. New entrants get squeezed unless they pick a specific buyer or specific form-job-to-be-done that neither of the leaders optimizes for.",
    marketContext:
      "Typeform owns the conversational forms category. Tally is the indie-priced default. Google Forms owns free + simple. New positioning has to name a specific buyer the three giants under-serve.",
    forWhom:
      "Buyers with form-job-to-be-done that requires specific behavior — embedded forms with rich logic, internal tools with row-level permissions, multi-step workflows with payment integration.",
    notForWhom:
      "Buyers who 'just need a survey'. The three leaders win that bucket; new entrants compete at a disadvantage on price and brand.",
    positioningTrap:
      "Competing on UI / animation / conversational feel. Typeform's brand recognition is the moat in that segment; new entrants spend marketing budget on a position they cannot defend.",
    brunsonLens: "hook",
    oneLinerExamples: [
      {
        title: "Workflow-form positioning",
        template: "[Product] is the form layer for [WORKFLOW] — [SPECIFIC LOGIC] you cannot get from a survey tool.",
        slots:
          "[WORKFLOW] = the operational workflow (intake, onboarding, scheduling, multi-step approval). [SPECIFIC LOGIC] = the conditional / integration / data behavior that workflow needs.",
      },
      {
        title: "Internal-tool positioning",
        template: "[Product] is the no-code form layer your [TEAM] can build — [SPECIFIC PERMISSION] without engineering.",
        slots:
          "[TEAM] = the named internal team. [SPECIFIC PERMISSION] = the row-level / role-based access control that makes it internal-tool-grade.",
      },
    ],
    positioningAxes: [
      {
        axis: "Job-to-be-done specificity",
        explanation:
          "The strongest forms positioning names the workflow, not the form type. 'Forms for [agency intake]' beats 'forms for surveys' every time.",
      },
      {
        axis: "Integration depth",
        explanation:
          "Forms that write to a specific destination (Notion, Airtable, internal database) win specific buyers the survey tools cannot.",
      },
      {
        axis: "Permissions and team behavior",
        explanation:
          "Forms with row-level permissions or team review workflows are a different product than consumer surveys. Position there if you can build there.",
      },
    ],
    whyHard: [
      "The 'free' anchor (Google Forms) sets buyer expectations on simple cases.",
      "Typeform's UI / animation lock costs 6+ months to match — and matching does not yield positioning.",
      "Buyers do not search for 'forms' generically; they search by their workflow. Positioning has to win those workflow queries.",
    ],
    relatedGlossary: ["hook", "wrong-person"],
    relatedNiches: ["agency-owners", "consultants", "saas-founders"],
    faqs: [
      {
        q: "Should we lead with 'easier than Typeform' as positioning?",
        a: "No. 'Easier than X' is the weakest positioning axis — buyers do not pay for easier, they pay for outcomes. Lead with the specific outcome or buyer the easier UX unlocks.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "how-to-position-an-analytics-saas",
    categorySlug: "analytics",
    displayName: "How to position an analytics SaaS",
    metaTitle: "How to Position an Analytics SaaS (Indie)",
    metaDescription:
      "Positioning frameworks for indie analytics SaaS. The traps with privacy and product-analytics positioning, and the buyer profiles that work.",
    intro:
      "Analytics is split into three sub-categories with different rules: web analytics (Plausible, Fathom), product analytics (PostHog, Mixpanel), and BI / data warehousing. Pre-revenue indie SaaS analytics tools usually fall into the first two; positioning has to pick a sub-category cleanly and win it.",
    marketContext:
      "Web analytics is consolidated around 'simple + privacy' (Plausible) vs 'Google free + complex' (GA4). Product analytics is dominated by PostHog open-source + Mixpanel commercial. Pre-revenue indie tools need a clear sub-category and clear buyer.",
    forWhom:
      "Buyers who already chose a sub-category and want a specific buyer-axis differentiator: simpler UI, GDPR-default, self-host, founder-friendly pricing.",
    notForWhom:
      "Enterprise buyers, agencies serving multi-tenant analytics, or anyone willing to live with GA4. New analytics tools cannot win those segments at pre-revenue scale.",
    positioningTrap:
      "Positioning as 'better than GA' without a specific differentiator. 'Better' is too vague; 'simpler', 'GDPR-default', 'open-source', or 'one-page-summary-for-founders' are specific enough to position on.",
    brunsonLens: "hook",
    oneLinerExamples: [
      {
        title: "Privacy-first positioning",
        template: "[Product] is [WEB / PRODUCT] analytics without [TRACKING / COOKIE / DATA] — [SPECIFIC PRIVACY MECHANISM] by default.",
        slots:
          "[WEB / PRODUCT] = sub-category. [TRACKING / COOKIE / DATA] = the negative axis. [SPECIFIC PRIVACY MECHANISM] = e.g. 'no cookies', 'EU-hosted'.",
      },
      {
        title: "Founder-friendly positioning",
        template: "[Product] is the [SUB-CATEGORY] analytics one founder actually opens — [SPECIFIC SIMPLICITY] on the [SPECIFIC SCREEN].",
        slots:
          "[SPECIFIC SIMPLICITY] = e.g. 'one screen', 'no setup'. [SPECIFIC SCREEN] = e.g. 'morning dashboard'.",
      },
    ],
    positioningAxes: [
      {
        axis: "Sub-category clarity",
        explanation:
          "Pre-revenue tools must pick web vs product vs BI cleanly. Hybrid positioning ('the analytics tool that does both') almost always loses on focus.",
      },
      {
        axis: "Buyer simplicity tolerance",
        explanation:
          "Founder-grade simple vs engineer-grade flexible is a real axis. Pick one; do not try to win both.",
      },
      {
        axis: "Compliance posture",
        explanation:
          "GDPR-default, no-cookies, EU-hosted, SOC2-default — these are concrete positioning surfaces for buyers in regulated geographies or industries.",
      },
    ],
    whyHard: [
      "GA4 is free and good-enough for most buyers — every analytics tool competes against zero.",
      "Buyer fatigue: most indie SaaS founders have already chosen and integrated an analytics tool by the time they would buy a new one.",
      "Switching cost is high. Even excellent analytics tools struggle to displace 'already integrated'.",
    ],
    relatedGlossary: ["hook"],
    relatedNiches: ["saas-founders", "indie-hackers", "no-code-builders"],
    faqs: [
      {
        q: "Should we position around AI-powered insights?",
        a: "Cautiously. 'AI-powered analytics' is a positioning that ages fast — within 12 months every analytics tool will claim it. Anchor on the specific output the AI produces (e.g. 'weekly written summary', 'anomaly alerts') rather than the AI itself.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "how-to-position-a-newsletter-saas",
    categorySlug: "newsletter",
    displayName: "How to position a newsletter SaaS",
    metaTitle: "How to Position a Newsletter SaaS (Indie)",
    metaDescription:
      "Positioning frameworks for indie newsletter SaaS. Why competing with Substack on community is the trap, and the buyer profiles that work.",
    intro:
      "Newsletter SaaS is in its second major positioning phase: Substack built brand around creators-and-community; Beehiiv won on monetization tooling; Ghost on open-source. New entrants have to pick a third axis — niche-vertical, deliverability, or a specific monetization shape — to win.",
    marketContext:
      "Three category leaders: Substack (community + brand), Beehiiv (monetization + growth), Ghost (open-source + portability). New entrants compete against the buyer's reflex to pick one of those three.",
    forWhom:
      "Operators who have a clear monetization plan (paid newsletter, sponsorships at scale, products) and care more about specific deliverability or workflow behavior than community brand.",
    notForWhom:
      "Operators starting from zero subscribers who would benefit from Substack's network effects, or operators valuing community-first features.",
    positioningTrap:
      "Positioning as 'Substack but without the cut'. Beehiiv already owns that position and has a 2-year head start. New entrants need a third axis.",
    brunsonLens: "story",
    oneLinerExamples: [
      {
        title: "Vertical-newsletter positioning",
        template: "[Product] is the newsletter platform for [VERTICAL] — [SPECIFIC FEATURE] the [VERTICAL] actually needs.",
        slots:
          "[VERTICAL] = e.g. local newsletters, journalism, B2B sponsorships. [SPECIFIC FEATURE] = ad-network, regional ad targeting, niche workflow.",
      },
      {
        title: "Deliverability-first positioning",
        template: "[Product] is the newsletter platform with [SPECIFIC DELIVERABILITY MECHANISM] — [METRIC] better than [BASELINE].",
        slots:
          "[SPECIFIC DELIVERABILITY MECHANISM] = e.g. 'per-publication sending domain', 'native warm-up'. [METRIC] = e.g. inbox placement rate.",
      },
    ],
    positioningAxes: [
      {
        axis: "Monetization shape",
        explanation:
          "Paid-subscription, sponsorship-marketplace, e-commerce-on-newsletter — each is a different positioning. Pick one.",
      },
      {
        axis: "Vertical specificity",
        explanation:
          "Local newsletters, B2B trade publications, niche creator categories — each has different needs. Vertical newsletter SaaS is a real, defensible position.",
      },
      {
        axis: "Portability and ownership",
        explanation:
          "Ghost-style portability + open-source positioning works for the operator subset that values long-term independence over network effects.",
      },
    ],
    whyHard: [
      "Network effects favor incumbents — Substack's network and Beehiiv's recommendation network are difficult to match.",
      "Operators are sticky once they have 1,000+ subscribers; switching cost is high.",
      "Email deliverability is a constant battle, regardless of tooling — positioning on deliverability requires evidence, not claims.",
    ],
    relatedGlossary: ["story", "soap-opera-sequence", "dream-100"],
    relatedNiches: ["newsletter-operators", "info-product-creators"],
    faqs: [
      {
        q: "Should we position on 'easier than Substack'?",
        a: "No. Ease is not a position; it is a feature. Position on the specific operator type or monetization shape that ease unlocks.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "how-to-position-a-scheduling-saas",
    categorySlug: "scheduling",
    displayName: "How to position a scheduling SaaS",
    metaTitle: "How to Position a Scheduling SaaS (Indie)",
    metaDescription:
      "Positioning frameworks for indie scheduling SaaS. The traps with simple-vs-flexible, and the buyer profiles that work against Calendly's default position.",
    intro:
      "Scheduling SaaS has consolidated around Calendly (commercial default) and Cal.com (open-source challenger). Pre-revenue indie tools have to either pick a vertical (medical, legal, coaching) or pick a specific scheduling-job-to-be-done (interview scheduling, large-group coordination) — generic positioning loses.",
    marketContext:
      "Calendly is the assumed default. Cal.com is the open-source alternative. SavvyCal and TidyCal serve smaller indie segments. New entrants must pick a vertical or a specific scheduling job to win.",
    forWhom:
      "Buyers with vertical-specific scheduling needs (HIPAA, multi-resource booking, conditional availability) or job-specific needs (interview loops, large-group coordination) that the general-purpose tools handle poorly.",
    notForWhom:
      "Solo professionals who 'just need a booking link'. Calendly free + Cal.com free cover that segment competitively.",
    positioningTrap:
      "Positioning as 'simpler than Calendly' or 'cheaper than Calendly'. Both are easy to dismiss without a verticalized or job-specific reason to switch.",
    brunsonLens: "offer",
    oneLinerExamples: [
      {
        title: "Vertical-scheduling positioning",
        template: "[Product] is the scheduling tool for [VERTICAL] — [SPECIFIC COMPLIANCE / WORKFLOW] built in.",
        slots:
          "[VERTICAL] = e.g. medical, legal, mental health, education. [SPECIFIC COMPLIANCE / WORKFLOW] = HIPAA, multi-resource, parent-coordination.",
      },
      {
        title: "Job-specific scheduling positioning",
        template: "[Product] schedules [SPECIFIC JOB] — [JOB-SPECIFIC BEHAVIOR] no generic tool ships.",
        slots:
          "[SPECIFIC JOB] = e.g. interview loops, customer onboarding, sales-handoff calls. [JOB-SPECIFIC BEHAVIOR] = the workflow primitives that job needs.",
      },
    ],
    positioningAxes: [
      {
        axis: "Vertical compliance",
        explanation:
          "HIPAA, GDPR-strict, COPPA, education — vertical scheduling needs compliance baked in. This is a defensible position for new entrants.",
      },
      {
        axis: "Job-specific workflow",
        explanation:
          "Interview scheduling, sales handoff, multi-resource booking — each is a specific job that justifies a specific tool.",
      },
      {
        axis: "Embedding and white-label",
        explanation:
          "Marketplaces and white-label platforms need scheduling embeds with row-level permissions and per-tenant branding. This is a real position.",
      },
    ],
    whyHard: [
      "Calendly's brand recognition is the default for 'send me a booking link'.",
      "Calendars are a high-trust integration — buyers are reluctant to switch the tool that touches their work calendar.",
      "The generic 'better Calendly' position is crowded with retired attempts.",
    ],
    relatedGlossary: ["offer", "wrong-person"],
    relatedNiches: ["coaches", "consultants", "agency-owners"],
    faqs: [
      {
        q: "Should we lead with 'open source' as positioning?",
        a: "Only if your buyer cares about open source as an outcome (data portability, self-hosting, audit). For most buyers, open source is a feature, not a positioning. Pair it with the buyer-axis differentiator.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "how-to-position-an-email-api-saas",
    categorySlug: "email-api",
    displayName: "How to position an email API SaaS",
    metaTitle: "How to Position an Email API SaaS (Indie)",
    metaDescription:
      "Positioning frameworks for indie email API SaaS. Why competing with SendGrid on volume is the trap, and the developer-first wedges that work.",
    intro:
      "The email API market is split between enterprise-incumbent (SendGrid, Mailgun) and developer-first new entrants (Resend, Postmark, Loops). Pre-revenue tools either pick a developer-experience wedge or a deliverability-niche wedge — volume positioning loses without enterprise infrastructure.",
    marketContext:
      "SendGrid and Mailgun own enterprise volume. Resend won developer-first transactional. Postmark owns transactional deliverability reputation. Loops owns developer-friendly marketing email.",
    forWhom:
      "Developers and indie founders who care about API ergonomics, default deliverability, and modern documentation more than maximum volume pricing.",
    notForWhom:
      "Enterprise buyers with compliance + dedicated-IP + reserved-volume needs. New entrants cannot win that segment at indie scale.",
    positioningTrap:
      "Positioning as 'SendGrid alternative' without a specific wedge. The wedge is the entire position.",
    brunsonLens: "offer",
    oneLinerExamples: [
      {
        title: "Developer-experience positioning",
        template: "[Product] is email APIs for [DEVELOPER TYPE] — [SPECIFIC DX] in [SPECIFIC LANGUAGE / FRAMEWORK].",
        slots:
          "[DEVELOPER TYPE] = e.g. React developers, Python developers, no-code founders. [SPECIFIC DX] = three-line setup, typed clients, framework-native templates.",
      },
      {
        title: "Deliverability-niche positioning",
        template: "[Product] is the email API for [VOLUME / VERTICAL] — [SPECIFIC DELIVERABILITY MECHANISM] beats [BASELINE TOOL].",
        slots:
          "[VOLUME / VERTICAL] = e.g. low-volume transactional, regulated industry. [SPECIFIC DELIVERABILITY MECHANISM] = per-sender warm-up, IP reputation, dedicated.",
      },
    ],
    positioningAxes: [
      {
        axis: "Developer experience",
        explanation:
          "Three-line setup, typed clients, framework-native templates, modern docs. Developer-first email APIs win on this axis.",
      },
      {
        axis: "Email type specificity",
        explanation:
          "Transactional vs marketing vs broadcast — each has different infrastructure needs. Specialize.",
      },
      {
        axis: "Deliverability reputation",
        explanation:
          "Postmark won on inbox-placement reputation. New entrants can position on per-sender warm-up, native DMARC, etc.",
      },
    ],
    whyHard: [
      "Email deliverability requires evidence, not claims. Positioning on deliverability without published numbers is weak.",
      "Switching cost is high — every customer has integrated webhook handlers, templates, and template-rendering pipelines.",
      "The space is increasingly developer-tooled — new entrants competing on price alone do not have a defensible wedge.",
    ],
    relatedGlossary: ["seinfeld-email", "soap-opera-sequence"],
    relatedNiches: ["saas-founders", "indie-hackers", "newsletter-operators"],
    faqs: [
      {
        q: "Should we position around React Email or framework integration?",
        a: "Yes if your buyer is React-default. Framework-specific positioning is a strong wedge because it makes integration trivial. The risk is being framework-locked when the buyer's framework choice changes.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "how-to-position-a-docs-saas",
    categorySlug: "docs",
    displayName: "How to position a developer-docs SaaS",
    metaTitle: "How to Position a Developer-Docs SaaS (Indie)",
    metaDescription:
      "Positioning frameworks for indie developer-docs SaaS. The traps with 'better Docusaurus' positioning, and the buyer profiles that work.",
    intro:
      "Developer-docs SaaS sits between open-source (Docusaurus, MkDocs) and full-product (GitBook, Mintlify). Pre-revenue indie tools have to pick a specific docs-job-to-be-done — API docs, internal docs, customer-facing knowledge base — and win there. Generic 'better than Docusaurus' loses to free.",
    marketContext:
      "Open-source (Docusaurus, MkDocs) sets the price floor at zero. Mintlify and GitBook own the commercial mid-market. ReadMe owns API-specific docs. New positioning has to pick a docs-job-to-be-done.",
    forWhom:
      "Developer teams whose docs need a specific behavior (interactive API explorer, AI-powered search, multi-product docs portal) the generic tools do not ship.",
    notForWhom:
      "Open-source maintainers content with Docusaurus, or teams whose docs are 'good enough' on a static site generator.",
    positioningTrap:
      "Positioning as 'better Docusaurus'. Free tools cannot be undercut on price; new entrants need a behavioral differentiator the free tools cannot match.",
    brunsonLens: "story",
    oneLinerExamples: [
      {
        title: "Job-specific docs positioning",
        template: "[Product] is [JOB] docs for [DEVELOPER TYPE] — [SPECIFIC BEHAVIOR] built in.",
        slots:
          "[JOB] = e.g. API docs, integration docs, customer-facing knowledge base. [SPECIFIC BEHAVIOR] = interactive playground, AI search, version-pinned snippets.",
      },
      {
        title: "AI-augmented docs positioning",
        template: "[Product] is the docs platform [DEVELOPER TYPE] writes with AI and [STAKEHOLDER] reads with AI — [SPECIFIC AI BEHAVIOR].",
        slots:
          "[DEVELOPER TYPE] = e.g. small engineering teams. [STAKEHOLDER] = e.g. customer support agents, AI assistants. [SPECIFIC AI BEHAVIOR] = chat-with-docs, suggested-edits, auto-generated examples.",
      },
    ],
    positioningAxes: [
      {
        axis: "Docs-job-to-be-done",
        explanation:
          "API docs, integration docs, customer KB, internal docs — different jobs justify different tools. Pick one.",
      },
      {
        axis: "AI affordances",
        explanation:
          "Chat-with-docs, AI-generated examples, AI-augmented search — these are real positioning surfaces in 2026.",
      },
      {
        axis: "Brand and design",
        explanation:
          "Mintlify won partly on visual polish. New entrants can compete here, but the bar is high — visual differentiation is expensive to maintain.",
      },
    ],
    whyHard: [
      "Open-source tools (Docusaurus, MkDocs) are good enough for most teams. Free is hard to beat.",
      "Switching docs platforms means migrating content, redirects, and build pipelines. High switching cost favors incumbents.",
      "AI-augmented docs is a category that will consolidate fast — positioning here in 2026 needs a long-term defensible angle.",
    ],
    relatedGlossary: ["story"],
    relatedNiches: ["saas-founders", "indie-hackers"],
    faqs: [
      {
        q: "Should we position around 'docs as a sales asset'?",
        a: "Only with a specific mechanism (lead capture in code samples, sales-team-edited explainers). Generic 'docs convert' positioning is too vague. The specific mechanism is the position.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "how-to-position-a-testimonials-saas",
    categorySlug: "testimonials",
    displayName: "How to position a testimonials SaaS",
    metaTitle: "How to Position a Testimonials SaaS (Indie)",
    metaDescription:
      "Positioning frameworks for indie testimonials / social-proof SaaS. The traps with 'just collect testimonials' positioning, and the buyer profiles that work.",
    intro:
      "Testimonials SaaS in 2026 has split: simple collection (Senja, Testimonial.to) versus full social-proof workflow (Wall of Love, integrated marketing). Pre-revenue indie tools have to pick which side and own one specific testimonial-job-to-be-done — generic 'collect testimonials' positioning loses to Google Forms + a copy-paste workflow.",
    marketContext:
      "Senja owns the indie founder default. Testimonial.to owns video-first. New positioning has to name a specific testimonial workflow or audience the leaders under-serve.",
    forWhom:
      "Buyers running a specific outreach motion (post-purchase asks, milestone-triggered asks, NPS-triggered conversion) where the testimonial workflow has more value than the testimonial form alone.",
    notForWhom:
      "Founders with 0-10 customers. The testimonial tool is not the constraint at that volume; a Google Form and copy-paste handle it.",
    positioningTrap:
      "Positioning as 'easier than Senja' or 'cheaper than Testimonial.to'. Easier and cheaper are not positions; the workflow specificity is.",
    brunsonLens: "story",
    oneLinerExamples: [
      {
        title: "Workflow-trigger positioning",
        template: "[Product] collects [TESTIMONIAL TYPE] at [SPECIFIC MOMENT] — [INTEGRATION] triggered, not asked.",
        slots:
          "[TESTIMONIAL TYPE] = text, video, audio, review. [SPECIFIC MOMENT] = e.g. post-purchase day 14, post-milestone, NPS-9+. [INTEGRATION] = Stripe, Segment, the workflow tool that triggers the ask.",
      },
      {
        title: "Verified-outcome positioning",
        template: "[Product] is testimonials with [SPECIFIC VERIFICATION] — every quote backed by [VERIFIABLE DETAIL].",
        slots:
          "[SPECIFIC VERIFICATION] = e.g. Stripe-confirmed outcome, signed video release, named-company. [VERIFIABLE DETAIL] = the artifact a quality rater can check.",
      },
    ],
    positioningAxes: [
      {
        axis: "Workflow trigger",
        explanation:
          "Trigger-based testimonial collection (post-purchase, milestone, NPS) is a different product than form-based collection. Specialize on the trigger you own.",
      },
      {
        axis: "Verification depth",
        explanation:
          "Verified-outcome testimonials carry more weight than collected-quote testimonials. Position on the verification mechanism if you can build it.",
      },
      {
        axis: "Display format",
        explanation:
          "Wall-of-love embeds vs case-study generators vs review-platform syndication — each is a different position.",
      },
    ],
    whyHard: [
      "Senja's brand is the default for indie founders; new entrants overcome the known-default bias.",
      "The 'just send a Google Form' alternative is hard to beat for low-volume buyers.",
      "Testimonial quality depends on the asking workflow more than the tool; positioning on the tool alone is weak.",
    ],
    relatedGlossary: ["story", "verified-builder", "weak-belief"],
    relatedNiches: ["agency-owners", "consultants", "saas-founders"],
    faqs: [
      {
        q: "Should we position around 'video-first testimonials'?",
        a: "Only if you have a video-specific differentiator beyond Testimonial.to. Video-first as a generic position is occupied. Pair it with a workflow or audience-specific wedge.",
      },
    ],
    lastVerified: "2026-05-19",
  },
];

export const POSITIONING_SLUGS: ReadonlyArray<string> = POSITIONING_ENTRIES.map(
  (e) => e.slug,
);

export function getPositioningBySlug(
  slug: string,
): PositioningEntry | undefined {
  return POSITIONING_ENTRIES.find((e) => e.slug === slug);
}

// Build-time guard: every categorySlug must exist in categories.ts.
{
  const known = new Set<string>(CATEGORY_SLUGS);
  for (const entry of POSITIONING_ENTRIES) {
    if (!known.has(entry.categorySlug)) {
      throw new Error(
        `positioning.ts: entry "${entry.slug}" references unknown category slug "${entry.categorySlug}". Add the category to categories.ts first, or correct the slug.`,
      );
    }
  }
}
