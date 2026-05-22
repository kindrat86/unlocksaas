/**
 * /get-[outcome] pSEO catalog – Brunson "specific result" outcome landers.
 *
 * Founders type the outcome they want into Google before they type the
 * product that would deliver it: "get first paying customer", "get to 1k
 * mrr", "get 30 warm leads from cold outreach". This catalog mirrors each
 * canonical outcome the post-launch pre-revenue ICP asks for, on its own
 * indexable URL.
 *
 * Each entry is a Brunson Hook / Story / Offer frame whose Hook is the
 * exact outcome phrasing the founder is searching for. The Offer always
 * routes to the same product (free Launch Diagnostic + $49 Playbook +
 * $1 Starter); the Hook and Story are what change per outcome.
 *
 * Brunson Hard-Rule reconciliation:
 *   - No invented timeframes ("get to $10k MRR in 30 days") unless we
 *     can name the mechanism that does it.
 *   - No invented testimonials per outcome.
 *   - Each outcome page describes the same product, in the language of
 *     the result the reader actually came for. Same Stack, same
 *     guarantee, same Playbook.
 *   - Outcome phrasings match the searches founders make, not the
 *     vocabulary the product wishes they used.
 */

export interface OutcomeStep {
  /** Short imperative step heading (becomes <h3>). */
  heading: string;
  /** 1-3 sentence description of what the step is and why it matters. */
  body: string;
}

export interface OutcomeEntry {
  /**
   * URL slug, kebab-case. The full path is `/get-${slug}`.
   * Example: slug "first-paying-customer" → /get-first-paying-customer.
   */
  slug: string;
  /** Display name of the outcome ("First Paying Customer"). */
  displayName: string;
  /** Hook-shaped headline used as H1. */
  hookHeadline: string;
  /** SEO meta title, under 60 chars. */
  metaTitle: string;
  /** SEO meta description, under 160 chars. */
  metaDescription: string;
  /** Hero subhead, ~30 words. The one-line frame for this outcome. */
  heroSubhead: string;
  /** What the flat-state looks like before this outcome lands. */
  painSnapshot: string;
  /** Why this outcome is hard for most founders to reach. */
  whyHardForMost: string;
  /** The single Brunson move that unlocks this outcome. */
  theMove: string;
  /** 3-5 concrete steps (HowTo schema items). */
  steps: ReadonlyArray<OutcomeStep>;
  /** Most-common mistake founders make chasing this outcome. */
  commonMistake: string;
  /** Lagging-vs-leading metric to watch. */
  whatToTrack: string;
  /** Three outcome-tuned FAQs. */
  faqs: ReadonlyArray<{ q: string; a: string }>;
  /** Related glossary term slugs. */
  relatedGlossary: ReadonlyArray<string>;
  /** Related outcome slugs to cross-link. */
  relatedOutcomes: ReadonlyArray<string>;
  /** ISO date last verified. */
  lastVerified: string;
}

const VERIFIED = "2026-05-22";

export const OUTCOME_ENTRIES: ReadonlyArray<OutcomeEntry> = [
  {
    slug: "first-paying-customer",
    displayName: "First Paying Customer",
    hookHeadline: "Get your first paying customer.",
    metaTitle: "Get Your First Paying Customer – Unlock SaaS",
    metaDescription:
      "Post-launch and the Stripe line is flat? The 90-second Hook / Story / Offer triage finds which of three breaks is between you and the first sale.",
    heroSubhead:
      "Built for the post-launch pre-revenue founder staring at a flat Stripe line. The diagnostic labels which of Wrong Person, Weak Offer, or Weak Belief is the actual block, and the Playbook walks you from that label to one paying customer.",
    painSnapshot:
      "The product is built. The landing page is live. The launch tweet went out and got a handful of likes. Three people signed up for the trial. Zero converted. Six weeks in, the Stripe dashboard reads $0.00 and the doubt loop has started: is it the page, the audience, the price, the product, or all four.",
    whyHardForMost:
      "Most founders treat 'no customers' as one problem to fix. It is three different problems wearing the same mask. Wrong Person looks identical to Weak Offer from the dashboard. The triage exists because guessing which one it is costs months; naming it costs 90 seconds.",
    theMove:
      "Run the Hook / Story / Offer diagnostic on your live page before you change anything. Then make the one fix the diagnosis points at. One paying customer is not a marketing problem. It is a diagnosis problem.",
    steps: [
      {
        heading: "Run the diagnostic on your live URL",
        body: "Paste your current landing page into the 90-second triage. The output labels Wrong Person, Weak Offer, or Weak Belief and tells you which sentence on the page is doing the damage.",
      },
      {
        heading: "Make the one fix the diagnosis points at",
        body: "Do not rewrite the whole page. The diagnosis returns one specific block to change – the headline, the offer construction, or the proof element. Change only that.",
      },
      {
        heading: "Send 20 cold messages, not 200",
        body: "With the fix in place, the question becomes whether the right human is seeing it. Twenty hand-written outreach messages to the exact ICP outperforms a thousand impressions of cold traffic.",
      },
      {
        heading: "Track one number, not five",
        body: "From outreach to signup to paid, the funnel is three steps. Watch signup-to-paid conversion. If twenty signups produce zero paid, the diagnosis was incomplete – run it again on the new state.",
      },
    ],
    commonMistake:
      "Rewriting the whole landing page from scratch on a Saturday. The Wrong Person, Weak Offer, and Weak Belief diagnoses each demand different fixes. A full rewrite changes all three simultaneously, so when conversion finally moves you have no idea which change caused it. Now you cannot repeat the win.",
    whatToTrack:
      "Signup-to-paid conversion on the next 20 signups. If that ratio is above 1 in 10, the diagnosis is working. If it is still zero, the offer construction is the next layer to triage.",
    faqs: [
      {
        q: "I have zero traffic. Does the diagnostic still apply?",
        a: "Yes, but in a different order. If you have no traffic at all, the diagnosis runs on the offer construction itself before it can run on the page. The Playbook covers the pre-traffic version of the triage – it is the same diagnosis on a smaller surface.",
      },
      {
        q: "How long should it take to get the first paying customer once I run the diagnostic?",
        a: "Honest answer: weeks, not days. The diagnostic names the block in 90 seconds. Removing the block takes a working session. Getting it in front of the right human takes outreach work that has its own cadence. The total ranges from one week to one quarter depending on how cold the audience is.",
      },
      {
        q: "I have signups but no upgrades. Same diagnostic?",
        a: "Same triage, different block. Signups without upgrades is the canonical signature of a Weak Offer at the upgrade step – the page that asks for money. The diagnostic on that page finds the leak in 90 seconds.",
      },
    ],
    relatedGlossary: ["hook", "value-ladder", "soap-opera-sequence"],
    relatedOutcomes: [
      "clarity-on-your-offer",
      "to-1k-mrr",
      "out-of-the-prelaunch-trap",
    ],
    lastVerified: VERIFIED,
  },
  {
    slug: "to-1k-mrr",
    displayName: "$1k MRR",
    hookHeadline: "Get to $1k MRR.",
    metaTitle: "Get to $1k MRR – Unlock SaaS",
    metaDescription:
      "Three to twenty paying customers, not a marketing campaign. The Brunson diagnostic labels what is between you and the first thousand in recurring revenue.",
    heroSubhead:
      "Three to twenty paying customers is not a marketing problem. It is a diagnosis-and-repetition problem. The Playbook walks you from one paying customer to the repeatable mechanism that produces the next twenty without your hands on each one.",
    painSnapshot:
      "The first paying customer landed, often by accident. A friend signed up. A reply to a tweet converted. Then nothing. The Stripe dashboard wobbles between $0 and $97 every few weeks. The pattern that produced the first customer never repeats because you never named it.",
    whyHardForMost:
      "Founders confuse the first-customer outcome with the first-thousand-MRR outcome. They look the same on Stripe, but the work is different. First customer is a diagnosis problem; first $1k MRR is a repetition problem. Founders skip the repetition step because nobody told them it was a separate step.",
    theMove:
      "Find the channel that produced the first customer, and run the same outreach motion ten more times. Repetition before optimisation. The mechanism that worked once is the mechanism that scales to $1k MRR – not a new channel, not a new offer, the same one, repeated.",
    steps: [
      {
        heading: "Reverse-engineer the first customer",
        body: "Write down exactly how the first customer found you. The channel, the message, the offer they saw, and the price they paid. This is the seed of the repeatable motion.",
      },
      {
        heading: "Find ten more humans who match that profile",
        body: "Search the same channel for ten more humans who match the first customer's profile. Same role, same pain, same stage. Hand-write the same outreach message to each one.",
      },
      {
        heading: "Run the same outreach motion daily for two weeks",
        body: "Daily outreach to ten new humans for fourteen consecutive days. Two hundred messages. The point is not volume – it is to find out whether the first customer was a coincidence or a signal.",
      },
      {
        heading: "If the motion repeats, ladder the price",
        body: "Once the motion produces three more paying customers, raise the price by 30 percent on the next batch. Most founders are underpricing the offer that was already working.",
      },
    ],
    commonMistake:
      "Switching channels after the first customer. The founder lands one customer from a Reddit comment, then opens TikTok the next week. The motion that worked once never gets repeated, so it never produces a second customer in the same shape. Two coincidences instead of one repeatable system.",
    whatToTrack:
      "Customer count, not revenue. $1k MRR at $49/mo is 20 paying customers. At $97 it is 10. Counting customers tells you whether the motion is producing humans; revenue tells you whether the price is right. Both matter, but customer count is the leading signal.",
    faqs: [
      {
        q: "Should I raise prices before or after $1k MRR?",
        a: "After. The first $1k MRR proves the offer converts at the current price. Raising before you have proof means you are debugging two variables at once. Reach $1k MRR, then ladder the price.",
      },
      {
        q: "What if my first customer was a friend?",
        a: "It still counts as data. A friend bought because the offer made sense to a specific human. The question is whether that same offer makes sense to a non-friend in the same role. The outreach motion answers that question without ambiguity.",
      },
      {
        q: "Is $1k MRR achievable in 30 days from zero?",
        a: "Sometimes, never reliably. From zero customers to $1k MRR in 30 days requires the diagnosis to land on the first attempt and the channel to convert on the first batch. Plan for 60 to 90 days; celebrate 30.",
      },
    ],
    relatedGlossary: ["dream-100", "value-ladder", "two-comma-club"],
    relatedOutcomes: [
      "first-paying-customer",
      "to-10k-mrr",
      "a-repeatable-sales-process",
    ],
    lastVerified: VERIFIED,
  },
  {
    slug: "to-10k-mrr",
    displayName: "$10k MRR",
    hookHeadline: "Get to $10k MRR.",
    metaTitle: "Get to $10k MRR – Unlock SaaS",
    metaDescription:
      "The 10x leap from $1k to $10k MRR is a channel problem, not an offer problem. The Playbook walks you from a repeatable motion to a scalable one.",
    heroSubhead:
      "The leap from $1k to $10k MRR is where founders confuse 'doing more' with 'doing it bigger'. The Playbook separates the repeatable motion from the scalable one and shows you which one of three Brunson funnels fits your money mechanics.",
    painSnapshot:
      "MRR sits between $1k and $2k for months. The outreach motion that produced the first 20 customers still works, but it depends on your hands every day. You hit the ceiling of personal capacity around $2k MRR and the channel is not paid; it is you, manually, every morning.",
    whyHardForMost:
      "$1k to $10k MRR is the first time a founder needs a real funnel, not an outreach motion. The handoff from manual to systematic is where most $1k MRR products plateau. They keep doing the thing that worked, until the founder runs out of mornings.",
    theMove:
      "Pick one of three Brunson funnels (Tripwire, Webinar, or VSL) and run it once cleanly before doing anything else. The funnel does what your mornings used to do. Manual outreach moves from primary channel to support channel.",
    steps: [
      {
        heading: "Diagnose which of the three funnels fits your money mechanics",
        body: "Subscription under $99/mo: Tripwire. Subscription $99 to $499/mo or one-time over $497: Webinar. High-ticket or sales-call dependent: VSL. The Playbook walks you through the diagnosis in one session.",
      },
      {
        heading: "Build the funnel once, end-to-end, before you optimise",
        body: "All three funnels have the same five blocks: traffic, opt-in, sale, OTO, follow-up. Build the cheapest version of each block first. The point is to run end-to-end before any one block gets polished.",
      },
      {
        heading: "Run paid traffic through the funnel for two weeks",
        body: "Paid traffic exposes every leak the manual outreach motion was hiding. The funnel either converts at the cost you projected or it does not, and either answer is more useful than another month of manual outreach.",
      },
      {
        heading: "Optimise the block the data names",
        body: "After two weeks of paid traffic, one block in the funnel is the bottleneck. Optimise only that block. The remaining four blocks are not your problem yet.",
      },
    ],
    commonMistake:
      "Building all three funnels at once because the founder cannot decide which one fits. Three half-built funnels produce zero conversions. One ugly fully-built funnel produces real data. The diagnosis-before-build step exists because the wrong funnel for your money mechanics will never pay back the build cost.",
    whatToTrack:
      "Cost per acquired customer (CAC) vs lifetime value (LTV). At $10k MRR a healthy SaaS runs LTV/CAC of 3 or higher. If paid traffic produces customers but the ratio is below 1.5, the funnel is converting but the offer is mispriced for paid acquisition.",
    faqs: [
      {
        q: "Can I get to $10k MRR without paid ads?",
        a: "Yes, slower. Organic-only $10k MRR is possible through Dream 100 outreach, content compounding, or partner channels. The trade-off is time – plan for 12 to 24 months instead of 3 to 6.",
      },
      {
        q: "My $1k MRR came from cold email. Should I scale that or switch to ads?",
        a: "Scale what already works before adding a second channel. Cold email to $5k MRR, then add a funnel for the second $5k. Two channels at once means you debug two leaks simultaneously.",
      },
      {
        q: "How long does a Tripwire funnel take to build?",
        a: "End-to-end ugly version: two weeks. End-to-end converting version: six to twelve weeks. Most founders try to skip the ugly version and end up shipping nothing for three months.",
      },
    ],
    relatedGlossary: ["tripwire", "perfect-webinar", "value-ladder"],
    relatedOutcomes: [
      "to-1k-mrr",
      "a-repeatable-sales-process",
      "customers-without-paid-ads",
    ],
    lastVerified: VERIFIED,
  },
  {
    slug: "30-warm-leads-from-cold-outreach",
    displayName: "30 Warm Leads From Cold Outreach",
    hookHeadline: "Get 30 warm leads from cold outreach.",
    metaTitle: "Get 30 Warm Leads From Cold Outreach – Unlock SaaS",
    metaDescription:
      "Brunson's Dream 100 outreach motion produces warm leads from cold lists when the message is calibrated to the Hook / Story / Offer of the recipient.",
    heroSubhead:
      "Cold outreach produces warm leads when the message names a specific pain the recipient already feels. The Playbook walks you from a generic cold-message template to the calibrated Dream 100 motion that converts 30 in 30 days.",
    painSnapshot:
      "You sent 200 cold messages last week. You got two replies. One was a no, one was a maybe. The list was right, the channel was right, the message was generic. Generic cold messages are indistinguishable from spam regardless of how good the product is.",
    whyHardForMost:
      "Founders write cold messages from their own framing ('here is what my product does'). Warm replies happen when the message is written from the recipient's framing ('here is the pain you are currently in'). The shift sounds small. It is the difference between 1 percent and 15 percent reply rates.",
    theMove:
      "Build a Dream 100 list, not a Dream 10,000 list. One hundred hand-picked humans who match the ICP exactly. Then send one hand-written message per person, calibrated to their visible pain. Volume is not the lever; calibration is.",
    steps: [
      {
        heading: "Define the Dream 100 by role + visible signal",
        body: "Not 'founders'. Specifically: 'founders of post-launch pre-revenue SaaS products who posted on Indie Hackers in the last 30 days about no signups'. Visible signal is the calibration layer – it tells you the pain is currently fresh.",
      },
      {
        heading: "Write the message in their words, not yours",
        body: "Open with the exact pain they expressed publicly. Quote their own phrasing if possible. Then offer the diagnostic, not the product. Diagnostic-first outreach reframes you as helper, not seller.",
      },
      {
        heading: "Send one per day, not one hundred at once",
        body: "Daily cadence over 100 days, not bulk on day 1. Each day you also process the previous day's replies. The motion compounds because replies inform the next day's calibration.",
      },
      {
        heading: "Track replies as a single conversion funnel",
        body: "Sent → opened → replied → diagnostic completed → discovery call. Treat this as the funnel. 30 warm leads is the 'diagnostic completed' column, not the 'sent' column.",
      },
    ],
    commonMistake:
      "Automating cold outreach before the manual motion produces a reply rate above 10 percent. Automation locks in whatever calibration the manual motion had. If the calibration was 1 percent reply, automation just sends 1,000 messages that get 10 replies, and the founder concludes 'cold outreach does not work' instead of 'my calibration was off'.",
    whatToTrack:
      "Reply rate, not send volume. Below 5 percent: the message is generic. 5-10 percent: the calibration is in the right zip code but the offer is still off. Above 10 percent: the motion is calibrated; scale the list, not the message.",
    faqs: [
      {
        q: "Is cold email better than cold DM?",
        a: "Channel does not matter; calibration does. Whichever channel the Dream 100 actively uses is the channel that works. SaaS founders cluster on X and Indie Hackers; B2B operators cluster on LinkedIn. Match the channel to where the human already reads.",
      },
      {
        q: "Will the recipient see through a 'Dream 100' message?",
        a: "Yes – and that is the point. The message is meant to read as one human writing to another. The 'calibrated' version is honest specific outreach; the version that reads as a template is the spam version. The Dream 100 motion is the opposite of spam.",
      },
      {
        q: "How long is the message?",
        a: "Three sentences. Sentence one: the pain you noticed in their public post. Sentence two: the diagnostic in one line. Sentence three: a single specific question. Longer messages get worse reply rates regardless of how good the product is.",
      },
    ],
    relatedGlossary: ["dream-100", "hook", "soap-opera-sequence"],
    relatedOutcomes: [
      "first-paying-customer",
      "a-repeatable-sales-process",
      "customers-without-paid-ads",
    ],
    lastVerified: VERIFIED,
  },
  {
    slug: "out-of-the-prelaunch-trap",
    displayName: "Out of the Prelaunch Trap",
    hookHeadline: "Get out of the prelaunch trap.",
    metaTitle: "Get Out of the Prelaunch Trap – Unlock SaaS",
    metaDescription:
      "Eight months in, no launch date, the product is never quite ready. The diagnostic names which of three fears is keeping the launch button unpressed.",
    heroSubhead:
      "The prelaunch trap is not a product problem. It is a fear-of-flat-launch problem. The diagnostic labels which of three fears is keeping the launch button unpressed, and the Playbook walks you from labelled fear to dated launch.",
    painSnapshot:
      "You started building eight months ago. The product is 'almost ready'. The waitlist has 47 people. There is no launch date in any calendar. Every week one more feature gets added that pushes the launch out one more week. The trap is invisible because it disguises itself as progress.",
    whyHardForMost:
      "Founders read the prelaunch trap as a build problem ('the product needs more features'). It is a fear problem in three flavours: fear of being seen unfinished, fear of the launch being flat, fear of negative feedback. Each flavour has a different fix. Labelling the right one is the work.",
    theMove:
      "Pick a launch date 21 days out and work backwards. The constraint of the date does what eight months of feature-creep failed to do – it forces every decision into 'does this make the launch better, or just later'. Most prelaunch features are 'just later' dressed up as 'better'.",
    steps: [
      {
        heading: "Name the fear out loud",
        body: "Which of the three is yours: seen unfinished, flat launch, or negative feedback. Naming it removes 80 percent of the prelaunch trap by making the actual block visible.",
      },
      {
        heading: "Pick the launch date now, not 'soon'",
        body: "Calendar a public launch date 21 days out. Tell three humans. The social-contract layer is the only thing that overrides the fear loop.",
      },
      {
        heading: "Cut every feature that does not exist to launch",
        body: "Working backwards from the launch date, anything that is not in the critical path gets cut or shipped post-launch. The product on day 21 is the product. There is no 'launch v2' that ships before the public launch.",
      },
      {
        heading: "Run the launch as a Soap Opera sequence, not a single email",
        body: "Five-email Soap Opera over five days to the waitlist before the launch. The launch lands as the resolution of a story the reader has been following, not a cold offer.",
      },
    ],
    commonMistake:
      "Adding a feature in week three of the 21-day countdown because 'it will only take a day'. Every added feature pushes the launch by three days minimum, because feature work fans out. The countdown is sacred. Features added during the countdown are post-launch features.",
    whatToTrack:
      "Days to launch and feature-cut count. Healthy countdown: features cut > features added. Unhealthy: the opposite. The metric is leading, not lagging – if features are net-additive in week one, the launch is already slipping in week three.",
    faqs: [
      {
        q: "What if the launch lands flat?",
        a: "A flat launch is data, not failure. The diagnostic runs on the flat-launch state in 90 seconds and labels which of Wrong Person / Weak Offer / Weak Belief was the actual block. Without launching, you get zero data and stay in the trap forever.",
      },
      {
        q: "Is 21 days enough?",
        a: "Yes, because the constraint forces the right decisions. Founders who give themselves 90 days end up launching on day 360. Founders who give themselves 21 days end up launching on day 35 with a better product than they would have shipped on day 90.",
      },
      {
        q: "My product genuinely is not ready. Should I still launch?",
        a: "Yes, in a smaller shape. The MVP-of-the-MVP is rarely a product – it is a landing page with a Stripe button. Launch the offer. The product can finish under the launch banner.",
      },
    ],
    relatedGlossary: ["soap-opera-sequence", "seinfeld-sequence", "hook"],
    relatedOutcomes: [
      "first-paying-customer",
      "paid-before-you-build",
      "clarity-on-your-offer",
    ],
    lastVerified: VERIFIED,
  },
  {
    slug: "paid-before-you-build",
    displayName: "Paid Before You Build",
    hookHeadline: "Get paid before you build.",
    metaTitle: "Get Paid Before You Build – Unlock SaaS",
    metaDescription:
      "Pre-sell the offer with a landing page and a Stripe button. The Playbook walks you from idea to first dollar without writing the first line of code.",
    heroSubhead:
      "The cheapest validation is a paid one. The Playbook walks you from idea to first paid pre-order using a landing page and a Stripe button, before a single line of product code gets written.",
    painSnapshot:
      "You have an idea. You think it is good. Six months of building would tell you whether it is good. Six months is too long, and the build also costs the time of two side projects you will not start. The pre-sell motion compresses six months of validation into two weeks.",
    whyHardForMost:
      "Founders confuse pre-selling with dishonesty ('I am taking money for a product that does not exist'). It is the opposite. Pre-selling is the most honest validation – the only people who pay for a non-existent product are the ones who actually wanted it. Free signups validate curiosity; paid pre-orders validate demand.",
    theMove:
      "Build a one-page landing page with a clear outcome, a price, and a Stripe checkout button. Tell every visitor exactly when the product ships. Take real money for real pre-orders. The first paid pre-order is the demand validation; building begins after that signal lands.",
    steps: [
      {
        heading: "Write the landing page before writing the product",
        body: "One page. Hook (the outcome), Story (the pain it removes), Offer (price + timeline + guarantee). If you cannot write the page in a day, the idea is not yet specific enough to build.",
      },
      {
        heading: "Set a real price, not a placeholder",
        body: "Price the pre-order at 50 to 70 percent of the planned retail price. Discounted pre-orders signal commitment without devaluing the product post-launch.",
      },
      {
        heading: "Take real money via Stripe Checkout",
        body: "Free email opt-ins are not pre-sells. The validation only counts if it is paid. Stripe Checkout takes 15 minutes to wire up; the answer the page returns in 14 days is worth it.",
      },
      {
        heading: "Honour the timeline you promised, exactly",
        body: "The pre-sell motion only stays honest if the timeline holds. If the launch date slips, refund proactively and re-launch when ready. Refunding is not failure – it is the integrity layer the pre-sell motion depends on.",
      },
    ],
    commonMistake:
      "Pre-selling without a real timeline. Founders take pre-orders 'whenever the product is ready', which removes the constraint that made the pre-sell honest. The promise that activates the buyer is 'ships on X date'. Without the date, the pre-order is a donation.",
    whatToTrack:
      "Conversion rate on the landing page, not pre-order count. 100 visitors and 3 pre-orders is a 3 percent conversion rate – healthy enough to build. 1,000 visitors and 3 pre-orders is 0.3 percent – the offer is wrong even though the same 3 humans paid.",
    faqs: [
      {
        q: "What if I get pre-orders and cannot deliver?",
        a: "Refund immediately, fully, with an honest note. The pre-sell motion includes the refund path as a feature, not a failure mode. Buyers who got refunded for a missed timeline often become buyers again for the eventual real launch.",
      },
      {
        q: "How many pre-orders is 'enough' to build?",
        a: "Three. Three paid pre-orders from non-friends is real demand. Below three, the data is anecdotal. Above three, you have a small but real cohort to ship to. The number is small on purpose – the validation is binary, not volumetric.",
      },
      {
        q: "Should the pre-sell page promise an exact feature list?",
        a: "Promise the outcome, not the features. Feature lists pre-commit you to a build path that may not be optimal once you start. The outcome is the contract; the feature path is implementation detail.",
      },
    ],
    relatedGlossary: ["hook", "value-ladder", "soap-opera-sequence"],
    relatedOutcomes: [
      "out-of-the-prelaunch-trap",
      "clarity-on-your-offer",
      "first-paying-customer",
    ],
    lastVerified: VERIFIED,
  },
  {
    slug: "customers-without-paid-ads",
    displayName: "Customers Without Paid Ads",
    hookHeadline: "Get customers without paid ads.",
    metaTitle: "Get Customers Without Paid Ads – Unlock SaaS",
    metaDescription:
      "Three organic channels (Dream 100 outreach, content compounding, partner introductions) produce customers without spending on traffic. The Playbook picks the right one.",
    heroSubhead:
      "Paid ads are not the only acquisition channel and they are rarely the right one pre-revenue. Three organic motions produce paying customers without spending on traffic. The Playbook picks the one that fits your money mechanics.",
    painSnapshot:
      "The ad budget is $0 (or should be at this stage). Every blog post that says 'just scale with ads' assumes you already have a converting funnel and product-market fit signal. You have neither. The advice is for a stage you have not reached.",
    whyHardForMost:
      "Founders read 'organic' as 'free'. Organic channels are not free; they cost time at a rate that compounds. Dream 100 outreach is the fastest organic channel; content is the slowest; partner introductions sit in between. Choosing the wrong one wastes the time you cannot get back.",
    theMove:
      "Pick the organic channel that matches your founder energy and your buyer's information habits. Then run it daily for 90 days before evaluating. Switching channels at day 30 because 'this is not working' is the single most common pattern that produces zero customers organically.",
    steps: [
      {
        heading: "Diagnose where your buyer reads",
        body: "Founder buyers cluster on X, IH, r/SaaS, and a small set of newsletters. B2B operators cluster on LinkedIn and trade publications. The channel choice is downstream of where the human already pays attention.",
      },
      {
        heading: "Pick one of the three organic motions",
        body: "Dream 100 outreach: fastest, requires high tolerance for asking. Content compounding: slowest, requires writing discipline. Partner introductions: needs an existing network. The Playbook walks you through the diagnosis.",
      },
      {
        heading: "Run the chosen motion daily for 90 days",
        body: "Daily, not weekly. 90 days, not 30. Organic motions produce a J-curve – nothing for 60 days, then everything in days 61 to 90. Founders who quit at day 30 never see the inflection.",
      },
      {
        heading: "Track leading metrics, not lagging ones",
        body: "Outreach: replies per day. Content: distribution per piece. Partners: introductions per week. Lagging metrics (customers, MRR) lag too far behind the leading signal to be useful until day 60.",
      },
    ],
    commonMistake:
      "Running all three organic motions at once because 'I want to maximise the surface area'. Three half-effort motions produce no signal. One full-effort motion run for 90 days produces enough data to keep going or switch. Surface area is the enemy of organic acquisition, not the friend.",
    whatToTrack:
      "Quality of conversation per channel, not volume of impressions. 10 conversations a week with the right ICP outperforms 10,000 impressions of cold traffic. Conversation quality is the leading signal for organic motions; impressions are noise.",
    faqs: [
      {
        q: "When should I start running paid ads?",
        a: "After organic acquisition has produced a converting funnel that you understand the economics of. Paid ads multiply whatever conversion exists; if conversion is unknown, paid ads multiply unknown, which is just expensive learning.",
      },
      {
        q: "Is SEO an organic channel I should pick?",
        a: "SEO is a content motion with a 6-to-12-month payback window. If you have the writing cadence and 12 months of runway, it compounds beautifully. Most pre-revenue founders need customers faster than SEO can deliver.",
      },
      {
        q: "How long until organic outreach produces a customer?",
        a: "Two to six weeks for the first one, when calibration is right. The first organic customer often arrives much faster than founders expect, because Dream 100 outreach is faster than founders give it credit for.",
      },
    ],
    relatedGlossary: ["dream-100", "seinfeld-sequence", "value-ladder"],
    relatedOutcomes: [
      "30-warm-leads-from-cold-outreach",
      "first-paying-customer",
      "to-1k-mrr",
    ],
    lastVerified: VERIFIED,
  },
  {
    slug: "first-100-newsletter-subscribers",
    displayName: "First 100 Newsletter Subscribers",
    hookHeadline: "Get your first 100 newsletter subscribers.",
    metaTitle: "Get Your First 100 Newsletter Subscribers – Unlock SaaS",
    metaDescription:
      "Three opt-in mechanisms (lead magnet, recurring content, conversion event hooks) produce the first 100 subscribers. The Playbook picks the one that matches your funnel.",
    heroSubhead:
      "The first 100 subscribers come from three specific opt-in mechanisms, not from generic 'subscribe to the newsletter' buttons. The Playbook walks you from blank list to 100 subscribers in 30 days using a Brunson-style Hook + lead magnet.",
    painSnapshot:
      "The newsletter signup box sits in the footer with 6 subscribers, all of whom are personal friends. Three months in, the list has not grown. The content has not been written. The chicken-and-egg loop is real: nothing to write to, no reason to write.",
    whyHardForMost:
      "Founders confuse 'launch a newsletter' with 'put a signup box on the site'. The first is a product; the second is a footer element. The first 100 subscribers come from treating the newsletter as a distinct funnel with its own Hook, opt-in, and follow-up sequence.",
    theMove:
      "Build a lead magnet that solves the exact pain the ICP wakes up with. Drive Dream 100 outreach to the lead magnet, not to the product. Subscribers from the lead magnet are pre-qualified – they wanted something specific and got it.",
    steps: [
      {
        heading: "Pick a lead magnet that matches the ICP's actual pain",
        body: "Not 'best practices'. Specifically: the one-page tool, template, or checklist that solves the visible pain in 15 minutes. For UnlockSaaS-shaped audiences: the 5-minute Launch Diagnostic is the lead magnet.",
      },
      {
        heading: "Build a dedicated opt-in page, not a footer box",
        body: "One page, one Hook, one promise, one email field. Footer signup boxes convert at 0.1 percent. Dedicated opt-in pages convert at 15-40 percent of qualified traffic.",
      },
      {
        heading: "Wire the Soap Opera sequence as the follow-up",
        body: "Five-email Soap Opera over five days for every new subscriber. The sequence does the relationship-building the founder cannot do at scale. Subscribers who finish the Soap Opera are warm leads for the actual product.",
      },
      {
        heading: "Drive Dream 100 outreach to the opt-in page",
        body: "Same Dream 100 motion as for the product, but the offer in the cold message is the lead magnet, not the product. Frictionless ask, qualified opt-in.",
      },
    ],
    commonMistake:
      "Driving cold traffic to the homepage instead of the dedicated opt-in page. The homepage tries to do four jobs (sell, educate, opt-in, demo). The dedicated opt-in page does one. The conversion difference is typically 20x.",
    whatToTrack:
      "Opt-in conversion rate on the dedicated page. Below 10 percent: the lead magnet does not match the visible pain. 10-25 percent: the magnet is close, the page copy needs work. Above 25 percent: scale the traffic, not the page.",
    faqs: [
      {
        q: "Should I gate the lead magnet behind email or make it public?",
        a: "Gate it. Public versions remove the conversion event. The point of the lead magnet is not the content – it is the subscriber. A subscriber-gated magnet that 100 humans read is worth more than a public magnet 1,000 humans read.",
      },
      {
        q: "How fast should I send the first email after opt-in?",
        a: "Within 60 seconds. The first email lands while the lead magnet is still open. Delay to the next day and the subscriber forgets they opted in; open rates drop by half.",
      },
      {
        q: "Is 100 subscribers enough to launch the product to?",
        a: "Depends on the channel that produced them. 100 Dream 100 outreach subscribers: yes, run the launch. 100 subscribers from a viral Twitter post: not yet, the audience is uncalibrated.",
      },
    ],
    relatedGlossary: ["soap-opera-sequence", "hook", "value-ladder"],
    relatedOutcomes: [
      "first-paying-customer",
      "30-warm-leads-from-cold-outreach",
      "a-bridge-page-that-converts",
    ],
    lastVerified: VERIFIED,
  },
  {
    slug: "product-market-fit-signal",
    displayName: "Product-Market Fit Signal",
    hookHeadline: "Get product-market fit signal.",
    metaTitle: "Get Product-Market Fit Signal – Unlock SaaS",
    metaDescription:
      "PMF signal is three lagging measurements, not a feeling. The diagnostic checks each one against your current numbers and labels how close you are.",
    heroSubhead:
      "Product-market fit is not a vibe. It is three measurable signals: retention curve, expansion revenue, and unprompted user growth. The diagnostic checks each against your current numbers and labels how close you are.",
    painSnapshot:
      "You read 'you will know when you have PMF' a hundred times. You have shipped, you have customers, you have churn, and you have no idea whether you are close. The waiting-to-feel-it framing is the worst possible navigation aid for the most important question pre-revenue founders face.",
    whyHardForMost:
      "PMF is a portfolio of three signals, not a single signal. Founders measure one (usually growth) and ignore the other two (retention and expansion). With one of three signals visible, the answer to 'do I have PMF' is always 'maybe' – which means 'no', because PMF reads as 'obviously yes' when it lands.",
    theMove:
      "Measure all three signals against published thresholds. Retention curve flat at week 6 or higher. Expansion revenue greater than 30 percent of new revenue. Unprompted user growth at 5 percent week-over-week or higher. Two of three: you are close. Three of three: you have PMF.",
    steps: [
      {
        heading: "Plot the retention curve",
        body: "Cohort users by signup week, plot percent active week 1 through week 12. Healthy curve flattens at 30 percent or higher by week 6. Curves that continue to drop have a retention problem masquerading as a growth problem.",
      },
      {
        heading: "Measure expansion revenue as a percent of new revenue",
        body: "Of this month's revenue, what percentage came from existing customers upgrading vs new customers signing up. Healthy expansion at 30 percent or more signals that the offer ladders without acquisition spend.",
      },
      {
        heading: "Track unprompted growth (referrals + organic mentions)",
        body: "Of this week's signups, how many came from a referral, an unprompted social mention, or an organic search. Above 5 percent week-over-week growth from these sources signals real market pull.",
      },
      {
        heading: "Score the portfolio: 0, 1, 2, or 3 signals green",
        body: "Zero green: PMF is far. One green: pre-PMF, ship-and-measure cycle. Two green: close, optimise the red signal. Three green: scale, do not change the offer.",
      },
    ],
    commonMistake:
      "Reading the growth signal alone and concluding PMF based on a launch spike. Launch spikes are not PMF; they are launch spikes. The retention curve at week 6 is the honest answer. Most launch-spike products have retention curves that drop to single digits by week 6 – that is the diagnostic, not the spike.",
    whatToTrack:
      "Week-6 cohort retention as the canonical leading signal. Easier to measure than the other two and the strongest predictor of long-term PMF. Below 20 percent: the product does not yet match the market. Above 30 percent: you are in the zone.",
    faqs: [
      {
        q: "How many customers do I need before the retention curve is meaningful?",
        a: "30 cohort users for directional signal, 100 for confident signal. Below 30 the noise dominates. Above 100 the cohort behaviour is repeatable and the curve is honest.",
      },
      {
        q: "Can I have PMF without expansion revenue?",
        a: "Possible if the product is genuinely one-time-purchase shaped (a course, a tool, a download). For SaaS, expansion revenue absence at 30 percent or more usually signals the value ladder is missing rungs, even if acquisition is healthy.",
      },
      {
        q: "What if I have all three signals at low volume?",
        a: "Then you have early PMF and need to scale acquisition without changing the offer. The most common failure pattern at this stage is changing the offer in pursuit of scale; the offer is the thing that produced the signal.",
      },
    ],
    relatedGlossary: ["value-ladder", "two-comma-club", "perfect-webinar"],
    relatedOutcomes: [
      "to-10k-mrr",
      "a-repeatable-sales-process",
      "off-the-feature-treadmill",
    ],
    lastVerified: VERIFIED,
  },
  {
    slug: "off-the-feature-treadmill",
    displayName: "Off the Feature Treadmill",
    hookHeadline: "Get off the feature treadmill.",
    metaTitle: "Get Off the Feature Treadmill – Unlock SaaS",
    metaDescription:
      "Adding features does not unstick a flat Stripe line. The diagnostic labels which non-feature block is actually doing the damage and stops the treadmill cold.",
    heroSubhead:
      "When the Stripe line is flat, the founder reflex is to ship more features. The diagnostic labels which non-feature block (Hook, Story, or Offer) is actually doing the damage and stops the treadmill cold.",
    painSnapshot:
      "Every Friday a new feature ships. Every Monday the Stripe line is still flat. The roadmap is full of 'this will be the one' features that never move the metric. Five months in, the product has 40 percent more surface area and the same revenue as month one.",
    whyHardForMost:
      "Feature work is satisfying. It is visible progress. The flat metric is not solved by features when the actual block is at the Hook level (wrong audience), Story level (wrong narrative), or Offer level (wrong construction). Features only matter once those three are right – and if those are right, features stop being the bottleneck.",
    theMove:
      "Freeze the roadmap for 14 days. Run the diagnostic. If the diagnosis names a non-feature block (which it usually does), fix that block and re-evaluate before any new feature work resumes. The freeze is the diagnostic of the diagnostic.",
    steps: [
      {
        heading: "Freeze the roadmap for 14 days",
        body: "No new features, no bug-fixes-disguised-as-features. The freeze is the only intervention that breaks the feedback loop where features feel productive but produce no revenue movement.",
      },
      {
        heading: "Run the diagnostic on the live page",
        body: "90 seconds. The output names which of Hook, Story, or Offer is doing the damage. If the diagnosis returns 'product capability gap', the freeze ends and feature work resumes. It rarely does.",
      },
      {
        heading: "Fix only the diagnosed block",
        body: "Headline rewrite, narrative restructure, or offer construction. One change. Watch the metric for 7 days before changing anything else.",
      },
      {
        heading: "Resume feature work only after the metric moves",
        body: "If signup-to-paid conversion moves on the diagnosed fix, the diagnosis was correct and the next layer of triage runs. If it does not move, the diagnosis was incomplete and feature work was the wrong next step regardless.",
      },
    ],
    commonMistake:
      "Treating 'freeze the roadmap' as 'slow down the roadmap'. The freeze has to be absolute for the 14 days. Founders who freeze 80 percent of features and ship 'just one' produce no diagnostic data because the variable they were trying to isolate (does the metric move without features) never gets isolated.",
    whatToTrack:
      "Signup-to-paid conversion before and after the freeze. If the metric moves on the diagnosed fix during the freeze, the treadmill was a distraction. If it does not move, the diagnosis is incomplete and the next-layer triage is the right next step – not features.",
    faqs: [
      {
        q: "What if customers are asking for the features I would freeze?",
        a: "Customer feature requests are signals, not commands. The signal worth listening to is which customers ask for what – three of the same role asking for the same feature is real demand. Twenty different customers asking for twenty different features is feature-treadmill noise.",
      },
      {
        q: "Is 14 days enough to see metric movement?",
        a: "Long enough to see the leading signal (conversion rate on the new page), not long enough to see the lagging signal (MRR). The freeze is the diagnostic, not the full optimisation cycle.",
      },
      {
        q: "I am a solo founder. Won't the freeze be lonely?",
        a: "Yes. The discomfort is part of the diagnostic. Feature work fills the day and produces the feeling of progress; the freeze removes that fill and exposes which work was actually moving the needle.",
      },
    ],
    relatedGlossary: ["hook", "value-ladder", "two-comma-club"],
    relatedOutcomes: [
      "clarity-on-your-offer",
      "product-market-fit-signal",
      "first-paying-customer",
    ],
    lastVerified: VERIFIED,
  },
  {
    slug: "a-repeatable-sales-process",
    displayName: "A Repeatable Sales Process",
    hookHeadline: "Get a repeatable sales process.",
    metaTitle: "Get a Repeatable Sales Process – Unlock SaaS",
    metaDescription:
      "From hand-to-mouth outreach to a documented sales motion that produces the same outcome every time. Three artefacts, one Brunson funnel.",
    heroSubhead:
      "Repeatability is the difference between $1k MRR and $10k MRR. The Playbook walks you from hand-to-mouth outreach to a documented sales motion that produces the same outcome every time, using three artefacts and one Brunson funnel.",
    painSnapshot:
      "The first 10 customers each came from a different place. One from a tweet, one from a Reddit comment, one from a referral, three from cold email. You cannot point to 'the way customers find us' because every win was a fluke. The next 10 customers, at the same flake rate, would take another six months.",
    whyHardForMost:
      "Founders read 'sales process' as 'CRM software'. The process is three artefacts and a funnel: an ICP definition, an outreach script, a discovery-call structure, and a conversion path. Without those, every customer is bespoke; with those, every customer is a repeatable instance of the same motion.",
    theMove:
      "Document the path of the last three customers and find the common shape. The repeatable process is buried in the data you already have – three customers is enough to extract the pattern. Then run the next 10 through the documented path on purpose.",
    steps: [
      {
        heading: "Reverse-engineer the last three customers",
        body: "Source, message, channel, ask, close. Write down each one as a five-line summary. The pattern that crosses all three is the seed of the repeatable process.",
      },
      {
        heading: "Document the ICP, script, and conversion path",
        body: "Three artefacts. ICP: one paragraph naming role, stage, and visible pain. Script: the 3-sentence message. Path: the 4-step funnel from message to paid.",
      },
      {
        heading: "Run the documented path 10 times",
        body: "Ten new prospects through the exact documented motion. Variations only when the data says the documented step is broken – not before, not on intuition.",
      },
      {
        heading: "Measure conversion at each step, not just the final",
        body: "Sent → opened → replied → discovery → closed. Four conversion rates. The leak is one specific step, not 'the process'. Optimising the leak step compounds; rebuilding the whole process does not.",
      },
    ],
    commonMistake:
      "Treating the documented process as fixed once written. The process is a hypothesis the next 10 customers test. The hypothesis evolves based on the conversion data at each step. Founders who freeze the process at v1 are stuck with v1's conversion rate forever.",
    whatToTrack:
      "Conversion rate per step, not aggregate close rate. Aggregate close rate masks the leaks. Per-step conversion reveals which one specific step (open rate, reply rate, discovery-to-close) is the bottleneck. Optimising the bottleneck compounds.",
    faqs: [
      {
        q: "Do I need a CRM to have a repeatable process?",
        a: "No. A spreadsheet with five columns (prospect, last touch, status, next action, source) is enough for the first 100 prospects. CRMs add value above 100 prospects when the founder cannot hold the state in their head anymore.",
      },
      {
        q: "What if my three customers came from three different channels?",
        a: "Then the shared pattern is not the channel – it is the message, the pain, or the trigger. The repeatable process documents whatever is shared, even if the channel varies. Three customers from three channels who all responded to the same Hook is still a pattern.",
      },
      {
        q: "How long until the documented process produces a new customer?",
        a: "Two to six weeks, depending on cycle length. The first customer through the documented path is the validation that the documentation captured the real pattern; the second is the validation that it generalises.",
      },
    ],
    relatedGlossary: ["dream-100", "value-ladder", "perfect-webinar"],
    relatedOutcomes: [
      "to-1k-mrr",
      "to-10k-mrr",
      "30-warm-leads-from-cold-outreach",
    ],
    lastVerified: VERIFIED,
  },
  {
    slug: "feedback-from-strangers",
    displayName: "Feedback From Strangers",
    hookHeadline: "Get feedback from strangers, not friends.",
    metaTitle: "Get Feedback From Strangers – Unlock SaaS",
    metaDescription:
      "Friends say 'looks great'. Strangers say what is actually wrong. The Playbook walks you from polite feedback to honest feedback in 14 days.",
    heroSubhead:
      "Friends say 'looks great'. Strangers say what is actually wrong. The Playbook walks you from polite feedback to honest feedback by sending the page to 20 strangers who match the ICP exactly, with a specific ask that does not let them be polite.",
    painSnapshot:
      "You have shown the landing page to 10 friends. They all said it looked great. You launched. Nothing happened. The gap between 'looks great' and 'I would pay for this' is wider than friends know how to close.",
    whyHardForMost:
      "Friends are not the ICP. Friends are calibrated to be supportive; the ICP is calibrated to be sceptical. Feedback from friends optimises for the friend's emotional response to giving feedback, not for the truth of the product. The Playbook moves the audience without moving the question.",
    theMove:
      "Send the page to 20 strangers who match the ICP exactly. Ask one specific question that does not have a polite escape hatch. 'What does this product do' is a polite question; 'Would you pay $49/month for this, why or why not' is not. Strangers tell the truth when the question forecloses politeness.",
    steps: [
      {
        heading: "Define the ICP-shaped stranger",
        body: "Not 'anyone'. Specifically: post-launch pre-revenue founders posting publicly about no signups. The visible-signal layer ensures the stranger is currently in the exact state the product addresses.",
      },
      {
        heading: "Find 20 of them in public",
        body: "Indie Hackers, r/SaaS, X (search recent posts). 20 humans in the target state, posting in public, addressable via DM or cold email.",
      },
      {
        heading: "Ask the one specific question",
        body: "'Would you pay $49/month for [outcome the product delivers], why or why not'. Specific currency, specific cadence, specific outcome. The construction forecloses the polite 'looks great' response.",
      },
      {
        heading: "Treat the responses as a single document, not 20 anecdotes",
        body: "After 20 replies, the patterns are clear. Three or more strangers mentioning the same blocker is a real signal. The pattern, not the individual response, is the artefact.",
      },
    ],
    commonMistake:
      "Reading individual responses and reacting to each one. Twenty strangers will say twenty different things. The signal is the pattern across the 20, not the loudest individual response. Founders who pivot based on the loudest single voice end up chasing the last person they spoke to.",
    whatToTrack:
      "Number of strangers who said 'yes I would pay' divided by the 20 you asked. Below 10 percent: the offer is unclear or wrong-fit. 10-30 percent: the offer is close, the framing needs work. Above 30 percent: the offer is ready, the launch motion is the next layer.",
    faqs: [
      {
        q: "What if no strangers reply?",
        a: "The reply rate to stranger outreach mirrors the reply rate to cold outreach. Below 10 percent reply means the message is generic. The Playbook covers the calibration step before this one.",
      },
      {
        q: "Can I pay strangers for feedback?",
        a: "Yes. A $10 gift card per response often raises reply rates from 5 percent to 25 percent and the quality of the feedback stays honest – the gift card pays for the time, not the answer.",
      },
      {
        q: "How many of the 20 should I expect to convert to customers?",
        a: "Zero to two, and that is not the point. Stranger feedback is diagnostic, not acquisition. If one converts, that is a bonus; if zero convert, the responses still tell you what to fix.",
      },
    ],
    relatedGlossary: ["dream-100", "hook", "soap-opera-sequence"],
    relatedOutcomes: [
      "clarity-on-your-offer",
      "first-paying-customer",
      "30-warm-leads-from-cold-outreach",
    ],
    lastVerified: VERIFIED,
  },
  {
    slug: "customers-from-reddit",
    displayName: "Customers From Reddit",
    hookHeadline: "Get customers from Reddit.",
    metaTitle: "Get Customers From Reddit – Unlock SaaS",
    metaDescription:
      "Reddit converts when the comment is helpful and the product is honestly mentioned downstream. The Playbook covers the helper-first motion that does not get flagged.",
    heroSubhead:
      "Reddit converts when the comment is helpful first and the product is named honestly downstream. The Playbook covers the helper-first motion that does not get flagged, using r/SaaS and r/microsaas as the canonical channels.",
    painSnapshot:
      "You posted in r/SaaS twice. The first post got removed for self-promotion. The second got two upvotes and zero clicks. You concluded Reddit does not work. Reddit works – the motion that works is the one nobody who reads 'Reddit marketing playbook' actually runs.",
    whyHardForMost:
      "Most 'Reddit marketing' advice is hostile to Reddit. Post your product, link to your site, get banned. The motion that works is the opposite: be the most useful commenter in the threads where the ICP asks for help. The product mention happens once, in a comment where it is the honest answer, not in a post where it is the topic.",
    theMove:
      "Spend 14 days commenting helpfully without ever mentioning the product. Earn karma in the target subreddits. Then, on day 15, the first product mention happens as the honest answer to a specific question in a specific thread. The previous 14 days of context is what makes the mention land instead of getting flagged.",
    steps: [
      {
        heading: "Pick three subreddits where the ICP actually posts",
        body: "Not r/marketing or r/entrepreneur. Specifically: r/SaaS, r/microsaas, r/indiehackers (yes the website is the home but the subreddit exists). Subscribe, read for a week before posting.",
      },
      {
        heading: "Comment helpfully for 14 days without mentioning the product",
        body: "Answer questions, share specific tactics, link to other people's resources when they help more than yours would. Build a real comment history. The bar is 'would the mods of this sub respect you'.",
      },
      {
        heading: "Mention the product once, in the right thread, honestly",
        body: "When a post asks for exactly the thing the product does, mention it in a comment with full context: 'I built this; here is how it would help'. Honest disclosure is required by every subreddit's rules and converts higher than veiled mentions.",
      },
      {
        heading: "Track clicks via UTM, not by replies",
        body: "Reddit clicks compound silently. A comment from day 18 might drive traffic on day 90 when someone googles the question and lands on the Reddit thread. UTM-tagged links are the only honest measurement.",
      },
    ],
    commonMistake:
      "Posting the product as a top-level thread before having earned comment history. Top-level promotional posts get removed by mods in under an hour on the active subreddits, regardless of how good the product is. The 14-day comment-history requirement is not a rule; it is the social contract that makes a later mention land.",
    whatToTrack:
      "Karma in target subreddits and click-through from product mentions. Karma trajectory should be net-positive for 14 consecutive days before the first product mention. Below that threshold, the mention reads as new-account self-promotion regardless of content.",
    faqs: [
      {
        q: "Is Reddit better than Twitter / X for SaaS acquisition?",
        a: "Different shape. Reddit converts slower but the inbound is higher intent (someone literally asked for the thing). X converts faster but the inbound is lower intent. Both work; pick the one whose cadence matches your founder energy.",
      },
      {
        q: "How honest should the product disclosure be?",
        a: "Fully honest. 'I built this; here is how it solves what you are asking about; full disclosure I am the founder.' The disclosure is what makes the comment safe under sub rules and what makes it convert. Hiding the founder identity always backfires.",
      },
      {
        q: "What if my product gets downvoted in the mention thread?",
        a: "Downvotes on the comment without removal mean the mods accept the disclosure but the community pushes back on the offer. That is feedback – run the diagnostic on the offer, not the channel.",
      },
    ],
    relatedGlossary: ["dream-100", "hook", "seinfeld-sequence"],
    relatedOutcomes: [
      "first-paying-customer",
      "customers-without-paid-ads",
      "30-warm-leads-from-cold-outreach",
    ],
    lastVerified: VERIFIED,
  },
  {
    slug: "clarity-on-your-offer",
    displayName: "Clarity on Your Offer",
    hookHeadline: "Get clarity on your offer.",
    metaTitle: "Get Clarity on Your Offer – Unlock SaaS",
    metaDescription:
      "If you cannot say the offer in one sentence, the offer is not clear yet. The Playbook walks you to the one-sentence frame using the Brunson formula.",
    heroSubhead:
      "If you cannot say the offer in one sentence, the offer is not clear yet. The Playbook walks you to the one-sentence frame using the Brunson formula: 'I help [audience] get [outcome] in [timeframe] without [common pain] via [mechanism].'",
    painSnapshot:
      "Asked what your product does, you say four sentences. None of them are the same as the last time you said it. The landing page hero changes every two weeks. Every conversation, every tweet, every pitch lands differently. The product is unclear because the offer is unclear.",
    whyHardForMost:
      "Founders confuse 'clarity' with 'brevity'. A clear offer can be six sentences; an unclear one can be one. Clarity is consistency across mediums – pitch, page, ad, conversation, follow-up. If the offer reads differently in each, the offer is not yet a single thing.",
    theMove:
      "Write the offer in the Brunson formula. 'I help [specific audience] get [specific outcome] in [specific timeframe] without [common pain] via [specific mechanism].' Five blanks. Each blank must be filled in with a noun, not an adjective. 'Founders' is a noun; 'modern founders' is an adjective tax.",
    steps: [
      {
        heading: "Fill in the five blanks honestly",
        body: "Audience, outcome, timeframe, pain, mechanism. Honest means: a stranger reading the sentence understands exactly what they get and exactly who it is for. Vague nouns produce vague offers.",
      },
      {
        heading: "Read the sentence to a stranger",
        body: "Not a friend. A stranger. If the stranger can repeat the sentence back without paraphrasing, the offer is clear. If they paraphrase, the original sentence has slack.",
      },
      {
        heading: "Use the same sentence on the landing page, in the pitch, and in the tweet",
        body: "One offer, one phrasing. Variants are fine; reinventions are not. The phrasing of the offer is the brand promise; changing the phrasing changes the promise.",
      },
      {
        heading: "Test the offer with stranger feedback",
        body: "Send the one-sentence offer to 10 strangers in the target audience. Ask 'is this clear? Would you click into it?' Below 50 percent yes: rewrite. Above 80 percent yes: ship.",
      },
    ],
    commonMistake:
      "Filling the mechanism slot with the product category instead of the specific Brunson mechanism. 'Via our SaaS platform' is the product category; 'via the Hook / Story / Offer diagnostic' is the mechanism. Categories are interchangeable; mechanisms are not.",
    whatToTrack:
      "Whether you can repeat the offer verbatim a week later. If you cannot, the offer was not memorable, which means the audience cannot remember it either. The memorability of the offer is a leading indicator of the conversion of the offer.",
    faqs: [
      {
        q: "Can the offer be longer than one sentence?",
        a: "The offer pitch is one sentence. The offer page is many. The pitch needs to be one sentence because that is the unit of memory humans carry; the page can elaborate because that is the unit of decision humans make.",
      },
      {
        q: "What if my audience is not yet defined?",
        a: "Audience-undefined is the same as offer-undefined. The Playbook covers the audience-definition step before the offer-formula step. They are sequential, not parallel.",
      },
      {
        q: "How often should I revisit the offer phrasing?",
        a: "When the conversion rate moves more than 30 percent, when the audience shifts, when the product fundamentally changes. Otherwise, leave it. Offer-phrasing churn is a leading indicator of offer-instability, not offer-improvement.",
      },
    ],
    relatedGlossary: ["hook", "value-ladder", "perfect-webinar"],
    relatedOutcomes: [
      "first-paying-customer",
      "off-the-feature-treadmill",
      "feedback-from-strangers",
    ],
    lastVerified: VERIFIED,
  },
  {
    slug: "a-bridge-page-that-converts",
    displayName: "A Bridge Page That Converts",
    hookHeadline: "Get a bridge page that converts.",
    metaTitle: "Get a Bridge Page That Converts – Unlock SaaS",
    metaDescription:
      "The bridge page sits between problem-aware traffic and the offer. The Playbook walks you to the structure that warms cold readers into qualified clickers.",
    heroSubhead:
      "Bridge pages convert cold problem-aware traffic into qualified clickers by retelling the reader's situation back to them in their words before introducing the offer. The Playbook walks you to the canonical Brunson bridge structure.",
    painSnapshot:
      "You point paid traffic or cold outreach at the landing page. The page converts at 0.5 percent. You assume the page is the problem. The actual problem is upstream: the traffic was problem-aware (knows their pain) and the page was solution-aware (assumes they know your solution). The bridge between those two states is missing.",
    whyHardForMost:
      "Bridge pages are not 'pre-landing pages' or 'lead magnets'. They are a specific narrative structure that retells the reader's problem in the reader's words, validates that the reader is in the right place, and only then introduces the solution. Most founders skip directly to the solution, which loses the 80 percent of readers who needed the bridge.",
    theMove:
      "Build a single page whose first 200 words are nothing but the reader's situation, retold without the product. The reader nods through the first half ('that is exactly me') and the second half ('this is the solution for me') lands as confirmation, not as a pitch.",
    steps: [
      {
        heading: "Open with the reader's exact situation",
        body: "First three paragraphs: zero product mentions. Pure mirror of the reader's pain, the wrong moves they have probably already tried, and the specific shape of the stuck point. The reader should think 'this person knows me'.",
      },
      {
        heading: "Name what is actually broken (the framing shift)",
        body: "Paragraph four to six: introduce the reframe. 'The block is not what you think it is.' Name the actual block. The framing shift is what earns the reader's attention to the offer.",
      },
      {
        heading: "Introduce the offer as the natural next step",
        body: "Only after the framing shift lands. The offer is positioned as the operationalisation of the reframe, not as a separate pitch.",
      },
      {
        heading: "Single CTA, single direction",
        body: "Bridge pages convert when they have one button and one place to go. Multiple CTAs split attention and lose the warming work the page just did.",
      },
    ],
    commonMistake:
      "Treating the bridge page as a 'longer landing page'. The bridge is structurally different: the landing page sells, the bridge reframes. Bridge pages that try to sell in paragraph one waste the bridge work. Landing pages that try to reframe in paragraph eight waste the landing-page work. Pick one structure per page.",
    whatToTrack:
      "Click-through rate from the bridge to the landing page. Healthy bridge converts 30-60 percent of readers to the landing page CTA. Below 20 percent: the bridge is not landing. Above 60 percent: the bridge is over-warming; the landing page can carry more weight.",
    faqs: [
      {
        q: "Do I need a bridge page for organic traffic?",
        a: "Less critical. Organic traffic from search is usually further along the awareness ladder by the time it lands. Bridge pages are for cold traffic, paid traffic, and outreach traffic – the audiences who arrive problem-aware but not solution-aware.",
      },
      {
        q: "How long should the bridge page be?",
        a: "400-800 words. Long enough to land the reframe; short enough that the reader gets to the CTA. Most ineffective bridges are 1,500 words because the founder kept explaining; effective bridges stop the moment the reframe lands.",
      },
      {
        q: "Where does the bridge page sit in the funnel?",
        a: "Between traffic source and landing page. Cold traffic → bridge → landing page → checkout. The bridge is the warming layer; the landing page is the converting layer. Each does one job.",
      },
    ],
    relatedGlossary: ["soap-opera-sequence", "hook", "perfect-webinar"],
    relatedOutcomes: [
      "first-paying-customer",
      "first-100-newsletter-subscribers",
      "clarity-on-your-offer",
    ],
    lastVerified: VERIFIED,
  },
];

export const OUTCOME_SLUGS = OUTCOME_ENTRIES.map((e) => e.slug);

export function getOutcomeBySlug(slug: string): OutcomeEntry | undefined {
  return OUTCOME_ENTRIES.find((e) => e.slug === slug);
}
