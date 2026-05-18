/**
 * Google Search Console – Search Analytics query client.
 *
 * Why this module exists
 * ----------------------
 * Surface 13 (CRO instrumentation feeding SEO) gap closure: pull the
 * (query, page, country, device) rows GSC has on UnlockSaaS so the same
 * PostHog dashboard the funnel runs on can split conversion by the
 * search term that landed the visitor.
 *
 * One endpoint, one method. We deliberately do not wrap the broader
 * Search Console API surface (sitemaps, URL inspection, etc.) because
 * those calls have their own auth/rate-limit semantics and we never
 * need them from a cron.
 *
 * Brunson Hard-Rule reconciliation: every row this client emits is real
 * data Google attributed to unlocksaas.com. No fabricated queries, no
 * synthetic positions, no padded impression counts.
 *
 * Caching
 * -------
 * No caching at this layer. The caller (the cron) is the source of
 * truth for the freshness contract: one pull per day. Caching would
 * mask the most useful operator signal – the cron tick that returned
 * zero rows when something upstream broke.
 *
 * Env contract
 * ------------
 *   GSC_SITE_URL                       Required. e.g. `sc-domain:unlocksaas.com`
 *                                      OR the URL-prefix `https://unlocksaas.com/`.
 *   GSC_SERVICE_ACCOUNT_EMAIL          Required (see jwt.ts).
 *   GSC_SERVICE_ACCOUNT_PRIVATE_KEY    Required (see jwt.ts).
 *
 * Activation steps for the operator are documented inline in
 * .env.example. The cron route 503s cleanly when any of the three are
 * unset.
 */

import { getAccessToken, readServiceAccount } from "./jwt";

const SEARCH_ANALYTICS_BASE = "https://searchconsole.googleapis.com/v1";

/**
 * Single row of search-analytics data, normalised to the shape PostHog
 * ultimately stores (snake_case for dashboard consistency).
 */
export interface SearchAnalyticsRow {
  query: string;
  page: string;
  country?: string;
  device?: "DESKTOP" | "MOBILE" | "TABLET";
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

/**
 * Read the configured GSC site URL. Returns null when unset.
 *
 * The site URL is one of two shapes:
 *   - `sc-domain:unlocksaas.com`   (domain property, includes every subdomain)
 *   - `https://unlocksaas.com/`    (URL-prefix property, exact host + path)
 *
 * Both are valid; the operator picks one when verifying the site in
 * GSC. We accept either – the API doesn't care.
 */
export function readGscSiteUrl(): string | null {
  const raw = process.env.GSC_SITE_URL?.trim();
  if (!raw) return null;
  if (raw.startsWith("sc-domain:") || raw.startsWith("https://")) return raw;
  return null;
}

/**
 * Composite env-readiness check. Returns null when any required value
 * is missing or malformed; returns the resolved config otherwise.
 *
 * The cron route maps null → 503 with a structured "gsc_not_configured"
 * body, so the operator sees the exact reason in the Vercel cron
 * dashboard.
 */
export function readGscConfig(): {
  siteUrl: string;
  account: NonNullable<ReturnType<typeof readServiceAccount>>;
} | null {
  const siteUrl = readGscSiteUrl();
  if (!siteUrl) return null;
  const account = readServiceAccount();
  if (!account) return null;
  return { siteUrl, account };
}

interface RawSearchAnalyticsResponse {
  rows?: Array<{
    keys?: string[];
    clicks?: number;
    impressions?: number;
    ctr?: number;
    position?: number;
  }>;
}

/**
 * Search Analytics query – `searchAnalytics.query`. One call returns up
 * to `rowLimit` rows for the (startDate, endDate) window, broken down
 * by the requested `dimensions`.
 *
 * Returns the normalised rows or throws on API error.
 */
export async function querySearchAnalytics(opts: {
  startDate: string; // ISO YYYY-MM-DD inclusive
  endDate: string; // ISO YYYY-MM-DD inclusive
  rowLimit?: number;
}): Promise<SearchAnalyticsRow[]> {
  const config = readGscConfig();
  if (!config) {
    throw new Error("gsc_not_configured");
  }
  const accessToken = await getAccessToken(config.account);
  // Path component must be URL-encoded so colons in `sc-domain:...`
  // survive the round-trip.
  const sitePath = encodeURIComponent(config.siteUrl);
  const endpoint = `${SEARCH_ANALYTICS_BASE}/sites/${sitePath}/searchAnalytics/query`;

  // Dimensions: query + page + country + device gives the four-way
  // breakdown the dashboard wants. The API caps row count at 25_000 per
  // call. We default to 1000 (more than enough for an indie SaaS) and
  // let the caller override.
  const body = {
    startDate: opts.startDate,
    endDate: opts.endDate,
    dimensions: ["query", "page", "country", "device"],
    rowLimit: opts.rowLimit ?? 1000,
    // `dataState: "all"` includes fresh (uncanonical) data so the
    // dashboard reflects today's signal, not just three-day-stale rows.
    dataState: "all",
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json; charset=utf-8",
      accept: "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(
      `gsc_query_failed status=${res.status} body=${errBody.slice(0, 500)}`,
    );
  }

  const payload = (await res.json()) as RawSearchAnalyticsResponse;
  const rawRows = payload.rows ?? [];
  return rawRows.map(normaliseRow);
}

/**
 * Convert a raw GSC row (loose keys array, optional fields) into the
 * typed shape PostHog and the rest of the pipeline expect.
 *
 * `keys` ordering matches the `dimensions` order we sent in the request
 * body – relying on that invariant is safe because the API contract
 * guarantees it.
 */
function normaliseRow(raw: {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
}): SearchAnalyticsRow {
  const [query = "", page = "", country, device] = raw.keys ?? [];
  return {
    query,
    page,
    country: country?.toLowerCase() || undefined,
    device: normaliseDevice(device),
    clicks: raw.clicks ?? 0,
    impressions: raw.impressions ?? 0,
    ctr: raw.ctr ?? 0,
    position: raw.position ?? 0,
  };
}

function normaliseDevice(value?: string): SearchAnalyticsRow["device"] {
  if (value === "DESKTOP" || value === "MOBILE" || value === "TABLET") {
    return value;
  }
  return undefined;
}

/**
 * Build the (startDate, endDate) window for "yesterday in UTC".
 *
 * Why yesterday: GSC's data is typically lagged 1–3 days. Pulling
 * yesterday-by-yesterday gives a stable cadence (each day's row is
 * pulled exactly once, on the next UTC day) without re-pulling the
 * same data and inflating the dashboard.
 */
export function yesterdayUtc(now: Date = new Date()): {
  startDate: string;
  endDate: string;
} {
  const utc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  utc.setUTCDate(utc.getUTCDate() - 1);
  const iso = utc.toISOString().slice(0, 10);
  return { startDate: iso, endDate: iso };
}
