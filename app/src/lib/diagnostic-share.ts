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

import type { SupabaseClient } from "@supabase/supabase-js";
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

/**
 * Single sharp line of advice per label. Rendered as the dominant typographic
 * beat on the 1200x630 share card and as the body of any future deep-link
 * snippet (Slack unfurl, LinkedIn share intent, plain-text email teaser).
 *
 * Brunson Hard-Rule reconciliation: every line names the SPECIFIC next move
 * for that diagnosis. No generic "fix your funnel" placeholders, no
 * fabricated time claims, no implied promises ("guaranteed to work"). Each
 * line restates Step 1 or Step 2 of the Playbook in twelve words or fewer,
 * which is what the diagnostic engine already pushes the lead toward.
 *
 * If a workbook changes the canonical Step 1 / Step 2 wording, update here
 * AND in @/lib/playbook-steps in the same commit – they are the rendered
 * source the share card promises.
 */
export const LABEL_SHARP_LINE: Record<DiagnosticLabel, string> = {
  wrong_person: "Pin one real customer. Stop selling to a category.",
  weak_offer: "Promise one specific result. Drop the feature list.",
  weak_belief: "Name the belief they do not yet hold. Build it from scratch.",
};

/**
 * Pre-filled tweet/post copy keyed by label. The Brunson "story first, share
 * second" rule: the post says what HAPPENED to the founder, not what
 * UnlockSaaS sold. The card itself carries the brand mark – the post body
 * is the founder's voice.
 *
 * Used by the X share intent on the result page and by the LinkedIn share
 * helper. Twitter caps at 280 chars and the URL eats ~23 of those after
 * t.co wrapping, leaving ~257 for body. Each line below is well under that.
 */
export const LABEL_SHARE_TEXT: Record<DiagnosticLabel, string> = {
  wrong_person:
    "I got Wrong Person on my SaaS. The fix took 2 minutes to find.",
  weak_offer:
    "I got Weak Offer on my SaaS. The fix took 2 minutes to find.",
  weak_belief:
    "I got Weak Belief on my SaaS. The fix took 2 minutes to find.",
};

/**
 * Derive a short, URL-safe attribution slug from a hostname.
 *
 *   "acme.com"           → "acme"
 *   "www.acme.com"       → "acme"
 *   "my-saas.co.uk"      → "my-saas"
 *   "app.staging.acme.io"→ "app"
 *   ""                   → "anon"
 *
 * Used as the `?ref=<slug>` watermark on the share card and as the referral
 * tag on any click that lands back on /diagnostic. The slug is never
 * cryptographically meaningful – it is human-readable attribution that
 * Brunson Hard-Rule respects (no random IDs, no email leakage, just the
 * hostname the founder already chose to share publicly on the diagnosis
 * page).
 *
 * Slugification rules: lowercase, alphanumeric + hyphens only, collapse
 * runs of non-allowed chars to a single hyphen, trim leading/trailing
 * hyphens, hard cap at 32 chars so the watermark fits on the card.
 */
export function refFromHostname(hostname: string | null | undefined): string {
  if (!hostname) return "anon";
  const trimmed = hostname.trim().toLowerCase().replace(/^www\./, "");
  if (!trimmed) return "anon";
  // Take the first label of the hostname ("acme.com" → "acme", "app.staging
  // .acme.io" → "app"). The first label is the most distinctive part for
  // attribution and avoids the TLD ambiguity ("acme.co.uk" vs "acme.com"
  // would otherwise collide on the second-to-last label).
  const firstLabel = trimmed.split(".")[0] ?? trimmed;
  const slug = firstLabel
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32);
  return slug || "anon";
}

/**
 * Canonical attribution-tagged URL for "go run your own diagnostic." The
 * `?ref=` query param is read by the lightweight tracker on /diagnostic and
 * fired into PostHog as a session property, so the share loop attribution
 * survives a cross-origin click (Twitter, LinkedIn) where document.referrer
 * is stripped or unhelpful.
 *
 * Canonical declaration: /diagnostic's metadata already pins
 * `alternates.canonical: "/diagnostic"`, so `?ref=` variants do not dilute
 * the canonical in Google's index. The ref is a pure attribution param.
 */
export function diagnosticRefUrl(base: string, ref: string): string {
  const safeBase = base.replace(/\/+$/, "");
  const safeRef = encodeURIComponent(ref || "anon");
  return `${safeBase}/diagnostic?ref=${safeRef}`;
}

function safeHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./i, "");
  } catch {
    return url;
  }
}
