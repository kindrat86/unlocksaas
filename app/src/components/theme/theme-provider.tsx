"use client";

/**
 * Theme Provider — mounts next-themes so the .dark class on <html> follows
 * the user's system preference (or their explicit toggle choice).
 *
 * The CSS variables for dark mode already exist in globals.css; this is the
 * runtime that actually drives them. Without this provider, dark mode was
 * dead code — the .dark vars were defined but no mechanism set the class.
 *
 * `attribute="class"` toggles the `.dark` class on <html>, which matches
 * the existing `darkMode: "class"` in tailwind.config.ts.
 * `defaultTheme="system"` respects prefers-color-scheme on first visit.
 * `disableTransitionOnChange` prevents the flash of dark backgrounds
 * animating on theme switch.
 */
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
