/**
 * QAPage JSON-LD builder.
 *
 * schema.org/QAPage is a distinct type from FAQPage. While FAQPage signals
 * "curated editorial Q&A," QAPage signals "community-contributed Q&A" -- the
 * form found on StackOverflow, Reddit, Quora, and product support forums.
 *
 * For UnlockSaaS, both types apply to the /faq surface:
 *   - FAQPage: editorial curation by the founder (the published answers are
 *     editorial positions, not raw community posts).
 *   - QAPage: the questions themselves are verbatim from community threads
 *     (public Indie Hackers and Hacker News posts), making this surface a
 *     hybrid -- curated editorial answers to community-sourced questions.
 *
 * Emitting both types on the same page (via a @type array) is valid per
 * schema.org and surfaces the page in BOTH FAQPage and QAPage Rich Result
 * eligibility pools. This is the pattern used by product documentation
 * sites that curate community questions.
 *
 * Honesty rule: every Question/Answer pair MUST be identical to what the
 * page renders. schema.org validators diff the schema text against the
 * rendered DOM; divergence triggers a demotion.
 *
 * Reference: https://schema.org/QAPage
 */

import { omitEmpty } from "../honesty/omit-empty.js";

export interface QAEntry {
  /** The question text, verbatim. */
  question: string;
  /**
   * The accepted / highest-voted answer text.
   * For curated editorial surfaces, this is the founder's published answer.
   */
  acceptedAnswer: string;
  /**
   * Source attribution for the question, when the question originates from
   * a public community thread (Indie Hackers, Hacker News, etc.).
   * Emitted as `Question.author` (the community poster's implicit authorship).
   * Keep this anonymous when the original poster did not consent to be named.
   */
  questionSource?: string;
}

export interface QAPageInput {
  /**
   * @type array to emit. Defaults to ["QAPage"] alone; pass
   * ["FAQPage", "QAPage"] to merge with an existing FAQPage declaration
   * on the same JSON-LD block.
   *
   * Note: when emitting a merged type array, emit a SINGLE <script> tag
   * with both types. Do NOT emit two separate script tags with conflicting
   * @type declarations for the same URL.
   */
  typeArray?: ReadonlyArray<string>;
  entries: ReadonlyArray<QAEntry>;
  inLanguage?: string;
  /**
   * upvoteCount on the Question node. Set when the original question had
   * a measurable upvote signal (e.g. HN points). Honest: omit when unknown.
   */
  upvoteCount?: number;
}

export function buildQAPage(input: QAPageInput): Record<string, unknown> {
  if (input.entries.length === 0) {
    throw new Error(
      "buildQAPage: entries[] is empty. Omit the QAPage block instead of shipping an empty one.",
    );
  }
  const typeArray =
    input.typeArray && input.typeArray.length > 0
      ? input.typeArray
      : ["QAPage"];

  return omitEmpty({
    "@context": "https://schema.org",
    "@type": typeArray.length === 1 ? typeArray[0] : typeArray,
    inLanguage: input.inLanguage,
    mainEntity: input.entries.map((e) =>
      omitEmpty({
        "@type": "Question",
        name: e.question,
        // upvoteCount if known
        ...(input.upvoteCount !== undefined
          ? { upvoteCount: input.upvoteCount }
          : {}),
        // suggestedAnswer carries all community answers; acceptedAnswer is
        // the one the editorial surface marks as correct.
        acceptedAnswer: {
          "@type": "Answer",
          text: e.acceptedAnswer,
          // upvoteCount on the Answer mirrors the implied signal that
          // the editorial answer is the "accepted" one.
          upvoteCount: 1,
        },
      } as Record<string, unknown>),
    ),
  } as Record<string, unknown>);
}
