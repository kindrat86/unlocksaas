import { ImageResponse } from "next/og";

/**
 * Default 1200×630 Open Graph card — the social-share preview that fires
 * whenever any page on unlocksaas.com is linked on Twitter/X, LinkedIn,
 * Slack, iMessage, Facebook, or Discord.
 *
 * Surface A of the Google strategy. Per-page metadata in (marketing)/*
 * can override this via its own opengraph-image.tsx; until those exist,
 * every page falls through to this card. Layout.tsx's openGraph block
 * previously claimed an image URL that did not resolve — this file fixes
 * that broken claim.
 *
 * Visual logic mirrors the Funnel Hub: dark Geist background, the enemy
 * sentence + the promise. Hardcoded copy is the same one-line bio used in
 * layout.tsx Metadata so SERP, social preview, and the live hero all
 * carry the same sentence — Brunson Hook consistency rule.
 *
 * Implementation note: next/og + satori only supports a subset of CSS
 * (display: flex required on any container with > 1 child, no shorthand
 * background props, no gradients without explicit syntax). Keep this file
 * boring — every prop here is a tested-safe subset.
 */

export const alt = "Unlock SaaS — Your first paying customer in 60 days, or you do not pay.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
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
        {/* Top: brand mark + wordmark */}
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
          <span style={{ fontWeight: 600, color: "#fafafa" }}>Unlock SaaS</span>
        </div>

        {/* Middle: the contract */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div
            style={{
              fontSize: 80,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: "#fafafa",
              maxWidth: 1040,
            }}
          >
            Your first paying customer in 60 days.
          </div>
          <div
            style={{
              fontSize: 44,
              fontWeight: 500,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "#a1a1aa",
            }}
          >
            Or you do not pay.
          </div>
        </div>

        {/* Bottom: audience + url */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 24,
            color: "#71717a",
          }}
        >
          <span>For non-engineer founders who already shipped.</span>
          <span style={{ color: "#fafafa", fontWeight: 600 }}>unlocksaas.com</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
