/**
 * /how-to/[slug] pSEO catalog – "How to get your first SaaS customer" guides.
 *
 * Each entry answers a specific "how to" query that founders search when
 * they have built a product and need the playbook for acquisition.
 *
 * High-volume intent: "how to get first SaaS customer free", "how to find
 * first beta users", "how to cold email SaaS founders", "how to get your
 * first 100 users".
 *
 * Brunson Hard-Rule reconciliation:
 *   - Every strategy must be specific enough that a founder could execute
 *     it today.
 *   - No "growth hacks" that worked in 2020 but are dead now.
 *   - Numbers must be directional or sourced.
 */

export interface HowToEntry {
  /** URL slug, kebab-case. */
  slug: string;
  /** H1 / page title. */
  title: string;
  /** SEO meta title, under 60 chars. */
  metaTitle: string;
  /** SEO meta description, under 160 chars. */
  metaDescription: string;
  /** One-line summary shown on the hub card. */
  oneLine: string;
  /** 2–3 sentence lead paragraph. */
  lead: string;
  /** Numbered steps (3–7 steps). */
  steps: ReadonlyArray<{
    heading: string;
    body: string;
  }>;
  /** 2–3 pro tips. */
  proTips: ReadonlyArray<string>;
  /** Related glossary slugs. */
  relatedGlossary: ReadonlyArray<string>;
  /** Category for hub grouping. */
  category:
    | "cold-outreach"
    | "warm-outreach"
    | "community"
    | "content"
    | "product";
  /** ISO date last verified. */
  lastVerified: string;
}

export const HOW_TO_ENTRIES: ReadonlyArray<HowToEntry> = [
  // -------------------------------------------------------------------
  // Cold outreach
  // -------------------------------------------------------------------
  {
    slug: "get-first-saas-customer-via-cold-dm",
    title: "How to get your first SaaS customer via cold DM (the 5-step playbook)",
    metaTitle:
      "Get Your First SaaS Customer via Cold DM: 5-Step Playbook",
    metaDescription:
      "Your first SaaS customer will not come from SEO or ads. They will come from a personal DM. Here is the exact 5-step cold DM system that works for pre-revenue founders.",
    oneLine:
      "The first customer comes from a conversation, not a landing page. Here is the exact cold DM system that works.",
    lead: "The uncomfortable truth every founder eventually learns: your first paying customer will not come from SEO, ads, Product Hunt, or Hacker News. They will come from a single direct message you send to a single person who matches your dream customer profile. The DM channel works because it bypasses the noise — no algorithm, no landing page optimization, no A/B testing. Just a human being reading your message and deciding to trust you. This playbook works for any SaaS product, at any price point, with zero existing audience.",
    steps: [
      {
        heading: "Step 1: Define your 20-person target list",
        body: "List 20 people who match your dream customer exactly. Not vaguely — exactly. If your product helps freelancers send better proposals, list 20 freelancers who have recently posted about struggling to win clients. Use LinkedIn, Twitter advanced search, Indie Hackers, or industry directories. The key filter: they must have expressed the exact pain your product solves, publicly, within the last 30 days. That expression is your permission to message them.",
      },
      {
        heading: "Step 2: Write the first sentence",
        body: "The first sentence must show you read their profile. 'Hey [name], saw your post about cold email conversion rates' works. 'Hey, I built a tool you might like' does not. Take 30 seconds to find something specific — a recent post, a job change, a comment they left. Reference it in the first 5 words. That single signal (you read their content) is worth more than any offer you can make.",
      },
      {
        heading: "Step 3: Frame the offer as a favor, not a sale",
        body: 'Do not ask them to buy. Ask them to try it and tell you what they think. The framing matters: "I built this for people like you — would you try it for free for a week and tell me if it saves you time?" signals that you value their opinion, not their credit card. The first payment almost always comes from someone who started as a free trial user who wanted to keep using it after the trial ended.',
      },
      {
        heading: "Step 4: Send 5 DMs, wait 48 hours, then send the next 5",
        body: "Batch your outreach. Send 5 DMs. Wait 48 hours. If 2+ replied, your targeting and message are working — send the next 5. If fewer than 2 replied, change your first sentence or your target list. Do not send all 20 at once — you need feedback from the first batch to tune the message before you waste the remaining 15.",
      },
      {
        heading: "Step 5: Turn the first reply into a 10-minute call",
        body: 'When someone replies, respond within an hour. Say: "Thank you for replying. Could I show you the tool for 10 minutes? No pitch — I just want to see if it actually helps with [their specific problem]. If it does, great. If not, tell me honestly." Use the call to listen, not to demo. Ask: "What do you use now? What does it miss?" The answers are your product roadmap.',
      },
    ],
    proTips: [
      "LinkedIn DMs convert at 3-5x the rate of email cold outreach for B2B SaaS because the profile context is right there. Use it.",
      "Send DMs from a real profile with a photo and a history. A blank profile DM goes straight to 'requests' on most platforms.",
      "The best time to send is Tuesday or Wednesday morning in the recipient's timezone. Monday is busy catching up; Friday people are checked out.",
    ],
    relatedGlossary: ["outreach", "dream-100", "cold-email"],
    category: "cold-outreach",
    lastVerified: "2026-07-06",
  },
  // -------------------------------------------------------------------
  // Warm outreach
  // -------------------------------------------------------------------
  {
    slug: "find-first-beta-users-without-an-audience",
    title: "How to find your first beta users when you have zero audience",
    metaTitle:
      "Find First Beta Users with Zero Audience: 4 Channels That Work",
    metaDescription:
      "No Twitter following, no email list, no network. Here is how to find your first beta users using 4 channels that do not require any existing audience.",
    oneLine:
      "Zero followers, zero email list, zero network — and still found beta users in 72 hours. Here is how.",
    lead: 'The standard advice — "build in public on Twitter" — assumes you already have a Twitter following. If you are starting from zero, that advice is useless for the next 6 months. You need beta users now, not after you have tweeted daily for a year. The four channels below work without any audience because they put you in front of people who are already looking for what you are building. They are looking on Reddit, Indie Hackers, niche Slack communities, and product directories. Your job is to find them and show up as a helper, not a promoter.',
    steps: [
      {
        heading: "Step 1: Find the pain on Reddit",
        body: "Go to Reddit and find the subreddit where your target customer complains about the problem your product solves. Search for phrases like 'I wish there was a tool that...' or 'does anyone know a way to...' or 'I am so tired of...' in subreddits related to your niche. Sort by new. Every post in that list is a potential beta user who has literally asked for your product. Reply with value (a how-to, a workaround, a template), then offer your beta access as a footnote.",
      },
      {
        heading: "Step 2: Join 3 niche Slack communities",
        body: "Indie Hackers, MicroConf, and niche industry Slacks have thousands of founders looking for tools. Search Slofile or simply 'Slack community for [your niche]' to find active groups. Join 3. Do not post a link on day one. Spend a week answering questions and being helpful. On day 8, post: 'I built a tool that does [X] — anyone want free beta access in exchange for feedback?' The week of goodwill means people trust you enough to click.",
      },
      {
        heading: "Step 3: Post on Indie Hackers as a 'build in public' thread",
        body: 'Indie Hackers does not require a following. Start a thread titled "Building [product name] — a [one-line description]" in the Building category. Update it weekly. The IH community is actively looking for new tools to try. Include a clear CTA: "Beta open now — free for the first 20 people in exchange for a 15-minute call." The first batch of signups will come from other founders who want to support your journey (and explore your tool for their own needs).',
      },
      {
        heading: "Step 4: List on 3 free directories",
        body: 'Product Hunt (as a "coming soon" page), BetaList, and Uneed.best are free directories that put your product in front of people actively browsing for new tools. A well-written listing with a screenshot and a clear value prop can generate 20–100 signups without any existing audience. The key is the one-liner: it must name the specific outcome, not the feature set.',
      },
    ],
    proTips: [
      "Offer beta access for free, but require a 15-minute feedback call. The call requirement filters out tire-kickers and gives you the qualitative data you need to iterate.",
      "Track which channel each signup came from (use UTM params or a simple 'how did you hear about us?' field). Double down on the channel that produces the most engaged testers.",
      "The first 5 beta users who give detailed feedback are worth more than 50 who signed up and ghosted. Prioritize depth over volume.",
    ],
    relatedGlossary: ["mvp", "traction", "product-market-fit"],
    category: "warm-outreach",
    lastVerified: "2026-07-06",
  },
  // -------------------------------------------------------------------
  // Community
  // -------------------------------------------------------------------
  {
    slug: "get-first-100-saas-users-through-communities",
    title: "How to get your first 100 SaaS users (the community-first playbook)",
    metaTitle:
      "Get First 100 SaaS Users: Community-First Growth Playbook",
    metaDescription:
      "The fastest path to 100 users for a pre-revenue SaaS is not ads or SEO — it is becoming indispensable in the right community. Here is the exact playbook.",
    oneLine:
      "100 users, zero ad spend, zero SEO. The community-first playbook for pre-revenue SaaS founders.",
    lead: 'Getting from zero to 100 users is the hardest transition for any SaaS. The common advice — "buy ads," "invest in SEO," "do content marketing" — assumes you have months of runway and existing distribution. The faster path is community-first growth: find an existing community where your target user congregates, become the most helpful person in that community, and let your product be the natural next step for people who trust you. This is not a "growth hack." It is a repeatable system that works for any niche, any price point, and any SaaS product.',
    steps: [
      {
        heading: "Step 1: Find the one community with the highest pain density",
        body: 'Not the biggest community — the one with the highest pain density. A Slack group of 200 agency owners who are actively complaining about client onboarding is worth more than a subreddit of 50,000 people who occasionally talk about "productivity." Search for: "niche Slack communities [your industry]", "Facebook groups for [your audience]", "Discord servers for [your niche]". Spend an hour reading the top posts. If the same pain appears in 5+ posts per day, this is the community.',
      },
      {
        heading: "Step 2: Help for 7 days without mentioning your product",
        body: "This is the hard part. For one week, answer questions, share resources, and offer advice that relates to your product's domain — without ever mentioning your product. If your product helps with cold email, share cold email templates. If it helps with project management, share a simple workflow. The goal is not to drive traffic. The goal is to become the person people tag when someone asks 'does anyone know how to do X?'",
      },
      {
        heading: "Step 3: Announce your product as a solution to a problem you keep seeing",
        body: 'After a week of being helpful, make one post: "I keep seeing people ask about [problem]. I actually built a tool that solves it. It is free for beta testers — here is the link. If you try it, I would love your feedback." The framing matters: you are not selling, you are responding to a need the community has expressed repeatedly. Your week of prior help means the community trusts your intentions.',
      },
      {
        heading: "Step 4: Turn every user into a referral source",
        body: 'When someone signs up, ask them: "Who else in this community has the same problem? Can I reach out to them?" Most will say yes or even make the introduction themselves. Each introduction is 2-3 more users. Track these in a simple spreadsheet. By week 4, referrals from your first users should outpace direct signups from your announcement post.',
      },
      {
        heading: "Step 5: Stay in the community and keep helping",
        body: "Do not disappear after the announcement. Keep answering questions, keep sharing value. Every post you make is another signal that you are in it for the community, not just for the users. The long tail of community-first growth comes from the second wave: people who saw your announcement but were not ready, then saw you being helpful for another month, then tried your product. This wave converts at 3x the rate of the first.",
      },
    ],
    proTips: [
      "The best communities for early-stage growth are private Slack groups and Discords with 200–2,000 members. Large public groups (subreddits with 100k+) have too much noise and too many spammers.",
      "Set a calendar reminder: 15 minutes per day in the community. Consistency matters more than volume. A daily helpful comment beats a weekly essay.",
      'Track "mentions before product" — count how many times people tag you in threads about the problem before you mention your tool. That number is your demand validation metric.',
    ],
    relatedGlossary: ["traction", "outreach", "community"],
    category: "community",
    lastVerified: "2026-07-06",
  },
  // -------------------------------------------------------------------
  // Product-led
  // -------------------------------------------------------------------
  {
    slug: "get-first-saas-customer-with-free-tier",
    title: "How to get your first SaaS customer with a free tier (without getting burned)",
    metaTitle:
      "Get First SaaS Customer with a Free Tier: The Right Way",
    metaDescription:
      "A free tier can be your fastest path to a first paying customer — or a magnet for tire-kickers. Here is how to design a free tier that converts, not one that drains you.",
    oneLine:
      "Free tiers work — if they end. Here is the framework: time-boxed, value-first, with a hard conversion gate.",
    lead: 'The free tier debate is polarized. One camp says "never give it away for free — it devalues your product." The other says "free is the only way to get traction at zero." Both are right and both are wrong. A free tier that ends (time-boxed, feature-capped, or usage-capped) is the fastest credibility builder for a pre-revenue SaaS. A free tier that never ends attracts tire-kickers who fill your support queue and never pay. The difference is the structure. Here is how to design a free tier that converts.',
    steps: [
      {
        heading: "Step 1: Time-box the free tier",
        body: 'Give 14 days of full access. No credit card required. After 14 days, access stops unless they upgrade. This is the most common and most effective model because it creates urgency without requiring a commitment. The 14-day window is enough time for the user to get value, integrate the tool into their workflow, and feel the loss when access expires. That loss feeling is the conversion trigger.',
      },
      {
        heading: "Step 2: Require one action during the free trial",
        body: 'Do not let users passively consume. On day 3, send an email: "Set up your first [workflow/project/campaign] — it takes 5 minutes." On day 7: "You have used [X%] of your trial. Here is what [successful customer] achieved in their first week." The goal is to get the user to the "aha moment" (the point where they realize the tool solves their specific problem) before the trial ends. If they reach the aha moment, they will pay.',
      },
      {
        heading: "Step 3: Have a hard cutoff",
        body: "When the trial ends, access ends. No 7-day extensions, no 'free forever' fallback tier. A hard cutoff is the cleanest conversion mechanism. Soft cutoffs (limits instead of blocks) let the user keep using the tool indefinitely without paying — which means you have a free user, not a potential customer.",
      },
      {
        heading: "Step 4: Offer a discount for annual commitment at trial end",
        body: 'When the trial ends and the user sees the cutoff screen, offer: "Switch to annual and get 20% off + 7 more days free." The annual commitment signals serious intent. The discount makes the decision easier. The extra 7 days give the user time to set up their account properly before paying.',
      },
      {
        heading: "Step 5: Follow up with non-converters after 30 days",
        body: 'Send one email 30 days after the trial ended: "Your free trial expired on [date]. We noticed you did not upgrade. What stopped you? Reply honestly — I read every response." Most will not reply. The ones who do give you the most valuable product feedback you will ever get. A small fraction will ask to re-try — give them 7 more days.',
      },
    ],
    proTips: [
      "14-day trials convert better than 7-day or 30-day trials. 7 days is too short for most B2B workflows; 30 days is too long — users procrastinate.",
      'Do not ask for a credit card upfront if you are at zero users. The friction kills signups. Ask for the card on day 14 when the user already knows the value.',
      'Track "time to aha moment" as your North Star metric. If users reach the aha moment in the first 3 days, your trial-to-paid conversion rate will be 2-3x higher.',
    ],
    relatedGlossary: ["pricing-page", "offer", "value-ladder"],
    category: "product",
    lastVerified: "2026-07-06",
  },
  // -------------------------------------------------------------------
  // Content
  // -------------------------------------------------------------------
  {
    slug: "get-first-saas-customers-with-content-marketing",
    title: "How to get your first SaaS customers with content marketing (on zero budget)",
    metaTitle:
      "Get First SaaS Customers with Content Marketing (Zero Budget)",
    metaDescription:
      "Content marketing for a pre-revenue SaaS sounds expensive — until you realize the cheapest content is already in your head. Here is how to write 5 articles that bring your first customers.",
    oneLine:
      "You do not need a $5,000 content budget. You need 5 articles that answer the exact questions your first 10 customers are searching for.",
    lead: 'Content marketing is the most recommended and least executed channel for pre-revenue founders. The reason is not that content does not work — it is that most founders write the wrong content. They write about features ("10 reasons our AI-powered dashboard is better") instead of the exact problem their customer is trying to solve ("how to reduce cold email bounce rate from 20% to 5%"). The second type of content ranks faster, converts better, and does not require a large audience to distribute. Here is how to write 5 articles that bring your first paying customers, with zero budget.',
    steps: [
      {
        heading: "Step 1: Find 5 questions your customer types into Google",
        body: 'Go to Reddit, Quora, or niche forums. Find the 5 most common questions your target customer asks about the problem your product solves. Not questions about your product — questions about the problem. If your product helps write cold emails, the question is "how do I write a cold email that gets replies?" not "is [your product] better than [competitor]?" Use AnswerThePublic or simply Google autocomplete to find the exact phrasing people use.',
      },
      {
        heading: "Step 2: Write the answer as a complete guide",
        body: 'For each question, write a 1,500–2,000 word guide that answers it completely. No fluff, no "10 reasons to choose X" — just the answer. Use the exact language your customer uses. If they say "cold email bounce rate," do not say "email deliverability metrics." Match their vocabulary for SEO and for trust.',
      },
      {
        heading: "Step 3: Add your product as a solution, not the solution",
        body: 'In each guide, mention your product as one of several ways to implement the answer. Not "use [product name] for best results," but "if you want to automate this, tools like [product name] handle [specific step]." Being one of several options signals honesty and builds trust. The reader who finishes the guide and wants to implement will remember the product that helped them learn.',
      },
      {
        heading: "Step 4: Publish on your domain + Medium + Dev.to",
        body: "Publish the original on your own domain for SEO. Then republish on Medium and Dev.to (or LinkedIn Articles) with a canonical link back to your domain. The republished versions bring traffic from platforms that already have reader trust, while the canonical link passes SEO value to your domain.",
      },
      {
        heading: "Step 5: Share in every relevant community thread",
        body: 'For each guide, find 5–10 forum or group threads where someone asks the exact question the guide answers. Share the guide as a reply: "I wrote a guide on this — here is the tl;dr version: [2–3 sentence summary]. Full guide at [link] if you want the details." Do this for each guide once, not once per week. One share per thread, forever.',
      },
    ],
    proTips: [
      "The first 5 articles should target 'learning' keywords, not 'buying' keywords. 'How to reduce email bounce rate' gets more traffic and converts more pre-revenue founders than 'best cold email tool 2026.'",
      "Internal-link between guides. If guide 1 mentions bounce rate and guide 2 covers deliverability, link them. Each link passes SEO authority and keeps the reader on your site.",
      'Update each guide every 3 months. Google ranks freshness. Add one new section or update one statistic. Set a calendar reminder.',
    ],
    relatedGlossary: ["seo", "content-marketing", "traction"],
    category: "content",
    lastVerified: "2026-07-06",
  },
];

export const HOW_TO_SLUGS: ReadonlyArray<string> = HOW_TO_ENTRIES.map(
  (h) => h.slug,
);

export function getHowToBySlug(slug: string): HowToEntry | undefined {
  return HOW_TO_ENTRIES.find((h) => h.slug === slug);
}

export const HOW_TO_CATEGORIES = [
  "cold-outreach",
  "warm-outreach",
  "community",
  "content",
  "product",
] as const;

export const HOW_TO_CATEGORY_LABELS: Record<
  (typeof HOW_TO_CATEGORIES)[number],
  string
> = {
  "cold-outreach": "Cold outreach",
  "warm-outreach": "Warm outreach",
  community: "Community growth",
  content: "Content marketing",
  product: "Product-led growth",
};
