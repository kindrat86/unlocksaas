/**
 * /dataset/zenodo/raw – canonical Zenodo Deposition API metadata JSON.
 *
 * Why this route exists
 * ---------------------
 * Zenodo's submission flow is API-driven (no web-UI metadata form
 * needed). The operator CLI at scripts/mint-zenodo-deposit.py fetches
 * this JSON, wraps it in the Zenodo API envelope, and POSTs to
 * https://zenodo.org/api/deposit/depositions to create the deposit.
 * The resulting deposit ID + bucket URL are used to upload the dataset
 * files, then the deposit is published and Zenodo mints a persistent
 * DOI.
 *
 * Serving the payload at a stable URL with the right Content-Disposition
 * means the operator workflow is:
 *
 *   1. curl -O https://unlocksaas.com/dataset/zenodo/raw → lands as
 *      zenodo-deposition.json.
 *   2. Inspect the file with `jq` if desired.
 *   3. Run scripts/mint-zenodo-deposit.py – which POSTs this exact
 *      payload to Zenodo's API and uploads the per-table CSVs.
 *
 * Brunson Hard-Rule reconciliation: the JSON body is built once at
 * module load from the canonical dataset constants. The Zenodo deposit
 * cannot drift from the canonical /dataset surface – they share one
 * source of truth (see ZENODO_DEPOSITION_METADATA in dataset-zenodo.ts).
 *
 * Caching: build-time constant; 24h s-maxage, 7d stale-while-revalidate.
 * Mirrors the discipline of /dataset/huggingface/raw and the other
 * static-on-deploy machine surfaces.
 */

import { NextResponse } from "next/server";
import { ZENODO_DEPOSITION_METADATA_JSON } from "@/lib/seo/dataset-zenodo";
import { BASE_URL } from "@/lib/seo/entity";

export function GET() {
  return new NextResponse(ZENODO_DEPOSITION_METADATA_JSON, {
    status: 200,
    headers: {
      // Zenodo's API consumes application/json; serving the file under
      // that content-type means a curl downloader's `Accept: application/json`
      // request lands without negotiation. JSON inspectors in browsers
      // also render it nicely.
      "content-type": "application/json; charset=utf-8",
      // The CLI does `curl -O <url>` and gets `zenodo-deposition.json`
      // ready to inspect or pipe into the Zenodo API call.
      "content-disposition":
        'attachment; filename="zenodo-deposition.json"',
      // Long edge cache: the payload is regenerated only on deploy,
      // when the catalogs gain or lose rows. 7-day stale-while-revalidate
      // keeps the Zenodo-side workflow warm even during a deploy window.
      "cache-control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      // Open CORS – the file is intentionally public; a CI pipeline
      // that mirrors the canonical Zenodo payload (e.g. for a re-deposit
      // of a versioned bump) can fetch it from anywhere.
      "access-control-allow-origin": "*",
      // RFC 5988 Link headers anchor this artifact to the human-
      // readable submission flow page (the canonical) and the dataset
      // landing (the describedby). Crawlers walking these links surface
      // the artifact in the right context.
      link: [
        `<${BASE_URL}/dataset/zenodo>; rel="canonical"`,
        `<${BASE_URL}/dataset>; rel="describedby"`,
      ].join(", "),
    },
  });
}

// Static – no per-request inputs, identical body on every call.
