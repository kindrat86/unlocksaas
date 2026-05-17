/**
 * Handwritten founder signature footer — Funnel Hacker's Cookbook Swipe 4.
 *
 * The cookbook prescribes this exact treatment: replace the corporate ©
 * line with a real signature paragraph in Maryan's voice. Source: Pieter
 * Levels' Nomads.com signature footer ("Thanks for signing up! I put a lot
 * of effort..."). One reader, one writer, one signature.
 *
 * Composition (Brunson Hard-Rule Reluctant Hero):
 *   - Two short paragraphs in first-person, signed "— Maryan"
 *   - Trust columns (E-E-A-T) preserved as a quiet row underneath
 *   - © line stays at the bottom as the last legal-required word, small
 *
 * The signature is the LAST thing the visitor sees that is not a checkout
 * page. Treat it as such.
 */
import Link from "next/link";

export function SignatureFooter() {
  return (
    <footer className="bg-white border-t-2 border-purple-100 py-12 sm:py-16 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-50/60 border-l-4 border-orange-500 rounded-r-xl p-5 sm:p-6 mb-8">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] font-bold text-purple-700 mb-3">
            A note from Maryan
          </p>
          <div className="space-y-4 text-[15px] sm:text-base text-gray-800 leading-relaxed">
            <p>
              I&apos;m Maryan. I built this because I was Marco — a non-engineer who shipped
              products nobody paid for, and refused to look at the flat Stripe line for almost
              a year.
            </p>
            <p>
              The Machine is what I wish someone had handed me back then. If you take it for a
              spin, reply to any email and you&apos;ll get me, not a support queue.
            </p>
            <p
              className="text-right text-lg sm:text-xl font-bold italic text-purple-700"
              style={{ fontFamily: '"Segoe Script", "Bradley Hand", cursive' }}
            >
              — Maryan
            </p>
          </div>
        </div>

        {/* E-E-A-T trust columns — kept quiet but present. */}
        <div className="text-center text-xs text-gray-500">
          <p className="mb-3 flex flex-wrap justify-center gap-x-4 gap-y-1 font-medium">
            <Link
              href="/about"
              className="underline underline-offset-4 hover:text-purple-700 transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="underline underline-offset-4 hover:text-purple-700 transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/builders"
              className="underline underline-offset-4 hover:text-purple-700 transition-colors"
            >
              Verified Builder directory
            </Link>
            <Link
              href="/bridge"
              className="underline underline-offset-4 hover:text-purple-700 transition-colors"
            >
              Came from a cold ad?
            </Link>
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-purple-700 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-purple-700 transition-colors"
            >
              Terms
            </Link>
          </p>
          <p className="text-gray-400">
            &copy; 2026 Unlock SaaS. Built by a non-engineer who shipped anyway.
          </p>
        </div>
      </div>
    </footer>
  );
}
