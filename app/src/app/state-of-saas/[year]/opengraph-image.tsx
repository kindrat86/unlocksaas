import { ImageResponse } from "next/og";
import {
  editionStaticParams,
  getEdition,
  MIN_REPORT_N,
} from "@/lib/state-of-saas";
import { loadEditionFindings } from "@/lib/state-of-saas-data";

/**
 * /state-of-saas/[year] — per-edition Open Graph card.
 *
 * Two card shapes depending on the edition's cohort state:
 *
 *   - status === "published": headline figure ("57% Wrong Person, 28%
 *     Weak Offer, 15% Weak Belief — n=N") is in the lower half, so a
 *     reader scrolling Twitter sees the actual finding without clicking.
 *     This is the citation-bait card: writers and AI overviews that
 *     embed the OG card alongside the link get the number in the
 *     thumbnail.
 *
 *   - status === "below_threshold": cohort-progress framing ("Cohort
 *     enrolling: X / MIN_REPORT_N submissions") is in the lower half.
 *     The card never shows a fabricated number — when the cohort is
 *     not yet at threshold, the card admits it.
 *
 * The visual fleet matches the index card (/state-of-saas/opengraph-image.tsx)
 * and the root site card so the report series reads as one product on
 * any social surface.
 *
 * Cached behind ISR via the route's revalidate; per-year params are
 * pre-generated via generateStaticParams so the card builds at deploy
 * time for known years and only re-renders when revalidate fires.
 */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return editionStaticParams();
}

type Params = { year: string };

export async function generateImageMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { year: yearStr } = await params;
  const year = Number.parseInt(yearStr, 10);
  const edition = getEdition(year);
  return [
    {
      id: "card",
      alt:
        edition?.displayTitle ??
        `State of Post-Launch Pre-Revenue SaaS ${year} – Unlock SaaS annual report`,
      size,
      contentType,
    },
  ];
}

export default async function StateOfSaasEditionOgImage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { year: yearStr } = await params;
  const year = Number.parseInt(yearStr, 10);
  const edition = getEdition(year);

  // Defensive: if the year is not in the registry, render a sensible
  // fallback rather than throwing. The page itself notFound()s for
  // unknown years; this card is only rendered for known years via
  // generateStaticParams, but the runtime guard protects ISR edge cases.
  const title = edition?.displayTitle ?? `State of Post-Launch Pre-Revenue SaaS ${year}`;
  const isPublished = edition?.state === "published";

  // Aggregator read — same cached call the page body uses. The React
  // cache() wrapper ensures one Supabase round-trip across the page +
  // metadata + OG card on the same render pass.
  const findings = edition ? await loadEditionFindings(year) : null;
  const cohortLabel =
    findings?.status === "published"
      ? `n = ${findings.totalSubmissions}`
      : findings
        ? `Cohort enrolling · ${findings.totalSubmissions} / ${findings.threshold}`
        : `Cohort enrolling · 0 / ${MIN_REPORT_N}`;

  const headlineLine =
    findings?.status === "published"
      ? `${findings.labelDistribution[0]?.label} leads at ${findings.labelDistribution[0]?.percent}%`
      : "What founders who already shipped are getting wrong.";

  const subLine =
    findings?.status === "published"
      ? findings.labelDistribution
          .map((r) => `${r.label} ${r.percent}%`)
          .join(" · ")
      : isPublished
        ? "Findings published. See full edition for the share table."
        : `Numbers publish when the cohort reaches ${findings?.threshold ?? MIN_REPORT_N} submissions.`;

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
        {/* Top: brand mark + wordmark + year eyebrow */}
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
            Annual report · {year}
          </span>
        </div>

        {/* Middle: title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: "#fafafa",
              maxWidth: 1040,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 500,
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
              color: "#fafafa",
              maxWidth: 1040,
            }}
          >
            {headlineLine}
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 400,
              lineHeight: 1.3,
              color: "#a1a1aa",
              maxWidth: 1040,
            }}
          >
            {subLine}
          </div>
        </div>

        {/* Bottom: cohort label + url */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 22,
            color: "#71717a",
          }}
        >
          <span>{cohortLabel} · CC-BY-4.0</span>
          <span style={{ color: "#fafafa", fontWeight: 600 }}>
            unlocksaas.com/state-of-saas/{year}
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
