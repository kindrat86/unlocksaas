/**
 * /partners/[slug] – branded affiliate landing pages.
 *
 * Why this catalog exists
 * -----------------------
 * The /r/<code> route handler in app/r/[code]/route.ts is pure attribution
 * plumbing – it logs a click, sets the unlocksaas_ref cookie, and 302s to
 * /diagnostic. There is nothing on it a partner can link to from their own
 * audience. A partner who is doing the work of recommending Unlock SaaS
 * wants a destination that has THEIR face, THEIR pitch, THEIR proof,
 * pointing at the offer. The /r/<code> link still does attribution; the
 * /partners/<slug> page is what the partner actually shares.
 *
 * Pairing
 * -------
 *   - /partners              → CollectionPage hub listing every entry
 *   - /partners/<slug>       → ProfilePage + Person + WebPage detail
 *   - /r/<entry.code>        → 302 to /diagnostic with attribution cookie
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - Every entry below corresponds to a real, verifiable human. No
 *     placeholder "Jane Doe" partners. No invented testimonials.
 *   - The `code` field MUST match an active row in the affiliates table
 *     (see supabase/migrations/20260521000000_affiliate_program.sql).
 *     If the affiliate is paused/banned, /r/<code> degrades to a plain
 *     302 to /diagnostic without setting the cookie – the partner page
 *     still loads but stops earning commission, which is the right
 *     behaviour.
 *   - The founder seed (`maryan`) is real because Maryan IS the founder
 *     of Unlock SaaS – verifiable on /about, in lib/seo/entity.ts FOUNDER,
 *     and as the signing address of every transactional email. Founder
 *     entries carry `kind: "founder"` and do not use /r/<code> – they
 *     link straight to /diagnostic with a utm_content=founder tag.
 *
 * Operator runbook for adding a real affiliate
 * --------------------------------------------
 *   1. The affiliate signs up via /affiliate/terms and gets issued a row
 *      in `affiliates` with a unique 8-char `code`.
 *   2. The affiliate sends a headshot (square, 512×512 min, JPG/PNG/WebP)
 *      and confirms their pitch + one verifiable outcome (the diagnostic
 *      step, the customer they unlocked, the date). No testimonials
 *      without a verifiable outcome – Brunson Hard-Rule.
 *   3. Drop the headshot into `app/public/partners/<slug>.jpg`.
 *   4. Append a `PartnerEntry` with `kind: "affiliate"` below. The
 *      `slug` is the partner's chosen public handle (kebab-case). The
 *      `code` is the 8-char string from the affiliates row.
 *   5. Push the change. Next build picks it up; sitemap auto-extends;
 *      the partner gets a permanent, indexable URL to share.
 *   6. Tell the partner. Their share link becomes
 *      https://unlocksaas.com/partners/<slug> – attribution still flows
 *      because the page's primary CTA hits /r/<code>.
 *
 * Empty-state behaviour
 * ---------------------
 * In a fresh deployment the array contains only the founder seed. The
 * hub renders one card + a "Become a featured partner" CTA pointing at
 * /affiliate/terms. This is honest: zero affiliates today, here is how
 * to be first. As Maryan onboards real affiliates and they opt-in to a
 * branded page, the cluster grows organically – one entry per push.
 */

export type PartnerKind = "founder" | "affiliate";

export interface PartnerEntry {
  /** URL slug, kebab-case. Becomes `/partners/<slug>`. */
  slug: string;
  /** Display name, exactly as the partner wants it surfaced. */
  displayName: string;
  /**
   * "founder" or "affiliate". Founder entries skip the /r/<code> CTA and
   * link straight to /diagnostic; affiliate entries route through the
   * tracker.
   */
  kind: PartnerKind;
  /**
   * The 8-char affiliate code matching `affiliates.code` in the DB.
   * Required when `kind === "affiliate"`. Ignored when `kind === "founder"`.
   */
  code?: string;
  /** Public role / one-line bio. ~12 words. */
  headline: string;
  /** ~50 words in the partner's own voice. Why they recommend the offer. */
  pitch: string;
  /**
   * One verifiable outcome. Must be a real fact the founder could defend
   * in a 10-minute interview. Examples: "Shipped my first paying customer
   * in 11 days using Step 4 of the Playbook" or "Used the diagnostic to
   * relabel a Weak Offer; my flat Stripe line broke that week." No
   * invented numbers. No 'helped me a lot' fluff.
   *
   * Founder entries set this to the founder's own dogfood line.
   */
  proof: string;
  /**
   * Absolute path under `app/public/` to the partner's headshot.
   * Convention: `/partners/<slug>.jpg` (or .png / .webp). The Next.js
   * image pipeline serves it; no remote-loader config needed.
   *
   * Optional: when omitted, the page renders a monogram fallback so the
   * partner can still ship a page while their photo is in review.
   */
  photo?: string;
  /**
   * Public profile URLs the partner wants surfaced. Each must be an
   * https:// URL the partner controls. Used in `Person.sameAs` JSON-LD
   * and as in-body links. Skip any handle the partner has not actually
   * created – fabricated sameAs entries tank Knowledge Graph weight.
   */
  socials?: {
    x?: string;
    linkedin?: string;
    github?: string;
    youtube?: string;
    website?: string;
  };
  /** SEO meta title, under 60 chars. */
  metaTitle: string;
  /** SEO meta description, under 160 chars. */
  metaDescription: string;
  /** ISO date last verified (YYYY-MM-DD). */
  lastVerified: string;
}

export const PARTNER_ENTRIES: ReadonlyArray<PartnerEntry> = [
  {
    slug: "maryan",
    displayName: "Maryan",
    kind: "founder",
    headline: "Founder of Unlock SaaS. Building the playbook he uses for his own launch.",
    pitch:
      "I spent fifteen years inside Brunson-style funnels for other people's products, then shipped my own with Lovable and Claude when AI tooling opened the door for non-engineers. Unlock SaaS is the playbook I run on my own launch every week. If it does not unlock your first paying customer in sixty days, you do not pay – same guarantee I would want as a buyer.",
    proof:
      "Builds Unlock SaaS in public. Every public claim on the site is independently verifiable; every figure on /open is pulled live from Stripe.",
    socials: {
      website: "https://unlocksaas.com",
    },
    metaTitle: "Maryan – Founder of Unlock SaaS",
    metaDescription:
      "From the founder's chair: why Maryan built Unlock SaaS and how the playbook works on his own launch. Free 90-second diagnostic, $1 Starter, $49 Core.",
    lastVerified: "2026-05-22",
  },
  // Real affiliates get appended here, one entry per push. See the
  // operator runbook in the file header. Until then the hub renders the
  // founder card plus an empty-state CTA pointing at /affiliate/terms.
];

/**
 * Slugs in publication order. Drives generateStaticParams() in the
 * detail page and the sitemap loop.
 */
export const PARTNER_SLUGS: ReadonlyArray<string> = PARTNER_ENTRIES.map(
  (p) => p.slug,
);

/**
 * Look up a partner by slug. Returns undefined for an unknown slug so the
 * caller can notFound() through Next.js's standard 404 path.
 */
export function getPartnerBySlug(slug: string): PartnerEntry | undefined {
  return PARTNER_ENTRIES.find((p) => p.slug === slug);
}

/**
 * The set of currently-active partners minus the founder. Used by the hub
 * to drive the "real affiliates" section separately from the founder
 * dogfood card.
 */
export const AFFILIATE_PARTNERS: ReadonlyArray<PartnerEntry> = PARTNER_ENTRIES.filter(
  (p) => p.kind === "affiliate",
);
export const FOUNDER_PARTNERS: ReadonlyArray<PartnerEntry> = PARTNER_ENTRIES.filter(
  (p) => p.kind === "founder",
);

/**
 * Build the CTA href for a partner. Affiliates route through the
 * attribution redirect so the unlocksaas_ref cookie is set; the founder
 * links straight to /diagnostic with a utm_content tag.
 *
 * Both shapes preserve attribution at the analytics layer – PostHog
 * captures the utm trio on the destination page regardless of which
 * branch fires.
 */
export function partnerCtaHref(partner: PartnerEntry): string {
  if (partner.kind === "affiliate" && partner.code) {
    return `/r/${partner.code}?utm_source=partners&utm_medium=partner-page&utm_campaign=${partner.slug}`;
  }
  return `/diagnostic?utm_source=partners&utm_medium=partner-page&utm_campaign=${partner.slug}&utm_content=founder`;
}
