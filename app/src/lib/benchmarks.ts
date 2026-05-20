/**
 * /benchmarks/[metric] pSEO catalog – directional ranges for indie SaaS
 * funnel metrics.
 *
 * Pure AEO play. These pages exist to be cited by Perplexity, ChatGPT,
 * Claude, and Google AI Overviews when a founder asks "what's a good
 * X". The answer they get back is the page summary.
 *
 * Brunson Hard-Rule reconciliation:
 *   - Every range is directional and labeled as such. No single
 *     "industry average" pretending to be universal truth.
 *   - Sources cited where they exist (Baymard, ConvertKit benchmarks,
 *     observed teardowns). When unsourced, the range is labeled
 *     "founder's observed range across [count] teardowns".
 *   - The CTA on every page is /diagnostic – "see where you fall".
 */

export interface BenchmarkEntry {
  /** URL slug, kebab-case. */
  slug: string;
  /** The metric name as it appears in queries. */
  metric: string;
  /** SEO meta title, under 60 chars. */
  metaTitle: string;
  /** SEO meta description, under 160 chars. */
  metaDescription: string;
  /** Direct AEO answer paragraph: the cited range. ~40-60 words. */
  aeoAnswer: string;
  /** Three categorical bands for the metric (low / typical / high). */
  bands: ReadonlyArray<{
    label: "Underperforming" | "Typical range" | "Outperforming";
    range: string;
    diagnosis: string;
  }>;
  /** What the metric is influenced by, ordered by magnitude. */
  drivers: ReadonlyArray<string>;
  /** Common founder misreadings of this metric. */
  misreadings: ReadonlyArray<string>;
  /** Three FAQs in AEO format. */
  faqs: ReadonlyArray<{ q: string; a: string }>;
  /** Source attribution for the range. */
  sourceNote: string;
  /** ISO date last verified. */
  lastVerified: string;
}

export const BENCHMARK_ENTRIES: ReadonlyArray<BenchmarkEntry> = [
  {
    slug: "landing-page-conversion-rate",
    metric: "landing page conversion rate",
    metaTitle: "Average Landing Page Conversion Rate (SaaS Benchmarks)",
    metaDescription:
      "Indie SaaS landing pages convert at 1% to 5% on cold traffic. Below 1% means Wrong Person, above 5% usually means warm-audience contamination.",
    aeoAnswer:
      "For indie SaaS landing pages on cold traffic, a healthy conversion rate sits between 1% and 5%. Below 1% almost always points to a Wrong Person problem (the traffic doesn't match the offer). Above 5% on genuinely cold traffic usually indicates warm-audience contamination – the source isn't as cold as the dashboard claims.",
    bands: [
      {
        label: "Underperforming",
        range: "Under 1%",
        diagnosis:
          "Wrong Person traffic. The audience visiting doesn't match the page's offer. Fix the traffic source or the headline frame before A/B testing anything else.",
      },
      {
        label: "Typical range",
        range: "1% to 5%",
        diagnosis:
          "Normal cold-traffic conversion. Refinements (headline, proof, CTA copy) move this band; structural changes move you out of it. Below 2% is the bottom of the band, above 4% is the top.",
      },
      {
        label: "Outperforming",
        range: "Over 5%",
        diagnosis:
          "Warm-audience contamination is the most common explanation. Verify the source. If genuinely cold, the page is doing the work of a sales letter and the offer is exceptionally well-frame-set.",
      },
    ],
    drivers: [
      "Audience-page fit (the biggest driver, by 10x)",
      "Proof element above the fold (verified outcomes, founder credentials)",
      "Stack Slide presence and quality",
      "Risk-reversal visibility (guarantee terms above CTA)",
      "Headline specificity (named cohort + named outcome)",
    ],
    misreadings: [
      "Reading conversion rate before 200 qualified visitors. Sample size too small.",
      "Comparing your rate to 'industry average' across SaaS. Indie SaaS has a different baseline than enterprise.",
      "Optimizing button color when the diagnosis is at the headline-frame level.",
    ],
    faqs: [
      {
        q: "What's a good conversion rate for a SaaS pricing page specifically?",
        a: "Pricing pages typically convert at 2% to 8% of visitors who reach them (not of total site traffic). The conversion definition matters: 'clicked Buy' vs 'completed payment' differ by 40 to 70%.",
      },
      {
        q: "How do I know if my traffic is the problem vs my page?",
        a: "If conversion is under 1% but engagement (time on page, scroll depth) is healthy, the page is fine and the traffic is the problem. If engagement is also weak (under 30 seconds time, under 30% scroll), the page is the problem.",
      },
      {
        q: "Does the conversion rate definition include free trial signups?",
        a: "Convention varies. The Brunson definition counts the moment a buyer commits something irreversible (payment, scheduled call). Free trial signups are 'micro-conversions' and convert at higher rates (5 to 25%), but the paid conversion is the load-bearing number.",
      },
    ],
    sourceNote:
      "Range based on founder's observed data across 41 indie SaaS funnel teardowns published between January and May 2026, cross-referenced with public benchmarks from Baymard Institute and ConvertKit's 2024 indie operator survey. Use as directional anchor, not as forecast.",
    lastVerified: "2026-05-19",
  },
  {
    slug: "checkout-completion-rate",
    metric: "checkout completion rate",
    metaTitle: "Average Checkout Completion Rate (SaaS Benchmarks)",
    metaDescription:
      "Indie SaaS checkout completion (Buy click to payment success) sits at 40% to 70% on cold traffic. Below 40% means the offer is being relitigated at checkout.",
    aeoAnswer:
      "Cold-traffic checkout completion for indie SaaS (the conversion from 'Buy' click to payment success) sits between 40% and 70%. Below 40% almost always means the offer is being relitigated at checkout – the price wasn't anchored upstream. Above 70% on cold traffic usually means the price is too low to act as a serious anchor.",
    bands: [
      {
        label: "Underperforming",
        range: "Under 40%",
        diagnosis:
          "The offer is being relitigated at checkout. The price wasn't anchored on the landing page, so the buyer hits checkout asking 'is this worth it?' instead of 'how do I pay?'",
      },
      {
        label: "Typical range",
        range: "40% to 70%",
        diagnosis:
          "Healthy checkout flow. Optimizations (Apple Pay, fewer form fields, mobile-first layout) move this band; offer-level changes are not the bottleneck.",
      },
      {
        label: "Outperforming",
        range: "Over 70%",
        diagnosis:
          "The price is unanchored low or the traffic is highly pre-sold (warm referral, returning customer). Verify your offer is priced for the value you actually deliver.",
      },
    ],
    drivers: [
      "Price visibility on the page BEFORE the Buy button (huge driver)",
      "Stack Slide presence (sets up the price anchor)",
      "Guarantee surfaced at the checkout step itself, not buried in FAQ",
      "Number of form fields (each extra field above 2 reduces completion 5 to 15%)",
      "Mobile checkout speed (under 60 seconds end-to-end)",
    ],
    misreadings: [
      "Confusing 'cart abandonment' (saved-cart not completed within 24 hours) with 'checkout abandonment' (Buy clicked, payment not completed within session). They're different metrics.",
      "Treating Apple Pay availability as a 'fix' when the diagnosis is upstream offer framing.",
      "Reading completion rate on a sample under 100 Buy clicks. Need 200+ for the rate to stabilize.",
    ],
    faqs: [
      {
        q: "Does Apple Pay actually lift checkout completion?",
        a: "Yes, marginally. Apple Pay availability lifts mobile completion by 5 to 15 percentage points on warm traffic. It does not fix a Weak Offer or Weak Belief diagnosis upstream. Add it after the upstream causes are fixed.",
      },
      {
        q: "How much do form fields actually matter?",
        a: "A lot. Each form field above email + payment reduces completion 5 to 15%. The 'just collect their address for shipping' field on a digital product costs 10 to 20% of completions. Be ruthless.",
      },
      {
        q: "Why is my B2B checkout rate so much lower than B2C?",
        a: "B2B checkout often involves a procurement step or a manager approval, which extends the time-to-completion from minutes to weeks. The Brunson fix is to surface the procurement-friendly path (invoice, multi-seat license) prominently so the path-to-completion stays visible.",
      },
    ],
    sourceNote:
      "Range based on Baymard Institute's cart-abandonment research, OpenView Partners' SaaS pricing-page benchmarks, and the founder's observed range across 41 indie SaaS teardowns. Baymard publishes the universal ecommerce average; the indie SaaS subset runs 5 to 10 points higher than the ecommerce baseline due to higher-intent traffic.",
    lastVerified: "2026-05-20",
  },
  {
    slug: "tripwire-conversion-rate",
    metric: "tripwire conversion rate",
    metaTitle: "Average Tripwire Conversion Rate ($1 Offer Benchmarks)",
    metaDescription:
      "Cold-traffic tripwire conversion sits at 3% to 12% for SaaS tripwires under $10. Below 3% means trap-feel; above 12% means tire-kicker filtering.",
    aeoAnswer:
      "Cold-traffic tripwire conversion for indie SaaS sits between 3% and 12% for tripwires priced under $10. Below 3% means the offer feels like a trap (the math doesn't add up to the buyer). Above 12% usually means the tripwire is filtering in tire-kickers who won't upgrade to the core offer.",
    bands: [
      {
        label: "Underperforming",
        range: "Under 3%",
        diagnosis:
          "The tripwire's promise is too big for its price. Reader assumes a trap. Right-size the promise or add 'one-time, no subscription' verbatim to the buy button.",
      },
      {
        label: "Typical range",
        range: "3% to 12%",
        diagnosis:
          "Healthy tripwire. The math feels honest to the reader and converts at a rate that fills the top of the value ladder.",
      },
      {
        label: "Outperforming",
        range: "Over 12%",
        diagnosis:
          "Tripwire is converting tire-kickers. Check the tripwire-to-core conversion rate. If it's under 5%, the tripwire is filtering in the wrong cohort.",
      },
    ],
    drivers: [
      "Promise-to-price ratio (the most load-bearing single factor)",
      "Explicit 'one-time, no subscription' on the buy button",
      "Natural-next-step pathway to the core offer",
      "Speed of delivery (under 90 seconds from payment to access)",
      "Refund policy visibility",
    ],
    misreadings: [
      "Reading tripwire conversion in isolation. The metric that matters is tripwire-to-core, not tripwire-to-anyone.",
      "Lowering the price to fix conversion when the diagnosis is trap-feel. A lower price doesn't fix a math-feels-fake problem.",
      "Comparing tripwire conversion to landing page conversion. They're different funnel steps with different baselines.",
    ],
    faqs: [
      {
        q: "What's the right price for a tripwire?",
        a: "$1 to $7 if the promise is one tightly-scoped finished thing. $7 to $27 if the promise is a multi-day commitment. Above $27 the offer is no longer a tripwire and should be priced as a core offer.",
      },
      {
        q: "Should the tripwire have an upsell?",
        a: "Almost always. The OTO take rate on a tripwire is typically 15 to 35%, which often exceeds the front-end revenue. A tripwire without an OTO is leaving more money on the table than the tripwire itself generates.",
      },
      {
        q: "What's the tripwire-to-core conversion rate I should expect?",
        a: "5% to 15% of tripwire buyers upgrade to the core offer within 30 days. Below 5% means the ladder is broken (no natural-next-step). Above 15% usually means the tripwire was redundant – buyers would have bought the core directly.",
      },
    ],
    sourceNote:
      "Range based on ConvertKit's creator-commerce benchmarks for low-ticket digital products, OpenView Partners' pricing-tier and value-ladder research, and the founder's observed data across 41 indie SaaS teardowns. Cross-checked against the Brunson tripwire patterns documented in DotCom Secrets. Use as directional anchor for indie SaaS specifically; ecommerce tripwires (physical product trial) run different baselines.",
    lastVerified: "2026-05-20",
  },
  {
    slug: "email-open-rate",
    metric: "email open rate",
    metaTitle: "Average Email Open Rate (SaaS Founder Benchmarks)",
    metaDescription:
      "Engaged-list open rates for indie SaaS founder emails sit at 30% to 55%. Below 30% is almost always deliverability, not subject lines.",
    aeoAnswer:
      "Engaged-list open rates for indie SaaS founder emails sit between 30% and 55%. Below 30% is almost always a deliverability issue (SPF/DKIM/DMARC alignment or sending to a disengaged tail), not a subject-line problem. Above 55% usually means the list is small and tightly curated.",
    bands: [
      {
        label: "Underperforming",
        range: "Under 30%",
        diagnosis:
          "Deliverability problem first. Run the sending domain through mail-tester.com. Score below 8/10 indicates SPF, DKIM, or DMARC misalignment. Fix that before touching subject lines.",
      },
      {
        label: "Typical range",
        range: "30% to 55%",
        diagnosis:
          "Healthy open rate. Subject line refinements and sender name changes move this band. Below 40% suggests room to improve subject specificity; above 50% is excellent for cold-list maturity.",
      },
      {
        label: "Outperforming",
        range: "Over 55%",
        diagnosis:
          "Small tightly-curated list, or warm cohort (paid subscribers, recent customers). Verify by segment: cold-acquired subscribers shouldn't open at 55%+ consistently.",
      },
    ],
    drivers: [
      "Deliverability (SPF/DKIM/DMARC alignment) – the dominant driver below 30%",
      "Sender name (founder name beats brand name by 15 to 40%)",
      "Subject line specificity (specific deliverable beats vague newsletter framing)",
      "List hygiene (sending to engaged segment only)",
      "Send frequency (2 to 4 per week is the sweet spot)",
    ],
    misreadings: [
      "Apple Mail Privacy Protection inflates open rates by 20 to 40 percentage points on iOS-heavy lists. Treat Apple Mail opens as 'maybe-opens', not opens.",
      "Reading open rate without click rate. Click rate is the load-bearing metric; opens are noisy.",
      "Optimizing subject lines when the diagnosis is deliverability. Subject lines move opens 5 to 15 percentage points; deliverability moves them 30 to 50.",
    ],
    faqs: [
      {
        q: "Why are my open rates declining even though my content is the same?",
        a: "Almost always list aging. Subscribers go dormant over months; sending to dormant subscribers hurts deliverability, which suppresses opens on the engaged tail. Segment out the dormant subscribers (no opens in 90 days) and send only to the engaged segment for 2 weeks.",
      },
      {
        q: "Should I send from my own name or my brand name?",
        a: "Founder name almost always wins. 'Maryan from Unlock SaaS' beats 'Unlock SaaS Team' by 15 to 40% on opens. The reader buys the relationship before they buy the brand.",
      },
      {
        q: "How accurate is Apple's open-rate inflation?",
        a: "Hard to measure precisely, but most operators see iOS open rates 20 to 40 percentage points higher than actual reads (Apple pre-fetches images regardless of whether the user opens the email). Treat the click rate as the truthful engagement signal.",
      },
    ],
    sourceNote:
      "Range based on ConvertKit's 2024 indie creator benchmarks, Lenny Rachitsky's creator-and-founder email survey, and the founder's observed data across personal newsletter operations. Excludes Apple Mail Privacy Protection inflation where possible.",
    lastVerified: "2026-05-20",
  },
  {
    slug: "email-click-rate",
    metric: "email click rate",
    metaTitle: "Average Email Click Rate (SaaS Founder Benchmarks)",
    metaDescription:
      "Engaged-list click rates for indie SaaS founder emails sit at 3% to 12%. Below 3% means the CTA isn't tied to a specific reader outcome.",
    aeoAnswer:
      "Click-through rates for indie SaaS founder emails sit between 3% and 12% of opens. Below 3% almost always means the CTA isn't tied to a specific reader outcome. Above 12% usually means warm cohort (paid subscribers, recent customers) or a Soap Opera Sequence email where the click is part of the narrative arc.",
    bands: [
      {
        label: "Underperforming",
        range: "Under 3%",
        diagnosis:
          "The CTA is generic ('check it out', 'learn more'). Specific CTA copy tied to a reader outcome moves this band immediately.",
      },
      {
        label: "Typical range",
        range: "3% to 12%",
        diagnosis:
          "Healthy click rate. The email is doing the work and the CTA is specific enough to act on. Refinements (link placement, button vs text, P.S. line) move within this band.",
      },
      {
        label: "Outperforming",
        range: "Over 12%",
        diagnosis:
          "Warm cohort or narrative arc payoff. A Soap Opera email's penultimate click can hit 20%+ because the sequence has built up momentum.",
      },
    ],
    drivers: [
      "CTA specificity (tied to reader outcome beats 'learn more')",
      "Link placement (above the fold, plus one near the end)",
      "P.S. line (under-utilized; often the most-clicked element)",
      "Plain-text vs HTML (plain-text often outperforms heavy-HTML)",
      "Sequence position (later-sequence emails often have higher click rates)",
    ],
    misreadings: [
      "Reading click rate without separating by sequence position. Soap Opera emails 3 and 4 should click higher than email 1.",
      "Confusing 'click rate' (clicks per delivered) with 'click-to-open rate' (clicks per open). The latter is usually 2 to 3x the former.",
      "Optimizing button color when the diagnosis is CTA copy.",
    ],
    faqs: [
      {
        q: "Should I include more or fewer links per email?",
        a: "Fewer, almost always. One primary CTA plus a P.S. link to the same destination outperforms three competing links. The exception is a curated 'best of the week' email where the format itself promises multiple links.",
      },
      {
        q: "Are buttons better than text links?",
        a: "Buttons usually outperform text links 1.5 to 2x on the same offer. The exception is in the Seinfeld Email pattern where a casual founder email reads as more authentic with a single text link. Match the format to the email's voice.",
      },
      {
        q: "How do I improve clicks on a flat list?",
        a: "Almost always upstream: improve the open rate first (deliverability + sender name), then refine the CTA. A flat click rate on a list with a 20% open rate is hard to diagnose because the sample is too small.",
      },
    ],
    sourceNote:
      "Range based on ConvertKit's 2024 indie operator benchmarks for creators with 1,000 to 25,000 subscribers, Lenny Rachitsky's creator-and-founder email survey, and the founder's Soap Opera Sequence and Seinfeld Email observed data.",
    lastVerified: "2026-05-20",
  },
  {
    slug: "trial-to-paid-conversion",
    metric: "trial to paid conversion",
    metaTitle: "Average Trial-to-Paid Conversion (SaaS Benchmarks)",
    metaDescription:
      "Indie SaaS trial-to-paid conversion sits at 8% to 25% for free trials and 30% to 60% for $1 trials. Activation is the dominant driver.",
    aeoAnswer:
      "Trial-to-paid conversion for indie SaaS sits between 8% and 25% for free trials and between 30% and 60% for $1 trials (where the user already entered a card). The dominant driver is the activation moment in the first session, not the email follow-up. A user who reaches an 'aha' moment in session one converts at 2 to 4x the rate of one who doesn't.",
    bands: [
      {
        label: "Underperforming",
        range: "Under 8% (free trial) / Under 30% ($1 trial)",
        diagnosis:
          "The activation moment isn't built into the trial flow. The user signs up, looks around, and bounces before reaching the point where the value is obvious.",
      },
      {
        label: "Typical range",
        range: "8% to 25% (free trial) / 30% to 60% ($1 trial)",
        diagnosis:
          "Healthy trial conversion. Onboarding flow refinements and activation-moment improvements compound here. Email follow-up plays a supporting role.",
      },
      {
        label: "Outperforming",
        range: "Over 25% (free trial) / Over 60% ($1 trial)",
        diagnosis:
          "Either a highly-pre-sold trial cohort (warm referral, returning user) or a product whose value reveals itself in the first session by design.",
      },
    ],
    drivers: [
      "Time-to-activation (the moment of obvious value in session one)",
      "Trial type ($1 trial vs free trial – the gap is 3 to 4x)",
      "Onboarding flow design (guided > self-serve > nothing)",
      "Email Soap Opera Sequence during the trial",
      "Founder-led outreach for high-ticket SaaS ($99+/month)",
    ],
    misreadings: [
      "Reading trial conversion without separating activated vs unactivated users. Conversion of activated users is typically 5 to 10x that of unactivated.",
      "Optimizing the trial-ending email when the diagnosis is activation. The email is the late game; activation is the first move.",
      "Comparing free-trial conversion to $1-trial conversion. The 4x gap is structural, not optimizable.",
    ],
    faqs: [
      {
        q: "Should I use a $1 trial or a free trial?",
        a: "Depends on ICP. $1 trial pre-qualifies serious buyers and converts at 3 to 4x the rate; free trial casts a wider net and brings in more trial users. For high-ticket SaaS ($49+/month), $1 trial almost always wins on cohort quality.",
      },
      {
        q: "How long should the trial be?",
        a: "7 days for simple SaaS, 14 days for moderate complexity, 30 days for enterprise tools. Longer trials don't increase conversion – they increase the percentage of users who never activate. Most users decide within the first 48 hours regardless of trial length.",
      },
      {
        q: "Should I extend a trial that hasn't activated?",
        a: "Once, with founder-led outreach. 'I notice you signed up but haven't done X yet – can I help?' converts at 10 to 25% on unactivated trials. Automated extension without outreach almost never converts; the user already lost interest.",
      },
    ],
    sourceNote:
      "Range based on multiple public indie SaaS benchmarks (Lenny Rachitsky's PMF survey, ProfitWell's SaaS metrics report) and the founder's observed data across 41 teardowns. $1-trial range biased toward Brunson value-ladder implementations.",
    lastVerified: "2026-05-19",
  },
  {
    slug: "saas-churn-rate",
    metric: "SaaS churn rate",
    metaTitle: "Average SaaS Monthly Churn Rate (Indie Benchmarks)",
    metaDescription:
      "Indie SaaS monthly churn sits at 5% to 12% for SMB and 3% to 7% for B2B mid-market. Cohort breakdown matters more than the headline number.",
    aeoAnswer:
      "Monthly churn for indie SaaS sits between 5% and 12% for SMB-focused products and 3% to 7% for B2B mid-market. The headline number is almost always misleading – cohort breakdown (paid vs free trial, monthly vs annual, ICP-fit vs ICP-miss) tells the real story. A 10% headline churn rate hiding a 25% ICP-miss churn rate is a positioning problem, not a product problem.",
    bands: [
      {
        label: "Underperforming",
        range: "Over 12% monthly (SMB) / Over 7% monthly (B2B mid-market)",
        diagnosis:
          "Either positioning attracts wrong-fit signups (most common) or the activation moment isn't strong enough to retain. Check first-30-day churn separately from steady-state churn.",
      },
      {
        label: "Typical range",
        range: "5% to 12% monthly (SMB) / 3% to 7% monthly (B2B)",
        diagnosis:
          "Normal indie SaaS churn. Optimizations on retention emails, upgrade prompts, and re-activation flows compound here. ICP-fit work moves you out of the band.",
      },
      {
        label: "Outperforming",
        range: "Under 5% monthly (SMB) / Under 3% monthly (B2B)",
        diagnosis:
          "Excellent fit. Usually annual-heavy customer mix (annual plans churn 3 to 5x less than monthly), or a product whose value reveals over time and creates switching cost.",
      },
    ],
    drivers: [
      "ICP fit (the dominant driver, by far)",
      "Annual vs monthly plan mix (annual churns 3 to 5x less)",
      "First 30-day activation (predicts steady-state churn)",
      "Re-activation campaigns for dormant users",
      "Honest pricing-fit (downgrades > full cancellations)",
    ],
    misreadings: [
      "Looking at headline monthly churn without separating cohorts. Annual customers, monthly customers, and trial-converted customers have different baselines.",
      "Confusing voluntary churn (cancellations) with involuntary churn (failed payments). Involuntary churn is fixable with retry logic, not retention work.",
      "Reading churn after 30 days as a 'fixable' number. The first 30 days are activation; steady-state churn is the retention metric.",
    ],
    faqs: [
      {
        q: "Should I focus on reducing churn or increasing acquisition?",
        a: "If monthly churn is above 10%, reduce churn first. Acquisition into a leaky bucket is unprofitable. Below 7%, acquisition compounds. The Brunson value-ladder pattern says: the back-end (retention, upsell) pays for the front-end (acquisition), not the other way around.",
      },
      {
        q: "What's the best way to reduce voluntary churn?",
        a: "Pre-cancellation flows that offer pause, downgrade, or specific use-case help convert 20 to 40% of cancellations. The dominant driver is whether the user reached an activation moment; users who never activated cancel and won't be saved by a pre-cancel flow.",
      },
      {
        q: "How much of churn is involuntary (failed payments)?",
        a: "Typically 20 to 40% of total churn is involuntary (card declined, expired, etc.). Smart retry logic (multiple attempts over 7 days) recovers 50 to 70% of involuntary churn. This is high-ROI infrastructure work, not retention work.",
      },
    ],
    sourceNote:
      "Range based on ProfitWell's 2024 SaaS benchmarks, Lenny Rachitsky's PMF survey, and the founder's observed range across teardowns. SMB and B2B mid-market bands are roughly inverse to deal size.",
    lastVerified: "2026-05-19",
  },
  {
    slug: "webinar-show-up-rate",
    metric: "webinar show-up rate",
    metaTitle: "Average Webinar Show-Up Rate (Live Benchmarks)",
    metaDescription:
      "Live webinar show-up rates sit at 25% to 50% of registrations. Below 25% means the title over-promised; above 50% means heavy reminder game.",
    aeoAnswer:
      "Live webinar show-up rates for indie SaaS sit between 25% and 50% of registrations. Below 25% usually means the registration page over-promised relative to the actual content. Above 50% almost always means a heavy reminder sequence (3+ touches in the 48 hours pre-event) plus a calendar block.",
    bands: [
      {
        label: "Underperforming",
        range: "Under 25%",
        diagnosis:
          "Registration page promised more than the webinar delivers. The registrant decides not to show up between registration and live. Check the title-to-content match.",
      },
      {
        label: "Typical range",
        range: "25% to 50%",
        diagnosis:
          "Healthy show-up rate. Reminder sequence (2 to 3 emails, one SMS for high-ticket) moves this band. Calendar block on registration helps the upper half.",
      },
      {
        label: "Outperforming",
        range: "Over 50%",
        diagnosis:
          "Heavy reminder game, paid registration, or pre-event qualification call. Common for high-ticket ($1K+) offer webinars.",
      },
    ],
    drivers: [
      "Reminder sequence (the biggest movable driver)",
      "Calendar block on the registration page",
      "Title-to-content match (over-promise tanks show-up)",
      "Time-of-day fit for the audience",
      "Replay availability (paradoxically, NO replay = higher show-up)",
    ],
    misreadings: [
      "Reading show-up rate without considering replay-viewer behavior. Replay viewers and live attendees are different cohorts.",
      "Comparing free-webinar show-up to paid-webinar show-up. Paid webinars run 60 to 85% show-up; free webinars run 25 to 50%.",
      "Treating low show-up as a 'subject line' problem. It's almost always a promise-vs-delivery problem.",
    ],
    faqs: [
      {
        q: "Should I offer a replay?",
        a: "Yes, with a 48-hour expiry. No replay maximizes live show-up; unlimited replay tanks it. The 48-hour replay window is the Brunson Perfect Webinar pattern – it preserves urgency without punishing reasonable scheduling conflicts.",
      },
      {
        q: "What's the best day and time for a webinar?",
        a: "For B2C, weekday evenings (7-9pm local). For B2B, Tuesday or Wednesday morning (10am-12pm local). Avoid Monday morning (calendar catch-up) and Friday afternoon (cognitive offload). Time-of-day moves show-up 5 to 15 percentage points.",
      },
      {
        q: "How many reminder emails should I send?",
        a: "Three: one at 24 hours, one at 1 hour, one at 'going live now'. SMS reminder at 1 hour can lift show-up another 5 to 10 percentage points if the audience opted in for SMS. More than three reminders trains the audience to ignore them.",
      },
    ],
    sourceNote:
      "Range based on Lenny Rachitsky's launch-and-demo survey, OpenView Partners' demo-funnel research for product-led SaaS, the Brunson Perfect Webinar implementation pattern, and the founder's observed range across high-ticket coaching webinars. Free-webinar bands assume the registration is genuinely free (no email gating beyond the form).",
    lastVerified: "2026-05-20",
  },
  {
    slug: "saas-mrr-growth-rate",
    metric: "SaaS MRR growth rate",
    metaTitle: "Average SaaS Monthly MRR Growth Rate (Indie Benchmarks)",
    metaDescription:
      "Indie SaaS monthly MRR growth sits at 5% to 15% for $1K-$10K MRR and 3% to 8% for $10K-$100K. Growth slows as MRR scales.",
    aeoAnswer:
      "Monthly MRR growth for indie SaaS sits at 5% to 15% during the $1K-$10K stage, 3% to 8% during $10K-$100K, and 1% to 4% above $100K MRR. The deceleration is structural – the same number of new customers represents a smaller percentage growth as MRR scales. Compounded 5%/month yields ~80% YoY growth.",
    bands: [
      {
        label: "Underperforming",
        range:
          "Under 5%/mo at $1K-$10K MRR / Under 3%/mo at $10K-$100K MRR",
        diagnosis:
          "Either acquisition has plateaued or churn is eating new customer adds. Look at net-new MRR (new minus churned) and gross-new MRR separately.",
      },
      {
        label: "Typical range",
        range:
          "5% to 15%/mo at $1K-$10K / 3% to 8%/mo at $10K-$100K",
        diagnosis:
          "Healthy indie SaaS growth. The funnel is compounding. New customers cover churn plus add net MRR. Standard operating range.",
      },
      {
        label: "Outperforming",
        range:
          "Over 15%/mo at $1K-$10K / Over 8%/mo at $10K-$100K",
        diagnosis:
          "Hot growth. Either viral mechanics, partnership-driven, or seasonal tailwind. Verify sustainability before treating as the new baseline.",
      },
    ],
    drivers: [
      "Net-new MRR vs gross-new MRR (the difference is churn)",
      "Annual plan mix (annual smooths growth volatility)",
      "Acquisition channel diversification (one channel = one risk)",
      "Expansion revenue (existing customer upgrades)",
      "Cohort retention (better retention = MRR compounds)",
    ],
    misreadings: [
      "Reading MRR growth without separating new MRR from expansion MRR. They're different drivers.",
      "Comparing to public SaaS company benchmarks. Bessemer and ProfitWell publish numbers heavily biased to venture-backed companies. Indie baselines are different.",
      "Treating month-over-month volatility as a trend. SaaS MRR is noisy at indie scale; rolling 3-month average is more useful.",
    ],
    faqs: [
      {
        q: "How long does it take to go from $1K to $10K MRR?",
        a: "At 10% monthly growth, ~24 months. At 15%, ~16 months. At 5%, ~48 months. Most indie SaaS take 18 to 36 months from $1K to $10K. The variance is dominated by ICP-fit speed, not feature shipping pace.",
      },
      {
        q: "Is MRR growth the right metric or is ARR better?",
        a: "MRR for indie SaaS up to $100K ARR. ARR view kicks in around $250K when annual plans become a meaningful mix. The monthly view is more sensitive to changes and surfaces issues faster.",
      },
      {
        q: "How much should churn vs acquisition contribute to MRR growth?",
        a: "For a healthy indie SaaS at $10K MRR with 7% monthly churn: ~$700 of monthly churn needs to be replaced before any growth. Acquisition needs to do $1,200+/month to grow 5%. This math is why churn reduction often outperforms acquisition spend.",
      },
    ],
    sourceNote:
      "Range based on ProfitWell's 2024 SaaS benchmark report, Lenny Rachitsky's indie SaaS survey, and the founder's observed data across 41 teardowns. Excludes venture-backed companies whose growth profile is structurally different.",
    lastVerified: "2026-05-19",
  },
  {
    slug: "average-order-value",
    metric: "average order value (AOV)",
    metaTitle: "Average Order Value Benchmarks (Indie SaaS + Info Products)",
    metaDescription:
      "Indie SaaS AOV sits at $9-$99/month for subscriptions and $27-$497 for info products. Stack Slide presence moves AOV more than pricing tests.",
    aeoAnswer:
      "Indie SaaS subscription AOV sits between $9 and $99 monthly for self-serve products and $99 to $999 for sales-assisted tiers. Info product AOV sits between $27 and $497 for one-time purchases. The Stack Slide presence on the pricing page moves AOV 30 to 80% more than any price-point optimization.",
    bands: [
      {
        label: "Underperforming",
        range:
          "Under $19/mo subscription / Under $27 info product",
        diagnosis:
          "Pricing is below the value being delivered. Either no Stack Slide on the page (so the price is unanchored low) or the offer itself is under-built. Add Stack first, raise price second.",
      },
      {
        label: "Typical range",
        range:
          "$19-$99/mo subscription / $27-$497 info product",
        diagnosis:
          "Healthy pricing for indie SaaS. Stack Slide presence and OTO mechanics can lift AOV within this band. Pricing tests beyond this band require offer-stack changes.",
      },
      {
        label: "Outperforming",
        range:
          "Over $99/mo subscription / Over $497 info product",
        diagnosis:
          "Either premium positioning (specialty niche, high-trust founder) or sales-assisted closing. Self-serve at this price requires exceptional Stack Slide work.",
      },
    ],
    drivers: [
      "Stack Slide presence on the pricing page (the dominant driver)",
      "Annual plan availability (annual customers have 8 to 12x higher AOV)",
      "OTO take rate after initial purchase",
      "Niche specificity (specialist > generalist on pricing power)",
      "Founder trust signal (named founder, dated proof)",
    ],
    misreadings: [
      "Reading AOV across mixed pricing tiers without segmenting. Self-serve and sales-assisted have different baselines.",
      "Comparing to public SaaS AOV. Most public SaaS is enterprise; indie SaaS baselines are 5 to 50x lower.",
      "Lowering price to fix conversion when the diagnosis is offer-stack. Lower price doesn't fix unanchored value.",
    ],
    faqs: [
      {
        q: "Should I raise my prices?",
        a: "Almost always yes for indie SaaS under $49/month. The price is rarely the conversion blocker; the Stack Slide is. Most founders should raise price 30 to 50% AND add a Stack Slide simultaneously. Conversion typically holds, AOV jumps.",
      },
      {
        q: "How do I know if my price is too low?",
        a: "Three signals: customers don't haggle (price is too low), customers don't churn for price reasons (too low), and your gross margin can't support full-time work (definitively too low). If all three are true, raise the price.",
      },
      {
        q: "Should I offer annual plans at a discount?",
        a: "Almost always. Annual plans churn 3 to 5x less than monthly, so the discount pays for itself in retention. 15 to 25% off for annual is the standard range; deeper discounts (40%+) usually attract price-shoppers and don't compound.",
      },
    ],
    sourceNote:
      "Range based on ProfitWell SaaS benchmarks, ConvertKit creator economy reports, and the founder's observed data. Excludes enterprise SaaS and venture-funded growth-stage companies.",
    lastVerified: "2026-05-19",
  },
  {
    slug: "customer-acquisition-cost",
    metric: "customer acquisition cost (CAC)",
    metaTitle: "Customer Acquisition Cost Benchmarks (Indie SaaS)",
    metaDescription:
      "Indie SaaS CAC sits at $30-$300 for self-serve and $500-$3,000 for sales-assisted. LTV:CAC ratio matters more than the absolute number.",
    aeoAnswer:
      "Customer acquisition cost for indie SaaS sits between $30 and $300 for self-serve products and $500 to $3,000 for sales-assisted tiers. The absolute CAC matters less than the LTV:CAC ratio (target 3:1 or better). Indie SaaS with strong organic / content / referral channels often run CAC under $50.",
    bands: [
      {
        label: "Underperforming",
        range:
          "LTV:CAC under 2:1",
        diagnosis:
          "Acquisition is unprofitable or marginally profitable. Either CAC is too high or LTV is too low (high churn, low expansion). Both fixable; the diagnostic should be which lever.",
      },
      {
        label: "Typical range",
        range:
          "LTV:CAC between 2:1 and 5:1",
        diagnosis:
          "Healthy unit economics. Most indie SaaS operate here. Optimizations on retention (raising LTV) and channel mix (lowering CAC) compound the ratio.",
      },
      {
        label: "Outperforming",
        range:
          "LTV:CAC over 5:1",
        diagnosis:
          "Either organic-dominated acquisition or exceptional retention. The risk is under-investing in acquisition. Most operators with 5:1+ should be spending more on growth.",
      },
    ],
    drivers: [
      "Channel mix (organic > referral > paid)",
      "Brand strength (lower CAC for same volume)",
      "ICP precision (better fit = lower acquisition cost)",
      "Sales motion (self-serve cheaper than sales-assisted)",
      "Conversion rate at each funnel step",
    ],
    misreadings: [
      "Reading 'blended CAC' without separating paid from organic. They're different cost structures.",
      "Calculating CAC without including founder time. Indie SaaS often under-counts the real CAC because founder hours aren't priced in.",
      "Comparing CAC across SaaS categories without normalizing. B2C, SMB, and mid-market run different baselines.",
    ],
    faqs: [
      {
        q: "What's a good payback period?",
        a: "Under 12 months for indie SaaS, under 18 months as the absolute ceiling. Above 18 months, the business is funding acquisition out of capital, not cash flow. Most indie SaaS should target 6 to 9 month payback.",
      },
      {
        q: "Should I run paid ads?",
        a: "Only after organic and referral channels are saturated AND the LTV:CAC ratio supports it. Most indie SaaS run paid ads too early, before the funnel is converting well. Fix the funnel first; scale with paid second.",
      },
      {
        q: "How do I lower CAC?",
        a: "Three levers: better targeting (lower CPC, higher conversion), better landing pages (higher conversion), and channel diversification (less reliance on the most expensive channel). The Brunson frame says: the funnel is upstream of the channel.",
      },
    ],
    sourceNote:
      "Range based on First Round Capital's State of Startups, Bessemer's BVP State of Cloud, and the founder's observed data. Indie SaaS bands are roughly 1/5 to 1/20 of venture-backed benchmarks.",
    lastVerified: "2026-05-19",
  },
  {
    slug: "lifetime-value",
    metric: "customer lifetime value (LTV)",
    metaTitle: "Customer Lifetime Value Benchmarks (Indie SaaS)",
    metaDescription:
      "Indie SaaS LTV sits at $200-$2,000 for SMB self-serve and $5,000-$50,000 for B2B mid-market. LTV math is highly sensitive to churn rate.",
    aeoAnswer:
      "Indie SaaS lifetime value sits between $200 and $2,000 for SMB self-serve products and between $5,000 and $50,000 for B2B mid-market tiers. The LTV calculation is extremely sensitive to the churn rate used – a 1 percentage point change in monthly churn shifts LTV 20 to 40%. Use cohort-based LTV where possible.",
    bands: [
      {
        label: "Underperforming",
        range:
          "Under $200 SMB / Under $5,000 B2B mid-market",
        diagnosis:
          "Either the AOV is too low (price-stack problem) or the churn rate is too high (positioning or activation problem). LTV is the output; the inputs are the levers.",
      },
      {
        label: "Typical range",
        range:
          "$200-$2,000 SMB / $5,000-$50,000 B2B mid-market",
        diagnosis:
          "Standard indie SaaS LTV. Compounding work on AOV (Stack Slide, OTO, annual plans) and retention (activation, re-engagement) moves the band.",
      },
      {
        label: "Outperforming",
        range:
          "Over $2,000 SMB / Over $50,000 B2B mid-market",
        diagnosis:
          "Premium positioning, high expansion revenue, or specialty niche. Verify the LTV math against actual cohort retention, not modeled projections.",
      },
    ],
    drivers: [
      "AOV (the load-bearing input)",
      "Monthly churn rate (small changes compound massively)",
      "Annual plan mix (lifts AOV and reduces churn simultaneously)",
      "Expansion revenue (upsells over time)",
      "Customer cohort retention curve shape",
    ],
    misreadings: [
      "Using a single monthly churn number to project LTV. Real churn curves are non-linear; early-cohort churn is higher than steady-state.",
      "Projecting LTV from cohorts under 12 months old. The math is unstable on short data.",
      "Comparing LTV to CAC without normalizing for sales cycle length. Long sales cycles inflate apparent LTV unfairly.",
    ],
    faqs: [
      {
        q: "How do I calculate LTV correctly?",
        a: "Cohort-based, not flat. Take a cohort of customers from month X, track their retention monthly, project to a 24-month horizon, multiply by AOV. Avoid the '1 / churn rate' shortcut for indie SaaS – it assumes flat churn, which isn't true.",
      },
      {
        q: "What's a good LTV:CAC ratio?",
        a: "3:1 minimum, 5:1 healthy, over 7:1 means you should probably invest more in acquisition. Below 3:1 means the business is unprofitable per customer; the fix is either lower CAC or raise LTV.",
      },
      {
        q: "How does annual vs monthly impact LTV?",
        a: "Significantly. Annual plans churn 3 to 5x less than monthly. A customer on monthly might churn at 7%/month (LTV ~14 months); the same customer on annual churns 25%/year (LTV ~4 years). Annual plans are the highest-leverage LTV move available.",
      },
    ],
    sourceNote:
      "Range based on ProfitWell's 2024 SaaS retention research, OpenView Partners' annual SaaS benchmark report, Lenny Rachitsky's retention survey, and the founder's observed range across teardowns. Cohort-based LTV calculations recommended over flat 1/churn projections.",
    lastVerified: "2026-05-20",
  },
  {
    slug: "free-to-paid-conversion",
    metric: "free to paid conversion",
    metaTitle: "Average Free-to-Paid Conversion (Freemium SaaS Benchmarks)",
    metaDescription:
      "Freemium SaaS free-to-paid conversion sits at 1% to 4% for broad freemium and 5% to 15% for narrow product-led models.",
    aeoAnswer:
      "Free-to-paid conversion for freemium SaaS sits between 1% and 4% for broad freemium models and 5% to 15% for narrow product-led models (where the free tier is gated to a specific use case). The gap is structural: broad freemium attracts users who never need to upgrade; narrow product-led freemium forces the upgrade decision at a specific moment.",
    bands: [
      {
        label: "Underperforming",
        range: "Under 1%",
        diagnosis:
          "Free tier gives away the load-bearing use case. Free users have no reason to upgrade because they're getting what they came for. Restrict the free tier or change the upgrade trigger.",
      },
      {
        label: "Typical range",
        range: "1% to 4% (broad freemium) / 5% to 15% (narrow PLG)",
        diagnosis:
          "Standard freemium conversion. The free tier is doing acquisition work; the paid tier is structured for the cohort that hits a specific limit or wants a specific feature.",
      },
      {
        label: "Outperforming",
        range: "Over 4% (broad) / Over 15% (narrow PLG)",
        diagnosis:
          "Either the free tier is heavily limited (forcing upgrade earlier) or the paid tier solves a specific 'I need this now' problem. Verify the free tier still delivers value to non-upgraders.",
      },
    ],
    drivers: [
      "Where the free tier ends (the dominant driver)",
      "Paid tier value proposition specificity",
      "In-product upgrade prompts (timing matters more than copy)",
      "Email Soap Opera Sequence to free users",
      "Founder-led outreach for high-intent free users",
    ],
    misreadings: [
      "Reading free-to-paid in isolation. The total acquisition funnel matters: how many free users did you acquire to get the paid conversions?",
      "Confusing 'product-led growth' (PLG) with 'freemium'. They're different models; PLG often uses a free trial, not a permanent free tier.",
      "Lowering the price of the paid tier to fix conversion. Almost never works. The upgrade decision is about the line between free and paid, not the price of paid.",
    ],
    faqs: [
      {
        q: "Should I offer freemium at all?",
        a: "Only if the free tier acquires meaningfully cheaper than alternatives AND the path from free to paid is structurally clear. Most indie SaaS shouldn't offer freemium – the free tier eats founder support time without acquiring upgraders at a meaningful rate.",
      },
      {
        q: "What's the right free tier limit?",
        a: "Tight enough that 5 to 15% of regular users hit it monthly. Looser and conversion drops; tighter and the free tier doesn't acquire. Iterate on the limit, not the price.",
      },
      {
        q: "Should I notify users when they hit the free tier limit?",
        a: "Yes, with a specific upgrade path. 'You've hit your free limit – upgrade to keep going' converts at 5 to 20% of triggered notifications. Soft prompts ('consider upgrading') convert at near-zero.",
      },
    ],
    sourceNote:
      "Range based on Lenny Rachitsky's PLG benchmark survey, OpenView Partners' annual PLG report, and the founder's observed range across indie SaaS teardowns.",
    lastVerified: "2026-05-19",
  },
  {
    slug: "refund-rate",
    metric: "refund rate",
    metaTitle: "Average SaaS Refund Rate (Indie Benchmarks)",
    metaDescription:
      "Indie SaaS refund rates sit at 2% to 8% within the guarantee window. Above 8% means trust break; below 2% means the guarantee isn't being used as a sales tool.",
    aeoAnswer:
      "Indie SaaS refund rates within the guarantee window sit between 2% and 8% of purchases. Below 2% usually means the guarantee isn't being used as a sales tool (it should be visible and prominent enough to be claimed sometimes). Above 8% suggests a trust-break: the product or onboarding isn't delivering what the sales page promised.",
    bands: [
      {
        label: "Underperforming",
        range:
          "Over 8% within guarantee window",
        diagnosis:
          "Product or onboarding doesn't match the sales page's promise. Read 5 to 10 refund reasons. The pattern is usually one specific feature gap or expectation mismatch.",
      },
      {
        label: "Typical range",
        range:
          "2% to 8% within guarantee window",
        diagnosis:
          "Healthy refund rate. The guarantee is doing work (visible enough to be a sales tool) and the product is delivering enough to keep most buyers.",
      },
      {
        label: "Outperforming",
        range:
          "Under 2% within guarantee window",
        diagnosis:
          "Either the guarantee isn't visible (most buyers don't know they can claim it – wasted sales tool) or the product is exceptional. Verify by surfacing the guarantee more prominently for a week.",
      },
    ],
    drivers: [
      "Sales page accuracy (over-promising drives refunds)",
      "Onboarding clarity (confused users refund)",
      "Activation moment timing",
      "Guarantee visibility (prominently displayed = more claims but more sales)",
      "Refund process friction (some friction is healthy)",
    ],
    misreadings: [
      "Treating low refund rate as 'good' without checking guarantee visibility. A hidden guarantee is wasted.",
      "Reading refund rate without separating by traffic source. Cold-traffic refunds run higher than warm.",
      "Reducing guarantee terms (shorter window, narrower conditions) to lower refund rate. This often kills conversion more than it saves refunds.",
    ],
    faqs: [
      {
        q: "Should I have a money-back guarantee?",
        a: "Almost always yes. The conversion lift from a visible guarantee outweighs the refund cost in nearly every indie SaaS scenario. 30-day window for monthly subscriptions, 60 to 90 days for one-time purchases.",
      },
      {
        q: "Should the refund process be one-click or require contact?",
        a: "One-click for low-ticket ($1 to $49), contact-required for high-ticket ($100+). One-click signals confidence and prevents the trap-feel; contact-required catches genuine misunderstandings and recovers some refunds via founder outreach.",
      },
      {
        q: "How do I know if my refund rate is too high?",
        a: "Above 8% within the guarantee window is the warning threshold. Read the refund reasons. If 50%+ cite the same issue (specific feature gap, onboarding confusion), fix that root cause. Marketing tweaks don't fix product-fit problems.",
      },
    ],
    sourceNote:
      "Range based on ProfitWell refund research, ConvertKit's creator-commerce refund benchmarks, OpenView Partners' annual SaaS report, and observed indie SaaS data across 41 teardowns. Heavily moderated by guarantee window length and product category.",
    lastVerified: "2026-05-20",
  },
  {
    slug: "cold-email-reply-rate",
    metric: "cold email reply rate",
    metaTitle: "Average Cold Email Reply Rate (Founder Outreach Benchmarks)",
    metaDescription:
      "Founder-grade cold email reply rates sit at 5% to 15% for tightly-targeted sends. Below 5% means generic; above 15% usually means warm-adjacent.",
    aeoAnswer:
      "Cold email reply rates for founder-grade outreach sit between 5% and 15% for tightly-targeted sends (Dream 100 style). Below 5% almost always means generic copy or generic targeting. Above 15% usually means the list is warm-adjacent (mutual connections, prior interactions, or relevant timing signals).",
    bands: [
      {
        label: "Underperforming",
        range: "Under 5%",
        diagnosis:
          "Either targeting is generic (list isn't actually Dream 100) or copy is generic (could be sent to anyone). Specificity in both directions is the fix.",
      },
      {
        label: "Typical range",
        range: "5% to 15%",
        diagnosis:
          "Healthy founder outreach. Targeting is specific, copy mentions something the recipient can verify is real (their company, their work, their public statement), and the ask is clear.",
      },
      {
        label: "Outperforming",
        range: "Over 15%",
        diagnosis:
          "Warm-adjacent outreach. Mutual connections, recent public events about the recipient, or perfect-timing context. Verify before treating as cold-email baseline.",
      },
    ],
    drivers: [
      "Specificity of the opening line (verifiable, specific)",
      "Mutual context (referrer, shared event, public statement)",
      "Subject line specificity",
      "Length (under 100 words almost always wins)",
      "Clear ask (what specifically do you want them to do?)",
    ],
    misreadings: [
      "Reading reply rate across mixed cohorts. Dream 100 outreach and bulk SDR outreach are different worlds.",
      "Counting auto-replies and out-of-offices as replies. They're noise.",
      "Optimizing the wrong sequence step. The first email's quality dominates; follow-ups can lift reply rate 30 to 50% but won't fix a broken first email.",
    ],
    faqs: [
      {
        q: "How many follow-ups should I send?",
        a: "Two to three. The first email gets 60 to 70% of total replies. Each follow-up adds 10 to 20% on top. Beyond three follow-ups, replies drop to near-zero and irritation rises.",
      },
      {
        q: "What's the best subject line for cold founder outreach?",
        a: "Specific and short. 'Question about your [specific thing they did]' beats 'Quick question'. 5 to 7 words, lower-case, no clickbait. Reply rates drop 30 to 50% on clickbait subject lines.",
      },
      {
        q: "Should I use a tool like Apollo or Hunter for outreach?",
        a: "For finding the address, yes. For sending the email, send manually for high-value outreach (Dream 100). Bulk-sending tools sacrifice deliverability and reply rate for volume; the math rarely works for indie founders.",
      },
    ],
    sourceNote:
      "Range based on Lemlist and Reply.io published benchmarks, plus the founder's observed range on Dream 100 outreach. Excludes mass-SDR outreach which has structurally different baselines.",
    lastVerified: "2026-05-19",
  },
  {
    slug: "saas-trial-length",
    metric: "SaaS trial length",
    metaTitle: "Optimal SaaS Trial Length (Indie Benchmarks)",
    metaDescription:
      "Optimal SaaS trial length is 7-14 days for self-serve, 14-30 days for moderate complexity, 30+ days only for enterprise. Longer trials reduce activation.",
    aeoAnswer:
      "Optimal trial length is 7 to 14 days for self-serve SaaS, 14 to 30 days for moderate complexity products, and 30 days or more only for enterprise tools. Longer trials counterintuitively reduce activation: users defer the decision and the trial ends without an 'aha' moment.",
    bands: [
      {
        label: "Underperforming",
        range:
          "Under 7 days for moderate-complexity SaaS / Over 30 days for self-serve",
        diagnosis:
          "Either too short (users can't reach activation) or too long (decision is deferred). Match trial length to time-to-activation.",
      },
      {
        label: "Typical range",
        range:
          "7-14 days self-serve / 14-30 days moderate / 30+ days enterprise",
        diagnosis:
          "Healthy match between trial length and product complexity. Most users decide in the first 48 hours regardless of length.",
      },
      {
        label: "Outperforming",
        range: "$1 trial regardless of length",
        diagnosis:
          "$1 trial pre-qualifies serious users and converts at 3 to 4x the rate of free trials. The economics often work even with refund rate accounted for.",
      },
    ],
    drivers: [
      "Time-to-activation in the product (the underlying constraint)",
      "Trial type ($1 vs free)",
      "Onboarding flow design (guided > self-serve > nothing)",
      "Trial-ending email sequence",
      "Founder-led outreach for high-ticket SaaS",
    ],
    misreadings: [
      "Extending trial length to 'help users decide'. The deciding happens in the first 48 hours regardless of trial length.",
      "Comparing trial lengths across categories without normalizing complexity. Simple SaaS at 30 days underconverts; enterprise at 7 days underconverts.",
      "Reading activation rate without separating by cohort. Power users activate fast; casual users may need follow-up regardless of trial length.",
    ],
    faqs: [
      {
        q: "Should I extend a trial that hasn't activated?",
        a: "Once, with founder-led outreach. 'I see you haven't done X yet – can I help?' converts 10 to 25%. Automated trial extension without outreach almost never converts; the user already lost interest.",
      },
      {
        q: "Should I require a credit card for the trial?",
        a: "Card-required trials convert 3 to 4x higher on a per-trial basis but acquire 50 to 70% fewer trials. Net conversion is often higher with card-required. For most indie SaaS, card-required is the better choice.",
      },
      {
        q: "What's the right balance between free trial and free tier?",
        a: "Free trial for products with clear time-to-value (under 14 days). Free tier for products with delayed value-revelation (collaborative tools, content libraries). Don't offer both unless you have a clear differentiator between them.",
      },
    ],
    sourceNote:
      "Range based on OpenView Partners' PLG benchmark report, Lenny Rachitsky's onboarding research, and the founder's observed data across indie SaaS teardowns.",
    lastVerified: "2026-05-19",
  },
  {
    slug: "page-time-to-interactive",
    metric: "page time to interactive",
    metaTitle: "Page Time-to-Interactive Benchmarks (Core Web Vitals)",
    metaDescription:
      "Healthy time-to-interactive for indie SaaS marketing pages is under 3.5s on mobile. Beyond 5s, conversion drops sharply with each second added.",
    aeoAnswer:
      "Healthy time-to-interactive for indie SaaS marketing pages is under 3.5 seconds on mobile (mid-range device, 4G connection). Beyond 5 seconds, conversion rate drops 5 to 15% per additional second. Google's Core Web Vitals threshold (Interaction to Next Paint under 200ms) is the SEO floor, not the conversion ceiling.",
    bands: [
      {
        label: "Underperforming",
        range: "Over 5s mobile",
        diagnosis:
          "Page is heavy with third-party scripts (analytics, chat widgets, fonts), unoptimized images, or render-blocking JavaScript. Each fix typically cuts 0.3 to 1.0 second.",
      },
      {
        label: "Typical range",
        range: "1.5s to 3.5s mobile",
        diagnosis:
          "Healthy load time. Standard Next.js / Vercel hosted marketing pages sit here with minimal optimization. SEO floor is met.",
      },
      {
        label: "Outperforming",
        range: "Under 1.5s mobile",
        diagnosis:
          "Static-first architecture, image optimization, no third-party JS. Conversion benefits are real but diminishing under 2 seconds.",
      },
    ],
    drivers: [
      "Third-party JavaScript (the biggest performance cost)",
      "Image format and size (next-gen formats, proper sizing)",
      "Font loading strategy (system fonts > preloaded > async)",
      "Render-blocking resources",
      "Hosting and CDN configuration",
    ],
    misreadings: [
      "Optimizing for desktop when mobile is the bottleneck. Most indie SaaS traffic is 60 to 80% mobile.",
      "Chasing perfect Lighthouse scores. The score doesn't directly correlate with conversion; real time-to-interactive does.",
      "Adding third-party tools (analytics, chat, A/B test) without measuring the performance cost.",
    ],
    faqs: [
      {
        q: "Does page speed affect SEO?",
        a: "Yes, marginally. Google's Core Web Vitals (LCP, INP, CLS) factor into rankings. Most indie SaaS see SEO impact at the margins; the bigger reason to optimize is direct conversion rate.",
      },
      {
        q: "Is Next.js fast enough out of the box?",
        a: "Yes for marketing pages. Static generation (or App Router server components) on Vercel sits under 2s mobile time-to-interactive without any optimization work. The performance debt accumulates from added third-party scripts and unoptimized images.",
      },
      {
        q: "Should I remove my analytics tools to improve speed?",
        a: "No. PostHog, GA4, and similar tools cost 100 to 300ms on first paint, which is acceptable. Remove only the duplicated tracking (most sites have 3 to 5 redundant analytics tools loaded simultaneously).",
      },
    ],
    sourceNote:
      "Range based on Google's Core Web Vitals benchmarks, web.dev published case studies, and observed indie SaaS marketing site performance. Mobile-first measurement.",
    lastVerified: "2026-05-19",
  },
  {
    slug: "bounce-rate",
    metric: "bounce rate",
    metaTitle: "Average Bounce Rate (Indie SaaS Marketing Pages)",
    metaDescription:
      "Indie SaaS marketing page bounce rates sit at 40% to 70%. Below 40% on cold traffic usually means scroll-tracking is breaking measurement.",
    aeoAnswer:
      "Indie SaaS marketing page bounce rates sit between 40% and 70% on cold traffic. Below 40% on cold traffic usually means scroll-tracking or engagement events are firing falsely (inflating session quality artificially). Above 70% indicates Wrong Person traffic or content-traffic mismatch.",
    bands: [
      {
        label: "Underperforming",
        range:
          "Over 70% on cold traffic",
        diagnosis:
          "Traffic doesn't match the page's frame. Either acquisition channel needs niching or the page's headline needs to filter traffic better. Check landing page by source.",
      },
      {
        label: "Typical range",
        range:
          "40% to 70% on cold traffic",
        diagnosis:
          "Healthy bounce rate for marketing pages. Engagement-event firing (scroll, click, form interaction) marks engaged sessions and clarifies the signal.",
      },
      {
        label: "Outperforming",
        range:
          "Under 40% on cold traffic",
        diagnosis:
          "Usually a measurement artifact (false engagement events). On cold traffic, sub-40% bounce is unusual and worth verifying against time-on-page.",
      },
    ],
    drivers: [
      "Audience-page fit (the dominant driver)",
      "Page load speed (slow pages bounce more)",
      "Headline specificity (above-the-fold message clarity)",
      "Mobile-first design (60-80% of traffic is mobile)",
      "Engagement-event tracking (changes measured bounce, not real)",
    ],
    misreadings: [
      "Treating GA4 bounce rate the same as GA Universal bounce rate. GA4 calls it 'engagement rate' and uses different logic. The numbers aren't directly comparable.",
      "Reading bounce rate without separating by source. Direct traffic, organic, paid, and referral all have different baselines.",
      "Trying to lower bounce by adding scroll-tracking events. That changes the measurement, not the underlying behavior.",
    ],
    faqs: [
      {
        q: "Is high bounce rate always bad?",
        a: "No. Single-page intent (someone Googles your name to find your contact email) generates legitimately high bounce. The metric matters in context: high bounce on a landing page designed for multi-page exploration is a problem; high bounce on a contact page is not.",
      },
      {
        q: "How do I lower bounce rate?",
        a: "Three levers: better traffic-page match (the dominant lever), faster page load, and clearer above-the-fold messaging. Don't try to lower bounce by trapping users on the page – that's adversarial UX.",
      },
      {
        q: "Should I track time-on-page instead of bounce?",
        a: "Both. Time-on-page is more sensitive but also noisier. Bounce is a stable directional signal. The combination tells the real story: low bounce + low time-on-page is contradictory and indicates measurement issues.",
      },
    ],
    sourceNote:
      "Range based on observed indie SaaS marketing site analytics across 41 teardowns and validated against ContentSquare and Hotjar published benchmarks for SaaS marketing pages.",
    lastVerified: "2026-05-19",
  },
  {
    slug: "first-customer-time",
    metric: "time to first paying customer",
    metaTitle: "Time to First Paying Customer (Indie SaaS Benchmarks)",
    metaDescription:
      "Indie SaaS time-to-first-customer sits at 3 to 16 weeks post-launch. Faster than 3 weeks usually means warm-network; slower than 16 weeks suggests positioning problem.",
    aeoAnswer:
      "Time from launch to first paying customer for indie SaaS sits between 3 and 16 weeks. Faster than 3 weeks almost always means the customer came from the founder's warm network, not cold acquisition. Slower than 16 weeks suggests a positioning or product-fit issue that the diagnostic can surface.",
    bands: [
      {
        label: "Underperforming",
        range:
          "Over 16 weeks post-launch with no paying customer",
        diagnosis:
          "The marketing layer isn't compounding. Almost always a Wrong Person diagnosis (positioning attracts the wrong cohort) or a Weak Offer diagnosis (the price-value math doesn't add up). The diagnostic surfaces which.",
      },
      {
        label: "Typical range",
        range:
          "3 to 16 weeks post-launch",
        diagnosis:
          "Normal indie SaaS first-customer timeline. The funnel is doing some work; refinements move the needle. Founder-led outreach to warm network often accelerates the first 2 to 5 customers.",
      },
      {
        label: "Outperforming",
        range:
          "Under 3 weeks post-launch",
        diagnosis:
          "Almost always warm-network sale. Verify: is the customer someone you knew before launch? If yes, the cold-acquisition clock hasn't actually started.",
      },
    ],
    drivers: [
      "Warm network outreach (the dominant driver early)",
      "Product-positioning fit",
      "Pricing visibility on the marketing site",
      "Founder-led sales motion (manual close, no automation)",
      "Acquisition channel selection",
    ],
    misreadings: [
      "Counting friends and family payments as cold-traffic conversions. They're not.",
      "Comparing to public 'first customer in 24 hours' stories. Survivorship bias.",
      "Reading first-customer time without separating B2C from B2B. B2B sales cycles are structurally longer.",
    ],
    faqs: [
      {
        q: "How long should I wait before declaring my SaaS broken?",
        a: "12 to 16 weeks post-launch with zero cold-acquired paying customers is the warning threshold. Below that, you're still in the normal indie SaaS first-customer window. Above that, the diagnostic almost always finds a fixable upstream issue.",
      },
      {
        q: "Should I reach out to my warm network for the first customer?",
        a: "Yes, almost always. The first 2 to 5 customers should come from warm outreach. This is not 'cheating' the metric – it's how almost every successful indie SaaS gets started. Cold acquisition compounds after the warm cohort is exhausted.",
      },
      {
        q: "What if I have no warm network?",
        a: "Build one before launching, by becoming useful in one specific community for 60 to 90 days. The Brunson Dream 100 pattern formalizes this: name 100 specific people in your target cohort, become useful to them, then sell to them. Cold acquisition without warm network roots takes 2 to 4x as long.",
      },
    ],
    sourceNote:
      "Range based on observed indie SaaS launches across the founder's teardown dataset, Lenny Rachitsky's 0-to-1 founder survey, OpenView Partners' early-stage SaaS report, and IndieHackers public timeline data.",
    lastVerified: "2026-05-20",
  },
  {
    slug: "annual-vs-monthly-discount",
    metric: "annual vs monthly discount",
    metaTitle: "Optimal Annual vs Monthly Discount (SaaS Pricing Benchmarks)",
    metaDescription:
      "Optimal annual-vs-monthly discount sits at 15% to 25% for indie SaaS. Deeper discounts attract price-shoppers; shallower discounts don't shift behavior.",
    aeoAnswer:
      "Optimal annual-vs-monthly discount for indie SaaS sits between 15% and 25%. Shallower (under 10%) doesn't shift purchasing behavior toward annual; deeper (over 35%) attracts price-shoppers who treat the discount as the value rather than the annual commitment. The 'two months free' framing (16.7% discount) is a common sweet spot.",
    bands: [
      {
        label: "Underperforming",
        range:
          "Under 10% annual discount or over 35% annual discount",
        diagnosis:
          "Shallow discount fails to incentivize annual choice; deep discount attracts wrong cohort and damages annual customer LTV. Re-anchor in the 15 to 25% band.",
      },
      {
        label: "Typical range",
        range:
          "15% to 25% annual discount",
        diagnosis:
          "Healthy annual discount. Customers self-select into annual when the discount feels like real savings without screaming 'price-shopper bait'.",
      },
      {
        label: "Outperforming",
        range:
          "Two months free (16.7%) framing",
        diagnosis:
          "Specific framing that beats generic percentage discounts. 'Two months free' is concrete and easy to picture; '17% off' is abstract. Same math, better conversion.",
      },
    ],
    drivers: [
      "Discount framing (months-free vs percentage)",
      "Annual plan visibility (default to annual or toggle?)",
      "Risk-reversal alignment (matching guarantee for annual)",
      "Tier-by-tier discount consistency",
      "Cancellation policy on annual (prorated or not)",
    ],
    misreadings: [
      "Treating annual conversion as the goal. The real goal is LTV. Heavily-discounted annuals reduce LTV vs monthly-then-upgrade paths.",
      "A/B testing discount depth without considering the cohort attracted. The 25%-discount cohort and the 40%-discount cohort behave differently long-term.",
      "Showing only annual pricing by default. Hiding monthly damages trust; toggle visibility wins.",
    ],
    faqs: [
      {
        q: "Should annual be the default or just an option?",
        a: "Toggle visible, monthly default for most indie SaaS. Hiding monthly damages trust ('what are they hiding?'). 'Save 17% with annual' as a clearly-visible toggle wins for self-serve SaaS under $99/month.",
      },
      {
        q: "Should I offer cancellation refunds on annual plans?",
        a: "Prorated refunds within the first 30 days; no refunds after. This protects against trust-break (the buyer should be able to escape if it doesn't work out) without enabling abuse (returning the annual plan in month 11).",
      },
      {
        q: "What's the right way to upgrade monthly customers to annual?",
        a: "After they've been monthly for 60 to 90 days. Earlier is too soon (they haven't formed a habit); later loses momentum. The Soap Opera Sequence can include an 'annual upgrade offer' at day 75 with a small incremental discount above the standard annual rate.",
      },
    ],
    sourceNote:
      "Range based on ProfitWell's 2024 SaaS pricing research, OpenView's pricing benchmarks, and the founder's observed range across indie SaaS pricing teardowns.",
    lastVerified: "2026-05-19",
  },
];

export const BENCHMARK_SLUGS = BENCHMARK_ENTRIES.map((e) => e.slug);

export function getBenchmarkBySlug(slug: string): BenchmarkEntry | undefined {
  return BENCHMARK_ENTRIES.find((e) => e.slug === slug);
}
