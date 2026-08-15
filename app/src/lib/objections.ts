/**
 * /objection/[slug] pSEO catalog — buyer-objection handling pages.
 *
 * Each entry covers one specific buyer objection ("it's too expensive",
 * "I don't have time", "I can do this myself", "wrong timing", etc.)
 * with the Brunson-method response and the surface where the objection
 * surfaces. Distinct from /answers (founder questions about funnels) —
 * these are buyer objections to the offer itself.
 *
 * Schema: QAPage (the objection is structured as Q + A) + Article +
 * FAQPage + BreadcrumbList. Same triad as /answers, different intent.
 *
 * Brunson Hard-Rule:
 *   - Honest responses, not high-pressure overcomes. If the objection is
 *     correct, the response says so.
 *   - "Where it surfaces" reflects the funnel surface where the
 *     objection actually appears (checkout, demo call, FAQ, email).
 *   - Cross-links to /template and /glossary resolve. Build-time guard
 *     at the bottom enforces glossary slug integrity.
 */

import { GLOSSARY_SLUGS } from "./glossary";

export interface ObjectionFaq {
  q: string;
  a: string;
}

export interface ObjectionEntry {
  slug: string;
  /** The objection as the buyer would phrase it. */
  objection: string;
  /** Full display name. */
  displayName: string;
  metaTitle: string;
  metaDescription: string;
  /** Brunson lens this objection lives in. */
  brunsonLens: "hook" | "story" | "offer";
  /** Where in the funnel this objection typically surfaces. */
  whereItSurfaces: string;
  /** 2-3 sentence intro. */
  intro: string;
  /** When the objection is legitimate (founder should listen, not overcome). */
  whenLegitimate: string;
  /** When the objection is a smokescreen for a different concern. */
  realConcernUnderneath: string;
  /** The Brunson-method response: 4-7 sentences. */
  responseScript: string;
  /** What NOT to say. */
  whatNotToSay: ReadonlyArray<string>;
  /** Follow-up question to surface the real concern. */
  surfaceTheRealConcern: string;
  /** Related glossary slugs. */
  relatedGlossary: ReadonlyArray<string>;
  /** Related template (which template's framework produces the right response). */
  relatedTemplateSlug?: string;
  faqs: ReadonlyArray<ObjectionFaq>;
  lastVerified: string;
}

export const OBJECTION_ENTRIES: ReadonlyArray<ObjectionEntry> = [
  {
    slug: "its-too-expensive-objection",
    objection: "It is too expensive.",
    displayName: "Buyer objection: it is too expensive",
    metaTitle: "\"It's Too Expensive\" Sales Objection Response (SaaS)",
    metaDescription:
      "How to respond honestly to the 'too expensive' objection on indie SaaS sales. The Brunson Dollar Objection script reframe, with what NOT to say.",
    brunsonLens: "offer",
    whereItSurfaces:
      "Pricing page, checkout step, sales call, post-trial email, FAQ block.",
    intro:
      "'It's too expensive' is the most common indie SaaS sales objection — and the most often mis-handled. Defensive responses ('but look at the value!') lose. The Brunson Dollar Objection script reframes price as math, not subjective worth, and surfaces the real concern underneath.",
    whenLegitimate:
      "When the buyer's average customer transaction is below the offer's cost. A $49/month tool sold to a creator at $5 ARPU is genuinely too expensive — no reframe fixes the unit economics.",
    realConcernUnderneath:
      "Usually one of: 'I'm not sure this will work for me' (Weak Belief), 'I don't see the value' (Weak Offer), or 'I have not budgeted for this' (procedural). Each requires a different response. Defaulting to a price defense fails all three.",
    responseScript:
      "I understand. Most founders react that way when they first see the price. The math we used to set it: one [SPECIFIC OUTCOME] pays for [TIME PERIOD] of this — after the [THRESHOLD], the offer is net-positive. What feels expensive is usually one of three things — that the outcome is unclear, that the timing is wrong, or that the budget is genuinely missing. Which of those three is true for you?",
    whatNotToSay: [
      "'But look at all the value you get!' — Defensive listing of features confirms the buyer's frame instead of reframing it.",
      "'I'll give you a 20% discount.' — Discounts confirm the price was wrong and train every future buyer to expect them.",
      "'It pays for itself in two weeks.' — Unprovable claims without specific math read as marketing pressure, not honest math.",
    ],
    surfaceTheRealConcern:
      "'What would have to be true about the outcome for the price to feel right?' — surfaces whether the concern is outcome-confidence, timing, or budget, without making the buyer feel bargained.",
    relatedGlossary: ["offer", "weak-offer", "weak-belief", "stack-slide"],
    relatedTemplateSlug: "dollar-objection-script-template",
    faqs: [
      {
        q: "Should I offer a discount when this objection comes up?",
        a: "Rarely. Discounts mostly produce churn risk; the buyer who needs a discount to enter usually needs another discount to stay. If you discount, do it for a specific honest reason (cohort, time-bound launch), not in response to objection pressure.",
      },
      {
        q: "What if the buyer's company is genuinely too small to afford the offer?",
        a: "Honor that. Recommend the smaller alternative they need — even if that means recommending a competitor. The trust earned by saying 'we are not for you' compounds across the cohort.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "i-dont-have-time-objection",
    objection: "I do not have time to implement this.",
    displayName: "Buyer objection: I do not have time",
    metaTitle: "\"I Don't Have Time\" Sales Objection Response (SaaS)",
    metaDescription:
      "How to respond to the 'no time' objection. The real concern is usually about wasted-time risk, not actual time scarcity. The honest response.",
    brunsonLens: "story",
    whereItSurfaces:
      "Sales call, demo follow-up, post-trial email, exit-survey on free tier.",
    intro:
      "'I do not have time' is rarely about scarcity — it is about wasted-time risk. The buyer has been burned by previous tools that promised value and consumed weeks. The honest response is to reframe the time commitment specifically, surface the failure-history concern, and offer a low-time entry path.",
    whenLegitimate:
      "When the buyer is genuinely operating in a 60+ hour week with no slack. Founder time is the rarest commodity in pre-revenue indie SaaS; the objection is sometimes a real constraint, not a smokescreen.",
    realConcernUnderneath:
      "Usually one of: 'I have invested in tools that wasted my time before' (trust), 'I am unsure this is the right priority' (Wrong Person), or 'I am avoiding the work this requires' (founder-psychology). Each requires a different response.",
    responseScript:
      "I hear that. The setup time for this is [SPECIFIC TIME] - we measured it ourselves on three real customers and the range was [BAND]. If that is not realistic for your week, this is not the right time. What concerns me more is whether the work itself is what you have time for - because the tool reduces some work and reveals other work that has to happen anyway. Can I show you what the actual week-one looks like? If it feels too heavy, the answer is 'come back in a quarter,' not 'force it.'",
    whatNotToSay: [
      "'It only takes 10 minutes!' — Unproven specific claims trigger skepticism, especially from buyers who have heard them before.",
      "'You can't afford NOT to make time for this.' — High-pressure framing on the time axis produces refunds, not customers.",
      "'I'll set it up for you.' — Done-for-you offers on time-pressed buyers create implementation dependency you cannot scale.",
    ],
    surfaceTheRealConcern:
      "'What would have to change in your week for this to be the right priority?' — surfaces whether the concern is time, priority, or trust.",
    relatedGlossary: ["story", "weak-belief", "wrong-person"],
    relatedTemplateSlug: "epiphany-bridge-story-template",
    faqs: [
      {
        q: "Should I build a 'done-for-you' tier for time-pressed buyers?",
        a: "Only at a price that compensates for the implementation cost. Done-for-you at the same price as self-serve produces unprofitable customers and a delivery bottleneck.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "i-can-do-this-myself-objection",
    objection: "I can build this myself.",
    displayName: "Buyer objection: I can build this myself",
    metaTitle: "\"I Can Build This Myself\" Sales Objection Response",
    metaDescription:
      "How to respond when a technical buyer says they can build it themselves. Often true — the response is about opportunity cost, not capability.",
    brunsonLens: "offer",
    whereItSurfaces:
      "Demo call, post-trial email, FAQ block, technical buyer evaluation.",
    intro:
      "'I can build this myself' is the technical buyer's objection. The trap is to argue with capability — most of these buyers genuinely can build it. The honest response reframes around opportunity cost, surfaces the real maintenance-cost concern, and respects the buyer's technical agency.",
    whenLegitimate:
      "When the buyer is a senior engineer with available time and the build is genuinely small (a weekend project). For deep technical infrastructure or compliance-grade workflows, the build is usually not weekend-sized; the buyer is underestimating.",
    realConcernUnderneath:
      "Usually one of: 'I do not want to depend on a vendor' (control), 'I do not see the value above building' (Weak Offer), or 'I prefer building to integrating' (technical-buyer preference). The right response addresses the specific concern.",
    responseScript:
      "Honestly, you probably can. Most technical buyers can. The question is not 'can you' — it is 'is the time better spent here or elsewhere'. We have customers who looked at this and decided to build it themselves; they built it in [TIME BAND], maintained it for [MAINTENANCE BAND], and eventually came back when [COMMON TRIGGER]. If your current work is constrained by time or focus, this is a 30-day call; if you have an engineering team with slack, building it is genuinely an option.",
    whatNotToSay: [
      "'It will take you longer than you think.' — True but condescending; ends the conversation.",
      "'You will need to maintain it forever.' — Reasonable but defensive when said this way.",
      "'But we have features X, Y, Z!' — Feature comparison loses to a builder who has decided to build.",
    ],
    surfaceTheRealConcern:
      "'If you were not the engineer, would you still build this?' — surfaces whether the build decision is rational or identity-based.",
    relatedGlossary: ["offer", "weak-offer"],
    relatedTemplateSlug: "dollar-objection-script-template",
    faqs: [
      {
        q: "What if the buyer is wrong about being able to build it?",
        a: "Let them be wrong. Pushing produces resistance; respecting agency produces a return visit in 60-90 days. The 'I tried to build it and came back' customer is the highest-retention cohort indie SaaS sees.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "wrong-timing-objection",
    objection: "It is the wrong time for us right now.",
    displayName: "Buyer objection: wrong timing",
    metaTitle: "\"Wrong Timing\" Sales Objection Response (SaaS)",
    metaDescription:
      "How to respond to the 'wrong timing' objection. Surface the real reason without pressuring — wrong timing is often right concern, wrong words.",
    brunsonLens: "hook",
    whereItSurfaces:
      "Sales call, demo follow-up, exit-survey, post-trial email.",
    intro:
      "'Wrong timing' is the most ambiguous objection — it can mean genuinely-wrong-timing (procedural), genuinely-wrong-fit (Wrong Person), or wrong-budget-cycle. Surface which one, do not pressure on any. The honest response is to ask, accept the answer, and offer a re-engage path.",
    whenLegitimate:
      "When the buyer is in a real life or business transition that genuinely makes this the wrong moment — a recent layoff, a merger, a launch their team is shipping. These are legitimate and the right response is to step back.",
    realConcernUnderneath:
      "Usually one of: 'I am not ready to spend yet' (procedural), 'I do not believe this is the priority' (Wrong Person), or 'I am avoiding this' (founder-psychology). All three are valid; high-pressure response invalidates them and burns the relationship.",
    responseScript:
      "That is fair. What in particular makes this the wrong time — is it a budget cycle, a launch you are mid-ship on, or something more like 'this is not the priority for me yet'? I am asking because each of those would have a different right next step. If it is genuinely budget-cycle, I can pause and re-engage in [TIMEFRAME]. If it is priority, I will respect that and step back; you have my email if it shifts.",
    whatNotToSay: [
      "'When would be the right time?' — Without context, this question presses the buyer to commit before they are ready.",
      "'But you will fall behind if you wait!' — Urgency manufactured externally feels like manipulation.",
      "'Let me know when you are ready.' — Vague and abandons the relationship. The honest response is a specific re-engage timeline.",
    ],
    surfaceTheRealConcern:
      "'Is the concern with the timing of this purchase, or with the timing of doing the work this would unlock?' — surfaces whether the concern is procedural or priority-level.",
    relatedGlossary: ["hook", "wrong-person"],
    faqs: [
      {
        q: "How long should I wait before re-engaging?",
        a: "60-90 days for procedural timing. For priority-level concerns, longer — and only re-engage if the buyer signals a shift, not by your calendar reminder. Pestering buyers who said no is the fastest way to permanently lose them.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "we-tried-something-like-this-before-objection",
    objection: "We tried something like this before and it did not work.",
    displayName: "Buyer objection: we tried this before",
    metaTitle: "\"We Tried This Before\" Sales Objection Response",
    metaDescription:
      "How to respond when a buyer has been burned by a similar product. The trust rebuild is the work; the comparison is the trap.",
    brunsonLens: "story",
    whereItSurfaces:
      "Sales call, demo follow-up, FAQ block, post-trial email.",
    intro:
      "'We tried this before' is the trust-burned objection. The buyer has a specific failure-story they are projecting onto your offer. The honest response is to ask about the specific failure, address it specifically, and not pretend your product is fundamentally different when the buyer's failure could repeat.",
    whenLegitimate:
      "Almost always legitimate. The buyer has real lived experience; the response that pretends their previous experience does not apply burns the relationship instantly.",
    realConcernUnderneath:
      "'I do not trust this category anymore' (broad). The objection is rarely about your specific product; it is about the buyer's pattern-match to the category's failure mode. Addressing the specific previous failure is the response.",
    responseScript:
      "I want to know what specifically went wrong before — not to argue with it, but because the answer changes my response. Was it the setup time, the team adoption, the ROI taking longer than promised, or something else? Most 'we tried this before' stories trace back to one of those four. If your specific failure mode is one this would also hit, I would rather know than pretend.",
    whatNotToSay: [
      "'But our product is different.' — Generic differentiation invites comparison the buyer has already done.",
      "'That was probably their fault, not the product.' — Blaming the buyer's previous self loses trust completely.",
      "'Customer success has improved a lot since then.' — Vague reassurance reads as marketing-speak.",
    ],
    surfaceTheRealConcern:
      "'What was the specific moment you knew that previous tool was not working?' — surfaces the concrete failure event you can address specifically.",
    relatedGlossary: ["story", "weak-belief"],
    relatedTemplateSlug: "epiphany-bridge-story-template",
    faqs: [
      {
        q: "What if my product would actually fail the same way?",
        a: "Be honest about it. Recommend the buyer not buy, or offer a trial that tests for the specific failure first. Customers who you saved from a wrong-fit purchase become the highest-trust referrers in the category.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "i-need-to-think-about-it-objection",
    objection: "I need to think about it.",
    displayName: "Buyer objection: I need to think about it",
    metaTitle: "\"I Need to Think About It\" Sales Objection Response",
    metaDescription:
      "How to respond to 'I need to think about it' without pressuring. The objection is usually a real concern in disguise — surface, do not push.",
    brunsonLens: "story",
    whereItSurfaces:
      "Sales call end, demo close, checkout abandonment, post-trial email.",
    intro:
      "'I need to think about it' is rarely about thinking. It is usually a specific concern the buyer has not voiced — about price, fit, timing, or trust. High-pressure responses ('what specifically do you need to think about?') feel manipulative. The honest response surfaces the concern with permission.",
    whenLegitimate:
      "When the purchase is genuinely larger than the buyer's autonomous-decision budget and they need to consult someone (partner, manager, finance). This is procedural; the right response is to support the consultation.",
    realConcernUnderneath:
      "Usually a concern they did not voice during the conversation. Price, fit, timing, trust, or 'I have not understood the offer fully'. The objection is a polite signal that the conversation did not land yet.",
    responseScript:
      "Of course. Often when buyers say this, there is one specific concern that has not come up in the conversation yet. Without pressuring you to decide now — is there one specific thing I could clarify that would help you think about it? If not, I am happy to follow up in [TIMEFRAME] with no expectation. Either is fine.",
    whatNotToSay: [
      "'What specifically do you need to think about?' — Demanding-tone phrasing of the right question. Re-phrase with permission.",
      "'This price won't be available later.' — Manufactured urgency triggers buyer's manipulation-detection instinct.",
      "'Okay let me know.' — Abandons the relationship and the conversation. The right response includes a specific follow-up timeline.",
    ],
    surfaceTheRealConcern:
      "'If you had to name the one thing that would tip this to yes — or to no — what would it be?' — surfaces the specific unvoiced concern.",
    relatedGlossary: ["story", "weak-belief"],
    faqs: [
      {
        q: "Should I follow up after 'I need to think about it'?",
        a: "Yes, once. Specific date, specific subject, no high-pressure language. 'You said you wanted to think about [X] — circling back to see if any of those clarifications would help.' If no response after one follow-up, archive and move on.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "we-need-feature-x-objection",
    objection: "We need feature X that you do not have.",
    displayName: "Buyer objection: missing feature",
    metaTitle: "\"You Don't Have Feature X\" Sales Objection Response",
    metaDescription:
      "How to respond when a buyer needs a feature you do not have. The trap is to promise the feature; the honest response is to validate the need.",
    brunsonLens: "offer",
    whereItSurfaces:
      "Sales call, demo follow-up, FAQ block, churn exit-survey.",
    intro:
      "'You don't have feature X' is the feature-mismatch objection. The trap is the founder's instinct to promise the feature to win the sale — which creates a roadmap debt that compounds. The honest response is to ask why the feature matters and whether your product actually fits without it.",
    whenLegitimate:
      "Often legitimate. Buyers have specific operational needs. If the feature is mission-critical and you do not have it (and will not in the next quarter), the right answer is 'we are not the right fit for you yet'.",
    realConcernUnderneath:
      "Usually the buyer is articulating a need from a previous tool's workflow. The need may be real or it may be a residual pattern. Asking why surfaces which.",
    responseScript:
      "Tell me why feature X matters for your workflow specifically. Sometimes the underlying need can be solved a different way; sometimes the feature genuinely is required. We do not have it on the [TIMEFRAME] roadmap, so if it is mission-critical, this is not the right fit yet. If the underlying need has another solution path, I am happy to walk you through it. What is the specific workflow you are running where you would hit this?",
    whatNotToSay: [
      "'It's on our roadmap!' — Vague roadmap claims create roadmap debt and disappoint when the timeline slips.",
      "'You don't actually need that.' — Dismisses the buyer's stated need; loses trust instantly.",
      "'We can build it for you.' — Custom feature commitments to one buyer rarely survive contact with the rest of the customer base.",
    ],
    surfaceTheRealConcern:
      "'If I could not build feature X for you but could solve the underlying workflow a different way, would that still work?' — surfaces whether the feature is a means or an end.",
    relatedGlossary: ["offer", "weak-offer"],
    faqs: [
      {
        q: "What if 5+ buyers ask for the same missing feature?",
        a: "That is a roadmap signal, not a sales objection. Move the feature into your roadmap if the cohort that asks for it matches your target audience. Build it for the audience, not for the individual deal.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "send-me-more-info-objection",
    objection: "Send me more information and I will get back to you.",
    displayName: "Buyer objection: send me more info",
    metaTitle: "\"Send Me Info\" Sales Objection Response (SaaS)",
    metaDescription:
      "How to respond when a buyer asks for more info as a soft close. Usually a polite no. The honest response respects the signal.",
    brunsonLens: "story",
    whereItSurfaces:
      "Sales call end, demo follow-up, cold-outreach reply, conference contact.",
    intro:
      "'Send me more information' is most often a polite no. The buyer is using a brush-off they have learned is acceptable. The honest response is to acknowledge the signal and offer a specific narrow ask instead of dumping a PDF into the void.",
    whenLegitimate:
      "When the buyer is in a real evaluation process and needs documentation to share with internal stakeholders. Specific document requests ('do you have a security one-pager?') are legitimate; vague 'more info' is usually not.",
    realConcernUnderneath:
      "Usually 'I am not interested but want to end the conversation politely'. Sometimes 'I am interested but cannot decide alone' (procedural). The follow-up question separates the two.",
    responseScript:
      "Happy to. To send something useful, can I ask one question — is the next step a decision on your side, or is it that you need to share this with someone else? If it is the second, I can put together exactly what they need to see. If it is the first, the existing [LANDING PAGE / DOC] covers the same ground; you could decide from that. Either is fine.",
    whatNotToSay: [
      "'I'll send you everything!' — Document-dump signals desperation and confirms the buyer's expectation that you will not push.",
      "'Are you actually going to read it?' — Aggressive, ends the relationship.",
      "'When should I follow up?' — Without context, this question forces the buyer to commit to a timeline they will not honor.",
    ],
    surfaceTheRealConcern:
      "'Are you sending this to someone else, or are you the decision maker?' — surfaces whether the request is procedural or a polite deflection.",
    relatedGlossary: ["story", "wrong-person"],
    faqs: [
      {
        q: "Should I send a packet of materials anyway?",
        a: "Send one specific document tied to the next step. A 30-page PDF dump rarely gets read and signals you cannot prioritize. A one-page summary tied to a specific decision moves the conversation.",
      },
    ],
    lastVerified: "2026-05-19",
  },
];

export const OBJECTION_SLUGS: ReadonlyArray<string> = OBJECTION_ENTRIES.map(
  (e) => e.slug,
);

export function getObjectionBySlug(slug: string): ObjectionEntry | undefined {
  return OBJECTION_ENTRIES.find((e) => e.slug === slug);
}

// Build-time guard: every relatedGlossary slug must resolve.
{
  const known = new Set<string>(GLOSSARY_SLUGS);
  for (const entry of OBJECTION_ENTRIES) {
    for (const slug of entry.relatedGlossary) {
      if (!known.has(slug)) {
        throw new Error(
          `objections.ts: entry "${entry.slug}" references unknown glossary slug "${slug}".`,
        );
      }
    }
  }
}
