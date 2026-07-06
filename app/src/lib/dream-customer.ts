/**
 * Dream Customer Avatar — Russell Brunson Traffic Secrets §1 (Secret #1).
 *
 * "Who is the one person you are trying to serve? If you don't know who
 * that is, you can't find where they hang out, and you can't craft the
 * message that moves them."
 *
 * This is the single most important page for the whole product. Every
 * other Traffic Secrets chapter depends on this avatar being right.
 *
 * The avatar below is the synthesis of:
 *   - The homepage founder-story block (Maryan's narrative)
 *   - The apply/qualification questions
 *   - The diagnostic funnel inputs
 *   - The HonestTestimonials on the homepage
 *
 * Brunson Hard-Rule reconciliation: this is ONE specific person, not a
 * market segment. The avatar has a name, an age, a role, a fear, and a
 * dream outcome. Every detail is real — drawn from the actual founder
 * narrative this product was built from.
 */

export interface DesireEntry {
  title: string;
  detail: string;
}

export interface FearEntry {
  title: string;
  detail: string;
}

export interface AwarenessStage {
  stage: string;
  label: string;
  description: string;
  /** The message Unlock SaaS surfaces to someone at this awareness level. */
  ourMessage: string;
}

export const DREAM_CUSTOMER = {
  name: "Maryan",
  ageRange: "28-42",
  role: "Non-engineer founder who shipped a real product with AI tools",
  oneLiner:
    "A builder who used Lovable, Bolt, Cursor, or Claude to ship something real in weeks — and is now staring at a flat Stripe line wondering why the product isn't the problem they thought it was.",

  thePerson: {
    background:
      "Spent years in a role that didn't let them build. Then AI tools opened the door. They shipped a real product in weeks — something that works, something they're proud of. The shipping part felt like magic.",
    currentReality:
      "They launched. They opened Stripe. They refreshed. The line stayed flat. They tried posting on X, submitted to Product Hunt, maybe wrote a thread. A few signups. No charges. The product works. Nobody pays.",
    internalState:
      "Confused, then defensive, then quietly ashamed. They don't tell their partner how flat the line is. They start wondering if the product is bad — but they know it isn't, because they use it themselves. The dissonance is the pain.",
    dreamOutcome:
      "One Stripe charge. One person who has no relationship to them — no friendship discount, no 'I'll promote you' trade — entering a card for the product because it solves a real problem they have. That single charge is what they're actually building toward.",
  },

  theFiveDesires: [
    {
      title: "One verified paying customer",
      detail:
        "Not a thousand users. One person who pays. The Stripe charge is the proof that what they built is worth something to a stranger.",
    },
    {
      title: "A named person, not a segment",
      detail:
        "They're tired of 'SMB founders' and 'indie hackers.' They want to know the ONE person — name, role, fear, daily reality — so every decision has a target.",
    },
    {
      title: "A repeatable path, not a viral spike",
      detail:
        "They've seen the launch-day spike. It crashes. They want the boring, repeatable work that turns into a customer a week, not a customer once.",
    },
    {
      title: "Permission to sell before it's perfect",
      detail:
        "They keep polishing the product because selling feels premature. They want someone to tell them: the product is ready. The selling is the missing piece.",
    },
    {
      title: "A system that removes avoidance",
      detail:
        "They avoid the distribution work because it's unstructured. They want a code-locked system that makes the next action obvious and the skip painful.",
    },
  ] as DesireEntry[],

  theFiveFears: [
    {
      title: "The product is actually bad",
      detail:
        "They use it themselves and it works — but maybe they're the only one who needs it. The fear that the market doesn't exist.",
    },
    {
      title: "They're not a 'real' founder",
      detail:
        "They didn't write the code. AI tools did. The fear that this disqualifies them from charging, from being taken seriously, from belonging.",
    },
    {
      title: "Selling feels slimy",
      detail:
        "They associate selling with pressure, manipulation, dark patterns. The fear that doing the distribution work will make them into someone they don't want to be.",
    },
    {
      title: "They'll waste months on the wrong tactic",
      detail:
        "They've already tried posting, launching, threads. The fear that the next tactic will be another dead end and another month of flat line.",
    },
    {
      title: "The shame of the flat line",
      detail:
        "They can't tell their peers. The launch tweet got likes. The private reality is zero charges. The fear of being exposed as a fraud.",
    },
  ] as FearEntry[],

  awarenessLadder: [
    {
      stage: "Unaware",
      label: "Hasn't named the problem yet",
      description:
        "Knows the line is flat but blames the product, the market, the timing. Hasn't yet identified that the missing piece is distribution work, not more building.",
      ourMessage:
        "We don't target them directly. They find us through search when they start typing 'why is my SaaS not growing.'",
    },
    {
      stage: "Problem-Aware",
      label: "Knows the problem, not the solution",
      description:
        "Has named it: 'I shipped and nobody pays.' Searching for answers. Reading indie hacker threads, watching YouTube, trying tactics.",
      ourMessage:
        "The /why-isnt-my hub and the diagnostic meet them here. The diagnostic gives them a named reason in 2 minutes.",
    },
    {
      stage: "Solution-Aware",
      label: "Knows solutions exist, evaluating",
      description:
        "Has seen courses, gurus, accelerator programs. Comparing. Skeptical of anything that smells like a course.",
      ourMessage:
        "The Playbook's refund-by-Stripe-charge guarantee and the /dont-buy-unlock-saas page meet them here. The polarity move.",
    },
    {
      stage: "Product-Aware",
      label: "Knows Unlock SaaS specifically",
      description:
        "Has read the homepage, maybe took the diagnostic. Deciding if THIS product is the one.",
      ourMessage:
        "The stack slide, the founding builder scarcity, and the 60-day guarantee close this stage.",
    },
    {
      stage: "Most-Aware",
      label: "Ready to buy, needs the final push",
      description:
        "Has decided. Needs the checkout button and one last reason to act today instead of tomorrow.",
      ourMessage:
        "The /playbook-sales page and the honest scarcity (no fake countdown, just real reasons to decide now).",
    },
  ] as AwarenessStage[],

  whereTheyHangOut: [
    {
      place: "Indie Hackers (site + Discord)",
      why: "The milestone feed is full of 'launched, zero customers' posts. This is where the pain is named publicly.",
    },
    {
      place: "X / Twitter (build-in-public hashtag)",
      why: "Daily shipping logs. The gap between 'shipped!' and 'first customer' shows up in real time.",
    },
    {
      place: "Lovable / Bolt / Cursor Discords",
      why: "Where they built the product. The next question they ask there is 'how do I get users?'",
    },
    {
      place: "r/SaaS, r/Entrepreneur, r/nocode (Reddit)",
      why: "Long-form 'I launched and got zero' posts. The advice in comments is usually wrong — that's our opening.",
    },
    {
      place: "MicroConf Connect (Slack)",
      why: "Smaller, more sophisticated. But the post-launch gap shows up here too, just named more precisely.",
    },
  ],

  theBigLie: {
    lie: "If you build something good, customers will come.",
    whyItsWrong:
      "This is the lie the AI-tool era made worse. The tools made building free, so everyone shipped. The bottleneck moved — it's no longer building, it's distribution. The people who earn didn't build better products. They did the unglamorous distribution work nobody taught.",
    ourReplacement:
      "The product is not the bottleneck. The missing piece is naming one real person, making one real promise, and doing the distribution work before it feels ready. That work is learnable, repeatable, and it's what the Playbook is.",
  },
} as const;
