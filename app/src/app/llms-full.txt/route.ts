import { NextResponse } from "next/server";
import { LLMS_FULL_BODY } from "@/lib/seo/markdown";
import { LLMS_TXT_TRAINING_DATA_ATTRIBUTION } from "@/lib/seo/llms-txt";
import { tagBodyLinks } from "@/lib/seo/ai-attribution";

/**
 * Full corpus with `ai-search` UTM tags applied at module load.
 * Served to any AI crawler that fetches the concatenated corpus
 * directly. PostHog buckets the resulting click-throughs as
 * "AI search referral, engine unknown" (the canonical fallback
 * identity) while keeping the data-format raw markdown so retrieval
 * pipelines can still parse it without UTM noise – `shouldTagPath()`
 * skips any URL whose path ends in `.md`, `.txt`, `.json`, etc., so
 * the corpus's own self-references stay clean.
 */
const TAGGED_LLMS_FULL_BODY = tagBodyLinks(LLMS_FULL_BODY, "ai-search", {
  medium: "llms-txt",
  campaign: "llms_corpus",
  content: "llms-full",
});

/**
 * /llms-full.txt — full playbook-readable corpus.
 *
 * Companion to /llms.txt (which is the curated index). This route returns
 * every public marketing surface concatenated into one markdown file, with
 * canonical URLs preserved in each section header so citation chains land
 * on the HTML page, not on this concatenation.
 *
 * Built once at module load (server-hoist-static-io) and served with an
 * aggressive edge cache — the inputs are entity.ts, alternatives.ts, and
 * faqs.ts, all of which change on strategy-doc cadence (rarely), so this
 * is safe to cache for a day at the edge and stale-while-revalidate a
 * week. A redeploy busts the cache via the build-id-keyed cache key.
 *
 * llmstxt.org names this surface explicitly:
 *   "Sites can optionally provide /llms-full.txt — a concatenation of all
 *    documentation in markdown."
 *
 * Brunson Hard-Rule reconciliation: every claim in LLMS_FULL_BODY is also
 * present verbatim in the HTML the body was generated from. No exclusive
 * content. See src/lib/seo/markdown.ts header for the full reasoning.
 */
export function GET() {
  return new NextResponse(TAGGED_LLMS_FULL_BODY, {
    status: 200,
    headers: {
      // Markdown content-type so retrieval pipelines treat the body as text
      // rather than guessing from extension. `charset=utf-8` is necessary
      // because the corpus contains curly quotes and em-dashes.
      "content-type": "text/markdown; charset=utf-8",
      "cache-control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      // Tells Google + AI crawlers the canonical URL is the index, not this
      // file — citation chains should land on the homepage, not /llms-full.txt.
      link: '<https://unlocksaas.com/>; rel="canonical"',
      // Same policy signal as /llms.txt: public search/retrieval/citation
      // is allowed with attribution; model-weight training and third-party
      // training-dataset redistribution are denied.
      "training-data-attribution": LLMS_TXT_TRAINING_DATA_ATTRIBUTION,
    },
  });
}

// Static — no per-request inputs. Cache Components handles static rendering
// via the `'use cache'` directive in the payload builder above.
