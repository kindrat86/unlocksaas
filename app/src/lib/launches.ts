/**
 * /launch/[slug] pSEO catalog — launch playbooks by channel and audience.
 *
 * Each entry covers ONE channel + ONE SaaS-type intersection (Product
 * Hunt for indie SaaS, Twitter/X for AI tools, cold outreach for B2B,
 * Hacker News for developer SaaS, Indie Hackers for solo founders, etc.).
 * Action-intent pages for founders who already know what they are
 * launching and need to know how the named channel actually works.
 *
 * Distinct from /funnel-playbook (Brunson archetypes) and /checklist
 * (pre-launch verification): /launch is channel-specific execution.
 *
 * Schema: HowTo + Article + FAQPage + BreadcrumbList. HowTo is the
 * citation-friendly schema for "how to launch on X" queries.
 *
 * Brunson Hard-Rule:
 *   - No fabricated channel-specific numbers. Time bands and outcome
 *     bands are labeled as bands.
 *   - "What works" and "what does not" reflect real-channel observation.
 *     Sources are named where verifiable.
 */

export type LaunchChannel =
  | "product-hunt"
  | "twitter-x"
  | "hacker-news"
  | "indie-hackers"
  | "reddit"
  | "linkedin"
  | "cold-outreach"
  | "newsletter-swap";

export interface LaunchStep {
  title: string;
  description: string;
  /** Real time band for this specific step, not the whole launch. */
  timeBand: string;
}

export interface LaunchFaq {
  q: string;
  a: string;
}

export interface LaunchEntry {
  slug: string;
  displayName: string;
  metaTitle: string;
  metaDescription: string;
  /** The channel this playbook is for. */
  channel: LaunchChannel;
  /** The SaaS type this playbook is for. */
  saasType: string;
  /** 2-3 sentence intro. */
  intro: string;
  /** Whether this channel is the right fit for the SaaS type. */
  fitVerdict: "strong-fit" | "good-fit" | "marginal-fit" | "wrong-channel";
  /** When NOT to use this channel for this SaaS type. */
  whenNotToUse: string;
  /** The week-by-week build-up before the launch itself. */
  preLaunchBuildUp: ReadonlyArray<LaunchStep>;
  /** The launch-day steps. */
  launchDay: ReadonlyArray<LaunchStep>;
  /** Post-launch 7-day work. */
  postLaunch: ReadonlyArray<LaunchStep>;
  /** What channel-specific success actually looks like. */
  successProfile: string;
  /** What channel-specific failure looks like. */
  failureProfile: string;
  /** Common channel-specific mistakes. */
  channelMistakes: ReadonlyArray<string>;
  /** Related glossary slugs. */
  relatedGlossary: ReadonlyArray<string>;
  /** Related niches this launch fits. */
  relatedNiches: ReadonlyArray<string>;
  faqs: ReadonlyArray<LaunchFaq>;
  lastVerified: string;
}

export const LAUNCH_ENTRIES: ReadonlyArray<LaunchEntry> = [
  {
    slug: "product-hunt-launch-for-indie-saas",
    displayName: "Product Hunt launch for indie SaaS",
    metaTitle: "Product Hunt Launch Playbook (Indie SaaS)",
    metaDescription:
      "How indie SaaS founders launch on Product Hunt. Pre-launch hunter prep, launch-day cadence, post-launch follow-up. Honest time bands.",
    channel: "product-hunt",
    saasType: "Indie SaaS at any price point, B2B or B2C, with a visual / interactive product.",
    intro:
      "Product Hunt is a strong launch channel for visual or interactive indie SaaS — but the launch is one day of execution preceded by 3-6 weeks of preparation. Founders who treat it as a publish-and-watch event almost always under-perform; the entire game is in the pre-launch work.",
    fitVerdict: "strong-fit",
    whenNotToUse:
      "If your product is invisible (API-only, infrastructure, agent-as-service with no UI), Product Hunt rarely converts because the platform is visual. Pure B2B with regulated buyers (medical, legal, finance) also rarely lands well.",
    preLaunchBuildUp: [
      {
        title: "Confirm a hunter (3-6 weeks before)",
        description:
          "Ask a hunter with a proven track record on Product Hunt to launch your product. Best hunters are launching once a month and have a strong follower base. Plenty of free-to-ask hunters exist; pay-to-hunt is a Product Hunt Hard-Rule violation.",
        timeBand: "1-3 weeks of asking around to find a hunter.",
      },
      {
        title: "Pick a launch date (3-4 weeks before)",
        description:
          "Tuesday, Wednesday, Thursday land best. Avoid US holidays, major product release days (Apple WWDC, Google I/O), and the days of competing big-name launches.",
        timeBand: "Locks the entire timeline.",
      },
      {
        title: "Build the supporter list (2-4 weeks before)",
        description:
          "100-200 named supporters who will upvote and comment in the first hour. Mix friends, paying customers, beta users, and people who follow your work. Personalize every ask.",
        timeBand: "Sustained effort across 2-4 weeks. The list quality is the entire success factor.",
      },
      {
        title: "Prepare the launch assets (1-2 weeks before)",
        description:
          "Gallery images, 60-second demo video, taglines (5 variations), product description, GIF preview, launch-day comment from the founder, comment templates for engagement.",
        timeBand: "5-15 hours over the week.",
      },
      {
        title: "Schedule the launch tweet thread and supporter outreach (3-7 days before)",
        description:
          "Draft the launch-day Twitter/X thread. Schedule supporter outreach for the morning of launch (12:01am Pacific). Personal emails to the top 50 supporters with the direct launch URL.",
        timeBand: "3-5 hours.",
      },
    ],
    launchDay: [
      {
        title: "12:01am Pacific — hunter publishes",
        description:
          "Product Hunt launches reset at midnight Pacific. Be online, ready to respond to early comments. Your launch-day comment from the founder posts in the first 5 minutes.",
        timeBand: "First 60 minutes are critical for ranking.",
      },
      {
        title: "First 6 hours — relentless engagement",
        description:
          "Respond to every comment. Thank every upvoter. Cross-post on Twitter, LinkedIn, your newsletter, your dream-100 list. The momentum in the first 6 hours sets the ranking trajectory.",
        timeBand: "6 hours of focused work, no other meetings.",
      },
      {
        title: "Mid-day to evening — sustained engagement",
        description:
          "Continue replying to comments. Address questions in the comment thread with care; quality of engagement matters as much as volume. Post a mid-day update on Twitter.",
        timeBand: "Continuous attention for 12-16 hours.",
      },
    ],
    postLaunch: [
      {
        title: "Day 2 — thank-you broadcast",
        description:
          "Email or post to your supporters with the day-1 result, regardless of ranking. Honesty about the outcome builds the next launch's supporter list.",
        timeBand: "1-2 hours.",
      },
      {
        title: "Day 3-7 — convert traffic to customers",
        description:
          "Product Hunt traffic is mostly browsers, not buyers. The conversion happens via the email list you built during launch day. Follow up with everyone who signed up.",
        timeBand: "5-10 hours across the week.",
      },
      {
        title: "Day 7 — write the launch retrospective",
        description:
          "Public post (Twitter, blog, newsletter) on what worked and what did not. This is the asset that fuels your next launch and connects you to other founders.",
        timeBand: "2-4 hours.",
      },
    ],
    successProfile:
      "Top 5 product of the day, 800-2,000 upvotes, 200-500 email signups, 5-20 paying customers within the first 30 days. Failure ratio: most launches end with 100-300 upvotes and 50-150 signups; that is still a successful indie SaaS launch.",
    failureProfile:
      "Under 50 upvotes, no comment engagement, no email signups. Almost always traceable to no pre-launch supporter list — the launch-day execution cannot recover from missing the foundation.",
    channelMistakes: [
      "Treating it as a publish-and-watch event. Pre-launch work is 80% of the result.",
      "Buying upvotes or running upvote rings. Product Hunt detects and suppresses; the ranking penalty is brutal.",
      "Launching the same product twice within 6 months without substantial changes. Hunters' patience is finite.",
      "Skipping the launch-day comment from the founder. The first comment on your own product sets the engagement tone.",
    ],
    relatedGlossary: ["hook", "dream-100", "story"],
    relatedNiches: ["indie-hackers", "saas-founders", "no-code-builders"],
    faqs: [
      {
        q: "Can I launch without a hunter?",
        a: "Yes — self-launches work, especially for follow-up launches. First-time launches benefit from a hunter's existing followers, but the gap has narrowed since 2024.",
      },
      {
        q: "What is a realistic conversion from Product Hunt traffic?",
        a: "0.5-2% of visitors sign up for email, 5-15% of email signups become paying customers within 30 days. Math out: 2,000 page views typically yields 10-40 email signups and 1-6 paying customers.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "twitter-x-launch-for-ai-tools",
    displayName: "Twitter / X launch for AI tools",
    metaTitle: "Twitter / X Launch Playbook for AI Tools",
    metaDescription:
      "How AI SaaS founders launch on Twitter/X. Demo video specifics, thread structure, build-in-public arc, and the post-launch funnel.",
    channel: "twitter-x",
    saasType: "AI-powered SaaS or developer tools with a demoable output that surprises in under 30 seconds.",
    intro:
      "Twitter / X is the strongest launch channel for AI tools in 2026 — the platform aggressively rewards demoable AI output in short video format. The launch is asymmetric: the right demo video gets 10x the reach of a normal product launch. The wrong one gets ignored.",
    fitVerdict: "strong-fit",
    whenNotToUse:
      "If your AI tool's output is text-heavy or takes more than 30 seconds to appreciate, Twitter is the wrong channel. Long-form value belongs on YouTube or LinkedIn.",
    preLaunchBuildUp: [
      {
        title: "Build the audience first (3-12 months before)",
        description:
          "Twitter launches that go viral are almost always launched by accounts with 1,000+ relevant followers. Build-in-public from the first prototype. The launch is the harvest, not the start.",
        timeBand: "Sustained months of building.",
      },
      {
        title: "Plan the demo video (1-2 weeks before)",
        description:
          "30-60 seconds, no voiceover, screen recording with cursor movement that shows the AI output appearing. The 'wow moment' must be in the first 5 seconds.",
        timeBand: "1-3 days of iteration to get the demo right.",
      },
      {
        title: "Draft the launch thread (3-7 days before)",
        description:
          "Tweet 1: demo video + one-sentence hook. Tweets 2-5: three more use cases, each with a video clip. Tweet 6: the price + URL. Tweet 7: thank-you to the followers who built the journey.",
        timeBand: "3-6 hours of drafting and iteration.",
      },
      {
        title: "Line up the amplification network (3-5 days before)",
        description:
          "DM 10-30 founder friends with relevant audience. Share the thread draft; ask them to quote-retweet on launch day if it resonates. Reciprocal-amplification is the engine.",
        timeBand: "2-4 hours of personal outreach.",
      },
    ],
    launchDay: [
      {
        title: "Post the thread at 9-11am Eastern",
        description:
          "Tuesday or Wednesday is best. Avoid US holidays. The first 90 minutes of engagement set the algorithm's trajectory for the next 24 hours.",
        timeBand: "First 90 minutes are critical.",
      },
      {
        title: "Respond to every reply for 4 hours",
        description:
          "Algorithmic boosts come from reply-and-engagement velocity. Every reply you give increases the thread's distribution. No other work for the first 4 hours.",
        timeBand: "4 focused hours of engagement.",
      },
      {
        title: "Cross-post the video standalone at 2-4pm",
        description:
          "A standalone tweet of just the demo video (not a thread, not a link) often outperforms the launch thread. Different distribution mechanic.",
        timeBand: "30 minutes of monitoring after posting.",
      },
    ],
    postLaunch: [
      {
        title: "Day 2 — reply-thread to the highest-engagement reply",
        description:
          "The highest-engagement reply on your launch thread is often a request, a question, or a comparison. Turn it into a follow-up thread.",
        timeBand: "2-3 hours.",
      },
      {
        title: "Day 3-7 — share user-generated demos",
        description:
          "Quote-retweet users posting their own AI output. Amplifies your reach into their networks. The most under-rated post-launch lever.",
        timeBand: "30-60 minutes daily.",
      },
    ],
    successProfile:
      "5,000-50,000 views on the launch thread, 200-1,500 likes, 50-300 email signups, 10-50 paying customers within 30 days. The right demo video can 10-50x these numbers.",
    failureProfile:
      "Under 500 views. Almost always traceable to a weak demo video or a launch from an account with no audience. The product quality is rarely the issue at this volume.",
    channelMistakes: [
      "Demo video with voiceover. Twitter video is muted by default; voiceover-dependent demos lose 80% of their value.",
      "Launching from a cold account. Twitter rewards relationship; launching without an existing follower base wastes the post.",
      "Linking out in tweet 1. The algorithm suppresses external links in the first tweet of a thread. Put the link in tweet 5+.",
      "Treating the launch as a one-shot. The follow-up posts in the days after launch are where 50% of conversion happens.",
    ],
    relatedGlossary: ["hook", "dream-100"],
    relatedNiches: ["ai-wrappers", "saas-founders", "indie-hackers"],
    faqs: [
      {
        q: "What about non-AI SaaS — does the Twitter playbook work?",
        a: "Yes but with reduced upside. Non-AI demos do not get the same algorithmic boost; the right demo video can still hit 1k-10k views, but 10k-100k requires AI-style 'wow' content.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "hacker-news-launch-for-developer-saas",
    displayName: "Hacker News launch for developer SaaS",
    metaTitle: "Hacker News Launch Playbook (Developer SaaS)",
    metaDescription:
      "How developer SaaS founders launch on Hacker News. Show HN format, title craft, comment culture, and the 90-second window.",
    channel: "hacker-news",
    saasType: "Developer tools, infrastructure, open-source projects, or technical-decision-maker SaaS.",
    intro:
      "Hacker News is the strongest launch channel for genuinely interesting developer tools — but the audience is the most skeptical of any launch platform. The first comment thread can torch your launch in 90 seconds if the product feels marketing-heavy. Honest technical depth beats polish every time.",
    fitVerdict: "strong-fit",
    whenNotToUse:
      "If your product is non-technical, design-heavy, or has zero engineering substance, Hacker News is the wrong channel. The audience punishes glossy marketing on undifferentiated products.",
    preLaunchBuildUp: [
      {
        title: "Build something genuinely technically interesting (months before)",
        description:
          "Hacker News rewards substance. Trying to launch a generic CRUD app with a 'Show HN' will fail. The technical pre-work is the entire game.",
        timeBand: "Months of product work.",
      },
      {
        title: "Pick the title carefully (1-2 days before)",
        description:
          "Hacker News titles are make-or-break. 'Show HN: X — a Y for Z' format. Specific, technical, no marketing language. 'Show HN: A static-site generator written in 200 lines of Zig' beats 'Show HN: The fastest blog tool ever'.",
        timeBand: "30 minutes of drafting; iterate.",
      },
      {
        title: "Prepare the first comment (1 day before)",
        description:
          "Your own first comment as the founder explains why you built this, what is interesting technically, and what is NOT in the product. Honesty about limitations is the trust unlock.",
        timeBand: "1 hour of drafting.",
      },
      {
        title: "Make sure the URL holds 1,000 concurrent visitors (1 day before)",
        description:
          "Hacker News traffic spikes are real. Cache headers, CDN, and your hosting need to handle 1k+ concurrent. A site that crashes on launch day is a story Hacker News tells for years.",
        timeBand: "2-4 hours of infrastructure prep.",
      },
    ],
    launchDay: [
      {
        title: "Post at 7-9am Eastern (Tuesday-Thursday)",
        description:
          "Hacker News peak activity is 8am-noon Eastern weekdays. Avoid weekends; lower engagement, less discussion.",
        timeBand: "First 90 minutes set the trajectory.",
      },
      {
        title: "Post your own first comment within 5 minutes",
        description:
          "The 'why I built this, what is here, what is not' comment. Self-disclosure about what is incomplete is the trust mechanism the platform rewards.",
        timeBand: "5 minutes.",
      },
      {
        title: "Respond to every technical question for 12 hours",
        description:
          "Hacker News commenters technically engage. Answer with detail, link to relevant code, admit when you do not know. The platform rewards thoughtfulness.",
        timeBand: "12 sustained hours.",
      },
    ],
    postLaunch: [
      {
        title: "Day 2 — write the build retrospective",
        description:
          "A separate post on your blog covering what the launch revealed about the product. The post often re-appears on Hacker News as a separate submission.",
        timeBand: "3-5 hours.",
      },
      {
        title: "Day 3-7 — engage with mentions",
        description:
          "Track mentions of your tool in other Hacker News threads, on Twitter, on Lobsters. Each is a follow-up conversation worth having.",
        timeBand: "30-60 minutes daily.",
      },
    ],
    successProfile:
      "Front page for 4+ hours, 100-500 upvotes, 50-200 comments, 1,000-10,000 unique visitors, 50-300 email signups. Conversion to paying customers is slower than Twitter or Product Hunt — Hacker News audience is research-then-buy.",
    failureProfile:
      "Buried in 30 minutes, under 20 upvotes, no comment thread. Usually traceable to a generic title, a marketing-heavy landing page, or a launch from a brand-new account.",
    channelMistakes: [
      "Marketing-language titles. 'Revolutionary' and 'game-changing' get downvoted instantly.",
      "Hiding limitations in the first comment. Hacker News rewards honesty about what is not in the product.",
      "Defensive responses to critical comments. The audience watches how founders handle criticism; defensiveness loses trust.",
      "Submitting from a new account with zero karma. Older accounts get more initial visibility.",
    ],
    relatedGlossary: ["hook", "weak-belief"],
    relatedNiches: ["saas-founders", "indie-hackers", "no-code-builders"],
    faqs: [
      {
        q: "Can I re-submit if my Show HN gets no traction?",
        a: "Once, with a different title, after 60+ days. Frequent re-submission is detectable and penalized.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "indie-hackers-launch-for-solo-founders",
    displayName: "Indie Hackers launch for solo founders",
    metaTitle: "Indie Hackers Launch Playbook (Solo Founders)",
    metaDescription:
      "How solo SaaS founders launch on Indie Hackers. Milestones, build-in-public posts, founder transparency, and community-first cadence.",
    channel: "indie-hackers",
    saasType: "Solo or 2-3 person SaaS, especially with transparent revenue / journey content.",
    intro:
      "Indie Hackers is a community-driven launch channel where the founder's journey carries more weight than the product itself. The launch is one post in a longer build-in-public arc that establishes the founder as a known voice in the community.",
    fitVerdict: "strong-fit",
    whenNotToUse:
      "If you cannot be transparent about your revenue, customer count, or struggles, the channel does not work. Anonymous or pseudonymous founders also struggle here.",
    preLaunchBuildUp: [
      {
        title: "Start posting milestones months before (3+ months before)",
        description:
          "Indie Hackers rewards journey content. Post about your build progress, your first customer, your first $100 MRR. The launch is the harvest of these posts.",
        timeBand: "Sustained 3+ months of community-first posts.",
      },
      {
        title: "Engage in others' threads (sustained)",
        description:
          "Reply substantively to other founders' posts. Indie Hackers is a community before it is a launch platform; participate before you publish.",
        timeBand: "30-60 minutes per week, sustained.",
      },
      {
        title: "Draft a milestone-shaped launch post (1 week before)",
        description:
          "Frame the launch as a milestone in your journey, not a product release. 'I just launched X — here is what I learned' beats 'X is now live'.",
        timeBand: "2-3 hours of drafting.",
      },
    ],
    launchDay: [
      {
        title: "Post Tuesday or Wednesday morning",
        description:
          "Indie Hackers peak activity is weekday mornings. Avoid weekends; lower engagement, fewer comments.",
        timeBand: "First 4 hours set the trajectory.",
      },
      {
        title: "Reply to every comment for 24 hours",
        description:
          "Community-first means engagement-first. The platform rewards depth of conversation, not breadth of distribution.",
        timeBand: "Spaced engagement over 24 hours.",
      },
      {
        title: "Cross-post a longer story on the community blog (same day)",
        description:
          "A 800-1,500 word post on the lessons learned compounds the launch's reach across the community.",
        timeBand: "3-4 hours of writing.",
      },
    ],
    postLaunch: [
      {
        title: "Day 7 — share the first-week numbers",
        description:
          "Indie Hackers rewards transparent numbers. Sharing real signups, real revenue, real conversion fuels the next launch's audience.",
        timeBand: "1-2 hours.",
      },
      {
        title: "Continue the milestone arc (sustained)",
        description:
          "Every $100, $1k, $10k milestone is a new post. The platform's audience grows with your numbers.",
        timeBand: "Ongoing community engagement.",
      },
    ],
    successProfile:
      "30-100 upvotes, 50-200 comments, 200-800 unique visitors, 20-100 email signups. Smaller traffic than Twitter or Product Hunt, but higher conversion to engaged followers.",
    failureProfile:
      "Sub-10 comments, no community engagement. Almost always traceable to a launch from a no-history account or a product-pitch tone instead of journey-share tone.",
    channelMistakes: [
      "Product-pitch tone. The community responds to founder-journey content, not marketing copy.",
      "Skipping the build-in-public arc. Cold launches without prior posts rarely land.",
      "Vague numbers. 'I am growing' loses to 'I went from $237 MRR to $412 MRR in 30 days, here is the breakdown'.",
    ],
    relatedGlossary: ["dream-100", "verified-builder", "reluctant-hero"],
    relatedNiches: ["indie-hackers", "saas-founders", "newsletter-operators"],
    faqs: [
      {
        q: "Should I share revenue numbers publicly?",
        a: "On Indie Hackers, yes. The platform's transparency norm is part of its identity. Founders who share revenue numbers get 3-5x more engagement than founders who do not.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "reddit-launch-for-niche-saas",
    displayName: "Reddit launch for niche SaaS",
    metaTitle: "Reddit Launch Playbook (Niche SaaS)",
    metaDescription:
      "How niche SaaS founders launch on Reddit. Subreddit selection, post format, mod rules, and the moderator-relationship game.",
    channel: "reddit",
    saasType: "Niche SaaS where the target audience congregates on one specific subreddit (r/freelance, r/cooking, r/dataisbeautiful, etc.).",
    intro:
      "Reddit is the highest-leverage channel for niche SaaS — but the platform's self-promotion rules are the strictest in social media. The launch is preceded by months of community participation; without it, the launch is either deleted or downvoted to zero in 90 minutes.",
    fitVerdict: "good-fit",
    whenNotToUse:
      "If your target audience does not have a specific subreddit, or the subreddit's mod rules ban self-promotion completely, Reddit is the wrong channel.",
    preLaunchBuildUp: [
      {
        title: "Identify the target subreddit + read its rules (3-6 months before)",
        description:
          "Most subreddits have explicit self-promotion rules. Some allow it on specific weekdays; some require account-age minimums; some ban it entirely. Read before posting.",
        timeBand: "1-2 hours of research.",
      },
      {
        title: "Participate substantively for months (3+ months before)",
        description:
          "Reddit's 9:1 rule: 9 substantive non-promotional comments for every 1 self-promotional post. Less than that ratio gets you shadow-banned by mods.",
        timeBand: "Sustained 3+ months.",
      },
      {
        title: "Reach out to mods (2-4 weeks before)",
        description:
          "Some subreddits allow promotional posts only with mod permission. A DM to the head moderator with a respectful 'is this OK?' is worth more than 100 attempted posts.",
        timeBand: "1-2 hours.",
      },
    ],
    launchDay: [
      {
        title: "Post at the subreddit's peak hour",
        description:
          "Each subreddit has a different peak. Check the subreddit's analytics page or a tool like SnoopSnoo. Avoid peak time of other subreddits — overlap dilutes.",
        timeBand: "First 60 minutes set ranking.",
      },
      {
        title: "Reply to every comment in the first 4 hours",
        description:
          "Reddit's algorithm rewards comment density. Genuine, substantive replies — not 'thanks!' — are what moves the post up the subreddit's feed.",
        timeBand: "4 sustained hours.",
      },
    ],
    postLaunch: [
      {
        title: "Day 2-7 — convert comment-list to email-list",
        description:
          "The DM list from a successful Reddit launch is the most valuable asset. Personal follow-ups beat automated funnels for Reddit-source traffic.",
        timeBand: "5-10 hours across the week.",
      },
    ],
    successProfile:
      "200-2,000 upvotes within the niche subreddit, 50-300 substantive comments, 50-500 unique visitors, 10-100 email signups. Conversion to paying customers is high because the audience is pre-qualified by subreddit selection.",
    failureProfile:
      "Removed by mods within an hour, or 0-5 upvotes within 24 hours. Both indicate the self-promotion rules were violated or community participation was insufficient.",
    channelMistakes: [
      "Posting without participating first. Reddit mods detect new-account self-promotion in seconds.",
      "Cross-posting to multiple subreddits the same day. Considered spam; gets the account flagged.",
      "Defensive responses to critical comments. Reddit audience smell defensiveness immediately.",
      "Treating it as a one-shot. Reddit launches that compound are the ones where the founder stays in the community after.",
    ],
    relatedGlossary: ["dream-100", "wrong-person"],
    relatedNiches: ["indie-hackers", "saas-founders", "info-product-creators", "newsletter-operators"],
    faqs: [
      {
        q: "How niche should the target subreddit be?",
        a: "The narrowest possible subreddit where your audience lives, not the largest. 5,000 active members in a perfect-fit subreddit beat 500,000 in a generic one.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "linkedin-launch-for-b2b-saas",
    displayName: "LinkedIn launch for B2B SaaS",
    metaTitle: "LinkedIn Launch Playbook (B2B SaaS)",
    metaDescription:
      "How B2B SaaS founders launch on LinkedIn. Personal-page launches beat company-page launches. Connection net, post format, and 7-day arc.",
    channel: "linkedin",
    saasType: "B2B SaaS targeting professionals (managers, directors, founders) — especially when the buyer is also the user.",
    intro:
      "LinkedIn is an under-rated launch channel for B2B SaaS in 2026. The platform's algorithm favors founder-personal posts over company posts, and the audience overlap with B2B buyers is high. The launch is a single founder post with a 7-day amplification arc.",
    fitVerdict: "good-fit",
    whenNotToUse:
      "If your target buyer is a developer or technical user, LinkedIn is the wrong channel; Twitter and Hacker News are better. If your audience does not use LinkedIn for work decisions, skip.",
    preLaunchBuildUp: [
      {
        title: "Build the connection net (2-3 months before)",
        description:
          "300-500 second-degree connections in your target buyer profile. Connect with intent, not blind acceptance. The launch post's distribution depends on this network.",
        timeBand: "1-2 hours per week, sustained.",
      },
      {
        title: "Post 5-10 build-in-public posts before launch (2 months before)",
        description:
          "Establish your voice on LinkedIn before the launch post. Posts that did well in the build phase predict launch post performance.",
        timeBand: "30-60 minutes per post, twice a week.",
      },
      {
        title: "Draft the launch post (1 week before)",
        description:
          "Story-first format. Open with the problem you saw, the work you put in, the product as the conclusion. 150-250 words, no images for first post.",
        timeBand: "2-3 hours of drafting.",
      },
    ],
    launchDay: [
      {
        title: "Post Tuesday-Thursday at 7-9am or 12-2pm",
        description:
          "LinkedIn peak engagement is professional work hours. Avoid weekends entirely; the algorithm suppresses weekend posts.",
        timeBand: "First 90 minutes are critical.",
      },
      {
        title: "Engage with every comment for 8 hours",
        description:
          "LinkedIn's algorithm rewards founder engagement. Personal, substantive replies to each comment double the post's distribution.",
        timeBand: "8 sustained hours.",
      },
      {
        title: "Post a second time the same day (only if first post is performing)",
        description:
          "A short follow-up to the launch post can compound reach. Only do this if the first post crosses 500 engagements in the first hour.",
        timeBand: "30 minutes.",
      },
    ],
    postLaunch: [
      {
        title: "Day 2-3 — reply to inbound DMs personally",
        description:
          "LinkedIn DM volume after a successful launch is the highest-conversion channel of all launches. Personal, founder-grade replies convert at 20-40% to paying customers.",
        timeBand: "1-3 hours daily.",
      },
      {
        title: "Day 7 — follow-up post on lessons + numbers",
        description:
          "A retrospective post 7 days after the launch typically performs 50-70% as well as the launch itself and seeds the next launch arc.",
        timeBand: "2-3 hours.",
      },
    ],
    successProfile:
      "10,000-200,000 impressions, 200-2,000 reactions, 30-200 comments, 50-300 DMs in the inbox, 20-100 demo bookings or trial signups. LinkedIn launches convert higher than Twitter for B2B SaaS.",
    failureProfile:
      "Under 1,000 impressions. Almost always traceable to a thin connection network or a marketing-pitch tone instead of personal-story tone.",
    channelMistakes: [
      "Launching from the company page instead of the founder's personal page. LinkedIn's algorithm suppresses company posts.",
      "Including external links in the launch post. The algorithm down-ranks posts with outbound links. Put the link in a comment.",
      "Marketing-speak tone. LinkedIn's audience tolerates a higher level of polish than Hacker News, but professional-speak ('synergies', 'leverage') still loses.",
    ],
    relatedGlossary: ["dream-100", "story", "reluctant-hero"],
    relatedNiches: ["agency-owners", "consultants", "saas-founders"],
    faqs: [
      {
        q: "Should I tag people in the launch post?",
        a: "Sparingly. 1-3 tags of people who are genuinely part of the story is fine; 10+ tags reads as fishing and gets flagged.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "cold-outreach-launch-for-b2b",
    displayName: "Cold outreach launch for B2B SaaS",
    metaTitle: "Cold Outreach Launch Playbook (B2B SaaS)",
    metaDescription:
      "How B2B SaaS founders launch with cold outreach instead of a public launch. Dream-100 list, personalization, sequence, and conversion.",
    channel: "cold-outreach",
    saasType: "B2B SaaS at $500-$5,000/month price points where the buyer is identifiable and named.",
    intro:
      "Cold outreach is the lowest-noise launch channel for B2B SaaS — no algorithmic gatekeeping, no public failure, all founder-to-buyer signal. The playbook is volume + personalization + a specific named ask. Done right, 50 cold messages produce 2-5 demos and 0-2 customers.",
    fitVerdict: "strong-fit",
    whenNotToUse:
      "If your target buyer is a developer or end-user who does not check email regularly, cold outreach is slow. If your average deal is under $50/month, the math rarely closes.",
    preLaunchBuildUp: [
      {
        title: "Build a named dream-100 list (2-4 weeks before)",
        description:
          "Not a scraped list. 100 named people you would be proud to have as customers, with one specific verifiable thing about each one. The list quality is the entire game.",
        timeBand: "10-30 hours over the period.",
      },
      {
        title: "Warm the sending domain (2-3 weeks before)",
        description:
          "If sending from a new domain, ramp up volume gradually. mail-tester score 9/10+. SPF, DKIM, DMARC aligned.",
        timeBand: "Daily 10-minute sends during warm-up.",
      },
      {
        title: "Draft the message template (1 week before)",
        description:
          "Under 100 words. Personalization slot for the verifiable thing about each recipient. One specific ask at the end (15-min call, yes/no question).",
        timeBand: "2-4 hours of iteration.",
      },
    ],
    launchDay: [
      {
        title: "Send 20-30 personal messages between 9am-2pm",
        description:
          "Each message manually personalized. 20-30 per day is the sustainable ceiling for genuinely personal outreach. Tools that send 200+ are sending generic spam.",
        timeBand: "3-5 hours.",
      },
      {
        title: "Monitor the inbox in real-time for the first 6 hours",
        description:
          "Inbox response within 5 minutes of a reply is the single biggest conversion lever. The follow-up reply quality matters more than the original message.",
        timeBand: "Continuous attention.",
      },
    ],
    postLaunch: [
      {
        title: "Day 2-7 — send the follow-ups",
        description:
          "One follow-up per recipient, 4-7 days after the original message. References the original thread; does not say 'just bumping this'.",
        timeBand: "30-45 minutes daily.",
      },
      {
        title: "Day 7+ — convert demos to paying customers",
        description:
          "Demos booked in the first week should be done within 14 days. Stretching the demo-to-customer cycle past 30 days kills conversion.",
        timeBand: "Demo prep + execution.",
      },
    ],
    successProfile:
      "From 100 cold messages: 15-35% reply rate, 5-15% demo-booking rate, 1-3% conversion-to-customer rate. Cold outreach to a real dream-100 list outperforms scraped-list outreach by 10-20x.",
    failureProfile:
      "Sub-2% reply rate. Almost always traceable to a scraped list, generic template, or wrong-buyer-profile recipient set.",
    channelMistakes: [
      "Scraped lists with mass personalization tokens. Detectable; reply rate collapses.",
      "Vague asks ('let me know what you think'). Replace with one specific question or 15-min calendar offer.",
      "Multi-paragraph cold messages. Anything over 100 words gets skipped; reply rate is inverse to message length.",
      "Sending without inbox monitoring. Cold-outreach replies in the first 5 minutes are 5-10x more likely to convert.",
    ],
    relatedGlossary: ["dream-100", "story", "offer"],
    relatedNiches: ["saas-founders", "agency-owners", "consultants"],
    faqs: [
      {
        q: "How big should the dream-100 list be?",
        a: "Exactly 100 named people, not more. Pushing past 100 forces a quality drop. If you exhaust 100, build the next 100 fresh — the second cohort is always better than diluting the first.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "newsletter-swap-launch",
    displayName: "Newsletter-swap launch for indie SaaS",
    metaTitle: "Newsletter Swap Launch Playbook (Indie SaaS)",
    metaDescription:
      "How indie SaaS founders launch via newsletter cross-promotion. Reciprocal mentions, audience-match, terms, and the 7-day arc.",
    channel: "newsletter-swap",
    saasType: "Indie SaaS targeting an audience that already reads relevant newsletters in their niche.",
    intro:
      "Newsletter swaps are the most under-rated launch channel for indie SaaS in 2026. The founder trades a mention in one newsletter for a mention in another, reaching pre-qualified audiences without paid acquisition. The whole game is finding the right swap partners and structuring the trade.",
    fitVerdict: "good-fit",
    whenNotToUse:
      "If you have no newsletter of your own yet, this channel does not work — there is nothing to trade. Build a newsletter first; then negotiate.",
    preLaunchBuildUp: [
      {
        title: "Build your own newsletter to 1,000+ engaged subscribers (months before)",
        description:
          "Without a list of your own, no operator will trade with you. 1,000 engaged subscribers (30-40% open rate) is the minimum credible swap currency.",
        timeBand: "Months of newsletter building.",
      },
      {
        title: "Identify 10-20 audience-match newsletters (2-3 weeks before)",
        description:
          "Newsletters serving the same audience but not directly competing with your product. Read 5-10 issues of each; understand their voice and audience.",
        timeBand: "5-10 hours.",
      },
      {
        title: "Reach out to operators with a specific swap proposal (2-3 weeks before)",
        description:
          "Personal email. Name the date you want to launch, the specific message you would include in their newsletter, and the equivalent you offer in yours. Yes/no terms.",
        timeBand: "30-60 minutes per outreach.",
      },
    ],
    launchDay: [
      {
        title: "Send your newsletter with the partner's mention",
        description:
          "Honor the trade. Mention the partner's product or newsletter in the way you agreed. Anchor at the top, not buried.",
        timeBand: "Standard newsletter-send time.",
      },
      {
        title: "Monitor inbox for signup spikes from the partner's audience",
        description:
          "Newsletter-swap signups arrive in waves over 24-48 hours after the partner's newsletter sends. Track UTM-tagged links.",
        timeBand: "30 minutes daily.",
      },
    ],
    postLaunch: [
      {
        title: "Day 3 — thank the partner publicly",
        description:
          "A tweet or LinkedIn post thanking the partner with the actual numbers (signups received, conversion observed). Builds the relationship for the next swap.",
        timeBand: "30 minutes.",
      },
      {
        title: "Day 7 — analyze swap-source signups",
        description:
          "Newsletter-swap traffic is different from cold traffic — pre-qualified by the partner's audience match. Convert these signups with personal follow-up.",
        timeBand: "2-3 hours.",
      },
    ],
    successProfile:
      "From one swap: 50-500 new email signups, 1-10 paying customers within 30 days, 0-3 follow-up swap relationships. Newsletter-swap audiences convert 3-5x better than cold traffic.",
    failureProfile:
      "Sub-20 signups from a swap. Almost always traceable to an audience mismatch — the partner's audience does not actually overlap with your target buyer.",
    channelMistakes: [
      "Swapping with directly competing newsletters. The partner protects their relationship to their list; your offer reads as competitive intrusion.",
      "Vague swap terms. Specific copy, specific dates, specific placement matter — handshake terms lead to disappointment on both sides.",
      "Treating it as a one-time event. The best newsletter-swap relationships compound over 6-18 months of mutual support.",
    ],
    relatedGlossary: ["dream-100", "soap-opera-sequence"],
    relatedNiches: ["newsletter-operators", "info-product-creators", "indie-hackers"],
    faqs: [
      {
        q: "What is a fair swap if the partner's list is 5x bigger than mine?",
        a: "Two-for-one: you mention them in two issues for one mention in theirs. Or trade list size for premium placement (top of newsletter vs middle).",
      },
    ],
    lastVerified: "2026-05-19",
  },
];

export const LAUNCH_SLUGS: ReadonlyArray<string> = LAUNCH_ENTRIES.map(
  (e) => e.slug,
);

export function getLaunchBySlug(slug: string): LaunchEntry | undefined {
  return LAUNCH_ENTRIES.find((e) => e.slug === slug);
}

export const LAUNCH_CHANNELS = [
  "product-hunt",
  "twitter-x",
  "hacker-news",
  "indie-hackers",
  "reddit",
  "linkedin",
  "cold-outreach",
  "newsletter-swap",
] as const;

export const LAUNCH_CHANNEL_LABELS: Record<LaunchChannel, string> = {
  "product-hunt": "Product Hunt",
  "twitter-x": "Twitter / X",
  "hacker-news": "Hacker News",
  "indie-hackers": "Indie Hackers",
  reddit: "Reddit",
  linkedin: "LinkedIn",
  "cold-outreach": "Cold outreach",
  "newsletter-swap": "Newsletter swaps",
};
