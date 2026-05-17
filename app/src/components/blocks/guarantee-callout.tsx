import Link from "next/link";

/**
 * GuaranteeCallout — Brunson 23 Building Blocks #9 (Risk Reversal / Guarantee).
 *
 * The Funnel Hub had the guarantee implicit in the headline and the value
 * ladder, never standalone. Brunson's rule (DCS Section 4): every funnel
 * page needs the guarantee as its own block — visually distinct, written
 * once, anchored above the demand surfaces (the value ladder + pricing
 * breakdown) so the buyer reads the risk reversal BEFORE they see the price.
 *
 * Source:
 * - Workbook 01 §2 (offer + 60-day guarantee + remedy + work-condition)
 * - Workbook 07 §3 Closes Category 1 (Risk Reversal)
 *
 * Honest-math discipline (workbook 01 §2 "values_caveat"): the remedy is
 * the literal $98 cap (two monthly payments). No inflated "valued at" line.
 * The Stripe-verification line is the mechanism, not a marketing claim —
 * it is what `lib/guarantee.ts` and the Stripe webhook actually enforce.
 *
 * Pure server component. Zero kB to client.
 */
export function GuaranteeCallout() {
  return (
    <section
      aria-labelledby="guarantee-callout-heading"
      className="py-10 sm:py-14 px-4 sm:px-6"
    >
      <div className="max-w-3xl mx-auto">
        <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 px-5 py-6 sm:px-8 sm:py-8 shadow-sm">
          <div className="flex items-start gap-4 sm:gap-5">
            {/* Badge — pure CSS, no image asset to chase down */}
            <div
              aria-hidden="true"
              className="flex-shrink-0 hidden sm:flex items-center justify-center w-16 h-16 rounded-full bg-emerald-600 text-white font-black text-sm leading-tight text-center"
            >
              60-DAY
              <br />
              GUAR.
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[11px] uppercase tracking-widest font-bold text-emerald-800 mb-2">
                Risk reversal
              </p>
              <h2
                id="guarantee-callout-heading"
                className="text-xl sm:text-2xl font-bold text-emerald-950 leading-snug mb-3"
              >
                Your first paying customer in 60 days — Stripe-verified — or
                you do not pay.
              </h2>
              <p className="text-sm text-emerald-900/90 leading-relaxed mb-3">
                Run The Machine. Complete the in-product milestones. If 60 days
                pass and your Stripe shows no new paying customer, the two
                monthly payments — $98 total — come back automatically. The
                refund is enforced by code, not by promise.
              </p>
              <p className="text-xs text-emerald-900/70 italic">
                Cap on your downside: $98. The mechanism is documented in the{" "}
                <Link
                  href="/machine-sales#guarantee"
                  className="underline underline-offset-2 hover:text-emerald-900"
                >
                  Machine sales page
                </Link>
                ; the code that enforces it lives in <code className="not-italic font-mono">lib/guarantee.ts</code>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
