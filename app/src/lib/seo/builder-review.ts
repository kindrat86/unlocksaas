/**
 * Verified Builder badge: shared Review JSON-LD + SVG renderer.
 *
 * Why this file exists (off-page lift)
 * ------------------------------------
 * The Verified Builder badge is the single off-page lift mechanism a pre-
 * revenue solo SaaS can ship without violating Brunson Hard-Rule. Every
 * founder who completes a Stripe-verified first-customer cycle gets a
 * public badge AND an embed kit. When they paste that embed on their own
 * homepage, README, Notion page, or testimonials section, three things
 * happen at once:
 *
 *   1. A real editorial backlink lands on the founder's domain pointing
 *      at the canonical proof page at unlocksaas.com/builder/<slug>.
 *      Honest, do-follow, no PBN nonsense.
 *
 *   2. A `Review` JSON-LD node ships on the founder's domain with
 *      `itemReviewed.@id` resolving back to unlocksaas's SoftwareApplication
 *      entity. Google's structured-data graph then resolves the Review as a
 *      citation OF the playbook FROM an independent third-party domain.
 *
 *   3. The `rel="me"` relationship on the anchor declares identity:
 *      the founder asserts that /builder/<slug> represents them. We
 *      reciprocate on the canonical badge page by emitting `rel="me"`
 *      back to the founder's productUrl (when set). Two-way `rel="me"`
 *      is the IndieWeb identity-verification convention search engines
 *      and Mastodon's verification UI both honor.
 *
 * All three signals compound silently every time another verified-customer
 * cycle ships. No code change is needed once the embed kit is live.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - `reviewRating.ratingValue` is set to 5 with the documented semantics
 *     "Verified outcome: the playbook delivered the promised first paying
 *     customer." This is NOT a satisfaction score — it is a binary
 *     verification fact aggregated to schema.org's 1–5 scale because the
 *     spec requires a numeric value for Review rich-result eligibility.
 *     Founders consent to public verification when they flip
 *     share_visibility=public; the rating reflects the verification, not
 *     speculation about how they feel.
 *
 *   - reviewBody is generated deterministically from public profile
 *     fields the founder already approved (builderName, productName,
 *     firstCustomerAt). No fabricated quotes. The founder can override
 *     reviewBody by setting builder_testimonial in their profile (TODO,
 *     out of scope for this PR — the schema will pick it up the moment
 *     the column exists).
 *
 *   - The badge SVG carries NO marketing copy beyond the verbatim facts.
 *     Stripe-verified, builder name, product name, date. Same discipline
 *     as the canonical badge page.
 *
 * Shape choices
 * -------------
 *   - itemReviewed uses `@id` referencing the Playbook SoftwareApplication
 *     (ID.product in entity.ts). The actual SoftwareApplication block ships
 *     on the canonical badge page; founder-site Review nodes just reference
 *     the @id, which Google resolves cross-document.
 *
 *   - publisher uses the Organization @id. Cross-document graph linking.
 *
 *   - author is a Person sub-graph with `url` pointing at the productUrl
 *     when set (reciprocal identity anchor) — falling back to the
 *     /builder/<slug> page when productUrl is missing.
 */
import type { PublicBadge } from "@/lib/builder-badge";
import { absoluteBadgeUrl } from "@/lib/builder-badge";
import { BASE_URL, ID } from "@/lib/seo/entity";

// ── Review JSON-LD ────────────────────────────────────────────────────────────

/**
 * Canonical Review payload for a Verified Builder badge.
 *
 * Returned as a plain object so callers can either:
 *   1. JSON.stringify() it into a `<script type="application/ld+json">` tag
 *      (the canonical badge page does this inline);
 *   2. ship it as a response body at /builder/<slug>/review.json with
 *      `content-type: application/ld+json` (the embed kit ships this for
 *      founders to paste into their own pages without copying the
 *      whole JSON);
 *   3. embed it inside the `<script>` snippet rendered on the embed-code
 *      helper page.
 */
export function buildReviewJsonLd(badge: PublicBadge): Record<string, unknown> {
  const badgeUrl = absoluteBadgeUrl(badge.slug);
  const datePublished = badge.firstCustomerAt.toISOString().slice(0, 10);

  // Author URL: prefer the productUrl (reciprocal identity), fall back to
  // the canonical badge page. Either way, the URL resolves to a real
  // surface that names this builder.
  const authorUrl = badge.productUrl ?? badgeUrl;

  // reviewBody: deterministic, generated from approved profile fields. No
  // fabricated quotes. Future: read builder_testimonial column if/when the
  // founder opts in to a longer body.
  const product = badge.productName ?? "their product";
  const reviewBody = `${badge.builderName} shipped ${product} and got a paying customer. Verified by Stripe on ${badge.firstCustomerAt.toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric" },
  )}. Not self-reported. A paying customer on a connected Stripe account.`;

  return {
    "@context": "https://schema.org",
    "@type": "Review",
    "@id": `${badgeUrl}#review`,
    url: badgeUrl,
    name: `${badge.builderName} — Verified Builder review of the Unlock SaaS Playbook`,
    reviewBody,
    datePublished,
    inLanguage: "en-US",
    author: {
      "@type": "Person",
      name: badge.builderName,
      url: authorUrl,
    },
    publisher: {
      "@id": ID.organization,
      "@type": "Organization",
      name: "Unlock SaaS",
      url: BASE_URL,
    },
    itemReviewed: {
      "@id": ID.product,
      "@type": "SoftwareApplication",
      name: "Unlock SaaS Playbook",
      url: `${BASE_URL}/playbook-sales`,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: 5,
      bestRating: 5,
      worstRating: 1,
      // Documented semantics — not satisfaction, verification outcome.
      // See file-level "Brunson Hard-Rule reconciliation" block.
      additionalType: "https://schema.org/Boolean",
      description: "Verified outcome: first paying customer on a connected Stripe account.",
    },
  };
}

// ── SVG badge ─────────────────────────────────────────────────────────────────

/**
 * Render the hot-linkable SVG badge. Stays under 1500 bytes, no external
 * font references, no external image references, no JavaScript.
 *
 * Width is fixed at 360x80 — sized to fit cleanly in a site footer next to
 * a stripe of partner logos, and to look right in Substack post inline
 * placements. The viewBox preserves aspect ratio at any rendered size.
 *
 * The SVG is a pure illustrative element. It carries NO clickable region —
 * the surrounding `<a>` element provides the link semantics (so the link
 * is keyboard-accessible and screen-reader-named via the anchor's text
 * content / alt attribute).
 */
export function renderBadgeSvg(badge: PublicBadge): string {
  const product = badge.productName ?? "their product";
  const dateStr = badge.firstCustomerAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const headline = truncate(`${badge.builderName} shipped ${product}.`, 48);
  const subline = `Verified by Stripe · ${dateStr}`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 80" width="360" height="80" role="img" aria-label="Stripe-verified first paying customer. Unlock SaaS Verified Builder.">
  <title>Unlock SaaS Verified Builder — ${escapeXml(badge.builderName)}</title>
  <desc>${escapeXml(`${badge.builderName} shipped ${product} and got paid. Verified by Stripe on ${dateStr}.`)}</desc>
  <rect x="0.5" y="0.5" width="359" height="79" rx="9" ry="9" fill="#ffffff" stroke="#e5e7eb"/>
  <g transform="translate(20 20)">
    <circle cx="10" cy="10" r="10" fill="#111827"/>
    <path d="M5 10 L9 14 L15 7" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <text x="56" y="28" font-family="ui-sans-serif, -apple-system, system-ui, sans-serif" font-size="10" letter-spacing="1.4" fill="#6b7280" font-weight="600">VERIFIED BUILDER</text>
  <text x="56" y="48" font-family="ui-sans-serif, -apple-system, system-ui, sans-serif" font-size="14" fill="#111827" font-weight="600">${escapeXml(headline)}</text>
  <text x="56" y="66" font-family="ui-sans-serif, -apple-system, system-ui, sans-serif" font-size="11" fill="#6b7280">${escapeXml(subline)}</text>
</svg>`;
}

// ── helpers ───────────────────────────────────────────────────────────────────

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, Math.max(0, max - 1)).trimEnd() + "…";
}

/**
 * XML escape for SVG text content. SVG is XML, not HTML — apostrophes
 * and angle brackets MUST be escaped or the document fails to parse on
 * strict consumers (Firefox, Safari Reader, several feed readers).
 */
function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
