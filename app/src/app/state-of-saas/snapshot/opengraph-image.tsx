import { ImageResponse } from "next/og";
import {
  SNAPSHOT_HEADLINE_TOTAL,
  SNAPSHOT_LAST_VERIFIED_DATE,
  SNAPSHOT_OBSERVATIONS,
  SNAPSHOT_VERSION,
} from "@/lib/state-of-saas-snapshot";

/**
 * /state-of-saas Open Graph card (1200×630).
 *
 * Surface A (social share + image sitemap) variant for the live
 * editorial snapshot dashboard. Renders the headline count, the
 * dated freshness anchor, and a short slug so an iMessage / Slack /
 * Twitter unfurl reads as "this is the snapshot, here is the
 * single number, here is the date".
 *
 * Visual rule: dark Geist palette + tabular numerals, mirroring the
 * root OG card so social previews from anywhere on the site read as
 * one brand voice. next/og + satori restricts CSS (display:flex
 * required on any node with > 1 child, no shorthand background, no
 * gradients without explicit syntax). Keep every prop boring.
 *
 * Brunson Hard-Rule reconciliation: the only numbers on the card are
 * the headline total + observation count + version + last-verified
 * date. Each one resolves to a module-level constant the integrity
 * gate already validated. No fabricated stats.
 */

export const alt = `State of UnlockSaaS – Live Editorial Snapshot (v${SNAPSHOT_VERSION})`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function SnapshotOpenGraphImage() {
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
        {/* Top: brand mark + section tag */}
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
          <span style={{ color: "#52525b" }}>·</span>
          <span style={{ color: "#a1a1aa", fontSize: 22 }}>
            State of UnlockSaaS
          </span>
        </div>

        {/* Middle: headline count + descriptor */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 500,
              color: "#a1a1aa",
              letterSpacing: "-0.01em",
            }}
          >
            Live editorial snapshot
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 24,
            }}
          >
            <div
              style={{
                fontSize: 160,
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: "-0.04em",
                color: "#fafafa",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {SNAPSHOT_HEADLINE_TOTAL.toLocaleString("en-US")}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontSize: 28,
                color: "#a1a1aa",
                lineHeight: 1.2,
              }}
            >
              <span>editorially</span>
              <span>verified rows</span>
            </div>
          </div>
          <div
            style={{
              fontSize: 22,
              color: "#71717a",
              maxWidth: 1040,
              lineHeight: 1.3,
              display: "flex",
            }}
          >
            {`${SNAPSHOT_OBSERVATIONS.length} dated signals across editorial corpus, topical authority, entity graph, international coverage, earned media, activation state. Open under CC-BY-4.0.`}
          </div>
        </div>

        {/* Bottom: version + last-verified + url */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 22,
            color: "#71717a",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <span>
            {`v${SNAPSHOT_VERSION} · last verified ${SNAPSHOT_LAST_VERIFIED_DATE}`}
          </span>
          <span style={{ color: "#fafafa", fontWeight: 600 }}>
            unlocksaas.com/state-of-saas
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
