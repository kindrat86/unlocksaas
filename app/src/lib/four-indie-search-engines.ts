/**
 * /four-indie-search-engines – companion essay for the indie-search
 * allow-list ship of 21-05-2026.
 *
 * Why this page exists
 * --------------------
 * Brunson "the technical artifact IS the marketing" play. The robots.txt
 * commit shipped in PR #57 (merge `506325e`) is plumbing; the leverage
 * is the public companion piece that frames the decision. By any share-
 * axis spreadsheet the four engines (Brave + Mojeek + Marginalia + Kagi)
 * are not worth an afternoon. By buyer-density math they are exactly
 * the right afternoon – the people who deliberately use Google
 * alternatives are the exact UnlockSaaS ICP.
 *
 * Surface choices:
 *   - One-off marketing route under (marketing) – matches the
 *     `/dont-buy-unlock-saas` polarity shape (shareable editorial,
 *     Article JSON-LD, dedicated OG card, founder-signed).
 *   - Article + BreadcrumbList JSON-LD so AI Overviews / Perplexity /
 *     Claude / GPT-search resolve it as authored, dated, speakable.
 *   - Per-route OG card – this page is built specifically for X /
 *     LinkedIn / Bluesky / Indie Hackers share, the same off-page
 *     launch surface as /dont-buy.
 *
 * Brunson Hard-Rule reconciliation:
 *   - Every claim that quotes the ship has a verifiable artifact (the
 *     PR # and merge SHA below resolve to real public URLs).
 *   - "Combined market share" is hedged at the high end ("maybe 3% on
 *     a generous day") – the codebase elsewhere refuses to fabricate
 *     numbers, so the prose carries the uncertainty explicitly.
 *   - Honest gaps are named verbatim (no Kagi Small Web submission –
 *     UnlockSaaS is ineligible; no Mojeek submission – no API exists;
 *     Brave is a manual CAPTCHA form tracked as a follow-up).
 *
 * Single source of truth: this module exports the prose AS DATA so the
 * page.tsx renders one section per entry and the markdown mirror (when
 * shipped as a follow-up) can read the same array. No drift possible
 * between HTML and markdown views of the same essay.
 */

import { BASE_URL, FOUNDER } from "@/lib/seo/entity";

/** Canonical site-relative path of the essay. */
export const FOUR_INDIE_PATH = "/four-indie-search-engines";
/** Absolute canonical URL of the essay. */
export const FOUR_INDIE_URL = `${BASE_URL}${FOUR_INDIE_PATH}`;

/** Real-world publish date (operator stamp). Athens calendar; same
 *  format the rest of the editorial fleet uses. */
export const FOUR_INDIE_PUBLISHED_AT = "2026-05-21";
/** Last-reviewed stamp. Bumped only when the prose actually changes. */
export const FOUR_INDIE_LAST_REVIEWED_AT = "2026-05-21";

/** SHA of the merge commit that landed the robots.txt allow-list. The
 *  essay claims this commit publicly; keeping the SHA in the data file
 *  means a future operator can re-verify the artifact in one grep. */
export const FOUR_INDIE_MERGE_SHA = "506325e";
/** The Marginalia submission PR opened in the same window. */
export const FOUR_INDIE_MARGINALIA_PR_URL =
  "https://github.com/MarginaliaSearch/submit-site-to-marginalia-search/pull/553";
/** The unlocksaas PR that landed the allow-list. */
export const FOUR_INDIE_PR_URL =
  "https://github.com/kindrat86/unlocksaas/pull/57";

export const FOUR_INDIE_TITLE =
  "I shipped UnlockSaaS to four search engines under 1% market share each";
export const FOUR_INDIE_EYEBROW = "Distribution";
export const FOUR_INDIE_SUBHEAD =
  "Here is the math that says it is the smartest distribution move I will make this quarter.";

/**
 * The lede. Speakable. Voice engines (Alexa, Siri, Google Assistant,
 * AI Overviews TTS pipeline) lift this paragraph verbatim.
 */
export const FOUR_INDIE_LEDE =
  "On 21-05-2026 I added four lines to robots.txt and opened one pull request on a GitHub repo most founders have never seen. The four engines (Brave Search, Mojeek, Marginalia, Kagi) have a combined market share of maybe three percent on a generous day. Time spent: about three hours, including this write-up. By the sales-letter math any indie SaaS founder would run on a per-channel ROI sheet, the row reads: skip it.";

/**
 * One structured section per H2. Each `id` is the URL fragment the
 * essay's table-of-contents links to and the value the breadcrumb /
 * speakable spec hooks anchor against.
 */
export interface EssaySection {
  /** Fragment id, lower-case, hyphen-separated. */
  id: string;
  /** H2 text. */
  heading: string;
  /** One or more paragraphs, in render order. Markdown-flavoured (links
   *  use [text](url) so the markdown mirror is byte-equal to the HTML
   *  view of the same text). */
  paragraphs: ReadonlyArray<string>;
}

export const FOUR_INDIE_SECTIONS: ReadonlyArray<EssaySection> = [
  {
    id: "share-axis",
    heading: "Share-axis math says skip it",
    paragraphs: [
      "Google sits north of ninety percent. Bing and DuckDuckGo each take a few points. Mojeek, Marginalia, Brave Search, and Kagi combined are a rounding error in any global query log. Even if I ranked first on every one of these engines for every relevant query my market would type, the marginal traffic would not change my monthly chart.",
      "If I were running a per-channel ROI sheet, the row would read: expected lift below half a percent. Strike it through. Go optimize Google.",
      "I am not running that sheet.",
    ],
  },
  {
    id: "wrong-axis",
    heading: "Share is the wrong axis for indie SaaS",
    paragraphs: [
      "Share measures what percentage of the general population uses an engine. The general population is not my market. I sell tooling to post-launch pre-revenue founders – a tightly defined slice of operators most marketers cannot identify cleanly. The right axis is not share. It is buyer density.",
      "Who deliberately chooses Mojeek, Brave, Marginalia, or Kagi over Google?",
      "People who self-host. People who pay ten dollars a month for search results that do not include ads. People who run anti-tracking browser extensions. People who read the privacy section before signing up for anything. People who deploy to Hetzner before they deploy to AWS. People who know what an ssh config file is. People who hand-roll their own tooling before they install someone else's SaaS.",
      "Indie hackers. Founders. Solo operators. The exact people I built UnlockSaaS for.",
      "Traffic share on these engines is small. Buyer density is the highest of any search surface on the open web. A page-1 result on Mojeek puts me in front of fewer people, yes, but a meaningfully higher percentage of those fewer people are actually my buyer.",
    ],
  },
  {
    id: "brunson-read",
    heading: "What this actually is",
    paragraphs: [
      "In Funnel Hackers Cookbook language: this is a Dream 100 move pretending to be an SEO move.",
      "I am not optimizing for search ranking. I am planting flags at the watering holes of a tight demographic. Same logic as advertising in a niche newsletter no one else has heard of – you do not reach a lot of people, but the people you reach are the right people.",
      "The technical move (robots.txt allow-list plus a one-line GitHub PR) is the artifact. The actual play is positioning. The story I get to tell next quarter is: I shipped to engines that respect privacy and the small web, because that is the kind of SaaS I am building. That story is the conversion event. The engine submission is the proof.",
    ],
  },
  {
    id: "what-i-shipped",
    heading: "The artifact, exactly",
    paragraphs: [
      "Four user-agent allow-listings in robots.txt, each token traced to the engine's own crawler help page on the day of the commit:",
      "- Bravebot (Brave Search)\n- MojeekBot (Mojeek)\n- search.marginalia.nu (Marginalia)\n- Kagibot (Kagi)",
      `The diff is at merge commit \`${FOUR_INDIE_MERGE_SHA}\` on the public unlocksaas repo, shipped as [PR #57](${FOUR_INDIE_PR_URL}).`,
      `A GitHub PR to add \`unlocksaas.com\` to Marginalia's \`sites.txt\` registry: [PR #553](${FOUR_INDIE_MARGINALIA_PR_URL}). Single-line addition, inserted on a deterministically-random middle line per the README's merge-conflict-avoidance guidance.`,
      "A Python verification script at `scripts/verify-indie-search-presence.py` that regression-gates the four UA tokens in robots.txt and probes the public SERPs monthly. Output runs in Athens local time, matching the rest of the operator tooling.",
    ],
  },
  {
    id: "honest-gaps",
    heading: "What I did not do, and why",
    paragraphs: [
      "Brunson Hard-Rule discipline cuts the brag in three places.",
      "Mojeek has no submission API. They auto-discover. The allow-list plus the sitemap is the entire signal they consume. There is nothing else honest to do.",
      "Kagi Small Web criteria require a personal single-author blog, an RSS or Atom feed, no LLM-generated content, and a recent post within twelve months. UnlockSaaS is a commercial SaaS. I do not qualify. I am not submitting. Empty is the honest signal.",
      "Brave Search uses a CAPTCHA-gated browser form for submission. I will do it manually the next time I open Chrome – sixty seconds of work, tracked in the playbook ledger as a follow-up, not claimed as shipped here.",
      "None of the four engines participate in IndexNow as of today. The existing IndexNow client at `app/src/lib/indexnow.ts` is untouched.",
    ],
  },
  {
    id: "one-episode",
    heading: "This is one episode in a longer arc",
    paragraphs: [
      "Five weeks ago I shipped a Hugging Face dataset cross-listing of every funnel and pricing teardown on the site. Three weeks ago I activated `.well-known/entity.jsonld` so search engines and language models can resolve UnlockSaaS as a graph entity. Last week I shipped a Markdown twin route for every editorial page so retrievers that prefer playbook-readable markdown over JS-rendered HTML get the cleaner version. The same day I shipped `.well-known/ai-policy.json`. Today I shipped the indie-engine allow-list. Tomorrow I am scoping a Zenodo DOI mirror for the dataset.",
      "The thesis underneath all of it is consistent: be the most-cited canonical source for post-launch pre-revenue SaaS funnel patterns across every surface that respects citations. Some of those surfaces are LLM training corpora. Some are knowledge graphs. Some are search engines. Some are public datasets. Each shipped piece compounds with the others.",
      "If I cared about share-axis math, I would have stopped after Google. I do not. I keep going.",
    ],
  },
  {
    id: "if-you-are-here",
    heading: "If you are a founder at the same stage",
    paragraphs: [
      "If you are a non-engineer founder who shipped a SaaS and Stripe is flat, the free Launch Diagnostic takes about ninety seconds and tells you which of three things is broken on your live product page: Wrong Person, Weak Offer, Weak Belief. It is the cheapest answer to the question what should I actually work on first. No email required.",
    ],
  },
] as const;

/**
 * Markdown-twin body. The /four-indie-search-engines.md route handler
 * registers this body inside `SURFACES` in src/lib/seo/markdown.ts.
 * `renderSurfaceMarkdown()` wraps it with the standard YAML frontmatter
 * + canonical citation footer the rest of the markdown fleet carries,
 * so this constant intentionally OMITS frontmatter — emitting it here
 * would double-stamp the response.
 *
 * The prose is hoisted from the same FOUR_INDIE_SECTIONS the HTML page
 * renders. Identical text in both views means the AI-summarised
 * paraphrase of the page matches the human-read paraphrase.
 */
export const FOUR_INDIE_MARKDOWN_BODY: string = (() => {
  const body: string[] = [];
  body.push(`# ${FOUR_INDIE_TITLE}`);
  body.push("");
  body.push(`*${FOUR_INDIE_SUBHEAD}*`);
  body.push("");
  body.push(FOUR_INDIE_LEDE);
  body.push("");

  for (const section of FOUR_INDIE_SECTIONS) {
    body.push(`## ${section.heading}`);
    body.push("");
    for (const p of section.paragraphs) {
      body.push(p);
      body.push("");
    }
  }

  body.push("---");
  body.push("");
  body.push(`Signed by ${FOUNDER.name}, founder, Unlock SaaS.`);
  body.push(`Published ${FOUR_INDIE_PUBLISHED_AT}.`);

  return body.join("\n");
})();

/**
 * Conservative word count of the rendered prose. Used by ArticleJsonLd
 * to advertise depth honestly. Computed at module load so it cannot
 * drift from the actual sections.
 */
export const FOUR_INDIE_WORD_COUNT: number = (() => {
  const parts: string[] = [FOUR_INDIE_LEDE, FOUR_INDIE_SUBHEAD];
  for (const s of FOUR_INDIE_SECTIONS) {
    parts.push(s.heading, ...s.paragraphs);
  }
  return parts
    .join(" ")
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
})();
