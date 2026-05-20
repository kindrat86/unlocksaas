/**
 * /stack-for/[niche] pSEO catalog – recommended indie SaaS stack per cohort.
 *
 * Intent class targeted:
 *   "saas stack for [niche]" / "what tools do [niche] need" /
 *   "[niche] tech stack" / "best tools for [niche]" /
 *   "indie [niche] stack 2026"
 *
 * Why this surface earns its own pattern (rather than living inside /for or
 * inside the per-tool /pricing-teardown pages):
 *   Stack-shopping intent is its own search behavior. A founder who has
 *   shipped and is wiring up the marketing layer is looking for an opinionated
 *   roster – not a single pricing teardown, not a generic listicle. This
 *   surface picks 6-8 tools from the existing pricing-teardown catalog,
 *   ordered by role in the funnel, and explains the role each one plays for
 *   that specific cohort. Every recommendation cross-links into the
 *   pricing-teardown page for that tool – the internal-link graph win is
 *   structural: each tool now has +14 inbound links from the stacks that
 *   include it.
 *
 * Brunson Hard-Rule reconciliation:
 *   - Only tools that already have a /pricing-teardown/[slug] entry can be
 *     recommended. If a tool is not in PRICING_TEARDOWN_SLUGS we cannot
 *     verify our own analysis of it, so we do not list it.
 *   - No fabricated MRR / revenue claims for any tool.
 *   - The "stack" is opinionated but optional – we do not claim it is the
 *     only stack that works. Each entry includes a "swap notes" field that
 *     names category-equivalent alternatives the founder might already use.
 *   - Pricing tier names track the pricing-teardown lastVerified dates;
 *     this catalog ships a `lastVerified` per stack independent of the
 *     underlying tool data.
 *
 * Scaling path: append entries. generateStaticParams + sitemap.ts auto-extend
 * exactly like /for/[slug] does.
 */

import { getNicheBySlug, type NicheEntry } from "@/lib/niches";
import {
  getPricingTeardownBySlug,
  type PricingTeardown,
} from "@/lib/pricing-teardowns";

/**
 * One tool slot in a stack. `slug` MUST resolve via getPricingTeardownBySlug –
 * the page renderer will skip entries whose slug does not resolve, but the
 * intent is that authoring time catches the typo.
 */
export interface StackTool {
  /** Must match a slug in src/lib/pricing-teardowns.ts. */
  slug: string;
  /** Role this tool plays in the funnel for THIS cohort, in 1 sentence. */
  role: string;
  /** Why this specific tool, not a generic alternative. 1-2 sentences. */
  why: string;
  /** Category-equivalent alternatives the founder might swap in. */
  swapNotes?: string;
}

export interface StackFaq {
  q: string;
  a: string;
}

export interface StackEntry {
  /** URL slug – matches a slug in src/lib/niches.ts. */
  slug: string;
  /** SEO meta title, under 60 chars. */
  metaTitle: string;
  /** SEO meta description, under 160 chars. */
  metaDescription: string;
  /** Hero subhead, ~30 words. */
  heroSubhead: string;
  /** 40-to-60 word TL;DR for AEO citation. */
  tldr: string;
  /** Intro: why this cohort needs this specific shape of stack. */
  whyThisStack: string;
  /** The recommended tools, in funnel order (top of funnel → back end). */
  tools: ReadonlyArray<StackTool>;
  /** Stage gate – when to ship the next tool, not the next one. */
  whatToBuildFirst: string;
  /** Common mistake when building this cohort's stack. */
  commonMistake: string;
  /** 3-to-5 FAQs founders in this cohort actually ask. */
  faqs: ReadonlyArray<StackFaq>;
  /** ISO date last verified. */
  lastVerified: string;
}

const VERIFIED = "2026-05-21";

export const STACK_ENTRIES: ReadonlyArray<StackEntry> = [
  // -- 1. course-creators --------------------------------------------------
  {
    slug: "course-creators",
    metaTitle: "The Indie SaaS Stack for Course Creators – Unlock SaaS",
    metaDescription:
      "Seven tools post-launch course creators actually need: newsletter, sales page, checkout, video, testimonials, analytics, and the workspace tying them together.",
    heroSubhead:
      "An opinionated 7-tool stack for course creators whose course is shipped but whose launch went flat. Newsletter, sales page, checkout, video, testimonials, analytics, and the workspace that ties them together.",
    tldr:
      "Course creators who skip the marketing stack rely on platform-built funnels (Teachable, Kajabi) that collapse pricing and proof into one box. The 7-tool indie stack splits the funnel into roles the founder owns: list (Beehiiv), page (Framer), checkout (Lemon Squeezy), VSL (Screen Studio), social proof (Senja), measurement (Plausible), and the workspace (Notion).",
    whyThisStack:
      "Course creators who try to run launch funnels inside a platform builder (Teachable, Kajabi, Thinkific) end up with an undifferentiated sales page, no portable email list, and platform-tax checkout. The indie stack splits each role into a tool the creator owns, which compounds across launches instead of collapsing into one vendor's UI.",
    tools: [
      {
        slug: "beehiiv",
        role: "Email list and launch sequence (top of funnel)",
        why: "Beehiiv is the modern Substack alternative built for newsletter operators who plan to sell their own products. Soap Opera Sequences, lead magnets, and segmentation are first-class – the launch sequence lives here.",
        swapNotes:
          "ConvertKit, Ghost, or Substack all work. Beehiiv has the cleanest growth toolkit out of the box.",
      },
      {
        slug: "framer",
        role: "Sales page and marketing site",
        why: "Course sales pages live or die on layout. Framer gives course creators design-grade pages without the Webflow learning curve, and the CMS handles testimonials, FAQ blocks, and curriculum modules cleanly.",
        swapNotes: "Webflow, Carrd, or a Next.js site if the creator is technical.",
      },
      {
        slug: "lemonsqueezy",
        role: "Checkout and Merchant of Record",
        why: "Lemon Squeezy handles VAT, EU tax compliance, and global payments out of the box – removing the operator tax that kills indie course launches. The order-bump and post-purchase upsell flows are first-class.",
        swapNotes: "Stripe direct works if you already have a tax accountant. Polar is the newer alternative.",
      },
      {
        slug: "screen-studio",
        role: "VSL and curriculum video production",
        why: "Course creators ship more video than any other indie cohort. Screen Studio's auto-zoom and cursor smoothing turn a raw recording into something that looks studio-shot – essential for the sales-page VSL and weekly curriculum updates.",
        swapNotes: "Loom for raw feedback recordings; Screen Studio for the public-facing video.",
      },
      {
        slug: "senja",
        role: "Testimonial collection and display",
        why: "The Reluctant-Hero proof pattern requires named, dated, specific testimonials. Senja's collection flow handles video, text, and import-from-anywhere, and the embed widgets drop onto a Framer page in one paste.",
        swapNotes: "Testimonial.to is the direct competitor with similar feature parity.",
      },
      {
        slug: "plausible",
        role: "Privacy-first launch analytics",
        why: "Course launches need conversion-funnel attribution without the GDPR overhead of GA4. Plausible's dashboard is built around the metric a course creator actually checks: did the launch email convert to checkout.",
        swapNotes: "Fathom is the direct alternative; same shape, slightly different pricing.",
      },
      {
        slug: "notion",
        role: "Curriculum workspace and operator hub",
        why: "Course creators run their entire backend (curriculum drafts, student tracking, launch sequencing) in one workspace. Notion's database flexibility absorbs all of it without forcing a stack-of-niche-tools sprawl.",
        swapNotes: "Airtable if you need stricter database semantics; Notion if you need flexible docs.",
      },
    ],
    whatToBuildFirst:
      "Beehiiv first, then Framer. The list is the only asset that compounds across launches – every other tool can be swapped without losing it. Set up the list, write the Soap Opera Sequence, then ship the sales page.",
    commonMistake:
      "Stacking the tools before the offer. A course creator with seven tools wired up and a Weak Offer diagnosis still has a flat launch. The Hook / Story / Offer work happens above the stack – the tools amplify whatever frame you already have.",
    faqs: [
      {
        q: "Do I need all seven tools to launch?",
        a: "No. Beehiiv plus a Framer (or Carrd) sales page plus Lemon Squeezy checkout is the minimum viable course launch stack – three tools. The other four lift conversion and compound over time but they are not blocking the first launch.",
      },
      {
        q: "What about Kajabi or Teachable?",
        a: "Platform builders work for first-time creators who want one bill and one dashboard. The indie stack costs roughly the same per month but gives you a portable email list, a sales page you can iterate on weekly, and checkout that doesn't take a platform cut. After your second launch, the indie stack pays for itself in conversion lift.",
      },
      {
        q: "Why Lemon Squeezy instead of Stripe?",
        a: "Lemon Squeezy is a Merchant of Record – they handle VAT, sales tax, and chargebacks. Stripe gives you raw payment rails but leaves tax compliance to you. For a one-person course business selling globally, the MoR overhead saving (and the order-bump flow) is worth the slightly higher transaction fee.",
      },
      {
        q: "Can I use this stack for a $97 mini-course AND a $1,997 cohort?",
        a: "Yes. The stack is price-tier agnostic. A $97 mini-course leans harder on Beehiiv + Lemon Squeezy (no sales call); a $1,997 cohort leans harder on Framer + Senja + Screen Studio (proof load is higher). The seven roles stay the same.",
      },
    ],
    lastVerified: VERIFIED,
  },

  // -- 2. agency-owners ---------------------------------------------------
  {
    slug: "agency-owners",
    metaTitle: "The Indie SaaS Stack for Agency Owners – Unlock SaaS",
    metaDescription:
      "Eight tools agency owners actually need: site, scheduling, proposals, async video, testimonials, analytics, billing, and project management.",
    heroSubhead:
      "An 8-tool stack for agency owners whose website attracts the wrong leads. Marketing site, booking, proposals, async demos, social proof, analytics, billing, and the project hub.",
    tldr:
      "Agencies that try to run everything inside one platform (HubSpot, Dubsado) end up paying for features they don't use while their actual differentiator (positioning and case studies) sits in a generic CRM template. The indie stack puts each role in a category-leading tool the agency owns: Framer, Cal.com, Notion, Loom, Senja, Plausible, Stripe, Asana.",
    whyThisStack:
      "Agencies need three things their stack must reflect: a positioning surface (the site), a qualification surface (the discovery call funnel), and a delivery surface (the project hub). The indie stack keeps each surface owned by a category-leading tool, which lets the agency niche down the homepage without re-platforming when a new vertical opens.",
    tools: [
      {
        slug: "framer",
        role: "Marketing site and positioning surface",
        why: "An agency homepage with three service categories converts price-shoppers. An agency homepage with one specific outcome for one specific cohort converts fit-leads. Framer's CMS makes the niching iteration painless – swap the homepage hero every two weeks until the discovery-call mix improves.",
        swapNotes: "Webflow, Carrd, or a custom Next.js site for technical agencies.",
      },
      {
        slug: "cal-com",
        role: "Discovery call scheduling",
        why: "Cal.com's open-source pricing is structurally the best deal among schedulers, and the round-robin team booking + Stripe charge-on-booking flow turns the discovery call into a qualified-lead filter automatically.",
        swapNotes: "Calendly or SavvyCal if you want closed-source polish.",
      },
      {
        slug: "notion",
        role: "Proposal docs and client-facing one-pagers",
        why: "Agency proposals live in shared docs. Notion's permissioning + commenting + embed-everywhere shape means proposals can be public links, gated rooms, or full client portals without switching tools.",
        swapNotes: "Google Docs works; Notion handles the case-study library + the active proposal in one place.",
      },
      {
        slug: "loom",
        role: "Async demo and proposal video",
        why: "Agencies that lead the discovery call with a 3-minute Loom walking through the prospect's site close at meaningfully higher rates than agencies that show up cold. Loom's transcript + analytics close the loop on whether the prospect actually watched.",
        swapNotes: "Screen Studio for polished short demos; Loom for daily async work.",
      },
      {
        slug: "senja",
        role: "Case study and testimonial library",
        why: "Agency case studies are the load-bearing proof for high-ticket sales. Senja's collection widgets get clients to record on their own time, and the export flow puts the named, dated, specific quote on the marketing site without manual copy-paste.",
        swapNotes: "Testimonial.to is the direct alternative.",
      },
      {
        slug: "plausible",
        role: "Marketing site analytics",
        why: "Privacy-first analytics that show the agency owner exactly which case study reads correlate with discovery-call bookings. The single-page dashboard is the right shape for a marketing site, not the kitchen sink GA4 ships.",
        swapNotes: "Fathom for the direct alternative.",
      },
      {
        slug: "stripe",
        role: "Retainer billing and invoicing",
        why: "Stripe Invoicing handles monthly retainers, project deposits, and ACH for US-based agency clients in one dashboard. The Stripe API also lets agencies wire a 'pay this proposal' button into Notion or the Framer site without a third-party billing tool.",
        swapNotes: "Lemon Squeezy or Polar for international clients to avoid VAT bookkeeping.",
      },
      {
        slug: "asana",
        role: "Client work and team project management",
        why: "Asana's project view is purpose-built for client-facing work where the deliverable list is the contract. Custom fields handle billable-vs-internal time, and the calendar view exposes capacity for sales conversations.",
        swapNotes: "ClickUp, Linear, or Monday if your team prefers their shape.",
      },
    ],
    whatToBuildFirst:
      "Framer + Cal.com + Senja. The site, the booking funnel, and the proof library are the three surfaces that decide whether discovery calls happen and whether they convert. Everything else is delivery-side and can be added when you sign your first retainer.",
    commonMistake:
      "Buying a CRM (HubSpot, Pipedrive) before the positioning is fixed. The CRM is the right tool when there are 50 active conversations to manage. At 5 conversations a month, the CRM template forces fake structure on a site that needs to first decide who it's selling to.",
    faqs: [
      {
        q: "Do I need a CRM?",
        a: "Probably not below $50K MRR. The indie stack handles every role a CRM bundles (proposals in Notion, bookings in Cal.com, billing in Stripe). A real CRM (HubSpot, Salesforce, Pipedrive) earns its keep when you have 5+ salespeople or 50+ active conversations. Below that, it's overhead masquerading as structure.",
      },
      {
        q: "How does this stack handle white-label work?",
        a: "Framer supports custom domains per site, so a sub-brand or white-label arm gets its own marketing surface. Notion's public-page feature handles client-facing deliverables under your brand or theirs. Stripe Connect handles split payments if you're reselling another service.",
      },
      {
        q: "Should agencies offer a productized service tripwire?",
        a: "Often yes. A paid audit at $500-$2,500 pre-qualifies leads and converts to engagements at meaningfully higher rates than free discovery calls. Lemon Squeezy or Stripe Checkout handles the tripwire purchase; Notion handles the audit delivery; Cal.com handles the consultation that follows.",
      },
      {
        q: "What about marketing automation?",
        a: "Agency marketing is high-touch and slow-cycle. Mailchimp or ConvertKit + a Notion list of warm contacts beats a marketing-automation platform for the first 24 months. Beehiiv or Substack works if you publish a newsletter as part of your positioning.",
      },
    ],
    lastVerified: VERIFIED,
  },

  // -- 3. saas-founders ---------------------------------------------------
  {
    slug: "saas-founders",
    metaTitle: "The Indie SaaS Stack for SaaS Founders – Unlock SaaS",
    metaDescription:
      "Seven tools post-launch pre-revenue SaaS founders actually need: hosting, payments, transactional email, analytics, project tracking, marketing site, social proof.",
    heroSubhead:
      "A 7-tool stack for SaaS founders whose product launched but whose dashboard is flat. Hosting, payments, transactional email, analytics, project tracking, marketing site, and the social proof layer.",
    tldr:
      "SaaS founders who ship the product but skip the marketing stack hit the post-launch wall: trial signups that don't activate, a marketing site that looks like the dashboard, and zero attribution. The 7-tool indie stack puts the operational backbone (Vercel, Stripe, Resend) under a category-leading marketing surface (Framer, Senja) with measurement (Plausible) and execution tracking (Linear).",
    whyThisStack:
      "SaaS founders typically over-engineer the product and under-build the funnel. This stack inverts the bias: the operational layer is fast and boring (Vercel, Stripe, Resend), the marketing layer is opinionated and high-design (Framer, Senja), and the loop closes through analytics (Plausible) and execution tracking (Linear).",
    tools: [
      {
        slug: "vercel",
        role: "Application and marketing site hosting",
        why: "Vercel's deploy-on-push + preview-URL-per-branch flow turns the marketing site into a iteratable surface, not a quarterly redesign project. Edge runtime + ISR + image optimization are operational defaults, not premium features.",
        swapNotes: "Render or Railway if you need long-running workers; Vercel for the frontend either way.",
      },
      {
        slug: "stripe",
        role: "Subscription billing and revenue infrastructure",
        why: "Stripe Billing handles trials, dunning, proration, and SCA out of the box. The Customer Portal removes the cancel-flow friction that protects retention but kills NPS. For B2B SaaS, Stripe Invoicing covers wire-transfer customers without re-platforming.",
        swapNotes: "Lemon Squeezy or Polar if you want MoR tax handling and don't need raw Stripe APIs.",
      },
      {
        slug: "resend",
        role: "Transactional email (signup, password reset, billing)",
        why: "Resend's React Email integration + clean API removes the SendGrid bloat without losing deliverability. Critical for SaaS where the welcome email and the password reset are the first product surfaces a user sees post-signup.",
        swapNotes: "Postmark is the closest direct alternative; SendGrid if you're on legacy infra.",
      },
      {
        slug: "plausible",
        role: "Privacy-first product and marketing analytics",
        why: "Most pre-revenue SaaS doesn't need full PostHog yet. Plausible's funnel view + goal tracking covers conversion-from-marketing-site through signup, and the privacy-first model removes the GDPR overhead.",
        swapNotes: "Fathom is the direct alternative; PostHog or Mixpanel if you need product analytics depth.",
      },
      {
        slug: "linear",
        role: "Engineering execution and bug tracking",
        why: "Linear's keyboard-first speed and Cycles model fit indie teams better than Jira or Asana. The GitHub integration closes the loop between issue tracking and code review without context-switching to a project management tool.",
        swapNotes: "ClickUp or Asana if you have a non-engineering team that lives in tasks.",
      },
      {
        slug: "framer",
        role: "Marketing site and launch surface",
        why: "SaaS marketing sites need to look like the product team takes design seriously. Framer hits that bar without a designer hire, and the CMS handles the changelog + case study + pricing comparison pages without re-platforming.",
        swapNotes: "Webflow, Carrd, or a Next.js site if you already own the design system.",
      },
      {
        slug: "senja",
        role: "Customer testimonial and case study collection",
        why: "Pre-revenue SaaS needs the first ten testimonials more than the first ten features. Senja's collection widgets ship into Slack, Intercom, or the in-app activation moment, and the import flow handles Twitter screenshots + LinkedIn quotes alongside structured collection.",
        swapNotes: "Testimonial.to is the direct alternative.",
      },
    ],
    whatToBuildFirst:
      "Vercel + Stripe + Resend before anything else. These three are the operational backbone – the marketing site, the billing flow, the auth/signup emails all depend on them. Skip the marketing-side tools until the first paid signup verifies the funnel hypothesis.",
    commonMistake:
      "Picking analytics tools that produce more dashboards than decisions. Pre-revenue SaaS rarely needs PostHog – it needs to know whether the marketing-site CTA gets clicked and whether trial signups activate. Plausible answers both, in one screen.",
    faqs: [
      {
        q: "Do I need PostHog or Mixpanel from day one?",
        a: "No. Below ~100 active trial users per month, full product analytics produces noise, not signal. Plausible covers conversion-from-marketing-site through signup; instrument PostHog or Mixpanel when activation/retention becomes the bottleneck.",
      },
      {
        q: "Should I run my SaaS on Edge / Fluid Compute or Node.js Lambda?",
        a: "Fluid Compute (Vercel's default) for most cases – it handles long-running tasks (300s default timeout) and reuses warm instances. Edge for auth checks and lightweight transforms only. The choice doesn't usually matter pre-revenue – pick what your framework defaults to.",
      },
      {
        q: "What about CRM or sales tools?",
        a: "Pre-revenue SaaS doesn't need a CRM. Notion or Linear plus a shared inbox handles the first 50 conversations. Add HubSpot or Pipedrive when the sales motion crosses 10+ active opportunities monthly.",
      },
      {
        q: "Should I use Stripe direct or a Merchant of Record like Lemon Squeezy?",
        a: "Depends on geography. Stripe direct if your customers are mostly US-based or you have an accountant handling VAT/sales tax. Lemon Squeezy or Polar if you sell globally and want VAT/EU compliance bundled. The MoR fee is usually worth it for a solo founder selling outside North America.",
      },
    ],
    lastVerified: VERIFIED,
  },

  // -- 4. coaches ---------------------------------------------------------
  {
    slug: "coaches",
    metaTitle: "The Indie SaaS Stack for Coaches – Unlock SaaS",
    metaDescription:
      "Seven tools post-launch coaches actually need: scheduling, sales page, checkout, async video, social proof, list-building, and the client workspace.",
    heroSubhead:
      "A 7-tool stack for coaches whose practice is live but whose calendar is empty. Booking, sales page, checkout, async video, social proof, list, and the client workspace.",
    tldr:
      "Coaches who try to run everything inside Acuity or Practice Better end up with a generic sales page and a hidden client roster. The 7-tool indie stack splits the funnel into roles the coach owns – Cal.com for booking, Framer for the sales page, Lemon Squeezy for high-ticket checkout, Screen Studio for the Reluctant-Hero VSL, Senja for transformations, Beehiiv for the list, Notion for the client workspace.",
    whyThisStack:
      "Coaches sell transformations, not credentials. The stack has to amplify proof of transformation (Senja, Screen Studio), reduce booking friction (Cal.com), and remove checkout drop-off on the high-ticket package (Lemon Squeezy). Generic coaching platforms (Practice Better, Paperbell) collapse all of this into one undifferentiated UI.",
    tools: [
      {
        slug: "cal-com",
        role: "Discovery call and session booking",
        why: "Cal.com's free tier handles the booking volume of most pre-revenue coaching practices, and the team/round-robin flow handles group programs. Paid-booking via Stripe integration filters tire-kickers automatically.",
        swapNotes: "Calendly is the closed-source alternative; SavvyCal for prospect-friendly time selection.",
      },
      {
        slug: "framer",
        role: "Sales page and program landing pages",
        why: "Coaching sales pages need named transformation, dated testimonial, and clear-stack offer. Framer's design quality lets the page look high-ticket without a designer hire, and the CMS supports separate landing pages for 1:1 vs group programs.",
        swapNotes: "Carrd for a minimum-viable landing page; Framer for the long-form sales letter.",
      },
      {
        slug: "lemonsqueezy",
        role: "High-ticket checkout and payment plans",
        why: "Lemon Squeezy's payment plan support (4×, 6×, 12× installments) is essential for coaching packages at $1K-$10K. Merchant of Record handling removes international VAT bookkeeping.",
        swapNotes: "Stripe direct for US-only practices; Polar for the newer alternative.",
      },
      {
        slug: "screen-studio",
        role: "VSL and group program demo recording",
        why: "Coaching sales pages benefit enormously from a 3-5 minute VSL where the coach speaks the Hook / Story / Offer directly. Screen Studio's auto-zoom and cursor handling are particularly good for slide-walkthrough format.",
        swapNotes: "Loom for raw client recordings; Screen Studio for the public sales page.",
      },
      {
        slug: "senja",
        role: "Transformation testimonials",
        why: "The load-bearing proof for coaching is named, dated, specific transformation testimonials. Senja's video collection widget converts at 8-12% when sent post-success, and the embed widget drops the result onto the Framer sales page directly.",
        swapNotes: "Testimonial.to for the direct alternative.",
      },
      {
        slug: "beehiiv",
        role: "Coaching list and lead-magnet sequence",
        why: "Coaches who run a weekly newsletter (Seinfeld Email pattern) keep warm-prospect supply consistent. Beehiiv's growth tools (referral, recommendations) outperform legacy ESP options for the discovery phase.",
        swapNotes: "ConvertKit or Substack if you prefer their workflow.",
      },
      {
        slug: "notion",
        role: "Client workspace and program delivery",
        why: "Coaches deliver sessions through worksheets, frameworks, and ongoing notes – all of which fit Notion's database + doc shape natively. The shared-database flow lets the coach see all clients' progress in one view without a coaching-specific platform.",
        swapNotes: "Practice Better or Paperbell if you need scheduling + delivery in one tool; Notion if you want to keep the categories separate.",
      },
    ],
    whatToBuildFirst:
      "Cal.com + Framer + Senja. Booking, sales page, and proof – the three surfaces that turn a website visitor into a paid client. Everything else is delivery-side and can be added when the first client signs.",
    commonMistake:
      "Building the client portal before the sales funnel. Coaches often start with Practice Better or Paperbell and then bolt on a marketing site as an afterthought – which inverts the priority. The marketing layer is the bottleneck for pre-revenue coaches; the client portal is for after revenue.",
    faqs: [
      {
        q: "Do I need a coaching-specific platform?",
        a: "Probably not until you have 10+ active clients. The indie stack handles every role a coaching platform bundles (Cal.com for sessions, Notion for client docs, Lemon Squeezy for payments). Practice Better or Paperbell earn their keep when you have group programs with cohort-wide deliverables and 20+ clients.",
      },
      {
        q: "What about a group program platform like Circle or Mighty Networks?",
        a: "If you run a community-led group program, yes – Circle or Mighty handles the discussion + course delivery shape better than Notion. For 1:1 coaching or small cohort programs (under 10 people), Notion + a private Slack channel works.",
      },
      {
        q: "How do I handle the discovery call vs paid intro session?",
        a: "Cal.com supports both. Most coaches benefit from a paid intro session ($97-$497) instead of a free discovery call – it pre-qualifies leads, gets one real Stripe charge, and converts to high-ticket at a meaningfully higher rate than free calls.",
      },
      {
        q: "What's the minimum stack to launch?",
        a: "Cal.com + Framer + Lemon Squeezy. Three tools, total cost under $30/mo, and you can take payment for a $5K coaching package today. Add Senja and Screen Studio when you have your first transformation to feature.",
      },
    ],
    lastVerified: VERIFIED,
  },

  // -- 5. consultants -----------------------------------------------------
  {
    slug: "consultants",
    metaTitle: "The Indie SaaS Stack for Consultants – Unlock SaaS",
    metaDescription:
      "Seven tools independent consultants actually need: site, scheduling, async video, proposal docs, checkout for paid audits, social proof, analytics.",
    heroSubhead:
      "A 7-tool stack for independent consultants whose practice attracts wrong-fit leads. Marketing site, scheduling, async demo, proposals, paid-audit checkout, social proof, and analytics.",
    tldr:
      "Consultants who run their practice out of LinkedIn DMs and Calendly hit a hard ceiling around $15K MRR. The 7-tool indie stack splits positioning (Framer), qualification (Calendly + Lemon Squeezy for paid audits), proof (Senja), and delivery (Notion + Loom) into category-leading tools the consultant owns.",
    whyThisStack:
      "Consultants compete on positioning premium, not lead volume. The stack has to (1) make the positioning legible (Framer), (2) qualify the lead before the discovery call (Calendly + paid-audit tripwire), (3) prove specific past outcomes (Senja), and (4) deliver async so the consultant's hours don't cap the business (Loom + Notion).",
    tools: [
      {
        slug: "framer",
        role: "Positioning surface and case study library",
        why: "A consulting site that lists three service categories competes on rate. A consulting site that names one specific outcome for one specific cohort commands premium pricing. Framer's design quality + CMS shape lets the niching iteration happen weekly, not quarterly.",
        swapNotes: "Webflow or a personal Next.js site if you want full control.",
      },
      {
        slug: "calendly",
        role: "Discovery call scheduling",
        why: "Calendly's reliability and prospect familiarity matter more here than feature breadth – consulting prospects expect a polished booking link, not a quirky open-source alternative. The paid-meeting flow (charge before booking) qualifies leads automatically.",
        swapNotes: "SavvyCal for prospect-friendly time selection; Cal.com for open-source.",
      },
      {
        slug: "loom",
        role: "Async proposal video and discovery prep",
        why: "Consultants who send a 5-minute Loom walking through the prospect's situation before the discovery call close at higher rates than consultants who arrive cold. Loom's analytics close the loop on whether the prospect watched.",
        swapNotes: "Screen Studio for polished short videos; Loom for daily async work.",
      },
      {
        slug: "notion",
        role: "Proposal docs and delivery workspace",
        why: "Consulting proposals are long-form documents with embedded case studies, scope tables, and pricing breakdowns. Notion's database + doc shape handles all of this in one tool with permissioning for client-facing access.",
        swapNotes: "Google Docs works; Notion's structured-doc-meets-database shape is closer to the proposal format.",
      },
      {
        slug: "lemonsqueezy",
        role: "Paid audit / tripwire checkout",
        why: "Paid audits ($1.5K-$7.5K) are the highest-converting tripwire pattern for consulting. Lemon Squeezy handles the one-time charge + the upsell flow into the full engagement, with VAT compliance for international clients.",
        swapNotes: "Stripe direct for US-only consulting; Polar for the newer alternative.",
      },
      {
        slug: "senja",
        role: "Client outcome testimonials",
        why: "Consulting case studies are the highest-leverage marketing asset. Senja's collection flow handles video + text + import-from-LinkedIn, and the embed widgets put the named, dated outcome on the Framer page without manual copy-paste.",
        swapNotes: "Testimonial.to is the direct alternative.",
      },
      {
        slug: "plausible",
        role: "Site analytics for the niching iteration",
        why: "Consultants iterating their positioning need to know which case study reads correlate with discovery-call bookings. Plausible's single-page dashboard answers exactly that, without the GA4 cognitive overhead.",
        swapNotes: "Fathom for the direct alternative.",
      },
    ],
    whatToBuildFirst:
      "Framer + Calendly + Senja. The site, the booking funnel, and the proof library – the three surfaces that decide whether wrong-fit leads turn into qualified-fit leads. Everything else is delivery-side and can be added when you sign your first engagement.",
    commonMistake:
      "Hiding the price. Consultants who don't list rates on the marketing site attract a stream of 'what's your hourly rate' DMs that drain energy and rarely close. Listing a starting price (productized audit at $X, advisory retainer from $Y) pre-qualifies leads upstream of the discovery call.",
    faqs: [
      {
        q: "Do I need a CRM as a solo consultant?",
        a: "No, until ~$50K MRR. Notion plus a shared inbox handles the first 30 active conversations. A CRM (HubSpot, Pipedrive) is the right tool when sales motion crosses 10+ active opportunities monthly.",
      },
      {
        q: "Should I publish a newsletter?",
        a: "Often yes. A weekly Seinfeld Email (1-2 paragraphs, useful insight, low CTA) keeps consultants top-of-mind for buyers who aren't ready yet. Beehiiv or Substack handles it; the indie consultant stack doesn't need a dedicated tool for it until the list crosses 1,000 subscribers.",
      },
      {
        q: "What about fractional CTO/CMO tooling?",
        a: "Fractional roles often live in the client's stack (Slack, Linear, Notion) rather than in the consultant's. Keep your own positioning surface (Framer + Senja + Calendly) and adapt to each client's delivery workspace.",
      },
      {
        q: "How does the paid-audit tripwire work?",
        a: "Frame a productized audit deliverable (e.g., 'I'll review your trial-to-paid funnel and ship a 12-slide report in 7 days, $2,500'). Lemon Squeezy handles checkout; the audit Notion doc handles delivery; the upsell into a full engagement happens during the audit-review call.",
      },
    ],
    lastVerified: VERIFIED,
  },

  // -- 6. ecommerce -------------------------------------------------------
  {
    slug: "ecommerce",
    metaTitle: "The Indie SaaS Stack for Ecommerce Founders – Unlock SaaS",
    metaDescription:
      "Seven tools post-launch ecommerce founders actually need beyond Shopify: payments, email, transactional, analytics, social proof, marketing site, design.",
    heroSubhead:
      "A 7-tool stack for ecommerce founders whose store is live but won't convert. Payments, email, transactional, analytics, social proof, design, and a marketing site that isn't your product catalog.",
    tldr:
      "Ecommerce founders running on Shopify get the product catalog and checkout for free – but they often skip the marketing-site, email-list, and social-proof layer where conversion lifts compound. The 7-tool stack adds the layers Shopify doesn't ship: Beehiiv for the list, Postmark for transactional, Plausible for measurement, Senja for proof, Framer for content pages.",
    whyThisStack:
      "Ecommerce founders typically have Shopify (or WooCommerce) handling the core store and miss the marketing surfaces that lift conversion 2-3x: a real content site, a real email list, real social proof. This stack assumes Shopify or a checkout exists, and layers the indie-marketing toolkit on top – the stack that turns a 0.8% conversion rate into a 2-3% conversion rate.",
    tools: [
      {
        slug: "stripe",
        role: "Direct checkout for D2C and high-AOV bundles",
        why: "Even with Shopify handling the main catalog, Stripe Checkout is the right surface for one-off high-AOV bundles, pre-orders, and direct-link sales (Instagram, email). Faster to ship than a full Shopify product page for the experimental SKU.",
        swapNotes: "Shopify handles the main store; Stripe is the off-Shopify direct surface.",
      },
      {
        slug: "lemonsqueezy",
        role: "Digital product and bundle checkout",
        why: "Ecommerce founders selling digital companions (eBooks, templates) alongside physical product get Merchant of Record VAT handling out of the box. Cleaner than Shopify's digital-download flow for international buyers.",
        swapNotes: "Polar is the newer alternative; Stripe direct if you have a US-only customer base.",
      },
      {
        slug: "beehiiv",
        role: "Newsletter and post-purchase email",
        why: "Klaviyo dominates the category but its pricing scales fast. Beehiiv works for indie ecommerce founders below $50K MRR – cheaper, simpler segmentation, and the growth tools (referrals, recommendations) acquire subscribers without paid ads.",
        swapNotes: "Klaviyo if you're past $50K MRR and need full Shopify integration; Beehiiv for the indie-stack tier.",
      },
      {
        slug: "plausible",
        role: "Site analytics for the marketing pages",
        why: "Shopify's analytics handle the storefront. Plausible covers the marketing-site funnels (content pages, lead magnets, the blog) where the GA4 overhead doesn't pay off. The privacy-first model also handles EU buyers without consent-banner friction.",
        swapNotes: "Fathom is the direct alternative; PostHog if you need session-level depth.",
      },
      {
        slug: "senja",
        role: "Customer review and UGC collection",
        why: "Ecommerce conversion lives or dies on social proof. Senja's video + photo collection widgets capture customer outcomes off-platform (avoiding Shopify Reviews' walled-garden constraint), and the export flow places named, dated reviews on the marketing site directly.",
        swapNotes: "Testimonial.to is the direct alternative; Shopify Reviews handles on-product reviews but doesn't export cleanly.",
      },
      {
        slug: "postmark",
        role: "Transactional email (order confirm, shipping notice)",
        why: "Shopify's default transactional email looks generic. Postmark's transactional templates + deliverability optimization turn order confirmations into proof-of-quality touch points – important for indie brands where every customer interaction is brand surface.",
        swapNotes: "Resend is the closest direct alternative; Shopify's default transactional works if you don't care about brand polish.",
      },
      {
        slug: "framer",
        role: "Marketing site and content pages outside Shopify",
        why: "Shopify's storefront is for products. The brand story, founder narrative, sustainability/sourcing page, and SEO blog all live cleaner on a Framer site connected via subdomain. Better Lighthouse scores than Shopify's default theme.",
        swapNotes: "Webflow for the direct alternative; ship the marketing surface outside Shopify either way.",
      },
    ],
    whatToBuildFirst:
      "Beehiiv + Senja. The list and the proof. Klaviyo and full marketing-automation come later – Beehiiv's free tier covers the first 2,500 subscribers, and Senja's $19/mo tier handles the first 100 reviews. Both compound from week one.",
    commonMistake:
      "Spending the entire marketing budget on Meta/TikTok ads before fixing the conversion rate. Below 1% conversion, paid ads burn cash. Fix the Hook / Story / Offer on the product page first (with the Senja proof and Beehiiv warm-list), then scale paid traffic.",
    faqs: [
      {
        q: "Why isn't Shopify in this stack?",
        a: "Shopify is assumed – it handles the product catalog, checkout, and inventory. This stack is what you build around Shopify to lift conversion. Replace 'Shopify' with WooCommerce, Snipcart, or any other e-com platform – the marketing-side roles stay the same.",
      },
      {
        q: "Klaviyo or Beehiiv?",
        a: "Klaviyo if you're past $50K MRR and need deep Shopify event integration (cart abandonment, browse abandonment, post-purchase flows). Beehiiv if you're below that – the indie-stack tier of email tooling that handles segmentation + growth without the Klaviyo learning curve.",
      },
      {
        q: "Do I need a separate marketing site outside Shopify?",
        a: "Often yes, for the brand story + blog + landing pages. Shopify's storefront is purpose-built for product catalogs, not for SEO content pages. A Framer or Webflow site on a subdomain + Shopify on the main domain handles both shapes cleanly.",
      },
      {
        q: "What about subscription boxes?",
        a: "Stripe Billing or ReCharge (the Shopify-native option) handle subscription mechanics. The 7-tool indie stack stays the same – the subscription flow is a checkout pattern, not a separate tool category.",
      },
    ],
    lastVerified: VERIFIED,
  },

  // -- 7. no-code-builders ------------------------------------------------
  {
    slug: "no-code-builders",
    metaTitle: "The Indie SaaS Stack for No-Code Builders – Unlock SaaS",
    metaDescription:
      "Seven tools no-code founders actually need on top of Bubble or Lovable: marketing site, payments, analytics, list, forms, social proof, video.",
    heroSubhead:
      "A 7-tool stack for no-code founders whose app is live but whose Stripe line is flat. Marketing site, payments, analytics, list, forms, social proof, and video – everything outside the no-code builder itself.",
    tldr:
      "No-code founders often pour all energy into the Bubble/Lovable/Softr build and skip the marketing-and-sales layer that converts traffic. The 7-tool stack assumes the no-code build exists and adds the surfaces that move the Stripe line: Framer for the marketing site, Stripe for payments, Plausible for measurement, Beehiiv for the list, Tally for forms, Senja for proof, Screen Studio for demo video.",
    whyThisStack:
      "No-code builders typically have a build (Bubble, Lovable, Softr, Glide) and a missing marketing layer. This stack is what you wrap around the build to get the funnel working. Marketing site separate from the app (Framer), payments wired direct (Stripe), list and proof handled outside the build.",
    tools: [
      {
        slug: "framer",
        role: "Marketing site and landing pages (separate from the app)",
        why: "Bubble, Lovable, and Softr can build the app and the marketing site, but the marketing site usually looks like the app. A separate Framer site removes that constraint – pages load fast, the design quality is iterable, and the no-code app stays focused on doing its actual job.",
        swapNotes: "Carrd for a minimum-viable landing page; Webflow if you need full CMS.",
      },
      {
        slug: "stripe",
        role: "Payments and subscription billing",
        why: "Direct Stripe integration via API (or the platform's Stripe plugin) gives access to the full subscription, trial, and dunning flow. The Customer Portal removes the cancel-flow build cost. Stripe is universal across every no-code platform.",
        swapNotes: "Lemon Squeezy or Polar if you want Merchant of Record VAT handling.",
      },
      {
        slug: "plausible",
        role: "Marketing site analytics",
        why: "Privacy-first analytics that work without consent banners. The single-screen dashboard answers the only question a pre-revenue no-code founder needs: is the marketing-site CTA getting clicked, and does it convert to signup?",
        swapNotes: "Fathom is the direct alternative.",
      },
      {
        slug: "beehiiv",
        role: "Email list and growth sequence",
        why: "No-code apps rarely have a strong native email engine. Beehiiv handles the list, the Soap Opera Sequence, and the launch announcements with growth-loop tools (referrals, recommendations) that compound the audience without paid ads.",
        swapNotes: "ConvertKit if you prefer their workflow; Beehiiv is the indie-stack default.",
      },
      {
        slug: "tally",
        role: "Forms (signup, feedback, lead capture)",
        why: "No-code builders often ship inline forms but the form-handling, validation, and Slack/Notion integration are afterthoughts. Tally's unlimited free tier removes form-tooling cost entirely, and the embed-anywhere flow drops into Framer, Bubble, or Softr in one paste.",
        swapNotes: "Typeform for the polished closed-source alternative.",
      },
      {
        slug: "senja",
        role: "Customer testimonials and proof",
        why: "No-code apps live or die on the perception of trust. Senja's video + text collection widgets convert at 8-12% when sent post-success, and the embed widgets drop the named, dated proof onto the Framer marketing site directly.",
        swapNotes: "Testimonial.to is the direct alternative.",
      },
      {
        slug: "screen-studio",
        role: "Product demo and launch video",
        why: "No-code founders ship demo videos faster than they ship features – it's the cheapest way to communicate the product's actual job. Screen Studio's auto-zoom + cursor handling turn a raw recording into a polished demo without editing skills.",
        swapNotes: "Loom for raw recordings; Screen Studio for the public-facing version.",
      },
    ],
    whatToBuildFirst:
      "Framer + Stripe + Beehiiv. The marketing site, the payments wire, and the list – the three surfaces that move the Stripe line from flat to growing. Senja and Screen Studio come after the first paying customer gives you something to record.",
    commonMistake:
      "Marketing the build, not the outcome. No-code founders love saying 'built on Lovable' or 'no-code SaaS for X' on the marketing site. Buyers don't care which tool was used to build the app. The marketing-side stack should sell the specific transformation, not the construction method.",
    faqs: [
      {
        q: "Should I use the no-code builder's built-in payments or Stripe direct?",
        a: "Stripe direct, almost always. Built-in payment integrations (Bubble's Stripe plugin, Softr's checkout) work for a first sale but break down on dunning, trials, and the Customer Portal. Direct Stripe API or Stripe Checkout via the no-code platform's webhook flow handles all of it cleanly.",
      },
      {
        q: "What about Carrd vs Framer for the marketing site?",
        a: "Carrd for a one-page minimum viable landing page – often the right shape for a no-code founder's first launch. Framer when you need a real CMS, multiple landing pages, and design-grade interactivity.",
      },
      {
        q: "Can I run the marketing site inside Bubble/Lovable/Softr?",
        a: "Yes, but you usually shouldn't. The no-code app is built for the app's job; the marketing site needs different speed, design, and SEO behavior. Keep them separate – Framer subdomain + no-code app on the main app subdomain – and you can iterate the marketing site without redeploying the app.",
      },
      {
        q: "Does this stack work for Lovable / Bolt / Cursor builds?",
        a: "Yes. The stack is no-code-platform agnostic. The 7 tools wrap around whatever the no-code or AI-coded app is – the marketing layer, payments, list, and proof are the same regardless of how the underlying app was built.",
      },
    ],
    lastVerified: VERIFIED,
  },

  // -- 8. indie-hackers --------------------------------------------------
  {
    slug: "indie-hackers",
    metaTitle: "The Indie SaaS Stack for Indie Hackers – Unlock SaaS",
    metaDescription:
      "Eight tools indie hackers actually need post-launch: hosting, payments, analytics, email, list, social proof, project tracking, demo video.",
    heroSubhead:
      "An 8-tool stack for indie hackers whose ship-post got cheers but whose Stripe line stayed flat. Hosting, payments, analytics, email, list, proof, project tracking, video.",
    tldr:
      "Indie hackers who ship to upvotes but flat MRR usually have the build right and the marketing layer missing. The 8-tool indie stack: Vercel for hosting, Stripe for payments, Plausible for analytics, Resend for transactional, Beehiiv for the list, Senja for proof, Linear for execution, Screen Studio for the demo loop.",
    whyThisStack:
      "Indie hackers ship products that get cheered in the IH community but skipped by the actual buyer cohort. The stack inverts that: the operational backbone is fast (Vercel, Stripe, Resend), and the marketing layer is opinionated (Beehiiv, Senja, Screen Studio) – built to convert the buyer cohort, not the IH audience.",
    tools: [
      {
        slug: "vercel",
        role: "App and marketing site hosting",
        why: "Vercel's deploy-on-push + preview URLs match the indie-hacker workflow – ship daily, iterate on the marketing site weekly, no infra overhead. Fluid Compute handles long-running tasks (300s default timeout); ISR handles the marketing site at sub-second load times globally.",
        swapNotes: "Render for long-running workers; Railway for self-hosted services.",
      },
      {
        slug: "stripe",
        role: "Subscription billing and Customer Portal",
        why: "Stripe is universal across the IH cohort – every payment provider integration assumes Stripe webhooks. The Customer Portal removes a build, dunning handles failed-card recovery, and the free tier (no monthly fee, transaction-based) fits pre-revenue economics.",
        swapNotes: "Lemon Squeezy for MoR tax handling; Polar for the newer alternative.",
      },
      {
        slug: "plausible",
        role: "Marketing site analytics",
        why: "GDPR-friendly analytics that work without consent banners – matters because IH-cohort apps often launch to a EU-heavy first-traffic mix (PH, HN, Twitter). Plausible's single-screen dashboard answers conversion-from-landing-page → signup, which is what matters pre-revenue.",
        swapNotes: "Fathom is the direct alternative; PostHog for session-level depth.",
      },
      {
        slug: "resend",
        role: "Transactional email (welcome, password reset, billing)",
        why: "Resend's React Email integration matches the indie-hacker stack (Next.js, React, TypeScript). Deliverability rivals Postmark with cleaner DX, and the free tier handles the first 3,000 emails/mo.",
        swapNotes: "Postmark is the direct alternative if you prefer their dashboard.",
      },
      {
        slug: "beehiiv",
        role: "Newsletter and growth sequence",
        why: "Indie hackers who launch with a newsletter at the same time as the product compound faster than indie hackers who launch the product cold. Beehiiv's growth-loop tools (referrals, recommendations) get the first 1,000 subscribers without paid ads.",
        swapNotes: "ConvertKit if you prefer their workflow; Substack for the pure-newsletter shape.",
      },
      {
        slug: "senja",
        role: "Testimonial collection from the first 10 users",
        why: "The first 10 customers are the highest-leverage marketing asset an indie hacker has. Senja's collection widgets ship into Slack, Intercom, or the activation moment, and the embed widgets drop the proof onto the Vercel-hosted marketing site directly.",
        swapNotes: "Testimonial.to is the direct alternative.",
      },
      {
        slug: "linear",
        role: "Bug tracking and roadmap",
        why: "Linear's keyboard-first speed fits the indie-hacker workflow – ship daily, track issues without context-switching, integrate with GitHub. Cycles model handles the 'this week vs next week' decision automatically.",
        swapNotes: "GitHub Issues if you want zero extra tools; Linear for the polished experience.",
      },
      {
        slug: "screen-studio",
        role: "Demo videos and launch announcement",
        why: "Indie hackers ship more demo videos than any other cohort – Twitter, Product Hunt, IH posts all benefit from a 60-second polished demo. Screen Studio's auto-zoom + cursor handling beat Loom for the public-facing video.",
        swapNotes: "Loom for raw daily recording; Screen Studio for the public launch video.",
      },
    ],
    whatToBuildFirst:
      "Vercel + Stripe + Plausible + Beehiiv. The first four cover hosting, payments, measurement, and list – the structural minimum. Resend, Senja, Linear, Screen Studio are quality-of-life additions that come after the first few paying customers.",
    commonMistake:
      "Confusing community validation with market validation. Indie Hackers cheers the build; that signal doesn't translate to willingness-to-pay. The stack should be optimized for the buyer cohort (whoever actually pays), not for the IH/PH audience that upvotes.",
    faqs: [
      {
        q: "Do I need a separate landing page from the app?",
        a: "Usually yes. The app's onboarded surface is for users; the marketing site is for buyers. Hosting both on Vercel makes the split cheap – a /www marketing surface and a /app product surface, both deploying on push.",
      },
      {
        q: "Stripe vs Lemon Squeezy vs Polar?",
        a: "Stripe direct if your customer base is US-heavy or you already have an accountant handling tax. Lemon Squeezy for global indie SaaS where VAT compliance would consume founder hours. Polar is the newer indie-friendly alternative with a similar Merchant of Record shape.",
      },
      {
        q: "Is PostHog overkill at this stage?",
        a: "For most pre-revenue indie SaaS, yes. PostHog earns its weight when you're optimizing activation/retention at 100+ active trials/mo. Below that, Plausible covers the marketing-funnel analytics without producing more dashboards than decisions.",
      },
      {
        q: "What about Cron jobs and background tasks?",
        a: "Vercel Cron Jobs (free up to 2 jobs on Hobby, 40 on Pro) handle most scheduled task needs. Vercel Queues (public beta) handles durable event streams. Vercel Workflow DevKit handles long-running multi-step orchestration. All on the same hosting tier.",
      },
    ],
    lastVerified: VERIFIED,
  },

  // -- 9. ai-wrappers ----------------------------------------------------
  {
    slug: "ai-wrappers",
    metaTitle: "The Indie SaaS Stack for AI Wrapper Founders – Unlock SaaS",
    metaDescription:
      "Seven tools AI wrapper founders actually need: hosting, payments, analytics, list, transactional, documentation, social proof.",
    heroSubhead:
      "A 7-tool stack for AI wrapper founders whose product works but whose Stripe line is flat. Hosting, payments, analytics, list, transactional email, docs, and the social proof layer.",
    tldr:
      "AI wrapper founders typically have the model+system-prompt right and the marketing/positioning layer wrong. The 7-tool indie stack puts the operational backbone (Vercel, Stripe, Resend) under a category-leading marketing surface (Beehiiv, Senja) with developer-facing documentation (Mintlify) and measurement (Plausible).",
    whyThisStack:
      "AI wrapper founders sell against the same underlying model their buyers can already access. The stack has to amplify the specific differentiator (the workflow, the system prompt, the proof of better output) and make documentation a first-class surface – buyers researching AI tools read the docs before they read the marketing page.",
    tools: [
      {
        slug: "vercel",
        role: "App hosting and AI streaming",
        why: "Vercel's Fluid Compute and zero-config streaming match AI wrapper shape – AI SDK, streaming responses, edge config for rate limiting, AI Gateway for provider abstraction. The default execution timeout (300s) handles slow model responses out of the box.",
        swapNotes: "Render for self-hosted GPU workloads; Vercel for the API + frontend.",
      },
      {
        slug: "stripe",
        role: "Credit-based and subscription billing",
        why: "AI wrappers often need both subscription (monthly plans) and credit-based (per-generation) billing. Stripe Billing handles both natively – Usage-based billing for credits, Subscription for plans, and the Customer Portal handles plan changes without a build.",
        swapNotes: "Lemon Squeezy or Polar for Merchant of Record handling.",
      },
      {
        slug: "plausible",
        role: "Marketing site analytics",
        why: "Privacy-first analytics matter especially for AI tools – buyers researching AI products are sensitive to tracking. Plausible's no-cookie model removes consent-banner friction on the EU traffic mix that PH/HN launches generate.",
        swapNotes: "Fathom is the direct alternative; PostHog if you need product-side AI session analytics.",
      },
      {
        slug: "beehiiv",
        role: "List and content marketing",
        why: "AI wrapper founders compound faster when paired with an audience – a weekly newsletter on the underlying workflow (not the wrapper itself) builds the buyer cohort over time. Beehiiv's growth tools (referrals, recommendations) acquire subscribers without paid ads.",
        swapNotes: "ConvertKit or Substack for the alternatives.",
      },
      {
        slug: "resend",
        role: "Transactional email (welcome, billing, output delivery)",
        why: "AI wrappers often email the user the generated output (PDF reports, briefs, etc.) – Resend's React Email + attachment support handles both transactional and output-delivery emails in one tool. The deliverability is on par with Postmark.",
        swapNotes: "Postmark is the direct alternative.",
      },
      {
        slug: "mintlify",
        role: "Developer documentation and API docs",
        why: "AI wrappers attract a developer-shaped buyer cohort that reads docs before they sign up. Mintlify's docs surface (live API docs, code-block-first design, dark mode default) hits the bar developers expect. Better Lighthouse scores than the Notion-docs alternative.",
        swapNotes: "GitBook for the closer alternative; Notion as the fallback.",
      },
      {
        slug: "senja",
        role: "User-output testimonials",
        why: "AI wrapper proof is named, dated, specific output – not 'great tool'. Senja's video + screenshot collection widgets capture the actual output the user generated, which is the load-bearing proof that the wrapper does what it claims.",
        swapNotes: "Testimonial.to is the direct alternative.",
      },
    ],
    whatToBuildFirst:
      "Vercel + Stripe + Plausible. Hosting, payments, measurement – the structural minimum for an AI wrapper. Mintlify and Beehiiv come next once the first paying user gives you something to document and an audience to write to.",
    commonMistake:
      "Selling the underlying model instead of the workflow. AI wrappers that say 'GPT-powered X' compete against ChatGPT for free. AI wrappers that name the specific workflow ('a marketing brief generator for B2B SaaS founders') compete on the value they add above the model.",
    faqs: [
      {
        q: "Should I use Vercel AI Gateway?",
        a: "Probably yes. AI Gateway handles provider failover (OpenAI/Anthropic/Google), observability, and cost tracking with one API – the operational overhead it removes is meaningful, and the unified pricing is competitive vs running direct provider keys.",
      },
      {
        q: "How do I handle credit-based pricing?",
        a: "Stripe Billing has native usage-based pricing – you report usage events via the API, Stripe charges accordingly. The metering layer (counting generations, tokens, etc.) lives in your app; Stripe handles the billing math.",
      },
      {
        q: "Do I need session analytics for AI products?",
        a: "Eventually yes. AI wrappers benefit from understanding which prompt patterns lead to repeat usage – PostHog or LangSmith handle that. Pre-revenue, Plausible covers the marketing-side funnel; instrument session analytics when you have ~100 active users/mo.",
      },
      {
        q: "Should I publish my system prompt?",
        a: "Generally no. The system prompt is one piece of the moat; the workflow + UI + audience + integrations together are the durable moat. Publishing the system prompt commodifies the wrapper. Document what the wrapper does, not how the prompt is engineered.",
      },
    ],
    lastVerified: VERIFIED,
  },

  // -- 10. info-product-creators ----------------------------------------
  {
    slug: "info-product-creators",
    metaTitle: "The Indie SaaS Stack for Info Product Creators – Unlock SaaS",
    metaDescription:
      "Seven tools info product creators actually need: checkout, email, lead capture, social proof, demo video, analytics, workspace.",
    heroSubhead:
      "A 7-tool stack for info product creators (eBooks, templates, swipe files) whose Gumroad is live but flat. Checkout, email, lead capture, proof, demo video, analytics, workspace.",
    tldr:
      "Info product creators who rely solely on Gumroad's built-in marketing skip the layers that compound across launches: the email list, the social proof library, the steady-state landing page. The 7-tool stack adds those layers around the checkout: Lemon Squeezy, Beehiiv, Tally, Senja, Screen Studio, Plausible, Notion.",
    whyThisStack:
      "Info product creators that stay on Gumroad's marketing default plateau at $1K-$3K per launch and never compound. The indie stack adds the layers Gumroad doesn't cover well: a real list (Beehiiv), real lead capture (Tally), real proof (Senja), and a real marketing surface – which together turn one-off launches into a compounding back-catalog.",
    tools: [
      {
        slug: "lemonsqueezy",
        role: "Digital product checkout and Merchant of Record",
        why: "Lemon Squeezy is the cleanest one-stop for digital product sales – VAT handling for international buyers, order-bump and upsell flows native, license-key delivery for software-shaped info products. Gumroad works; Lemon Squeezy is the indie default if you ship digital outside the US.",
        swapNotes: "Gumroad if you're US-only and want zero setup; Polar for the newer alternative.",
      },
      {
        slug: "beehiiv",
        role: "Email list and launch sequence",
        why: "Info product creators who launch without a list rely on launch-week spikes that don't compound. Beehiiv handles the Soap Opera Sequence, the segmentation by product purchased, and the growth-loop tools that build the list between launches.",
        swapNotes: "ConvertKit or Substack are the direct alternatives.",
      },
      {
        slug: "tally",
        role: "Lead-magnet capture and pre-launch waitlist",
        why: "Info product launches benefit from a 2-4 week waitlist that pre-converts. Tally's unlimited free tier handles the waitlist form + the lead-magnet delivery without paying for form-tooling. The webhook into Beehiiv handles the sequence trigger automatically.",
        swapNotes: "Typeform for the polished alternative; ConvertKit forms if you stay inside one tool.",
      },
      {
        slug: "senja",
        role: "Buyer testimonials and outcome proof",
        why: "Info product launches live on proof of transformation. Senja's video + text collection widgets capture buyers right after they get value, and the embed widgets put the named, dated testimonial on the sales page or Lemon Squeezy product page directly.",
        swapNotes: "Testimonial.to is the direct alternative.",
      },
      {
        slug: "screen-studio",
        role: "Sales page VSL and product demo",
        why: "Info product sales pages convert meaningfully better with a 3-5 minute VSL where the creator walks through the deliverable. Screen Studio's auto-zoom + cursor handling beat Loom for the public-facing video.",
        swapNotes: "Loom for raw recordings; Screen Studio for the public sales page.",
      },
      {
        slug: "plausible",
        role: "Sales page analytics",
        why: "Info product creators iterating sales pages need to know which version converts. Plausible's single-screen dashboard answers exactly that, without the GA4 overhead. The privacy-first model also handles EU buyers without consent banners.",
        swapNotes: "Fathom is the direct alternative.",
      },
      {
        slug: "notion",
        role: "Product drafting and operator hub",
        why: "Info products live in long-form documents. Notion's structured-doc shape handles the draft, the templates that ship with the product, and the back-catalog of past launches in one workspace.",
        swapNotes: "Google Docs works; Notion's database side handles the back-catalog cleaner.",
      },
    ],
    whatToBuildFirst:
      "Lemon Squeezy + Beehiiv + Tally. Checkout, list, lead capture – the three surfaces that turn a one-off launch into a compounding back-catalog. Senja and Screen Studio come after the first 10 buyers give you something to feature.",
    commonMistake:
      "Treating the product as the funnel. The eBook IS the offer, not the marketing for the offer. Without a Stack Slide on the sales page, without a Soap Opera Sequence for the list, info products live and die on launch week.",
    faqs: [
      {
        q: "Gumroad vs Lemon Squeezy vs Stan Store?",
        a: "Gumroad is the lowest-setup option – useful for first launch. Lemon Squeezy is the indie default for global digital products with VAT compliance. Stan Store is the creator-economy option with link-in-bio integration. Pick based on geography and existing creator surface.",
      },
      {
        q: "Do I need a sales page outside the checkout platform?",
        a: "Usually yes. Gumroad and Lemon Squeezy product pages convert; a Framer or Carrd sales page in front of them converts better. The platform page is for buyers who already decided; the marketing site is for buyers who need to be convinced.",
      },
      {
        q: "What's the right list size to launch a $97 eBook?",
        a: "1,000 engaged subscribers can sustain a $1K-$3K launch with the right Hook / Story / Offer. List engagement (open rate above 35%) matters more than list size. A 1,000-person engaged list outperforms a 10,000-person disengaged list almost every time.",
      },
      {
        q: "Should I run multiple launches per year?",
        a: "Often yes. Info products compound when each launch reuses the same email list + sales page + proof library. The Brunson value-ladder pattern says the next product is the back-end of the previous one's audience – run 4 launches/year, each one larger than the last.",
      },
    ],
    lastVerified: VERIFIED,
  },

  // -- 11. newsletter-operators -----------------------------------------
  {
    slug: "newsletter-operators",
    metaTitle: "The Indie SaaS Stack for Newsletter Operators – Unlock SaaS",
    metaDescription:
      "Seven tools newsletter operators actually need to monetize: ESP, paid newsletter, checkout, forms, social proof, analytics.",
    heroSubhead:
      "A 7-tool stack for newsletter operators with real audience and no paid product. Newsletter platform, premium tier, checkout, forms, social proof, analytics, and the operator hub.",
    tldr:
      "Newsletter operators who plateau at sponsor revenue typically have the audience right and the paid-product layer missing. The 7-tool stack adds the monetization layers around the newsletter: Beehiiv (or Ghost/Substack) for the publication, Lemon Squeezy for the paid course/info product, Senja for proof, Tally for surveys + lead capture, Plausible for analytics.",
    whyThisStack:
      "Newsletter operators don't have a tools problem – they have a monetization problem. The newsletter platform handles the publication; the indie stack adds the paid product, the checkout, the proof, and the operator-level analytics that turn sponsor-dependent newsletters into compounding paid-product businesses.",
    tools: [
      {
        slug: "beehiiv",
        role: "Newsletter publication and paid tier",
        why: "Beehiiv is the modern Substack alternative built for operators who plan to sell their own products – the growth-loop tools (referrals, recommendations), the segmentation, and the paid-tier handling outperform legacy ESPs. Native ad network if you stay sponsor-led.",
        swapNotes: "Ghost for self-hosted full-control; Substack for the network-effect discovery loop. Pick one publication platform – the operator's choice depends on whether you optimize for growth tools (Beehiiv), control (Ghost), or discovery (Substack).",
      },
      {
        slug: "lemonsqueezy",
        role: "Course / info product checkout (the back-end of the ladder)",
        why: "Newsletter operators compound monetization by attaching a paid product to the list – a $97 course, a $497 cohort, or a $27 swipe file. Lemon Squeezy handles checkout + VAT + upsell flows; the email-list trigger sets up the launch sequence in Beehiiv.",
        swapNotes: "Stripe direct if US-only; Polar for the newer alternative.",
      },
      {
        slug: "tally",
        role: "Surveys, lead capture, premium-tier signups",
        why: "Newsletter operators benefit from periodic reader surveys (what's the next product?, audience research) and lead-magnet capture for list-growth. Tally's unlimited free tier handles both without paying for form-tooling.",
        swapNotes: "Typeform for the polished alternative; ConvertKit forms if you stay inside one tool.",
      },
      {
        slug: "senja",
        role: "Reader testimonials and social proof",
        why: "Newsletter operators selling paid products need the same proof pattern as course creators – named, dated, specific outcomes from existing readers. Senja's collection flow drops the proof onto the paid-product sales page directly.",
        swapNotes: "Testimonial.to is the direct alternative.",
      },
      {
        slug: "plausible",
        role: "Operator analytics for the marketing site",
        why: "Beehiiv's analytics handle the newsletter itself. Plausible covers the marketing site, the sales pages, and the lead-magnet landing pages – the surfaces outside the newsletter where conversion matters.",
        swapNotes: "Fathom is the direct alternative.",
      },
      {
        slug: "notion",
        role: "Operator hub and editorial workspace",
        why: "Newsletter operators run editorial calendars, sponsor pipelines, and product-roadmap notes in one workspace. Notion's database + doc shape absorbs all of it without forcing a stack-of-niche-tools sprawl.",
        swapNotes: "Airtable if you need stricter database semantics; Notion for the flexible-doc shape.",
      },
      {
        slug: "screen-studio",
        role: "Course / paid-product demo video",
        why: "Newsletter operators monetizing through courses or cohort programs ship VSLs on the sales page. Screen Studio's auto-zoom and cursor handling beat Loom for the public-facing demo, and the polish matters when selling a $497-$1,997 cohort.",
        swapNotes: "Loom for raw recordings; Screen Studio for the public sales page.",
      },
    ],
    whatToBuildFirst:
      "Beehiiv (or Ghost or Substack – pick one) + Lemon Squeezy. The publication and the paid-product checkout. Senja, Tally, Plausible are uplift tools that come after the first paid-product launch verifies the monetization hypothesis.",
    commonMistake:
      "Plateauing on sponsor revenue. A newsletter that only monetizes through sponsorships is renting the audience to advertisers indefinitely – paid products compound, sponsorships don't. The right order is: build the audience, attach one paid product, then layer sponsorships on top.",
    faqs: [
      {
        q: "Beehiiv vs Ghost vs Substack – which one?",
        a: "Beehiiv for the indie-operator default (growth tools + paid tier + no platform tax on courses). Ghost for self-hosted full control. Substack for the network-effect compounding. Pick based on what you optimize for: operator control (Ghost), growth tools (Beehiiv), or discovery (Substack).",
      },
      {
        q: "What's the right paid product for a newsletter list?",
        a: "Usually one of: a $27-$97 info product the list has explicitly asked for, a $497-$1,997 cohort course on the topic the newsletter covers, or a $9-$25/month premium tier. The diagnostic helps surface which ladder rung is the right starting point.",
      },
      {
        q: "How big does my list need to be before monetizing?",
        a: "1,000 engaged subscribers is enough for a $1K-$3K launch. The bigger predictor is engagement (open rate above 35%, reply rate above 2%), not list size. Engaged 1,000 outperforms disengaged 10,000 almost every time.",
      },
      {
        q: "Should I monetize through paid tier or one-time product?",
        a: "Both, in the right order. Start with a one-time paid product ($27-$497) – it doesn't require ongoing content beyond the newsletter and earns back in days. Add a paid tier ($5-$25/month) when the audience asks for more depth than the free newsletter provides.",
      },
    ],
    lastVerified: VERIFIED,
  },

  // -- 12. freelancers ---------------------------------------------------
  {
    slug: "freelancers",
    metaTitle: "The Indie SaaS Stack for Freelancers – Unlock SaaS",
    metaDescription:
      "Seven tools freelancers actually need to escape hourly billing: site, scheduling, payments, async video, workspace, social proof.",
    heroSubhead:
      "A 7-tool stack for freelancers stuck competing on hourly rate. Marketing site, scheduling, payments, async video, workspace, proof, and the layer that productizes your offer.",
    tldr:
      "Freelancers stuck on hourly billing usually have the skill right and the positioning wrong. The 7-tool indie stack moves the freelancer from gig-by-gig to productized offer: Framer for the positioning surface, Calendly/SavvyCal for booking, Stripe for productized-service checkout, Loom for async, Notion for delivery, Senja for proof.",
    whyThisStack:
      "Freelancers competing on hourly rate cap their income at calendar capacity. The stack inverts that: the marketing site (Framer) anchors a specific outcome, the scheduling layer (Calendly/SavvyCal) filters serious buyers, and the checkout layer (Stripe) supports productized services priced on outcome – the move from hourly to flat-rate that doubles effective hourly rate without working more hours.",
    tools: [
      {
        slug: "framer",
        role: "Positioning surface and productized service landing pages",
        why: "A freelancer site that lists three skills competes on hourly rate. A freelancer site that names one specific deliverable ('I'll redesign your SaaS landing page for $4,997, two-week turnaround') commands premium pricing. Framer's CMS handles separate landing pages per productized offer without re-platforming.",
        swapNotes: "Webflow or a custom Next.js site if you want full control; Carrd for the minimum viable.",
      },
      {
        slug: "savvycal",
        role: "Prospect-friendly discovery call scheduling",
        why: "SavvyCal's overlay-your-calendar view removes the back-and-forth that wastes pre-sales energy – freelancer prospects often need their team to find time, and Calendly's grid view doesn't match how groups schedule. The polish matters more than open-source freedom at this stage.",
        swapNotes: "Calendly for the household-name alternative; Cal.com for open-source.",
      },
      {
        slug: "stripe",
        role: "Productized service payments and invoicing",
        why: "Stripe handles flat-rate productized payments (Checkout for one-click) and invoicing for project work in one dashboard. The customer portal handles client-side payment management; the API allows 'pay this proposal' buttons on the Framer site.",
        swapNotes: "Lemon Squeezy for international clients to avoid VAT bookkeeping.",
      },
      {
        slug: "loom",
        role: "Async demo, proposal review, deliverable handoff",
        why: "Freelancers who lead the discovery call with a 3-5 minute Loom walking through the prospect's site close at meaningfully higher rates. Loom's transcript + analytics close the loop on whether the prospect actually watched.",
        swapNotes: "Screen Studio for polished short videos; Loom for the daily async work.",
      },
      {
        slug: "notion",
        role: "Project delivery and client-facing docs",
        why: "Freelance deliverables (designs, reports, audits) live in shared docs. Notion's permissioning + public-link sharing handles client-facing rooms, internal scratchpads, and the case-study library in one workspace.",
        swapNotes: "Google Docs works; Notion's structured-doc shape handles the deliverable + database in one place.",
      },
      {
        slug: "senja",
        role: "Client testimonial collection",
        why: "Freelancers selling productized services need named, dated, specific testimonials. Senja's collection flow drops the proof onto the Framer landing page automatically, which is the leverage move from 'I'm a designer' to 'I redesigned this for X and they did Y'.",
        swapNotes: "Testimonial.to is the direct alternative.",
      },
    ],
    whatToBuildFirst:
      "Framer + Calendly (or SavvyCal) + Stripe. The site, the booking flow, and the payment surface – the three surfaces that decide whether the freelancer can shift from hourly to productized. Loom and Senja come after the first productized engagement gives you something to record and feature.",
    commonMistake:
      "Competing on hourly rate instead of repositioning. When a prospect asks 'what's your hourly rate?', the freelancer has already lost the framing battle. The fix is upstream – the marketing site has to anchor the offer to a specific outcome, not a skill.",
    faqs: [
      {
        q: "Should I leave Upwork and Fiverr?",
        a: "Eventually yes, but not before having a direct-traffic substitute. Marketplaces bring leads but cap rate and brand. Most freelancers leave platforms 12-24 months in – when the indie stack's lead flow matches platform lead flow.",
      },
      {
        q: "How do I productize a service?",
        a: "Pick one specific deliverable, fix the timeline, fix the price. 'Landing page redesign in 2 weeks for $4,997' beats 'design at $150/hour'. The Framer landing page describes exactly what's included, what's excluded, the schedule, and the proof of past delivery.",
      },
      {
        q: "What about retainers vs project work?",
        a: "Both fit the indie stack. Stripe handles recurring (retainer) or one-time (project) billing with the same setup. Productized retainers (e.g., '$2,500/month for 4 hours of advisory') price better than open-ended retainers.",
      },
      {
        q: "Do I need a CRM as a solo freelancer?",
        a: "No, until you have 10+ active conversations monthly. Notion plus a shared inbox handles the first 30 conversations cleanly. A CRM (HubSpot, Pipedrive) earns its keep when the sales motion grows past the manual-tracking threshold.",
      },
    ],
    lastVerified: VERIFIED,
  },
];

export const STACK_SLUGS: ReadonlyArray<string> = STACK_ENTRIES.map(
  (e) => e.slug,
);

/**
 * Hot-path helper. Inlined like getNicheBySlug etc.
 */
export function getStackBySlug(slug: string): StackEntry | undefined {
  return STACK_ENTRIES.find((e) => e.slug === slug);
}

/**
 * Resolve the underlying NicheEntry for a stack. The stack's slug matches
 * a niche slug by convention. Returns undefined if the niche has been
 * deleted (which would be a data-integrity bug).
 */
export function getNicheForStack(
  stack: StackEntry,
): NicheEntry | undefined {
  return getNicheBySlug(stack.slug);
}

/**
 * Resolve a tool's pricing-teardown entry from a StackTool slot. Skips
 * undefined values so the renderer can filter out broken links without
 * crashing the page.
 */
export function getTeardownForStackTool(
  tool: StackTool,
): PricingTeardown | undefined {
  return getPricingTeardownBySlug(tool.slug);
}

/**
 * Reverse index: given a pricing-teardown slug, which stacks include it?
 * Powers the "stacks that include this tool" cross-link block on the
 * /pricing-teardown/[slug] detail page (internal-link graph win).
 */
export function getStacksIncludingTool(
  toolSlug: string,
): ReadonlyArray<StackEntry> {
  return STACK_ENTRIES.filter((stack) =>
    stack.tools.some((t) => t.slug === toolSlug),
  );
}
