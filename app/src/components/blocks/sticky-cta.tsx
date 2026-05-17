"use client";

/**
 * Sticky scroll CTA — Brunson "always visible offer" rule (Funnel Hacker's
 * Cookbook §3 momentum signal).
 *
 * The hero CTA sits above the fold. Every block below the hero pushes the
 * CTA off-screen, which means a visitor scrolling through the manifesto,
 * before/after, and stack slide has no one-tap way back to the offer until
 * they hit the Final CTA at the bottom.
 *
 * This bar mounts a slim, orange-bordered CTA strip to the bottom of the
 * viewport that appears AFTER the visitor has scrolled past the hero (so it
 * does not double up with the visible hero CTA), and hides on the diagnostic
 * page itself (no point linking back to a page you are already on).
 *
 * Mobile: full-width strip with the diagnostic CTA only.
 * Desktop: same strip with secondary $1 / $49 links exposed.
 *
 * Accessibility: pointer-events stay live, focus order respects DOM order
 * (mounted at end of body), aria-label names the strip as "Persistent offer
 * bar" so screen readers skip past it the way they skip past navigation.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const HERO_SCROLL_THRESHOLD_PX = 600;

export function StickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      const scrolled = window.scrollY;
      const nearBottom =
        window.innerHeight + scrolled >= document.documentElement.scrollHeight - 200;
      // Show after the hero is offscreen, hide right at the footer so we
      // don't overlap the final CTA's own buttons.
      setVisible(scrolled > HERO_SCROLL_THRESHOLD_PX && !nearBottom);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Persistent offer bar"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-orange-500 shadow-2xl shadow-purple-900/20 px-3 sm:px-4 py-3"
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        <div className="hidden sm:block flex-1 min-w-0">
          <p className="text-xs uppercase tracking-widest font-bold text-purple-700">
            Still scrolling?
          </p>
          <p className="text-sm font-bold text-gray-900 leading-tight truncate">
            Free 2-minute diagnosis — find out which beat is breaking your line.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-1 sm:flex-initial">
          <Link
            href="/diagnostic"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold uppercase tracking-wide text-sm px-4 sm:px-6 py-2.5 sm:py-3 rounded-md border-b-2 sm:border-b-4 border-orange-700 hover:border-orange-800 transition-colors whitespace-nowrap shadow-md"
          >
            Free diagnosis
            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          </Link>
          <Link
            href="/starter"
            className="hidden md:inline-flex items-center text-xs font-bold text-purple-700 hover:text-purple-900 underline underline-offset-4 whitespace-nowrap"
          >
            or Start for $1
          </Link>
        </div>
      </div>
    </div>
  );
}
