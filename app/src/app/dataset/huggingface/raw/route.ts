/**
 * /dataset/huggingface/raw — canonical Hugging Face Datasets `README.md`.
 *
 * Why this route exists
 * ---------------------
 * Hugging Face Datasets parses the repo's README.md for the YAML
 * frontmatter that drives the Hub UI, the search-facet filters, and
 * the auto-Parquet conversion via Datasets Server. The operator
 * submission flow boils down to:
 *
 *   1. Create the HF dataset repo (huggingface.co/new-dataset).
 *   2. `curl -O https://unlocksaas.com/dataset/huggingface/raw` – saves
 *      as `README.md` thanks to the Content-Disposition header below.
 *   3. Upload the file to the HF repo root (`huggingface-cli upload …`
 *      or the Hub web UI). HF parses the frontmatter immediately.
 *   4. Upload the five per-table CSVs from /dataset/tables/*.csv as
 *      siblings; HF Datasets Server auto-derives Parquet.
 *   5. Set NEXT_PUBLIC_UNLOCKSAAS_HUGGINGFACE_DATASET_URL on Vercel to
 *      the canonical HF repo URL; redeploy. The Dataset JSON-LD on
 *      /dataset now declares the HF cross-listing, and Google Dataset
 *      Search ingests the catalog signal on its next crawl.
 *
 * Brunson Hard-Rule reconciliation: this route only re-serializes
 * `HF_DATASET_CARD_README` from `@/lib/seo/dataset-hf`, which itself
 * reads every claim from the canonical dataset module. The HF card
 * cannot drift from the canonical /dataset landing page – they share
 * one source of truth.
 *
 * Caching: build-time constant; 24h s-maxage, 7d stale-while-revalidate.
 * Mirrors the discipline used by /.well-known/llms.txt and
 * /.well-known/mcp.json (the other static-on-deploy machine surfaces).
 */

import { NextResponse } from "next/server";
import { HF_DATASET_CARD_README } from "@/lib/seo/dataset-hf";
import { BASE_URL } from "@/lib/seo/entity";

export function GET() {
  return new NextResponse(HF_DATASET_CARD_README, {
    status: 200,
    headers: {
      // Hugging Face Datasets and any markdown-aware viewer parse the
      // YAML frontmatter + body when content-type is text/markdown.
      // text/plain would suppress the syntax highlighting in HF's
      // raw-file viewer and confuse some Hub tooling that sniffs by
      // mime type.
      "content-type": "text/markdown; charset=utf-8",
      // curl / wget save the response under the filename declared
      // here. The operator runs `curl -O <url>` and gets `README.md`
      // ready to upload as-is to the HF repo root – no rename step.
      "content-disposition": 'attachment; filename="README.md"',
      // Long edge cache: the card body is regenerated only on deploy,
      // when the catalogs gain or lose rows. 7-day stale-while-revalidate
      // keeps the Hub-side UX warm even during a deploy window.
      "cache-control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      // Anyone fetching this from the HF Hub or a CI pipeline that
      // mirrors the README – open CORS so the canonical version is
      // always reachable. The file is intentionally public.
      "access-control-allow-origin": "*",
      // RFC 5988 Link header that names the landing page as the human-
      // readable companion. Search engines and AI retrievers walk this
      // to anchor the dataset card to its citation surface.
      link: `<${BASE_URL}/dataset>; rel="describedby", <${BASE_URL}/dataset/huggingface>; rel="canonical"`,
    },
  });
}

// Static – no per-request inputs, identical body on every call.
