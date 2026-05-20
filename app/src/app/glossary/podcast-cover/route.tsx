import { ImageResponse } from "next/og";
import { glossaryAudioEpisodeCount } from "@/lib/seo/glossary-audio";

/**
 * /glossary/podcast-cover — 1400×1400 square PNG used as the Apple
 * Podcasts / Spotify / Google Podcasts channel artwork for the Unlock
 * SaaS Glossary podcast feed served at /glossary/podcast.xml.
 *
 * Apple Podcasts validator requires:
 *   - Square aspect ratio (1:1).
 *   - Between 1400×1400 and 3000×3000 pixels.
 *   - PNG or JPEG.
 *   - sRGB color space.
 *
 * 1400×1400 is the smallest accepted size, which keeps the response
 * payload small while remaining submission-eligible. Vercel's
 * @vercel/og pipeline produces a PNG by default and serves it with the
 * correct content-type header automatically.
 *
 * Why a route handler (not opengraph-image.tsx file convention): the
 * file-based convention is sized for 1200×630 OG cards. A podcast cover
 * has different aspect, dimensions, and consumer (podcast directories
 * vs social link unfurlers) – mounting it at a stable /glossary/podcast-
 * cover URL lets the RSS feed reference it deterministically without
 * relying on the OG resolver picking the right variant.
 *
 * The cover content stays minimal: brand mark + show title. No episode
 * counts or freshness signals – the cover is cached aggressively and a
 * counter drifting from the feed would be a Brunson Hard-Rule violation.
 * Episode count is logged in `runtime` for observability only.
 */


const SIZE = { width: 1400, height: 1400 } as const;
const BG = "#0a0a0a";
const ACCENT = "#fafafa";
const MUTED = "#737373";
const ACCENT_LINE = "#a3a3a3";

export async function GET() {
  // Read once for observability; does not appear in the artwork.
  const _episodes = glossaryAudioEpisodeCount();
  void _episodes;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: BG,
          color: ACCENT,
          padding: 120,
          fontFamily: "system-ui, -apple-system, sans-serif",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 40,
            letterSpacing: 12,
            textTransform: "uppercase",
            color: MUTED,
            marginBottom: 48,
            display: "flex",
          }}
        >
          Unlock SaaS
        </div>
        <div
          style={{
            fontSize: 180,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: -4,
            marginBottom: 56,
            display: "flex",
          }}
        >
          Glossary
        </div>
        <div
          style={{
            height: 4,
            width: 240,
            backgroundColor: ACCENT_LINE,
            marginBottom: 56,
            display: "flex",
          }}
        />
        <div
          style={{
            fontSize: 44,
            lineHeight: 1.35,
            color: MUTED,
            maxWidth: 1000,
            display: "flex",
            textAlign: "center",
          }}
        >
          Audio definitions of the Brunson framework, for post-launch
          pre-revenue founders.
        </div>
      </div>
    ),
    {
      ...SIZE,
      // Cache aggressively – the cover changes only when this route's
      // JSX changes (a redeploy event). Long edge cache + browser cache.
      headers: {
        "cache-control":
          "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000",
      },
    },
  );
}
