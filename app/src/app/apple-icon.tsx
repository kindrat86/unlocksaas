import { ImageResponse } from "next/og";

/**
 * Apple touch icon (180x180 PNG) generated via next/og ImageResponse.
 *
 * Next.js apple-icon file convention only accepts raster formats
 * (jpg/jpeg/png) — SVG is not honored on iOS. ImageResponse rasterizes
 * a JSX tree to PNG at build/request time.
 *
 * Visual matches /icon.svg: a "U" shackle on the brand dark surface.
 * Reads as both the letter U (Unlock) and an open padlock — on-message
 * for the brand, simple enough to be legible at any home-screen scale.
 *
 * Brunson Hard-Rule reconciliation: placeholder-quality but honest —
 * no fabricated polish, no stolen mark. Swap with founder-designed
 * artwork when brand identity work lands.
 */

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a0b",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 40,
        }}
      >
        <div
          style={{
            color: "#ffffff",
            fontSize: 140,
            fontWeight: 700,
            letterSpacing: "-0.06em",
            display: "flex",
            // Geist is provided by the project, but ImageResponse needs an
            // explicit font load to use it. Default sans-serif is fine for
            // the iOS home-screen size and avoids a font-fetch round trip.
            fontFamily: "sans-serif",
            lineHeight: 1,
            paddingBottom: 10,
          }}
        >
          U
        </div>
      </div>
    ),
    { ...size },
  );
}
