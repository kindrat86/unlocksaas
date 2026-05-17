import type { Metadata } from "next";
import { pageAlternates } from "@/lib/seo/markdown-alternates";

/**
 * Per-page metadata wrapper for the $49 Playbook long-form sales page.
 *
 * Why a layout: playbook-sales/page.tsx is marked "use client" because the
 * checkout POST is interactive (see page.tsx header comment). Next.js does
 * not allow `export const metadata` from client components, so the metadata
 * lives in this server-component layout pass-through.
 *
 * Surface A of the Google strategy. Product-aware decision page; the
 * highest-intent landing surface in the public funnel. Title carries the
 * 60-day-or-you-do-not-pay contract verbatim so SERP previews mirror the
 * Funnel Hub promise rather than diverging from it.
 *
 * The PlaybookProductJsonLd block is already rendered inside page.tsx itself,
 * so this layout does not duplicate it.
 */
export const metadata: Metadata = {
  title: "The Playbook — your first paying customer in 60 days, or you do not pay",
  description:
    "A seven-step playbook that turns your already-shipped SaaS into a verified paying customer in 60 days. Built by a non-engineer for non-engineer founders shipping with Lovable, Claude, and Replit. $49/mo. 60-day money-back guarantee.",
  alternates: pageAlternates("/playbook-sales"),
  openGraph: {
    title: "The Playbook — Unlock SaaS",
    description:
      "Your first paying customer in 60 days, or you do not pay. $49/mo. Built by a non-engineer for non-engineer founders shipping with AI tools.",
    url: "/playbook-sales",
    type: "website",
  },
};

export default function PlaybookSalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
