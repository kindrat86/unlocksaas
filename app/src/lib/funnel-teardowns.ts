/**
 * Funnel teardowns catalog — Surface A pSEO programmatic teardown pages.
 *
 * See strategy/google-strategy.md §A.5 for the policy on programmatic SEO.
 * This is the second pSEO block after src/lib/alternatives.ts.
 *
 * Intent class targeted:
 *   "[product] funnel teardown" / "how does [product] sell" /
 *   "[product] landing page breakdown" / "[product] marketing strategy" /
 *   indirect: "how to position a [category] saas"
 *
 * Canonical audience match:
 *   Post-launch pre-revenue non-engineer SaaS founders are already
 *   funnel-hacking indie SaaS they admire. They search the funnel pattern,
 *   not a competitor name. We meet them there and reframe the analysis
 *   through Brunson Hook-Story-Offer — which is exactly what the Machine
 *   does on the founder's own page.
 *
 * Brunson Hard-Rule reconciliation (strategy/google-strategy.md §AC-flaw):
 *   - No slagging. Each teardown respects the target company's real
 *     positioning and pulls strategic lessons, not snark.
 *   - No fabricated quotes. Observations describe public funnel patterns
 *     ("leans on", "positions around"), never invented copy.
 *   - No fabricated metrics. We do not invent conversion rates, traffic
 *     numbers, or revenue claims about the target company.
 *   - lastVerified ISO. The date is evidence of when we last manually
 *     sanity-checked every claim against the live public surface.
 *   - "What to adapt vs avoid" closes every entry. The teardown is for
 *     the reader's benefit, not for our positioning.
 *
 * Scaling path to thousands of pages:
 *   This file is the manifest. Each new entry adds one indexed page,
 *   automatically extends the hub, and automatically extends sitemap.ts.
 *   At ~500 entries this file should split by category into separate
 *   modules and a barrel; at <100 entries a single file is the right
 *   call (one source of truth, one PR per batch).
 *
 * To add a teardown: append an entry, set lastVerified to today's ISO
 * after manually loading the target's homepage to confirm the claims,
 * and ship. generateStaticParams + sitemap.ts pick it up on next build.
 */

export interface TeardownFaq {
  q: string;
  a: string;
}

/**
 * Brunson lens — how each teardown maps to the framework the Machine
 * runs on the reader's own product. Keeping the same vocabulary across
 * every teardown is what turns this surface into a teaching system, not
 * a clip show.
 */
export interface BrunsonLens {
  /** What hook the target uses to catch attention. */
  hook: string;
  /** What story they tell to create belief. */
  story: string;
  /** What offer mechanism they use to close. */
  offer: string;
  /**
   * Value Ladder tier the surface is operating at, plain language:
   * "Front-end lead funnel", "Unboxing funnel", "Presentation funnel",
   * "Phone funnel". Helps the reader place their own page on the same
   * ladder.
   */
  valueLadderTier: string;
}

export interface FunnelTeardown {
  /** URL slug. Kebab-case. */
  slug: string;
  /** Proper-noun display name of the company being analyzed. */
  displayName: string;
  /** Person or company that operates it, where known. */
  creator?: string;
  /** Category bucket the target sits in. Drives hub grouping. */
  category: string;
  /** Single-line summary of the teardown's thesis. */
  oneLine: string;
  /**
   * 40-to-60 word TL;DR written for AEO citation. ChatGPT / Perplexity
   * paraphrase this paragraph when asked "what is X's marketing strategy".
   * Must stand alone, be factually conservative, and end with the
   * specific lesson a reader can take away.
   */
  tldr: string;

  /** Public-snapshot product context. Each field is observable, not inferred. */
  productSnapshot: {
    whatTheySell: string;
    whoFor: string;
    /** Pricing as observed on the public site at lastVerified. */
    pricingNote: string;
  };

  /**
   * Hook layer of the funnel — how attention is caught. Analysis is
   * pattern-level (positioning, headline structure, opening promise),
   * not quoted copy.
   */
  hook: {
    /** Observable hook pattern (e.g. "founder-led transparency"). */
    pattern: string;
    /** 2-to-4 sentence analysis of why it works for their audience. */
    analysis: string;
  };

  /** Story layer — how belief is created. */
  story: {
    pattern: string;
    analysis: string;
  };

  /** Offer layer — how the close is structured. */
  offer: {
    pattern: string;
    analysis: string;
  };

  /** 5-to-7 strategic moves that read as deliberate, not accidental. */
  whatsWorking: string[];

  /**
   * 3-to-5 lessons a non-engineer indie SaaS founder can safely steal
   * regardless of category.
   */
  whatToAdapt: string[];

  /**
   * 2-to-4 things specific to the target's scale / category that a
   * pre-revenue indie founder should NOT copy. (e.g. "do not copy
   * enterprise-style logo bar before you have a paying customer".)
   */
  whatToAvoid: string[];

  /** Brunson lens — required, see interface. */
  brunsonLens: BrunsonLens;

  /** 4-to-6 FAQs targeted at the query a researcher actually types. */
  faqs: TeardownFaq[];

  /** Tags used by the hub for grouping and by per-page related links. */
  tags: ReadonlyArray<string>;

  /** Target's canonical homepage. */
  homepageUrl?: string;

  /** ISO date of last manual sanity check of every claim. */
  lastVerified: string;
}

// -- Catalog ------------------------------------------------------------------

const TEARDOWNS_LIST: FunnelTeardown[] = [
  {
    slug: "tally",
    displayName: "Tally",
    creator: "Marie Martens and Filip Minev",
    category: "Forms and surveys",
    oneLine:
      "Tally turns the freemium ceiling into the headline. The funnel is the price line.",
    tldr:
      "Tally's funnel leads with a single, unconditional promise: free forever, unlimited forms, unlimited submissions. That price line IS the hook, the story, and most of the offer. The lesson for indie founders: when your category is crowded, one specific structural promise on the hero converts better than a feature list.",
    productSnapshot: {
      whatTheySell:
        "A free-tier-first forms and surveys product, with a paid Pro tier for white-label, file uploads, and advanced logic.",
      whoFor:
        "Creators, indie founders, and small teams who want a Typeform-quality form without a per-response paywall.",
      pricingNote:
        "Free tier with unlimited forms and submissions. Pro tier sits in the low-double-digits per month range (verified 2026-05-17).",
    },
    hook: {
      pattern: "Structural promise as hero",
      analysis:
        "The hero communicates one structural difference from the dominant incumbent (Typeform) and lets that difference do the heavy lifting. There is no metaphor and no founder narrative on the first scroll. The implicit argument is: if you already know the category, you know what 'unlimited' is worth, and you do not need more copy.",
    },
    story: {
      pattern: "Show, do not tell",
      analysis:
        "Story is told through live form examples and the in-product trial flow, not through a written narrative. The reader is funnelled into building a form within two clicks of the homepage. The proof is the build experience itself, which removes any need to claim ease of use in copy.",
    },
    offer: {
      pattern: "Price ladder where the floor is the offer",
      analysis:
        "The free tier is not a trial. It is the offer. The paid tier is a small upsell for users who already shipped a form and discovered which Pro feature they want. This inverts the standard SaaS funnel: instead of leading with a paid plan and discounting, Tally leads with the free plan and lets usage expose the paid tier's value.",
    },
    whatsWorking: [
      "One price line replaces an entire features section above the fold.",
      "Category-anchor positioning (against Typeform) makes the differentiator legible to a cold reader in one second.",
      "The free tier carries no submission cap, which is the single objection most indie founders have to other form tools.",
      "Product-led growth: the form-build flow is the demo, the demo is the trial, and the trial is the signup.",
      "Public template gallery doubles as long-tail SEO and as social proof for use cases.",
    ],
    whatToAdapt: [
      "Lead the hero with the one structural promise that beats your category leader. Not three. Not a list. One.",
      "If your product is a tool, make the demo BE the homepage. Do not gate the experience behind a video.",
      "Use the free tier to remove the specific objection your competitors charge for. Not a generic free tier.",
    ],
    whatToAvoid: [
      "Do not copy the no-narrative approach if your product is not in a category the reader already understands. You need a story when the category is unfamiliar.",
      "Do not lead with free if your unit economics cannot support it. Tally has venture funding and a long horizon.",
    ],
    brunsonLens: {
      hook: "Category anchor plus a single structural promise (free forever, unlimited).",
      story:
        "Product-as-demo: the homepage IS the trial, so the story is experienced rather than read.",
      offer:
        "Inverted price ladder: the floor (free) is the offer; paid is a usage-driven upsell.",
      valueLadderTier: "Front-end lead funnel (free tier as bait, paid tier as the next rung).",
    },
    faqs: [
      {
        q: "Why does Tally not have a long sales page?",
        a: "Their reader already knows the category. A long sales page sells the category. Tally only needs to sell the structural difference (unlimited free) against the incumbent (Typeform), which is a one-line job.",
      },
      {
        q: "Can a pre-revenue indie SaaS copy Tally's free-forever model?",
        a: "Only if the marginal cost of a free user is near zero AND the paid tier is genuinely valuable to power users. Most indie SaaS fail one of those tests. The right move is usually a generous free tier with a clear paid trigger, not unlimited everything forever.",
      },
      {
        q: "What is the single biggest takeaway from Tally's funnel?",
        a: "The hero is the offer. One sentence beats a feature list when the reader already knows what your product type does.",
      },
      {
        q: "Does Tally do any cold-traffic acquisition?",
        a: "Most of Tally's discovery is organic: template-gallery SEO, in-form 'Made with Tally' attribution on the free tier, and word-of-mouth among indie creators. The funnel is built for warm traffic that already understands forms.",
      },
      {
        q: "How does Unlock SaaS think about freemium for indie SaaS?",
        a: "We do not recommend freemium until you have a paying customer. Brunson's frameworks treat 'free' as a lead funnel rung, not a default. Tally earned the right to lead with free by having a power-user paid tier that funds the giveaway. Most pre-revenue founders skip the proof-of-paid-demand step.",
      },
    ],
    tags: ["product-led-growth", "freemium", "category-anchor", "creator-tools"],
    homepageUrl: "https://tally.so/",
    lastVerified: "2026-05-17",
  },

  {
    slug: "plausible",
    displayName: "Plausible Analytics",
    creator: "Uku Taht and Marko Saric",
    category: "Privacy analytics",
    oneLine:
      "Plausible sells transparency as the product. Open revenue dashboards do the conversion work.",
    tldr:
      "Plausible's funnel is built around radical operational transparency: open-source code, public revenue, named founders, and a manifesto against the dominant incumbent (Google Analytics). The lesson for indie founders: a clear villain plus a clear principle plus visible proof of life converts cold privacy-leaning readers faster than feature parity ever will.",
    productSnapshot: {
      whatTheySell:
        "A privacy-focused, cookie-free, lightweight web analytics SaaS positioned as the ethical alternative to Google Analytics.",
      whoFor:
        "Indie founders, small SaaS, and privacy-leaning teams in the EU and beyond who do not want to deal with cookie banners or GDPR overhead.",
      pricingNote:
        "Volume-tiered subscription starting low for hobby sites and scaling with pageviews. Self-hostable for free under their license (verified 2026-05-17).",
    },
    hook: {
      pattern: "Named villain plus principle",
      analysis:
        "The hero names Google Analytics as the thing being replaced and frames the replacement on a principle (privacy) rather than a feature. This converts an undecided reader into a decided one within the first paragraph by giving them a side to be on.",
    },
    story: {
      pattern: "Operational transparency as proof",
      analysis:
        "The story is told through public artifacts: open source code on GitHub, a public revenue page, named founders writing blog posts about real failures and pivots. The reader does not need to take a marketing claim on faith because the receipts are linked.",
    },
    offer: {
      pattern: "Two-track close",
      analysis:
        "Hosted SaaS for the reader who wants the easy path, self-hosted free for the reader who wants the principled path. The dual offer removes the objection 'I will just build it myself' by handing the build-it-yourself reader a working product, betting that most will return to the hosted tier later.",
    },
    whatsWorking: [
      "A clear villain (Google Analytics) gives the reader something to be against, which is more activating than being for a feature.",
      "Public revenue dashboard turns marketing copy into a verifiable fact.",
      "Open-source positioning collects developer trust without the SaaS needing to be developer-led.",
      "Named founders on every page anchor the entity to humans, which raises both LLM citation likelihood and human trust.",
      "EU founder positioning aligns the product with the regulatory environment (GDPR, ePrivacy) without explicit fear-mongering.",
      "The pricing page leads with a small-team tier, signalling that indie buyers are the target, not the afterthought.",
    ],
    whatToAdapt: [
      "Pick a villain. Not a competitor's quality, but a structural decision that competitor made which you reject. Then build your positioning on the rejection.",
      "Make at least one operational fact public (revenue, MRR, signups, churn). It costs little and converts disproportionately.",
      "Use your founder name on the marketing surface. Anonymous SaaS is a trust-shaped hole.",
    ],
    whatToAvoid: [
      "Do not open-source your product if you have not validated paid demand for the hosted version. Open-source is a long-horizon trust play, not a launch tactic.",
      "Do not pick a villain you cannot back up with a real structural difference. Performative opposition is read as marketing and lowers trust.",
    ],
    brunsonLens: {
      hook: "Big enemy positioning (Brunson 'Common Enemy' identity hook) plus a principle the reader already half-believes.",
      story:
        "Hero's Two Journeys: founders who left big-tech analytics for a principled alternative; reader is invited to make the same move.",
      offer:
        "Two-rung Value Ladder: free self-hosted (top of funnel) and paid hosted (recurring), with the same principle running through both.",
      valueLadderTier:
        "Front-end lead funnel (free self-host) plus subscription core (hosted) — same Brunson 'Two-step free plus paid' pattern.",
    },
    faqs: [
      {
        q: "Why does Plausible name a competitor on the homepage?",
        a: "Because their audience is already considering leaving that competitor. Naming the competitor compresses the comparison work and lets the reader self-identify as 'someone who wants to leave Google Analytics'.",
      },
      {
        q: "Is open-sourcing the product part of the funnel?",
        a: "Yes. Open source is a trust signal, a developer-channel acquisition channel, and a fallback offer for the reader who refuses paid SaaS on principle. It is a marketing decision as much as a product decision.",
      },
      {
        q: "Should an indie SaaS make their revenue public?",
        a: "If revenue is growing, yes. Public revenue dashboards are one of the highest-ROI trust signals available. If revenue is flat or declining, transparency works against you and the right move is to grow first, then publish.",
      },
      {
        q: "What is the Brunson lens on Plausible's positioning?",
        a: "Common Enemy (Big Tech analytics) plus a future-based cause (web without surveillance), executed through Hero's Two Journeys (the founders left, you should too). Textbook Expert Secrets positioning applied to a B2B SaaS.",
      },
      {
        q: "Why does Unlock SaaS recommend villain-based positioning?",
        a: "Because pre-revenue indie SaaS founders default to feature-list positioning, which puts them in a comparison shootout against larger incumbents they will lose. Picking a structural villain reframes the comparison to a principle the incumbent cannot abandon without abandoning their business.",
      },
    ],
    tags: ["positioning", "open-source", "transparency", "developer-tools", "category-anchor"],
    homepageUrl: "https://plausible.io/",
    lastVerified: "2026-05-17",
  },

  {
    slug: "lemonsqueezy",
    displayName: "Lemon Squeezy",
    creator: "JR Farr and team (acquired by Stripe in 2024)",
    category: "Payments and Merchant of Record",
    oneLine:
      "Lemon Squeezy sold a category swap (MoR), not a feature. The funnel reframes payments into compliance relief.",
    tldr:
      "Lemon Squeezy's funnel never competed with Stripe on payment processing. It sold a category swap: Merchant of Record, which means the platform handles sales tax and VAT compliance on the indie founder's behalf. The lesson for indie founders: when the incumbent owns the category, your funnel must reframe the buying decision into a different category entirely.",
    productSnapshot: {
      whatTheySell:
        "A Merchant of Record payments platform for digital products and SaaS, where the platform legally sells to the customer and handles global tax compliance.",
      whoFor:
        "Indie founders, solo SaaS operators, and small teams selling digital products globally who do not want to register for VAT in every jurisdiction.",
      pricingNote:
        "Percentage-plus-fixed-fee per transaction, with the MoR service included. Higher per-transaction cost than raw Stripe in exchange for compliance offload (verified 2026-05-17).",
    },
    hook: {
      pattern: "Category reframe",
      analysis:
        "The hero does not say 'cheaper than Stripe' or 'easier than Paddle'. It says 'we sell on your behalf', which moves the buying decision from payment-processor evaluation to compliance evaluation. The reader who lands the reframe never compares the per-transaction fee directly.",
    },
    story: {
      pattern: "Pain narrative tied to a specific indie audience",
      analysis:
        "The funnel speaks to the specific founder who sells globally and has hit the first VAT letter or sales-tax registration prompt. Story carries an emotional weight that pure feature copy cannot, because the reader has felt the pain.",
    },
    offer: {
      pattern: "Bundled compliance plus tooling",
      analysis:
        "Pricing bundles checkout, subscriptions, licensing, customer portal, and global tax compliance into one fee. The bundle hides the per-feature comparison and lets the buyer evaluate on outcome (compliance handled) rather than parts.",
    },
    whatsWorking: [
      "Category reframe (MoR) escapes the Stripe-feature shootout entirely.",
      "Branded as 'Lemon Squeezy' with playful design, which differentiates against the deliberately-boring infrastructure aesthetic of Stripe.",
      "Indie-founder testimonials on the homepage, not enterprise logos.",
      "Pricing page front-loads what is included rather than the percentage rate, which delays the comparison shopping until after value is communicated.",
      "Self-serve onboarding with no sales call required for the indie buyer, matching how indie founders prefer to buy.",
    ],
    whatToAdapt: [
      "If you cannot win the category your competitor owns, do not enter that category. Reframe the buying decision into one where you ARE the category.",
      "Bundle features so the buyer evaluates on outcome, not part-by-part comparison.",
      "Use a distinct visual identity if your category is dominated by 'serious infrastructure' aesthetics. Indie buyers respond to personality.",
    ],
    whatToAvoid: [
      "Do not adopt the playful brand if your category buyer expects gravitas (e.g. enterprise security tooling). Match the buying mood.",
      "Do not bundle features you cannot deliver well. Lemon Squeezy could bundle because each feature was production-grade.",
    ],
    brunsonLens: {
      hook: "New Opportunity (Brunson Expert Secrets) — the reader is not buying a better payment processor, they are stepping into a new category (MoR) that solves a different problem.",
      story:
        "Pain-led story aimed at the specific indie founder who hit the global-tax wall.",
      offer:
        "Bundled outcome offer — compliance plus checkout plus subscriptions priced as one outcome, not a feature list.",
      valueLadderTier:
        "Unboxing funnel (transactional core) with sticky subscription mechanics on top.",
    },
    faqs: [
      {
        q: "Why did Lemon Squeezy not just compete with Stripe on price?",
        a: "Because Stripe owns the payment-processor category. Competing on price in a category the incumbent dominates is a losing position. Lemon Squeezy created a new buying category (Merchant of Record for indie SaaS) where the comparison is to Paddle and the legacy MoR providers, not to Stripe.",
      },
      {
        q: "Is MoR positioning replicable for non-payments SaaS?",
        a: "The structural move is. Find the boring, compliance-shaped, or legal-shaped pain in your category and offer to absorb it on the buyer's behalf. That converts a comparison shopper into a relief buyer.",
      },
      {
        q: "What is the Brunson lens on Lemon Squeezy?",
        a: "New Opportunity positioning: the reader is offered a different category (MoR) rather than a better version of the same category (payment processor). This is the canonical Brunson move to escape commodity competition.",
      },
      {
        q: "Should an indie SaaS use Lemon Squeezy or Stripe?",
        a: "If you sell globally and have not registered for VAT or sales tax in your customer countries, Lemon Squeezy or another MoR usually pays for itself in saved compliance time. If you sell only in one jurisdiction or you are already set up for compliance, Stripe's lower per-transaction cost wins.",
      },
      {
        q: "How does Unlock SaaS handle payments?",
        a: "Unlock SaaS uses Stripe directly because we operate in fewer jurisdictions and have the compliance handled. The choice between Stripe and an MoR is a business-structure call, not a marketing call.",
      },
    ],
    tags: ["category-reframe", "indie-founders", "payments", "branding"],
    homepageUrl: "https://www.lemonsqueezy.com/",
    lastVerified: "2026-05-17",
  },

  {
    slug: "beehiiv",
    displayName: "Beehiiv",
    creator: "Tyler Denk",
    category: "Newsletter platform",
    oneLine:
      "Beehiiv positions against Substack on creator monetization, not features. The funnel sells the upgrade path.",
    tldr:
      "Beehiiv's funnel does not try to out-feature Substack. It positions on the creator monetization stack (ads network, paid subscriptions, referrals, boosts) and lets the reader self-select as 'a serious creator who wants to make this a business'. The lesson: when you cannot out-feature the incumbent, out-position them on the buyer's future identity.",
    productSnapshot: {
      whatTheySell:
        "A newsletter platform with built-in ad network, paid subscriptions, referral mechanics, and Boost network for paid recommendations.",
      whoFor:
        "Newsletter creators who want to treat the newsletter as a business with multiple revenue streams, not as a personal-essay channel.",
      pricingNote:
        "Free tier with ad-network monetization unlocked at certain thresholds. Paid plans scale with subscriber count (verified 2026-05-17).",
    },
    hook: {
      pattern: "Future-identity positioning",
      analysis:
        "The hero appeals to who the reader wants to BE (a creator running a real newsletter business) rather than what the platform does. The reader who lands the identity does not comparison-shop on features.",
    },
    story: {
      pattern: "Creator-success showcase",
      analysis:
        "The story is told through specific creator case studies with named newsletters and stated revenue outcomes. Brunson Hard-Rule applies: only use named, opt-in case studies; do not fabricate. Beehiiv does this well and the funnel benefits.",
    },
    offer: {
      pattern: "Monetization stack as the upsell ladder",
      analysis:
        "Each monetization feature (ad network, paid subscriptions, boosts) is positioned as a future-state benefit that grows with the creator. The reader signs up for a free newsletter platform and is then walked up the monetization ladder as the audience grows. The product itself IS the value ladder.",
    },
    whatsWorking: [
      "Future-identity hook lets the reader buy the version of themselves they want to become.",
      "Named creator case studies with stated revenue are the strongest social proof available short of public revenue.",
      "Monetization stack creates a natural upgrade path baked into product usage, not into pricing pages.",
      "Boost network is a sideways acquisition channel: creators acquire each other's subscribers, paid by Beehiiv.",
      "Aggressive content marketing (newsletter business case studies, creator playbooks) targets the same long-tail SEO their buyers search.",
    ],
    whatToAdapt: [
      "Position your product as the platform for who your buyer wants to become, not the tool for what they currently do.",
      "If you can credibly stack monetization or outcomes inside the product, that stack is your value ladder.",
      "Publish case studies with named users and specific outcomes. Anonymous testimonials are weaker than no testimonials.",
    ],
    whatToAvoid: [
      "Do not promise monetization features before they exist. Beehiiv built the ad network before they marketed it; reverse order destroys trust.",
      "Do not lead with future-identity if your product cannot help most users reach that identity. The promise must be realistic for the median buyer, not the top 1%.",
    ],
    brunsonLens: {
      hook: "Identity hook (Brunson Expert Secrets) — the reader is sold on being a creator-business, not on a newsletter tool.",
      story:
        "Hero's Journey applied to creators: a person started small, used the platform, built a business; the reader is invited to follow the same arc.",
      offer:
        "Value Ladder built into the product itself: free newsletter (front-end) -> paid subscribers (upsell) -> ad network (upsell) -> boosts (upsell).",
      valueLadderTier:
        "Full Value Ladder embedded inside one product — Brunson 'continuity programs' applied to a SaaS subscription.",
    },
    faqs: [
      {
        q: "Why is Beehiiv winning against Substack for serious creators?",
        a: "Because Beehiiv positions on the creator-as-business identity and gives that identity tools (ad network, boosts, referrals) that Substack does not. Substack positions on the writer-as-essayist identity, which is a different buyer.",
      },
      {
        q: "Can a non-newsletter SaaS use the future-identity hook?",
        a: "Yes. Identify the version of themselves your buyer wants to become and write your hero copy as if the product is the bridge to that identity. Works in fitness, productivity, finance, design, and most B2B SaaS where the buyer has a career trajectory.",
      },
      {
        q: "What is the Brunson lens on the Boost network?",
        a: "It is a Dream 100 mechanic operationalized inside the product. Each creator's Dream 100 audience is the audience of every other creator on the platform, and Beehiiv coordinates the trade. This is Brunson's 'Work your way in, buy your way in' executed as a product feature.",
      },
      {
        q: "Should an indie SaaS build a monetization stack like Beehiiv?",
        a: "Only if your buyer has multiple revenue streams to monetize and your product can credibly serve more than one. Otherwise the stack is feature bloat. For most indie SaaS, the better move is to deepen one monetization path and resist the stack until growth forces it.",
      },
      {
        q: "How does Unlock SaaS think about case studies?",
        a: "Verified-only. A /builders surface that lists founders with Stripe-confirmed paying customers, never self-reported. The Brunson Hard-Rule version of Beehiiv's case-study strategy.",
      },
    ],
    tags: ["identity-positioning", "value-ladder", "creator-tools", "monetization"],
    homepageUrl: "https://www.beehiiv.com/",
    lastVerified: "2026-05-17",
  },

  {
    slug: "cal-com",
    displayName: "Cal.com",
    creator: "Peer Richelsen and Bailey Pumfleet",
    category: "Scheduling",
    oneLine:
      "Cal.com sells the open-source alternative to Calendly. The repo IS the trust signal.",
    tldr:
      "Cal.com's funnel positions as the open-source, infinitely-extensible alternative to Calendly. The GitHub repo and self-host option are the trust assets that justify the paid hosted tier. The lesson: in a category dominated by a closed SaaS, open-source positioning is a wedge that converts the developer-adjacent buyer who could-but-will-not-build-it-themselves.",
    productSnapshot: {
      whatTheySell:
        "An open-source scheduling platform with hosted SaaS, self-host option, and an enterprise tier with white-label and embed features.",
      whoFor:
        "Developers, agencies, and teams who want Calendly's UX with extensibility, privacy control, or white-label options.",
      pricingNote:
        "Generous free hosted tier. Paid tiers per user for teams and white-label. Self-host is free under AGPL (verified 2026-05-17).",
    },
    hook: {
      pattern: "Open-source as differentiator",
      analysis:
        "The hero frames the product as the open-source version of a SaaS the reader already knows. This compresses two messages into one: what we do (scheduling, like Calendly) and why we are different (open, extensible, self-hostable).",
    },
    story: {
      pattern: "Developer-credibility through artifacts",
      analysis:
        "The repo on GitHub is the story. Star count, contributor count, and the integration directory are the proof that this is real software, not a marketing claim. The reader who values code-as-truth lands fast.",
    },
    offer: {
      pattern: "Hosted plus self-host two-track",
      analysis:
        "Same dual-track as Plausible: hosted SaaS for the easy buyer, self-host for the principled buyer. Most self-hosters return to the hosted tier when the maintenance cost exceeds the subscription cost. The two-track offer captures both buyer types without forcing a choice at first contact.",
    },
    whatsWorking: [
      "Open-source as a wedge in a closed-SaaS-dominated category gives a clear technical differentiator.",
      "GitHub star count and contributor activity function as live social proof updated daily.",
      "App directory positions Cal.com as a platform, not a tool, expanding the addressable use case range.",
      "Founder-led marketing on Twitter (and elsewhere) anchors the entity to identifiable humans.",
      "The hosted tier is generous enough to remove the 'too expensive vs Calendly' objection without requiring self-host.",
    ],
    whatToAdapt: [
      "If you can credibly open-source any meaningful part of your stack, the GitHub repo becomes a permanent free trust signal.",
      "Position against a category leader by name when the leader's structural decision (closed, paid-only, US-only, etc.) is the wedge.",
      "Use founder-on-Twitter as a marketing surface. It is high-trust, low-cost, and compounds over time.",
    ],
    whatToAvoid: [
      "Do not open-source if your business model depends on proprietary IP that competitors could trivially copy and undercut. Cal.com's moat is hosting and ecosystem, which open source does not threaten.",
      "Do not promise extensibility before the integration directory exists. The platform claim must be backed by a real integration count.",
    ],
    brunsonLens: {
      hook: "Open-source alternative-to positioning (Brunson 'better mousetrap' rejected; this is a 'new vehicle' move).",
      story:
        "Hero's Journey via the repo: founders building in public, contributors joining, the reader is invited to either use the hosted or self-host the same thing.",
      offer:
        "Two-rung Value Ladder: free hosted (front-end) plus paid team tier (subscription core) plus self-host (escape hatch).",
      valueLadderTier:
        "Front-end lead funnel (free hosted) plus subscription core (paid teams).",
    },
    faqs: [
      {
        q: "Why is open source a marketing strategy, not just a license decision?",
        a: "Because open source provides a permanent trust signal (the repo), a developer-led acquisition channel (the contributor community), and an escape hatch for principled buyers who would otherwise reject SaaS on principle. It is a marketing surface that runs continuously without paid acquisition.",
      },
      {
        q: "Can a non-developer-targeted SaaS use this play?",
        a: "Rarely. Open source as a wedge works when your buyer can evaluate or contribute to the code, or values the principle for ideological reasons. Non-developer buyers do not look at the repo and the trust signal evaporates.",
      },
      {
        q: "What is the Brunson lens on the Cal.com vs Calendly framing?",
        a: "Cal.com is using the Brunson 'New Opportunity' move via a vehicle change (closed SaaS to open-source platform). The reader is not buying a better Calendly; they are stepping into a new category (open scheduling platform) where Calendly cannot follow without abandoning their model.",
      },
      {
        q: "Should an indie SaaS open-source their product?",
        a: "Usually no, at least at first. Open source is a long-horizon trust play that pays off after several years and only if the business model is hosting plus ecosystem, not proprietary IP. Pre-revenue founders should reach paying customers on a closed product first, then consider open-sourcing later.",
      },
    ],
    tags: ["open-source", "developer-tools", "alternative-to", "category-anchor"],
    homepageUrl: "https://cal.com/",
    lastVerified: "2026-05-17",
  },

  {
    slug: "resend",
    displayName: "Resend",
    creator: "Zeno Rocha and team",
    category: "Email API",
    oneLine:
      "Resend sells developer experience as the differentiator in a commodity category. The funnel reads like documentation.",
    tldr:
      "Resend's funnel treats the homepage as a code sample and the docs as a sales page. By making the developer experience itself the differentiator in a category (transactional email) where the incumbent (SendGrid) is widely considered painful, Resend converts technical buyers in minutes. The lesson: developer experience is a marketing surface, and your docs are part of the funnel.",
    productSnapshot: {
      whatTheySell:
        "A developer-first transactional email API with React Email integration, simple SDK, and a clean modern dashboard.",
      whoFor:
        "Developers and indie SaaS founders who want to send transactional email without the legacy-platform tax of SendGrid or Mailgun.",
      pricingNote:
        "Free tier for low volume. Paid tiers scale with send volume (verified 2026-05-17).",
    },
    hook: {
      pattern: "Code as hero",
      analysis:
        "The homepage shows code, not testimonials. A developer who can read the snippet has effectively completed a demo before scrolling. This is the equivalent of a SaaS landing page where the hero IS the product window.",
    },
    story: {
      pattern: "Pain-of-the-incumbent narrative implied through ease",
      analysis:
        "The story does not need to be told explicitly. The developer reader has used SendGrid and remembers the pain. Resend's clean dashboard screenshots and three-line code samples implicitly say 'remember how painful that was; this is the alternative' without naming the competitor.",
    },
    offer: {
      pattern: "Free-tier-led plus React Email ecosystem",
      analysis:
        "Free tier is generous enough that most indie SaaS can ship in production on it. React Email (open-source library for building emails) extends Resend's surface area into a free tool that converts independent of the paid product. The free tool IS the marketing.",
    },
    whatsWorking: [
      "Code-first hero converts developer readers in seconds.",
      "Clean modern design contrasts sharply with the dated UX of incumbents, doing positioning work without copy.",
      "React Email open-source project is a top-of-funnel acquisition asset that funnels back to Resend.",
      "Aggressive founder-led marketing on Twitter from Zeno Rocha builds entity recognition.",
      "Documentation is treated as a first-class marketing surface, not an afterthought.",
      "Status page and uptime transparency are linked from the marketing surface, addressing the reliability objection upfront.",
    ],
    whatToAdapt: [
      "If your buyer is technical, lead the hero with the artifact they will actually evaluate (code, query, output) and not with marketing copy.",
      "Build a free open-source tool adjacent to your paid product that pulls in your exact buyer.",
      "Treat your documentation as part of the funnel. Bad docs are a leak.",
    ],
    whatToAvoid: [
      "Do not lead with code if your buyer cannot read it. A code hero is illegible to a non-technical buyer and loses them.",
      "Do not skip status page transparency in a category (infrastructure) where reliability is the table-stakes objection.",
    ],
    brunsonLens: {
      hook: "Vehicle-change hook: same outcome (transactional email) via a new vehicle (clean modern DX). Brunson 'better-mousetrap' done legitimately because the DX gap is real.",
      story:
        "Implied pain story aimed at developers who have already lived the incumbent's pain; the funnel does not need to retell it.",
      offer:
        "Front-end free tier plus React Email free tool, with paid send-volume tiers as the natural upgrade.",
      valueLadderTier:
        "Front-end lead funnel (free tier and React Email) plus usage-based subscription core.",
    },
    faqs: [
      {
        q: "Why does Resend's homepage show code instead of testimonials?",
        a: "Because the buyer is a developer who will evaluate the product by reading code regardless. Putting the code in the hero compresses the evaluation step into the marketing step and saves the reader a click.",
      },
      {
        q: "Is React Email part of the funnel?",
        a: "Yes. React Email is a free open-source library for building emails with React components. It has its own SEO surface, its own user base, and a natural funnel into Resend as the sending infrastructure. The free tool acquires the buyer; the paid product retains them.",
      },
      {
        q: "What is the Brunson lens on Resend?",
        a: "Vehicle change (better DX same category) plus a free top-of-funnel tool (React Email) as the front-end of the Value Ladder. Most Brunson positioning would expect a stronger story; Resend leans on implied pain instead, which works because the audience already lived the story.",
      },
      {
        q: "Can a non-developer SaaS adapt this funnel?",
        a: "The principle adapts: lead the hero with the artifact your buyer actually evaluates. For a designer-targeted SaaS, that is a Figma file. For a marketer-targeted SaaS, that is a campaign dashboard. The form changes, the principle holds.",
      },
      {
        q: "Does Unlock SaaS use Resend?",
        a: "Yes. The transactional email stack runs on Resend. The choice was driven by exactly the funnel we describe here: the SDK was the demo, the docs sold the integration, and the free tier let us ship the soap-opera sequence before we had paying customers.",
      },
    ],
    tags: ["developer-tools", "free-tool", "documentation-as-marketing", "founder-led"],
    homepageUrl: "https://resend.com/",
    lastVerified: "2026-05-17",
  },

  {
    slug: "mintlify",
    displayName: "Mintlify",
    creator: "Han Wang and Hahnbee Lee",
    category: "Developer documentation",
    oneLine:
      "Mintlify made beautiful docs a category. The funnel demos itself.",
    tldr:
      "Mintlify's funnel works because the marketing site IS a Mintlify-built docs site, and so are the docs sites of every visible customer. Every page a developer reads in the category is implicit Mintlify advertising. The lesson: if your product produces a public artifact, optimize for the artifact being recognizable and traceable back to you.",
    productSnapshot: {
      whatTheySell:
        "A documentation-as-code platform that turns Markdown plus components into a polished docs site with search, analytics, and AI-assisted answers.",
      whoFor:
        "Developer-tool SaaS, API companies, and platforms that want documentation that looks intentional rather than templated.",
      pricingNote:
        "Free tier for open-source projects. Paid tiers per editor seat scale into team and enterprise (verified 2026-05-17).",
    },
    hook: {
      pattern: "Visible customer aesthetic",
      analysis:
        "The hero is supported by a logo bar of well-known developer-tool companies whose docs run on Mintlify. The recognition is immediate for the target reader: 'their docs look like Anthropic's docs, and I want my docs to look like Anthropic's docs'.",
    },
    story: {
      pattern: "Output-as-proof",
      analysis:
        "The marketing site itself runs on Mintlify. There is no story to tell because the reader is already inside the proof. Every interaction with the marketing site is a product demo by accident.",
    },
    offer: {
      pattern: "Free for open source plus seat-based for teams",
      analysis:
        "Free for open-source projects acquires the developer credibility flywheel; seat-based pricing for teams captures the paid revenue. The free tier produces the visible customer aesthetic that sells the paid tier.",
    },
    whatsWorking: [
      "Marketing site is a product demo, eliminating the gap between claim and proof.",
      "Logo bar of well-known dev-tool customers carries the trust load that copy would otherwise have to.",
      "Free tier for open source projects floods the visible-customer surface, which is the primary acquisition channel.",
      "Documentation as a marketing channel: every customer docs site is a Mintlify referral.",
      "AI-search and analytics features tap the same buyer trend (LLM-assisted everything) without overpromising.",
    ],
    whatToAdapt: [
      "If your product creates a public artifact, make that artifact recognizable and traceable to you. Subtle attribution, but present.",
      "Use a free tier specifically to seed visible-customer presence in your category.",
      "Eat your own dog food on the marketing site. If your product is good, you cannot avoid this and you should not want to.",
    ],
    whatToAvoid: [
      "Do not add visible attribution on paid tiers. The visible-customer flywheel is a free-tier specialty.",
      "Do not seek a logo bar before you have logos. Empty logo grids and 'Customer logos coming soon' are conversion-killers.",
    ],
    brunsonLens: {
      hook: "Trust-by-association hook (Brunson 'Borrow authority') executed via visible customer logos in the buyer's own category.",
      story:
        "Output-as-proof: the marketing site is the demo and the customer sites are the case studies. The story is environmental.",
      offer:
        "Free-for-OSS plus seat-based paid tier — Brunson 'two-rung Value Ladder' tuned to a developer-tool buyer.",
      valueLadderTier:
        "Front-end lead funnel (OSS free) plus subscription core (paid teams).",
    },
    faqs: [
      {
        q: "Why does Mintlify use its own product for marketing?",
        a: "Because the marketing site IS the product demo. A docs platform that does not run on itself has a credibility hole that no testimonial can fill. Eating your own dog food is a category requirement here, not a stylistic choice.",
      },
      {
        q: "Is visible customer attribution always a good free-tier move?",
        a: "When the customer's audience overlaps with your buyer, yes. When the audiences are disjoint, attribution adds clutter to the customer's experience without acquiring you new buyers. The attribution decision is about audience overlap, not about brand visibility.",
      },
      {
        q: "What is the Brunson lens on the Mintlify funnel?",
        a: "Borrowed authority through visible logos in the target category, plus a free-OSS lead funnel feeding a paid team subscription. Textbook Value Ladder with the proof asset (visible customer aesthetic) generated as a byproduct of free-tier usage.",
      },
      {
        q: "Can a non-developer SaaS use the output-as-proof approach?",
        a: "Yes, when the product produces a public artifact. Email tools, link-in-bio tools, form builders, and survey tools can all use this. The artifact must be public enough that the buyer encounters it during normal usage of the category.",
      },
    ],
    tags: ["developer-tools", "borrowed-authority", "free-tier", "output-as-proof"],
    homepageUrl: "https://mintlify.com/",
    lastVerified: "2026-05-17",
  },

  {
    slug: "senja",
    displayName: "Senja",
    creator: "Wes Bos and team",
    category: "Testimonial collection",
    oneLine:
      "Senja sells a problem most SaaS know they have but never name. The funnel uses its own product as the demo.",
    tldr:
      "Senja's funnel solves the problem every SaaS founder eventually hits: how to collect and display testimonials without a custom build. The marketing site is filled with testimonials collected and displayed by Senja itself, so the reader sees the output in use within seconds. The lesson: if you solve a near-universal SaaS pain, your funnel can stay short.",
    productSnapshot: {
      whatTheySell:
        "A testimonial collection, video review, and social-proof display platform for SaaS, agencies, and creators.",
      whoFor:
        "Indie SaaS, agencies, and creators who need video and text testimonials displayed cleanly on their marketing site.",
      pricingNote:
        "Free tier with limited features. Paid tiers per workspace scale with team size and brand customization (verified 2026-05-17).",
    },
    hook: {
      pattern: "Universal-pain naming",
      analysis:
        "The hero names a pain (collecting and displaying testimonials) that nearly every SaaS founder has felt. The reader does not need a category education; they need the solution. This compresses the entire awareness-stage funnel into the hero.",
    },
    story: {
      pattern: "Demo-by-existence",
      analysis:
        "Testimonials displayed on the Senja marketing site are themselves collected via Senja. The story is told by the live walls and embed widgets the reader is currently looking at. The product is the marketing.",
    },
    offer: {
      pattern: "Free entry plus brand-customization upsell",
      analysis:
        "The free tier collects basic testimonials with Senja branding. The paid tier removes branding, adds video, and unlocks customization. The upsell trigger is when the founder is ready to put testimonials on the marketing site without the third-party logo. Behaviorally aligned with when the willingness-to-pay spikes.",
    },
    whatsWorking: [
      "Universal-pain hook removes the category-education step.",
      "Product-as-marketing eliminates the gap between claim and demo.",
      "Free tier with branding seeds the visible-customer attribution flywheel.",
      "Video-first positioning lands the high-conversion testimonial format as the headline differentiator.",
      "Integration with major marketing surfaces (Webflow, WordPress, custom code) removes the technical objection.",
    ],
    whatToAdapt: [
      "If you solve a near-universal pain in your buyer's category, lead the hero with the pain, not the feature.",
      "Use your own product to generate the proof assets you display. Eating your own dog food is also free marketing.",
      "Place the paid-tier trigger at the moment the buyer's willingness-to-pay structurally spikes (here: putting testimonials on the marketing site).",
    ],
    whatToAvoid: [
      "Do not lead with a universal-pain hook if your buyer does not yet recognize the pain. You will need a story to teach the pain first.",
      "Do not free-tier features your paid tier depends on. The paid trigger has to be a real value gap, not an annoyance.",
    ],
    brunsonLens: {
      hook: "Pain-named hook (Brunson 'amplify the pain') executed in a single line because the pain is universally felt.",
      story:
        "Demo-by-existence: the proof is the page itself, not narrative.",
      offer:
        "Free-with-branding plus brand-removal paid trigger — Brunson 'Strategic give plus structural upsell'.",
      valueLadderTier:
        "Front-end lead funnel (free with brand) plus subscription core (paid for white-label).",
    },
    faqs: [
      {
        q: "Why does Senja work for a category most SaaS try to build themselves?",
        a: "Because building a testimonial collection and display system is the kind of work that always gets deprioritized in favor of product work. Senja prices itself low enough that the build-vs-buy decision is no decision at all for an indie SaaS that already has a paying customer.",
      },
      {
        q: "Should an indie SaaS use Senja before having any testimonials?",
        a: "Probably not. Testimonial display tooling is leverage on existing testimonials. If you have zero customers, the prerequisite is the customer, not the display tool. Unlock SaaS treats this as a sequencing rule, not a Senja-specific issue.",
      },
      {
        q: "What is the Brunson lens on Senja?",
        a: "Hook the universal pain, prove the product by being the demo, upsell at the structural spike in willingness-to-pay (brand removal). This is the cleanest one-product Value Ladder in the indie SaaS field.",
      },
      {
        q: "Is the free-with-branding model always a good idea?",
        a: "Only when the branding is on the customer's marketing surface (Senja, Tally, Typeform, Mailchimp footers). When the branding is on the customer's internal-only surface, it converts nothing. The free-with-branding play needs a public attribution channel to compound.",
      },
    ],
    tags: ["universal-pain", "product-as-marketing", "free-tier", "social-proof"],
    homepageUrl: "https://senja.io/",
    lastVerified: "2026-05-17",
  },

  {
    slug: "tella",
    displayName: "Tella",
    creator: "Tella team",
    category: "Video for SaaS sales",
    oneLine:
      "Tella turned async sales video into a product category. The funnel runs on the output.",
    tldr:
      "Tella's funnel relies on the fact that Tella-produced sales videos look different from Loom-produced ones, so every shared Tella video on the public web is implicit advertising. The lesson: pick the visible-output category and design the output to be recognizable.",
    productSnapshot: {
      whatTheySell:
        "A browser-based screen and webcam recording tool optimized for polished marketing videos, async sales pitches, and product demos.",
      whoFor:
        "SaaS founders, sales teams, and creators who need video that looks intentional rather than utilitarian.",
      pricingNote:
        "Free tier with watermark. Paid tiers per editor for branded video, advanced editing, and team features (verified 2026-05-17).",
    },
    hook: {
      pattern: "Aesthetic-differentiated output",
      analysis:
        "Tella videos have a recognizable visual signature (clean backgrounds, layered camera and screen, branded color overlays). A reader who watches a Tella video on someone else's site recognizes the tool by the aesthetic alone, which is the strongest free distribution channel that exists.",
    },
    story: {
      pattern: "Founder-demos-the-product as story",
      analysis:
        "The story is told through founder-recorded demos embedded on the marketing site, which are themselves Tella videos. The recursion makes the demo unfakeable.",
    },
    offer: {
      pattern: "Free-with-watermark plus brand-removal paid trigger",
      analysis:
        "Same structural move as Senja and Tally: free tier with attribution feeds the visible-output flywheel; paid tier removes attribution when the founder is ready to publish to their marketing site without the third-party brand.",
    },
    whatsWorking: [
      "Distinctive output aesthetic makes Tella videos recognizable, turning every shared video into an ad.",
      "Founder-recorded marketing videos are also product demos, so the proof is in the marketing.",
      "Free tier with watermark seeds visible-output presence on social and in shared videos.",
      "Built-in templates produce on-brand output even for non-designer users, raising the floor of what the average customer ships.",
      "Async sales positioning targets a high-willingness-to-pay buyer (sales teams) without abandoning the indie creator market.",
    ],
    whatToAdapt: [
      "If your product produces a visible output, design the output so a third party can identify the tool. Subtle, but discoverable.",
      "Record your own marketing videos with your own product. Eating dog food is a category-truth check.",
      "Raise the floor of what an average user ships. Power-user output is a niche; average-user output is the public face.",
    ],
    whatToAvoid: [
      "Do not over-brand the output to the point where customers fight to remove it. The attribution should be a soft signal, not a billboard.",
      "Do not assume the visible-output flywheel works for non-shareable categories. Internal SaaS produces no public artifacts and the flywheel stalls.",
    ],
    brunsonLens: {
      hook: "Vehicle change (better video output for sales) plus identity positioning ('this is what a serious async pitch looks like').",
      story:
        "Founder demos itself; the marketing video IS the product capability statement.",
      offer:
        "Free-with-watermark plus brand-removal upsell — same Brunson structural move as the Tally / Senja pattern.",
      valueLadderTier:
        "Front-end lead funnel (free with watermark) plus per-editor subscription core.",
    },
    faqs: [
      {
        q: "Why does Tella's output look different from Loom?",
        a: "Because Tella designed the output to be visually identifiable as Tella, including layered camera and screen presentation, configurable backgrounds, and branded overlays. Loom's output is intentionally utilitarian; Tella's output is intentionally polished. The aesthetic IS the differentiation.",
      },
      {
        q: "Should an indie SaaS lead with aesthetic as the wedge?",
        a: "Only when the buyer publishes the output and the publication is the primary use case. Aesthetic-led positioning works for video, design tools, and presentation tools; it fails for backend infrastructure where the output is invisible.",
      },
      {
        q: "What is the Brunson lens on the visible-output flywheel?",
        a: "It is a Dream 100 acquisition mechanic operationalized inside the product. Each customer's audience is exposed to the tool every time a video plays, without the customer needing to recommend it. This is 'work your way in' done by the product itself.",
      },
      {
        q: "Is the free-with-watermark model exhausted as a play?",
        a: "No, but it requires a real value gap between free and paid for the upsell to work. Tools that watermark without delivering proportional paid value see free users disable the watermark with workarounds and never convert.",
      },
    ],
    tags: ["visible-output", "founder-led", "video", "free-tier"],
    homepageUrl: "https://www.tella.tv/",
    lastVerified: "2026-05-17",
  },

  {
    slug: "loops",
    displayName: "Loops",
    creator: "Chris Frantz and team",
    category: "SaaS email platform",
    oneLine:
      "Loops sells the SaaS-specific email job. The funnel ignores marketers and talks to founders.",
    tldr:
      "Loops positions explicitly for SaaS founders rather than for marketers, which is the inverse of how Mailchimp, ConvertKit, and Klaviyo position. The funnel uses SaaS-native vocabulary (loops, transactional, lifecycle, audience segments by Stripe events), so a founder reading the homepage feels seen in a way generic email platforms do not allow. The lesson: name your buyer by their job title in the hero copy.",
    productSnapshot: {
      whatTheySell:
        "An email platform built specifically for SaaS, combining transactional sends, marketing campaigns, and lifecycle loops in one tool.",
      whoFor:
        "SaaS founders and growth teams who want one email platform instead of separate transactional and marketing stacks.",
      pricingNote:
        "Free tier for low subscriber counts. Paid tiers scale by audience size (verified 2026-05-17).",
    },
    hook: {
      pattern: "Buyer-by-job-title naming",
      analysis:
        "The hero names the buyer (SaaS founder, SaaS company) explicitly and refuses to position to anyone else. A SaaS founder reading the page feels addressed; a generic marketer reading the page self-selects out, which is the correct funnel behavior.",
    },
    story: {
      pattern: "Founder-led with category jargon",
      analysis:
        "The marketing copy uses SaaS-native vocabulary (loops, lifecycle, transactional, segments by Stripe event) without translation. This signals 'we understand your stack' faster than any 'built for SaaS' tag line.",
    },
    offer: {
      pattern: "All-in-one priced like a single SaaS tool",
      analysis:
        "Bundling transactional and marketing email at one price escapes the per-feature comparison against Postmark plus Mailchimp. The bundle pricing is the differentiator, not the feature parity.",
    },
    whatsWorking: [
      "Buyer-by-job-title positioning makes the page feel custom-built for the reader.",
      "SaaS-native vocabulary is its own credentialing signal; founders trust the writer who speaks the language.",
      "Bundled transactional plus marketing collapses two purchasing decisions into one.",
      "Founder-led marketing on Twitter from Chris Frantz drives consistent top-of-funnel.",
      "Design language is deliberately modern (similar to Linear, Resend), signalling category membership among the developer-adjacent SaaS tooling cluster.",
    ],
    whatToAdapt: [
      "Name your buyer by job title in the hero. Generic 'for teams' copy converts no one.",
      "Speak the buyer's category vocabulary without translation. Translation reads as outsider.",
      "Bundle features your buyer currently purchases separately, and price the bundle below the sum of the parts.",
    ],
    whatToAvoid: [
      "Do not name a buyer you cannot serve well. Naming SaaS founders means the product must actually work better for SaaS founders than for marketers.",
      "Do not bundle features you do not yet ship at production quality. The bundle promise is fragile until each part is verifiable.",
    ],
    brunsonLens: {
      hook: "Dream Customer naming (Brunson DotCom Secrets Secret 1) in the hero itself — the buyer self-identifies in the first sentence.",
      story:
        "Category-language story: the copy proves the company understands the buyer's world before asking for the sale.",
      offer:
        "Bundled outcome offer at a price below the part sum — Brunson 'Stack' move applied to a SaaS product.",
      valueLadderTier:
        "Front-end lead funnel (free tier) plus subscription core (paid tiers scaled by audience size).",
    },
    faqs: [
      {
        q: "Why does naming the buyer by job title convert better than generic positioning?",
        a: "Because the reader's brain pattern-matches on 'this is for me' before evaluating features. Generic copy forces the reader to translate; named-buyer copy does the translation for them. The hero is the only place this matters, because by the second scroll the reader has either self-identified or left.",
      },
      {
        q: "Can a multi-audience SaaS use named-buyer positioning?",
        a: "Yes, by running separate landing pages per named audience. The home page can stay generic; the high-intent pages per buyer segment do the named-buyer work. Most pre-revenue indie SaaS should ship one named-buyer page first and add others only after proof.",
      },
      {
        q: "What is the Brunson lens on the bundle pricing?",
        a: "The Stack move from Perfect Webinar applied to a SaaS pricing page. Each bundled item is named with its own value, the total perceived value is summed, and the price is positioned as a fraction of the sum. Loops does the structural version of this without the over-the-top stacking aesthetic.",
      },
      {
        q: "Is the all-in-one positioning sustainable?",
        a: "Only if the all-in-one product is genuinely competitive on each part. Bundled SaaS that wins on integration but loses on each feature individually tends to lose to specialist tools as buyers mature. Loops's bet is that integration value compounds over time.",
      },
    ],
    tags: ["named-buyer", "bundling", "founder-led", "saas-tooling"],
    homepageUrl: "https://loops.so/",
    lastVerified: "2026-05-17",
  },

  {
    slug: "polar",
    displayName: "Polar",
    creator: "Birk Jernström and team",
    category: "Creator monetization and payments",
    oneLine:
      "Polar bundled MoR plus creator monetization into a single sell. The funnel targets the open-source maintainer specifically.",
    tldr:
      "Polar combined Merchant of Record payments with creator monetization features (subscriptions, sponsorships, licensing) and pointed the entire funnel at open-source maintainers. The lesson: bundling two compatible categories at a named buyer segment can create a category of one.",
    productSnapshot: {
      whatTheySell:
        "A Merchant of Record platform with subscription, sponsorship, and licensing features designed for open-source maintainers and creators.",
      whoFor:
        "Open-source maintainers, creators, and indie developers who want monetization plus compliance without separately wiring Stripe and a tax platform.",
      pricingNote:
        "Percentage-based pricing per transaction with MoR included. Lower base percentage than some MoR alternatives in exchange for narrower feature surface (verified 2026-05-17).",
    },
    hook: {
      pattern: "Named-segment bundle hook",
      analysis:
        "The hero names open-source maintainers as the buyer and bundles payment, subscription, and sponsorship features at that named segment. A maintainer reading the page sees a tool built for them rather than for generic creators.",
    },
    story: {
      pattern: "Maintainer narratives plus GitHub-native UX",
      analysis:
        "The story is told through GitHub integration, repo-linked monetization, and maintainer-flavored examples. The product itself sits inside the maintainer's workflow, which functions as story by removing the friction the reader expects.",
    },
    offer: {
      pattern: "Single price line for a bundled outcome",
      analysis:
        "Pricing is a single percentage with MoR included. There is no per-feature breakdown to compare against Stripe, Lemon Squeezy, or GitHub Sponsors directly. The single line forces the buyer to evaluate on the bundle outcome.",
    },
    whatsWorking: [
      "Named-segment positioning (open-source maintainers) makes the funnel feel custom-built.",
      "GitHub-native integration removes a setup friction every maintainer expects to deal with.",
      "MoR bundling escapes the per-transaction shootout against Stripe.",
      "Simple percentage pricing collapses the comparison work into one number.",
      "Creator-side and customer-side features (subscriptions, licensing, sponsorships) cover the multi-stream monetization the modern maintainer wants.",
    ],
    whatToAdapt: [
      "If you can credibly serve a named buyer segment better than a generalist tool, lead the funnel with the named segment.",
      "Bundle compatible categories under one price line to escape per-feature comparison.",
      "Embed your product in your buyer's existing workflow surface (GitHub, Slack, Notion, Linear) rather than asking them to come to yours.",
    ],
    whatToAvoid: [
      "Do not name a segment you cannot serve better than the generalist. The named-segment promise is fragile.",
      "Do not bundle categories you do not ship at production quality. A bundle of mediocrities is worse than one good specialist tool.",
    ],
    brunsonLens: {
      hook: "Dream Customer naming (open-source maintainers) plus a New Opportunity (bundled monetization stack) — Brunson Expert Secrets canonical move.",
      story:
        "Workflow-embed story: the product sits inside the buyer's existing tool, so the story is the absence of friction.",
      offer:
        "Bundled outcome at a single price line — Brunson 'Stack' compressed to one number.",
      valueLadderTier:
        "Front-end transactional core (per-payment MoR) plus subscription mechanics for sponsorships and recurring monetization.",
    },
    faqs: [
      {
        q: "How does Polar avoid competing with Stripe directly?",
        a: "By being a Merchant of Record, Polar is in a different legal and operational category than Stripe (a payment processor). The buyer comparing Polar to Stripe is comparing different things, which is what the funnel wants.",
      },
      {
        q: "Why target open-source maintainers specifically?",
        a: "Because the segment has well-known monetization pain (donations are inadequate, GitHub Sponsors is limited), high willingness to adopt new tooling, and a public audience that drives word-of-mouth. The named segment was chosen for funnel reasons, not just product fit.",
      },
      {
        q: "What is the Brunson lens on Polar?",
        a: "Dream Customer naming plus Stack bundling plus a New Opportunity vehicle (MoR creator platform). All three Expert Secrets levers pulled at once, which is rare and effective when the named segment is well-defined.",
      },
      {
        q: "Should every payments SaaS use the MoR positioning?",
        a: "No. MoR is a regulatory and operational decision that constrains the business in real ways (tax obligations, refund handling, KYC). It is the right move when your buyer cannot or will not handle compliance themselves. For other buyers, raw Stripe wins on simplicity.",
      },
    ],
    tags: ["named-buyer", "category-reframe", "developer-tools", "monetization"],
    homepageUrl: "https://polar.sh/",
    lastVerified: "2026-05-17",
  },

  {
    slug: "screen-studio",
    displayName: "Screen Studio",
    creator: "Adam Pietrasiak",
    category: "Screen recording for marketing video",
    oneLine:
      "Screen Studio is a one-person indie business funnel. The output is the marketing.",
    tldr:
      "Screen Studio is a single-developer SaaS that became a category aesthetic. The funnel is short because the output (auto-zoomed, smoothly-animated screen recordings) is so distinctive that any video produced with the tool credentials it on sight. The lesson: a one-person SaaS can win on output recognition alone, without paid acquisition.",
    productSnapshot: {
      whatTheySell:
        "A macOS screen recording app that auto-zooms, smooths cursor motion, and produces high-quality marketing videos from raw screen captures.",
      whoFor:
        "Indie SaaS founders, designers, and creators producing product demos and tutorial videos who do not want to learn video editing software.",
      pricingNote:
        "One-time license fee with optional yearly updates. No subscription (verified 2026-05-17).",
    },
    hook: {
      pattern: "Output sample as hero",
      analysis:
        "The hero is a sample video produced by the tool. The reader watches three seconds of polished output and either wants it or does not, with no copy required for the decision.",
    },
    story: {
      pattern: "Solo-founder transparency",
      analysis:
        "Adam (the founder) writes the marketing, ships the updates, and posts the changelog on Twitter. The reader knows they are buying from a person, not a venture-backed product team. This is the indie-founder buyer's preferred shape.",
    },
    offer: {
      pattern: "One-time license at a premium price",
      analysis:
        "Pricing is a one-time fee at a level that screens out casual buyers but is trivial for any working professional whose video output reflects on their company. The single line removes pricing-page friction entirely.",
    },
    whatsWorking: [
      "Output-as-hero compresses the full funnel into one autoplaying sample.",
      "One-time pricing escapes the subscription-fatigue objection that hits creator-tool SaaS hardest.",
      "Solo-founder identity is the trust signal; the buyer is buying from Adam, not from a faceless company.",
      "Distinctive aesthetic (auto-zoom, smooth cursor) makes every output instantly recognizable, seeding the visible-output flywheel.",
      "Twitter changelog posts are the marketing channel, free and continuous.",
    ],
    whatToAdapt: [
      "If you are a one-person SaaS, lead with your face, your name, and your output. The indie buyer prefers buying from a person.",
      "If your output is visually distinctive, design the output to be recognizable so every shared sample is free marketing.",
      "Consider one-time pricing for tools that produce a discrete output rather than ongoing utility. Subscription is not the only valid model.",
    ],
    whatToAvoid: [
      "Do not adopt the solo-founder positioning if you are not solo. The trust signal is fake and the buyer will eventually find out.",
      "Do not use one-time pricing for tools that require ongoing infrastructure costs (servers, send volume, API calls). The economics fail.",
    ],
    brunsonLens: {
      hook: "Output-sample hook (Brunson 'show the result') executed as the full hero.",
      story:
        "Attractive Character (Brunson Expert Secrets) embodied by the founder; the reader buys from Adam specifically.",
      offer:
        "Single price line, one-time, no upsells — the simplest Value Ladder shape.",
      valueLadderTier:
        "Single-rung transactional offer (no front-end free tier; no subscription core).",
    },
    faqs: [
      {
        q: "Why does Screen Studio not have a free trial?",
        a: "Because the output sample on the homepage IS the trial. The reader watches the autoplaying demo and decides whether they want that output. A traditional download trial would add friction without changing the decision the reader already made.",
      },
      {
        q: "Should a one-person SaaS always price one-time?",
        a: "Only when the tool produces discrete outputs and has no ongoing infrastructure cost. Subscription is the right move when the tool runs continuously on the buyer's behalf (analytics, monitoring, email sending). The pricing model should follow the value shape, not founder preference.",
      },
      {
        q: "What is the Brunson lens on Screen Studio's funnel?",
        a: "Attractive Character anchored to a single founder, output-sample as proof, single transactional offer. The simplest possible Value Ladder shape, made viable by a category where the output is the proof.",
      },
      {
        q: "Can a SaaS without distinctive output use this funnel?",
        a: "No. Screen Studio's funnel works because the output is the marketing. A SaaS with invisible output (backend infrastructure, internal tooling) needs a different funnel shape entirely.",
      },
    ],
    tags: ["solo-founder", "visible-output", "one-time-pricing", "attractive-character"],
    homepageUrl: "https://www.screen.studio/",
    lastVerified: "2026-05-17",
  },
];

// Indexed lookup. Module-level Map for O(1) access — pattern from
// rules/js-index-maps.md in the Vercel React Best Practices guide.
const TEARDOWNS_BY_SLUG: Map<string, FunnelTeardown> = new Map(
  TEARDOWNS_LIST.map((t) => [t.slug, t]),
);

/** Read-only catalog. Iteration order is canonical. */
export const TEARDOWNS: ReadonlyArray<FunnelTeardown> = TEARDOWNS_LIST;

/** Slug list for generateStaticParams and sitemap.ts. */
export const TEARDOWN_SLUGS: ReadonlyArray<string> = TEARDOWNS_LIST.map(
  (t) => t.slug,
);

export function getTeardownBySlug(slug: string): FunnelTeardown | undefined {
  return TEARDOWNS_BY_SLUG.get(slug);
}

/**
 * Return up to `limit` teardowns that share at least one tag with the given
 * slug, excluding the slug itself. Powers the "Related teardowns" footer
 * block on each detail page; the internal linking graph it produces is what
 * lets Google crawl batch updates efficiently and gives LLMs more anchor
 * points per query.
 */
export function getRelatedTeardowns(
  slug: string,
  limit: number = 4,
): ReadonlyArray<FunnelTeardown> {
  const seed = TEARDOWNS_BY_SLUG.get(slug);
  if (!seed) return [];
  const seedTags = new Set(seed.tags);

  const scored = TEARDOWNS_LIST.filter((t) => t.slug !== slug)
    .map((t) => {
      const overlap = t.tags.filter((tag) => seedTags.has(tag)).length;
      return { teardown: t, overlap };
    })
    .filter((x) => x.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap);

  return scored.slice(0, limit).map((x) => x.teardown);
}

/**
 * Group teardowns by category for the hub page. Maintains catalog ordering
 * within each category bucket.
 */
export function groupTeardownsByCategory(): ReadonlyArray<{
  category: string;
  teardowns: ReadonlyArray<FunnelTeardown>;
}> {
  const order: string[] = [];
  const buckets: Map<string, FunnelTeardown[]> = new Map();
  for (const t of TEARDOWNS_LIST) {
    if (!buckets.has(t.category)) {
      buckets.set(t.category, []);
      order.push(t.category);
    }
    buckets.get(t.category)!.push(t);
  }
  return order.map((category) => ({
    category,
    teardowns: buckets.get(category)!,
  }));
}
