/**
 * Post-mortems catalog – pSEO programmatic surface analysing failed
 * SaaS / consumer-tech bets through Russell Brunson's Hook / Story / Offer
 * lens plus the Unlock SaaS diagnostic categories (Wrong Person, Weak Offer,
 * Weak Belief).
 *
 * Intent class targeted:
 *   "[product] post-mortem" / "why did [product] fail" /
 *   "[product] failure analysis" / "why [product] shut down"
 *
 * Canonical audience match:
 *   Post-launch pre-revenue indie SaaS founders are already reading these
 *   stories. They search the headline (Quibi, Juicero, MoviePass). We meet
 *   them there and reframe the wreckage through the same Brunson framework
 *   the Playbook runs against the reader's own product, ending with a
 *   "what the diagnostic would have caught" counterfactual that anchors
 *   the lesson to a takeaway the founder can apply tomorrow.
 *
 * Brunson Hard-Rule reconciliation (strategy/google-strategy.md §AC-flaw):
 *   - No slag for slag's sake. Each post-mortem treats the founders with
 *     respect; the analysis is structural, not personal.
 *   - No fabricated metrics. Funding totals, timelines, shutdown years,
 *     and prices are widely-reported public facts. Where a specific number
 *     is uncertain we describe the range qualitatively rather than guess.
 *   - No fabricated quotes. The post-mortem describes positioning and
 *     mechanics, never invents copy attributed to the company.
 *   - Each entry lists at least one source. Wikipedia is the canonical
 *     source because it is community-maintained and stable; major outlet
 *     coverage is added where relevant.
 *   - lastVerified ISO is the audit trail for when every claim was
 *     manually re-read against the public record.
 *
 * The Isenberg overlay (memory/project_unlocksaas_isenberg_playbook.md):
 *   This surface is the "boring pain" play executed at scale. Every
 *   founder who reads about a failed SaaS is implicitly asking: "what
 *   would my product look like if it failed the same way". The
 *   counterfactual block answers that exact question and routes the
 *   reader to the free diagnostic. The Dream-100 kicker: every founder
 *   we contact about a post-mortem (where the founder is reachable and
 *   willing) is a warm intro for the Unlock SaaS community.
 *
 * To add a post-mortem: append an entry, set lastVerified to today's ISO
 * after re-reading the source links, and ship. generateStaticParams +
 * sitemap.ts + the SURFACES registry pick it up automatically.
 */

export interface PostMortemTimelineBeat {
  /** Coarse-grained period label, e.g. "2017" or "Q1 2020". */
  period: string;
  /** Single observable event, no commentary. */
  event: string;
}

export interface PostMortemSource {
  /** Display label, e.g. "Wikipedia" or "Bloomberg". */
  label: string;
  /** Canonical URL. Prefer Wikipedia + major outlets for link stability. */
  url: string;
}

export interface PostMortemFaq {
  q: string;
  a: string;
}

/**
 * Brunson diagnosis category – the same three labels the Unlock SaaS
 * V2 diagnostic assigns to a live founder page. Keeping the vocabulary
 * consistent across the surface is what makes this a teaching system
 * rather than a clip show of failed startups.
 */
export type BrunsonDiagnosis =
  | "Wrong Person"
  | "Weak Offer"
  | "Weak Belief"
  | "Wrong Person + Weak Offer"
  | "Wrong Person + Weak Belief"
  | "Weak Offer + Weak Belief";

export interface UnlockSaaSCounterfactual {
  /** Brunson diagnosis the V2 audit would have assigned. */
  diagnosis: BrunsonDiagnosis;
  /** What the diagnostic would have flagged on a single page-read. */
  diagnosticSignal: string;
  /** Which step of The Machine would have intervened, and how. */
  machineGap: string;
  /** The structural fix, not a hindsight rewrite of the whole company. */
  counterfactual: string;
}

export interface PostMortem {
  /** URL slug. Kebab-case. */
  slug: string;
  /** Proper-noun display name. */
  displayName: string;
  /** Category bucket – drives hub grouping. */
  category: string;
  /** e.g. "2018 to 2020". Years en-dashed by the renderer, not stored. */
  yearsActive: string;
  /** Year the product effectively died. Used for sorting. */
  shutdownYear: number;
  /** Single-line cause label, e.g. "Unit economics never converged". */
  shutdownReason: string;
  /** Publicly-reported funding context. Qualitative if uncertain. */
  fundingRaisedNote?: string;
  /** Publicly-reported peak valuation. Qualitative if uncertain. */
  peakValuationNote?: string;
  /** Single-line thesis of the post-mortem. */
  oneLine: string;
  /**
   * 40-to-60 word TL;DR written for AEO citation. ChatGPT and Perplexity
   * paraphrase this paragraph when asked "why did X fail". Must stand
   * alone, be factually conservative, and end with the transferable
   * lesson.
   */
  tldr: string;
  productSnapshot: {
    whatTheySold: string;
    whoFor: string;
    pricingNote: string;
  };
  /** 4-to-6 timeline beats, public events only. */
  timeline: ReadonlyArray<PostMortemTimelineBeat>;
  /** 3-to-5 structural causes, framework-agnostic. */
  rootCauses: ReadonlyArray<string>;
  /** The Brunson counterfactual block – the page's anchor. */
  unlockSaaSWouldHaveCaught: UnlockSaaSCounterfactual;
  /** 4-to-6 transferable lessons for a post-launch pre-revenue indie SaaS. */
  lessons: ReadonlyArray<string>;
  /** 2-to-4 specific moves a reader should NOT copy as a "lesson". */
  whatToAvoid: ReadonlyArray<string>;
  /** 4-to-6 FAQs targeted at the question a researcher actually types. */
  faqs: ReadonlyArray<PostMortemFaq>;
  /** Tags for hub grouping and per-page related-link scoring. */
  tags: ReadonlyArray<string>;
  /** Public sources backing the claims above. */
  sources: ReadonlyArray<PostMortemSource>;
  /** Last known canonical URL (archive.org if the product is dead). */
  homepageUrl?: string;
  /** ISO date of last manual claim-by-claim audit. */
  lastVerified: string;
}

// -- Catalog ------------------------------------------------------------------

const POST_MORTEMS_LIST: PostMortem[] = [
  {
    slug: "quibi",
    displayName: "Quibi",
    category: "Consumer streaming",
    yearsActive: "2018 to 2020",
    shutdownYear: 2020,
    shutdownReason: "Wrong-Person product launched into a Wrong-Moment market",
    fundingRaisedNote:
      "Reported to have raised roughly $1.75 billion in equity before launch.",
    peakValuationNote: "Not publicly disclosed; closed within months of launch.",
    oneLine:
      "Quibi sold a category nobody asked for to an audience that no longer existed by the time the product shipped.",
    tldr:
      "Quibi launched a short-form premium mobile video service in April 2020 and shut down by October 2020 despite roughly $1.75 billion in funding. The product was designed for commuter viewing right as a global lockdown removed commuting from the world. The lesson for indie founders: a brilliantly executed product aimed at the wrong person at the wrong moment dies regardless of capital.",
    productSnapshot: {
      whatTheySold:
        "A subscription mobile-first streaming service serving premium short-form (under ten minute) episodic video designed to be watched in commute-length blocks.",
      whoFor:
        "Marketed at younger commuter viewers who had spare moments between activities and wanted prestige-grade short-form content rather than user-generated video.",
      pricingNote:
        "Launched at a monthly subscription in the high-single-digit range, with an ad-supported tier slightly below.",
    },
    timeline: [
      { period: "2018", event: "Founded by Jeffrey Katzenberg with Meg Whitman as CEO." },
      { period: "2018 to 2019", event: "Raised roughly $1.75 billion across two large funding rounds before launch." },
      { period: "April 2020", event: "Launched in the United States during the early weeks of the COVID-19 lockdown." },
      { period: "Mid 2020", event: "Subscriber growth stalled; reviewers and viewers questioned the mobile-only design." },
      { period: "October 2020", event: "Announced shutdown roughly six months after launch." },
    ],
    rootCauses: [
      "Designed for a context (commuting, line-waiting) that the world structurally suspended at the moment of launch.",
      "Mobile-only viewing was a constraint dressed as a feature; the target audience already had larger screens at home.",
      "Premium short-form was an unproven category; YouTube and TikTok had trained the same audience to expect short-form free.",
      "Marketing leaned on celebrity and prestige rather than naming the specific job-to-be-done for the viewer.",
      "Capital and Hollywood polish substituted for evidence of demand; the validation loop ran after the build instead of before it.",
    ],
    unlockSaaSWouldHaveCaught: {
      diagnosis: "Wrong Person + Weak Offer",
      diagnosticSignal:
        "The page would have read as a category-creation pitch with no specific buyer described in the first scroll. No named avatar, no felt-pain hook, no comparison to the closest free alternative the audience already used.",
      machineGap:
        "Machine Step 2 (Diagnose the Dream Customer) and Step 3 (Build the Specific Offer) would have flagged that the buyer description was demographic, not behavioural, and that the offer competed with free.",
      counterfactual:
        "A single-cohort small launch (paid pilot to a defined viewer segment) would have surfaced the mobile-only objection and the free-alternatives problem before the eight-figure marketing spend committed the company to the launch.",
    },
    lessons: [
      "Demographic targeting (age, income) is not an avatar. Behavioural targeting (what job is being done in the moment of use) is.",
      "If your product competes with a free alternative the buyer already uses, your offer page must name that alternative and explain the upgrade in one line.",
      "Build the validation loop before the marketing loop. Capital cannot retire a missing-demand risk.",
      "Constraints dressed as features (mobile-only, single-device, premium-only) are read by buyers as the feature you did not yet build.",
      "Prestige is not positioning. A buyer needs to know who the product is for, why it is better than what they already do, and what they will lose by not having it.",
    ],
    whatToAvoid: [
      "Do not pre-spend on marketing while validation is still pending. Quibi's launch budget was the kind of one-shot bet a pre-revenue founder cannot afford to imitate even at a smaller scale.",
      "Do not assume celebrity endorsements substitute for a specific buyer promise. The talent moves attention; the offer page does the conversion work.",
    ],
    faqs: [
      {
        q: "Why did Quibi fail despite the $1.75 billion in funding?",
        a: "Because the product was built for a viewing moment (commuting, line-waiting) that the COVID lockdown removed, and because the mobile-only constraint pushed away the home viewers who still had spare time. Capital scales execution, not demand; the demand was not there.",
      },
      {
        q: "Was the COVID lockdown the real reason Quibi shut down?",
        a: "The lockdown accelerated the failure but did not cause it. The category (premium short-form mobile-only video) was unproven, the offer competed with free, and the buyer was described demographically rather than behaviourally. The product would have struggled in any launch year; the lockdown shortened the timeline.",
      },
      {
        q: "What is the Unlock SaaS diagnosis for Quibi?",
        a: "Wrong Person and Weak Offer. The page sold a category to an audience that was not named, against a free alternative that was not addressed, with a constraint (mobile-only) that the buyer read as a limitation. The Brunson framework treats this as a positioning failure, not a marketing one.",
      },
      {
        q: "Can an indie founder learn anything useful from a $1.75 billion failure?",
        a: "Yes. The failure mode is fractal. A pre-revenue indie SaaS that names no specific buyer and competes with a free incumbent fails for the same structural reason Quibi did, on a four-figure budget instead of a nine-figure one. The fix is the same: name the avatar, name the alternative, name the upgrade.",
      },
    ],
    tags: ["wrong-person", "weak-offer", "consumer-streaming", "validation-skipped", "mobile-only"],
    sources: [
      { label: "Wikipedia – Quibi", url: "https://en.wikipedia.org/wiki/Quibi" },
    ],
    homepageUrl: "https://en.wikipedia.org/wiki/Quibi",
    lastVerified: "2026-05-22",
  },

  {
    slug: "juicero",
    displayName: "Juicero",
    category: "Connected hardware",
    yearsActive: "2013 to 2017",
    shutdownYear: 2017,
    shutdownReason: "Buyer discovered the juice bag squeezed by hand without the machine",
    fundingRaisedNote:
      "Reported to have raised roughly $120 million across multiple rounds.",
    peakValuationNote: "Not publicly disclosed.",
    oneLine:
      "Juicero sold a $700 wifi-connected juicer until a reporter discovered the proprietary bags squeezed by hand just as well.",
    tldr:
      "Juicero sold a wifi-connected $700 juice press paired with $5 to $8 single-use produce packs. In April 2017 Bloomberg reporters showed the produce packs squeezed by hand without needing the machine at all, collapsing the offer's structural premise. The company shut down within months. The lesson for indie founders: if your product can be replaced by the buyer's bare hands, the buyer will eventually try.",
    productSnapshot: {
      whatTheySold:
        "A wifi-connected counter-top juice press that read QR codes from proprietary single-use produce packs and pressed them at a specific pressure-temperature curve.",
      whoFor:
        "High-income wellness-leaning home consumers willing to pay a premium for an at-home juice cleanse experience without preparing produce.",
      pricingNote:
        "Originally priced at roughly $700 for the press (later cut substantially), with single-use produce packs at roughly $5 to $8 each.",
    },
    timeline: [
      { period: "2013", event: "Founded by Doug Evans." },
      { period: "2014 to 2016", event: "Raised roughly $120 million from major venture firms over multiple rounds." },
      { period: "March 2016", event: "Launched the consumer press at roughly $700." },
      { period: "April 2017", event: "Bloomberg published a video showing the produce packs squeezed by hand at near-identical yield to the machine." },
      { period: "September 2017", event: "Company shut down and offered refunds to buyers." },
    ],
    rootCauses: [
      "The structural premise (you need the press to extract the juice) was falsifiable in 90 seconds and was eventually falsified publicly.",
      "Pricing implied a deep utility moat that the product did not have; the buyer's perceived value was higher than the actual functional value.",
      "The wifi-connected QR pack system added recurring cost without adding recurring value the buyer could feel.",
      "Marketing leaned on premium aesthetics and venture credibility rather than on a clear job-to-be-done the buyer could not do without the machine.",
    ],
    unlockSaaSWouldHaveCaught: {
      diagnosis: "Weak Offer + Weak Belief",
      diagnosticSignal:
        "The page would have failed the 'why this and not that' test. There was no on-page answer for 'what does the machine do that I cannot do with my hands or a basic press' – which is the exact question a careful buyer would ask before paying $700.",
      machineGap:
        "Machine Step 3 (Build the Specific Offer) would have flagged that the offer rested on a moat (proprietary extraction) that did not exist. Step 6 (Verified Belief) would have flagged the absence of comparison-to-alternatives testimonials.",
      counterfactual:
        "A pre-launch comparison test (machine vs hand squeeze, published transparently) would have either reinforced the offer or forced the company to redesign the product before scaling. The failure mode was discoverable in the first internal QA cycle.",
    },
    lessons: [
      "If the buyer can replace your product with their bare hands or a five-dollar tool, the buyer eventually will. Build the moat before the marketing.",
      "Comparison-to-alternative belongs on your offer page, written by you. If you do not address it, a reporter or competitor eventually will.",
      "Premium pricing communicates premium utility. If the utility gap is smaller than the price gap, the gap eventually closes against you.",
      "Connectivity and subscription mechanics (QR codes, recurring packs) add value only when the buyer can articulate the benefit. They are not value primitives.",
      "Venture credibility is not buyer belief. The buyer needs evidence that THEY will be better off, not that smart investors believe you.",
    ],
    whatToAvoid: [
      "Do not price for the premium aesthetic before the utility moat is verifiable. Premium pricing in front of a thin utility moat invites the exact comparison test that killed Juicero.",
      "Do not stack recurring costs (proprietary consumables, connectivity) on top of an already-thin moat. Each recurring cost multiplies the buyer's frustration when the moat falls.",
    ],
    faqs: [
      {
        q: "Why did Juicero collapse so quickly after the Bloomberg story?",
        a: "Because the story was structurally true – the produce packs squeezed by hand at near-identical yield. The product's entire offer rested on the assumption that the press did something the buyer could not. Once the assumption was visibly false, the price could not hold.",
      },
      {
        q: "Was Juicero's failure about the product or the marketing?",
        a: "Both, but the product was upstream. The marketing was honest about what the product was; the product itself did not earn the price it charged. No marketing fix could survive a buyer reproducing the result without the machine.",
      },
      {
        q: "What is the Unlock SaaS diagnosis for Juicero?",
        a: "Weak Offer with a Weak Belief follow-on. The offer assumed a utility moat the product did not have. The belief side never recovered once the moat was publicly tested. The fix would have been to either redesign the product to earn the price, or to drop the price to the level the actual utility could defend.",
      },
      {
        q: "Are there indie SaaS analogues to the Juicero failure mode?",
        a: "Yes. Any indie SaaS where the buyer can replicate the core function with a spreadsheet, a Zap, or a basic script is in the same risk bucket. The defence is the same: name the alternative on your offer page, explain the upgrade in one line, and earn the price gap.",
      },
    ],
    tags: ["weak-offer", "weak-belief", "hardware", "premium-pricing", "thin-moat"],
    sources: [
      { label: "Wikipedia – Juicero", url: "https://en.wikipedia.org/wiki/Juicero" },
    ],
    homepageUrl: "https://en.wikipedia.org/wiki/Juicero",
    lastVerified: "2026-05-22",
  },

  {
    slug: "moviepass",
    displayName: "MoviePass",
    category: "Subscription consumer",
    yearsActive: "2011 to 2019 (consumer-facing collapse 2017 to 2019)",
    shutdownYear: 2019,
    shutdownReason: "Subscription price set permanently below variable cost per user",
    fundingRaisedNote:
      "Parent company Helios and Matheson Analytics raised and burned hundreds of millions; precise totals are disputed.",
    peakValuationNote: "Parent Helios traded publicly; market cap collapsed in 2018 to 2019.",
    oneLine:
      "MoviePass priced a $9.95 monthly subscription below the wholesale ticket cost it paid the theatre and tried to scale into the gap.",
    tldr:
      "MoviePass charged subscribers $9.95 a month for what was effectively a daily theatre ticket, while paying theatres roughly full retail price per ticket. Active subscribers structurally cost the company more than they paid. Every additional sign-up accelerated the burn. The company collapsed in 2019. The lesson for indie founders: unit economics are not a downstream optimisation; if your offer loses money on every customer, growth makes the problem worse, not better.",
    productSnapshot: {
      whatTheySold:
        "A monthly subscription that allowed the holder to attend one standard movie ticket per day at most US cinemas.",
      whoFor:
        "Frequent moviegoers in the United States, especially urban viewers who attended multiple films per month and felt the per-ticket price of theatre attendance.",
      pricingNote:
        "Headline price was $9.95 per month from August 2017 onward; for most heavy users this was less than the cost of a single ticket the company reimbursed to the cinema.",
    },
    timeline: [
      { period: "2011", event: "Founded; tested various pricing models over multiple years without scale." },
      { period: "August 2017", event: "Helios and Matheson Analytics took a controlling stake and cut the headline price to $9.95 a month." },
      { period: "Late 2017", event: "Subscriber count grew rapidly past one million on the new price." },
      { period: "2018", event: "Cash reserves repeatedly depleted; outages, throttling, and pricing restrictions introduced." },
      { period: "September 2019", event: "Service shut down to the consumer." },
    ],
    rootCauses: [
      "Subscription price was set permanently below the variable cost of serving a heavy user; growth accelerated the burn rather than averaging it down.",
      "The unit economics assumed light usage (subscribers paying for the option but rarely redeeming); the heavy users showed up immediately and the math broke.",
      "No real upstream agreement with cinemas; the company paid retail per ticket while charging wholesale per month.",
      "Attempts to restrict heavy usage (blackout dates, surge fees, ticket holds) eroded the original promise faster than they fixed the math.",
      "Marketing-driven growth was treated as the success metric while the underlying unit margin was already negative.",
    ],
    unlockSaaSWouldHaveCaught: {
      diagnosis: "Weak Offer",
      diagnosticSignal:
        "The diagnostic would have asked the single question MoviePass could not answer: 'what does each new subscriber cost you, and how does that compare to what they pay you'. A negative answer to that question is a Weak Offer regardless of how appealing the headline is.",
      machineGap:
        "Machine Step 3 (Build the Specific Offer) and Step 4 (Run the Pre-Sell) both require unit-margin sanity. A subscription that loses money on the median heavy user is structurally a Weak Offer until the supply-side cost is renegotiated.",
      counterfactual:
        "The structural fix was an upstream wholesale deal with cinemas before the consumer price cut. Without that, the only viable subscription price was one that priced the heavy user out of the bottom plan. Either move would have changed the company's trajectory.",
    },
    lessons: [
      "Calculate your unit economics from the heavy user, not the median user. The heavy user shows up first and breaks the model fastest.",
      "If your supply cost is set by a third party at retail, your subscription cannot be priced at less than that retail cost without subsidising every active customer.",
      "Growth amplifies the underlying unit margin. Positive unit margin growth compounds; negative unit margin growth destroys.",
      "Restrictions added after the original promise (throttling, blackouts, daily limits) erode trust faster than they fix economics. The fix has to be on the offer side, not on the enforcement side.",
      "Mass-scale acquisition is dangerous before the unit margin is positive. The right order is unit margin, then retention, then scale.",
    ],
    whatToAvoid: [
      "Do not price an offer below variable cost to win the headline. The headline grows the customer base into a financial hole you cannot dig out of.",
      "Do not assume light usage. If your offer attracts the heavy user disproportionately (and it usually does), the heavy user is the unit you must price for.",
    ],
    faqs: [
      {
        q: "Why did the $9.95 MoviePass price not work?",
        a: "Because the company paid theatres roughly the full retail price per ticket while charging the subscriber less than one ticket per month. Every heavy user cost the company multiples of what they paid in. Growing the subscriber base scaled the loss linearly.",
      },
      {
        q: "Could MoviePass have survived with better unit economics?",
        a: "Probably yes. A wholesale supply-side deal with cinemas (the same kind movie chains later signed with subscription competitors) would have let the price hold. Without that deal the price was structurally impossible at any meaningful scale.",
      },
      {
        q: "What is the Unlock SaaS diagnosis for MoviePass?",
        a: "Weak Offer. The offer page made a promise the underlying margin could not honour. No amount of marketing, retention work, or product polish closes that gap. The fix is on the offer side, either by raising price, narrowing usage, or lowering supply cost.",
      },
      {
        q: "How does this apply to an indie SaaS founder?",
        a: "Directly. If your monthly subscription is below the API, storage, or compute cost the median active user generates, you have a MoviePass on a smaller scale. The fix is the same: model the heavy user, set the price for them, then grow.",
      },
    ],
    tags: ["weak-offer", "unit-economics", "subscription", "supply-cost", "heavy-user"],
    sources: [
      { label: "Wikipedia – MoviePass", url: "https://en.wikipedia.org/wiki/MoviePass" },
    ],
    homepageUrl: "https://en.wikipedia.org/wiki/MoviePass",
    lastVerified: "2026-05-22",
  },

  {
    slug: "color-labs",
    displayName: "Color Labs",
    category: "Social mobile",
    yearsActive: "2010 to 2012",
    shutdownYear: 2012,
    shutdownReason: "Raised and spent on growth before the product had a single proven use case",
    fundingRaisedNote:
      "Reported to have raised roughly $41 million pre-launch from major venture firms.",
    peakValuationNote: "Reported at over $100 million before any consumer traction.",
    oneLine:
      "Color Labs raised $41 million before launch and shut down within eighteen months because no one could explain what the app was for.",
    tldr:
      "Color Labs raised a reported $41 million before launching a proximity-based photo-sharing app in 2011. The product had no clear use case in the user's daily life; reviewers and users alike could not articulate what it was for. The company shut down within roughly eighteen months. The lesson for indie founders: capital is the wrong tool for resolving an unanswered 'what is this for' question.",
    productSnapshot: {
      whatTheySold:
        "A free mobile app that automatically grouped photos from nearby users into shared streams based on physical proximity.",
      whoFor:
        "Originally pitched at any social photo sharer; the avatar was never narrowed beyond demographic.",
      pricingNote:
        "Free app, no monetisation in place at launch.",
    },
    timeline: [
      { period: "2010", event: "Founded with a high-profile founding team." },
      { period: "March 2011", event: "Raised roughly $41 million before launching the consumer product." },
      { period: "March 2011", event: "App launched to weak reviews; users could not articulate the use case." },
      { period: "Late 2011 to 2012", event: "Repeated pivots; eventually shut down and the team was acquired by Apple." },
    ],
    rootCauses: [
      "The product did not have a clear job-to-be-done from the user's perspective; the founders described what it did, not why anyone would use it.",
      "Capital was raised on team credibility before any user-side evidence of demand had been gathered.",
      "Pre-launch validation was skipped; the first usage data was post-launch usage data.",
      "The avatar (who would actually use this regularly) was never narrowed to a specific person with a specific recurring need.",
    ],
    unlockSaaSWouldHaveCaught: {
      diagnosis: "Weak Belief",
      diagnosticSignal:
        "The diagnostic would have failed the 'why this and why now' test. No specific user could be described who would open the app weekly; the offer page would have read as an explanation of the mechanism, not of the user's gain.",
      machineGap:
        "Machine Step 2 (Diagnose the Dream Customer) would have flagged the absence of a named avatar with a recurring need. Step 4 (Run the Pre-Sell) would have required at least one paying or signed-up user to validate the demand assumption before scaling.",
      counterfactual:
        "A small pre-launch cohort (a few hundred users in one city) used over four weeks would have surfaced the usage gap. The product could then have either narrowed to a specific behaviour or pivoted before the capital was committed to scaling a use case that did not exist.",
    },
    lessons: [
      "Capital cannot answer the question 'what is this for'. That question is answered by users, with the product, before the round.",
      "A high-profile founding team is a credibility multiplier, not a demand validator. The two are different problems.",
      "A demographic avatar (young, urban, social) is not an avatar. A behavioural avatar (this specific person doing this specific thing weekly) is.",
      "Pre-launch capital should be sized to the validation runway, not to the launch budget. Over-funding before validation removes the forcing function that produces a real product.",
      "Pivoting after launch is harder than narrowing before launch. The cost of the wrong launch lingers in press, reviews, and team morale.",
    ],
    whatToAvoid: [
      "Do not raise a large round on team credibility alone if you cannot describe one specific user behaviour the product will create.",
      "Do not launch into the press cycle if your own team cannot answer 'what is this for' in one sentence. The press will hand the question back to you on launch day.",
    ],
    faqs: [
      {
        q: "Why did Color Labs fail despite the $41 million raise?",
        a: "Because the product did not have a clear user job-to-be-done. The team could describe what the app did mechanically (proximity-based photo sharing) but could not describe why a specific user would open it weekly. Capital scaled the launch but did not create the demand.",
      },
      {
        q: "Was the team responsible or was it the product?",
        a: "The team had real credibility, which is why the round closed before launch. The product was the issue: no narrowed avatar, no validated behaviour, no pre-launch evidence of demand. The team's later acquisition by Apple suggests the talent was real; the company was not.",
      },
      {
        q: "What is the Unlock SaaS diagnosis for Color Labs?",
        a: "Weak Belief at the foundation. The page (and the product) gave the reader no reason to believe that they specifically would use this regularly. Without a named avatar and a felt-pain hook, no amount of capital converts a curious download into a daily habit.",
      },
      {
        q: "How does this apply to indie founders who are not raising venture capital?",
        a: "The same lesson scales down. An indie SaaS that ships before answering 'what is this for, for whom, used how often' is in the same position with smaller stakes. The fix is the same: narrow the avatar, validate the behaviour, then build.",
      },
    ],
    tags: ["weak-belief", "wrong-person", "social-mobile", "validation-skipped", "pre-launch-capital"],
    sources: [
      { label: "Wikipedia – Color Labs", url: "https://en.wikipedia.org/wiki/Color_Labs" },
    ],
    homepageUrl: "https://en.wikipedia.org/wiki/Color_Labs",
    lastVerified: "2026-05-22",
  },

  {
    slug: "webvan",
    displayName: "Webvan",
    category: "Grocery delivery",
    yearsActive: "1996 to 2001",
    shutdownYear: 2001,
    shutdownReason: "Scaled fixed-cost infrastructure ahead of demand validation",
    fundingRaisedNote:
      "Reported to have raised roughly $800 million across private and IPO rounds.",
    peakValuationNote: "Reached a public-market valuation reportedly above $7 billion shortly after IPO.",
    oneLine:
      "Webvan built warehouses for a hundred cities before customer behaviour validated the first one.",
    tldr:
      "Webvan raised and spent roughly $800 million between 1996 and 2001 building purpose-built grocery distribution warehouses across multiple US cities. It scaled the cost structure ahead of consumer adoption and could not unwind the fixed cost when demand failed to materialise on the assumed curve. The lesson for indie founders: scaling fixed cost ahead of validated demand is an irrecoverable bet, regardless of how compelling the future market looks.",
    productSnapshot: {
      whatTheySold:
        "An online grocery ordering and home-delivery service supported by company-built warehouses and a fleet of refrigerated delivery vans.",
      whoFor:
        "Suburban US consumers willing to order weekly groceries online for scheduled home delivery.",
      pricingNote:
        "Standard supermarket pricing with delivery sometimes free above a basket threshold; the cost of fulfilment exceeded the margin on most baskets.",
    },
    timeline: [
      { period: "1996", event: "Founded by Louis Borders." },
      { period: "1999", event: "IPO at a reported peak valuation above $7 billion." },
      { period: "1999 to 2000", event: "Aggressive expansion to additional metro areas with new purpose-built warehouses." },
      { period: "Late 2000", event: "Burn outpaced revenue; baskets per warehouse remained below break-even." },
      { period: "July 2001", event: "Filed for bankruptcy." },
    ],
    rootCauses: [
      "Capital expenditure on warehouses preceded validated weekly order density in each market.",
      "Average basket margin did not cover the labour and last-mile cost of refrigerated delivery; expansion compounded the deficit.",
      "Consumer behaviour change (weekly online groceries) was assumed at scale rather than measured in one market first.",
      "Public-market expectations forced expansion pace that the unit economics could not support.",
      "Exit ramp was infeasible: refrigerated warehouses and delivery fleets are difficult to repurpose if the assumption breaks.",
    ],
    unlockSaaSWouldHaveCaught: {
      diagnosis: "Weak Offer",
      diagnosticSignal:
        "The diagnostic would have asked the unit-margin question Webvan could not answer: 'does the average customer basket cover fulfilment cost in this specific market'. A negative answer at one warehouse should have halted expansion until the offer was reshaped.",
      machineGap:
        "Machine Step 3 (Build the Specific Offer) would have required positive unit margin in one market before scaling to the next. Step 7 (Compound) would have explicitly blocked compounding a negative unit margin.",
      counterfactual:
        "One profitable warehouse in one city, run for twelve months at positive unit margin, would have validated the model and earned the right to compound. The original strategy compressed validation and expansion into the same step.",
    },
    lessons: [
      "Fixed-cost infrastructure ahead of validated demand is an irrecoverable bet; the cost lingers when the demand fails to arrive on schedule.",
      "One profitable city or cohort earns the right to scale. Skipping that step replaces evidence with optimism.",
      "Public-market expectations and operational validation rarely align. A founder taking growth capital should map which one is the binding constraint.",
      "If the exit ramp from a strategic bet is infeasible (warehouses, fleets, multi-year leases), the bet must be staged into reversible steps until validation arrives.",
      "Categories that require behaviour change at population scale (weekly groceries online in 1999) need a different funding curve than categories that require product preference (one tool over another). The former is patient capital; the latter is venture capital.",
    ],
    whatToAvoid: [
      "Do not pre-commit fixed cost in multiple markets before a single market validates. The compounding is mathematical: each additional market multiplies the loss.",
      "Do not let public-market pressure substitute for unit validation. A roadshow narrative is not a unit-margin proof.",
    ],
    faqs: [
      {
        q: "Why is Webvan still cited two decades later?",
        a: "Because it is the canonical case study for scaling fixed cost ahead of demand validation. Every grocery delivery company built since (Instacart, AmazonFresh, Picnic) studied the failure mode and either avoided the fixed-warehouse exposure or staged it carefully across many years.",
      },
      {
        q: "Was the consumer behaviour wrong, or was the timing wrong?",
        a: "Both. The category eventually worked, but it took two decades and the rise of asset-light fulfilment models (third-party gig workers, store-based picking) to make the unit margin work. Webvan bet on the right category with the wrong cost structure at the wrong time.",
      },
      {
        q: "What is the Unlock SaaS diagnosis for Webvan?",
        a: "Weak Offer at the unit-margin level. Each delivery cost more than it earned, and the strategy compounded that loss across additional cities. No amount of brand, capital, or category timing recovers from a negative unit margin scaled in advance.",
      },
      {
        q: "How does this apply to indie SaaS founders today?",
        a: "Indie SaaS equivalents include pre-paying for inventory or licences in multiple regions, expensive multi-region infrastructure on Day 1, or hiring a sales team into multiple verticals before any vertical converts. The lesson scales: one validated unit earns the right to scale; everything else is optimism.",
      },
    ],
    tags: ["weak-offer", "unit-economics", "fixed-cost", "premature-scale", "category-timing"],
    sources: [
      { label: "Wikipedia – Webvan", url: "https://en.wikipedia.org/wiki/Webvan" },
    ],
    homepageUrl: "https://en.wikipedia.org/wiki/Webvan",
    lastVerified: "2026-05-22",
  },

  {
    slug: "beepi",
    displayName: "Beepi",
    category: "Marketplaces",
    yearsActive: "2013 to 2017",
    shutdownYear: 2017,
    shutdownReason: "Unit margin on each transaction never reached positive at the scale required",
    fundingRaisedNote:
      "Reported to have raised roughly $150 million across multiple rounds.",
    peakValuationNote: "Reported at several hundred million dollars at peak.",
    oneLine:
      "Beepi treated peer-to-peer used cars as a venture-scale category before the unit economics of inspecting and moving cars supported the price.",
    tldr:
      "Beepi was a peer-to-peer used-car marketplace that aimed to remove dealer mark-up from private vehicle sales. The company raised a reported $150 million and shut down in 2017 after unit-economics issues (inspection, transport, financing, returns) refused to converge at the scale required. The lesson for indie founders: marketplace fundamentals (take rate, fulfilment cost, return cost) are structural; if the math does not work at small scale, scale does not fix it.",
    productSnapshot: {
      whatTheySold:
        "A peer-to-peer used-car marketplace that handled inspection, photography, transport, and a returns guarantee between private sellers and buyers.",
      whoFor:
        "US consumers selling or buying used cars who wanted to avoid dealer mark-ups but did not want to handle inspection or logistics themselves.",
      pricingNote:
        "Take rate on each transaction, with the marketplace absorbing significant operational cost per transaction.",
    },
    timeline: [
      { period: "2013", event: "Founded with a peer-to-peer used-car thesis." },
      { period: "2014 to 2015", event: "Multiple funding rounds totalling roughly $150 million." },
      { period: "2016", event: "Operations expanded across additional US states; unit margin remained negative." },
      { period: "Early 2017", event: "A planned acquisition collapsed and the company wound down." },
    ],
    rootCauses: [
      "The take rate the marketplace could charge did not cover the operational cost of inspection, transport, and the returns guarantee per transaction.",
      "Each additional market replicated the same negative unit margin; growth compounded losses rather than averaged them down.",
      "Customer acquisition cost was elevated by competition with both dealers and incumbent marketplaces (Craigslist, AutoTrader).",
      "The returns guarantee was a strong trust signal that the unit margin could not sustain at scale.",
      "Capital raised on the category vision financed growth past the validation point at which the unit-economics gap should have triggered a redesign.",
    ],
    unlockSaaSWouldHaveCaught: {
      diagnosis: "Weak Offer",
      diagnosticSignal:
        "The diagnostic would have failed the unit-margin sanity check: 'on the average transaction, after all fulfilment costs, do you make money'. A negative answer at any market makes scaling additional markets a structural amplification of the loss.",
      machineGap:
        "Machine Step 3 (Build the Specific Offer) would have flagged that the marketplace absorbed costs (inspection, transport, returns) the take rate did not support. Step 7 (Compound) would have blocked geographic expansion until one market converged.",
      counterfactual:
        "One metro area run at positive unit margin (potentially by adjusting take rate, narrowing the returns guarantee, or shifting cost to the seller) would have earned the right to expand. The strategy that committed to multi-market growth before unit convergence ruled this fix out.",
    },
    lessons: [
      "Marketplace economics are structural. The take rate, the fulfilment cost, and the trust-signal cost (guarantees, refunds) must all fit inside the price the customer will accept.",
      "Trust signals (returns, guarantees, insurance) are real costs. They cannot be added as 'marketing' without being modelled in the unit margin.",
      "Geographic expansion does not improve a negative unit margin; it multiplies it. The right order is unit convergence first, then geography.",
      "Adjacent incumbents (Craigslist, AutoTrader, dealers) are not the same as direct competitors but they set the buyer's price expectation. The marketplace's take rate is bounded above by the next-best alternative the buyer perceives.",
      "Capital raised on category vision creates the temptation to skip unit validation. The valuation often demands growth before the math is ready for it.",
    ],
    whatToAvoid: [
      "Do not scale into additional cities or verticals while unit margin in the seed market is still negative. Each additional unit subtracts, not adds.",
      "Do not promise trust guarantees the unit margin cannot fund. The guarantee earns the conversion; the cost destroys the company.",
    ],
    faqs: [
      {
        q: "Why did Beepi fail despite the $150 million raised?",
        a: "Because the unit economics of inspecting, transporting, and guaranteeing each peer-to-peer used-car transaction never reached positive at the take rate the marketplace could charge. Capital financed growth past the validation point; growth made the problem mathematically worse.",
      },
      {
        q: "Was the category wrong, or the execution?",
        a: "The category eventually proved viable for adjacent operators (Carvana, Vroom) with different cost structures (direct sourcing, dedicated logistics, inventory ownership). Beepi's peer-to-peer model carried a returns and inspection cost the take rate could not support. The execution failed the structural test the category required.",
      },
      {
        q: "What is the Unlock SaaS diagnosis for Beepi?",
        a: "Weak Offer. The offer to the seller and the buyer was attractive, but the marketplace could not deliver it at a positive unit margin. The Brunson lens treats this as offer structure, not marketing: the price-cost relationship is the offer, and the offer was losing money.",
      },
      {
        q: "How does this apply to indie SaaS marketplace founders?",
        a: "Directly. If your marketplace absorbs significant per-transaction cost (verification, payouts, refunds, KYC) and your take rate does not cover that cost, you have a Beepi in miniature. The fix is the same: raise take rate, lower per-transaction cost, or shift cost to the side of the market that can bear it.",
      },
    ],
    tags: ["weak-offer", "marketplace", "unit-economics", "fulfilment-cost", "geographic-expansion"],
    sources: [
      { label: "Wikipedia – Beepi", url: "https://en.wikipedia.org/wiki/Beepi" },
    ],
    homepageUrl: "https://en.wikipedia.org/wiki/Beepi",
    lastVerified: "2026-05-22",
  },

  {
    slug: "anki",
    displayName: "Anki",
    category: "Consumer robotics",
    yearsActive: "2010 to 2019",
    shutdownYear: 2019,
    shutdownReason: "Hardware margin and second-product reliance left no runway when sales softened",
    fundingRaisedNote:
      "Reported to have raised roughly $200 million across multiple rounds.",
    peakValuationNote: "Reported in the high hundreds of millions to over a billion dollars at peak.",
    oneLine:
      "Anki built genuinely impressive consumer robots and ran out of cash because the second-product attach rate did not arrive.",
    tldr:
      "Anki built and sold a series of consumer robotics products (Anki Drive, Cozmo, Vector) and shut down in April 2019 after a planned funding round collapsed. Hardware unit margin was thin, and the company depended on a second-product attach rate that did not materialise at the scale the cost base required. The lesson for indie founders: thin-margin hardware businesses need either a recurring revenue layer or an attach rate that lifts the lifetime value above the cost-to-serve.",
    productSnapshot: {
      whatTheySold:
        "Consumer robotics products including Anki Drive (smart toy car racing), Cozmo (small expressive robot), and Vector (always-on home robot).",
      whoFor:
        "Tech-leaning consumers and gift-buyers interested in approachable consumer robotics; later iterations targeted broader households.",
      pricingNote:
        "Anki Drive launched in the high-two-figures; Cozmo and Vector launched in the high-two- to mid-three-figure range.",
    },
    timeline: [
      { period: "2010", event: "Founded by Boris Sofman, Mark Palatucci, and Hanns Tappeiner." },
      { period: "2013", event: "Anki Drive launched at Apple's keynote." },
      { period: "2016", event: "Cozmo launched to strong initial sales and positive reception." },
      { period: "2018", event: "Vector launched as an always-on home robot." },
      { period: "April 2019", event: "Company shut down after a planned funding round did not close." },
    ],
    rootCauses: [
      "Hardware margin was structurally thin, and the lifetime value of each unit depended on a software or accessory attach rate that did not arrive at the assumed scale.",
      "The second-product (Vector) launched into a more crowded consumer-robotics segment than the first; the marketing reach did not double the unit base.",
      "Working-capital exposure to component costs and inventory left the company sensitive to any sales softness.",
      "The recurring revenue layer (subscriptions, content packs, premium features) was a future plan rather than a present cash flow.",
      "The planned funding round was the binding constraint; when it slipped, there was no runway buffer.",
    ],
    unlockSaaSWouldHaveCaught: {
      diagnosis: "Weak Offer",
      diagnosticSignal:
        "The diagnostic would have asked whether the lifetime value per customer covered acquisition cost plus cost-to-serve at the current attach rate. The honest answer was: only if the attach rate doubled, which is a forecast rather than a fact.",
      machineGap:
        "Machine Step 3 (Build the Specific Offer) would have flagged the offer's dependence on a future attach-rate assumption. Step 5 (Verified Belief through real customers) would have required attach-rate proof from existing customers before assuming it for new ones.",
      counterfactual:
        "Building the recurring revenue layer (a subscription tied to the robot's ongoing utility) earlier in the lifecycle would have shifted the offer from a one-shot hardware sale into a continuing relationship. The unit margin would still be thin, but the lifetime value would have been a measured number rather than a forecast.",
    },
    lessons: [
      "Thin-margin hardware requires a recurring layer (subscriptions, content, accessories) measured in the present, not forecast for the future.",
      "Sequel products rarely double the unit base. They extend the existing audience, sometimes by 20 to 40 percent, not by 100.",
      "Funding rounds that are the only path to surviving the next quarter are a structural risk, not just a timing risk. Buffer matters.",
      "Lifetime value depends on attach rate. If the attach rate is a forecast, the lifetime value is a forecast. The business should be priced for the present attach rate.",
      "Engineering excellence does not retire commercial risk. Beautiful robots are not the same as a commercially repeatable business.",
    ],
    whatToAvoid: [
      "Do not let the planned funding round be the only buffer between operations and shutdown. The round is a variable; runway is a constant.",
      "Do not assume the second product reuses the first product's audience at the same conversion rate. The second product has its own conversion problem.",
    ],
    faqs: [
      {
        q: "Why did Anki shut down so suddenly?",
        a: "Because a planned funding round did not close and the company had limited runway buffer. The underlying issue was that the hardware unit margin and attach rate did not generate enough cash to sustain operations independent of the next round.",
      },
      {
        q: "Was Vector a failed product?",
        a: "Not exactly. Vector was a strong technical achievement and earned a loyal owner base. The commercial issue was that the addressable market for always-on home robots at that price point was smaller than the cost base required.",
      },
      {
        q: "What is the Unlock SaaS diagnosis for Anki?",
        a: "Weak Offer in the lifetime-value sense. The offer (a robot you buy once) depended on a future attach rate of accessories or subscriptions that was not measured in the present. The fix would have been a recurring layer earlier in the lifecycle.",
      },
      {
        q: "How does this apply to indie SaaS founders?",
        a: "Indie SaaS analogues include one-time-purchase software, lifetime-deal heavy revenue mixes, or thin-margin per-transaction businesses. The same logic applies: if your lifetime value depends on a future attach rate or upsell, model it as a forecast, not as a current cash flow.",
      },
    ],
    tags: ["weak-offer", "hardware", "lifetime-value", "attach-rate", "funding-runway"],
    sources: [
      { label: "Wikipedia – Anki", url: "https://en.wikipedia.org/wiki/Anki_(company)" },
    ],
    homepageUrl: "https://en.wikipedia.org/wiki/Anki_(company)",
    lastVerified: "2026-05-22",
  },

  {
    slug: "powa-technologies",
    displayName: "Powa Technologies",
    category: "Fintech and mobile commerce",
    yearsActive: "2007 to 2016",
    shutdownYear: 2016,
    shutdownReason: "Reported customer pipeline did not convert into recurring revenue at the scale the cost base required",
    fundingRaisedNote:
      "Reported to have raised roughly $200 million from investors including Wellington Management.",
    peakValuationNote: "Reported by the company at over $2.7 billion; widely contested at the time of collapse.",
    oneLine:
      "Powa raised against a pipeline of letters of intent that never converted into the recurring revenue the headcount required.",
    tldr:
      "Powa Technologies was a UK mobile-commerce company that raised a reported $200 million from major institutional investors before entering administration in early 2016. Public reporting after the collapse showed that the company's claimed customer pipeline consisted largely of non-binding letters of intent rather than signed contracts. The lesson for indie founders: pipeline and revenue are different categories, and any business plan that treats them as interchangeable will eventually fail an audit.",
    productSnapshot: {
      whatTheySold:
        "A suite of mobile-commerce products, most prominently PowaTag, a scan-to-buy mobile payment and ordering system for retailers.",
      whoFor:
        "Retail brands and merchants looking to enable mobile-first purchase and ordering experiences inside their existing customer base.",
      pricingNote:
        "Sold via direct enterprise sales motion; pricing structure was deal-specific and not publicly itemised.",
    },
    timeline: [
      { period: "2007", event: "Founded by Dan Wagner." },
      { period: "2013 to 2015", event: "Multiple funding rounds totalling a reported $200 million, with the company publicly claiming a multi-billion-dollar valuation." },
      { period: "2015", event: "Public announcements highlighted letters of intent with hundreds of large retailers." },
      { period: "Early 2016", event: "Entered administration after running out of cash; subsequent reporting clarified that very few of the announced retailer relationships were signed revenue-generating contracts." },
    ],
    rootCauses: [
      "Reported pipeline metrics conflated non-binding letters of intent with signed, revenue-generating contracts.",
      "Headcount and operational scale were sized to the reported pipeline rather than to the realised revenue, leaving no buffer when conversion did not arrive.",
      "Communications externally and (per later reporting) internally treated future possibility as present asset, eroding the corrective feedback loop a founder needs to redirect a struggling company.",
      "Late-stage capital raised on the pipeline narrative made the founder's incentive to renegotiate the narrative weaker, not stronger.",
      "By the time the gap between claim and reality was visible from outside, the runway to course-correct had already been consumed.",
    ],
    unlockSaaSWouldHaveCaught: {
      diagnosis: "Weak Belief",
      diagnosticSignal:
        "The diagnostic would have asked the question every Brunson-aligned audit asks first: 'where is the evidence the customer has actually paid you'. Letters of intent are evidence of interest, not of payment. The Unlock SaaS belief stack treats paid customers as the only first-class belief signal.",
      machineGap:
        "Machine Step 5 (Verified Belief) requires named, paying customers before the marketing narrative treats demand as established. Step 6 (Compound) does not permit compounding a pipeline that has not converted into revenue.",
      counterfactual:
        "Reporting paid customer count separately from letters of intent at every funding stage would have either forced the conversion work earlier or compressed the company to a sustainable size. Either outcome would have been preferable to the collapse.",
    },
    lessons: [
      "Pipeline and revenue are different categories. A business plan that treats them as interchangeable is one audit away from collapse.",
      "Letters of intent are evidence of interest, not of demand. Treat them as a leading indicator, never as a closed sale.",
      "Headcount sized to a forecast (rather than to the realised revenue) consumes runway faster than any other line item.",
      "Founder communications that conflate possibility with present fact erode the internal feedback loop the company needs to course-correct in time.",
      "Verified belief is paid customers, not press coverage and not announced partnerships. The Brunson framework draws this line specifically because the line is repeatedly crossed.",
    ],
    whatToAvoid: [
      "Do not headline non-binding letters of intent as if they were signed revenue. The press release sets the expectation; the next quarter has to clear it.",
      "Do not size headcount to a future pipeline. Size headcount to revenue you have already booked, then grow into the next stage as bookings arrive.",
    ],
    faqs: [
      {
        q: "What actually happened with Powa Technologies?",
        a: "Powa raised a reported $200 million on the strength of a publicly announced pipeline of retailer letters of intent. When the company ran out of cash in early 2016, subsequent reporting clarified that very few of those LOIs had converted into signed, paying contracts. The gap between announced pipeline and realised revenue was the proximate cause of collapse.",
      },
      {
        q: "How is this different from a normal startup failure?",
        a: "The pattern is older than startups: a company that reports possibility as fact eventually fails an audit. The structural lesson is that the audit happens whether or not the company invites it. Letters of intent do not become contracts on their own.",
      },
      {
        q: "What is the Unlock SaaS diagnosis for Powa?",
        a: "Weak Belief at the foundation. The belief surface was built on announcements and partnerships rather than on paying customers. The Brunson framework's Verified Builder concept (the customer who paid and stayed) is the antidote: paid customer count is a real number, partnership announcements are a marketing signal.",
      },
      {
        q: "Does this apply to small indie SaaS founders?",
        a: "Yes, in miniature. Indie founders sometimes describe their pipeline (interested users, signups, demo requests) as if it were customer count. The fix is the same: report paid customer count separately and resist the temptation to round up.",
      },
    ],
    tags: ["weak-belief", "fintech", "pipeline-vs-revenue", "letters-of-intent", "verified-belief"],
    sources: [
      { label: "Wikipedia – Powa Technologies", url: "https://en.wikipedia.org/wiki/Powa_Technologies" },
    ],
    homepageUrl: "https://en.wikipedia.org/wiki/Powa_Technologies",
    lastVerified: "2026-05-22",
  },

  {
    slug: "rdio",
    displayName: "Rdio",
    category: "Consumer streaming",
    yearsActive: "2010 to 2015",
    shutdownYear: 2015,
    shutdownReason: "Out-marketed by a better-funded rival in a category where catalogue parity matters more than craft",
    fundingRaisedNote:
      "Reported to have raised roughly $125 million across multiple rounds.",
    peakValuationNote: "Peak valuation was not publicly disclosed; sold for a reported $75 million in late 2015.",
    oneLine:
      "Rdio shipped the best-designed music app in the category and lost because catalogue, distribution, and brand mattered more than craft.",
    tldr:
      "Rdio launched in 2010 with a music streaming app widely considered the best-designed in the category. It shut down in 2015 after running out of cash, with key assets sold to Pandora. Spotify's larger raise, faster distribution, and aggressive partnership strategy made design parity insufficient. The lesson for indie founders: in markets where catalogue, network effects, or distribution are the binding constraint, craft alone does not convert.",
    productSnapshot: {
      whatTheySold:
        "A subscription music-streaming service across web, desktop, and mobile, distinguished by interface design and social discovery features.",
      whoFor:
        "Music-leaning consumers who valued interface quality and social discovery; later expansion targeted broader subscription audiences.",
      pricingNote:
        "Standard monthly subscription pricing in the high-single-digit range, with a free ad-supported tier introduced later.",
    },
    timeline: [
      { period: "2010", event: "Founded by Janus Friis and Niklas Zennstrom (also founders of Skype)." },
      { period: "2010 to 2014", event: "Raised roughly $125 million across multiple rounds." },
      { period: "2012 to 2014", event: "Spotify's faster growth and partnership strategy outpaced Rdio in the US and major European markets." },
      { period: "Late 2015", event: "Filed for bankruptcy; selected assets sold to Pandora for a reported $75 million." },
    ],
    rootCauses: [
      "Catalogue and licensing economics required parity with competitors; design quality did not offset the recurring licensing cost.",
      "Spotify raised more capital, distributed faster, and signed partnership deals (Facebook integration, telco bundles) that Rdio did not match.",
      "Social and discovery features were a differentiator only for a niche of music-leaning users; the broader market valued catalogue completeness and friction-free playback.",
      "Marketing budget was structurally smaller than the leading rival, limiting reach in the categories where streaming subscriptions were won.",
      "The category economics rewarded subscriber scale over per-user margin; the founder strategy did not match the binding constraint.",
    ],
    unlockSaaSWouldHaveCaught: {
      diagnosis: "Wrong Person",
      diagnosticSignal:
        "The diagnostic would have flagged that the page's strongest signals (design, social, discovery) addressed a music-leaning niche, while the market's binding constraint was casual-listener catalogue access. The avatar described on the page was narrower than the market the offer had to win.",
      machineGap:
        "Machine Step 2 (Diagnose the Dream Customer) would have surfaced the gap between the design-loving avatar described in the brand and the catalogue-hungry casual listener the category was actually selling to. Step 4 (Run the Pre-Sell) would have tested whether the avatar bought on design or on catalogue.",
      counterfactual:
        "Narrowing to the design-leaning music-discovery niche explicitly (and pricing for that niche, with deeper social and discovery features) might have built a defensible smaller business. The strategy of competing for the mass market on craft alone was the structural error.",
    },
    lessons: [
      "In categories where catalogue, network effects, or distribution are the binding constraint, design quality is a multiplier, not a substitute.",
      "If your differentiator (craft, design, taste) addresses a narrow audience and the market is wide, you must either narrow to your audience or build the broader differentiator the market actually buys on.",
      "Capital raised matters when the category economics are licensing-heavy or distribution-led. The smaller-capitalised competitor in a network-effects market is usually structurally behind.",
      "A loved product is not the same as a winning product. Customer love does not always convert into market share when the binding constraint is something else.",
      "Pick the market you can win, not the market you wish you could win. Niches with defensible economics beat mass markets with structural disadvantage.",
    ],
    whatToAvoid: [
      "Do not assume craft will overcome a distribution or catalogue gap. The buyer's switching cost is real and the loved feature must outweigh the gap.",
      "Do not chase a mass-market position when your strongest signals are read by a niche. The mass market reads niche signals as irrelevant, not as superior.",
    ],
    faqs: [
      {
        q: "Why did Rdio lose to Spotify despite a better-designed product?",
        a: "Because the category's binding constraint was catalogue, distribution, and subscriber scale, not design. Spotify raised more capital, distributed faster (Facebook integration, telco partnerships), and outspent Rdio on the surfaces that mattered to the broader market. Design parity did not offset the gap.",
      },
      {
        q: "Was Rdio's strategy wrong from the start?",
        a: "Not necessarily. A narrower strategy (design-leaning music-discovery niche) might have built a smaller defensible business. The error was competing for the mass market on design when the mass market was bought on catalogue and distribution.",
      },
      {
        q: "What is the Unlock SaaS diagnosis for Rdio?",
        a: "Wrong Person. The page described an avatar (the design-leaning, discovery-loving listener) that was narrower than the market the offer had to win to sustain the cost base. The fix would have been to either narrow the business to that avatar or expand the strongest signals to address the broader avatar.",
      },
      {
        q: "How does this apply to indie SaaS founders?",
        a: "Indie SaaS often face the same trade-off: build for a narrow niche you love or compete for the mass market a category leader already owns. Rdio's lesson is to be explicit about which one you are doing and to size the strategy to the binding constraint of the market you have chosen.",
      },
    ],
    tags: ["wrong-person", "consumer-streaming", "design-vs-distribution", "binding-constraint", "category-leader"],
    sources: [
      { label: "Wikipedia – Rdio", url: "https://en.wikipedia.org/wiki/Rdio" },
    ],
    homepageUrl: "https://en.wikipedia.org/wiki/Rdio",
    lastVerified: "2026-05-22",
  },
];

// -- Indexed lookups ---------------------------------------------------------

const POST_MORTEMS_BY_SLUG: Map<string, PostMortem> = new Map(
  POST_MORTEMS_LIST.map((p) => [p.slug, p]),
);

/** Read-only catalog. Iteration order is canonical (newest-failure first by edit order). */
export const POST_MORTEMS: ReadonlyArray<PostMortem> = POST_MORTEMS_LIST;

/** Slug list for generateStaticParams and sitemap.ts. */
export const POST_MORTEM_SLUGS: ReadonlyArray<string> = POST_MORTEMS_LIST.map(
  (p) => p.slug,
);

export function getPostMortemBySlug(slug: string): PostMortem | undefined {
  return POST_MORTEMS_BY_SLUG.get(slug);
}

/**
 * Return up to `limit` post-mortems that share at least one tag with the
 * given slug, excluding the slug itself. Powers the "Related post-mortems"
 * footer block on each detail page.
 */
export function getRelatedPostMortems(
  slug: string,
  limit: number = 4,
): ReadonlyArray<PostMortem> {
  const seed = POST_MORTEMS_BY_SLUG.get(slug);
  if (!seed) return [];
  const seedTags = new Set(seed.tags);

  const scored = POST_MORTEMS_LIST.filter((p) => p.slug !== slug)
    .map((p) => {
      const overlap = p.tags.filter((tag) => seedTags.has(tag)).length;
      return { postMortem: p, overlap };
    })
    .filter((x) => x.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap);

  return scored.slice(0, limit).map((x) => x.postMortem);
}

/**
 * Group post-mortems by Brunson diagnosis. Lets the hub teach the framework
 * directly: readers can browse all "Weak Offer" failures in one place, which
 * is how the category-of-failure pattern becomes a teaching system rather
 * than a clip show.
 */
export function groupPostMortemsByDiagnosis(): ReadonlyArray<{
  diagnosis: BrunsonDiagnosis;
  postMortems: ReadonlyArray<PostMortem>;
}> {
  const order: BrunsonDiagnosis[] = [];
  const buckets: Map<BrunsonDiagnosis, PostMortem[]> = new Map();
  for (const p of POST_MORTEMS_LIST) {
    const d = p.unlockSaaSWouldHaveCaught.diagnosis;
    if (!buckets.has(d)) {
      buckets.set(d, []);
      order.push(d);
    }
    buckets.get(d)!.push(p);
  }
  return order.map((diagnosis) => ({
    diagnosis,
    postMortems: buckets.get(diagnosis)!,
  }));
}

/**
 * Group post-mortems by category for an alternate hub-listing layout. Same
 * shape as groupTeardownsByCategory in funnel-teardowns.ts so the hub page
 * can choose either grouping without restructuring data.
 */
export function groupPostMortemsByCategory(): ReadonlyArray<{
  category: string;
  postMortems: ReadonlyArray<PostMortem>;
}> {
  const order: string[] = [];
  const buckets: Map<string, PostMortem[]> = new Map();
  for (const p of POST_MORTEMS_LIST) {
    if (!buckets.has(p.category)) {
      buckets.set(p.category, []);
      order.push(p.category);
    }
    buckets.get(p.category)!.push(p);
  }
  return order.map((category) => ({
    category,
    postMortems: buckets.get(category)!,
  }));
}

/** Existence check used by cross-cluster callouts on other surfaces. */
export function hasPostMortem(slug: string): boolean {
  return POST_MORTEMS_BY_SLUG.has(slug);
}
