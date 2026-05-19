/**
 * /audience/[slug] pSEO catalog — sustained audience-building playbooks.
 *
 * Each entry covers ONE platform's sustained audience-building motion
 * (Twitter/X, LinkedIn, newsletter, podcast, YouTube, Substack-style
 * publication, Reddit, indie-hacker community). Different from /launch
 * (event-specific) and /skill/writing-in-public (skill practice plan).
 *
 * /audience is the "how do I build a real audience on platform X over
 * 6-24 months" surface.
 *
 * Schema: HowTo + Article + FAQPage + BreadcrumbList.
 *
 * Brunson Hard-Rule:
 *   - Honest time bands. Audience-building is slow; the bands reflect
 *     that.
 *   - "Stuck" signals reflect real patterns observed across indie
 *     SaaS founders, not invented frustration tropes.
 */

import { NICHE_SLUGS } from "./niches";

export type AudiencePlatform =
  | "twitter-x"
  | "linkedin"
  | "newsletter"
  | "podcast"
  | "youtube"
  | "reddit"
  | "indie-community";

export interface AudienceMilestone {
  size: string;
  expectedMonth: string;
  whatItUnlocks: string;
}

export interface AudienceFaq {
  q: string;
  a: string;
}

export interface AudienceEntry {
  slug: string;
  platform: AudiencePlatform;
  /** Full display name. */
  displayName: string;
  metaTitle: string;
  metaDescription: string;
  /** 2-3 sentence intro. */
  intro: string;
  /** Who this audience-building path fits. */
  whoItFits: string;
  /** Cadence required to sustain. */
  cadence: string;
  /** Typical 12-month outcome band for an indie SaaS founder starting from zero. */
  typical12MonthOutcomeBand: string;
  /** Step-by-step monthly playbook. */
  monthlyPlaybook: ReadonlyArray<{
    monthRange: string;
    focus: string;
    actions: ReadonlyArray<string>;
  }>;
  /** Audience-size milestones. */
  milestones: ReadonlyArray<AudienceMilestone>;
  /** Common stuck patterns. */
  stuckPatterns: ReadonlyArray<string>;
  /** Why this platform vs others for the same effort. */
  vsOtherPlatforms: string;
  /** Related niche slugs. */
  relatedNiches: ReadonlyArray<string>;
  faqs: ReadonlyArray<AudienceFaq>;
  lastVerified: string;
}

export const AUDIENCE_ENTRIES: ReadonlyArray<AudienceEntry> = [
  {
    slug: "twitter-x-audience",
    platform: "twitter-x",
    displayName: "Twitter / X audience-building for indie SaaS",
    metaTitle: "Twitter / X Audience Playbook for Indie SaaS Founders",
    metaDescription:
      "How indie SaaS founders build a real audience on Twitter / X over 12-24 months. Cadence, milestones, the stuck patterns, and platform-specific gotchas.",
    intro:
      "Twitter / X is the dominant indie SaaS founder platform in 2026 — small but high-quality audience overlap with indie SaaS buyers. Audience-building takes 12-24 months of consistent output to compound; the first 6 months feel like shouting into the void.",
    whoItFits:
      "Founders building products for technical or product-oriented audiences (developer tools, indie SaaS, AI products). Founders comfortable with public writing in short-form. Less effective for purely B2B enterprise audiences.",
    cadence:
      "5-10 tweets per week, with 1-3 longer threads per month. Quality > quantity; one engagement-strong post per week beats five shallow ones.",
    typical12MonthOutcomeBand:
      "From zero to 1,000-5,000 engaged followers; 200-1,500 email subscribers via in-bio link. Variance is high — strong threads can produce step-jumps; quiet months can stall growth entirely.",
    monthlyPlaybook: [
      {
        monthRange: "Months 1-2",
        focus: "Find your voice and topic-niche",
        actions: [
          "Pick ONE topic-niche (your specific indie SaaS angle, not 'startups').",
          "Post 5+ times per week consistently. Mix of observations, lessons, and questions.",
          "Reply to 10+ other indie founder posts per day; reply-as-content is the fastest network entry.",
        ],
      },
      {
        monthRange: "Months 3-6",
        focus: "Test thread formats",
        actions: [
          "Publish 1 long-form thread per week. Test formats: lessons, frameworks, before/after, contrarian takes.",
          "Identify which 2-3 thread shapes produce engagement. Lean into those.",
          "DM 3-5 followers per week who reply substantively. Building real relationships > vanity following.",
        ],
      },
      {
        monthRange: "Months 6-12",
        focus: "Build the compounding loop",
        actions: [
          "Cross-post threads to LinkedIn (different audience, similar content).",
          "Add a clear in-bio email-list signup. Aim for 10-20% follower-to-email conversion.",
          "Co-publish with one indie founder peer monthly. Cross-pollination compounds reach.",
        ],
      },
      {
        monthRange: "Months 12+",
        focus: "Convert audience to customers",
        actions: [
          "Soft-pitch your product in 1 in every 8-12 posts. Hard-pitching dilutes the audience.",
          "Use the email list (your owned channel) for primary sales, Twitter for awareness + trust-building.",
          "Engage daily; the algorithm rewards consistency more than burst posting.",
        ],
      },
    ],
    milestones: [
      {
        size: "500 followers",
        expectedMonth: "Month 2-4",
        whatItUnlocks: "First substantive replies; first DMs from peers; the platform stops feeling empty.",
      },
      {
        size: "2,000 followers",
        expectedMonth: "Month 6-12",
        whatItUnlocks: "Posts start producing real engagement (10+ replies); inbound DM rate increases meaningfully.",
      },
      {
        size: "5,000+ followers",
        expectedMonth: "Month 12-24",
        whatItUnlocks: "Threads can reach 50k+ impressions; customer-acquisition via Twitter becomes measurable.",
      },
    ],
    stuckPatterns: [
      "Posting only when launching. Audiences compound via consistency, not on-demand.",
      "Following too many accounts (5,000+). The follow-graph becomes noise; engagement drops.",
      "Quitting at month 3-4 because 'nothing is happening'. The compounding starts at month 6-9.",
      "Hard-pitching the product in every other post. Burns trust; followers unfollow at higher rates.",
      "Treating Twitter as broadcast (no replies, no engagement with others). The algorithm punishes one-way accounts.",
    ],
    vsOtherPlatforms:
      "Twitter has the highest indie SaaS founder concentration but the lowest enterprise B2B buyer density. If your buyer is a Fortune 500 procurement contact, LinkedIn outperforms. If your buyer is another indie founder or developer, Twitter wins on signal-per-effort.",
    relatedNiches: ["indie-hackers", "saas-founders", "ai-wrappers", "no-code-builders"],
    faqs: [
      {
        q: "Should I post on multiple platforms simultaneously?",
        a: "For the first 6 months, single-platform focus produces better compounding. After 6 months on a primary platform, cross-posting threads to a second platform is a low-effort multiplier.",
      },
      {
        q: "Does posting time matter on Twitter?",
        a: "Less than founders think. The algorithm tests posts across time windows. Consistency matters more than precise timing; 9-11am Eastern and 6-8pm Eastern are the typical engagement peaks.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "linkedin-audience",
    platform: "linkedin",
    displayName: "LinkedIn audience-building for B2B SaaS",
    metaTitle: "LinkedIn Audience Playbook for B2B SaaS Founders",
    metaDescription:
      "How B2B SaaS founders build a sustained LinkedIn audience over 12 months. Cadence, milestones, the algorithm gotchas, and platform-specific tactics.",
    intro:
      "LinkedIn is the under-rated indie SaaS audience platform for B2B buyers. The platform's algorithm increasingly rewards founder-personal content; the audience overlap with B2B SaaS buyers is high. Slower compounding than Twitter for indie audiences; better conversion for B2B audiences.",
    whoItFits:
      "Founders selling to B2B buyers — managers, directors, founders of mid-market companies, agencies. Founders selling to professional buyers in regulated industries (legal, finance, healthcare).",
    cadence:
      "3-5 posts per week. LinkedIn rewards depth more than frequency; one 300-word personal post outperforms five short broadcasts.",
    typical12MonthOutcomeBand:
      "From zero to 500-3,000 engaged connections; 100-1,000 email subscribers via lead-magnets. LinkedIn audiences are smaller than Twitter but higher-trust per connection.",
    monthlyPlaybook: [
      {
        monthRange: "Months 1-2",
        focus: "Build the connection net",
        actions: [
          "Connect with 50-100 second-degree connections in your ICP per week.",
          "Send 5-10 personal messages per week. Not pitches — 'I noticed you do X, would love to connect' framing.",
          "Engage with 10-20 other founder posts daily. Comments-as-content is the LinkedIn signal.",
        ],
      },
      {
        monthRange: "Months 3-6",
        focus: "Establish content cadence",
        actions: [
          "Post 3-5 times per week. Mix: personal story, observation, framework, before/after.",
          "Use the 'hook → narrative → takeaway' structure. LinkedIn rewards content with a clear shape.",
          "Reply to every comment on your posts in the first 6 hours; algorithm boost is significant.",
        ],
      },
      {
        monthRange: "Months 6-12",
        focus: "Build the inbound funnel",
        actions: [
          "Add a lead magnet (case study, template, framework PDF) and offer it in posts.",
          "Run a monthly LinkedIn newsletter; LinkedIn newsletters compound subscriber count without the algorithm volatility of feed posts.",
          "DM 5-10 high-trust new connections per week with personalized notes (not product pitches).",
        ],
      },
      {
        monthRange: "Months 12+",
        focus: "Convert connections to revenue",
        actions: [
          "Offer free 15-min calls in DMs (Cal.com link). High-trust LinkedIn DMs convert to demo calls at 20-40%.",
          "Repurpose top content into webinar / podcast / long-form articles. LinkedIn audience is more receptive to long-form than Twitter.",
          "Use Sales Navigator for targeted outreach to ICP-fit prospects; volume should remain low (10-20/week).",
        ],
      },
    ],
    milestones: [
      {
        size: "500 connections in ICP",
        expectedMonth: "Month 2-3",
        whatItUnlocks: "First inbound DMs from prospects; the platform starts producing serendipitous opportunities.",
      },
      {
        size: "2,000 followers / connections",
        expectedMonth: "Month 6-9",
        whatItUnlocks: "Posts reach 5,000-20,000 impressions; cold inbound from ICP-fit buyers begins.",
      },
      {
        size: "5,000+ followers",
        expectedMonth: "Month 12-18",
        whatItUnlocks: "LinkedIn becomes a primary inbound channel; 30-50%+ of demo calls trace back to LinkedIn content.",
      },
    ],
    stuckPatterns: [
      "Auto-connecting in bulk. LinkedIn penalizes pattern-matched connection requests; conversion to engaged connection drops.",
      "Sales-pitch DMs after connecting. Immediate-pitch reads as spam; the trust required for indie SaaS sales evaporates.",
      "Marketing-jargon posts. LinkedIn rewards founder-personal language; corporate-speak gets ignored.",
      "Only posting from the company page. LinkedIn's algorithm strongly favors personal-page posts; company pages produce 5-10% of personal-page reach.",
      "Inconsistent posting. The algorithm rewards sustained presence; sporadic posters get suppressed for weeks.",
    ],
    vsOtherPlatforms:
      "LinkedIn wins for B2B SaaS at $100/month+ price points where the buyer is a working professional. Twitter wins for products targeting other indie founders or developers. For products selling to creators or consumer audiences, LinkedIn is suboptimal — the audience overlap is weak.",
    relatedNiches: ["agency-owners", "consultants", "saas-founders"],
    faqs: [
      {
        q: "Should the LinkedIn page be personal or company?",
        a: "Personal page is the primary content surface. Company page is a footer / careers / about-us anchor, not a content engine. The LinkedIn algorithm strongly favors personal pages for content reach.",
      },
      {
        q: "Does LinkedIn Premium / Sales Navigator help with audience-building?",
        a: "Sales Navigator helps with targeted outreach once you have an audience. For pre-1k-follower founders, Premium and Sales Nav are usually premature; the free tier covers audience-building. Re-evaluate at 2k+ followers.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "newsletter-audience",
    platform: "newsletter",
    displayName: "Newsletter audience-building for indie SaaS",
    metaTitle: "Newsletter Audience Playbook for Indie SaaS Founders",
    metaDescription:
      "How indie SaaS founders build an owned newsletter audience over 12-24 months. Cadence, list-building tactics, milestones, and the stuck patterns.",
    intro:
      "Newsletter is the highest-quality owned audience an indie SaaS founder can build. Slower compounding than Twitter / LinkedIn (because there's no algorithm to amplify); higher conversion per subscriber and platform-independent. Newsletter is the long-term retention asset.",
    whoItFits:
      "Founders with depth on a specific topic where readers benefit from long-form. Founders comfortable with weekly writing discipline. Less effective for purely visual products.",
    cadence:
      "Weekly (preferred) or bi-weekly. Less than once every 2 weeks loses subscribers to inactivity; more than once a week increases unsubscribe rate.",
    typical12MonthOutcomeBand:
      "From zero to 500-3,000 engaged subscribers. Newsletter growth is slower-but-steeper than social — once compounding starts, retention is much higher than social followers.",
    monthlyPlaybook: [
      {
        monthRange: "Months 1-3",
        focus: "Establish the format and cadence",
        actions: [
          "Pick the format: long-form essay, weekly roundup, founder-journal, framework-of-the-week.",
          "Send weekly without fail for 12 weeks. Cadence beats quality in early-stage newsletters.",
          "Build the first 100 subscribers from your existing network (Twitter bio, LinkedIn, contacts).",
        ],
      },
      {
        monthRange: "Months 3-9",
        focus: "Build the growth loop",
        actions: [
          "Cross-promote with 1-2 newsletters per month (paid or unpaid swaps).",
          "Republish 1-2 best issues per quarter on Twitter, LinkedIn, or Medium (with newsletter signup CTA).",
          "Run targeted lead-magnet campaigns: gated PDF / framework / template in exchange for email.",
        ],
      },
      {
        monthRange: "Months 9-12",
        focus: "Monetize the list (optional)",
        actions: [
          "Decide on monetization: paid tier, sponsorships, direct product sales via list.",
          "If paid: launch with founding-subscriber pricing for first 50 buyers.",
          "Track open rate (30-50% is healthy); click-through rate (2-8% is healthy); unsubscribe rate (under 1% per send).",
        ],
      },
      {
        monthRange: "Months 12+",
        focus: "Sustain + leverage",
        actions: [
          "The list is now your primary marketing asset. Use it for product launches, customer feedback, beta invitations.",
          "Resist the urge to over-monetize. Promotional content above 1 in 5 sends drives unsubscribes.",
          "Keep the writing voice consistent. Newsletter readers stay for the voice, not just the topic.",
        ],
      },
    ],
    milestones: [
      {
        size: "100 subscribers",
        expectedMonth: "Month 1-3",
        whatItUnlocks: "First non-network subscribers; the discipline of weekly writing locks in.",
      },
      {
        size: "1,000 subscribers",
        expectedMonth: "Month 6-12",
        whatItUnlocks: "First sustained organic growth; cross-promotion becomes practical; the list starts converting.",
      },
      {
        size: "5,000+ subscribers",
        expectedMonth: "Month 18-36",
        whatItUnlocks: "Newsletter is a primary acquisition channel; sponsorships become viable; paid-tier launch is sustainable.",
      },
    ],
    stuckPatterns: [
      "Inconsistent send cadence. Subscribers unsubscribe more from inconsistency than from over-sending.",
      "Optimizing too early. Worrying about format, design, deliverability before having 200 subscribers wastes effort.",
      "Skipping the lead-magnet path. Without something to offer, conversion from your social audience to email stays low.",
      "Treating the list like a one-way channel. Replies-as-conversation is the newsletter's superpower; reply rates over 5% indicate strong list health.",
      "Stop posting on social. Newsletter compounds but social drives discovery; both are needed early.",
    ],
    vsOtherPlatforms:
      "Newsletter is platform-independent and owned — your list survives Twitter / LinkedIn algorithm changes. Slower to compound than social, but the audience converts higher and retains longer. For indie SaaS aiming at $10k+ MRR, a newsletter is structural.",
    relatedNiches: ["newsletter-operators", "info-product-creators", "indie-hackers"],
    faqs: [
      {
        q: "Beehiiv, Substack, ConvertKit, or roll-your-own?",
        a: "Beehiiv for paid newsletters at scale. Substack for community-first writers. ConvertKit for sequence-heavy automation. Roll-your-own (Resend + Supabase) only if you have specific needs the platforms cannot serve.",
      },
      {
        q: "How long should each issue be?",
        a: "800-2,500 words for personal-essay newsletters; 400-800 for curated roundups. Less than 400 reads as thin; more than 3,000 loses readers mid-issue.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "podcast-audience",
    platform: "podcast",
    displayName: "Podcast audience-building for indie SaaS",
    metaTitle: "Podcast Audience Playbook for Indie SaaS Founders",
    metaDescription:
      "How indie SaaS founders build a podcast audience over 12-24 months. Time investment, the compounding curve, and when podcasting beats other channels.",
    intro:
      "Podcasting is high-trust, high-effort, slow-compounding. Six months of weekly episodes produce a deeper relationship with 500 listeners than 5,000 Twitter followers will produce in a year. But the time cost is real: each 30-min episode is 3-6 hours of production work.",
    whoItFits:
      "Founders comfortable with audio + sustained verbal articulation. Founders selling to audiences with long commutes or workflows where listening is natural (developers, consultants, sales professionals). Less effective for visual products.",
    cadence:
      "Weekly is the gold standard; bi-weekly works. Less frequent than bi-weekly loses listener retention. Episodes should be 25-45 minutes; longer struggles to retain listeners through to the end.",
    typical12MonthOutcomeBand:
      "From zero to 200-2,000 weekly listeners. Podcast audiences are smaller than social but more committed. 1,000 weekly listeners produces meaningful inbound for indie SaaS.",
    monthlyPlaybook: [
      {
        monthRange: "Months 1-3",
        focus: "Establish the show",
        actions: [
          "Pick the show format: solo, interview, panel, narrative. Solo is fastest to produce; interviews compound via guest networks.",
          "Record + ship 8-12 episodes in the first 3 months. Cadence beats quality early; you improve fastest by shipping.",
          "Set up RSS distribution (Apple Podcasts, Spotify, Overcast, PocketCasts). Use Transistor / Captivate / Substack-podcasts to host.",
        ],
      },
      {
        monthRange: "Months 3-9",
        focus: "Build the listener loop",
        actions: [
          "Aim for 1-2 guests per month who have audiences of their own. Cross-promotion is the podcast growth engine.",
          "Repurpose audio: clips on Twitter / LinkedIn / YouTube Shorts. Each 30-min episode produces 5-10 short clips.",
          "Build the show notes habit. Each episode page is its own SEO surface.",
        ],
      },
      {
        monthRange: "Months 9-12",
        focus: "Convert listeners",
        actions: [
          "Mention the product in-episode 1 in every 4-8 episodes. Hard-pitch every episode burns trust.",
          "Use the email list (built via in-show + show-notes signup) for direct sales.",
          "Track downloads + completion rate. Completion rate over 50% means the format is right.",
        ],
      },
      {
        monthRange: "Months 12+",
        focus: "Compound + sustain",
        actions: [
          "By year 1, top 5-10 episodes carry 30-50% of total listens. Re-promote evergreen episodes regularly.",
          "Sponsorships become viable around 1,000 weekly listeners. They are not free money — they take audience attention.",
          "Continue the cadence; the year-2 audience compounds on year-1 cataloguing.",
        ],
      },
    ],
    milestones: [
      {
        size: "100 weekly listeners",
        expectedMonth: "Month 3-6",
        whatItUnlocks: "First guest pitches accepted; the platform stops feeling empty.",
      },
      {
        size: "500 weekly listeners",
        expectedMonth: "Month 9-15",
        whatItUnlocks: "Guests proactively reach out; show notes start ranking in Google; inbound from listeners begins.",
      },
      {
        size: "2,000+ weekly listeners",
        expectedMonth: "Month 18-36",
        whatItUnlocks: "Podcast becomes a primary sales channel; sponsorships viable; founder credibility compounds.",
      },
    ],
    stuckPatterns: [
      "Quitting at episode 10-15. The compounding starts around episode 20-30; quitting before that forfeits the investment.",
      "Inconsistent cadence. Listeners build the show into their week; skipping weeks loses retention permanently.",
      "Over-producing. 30-min interview podcasts work; 30-hour edits do not. Most indie podcasts win with light editing.",
      "No show notes / SEO surface. Each episode is a discoverability investment; skipping notes wastes it.",
      "Solo podcast with no guest variety. Solo shows compound slower than interview shows because there's no guest-network amplification.",
    ],
    vsOtherPlatforms:
      "Podcast audiences are deeper but smaller than Twitter / LinkedIn. The trust-per-listener is highest of any platform. Time cost per episode (3-6 hours) is also highest. For founders with audio comfort + sustained discipline, podcast beats most channels on long-term conversion. For founders without, podcast is the wrong channel.",
    relatedNiches: ["info-product-creators", "consultants", "saas-founders", "agency-owners"],
    faqs: [
      {
        q: "Should the podcast be on YouTube too?",
        a: "Yes for video-recorded interview podcasts. Cross-posting to YouTube doubles distribution at minimal additional effort. For pure audio shows, YouTube adds little.",
      },
      {
        q: "Is solo podcast viable for indie SaaS?",
        a: "Yes but harder to compound. Solo shows depend on the host's expertise + delivery; interview shows compound via guest reach. Most indie SaaS podcasters who succeed run interview-first formats.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "youtube-audience",
    platform: "youtube",
    displayName: "YouTube audience-building for indie SaaS",
    metaTitle: "YouTube Audience Playbook for Indie SaaS Founders",
    metaDescription:
      "How indie SaaS founders build a YouTube audience over 12-24 months. The two-format strategy, the production gotchas, and the compounding curve.",
    intro:
      "YouTube is the slowest-to-compound but highest-evergreen audience platform. A single video that ranks can drive traffic for years; the first 12 months produce almost nothing. YouTube punishes inconsistency mercilessly and rewards persistence with compounding interest.",
    whoItFits:
      "Founders comfortable on camera + with video production. Products where the demo / tutorial format produces value visible in 5-10 minutes. Less effective for purely B2B enterprise products.",
    cadence:
      "One quality video per week is the floor. Two per week is the sweet spot. Below weekly, the algorithm de-prioritizes the channel.",
    typical12MonthOutcomeBand:
      "From zero to 200-3,000 subscribers; 5,000-100,000 lifetime views across the catalog. YouTube growth is exponential — the first 6 months produce 5-10% of year-1 views, the last 3 months produce 50-70%.",
    monthlyPlaybook: [
      {
        monthRange: "Months 1-3",
        focus: "Establish the two-format strategy",
        actions: [
          "Pick two formats: searchable (tutorials, 'how to X with [tool]') AND personality (founder vlog, journey, behind-the-scenes). Two formats target two algorithms.",
          "Ship 8-12 videos in months 1-3. Production quality should be 'good enough', not perfect.",
          "Title + thumbnail are 80% of the click. Iterate on titles weekly based on click-through rate.",
        ],
      },
      {
        monthRange: "Months 3-9",
        focus: "Pattern-match to what works",
        actions: [
          "Identify which 2-3 video shapes produce 5x the views of your average. Lean into those.",
          "Engage with comments in the first 24 hours; comment velocity is an algorithm signal.",
          "Use end-screens + cards to drive cross-video discovery.",
        ],
      },
      {
        monthRange: "Months 9-18",
        focus: "Find the first compounding hit",
        actions: [
          "Most channels have a breakout video around month 9-15. Identify it post-hoc; lean into the format.",
          "Re-cut the top videos with refined thumbnails and re-publish updates.",
          "Build a playlist structure that nudges viewers through 3-5 related videos.",
        ],
      },
      {
        monthRange: "Months 18+",
        focus: "Convert + sustain",
        actions: [
          "By month 18, the catalog produces meaningful evergreen traffic. New videos build on top.",
          "Email + product CTAs in-video. YouTube viewers convert at 1-5% to email; lower than other platforms but higher in absolute volume.",
          "Continue weekly cadence. Channels that go dark for 4+ weeks see immediate algorithm de-ranking.",
        ],
      },
    ],
    milestones: [
      {
        size: "100 subscribers",
        expectedMonth: "Month 3-6",
        whatItUnlocks: "Custom URL; the channel stops feeling experimental.",
      },
      {
        size: "1,000 subscribers",
        expectedMonth: "Month 9-18",
        whatItUnlocks: "Monetization eligibility; first sustained organic discovery; sponsors become viable (small ones).",
      },
      {
        size: "10,000+ subscribers",
        expectedMonth: "Month 24-48",
        whatItUnlocks: "YouTube becomes a primary acquisition channel; videos cross-pollinate consistently.",
      },
    ],
    stuckPatterns: [
      "Over-investing in production for the first 20 videos. Production quality matters less than topic + title + thumbnail.",
      "Inconsistent cadence. YouTube's algorithm severely penalizes uneven uploads.",
      "Quitting at month 6. The compounding starts around month 9-18.",
      "Skipping thumbnails or using auto-generated thumbnails. Click-through rate is 80% thumbnail-driven.",
      "Treating YouTube like Twitter. Long-tail evergreen content wins on YouTube; trend-chasing rarely does.",
    ],
    vsOtherPlatforms:
      "YouTube has the highest evergreen value per piece of content (a 2-year-old video can still drive 1,000 monthly views) but the slowest compounding. For founders willing to invest 18-36 months, YouTube produces the deepest long-term acquisition asset. For founders needing 6-month results, YouTube is the wrong investment.",
    relatedNiches: ["info-product-creators", "saas-founders", "no-code-builders"],
    faqs: [
      {
        q: "Should I do YouTube Shorts?",
        a: "As a supplementary format only. Shorts produce volume but rarely convert to subscribers; long-form is where the audience-building happens. Shorts are awareness; long-form is depth.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "reddit-audience",
    platform: "reddit",
    displayName: "Reddit audience-building for niche SaaS",
    metaTitle: "Reddit Audience Playbook (Niche Indie SaaS)",
    metaDescription:
      "How niche SaaS founders build a sustained Reddit presence. The subreddit-focused approach, the 9:1 rule, and the platform-specific gotchas.",
    intro:
      "Reddit audience-building is unlike any other platform. There is no follower graph; influence is community-by-community. The strongest indie SaaS founders on Reddit build deep credibility in 1-3 specific subreddits over 6-12 months, then convert that credibility into product awareness.",
    whoItFits:
      "Founders with a target audience that congregates on specific subreddits (r/cooking, r/personalfinance, r/freelance, etc.). Founders comfortable with text-only, mostly anonymous communities. Less effective for B2B enterprise audiences.",
    cadence:
      "Daily or near-daily presence in 1-3 target subreddits. Reddit rewards consistent community contribution, not bursts.",
    typical12MonthOutcomeBand:
      "Recognition in 1-3 specific subreddits; 50-500 emails captured through high-permission flair / pinned posts; 5-50 paying customers from Reddit-source traffic. Reddit is high-trust, low-volume.",
    monthlyPlaybook: [
      {
        monthRange: "Months 1-3",
        focus: "Become a recognizable community member",
        actions: [
          "Pick 1-3 target subreddits where your ICP lives. Read 50+ posts before commenting.",
          "Comment substantively. 9:1 ratio of substantive comments to self-promotional posts is the survival floor.",
          "Build karma in target subreddits. New accounts with no karma get downvoted by default.",
        ],
      },
      {
        monthRange: "Months 3-6",
        focus: "Establish topical authority",
        actions: [
          "Post genuinely useful content on your topic. Lessons, frameworks, free resources (no product pitch).",
          "Reply to every comment on your posts within 24 hours. Reddit rewards engagement.",
          "Reach out to subreddit mods. Many subreddits allow occasional self-promotion only with mod permission.",
        ],
      },
      {
        monthRange: "Months 6-12",
        focus: "Soft-introduce the product",
        actions: [
          "After 6 months of credibility-building, an occasional 'I built X to solve this' post (with mod permission) lands well.",
          "Direct message active subreddit users only with personal connection (not bulk pitches).",
          "Watch the subreddit's self-promo rules; some have weekly self-promo threads.",
        ],
      },
      {
        monthRange: "Months 12+",
        focus: "Sustain credibility",
        actions: [
          "Continue substantive community contribution. The credibility erodes if you stop participating.",
          "Reddit-source customers tend to be sticky and refer to other Reddit users. The flywheel is slow but real.",
          "Reddit volume will never match Twitter / LinkedIn; the per-customer value is higher.",
        ],
      },
    ],
    milestones: [
      {
        size: "100+ karma in target subreddit",
        expectedMonth: "Month 1-2",
        whatItUnlocks: "Posts and comments stop getting auto-downvoted; mods recognize you.",
      },
      {
        size: "Top contributor flair / recurring poster",
        expectedMonth: "Month 6-9",
        whatItUnlocks: "Soft self-promotion becomes possible; mods occasionally feature your contributions.",
      },
      {
        size: "Sustained recognition across 2-3 subreddits",
        expectedMonth: "Month 12-18",
        whatItUnlocks: "Reddit becomes a small but steady acquisition channel; cross-subreddit credibility compounds.",
      },
    ],
    stuckPatterns: [
      "Spamming self-promotional posts. Reddit mods identify and ban patterns within hours.",
      "Cross-posting the same content to multiple subreddits. Treated as spam.",
      "Engaging with subreddits where the audience does not match your ICP. Wasted effort.",
      "Treating Reddit like a launch platform. Reddit works for sustained presence, not for one-off launches.",
      "Aggressive 'I built X' posts without first being a community member. The downvote pile-on is severe.",
    ],
    vsOtherPlatforms:
      "Reddit produces the smallest but most loyal audience for niche-fit products. The trust-per-Reddit-customer is the highest of any platform. The time cost is sustained — every quarter requires continued participation. For products targeting tight niches with strong subreddit communities, Reddit is high-leverage. For broad B2B products, Reddit is suboptimal.",
    relatedNiches: ["indie-hackers", "no-code-builders", "newsletter-operators"],
    faqs: [
      {
        q: "Can I run Reddit Ads instead of organic?",
        a: "Reddit Ads can work for niche targeting but never replace organic credibility. The best Reddit acquisition combines organic community presence with targeted ads in the same subreddits. Pure-ad Reddit is usually expensive without conversion.",
      },
    ],
    lastVerified: "2026-05-19",
  },
];

export const AUDIENCE_SLUGS: ReadonlyArray<string> = AUDIENCE_ENTRIES.map(
  (e) => e.slug,
);

export function getAudienceBySlug(slug: string): AudienceEntry | undefined {
  return AUDIENCE_ENTRIES.find((e) => e.slug === slug);
}

export const AUDIENCE_PLATFORMS = [
  "twitter-x",
  "linkedin",
  "newsletter",
  "podcast",
  "youtube",
  "reddit",
  "indie-community",
] as const;

export const AUDIENCE_PLATFORM_LABELS: Record<AudiencePlatform, string> = {
  "twitter-x": "Twitter / X",
  linkedin: "LinkedIn",
  newsletter: "Newsletter",
  podcast: "Podcast",
  youtube: "YouTube",
  reddit: "Reddit",
  "indie-community": "Indie community (IH, etc.)",
};

// Build-time guard: every relatedNiches slug must resolve.
{
  const known = new Set<string>(NICHE_SLUGS);
  for (const entry of AUDIENCE_ENTRIES) {
    for (const slug of entry.relatedNiches) {
      if (!known.has(slug)) {
        throw new Error(
          `audiences.ts: entry "${entry.slug}" references unknown niche slug "${slug}".`,
        );
      }
    }
  }
}
