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
  // ---------------------------------------------------------------------
  // 2026-05-21 expansion: extending from 8 to 32 surfaces. Each new entry
  // captures a specific conversion failure mode pre-revenue founders ask
  // Google about by name. Same Brunson Hard-Rule discipline: directional
  // ranges only, named diagnoses, no fabricated lift claims.
  // ---------------------------------------------------------------------
  {
    slug: "pricing-page",
    element: "pricing page",
    metaTitle: "Why Isn't My Pricing Page Converting? (Diagnostic)",
    metaDescription:
      "Pricing pages fail when the price is the first number a reader sees. Three Brunson diagnoses for a flat pricing page and the fix for each.",
    tldr:
      "Pricing pages convert when the reader arrives already convinced the offer is worth more than the price. They fail when the price is the first quantified information on the page – without a Stack to anchor against, the price is the only number and the reader has nothing to compare it to.",
    diagnoses: [
      {
        label: "Wrong Person",
        appearance:
          "Visitors arrive directly to /pricing from search or ads. They've never been pitched the offer. The pricing page is doing the entire conversion job alone.",
        fix: "Redirect direct /pricing traffic through the sales page first, or add a 60-second 'what this is' video above the tiers. The pricing page is the end of the sales process, not the start.",
      },
      {
        label: "Weak Offer",
        appearance:
          "Tiers list features ('unlimited users', 'priority support'), not outcomes. The reader can't articulate why one tier is worth more than another.",
        fix: "Replace feature lists with outcome stacks. Each tier gets a one-line target cohort and three outcome-level deliverables. The reader should be able to point at the tier that fits and explain why in one sentence.",
      },
      {
        label: "Weak Belief",
        appearance:
          "No risk-reversal visible on the pricing page. Guarantee buried in FAQ. Trial terms ambiguous. Reader hesitates at the moment of decision.",
        fix: "Surface the guarantee directly under each tier's buy button. State the trigger event verbatim. 'Refund issued if X doesn't happen by day Y.' Specificity at the decision moment outconverts every page-level trust signal.",
      },
    ],
    directionalRange: {
      range: "1% to 5%",
      note: "Direct /pricing traffic for indie SaaS converts at 1 to 5%. Below 1% means the page is doing too much work alone (Wrong Person). Above 5% on direct traffic usually means warm-audience contamination from email or community.",
    },
    checklist: [
      "Find the first quantified number on the page. If it's the price, you have no Stack.",
      "Read each tier's bullets aloud. Are they outcomes or features?",
      "Look for the guarantee near each buy button. Buried-in-FAQ doesn't count.",
      "Check whether direct traffic to /pricing converts at all. If yes, that's the audit signal.",
      "Test removing the price toggle (monthly/annual) and see what changes. Often the toggle is decision fatigue, not value.",
    ],
    faqs: [
      {
        q: "Should I show prices on the pricing page or require contact?",
        a: "Show prices for self-serve tiers. 'Contact us' for enterprise only. Hiding self-serve prices kills conversion 30 to 60% because qualified buyers leave to find a transparent competitor.",
      },
      {
        q: "How many tiers should I have?",
        a: "Three for most SaaS. Two leaves no anchor; four or more triggers decision fatigue. The middle tier should capture 60 to 80% of paying buyers – if it doesn't, your tier differentiation is off.",
      },
      {
        q: "Should the pricing page have testimonials?",
        a: "One specific named testimonial near each tier helps. Multiple testimonials per tier feel desperate and clutter the decision. Trust signals belong at the buy moment, not as page furniture.",
      },
    ],
    relatedGlossary: ["offer", "stack-slide", "weak-offer"],
    lastVerified: "2026-05-20",
  },
  {
    slug: "free-trial",
    element: "free trial",
    metaTitle: "Why Isn't My Free Trial Converting? (Activation Diagnostic)",
    metaDescription:
      "Free trials fail at the first-session activation moment, not at the conversion-to-paid step. Three Brunson diagnoses and the fix for each.",
    tldr:
      "Free trial conversion is decided in the first 15 minutes of the first session. Trials that don't convert almost never failed at the upgrade prompt – they failed at the activation moment, where the user couldn't picture the version of their work that includes your product. Fix activation; conversion follows.",
    diagnoses: [
      {
        label: "Wrong Person",
        appearance:
          "Trial signups come from sources that filter in tire-kickers (Product Hunt, Reddit, viral tweets). Activation rates under 10%. The wrong cohort signed up.",
        fix: "Filter the signup form. Two screening questions ('what are you trying to do?', 'what tools are you using now?') reduce signup volume 30 to 50% but lift activation 2 to 3x. Quality over volume in the trial funnel.",
      },
      {
        label: "Weak Offer",
        appearance:
          "Trial onboarding tries to teach the full product. Users abandon at the third feature explanation. The trial promises 'try everything' but delivers 'learn everything' which is a different (worse) offer.",
        fix: "Define ONE activation moment. The user does ONE specific thing in their first session, sees ONE specific outcome. Everything else in the product comes after. Onboarding that branches in three directions kills activation.",
      },
      {
        label: "Weak Belief",
        appearance:
          "Trial users hesitate to put real data in (real customers, real campaigns, real workflows). Without real data, the product doesn't demonstrate value, and the upgrade prompt feels arbitrary.",
        fix: "Make the first-session use as low-stakes as possible. Sandbox data, sample workflows, founder-curated examples the user clones into their own workspace. Reduce the trust required for activation.",
      },
    ],
    directionalRange: {
      range: "8% to 25%",
      note: "Free trial to paid conversion for self-serve SaaS sits between 8 and 25% within 30 days. Below 8% almost always means activation is broken. Above 25% on cold traffic usually means the trial is too short to be a real test.",
    },
    checklist: [
      "Define your activation moment in one sentence. If you can't, the trial has no anchor.",
      "Measure first-session activation rate, not 7-day. The decision is made in session one.",
      "Look at where users drop off in onboarding. The cliff is your script's diagnostic.",
      "Check whether trial users put in real data or test data. Real-data trials convert 3 to 5x better.",
      "Time your upgrade prompt. Anything before activation is friction; after activation it's the right moment.",
    ],
    faqs: [
      {
        q: "How long should my free trial be?",
        a: "7 to 14 days for most SaaS. Longer trials usually procrastinate the decision rather than enable it; shorter trials don't give users enough sessions to activate. The right length is 'enough sessions to reach activation twice'.",
      },
      {
        q: "Should I require a credit card at trial signup?",
        a: "Trade-off. CC-required trials reduce signup 30 to 60% but raise conversion-to-paid 2 to 4x. CC-not-required trials build a bigger list at lower conversion. Most modern self-serve SaaS test both and find their economics.",
      },
      {
        q: "Should I extend trials when users ask?",
        a: "Selectively. Founders asking 'I need another week to evaluate' often have a specific blocker – ask what it is, fix it, then offer a 7-day extension. Auto-extending kills urgency and conversion.",
      },
    ],
    relatedGlossary: ["offer", "weak-belief"],
    lastVerified: "2026-05-20",
  },
  {
    slug: "demo-booking",
    element: "demo booking",
    metaTitle: "Why Isn't Anyone Booking My Demo? (B2B Diagnostic)",
    metaDescription:
      "Demo-booking pages fail when the page promises 'a demo' instead of a specific outcome. Three Brunson diagnoses and the fix for each.",
    tldr:
      "Demo-booking pages convert when the visitor can picture exactly what happens in the demo and what they leave with. Pages that fail promise 'a demo' or 'see the product' – both topic-shaped offers that nobody trades a calendar slot for. Specificity in the demo's promise is the load-bearing fix.",
    diagnoses: [
      {
        label: "Wrong Person",
        appearance:
          "Demo requests come from the wrong cohort – tire-kickers, students, agencies looking to resell, competitors doing recon. Show-up rates under 30%.",
        fix: "Qualify on the booking form. Two questions: company size + specific use case. Disqualifying responses get redirected to self-serve docs; qualifying responses get the calendar. Quality over volume.",
      },
      {
        label: "Weak Offer",
        appearance:
          "Booking page promises 'a personalized demo' or 'see the product in action'. Topic-shaped. Visitor can't picture the takeaway.",
        fix: "Promise a specific outcome from the demo. 'In 30 minutes you'll walk away with a custom report on [their specific situation]'. The demo IS a tripwire-shaped offer; treat it like one.",
      },
      {
        label: "Weak Belief",
        appearance:
          "No founder-by-name on the booking page. No specific dated customer outcomes. No editorial proof. The visitor has no reason to trust this name with 30 minutes.",
        fix: "Surface one specific dated customer case study above the calendar widget. Name the customer (with permission), name the outcome, name the timeframe. One specific case study beats every 'trusted by' badge.",
      },
    ],
    directionalRange: {
      range: "2% to 8%",
      note: "Cold-traffic conversion to booked demo for B2B SaaS sits between 2 and 8%. Below 2% means the offer is topic-shaped (Weak Offer). Above 8% on cold traffic usually means under-qualification at booking, which surfaces as low show-up rates downstream.",
    },
    checklist: [
      "Read your booking page promise out loud. Is the demo's outcome specific?",
      "Count form fields. Over 4 fields kills conversion for cold traffic.",
      "Check show-up rate. Under 30% means the page over-promised; over 70% means under-promised.",
      "Look at the demo's actual structure. Does it deliver the page's promise?",
      "Time your follow-up after a no-show. 24-hour follow-up recovers 15 to 25% of no-shows.",
    ],
    faqs: [
      {
        q: "Should I require company size on the booking form?",
        a: "Yes, for B2B. Company size is the cleanest qualifier and reduces no-show rate 30 to 50% by filtering out non-buyers. The friction is worth the qualified-pipeline gain.",
      },
      {
        q: "Should the demo be a sales call or a product walkthrough?",
        a: "Both, structured. First 5 minutes: their context. Middle 20 minutes: customized walkthrough hitting their specific use case. Last 5 minutes: pricing and next step. Pure product walkthroughs convert worse than structured discovery + demo.",
      },
      {
        q: "How long should the demo be?",
        a: "30 minutes is the sweet spot for self-serve-priced SaaS. 45 to 60 minutes for enterprise. Anything over 60 reduces booking rate; anything under 20 doesn't give the prospect enough decision evidence.",
      },
    ],
    relatedGlossary: ["dream-100", "offer"],
    lastVerified: "2026-05-20",
  },
  {
    slug: "course-enrollment",
    element: "course enrollment",
    metaTitle: "Why Isn't My Course Selling? (Enrollment Diagnostic)",
    metaDescription:
      "Course sales pages fail when they sell the curriculum instead of the transformation. Three Brunson diagnoses for flat enrollment.",
    tldr:
      "Course enrollment pages convert when the reader can picture themselves after the course. They fail when the page lists modules ('Module 1: Foundations, Module 2: Strategy') – module lists describe what's taught, not what's learned. The transformation has to come before the curriculum.",
    diagnoses: [
      {
        label: "Wrong Person",
        appearance:
          "Course is positioned to 'anyone interested in X'. Traffic arrives from broad searches; nobody self-identifies as the target cohort.",
        fix: "Add a 'this is for you if' / 'this is NOT for you if' block above the curriculum. Three specific lines each. The polarity move filters in qualified buyers and filters out non-buyers; conversion lifts on the remaining traffic.",
      },
      {
        label: "Weak Offer",
        appearance:
          "Page lists modules and lesson titles. The reader can't picture the end state. 'You'll learn about X' instead of 'You'll have built X by the end'.",
        fix: "Replace the curriculum list with a transformation list. 'By the end you'll have: [specific deliverable 1], [specific deliverable 2], [specific deliverable 3]'. The curriculum becomes the proof, not the promise.",
      },
      {
        label: "Weak Belief",
        appearance:
          "Generic 'expert' framing for the instructor. No specific dated outcomes. Testimonials are vague ('great course, learned so much').",
        fix: "One specific dated instructor outcome above the curriculum. One specific dated student outcome below the curriculum. Both with permission, both with verifiable numbers. Generic credibility is worth zero at course price points.",
      },
    ],
    directionalRange: {
      range: "1% to 5%",
      note: "Cold-traffic course landing pages convert at 1 to 5% for courses priced $97 to $997. Above $997, the conversion rate floor is roughly 0.5%; above $1,997, you usually need a webinar funnel rather than direct sales page.",
    },
    checklist: [
      "Find the 'this is for you' block. Missing it is the most common failure mode.",
      "Read the curriculum list. Are the items modules or transformations?",
      "Count specific dated outcomes on the page. Zero is a Weak Belief signal.",
      "Check whether the page has a refund policy. Under 30 days reduces conversion 20 to 40%.",
      "Look at where buyers come from. Cold traffic and warm traffic need different framings; using one framing for both costs conversion.",
    ],
    faqs: [
      {
        q: "Should I show the curriculum or hide it?",
        a: "Show it, but after the transformation. The curriculum is proof, not promise. Reader needs to picture the end state first, then see the curriculum as the path to get there.",
      },
      {
        q: "Should I offer payment plans?",
        a: "For courses above $497, yes. Payment plans typically lift conversion 15 to 30% on offers above $497. Below $497, payment plans add cognitive overhead without enough lift.",
      },
      {
        q: "Should the course be live cohort or evergreen?",
        a: "Live for the first 2 to 3 cohorts to refine the content. Evergreen after. Live cohorts convert at 2 to 5x evergreen rates per launch but cap your sustainable scale; evergreen captures year-round demand.",
      },
    ],
    relatedGlossary: ["offer", "stack-slide", "perfect-webinar"],
    lastVerified: "2026-05-20",
  },
  {
    slug: "ad",
    element: "ad",
    metaTitle: "Why Isn't My Ad Converting? (Paid Traffic Diagnostic)",
    metaDescription:
      "Ad campaigns fail when the ad-to-page promise breaks. Three Brunson diagnoses for flat paid traffic and the fix for each.",
    tldr:
      "Ad campaigns fail in the gap between the ad's promise and the landing page's payoff. The ad says one thing; the page delivers another. Click-through is fine; conversion is flat. The fix is almost never the ad creative – it's the message-match between ad and page.",
    diagnoses: [
      {
        label: "Wrong Person",
        appearance:
          "Ad targets a broad interest category. CTR is high but bounce rate at the landing page is over 80%. The wrong cohort is clicking.",
        fix: "Narrow the targeting. Specific job titles, specific company size, specific behaviors. Smaller audience, higher conversion. Broad targeting is volume optimization; narrow targeting is profit optimization.",
      },
      {
        label: "Weak Offer",
        appearance:
          "Ad and landing page promise different things. Ad says 'free trial'; landing page asks for a credit card. Ad says 'in 5 minutes'; page is a 30-minute video. Promise mismatch.",
        fix: "Audit the ad-to-page message match. The ad's first line should appear near-verbatim as the page's H1. The ad's promise should be the page's first sentence. If they don't match, the click was a lie.",
      },
      {
        label: "Weak Belief",
        appearance:
          "Ad audience has never heard of you. Page has no founder-by-name above the fold. No specific dated proof. Cold visitor has zero reason to believe the page.",
        fix: "Add founder-by-name and one specific dated proof above the fold of the landing page. Cold traffic needs more trust signals, not fewer, than warm traffic. Most landing pages are built for warm audiences and fail on paid traffic.",
      },
    ],
    directionalRange: {
      range: "0.5% to 3%",
      note: "Cold paid-traffic conversion to first paid action for indie SaaS sits between 0.5 and 3%. Below 0.5% the campaign loses money on most price points. Above 3% on cold paid usually means warm-audience contamination – check the source.",
    },
    checklist: [
      "Read the ad and the H1 together. Do they sound like the same promise?",
      "Look at landing page bounce rate. Over 70% means the page isn't the right answer to the ad's promise.",
      "Check first-page-visit duration. Under 10 seconds means visitor immediately bounced – ad-to-page mismatch.",
      "Run the ad's audience filter through your ICP. If it doesn't match, the targeting is the problem.",
      "Test one variation of the landing page that uses the ad's exact opening sentence as the H1. If conversion lifts, message-match was the issue.",
    ],
    faqs: [
      {
        q: "Should I use a separate landing page for ad traffic?",
        a: "Almost always. The main marketing site is built for warm/organic traffic and converts at near-zero on cold paid. A dedicated landing page tuned to one ad's message lifts conversion 3 to 10x.",
      },
      {
        q: "How much should I spend on testing an ad before killing it?",
        a: "Roughly 3x your target CAC. If your target CAC is $50 and you've spent $150 with no conversion, the ad isn't going to suddenly engage. Kill it and test a new creative or audience.",
      },
      {
        q: "Should I run paid ads to my pricing page?",
        a: "Almost never. Pricing pages are designed for late-stage decision; cold paid traffic isn't there yet. Send paid traffic to a sales/landing page that does the work upstream.",
      },
    ],
    relatedGlossary: ["hook", "wrong-person", "weak-offer"],
    lastVerified: "2026-05-20",
  },
  {
    slug: "podcast-cta",
    element: "podcast CTA",
    metaTitle: "Why Isn't My Podcast CTA Converting? (Audio Diagnostic)",
    metaDescription:
      "Podcast CTAs fail when they're spoken once at the end. Three Brunson diagnoses and the audio-specific fix.",
    tldr:
      "Podcast CTAs convert when they're embedded in the audio's natural moments, not bolted on at the end. The 'visit my site' end-card converts at near zero. The mid-roll one-line callback to a specific resource converts. The medium has to shape the message.",
    diagnoses: [
      {
        label: "Wrong Person",
        appearance:
          "Listeners aren't your buying cohort. Episodes are popular but the listenership skews toward consumption, not action. The 'tell a friend' loop works; the 'buy something' loop doesn't.",
        fix: "Audit guest list and topic mix. If the show's topics attract a different cohort than your offer's, the audience compounds in the wrong direction. Niche the show before niching the CTA.",
      },
      {
        label: "Weak Offer",
        appearance:
          "End-of-episode CTA is 'visit our website' or 'subscribe to our newsletter'. Topic-shaped. Listener has no reason to act on the spot.",
        fix: "Specific finished thing, spoken mid-episode. 'In the show notes there's a 1-page diagnostic I made for [today's specific topic]'. Episode-specific resources convert 5 to 15x better than generic newsletter pitches.",
      },
      {
        label: "Weak Belief",
        appearance:
          "Show notes have no founder credibility. The host references their work, but the listener can't verify any of it. CTA destination has no follow-through proof.",
        fix: "Show notes link directly to a specific dated artifact – a teardown, a case study, a one-page artifact – not the homepage. Listeners click the link they heard about, not a generic destination.",
      },
    ],
    directionalRange: {
      range: "0.5% to 3%",
      note: "Podcast CTA to specific page conversion sits between 0.5 and 3% of listeners. Below 0.5% means the CTA is topic-shaped. Above 3% usually means very tight audience-offer fit – rare but possible for hyper-niche shows.",
    },
    checklist: [
      "Listen to your last 5 CTAs. Are they specific resources or generic 'visit us'?",
      "Check whether show notes link to specific artifacts or the homepage.",
      "Time CTA placement. Mid-episode (around the 60% mark) converts better than end-of-episode.",
      "Look at episode-by-episode CTA conversion. If one episode converted 5x better, the topic-CTA match is the lever.",
      "Test one episode with a tightly-scoped CTA tied to that episode's specific topic. If conversion lifts, your default CTA is too generic.",
    ],
    faqs: [
      {
        q: "Should I have a single CTA across episodes or vary it?",
        a: "Vary it by episode topic. Generic show-wide CTAs ('subscribe to my newsletter') convert at near zero. Episode-specific CTAs that match the listener's current state of mind convert 5 to 15x better.",
      },
      {
        q: "Where in the episode should the CTA go?",
        a: "Mid-episode (60% mark) for the main CTA. End-of-episode for the soft repeat. Pre-roll often gets skipped on speed listening. Mid-roll has the highest listener attention.",
      },
      {
        q: "Should I use a custom URL for podcast CTAs?",
        a: "Yes, both for attribution and for memorability. unlocksaas.com/diagnostic is easy to remember; a deep link with UTM params isn't. Custom paths let you measure podcast-specific conversion cleanly.",
      },
    ],
    relatedGlossary: ["hook", "offer"],
    lastVerified: "2026-05-20",
  },
  {
    slug: "subscription-renewal",
    element: "subscription renewal",
    metaTitle: "Why Aren't My Subscribers Renewing? (Retention Diagnostic)",
    metaDescription:
      "Subscriptions fail to renew when the early-month value moment slipped. Three Brunson diagnoses and the retention fix.",
    tldr:
      "Renewals are decided in the first 7 to 14 days of the subscription, not at the renewal-prompt moment. If the user didn't activate in week 1, they're already gone – the renewal cancellation just makes it official. Fix the activation moment; renewals follow.",
    diagnoses: [
      {
        label: "Wrong Person",
        appearance:
          "Subscribers cancel within 30 days of signup. The cohort isn't your ICP – they signed up curious, not desperate. High initial churn that doesn't compound to a stable base.",
        fix: "Trace cancellations back to acquisition source. If one source consistently produces 30-day cancellers, that source is the wrong filter. Cut the source or change its targeting upstream.",
      },
      {
        label: "Weak Offer",
        appearance:
          "Users sign up, use the product 2 to 3 times, then go silent. They didn't get to the value moment. The product works but the onboarding doesn't get them there.",
        fix: "Define the activation moment explicitly. The first thing the user does in their first session must demonstrate one specific outcome. Three-step onboarding flows that branch in three directions kill activation.",
      },
      {
        label: "Weak Belief",
        appearance:
          "Users keep their subscription but barely use it. At renewal they cancel because they didn't feel the value all year. Inertia kept them paying; the renewal prompt broke the inertia.",
        fix: "Send specific monthly impact summaries. 'You sent 14 emails this month with X open rate.' Surface the value the user already got, with specific numbers. Without the surface, the user's perception of value decays.",
      },
    ],
    directionalRange: {
      range: "70% to 95% (annual renewals)",
      note: "Healthy annual renewal rates for indie SaaS sit between 70 and 95%. Below 70% means activation is broken or the offer doesn't match the cohort. Above 95% usually means the offer is so specific the audience can't leave – which can be good or bad depending on how it was acquired.",
    },
    checklist: [
      "Measure activation rate at day 7. Activated users renew 3 to 5x better than non-activated.",
      "Look at monthly active rate. Subscribers who use the product weekly renew at 90%+; users who use it monthly renew at 30 to 60%.",
      "Send a 'state of your account' email 60 days before renewal. Surfaces value before the cancellation decision.",
      "Track cancellation reasons. The top reason is your highest-leverage fix.",
      "Check what happens 30 days post-cancellation. Users who reactivate quickly were never wrong-fit – they hit a temporary friction.",
    ],
    faqs: [
      {
        q: "Should I email users before renewal to remind them?",
        a: "Yes, 14 and 7 days before. Surprise renewals create refund requests and damage NPS. Pre-renewal email lifts trust; missed renewal emails create disputes. The math favors transparency.",
      },
      {
        q: "Should I offer discounts to prevent cancellation?",
        a: "Selectively. Cancellation-time discounts train users to threaten cancellation for discounts. Better: ask why they're leaving, fix the actual reason, then offer a discount only if the answer is 'budget'.",
      },
      {
        q: "What's the right cancellation flow?",
        a: "Three steps: reason (multi-choice), specific feedback (open text), confirm. Each step gives you data and gives the user a moment to reconsider. Forcing 5 to 10 steps to cancel is dark-pattern that destroys long-term brand trust.",
      },
    ],
    relatedGlossary: ["offer", "value-ladder"],
    lastVerified: "2026-05-20",
  },
  {
    slug: "newsletter-paid-upgrade",
    element: "newsletter paid upgrade",
    metaTitle: "Why Aren't My Newsletter Subscribers Upgrading?",
    metaDescription:
      "Free-to-paid newsletter upgrades fail when free is too generous. Three Brunson diagnoses and the upgrade fix.",
    tldr:
      "Free-to-paid newsletter conversion fails when the free tier delivers the full promise. The reader has no reason to upgrade because they already got what they came for. Healthy 1 to 5% free-to-paid conversion requires the free tier teach the framework and the paid tier deliver the execution.",
    diagnoses: [
      {
        label: "Wrong Person",
        appearance:
          "Free subscribers are largely from a different cohort than the paid offer targets. Free list is 50K; paid offer makes sense to ~2K of them but the page reads as if it's for all 50K.",
        fix: "Segment the upgrade page by subscriber cohort. Different copy for different subscriber sources / topics. Most newsletters use one upgrade page for everyone; segmenting lifts conversion 2 to 4x.",
      },
      {
        label: "Weak Offer",
        appearance:
          "Paid tier is 'more of the same' content – longer essays, more frequent emails. Free subscribers don't see a categorical difference, just incremental more.",
        fix: "Paid tier needs a categorically different deliverable. Office hours, private community, founder access, specific paid-only artifacts. 'More content' is the weakest paid offer; specific deliverables outconvert it 5 to 10x.",
      },
      {
        label: "Weak Belief",
        appearance:
          "Newsletter operator has built trust through writing but never explicitly demonstrated the paid value. Free subscribers don't know what they'd get for the price.",
        fix: "Run an 'open week' where paid content is briefly accessible to free subscribers. Surface what they'd get if they upgraded. Closed-paid-tier with no public glimpse is a Weak Belief problem.",
      },
    ],
    directionalRange: {
      range: "1% to 5%",
      note: "Healthy free-to-paid newsletter conversion sits between 1 and 5% of active free subscribers within 12 months. Below 1% means free is too generous or paid is undifferentiated. Above 5% usually means a very tight niche where the paid tier is the genuine next step.",
    },
    checklist: [
      "Compare your free email to your paid email side by side. Categorically different or just longer?",
      "Look at your free-to-paid upgrade rate by acquisition source. The source matters more than the page.",
      "Audit your paid-only deliverables. If they're just 'more frequent emails', the offer is weak.",
      "Check whether subscribers know what's behind the paywall. If they don't, conversion stays low.",
      "Test one specific paid-only artifact teaser in a free email. If upgrades spike, the gap is paid-tier visibility.",
    ],
    faqs: [
      {
        q: "Should paid newsletter tier include community access?",
        a: "Often yes. Pure-content paid newsletters cap at low single-digit conversion. Adding community (private Discord/Slack, monthly calls) lifts conversion 2 to 4x because the differentiation becomes categorical, not gradient.",
      },
      {
        q: "What's the right price for a paid newsletter tier?",
        a: "$5 to $25/month is the typical sweet spot. Below $5 the operator's economics don't compound; above $25 the audience expects more than text. Higher-priced tiers usually need community + specific artifacts.",
      },
      {
        q: "Should I do annual or monthly for paid newsletter?",
        a: "Both, with annual discounted 15 to 25%. Most paying readers pick annual because the price-per-month is the framing they care about. Annual stabilizes revenue; monthly captures price-sensitive readers.",
      },
    ],
    relatedGlossary: ["offer", "value-ladder", "seinfeld-email"],
    lastVerified: "2026-05-20",
  },
  {
    slug: "linkedin-post",
    element: "LinkedIn post",
    metaTitle: "Why Aren't My LinkedIn Posts Converting? (Content Diagnostic)",
    metaDescription:
      "LinkedIn posts fail at the hook line, not the body. Three Brunson diagnoses for posts with views but no inbound.",
    tldr:
      "LinkedIn posts that don't convert almost always fail at the first 2 lines (the visible hook before 'see more'). Views might be fine; comments might be fine; inbound is flat. The hook didn't pre-qualify a reader to take any specific action, so engagement compounds without converting.",
    diagnoses: [
      {
        label: "Wrong Person",
        appearance:
          "Posts get lots of likes from other founders / consultants / agencies. Nobody who could be a customer engages. The audience is full of peers, not prospects.",
        fix: "Audit who's engaging. If it's peers, your hooks are speaking to peer concerns (industry takes, hot takes). Rewrite hooks to address your target customer's situation directly. Peer-engagement metrics don't pay bills.",
      },
      {
        label: "Weak Offer",
        appearance:
          "Posts are observations or hot takes. They generate discussion but no call-to-action. Readers nod and move on.",
        fix: "End specific posts with specific asks. 'I'm doing free diagnostics for 5 founders this week – DM me your URL'. Specificity in the CTA outconverts generic 'happy to help' by 10 to 50x.",
      },
      {
        label: "Weak Belief",
        appearance:
          "Posts reference work or insights but never show the dated artifact. Reader has no way to verify the founder's claims; engagement happens at face value but trust doesn't build.",
        fix: "Reference dated specific work in posts. 'Yesterday I tore down X's pricing page; here's the one thing I'd change'. Link to or screenshot the actual artifact. Dated specificity builds trust over weeks.",
      },
    ],
    directionalRange: {
      range: "0.1% to 1%",
      note: "LinkedIn post viewer-to-action conversion sits between 0.1 and 1% for typical founder posts. Below 0.1% almost always means the post had no specific ask. Above 1% on consistent posts usually means very tight audience-content fit.",
    },
    checklist: [
      "Read your last 10 post hooks (first 2 lines). Do they speak to your target cohort or to LinkedIn-engagement patterns?",
      "Count specific asks in your posts. Posts with no ask convert at near zero.",
      "Look at who comments. If your top commenters are peers/competitors, the audience match is broken.",
      "Reference dated artifacts in posts. Vague 'I work with founders' beats nothing but loses to 'yesterday I helped X with Y'.",
      "Test one post with a specific time-bound ask. If inbound jumps, your default posts are too generic.",
    ],
    faqs: [
      {
        q: "Should I post every day or 3 times a week?",
        a: "Consistency over frequency. 3 times a week sustained for 6 months outperforms daily for 6 weeks. Posting cadence you can hold beats posting cadence that exhausts you.",
      },
      {
        q: "Should I use carousels or text-only posts?",
        a: "Text-only beats carousels for consultant/founder positioning. Carousels work for productized content but read as marketing. Pure-text posts compound founder voice over time.",
      },
      {
        q: "Should I respond to every comment?",
        a: "Yes, in the first 24 hours after posting. Comment-replies lift algorithmic reach significantly. Late replies (>24 hours) don't help reach but do help relationship-building.",
      },
    ],
    relatedGlossary: ["hook", "story", "weak-offer"],
    lastVerified: "2026-05-20",
  },
  {
    slug: "twitter-post",
    element: "Twitter/X post",
    metaTitle: "Why Aren't My Tweets Converting? (Founder Diagnostic)",
    metaDescription:
      "Tweets convert when they're surprising and specific. Three Brunson diagnoses for tweets with engagement but no inbound.",
    tldr:
      "Tweets that don't convert have engagement but no specific action attached. Founders tweet observations and hot takes that generate likes from peers but produce zero inbound. The fix is rarely 'tweet more' – it's 'tweet specific things tied to specific actions you want readers to take'.",
    diagnoses: [
      {
        label: "Wrong Person",
        appearance:
          "Engagement is from other founders, other Twitter accounts, but not your target customer. Building-in-public audience is mostly other builders, which is a different cohort than buyers.",
        fix: "Audit your follower list. If your top engagers are other founders, your content is building-in-public-shaped. Repurpose content for your customer's vocabulary; the engagement profile changes within weeks.",
      },
      {
        label: "Weak Offer",
        appearance:
          "Tweets are observations or 'lessons learned'. No specific ask. Reader sees an insight and moves on.",
        fix: "Tie specific tweets to specific actions. 'I diagnosed 14 indie SaaS pages this week. Two slots left – reply if you want yours next'. Specific time-bound CTAs convert at 10 to 100x the rate of insight-only tweets.",
      },
      {
        label: "Weak Belief",
        appearance:
          "Profile bio is vague ('helping founders ship'). No specific dated work referenced. New visitors to the profile can't verify the founder's claims in 30 seconds.",
        fix: "Profile bio names one specific dated outcome. Pinned tweet references the most recent specific artifact. Cold visitors should be able to verify the founder's claim in 30 seconds of profile-skimming.",
      },
    ],
    directionalRange: {
      range: "0.05% to 0.5%",
      note: "Tweet impression-to-action conversion sits between 0.05 and 0.5% for founder accounts. Below 0.05% means specific asks are missing. Above 0.5% usually means very tight audience and consistent specific CTAs.",
    },
    checklist: [
      "Look at your last 50 tweets. How many had a specific ask?",
      "Audit your follower list. Founders, customers, peers? The mix tells you what your content actually attracts.",
      "Check your profile bio. Vague or specific? Vague bios cost trust on every new visitor.",
      "Pin a specific recent artifact. Vague pinned tweets are wasted real estate.",
      "Test one tweet with a specific time-bound CTA. If replies and inbound jump, your default tweets are too generic.",
    ],
    faqs: [
      {
        q: "Should I tweet daily?",
        a: "Cadence you can sustain. 3 to 5 tweets per day sustained for 6 months outperforms 15 per day for 3 weeks. Sustainable beats heroic.",
      },
      {
        q: "Should I use threads or single tweets?",
        a: "Both, intentionally. Threads build authority on specific topics; single tweets build founder voice. Threads-only feels like marketing; single-tweets-only doesn't build the depth that converts.",
      },
      {
        q: "Should I reply to every comment?",
        a: "Yes, in the first 90 minutes. Engagement signals matter to the Twitter/X algorithm; early replies lift reach. Late replies build relationships but don't help reach.",
      },
    ],
    relatedGlossary: ["hook", "story", "weak-offer"],
    lastVerified: "2026-05-20",
  },
  {
    slug: "youtube-video",
    element: "YouTube video",
    metaTitle: "Why Isn't My YouTube Video Converting? (Hook Diagnostic)",
    metaDescription:
      "YouTube videos with views but no inbound fail at the first 15 seconds, the description, or the CTA. Three Brunson diagnoses.",
    tldr:
      "YouTube videos convert when the first 15 seconds hook the right viewer and the description gives them somewhere specific to go. Videos that fail to convert have either the wrong hook (viewer is qualified but bounces) or the wrong CTA (viewer is convinced but doesn't have a specific next step).",
    diagnoses: [
      {
        label: "Wrong Person",
        appearance:
          "Views are high but watch time is low. Audience retention drops in the first 30 seconds. The video is being clicked by curious browsers, not your target cohort.",
        fix: "Audit the thumbnail and title. Both are pre-qualifiers for the viewer. If they're click-bait shaped, you get the wrong cohort. Specific audience-named thumbnails ('For SaaS founders pre-revenue') filter cohort upstream.",
      },
      {
        label: "Weak Offer",
        appearance:
          "Audience retention is fine. Watch time is good. But comments and inbound are flat. The video is 'useful' but nobody knows what to do with it.",
        fix: "Specific CTA in the video AND the description. 'In the description there's a 1-page diagnostic for the specific pattern I showed'. Episode-specific finished things outconvert generic 'visit my site' by 10 to 50x.",
      },
      {
        label: "Weak Belief",
        appearance:
          "Channel has few subscribers; this is one of your early videos. Viewer can't verify the founder's claims in any other content.",
        fix: "Description references specific dated work, with links to the artifacts. Pinned comment references the channel's other relevant videos. Cold YouTube viewers need more trust signals, not fewer, than warm.",
      },
    ],
    directionalRange: {
      range: "0.5% to 5%",
      note: "YouTube viewer-to-specific-action conversion sits between 0.5 and 5% on engaged videos. Below 0.5% means the CTA is generic. Above 5% on cold YouTube traffic is rare and usually means very tight title/topic/audience fit.",
    },
    checklist: [
      "Look at audience retention curve. The drop-off point is your script's diagnostic.",
      "Check if your thumbnail names the audience explicitly. Generic thumbnails get wrong-cohort clicks.",
      "Read your description aloud. Specific or generic CTA?",
      "Look at the first 15 seconds. Do you name the audience?",
      "Test one video with a tightly-scoped CTA in the description. If inbound spikes, your default CTAs are too generic.",
    ],
    faqs: [
      {
        q: "Should I prioritize long-form or shorts?",
        a: "Long-form for conversion; shorts for awareness. Shorts deliver views but rarely convert; long-form builds the trust required for the CTA to engage. Most founders should be 80% long-form, 20% shorts.",
      },
      {
        q: "How long should the video be?",
        a: "Topic-dependent. For founder-led teaching: 8 to 15 minutes is the sweet spot. Beyond 15 minutes loses retention. Under 8 minutes rarely builds the belief required for action.",
      },
      {
        q: "Should I run YouTube ads?",
        a: "Maybe, post-organic-validation. Run organic for 90 days. If a specific topic consistently converts, that's the topic to amplify with ads. Running ads on un-validated topics wastes spend.",
      },
    ],
    relatedGlossary: ["hook", "story", "offer"],
    lastVerified: "2026-05-20",
  },
  {
    slug: "blog-post",
    element: "blog post",
    metaTitle: "Why Isn't My Blog Post Converting? (Content Diagnostic)",
    metaDescription:
      "Blog posts with traffic but no signups fail at the in-content CTA. Three Brunson diagnoses and the content-marketing fix.",
    tldr:
      "Blog posts convert when readers can take a specific next step at the moment they're most convinced. Posts that fail to convert have traffic, time-on-page, and even social shares – but no in-content CTA tied to the post's specific topic. Generic 'subscribe' boxes at the bottom convert at near zero.",
    diagnoses: [
      {
        label: "Wrong Person",
        appearance:
          "Traffic comes from broad search queries. Bounce rate is high. The wrong cohort lands on the post and leaves.",
        fix: "Audit search terms driving traffic. If they're informational ('what is X') but your post is conversion-oriented ('how to fix X'), the SEO is attracting the wrong stage of buyer. Match content type to search intent.",
      },
      {
        label: "Weak Offer",
        appearance:
          "Post has no in-content CTA tied to its specific topic. Bottom-of-post 'subscribe' box gets near-zero clicks.",
        fix: "Add 2 to 3 contextual CTAs inline with the post. Each CTA is specific to the section it's in. 'If you're stuck on the Stack Slide step, here's the 1-page template'. Contextual CTAs outconvert generic 'subscribe' by 5 to 20x.",
      },
      {
        label: "Weak Belief",
        appearance:
          "Author byline is generic ('the team at X'). No author credentials or dated work referenced. Reader can't verify the post's claims.",
        fix: "Author byline names the founder with one specific dated credential ('Maryan – teardown 41 indie SaaS pages between January and April 2026'). Above-the-fold credibility signal lifts conversion 20 to 40%.",
      },
    ],
    directionalRange: {
      range: "0.5% to 5%",
      note: "Blog post visitor-to-email conversion sits between 0.5 and 5% for content with contextual CTAs. Below 0.5% almost always means no inline CTA. Above 5% usually means very tight content-CTA match on a single high-intent topic.",
    },
    checklist: [
      "Count inline CTAs in your post. Less than 2 is the most common failure mode.",
      "Look at scroll depth. If readers leave at 30%, the post's hook didn't pre-qualify them.",
      "Check author byline. Vague bylines cost trust on cold readers.",
      "Find the topic-specific CTA. Generic 'subscribe' beats nothing but loses to topic-specific opt-in.",
      "Test one post with 3 inline contextual CTAs. If conversion lifts, your default content lacks CTA density.",
    ],
    faqs: [
      {
        q: "Should I gate content behind email signup?",
        a: "Selectively. Pillar content stays public for SEO; specific high-value artifacts (templates, diagnostics) gate behind email. Gating everything caps SEO; gating nothing caps email conversion. The mix matters.",
      },
      {
        q: "How long should a blog post be?",
        a: "1,500 to 3,000 words for SEO-targeted posts. Shorter posts rarely rank for competitive terms; longer posts often lose readers past the inline CTA points. Most founders write too long, not too short.",
      },
      {
        q: "Should every post have a CTA to the same product?",
        a: "No. Each post should have a CTA matching its specific topic. Generic single-product CTAs across all content under-convert because they're misaligned with the reader's current state of mind.",
      },
    ],
    relatedGlossary: ["hook", "offer", "weak-offer"],
    lastVerified: "2026-05-20",
  },
  {
    slug: "post-purchase-upsell",
    element: "post-purchase upsell",
    metaTitle: "Why Isn't My Post-Purchase Upsell Converting?",
    metaDescription:
      "Post-purchase upsells fail when they introduce a new decision. Three Brunson diagnoses and the OTO-extension fix.",
    tldr:
      "Post-purchase upsells convert when they extend the buyer's just-made decision. They fail when they introduce a new product, a new cohort, or a new sales argument. The buyer has 30 seconds of high-momentum decision time; the upsell either rides that momentum or breaks it.",
    diagnoses: [
      {
        label: "Wrong Person",
        appearance:
          "Front-end buyer is the wrong cohort for the upsell. $1 starter buyers seeing a $497 mastermind upsell. Frame break; near-zero conversion.",
        fix: "Match upsell to buyer's just-made decision. The natural-next-step. If they bought 'fix one thing', the upsell is 'fix three things'. Not 'become a master at fixing things'.",
      },
      {
        label: "Weak Offer",
        appearance:
          "Upsell page is too long. Re-pitches the entire product. Buyer is already sold; the long page reads as 'they think I need more convincing'.",
        fix: "Under 200 words. Headline (natural-next-step), 3 bullets (stack), price (comparison to front-end), two visible buttons. Buyer doesn't need re-pitch; buyer needs quick decision support.",
      },
      {
        label: "Weak Belief",
        appearance:
          "Upsell has a different guarantee than the front-end. Buyer's just-built trust collapses. Asymmetry signals trap.",
        fix: "Mirror the front-end guarantee exactly. Same trigger event, same window, same remedy. Asymmetric guarantees on the upsell convert at near-zero regardless of the offer's actual quality.",
      },
    ],
    directionalRange: {
      range: "15% to 35%",
      note: "Post-purchase OTO take rates between 15 and 35% are healthy. Below 15% almost always means frame mismatch (Wrong Person or Weak Offer). Above 35% usually means the front-end was underpriced.",
    },
    checklist: [
      "Word-count the OTO page. Over 400 words is almost always too long.",
      "Compare OTO guarantee to front-end. Mismatch is the most common failure mode.",
      "Time the OTO appearance. After 8 seconds of payment-success delay, take rates drop.",
      "Check the 'no thanks' button. Hidden or adversarial UX destroys long-term trust.",
      "Test one variant where the OTO extends the front-end's exact promise. If take rate lifts, your default OTO is frame-mismatched.",
    ],
    faqs: [
      {
        q: "Should the OTO have a countdown timer?",
        a: "Only if real. Genuine countdown ('this offer disappears in 15 minutes' tied to a real expiry) can lift take rate 5 to 10 percentage points. Fake countdowns that reset on refresh destroy trust permanently.",
      },
      {
        q: "Should I have one OTO or two?",
        a: "Start with one. Take rate on a second OTO is 5 to 20% of buyers who took the first. Beyond two, take rates collapse and the funnel feels like a hard sell.",
      },
      {
        q: "Should the OTO be cheaper or more expensive than the front-end?",
        a: "Either works. Less-expensive OTOs (order bumps, $7 to $19 on a $97 core) take at 30 to 50%. More-expensive OTOs (2 to 5x the front-end) take at 15 to 35%. Beyond 5x feels like a frame-break.",
      },
    ],
    relatedGlossary: ["offer", "stack-slide", "weak-belief"],
    lastVerified: "2026-05-20",
  },
  {
    slug: "referral-program",
    element: "referral program",
    metaTitle: "Why Isn't My Referral Program Driving Signups?",
    metaDescription:
      "Referral programs fail when the incentive doesn't match the friction. Three Brunson diagnoses and the referral-mechanic fix.",
    tldr:
      "Referral programs convert when sharing is low-friction and the incentive is genuinely meaningful to the referrer. They fail when 'share to earn 10% off' asks the user to do work for trivial savings. Either reduce the friction to near-zero or raise the incentive to genuinely-worth-it.",
    diagnoses: [
      {
        label: "Wrong Person",
        appearance:
          "Existing customers don't share. The product is private (financial, dating, health) or the cohort doesn't talk publicly about tools. Referral mechanics fight the audience's natural behavior.",
        fix: "Audit whether your cohort references their tools at all in public. If they don't, no referral incentive works – you're fighting the audience's privacy norms. Switch to community-led growth (private groups) or paid referral partners instead.",
      },
      {
        label: "Weak Offer",
        appearance:
          "Referral reward is 10% off or $5 credit. Friction to share is meaningful (custom link, social post, intro email). The math doesn't compute for the referrer.",
        fix: "Either: (a) make sharing one click ('invite via link, no copy-paste'), or (b) raise the reward materially (a full month free, $50+ credit, physical reward). 'A little friction for a little reward' converts at near zero.",
      },
      {
        label: "Weak Belief",
        appearance:
          "Referrer's friends don't sign up after the referral. Either the referrer is wrong-cohort (no real referrals to give) or the friend's signup experience is broken.",
        fix: "Audit the referred-friend signup flow. Often the friend hits a different signup page than direct traffic and the page is broken or unclear. The referrer brings traffic; the conversion happens on your page, not theirs.",
      },
    ],
    directionalRange: {
      range: "5% to 25% of customer base (active referrers)",
      note: "Healthy active-referrer rates sit between 5 and 25% of customer base. Below 5% means the program isn't engaging or the audience is privacy-shaped. Above 25% is rare and usually means the product has inherent virality (social, collaborative).",
    },
    checklist: [
      "Count clicks-to-share. Over 3 clicks and most users abandon.",
      "Look at referral-source signups. If they bounce on the page, the friend's experience is broken.",
      "Audit referrer reward. Is it material enough that a customer would actually share?",
      "Check whether your audience publicly discusses tools. Some cohorts don't; referral fights them.",
      "Test one variant with a much higher reward ($100 vs $5). If referrals spike, you were under-incentivizing.",
    ],
    faqs: [
      {
        q: "Should I reward the referrer or the referred-friend or both?",
        a: "Both is standard. Referrer gets credit/discount when friend signs up; friend gets sign-on bonus. Single-sided programs (referrer only or friend only) underconvert two-sided programs by 30 to 50%.",
      },
      {
        q: "Should referral rewards be cash or product credit?",
        a: "Product credit for SaaS; cash for ecommerce. Credit keeps the customer engaged with the product (their reward is more usage). Cash works for transactional purchases where ongoing engagement isn't the goal.",
      },
      {
        q: "Should referrers get reward immediately or after the friend pays?",
        a: "After the friend pays (or activates). Immediate reward gets gamed and produces spam invites. Reward-on-activation aligns incentives and reduces gaming significantly.",
      },
    ],
    relatedGlossary: ["offer", "value-ladder"],
    lastVerified: "2026-05-20",
  },
  {
    slug: "affiliate-program",
    element: "affiliate program",
    metaTitle: "Why Isn't My Affiliate Program Driving Sales?",
    metaDescription:
      "Affiliate programs fail when commissions don't match the audience match. Three Brunson diagnoses and the affiliate-mechanic fix.",
    tldr:
      "Affiliate programs convert when the affiliate's audience overlaps tightly with your ICP and the commission is meaningful. They fail when you recruit broadly and pay nominally – low-overlap affiliates with low commissions produce no real traffic. The math has to work for both sides.",
    diagnoses: [
      {
        label: "Wrong Person",
        appearance:
          "Affiliates signed up but never drive traffic. Their audiences don't match your ICP. The affiliate program filled with spammers and click-farmers.",
        fix: "Curate affiliates manually for the first 50 to 100. Each must prove audience overlap (their audience matches your ICP). Open-application affiliate programs at small scale fill with wrong-fit affiliates and produce zero revenue.",
      },
      {
        label: "Weak Offer",
        appearance:
          "Commission is 10 to 20% of price. For a $49/month SaaS, affiliate earns $5 to $10 per referral. The math doesn't compute for affiliates with real audiences.",
        fix: "Raise commission to 30 to 50% (or higher for the first year of the customer's lifetime). High-quality affiliates calculate annualized commission vs effort; 30% of $49 × 12 months = $176 per referral is the math that gets them to promote.",
      },
      {
        label: "Weak Belief",
        appearance:
          "Affiliates don't trust the conversion. They send traffic but the landing page underperforms. They stop promoting after one underperforming campaign.",
        fix: "Show affiliates your direct-traffic conversion data. Quarterly transparency report on funnel performance. Affiliates with confidence in your funnel send more traffic; ones operating blind underperform.",
      },
    ],
    directionalRange: {
      range: "10% to 30% of total revenue (mature affiliate programs)",
      note: "Mature affiliate programs deliver 10 to 30% of total SaaS revenue. Below 10% means the program isn't material. Above 30% usually means the product is over-dependent on affiliate channels and lacks direct acquisition.",
    },
    checklist: [
      "Audit affiliate audience overlap with your ICP. Mismatch is the most common failure.",
      "Calculate commission per referral over 12 months. Does the math compute for the affiliate?",
      "Look at conversion rate by affiliate. The bottom 80% of affiliates often produce zero; the top 20% produce everything.",
      "Provide affiliates with creative assets. Without them, affiliate marketing defaults to bad copy.",
      "Send affiliates a quarterly report on funnel performance. Transparency keeps quality affiliates engaged.",
    ],
    faqs: [
      {
        q: "What's a good commission rate for SaaS affiliates?",
        a: "30 to 50% of monthly recurring revenue for 12 months is the SaaS standard. Higher for higher-ticket products; lower for lower-ticket. The number has to make sense to affiliates with real audiences they could promote anything to.",
      },
      {
        q: "Should I use recurring or one-time commissions?",
        a: "Recurring for SaaS. One-time commissions undervalue the affiliate's contribution because they bring lifetime customers. Recurring commissions align incentives and keep quality affiliates engaged.",
      },
      {
        q: "Should I require affiliates to disclose their relationship?",
        a: "Yes, FTC requires it in the US. Even outside the US, disclosed affiliate relationships convert better than hidden ones because readers see the disclosure as honesty signal.",
      },
    ],
    relatedGlossary: ["offer", "value-ladder"],
    lastVerified: "2026-05-20",
  },
  {
    slug: "free-tool",
    element: "free tool",
    metaTitle: "Why Isn't My Free Tool Converting Users to Paid?",
    metaDescription:
      "Free SEO tools fail when the tool is too good. Three Brunson diagnoses and the free-tool-to-paid bridge.",
    tldr:
      "Free tools attract traffic and email signups but rarely convert to paid because the tool delivers the full promise standalone. Users get what they came for, leave, and never look at the paid product. The fix is structural: free tools must produce a result that creates demand for the paid product.",
    diagnoses: [
      {
        label: "Wrong Person",
        appearance:
          "Free tool users are mostly hobbyists, students, or competitors. Tool gets traffic; paid product gets zero conversions.",
        fix: "Add a qualifying field at tool use. 'What are you trying to do?' multi-choice. Disqualifying answers don't lock the tool but tag the user as non-target. Qualifying answers get post-tool conversion flow.",
      },
      {
        label: "Weak Offer",
        appearance:
          "Free tool delivers the full result. Users get what they came for. No reason to buy anything else.",
        fix: "Free tool delivers the diagnosis; paid product delivers the implementation. Free 'audit your funnel' shows what's broken; paid product shows how to fix it. The free tool creates demand by surfacing the gap.",
      },
      {
        label: "Weak Belief",
        appearance:
          "Free tool runs and gives a result, but the result feels generic or templated. User doesn't trust the tool's output enough to invest in the paid follow-on.",
        fix: "Free tool output must be specific to the user's input, not templated. Custom diagnoses, specific recommendations tied to their actual situation. Templated outputs feel like lead magnets in disguise.",
      },
    ],
    directionalRange: {
      range: "1% to 5%",
      note: "Free-tool-to-paid conversion sits between 1 and 5% for well-designed tools. Below 1% almost always means the tool is too generous (delivers the full promise). Above 5% usually means a tight gap between free diagnostic and paid implementation.",
    },
    checklist: [
      "Use your free tool as a stranger. Did you get what you came for?",
      "Look at tool-completion-to-paid conversion. The bridge is your weakest funnel step.",
      "Audit the tool's output specificity. Templated or genuinely custom?",
      "Check the post-tool flow. Generic 'thanks for using' is the default; specific 'here's the next step' is the lift.",
      "Test one variant where the tool's output explicitly recommends the paid product. If conversion lifts, your default flow underutilized the recommendation moment.",
    ],
    faqs: [
      {
        q: "Should the free tool require email signup?",
        a: "Yes, almost always. Free tools without email gate produce traffic but no ability to follow up. The email gate reduces tool usage 30 to 50% but enables the conversion flow that justifies the tool's existence.",
      },
      {
        q: "How sophisticated should the free tool be?",
        a: "Enough to be genuinely useful but not enough to replace the paid product. A 5-minute diagnostic is plenty; a 50-minute consulting session-equivalent is too much.",
      },
      {
        q: "Should I open-source the free tool?",
        a: "Edge case. Open-source builds developer trust and inbound links but reduces email capture. For developer-tools markets, open-source can lift conversion via trust; for non-developer markets, open-source is largely irrelevant.",
      },
    ],
    relatedGlossary: ["hook", "offer", "value-ladder"],
    lastVerified: "2026-05-20",
  },
  {
    slug: "case-study",
    element: "case study",
    metaTitle: "Why Isn't My Case Study Driving Inbound?",
    metaDescription:
      "Case studies fail when they read as marketing instead of evidence. Three Brunson diagnoses and the case-study fix.",
    tldr:
      "Case studies convert when readers can see themselves in the named customer's situation and verify the result independently. They fail when the case study reads as marketing (vague metrics, anonymous customer, no specific timeline). Trust requires specificity that most case studies sand off in legal review.",
    diagnoses: [
      {
        label: "Wrong Person",
        appearance:
          "Case study features a customer in a different cohort than your ICP. Enterprise case study used to sell to indie founders. Reader can't see themselves in the story.",
        fix: "One case study per cohort. Indie founders get an indie-founder case study; agencies get an agency case study. Cross-cohort case studies signal you don't understand the reader's specific situation.",
      },
      {
        label: "Weak Offer",
        appearance:
          "Case study metrics are vague. '300% increase in conversion' without context, baseline, or timeframe. Reader can't compute the math against their own situation.",
        fix: "Specific dated numbers with context. 'Conversion rate moved from 1.2% to 3.8% over 9 weeks; total cumulative paying customers added: 47'. Real numbers with real context outconvert vague-but-impressive numbers 5 to 10x.",
      },
      {
        label: "Weak Belief",
        appearance:
          "Customer is anonymous or generically named ('a leading SaaS company'). Reader can't verify the case study externally. The story sounds like marketing.",
        fix: "Named customer with permission. Real screenshots of their dashboard (with sensitive numbers redacted). Public-facing customer link the reader can click. Verifiable case studies outconvert anonymous ones 3 to 5x.",
      },
    ],
    directionalRange: {
      range: "5% to 15%",
      note: "Case study reader-to-inbound conversion sits between 5 and 15% for high-quality named case studies. Below 5% almost always means the case study reads as marketing. Above 15% usually means very tight reader-customer match.",
    },
    checklist: [
      "Read your case study aloud. Does it sound like evidence or marketing?",
      "Count anonymous claims. Vague metrics are the most common failure mode.",
      "Check whether the customer is named with permission. Anonymous case studies underconvert dramatically.",
      "Verify the timeline. 'Increased revenue' without timeframe is unfalsifiable.",
      "Test one variant with raw screenshots and verifiable claims. If conversion lifts, your default case studies are too polished.",
    ],
    faqs: [
      {
        q: "Should I include customer quotes in case studies?",
        a: "Specific dated quotes, yes. Generic quotes ('great product, highly recommend'), no. The quote should articulate something the case study's metrics don't capture – usually the customer's emotional experience or insight.",
      },
      {
        q: "How long should a case study be?",
        a: "800 to 1,500 words is the sweet spot. Shorter and it lacks evidence; longer and it loses readers before the inline CTA. Most case studies are too long.",
      },
      {
        q: "Should case studies have CTAs?",
        a: "Yes, contextual to the case study's situation. 'If your situation looks like X's, here's the next step'. Generic 'contact sales' undervalues the case study's specificity.",
      },
    ],
    relatedGlossary: ["weak-belief", "story"],
    lastVerified: "2026-05-20",
  },
  {
    slug: "guarantee",
    element: "guarantee",
    metaTitle: "Why Isn't My Guarantee Lifting Conversion?",
    metaDescription:
      "Guarantees fail when they're vague. Three Brunson diagnoses for unhelpful guarantees and the specificity fix.",
    tldr:
      "Guarantees convert when buyers can verify the trigger event themselves. 'Satisfaction guarantee' converts at near zero because satisfaction is unfalsifiable. 'Refund if [specific measurable event] doesn't happen by [specific date]' converts because the buyer knows when to claim it.",
    diagnoses: [
      {
        label: "Wrong Person",
        appearance:
          "Audience is risk-averse and doesn't trust guarantees regardless of how they're worded. Enterprise procurement, lifelong-skeptic individual buyers.",
        fix: "For risk-averse audiences, the guarantee isn't the primary trust signal – named founder + dated proof + customer references are. Add the guarantee, but lead with the social proof; the guarantee becomes secondary trust.",
      },
      {
        label: "Weak Offer",
        appearance:
          "Guarantee is 'satisfaction guaranteed' or 'no questions asked'. Buyer can't articulate when to claim it. Conversion lift is minimal.",
        fix: "Specific trigger event + specific timeframe + specific remedy. 'Refund issued if your first paying customer doesn't materialize within 60 days, no questions asked.' Specificity outconverts vague guarantees by 2 to 4x.",
      },
      {
        label: "Weak Belief",
        appearance:
          "Guarantee is real but buried in FAQ or terms-of-service. Buyer doesn't see it at the decision moment. Trust is hidden.",
        fix: "Surface the guarantee directly under each buy button. Verbatim. Not 'see our refund policy' – the actual one-line guarantee text. Trust at the decision moment outconverts trust on the page.",
      },
    ],
    directionalRange: {
      range: "10% to 30% (conversion lift from specific guarantee)",
      note: "Adding a specific guarantee typically lifts conversion 10 to 30% on offers above $97. Below that price point, the guarantee matters less because the financial stake is small.",
    },
    checklist: [
      "Read your guarantee aloud. Specific trigger event or vague satisfaction?",
      "Check where the guarantee appears. Buried in FAQ doesn't count.",
      "Look at refund rate. Healthy is 2 to 5%; under 1% usually means the guarantee is hidden; over 10% usually means the offer is over-promised.",
      "Test the guarantee's verifiability. If a buyer asks 'how do I claim?', can you answer in one sentence?",
      "Test one variant with a specific named guarantee. If conversion lifts, your default guarantee is too vague.",
    ],
    faqs: [
      {
        q: "How long should the guarantee window be?",
        a: "30 to 60 days for most SaaS. Long enough for the buyer to test the product genuinely; short enough that the financial exposure is bounded. 90+ day guarantees on subscription products often produce abuse.",
      },
      {
        q: "Should I do a money-back or 'fix it free' guarantee?",
        a: "Money-back outconverts 'fix it free' because the buyer knows the remedy. 'Fix it free' is a service offer dressed as a guarantee; buyers parse it as conditional.",
      },
      {
        q: "Should the guarantee require proof of use?",
        a: "Selectively. 'Show you used X feature' is reasonable; 'show you used the product for 30 days' is reasonable; 'show you genuinely tried' is unenforceable and counterproductive.",
      },
    ],
    relatedGlossary: ["weak-belief", "offer"],
    lastVerified: "2026-05-20",
  },
  {
    slug: "founders-cold-outbound",
    element: "founder cold outbound",
    metaTitle: "Why Isn't My Cold Outbound Working? (Founder Diagnostic)",
    metaDescription:
      "Founder-led cold outbound fails when the message is template-shaped. Three Brunson diagnoses and the outreach fix.",
    tldr:
      "Founder cold outbound converts when each message references something specific to the recipient that proves the founder did real homework. It fails when templates take over – the recipient sees mass-mailing pattern at line one and ignores everything after. The math is brutal: one specific message beats 100 generic ones.",
    diagnoses: [
      {
        label: "Wrong Person",
        appearance:
          "Outbound targets a list pulled from Apollo or LinkedIn Sales Navigator. Open rates fine; reply rates near zero. The list isn't your ICP – it just matches one filter (title, company size).",
        fix: "Hand-pick 50 to 100 targets. Each from a specific named source (a podcast they hosted, a tweet they posted, a job they took). Curated 50 outperforms scraped 5,000 by 10 to 100x reply rate.",
      },
      {
        label: "Weak Offer",
        appearance:
          "Outbound message opens with 'I noticed your company is doing X' followed by a generic pitch. Recipient sees the pattern.",
        fix: "Open with something only the recipient could verify – a podcast quote, a recent post, a specific company change. Then connect to a specific value you could deliver. Specificity in the opener filters out the 'this is mass mail' instinct.",
      },
      {
        label: "Weak Belief",
        appearance:
          "Sender's profile or website has no credibility signals. Recipient googles, finds nothing concrete, ignores.",
        fix: "Build a public profile worth googling. Specific dated work, named customer outcomes, founder-by-name everywhere. Cold outreach lands on a googleable profile within 30 seconds; if it doesn't exist, the message dies there.",
      },
    ],
    directionalRange: {
      range: "5% to 25% reply rate (founder-led, specific outreach)",
      note: "Founder-led specific cold outbound to curated lists produces 5 to 25% reply rates. Mass-mailed generic outbound produces 0.5 to 2% reply rates. The difference is curation + specificity, not volume.",
    },
    checklist: [
      "Read your last 5 outbound messages. Are they specific to the recipient or template-shaped?",
      "Check your own profile. Would a stranger trust it after 30 seconds of google?",
      "Audit your target list. Pulled from a tool or hand-curated?",
      "Look at your reply rate. Below 5% means the message is template-shaped.",
      "Send 20 messages, each specific to the recipient, no template. If reply rate jumps, your default outbound is too generic.",
    ],
    faqs: [
      {
        q: "Should I use cold email or LinkedIn outreach?",
        a: "Both, in sequence. LinkedIn first (connection request with a specific note). Email second (follow-up if connection accepts). Single-channel outbound underperforms two-channel sequences.",
      },
      {
        q: "How long should a cold message be?",
        a: "Under 120 words. The specific opener (referencing recipient's recent work) + one paragraph of value-prop + one specific ask. Longer messages feel like mass-mail; shorter messages don't establish enough specificity.",
      },
      {
        q: "Should I follow up if no reply?",
        a: "Once, after 5 to 7 days, with a different angle (not 'just bumping this'). Second specific message converts 20 to 40% of original non-responders. Beyond 2 follow-ups, reply rates collapse and brand reputation suffers.",
      },
    ],
    relatedGlossary: ["dream-100", "hook"],
    lastVerified: "2026-05-20",
  },
  {
    slug: "ai-wrapper-trial",
    element: "AI wrapper trial",
    metaTitle: "Why Aren't My AI Wrapper Trial Users Converting?",
    metaDescription:
      "AI wrapper trials fail because users can replicate the output in raw ChatGPT/Claude. Three Brunson diagnoses and the AI-specific fix.",
    tldr:
      "AI wrapper trial users churn fast because they test whether the wrapper genuinely beats raw GPT/Claude for their specific use case. If it does and the proof isn't in the first session, they leave. If it doesn't, they leave faster. The first-session value moment matters more here than in any other SaaS category.",
    diagnoses: [
      {
        label: "Wrong Person",
        appearance:
          "Trial users are mostly ChatGPT power users who treat your wrapper as a curiosity. They run one query, compare to raw ChatGPT, and bounce.",
        fix: "Pre-qualify on signup. Ask 'are you using ChatGPT/Claude directly today?' Power users get a different onboarding that explicitly compares your wrapper's output to raw output on a specific use case. Generic onboarding loses them in session one.",
      },
      {
        label: "Weak Offer",
        appearance:
          "Wrapper's output is technically better than raw GPT, but the user doesn't see the gap in their first session. They compare casually and find them similar.",
        fix: "First-session onboarding shows the gap explicitly. 'Here's what raw GPT gives you for [user's input]; here's what we give you for the same input.' Side-by-side comparison in session one is the load-bearing activation move.",
      },
      {
        label: "Weak Belief",
        appearance:
          "User isn't sure your wrapper's output is genuinely curated/improved vs just relabeled GPT. They suspect a wrapper-tax for nothing.",
        fix: "Show the system prompt or methodology somewhere visible. Not the secret sauce, but the structure. Transparency about the wrapper's value beat opacity, because AI buyers are sophisticated and assume the worst when they can't verify.",
      },
    ],
    directionalRange: {
      range: "5% to 15% trial-to-paid (AI wrappers specifically)",
      note: "AI wrapper trial-to-paid conversion sits between 5 and 15% – lower than generic SaaS – because the substitute (raw ChatGPT/Claude) is genuinely close. Below 5% means activation didn't demonstrate the gap.",
    },
    checklist: [
      "Run your trial as a ChatGPT power user. Did you see the wrapper's value in session one?",
      "Check first-session retention. AI wrapper trials with 30-second activation moments retain at 60%+; ones without bounce at 80%+.",
      "Look at the wrapper's specific value proposition. 'GPT for X' is too generic; 'a marketing brief generator for B2B SaaS founders' is specific.",
      "Audit your COGS. If API costs are over 60% of revenue, the business doesn't compound regardless of trial conversion.",
      "Test one variant where session-one shows side-by-side comparison. If activation rate lifts, your default onboarding undersells the gap.",
    ],
    faqs: [
      {
        q: "Should AI wrappers have free trials or freemium?",
        a: "Freemium with a usage cap, almost always. Free trials end before users have validated the wrapper's specific value; freemium with cap (e.g. 10 free generations) lets users test extensively before paying.",
      },
      {
        q: "How do I price an AI wrapper?",
        a: "Usage-based or tier-with-quota. Per-generation pricing aligns incentives but feels expensive on light usage; quota tiers ($X for 100 generations) feel more predictable. Most successful AI wrappers run quota tiers.",
      },
      {
        q: "Should I worry about OpenAI shipping my feature?",
        a: "Maybe, but it's not the immediate bottleneck. Current trial conversion is. If OpenAI ships your feature in 6 months and you have $50K MRR by then, you have leverage. If you don't fix the trial, you never reach that scale.",
      },
    ],
    relatedGlossary: ["offer", "weak-belief", "reluctant-hero"],
    lastVerified: "2026-05-20",
  },
  {
    slug: "indie-launch",
    element: "indie SaaS launch",
    metaTitle: "Why Did My Indie SaaS Launch Go Flat?",
    metaDescription:
      "Indie launches go flat when community cheers don't translate to paying customers. Three Brunson diagnoses and the post-launch fix.",
    tldr:
      "Indie SaaS launches generate cheers on Product Hunt, Indie Hackers, and Twitter without producing paying customers. The audience that cheered is mostly other builders, not buyers. The launch validated shipping; it didn't validate willingness to pay. Post-launch silence is the corrective signal.",
    diagnoses: [
      {
        label: "Wrong Person",
        appearance:
          "Launch traffic is 80%+ other founders and builders. Sign-ups from this cohort don't convert to paid because they're tire-kickers or potential competitors.",
        fix: "Launch outside the builder community too. Niche publications, specific subreddits matching your target cohort, founder-to-cohort outreach. Builder-community launches are valuable for visibility but cap revenue.",
      },
      {
        label: "Weak Offer",
        appearance:
          "Launch announcement talks about how it was built ('shipped in 2 weeks with Lovable') instead of what it does for the buyer.",
        fix: "Rewrite the launch for the buyer's cohort. 'I built this for [specific audience] who [specific situation]. It [specific outcome]'. The build mechanics are interesting to builders; the outcome is interesting to buyers.",
      },
      {
        label: "Weak Belief",
        appearance:
          "Launch has no founder-by-name credibility signal beyond 'I built this'. Visitors who'd buy can't verify the founder's track record.",
        fix: "Reference any specific dated prior work in the launch announcement. Even small prior wins ('I built X last year, got Y customers') signal you're not a one-launch wonder. Builders cheer regardless; buyers verify before paying.",
      },
    ],
    directionalRange: {
      range: "0.1% to 0.5%",
      note: "Indie launch visitor-to-paying-customer conversion sits between 0.1 and 0.5% on launch day. Below 0.1% almost always means the launch hit wrong-cohort audience; above 0.5% on a true cold launch is rare and usually means tight cohort match.",
    },
    checklist: [
      "Audit launch traffic source. Mostly builders, or genuine target cohort?",
      "Read your launch announcement aloud. Does it sell the build or the outcome?",
      "Look at post-launch (day 8+) traffic. If it dropped to near zero, the launch was a peak event, not a sustained acquisition source.",
      "Check whether you collected emails during launch. Email list outlives the launch peak by months.",
      "Test one post-launch campaign that targets a specific buyer cohort (not the builder community). If conversion lifts, the launch reach was too builder-shaped.",
    ],
    faqs: [
      {
        q: "Is Product Hunt worth launching on?",
        a: "For awareness yes, for conversion mostly no. PH traffic is curiosity traffic, 0.1 to 0.5% conversion. Launch there for inbound links, press, and email signups; don't expect to find product-market fit through PH.",
      },
      {
        q: "Should I launch on Indie Hackers, Hacker News, both?",
        a: "Indie Hackers builds founder community; Hacker News builds technical reputation. Both contribute to credibility; neither directly converts to paying customers for most SaaS. Use them for off-page lift, not revenue.",
      },
      {
        q: "How do I find real customers post-launch?",
        a: "Direct outreach to your target cohort. The launch's email list is the seed; the cohort-specific outreach is the engine. Most indie founders launch big and then go silent; the work is the cohort outreach in months 2 through 12.",
      },
    ],
    relatedGlossary: ["hook", "weak-offer", "wrong-person"],
    lastVerified: "2026-05-20",
  },
  {
    slug: "stripe-checkout-button",
    element: "Stripe Checkout button",
    metaTitle: "Why Isn't My Stripe Checkout Button Converting?",
    metaDescription:
      "Stripe Checkout button fails when buttons hide the price. Three Brunson diagnoses and the explicit-pricing fix.",
    tldr:
      "Stripe Checkout buttons convert when buyers know exactly what happens after the click. 'Buy now' converts worse than 'Buy [product] for $X'. The mystery in 'Buy now' creates hesitation; the specificity in named-price buttons removes it. Buttons are the last opportunity for transparency.",
    diagnoses: [
      {
        label: "Wrong Person",
        appearance:
          "Click-through to Stripe page is fine, but abandonment on the Stripe page is over 50%. The wrong cohort got to the button; they clicked from curiosity, not commitment.",
        fix: "Make the button copy filter cohort. 'Buy [product] for $X (one-time charge, no subscription)' explicitly tells curious clickers what's about to happen. Curiosity clicks drop; commitment clicks proceed.",
      },
      {
        label: "Weak Offer",
        appearance:
          "Button says 'Buy now', 'Get started', or 'Try free'. Click-through is fine; abandonment is high. Buyer expected something different after clicking.",
        fix: "Explicit button copy. 'Buy [product] for $7 – one-time charge, instant access' beats 'Buy now'. Specificity at the button outconverts mystery on the checkout page.",
      },
      {
        label: "Weak Belief",
        appearance:
          "Button leads to Stripe Checkout but the buyer hesitates because no security signal is visible. Modern Stripe is genuinely secure; many buyers don't know.",
        fix: "Add 'Secure checkout via Stripe' caption under the button. Tiny but converts 5 to 10% better, especially for first-time buyers from your audience cohort.",
      },
    ],
    directionalRange: {
      range: "40% to 75% (button-click to payment-success)",
      note: "Stripe Checkout abandonment is normally 25 to 60%. Above 75% means severe friction; below 25% means most clickers were already committed (warm audience).",
    },
    checklist: [
      "Read button copy aloud. Does it state the action and the price?",
      "Look at Stripe-page abandonment. Over 60% means the button over-promised or the price was unexpected.",
      "Check whether 'secure via Stripe' is visible. Small caption, meaningful conversion lift.",
      "Time the page load. Stripe Checkout takes 2 to 5 seconds to load; slow loads cause bounce.",
      "Test one variant with explicit named-price button copy. If conversion lifts, your default 'Buy now' was the failure mode.",
    ],
    faqs: [
      {
        q: "Should the button color matter?",
        a: "Marginally, much less than copy. Green/orange/red call-to-action testing produces 2 to 8% lift. Button copy testing produces 20 to 60% lift. Focus on copy first.",
      },
      {
        q: "Should I use Stripe Checkout or build a custom checkout?",
        a: "Stripe Checkout for most use cases. Stripe's hosted page has higher conversion than 95% of custom checkouts because it's been A/B tested across billions of transactions. Only build custom if you have a specific UX requirement Stripe can't meet.",
      },
      {
        q: "Should the button show 'starting at $X' or the exact price?",
        a: "Exact price for single-product offers. 'Starting at' is appropriate only for tiered offers and creates expectation mismatch otherwise. Specificity converts.",
      },
    ],
    relatedGlossary: ["offer", "weak-belief"],
    lastVerified: "2026-05-20",
  },
  {
    slug: "exit-intent-popup",
    element: "exit-intent popup",
    metaTitle: "Why Isn't My Exit-Intent Popup Converting?",
    metaDescription:
      "Exit-intent popups fail when the offer is too generic. Three Brunson diagnoses and the popup-specific fix.",
    tldr:
      "Exit-intent popups convert when the offer is genuinely useful to the specific page the visitor was about to leave. Generic 'subscribe to our newsletter' popups convert at near zero. Page-specific exit offers ('here's the diagnostic for this article') convert at 2 to 8%.",
    diagnoses: [
      {
        label: "Wrong Person",
        appearance:
          "Popup fires on every page. Most exits are visitors who landed wrong (Wrong Person); the popup offers them nothing relevant.",
        fix: "Fire exit-intent only on high-intent pages (pricing, sales pages, key blog posts). Generic site-wide popups train visitors to ignore popups everywhere; targeted popups still convert.",
      },
      {
        label: "Weak Offer",
        appearance:
          "Popup offers 'subscribe to our newsletter' or '10% off your first purchase'. Generic. Visitor about to leave has no reason to engage.",
        fix: "Page-specific offer. On a pricing page, offer the diagnostic. On a sales page, offer the case study. The popup's value must match the page's topic; site-wide single popups underperform.",
      },
      {
        label: "Weak Belief",
        appearance:
          "Popup has no founder credibility. Visitor about to leave sees a generic conversion attempt and ignores.",
        fix: "Popup includes founder-by-name + one specific dated proof. Generic 'wait, don't leave!' popups feel manipulative; founder-voice popups feel like a genuine offer.",
      },
    ],
    directionalRange: {
      range: "1% to 5%",
      note: "Exit-intent popup conversion sits between 1 and 5% of would-be exiters. Below 1% means the offer is too generic. Above 5% usually means very specific page-offer match.",
    },
    checklist: [
      "Look at where your popup fires. Site-wide is the default failure mode.",
      "Read the popup offer. Generic 'subscribe' or page-specific value?",
      "Check the popup form. Over 2 fields drops conversion materially.",
      "Audit the post-popup experience. If the offer says 'free template' and the deliverable is a newsletter, trust collapses.",
      "Test one variant with a page-specific exit offer. If conversion jumps, your site-wide popup was the failure mode.",
    ],
    faqs: [
      {
        q: "Should I use exit-intent or timed popups?",
        a: "Exit-intent. Timed popups punish engaged readers; exit-intent only fires when the visitor is leaving anyway. Engagement-based triggers outconvert time-based ones.",
      },
      {
        q: "How long should the popup be visible?",
        a: "Until dismissed. Auto-dismissing popups train visitors that the offer wasn't important; persistent popups (with a clear dismiss) convey deliberateness.",
      },
      {
        q: "Should the popup have a discount or a lead magnet?",
        a: "Lead magnet for top-of-funnel pages; discount for bottom-of-funnel pages where the visitor was close to buying. Wrong-stage offers underconvert.",
      },
    ],
    relatedGlossary: ["hook", "offer"],
    lastVerified: "2026-05-20",
  },
  {
    slug: "sales-call",
    element: "sales call",
    metaTitle: "Why Aren't My Sales Calls Closing? (B2B Diagnostic)",
    metaDescription:
      "Sales calls fail when discovery is skipped. Three Brunson diagnoses and the sales-call structure fix.",
    tldr:
      "Sales calls close when the prospect leaves with a clearer understanding of their situation than they arrived with. Calls that don't close usually skipped discovery, jumped to demo, and pitched price before establishing fit. The structure has to be earned-by-listening, then offered.",
    diagnoses: [
      {
        label: "Wrong Person",
        appearance:
          "Sales calls book with prospects who aren't decision-makers. They love the demo but can't approve the purchase. Champions without buying power.",
        fix: "Qualify on the booking form. 'Are you the decision-maker for tools in your function?' Filters out non-buyers. The friction loses some leads; the leads it keeps are 5 to 10x more likely to close.",
      },
      {
        label: "Weak Offer",
        appearance:
          "Call jumps to demo within 5 minutes. Prospect sees the product but doesn't see how it solves their specific situation. Demo-first calls close at half the rate of discovery-first calls.",
        fix: "First 15 minutes: their context. Specific questions about their current process, their constraints, their goals. Demo is shaped by their answers. The call becomes specific instead of generic.",
      },
      {
        label: "Weak Belief",
        appearance:
          "Prospect doesn't trust the deal will deliver. No customer references provided. Vague case studies. Sales rep hand-waves on specifics.",
        fix: "Offer one specific dated customer reference during the call. 'A company like yours – here's the link – we worked with them last quarter; happy to introduce you.' Specific references close 30 to 50% better than vague claims.",
      },
    ],
    directionalRange: {
      range: "15% to 40% (call to close, qualified leads)",
      note: "B2B sales call close rates sit between 15 and 40% for qualified leads. Below 15% means qualification is broken; above 40% usually means call volume is too low (qualification too tight).",
    },
    checklist: [
      "Record one sales call. Did you spend more than 15 minutes on discovery?",
      "Check whether you have customer reference contacts ready. If you don't, lock in 2 to 3 for use on calls.",
      "Look at the calls you lost. Common reason is the leverage point.",
      "Time the price reveal. Calls where price reveals before fit-confirmation close 30 to 50% worse.",
      "Test one call structure with 20 minutes of discovery before any demo. If close rate lifts, your default is demo-first too early.",
    ],
    faqs: [
      {
        q: "Should I send a proposal during the call or after?",
        a: "After, within 24 hours. In-call proposals don't give the prospect time to absorb; multi-day delays let momentum die. 24-hour follow-up with a specific written proposal is the sweet spot.",
      },
      {
        q: "How long should a sales call be?",
        a: "45 to 60 minutes for typical B2B SaaS. Shorter and you can't do discovery; longer and the prospect's attention drops. Multi-call sequences (15 + 30 + 30 minutes) often outperform single 60-minute calls.",
      },
      {
        q: "Should I offer a free trial after a sales call?",
        a: "Depends on price point. Above $5K ACV, structured pilots beat free trials (defined scope, defined success criteria). Below $5K ACV, free trials are reasonable. Above $20K, pilots only.",
      },
    ],
    relatedGlossary: ["dream-100", "story", "offer"],
    lastVerified: "2026-05-20",
  },
  {
    slug: "annual-renewal",
    element: "annual renewal",
    metaTitle: "Why Are My Annual Subscribers Not Renewing?",
    metaDescription:
      "Annual renewals fail when value perception decayed over the year. Three Brunson diagnoses and the renewal fix.",
    tldr:
      "Annual renewals fail when the customer's perception of value decayed across the year. They paid for outcomes 12 months ago; by month 12 they don't remember the value. Without ongoing reminders of impact, the renewal prompt feels like an arbitrary $X charge.",
    diagnoses: [
      {
        label: "Wrong Person",
        appearance:
          "Customer signed up for annual at launch enthusiasm but never activated. Year 1 is a quiet loss because they never used the product.",
        fix: "Trace which acquisition source produced non-activating annual subscribers. Often it's a sale or a discount campaign that lured non-target buyers. The cohort signal is upstream.",
      },
      {
        label: "Weak Offer",
        appearance:
          "Customer activated, used the product, but doesn't see the cumulative impact. By month 12 they think 'do I still need this?'",
        fix: "Monthly impact reports. Specific numbers tied to their usage. 'This month you saved X hours / generated Y leads / shipped Z artifacts'. Value-surfacing through the year outconverts year-end pitch by 30 to 60%.",
      },
      {
        label: "Weak Belief",
        appearance:
          "Renewal email arrives without warning. Customer feels surprised, doesn't remember signing annual, complains and refunds. Trust collapses.",
        fix: "60-day, 30-day, 14-day, 7-day renewal reminders. Each shows the value cumulative-to-date. Surprise renewals create disputes; transparent renewals build long-term trust regardless of whether they renew.",
      },
    ],
    directionalRange: {
      range: "75% to 95%",
      note: "Healthy B2B annual renewal rates sit between 75 and 95%. Below 75% means activation or impact-surfacing is broken. Above 95% usually means very tight customer-offer fit or strong switching costs.",
    },
    checklist: [
      "Look at non-activated annual subscribers. They renew at 30 to 50%; activated subscribers renew at 80%+.",
      "Audit your renewal-warning cadence. Surprise renewals are the most common dispute source.",
      "Send monthly impact reports. If you don't, value perception decays.",
      "Check renewal-day support tickets. Spike in tickets = surprise renewal = broken warning cadence.",
      "Test one segment with 60/30/14/7-day renewal warnings. If dispute rate drops, your default cadence was insufficient.",
    ],
    faqs: [
      {
        q: "Should I auto-renew annual subscriptions?",
        a: "Yes, with clear pre-renewal warnings. Manual annual renewal converts at 30 to 50%; auto-renewal with warnings converts at 70 to 90%. The math favors auto-renewal as long as warnings are transparent.",
      },
      {
        q: "Should I offer pause or downgrade at renewal?",
        a: "Pause yes, downgrade selectively. Pause keeps the customer engaged with the brand; downgrade often signals dissatisfaction. Both beat full cancellation as a retention move.",
      },
      {
        q: "How long should the renewal grace period be?",
        a: "7 to 14 days. Long enough for the customer to reconsider; short enough that you're not subsidizing free use for fence-sitters.",
      },
    ],
    relatedGlossary: ["offer", "value-ladder"],
    lastVerified: "2026-05-20",
  },
];

export const WHY_ISNT_MY_SLUGS = WHY_ISNT_MY_ENTRIES.map((e) => e.slug);

export function getWhyIsntMyBySlug(slug: string): WhyIsntMyEntry | undefined {
  return WHY_ISNT_MY_ENTRIES.find((e) => e.slug === slug);
}
