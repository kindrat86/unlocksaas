import { ImageResponse } from "next/og";
import { TEARDOWN_SLUGS, getTeardownBySlug } from "@/lib/funnel-teardowns";

/**
 * Per-slug Open Graph card for /funnel-teardown/[slug].
 *
 * Surface A of strategy/google-strategy.md. Closes the per-slug OG gap
 * from the 2026-05-17 audit. Funnel teardowns are the highest share-
 * velocity pSEO surface on the property (indie founders link them in
 * Discord and Slack), so a named-target card lifts inbound CTR
 * materially over the generic fallback.
 *
 * Brunson Hard-Rule reconciliation: pattern-level lessons only. The
 * card names the company and the Hook/Story/Offer lens; no quoted
 * competitor copy, no invented metrics. Every field is a string from
 * the same manifest the HTML page renders.
 *
 * Static-generation contract mirrors page.tsx: force-static +
 * dynamicParams=false + generateStaticParams keyed to TEARDOWN_SLUGS,
 * so every card is pre-rendered at build time and phantom slugs 404.
 *
 * Satori/next-og constraints: display: flex on every multi-child
 * container, no shorthand background, no gradients without explicit
 * syntax, system-font stack only.
 */

export const runtime = "nodejs";
export const dynamic = "force-static";
export const dynamicParams = false;
export const alt = "Unlock SaaS funnel teardown";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return TEARDOWN_SLUGS.map((slug) => ({ slug }));
}

type Params = { slug: string };

export default function OgImage({ params }: { params: Params }) {
  const t = getTeardownBySlug(params.slug);

  const headline = t ? `${t.displayName} Funnel Teardown` : "Funnel teardowns";
  const subhead =
    t?.oneLine ??
    "Indie SaaS funnels through Hook, Story, Offer. Pattern-level lessons.";
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
            Funnel Teardown
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
