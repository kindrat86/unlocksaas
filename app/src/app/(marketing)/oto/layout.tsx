import type { Metadata } from "next";
import { pageAlternates } from "@/lib/seo/markdown-alternates";

/**
 * Per-page metadata wrapper for /oto.
 *
 * Why a layout: historically oto/page.tsx was a client component (metadata
 * could not live there). The page is a server component now, but the
 * metadata stays here so the layout remains the single metadata surface
 * for the /oto subtree (vault / cold-emails / lifetime override locally).
 *
 * /oto is in the robots.ts disallow list (strategy/google-strategy.md §A.4
 * rationale: the OTO has no context outside the $1 purchase — indexing it
 * confuses cold-traffic narrative). This `robots: { index: false }` is the
 * <head>-level signal that backs up the robots.txt rule, so a direct fetch
 * still gets the noindex hint.
 */
export const metadata: Metadata = {
  title: "One-time offer",
  description: "Post-purchase upgrade for Unlock SaaS customers.",
  robots: { index: false, follow: false },
  alternates: pageAlternates("/oto"),
};

export default function OtoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
