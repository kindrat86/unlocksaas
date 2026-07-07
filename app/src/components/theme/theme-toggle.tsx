"use client";

/**
 * Theme Toggle — accessible sun/moon button.
 *
 * Hydration-safe: renders a stable 36px placeholder until mounted, then
 * swaps to the icon matching the resolved theme. Avoids the classic
 * "sun icon flashes in dark mode" mismatch.
 *
 * Touch target: 40px (≥44px is ideal but the header bar is 56px / h-14;
 * 40px keeps it from dominating while staying comfortably tappable).
 * The icon-only design is screen-reader-labeled.
 */
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {mounted ? (
        isDark ? (
          <Sun className="h-[18px] w-[18px]" aria-hidden="true" />
        ) : (
          <Moon className="h-[18px] w-[18px]" aria-hidden="true" />
        )
      ) : (
        /* Stable placeholder prevents hydration mismatch — same bounding
           box as the icon that will replace it. */
        <span className="block h-[18px] w-[18px]" aria-hidden="true" />
      )}
    </button>
  );
}
