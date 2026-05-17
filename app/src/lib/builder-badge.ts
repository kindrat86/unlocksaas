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
}

/**
 * Read the public badge for a slug. Returns null if no public badge exists.
 * Uses a regular (anon-key) client since the `builder_badges` view is granted
 * to anon — RLS is enforced inside the view (only `share_visibility=public`).
 *
 * Caller passes either a server-side anon client or admin client; both work.
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

  return data
    .filter(
      (row) => Boolean(row.builder_slug) && Boolean(row.first_customer_at)
    )
    .map((row) => ({
      id: row.id as string,
      slug: row.builder_slug as string,
      builderName: (row.builder_name as string | null) ?? "Verified Builder",
      productName: (row.product_name as string | null) ?? null,
      productUrl: (row.product_url as string | null) ?? null,
      firstCustomerAt: new Date(row.first_customer_at as string),
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
