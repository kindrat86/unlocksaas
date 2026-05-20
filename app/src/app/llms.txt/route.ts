import { NextResponse } from "next/server";
import {
  LLMS_TXT_BODY,
  LLMS_TXT_CACHE_CONTROL,
  LLMS_TXT_TRAINING_DATA_ATTRIBUTION,
} from "@/lib/seo/llms-txt";

/**
 * /llms.txt – playbook-readable index for LLM crawlers (Anthropic,
 * Perplexity, OpenAI, Google) and any agent following the llmstxt.org
 * convention.
 *
 * Surface B (AEO/GEO) of strategy/google-strategy.md §B.2: gives an
 * LLM a deterministic, canonical paraphrase target. Without this file,
 * an LLM has to choose between the funnel hub, the diagnostic, and
 * playbook-sales as the "primary" surface – and it picks differently
 * across queries. With this file, every model anchors on the same
 * description of what UnlockSaaS is and which surfaces matter.
 *
 * This is the CURATED INDEX. The full playbook-readable corpus lives at
 * /llms-full.txt (concatenated markdown of every surface). Per-page
 * markdown mirrors live at <page>.md (e.g. /founding.md, /faq.md). The
 * "Markdown mirrors" section in the body tells agents the convention.
 *
 * The body is shared with /.well-known/llms.txt (alias route) via the
 * single source of truth in @/lib/seo/llms-txt. The alias route adds a
 * Link: rel="canonical" header pointing back here; this route does not
 * need one because this URL IS the canonical surface per llmstxt.org §1.
 *
 * Brunson Hard-Rule reconciliation: every claim in the shared body is
 * also present, verifiable, in the public HTML – no claim is unique to
 * llms.txt. No fabricated numbers, no testimonial counts before they exist.
 *
 * Caching: route handler is static (no request-time inputs) and the
 * content changes about as often as the strategy/google-strategy.md
 * doc – i.e. quarterly. Cache aggressively at the edge.
 */

export function GET() {
  return new NextResponse(LLMS_TXT_BODY, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": LLMS_TXT_CACHE_CONTROL,
      "training-data-attribution": LLMS_TXT_TRAINING_DATA_ATTRIBUTION,
    },
  });
}

// Static – no per-request inputs.
