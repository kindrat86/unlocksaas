/**
 * Reply-draft scaffold builder for the thread finder (pivot phase 3).
 *
 * RULES (from the approved pivot brief, 2026-11-03):
 *   - The draft must be specific to the thread: it quotes the thread's own
 *     words and mirrors the problem vocabulary.
 *   - Answer the question FIRST. No pitch in the opening.
 *   - Always disclose affiliation with the product.
 *   - NO link unless asked. Drafts generated here contain ZERO product URLs
 *     by construction (we do not even accept a product URL as input).
 *   - The founder posts the reply THEMSELVES, after editing the [bracketed]
 *     placeholders with their real experience. This tool never posts.
 *
 * Deterministic, no LLM, no network. If Maryan later approves a paid LLM
 * drafting pass, that proposal lives in needs-maryan.md, not here.
 */

import type { FoundThread } from "./thread-finder";

export type SourceGuidance = {
  /** short label for the rules link, e.g. "r/SaaS rules" */
  rules_label: string;
  /** link to the platform/subreddit self-promotion rules, or null (HN) */
  rules_url: string | null;
  /** honest posting guidance lines for this source */
  notes: string[];
};

/** Trim a quote for the draft so it stays readable. */
function trimQuote(quote: string, max = 220): string {
  const q = quote.replace(/\s+/g, " ").trim();
  if (q.length <= max) return q;
  return q.slice(0, max - 1).replace(/\s\S*$/, "") + "…";
}

function subredditName(thread: FoundThread): string | null {
  return thread.source_label.startsWith("r/") && thread.source_label.length > 2
    ? thread.source_label.slice(2)
    : null;
}

export function sourceGuidance(thread: FoundThread): SourceGuidance {
  if (thread.source === "reddit") {
    const sub = subredditName(thread);
    return {
      rules_label: sub ? `r/${sub} rules` : "Reddit self-promotion rules",
      rules_url: sub
        ? `https://www.reddit.com/r/${sub}/about/rules/`
        : "https://support.reddithelp.com/hc/en-us/articles/204047447-What-constitutes-spam-or-self-promotion-",
      notes: [
        "Read the subreddit rules before posting; many subs require most of your activity to be non-promotional and remove drive-by links.",
        "Disclose that you built the product. Redditors punish hidden affiliations far more than open ones.",
      ],
    };
  }
  if (thread.source === "stackexchange") {
    return {
      rules_label: "Stack Overflow promotion policy",
      rules_url: "https://stackoverflow.com/help/promotion",
      notes: [
        "The answer must answer the question. Anything that reads like an ad gets flagged and deleted.",
        "Disclose your affiliation with the product in the answer text, not only your profile.",
      ],
    };
  }
  // Hacker News
  return {
    rules_label: "HN guidelines on promotion",
    rules_url: "https://news.ycombinator.com/help",
    notes: [
      "HN is fine with builders replying openly ('I built X because...') and harsh on astroturfing.",
      "Answer substantively first; only mention your product if it is genuinely the answer.",
    ],
  };
}

function openerFor(thread: FoundThread): string {
  if (thread.source === "stackexchange") {
    return "Direct answer first: [the concrete fix, in one or two sentences].";
  }
  if (thread.source === "hn") {
    return "One thing that is underrated here: [your concrete point, no pitch].";
  }
  return "Short answer to your question: [the actual answer, one sentence, no pitch].";
}

/**
 * Build a value-first reply draft scaffold from the thread's own words.
 * Bracketed [placeholders] mark where the founder must write their real,
 * specific experience before posting.
 */
export function buildReplyDraft(
  thread: FoundThread,
  problem: string,
  product?: string
): string {
  const productPhrase =
    product && product.trim().length > 0 ? product.trim() : "a product";
  const quote = trimQuote(thread.matched_quote || thread.title);
  const mirror = trimQuote(problem, 140);

  return [
    `${openerFor(thread)}`,
    "",
    `You wrote: "${quote}" — that is exactly the problem I had in mind (${mirror.toLowerCase()}), so here is what I have learned the hard way.`,
    "",
    "What I would do, in order:",
    "1. [concrete step that answers their exact question]",
    "2. [what you tried that did NOT work — specifics build trust]",
    "3. [the cheapest next action they can take today]",
    "",
    `Disclosure: I am building ${productPhrase} for exactly this problem — that is my bias. Not linking it here; ask and I will share.`,
    "",
    "[Optional: one specific follow-up question about their setup to keep the thread alive.]",
  ].join("\n");
}
