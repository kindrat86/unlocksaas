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
 * This bar mounts a slim CTA strip to the bottom of the viewport that appears
 * AFTER the visitor has scrolled past the hero, and hides at the footer (no
 * point doubling up with the Final CTA's own buttons).
 *
 * Mobile: full-width strip with the diagnostic CTA only.
 * Desktop: same strip with secondary $1 link exposed.
 *
 * Visual treatment: restrained shadcn — background/border tokens, default
 * Button. Same aesthetic as the rest of the app.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const HERO_SCROLL_THRESHOLD_PX = 600;

export function StickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      const scrolled = window.scrollY;
      const nearBottom =
        window.innerHeight + scrolled >=
        document.documentElement.scrollHeight - 200;
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
      className="fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-md border-t border-border px-3 sm:px-4 py-3"
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        <div className="hidden sm:block flex-1 min-w-0">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Still scrolling?
          </p>
          <p className="text-sm font-medium leading-tight truncate">
            Free 2-minute diagnosis — find out which beat is breaking the
            line.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-1 sm:flex-initial">
          <Button asChild className="flex-1 sm:flex-initial">
            <Link href="/diagnostic">Free diagnosis</Link>
          </Button>
          <Link
            href="/starter"
            className="hidden md:inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground underline underline-offset-4 whitespace-nowrap transition-colors"
          >
            or Start for $1
          </Link>
        </div>
      </div>
    </div>
  );
}
