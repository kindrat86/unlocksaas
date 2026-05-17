import { ImageResponse } from "next/og";

/**
 * Dynamic 512×512 brand icon — schema.org Organization.logo target.
 *
 * Surface A of the Google strategy. The Organization JSON-LD block in
 * src/components/seo/json-ld.tsx claims a logo URL; Knowledge Graph and
 * Bing both need that URL to resolve to a real image. The existing
 * app/favicon.ico covers browser-tab favicon needs; this file produces a
 * larger square PNG that's appropriate as a brand logo and is auto-served
 * by Next.js at /icon.
 *
 * Implementation: ImageResponse renders an inline SVG-style mark — no
 * external image asset required, no /public dependency, no Tailwind. Pure
 * React-DOM tags that next/og's satori renderer supports natively.
 *
 * Visual: black background, off-white "U" with a thin underline (the
 * "unlock" line), matching the dark Geist body theme set in
 * src/app/layout.tsx. Intentionally austere — no fake-logo brand mark.
 */

export const runtime = "nodejs";
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0b",
          color: "#fafafa",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          fontWeight: 700,
        }}
      >
        <div
          style={{
            fontSize: 340,
            lineHeight: 1,
            letterSpacing: "-0.04em",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span>U</span>
          <div
            style={{
              width: 220,
              height: 14,
              background: "#fafafa",
              marginTop: 24,
              borderRadius: 4,
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
