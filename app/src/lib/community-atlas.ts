/**
 * Community Atlas — Russell Brunson Traffic Secrets §1-2 (Secrets #4-6).
 *
 * "Where does your dream customer hang out?" — the second question after
 * "who is your dream customer?"
 *
 * This is the directory of every community, platform, and congregation
 * where Unlock SaaS's dream customer (the post-launch, pre-revenue AI-
 * product founder) can be found. Each entry carries:
 *   - difficulty: how hard the first meaningful contribution is (1-5)
 *   - selfPromoPolicy: what the community allows / bans
 *   - bestEntryStrategy: the contribution-first angle that works
 *
 * Brunson Hard-Rule: these are REAL communities that exist as of 2026.
 * Every entry has been verified to have an active indie-SaaS /
 * post-launch-founder audience. No fabricated communities.
 */

export type Platform =
  | "discord"
  | "slack"
  | "reddit"
  | "twitter"
  | "forum"
  | "telegram"
  | "site";

export interface CommunityEntry {
  slug: string;
  name: string;
  platform: Platform;
  url: string;
  audience: string;
  /** How hard the first meaningful contribution is (1=easy, 5=hard). */
  difficulty: 1 | 2 | 3 | 4 | 5;
  selfPromoPolicy: "banned" | "restricted" | "allowed-with-value" | "allowed";
  bestEntryStrategy: string;
  /** The specific sub-channel or room where our dream customer shows up. */
  whereTheyAre: string;
}

export const PLATFORM_LABELS: Record<Platform, string> = {
  discord: "Discord",
  slack: "Slack",
  reddit: "Reddit",
  twitter: "X / Twitter",
  forum: "Forum",
  telegram: "Telegram",
  site: "Website",
};

export const COMMUNITY_ENTRIES: CommunityEntry[] = [
  {
    slug: "indiehackers",
    name: "Indie Hackers",
    platform: "site",
    url: "https://indiehackers.com",
    audience: "~500K members",
    difficulty: 3,
    selfPromoPolicy: "allowed-with-value",
    bestEntryStrategy:
      "Share a real milestone post with the actual numbers ($0, 300 signups, 0 charges). The community rewards honesty. Soft-link the diagnostic in the first comment, never the post body.",
    whereTheyAre: "The 'Share my milestone' feed and the SaaS / Micro-SaaS groups",
  },
  {
    slug: "indiehackers-discord",
    name: "Indie Hackers Discord",
    platform: "discord",
    url: "https://discord.gg/indiehackers",
    audience: "~20K members",
    difficulty: 2,
    selfPromoPolicy: "allowed-with-value",
    bestEntryStrategy:
      "The #help channel — answer real questions about post-launch distribution for 2 weeks before mentioning the Playbook. Earn the right to share.",
    whereTheyAre: "#help, #share-your-milestones, #looking-for-feedback",
  },
  {
    slug: "lovable-discord",
    name: "Lovable Discord",
    platform: "discord",
    url: "https://discord.gg/lovable",
    audience: "~100K members",
    difficulty: 2,
    selfPromoPolicy: "restricted",
    bestEntryStrategy:
      "The #showcase and #help rooms. When someone ships and asks 'how do I get users,' that's the exact opening. Answer with the framework, not the product link.",
    whereTheyAre: "#showcase, #help, #feedback-wanted",
  },
  {
    slug: "bolt-discord",
    name: "Bolt (StackBlitz) Discord",
    platform: "discord",
    url: "https://discord.gg/stackblitz",
    audience: "~50K members",
    difficulty: 2,
    selfPromoPolicy: "restricted",
    bestEntryStrategy:
      "Same as Lovable — AI-tool builders hit the post-launch wall fast. Be the person who answers the 'how do I get customers' question for 2 weeks.",
    whereTheyAre: "#showcase, #help",
  },
  {
    slug: "cursor-community",
    name: "Cursor Community",
    platform: "discord",
    url: "https://forum.cursor.com",
    audience: "~40K members",
    difficulty: 3,
    selfPromoPolicy: "restricted",
    bestEntryStrategy:
      "Forum-based, so contributions are searchable and compound. Write one deep post on 'post-launch distribution for AI-built products' and let it rank.",
    whereTheyAre: "Showcase + Help categories",
  },
  {
    slug: "replit-community",
    name: "Replit Community",
    platform: "discord",
    url: "https://discord.gg/replit",
    audience: "~200K members",
    difficulty: 2,
    selfPromoPolicy: "restricted",
    bestEntryStrategy:
      "Large + younger demographic. The subset that ships and hits the wall is real but noisy. Lead with the framework, not the product.",
    whereTheyAre: "#share, #help",
  },
  {
    slug: "microconf-connect",
    name: "MicroConf Connect",
    platform: "slack",
    url: "https://microconf.com/connect",
    audience: "~10K members",
    difficulty: 3,
    selfPromoPolicy: "allowed-with-value",
    bestEntryStrategy:
      "Highest-signal founder community on this list. The #distribution and #pricing channels are the exact rooms. Be a person before you share a link.",
    whereTheyAre: "#distribution, #pricing, #introductions",
  },
  {
    slug: "wip",
    name: "WIP (Work in Progress)",
    platform: "telegram",
    url: "https://wip.co",
    audience: "~2K members",
    difficulty: 2,
    selfPromoPolicy: "allowed-with-value",
    bestEntryStrategy:
      "Small + paid + tight. Daily-logs culture. Ship publicly for 2 weeks, then mention the Playbook in the context of your own milestone.",
    whereTheyAre: "Main chat + #todos feed",
  },
  {
    slug: "makerlog",
    name: "Makerlog",
    platform: "discord",
    url: "https://makerlog.io",
    audience: "~3K members",
    difficulty: 2,
    selfPromoPolicy: "allowed-with-value",
    bestEntryStrategy:
      "Daily-logs culture. Same as WIP — earn the right to share by logging your own work for 2 weeks first.",
    whereTheyAre: "#general, #logs",
  },
  {
    slug: "reddit-saas",
    name: "r/SaaS",
    platform: "reddit",
    url: "https://reddit.com/r/SaaS",
    audience: "~150K members",
    difficulty: 2,
    selfPromoPolicy: "allowed-with-value",
    bestEntryStrategy:
      "Long-form posts work. Share a real post-mortem with numbers. Soft-link in the comments after 5+ upvotes. Never link in the post body.",
    whereTheyAre: "Top + Hot feeds; search 'launched zero customers'",
  },
  {
    slug: "reddit-nocode",
    name: "r/nocode",
    platform: "reddit",
    url: "https://reddit.com/r/nocode",
    audience: "~80K members",
    difficulty: 2,
    selfPromoPolicy: "allowed-with-value",
    bestEntryStrategy:
      "Less saturated than r/SaaS. AI-tool launches land here. The post-launch question is the same — answer it.",
    whereTheyAre: "Hot feed; search 'get users'",
  },
  {
    slug: "reddit-entrepreneur",
    name: "r/Entrepreneur",
    platform: "reddit",
    url: "https://reddit.com/r/Entrepreneur",
    audience: "~2M members",
    difficulty: 2,
    selfPromoPolicy: "allowed-with-value",
    bestEntryStrategy:
      "Broad audience, lower signal, but huge reach. A single post that hits the front page can drive 5K+ visits. Lead with the story, not the product.",
    whereTheyAre: "Top feed; search 'I launched'",
  },
  {
    slug: "reddit-sidehustle",
    name: "r/SideHustle",
    platform: "reddit",
    url: "https://reddit.com/r/SideHustle",
    audience: "~500K members",
    difficulty: 2,
    selfPromoPolicy: "allowed-with-value",
    bestEntryStrategy:
      "Side-income framing works better than SaaS framing here. Lead with the 'first $1 online' angle, not the product.",
    whereTheyAre: "Hot feed; search 'first sale'",
  },
  {
    slug: "reddit-startups",
    name: "r/startups",
    platform: "reddit",
    url: "https://reddit.com/r/startups",
    audience: "~1M members",
    difficulty: 3,
    selfPromoPolicy: "banned",
    bestEntryStrategy:
      "Self-promo is banned in the body. Share value in comments only, and only when the OP explicitly asks. Patience game.",
    whereTheyAre: "Comments on 'launched' posts",
  },
  {
    slug: "x-buildinpublic",
    name: "X / #buildinpublic",
    platform: "twitter",
    url: "https://x.com/search?q=%23buildinpublic",
    audience: "Daily active, ~10K posts/day",
    difficulty: 2,
    selfPromoPolicy: "allowed",
    bestEntryStrategy:
      "The hashtag is permission to share. But the feed rewards specificity — post real numbers ($0, 300 signups, 0 charges), not platitudes.",
    whereTheyAre: "#buildinpublic, #indiehackers, #nocode hashtags",
  },
  {
    slug: "x-indiehackers",
    name: "X / Indie Hackers sphere",
    platform: "twitter",
    url: "https://x.com/search?q=indie%20hackers",
    audience: "~50K active accounts",
    difficulty: 3,
    selfPromoPolicy: "allowed",
    bestEntryStrategy:
      "Reply to the big accounts (Courtland, levels.io, Marc Lou) with substance, not links. Build a reply history before you post your own thread.",
    whereTheyAre: "Followers of @levelsio, @csallen, @marc_louvion, @tdinh_me",
  },
  {
    slug: "producthunt-makers",
    name: "Product Hunt (Makers)",
    platform: "site",
    url: "https://producthunt.com",
    audience: "~1M members",
    difficulty: 3,
    selfPromoPolicy: "allowed-with-value",
    bestEntryStrategy:
      "Launch day is a spike. The makers who stick around in comments, help other launches, and build the relationship are the ones who get sustained traffic.",
    whereTheyAre: "Comments on other maker launches; the 'Following' feed",
  },
  {
    slug: "hackernews",
    name: "Hacker News (Show HN)",
    platform: "forum",
    url: "https://news.ycombinator.com",
    audience: "~500K daily active",
    difficulty: 5,
    selfPromoPolicy: "restricted",
    bestEntryStrategy:
      "Show HN with a genuinely free tool (the diagnostic, a calculator). No marketing copy in the title. The community eats hype alive. Earn it with substance.",
    whereTheyAre: "Show HN, Ask HN, front-page comments",
  },
];

export const COMMUNITY_TOTAL = COMMUNITY_ENTRIES.length;

export const COMMUNITY_BY_PLATFORM = (Object.keys(PLATFORM_LABELS) as Platform[]).map((p) => ({
  platform: p,
  label: PLATFORM_LABELS[p],
  count: COMMUNITY_ENTRIES.filter((c) => c.platform === p).length,
}));

export function getCommunityBySlug(slug: string): CommunityEntry | undefined {
  return COMMUNITY_ENTRIES.find((c) => c.slug === slug);
}
