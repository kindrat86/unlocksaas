import type { MetadataRoute } from "next";

/**
 * Web App Manifest — served at /manifest.webmanifest.
 *
 * Next.js auto-injects <link rel="manifest"> into <head> from this file.
 * Completes the PWA/icon trio (icon.svg + apple-icon.tsx + manifest.ts)
 * that Surface A (organic) audits flag as missing technical-SEO baseline.
 *
 * theme_color and background_color mirror layout.tsx Viewport.themeColor —
 * dark surface, matches the site's locked dark-only rendering.
 *
 * Source: strategy/google-strategy.md §A.4 (technical SEO baseline).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Unlock SaaS",
    short_name: "UnlockSaaS",
    description:
      "A machine that turns your already-shipped product into a verified paying customer. If it does not, you do not pay.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0b",
    theme_color: "#0a0a0b",
    categories: ["business", "productivity"],
    lang: "en-US",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
