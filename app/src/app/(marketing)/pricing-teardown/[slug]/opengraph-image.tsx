import { ImageResponse } from "next/og";
import {
  PRICING_TEARDOWN_SLUGS,
  getPricingTeardownBySlug,
} from "@/lib/pricing-teardowns";

/**
 * Per-slug Open Graph card for /pricing-teardown/[slug].
 *
 * Surface A of strategy/google-strategy.md. Closes the per-slug OG gap
 * from the 2026-05-17 audit. Pricing teardowns sit on the highest-
 * intent pricing-research query class ("how does X price"); a named-
 * target preview lifts CTR on the inbound surfaces where these are
 * shared (founder communities, pricing-page audits).
 *
 * Brunson Hard-Rule reconciliation: the card names the company and
 * the Stack/Anchor/Mechanics lens. No fabricated price points on the
 * card – the actual prices live in the manifest with dated
 * lastVerified and render only on the HTML page.
 *
 * Static-generation + Satori constraints identical to the sibling
 * routes in this fleet (alternatives-to, funnel-teardown, compare).
 */

export const runtime = "nodejs";
export const dynamic = "force-static";
export const dynamicParams = false;
export const alt = "Unlock SaaS pricing teardown";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return PRICING_TEARDOWN_SLUGS.map((slug) => ({ slug }));
}

type Params = { slug: string };

export default function OgImage({ params }: { params: Params }) {
  const t = getPricingTeardownBySlug(params.slug);

  const headline = t
    ? `${t.displayName} Pricing Teardown`
    : "Pricing teardowns";
  const subhead =
    t?.oneLine ??
    "Indie SaaS pricing through Stack, Value Ladder, Anchor, Mechanics.";
  const dateline = t ? `Last verified ${t.lastVerified}` : "unlocksaas.com";

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
            Pricing Teardown
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
