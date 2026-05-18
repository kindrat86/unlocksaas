/**
 * Brunson DCS Chapter 11 – bait-result OG card.
 *
 * Renders the public diagnosis as a 1200x630 social preview. Read by X,
 * LinkedIn, Facebook, Slack, and any other surface that fetches OG metadata
 * when a /diagnosis/<id> URL is shared. This card is the bait amplification
 * – it tells the scroller "your peer ran this for free, you can too" in a
 * Reluctant-Hero visual register, before they click.
 *
 * Pattern mirrored from app/src/app/builder/[slug]/opengraph-image.tsx.
 */
import { ImageResponse } from "next/og";
import { createAdminClient } from "@/lib/supabase/server";
import {
  LABEL_PUBLIC_NAME,
  LABEL_SHARP_LINE,
  loadPublicDiagnosis,
  refFromHostname,
} from "@/lib/diagnostic-share";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Static alt is intentional even though the page is force-dynamic: per-id
// alt would force a second loadPublicDiagnosis call per OG fetch (the page
// already calls it twice – once in generateMetadata, once in the default
// export). The card's hostname + label badge are the per-id signal; og:title
// and og:description on the page already carry both. A descriptive alt that
// covers the entire surface beats a per-id alt that doubles DB read load.
// Follow-up: wrap loadPublicDiagnosis in React.cache() for request-scoped
// memoization, then promote this to generateImageMetadata.
export const alt =
  "Reluctant-Hero diagnosis card – Wrong Person, Weak Offer, or Weak Belief";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OgImage({ params }: Props) {
  const { id } = await params;
  const diag = await loadPublicDiagnosis(createAdminClient(), id);

  const hostLine = diag ? diag.hostname : "unlocksaas.com";
  const labelLine = diag ? LABEL_PUBLIC_NAME[diag.label] : "Free Diagnostic";
  const headline = diag
    ? `${diag.hostname} got diagnosed.`
    : "Run your free diagnostic.";
  // The single sharp line of advice: replaces the previous generic subline.
  // Each label points at the concrete next move the Playbook would push the
  // founder toward, restated in twelve words or fewer. Brunson Hard-Rule:
  // identical wording to LABEL_SHARP_LINE in diagnostic-share.ts so the OG
  // card, the share-card tweet copy, and any future Slack/LinkedIn unfurl
  // never disagree on what the fix is.
  const sharpLine = diag
    ? LABEL_SHARP_LINE[diag.label]
    : "Paste your live URL. The engine labels the upstream failure mode.";
  // Attribution slug for the watermark. The scroller who clicks through to
  // /diagnostic carries this slug as ?ref=<slug> so PostHog can attribute
  // the conversion back to the originating diagnosis without ever exposing
  // the lead's email or id. refFromHostname collapses to "anon" when the
  // diagnosis has not loaded (404 fallback path) so the watermark is still
  // valid markup.
  const refSlug = diag ? refFromHostname(diag.hostname) : "anon";
  const watermark = `unlocksaas.com/diagnostic?ref=${refSlug}`;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          color: "#fafafa",
          padding: "72px",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            color: "#a3a3a3",
            fontSize: "22px",
            textTransform: "uppercase",
            letterSpacing: "0.2em",
          }}
        >
          <span style={{ display: "flex", alignItems: "center" }}>
            ◆ Unlock SaaS · Free Diagnostic
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            gap: "28px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              fontSize: "28px",
              color: "#fafafa",
            }}
          >
            <span
              style={{
                display: "flex",
                background: "#facc15",
                color: "#0a0a0a",
                padding: "8px 18px",
                borderRadius: "999px",
                fontWeight: 700,
                fontSize: "22px",
                textTransform: "uppercase",
                letterSpacing: "0.18em",
              }}
            >
              {labelLine}
            </span>
            <span style={{ display: "flex", color: "#a3a3a3" }}>
              {hostLine}
            </span>
          </div>

          <div
            style={{
              fontSize: "76px",
              lineHeight: 1.1,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              display: "flex",
            }}
          >
            {headline}
          </div>

          {/* The sharp line of advice. Rendered at 36px (up from the
              previous 30px subline) so it reads as the second beat after
              the headline, not as a footnote. Single sentence, no period
              ambiguity – the value of the card is what this line says, not
              the brand mark above it. */}
          <div
            style={{
              fontSize: "36px",
              lineHeight: 1.3,
              color: "#fafafa",
              display: "flex",
              maxWidth: "1000px",
              fontWeight: 500,
            }}
          >
            {sharpLine}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            color: "#a3a3a3",
            fontSize: "24px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ color: "#fafafa", fontSize: "22px" }}>
              Reluctant Hero. Non-engineer. Built the playbook he wishes
              someone had handed him.
            </span>
            <span style={{ fontSize: "20px" }}>
              No card. 90 seconds. Run yours in two minutes.
            </span>
          </div>
          {/* Ref-tagged watermark URL. The scroller who reads the card and
              types the path into a new tab carries the attribution slug
              through to /diagnostic, where DiagnosticRefAttribution fires
              a PostHog event tagging the originating hostname. Brunson
              attribution discipline: every off-platform impression has an
              on-platform return path that can be measured. */}
          <div
            style={{
              display: "flex",
              fontSize: "22px",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              color: "#fafafa",
            }}
          >
            {watermark}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
