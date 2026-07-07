"use client";

/**
 * Reading Progress Bar — thin brand-colored bar pinned to the top of the
 * viewport that fills as the visitor scrolls through the page.
 *
 * Purpose: on a 20-section, ~6,000px-tall funnel page, a progress bar is
 * the single highest-ROI orientation affordance. It tells the visitor
 * (a) there is more below, (b) how much is left, and (c) gives a sense
 * of momentum that keeps them scrolling.
 *
 * Implementation: fixed to viewport top, sits ABOVE the sticky header
 * (z-[60] > header z-50). Width tracks scrollY / (scrollHeight - innerHeight).
 * Uses requestAnimationFrame + passive scroll listener = zero main-thread
 * jank. Hidden until 1% scrolled (avoids a full bar at page top).
 * Respects prefers-reduced-motion via the global guard in globals.css.
 */
import { useEffect, useState } from "react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let rafId = 0;
    function update() {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, pct)));
      rafId = 0;
    }
    function onScroll() {
      if (rafId) return;
      rafId = requestAnimationFrame(update);
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[60] h-0.5 pointer-events-none"
    >
      <div
        className="h-full bg-primary transition-[width] duration-75 ease-out-soft"
        style={{
          width: `${progress}%`,
          opacity: progress > 1 ? 1 : 0,
        }}
      />
    </div>
  );
}
