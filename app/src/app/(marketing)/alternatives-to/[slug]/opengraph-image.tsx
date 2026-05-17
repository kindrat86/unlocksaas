import { ImageResponse } from "next/og";
import { ALTERNATIVE_SLUGS, getAlternativeBySlug } from "@/lib/alternatives";

/**
 * Per-slug Open Graph card for /alternatives-to/[slug].
 *
 * Surface A of strategy/google-strategy.md. Closes the per-slug OG gap
 * flagged in the 2026-05-17 SEO/pSEO/GEO/AIO/AEO audit (traditional SEO
 * scored 88, with per-slug OG cited as the only soft gap). Generic OG
 * fallback previews cap inbound share-CTR around 1%; named-target cards
 * run 3-6x higher on the surfaces where pSEO links spread organically
 * (Slack, X, LinkedIn, Discord founder communities).
 *
 * Static generation contract: route inherits page.tsx's force-static +
 * dynamicParams=false via generateStaticParams below. Build pre-renders
 * one PNG per slug; phantom OG probes 404, mirroring the page-route
 * security stance.
 *
 * Brunson Hard-Rule reconciliation: every string the card renders is
 * a field already shipped in the visible HTML body of the same slug.
 * No fabricated tagline, no fabricated date, no fabricated competitor
 * claim – the OG card is the same prose the page renders, in a
 * 1200x630 frame.
 *
 * Satori/next-og constraints (the tested-safe subset, same boring
 * rules every other OG card in this repo follows):
 *   - Every container with > 1 child has `display: flex`.
 *   - No shorthand `background`; long form only.
 *   - No CSS gradients without explicit syntax (flat colors only).
 *   - System-font stack only (no font-file bundling).
 */

export const runtime = "nodejs";
export const dynamic = "force-static";
export const dynamicParams = false;
export const alt = "Unlock SaaS comparison";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return ALTERNATIVE_SLUGS.map((slug) => ({ slug }));
}

type Params = { slug: string };

export default function OgImage({ params }: { params: Params }) {
  const a = getAlternativeBySlug(params.slug);

  const headline = a
    ? `Unlock SaaS vs ${a.displayName}`
    : "Unlock SaaS alternatives";
  const subhead =
    a?.oneLine ??
    "Named-competitor comparisons. No slagging, no fabricated prices.";
  const dateline = a ? `Last verified ${a.lastVerified}` : "unlocksaas.com";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a0a0b",
          color: "#fafafa",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          padding: "64px 80px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Top: brand mark + wordmark on the left, eyebrow pill on the right. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              fontSize: 28,
              color: "#a1a1aa",
              letterSpacing: "-0.01em",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                background: "#fafafa",
                color: "#0a0a0b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 36,
                fontWeight: 700,
                borderRadius: 8,
                letterSpacing: "-0.04em",
              }}
            >
              U
            </div>
            <span style={{ fontWeight: 600, color: "#fafafa" }}>
              Unlock SaaS
            </span>
          </div>
          <div
            style={{
              display: "flex",
              padding: "8px 18px",
              fontSize: 22,
              fontWeight: 500,
              color: "#0a0a0b",
              background: "#fafafa",
              borderRadius: 999,
              letterSpacing: "0.01em",
            }}
          >
            Alternative to
          </div>
        </div>

        {/* Middle: per-slug headline + supporting oneLine. */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div
            style={{
              fontSize: 68,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: "#fafafa",
              maxWidth: 1040,
              display: "flex",
            }}
          >
            {headline}
          </div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 400,
              lineHeight: 1.25,
              letterSpacing: "-0.01em",
              color: "#a1a1aa",
              maxWidth: 1040,
              display: "flex",
            }}
          >
            {subhead.length > 180
              ? subhead.slice(0, 179).trimEnd() + "…"
              : subhead}
          </div>
        </div>

        {/* Bottom: dated verification + canonical origin. */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 22,
            color: "#71717a",
          }}
        >
          <span style={{ display: "flex" }}>{dateline}</span>
          <span
            style={{
              display: "flex",
              color: "#fafafa",
              fontWeight: 600,
            }}
          >
            unlocksaas.com
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
