import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import {
  buildIndexNowUrlList,
  submitToIndexNow,
} from "@/lib/seo/indexnow";

/**
 * Vercel webhook receiver — fires on deployment.succeeded.
 *
 * Wiring (one-time operator step, see LAUNCH-READINESS.md §IndexNow):
 *   1. Vercel dashboard → Project settings → Webhooks → Create
 *   2. Endpoint URL:  https://unlocksaas.com/api/webhooks/vercel/deployment
 *   3. Events:        deployment.succeeded
 *   4. Copy the signing secret displayed once → push as
 *      VERCEL_WEBHOOK_SECRET to the production env (no preview / dev — the
 *      filter below rejects non-prod targets, so only prod ever needs the
 *      secret).
 *
 * On every successful production deploy this handler:
 *   - Verifies the x-vercel-signature header against VERCEL_WEBHOOK_SECRET
 *     using HMAC-SHA1 (the algorithm Vercel signs webhooks with — see
 *     https://vercel.com/docs/observability/webhooks-overview).
 *   - Filters by payload.payload.target === "production". Preview deploys
 *     must NOT submit URLs that will 404 after the next promote, or the
 *     engines will mark the domain as unreliable.
 *   - Builds the URL list from the same source as /sitemap.xml (the
 *     buildIndexNowUrlList helper imports the sitemap function directly).
 *   - POSTs the list to api.indexnow.org via submitToIndexNow.
 *   - Returns 200 with a structured result for log inspection.
 *
 * Why a webhook instead of a postbuild script:
 *   - postbuild fires DURING build, before promote → IndexNow's verification
 *     crawler could hit URLs that are still 404 in the canary deployment.
 *   - postbuild fires on every preview, not just production → submitting
 *     preview URLs would pollute the engine indices with throwaway URLs.
 *   - postbuild can't differentiate between a successful and a rolled-back
 *     deploy. The webhook fires only AFTER deployment.succeeded, so a
 *     failed deploy or a manual rollback produces no IndexNow ping.
 *
 * Failure semantics:
 *   - Missing secret → 503 (so an unsigned caller can never trigger an
 *     outbound ping by hammering this URL before the secret is pushed).
 *   - Missing signature → 401.
 *   - Signature mismatch → 401.
 *   - Wrong event type or non-prod target → 200 with `skipped: true`. The
 *     webhook delivery still succeeded; Vercel should NOT retry these.
 *   - IndexNow engine 4xx/5xx → 200 with `result.ok: false`. The deploy
 *     itself succeeded and we don't want Vercel to retry the same payload
 *     and re-fire IndexNow — that would spam api.indexnow.org and risk a
 *     rate-limit blocklist.
 */

// Node runtime for crypto.timingSafeEqual + access to process.env.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const VERCEL_SIGNATURE_HEADER = "x-vercel-signature";

/**
 * Vercel signs webhook bodies with HMAC-SHA1 + the project's signing
 * secret. Compare in constant time so the comparison cost doesn't leak the
 * expected prefix.
 */
function verifySignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  const expected = crypto
    .createHmac("sha1", secret)
    .update(rawBody)
    .digest("hex");

  // Both sides are hex strings of equal length, but timingSafeEqual throws
  // on length mismatch — wrap so a malformed header returns false instead
  // of 500.
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "utf-8"),
      Buffer.from(signature, "utf-8")
    );
  } catch {
    return false;
  }
}

type VercelDeploymentPayload = {
  type?: string;
  payload?: {
    target?: string | null;
    deployment?: { id?: string; url?: string };
    project?: { id?: string; name?: string };
  };
};

export async function POST(req: NextRequest) {
  const secret = process.env.VERCEL_WEBHOOK_SECRET;
  if (!secret) {
    console.error(
      "[vercel-webhook] refused: VERCEL_WEBHOOK_SECRET is not configured"
    );
    return NextResponse.json(
      { error: "VERCEL_WEBHOOK_SECRET is not configured" },
      { status: 503 }
    );
  }

  const signature = req.headers.get(VERCEL_SIGNATURE_HEADER);
  if (!signature) {
    return NextResponse.json(
      { error: "missing signature header" },
      { status: 401 }
    );
  }

  // The signature is over the RAW request body — must read text(), not json().
  const rawBody = await req.text();
  if (!verifySignature(rawBody, signature, secret)) {
    console.warn("[vercel-webhook] rejected: signature mismatch");
    return NextResponse.json({ error: "signature mismatch" }, { status: 401 });
  }

  let payload: VercelDeploymentPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "malformed JSON body" }, { status: 400 });
  }

  // Vercel emits a family of deployment.* events (created, building, ready,
  // succeeded, error, canceled). We fire ONLY on succeeded so a failed or
  // canceled deploy produces no IndexNow ping for URLs that may not exist.
  if (payload.type !== "deployment.succeeded") {
    return NextResponse.json({
      skipped: true,
      reason: `event_type=${payload.type ?? "unknown"}`,
    });
  }

  if (payload.payload?.target !== "production") {
    return NextResponse.json({
      skipped: true,
      reason: `target=${payload.payload?.target ?? "null"}`,
    });
  }

  const deploymentId = payload.payload?.deployment?.id ?? "unknown";
  console.log(
    `[vercel-webhook] deployment.succeeded for production deploy ${deploymentId} — submitting to IndexNow`
  );

  const urls = await buildIndexNowUrlList();
  const result = await submitToIndexNow(urls);

  if (!result.ok) {
    // Log the engine response preview but still 200 — Vercel must not
    // retry the webhook (see "Failure semantics" above).
    console.error(
      `[vercel-webhook] IndexNow submission failed (deploy=${deploymentId}, attempted=${result.attempted}, skipped=${result.skippedReason ?? "-"}). Batch statuses:`,
      result.batches.map((b) => `${b.count}→${b.status}`).join(", ")
    );
  } else {
    console.log(
      `[vercel-webhook] IndexNow submission OK (deploy=${deploymentId}, attempted=${result.attempted}, batches=${result.batches.length})`
    );
  }

  return NextResponse.json({
    received: true,
    deploymentId,
    submitted: urls.length,
    result,
  });
}
