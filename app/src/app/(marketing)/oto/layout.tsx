import type { Metadata } from "next";
import { pageAlternates } from "@/lib/seo/markdown-alternates";

/**
 * Per-page metadata wrapper for /oto.
 *
 * Why a layout: oto/page.tsx is marked "use client" because it fires
 * tracking events on mount and POSTs to /api/checkout on click. Next.js
 * does not allow `export const metadata` from client components.
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
