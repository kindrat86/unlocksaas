/**
 * Hook / Story / Offer Matrix — Russell Brunson Traffic Secrets §3.
 *
 * Brunson's HSO framework: every piece of content, every ad, every email
 * needs all three legs. A hook with no story is a headline with no
 * payoff. A story with no offer is entertainment. An offer with no hook
 * is never seen.
 *
 * This matrix maps 8 complete HSO combinations across the four primary
 * distribution channels Unlock SaaS uses:
 *   - X / Twitter threads
 *   - Indie Hackers posts
 *   - Reddit posts
 *   - Email subject lines
 *
 * Each entry is a ready-to-deploy content unit. The hook is the first
 * line (the scroll-stopper). The story is the 3-5 beat narrative. The
 * offer is the soft CTA (never 'buy now' — always 'see the diagnostic'
 * or 'read the breakdown').
 *
 * Brunson Hard-Rule: every offer below is a SOFT offer (free diagnostic,
 * free breakdown, free story). The hard offer (the Playbook checkout)
 * lives only on the /playbook-sales page. Content never hard-sells.
 */

export type HSOChannel = "x-thread" | "indiehackers" | "reddit" | "email-subject";

export interface HSOEntry {
  slug: string;
  channel: HSOChannel;
  hook: string;
  story: string[];
  offer: string;
  /** Which dream-customer awareness stage this HSO unit targets. */
  awarenessStage: "Unaware" | "Problem-Aware" | "Solution-Aware" | "Product-Aware";
  /** The core emotion the unit triggers. */
  emotion: "shame" | "frustration" | "hope" | "anger" | "relief" | "curiosity";
}

export const HSO_CHANNELS: Record<HSOChannel, { label: string; format: string }> = {
  "x-thread": {
    label: "X / Twitter Thread",
    format: "5-9 tweets, hook in tweet 1, story across 2-7, offer in tweet 8 or 9",
  },
  indiehackers: {
    label: "Indie Hackers Post",
    format: "Long-form, 400-800 words, milestone or lesson framing",
  },
  reddit: {
    label: "Reddit Post",
    format: "Personal story framing, value-first, soft CTA in comments only",
  },
  "email-subject": {
    label: "Email Subject + Preview",
    format: "Subject line + first 40 chars visible in inbox preview",
  },
};

export const HSO_ENTRIES: HSOEntry[] = [
  {
    slug: "the-flat-line-confession",
    channel: "x-thread",
    awarenessStage: "Problem-Aware",
    emotion: "shame",
    hook:
      "I shipped a product with AI in 3 weeks. 60 days later, my Stripe dashboard still shows $0.00. Here's what nobody told me about why.",
    story: [
      "The building part felt like magic. Lovable/Cursor/Claude shipped something real — something I use myself — in weeks, not months.",
      "I launched. I posted on X. I submitted to Product Hunt. I wrote a thread. I refreshed Stripe.",
      "The line stayed flat. Not low. Flat. Zero.",
      "I couldn't tell anyone. The launch tweet got 200 likes. The private reality was zero charges.",
      "The product wasn't broken. I use it every day. The piece I was missing had a name — I just didn't know it yet.",
    ],
    offer:
      "I wrote down exactly what the missing piece was and how I found it. Free 2-minute diagnostic, no email required: unlocksaas.com/diagnostic",
    },
  {
    slug: "the-two-stripe-dashboards",
    channel: "indiehackers",
    awarenessStage: "Problem-Aware",
    emotion: "frustration",
    hook:
      "Two founders ship the same product. One earns $5K MRR in 90 days. The other earns $0. The difference is not the product.",
    story: [
      "I watched this happen in my own friend group. Two people, same niche, same AI-built MVP, same week.",
      "Founder A posted once, got 50 signups, and went back to building features.",
      "Founder B did something different. They spent week 1-2 not building — naming ONE person they were building for. Not a segment. A person.",
      "Then they did the unglamorous work: the DMs, the community comments, the 'I noticed you mentioned X' outreach. Before they felt ready.",
      "90 days later: Founder A is still at $0 and polishing features. Founder B has 12 paying customers. Same product. Different work.",
    ],
    offer:
      "The work Founder B did has a name and a 60-day structure. I broke it down for free: unlocksaas.com/diagnostic",
  },
  {
    slug: "build-with-ai-sell-with-shame",
    channel: "reddit",
    awarenessStage: "Unaware",
    emotion: "shame",
    hook:
      "I used AI to build a real product in 3 weeks. Then I spent 3 months pretending the Stripe line wasn't flat. Here's what I was actually avoiding.",
    story: [
      "The tools made building free. Lovable, Cursor, Claude — I shipped something that works. Something I'm proud of.",
      "Then I launched. And nothing happened. Not a slow start — nothing.",
      "I told myself it was the market. The timing. The algorithm. I kept building features, hoping the next one would be the one.",
      "What I was actually avoiding: the distribution work. The DMs. The 'hey, I noticed you mentioned X' messages. The naming of ONE specific person I was building for.",
      "Because that work doesn't feel like building. It feels like selling. And selling feels slimy when you've never done it.",
    ],
    offer:
      "The thing I was avoiding had a name. I wrote it down so you don't have to spend 3 months avoiding it too: unlocksaas.com/diagnostic",
  },
  {
    slug: "the-product-is-not-the-bottleneck",
    channel: "x-thread",
    awarenessStage: "Solution-Aware",
    emotion: "frustration",
    hook:
      "Every post-launch founder I talk to has the same blind spot. They think the product is the bottleneck. It almost never is.",
    story: [
      "I sat with 10+ founders last year who shipped real products with AI tools. Same story, every time.",
      "They'd polished the onboarding. Shipped the dark mode. Added the integrations. The product was genuinely good.",
      "But when I asked 'who is the ONE person this is for?' — they'd give me a segment. 'Indie hackers.' 'Small teams.' 'Founders.'",
      "A segment is not a person. A person has a name, a daily reality, a fear, and a wallet. A segment has none of those.",
      "Every single one of them, once they named the person, started earning within 60 days. The product didn't change. The targeting did.",
    ],
    offer:
      "The 2-minute diagnostic that helps you name the one person — free, no email: unlocksaas.com/diagnostic",
  },
  {
    slug: "the-first-charge",
    channel: "indiehackers",
    awarenessStage: "Product-Aware",
    emotion: "hope",
    hook:
      "What I wanted was not more users. It was one user who paid. Not validation. A Stripe charge. Here's how I finally got one.",
    story: [
      "For 90 days I optimized for signups. I had 300 of them. I felt productive. The line was still flat.",
      "Then I changed one thing: I stopped optimizing for signups and started optimizing for ONE charge.",
      "I named the person. I wrote the promise. I made the offer before the product felt ready. I sent 12 DMs.",
      "One of them said yes. $1. The first Stripe charge. It wasn't life-changing money. It was proof.",
      "Proof that what I built was worth something to someone who had no reason to lie to me.",
    ],
    offer:
      "The 60-day structure that turned 'one charge' from a hope into a system: unlocksaas.com/playbook-sales",
  },
  {
    slug: "subject-the-refresh",
    channel: "email-subject",
    awarenessStage: "Problem-Aware",
    emotion: "shame",
    hook: "The refresh isn't working",
    story: [
      "You shipped. You opened Stripe. You refreshed.",
      "Nothing. The line stays flat and you can't figure out why because the product works.",
      "I know because I refreshed for 90 days before I named what was actually missing.",
    ],
    offer:
      "The 2-minute diagnostic that names the missing piece: unlocksaas.com/diagnostic",
  },
  {
    slug: "subject-built-with-ai",
    channel: "email-subject",
    awarenessStage: "Unaware",
    emotion: "curiosity",
    hook: "Built with AI, earned with nothing",
    story: [
      "The tools made shipping free. So everyone shipped.",
      "The bottleneck moved. It's not building anymore — it's the work nobody taught us.",
      "Here's what the work actually is.",
    ],
    offer: "The free breakdown: unlocksaas.com/diagnostic",
  },
  {
    slug: "subject-one-charge",
    channel: "email-subject",
    awarenessStage: "Product-Aware",
    emotion: "hope",
    hook: "One Stripe charge changed how I build",
    story: [
      "300 signups felt productive. Zero charges felt like fraud.",
      "Then I named one person, made one promise, sent 12 DMs.",
      "One said yes. $1. Proof that the product was worth something.",
    ],
    offer: "The 60-day structure: unlocksaas.com/playbook-sales",
  },
];

export const HSO_TOTAL = HSO_ENTRIES.length;

export function getHSOByChannel(channel: HSOChannel): HSOEntry[] {
  return HSO_ENTRIES.filter((e) => e.channel === channel);
}

export function getHSOBySlug(slug: string): HSOEntry | undefined {
  return HSO_ENTRIES.find((e) => e.slug === slug);
}

/**
 * Emotion distribution — for the matrix page's honest rollup.
 */
export const HSO_EMOTION_COUNTS = (
  ["shame", "frustration", "hope", "anger", "relief", "curiosity"] as const
).map((emo) => ({
  emotion: emo,
  count: HSO_ENTRIES.filter((e) => e.emotion === emo).length,
}));
