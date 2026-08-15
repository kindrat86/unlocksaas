/**
 * /template/[slug] pSEO catalog — Brunson-method script templates.
 *
 * Each entry is one Brunson-method script (Dollar Objection, Epiphany
 * Bridge, Stack Slide outline, Perfect Webinar arc, etc.) with the
 * structural blocks named and the slots filled with [BRACKETED] place-
 * holders the founder fills in for their specific product.
 *
 * Distinct from /swipe-file:
 *   - /swipe-file = structural patterns observed in real shipped funnel
 *     and pricing teardowns (Tally, Resend, Cal.com, etc.)
 *   - /template  = canonical Brunson-method scripts the Playbook teaches,
 *     with structural placeholders. The reference text is from the
 *     Playbook curriculum, not from observed funnels.
 *
 * Schema strategy: HowTo (the steps ARE the template) + Article +
 * FAQPage + BreadcrumbList. HowTo is right because each template walks
 * the reader through a sequence of fill-in steps.
 *
 * Brunson Hard-Rule:
 *   - Every template is one of the named Brunson scripts the Playbook
 *     teaches. No fabricated frameworks.
 *   - The cross-links to /glossary terms must resolve. Build-time guard
 *     at the bottom enforces this.
 *   - "Common failure mode" entries reflect real founder errors observed
 *     in the diagnostic engine output.
 */

import { GLOSSARY_SLUGS } from "./glossary";

export interface TemplateBlock {
  /** Block label, e.g. "Hook". */
  label: string;
  /** What the block does in the script. */
  purpose: string;
  /** Fill-in template with [BRACKETED] slots. */
  template: string;
  /** Per-slot guidance. */
  slotGuidance: string;
}

export interface TemplateFaq {
  q: string;
  a: string;
}

export interface TemplateEntry {
  slug: string;
  displayName: string;
  metaTitle: string;
  metaDescription: string;
  /** The Brunson lens. */
  brunsonLens: "hook" | "story" | "offer";
  /** Where this template is used in the funnel (page, email, video, etc.). */
  usedIn: string;
  /** 2-3 sentence intro. */
  intro: string;
  /** Ordered structural blocks that make up the template. */
  blocks: ReadonlyArray<TemplateBlock>;
  /** One worked example showing all blocks filled. */
  workedExample: string;
  /** Common failure modes when this template is filled in wrong. */
  commonFailures: ReadonlyArray<string>;
  /** Related glossary slugs (canonical Brunson terms). */
  relatedGlossary: ReadonlyArray<string>;
  /** Which Brunson Wrong-Person / Weak-Offer / Weak-Belief diagnosis this fixes. */
  fixesDiagnosis: "wrong-person" | "weak-offer" | "weak-belief";
  faqs: ReadonlyArray<TemplateFaq>;
  lastVerified: string;
}

export const TEMPLATE_ENTRIES: ReadonlyArray<TemplateEntry> = [
  {
    slug: "epiphany-bridge-story-template",
    displayName: "Epiphany Bridge story template",
    metaTitle: "Epiphany Bridge Template (Brunson Indie SaaS)",
    metaDescription:
      "Fill-in template for the Brunson Epiphany Bridge story — the founder origin sequence that makes a cold reader believe the offer. Five blocks.",
    brunsonLens: "story",
    usedIn: "Above-the-fold founder block, About page, VSL minutes 1-4, sales-email founder origin.",
    intro:
      "The Epiphany Bridge is the canonical Brunson story for one specific job: making a cold reader believe the founder figured something out. Five blocks: backstory, desire, problem-flaw, epiphany, new-belief. Fill them in this order; out-of-order epiphany bridges read as marketing copy.",
    blocks: [
      {
        label: "Backstory",
        purpose: "Set the founder in a relatable, specific place at a specific time. The reader must be able to picture you there.",
        template:
          "[YEAR / TIME PERIOD], I was [SPECIFIC ROLE / SITUATION], trying to [SPECIFIC OUTCOME] using [SPECIFIC METHOD].",
        slotGuidance:
          "[SPECIFIC ROLE / SITUATION] = your actual life, not a category. 'Working out of a co-working space in Athens' beats 'an indie hacker'. [SPECIFIC METHOD] = the named approach you were using, not a vague mood.",
      },
      {
        label: "Desire",
        purpose: "Name the specific outcome you wanted that the reader also wants. The desire must match the offer's outcome.",
        template:
          "What I really wanted was [SPECIFIC OUTCOME], because [SPECIFIC PERSONAL REASON].",
        slotGuidance:
          "[SPECIFIC OUTCOME] = the same outcome the offer promises. [SPECIFIC PERSONAL REASON] = the felt cost of not having it. 'So I could quit my consulting work' beats 'to feel free'.",
      },
      {
        label: "Problem / flaw",
        purpose: "Name why the obvious approach was not working. The reader should be using one of the failing approaches you list.",
        template:
          "But [SPECIFIC METHOD] kept failing because [SPECIFIC ROOT CAUSE]. I tried [ALTERNATIVE 1], [ALTERNATIVE 2], and [ALTERNATIVE 3] — same result.",
        slotGuidance:
          "[SPECIFIC ROOT CAUSE] = the structural reason, not 'I was unmotivated'. The reader will only feel seen if they have tried the alternatives.",
      },
      {
        label: "Epiphany",
        purpose: "Name the moment and the realization. The realization must be the basis of the offer's mechanism.",
        template:
          "Then [SPECIFIC TRIGGER MOMENT], I realized [SPECIFIC INSIGHT]. The thing I had been getting wrong was [SPECIFIC MISCONCEPTION].",
        slotGuidance:
          "[SPECIFIC TRIGGER MOMENT] = a concrete moment, not 'one day'. The realization sentence is the load-bearing sentence of the entire story.",
      },
      {
        label: "New belief",
        purpose: "State the new belief that the offer is built on. This sentence becomes the reader's epiphany too.",
        template:
          "I now believe [SPECIFIC NEW BELIEF] — and that is exactly what [PRODUCT NAME] makes possible.",
        slotGuidance:
          "[SPECIFIC NEW BELIEF] = a single declarative sentence the reader can repeat. If the reader cannot quote it back after one read, rewrite it.",
      },
    ],
    workedExample:
      "In 2024, I was a non-engineer founder shipping a SaaS with Lovable, trying to get a flat Stripe line to a paying customer using more landing-page A/B tests. What I really wanted was the first paying customer, because I had told my partner I would stop the consulting work. But A/B testing kept failing because the visitor profile was wrong, not the headline. I tried smaller niches, bigger budgets, and a redesign — same flat line. Then one evening reading Brunson's books, I realized the constraint was Hook / Story / Offer alignment, not page-level optimization. The thing I had been getting wrong was treating funnel work as conversion-rate optimization. I now believe the first paying customer is a positioning event, not a traffic event — and that is exactly what Unlock SaaS makes possible.",
    commonFailures: [
      "Skipping the Backstory block. Cold readers will not believe the rest if they cannot picture you in the specific past place.",
      "Treating the Epiphany as a marketing punchline. The realization sentence has to be a real, dated, specific moment.",
      "Mismatching the Desire to the offer outcome. If the founder's stated desire is 'freedom' and the offer is 'first paying customer', the bridge breaks.",
      "Writing the New Belief as a feature ('one click') instead of a worldview ('positioning over optimization').",
    ],
    relatedGlossary: ["story", "hook", "offer", "weak-belief"],
    fixesDiagnosis: "weak-belief",
    faqs: [
      {
        q: "How long should an Epiphany Bridge be?",
        a: "200-400 words for a landing-page block; 800-1,200 words for an About page; 4-7 minutes of voice for a VSL. Length is calibrated to the surface; the five-block structure is constant.",
      },
      {
        q: "Can the Epiphany Bridge be told in third person?",
        a: "No. The bridge is the founder's I-story; first-person is structural. Third-person versions read as case studies, not founder origin, and lose the believability lift.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "dollar-objection-script-template",
    displayName: "Brunson Dollar Objection script template",
    metaTitle: "Dollar Objection Script Template (Brunson Indie SaaS)",
    metaDescription:
      "Fill-in template for the Brunson Dollar Objection script — the line that closes the 'is it worth the money?' loop. Six blocks.",
    brunsonLens: "offer",
    usedIn: "Above-the-fold pricing block, sales-page Stack section, FAQ block, checkout-step reassurance, post-purchase confirmation.",
    intro:
      "The Dollar Objection script is the Brunson tactic for handling the 'is it worth the money?' objection without sounding defensive. Six blocks: comparison, reframe, math, payoff window, guarantee, and the explicit ask. Fill in order — comparison without math reads as marketing; math without reframe reads as desperate.",
    blocks: [
      {
        label: "Comparison",
        purpose: "Compare the price to a specific everyday expense the reader is making anyway.",
        template:
          "[$X PRICE] is [SPECIFIC EVERYDAY EXPENSE COMPARISON].",
        slotGuidance:
          "[SPECIFIC EVERYDAY EXPENSE COMPARISON] = a real expense the reader probably has. 'One coffee a week' or 'half the cost of a single freelance hour'. Generic comparisons ('less than dinner out') feel canned.",
      },
      {
        label: "Reframe",
        purpose: "Reframe the purchase as not-an-expense — as an investment, an insurance, or a known-cost vs unknown-cost trade.",
        template:
          "It is not [WHAT THE READER ASSUMES IT IS] — it is [WHAT IT ACTUALLY IS] for [WHO IT IS FOR].",
        slotGuidance:
          "[WHAT THE READER ASSUMES IT IS] = the frame they bring (a course, a subscription, a tool). [WHAT IT ACTUALLY IS] = the specific role it plays in their work (insurance against a stalled launch, a tested path, a feedback loop).",
      },
      {
        label: "Math",
        purpose: "Name the specific outcome that pays for the offer many times over.",
        template:
          "One [SPECIFIC OUTCOME] pays for [TIME PERIOD] of this. After [THRESHOLD], the offer is net-positive.",
        slotGuidance:
          "[SPECIFIC OUTCOME] = a real customer event the offer enables. 'One first paying customer at your average price' beats 'one new lead'. [THRESHOLD] = the number of outcomes needed for break-even.",
      },
      {
        label: "Payoff window",
        purpose: "Name when the payoff happens. Vague timelines kill the close.",
        template:
          "Most [SPECIFIC AUDIENCE] who follow the [SPECIFIC METHOD] see [SPECIFIC OUTCOME] within [SPECIFIC TIME WINDOW].",
        slotGuidance:
          "[SPECIFIC TIME WINDOW] = an honest band, not an average. 'Within 30 to 60 days' beats 'fast'.",
      },
      {
        label: "Guarantee",
        purpose: "Repeat the guarantee with the specific trigger, the specific verifier, and the specific refund mechanism.",
        template:
          "If [SPECIFIC OUTCOME] does not happen within [TIME WINDOW], verified by [INDEPENDENT VERIFIER], [SPECIFIC REFUND PROMISE].",
        slotGuidance:
          "[INDEPENDENT VERIFIER] = a system the customer trusts (Stripe, a counter, a third party). 'Verified by us' adds no weight.",
      },
      {
        label: "Ask",
        purpose: "Repeat the action. The Dollar Objection script ends with the same ask the page leads with.",
        template:
          "[OUTCOME VERB] [SPECIFIC NEXT STEP].",
        slotGuidance:
          "[OUTCOME VERB] = the imperative tied to the next state ('Start the diagnostic', 'Buy the Playbook', 'Schedule the call'). Generic 'Click here' is the failure mode.",
      },
    ],
    workedExample:
      "$49 is less than two paid Twitter posts. It is not a course, a coaching subscription, or a SaaS tool — it is the playbook for the work post-launch pre-revenue founders skip. One first paying customer at your average price pays for 6 to 12 months of this. After the second customer, the Playbook is net-positive. Most founders who follow the seven steps see their first paying customer within 30 to 60 days. If your first paying customer does not happen within 60 days, verified by your connected Stripe account, full refund. Get the free diagnostic to see what is breaking first.",
    commonFailures: [
      "Skipping the Reframe block. The math is unconvincing if the reader is still mentally tagging the offer as 'just a subscription'.",
      "Using an unrealistic time window in Payoff. '30-day money-back' for a payoff that takes 90 days is a setup for refunds.",
      "Vague guarantee language ('love it or leave it'). The reader cannot picture the refund event; the guarantee does no conversion work.",
      "Generic Ask ('Get started today'). The script's last line is the page's first job; specificity wins.",
    ],
    relatedGlossary: ["offer", "stack-slide", "weak-belief"],
    fixesDiagnosis: "weak-belief",
    faqs: [
      {
        q: "Should the Dollar Objection script be on a $1 tripwire?",
        a: "Briefly, yes — collapsed to two or three lines. The full six-block script is for offers above $20. Below $20, the math block alone is usually enough.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "perfect-webinar-arc-template",
    displayName: "Brunson Perfect Webinar arc template",
    metaTitle: "Perfect Webinar Outline Template (Brunson)",
    metaDescription:
      "Fill-in template for the Brunson Perfect Webinar arc — Introduction, One Thing, Big Domino, Three Secrets, Stack and Close. Seven blocks.",
    brunsonLens: "offer",
    usedIn: "60-90 minute live or simulated-live webinars for offers above $300. Also works as the outline for long-form VSL above 22 minutes.",
    intro:
      "The Perfect Webinar is the canonical Brunson high-ticket sales arc — seven blocks delivered over 60-90 minutes. Built for the price band where the buyer needs structured belief-building before the offer. Below $300 the format is overkill; above $300 the format is the right fit and shorter formats under-convert.",
    blocks: [
      {
        label: "Introduction (3-5 min)",
        purpose: "Founder credibility, what the attendee is going to learn, and the qualifying frame.",
        template:
          "I am [FOUNDER NAME]. In the next 60 minutes I will show you [ONE BIG IDEA]. This is for [SPECIFIC AUDIENCE]. If you are [DISQUALIFIER], this is not for you — go [ALTERNATIVE].",
        slotGuidance:
          "[ONE BIG IDEA] = the singular Big Domino the rest of the webinar collapses to. [DISQUALIFIER] = an honest exclusion. Naming the wrong-fit attendee builds trust with the right-fit attendee.",
      },
      {
        label: "One Thing (the Big Domino) (5-10 min)",
        purpose: "Name the one belief change that, if accepted, makes the offer obvious. The whole webinar is in service of installing this belief.",
        template:
          "Here is the One Thing: [SPECIFIC NEW BELIEF]. If you believe [SPECIFIC NEW BELIEF], then [LOGICAL CONSEQUENCE]. Today I will give you three proofs.",
        slotGuidance:
          "[SPECIFIC NEW BELIEF] = the belief the founder's expertise lets them install in the audience. [LOGICAL CONSEQUENCE] = why this belief makes the offer the next step.",
      },
      {
        label: "Three Secrets (10-15 min each)",
        purpose: "Three teaching blocks, each proving one component of the Big Domino. Each Secret ends with a transition to the next.",
        template:
          "Secret #1: [TEACHING POINT 1]. Most people think [WRONG BELIEF 1]; the truth is [CORRECT BELIEF 1]. Here is the proof: [EVIDENCE 1]. Now Secret #2: [TEACHING POINT 2]. ... Secret #3: [TEACHING POINT 3]. ...",
        slotGuidance:
          "Each Secret is one teaching point in service of the Big Domino. The structure is: misconception → correction → evidence → transition. Skipping the misconception block is the most common error.",
      },
      {
        label: "Stack (10-15 min)",
        purpose: "Itemize the offer's components, attach a value anchor to each, sum them, then reveal the offer price.",
        template:
          "[COMPONENT 1] — [WHAT IT DOES]. Value: [$ANCHOR 1]. [COMPONENT 2] — ... Total real value: [$SUM]. Today, this is yours for [$OFFER PRICE].",
        slotGuidance:
          "3-7 components is the sweet spot. Each anchor must be defensible as a standalone price. Inflated anchors break trust at exactly the wrong moment.",
      },
      {
        label: "Bonuses (5 min)",
        purpose: "Time-bound bonuses that increase the offer's value without changing the price.",
        template:
          "If you decide [TIME-BOUND TRIGGER], you also get [BONUS 1] worth [$VALUE], [BONUS 2] worth [$VALUE], [BONUS 3] worth [$VALUE].",
        slotGuidance:
          "Bonuses are not the offer; they are the time pressure. They must be real, deliverable, and worth the named value. Vaporware bonuses are a Brunson Hard-Rule violation.",
      },
      {
        label: "Guarantee (3 min)",
        purpose: "Specific outcome + time window + named verifier + refund mechanism.",
        template:
          "If [SPECIFIC OUTCOME] does not happen within [TIME WINDOW], verified by [INDEPENDENT VERIFIER], [SPECIFIC REFUND PROMISE].",
        slotGuidance:
          "Same shape as the Dollar Objection script's guarantee block. The verifier must be a system the customer trusts more than you.",
      },
      {
        label: "Close (5-10 min)",
        purpose: "Repeat the One Thing, repeat the stack, name the action, hold the silence.",
        template:
          "Remember the One Thing: [SPECIFIC NEW BELIEF]. You now have [STACKED VALUE], for [$OFFER PRICE], with [GUARANTEE], plus [BONUSES] if you decide [TIME-BOUND TRIGGER]. [SPECIFIC ACTION].",
        slotGuidance:
          "Holding the silence after the ask is structural. New webinar presenters fill the gap; experienced ones do not.",
      },
    ],
    workedExample:
      "(See the live demo of the Playbook walkthrough at /playbook-sales for a 22-minute compressed version that follows this seven-block arc.)",
    commonFailures: [
      "Building the Three Secrets independently of the One Thing. The Secrets are not three good teaching points — they are three proofs of the same belief.",
      "Skipping the Misconception block inside each Secret. Without naming what most people get wrong, the correct teaching reads as opinion.",
      "Stacking too many components (8+). Padding the stack reads as desperate; quality raters flag inflated stack slides.",
      "Making the Bonuses the real offer. If a bonus is more valuable than a component, the offer is mis-structured.",
    ],
    relatedGlossary: ["perfect-webinar", "stack-slide", "offer", "big-domino"],
    fixesDiagnosis: "weak-belief",
    faqs: [
      {
        q: "Can the Perfect Webinar be pre-recorded?",
        a: "Yes — simulated-live works for indie SaaS. The arc is the format; the live aspect is operational. Real live adds Q&A; simulated-live adds repeatability.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "stack-slide-script-template",
    displayName: "Brunson Stack Slide script template",
    metaTitle: "Brunson Stack Slide Template (Indie SaaS)",
    metaDescription:
      "Fill-in template for the Brunson Stack Slide — itemize the offer, anchor each component, sum, reveal price. Four blocks per component.",
    brunsonLens: "offer",
    usedIn: "Sales-page offer section, Perfect Webinar Stack block, VSL minutes 12-18, OTO offer page.",
    intro:
      "The Stack Slide is the moment on a sales surface where the offer becomes math. Three to seven components, each with a name, a one-line role, an anchor price, and (in long form) a brief description. Sum the anchors, then reveal the actual price. Done honestly, the delta between sum and price is the value proposition in dollars.",
    blocks: [
      {
        label: "Component name",
        purpose: "The component is a real piece of the offer with a brand-able name.",
        template: "[COMPONENT NAME]",
        slotGuidance:
          "Brand-able does not mean inflated. 'Stripe Webhook Setup Walkthrough' is a real component; 'The Velocity System' attached to the same content is not.",
      },
      {
        label: "Role in one line",
        purpose: "What the component does for the customer in plain language.",
        template: "[VERB] [SPECIFIC OUTCOME] using [SPECIFIC METHOD / TOOL].",
        slotGuidance:
          "[VERB] = the imperative. [SPECIFIC METHOD / TOOL] = the actual delivery vehicle (video, doc, live call, downloadable). Vague descriptions kill the math.",
      },
      {
        label: "Defensible anchor price",
        purpose: "A price the component would carry as a standalone product or service.",
        template: "Value: [$ANCHOR]",
        slotGuidance:
          "Defensible = a price you would actually charge if this were the only thing you sold. Inflated anchors are the most common Stack Slide failure mode.",
      },
      {
        label: "Sum reveal + offer price",
        purpose: "After listing all components, sum the anchors, then reveal the actual offer price. The delta is the value proposition.",
        template:
          "Total real value: [$SUM]. Today: [$OFFER PRICE].",
        slotGuidance:
          "[$SUM] should be 3-10x [$OFFER PRICE]. Less than 3x looks like the offer is priced near retail; more than 10x looks like the math is inflated.",
      },
    ],
    workedExample:
      "Component 1: The Seven-Step Playbook (Video Walkthrough). Walks through each step from 'pin one real customer' to 'verified Stripe outcome'. Value: $X. Component 2: Weekly Office Hour. Live Brunson-Hard-Rule diagnostic on your live URL. Value: $X. Component 3: The Diagnostic Database. Searchable archive of every diagnosed page so you can pattern-match. Value: $X. Total real value: $X. Today: $49 / month.",
    commonFailures: [
      "Inflating anchors to make the delta bigger. Quality raters and savvy buyers spot this in seconds.",
      "Padding the stack with 8+ components. The longer the list, the less believable each anchor becomes.",
      "Using opaque component names ('The Velocity System') instead of describable ones ('Stripe Webhook Setup Walkthrough').",
      "Using identical anchors across components ($297 each). Real anchors vary by what the component would standalone-sell for.",
    ],
    relatedGlossary: ["stack-slide", "offer", "weak-offer"],
    fixesDiagnosis: "weak-offer",
    faqs: [
      {
        q: "Should I show the math or just the result?",
        a: "Show the math. The Stack Slide is the moment the offer becomes believable; hiding the addition reads as 'trust me'. The summed line + offer line is the moment the reader does the value calculation themselves.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "seinfeld-email-template",
    displayName: "Brunson Seinfeld email template",
    metaTitle: "Brunson Seinfeld Email Template (Indie SaaS)",
    metaDescription:
      "Fill-in template for a Brunson Seinfeld email — daily Story-based email that opens with a specific moment and ties to the offer. Five blocks.",
    brunsonLens: "story",
    usedIn: "Daily or thrice-weekly broadcasts to a warmed-up email list. Not for cold lists, not for transactional, not for the first send.",
    intro:
      "The Seinfeld email is the Brunson format for relationship-driven email marketing — short, story-driven, daily-ish, tying everyday observations to the offer with a soft CTA at the end. Five blocks: subject, opening moment, story, transition, ask. Done right, open rates run 35-50% and unsubscribe rates stay under 0.3% per send.",
    blocks: [
      {
        label: "Subject line",
        purpose: "Curiosity-grabbing without clickbait. Names a specific thing.",
        template:
          "[SPECIFIC OBJECT, PLACE, OR EVENT] (under 50 chars)",
        slotGuidance:
          "Avoid emoji, avoid title case, avoid 'How to' formulations. 'My neighbor's cat just figured out something' beats 'How to grow your SaaS faster'.",
      },
      {
        label: "Opening moment",
        purpose: "A specific concrete moment the reader can picture in 5 seconds.",
        template:
          "[YESTERDAY / THIS MORNING / LAST TUESDAY], I was [SPECIFIC PLACE], [SPECIFIC OBSERVABLE THING] happened.",
        slotGuidance:
          "Concrete > abstract. 'I was at the bakery on Solomou Street when' beats 'I was thinking about'.",
      },
      {
        label: "Story",
        purpose: "Tell what happened in 3-7 sentences. The story must contain the seed of the eventual transition.",
        template:
          "[3-7 sentences describing what happened, ending on the moment of realization or contrast.]",
        slotGuidance:
          "The story is the email's body. It does not have to be dramatic; it has to be specific and observable.",
      },
      {
        label: "Transition",
        purpose: "The 'and that is exactly like' move that connects the story to the offer's worldview.",
        template:
          "Which is exactly like [SPECIFIC FOUNDER SITUATION]. [SPECIFIC PARALLEL].",
        slotGuidance:
          "The parallel must be honest. Forced metaphors are the failure mode of the Seinfeld format. If the story does not naturally bridge, pick a different story.",
      },
      {
        label: "Soft ask",
        purpose: "One sentence pointing at the offer surface. Not a hard pitch.",
        template:
          "If you are [SPECIFIC AUDIENCE], the [SPECIFIC PRODUCT / DIAGNOSTIC / RESOURCE] is at [URL].",
        slotGuidance:
          "Soft = no urgency, no scarcity, no all-caps. The ask is a signpost, not a sales pitch. Hard pitches belong in different email types.",
      },
    ],
    workedExample:
      "Subject: \"My neighbor's cat figured out the buzzer\"\n\nYesterday I was carrying groceries up to the apartment, and my neighbor's cat — who has been sitting in the same window for two years — figured out that pressing one specific spot on the windowsill makes the building buzzer go off. He pressed it three times in a row, looked at me, and pressed it again.\n\nFor two years he had been watching the same setup. Yesterday something clicked.\n\nWhich is exactly like every pre-revenue founder I have ever met. The data was always there. The fix was always available. The thing that changed was that one day, the founder noticed it.\n\nIf you have been staring at a flat Stripe line for a while, the 90-second diagnostic at unlocksaas.com/diagnostic names which thing you are about to notice.",
    commonFailures: [
      "Subject line too clever. Curiosity gap that is too vague reads as spam.",
      "Story without a real observable moment. Generic 'I was thinking' openings are unbearable in volume.",
      "Forced transition. If the story does not naturally bridge, the email reads as a pitch dressed as a story.",
      "Hard ask at the end. Seinfeld emails have soft asks. Hard asks belong in dedicated promo emails.",
    ],
    relatedGlossary: ["seinfeld-email", "story", "soap-opera-sequence"],
    fixesDiagnosis: "weak-belief",
    faqs: [
      {
        q: "How many Seinfeld emails per week?",
        a: "Three to five works for warmed-up indie lists. Daily works for engagement-heavy brands but most indie operators cannot maintain daily quality. Quality of the moment beats frequency every time.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "soap-opera-sequence-template",
    displayName: "Brunson Soap Opera Sequence template",
    metaTitle: "Brunson Soap Opera Sequence Template",
    metaDescription:
      "Fill-in template for a Brunson Soap Opera Sequence — five emails over five days that take a new subscriber from intro to first offer.",
    brunsonLens: "story",
    usedIn: "First-five-emails sequence after a new subscriber joins the list. Not for cold outreach, not for promo broadcasts.",
    intro:
      "The Soap Opera Sequence is the Brunson five-email arc that takes a new subscriber from cold-introduction to first soft offer over five consecutive days. Each email opens a loop the next closes. The structure is fixed; the topic varies by founder.",
    blocks: [
      {
        label: "Email 1 — Set the stage",
        purpose: "Introduce yourself, set the daily-email expectation, hint at where the story is going.",
        template:
          "Hi, I am [FOUNDER NAME]. Over the next five days I am going to tell you [SPECIFIC STORY]. By the end, you will have [SPECIFIC OUTCOME OF THE STORY]. Tomorrow I will start by [SPECIFIC HOOK FOR EMAIL 2].",
        slotGuidance:
          "[SPECIFIC STORY] = the founder narrative that justifies the eventual offer. [SPECIFIC OUTCOME] = what the reader will believe by the end of the sequence.",
      },
      {
        label: "Email 2 — High drama, backstory",
        purpose: "Open with the most charged moment of the founder story. The reader should feel the stakes.",
        template:
          "Yesterday I promised I would tell you [SPECIFIC STORY]. Here is where it starts: [SPECIFIC HIGH-DRAMA MOMENT]. [BACKSTORY]. The thing I had not figured out yet was [SPECIFIC PROBLEM]. Tomorrow I will show you [SPECIFIC EPIPHANY HOOK].",
        slotGuidance:
          "[SPECIFIC HIGH-DRAMA MOMENT] = a real moment with real stakes. Manufactured drama torches credibility.",
      },
      {
        label: "Email 3 — Epiphany",
        purpose: "Deliver the realization that the offer is built on.",
        template:
          "Yesterday you read about [SPECIFIC PROBLEM]. Today the moment it clicked: [SPECIFIC TRIGGER MOMENT]. The thing I had been getting wrong was [SPECIFIC MISCONCEPTION]. The truth was [SPECIFIC INSIGHT]. Tomorrow I will show you the first time I tested it.",
        slotGuidance:
          "Same load-bearing sentence as the Epiphany Bridge. The realization sentence is the email's job.",
      },
      {
        label: "Email 4 — Hidden benefits",
        purpose: "Show the unexpected upsides of the new belief that the reader could not see at first.",
        template:
          "Once I started applying [SPECIFIC INSIGHT] to [SPECIFIC SITUATION], something I did not expect happened: [SPECIFIC HIDDEN BENEFIT 1]. And then [SPECIFIC HIDDEN BENEFIT 2]. And the part nobody talks about: [SPECIFIC HIDDEN BENEFIT 3]. Tomorrow I will tell you about [PRODUCT NAME].",
        slotGuidance:
          "Hidden benefits are the unexpected consequences of the new belief. They should not be feature lists.",
      },
      {
        label: "Email 5 — Soft offer",
        purpose: "Name the product, name the price, name the next step. Soft, not hard.",
        template:
          "Over the past four days you have learned [STORY SUMMARY]. [PRODUCT NAME] is the [WHAT IT IS] for [WHO IT IS FOR]. It costs [$X]. The next step is [SPECIFIC ACTION].",
        slotGuidance:
          "The soft offer is one sentence per element: what, who, price, action. Long pitch emails belong elsewhere in the sequence library.",
      },
    ],
    workedExample:
      "(See the active Soap Opera Sequence delivered to new diagnostic completers — example deliverables are in the operator-facing documentation, not the public marketing surface.)",
    commonFailures: [
      "Treating Email 1 as a sales pitch. It is a stage-setter; selling here loses the sequence.",
      "Skipping the high-drama moment in Email 2. Without stakes, the rest of the arc has no fuel.",
      "Making Email 3's epiphany abstract. The reader has to be able to picture the moment it clicked.",
      "Hard-selling in Email 5. Hard pitches belong in dedicated launch emails, not in the SOS.",
    ],
    relatedGlossary: ["soap-opera-sequence", "story", "seinfeld-email"],
    fixesDiagnosis: "weak-belief",
    faqs: [
      {
        q: "Can the Soap Opera Sequence run over more than five days?",
        a: "Yes, but the structure stays five-block. Stretching across 7 or 10 days dilutes the daily cadence and weakens email-to-email loops. Five is the Brunson default for a reason.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "hook-story-offer-template",
    displayName: "Hook-Story-Offer page template",
    metaTitle: "Hook-Story-Offer Page Template (Brunson)",
    metaDescription:
      "Fill-in template for a Brunson Hook-Story-Offer landing page. Three sections, six blocks. The minimum-viable Brunson sales surface.",
    brunsonLens: "offer",
    usedIn: "Any sales page above $1, OTO page, sales-VSL outline, evergreen funnel landing page.",
    intro:
      "The Hook-Story-Offer page is the minimum-viable Brunson sales surface. Three sections — Hook, Story, Offer — with six blocks total. Every Brunson sales page collapses to this template; longer formats add layers on top, but the core structure is fixed.",
    blocks: [
      {
        label: "Hook — H1",
        purpose: "Above-the-fold outcome + time + buyer specificity.",
        template:
          "[OUTCOME] in [TIME], for [SPECIFIC AUDIENCE].",
        slotGuidance:
          "Same shape as the outcome-time-headline swipe file. The whole page hinges on this sentence.",
      },
      {
        label: "Hook — Sub-headline + CTA",
        purpose: "One sub-sentence of positioning + one outcome-CTA button.",
        template:
          "[POSITIONING SENTENCE]. [OUTCOME VERB] [SPECIFIC NEXT STEP].",
        slotGuidance:
          "Sub-headline is positioning, not a feature list. Outcome verb on CTA, not 'Get started'.",
      },
      {
        label: "Story — Founder bridge",
        purpose: "Three-paragraph Epiphany Bridge collapsed to landing-page length.",
        template:
          "[BACKSTORY]. [DESIRE]. [PROBLEM]. Then [EPIPHANY]. I now believe [NEW BELIEF]. [PRODUCT NAME] is what I built around that belief.",
        slotGuidance:
          "See /template/epiphany-bridge-story-template for the full structure. On a landing page, compress to 150-300 words.",
      },
      {
        label: "Story — Social proof",
        purpose: "One real testimonial or one stated absence ('we do not publish testimonials before they are verified').",
        template:
          "[ONE TESTIMONIAL with verifiable detail] OR [HONEST EMPTY STATE].",
        slotGuidance:
          "Honest empty state is a strong move pre-revenue. See /swipe-file/single-testimonial-block-swipe-file for honest social-proof patterns.",
      },
      {
        label: "Offer — Stack and price",
        purpose: "3-7 component stack slide with honest anchors, sum, and offer price.",
        template:
          "[COMPONENT 1] (value [$X]) + [COMPONENT 2] (value [$X]) + ... = [$SUM]. Today: [$OFFER PRICE].",
        slotGuidance:
          "See /template/stack-slide-script-template for the full block. Inflated anchors are the most common Hook-Story-Offer failure.",
      },
      {
        label: "Offer — Guarantee + CTA",
        purpose: "Specific guarantee (trigger, window, verifier, refund mechanism) + repeated outcome CTA.",
        template:
          "[SPECIFIC OUTCOME] in [TIME WINDOW], verified by [VERIFIER], or [REFUND PROMISE]. [OUTCOME VERB] [SPECIFIC NEXT STEP].",
        slotGuidance:
          "Same shape as the Dollar Objection script's guarantee block. The CTA must repeat the Hook's CTA exactly.",
      },
    ],
    workedExample:
      "Hook: 'First paying customer in 60 days, for post-launch pre-revenue founders.' Sub: 'The Brunson Hard-Rule playbook for non-engineer founders who shipped with AI tools. Start the diagnostic.' Story: '(see the founder block on the live homepage)' Offer: 'Seven-Step Playbook (value $X) + Weekly Office Hour (value $X) + Diagnostic Database (value $X) = $X real value. Today: $49 / month. First paying customer in 60 days, verified by Stripe, or full refund. Start the diagnostic.'",
    commonFailures: [
      "Skipping the Founder Bridge block. The page reads as a feature page instead of a sales surface.",
      "Hiding the price. The Offer section's job is to make the math believable; obscuring price breaks the math.",
      "Inflated anchors. Quality raters and savvy buyers spot inflated stacks immediately.",
      "Generic CTA. The same outcome verb must repeat on every CTA on the page.",
    ],
    relatedGlossary: ["hook", "story", "offer", "stack-slide"],
    fixesDiagnosis: "weak-offer",
    faqs: [
      {
        q: "How long should a Hook-Story-Offer page be?",
        a: "600-1,500 words for a $1-$49 offer; 1,500-3,000 words for a $49-$497 offer; 3,000-8,000 words for above $497. Length scales with price band; structure does not change.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "reluctant-hero-positioning-template",
    displayName: "Reluctant Hero positioning template",
    metaTitle: "Reluctant Hero Template (Brunson Founder Positioning)",
    metaDescription:
      "Fill-in template for the Brunson Reluctant Hero founder positioning — the 'I did not want to do this' founder story that builds trust without arrogance.",
    brunsonLens: "story",
    usedIn: "About page, founder block above the fold, podcast bio, press kit founder section, sales-page founder paragraph.",
    intro:
      "The Reluctant Hero is the Brunson founder-positioning script for founders who feel uncomfortable with the 'expert' frame. Five blocks: the reluctance, the trigger, the proof, the offer, the trust line. Done right, the founder builds authority without claiming guru status — which is exactly what indie SaaS audiences trust.",
    blocks: [
      {
        label: "Reluctance",
        purpose: "Open with the founder's discomfort with the expert frame.",
        template:
          "I did not want to [SPECIFIC ROLE THE READER WOULD ASSUME]. I am [SPECIFIC REAL ROLE], not [WHAT THE READER WOULD ASSUME].",
        slotGuidance:
          "[SPECIFIC ROLE THE READER WOULD ASSUME] = 'coach', 'guru', 'thought leader'. [SPECIFIC REAL ROLE] = your actual role, not a self-deprecating cover.",
      },
      {
        label: "Trigger",
        purpose: "Name the specific moment or pattern that forced you into building this thing.",
        template:
          "But after [SPECIFIC PATTERN, REPEATED EVENT, OR INTERVENTION], I realized [SPECIFIC OBSERVATION] kept happening to [SPECIFIC PEOPLE], and nobody was [SPECIFIC ACTION].",
        slotGuidance:
          "Reluctant-hero positioning works because the founder is doing this in response to an observed gap, not as a career move. Name the gap.",
      },
      {
        label: "Proof",
        purpose: "Name the specific work, identity, or outcome that gives you the right to be heard.",
        template:
          "I have [SPECIFIC EXPERIENCE / OUTCOME / IDENTITY]. I have [SPECIFIC TRACK RECORD]. I have seen [SPECIFIC PATTERN] [NUMBER] times.",
        slotGuidance:
          "Proof is specific, dated, and verifiable. Vague 'I have been doing this for years' loses to '12 launches over 3 years, 8 paying customers verified inside Stripe'.",
      },
      {
        label: "Offer",
        purpose: "Name what you built and who it is for, framed as a response to the trigger.",
        template:
          "[PRODUCT NAME] is what I built. It is for [SPECIFIC AUDIENCE]. It does [SPECIFIC OUTCOME].",
        slotGuidance:
          "Same audience-specific framing as the Hook block. The Reluctant Hero structure makes the offer feel like a service, not a hustle.",
      },
      {
        label: "Trust line",
        purpose: "End with a credibility-grounding line that names a specific accountability mechanism.",
        template:
          "Every claim on this site is dated and verifiable. You can reach me at [PERSONAL EMAIL]. [SPECIFIC ACCOUNTABILITY MECHANISM].",
        slotGuidance:
          "[SPECIFIC ACCOUNTABILITY MECHANISM] = the public editorial policy, corrections log, public dataset, Stripe-verified outcomes — whatever credibility surface you actually publish.",
      },
    ],
    workedExample:
      "I did not want to be a SaaS coach. I am a founder, not a guru. But after watching the same Hook / Story / Offer mistakes kill the same post-launch pre-revenue founders again and again, I realized nobody was teaching the work post-launch founders actually have to do. I have shipped my own indie SaaS, watched 30+ founders try to do the same with AI code tools, and seen the same three failure modes every time. Unlock SaaS is what I built. It is for non-engineer founders who shipped a SaaS with Lovable / Claude / Cursor and have a flat Stripe line. It diagnoses and fixes that line in 60 days. Every claim on this site is dated and verifiable. You can reach me at maryan@unlocksaas.com. The /builders directory only adds founders whose first paying customer Stripe confirmed.",
    commonFailures: [
      "False reluctance. If the founder is performing modesty, the reader feels it. The reluctance has to be real.",
      "Vague Proof block. 'I have helped many founders' is the failure mode. Numbers and dates beat platitudes.",
      "Inflated Proof block. Stretching credentials breaks the same trust the reluctance was supposed to build.",
      "Missing Trust line. The reluctant-hero arc collapses if the founder does not name an accountability mechanism at the end.",
    ],
    relatedGlossary: ["reluctant-hero", "story", "weak-belief"],
    fixesDiagnosis: "weak-belief",
    faqs: [
      {
        q: "When is Reluctant Hero positioning the wrong move?",
        a: "When the audience expects expert framing — e.g. enterprise B2B at $10k+ pricing. Reluctant Hero positions warmth and credibility; enterprise buyers in regulated industries often expect authority framing instead.",
      },
    ],
    lastVerified: "2026-05-19",
  },
];

export const TEMPLATE_SLUGS: ReadonlyArray<string> = TEMPLATE_ENTRIES.map(
  (e) => e.slug,
);

export function getTemplateBySlug(slug: string): TemplateEntry | undefined {
  return TEMPLATE_ENTRIES.find((e) => e.slug === slug);
}

// Build-time guard: every relatedGlossary slug must resolve in glossary.ts.
{
  const known = new Set<string>(GLOSSARY_SLUGS);
  for (const entry of TEMPLATE_ENTRIES) {
    for (const slug of entry.relatedGlossary) {
      if (!known.has(slug)) {
        throw new Error(
          `templates.ts: entry "${entry.slug}" references unknown glossary slug "${slug}". Add the term to glossary.ts first, or correct the slug.`,
        );
      }
    }
  }
}
