import { NextResponse } from "next/server";
import { FOUNDER, BASE_URL } from "@/lib/seo/entity";

/**
 * /.well-known/security.txt — RFC 9116 compliant security contact file.
 *
 * Why this surface exists:
 *   RFC 9116 is the proposed-standard for a machine-discoverable security
 *   contact at /.well-known/security.txt. Major automated-security-scanning
 *   pipelines (HackerOne triage bots, security researchers' tooling,
 *   responsible-disclosure aggregators) look here first when they find an
 *   issue. Shipping a real, signed-by-convention security.txt is a small
 *   trust signal that:
 *     - Tells security researchers the founder takes disclosure seriously.
 *     - Means a bug-report that would otherwise vanish into a contact-form
 *       black-hole reaches a real inbox.
 *     - Counts as one of the few "no-fabrication" E-E-A-T trust signals
 *       a single-founder pre-revenue SaaS can claim honestly.
 *
 * Brunson Hard-Rule reconciliation: every field below points at an
 * inbox the founder actually reads. No bug-bounty platform claim, no
 * coordinated-disclosure window we haven't actually committed to.
 *
 * Expires field: RFC 9116 mandates an expiration date (max one year out).
 * We re-render on every deploy via `force-dynamic`, so the expires date
 * stays current as long as deploys happen at least quarterly – which
 * matches the build cadence of the strategy folder.
 */

// Re-render on each request so `Expires` is always fresh. The handler is
// trivial – no measurable cost.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export function GET() {
  // RFC 9116 §2.5.4: Expires SHOULD be no more than a year out. We use
  // 9 months to stay well clear of the boundary even if the next deploy
  // slips by a month or two.
  const expires = new Date();
  expires.setUTCMonth(expires.getUTCMonth() + 9);
  expires.setUTCHours(0, 0, 0, 0);

  const body = [
    `# Security policy for ${BASE_URL.replace(/^https?:\/\//, "")}`,
    `# RFC 9116 – machine-discoverable security contact.`,
    "",
    `Contact: mailto:${FOUNDER.email}`,
    `Expires: ${expires.toISOString()}`,
    `Preferred-Languages: en`,
    `Canonical: ${BASE_URL}/.well-known/security.txt`,
    "",
    `# Policy`,
    `# - Real reports go to the inbox above. One human reads it.`,
    `# - Coordinated disclosure: 90 days from acknowledgement, or sooner`,
    `#   by mutual agreement. Patches ship as soon as they pass tests.`,
    `# - No paid bug-bounty program at this stage. We will publicly`,
    `#   credit researchers who request acknowledgement, on the /about`,
    `#   page, after the patch lands.`,
    `# - In-scope: ${BASE_URL.replace(/^https?:\/\//, "")} and every subdomain.`,
    `# - Out-of-scope: third-party services we depend on (Stripe, Supabase,`,
    `#   Vercel, Resend) – please report those upstream.`,
    "",
  ].join("\n");

  return new NextResponse(body, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      // Researchers re-check periodically; keep the cache short so a
      // rotated Contact value is visible quickly.
      "cache-control": "public, max-age=3600",
    },
  });
}
