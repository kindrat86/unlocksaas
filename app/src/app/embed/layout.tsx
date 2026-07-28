import type { ReactNode } from "react";
import "../globals.css";

export const metadata = {
  robots: { index: false, follow: true },
  // No trailing slash on canonical — aligns with trailingSlash: false
  // in next.config.mjs so /embed (not /embed/) is the self-canonical URL.
  alternates: {
    canonical: "/embed",
  },
};

/**
 * Minimal chrome-free shell for iframe embedding. No header, footer,
 * nav, or providers beyond what the widget itself needs. globals.css
 * supplies the design tokens (Tailwind reset + custom properties).
 *
 * Each page under /embed/ gets its own <html>/<body> document so it
 * renders as a standalone iframe payload — the root marketing layout
 * (with header, footer, analytics, cookie banners) is intentionally
 * NOT inherited here.
 */
export default function EmbedLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "transparent" }}>{children}</body>
    </html>
  );
}
