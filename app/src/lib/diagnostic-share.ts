/**
 * Public-diagnosis share-page data helpers.
 *
 * One shape used by both the route page and the OG image. Loads a single
 * diagnostic_leads row by id, but ONLY returns it when share_visibility is
 * 'public'. Anything else (private | revoked | row-not-found | invalid id)
 * returns null — the page returns 404.
 *
 * No email, no IP, no user_agent ever flows out of this helper. The
 * shareable surface carries only the URL hostname, the label, the public
 * one-paragraph diagnosis explanation, the evidence sentence, the
 * created-at date, and the bucket tag.
 */

import type { SupabaseClient } from "@/lib/supabase/types";
import type { Bucket, DiagnosticLabel } from "@/lib/diagnostic";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidLeadId(s: string | undefined | null): s is string {
  return typeof s === "string" && UUID_RE.test(s);
}

export type PublicDiagnosis = {
  id: string;
  /** Hostname only — never the full URL with query strings. */
  hostname: string;
  /** Full URL — used as a backref link from the share page to the live product. */
  productUrl: string;
  label: DiagnosticLabel;
  /** Reluctant-Hero short title returned by the classifier. */
  headline: string;
  /** ~100-word explanation. */
  explanation: string;
  /** One sentence quoting / paraphrasing the page. May be null on legacy rows. */
  evidence: string | null;
  bucket: Bucket | null;
  sharedAt: Date;
  createdAt: Date;
};

type PublicRow = {
  id: string;
  product_url: string;
  label: string;
  headline: string | null;
  explanation: string;
  evidence: string | null;
  bucket: string | null;
  share_visibility: string;
  shared_at: string | null;
  created_at: string;
};

/**
 * Load a public diagnosis by id, or null when it should 404.
 */
export async function loadPublicDiagnosis(
  client: SupabaseClient,
  id: string,
): Promise<PublicDiagnosis | null> {
  if (!isValidLeadId(id)) return null;

  const { data, error } = await client
    .from("diagnostic_leads")
    .select(
      "id, product_url, label, headline, explanation, evidence, bucket, share_visibility, shared_at, created_at",
    )
    .eq("id", id)
    .eq("share_visibility", "public")
    .maybeSingle();

  if (error) {
    console.error("[diagnostic-share] read failed", error);
    return null;
  }
  if (!data) return null;

  const row = data as PublicRow;

  // Defence in depth — the .eq filter above already restricts, but if the
  // index path returns a stale row we'd rather 404 than leak.
  if (row.share_visibility !== "public") return null;

  // 'error' label never goes public. The engine failure path doesn't have
  // shareable copy, and showing an empty/error card would damage the bait
  // brand.
  if (
    row.label !== "wrong_person" &&
    row.label !== "weak_offer" &&
    row.label !== "weak_belief"
  ) {
    return null;
  }

  return {
    id: row.id,
    hostname: safeHost(row.product_url),
    productUrl: row.product_url,
    label: row.label as DiagnosticLabel,
    headline: row.headline?.trim() || "Diagnosis",
    explanation: row.explanation,
    evidence: row.evidence,
    bucket: (row.bucket as Bucket | null) ?? null,
    sharedAt: row.shared_at ? new Date(row.shared_at) : new Date(row.created_at),
    createdAt: new Date(row.created_at),
  };
}

/**
 * Count of currently-public diagnoses. Used by the squeeze's honest empty-
 * state social-proof line ("X founders made their diagnosis public").
 *
 * Brunson rule (mirrors media-bar + avatar-wall): the counter renders only
 * at >= MIN_PUBLIC_COUNT. Below that, the surface returns null and the
 * caller renders the honest empty-state instead.
 */
export const MIN_PUBLIC_COUNT_FOR_SOCIAL_PROOF = 10;

export async function countPublicDiagnoses(
  client: SupabaseClient,
): Promise<number> {
  const { count, error } = await client
    .from("diagnostic_leads")
    .select("id", { count: "exact", head: true })
    .eq("share_visibility", "public");
  if (error) {
    console.error("[diagnostic-share] count failed", error);
    return 0;
  }
  return count ?? 0;
}

export const LABEL_PUBLIC_NAME: Record<DiagnosticLabel, string> = {
  wrong_person: "Wrong Person",
  weak_offer: "Weak Offer",
  weak_belief: "Weak Belief",
};

function safeHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./i, "");
  } catch {
    return url;
  }
}
