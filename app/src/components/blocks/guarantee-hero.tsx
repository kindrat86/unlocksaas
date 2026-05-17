/**
 * Guarantee Hero — Brunson polarity move (Funnel Hacker's Cookbook §4).
 *
 * The cookbook line is explicit: "The 60-day Stripe-verified guarantee is our
 * polarity move — no competitor in this hack list offers it. It is the single
 * highest-leverage source of differentiation we have, and it deserves the
 * visual real estate that ShipFast gives to 'spots left' and Nomads.com gives
 * to its media bar."
 *
 * Before this block, the guarantee was buried as an italic footnote under the
 * Before/After. The Brunson rule: polarity moves get a dedicated section with
 * Stack-slide-grade visual weight. This block is that section.
 *
 * Composition:
 *   - Big seal/shield icon (the "stamp" gestalt)
 *   - Headline naming the guarantee with dollar specificity
 *   - Four numbered bullets explaining what fires the refund
 *   - Inline reassurance: this is code, not an inbox
 *
 * Identity guardrail (Reluctant Hero, workbook 01 §6): no exclamation points,
 * no "GUARANTEED!", no shield emojis. The shield IS the icon; the language
 * stays sober.
 */
import { ShieldCheck, Zap, FileCheck, Wallet, RefreshCw } from "lucide-react";

const REFUND_CONDITIONS = [
  {
    icon: FileCheck,
    title: "You complete Steps 1–5 inside the Machine",
    body: "Dream customer, offer, proof, story, outreach — not theoretical. The engine timestamps each one as you finish.",
  },
  {
    icon: Zap,
    title: "You log 20 outreach actions inside the tool",
    body: "Not screenshots, not promises. The tool counts the sends and the tracked replies. 20 is the floor.",
  },
  {
    icon: Wallet,
    title: "Stripe still shows zero paying customers at Day 60",
    body: "The webhook reads your own connected Stripe account. There is no honor system. There is no support ticket.",
  },
  {
    icon: RefreshCw,
    title: "Both monthly payments come back to the card you paid with",
    body: "$98 refunded automatically. The code fires the refund. You don't ask for it. You don't justify it.",
  },
];

export function GuaranteeHero() {
  return (
    <section className="bg-gradient-to-br from-purple-700 via-purple-800 to-purple-900 py-16 sm:py-20 px-4 sm:px-6 text-white relative overflow-hidden">
      {/* Decorative ring — purely visual, hidden from screen readers */}
      <div
        className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-yellow-300/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-4xl mx-auto relative">
        {/* The Seal — yellow ring around shield icon, classic CF guarantee badge */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-yellow-300 grid place-items-center shadow-2xl shadow-yellow-300/30">
              <ShieldCheck
                className="h-14 w-14 sm:h-16 sm:w-16 text-purple-900"
                strokeWidth={2.5}
                aria-hidden="true"
              />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap shadow-lg">
              60-Day Lock
            </div>
          </div>
        </div>

        <div className="text-center mb-10 sm:mb-12">
          <p className="text-[11px] sm:text-xs uppercase tracking-[0.3em] font-bold text-yellow-300 mb-3">
            The Polarity Move
          </p>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black leading-[1.05] tracking-tight">
            The 60-Day{" "}
            <span className="bg-yellow-300 text-purple-900 px-2 py-0.5 box-decoration-clone">
              Stripe-Verified
            </span>{" "}
            Guarantee.
          </h2>
          <p className="text-lg sm:text-xl text-purple-100 mt-6 max-w-2xl mx-auto leading-relaxed">
            No course on this planet refunds you when their system fails to produce a customer.{" "}
            <span className="font-bold text-white">We do — and the refund is enforced by code, not by an inbox.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {REFUND_CONDITIONS.map((c, i) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
                className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-5 sm:p-6 hover:bg-white/15 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 h-11 w-11 rounded-full bg-yellow-300 grid place-items-center text-purple-900 shadow-md">
                    <Icon className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-yellow-300 mb-1">
                      Condition #{i + 1}
                    </p>
                    <h3 className="text-base sm:text-lg font-extrabold leading-tight mb-2">
                      {c.title}
                    </h3>
                    <p className="text-sm text-purple-100 leading-relaxed">
                      {c.body}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-sm sm:text-base text-purple-100 italic mt-10 max-w-2xl mx-auto leading-relaxed">
          Pre-revenue is the exact case the guarantee was written for.{" "}
          <span className="font-bold text-white not-italic">$98 capped exposure. Two coffees a week. Refunded by webhook if the line stays flat.</span>
        </p>
      </div>
    </section>
  );
}
