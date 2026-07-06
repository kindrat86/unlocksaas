/**
 * Site Header Navigation — site-wide top navigation bar.
 *
 * SEO purpose (2026-07-06 live-traffic audit):
 *   The 880+ pSEO pages (glossary, benchmarks, teardowns, comparisons, etc.)
 *   were reachable only via sitemap.xml and scattered footer links. Without
 *   a site-wide header, Google's crawler treats most of these pages as
 *   "deep" content (3+ clicks from home), which lowers crawl priority and
 *   dilutes PageRank flow. This header puts every major content hub within
 *   ONE click of every page on the site.
 *
 * Design:
 *   - Minimal, text-first nav bar matching the existing shadcn design system
 *   - Logo (text) on the left, primary nav links center-right
 *   - Diagnostic CTA button on the far right (matches homepage hero CTA)
 *   - Mobile: collapsible hamburger menu (CSS-only, no JS hydration needed)
 *   - Sticky positioning so navigation is always available
 *
 * Performance:
 *   - Pure server component (no "use client"), zero hydration cost
 *   - Uses <details>/<summary> for mobile menu — native HTML, no JS
 *   - All links are <Link> for client-side navigation prefetch
 *
 * Brunson Hard-Rule: every link points to a real, indexable surface.
 * No fabricated pages, no placeholder hrefs.
 */
import Link from "next/link";

/**
 * Primary navigation sections — the highest-traffic, highest-intent hubs.
 *
 * Selection criteria (from sitemap.ts priorities + GSC-implied intent):
 *   - Glossary:       16+ definition pages, AEO/featured-snippet targets
 *   - Benchmarks:     highest AEO-intent surface (SaaS metrics queries)
 *   - Teardowns:      funnel + pricing teardowns of named indie SaaS
 *   - Compare:        head-to-head SaaS tool comparisons
 *   - Alternatives:   "[tool] alternatives" commercial-intent pages
 *   - Learn:          how-to guides + case studies + mistakes
 *   - Tools:          free SaaS calculators (linkbait / editorial backlinks)
 */
const NAV_LINKS = [
  { href: "/glossary", label: "Glossary" },
  { href: "/benchmarks", label: "Benchmarks" },
  { href: "/funnel-teardown", label: "Teardowns" },
  { href: "/compare", label: "Compare" },
  { href: "/alternatives-to", label: "Alternatives" },
  { href: "/how-to", label: "Learn" },
  { href: "/tools", label: "Free Tools" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
      {/* Desktop + mobile shared bar */}
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Logo — text, no image fetch on critical path */}
        <Link
          href="/"
          className="text-sm font-bold tracking-tight text-foreground transition-colors hover:text-primary"
          aria-label="Unlock SaaS home"
        >
          Unlock SaaS
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <Link
          href="/diagnostic"
          className="hidden md:inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Free Diagnostic
        </Link>

        {/* Mobile hamburger — native HTML, zero JS */}
        <details className="relative md:hidden">
          <summary
            className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
            aria-label="Toggle navigation menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </summary>
          {/* Mobile dropdown */}
          <div className="absolute right-0 top-12 z-50 w-56 rounded-lg border border-border bg-popover p-2 shadow-lg">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {link.label}
              </Link>
            ))}
            <div className="my-1 h-px bg-border" />
            <Link
              href="/diagnostic"
              className="block rounded-md bg-primary px-3 py-2 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Free Diagnostic
            </Link>
          </div>
        </details>
      </div>
    </header>
  );
}
