/**
 * /playbook/[funnel-type] pSEO catalog – action-intent funnel guides.
 *
 * Founders searching "tripwire funnel playbook" or "perfect webinar
 * playbook" are mid-build, looking for the step-by-step structure.
 * Each entry is a structural overview of one Brunson funnel archetype,
 * anchored to the glossary and pointing into /diagnostic for the
 * personalized read.
 *
 * Brunson Hard-Rule reconciliation:
 *   - Frameworks are taught accurately. The references to Brunson's
 *     books, where applicable, are honest attributions.
 *   - The Playbook ($49 product) is mentioned but not over-pitched.
 *     These pages serve mid-build founders, not bottom-of-funnel buyers.
 *   - Each playbook ends at /diagnostic for the personalized fit check.
 */

export interface FunnelPlaybookEntry {
  /** URL slug, kebab-case. */
  slug: string;
  /** Display name of the funnel type. */
  displayName: string;
  /** SEO meta title, under 60 chars. */
  metaTitle: string;
  /** SEO meta description, under 160 chars. */
  metaDescription: string;
  /** TL;DR: what this funnel does, ~40 words. */
  tldr: string;
  /** When this funnel is the right choice. */
  whenToUse: string;
  /** When this funnel is the WRONG choice. */
  whenNotToUse: string;
  /** Sequential structural steps. */
  steps: ReadonlyArray<{
    title: string;
    description: string;
  }>;
  /** Common implementation mistakes. */
  commonMistakes: ReadonlyArray<string>;
  /** Three FAQs in AEO format. */
  faqs: ReadonlyArray<{ q: string; a: string }>;
  /** Related glossary terms. */
  relatedGlossary: ReadonlyArray<string>;
  /** Where this funnel sits in the Brunson value-ladder. */
  ladderPosition: string;
  /** ISO date last verified. */
  lastVerified: string;
}

export const FUNNEL_PLAYBOOK_ENTRIES: ReadonlyArray<FunnelPlaybookEntry> = [
  {
    slug: "tripwire",
    displayName: "Tripwire funnel",
    metaTitle: "Tripwire Funnel Playbook ($1 to $27 Entry Offer Guide)",
    metaDescription:
      "Tripwire funnels convert cold traffic to micro-buyers using a $1 to $27 entry offer. Step-by-step structure plus the common build mistakes.",
    tldr:
      "A tripwire funnel converts cold traffic to first-time buyers using a low-priced ($1 to $27) entry offer that promises one specific finished outcome. The tripwire's job isn't to make money – it's to convert prospects into customers, which doubles or triples the conversion rate on the follow-up core offer.",
    whenToUse:
      "When you have cold traffic that won't convert directly to a $49+ offer, when you want to filter out tire-kickers without losing the cohort entirely, and when your core product has a natural tripwire-shaped first step (a diagnostic, a template, a Day 1 of a system).",
    whenNotToUse:
      "When your core offer is under $49 (the tripwire eats the same buyer twice). When your audience is warm and converts directly to the core offer. When you don't have a follow-up sequence ready – a standalone tripwire without a path forward is a one-shot.",
    steps: [
      {
        title: "1. Define the one tightly-scoped outcome",
        description:
          "Pick a single specific thing the buyer can finish in one sitting. Not a course, not a library. One worksheet, one diagnostic, one template. The promise has to be small enough that the price feels honest.",
      },
      {
        title: "2. Set the price at $1 to $27",
        description:
          "$1 if the outcome is one-shot (a diagnostic, a one-page template). $7 to $27 if it's a multi-day commitment (a workbook, a 5-day mini-course). The price has to match the unit of value.",
      },
      {
        title: "3. Build the sales page (under 400 words)",
        description:
          "Hook (specific cohort, specific outcome), Story (3-sentence why-this-exists), Offer (the Stack: 'you get X, Y, Z, totaling $97 in value, for $7'). Trust signal (named founder, dated proof). Buy button with explicit 'one-time, no subscription'.",
      },
      {
        title: "4. Deliver instantly with one-click access",
        description:
          "Stripe payment success page is the access page. No login required, no 'check your email for instructions' delay. The buyer should be using the deliverable within 90 seconds of payment.",
      },
      {
        title: "5. Insert the OTO immediately after payment",
        description:
          "One-page OTO offer (under 200 words) that extends the tripwire buyer's decision. If they bought 'pin one customer for $1', the OTO is 'pin three customers for $19', not 'become a full-funnel expert for $497'.",
      },
      {
        title: "6. Run the Soap Opera Sequence for 5 to 7 days",
        description:
          "Email 1: 'Welcome, here's how to use the tripwire deliverable'. Email 2-5: Soap Opera narrative arc leading to the core offer. Email 6-7: Direct offer for the core product. The tripwire buyer is now warm.",
      },
      {
        title: "7. Add the core offer to the standard sequence",
        description:
          "After the Soap Opera ends, the tripwire buyer rolls into the Seinfeld Email pattern for ongoing engagement. The tripwire-to-core conversion happens on day 1 (OTO) plus days 5-7 (Soap Opera close).",
      },
    ],
    commonMistakes: [
      "Pricing the tripwire too high relative to the promise. A $27 'one diagnostic' tripwire usually underconverts vs a $1 version.",
      "Skipping the OTO. The OTO captures 15 to 35% of tripwire buyers and often doubles the funnel's profitability.",
      "No Soap Opera follow-up. The tripwire is acquisition; the Soap Opera is the conversion machine. Without it, you have a one-shot.",
      "Mismatched guarantee between tripwire and core. The tripwire's guarantee should be at least as generous as the core's.",
      "Hidden subscription on the tripwire (charging $1 then $19/month silently). Trust-break that survives years of brand work to undo.",
    ],
    faqs: [
      {
        q: "What's the ideal tripwire-to-core conversion rate?",
        a: "5% to 15% of tripwire buyers upgrade to the core offer within 30 days. Below 5% means the ladder is broken (no natural-next-step). Above 15% usually means the tripwire was redundant – the buyer would have bought the core directly.",
      },
      {
        q: "Should I offer multiple tripwires or just one?",
        a: "One, at first. Multiple tripwires fragment the funnel and confuse the upgrade path. After the first tripwire is profitable, add a second only if it targets a different cohort with a different upgrade path.",
      },
      {
        q: "Can I run a tripwire funnel for B2B SaaS?",
        a: "Yes. The Unlock SaaS Starter ($1) is exactly a B2B SaaS tripwire. The same structure works for B2B audit-style tripwires ($497 paid audit converting to engagement) at higher price bands.",
      },
    ],
    relatedGlossary: ["offer", "value-ladder", "soap-opera-sequence"],
    ladderPosition:
      "Rung 1 (entry). The tripwire is the bottom of the value ladder – the first commitment a prospect makes that converts them into a customer.",
    lastVerified: "2026-05-19",
  },
  {
    slug: "vsl",
    displayName: "Video sales letter (VSL) funnel",
    metaTitle: "VSL Funnel Playbook (Video Sales Letter Structure)",
    metaDescription:
      "VSL funnels convert cold traffic via an 8 to 22 minute founder-led video. Step-by-step structure: hook, story, offer, stack, close.",
    tldr:
      "A VSL funnel uses a single video (8 to 22 minutes for sub-$100 offers, 22 to 45 for $100 to $1,000) to walk a prospect from cold to bought. The structure is Hook (audience-first 30 seconds) > Story (founder's why) > Offer (Stack Slide) > Close (specific risk-reversal).",
    whenToUse:
      "When your offer is between $27 and $1,997 (sweet spot for VSL conversion), when your audience is cold and needs the founder voice to build trust, and when you can record one really good 15 to 30 minute video instead of writing 3,000 words of sales copy.",
    whenNotToUse:
      "When your offer is under $27 (use a short sales page, VSL is overkill). When your offer is over $2K (use Perfect Webinar instead). When you can't be on camera comfortably – fake-live or AI-narrated VSLs underperform real founder VSLs by 30 to 50%.",
    steps: [
      {
        title: "1. Open with the audience, not the founder (first 30 seconds)",
        description:
          "'If you've launched a SaaS, got 50 sign-ups, and 0 paying customers, this is for you.' Audience-first hook in the first 5 seconds. Founder bio comes at minute 2 to 3, after the audience has self-identified.",
      },
      {
        title: "2. Tell the founder's story (minutes 1 to 4)",
        description:
          "Why this exists. The pain you experienced, the moment you discovered the solution, the work you did to test it. Not credentials – story. Credentials prove competence; story builds trust.",
      },
      {
        title: "3. Teach the mechanism (minutes 4 to 12)",
        description:
          "What's actually changing. Not feature list – conceptual framework. 'The reason most SaaS landing pages flat-line is X, and here's the pattern I use to fix it.' Teaching builds authority and creates the why-this-works belief.",
      },
      {
        title: "4. Stack the offer (minutes 12 to 18)",
        description:
          "Six to twelve deliverables, each anchored at a small dollar number, totaled, then your price stated as a fraction of the total. 'Total value $2,997 – your price today, $97.' This is the load-bearing structural move.",
      },
      {
        title: "5. State the risk-reversal (minute 18 to 20)",
        description:
          "Specific guarantee tied to a specific event. '60-day money back if your first paying customer doesn't materialize.' Generic 'satisfaction guaranteed' converts at near zero. Specificity is the magic.",
      },
      {
        title: "6. Close with the buy decision (minute 20 to 22)",
        description:
          "Tell the viewer exactly what to do. 'Click the button below the video, enter your card, and you'll have access to Step 1 within 90 seconds.' The close is mechanical, not emotional.",
      },
      {
        title: "7. Insert the OTO immediately after payment",
        description:
          "Same OTO mechanics as the tripwire funnel: under 200 words, extends the buyer's decision, doesn't introduce a new sales argument.",
      },
    ],
    commonMistakes: [
      "Opening with founder credentials instead of audience identification. Viewers bounce in the first 15 seconds when the founder talks about themselves first.",
      "Skipping the Stack Slide. The Stack is what makes the price feel like a gift. Without it, the price is the only number on the screen.",
      "Hiding the price. Hiding price feels manipulative on a VSL and tanks completion rates. State the price at minute 17 to 18 confidently.",
      "Going under 8 minutes. Below 8 minutes is not enough time to build belief. Above 45 minutes loses cold traffic. The 8 to 22 minute band is the sweet spot.",
      "Fake-live VSLs with simulated chat. The few extra conversions cost permanent trust on the back end.",
    ],
    faqs: [
      {
        q: "How long should my VSL be?",
        a: "8 to 22 minutes for offers under $100. 22 to 45 minutes for offers $100 to $1,000. Beyond $1,000, switch to Perfect Webinar (60 to 90 minutes) – VSLs lose effectiveness at higher price points where the buyer needs more belief-building.",
      },
      {
        q: "Should I have a transcript on the page?",
        a: "Yes, below the video. Some viewers read; some watch. The transcript also helps SEO. Don't replace the video with the transcript though – the founder voice carries more belief than text alone.",
      },
      {
        q: "Should the buy button be visible during the video?",
        a: "After minute 5 to 7. Showing the button immediately invites pre-buy bounces; hiding it through minute 20 loses impatient warm buyers. Reveal the button after the founder story but before the Stack Slide.",
      },
    ],
    relatedGlossary: ["hook", "story", "offer", "stack-slide"],
    ladderPosition:
      "Rung 2 (core). VSLs typically sell the core offer in the value-ladder, sitting between the entry tripwire and the high-ticket back-end.",
    lastVerified: "2026-05-19",
  },
  {
    slug: "challenge",
    displayName: "Challenge funnel",
    metaTitle: "Challenge Funnel Playbook (5-Day to 30-Day Structure)",
    metaDescription:
      "Challenge funnels convert via a 5 to 30 day guided experience. Step-by-step structure: enrollment, daily deliverables, conversion week.",
    tldr:
      "A challenge funnel converts prospects via a 5 to 30 day guided experience where participants complete one small action per day toward a specific outcome. By the end of the challenge, participants have invested enough effort and seen enough progress that the upgrade to the core offer feels like the obvious next step.",
    whenToUse:
      "When your core offer requires participants to take action (not just consume content), when the outcome you teach can be broken into daily 15 to 60 minute exercises, and when you have a Slack or community space where participants can engage and visible momentum builds.",
    whenNotToUse:
      "When your offer is purely informational (an eBook, a template pack). When you can't commit to daily presence for the challenge window (low-energy challenges underconvert dramatically). When your audience is too small to create the social proof effect (need 20+ participants minimum).",
    steps: [
      {
        title: "1. Pick the 'one big domino' outcome",
        description:
          "A specific transformation that requires action, not consumption. 'Pin your first paying customer in 14 days' beats 'Master sales funnels in 14 days'. The Brunson 'Big Domino' principle: one specific outcome the participant can picture.",
      },
      {
        title: "2. Break the outcome into daily 15-60 minute exercises",
        description:
          "Day 1: Define your customer. Day 2: Write the offer. Day 3: Build the landing page. Each day is one specific deliverable the participant produces. The compound effect is the transformation.",
      },
      {
        title: "3. Set the enrollment price ($7 to $97)",
        description:
          "Free challenges underconvert by 5 to 10x compared to paid. $7 to $27 is the sweet spot for cold-acquired participants; $47 to $97 for warm-audience challenges. The paid commitment filters in serious participants.",
      },
      {
        title: "4. Build the daily delivery cadence (email + community)",
        description:
          "Each morning: a short video (5 to 10 minutes) explaining the day's exercise. Each evening: a community check-in where participants share their work. The cadence creates accountability and visible momentum.",
      },
      {
        title: "5. Run a live close session on day N-1 or N",
        description:
          "Day 4 of a 5-day challenge, day 13 of a 14-day, day 29 of a 30-day. The live close session reveals the core offer to participants who've now invested 5 to 30 days of effort and seen real outcomes from your teaching.",
      },
      {
        title: "6. Stack the core offer with challenge-specific bonuses",
        description:
          "'Buy the Playbook today and get the recorded challenge + private Slack access + 30 days of office hours.' The bonuses are challenge-specific so non-participants can't get them later, creating urgency without artificial scarcity.",
      },
      {
        title: "7. Follow up with non-converters for 14 days",
        description:
          "Participants who completed the challenge but didn't buy on the live close session get a 14-day Soap Opera Sequence that re-anchors the value of the core offer. Typical conversion: 5 to 15% of non-immediate-converters buy within 14 days.",
      },
    ],
    commonMistakes: [
      "Making the daily exercises too long (over 60 minutes). Participants drop out; completion rate collapses; conversion follows.",
      "Free challenge with no entry fee. Sounds inclusive; converts 5 to 10x worse than $7+ challenges. Skin in the game matters.",
      "No community space. Solo challenges feel like courses. Community challenges feel like cohorts and convert 2 to 3x better.",
      "Skipping the live close session. The live close is where the conversion happens; recorded close converts 30 to 50% worse.",
      "Stacking the offer with generic bonuses instead of challenge-specific. The challenge-specific bonuses are the urgency mechanic.",
    ],
    faqs: [
      {
        q: "Should my challenge be 5 days, 14 days, or 30 days?",
        a: "5 days for outcomes the participant can complete in one week. 14 days for outcomes requiring more iteration. 30 days for transformations needing habit-formation. Most successful challenges are 5 or 14 days; 30-day challenges have higher drop-off but build more belief in the converters.",
      },
      {
        q: "How many participants do I need for the challenge to work?",
        a: "20+ minimum, 50+ ideal. Below 20 the community effect doesn't engage; the challenge feels like a private tutoring session. Above 200 the cohort gets noisy and individual participants feel lost. 50 to 150 is the sweet spot.",
      },
      {
        q: "Should I run the challenge live or evergreen?",
        a: "Live for the first 3 to 5 cohorts to iterate the script with real audience reactions. Evergreen after that. Evergreen challenges (cohort starts every Monday) capture year-round demand; live challenges (quarterly) create higher conversion rates per cohort.",
      },
    ],
    relatedGlossary: [
      "big-domino",
      "soap-opera-sequence",
      "value-ladder",
    ],
    ladderPosition:
      "Rung 2 (core) or Rung 3 (back-end). Challenges typically sell the core offer ($97 to $497), occasionally the back-end ($997 to $2,997 high-ticket).",
    lastVerified: "2026-05-19",
  },
  {
    slug: "perfect-webinar",
    displayName: "Perfect Webinar funnel",
    metaTitle: "Perfect Webinar Funnel Playbook (Brunson Structure)",
    metaDescription:
      "The Perfect Webinar funnel converts via a 60 to 90 minute one-to-many sale. Brunson structure: epiphany bridge, three secrets, stack, close.",
    tldr:
      "The Perfect Webinar is Russell Brunson's signature one-to-many sales presentation: 60 to 90 minutes, structured around an epiphany bridge, three secrets that break false beliefs, and a stacked offer close. Converts 2 to 10% of registered attendees on offers between $497 and $2,997.",
    whenToUse:
      "When your core offer is $497 to $2,997 (the Perfect Webinar sweet spot), when you have a teachable framework you can walk through in 60 to 90 minutes, and when you can commit to running the webinar live for the first 5 to 10 cohorts to iterate the script.",
    whenNotToUse:
      "When your offer is under $497 (VSL or sales page is more efficient). When your offer is over $5K (you likely need a multi-session sequence, not one webinar). When you can't be live for the duration – pre-recorded webinars without live Q&A convert 30 to 50% worse than genuinely live versions.",
    steps: [
      {
        title: "1. Craft the Perfect Webinar title (specific transformation)",
        description:
          "'How [specific audience] [specific outcome] in [specific time] using [specific mechanism].' Example: 'How indie SaaS founders get their first paying customer in 14 days using the Hook-Story-Offer framework.' The title is the offer at the registration step.",
      },
      {
        title: "2. Open with the 'big promise' restated (minute 0 to 5)",
        description:
          "Restate the title as a promise to the audience watching. 'In the next 60 minutes, I'm going to show you exactly how I do X.' Lock in the why-they're-here.",
      },
      {
        title: "3. Tell the epiphany bridge story (minute 5 to 20)",
        description:
          "Your transformation story. Where you started, the moment of insight, the journey to where you are now. The audience identifies with the 'before' state and starts believing the 'after' state is possible for them.",
      },
      {
        title: "4. Teach the three secrets (minute 20 to 50)",
        description:
          "Three Brunson 'secrets' – each one breaks a false belief the audience holds. Secret 1: breaks the 'vehicle' belief (e.g. 'features don't matter; positioning does'). Secret 2: breaks the 'internal' belief (e.g. 'you don't need a bigger audience'). Secret 3: breaks the 'external' belief (e.g. 'you don't need ads').",
      },
      {
        title: "5. Transition to the offer (minute 50 to 55)",
        description:
          "The 'I want to give you everything I just taught, plus the complete system, in one package.' This is the bridge from teaching to selling. Done well, the audience leans in; done poorly, they bounce.",
      },
      {
        title: "6. Stack the offer (minute 55 to 75)",
        description:
          "Walk through six to twelve deliverables, each on its own slide, each anchored at a small dollar number. Total the stack ('that's $9,997 in value') then state your price as a fraction ('your investment today, $1,997'). The Stack Slide is the load-bearing close mechanic.",
      },
      {
        title: "7. Close with risk-reversal and urgency (minute 75 to 90)",
        description:
          "Specific guarantee tied to a specific event. 'If you do the work and don't see X by day 60, full refund.' Genuine urgency (live cart closes in 72 hours, or the price goes up Sunday at midnight). Q&A while the cart is open captures fence-sitters.",
      },
    ],
    commonMistakes: [
      "Vague title that promises a topic instead of a transformation. 'How to grow your SaaS' converts at zero; 'How indie SaaS founders get their first paying customer in 14 days' converts.",
      "Skipping the epiphany bridge. Without your transformation story, the audience has no reason to believe yours can be theirs.",
      "Teaching too much in the secrets section. Each secret should break ONE belief, not teach the entire framework. The teaching happens after they buy.",
      "Weak Stack Slide. Listing the same product across multiple bullet points doesn't stack; it pads. Six to twelve genuinely-distinct deliverables, each anchored.",
      "Fake urgency. 'This price disappears tonight' that resets weekly trains audiences to ignore urgency permanently. Real urgency only.",
    ],
    faqs: [
      {
        q: "Should I run my Perfect Webinar live or evergreen?",
        a: "Live for the first 5 to 10 sessions. Evergreen after. The live runs let you iterate the script based on real audience reactions, drop-off points, and Q&A patterns. A polished evergreen Perfect Webinar can convert as well as live, but only after the script has been refined.",
      },
      {
        q: "How many people do I need to register?",
        a: "200+ registrations for a viable live session. 50 show-up rate × 5% buy rate = 5 buyers at $1,997 = $9,985 in revenue. Below 200 registrations the math gets thin. Most founders aim for 500 to 2,000 registrations per session.",
      },
      {
        q: "Should I open and close the cart at specific times?",
        a: "Yes. Cart-open / cart-close creates real urgency. The Brunson PLF (Product Launch Formula) pattern runs a 5 to 7 day open cart with the Perfect Webinar in the middle. Always-open carts convert worse than time-bound launches by 30 to 60%.",
      },
    ],
    relatedGlossary: ["perfect-webinar", "hook", "story", "offer", "stack-slide"],
    ladderPosition:
      "Rung 3 (back-end). The Perfect Webinar typically sells the highest-priced core offer or the back-end mastermind, sitting at $497 to $2,997.",
    lastVerified: "2026-05-19",
  },
  {
    slug: "soap-opera-sequence",
    displayName: "Soap Opera Sequence",
    metaTitle: "Soap Opera Sequence Playbook (5-Email Brunson Pattern)",
    metaDescription:
      "The Soap Opera Sequence is a 5-email Brunson pattern that converts new subscribers via a narrative arc: backstory, wall, epiphany, hidden benefits, urgency.",
    tldr:
      "The Soap Opera Sequence is Russell Brunson's 5-email narrative welcome series. Each email continues a story arc that hooks the reader into opening the next: backstory > wall > epiphany > hidden benefits > urgency. Converts 2 to 8% of new subscribers to first purchase.",
    whenToUse:
      "When a new subscriber joins your list and you need to convert them to a first purchase within 5 to 7 days. When you have an actual founder story worth telling (most founders do; most underestimate it). When your audience prefers reading to watching.",
    whenNotToUse:
      "When your audience expects transactional emails only (e.g. utility-tool subscribers). When you don't have a clear core offer to convert toward. When you can't write 5 emails in the founder's voice authentically.",
    steps: [
      {
        title: "Email 1: Backstory (sent immediately after opt-in)",
        description:
          "Subject: short, curiosity-driven. Open with the moment you became 'the person' who could help them. Tell the origin story – before the transformation, during the discovery, after the change. End with a cliffhanger: 'tomorrow, I'll tell you about the wall I hit and how I broke through.'",
      },
      {
        title: "Email 2: Wall (sent 24 hours after Email 1)",
        description:
          "The crisis moment. The thing that almost stopped the journey. Specific enough that it's clearly a real story, not a marketing trope. End with: 'tomorrow, I'll tell you what changed everything.'",
      },
      {
        title: "Email 3: Epiphany (sent 24 hours after Email 2)",
        description:
          "The breakthrough. The moment of insight that turned the wall into a stepping stone. This is where you introduce the framework or insight your product is built around. End with: 'tomorrow, I'll show you how this changed my life beyond the obvious.'",
      },
      {
        title: "Email 4: Hidden benefits (sent 24 hours after Email 3)",
        description:
          "The unexpected ways the epiphany kept paying off. Side benefits the reader wouldn't have thought of. Build belief in the framework. End with: 'tomorrow, I'm going to make you an offer you can take or leave.'",
      },
      {
        title: "Email 5: Urgency (sent 24 hours after Email 4)",
        description:
          "Direct offer. The core product, the stack, the risk-reversal, the buy link. Some specific reason to act now (cohort closing, price changing, bonus disappearing). Tell them this is the last email in the series and they know what to do.",
      },
      {
        title: "Email 6+: Roll into Seinfeld Email pattern",
        description:
          "After the Soap Opera ends, the subscriber rolls into the ongoing Seinfeld Email pattern: 3 to 4 emails per week, 80% personality / 20% offer, in the founder's voice. The Soap Opera converts the early-window; the Seinfeld pattern converts the rest over months.",
      },
    ],
    commonMistakes: [
      "Treating the Soap Opera as a 5-email autoresponder of value content. The narrative arc is the whole point – without it, it's just a newsletter.",
      "Inventing a backstory that's clearly marketing. Readers can tell. Use the real story; if the real story is small, tell it small with specificity.",
      "Skipping the cliffhangers. Each email ends with a reason to open the next. Without cliffhangers, open rates drop 40 to 60% from email 1 to email 5.",
      "Pitching too soon. Emails 1 to 4 are story; email 5 is sale. Pitching in email 1 telegraphs 'this is marketing' and tanks the whole sequence.",
      "Reusing the same Soap Opera across products. Each product/funnel needs its own narrative – the story has to match the offer.",
    ],
    faqs: [
      {
        q: "Should the Soap Opera be 5 emails or longer?",
        a: "5 is the Brunson default and works for most indie SaaS. 7 emails works for high-ticket offers where more belief-building is required. Beyond 7 emails the narrative loses momentum and open rates collapse.",
      },
      {
        q: "Can I run a Soap Opera Sequence for trial users instead of subscribers?",
        a: "Yes, modified. Replace 'opt-in' with 'trial start'. The 5-email arc still works: backstory, wall, epiphany, hidden benefits, urgency-to-upgrade. Convert trial users at 8 to 25% with this pattern.",
      },
      {
        q: "What's the right sending cadence – daily or every other day?",
        a: "Daily for cold-acquired subscribers in the first 7 days. The Brunson pattern is intentionally aggressive – the reader is most engaged in the first 72 hours after opting in. Slower cadences (every other day) reduce open rates and lose momentum.",
      },
    ],
    relatedGlossary: [
      "soap-opera-sequence",
      "story",
      "seinfeld-email",
    ],
    ladderPosition:
      "Email-layer infrastructure. The Soap Opera Sequence converts subscribers across ladder rungs – tripwire, core, and back-end – depending on which offer the urgency email pitches.",
    lastVerified: "2026-05-19",
  },
  {
    slug: "oto",
    displayName: "One-time offer (OTO) funnel",
    metaTitle: "OTO Funnel Playbook (One-Time Offer Upsell Structure)",
    metaDescription:
      "OTO funnels capture 15 to 35% of front-end buyers via a single upsell shown immediately after payment. Structure: extend the decision, don't restart it.",
    tldr:
      "An OTO (One-Time Offer) is a single upsell shown immediately after a front-end purchase. Done right, it captures 15 to 35% of buyers and often doubles or triples the funnel's profitability. The key: the OTO extends the buyer's just-made decision, not introduce a new one.",
    whenToUse:
      "On every front-end funnel (tripwire, VSL, sales page, Perfect Webinar). The OTO is funnel infrastructure, not a separate strategy. If you have any paid offer with a checkout, you should have at least one OTO step.",
    whenNotToUse:
      "If you don't have an offer that extends the front-end naturally. Forcing an unrelated OTO converts at near zero and damages trust. Better to have no OTO than a mismatched one.",
    steps: [
      {
        title: "1. Identify the natural-next-step",
        description:
          "What does the buyer naturally need or want right after the front-end purchase? If they bought 'pin one customer', the natural next is 'pin three customers'. If they bought 'a diagnostic', the natural next is 'the diagnostic + the rewrite'.",
      },
      {
        title: "2. Set the OTO price at 2x to 5x the front-end",
        description:
          "$1 tripwire → $19 OTO. $97 core → $297 OTO. $497 core → $1,497 OTO. The 2x to 5x range is the buyer's psychological tolerance for an immediate uplevel. Beyond 5x feels like a frame-break.",
      },
      {
        title: "3. Build a 1-page OTO offer (under 200 words)",
        description:
          "Headline: the natural-next-step outcome. Body: 3-bullet Stack with small dollar anchors. Price: stated clearly with comparison to the just-paid front-end. Buttons: 'Yes, add this' and 'No thanks'. Both buttons clearly visible.",
      },
      {
        title: "4. Display immediately after front-end payment success",
        description:
          "Within 2 seconds of Stripe success. No 'check your email first' detour. The buyer's momentum is highest in the first 30 seconds after payment; the OTO must intercept that momentum.",
      },
      {
        title: "5. One-click add (no re-entering payment info)",
        description:
          "Stripe Setup Intent or saved card lets the buyer add the OTO with a single click. Re-entering card details kills OTO conversion by 40 to 70%. This is technical infrastructure that pays for itself.",
      },
      {
        title: "6. Mirror the front-end's risk-reversal exactly",
        description:
          "If the front-end has a 60-day guarantee, the OTO has at minimum a 60-day guarantee. Any asymmetry (front-end refundable, OTO not) reads as a trap and tanks conversion.",
      },
      {
        title: "7. Optional: second OTO if first is taken",
        description:
          "Some funnels run two OTO steps. Take rate on the second OTO is 5 to 20% of buyers who took the first. Beyond two OTOs, take rates collapse and the funnel feels like a hard sell.",
      },
    ],
    commonMistakes: [
      "OTO is a different cohort's offer. Buyer just paid $1 for a starter; OTO is a $497 mastermind. Frame break; near-zero conversion.",
      "OTO has more friction than front-end. Re-entering card details, asking for additional info, popup confirmations. Each friction layer costs 10 to 30% of OTO conversion.",
      "OTO is the same product re-priced. Buyer paid $1 for X; OTO is $19 for X + 'unlock the full version'. Feels like a bait-and-switch on the original purchase.",
      "Multiple OTOs without clear hierarchy. Three OTO steps with confusing relationships between them. Buyer gives up and exits.",
      "No 'no thanks' option, or hidden 'no thanks' button. Adversarial UX that survives short-term but kills long-term trust.",
    ],
    faqs: [
      {
        q: "Should I show the OTO on a separate page or in the checkout?",
        a: "Separate page after payment success. In-checkout OTOs (Stripe's order-bump feature) work for low-priced add-ons ($7 to $19 bumps to a $97 core) but underperform separate-page OTOs for higher-priced offers.",
      },
      {
        q: "How long should the OTO be visible?",
        a: "Permanent. The phrase 'one-time offer' refers to the offer being a one-time decision in the buyer's path, not a time-limited offer. Fake countdowns that pretend the offer expires are trust-breaks.",
      },
      {
        q: "Can I run an OTO funnel for B2B SaaS?",
        a: "Yes. After Stripe checkout, show a 1-page OTO: 'Add annual plan for 20% off' or 'Add 3 extra seats for $X'. Take rates of 15 to 30% are common for B2B SaaS OTO mechanics.",
      },
    ],
    relatedGlossary: ["offer", "stack-slide", "value-ladder"],
    ladderPosition:
      "Immediate adjacency to any ladder rung. The OTO sits one step above whatever the buyer just purchased – tripwire → OTO, core → OTO, back-end → OTO.",
    lastVerified: "2026-05-19",
  },
  {
    slug: "seinfeld-email",
    displayName: "Seinfeld Email pattern",
    metaTitle: "Seinfeld Email Pattern Playbook (Ongoing Engagement Brunson)",
    metaDescription:
      "The Seinfeld Email pattern converts long-term list engagement via founder-voice daily/weekly emails. Brunson structure: 80% personality, 20% offer.",
    tldr:
      "The Seinfeld Email pattern is Russell Brunson's ongoing list engagement strategy – named after the show 'about nothing' that was actually about its characters. Send 3 to 4 emails per week in the founder's voice: 80% personality and stories, 20% direct offer. Converts the long tail.",
    whenToUse:
      "Always, after a subscriber finishes the Soap Opera Sequence. The Seinfeld pattern is the steady-state of email marketing for indie SaaS. Most revenue from email comes from the Seinfeld pattern, not the Soap Opera.",
    whenNotToUse:
      "Never (every list needs it). The mistakes are about implementation, not whether to use it. If your audience can't tolerate 3 emails per week, you have a different problem (deliverability, sender name, list quality), not a 'too much email' problem.",
    steps: [
      {
        title: "1. Pick your founder voice (and stick to it)",
        description:
          "First-person, conversational, specific. Use the words you'd use over coffee with one specific reader. The Brunson pattern is not journalistic – it's personal. Sign with your first name, not your brand.",
      },
      {
        title: "2. Send 3 to 4 emails per week",
        description:
          "Tuesday, Thursday, Saturday is a common cadence. Two-per-week is acceptable but lower-engagement. Daily is too much for most lists. The cadence is the discipline; missing weeks damages reputation more than the content matters.",
      },
      {
        title: "3. Open with a hook from real life",
        description:
          "A thing that happened. A conversation. An observation. A frustration. Specific and concrete. 'I was at the coffee shop yesterday and overheard...' beats 'Today I want to talk about productivity.'",
      },
      {
        title: "4. Connect the hook to the audience's situation",
        description:
          "The transition from your real-life observation to a lesson for your audience. This is the bridge – done well, the reader thinks 'yes, that's exactly my situation'. Done poorly, it reads like manipulation.",
      },
      {
        title: "5. Land on a clear lesson or insight",
        description:
          "One specific takeaway. Not a list, not a framework. The Seinfeld email is about one moment, one lesson. Save the frameworks for the product.",
      },
      {
        title: "6. Soft-link to relevant offer (20% of the time)",
        description:
          "'If this resonates, you'd probably get something from [specific product link].' Not every email needs an offer. The 20% rule keeps the audience trusting the next email is mostly value, not pitch.",
      },
      {
        title: "7. P.S. line (most-read element)",
        description:
          "The P.S. is the most-read line in many emails. Use it for a second hook, a link to a specific resource, or a callback to a prior email. Underused; high leverage.",
      },
    ],
    commonMistakes: [
      "Treating the Seinfeld pattern like a newsletter. Newsletters have multiple stories per email; Seinfeld emails have one. The 'about nothing' framing is intentional.",
      "Writing from the brand voice instead of the founder voice. Brand-voice emails feel corporate; founder-voice emails feel like the relationship the audience signed up for.",
      "Sending only when there's something to sell. The 20% offer rule means 80% of sends are personality-first. Subscribers who only hear from you during launches feel sold to.",
      "Long-form Seinfeld emails. 400 to 600 words is the sweet spot. Over 800 words and engagement collapses. Save the long-form for blog posts or essays.",
      "No P.S. line. The most-read element on the page, often empty. This is a free conversion lever most founders ignore.",
    ],
    faqs: [
      {
        q: "How is the Seinfeld pattern different from a newsletter?",
        a: "Newsletters round up multiple items per email; Seinfeld emails focus on one. Newsletters write from the brand; Seinfeld emails write from the founder. Newsletters are content-curated; Seinfeld emails are story-driven. Both have a place; they're different formats.",
      },
      {
        q: "Should every Seinfeld email link to a product?",
        a: "No. The 20% rule. Four out of five emails are personality and lesson only. The fifth has a soft link. The discipline of the 80% builds the trust that makes the 20% convert.",
      },
      {
        q: "How long do I need to run the Seinfeld pattern before it converts?",
        a: "30 to 90 days for the pattern to compound. Email 1 in week 1 converts at near zero; email 30 in week 10 converts at 1 to 3% per send because the audience trusts the founder voice by then. Long game.",
      },
    ],
    relatedGlossary: ["seinfeld-email", "soap-opera-sequence", "story"],
    ladderPosition:
      "Email-layer infrastructure. The Seinfeld pattern converts subscribers across the value-ladder over time – the same email might pitch tripwire, core, or back-end depending on the audience cohort.",
    lastVerified: "2026-05-19",
  },
  {
    slug: "value-ladder",
    displayName: "Value ladder funnel",
    metaTitle: "Value Ladder Playbook (Brunson Ladder Funnel Structure)",
    metaDescription:
      "The Value Ladder organizes your offers from low-ticket entry to high-ticket back-end. Brunson structure: rung-by-rung walkthrough plus common mistakes.",
    tldr:
      "The Value Ladder is Russell Brunson's organizing principle for SaaS or info-product offerings: stack offers from a low-priced entry (the bait) up to a high-priced back-end (the buyer's eventual destination). Each rung naturally leads to the next. The economics work because customer acquisition cost amortizes across all rungs, not just the entry.",
    whenToUse:
      "When you have, or could have, more than one offer. When your customers naturally want different levels of help (some want a template, some want a service). When you want to compound a single customer relationship across years instead of one-shotting them at the entry.",
    whenNotToUse:
      "When you only have one offer and shouldn't (e.g. you're an indie SaaS with one subscription tier and that tier is the entire business). For single-product SaaS, the value-ladder pattern still applies but at a smaller scale (free / paid / annual / enterprise).",
    steps: [
      {
        title: "1. Define the destination (rung N)",
        description:
          "Where does the customer naturally end up? For most indie SaaS: a high-ticket consulting engagement, a mastermind, an in-person event, or a done-with-you service. The destination is the back-end – the rung that pays for everything else.",
      },
      {
        title: "2. Define the entry (rung 1)",
        description:
          "The lowest-friction first commitment. Often a tripwire ($1 to $27) or a free diagnostic. The entry's job is conversion to customer, not revenue. Most ladders begin at the bottom and the top simultaneously, with middle rungs added later.",
      },
      {
        title: "3. Build the middle rungs (rungs 2 to N-1)",
        description:
          "What naturally fits between entry and destination? A core subscription ($49 to $99/month), a one-shot course ($297 to $997), a coaching program ($1,997 to $7,997). Each rung is a logical upgrade from the previous.",
      },
      {
        title: "4. Connect rungs with natural-next-step bridges",
        description:
          "Each rung naturally leads to the next. The tripwire's OTO upgrades to the core. The core's email sequence promotes the coaching. The coaching's results-call promotes the mastermind. Without bridges, the ladder is just a price list.",
      },
      {
        title: "5. Set the price ratios (3x to 10x between rungs)",
        description:
          "The price between rungs typically jumps 3x to 10x. $1 → $49 (49x – too steep for many). $49 → $497 (10x). $497 → $4,997 (10x). Smaller jumps (2x to 3x) work but produce fewer ladder rungs. Larger jumps (>10x) need correspondingly bigger trust-building.",
      },
      {
        title: "6. Identify the bait-and-hook for each rung",
        description:
          "What attracts buyers TO each rung specifically? The tripwire's bait is curiosity + low cost. The core's bait is the OTO + first month results. The back-end's bait is exclusivity + accountability. Each rung needs a hook the prior rung's buyers care about.",
      },
      {
        title: "7. Map the customer journey across years",
        description:
          "A customer enters at the tripwire in month 1, upgrades to core in month 2, joins the cohort in month 8, and becomes a mastermind member in year 2. The ladder compounds across years. Most businesses lose track of customers between rungs; mapping the journey closes that gap.",
      },
    ],
    commonMistakes: [
      "Building only one rung. A single offer with no upgrade path leaves 5 to 10x revenue on the table per customer.",
      "Building rungs that don't naturally connect. Tripwire 'free template' and core 'group coaching' have no logical bridge. The buyer's journey breaks at the gap.",
      "Skipping the back-end rung. Most indie founders cap their ladder at the core subscription. The back-end (consulting, mastermind, services) is often 5 to 50x the core's revenue per customer.",
      "Wrong-direction sales. Selling the back-end first to cold traffic and using the entry as a downsell. The Brunson pattern is the other way: entry first, back-end as the eventual destination.",
      "No customer-journey tracking. Without knowing which customers are on which rung, you can't promote the right upgrade at the right time.",
    ],
    faqs: [
      {
        q: "How many rungs should a value ladder have?",
        a: "3 to 5 for most indie SaaS. Below 3 and the ladder is too thin; above 5 and the rungs overlap. Common patterns: tripwire / core subscription / annual / consulting (4 rungs) or free / paid / annual / enterprise (4 rungs).",
      },
      {
        q: "Can I build a value ladder for a single-product SaaS?",
        a: "Yes, at a smaller scale. The single-product ladder: free trial (rung 0) → monthly subscription (rung 1) → annual subscription (rung 2) → multi-seat plan (rung 3) → enterprise/custom (rung 4). Each tier has different bait, different hook, different conversion mechanics.",
      },
      {
        q: "Should I build the entire ladder before launching?",
        a: "No. Build the entry and the back-end (or core) first. Use early customer feedback to determine the middle rungs. Most successful ladders evolve over 12 to 24 months based on what customers actually upgrade to.",
      },
    ],
    relatedGlossary: ["value-ladder", "offer", "stack-slide"],
    ladderPosition:
      "Meta-pattern (organizes all other rungs). The Value Ladder isn't itself a rung – it's the framework that organizes the tripwire, core, back-end, and beyond.",
    lastVerified: "2026-05-19",
  },
];

export const FUNNEL_PLAYBOOK_SLUGS = FUNNEL_PLAYBOOK_ENTRIES.map((e) => e.slug);

export function getFunnelPlaybookBySlug(
  slug: string,
): FunnelPlaybookEntry | undefined {
  return FUNNEL_PLAYBOOK_ENTRIES.find((e) => e.slug === slug);
}
