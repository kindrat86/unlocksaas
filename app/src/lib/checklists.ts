/**
 * /checklist/[slug] pSEO catalog — pre-revenue indie SaaS checklists.
 *
 * Each entry is a finite, ordered list of concrete steps a founder can
 * tick off before a defined event (launch, first charge, first email
 * broadcast, etc.). Each step names the action and the done-condition.
 *
 * Schema strategy: HowTo + ItemList + Article + FAQPage + BreadcrumbList.
 * HowTo is the right schema for ordered actionable steps; AI Overviews
 * and Google Search use it for "checklist" queries. ItemList carries the
 * raw enumeration. Article carries the narrative copy around the steps.
 *
 * Brunson Hard-Rule reconciliation: no aspirational steps, no fabricated
 * tools, no invented benchmarks. Every step is something we have already
 * verified is required pre-launch by the diagnostic engine or shipped
 * teardowns. The dated lastVerified surfaces drift.
 */

export interface ChecklistStep {
  /** Imperative title. */
  title: string;
  /** What to do, in 1-3 sentences. */
  description: string;
  /** Observable done-condition. */
  doneWhen: string;
}

export interface ChecklistFaq {
  q: string;
  a: string;
}

export interface ChecklistEntry {
  /** URL slug, kebab-case. */
  slug: string;
  /** Human-readable display name. */
  displayName: string;
  /** SEO meta title, under 60 chars. */
  metaTitle: string;
  /** SEO meta description, under 160 chars. */
  metaDescription: string;
  /** 2-3 sentence intro. */
  intro: string;
  /** What triggers running this checklist. */
  whenToRun: string;
  /** The pre-event milestone this prepares for. */
  beforeEvent: string;
  /** Ordered steps. */
  steps: ReadonlyArray<ChecklistStep>;
  /** Related glossary slugs. */
  relatedGlossary: ReadonlyArray<string>;
  /** Related why-isnt-my elements (if this checklist relates to one). */
  relatedWhyIsntMy: ReadonlyArray<string>;
  /** FAQ block. */
  faqs: ReadonlyArray<ChecklistFaq>;
  /** ISO date last verified. */
  lastVerified: string;
}

export const CHECKLIST_ENTRIES: ReadonlyArray<ChecklistEntry> = [
  {
    slug: "pre-launch-saas-checklist",
    displayName: "Pre-launch indie SaaS checklist",
    metaTitle: "Pre-Launch Indie SaaS Checklist (Brunson)",
    metaDescription:
      "The 10-item checklist every indie SaaS should pass before public launch. Diagnostic-grade — each item names a done-condition you can verify.",
    intro:
      "The pre-launch checklist names the ten things every indie SaaS must verify before sending a single visitor to the site. Each step has a done-condition that is observable, not aspirational. Skipping any of the ten is what turns a launch into a learning experience instead of a customer.",
    whenToRun:
      "In the final week before public launch — after the product works end-to-end but before you tell anyone about it.",
    beforeEvent: "Public launch (the first cold-traffic visitor)",
    steps: [
      {
        title: "Name one specific real person you are selling to",
        description:
          "Write down the name, role, place of work, and one sentence about the problem they are paying you to solve. Not 'developers' — one named developer.",
        doneWhen:
          "A 50-word person-profile document exists, names a real person, and could be read aloud at a meetup without sounding generic.",
      },
      {
        title: "Write the above-the-fold block for that person",
        description:
          "One H1 (outcome), one sub-hook (positioning), one CTA (outcome verb), one trust element (verifiable detail). Maximum four sentences total.",
        doneWhen:
          "The above-the-fold block fits in 600px of vertical space on mobile and the named person can repeat the offer in one sentence after reading it.",
      },
      {
        title: "Set up one Stripe product with one price",
        description:
          "One product, one price, one Stripe payment link or checkout session. No tiers, no add-ons, no annual discount on launch day.",
        doneWhen:
          "A real test charge in test mode succeeds end-to-end, including the receipt email.",
      },
      {
        title: "Show the price on the page",
        description:
          "The price is on the pricing section and the CTA area, not buried in a contact form. Showing pricing is non-negotiable below the $1,000/month threshold.",
        doneWhen:
          "The price is visible above the fold on the pricing section without requiring scroll or click.",
      },
      {
        title: "Write one honest guarantee",
        description:
          "Specific outcome + time window + named verifier (Stripe, a counter, a third party) + refund mechanism. Vague 'love it or your money back' under-converts.",
        doneWhen:
          "The guarantee names a verifier the customer trusts more than you, and the refund mechanism is documented end-to-end.",
      },
      {
        title: "Set up one transactional email path",
        description:
          "Stripe webhook → confirmation email → access link. One path, no marketing emails yet. The transactional email must land in the inbox, not promotions.",
        doneWhen:
          "A real test purchase delivers a confirmation email to a Gmail and an Outlook inbox within two minutes.",
      },
      {
        title: "Write the FAQ block from real objections",
        description:
          "Five to eight specific objections you have heard from real people, with the answer you would give over email. No invented questions, no marketing FAQ.",
        doneWhen:
          "Every question in the FAQ block is one you have heard from at least one real person.",
      },
      {
        title: "Set up one analytics path",
        description:
          "One analytics tool, one funnel event sequence (visit → CTA click → checkout view → purchase). PostHog, Plausible, or similar — not three tools.",
        doneWhen:
          "A real test session produces an event in the analytics tool within five minutes and the funnel report shows the four steps in order.",
      },
      {
        title: "Verify the page on mobile",
        description:
          "Real device, not Chrome devtools. Tap the CTA, complete the checkout, read the confirmation email — on the same phone.",
        doneWhen:
          "The full purchase flow completes on a real phone in under two minutes without zooming or horizontal scrolling.",
      },
      {
        title: "Write the launch message to ten specific people",
        description:
          "Ten named people, ten personalized messages, ready to send the morning of launch. Not a broadcast — ten direct messages.",
        doneWhen:
          "Ten messages are drafted, named, and queued; each names a specific reason this product is relevant to that specific person.",
      },
    ],
    relatedGlossary: ["hook", "offer", "wrong-person", "weak-offer"],
    relatedWhyIsntMy: ["landing-page", "checkout"],
    faqs: [
      {
        q: "Is this checklist enough? Should I do more before launch?",
        a: "Yes, this is enough. Most pre-launch checklists are 30-50 items long and the extras come from feature checklists, security audits, and marketing-team artifacts that pre-revenue indie SaaS founders do not need. Ten observable items, executed honestly, beats fifty items half-done.",
      },
      {
        q: "What if I cannot tick off one of the ten?",
        a: "Stop and fix that one. The ten are sequential — each step depends on the earlier ones holding. A pre-launch checklist with an unchecked item is not 90% ready; it is broken at one specific surface.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "before-you-charge-money-checklist",
    displayName: "Before-you-charge-money checklist",
    metaTitle: "Before You Charge Money Checklist (SaaS)",
    metaDescription:
      "The eight things every indie SaaS must verify before accepting the first dollar. Refund-trigger discipline, not features.",
    intro:
      "Before you accept the first dollar from the first paying customer, eight things must be verifiable end-to-end. Each item is something that, if broken, becomes a refund trigger. Run this checklist on the same day you turn Stripe live mode on.",
    whenToRun:
      "On the day you switch Stripe from test mode to live mode — before the first real charge runs.",
    beforeEvent: "First real (live-mode) Stripe charge",
    steps: [
      {
        title: "Test a $1 real charge end-to-end",
        description:
          "Charge yourself $1 on a real card in live mode. Verify the charge appears in Stripe Dashboard, the receipt arrives, the access link works, and the refund completes cleanly.",
        doneWhen:
          "A live $1 charge to a real card has been issued, received, refunded, and the refund email has arrived in the inbox.",
      },
      {
        title: "Verify the refund mechanism",
        description:
          "Issue a refund from the Stripe Dashboard for the $1 charge above. Time how long it takes; document the steps so a future-you under stress can find them.",
        doneWhen:
          "The refund completes, the refund email arrives, and the refund process is documented in a known location (Notion, README, etc.).",
      },
      {
        title: "Document the customer-facing refund policy",
        description:
          "One page with the refund window, the trigger, the verifier, and the contact method. Linked from the checkout page and the footer.",
        doneWhen:
          "The refund policy page is live, linked from the footer, and tells a customer exactly how to ask for a refund.",
      },
      {
        title: "Verify the customer-support email path",
        description:
          "A real human-readable contact email. Not a no-reply address. Customers must be able to reach you with one email.",
        doneWhen:
          "An external email sent to the support address reaches a human inbox within one hour during business hours.",
      },
      {
        title: "Set up Stripe receipt branding",
        description:
          "Stripe Dashboard → Settings → Branding. Logo, color, and from-address on the receipt match the rest of the brand.",
        doneWhen:
          "A receipt from the test charge shows the correct logo, color, and from-address.",
      },
      {
        title: "Verify the access-delivery path under failure",
        description:
          "Simulate a failed webhook (kill the listener, then re-send). The customer must still receive access. Webhook idempotency is non-negotiable.",
        doneWhen:
          "A failed-then-retried webhook results in the customer receiving access exactly once, not zero times or twice.",
      },
      {
        title: "Test the receipt-to-access flow on a fresh device",
        description:
          "Open the receipt email on a phone you have not used for development. Click the access link. Verify it works without a cached session.",
        doneWhen:
          "A fresh-device access click works first time without requiring login or copy-paste of an access code.",
      },
      {
        title: "Issue yourself a real refund and confirm",
        description:
          "Run the refund flow on the test charge from step 1. Time it. The refund must complete in your own dashboard view as well as in Stripe.",
        doneWhen:
          "The refund completes, the receipt is updated to refunded, and your own access shows revoked.",
      },
    ],
    relatedGlossary: ["offer", "weak-belief", "verified-builder"],
    relatedWhyIsntMy: ["checkout"],
    faqs: [
      {
        q: "Do I need a written refund policy for $1 products?",
        a: "Yes. Stripe requires one, card networks require one, and the absence of one is a Brunson Hard-Rule violation. Even a one-paragraph refund policy linked from the checkout is enough.",
      },
      {
        q: "What if my refund volume turns out to be high?",
        a: "A 2-8% refund rate within the guarantee window is healthy. Above 8%, treat it as an offer-fit signal, not a refund-policy problem. The fix is the offer, not the policy.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "first-paying-customer-checklist",
    displayName: "First-paying-customer checklist",
    metaTitle: "First Paying Customer Checklist (Indie SaaS)",
    metaDescription:
      "What to do in the 48 hours after the first paying customer charges. Onboarding, follow-up, testimonial path, and verification.",
    intro:
      "The first paying customer is a one-time event. The 48 hours after the charge clears decide whether you have a customer or a refund. The seven steps below sequence the work — onboarding, follow-up, testimonial collection, and Stripe verification — into a single visible path.",
    whenToRun:
      "Within 48 hours of the first paying customer charge clearing.",
    beforeEvent: "Adding the customer to the Verified Builders directory",
    steps: [
      {
        title: "Send a one-sentence personal thank-you within four hours",
        description:
          "Not the receipt email — a separate one-sentence message from a real founder address. No template, no upsell, no signature graphic.",
        doneWhen:
          "A real one-sentence email from the founder address has been sent within four hours of the charge, and is not the automated receipt.",
      },
      {
        title: "Verify the customer can actually use the product",
        description:
          "Watch the access-delivery webhook fire. Confirm the customer landed on the right surface. If they bounced from the access link, fix the path before doing anything else.",
        doneWhen:
          "The customer has loaded the post-purchase surface and stayed long enough to interact with it (analytics confirms a non-bounce session).",
      },
      {
        title: "Schedule the day-3 follow-up",
        description:
          "A second personal message at the 72-hour mark, asking one specific question about whether the product is doing what the customer expected. Not 'how is it going?'",
        doneWhen:
          "A day-3 follow-up email is drafted, named to this customer, and scheduled or queued to send.",
      },
      {
        title: "Document the customer profile",
        description:
          "Name, role, company, where they came from (referrer or 'how did you hear about us'). One paragraph in your customer notes.",
        doneWhen:
          "A customer-profile note exists with name, role, company, and acquisition source.",
      },
      {
        title: "Plan the testimonial path",
        description:
          "Day 14 or after the first observable outcome, ask the customer for a one-sentence testimonial with a verifiable detail. Do not ask before the outcome lands.",
        doneWhen:
          "A calendar event is set for the testimonial ask, dated to either day 14 or to the first observable customer outcome — whichever comes first.",
      },
      {
        title: "Verify Stripe shows the cycle as expected",
        description:
          "Open Stripe Dashboard. Confirm the charge, the customer, and the subscription state (if recurring) match what you expected.",
        doneWhen:
          "The Stripe Dashboard view of this customer matches the local app view to the cent and to the date.",
      },
      {
        title: "Add the customer to the verified-builder pipeline",
        description:
          "If this customer is using your product to ship something themselves, log them as a candidate for the Verified Builders directory. Outcome verification happens in Stripe, not in survey responses.",
        doneWhen:
          "The customer is listed in the verified-builder pipeline with a 'pending Stripe-verified outcome' status and an expected verification window.",
      },
    ],
    relatedGlossary: ["verified-builder", "offer", "weak-belief"],
    relatedWhyIsntMy: ["checkout", "upsell"],
    faqs: [
      {
        q: "What if the first customer asks for a refund within the 48 hours?",
        a: "Issue the refund without friction, then write down what they told you about why. The 'I refunded my first customer' moment is a learning event, not a failure. The reason they gave is more valuable than the $X you would have kept by stalling.",
      },
      {
        q: "Should I publish the first customer's testimonial immediately?",
        a: "No. Ask after the first observable outcome, not after the first charge. A testimonial collected on day 1 is less trustworthy than one collected on day 14 with a verifiable detail.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "landing-page-publish-checklist",
    displayName: "Landing-page publish checklist",
    metaTitle: "Landing Page Publish Checklist (Indie SaaS)",
    metaDescription:
      "What to verify before a SaaS landing page goes live. Above-the-fold integrity, schema, analytics, social, and mobile fidelity.",
    intro:
      "The publish checklist names the eight things every indie SaaS landing page must pass before you tell anyone the URL. None are aspirational — each step has a done-condition you can verify with a tool in under two minutes.",
    whenToRun:
      "In the final hour before sharing the landing page URL with anyone outside your team.",
    beforeEvent: "Sharing the landing page URL publicly",
    steps: [
      {
        title: "Read the above-the-fold block aloud",
        description:
          "Read it to one person who is not on the team. If they cannot repeat the outcome in one sentence after reading it once, the block fails.",
        doneWhen:
          "A real person outside the team has read the block and repeated the outcome in one sentence.",
      },
      {
        title: "Verify the H1 and the meta title match the user query",
        description:
          "The H1 must contain the specific outcome a target visitor would type into Google. The meta title must reflect the same.",
        doneWhen:
          "The H1 contains the outcome phrase and the meta title contains the same phrase, and both fit their length budgets (H1: about 9 words; title: under 60 chars).",
      },
      {
        title: "Verify the JSON-LD structured data",
        description:
          "Open Google's Rich Results Test on the page URL. Confirm WebSite, Organization (or Person), and any product-specific schema (Product, FAQPage) render without errors.",
        doneWhen:
          "Google Rich Results Test reports zero errors and at least one valid item type.",
      },
      {
        title: "Test the page on a real phone",
        description:
          "Real device, not Chrome devtools. Tap the CTA, complete the checkout, read the confirmation email — on the same phone.",
        doneWhen:
          "Full path completes on a real phone in under two minutes without zooming or horizontal scrolling.",
      },
      {
        title: "Verify the page passes Core Web Vitals",
        description:
          "PageSpeed Insights or the live Web Vitals chrome extension. Largest Contentful Paint under 2.5s, INP under 200ms, CLS under 0.1.",
        doneWhen:
          "All three Core Web Vitals are in the green band on the mobile profile.",
      },
      {
        title: "Verify the analytics event sequence",
        description:
          "Open the page, click the CTA, view the checkout, complete a test purchase. Each step must produce one analytics event of the right name.",
        doneWhen:
          "The analytics funnel report shows the four steps in order within five minutes of the test session.",
      },
      {
        title: "Verify the social preview card",
        description:
          "Paste the URL into a Slack DM or Twitter compose box. Confirm the OG image, title, and description render correctly.",
        doneWhen:
          "The OG image is the right asset, the title is the meta title, and the description is the meta description.",
      },
      {
        title: "Verify the page is in the sitemap",
        description:
          "Open /sitemap.xml or /sitemap. The new page URL must appear with the right last-modified date.",
        doneWhen:
          "The page URL is in the sitemap with a current last-modified timestamp.",
      },
    ],
    relatedGlossary: ["hook", "offer", "wrong-person"],
    relatedWhyIsntMy: ["landing-page", "opt-in"],
    faqs: [
      {
        q: "Should I submit the URL to Google Search Console after publish?",
        a: "Yes. URL Inspection → Request indexing. Indexing is not guaranteed, but the request is free and the page is on Google's queue faster than it would be otherwise.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "first-email-broadcast-checklist",
    displayName: "First email broadcast checklist",
    metaTitle: "First Email Broadcast Checklist (SaaS)",
    metaDescription:
      "What to verify before sending the first broadcast to your list. Sender reputation, content, list health, and Brunson voice.",
    intro:
      "The first broadcast to a real email list is the moment your sender reputation is born or burned. The seven steps below verify domain authentication, list health, content discipline, and the Brunson voice before any send button is pushed.",
    whenToRun:
      "Before the first broadcast to a list larger than 50 verified subscribers.",
    beforeEvent: "First broadcast send",
    steps: [
      {
        title: "Verify SPF, DKIM, and DMARC are set on the sending domain",
        description:
          "Use mail-tester.com or mxtoolbox to confirm all three records are present and aligned. Missing DMARC is the most common cause of inbox-vs-spam.",
        doneWhen:
          "mail-tester scores 9/10 or better on the test send.",
      },
      {
        title: "Warm the sending domain if it is new",
        description:
          "If the sending domain has sent fewer than 500 emails, ramp up over 2-3 weeks. Hitting a 5,000-person list cold from a new domain almost guarantees inbox placement failure.",
        doneWhen:
          "The sending domain has sent 500+ emails to verified inboxes with normal open rates (20-40%) and zero unverified bounces.",
      },
      {
        title: "Clean the list of unconfirmed subscribers",
        description:
          "Remove every subscriber who has not opened anything in 90+ days. Bounce rate above 2% on the first send torches sender reputation faster than any content choice.",
        doneWhen:
          "The list is free of subscribers with no engagement in 90+ days and the projected bounce rate is below 1%.",
      },
      {
        title: "Verify the unsubscribe link works",
        description:
          "Send the test broadcast to yourself, click unsubscribe, confirm the database state changed and a confirmation page loaded.",
        doneWhen:
          "A test unsubscribe round-trips end-to-end and the database state is updated.",
      },
      {
        title: "Write the broadcast in Seinfeld-email shape",
        description:
          "Specific subject line referencing a specific thing, plain text body, one CTA at the bottom. No hero images, no fancy templates, no marketing flourish.",
        doneWhen:
          "The broadcast renders correctly in plain-text-only clients and the subject line is under 50 characters.",
      },
      {
        title: "Verify the from-name and reply-to address",
        description:
          "From-name should be a real human, not 'Team Acme'. Reply-to should hit a real inbox a human reads.",
        doneWhen:
          "From-name is a human name, and a test reply arrives in a real human inbox within the hour.",
      },
      {
        title: "Send a test broadcast to a small segment first",
        description:
          "5-10% of the list, 30 minutes before the main send. Watch the open and reply rate for 30 minutes; if the segment lands cleanly, send to the rest.",
        doneWhen:
          "The pilot send completes with an open rate consistent with prior list behavior and no immediate spam complaints.",
      },
    ],
    relatedGlossary: ["seinfeld-email", "soap-opera-sequence", "offer"],
    relatedWhyIsntMy: ["email-open"],
    faqs: [
      {
        q: "Should the first broadcast pitch the product?",
        a: "No. The first broadcast establishes deliverability and engagement; pitching diminishes both. Save the pitch for the third or fourth broadcast, after the inbox path is proven.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "tripwire-launch-checklist",
    displayName: "Tripwire launch checklist",
    metaTitle: "Tripwire Launch Checklist (Brunson Indie SaaS)",
    metaDescription:
      "The 9-item checklist for shipping a Brunson tripwire funnel. Front-end, OTO, follow-up sequence, refund mechanism, attribution.",
    intro:
      "A tripwire is not a discounted product — it is an intent-verification mechanism with a specific funnel structure around it. The nine steps below ship the front-end, the OTO, the 14-day follow-up, the refund mechanism, and the attribution path that turns a tripwire into a working funnel.",
    whenToRun:
      "Before launching the first tripwire offer to paid or organic traffic.",
    beforeEvent: "Sending paid or organic traffic to the tripwire offer",
    steps: [
      {
        title: "Set the tripwire price between $1 and $27",
        description:
          "The tripwire's job is to verify intent, not earn revenue. $1 to $27 is the band where the buyer makes a real decision but does not negotiate. Above $27 the buyer over-thinks; below $1 the signal weakens.",
        doneWhen:
          "The tripwire price is between $1 and $27 and is justifiable as a real product, not a placeholder.",
      },
      {
        title: "Write the tripwire offer page with one specific outcome",
        description:
          "One headline, one outcome promise, one stack slide (minimal — 1-3 components), one guarantee, one CTA. Total page length under 1,000 words.",
        doneWhen:
          "The offer page is under 1,000 words, has exactly one CTA, and a cold reader can repeat the outcome after reading once.",
      },
      {
        title: "Set up the OTO at 2x-5x the tripwire price",
        description:
          "An OTO between $19 and $97 (when the tripwire is $1-$27). The OTO must extend the just-made decision, not introduce a new one.",
        doneWhen:
          "The OTO is priced at 2x-5x the tripwire, exists on the same Stripe customer record, and the offer-page copy extends the tripwire's frame (does not pivot to a new one).",
      },
      {
        title: "Set up the OTO downsell or no-thank-you path",
        description:
          "Customers who decline the OTO must land on a confirmation page, not a sales loop. Re-prompting the OTO is a trust break.",
        doneWhen:
          "Declining the OTO routes the customer to the access page; the OTO never re-displays in the same session.",
      },
      {
        title: "Write the 14-day follow-up sequence",
        description:
          "Five to seven Seinfeld-style emails over 14 days. Each names a specific outcome or objection. No promo blast; the sequence is the funnel.",
        doneWhen:
          "The 14-day sequence is drafted, scheduled, and a test run lands all messages on time in a real inbox.",
      },
      {
        title: "Set up the refund mechanism end-to-end",
        description:
          "Stripe refund + access revoke + refund-confirmation email. The customer must be able to ask for a refund via one reply and receive it within one business day.",
        doneWhen:
          "A test refund processes within one business day and access is revoked at the same time the refund clears.",
      },
      {
        title: "Set up attribution end-to-end",
        description:
          "UTM-tag every traffic source. The Stripe customer must carry the source as metadata. Without source attribution you cannot tell which channel converted.",
        doneWhen:
          "Test purchases from three different UTM sources show the right source in Stripe customer metadata.",
      },
      {
        title: "Set the 30-day ROAS calculation window",
        description:
          "Tripwire ROAS at 24 hours is misleading. Compute over 30 days: tripwire + OTO + sequence conversions, divided by ad spend.",
        doneWhen:
          "The ROAS calculation includes a 30-day window and the dashboard or spreadsheet shows the full four-source total (tripwire, OTO, sequence, core).",
      },
      {
        title: "Mirror the guarantee on the OTO",
        description:
          "Asymmetric guarantees between front-end and OTO are a trust break. The OTO must carry the same window and the same refund path.",
        doneWhen:
          "The OTO offer page displays the same guarantee window and refund mechanism as the tripwire offer page.",
      },
    ],
    relatedGlossary: ["offer", "stack-slide", "value-ladder", "soap-opera-sequence"],
    relatedWhyIsntMy: ["tripwire", "upsell", "checkout"],
    faqs: [
      {
        q: "Can I launch a tripwire without an OTO?",
        a: "Technically yes, structurally no. A tripwire without an OTO is missing the unit economics that make the front-end break-even sustainable. Adding the OTO is one extra page and one extra Stripe setup intent — the ROI is substantial.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "checkout-conversion-checklist",
    displayName: "Checkout conversion checklist",
    metaTitle: "Checkout Page Conversion Checklist (SaaS)",
    metaDescription:
      "What to verify on a SaaS checkout to keep abandonment under 25%. Friction, trust signals, payment options, and mobile.",
    intro:
      "Checkout abandonment is the highest-impact, lowest-cost surface to fix in indie SaaS. The seven items below name the elements proven to hold or lose the buyer at the moment of payment.",
    whenToRun:
      "Within the first week after live mode is on, or any time observed checkout abandonment exceeds 30%.",
    beforeEvent: "Sending any optimized traffic to the checkout",
    steps: [
      {
        title: "Verify the guarantee is visible on the checkout",
        description:
          "Not just on the sales page. The guarantee must repeat at the moment the buyer types in card details. Buried guarantees do not lift conversion.",
        doneWhen:
          "The guarantee block is visible on the checkout page without scroll on mobile.",
      },
      {
        title: "Verify the price summary matches the sales page",
        description:
          "Identical to the cent. Tax handling, currency, and the cadence (one-time / monthly / annual) must match the buyer's expectation.",
        doneWhen:
          "The checkout-page price summary matches the sales-page price exactly, including currency and cadence label.",
      },
      {
        title: "Eliminate optional fields",
        description:
          "Phone number, company name, VAT ID unless mandatory — gone. Every optional field that is not strictly required for the transaction is a tax on conversion.",
        doneWhen:
          "Every field on the checkout is either required for the transaction or removed.",
      },
      {
        title: "Offer Apple Pay and Google Pay where supported",
        description:
          "One-tap pay paths lift mobile conversion. Stripe Checkout enables them with one flag.",
        doneWhen:
          "Apple Pay and Google Pay are visible options on the checkout for any device that supports them.",
      },
      {
        title: "Verify the page on a real phone",
        description:
          "Real device, not Chrome devtools. Complete a real test purchase on mobile. Time the full flow from CTA click to confirmation email.",
        doneWhen:
          "Full checkout flow completes on a real phone in under 90 seconds.",
      },
      {
        title: "Set up cart-recovery email",
        description:
          "A single email sent 4-8 hours after abandonment. One short message, one CTA back to the checkout, one human-readable from-address. Not a sequence.",
        doneWhen:
          "Cart abandonment triggers exactly one recovery email within 8 hours, from a human-readable address.",
      },
      {
        title: "Verify the post-purchase confirmation page",
        description:
          "Not just the receipt. A real post-purchase page with what-happens-next, the access link, and one reassurance element (e.g. founder photo + one line).",
        doneWhen:
          "A real test purchase lands on a real post-purchase page within two seconds of charge confirmation, and the page tells the buyer exactly what happens next.",
      },
    ],
    relatedGlossary: ["offer", "weak-belief"],
    relatedWhyIsntMy: ["checkout"],
    faqs: [
      {
        q: "What is a good checkout abandonment rate?",
        a: "Below 30% is healthy; below 20% is excellent. Above 40% is almost always a checkout-page problem rather than an offer problem. Run the checklist above before re-pricing.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "cold-outreach-message-checklist",
    displayName: "Cold-outreach message checklist",
    metaTitle: "Cold-Outreach Message Checklist (Indie SaaS)",
    metaDescription:
      "What to verify before sending a cold outreach message. Personalization, brevity, specific ask, deliverability, follow-up plan.",
    intro:
      "Cold outreach for indie SaaS is one of the highest-leverage pre-revenue motions. The eight items below name the elements that distinguish a working cold message from a spam-looking one.",
    whenToRun:
      "Before sending the first cold outreach message to a target on your dream-100 list.",
    beforeEvent: "Sending the first cold outreach message",
    steps: [
      {
        title: "Verify the recipient is on the dream-100 list",
        description:
          "Not a scraped list. A named, specific person you would be proud to have as a customer. If you cannot say why this person specifically, do not send.",
        doneWhen:
          "The recipient is on the named dream-100 list and you can articulate the specific reason this person fits.",
      },
      {
        title: "Reference one specific thing about the recipient",
        description:
          "Not 'I saw your company' — one specific thing they did, said, or shipped. The reference must be verifiable from their public footprint.",
        doneWhen:
          "The message names one specific verifiable thing about the recipient that is not from their LinkedIn headline.",
      },
      {
        title: "Keep the message under 100 words",
        description:
          "Under 100 words. Under 75 is better. The job of a cold message is to earn a one-line reply, not to close.",
        doneWhen:
          "The message is under 100 words measured at send time (not draft time).",
      },
      {
        title: "End with one specific ask",
        description:
          "Not 'let me know what you think'. A specific yes/no question or a single 15-minute calendar offer with a real link.",
        doneWhen:
          "The message ends with one question the recipient can answer with one sentence.",
      },
      {
        title: "Verify deliverability of the sending domain",
        description:
          "SPF, DKIM, DMARC aligned. If sending from a new domain, do not start with cold outreach — start with warm-up.",
        doneWhen:
          "mail-tester.com scores the sending domain 9/10 or better.",
      },
      {
        title: "Send from a real human address with a real signature",
        description:
          "From-name is a human name, signature has a real link to a real profile. No 'Team Acme', no marketing graphics in signature.",
        doneWhen:
          "From-name and signature are human-readable and the recipient can verify the sender exists at the named company in under 30 seconds.",
      },
      {
        title: "Plan exactly one follow-up message",
        description:
          "One follow-up at the 4-7 day mark. Adding more in advance is the failure mode. The follow-up references the original one-sentence thread, not 'just bumping this'.",
        doneWhen:
          "Exactly one follow-up is queued for the 4-7 day mark, drafted, and references the original message specifically.",
      },
      {
        title: "Verify the reply-to inbox is monitored",
        description:
          "If the recipient replies in the first 5 minutes, do you see it? Cold outreach that is not actively monitored is throwaway.",
        doneWhen:
          "The reply-to inbox notifies your phone within 5 minutes of a reply landing.",
      },
    ],
    relatedGlossary: ["dream-100", "story"],
    relatedWhyIsntMy: ["email-open"],
    faqs: [
      {
        q: "What is a good reply rate for cold outreach?",
        a: "For indie SaaS founder outreach to a real dream-100, 10-25% reply rates are typical when the message is personal. Spray-and-pray scraped-list outreach yields 0.5-2% and burns sender reputation. The math favors named lists.",
      },
    ],
    lastVerified: "2026-05-19",
  },
];

export const CHECKLIST_SLUGS: ReadonlyArray<string> = CHECKLIST_ENTRIES.map(
  (e) => e.slug,
);

export function getChecklistBySlug(slug: string): ChecklistEntry | undefined {
  return CHECKLIST_ENTRIES.find((e) => e.slug === slug);
}
