"use client";

/**
 * Sticky Playbook CTA – Brunson "always-visible offer" rule scoped to the
 * /playbook-sales long-form page.
 *
 * The hero CheckoutButton lives in the final-CTA block at the very bottom
 * of ~1100 lines of long-form. A visitor reading the Three Secrets, the
 * Stack, the Guarantee, the FoundingBuilder, and the Cost-of-Waiting
 * blocks has no one-tap path to the $49 checkout until they reach the
 * footer. This strip keeps the offer reachable from any scroll position.
 *
 * Differs from the homepage StickyCta (components/blocks/sticky-cta.tsx),
 * which pushes the newsletter opt-in because that is the homepage's
 * primary conversion target. On this page, the primary target is the
 * $49 Playbook checkout, so the bar fires the real Stripe redirect.
 *
 * Mounts after the visitor scrolls past the hero (~600px) and hides near
 * the footer so it does not double-stack with the page's bottom Final
 * CTA. Honest framing only – no countdown timer, no "X seats left"
 * counter. Per locked strategy (workbook 01 §2 honest-value rule and
 * workbook 07 §3 Category-4 rejection for the Marco avatar): manufactured
 * scarcity destroys trust faster than it sells.
 *
 * Visual treatment: restrained shadcn tokens, same aesthetic family as
 * StickyCta and FoundingBuilder.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckoutButton } from "@/components/checkout-button";

const HERO_SCROLL_THRESHOLD_PX = 600;
const FOOTER_BUFFER_PX = 400;

export function StickyPlaybookCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      const scrolled = window.scrollY;
      const nearBottom =
        window.innerHeight + scrolled >=
        document.documentElement.scrollHeight - FOOTER_BUFFER_PX;
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
      aria-label="Persistent Playbook offer"
      className="fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-md border-t border-border px-3 sm:px-4 py-3"
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        <div className="hidden sm:block flex-1 min-w-0">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Founding-Builder price
          </p>
          <p className="text-sm font-medium leading-tight truncate">
            $49/mo. 60-day guarantee. $98 capped. Refunded by code if your
            Stripe stays flat.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-1 sm:flex-initial">
          <CheckoutButton
            priceType="playbook"
            surface="playbook_sales"
            size="default"
            className="flex-1 sm:flex-initial whitespace-nowrap"
          >
            Start the Playbook
          </CheckoutButton>
          <Link
            href="/starter"
            className="hidden md:inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground underline underline-offset-4 whitespace-nowrap transition-colors"
          >
            or start at $1
          </Link>
        </div>
      </div>
    </div>
  );
}
