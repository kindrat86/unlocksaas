/**
 * Skip to Content — accessibility bypass link (WCAG 2.4.1).
 *
 * The first focusable element on the page. Invisible until focused (via
 * Tab key), then expands to a visible, branded bar at the top-left. Hitting
 * Enter moves focus to #main-content, letting keyboard / screen-reader
 * users skip the 8-link nav + hamburger + tagline and jump straight to
 * the hero.
 *
 * Visually hidden by default via sr-only; .sr-only-focusable makes it
 * appear on focus. This is the standard pattern.
 *
 * Target: #main-content — the <main id="main-content"> we wrap the page
 * body in (see layout.tsx). Must match.
 */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-primary-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      Skip to content
    </a>
  );
}
