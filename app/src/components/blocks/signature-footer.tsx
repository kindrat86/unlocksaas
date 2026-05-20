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
            {/*
              Marco's Diary — the faceless YouTube channel (channel #5,
              additive to the locked launch-minimum-four). Grouped with the
              other founder-authored content surfaces (Press = mentions of
              him; this = his own series) rather than the legal column.
              See strategy/youtube-faceless-channel.md.
            */}
            <Link
              href="/youtube"
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              Marco&apos;s Diary on YouTube
            </Link>
            <Link
              href="/faq"
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              FAQ
            </Link>
            <Link
              href="/glossary"
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              Glossary
            </Link>
            <Link
              href="/editorial-policy"
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              Editorial Policy
            </Link>
            {/*
              Quiet polarity link. Put after Press (canonical trust columns)
              and before Verified Builder (positive-space proof) so the
              negative-space "who we aren't for" sits structurally between
              "who vouches for us" and "who's already crossed the cycle".
              Surprising-but-not-shouted — the page itself is the artifact,
              the footer link is just discovery.
            */}
            <Link
              href="/dont-buy-unlock-saas"
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              Don&apos;t buy this
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
