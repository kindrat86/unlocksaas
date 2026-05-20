/**
 * Verified Builder badge — slug generation, public lookup, share helpers.
 *
 * Why this exists:
 *   The First Paying Customer Verified milestone is the most valuable proof
 *   point UnlockSaaS produces. Per workbook 10 §5 (Funnel Hub butterfly play
 *   #2) every verified founder gets a public, shareable badge at
 *   /builder/<slug>. The slug is the user's pseudonymous public identity —
 *   it must NEVER expose the email or any billing data.
 *
 *   Hard Rule #3 (Stripe is the only proof) and Hard Rule #10 (Verified
 *   Builders identity ships from day one): both converge on this badge.
 *
 *   Refunds DO NOT revoke the badge. The customer was real, even if the
 *   user later left. Visibility is user-controlled (private by default).
 */
import type { SupabaseClient } from "@supabase/supabase-js";

// ── slug ──────────────────────────────────────────────────────────────────────

/**
 * Slug generation: take the email local part, slugify, append a 4-char
 * random suffix if a collision occurs. Result is lowercase, [a-z0-9-], max 32.
 *
 * Pure — caller does the uniqueness check (DB unique index also enforces).
 */
export function deriveSlugCandidate(email: string, suffix?: string): string {
  const local = email.split("@")[0] ?? "builder";
  const base = local
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);

  const safe = base.length >= 3 ? base : `builder-${base}`.slice(0, 24);
  return suffix ? `${safe}-${suffix}` : safe;
}

/** Cryptographically-random 4-char suffix (a-z0-9). */
export function randomSuffix(): string {
  const bytes = new Uint8Array(3);
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes)
    .map((b) => b.toString(36).padStart(2, "0"))
    .join("")
    .slice(0, 4);
}

/**
 * Allocate a unique slug for a profile. Tries the email-derived candidate
 * first, then re-tries with random suffix on collision (bounded retries).
 * Service-role client required (writes to profiles).
 */
export async function allocateBuilderSlug(args: {
  adminClient: SupabaseClient;
  profileId: string;
  email: string;
}): Promise<string> {
  const { adminClient, profileId, email } = args;

  // If already allocated, return it.
  const { data: existing } = await adminClient
    .from("profiles")
    .select("builder_slug")
    .eq("id", profileId)
    .maybeSingle();
  if (existing?.builder_slug) return existing.builder_slug as string;

  for (let attempt = 0; attempt < 8; attempt++) {
    const candidate =
      attempt === 0
        ? deriveSlugCandidate(email)
        : deriveSlugCandidate(email, randomSuffix());

    const { error } = await adminClient
      .from("profiles")
      .update({ builder_slug: candidate })
      .eq("id", profileId);

    // 23505 = unique_violation → collision, try again with a suffix.
    if (!error) return candidate;
    if ((error as { code?: string }).code !== "23505") {
      throw new Error(`allocateBuilderSlug: ${error.message}`);
    }
  }

  throw new Error("allocateBuilderSlug: exhausted suffix retries");
}

// ── public badge ──────────────────────────────────────────────────────────────

export interface PublicBadge {
  id: string;
  slug: string;
  builderName: string;
  productName: string | null;
  productUrl: string | null;
  firstCustomerAt: Date;
  /**
   * Founding-cohort serial number. 1-indexed, assigned by ascending
   * `first_customer_at` order – the founder whose first paying customer
   * verified earliest gets `#001`, the second earliest `#002`, and so on.
   *
   * Brunson identity hook (DotCom Secrets Secret #2 – assign identity).
   * Stable per builder because `first_customer_at` is a Stripe-attested
   * past timestamp that cannot move once recorded.
   *
   * Optional because not every caller needs it – the funnel-hub avatar
   * wall and the AggregateRating count both pass through this struct
   * without caring about ordinal position. Callers that DO render the
   * serial (the public /builders directory, the /builder/[slug] page)
   * compute it explicitly via `loadVerifiedBuilders` (which attaches
   * serials in one pass) or `loadPublicBadgeSerial` (single-slug lookup).
   */
  serial?: number;
}

/**
 * The serial range that carries the founding-cohort identity badge.
 *
 * Serials #001 through #FOUNDING_COHORT_SERIAL_CAP are surfaced with the
 * "Founding Cohort" eyebrow on the public badge page. Above the cap, the
 * serial still ships (every builder has one) but the founding-cohort
 * status hook drops off – by design. Scarcity is the offer; capping at
 * 10 keeps the identity meaningful when row 50 lands.
 *
 * Mirrors the FOUNDING_COHORT_CAP constant inside @/lib/founding/cohort
 * (50-seat $49 evergreen cohort) but is intentionally a smaller number.
 * These are two different scarcity mechanics:
 *   – founding/cohort caps the BUYER pool at 50.
 *   – this caps the BUILDER identity hook at 10.
 *
 * Reluctant Hero voice: nothing magical about 10. It's a round number
 * that's small enough to mean something and large enough to be reachable.
 */
export const FOUNDING_COHORT_SERIAL_CAP = 10 as const;

/**
 * Pad a serial number to a three-digit zero-prefixed string (#001, #042).
 * One source of truth for every surface that renders the serial – the
 * /builders directory, /builder/[slug] page, badge.svg, embed.html,
 * oembed.json, Review JSON-LD payload.
 */
export function formatSerial(serial: number): string {
  return `#${serial.toString().padStart(3, "0")}`;
}

/**
 * Compute the founding-cohort serial for a given Stripe-verified
 * `first_customer_at` timestamp. The serial is `(strictly-earlier rows) + 1`,
 * so the earliest verified builder gets `#001`. Stable per builder because
 * `first_customer_at` does not move once recorded.
 *
 * Returns `null` on error or when the row is not yet public – callers
 * MUST suppress the serial UI in that case rather than render `#NaN` or
 * `#000`.
 *
 * Caller passes either anon or admin client; both can read the
 * `builder_badges` view. The query uses `count: "exact", head: true` so
 * the wire response is a single integer in the `content-range` header
 * (no row payload allocation).
 */
export async function loadPublicBadgeSerial(
  client: SupabaseClient,
  firstCustomerAt: Date | string,
): Promise<number | null> {
  const iso =
    typeof firstCustomerAt === "string"
      ? firstCustomerAt
      : firstCustomerAt.toISOString();

  const { count, error } = await client
    .from("builder_badges")
    .select("id", { count: "exact", head: true })
    .lt("first_customer_at", iso);

  if (error || typeof count !== "number") return null;
  return count + 1;
}

/**
 * Read the public badge for a slug. Returns null if no public badge exists.
 * Uses a regular (anon-key) client since the `builder_badges` view is granted
 * to anon — RLS is enforced inside the view (only `share_visibility=public`).
 *
 * Caller passes either a server-side anon client or admin client; both work.
 *
 * `serial` is NOT populated here – that requires a second round-trip and
 * not every caller needs it. The /builder/[slug] page resolves it
 * separately via `loadPublicBadgeSerial`; the AggregateRating count
 * pipeline does not need a serial at all.
 */
export async function loadPublicBadge(
  client: SupabaseClient,
  slug: string
): Promise<PublicBadge | null> {
  if (!slug || slug.length > 64) return null;

  const { data, error } = await client
    .from("builder_badges")
    .select("id,builder_slug,builder_name,product_name,product_url,first_customer_at")
    .eq("builder_slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  if (!data.first_customer_at) return null;

  return {
    id: data.id as string,
    slug: data.builder_slug as string,
    builderName: (data.builder_name as string | null) ?? "Verified Builder",
    productName: (data.product_name as string | null) ?? null,
    productUrl: (data.product_url as string | null) ?? null,
    firstCustomerAt: new Date(data.first_customer_at as string),
  };
}

/**
 * Count of public, Stripe-verified builders.
 *
 * Powers the AggregateRating sub-graph on the Playbook SoftwareApplication
 * block. Calls the `builder_badges` view in head-only mode (`count=exact`),
 * so the wire response is a single integer in the `content-range` header —
 * no row payload, no per-row allocation.
 *
 * Brunson Hard-Rule reconciliation: the same view that powers the public
 * /builders avatar wall, /builder/<slug> public badges, and the embed kit
 * is what powers this count. Three surfaces, one source of truth — the
 * number an LLM extracts from the AggregateRating schema is the SAME
 * number a human counts on /builders.
 *
 * Returns 0 on error or empty. Callers (the Playbook SoftwareApplication
 * schema in particular) MUST use that 0 to omit the AggregateRating node
 * entirely — never emit a "5.0 from 0 reviews" fabrication.
 */
export async function loadPublicBadgeCount(
  client: SupabaseClient
): Promise<number> {
  const { count, error } = await client
    .from("builder_badges")
    .select("id", { count: "exact", head: true });

  if (error || typeof count !== "number") return 0;
  return Math.max(0, count);
}

/**
 * Load up to `limit` public verified builders, ordered most-recent-first.
 *
 * Powers the Brunson Funnel Hacker's Cookbook Swipe 6 — the avatar wall
 * of real, named users on the funnel hub. Reads from the `builder_badges`
 * view, which already filters out private profiles and missing
 * first-customer timestamps via the view definition.
 *
 * Returns an empty array on error or no rows. Callers (avatar-wall block)
 * are responsible for the "≥9 to render" gate.
 *
 * Caller passes either a server-side anon client or admin client; both
 * work. The view is granted to anon and authenticated.
 */
export async function loadVerifiedBuilders(
  client: SupabaseClient,
  limit = 9
): Promise<PublicBadge[]> {
  const { data, error } = await client
    .from("builder_badges")
    .select("id,builder_slug,builder_name,product_name,product_url,first_customer_at")
    .order("first_customer_at", { ascending: false })
    .limit(Math.max(0, Math.min(limit, 50)));

  if (error || !data) return [];

  // Total count is needed to compute serials. We fetched at most `limit` rows
  // in DESC order; the first row (index 0) has the highest serial (total),
  // the last row in the returned page has serial = total - (page_size - 1).
  // One extra round-trip; cheap at the row counts this surface ever sees.
  const { count: totalRaw } = await client
    .from("builder_badges")
    .select("id", { count: "exact", head: true });
  const total =
    typeof totalRaw === "number" && totalRaw > 0 ? totalRaw : data.length;

  const cleaned = data.filter(
    (row) => Boolean(row.builder_slug) && Boolean(row.first_customer_at),
  );

  return cleaned.map((row, i) => ({
    id: row.id as string,
    slug: row.builder_slug as string,
    builderName: (row.builder_name as string | null) ?? "Verified Builder",
    productName: (row.product_name as string | null) ?? null,
    productUrl: (row.product_url as string | null) ?? null,
    firstCustomerAt: new Date(row.first_customer_at as string),
    // i=0 is the latest verified row in the returned slice, so its serial
    // is `total`; i=cleaned.length-1 is the earliest in the slice, with
    // serial `total - (cleaned.length - 1)`. Brunson Hard-Rule: serial
    // derives from real, Stripe-attested timestamps. No reordering, no
    // founder-curated rankings.
    serial: total - i,
  }));
}

// ── share intent URLs ─────────────────────────────────────────────────────────

const VOICE = "Reluctant Hero" as const;
void VOICE; // doc-only; kept so future copy edits remember the constraint.

/**
 * The standard share copy. One line. Reluctant Hero voice — no marketing
 * gloss, no hashtags-by-default, no emoji. The founder is sharing a fact.
 *
 * The badge URL is the proof; the copy points at it.
 */
export function shareCaption(args: {
  productName: string | null;
  badgeUrl: string;
}): string {
  const product = args.productName?.trim() || "the product I built";
  return [
    `${product} just got its first paying customer. Verified by Stripe.`,
    args.badgeUrl,
  ].join("\n\n");
}

export function shareIntents(args: {
  productName: string | null;
  badgeUrl: string;
}): {
  x: string;
  linkedin: string;
  reddit: string;
  caption: string;
} {
  const caption = shareCaption(args);
  const encoded = encodeURIComponent(caption);
  const encodedUrl = encodeURIComponent(args.badgeUrl);
  const encodedTitle = encodeURIComponent(
    `${args.productName?.trim() || "Built a thing"} — first paying customer verified by Stripe`
  );
  return {
    x: `https://twitter.com/intent/tweet?text=${encoded}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    reddit: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
    caption,
  };
}

// ── absolute URL helper ───────────────────────────────────────────────────────

/**
 * Build absolute badge URL. Reads NEXT_PUBLIC_APP_URL (production) and falls
 * back to VERCEL_URL (preview deploys) and finally http://localhost:3000.
 */
export function absoluteBadgeUrl(slug: string): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (explicit) return `${explicit}/builder/${slug}`;

  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}/builder/${slug}`;

  return `http://localhost:3000/builder/${slug}`;
}
