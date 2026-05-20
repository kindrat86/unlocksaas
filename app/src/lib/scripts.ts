/**
 * /scripts/[funnel-type] pSEO catalog – ready-to-record funnel scripts.
 *
 * Founders mid-build search for "VSL script template", "webinar script
 * outline", "soap opera sequence template". Each entry is a complete
 * recordable/sendable script for one Brunson funnel archetype, with
 * timing markers, founder notes, and the swappable variables called
 * out. The script is the lead magnet AND the SEO surface.
 *
 * Brunson Hard-Rule reconciliation:
 *   - Scripts teach the structure, not the words. Every entry tells the
 *     founder what to say, not the exact line to copy. Verbatim scripts
 *     would violate the no-fabricated-claims rule (we'd be putting
 *     specific dollar numbers in a template that the founder may not
 *     actually be able to deliver).
 *   - Each block carries timing + intent + founder-note so the founder
 *     can adapt to their voice without losing the structural moves.
 *   - All CTAs land on /diagnostic. The script is the gift; the read
 *     is the next step.
 */

export interface ScriptBlock {
  /** Section label / timing marker, e.g. "0:00 – 0:30 (Hook)". */
  marker: string;
  /** Intent of this block, e.g. "Name the audience". */
  intent: string;
  /** What the founder says (paraphrased, structural – not verbatim copy). */
  saySomethingLike: string;
  /** Why this block exists – the Brunson-framework reasoning. */
  founderNote: string;
}

export interface ScriptEntry {
  /** URL slug, kebab-case. */
  slug: string;
  /** Display name of the script type. */
  displayName: string;
  /** SEO meta title, under 60 chars. */
  metaTitle: string;
  /** SEO meta description, under 160 chars. */
  metaDescription: string;
  /** TL;DR: what this script does, ~50 words. */
  tldr: string;
  /** Format (video, email sequence, webinar slide deck, etc.). */
  format: string;
  /** Target length / duration. */
  targetLength: string;
  /** When this script is the right choice. */
  whenToUse: string;
  /** Sequential script blocks. */
  blocks: ReadonlyArray<ScriptBlock>;
  /** Variables the founder must fill in (audience, outcome, price, etc.). */
  variables: ReadonlyArray<{ name: string; note: string }>;
  /** Common script-level mistakes. */
  commonMistakes: ReadonlyArray<string>;
  /** Three FAQs in AEO format. */
  faqs: ReadonlyArray<{ q: string; a: string }>;
  /** Related glossary terms. */
  relatedGlossary: ReadonlyArray<string>;
  /** Related funnel-playbook slug, if any. */
  relatedPlaybook?: string;
  /** ISO date last verified. */
  lastVerified: string;
}

export const SCRIPT_ENTRIES: ReadonlyArray<ScriptEntry> = [
  {
    slug: "vsl",
    displayName: "Video sales letter (VSL) script",
    metaTitle: "VSL Script Template (Brunson Structure, 8–22 min)",
    metaDescription:
      "Recordable VSL script with timing markers for the Hook, Story, Mechanism, Stack, and Close. Built on Brunson structure, tuned for indie SaaS.",
    tldr:
      "A complete VSL script template structured on the Brunson Hook / Story / Offer pattern, with timing markers and founder notes for each block. Designed for indie SaaS offers priced between $27 and $1,997. Records in one session; iterates from a real script, not a blank page.",
    format: "Single-camera founder-led video",
    targetLength: "8 to 22 minutes (offers under $100) / 22 to 45 minutes (offers $100–$1,000)",
    whenToUse:
      "Cold-traffic conversion for offers between $27 and $1,997. Best when the founder is comfortable on camera and the audience is searching the problem (warm-but-not-customer). For higher-ticket offers, use the Perfect Webinar script instead.",
    blocks: [
      {
        marker: "0:00 – 0:30 (Hook)",
        intent: "Name the audience and the outcome in the first 5 seconds.",
        saySomethingLike:
          "If you've [specific situation, e.g. launched a SaaS and got 50 sign-ups and 0 paying customers], this video is for you. In the next [length] minutes, I'm going to show you [specific transformation] using [specific mechanism].",
        founderNote:
          "Audience-first, founder-second. If a stranger can't tell within 5 seconds whether this is for them, the VSL is broken before it starts. Lifts completion 30 to 60% over founder-first openings.",
      },
      {
        marker: "0:30 – 4:00 (Founder story)",
        intent: "Build trust through specific dated experience, not credentials.",
        saySomethingLike:
          "Here's how I learned this. [3-paragraph story: where you started, the moment of insight, what changed]. Specific dates, specific numbers, specific outcomes – not generic 'years of experience'.",
        founderNote:
          "Story builds trust; credentials prove competence. The Brunson Epiphany Bridge: take the viewer through the same transformation arc you went through, so the after-state feels achievable.",
      },
      {
        marker: "4:00 – 12:00 (Mechanism teach)",
        intent: "Teach the conceptual framework. Not feature list – pattern.",
        saySomethingLike:
          "The reason [problem] happens to most [audience] is [pattern]. Here's the pattern that fixes it: [3-part framework]. Walk through each part with one example each. Don't teach the entire system – teach the framework.",
        founderNote:
          "Teach enough that the viewer understands why your offer works, not enough that they can do it themselves. The teaching builds authority; the offer delivers the implementation.",
      },
      {
        marker: "12:00 – 18:00 (Stack the offer)",
        intent: "Build the Stack Slide. Six to twelve deliverables, each anchored.",
        saySomethingLike:
          "Here's what's in [the offer]. [Deliverable 1] – normally $X. [Deliverable 2] – normally $X. [continue for 6–12 items]. Total value $Y. Your price today: $Z, which is [fraction] of the total.",
        founderNote:
          "The Stack is the load-bearing close mechanic. Without it, the price is the only number on the screen and the viewer has nothing to anchor against. Each line item must be a distinct deliverable, not the same product rebranded.",
      },
      {
        marker: "18:00 – 20:00 (Risk reversal)",
        intent: "State the guarantee. Specific event, specific window.",
        saySomethingLike:
          "If [specific event, e.g. 'you don't see your first paying customer'] within [specific window, e.g. '60 days'], [specific remedy, e.g. 'full refund, no questions']. Here's why I can offer that: [reason rooted in your data].",
        founderNote:
          "Specific guarantees outconvert generic 'satisfaction guaranteed' by 2 to 5x. The remedy must be tied to a measurable event the buyer can verify themselves, not a vague subjective state.",
      },
      {
        marker: "20:00 – 22:00 (Close + CTA)",
        intent: "Tell the viewer exactly what to do, mechanically.",
        saySomethingLike:
          "Here's what to do next. Click the button below this video. Enter your card. You'll have access to [first deliverable] within 90 seconds. If [outcome] doesn't happen by [date], the guarantee kicks in. I'll see you on the inside.",
        founderNote:
          "The close is mechanical, not emotional. The viewer has already decided by minute 18; minute 20–22 is about removing the next-action friction. Be specific about the post-purchase experience.",
      },
    ],
    variables: [
      { name: "[audience]", note: "The specific cohort. Not 'founders' – 'indie SaaS founders post-launch'." },
      { name: "[transformation]", note: "The specific outcome. Not 'grow your business' – 'pin your first paying customer'." },
      { name: "[price]", note: "Stated once, at minute 17–18. Confident, no apologising." },
      { name: "[guarantee event]", note: "The measurable trigger – not 'satisfaction', but 'first paying customer by day 60'." },
    ],
    commonMistakes: [
      "Opening with founder credentials. Viewers bounce in the first 15 seconds when the founder talks about themselves first.",
      "Skipping the Stack Slide. Without it, the price is unanchored and conversion collapses.",
      "Hiding the price until the buy button. State the price at minute 17–18; hiding it feels manipulative.",
      "Going under 8 minutes. Below 8 minutes there's not enough time to build belief for offers above $27.",
      "Reading the script verbatim. Use the structure; speak in your voice. Verbatim reads feel robotic on camera.",
    ],
    faqs: [
      {
        q: "How long should my VSL be?",
        a: "8 to 22 minutes for offers under $100. 22 to 45 minutes for offers $100 to $1,000. Beyond $1,000, switch to the Perfect Webinar script (60 to 90 minutes). Shorter than 8 minutes rarely builds enough belief; longer than 45 loses cold traffic.",
      },
      {
        q: "Do I need professional video equipment?",
        a: "No. A modern smartphone, decent lighting, and a quiet room out-converts a poorly-scripted studio production. Script and pacing matter 10x more than production quality for VSL conversion.",
      },
      {
        q: "Should I record once and iterate, or get it perfect first?",
        a: "Record version 1 in one session. Ship it. Measure where viewers drop off (the retention curve is your script's diagnostic). Re-record only the blocks where the curve breaks. Most founders rewrite forever and ship nothing.",
      },
    ],
    relatedGlossary: ["hook", "story", "offer", "stack-slide"],
    relatedPlaybook: "vsl",
    lastVerified: "2026-05-20",
  },
  {
    slug: "perfect-webinar",
    displayName: "Perfect Webinar script",
    metaTitle: "Perfect Webinar Script (Brunson 60–90 min Structure)",
    metaDescription:
      "Recordable Perfect Webinar script: epiphany bridge, three secrets, stack, close. Built on Russell Brunson's structure for $497–$2,997 offers.",
    tldr:
      "A complete Perfect Webinar script structured on Russell Brunson's signature framework: title, epiphany bridge, three secrets that break false beliefs, stack, close, and Q&A. Designed for indie SaaS offers priced between $497 and $2,997. Run live for 5 to 10 cohorts before evergreening.",
    format: "Live one-to-many webinar (Zoom, Demio, or equivalent)",
    targetLength: "60 to 90 minutes",
    whenToUse:
      "Cold-to-warm conversion for offers between $497 and $2,997. Best when the founder can commit to live delivery for the first 5 to 10 cohorts. For offers under $497, use the VSL script; for offers over $5K, use a multi-session sequence.",
    blocks: [
      {
        marker: "0:00 – 5:00 (Big promise)",
        intent: "Restate the registration-page title as a promise to attendees.",
        saySomethingLike:
          "In the next 60 minutes, I'm going to show you exactly how [audience] [outcome] in [timeframe] using [mechanism]. By the end of this session, you'll have [3 specific takeaways].",
        founderNote:
          "Locks in the why-they're-here. Attendees who showed up unclear bounce in the first 5 minutes; the big promise restates the contract.",
      },
      {
        marker: "5:00 – 20:00 (Epiphany bridge story)",
        intent: "Tell your transformation story – before, insight, after.",
        saySomethingLike:
          "Here's how I figured this out. [Before state: where I was, what I was struggling with, the specific moment of pain]. [Insight: the moment something clicked, the unexpected source]. [After state: what changed, the specific dated outcomes].",
        founderNote:
          "The epiphany bridge is the load-bearing belief-builder. Attendees identify with the before-state and start believing the after-state is possible. Don't sanitize the before – the more specific the struggle, the more credible the journey.",
      },
      {
        marker: "20:00 – 30:00 (Secret 1: breaks the vehicle belief)",
        intent: "Break the belief about what mechanism to use.",
        saySomethingLike:
          "Secret 1: [the vehicle most people use] doesn't work because [reason]. The vehicle that actually works is [yours]. Here's why: [evidence + one quick example].",
        founderNote:
          "The vehicle belief is the external 'which tool/method' question. Break it by showing why the common answer is wrong, then naming yours. One example, not three.",
      },
      {
        marker: "30:00 – 40:00 (Secret 2: breaks the internal belief)",
        intent: "Break the belief about whether they personally can do it.",
        saySomethingLike:
          "Secret 2: You don't need [common prerequisite – more time, more audience, more skill]. What you actually need is [different prerequisite]. Here's why: [evidence].",
        founderNote:
          "The internal belief is the 'can I do it' question. Break it by removing the perceived prerequisite. This is where unqualified attendees self-qualify in.",
      },
      {
        marker: "40:00 – 50:00 (Secret 3: breaks the external belief)",
        intent: "Break the belief about the outside world / circumstances.",
        saySomethingLike:
          "Secret 3: You don't need [external prerequisite – better market, better timing, better luck]. The market/timing/circumstance you're in right now is [actually fine because reason].",
        founderNote:
          "The external belief is the 'is the world set up for this' question. Break it by reframing their current circumstances as workable. Attendees stop waiting; they become buyers.",
      },
      {
        marker: "50:00 – 55:00 (Transition to offer)",
        intent: "Bridge from teaching to selling.",
        saySomethingLike:
          "Now here's where it gets practical. I want to give you everything I just taught, plus the complete system, in one package. Here's what's in it.",
        founderNote:
          "The bridge from teaching to selling. Done well, the audience leans in; done poorly, they bounce. The Brunson signal: 'I want to give you...' is the canonical phrasing.",
      },
      {
        marker: "55:00 – 75:00 (Stack the offer)",
        intent: "Walk through 6 to 12 deliverables, each on its own slide, anchored.",
        saySomethingLike:
          "[Deliverable 1] – normally $X. [Deliverable 2] – normally $X. [continue for 6–12 items, one per slide]. Total value: $Y. Your investment today: $Z.",
        founderNote:
          "The Stack Slide is the central close mechanic of the Perfect Webinar. Each line item gets its own slide; each gets a small dollar anchor; the total is read aloud before the price reveal.",
      },
      {
        marker: "75:00 – 85:00 (Risk reversal + urgency)",
        intent: "Specific guarantee + real (not fake) urgency.",
        saySomethingLike:
          "If [specific event] doesn't happen by [specific date], full refund. The reason I can offer that: [your data point]. This price closes on [real date]; after that, the price goes to $W.",
        founderNote:
          "Real urgency only. Cart-open / cart-close patterns work; fake countdowns that reset on refresh train audiences to ignore urgency forever.",
      },
      {
        marker: "85:00 – 90:00 (Q&A while cart is open)",
        intent: "Capture fence-sitters by answering live objections.",
        saySomethingLike:
          "Cart is open. I'll be here for the next 15 minutes answering questions. If you're on the fence, drop your question in the chat and I'll address it live.",
        founderNote:
          "Q&A converts fence-sitters by surfacing the objection they have but couldn't articulate. Keep the cart visibly open; answer specifically, not generically.",
      },
    ],
    variables: [
      { name: "[audience]", note: "The specific cohort. Title-level specific." },
      { name: "[outcome]", note: "The specific transformation. Verifiable end-state." },
      { name: "[timeframe]", note: "The specific window. Number plus unit, not 'fast'." },
      { name: "[mechanism]", note: "Your branded framework name (or descriptive phrase)." },
      { name: "[3 secrets]", note: "Each breaks one belief: vehicle / internal / external. Don't reorder." },
    ],
    commonMistakes: [
      "Vague title that promises a topic instead of a transformation.",
      "Skipping the epiphany bridge. Without your transformation story, no belief is built.",
      "Teaching too much in the secrets section. Each secret breaks ONE belief; teaching the whole framework here means there's nothing left to buy.",
      "Weak Stack Slide. Listing the same product across multiple bullet points doesn't stack; it pads.",
      "Fake urgency. Resets-on-refresh countdowns destroy audience trust permanently.",
    ],
    faqs: [
      {
        q: "Should I run the Perfect Webinar live or evergreen?",
        a: "Live for the first 5 to 10 sessions to iterate the script with real attendee reactions, drop-off data, and Q&A patterns. Evergreen after that. Polished evergreen converts as well as live, but only after the script has been refined.",
      },
      {
        q: "How many registrations do I need for a viable session?",
        a: "200+ registrations minimum. 30% show-up × 5% buy rate × $1,997 = $5,991 in revenue. Below 200 registrations the math gets thin. Most founders aim for 500 to 2,000 registrations per session.",
      },
      {
        q: "Can I run the Perfect Webinar for offers under $497?",
        a: "You can, but the economics rarely work. A 60-minute webinar selling a $97 offer has worse unit economics than a 15-minute VSL doing the same job. Use Perfect Webinar above $497, VSL below.",
      },
    ],
    relatedGlossary: ["perfect-webinar", "hook", "story", "offer", "stack-slide"],
    relatedPlaybook: "perfect-webinar",
    lastVerified: "2026-05-20",
  },
  {
    slug: "soap-opera-sequence",
    displayName: "Soap Opera Sequence (5-email script)",
    metaTitle: "Soap Opera Sequence Script (5-Email Brunson Pattern)",
    metaDescription:
      "Ready-to-send 5-email Soap Opera Sequence script with timing, subject-line patterns, and founder notes. Built on Brunson's narrative arc.",
    tldr:
      "A complete 5-email Soap Opera Sequence script for new subscribers, structured on Russell Brunson's narrative arc: backstory, wall, epiphany, hidden benefits, urgency. Each email ends with a cliffhanger that hooks the next open. Converts 2 to 8% of new subscribers to first purchase.",
    format: "Email sequence, sent daily after opt-in",
    targetLength: "5 emails, 300–500 words each, sent 24 hours apart",
    whenToUse:
      "Immediately after opt-in. The Soap Opera Sequence converts subscribers in the first 5 to 7 days when engagement is highest. After the sequence ends, roll into the Seinfeld Email pattern for ongoing engagement.",
    blocks: [
      {
        marker: "Email 1 / Day 0 (Backstory)",
        intent: "Open with the moment you became the person who can help them.",
        saySomethingLike:
          "Subject: short, curiosity-driven. Body: tell the founder origin story – before-state pain, the specific moment something shifted, what you started doing differently. End with: 'Tomorrow I'll tell you about the wall I hit and how I broke through.'",
        founderNote:
          "Sent immediately after opt-in delivery. The reader is most engaged in the first 24 hours – this email earns the right to send the next four.",
      },
      {
        marker: "Email 2 / Day 1 (Wall)",
        intent: "The crisis moment. The thing that almost stopped the journey.",
        saySomethingLike:
          "Subject: hints at conflict or near-miss. Body: tell the wall – specific enough that it's clearly real, not a marketing trope. The reader feels the stakes. End with: 'Tomorrow I'll tell you what changed everything.'",
        founderNote:
          "The wall is where most narratives fail – founders sanitize it. Don't. The specificity of the struggle is what makes the breakthrough credible.",
      },
      {
        marker: "Email 3 / Day 2 (Epiphany)",
        intent: "The breakthrough moment – introduce the framework.",
        saySomethingLike:
          "Subject: signals a shift or insight. Body: the moment of insight. The unexpected source. The pattern you discovered. This is where you introduce the framework your product is built around. End with: 'Tomorrow I'll show you the unexpected side benefits.'",
        founderNote:
          "Epiphany emails convert best when the insight is genuinely surprising to the reader – not 'work harder' but 'I realised X was the wrong question'.",
      },
      {
        marker: "Email 4 / Day 3 (Hidden benefits)",
        intent: "The unexpected ways the epiphany kept paying off.",
        saySomethingLike:
          "Subject: hints at second-order benefits. Body: the side benefits the reader wouldn't have predicted. Builds belief in the framework. End with: 'Tomorrow I'm going to make you an offer you can take or leave.'",
        founderNote:
          "Hidden benefits are the proof-of-compounding step. The reader sees that the framework keeps working in ways the original problem didn't predict. Don't pitch yet; build the case.",
      },
      {
        marker: "Email 5 / Day 4 (Urgency)",
        intent: "Direct offer. The core product + stack + risk-reversal + buy link.",
        saySomethingLike:
          "Subject: direct, not curiosity-driven. Body: the offer. The stack. The guarantee. The specific reason to act now (cohort closing, price changing, bonus disappearing). The buy link. Tell them this is the last email in the series.",
        founderNote:
          "Email 5 is the only sales email in the sequence. Emails 1–4 earn the right to send this one. Most founders pitch in email 1 and burn the sequence – discipline matters here.",
      },
      {
        marker: "Email 6+ / Day 7 onward (Roll into Seinfeld)",
        intent: "Transition to ongoing engagement.",
        saySomethingLike:
          "Continue with the Seinfeld Email pattern: 3 to 4 emails per week, 80% personality and stories, 20% direct offer. The subscriber relationship now compounds across months.",
        founderNote:
          "The Soap Opera converts the early window; the Seinfeld pattern converts the long tail. Both are necessary. Skipping the Seinfeld layer caps email revenue at the Soap Opera's 5-email yield.",
      },
    ],
    variables: [
      { name: "[backstory]", note: "Your real founder origin. Specific dates, specific moments. Not a sanitized version." },
      { name: "[the wall]", note: "The crisis. Specific, real. Don't invent dramatic stakes – use what actually happened." },
      { name: "[the epiphany]", note: "The framework name + the moment you discovered it." },
      { name: "[the offer]", note: "The core product. The stack. The risk-reversal. Stated in email 5 only." },
    ],
    commonMistakes: [
      "Treating the Soap Opera as a 5-email autoresponder of value content. The narrative arc is the whole point.",
      "Inventing a backstory that's clearly marketing. Readers can tell. Use the real story; if it's small, tell it small with specificity.",
      "Skipping the cliffhangers. Each email ends with a reason to open the next. Without them, open rates collapse from email 1 to email 5.",
      "Pitching in email 1. Telegraphs 'this is marketing' and tanks the rest of the sequence.",
      "Reusing the same Soap Opera across products. Each product needs its own narrative; the story has to match the offer.",
    ],
    faqs: [
      {
        q: "Should the Soap Opera be 5 emails or longer?",
        a: "5 is the Brunson default. 7 emails works for higher-ticket offers where more belief-building is needed. Beyond 7, narrative momentum collapses.",
      },
      {
        q: "Can I run a Soap Opera for trial users instead of subscribers?",
        a: "Yes. Replace 'opt-in' with 'trial start'. The 5-email arc still works: backstory, wall, epiphany, hidden benefits, urgency-to-upgrade. Converts trial users at 8 to 25%.",
      },
      {
        q: "What's the right sending cadence – daily or every other day?",
        a: "Daily for cold-acquired subscribers in the first 7 days. The Brunson pattern is intentionally aggressive because the reader is most engaged in the first 72 hours. Slower cadences lose momentum.",
      },
    ],
    relatedGlossary: ["soap-opera-sequence", "story", "seinfeld-email"],
    relatedPlaybook: "soap-opera-sequence",
    lastVerified: "2026-05-20",
  },
  {
    slug: "tripwire-sales-page",
    displayName: "Tripwire sales page script",
    metaTitle: "Tripwire Sales Page Script ($1–$27 Entry Offer Template)",
    metaDescription:
      "Under-400-word tripwire sales page script with the Brunson Hook, Story, Offer structure for $1 to $27 entry offers.",
    tldr:
      "A complete tripwire sales page script in under 400 words. Hook (audience + outcome), short story (3 sentences), stacked offer with specific deliverables, named founder credibility, no-subscription buy button, post-purchase OTO insertion point. Designed for $1 to $27 entry offers.",
    format: "Single-page sales copy",
    targetLength: "300 to 400 words total",
    whenToUse:
      "Cold-traffic entry funnels. Best when the front-end offer is genuinely small (one diagnostic, one template, one finished thing). For larger offers, use the VSL script. The tripwire's job is conversion to customer, not revenue.",
    blocks: [
      {
        marker: "Block 1: Hook (1 sentence, top of page)",
        intent: "Name the audience and the specific outcome.",
        saySomethingLike:
          "[For specific audience] who [specific situation], here's [specific finished thing] for $[1 to 27].",
        founderNote:
          "Hook is the H1. If a stranger can't tell from the H1 alone who this is for and what they get, the tripwire is broken.",
      },
      {
        marker: "Block 2: Story (3 sentences)",
        intent: "Why this exists. The 3-sentence why-it-was-built.",
        saySomethingLike:
          "I built this because [specific observation about the audience's pain]. After [specific number] of these, the pattern was [specific insight]. Now I'm packaging it up so you can [outcome] without [common alternative cost].",
        founderNote:
          "Three sentences total. Story builds trust; longer copy turns this into a VSL-shaped page, which underperforms at tripwire price points.",
      },
      {
        marker: "Block 3: Stack (5 bullet points)",
        intent: "List 5 deliverables, each with a small dollar anchor.",
        saySomethingLike:
          "Here's what you get:\\n• [Deliverable 1] – [small anchor, e.g. $19 value]\\n• [Deliverable 2] – [$15 value]\\n• [Deliverable 3] – [$25 value]\\n• [Deliverable 4] – [$10 value]\\n• [Bonus 5] – [$15 value]\\nTotal value: $84. Your price today: $7.",
        founderNote:
          "Stack is the close mechanic at every price point. Five distinct deliverables – not five rephrasings of the same thing. The total-to-price ratio gives the reader something to anchor against.",
      },
      {
        marker: "Block 4: Credibility (1 sentence)",
        intent: "Named founder, dated specific outcome.",
        saySomethingLike:
          "Built by [your name], who [specific dated outcome, e.g. 'teardown 41 indie SaaS pages between January and April 2026'].",
        founderNote:
          "One specific dated number beats every 'expert' badge. Generic credibility ('trusted by founders') hurts conversion at tripwire price points because it reads as marketing.",
      },
      {
        marker: "Block 5: Buy button (with explicit terms)",
        intent: "Buy + explicit no-subscription guarantee.",
        saySomethingLike:
          "[Buy button: 'Yes, send me [deliverable] for $7']. Below button: 'One-time charge, no subscription, instant access. 60-day money back if you don't [specific outcome].'",
        founderNote:
          "Explicit terms beat trust-implied terms at the tripwire step. 'One-time charge' verbatim. 'No subscription' verbatim. Trip-feel kills tripwires; explicit terms remove the trip-feel.",
      },
      {
        marker: "Block 6: Post-purchase OTO (next page)",
        intent: "Show the OTO immediately after Stripe success.",
        saySomethingLike:
          "On the Stripe success page: 'You just got [front-end]. Want [extension of the same decision] for $[2–5x front-end price]? One-click add, no re-entering payment info.'",
        founderNote:
          "The OTO captures 15 to 35% of tripwire buyers and often doubles funnel profitability. Must extend the decision the buyer just made, not introduce a new one.",
      },
    ],
    variables: [
      { name: "[audience]", note: "Specific cohort. The hook lives or dies on this." },
      { name: "[finished thing]", note: "Something the buyer can use in one sitting. Not a course – a worksheet, a diagnostic, a template." },
      { name: "[price]", note: "$1 if one-shot. $7 to $27 if multi-day commitment." },
      { name: "[guarantee event]", note: "Measurable trigger, not subjective satisfaction." },
    ],
    commonMistakes: [
      "Over-writing. Above 400 words and the page reads like a VSL, which underconverts at tripwire prices.",
      "Vague stack. 'Includes 30 minutes of video' instead of 'Module 1: Diagnose your hero section'.",
      "No explicit 'no subscription' language. Tripwire dispute rate climbs without it.",
      "Generic credibility. 'Trusted by founders' at $7 reads as marketing, not proof.",
      "No OTO. Skipping the OTO leaves 15 to 35% of profit on the table per buyer.",
    ],
    faqs: [
      {
        q: "How short can a tripwire sales page be?",
        a: "200 words is the floor; under 200 and you can't establish enough belief for even a $7 charge. 300 to 400 words is the sweet spot. Above 600 and you're writing a VSL, not a tripwire page.",
      },
      {
        q: "Should I show testimonials on a tripwire page?",
        a: "One specific named testimonial is plenty. Multiple testimonials feel like overkill at $7 and push the page past the optimal length. One named outcome is the proof signal that matters.",
      },
      {
        q: "What price actually works best – $1, $7, or $27?",
        a: "$1 if the deliverable is one-shot (a diagnostic, a template). $7 to $27 if the deliverable is a multi-day commitment (a workbook, a 5-day mini-course). Price must match the unit of value, not pick from a menu.",
      },
    ],
    relatedGlossary: ["offer", "stack-slide", "value-ladder"],
    relatedPlaybook: "tripwire",
    lastVerified: "2026-05-20",
  },
  {
    slug: "oto-script",
    displayName: "One-time offer (OTO) script",
    metaTitle: "OTO Script (Upsell Page Template, Under 200 Words)",
    metaDescription:
      "Under-200-word OTO upsell script shown immediately after Stripe success. Extends the buyer's decision instead of restarting the pitch.",
    tldr:
      "A complete OTO upsell page script in under 200 words. Headline (natural-next-step), 3-bullet stack, price with comparison to just-paid front-end, two clearly visible buttons (yes / no thanks), mirror of front-end's guarantee. Captures 15 to 35% of front-end buyers.",
    format: "Single-page upsell shown after front-end Stripe success",
    targetLength: "150 to 200 words",
    whenToUse:
      "On every front-end funnel (tripwire, VSL, sales page, Perfect Webinar). The OTO is funnel infrastructure, not a separate strategy. If you have any paid offer with a checkout, you should have at least one OTO step.",
    blocks: [
      {
        marker: "Block 1: Headline (1 line)",
        intent: "Name the natural-next-step outcome.",
        saySomethingLike:
          "You just got [front-end deliverable]. Now [natural extension] for $[2–5x front-end price].",
        founderNote:
          "Headline extends the buyer's just-made decision. 'You just got X' acknowledges the decision; 'Now [Y]' extends it. Do not introduce a new sales argument.",
      },
      {
        marker: "Block 2: Stack (3 bullets)",
        intent: "List 3 deliverables specific to the upgrade.",
        saySomethingLike:
          "Here's what's added:\\n• [Extension 1] – [small anchor]\\n• [Extension 2] – [small anchor]\\n• [Bonus 3] – [small anchor]",
        founderNote:
          "Three bullets max. The buyer already trusts you; don't re-pitch. The stack is shorthand confirmation that the price is fair.",
      },
      {
        marker: "Block 3: Price + guarantee (1 line)",
        intent: "State the price + mirror the front-end's guarantee.",
        saySomethingLike:
          "$[OTO price]. Same [60-day] guarantee as your [front-end] – refund if [outcome] doesn't happen by [date].",
        founderNote:
          "Guarantee mirroring is mandatory. If the front-end has a 60-day guarantee and the OTO has 'no refunds on upgrades', the buyer's trust collapses and the OTO converts at near-zero.",
      },
      {
        marker: "Block 4: Buttons (2, both visible)",
        intent: "Yes / no thanks – both buttons clearly visible.",
        saySomethingLike:
          "[Yes button: 'Yes, add this for $X – one-click'] | [No thanks button: 'No thanks, just send me [front-end]']",
        founderNote:
          "Both buttons visible and labelled. Hidden 'no thanks' is adversarial UX that survives short-term but kills long-term trust. The 'yes' button must be one-click (Stripe Setup Intent) – re-entering card info tanks OTO conversion by 40 to 70%.",
      },
    ],
    variables: [
      { name: "[front-end deliverable]", note: "What the buyer just paid for. Verbatim from the front-end page." },
      { name: "[natural extension]", note: "The next thing in the same direction. Not a leap to a different cohort." },
      { name: "[OTO price]", note: "2x to 5x the front-end. Beyond 5x feels like a frame-break." },
      { name: "[guarantee event]", note: "Same trigger event as the front-end. Mirror exactly." },
    ],
    commonMistakes: [
      "OTO is a different cohort's offer. $1 starter buyer + $497 mastermind OTO = frame break, near-zero conversion.",
      "OTO has more friction than front-end. Re-entering card details, extra info forms, popup confirmations all cost 10–30% per friction layer.",
      "OTO is the same product re-priced. Feels like bait-and-switch on the original purchase.",
      "Hidden 'no thanks' button. Adversarial UX that destroys long-term trust.",
      "Different guarantee terms than front-end. Buyer's just-built trust collapses.",
    ],
    faqs: [
      {
        q: "Should the OTO be on a separate page or in the checkout?",
        a: "Separate page after Stripe success. In-checkout order-bumps work for low-priced add-ons ($7–$19 bumps to a $97 core) but underperform separate-page OTOs for higher-priced extensions.",
      },
      {
        q: "How long should the OTO page be visible?",
        a: "Permanent. The phrase 'one-time offer' means the offer is a one-time decision in the buyer's path, not a time-limited offer. Fake countdowns are trust-breaks.",
      },
      {
        q: "Should I have one OTO or two?",
        a: "Start with one. Take rate on a second OTO is 5 to 20% of buyers who took the first. Beyond two, take rates collapse and the funnel feels like a hard sell.",
      },
    ],
    relatedGlossary: ["offer", "stack-slide", "value-ladder"],
    relatedPlaybook: "oto",
    lastVerified: "2026-05-20",
  },
  {
    slug: "seinfeld-email",
    displayName: "Seinfeld Email pattern script",
    metaTitle: "Seinfeld Email Script (Daily/Weekly Brunson Template)",
    metaDescription:
      "Recordable Seinfeld Email template: real-life hook, transition, lesson, soft offer, P.S. The Brunson ongoing-engagement pattern.",
    tldr:
      "A complete single-email Seinfeld template – the Brunson ongoing-engagement pattern. Real-life hook, transition to the audience's situation, one specific lesson, soft offer link (20% of the time), and the most-read P.S. line. Send 3 to 4 per week after the Soap Opera Sequence ends.",
    format: "Single email, plain-text, founder-voice",
    targetLength: "400 to 600 words",
    whenToUse:
      "Steady-state list engagement after a subscriber finishes the Soap Opera Sequence. The Seinfeld pattern is where most email revenue lives across months. Without it, list engagement decays and email economics cap at the 5-email Soap Opera yield.",
    blocks: [
      {
        marker: "Block 1: Subject line",
        intent: "Curiosity-driven, conversational, NOT topical.",
        saySomethingLike:
          "Subject: a hint about the real-life moment, not the lesson. Example: 'something the barista said' beats 'today's productivity tip'.",
        founderNote:
          "Subject lines describe the hook, not the takeaway. The reader opens to see what happened, not to learn a thing. Engagement compounds when subjects feel personal.",
      },
      {
        marker: "Block 2: Real-life hook (1 paragraph)",
        intent: "Open with a thing that happened. Specific. Concrete.",
        saySomethingLike:
          "Yesterday at [specific place], [specific small thing happened]. [One detail that makes it feel real, not generic].",
        founderNote:
          "Specific and concrete. 'I was at the coffee shop and overheard...' beats 'I want to talk about communication.' The 'about nothing' framing is what makes Seinfeld emails work.",
      },
      {
        marker: "Block 3: Transition (1 paragraph)",
        intent: "Bridge from your moment to the reader's situation.",
        saySomethingLike:
          "It got me thinking about [the parallel for your audience]. Most [audience] [specific behavior pattern]. The thing the barista did/said is exactly what [audience] should be doing in [their context].",
        founderNote:
          "The bridge is the load-bearing move. Done well, the reader thinks 'yes, that's my situation'. Done poorly, it reads like manipulation – 'and now here's how I'm going to sell you something'.",
      },
      {
        marker: "Block 4: Lesson (2–3 paragraphs)",
        intent: "Land on ONE specific takeaway. Not a list, not a framework.",
        saySomethingLike:
          "Here's the lesson: [one specific takeaway]. [One example of what it looks like]. [One counter-example or common mistake]. That's it for today.",
        founderNote:
          "One lesson, not a framework. Save the frameworks for the product. The Seinfeld email's job is to keep showing up with specific small insights – the frameworks live in the paid offers.",
      },
      {
        marker: "Block 5: Soft link (20% of emails only)",
        intent: "Optional soft-link to a relevant product page.",
        saySomethingLike:
          "If this resonates, you'd probably get something from [specific product link]. [One sentence why this product specifically fits today's lesson].",
        founderNote:
          "Soft link in 1 of every 5 emails. The discipline of the 80% builds the trust that makes the 20% convert. Including a pitch in every email turns the list into a marketing channel; rotating builds a relationship.",
      },
      {
        marker: "Block 6: Sign-off + P.S. (mandatory)",
        intent: "First-name sign-off + P.S. as a second hook.",
        saySomethingLike:
          "[Sign with first name only]\\n\\nP.S. [second hook – a callback to a prior email, a link to a specific resource, a quick observation]",
        founderNote:
          "The P.S. is the most-read line in many emails. Underused; high leverage. Use it for a second hook, not a generic 'check out our blog'. Brand-name sign-offs underconvert founder-name sign-offs by 15 to 40%.",
      },
    ],
    variables: [
      { name: "[real-life moment]", note: "An actual thing that happened, not a fabricated anecdote." },
      { name: "[audience parallel]", note: "The bridge from your moment to the reader's situation." },
      { name: "[one lesson]", note: "ONE takeaway. Not a list." },
      { name: "[soft link]", note: "1 of every 5 emails. Specific product, not 'check out our stuff'." },
    ],
    commonMistakes: [
      "Treating Seinfeld emails like a newsletter. Newsletters have multiple stories per email; Seinfeld emails have one.",
      "Writing from the brand voice instead of the founder voice. Brand-voice feels corporate; founder-voice feels like the relationship the audience signed up for.",
      "Sending only when there's something to sell. Subscribers who only hear from you during launches feel sold to.",
      "Long-form Seinfeld emails. 400 to 600 words is the sweet spot. Over 800 and engagement collapses.",
      "No P.S. line. The most-read element on the page, often empty. Free conversion lever most founders ignore.",
    ],
    faqs: [
      {
        q: "How often should I send Seinfeld emails?",
        a: "3 to 4 per week. Tuesday / Thursday / Saturday is a common cadence. Less than 2 per week and reputation decays; more than 5 and unsubscribes climb. The cadence is the discipline.",
      },
      {
        q: "How is the Seinfeld pattern different from a newsletter?",
        a: "Newsletters round up multiple items; Seinfeld emails focus on one. Newsletters write from the brand; Seinfeld writes from the founder. Newsletters are content-curated; Seinfeld is story-driven.",
      },
      {
        q: "How long until the Seinfeld pattern starts converting?",
        a: "30 to 90 days. Email 1 in week 1 converts at near zero; email 30 in week 10 converts at 1 to 3% per send because the audience trusts the founder voice by then. Long game.",
      },
    ],
    relatedGlossary: ["seinfeld-email", "soap-opera-sequence", "story"],
    relatedPlaybook: "seinfeld-email",
    lastVerified: "2026-05-20",
  },
  {
    slug: "challenge-funnel",
    displayName: "5-Day Challenge funnel script",
    metaTitle: "5-Day Challenge Script (Daily Email + Live Close)",
    metaDescription:
      "Day-by-day script for a 5-day paid challenge funnel: enrollment, daily emails, daily exercises, live close session, follow-up.",
    tldr:
      "A complete day-by-day script for a 5-day paid challenge ($7 to $97 entry). Enrollment page, daily email + exercise + community check-in cadence, day-4 live close session with the core offer, day-5 follow-up sequence for non-converters. Converts 5 to 20% of completers to the core offer.",
    format: "Multi-day cohort with daily emails, daily video lessons, live close",
    targetLength: "5 days, 1 lesson + 1 exercise + 1 community check-in per day",
    whenToUse:
      "Cohort-based conversion for core offers between $97 and $1,997. Best when the core outcome can be broken into 5 daily 15–60 minute exercises and you have a Slack/Discord/Circle space for community engagement.",
    blocks: [
      {
        marker: "Day -7 to -1: Enrollment phase",
        intent: "Run the registration page + soft email sequence.",
        saySomethingLike:
          "Registration page: title 'How [audience] [outcome] in 5 days using [mechanism]'. Stack the deliverables (daily lessons + workbook + community + live close). Price $7 to $97 paid (free challenges underconvert by 5–10x). Email list gets 3 reminders in the last 72 hours.",
        founderNote:
          "Paid challenges outconvert free ones because the entry fee filters in serious participants. Even $7 is enough to create skin-in-the-game. Free challenges fill up with consumers; paid challenges fill up with action-takers.",
      },
      {
        marker: "Day 1: Foundation",
        intent: "Define the participant's specific outcome.",
        saySomethingLike:
          "Morning email: 'Welcome to Day 1. Today's exercise: [specific 15–30 min action]. Video link below. Community check-in tonight at 6pm PT.'\\nVideo (5–10 min): teach today's lesson, walk through the exercise.\\nExercise: participant defines their specific target.\\nEvening community check-in: participants share their Day 1 output.",
        founderNote:
          "Day 1 sets the cohort tone. Highest energy day; community engagement is loudest. Make the exercise easy enough that everyone completes it – completion compounds across days.",
      },
      {
        marker: "Day 2: Build",
        intent: "Participant produces the first artifact.",
        saySomethingLike:
          "Morning email + video + exercise: build the first specific artifact (a landing page draft, a customer interview script, a pricing table). Evening community check-in: share artifact, get peer feedback.",
        founderNote:
          "Day 2 is where the dropout starts. Keep the exercise tight – under 60 minutes is mandatory. Anything longer and completion rate collapses across the remaining days.",
      },
      {
        marker: "Day 3: Iterate",
        intent: "Refine the artifact based on Day 2 feedback.",
        saySomethingLike:
          "Morning email + video + exercise: refine yesterday's artifact based on what the community surfaced. Evening community check-in: share v2.",
        founderNote:
          "Day 3 is the iteration day. Participants who shipped a rough Day 2 see real improvement here, which builds belief in the framework.",
      },
      {
        marker: "Day 4: Ship + live close session",
        intent: "Final artifact ships; live close session reveals the core offer.",
        saySomethingLike:
          "Morning email + video + exercise: ship final artifact. Evening: 60–90 minute live close session.\\nLive close structure: recap the 4-day journey, walk through what's NEXT (the core offer), Stack Slide with challenge-specific bonuses, Q&A while cart is open.",
        founderNote:
          "The live close is where 80% of the challenge's revenue happens. Participants have invested 4 days of real effort and seen specific outcomes – they're now positioned to make the bigger commitment.",
      },
      {
        marker: "Day 5: Celebration + follow-up",
        intent: "Celebrate completers; start 14-day follow-up for non-converters.",
        saySomethingLike:
          "Morning email: celebration of cohort outcomes (specific named completers with permission). Cart remains open for 24 more hours. Day 5 evening: cart closes.\\nDays 6–19: 14-day Soap Opera Sequence for non-converters, re-anchoring the core offer's value.",
        founderNote:
          "Non-immediate converters often buy 7–14 days post-cohort when they realize they want to keep the momentum. The follow-up sequence captures 5 to 15% of that group. Worth 30% of total funnel revenue typically.",
      },
    ],
    variables: [
      { name: "[5-day outcome]", note: "Specific transformation participants complete in 5 days. Not 'master X' – 'ship Y'." },
      { name: "[daily exercises]", note: "5 sequential 15–60 minute exercises that compound to the outcome." },
      { name: "[core offer]", note: "What you're selling on the live close. Typically $97 to $1,997." },
      { name: "[challenge-specific bonuses]", note: "Bonuses only available to participants – creates urgency without artificial scarcity." },
    ],
    commonMistakes: [
      "Making daily exercises too long. Over 60 minutes and completion rate collapses.",
      "Free challenge with no entry fee. Converts 5–10x worse than $7+ challenges.",
      "No community space. Solo challenges feel like courses; community challenges feel like cohorts and convert 2–3x better.",
      "Skipping the live close. Recorded close converts 30–50% worse than live.",
      "Generic Stack bonuses. Challenge-specific bonuses are the urgency mechanic.",
    ],
    faqs: [
      {
        q: "Should the challenge be 5 days, 14 days, or 30 days?",
        a: "5 days for outcomes completable in one week. 14 days for outcomes needing more iteration. 30 days for habit-formation transformations. Most successful challenges are 5 or 14 days; 30-day challenges have higher dropout but build more belief in completers.",
      },
      {
        q: "How many participants do I need?",
        a: "20+ minimum for the community effect to engage. 50 to 150 is the sweet spot. Above 200 the cohort gets noisy; individual participants feel lost.",
      },
      {
        q: "Should I run it live or evergreen?",
        a: "Live for the first 3 to 5 cohorts to iterate the script with real participant reactions. Evergreen after that. Evergreen captures year-round demand; live creates higher conversion per cohort.",
      },
    ],
    relatedGlossary: ["big-domino", "soap-opera-sequence", "value-ladder"],
    relatedPlaybook: "challenge",
    lastVerified: "2026-05-20",
  },
  {
    slug: "lead-magnet-opt-in",
    displayName: "Lead magnet opt-in page script",
    metaTitle: "Lead Magnet Opt-In Script (High-Specificity Template)",
    metaDescription:
      "Under-150-word lead magnet opt-in page script. Specific cohort, finished artifact, founder credibility, two-field form.",
    tldr:
      "A complete lead magnet opt-in page script in under 150 words. Specific cohort + finished artifact in the H1, founder credibility in one line, two-field form (email + first name), what-to-expect bullet under the button. Converts 15 to 40% of qualified traffic.",
    format: "Single-page opt-in (inline or popup)",
    targetLength: "100 to 150 words",
    whenToUse:
      "Top of every content page, in exit-intent popups, and as standalone landing pages for paid traffic. The lead magnet opt-in is the lowest-friction conversion event on the site.",
    blocks: [
      {
        marker: "Block 1: Headline (1 line)",
        intent: "Name the cohort + the specific finished artifact.",
        saySomethingLike:
          "The [specific number]-[unit] [artifact type] for [specific cohort] who [specific situation].",
        founderNote:
          "Example: 'The 7-minute diagnostic for indie SaaS founders whose launch went flat.' Specific cohort + specific finished thing. Not 'grow your business'.",
      },
      {
        marker: "Block 2: Subhead (1 sentence)",
        intent: "What the reader can do once they have it.",
        saySomethingLike:
          "Use this to [specific outcome] in [specific timeframe]. No fluff, no funnel.",
        founderNote:
          "The reader needs to picture themselves using the magnet. The subhead surfaces the end-state. 'No funnel' callout is honesty signal – they're not signing up for a 30-email sequence.",
      },
      {
        marker: "Block 3: Form (2 fields)",
        intent: "Email + first name. Nothing else.",
        saySomethingLike:
          "[Email field] [First name field] [Button: 'Send me [artifact]']",
        founderNote:
          "Over 2 fields drops conversion 10–25% per additional field. Email is mandatory; first name lets later sequences personalize. Anything else is friction that doesn't pay back.",
      },
      {
        marker: "Block 4: Founder credibility (1 line under form)",
        intent: "Named founder, dated specific outcome.",
        saySomethingLike:
          "Built by [first name + last name], who [specific dated outcome with a verifiable number].",
        founderNote:
          "One specific dated number beats every generic 'expert' claim. Generic credibility under opt-in forms reads as marketing and reduces opt-in by 5–15%.",
      },
      {
        marker: "Block 5: What-to-expect (1 line)",
        intent: "Tell the reader what arrives, when.",
        saySomethingLike:
          "Arrives in your inbox within 60 seconds. Plus one short email a week from [first name]. Unsubscribe anytime.",
        founderNote:
          "Setting the cadence expectation reduces unsubscribes by 30–50%. 'One short email a week' beats 'sometimes we send you updates'. Honesty signal pays off through the entire funnel.",
      },
    ],
    variables: [
      { name: "[artifact]", note: "A finished thing. Not 'a guide' or 'a masterclass' – 'a 7-minute diagnostic'." },
      { name: "[cohort]", note: "Specific. 'Indie SaaS founders post-launch' beats 'entrepreneurs'." },
      { name: "[outcome]", note: "What the reader does with the magnet in one sitting." },
      { name: "[dated proof]", note: "Founder credibility – one number with a date." },
    ],
    commonMistakes: [
      "Vague magnet title ('grow your business' instead of 'the 5 funnel mistakes pre-revenue SaaS founders make').",
      "Magnet promises a process, not a finished thing ('a complete guide' vs 'a 1-page diagnostic').",
      "Over 2 fields on the form. Each extra field costs 10–25% conversion.",
      "Generic credibility ('trusted by founders') instead of a specific dated number.",
      "No cadence expectation. Subscribers who don't know how often you email unsubscribe at 2–3x the rate.",
    ],
    faqs: [
      {
        q: "Should I use inline opt-ins, popups, or both?",
        a: "Both. Inline inside articles converts at 1–3% reliably. Exit-intent popups add another 1–2% without cannibalizing. Don't use timed popups – they punish engaged readers.",
      },
      {
        q: "How long should my magnet be?",
        a: "Short enough to finish in one sitting. A 1-page diagnostic, a 5-minute video, a single checklist. 30-page eBooks rarely get opened.",
      },
      {
        q: "Should I require double opt-in?",
        a: "Yes, for deliverability. Double opt-in reduces list size 10–20% but improves inbox placement for the remaining list dramatically.",
      },
    ],
    relatedGlossary: ["hook", "soap-opera-sequence"],
    relatedPlaybook: "soap-opera-sequence",
    lastVerified: "2026-05-20",
  },
  {
    slug: "webinar-registration-page",
    displayName: "Webinar registration page script",
    metaTitle: "Webinar Registration Script (Brunson Title Formula)",
    metaDescription:
      "Webinar registration page script with the Brunson title formula, 'you will leave with' bullets, founder credibility, date/time, and form.",
    tldr:
      "A complete webinar registration page script. Title using the Brunson 'how [audience] [outcome] in [time] using [mechanism]' formula, three specific 'you will leave with' bullets, founder credibility, prominent date/time, two-field registration form. Converts 20 to 45% of qualified traffic.",
    format: "Single-page registration",
    targetLength: "200 to 300 words",
    whenToUse:
      "Before every webinar – live or evergreen. The registration page's conversion depends mostly on the title; everything else is supporting evidence.",
    blocks: [
      {
        marker: "Block 1: Title (H1, the load-bearing element)",
        intent: "Use Brunson's transformation-title formula.",
        saySomethingLike:
          "How [specific audience] [specific outcome] in [specific timeframe] using [specific mechanism].",
        founderNote:
          "The title is the offer at the registration step. Topic-shaped titles ('How to grow your SaaS') convert at near zero. Transformation-shaped titles ('How indie SaaS founders pin their first paying customer in 14 days using the Hook-Story-Offer framework') convert.",
      },
      {
        marker: "Block 2: Date/time + format",
        intent: "Surface when it happens prominently.",
        saySomethingLike:
          "[Day, date, time + timezone] | [Live on Zoom, 60 minutes, replay available 48 hours]",
        founderNote:
          "Date/time above the fold. If the next session isn't visible without scrolling, registration drops 20–40%. The 48-hour replay window is a Brunson Perfect Webinar standard.",
      },
      {
        marker: "Block 3: 'You will leave with' (3 specific bullets)",
        intent: "Three specific finished artifacts attendees take away.",
        saySomethingLike:
          "You will leave with:\\n• [Specific artifact 1, e.g. 'A filled-in Stack Slide template']\\n• [Specific artifact 2, e.g. 'A 14-day action plan']\\n• [Specific artifact 3, e.g. 'The 1-page diagnostic you can run on your live page tonight']",
        founderNote:
          "The reader needs to see the takeaway before they trade their time. Three specific finished artifacts beat 'discover the secrets to X'. Tangible end-state.",
      },
      {
        marker: "Block 4: Founder credibility (1 line)",
        intent: "Named founder, specific dated proof tied to the webinar topic.",
        saySomethingLike:
          "Hosted by [name], who [specific dated outcome with verifiable number, e.g. 'has run this exact sequence on 41 indie SaaS pages between January and April 2026'].",
        founderNote:
          "Specific dated proof beats credentials. The number should be verifiable – not 'helped hundreds', but 'documented 41 teardowns with dated permalinks'.",
      },
      {
        marker: "Block 5: Registration form (2 fields)",
        intent: "Email + first name. Nothing more.",
        saySomethingLike:
          "[Email field] [First name field] [Button: 'Reserve my seat']",
        founderNote:
          "Beyond 2 fields, registration drops materially. Email + first name is enough. Asking for company / role / phone early kills registration.",
      },
    ],
    variables: [
      { name: "[audience]", note: "Specific cohort. Title-level specific." },
      { name: "[outcome]", note: "Specific verifiable transformation." },
      { name: "[timeframe]", note: "Number + unit, not 'fast'." },
      { name: "[mechanism]", note: "Your branded framework name or descriptive phrase." },
      { name: "[3 artifacts]", note: "Three specific finished things attendees walk away with." },
    ],
    commonMistakes: [
      "Topic-shaped title ('How to grow your SaaS') instead of transformation-shaped.",
      "Date/time below the fold. Registration drops 20–40%.",
      "Vague 'you will discover' bullets instead of specific artifacts.",
      "Generic credentials instead of dated specific proof.",
      "More than 2 form fields. Each extra costs 10–25%.",
    ],
    faqs: [
      {
        q: "Should I offer a replay?",
        a: "Yes, with a 48-hour expiry. Replays without expiry signal that the live didn't matter and crush show-up rates on the next session. The 48-hour replay window is the Brunson standard.",
      },
      {
        q: "How long should the webinar itself be?",
        a: "60 to 90 minutes for paid offers between $97 and $997. Shorter than 60 rarely builds enough belief; longer than 90 loses attendees. Above $997 typically needs a multi-session sequence.",
      },
      {
        q: "What show-up rate should I expect?",
        a: "30 to 50% live show-up is healthy for cold-acquired registrations. 50 to 70% for warm-list registrations. Below 30% means the title over-promised; above 70% usually means the title under-promised.",
      },
    ],
    relatedGlossary: ["perfect-webinar", "hook", "story", "offer"],
    relatedPlaybook: "perfect-webinar",
    lastVerified: "2026-05-20",
  },
  {
    slug: "abandoned-cart",
    displayName: "Abandoned cart email sequence script",
    metaTitle: "Abandoned Cart Email Script (3-Email Recovery Template)",
    metaDescription:
      "Three-email abandoned cart recovery script that addresses the actual objection (belief, not discount). Recovers 8 to 15% of abandons.",
    tldr:
      "A complete 3-email abandoned cart recovery script. Email 1 (1 hour after abandon) addresses Weak Belief, Email 2 (24 hours) addresses Weak Offer, Email 3 (72 hours) is a soft last-chance with founder-reply invitation. Recovers 8 to 15% of abandons without leading with a discount.",
    format: "Three-email automated sequence",
    targetLength: "150 to 300 words per email",
    whenToUse:
      "Every checkout flow with measurable abandon rate. The sequence runs automatically when a buyer adds to cart but doesn't complete payment. Discounts as a default lever destroy long-term margin; this script leads with belief and offer instead.",
    blocks: [
      {
        marker: "Email 1 / +1 hour (Belief)",
        intent: "Address Weak Belief – the most common abandon cause.",
        saySomethingLike:
          "Subject: '[Hesitation about] [product]?' or 'A quick note about [product]'\\nBody: 'Saw you almost grabbed [product] earlier. Three quick things in case they help: [the specific guarantee terms verbatim], [the named founder + one specific dated proof], [the one-line refund mechanism]. If you have a specific question, just reply – I read every email.'",
        founderNote:
          "Email 1 hits at 1 hour because the abandon is fresh. The most common reason at this stage is Weak Belief (trust). Surface the guarantee, the founder name, the refund mechanic – not a discount.",
      },
      {
        marker: "Email 2 / +24 hours (Offer)",
        intent: "Address Weak Offer – re-anchor the Stack.",
        saySomethingLike:
          "Subject: 'What's actually in [product]'\\nBody: 'In case the offer wasn't clear: here's what's in [product]. [3-bullet Stack with anchors]. Total value $X. Your price: $Y. [Specific guarantee with trigger event]. [Buy link].'",
        founderNote:
          "Email 2 hits at 24 hours. By now the urgency has cooled; the reader needs the Stack re-presented. This is where most sequences pivot to discount – don't. Re-anchor the value first.",
      },
      {
        marker: "Email 3 / +72 hours (Last-chance + founder reply)",
        intent: "Soft last-chance with personal reply invitation.",
        saySomethingLike:
          "Subject: 'Closing the loop on [product]'\\nBody: 'This is my last email about [product]. If now isn't the right time, no hard feelings. If you wanted it but something specific is holding you back, hit reply and tell me – I'll either fix it or tell you to wait. Either way, you'll get a real answer from me.'",
        founderNote:
          "Founder-reply invitation outconverts a 10% discount in most tests. Readers who hesitate often have one specific objection that a one-line founder response can address. Costs 2 minutes; converts the highest-intent abandons.",
      },
    ],
    variables: [
      { name: "[product]", note: "The specific product in cart. Use the buyer's terminology." },
      { name: "[guarantee event]", note: "The trigger event for the refund. Verbatim from the sales page." },
      { name: "[stack]", note: "Re-list the 3-bullet stack from the sales page. Don't rewrite – consistency builds belief." },
      { name: "[founder name]", note: "Sign every email with first name only. Brand-name signatures underconvert here." },
    ],
    commonMistakes: [
      "Leading with a discount. Trains buyers to abandon on purpose; destroys long-term margin.",
      "Generic subject lines ('Did you forget something?'). Read as automated; open rates collapse.",
      "Too long. Each email under 300 words; 600+ word recovery emails read as desperate.",
      "Brand-name sign-off. Founder-name + reply-to outconverts brand-name by 15–40%.",
      "More than 3 emails. Above 3 the sequence feels like harassment; unsubscribes climb.",
    ],
    faqs: [
      {
        q: "Should I include a discount in the abandoned cart sequence?",
        a: "Not in the first 3 emails. If your default abandon recovery is a discount, you train buyers to abandon on purpose. Lead with belief (guarantee) and offer (stack re-anchor); save discounts for win-back sequences 30+ days later, if at all.",
      },
      {
        q: "How long should the sequence run?",
        a: "72 hours total, 3 emails. Beyond that, the sequence becomes a re-engagement campaign, which has different mechanics. Keep cart recovery tight.",
      },
      {
        q: "What recovery rate should I expect?",
        a: "8 to 15% of abandons is healthy for indie SaaS at $27–$497 price points. Below 5% usually means the emails read as automated; above 15% often means the original price was too low (the abandon was a price filter).",
      },
    ],
    relatedGlossary: ["offer", "stack-slide", "weak-belief"],
    relatedPlaybook: "soap-opera-sequence",
    lastVerified: "2026-05-20",
  },
];

export const SCRIPT_SLUGS: ReadonlyArray<string> = SCRIPT_ENTRIES.map((e) => e.slug);

export function getScriptBySlug(slug: string): ScriptEntry | undefined {
  return SCRIPT_ENTRIES.find((e) => e.slug === slug);
}
