import type { Metadata } from "next";
import { TeleprompterClient } from "./teleprompter-client";

/**
 * `/vsl/teleprompter` — operator-only shoot-day surface.
 *
 * Not for visitors. This is the page Maryan opens on shoot day to read each
 * cut at speaking pace, with speaker notes alongside, segment-by-segment
 * timing marks, and a cut switcher to flip between the seven cuts without
 * leaving the page.
 *
 * Deliberately gated by `robots: { index: false, follow: false }` and
 * excluded from sitemap.ts. The URL is shareable for a phone-as-teleprompter
 * setup; non-indexable so it never leaks into search.
 *
 * The reading-pace auto-scroll is the load-bearing feature — Maryan can
 * mount a phone in front of the camera, start the cut, and read at the
 * scripted cadence without a separate teleprompter app.
 */

export const metadata: Metadata = {
  title: "VSL Teleprompter — operator only",
  description:
    "Internal shoot-day reading view for the founder VSL cuts. Not indexed.",
  alternates: { canonical: "/vsl/teleprompter" },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function TeleprompterPage() {
  return <TeleprompterClient />;
}
