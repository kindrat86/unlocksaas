/**
 * /retention-tactic/[slug] pSEO catalog — lifecycle-stage retention tactics.
 *
 * Each entry covers ONE retention tactic mapped to a specific lifecycle
 * stage (week-1 retention, month-1, quarter-1, year-1) with the tactic,
 * the metric, when to deploy, and when to retire.
 *
 * Distinct from:
 *   - /checklist (pre-launch verification, not retention)
 *   - /founder-mistake (strategic-level mistakes)
 *   - /skill (founder skills)
 *
 * /retention-tactic is the "what specific thing should I do to keep
 * customers at this stage" surface.
 *
 * Schema: Article + FAQPage + BreadcrumbList. No HowTo because the
 * content is tactic-analysis, not step sequences.
 */

import { SAAS_METRIC_SLUGS } from "./saas-metrics";

export type LifecycleStage =
  | "week-1"
  | "month-1"
  | "quarter-1"
  | "year-1"
  | "ongoing";

export interface RetentionTacticFaq {
  q: string;
  a: string;
}

export interface RetentionTacticEntry {
  slug: string;
  tacticName: string;
  displayName: string;
  metaTitle: string;
  metaDescription: string;
  lifecycleStage: LifecycleStage;
  intro: string;
  /** What the tactic involves doing. */
  whatItIs: string;
  /** Why this stage specifically requires this tactic. */
  whyThisStage: string;
  /** The retention metric this tactic targets. */
  targetMetric: string;
  /** Specific actions to deploy. */
  actions: ReadonlyArray<string>;
  /** When to retire / stop using the tactic. */
  whenToRetire: string;
  /** Common failure modes. */
  failureModes: ReadonlyArray<string>;
  /** Related saas-metric slug. */
  relatedMetricSlug?: string;
  faqs: ReadonlyArray<RetentionTacticFaq>;
  lastVerified: string;
}

export const RETENTION_TACTIC_ENTRIES: ReadonlyArray<RetentionTacticEntry> = [
  {
    slug: "personal-week-1-checkin",
    tacticName: "Personal week-1 check-in",
    displayName: "Retention tactic: personal week-1 check-in",
    metaTitle: "Week-1 Personal Check-In Retention Tactic (SaaS)",
    metaDescription:
      "Why the founder's personal week-1 check-in is the single highest-leverage retention tactic for indie SaaS, and how to do it without templated-feeling outreach.",
    lifecycleStage: "week-1",
    intro:
      "The founder-personal week-1 check-in is the highest-leverage retention tactic for indie SaaS at sub-500 customer scale. One personal email from the founder at day 5-7 produces measurable retention lift and pattern-recognition gold. Most founders skip it because it does not scale; that is exactly why it works.",
    whatItIs:
      "A personal email from the founder to each new customer at day 5-7 post-signup. Not the automated sequence email; a separate, human-written message asking how it is going. No templated language; reference something specific about how the customer is actually using the product.",
    whyThisStage:
      "Week 1 is when new customers decide if the product is worth the work. The founder's check-in lands in that decision window. Customers who get the check-in retain at 1.5-2.5x the rate of customers who do not, in indie SaaS samples.",
    targetMetric:
      "Day-30 retention rate. Cohorts that receive the founder check-in vs cohorts that do not should show 30-50% retention lift at day 30.",
    actions: [
      "Block 30-60 minutes per week to send these emails. Calendar discipline beats reactive sending.",
      "Reference specific data from the customer's usage — features used, integrations connected, content created. Generic 'how's it going?' loses.",
      "Ask ONE question. Multi-question check-ins read as surveys. One question gets one answer.",
      "Reply to replies within 24 hours. The check-in's value is destroyed if the founder does not respond to engagement.",
      "Track the reply rate and the patterns of replies. The patterns shape the product more than any roadmap input.",
    ],
    whenToRetire:
      "Retire as the founder's primary tactic when you cross 100-200 active customers per month — at that volume, personal week-1 check-ins eat the founder's calendar. Replace with founder-signed templated check-ins (using customer data) plus founder-personal for high-value customers only.",
    failureModes: [
      "Templated emails dressed as personal. Customers detect template-style language; the trust loss is worse than no check-in.",
      "Sending the check-in via automation tool with personalization tokens. Tokens fail; customers see '[FIRST_NAME]' literally and the trust evaporates.",
      "Asking for product feedback as the only question. Sometimes appropriate, but generally the customer wants to share their context, not give product feedback.",
      "Not replying to replies. The whole point of the check-in is the conversation; the email itself is the invitation.",
    ],
    relatedMetricSlug: "churn-rate",
    faqs: [
      {
        q: "Is this scalable past 1,000 customers?",
        a: "Not as personal check-ins. Scale by hiring a founder-equivalent customer-success person, by using founder-signed but data-personalized check-ins, or by accepting that some customers do not get founder check-in. Personal-touch retention is the indie advantage; do not abandon it before you have to.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "day-3-activation-nudge",
    tacticName: "Day-3 activation nudge",
    displayName: "Retention tactic: day-3 activation nudge",
    metaTitle: "Day-3 Activation Nudge Retention Tactic (SaaS)",
    metaDescription:
      "How the day-3 activation nudge works to push under-activated customers toward retention. The trigger logic, the message structure, and the failure modes.",
    lifecycleStage: "week-1",
    intro:
      "The day-3 activation nudge is a targeted email sent only to customers who have not hit the activation event by day 3. It is the highest-leverage automated retention tactic because it intervenes exactly at the moment activation is most predictive of long-term retention.",
    whatItIs:
      "An automated email triggered on day 3 post-signup IF the customer has not yet completed the activation event. The email names the next step specifically and offers help. Sent only once; not part of a sequence.",
    whyThisStage:
      "Day 3 is the inflection point. Customers who activate by day 3 retain at 2-3x the rate of customers who do not. Day 3 is also late enough that 'I am still figuring this out' is real, not just first-day overwhelm.",
    targetMetric:
      "Day-7 activation rate among customers who received the nudge. Should be 30-50% higher than the no-nudge baseline cohort.",
    actions: [
      "Define activation specifically. '3+ feature uses', 'first integration connected', 'first invitation sent' — be concrete.",
      "Set up the trigger: day 3 AND activation_event_completed = false. Day 3 means 72 hours after signup, not midnight on day 3.",
      "Write the email naming the specific next step. Not 'Have you tried features X, Y, Z?' but 'Connect your Stripe to unlock the dashboard'.",
      "Include a one-click path to the action. Email-to-product friction kills the nudge's effect.",
      "Track open rate, click rate, and resulting activation. If the nudge does not lift activation, redesign it.",
    ],
    whenToRetire:
      "Retire only if activation rate without the nudge exceeds 75% — at that point the under-activated cohort is small enough to ignore. Otherwise the nudge produces measurable retention lift indefinitely.",
    failureModes: [
      "Generic 'getting started' email. The nudge needs to reference the customer's specific stuck point.",
      "Multiple nudges in sequence. One day-3 nudge is helpful; a day-3, day-5, day-7 sequence reads as nagging.",
      "Nudge fires before user is ready. Day-3 is the floor; day-1 nudges are usually premature.",
    ],
    relatedMetricSlug: "churn-rate",
    faqs: [
      {
        q: "Should the nudge come from the founder or be branded?",
        a: "Founder-signed at indie SaaS scale. Brand-signed at $10k+ MRR where the founder cannot personally write each one. The trust difference is measurable.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "month-1-feedback-call",
    tacticName: "Month-1 feedback call",
    displayName: "Retention tactic: month-1 feedback call",
    metaTitle: "Month-1 Customer Feedback Call Retention Tactic",
    metaDescription:
      "Why the month-1 feedback call is one of the most under-rated retention tactics, how to run it without it feeling like sales, and what to do with the feedback.",
    lifecycleStage: "month-1",
    intro:
      "The month-1 feedback call is a structured 20-minute call with customers around day 25-35. It produces real retention lift (customers who do calls churn 30-50% less in indie SaaS samples) and produces the highest-quality product feedback the team will receive.",
    whatItIs:
      "An optional 20-minute call offered to customers at day 25-35. The founder runs it. The call is not a sales call, not a support call, not a feature-pitch — it is a structured conversation about how the customer is using the product and what is hard about it.",
    whyThisStage:
      "Month 1 is when customers either fully adopt or start to drift. The feedback call lands in the adoption window and produces two outcomes: customers feel valued and adopt deeper; the founder hears the specific friction at month 1 and addresses it product-wide.",
    targetMetric:
      "Month-3 retention rate among call-takers vs non-call-takers. Should show 20-40% retention lift at month 3 in well-run indie SaaS feedback-call programs.",
    actions: [
      "Send the invitation at day 25 with a Cal.com link. Frame as 'I'd love to hear how it's going' — not as 'feedback session'.",
      "Run the call with three structural questions: (1) What were you doing before this product? (2) What is still hard? (3) What would you want from this product in 6 months?",
      "Take notes during the call. Patterns across 20 calls shape the product more than any roadmap exercise.",
      "Follow up within 48 hours with a thank-you and any specific action items from the conversation.",
      "Aggregate insights monthly. The cross-call patterns are the gold; individual call insights are anecdotes.",
    ],
    whenToRetire:
      "Never fully retire — but scale changes the format. At 0-50 customers: founder does every call. At 50-200: founder does selected calls; CS or hired help does the rest. At 200+: structured survey + targeted founder calls.",
    failureModes: [
      "Treating the call as sales or upgrade pitch. Customers smell it immediately; trust drops.",
      "Skipping the notes. The single biggest waste of customer-call time.",
      "Calls without an agenda. Loose calls do not produce signal; founders feel they 'had a nice conversation' and learn nothing.",
      "Calls only for paying customers. Calls with churned customers produce equally valuable (often more valuable) signal.",
    ],
    relatedMetricSlug: "churn-rate",
    faqs: [
      {
        q: "Should I record the calls?",
        a: "Ask permission. Most customers say yes if asked plainly. Recordings allow re-listening for nuance and pattern-matching weeks later.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "milestone-celebration",
    tacticName: "Customer milestone celebration",
    displayName: "Retention tactic: customer milestone celebration",
    metaTitle: "Customer Milestone Celebration Retention Tactic (SaaS)",
    metaDescription:
      "How the milestone celebration tactic works to deepen retention. The triggers, the personalization that matters, and the failure modes.",
    lifecycleStage: "ongoing",
    intro:
      "Milestone celebration is the practice of noticing and acknowledging when customers hit meaningful moments in their use of the product — their 100th customer in your CRM, their 10,000th visitor, their first $1k in revenue through your tool. The tactic produces retention lift via felt recognition; done well it produces shareable moments customers tell other people about.",
    whatItIs:
      "Automated triggers that fire when customers cross specific usage thresholds, paired with a personalized message from the founder acknowledging the moment. Optional: a small physical or digital gift, a badge, or a public spotlight (with customer permission).",
    whyThisStage:
      "Milestones are emotionally charged moments in customer-product relationships. The customer feels something happened; the founder noticing reinforces the connection between the customer's success and the product's role.",
    targetMetric:
      "Retention rate among milestone-celebrated customers vs same-stage non-celebrated customers. Should show 10-30% retention lift over the following quarter.",
    actions: [
      "Identify 3-5 meaningful customer milestones unique to your product. Generic 'happy birthday' loses; specific 'your 100th customer' wins.",
      "Set up automated triggers when customers cross these milestones.",
      "Pair each trigger with a personal note (founder-signed). The note is the work; the trigger is the timing.",
      "Optional: small physical gift for very high-value milestones (book, handwritten card, branded merchandise). Most indie SaaS skip this; it scales surprisingly well.",
      "Track which milestones produce highest emotional response (replies, shares, referrals). Lean into those.",
    ],
    whenToRetire:
      "Retire individual milestones when they no longer feel meaningful (your 100th customer matters; your 12th probably does not). Refresh the milestone list annually based on what is happening in your customer base.",
    failureModes: [
      "Generic congratulatory messages. 'Congratulations on your milestone!' loses to 'You just sent your 1000th email through us — that's the volume where deliverability really pays off'.",
      "Over-celebrating. Customers stop responding if every interaction with the product is a celebration.",
      "Automated celebration without personal touch. Personalization is what makes the moment feel real.",
    ],
    faqs: [
      {
        q: "What is the right milestone density?",
        a: "3-5 milestones per customer lifecycle is enough. Most are skipped if there are more than 7-8.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "quarterly-revisit-email",
    tacticName: "Quarterly revisit email",
    displayName: "Retention tactic: quarterly revisit email",
    metaTitle: "Quarterly Revisit Email Retention Tactic (SaaS)",
    metaDescription:
      "How the quarterly revisit email works as a re-engagement retention tactic, what it should contain, and when to use it.",
    lifecycleStage: "quarter-1",
    intro:
      "The quarterly revisit email is a founder-signed message every 90 days summarizing the customer's progress, the product's progress, and one specific suggestion for the next quarter. Combines retention work with relationship-building; scales further than personal check-ins.",
    whatItIs:
      "An automated-but-personalized email every quarter to active customers. Contains: their usage stats over the quarter, what new features shipped, one specific suggestion for them, and a one-question open-text reply prompt.",
    whyThisStage:
      "After month 1, customer-founder contact frequency drops. Quarter-2 customers retain at lower rates partly because they feel unseen. The revisit email re-engages without being needy; founders who run this tactic well see year-2 retention 15-25% higher than founders who do not.",
    targetMetric:
      "Quarter-over-quarter retention. The revisit email targets the transition from quarter 1 to quarter 2 specifically (where many silent-churners happen).",
    actions: [
      "Set up the quarterly send 90 days from each customer's signup date.",
      "Personalize with the customer's usage data — actual feature usage, actual progress made.",
      "Include ONE specific suggestion based on their usage pattern. Generic 'try our new features' loses.",
      "End with a one-question prompt that begs a reply. 'What is the one thing about the product you wish worked differently?' beats 'How are we doing?'.",
      "Reply to every reply. The replies are the value.",
    ],
    whenToRetire:
      "Do not retire; refine. The quarterly cadence is the retention scaffolding for customer years 1-3. Adjust the content as the relationship matures.",
    failureModes: [
      "Generic 'thanks for being a customer' emails. The personalization on usage data is what makes the email feel honest.",
      "Including a sales pitch. The revisit email is for relationship; promo emails go in a different lane.",
      "No reply from the founder to customer replies. Single biggest waste.",
    ],
    relatedMetricSlug: "net-revenue-retention",
    faqs: [
      {
        q: "Should this email come from the founder or from the brand?",
        a: "Founder-signed at sub-1,000 customers. Brand-signed (with founder photo + signature) above that scale. The founder voice is the retention lift; do not abstract it away too early.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "win-back-after-cancel",
    tacticName: "Win-back after cancellation",
    displayName: "Retention tactic: win-back after cancellation",
    metaTitle: "Win-Back After Cancel Retention Tactic (SaaS)",
    metaDescription:
      "How the post-cancel win-back tactic works, the timing of the outreach, the message structure, and the realistic win-back rates.",
    lifecycleStage: "ongoing",
    intro:
      "The post-cancel win-back is the structured outreach to customers who have canceled, asking what went wrong and offering a path back. Realistic win-back rates are 5-15%; the more valuable output is the cancel-reason data, which reshapes the product's retention work.",
    whatItIs:
      "An automated trigger when a customer cancels: an immediate cancel-confirmation, followed by a founder-personal email 2-3 days later asking what went wrong and offering to help (not asking them to return — asking what would have helped). At 30 and 90 days, a soft 're-engage if interested' message.",
    whyThisStage:
      "Cancellation is the moment the customer has decided. Win-back is not about overcoming the decision; it is about learning from it and leaving the relationship open. Customers who churn well sometimes return; customers who churn badly never do.",
    targetMetric:
      "Win-back rate at 90 days post-cancel. 5-15% realistic for honest win-backs; above 20% suggests the cancellation was premature (which is its own product-fit signal).",
    actions: [
      "Send the immediate cancel-confirmation acknowledging the cancellation cleanly. No 'are you sure?' interstitial — they decided.",
      "Send the founder-personal email at day 2-3: 'I noticed you canceled. Without trying to talk you back, what would have made the product work for you?' Open-ended; no pitch.",
      "Read every reply. The cancel-reasons are the highest-signal product feedback the team gets.",
      "Send a soft 're-engage' message at day 30 and day 90. 'No pressure — wanted to share that we shipped [SPECIFIC RELEVANT THING] in case it changes the picture.'",
      "Track the patterns across cancellation reasons. The pattern shapes the next quarter's roadmap.",
    ],
    whenToRetire:
      "Never retire; refine. Win-back is structural for SaaS that has any customers. The format can evolve as cancellation volume grows.",
    failureModes: [
      "Treating win-back as sales. 'Come back, here's a 50% discount' produces win-back at the cost of the cohort's long-term unit economics. Discount win-backs churn again within 60 days.",
      "Aggressive multi-touch sequences after cancel. The customer's first email after cancel should be ack; the second can be feedback-ask; the third can be a soft re-engage. Anything more reads as predatory.",
      "Not reading the cancel reasons. The cancel-reason data is more valuable than the win-back conversion.",
    ],
    faqs: [
      {
        q: "Should I offer a discount to win them back?",
        a: "Almost never. Discount-induced returns churn again at 1.5-2x the rate of full-price customers. If the product fit is right, no discount needed; if the fit is wrong, no discount fixes it.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "annual-renewal-prompt",
    tacticName: "Annual renewal prompt",
    displayName: "Retention tactic: annual renewal prompt",
    metaTitle: "Annual Renewal Prompt Retention Tactic (SaaS)",
    metaDescription:
      "How to handle the annual renewal moment honestly — the 30-day-out email, the value summary, and the failure modes.",
    lifecycleStage: "year-1",
    intro:
      "Annual renewals are the make-or-break moment for SaaS with yearly contracts. The renewal-prompt tactic is the structured 30-day-out outreach combining transparent renewal reminder, year-in-review value summary, and renewal-or-pause options. Done well it produces 70-85% renewal rates; done badly it produces refund-rage and public complaints.",
    whatItIs:
      "A scheduled email 30 days before annual renewal containing: the renewal date, the renewal amount, a year-in-review summary of the customer's usage and outcomes, and clear options (auto-renew, pause, cancel). Followed by a 7-day reminder and a 1-day final reminder.",
    whyThisStage:
      "Annual renewals concentrate retention into one decision moment. Customers who feel surprised by the charge refund-rage; customers who feel informed and valued renew. The prompt is the difference between the two.",
    targetMetric:
      "Annual renewal rate. Healthy indie SaaS sits at 70-85% for annual; 90%+ is excellent and usually correlates with strong product-market fit. Below 60% suggests a fit problem.",
    actions: [
      "Send the 30-day-out email first. Include the renewal date, the renewal amount, and a one-sentence summary of the customer's year of usage.",
      "Make the year-in-review summary specific. 'You sent 1,847 emails through us this year' beats 'You've used the product a lot'.",
      "Offer clear options: continue, pause for 30 days, switch to monthly, cancel. Not all four for every customer — but make the path obvious.",
      "Send the 7-day reminder. Same content, urgency increment.",
      "Send the 1-day reminder with a final option to make changes.",
      "Auto-renew on the renewal date and send a clean receipt.",
    ],
    whenToRetire:
      "Never retire for annual customers; the renewal moment exists structurally.",
    failureModes: [
      "Silent auto-renewal with no warning. Refund-rage; customer chargebacks; bad reviews. Single biggest annual-renewal failure.",
      "Renewal emails that read as sales upsell. The customer is already paying; the email is service, not sales.",
      "Annual auto-renewal at a price they did not consent to (price increase at renewal). The renewal email must show the new price clearly with notice.",
    ],
    relatedMetricSlug: "net-revenue-retention",
    faqs: [
      {
        q: "Can I raise prices at renewal?",
        a: "Yes, with at least 60 days' notice and clear communication. Grandfathered customers keep current price for the period agreed; new price applies to next year. Surprise price increases at renewal produce refunds and complaints.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "feature-deprecation-notice",
    tacticName: "Feature deprecation notice",
    displayName: "Retention tactic: feature deprecation notice",
    metaTitle: "Feature Deprecation Notice Retention Tactic (SaaS)",
    metaDescription:
      "How to handle feature deprecation without losing trust. The 60-day-out notice, the migration path, and the failure modes.",
    lifecycleStage: "ongoing",
    intro:
      "Feature deprecation is a structural retention risk — customers who rely on a removed feature churn-rage. The retention tactic is the 60-day-out notice plus migration support, plus a tail period for the most-dependent customers. Done well it preserves the trust; done badly it produces public complaints that hurt acquisition for years.",
    whatItIs:
      "Structured communication 60+ days before a feature is removed: email to all affected customers, in-product banner, public changelog post, migration documentation, and (for high-usage customers) a personal outreach. The feature is removed only after the notice period and confirmed migration.",
    whyThisStage:
      "Customers do not notice feature deprecations until they need the feature. The 60-day notice ensures they notice before it matters. Communication, not the deprecation itself, is the retention work.",
    targetMetric:
      "Post-deprecation churn rate among affected customers. Should be within 2 percentage points of baseline churn; higher suggests the deprecation communication or migration path failed.",
    actions: [
      "Identify the customers affected by usage data, not by feature toggle. Customers who 'have access' but never use are not affected; customers who use weekly are heavily affected.",
      "Send the email 60+ days before deprecation. Title: 'We're sunsetting [FEATURE]. Here's what changes for you.'",
      "Include a migration path. What should the customer do instead, with specific instructions.",
      "Place an in-product banner for affected customers, removable but persistent.",
      "Personal outreach to heavy users. Their cooperation is the migration's lift.",
      "Extend the deadline if migration is going slowly. Hard deadlines on customer migrations rarely work; soft deadlines with clear expectations do.",
    ],
    whenToRetire:
      "Never retire — feature deprecations happen throughout product lifecycle.",
    failureModes: [
      "30-day notice. Not enough time for customers to migrate; produces churn-rage.",
      "Vague migration path. 'Use feature Y instead' without specifics fails on customers whose workflow does not map cleanly.",
      "Removing the feature on the named date regardless of migration progress. Hard date enforcement on retention-critical features burns trust.",
    ],
    faqs: [
      {
        q: "What if some customers are still using the feature on deprecation day?",
        a: "Extend the deadline for those customers specifically. The cost of one more month of running the feature is small; the cost of churning the customers is large.",
      },
    ],
    lastVerified: "2026-05-19",
  },
];

export const RETENTION_TACTIC_SLUGS: ReadonlyArray<string> =
  RETENTION_TACTIC_ENTRIES.map((e) => e.slug);

export function getRetentionTacticBySlug(
  slug: string,
): RetentionTacticEntry | undefined {
  return RETENTION_TACTIC_ENTRIES.find((e) => e.slug === slug);
}

export const LIFECYCLE_STAGES = [
  "week-1",
  "month-1",
  "quarter-1",
  "year-1",
  "ongoing",
] as const;

export const LIFECYCLE_STAGE_LABELS: Record<LifecycleStage, string> = {
  "week-1": "Week 1",
  "month-1": "Month 1",
  "quarter-1": "Quarter 1",
  "year-1": "Year 1 / annual renewal",
  ongoing: "Ongoing",
};

// Build-time guard: every relatedMetricSlug must resolve.
{
  const knownMetrics = new Set<string>(SAAS_METRIC_SLUGS);
  for (const entry of RETENTION_TACTIC_ENTRIES) {
    if (entry.relatedMetricSlug && !knownMetrics.has(entry.relatedMetricSlug)) {
      throw new Error(
        `retention-tactics.ts: entry "${entry.slug}" references unknown saas-metric slug "${entry.relatedMetricSlug}".`,
      );
    }
  }
}
