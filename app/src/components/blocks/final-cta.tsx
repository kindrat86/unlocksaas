/**
 * Final CTA — Brunson "the close before the close" rule (Building Block #21).
 *
 * After the Stack, the Guarantee, and the testimonials, the visitor either
 * acts or leaves. The Brunson rule: do not let the page end on prose. The
 * last block before the footer must be a CTA the visitor cannot scroll past
 * without seeing the offer one more time.
 *
 * Architecture (mirrors the hero CTA, intentionally — repetition is the
 * point):
 *   - Primary: free diagnostic (Reluctant Hero opt-in, $0)
 *   - Secondary: Start the Machine for $1 (the Starter rung)
 *   - Tertiary: full Machine $49/mo (the buyer who is already ready)
 *
 * The three-rung repetition matches the hero — a returning eye does not have
 * to remember which CTA was which. The page closes the loop.
 */
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function FinalCta() {
  return (
    <section className="bg-gradient-to-b from-purple-50 via-purple-50/40 to-white py-16 sm:py-20 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-[11px] sm:text-xs uppercase tracking-[0.25em] font-bold text-purple-700 mb-4">
          One more time — the three ways in
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 leading-[1.05] tracking-tight mb-5">
          You read the whole page.{" "}
          <span className="bg-yellow-300 px-1.5 py-0.5 box-decoration-clone">
            That means something.
          </span>
        </h2>
        <p className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed mb-10">
          Pick the door that matches where you are right now. The diagnostic is free, the Starter is $1, the Machine is $49/mo with a 60-day refund enforced by code. Three doors. Same destination.
        </p>

        <div
          className="text-3xl text-orange-500 mb-3 animate-bounce select-none"
          aria-hidden="true"
        >
          ↓
        </div>

        <div className="flex flex-col items-center gap-3 mb-8">
          <Button
            asChild
            className="h-auto rounded-md bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/30 px-6 sm:px-8 py-4 sm:py-5 text-base sm:text-xl font-extrabold uppercase tracking-wide w-full sm:w-auto sm:min-w-[420px] max-w-full border-b-4 border-orange-700 hover:border-orange-800 transition-colors leading-tight whitespace-normal"
          >
            <Link href="/diagnostic" className="inline-flex items-center justify-center gap-2">
              Yes! Get My Free Diagnosis
              <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
            </Link>
          </Button>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">
            Free · 2 minutes · No card required
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-xl mx-auto">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="bg-white border-2 border-purple-700 text-purple-700 hover:bg-purple-50 hover:text-purple-900 font-bold"
          >
            <Link href="/starter">Start the Machine for $1</Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="lg"
            className="text-purple-700 hover:bg-purple-50 hover:text-purple-900 font-semibold"
          >
            <Link href="/machine-sales">The Full Machine — $49/mo</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
