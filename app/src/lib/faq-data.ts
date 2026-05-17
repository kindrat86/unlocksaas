/**
 * FAQ data — single source of truth for both the interactive sales-page
 * accordion (`components/blocks/faq-accordion.tsx`) and the standalone,
 * answer-engine-optimized FAQ surface (`app/(marketing)/faq/page.tsx`).
 *
 * Content sourced VERBATIM from strategy/dollar-objections.md "Updated FAQ
 * Copy" section. Each Q maps to one External Belief from workbook 06 §4. No
 * fabricated numbers. The Daniil Khanin quote in the Signal entry is the
 * strongest single dollar-objection mirror in the entire mine — specific,
 * public, dated, attributed to a real Indie Hacker.
 *
 * Pulled out of `faq-accordion.tsx` so a server component can iterate the
 * same array to render schema.org FAQPage JSON-LD on first paint without
 * importing the "use client" accordion component.
 */
export type FaqEntry = {
  /** Short category label shown above the question (e.g. "Time", "Price"). */
  category: string;
  /** The objection in the founder's exact words. */
  q: string;
  /** The reply — sourced from strategy/dollar-objections.md. */
  a: string;
};

export const FAQ_ENTRIES: FaqEntry[] = [
  {
    category: "Time",
    q: "I do not have time for another framework.",
    a: "I get it. You have already read the books, watched the YouTube breakdowns, joined two Slack groups. None of it shipped a customer. The Playbook is not a framework — the framework is buried inside the engine. You answer 3–5 questions per step, the engine assembles the work, you take the action it tells you to take. By Step 7 either Stripe pings with your first sale or the guarantee fires and you get $98 back. You do not read this. You finish it.",
  },
  {
    category: "Tactics",
    q: "I have tried customer interviews and they did not help.",
    a: "Most founders who say this did two interviews, got polite feedback, and concluded the market was wrong. Be honest about what \"tried\" means. The Playbook forces 20 logged outreach actions before the guarantee can fire — that is the floor. If you complete 20 and no Stripe charge lands, the offer was wrong, and the refund tells you that for free. Most founders never get to 20. That is why most still do not know what is actually broken.",
  },
  {
    category: "Signal",
    q: "Praise without payment means my market is dead.",
    a: "A founder on Indie Hackers (Daniil Khanin) just posted: 10,947 signups, 90 paid, nine years. He wrote \"I'm bad at selling. Nine years of proof.\" That is not a dead market. That is a missing motion. The Playbook assumes the people clapping on your launch post are not the people who pay — and forces you to go find the ones who do, with logged outreach the engine tracks. If 20 of the right conversations still produce no charge, the guarantee fires.",
  },
  {
    category: "Price",
    q: "$49/mo is too much pre-revenue.",
    a: "Two coffees a week. And the cap on your downside is $98, not $49. If the Playbook does not produce a verified Stripe charge in 60 days AND you completed the in-product milestones, you get the $98 back. Most founders I built this for spend more than $98/mo on tools they do not open. This is the one tool with a contract: it pays for itself in your Stripe dashboard or it pays itself back into your bank.",
  },
  {
    category: "Identity",
    q: "I can already see the path. I just need to execute.",
    a: "Then execute. Open Stripe right now. If you charged a new customer in the last 14 days, close this tab. If you did not, the path you can see is the path you have been seeing for six months — and you are still here reading FAQs. The Playbook does not sell you a new plan. It runs the plan you already wrote down and never finished. The proof it works is the Stripe charge it produces, not the dashboard it shows.",
  },
  {
    category: "DIY",
    q: "Could I not build this myself?",
    a: "Yes. Probably in three weekends. While you are building, you are not running the funnel — which is the exact disease the Playbook treats. The Stripe-webhook proof, the Dream 100 picker fed from your locked workbook, the engine pushback that mirrors your own avoidance back at you, the 60-day refund logic — you would ship those in a month. And during that month, zero outreach. You would be a founder who chose to ship one more tool nobody pays for. That is not a tool decision. That is a story.",
  },
  {
    category: "Workflow",
    q: "Even if it works, it will just sit beside my real workflow.",
    a: "Fair. Most tools do. That is why outreach is sent from inside the Playbook, not copy-pasted out to another tab — and why the Stripe webhook fires inside the Playbook when your first customer pays. Those are the two events that matter on the post-launch stretch. If both live somewhere else, kill the tool. Both live here. The Playbook is not a tab you open. It is the room you do the work in for 60 days.",
  },
  {
    category: "Pricing risk",
    q: "Will the price go up later? Am I locked in at $49?",
    a: "$49/mo is the only Core price. If I introduce annual or a Pro tier, your monthly stays $49 until you choose to change it. There is no startup-discount expiration, no usage-based metering, no \"your team grew so now it is $149.\" The price is the price.",
  },
];
