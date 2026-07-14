import type { Metadata } from "next";
import { pageAlternates } from "@/lib/seo/markdown-alternates";

/**
 * Per-page metadata wrapper for /welcome.
 *
 * Why a layout: historically welcome/page.tsx was a client component
 * (metadata could not live there). The page is a server component now, but
 * the metadata stays here to avoid churning the metadata surface.
 *
 * /welcome is also already in the robots.ts disallow list — this layout's
 * `robots: { index: false }` is a belt-and-suspenders signal sent in the
 * <head> itself, so a crawler that fetches the URL directly (bypassing
 * robots.txt) still sees the noindex hint. Same rationale as the
 * /diagnostic/result page (per-user / post-purchase surface).
 */
export const metadata: Metadata = {
  title: "Welcome",
  description: "Post-purchase landing for Unlock SaaS.",
  robots: { index: false, follow: false },
  alternates: pageAlternates("/welcome"),
};

export default function WelcomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
