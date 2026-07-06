/**
 * Ad Creative Library — Russell Brunson Traffic Secrets §5 (Secret #11-15).
 *
 * Ready-to-deploy ad concepts across four distribution platforms. Each
 * concept includes: hook, story, offer, visuals, and targeting preset.
 *
 * Brunson's rule for ads: the ad is not the offer. The ad is the HOOK
 * that earns the click to the story (landing page) that presents the
 * offer. Never hard-sell in the ad itself.
 *
 * These are the cold-traffic bridge ads from Traffic Secrets Secret #19
 * (Cold-Traffic Bridge): they don't sell the Playbook. They sell the
 * FREE diagnostic — the lowest-friction entry point to the funnel.
 *
 * Brunson Hard-Rule: all concepts are deployable with existing assets
 * (the diagnostic landing page exists at /diagnostic). No product shots
 * needed — text + simple graphic is faster, cheaper, and tests better
 * for B2B SaaS.
 */

export type AdPlatform = "meta" | "reddit" | "linkedin" | "google";

export type AdFormat = "single-image" | "carousel" | "text-only" | "video-15s" | "video-30s";

export interface AdCreative {
  slug: string;
  platform: AdPlatform;
  format: AdFormat;
  hook: string;
  offerLink: string;
  targetingPreset: string;
  /** The copy block for the ad body (or the image overlay text). */
  bodyCopy: string;
  /** The CTA button text */
  cta: string;
  /** Who the ad is for — one specific persona */
  persona: string;
  /**
   * Launch phase from the 0→100K roadmap.
   */
  phase: "validation" | "raiders" | "scale";
}

export const AD_PLATFORM_LABELS: Record<AdPlatform, string> = {
  meta: "Meta (Facebook/Instagram)",
  reddit: "Reddit Ads",
  linkedin: "LinkedIn Ads",
  google: "Google Ads / Discovery",
};

export const AD_CREATIVES: AdCreative[] = [
  // ── Phase 1: Validation (prove the ad unit works, low budget) ──
  {
    slug: "meta-stripe-flatline",
    platform: "meta",
    format: "single-image",
    hook: "Your Stripe line is flat. Your product works. Here's why.",
    offerLink: "https://unlocksaas.com/diagnostic",
    targetingPreset:
      "Interests: Indie Hackers, No-Code, Lovable, Bolt, Retool, Cursor, SaaS, AI tools. Age: 25-50. Lookalike from email subscribers once >100.",
    bodyCopy:
      "You shipped a product with AI tools. It works. You use it yourself. But your Stripe dashboard shows $0.00. The product is not the problem — the problem is the work nobody taught us. Take the free 2-minute diagnostic and name the missing piece.",
    cta: "Take the free diagnostic",
    persona: "Post-launch founder, shipped with AI, zero revenue",
    phase: "validation",
  },
  {
    slug: "reddit-built-flatline",
    platform: "reddit",
    format: "text-only",
    hook: "Built with [AI tool]. Opened Stripe. Nothing.",
    offerLink: "https://unlocksaas.com/diagnostic",
    targetingPreset:
      "Target r/SaaS, r/nocode, r/Entrepreneur, r/sidehustle. Interest: SaaS, software development, entrepreneurship.",
    bodyCopy:
      "You spent 3 weeks building with Cursor/Lovable/Bolt. You shipped. You launched. The line stayed flat. This has a name. It's not the product. Take the 2-minute diagnostic.",
    cta: "Take the diagnostic",
    persona: "AI-tool builder, post-launch, $0 MRR",
    phase: "validation",
  },
  {
    slug: "linkedin-first-charge",
    platform: "linkedin",
    format: "single-image",
    hook: "The one Stripe charge that changed everything",
    offerLink: "https://unlocksaas.com/diagnostic",
    targetingPreset:
      "Job title: Founder, CEO, Product Manager, Indie Developer. Industry: Software, Technology. Company size: 1-10.",
    bodyCopy:
      "For 90 days I watched a flat Stripe line. 300 signups. Zero charges. Then I changed one thing — I stopped optimizing for signups and started optimizing for ONE charge. One person. One promise. One card entered.",
    cta: "Read the breakdown",
    persona: "B2B SaaS founder building solo or with small team",
    phase: "validation",
  },

  // ── Phase 2: Raiders (proven creative → increase budget) ──
  {
    slug: "meta-300-signups",
    platform: "meta",
    format: "carousel",
    hook: "300 signups. Zero charges. The product worked.",
    offerLink: "https://unlocksaas.com/diagnostic",
    targetingPreset:
      "Retarget visitors to /diagnostic and /how-to pages. Lookalike from diagnostic completions.",
    bodyCopy:
      "Slide 1: '300 people signed up for my product. $0.00 earned.' Slide 2: 'The product worked. I used it every day.' Slide 3: 'The problem was not the product. It was the work I was avoiding.' Slide 4: 'The diagnostic named it.' Slide 5: 'The 60-day Playbook fixed it.'",
    cta: "Find your missing piece",
    persona: "Tool builder who shipped but hasn't earned",
    phase: "raiders",
  },
  {
    slug: "reddit-product-isnt-problem",
    platform: "reddit",
    format: "text-only",
    hook: "The product is almost never the problem.",
    offerLink: "https://unlocksaas.com/diagnostic",
    targetingPreset:
      "Same as phase 1 (r/SaaS, r/nocode, r/Entrepreneur), plus r/startups. Frequency cap: 3x/7d.",
    bodyCopy:
      "I sat with 10+ AI-tool founders last year. Every single one had a working product and a flat Stripe line. The bottleneck was never the product. It was the same three things: a named person, a real promise, and a repeatable distribution process. The diagnostic names which one you're missing.",
    cta: "Name the missing piece",
    persona: "Post-launch founder who keeps building features hoping earnings follow",
    phase: "raiders",
  },
  {
    slug: "google-diag-search",
    platform: "google",
    format: "text-only",
    hook: "Your SaaS launched but nobody is buying?",
    offerLink: "https://unlocksaas.com/diagnostic",
    targetingPreset:
      "Keyword: 'why is my saas not growing', 'how to get first customer', 'saas launched no customers', 'ai product no sales', 'indie hacker first sale'. Match: phrase.",
    bodyCopy:
      "You shipped. The line stayed flat. The 2-minute diagnostic names the gap so you can fix it in 60 days. If it doesn't produce a verified paying customer, you don't pay.",
    cta: "Take the 2-minute diagnostic",
    persona: "Searching founder, post-launch, wants an answer",
    phase: "raiders",
  },
  {
    slug: "linkedin-build-in-public",
    platform: "linkedin",
    format: "carousel",
    hook: "We stopped pretending the product was the problem.",
    offerLink: "https://unlocksaas.com/diagnostic",
    targetingPreset:
      "Job title: Founder, CEO. Interest: Indie Hackers, SaaS, Bootstrapping. Company size: 1-10.",
    bodyCopy:
      "Slide 1: 'What 10 post-launch founders all had in common.' Slide 2: 'Working product + flat Stripe line.' Slide 3: 'They were avoiding the distribution work.' Slide 4: 'The system that replaced the avoidance.' Slide 5: 'No course. No guru. A guarantee backed by Stripe.'",
    cta: "The 2-minute diagnostic",
    persona: "SaaS founder, post-launch, evaluating distribution frameworks",
    phase: "raiders",
  },

  // ── Phase 3: Scale (proven winners, increased lookalike pools) ──
  {
    slug: "meta-first-dollar",
    platform: "meta",
    format: "video-15s",
    hook: "The first dollar I earned online. (Not what you'd expect.)",
    offerLink: "https://unlocksaas.com/diagnostic",
    targetingPreset:
      "Lookalike from paying customers (1% seed) + diagnostic completions (5% scale). Broad: entrepreneurship, SaaS, AI tools.",
    bodyCopy:
      "Text overlay: 'I spent 90 days watching a flat line. Then I stopped building and started selling — before it felt ready. The first $1 came from one person I named, one promise I made, and one DM I sent.'",
    cta: "Your first $1 starts here",
    persona: "Founder with a product who hasn't earned a dollar yet",
    phase: "scale",
  },
  {
    slug: "reddit-dont-buy",
    platform: "reddit",
    format: "text-only",
    hook: "Don't buy Unlock SaaS. Here's why.",
    offerLink: "https://unlocksaas.com/dont-buy-unlock-saas",
    targetingPreset:
      "Broad SaaS/entrepreneur subs, with interest targeting. New audience — the polarity ad should run as a separate campaign from the diagnostic ads.",
    bodyCopy:
      "Don't buy the Playbook if: (a) you think your product is the problem, (b) you believe more features will fix the line, (c) you want a '5x your revenue in 30 days' promise. Scroll away. This isn't for you. For everyone else — the diagnostic is free and it tells you exactly where the gap is.",
    cta: "Free diagnostic (no email)",
    persona: "Skeptical founder who's been burned by marketing hype",
    phase: "scale",
  },
  {
    slug: "linkedin-stripe-verified",
    platform: "linkedin",
    format: "single-image",
    hook: "60 days. One paying customer. Stripe-verified or you don't pay.",
    offerLink: "https://unlocksaas.com/playbook-sales",
    targetingPreset:
      "Retarget: visited /diagnostic OR /playbook-sales in last 14 days. Exclude: already purchased. No job-title limitation.",
    bodyCopy:
      "The Playbook refunds by Stripe charge, not by support ticket. If you don't get one verified paying customer in 60 days of following the system, I refund your subscription automatically. No forms. No questions. One API check.",
    cta: "Start the 60-day guarantee",
    persona: "Founder who liked the diagnostic and is evaluating the paid product",
    phase: "scale",
  },
];

export const AD_TOTAL = AD_CREATIVES.length;

export function getAdByPlatform(platform: AdPlatform): AdCreative[] {
  return AD_CREATIVES.filter((a) => a.platform === platform);
}

export function getAdBySlug(slug: string): AdCreative | undefined {
  return AD_CREATIVES.find((a) => a.slug === slug);
}

export const AD_PHASE_COUNTS = (
  ["validation", "raiders", "scale"] as const
).map((ph) => ({
  phase: ph,
  label: ph === "validation" ? "Validation (low budget)"
    : ph === "raiders" ? "Raiders (proven creative, scale)"
    : "Scale (lookalike pools)",
  count: AD_CREATIVES.filter((a) => a.phase === ph).length,
}));
