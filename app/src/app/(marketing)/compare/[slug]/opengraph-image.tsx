import { ImageResponse } from "next/og";
import { COMPARISON_SLUGS, getComparisonBySlug } from "@/lib/comparisons";

/**
 * Per-slug Open Graph card for /compare/[slug].
 *
 * Surface A of strategy/google-strategy.md. Closes the per-slug OG gap
 * from the 2026-05-17 audit. Head-to-head "[A] vs [B]" is the highest-
 * intent SaaS-research query class on the property; a named-pair
 * preview is the difference between a 1% CTR generic preview and a
 * 4-6% CTR "I am literally researching this exact pair" preview.
 *
 * Brunson Hard-Rule reconciliation: symmetric framing extends to the
 * OG card. The card names both products on the headline line and
 * renders NO verdict – the honest take is the click-through payoff,
 * not a thumbnail.
 *
 * Static-generation + Satori constraints identical to the sibling
 * routes in this fleet (alternatives-to, funnel-teardown,
 * pricing-teardown).
 */

export const runtime = "nodejs";
export const dynamic = "force-static";
export const dynamicParams = false;
export const alt = "Unlock SaaS head-to-head comparison";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return COMPARISON_SLUGS.map((slug) => ({ slug }));
}

type Params = { slug: string };

export default function OgImage({ params }: { params: Params }) {
  const c = getComparisonBySlug(params.slug);

  const headline = c
    ? `${c.a.name} vs ${c.b.name}`
    : "Head-to-head comparisons";
  const subhead =
    c?.oneLine ??
    "Symmetric dimension-by-dimension breakdown for indie SaaS founders.";
  const dateline = c ? `Last verified ${c.lastVerified}` : "unlocksaas.com";

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
            Head-to-head
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
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
          <span style={{ display: "flex", color: "#fafafa", fontWeight: 600 }}>
            unlocksaas.com
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
