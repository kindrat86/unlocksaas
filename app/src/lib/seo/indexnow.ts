/**
 * IndexNow client — submit URL changes to Bing / Yandex / Naver / Seznam / Yep
 * via the joint api.indexnow.org push-notification protocol.
 *
 * Closes the SEO audit deduction "no IndexNow ping on deploy" (see
 * build-log.md entry for crawlability §9). Without IndexNow, AI Overview
 * surfaces on Bing Copilot, Yandex AI Answers, and Yep wait on each
 * engine's polling cadence (24–72h) to discover a new page. With it, the
 * same page is in the index within minutes.
 *
 * Two callers:
 *   1. /api/webhooks/vercel/deployment — fires on every successful
 *      production deploy, signed by Vercel with VERCEL_WEBHOOK_SECRET.
 *      Primary trigger. One ping per deploy.
 *   2. /api/cron/indexnow — weekly belt-and-suspenders cron, in case a
 *      webhook was silently dropped or an engine evicted a URL between
 *      deploys.
 *
 * Brunson Hard-Rule reconciliation: this client submits ONLY URLs that
 * appear in /sitemap.xml — the same canonical list crawlers consume. It
 * cannot leak private surfaces because it reads from the sitemap function
 * directly, which already excludes /playbook/*, /diagnostic/result, the
 * /builder/* OG routes, the /api/* surface, and the auth flow.
 *
 * Key file:
 *   The IndexNow protocol requires a publicly-fetchable key file at a
 *   stable path the engines can hit to confirm ownership. That route is
 *   at src/app/indexnow.txt/route.ts and serves INDEXNOW_KEY verbatim.
 *
 * Spec: https://www.indexnow.org/documentation
 */

import sitemap from "@/app/sitemap";
import { BASE_URL } from "@/lib/seo/entity";

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/IndexNow";
const SITE_HOST = "unlocksaas.com";
const KEY_LOCATION = `${BASE_URL}/indexnow.txt`;

/**
 * IndexNow protocol caps a single POST at 10,000 URLs. UnlockSaaS is at
 * ~95 URLs today; batching is correct so the cap never surprises us when
 * pSEO grows past 10k.
 */
const SUBMIT_BATCH_SIZE = 10_000;

/**
 * Per IndexNow spec: 8–128 chars, [A-Za-z0-9-]. Mirrors the validator
 * in src/app/indexnow.txt/route.ts so the local check and the engine's
 * check agree. If the route serves a malformed key, the engines blocklist
 * the domain — both sides must reject locally before that happens.
 */
const KEY_PATTERN = /^[A-Za-z0-9-]{8,128}$/;

export type IndexNowResult = {
  /** True iff every batch was accepted (HTTP 200 or 202). */
  ok: boolean;
  /** Number of URLs we tried to submit. Zero when skipped. */
  attempted: number;
  /** One entry per batch. Useful in webhook/cron response logs. */
  batches: ReadonlyArray<{
    count: number;
    status: number;
    /** First 280 chars of the engine response. Truncated to stay log-safe. */
    bodyPreview: string;
  }>;
  /**
   * Populated only when we deliberately did not submit (missing key,
   * empty URL list). Distinguishes "couldn't run" from "ran and failed."
   */
  skippedReason?: string;
};

/** Type-narrowing guard. Also used by the key route handler. */
export function isValidIndexNowKey(key: string | undefined): key is string {
  return typeof key === "string" && KEY_PATTERN.test(key);
}

/**
 * Build the list of submittable URLs from the same source as /sitemap.xml.
 *
 * We pull `sitemap()` directly (rather than fetching /sitemap.xml over the
 * network) so this works at request time on Vercel without a self-referential
 * HTTP loop. The sitemap function is a pure server function with no I/O —
 * importing it is cheap.
 *
 * Filter rationale:
 *   - llms.txt and llms-full.txt are intentionally listed in the sitemap
 *     for the AI-retriever discovery convention. They are NOT HTML pages
 *     for Bing/Yandex to index, and submitting them via IndexNow would
 *     waste a slot. Strip them here.
 */
export async function buildIndexNowUrlList(): Promise<readonly string[]> {
  const entries = await sitemap();
  return entries
    .map((e) => e.url)
    .filter(
      (u) => !u.endsWith("/llms.txt") && !u.endsWith("/llms-full.txt")
    );
}

function chunked<T>(arr: readonly T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

/**
 * POST the URL list to api.indexnow.org in batches of up to 10k.
 *
 * Reads INDEXNOW_KEY from env at call time so a key rotation takes effect
 * on the next deploy without a code change. Returns a structured result
 * for the webhook / cron handler to log — never throws on engine 4xx/5xx
 * because the deploy itself succeeded and we don't want to NACK the
 * webhook (Vercel would retry the same payload and re-fire IndexNow).
 */
export async function submitToIndexNow(
  urls: readonly string[]
): Promise<IndexNowResult> {
  const key = process.env.INDEXNOW_KEY?.trim();
  if (!isValidIndexNowKey(key)) {
    return {
      ok: false,
      attempted: 0,
      batches: [],
      skippedReason:
        "INDEXNOW_KEY missing or malformed (8–128 chars, [A-Za-z0-9-]).",
    };
  }
  if (urls.length === 0) {
    return {
      ok: false,
      attempted: 0,
      batches: [],
      skippedReason: "empty URL list — refusing to submit",
    };
  }

  const batches: IndexNowResult["batches"][number][] = [];
  let allOk = true;

  for (const batch of chunked(urls, SUBMIT_BATCH_SIZE)) {
    const payload = {
      host: SITE_HOST,
      key,
      keyLocation: KEY_LOCATION,
      urlList: batch,
    };

    let status = 0;
    let bodyPreview = "";
    try {
      const res = await fetch(INDEXNOW_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "User-Agent": "UnlockSaaS-IndexNow/1.0",
        },
        body: JSON.stringify(payload),
        // One-shot side effect; never cache.
        cache: "no-store",
      });
      status = res.status;
      const text = await res.text();
      bodyPreview = text.slice(0, 280).replace(/\s+/g, " ");
    } catch (err) {
      bodyPreview =
        err instanceof Error ? `fetch threw: ${err.message}` : "fetch threw";
    }

    // IndexNow spec: 200 = accepted (no changes), 202 = accepted (changes
    // detected). Anything else (400, 403, 422, 429, 5xx) is a real failure.
    const ok = status === 200 || status === 202;
    if (!ok) allOk = false;
    batches.push({ count: batch.length, status, bodyPreview });
  }

  return { ok: allOk, attempted: urls.length, batches };
}
