import { ImageResponse } from "next/og";
import {
  FOUNDERS_DIARY_CHANNEL,
  buildEpisodeStaticParams,
  getLiveEpisodeBySlug,
} from "@/lib/youtube";

/**
 * /youtube/[slug] — per-episode Open Graph card.
 *
 * Visual fleet matches /state-of-saas/[year]/opengraph-image.tsx so every
 * social share from the channel reads as the same product. The card carries
 * the episode id, the title, and the channel byline so a reader scrolling
 * Twitter / LinkedIn / IH sees what the episode is about without clicking.
 *
 * Pre-launch the live registry is empty → generateStaticParams returns
 * nothing → no cards are emitted. Once an episode is promoted the card
 * is generated on the next deploy.
 */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams(): Array<{ slug: string }> {
  return buildEpisodeStaticParams();
}

type Params = { slug: string };

export async function generateImageMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const ep = getLiveEpisodeBySlug(slug);
  return [
    {
      id: "card",
      alt: ep
        ? `${ep.id} · ${ep.title} — ${FOUNDERS_DIARY_CHANNEL.name}`
        : FOUNDERS_DIARY_CHANNEL.name,
      size,
      contentType,
    },
  ];
}

export default async function FoundersDiaryEpisodeOgImage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const ep = getLiveEpisodeBySlug(slug);

  // Defensive fallback for ISR edge cases where a slug from a stale
  // sitemap is still requested. The page itself notFound()s; the card
  // renders a generic channel card so the social embed never breaks.
  const idLabel = ep?.id ?? "Episode";
  const title = ep?.title ?? FOUNDERS_DIARY_CHANNEL.tagline;
  const hook = ep?.hook_3s ?? FOUNDERS_DIARY_CHANNEL.description;
  const cadence = FOUNDERS_DIARY_CHANNEL.cadence;

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
        {/* Top: brand mark + channel byline */}
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
            {FOUNDERS_DIARY_CHANNEL.name} · {idLabel}
          </span>
        </div>

        {/* Middle: title + hook */}
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
              fontSize: 28,
              fontWeight: 400,
              lineHeight: 1.3,
              color: "#a1a1aa",
              maxWidth: 1040,
            }}
          >
            {hook}
          </div>
        </div>

        {/* Bottom: cadence + url */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 22,
            color: "#71717a",
          }}
        >
          <span>
            {cadence} · $0 to first paying customer, in public
          </span>
          <span style={{ color: "#fafafa", fontWeight: 600 }}>
            unlocksaas.com/youtube
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
