/**
 * Before / After — Brunson Building Block #22.
 *
 * The transformation made concrete. Workbook 04 §2 (offer/dream-outcome).
 * The "after" column intentionally names ONE specific event (a Stripe charge),
 * not vague aspirations ("more revenue", "growth"). Specificity is the entire
 * marketing for a skeptic.
 *
 * No fabricated screenshots. The dashboards described are Marco's OWN Stripe
 * dashboard — past state vs future state. The Machine is the road between them.
 *
 * Visual treatment: ClickFunnels 1.0 light theme — red-tinted "before" card
 * with X-mark bullets, green-tinted "after" card with checkmark bullets. The
 * contrast does the storytelling. Same palette as the homepage hero.
 */
import { TrendingDown, TrendingUp, X, Check } from "lucide-react";

const BEFORE_BULLETS = [
  "Product shipped. Users signed up. Praise in comments.",
  "Stripe MRR: a horizontal line you cannot explain.",
  'The story you tell yourself: "one more feature."',
  'The story underneath: "I haven’t talked to a customer."',
  "Hours spent on SEO, X threads, tactic-shopping.",
];

const AFTER_BULLETS = [
  "A named dream customer you can describe in one sentence.",
  "An offer with a guaranteed result. Defensible 10x math.",
  "20 logged outreach actions. Each one tracked, not imagined.",
  "Stripe webhook fires. The badge lights up. You exhale.",
  "The Machine: still running. The next 9 customers come faster.",
];

export function BeforeAfter() {
  return (
    <section className="bg-white py-16 sm:py-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10 sm:mb-12">
          <p className="text-[11px] sm:text-xs uppercase tracking-[0.25em] font-bold text-purple-700 mb-3">
            The Two Stripe Dashboards
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight">
            You only need{" "}
            <span className="bg-yellow-300 px-1.5 py-0.5 box-decoration-clone">
              one of these
            </span>{" "}
            to change.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* BEFORE — Red card with X-marks. The disease. */}
          <div className="rounded-xl border-2 border-red-200 bg-red-50/60 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-full bg-red-600 grid place-items-center text-white">
                <TrendingDown className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-red-700">
                Before
              </p>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-5 leading-tight">
              The flat line you refresh every morning.
            </h3>
            <ul className="space-y-3">
              {BEFORE_BULLETS.map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-[15px] text-gray-700 leading-relaxed">
                  <X className="h-5 w-5 text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* AFTER — Green card with checkmarks. The cure. */}
          <div className="rounded-xl border-2 border-green-500 bg-green-50/70 p-6 sm:p-8 shadow-lg shadow-green-500/20 relative">
            <div className="absolute -top-3 right-6 bg-orange-500 text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full shadow-md">
              Day 60 or sooner
            </div>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-full bg-green-600 grid place-items-center text-white">
                <TrendingUp className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-green-700">
                After
              </p>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-5 leading-tight">
              One verified Stripe charge, in your dashboard, from a real customer.
            </h3>
            <ul className="space-y-3">
              {AFTER_BULLETS.map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-[15px] text-gray-800 leading-relaxed">
                  <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-sm text-gray-600 italic text-center mt-8 max-w-2xl mx-auto leading-relaxed">
          If the &ldquo;after&rdquo; dashboard does not exist in 60 days and you completed the
          in-product milestones,{" "}
          <span className="font-bold text-gray-900">the two monthly payments come back.</span>
        </p>
      </div>
    </section>
  );
}
