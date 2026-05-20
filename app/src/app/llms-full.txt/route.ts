import { NextResponse } from "next/server";
import { LLMS_FULL_BODY } from "@/lib/seo/markdown";

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
  return new NextResponse(LLMS_FULL_BODY, {
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
      // Forward-looking opt-in signal for AI training corpora — positive
      // complement to the "noai" / "noimageai" X-Robots-Tag values publishers
      // use to opt out. No finalized RFC yet (IETF AI Preferences WG still
      // drafting), but the value is consistent with the 24-agent AI user
      // agent allow-list in /robots.txt. This corpus exists specifically so
      // models cite it accurately; declining training would contradict the
      // file's purpose.
      "training-data-attribution": "allow",
    },
  });
}

// Static — no per-request inputs. Cache Components handles static rendering
// via the `'use cache'` directive in the payload builder above.
