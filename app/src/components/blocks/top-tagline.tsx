/**
 * Top tagline bar – Brunson "one line at the top" rule.
 *
 * Single emotional hook + scarcity signal that sits ABOVE the hero. The
 * tagline names the result and the founding-rate window in one line so
 * the visitor sees the headline, the urgency, and the price ceiling
 * before they touch the hero.
 *
 * Visual treatment: thin band, primary-tinted background at low opacity,
 * shadcn tokens only. No yellow attention bar.
 */
import Link from "next/link";

export function TopTagline() {
  return (
    <Link
      href="/diagnostic"
      aria-label="Get your free 2-minute diagnostic"
      className="block w-full bg-primary/10 border-b border-border text-foreground hover:bg-primary/15 transition-colors"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5 text-center text-xs sm:text-sm leading-snug">
        <span className="font-semibold">
          Your first paying customer in 60 days – or refunded automatically.
        </span>{" "}
        <span className="text-muted-foreground">
          Founding rate ($49/mo for life) closes at 100 builders.
        </span>{" "}
        <span className="underline underline-offset-4 font-medium whitespace-nowrap">
          Get the free diagnosis →
        </span>
      </div>
    </Link>
  );
}
