import { ImageResponse } from "next/og";

/**
 * /state-of-saas — index Open Graph card.
 *
 * Visual contract mirrors the root /opengraph-image.tsx (dark Geist
 * palette + brand mark + wordmark) so the report series sits in the same
 * visual family as the rest of the site when shared on Twitter/X,
 * LinkedIn, Slack, iMessage, Facebook, or Discord. The per-edition cards
 * under /state-of-saas/[year]/opengraph-image.tsx are descendants of
 * this visual family with the year prominent.
 *
 * Brunson Hard-Rule reconciliation: caption strings are hardcoded
 * editorial copy that mirrors the canonical Article description on the
 * index page. No fabricated numbers, no per-edition figures (those
 * belong on the per-edition cards).
 *
 * next/og + satori constraints honoured: flex on every multi-child
 * container, no shorthand background props, no gradients, system font
 * stack only.
 */

export const alt =
  "State of Post-Launch Pre-Revenue SaaS — Annual report from Unlock SaaS";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function StateOfSaasIndexOgImage() {
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
          <span style={{ fontWeight: 600, color: "#fafafa" }}>
            Unlock SaaS
          </span>
          <span style={{ marginLeft: "auto", fontSize: 22, color: "#71717a" }}>
            Annual report
          </span>
        </div>

        {/* Middle: title + subtitle */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: "#fafafa",
              maxWidth: 1040,
            }}
          >
            State of Post-Launch Pre-Revenue SaaS
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 500,
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
              color: "#a1a1aa",
              maxWidth: 1040,
            }}
          >
            What founders who already shipped are actually getting wrong.
          </div>
        </div>

        {/* Bottom: license + url */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 22,
            color: "#71717a",
          }}
        >
          <span>Free · CC-BY-4.0 · One edition per year</span>
          <span style={{ color: "#fafafa", fontWeight: 600 }}>
            unlocksaas.com/state-of-saas
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
