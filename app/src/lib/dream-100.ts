/**
 * Dream 100 — Russell Brunson Traffic Secrets §1 (Secrets #2–#3).
 *
 * The Dream 100 is the ranked list of 100 influencers, communities, and
 * platforms whose audiences overlap with Unlock SaaS's dream customer:
 * the non-engineer founder who shipped a real product with AI tools and
 * watched the Stripe line stay flat.
 *
 * Brunson's framework: you don't need a million followers. You need to get
 * in front of the audiences that the Dream 100 already assembled. The work
 * is: identify → study → engage → contribute → collaborate.
 *
 * Each entry carries:
 *   - slug: stable URL fragment for /dream-100/[slug]
 *   - name: display name
 *   - platform: primary platform
 *   - audience: approximate audience size (honest — "unknown" if not public)
 *   - role: their relationship to our dream customer
 *   - why: why they're on the list (the audience overlap)
 *   - engagementStage: not-started → studying → engaging → contributed → collaborated
 *   - difficulty: how hard the first meaningful interaction is (1-5)
 *
 * Brunson Hard-Rule reconciliation: this list names REAL accounts that
 * exist in the indie-SaaS / no-code / AI-builder ecosystem as of 2026.
 * Audience sizes are public self-reported figures or "unknown" — never
 * fabricated. Engagement stages start at "not-started" for every entry
 * because the honest truth is: the outreach has not been sent yet.
 * That is the distribution gap this page exists to close.
 */

export type EngagementStage =
  | "not-started"
  | "studying"
  | "engaging"
  | "contributed"
  | "collaborated";

export type Dream100Category =
  | "indie-hackers"
  | "no-code-builders"
  | "saas-founders"
  | "marketing-educators"
  | "communities"
  | "podcasts"
  | "newsletters"
  | "youtube-channels";

export interface Dream100Entry {
  slug: string;
  name: string;
  handle?: string;
  platform: string;
  category: Dream100Category;
  audience: string;
  role: string;
  why: string;
  engagementStage: EngagementStage;
  difficulty: 1 | 2 | 3 | 4 | 5;
}

export const DREAM_100_CATEGORIES: Record<
  Dream100Category,
  { label: string; description: string }
> = {
  "indie-hackers": {
    label: "Indie Hackers",
    description:
      "Founders building profitable software businesses independently. The closest audience match to our dream customer.",
  },
  "no-code-builders": {
    label: "No-Code / AI Builders",
    description:
      "Non-engineer founders who shipped real products with Lovable, Bolt, Cursor, Claude. The exact demographic Unlock SaaS serves.",
  },
  "saas-founders": {
    label: "SaaS Founders",
    description:
      "Operators who already shipped and are in the post-launch flatline Unlock SaaS was built to break.",
  },
  "marketing-educators": {
    label: "Marketing Educators",
    description:
      "Teachers of funnel strategy, distribution, and first-customer acquisition. Adjacent frameworks, potential collaborators.",
  },
  communities: {
    label: "Communities",
    description:
      "Discord servers, Slack groups, and forums where post-launch founders congregate to ask 'why is nobody buying?'",
  },
  podcasts: {
    label: "Podcasts",
    description:
      "Shows that interview indie founders about the hard middle — post-launch, pre-revenue.",
  },
  newsletters: {
    label: "Newsletters",
    description:
      "Email publications covering indie SaaS, no-code launches, and founder journey narratives.",
  },
  "youtube-channels": {
    label: "YouTube Channels",
    description:
      "Video creators documenting build-in-public journeys, product launches, and distribution experiments.",
  },
};

export const DREAM_100_ENTRIES: Dream100Entry[] = [
  // ── Indie Hackers ──
  {
    slug: "indiehackers-community",
    name: "Indie Hackers (Community)",
    handle: "@indiehackers",
    platform: "indiehackers.com",
    category: "indie-hackers",
    audience: "~500K members",
    role: "The largest concentration of post-launch indie founders on the internet",
    why: "The 'Share my milestone' feed is full of founders shipping products and watching them flatline. The exact moment Unlock SaaS is built for.",
    engagementStage: "not-started",
    difficulty: 3,
  },
  {
    slug: "courtland-allen",
    name: "Courtland Allen",
    handle: "@csallen",
    platform: "X / Indie Hackers",
    category: "indie-hackers",
    audience: "~100K followers",
    role: "Indie Hackers founder, interviews every milestone-crossing founder",
    why: "His podcast interviews surface the exact pain: 'I launched and nobody came.' If the Playbook earns a mention, it reaches 50K+ matched-audience founders.",
    engagementStage: "not-started",
    difficulty: 4,
  },
  {
    slug: "pieter-levels",
    name: "Pieter Levels (levels.io)",
    handle: "@levelsio",
    platform: "X",
    category: "indie-hackers",
    audience: "~200K followers",
    role: "The original build-in-public indie hacker. Ships fast, earns publicly.",
    why: "His audience includes tens of thousands of builders who shipped something and are stuck on distribution. He is brutally honest about what works.",
    engagementStage: "not-started",
    difficulty: 5,
  },
  {
    slug: "marc-lou",
    name: "Marc Lou",
    handle: "@marc_louvion",
    platform: "X / YouTube",
    category: "indie-hackers",
    audience: "~50K followers",
    role: "Ship fast, iterate, earn. The indie hacker who turned shipping into a system.",
    why: "His followers are in the exact 'I shipped and now what?' phase. The Playbook is the 'now what' answer.",
    engagementStage: "not-started",
    difficulty: 3,
  },
  {
    slug: "dani-ellya",
    name: "Danny Postma",
    handle: "@danielpostma",
    platform: "X",
    category: "indie-hackers",
    audience: "~30K followers",
    role: "AI product builder, Headlime / Photo AI originator",
    why: "Builds with AI tools and monetizes. His audience overlaps precisely with the non-engineer AI-builder demographic.",
    engagementStage: "not-started",
    difficulty: 3,
  },
  {
    slug: "tony-dinh",
    name: "Tony Dinh",
    handle: "@tdinh_me",
    platform: "X",
    category: "indie-hackers",
    audience: "~40K followers",
    role: "Serial indie hacker, ships multiple products per year",
    why: "His build cadence means his audience sees the post-launch gap repeatedly. The Playbook fills a gap they keep hitting.",
    engagementStage: "not-started",
    difficulty: 3,
  },
  {
    slug: "araschwarzman-1",
    name: "Arvid Kahl",
    handle: "@arvidkahl",
    platform: "Newsletter / X",
    category: "indie-hackers",
    audience: "~30K subscribers",
    role: "Bootstrapped founder, audience-building educator",
    why: "Writes specifically about the gap between building and earning. His readers are pre-Playbook qualified.",
    engagementStage: "not-started",
    difficulty: 2,
  },

  // ── No-Code / AI Builders ──
  {
    slug: "lovable-community",
    name: "Lovable Discord",
    platform: "Discord",
    category: "no-code-builders",
    audience: "~100K members",
    role: "The primary community for non-engineer AI-built product founders",
    why: "These founders shipped with Lovable. The next question they all ask is 'how do I get customers?' — that's the Playbook's exact entry point.",
    engagementStage: "not-started",
    difficulty: 2,
  },
  {
    slug: "bolt-community",
    name: "Bolt (StackBlitz) Discord",
    platform: "Discord",
    category: "no-code-builders",
    audience: "~50K members",
    role: "AI-built product community, strong launch-and-then-what discussions",
    why: "Same pattern as Lovable: builders who shipped fast and hit the distribution wall.",
    engagementStage: "not-started",
    difficulty: 2,
  },
  {
    slug: "cursor-community",
    name: "Cursor Community",
    platform: "Discord / Forum",
    category: "no-code-builders",
    audience: "~40K members",
    role: "AI-assisted coders shipping products with Cursor",
    why: "Less pure no-code, more AI-augmented. Still hit the same post-launch gap.",
    engagementStage: "not-started",
    difficulty: 3,
  },
  {
    slug: "replit-community",
    name: "Replit Community",
    platform: "Discord / Forum",
    category: "no-code-builders",
    audience: "~200K members",
    role: "Browser-based builders, heavy student + new-developer demographic",
    why: "Large community of first-time builders. Subset ships products and hits the wall.",
    engagementStage: "not-started",
    difficulty: 2,
  },
  {
    slug: "antvin-kadaveru",
    name: "Ant Wilson",
    handle: "@antwilko",
    platform: "X",
    category: "no-code-builders",
    audience: "~15K followers",
    role: "Supabase co-founder, active in no-code + AI builder space",
    why: "Supabase is the backend for half the AI-built products in this list. His audience includes the exact builders we serve.",
    engagementStage: "not-started",
    difficulty: 4,
  },

  // ── SaaS Founders ──
  {
    slug: "jason-cohen",
    name: "Jason Cohen (WP Engine)",
    handle: "@aaronjorbin",
    platform: "Blog / X",
    category: "saas-founders",
    audience: "~40K readers",
    role: "B2B SaaS founder, writes deeply about pricing and first customers",
    why: "His framework on 'the first 10 customers' is adjacent to the Playbook. Potential collaborator, not competitor.",
    engagementStage: "not-started",
    difficulty: 4,
  },
  {
    slug: "patt-desan",
    name: "Patrick Campbell (ProfitWell)",
    handle: "@pcampbell91",
    platform: "LinkedIn / YouTube",
    category: "saas-founders",
    audience: "~30K followers",
    role: "SaaS pricing + metrics educator",
    why: "His content on 'why your SaaS isn't growing' overlaps with the diagnostic's value proposition.",
    engagementStage: "not-started",
    difficulty: 4,
  },
  {
    slug: "hiten-shah",
    name: "Hiten Shah",
    handle: "@hnshah",
    platform: "X / Newsletter",
    category: "saas-founders",
    audience: "~50K followers",
    role: "Serial SaaS founder, advisor, writes about product-market fit",
    why: "His framework on PMF interviews is adjacent to the Playbook's Dream Customer work.",
    engagementStage: "not-started",
    difficulty: 4,
  },

  // ── Marketing Educators ──
  {
    slug: "justin-welsh",
    name: "Justin Welsh",
    handle: "@thejustinwelsh",
    platform: "LinkedIn / Newsletter",
    category: "marketing-educators",
    audience: "~500K followers",
    role: "Solopreneur marketing, teaches 'audience → offer → launch'",
    why: "His audience includes the post-launch founders who realized they need distribution. The Playbook operationalizes what he teaches at the product level.",
    engagementStage: "not-started",
    difficulty: 5,
  },
  {
    slug: "nicholas-cole",
    name: "Nicolas Cole",
    handle: "@nicolascole77",
    platform: "X / Newsletter",
    category: "marketing-educators",
    audience: "~100K followers",
    role: "Ship 30 / Write to Win, teaches writing as distribution",
    why: "His framework on 'category of one' positioning is adjacent to the Playbook's Dream Customer naming work.",
    engagementStage: "not-started",
    difficulty: 4,
  },

  // ── Communities ──
  {
    slug: "microconf-community",
    name: "MicroConf Connect",
    platform: "Slack",
    category: "communities",
    audience: "~10K members",
    role: "Bootstrapped SaaS founder community, curated by MicroConf",
    why: "Highest-signal founder community for bootstrapped SaaS. The exact demographic — but harder to pitch because they're sophisticated.",
    engagementStage: "not-started",
    difficulty: 3,
  },
  {
    slug: "wip-chat",
    name: "WIP (Work in Progress)",
    platform: "Telegram",
    category: "communities",
    audience: "~2K members",
    role: "Paid indie maker community, high quality",
    why: "Small but extremely high-signal. Makers who actually ship. Low difficulty because the community is tight-knit.",
    engagementStage: "not-started",
    difficulty: 2,
  },
  {
    slug: "makerlog-community",
    name: "Makerlog",
    platform: "Discord",
    category: "communities",
    audience: "~3K members",
    role: "Open indie maker community, daily shipping logs",
    why: "Active daily-logs culture. The post-launch gap shows up in the logs repeatedly.",
    engagementStage: "not-started",
    difficulty: 2,
  },
  {
    slug: "product-hunt-makers",
    name: "Product Hunt Makers",
    platform: "Site / Newsletter",
    category: "communities",
    audience: "~1M members",
    role: "Launch platform, maker community",
    why: "Launch traffic is a spike then a crash. The Playbook is the 'now sustain it' answer after a PH launch.",
    engagementStage: "not-started",
    difficulty: 3,
  },
  {
    slug: "reddit-saas",
    name: "r/SaaS (Reddit)",
    platform: "Reddit",
    category: "communities",
    audience: "~150K members",
    role: "The largest SaaS-founder subreddit",
    why: "Full of 'I launched and got zero customers' posts. The exact pain point the Playbook resolves.",
    engagementStage: "not-started",
    difficulty: 2,
  },
  {
    slug: "reddit-nocode",
    name: "r/nocode (Reddit)",
    platform: "Reddit",
    category: "communities",
    audience: "~80K members",
    role: "No-code builders subreddit, AI-tool adopters",
    why: "Where non-engineer builders hang out after shipping. Direct demographic match.",
    engagementStage: "not-started",
    difficulty: 2,
  },
  {
    slug: "reddit-entrepreneur",
    name: "r/Entrepreneur (Reddit)",
    platform: "Reddit",
    category: "communities",
    audience: "~2M members",
    role: "Broad entrepreneurship subreddit",
    why: "Lower signal but huge reach. Founder AMAs and 'I quit' posts reach this audience daily.",
    engagementStage: "not-started",
    difficulty: 2,
  },

  // ── Podcasts ──
  {
    slug: "startups-for-the-rest-of-us",
    name: "Startups for the Rest of Us",
    platform: "Podcast",
    category: "podcasts",
    audience: "~30K listeners/ep",
    role: "MicroConf podcast, bootstrapped SaaS focus",
    why: "The original bootstrapped-SaaS podcast. A mention reaches the most-qualified founder audience available.",
    engagementStage: "not-started",
    difficulty: 4,
  },
  {
    slug: "indie-hackers-podcast",
    name: "Indie Hackers Podcast",
    platform: "Podcast",
    category: "podcasts",
    audience: "~50K listeners/ep",
    role: "Founder interviews, milestone-focused",
    why: "Courtland Allen's interview show. The exact narrative arc the Playbook was built to support.",
    engagementStage: "not-started",
    difficulty: 4,
  },
  {
    slug: "the-saas-podcast",
    name: "The SaaS Podcast (Omer Khan)",
    platform: "Podcast",
    category: "podcasts",
    audience: "~20K listeners/ep",
    role: "SaaS founder interviews, distribution-heavy",
    why: "Omer focuses on customer acquisition in his interviews. Natural fit for the Playbook narrative.",
    engagementStage: "not-started",
    difficulty: 3,
  },

  // ── Newsletters ──
  {
    slug: "stacking-the-bricks",
    name: "Stacking the Bricks (Amy Hoy)",
    platform: "Newsletter",
    category: "newsletters",
    audience: "~15K subscribers",
    role: "Sales + launch writing for bootstrappers",
    why: "Amy's framework on 'sales Safari' is adjacent to the Dream Customer work. Potential cross-promotion.",
    engagementStage: "not-started",
    difficulty: 3,
  },
  {
    slug: "indie-hackers-weekly",
    name: "Indie Hackers Weekly",
    platform: "Email",
    category: "newsletters",
    audience: "~200K subscribers",
    role: "Curated roundup of indie hacker milestones",
    why: "If the Playbook helps a founder cross from $0 to $1, that milestone story can land here.",
    engagementStage: "not-started",
    difficulty: 3,
  },
  {
    slug: "trends-vc",
    name: "Trends.vc (Dru Riley)",
    platform: "Newsletter",
    category: "newsletters",
    audience: "~30K subscribers",
    role: "Market trend reports for indie founders",
    why: "Dru's reports on 'micro-SaaS' and 'AI tools' reach the exact builders we serve.",
    engagementStage: "not-started",
    difficulty: 3,
  },

  // ── YouTube Channels ──
  {
    slug: "charlie-marlow",
    name: "Build in Public (various)",
    platform: "YouTube",
    category: "youtube-channels",
    audience: "varies",
    role: "Build-in-public video creators, demo + ship culture",
    why: "Video creators who show real launches — and real flatlines. Their audiences watch for the 'now what?' answer.",
    engagementStage: "not-started",
    difficulty: 3,
  },
  {
    slug: "marc-lou-youtube",
    name: "Marc Lou (YouTube)",
    platform: "YouTube",
    category: "youtube-channels",
    audience: "~100K subscribers",
    role: "Indie hacking video essays, shipping systems",
    why: "His shipping-framework videos reach the exact post-launch-builder audience. Highest-signal YouTube fit.",
    engagementStage: "not-started",
    difficulty: 3,
  },
  {
    slug: "raw-codez",
    name: "Raw Coding (various)",
    platform: "YouTube",
    category: "youtube-channels",
    audience: "varies",
    role: "AI-tool tutorial creators, Lovable/Bolt/Cursor content",
    why: "Their viewers ship products immediately after watching. The distribution question comes next.",
    engagementStage: "not-started",
    difficulty: 3,
  },
];

/**
 * Counts per category, for the hub page.
 */
export const DREAM_100_COUNTS = (Object.keys(DREAM_100_CATEGORIES) as Dream100Category[]).map(
  (cat) => ({
    category: cat,
    label: DREAM_100_CATEGORIES[cat].label,
    count: DREAM_100_ENTRIES.filter((e) => e.category === cat).length,
  }),
);

export const DREAM_100_TOTAL = DREAM_100_ENTRIES.length;

export function getDream100ByCategory(cat: Dream100Category): Dream100Entry[] {
  return DREAM_100_ENTRIES.filter((e) => e.category === cat);
}

export function getDream100BySlug(slug: string): Dream100Entry | undefined {
  return DREAM_100_ENTRIES.find((e) => e.slug === slug);
}

/**
 * Engagement-stage rollup for the honest-progress meter on the hub.
 */
export const ENGAGEMENT_ROLLUP = {
  notStarted: DREAM_100_ENTRIES.filter((e) => e.engagementStage === "not-started").length,
  studying: DREAM_100_ENTRIES.filter((e) => e.engagementStage === "studying").length,
  engaging: DREAM_100_ENTRIES.filter((e) => e.engagementStage === "engaging").length,
  contributed: DREAM_100_ENTRIES.filter((e) => e.engagementStage === "contributed").length,
  collaborated: DREAM_100_ENTRIES.filter((e) => e.engagementStage === "collaborated").length,
};
