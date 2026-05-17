/**
 * Founder signature footer — Funnel Hacker's Cookbook Swipe 4.
 *
 * The cookbook prescribes a real signature paragraph in Maryan's voice as the
 * last thing the visitor sees that is not a checkout page. Source: Pieter
 * Levels' Nomads.com signature footer.
 *
 * Composition (Brunson Hard-Rule Reluctant Hero):
 *   - Two short paragraphs in first-person, signed "— Maryan"
 *   - Trust columns (E-E-A-T) preserved as a quiet row underneath
 *   - © line stays at the bottom as the last legal-required word, small
 *
 * Visual treatment: shadcn tokens only, no script fonts, no special framing.
 * Matches the rest-of-app aesthetic.
 */
import Link from "next/link";

export function SignatureFooter() {
  return (
    <footer className="py-12 sm:py-16 px-4 sm:px-6 border-t border-border">
      <div className="max-w-2xl mx-auto">
        <div className="space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed mb-10">
          <p>
            I&apos;m Maryan. I built this because I was Marco — a non-engineer
            who shipped products nobody paid for, and refused to look at the
            flat Stripe line for almost a year.
          </p>
          <p>
            The Playbook is what I wish someone had handed me back then. If you
            take it for a spin, reply to any email and you&apos;ll get me, not
            a support queue.
          </p>
          <p className="text-foreground">— Maryan</p>
        </div>

        {/* E-E-A-T trust columns — kept quiet but present. */}
        <div className="text-center text-xs text-muted-foreground">
          <p className="mb-3 flex flex-wrap justify-center gap-x-4 gap-y-1">
            <Link
              href="/about"
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/press"
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              Press
            </Link>
            <Link
              href="/builders"
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              Verified Builder directory
            </Link>
            <Link
              href="/bridge"
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              Came from a cold ad?
            </Link>
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              Terms
            </Link>
          </p>
          <p>
            &copy; 2026 Unlock SaaS. Built by a non-engineer who shipped
            anyway.
          </p>
        </div>
      </div>
    </footer>
  );
}
