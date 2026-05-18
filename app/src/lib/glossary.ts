/**
 * Indie SaaS marketing + Brunson framework glossary — seventh pSEO surface.
 *
 * Why this catalog earns its own surface
 * --------------------------------------
 * The earlier audit flagged: "no /glossary, /tools, /learn — topical
 * reservoir is narrow. The pSEO catalogs cover head-to-head intent well;
 * the 'definition' and 'how do I' long tail is uncovered."
 *
 * Each /glossary/<term> page is built for one canonical "what is X?"
 * query class. Every entry ships schema.org DefinedTerm JSON-LD (the
 * type AI Overviews cite for definition queries), names two-to-four
 * related terms, and links into the existing pSEO surfaces where the
 * term appears in context. Result: each definition is a citation
 * anchor AND a routing node into the deeper site.
 *
 * Discipline (same as every other catalog)
 * ---------------------------------------
 *   - lastVerified ISO date on every entry.
 *   - No fabricated etymologies. Term origin is named only where it is
 *     genuinely attributable (Brunson, ClickFunnels documentation,
 *     Stripe documentation, common-knowledge community usage).
 *   - Two-to-four related terms per row, each must resolve to another
 *     row in this catalog (no dangling references).
 *   - One-to-three relevant Unlock SaaS surfaces per row when the term
 *     is used somewhere on the live site. No invented cross-links.
 *
 * Why DefinedTerm vs Article schema
 * --------------------------------
 * Google's AI Overviews and structured-data graph treat schema.org
 * DefinedTerm + DefinedTermSet as the canonical "this is a glossary"
 * pattern. Article schema would compete with the editorial surfaces
 * for the same query class; DefinedTerm signals "this is a reference
 * lookup, not opinion content."
 */

export interface GlossaryTerm {
  /** Kebab-case URL slug. */
  slug: string;
  /** Proper-case display term (e.g. "Hook Story Offer"). */
  term: string;
  /** Alternative spellings / abbreviations the term also goes by. */
  alsoKnownAs: ReadonlyArray<string>;
  /**
   * 40-80 word definition. First sentence stands alone (AEO citation
   * candidate). Subsequent sentences narrow to the post-launch pre-
   * revenue founder context.
   */
  definition: string;
  /**
   * 1-3 sentence note on why this term matters specifically for indie
   * SaaS founders. The "so what" beat that the bare definition skips.
   */
  whyItMatters: string;
  /** Term origin / attribution. Free-form short phrase. */
  origin: string;
  /** 2-4 related terms by slug. Each must resolve to a row in this catalog. */
  relatedSlugs: ReadonlyArray<string>;
  /**
   * 1-3 relevant Unlock SaaS surfaces where this term appears in
   * context. Each entry is a relative path. Empty array = no live
   * cross-link.
   */
  unlockSaasSurfaces: ReadonlyArray<{ label: string; path: string }>;
  /**
   * Optional concrete example or common pitfall. Renders as a sidebar
   * box on the page. One paragraph.
   */
  exampleOrPitfall?: string;
  /** ISO date of last sanity check. */
  lastVerified: string;
}

// ── catalog ─────────────────────────────────────────────────────────────────

const TERMS_LIST: GlossaryTerm[] = [
  {
    slug: "hook-story-offer",
    term: "Hook Story Offer",
    alsoKnownAs: ["HSO", "Hook-Story-Offer", "Brunson framework"],
    definition:
      "Hook Story Offer is the three-step persuasion sequence Russell Brunson codified in DotCom Secrets: catch the reader's attention with a specific hook, earn belief with a relevant story, and present a concrete offer that resolves what the story set up. The order matters — an offer without a story is a price tag, a story without a hook never gets read.",
    whyItMatters:
      "Most post-launch pre-revenue SaaS pages skip the hook and lead with the offer. The Hook Story Offer order is the structural fix when conversion is flat despite traffic. Every Unlock SaaS surface is built on this sequence — the diagnostic labels failure modes that map directly to a missing or broken H/S/O beat.",
    origin: "Russell Brunson, DotCom Secrets (2015), Chapter 4.",
    relatedSlugs: ["value-ladder", "attractive-character", "squeeze-page"],
    unlockSaasSurfaces: [
      { label: "Funnel teardown hub", path: "/funnel-teardown" },
      { label: "Diagnostic squeeze", path: "/diagnostic" },
    ],
    exampleOrPitfall:
      "Pitfall: founders who write the offer paragraph FIRST then bolt a hook on top end up with a hook that doesn't match the promise. The Playbook engine specifically pushes back on this drift by demanding the offer's named result matches the hook's named pain.",
    lastVerified: "2026-05-18",
  },
  {
    slug: "value-ladder",
    term: "Value Ladder",
    alsoKnownAs: ["ascension model", "product ladder"],
    definition:
      "A Value Ladder is a sequenced product lineup that escalates in price and depth, designed so each rung sells the next. Russell Brunson's canonical example: free book ($0 with $7 shipping) → upsell course ($297) → coaching ($25k). Each rung delivers value AND demonstrates competence to qualify the buyer for the next.",
    whyItMatters:
      "Post-launch pre-revenue founders typically have a single product at one price, which forces every visitor through a binary buy/no-buy gate. A two-rung ladder (e.g. $1 Starter → $49/month Playbook) lowers the entry barrier and gives non-buyers a path to become buyers later. Unlock SaaS itself ships two rungs deliberately.",
    origin: "Russell Brunson, DotCom Secrets (2015), Chapter 2.",
    relatedSlugs: ["hook-story-offer", "oto", "lead-magnet"],
    unlockSaasSurfaces: [
      { label: "$1 Starter", path: "/starter" },
      { label: "$49 Playbook", path: "/playbook-sales" },
    ],
    lastVerified: "2026-05-18",
  },
  {
    slug: "dream-100",
    term: "Dream 100",
    alsoKnownAs: ["Dream 100 list", "congregation list"],
    definition:
      "The Dream 100 is a deliberately small list of 100 audiences (newsletters, podcasts, communities, influencers) where your ideal customers already congregate. The strategy: invest in earning a place in those 100 — through value-first contribution, paid placement, or partnership — rather than chasing cold reach across the whole web.",
    whyItMatters:
      "Pre-revenue founders often try to be everywhere at once, producing thin content across ten channels. The Dream 100 forces the inverse — pick 100, invest deeply, ignore everything else. For indie SaaS this usually maps to specific subreddits, Indie Hackers, Microconf, and 5-10 newsletter audiences that already write about your category.",
    origin:
      "Chet Holmes, The Ultimate Sales Machine (2007); popularized for funnels by Russell Brunson, Traffic Secrets (2020).",
    relatedSlugs: ["attractive-character", "soap-opera-sequence", "icp"],
    unlockSaasSurfaces: [
      { label: "Press topics hub", path: "/press/topics" },
    ],
    lastVerified: "2026-05-18",
  },
  {
    slug: "soap-opera-sequence",
    term: "Soap Opera Sequence",
    alsoKnownAs: ["SOS", "five-email welcome series"],
    definition:
      "A Soap Opera Sequence is a 5-email welcome series, sent on consecutive days after opt-in, that hooks the reader with a real conflict, raises stakes through Day 2 and 3, reveals the founder's epiphany on Day 4, and presents the offer on Day 5. Each email ends with a cliffhanger that pulls the reader into the next.",
    whyItMatters:
      "Cold opt-ins go quiet within 72 hours unless the founder shows up daily with something worth opening. The Soap Opera Sequence is the structural fix — five small dramatic units that earn the right to make an offer, without rushing the close. Unlock SaaS's diagnostic-to-Starter funnel runs a Soap Opera between Day 0 and Day 5.",
    origin: "Russell Brunson, DotCom Secrets (2015), Chapter 7.",
    relatedSlugs: ["seinfeld-emails", "attractive-character", "squeeze-page"],
    unlockSaasSurfaces: [
      { label: "Diagnostic squeeze", path: "/diagnostic" },
      { label: "Five stories (reverse squeeze)", path: "/stories" },
    ],
    lastVerified: "2026-05-18",
  },
  {
    slug: "seinfeld-emails",
    term: "Seinfeld Emails",
    alsoKnownAs: ["daily Seinfeld", "soap-opera-after-SOS"],
    definition:
      "Seinfeld emails are short, ongoing daily notes the founder sends after the Soap Opera Sequence ends — named after the TV show where 'nothing happens', because each email is a slice-of-life story with a soft tie-in to the offer at the bottom. Brunson's claim: the cumulative effect across weeks IS the marketing.",
    whyItMatters:
      "Indie SaaS founders who treat their email list as a launch broadcaster (silence, then big announcement) train subscribers to ignore them. Daily Seinfeld emails keep the relationship warm without burning out the founder — each one is two paragraphs about something real, with one line at the end inviting action.",
    origin: "Russell Brunson, DotCom Secrets (2015), Chapter 7.",
    relatedSlugs: ["soap-opera-sequence", "attractive-character", "dream-100"],
    unlockSaasSurfaces: [
      { label: "Editorial policy", path: "/editorial-policy" },
    ],
    lastVerified: "2026-05-18",
  },
  {
    slug: "attractive-character",
    term: "Attractive Character",
    alsoKnownAs: ["AC", "character archetype"],
    definition:
      "The Attractive Character is the public-facing persona a founder writes from — typically one of four archetypes: Reluctant Hero, Leader, Adventurer, or Reporter. The character is real (no fabrication) but selected from the founder's actual traits so the writing voice stays consistent across email, sales pages, social, and product copy.",
    whyItMatters:
      "Indie SaaS pages written in 'corporate we' read as faceless and convert worse than the same offer written in a clear first-person voice. Picking an Attractive Character archetype gives non-engineer founders a writing scaffold that holds up across years of content without devolving into corporate hedging. Unlock SaaS's voice is Reluctant Hero throughout.",
    origin: "Russell Brunson, DotCom Secrets (2015), Chapter 6.",
    relatedSlugs: ["soap-opera-sequence", "seinfeld-emails", "hook-story-offer"],
    unlockSaasSurfaces: [
      { label: "About the founder", path: "/about" },
      { label: "Editorial policy", path: "/editorial-policy" },
    ],
    lastVerified: "2026-05-18",
  },
  {
    slug: "squeeze-page",
    term: "Squeeze Page",
    alsoKnownAs: ["opt-in page", "lead-capture page", "landing page"],
    definition:
      "A Squeeze Page is a single-purpose landing page whose only job is to capture a visitor's email address (or other lead identifier) in exchange for a specific promised piece of value. Successful squeeze pages strip every distraction (no nav, no footer links, no secondary CTAs) and offer one yes/no decision.",
    whyItMatters:
      "Pre-revenue founders who use their full marketing site as the entry point dilute conversion across five competing CTAs. A dedicated squeeze page concentrates one specific traffic source onto one specific opt-in promise. Unlock SaaS's /diagnostic is a squeeze page in the strict sense — paste a URL, enter an email, get a diagnosis.",
    origin: "Direct-response marketing lineage; popularized for digital funnels by Eugene Schwartz (Breakthrough Advertising, 1966) and updated by Brunson.",
    relatedSlugs: ["lead-magnet", "hook-story-offer", "oto"],
    unlockSaasSurfaces: [
      { label: "Diagnostic squeeze", path: "/diagnostic" },
    ],
    lastVerified: "2026-05-18",
  },
  {
    slug: "oto",
    term: "One Time Offer (OTO)",
    alsoKnownAs: ["OTO", "upsell page", "post-purchase upsell"],
    definition:
      "A One Time Offer is a discounted or bonus-laden offer presented immediately after a purchase, framed as available only on this page, only now. Brunson's rationale: a buyer's transaction state (card out, decision-fatigue past) is the highest-conversion window for a relevant adjacent product.",
    whyItMatters:
      "Indie SaaS founders who structure pricing as 'one product, one tier, one path' miss the post-purchase moment entirely. A relevant OTO doubles average order value when it's a genuine adjacent upgrade and stays optional. Unlock SaaS's /oto surface presents the $49 Playbook after the $1 Starter purchase, framed honestly as the natural next rung.",
    origin: "Russell Brunson, DotCom Secrets (2015), Chapter 5.",
    relatedSlugs: ["value-ladder", "squeeze-page", "lead-magnet"],
    unlockSaasSurfaces: [
      { label: "OTO surface (post $1 Starter)", path: "/oto" },
    ],
    lastVerified: "2026-05-18",
  },
  {
    slug: "lead-magnet",
    term: "Lead Magnet",
    alsoKnownAs: ["opt-in bribe", "ethical bribe", "freebie"],
    definition:
      "A Lead Magnet is a specific piece of free value (a checklist, template, mini-course, diagnostic, audit) exchanged for a visitor's email address. The best lead magnets solve a single concrete problem in under 10 minutes, leaving the visitor measurably better off and pre-qualified as a buyer for the adjacent paid offer.",
    whyItMatters:
      "Pre-revenue founders frequently use generic 'subscribe to my newsletter' opt-ins, which convert poorly because nothing concrete is promised. A specific lead magnet — one that names exactly what the visitor will get and how long it takes — converts measurably better and self-segments the list. Unlock SaaS's diagnostic IS the lead magnet for the /starter funnel.",
    origin: "Direct-response marketing; coined by Jeffrey Lant in the 1980s.",
    relatedSlugs: ["squeeze-page", "soap-opera-sequence", "value-ladder"],
    unlockSaasSurfaces: [
      { label: "Diagnostic squeeze", path: "/diagnostic" },
    ],
    lastVerified: "2026-05-18",
  },
  {
    slug: "stripe-connect",
    term: "Stripe Connect",
    alsoKnownAs: ["Stripe platform account", "Connect account"],
    definition:
      "Stripe Connect is Stripe's product for platforms that need to accept payments on behalf of other businesses, including built-in identity verification, payout splitting, and per-account compliance. Unlock SaaS uses Connect verification as the single source of truth for the Verified Builder badge — a customer paid the founder's connected account, Stripe says so, the badge issues.",
    whyItMatters:
      "Self-reported revenue numbers are the credibility-debt the indie SaaS space carries. Stripe Connect verification produces a third-party-attestable signal that a real customer paid a real charge to a real founder's account. The Verified Builder system at Unlock SaaS gates every public success claim on this signal.",
    origin: "Stripe, https://stripe.com/connect — product launched 2012, Connect Accounts current as of 2026.",
    relatedSlugs: ["verified-builder", "mrr", "merchant-of-record"],
    unlockSaasSurfaces: [
      { label: "Verified Builders", path: "/builders" },
      { label: "Editorial policy", path: "/editorial-policy" },
    ],
    lastVerified: "2026-05-18",
  },
  {
    slug: "merchant-of-record",
    term: "Merchant of Record (MoR)",
    alsoKnownAs: ["MoR", "reseller platform"],
    definition:
      "A Merchant of Record is the legal entity that processes the customer transaction and assumes responsibility for sales tax, VAT, chargebacks, fraud, and compliance. When you sell through a Merchant of Record platform (Lemon Squeezy, Paddle, Polar, Gumroad), they handle the global tax mess; when you sell direct through Stripe, you are your own MoR.",
    whyItMatters:
      "Indie SaaS founders selling globally hit the EU VAT compliance wall around their first international customer. MoR platforms trade a higher per-transaction fee for handing that wall to someone else. The trade-off matters most for solo founders without finance ops — the time spent on tax compliance is time not spent on the first paying customer.",
    origin: "E-commerce tax law; established usage in indie SaaS since Paddle (2012) and Gumroad (2011).",
    relatedSlugs: ["stripe-connect", "mrr", "verified-builder"],
    unlockSaasSurfaces: [
      { label: "Pricing teardown hub", path: "/pricing-teardown" },
    ],
    lastVerified: "2026-05-18",
  },
  {
    slug: "mrr",
    term: "Monthly Recurring Revenue (MRR)",
    alsoKnownAs: ["MRR", "recurring monthly revenue"],
    definition:
      "Monthly Recurring Revenue is the sum of subscription revenue normalized to a monthly cadence — annual plans divided by 12, quarterly plans divided by 3, etc. It excludes one-time payments, setup fees, and refunds. MRR is the canonical health metric for subscription SaaS because it isolates predictable recurring cash from variable one-time bumps.",
    whyItMatters:
      "Founders who report 'total revenue' on launch combine one-time wins with recurring subscriptions and inflate the apparent traction. MRR forces honesty — and for a subscription Playbook like Unlock SaaS, MRR is the metric the founder watches. The $49/month Playbook contributes $49 to MRR per active subscriber.",
    origin: "SaaS accounting convention, in widespread use since the early 2000s.",
    relatedSlugs: ["churn", "icp", "stripe-connect"],
    unlockSaasSurfaces: [
      { label: "Playbook sales", path: "/playbook-sales" },
    ],
    lastVerified: "2026-05-18",
  },
  {
    slug: "churn",
    term: "Churn",
    alsoKnownAs: ["churn rate", "customer attrition", "cancellation rate"],
    definition:
      "Churn is the percentage of paying customers who cancel (or fail to renew) in a given period. Logo churn counts customers; revenue churn counts MRR. A 5% monthly logo churn means 5% of the customer base leaves each month — at that rate, half the cohort is gone in 14 months without new acquisition.",
    whyItMatters:
      "Pre-revenue founders focus exclusively on acquisition and discover churn only after the first cohort starts cancelling. The fix is upstream: a sharp ICP, a clear offer promise, and a product that delivers what the offer named. Unlock SaaS's diagnostic explicitly labels weak-offer and wrong-person diagnoses because those failure modes show up later as churn.",
    origin: "SaaS accounting convention, formalized in the early 2000s SaaS literature.",
    relatedSlugs: ["mrr", "icp", "verified-builder"],
    unlockSaasSurfaces: [
      { label: "Diagnostic squeeze", path: "/diagnostic" },
    ],
    lastVerified: "2026-05-18",
  },
  {
    slug: "icp",
    term: "Ideal Customer Profile (ICP)",
    alsoKnownAs: ["ICP", "customer avatar", "buyer persona"],
    definition:
      "An Ideal Customer Profile names the specific, observable customer — by role, industry, scale, and behaviour — that your product fits best. A real ICP is narrow enough to fit on one line ('solo non-engineer SaaS founders who shipped on Lovable and have $0 in Stripe') and is supported by at least one named real person who already bought.",
    whyItMatters:
      "Pre-revenue founders describe their ICP as 'founders' or 'small teams' — a category, not a person. Brunson's pushback: copy written for a category never converts; copy written for a named person always does. Unlock SaaS's diagnostic Wrong Person label specifically flags pages whose ICP is too broad to convert.",
    origin: "B2B marketing convention; the 'avatar' framing comes from Russell Brunson's DotCom Secrets (2015).",
    relatedSlugs: ["attractive-character", "hook-story-offer", "churn"],
    unlockSaasSurfaces: [
      { label: "Diagnostic squeeze", path: "/diagnostic" },
      { label: "Playbook Step 1", path: "/playbook-sales" },
    ],
    lastVerified: "2026-05-18",
  },
  {
    slug: "verified-builder",
    term: "Verified Builder",
    alsoKnownAs: ["Unlock SaaS Verified Builder", "Stripe-Verified Builder"],
    definition:
      "Verified Builder is the public, third-party-attestable badge Unlock SaaS issues when a founder's first paying customer clears a charge on their connected Stripe account. The badge has a canonical URL at unlocksaas.com/builder/<slug>, an embeddable SVG, and a Review JSON-LD block founders paste on their own site to feed the relationship back to the canonical entity graph.",
    whyItMatters:
      "Indie SaaS social proof has a credibility-debt problem: self-reported revenue, screenshot testimonials, and 'happy customer' bylines that can't be independently verified. The Verified Builder badge swaps self-attestation for Stripe-attestation. A refund does not revoke the badge — the customer was real even if they later left.",
    origin: "Coined by Unlock SaaS, 2026. The mechanism (Stripe Connect verification) is standard; the badge convention and embed system are Unlock SaaS originals.",
    relatedSlugs: ["stripe-connect", "merchant-of-record", "mrr"],
    unlockSaasSurfaces: [
      { label: "Verified Builders directory", path: "/builders" },
      { label: "Editorial policy", path: "/editorial-policy" },
    ],
    lastVerified: "2026-05-18",
  },
];

export const GLOSSARY: ReadonlyArray<GlossaryTerm> = TERMS_LIST;
export const GLOSSARY_SLUGS: ReadonlyArray<string> = TERMS_LIST.map(
  (t) => t.slug,
);

export function getGlossaryTerm(slug: string): GlossaryTerm | undefined {
  return TERMS_LIST.find((t) => t.slug === slug);
}

/**
 * Return the GlossaryTerm rows for a list of slugs, preserving the input
 * order and silently dropping unknowns. Used by per-term page render to
 * resolve `relatedSlugs` into renderable cards.
 */
export function resolveRelatedTerms(
  slugs: ReadonlyArray<string>,
): GlossaryTerm[] {
  const out: GlossaryTerm[] = [];
  for (const slug of slugs) {
    const t = TERMS_LIST.find((x) => x.slug === slug);
    if (t) out.push(t);
  }
  return out;
}
