/**
 * /why-isnt-my pSEO catalog – panic-mode diagnostic intent.
 *
 * Captures the exact phrase a post-launch pre-revenue founder types into
 * Google when their dashboard is flat: "why isn't my landing page
 * converting", "why isn't my checkout converting", etc. Highest
 * commercial intent in the entire keyword universe for this ICP.
 *
 * Each entry pairs the panicked question with the Hook / Story / Offer
 * diagnosis and points at /diagnostic for the live read. No fabricated
 * benchmarks – every quantified line is a directional range, not a
 * single number presented as universal truth.
 *
 * Brunson Hard-Rule reconciliation:
 *   - The "common cause" list is the same Wrong Person / Weak Offer /
 *     Weak Belief triage the diagnostic returns. Drift-free.
 *   - No "guaranteed X% lift" copy. No invented case study figures.
 *   - The CTA always lands on /diagnostic, where the founder pastes
 *     their live URL and gets the real read.
 */

export interface WhyIsntMyEntry {
  /** URL slug, kebab-case. The element being diagnosed. */
  slug: string;
  /** The element name as it appears in the H1, e.g. "landing page". */
  element: string;
  /** SEO meta title, under 60 chars. */
  metaTitle: string;
  /** SEO meta description, under 160 chars. Direct answer for AEO. */
  metaDescription: string;
  /** TL;DR paragraph: the single most common reason. ~60 words. */
  tldr: string;
  /** Three Brunson-framework diagnoses for this element. */
  diagnoses: ReadonlyArray<{
    label: "Wrong Person" | "Weak Offer" | "Weak Belief";
    /** What this diagnosis looks like for this specific element. */
    appearance: string;
    /** The one fix to attempt this week. */
    fix: string;
  }>;
  /** Directional benchmark range (not a single number). */
  directionalRange: {
    range: string;
    note: string;
  };
  /** Five-step checklist a founder can run today. */
  checklist: ReadonlyArray<string>;
  /** Three FAQs in AEO format. */
  faqs: ReadonlyArray<{ q: string; a: string }>;
  /** Related glossary terms to internally link. */
  relatedGlossary: ReadonlyArray<string>;
  /** ISO YYYY-MM-DD date the entry was last verified. */
  lastVerified: string;
}

export const WHY_ISNT_MY_ENTRIES: ReadonlyArray<WhyIsntMyEntry> = [
  {
    slug: "landing-page",
    element: "landing page",
    metaTitle: "Why Isn't My Landing Page Converting? (Founder Diagnostic)",
    metaDescription:
      "Three reasons a landing page stays flat: Wrong Person, Weak Offer, or Weak Belief. Diagnose yours in 90 seconds with the free Unlock SaaS read.",
    tldr:
      "Nine times out of ten, a landing page that won't convert is not a button-color or headline-word problem. It is a frame problem. The reader cannot tell who the page is for, what specifically they get, or why to trust the founder behind it. Until those three are answered above the fold, no copy tweak compounds.",
    diagnoses: [
      {
        label: "Wrong Person",
        appearance:
          "The hero copy describes the tool, not the reader. A founder reading it cannot tell within five seconds whether this is for them, their cousin, or an enterprise buyer.",
        fix: "Rewrite the hero as a single sentence that names the reader and the outcome: 'For [specific cohort] who [specific situation], this [does X].' If a stranger cannot guess the audience from the hero alone, the diagnosis stands.",
      },
      {
        label: "Weak Offer",
        appearance:
          "The page sells features ('AI-powered', 'real-time', 'unlimited'), not a stacked outcome. The reader cannot price the value because nothing on the page tells them what their flat Stripe line is worth in dollars.",
        fix: "Build a Stack Slide: list every deliverable, attach a number to each, total it, then anchor your price against the total. Without a stack, the price is the only number on the page, which is the worst possible frame.",
      },
      {
        label: "Weak Belief",
        appearance:
          "Zero proof element above the fold. No verified customer, no dated specific result, no founder-by-name accountability, no editorial-policy link. The reader has no reason to trust a name they've never heard.",
        fix: "Add one of: a Stripe-verified customer outcome (with permission), a dated specific number from your own usage, or a 60-day guarantee tied to a measurable event. Pick one and ship it today. Generic 'trusted by founders' badges do not move the needle.",
      },
    ],
    directionalRange: {
      range: "1% to 5%",
      note: "Cold-traffic landing pages for indie SaaS typically convert between 1% and 5% of qualified visitors. Below 1% almost always means Wrong Person traffic, not a page problem. Above 5% on cold traffic usually means warm-audience contamination – check the source.",
    },
    checklist: [
      "Read the hero out loud. Can a stranger guess the audience in one sentence?",
      "Count the proof elements above the fold. Zero is the most common failure mode.",
      "Find the price. If it's the first number on the page, you have no Stack.",
      "Open the page on mobile. Does the headline still load in the first viewport?",
      "Ask one Wrong Person target to read it. Their first question is your missing frame.",
    ],
    faqs: [
      {
        q: "How long should I wait before declaring a landing page broken?",
        a: "If 200 qualified visitors have hit the page with under 1% conversion, the page is the problem, not the traffic volume. Below 200 visitors, the sample size is too small to draw a conclusion either way.",
      },
      {
        q: "Should I A/B test or rewrite from scratch?",
        a: "Rewrite from scratch if conversion is below 1%. A/B testing optimizes a frame that already works. If the frame is wrong, you are A/B testing the wrong question. Above 2%, A/B test specific elements (headline, CTA copy, hero image).",
      },
      {
        q: "Does video on the landing page actually help?",
        a: "A short founder video (under 90 seconds) addressing Wrong Person, Weak Offer, or Weak Belief directly tends to lift conversion. A generic explainer video usually does not. The video must do work the page copy cannot.",
      },
    ],
    relatedGlossary: ["hook", "wrong-person", "weak-offer", "weak-belief"],
    lastVerified: "2026-05-19",
  },
  {
    slug: "checkout",
    element: "checkout",
    metaTitle: "Why Isn't My Checkout Converting? (Cart Diagnostic)",
    metaDescription:
      "Checkout abandonment is rarely about the form. It's about the moment the reader has to decide whether the price is fair. Diagnose yours in 90 seconds.",
    tldr:
      "Founders blame the checkout form, the payment processor, or the redirect lag. The real cause is usually upstream: the reader hit checkout without enough belief to make the price feel fair. A clean checkout cannot fix a missing Stack Slide on the page before it.",
    diagnoses: [
      {
        label: "Wrong Person",
        appearance:
          "Visitors are clicking 'Buy' to see the price, not to buy. Bounce rate at the checkout step is over 60%. The traffic was never qualified to begin with.",
        fix: "Move the price ABOVE the checkout. Either on the landing page hero or on a clearly labeled pricing section. A reader who hits checkout has already accepted the price. A reader who hits checkout to find the price will abandon.",
      },
      {
        label: "Weak Offer",
        appearance:
          "Reader reaches checkout, sees the price, and cannot quickly justify it. There is no Stack visible at the checkout step itself. The price is unanchored.",
        fix: "Add a 'What you get' panel beside the payment form. Three lines, each with a specific deliverable and a small dollar anchor. The reader should be able to total the value at the moment of payment.",
      },
      {
        label: "Weak Belief",
        appearance:
          "No risk-reversal at checkout. No guarantee terms. No specific dated proof. The reader is being asked to bet on a name they don't know.",
        fix: "Surface the guarantee at the checkout step, not buried in FAQ. State the trigger event ('refund issued if X does not happen by day 60') and the mechanism. Ambiguous guarantees feel weaker than specific ones, even when they're identical in practice.",
      },
    ],
    directionalRange: {
      range: "40% to 70%",
      note: "Cold-traffic checkout completion (button click to payment success) sits between 40% and 70% for paid indie SaaS. Below 40% means the offer is being relitigated at checkout. Above 70% on cold traffic usually means the price is too low to be a serious anchor.",
    },
    checklist: [
      "Open your checkout on mobile. Is the price visible without scrolling?",
      "Find your guarantee at the checkout step. If it's not there, it doesn't count.",
      "Count the form fields. Anything beyond email + payment is friction that needs justification.",
      "Test with a real card on a fresh device. Time it. Anything over 60 seconds is a problem.",
      "Check whether the receipt email arrives before the success page redirects. Trust hinges on that gap.",
    ],
    faqs: [
      {
        q: "Does adding more payment methods (Apple Pay, PayPal) help?",
        a: "Yes, but only marginally. Apple Pay lifts mobile completion by roughly 5 to 15 percentage points on warm traffic. It does not fix a Wrong Person or Weak Offer diagnosis. Add it after the upstream causes are fixed, not before.",
      },
      {
        q: "Should I show the price before the checkout step?",
        a: "Always. Hiding the price until checkout is a Wrong Person filter dressed as a UX choice. It filters in price-shoppers and filters out qualified buyers who want to confirm they're in the right room.",
      },
      {
        q: "Why are my abandoned cart emails not recovering anyone?",
        a: "Most cart-recovery sequences address the wrong objection. They offer a discount ('come back, here's 10% off') when the reader abandoned for a Weak Belief reason. Address the missing proof element instead. A founder reply often outperforms a discount.",
      },
    ],
    relatedGlossary: ["offer", "stack-slide", "weak-offer"],
    lastVerified: "2026-05-19",
  },
  {
    slug: "upsell",
    element: "upsell",
    metaTitle: "Why Isn't My Upsell Converting? (OTO Diagnostic)",
    metaDescription:
      "Upsells fail when they violate the buyer's just-decided frame. Three Brunson-framework reasons your OTO isn't taking, and the fix for each.",
    tldr:
      "An upsell that won't convert is almost always asking the buyer to make a different decision than the one they just made. The OTO has to extend the same decision, not introduce a new one. Once the frame breaks, conversion drops to under 5% regardless of the offer's actual value.",
    diagnoses: [
      {
        label: "Wrong Person",
        appearance:
          "The OTO offer is for a different cohort than the front-end buyer. The buyer just paid for a $1 starter and the upsell is a $497 done-with-you program. Frame mismatch.",
        fix: "Rewrite the OTO to extend the front-end buyer's stated decision. If they bought the $1 Starter to 'pin one real customer', the OTO is 'pin three customers, $19'. Not 'become a full-funnel expert, $497'.",
      },
      {
        label: "Weak Offer",
        appearance:
          "The OTO copy reintroduces the entire pitch. Long pages, video, testimonials. The buyer already said yes – they want a quick decision, not a second sales argument.",
        fix: "Cut the OTO page to under 200 words. One outcome, one Stack, one price. The OTO inherits trust from the front-end purchase. Don't re-pitch what's already won.",
      },
      {
        label: "Weak Belief",
        appearance:
          "The OTO terms are ambiguous compared to the front-end. The front-end had a clean 60-day guarantee; the OTO says 'no refunds on upgrades'. The buyer's just-built trust collapses.",
        fix: "Mirror the front-end's risk-reversal exactly. If the front-end guarantees outcome X by day 60, the OTO guarantees outcome Y by day Z under the same terms. Any asymmetry reads as a trap.",
      },
    ],
    directionalRange: {
      range: "15% to 35%",
      note: "OTO take rates between 15% and 35% are healthy for an aligned upsell. Below 15% almost always means frame mismatch. Above 35% usually means the front-end was underpriced and the OTO is doing the work the entry price should have.",
    },
    checklist: [
      "Read the OTO copy. Does it extend the decision the buyer just made, or introduce a new one?",
      "Count words on the OTO page. Over 400 is almost always too many.",
      "Check the OTO's guarantee against the front-end's. Mismatch is a trust break.",
      "Time how long it takes a buyer to reach the OTO. Anything over 8 seconds after payment is friction.",
      "Look at the OTO's H1. If it's about a new outcome, you have a frame break.",
    ],
    faqs: [
      {
        q: "Should the OTO be more expensive or less expensive than the front-end?",
        a: "Either works. Less-expensive OTOs (the 'order bump' pattern, $7 to $19 add-ons) take at 30 to 50% reliably. More-expensive OTOs need to extend the front-end's outcome, not multiply it. A 50x price jump almost never converts on the OTO step itself.",
      },
      {
        q: "How many OTO steps should I have?",
        a: "One. Two at most. Every additional OTO step drops conversion 30 to 60% from the prior step. The math compounds against you fast. Use a follow-up email sequence for additional offers instead.",
      },
      {
        q: "Should the OTO have a countdown timer?",
        a: "Only if it's real. A real countdown ('this offer disappears in 15 minutes') tied to a real expiry can lift OTO take by 5 to 10 percentage points. A fake countdown that resets on refresh hurts trust permanently.",
      },
    ],
    relatedGlossary: ["offer", "stack-slide", "weak-belief"],
    lastVerified: "2026-05-19",
  },
  {
    slug: "opt-in",
    element: "email opt-in",
    metaTitle: "Why Isn't My Opt-In Converting? (Lead Magnet Diagnostic)",
    metaDescription:
      "Email opt-ins fail when the lead magnet promises a feeling, not a specific outcome. Three diagnoses and the fix for each.",
    tldr:
      "Opt-in pages convert when the magnet promises one specific outcome the reader can finish in one sitting. Most flat opt-ins promise vague benefits ('grow your business', 'master your funnel') that the reader cannot picture in their inbox. The fix is specificity, not better design.",
    diagnoses: [
      {
        label: "Wrong Person",
        appearance:
          "The lead magnet promises a broad outcome with no named cohort. Anyone could be the reader. Nobody feels addressed.",
        fix: "Name the cohort in the magnet title. 'The 5 funnel mistakes pre-revenue SaaS founders make' converts. 'Grow your business' does not. Specificity in the title compounds throughout the form.",
      },
      {
        label: "Weak Offer",
        appearance:
          "The magnet promises a 'guide' or 'masterclass' instead of a specific finished thing. Readers cannot picture what they'll receive or how long it'll take to consume.",
        fix: "Promise a finished artifact, not a process. 'A 1-page diagnostic you fill out in 7 minutes' beats 'A complete guide to funnel optimization'. The reader needs to see the end state before they trade their email.",
      },
      {
        label: "Weak Belief",
        appearance:
          "No proof of the founder's authority on this specific topic. Generic 'subscribe to my newsletter' framing. Reader has no reason to trade an email for this specific name.",
        fix: "Add a one-line founder credential tied to the magnet's outcome. 'Written by [name], who teardown 41 indie SaaS pages.' One specific dated proof beats every generic 'expert' claim.",
      },
    ],
    directionalRange: {
      range: "15% to 40%",
      note: "Specific lead magnets to qualified traffic convert at 15 to 40%. Generic newsletter sign-ups convert at 1 to 5%. The 10x difference is the magnet specificity, not the form design.",
    },
    checklist: [
      "Read the magnet title aloud. Can a reader picture exactly what they'll receive?",
      "Count fields on the form. Over two (email + name) reduces conversion 10 to 25%.",
      "Check the confirmation step. Does the magnet arrive in under 60 seconds?",
      "Look at your opt-in source breakdown. Cold traffic vs warm should look different.",
      "Test the unsubscribe rate. Over 5% on the first email means the magnet over-promised.",
    ],
    faqs: [
      {
        q: "Should I use a popup or an inline opt-in?",
        a: "Both. Inline opt-ins inside articles convert at 1 to 3% reliably. Exit-intent popups add another 1 to 2% without cannibalizing inline. Don't use timed popups – they punish engaged readers.",
      },
      {
        q: "How long should my magnet be?",
        a: "Short enough to finish in one sitting. A 1-page diagnostic, a 5-minute video, a single checklist. 30-page eBooks rarely get opened. The magnet's job is to start a relationship, not prove your expertise upfront.",
      },
      {
        q: "Should I require double opt-in?",
        a: "Yes, for deliverability hygiene. Double opt-in reduces list size 10 to 20% but improves inbox placement for the remaining list dramatically. The economics favor a smaller cleaner list almost every time.",
      },
    ],
    relatedGlossary: ["hook", "soap-opera-sequence"],
    lastVerified: "2026-05-19",
  },
  {
    slug: "vsl",
    element: "video sales letter",
    metaTitle: "Why Isn't My VSL Converting? (Video Sales Letter Fix)",
    metaDescription:
      "VSLs fail in the first 30 seconds when the hook is generic. Three Brunson-framework diagnoses and the fix for each.",
    tldr:
      "Most VSLs fail in the opening 30 seconds. The hook is vague, the founder takes too long to name the audience, and the reader bounces before the offer is ever mentioned. A VSL that won't convert is almost always a hook problem, not a length or production-quality problem.",
    diagnoses: [
      {
        label: "Wrong Person",
        appearance:
          "The first 15 seconds describe the founder, the product, or 'the industry'. The reader hasn't been told it's for them yet.",
        fix: "Open with the audience, not the founder. 'If you've launched a SaaS, got 50 sign-ups, and 0 paying customers, this is for you.' Audience-first hooks lift VSL completion 30 to 60%.",
      },
      {
        label: "Weak Offer",
        appearance:
          "The VSL describes the product extensively but never builds a Stack. The reader hears a list of features, not a totaled value.",
        fix: "Hit the Stack Slide at the 60% mark of the VSL. Six to twelve deliverables, each anchored at a small dollar number, totaled, then your price stated as a fraction of the total. This is the load-bearing structural move.",
      },
      {
        label: "Weak Belief",
        appearance:
          "No customer voice in the VSL. No specific dated proof. Just the founder talking.",
        fix: "Insert one 15-second customer clip at the 70% mark. If you don't have one, replace it with a dated specific number from your own usage ('I ran this on 41 pages between January and April') and an editorial-policy link in the description.",
      },
    ],
    directionalRange: {
      range: "30% to 60%",
      note: "VSL completion (watching past the offer reveal) sits between 30 and 60% for engaged traffic. Below 30% completion means the hook is broken. Above 60% on cold traffic usually means the VSL is too short to do any real selling.",
    },
    checklist: [
      "Watch your VSL on mobile with sound off. Does the audience know it's for them in the first 5 seconds?",
      "Time the offer reveal. Anything past 80% of the runtime is probably too late.",
      "Count proof elements. Zero is the most common failure mode.",
      "Check the description for editorial policy and guarantee links. Trust signals belong below the player.",
      "Look at your retention curve. The drop-off point is the moment your hook broke.",
    ],
    faqs: [
      {
        q: "How long should my VSL be?",
        a: "Between 8 and 22 minutes for paid offers under $100. Between 22 and 45 minutes for offers between $100 and $1,000. Shorter than 8 minutes rarely builds enough belief; longer than 45 minutes loses cold traffic almost always.",
      },
      {
        q: "Should I show my face on the VSL?",
        a: "Yes, at the opening and at the offer reveal. The reader buys the founder before they buy the offer. Slide-only VSLs convert 20 to 40% less than face-on-camera VSLs for indie SaaS specifically.",
      },
      {
        q: "Should I use a fake-live VSL with simulated chat?",
        a: "No. Fake-live VSLs are a Weak Belief signal disguised as a Weak Offer fix. The few extra conversions they generate cost permanent trust on the back end. Use a real-live webinar if you want the live dynamic.",
      },
    ],
    relatedGlossary: ["hook", "story", "offer", "stack-slide"],
    lastVerified: "2026-05-19",
  },
  {
    slug: "tripwire",
    element: "tripwire",
    metaTitle: "Why Isn't My Tripwire Converting? ($1 Offer Diagnostic)",
    metaDescription:
      "Tripwires fail when they feel like a trap. Three reasons your $1 to $27 entry offer isn't taking, plus the Brunson-framework fix.",
    tldr:
      "Tripwires convert when the price feels like a deliberate filter, not a discount or a trick. A $1 entry that promises a $500 outcome will underconvert because the math feels fake. A $1 entry that promises a $5 outcome will overconvert but bring in the wrong cohort. The price has to match the promise.",
    diagnoses: [
      {
        label: "Wrong Person",
        appearance:
          "The tripwire promise is too big for the price. '$1 to unlock the complete funnel system' triggers skepticism. Readers assume there's a trap.",
        fix: "Right-size the promise. A $1 tripwire should unlock one specific finished thing, not 'everything'. The Unlock SaaS Starter promises 'Steps 1 and 2 of the Playbook' – the math feels honest.",
      },
      {
        label: "Weak Offer",
        appearance:
          "The tripwire and the core product are not connected by an obvious next step. The buyer pays $1, gets something, and doesn't know what comes next.",
        fix: "Build the natural-next-step. The tripwire should leave the buyer at a moment where the core product is the obvious continuation. Without that, the tripwire is a one-shot, not a ladder rung.",
      },
      {
        label: "Weak Belief",
        appearance:
          "No risk-reversal on the tripwire. Reader assumes a $1 charge will turn into a hidden subscription. Stripe complaint rates spike.",
        fix: "State 'one-time charge, no subscription, no upsell to a payment plan' verbatim on the buy button. Add a clean one-click refund mechanism. Tripwires live or die on whether they feel like a trap.",
      },
    ],
    directionalRange: {
      range: "3% to 12%",
      note: "Cold-traffic tripwire conversion sits between 3 and 12% for SaaS tripwires under $10. Below 3% means the trap-feel is winning. Above 12% means the tripwire is filtering in tire-kickers who never upgrade.",
    },
    checklist: [
      "Read the tripwire promise out loud. Does the math feel fair?",
      "Check the buy button copy. Does it state 'one-time, no subscription' explicitly?",
      "Time the post-purchase delivery. Anything over 90 seconds erodes trust.",
      "Look at your tripwire-to-core conversion rate. Under 5% means the ladder is broken.",
      "Check Stripe dispute rate. Over 0.5% on a tripwire is a trap-feel signal, not a fraud signal.",
    ],
    faqs: [
      {
        q: "Should my tripwire be $1, $7, or $27?",
        a: "$1 if the promise is a tightly-scoped finished thing (one diagnostic, one template). $7 to $27 if the promise is a multi-day commitment (a 5-day mini-course, a workbook). The price must match the unit of value being delivered.",
      },
      {
        q: "Should the tripwire have an upsell immediately after?",
        a: "Yes, but with a different frame than the tripwire itself. The buyer just decided to spend $1; the OTO should extend that same decision, not introduce a $497 premium offer they haven't been frame-set for.",
      },
      {
        q: "How long should buyers stay on the tripwire before upgrading?",
        a: "Typically 7 to 21 days for indie SaaS tripwires. Sooner usually means the buyer was already pre-sold; later usually means the natural-next-step isn't well-defined. The 7 to 21 day window is the sweet spot for follow-up sequences to do their work.",
      },
    ],
    relatedGlossary: ["offer", "value-ladder"],
    lastVerified: "2026-05-19",
  },
  {
    slug: "webinar-registration",
    element: "webinar registration",
    metaTitle: "Why Isn't My Webinar Registration Converting?",
    metaDescription:
      "Webinar registration pages fail when the title sells the topic, not the transformation. Three diagnoses and the Perfect Webinar fix.",
    tldr:
      "Webinar registration pages convert on the title alone in most cases. If the title doesn't promise a transformation, no amount of registration-page copy fixes the underlying frame. The title is the offer at the registration step. Everything else is supporting evidence.",
    diagnoses: [
      {
        label: "Wrong Person",
        appearance:
          "The webinar title is topic-shaped, not transformation-shaped. 'How to use AI in your SaaS' is a topic. 'How I added $5K MRR in 30 days using a Claude-powered onboarding flow' is a transformation.",
        fix: "Rewrite the title as a specific outcome with a timeframe and a mechanism. 'How [audience] [achieves outcome] in [time] using [mechanism]'. The Perfect Webinar title formula is load-bearing.",
      },
      {
        label: "Weak Offer",
        appearance:
          "The registration page describes what the webinar will cover, not what the attendee will walk away with. The reader can't see the end state.",
        fix: "List three 'You will leave with' bullets, each a specific finished artifact (a filled-in template, a worked example, a one-page plan). The reader needs to see the takeaway before they trade their time.",
      },
      {
        label: "Weak Belief",
        appearance:
          "No founder credibility tied to the webinar's specific topic. Generic 'expert' framing. No dated proof of the transformation the title promises.",
        fix: "Add one specific dated proof line: 'I ran this exact sequence on 41 indie SaaS pages between January and April 2026.' One specific dated number beats every credential, badge, or 'as seen in' bar.",
      },
    ],
    directionalRange: {
      range: "20% to 45%",
      note: "Webinar registration rates from cold traffic sit between 20 and 45% for sharply-titled webinars. Below 20% almost always means the title is topic-shaped. Above 45% usually means the title over-promises and show-up rates will collapse.",
    },
    checklist: [
      "Read your webinar title out loud. Does it promise a specific outcome in a specific timeframe?",
      "Count 'you will leave with' bullets on the registration page. Three specific finished artifacts is the target.",
      "Check the date/time prominence. If the next session isn't visible above the fold, registration drops.",
      "Verify the confirmation email arrives in under 60 seconds.",
      "Look at registration-to-show-up ratio. Under 30% means the title over-promised; over 60% means it under-promised.",
    ],
    faqs: [
      {
        q: "Should I run live or evergreen webinars?",
        a: "Live for the first 5 to 10 sessions to iterate the script with real audience reactions. Evergreen after that. A live webinar that's never been refined is worse than a polished evergreen. The script comes first; the delivery format comes second.",
      },
      {
        q: "How long should my webinar be?",
        a: "60 to 90 minutes for paid offers between $97 and $997. Shorter than 60 minutes rarely builds enough belief; longer than 90 minutes loses attendees. Pricing above $997 typically needs a multi-session sequence, not one long webinar.",
      },
      {
        q: "Should I offer a replay?",
        a: "Yes, with a 48-hour expiry. Replays without an expiry signal that the live session didn't matter and crush show-up rates on the next live. The 48-hour replay window is the Brunson Perfect Webinar pattern for a reason.",
      },
    ],
    relatedGlossary: ["perfect-webinar", "hook", "story", "offer"],
    lastVerified: "2026-05-19",
  },
  {
    slug: "email-open",
    element: "email open rate",
    metaTitle: "Why Isn't My Email Open Rate Higher? (Sender + Subject Fix)",
    metaDescription:
      "Email opens depend on three things: sender reputation, sender name, and subject. Three diagnoses and the deliverability-first fix.",
    tldr:
      "Email open rates are 80% sender, 20% subject. A flat open rate is almost always a deliverability problem first and a subject-line problem second. Founders rewrite subject lines for weeks when the actual fix is authenticating the domain and warming the sender.",
    diagnoses: [
      {
        label: "Wrong Person",
        appearance:
          "The list was acquired from cold scraping, a 'free traffic' source, or a partner swap. Open rates start at 15 to 20% and decline weekly.",
        fix: "Stop sending to the bottom 30% of the list (no engagement in 90 days). Re-engage with a single 'still want this?' email; segment the rest out. Sending to a disengaged list damages sender reputation faster than any subject line can recover.",
      },
      {
        label: "Weak Offer",
        appearance:
          "Subject lines are vague or 'newsletter-shaped'. 'Weekly digest #42' or 'May update' get under 25% opens consistently. The subject line doesn't promise anything specific.",
        fix: "Rewrite subject lines as specific deliverables or specific questions. 'The 1-page Stack template I just published' beats 'Weekly digest'. 'Did this work for you?' beats 'May newsletter'. Specificity in the subject is the second-order fix after deliverability.",
      },
      {
        label: "Weak Belief",
        appearance:
          "Sender name is the brand, not the founder ('Unlock SaaS Team'). Reader has no relationship with the brand and doesn't open. Founder-name emails outperform brand-name emails by 15 to 40% on average.",
        fix: "Send from the founder's name and address. 'Maryan from Unlock SaaS' beats 'Unlock SaaS Team' by 15 to 40% on opens. The reader buys the relationship before the brand.",
      },
    ],
    directionalRange: {
      range: "30% to 55%",
      note: "Engaged-list open rates for indie SaaS founder emails sit between 30 and 55%. Below 30% is almost always a deliverability or sender-name issue. Above 55% usually means the list is small and tightly curated, not large and broadly engaged.",
    },
    checklist: [
      "Run your sending domain through mail-tester.com. Score below 8/10 is a deliverability problem.",
      "Check SPF, DKIM, and DMARC are all aligned. One misalignment costs 5 to 15 percentage points.",
      "Look at your sender name. If it's the brand, switch to a person's name for one send and measure.",
      "Segment out the disengaged tail (no opens in 90 days). Send to engaged segment only for 2 weeks.",
      "Test one specific subject vs your usual subject on the same segment. Significance threshold is 200+ opens.",
    ],
    faqs: [
      {
        q: "Should I use emoji in subject lines?",
        a: "Sparingly. One emoji at the start of a subject can lift opens 5 to 10% on first send. Reused weekly, the same emoji loses signal value within a month. Save it for the email that actually matters.",
      },
      {
        q: "How often should I send to my list?",
        a: "Two to four sends per week for an engaged list. Less than once a week and reputation decays. More than five times a week and unsubscribes climb. The Brunson Soap Opera and Seinfeld patterns sit comfortably in the 3 to 4 per week range.",
      },
      {
        q: "Does the time of day matter?",
        a: "Less than founders think. A 2-hour delay either way moves opens 1 to 3 percentage points. Subject line and sender name move opens 10 to 40 percentage points. Focus on the right axis first.",
      },
    ],
    relatedGlossary: ["soap-opera-sequence", "seinfeld-email"],
    lastVerified: "2026-05-19",
  },
];

export const WHY_ISNT_MY_SLUGS = WHY_ISNT_MY_ENTRIES.map((e) => e.slug);

export function getWhyIsntMyBySlug(slug: string): WhyIsntMyEntry | undefined {
  return WHY_ISNT_MY_ENTRIES.find((e) => e.slug === slug);
}
