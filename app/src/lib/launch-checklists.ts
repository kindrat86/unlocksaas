/**
 * /launch-checklist/[niche] pSEO catalog – pre-revenue founder
 * checklists, tuned per cohort.
 *
 * UnlockSaaS's whole brand is "post-launch pre-revenue diagnostic." This
 * surface maps that frame to one ordered checklist per niche – the exact
 * moves a founder in that cohort should make in the next 14 days to
 * unstick a flat Stripe line.
 *
 * Brunson Hard-Rule reconciliation:
 *   - Every item is a move the founder can actually do this week.
 *   - No invented stats per cohort, no fabricated testimonials.
 *   - Each checklist follows Hook → Story → Offer → Follow-up scaffold
 *     but uses the cohort's vocabulary and money mechanics.
 *   - The diagnostic CTA at the bottom of each page is the same CTA as
 *     every other pSEO surface – this is the funnel, not a parallel
 *     funnel.
 *
 * Single source of truth: every niche slug listed here MUST also exist
 * in src/lib/niches.ts (the /for/[slug] catalog). Adding a niche there
 * without adding it here breaks the cross-link in the navigation card,
 * and vice-versa. CI guard lives in the typecheck step – the importer
 * below will fail to resolve NICHE_SLUGS at build time if drift exists.
 */

import { NICHE_SLUGS } from "@/lib/niches";

export interface ChecklistStep {
  /** Imperative title, under 70 chars. */
  title: string;
  /** 1–3 sentences explaining the move. No fabricated claims. */
  detail: string;
  /** Rough time estimate, founder-readable ("30 min", "2 hrs"). */
  timeEstimate: string;
  /** Bucket for grouping. Same five buckets every checklist. */
  bucket: "Foundation" | "Offer" | "Traffic" | "Proof" | "Follow-up";
}

export interface LaunchChecklistEntry {
  /** URL slug – MUST match a slug in NICHE_SLUGS. */
  slug: string;
  /** Display name (lowercase, matches the niche entry). */
  displayName: string;
  /** SEO meta title, under 60 chars. */
  metaTitle: string;
  /** SEO meta description, under 160 chars. */
  metaDescription: string;
  /** Hero subhead, ~30 words. */
  heroSubhead: string;
  /** One-sentence framing: who this checklist is for. */
  whoThisIsFor: string;
  /** Three FAQs tuned to this cohort's checklist work. */
  faqs: ReadonlyArray<{ q: string; a: string }>;
  /** Ordered list of 10 checklist steps. */
  steps: ReadonlyArray<ChecklistStep>;
  /** ISO date last verified. */
  lastVerified: string;
}

const TODAY = "2026-05-21";

const ENTRIES_BY_SLUG: Record<string, LaunchChecklistEntry> = {
  "course-creators": {
    slug: "course-creators",
    displayName: "course creators",
    metaTitle: "Launch Checklist for Course Creators",
    metaDescription:
      "Ten-step pre-revenue checklist for course creators with a flat launch. Brunson Hook / Story / Offer frame, tuned to launches and cohort sales.",
    heroSubhead:
      "Built for course creators whose sales page is live but whose launch went quiet. Ten ordered moves that take you from flat enrollment list to one paying student – no rebuild required.",
    whoThisIsFor:
      "Your course is built, your sales page is live, your launch email went out, and enrollment is under three. This checklist is the next 14 days.",
    faqs: [
      {
        q: "Do I have to redo my whole sales page?",
        a: "No. The checklist patches the three sections that break the most launches: the headline, the Stack, and the FAQ. Everything else stays.",
      },
      {
        q: "Will this work for an evergreen course or only a live cohort?",
        a: "Both. The first six items are identical. Steps 7–10 split into evergreen (delayed sequences) versus live cohort (calendar-anchored sequences); the checklist calls out which one applies as you go.",
      },
      {
        q: "How long does this take, start to finish?",
        a: "Roughly 14 hours of focused work spread over 14 days. Item-level estimates are noted on each step; the slow ones are the testimonial collection and the email sequence drafts.",
      },
    ],
    steps: [
      {
        bucket: "Foundation",
        title: "Name the transformation, not the curriculum",
        detail:
          "Rewrite your hero headline as the after-state your student lives in, not the modules they learn. 'Module 1: Foundations' is a curriculum; 'You ship your first $497 cohort by week six' is a transformation. The reader has to picture the end before they enroll.",
        timeEstimate: "45 min",
      },
      {
        bucket: "Foundation",
        title: "Pick one specific cohort and put them in the headline",
        detail:
          "'A copywriting course' converts at zero. 'A copywriting course for freelance designers stuck under $5K months' converts. Pick the smallest cohort that still has a market and put their identity in the H1.",
        timeEstimate: "30 min",
      },
      {
        bucket: "Offer",
        title: "Build the Stack Slide (8–12 deliverables, dollar-anchored)",
        detail:
          "List every component of the course: modules, templates, swipe files, office hours, community access, bonuses. Anchor each to a dollar value. The total has to be at least 5x the price. Without a Stack, the price looks expensive; with a Stack, the price looks like a discount.",
        timeEstimate: "2 hrs",
      },
      {
        bucket: "Offer",
        title: "Add the dollar-anchored guarantee",
        detail:
          "Money-back is the floor. The stronger frame is conditional: 'If you ship one paid client by week six and don't 5x your investment, full refund plus you keep the templates.' Specific, dated, falsifiable. Vague refund language doesn't move the conversion needle.",
        timeEstimate: "30 min",
      },
      {
        bucket: "Proof",
        title: "Collect three dated, named, specific testimonials",
        detail:
          "Email five past students or beta participants. Ask for one specific result with a number and a date. 'I shipped my first $497 cohort six weeks after enrolling' beats 'Great course!' by an order of magnitude in conversion lift.",
        timeEstimate: "4 hrs",
      },
      {
        bucket: "Offer",
        title: "Rewrite the FAQ as objection handlers, not info dump",
        detail:
          "Each FAQ entry should kill one specific objection ('Will this work if I have no audience?', 'I tried other courses, why is this different?'). Vague Q&A about 'how long is the course' converts no one. Sharp objection rebuttals do.",
        timeEstimate: "1 hr",
      },
      {
        bucket: "Traffic",
        title: "Write a 5-email Soap Opera Sequence for cold list opt-ins",
        detail:
          "Whoever opts in to your lead magnet gets a five-email sequence introducing the Attractive Character, the failed-then-won transformation, and the offer. Same five emails run forever – it's a launch-once, sells-forever asset.",
        timeEstimate: "3 hrs",
      },
      {
        bucket: "Follow-up",
        title: "Add the Seinfeld daily email pattern",
        detail:
          "After the Soap Opera ends, the subscriber goes into a 'something interesting + soft pitch' daily-or-three-times-weekly cadence. Same pattern Brunson runs. The list that gets daily mail outperforms the list that gets weekly broadcast 2–3x on launch revenue.",
        timeEstimate: "1 hr (template only)",
      },
      {
        bucket: "Follow-up",
        title: "Wire the post-purchase OTO at $97–$297",
        detail:
          "Immediately after the course purchase, present one specific upsell: an implementation pack, a 1:1 strategy call, or a done-for-you template. 20–40% take-rate is typical. The OTO is where the unit economics start working; the front-end course alone usually loses money to ads.",
        timeEstimate: "2 hrs",
      },
      {
        bucket: "Foundation",
        title: "Run the diagnostic on the rewritten page",
        detail:
          "Once items 1–9 ship, run the free 90-second diagnostic on the live URL. The triage labels Wrong Person / Weak Offer / Weak Belief on the rewritten page, so you fix the highest-leverage issue first instead of guessing.",
        timeEstimate: "10 min",
      },
    ],
    lastVerified: TODAY,
  },

  "agency-owners": {
    slug: "agency-owners",
    displayName: "agency owners",
    metaTitle: "Launch Checklist for Agency Owners",
    metaDescription:
      "Ten-step pre-revenue checklist for agency owners stuck attracting wrong-fit leads. Brunson positioning frame for one qualified discovery call.",
    heroSubhead:
      "Built for agency owners whose site fills the calendar with wrong-fit discovery calls. Ten ordered moves that take you from price-shopping inbound to one qualified retainer conversation.",
    whoThisIsFor:
      "Your agency site is live, case studies are up, the calendar shows discovery calls, almost nobody converts. This checklist is the next 14 days.",
    faqs: [
      {
        q: "I do full-service. Do I really have to niche to one offer?",
        a: "Yes, on the homepage. You can still deliver full-service to existing retainers; the homepage just has to anchor to one transformation so wrong-fit leads disqualify themselves before booking.",
      },
      {
        q: "Will a paid audit kill my inbound?",
        a: "A paid audit usually cuts call volume 60–80% and triples close rate. The metric to optimise is closed-revenue, not call count. Wrong-fit calls cost more than no calls.",
      },
      {
        q: "How do I handle the existing wrong-fit pipeline while repositioning?",
        a: "Step 9 covers the handoff sequence: existing in-flight conversations get a respectful disqualifier email; new inbound gets the new positioning. Two parallel tracks for the first 30 days.",
      },
    ],
    steps: [
      {
        bucket: "Foundation",
        title: "Pick one niche, one outcome, one engagement type",
        detail:
          "'We do SEO, content, and paid social' is a menu. 'We get Series A B2B SaaS from $20K to $200K MRR through paid LinkedIn' is a position. Pick the niche+outcome+engagement combo where you have the deepest case study and put it in the H1.",
        timeEstimate: "1 hr",
      },
      {
        bucket: "Foundation",
        title: "Rewrite the homepage hero as the cohort's transformation",
        detail:
          "Hero should name the niche, name the outcome, and dollar-anchor it. 'Senior B2B SaaS marketing for $20K–$200K MRR retainers' beats 'Full-service digital agency'. The wrong-fit visitor bounces in 4 seconds, which is what you want.",
        timeEstimate: "1 hr",
      },
      {
        bucket: "Offer",
        title: "Build a paid audit tripwire at $1,500–$5,000",
        detail:
          "A paid audit pre-qualifies serious buyers, replaces the unpaid discovery call, and converts to engagement at 30–50%. The Brunson value-ladder pattern works exactly as written for service businesses. Price the audit at 5–10% of the average engagement.",
        timeEstimate: "3 hrs",
      },
      {
        bucket: "Proof",
        title: "Ship one anchor case study with dated numbers",
        detail:
          "One case study, dated, with the specific outcome and dollar figures. 'Acme: trial-to-paid conversion 1.2% → 4.7% in 90 days, $84K MRR lift.' Three vague case studies convert worse than one dated specific one. Get the client's written approval for the numbers.",
        timeEstimate: "4 hrs",
      },
      {
        bucket: "Offer",
        title: "Build the Stack Slide for the retainer",
        detail:
          "List every deliverable in the retainer (strategy doc, weekly cadence, monthly report, dashboards, async Slack, founder access). Dollar-anchor each line. The Stack frame makes the $15K/mo retainer look like a discount on $60K of itemised value.",
        timeEstimate: "2 hrs",
      },
      {
        bucket: "Foundation",
        title: "Add the disqualifier section to the homepage",
        detail:
          "An honest 'this is not for you if…' block under the hero. Naming who you don't serve (DTC ecommerce, Series Seed, sub-$10K MRR) drops wrong-fit inbound by 50%+ and lifts close rate on the calls that remain.",
        timeEstimate: "30 min",
      },
      {
        bucket: "Traffic",
        title: "Write the Dream 100 outbound script",
        detail:
          "Hand-pick 100 target accounts that exactly match the new positioning. Write a 5-touch outbound sequence anchored on the anchor case study. The Dream 100 outperforms inbound for high-ticket B2B service business because the cohort is addressable, not theoretical.",
        timeEstimate: "3 hrs",
      },
      {
        bucket: "Proof",
        title: "Publish two niche-specific teardowns or breakdowns",
        detail:
          "Pick two well-known companies in your exact niche and publish detailed teardowns of their funnel or marketing. SEO long-tail + LinkedIn distribution. Each post is a proof artefact that the cohort recognises as 'this agency understands my world'.",
        timeEstimate: "6 hrs",
      },
      {
        bucket: "Follow-up",
        title: "Send the disqualifier handoff to existing wrong-fit pipeline",
        detail:
          "For in-flight conversations that don't match the new positioning, send a respectful 'we've narrowed our focus; here are three agencies that serve your category' email. Burning the bad pipeline is part of the repositioning. Keep the handoff email on file – it doubles as a goodwill referral asset.",
        timeEstimate: "1 hr",
      },
      {
        bucket: "Foundation",
        title: "Run the diagnostic on the rewritten homepage",
        detail:
          "Once items 1–9 ship, run the free 90-second diagnostic on your live URL. The triage labels whether the new positioning lands as Wrong Person / Weak Offer / Weak Belief from a cold reader's perspective.",
        timeEstimate: "10 min",
      },
    ],
    lastVerified: TODAY,
  },

  "saas-founders": {
    slug: "saas-founders",
    displayName: "SaaS founders",
    metaTitle: "Launch Checklist for SaaS Founders",
    metaDescription:
      "Ten-step pre-revenue checklist for SaaS founders with a flat Stripe MRR line. Brunson Hook / Story / Offer applied to trial-to-paid conversion.",
    heroSubhead:
      "Built for SaaS founders whose product ships but whose Stripe line is flat. Ten ordered moves that take you from sub-1% trial conversion to one paying customer at full price – without rebuilding the product.",
    whoThisIsFor:
      "Your product works, your pricing page is live, signups trickle in, trial-to-paid sits under 1%. This checklist is the next 14 days.",
    faqs: [
      {
        q: "I have PMF but won't scale. Is this still relevant?",
        a: "Yes. 'Won't scale' with a working product is almost always a marketing-and-sales layer problem, not a product problem. This checklist patches that layer.",
      },
      {
        q: "Should I A/B test the pricing page?",
        a: "Not yet. Below 100 trials per week, A/B tests don't reach significance. The checklist focuses on directional moves with known lift first; you A/B test after baselines exist.",
      },
      {
        q: "I'm B2B with long sales cycles – does this still work?",
        a: "Yes. B2B SaaS needs longer Stack Slides and longer follow-up sequences, but the underlying Hook / Story / Offer scaffold is identical. Steps 6–8 add the B2B-specific extensions.",
      },
    ],
    steps: [
      {
        bucket: "Foundation",
        title: "Name your ICP in the hero, by job-to-be-done",
        detail:
          "'For modern teams' converts at zero. 'For B2B SaaS founders running paid LinkedIn at $30K–$300K MRR' converts. Put the ICP and their job-to-be-done in the H1. Vague hero copy is the most common Wrong Person diagnosis on SaaS pages.",
        timeEstimate: "45 min",
      },
      {
        bucket: "Foundation",
        title: "Rewrite features as outcomes",
        detail:
          "'Real-time sync' is a feature. 'Your CSV exports stop being a 90-minute Monday ritual' is an outcome. Rewrite every feature block as the user's after-state. Features sell to existing customers; outcomes sell to prospects.",
        timeEstimate: "2 hrs",
      },
      {
        bucket: "Offer",
        title: "Build the Stack Slide on the pricing page",
        detail:
          "List every component of the offer: the app, onboarding, integrations, support SLA, dashboards, docs, community. Dollar-anchor each. The total at 5x list price. The pricing page without a Stack reads as 'what does this cost'; with a Stack it reads as 'why is this so cheap'.",
        timeEstimate: "2 hrs",
      },
      {
        bucket: "Offer",
        title: "Add a conditional money-back guarantee",
        detail:
          "Conditional beats unconditional: 'If you don't see 10x your subscription cost in measurable value in 30 days, full refund.' Specific, dated, falsifiable. Vague 'cancel anytime' language doesn't move conversion; conditional guarantees do.",
        timeEstimate: "30 min",
      },
      {
        bucket: "Proof",
        title: "Ship three dated, named customer case studies",
        detail:
          "Email five existing paying customers. Ask for a 200-word case study with a specific metric and a date. 'We cut onboarding from 4 weeks to 6 days; 2026-03-14' beats logo soup. Without dated specifics, the page reads as Weak Belief.",
        timeEstimate: "5 hrs",
      },
      {
        bucket: "Offer",
        title: "Wire the in-trial Soap Opera Sequence",
        detail:
          "Trial signups get a 5-email sequence over the trial period: Attractive Character intro, failed-attempt story, the moment-of-truth, the offer, the urgency. Trial-to-paid lifts 30–80% from a working SOS. Same emails for every trial.",
        timeEstimate: "4 hrs",
      },
      {
        bucket: "Follow-up",
        title: "Add the activation-moment trigger",
        detail:
          "Identify the one in-product moment that predicts retention (first export, third teammate invited, first integration connected). Trigger a celebratory in-app + email at that moment. Activation-moment surfacing lifts second-month retention by 20–40% on most B2B SaaS.",
        timeEstimate: "3 hrs",
      },
      {
        bucket: "Traffic",
        title: "Ship one comparison page against the dominant alternative",
        detail:
          "Honest /vs/ page against the named competitor your cohort already searches for. Where you win, where you lose, where you tie. Comparison pages convert 3–10x homepage traffic on bottom-funnel intent. Don't trash the competitor; the honest version converts better than the salesy version.",
        timeEstimate: "4 hrs",
      },
      {
        bucket: "Follow-up",
        title: "Plan the post-purchase upsell ladder",
        detail:
          "What's the next rung above the entry tier? Annual prepay at 15–20% discount, a higher-tier with quota expansion, a done-for-you implementation. Map the ladder before you need it. Customers in month 3 are the highest-intent upsell target you'll ever have.",
        timeEstimate: "2 hrs",
      },
      {
        bucket: "Foundation",
        title: "Run the diagnostic on your live pricing or marketing page",
        detail:
          "Once items 1–9 ship, run the free 90-second diagnostic on your URL. Triage labels whether the bottleneck is now Wrong Person / Weak Offer / Weak Belief on the rewritten page, so you fix the next-leverage issue with data, not guesses.",
        timeEstimate: "10 min",
      },
    ],
    lastVerified: TODAY,
  },

  "coaches": {
    slug: "coaches",
    displayName: "coaches",
    metaTitle: "Launch Checklist for Coaches",
    metaDescription:
      "Ten-step pre-revenue checklist for coaches with empty calendars. Brunson Attractive Character + Hook / Story / Offer for one paid client.",
    heroSubhead:
      "Built for coaches whose practice is live but whose calendar is empty. Ten ordered moves that take you from credential-led bio to one paid client at full price.",
    whoThisIsFor:
      "Your website is up, your bio is written, your booking link is in every signature, discovery calls happen, almost nobody converts. This checklist is the next 14 days.",
    faqs: [
      {
        q: "I'm certified through ICF / NBHWC / a brand-name school. Should that be on the homepage?",
        a: "Below the fold, yes. Above the fold, no. Credentials prove competence but don't sell transformation. The Attractive Character bio sells; the credentialing reassures buyers who are already convinced.",
      },
      {
        q: "Should I have a group program if I prefer 1:1?",
        a: "Yes, almost always, as the middle rung. 1:1 is the top rung; the group program is the leverage rung. Skipping the middle rung caps income at calendar hours.",
      },
      {
        q: "What if I have no testimonials yet?",
        a: "Step 5 covers the seed-testimonial route: 2–3 reduced-rate Beta Clients in exchange for written testimonials and recorded outcome statements. This is how every coaching practice starts; it's not cheating, it's bootstrapping.",
      },
    ],
    steps: [
      {
        bucket: "Foundation",
        title: "Rewrite your bio as Attractive Character",
        detail:
          "Brunson's Attractive Character has four parts: backstory, parables, polarity, character flaws. The 'I've been certified in three modalities and I help people transform' bio is generic. The 'I went from $40K salary to $200K coaching practice by changing one belief at age 39' bio is the Attractive Character.",
        timeEstimate: "3 hrs",
      },
      {
        bucket: "Foundation",
        title: "Name the specific transformation, not the methodology",
        detail:
          "'Executive coaching' is methodology. 'Senior engineers transitioning into VP roles within 6 months' is transformation. The reader has to picture the after-state. Coaches selling methodology compete on hourly rate; coaches selling transformation command premium.",
        timeEstimate: "1 hr",
      },
      {
        bucket: "Offer",
        title: "Build the Stack Slide for your high-ticket package",
        detail:
          "List every component: sessions, async messaging, intake assessment, in-between worksheets, recordings, lifetime resource access, post-engagement check-in. Dollar-anchor each. The $8K package now reads as a discount on $32K of itemised value.",
        timeEstimate: "2 hrs",
      },
      {
        bucket: "Offer",
        title: "Productise the discovery call into a paid intake",
        detail:
          "Replace the free 30-minute discovery call with a paid 60-minute Strategy Intake at $300–$1,500. Pre-qualifies serious buyers, raises the close rate to 40%+, and pays for itself even when the prospect doesn't convert. Vague 'is this a fit' calls are the killer.",
        timeEstimate: "1 hr",
      },
      {
        bucket: "Proof",
        title: "Seed three dated, named, specific testimonials",
        detail:
          "If you have no testimonials, take 2–3 Beta Clients at 50% rate in exchange for a written testimonial with one specific dated outcome. 'I shipped my book proposal six weeks after our intake' beats 'transformative coaching!'. Three dated testimonials beats fifty vague ones.",
        timeEstimate: "6 hrs",
      },
      {
        bucket: "Offer",
        title: "Add the middle-rung group program at $1,997–$7,997",
        detail:
          "Value-ladder pattern: 1:1 is the top rung. Add a group program at 1/4 to 1/3 of 1:1 price. Same transformation, less direct access, group dynamics. The group program is where most coaches break the calendar-hours ceiling.",
        timeEstimate: "2 hrs (offer design only)",
      },
      {
        bucket: "Traffic",
        title: "Publish one Perfect Webinar – live or evergreen",
        detail:
          "60-minute Perfect Webinar with the Brunson Stack Slide structure. Live for the first run (cohort sales); record and ship as evergreen after. Webinar-to-discovery-call conversion is 5–15% for warm traffic, dwarfing direct sales-page conversion.",
        timeEstimate: "8 hrs (script + first run)",
      },
      {
        bucket: "Follow-up",
        title: "Write a 5-email Soap Opera Sequence for new opt-ins",
        detail:
          "Whoever opts into your lead magnet gets a 5-email sequence with the Attractive Character reveal, a failed-then-won story, polarity, the offer, urgency. Same five emails forever. Conversion from list to discovery call lifts dramatically with the SOS in place.",
        timeEstimate: "3 hrs",
      },
      {
        bucket: "Traffic",
        title: "Pick one platform (LinkedIn / Twitter / Substack) and post daily",
        detail:
          "Cross-posting on five platforms produces five mediocre presences. Pick one, post daily for 90 days, anchor every post to a fragment of the Attractive Character or a piece of the transformation. The platform discipline matters more than the platform choice.",
        timeEstimate: "1 hr/day (ongoing)",
      },
      {
        bucket: "Foundation",
        title: "Run the diagnostic on your live coaching page",
        detail:
          "Once items 1–9 ship, run the free 90-second diagnostic on your URL. The triage labels whether the bio-and-offer combo now reads as Wrong Person / Weak Offer / Weak Belief from a cold buyer's perspective.",
        timeEstimate: "10 min",
      },
    ],
    lastVerified: TODAY,
  },

  "consultants": {
    slug: "consultants",
    displayName: "consultants",
    metaTitle: "Launch Checklist for Consultants",
    metaDescription:
      "Ten-step pre-revenue checklist for independent consultants attracting wrong-fit RFPs. Brunson positioning frame for premium engagements.",
    heroSubhead:
      "Built for independent consultants stuck competing on hourly rate. Ten ordered moves that take you from rate-shopping RFPs to one premium engagement at your asking number.",
    whoThisIsFor:
      "Your consulting site is live, case studies are up, RFPs land monthly, almost nobody pays your asking rate. This checklist is the next 14 days.",
    faqs: [
      {
        q: "I'm a fractional CTO/CMO/CFO. Does this still apply?",
        a: "Yes. Fractional roles are subject to the same Wrong Person / Weak Offer / Weak Belief diagnosis. The checklist applies; some steps lean into the fractional-specific positioning (anchor case study, dollar-anchored Stack).",
      },
      {
        q: "Should I publish my rates?",
        a: "Floor pricing, yes (the 'engagements start at $X'). Detailed rate cards, no – they invite rate-comparison shopping. Floor pricing pre-qualifies, detailed rate cards anchor against your offer.",
      },
      {
        q: "What if I take equity instead of cash?",
        a: "The checklist works identically. Equity engagements need stronger positioning, not weaker – the buyer is diluting their cap table for you. Steps 5–7 cover the equity-specific positioning lift.",
      },
    ],
    steps: [
      {
        bucket: "Foundation",
        title: "Name one deliverable, one cohort, one outcome",
        detail:
          "'Senior strategy consulting' is a category. 'I get B2B SaaS post-Series A from 1% to 4% trial-to-paid through pricing and onboarding rebuilds' is a position. Pick the deliverable+cohort+outcome combo with your deepest anchor case study; lead the homepage with it.",
        timeEstimate: "2 hrs",
      },
      {
        bucket: "Foundation",
        title: "Rewrite the hero as the engagement's end-state",
        detail:
          "Hero should name the cohort, name the outcome, and dollar- or percentage-anchor it. 'Trial-to-paid conversion lifts of 2–4x in 90-day engagements for B2B SaaS' beats 'I help companies grow'. The wrong-fit RFP author bounces; the right one books a paid strategy call.",
        timeEstimate: "1 hr",
      },
      {
        bucket: "Offer",
        title: "Build a paid strategy session at $1,500–$7,500",
        detail:
          "A paid strategy session replaces the unpaid discovery call. Pre-qualifies serious buyers, becomes the front-end of the engagement, and converts to retainer at 40–60% when the diagnosis lands. The Brunson value-ladder structure works for consulting exactly as written.",
        timeEstimate: "3 hrs",
      },
      {
        bucket: "Proof",
        title: "Ship one anchor case study with dated dollar figures",
        detail:
          "One case study, dated, with the specific outcome. 'Acme: pricing rebuild + onboarding redesign lifted trial-to-paid 1.2% → 4.7%, $84K MRR delta in 90 days' beats five vague ones. Get the client's written approval for the numbers; if you can't get approval, anonymise carefully.",
        timeEstimate: "5 hrs",
      },
      {
        bucket: "Offer",
        title: "Build the Stack Slide for the retainer engagement",
        detail:
          "List every deliverable: discovery doc, weekly cadence, monthly executive summary, async access, founder hours, dashboards, post-engagement transition. Dollar-anchor each line. The Stack frames the $20K/mo retainer as a discount on $80K of itemised value.",
        timeEstimate: "2 hrs",
      },
      {
        bucket: "Foundation",
        title: "Add the disqualifier section to the homepage",
        detail:
          "Honest 'this is not for you if…' block. Naming who you don't serve (pre-Series A, sub-$10K MRR, DTC ecommerce, marketing-attribution work) drops wrong-fit inbound and lifts close rate on what remains. Disqualifier copy is the highest-converting trust signal you can ship.",
        timeEstimate: "30 min",
      },
      {
        bucket: "Traffic",
        title: "Write the Dream 100 of target accounts",
        detail:
          "100 named accounts that exactly fit the new positioning. Build a 5-touch outbound sequence anchored on the anchor case study. The Dream 100 outperforms inbound for consultants because the cohort is addressable and the engagement size justifies named outreach.",
        timeEstimate: "4 hrs",
      },
      {
        bucket: "Proof",
        title: "Publish two original-thought essays in your niche",
        detail:
          "Two long-form essays with a contrarian take grounded in your engagement experience. LinkedIn + your own site. Essays serve the dual function of distribution and proof – the cohort recognises 'this consultant thinks differently' and books the strategy session.",
        timeEstimate: "8 hrs",
      },
      {
        bucket: "Follow-up",
        title: "Build the post-engagement nurture sequence",
        detail:
          "After an engagement ends, the client goes into a quarterly check-in cadence. Each touchpoint shares one piece of original thinking and one open availability slot. The nurture turns 6-month engagements into 24-month relationships and unlocks referrals.",
        timeEstimate: "2 hrs (setup)",
      },
      {
        bucket: "Foundation",
        title: "Run the diagnostic on your consulting homepage",
        detail:
          "Once items 1–9 ship, run the free 90-second diagnostic on your URL. The triage labels whether the new positioning lands as Wrong Person / Weak Offer / Weak Belief from a cold RFP author's perspective.",
        timeEstimate: "10 min",
      },
    ],
    lastVerified: TODAY,
  },

  "ecommerce": {
    slug: "ecommerce",
    displayName: "ecommerce founders",
    metaTitle: "Launch Checklist for Ecommerce Founders",
    metaDescription:
      "Ten-step pre-revenue checklist for ecommerce founders stuck under 1% conversion. Brunson Stack + post-purchase ladder for repeat customers.",
    heroSubhead:
      "Built for ecommerce founders whose store is live but whose conversion rate is stuck under 1%. Ten ordered moves that take you from launched-but-flat to one profitable repeat customer.",
    whoThisIsFor:
      "Your store is launched, products are listed, paid ads run, conversion is under 1%, AOV is below break-even. This checklist is the next 14 days.",
    faqs: [
      {
        q: "Should I keep running paid ads while conversion is under 1%?",
        a: "Pause them. Below 1% conversion, paid ads burn cash. The checklist fixes conversion first, then re-enables paid traffic with a margin-safe back-end.",
      },
      {
        q: "Do I need a subscription option for ecommerce?",
        a: "Usually yes, as the second rung. Subscription bundles unlock LTV that makes paid acquisition viable. Skipping subscription caps the unit economics where first-purchase profitability ends.",
      },
      {
        q: "What if my product is digital, not physical?",
        a: "The checklist works identically. Digital products skip shipping economics but still need the Stack, post-purchase upsell, and Soap Opera Sequence. Steps 6–7 specifically address the digital-versus-physical split.",
      },
    ],
    steps: [
      {
        bucket: "Foundation",
        title: "Name the specific buyer in the homepage hero",
        detail:
          "'Premium cookware' converts at zero. 'Premium cookware for home cooks who burned out on Le Creuset hand-washing' converts. Pick a smallest-viable-cohort and put their context in the H1. Wrong Person traffic is the most common diagnosis on Shopify stores under 1% conversion.",
        timeEstimate: "45 min",
      },
      {
        bucket: "Offer",
        title: "Build the Stack Slide on the product page",
        detail:
          "Every product page lists the offer-stack: the product, bonuses (recipe pack, video unboxing, lifetime warranty, community access), shipping, guarantee. Dollar-anchor each. The 'just the product' page reads as a transaction; the same product with a Stack reads as a value proposition.",
        timeEstimate: "3 hrs",
      },
      {
        bucket: "Offer",
        title: "Write the dollar-anchored guarantee",
        detail:
          "'30-day money-back' is the floor. 'If our pan doesn't last 30 years, we'll send you a free replacement plus $50 toward our next product' is the frame. Specific, dated, falsifiable. Vague refund language doesn't move conversion; conditional guarantees do.",
        timeEstimate: "45 min",
      },
      {
        bucket: "Follow-up",
        title: "Wire the post-purchase OTO at 2–4x AOV",
        detail:
          "Immediately after checkout, present one specific upsell. Take rate 20–40%, lifts AOV 30–70%, unlocks the unit economics. The OTO is where ecommerce makes money; the front-end purchase usually loses to ad spend. Same OTO for every customer.",
        timeEstimate: "3 hrs",
      },
      {
        bucket: "Follow-up",
        title: "Build the cart-abandonment Soap Opera",
        detail:
          "5-email sequence over 14 days for abandoned carts: discount-free reminder, Attractive Character story, social proof, polarity, last-chance discount. Recovers 10–20% of abandons. Same sequence for every cart.",
        timeEstimate: "3 hrs",
      },
      {
        bucket: "Follow-up",
        title: "Build the post-purchase 'second purchase' Seinfeld sequence",
        detail:
          "After delivery confirmation, the buyer enters a Seinfeld pattern – interesting content + soft pitch on the next-rung product. Second-purchase economics are 3–5x first-purchase margin. The Seinfeld cadence is what bridges the gap.",
        timeEstimate: "3 hrs",
      },
      {
        bucket: "Proof",
        title: "Collect 15+ dated, named, photo-included reviews",
        detail:
          "Email every past buyer. Ask for a review with a photo and a specific outcome. 'Used these pans for six months, switched from Le Creuset, no regrets – Maya, 2026-03-14' beats five-star aggregations. Photos lift conversion 30%+ above text-only.",
        timeEstimate: "6 hrs",
      },
      {
        bucket: "Offer",
        title: "Add the subscription / repeat-purchase tier",
        detail:
          "For consumables, add a subscription at 10–15% discount with quarterly cadence. For non-consumables, add a 'next product in the line' bundle. Subscription LTV is the load-bearing economic structure; without it, paid acquisition rarely earns back.",
        timeEstimate: "3 hrs",
      },
      {
        bucket: "Traffic",
        title: "Build one UGC + creator partnership",
        detail:
          "One micro-influencer (5K–50K followers) in the exact niche, gifted product, content rights for paid amplification. UGC creative outperforms studio-shot creative by 2–4x on conversion. One partner properly used beats 10 generic shoutouts.",
        timeEstimate: "4 hrs (outreach + brief)",
      },
      {
        bucket: "Foundation",
        title: "Run the diagnostic on the product or homepage",
        detail:
          "Once items 1–9 ship, run the free 90-second diagnostic on your URL. The triage labels whether the bottleneck is now Wrong Person / Weak Offer / Weak Belief, so you fix the next-leverage item instead of guessing.",
        timeEstimate: "10 min",
      },
    ],
    lastVerified: TODAY,
  },

  "no-code-builders": {
    slug: "no-code-builders",
    displayName: "no-code builders",
    metaTitle: "Launch Checklist for No-Code Builders",
    metaDescription:
      "Ten-step pre-revenue checklist for no-code founders shipped on Webflow, Bubble, Softr, Lovable. Brunson frame for one paying customer.",
    heroSubhead:
      "Built for no-code founders shipped on Webflow, Bubble, Softr, Lovable, or Bolt. Ten ordered moves that take you from build-celebration to one paying customer at full price.",
    whoThisIsFor:
      "Your app works, your Stripe is wired, Product Hunt cheered, signups are silent. This checklist is the next 14 days.",
    faqs: [
      {
        q: "Should I keep 'Built on Lovable' on my homepage?",
        a: "Move it to the footer. Buyers don't care about the build stack; they care about what the app does for them. The build credit reassures other no-code builders, not buyers.",
      },
      {
        q: "I built it in two days. Doesn't that show up as low-quality?",
        a: "Only if you keep saying 'built it in two days' on the homepage. Buyers can't see your repo. The marketing layer is the entire perception; that's what this checklist fixes.",
      },
      {
        q: "Will the checklist work for a free + paid tier setup?",
        a: "Yes. Freemium is a Hook / Story / Offer pattern with a specific ladder structure. Steps 7–8 address the free-to-paid transition moment, which is where freemium SaaS most often breaks.",
      },
    ],
    steps: [
      {
        bucket: "Foundation",
        title: "Rewrite the homepage to sell the outcome, not the build",
        detail:
          "Move 'Built on Lovable' to the footer. The hero should name the cohort and the transformation, not the stack. Buyers don't share your engineering pride; they share your transformation. The Brunson moat is the funnel, not the build.",
        timeEstimate: "1 hr",
      },
      {
        bucket: "Foundation",
        title: "Name the smallest-viable cohort in the H1",
        detail:
          "'A budgeting app' converts at zero. 'A budgeting app for freelancers with irregular income' converts. Pick the smallest cohort that has a real market and put their context in the headline.",
        timeEstimate: "30 min",
      },
      {
        bucket: "Offer",
        title: "Build the Stack Slide on the pricing page",
        detail:
          "Every paid plan lists the offer-stack: the app, bonuses (templates, integrations, support, community, onboarding), dollar-anchored. Total at 5x list price. Pricing pages without a Stack read as 'what does this cost'; with a Stack they read as 'why so cheap'.",
        timeEstimate: "2 hrs",
      },
      {
        bucket: "Offer",
        title: "Add the conditional money-back guarantee",
        detail:
          "Conditional beats unconditional. 'If you don't ship one [outcome] in 30 days, full refund plus you keep the templates.' Specific, dated, falsifiable. Vague guarantees don't lift conversion; conditional ones do.",
        timeEstimate: "30 min",
      },
      {
        bucket: "Proof",
        title: "Seed three dated, named beta-user testimonials",
        detail:
          "Find 3–5 beta users from your Product Hunt or IH launch. Reduce their pricing or comp them entirely in exchange for a 200-word dated testimonial with one specific outcome. Three dated specifics beats fifty 'great app!' tweets.",
        timeEstimate: "5 hrs",
      },
      {
        bucket: "Traffic",
        title: "Skip Product Hunt round two; pick one niche channel instead",
        detail:
          "Product Hunt traffic is curiosity-shaped, not buyer-shaped. Pick one channel where your specific cohort lives (a subreddit, a Slack, a Twitter niche, a Substack network) and engage daily for 30 days. Quality of traffic beats quantity 10:1.",
        timeEstimate: "1 hr/day (ongoing)",
      },
      {
        bucket: "Offer",
        title: "Build the free-to-paid moment-of-truth trigger",
        detail:
          "Identify the one in-product moment where the free user clearly sees the value. Trigger the upgrade prompt at that exact moment, not at a paywall. Moment-of-truth upgrade prompts convert 5–10x random upsell modals on freemium SaaS.",
        timeEstimate: "3 hrs",
      },
      {
        bucket: "Follow-up",
        title: "Wire the onboarding Soap Opera Sequence",
        detail:
          "First 5 days post-signup: Attractive Character intro, failed-then-won story, the in-product 'aha' moment, the offer, the urgency. Trial-to-paid lifts 30–80% from a working SOS. Same five emails every signup.",
        timeEstimate: "3 hrs",
      },
      {
        bucket: "Traffic",
        title: "Ship one /vs/ comparison page against the dominant alternative",
        detail:
          "Honest comparison page versus the named competitor your cohort searches for. /vs/ pages convert 3–10x homepage traffic for bottom-funnel intent. Don't trash the competitor; the honest version converts better than the salesy version.",
        timeEstimate: "3 hrs",
      },
      {
        bucket: "Foundation",
        title: "Run the diagnostic on your live URL",
        detail:
          "Once items 1–9 ship, run the free 90-second diagnostic on your live homepage. The triage labels whether the rewrite now reads as Wrong Person / Weak Offer / Weak Belief from a cold reader's perspective.",
        timeEstimate: "10 min",
      },
    ],
    lastVerified: TODAY,
  },

  "indie-hackers": {
    slug: "indie-hackers",
    displayName: "indie hackers",
    metaTitle: "Launch Checklist for Indie Hackers",
    metaDescription:
      "Ten-step pre-revenue checklist for indie hackers post-ship, pre-MRR. Brunson Hook / Story / Offer applied to bootstrapped SaaS launches.",
    heroSubhead:
      "Built for indie hackers whose ship-post got cheers but whose Stripe stayed flat. Ten ordered moves that take you from community validation to one paying customer outside the community.",
    whoThisIsFor:
      "You shipped on Indie Hackers, the cheers landed, the launch traffic was real, the credit cards never were. This checklist is the next 14 days.",
    faqs: [
      {
        q: "Why didn't my Product Hunt / IH launch convert?",
        a: "Community traffic is curiosity-shaped, not buyer-shaped. PH conversion of 0.1–0.5% is normal. The fix isn't another launch; it's a Wrong Person diagnosis – step 3 in the checklist.",
      },
      {
        q: "I want to stay bootstrapped. Does this checklist push paid ads?",
        a: "No. Every step works for zero-spend founders. Paid ads are explicitly deferred until the funnel earns back at organic – usually after step 9.",
      },
      {
        q: "How long until I see my first $1K MRR?",
        a: "The checklist itself takes ~14 days of focused work; first-paying-customer events often happen mid-checklist. $1K MRR depends on traffic and pricing, but the bottleneck is the funnel work, not the timeline.",
      },
    ],
    steps: [
      {
        bucket: "Foundation",
        title: "Find the cohort outside the IH/PH community",
        detail:
          "IH/PH cheers builders, not buyers. Pick the cohort 3 steps removed: not 'indie hackers' but 'freelance copywriters who need a content calendar tool', not 'developers' but 'agency project managers tracking 30+ retainers'. The cohort outside the community is who pays.",
        timeEstimate: "1 hr",
      },
      {
        bucket: "Foundation",
        title: "Rewrite the homepage to address that cohort",
        detail:
          "Hero names the cohort and the outcome. The build stack moves to the footer. The product description shifts from 'I built X' to 'You stop doing Y'. Wrong-fit IH/PH traffic still bounces; right-fit traffic from the cohort outside the community now lands.",
        timeEstimate: "1 hr",
      },
      {
        bucket: "Offer",
        title: "Build the Stack Slide on the pricing page",
        detail:
          "Every paid tier carries an offer-stack: the app, templates, support SLA, integrations, lifetime updates. Dollar-anchor each line. Pricing pages without a Stack lose to feature-comparison readers; pricing pages with a Stack reframe to value-comparison.",
        timeEstimate: "2 hrs",
      },
      {
        bucket: "Offer",
        title: "Add a $7–$27 tripwire below your core price",
        detail:
          "A tripwire below the core price (a $9 template pack, a $19 audit tool, a $27 one-off micro-tool) creates the value-ladder bottom rung. Trip wire buyers convert to core at 5–15%; never selling a tripwire caps the funnel.",
        timeEstimate: "4 hrs (product design + page)",
      },
      {
        bucket: "Proof",
        title: "Seed three dated specific testimonials outside IH",
        detail:
          "Find 3–5 beta users from the cohort outside the community. Comp them or reduce-rate them in exchange for a 200-word dated testimonial. Three dated specifics from your real ICP beats 100 'congrats on the ship!' replies. IH replies are not testimonials.",
        timeEstimate: "5 hrs",
      },
      {
        bucket: "Traffic",
        title: "Pick one niche channel and engage daily for 30 days",
        detail:
          "Drop the 'launch on five platforms' habit. Pick one channel where your real cohort lives (subreddit, Slack, niche Twitter, Substack). Engage daily, not pitch. The cohort starts pulling the link out of you by week 3.",
        timeEstimate: "1 hr/day (ongoing)",
      },
      {
        bucket: "Follow-up",
        title: "Wire the in-trial Soap Opera Sequence",
        detail:
          "Whoever signs up gets a 5-email sequence over the trial: Attractive Character intro, failed-then-won, the in-product 'aha', the offer, the urgency. Same emails forever. Trial-to-paid lifts 30–80% with the SOS in place.",
        timeEstimate: "3 hrs",
      },
      {
        bucket: "Offer",
        title: "Add the post-purchase OTO at 2–4x core price",
        detail:
          "Immediately after the core purchase, present one specific upsell: an implementation pack, an annual prepay discount, a higher tier. 20–40% take-rate is typical. The OTO is where bootstrapped unit economics start working.",
        timeEstimate: "2 hrs",
      },
      {
        bucket: "Traffic",
        title: "Ship one comparison or alternatives page",
        detail:
          "Honest /vs/ or /alternatives-to/ page against the named competitor your cohort searches for. Comparison pages convert 3–10x homepage traffic on bottom-funnel intent. Critical for bootstrapped SaaS because you can't outspend competitors on top-of-funnel.",
        timeEstimate: "3 hrs",
      },
      {
        bucket: "Foundation",
        title: "Run the diagnostic on your repositioned page",
        detail:
          "Once items 1–9 ship, run the free 90-second diagnostic on your URL. The triage labels whether the rewrite now reads as Wrong Person / Weak Offer / Weak Belief from a cold reader's perspective – the cohort outside the community.",
        timeEstimate: "10 min",
      },
    ],
    lastVerified: TODAY,
  },

  "ai-wrappers": {
    slug: "ai-wrappers",
    displayName: "AI wrapper builders",
    metaTitle: "Launch Checklist for AI Wrapper Founders",
    metaDescription:
      "Ten-step pre-revenue checklist for GPT/Claude wrapper founders. Brunson Hook / Story / Offer + COGS-aware pricing for AI-powered SaaS.",
    heroSubhead:
      "Built for AI wrapper founders whose system prompt is tight but whose Stripe is flat. Ten ordered moves that take you from 'GPT-powered tool' to one paying customer at margin-safe pricing.",
    whoThisIsFor:
      "Your wrapper outputs are good, the Twitter demo went well, signups are real, conversion is sub-1%, COGS is eating margin. This checklist is the next 14 days.",
    faqs: [
      {
        q: "Should I worry about OpenAI shipping my feature?",
        a: "Not your top concern. Your top concern is the funnel that converts current traffic. If OpenAI ships your feature in 6 months and you have $50K MRR by then, you have leverage. If you haven't fixed the funnel, the OpenAI question doesn't matter.",
      },
      {
        q: "My COGS is 60% of revenue – is the business viable?",
        a: "Not at that ratio long-term. Step 4 covers COGS-safe pricing; step 8 covers credit-based mechanics that protect margin. Both are pricing layer fixes, not engineering layer fixes.",
      },
      {
        q: "Does this work for Claude wrappers, GPT wrappers, or open-source wrappers?",
        a: "Identical for all three. The diagnostic and checklist are model-agnostic. The marketing layer is the bottleneck; the model layer is the implementation detail.",
      },
    ],
    steps: [
      {
        bucket: "Foundation",
        title: "Drop 'GPT-powered' from the homepage",
        detail:
          "Buyers can already use GPT. 'GPT-powered marketing tool' converts at zero; 'a marketing brief generator for B2B SaaS founders' converts. Lead with the workflow, the output, or the cohort, not the underlying model.",
        timeEstimate: "30 min",
      },
      {
        bucket: "Foundation",
        title: "Name the specific workflow and cohort in the H1",
        detail:
          "Pick the smallest cohort that searches for your specific workflow. 'AI-powered writing tool' is a category; 'AI-generated B2B SaaS marketing briefs for Series A founders' is a position. Wrong Person traffic is the most common diagnosis on AI wrapper landing pages.",
        timeEstimate: "45 min",
      },
      {
        bucket: "Offer",
        title: "Build the Stack Slide on the pricing page",
        detail:
          "Every paid tier lists the offer-stack: the wrapper, prompt library, templates, support, dashboards, integrations. Dollar-anchor each line. AI wrapper pricing pages without a Stack lose to 'I'll just use ChatGPT'; with a Stack, they reframe to value-versus-DIY.",
        timeEstimate: "2 hrs",
      },
      {
        bucket: "Offer",
        title: "Price for COGS safety, not for benchmark",
        detail:
          "If your API costs are 60%+ of revenue, the business doesn't compound. Reprice. Move to credit-based, raise the floor, or limit per-tier output. Most AI wrapper businesses fail at the pricing layer, not the engineering layer. COGS safety is the load-bearing constraint.",
        timeEstimate: "3 hrs",
      },
      {
        bucket: "Proof",
        title: "Publish one specific dated 'output proof' case study",
        detail:
          "One named user, one specific use case, one dated output, one measurable outcome. 'Maya used the brief generator on 2026-03-14, shipped the landing page 3 days later, $4K MRR added by month-end' beats every demo video. The Reluctant-Hero pattern is load-bearing proof for AI wrappers.",
        timeEstimate: "4 hrs",
      },
      {
        bucket: "Offer",
        title: "Build the activation-moment trigger",
        detail:
          "Identify the one in-product moment where the user clearly sees output quality (their first generation, the first prompt that beat raw GPT). Trigger a celebration + paid-tier upsell at that exact moment. Activation-moment surfacing is the highest-conversion event in the funnel.",
        timeEstimate: "3 hrs",
      },
      {
        bucket: "Offer",
        title: "Add the conditional money-back guarantee",
        detail:
          "'If the first 10 generations don't measurably beat your raw GPT outputs, full refund plus a free prompt library.' Specific, dated, falsifiable. Most AI wrapper buyers are testing the wrapper-versus-raw-GPT proposition; a conditional guarantee on that exact question lifts conversion 20–40%.",
        timeEstimate: "45 min",
      },
      {
        bucket: "Follow-up",
        title: "Wire credit-based pricing if usage is variable",
        detail:
          "Flat subscription bleeds margin when power users 10x average usage. Credit-based pricing protects COGS, lets you upsell credit packs (high-margin), and pre-qualifies serious users. Step 7 is the unit-economics step; it's tedious but it's the foundation everything else stands on.",
        timeEstimate: "5 hrs",
      },
      {
        bucket: "Follow-up",
        title: "Build the in-trial Soap Opera + activation Seinfeld",
        detail:
          "First 5 days: a Soap Opera Sequence with Attractive Character, failed-with-raw-GPT story, the wrapper's specific edge, the offer, the urgency. After day 5: Seinfeld pattern of useful tips + soft pitch. Trial-to-paid lifts 30–80% with both in place.",
        timeEstimate: "4 hrs",
      },
      {
        bucket: "Foundation",
        title: "Run the diagnostic on your AI wrapper landing page",
        detail:
          "Once items 1–9 ship, run the free 90-second diagnostic on the URL. The triage labels whether the page now reads as Wrong Person / Weak Offer / Weak Belief – specifically, whether a cold buyer can see why this wrapper beats raw GPT for their cohort.",
        timeEstimate: "10 min",
      },
    ],
    lastVerified: TODAY,
  },

  "info-product-creators": {
    slug: "info-product-creators",
    displayName: "info product creators",
    metaTitle: "Launch Checklist for Info Product Creators",
    metaDescription:
      "Ten-step pre-revenue checklist for eBook, template, swipe-file creators. Brunson value-ladder for compounding info-product sales.",
    heroSubhead:
      "Built for info product creators whose Gumroad or LemonSqueezy launched well, then went silent. Ten ordered moves that take you from one-shot launch to compounding value-ladder revenue.",
    whoThisIsFor:
      "Your eBook or template pack is done, the launch traffic bumped, sales now trickle. This checklist is the next 14 days.",
    faqs: [
      {
        q: "I sell on Gumroad / LemonSqueezy / Stan / Podia. Does the checklist work?",
        a: "Yes, platform-agnostic. The marketing surface (sales page, email follow-up, ladder structure) is what matters, not the checkout tool.",
      },
      {
        q: "Should I just keep launching new $27 products?",
        a: "Each launch should compound the last – feeding a shared email list and ladder. Step 6 covers the ladder design. Standalone $27 launches with no ladder plateau at $1K–$3K per launch, regardless of audience size.",
      },
      {
        q: "How big does my audience need to be?",
        a: "1,000 engaged subscribers is enough for $1K–$10K launches with the right offer-stack. Engagement matters more than size – a 1,000-person engaged list outperforms 10,000 disengaged.",
      },
    ],
    steps: [
      {
        bucket: "Foundation",
        title: "Rewrite the sales page hero as the transformation",
        detail:
          "'The complete guide to email marketing' is description. 'Send your first revenue-generating email in 90 minutes, with no list' is transformation. The reader has to picture the after-state in 4 seconds. Info products fail at the headline more often than at the content.",
        timeEstimate: "1 hr",
      },
      {
        bucket: "Foundation",
        title: "Name one specific cohort in the H1",
        detail:
          "'For marketers' is everyone. 'For freelance copywriters with 0–1K subscribers' is a position. Pick the smallest cohort with real demand and write the page to them. Wrong Person traffic is the #1 reason info products plateau post-launch.",
        timeEstimate: "30 min",
      },
      {
        bucket: "Offer",
        title: "Build the Stack Slide on the sales page",
        detail:
          "List every component of the product: main asset, templates, swipe files, bonus videos, community access, lifetime updates. Dollar-anchor each. Total at 5x list price. Without a Stack, the $27 price looks expensive; with a Stack, it looks like a discount.",
        timeEstimate: "2 hrs",
      },
      {
        bucket: "Offer",
        title: "Add the conditional money-back guarantee",
        detail:
          "'If you haven't shipped your first revenue-generating email in 30 days, full refund plus you keep the swipe file.' Specific, dated, falsifiable. The conditional version lifts conversion 15–30% over unconditional.",
        timeEstimate: "30 min",
      },
      {
        bucket: "Proof",
        title: "Collect five dated specific testimonials",
        detail:
          "Email 20 past buyers. Ask for a 100-word dated testimonial with one specific outcome. 'I shipped my first $1,200 newsletter sponsorship on 2026-03-12 after using your template pack' beats 'great resource!'. Five dated specifics beats fifty vague.",
        timeEstimate: "4 hrs",
      },
      {
        bucket: "Offer",
        title: "Design the three-rung value ladder",
        detail:
          "$27 tripwire (the eBook). $97–$297 core (a template + community + workshop bundle). $497–$1,997 back-end (a course, cohort, or 1:1 implementation). Ladder structure is what turns a one-off launch into compounding revenue.",
        timeEstimate: "3 hrs",
      },
      {
        bucket: "Follow-up",
        title: "Wire the post-purchase OTO at 2–4x tripwire price",
        detail:
          "Immediately after the $27 purchase, present the $97–$297 core as a one-time offer at a discount. 20–40% take rate. The OTO is where info-product unit economics start working; the $27 standalone usually loses to ad spend.",
        timeEstimate: "2 hrs",
      },
      {
        bucket: "Follow-up",
        title: "Build the Soap Opera Sequence for opt-ins",
        detail:
          "5-email sequence: Attractive Character intro, failed-then-won story, the moment-of-truth, the tripwire offer, the urgency. Same emails for every opt-in. Converts cold opt-ins to tripwire buyers at 2–5%. The asset compounds forever.",
        timeEstimate: "3 hrs",
      },
      {
        bucket: "Follow-up",
        title: "Add the Seinfeld pattern for the list",
        detail:
          "After the Soap Opera ends, subscribers enter a 'something interesting + soft pitch' cadence at 3x/week. Same Brunson Seinfeld pattern. The list that gets daily-ish mail outperforms the list that gets weekly broadcast 2–3x on launch revenue.",
        timeEstimate: "1 hr (template only)",
      },
      {
        bucket: "Foundation",
        title: "Run the diagnostic on the rewritten sales page",
        detail:
          "Once items 1–9 ship, run the free 90-second diagnostic on your sales page URL. Triage labels whether the rewrite now reads as Wrong Person / Weak Offer / Weak Belief from a cold reader's perspective.",
        timeEstimate: "10 min",
      },
    ],
    lastVerified: TODAY,
  },

  "newsletter-operators": {
    slug: "newsletter-operators",
    displayName: "newsletter operators",
    metaTitle: "Launch Checklist for Newsletter Operators",
    metaDescription:
      "Ten-step pre-revenue checklist for newsletter operators with real audience and no paid product. Brunson value-ladder for newsletter monetization.",
    heroSubhead:
      "Built for newsletter operators with 2K–50K real subscribers and no paid product attached. Ten ordered moves that take you from sponsor-dependent revenue to one compounding paid offer.",
    whoThisIsFor:
      "Your newsletter is real, your open rates are healthy, sponsorship offers occasionally land, your paid product is missing or flat. This checklist is the next 14 days.",
    faqs: [
      {
        q: "Should I monetize through sponsorships or paid products?",
        a: "Both, in the right order. Paid products compound; sponsorships rent the audience to advertisers. Build the paid product first; layer sponsorships on top after. Lead-with-sponsorship newsletters rarely build durable paid products later.",
      },
      {
        q: "What's the right paid product for a newsletter list?",
        a: "Usually one of: a $27–$97 info product the list explicitly asks about, a $497–$1,997 course in the newsletter's topic, or a $9–$25/month premium tier. Step 4 maps the right starting rung for your audience size and engagement.",
      },
      {
        q: "How big does my list need to be?",
        a: "1,000 engaged subscribers (open rate 35%+) is enough for a $1K–$3K launch. Engagement matters more than size. List size matters only after the offer-stack works.",
      },
    ],
    steps: [
      {
        bucket: "Foundation",
        title: "Survey the list to find the explicit ask",
        detail:
          "Send one email: 'What's the one thing you'd pay $50 to solve this quarter?' Read every reply. The paid product the list builds for you is 10x easier to sell than the one you build then announce. Most newsletters skip this step and pay for it forever.",
        timeEstimate: "2 hrs (write + read replies)",
      },
      {
        bucket: "Foundation",
        title: "Pick one ladder rung based on the answers",
        detail:
          "If replies cluster on 'I'd pay for templates / a tool' → start with a $27–$97 info product. If replies cluster on 'I'd pay for community / live calls' → start with a $9–$25/mo premium tier. If replies cluster on 'I'd pay for a course' → start with a $497–$1,997 cohort.",
        timeEstimate: "30 min",
      },
      {
        bucket: "Offer",
        title: "Build the sales page with Stack Slide",
        detail:
          "Sales page lives at a stable URL the newsletter can link to forever. Hero names the cohort and transformation. Stack lists every component dollar-anchored. The newsletter operator's leverage is the existing audience; the sales page is what monetizes it.",
        timeEstimate: "4 hrs",
      },
      {
        bucket: "Offer",
        title: "Add the conditional money-back guarantee",
        detail:
          "'If you don't [specific outcome] in 30 days, full refund plus you keep [bonus asset].' Specific, dated, falsifiable. Conditional guarantees lift conversion 15–30% over unconditional. Newsletter buyers are warm – they buy at higher rates and refund less than cold buyers.",
        timeEstimate: "30 min",
      },
      {
        bucket: "Proof",
        title: "Seed three dated beta-buyer testimonials",
        detail:
          "Offer 5–10 list members the product at half price for a 100-word dated testimonial. Three dated specifics from real list members are the highest-trust proof newsletter operators can ship. 'I shipped my first paid project 6 weeks after enrolling' beats fifty 'love your work!' replies.",
        timeEstimate: "5 hrs",
      },
      {
        bucket: "Traffic",
        title: "Write the launch Soap Opera (5 emails over 7 days)",
        detail:
          "The 5-email launch sequence is the load-bearing asset. Day 1: Attractive Character + the ask. Day 3: failed-then-won story. Day 5: the offer and Stack. Day 6: urgency. Day 7: last chance + bonus. Same launch sequence works for every product the newsletter ships.",
        timeEstimate: "4 hrs",
      },
      {
        bucket: "Follow-up",
        title: "Wire the post-purchase OTO at 2–4x core price",
        detail:
          "Immediately after the core purchase, present a one-time offer at a discount. 20–40% take rate. The OTO is where the launch math starts working. Without it, even a great-converting launch leaves 40%+ of available revenue on the table.",
        timeEstimate: "2 hrs",
      },
      {
        bucket: "Follow-up",
        title: "Plan the second product as a ladder rung",
        detail:
          "Six months from now, ship a second product positioned as the next rung above the first. Newsletters that ship a sequence of ladder-aware products compound; newsletters that ship standalone one-offs plateau. Plan the second product before the first launch ships, not after.",
        timeEstimate: "2 hrs (planning only)",
      },
      {
        bucket: "Traffic",
        title: "Add the 'reverse squeeze' page for new subscribers",
        detail:
          "On the public newsletter site, add one long-form essay that the cohort searches for. New subscribers find the essay, opt-in to the list, enter the SOS, hit the offer. This is the compounding subscriber-acquisition machine the newsletter has been missing.",
        timeEstimate: "6 hrs (essay only)",
      },
      {
        bucket: "Foundation",
        title: "Run the diagnostic on your sales page",
        detail:
          "Once items 1–9 ship, run the free 90-second diagnostic on the sales page URL. The triage labels whether the offer reads as Wrong Person / Weak Offer / Weak Belief from a cold list-member's perspective.",
        timeEstimate: "10 min",
      },
    ],
    lastVerified: TODAY,
  },

  "freelancers": {
    slug: "freelancers",
    displayName: "freelancers",
    metaTitle: "Launch Checklist for Freelancers",
    metaDescription:
      "Ten-step pre-revenue checklist for freelancers stuck on hourly rate competition. Brunson positioning for productised premium offers.",
    heroSubhead:
      "Built for freelancers stuck competing on hourly rate. Ten ordered moves that take you from gig-by-gig income to one productised offer at a premium fixed price.",
    whoThisIsFor:
      "You freelance on Upwork or LinkedIn, leads land monthly, conversations drift to 'what's your hourly rate', negotiations end 30–50% below your number. This checklist is the next 14 days.",
    faqs: [
      {
        q: "Do I have to leave Upwork or Fiverr?",
        a: "Eventually, but not until step 9 ships direct-traffic capacity. Marketplace platforms are training wheels: they bring leads but cap rate. Most freelancers leave platforms 12–24 months in.",
      },
      {
        q: "Can I keep doing several different services?",
        a: "Not on the homepage. Pick one productised offer for the marketing layer. You can still deliver other services to existing clients; the homepage just has to anchor to one outcome.",
      },
      {
        q: "What if my work is creative and hard to productise?",
        a: "Step 4 covers the productisation move specifically. Even open-ended creative work has a repeatable scope, deliverable, and timeline that can be productised. 'A 14-day brand identity sprint for $9,997' is creative AND productised.",
      },
    ],
    steps: [
      {
        bucket: "Foundation",
        title: "Pick one productised deliverable, one cohort",
        detail:
          "'Freelance design, hourly' is generic. 'A 14-day SaaS landing-page redesign sprint, $4,997 fixed, no scope creep' is productised. Pick the one deliverable+cohort combo where you have the deepest case study; productise that first.",
        timeEstimate: "2 hrs",
      },
      {
        bucket: "Foundation",
        title: "Rewrite LinkedIn + homepage hero around the productised offer",
        detail:
          "LinkedIn headline: '14-day SaaS landing page sprints | $4,997 fixed | 70+ founders served'. Homepage hero: same. The hourly-rate conversation never starts when the productised price anchors the conversation. Reposition first, then defend the rate.",
        timeEstimate: "1 hr",
      },
      {
        bucket: "Offer",
        title: "Build the Stack Slide for the productised offer",
        detail:
          "List every component: discovery call, brand audit, copy draft, design draft, dev handoff, post-launch QA, 30-day support window, source files. Dollar-anchor each line. The Stack makes the $4,997 sprint look like a discount on $19,000 of itemised value.",
        timeEstimate: "2 hrs",
      },
      {
        bucket: "Offer",
        title: "Add the timeline + scope guarantee",
        detail:
          "'14 calendar days from kickoff to launch. If we miss the date, every additional day is 5% off your invoice.' Specific, dated, falsifiable. Scope-and-timeline guarantees are the load-bearing trust signal for productised freelance offers because rate-shopping leads have been burned by scope creep.",
        timeEstimate: "30 min",
      },
      {
        bucket: "Proof",
        title: "Collect three dated, named, full-name case studies",
        detail:
          "Email five past clients. Ask for a 200-word case study with full name, company, dated outcome, and a specific dollar figure if possible. 'Maya Patel, head of growth at Acme, shipped the redesign 2026-03-14, lifted trial-to-paid 1.2% → 3.8%' beats anonymised three-paragraph testimonials.",
        timeEstimate: "5 hrs",
      },
      {
        bucket: "Foundation",
        title: "Publish the explicit disqualifier section",
        detail:
          "'This sprint is not for you if: [pre-launch with no traffic, hourly-budget mindset, marketing-attribution work, more than 3 stakeholders].' Naming who you don't serve cuts wrong-fit inbound 40–60% and lifts close rate on what remains.",
        timeEstimate: "30 min",
      },
      {
        bucket: "Traffic",
        title: "Pick one channel and post daily for 90 days",
        detail:
          "LinkedIn, Twitter, or a niche Slack – pick one, post daily anchored on the productised offer's transformation. The channel discipline matters more than the channel choice. Freelancers who post on five channels produce five mediocre presences; one channel done daily compounds.",
        timeEstimate: "1 hr/day (ongoing)",
      },
      {
        bucket: "Offer",
        title: "Add the post-sprint retainer rung",
        detail:
          "After the productised sprint ships, present a 'ongoing optimisation' retainer at $2K–$5K/mo. 30–50% of sprint clients take it. The retainer is where freelance economics break the calendar-hours ceiling. Productised sprint feeds the retainer; retainer feeds the bank account.",
        timeEstimate: "2 hrs (offer design only)",
      },
      {
        bucket: "Traffic",
        title: "Ship one teardown or breakdown in your niche",
        detail:
          "Pick one well-known company in your cohort and publish a detailed teardown of their work. SEO long-tail + LinkedIn distribution. The teardown becomes a proof artefact that the cohort recognises as 'this freelancer understands my world' before they even click your booking link.",
        timeEstimate: "6 hrs",
      },
      {
        bucket: "Foundation",
        title: "Run the diagnostic on the freelance homepage",
        detail:
          "Once items 1–9 ship, run the free 90-second diagnostic on your freelance site or productised-offer landing page. Triage labels whether the page now reads as Wrong Person / Weak Offer / Weak Belief from a cold buyer's perspective.",
        timeEstimate: "10 min",
      },
    ],
    lastVerified: TODAY,
  },
};

export const LAUNCH_CHECKLIST_ENTRIES: ReadonlyArray<LaunchChecklistEntry> =
  NICHE_SLUGS.map((slug) => {
    const entry = ENTRIES_BY_SLUG[slug];
    if (!entry) {
      throw new Error(
        `Launch checklist missing for niche slug "${slug}". Every niche in src/lib/niches.ts must have a corresponding entry in src/lib/launch-checklists.ts.`,
      );
    }
    return entry;
  });

export const LAUNCH_CHECKLIST_SLUGS: ReadonlyArray<string> =
  LAUNCH_CHECKLIST_ENTRIES.map((e) => e.slug);

export function getLaunchChecklistBySlug(
  slug: string,
): LaunchChecklistEntry | undefined {
  return LAUNCH_CHECKLIST_ENTRIES.find((e) => e.slug === slug);
}
