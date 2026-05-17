/**
 * IndexNow client.
 *
 * IndexNow is the open protocol Bing, Yandex, Naver, Seznam.cz, and (since
 * 2024) several long-tail search engines use to accept push notifications
 * about URL changes. Submitting a URL via IndexNow typically results in
 * crawl-within-minutes on Bing and crawl-within-an-hour on Yandex, versus
 * crawl-on-Bing-discovery-cadence (days) without it.
 *
 * Why this matters for UnlockSaaS:
 *   - The pSEO catalogs auto-extend on every deploy. A new entry in
 *     /lib/funnel-teardowns.ts adds a new /funnel-teardown/<slug> page,
 *     a new entry on the hub, and a new cross-link from any matching
 *     /category/* page. Without IndexNow, that page sits idle for days
 *     before Bing or Yandex find it. With IndexNow, it lands in the
 *     index within minutes.
 *   - Bing AI Copilot answers are powered by the Bing index. Yandex.AI
 *     uses the Yandex index. Faster Bing/Yandex indexing = faster AI
 *     Overview surface on those answer engines.
 *   - Google does NOT support IndexNow. That is fine; Google has
 *     Googlebot-Discovery + the sitemap, which already covers us.
 *
 * Operator activation:
 *   1. Generate a 32-character hex key.
 *   2. Push it to Vercel:
 *        vercel env add INDEXNOW_KEY production
 *        vercel env add INDEXNOW_KEY preview
 *   3. Verify the key file is reachable:
 *        curl https://unlocksaas.com/.well-known/indexnow-key.txt
 *   4. (Optional) wire a Vercel Deploy Hook that POSTs to
 *      https://unlocksaas.com/api/indexnow on every production deploy.
 *
 * Until INDEXNOW_KEY is set, the key file route returns 404 and the
 * /api/indexnow route returns 503 — honest, no fabricated key, no
 * leaky default value.
 *
 * Brunson Hard-Rule reconciliation: we only submit URLs the live
 * sitemap already lists. No phantom URLs, no expired surfaces.
 */

/**
 * Endpoints the protocol defines. We submit to multiple in parallel because
 * each search engine maintains its own index — submitting to api.indexnow.org
 * alone *should* propagate to all members, but in practice some members are
 * slower to mirror, and the explicit submissions hedge against that.
 */
export const INDEXNOW_ENDPOINTS = Object.freeze([
  "https://api.indexnow.org/IndexNow",
  "https://www.bing.com/IndexNow",
  "https://yandex.com/indexnow",
] as const);

export interface IndexNowSubmissionResult {
  endpoint: string;
  ok: boolean;
  status: number;
  bodySnippet?: string;
}

/**
 * Resolve the IndexNow key from env at call time. Returns undefined if not
 * set – callers must treat this as "feature disabled."
 *
 * The key is sensitive-ish: it identifies our origin to the search engines
 * and (if leaked) lets someone submit our URLs on our behalf. That is a
 * low-impact attack (the worst case is the attacker forces us to re-crawl
 * pages we already wanted re-crawled) but we still don't log it.
 */
export function readIndexNowKey(): string | undefined {
  const raw = process.env.INDEXNOW_KEY?.trim();
  if (!raw) return undefined;
  // IndexNow requires keys to be 8–128 chars, hex-like. We don't validate
  // strictly – we just refuse obvious garbage like single-character keys
  // that would be rejected upstream anyway.
  if (raw.length < 8 || raw.length > 128) return undefined;
  // Allow letters/numbers/dashes/underscores. The spec permits a-z, A-Z, 0-9, -.
  if (!/^[A-Za-z0-9_-]+$/.test(raw)) return undefined;
  return raw;
}

/**
 * Where the key-validation file lives. Matches the canonical route handler
 * shipped at app/src/app/indexnow-key/route.ts. Note: NOT under /api/* –
 * robots.txt PRIVATE_DISALLOW blocks /api/* for every crawler including
 * IndexNow-affiliated validators, and some validators respect robots.txt
 * before fetching the keyLocation.
 */
export const INDEXNOW_KEY_LOCATION = "/indexnow-key";

/**
 * Submit a batch of canonical URLs to all known IndexNow endpoints in
 * parallel. Each endpoint accepts up to 10,000 URLs per call; for a
 * launch-scale site this comfortably fits in one round.
 *
 * `urls` must be absolute, https, and share the same host as `host`.
 * Mismatched-host URLs are rejected by the endpoints and we filter them
 * out before submission so a single bad URL doesn't fail the whole batch.
 *
 * `keyLocation` defaults to the canonical /.well-known path; pass a custom
 * URL only for tests or staging where the key file lives elsewhere.
 */
export async function submitToIndexNow(args: {
  host: string;
  key: string;
  urls: readonly string[];
  keyLocation?: string;
  /**
   * Optional timeout per endpoint. IndexNow endpoints generally respond
   * within ~1s on success; bound the call so a slow endpoint doesn't hold
   * up the whole batch. Defaults to 8s.
   */
  timeoutMs?: number;
}): Promise<IndexNowSubmissionResult[]> {
  const { host, key, urls, keyLocation, timeoutMs = 8_000 } = args;

  const filtered = urls.filter((u) => {
    try {
      const parsed = new URL(u);
      return parsed.host === host && parsed.protocol === "https:";
    } catch {
      return false;
    }
  });

  if (filtered.length === 0) {
    return INDEXNOW_ENDPOINTS.map((endpoint) => ({
      endpoint,
      ok: false,
      status: 0,
      bodySnippet: "no valid urls to submit",
    }));
  }

  const body = JSON.stringify({
    host,
    key,
    keyLocation: keyLocation ?? `https://${host}${INDEXNOW_KEY_LOCATION}`,
    urlList: filtered,
  });

  const submissions = INDEXNOW_ENDPOINTS.map(async (endpoint) => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json; charset=utf-8",
          accept: "application/json",
        },
        body,
        signal: ctrl.signal,
        // IndexNow endpoints don't honor caches – disable Next's fetch cache
        // so the same URL list can be re-submitted on a subsequent deploy.
        cache: "no-store",
      });
      const text = await res.text().catch(() => "");
      return {
        endpoint,
        ok: res.ok,
        status: res.status,
        bodySnippet: text.slice(0, 240),
      };
    } catch (err) {
      return {
        endpoint,
        ok: false,
        status: 0,
        bodySnippet:
          err instanceof Error ? err.message.slice(0, 240) : "unknown error",
      };
    } finally {
      clearTimeout(timer);
    }
  });

  return Promise.all(submissions);
}
