"use client";

/**
 * Back to Top — floating button that appears after the user scrolls past
 * the hero and disappears near the page bottom (where the footer/CTA live).
 *
 * On a 20-section page, reaching the footer means a ~5,000px scroll back up
 * on mobile. This is a one-tap escape hatch.
 *
 * Placement: bottom-right, respects safe-area-inset-bottom so it never
 * sits under the iPhone home indicator. On mobile it sits above the sticky
 * CTA bar (bottom-20 when CTA visible). z-40 = below modals/dialogs.
 *
 * Accessibility: aria-label, focus-visible ring, keyboard reachable.
 * Reduced-motion: smooth-scroll disabled by global guard.
 */
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

const SHOW_THRESHOLD_PX = 800;

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      const scrolled = window.scrollY;
      const nearBottom =
        window.innerHeight + scrolled >=
        document.documentElement.scrollHeight - 400;
      setVisible(scrolled > SHOW_THRESHOLD_PX && !nearBottom);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      className="fixed right-4 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-md transition-all duration-normal ease-out-soft hover:shadow-lg hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background animate-scale-in bottom-20 sm:bottom-6"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 5rem)" }}
    >
      <ArrowUp className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}
