/**
 * pSEO data source for /alternatives-to/[slug].
 *
 * Surface A of the Google strategy (strategy/google-strategy.md §A) — the
 * "alternatives to X" long-tail. The audience already searches for ShipFast
 * alternatives, Lovable workflows, and post-launch playbooks; this surface
 * meets them where they search and reframes the question.
 *
 * Brunson Hard-Rule reconciliation (honest claims):
 *   - Most named entries below are NOT competitors of UnlockSaaS. They are
 *     tools the avatar already uses to ship. The framing is therefore
 *     "after X" (the natural follow-on once shipping is solved), not
 *     "vs X" (a side-by-side comparison that would misrepresent both
 *     products).
 *   - Category entries (saas-courses, growth-coach) are honest direct
 *     comparisons because UnlockSaaS does compete for the same dollar.
 *   - No fabricated feature checkboxes; no invented testimonials from
 *     either side; no claims about competitor weaknesses that are not
 *     directly observable from their public marketing.
 *
 * Activation gate: strategy/google-strategy.md §A.5 puts large-scale
 * pSEO ("templates/[type]", "use-case/[case]") on the Phase 2 ledger,
 * gated on first-verified-customer. This surface is the small,
 * defensible first cut — three "after X" entries plus two category
 * comparisons — that ships the infrastructure without violating that
 * gate. Add more entries here as the customer base grows and the
 * narrative for each comparison earns a real testimonial.
 *
 * Pattern: server-hoist-static-io — every entry is module-level and
 * pre-built. generateStaticParams reads ALTERNATIVE_SLUGS at build
 * time; generateMetadata + the page both read the same lookup table.
 */

export type AlternativeFraming = "after" | "vs";

export type AlternativeEntry = {
  /** URL slug; matches the [slug] segment. Lowercase, kebab-case. */
  slug: string;
  /** Display name as it appears in the H1 and metadata. */
  competitor: string;
  /** "after" = natural follow-on; "vs" = head-to-head comparison. */
  framing: AlternativeFraming;
  /** SEO title — under 60 chars where possible. */
  seoTitle: string;
  /** SEO description — under 160 chars where possible. */
  seoDescription: string;
  /** Page-level H1; longer than seoTitle is fine. */
  pageH1: string;
  /**
   * The body paragraphs. Plain strings; the page renders each as <p>.
   * Order matters — story first, contract second, CTA framing third.
   */
  paragraphs: readonly string[];
};

export const ALTERNATIVES: readonly AlternativeEntry[] = [
  {
    slug: "shipfast",
    competitor: "ShipFast",
    framing: "after",
    seoTitle: "After ShipFast: how to get your first paying customer",
    seoDescription:
      "ShipFast got your SaaS shipped in days. The Stripe line is still flat. Unlock SaaS runs the post-launch work that produces the first verified paying customer — or you do not pay.",
    pageH1: "You shipped with ShipFast. The Stripe line is still flat. Now what?",
    paragraphs: [
      "ShipFast is the cleanest way I know to ship a Next.js SaaS in a week. The auth works, the Stripe plumbing works, the email works. None of that is the problem you have right now.",
      "The problem is that nobody is paying. Not because the product is wrong — you do not actually know that yet — but because the work between launch and the first paying customer is not the work ShipFast was built to do. ShipFast ends at the deploy. The Stripe-line problem starts there.",
      "Unlock SaaS is the machine for that next stretch. Seven steps. Pin one real person. Write one real promise. Send one real message. Verify every step inside Stripe. If 60 days pass and the in-product milestones are done and the line is still flat, the $98 refunds in code. No 'describe your experience' email.",
      "Start free: the diagnostic reads your live product page and labels which of the three things is actually broken — Wrong Person, Weak Offer, or Weak Belief — in about 90 seconds.",
    ],
  },
  {
    slug: "lovable",
    competitor: "Lovable",
    framing: "after",
    seoTitle: "After Lovable: getting your first paying customer",
    seoDescription:
      "Lovable lets a non-engineer ship a working SaaS. The next problem is silence in Stripe. Unlock SaaS runs the post-launch work that converts a shipped product into a verified paying customer.",
    pageH1: "You shipped with Lovable. The product works. The Stripe line is flat. That is a different problem.",
    paragraphs: [
      "Lovable is one of the reasons this site exists. I shipped a dozen products with it. Every one of them was real software. Every one of them got polite signups and zero charges.",
      "What I did not know — and what nobody around me would say plainly — is that shipping the product is the easy half. The other half is the work that gets you paid: pin one real person, write one real promise to them, send the message, watch what happens, iterate. None of that is in Lovable. None of it is in a course. It is the post-launch stretch most non-engineer founders skip.",
      "Unlock SaaS is the machine I wish someone had handed me when I shipped my first three Lovable products. Seven steps, code-enforced completion, Stripe-verified outcome, 60-day money-back guarantee.",
      "Start free with the diagnostic. Paste your Lovable product URL. About 90 seconds later you get the labeled diagnosis and the specific next door.",
    ],
  },
  {
    slug: "replit",
    competitor: "Replit Agent",
    framing: "after",
    seoTitle: "After Replit Agent: how to get your first paying customer",
    seoDescription:
      "Replit Agent ships an MVP fast. The bottleneck moves to outreach, offer, and audience — not code. Unlock SaaS runs the post-launch work in seven steps with a Stripe-verified guarantee.",
    pageH1: "You shipped with Replit Agent. The bottleneck is no longer code. It is the work after.",
    paragraphs: [
      "Replit Agent compresses 'shipping an MVP' into a single afternoon. That used to be the bottleneck. It is not anymore. The bottleneck moved.",
      "The new bottleneck is the work between MVP and first verified Stripe charge: identifying one real customer, building one offer they actually want, and sending the messages that convert them. That work was always hard. It just used to be hidden behind 'I cannot build the thing yet.' Now it is exposed.",
      "Unlock SaaS is the seven-step machine that runs that exposed work. Engine pushback when an answer is vague. Outreach inside the tool. Stripe-webhook verification at the end. $49/month, $98 capped exposure over the 60-day guarantee.",
      "Start with the free 90-second diagnostic. It reads the product you shipped and labels which of three things — Wrong Person, Weak Offer, Weak Belief — is the actual problem.",
    ],
  },
  {
    slug: "saas-courses",
    competitor: "SaaS courses",
    framing: "vs",
    seoTitle: "Alternative to SaaS courses: a tool, not a video library",
    seoDescription:
      "Most SaaS courses teach the theory and leave the work to you. Unlock SaaS runs the work as software and refunds you in code if the result does not happen.",
    pageH1: "If a SaaS course was going to fix this, it already would have.",
    paragraphs: [
      "If you are reading this, you have probably already bought one or two SaaS courses. Maybe a cohort. Maybe a community. The shape of the lesson is always the same: here is the theory, now go do the work. The work is the part that does not happen.",
      "Unlock SaaS is not a course. There is no video library, no Slack channel, no certificate. It is a tool that runs the work for you and verifies completion inside Stripe. Engine pushback when an answer is vague. Outreach sent from inside the tool. A 60-day money-back guarantee enforced by code that reads your Stripe account.",
      "$49 a month. $98 capped exposure during the guarantee window. If the in-product milestones are done and your first paying customer has not shown up, the refund fires automatically. The deliverable is a Stripe charge, not a certificate.",
      "If you want to see what the tool actually does before paying anything, the diagnostic is free. About 90 seconds. Real product URL in, labeled diagnosis out.",
    ],
  },
  {
    slug: "growth-coach",
    competitor: "Hiring a growth coach",
    framing: "vs",
    seoTitle: "Alternative to a growth coach: $49/mo and code-enforced work",
    seoDescription:
      "Hiring a growth coach is $300+/hour and depends on the coach. Unlock SaaS is $49/mo with engine pushback built into every step and a 60-day money-back guarantee.",
    pageH1: "A growth coach can tell you the work. Unlock SaaS makes you do it.",
    paragraphs: [
      "A growth coach who actually knows the indie-SaaS landscape costs $200–$500 an hour. They will tell you the right things: pin one customer, sharpen one offer, send the messages. Then they will hang up and the work will sit on your desk for another week, because the part of the founder who avoids the work is exactly the part the call did not change.",
      "Unlock SaaS does not give you advice. It gives you steps with engine pushback that mirrors your own avoidance back at you. You cannot move from Step 2 to Step 3 until Step 2's output stops being vague. The outreach is sent from inside the tool. The first paying customer is verified by a Stripe webhook, not by you self-reporting.",
      "$49 a month, $98 cap, 60-day money-back if the work was done and Stripe is still flat. The math against a single $300 coaching hour is obvious. The math against the third hour, when you are still avoiding the same step you were avoiding before the first call, is even more obvious.",
      "If you want to see what the engine pushback feels like before paying anything, the diagnostic is free. About 90 seconds. Real product URL in, labeled diagnosis out.",
    ],
  },
] as const;

/**
 * Pre-built lookup so [slug] route can resolve in O(1) without scanning
 * the ALTERNATIVES list on every request.
 */
export const ALTERNATIVES_BY_SLUG: Readonly<
  Record<string, AlternativeEntry>
> = Object.freeze(
  Object.fromEntries(ALTERNATIVES.map((entry) => [entry.slug, entry])),
);

/** Slug list for generateStaticParams + sitemap extension. */
export const ALTERNATIVE_SLUGS: readonly string[] = ALTERNATIVES.map(
  (e) => e.slug,
);
