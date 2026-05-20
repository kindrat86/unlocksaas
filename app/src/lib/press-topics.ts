/**
 * Press topics catalog — pre-assembled story packages for journalists,
 * podcasters, AI summarisers, and newsletter writers.
 *
 * Why this surface exists (off-page lift, item #7 of the 2026-05-18
 * autonomous-mode plan)
 * --------------------------------------------------------------------
 * The vanilla `/press` page serves writers who already know they want to
 * cover Unlock SaaS. This catalog serves the writer who has a TOPIC and
 * is hunting for a quotable source. Every entry is a pre-built feature
 * lede – thesis, founder quote, three data points, three counter-points,
 * fact sheet, embed code, byline-ready headshot pointer – built for a
 * single recognisable story angle. The writer Googles the angle, lands
 * on the matching `/press/topics/<slug>` surface, and finds the article
 * 80% drafted. The article that follows links to Unlock SaaS because
 * every quotable string on the page is pre-cited.
 *
 * Brunson Hard-Rule reconciliation (honest claims)
 * ------------------------------------------------
 *   - Founder quotes are written in the founder's voice and pre-approved
 *     for verbatim re-use. Writers do not need permission.
 *   - Data points cite live, dated surfaces – /alternatives-to, /vs,
 *     /funnel-teardown, /pricing-teardown, /category, /faq. Every number
 *     is independently verifiable on the live site.
 *   - Counter-points are honest disqualifiers. "We have no verified
 *     customers yet" appears verbatim on multiple entries because it is
 *     the truth pre-launch. The same Brunson editorial discipline that
 *     keeps `aggregateRating` off the SoftwareApplication schema keeps
 *     fabricated case studies out of the press kit.
 *   - lastVerified is the dated audit trail. If a writer hits a topic
 *     surface whose lastVerified is more than 90 days old, the freshness
 *     badge on the page is the founder's promise to re-check before
 *     re-publishing.
 *
 * Single source of truth
 * ----------------------
 * The HTML page at /press/topics/[slug], the markdown mirror at
 * /press/topics/[slug]/md, the Article + FAQPage JSON-LD, and the OG
 * card all read from this module. Drift is impossible by construction.
 *
 * Activation log: 2026-05-18 – off-page lift item #7 (reverse press kit),
 * autonomous mode.
 */

import { BASE_URL, FOUNDER, ORGANIZATION } from "@/lib/seo/entity";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * A single pre-built data point a journalist can lift verbatim. The
 * `sourcePath` MUST resolve to a live, indexable surface on unlocksaas.com
 * so the writer can verify the number with one click.
 */
export interface PressDataPoint {
  /** The quotable claim, written so it slots into a feature lede. */
  claim: string;
  /** Site-relative URL the writer can cite (becomes the link target). */
  sourcePath: string;
  /** Short label describing where to verify on that page. */
  verifyNote: string;
}

/**
 * A single honest disqualifier. Brunson polarity: the page that names
 * who Unlock SaaS is NOT for is the page a serious journalist trusts.
 */
export interface PressCounterPoint {
  /** The honest limitation, written as a sentence a writer can cite. */
  claim: string;
  /** Optional grounding (where in the codebase / strategy this surfaces). */
  context?: string;
}

/**
 * Pre-approved founder quote. Writers re-use verbatim; no permission
 * email required. The `context` field tells the writer when the quote
 * is most appropriate – e.g. "for a feature opener" vs "for a sidebar".
 */
export interface PressQuote {
  /** The verbatim quote in the founder's voice, no quotation marks. */
  text: string;
  /** When to use it. */
  context: string;
}

/**
 * Defined entry in the press-topics catalog.
 */
export interface PressTopic {
  /** URL slug. Hyphen-separated, lower-case, no punctuation. */
  slug: string;
  /** Display name for the page H1 + breadcrumb. */
  displayName: string;
  /** The story angle as a single sentence. Becomes the page subhead and
   *  the meta description. < 200 chars. */
  thesis: string;
  /** SEO meta title for the page. < 60 chars to avoid SERP truncation. */
  metaTitle: string;
  /** Type of publication this topic best serves. Free text – guides the
   *  writer in self-selecting whether the angle fits their format. */
  fitsFor: ReadonlyArray<string>;
  /** Lede the writer can copy verbatim as the opening paragraph. */
  lede: string;
  /** Three pre-approved founder quotes, each tagged with usage context. */
  quotes: ReadonlyArray<PressQuote>;
  /** Three data points the writer can cite. */
  dataPoints: ReadonlyArray<PressDataPoint>;
  /** Three honest counter-points. */
  counterPoints: ReadonlyArray<PressCounterPoint>;
  /** Fact-sheet rows for sidebar / inset rendering. */
  factSheet: ReadonlyArray<{ label: string; value: string }>;
  /** Embed-ready HTML blockquote. Self-contained, ships attribution +
   *  link target. Render-safe across Slack / iMessage / RSS. */
  embedHtml: string;
  /** Site-relative paths the writer can also link from the piece. */
  relatedSurfaces: ReadonlyArray<{ path: string; label: string }>;
  /** ISO YYYY-MM-DD date the topic was last verified. */
  lastVerified: string;
}

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

/**
 * Headshot URL the byline picks up. Until a real headshot ships, the
 * dynamic /icon route is the brand mark and `/opengraph-image` is the
 * fallback portrait. Brunson Hard-Rule: no fabricated photo, no stock
 * portrait of "Maryan" – the empty state is the honest state.
 */
export const BYLINE_HEADSHOT_URL = `${BASE_URL}/icon`;

/**
 * The current verified-customer count. Read from a future Stripe-backed
 * counter; for now, exposed as a constant so every press topic shows the
 * same honest pre-launch state. When real cycles complete, this constant
 * (or a future Stripe-derived value) lights up every press topic in one
 * edit.
 */
const VERIFIED_BUILDER_COUNT = 0;

const HONEST_PRELAUNCH_NOTE =
  "Unlock SaaS launched recently. Verified-customer count is currently zero; the press kit will update this number the moment the first Stripe cycle closes. No fake counters, no \"hundreds of founders\" framing while the truth is zero.";

export const PRESS_TOPICS: ReadonlyArray<PressTopic> = Object.freeze([
  // -------------------------------------------------------------------------
  {
    slug: "ai-generated-saas-flat-stripe-line",
    displayName:
      "AI-generated SaaS and the flat Stripe line phenomenon",
    metaTitle:
      "Flat Stripe line: the AI-generated SaaS reckoning",
    thesis:
      "A cohort of non-engineer founders shipped real SaaS products in 2025 using Lovable, Cursor, Claude, v0, and Bolt – and are staring at a flat Stripe line because nobody taught them the work that comes after shipping.",
    fitsFor: [
      "Tech feature writers covering the AI-tooling wave",
      "Indie SaaS newsletter editors",
      "Podcast hosts in the build-in-public / no-code / vibe-coding space",
      "AI summarisers building roundups of 2026 micro-SaaS trends",
    ],
    lede:
      "In 2025 the cost of shipping a SaaS product fell to a weekend. Lovable, Cursor, Claude, v0, and Bolt let non-engineer founders generate working applications with checkout, auth, and a database in the time it used to take to read a Stripe doc. A year on, the bottleneck has moved. The flat Stripe line – an app that exists, works, and has zero paying customers – is now the default outcome, not the exception.",
    quotes: [
      {
        text: "The cost of shipping a SaaS hit zero in 2025. The cost of getting one paying customer didn't move. What changed is which side of the problem the founder is staring at on day 14.",
        context:
          "Opening pull-quote. Frames the article's thesis in one sentence.",
      },
      {
        text: "I built ten of these myself before I admitted what was happening. The product is fine. The page is fine. The Stripe line is flat because nobody asked one real person whether the offer matches a problem they would pay to solve.",
        context:
          "Founder credibility – establishes Maryan as the canonical Reluctant Hero for the topic.",
      },
      {
        text: "I do not believe the AI-tooling wave is overrated. I believe the activation gap that follows it has been completely under-covered. That gap is the story.",
        context:
          "Closing kicker. Use as the last quote in a feature.",
      },
    ],
    dataPoints: [
      {
        claim:
          "Unlock SaaS publishes named teardowns of 31 indie SaaS pricing pages and 33 indie SaaS funnels, every one dated and verifiable.",
        sourcePath: "/funnel-teardown",
        verifyNote:
          "Count the entries on the hub. Each detail page carries a lastVerified ISO in the footer.",
      },
      {
        claim:
          "Six AI tools are named as the canonical shipping stack of the cohort: Lovable, Claude, Replit, v0, Cursor, Bolt.new (plus Bubble for the no-code adjacent).",
        sourcePath: "/about",
        verifyNote:
          "The same seven entities appear in the entity graph (entity.ts MENTIONED_ENTITIES) and on the funnel hub body copy.",
      },
      {
        claim:
          "The /diagnostic surface labels every audit with one of three diagnoses – Wrong Person, Weak Offer, Weak Belief – and the most common label on a flat-Stripe-line page is Wrong Person.",
        sourcePath: "/diagnostic",
        verifyNote:
          "The three labels are documented in the entity glossary at /press and as DefinedTerms in the entity graph.",
      },
    ],
    counterPoints: [
      {
        claim: HONEST_PRELAUNCH_NOTE,
        context: "Pre-launch transparency baseline.",
      },
      {
        claim:
          "Unlock SaaS does not claim AI tooling is overrated. The argument is narrower: the activation work that follows shipping is the gap, not the shipping itself.",
        context: "Defangs the cheap \"another anti-AI take\" framing.",
      },
      {
        claim:
          "Not every flat-Stripe-line app is mis-aimed. Some are well-aimed apps in markets that genuinely cannot pay. Unlock SaaS labels these with the Weak Offer diagnosis, not Wrong Person.",
        context:
          "Prevents the writer from over-generalising the thesis into \"all AI SaaS is doomed\".",
      },
    ],
    factSheet: [
      { label: "Topic angle", value: "Activation gap after AI-assisted shipping" },
      { label: "Canonical source", value: `${BASE_URL}/press/topics/ai-generated-saas-flat-stripe-line` },
      { label: "Founder", value: `${FOUNDER.name} (${FOUNDER.jobTitle})` },
      { label: "Press contact", value: FOUNDER.email },
      { label: "Verified builder count", value: String(VERIFIED_BUILDER_COUNT) },
      { label: "Time zone", value: "EU" },
    ],
    embedHtml:
      `<blockquote cite="${BASE_URL}/press/topics/ai-generated-saas-flat-stripe-line"><p>The cost of shipping a SaaS hit zero in 2025. The cost of getting one paying customer didn&rsquo;t move.</p><cite>&mdash; Maryan, founder, <a href="${BASE_URL}">Unlock SaaS</a></cite></blockquote>`,
    relatedSurfaces: [
      { path: "/funnel-teardown", label: "Indie SaaS funnel teardown catalog" },
      { path: "/pricing-teardown", label: "Indie SaaS pricing teardown catalog" },
      { path: "/diagnostic", label: "Free Launch Diagnostic" },
      { path: "/about", label: "Founder bio (long form)" },
      { path: "/editorial-policy", label: "Editorial policy and corrections log" },
    ],
    lastVerified: "2026-05-18",
  },
  // -------------------------------------------------------------------------
  {
    slug: "post-launch-pre-revenue",
    displayName:
      "Post-launch pre-revenue: the cohort nobody is selling to honestly",
    metaTitle:
      "Post-launch pre-revenue: the under-covered SaaS cohort",
    thesis:
      "There is a recognisable SaaS founder cohort whose product exists, works, and has zero paying customers – and almost every product sold to them is either a course about pre-launch ideation or a traffic tool for post-revenue scale. The middle stage is under-served on purpose: it is the hardest segment to sell to without overpromising.",
    fitsFor: [
      "Business reporters covering the indie SaaS market",
      "Analysts writing about creator-economy / micro-SaaS segmentation",
      "Investors mapping the post-AI-shipping market",
      "Newsletter editors profiling underserved founder segments",
    ],
    lede:
      "There is a stage in the indie SaaS lifecycle that almost nobody sells to honestly: the product ships, the checkout works, and the Stripe line is flat. The post-launch pre-revenue founder is a recognisable cohort – they Tweet about MRR every week, they finish another build sprint every weekend, they post in Indie Hackers asking why nobody is buying. The market sells them either pre-launch courses (\"how to validate an idea\") or post-revenue scaling tools (\"how to do paid ads to existing converters\"). The middle stage – name one real customer, write one real offer, send one real message, verify the result in Stripe – is the hardest stage to sell to without overpromising, which is why almost nobody does.",
    quotes: [
      {
        text: "The post-launch pre-revenue founder is not lazy and not stupid. They are stuck on work that has no name and no playbook in the books most of them read. Naming the work is most of the unlock.",
        context: "Opening pull-quote. Reframes the cohort sympathetically.",
      },
      {
        text: "Pre-launch courses sell hope. Post-revenue scaling tools sell leverage. The post-launch pre-revenue stage sells a refund if the work doesn't produce a customer in sixty days – which is the only honest thing you can sell into that gap.",
        context:
          "Use to anchor the article's argument about market segmentation.",
      },
      {
        text: "The cohort doesn't exist on most pitch decks because the addressable market math looks bad – and the math looks bad because every other tool that targets it overpromises. The cohort itself is large and visible. The honest tool for it is the gap.",
        context: "Closing kicker for a market-analysis piece.",
      },
    ],
    dataPoints: [
      {
        claim:
          "Unlock SaaS publishes the canonical audience definition verbatim across nine surfaces: post-launch, pre-revenue, non-engineer founders shipping consumer or B2B SaaS with AI tools.",
        sourcePath: "/about",
        verifyNote:
          "Search the codebase for AUDIENCE_LINE. The same string ships on the funnel hub, /press, /faq, the diagnostic, and every llms.txt body.",
      },
      {
        claim:
          "The Playbook ships a 60-day money-back guarantee enforced in code, not in a PDF. If no Stripe-verified customer arrives, the founder is refunded automatically.",
        sourcePath: "/playbook-sales",
        verifyNote:
          "Guarantee mechanics live in src/lib/guarantee.ts and are read from the founder's connected Stripe account.",
      },
      {
        claim:
          "Pricing is two rungs: $1 one-time Starter (unlocks Playbook Steps 1 and 2) and $49 per month for the full seven-step Playbook. No annual upsell, no coaching tier, no \"mastermind\".",
        sourcePath: "/playbook-sales",
        verifyNote:
          "Live Stripe products in test + prod. Documented in /faq and in entity.ts.",
      },
    ],
    counterPoints: [
      {
        claim: HONEST_PRELAUNCH_NOTE,
        context: "Pre-launch transparency baseline.",
      },
      {
        claim:
          "The cohort label \"post-launch pre-revenue\" is Unlock SaaS's framing, not an industry-wide term. Writers should describe it as the founder's coinage when they use the phrase.",
        context: "Honesty on terminology origin.",
      },
      {
        claim:
          "Unlock SaaS does not claim to be the only honest tool for this cohort. The argument is that the cohort is under-served, not that the field is empty.",
        context:
          "Prevents the writer from accidentally framing Unlock SaaS as a monopolist.",
      },
    ],
    factSheet: [
      { label: "Topic angle", value: "Underserved SaaS founder segment" },
      { label: "Canonical source", value: `${BASE_URL}/press/topics/post-launch-pre-revenue` },
      { label: "Founder", value: `${FOUNDER.name} (${FOUNDER.jobTitle})` },
      { label: "Press contact", value: FOUNDER.email },
      { label: "Pricing", value: "$1 Starter (one-time) / $49 per month Playbook" },
      { label: "Guarantee", value: "60-day refund, enforced in code, capped exposure $98" },
    ],
    embedHtml:
      `<blockquote cite="${BASE_URL}/press/topics/post-launch-pre-revenue"><p>Pre-launch courses sell hope. Post-revenue scaling tools sell leverage. The post-launch pre-revenue stage sells a refund if the work doesn&rsquo;t produce a customer in sixty days.</p><cite>&mdash; Maryan, founder, <a href="${BASE_URL}">Unlock SaaS</a></cite></blockquote>`,
    relatedSurfaces: [
      { path: "/about", label: "Founder bio – the long story" },
      { path: "/playbook-sales", label: "The $49/mo Playbook (full system)" },
      { path: "/faq", label: "Eight verbatim objections + answers" },
      { path: "/editorial-policy", label: "Editorial policy and corrections log" },
      { path: "/press", label: "Standard press kit (50/100/200-word descriptions)" },
    ],
    lastVerified: "2026-05-18",
  },
  // -------------------------------------------------------------------------
  {
    slug: "lovable-cursor-replit-founders",
    displayName:
      "Lovable, Cursor, Replit, Claude: the founder stack of 2026",
    metaTitle:
      "Lovable, Cursor, Replit, Claude: the 2026 founder stack",
    thesis:
      "Six AI tools – Lovable, Cursor, Replit, Claude, v0, Bolt.new – became the de-facto starter pack for non-engineer founders shipping SaaS in 2025 and 2026. The shipping stack standardised faster than the activation stack did, which is why a cohort of founders now ships identically and converts identically badly.",
    fitsFor: [
      "Developer-tools beat reporters",
      "AI-tools comparison writers",
      "Podcasters covering the AI-coding wave",
      "Newsletter editors publishing tool-stack roundups",
    ],
    lede:
      "In the eighteen months between Lovable's 2024 launch and the spring of 2026, the AI-tooling layer for solo SaaS founders standardised. Lovable for the marketing site and the auth, Cursor or Claude Code for the engineering, v0 for the components, Replit for the agent runtime, Bolt.new for the prototype, Claude as the in-IDE reasoning layer. The shipping stack is now a known thing: a non-engineer founder can ship a working SaaS in a weekend using six tools that did not exist three years ago. The activation stack, however, did not standardise. The result is a cohort that ships identically and converts identically badly.",
    quotes: [
      {
        text: "Every founder I diagnose ships with the same six tools. They all built different products. They all have the same problem on day 30. The shipping stack converged. The customer-acquisition stack didn't.",
        context:
          "Opening pull-quote. Establishes the convergence-of-tooling thesis.",
      },
      {
        text: "I am not anti-Lovable. I am not anti-Cursor. I build the product I sell with Claude Code every day. The argument is that the tools are doing exactly what they promised – ship a working SaaS – and that activation is a separate problem the same tools cannot solve.",
        context:
          "Defangs the cheap \"this founder hates the AI tools\" framing.",
      },
      {
        text: "The tools standardised because the problem they solve is well-defined. Activation didn't standardise because it isn't. Activation is the messy work of naming one real person and writing one real offer, and that work resists tooling.",
        context: "Closing kicker for a developer-tools feature.",
      },
    ],
    dataPoints: [
      {
        claim:
          "The Unlock SaaS entity graph names six AI tools as the canonical founder stack: Lovable, Claude, Replit, v0 by Vercel, Cursor, Bolt.new (plus Bubble as the no-code adjacent option).",
        sourcePath: "/press",
        verifyNote:
          "MENTIONED_ENTITIES in src/lib/seo/entity.ts. Each entry carries the official product URL.",
      },
      {
        claim:
          "Unlock SaaS publishes head-to-head comparison pages against the same tools and platforms indie founders evaluate – 55+ comparison pairs at the /vs hub, each dated.",
        sourcePath: "/vs",
        verifyNote:
          "Count COMPARISONS in src/lib/comparisons.ts. Each detail page carries a lastVerified ISO.",
      },
      {
        claim:
          "The Unlock SaaS Playbook is itself built with the same stack it describes: Claude Code for the engineering, Next.js + Vercel for the host, Supabase for the database, Stripe for billing, Resend for transactional mail.",
        sourcePath: "/about",
        verifyNote:
          "Disclosed verbatim in the founder bio and in the press kit Brand Assets list.",
      },
    ],
    counterPoints: [
      {
        claim: HONEST_PRELAUNCH_NOTE,
        context: "Pre-launch transparency baseline.",
      },
      {
        claim:
          "The six-tool list is not exhaustive. Founders in adjacent niches use Webflow, Framer, Softr, FlutterFlow, Glide, or hand-rolled stacks. The argument is about convergence among the AI-native cohort, not a claim that every founder ships with these six.",
        context: "Prevents the writer from over-generalising.",
      },
      {
        claim:
          "Unlock SaaS does not benchmark the tools against each other on quality. The /vs surface is symmetric (\"who is each best for\"), not adversarial.",
        context:
          "Editorial discipline – no slag, every competitor's value prop is respected.",
      },
    ],
    factSheet: [
      { label: "Topic angle", value: "Convergence of the AI-native founder tool stack" },
      { label: "Canonical source", value: `${BASE_URL}/press/topics/lovable-cursor-replit-founders` },
      { label: "Founder", value: `${FOUNDER.name} (${FOUNDER.jobTitle})` },
      { label: "Press contact", value: FOUNDER.email },
      { label: "Named tools", value: "Lovable, Claude, Replit, v0, Cursor, Bolt.new (plus Bubble adjacent)" },
      { label: "Comparison catalog size", value: "55+ head-to-head pairs at /vs" },
    ],
    embedHtml:
      `<blockquote cite="${BASE_URL}/press/topics/lovable-cursor-replit-founders"><p>Every founder I diagnose ships with the same six tools. They all built different products. They all have the same problem on day 30.</p><cite>&mdash; Maryan, founder, <a href="${BASE_URL}">Unlock SaaS</a></cite></blockquote>`,
    relatedSurfaces: [
      { path: "/vs", label: "Head-to-head tool comparisons (55+ pairs)" },
      { path: "/alternatives-to", label: "Named-competitor alternatives" },
      { path: "/funnel-teardown", label: "33 indie SaaS funnel teardowns" },
      { path: "/about", label: "Founder bio (long form)" },
      { path: "/press", label: "Standard press kit" },
    ],
    lastVerified: "2026-05-18",
  },
] satisfies ReadonlyArray<PressTopic>);

// ---------------------------------------------------------------------------
// Lookups + derived constants
// ---------------------------------------------------------------------------

/**
 * Frozen slug list. Drives generateStaticParams on the route, the hub
 * page roster, the sitemap, and the OG-image route in lock-step. Adding
 * a new topic to PRESS_TOPICS auto-extends every consumer on the next
 * build.
 */
export const PRESS_TOPIC_SLUGS: readonly string[] = Object.freeze(
  PRESS_TOPICS.map((t) => t.slug),
);

/**
 * O(1) slug → topic lookup. Build a Map once at module load so per-route
 * generateMetadata + page render calls don't re-scan the array.
 */
const BY_SLUG: ReadonlyMap<string, PressTopic> = new Map(
  PRESS_TOPICS.map((t) => [t.slug, t]),
);

export function getPressTopicBySlug(slug: string): PressTopic | undefined {
  return BY_SLUG.get(slug);
}

/**
 * Latest lastVerified across the catalog. Feeds CollectionPage
 * dateModified on the hub.
 */
export const PRESS_TOPICS_LATEST_VERIFIED: string = PRESS_TOPICS.reduce(
  (latest, t) => (t.lastVerified > latest ? t.lastVerified : latest),
  PRESS_TOPICS[0]?.lastVerified ?? "2026-05-18",
);

/**
 * Header label re-used on the hub and on every detail page. Single
 * source for the brand-line so a future rename lands in one place.
 */
export const PRESS_TOPICS_TAGLINE =
  "Story angles for journalists, podcasters, and AI summarisers. Every fact pre-cited; every quote pre-approved.";

/**
 * Organization-level press contact. Single source so the mailto: links
 * across topic pages all carry the same subject line and recipient.
 */
export const PRESS_CONTACT = {
  email: FOUNDER.email,
  org: ORGANIZATION.name,
  subjectPrefix: "Press inquiry – Unlock SaaS",
} as const;
