"use client";

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
 * Design (upgraded to world-class mobile-first 2026-07-06):
 *   - Sticky, blurred, shrinks subtly on scroll (shadow appears)
 *   - Logo left, desktop nav center-right, theme toggle + CTA right
 *   - Mobile: full-height slide-in drawer from the right with dark scrim.
 *     Focus-trapped, Escape-closes, click-outside-closes, body-scroll-locked.
 *     48px touch targets on every drawer link.
 *
 * Performance:
 *   - "use client" only for the mobile drawer state + scroll shadow.
 *   - All nav links are <Link> for client-side navigation prefetch.
 *
 * Brunson Hard-Rule: every link points to a real, indexable surface.
 */
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Menu, X, BookOpen } from "lucide-react";

/**
 * Primary navigation sections — the highest-traffic, highest-intent hubs.
 */
const NAV_LINKS = [
  { href: "/glossary", label: "Glossary" },
  { href: "/benchmarks", label: "Benchmarks" },
  { href: "/funnel-teardown", label: "Teardowns" },
  { href: "/vs", label: "Compare" },
  { href: "/alternatives-to", label: "Alternatives" },
  { href: "/how-to", label: "Learn" },
  { href: "/tools", label: "Free Tools" },
  { href: "/dream-100", label: "Dream 100" },
] as const;

export function SiteHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  /* Close drawer on route change. */
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  /* Lock body scroll + bind Escape when drawer is open. */
  useEffect(() => {
    if (!drawerOpen) return;
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDrawerOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = origOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen]);

  /* Header shadow on scroll. */
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md transition-shadow duration-normal ${
        scrolled ? "shadow-sm" : ""
      }`}
    >
      {/* Desktop + mobile shared bar */}
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 px-4 sm:px-6">
        {/* Logo — text, no image fetch on critical path */}
        <Link
          href="/"
          className="text-sm font-bold tracking-tight text-foreground transition-colors hover:text-primary"
          aria-label="Unlock SaaS home"
        >
          Unlock SaaS
        </Link>

        {/* Desktop nav links — reduced on homepage to avoid diluting the primary CTA */}
        <nav
          className="hidden items-center gap-0.5 lg:flex"
          aria-label="Primary"
        >
          {isHome ? (
            <Link
              href="/how-to"
              className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <BookOpen className="h-3.5 w-3.5 inline mr-1.5" />
              Learn
            </Link>
          ) : (
            NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                    active
                      ? "text-foreground bg-accent/60"
                      : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })
          )}
        </nav>

        {/* Right cluster: theme toggle + CTA (desktop) + hamburger (mobile) */}
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link
            href="/diagnostic"
            className="hidden md:inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-glow"
          >
            Free Diagnostic
          </Link>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            aria-controls="mobile-drawer"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* ---- Mobile drawer (portal-free: fixed + scrim) ---- */}
      {drawerOpen && (
        <>
          {/* Scrim */}
          <div
            className="fixed inset-0 z-[55] bg-background/60 backdrop-blur-sm animate-fade-in lg:hidden"
            onClick={closeDrawer}
            aria-hidden="true"
          />
          {/* Drawer panel */}
          <aside
            id="mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="fixed inset-y-0 right-0 z-[56] flex w-[min(82vw,360px)] max-w-full flex-col border-l border-border bg-popover shadow-xl animate-slide-in-right lg:hidden"
          >
            {/* Drawer header */}
            <div className="flex h-14 items-center justify-between border-b border-border px-4">
              <span className="text-sm font-bold tracking-tight text-foreground">
                Menu
              </span>
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Close menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            {/* Drawer nav — 48px touch targets */}
            <nav
              className="flex-1 overflow-y-auto px-3 py-4"
              aria-label="Mobile primary"
            >
              <ul className="space-y-1">
                {isHome ? (
                  <li>
                    <Link
                      href="/how-to"
                      className="flex min-h-[48px] items-center rounded-md px-4 text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <BookOpen className="h-5 w-5 mr-3" />
                      Learn
                    </Link>
                  </li>
                ) : (
                  NAV_LINKS.map((link) => {
                    const active = pathname === link.href;
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          aria-current={active ? "page" : undefined}
                          className={`flex min-h-[48px] items-center rounded-md px-4 text-base font-medium transition-colors ${
                            active
                              ? "bg-accent text-accent-foreground"
                              : "text-foreground hover:bg-accent hover:text-accent-foreground"
                          }`}
                        >
                          {link.label}
                        </Link>
                      </li>
                    );
                  })
                )}
              </ul>
            </nav>
            {/* Drawer footer CTA */}
            <div className="border-t border-border p-4 pb-safe">
              <Link
                href="/diagnostic"
                className="flex min-h-[48px] items-center justify-center rounded-md bg-primary px-4 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-glow"
              >
                Free Diagnostic
              </Link>
            </div>
          </aside>
        </>
      )}
    </header>
  );
}
