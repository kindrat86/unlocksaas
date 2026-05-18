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
 *   through Brunson Hook-Story-Offer — which is exactly what the Playbook
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
 * Brunson lens — how each teardown maps to the framework the Playbook
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

  {
    slug: "notion",
    displayName: "Notion",
    creator: "Ivan Zhao, Simon Last and team",
    category: "Productivity and workspace",
    oneLine:
      "Notion's funnel turns personal free use into team-paid revenue. The free tier is the acquisition channel; the team-collaboration friction is the upgrade trigger.",
    tldr:
      "Notion's funnel is the canonical personal-free-leads-to-team-paid pattern. Personal free use is genuinely valuable, which seeds adoption inside companies; team-collaboration friction (guest limits, version history, SSO) creates the structural upgrade trigger. The lesson for indie founders: when your buyer's individual use creates artifacts a team will eventually want to share, free-personal can be the most efficient acquisition channel.",
    productSnapshot: {
      whatTheySell:
        "A workspace product combining notes, docs, wikis, databases, and project management in one canvas.",
      whoFor:
        "Individuals, small teams, and growing companies who want a flexible workspace instead of separate tools per use case.",
      pricingNote:
        "Free personal tier; Plus ~$10/seat/mo, Business ~$18/seat/mo, Enterprise custom; AI add-on ~$8-10/seat/mo (verified 2026-05-17).",
    },
    hook: {
      pattern: "Identity-based positioning",
      analysis:
        "The hero appeals to who the reader wants to BE (someone who has their thinking organized in one place) rather than what the tool does. The screenshot rotations show real-looking workspaces from different roles, so the reader self-identifies before evaluating features. Identity-based hooks compress evaluation when the category is broad enough that feature-comparison would lose the reader.",
    },
    story: {
      pattern: "Template gallery as social proof",
      analysis:
        "Story is told through a vast template gallery showing what real people have built. The reader does not need to take a marketing claim on faith because the artifacts are linked. Templates also serve as on-ramp scaffolding — many users copy a template as their starting point, which lowers activation cost.",
    },
    offer: {
      pattern: "Free-personal plus seat-ladder team upsell",
      analysis:
        "Personal free is the offer floor; team-tier upgrades fire at the collaboration boundary (guest limits, version history, SSO). AI is priced as an orthogonal add-on rather than a tier, which lets Notion add revenue without disturbing seat psychology. The structure is a textbook Value Ladder with each rung mapped to a natural team-growth event.",
    },
    whatsWorking: [
      "Personal-free tier is good enough for real individual use, seeding viral adoption inside companies.",
      "Team-collaboration boundary as upgrade trigger captures conversion at the moment a personal tool becomes a team tool.",
      "Template gallery doubles as long-tail SEO and as activation scaffolding for new users.",
      "AI priced as add-on (not as tier) lets Notion capture incremental revenue without restructuring the seat ladder.",
      "Identity-based hero meets the broad category where feature-comparison would lose readers.",
      "Custom Enterprise tier handles the largest deals without exposing the price to seat-counting competitors.",
    ],
    whatToAdapt: [
      "Free-personal can be the most efficient acquisition channel when your buyer's individual use creates artifacts a team will eventually want to share.",
      "Price new feature categories as add-ons rather than tiers when they cut across the existing seat structure.",
      "Use templates as both SEO surface and activation scaffolding — they compress the time from signup to first valuable use.",
    ],
    whatToAvoid: [
      "Do not launch personal-free without unit economics that support it. Notion has venture funding and a long horizon.",
      "Do not adopt seat-based pricing if individual seats do not get clear individual value.",
      "Do not build a template gallery before you have users to populate it; an empty gallery is worse than no gallery.",
    ],
    brunsonLens: {
      hook: "Identity hook (Brunson Expert Secrets) — the reader buys the version of themselves who has their thinking organized.",
      story:
        "Hero's-Journey-via-templates: each template represents a real person's solved problem; the reader is invited to copy the pattern.",
      offer:
        "Full Value Ladder embedded inside one product: free personal → paid team → enterprise → AI continuity add-on across all rungs.",
      valueLadderTier:
        "Front-end lead funnel (free personal) plus per-seat subscription core (Plus, Business, Enterprise) plus continuity add-on (AI).",
    },
    faqs: [
      {
        q: "Why is Notion's free tier so generous?",
        a: "Because the free tier IS the acquisition channel. A personal user who builds a real workspace eventually brings that workspace into their team — at which point the collaboration boundary fires the upgrade trigger. Generous free pays back through team-paid conversion that a stingy free tier would never trigger.",
      },
      {
        q: "Can an indie SaaS copy Notion's free-personal model?",
        a: "Only when your unit economics support it AND when individual use produces artifacts that a team will want to share. Notion's free-personal works because both conditions are met. Most indie SaaS fail at least one — and ship freemium that bleeds money without converting.",
      },
      {
        q: "Why is AI priced as an add-on, not a tier?",
        a: "Because AI cuts across the existing seat structure. Making it a tier would force users to choose between AI features and other tier features. As an add-on it captures AI revenue from every tier without restructuring the seat ladder.",
      },
      {
        q: "What is the Brunson lens on Notion's funnel?",
        a: "Identity hook plus template-gallery story plus a four-rung Value Ladder with AI as continuity-program upsell. Textbook Brunson structure executed at scale; the identity hook is the most-replicable move for indie founders in broad categories.",
      },
      {
        q: "How does Unlock SaaS think about Notion's pattern?",
        a: "The team-collaboration trigger is a model for any SaaS where individual use eventually requires sharing. The harder lesson is the unit-economics discipline — Notion can afford the free tier because the team-conversion rate is high enough to fund it. Without that math, the pattern fails.",
      },
    ],
    tags: ["identity-hook", "freemium", "team-trigger", "value-ladder", "template-gallery"],
    homepageUrl: "https://www.notion.so/",
    lastVerified: "2026-05-17",
  },

  {
    slug: "linear",
    displayName: "Linear",
    creator: "Karri Saarinen, Tuomas Artman, Jori Lallo",
    category: "Project management for software teams",
    oneLine:
      "Linear's funnel is restraint as positioning. The hero, the page, the product, and the pricing all communicate one message: software teams who hate process bloat.",
    tldr:
      "Linear's funnel makes minimalism the marketing. The hero, the screenshots, the pricing page, and the product itself all signal the same value: software teams who reject configurability for speed. The lesson for indie founders: when your audience resents the dominant incumbent's specific structural choice, naming that rejection and embodying its opposite is the highest-conversion positioning available.",
    productSnapshot: {
      whatTheySell:
        "Issue tracking and project management built for high-velocity software teams.",
      whoFor:
        "Software engineering teams from startup to scale-up who reject Jira's complexity.",
      pricingNote:
        "Free tier (250 issues); Basic ~$8-10/user/mo, Business ~$14/user/mo, Enterprise custom (verified 2026-05-17).",
    },
    hook: {
      pattern: "Aesthetic-as-positioning",
      analysis:
        "The hero is a single screenshot of the product working fast. There is no manifesto, no industry-problem framing, no founder narrative on the first scroll. The implicit argument is: if you have used Jira and resent it, you already know why Linear exists; the rest of the page just confirms. The aesthetic compression IS the positioning.",
    },
    story: {
      pattern: "Implied-rejection-of-incumbent",
      analysis:
        "Linear never names Jira directly on the marketing surface, but the entire page reads as 'this is what issue tracking looks like when it does not feel like Jira.' The story is told by absence — no configurability theater, no admin-required workflows, no enterprise gravitas. Readers who have lived in Jira recognize the contrast instantly.",
    },
    offer: {
      pattern: "Restrained price ladder",
      analysis:
        "Free tier with a structural cap (250 issues), Basic that removes the cap, Business that adds team-scale features (cycles, roadmaps), Enterprise that handles procurement. Pricing-page minimalism is so consistent it becomes its own message: 'we trust you to read four rows.' The restraint signals product confidence the way a verbose page signals defensiveness.",
    },
    whatsWorking: [
      "Aesthetic minimalism IS positioning when your audience resents tooling complexity.",
      "Implied rejection of Jira is the entire story; naming Jira would weaken the move.",
      "Volume cap on free tier maps to natural team growth, not arbitrary feature gating.",
      "Layered upgrade triggers (volume first, then workflow features) ensure conversion fires across buyer paths.",
      "Single screenshot in hero compresses category recognition; no scrolling needed to understand what Linear is.",
      "Founder-led marketing on Twitter (Karri Saarinen, Tuomas Artman) anchors the brand to credible humans.",
    ],
    whatToAdapt: [
      "If your audience resents the incumbent's structural decision (configurability, complexity, gatekeeping), embody the opposite without naming the incumbent. Implied rejection is stronger than direct attack.",
      "Use volume caps on free tier when usage scales with team success; map the trigger to natural growth events.",
      "Trust the reader's intelligence. Restrained pages signal product confidence; verbose pages signal defensiveness.",
    ],
    whatToAvoid: [
      "Do not adopt restrained positioning if your buyer requires per-feature breakdowns to justify procurement.",
      "Do not name the incumbent directly when implied rejection is stronger. Naming Jira would force comparison-shopping; not naming forces self-identification.",
      "Do not skip an Enterprise tier; procurement-driven buyers need the option even if most never take it.",
    ],
    brunsonLens: {
      hook: "Aesthetic-positioning hook (rare in Brunson canon but legitimate) — the page's restraint is the message.",
      story:
        "Implied-villain story (Brunson 'Common Enemy' executed without naming the enemy) — readers who have lived in Jira recognize the contrast.",
      offer:
        "Restrained four-rung Value Ladder with a structural free-tier cap as the volume trigger and feature unlocks as the workflow trigger.",
      valueLadderTier:
        "Front-end lead funnel (free with cap) plus per-seat subscription core (Basic, Business) plus high-ticket Enterprise back-end.",
    },
    faqs: [
      {
        q: "Why does Linear not mention Jira on the marketing site?",
        a: "Because implied rejection converts better than direct attack for this audience. A page that names Jira invites comparison-shopping; a page that embodies the opposite of Jira lets readers self-identify as 'someone who wants this kind of tool.' The audience does not need to be told what Linear is rejecting.",
      },
      {
        q: "Can an indie SaaS use aesthetic-as-positioning?",
        a: "Only when your audience values restraint and resents complexity. Developer-tool, modern-productivity, and design-conscious audiences respond well. Procurement-driven and feature-list audiences do not — they read restraint as missing features.",
      },
      {
        q: "Why is Linear's pricing page so short?",
        a: "Same reason the rest of the marketing is short: the page's brevity IS the positioning. A long pricing page would contradict the product promise. Trust the reader to read four tiers.",
      },
      {
        q: "What is the Brunson lens on Linear's funnel?",
        a: "Aesthetic-positioning hook plus implied-villain story plus restrained four-rung Value Ladder. The unusual move is the deliberate absence of explicit Common Enemy naming — Linear trusts the audience to recognize the implied incumbent. This works because the audience has all lived in Jira; it would fail with a less-shared incumbent.",
      },
      {
        q: "How does Unlock SaaS apply this lesson?",
        a: "Indie SaaS founders often over-explain their differentiation. The Linear lesson: if your audience already lives the pain you reject, you can show the alternative without explaining the rejection. The shorter page often outconverts the longer one when the audience-incumbent context is shared.",
      },
    ],
    tags: ["aesthetic-positioning", "implied-villain", "developer-tools", "restraint", "minimalism"],
    homepageUrl: "https://linear.app/",
    lastVerified: "2026-05-17",
  },

  {
    slug: "vercel",
    displayName: "Vercel",
    creator: "Guillermo Rauch and team",
    category: "Frontend cloud and hosting",
    oneLine:
      "Vercel's funnel runs through Next.js. The hosting is the product; the framework is the acquisition channel; the developer community is the distribution.",
    tldr:
      "Vercel's funnel works because Vercel maintains Next.js, which makes Next.js documentation, examples, and community content effectively a permanent acquisition channel for Vercel hosting. The lesson for indie founders: owning the canonical reference for a tool in your category creates compounding distribution that paid acquisition cannot match.",
    productSnapshot: {
      whatTheySell:
        "A frontend cloud platform with hosting, serverless functions, edge networking, and platform services (AI Gateway, Blob, Edge Config) for modern web apps.",
      whoFor:
        "Developers, startups, and enterprises building modern web applications, particularly those using Next.js or React.",
      pricingNote:
        "Hobby tier free (no commercial use); Pro ~$20/user/mo plus metered overages; Enterprise custom (verified 2026-05-17).",
    },
    hook: {
      pattern: "Framework-coupled-hosting",
      analysis:
        "The hero leads with Next.js capability and the hosting follows implicitly. Developers learning Next.js encounter Vercel inside the Next.js documentation, the Next.js examples, the deployment quick-starts. The hook is not 'come use Vercel' — it is 'come learn Next.js, the canonical platform happens to be Vercel.' This is the canonical Dream 100 play executed at platform scale.",
    },
    story: {
      pattern: "Founder-led plus ecosystem-led",
      analysis:
        "Story is layered: Guillermo Rauch's personal Twitter presence, the Vercel changelog, the Next.js release notes, the AI SDK blog, the customer case studies. Each layer reinforces the others. The story is built continuously through publishing rather than told in a marketing campaign.",
    },
    offer: {
      pattern: "Commercial-use boundary plus metered overages",
      analysis:
        "Hobby tier is generous; commercial use is forbidden. This is a structural upgrade trigger that fires precisely when the customer starts earning revenue. Pro at $20/user/mo plus metered usage means revenue scales with customer success without bill-shock. Enterprise is a sales conversation. Clean alignment between offer mechanics and customer state.",
    },
    whatsWorking: [
      "Framework ownership (Next.js) creates a permanent acquisition channel through documentation, examples, and community content.",
      "Commercial-use boundary as upgrade trigger fires conversion at the exact moment customers start earning revenue.",
      "Round Pro price ($20/user/mo) is memorable and signals confidence rather than micro-optimized pricing.",
      "Founder-led marketing through Guillermo Rauch's Twitter presence anchors the brand to a credible human.",
      "Metered usage scales with customer success, lowering commitment friction.",
      "AI SDK and AI Gateway extend the product surface into adjacent value without disturbing the core hosting model.",
      "Customer case studies on the marketing site lean into recognizable companies, borrowing authority into the platform.",
    ],
    whatToAdapt: [
      "If you can own the canonical reference (framework, tool, standard) in your category, the documentation becomes a permanent acquisition channel.",
      "Use structural upgrade triggers (commercial use, scale threshold) rather than feature gates when possible. Structural triggers fire at value moments.",
      "Round, memorable headline prices signal product confidence; odd numbers invite comparison-shopping.",
    ],
    whatToAvoid: [
      "Do not free commercial use if your competitive position depends on monetizing small commercial users.",
      "Do not adopt metered usage if your customer cannot predict their bill — bill-shock is the biggest churn driver in usage-priced SaaS.",
      "Do not invest in maintaining a canonical reference unless you can sustain that investment for years; the acquisition channel only compounds with continued maintenance.",
    ],
    brunsonLens: {
      hook: "Dream 100 framework hook (Brunson canonical move) — own the canonical reference in your category and the audience comes to you.",
      story:
        "Continuous-publishing story across multiple layers (founder, changelog, blog, case studies) — the Brunson 'Attractive Character' compounded through ecosystem.",
      offer:
        "Three-rung Value Ladder with structural commercial-use trigger plus metered overages — Brunson 'two-step upsell' (subscription core plus usage upgrade) executed through alignment with customer state.",
      valueLadderTier:
        "Front-end lead funnel (Hobby) plus subscription core (Pro) plus high-ticket Enterprise back-end.",
    },
    faqs: [
      {
        q: "Why does Vercel maintain Next.js as open source?",
        a: "Because the framework IS the acquisition channel. Every Next.js learner encounters Vercel inside the documentation; every Next.js project deploys to Vercel by default. The cost of maintaining Next.js is the cost of the acquisition channel — and it is more efficient than any paid alternative.",
      },
      {
        q: "Can an indie SaaS use the framework-coupled-hosting pattern?",
        a: "Rarely directly, because few indie SaaS can credibly maintain a framework. The transferable lesson is owning a canonical reference (an open-source tool, a published standard, a definitive guide) in your category. The reference becomes a permanent acquisition surface.",
      },
      {
        q: "Why is the commercial-use boundary on Hobby so strict?",
        a: "Because the boundary IS the upgrade trigger. Vercel's Hobby tier is generous because Pro conversion fires the moment a project earns revenue, which is the moment willingness-to-pay rises. Without the commercial-use restriction, the conversion rate would collapse.",
      },
      {
        q: "What is the Brunson lens on Vercel's funnel?",
        a: "Dream 100 framework hook plus continuous-publishing story plus three-rung Value Ladder with structural upgrade triggers. The framework ownership is the Brunson 'congregations are easier to convert than individuals' principle executed at scale — the Next.js learner is a pre-qualified Vercel customer.",
      },
    ],
    tags: ["framework-ownership", "dream-100", "developer-tools", "usage-based", "founder-led"],
    homepageUrl: "https://vercel.com/",
    lastVerified: "2026-05-17",
  },

  {
    slug: "figma",
    displayName: "Figma",
    creator: "Dylan Field and team",
    category: "Design and prototyping",
    oneLine:
      "Figma's funnel turns viewers into ads. Every shared design file is a Figma demo running on someone else's site.",
    tldr:
      "Figma's funnel works because viewers, commenters, developers, and clients all encounter Figma at zero cost when designers share files. Per-editor pricing means the high-multiplier role (viewer) is free and the value-capture role (editor) pays. The lesson for indie founders: if your product has a high viewer-to-editor ratio, freeing the viewer turns shared output into a permanent acquisition channel.",
    productSnapshot: {
      whatTheySell:
        "Collaborative design and prototyping in the browser, plus FigJam whiteboard and Slides.",
      whoFor:
        "Designers, product teams, agencies, and developers who collaborate on design.",
      pricingNote:
        "Starter free; Professional ~$15/editor/mo, Organization ~$45/editor/mo, Enterprise ~$75/editor/mo (verified 2026-05-17). Viewers free.",
    },
    hook: {
      pattern: "Network-effect-as-demo",
      analysis:
        "The hero shows a design file with multiple cursors moving — real-time collaboration as the differentiator. Designers who have used the older generation of design tools (Sketch, Adobe XD) recognize the move from file-based to browser-native instantly. The hook is a single visual: many people in one file. Compression beats explanation.",
    },
    story: {
      pattern: "Customer-roster authority borrow",
      analysis:
        "Story is told through visible logo bar of design teams at well-known companies. Each logo borrows authority into the platform; design-conscious buyers recognize the pattern (if Spotify, Airbnb, and GitHub use Figma, the question shifts from 'is this credible' to 'why are we not using this'). Borrowed authority compresses trust-building when the logos are credible to the buyer.",
    },
    offer: {
      pattern: "Per-editor with viewer-free leverage",
      analysis:
        "The structural pricing decision is the entire funnel: viewers, commenters, developers, and clients all access files for free; only editors pay. This makes every shared file a viral acquisition asset. Editor-tier pricing (Professional, Organization, Enterprise) creates a clear value ladder; the Enterprise anchor at $75/editor/mo makes Professional at $15/editor/mo feel reasonable.",
    },
    whatsWorking: [
      "Viewer-free model turns every shared file into a free demo on someone else's site.",
      "Per-editor pricing aligns revenue with value-capture role and frees the discovery role.",
      "Triple-anchor pricing (Enterprise high, Organization middle, Professional accessible) makes the most-purchased tier feel like the deal.",
      "Real-time collaboration as hero compresses category-recognition for designers who have used file-based tools.",
      "Visible customer roster borrows authority from credible design-conscious companies.",
      "FigJam and Slides expansion into adjacent use cases captures revenue without disturbing the core design pricing.",
    ],
    whatToAdapt: [
      "If your product has a high viewer-to-editor multiplier, free the viewer and price the editor. The viewers become your acquisition channel.",
      "Use Enterprise-tier pricing as a visible anchor even if few buyers reach that tier; anchoring works on visible price, not on revenue mix.",
      "Visible customer rosters work when the logos are credible to your buyer's category. Mismatched logos hurt more than they help.",
    ],
    whatToAvoid: [
      "Do not free viewers if your viewer role IS the buyer (e.g. analytics dashboards where the executive viewing is the one paying).",
      "Do not seek a customer-logo bar before you have customers; empty grids signal absence more than presence.",
      "Do not assume per-editor pricing works for non-collaborative products. The multiplier model requires shared output.",
    ],
    brunsonLens: {
      hook: "Visual-differentiation hook (real-time collaboration as the entire visible category difference) executed in a single screenshot.",
      story:
        "Borrowed-authority story (Brunson Expert Secrets 'Authority Hack') executed through visible customer logos in the buyer's own category.",
      offer:
        "Four-rung Value Ladder with viewer-free acquisition rung that does not count toward seat revenue.",
      valueLadderTier:
        "Front-end lead funnel (viewer-free) plus three-tier per-editor subscription core (Professional, Organization, Enterprise).",
    },
    faqs: [
      {
        q: "Why is Figma's viewer access free?",
        a: "Because viewers are the acquisition channel. Every shared design file exposes developers, PMs, and clients to Figma at zero cost. The viewer role drives discovery; the editor role drives revenue. Pricing this way maximizes both metrics simultaneously.",
      },
      {
        q: "Can an indie SaaS use per-editor pricing?",
        a: "Only when there is a clear distinction between roles AND viewers are abundant relative to editors. Design tools, documentation, dashboards, and collaboration products usually fit. Single-user productivity tools and admin-panel SaaS do not.",
      },
      {
        q: "Why does Figma show customer logos so prominently?",
        a: "Because the buyer (designer or design-leader) recognizes the logos as credible peers. Borrowed authority from credible logos compresses the trust-building step in evaluation. The logos do not work in audiences that do not recognize them as peers.",
      },
      {
        q: "What is the Brunson lens on Figma's funnel?",
        a: "Visual-differentiation hook plus borrowed-authority story plus per-editor Value Ladder. The viewer-free rung is unusual — it generates zero revenue but is structurally critical to the funnel's compounding acquisition. This is the Brunson 'Dream 100 channel' executed as a product feature rather than a marketing campaign.",
      },
      {
        q: "How does Unlock SaaS think about Figma's pattern?",
        a: "Per-editor pricing is the transferable lesson for any SaaS where the production role and the consumption role diverge. The harder lesson is that the viewer-free model has to be designed in from the start; retrofitting it later breaks the unit economics.",
      },
    ],
    tags: ["per-editor", "viewer-free", "borrowed-authority", "collaboration", "design"],
    homepageUrl: "https://www.figma.com/",
    lastVerified: "2026-05-17",
  },

  {
    slug: "stripe",
    displayName: "Stripe",
    creator: "Patrick and John Collison",
    category: "Payments infrastructure",
    oneLine:
      "Stripe's funnel is documentation. The marketing site sets the appointment; the docs close the deal; the brand is built one developer at a time.",
    tldr:
      "Stripe's funnel is structured around developers evaluating payment infrastructure: the marketing site states the simple proposition, the documentation answers every implementation question, the case studies anchor the brand to credible companies. The lesson for indie founders: when your buyer evaluates by trying the product, documentation IS the closing surface and should be treated as part of the funnel.",
    productSnapshot: {
      whatTheySell:
        "Payment processing infrastructure with subscriptions, billing, fraud prevention, payouts, and a deep API ecosystem.",
      whoFor:
        "Developers, indie SaaS, growing companies, and enterprises accepting payments online.",
      pricingNote:
        "2.9% + 30¢ per successful charge (US standard, verified 2026-05-17). Custom pricing at scale.",
    },
    hook: {
      pattern: "Single-line value proposition",
      analysis:
        "The hero communicates one promise: 'payments infrastructure for the internet.' There is no story, no founder narrative, no industry framing. The implicit argument is that developers know what they need from a payments platform and the hero exists to confirm Stripe is that thing. Compression beats persuasion when the buyer is already qualified.",
    },
    story: {
      pattern: "Documentation-as-story",
      analysis:
        "The story is in the docs, not the marketing site. Stripe's documentation is famous in developer circles for clarity, completeness, and code samples in every major language. The docs are the closing surface — a developer evaluating Stripe reads them while deciding, and the experience of reading them tells the story that the marketing copy cannot.",
    },
    offer: {
      pattern: "Single transparent rate plus custom enterprise",
      analysis:
        "Headline pricing is one line: 2.9% + 30¢. No setup fees, no monthly fees, no minimum volume. This simplicity is the entire pricing-page argument — developers evaluating against PayPal, Square, or legacy processors see the simplest comparison and convert without deeper analysis. Enterprise pricing exists behind a sales conversation, which captures large deals without exposing volume discounts.",
    },
    whatsWorking: [
      "Documentation as closing surface — clarity and completeness compress evaluation time materially.",
      "Single round percentage (2.9%) signals confidence and removes pricing-comparison friction.",
      "Case studies feature recognizable companies, borrowing authority from category-credible brands.",
      "Add-on products (Connect, Atlas, Tax, Radar, Billing) priced on their own pages prevent main pricing-page clutter.",
      "Founder-credible (Patrick Collison's Twitter and writing) anchors the brand to humans who understand the developer audience.",
      "International expansion published as documentation events, not marketing campaigns, matches the developer audience's preference for substance over splash.",
    ],
    whatToAdapt: [
      "If your buyer evaluates by trying the product, treat documentation as part of the funnel. Bad docs are a leak; great docs compress evaluation.",
      "Single-line round pricing signals confidence and removes the comparison-shopping friction that detailed tier pages create.",
      "Case studies work when the logos are credible to your buyer's category. Match the logos to the audience.",
    ],
    whatToAvoid: [
      "Do not adopt single-line pricing if your unit economics require negotiation at certain volume bands; you need at least a custom tier.",
      "Do not over-invest in documentation polish if your product is not stable enough to warrant it; rapidly changing docs are worse than minimal ones.",
      "Do not use case-study logos if you do not have the customers; aspirational logos signal absence.",
    ],
    brunsonLens: {
      hook: "Single-line value-proposition hook (Brunson 'one-sentence pitch') for an already-qualified audience.",
      story:
        "Documentation-as-story (rare in Brunson canon but legitimate) — the docs are the proof asset, more credible than any case study.",
      offer:
        "Single transparent rate plus custom enterprise — Brunson 'simplicity-as-anchor' move that removes comparison-shopping mental math.",
      valueLadderTier:
        "Single transactional rung with custom enterprise back-end and add-on products as parallel ladders.",
    },
    faqs: [
      {
        q: "Why is Stripe's marketing site so simple?",
        a: "Because the docs do the work. Developers evaluating Stripe spend most of their evaluation time reading documentation and implementing test transactions; the marketing site exists to send qualified developers to the docs, not to convince. Simplicity matches the actual conversion path.",
      },
      {
        q: "Can an indie SaaS make documentation the closing surface?",
        a: "Yes, when your buyer is technical. The documentation has to be genuinely good — code samples that work, clear structure, examples covering the common use cases. Polished docs paired with mediocre product fail; great product paired with bad docs fails. Both matter.",
      },
      {
        q: "Why is the headline price a round percentage?",
        a: "Because 2.9% is memorable and signals confidence. '2.87%' would invite comparison-shopping mental math; '2.9%' reads as a deliberate price the customer can recall after closing the tab. Round numbers function as anchors more reliably than optimized ones.",
      },
      {
        q: "What is the Brunson lens on Stripe's funnel?",
        a: "Single-line value-proposition hook plus documentation-as-story plus single-rate-plus-custom Value Ladder. The unusual move is that the marketing site is intentionally lightweight while the docs are heavyweight — the funnel inverts what most marketers would design. It works because the audience prefers substance to splash.",
      },
      {
        q: "How does Unlock SaaS apply this lesson?",
        a: "For technical buyers, the post-marketing surface (docs, onboarding, first-use experience) often matters more than the marketing site itself. Founders who pour effort into landing pages while shipping bad onboarding leave money on the table that better docs would have captured.",
      },
    ],
    tags: ["documentation-as-funnel", "simplicity", "developer-tools", "single-line-pricing"],
    homepageUrl: "https://stripe.com/",
    lastVerified: "2026-05-17",
  },

  {
    slug: "fathom",
    displayName: "Fathom Analytics",
    creator: "Jack Ellis and Paul Jarvis",
    category: "Privacy analytics",
    oneLine:
      "Fathom's funnel runs on founder-led indie credibility. Jack Ellis and Paul Jarvis write the marketing, build the product, and answer the support emails — and the audience trusts them for it.",
    tldr:
      "Fathom Analytics's funnel is built on founder-led indie credibility. Jack Ellis and Paul Jarvis are visible across Twitter, the blog, and customer support, and the marketing leans into the small-team-shipping-quietly aesthetic that privacy-leaning buyers respond to. The lesson for indie founders: when your audience is values-aligned, founder visibility IS the brand and beats anonymous-SaaS positioning at scale.",
    productSnapshot: {
      whatTheySell:
        "A privacy-focused, cookie-free web analytics SaaS positioned as the ethical alternative to Google Analytics.",
      whoFor:
        "Indie founders, small SaaS, and privacy-leaning teams in the EU and beyond who do not want to deal with cookie banners or GDPR overhead.",
      pricingNote:
        "Volume-tiered subscription starting low for hobby sites and scaling with pageviews. Hosted only (no self-host) (verified 2026-05-17).",
    },
    hook: {
      pattern: "Founder-led-as-trust-signal",
      analysis:
        "The hero leads with the same principled positioning Plausible uses (privacy, no cookies, GDPR-by-construction) but with a different texture: Fathom feels like a small focused product run by two recognizable humans. The founder-led trust signal compresses category-evaluation time because privacy-aligned buyers are buying from a person they can verify, not a faceless SaaS.",
    },
    story: {
      pattern: "Quiet competence narrative",
      analysis:
        "The story is told across Jack and Paul's individual blogs, podcast appearances, and Twitter presences. The marketing site is calm and confident; the broader content arc reinforces 'we ship steadily, we do not chase venture money, we answer your support emails.' This narrative shape converts buyers who actively dislike VC-funded marketing aesthetics.",
    },
    offer: {
      pattern: "Subscription with structural cap on free trial",
      analysis:
        "Free 30-day trial; paid tiers scale by pageviews after that. No self-host (unlike Plausible). The offer mechanics are conventional but the brand voice carries the conversion work — buyers trust Jack and Paul to ship what they promise without aggressive upsells.",
    },
    whatsWorking: [
      "Two founders visible across Twitter, blogs, and customer support — the brand is the humans.",
      "Quiet-competence aesthetic differentiates against louder venture-funded analytics players.",
      "Volume-tiered pricing aligns the bill with customer success and platform cost.",
      "Same principle stack as Plausible (privacy, GDPR-by-construction, cookie-free) — the category fight is values-aligned not values-divided.",
      "Long-running founder content (Jack's Calm Fund work, Paul's writing) gives prospects a deep prior on the operators before they buy.",
      "Active customer support visible publicly — buyers see Jack and Paul responding to issues on Twitter, which is its own credibility signal.",
    ],
    whatToAdapt: [
      "If your audience is values-aligned, founder visibility IS the brand. Get on the marketing surface yourself rather than hiring marketers to speak for you.",
      "Long-running personal content (Twitter, blog, podcast) compounds into a deep prior buyers can verify before purchase.",
      "Active visible customer support is a trust signal that scales — buyers who see you respond to other customers conclude you will respond to them too.",
    ],
    whatToAvoid: [
      "Do not adopt founder-led-as-trust if you cannot sustain the visibility. The aesthetic only works when founder presence is continuous; visible absence converts against you.",
      "Do not pretend to be small if you are not. The quiet-competence narrative is fragile when buyers discover the team is larger or VC-funded than the brand implied.",
    ],
    brunsonLens: {
      hook: "Attractive Character hook (Brunson Expert Secrets) — Jack and Paul ARE the marketing.",
      story:
        "Hero's-Journey-via-founder-content: years of writing about indie software, calm-company values, and customer-first ops build the prior buyers carry in.",
      offer:
        "Two-rung Value Ladder: free trial as front-end, volume-tiered subscription as core. No high-ticket back-end — the offer matches the indie aesthetic.",
      valueLadderTier:
        "Front-end trial plus subscription core; no continuity upsell or back-end.",
    },
    faqs: [
      {
        q: "How does Fathom differ from Plausible?",
        a: "Same category, same principles, different texture. Plausible leads with open-source transparency and a public revenue dashboard; Fathom leads with founder visibility and quiet competence. The functional products are near-parity at standard use cases; the choice is which founder pair's aesthetic resonates.",
      },
      {
        q: "Why does founder-led marketing work for Fathom specifically?",
        a: "Because privacy-conscious buyers actively prefer buying from identifiable humans over faceless SaaS. The audience self-selects toward indie-operator brands; Fathom's founder visibility matches that preference exactly.",
      },
      {
        q: "Can any indie SaaS use the founder-led approach?",
        a: "Most can attempt it; not all can sustain it. The approach requires founders who are willing to be visible continuously across years and who can write or speak compellingly enough to compound an audience. Without those traits, founder-led marketing fizzles.",
      },
      {
        q: "What is the Brunson lens on Fathom's funnel?",
        a: "Pure Attractive Character hook (Brunson Expert Secrets) executed by two founders. The Hero's Journey unfolds across blog posts, podcast episodes, and Twitter threads rather than in one marketing campaign. Subscription-core Value Ladder with no high-ticket back-end — the offer shape matches the brand shape.",
      },
      {
        q: "How does Unlock SaaS think about Fathom's pattern?",
        a: "Founder-led visibility is the highest-trust marketing surface available, but it requires continuous presence to sustain. The indie SaaS founders who can pull it off compound disproportionately; the ones who try and fade do worse than if they had stayed anonymous.",
      },
    ],
    tags: ["founder-led", "attractive-character", "indie-friendly", "privacy-analytics"],
    homepageUrl: "https://usefathom.com/",
    lastVerified: "2026-05-17",
  },

  {
    slug: "calendly",
    displayName: "Calendly",
    creator: "Tope Awotona",
    category: "Scheduling",
    oneLine:
      "Calendly's funnel runs on category-default mindshare. The brand IS the moat — bookers expect to see a Calendly link.",
    tldr:
      "Calendly's funnel works because the brand is the category default. When sales teams or freelancers share a scheduling link, recipients expect to see Calendly and are mildly surprised by alternatives. The lesson for indie founders: brand-as-default is a real moat once earned, but the path to earning it is long and not directly replicable; alternatives must compete on principle or feature gap rather than brand.",
    productSnapshot: {
      whatTheySell:
        "A scheduling platform for sales calls, demos, customer meetings, and recruiter coordination, with a Calendly-branded booking page recipients use.",
      whoFor:
        "Sales teams, recruiters, customer success managers, and any professional whose calendar coordination is high-volume.",
      pricingNote:
        "Free tier (1 event type, limited features); paid plans scale per user from low-double-digits per month into enterprise tiers (verified 2026-05-17).",
    },
    hook: {
      pattern: "Category-default trust",
      analysis:
        "The hero leans on Calendly's market position rather than a specific structural promise. The implicit argument is 'you already know what this does — start using it.' This works only after a brand has earned default-recognition status; before that, the same minimalist hero converts nobody.",
    },
    story: {
      pattern: "Use-case carousel for cross-functional adoption",
      analysis:
        "The marketing site shows use cases across sales, recruiting, customer success, education, and consulting. The story is not about one buyer; it is about the brand serving every role that schedules meetings. This breadth of positioning works for a category default and fails for a challenger trying to enter the market.",
    },
    offer: {
      pattern: "Free-tier-acquisition plus enterprise upsell ladder",
      analysis:
        "The free tier captures individual users; paid tiers scale into team and enterprise features (CRM integrations, advanced workflows, admin controls). The free-tier acquisition is structural — every Calendly link shared by a free user is also marketing for the brand to the recipient.",
    },
    whatsWorking: [
      "Brand-as-default IS the moat — recipients recognize Calendly links and trust them, which suppresses switching to alternatives.",
      "Free tier with the Calendly brand on the booking page seeds visible-customer presence across every shared link.",
      "Cross-functional positioning broadens the addressable market beyond pure sales teams.",
      "Mature integration ecosystem (Salesforce, HubSpot, Marketo) locks in enterprise customers who built workflows around Calendly.",
      "Enterprise-tier features (SSO, admin, workflows) capture the high-margin segment without disturbing the free-acquisition layer.",
    ],
    whatToAdapt: [
      "Visible-customer flywheel: free-tier branding on customer-shared surfaces is the most efficient acquisition channel when buyers share output publicly.",
      "Cross-functional positioning can broaden a tool that started in one vertical, but only once category default is earned.",
      "Mature integration ecosystem is a real moat for enterprise — but it takes years to build and is not transferable.",
    ],
    whatToAvoid: [
      "Do not adopt category-default positioning if you are the challenger. The aesthetic only works once you have earned the recognition; before then, you need to lead with the differentiator that justifies switching.",
      "Do not assume cross-functional positioning works for new entrants. Calendly earned the breadth after locking sales-team adoption first; new entrants should narrow before they broaden.",
    ],
    brunsonLens: {
      hook: "Brand-default hook — works only for the category incumbent. Brunson would call this 'borrowed authority from your own brand' once that brand is earned.",
      story:
        "Multi-Dream-Customer story serving sales, recruiting, success, education — only sustainable for the category default.",
      offer:
        "Front-end free with visible branding (acquisition flywheel) plus enterprise upsell ladder (margin extraction). Textbook two-rung Value Ladder with a continuity-tier back-end.",
      valueLadderTier:
        "Front-end lead funnel (free with branding) plus per-seat subscription core plus enterprise back-end.",
    },
    faqs: [
      {
        q: "Why is Calendly the category default?",
        a: "Years of free-tier acquisition compounded into brand recognition with recipients. Every shared Calendly link reinforced the brand to a new audience; the cumulative network effect produced default recognition that newer entrants cannot easily dislodge.",
      },
      {
        q: "Can a challenger beat Calendly?",
        a: "Not on brand; the recognition gap is too large. Challengers (Cal.com, SavvyCal) compete on principle (open source) or feature gap (calendar overlay) rather than on brand. The strategy is to win the segments where Calendly's category-default advantage matters least.",
      },
      {
        q: "Will the brand-default moat last forever?",
        a: "Probably not. Newer entrants chip away at younger demographics who do not have the same Calendly-as-default mental model. The moat decays over years; the brand still wins the median professional in 2026 but the gap is narrower than it was in 2020.",
      },
      {
        q: "What is the Brunson lens on Calendly's funnel?",
        a: "Once-earned brand-default is the canonical moat Brunson describes in Expert Secrets as 'becoming the category king.' Calendly executed every move (free-tier acquisition, visible branding, cross-functional positioning, enterprise upsell) but the central asset is brand recognition that took years to compound. New entrants cannot replicate the asset; they can only outflank it.",
      },
      {
        q: "How does Unlock SaaS think about Calendly's pattern?",
        a: "Category-default brand is a real moat but not a replicable strategy. For pre-revenue indie founders, the lesson is to compete on principle or feature gap rather than on brand recognition — the gap to the default is too large to close head-on.",
      },
    ],
    tags: ["category-default", "brand-as-moat", "free-tier-flywheel", "incumbent"],
    homepageUrl: "https://calendly.com/",
    lastVerified: "2026-05-17",
  },

  {
    slug: "postmark",
    displayName: "Postmark",
    creator: "Wildbit team (acquired by ActiveCampaign in 2022)",
    category: "Email API",
    oneLine:
      "Postmark's funnel runs on deliverability obsession. For over a decade the marketing has hammered one message: your transactional email actually arrives.",
    tldr:
      "Postmark's funnel is built around a single structural promise: deliverability. The marketing has hammered this message for over a decade, with separate transactional and broadcast streams as the architectural proof point. The lesson for indie founders: when the structural decision (separated streams) IS the differentiator, the marketing only needs to repeat one message.",
    productSnapshot: {
      whatTheySell:
        "A developer-friendly transactional email API with separate streams for transactional and broadcast sends, optimized for deliverability.",
      whoFor:
        "Developers and SaaS teams sending transactional email (password resets, receipts, notifications) who prioritize inbox placement above all else.",
      pricingNote:
        "Free 100/month; paid tiers start at ~$15/month for 10K emails; volume tiers scale into enterprise (verified 2026-05-17).",
    },
    hook: {
      pattern: "Single-message repetition",
      analysis:
        "The hero leads with deliverability and only deliverability. There is no feature carousel, no AI add-on, no creator-pivot. The implicit argument is 'we solve one problem completely; everything else is distraction.' This works because deliverability genuinely IS the dominant criterion for transactional-email buyers.",
    },
    story: {
      pattern: "Architectural-decision-as-proof",
      analysis:
        "The story is told through the separated transactional and broadcast streams — a structural decision that protects transactional deliverability from broadcast incidents. This is not a marketing claim; it is a technical architecture choice that competitors would have to abandon their business model to copy. Architectural proof beats narrative proof.",
    },
    offer: {
      pattern: "Volume-tiered with conservative free tier",
      analysis:
        "100 emails/month free is conservative compared to Resend's 3K; the pricing structure favors paid customers who care about deliverability enough to commit. Paid tiers scale with volume; the offer is conventional but the brand promise (deliverability) carries the conversion work.",
    },
    whatsWorking: [
      "Single-message marketing for over a decade — the brand promise is so consistent that buyers know what they are buying before clicking.",
      "Separated streams as architectural proof — competitors cannot copy this without changing their business model.",
      "Strong founder-led marketing from Wildbit (Natalie Nagele, Chris Nagele) over the years built indie credibility.",
      "Active engagement in the broader email community (sender-policy education, deliverability content) reinforces the category-expert position.",
      "Acquired by ActiveCampaign in 2022 — keeps the platform funded and operationally stable while preserving the brand promise.",
    ],
    whatToAdapt: [
      "If your structural decision IS the differentiator, lead with it everywhere and resist the urge to add other messaging. Architectural commitment beats marketing copy.",
      "Single-message repetition compounds — buyers who hear the same message ten times trust it more than buyers who hear ten different messages once.",
      "Founder-led content in your category's broader community (deliverability, security, compliance) builds expert positioning that pays back for years.",
    ],
    whatToAvoid: [
      "Do not adopt single-message marketing if you have not committed to the architectural decision behind it. The strategy fails when the message and the product diverge.",
      "Do not assume separated streams is the right architecture for your product — it is right for deliverability-first email and wrong for other email shapes.",
    ],
    brunsonLens: {
      hook: "Single-promise hook (Brunson 'one-sentence pitch') executed at extreme repetition over years.",
      story:
        "Architectural-proof story — the product itself is the case study. Stronger than narrative when the architectural choice is verifiable.",
      offer:
        "Volume-tiered subscription with conservative free tier; no front-end loss leader. Brunson 'priced for the buyer who cares' shape.",
      valueLadderTier:
        "Two-rung Value Ladder: free trial tier plus volume-tiered subscription core.",
    },
    faqs: [
      {
        q: "Why does Postmark separate transactional and broadcast streams?",
        a: "Because a broadcast incident (high complaint rate, spam trigger) can damage IP reputation. Separating streams means a broadcast issue does not affect your transactional emails (password resets, receipts) which are usually mission-critical. The architecture protects the most important sends from the less-controlled ones.",
      },
      {
        q: "How does Postmark differ from Resend?",
        a: "Postmark is the older, deliverability-first incumbent with a decade of single-message marketing. Resend is the modern challenger with sharper DX and React Email integration. For maximum deliverability track record, Postmark; for modern developer experience, Resend. Both are well-regarded; the choice is values-aligned.",
      },
      {
        q: "Does the ActiveCampaign acquisition change Postmark?",
        a: "Operationally, not yet. Postmark remains the deliverability-first transactional brand; ActiveCampaign keeps it funded. The risk is long-term strategic drift if ActiveCampaign decides to converge the product into its marketing platform. As of 2026, the brand promise holds.",
      },
      {
        q: "What is the Brunson lens on Postmark's funnel?",
        a: "Single-promise hook plus architectural-proof story plus conservative subscription Value Ladder. The unusual Brunson element is the depth of single-message commitment — most companies pivot messaging every year or two; Postmark hammered deliverability for over a decade and the compound trust this built is unusual.",
      },
      {
        q: "How does Unlock SaaS apply this lesson?",
        a: "Single-message marketing is the highest-trust strategy available IF the message is verifiable and IF you can sustain the commitment. Indie founders who try this and pivot after a year do worse than if they had run softer marketing throughout. Commit to the structural promise or pick a different strategy.",
      },
    ],
    tags: ["deliverability", "single-message", "developer-tools", "architectural-proof"],
    homepageUrl: "https://postmarkapp.com/",
    lastVerified: "2026-05-17",
  },

  {
    slug: "testimonial-to",
    displayName: "Testimonial.to",
    creator: "Damon Chen",
    category: "Testimonial collection",
    oneLine:
      "Testimonial.to is a solo-founder indie SaaS that competes with Senja on polish. The funnel runs on the visible-customer flywheel.",
    tldr:
      "Testimonial.to is a solo-founder indie SaaS in the testimonial collection space, competing head-to-head with Senja. The funnel runs on the same visible-customer flywheel both companies use — every Testimonial.to widget on a customer's marketing site is implicit advertising. The lesson for indie founders: in indie-friendly categories with visible-output products, solo founders can compete credibly against funded companies if the output flywheel is built in.",
    productSnapshot: {
      whatTheySell:
        "A testimonial collection and display platform for SaaS, agencies, and creators, with strong video testimonial features and polished Wall of Love widgets.",
      whoFor:
        "Indie SaaS, agencies, and creators who need video and text testimonials displayed cleanly on their marketing sites.",
      pricingNote:
        "Free tier with Testimonial.to branding; paid tiers in the low-double-digits/mo range remove branding and unlock AI features (verified 2026-05-17).",
    },
    hook: {
      pattern: "Universal-pain naming, solo-operator credibility",
      analysis:
        "The hero names the pain (collecting and displaying testimonials) that nearly every SaaS founder has felt — same hook as Senja. The differentiator is the visible solo-founder operation: Damon Chen runs the product, writes the changelog, answers support. Solo-operator credibility appeals to indie buyers who prefer doing business with identifiable humans.",
    },
    story: {
      pattern: "Demo-by-existence plus solo-founder transparency",
      analysis:
        "The marketing site itself uses Testimonial.to to display testimonials — same demo-by-existence pattern as Senja. Plus the solo-founder layer: Damon's Twitter, the build-in-public posts, the public revenue updates. Two trust layers compound where most competitors have one.",
    },
    offer: {
      pattern: "Free-with-branding plus brand-removal upsell",
      analysis:
        "Identical structural pricing to Senja: free tier with attribution feeds the visible-output flywheel; paid tier removes attribution. The pricing model is conventional in the category — both companies converged on the same shape because it works.",
    },
    whatsWorking: [
      "Solo-founder visibility differentiates against larger competitors — Damon is the brand and the support team.",
      "Demo-by-existence: the marketing site uses Testimonial.to itself, so the proof is built into the buying experience.",
      "AI-assisted video editing and highlights — feature differentiation in a near-parity category.",
      "Active build-in-public marketing from Damon (Twitter, public metrics) compounds indie credibility over time.",
      "Free-with-branding flywheel — every Testimonial.to widget on a customer's marketing page is implicit advertising.",
    ],
    whatToAdapt: [
      "Solo-founder visibility is a real competitive advantage in indie-friendly categories. If you are solo, lean into it; do not hide behind a faux-bigger brand.",
      "Demo-by-existence (using your own product on the marketing site) is the cheapest proof asset available — and it is unfakeable.",
      "Build-in-public content compounds — the prospects who read your changelog posts trust you more than prospects who only see your marketing.",
    ],
    whatToAvoid: [
      "Do not adopt solo-founder positioning if you are not solo. The credibility evaporates when buyers discover the team.",
      "Do not assume demo-by-existence works if your product is not customer-facing. The flywheel requires visible customer output.",
    ],
    brunsonLens: {
      hook: "Attractive Character hook executed by a single founder.",
      story:
        "Two-layer story: demo-by-existence (product visible on marketing site) plus build-in-public founder content. Layered storytelling compounds trust faster than single-layer stories.",
      offer:
        "Free-with-branding plus brand-removal upsell — Brunson structural-trigger pattern matching the broader category convention.",
      valueLadderTier:
        "Front-end lead funnel (free with branding) plus paid subscription core (brand removal plus AI features).",
    },
    faqs: [
      {
        q: "How does Testimonial.to differ from Senja?",
        a: "Same category, similar feature set, similar pricing model. The differentiators are aesthetic (Testimonial.to leans slightly more polished on display widgets; Senja leans slightly more on collection workflow) and operator shape (Testimonial.to is solo-founder; Senja is small team). Functional parity is high.",
      },
      {
        q: "Should I trust a solo-founder SaaS for a critical workflow?",
        a: "Depends on the founder's track record. Damon Chen has a multi-year history of indie SaaS operations (Mailoji, then Testimonial.to) and a visible build-in-public arc. The trust depends on operator continuity; bet on founders who show up consistently and avoid solo SaaS run by founders who go silent for months.",
      },
      {
        q: "Will the visible-customer flywheel work for my SaaS?",
        a: "Only if your output is publicly visible. Testimonial widgets, form submissions, scheduling pages, video recordings — all qualify. Internal dashboards, admin tools, backend infrastructure — do not. Match the strategy to the product shape.",
      },
      {
        q: "What is the Brunson lens on Testimonial.to's funnel?",
        a: "Attractive Character (Damon) plus demo-by-existence (the marketing site uses the product) plus structural-trigger pricing (brand removal). Three Brunson levers stacked on a single product. The unusual element is the depth of solo-founder visibility — Damon's continuous public presence is the moat against funded competitors.",
      },
      {
        q: "How does Unlock SaaS think about Testimonial.to's pattern?",
        a: "Solo-founder indie SaaS that competes credibly with funded competitors is one of the most replicable patterns in the 2026 landscape. The requirements are real (founder visibility, demo-able product, output flywheel) but the bar is reachable for indie operators who commit.",
      },
    ],
    tags: ["solo-founder", "visible-output", "indie-friendly", "build-in-public"],
    homepageUrl: "https://testimonial.to/",
    lastVerified: "2026-05-17",
  },

  {
    slug: "clickup",
    displayName: "ClickUp",
    creator: "Zeb Evans",
    category: "Project management for software teams",
    oneLine:
      "ClickUp's funnel runs on the 'one tool to replace them all' positioning. The breadth IS the marketing, and the configurability IS the moat against opinionated competitors.",
    tldr:
      "ClickUp's funnel works because the marketing leads with the consolidation promise (replace tasks + docs + chat + whiteboards + forms + time tracking + goals with one tool). The configurability that gets criticized as overkill in head-to-head comparisons becomes the moat against opinionated competitors — buyers who need that flexibility have nowhere else to go. The lesson for indie founders: the right positioning depends on whether your category is fragmented (consolidation wins) or simple (opinionated minimalism wins).",
    productSnapshot: {
      whatTheySell:
        "An all-in-one productivity platform combining tasks, docs, chat, whiteboards, forms, time tracking, goals, and more in one configurable workspace.",
      whoFor:
        "Cross-functional teams with specific workflows that require deep configuration, or teams that want to consolidate multiple SaaS tools under one bill.",
      pricingNote:
        "Free tier with most features; Unlimited ~$10/user/mo; Business ~$19/user/mo; Business Plus ~$29/user/mo (verified 2026-05-17).",
    },
    hook: {
      pattern: "Consolidation-as-promise",
      analysis:
        "The hero leads with the explicit consolidation message: 'one app to replace them all.' This works because the target buyer (cross-functional teams paying for 4-7 separate SaaS tools) feels the consolidation pain directly. The hook is structurally honest — ClickUp does in fact offer features competitors specialize in, even if the depth varies.",
    },
    story: {
      pattern: "Feature-comprehensive demonstration",
      analysis:
        "The story is told through feature carousels and use-case templates — see this for sales, this for marketing, this for product, this for ops. The breadth doubles as proof: a tool that claims to consolidate 7 categories must show all 7 in action. The marketing site is dense by design because the value proposition is density.",
    },
    offer: {
      pattern: "Free-tier comprehensive plus per-user upsell ladder",
      analysis:
        "The free tier is unusually generous on user count and feature access — designed to let teams adopt ClickUp deeply before any paywall hits. Per-user paid tiers add storage, automation runs, advanced features. The conversion happens not at the free-tier feature limit but at the storage and team-size scale limits.",
    },
    whatsWorking: [
      "Consolidation hook resonates with cross-functional teams paying for 4-7 separate SaaS tools.",
      "Free tier is generous enough that teams adopt deeply before any paywall hits, making upgrade decisions structural rather than feature-gate-driven.",
      "Configurability that opinionated tools criticize becomes the moat — buyers who need flexible workflows have nowhere else to go.",
      "Use-case template library scales the activation surface across multiple buyer personas (sales, marketing, product, ops).",
      "Aggressive feature shipping signals platform momentum and reassures buyers that consolidation will continue improving.",
      "Pricing per user with predictable tier jumps avoids the per-feature comparison shopping that fragmented competitors create.",
    ],
    whatToAdapt: [
      "If your category is fragmented (buyers pay for 4+ separate tools), consolidation is a legitimate positioning. If your category is already simple, consolidation messaging confuses rather than converts.",
      "Configurability as moat works when your buyer has unusual workflows opinionated competitors cannot serve. For standard workflows, opinionated minimalism converts better.",
      "Free tiers should be generous enough that adoption is real, not just evaluation. Real adoption converts at structural scale limits, not at feature gates.",
    ],
    whatToAvoid: [
      "Do not adopt consolidation positioning if you cannot credibly serve all the categories you claim to replace. ClickUp can serve PM, docs, and chat at adequate depth; SaaS that overpromise on breadth lose trust quickly.",
      "Do not match ClickUp's feature-shipping pace as a smaller team — the shipping velocity is part of how the consolidation promise stays credible at scale.",
    ],
    brunsonLens: {
      hook: "Big-promise consolidation hook (Brunson 'New Opportunity' move) — buyers are not buying a better PM tool, they are stepping into the 'one tool' category.",
      story:
        "Use-case-driven story serving multiple Dream Customers simultaneously — only viable for a platform that genuinely consolidates.",
      offer:
        "Generous free-tier acquisition plus per-user paid tiers with predictable upgrade structure.",
      valueLadderTier:
        "Front-end lead funnel (free comprehensive) plus per-user subscription core (Unlimited, Business, Business Plus) plus enterprise back-end.",
    },
    faqs: [
      {
        q: "Is ClickUp really one tool to replace them all?",
        a: "Functionally close at adequate depth for most use cases. Specialists (Notion for docs, Slack for chat, Linear for engineering issues) win on depth in any single feature. The consolidation value depends on whether your team values one bill and one platform over best-of-breed depth in each feature.",
      },
      {
        q: "Why is ClickUp's configurability sometimes called overkill?",
        a: "Because configurability requires upfront setup investment that opinionated tools (Linear, Asana for cross-functional) avoid. For teams with standard workflows, the configuration overhead is wasted. For teams with unusual workflows, the configuration is the only way to model their work — opinionated tools cannot serve them at all.",
      },
      {
        q: "Can an indie SaaS replicate ClickUp's positioning?",
        a: "Only in fragmented categories where buyers pay for 4-7 separate tools. In simple categories or against opinionated incumbents, consolidation messaging confuses rather than converts. The strategic move is to identify whether your category is fragmented enough to support consolidation positioning.",
      },
      {
        q: "What is the Brunson lens on ClickUp's funnel?",
        a: "New Opportunity positioning (Brunson Expert Secrets) — buyers are not buying a better PM tool, they are stepping into the 'one tool' category that did not exist before consolidation. Combined with use-case-driven story for multiple Dream Customers and generous-free-tier acquisition. The Brunson lesson: New Opportunity works when the new category genuinely solves a real fragmentation pain.",
      },
      {
        q: "How does Unlock SaaS think about ClickUp's pattern?",
        a: "Consolidation positioning is high-leverage when your category is genuinely fragmented and your product can credibly replace multiple specialists. It is high-risk when either condition fails. For most indie SaaS, opinionated minimalism converts better; ClickUp's consolidation play works because the category is structurally fragmented.",
      },
    ],
    tags: ["consolidation", "configurability", "free-tier-generous", "all-in-one"],
    homepageUrl: "https://clickup.com/",
    lastVerified: "2026-05-17",
  },

  {
    slug: "render",
    displayName: "Render",
    creator: "Anurag Goel",
    category: "Frontend cloud and hosting",
    oneLine:
      "Render's funnel runs on bundled-PaaS simplicity. The marketing promises 'modern Heroku' — and the bundled Postgres, Redis, workers, and cron deliver it.",
    tldr:
      "Render's funnel works because the positioning is precise: modern PaaS that bundles every backend service under one dashboard with predictable per-service pricing. The 'modern Heroku' framing converts developers who lived through Heroku's decline and want the bundled-services experience without Heroku's pricing and operational problems. The lesson for indie founders: precise positioning that names a specific pain (Heroku's pricing and ops decline) beats broad positioning that tries to serve everyone.",
    productSnapshot: {
      whatTheySell:
        "A managed Platform-as-a-Service for full-stack web apps, with bundled Postgres, Redis, background workers, cron jobs, and static-site hosting under one dashboard.",
      whoFor:
        "Full-stack indie founders, startups, and small teams who want bundled backend services without assembling them across separate vendors.",
      pricingNote:
        "Free static-site hosting; Individual ~$7/mo; Team ~$19/user/mo; service-tier pricing on Postgres and Redis (verified 2026-05-17).",
    },
    hook: {
      pattern: "Modern-Heroku positioning",
      analysis:
        "The hero leads with the implicit promise: PaaS bundling that Heroku used to provide, modernized for current pricing and operational expectations. This works because the audience (developers who built on Heroku and felt the operational decline) recognizes the gap immediately. The hook compresses category-evaluation time by tapping into existing shared pain.",
    },
    story: {
      pattern: "Bundled-services demonstration",
      analysis:
        "Story is told through the dashboard — one place for app deploys, Postgres provisioning, Redis instances, background workers, cron schedules, static-site hosting. The demonstration IS the proof; competitors that require assembling these from separate vendors (or paying marketplace partner pricing) make the bundled experience feel structurally simpler.",
    },
    offer: {
      pattern: "Per-service pricing with predictable scaling",
      analysis:
        "Each service tier (web service, Postgres, Redis, worker, cron) has its own predictable monthly cost. The total cost stacks predictably — no surprise overage bills, no per-resource metering complexity. The pricing model favors buyers who want operational simplicity over aggressive cost optimization at scale.",
    },
    whatsWorking: [
      "Modern-Heroku positioning taps shared pain with a specific named incumbent — converts the segment that lived through Heroku's decline.",
      "Bundled-services dashboard is the structural differentiator competitors require assembly to match.",
      "Per-service predictable pricing avoids the bill-shock that usage-metered hosting (Vercel, Fly.io) sometimes creates.",
      "Free static-site hosting captures the indie-buyer entry point and converts to paid as backend needs emerge.",
      "GitHub-native deploys with branch previews match the modern Git-driven workflow buyers expect.",
      "Founder-led marketing from Anurag Goel and the Render team anchors the brand to identifiable operators.",
    ],
    whatToAdapt: [
      "If your category has a named incumbent in decline, position explicitly against the incumbent's specific failures — not against the broader category.",
      "Bundled-services experience converts when buyers feel the operational cost of assembling separate vendors. Position the bundle as the simplicity, not just the cost.",
      "Predictable pricing structures convert buyers who want to budget reliably — not all customers want usage-optimized billing.",
    ],
    whatToAvoid: [
      "Do not position against a named incumbent if the incumbent's audience has already moved past you. Modern-Heroku positioning works because the decline is recent enough that buyers remember.",
      "Do not bundle services you cannot operate well — the bundle's value collapses if any single service is meaningfully worse than the specialist alternative.",
    ],
    brunsonLens: {
      hook: "Named-incumbent-replacement hook (Brunson 'Common Enemy' executed against a specific company's decline rather than against the broader category).",
      story:
        "Demonstration-by-dashboard — the bundled-services experience IS the proof.",
      offer:
        "Per-service predictable pricing with free static-site entry — Brunson 'two-rung Value Ladder' with bundled-product upsell.",
      valueLadderTier:
        "Front-end (free static hosting) plus per-service subscription core (Individual, Team, service tiers) plus enterprise back-end.",
    },
    faqs: [
      {
        q: "How does Render differ from Heroku?",
        a: "Render positions explicitly as the modern Heroku replacement — bundled services with current pricing and operational reliability that Heroku lost. The product surface is similar; the positioning argument is 'we are what Heroku used to be, without the recent decline.'",
      },
      {
        q: "Why bundle Postgres, Redis, and workers natively?",
        a: "Strategic decision to be the operational simplicity competitor. Vercel pushes these to marketplace partners; Render runs them natively. For teams that value one-dashboard simplicity over best-of-breed depth in each service, the bundled approach converts.",
      },
      {
        q: "Can an indie SaaS use the named-incumbent-replacement positioning?",
        a: "Yes when there is a specific incumbent in observable decline whose audience is searching for alternatives. The positioning fails when the incumbent is stable or when the 'decline' is more imagined by the challenger than felt by the audience.",
      },
      {
        q: "What is the Brunson lens on Render's funnel?",
        a: "Common Enemy positioning (Brunson Expert Secrets) executed against a named incumbent (Heroku) rather than the broader category. Combined with bundled-services demonstration and predictable per-service pricing. The Brunson lesson: precise enemy naming beats vague category positioning when the enemy is observably failing.",
      },
      {
        q: "How does Unlock SaaS think about Render's pattern?",
        a: "Modern-incumbent-replacement is one of the highest-leverage positioning moves available when the incumbent is in observable decline. The window is finite — eventually the incumbent either recovers or fades enough that the positioning loses urgency. Indie founders should identify whether their category has a Heroku-shaped incumbent right now.",
      },
    ],
    tags: ["managed-paas", "bundled-services", "modern-heroku", "founder-led"],
    homepageUrl: "https://render.com/",
    lastVerified: "2026-05-17",
  },

  {
    slug: "loom",
    displayName: "Loom",
    creator: "Joe Thomas, Shahed Khan, Vinay Hiremath (acquired by Atlassian in 2023)",
    category: "Screen recording for marketing video",
    oneLine:
      "Loom's funnel runs on async-team-communication positioning. The product is the message — record once, share a link, save a meeting.",
    tldr:
      "Loom's funnel works because the product itself IS the marketing. Every Loom recording shared inside a team or with a customer demonstrates the value proposition — 'record once instead of writing a 500-word email.' The free tier seeds the visible-output flywheel; team subscriptions monetize the workflow. The lesson for indie founders: when your product replaces an obviously-painful alternative (long emails, status meetings), the demonstration IS the conversion mechanism.",
    productSnapshot: {
      whatTheySell:
        "An async video communication platform for teams — screen recording with webcam overlay, instant shareable links, viewer analytics.",
      whoFor:
        "Distributed teams, customer success operators, sales teams, engineering teams — anyone whose communication includes async video updates or screen explanations.",
      pricingNote:
        "Free tier (25 videos/person, 5-min limit); Business ~$15/user/mo; Enterprise custom (verified 2026-05-17).",
    },
    hook: {
      pattern: "Replace-the-meeting positioning",
      analysis:
        "The hero leads with the meeting-replacement promise. This works because distributed teams (especially post-2020) feel the meeting tax directly — every meeting that could have been an async video is a recognizable opportunity cost. The hook taps shared pain that the buyer already articulates internally.",
    },
    story: {
      pattern: "Product-is-the-marketing flywheel",
      analysis:
        "Story is told through every Loom recording shared internally or externally. The recipient experiences the value proposition (this video saved a 30-minute meeting) without needing to read marketing copy. The free-tier branding ensures the recipient knows it is Loom; the experience does the conversion work.",
    },
    offer: {
      pattern: "Free-with-branding plus team-subscription upsell",
      analysis:
        "Free tier captures individual users and seeds the visible-output flywheel — every shared Loom link exposes a new recipient to the product. Business tier removes branding and adds team features (workspace, advanced sharing controls, viewer analytics). The conversion happens at team-adoption moments rather than at individual feature gates.",
    },
    whatsWorking: [
      "Replace-the-meeting positioning taps the shared meeting tax that distributed teams already feel.",
      "Product-is-the-marketing flywheel — every shared recording demonstrates the value to a new recipient without marketing copy.",
      "Free tier with branding seeds the visible-output presence across every shared video link.",
      "Speed-of-recording-to-share matters operationally — Loom's near-instant share link is the structural differentiator against polished alternatives (Screen Studio, Tella).",
      "Team workspace features at Business tier capture the team-adoption upgrade moment.",
      "Acquired by Atlassian in 2023 — keeps the platform funded and operationally stable while preserving the indie-friendly brand on the marketing surface.",
    ],
    whatToAdapt: [
      "If your product replaces an obviously-painful alternative, position against the alternative directly (meetings, long emails, manual updates) rather than describing your features.",
      "Free-tier visible-output flywheel works when your product creates artifacts that recipients encounter outside the buyer's organization.",
      "Speed-of-action matters as a structural differentiator when competitors optimize for polish — sometimes the right move is to do less, faster.",
    ],
    whatToAvoid: [
      "Do not adopt replace-the-meeting positioning if your product does not actually replace meetings reliably. Tools that promise meeting replacement and fail to deliver create more meetings (to discuss the broken async workflow).",
      "Do not assume the free-tier flywheel works for non-shareable categories. Internal tools, dashboards, and admin panels do not seed visible output to recipients.",
    ],
    brunsonLens: {
      hook: "Common Enemy positioning (Brunson Expert Secrets) — meetings as the enemy, async video as the replacement.",
      story:
        "Product-is-the-marketing — the demonstration IS the conversion mechanism, no separate marketing copy needed.",
      offer:
        "Free-with-branding flywheel plus team-subscription upsell — Brunson structural-trigger pattern aligned with team-adoption moments.",
      valueLadderTier:
        "Front-end lead funnel (free with branding) plus per-user team subscription core plus enterprise back-end.",
    },
    faqs: [
      {
        q: "Why is Loom the canonical async video tool?",
        a: "First-mover advantage in the async-team-video category plus product-is-the-marketing flywheel compounded into category-default status. Every Loom recording shared inside a team or externally introduced the recipient to the product, which compounded recognition over years.",
      },
      {
        q: "Can a challenger beat Loom?",
        a: "Not on brand recognition; the category-default advantage is too entrenched. Challengers (Tella, Screen Studio) compete on output polish for marketing-video use cases — Loom's optimization is speed-to-share for async communication, which is a different job.",
      },
      {
        q: "How does the Atlassian acquisition affect Loom?",
        a: "Operationally, integration into the broader Atlassian suite (Confluence, Jira). Strategically, Loom's standalone brand remains visible but long-term direction is set by Atlassian's roadmap. For most indie buyers in 2026 the brand still feels like Loom; for enterprise buyers the integration with Atlassian tooling is a feature.",
      },
      {
        q: "What is the Brunson lens on Loom's funnel?",
        a: "Common Enemy (meetings) plus product-is-the-marketing flywheel plus free-tier visible-output acquisition. The unusual element is the depth of the demonstration-as-marketing — Loom's marketing happens passively through every shared video, which makes paid acquisition almost unnecessary at scale.",
      },
      {
        q: "How does Unlock SaaS think about Loom's pattern?",
        a: "Product-is-the-marketing is the highest-leverage acquisition strategy when your product creates shareable artifacts. The strategy requires the artifact to be high-value enough that recipients want to use it themselves — Loom's videos clear this bar; tools whose artifacts are not standalone-useful do not seed the same flywheel.",
      },
    ],
    tags: ["async-communication", "product-is-marketing", "free-tier-flywheel", "common-enemy"],
    homepageUrl: "https://www.loom.com/",
    lastVerified: "2026-05-17",
  },

  {
    slug: "gitbook",
    displayName: "GitBook",
    creator: "Samy Pesse and Aaron O'Mullan",
    category: "Developer documentation",
    oneLine:
      "GitBook's funnel runs on the broader-knowledge-platform positioning. The marketing leans into docs-plus-internal-wikis-plus-knowledge-bases as one tool.",
    tldr:
      "GitBook's funnel works because the positioning is broader than dev-tool-docs-specific competitors (Mintlify). The marketing promises one knowledge platform for public docs, internal wikis, and team knowledge bases — which converts buyers who want flexibility over specialization. The lesson for indie founders: when a competitor wins the narrow positioning (Mintlify owns dev-tool aesthetic), the strategic move is to claim a broader scope rather than fight on the same axis.",
    productSnapshot: {
      whatTheySell:
        "A knowledge platform that handles public documentation, internal wikis, and team knowledge bases with a richer WYSIWYG editor and Git-sync option.",
      whoFor:
        "Teams that want a single platform for public docs and internal knowledge, with a writer-friendly editor that non-developer contributors can use.",
      pricingNote:
        "Free tier; Plus ~$8/user/mo; Pro ~$15/user/mo; Enterprise custom (verified 2026-05-17).",
    },
    hook: {
      pattern: "Broader-scope-than-competitors positioning",
      analysis:
        "The hero leads with knowledge-platform breadth rather than docs-specific specialization. This works because buyers comparing GitBook to Mintlify (the docs-specialist) often need internal wikis and team knowledge alongside public docs — and GitBook serves that broader scope while Mintlify does not. The hook positions GitBook in a category Mintlify cannot enter without abandoning its docs-aesthetic identity.",
    },
    story: {
      pattern: "Multi-use-case demonstration",
      analysis:
        "Story is told through use-case examples spanning public docs, internal wikis, customer-facing knowledge bases, and team knowledge libraries. The breadth doubles as proof — a platform claiming to handle multiple knowledge contexts must show all of them in action. The marketing site reads as comprehensive rather than focused.",
    },
    offer: {
      pattern: "Per-user subscription with feature-tier upsells",
      analysis:
        "Free tier captures small teams; Plus adds collaboration and integrations; Pro adds advanced features and analytics; Enterprise handles procurement and security. The per-user model scales with team adoption rather than with feature consumption, which matches the knowledge-platform usage shape better than usage-metered alternatives.",
    },
    whatsWorking: [
      "Broader-scope positioning escapes the docs-specialist fight where Mintlify owns the aesthetic.",
      "WYSIWYG editor enables non-developer contributors to author content without learning Markdown or MDX.",
      "Multi-use-case demonstration shows the platform handling public docs, internal wikis, and team knowledge in parallel.",
      "Git-sync option for teams that want docs-as-code workflow while keeping the WYSIWYG editor for collaborators.",
      "Per-user subscription model scales with team adoption predictably without usage-metered complexity.",
      "Long-running platform (founded 2014) with mature feature surface that newer entrants take years to build.",
    ],
    whatToAdapt: [
      "When a competitor wins narrow specialization, claim a broader scope that the competitor cannot enter without abandoning their identity.",
      "WYSIWYG editing matters when your buyer's contributors include non-developers — the docs-as-code-only positioning loses this segment.",
      "Multi-use-case demonstrations convert when the breadth is real; they confuse when the platform actually specializes despite the marketing claim.",
    ],
    whatToAvoid: [
      "Do not claim broader scope than you can credibly serve. If your platform is functionally docs-only, the multi-use-case marketing loses trust when buyers discover the depth gap.",
      "Do not abandon docs aesthetics entirely. Even broader-scope platforms need to look good enough that buyers do not reject them on aesthetic grounds.",
    ],
    brunsonLens: {
      hook: "Broader-scope-than-competitors hook — Brunson 'New Opportunity' move that claims a category the specialist cannot enter.",
      story:
        "Multi-Dream-Customer story serving public-docs buyers, internal-wiki buyers, and knowledge-base buyers in parallel.",
      offer:
        "Per-user subscription Value Ladder with predictable upgrade tiers — Brunson 'two-step subscription' aligned with team growth.",
      valueLadderTier:
        "Front-end free tier plus per-user subscription core (Plus, Pro) plus enterprise back-end.",
    },
    faqs: [
      {
        q: "How does GitBook differ from Mintlify?",
        a: "GitBook is broader — public docs plus internal wikis plus team knowledge bases with WYSIWYG editing. Mintlify is narrower — dev-tool-specific docs with a recognizable modern aesthetic. For pure API docs the Mintlify aesthetic wins; for mixed knowledge platforms the GitBook breadth wins.",
      },
      {
        q: "Why does GitBook offer WYSIWYG editing?",
        a: "Because the buyer base includes non-developer contributors (PMs, designers, support, leadership) who need to author content. Pure docs-as-code platforms (Mintlify, Docusaurus) lose this segment by requiring Markdown or MDX literacy.",
      },
      {
        q: "Can an indie SaaS use GitBook for its public docs?",
        a: "Yes, and many do. GitBook handles API docs adequately though not at Mintlify's aesthetic depth. For indie SaaS in non-dev-tool categories (where the Mintlify aesthetic is not a category requirement), GitBook is often the better breadth-for-the-price choice.",
      },
      {
        q: "What is the Brunson lens on GitBook's funnel?",
        a: "New Opportunity positioning that escapes the docs-specialist fight by claiming a broader knowledge-platform category. Combined with multi-use-case demonstration and per-user subscription Value Ladder. The Brunson lesson: when you cannot win the narrow positioning, claim the broader scope the specialist cannot enter.",
      },
      {
        q: "How does Unlock SaaS think about GitBook's pattern?",
        a: "Broader-scope positioning is a defensible strategy when a competitor has won the narrow specialization. The risk is positioning broader than you can credibly serve — GitBook walks this line by maintaining adequate depth in each use case it claims. Indie founders attempting this should audit their depth claim against actual buyer experience.",
      },
    ],
    tags: ["knowledge-platform", "broader-scope", "wysiwyg", "team-wiki"],
    homepageUrl: "https://www.gitbook.com/",
    lastVerified: "2026-05-17",
  },

  {
    slug: "asana",
    displayName: "Asana",
    creator: "Dustin Moskovitz and Justin Rosenstein",
    category: "Project management",
    oneLine:
      "Asana's funnel runs on cross-functional-PM-default positioning. The marketing sells coordination as the work itself — not as overhead.",
    tldr:
      "Asana's funnel works because the marketing reframes cross-functional coordination as the work, not as overhead. The hero leads with goal hierarchy and timeline views; case studies feature marketing, design, ops, and engineering teams coordinating on the same projects. The lesson for indie founders: when your category buyer treats your product as overhead, the highest-leverage positioning move is to reframe the work itself so your product IS the work, not the cost of doing the work.",
    productSnapshot: {
      whatTheySell:
        "A cross-functional project management platform with tasks, projects, portfolios, goals, timelines, and workload coordination.",
      whoFor:
        "Growing cross-functional teams (marketing, design, engineering, ops) that coordinate work across multiple departments and need structured project tracking.",
      pricingNote:
        "Free up to 10 users; Starter ~$11/user/mo; Advanced ~$25/user/mo; Enterprise custom (verified 2026-05-18).",
    },
    hook: {
      pattern: "Coordination-as-the-work positioning",
      analysis:
        "The hero reframes cross-functional coordination from overhead to value-add. This works because the canonical buyer (ops leaders, PMs, leadership) has already lived through the alternative — chaos across Slack, email, and spreadsheets — and recognizes structured coordination as the actual work. The hook compresses category evaluation by tapping the felt pain of unstructured cross-functional work.",
    },
    story: {
      pattern: "Multi-function case study breadth",
      analysis:
        "Story is told through case studies featuring marketing, design, engineering, ops, finance, and HR teams using Asana to coordinate cross-functionally. The breadth of use cases doubles as proof — a platform that claims cross-functional coordination must show all functions in action. The marketing site reads as 'this works for your specific function' regardless of which function the visitor is in.",
    },
    offer: {
      pattern: "Free tier acquisition plus enterprise upsell ladder",
      analysis:
        "Free tier captures up to 10 users, which fits early-stage teams; paid tiers (Starter, Advanced) scale into team and cross-functional features (timeline, custom fields, advanced workflows, Goals); Enterprise handles procurement and security. The free tier is calibrated to allow real adoption but not production for larger teams — the structural upgrade trigger is team growth past 10 users, which is mechanically predictable.",
    },
    whatsWorking: [
      "Reframing cross-functional coordination as the work converts ops leaders who feel coordination pain daily.",
      "Multi-function case study breadth makes the marketing site feel relevant to every visitor regardless of their role.",
      "Free-tier 10-user cap is a predictable structural upgrade trigger that fires as teams grow.",
      "Native Goals product is the canonical differentiator from PM tools that lack OKR hierarchy.",
      "Timeline view appeals to PM-led teams who think in dependencies and milestones.",
      "Mature integration ecosystem (Slack, Google Workspace, Microsoft 365, Salesforce) locks in cross-functional teams already on those platforms.",
    ],
    whatToAdapt: [
      "If your category buyer treats your product as overhead, reframe the work itself so your product IS the work — not the cost of doing the work.",
      "Multi-function case study breadth lets cross-functional platforms be relevant to every visitor without diluting the value proposition.",
      "User-count caps on free tiers are predictable structural upgrade triggers that map to team-growth events.",
    ],
    whatToAvoid: [
      "Do not reframe coordination as the work if your product genuinely IS overhead. The reframing must be honest — the cross-functional teams using Asana believe coordination matters because they have lived without it.",
      "Do not pursue cross-functional breadth before you have depth in any single function. The breadth claim is fragile when buyers discover the product is generic across all use cases.",
    ],
    brunsonLens: {
      hook: "New Opportunity hook (Brunson Expert Secrets) — buyers are not buying a better PM tool, they are stepping into the 'coordination IS the work' category.",
      story:
        "Multi-Dream-Customer story serving marketing, design, engineering, ops, finance simultaneously — only viable for a platform with genuine cross-functional depth.",
      offer:
        "Free tier acquisition (10-user cap) plus structured per-user upsell ladder with Enterprise back-end.",
      valueLadderTier:
        "Front-end lead funnel (free up to 10 users) plus per-user subscription core (Starter, Advanced) plus enterprise back-end.",
    },
    faqs: [
      {
        q: "Why does Asana lead with Goals and Timeline instead of tasks?",
        a: "Because tasks are commoditized — every PM tool ships tasks. Goals and Timeline are the structural differentiators that justify Asana over Trello (no Goals, no Timeline) or Linear (engineering-focused, lighter Goals). Leading with the differentiators tells the visitor 'you are buying coordination depth, not task management.'",
      },
      {
        q: "Can an indie SaaS use the reframe-coordination-as-work strategy?",
        a: "Only when your buyer genuinely feels coordination pain. The reframing works for Asana because cross-functional ops leaders have already lived through unstructured chaos. For categories where the buyer does not feel the pain you are reframing, the strategy converts nobody.",
      },
      {
        q: "Why is Asana's free tier limited to 10 users?",
        a: "Because 10 users is the structural upgrade trigger. Teams that adopt Asana on free and grow past 10 users have already proven they need cross-functional coordination at team scale — the upgrade is structurally predictable. A more generous free tier would dilute the conversion path.",
      },
      {
        q: "What is the Brunson lens on Asana's funnel?",
        a: "New Opportunity positioning (coordination IS the work, not overhead) plus multi-Dream-Customer breadth plus structured Value Ladder with user-count upgrade trigger. The unusual element is the depth of the cross-functional positioning — Asana genuinely serves multiple functions at depth, not just claims to.",
      },
      {
        q: "How does Unlock SaaS think about Asana's pattern?",
        a: "Reframing the buyer's mental model is one of the highest-leverage positioning moves available — when it works. The risk is honesty: the reframing fails when buyers discover the product does not actually justify the new mental model. Indie founders attempting this should audit whether their product can carry the reframe.",
      },
    ],
    tags: ["cross-functional", "coordination-as-work", "free-user-cap", "goal-hierarchy"],
    homepageUrl: "https://asana.com/",
    lastVerified: "2026-05-18",
  },

  {
    slug: "airtable",
    displayName: "Airtable",
    creator: "Howie Liu, Andrew Ofstad, Emmett Nicholas",
    category: "Productivity and workspace",
    oneLine:
      "Airtable's funnel runs on the database-superpowers-for-non-developers positioning. The marketing sells the magic moment when a spreadsheet becomes an app.",
    tldr:
      "Airtable's funnel works because the marketing sells the specific magic moment when a spreadsheet stops being a list and becomes an app. The hero shows that moment — drag-drop forms, linked records, automations — in ways non-developers immediately recognize as 'this is what I have been trying to do in Excel.' The lesson for indie founders: when you democratize a previously-expert capability for non-experts, the marketing must show the magic moment, not explain the technical primitive.",
    productSnapshot: {
      whatTheySell:
        "A relational database platform for non-developers with Interfaces, Automations, and AI for building no-code internal tools.",
      whoFor:
        "Operations-heavy teams, marketers, ops leaders, and product managers who need structured data and internal tools without engineering.",
      pricingNote:
        "Free up to 5 editors; Team ~$20/seat/mo; Business ~$45/seat/mo; Enterprise custom (verified 2026-05-18).",
    },
    hook: {
      pattern: "Magic-moment demonstration",
      analysis:
        "The hero shows the specific moment when structured data becomes an app — drag a form field, link records across tables, trigger an automation. Non-developers who have lived in Excel hitting database-shaped problems recognize the magic immediately. The hook compresses category evaluation because the audience does not need to be sold on database value; they need to be shown that database value is accessible without code.",
    },
    story: {
      pattern: "Internal-tools-without-engineering narrative",
      analysis:
        "Story is told through ops-team case studies — content calendar that auto-publishes, inventory tracker with reorder alerts, applicant pipeline with status updates. The narrative pattern is consistent: 'this team built an internal tool in days without engineering involvement.' The story tells the buyer 'you can do this too' rather than 'here is what we can do.'",
    },
    offer: {
      pattern: "Free editor cap plus per-seat enterprise ladder",
      analysis:
        "Free tier limits to 5 editors — predictable structural upgrade trigger as ops teams grow past the threshold. Team and Business tiers add Interfaces, Automations runs, more storage, advanced permissions. Enterprise handles procurement. The pricing scales with team adoption rather than with database volume, which matches how Airtable usage actually grows inside organizations.",
    },
    whatsWorking: [
      "Magic-moment hero converts non-developers who recognize Excel limitations immediately.",
      "Internal-tools-without-engineering narrative speaks to ops leaders' actual pain.",
      "5-editor free tier cap is mechanical and predictable as ops teams grow.",
      "Interfaces feature is the canonical differentiator for forms-to-database internal tools.",
      "Automations runs price as the secondary upgrade trigger for teams scaling no-code workflows.",
      "Massive template library shows the magic moment across hundreds of use cases — CRM, project tracker, inventory, content calendar.",
    ],
    whatToAdapt: [
      "When democratizing an expert capability for non-experts, show the magic moment in the hero rather than explaining the technical primitive.",
      "Internal-tools-without-engineering is a structural value proposition for ops-led teams; the narrative works when your product can actually deliver it.",
      "Editor-count caps as upgrade triggers map to team-growth events and convert predictably.",
    ],
    whatToAvoid: [
      "Do not claim no-code internal tools if your product requires non-trivial setup work. The magic-moment promise must be honest — ops leaders abandon platforms that promised easy and delivered hard.",
      "Do not pursue Airtable's pricing model if your platform cost does not actually scale with team adoption. The per-editor model only works when value scales with editor count.",
    ],
    brunsonLens: {
      hook: "Magic-moment hook (Brunson 'show the result, not the process') executed as the hero.",
      story:
        "Hero's-Journey-via-case-studies — ops teams who solved internal-tools problems without engineering, inviting the reader to follow the same arc.",
      offer:
        "Free-editor-cap acquisition plus per-seat enterprise upsell ladder with Interfaces and Automations as feature triggers.",
      valueLadderTier:
        "Front-end lead funnel (free 5-editor) plus per-seat subscription core (Team, Business) plus enterprise back-end.",
    },
    faqs: [
      {
        q: "Why does Airtable lead with the spreadsheet-to-app moment?",
        a: "Because that moment is the specific value proposition. The audience (non-developers who have hit Excel limits) does not need to be sold on databases; they need to be shown that databases are accessible to them. The hero compresses the category-evaluation step.",
      },
      {
        q: "Can Airtable really replace internal-tool engineering?",
        a: "For many common internal tools (forms-to-database, CRMs, inventory trackers, content calendars), yes. For complex internal tools that require sophisticated workflows or external system integration, the limits emerge. Airtable's positioning is honest at the use cases it serves; teams that try to build serious applications eventually hit the constraints.",
      },
      {
        q: "Why is the free tier limited to 5 editors specifically?",
        a: "Because 5 editors is the structural team-formation threshold for ops use cases. Teams that adopt Airtable and grow past 5 editors have proven they need real-team Airtable use; the upgrade is mechanically predictable. A more generous free tier would dilute the conversion path.",
      },
      {
        q: "What is the Brunson lens on Airtable's funnel?",
        a: "Magic-moment hook (show the result) plus Hero's-Journey case studies (you can do this too) plus structured Value Ladder. The unusual element is the depth of the magic-moment marketing — Airtable demonstrates the spreadsheet-to-app transition continuously rather than explaining it once.",
      },
      {
        q: "How does Unlock SaaS think about Airtable's pattern?",
        a: "Showing the magic moment IS the conversion mechanism when democratizing an expert capability. The risk is delivering on the magic — Airtable can because the underlying database primitive is genuinely powerful. Indie founders attempting this should audit whether their magic moment is real or marketing-only.",
      },
    ],
    tags: ["no-code", "database", "magic-moment", "ops-internal-tools"],
    homepageUrl: "https://www.airtable.com/",
    lastVerified: "2026-05-18",
  },

  {
    slug: "framer",
    displayName: "Framer",
    creator: "Koen Bok and Jorn van Dijk",
    category: "Design and prototyping",
    oneLine:
      "Framer's funnel runs on the design-to-publish-without-engineering positioning. The marketing sells the moment when a Figma-style design becomes a live site.",
    tldr:
      "Framer's funnel works because the marketing pivots the design tool category. The hero leads with 'design and publish' — the implicit promise that your design work goes live without engineering handoff. The lesson for indie founders: when an incumbent (Figma) owns the category default, the New Opportunity move is to claim an adjacent category (design-plus-publish) the incumbent cannot enter without abandoning its identity.",
    productSnapshot: {
      whatTheySell:
        "A design-and-publish platform that lets designers ship live marketing sites and landing pages without engineering handoff.",
      whoFor:
        "Designers building marketing sites and landing pages who want to publish their design work directly without coding or engineering involvement.",
      pricingNote:
        "Free tier; Mini ~$5/site/mo; Basic ~$15/site/mo; Pro ~$30/site/mo (verified 2026-05-18). Plus seat-based design tier pricing.",
    },
    hook: {
      pattern: "Adjacent-category claim",
      analysis:
        "The hero claims design-plus-publish as a distinct category rather than competing with Figma on design alone. This works because designers have lived through the design-engineering-handoff loop and recognize the friction; the alternative (design-to-publish in one tool) is immediately attractive. The hook compresses category evaluation by reframing the comparison from 'Framer vs Figma' to 'Framer vs the handoff loop.'",
    },
    story: {
      pattern: "Design-output-as-marketing flywheel",
      analysis:
        "Story is told through customer case studies featuring distinctive Framer-built sites. The output is visibly different from Webflow-built sites (more designer-led, fewer marketing-CMS conventions), which creates a recognizable Framer aesthetic. Every Framer-built site is implicit advertising to designers who recognize the aesthetic and want it for themselves.",
    },
    offer: {
      pattern: "Per-site pricing with design-tier seat add-on",
      analysis:
        "The pricing structure separates publishing (per-site) from designing (per-seat). This matches the value-capture moments — publishing is when the design becomes live; designing is the ongoing collaborative work. Per-site pricing aligns with the publishing value; per-seat aligns with the design value. The bifurcation works because designers usually own publishing decisions.",
    },
    whatsWorking: [
      "Adjacent-category positioning escapes the Figma category fight entirely.",
      "Design-output-as-marketing flywheel — every Framer-built site is implicit advertising.",
      "Designer-native editing experience matches the Figma-style workflows the target audience already knows.",
      "Per-site pricing aligns with the publishing value-capture moment rather than the design-time value.",
      "Native CMS for blog posts and dynamic pages handles the marketing-site content needs without external CMS.",
      "Animation and interaction capabilities (Framer Motion legacy) differentiate from static-only competitors.",
    ],
    whatToAdapt: [
      "When an incumbent owns the category default, claim an adjacent category the incumbent cannot enter without abandoning its identity.",
      "Design-output-as-marketing flywheel works when your product creates recognizable visible output that the target audience encounters in normal life.",
      "Bifurcated pricing (per-site for publish, per-seat for design) matches multi-value-capture-moment products better than single-axis pricing.",
    ],
    whatToAvoid: [
      "Do not claim an adjacent category if you cannot serve it credibly. Framer's design-plus-publish claim works because the publish capability is real; competitors that promise this and fail to deliver lose the positioning quickly.",
      "Do not pursue per-site pricing if your platform cost does not actually scale with sites. The model only works when each site represents a value moment worth capturing.",
    ],
    brunsonLens: {
      hook: "New Opportunity hook (Brunson Expert Secrets) — Framer claims design-plus-publish as a category distinct from design alone.",
      story:
        "Output-as-marketing flywheel — Framer-built sites are the case studies and the advertising simultaneously.",
      offer:
        "Bifurcated pricing matching publishing and design value-capture moments separately.",
      valueLadderTier:
        "Front-end free tier plus per-site publishing tiers plus per-seat design tier; bifurcated value ladder.",
    },
    faqs: [
      {
        q: "Why does Framer not compete with Figma directly on design tooling?",
        a: "Because Figma owns the collaborative-design category and Framer cannot win there without abandoning the publish capability. The New Opportunity move (design-plus-publish) creates a category Figma cannot enter without disrupting its product identity. Competing in an adjacent category is structurally better than fighting the incumbent on their home turf.",
      },
      {
        q: "Can Framer replace Figma for product design?",
        a: "No, materially. Framer is optimized for marketing-site design-and-publish, not for product UI design with developer handoff. Product design teams that try to use Framer for UI work quickly feel the gap. Framer is for marketing sites; Figma is for product UI.",
      },
      {
        q: "Why does Framer price per-site instead of just per-seat?",
        a: "Because Framer monetizes the published site as a primary value-capture moment. Per-site pricing aligns with the publishing value; per-seat alone would not capture the value Framer provides to designers who publish many sites for different clients or campaigns.",
      },
      {
        q: "What is the Brunson lens on Framer's funnel?",
        a: "New Opportunity positioning that escapes the Figma category fight by claiming design-plus-publish as a distinct category. Combined with output-as-marketing flywheel and bifurcated pricing matching multiple value-capture moments. Brunson lesson: when an incumbent owns a category, the path forward is an adjacent category, not a head-on fight.",
      },
      {
        q: "How does Unlock SaaS think about Framer's pattern?",
        a: "Adjacent-category positioning is one of the highest-leverage positioning moves available when a category has a dominant incumbent. The requirements are real: the adjacent category must be genuinely distinct, your product must serve it credibly, and the incumbent must be structurally unable to enter. Indie founders attempting this should audit all three conditions.",
      },
    ],
    tags: ["adjacent-category", "design-to-publish", "output-flywheel", "new-opportunity"],
    homepageUrl: "https://www.framer.com/",
    lastVerified: "2026-05-18",
  },

  {
    slug: "substack",
    displayName: "Substack",
    creator: "Hamish McKenzie, Chris Best, Jairaj Sethi",
    category: "Newsletter platform",
    oneLine:
      "Substack's funnel runs on the network-effect positioning. The platform sells the discovery graph as much as the publication tools.",
    tldr:
      "Substack's funnel works because the platform sells access to the Substack discovery network as the primary value proposition. The marketing leads with Notes, Recommendations, and the unified app — the implicit promise that joining Substack means joining an audience that grows through cross-publication discovery. The lesson for indie founders: when network effects are real, the network IS the marketing — sell access to the network, not just the product.",
    productSnapshot: {
      whatTheySell:
        "A publication platform for writers with paid subscriptions, Notes (Twitter-style microblogging), Recommendations (cross-publication discovery), and the unified Substack app.",
      whoFor:
        "Writers, journalists, essayists building publications with paid subscriptions and audience growth through Substack's discovery network.",
      pricingNote:
        "Free for writers; Substack takes 10% of paid subscription revenue plus Stripe fees (verified 2026-05-18).",
    },
    hook: {
      pattern: "Network-as-value-proposition",
      analysis:
        "The hero leads with the discovery network rather than with publication tooling. Writers who have tried building newsletters elsewhere (Mailchimp, ConvertKit, self-hosted) recognize the audience-growth challenge immediately. The implicit promise — Substack's network drives your subscriber growth — converts writers who have hit the cold-start wall on other platforms.",
    },
    story: {
      pattern: "Writer-success-via-network case studies",
      analysis:
        "Story is told through case studies featuring writers who grew large paid subscriptions through Substack — explicitly attributing growth to Recommendations and Notes. The story tells the writer 'this is what happens when you join the network' rather than 'this is what our platform tools can do.' Network effects are intangible; case studies make them concrete.",
    },
    offer: {
      pattern: "Free platform plus 10% revenue share",
      analysis:
        "Substack charges no upfront fee — writers join free. The 10% revenue share on paid subscriptions captures value only when writers monetize, which aligns Substack's incentives with writer success. The model removes the canonical platform-adoption friction (cost) and shifts revenue capture to the success moment. Writers who never monetize cost Substack nothing; writers who succeed pay proportionally.",
    },
    whatsWorking: [
      "Network-as-value-proposition matches what writers actually need (audience growth) rather than what platforms typically sell (tools).",
      "Free platform removes adoption friction at the canonical decision point.",
      "10% revenue share aligns Substack's incentives with writer success — Substack only wins when writers win.",
      "Notes feature creates a microblogging surface that drives writer discovery beyond the newsletter format.",
      "Recommendations drive cross-publication discovery — writers grow subscribers from other Substack writers' audiences.",
      "Unified Substack app aggregates discovery in one place rather than scattering writers across platforms.",
    ],
    whatToAdapt: [
      "When network effects are real, the network IS the marketing — sell access to the network, not just the product.",
      "Revenue-share pricing models align incentives with customer success when the underlying value scales with customer revenue.",
      "Case studies that explicitly attribute growth to your network effects make intangible value concrete.",
    ],
    whatToAvoid: [
      "Do not claim network effects you do not have. The Substack network is real because thousands of writers have grown through Recommendations and Notes; claiming network value without delivering it loses trust quickly.",
      "Do not pursue revenue-share pricing if your platform cost does not actually scale with customer revenue. The model only works when the economics align.",
    ],
    brunsonLens: {
      hook: "Network-as-Common-Enemy hook — Substack frames the writing-platform decision as 'with network discovery' vs 'without network discovery,' positioning competitors as solo-publication platforms.",
      story:
        "Writer-success case studies attributing growth to the network — Hero's Journey via Substack-grown publications.",
      offer:
        "Free platform plus revenue-share alignment — Brunson 'no friction at adoption, capture value at success' pattern.",
      valueLadderTier:
        "Single-tier offer (free platform) with revenue-share monetization layer instead of subscription tiers.",
    },
    faqs: [
      {
        q: "Why does Substack take a 10% revenue share instead of charging upfront?",
        a: "Because the revenue-share model removes adoption friction and aligns Substack's incentives with writer success. Writers who never monetize cost Substack nothing; writers who succeed pay proportionally. The model captures value at the success moment rather than at the friction-laden adoption moment.",
      },
      {
        q: "Are Substack Recommendations actually meaningful for growth?",
        a: "Yes for writers already inside the Substack ecosystem with momentum. Recommendations drive meaningful subscriber growth for publications that other Substack writers find worth recommending. For cold-start writers, the network effect is real but not magical — the writing quality still has to earn the recommendations.",
      },
      {
        q: "Should writers leave Substack for Beehiiv or Kit?",
        a: "Depends on what they value. Substack's network drives growth that Beehiiv and Kit cannot match through their own mechanics. Beehiiv's monetization stack (ads network, Boost) provides revenue streams Substack does not. Kit's marketing-email features matter for creators with product-launch sequences. The migration is about what mechanism matters most.",
      },
      {
        q: "What is the Brunson lens on Substack's funnel?",
        a: "Network-as-value-proposition (the network IS the marketing) plus writer-success case studies plus free-platform-with-revenue-share Value Ladder. The unusual element is the depth of network-effect investment — Substack built Notes, the app, and Recommendations specifically to make the network the primary differentiator, not the writing tools.",
      },
      {
        q: "How does Unlock SaaS think about Substack's pattern?",
        a: "Network effects are the strongest moat available when they are real. The requirements are demanding: you need critical mass, you need products that compound network value (Notes, Recommendations, app), and you need patience for compounding to take years. Indie founders should not chase network effects unless they have the time horizon and the audience density to compound.",
      },
    ],
    tags: ["network-effects", "revenue-share", "publication-platform", "writer-first"],
    homepageUrl: "https://substack.com/",
    lastVerified: "2026-05-18",
  },

  {
    slug: "confluence",
    displayName: "Confluence",
    creator: "Atlassian",
    category: "Knowledge management and wiki",
    oneLine:
      "Confluence sells distribution through Jira. The funnel is the Atlassian suite, not the marketing site.",
    tldr:
      "Confluence's primary acquisition channel is bundle and footprint, not its standalone marketing page. Atlassian sells it as part of a suite alongside Jira, and the marketing site exists to support already-in-progress procurement decisions rather than convert cold readers. The lesson for indie founders: when your true distribution is a partner ecosystem, your marketing site is a confirmation surface, not a hook surface — and that is a real strategy, just not a transferable one without a footprint.",
    productSnapshot: {
      whatTheySell:
        "A team wiki and documentation platform sold standalone and as part of the Atlassian suite alongside Jira, Bitbucket, and Trello.",
      whoFor:
        "Engineering organisations, IT-led mid-market and enterprise teams, and any org with an existing Atlassian footprint that needs documentation tied to issues and sprints.",
      pricingNote:
        "Free tier up to 10 users; paid Standard, Premium, and Enterprise plans per user per month, with bundled discounts when purchased alongside other Atlassian products (verified 2026-05-18).",
    },
    hook: {
      pattern: "Suite anchor, not standalone hook",
      analysis:
        "The headline rarely tries to win a cold reader on Confluence alone — it positions Confluence as the documentation surface inside the Atlassian work platform. The implicit hook is 'you already have Jira, you need its wiki', not 'here is the best wiki on the internet'. This works because the buyer is rarely landing cold.",
    },
    story: {
      pattern: "Enterprise proof and integration depth",
      analysis:
        "The story is told through enterprise customer logos, deep Jira-integration screenshots, and the Atlassian brand's accumulated trust. Templates and use-case galleries reinforce that this is a serious tool used by serious teams. There is no founder narrative — Atlassian is an institution at this point, not a story.",
    },
    offer: {
      pattern: "Bundle close",
      analysis:
        "The offer is rarely 'just Confluence'. The procurement motion at scale is 'Atlassian suite for the eng org', and Confluence comes along. The standalone close exists for completeness but is not where the real revenue comes from at mid-market and above.",
    },
    whatsWorking: [
      "Suite distribution: every Jira sale is a near-zero-CAC opportunity for Confluence.",
      "Enterprise trust accumulated over two decades makes procurement-led adoption frictionless.",
      "Integration depth with Jira (inline issues, sprint pages) is genuinely hard to replicate.",
      "Free tier exists to capture small teams who may later upgrade or buy Jira too.",
      "Template gallery oriented at specific work-functions (engineering docs, marketing wikis, HR handbooks) reduces cold-start friction.",
    ],
    whatToAdapt: [
      "If you have an existing product with footprint, your second product's marketing site is a confirmation surface, not a hook surface — design accordingly.",
      "Templates that map to specific job-functions reduce cold-start friction more than generic feature walkthroughs.",
      "Integration-depth screenshots beat feature lists when your differentiator IS the integration.",
    ],
    whatToAvoid: [
      "Do not copy Atlassian's restrained marketing voice unless you have their footprint — without distribution, restraint reads as silence.",
      "Do not build for IT-led procurement if your buyer is an individual founder — the entire UX, pricing, and onboarding will fight you.",
      "Do not depend on suite distribution if you do not have a suite — it is a powerful funnel for Atlassian and a non-starter for a single-product indie.",
    ],
    brunsonLens: {
      hook: "Suite anchor (Atlassian platform) rather than standalone product hook.",
      story:
        "Institutional trust plus integration-depth proof rather than founder narrative.",
      offer:
        "Bundle close at mid-market and above; standalone close for small teams as a flywheel.",
      valueLadderTier: "Existing-customer cross-sell funnel (Jira buyer → Confluence add).",
    },
    faqs: [
      {
        q: "Why does Confluence's marketing page not try harder to win cold readers?",
        a: "Because most of its revenue comes from Atlassian-suite buyers, not cold readers. The marketing site is built to confirm a decision that is already in motion, not to start one. That is a deliberate choice tied to the actual distribution channel.",
      },
      {
        q: "Can an indie SaaS copy Confluence's enterprise positioning?",
        a: "Almost never. Confluence's positioning works because Atlassian owns the surrounding suite and the procurement relationship. Without that footprint, copying the restrained enterprise voice reads as bland and ungrounded.",
      },
      {
        q: "What is the actual conversion mechanism on Confluence's site?",
        a: "Mostly free-tier signup or trial start, with the real qualification happening downstream through sales for mid-market and enterprise. The marketing page's job is to remove objections, not to close.",
      },
      {
        q: "Why is the Confluence free tier so generous?",
        a: "Because small-team adoption is a top-of-funnel for the eventual Atlassian suite sale. Letting a team get used to Atlassian's surfaces (Confluence, Jira free tiers) makes the upgrade and cross-sell motion much smoother years later.",
      },
      {
        q: "What is the Brunson lens on Confluence's funnel?",
        a: "Confluence's funnel is the suite, not the site. Brunson's Value Ladder applies at the Atlassian level: Trello / free Confluence as the lead funnel, paid Confluence and Jira as the ascension, enterprise suite as the back-end. The standalone Confluence marketing page is one rung in a much larger ladder. The lesson: when your ladder is wide enough, individual rungs do not need standalone heroics.",
      },
    ],
    tags: ["enterprise", "suite-distribution", "knowledge-management", "atlassian"],
    homepageUrl: "https://www.atlassian.com/software/confluence",
    lastVerified: "2026-05-18",
  },

  {
    slug: "savvycal",
    displayName: "SavvyCal",
    creator: "Derrick Reimer",
    category: "Scheduling and meeting booking",
    oneLine:
      "SavvyCal sells one specific objection: 'your Calendly link feels rude'. The entire funnel is the objection-and-resolution.",
    tldr:
      "SavvyCal's funnel is built around a single sharp Brunson Hook: the social asymmetry of a Calendly link. The hero, the demo, and the founder narrative all return to the same message — 'we built scheduling that respects the recipient'. The lesson for indie founders: when an incumbent owns the category, naming one specific objection and building your entire product narrative around resolving it can carve out real, defensible niche revenue.",
    productSnapshot: {
      whatTheySell:
        "A scheduling tool whose differentiator is overlaying the recipient's calendar on the booking page, instead of a one-sided availability picker.",
      whoFor:
        "Founders, consultants, and senders who book peer-to-peer meetings and want a scheduling experience that does not signal a sales motion.",
      pricingNote:
        "Free tier; paid Basic and Premium plans starting around $12/month per user, with team pricing above (verified 2026-05-18).",
    },
    hook: {
      pattern: "Named-objection hook",
      analysis:
        "The hero leads with the recipient-overlay UX as the entire value proposition. The implicit hook is 'you know that thing that feels off about Calendly links? It is the asymmetry. We fixed it.' This converts a reader who has had the bad-link experience faster than any feature list could.",
    },
    story: {
      pattern: "Founder craft narrative",
      analysis:
        "Derrick Reimer (also a co-founder of Drip and a long-time bootstrapper) is visible across the marketing — the story is 'a craft-obsessed indie founder who cared enough to redesign a default'. This is exactly the kind of founder the dream customer wants to buy from, and the narrative reinforces the product's positioning.",
    },
    offer: {
      pattern: "Free tier as proof, paid tier as polish",
      analysis:
        "The free tier is enough to let a reader experience the overlay UX with a real recipient. The paid tier adds team features, integrations, and polish that matter once the magic moment has happened. The free tier is the demonstration, not a trial.",
    },
    whatsWorking: [
      "Single-objection positioning — the entire site returns to 'recipient overlay' as the wedge.",
      "Founder-led narrative aligns with the indie founder buyer profile in a way Calendly's enterprise tone cannot match.",
      "Free tier lets the differentiator be experienced, not just claimed, before any payment decision.",
      "Pricing transparency and per-seat economics that compete with Calendly without trying to undercut.",
      "Restrained design and copy reinforce the 'craft tool' positioning the buyer is paying for.",
    ],
    whatToAdapt: [
      "Identify one specific objection your category's leader creates, name it explicitly, and build your entire positioning around resolving it.",
      "If your differentiator is UX, the free tier should be enough to feel the difference — do not gate the magic moment.",
      "Founder-as-craftsperson narrative aligns with indie buyers; make the founder visible, not anonymous.",
    ],
    whatToAvoid: [
      "Do not try to out-feature an incumbent on every dimension — pick one and own it.",
      "Do not copy SavvyCal's restrained voice if your product does not actually have craft-tier polish to back it up.",
      "Do not position as 'cheaper Calendly' — the differentiator is sender brand signal, not price.",
    ],
    brunsonLens: {
      hook: "Named-objection hook against category default (Calendly's one-sided link).",
      story:
        "Founder-led craft narrative — Derrick Reimer as the visible builder.",
      offer:
        "Free tier as experiential proof; paid as polish and team scaling.",
      valueLadderTier: "Front-end lead funnel (free tier as bait, paid as ascension).",
    },
    faqs: [
      {
        q: "Why does SavvyCal lead with the recipient-overlay UX instead of features?",
        a: "Because that is their differentiator and the rest of the category is undifferentiated. Leading with the feature that matters most lets cold readers self-qualify in seconds — anyone who has felt the asymmetry of a Calendly link recognises the wedge immediately.",
      },
      {
        q: "Can an indie SaaS copy SavvyCal's single-objection positioning?",
        a: "Yes, if you actually have an objection that the incumbent meaningfully creates and that you meaningfully fix. The failure mode is naming a weak objection or claiming to fix one without the UX to back it up. SavvyCal's wedge works because the objection is real and the fix is visible.",
      },
      {
        q: "Why is the SavvyCal founder so visible?",
        a: "Because Derrick Reimer's reputation as a craft-obsessed bootstrapper aligns directly with the dream-customer buyer (other indie founders who care about craft). The founder narrative is part of the product's positioning, not a sidebar.",
      },
      {
        q: "Is SavvyCal trying to beat Calendly on features?",
        a: "No — SavvyCal is competing on a different axis. Calendly wins on integrations and enterprise depth; SavvyCal wins on the sender's brand signal in peer-to-peer scheduling. The two products serve different jobs even though they sit in the same category.",
      },
      {
        q: "What is the Brunson lens on SavvyCal's funnel?",
        a: "SavvyCal ran a precise New Opportunity move: instead of competing inside Calendly's category, it named one objection that Calendly creates and made the entire product about resolving it. Brunson Hook-Story-Offer is unusually clean here — the hook (recipient overlay), the story (craft founder), and the offer (free experiential tier) all reinforce the same wedge. The lesson: a clear wedge with one objection beats a feature-parity attack on a dominant incumbent.",
      },
    ],
    tags: ["wedge", "named-objection", "founder-led", "craft-tool"],
    homepageUrl: "https://savvycal.com/",
    lastVerified: "2026-05-18",
  },

  {
    slug: "ghost",
    displayName: "Ghost",
    creator: "John O'Nolan",
    category: "Newsletter and publishing platforms",
    oneLine:
      "Ghost sells ownership as the product. The funnel is the non-profit foundation, the open-source code, and the explicit anti-Substack framing.",
    tldr:
      "Ghost's funnel positions the product as the principled alternative to managed creator networks: open-source, non-profit-foundation-owned, zero platform-cut on subscriptions. The marketing site, governance structure, and pricing model all reinforce the same wedge — you own the publication, the platform does not own you. The lesson for indie founders: principle-led positioning is durable when the principle maps to a real structural decision (legal entity, code license, revenue model), and it falls apart when it is just rhetoric.",
    productSnapshot: {
      whatTheySell:
        "An open-source publishing platform for newsletters, blogs, and membership publications, available self-hosted free or as Ghost(Pro) managed hosting.",
      whoFor:
        "Writers, publishers, and small media companies who want a fully owned site, custom design, and no platform cut on subscription revenue.",
      pricingNote:
        "Self-hosted open-source free; Ghost(Pro) managed hosting starts around $11/month with tiered plans by member count; zero cut on subscription revenue beyond Stripe fees (verified 2026-05-18).",
    },
    hook: {
      pattern: "Principle-led wedge against named category",
      analysis:
        "The hero positions Ghost against managed creator networks (Substack the implicit reference) on principle: own your audience, own your design, own your economics. The hook works because the principle maps to a concrete structural difference (open source, non-profit foundation, no revenue cut) the buyer can verify.",
    },
    story: {
      pattern: "Foundation governance as proof",
      analysis:
        "The story is told through the Ghost Foundation governance, public financials, and the open-source contributor community. The brand reinforces 'we are not optimising for an exit because we are structurally not built to' — which is the inverse of every VC-funded creator network.",
    },
    offer: {
      pattern: "Two-track offer (self-host free, managed paid)",
      analysis:
        "The free open-source self-host removes the 'I will just build it myself' objection. Ghost(Pro) managed hosting is the easy path for buyers who do not want to run infrastructure. The two tracks each serve a different segment without compromising the principle.",
    },
    whatsWorking: [
      "Principle maps to verifiable structure — open source, foundation governance, no revenue cut — so the marketing claim is the same as the legal reality.",
      "Anti-incumbent framing (against managed creator networks) gives readers a side to be on.",
      "Two-track offer captures both technical buyers (self-host) and convenience buyers (Pro).",
      "Theme marketplace and customisation depth signal that 'own your design' is a real promise, not a slogan.",
      "Member portal and newsletter features have closed most of the feature gap with managed alternatives.",
    ],
    whatToAdapt: [
      "If you position on a principle, back it with a verifiable structural decision the buyer can audit.",
      "Two-track offers (DIY free, managed paid) can capture both ends of a buyer spectrum without diluting the principle.",
      "Anti-incumbent framing works when the incumbent's commercial structure is materially different from yours.",
    ],
    whatToAvoid: [
      "Do not position on principle if you cannot back it with structure — readers smell rhetoric without proof.",
      "Do not assume self-hosted will dominate revenue — Ghost(Pro) is the commercial engine, not the free tier.",
      "Do not copy the foundation governance angle if your entity is a normal VC-backed startup — the structural truth has to match the marketing.",
    ],
    brunsonLens: {
      hook: "Principle-led wedge (ownership) against managed-network incumbents.",
      story:
        "Foundation governance and open-source community as verifiable proof.",
      offer:
        "Two-track offer — free self-host as bait, managed Pro as ascension.",
      valueLadderTier: "Front-end lead funnel (open source self-host) into managed hosting ascension.",
    },
    faqs: [
      {
        q: "Why does Ghost lead with ownership instead of features?",
        a: "Because ownership is the structural difference no managed competitor can match without abandoning their revenue model. Features can be copied; the non-profit foundation and open-source license cannot.",
      },
      {
        q: "Can an indie SaaS copy Ghost's principle-led positioning?",
        a: "Only if the principle maps to a real structural decision. Ghost's positioning works because the open-source license, foundation governance, and zero-cut revenue model are legally real. Without that backing, principle-led copy reads as marketing.",
      },
      {
        q: "Why does Ghost have both a free and a paid version?",
        a: "Different buyers. Self-host serves technical buyers who value ownership and have the skills to maintain a server. Ghost(Pro) serves writers who want the same ownership with none of the ops burden. The two-track approach captures both without compromising either.",
      },
      {
        q: "Is Ghost competing with Substack?",
        a: "Yes, but on a different axis. Substack competes on network and discovery; Ghost competes on ownership and economics. They overlap in feature space but resolve different buyer priorities. The two will coexist because they serve different writer profiles.",
      },
      {
        q: "What is the Brunson lens on Ghost's funnel?",
        a: "Ghost ran a precise Brunson Big Domino move: 'if I believe my publication should be mine, Ghost is the only structural fit.' The hook (ownership), story (foundation governance), and offer (open-source plus managed) all reinforce a single belief. The lesson: a Big Domino positioned around a structural truth the incumbent cannot match is one of the most durable wedges available.",
      },
    ],
    tags: ["open-source", "principle-led", "non-profit", "publication-platform"],
    homepageUrl: "https://ghost.org/",
    lastVerified: "2026-05-18",
  },

  {
    slug: "monday",
    displayName: "Monday.com",
    creator: "Roy Mann and Eran Zinman",
    category: "Project management and work-OS platform",
    oneLine:
      "Monday sells visual-first work management to non-technical buyers. The funnel is templates, vertical landing pages, and aggressive paid acquisition.",
    tldr:
      "Monday's funnel is built for a non-technical team buyer through three levers: visual-first product design (the boards look obvious), vertical landing pages (a different homepage per use-case), and heavy paid acquisition (TV, podcast sponsorships, programmatic at scale). The lesson for indie founders: when your buyer is a non-technical team lead, the funnel is the visual demo plus a use-case-specific entry point, not feature parity with developer-shaped competitors.",
    productSnapshot: {
      whatTheySell:
        "A visual work-OS platform with vertical products for project management (Work Management), engineering (Dev), CRM, and Service.",
      whoFor:
        "Non-technical team leads in marketing, ops, sales, customer success, and creative agencies who want a visual project management surface their team will actually use.",
      pricingNote:
        "Free tier capped at 2 users; paid Basic, Standard, Pro, Enterprise plans billed per seat per month with minimum-seat thresholds on some tiers (verified 2026-05-18).",
    },
    hook: {
      pattern: "Visual-first demo hook",
      analysis:
        "The hero leads with the boards UI — colourful, obvious, easy to read at a glance. The implicit hook is 'your team will not need training to use this'. For non-technical buyers worried about adoption, the visual is the message.",
    },
    story: {
      pattern: "Vertical use-case proof",
      analysis:
        "Monday runs different landing pages per use-case (marketing, sales, dev, HR, creative) with vertical-specific templates and case studies. Each landing page reads as if Monday was built for that one team. The story is 'this is exactly your shape', told in the buyer's own vocabulary.",
    },
    offer: {
      pattern: "Aggressive trial-led close with paid amplification",
      analysis:
        "The offer is a free trial of the team plan, amplified by heavy paid spend across TV, podcasts, and programmatic. The funnel is built to take a cold non-technical buyer from awareness to trial in one session. The free tier (2 users) exists as a downgrade path, not a primary entry.",
    },
    whatsWorking: [
      "Visual-first design lets non-technical buyers self-qualify in seconds.",
      "Vertical landing pages collapse 'is this for me' into 'yes, look — your team is on the screenshot'.",
      "Heavy paid spend across TV and podcasts builds top-of-funnel awareness most B2B SaaS will never afford.",
      "Template gallery per vertical reduces cold-start friction for non-technical teams.",
      "Aggressive trial-led conversion path with built-in onboarding nudges and dedicated CS for paid trials.",
    ],
    whatToAdapt: [
      "Build a use-case-specific landing page for each vertical you serve, with the templates and language that vertical uses.",
      "If your buyer is non-technical, the screenshot is the headline — design the hero around the product's visual obviousness.",
      "Trial-led conversion works when the time-to-magic-moment in your product is short; design the trial to hit the magic moment within the first session.",
    ],
    whatToAvoid: [
      "Do not try to match Monday's paid acquisition spend — they raised hundreds of millions for a reason.",
      "Do not copy the vertical-landing-page pattern unless you have enough product depth that each vertical is genuinely served differently.",
      "Do not pitch Monday's visual style to a technical buyer — devs often actively dislike the boards UI and the brand voice.",
    ],
    brunsonLens: {
      hook: "Visual-first hook for non-technical team leads (boards as the message).",
      story:
        "Vertical use-case proof — a different landing page and template set per buyer team.",
      offer:
        "Trial-led close amplified by heavy paid acquisition.",
      valueLadderTier: "Self-serve trial funnel with paid acquisition driving top-of-funnel.",
    },
    faqs: [
      {
        q: "Why does Monday run so many vertical landing pages?",
        a: "Because non-technical buyers self-qualify on 'is this for me' before they evaluate features. A landing page per vertical (marketing, sales, dev, creative) lets each buyer see their own team on the screenshot, which converts much better than a generic homepage.",
      },
      {
        q: "Can an indie SaaS copy Monday's paid acquisition playbook?",
        a: "Not directly — Monday spends hundreds of millions per year on paid acquisition. The transferable lesson is the channel mix logic (TV and podcasts for awareness, programmatic for retargeting, paid trials for conversion), not the spend volume.",
      },
      {
        q: "Why does Monday lead with visuals instead of features?",
        a: "Because the buyer is a non-technical team lead worried about adoption. Visuals communicate 'easy to use' faster than any feature list. The boards being colourful and obvious IS the value proposition.",
      },
      {
        q: "Is Monday's free tier meaningful for indie founders?",
        a: "The 2-user free tier is mostly a downgrade catcher, not a primary entry. Real adoption happens on paid trials, often after seeing a TV or podcast ad. The free tier is too small for most real teams to live in.",
      },
      {
        q: "What is the Brunson lens on Monday's funnel?",
        a: "Monday runs Brunson Hook-Story-Offer with the buyer's vertical vocabulary at every layer. The hook is visual-first (the boards do the work), the story is vertical proof (your team on the screenshot), the offer is trial-led with paid amplification. The lesson: when your buyer is non-technical and your product is visual, the funnel design and the product design have to match — feature-list copy on a visual product is wasted effort.",
      },
    ],
    tags: ["paid-acquisition", "vertical-landing-pages", "non-technical-buyer", "work-os"],
    homepageUrl: "https://monday.com/",
    lastVerified: "2026-05-18",
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
