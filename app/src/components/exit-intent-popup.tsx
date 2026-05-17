"use client";

/**
 * Exit-intent popup – Brunson Traffic Secrets §6 (Follow-Up Funnels) +
 * DotCom Secrets Secret 14 (Reverse Squeeze). Catches the visitor before
 * they leave with a last-chance offer: the free diagnostic (primary) and
 * the newsletter (secondary).
 *
 * Trigger rules:
 *   - Desktop: mouseleave fired from the top of the viewport with the
 *     cursor moving upward (classic exit-intent signal toward browser tabs).
 *   - Mobile: scroll-up burst after a downward scroll past 50% of the page
 *     (proxy for "I'm about to leave"). Mobile browsers do not fire
 *     mouseleave reliably.
 *   - Fires AT MOST once per session (sessionStorage guard).
 *   - Suppressed on /diagnostic itself – the visitor is already there.
 *
 * Visual treatment: shadcn Dialog, restrained Reluctant Hero look. Same
 * background/border tokens as the rest of the app. No yellow attention bar.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { track } from "@/lib/analytics/client";
import { Event } from "@/lib/analytics/events";

const SESSION_KEY = "unlocksaas:exit-intent-shown";
const MOBILE_SCROLL_TRIGGER_RATIO = 0.5;

export function ExitIntentPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const suppressed =
    pathname?.startsWith("/diagnostic") || pathname?.startsWith("/auth");

  useEffect(() => {
    if (suppressed) return;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY)) return;

    let lastScrollY = window.scrollY;
    let armed = false;

    function show() {
      if (sessionStorage.getItem(SESSION_KEY)) return;
      sessionStorage.setItem(SESSION_KEY, "1");
      setOpen(true);
      track(Event.FunnelHubCtaClicked, { surface: "exit_intent:opened" });
    }

    function onMouseLeave(e: MouseEvent) {
      if (e.clientY <= 5) show();
    }

    function onScroll() {
      const y = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrolledRatio = docHeight > 0 ? y / docHeight : 0;
      if (!armed && scrolledRatio > MOBILE_SCROLL_TRIGGER_RATIO) {
        armed = true;
      }
      if (armed && y < lastScrollY - 60) {
        show();
      }
      lastScrollY = y;
    }

    document.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("scroll", onScroll);
    };
  }, [suppressed]);

  if (!open || suppressed) return null;

  function close() {
    setOpen(false);
    track(Event.FunnelHubCtaClicked, { surface: "exit_intent:closed" });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-intent-title"
      className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-sm px-4"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl">
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-3 top-3 h-8 w-8 rounded-full grid place-items-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <span aria-hidden="true" className="text-lg leading-none">
            ×
          </span>
        </button>

        <div className="px-6 pt-8 pb-6 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Wait – before you go
          </p>
          <h2
            id="exit-intent-title"
            className="text-xl sm:text-2xl font-bold leading-tight mb-3 text-balance"
          >
            Find out why your product is flat – in 90 seconds.
          </h2>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Paste your live URL. I tell you whether it is{" "}
            <strong className="text-foreground font-semibold">
              Wrong Person, Weak Offer, or Weak Belief
            </strong>{" "}
            – and the one move that fixes it. Free. No card. No login.
          </p>

          <Button asChild size="lg" className="w-full mb-3" onClick={close}>
            <Link href="/diagnostic">Get my free diagnosis →</Link>
          </Button>

          <p className="text-xs text-muted-foreground mb-4 italic">
            Founding-rate window closes at 100 subscribers. Then $49 → $79.
          </p>

          <div className="border-t border-border pt-4 mt-2">
            <p className="text-xs text-muted-foreground mb-3">
              Or, just want updates?
            </p>
            <NewsletterSignup
              variant="stacked"
              source="exit_intent"
              ctaLabel="Subscribe to the newsletter"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
